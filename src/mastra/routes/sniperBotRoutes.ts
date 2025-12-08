import { sniperBotService, DEFAULT_PRESET, SnipePresetConfig } from '../../services/sniperBotService';
import { tokenScannerService } from '../../services/tokenScannerService';
import { tradeExecutorService } from '../../services/tradeExecutorService';

export const sniperBotRoutes = [
  // ============================================
  // WALLET MANAGEMENT
  // ============================================
  {
    path: "/api/sniper/wallets",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const wallets = await sniperBotService.getUserWallets(userId);
        return c.json({ wallets });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error fetching wallets', { error: error.message });
        return c.json({ error: 'Failed to fetch wallets' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/wallets",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId, address, nickname } = await c.req.json();
        if (!userId || !address) {
          return c.json({ error: 'userId and address are required' }, 400);
        }
        
        const wallet = await sniperBotService.addUserWallet(userId, address, nickname);
        logger?.info('✅ [SniperBot] Wallet added', { userId, address });
        return c.json({ success: true, wallet });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error adding wallet', { error: error.message });
        return c.json({ error: 'Failed to add wallet' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/wallets/balance",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const address = c.req.query('address');
        if (!address) {
          return c.json({ error: 'address is required' }, 400);
        }
        
        const balance = await tradeExecutorService.getWalletSolBalance(address);
        return c.json({ address, balance: balance.toFixed(4), balanceLamports: Math.floor(balance * 1e9) });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error fetching balance', { error: error.message });
        return c.json({ error: 'Failed to fetch balance' }, 500);
      }
    }
  },

  // ============================================
  // PRESET MANAGEMENT
  // ============================================
  {
    path: "/api/sniper/presets",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const presets = await sniperBotService.getUserPresets(userId);
        return c.json({ presets, defaultPreset: DEFAULT_PRESET });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error fetching presets', { error: error.message });
        return c.json({ error: 'Failed to fetch presets' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/presets",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId, name, config, description } = await c.req.json();
        if (!userId || !name || !config) {
          return c.json({ error: 'userId, name, and config are required' }, 400);
        }
        
        const preset = await sniperBotService.createPreset(userId, name, config, description);
        logger?.info('✅ [SniperBot] Preset created', { userId, name });
        return c.json({ success: true, preset });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error creating preset', { error: error.message });
        return c.json({ error: 'Failed to create preset' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/presets/:id",
    method: "DELETE",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const presetId = c.req.param('id');
        const userId = c.req.query('userId');
        if (!userId || !presetId) {
          return c.json({ error: 'userId and presetId are required' }, 400);
        }
        
        await sniperBotService.deletePreset(userId, presetId);
        logger?.info('✅ [SniperBot] Preset deleted', { userId, presetId });
        return c.json({ success: true });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error deleting preset', { error: error.message });
        return c.json({ error: 'Failed to delete preset' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/default-config",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      return c.json({ config: DEFAULT_PRESET });
    }
  },

  // ============================================
  // TOKEN DISCOVERY & ANALYSIS
  // ============================================
  {
    path: "/api/sniper/discover",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { config } = await c.req.json();
        const filterConfig: SnipePresetConfig = config || DEFAULT_PRESET;
        
        logger?.info('🔍 [SniperBot] Token discovery started');
        const tokens = await tokenScannerService.discoverTokens(filterConfig);
        
        logger?.info('✅ [SniperBot] Token discovery complete', { count: tokens.length });
        return c.json({ tokens, count: tokens.length });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Discovery error', { error: error.message });
        return c.json({ error: 'Failed to discover tokens' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/analyze-token",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { tokenAddress } = await c.req.json();
        if (!tokenAddress) {
          return c.json({ error: 'tokenAddress is required' }, 400);
        }
        
        logger?.info('🔍 [SniperBot] Analyzing token', { tokenAddress });
        
        // Get token details from DexScreener
        const tokenDetails = await tokenScannerService.getTokenDetails(tokenAddress);
        if (!tokenDetails) {
          return c.json({ error: 'Token not found on DEX' }, 404);
        }
        
        // Analyze safety
        const safetyMetrics = await tokenScannerService.analyzeSafetyMetrics(tokenAddress);
        
        // Calculate movement metrics
        const movementMetrics = tokenScannerService.calculateMovementMetrics(tokenDetails, DEFAULT_PRESET);
        
        // AI scoring
        const aiAnalysis = tokenScannerService.calculateAIScore(safetyMetrics, movementMetrics);
        
        return c.json({
          token: {
            address: tokenDetails.baseToken.address,
            symbol: tokenDetails.baseToken.symbol,
            name: tokenDetails.baseToken.name,
            priceUsd: tokenDetails.priceUsd,
            priceSol: tokenDetails.priceNative,
            liquidityUsd: tokenDetails.liquidity?.usd,
            marketCapUsd: tokenDetails.fdv,
            dex: tokenDetails.dexId,
          },
          safetyMetrics,
          movementMetrics,
          aiAnalysis
        });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Analysis error', { error: error.message });
        return c.json({ error: 'Failed to analyze token' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/pumpfun",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const limit = parseInt(c.req.query('limit') || '50');
        
        logger?.info('🚀 [SniperBot] Fetching Pump.fun tokens');
        const tokens = await tokenScannerService.getNewPumpFunTokens(limit);
        
        return c.json({ tokens, count: tokens.length });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Pump.fun fetch error', { error: error.message });
        return c.json({ error: 'Failed to fetch Pump.fun tokens' }, 500);
      }
    }
  },

  // ============================================
  // TRADE SIMULATION & QUOTES
  // ============================================
  {
    path: "/api/sniper/quote",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { tokenMint, solAmount, slippagePercent, action } = await c.req.json();
        if (!tokenMint || !solAmount) {
          return c.json({ error: 'tokenMint and solAmount are required' }, 400);
        }
        
        logger?.info('💰 [SniperBot] Getting quote', { tokenMint, solAmount, action });
        
        if (action === 'sell') {
          const result = await tradeExecutorService.simulateSell(
            tokenMint,
            solAmount, // This is token amount for sell
            slippagePercent || 5
          );
          return c.json(result);
        } else {
          const result = await tradeExecutorService.simulateBuy(
            tokenMint,
            parseFloat(solAmount),
            slippagePercent || 5
          );
          return c.json(result);
        }
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Quote error', { error: error.message });
        return c.json({ error: 'Failed to get quote' }, 500);
      }
    }
  },

  // ============================================
  // ORDER MANAGEMENT
  // ============================================
  {
    path: "/api/sniper/orders",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const orders = await sniperBotService.getActiveOrders(userId);
        return c.json({ orders });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error fetching orders', { error: error.message });
        return c.json({ error: 'Failed to fetch orders' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/orders",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId, walletId, config, orderType, targetToken, presetId } = await c.req.json();
        if (!userId || !walletId || !config || !orderType) {
          return c.json({ error: 'userId, walletId, config, and orderType are required' }, 400);
        }
        
        logger?.info('📝 [SniperBot] Creating order', { userId, orderType });
        
        const order = await sniperBotService.createSnipeOrder(
          userId,
          walletId,
          config,
          orderType,
          targetToken,
          presetId
        );
        
        return c.json({ success: true, order });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error creating order', { error: error.message });
        return c.json({ error: 'Failed to create order' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/orders/:id/pause",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const orderId = c.req.param('id');
        const { userId } = await c.req.json();
        if (!userId || !orderId) {
          return c.json({ error: 'userId and orderId are required' }, 400);
        }
        
        await sniperBotService.pauseOrder(userId, orderId);
        logger?.info('⏸️ [SniperBot] Order paused', { orderId });
        return c.json({ success: true });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error pausing order', { error: error.message });
        return c.json({ error: 'Failed to pause order' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/orders/:id/resume",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const orderId = c.req.param('id');
        const { userId } = await c.req.json();
        if (!userId || !orderId) {
          return c.json({ error: 'userId and orderId are required' }, 400);
        }
        
        await sniperBotService.resumeOrder(userId, orderId);
        logger?.info('▶️ [SniperBot] Order resumed', { orderId });
        return c.json({ success: true });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error resuming order', { error: error.message });
        return c.json({ error: 'Failed to resume order' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/orders/:id/cancel",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const orderId = c.req.param('id');
        const { userId, reason } = await c.req.json();
        if (!userId || !orderId) {
          return c.json({ error: 'userId and orderId are required' }, 400);
        }
        
        await sniperBotService.cancelOrder(userId, orderId, reason);
        logger?.info('❌ [SniperBot] Order cancelled', { orderId });
        return c.json({ success: true });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error cancelling order', { error: error.message });
        return c.json({ error: 'Failed to cancel order' }, 500);
      }
    }
  },

  // ============================================
  // EXECUTIONS & POSITIONS
  // ============================================
  {
    path: "/api/sniper/executions",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        const limit = parseInt(c.req.query('limit') || '50');
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const executions = await sniperBotService.getUserExecutions(userId, limit);
        return c.json({ executions });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error fetching executions', { error: error.message });
        return c.json({ error: 'Failed to fetch executions' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/positions",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const positions = await sniperBotService.getOpenPositions(userId);
        return c.json({ positions });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error fetching positions', { error: error.message });
        return c.json({ error: 'Failed to fetch positions' }, 500);
      }
    }
  },

  // ============================================
  // SESSION STATS
  // ============================================
  {
    path: "/api/sniper/stats",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        const days = parseInt(c.req.query('days') || '7');
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const stats = await sniperBotService.getSessionStats(userId, days);
        return c.json({ stats });
      } catch (error: any) {
        logger?.error('❌ [SniperBot] Error fetching stats', { error: error.message });
        return c.json({ error: 'Failed to fetch stats' }, 500);
      }
    }
  },

  // ============================================
  // SOL PRICE
  // ============================================
  {
    path: "/api/sniper/sol-price",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const price = await tradeExecutorService.getSolPrice();
        return c.json({ price });
      } catch (error: any) {
        return c.json({ error: 'Failed to get SOL price' }, 500);
      }
    }
  },
];
