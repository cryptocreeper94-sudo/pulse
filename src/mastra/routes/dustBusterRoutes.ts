import { dustBusterService, RENT_PER_ACCOUNT, FEE_PERCENTAGE, THRESHOLDS } from '../../services/dustBusterService';

export const dustBusterRoutes = [
  {
    path: "/api/dust-buster/scan",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const wallet = c.req.query('wallet');
        if (!wallet) {
          return c.json({ error: 'wallet address is required' }, 400);
        }

        logger?.info('🧹 [DustBuster] Scanning wallet', { wallet });
        const result = await dustBusterService.scanWallet(wallet);
        
        logger?.info('✅ [DustBuster] Scan complete', { 
          wallet, 
          empty: result.emptyAccounts.length,
          dust: result.dustAccounts.length,
          reclaimable: result.totalReclaimableSol 
        });

        return c.json({
          ...result,
          constants: {
            rentPerAccount: RENT_PER_ACCOUNT,
            feePercentage: FEE_PERCENTAGE,
            thresholds: THRESHOLDS,
          },
        });
      } catch (error: any) {
        logger?.error('❌ [DustBuster] Scan error', { error: error.message });
        return c.json({ error: 'Failed to scan wallet' }, 500);
      }
    }
  },
  {
    path: "/api/dust-buster/preview",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { walletAddress, threshold, burnMode } = await c.req.json();
        if (!walletAddress) {
          return c.json({ error: 'walletAddress is required' }, 400);
        }

        logger?.info('🔍 [DustBuster] Previewing cleanup', { walletAddress, threshold, burnMode });
        const preview = await dustBusterService.previewCleanup(
          walletAddress,
          threshold || THRESHOLDS.small,
          burnMode || false
        );

        logger?.info('✅ [DustBuster] Preview complete', { 
          accounts: preview.totalAccounts,
          reclaimable: preview.totalReclaimableSol 
        });

        return c.json(preview);
      } catch (error: any) {
        logger?.error('❌ [DustBuster] Preview error', { error: error.message });
        return c.json({ error: 'Failed to preview cleanup' }, 500);
      }
    }
  },
  {
    path: "/api/dust-buster/execute",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { 
          walletAddress, 
          signedTransaction, 
          accountsClosed, 
          tokensBurned,
          solRecovered,
          feePaid,
          txSignatures,
          userId 
        } = await c.req.json();

        if (!walletAddress || !txSignatures) {
          return c.json({ error: 'walletAddress and txSignatures are required' }, 400);
        }

        logger?.info('🚀 [DustBuster] Recording cleanup execution', { 
          walletAddress, 
          accountsClosed, 
          tokensBurned 
        });

        const result = await dustBusterService.recordCleanup(
          walletAddress,
          userId,
          accountsClosed || 0,
          tokensBurned || 0,
          solRecovered || '0',
          feePaid || '0',
          txSignatures || []
        );

        logger?.info('✅ [DustBuster] Cleanup recorded', { 
          success: result.success, 
          historyId: result.historyId 
        });

        return c.json(result);
      } catch (error: any) {
        logger?.error('❌ [DustBuster] Execute error', { error: error.message });
        return c.json({ error: 'Failed to record cleanup' }, 500);
      }
    }
  },
  {
    path: "/api/dust-buster/stats",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }

        logger?.info('📊 [DustBuster] Fetching user stats', { userId });
        const stats = await dustBusterService.getUserStats(userId);

        if (!stats) {
          return c.json({
            userId,
            totalSolRecovered: '0',
            totalFeePaid: '0',
            totalAccountsClosed: 0,
            totalTokensBurned: 0,
            updatedAt: null,
          });
        }

        return c.json(stats);
      } catch (error: any) {
        logger?.error('❌ [DustBuster] Stats error', { error: error.message });
        return c.json({ error: 'Failed to fetch stats' }, 500);
      }
    }
  },
  {
    path: "/api/dust-buster/history",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const wallet = c.req.query('wallet');
        const limit = parseInt(c.req.query('limit') || '10');
        
        if (!wallet) {
          return c.json({ error: 'wallet address is required' }, 400);
        }

        logger?.info('📜 [DustBuster] Fetching history', { wallet, limit });
        const history = await dustBusterService.getCleanupHistory(wallet, limit);

        return c.json({ history, count: history.length });
      } catch (error: any) {
        logger?.error('❌ [DustBuster] History error', { error: error.message });
        return c.json({ error: 'Failed to fetch history' }, 500);
      }
    }
  },
  {
    path: "/api/dust-buster/constants",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      return c.json({
        rentPerAccount: RENT_PER_ACCOUNT,
        feePercentage: FEE_PERCENTAGE,
        thresholds: THRESHOLDS,
      });
    }
  },
];
