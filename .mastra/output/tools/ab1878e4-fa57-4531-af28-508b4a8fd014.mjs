import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { walletCache } from './e7168015-b420-4ad9-99c0-a702fb95cd1f.mjs';

const walletConnectionTool = createTool({
  id: "wallet-connection",
  description: `Connect or view the user's Phantom wallet address. This tool ONLY stores the PUBLIC wallet address - no private keys are ever stored. 
  Use this when the user wants to:
  - Link their Phantom wallet
  - Check which wallet is connected
  - Update their wallet address`,
  inputSchema: z.object({
    action: z.enum(["connect", "view", "disconnect"]).describe("Action to perform"),
    walletAddress: z.string().optional().describe("Solana wallet address (required for connect action)"),
    userId: z.string().describe("User ID from Telegram")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    walletAddress: z.string().optional(),
    balance: z.number().optional().describe("SOL balance")
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    const { action, walletAddress } = context;
    const userId = context.userId || runtimeContext?.resourceId || "default-user";
    logger?.info("\u{1F517} [WalletConnection] Starting wallet operation", {
      action,
      userId,
      hasAddress: !!walletAddress
    });
    try {
      let walletData = walletCache.get(userId) || null;
      if (action === "connect") {
        if (!walletAddress) {
          logger?.error("\u274C [WalletConnection] No wallet address provided");
          return {
            success: false,
            message: "Please provide your Phantom wallet address"
          };
        }
        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
          logger?.error("\u274C [WalletConnection] Invalid wallet address format");
          return {
            success: false,
            message: "Invalid Solana wallet address format"
          };
        }
        const newWalletData = {
          address: walletAddress,
          connectedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        walletCache.set(userId, newWalletData);
        logger?.info("\u2705 [WalletConnection] Wallet connected successfully", {
          userId,
          address: walletAddress.slice(0, 8) + "..." + walletAddress.slice(-4)
        });
        return {
          success: true,
          message: `\u2705 Wallet connected!

\u{1F4CD} Address: ${walletAddress}

\u26A0\uFE0F Your private keys stay in Phantom - this bot only stores your public address for read-only operations.`,
          walletAddress
        };
      }
      if (action === "view") {
        if (!walletData || !walletData.address) {
          logger?.info("\u{1F4ED} [WalletConnection] No wallet connected");
          return {
            success: false,
            message: "No wallet connected. Use /connect to link your Phantom wallet."
          };
        }
        const address = walletData.address;
        logger?.info("\u{1F441}\uFE0F [WalletConnection] Viewing connected wallet", {
          userId,
          address: address.slice(0, 8) + "..." + address.slice(-4)
        });
        return {
          success: true,
          message: `\u{1F4CD} Connected Wallet:
${address}

Connected: ${new Date(walletData.connectedAt).toLocaleString()}`,
          walletAddress: address
        };
      }
      if (action === "disconnect") {
        walletCache.delete(userId);
        logger?.info("\u{1F50C} [WalletConnection] Wallet disconnected", { userId });
        return {
          success: true,
          message: "\u2705 Wallet disconnected. Your data has been removed from the bot."
        };
      }
      return {
        success: false,
        message: "Unknown action"
      };
    } catch (error) {
      logger?.error("\u274C [WalletConnection] Error:", error);
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

export { walletConnectionTool };
//# sourceMappingURL=ab1878e4-fa57-4531-af28-508b4a8fd014.mjs.map
