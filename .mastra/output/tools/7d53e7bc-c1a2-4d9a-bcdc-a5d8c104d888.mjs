import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const balanceCheckerTool = createTool({
  id: "balance-checker-tool",
  description: "Checks the SOL balance of the user's bot wallet. Returns current balance in SOL.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    balance: z.number(),
    walletAddress: z.string(),
    success: z.boolean(),
    message: z.string()
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    try {
      const userId = context.userId || "default-user";
      logger?.info("\u{1F527} [BalanceCheckerTool] Starting balance check", { userId });
      const WALLET_KEY = `user_wallet_${userId}`;
      const memory = mastra?.memory;
      if (!memory) {
        throw new Error("Memory storage not available");
      }
      const messages = await memory.getMessages({
        resourceId: userId,
        threadId: WALLET_KEY
      });
      if (!messages || messages.length === 0) {
        logger?.warn("[BalanceCheckerTool] No wallet found for user", { userId });
        return {
          balance: 0,
          walletAddress: "",
          success: false,
          message: "No wallet found. Use /wallet to create one first."
        };
      }
      const lastMessage = messages[messages.length - 1];
      const walletData = JSON.parse(lastMessage.content);
      const publicKey = walletData.address;
      if (!publicKey) {
        logger?.warn("[BalanceCheckerTool] Wallet data missing address");
        return {
          balance: 0,
          walletAddress: "",
          success: false,
          message: "Wallet address not found. Please reconnect your wallet."
        };
      }
      logger?.info("\u{1F4DD} [BalanceCheckerTool] Checking balance", {
        userId,
        walletAddress: publicKey
      });
      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
      const pubKey = new PublicKey(publicKey);
      const balanceLamports = await connection.getBalance(pubKey);
      const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
      logger?.info("\u2705 [BalanceCheckerTool] Balance retrieved", {
        userId,
        walletAddress: publicKey,
        balance: balanceSOL
      });
      return {
        balance: balanceSOL,
        walletAddress: publicKey,
        success: true,
        message: `Balance: ${balanceSOL.toFixed(4)} SOL`
      };
    } catch (error) {
      logger?.error("\u274C [BalanceCheckerTool] Error checking balance", { error: error.message });
      return {
        balance: 0,
        walletAddress: "",
        success: false,
        message: `Failed to check balance: ${error.message}`
      };
    }
  }
});

export { balanceCheckerTool };
//# sourceMappingURL=7d53e7bc-c1a2-4d9a-bcdc-a5d8c104d888.mjs.map
