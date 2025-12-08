import { db } from '../db/client';
import { userWallets, snipePresets, snipeOrders, snipeExecutions, sniperSessionStats } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { InferSelectModel } from 'drizzle-orm';

// Types for sniper bot
export interface TokenSafetyMetrics {
  botPercent: number;
  bundlePercent: number;
  top10HoldersPercent: number;
  liquidityUsd: number;
  holderCount: number;
  creatorWalletRisky: boolean;
}

export interface TokenMovementMetrics {
  priceChangePercent: number;
  volumeMultiplier: number;
  tradesPerMinute: number;
  buySellRatio: number;
  holderGrowthPercent: number;
}

export interface DiscoveredToken {
  address: string;
  symbol: string;
  name: string;
  dex: string;
  priceUsd: number;
  priceSol: number;
  marketCapUsd: number;
  liquidityUsd: number;
  ageMinutes: number;
  safetyMetrics: TokenSafetyMetrics;
  movementMetrics: TokenMovementMetrics;
  aiScore: number;
  aiRecommendation: 'snipe' | 'watch' | 'avoid';
  aiReasoning: string;
}

export interface SnipePresetConfig {
  mode: 'simple' | 'advanced';
  safetyFilters: {
    maxBotPercent: number;
    maxBundlePercent: number;
    maxTop10HoldersPercent: number;
    minLiquidityUsd: number;
    checkCreatorWallet: boolean;
  };
  discoveryFilters: {
    minTokenAgeMinutes: number;
    maxTokenAgeMinutes: number;
    minHolders: number;
    minWatchers: number;
  };
  movementFilters: {
    minPriceChangePercent: number;
    movementTimeframeMinutes: number;
    minVolumeMultiplier: number;
    minTradesPerMinute: number;
    minBuySellRatio: number;
    minHolderGrowthPercent: number;
  };
  dexPreferences: {
    enabledDexes: string[];
    preferredDex: string;
  };
  tradeControls: {
    buyAmountSol: number;
    slippagePercent: number;
    priorityFee: 'low' | 'medium' | 'high' | 'auto';
    takeProfitPercent: number;
    stopLossPercent: number;
    trailingStopPercent?: number;
  };
  autoModeSettings: {
    maxTradesPerSession: number;
    maxSolPerSession: number;
    cooldownSeconds: number;
    maxConsecutiveLosses: number;
  };
}

// Default preset configuration
export const DEFAULT_PRESET: SnipePresetConfig = {
  mode: 'simple',
  safetyFilters: {
    maxBotPercent: 80,
    maxBundlePercent: 50,
    maxTop10HoldersPercent: 80,
    minLiquidityUsd: 5000,
    checkCreatorWallet: true,
  },
  discoveryFilters: {
    minTokenAgeMinutes: 5,
    maxTokenAgeMinutes: 1440,
    minHolders: 50,
    minWatchers: 10,
  },
  movementFilters: {
    minPriceChangePercent: 1.5,
    movementTimeframeMinutes: 5,
    minVolumeMultiplier: 2,
    minTradesPerMinute: 5,
    minBuySellRatio: 1.2,
    minHolderGrowthPercent: 5,
  },
  dexPreferences: {
    enabledDexes: ['raydium', 'pumpfun', 'jupiter', 'orca', 'meteora'],
    preferredDex: 'jupiter',
  },
  tradeControls: {
    buyAmountSol: 0.5,
    slippagePercent: 5,
    priorityFee: 'auto',
    takeProfitPercent: 50,
    stopLossPercent: 20,
  },
  autoModeSettings: {
    maxTradesPerSession: 10,
    maxSolPerSession: 5,
    cooldownSeconds: 60,
    maxConsecutiveLosses: 3,
  },
};

class SniperBotService {
  // ============================================
  // WALLET MANAGEMENT
  // ============================================
  
  async getUserWallets(userId: string) {
    return await db.select().from(userWallets).where(eq(userWallets.userId, userId));
  }

  async addUserWallet(userId: string, address: string, nickname?: string) {
    const id = uuidv4();
    const existingWallets = await this.getUserWallets(userId);
    const isPrimary = existingWallets.length === 0; // First wallet is primary
    
    await db.insert(userWallets).values({
      id,
      userId,
      address,
      nickname,
      chain: 'solana',
      isPrimary,
      isConnected: true,
      lastConnectedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return { id, address, isPrimary };
  }

  async setPrimaryWallet(userId: string, walletId: string) {
    // Remove primary from all user wallets
    await db.update(userWallets)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(eq(userWallets.userId, userId));
    
    // Set new primary
    await db.update(userWallets)
      .set({ isPrimary: true, updatedAt: new Date() })
      .where(and(eq(userWallets.id, walletId), eq(userWallets.userId, userId)));
  }

  async updateWalletBalance(walletId: string, solBalance: string) {
    await db.update(userWallets)
      .set({ 
        solBalance, 
        lastBalanceUpdate: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(userWallets.id, walletId));
  }

  // ============================================
  // PRESET MANAGEMENT
  // ============================================

  async getUserPresets(userId: string) {
    return await db.select().from(snipePresets)
      .where(eq(snipePresets.userId, userId))
      .orderBy(desc(snipePresets.createdAt));
  }

  async createPreset(userId: string, name: string, config: SnipePresetConfig, description?: string) {
    const id = uuidv4();
    
    await db.insert(snipePresets).values({
      id,
      userId,
      name,
      description,
      mode: config.mode,
      isDefault: false,
      // Safety filters
      maxBotPercent: config.safetyFilters.maxBotPercent,
      maxBundlePercent: config.safetyFilters.maxBundlePercent,
      maxTop10HoldersPercent: config.safetyFilters.maxTop10HoldersPercent,
      minLiquidityUsd: config.safetyFilters.minLiquidityUsd,
      checkCreatorWallet: config.safetyFilters.checkCreatorWallet,
      // Discovery filters
      minTokenAgeMinutes: config.discoveryFilters.minTokenAgeMinutes,
      maxTokenAgeMinutes: config.discoveryFilters.maxTokenAgeMinutes,
      minHolders: config.discoveryFilters.minHolders,
      minWatchers: config.discoveryFilters.minWatchers,
      // Movement filters
      minPriceChangePercent: config.movementFilters.minPriceChangePercent.toString(),
      movementTimeframeMinutes: config.movementFilters.movementTimeframeMinutes,
      minVolumeMultiplier: config.movementFilters.minVolumeMultiplier.toString(),
      minTradesPerMinute: config.movementFilters.minTradesPerMinute,
      minBuySellRatio: config.movementFilters.minBuySellRatio.toString(),
      minHolderGrowthPercent: config.movementFilters.minHolderGrowthPercent.toString(),
      // DEX preferences
      enabledDexes: JSON.stringify(config.dexPreferences.enabledDexes),
      preferredDex: config.dexPreferences.preferredDex,
      // Trade controls
      buyAmountSol: config.tradeControls.buyAmountSol.toString(),
      slippagePercent: config.tradeControls.slippagePercent.toString(),
      priorityFee: config.tradeControls.priorityFee,
      takeProfitPercent: config.tradeControls.takeProfitPercent.toString(),
      stopLossPercent: config.tradeControls.stopLossPercent.toString(),
      trailingStopPercent: config.tradeControls.trailingStopPercent?.toString(),
      // Auto mode
      maxTradesPerSession: config.autoModeSettings.maxTradesPerSession,
      maxSolPerSession: config.autoModeSettings.maxSolPerSession.toString(),
      cooldownSeconds: config.autoModeSettings.cooldownSeconds,
      maxConsecutiveLosses: config.autoModeSettings.maxConsecutiveLosses,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return { id, name };
  }

  async getPresetById(presetId: string) {
    const results = await db.select().from(snipePresets).where(eq(snipePresets.id, presetId));
    return results[0] || null;
  }

  async deletePreset(userId: string, presetId: string) {
    await db.delete(snipePresets)
      .where(and(eq(snipePresets.id, presetId), eq(snipePresets.userId, userId)));
  }

  // ============================================
  // ORDER MANAGEMENT
  // ============================================

  async createSnipeOrder(
    userId: string,
    walletId: string,
    config: SnipePresetConfig,
    orderType: 'snipe' | 'limit' | 'auto',
    targetToken?: { address: string; symbol: string; name: string },
    presetId?: string
  ) {
    const id = uuidv4();
    
    await db.insert(snipeOrders).values({
      id,
      userId,
      walletId,
      presetId,
      orderType,
      targetTokenAddress: targetToken?.address,
      targetTokenSymbol: targetToken?.symbol,
      targetTokenName: targetToken?.name,
      filterSnapshot: JSON.stringify(config),
      buyAmountSol: config.tradeControls.buyAmountSol.toString(),
      slippagePercent: config.tradeControls.slippagePercent.toString(),
      priorityFee: config.tradeControls.priorityFee,
      takeProfitPercent: config.tradeControls.takeProfitPercent.toString(),
      stopLossPercent: config.tradeControls.stopLossPercent.toString(),
      isAutoMode: orderType === 'auto',
      maxTradesRemaining: orderType === 'auto' ? config.autoModeSettings.maxTradesPerSession : null,
      maxSolRemaining: orderType === 'auto' ? config.autoModeSettings.maxSolPerSession.toString() : null,
      tradesExecuted: 0,
      consecutiveLosses: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return { id, orderType, status: 'active' };
  }

  async getActiveOrders(userId: string) {
    return await db.select().from(snipeOrders)
      .where(and(
        eq(snipeOrders.userId, userId),
        eq(snipeOrders.status, 'active')
      ))
      .orderBy(desc(snipeOrders.createdAt));
  }

  async pauseOrder(userId: string, orderId: string) {
    await db.update(snipeOrders)
      .set({ status: 'paused', updatedAt: new Date() })
      .where(and(eq(snipeOrders.id, orderId), eq(snipeOrders.userId, userId)));
  }

  async resumeOrder(userId: string, orderId: string) {
    await db.update(snipeOrders)
      .set({ status: 'active', updatedAt: new Date() })
      .where(and(eq(snipeOrders.id, orderId), eq(snipeOrders.userId, userId)));
  }

  async cancelOrder(userId: string, orderId: string, reason?: string) {
    await db.update(snipeOrders)
      .set({ 
        status: 'cancelled', 
        statusReason: reason || 'User cancelled',
        completedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(and(eq(snipeOrders.id, orderId), eq(snipeOrders.userId, userId)));
  }

  // ============================================
  // EXECUTION TRACKING
  // ============================================

  async recordExecution(
    orderId: string,
    userId: string,
    token: { address: string; symbol: string; name?: string },
    dex: string,
    entryDetails: {
      priceUsd?: string;
      priceSol?: string;
      amountSolSpent: string;
      tokensReceived?: string;
      actualSlippage?: string;
      txSignature?: string;
    },
    safetyMetrics?: TokenSafetyMetrics,
    movementMetrics?: TokenMovementMetrics,
    aiAnalysis?: { recommendation: string; confidence: string; reasoning: string }
  ) {
    const id = uuidv4();
    
    await db.insert(snipeExecutions).values({
      id,
      orderId,
      userId,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      dex,
      txSignature: entryDetails.txSignature,
      entryPriceUsd: entryDetails.priceUsd,
      entryPriceSol: entryDetails.priceSol,
      amountSolSpent: entryDetails.amountSolSpent,
      tokensReceived: entryDetails.tokensReceived,
      actualSlippage: entryDetails.actualSlippage,
      safetyMetrics: safetyMetrics ? JSON.stringify(safetyMetrics) : null,
      movementMetrics: movementMetrics ? JSON.stringify(movementMetrics) : null,
      aiRecommendation: aiAnalysis?.recommendation,
      aiConfidence: aiAnalysis?.confidence,
      aiReasoning: aiAnalysis?.reasoning,
      status: 'holding',
      executedAt: new Date(),
      createdAt: new Date(),
    });
    
    // Update order trade count
    const order = await db.select().from(snipeOrders).where(eq(snipeOrders.id, orderId));
    if (order[0]) {
      const newTradesExecuted = (order[0].tradesExecuted || 0) + 1;
      const newMaxTradesRemaining = order[0].maxTradesRemaining ? order[0].maxTradesRemaining - 1 : null;
      
      await db.update(snipeOrders)
        .set({ 
          tradesExecuted: newTradesExecuted,
          maxTradesRemaining: newMaxTradesRemaining,
          updatedAt: new Date()
        })
        .where(eq(snipeOrders.id, orderId));
    }
    
    return { id, status: 'holding' };
  }

  async closePosition(
    executionId: string,
    exitDetails: {
      priceUsd?: string;
      priceSol?: string;
      txSignature?: string;
      reason: 'take_profit' | 'stop_loss' | 'manual' | 'trailing_stop';
    },
    pnl: {
      sol?: string;
      usd?: string;
      percent?: string;
    },
    holdDurationSeconds?: number
  ) {
    await db.update(snipeExecutions)
      .set({
        exitPriceUsd: exitDetails.priceUsd,
        exitPriceSol: exitDetails.priceSol,
        exitTxSignature: exitDetails.txSignature,
        exitReason: exitDetails.reason,
        pnlSol: pnl.sol,
        pnlUsd: pnl.usd,
        pnlPercent: pnl.percent,
        holdDurationSeconds,
        status: 'closed',
        closedAt: new Date(),
      })
      .where(eq(snipeExecutions.id, executionId));
      
    // Update consecutive losses on order if loss
    const execution = await db.select().from(snipeExecutions).where(eq(snipeExecutions.id, executionId));
    if (execution[0]) {
      const isLoss = pnl.percent && parseFloat(pnl.percent) < 0;
      const order = await db.select().from(snipeOrders).where(eq(snipeOrders.id, execution[0].orderId));
      
      if (order[0]) {
        const newConsecutiveLosses = isLoss ? (order[0].consecutiveLosses || 0) + 1 : 0;
        
        // Check if should auto-stop
        const config: SnipePresetConfig = JSON.parse(order[0].filterSnapshot);
        const shouldStop = newConsecutiveLosses >= config.autoModeSettings.maxConsecutiveLosses;
        
        await db.update(snipeOrders)
          .set({
            consecutiveLosses: newConsecutiveLosses,
            status: shouldStop ? 'completed' : order[0].status,
            statusReason: shouldStop ? `Auto-stopped after ${newConsecutiveLosses} consecutive losses` : order[0].statusReason,
            completedAt: shouldStop ? new Date() : order[0].completedAt,
            updatedAt: new Date(),
          })
          .where(eq(snipeOrders.id, execution[0].orderId));
      }
    }
  }

  async getUserExecutions(userId: string, limit = 50) {
    return await db.select().from(snipeExecutions)
      .where(eq(snipeExecutions.userId, userId))
      .orderBy(desc(snipeExecutions.createdAt))
      .limit(limit);
  }

  async getOpenPositions(userId: string) {
    return await db.select().from(snipeExecutions)
      .where(and(
        eq(snipeExecutions.userId, userId),
        eq(snipeExecutions.status, 'holding')
      ))
      .orderBy(desc(snipeExecutions.executedAt));
  }

  // ============================================
  // SESSION STATS
  // ============================================

  async updateSessionStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's closed executions
    const executions = await db.select().from(snipeExecutions)
      .where(and(
        eq(snipeExecutions.userId, userId),
        eq(snipeExecutions.status, 'closed')
      ));
    
    const todayExecutions = executions.filter(e => 
      e.closedAt && new Date(e.closedAt) >= today
    );
    
    if (todayExecutions.length === 0) return;
    
    const wins = todayExecutions.filter(e => e.pnlPercent && parseFloat(e.pnlPercent) > 0);
    const losses = todayExecutions.filter(e => e.pnlPercent && parseFloat(e.pnlPercent) < 0);
    
    const totalPnlSol = todayExecutions.reduce((sum, e) => sum + (parseFloat(e.pnlSol || '0')), 0);
    const totalPnlUsd = todayExecutions.reduce((sum, e) => sum + (parseFloat(e.pnlUsd || '0')), 0);
    const avgPnlPercent = todayExecutions.reduce((sum, e) => sum + (parseFloat(e.pnlPercent || '0')), 0) / todayExecutions.length;
    
    const pnlValues = todayExecutions.map(e => parseFloat(e.pnlSol || '0'));
    const bestTrade = Math.max(...pnlValues);
    const worstTrade = Math.min(...pnlValues);
    
    const totalSolSpent = todayExecutions.reduce((sum, e) => sum + parseFloat(e.amountSolSpent), 0);
    const totalSolReturned = totalSolSpent + totalPnlSol;
    
    const avgHoldDuration = todayExecutions.reduce((sum, e) => sum + (e.holdDurationSeconds || 0), 0) / todayExecutions.length;
    
    // Check for existing stats for today
    const existingStats = await db.select().from(sniperSessionStats)
      .where(and(
        eq(sniperSessionStats.userId, userId),
        eq(sniperSessionStats.sessionDate, today)
      ));
    
    const statsData = {
      totalTrades: todayExecutions.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      winRate: ((wins.length / todayExecutions.length) * 100).toFixed(1),
      totalPnlSol: totalPnlSol.toFixed(4),
      totalPnlUsd: totalPnlUsd.toFixed(2),
      avgPnlPercent: avgPnlPercent.toFixed(2),
      bestTradePnl: bestTrade.toFixed(4),
      worstTradePnl: worstTrade.toFixed(4),
      totalSolSpent: totalSolSpent.toFixed(4),
      totalSolReturned: totalSolReturned.toFixed(4),
      avgHoldDuration: Math.round(avgHoldDuration),
      updatedAt: new Date(),
    };
    
    if (existingStats.length > 0) {
      await db.update(sniperSessionStats)
        .set(statsData)
        .where(eq(sniperSessionStats.id, existingStats[0].id));
    } else {
      await db.insert(sniperSessionStats).values({
        id: uuidv4(),
        userId,
        sessionDate: today,
        ...statsData,
        createdAt: new Date(),
      });
    }
  }

  async getSessionStats(userId: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db.select().from(sniperSessionStats)
      .where(eq(sniperSessionStats.userId, userId))
      .orderBy(desc(sniperSessionStats.sessionDate))
      .limit(days);
  }
}

export const sniperBotService = new SniperBotService();
