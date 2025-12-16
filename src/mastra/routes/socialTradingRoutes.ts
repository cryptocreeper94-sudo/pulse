import { socialTradingService } from '../../services/socialTradingService.js';
import { communitySignalService } from '../../services/communitySignalService.js';

export const socialTradingRoutes = [
  {
    path: "/api/social/leaderboard",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const timeframe = c.req.query('timeframe') || 'alltime';
        const limit = parseInt(c.req.query('limit') || '50');
        
        logger?.info('📊 [Social] Fetching leaderboard', { timeframe, limit });
        
        const leaderboard = await socialTradingService.getLeaderboard(timeframe, limit);
        
        return c.json({ 
          success: true, 
          leaderboard,
          timeframe,
          count: leaderboard.length
        });
      } catch (error: any) {
        logger?.error('❌ [Social] Leaderboard error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/social/traders/:id",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const traderId = c.req.param('id');
        
        if (!traderId) {
          return c.json({ error: 'Trader ID is required' }, 400);
        }
        
        logger?.info('👤 [Social] Fetching trader profile', { traderId });
        
        const trader = await socialTradingService.getTraderProfile(traderId);
        
        if (!trader) {
          return c.json({ error: 'Trader not found' }, 404);
        }
        
        const signals = await communitySignalService.getUserSignals(traderId, 10);
        const followers = await socialTradingService.getFollowers(traderId);
        
        return c.json({ 
          success: true, 
          trader,
          recentSignals: signals,
          followerCount: followers.length
        });
      } catch (error: any) {
        logger?.error('❌ [Social] Trader profile error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/social/follow",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { followerId, traderId, allocationPercent, maxPositionSize } = await c.req.json();
        
        if (!followerId || !traderId) {
          return c.json({ error: 'Follower ID and Trader ID are required' }, 400);
        }
        
        if (followerId === traderId) {
          return c.json({ error: 'Cannot follow yourself' }, 400);
        }
        
        logger?.info('➕ [Social] Follow request', { followerId, traderId });
        
        const result = await socialTradingService.followTrader(followerId, traderId, {
          allocationPercent,
          maxPositionSize
        });
        
        if (!result.success) {
          return c.json({ error: 'Already following this trader' }, 400);
        }
        
        return c.json({ 
          success: true, 
          subscriptionId: result.subscriptionId,
          message: 'Successfully followed trader'
        });
      } catch (error: any) {
        logger?.error('❌ [Social] Follow error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/social/unfollow/:traderId",
    method: "DELETE",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const traderId = c.req.param('traderId');
        const followerId = c.req.query('followerId');
        
        if (!followerId || !traderId) {
          return c.json({ error: 'Follower ID and Trader ID are required' }, 400);
        }
        
        logger?.info('➖ [Social] Unfollow request', { followerId, traderId });
        
        await socialTradingService.unfollowTrader(followerId, traderId);
        
        return c.json({ 
          success: true, 
          message: 'Successfully unfollowed trader'
        });
      } catch (error: any) {
        logger?.error('❌ [Social] Unfollow error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/social/following/:userId",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.param('userId');
        
        if (!userId) {
          return c.json({ error: 'User ID is required' }, 400);
        }
        
        const following = await socialTradingService.getFollowing(userId);
        
        return c.json({ 
          success: true, 
          following,
          count: following.length
        });
      } catch (error: any) {
        logger?.error('❌ [Social] Following error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/social/signals",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const limit = parseInt(c.req.query('limit') || '20');
        const category = c.req.query('category');
        
        logger?.info('📡 [Social] Fetching signals', { limit, category });
        
        const signals = await communitySignalService.getLatestSignals(limit, category);
        
        return c.json({ 
          success: true, 
          signals,
          count: signals.length
        });
      } catch (error: any) {
        logger?.error('❌ [Social] Signals error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/social/signals",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { traderId, ticker, signal, targetPrice, stopLoss, analysis, expiresAt } = await c.req.json();
        
        if (!traderId || !ticker || !signal) {
          return c.json({ error: 'Trader ID, ticker, and signal are required' }, 400);
        }
        
        const validSignals = ['BUY', 'SELL', 'HOLD'];
        if (!validSignals.includes(signal.toUpperCase())) {
          return c.json({ error: 'Signal must be BUY, SELL, or HOLD' }, 400);
        }
        
        logger?.info('📤 [Social] Posting signal', { traderId, ticker, signal });
        
        const created = await communitySignalService.postSignal(traderId, {
          ticker,
          signal: signal.toUpperCase(),
          targetPrice,
          stopLoss,
          analysis,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined
        });
        
        return c.json({ 
          success: true, 
          signal: created,
          message: 'Signal posted successfully'
        });
      } catch (error: any) {
        logger?.error('❌ [Social] Post signal error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/social/signals/:id/vote",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const signalId = c.req.param('id');
        const { userId, vote } = await c.req.json();
        
        if (!signalId || !userId || vote === undefined) {
          return c.json({ error: 'Signal ID, user ID, and vote are required' }, 400);
        }
        
        logger?.info('👍 [Social] Vote on signal', { signalId, userId, vote });
        
        let result;
        if (vote > 0) {
          result = await communitySignalService.upvoteSignal(signalId, userId);
        } else {
          result = await communitySignalService.downvoteSignal(signalId, userId);
        }
        
        return c.json({ 
          success: true, 
          ...result,
          score: result.upvotes - result.downvotes
        });
      } catch (error: any) {
        logger?.error('❌ [Social] Vote error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },
  
  {
    path: "/api/social/profile",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId, displayName, bio } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID is required' }, 400);
        }
        
        logger?.info('👤 [Social] Creating/getting trader profile', { userId });
        
        const profile = await socialTradingService.getOrCreateTraderProfile(userId);
        
        return c.json({ 
          success: true, 
          profile
        });
      } catch (error: any) {
        logger?.error('❌ [Social] Profile error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  }
];
