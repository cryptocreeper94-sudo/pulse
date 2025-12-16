import { inngest } from "./client";
import { autonomousTradingService } from "../../services/autonomousTradingService.js";
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

export const signalCurationWorker = inngest.createFunction(
  {
    id: "autonomous-trading-signal-curation",
    name: "Curate High-Confidence Signals",
  },
  [
    { cron: "*/5 * * * *" },
    { event: "autonomous-trading/curate-signals" },
  ],
  async ({ event, step }) => {
    console.log("📊 [AutonomousTrading] Curating high-confidence signals...");

    const activeProfiles = await step.run("get-active-profiles", async () => {
      return await autonomousTradingService.getActiveProfiles();
    });

    if (activeProfiles.length === 0) {
      return { message: "No active trading profiles", suggestionsCreated: 0 };
    }

    const predictions = await step.run("get-high-confidence-predictions", async () => {
      return await autonomousTradingService.getHighConfidencePredictions(0.65, 20);
    });

    let suggestionsCreated = 0;

    for (const profile of activeProfiles) {
      if (profile.mode === 'observer') continue;

      const minConfidence = parseFloat(profile.minConfidenceThreshold || '0.65');

      for (const prediction of predictions) {
        if (prediction.confidence === 'HIGH' || prediction.confidence === 'MEDIUM') {
          try {
            await step.run(`create-suggestion-${profile.userId}-${prediction.id}`, async () => {
              const existingSuggestions = await autonomousTradingService.getSuggestions(profile.userId, 'pending');
              const alreadyExists = existingSuggestions.some(s => s.ticker === prediction.ticker);
              
              if (!alreadyExists) {
                const indicators = JSON.parse(prediction.indicators || '{}');
                await autonomousTradingService.createTradeSuggestion({
                  userId: profile.userId,
                  predictionId: prediction.id,
                  ticker: prediction.ticker,
                  chain: prediction.assetType === 'crypto' ? 'solana' : 'stock',
                  signal: prediction.signal,
                  confidence: prediction.confidence === 'HIGH' ? 0.85 : 0.65,
                  entryPrice: prediction.priceAtPrediction,
                  rationale: `AI Signal: ${prediction.signal} with ${prediction.confidence} confidence. RSI: ${indicators.rsi?.toFixed(2) || 'N/A'}`,
                  expiresInMinutes: 60,
                });
                suggestionsCreated++;
              }
            });
          } catch (error: any) {
            console.error(`Failed to create suggestion: ${error.message}`);
          }
        }
      }
    }

    console.log(`✅ [AutonomousTrading] Created ${suggestionsCreated} new suggestions`);

    return {
      timestamp: new Date().toISOString(),
      activeProfiles: activeProfiles.length,
      predictionsChecked: predictions.length,
      suggestionsCreated,
    };
  }
);

export const approvalExpiryWorker = inngest.createFunction(
  {
    id: "autonomous-trading-approval-expiry",
    name: "Expire Pending Suggestions",
  },
  [
    { cron: "0 * * * *" },
    { event: "autonomous-trading/expire-suggestions" },
  ],
  async ({ event, step }) => {
    console.log("⏰ [AutonomousTrading] Checking for expired suggestions...");

    await step.run("expire-suggestions", async () => {
      return await autonomousTradingService.expireSuggestions();
    });

    return {
      timestamp: new Date().toISOString(),
      message: "Expired pending suggestions checked",
    };
  }
);

export const semiAutoExecutorWorker = inngest.createFunction(
  {
    id: "autonomous-trading-semi-auto-executor",
    name: "Execute Semi-Auto Trades",
  },
  [
    { cron: "* * * * *" },
    { event: "autonomous-trading/execute-semi-auto" },
  ],
  async ({ event, step }) => {
    console.log("🚀 [AutonomousTrading] Executing trades based on mode...");

    const activeProfiles = await step.run("get-profiles", async () => {
      return await autonomousTradingService.getActiveProfiles();
    });

    let executed = 0;
    let skippedApprovalMode = 0;
    let skippedConfidenceThreshold = 0;

    for (const profile of activeProfiles) {
      if (profile.killSwitchActive) continue;

      const approvedSuggestions = await step.run(`get-approved-${profile.userId}`, async () => {
        return await autonomousTradingService.getSuggestions(profile.userId, 'approved');
      });

      for (const suggestion of approvedSuggestions) {
        try {
          await step.run(`execute-${suggestion.id}`, async () => {
            const riskCheck = await autonomousTradingService.checkRiskLimits(
              profile.userId,
              parseFloat(suggestion.suggestedSizeUsd || '0')
            );

            if (riskCheck.allowed) {
              await autonomousTradingService.executeTrade(suggestion.id);
              executed++;
            } else {
              console.log(`⚠️ Risk check failed for ${suggestion.id}: ${riskCheck.reason}`);
            }
          });
        } catch (error: any) {
          console.error(`❌ Failed to execute ${suggestion.id}: ${error.message}`);
        }
      }

      if (profile.mode === 'approval') {
        const pendingSuggestions = await step.run(`get-pending-approval-${profile.userId}`, async () => {
          return await autonomousTradingService.getSuggestions(profile.userId, 'pending');
        });
        skippedApprovalMode += pendingSuggestions.length;
        console.log(`📋 [Approval Mode] User ${profile.userId.slice(0, 8)}... has ${pendingSuggestions.length} pending suggestions awaiting manual approval`);
        continue;
      }

      if (profile.mode === 'semi_auto' || profile.mode === 'full_auto') {
        const pendingSuggestions = await step.run(`get-pending-${profile.userId}`, async () => {
          return await autonomousTradingService.getSuggestions(profile.userId, 'pending');
        });

        const minConfidence = parseFloat(profile.minConfidenceThreshold || '0.65');

        for (const suggestion of pendingSuggestions) {
          const confidence = parseFloat(suggestion.confidence || '0');

          if (profile.mode === 'full_auto') {
            try {
              await step.run(`full-auto-execute-${suggestion.id}`, async () => {
                await autonomousTradingService.approveSuggestion(suggestion.id);
                
                const riskCheck = await autonomousTradingService.checkRiskLimits(
                  profile.userId,
                  parseFloat(suggestion.suggestedSizeUsd || '0')
                );

                if (riskCheck.allowed) {
                  await autonomousTradingService.executeTrade(suggestion.id);
                  executed++;
                  console.log(`🤖 [Full Auto] Executed ${suggestion.ticker} for user ${profile.userId.slice(0, 8)}...`);
                }
              });
            } catch (error: any) {
              console.error(`❌ Failed to full-auto execute ${suggestion.id}: ${error.message}`);
            }
          } else if (profile.mode === 'semi_auto') {
            if (confidence >= minConfidence) {
              try {
                await step.run(`semi-auto-execute-${suggestion.id}`, async () => {
                  await autonomousTradingService.approveSuggestion(suggestion.id);
                  
                  const riskCheck = await autonomousTradingService.checkRiskLimits(
                    profile.userId,
                    parseFloat(suggestion.suggestedSizeUsd || '0')
                  );

                  if (riskCheck.allowed) {
                    await autonomousTradingService.executeTrade(suggestion.id);
                    executed++;
                    console.log(`⚡ [Semi-Auto] Executed ${suggestion.ticker} (confidence: ${(confidence * 100).toFixed(1)}% >= ${(minConfidence * 100).toFixed(1)}%) for user ${profile.userId.slice(0, 8)}...`);
                  }
                });
              } catch (error: any) {
                console.error(`❌ Failed to semi-auto execute ${suggestion.id}: ${error.message}`);
              }
            } else {
              skippedConfidenceThreshold++;
              console.log(`📊 [Semi-Auto] Skipped ${suggestion.ticker} - confidence ${(confidence * 100).toFixed(1)}% below threshold ${(minConfidence * 100).toFixed(1)}%`);
            }
          }
        }
      }
    }

    console.log(`✅ [AutonomousTrading] Executed ${executed} trades, skipped ${skippedApprovalMode} (approval mode), ${skippedConfidenceThreshold} (below threshold)`);

    return {
      timestamp: new Date().toISOString(),
      profilesChecked: activeProfiles.length,
      tradesExecuted: executed,
      skippedApprovalMode,
      skippedConfidenceThreshold,
    };
  }
);

export const safetyMonitorWorker = inngest.createFunction(
  {
    id: "autonomous-trading-safety-monitor",
    name: "Monitor Daily Loss Limits",
  },
  [
    { cron: "*/15 * * * *" },
    { event: "autonomous-trading/safety-check" },
  ],
  async ({ event, step }) => {
    console.log("🛡️ [AutonomousTrading] Running safety monitor...");

    const alerts = await step.run("check-daily-limits", async () => {
      return await autonomousTradingService.checkDailyLossLimits();
    });

    if (alerts.length > 0 && ADMIN_TELEGRAM_ID) {
      await step.run("send-alerts", async () => {
        for (const alert of alerts) {
          const message = `
🛑 <b>KILL SWITCH TRIGGERED</b>

👤 <b>User:</b> ${alert.userId.slice(0, 8)}...
📉 <b>Daily Loss:</b> $${alert.dailyLoss.toFixed(2)}
⚠️ <b>Max Allowed:</b> $${alert.maxLoss.toFixed(2)}

<i>Trading has been automatically halted.</i>
`.trim();

          await sendTelegramMessage(ADMIN_TELEGRAM_ID, message);
        }
        return { alertsSent: alerts.length };
      });
    }

    return {
      timestamp: new Date().toISOString(),
      killSwitchesTriggered: alerts.length,
      alerts,
    };
  }
);

export const milestoneTrackerWorker = inngest.createFunction(
  {
    id: "autonomous-trading-milestone-tracker",
    name: "Track Full Auto Milestone",
  },
  [
    { cron: "0 * * * *" },
    { event: "autonomous-trading/check-milestone" },
  ],
  async ({ event, step }) => {
    console.log("📈 [AutonomousTrading] Checking Full Auto milestone...");

    const milestone = await step.run("check-milestone", async () => {
      return await autonomousTradingService.checkFullAutoMilestone();
    });

    if (milestone.isCompleted && ADMIN_TELEGRAM_ID) {
      await step.run("notify-milestone-complete", async () => {
        const message = `
🎉 <b>MILESTONE COMPLETE!</b>

📊 <b>Full Auto Unlock Available</b>
✅ <b>Evaluated Outcomes:</b> ${milestone.currentValue}/${milestone.targetValue}
📈 <b>Progress:</b> ${milestone.progress}%

<i>Users can now unlock Full Auto mode!</i>
`.trim();

        await sendTelegramMessage(ADMIN_TELEGRAM_ID, message);
        return { notified: true };
      });
    }

    return {
      timestamp: new Date().toISOString(),
      milestone,
    };
  }
);

export const autonomousTradingWorkerFunctions = [
  signalCurationWorker,
  approvalExpiryWorker,
  semiAutoExecutorWorker,
  safetyMonitorWorker,
  milestoneTrackerWorker,
];
