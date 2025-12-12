import { db } from '../../db/client.js';
import { predictionEvents, predictionOutcomes, predictionModelVersions, strikeagentPredictions } from '../../db/schema';
import { desc, gte, sql } from 'drizzle-orm';

export const mlRoutes = [
  {
    path: "/api/ml/stats",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const predictions = await db.select().from(predictionEvents);
        const outcomes = await db.select().from(predictionOutcomes);

        const buySignals = predictions.filter((p: any) => 
          p.signalType === 'BUY' || p.signalType === 'STRONG_BUY'
        ).length;
        const sellSignals = predictions.filter((p: any) => 
          p.signalType === 'SELL' || p.signalType === 'STRONG_SELL'
        ).length;
        const holdSignals = predictions.filter((p: any) => 
          p.signalType === 'HOLD' || p.signalType === 'NEUTRAL'
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
    method: "GET",
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
    method: "GET",
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
  }
];
