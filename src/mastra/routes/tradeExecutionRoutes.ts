import { tradeExecutionService, SignalEvaluation } from '../../services/tradeExecutionService';
import { autoTradeService } from '../../services/autoTradeService';

export const tradeExecutionRoutes = [
  {
    path: "/api/trade-execution/evaluate",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { userId, signal } = body;

        if (!userId || !signal) {
          return c.json({ error: 'userId and signal are required' }, 400);
        }

        const decision = await tradeExecutionService.evaluateSignal(userId, signal);
        return c.json({ success: true, decision });
      } catch (error: any) {
        logger?.error('❌ [TradeExecution] Error evaluating signal', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  {
    path: "/api/trade-execution/evaluate-ml",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { 
          userId, 
          tokenAddress, 
          tokenSymbol, 
          currentPrice, 
          indicators, 
          chain = 'solana',
          horizon = '24h'
        } = body;

        if (!userId || !tokenAddress || !tokenSymbol || !currentPrice || !indicators) {
          return c.json({ 
            error: 'userId, tokenAddress, tokenSymbol, currentPrice, and indicators are required' 
          }, 400);
        }

        const decision = await tradeExecutionService.processMLPrediction(
          userId,
          tokenAddress,
          tokenSymbol,
          currentPrice,
          indicators,
          chain,
          horizon
        );

        return c.json({ success: true, decision });
      } catch (error: any) {
        logger?.error('❌ [TradeExecution] Error evaluating ML prediction', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  {
    path: "/api/trade-execution/position-check",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');

        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }

        const config = await autoTradeService.getConfig(userId);
        const positionCheck = await tradeExecutionService.checkPositionLimits(userId, config);

        return c.json({ success: true, positionCheck });
      } catch (error: any) {
        logger?.error('❌ [TradeExecution] Error checking positions', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  {
    path: "/api/trade-execution/active-users",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const activeConfigs = await tradeExecutionService.getActiveUsersForAutoTrade();

        return c.json({ 
          success: true, 
          count: activeConfigs.length,
          users: activeConfigs.map(cfg => ({
            userId: cfg.userId,
            mode: cfg.mode,
            confidenceThreshold: cfg.confidenceThreshold,
            accuracyThreshold: cfg.accuracyThreshold,
          }))
        });
      } catch (error: any) {
        logger?.error('❌ [TradeExecution] Error fetching active users', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  {
    path: "/api/trade-execution/bulk-evaluate",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { signals } = body;

        if (!signals || !Array.isArray(signals) || signals.length === 0) {
          return c.json({ error: 'signals array is required' }, 400);
        }

        const results = await tradeExecutionService.evaluateBulkSignals(signals);

        const resultsObj: Record<string, any> = {};
        results.forEach((decisions, userId) => {
          resultsObj[userId] = decisions;
        });

        return c.json({ success: true, results: resultsObj });
      } catch (error: any) {
        logger?.error('❌ [TradeExecution] Error in bulk evaluation', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
];
