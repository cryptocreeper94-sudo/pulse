import { db } from '../../db/client.js';
import { predictionEvents, predictionOutcomes, predictionModelVersions, strikeagentPredictions, strikeagentOutcomes } from '../../db/schema';
import { desc, gte, lte, sql, and, eq } from 'drizzle-orm';
import { predictionLearningService } from '../../services/predictionLearningService';

export const mlRoutes = [
  {
    path: "/api/ml/user-history",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
        const offset = parseInt(c.req.query('offset') || '0');

        const countResult = await db.select({ count: sql<number>`count(*)` })
          .from(predictionEvents)
          .where(userId ? eq(predictionEvents.userId, userId) : undefined);
        const totalCount = Number(countResult[0]?.count || 0);
        
        let paginatedPredictions;
        if (userId) {
          paginatedPredictions = await db.select()
            .from(predictionEvents)
            .where(eq(predictionEvents.userId, userId))
            .orderBy(desc(predictionEvents.createdAt))
            .limit(limit)
            .offset(offset);
        } else {
          paginatedPredictions = await db.select()
            .from(predictionEvents)
            .orderBy(desc(predictionEvents.createdAt))
            .limit(limit)
            .offset(offset);
        }
        
        const allOutcomes = await db.select().from(predictionOutcomes);
        const outcomesByPrediction: Record<string, Record<string, { isCorrect: boolean; priceChangePercent: string }>> = {};
        
        for (const outcome of allOutcomes) {
          if (!outcomesByPrediction[outcome.predictionId]) {
            outcomesByPrediction[outcome.predictionId] = {};
          }
          outcomesByPrediction[outcome.predictionId][outcome.horizon] = {
            isCorrect: outcome.isCorrect,
            priceChangePercent: outcome.priceChangePercent
          };
        }
        
        const predictions = paginatedPredictions.map((p: any) => {
          const horizons = ['1h', '4h', '24h', '7d'];
          const outcomes: Record<string, string> = {};
          
          for (const h of horizons) {
            const outcomeData = outcomesByPrediction[p.id]?.[h];
            if (outcomeData) {
              outcomes[h] = outcomeData.isCorrect ? 'correct' : 'incorrect';
            } else {
              outcomes[h] = 'pending';
            }
          }
          
          return {
            id: p.id,
            ticker: p.ticker,
            signal: p.signal,
            confidence: p.confidence,
            price: p.priceAtPrediction,
            createdAt: p.createdAt,
            outcomes
          };
        });
        
        const horizons = ['1h', '4h', '24h', '7d'];
        const accuracyByHorizon: Record<string, { total: number; correct: number; accuracy: string }> = {};
        
        for (const h of horizons) {
          const relevantOutcomes = allOutcomes.filter((o: any) => o.horizon === h);
          const correct = relevantOutcomes.filter((o: any) => o.isCorrect).length;
          accuracyByHorizon[h] = {
            total: relevantOutcomes.length,
            correct,
            accuracy: relevantOutcomes.length > 0 
              ? ((correct / relevantOutcomes.length) * 100).toFixed(1) 
              : '0'
          };
        }
        
        return c.json({
          predictions,
          pagination: {
            total: totalCount,
            limit,
            offset,
            hasMore: offset + limit < totalCount
          },
          summary: {
            totalPredictions: totalCount,
            accuracyByHorizon
          }
        });
      } catch (error: any) {
        logger?.error('❌ [MLStats] Error fetching user history', { error: error.message });
        return c.json({
          predictions: [],
          pagination: { total: 0, limit: 20, offset: 0, hasMore: false },
          summary: { totalPredictions: 0, accuracyByHorizon: {} }
        });
      }
    }
  },
  {
    path: "/api/ml/stats",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const predictions = await db.select().from(predictionEvents);
        const outcomes = await db.select().from(predictionOutcomes);

        const buySignals = predictions.filter((p: any) => 
          p.signal === 'BUY' || p.signal === 'STRONG_BUY'
        ).length;
        const sellSignals = predictions.filter((p: any) => 
          p.signal === 'SELL' || p.signal === 'STRONG_SELL'
        ).length;
        const holdSignals = predictions.filter((p: any) => 
          p.signal === 'HOLD' || p.signal === 'NEUTRAL'
        ).length;

        const horizons = ['1h', '4h', '24h', '7d'];
        const outcomesByHorizon: Record<string, { total: number; correct: number; winRate: string }> = {};

        for (const h of horizons) {
          const hOutcomes = outcomes.filter((o: any) => o.horizon === h);
          const correct = hOutcomes.filter((o: any) => o.isCorrect).length;
          outcomesByHorizon[h] = {
            total: hOutcomes.length,
            correct,
            winRate: hOutcomes.length > 0 ? ((correct / hOutcomes.length) * 100).toFixed(1) : '0',
          };
        }

        const recentPredictions = await db.select()
          .from(predictionEvents)
          .orderBy(desc(predictionEvents.createdAt))
          .limit(10);

        return c.json({
          totalPredictions: predictions.length,
          buySignals,
          sellSignals,
          holdSignals,
          outcomesByHorizon,
          recentPredictions: recentPredictions.map((p: any) => ({
            id: p.id,
            ticker: p.ticker,
            signalType: p.signalType,
            confidence: p.confidence,
            price: p.price,
            createdAt: p.createdAt
          }))
        });
      } catch (error: any) {
        logger?.error('❌ [MLStats] Error fetching stats', { error: error.message });
        return c.json({ 
          totalPredictions: 0,
          buySignals: 0,
          sellSignals: 0,
          holdSignals: 0,
          outcomesByHorizon: {},
          recentPredictions: []
        });
      }
    }
  },
  {
    path: "/api/ml/model-status",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const allModels = await db.select()
          .from(predictionModelVersions)
          .orderBy(desc(predictionModelVersions.trainedAt));
        
        const activeModels = allModels.filter((m: any) => m.isActive);
        
        return c.json({
          activeModels: activeModels.length,
          totalModels: allModels.length,
          models: allModels.map((m: any) => ({
            id: m.id,
            ticker: m.ticker,
            horizon: m.horizon,
            accuracy: m.validationAccuracy,
            isActive: m.isActive,
            trainedAt: m.trainedAt,
            sampleCount: m.trainingSampleCount
          }))
        });
      } catch (error: any) {
        logger?.error('❌ [MLStats] Error fetching model status', { error: error.message });
        return c.json({ 
          activeModels: 0,
          totalModels: 0,
          models: []
        });
      }
    }
  },
  {
    path: "/api/ml/api-usage",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const monthlyPredictions = await db.select({ count: sql<number>`count(*)` })
          .from(predictionEvents)
          .where(gte(predictionEvents.createdAt, startOfMonth));
        
        const dailyPredictions = await db.select({ count: sql<number>`count(*)` })
          .from(predictionEvents)
          .where(gte(predictionEvents.createdAt, startOfDay));

        let monthlyTokenScans = 0;
        let dailyTokenScans = 0;
        try {
          const monthlyScans = await db.select({ count: sql<number>`count(*)` })
            .from(strikeagentPredictions)
            .where(gte(strikeagentPredictions.createdAt, startOfMonth));
          monthlyTokenScans = Number(monthlyScans[0]?.count || 0);
          
          const dailyScans = await db.select({ count: sql<number>`count(*)` })
            .from(strikeagentPredictions)
            .where(gte(strikeagentPredictions.createdAt, startOfDay));
          dailyTokenScans = Number(dailyScans[0]?.count || 0);
        } catch (e) {
        }

        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dayOfMonth = now.getDate();
        
        const outcomeChecksPerHour = 2;
        const hoursThisMonth = dayOfMonth * 24;
        const estimatedOutcomeChecks = hoursThisMonth * outcomeChecksPerHour;
        
        const monthlyPredCount = Number(monthlyPredictions[0]?.count || 0);
        const dailyPredCount = Number(dailyPredictions[0]?.count || 0);
        
        const coingeckoCallsMonthly = monthlyPredCount + monthlyTokenScans + estimatedOutcomeChecks;
        const coingeckoCallsDaily = dailyPredCount + dailyTokenScans + (24 * outcomeChecksPerHour);
        
        const heliusCallsMonthly = monthlyTokenScans * 3;
        const heliusCallsDaily = dailyTokenScans * 3;

        const coingeckoLimit = 500000;
        const heliusFreeLimit = 100000;
        
        return c.json({
          period: {
            month: now.toLocaleString('default', { month: 'long' }),
            year: now.getFullYear(),
            dayOfMonth,
            daysInMonth
          },
          coingecko: {
            callsToday: coingeckoCallsDaily,
            callsThisMonth: coingeckoCallsMonthly,
            monthlyLimit: coingeckoLimit,
            percentUsed: ((coingeckoCallsMonthly / coingeckoLimit) * 100).toFixed(2),
            estimatedMonthlyCost: '$0',
            status: coingeckoCallsMonthly < coingeckoLimit * 0.8 ? 'healthy' : 'warning'
          },
          helius: {
            callsToday: heliusCallsDaily,
            callsThisMonth: heliusCallsMonthly,
            monthlyLimit: heliusFreeLimit,
            percentUsed: ((heliusCallsMonthly / heliusFreeLimit) * 100).toFixed(2),
            estimatedMonthlyCost: heliusCallsMonthly < heliusFreeLimit ? '$0 (free tier)' : '~$49/mo',
            status: heliusCallsMonthly < heliusFreeLimit * 0.8 ? 'healthy' : 'warning'
          },
          breakdown: {
            predictions: monthlyPredCount,
            tokenScans: monthlyTokenScans,
            outcomeChecks: estimatedOutcomeChecks
          },
          summary: {
            totalApiCalls: coingeckoCallsMonthly + heliusCallsMonthly,
            estimatedTotalCost: heliusCallsMonthly < heliusFreeLimit ? '$0/month' : '~$49/month'
          }
        });
      } catch (error: any) {
        logger?.error('❌ [MLStats] Error fetching API usage', { error: error.message });
        return c.json({
          period: { month: 'Unknown', year: 2025, dayOfMonth: 1, daysInMonth: 30 },
          coingecko: { callsToday: 0, callsThisMonth: 0, monthlyLimit: 500000, percentUsed: '0', estimatedMonthlyCost: '$0', status: 'unknown' },
          helius: { callsToday: 0, callsThisMonth: 0, monthlyLimit: 100000, percentUsed: '0', estimatedMonthlyCost: '$0', status: 'unknown' },
          breakdown: { predictions: 0, tokenScans: 0, outcomeChecks: 0 },
          summary: { totalApiCalls: 0, estimatedTotalCost: '$0/month' }
        });
      }
    }
  },
  {
    path: "/api/ml/accuracy-trends",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        const allOutcomes = await db.select().from(predictionOutcomes);
        
        const currentWeekOutcomes = allOutcomes.filter((o: any) => 
          new Date(o.checkedAt) >= oneWeekAgo
        );
        const previousWeekOutcomes = allOutcomes.filter((o: any) => 
          new Date(o.checkedAt) >= twoWeeksAgo && new Date(o.checkedAt) < oneWeekAgo
        );
        
        const calculateWinRate = (outcomes: any[]) => {
          if (outcomes.length === 0) return null;
          const correct = outcomes.filter((o: any) => o.isCorrect).length;
          return (correct / outcomes.length) * 100;
        };
        
        const horizons = ['1h', '4h', '24h', '7d'];
        const trendsByHorizon: Record<string, any> = {};
        
        for (const h of horizons) {
          const currentH = currentWeekOutcomes.filter((o: any) => o.horizon === h);
          const previousH = previousWeekOutcomes.filter((o: any) => o.horizon === h);
          
          const currentRate = calculateWinRate(currentH);
          const previousRate = calculateWinRate(previousH);
          
          let delta = null;
          let trend = 'neutral';
          if (currentRate !== null && previousRate !== null) {
            delta = currentRate - previousRate;
            trend = delta > 0 ? 'improving' : delta < 0 ? 'declining' : 'stable';
          } else if (currentRate !== null && previousRate === null) {
            trend = 'new';
          }
          
          trendsByHorizon[h] = {
            currentWinRate: currentRate !== null ? currentRate.toFixed(1) : null,
            previousWinRate: previousRate !== null ? previousRate.toFixed(1) : null,
            delta: delta !== null ? delta.toFixed(1) : null,
            trend,
            currentSamples: currentH.length,
            previousSamples: previousH.length
          };
        }
        
        const overallCurrentRate = calculateWinRate(currentWeekOutcomes);
        const overallPreviousRate = calculateWinRate(previousWeekOutcomes);
        let overallDelta = null;
        let overallTrend = 'neutral';
        if (overallCurrentRate !== null && overallPreviousRate !== null) {
          overallDelta = overallCurrentRate - overallPreviousRate;
          overallTrend = overallDelta > 0 ? 'improving' : overallDelta < 0 ? 'declining' : 'stable';
        } else if (overallCurrentRate !== null) {
          overallTrend = 'new';
        }

        let saCurrentRate = null;
        let saPreviousRate = null;
        let saDelta = null;
        let saTrend = 'neutral';
        let saCurrentSamples = 0;
        let saPreviousSamples = 0;
        
        try {
          const saOutcomes = await db.select().from(strikeagentOutcomes);
          const saCurrentWeek = saOutcomes.filter((o: any) => 
            new Date(o.checkedAt) >= oneWeekAgo
          );
          const saPreviousWeek = saOutcomes.filter((o: any) => 
            new Date(o.checkedAt) >= twoWeeksAgo && new Date(o.checkedAt) < oneWeekAgo
          );
          
          saCurrentRate = calculateWinRate(saCurrentWeek);
          saPreviousRate = calculateWinRate(saPreviousWeek);
          saCurrentSamples = saCurrentWeek.length;
          saPreviousSamples = saPreviousWeek.length;
          
          if (saCurrentRate !== null && saPreviousRate !== null) {
            saDelta = saCurrentRate - saPreviousRate;
            saTrend = saDelta > 0 ? 'improving' : saDelta < 0 ? 'declining' : 'stable';
          } else if (saCurrentRate !== null) {
            saTrend = 'new';
          }
        } catch (e) {
        }
        
        return c.json({
          technicalAnalysis: {
            overall: {
              currentWinRate: overallCurrentRate !== null ? overallCurrentRate.toFixed(1) : null,
              previousWinRate: overallPreviousRate !== null ? overallPreviousRate.toFixed(1) : null,
              delta: overallDelta !== null ? overallDelta.toFixed(1) : null,
              trend: overallTrend,
              currentSamples: currentWeekOutcomes.length,
              previousSamples: previousWeekOutcomes.length
            },
            byHorizon: trendsByHorizon
          },
          strikeAgent: {
            currentWinRate: saCurrentRate !== null ? saCurrentRate.toFixed(1) : null,
            previousWinRate: saPreviousRate !== null ? saPreviousRate.toFixed(1) : null,
            delta: saDelta !== null ? saDelta.toFixed(1) : null,
            trend: saTrend,
            currentSamples: saCurrentSamples,
            previousSamples: saPreviousSamples
          },
          period: {
            currentWeekStart: oneWeekAgo.toISOString(),
            previousWeekStart: twoWeeksAgo.toISOString(),
            now: now.toISOString()
          }
        });
      } catch (error: any) {
        logger?.error('❌ [MLStats] Error fetching accuracy trends', { error: error.message });
        return c.json({
          technicalAnalysis: { overall: { currentWinRate: null, trend: 'unknown' }, byHorizon: {} },
          strikeAgent: { currentWinRate: null, trend: 'unknown' },
          period: {}
        });
      }
    }
  },
  {
    path: "/api/ml/drift-status",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const windowDays = parseInt(c.req.query('windowDays') || '7');
        const driftStatus = await predictionLearningService.checkAllHorizonsDrift(windowDays);
        
        return c.json({
          success: true,
          ...driftStatus,
          checkedAt: new Date().toISOString()
        });
      } catch (error: any) {
        logger?.error('❌ [MLStats] Error checking drift status', { error: error.message });
        return c.json({
          success: false,
          hasAnyDrift: false,
          horizonStatus: {},
          overallRecommendation: 'Unable to check drift status',
          checkedAt: new Date().toISOString()
        });
      }
    }
  }
];
