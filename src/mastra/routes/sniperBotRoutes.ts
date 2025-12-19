import { sniperBotService, DEFAULT_PRESET, SnipePresetConfig } from '../../services/sniperBotService';
import { tokenScannerService } from '../../services/tokenScannerService';
import { tradeExecutorService } from '../../services/tradeExecutorService';
import { rpcService } from '../../services/rpcService';
import { safetyEngineService, DEFAULT_SAFETY_CONFIG } from '../../services/safetyEngineService';
import { multiChainProvider, CHAIN_CONFIGS, ChainId } from '../../services/multiChainProvider';
import { evmSafetyEngine, DEFAULT_EVM_SAFETY_CONFIG } from '../../services/evmSafetyEngine';
import { tradeLedgerService } from '../../services/tradeLedgerService';
import { strikeAgentTrackingService } from '../../services/strikeAgentTrackingService';
import { topSignalsService } from '../../services/topSignalsService.js';

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
        const { config, userId } = await c.req.json();
        const filterConfig: SnipePresetConfig = config || DEFAULT_PRESET;
        
        logger?.info('🔍 [SniperBot] Token discovery started');
        const tokens = await tokenScannerService.discoverTokens(filterConfig);
        
        // Log predictions for ML learning (async, don't wait)
        for (const token of tokens) {
          strikeAgentTrackingService.logPrediction({
            tokenAddress: token.address,
            tokenSymbol: token.symbol,
            tokenName: token.name,
            dex: token.dex,
            chain: 'solana',
            priceUsd: token.priceUsd,
            priceSol: token.priceSol,
            marketCapUsd: token.marketCapUsd,
            liquidityUsd: token.liquidityUsd,
            tokenAgeMinutes: token.ageMinutes,
            aiRecommendation: token.aiRecommendation,
            aiScore: token.aiScore,
            aiReasoning: token.aiReasoning,
            safetyMetrics: token.safetyMetrics,
            movementMetrics: token.movementMetrics,
            userId,
          }).catch(err => {
            logger?.warn('⚠️ [SniperBot] Failed to log prediction', { token: token.symbol, error: err.message });
          });
        }
        
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
        const { tokenAddress, userId } = await c.req.json();
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
        
        // Log prediction for ML learning (async, don't wait)
        const ageMinutes = tokenDetails.pairCreatedAt 
          ? (Date.now() - tokenDetails.pairCreatedAt) / (1000 * 60)
          : undefined;
          
        strikeAgentTrackingService.logPrediction({
          tokenAddress: tokenDetails.baseToken.address,
          tokenSymbol: tokenDetails.baseToken.symbol,
          tokenName: tokenDetails.baseToken.name,
          dex: tokenDetails.dexId,
          chain: 'solana',
          priceUsd: parseFloat(tokenDetails.priceUsd || '0'),
          priceSol: parseFloat(tokenDetails.priceNative || '0'),
          marketCapUsd: tokenDetails.fdv,
          liquidityUsd: tokenDetails.liquidity?.usd,
          tokenAgeMinutes: ageMinutes,
          aiRecommendation: aiAnalysis.recommendation,
          aiScore: aiAnalysis.score,
          aiReasoning: aiAnalysis.reasoning,
          safetyMetrics,
          movementMetrics,
          userId,
        }).catch(err => {
          logger?.warn('⚠️ [SniperBot] Failed to log prediction', { token: tokenDetails.baseToken.symbol, error: err.message });
        });
        
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

  // ============================================
  // RPC CONFIGURATION
  // ============================================
  {
    path: "/api/sniper/rpc/status",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const health = await rpcService.healthCheck();
        const info = rpcService.getRPCInfo();
        
        return c.json({
          ...health,
          ...info,
          message: health.status === 'healthy' 
            ? `${info.active} RPC operational (${health.latencyMs}ms)` 
            : `RPC degraded - ${health.latencyMs}ms latency`,
        });
      } catch (error: any) {
        logger?.error('❌ [RPC] Health check failed', { error: error.message });
        return c.json({ 
          status: 'unhealthy', 
          error: error.message,
          active: 'Unknown',
          type: 'unknown',
        }, 500);
      }
    }
  },
  {
    path: "/api/sniper/rpc/info",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const info = rpcService.getRPCInfo();
        return c.json(info);
      } catch (error: any) {
        return c.json({ error: 'Failed to get RPC info' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/rpc/custom",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { endpoint } = await c.req.json();
        
        if (endpoint) {
          // Validate the endpoint by testing connection
          try {
            const testResponse = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getSlot',
              }),
            });
            
            if (!testResponse.ok) {
              return c.json({ success: false, error: 'RPC endpoint unreachable' }, 400);
            }
          } catch (e) {
            return c.json({ success: false, error: 'Invalid RPC endpoint' }, 400);
          }
          
          rpcService.setCustomRPC(endpoint);
          logger?.info('✅ [RPC] Custom RPC set', { endpoint: endpoint.substring(0, 50) });
        } else {
          rpcService.setCustomRPC(null);
          logger?.info('✅ [RPC] Reverted to Helius RPC');
        }
        
        const info = rpcService.getRPCInfo();
        return c.json({ success: true, ...info });
      } catch (error: any) {
        logger?.error('❌ [RPC] Error setting custom RPC', { error: error.message });
        return c.json({ error: 'Failed to set custom RPC' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/rpc/priority-fee",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { accountKeys, tokenMint } = await c.req.json();
        
        const keys = accountKeys || (tokenMint ? [tokenMint] : undefined);
        const estimate = await rpcService.getPriorityFeeEstimate(keys);
        
        return c.json({
          ...estimate,
          feeLevelsSol: {
            min: (estimate.priorityFeeLevels.min * 200000 / 1_000_000 / 1e9).toFixed(9),
            low: (estimate.priorityFeeLevels.low * 200000 / 1_000_000 / 1e9).toFixed(9),
            medium: (estimate.priorityFeeLevels.medium * 200000 / 1_000_000 / 1e9).toFixed(9),
            high: (estimate.priorityFeeLevels.high * 200000 / 1_000_000 / 1e9).toFixed(9),
            veryHigh: (estimate.priorityFeeLevels.veryHigh * 200000 / 1_000_000 / 1e9).toFixed(9),
          },
        });
      } catch (error: any) {
        logger?.error('❌ [RPC] Priority fee error', { error: error.message });
        return c.json({ error: 'Failed to estimate priority fees' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/fee-estimate",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { tokenMint, priorityLevel } = await c.req.json();
        
        if (!tokenMint) {
          return c.json({ error: 'tokenMint is required' }, 400);
        }
        
        const estimate = await tradeExecutorService.getTransactionFeeEstimate(
          tokenMint,
          priorityLevel || 'auto'
        );
        
        return c.json(estimate);
      } catch (error: any) {
        logger?.error('❌ [TradeExecutor] Fee estimate error', { error: error.message });
        return c.json({ error: 'Failed to estimate fees' }, 500);
      }
    }
  },

  // ============================================
  // SAFETY ENGINE - Token Safety Checks
  // ============================================
  {
    path: "/api/sniper/safety/check",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { tokenAddress, config } = await c.req.json();
        
        if (!tokenAddress) {
          return c.json({ error: 'tokenAddress is required' }, 400);
        }
        
        logger?.info('🔍 [SafetyEngine] Running full safety check', { tokenAddress });
        
        const safetyConfig = config || DEFAULT_SAFETY_CONFIG;
        const report = await safetyEngineService.runFullSafetyCheck(tokenAddress, safetyConfig);
        
        logger?.info('✅ [SafetyEngine] Safety check complete', { 
          tokenAddress, 
          score: report.safetyScore,
          grade: report.safetyGrade,
          risks: report.risks.length 
        });
        
        return c.json(report);
      } catch (error: any) {
        logger?.error('❌ [SafetyEngine] Safety check error', { error: error.message });
        return c.json({ error: 'Failed to run safety check', details: error.message }, 500);
      }
    }
  },
  {
    path: "/api/sniper/safety/quick-check",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const tokenAddress = c.req.query('tokenAddress');
        
        if (!tokenAddress) {
          return c.json({ error: 'tokenAddress is required' }, 400);
        }
        
        // Run quick checks in parallel
        const [authorityCheck, honeypotCheck] = await Promise.all([
          safetyEngineService.quickAuthorityCheck(tokenAddress),
          safetyEngineService.quickHoneypotCheck(tokenAddress),
        ]);
        
        const quickSafe = authorityCheck.safe && honeypotCheck.safe;
        
        return c.json({
          tokenAddress,
          quickSafe,
          authorities: authorityCheck,
          honeypot: honeypotCheck,
        });
      } catch (error: any) {
        logger?.error('❌ [SafetyEngine] Quick check error', { error: error.message });
        return c.json({ error: 'Failed to run quick check' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/safety/authorities",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const tokenAddress = c.req.query('tokenAddress');
        
        if (!tokenAddress) {
          return c.json({ error: 'tokenAddress is required' }, 400);
        }
        
        const result = await safetyEngineService.checkTokenAuthorities(tokenAddress);
        return c.json({ tokenAddress, ...result });
      } catch (error: any) {
        logger?.error('❌ [SafetyEngine] Authority check error', { error: error.message });
        return c.json({ error: 'Failed to check authorities' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/safety/honeypot",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const tokenAddress = c.req.query('tokenAddress');
        
        if (!tokenAddress) {
          return c.json({ error: 'tokenAddress is required' }, 400);
        }
        
        logger?.info('🍯 [SafetyEngine] Running honeypot simulation', { tokenAddress });
        const result = await safetyEngineService.simulateHoneypot(tokenAddress);
        
        return c.json({ tokenAddress, ...result });
      } catch (error: any) {
        logger?.error('❌ [SafetyEngine] Honeypot check error', { error: error.message });
        return c.json({ error: 'Failed to check honeypot' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/safety/liquidity",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const tokenAddress = c.req.query('tokenAddress');
        
        if (!tokenAddress) {
          return c.json({ error: 'tokenAddress is required' }, 400);
        }
        
        const result = await safetyEngineService.checkLiquiditySafety(tokenAddress);
        return c.json({ tokenAddress, ...result });
      } catch (error: any) {
        logger?.error('❌ [SafetyEngine] Liquidity check error', { error: error.message });
        return c.json({ error: 'Failed to check liquidity' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/safety/holders",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const tokenAddress = c.req.query('tokenAddress');
        
        if (!tokenAddress) {
          return c.json({ error: 'tokenAddress is required' }, 400);
        }
        
        const result = await safetyEngineService.analyzeHolderDistribution(tokenAddress);
        return c.json({ tokenAddress, ...result });
      } catch (error: any) {
        logger?.error('❌ [SafetyEngine] Holder analysis error', { error: error.message });
        return c.json({ error: 'Failed to analyze holders' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/safety/config",
    method: "GET",
    createHandler: async () => async (c: any) => {
      return c.json({ defaultConfig: DEFAULT_SAFETY_CONFIG });
    }
  },

  // ============================================
  // MULTI-CHAIN SUPPORT
  // ============================================
  {
    path: "/api/sniper/chains",
    method: "GET",
    createHandler: async () => async (c: any) => {
      const chains = Object.entries(CHAIN_CONFIGS).map(([id, config]) => ({
        id,
        name: config.name,
        symbol: config.symbol,
        isEvm: config.isEvm,
        explorerUrl: config.explorerUrl,
      }));
      return c.json({ chains });
    }
  },
  {
    path: "/api/sniper/multichain/token",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const chain = c.req.query('chain') as ChainId;
        const tokenAddress = c.req.query('tokenAddress');
        
        if (!chain || !tokenAddress) {
          return c.json({ error: 'chain and tokenAddress are required' }, 400);
        }
        
        const tokenInfo = await multiChainProvider.getTokenInfo(chain, tokenAddress);
        return c.json({ token: tokenInfo });
      } catch (error: any) {
        logger?.error('❌ [MultiChain] Token info error', { error: error.message });
        return c.json({ error: 'Failed to get token info' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/multichain/discover",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const chain = c.req.query('chain') as ChainId || 'solana';
        const maxAge = parseInt(c.req.query('maxAge') || '60');
        
        const tokens = await multiChainProvider.discoverNewTokens(chain, maxAge);
        return c.json({ chain, tokens });
      } catch (error: any) {
        logger?.error('❌ [MultiChain] Discovery error', { error: error.message });
        return c.json({ error: 'Failed to discover tokens' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/multichain/safety",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const chain = c.req.query('chain') as ChainId;
        const tokenAddress = c.req.query('tokenAddress');
        
        if (!chain || !tokenAddress) {
          return c.json({ error: 'chain and tokenAddress are required' }, 400);
        }
        
        const chainConfig = CHAIN_CONFIGS[chain];
        
        if (chainConfig.isEvm) {
          const report = await evmSafetyEngine.runFullSafetyCheck(chain, tokenAddress);
          return c.json({ chain, report });
        } else {
          const report = await safetyEngineService.runFullSafetyCheck(tokenAddress);
          return c.json({ chain, report });
        }
      } catch (error: any) {
        logger?.error('❌ [MultiChain] Safety check error', { error: error.message });
        return c.json({ error: 'Failed to run safety check' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/multichain/quick-safety",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const chain = c.req.query('chain') as ChainId;
        const tokenAddress = c.req.query('tokenAddress');
        
        if (!chain || !tokenAddress) {
          return c.json({ error: 'chain and tokenAddress are required' }, 400);
        }
        
        const chainConfig = CHAIN_CONFIGS[chain];
        
        if (chainConfig.isEvm) {
          const result = await evmSafetyEngine.quickSafetyCheck(chain, tokenAddress);
          return c.json({ chain, tokenAddress, ...result });
        } else {
          const report = await safetyEngineService.runFullSafetyCheck(tokenAddress);
          return c.json({ 
            chain, 
            tokenAddress, 
            safe: report.passesAllChecks,
            score: report.safetyScore,
            criticalIssues: report.risks
          });
        }
      } catch (error: any) {
        logger?.error('❌ [MultiChain] Quick safety check error', { error: error.message });
        return c.json({ error: 'Failed to run quick safety check' }, 500);
      }
    }
  },

  // ============================================
  // TRADE LEDGER & ANALYTICS
  // ============================================
  {
    path: "/api/sniper/trades",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        const limit = parseInt(c.req.query('limit') || '50');
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const trades = await tradeLedgerService.getUserTrades(userId, limit);
        return c.json({ trades });
      } catch (error: any) {
        logger?.error('❌ [TradeLedger] Error fetching trades', { error: error.message });
        return c.json({ error: 'Failed to fetch trades' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/trades/stats",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        const days = parseInt(c.req.query('days') || '30');
        
        if (!userId) {
          return c.json({ error: 'userId is required' }, 400);
        }
        
        const stats = await tradeLedgerService.getTradeStats(userId, days);
        return c.json({ stats });
      } catch (error: any) {
        logger?.error('❌ [TradeLedger] Error fetching stats', { error: error.message });
        return c.json({ error: 'Failed to fetch stats' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/trades",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const trade = await c.req.json();
        
        if (!trade.userId || !trade.chain || !trade.tokenAddress) {
          return c.json({ error: 'userId, chain, and tokenAddress are required' }, 400);
        }
        
        if (!trade.predictionId) {
          logger?.warn('⚠️ [TradeLedger] Trade recorded without predictionId - Adaptive AI learning will be limited', {
            tokenSymbol: trade.tokenSymbol,
            chain: trade.chain,
            source: trade.source,
          });
        }
        
        if (!trade.horizon && trade.predictionId) {
          logger?.warn('⚠️ [TradeLedger] Trade has predictionId but missing horizon - defaulting to 1h', {
            predictionId: trade.predictionId,
          });
          trade.horizon = '1h';
        }
        
        const tradeId = await tradeLedgerService.recordTrade({
          ...trade,
          entryTimestamp: new Date(),
          status: 'pending',
        });
        
        logger?.info('✅ [TradeLedger] Trade recorded', { 
          tradeId, 
          hasPrediction: !!trade.predictionId,
          horizon: trade.horizon || 'none',
        });
        return c.json({ success: true, tradeId });
      } catch (error: any) {
        logger?.error('❌ [TradeLedger] Error recording trade', { error: error.message });
        return c.json({ error: 'Failed to record trade' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/trades/outcome",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const outcome = await c.req.json();
        
        if (!outcome.tradeId || outcome.exitPrice === undefined) {
          return c.json({ error: 'tradeId and exitPrice are required' }, 400);
        }
        
        await tradeLedgerService.recordTradeOutcome({
          ...outcome,
          exitTimestamp: new Date(),
        });
        
        logger?.info('✅ [TradeLedger] Trade outcome recorded', { tradeId: outcome.tradeId });
        return c.json({ success: true });
      } catch (error: any) {
        logger?.error('❌ [TradeLedger] Error recording outcome', { error: error.message });
        return c.json({ error: 'Failed to record outcome' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/ai/retrain",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const result = await tradeLedgerService.triggerModelRetraining();
        
        if (result.success) {
          logger?.info('✅ [AdaptiveAI] Model retraining completed', result.results);
        } else {
          logger?.warn('⚠️ [AdaptiveAI] Model retraining failed', { message: result.message });
        }
        
        return c.json(result);
      } catch (error: any) {
        logger?.error('❌ [AdaptiveAI] Retraining error', { error: error.message });
        return c.json({ error: 'Failed to retrain model' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/ai/drift",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const windowDays = parseInt(c.req.query('windowDays') || '7');
        const { predictionLearningService } = await import('../../services/predictionLearningService');
        
        const driftReport = await predictionLearningService.checkAllHorizonsDrift(windowDays);
        
        logger?.info('📊 [AdaptiveAI] Drift detection complete', { 
          hasAnyDrift: driftReport.hasAnyDrift,
          recommendation: driftReport.overallRecommendation 
        });
        
        return c.json(driftReport);
      } catch (error: any) {
        logger?.error('❌ [AdaptiveAI] Drift detection error', { error: error.message });
        return c.json({ error: 'Failed to detect drift' }, 500);
      }
    }
  },
  {
    path: "/api/sniper/ml/stats",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const stats = await strikeAgentTrackingService.getStats();
        
        logger?.info('📊 [StrikeAgentML] Stats retrieved', { 
          totalPredictions: stats.totalPredictions 
        });
        
        return c.json(stats);
      } catch (error: any) {
        logger?.error('❌ [StrikeAgentML] Stats error', { error: error.message });
        return c.json({ error: 'Failed to get ML stats' }, 500);
      }
    }
  },

  // ============================================
  // TOP SIGNALS - "Top 10 Tokens to Watch"
  // ============================================
  {
    path: "/api/strike-agent/top-signals",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const limit = parseInt(c.req.query('limit') || '10');
        const category = c.req.query('category');
        
        logger?.info('[TopSignals] Fetching top signals', { limit, category });
        
        const signals = await topSignalsService.getTopSignals(limit, category);
        
        return c.json({
          success: true,
          signals,
          count: signals.length,
          disclaimer: 'This is not financial advice. Always do your own research.',
          lastUpdated: new Date().toISOString()
        });
      } catch (error: any) {
        logger?.error('[TopSignals] Error', { error: error.message });
        return c.json({ error: 'Failed to fetch top signals' }, 500);
      }
    }
  },

  // ============================================
  // PUBLIC API - No auth required (for marketing/transparency)
  // ============================================
  {
    path: "/api/public/strikeagent/signals",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        logger?.info('[PublicAPI] Fetching public signals');
        
        const signals = await topSignalsService.getTopSignals(5, undefined);
        
        // Sanitize for public consumption - remove sensitive data
        const publicSignals = signals.map((s: any) => ({
          token: s.tokenSymbol || s.symbol || s.token,
          name: s.tokenName || s.name || 'Unknown',
          type: s.compositeScore >= 75 ? 'SNIPE' : 'WATCH',
          confidence: s.compositeScore >= 80 ? 'HIGH' : s.compositeScore >= 60 ? 'MEDIUM' : 'LOW',
          price: s.priceUsd ? `$${s.priceUsd.toFixed(s.priceUsd < 0.01 ? 8 : 4)}` : '--',
          change24h: s.indicators?.priceChange?.h24 || null,
          timestamp: s.timestamp || new Date().toISOString(),
        }));
        
        return c.json({
          success: true,
          signals: publicSignals,
          count: publicSignals.length,
          lastUpdated: new Date().toISOString()
        });
      } catch (error: any) {
        logger?.error('[PublicAPI] Signals error', { error: error.message });
        return c.json({ success: true, signals: [], count: 0, lastUpdated: new Date().toISOString() });
      }
    }
  },
  {
    path: "/api/public/strikeagent/executions",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        logger?.info('[PublicAPI] Fetching public executions');
        
        // Get recent trades from ledger (sanitized - no user IDs or private data)
        const recentTrades = await tradeLedgerService.getRecentTrades(10);
        
        const publicExecutions = recentTrades.map((t: any) => ({
          token: t.tokenSymbol,
          chain: t.chain,
          action: t.tradeType?.toUpperCase() || 'BUY',
          amount: t.amountUsd ? `$${t.amountUsd.toFixed(2)}` : '--',
          pnl: t.profitLossPercent ? `${t.profitLossPercent > 0 ? '+' : ''}${t.profitLossPercent.toFixed(1)}%` : null,
          timestamp: t.entryTimestamp,
          txHash: t.txHash ? `${t.txHash.slice(0, 8)}...` : null,
        }));
        
        return c.json({
          success: true,
          executions: publicExecutions,
          count: publicExecutions.length,
          lastUpdated: new Date().toISOString()
        });
      } catch (error: any) {
        logger?.error('[PublicAPI] Executions error', { error: error.message });
        return c.json({ success: true, executions: [], count: 0, lastUpdated: new Date().toISOString() });
      }
    }
  },
  {
    path: "/api/public/strikeagent/stats",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        logger?.info('[PublicAPI] Fetching public stats');
        
        // Get aggregate stats - no user-specific data
        const stats = await strikeAgentTrackingService.getAggregateStats();
        
        return c.json({
          success: true,
          stats: {
            totalSignals: stats.totalPredictions || 0,
            winRate: stats.outcomesByHorizon?.['24h']?.winRate || stats.outcomesByHorizon?.['1h']?.winRate || 0,
            activeToday: stats.recentActivity || 0,
            tradesExecuted: stats.totalTrades || 0,
          },
          lastUpdated: new Date().toISOString()
        });
      } catch (error: any) {
        logger?.error('[PublicAPI] Stats error', { error: error.message });
        return c.json({ 
          success: true, 
          stats: { totalSignals: 0, winRate: 0, activeToday: 0, tradesExecuted: 0 },
          lastUpdated: new Date().toISOString() 
        });
      }
    }
  },
];
