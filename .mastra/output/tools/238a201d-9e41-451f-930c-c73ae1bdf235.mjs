import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { checkSubscriptionLimit } from '../subscriptionCheck.mjs';

const alertsCache = /* @__PURE__ */ new Map();
const priceAlertTool = createTool({
  id: "price-alert-tool",
  description: "Manage price alerts for crypto/stock assets. Create, list, and delete alerts that trigger Telegram notifications when price targets are reached.",
  inputSchema: z.object({
    action: z.enum(["create", "list", "delete", "check"]).describe("Action to perform: create new alert, list all alerts, delete alert by ID, or check prices against alerts"),
    userId: z.string().optional().describe("User ID for the alert"),
    ticker: z.string().optional().describe("Asset ticker symbol (e.g., BTC, ETH, AAPL)"),
    targetPrice: z.number().optional().describe("Target price to trigger alert"),
    condition: z.enum(["above", "below"]).optional().describe("Alert when price goes above or below target"),
    alertId: z.string().optional().describe("Alert ID for deletion")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    alerts: z.array(z.object({
      id: z.string(),
      ticker: z.string(),
      targetPrice: z.number(),
      condition: z.string(),
      createdAt: z.string()
    })).optional(),
    triggeredAlerts: z.array(z.object({
      id: z.string(),
      ticker: z.string(),
      targetPrice: z.number(),
      currentPrice: z.number(),
      condition: z.string()
    })).optional()
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    const { action, ticker, targetPrice, condition, alertId } = context;
    const userId = context.userId || runtimeContext?.resourceId || "default-user";
    const ALERTS_KEY = `price_alerts_${userId}`;
    logger?.info("\u{1F514} [PriceAlerts] Starting alert operation", {
      action,
      userId,
      ticker,
      targetPrice,
      condition
    });
    try {
      let alerts = alertsCache.get(userId) || [];
      logger?.info("\u{1F4DD} [PriceAlerts] Using in-memory cache", { count: alerts.length });
      switch (action) {
        case "create":
          if (!ticker || !targetPrice || !condition) {
            logger?.error("\u274C [PriceAlerts] Missing required fields for create");
            return {
              success: false,
              message: "Missing ticker, targetPrice, or condition"
            };
          }
          const limitCheck = await checkSubscriptionLimit(userId);
          logger?.info("\u{1F510} [PriceAlerts] Subscription check result", { userId, allowed: limitCheck.allowed, isPremium: limitCheck.isPremium });
          if (!limitCheck.allowed) {
            logger?.warn("\u26A0\uFE0F [PriceAlerts] Alert limit exceeded", { userId, message: limitCheck.message });
            return {
              success: false,
              message: limitCheck.message || "Daily alert limit reached (3 alerts on free plan). Upgrade to Premium for unlimited alerts!"
            };
          }
          const newAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ticker: ticker.toUpperCase(),
            targetPrice,
            condition,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          alerts.push(newAlert);
          alertsCache.set(userId, alerts);
          logger?.info("\u2705 [PriceAlerts] Alert created successfully", { alert: newAlert });
          return {
            success: true,
            message: `Alert created: ${ticker} ${condition} $${targetPrice}`,
            alerts: [newAlert]
          };
        case "list":
          logger?.info("\u{1F4CB} [PriceAlerts] Listing all alerts", { count: alerts.length });
          return {
            success: true,
            message: `Found ${alerts.length} alert(s)`,
            alerts
          };
        case "delete":
          if (!alertId) {
            logger?.error("\u274C [PriceAlerts] Missing alert ID for deletion");
            return {
              success: false,
              message: "Missing alert ID"
            };
          }
          const initialCount = alerts.length;
          alerts = alerts.filter((a) => a.id !== alertId);
          alertsCache.set(userId, alerts);
          if (alerts.length === initialCount) {
            logger?.warn("\u26A0\uFE0F [PriceAlerts] Alert not found", { alertId });
            return {
              success: false,
              message: "Alert not found"
            };
          }
          if (memory) {
            await memory.saveMessages({
              messages: [{
                role: "assistant",
                content: JSON.stringify(alerts)
              }],
              resourceId: userId,
              threadId: ALERTS_KEY
            });
          } else {
            alertsCache.set(userId, alerts);
          }
          logger?.info("\u2705 [PriceAlerts] Alert deleted successfully", { alertId });
          return {
            success: true,
            message: "Alert deleted successfully",
            alerts
          };
        case "check":
          const { marketDataTool } = await import('./55b74bc4-cf4f-4175-a3bf-7d9edc2fc84a.mjs');
          const triggeredAlerts = [];
          for (const alert of alerts) {
            try {
              const marketData = await marketDataTool.execute({
                context: { ticker: alert.ticker, days: 1 },
                mastra,
                runtimeContext: null
              });
              if (marketData && marketData.currentPrice) {
                const currentPrice = marketData.currentPrice;
                const shouldTrigger = alert.condition === "above" && currentPrice >= alert.targetPrice || alert.condition === "below" && currentPrice <= alert.targetPrice;
                if (shouldTrigger) {
                  triggeredAlerts.push({
                    ...alert,
                    currentPrice
                  });
                  logger?.info("\u{1F3AF} [PriceAlerts] Alert triggered!", {
                    ticker: alert.ticker,
                    targetPrice: alert.targetPrice,
                    currentPrice,
                    condition: alert.condition
                  });
                }
              }
            } catch (error) {
              logger?.error("\u274C [PriceAlerts] Error checking price", {
                ticker: alert.ticker,
                error: error.message
              });
            }
          }
          logger?.info("\u2705 [PriceAlerts] Price check complete", {
            totalAlerts: alerts.length,
            triggeredCount: triggeredAlerts.length
          });
          return {
            success: true,
            message: `Checked ${alerts.length} alerts, ${triggeredAlerts.length} triggered`,
            triggeredAlerts
          };
        default:
          logger?.error("\u274C [PriceAlerts] Invalid action", { action });
          return {
            success: false,
            message: `Invalid action: ${action}`
          };
      }
    } catch (error) {
      logger?.error("\u274C [PriceAlerts] Operation failed", { error: error.message });
      return {
        success: false,
        message: `Alert operation failed: ${error.message}`
      };
    }
  }
});

export { priceAlertTool };
//# sourceMappingURL=238a201d-9e41-451f-930c-c73ae1bdf235.mjs.map
