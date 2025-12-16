import { autonomousTradingService, TradingMode, SuggestionStatus } from '../../services/autonomousTradingService.js';

export const autonomousTradingRoutes = [
  {
    path: "/api/trading/config",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const profile = await autonomousTradingService.getTradingProfile(userId);
        return c.json({ success: true, profile });
      } catch (error: any) {
        logger?.error('❌ [Trading] Error fetching config', { error: error.message });
        return c.json({ error: 'Failed to fetch trading config' }, 500);
      }
    }
  },
  {
    path: "/api/trading/config",
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
          const validModes: TradingMode[] = ['observer', 'approval', 'semi_auto', 'full_auto'];
          if (!validModes.includes(updates.mode)) {
            return c.json({ error: `Invalid mode. Valid values: ${validModes.join(', ')}` }, 400);
          }
        }
        
        const profile = await autonomousTradingService.updateTradingProfile(userId, updates);
        logger?.info('✅ [Trading] Config updated', { userId });
        
        return c.json({ success: true, profile });
      } catch (error: any) {
        logger?.error('❌ [Trading] Error updating config', { error: error.message });
        return c.json({ error: error.message || 'Failed to update trading config' }, 500);
      }
    }
  },
  {
    path: "/api/trading/mode",
    method: "PUT" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId, mode } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const validModes: TradingMode[] = ['observer', 'approval', 'semi_auto', 'full_auto'];
        if (!validModes.includes(mode)) {
          return c.json({ error: `Invalid mode. Valid values: ${validModes.join(', ')}` }, 400);
        }
        
        const profile = await autonomousTradingService.setTradingMode(userId, mode);
        logger?.info('✅ [Trading] Mode updated', { userId, mode });
        
        return c.json({ success: true, profile });
      } catch (error: any) {
        logger?.error('❌ [Trading] Error setting mode', { error: error.message });
        return c.json({ error: error.message || 'Failed to set trading mode' }, 500);
      }
    }
  },
  {
    path: "/api/trading/suggestions",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        const status = c.req.query('status') as SuggestionStatus | undefined;
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const suggestions = await autonomousTradingService.getSuggestions(userId, status);
        return c.json({ success: true, suggestions, count: suggestions.length });
      } catch (error: any) {
        logger?.error('❌ [Trading] Error fetching suggestions', { error: error.message });
        return c.json({ error: 'Failed to fetch suggestions' }, 500);
      }
    }
  },
  {
    path: "/api/trading/suggestions/:id/approve",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const suggestionId = c.req.param('id');
        const { userId } = await c.req.json();
        
        if (!suggestionId) {
          return c.json({ error: 'Suggestion ID is required' }, 400);
        }
        
        const suggestion = await autonomousTradingService.getSuggestionById(suggestionId);
        
        if (!suggestion) {
          return c.json({ error: 'Suggestion not found' }, 404);
        }
        
        if (userId && suggestion.userId !== userId) {
          return c.json({ error: 'Unauthorized' }, 403);
        }
        
        const updatedSuggestion = await autonomousTradingService.approveSuggestion(suggestionId);
        logger?.info('✅ [Trading] Suggestion approved', { suggestionId });
        
        return c.json({ success: true, suggestion: updatedSuggestion });
      } catch (error: any) {
        logger?.error('❌ [Trading] Error approving suggestion', { error: error.message });
        return c.json({ error: error.message || 'Failed to approve suggestion' }, 500);
      }
    }
  },
  {
    path: "/api/trading/suggestions/:id/reject",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const suggestionId = c.req.param('id');
        const { userId, reason } = await c.req.json();
        
        if (!suggestionId) {
          return c.json({ error: 'Suggestion ID is required' }, 400);
        }
        
        const suggestion = await autonomousTradingService.getSuggestionById(suggestionId);
        
        if (!suggestion) {
          return c.json({ error: 'Suggestion not found' }, 404);
        }
        
        if (userId && suggestion.userId !== userId) {
          return c.json({ error: 'Unauthorized' }, 403);
        }
        
        const updatedSuggestion = await autonomousTradingService.rejectSuggestion(suggestionId, reason);
        logger?.info('✅ [Trading] Suggestion rejected', { suggestionId, reason });
        
        return c.json({ success: true, suggestion: updatedSuggestion });
      } catch (error: any) {
        logger?.error('❌ [Trading] Error rejecting suggestion', { error: error.message });
        return c.json({ error: error.message || 'Failed to reject suggestion' }, 500);
      }
    }
  },
  {
    path: "/api/trading/suggestions/:id/execute",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const suggestionId = c.req.param('id');
        const { userId, exchangeConnectionId } = await c.req.json();
        
        if (!suggestionId) {
          return c.json({ error: 'Suggestion ID is required' }, 400);
        }
        
        const suggestion = await autonomousTradingService.getSuggestionById(suggestionId);
        
        if (!suggestion) {
          return c.json({ error: 'Suggestion not found' }, 404);
        }
        
        if (userId && suggestion.userId !== userId) {
          return c.json({ error: 'Unauthorized' }, 403);
        }
        
        const execution = await autonomousTradingService.executeTrade(suggestionId, exchangeConnectionId);
        logger?.info('✅ [Trading] Trade executed', { suggestionId, executionId: execution.id });
        
        return c.json({ success: true, execution });
      } catch (error: any) {
        logger?.error('❌ [Trading] Error executing trade', { error: error.message });
        return c.json({ error: error.message || 'Failed to execute trade' }, 500);
      }
    }
  },
  {
    path: "/api/trading/history",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        const limit = c.req.query('limit') ? parseInt(c.req.query('limit')) : 50;
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const trades = await autonomousTradingService.getTradeHistory(userId, limit);
        return c.json({ success: true, trades, count: trades.length });
      } catch (error: any) {
        logger?.error('❌ [Trading] Error fetching history', { error: error.message });
        return c.json({ error: 'Failed to fetch trade history' }, 500);
      }
    }
  },
  {
    path: "/api/trading/open",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const trades = await autonomousTradingService.getOpenTrades(userId);
        return c.json({ success: true, trades, count: trades.length });
      } catch (error: any) {
        logger?.error('❌ [Trading] Error fetching open trades', { error: error.message });
        return c.json({ error: 'Failed to fetch open trades' }, 500);
      }
    }
  },
  {
    path: "/api/trading/milestones",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const milestones = await autonomousTradingService.getMilestones();
        const fullAutoStatus = await autonomousTradingService.checkFullAutoMilestone();
        
        return c.json({ 
          success: true, 
          milestones, 
          fullAutoStatus 
        });
      } catch (error: any) {
        logger?.error('❌ [Trading] Error fetching milestones', { error: error.message });
        return c.json({ error: 'Failed to fetch milestones' }, 500);
      }
    }
  },
  {
    path: "/api/trading/kill-switch",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId, reason, reset } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        let profile;
        if (reset) {
          profile = await autonomousTradingService.resetKillSwitch(userId);
          logger?.info('✅ [Trading] Kill switch reset', { userId });
        } else {
          if (!reason) {
            return c.json({ error: 'reason is required to trigger kill switch' }, 400);
          }
          profile = await autonomousTradingService.triggerKillSwitch(userId, reason);
          logger?.warn('🛑 [Trading] Kill switch triggered', { userId, reason });
        }
        
        return c.json({ success: true, profile });
      } catch (error: any) {
        logger?.error('❌ [Trading] Error with kill switch', { error: error.message });
        return c.json({ error: error.message || 'Failed to toggle kill switch' }, 500);
      }
    }
  },
  {
    path: "/api/trading/risk-check",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId, tradeSizeUsd } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        if (tradeSizeUsd === undefined) {
          return c.json({ error: 'tradeSizeUsd is required' }, 400);
        }
        
        const result = await autonomousTradingService.checkRiskLimits(userId, parseFloat(tradeSizeUsd));
        return c.json({ success: true, ...result });
      } catch (error: any) {
        logger?.error('❌ [Trading] Error checking risk', { error: error.message });
        return c.json({ error: 'Failed to check risk limits' }, 500);
      }
    }
  },
  {
    path: "/api/trading/unlock-full-auto",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const profile = await autonomousTradingService.unlockFullAuto(userId);
        logger?.info('🔓 [Trading] Full Auto unlocked', { userId });
        
        return c.json({ success: true, profile });
      } catch (error: any) {
        logger?.error('❌ [Trading] Error unlocking Full Auto', { error: error.message });
        return c.json({ error: error.message || 'Failed to unlock Full Auto' }, 500);
      }
    }
  },
];
