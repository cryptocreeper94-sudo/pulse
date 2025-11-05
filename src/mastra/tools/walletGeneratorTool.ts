import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";
import { encryptPrivateKey } from "./walletEncryption";

/**
 * Wallet Generator Tool - Creates new Solana wallets for users
 * Each user gets a unique wallet address to fund from their Phantom wallet
 */

export const walletGeneratorTool = createTool({
  id: "wallet-generator-tool",
  description: "Generates a new Solana wallet for the user. Returns the wallet address (public key) that users can send SOL to from their Phantom wallet. The bot manages this wallet for trading.",

  inputSchema: z.object({
    userId: z.string().describe("Telegram user ID"),
  }),

  outputSchema: z.object({
    walletAddress: z.string(),
    success: z.boolean(),
    message: z.string(),
    isNewWallet: z.boolean(),
  }),

  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [WalletGeneratorTool] Starting wallet generation', { userId: context.userId });

    try {
      const userId = context.userId || (runtimeContext as any)?.resourceId || 'default-user';
      const WALLET_KEY = `user_wallet_${userId}`;

      // Check if user already has a wallet
      let existingWallet: { publicKey: string; privateKey: string } | null = null;
      
      try {
        const memory = mastra?.memory;
        if (memory) {
          const messages = await memory.getMessages({
            resourceId: userId,
            threadId: WALLET_KEY,
          });
          
          if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.content) {
              existingWallet = JSON.parse(lastMessage.content as string);
              logger?.info('✅ [WalletGeneratorTool] Found existing wallet', { 
                userId,
                walletAddress: existingWallet.publicKey 
              });
              
              return {
                walletAddress: existingWallet.publicKey,
                success: true,
                message: `Your existing wallet address: ${existingWallet.publicKey}`,
                isNewWallet: false,
              };
            }
          }
        }
      } catch (e) {
        logger?.info('[WalletGeneratorTool] No existing wallet found, creating new one');
      }

      // Generate new Solana wallet
      const keypair = Keypair.generate();
      const publicKey = keypair.publicKey.toBase58();
      const privateKey = bs58.encode(keypair.secretKey);

      logger?.info('🔑 [WalletGeneratorTool] Generated new wallet', { 
        userId,
        walletAddress: publicKey 
      });

      // Encrypt private key before storage
      const encryptedPrivateKey = encryptPrivateKey(privateKey);
      logger?.info('🔒 [WalletGeneratorTool] Private key encrypted', { userId });

      // Save wallet to database (encrypted storage via PostgreSQL)
      const memory = mastra?.memory;
      if (memory) {
        await memory.saveMessages({
          messages: [{
            role: 'system',
            content: JSON.stringify({
              publicKey,
              privateKey: encryptedPrivateKey, // Encrypted using AES-256-GCM
              createdAt: new Date().toISOString(),
            }),
          }],
          resourceId: userId,
          threadId: WALLET_KEY,
        });
        logger?.info('💾 [WalletGeneratorTool] Saved encrypted wallet to database', { userId });
      }

      logger?.info('✅ [WalletGeneratorTool] Wallet generation complete', { 
        userId,
        walletAddress: publicKey 
      });

      return {
        walletAddress: publicKey,
        success: true,
        message: `New wallet created! Send SOL from your Phantom wallet to: ${publicKey}`,
        isNewWallet: true,
      };
    } catch (error: any) {
      logger?.error('❌ [WalletGeneratorTool] Error generating wallet', { error: error.message });
      
      return {
        walletAddress: '',
        success: false,
        message: `Failed to generate wallet: ${error.message}`,
        isNewWallet: false,
      };
    }
  },
});
