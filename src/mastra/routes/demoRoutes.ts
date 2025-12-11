import { demoTradeService, DemoPortfolio } from '../../services/demoTradeService';

const demoSessions = new Map<string, DemoPortfolio>();

function getOrCreatePortfolio(sessionId: string): DemoPortfolio {
  if (!demoSessions.has(sessionId)) {
    demoSessions.set(sessionId, demoTradeService.initializePortfolio(sessionId));
  }
  return demoSessions.get(sessionId)!;
}

export const demoRoutes = [
  {
    path: "/api/demo/portfolio/:sessionId",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const sessionId = c.req.param('sessionId');
      const portfolio = getOrCreatePortfolio(sessionId);
      const totalValue = demoTradeService.getPortfolioValue(portfolio);
      
      return c.json({
        success: true,
        portfolio,
        totalValue,
        pnlPercent: ((totalValue - portfolio.initialBalanceSol) / portfolio.initialBalanceSol) * 100,
      });
    }
  },
  {
    path: "/api/demo/buy",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { sessionId, token, amountUsd } = body;
        
        if (!sessionId || !token || !amountUsd) {
          return c.json({ success: false, error: 'Missing required fields' }, 400);
        }
        
        const portfolio = getOrCreatePortfolio(sessionId);
        const result = await demoTradeService.executeBuy(sessionId, portfolio, token, amountUsd);
        
        if (result.success) {
          demoSessions.set(sessionId, result.portfolio);
        }
        
        logger?.info('📊 [Demo] Buy executed', { sessionId, token: token.symbol, amount: amountUsd });
        return c.json(result);
      } catch (error: any) {
        logger?.error('❌ [Demo] Buy error', { error: error.message });
        return c.json({ success: false, error: 'Trade execution failed' }, 500);
      }
    }
  },
  {
    path: "/api/demo/sell",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { sessionId, positionId, currentPriceUsd } = body;
        
        if (!sessionId || !positionId || !currentPriceUsd) {
          return c.json({ success: false, error: 'Missing required fields' }, 400);
        }
        
        const portfolio = getOrCreatePortfolio(sessionId);
        const result = await demoTradeService.executeSell(sessionId, portfolio, positionId, currentPriceUsd);
        
        if (result.success) {
          demoSessions.set(sessionId, result.portfolio);
        }
        
        logger?.info('📊 [Demo] Sell executed', { sessionId, positionId, pnl: result.pnl });
        return c.json(result);
      } catch (error: any) {
        logger?.error('❌ [Demo] Sell error', { error: error.message });
        return c.json({ success: false, error: 'Trade execution failed' }, 500);
      }
    }
  },
  {
    path: "/api/demo/reset",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { sessionId } = body;
        
        if (!sessionId) {
          return c.json({ success: false, error: 'Missing sessionId' }, 400);
        }
        
        const portfolio = demoTradeService.resetPortfolio(sessionId);
        demoSessions.set(sessionId, portfolio);
        
        logger?.info('📊 [Demo] Portfolio reset', { sessionId });
        return c.json({ success: true, portfolio });
      } catch (error: any) {
        logger?.error('❌ [Demo] Reset error', { error: error.message });
        return c.json({ success: false, error: 'Reset failed' }, 500);
      }
    }
  },
  {
    path: "/api/demo/trades/:sessionId",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const sessionId = c.req.param('sessionId');
      const portfolio = getOrCreatePortfolio(sessionId);
      
      return c.json({
        success: true,
        trades: portfolio.tradeHistory,
        stats: portfolio.stats,
      });
    }
  },
];
