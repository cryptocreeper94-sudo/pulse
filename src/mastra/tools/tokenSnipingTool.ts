import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { walletCache, snipingCache } from './sharedCaches';

/**
 * Token Sniping Tool - Monitors new token launches via Helius webhooks
 * Analyzes rug-risk and auto-buys if criteria are met
 */

export const tokenSnipingTool = createTool({
  id: 'token-sniping',
  description: `Manages token sniping settings and shows detected new tokens.
  Use this when the user wants to:
  - Enable/disable token sniping
  - Set sniping criteria (min liquidity, max rug score)
  - View recently detected tokens
  - Configure auto-buy settings
  
  Detects new SPL token mints and DEX pool creations in real-time via Helius webhooks.`,
  inputSchema: z.object({
    action: z.enum(['status', 'configure', 'recent']).describe('Action to perform'),
    userId: z.string().describe('User ID from Telegram'),
    config: z.object({
      enabled: z.boolean().optional().describe('Enable/disable sniping'),
      minLiquidity: z.number().optional().describe('Minimum liquidity in USD'),
      maxRugScore: z.number().optional().describe('Max rug score (0-100, lower is safer)'),
      autoExecute: z.boolean().optional().describe('Auto-buy tokens that meet criteria'),
      maxBuyAmount: z.number().optional().describe('Max SOL to spend per snipe'),
      targetChains: z.array(z.string()).optional().describe('Target chains (solana, ethereum, etc)'),
    }).optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    config: z.object({
      enabled: z.boolean(),
      minLiquidity: z.number(),
      maxRugScore: z.number(),
      autoExecute: z.boolean(),
      maxBuyAmount: z.number(),
      targetChains: z.array(z.string()),
    }).optional(),
    recentTokens: z.array(z.object({
      ticker: z.string(),
      address: z.string(),
      liquidity: z.number(),
      rugScore: z.number(),
      detectedAt: z.string(),
      bought: z.boolean(),
    })).optional(),
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    const { action, config } = context;
    const userId = context.userId || (runtimeContext as any)?.resourceId || 'default-user';
    const SNIPING_CONFIG_KEY = `sniping_config_${userId}`;
    const WALLET_KEY = `user_wallet_${userId}`;

    logger?.info('🎯 [TokenSniping] Starting sniping operation', {
      action,
      userId,
    });

    try {
      // Check if wallet is connected
      const walletData = walletCache.get(userId);
      const walletAddress = walletData?.address || null;

      // Get current sniping config from cache
      const defaultConfig = {
        enabled: false,
        minLiquidity: 10000, // $10k minimum liquidity
        maxRugScore: 30, // Max rug score of 30 (0-100 scale)
        autoExecute: false,
        maxBuyAmount: 0.1, // Max 0.1 SOL per snipe
        targetChains: ['solana'],
      };
      
      let snipingConfig = snipingCache.get(userId) || defaultConfig;

      if (action === 'status') {
        logger?.info('📊 [TokenSniping] Viewing status');

        if (!walletAddress) {
          return {
            success: true,
            message: '⚠️ Token sniping requires a connected wallet.\n\nUse /connect to link your Phantom wallet first.',
            config: snipingConfig,
          };
        }

        const statusEmoji = snipingConfig.enabled ? '✅' : '❌';
        const autoEmoji = snipingConfig.autoExecute ? '⚡' : '👋';

        let message = `🎯 Token Sniping Status\n\n`;
        message += `${statusEmoji} Sniping: ${snipingConfig.enabled ? 'ENABLED' : 'DISABLED'}\n`;
        message += `${autoEmoji} Auto-Execute: ${snipingConfig.autoExecute ? 'ON' : 'OFF'}\n\n`;
        message += `📊 Criteria:\n`;
        message += `• Min Liquidity: $${snipingConfig.minLiquidity.toLocaleString()}\n`;
        message += `• Max Rug Score: ${snipingConfig.maxRugScore}/100\n`;
        message += `• Max Buy: ${snipingConfig.maxBuyAmount} SOL\n`;
        message += `• Chains: ${snipingConfig.targetChains.join(', ')}\n\n`;
        
        if (snipingConfig.enabled && !snipingConfig.autoExecute) {
          message += `⚠️ Manual mode - You'll get alerts when tokens meet criteria\n`;
        } else if (snipingConfig.enabled && snipingConfig.autoExecute) {
          message += `⚡ AUTO-BUY ENABLED - Bot will buy tokens automatically when criteria are met\n\n`;
          message += `⚠️ NOTE: Actual execution requires Helius webhook integration (currently in test mode)`;
        } else {
          message += `💡 Enable sniping with "enable token sniping"`;
        }

        return {
          success: true,
          message,
          config: snipingConfig,
        };
      }

      if (action === 'configure') {
        if (!config) {
          return {
            success: false,
            message: 'No configuration provided',
          };
        }

        if (!walletAddress) {
          return {
            success: false,
            message: '⚠️ Connect a wallet first with /connect',
          };
        }

        // Merge new config
        const updatedConfig = { ...snipingConfig, ...config };

        // Validation
        if (updatedConfig.maxBuyAmount < 0 || updatedConfig.maxBuyAmount > 5) {
          return {
            success: false,
            message: 'Max buy amount must be between 0 and 5 SOL for safety',
          };
        }

        if (updatedConfig.maxRugScore < 0 || updatedConfig.maxRugScore > 100) {
          return {
            success: false,
            message: 'Rug score must be between 0-100',
          };
        }

        // Save config to cache
        snipingCache.set(userId, updatedConfig);

        logger?.info('✅ [TokenSniping] Config updated', {
          userId,
          changes: config,
        });

        let message = `✅ Sniping Config Updated\n\n`;
        if (config.enabled !== undefined) {
          message += `${config.enabled ? '✅' : '❌'} Sniping: ${config.enabled ? 'ENABLED' : 'DISABLED'}\n`;
        }
        if (config.autoExecute !== undefined) {
          message += `${config.autoExecute ? '⚡' : '👋'} Auto-execute: ${config.autoExecute ? 'ON' : 'OFF'}\n`;
        }
        if (config.minLiquidity) {
          message += `💧 Min liquidity: $${config.minLiquidity.toLocaleString()}\n`;
        }
        if (config.maxRugScore !== undefined) {
          message += `🛡️ Max rug score: ${config.maxRugScore}/100\n`;
        }
        if (config.maxBuyAmount) {
          message += `💰 Max buy: ${config.maxBuyAmount} SOL\n`;
        }

        if (updatedConfig.enabled && updatedConfig.autoExecute) {
          message += `\n⚡ AUTO-BUY ENABLED - Bot will snipe tokens automatically\n`;
          message += `⚠️ NOTE: Currently in test mode - Helius webhook integration required for live sniping`;
        }

        return {
          success: true,
          message,
          config: updatedConfig,
        };
      }

      if (action === 'recent') {
        logger?.info('📋 [TokenSniping] Viewing recent tokens');

        // Mock data for testing (in production, this would come from Helius webhook events)
        const mockTokens = [
          {
            ticker: 'NEWTOK',
            address: '5eT1...abc9',
            liquidity: 25000,
            rugScore: 15,
            detectedAt: new Date(Date.now() - 3600000).toISOString(),
            bought: false,
          },
          {
            ticker: 'MOON',
            address: '9kL2...def3',
            liquidity: 50000,
            rugScore: 45,
            detectedAt: new Date(Date.now() - 7200000).toISOString(),
            bought: false,
          },
        ];

        let message = `📊 Recently Detected Tokens (TEST DATA)\n\n`;
        mockTokens.forEach((token, idx) => {
          const safetyEmoji = token.rugScore < 30 ? '✅' : token.rugScore < 60 ? '⚠️' : '🚨';
          message += `${idx + 1}. ${token.ticker}\n`;
          message += `   ${safetyEmoji} Rug Score: ${token.rugScore}/100\n`;
          message += `   💧 Liquidity: $${token.liquidity.toLocaleString()}\n`;
          message += `   📍 Address: ${token.address}\n`;
          message += `   🕒 Detected: ${new Date(token.detectedAt).toLocaleTimeString()}\n\n`;
        });

        message += `⚠️ TEST DATA - Real-time detection requires Helius webhook setup`;

        return {
          success: true,
          message,
          recentTokens: mockTokens,
        };
      }

      return {
        success: false,
        message: 'Unknown action',
      };
    } catch (error) {
      logger?.error('❌ [TokenSniping] Error:', error);
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});
