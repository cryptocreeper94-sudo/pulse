import { autoTradeService, AutoTradeStatus, TradingMode } from '../../services/autoTradeService';

export const autoTradeRoutes = [
  {
    path: "/api/auto-trade/config",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const config = await autoTradeService.getConfig(userId);
        return c.json({ success: true, config });
      } catch (error: any) {
        logger?.error('❌ [AutoTrade] Error fetching config', { error: error.message });
        return c.json({ error: 'Failed to fetch auto-trade config' }, 500);
      }
    }
  },
  {
    path: "/api/auto-trade/config",
    method: "PUT" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { userId, ...updates } = body;
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        if (updates.mode) {
          const validModes: TradingMode[] = ['observer', 'approval', 'semi-auto', 'full-auto'];
          if (!validModes.includes(updates.mode)) {
            return c.json({ error: `Invalid mode. Valid values: ${validModes.join(', ')}` }, 400);
          }
        }
        
        const config = await autoTradeService.updateConfig(userId, updates);
        logger?.info('✅ [AutoTrade] Config updated', { userId });
        
        return c.json({ success: true, config });
      } catch (error: any) {
        logger?.error('❌ [AutoTrade] Error updating config', { error: error.message });
        return c.json({ error: 'Failed to update auto-trade config' }, 500);
      }
    }
  },
  {
    path: "/api/auto-trade/toggle",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId, enabled } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        if (typeof enabled !== 'boolean') {
          return c.json({ error: 'enabled must be a boolean' }, 400);
        }
        
        const config = await autoTradeService.toggleEnabled(userId, enabled);
        logger?.info('✅ [AutoTrade] Trading toggled', { userId, enabled });
        
        return c.json({ success: true, config });
      } catch (error: any) {
        logger?.error('❌ [AutoTrade] Error toggling trading', { error: error.message });
        return c.json({ error: 'Failed to toggle auto-trading' }, 500);
      }
    }
  },
  {
    path: "/api/auto-trade/pause",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId, reason } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const config = await autoTradeService.pauseTrading(userId, reason);
        logger?.info('✅ [AutoTrade] Trading paused', { userId, reason });
        
        return c.json({ success: true, config });
      } catch (error: any) {
        logger?.error('❌ [AutoTrade] Error pausing trading', { error: error.message });
        return c.json({ error: 'Failed to pause auto-trading' }, 500);
      }
    }
  },
  {
    path: "/api/auto-trade/resume",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const config = await autoTradeService.resumeTrading(userId);
        logger?.info('✅ [AutoTrade] Trading resumed', { userId });
        
        return c.json({ success: true, config });
      } catch (error: any) {
        logger?.error('❌ [AutoTrade] Error resuming trading', { error: error.message });
        return c.json({ error: 'Failed to resume auto-trading' }, 500);
      }
    }
  },
  {
    path: "/api/auto-trade/trades",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        const status = c.req.query('status') as AutoTradeStatus | undefined;
        const limit = c.req.query('limit') ? parseInt(c.req.query('limit')) : undefined;
        const offset = c.req.query('offset') ? parseInt(c.req.query('offset')) : undefined;
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        if (status) {
          const validStatuses: AutoTradeStatus[] = ['pending', 'awaiting_approval', 'approved', 'executed', 'failed', 'cancelled', 'rejected'];
          if (!validStatuses.includes(status)) {
            return c.json({ error: `Invalid status. Valid values: ${validStatuses.join(', ')}` }, 400);
          }
        }
        
        const trades = await autoTradeService.getTrades(userId, { status, limit, offset });
        return c.json({ success: true, trades, count: trades.length });
      } catch (error: any) {
        logger?.error('❌ [AutoTrade] Error fetching trades', { error: error.message });
        return c.json({ error: 'Failed to fetch trades' }, 500);
      }
    }
  },
  {
    path: "/api/auto-trade/trades/:id",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const tradeId = c.req.param('id');
        
        if (!tradeId) {
          return c.json({ error: 'Trade ID is required' }, 400);
        }
        
        const trade = await autoTradeService.getTradeById(tradeId);
        
        if (!trade) {
          return c.json({ error: 'Trade not found' }, 404);
        }
        
        return c.json({ success: true, trade });
      } catch (error: any) {
        logger?.error('❌ [AutoTrade] Error fetching trade', { error: error.message });
        return c.json({ error: 'Failed to fetch trade' }, 500);
      }
    }
  },
  {
    path: "/api/auto-trade/trades/:id/approve",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const tradeId = c.req.param('id');
        const { userId } = await c.req.json();
        
        if (!tradeId) {
          return c.json({ error: 'Trade ID is required' }, 400);
        }
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const trade = await autoTradeService.getTradeById(tradeId);
        
        if (!trade) {
          return c.json({ error: 'Trade not found' }, 404);
        }
        
        if (trade.userId !== userId) {
          return c.json({ error: 'Unauthorized' }, 403);
        }
        
        const updatedTrade = await autoTradeService.approveTrade(tradeId, userId);
        logger?.info('✅ [AutoTrade] Trade approved', { tradeId, userId });
        
        return c.json({ success: true, trade: updatedTrade });
      } catch (error: any) {
        logger?.error('❌ [AutoTrade] Error approving trade', { error: error.message });
        return c.json({ error: 'Failed to approve trade' }, 500);
      }
    }
  },
  {
    path: "/api/auto-trade/trades/:id/reject",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const tradeId = c.req.param('id');
        const { userId, reason } = await c.req.json();
        
        if (!tradeId) {
          return c.json({ error: 'Trade ID is required' }, 400);
        }
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        if (!reason) {
          return c.json({ error: 'reason is required' }, 400);
        }
        
        const trade = await autoTradeService.getTradeById(tradeId);
        
        if (!trade) {
          return c.json({ error: 'Trade not found' }, 404);
        }
        
        if (trade.userId !== userId) {
          return c.json({ error: 'Unauthorized' }, 403);
        }
        
        const updatedTrade = await autoTradeService.rejectTrade(tradeId, reason);
        logger?.info('✅ [AutoTrade] Trade rejected', { tradeId, userId, reason });
        
        return c.json({ success: true, trade: updatedTrade });
      } catch (error: any) {
        logger?.error('❌ [AutoTrade] Error rejecting trade', { error: error.message });
        return c.json({ error: 'Failed to reject trade' }, 500);
      }
    }
  },
  {
    path: "/api/auto-trade/stats",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const stats = await autoTradeService.getStats(userId);
        return c.json({ success: true, ...stats });
      } catch (error: any) {
        logger?.error('❌ [AutoTrade] Error fetching stats', { error: error.message });
        return c.json({ error: 'Failed to fetch trading stats' }, 500);
      }
    }
  },
];
