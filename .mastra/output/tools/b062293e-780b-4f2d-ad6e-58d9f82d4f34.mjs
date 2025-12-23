import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const holdingsCache = /* @__PURE__ */ new Map();
const holdingsTool = createTool({
  id: "holdings-tool",
  description: "Manages user's watchlist. Can add, remove, list, or clear holdings. Holdings are persisted in the database per user.",
  inputSchema: z.object({
    action: z.enum(["add", "remove", "list", "clear"]).describe("Action to perform on holdings"),
    ticker: z.string().optional().describe("Ticker symbol to add or remove"),
    tickers: z.array(z.string()).optional().describe("Multiple tickers to add at once"),
    userId: z.string().optional().describe("User ID for personalized storage")
  }),
  outputSchema: z.object({
    action: z.string(),
    success: z.boolean(),
    holdings: z.array(z.string()),
    message: z.string()
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F527} [HoldingsTool] Starting execution", { action: context.action });
    const userId = context.userId || runtimeContext?.resourceId || "default-user";
    const HOLDINGS_KEY = `user_holdings_${userId}`;
    logger?.info("\u{1F4DD} [HoldingsTool] User context", { userId, holdingsKey: HOLDINGS_KEY });
    try {
      let holdings = [];
      const memory = mastra?.memory;
      try {
        if (memory) {
          const messages = await memory.getMessages({
            resourceId: userId,
            threadId: HOLDINGS_KEY
          });
          if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.content) {
              holdings = JSON.parse(lastMessage.content);
            }
          }
        } else {
          holdings = holdingsCache.get(userId) || [];
          logger?.info("[HoldingsTool] Using in-memory cache (no persistent memory available)");
        }
      } catch (e) {
        logger?.warn("[HoldingsTool] No existing holdings found, starting fresh");
        holdings = [];
      }
      logger?.info("\u{1F4DD} [HoldingsTool] Current holdings", { userId, count: holdings.length });
      let message = "";
      let success = true;
      switch (context.action) {
        case "add":
          if (context.ticker) {
            const ticker = context.ticker.toUpperCase();
            if (!holdings.includes(ticker)) {
              holdings.push(ticker);
              message = `Added ${ticker} to holdings`;
            } else {
              message = `${ticker} already in holdings`;
            }
          } else if (context.tickers) {
            const newTickers = context.tickers.map((t) => t.toUpperCase()).filter((t) => !holdings.includes(t));
            holdings.push(...newTickers);
            message = `Added ${newTickers.length} ticker(s) to holdings`;
          } else {
            success = false;
            message = "No ticker provided";
          }
          break;
        case "remove":
          if (context.ticker) {
            const ticker = context.ticker.toUpperCase();
            const index = holdings.indexOf(ticker);
            if (index > -1) {
              holdings.splice(index, 1);
              message = `Removed ${ticker} from holdings`;
            } else {
              message = `${ticker} not found in holdings`;
            }
          } else {
            success = false;
            message = "No ticker provided";
          }
          break;
        case "list":
          message = holdings.length > 0 ? `You have ${holdings.length} ticker(s) in your watchlist` : "Your watchlist is empty";
          break;
        case "clear":
          const count = holdings.length;
          holdings = [];
          message = `Cleared ${count} ticker(s) from holdings`;
          break;
      }
      try {
        if (memory) {
          await memory.saveMessages({
            messages: [{
              role: "assistant",
              content: JSON.stringify(holdings)
            }],
            resourceId: userId,
            threadId: HOLDINGS_KEY
          });
          logger?.info("\u{1F4BE} [HoldingsTool] Holdings saved to database", { userId, holdingsCount: holdings.length });
        } else {
          holdingsCache.set(userId, holdings);
          logger?.info("\u{1F4BE} [HoldingsTool] Holdings saved to in-memory cache", { userId, holdingsCount: holdings.length });
        }
      } catch (saveError) {
        logger?.error("\u274C [HoldingsTool] Failed to save holdings", { error: saveError.message });
      }
      logger?.info("\u2705 [HoldingsTool] Action completed", {
        action: context.action,
        userId,
        holdingsCount: holdings.length
      });
      return {
        action: context.action,
        success,
        holdings,
        message
      };
    } catch (error) {
      logger?.error("\u274C [HoldingsTool] Error", { error: error.message });
      throw new Error(`Holdings operation failed: ${error.message}`);
    }
  }
});

export { holdingsTool };
//# sourceMappingURL=b062293e-780b-4f2d-ad6e-58d9f82d4f34.mjs.map
