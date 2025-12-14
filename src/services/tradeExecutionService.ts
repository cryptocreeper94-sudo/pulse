import { autoTradeService, AutoTradeConfigData, CreateAutoTradeInput } from './autoTradeService';
import { predictionLearningService } from './predictionLearningService.js';
import { db } from '../db/client';
import { autoTrades, autoTradeConfig } from '../db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import pino from 'pino';
import axios from 'axios';

const logger = pino({ name: 'TradeExecutionService' });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;

export interface SignalEvaluation {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName?: string;
  chain: string;
  currentPrice: number;
  signal: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
  signalConfidence: number;
  modelAccuracy?: number;
  horizon: '1h' | '4h' | '24h' | '7d';
  predictionId?: string;
  indicators?: Record<string, any>;
}

export interface TradeDecision {
  shouldTrade: boolean;
  action: 'execute' | 'recommend' | 'skip' | 'await_approval';
  reason: string;
  tradeId?: string;
  blockedBy?: string[];
}

export interface PositionCheckResult {
  canTrade: boolean;
  blockers: string[];
  currentOpenPositions: number;
  dailySpent: number;
  maxPerTrade: number;
  maxPerDay: number;
  maxOpenPositions: number;
}

async function sendTelegramMessage(chatId: string | number, text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    logger.warn('[TradeExecution] No Telegram bot token configured');
    return false;
  }

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    return true;
  } catch (error: any) {
    logger.error({ error: error.message }, '[TradeExecution] Failed to send Telegram message');
    return false;
  }
}

class TradeExecutionService {
  async evaluateSignal(
    userId: string,
    signal: SignalEvaluation
  ): Promise<TradeDecision> {
    logger.info({ userId, signal: signal.signal, symbol: signal.tokenSymbol }, '[TradeExecution] Evaluating signal');

    const config = await autoTradeService.getConfig(userId);

    if (!config.enabled) {
      return { shouldTrade: false, action: 'skip', reason: 'Auto-trading is disabled' };
    }

    if (config.isPaused) {
      return { shouldTrade: false, action: 'skip', reason: `Trading paused: ${config.pauseReason}` };
    }

    const allowedSignals = JSON.parse(config.allowedSignals) as string[];
    if (!allowedSignals.includes(signal.signal)) {
      return { 
        shouldTrade: false, 
        action: 'skip', 
        reason: `Signal ${signal.signal} not in allowed list: ${allowedSignals.join(', ')}` 
      };
    }

    const allowedHorizons = JSON.parse(config.allowedHorizons) as string[];
    if (!allowedHorizons.includes(signal.horizon)) {
      return { 
        shouldTrade: false, 
        action: 'skip', 
        reason: `Horizon ${signal.horizon} not in allowed list: ${allowedHorizons.join(', ')}` 
      };
    }

    const confidenceThreshold = parseFloat(config.confidenceThreshold) / 100;
    if (signal.signalConfidence < confidenceThreshold) {
      return { 
        shouldTrade: false, 
        action: 'skip', 
        reason: `Confidence ${(signal.signalConfidence * 100).toFixed(1)}% below threshold ${(confidenceThreshold * 100).toFixed(1)}%`,
        blockedBy: ['confidence']
      };
    }

    if (signal.modelAccuracy !== undefined) {
      const accuracyThreshold = parseFloat(config.accuracyThreshold) / 100;
      if (signal.modelAccuracy < accuracyThreshold) {
        return { 
          shouldTrade: false, 
          action: 'skip', 
          reason: `Model accuracy ${(signal.modelAccuracy * 100).toFixed(1)}% below threshold ${(accuracyThreshold * 100).toFixed(1)}%`,
          blockedBy: ['accuracy']
        };
      }
    }

    const positionCheck = await this.checkPositionLimits(userId, config);
    if (!positionCheck.canTrade) {
      return { 
        shouldTrade: false, 
        action: 'skip', 
        reason: positionCheck.blockers.join('; '),
        blockedBy: positionCheck.blockers
      };
    }

    const isBuySignal = signal.signal.includes('BUY');
    
    let tradeAmount: number;
    if (isBuySignal) {
      tradeAmount = Math.min(
        parseFloat(config.maxPerTrade),
        parseFloat(config.maxPerDay) - positionCheck.dailySpent
      );

      if (tradeAmount <= 0) {
        return { 
          shouldTrade: false, 
          action: 'skip', 
          reason: 'Daily spending limit reached for buys',
          blockedBy: ['daily_limit']
        };
      }
    } else {
      tradeAmount = parseFloat(config.maxPerTrade);
    }

    if (signal.signal === 'HOLD') {
      return { 
        shouldTrade: false, 
        action: 'skip', 
        reason: 'Signal is HOLD - no action needed' 
      };
    }

    const tradeType: 'BUY' | 'SELL' = signal.signal.includes('BUY') ? 'BUY' : 'SELL';

    switch (config.mode) {
      case 'observer':
        await this.logObservation(userId, signal, config, tradeAmount);
        return { 
          shouldTrade: false, 
          action: 'recommend', 
          reason: 'Observer mode: Logged recommendation only' 
        };

      case 'approval':
        const pendingTrade = await this.createPendingTrade(userId, signal, config, tradeAmount, tradeType);
        await this.sendApprovalNotification(userId, config, signal, pendingTrade.id, tradeAmount);
        return { 
          shouldTrade: true, 
          action: 'await_approval', 
          reason: 'Awaiting user approval',
          tradeId: pendingTrade.id
        };

      case 'semi-auto':
        const semiAutoAmount = Math.min(tradeAmount, 10);
        const semiTrade = await this.createAndExecuteTrade(userId, signal, config, semiAutoAmount, tradeType);
        await this.sendTradeNotification(userId, config, signal, semiTrade.id, semiAutoAmount, 'executed');
        return { 
          shouldTrade: true, 
          action: 'execute', 
          reason: `Semi-auto: Executed $${semiAutoAmount.toFixed(2)} trade`,
          tradeId: semiTrade.id
        };

      case 'full-auto':
        const fullTrade = await this.createAndExecuteTrade(userId, signal, config, tradeAmount, tradeType);
        await this.sendTradeNotification(userId, config, signal, fullTrade.id, tradeAmount, 'executed');
        return { 
          shouldTrade: true, 
          action: 'execute', 
          reason: `Full-auto: Executed $${tradeAmount.toFixed(2)} trade`,
          tradeId: fullTrade.id
        };

      default:
        return { shouldTrade: false, action: 'skip', reason: `Unknown mode: ${config.mode}` };
    }
  }

  async checkPositionLimits(userId: string, config: AutoTradeConfigData): Promise<PositionCheckResult> {
    const blockers: string[] = [];

    const openPositions = await db.select({ count: sql<number>`count(*)` })
      .from(autoTrades)
      .where(and(
        eq(autoTrades.userId, userId),
        eq(autoTrades.status, 'executed')
      ));

    const openCount = Number(openPositions[0]?.count || 0);

    if (openCount >= config.maxOpenPositions) {
      blockers.push(`Max open positions reached (${openCount}/${config.maxOpenPositions})`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyTrades = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount_usd AS DECIMAL)), 0)` })
      .from(autoTrades)
      .where(and(
        eq(autoTrades.userId, userId),
        gte(autoTrades.createdAt, today)
      ));

    const dailySpent = Number(dailyTrades[0]?.total || 0);
    const maxPerDay = parseFloat(config.maxPerDay);

    if (dailySpent >= maxPerDay) {
      blockers.push(`Daily limit reached ($${dailySpent.toFixed(2)}/$${maxPerDay.toFixed(2)})`);
    }

    return {
      canTrade: blockers.length === 0,
      blockers,
      currentOpenPositions: openCount,
      dailySpent,
      maxPerTrade: parseFloat(config.maxPerTrade),
      maxPerDay,
      maxOpenPositions: config.maxOpenPositions,
    };
  }

  private async logObservation(
    userId: string,
    signal: SignalEvaluation,
    config: AutoTradeConfigData,
    suggestedAmount: number
  ): Promise<void> {
    logger.info({
      userId,
      symbol: signal.tokenSymbol,
      signal: signal.signal,
      confidence: signal.signalConfidence,
      suggestedAmount,
      mode: 'observer'
    }, '[TradeExecution] Logged observation');

    if (config.notifyOnRecommendation) {
      await this.sendRecommendationNotification(userId, config, signal, suggestedAmount);
    }
  }

  private async createPendingTrade(
    userId: string,
    signal: SignalEvaluation,
    config: AutoTradeConfigData,
    amount: number,
    tradeType: 'BUY' | 'SELL'
  ) {
    const input: CreateAutoTradeInput = {
      userId,
      tokenAddress: signal.tokenAddress,
      tokenSymbol: signal.tokenSymbol,
      tokenName: signal.tokenName,
      chain: signal.chain,
      signalType: signal.signal,
      signalConfidence: signal.signalConfidence.toFixed(4),
      modelAccuracy: signal.modelAccuracy?.toFixed(4),
      horizon: signal.horizon,
      predictionId: signal.predictionId,
      tradeType,
      amountUSD: amount.toFixed(2),
      entryPrice: signal.currentPrice.toFixed(8),
      requiresApproval: true,
    };

    return autoTradeService.createTrade(input);
  }

  private async createAndExecuteTrade(
    userId: string,
    signal: SignalEvaluation,
    config: AutoTradeConfigData,
    amount: number,
    tradeType: 'BUY' | 'SELL'
  ) {
    const input: CreateAutoTradeInput = {
      userId,
      tokenAddress: signal.tokenAddress,
      tokenSymbol: signal.tokenSymbol,
      tokenName: signal.tokenName,
      chain: signal.chain,
      signalType: signal.signal,
      signalConfidence: signal.signalConfidence.toFixed(4),
      modelAccuracy: signal.modelAccuracy?.toFixed(4),
      horizon: signal.horizon,
      predictionId: signal.predictionId,
      tradeType,
      amountUSD: amount.toFixed(2),
      entryPrice: signal.currentPrice.toFixed(8),
      requiresApproval: false,
    };

    const trade = await autoTradeService.createTrade(input);

    await autoTradeService.updateTradeStatus(trade.id, 'executed', {
      executedAt: new Date(),
    });

    logger.info({ tradeId: trade.id, amount, symbol: signal.tokenSymbol }, '[TradeExecution] Trade executed');

    return trade;
  }

  private async sendRecommendationNotification(
    userId: string,
    config: AutoTradeConfigData,
    signal: SignalEvaluation,
    amount: number
  ): Promise<void> {
    if (config.notifyChannel !== 'telegram' && config.notifyChannel !== 'both') {
      return;
    }

    const chatId = ADMIN_TELEGRAM_ID;
    if (!chatId) {
      logger.warn('[TradeExecution] No Telegram chat ID for notifications');
      return;
    }

    const signalEmoji = signal.signal.includes('BUY') ? '🟢' : signal.signal.includes('SELL') ? '🔴' : '⚪';
    const confidenceEmoji = signal.signalConfidence >= 0.8 ? '🔥' : signal.signalConfidence >= 0.7 ? '✨' : '📊';

    const message = `
${signalEmoji} <b>AI TRADING SIGNAL</b> ${confidenceEmoji}

📍 <b>Token:</b> ${signal.tokenSymbol}
⛓️ <b>Chain:</b> ${signal.chain}
💰 <b>Price:</b> $${formatNumber(signal.currentPrice)}

📊 <b>Signal:</b> ${signal.signal}
🎯 <b>Confidence:</b> ${(signal.signalConfidence * 100).toFixed(1)}%
${signal.modelAccuracy ? `🧠 <b>Model Accuracy:</b> ${(signal.modelAccuracy * 100).toFixed(1)}%` : ''}
⏱️ <b>Horizon:</b> ${signal.horizon}

💵 <b>Suggested Amount:</b> $${amount.toFixed(2)}

<i>Mode: Observer (recommendation only)</i>
`.trim();

    await sendTelegramMessage(chatId, message);
  }

  private async sendApprovalNotification(
    userId: string,
    config: AutoTradeConfigData,
    signal: SignalEvaluation,
    tradeId: string,
    amount: number
  ): Promise<void> {
    if (config.notifyChannel !== 'telegram' && config.notifyChannel !== 'both') {
      return;
    }

    const chatId = ADMIN_TELEGRAM_ID;
    if (!chatId) return;

    const signalEmoji = signal.signal.includes('BUY') ? '🟢' : '🔴';

    const message = `
${signalEmoji} <b>TRADE APPROVAL NEEDED</b> ⏳

📍 <b>Token:</b> ${signal.tokenSymbol}
⛓️ <b>Chain:</b> ${signal.chain}
💰 <b>Price:</b> $${formatNumber(signal.currentPrice)}

📊 <b>Signal:</b> ${signal.signal}
🎯 <b>Confidence:</b> ${(signal.signalConfidence * 100).toFixed(1)}%
⏱️ <b>Horizon:</b> ${signal.horizon}

💵 <b>Amount:</b> $${amount.toFixed(2)}

<code>Trade ID: ${tradeId.slice(0, 8)}...</code>

<i>Reply "approve ${tradeId.slice(0, 8)}" or "reject ${tradeId.slice(0, 8)}"</i>
`.trim();

    await sendTelegramMessage(chatId, message);
  }

  private async sendTradeNotification(
    userId: string,
    config: AutoTradeConfigData,
    signal: SignalEvaluation,
    tradeId: string,
    amount: number,
    status: 'executed' | 'failed'
  ): Promise<void> {
    if (!config.notifyOnTrade) return;
    if (config.notifyChannel !== 'telegram' && config.notifyChannel !== 'both') return;

    const chatId = ADMIN_TELEGRAM_ID;
    if (!chatId) return;

    const tradeType = signal.signal.includes('BUY') ? 'BUY' : 'SELL';
    const statusEmoji = status === 'executed' ? '✅' : '❌';
    const actionEmoji = tradeType === 'BUY' ? '🟢' : '🔴';

    const message = `
${statusEmoji} <b>TRADE ${status.toUpperCase()}</b> ${actionEmoji}

📍 <b>Token:</b> ${signal.tokenSymbol}
⛓️ <b>Chain:</b> ${signal.chain}
📈 <b>Action:</b> ${tradeType}
💰 <b>Price:</b> $${formatNumber(signal.currentPrice)}
💵 <b>Amount:</b> $${amount.toFixed(2)}

📊 <b>Signal:</b> ${signal.signal}
🎯 <b>Confidence:</b> ${(signal.signalConfidence * 100).toFixed(1)}%

<code>ID: ${tradeId.slice(0, 8)}...</code>

<i>Mode: ${config.mode}</i>
`.trim();

    await sendTelegramMessage(chatId, message);
  }

  async processMLPrediction(
    userId: string,
    tokenAddress: string,
    tokenSymbol: string,
    currentPrice: number,
    indicators: Record<string, any>,
    chain: string = 'solana',
    horizon: '1h' | '4h' | '24h' | '7d' = '24h'
  ): Promise<TradeDecision> {
    const prediction = await predictionLearningService.predictWithModel(indicators, currentPrice, horizon);

    if (!prediction.isModelBased) {
      return { 
        shouldTrade: false, 
        action: 'skip', 
        reason: 'No active ML model available for predictions' 
      };
    }

    const modelStatus = await predictionLearningService.getModelStatus();
    const horizonStatus = modelStatus.horizons[horizon];
    const modelAccuracy = horizonStatus?.accuracy || 0.5;

    if (prediction.signal === 'HOLD') {
      return { 
        shouldTrade: false, 
        action: 'skip', 
        reason: `ML model suggests HOLD (probability: ${(prediction.probability * 100).toFixed(1)}%)` 
      };
    }

    const signal: SignalEvaluation = {
      tokenAddress,
      tokenSymbol,
      chain,
      currentPrice,
      signal: prediction.signal === 'BUY' && prediction.confidence === 'HIGH' ? 'STRONG_BUY' :
              prediction.signal === 'SELL' && prediction.confidence === 'HIGH' ? 'STRONG_SELL' :
              prediction.signal,
      signalConfidence: prediction.probability,
      modelAccuracy,
      horizon,
      indicators,
    };

    return this.evaluateSignal(userId, signal);
  }

  async getActiveUsersForAutoTrade(): Promise<AutoTradeConfigData[]> {
    const configs = await db.select().from(autoTradeConfig)
      .where(and(
        eq(autoTradeConfig.enabled, true),
        eq(autoTradeConfig.isPaused, false)
      ));

    return configs.map(row => ({
      userId: row.userId,
      enabled: row.enabled ?? false,
      mode: (row.mode || 'observer') as any,
      confidenceThreshold: row.confidenceThreshold?.toString() || '0.70',
      accuracyThreshold: row.accuracyThreshold?.toString() || '0.55',
      maxPerTrade: row.maxPerTrade?.toString() || '10.00',
      maxPerDay: row.maxPerDay?.toString() || '50.00',
      maxOpenPositions: row.maxOpenPositions ?? 3,
      stopAfterLosses: row.stopAfterLosses ?? 3,
      isPaused: row.isPaused ?? false,
      pauseReason: row.pauseReason,
      pausedAt: row.pausedAt,
      allowedSignals: row.allowedSignals || '["BUY", "STRONG_BUY"]',
      allowedHorizons: row.allowedHorizons || '["1h", "4h"]',
      notifyOnTrade: row.notifyOnTrade ?? true,
      notifyOnRecommendation: row.notifyOnRecommendation ?? true,
      notifyChannel: row.notifyChannel || 'telegram',
      tradingWalletId: row.tradingWalletId,
      totalTradesExecuted: row.totalTradesExecuted ?? 0,
      winningTrades: row.winningTrades ?? 0,
      losingTrades: row.losingTrades ?? 0,
      totalProfitLoss: row.totalProfitLoss?.toString() || '0',
      consecutiveLosses: row.consecutiveLosses ?? 0,
      createdAt: row.createdAt!,
      updatedAt: row.updatedAt!,
    }));
  }

  async evaluateBulkSignals(signals: SignalEvaluation[]): Promise<Map<string, TradeDecision[]>> {
    const activeConfigs = await this.getActiveUsersForAutoTrade();
    const results = new Map<string, TradeDecision[]>();

    for (const config of activeConfigs) {
      const userDecisions: TradeDecision[] = [];
      
      for (const signal of signals) {
        const decision = await this.evaluateSignal(config.userId, signal);
        userDecisions.push(decision);
      }
      
      results.set(config.userId, userDecisions);
    }

    return results;
  }
}

function formatNumber(num: number): string {
  if (num < 0.000001) return num.toExponential(2);
  if (num < 0.01) return num.toFixed(6);
  if (num < 1) return num.toFixed(4);
  if (num < 1000) return num.toFixed(2);
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export const tradeExecutionService = new TradeExecutionService();
