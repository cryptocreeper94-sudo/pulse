import { db } from '../../db/client.js';
import { sql } from 'drizzle-orm';

export const copyTradingRoutes = [
  {
    path: "/api/copy-trading/available-traders",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const traders = await db.execute(sql`
          SELECT sp.*, 
            COALESCE(lh.total_pnl, 0) as total_pnl,
            COALESCE(lh.win_rate, 0) as win_rate,
            COALESCE(lh.total_trades, 0) as total_trades,
            (SELECT COUNT(*) FROM copy_trading_followers WHERE trader_id = sp.user_id) as copier_count
          FROM social_profiles sp
          LEFT JOIN leaderboard_history lh ON sp.user_id = lh.user_id
          WHERE sp.is_public = true
          ORDER BY COALESCE(lh.total_pnl, 0) DESC
          LIMIT 50
        `);
        
        return c.json({ traders: traders.rows || [] });
      } catch (error: any) {
        console.error('Available traders error:', error);
        return c.json({ traders: [] });
      }
    }
  },

  {
    path: "/api/copy-trading/follow",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const { userId, traderId, settings } = await c.req.json();
        
        await db.execute(sql`
          INSERT INTO copy_trading_followers (user_id, trader_id, allocation_percent, max_trade_size, enabled, created_at)
          VALUES (${userId}, ${traderId}, ${settings?.allocationPercent || 10}, ${settings?.maxTradeSize || 100}, true, NOW())
          ON CONFLICT (user_id, trader_id) DO NOTHING
        `);
        
        return c.json({ success: true, message: 'Now copying this trader' });
      } catch (error: any) {
        console.error('Follow trader error:', error);
        return c.json({ error: 'Failed to follow trader' }, 500);
      }
    }
  },

  {
    path: "/api/copy-trading/unfollow/:userId/:traderId",
    method: "DELETE" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const userId = c.req.param('userId');
        const traderId = c.req.param('traderId');
        
        await db.execute(sql`
          DELETE FROM copy_trading_followers 
          WHERE user_id = ${userId} AND trader_id = ${traderId}
        `);
        
        return c.json({ success: true, message: 'Stopped copying trader' });
      } catch (error: any) {
        console.error('Unfollow trader error:', error);
        return c.json({ error: 'Failed to unfollow trader' }, 500);
      }
    }
  },

  {
    path: "/api/copy-trading/my-copies/:userId",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const userId = c.req.param('userId');
        
        const copies = await db.execute(sql`
          SELECT ctf.*, sp.display_name, sp.avatar_url,
            COALESCE(lh.total_pnl, 0) as trader_pnl,
            COALESCE(lh.win_rate, 0) as trader_win_rate
          FROM copy_trading_followers ctf
          LEFT JOIN social_profiles sp ON ctf.trader_id = sp.user_id
          LEFT JOIN leaderboard_history lh ON ctf.trader_id = lh.user_id
          WHERE ctf.user_id = ${userId}
          ORDER BY ctf.created_at DESC
        `);
        
        return c.json({ copies: copies.rows || [] });
      } catch (error: any) {
        console.error('My copies error:', error);
        return c.json({ copies: [] });
      }
    }
  },

  {
    path: "/api/copy-trading/settings/:userId/:traderId",
    method: "PUT" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const userId = c.req.param('userId');
        const traderId = c.req.param('traderId');
        const settings = await c.req.json();
        
        await db.execute(sql`
          UPDATE copy_trading_followers 
          SET allocation_percent = ${settings.allocationPercent},
              max_trade_size = ${settings.maxTradeSize},
              enabled = ${settings.enabled}
          WHERE user_id = ${userId} AND trader_id = ${traderId}
        `);
        
        return c.json({ success: true });
      } catch (error: any) {
        console.error('Update settings error:', error);
        return c.json({ error: 'Failed to update settings' }, 500);
      }
    }
  },

  {
    path: "/api/copy-trading/history/:userId",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const userId = c.req.param('userId');
        
        const history = await db.execute(sql`
          SELECT cth.*, sp.display_name as trader_name
          FROM copy_trading_history cth
          LEFT JOIN social_profiles sp ON cth.trader_id = sp.user_id
          WHERE cth.user_id = ${userId}
          ORDER BY cth.executed_at DESC
          LIMIT 100
        `);
        
        return c.json({ history: history.rows || [] });
      } catch (error: any) {
        console.error('Copy history error:', error);
        return c.json({ history: [] });
      }
    }
  },

  {
    path: "/api/copy-trading/performance/:userId",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const userId = c.req.param('userId');
        
        const performance = await db.execute(sql`
          SELECT trader_id, 
            SUM(CASE WHEN pnl > 0 THEN pnl ELSE 0 END) as total_profit,
            SUM(CASE WHEN pnl < 0 THEN pnl ELSE 0 END) as total_loss,
            COUNT(*) as total_trades
          FROM copy_trading_history
          WHERE user_id = ${userId}
          GROUP BY trader_id
        `);
        
        return c.json({ performance: performance.rows || [] });
      } catch (error: any) {
        console.error('Copy performance error:', error);
        return c.json({ performance: [] });
      }
    }
  }
];
