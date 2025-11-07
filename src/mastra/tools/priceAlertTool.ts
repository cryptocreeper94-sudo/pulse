import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { checkSubscriptionLimit } from "../middleware/subscriptionCheck.js";

const alertsCache = new Map<string, any[]>();

export const priceAlertTool = createTool({
  id: "price-alert-tool",
  description: "Manage price alerts for crypto/stock assets. Create, list, and delete alerts that trigger Telegram notifications when price targets are reached.",
  inputSchema: z.object({
    action: z.enum(['create', 'list', 'delete', 'check']).describe('Action to perform: create new alert, list all alerts, delete alert by ID, or check prices against alerts'),
    userId: z.string().optional().describe('User ID for the alert'),
    ticker: z.string().optional().describe('Asset ticker symbol (e.g., BTC, ETH, AAPL)'),
    targetPrice: z.number().optional().describe('Target price to trigger alert'),
    condition: z.enum(['above', 'below']).optional().describe('Alert when price goes above or below target'),
    alertId: z.string().optional().describe('Alert ID for deletion'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    alerts: z.array(z.object({
      id: z.string(),
      ticker: z.string(),
      targetPrice: z.number(),
      condition: z.string(),
      createdAt: z.string(),
    })).optional(),
    triggeredAlerts: z.array(z.object({
      id: z.string(),
      ticker: z.string(),
      targetPrice: z.number(),
      currentPrice: z.number(),
      condition: z.string(),
    })).optional(),
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    const { action, ticker, targetPrice, condition, alertId } = context;
    const userId = context.userId || (runtimeContext as any)?.resourceId || 'default-user';
    const ALERTS_KEY = `price_alerts_${userId}`;

    logger?.info('🔔 [PriceAlerts] Starting alert operation', {
      action,
      userId,
      ticker,
      targetPrice,
      condition,
    });

    try {
      // Use in-memory cache for alerts (simple and fast)
      let alerts: any[] = alertsCache.get(userId) || [];
      logger?.info('📝 [PriceAlerts] Using in-memory cache', { count: alerts.length });

      // Handle different actions
      switch (action) {
        case 'create':
          if (!ticker || !targetPrice || !condition) {
            logger?.error('❌ [PriceAlerts] Missing required fields for create');
            return {
              success: false,
              message: 'Missing ticker, targetPrice, or condition',
            };
          }

          // Check subscription limit for alert creation
          const limitCheck = await checkSubscriptionLimit(userId, 'alert');
          logger?.info('🔐 [PriceAlerts] Subscription check result', { userId, allowed: limitCheck.allowed, isPremium: limitCheck.isPremium });
          
          if (!limitCheck.allowed) {
            logger?.warn('⚠️ [PriceAlerts] Alert limit exceeded', { userId, message: limitCheck.message });
            return {
              success: false,
              message: limitCheck.message || 'Daily alert limit reached (3 alerts on free plan). Upgrade to Premium for unlimited alerts!',
            };
          }

          const newAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ticker: ticker.toUpperCase(),
            targetPrice,
            condition,
            createdAt: new Date().toISOString(),
          };

          alerts.push(newAlert);

          // Save to in-memory cache
          alertsCache.set(userId, alerts);

          logger?.info('✅ [PriceAlerts] Alert created successfully', { alert: newAlert });
          return {
            success: true,
            message: `Alert created: ${ticker} ${condition} $${targetPrice}`,
            alerts: [newAlert],
          };

        case 'list':
          logger?.info('📋 [PriceAlerts] Listing all alerts', { count: alerts.length });
          return {
            success: true,
            message: `Found ${alerts.length} alert(s)`,
            alerts,
          };

        case 'delete':
          if (!alertId) {
            logger?.error('❌ [PriceAlerts] Missing alert ID for deletion');
            return {
              success: false,
              message: 'Missing alert ID',
            };
          }

          const initialCount = alerts.length;
          alerts = alerts.filter((a: any) => a.id !== alertId);

          // Save updated list
          alertsCache.set(userId, alerts);

          if (alerts.length === initialCount) {
            logger?.warn('⚠️ [PriceAlerts] Alert not found', { alertId });
            return {
              success: false,
              message: 'Alert not found',
            };
          }

          // Save updated alerts
          if (memory) {
            await memory.saveMessages({
              messages: [{
                role: 'assistant',
                content: JSON.stringify(alerts),
              }],
              resourceId: userId,
              threadId: ALERTS_KEY,
            });
          } else {
            alertsCache.set(userId, alerts);
          }

          logger?.info('✅ [PriceAlerts] Alert deleted successfully', { alertId });
          return {
            success: true,
            message: 'Alert deleted successfully',
            alerts,
          };

        case 'check':
          // This will be called by the monitoring workflow
          // Import marketDataTool to get current prices
          const { marketDataTool } = await import('./marketDataTool');
          const triggeredAlerts: any[] = [];

          for (const alert of alerts) {
            try {
              const marketData = await marketDataTool.execute({
                context: { ticker: alert.ticker, days: 1 },
                mastra,
                runtimeContext: null as any,
              });

              if (marketData && marketData.currentPrice) {
                const currentPrice = marketData.currentPrice;
                const shouldTrigger =
                  (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
                  (alert.condition === 'below' && currentPrice <= alert.targetPrice);

                if (shouldTrigger) {
                  triggeredAlerts.push({
                    ...alert,
                    currentPrice,
                  });
                  logger?.info('🎯 [PriceAlerts] Alert triggered!', {
                    ticker: alert.ticker,
                    targetPrice: alert.targetPrice,
                    currentPrice,
                    condition: alert.condition,
                  });
                }
              }
            } catch (error: any) {
              logger?.error('❌ [PriceAlerts] Error checking price', {
                ticker: alert.ticker,
                error: error.message,
              });
            }
          }

          logger?.info('✅ [PriceAlerts] Price check complete', {
            totalAlerts: alerts.length,
            triggeredCount: triggeredAlerts.length,
          });

          return {
            success: true,
            message: `Checked ${alerts.length} alerts, ${triggeredAlerts.length} triggered`,
            triggeredAlerts,
          };

        default:
          logger?.error('❌ [PriceAlerts] Invalid action', { action });
          return {
            success: false,
            message: `Invalid action: ${action}`,
          };
      }
    } catch (error: any) {
      logger?.error('❌ [PriceAlerts] Operation failed', { error: error.message });
      return {
        success: false,
        message: `Alert operation failed: ${error.message}`,
      };
    }
  },
});
