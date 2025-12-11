import { db } from '../db/client.js';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { ChainId } from './multiChainProvider.js';
import { predictionLearningService } from './predictionLearningService.js';

export type TradeStatus = 'pending' | 'executed' | 'partial' | 'cancelled' | 'failed';
export type TradeType = 'buy' | 'sell';
export type TradeSource = 'strikeagent_auto' | 'strikeagent_manual' | 'limit_order' | 'watchlist';

export type TimeHorizon = '1h' | '4h' | '24h' | '7d';

export interface Trade {
  id: string;
  userId: string;
  chain: ChainId;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName?: string;
  tradeType: TradeType;
  source: TradeSource;
  
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  amountUsd: number;
  
  safetyScore?: number;
  safetyGrade?: string;
  
  status: TradeStatus;
  txHash?: string;
  gasFeeUsd?: number;
  
  entryTimestamp: Date;
  exitTimestamp?: Date;
  
  profitLoss?: number;
  profitLossPercent?: number;
  isWin?: boolean;
  
  predictionId?: string;
  horizon?: TimeHorizon;
  
  aiPrediction?: {
    signal: string;
    confidence: string;
    probability: number;
  };
  
  indicators?: Record<string, any>;
  
  notes?: string;
}

export interface TradeOutcome {
  tradeId: string;
  exitPrice: number;
  exitTimestamp: Date;
  profitLoss: number;
  profitLossPercent: number;
  isWin: boolean;
  exitReason: 'manual' | 'stop_loss' | 'take_profit' | 'timeout' | 'safety_alert';
}

export interface TradingStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfitLoss: number;
  averageProfitPercent: number;
  averageLossPercent: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  avgHoldTime: number;
  byChain: Record<ChainId, { trades: number; winRate: number; pnl: number }>;
  bySource: Record<TradeSource, { trades: number; winRate: number; pnl: number }>;
}

class TradeLedgerService {
  private trades: Map<string, Trade> = new Map();

  async recordTrade(trade: Omit<Trade, 'id'>): Promise<string> {
    const id = `trade_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`;

    const fullTrade: Trade = {
      id,
      ...trade,
    };

    this.trades.set(id, fullTrade);

    try {
      await db.execute(sql`
        INSERT INTO strike_agent_trades (
          id, user_id, chain, token_address, token_symbol, token_name,
          trade_type, source, entry_price, amount, amount_usd,
          safety_score, safety_grade, status, tx_hash, gas_fee_usd,
          entry_timestamp, ai_prediction, indicators, notes,
          prediction_id, horizon
        ) VALUES (
          ${id}, ${trade.userId}, ${trade.chain}, ${trade.tokenAddress},
          ${trade.tokenSymbol}, ${trade.tokenName || null}, ${trade.tradeType},
          ${trade.source}, ${trade.entryPrice}, ${trade.amount}, ${trade.amountUsd},
          ${trade.safetyScore || null}, ${trade.safetyGrade || null},
          ${trade.status}, ${trade.txHash || null}, ${trade.gasFeeUsd || null},
          ${trade.entryTimestamp}, ${JSON.stringify(trade.aiPrediction) || null},
          ${JSON.stringify(trade.indicators) || null}, ${trade.notes || null},
          ${trade.predictionId || null}, ${trade.horizon || null}
        )
      `);
    } catch (error) {
      console.error('[TradeLedger] Error saving trade to DB:', error);
    }

    console.log(`[TradeLedger] Recorded trade ${id}: ${trade.tradeType} ${trade.tokenSymbol} on ${trade.chain}`);
    return id;
  }

  async recordTradeOutcome(outcome: TradeOutcome): Promise<void> {
    const trade = this.trades.get(outcome.tradeId);
    
    if (trade) {
      trade.exitPrice = outcome.exitPrice;
      trade.exitTimestamp = outcome.exitTimestamp;
      trade.profitLoss = outcome.profitLoss;
      trade.profitLossPercent = outcome.profitLossPercent;
      trade.isWin = outcome.isWin;
      trade.status = 'executed';
    }

    try {
      await db.execute(sql`
        UPDATE strike_agent_trades SET
          exit_price = ${outcome.exitPrice},
          exit_timestamp = ${outcome.exitTimestamp},
          profit_loss = ${outcome.profitLoss},
          profit_loss_percent = ${outcome.profitLossPercent},
          is_win = ${outcome.isWin},
          status = 'executed'
        WHERE id = ${outcome.tradeId}
      `);
    } catch (error) {
      console.error('[TradeLedger] Error updating trade outcome:', error);
    }

    await this.feedToAdaptiveAI(outcome.tradeId);

    console.log(`[TradeLedger] Recorded outcome for ${outcome.tradeId}: ${outcome.isWin ? 'WIN' : 'LOSS'} ${outcome.profitLossPercent.toFixed(2)}%`);
  }

  private async feedToAdaptiveAI(tradeId: string): Promise<void> {
    let trade = this.trades.get(tradeId);
    
    if (!trade) {
      try {
        const result = await db.execute(sql`
          SELECT * FROM strike_agent_trades WHERE id = ${tradeId}
        `);
        if (result.rows && result.rows.length > 0) {
          const row: any = result.rows[0];
          trade = {
            id: row.id,
            userId: row.user_id,
            chain: row.chain,
            tokenAddress: row.token_address,
            tokenSymbol: row.token_symbol,
            tokenName: row.token_name,
            tradeType: row.trade_type,
            source: row.source,
            entryPrice: parseFloat(row.entry_price),
            exitPrice: row.exit_price ? parseFloat(row.exit_price) : undefined,
            amount: parseFloat(row.amount),
            amountUsd: parseFloat(row.amount_usd),
            safetyScore: row.safety_score,
            safetyGrade: row.safety_grade,
            status: row.status,
            txHash: row.tx_hash,
            gasFeeUsd: row.gas_fee_usd ? parseFloat(row.gas_fee_usd) : undefined,
            entryTimestamp: new Date(row.entry_timestamp),
            exitTimestamp: row.exit_timestamp ? new Date(row.exit_timestamp) : undefined,
            profitLoss: row.profit_loss ? parseFloat(row.profit_loss) : undefined,
            profitLossPercent: row.profit_loss_percent ? parseFloat(row.profit_loss_percent) : undefined,
            isWin: row.is_win,
            predictionId: row.prediction_id,
            horizon: row.horizon,
            aiPrediction: row.ai_prediction ? JSON.parse(row.ai_prediction) : undefined,
            indicators: row.indicators ? JSON.parse(row.indicators) : undefined,
            notes: row.notes,
          };
          this.trades.set(tradeId, trade);
        }
      } catch (error) {
        console.error('[TradeLedger] Error loading trade from DB:', error);
      }
    }
    
    if (!trade || trade.isWin === undefined) {
      console.log(`[TradeLedger] Skipping AI feed for trade ${tradeId}: missing trade data or outcome`);
      return;
    }

    try {
      let horizon: TimeHorizon = trade.horizon || '1h';
      
      if (!trade.horizon && trade.exitTimestamp && trade.entryTimestamp) {
        const holdTimeHours = (trade.exitTimestamp.getTime() - trade.entryTimestamp.getTime()) / (1000 * 60 * 60);
        if (holdTimeHours >= 24 * 7) horizon = '7d';
        else if (holdTimeHours >= 24) horizon = '24h';
        else if (holdTimeHours >= 4) horizon = '4h';
      }

      const predictionId = trade.predictionId;
      
      if (predictionId) {
        console.log(`[TradeLedger] Feeding trade ${tradeId} to Adaptive AI with prediction ${predictionId} (horizon: ${horizon})`);
        
        await predictionLearningService.extractFeatures(
          predictionId,
          horizon,
          trade.profitLossPercent || 0,
          trade.isWin
        );
        
        console.log(`[TradeLedger] Successfully linked trade ${tradeId} to prediction learning system`);
      } else if (trade.indicators) {
        console.log(`[TradeLedger] Trade ${tradeId} has no prediction ID, creating standalone features (horizon: ${horizon})`);
        
        const standalonePredictionId = `standalone_${tradeId}`;
        await predictionLearningService.extractFeatures(
          standalonePredictionId,
          horizon,
          trade.profitLossPercent || 0,
          trade.isWin
        );
      } else {
        console.log(`[TradeLedger] Trade ${tradeId} has no prediction ID or indicators, skipping AI feed`);
      }

    } catch (error) {
      console.error('[TradeLedger] Error feeding to Adaptive AI:', error);
    }
  }

  async getUserTrades(userId: string, limit: number = 50): Promise<Trade[]> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM strike_agent_trades
        WHERE user_id = ${userId}
        ORDER BY entry_timestamp DESC
        LIMIT ${limit}
      `);
      return (result.rows || []) as unknown as Trade[];
    } catch (error) {
      return Array.from(this.trades.values())
        .filter(t => t.userId === userId)
        .slice(0, limit);
    }
  }

  async getTradeStats(userId: string, days: number = 30): Promise<TradingStats> {
    const trades = await this.getUserTrades(userId, 1000);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentTrades = trades.filter(t => t.entryTimestamp >= cutoff && t.status === 'executed');

    const winningTrades = recentTrades.filter(t => t.isWin);
    const losingTrades = recentTrades.filter(t => t.isWin === false);

    const totalProfit = winningTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0));

    const avgWinPercent = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + (t.profitLossPercent || 0), 0) / winningTrades.length
      : 0;

    const avgLossPercent = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.profitLossPercent || 0), 0) / losingTrades.length)
      : 0;

    const avgHoldTime = recentTrades.length > 0
      ? recentTrades.reduce((sum, t) => {
          if (t.exitTimestamp && t.entryTimestamp) {
            return sum + (t.exitTimestamp.getTime() - t.entryTimestamp.getTime());
          }
          return sum;
        }, 0) / recentTrades.length / (1000 * 60 * 60)
      : 0;

    const byChain: Record<ChainId, { trades: number; winRate: number; pnl: number }> = {} as any;
    const bySource: Record<TradeSource, { trades: number; winRate: number; pnl: number }> = {} as any;

    const chains: ChainId[] = ['solana', 'ethereum', 'base', 'polygon', 'arbitrum', 'bsc'];
    const sources: TradeSource[] = ['strikeagent_auto', 'strikeagent_manual', 'limit_order', 'watchlist'];

    for (const chain of chains) {
      const chainTrades = recentTrades.filter(t => t.chain === chain);
      const chainWins = chainTrades.filter(t => t.isWin);
      byChain[chain] = {
        trades: chainTrades.length,
        winRate: chainTrades.length > 0 ? (chainWins.length / chainTrades.length) * 100 : 0,
        pnl: chainTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0),
      };
    }

    for (const source of sources) {
      const sourceTrades = recentTrades.filter(t => t.source === source);
      const sourceWins = sourceTrades.filter(t => t.isWin);
      bySource[source] = {
        trades: sourceTrades.length,
        winRate: sourceTrades.length > 0 ? (sourceWins.length / sourceTrades.length) * 100 : 0,
        pnl: sourceTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0),
      };
    }

    return {
      totalTrades: recentTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: recentTrades.length > 0 ? (winningTrades.length / recentTrades.length) * 100 : 0,
      totalProfitLoss: totalProfit - totalLoss,
      averageProfitPercent: avgWinPercent,
      averageLossPercent: avgLossPercent,
      profitFactor: totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0,
      bestTrade: Math.max(...recentTrades.map(t => t.profitLossPercent || 0), 0),
      worstTrade: Math.min(...recentTrades.map(t => t.profitLossPercent || 0), 0),
      avgHoldTime,
      byChain,
      bySource,
    };
  }

  async getRecentTradesForLearning(minTrades: number = 50): Promise<Trade[]> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM strike_agent_trades
        WHERE status = 'executed' AND is_win IS NOT NULL
        ORDER BY exit_timestamp DESC
        LIMIT ${minTrades * 2}
      `);
      return (result.rows || []) as unknown as Trade[];
    } catch (error) {
      return Array.from(this.trades.values())
        .filter(t => t.status === 'executed' && t.isWin !== undefined)
        .slice(0, minTrades * 2);
    }
  }

  async triggerModelRetraining(): Promise<{
    success: boolean;
    message: string;
    results?: Record<string, any>;
  }> {
    try {
      const trades = await this.getRecentTradesForLearning(50);

      if (trades.length < 50) {
        return {
          success: false,
          message: `Insufficient trade data: ${trades.length}/50 trades needed`,
        };
      }

      const results = await predictionLearningService.trainAllHorizons();

      return {
        success: true,
        message: 'Model retraining completed',
        results,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Retraining failed: ${error.message}`,
      };
    }
  }
}

export const tradeLedgerService = new TradeLedgerService();
