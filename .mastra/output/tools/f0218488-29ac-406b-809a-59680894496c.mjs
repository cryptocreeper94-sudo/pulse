import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const preferencesTool = createTool({
  id: "preferences-tool",
  description: "Manages user preferences for external link destinations (Kraken vs CoinGecko/Yahoo Finance).",
  inputSchema: z.object({
    action: z.enum(["set", "get"]).describe("Action to perform on preferences"),
    linkPreference: z.enum(["default", "kraken"]).optional().describe("Link preference: 'default' (CoinGecko/Yahoo) or 'kraken'"),
    userId: z.string().optional().describe("User ID for personalized storage")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    linkPreference: z.string(),
    message: z.string()
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F527} [PreferencesTool] Starting execution", { action: context.action });
    const userId = context.userId || runtimeContext?.resourceId || "default-user";
    const PREFS_KEY = `user_preferences_${userId}`;
    logger?.info("\u{1F4DD} [PreferencesTool] User context", { userId, prefsKey: PREFS_KEY });
    try {
      let currentPref = "default";
      try {
        const memory = mastra?.memory;
        if (memory) {
          const messages = await memory.getMessages({
            resourceId: userId,
            threadId: PREFS_KEY
          });
          if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.content) {
              const prefs = JSON.parse(lastMessage.content);
              currentPref = prefs.linkPreference || "default";
            }
          }
        }
      } catch (e) {
        logger?.info("[PreferencesTool] No existing preferences found, using defaults");
        currentPref = "default";
      }
      let message = "";
      let success = true;
      if (context.action === "set" && context.linkPreference) {
        currentPref = context.linkPreference;
        const memory = mastra?.memory;
        if (memory) {
          await memory.saveMessages({
            messages: [{
              role: "assistant",
              content: JSON.stringify({ linkPreference: currentPref })
            }],
            resourceId: userId,
            threadId: PREFS_KEY
          });
          logger?.info("\u{1F4BE} [PreferencesTool] Preferences saved", { userId, linkPreference: currentPref });
        }
        message = currentPref === "kraken" ? "\u2705 Links set to Kraken (crypto & stocks will link to kraken.com)" : "\u2705 Links set to default (crypto\u2192CoinGecko, stocks\u2192Yahoo Finance)";
      } else {
        message = currentPref === "kraken" ? "Current link preference: Kraken" : "Current link preference: Default (CoinGecko/Yahoo Finance)";
      }
      logger?.info("\u2705 [PreferencesTool] Action completed", {
        action: context.action,
        userId,
        linkPreference: currentPref
      });
      return {
        success,
        linkPreference: currentPref,
        message
      };
    } catch (error) {
      logger?.error("\u274C [PreferencesTool] Error", { error: error.message });
      throw new Error(`Preferences operation failed: ${error.message}`);
    }
  }
});

export { preferencesTool };
//# sourceMappingURL=f0218488-29ac-406b-809a-59680894496c.mjs.map
