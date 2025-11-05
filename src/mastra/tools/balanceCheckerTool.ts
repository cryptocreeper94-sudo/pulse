import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 * Balance Checker Tool - Checks SOL balance for user wallets
 * Uses free Solana public RPC nodes
 */

export const balanceCheckerTool = createTool({
  id: "balance-checker-tool",
  description: "Checks the SOL balance of the user's bot wallet. Returns current balance in SOL.",

  inputSchema: z.object({}),

  outputSchema: z.object({
    balance: z.number(),
    walletAddress: z.string(),
    success: z.boolean(),
    message: z.string(),
  }),

  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();

    try {
      // Get actual user ID from runtimeContext (set by workflow)
      const userId = (runtimeContext as any)?.resourceId || (context as any).userId || 'default-user';
      
      logger?.info('🔧 [BalanceCheckerTool] Received userId', { 
        userId,
        fromRuntimeContext: !!(runtimeContext as any)?.resourceId,
        fromContext: !!(context as any).userId
      });
      
      logger?.info('🔧 [BalanceCheckerTool] Starting balance check', { userId });
      
      const WALLET_KEY = `user_wallet_${userId}`;

      // Get user's wallet from database
      const memory = mastra?.memory;
      if (!memory) {
        throw new Error('Memory storage not available');
      }

      const messages = await memory.getMessages({
        resourceId: userId,
        threadId: WALLET_KEY,
      });

      if (!messages || messages.length === 0) {
        logger?.warn('[BalanceCheckerTool] No wallet found for user', { userId });
        return {
          balance: 0,
          walletAddress: '',
          success: false,
          message: 'No wallet found. Use /wallet to create one first.',
        };
      }

      const lastMessage = messages[messages.length - 1];
      const walletData = JSON.parse(lastMessage.content as string);
      const publicKey = walletData.publicKey;

      logger?.info('📝 [BalanceCheckerTool] Checking balance', { 
        userId,
        walletAddress: publicKey 
      });

      // Connect to Solana (using free public RPC)
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
      
      // Get balance
      const pubKey = new PublicKey(publicKey);
      const balanceLamports = await connection.getBalance(pubKey);
      const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;

      logger?.info('✅ [BalanceCheckerTool] Balance retrieved', { 
        userId,
        walletAddress: publicKey,
        balance: balanceSOL 
      });

      return {
        balance: balanceSOL,
        walletAddress: publicKey,
        success: true,
        message: `Balance: ${balanceSOL.toFixed(4)} SOL`,
      };
    } catch (error: any) {
      logger?.error('❌ [BalanceCheckerTool] Error checking balance', { error: error.message });
      
      return {
        balance: 0,
        walletAddress: '',
        success: false,
        message: `Failed to check balance: ${error.message}`,
      };
    }
  },
});
