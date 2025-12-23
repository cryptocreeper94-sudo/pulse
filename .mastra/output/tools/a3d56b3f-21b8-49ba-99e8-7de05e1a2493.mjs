import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { walletCache, snipingCache } from './108ee023-8c04-4529-acb0-0d794aef83fe.mjs';

const tokenSnipingTool = createTool({
  id: "token-sniping",
  description: `Manages token sniping settings and shows detected new tokens.
  Use this when the user wants to:
  - Enable/disable token sniping
  - Set sniping criteria (min liquidity, max rug score)
  - View recently detected tokens
  - Configure auto-buy settings
  
  Detects new SPL token mints and DEX pool creations in real-time via Helius webhooks.`,
  inputSchema: z.object({
    action: z.enum(["status", "configure", "recent"]).describe("Action to perform"),
    userId: z.string().describe("User ID from Telegram"),
    config: z.object({
      enabled: z.boolean().optional().describe("Enable/disable sniping"),
      minLiquidity: z.number().optional().describe("Minimum liquidity in USD"),
      maxRugScore: z.number().optional().describe("Max rug score (0-100, lower is safer)"),
      autoExecute: z.boolean().optional().describe("Auto-buy tokens that meet criteria"),
      maxBuyAmount: z.number().optional().describe("Max SOL to spend per snipe"),
      targetChains: z.array(z.string()).optional().describe("Target chains (solana, ethereum, etc)")
    }).optional()
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
      targetChains: z.array(z.string())
    }).optional(),
    recentTokens: z.array(z.object({
      ticker: z.string(),
      address: z.string(),
      liquidity: z.number(),
      rugScore: z.number(),
      detectedAt: z.string(),
      bought: z.boolean()
    })).optional()
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    const { action, config } = context;
    const userId = context.userId || runtimeContext?.resourceId || "default-user";
    logger?.info("\u{1F3AF} [TokenSniping] Starting sniping operation", {
      action,
      userId
    });
    try {
      const walletData = walletCache.get(userId);
      const walletAddress = walletData?.address || null;
      const defaultConfig = {
        enabled: false,
        minLiquidity: 1e4,
        // $10k minimum liquidity
        maxRugScore: 30,
        // Max rug score of 30 (0-100 scale)
        autoExecute: false,
        maxBuyAmount: 0.1,
        // Max 0.1 SOL per snipe
        targetChains: ["solana"]
      };
      let snipingConfig = snipingCache.get(userId) || defaultConfig;
      if (action === "status") {
        logger?.info("\u{1F4CA} [TokenSniping] Viewing status");
        if (!walletAddress) {
          return {
            success: true,
            message: "\u26A0\uFE0F Token sniping requires a connected wallet.\n\nUse /connect to link your Phantom wallet first.",
            config: snipingConfig
          };
        }
        const statusEmoji = snipingConfig.enabled ? "\u2705" : "\u274C";
        const autoEmoji = snipingConfig.autoExecute ? "\u26A1" : "\u{1F44B}";
        let message = `\u{1F3AF} Token Sniping Status

`;
        message += `${statusEmoji} Sniping: ${snipingConfig.enabled ? "ENABLED" : "DISABLED"}
`;
        message += `${autoEmoji} Auto-Execute: ${snipingConfig.autoExecute ? "ON" : "OFF"}

`;
        message += `\u{1F4CA} Criteria:
`;
        message += `\u2022 Min Liquidity: $${snipingConfig.minLiquidity.toLocaleString()}
`;
        message += `\u2022 Max Rug Score: ${snipingConfig.maxRugScore}/100
`;
        message += `\u2022 Max Buy: ${snipingConfig.maxBuyAmount} SOL
`;
        message += `\u2022 Chains: ${snipingConfig.targetChains.join(", ")}

`;
        if (snipingConfig.enabled && !snipingConfig.autoExecute) {
          message += `\u26A0\uFE0F Manual mode - You'll get alerts when tokens meet criteria
`;
        } else if (snipingConfig.enabled && snipingConfig.autoExecute) {
          message += `\u26A1 AUTO-BUY ENABLED - Bot will buy tokens automatically when criteria are met

`;
          message += `\u26A0\uFE0F NOTE: Actual execution requires Helius webhook integration (currently in test mode)`;
        } else {
          message += `\u{1F4A1} Enable sniping with "enable token sniping"`;
        }
        return {
          success: true,
          message,
          config: snipingConfig
        };
      }
      if (action === "configure") {
        if (!config) {
          return {
            success: false,
            message: "No configuration provided"
          };
        }
        if (!walletAddress) {
          return {
            success: false,
            message: "\u26A0\uFE0F Connect a wallet first with /connect"
          };
        }
        const updatedConfig = { ...snipingConfig, ...config };
        if (updatedConfig.maxBuyAmount < 0 || updatedConfig.maxBuyAmount > 5) {
          return {
            success: false,
            message: "Max buy amount must be between 0 and 5 SOL for safety"
          };
        }
        if (updatedConfig.maxRugScore < 0 || updatedConfig.maxRugScore > 100) {
          return {
            success: false,
            message: "Rug score must be between 0-100"
          };
        }
        snipingCache.set(userId, updatedConfig);
        logger?.info("\u2705 [TokenSniping] Config updated", {
          userId,
          changes: config
        });
        let message = `\u2705 Sniping Config Updated

`;
        if (config.enabled !== void 0) {
          message += `${config.enabled ? "\u2705" : "\u274C"} Sniping: ${config.enabled ? "ENABLED" : "DISABLED"}
`;
        }
        if (config.autoExecute !== void 0) {
          message += `${config.autoExecute ? "\u26A1" : "\u{1F44B}"} Auto-execute: ${config.autoExecute ? "ON" : "OFF"}
`;
        }
        if (config.minLiquidity) {
          message += `\u{1F4A7} Min liquidity: $${config.minLiquidity.toLocaleString()}
`;
        }
        if (config.maxRugScore !== void 0) {
          message += `\u{1F6E1}\uFE0F Max rug score: ${config.maxRugScore}/100
`;
        }
        if (config.maxBuyAmount) {
          message += `\u{1F4B0} Max buy: ${config.maxBuyAmount} SOL
`;
        }
        if (updatedConfig.enabled && updatedConfig.autoExecute) {
          message += `
\u26A1 AUTO-BUY ENABLED - Bot will snipe tokens automatically
`;
          message += `\u26A0\uFE0F NOTE: Currently in test mode - Helius webhook integration required for live sniping`;
        }
        return {
          success: true,
          message,
          config: updatedConfig
        };
      }
      if (action === "recent") {
        logger?.info("\u{1F4CB} [TokenSniping] Viewing recent tokens");
        const mockTokens = [
          {
            ticker: "NEWTOK",
            address: "5eT1...abc9",
            liquidity: 25e3,
            rugScore: 15,
            detectedAt: new Date(Date.now() - 36e5).toISOString(),
            bought: false
          },
          {
            ticker: "MOON",
            address: "9kL2...def3",
            liquidity: 5e4,
            rugScore: 45,
            detectedAt: new Date(Date.now() - 72e5).toISOString(),
            bought: false
          }
        ];
        let message = `\u{1F4CA} Recently Detected Tokens (TEST DATA)

`;
        mockTokens.forEach((token, idx) => {
          const safetyEmoji = token.rugScore < 30 ? "\u2705" : token.rugScore < 60 ? "\u26A0\uFE0F" : "\u{1F6A8}";
          message += `${idx + 1}. ${token.ticker}
`;
          message += `   ${safetyEmoji} Rug Score: ${token.rugScore}/100
`;
          message += `   \u{1F4A7} Liquidity: $${token.liquidity.toLocaleString()}
`;
          message += `   \u{1F4CD} Address: ${token.address}
`;
          message += `   \u{1F552} Detected: ${new Date(token.detectedAt).toLocaleTimeString()}

`;
        });
        message += `\u26A0\uFE0F TEST DATA - Real-time detection requires Helius webhook setup`;
        return {
          success: true,
          message,
          recentTokens: mockTokens
        };
      }
      return {
        success: false,
        message: "Unknown action"
      };
    } catch (error) {
      logger?.error("\u274C [TokenSniping] Error:", error);
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

export { tokenSnipingTool };
//# sourceMappingURL=a3d56b3f-21b8-49ba-99e8-7de05e1a2493.mjs.map
