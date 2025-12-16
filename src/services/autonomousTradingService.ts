import crypto from 'crypto';
import { db } from '../db/client.js';
import { 
  tradingProfiles, 
  tradeSuggestions, 
  tradeExecutions, 
  dailyRiskSnapshots,
  tradingMilestones,
  predictionEvents,
  predictionOutcomes,
  exchangeConnections
} from '../db/schema.js';
import { eq, and, desc, gte, sql, count } from 'drizzle-orm';
import { exchangeService } from './exchangeService.js';

export type TradingMode = 'observer' | 'approval' | 'semi_auto' | 'full_auto';
export type SuggestionStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'executed';
export type ExecutionStatus = 'open' | 'closed' | 'cancelled' | 'failed';

interface TradingProfileConfig {
  mode?: TradingMode;
  maxPositionSizeUsd?: string;
  maxDailyLossUsd?: string;
  maxSimultaneousTrades?: number;
  minConfidenceThreshold?: string;
}

interface TradeSuggestionInput {
  userId: string;
  predictionId?: string;
  ticker: string;
  chain?: string;
  signal: string;
  confidence?: number;
  suggestedSizeUsd?: string;
  entryPrice?: string;
  rationale?: string;
  expiresInMinutes?: number;
}

interface RiskCheckResult {
  allowed: boolean;
  reason?: string;
}

class AutonomousTradingService {
  private generateId(): string {
    return `${Date.now().toString(36)}_${crypto.randomBytes(8).toString('hex')}`;
  }

  async getTradingProfile(userId: string) {
    const [profile] = await db.select()
      .from(tradingProfiles)
      .where(eq(tradingProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      const newProfile = {
        id: this.generateId(),
        userId,
        mode: 'observer' as const,
        maxPositionSizeUsd: '100',
        maxDailyLossUsd: '50',
        maxSimultaneousTrades: 3,
        minConfidenceThreshold: '0.65',
        killSwitchActive: false,
        killSwitchReason: null,
        fullAutoUnlocked: false,
        evaluatedOutcomesAtUnlock: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.insert(tradingProfiles).values(newProfile);
      return newProfile;
    }

    return profile;
  }

  async updateTradingProfile(userId: string, config: TradingProfileConfig) {
    const profile = await this.getTradingProfile(userId);

    if (config.mode === 'full_auto' && !profile.fullAutoUnlocked) {
      throw new Error('Full Auto mode is locked. Complete the milestone requirements first.');
    }

    await db.update(tradingProfiles)
      .set({
        ...config,
        updatedAt: new Date(),
      })
      .where(eq(tradingProfiles.userId, userId));

    return this.getTradingProfile(userId);
  }

  async setTradingMode(userId: string, mode: TradingMode) {
    const profile = await this.getTradingProfile(userId);

    if (mode === 'full_auto') {
      if (!profile.fullAutoUnlocked) {
        throw new Error('Full Auto mode requires 500 evaluated outcomes and manual unlock.');
      }
    }

    await db.update(tradingProfiles)
      .set({ mode, updatedAt: new Date() })
      .where(eq(tradingProfiles.userId, userId));

    console.log(`🎮 [AutonomousTrading] User ${userId} mode set to: ${mode}`);
    return this.getTradingProfile(userId);
  }

  async createTradeSuggestion(input: TradeSuggestionInput) {
    const profile = await this.getTradingProfile(input.userId);
    
    if (profile.killSwitchActive) {
      throw new Error('Kill switch is active. Trading is halted.');
    }

    const expiresAt = input.expiresInMinutes 
      ? new Date(Date.now() + input.expiresInMinutes * 60 * 1000)
      : new Date(Date.now() + 60 * 60 * 1000);

    const suggestion = {
      id: `sug_${this.generateId()}`,
      userId: input.userId,
      predictionId: input.predictionId || null,
      ticker: input.ticker.toUpperCase(),
      chain: input.chain || 'solana',
      signal: input.signal,
      confidence: input.confidence?.toString() || null,
      suggestedSizeUsd: input.suggestedSizeUsd || profile.maxPositionSizeUsd,
      entryPrice: input.entryPrice || null,
      rationale: input.rationale || null,
      status: 'pending' as const,
      expiresAt,
      approvedAt: null,
      rejectedAt: null,
      createdAt: new Date(),
    };

    await db.insert(tradeSuggestions).values(suggestion);
    console.log(`📊 [AutonomousTrading] Created suggestion ${suggestion.id} for ${input.ticker}`);

    return suggestion;
  }

  async getSuggestions(userId: string, status?: SuggestionStatus) {
    const baseQuery = db.select()
      .from(tradeSuggestions)
      .where(eq(tradeSuggestions.userId, userId))
      .orderBy(desc(tradeSuggestions.createdAt));

    if (status) {
      return db.select()
        .from(tradeSuggestions)
        .where(and(
          eq(tradeSuggestions.userId, userId),
          eq(tradeSuggestions.status, status)
        ))
        .orderBy(desc(tradeSuggestions.createdAt));
    }

    return baseQuery;
  }

  async getSuggestionById(suggestionId: string) {
    const [suggestion] = await db.select()
      .from(tradeSuggestions)
      .where(eq(tradeSuggestions.id, suggestionId))
      .limit(1);
    return suggestion;
  }

  async approveSuggestion(suggestionId: string) {
    const suggestion = await this.getSuggestionById(suggestionId);
    
    if (!suggestion) {
      throw new Error('Suggestion not found');
    }

    if (suggestion.status !== 'pending') {
      throw new Error(`Cannot approve suggestion with status: ${suggestion.status}`);
    }

    const profile = await this.getTradingProfile(suggestion.userId);
    if (profile.killSwitchActive) {
      throw new Error('Kill switch is active. Cannot approve trades.');
    }

    await db.update(tradeSuggestions)
      .set({ 
        status: 'approved', 
        approvedAt: new Date() 
      })
      .where(eq(tradeSuggestions.id, suggestionId));

    console.log(`✅ [AutonomousTrading] Suggestion ${suggestionId} approved`);
    return this.getSuggestionById(suggestionId);
  }

  async rejectSuggestion(suggestionId: string, reason?: string) {
    const suggestion = await this.getSuggestionById(suggestionId);
    
    if (!suggestion) {
      throw new Error('Suggestion not found');
    }

    if (suggestion.status !== 'pending') {
      throw new Error(`Cannot reject suggestion with status: ${suggestion.status}`);
    }

    await db.update(tradeSuggestions)
      .set({ 
        status: 'rejected', 
        rejectedAt: new Date(),
        rationale: reason ? `Rejected: ${reason}` : suggestion.rationale,
      })
      .where(eq(tradeSuggestions.id, suggestionId));

    console.log(`❌ [AutonomousTrading] Suggestion ${suggestionId} rejected`);
    return this.getSuggestionById(suggestionId);
  }

  async expireSuggestions() {
    const now = new Date();
    
    const result = await db.update(tradeSuggestions)
      .set({ status: 'expired' })
      .where(and(
        eq(tradeSuggestions.status, 'pending'),
        sql`${tradeSuggestions.expiresAt} < ${now}`
      ));

    console.log(`⏰ [AutonomousTrading] Expired pending suggestions`);
    return result;
  }

  async checkRiskLimits(userId: string, tradeSizeUsd: number): Promise<RiskCheckResult> {
    const profile = await this.getTradingProfile(userId);

    if (profile.killSwitchActive) {
      return { allowed: false, reason: 'Kill switch is active' };
    }

    const maxPosition = parseFloat(profile.maxPositionSizeUsd || '100');
    if (tradeSizeUsd > maxPosition) {
      return { allowed: false, reason: `Trade size $${tradeSizeUsd} exceeds max position $${maxPosition}` };
    }

    const openTrades = await db.select({ count: count() })
      .from(tradeExecutions)
      .where(and(
        eq(tradeExecutions.userId, userId),
        eq(tradeExecutions.status, 'open')
      ));

    const openCount = openTrades[0]?.count || 0;
    const maxTrades = profile.maxSimultaneousTrades || 3;
    if (openCount >= maxTrades) {
      return { allowed: false, reason: `Already have ${openCount} open trades (max: ${maxTrades})` };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [dailySnapshot] = await db.select()
      .from(dailyRiskSnapshots)
      .where(and(
        eq(dailyRiskSnapshots.userId, userId),
        gte(dailyRiskSnapshots.snapshotDate, todayStart)
      ))
      .orderBy(desc(dailyRiskSnapshots.createdAt))
      .limit(1);

    if (dailySnapshot) {
      const dailyLoss = parseFloat(dailySnapshot.realizedPnlUsd || '0');
      const maxDailyLoss = parseFloat(profile.maxDailyLossUsd || '50');
      
      if (dailyLoss < -maxDailyLoss) {
        return { allowed: false, reason: `Daily loss limit reached: $${Math.abs(dailyLoss).toFixed(2)} / $${maxDailyLoss}` };
      }
    }

    return { allowed: true };
  }

  async executeTrade(suggestionId: string, exchangeConnectionId?: string) {
    const suggestion = await this.getSuggestionById(suggestionId);
    
    if (!suggestion) {
      throw new Error('Suggestion not found');
    }

    if (suggestion.status !== 'approved') {
      throw new Error(`Cannot execute suggestion with status: ${suggestion.status}`);
    }

    const profile = await this.getTradingProfile(suggestion.userId);

    const riskCheck = await this.checkRiskLimits(
      suggestion.userId, 
      parseFloat(suggestion.suggestedSizeUsd || '0')
    );

    if (!riskCheck.allowed) {
      throw new Error(`Risk check failed: ${riskCheck.reason}`);
    }

    const side = suggestion.signal.includes('BUY') ? 'buy' : 'sell';

    let connectionId = exchangeConnectionId || null;
    let exchangeOrderId: string | null = null;
    let executionStatus: 'open' | 'failed' = 'open';
    let errorMessage: string | null = null;
    let actualEntryPrice = suggestion.entryPrice;

    if (!connectionId) {
      const [activeConnection] = await db.select()
        .from(exchangeConnections)
        .where(and(
          eq(exchangeConnections.userId, suggestion.userId),
          eq(exchangeConnections.isActive, true)
        ))
        .orderBy(desc(exchangeConnections.lastValidated))
        .limit(1);

      if (activeConnection) {
        connectionId = activeConnection.id;
      }
    }

    if (connectionId) {
      try {
        const sizeUsd = parseFloat(suggestion.suggestedSizeUsd || '0');
        const entryPrice = parseFloat(suggestion.entryPrice || '0');
        const quantity = entryPrice > 0 ? (sizeUsd / entryPrice).toString() : '0';

        const order = await exchangeService.createOrder(
          suggestion.userId,
          connectionId,
          {
            symbol: suggestion.ticker,
            side: side as 'buy' | 'sell',
            type: 'market',
            quantity,
          }
        );

        if (order) {
          exchangeOrderId = order.orderId;
          if (order.avgPrice) {
            actualEntryPrice = order.avgPrice;
          }
          console.log(`📈 [AutonomousTrading] Order placed on exchange: ${exchangeOrderId}`);
        } else {
          errorMessage = 'Exchange returned no order';
          console.warn(`⚠️ [AutonomousTrading] Exchange order failed: ${errorMessage}`);
        }
      } catch (error: any) {
        errorMessage = error.message;
        console.warn(`⚠️ [AutonomousTrading] Exchange execution error: ${error.message}`);
      }
    } else {
      console.log(`📝 [AutonomousTrading] No exchange connection - recording paper trade`);
    }

    const execution = {
      id: `exec_${this.generateId()}`,
      userId: suggestion.userId,
      suggestionId,
      exchangeConnectionId: connectionId,
      ticker: suggestion.ticker,
      chain: suggestion.chain,
      side,
      sizeUsd: suggestion.suggestedSizeUsd,
      entryPrice: actualEntryPrice,
      exitPrice: null,
      status: executionStatus,
      mode: profile.mode,
      realizedPnlUsd: null,
      realizedPnlPercent: null,
      exchangeOrderId,
      errorMessage,
      openedAt: new Date(),
      closedAt: null,
    };

    try {
      await db.insert(tradeExecutions).values(execution);

      await db.update(tradeSuggestions)
        .set({ status: 'executed' })
        .where(eq(tradeSuggestions.id, suggestionId));

      console.log(`🚀 [AutonomousTrading] Trade executed: ${execution.id} - ${side} ${suggestion.ticker}`);

      await this.updateDailySnapshot(suggestion.userId);

      return execution;
    } catch (error: any) {
      await db.update(tradeExecutions)
        .set({ 
          status: 'failed', 
          errorMessage: error.message 
        })
        .where(eq(tradeExecutions.id, execution.id));

      throw error;
    }
  }

  async closeTrade(executionId: string, exitPrice: string) {
    const [execution] = await db.select()
      .from(tradeExecutions)
      .where(eq(tradeExecutions.id, executionId))
      .limit(1);

    if (!execution) {
      throw new Error('Execution not found');
    }

    if (execution.status !== 'open') {
      throw new Error(`Cannot close trade with status: ${execution.status}`);
    }

    const entryPriceNum = parseFloat(execution.entryPrice || '0');
    const exitPriceNum = parseFloat(exitPrice);
    const sizeUsd = parseFloat(execution.sizeUsd || '0');

    let pnlPercent = 0;
    if (entryPriceNum > 0) {
      if (execution.side === 'buy') {
        pnlPercent = ((exitPriceNum - entryPriceNum) / entryPriceNum) * 100;
      } else {
        pnlPercent = ((entryPriceNum - exitPriceNum) / entryPriceNum) * 100;
      }
    }

    const pnlUsd = (sizeUsd * pnlPercent) / 100;

    await db.update(tradeExecutions)
      .set({
        exitPrice,
        status: 'closed',
        realizedPnlUsd: pnlUsd.toFixed(2),
        realizedPnlPercent: pnlPercent.toFixed(4),
        closedAt: new Date(),
      })
      .where(eq(tradeExecutions.id, executionId));

    console.log(`📉 [AutonomousTrading] Trade closed: ${executionId} - PnL: $${pnlUsd.toFixed(2)} (${pnlPercent.toFixed(2)}%)`);

    await this.updateDailySnapshot(execution.userId);

    return this.getTradeById(executionId);
  }

  async getTradeById(executionId: string) {
    const [execution] = await db.select()
      .from(tradeExecutions)
      .where(eq(tradeExecutions.id, executionId))
      .limit(1);
    return execution;
  }

  async getTradeHistory(userId: string, limit = 50) {
    return db.select()
      .from(tradeExecutions)
      .where(eq(tradeExecutions.userId, userId))
      .orderBy(desc(tradeExecutions.openedAt))
      .limit(limit);
  }

  async getOpenTrades(userId: string) {
    return db.select()
      .from(tradeExecutions)
      .where(and(
        eq(tradeExecutions.userId, userId),
        eq(tradeExecutions.status, 'open')
      ))
      .orderBy(desc(tradeExecutions.openedAt));
  }

  async triggerKillSwitch(userId: string, reason: string) {
    await db.update(tradingProfiles)
      .set({
        killSwitchActive: true,
        killSwitchReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(tradingProfiles.userId, userId));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    await db.insert(dailyRiskSnapshots).values({
      id: `risk_${this.generateId()}`,
      userId,
      snapshotDate: new Date(),
      killSwitchTriggered: true,
      killSwitchReason: reason,
      createdAt: new Date(),
    }).onConflictDoNothing();

    console.log(`🛑 [AutonomousTrading] KILL SWITCH ACTIVATED for user ${userId}: ${reason}`);

    return this.getTradingProfile(userId);
  }

  async resetKillSwitch(userId: string) {
    await db.update(tradingProfiles)
      .set({
        killSwitchActive: false,
        killSwitchReason: null,
        updatedAt: new Date(),
      })
      .where(eq(tradingProfiles.userId, userId));

    console.log(`🟢 [AutonomousTrading] Kill switch reset for user ${userId}`);
    return this.getTradingProfile(userId);
  }

  async updateDailySnapshot(userId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayTrades = await db.select()
      .from(tradeExecutions)
      .where(and(
        eq(tradeExecutions.userId, userId),
        gte(tradeExecutions.openedAt, todayStart)
      ));

    const openTrades = todayTrades.filter(t => t.status === 'open');
    const closedTrades = todayTrades.filter(t => t.status === 'closed');

    const totalExposure = openTrades.reduce((sum, t) => sum + parseFloat(t.sizeUsd || '0'), 0);
    const realizedPnl = closedTrades.reduce((sum, t) => sum + parseFloat(t.realizedPnlUsd || '0'), 0);

    const [existingSnapshot] = await db.select()
      .from(dailyRiskSnapshots)
      .where(and(
        eq(dailyRiskSnapshots.userId, userId),
        gte(dailyRiskSnapshots.snapshotDate, todayStart)
      ))
      .limit(1);

    if (existingSnapshot) {
      await db.update(dailyRiskSnapshots)
        .set({
          totalExposureUsd: totalExposure.toString(),
          realizedPnlUsd: realizedPnl.toString(),
          tradesExecuted: todayTrades.length,
        })
        .where(eq(dailyRiskSnapshots.id, existingSnapshot.id));
    } else {
      await db.insert(dailyRiskSnapshots).values({
        id: `risk_${this.generateId()}`,
        userId,
        snapshotDate: todayStart,
        totalExposureUsd: totalExposure.toString(),
        realizedPnlUsd: realizedPnl.toString(),
        tradesExecuted: todayTrades.length,
        createdAt: new Date(),
      });
    }
  }

  async checkFullAutoMilestone() {
    const REQUIRED_OUTCOMES = 500;
    const MILESTONE_NAME = 'full_auto_unlock';

    const [milestone] = await db.select()
      .from(tradingMilestones)
      .where(eq(tradingMilestones.milestoneName, MILESTONE_NAME))
      .limit(1);

    const evaluatedCount = await db.select({ count: count() })
      .from(predictionEvents)
      .where(eq(predictionEvents.status, 'evaluated'));

    const currentCount = evaluatedCount[0]?.count || 0;

    if (milestone) {
      await db.update(tradingMilestones)
        .set({
          currentValue: currentCount,
          isCompleted: currentCount >= REQUIRED_OUTCOMES,
          completedAt: currentCount >= REQUIRED_OUTCOMES && !milestone.isCompleted ? new Date() : milestone.completedAt,
          updatedAt: new Date(),
        })
        .where(eq(tradingMilestones.id, milestone.id));
    } else {
      await db.insert(tradingMilestones).values({
        id: `mile_${this.generateId()}`,
        milestoneName: MILESTONE_NAME,
        targetValue: REQUIRED_OUTCOMES,
        currentValue: currentCount,
        isCompleted: currentCount >= REQUIRED_OUTCOMES,
        completedAt: currentCount >= REQUIRED_OUTCOMES ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`📈 [AutonomousTrading] Milestone check: ${currentCount}/${REQUIRED_OUTCOMES} evaluated outcomes`);

    return {
      milestoneName: MILESTONE_NAME,
      targetValue: REQUIRED_OUTCOMES,
      currentValue: currentCount,
      isCompleted: currentCount >= REQUIRED_OUTCOMES,
      progress: Math.min(100, (currentCount / REQUIRED_OUTCOMES) * 100).toFixed(1),
    };
  }

  async getMilestones() {
    return db.select()
      .from(tradingMilestones)
      .orderBy(desc(tradingMilestones.createdAt));
  }

  async unlockFullAuto(userId: string) {
    const milestone = await this.checkFullAutoMilestone();
    
    if (!milestone.isCompleted) {
      throw new Error(`Cannot unlock Full Auto. Need ${milestone.targetValue - milestone.currentValue} more evaluated outcomes.`);
    }

    await db.update(tradingProfiles)
      .set({
        fullAutoUnlocked: true,
        evaluatedOutcomesAtUnlock: milestone.currentValue,
        updatedAt: new Date(),
      })
      .where(eq(tradingProfiles.userId, userId));

    console.log(`🔓 [AutonomousTrading] Full Auto unlocked for user ${userId}`);
    return this.getTradingProfile(userId);
  }

  async getHighConfidencePredictions(minConfidence = 0.65, limit = 10) {
    const recentPredictions = await db.select()
      .from(predictionEvents)
      .where(and(
        eq(predictionEvents.status, 'stamped'),
        sql`${predictionEvents.confidence} IN ('HIGH', 'MEDIUM')`
      ))
      .orderBy(desc(predictionEvents.createdAt))
      .limit(limit);

    return recentPredictions;
  }

  async checkDailyLossLimits() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const profiles = await db.select().from(tradingProfiles);
    const alerts: Array<{ userId: string; dailyLoss: number; maxLoss: number }> = [];

    for (const profile of profiles) {
      if (profile.killSwitchActive) continue;

      const [snapshot] = await db.select()
        .from(dailyRiskSnapshots)
        .where(and(
          eq(dailyRiskSnapshots.userId, profile.userId),
          gte(dailyRiskSnapshots.snapshotDate, todayStart)
        ))
        .limit(1);

      if (snapshot) {
        const dailyLoss = parseFloat(snapshot.realizedPnlUsd || '0');
        const maxLoss = parseFloat(profile.maxDailyLossUsd || '50');

        if (dailyLoss < -maxLoss) {
          await this.triggerKillSwitch(profile.userId, `Daily loss limit exceeded: $${Math.abs(dailyLoss).toFixed(2)}`);
          alerts.push({ userId: profile.userId, dailyLoss: Math.abs(dailyLoss), maxLoss });
        }
      }
    }

    return alerts;
  }

  async getActiveProfiles() {
    return db.select()
      .from(tradingProfiles)
      .where(sql`${tradingProfiles.mode} != 'observer'`);
  }
}

export const autonomousTradingService = new AutonomousTradingService();
