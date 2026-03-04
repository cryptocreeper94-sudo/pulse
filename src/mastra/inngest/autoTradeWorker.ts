import { inngest } from "./client";
import { tradeExecutionService } from "../../services/tradeExecutionService";
import type { SignalEvaluation } from "../../services/tradeExecutionService";
import { autoTradeService } from "../../services/autoTradeService";
import { predictionLearningService } from "../../services/predictionLearningService.js";
import axios from "axios";

const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: string | number, text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !chatId) return false;
  
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    return true;
  } catch (error) {
    return false;
  }
}

export const autoTradeSignalProcessor = inngest.createFunction(
  {
    id: "auto-trade-signal-processor",
    name: "Process Auto-Trade Signal",
  },
  {
    event: "auto-trade/signal",
  },
  async ({ event, step }) => {
    const { userId, signal } = event.data as { userId: string; signal: SignalEvaluation };

    console.log(`🤖 [AutoTrade] Processing signal for user ${userId}: ${signal.signal} ${signal.tokenSymbol}`);

    const decision = await step.run("evaluate-signal", async () => {
      return await tradeExecutionService.evaluateSignal(userId, signal);
    });

    console.log(`📊 [AutoTrade] Decision: ${decision.action} - ${decision.reason}`);

    return {
      userId,
      signal: signal.signal,
      tokenSymbol: signal.tokenSymbol,
      decision,
      timestamp: new Date().toISOString(),
    };
  }
);

export const autoTradeDailyReport = inngest.createFunction(
  {
    id: "auto-trade-daily-report",
    name: "Daily Auto-Trade Report",
  },
  [
    { cron: "0 9 * * *" },
    { event: "auto-trade/daily-report" },
  ],
  async ({ event, step }) => {
    console.log("📊 [AutoTrade] Generating daily report...");

    const activeConfigs = await step.run("get-active-users", async () => {
      return await tradeExecutionService.getActiveUsersForAutoTrade();
    });

    const reports: any[] = [];

    for (const config of activeConfigs) {
      const stats = await step.run(`get-stats-${config.userId}`, async () => {
        return await autoTradeService.getStats(config.userId);
      });

      reports.push({
        userId: config.userId,
        mode: config.mode,
        stats: {
          totalTrades: stats.config.totalTradesExecuted,
          winRate: stats.winRate,
          totalPnL: stats.config.totalProfitLoss,
          dailyPnL: stats.dailyProfitLoss,
          openPositions: stats.openPositions,
          pendingApprovals: stats.pendingApprovals,
          isPaused: stats.config.isPaused,
          pauseReason: stats.config.pauseReason,
        },
      });
    }

    if (ADMIN_TELEGRAM_ID && reports.length > 0) {
      await step.run("send-telegram-report", async () => {
        let message = `📊 <b>DAILY AI TRADING REPORT</b>\n\n`;
        message += `👥 <b>Active Users:</b> ${reports.length}\n\n`;

        for (const report of reports) {
          const pnlEmoji = parseFloat(report.stats.totalPnL) >= 0 ? '📈' : '📉';
          const pauseStatus = report.stats.isPaused ? '⏸️ PAUSED' : '✅ Active';
          
          message += `━━━━━━━━━━━━━━━━━━\n`;
          message += `👤 <b>User:</b> ${report.userId.slice(0, 8)}...\n`;
          message += `🎮 <b>Mode:</b> ${report.mode}\n`;
          message += `📊 <b>Trades:</b> ${report.stats.totalTrades}\n`;
          message += `🎯 <b>Win Rate:</b> ${report.stats.winRate.toFixed(1)}%\n`;
          message += `${pnlEmoji} <b>Total P&L:</b> $${parseFloat(report.stats.totalPnL).toFixed(2)}\n`;
          message += `📅 <b>Today P&L:</b> $${report.stats.dailyPnL}\n`;
          message += `📍 <b>Open Positions:</b> ${report.stats.openPositions}\n`;
          message += `⏳ <b>Pending:</b> ${report.stats.pendingApprovals}\n`;
          message += `🔘 <b>Status:</b> ${pauseStatus}\n`;
          if (report.stats.pauseReason) {
            message += `⚠️ <i>${report.stats.pauseReason}</i>\n`;
          }
          message += `\n`;
        }

        message += `━━━━━━━━━━━━━━━━━━\n`;
        message += `<i>Generated: ${new Date().toISOString()}</i>`;

        await sendTelegramMessage(ADMIN_TELEGRAM_ID, message);
        return { sent: true };
      });
    }

    return {
      timestamp: new Date().toISOString(),
      activeUsers: reports.length,
      reports,
    };
  }
);

export const autoTradeKillSwitchMonitor = inngest.createFunction(
  {
    id: "auto-trade-kill-switch-monitor",
    name: "Monitor Kill Switch Conditions",
  },
  [
    { cron: "*/15 * * * *" },
    { event: "auto-trade/check-kill-switch" },
  ],
  async ({ event, step }) => {
    console.log("🛡️ [AutoTrade] Checking kill switch conditions...");

    const activeConfigs = await step.run("get-active-configs", async () => {
      return await tradeExecutionService.getActiveUsersForAutoTrade();
    });

    const alerts: any[] = [];

    for (const config of activeConfigs) {
      const stats = await step.run(`check-user-${config.userId}`, async () => {
        const stats = await autoTradeService.getStats(config.userId);
        
        if (stats.config.consecutiveLosses >= stats.config.stopAfterLosses - 1) {
          return {
            userId: config.userId,
            type: 'consecutive_losses_warning',
            message: `User approaching loss limit: ${stats.config.consecutiveLosses}/${stats.config.stopAfterLosses} consecutive losses`,
            stats,
          };
        }

        if (stats.openPositions >= config.maxOpenPositions - 1) {
          return {
            userId: config.userId,
            type: 'position_limit_warning',
            message: `User approaching position limit: ${stats.openPositions}/${config.maxOpenPositions} positions`,
            stats,
          };
        }

        const driftCheck = await predictionLearningService.checkAllHorizonsDrift(7);
        if (driftCheck.hasAnyDrift) {
          for (const [horizon, status] of Object.entries(driftCheck.horizonStatus)) {
            if (status.severity === 'CRITICAL' || status.severity === 'HIGH') {
              return {
                userId: config.userId,
                type: 'model_drift_alert',
                message: `${status.severity} drift detected for ${horizon} horizon: ${status.recommendation}`,
                horizon,
                severity: status.severity,
              };
            }
          }
        }

        return null;
      });

      if (stats) {
        alerts.push(stats);
      }
    }

    if (alerts.length > 0 && ADMIN_TELEGRAM_ID) {
      await step.run("send-alerts", async () => {
        for (const alert of alerts) {
          const emoji = alert.type === 'consecutive_losses_warning' ? '⚠️' :
                        alert.type === 'position_limit_warning' ? '📍' :
                        alert.type === 'model_drift_alert' ? '🧠' : '❗';

          const message = `
${emoji} <b>AI TRADING ALERT</b>

📋 <b>Type:</b> ${alert.type.replace(/_/g, ' ').toUpperCase()}
👤 <b>User:</b> ${alert.userId.slice(0, 8)}...

${alert.message}

<i>Take action if needed</i>
`.trim();

          await sendTelegramMessage(ADMIN_TELEGRAM_ID, message);
        }
        return { alertsSent: alerts.length };
      });
    }

    return {
      timestamp: new Date().toISOString(),
      checkedUsers: activeConfigs.length,
      alertsGenerated: alerts.length,
      alerts,
    };
  }
);

export const autoTradeApprovalReminder = inngest.createFunction(
  {
    id: "auto-trade-approval-reminder",
    name: "Remind About Pending Approvals",
  },
  [
    { cron: "0 */4 * * *" },
  ],
  async ({ event, step }) => {
    console.log("⏰ [AutoTrade] Checking for pending approvals...");

    const activeConfigs = await step.run("get-configs", async () => {
      return await tradeExecutionService.getActiveUsersForAutoTrade();
    });

    let totalPending = 0;
    const pendingByUser: any[] = [];

    for (const config of activeConfigs) {
      if (config.mode === 'approval') {
        const stats = await step.run(`check-pending-${config.userId}`, async () => {
          return await autoTradeService.getStats(config.userId);
        });

        if (stats.pendingApprovals > 0) {
          totalPending += stats.pendingApprovals;
          pendingByUser.push({
            userId: config.userId,
            pending: stats.pendingApprovals,
          });
        }
      }
    }

    if (totalPending > 0 && ADMIN_TELEGRAM_ID) {
      await step.run("send-reminder", async () => {
        let message = `⏳ <b>PENDING APPROVALS REMINDER</b>\n\n`;
        message += `📊 <b>Total Pending:</b> ${totalPending} trades\n\n`;

        for (const item of pendingByUser) {
          message += `👤 ${item.userId.slice(0, 8)}...: ${item.pending} pending\n`;
        }

        message += `\n<i>Open the app to approve or reject trades</i>`;

        await sendTelegramMessage(ADMIN_TELEGRAM_ID, message);
        return { sent: true };
      });
    }

    return {
      timestamp: new Date().toISOString(),
      totalPending,
      pendingByUser,
    };
  }
);

export const autoTradeMLScanner = inngest.createFunction(
  {
    id: "auto-trade-ml-scanner",
    name: "Scan ML Predictions for Auto-Trade",
  },
  [
    { cron: "*/15 * * * *" },
    { event: "auto-trade/scan-ml-predictions" },
  ],
  async ({ event, step }) => {
    console.log("🤖 [AutoTrade] Scanning ML predictions for auto-trade signals...");

    const activeConfigs = await step.run("get-active-configs", async () => {
      return await tradeExecutionService.getActiveUsersForAutoTrade();
    });

    if (activeConfigs.length === 0) {
      return { message: "No active auto-trade users", signals: 0 };
    }

    const recentPredictions = await step.run("get-recent-predictions", async () => {
      const { db: database } = await import('../../db/client');
      const { predictionEvents } = await import('../../db/schema');
      const { desc, gte } = await import('drizzle-orm');

      const cutoff = new Date(Date.now() - 20 * 60 * 1000);
      return await database.select()
        .from(predictionEvents)
        .where(gte(predictionEvents.createdAt, cutoff))
        .orderBy(desc(predictionEvents.createdAt))
        .limit(20);
    });

    if (recentPredictions.length === 0) {
      return { message: "No recent predictions found", signals: 0 };
    }

    let signalsProcessed = 0;

    for (const config of activeConfigs) {
      if (config.mode === 'observer') continue;

      for (const prediction of recentPredictions) {
        if (!prediction.signal || prediction.signal === 'HOLD') continue;

        const isBuy = prediction.signal.includes('BUY');
        const isSell = prediction.signal.includes('SELL');
        if (!isBuy && !isSell) continue;

        const confidence = prediction.confidence === 'HIGH' ? 0.85 :
                          prediction.confidence === 'MEDIUM' ? 0.70 : 0.55;

        const allowedSignals = JSON.parse(config.allowedSignals || '["BUY","STRONG_BUY"]') as string[];
        if (!allowedSignals.includes(prediction.signal)) continue;

        const allowedHorizons = JSON.parse(config.allowedHorizons || '["1h","4h"]') as string[];
        if (prediction.horizon && !allowedHorizons.includes(prediction.horizon)) continue;

        try {
          await step.run(`process-signal-${config.userId}-${prediction.id}`, async () => {
            const signal: SignalEvaluation = {
              tokenAddress: prediction.ticker || '',
              tokenSymbol: prediction.ticker || '',
              tokenName: prediction.ticker || '',
              chain: prediction.assetType === 'crypto' ? 'solana' : 'solana',
              currentPrice: parseFloat(prediction.priceAtPrediction?.toString() || '0'),
              signal: prediction.signal as any,
              signalConfidence: confidence,
              horizon: (prediction.horizon as any) || '1h',
              predictionId: prediction.id?.toString(),
              indicators: prediction.indicators ? JSON.parse(prediction.indicators as string) : {},
            };

            const decision = await tradeExecutionService.evaluateSignal(config.userId, signal);
            if (decision.shouldTrade) {
              signalsProcessed++;
            }
            return decision;
          });
        } catch (error: any) {
          console.error(`[AutoTrade] Error processing signal for ${config.userId}: ${error.message}`);
        }
      }
    }

    console.log(`✅ [AutoTrade] ML scan complete: ${signalsProcessed} signals processed for ${activeConfigs.length} users`);
    return {
      timestamp: new Date().toISOString(),
      activeUsers: activeConfigs.length,
      predictionsScanned: recentPredictions.length,
      signalsProcessed,
    };
  }
);

export const autoTradeWorkerFunctions = [
  autoTradeSignalProcessor,
  autoTradeDailyReport,
  autoTradeKillSwitchMonitor,
  autoTradeApprovalReminder,
  autoTradeMLScanner,
];
