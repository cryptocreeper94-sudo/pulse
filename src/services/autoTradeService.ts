import { db } from '../db/client';
import { autoTradeConfig, autoTrades } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import pino from 'pino';

const logger = pino({ name: 'AutoTradeService' });

export type AutoTradeStatus = 
  | 'pending'
  | 'awaiting_approval'
  | 'approved'
  | 'executed'
  | 'failed'
  | 'cancelled'
  | 'rejected';

export type TradingMode = 'observer' | 'approval' | 'semi-auto' | 'full-auto';

export interface AutoTradeConfigData {
  userId: string;
  enabled: boolean;
  mode: TradingMode;
  confidenceThreshold: string;
  accuracyThreshold: string;
  maxPerTrade: string;
  maxPerDay: string;
  maxOpenPositions: number;
  stopAfterLosses: number;
  isPaused: boolean;
  pauseReason: string | null;
  pausedAt: Date | null;
  allowedSignals: string;
  allowedHorizons: string;
  notifyOnTrade: boolean;
  notifyOnRecommendation: boolean;
  notifyChannel: string;
  tradingWalletId: string | null;
  totalTradesExecuted: number;
  winningTrades: number;
  losingTrades: number;
  totalProfitLoss: string;
  consecutiveLosses: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutoTrade {
  id: string;
  userId: string;
  tokenAddress: string;
  tokenSymbol: string | null;
  tokenName: string | null;
  chain: string;
  signalType: string;
  signalConfidence: string;
  modelAccuracy: string | null;
  horizon: string | null;
  predictionId: string | null;
  tradeType: string;
  status: AutoTradeStatus;
  amountUSD: string;
  amountToken: string | null;
  amountNative: string | null;
  entryPrice: string | null;
  exitPrice: string | null;
  currentPrice: string | null;
  profitLossUSD: string | null;
  profitLossPercent: string | null;
  isWinning: boolean | null;
  txSignature: string | null;
  txError: string | null;
  gasUsed: string | null;
  requiresApproval: boolean;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  recommendedAt: Date;
  executedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAutoTradeInput {
  userId: string;
  tokenAddress: string;
  tokenSymbol?: string;
  tokenName?: string;
  chain?: string;
  signalType: string;
  signalConfidence: string;
  modelAccuracy?: string;
  horizon?: string;
  predictionId?: string;
  tradeType: 'BUY' | 'SELL';
  amountUSD: string;
  amountToken?: string;
  amountNative?: string;
  entryPrice?: string;
  requiresApproval?: boolean;
}

export interface GetTradesOptions {
  status?: AutoTradeStatus;
  limit?: number;
  offset?: number;
}

class AutoTradeService {
  private mapDbConfigToData(row: any): AutoTradeConfigData {
    return {
      userId: row.userId,
      enabled: row.enabled ?? false,
      mode: row.mode || 'observer',
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
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapDbTradeToAutoTrade(row: any): AutoTrade {
    return {
      id: row.id,
      userId: row.userId,
      tokenAddress: row.tokenAddress,
      tokenSymbol: row.tokenSymbol,
      tokenName: row.tokenName,
      chain: row.chain || 'solana',
      signalType: row.signalType,
      signalConfidence: row.signalConfidence?.toString() || '0',
      modelAccuracy: row.modelAccuracy?.toString() || null,
      horizon: row.horizon,
      predictionId: row.predictionId,
      tradeType: row.tradeType,
      status: row.status as AutoTradeStatus,
      amountUSD: row.amountUSD?.toString() || '0',
      amountToken: row.amountToken?.toString() || null,
      amountNative: row.amountNative?.toString() || null,
      entryPrice: row.entryPrice?.toString() || null,
      exitPrice: row.exitPrice?.toString() || null,
      currentPrice: row.currentPrice?.toString() || null,
      profitLossUSD: row.profitLossUSD?.toString() || null,
      profitLossPercent: row.profitLossPercent?.toString() || null,
      isWinning: row.isWinning,
      txSignature: row.txSignature,
      txError: row.txError,
      gasUsed: row.gasUsed?.toString() || null,
      requiresApproval: row.requiresApproval ?? false,
      approvedBy: row.approvedBy,
      approvedAt: row.approvedAt,
      rejectedAt: row.rejectedAt,
      rejectionReason: row.rejectionReason,
      recommendedAt: row.recommendedAt,
      executedAt: row.executedAt,
      closedAt: row.closedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async getConfig(userId: string): Promise<AutoTradeConfigData> {
    logger.info({ userId }, '[AutoTrade] Getting config');
    
    const results = await db.select().from(autoTradeConfig)
      .where(eq(autoTradeConfig.userId, userId));
    
    if (results[0]) {
      return this.mapDbConfigToData(results[0]);
    }
    
    logger.info({ userId }, '[AutoTrade] Creating default config');
    const now = new Date();
    
    await db.insert(autoTradeConfig).values({
      userId,
      enabled: false,
      mode: 'observer',
      createdAt: now,
      updatedAt: now,
    });
    
    const newResults = await db.select().from(autoTradeConfig)
      .where(eq(autoTradeConfig.userId, userId));
    
    return this.mapDbConfigToData(newResults[0]);
  }

  async updateConfig(userId: string, updates: Partial<Omit<AutoTradeConfigData, 'userId' | 'createdAt' | 'updatedAt'>>): Promise<AutoTradeConfigData> {
    logger.info({ userId, updates }, '[AutoTrade] Updating config');
    
    await this.getConfig(userId);
    
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };
    
    if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
    if (updates.mode !== undefined) updateData.mode = updates.mode;
    if (updates.confidenceThreshold !== undefined) updateData.confidenceThreshold = updates.confidenceThreshold;
    if (updates.accuracyThreshold !== undefined) updateData.accuracyThreshold = updates.accuracyThreshold;
    if (updates.maxPerTrade !== undefined) updateData.maxPerTrade = updates.maxPerTrade;
    if (updates.maxPerDay !== undefined) updateData.maxPerDay = updates.maxPerDay;
    if (updates.maxOpenPositions !== undefined) updateData.maxOpenPositions = updates.maxOpenPositions;
    if (updates.stopAfterLosses !== undefined) updateData.stopAfterLosses = updates.stopAfterLosses;
    if (updates.isPaused !== undefined) updateData.isPaused = updates.isPaused;
    if (updates.pauseReason !== undefined) updateData.pauseReason = updates.pauseReason;
    if (updates.pausedAt !== undefined) updateData.pausedAt = updates.pausedAt;
    if (updates.allowedSignals !== undefined) updateData.allowedSignals = updates.allowedSignals;
    if (updates.allowedHorizons !== undefined) updateData.allowedHorizons = updates.allowedHorizons;
    if (updates.notifyOnTrade !== undefined) updateData.notifyOnTrade = updates.notifyOnTrade;
    if (updates.notifyOnRecommendation !== undefined) updateData.notifyOnRecommendation = updates.notifyOnRecommendation;
    if (updates.notifyChannel !== undefined) updateData.notifyChannel = updates.notifyChannel;
    if (updates.tradingWalletId !== undefined) updateData.tradingWalletId = updates.tradingWalletId;
    
    await db.update(autoTradeConfig)
      .set(updateData)
      .where(eq(autoTradeConfig.userId, userId));
    
    return this.getConfig(userId);
  }

  async toggleEnabled(userId: string, enabled: boolean): Promise<AutoTradeConfigData> {
    logger.info({ userId, enabled }, '[AutoTrade] Toggling enabled');
    
    return this.updateConfig(userId, { enabled });
  }

  async pauseTrading(userId: string, reason?: string): Promise<AutoTradeConfigData> {
    logger.info({ userId, reason }, '[AutoTrade] Pausing trading');
    
    return this.updateConfig(userId, {
      isPaused: true,
      pauseReason: reason || 'Manually paused',
      pausedAt: new Date(),
    });
  }

  async resumeTrading(userId: string): Promise<AutoTradeConfigData> {
    logger.info({ userId }, '[AutoTrade] Resuming trading');
    
    return this.updateConfig(userId, {
      isPaused: false,
      pauseReason: null,
      pausedAt: null,
    });
  }

  async getTrades(userId: string, options?: GetTradesOptions): Promise<AutoTrade[]> {
    logger.info({ userId, options }, '[AutoTrade] Fetching trades');
    
    const whereCondition = options?.status
      ? and(eq(autoTrades.userId, userId), eq(autoTrades.status, options.status))
      : eq(autoTrades.userId, userId);
    
    const results = await db.select().from(autoTrades)
      .where(whereCondition)
      .orderBy(desc(autoTrades.createdAt))
      .limit(options?.limit || 100)
      .offset(options?.offset || 0);
    
    return results.map(row => this.mapDbTradeToAutoTrade(row));
  }

  async getTradeById(tradeId: string): Promise<AutoTrade | null> {
    const results = await db.select().from(autoTrades)
      .where(eq(autoTrades.id, tradeId));
    
    return results[0] ? this.mapDbTradeToAutoTrade(results[0]) : null;
  }

  async createTrade(input: CreateAutoTradeInput): Promise<AutoTrade> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    logger.info({ tradeId: id, userId: input.userId, tokenSymbol: input.tokenSymbol }, '[AutoTrade] Creating trade');
    
    await db.insert(autoTrades).values({
      id,
      userId: input.userId,
      tokenAddress: input.tokenAddress,
      tokenSymbol: input.tokenSymbol || null,
      tokenName: input.tokenName || null,
      chain: input.chain || 'solana',
      signalType: input.signalType,
      signalConfidence: input.signalConfidence,
      modelAccuracy: input.modelAccuracy || null,
      horizon: input.horizon || null,
      predictionId: input.predictionId || null,
      tradeType: input.tradeType,
      status: input.requiresApproval ? 'awaiting_approval' : 'pending',
      amountUSD: input.amountUSD,
      amountToken: input.amountToken || null,
      amountNative: input.amountNative || null,
      entryPrice: input.entryPrice || null,
      requiresApproval: input.requiresApproval || false,
      recommendedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    
    logger.info({ tradeId: id }, '[AutoTrade] Trade created');
    
    const trade = await this.getTradeById(id);
    return trade!;
  }

  async updateTradeStatus(tradeId: string, status: AutoTradeStatus, additionalData?: Record<string, any>): Promise<void> {
    logger.info({ tradeId, status }, '[AutoTrade] Updating trade status');
    
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date(),
    };
    
    if (status === 'executed') {
      updateData.executedAt = new Date();
    }
    
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }
    
    await db.update(autoTrades)
      .set(updateData)
      .where(eq(autoTrades.id, tradeId));
  }

  async approveTrade(tradeId: string, approvedBy: string): Promise<AutoTrade | null> {
    logger.info({ tradeId, approvedBy }, '[AutoTrade] Approving trade');
    
    const trade = await this.getTradeById(tradeId);
    if (!trade) {
      return null;
    }
    
    if (trade.status !== 'awaiting_approval') {
      logger.warn({ tradeId, currentStatus: trade.status }, '[AutoTrade] Trade not awaiting approval');
      return trade;
    }
    
    await db.update(autoTrades)
      .set({
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(autoTrades.id, tradeId));
    
    return this.getTradeById(tradeId);
  }

  async rejectTrade(tradeId: string, reason: string): Promise<AutoTrade | null> {
    logger.info({ tradeId, reason }, '[AutoTrade] Rejecting trade');
    
    const trade = await this.getTradeById(tradeId);
    if (!trade) {
      return null;
    }
    
    await db.update(autoTrades)
      .set({
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(autoTrades.id, tradeId));
    
    return this.getTradeById(tradeId);
  }

  async recordTradeResult(tradeId: string, exitPrice: string, profitLoss: { usd: string; percent: string }): Promise<AutoTrade | null> {
    logger.info({ tradeId, exitPrice, profitLoss }, '[AutoTrade] Recording trade result');
    
    const trade = await this.getTradeById(tradeId);
    if (!trade) {
      return null;
    }
    
    const isWinning = parseFloat(profitLoss.usd) > 0;
    
    await db.update(autoTrades)
      .set({
        exitPrice,
        profitLossUSD: profitLoss.usd,
        profitLossPercent: profitLoss.percent,
        isWinning,
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(autoTrades.id, tradeId));
    
    const config = await this.getConfig(trade.userId);
    const newWinning = isWinning ? config.winningTrades + 1 : config.winningTrades;
    const newLosing = isWinning ? config.losingTrades : config.losingTrades + 1;
    const newConsecutiveLosses = isWinning ? 0 : config.consecutiveLosses + 1;
    const newTotalProfitLoss = (parseFloat(config.totalProfitLoss) + parseFloat(profitLoss.usd)).toString();
    
    const shouldPause = newConsecutiveLosses >= config.stopAfterLosses;
    
    await db.update(autoTradeConfig)
      .set({
        totalTradesExecuted: config.totalTradesExecuted + 1,
        winningTrades: newWinning,
        losingTrades: newLosing,
        consecutiveLosses: newConsecutiveLosses,
        totalProfitLoss: newTotalProfitLoss,
        isPaused: shouldPause ? true : config.isPaused,
        pauseReason: shouldPause ? `Auto-paused: ${newConsecutiveLosses} consecutive losses` : config.pauseReason,
        pausedAt: shouldPause ? new Date() : config.pausedAt,
        updatedAt: new Date(),
      })
      .where(eq(autoTradeConfig.userId, trade.userId));
    
    if (shouldPause) {
      logger.warn({ userId: trade.userId, consecutiveLosses: newConsecutiveLosses }, '[AutoTrade] Trading auto-paused due to consecutive losses');
    }
    
    return this.getTradeById(tradeId);
  }

  async getStats(userId: string): Promise<{
    config: AutoTradeConfigData;
    recentTrades: AutoTrade[];
    pendingApprovals: number;
    openPositions: number;
    winRate: number;
    dailyProfitLoss: string;
  }> {
    logger.info({ userId }, '[AutoTrade] Getting stats');
    
    const config = await this.getConfig(userId);
    const recentTrades = await this.getTrades(userId, { limit: 10 });
    
    const pendingApprovalTrades = await db.select().from(autoTrades)
      .where(and(
        eq(autoTrades.userId, userId),
        eq(autoTrades.status, 'awaiting_approval')
      ));
    
    const openPositionTrades = await db.select().from(autoTrades)
      .where(and(
        eq(autoTrades.userId, userId),
        eq(autoTrades.status, 'executed')
      ));
    
    const totalTrades = config.winningTrades + config.losingTrades;
    const winRate = totalTrades > 0 ? (config.winningTrades / totalTrades) * 100 : 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTrades = recentTrades.filter(t => 
      t.closedAt && new Date(t.closedAt) >= today
    );
    
    const dailyProfitLoss = todayTrades.reduce((sum, t) => 
      sum + parseFloat(t.profitLossUSD || '0'), 0
    ).toFixed(2);
    
    return {
      config,
      recentTrades,
      pendingApprovals: pendingApprovalTrades.length,
      openPositions: openPositionTrades.length,
      winRate: Math.round(winRate * 100) / 100,
      dailyProfitLoss,
    };
  }
}

export const autoTradeService = new AutoTradeService();
