import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { 
  Connection, 
  PublicKey, 
  LAMPORTS_PER_SOL, 
  Transaction, 
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction 
} from "@solana/web3.js";
import bs58 from "bs58";
import { decryptPrivateKey } from "./walletEncryption";

/**
 * Withdraw Tool - Allows users to withdraw SOL from bot wallet to their Phantom wallet
 * Transfers SOL from the bot-managed wallet back to user's personal wallet
 */

export const withdrawTool = createTool({
  id: "withdraw-tool",
  description: "Withdraws SOL from the user's bot wallet to their Phantom wallet address. Specify amount and destination address.",

  inputSchema: z.object({
    userId: z.string().describe("Telegram user ID"),
    amount: z.number().describe("Amount of SOL to withdraw"),
    destinationAddress: z.string().describe("Phantom wallet address to send SOL to"),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    signature: z.string(),
    message: z.string(),
    amountWithdrawn: z.number(),
  }),

  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [WithdrawTool] Starting withdrawal', { 
      userId: context.userId,
      amount: context.amount,
      destination: context.destinationAddress 
    });

    try {
      const userId = context.userId || (runtimeContext as any)?.resourceId || 'default-user';
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
        throw new Error('No wallet found. Create a wallet first with /wallet');
      }

      const lastMessage = messages[messages.length - 1];
      const walletData = JSON.parse(lastMessage.content as string);
      
      // Decrypt and recreate keypair from stored private key
      const decryptedPrivateKey = decryptPrivateKey(walletData.privateKey);
      logger?.info('🔓 [WithdrawTool] Private key decrypted', { userId });
      
      const privateKeyArray = bs58.decode(decryptedPrivateKey);
      const keypair = Keypair.fromSecretKey(privateKeyArray);

      logger?.info('🔑 [WithdrawTool] Loaded wallet keypair', { 
        userId,
        fromAddress: keypair.publicKey.toBase58() 
      });

      // Connect to Solana
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

      // Validate destination address
      let destinationPubKey: PublicKey;
      try {
        destinationPubKey = new PublicKey(context.destinationAddress);
      } catch (e) {
        throw new Error('Invalid destination wallet address');
      }

      // Check balance first
      const balance = await connection.getBalance(keypair.publicKey);
      const balanceSOL = balance / LAMPORTS_PER_SOL;

      if (balanceSOL < context.amount) {
        throw new Error(`Insufficient balance. You have ${balanceSOL.toFixed(4)} SOL, trying to withdraw ${context.amount} SOL`);
      }

      // Build transfer transaction
      const amountLamports = Math.floor(context.amount * LAMPORTS_PER_SOL);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: destinationPubKey,
          lamports: amountLamports,
        })
      );

      logger?.info('📤 [WithdrawTool] Sending transaction', { 
        from: keypair.publicKey.toBase58(),
        to: context.destinationAddress,
        amount: context.amount 
      });

      // Send and confirm transaction
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [keypair],
        {
          commitment: 'confirmed',
        }
      );

      logger?.info('✅ [WithdrawTool] Withdrawal successful', { 
        userId,
        signature,
        amount: context.amount 
      });

      return {
        success: true,
        signature,
        message: `Successfully withdrew ${context.amount} SOL to ${context.destinationAddress}. Transaction: https://solscan.io/tx/${signature}`,
        amountWithdrawn: context.amount,
      };
    } catch (error: any) {
      logger?.error('❌ [WithdrawTool] Error withdrawing', { error: error.message });
      
      return {
        success: false,
        signature: '',
        message: `Withdrawal failed: ${error.message}`,
        amountWithdrawn: 0,
      };
    }
  },
});
