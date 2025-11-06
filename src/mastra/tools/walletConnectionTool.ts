import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { walletCache } from './sharedCaches';

export const walletConnectionTool = createTool({
  id: 'wallet-connection',
  description: `Connect or view the user's Phantom wallet address. This tool ONLY stores the PUBLIC wallet address - no private keys are ever stored. 
  Use this when the user wants to:
  - Link their Phantom wallet
  - Check which wallet is connected
  - Update their wallet address`,
  inputSchema: z.object({
    action: z.enum(['connect', 'view', 'disconnect']).describe('Action to perform'),
    walletAddress: z
      .string()
      .optional()
      .describe('Solana wallet address (required for connect action)'),
    userId: z.string().describe('User ID from Telegram'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    walletAddress: z.string().optional(),
    balance: z.number().optional().describe('SOL balance'),
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    const { action, walletAddress } = context;
    const userId = context.userId || (runtimeContext as any)?.resourceId || 'default-user';
    const WALLET_KEY = `user_wallet_${userId}`;

    logger?.info('🔗 [WalletConnection] Starting wallet operation', {
      action,
      userId,
      hasAddress: !!walletAddress,
    });

    try {
      // Get current wallet data from cache
      let walletData: { address: string; connectedAt: string } | null = walletCache.get(userId) || null;

      if (action === 'connect') {
        if (!walletAddress) {
          logger?.error('❌ [WalletConnection] No wallet address provided');
          return {
            success: false,
            message: 'Please provide your Phantom wallet address',
          };
        }

        // Validate Solana address format (base58, 32-44 chars)
        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
          logger?.error('❌ [WalletConnection] Invalid wallet address format');
          return {
            success: false,
            message: 'Invalid Solana wallet address format',
          };
        }

        // Store wallet address in cache (PUBLIC address only, NO private keys)
        const newWalletData = {
          address: walletAddress,
          connectedAt: new Date().toISOString(),
        };

        walletCache.set(userId, newWalletData);

        logger?.info('✅ [WalletConnection] Wallet connected successfully', {
          userId,
          address: walletAddress.slice(0, 8) + '...' + walletAddress.slice(-4),
        });

        return {
          success: true,
          message: `✅ Wallet connected!\n\n📍 Address: ${walletAddress}\n\n⚠️ Your private keys stay in Phantom - this bot only stores your public address for read-only operations.`,
          walletAddress,
        };
      }

      if (action === 'view') {
        if (!walletData || !walletData.address) {
          logger?.info('📭 [WalletConnection] No wallet connected');
          return {
            success: false,
            message:
              'No wallet connected. Use /connect to link your Phantom wallet.',
          };
        }

        const address = walletData.address;
        logger?.info('👁️ [WalletConnection] Viewing connected wallet', {
          userId,
          address: address.slice(0, 8) + '...' + address.slice(-4),
        });

        return {
          success: true,
          message: `📍 Connected Wallet:\n${address}\n\nConnected: ${new Date(walletData.connectedAt).toLocaleString()}`,
          walletAddress: address,
        };
      }

      if (action === 'disconnect') {
        // Clear wallet data from cache
        walletCache.delete(userId);

        logger?.info('🔌 [WalletConnection] Wallet disconnected', { userId });

        return {
          success: true,
          message:
            '✅ Wallet disconnected. Your data has been removed from the bot.',
        };
      }

      return {
        success: false,
        message: 'Unknown action',
      };
    } catch (error) {
      logger?.error('❌ [WalletConnection] Error:', error);
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});
