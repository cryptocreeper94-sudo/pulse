import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const userSettingsTool = createTool({
  id: "user-settings",
  description: `Control Center - Manages ALL bot settings and toggles with simple on/off commands. 
  Use this when the user wants to:
  - View all settings ("settings")
  - Toggle features ("on alerts", "off sniping", "on auto trading")
  - Change asset scope ("stocks only", "coins only", "both")
  - Change exchange links ("kraken links", "dex links")
  - Set spending limits ("set max spend 0.5")
  - Any simple toggle or preference change
  
  This is the MAIN settings interface - users prefer toggles over complex commands.`,
  inputSchema: z.object({
    action: z.enum(["view", "update"]).describe("View or update settings"),
    userId: z.string().describe("User ID from Telegram"),
    settings: z.object({
      autoExecuteLimitOrders: z.boolean().optional().describe("Auto-execute limit orders when triggered"),
      autoExecuteSniping: z.boolean().optional().describe("Auto-execute token sniping when criteria met"),
      defaultExchangeLink: z.enum(["kraken", "dexscreener"]).optional().describe("Default exchange for hyperlinks"),
      maxAutoSpendPerTrade: z.number().optional().describe("Max SOL to spend per auto-executed trade"),
      snipingEnabled: z.boolean().optional().describe("Enable/disable sniping features"),
      priceAlertsEnabled: z.boolean().optional().describe("Enable/disable price alert monitoring"),
      assetScope: z.enum(["coins", "stocks", "both"]).optional().describe("Which assets to analyze"),
      autoMonitorWatchlist: z.boolean().optional().describe("Auto-create alerts for watchlist items"),
      personalityMode: z.enum(["regular", "cryptoCat"]).optional().describe("AI personality: regular (professional) or cryptoCat (sarcastic, fun)")
    }).optional()
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    settings: z.object({
      autoExecuteLimitOrders: z.boolean(),
      autoExecuteSniping: z.boolean(),
      defaultExchangeLink: z.string(),
      maxAutoSpendPerTrade: z.number(),
      snipingEnabled: z.boolean(),
      priceAlertsEnabled: z.boolean(),
      assetScope: z.string(),
      autoMonitorWatchlist: z.boolean(),
      personalityMode: z.string()
    }).optional()
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    const { action, settings } = context;
    const userId = context.userId || runtimeContext?.resourceId || "default-user";
    const SETTINGS_KEY = `user_settings_${userId}`;
    logger?.info("\u2699\uFE0F [UserSettings] Starting settings operation", {
      action,
      userId
    });
    try {
      const memory = mastra?.memory;
      let currentSettings = {
        autoExecuteLimitOrders: false,
        autoExecuteSniping: false,
        defaultExchangeLink: "dexscreener",
        maxAutoSpendPerTrade: 0.1,
        // 0.1 SOL default (~$15-20)
        snipingEnabled: false,
        priceAlertsEnabled: false,
        assetScope: "both",
        // coins, stocks, or both
        autoMonitorWatchlist: false,
        personalityMode: "regular"
        // regular or cryptoCat
      };
      try {
        if (memory) {
          const messages = await memory.getMessages({
            resourceId: userId,
            threadId: SETTINGS_KEY
          });
          if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.content) {
              currentSettings = { ...currentSettings, ...JSON.parse(lastMessage.content) };
            }
          }
        }
      } catch (e) {
        logger?.warn("[UserSettings] No existing settings found, using defaults");
      }
      if (action === "view") {
        logger?.info("\u{1F441}\uFE0F [UserSettings] Viewing Control Center", { userId });
        const toggle = (enabled) => enabled ? "\u2705 ON" : "\u274C OFF";
        const safeMode = !currentSettings.autoExecuteLimitOrders && !currentSettings.autoExecuteSniping;
        let walletStatus = "\u274C Not connected";
        try {
          if (memory) {
            const walletMessages = await memory.getMessages({
              resourceId: userId,
              threadId: `wallet_${userId}`
            });
            if (walletMessages && walletMessages.length > 0) {
              const lastWallet = walletMessages[walletMessages.length - 1];
              if (lastWallet.content) {
                const walletData = JSON.parse(lastWallet.content);
                if (walletData.publicKey) {
                  const short = walletData.publicKey.slice(0, 6) + "..." + walletData.publicKey.slice(-4);
                  walletStatus = `\u2705 ${short}`;
                }
              }
            }
          }
        } catch (e) {
        }
        const controlCenter = `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551   \u{1F30A} DarkWave Control Center V2.1    \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D

\u{1F4F1} WALLET
\u251C\u2500 Status: ${walletStatus}
\u2514\u2500 Quick: "connect wallet" | "disconnect"

\u{1F3AF} PRICE ALERTS
\u251C\u2500 Enabled: ${toggle(currentSettings.priceAlertsEnabled)}
\u251C\u2500 Auto-monitor watchlist: ${toggle(currentSettings.autoMonitorWatchlist)}
\u2514\u2500 Quick: "on alerts" | "BTC alert 65000"

\u{1F4B1} TRADING ${safeMode ? "(SAFE MODE \u2705)" : "(AUTO MODE \u26A0\uFE0F)"}
\u251C\u2500 Auto-execute orders: ${toggle(currentSettings.autoExecuteLimitOrders)}
\u251C\u2500 Max spend: ${currentSettings.maxAutoSpendPerTrade} SOL/trade
\u2514\u2500 Exchange links: ${currentSettings.defaultExchangeLink}

\u{1F3AF} SNIPING
\u251C\u2500 Enabled: ${toggle(currentSettings.snipingEnabled)}
\u251C\u2500 Auto-execute: ${toggle(currentSettings.autoExecuteSniping)}
\u2514\u2500 Quick: "on sniping" | "off sniping"

\u{1F50D} ANALYSIS
\u251C\u2500 Asset scope: ${currentSettings.assetScope === "both" ? "\u{1F4CA} Stocks + \u{1FA99} Crypto" : currentSettings.assetScope === "stocks" ? "\u{1F4CA} Stocks only" : "\u{1FA99} Crypto only"}
\u2514\u2500 Quick: "stocks only" | "coins only" | "both"

\u{1F3AD} PERSONALITY
\u251C\u2500 Mode: ${currentSettings.personalityMode === "regular" ? "\u{1F3AF} Professional" : "\u{1F63A} Crypto Cat (Sarcastic)"}
\u2514\u2500 Quick: "mode regular" | "mode cat"

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u2728 SUPER SIMPLE COMMANDS:
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Toggle anything:
  "on [feature]" \u2192 Enable
  "off [feature]" \u2192 Disable
  
Examples:
  "on auto trading" "off sniping"
  "stocks only" "coins only"
  "kraken links" "dex links"
  "mode cat" "mode regular"
  
${!safeMode ? "\n\u26A0\uFE0F AUTO-TRADING ACTIVE - Bot will execute trades automatically!\n" : ""}`.trim();
        return {
          success: true,
          message: controlCenter,
          settings: currentSettings
        };
      }
      if (action === "update") {
        if (!settings) {
          return {
            success: false,
            message: "No settings provided to update"
          };
        }
        const updatedSettings = { ...currentSettings, ...settings };
        if (updatedSettings.maxAutoSpendPerTrade < 0 || updatedSettings.maxAutoSpendPerTrade > 10) {
          return {
            success: false,
            message: "Max auto-spend must be between 0 and 10 SOL for safety"
          };
        }
        if (memory) {
          await memory.saveMessages({
            messages: [{
              role: "assistant",
              content: JSON.stringify(updatedSettings)
            }],
            resourceId: userId,
            threadId: SETTINGS_KEY
          });
        }
        logger?.info("\u2705 [UserSettings] Settings updated", {
          userId,
          changes: settings
        });
        let updateMsg = "\u2705 Settings updated:\n\n";
        if (settings.autoExecuteLimitOrders !== void 0) {
          updateMsg += `${settings.autoExecuteLimitOrders ? "\u2705" : "\u274C"} Auto-execute limit orders: ${settings.autoExecuteLimitOrders ? "ENABLED" : "DISABLED"}
`;
        }
        if (settings.autoExecuteSniping !== void 0) {
          updateMsg += `${settings.autoExecuteSniping ? "\u2705" : "\u274C"} Auto-execute sniping: ${settings.autoExecuteSniping ? "ENABLED" : "DISABLED"}
`;
        }
        if (settings.snipingEnabled !== void 0) {
          updateMsg += `${settings.snipingEnabled ? "\u2705" : "\u274C"} Sniping features: ${settings.snipingEnabled ? "ENABLED" : "DISABLED"}
`;
        }
        if (settings.priceAlertsEnabled !== void 0) {
          updateMsg += `${settings.priceAlertsEnabled ? "\u2705" : "\u274C"} Price alerts: ${settings.priceAlertsEnabled ? "ENABLED" : "DISABLED"}
`;
        }
        if (settings.autoMonitorWatchlist !== void 0) {
          updateMsg += `${settings.autoMonitorWatchlist ? "\u2705" : "\u274C"} Auto-monitor watchlist: ${settings.autoMonitorWatchlist ? "ENABLED" : "DISABLED"}
`;
        }
        if (settings.assetScope) {
          const scopeText = settings.assetScope === "both" ? "\u{1F4CA} Stocks + \u{1FA99} Crypto" : settings.assetScope === "stocks" ? "\u{1F4CA} Stocks only" : "\u{1FA99} Crypto only";
          updateMsg += `\u{1F50D} Asset scope: ${scopeText}
`;
        }
        if (settings.defaultExchangeLink) {
          updateMsg += `\u{1F517} Exchange links: ${settings.defaultExchangeLink}
`;
        }
        if (settings.maxAutoSpendPerTrade !== void 0) {
          updateMsg += `\u{1F4B0} Max auto-spend: ${settings.maxAutoSpendPerTrade} SOL/trade
`;
        }
        if (settings.personalityMode) {
          const modeEmoji = settings.personalityMode === "regular" ? "\u{1F3AF}" : "\u{1F63A}";
          const modeName = settings.personalityMode === "regular" ? "Professional Mode" : "Crypto Cat Mode (Sarcastic)";
          updateMsg += `${modeEmoji} Personality: ${modeName}
`;
        }
        if (updatedSettings.autoExecuteLimitOrders || updatedSettings.autoExecuteSniping) {
          updateMsg += `
\u26A0\uFE0F AUTO-TRADING ENABLED - The bot will execute trades automatically using your connected wallet.`;
        } else {
          updateMsg += `
\u2705 SAFE MODE - All trades require manual approval in Phantom.`;
        }
        return {
          success: true,
          message: updateMsg,
          settings: updatedSettings
        };
      }
      return {
        success: false,
        message: "Unknown action"
      };
    } catch (error) {
      logger?.error("\u274C [UserSettings] Error:", error);
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

export { userSettingsTool };
//# sourceMappingURL=e26fa63d-daf6-465b-b4af-44b43589f12c.mjs.map
