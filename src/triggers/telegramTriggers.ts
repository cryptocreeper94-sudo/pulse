import type { ContentfulStatusCode } from "hono/utils/http-status";

import { registerApiRoute } from "../mastra/inngest";
import { Mastra } from "@mastra/core";
import { darkwaveWorkflow } from "../mastra/workflows/darkwaveWorkflow";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN_NEW || process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_TOKEN) {
  console.warn(
    "Trying to initialize Telegram triggers without TELEGRAM_TOKEN_NEW or TELEGRAM_BOT_TOKEN. Can you confirm that the Telegram integration is configured correctly?",
  );
}

export type TriggerInfoTelegramOnNewMessage = {
  type: "telegram/message";
  params: {
    userName: string;
    message: string;
  };
  payload: any;
};

/**
 * Convert button callback data to text command
 */
function convertCallbackToCommand(callbackData: string): string {
  // Alert buttons
  if (callbackData.startsWith('alert_')) {
    const ticker = callbackData.replace('alert_', '');
    return `create alert for ${ticker}`;
  }
  
  // Trade buttons
  if (callbackData.startsWith('trade_')) {
    const ticker = callbackData.replace('trade_', '');
    return `create order for ${ticker}`;
  }
  
  // Watchlist buttons
  if (callbackData.startsWith('hold_')) {
    const ticker = callbackData.replace('hold_', '');
    return `hold ${ticker}`;
  }
  
  // Refresh buttons
  if (callbackData.startsWith('refresh_')) {
    const ticker = callbackData.replace('refresh_', '');
    return ticker;
  }
  
  // Toggle buttons (on/off)
  if (callbackData === 'on_alerts') return 'on alerts';
  if (callbackData === 'off_alerts') return 'off alerts';
  if (callbackData === 'on_sniping') return 'on sniping';
  if (callbackData === 'off_sniping') return 'off sniping';
  
  // Scope buttons
  if (callbackData === 'scope_stocks') return 'stocks only';
  if (callbackData === 'scope_coins') return 'coins only';
  if (callbackData === 'scope_both') return 'both';
  
  // Exchange buttons
  if (callbackData === 'exchange_kraken') return 'kraken links';
  if (callbackData === 'exchange_dex') return 'dex links';
  
  // Wallet/Trading buttons
  if (callbackData === 'refresh_balance') return 'balance';
  if (callbackData === 'list_orders') return 'orders';
  if (callbackData === 'snipe_status') return 'sniping';
  if (callbackData === 'view_settings') return 'settings';
  
  // Scan buttons
  if (callbackData === 'scan_rescan') return 'crypto';
  if (callbackData === 'scan_add_all') return 'add scan results to watchlist';
  if (callbackData === 'scan_crypto') return 'crypto';
  
  // Holdings buttons
  if (callbackData === 'holdings_refresh') return 'list';
  if (callbackData === 'holdings_clear') return 'clear watchlist';
  
  // Help
  if (callbackData === 'show_help') return 'commands';
  
  // Default
  return callbackData;
}

/**
 * Build context-aware inline keyboard buttons based on response content
 */
function buildInlineKeyboard(responseText: string, originalMessage: string): any[] | null {
  const buttons: any[] = [];
  
  // Extract ticker symbol if present (BTC, ETH, AAPL, etc.)
  const tickerMatch = responseText.match(/(?:📊|💰|🟢|🔴|🟡)\s*\*?\*?([A-Z]{2,5})\*?\*?/);
  const ticker = tickerMatch ? tickerMatch[1] : null;
  
  // Detect message type
  const isAnalysis = responseText.includes('Technical Analysis') || responseText.includes('**RSI**');
  const isSettings = responseText.includes('Control Center') || responseText.includes('DarkWave Control Center');
  const isWallet = responseText.includes('Wallet') && responseText.includes('SOL');
  const isScan = responseText.includes('Market Scan') || responseText.includes('Scan Results');
  const isHoldings = responseText.includes('Holdings') || responseText.includes('Watchlist');
  
  // Analysis message - show quick action buttons
  if (isAnalysis && ticker) {
    buttons.push([
      { text: '📈 View Chart', url: `https://www.dexscreener.com/search?q=${ticker}` },
      { text: '🔔 Set Alert', callback_data: `alert_${ticker}` }
    ]);
    buttons.push([
      { text: '💰 Create Order', callback_data: `trade_${ticker}` },
      { text: '⭐ Add to Watchlist', callback_data: `hold_${ticker}` }
    ]);
    buttons.push([
      { text: '🔄 Refresh Analysis', callback_data: `refresh_${ticker}` }
    ]);
  }
  
  // Settings/Control Center - show quick toggles with current state
  if (isSettings) {
    // Parse state from specific sections to avoid cross-contamination
    const alertsSection = responseText.match(/🎯 PRICE ALERTS[\s\S]*?├─ Enabled: (✅ ON|❌ OFF)/);
    const snipingSection = responseText.match(/🎯 SNIPING[\s\S]*?├─ Enabled: (✅ ON|❌ OFF)/);
    const scopeSection = responseText.match(/🔍 ANALYSIS[\s\S]*?├─ Asset scope: (.+)/);
    const exchangeSection = responseText.match(/Exchange links: (\w+)/);
    
    const alertsOn = alertsSection ? alertsSection[1] === '✅ ON' : false;
    const snipingOn = snipingSection ? snipingSection[1] === '✅ ON' : false;
    const currentScope = scopeSection ? 
                        (scopeSection[1].includes('Stocks only') ? 'stocks' : 
                         scopeSection[1].includes('Crypto only') ? 'coins' : 'both') : 'both';
    const currentExchange = exchangeSection ? exchangeSection[1].toLowerCase() : 'dexscreener';
    
    buttons.push([
      { text: alertsOn ? '🔔 Alerts ✅' : '🔔 Alerts ❌', callback_data: alertsOn ? 'off_alerts' : 'on_alerts' },
      { text: snipingOn ? '🎯 Sniping ✅' : '🎯 Sniping ❌', callback_data: snipingOn ? 'off_sniping' : 'on_sniping' }
    ]);
    buttons.push([
      { text: currentScope === 'stocks' ? '📊 Stocks ✅' : '📊 Stocks', callback_data: 'scope_stocks' },
      { text: currentScope === 'coins' ? '🪙 Crypto ✅' : '🪙 Crypto', callback_data: 'scope_coins' },
      { text: currentScope === 'both' ? '📊🪙 Both ✅' : '📊🪙 Both', callback_data: 'scope_both' }
    ]);
    buttons.push([
      { text: currentExchange === 'kraken' ? '🔗 Kraken ✅' : '🔗 Kraken', callback_data: 'exchange_kraken' },
      { text: currentExchange === 'dexscreener' ? '🔗 Dex ✅' : '🔗 Dex', callback_data: 'exchange_dex' }
    ]);
  }
  
  // Wallet - show balance and trade buttons
  if (isWallet) {
    buttons.push([
      { text: '🔄 Refresh Balance', callback_data: 'refresh_balance' },
      { text: '📋 My Orders', callback_data: 'list_orders' }
    ]);
    buttons.push([
      { text: '🎯 Sniping Status', callback_data: 'snipe_status' },
      { text: '⚙️ Settings', callback_data: 'view_settings' }
    ]);
  }
  
  // Market scan - show filter buttons
  if (isScan) {
    buttons.push([
      { text: '🔄 Re-scan', callback_data: 'scan_rescan' },
      { text: '⭐ Add All to Watchlist', callback_data: 'scan_add_all' }
    ]);
  }
  
  // Holdings/Watchlist - show management buttons
  if (isHoldings) {
    buttons.push([
      { text: '🔄 Refresh All', callback_data: 'holdings_refresh' },
      { text: '🗑️ Clear List', callback_data: 'holdings_clear' }
    ]);
    buttons.push([
      { text: '📊 Full Scan', callback_data: 'scan_crypto' }
    ]);
  }
  
  // Always add help button at bottom
  if (buttons.length > 0) {
    buttons.push([
      { text: '❓ Help', callback_data: 'show_help' },
      { text: '⚙️ Settings', callback_data: 'view_settings' }
    ]);
  }
  
  return buttons.length > 0 ? buttons : null;
}

export function registerTelegramTrigger({
  triggerType,
  handler,
}: {
  triggerType: string;
  handler: (
    mastra: Mastra,
    triggerInfo: TriggerInfoTelegramOnNewMessage,
  ) => Promise<void>;
}) {
  return [
    {
      path: "/api/webhooks/telegram",
      method: "POST" as const,
      createHandler: async ({ mastra }: { mastra: Mastra }) => async (c: any) => {
        const logger = mastra.getLogger();
        try {
          const payload = await c.req.json();

          // Handle callback queries (button clicks)
          if (payload.callback_query) {
            logger?.info("🔘 [Telegram] Button clicked", { 
              data: payload.callback_query.data,
              from: payload.callback_query.from?.username
            });
            
            const callbackData = payload.callback_query.data;
            const chatId = payload.callback_query.message?.chat?.id;
            const userId = payload.callback_query.from?.id?.toString();
            
            // Answer callback to remove loading state
            const answerUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`;
            await fetch(answerUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ callback_query_id: payload.callback_query.id }),
            });
            
            // Convert button click to text command
            const commandText = convertCallbackToCommand(callbackData);
            logger?.info("🔄 [Telegram] Converting button to command", { 
              callback: callbackData,
              command: commandText 
            });
            
            // Process as workflow
            (async () => {
              try {
                const run = await darkwaveWorkflow.createRunAsync();
                const workflowResult = await run.start({ 
                  inputData: {
                    message: commandText,
                    userId: userId || 'unknown',
                  }
                });

                let responseText = "";
                if (workflowResult.status === "success") {
                  const stepResult = workflowResult.steps['process-telegram-message'];
                  if (stepResult && stepResult.status === 'success' && 'output' in stepResult) {
                    responseText = stepResult.output.response || "✅ Done!";
                  }
                }

                if (responseText && chatId) {
                  const keyboard = buildInlineKeyboard(responseText, commandText);
                  
                  const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
                  await fetch(telegramApiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      chat_id: chatId,
                      text: responseText,
                      parse_mode: "Markdown",
                      reply_markup: keyboard ? { inline_keyboard: keyboard } : undefined,
                    }),
                  });
                }
              } catch (error: any) {
                logger?.error("❌ [Telegram] Button handler error", { error: error.message });
              }
            })();
            
            return c.text("OK", 200);
          }

          logger?.info("📝 [Telegram] Received message", { 
            from: payload.message?.from?.username,
            text: payload.message?.text?.substring(0, 50)
          });

          // Extract message and user info
          const messageText = payload.message?.text || "";
          const userId = payload.message?.from?.id?.toString() || "unknown";
          const chatId = payload.message?.chat?.id;

          // Respond to Telegram immediately to avoid timeout
          logger?.info("🚀 [Telegram] Processing async");
          
          // Process workflow asynchronously (don't await)
          (async () => {
            try {
              const run = await darkwaveWorkflow.createRunAsync();
              const workflowResult = await run.start({ 
                inputData: {
                  message: messageText,
                  userId: userId,
                }
              });

              logger?.info("✅ [Telegram] Workflow completed", { 
                status: workflowResult.status,
                hasSteps: !!workflowResult.steps
              });

              // Send response back to Telegram
              let responseText = "";
              if (workflowResult.status === "success") {
                const stepResult = workflowResult.steps['process-telegram-message'];
                if (stepResult && stepResult.status === 'success' && 'output' in stepResult) {
                  responseText = stepResult.output.response || "⚠️ No response generated";
                  logger?.info("📤 [Telegram] Sending response", { textLength: responseText.length });
                } else {
                  responseText = "⚠️ No response generated from workflow.";
                  logger?.warn("⚠️ [Telegram] No step output found");
                }
              } else if (workflowResult.status === "failed") {
                responseText = "⚠️ Error processing your request. Please try again.";
                logger?.warn("⚠️ [Telegram] Workflow failed", { status: workflowResult.status });
              }

              if (responseText && chatId) {
                logger?.info("📤 [Telegram] Preparing to send", { 
                  chatId, 
                  textPreview: responseText.substring(0, 100),
                  fullLength: responseText.length 
                });
                
                // Build inline keyboard based on message context
                const keyboard = buildInlineKeyboard(responseText, messageText);
                
                const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
                const telegramResponse = await fetch(telegramApiUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: responseText,
                    parse_mode: "Markdown",
                    reply_markup: keyboard ? { inline_keyboard: keyboard } : undefined,
                  }),
                });
                
                const responseData = await telegramResponse.json();
                logger?.info("📨 [Telegram] Message sent", { 
                  ok: responseData.ok, 
                  statusCode: telegramResponse.status,
                  chatId,
                  hasButtons: !!keyboard
                });
                
                if (!responseData.ok) {
                  logger?.error("❌ [Telegram] Failed to send message", { 
                    error: responseData.description,
                    chatId,
                    textPreview: responseText.substring(0, 200)
                  });
                }
              }

              // Call the original handler for compatibility
              await handler(mastra, {
                type: triggerType,
                params: {
                  userName: payload.message.from.username,
                  message: messageText,
                },
                payload,
              } as TriggerInfoTelegramOnNewMessage);
            } catch (error: any) {
              logger?.error("❌ [Telegram] Async workflow error", { error: error.message });
            }
          })();

          return c.text("OK", 200);
        } catch (error: any) {
          logger?.error("❌ [Telegram] Error handling webhook", { error: error.message });
          return c.text("Internal Server Error", 500);
        }
      },
    },
  ];
}
