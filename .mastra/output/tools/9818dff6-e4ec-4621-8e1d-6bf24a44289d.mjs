import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { walletCache, ordersCache, settingsCache } from './2b83ab63-5672-43fc-b2f6-2e55be46e5aa.mjs';

const jupiterLimitOrderTool = createTool({
  id: "jupiter-limit-order",
  description: `Creates limit orders for token trading via Jupiter DEX. 
  Use this when the user wants to:
  - Buy a token when price reaches a specific level
  - Sell a token when price hits a target
  - Set auto-sell targets
  - View or cancel active orders
  
  Example: "Buy BONK at $0.002" or "Sell JUP at $1.50"`,
  inputSchema: z.object({
    action: z.enum(["create", "list", "cancel"]).describe("Action to perform"),
    userId: z.string().describe("User ID from Telegram"),
    orderType: z.enum(["buy", "sell"]).optional().describe("Order type"),
    ticker: z.string().optional().describe("Token symbol (e.g., BONK, JUP)"),
    contractAddress: z.string().optional().describe("Token contract address (optional, for specific tokens)"),
    targetPrice: z.number().optional().describe("Trigger price for the order"),
    amount: z.number().optional().describe("Amount in SOL (for buy) or tokens (for sell)"),
    orderId: z.string().optional().describe("Order ID to cancel")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    orders: z.array(z.object({
      id: z.string(),
      type: z.string(),
      ticker: z.string(),
      targetPrice: z.number(),
      amount: z.number(),
      status: z.string(),
      createdAt: z.string()
    })).optional()
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    const { action, orderType, ticker, targetPrice, amount, orderId } = context;
    const userId = context.userId || runtimeContext?.resourceId || "default-user";
    logger?.info("\u{1F4CA} [JupiterLimitOrder] Starting limit order operation", {
      action,
      userId,
      orderType,
      ticker
    });
    try {
      const walletData = walletCache.get(userId);
      const walletAddress = walletData?.address || null;
      if (!walletAddress) {
        return {
          success: false,
          message: "\u26A0\uFE0F No wallet connected. Connect your wallet in the Mini App first."
        };
      }
      let orders = ordersCache.get(userId) || [];
      if (action === "list") {
        logger?.info("\u{1F4CB} [JupiterLimitOrder] Listing orders", { count: orders.length });
        if (orders.length === 0) {
          return {
            success: true,
            message: '\u{1F4CB} No active limit orders.\n\nUse commands like "buy BONK at 0.002" to create orders.',
            orders: []
          };
        }
        let message = `\u{1F4CB} Active Limit Orders (${orders.length}):

`;
        orders.forEach((order, idx) => {
          const typeEmoji = order.type === "buy" ? "\u{1F7E2}" : "\u{1F534}";
          message += `${idx + 1}. ${typeEmoji} ${order.type.toUpperCase()} ${order.ticker}
`;
          message += `   Target: $${order.targetPrice}
`;
          message += `   Amount: ${order.amount} ${order.type === "buy" ? "SOL" : order.ticker}
`;
          message += `   Status: ${order.status}
`;
          message += `   Created: ${new Date(order.createdAt).toLocaleString()}

`;
        });
        return {
          success: true,
          message,
          orders
        };
      }
      if (action === "cancel") {
        if (!orderId && orders.length > 0) {
          return {
            success: false,
            message: "Please specify which order to cancel (by number or ID)"
          };
        }
        let orderIndex = -1;
        if (orderId) {
          orderIndex = orders.findIndex((o) => o.id === orderId || o.id === `order_${orderId}`);
          if (orderIndex === -1 && !isNaN(parseInt(orderId))) {
            orderIndex = parseInt(orderId) - 1;
          }
        }
        if (orderIndex === -1 || orderIndex >= orders.length) {
          return {
            success: false,
            message: "Order not found"
          };
        }
        const cancelledOrder = orders.splice(orderIndex, 1)[0];
        ordersCache.set(userId, orders);
        logger?.info("\u2705 [JupiterLimitOrder] Order cancelled", { orderId: cancelledOrder.id });
        return {
          success: true,
          message: `\u2705 Cancelled ${cancelledOrder.type.toUpperCase()} order for ${cancelledOrder.ticker} at $${cancelledOrder.targetPrice}`,
          orders
        };
      }
      if (action === "create") {
        if (!orderType || !ticker || !targetPrice || !amount) {
          return {
            success: false,
            message: "Missing required fields: orderType, ticker, targetPrice, amount"
          };
        }
        const settings = settingsCache.get(userId) || {};
        const autoExecute = settings?.autoExecute || false;
        const newOrder = {
          id: `order_${Date.now()}`,
          type: orderType,
          ticker: ticker.toUpperCase(),
          targetPrice,
          amount,
          status: autoExecute ? "active (auto-execute ON)" : "active (manual approval required)",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          walletAddress,
          autoExecute
        };
        orders.push(newOrder);
        ordersCache.set(userId, orders);
        logger?.info("\u2705 [JupiterLimitOrder] Order created", {
          orderId: newOrder.id,
          type: orderType,
          ticker
        });
        let message = `\u2705 Limit Order Created

`;
        message += `${orderType === "buy" ? "\u{1F7E2}" : "\u{1F534}"} ${orderType.toUpperCase()} ${ticker.toUpperCase()}
`;
        message += `\u{1F4B0} Amount: ${amount} ${orderType === "buy" ? "SOL" : ticker.toUpperCase()}
`;
        message += `\u{1F3AF} Target Price: $${targetPrice}
`;
        message += `\u{1F4CD} Wallet: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-4)}

`;
        if (autoExecute) {
          message += `\u26A1 AUTO-EXECUTE ENABLED - Order will execute automatically when price hits target

`;
          message += `\u26A0\uFE0F NOTE: Actual execution requires Jupiter integration (currently in test mode)`;
        } else {
          message += `\u26A0\uFE0F AUTO-EXECUTE DISABLED - You'll receive a notification when price hits target, but must approve manually

`;
          message += `Enable auto-execute with "enable auto trading"`;
        }
        return {
          success: true,
          message,
          orders: [newOrder]
        };
      }
      return {
        success: false,
        message: "Unknown action"
      };
    } catch (error) {
      logger?.error("\u274C [JupiterLimitOrder] Error:", error);
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

export { jupiterLimitOrderTool };
//# sourceMappingURL=9818dff6-e4ec-4621-8e1d-6bf24a44289d.mjs.map
