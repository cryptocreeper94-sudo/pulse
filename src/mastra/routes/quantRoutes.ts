import { db } from '../../db/client.js';
import { quantScanConfig, quantTradeSessions, quantTradeActions, quantLearningMetrics, strikeAgentSignals, strikeagentOutcomes } from '../../db/schema';
import { desc, eq, and, gte, sql, inArray, count } from 'drizzle-orm';
import { SUPPORTED_CHAINS } from '../../services/topSignalsService.js';
import { ChainId } from '../../services/multiChainProvider.js';

const QUANT_PIN = process.env.QUANT_PIN || '0424';

export const quantRoutes = [
  {
    path: "/api/quant/metrics",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const metrics = await db.select()
          .from(quantLearningMetrics)
          .orderBy(desc(quantLearningMetrics.periodStart))
          .limit(30);

        const totals = metrics.reduce((acc, m) => ({
          totalScans: acc.totalScans + (m.totalScans || 0),
          totalTokens: acc.totalTokens + (m.totalTokensAnalyzed || 0),
          signalsGenerated: acc.signalsGenerated + (m.signalsGenerated || 0),
          totalTrades: acc.totalTrades + (m.totalTrades || 0),
          winningTrades: acc.winningTrades + (m.winningTrades || 0),
        }), { totalScans: 0, totalTokens: 0, signalsGenerated: 0, totalTrades: 0, winningTrades: 0 });

        // Get real prediction accuracy from strikeagent_outcomes table
        let realAccuracy = '0';
        try {
          const outcomeStats = await db.execute(sql`
            SELECT 
              COUNT(*) as total_outcomes,
              COUNT(CASE WHEN is_correct = true THEN 1 END) as correct_count
            FROM strikeagent_outcomes
          `) as any;
          const stats = outcomeStats.rows?.[0] || (Array.isArray(outcomeStats) ? outcomeStats[0] : null);
          if (stats) {
            const total = parseInt(String(stats.total_outcomes)) || 0;
            const correct = parseInt(String(stats.correct_count)) || 0;
            if (total > 0) {
              realAccuracy = ((correct / total) * 100).toFixed(1);
            }
          }
        } catch (e) {
          // Fall back to stored model accuracy
          realAccuracy = metrics[0]?.modelAccuracy || '0';
        }

        const winRate = totals.totalTrades > 0 
          ? ((totals.winningTrades / totals.totalTrades) * 100).toFixed(1)
          : realAccuracy; // Use prediction accuracy if no trades

        return c.json({
          totalScans: totals.totalScans,
          totalTokensAnalyzed: totals.totalTokens,
          signalsGenerated: totals.signalsGenerated,
          tradesExecuted: totals.totalTrades,
          winRate,
          modelAccuracy: realAccuracy,
          recentMetrics: metrics.slice(0, 7).map(m => ({
            date: m.periodStart,
            scans: m.totalScans,
            tokens: m.totalTokensAnalyzed,
            signals: m.signalsGenerated,
          }))
        });
      } catch (error: any) {
        logger?.error('❌ [QuantMetrics] Error fetching metrics', { error: error.message });
        return c.json({
          totalScans: 0,
          totalTokensAnalyzed: 0,
          signalsGenerated: 0,
          tradesExecuted: 0,
          winRate: '0',
          modelAccuracy: '0',
          recentMetrics: []
        });
      }
    }
  },
  {
    path: "/api/quant/trade-feed",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const recentTrades = await db.select()
          .from(quantTradeActions)
          .orderBy(desc(quantTradeActions.executedAt))
          .limit(20);

        return c.json({
          trades: recentTrades.map(t => ({
            id: t.id,
            type: t.actionType,
            tokenSymbol: t.tokenSymbol,
            tokenAddress: t.tokenAddress,
            priceUsd: t.priceAtAction,
            amountSol: t.amountSol,
            pnlPercent: t.pnlPercent,
            pnlUsd: t.pnlUsd,
            executedAt: t.executedAt,
            status: t.status,
          }))
        });
      } catch (error: any) {
        logger?.error('❌ [QuantTradeFeed] Error fetching trades', { error: error.message });
        return c.json({ trades: [] });
      }
    }
  },
  {
    path: "/api/quant/scan-config",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const configs = await db.select().from(quantScanConfig);
        return c.json({ configs });
      } catch (error: any) {
        return c.json({ configs: [] });
      }
    }
  },
  {
    path: "/api/quant/scan-config",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { pin, category, chains, enabled, scanIntervalMinutes, minLiquidityUsd, minMarketCapUsd, maxMarketCapUsd, minSafetyScore, minCompositeScore } = body;

        if (pin !== QUANT_PIN) {
          return c.json({ error: 'Invalid PIN' }, 403);
        }

        // Validate chains if provided
        let chainsJson: string | null = null;
        if (chains && Array.isArray(chains)) {
          const validChains = chains.filter(c => SUPPORTED_CHAINS.includes(c));
          if (validChains.length > 0) {
            chainsJson = JSON.stringify(validChains);
          }
        }

        const existing = await db.select()
          .from(quantScanConfig)
          .where(eq(quantScanConfig.category, category))
          .limit(1);

        const now = new Date();
        if (existing.length > 0) {
          await db.update(quantScanConfig)
            .set({
              chains: chainsJson ?? existing[0].chains,
              enabled: enabled ?? existing[0].enabled,
              scanIntervalMinutes: scanIntervalMinutes ?? existing[0].scanIntervalMinutes,
              minLiquidityUsd: minLiquidityUsd ?? existing[0].minLiquidityUsd,
              minMarketCapUsd: minMarketCapUsd ?? existing[0].minMarketCapUsd,
              maxMarketCapUsd: maxMarketCapUsd ?? existing[0].maxMarketCapUsd,
              minSafetyScore: minSafetyScore ?? existing[0].minSafetyScore,
              minCompositeScore: minCompositeScore ?? existing[0].minCompositeScore,
              updatedAt: now,
            })
            .where(eq(quantScanConfig.id, existing[0].id));

          return c.json({ success: true, updated: true });
        } else {
          const id = `qsc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
          await db.insert(quantScanConfig).values({
            id,
            userId: 'system',
            category,
            chains: chainsJson ?? JSON.stringify(SUPPORTED_CHAINS),
            enabled: enabled ?? true,
            scanIntervalMinutes: scanIntervalMinutes ?? 5,
            minLiquidityUsd: minLiquidityUsd?.toString() ?? '5000',
            minMarketCapUsd: minMarketCapUsd?.toString() ?? '10000',
            maxMarketCapUsd: maxMarketCapUsd?.toString() ?? null,
            minSafetyScore: minSafetyScore ?? 50,
            minCompositeScore: minCompositeScore ?? 60,
            createdAt: now,
            updatedAt: now,
          });

          return c.json({ success: true, created: true });
        }
      } catch (error: any) {
        logger?.error('❌ [QuantScanConfig] Error updating config', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  {
    path: "/api/quant/sessions",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const sessions = await db.select()
          .from(quantTradeSessions)
          .orderBy(desc(quantTradeSessions.startedAt))
          .limit(10);

        return c.json({ sessions });
      } catch (error: any) {
        return c.json({ sessions: [] });
      }
    }
  },
  {
    path: "/api/quant/signals",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const chain = c.req.query('chain') as ChainId | 'all' | undefined;
        const category = c.req.query('category') as string | undefined;
        const limit = parseInt(c.req.query('limit') || '20');

        // Build conditions based on filters
        const conditions = [];
        if (chain && chain !== 'all') {
          conditions.push(eq(strikeAgentSignals.chain, chain));
        }
        if (category) {
          conditions.push(eq(strikeAgentSignals.category, category));
        }

        const signals = conditions.length > 0
          ? await db.select()
              .from(strikeAgentSignals)
              .where(conditions.length > 1 ? and(...conditions) : conditions[0])
              .orderBy(desc(strikeAgentSignals.compositeScore))
              .limit(Math.min(limit, 100))
          : await db.select()
              .from(strikeAgentSignals)
              .orderBy(desc(strikeAgentSignals.compositeScore))
              .limit(Math.min(limit, 100));

        // Get chain distribution
        const chainCounts = await db.select({
          chain: strikeAgentSignals.chain,
          count: sql<number>`count(*)::int`,
        })
          .from(strikeAgentSignals)
          .groupBy(strikeAgentSignals.chain);

        return c.json({
          signals: signals.map(s => ({
            id: s.id,
            tokenAddress: s.tokenAddress,
            tokenSymbol: s.tokenSymbol,
            tokenName: s.tokenName,
            chain: s.chain,
            priceUsd: s.priceUsd,
            marketCapUsd: s.marketCapUsd,
            liquidityUsd: s.liquidityUsd,
            compositeScore: s.compositeScore,
            technicalScore: s.technicalScore,
            safetyScore: s.safetyScore,
            momentumScore: s.momentumScore,
            reasoning: s.reasoning,
            rank: s.rank,
            category: s.category,
            dex: s.dex,
            createdAt: s.createdAt,
          })),
          chainDistribution: chainCounts.reduce((acc, c) => {
            acc[c.chain] = c.count;
            return acc;
          }, {} as Record<string, number>),
          supportedChains: SUPPORTED_CHAINS,
          total: signals.length,
        });
      } catch (error: any) {
        logger?.error('❌ [QuantSignals] Error fetching signals', { error: error.message });
        return c.json({ signals: [], chainDistribution: {}, supportedChains: SUPPORTED_CHAINS, total: 0 });
      }
    }
  },
  {
    path: "/api/quant/chains",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      return c.json({
        chains: SUPPORTED_CHAINS.map(chain => ({
          id: chain,
          name: chain === 'solana' ? 'Solana' :
                chain === 'ethereum' ? 'Ethereum' :
                chain === 'base' ? 'Base' :
                chain === 'polygon' ? 'Polygon' :
                chain === 'arbitrum' ? 'Arbitrum' :
                chain === 'bsc' ? 'BNB Chain' : chain,
          symbol: chain === 'solana' ? 'SOL' :
                  chain === 'ethereum' ? 'ETH' :
                  chain === 'base' ? 'ETH' :
                  chain === 'polygon' ? 'MATIC' :
                  chain === 'arbitrum' ? 'ETH' :
                  chain === 'bsc' ? 'BNB' : String(chain).toUpperCase(),
        })),
      });
    }
  },
];
