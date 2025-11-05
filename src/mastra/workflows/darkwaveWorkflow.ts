import { createStep, createWorkflow } from "../inngest";
import { z } from "zod";
import { marketDataTool } from "../tools/marketDataTool";
import { technicalAnalysisTool } from "../tools/technicalAnalysisTool";
import { scannerTool } from "../tools/scannerTool";

/**
 * DarkWave-V2 Workflow - NO AI, NO WALLET (disabled to prevent issues)
 * Budget-friendly: Free APIs only, no OpenAI
 */

const processMessage = createStep({
  id: "process-telegram-message",
  description: "Processes commands without AI - simple pattern matching",

  inputSchema: z.object({
    message: z.string(),
    userId: z.string().optional(),
  }),

  outputSchema: z.object({
    response: z.string(),
    success: z.boolean(),
  }),

  execute: async ({ inputData, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    const msg = inputData.message.trim().toUpperCase();
    const userId = inputData.userId || "default-user";

    logger?.info('🚀 [DarkWaveWorkflow] Processing command', { message: msg, userId });

    try {
      // WALLET command - retrieve existing wallet
      if (msg === "WALLET") {
        logger?.info('🔐 [DarkWaveWorkflow] Getting wallet for user', { userId });
        const { walletGeneratorTool } = await import('../tools/walletGeneratorTool');
        const result = await walletGeneratorTool.execute({ 
          context: {},
          mastra, 
          runtimeContext: { resourceId: userId } as any
        });
        logger?.info('🔐 [DarkWaveWorkflow] Wallet result', { userId, address: result.walletAddress });
        return {
          response: `🔐 **Your Wallet**\n\n${result.message}\n\nAddress: ${result.walletAddress}`,
          success: result.success
        };
      }

      // BALANCE command - check wallet balance
      if (msg === "BALANCE") {
        logger?.info('💰 [DarkWaveWorkflow] Checking balance for user', { userId });
        const { balanceCheckerTool } = await import('../tools/balanceCheckerTool');
        const result = await balanceCheckerTool.execute({ 
          context: {},
          mastra, 
          runtimeContext: { resourceId: userId } as any
        });
        logger?.info('💰 [DarkWaveWorkflow] Balance result', { userId, success: result.success });
        return {
          response: `💰 **Wallet Balance**\n\n${result.message}\nAddress: ${result.walletAddress}`,
          success: result.success
        };
      }

      // WITHDRAW disabled for safety
      if (msg.startsWith("WITHDRAW")) {
        return {
          response: "⚠️ Withdrawals disabled for safety. Contact admin to enable.",
          success: true
        };
      }

      // SCAN command - LIMITED TO 10 TICKERS
      if (msg === "SCAN" || msg === "CRYPTO") {
        const result = await scannerTool.execute({ 
          context: { type: "crypto", limit: 10 },
          mastra, 
          runtimeContext: undefined as any
        });
        
        if (result.strongBuys.length === 0) {
          return {
            response: "⚠️ No strong buy signals found in top 10 cryptos. Try again later.",
            success: true
          };
        }

        let response = "🔍 **Top 10 Crypto Scan**\n\n";
        result.strongBuys.slice(0, 10).forEach((rec: any) => {
          response += `🟢 **${rec.ticker}** - ${rec.recommendation}\n`;
          response += `💰 $${rec.currentPrice} | 📊 RSI: ${rec.rsi?.toFixed(1)} | Signals: ${rec.signalCount.bullish}\n\n`;
        });
        
        return { response, success: true };
      }

      // Single ticker analysis (BTC, ETH, etc.)
      const ticker = msg.replace(/[^A-Z]/g, '');
      if (ticker.length >= 2 && ticker.length <= 6) {
        logger?.info('📊 [DarkWaveWorkflow] Analyzing ticker', { ticker });
        
        const marketData = await marketDataTool.execute({ 
          context: { ticker, days: 90 },
          mastra, 
          runtimeContext: undefined as any
        });

        const analysis = await technicalAnalysisTool.execute({ 
          context: { 
            ticker: marketData.ticker,
            currentPrice: marketData.currentPrice,
            priceChange24h: marketData.priceChange24h,
            priceChangePercent24h: marketData.priceChangePercent24h,
            volume24h: marketData.volume24h,
            prices: marketData.prices,
          },
          mastra, 
          runtimeContext: undefined as any
        });

        let emoji = "🟡";
        if (analysis.recommendation === "BUY" || analysis.recommendation === "STRONG_BUY") emoji = "🟢";
        if (analysis.recommendation === "SELL" || analysis.recommendation === "STRONG_SELL") emoji = "🔴";

        const response = `${emoji} **${ticker} Analysis**\n\n` +
          `💰 **Price:** $${analysis.currentPrice?.toFixed(4)}\n` +
          `📈 **24h Change:** ${analysis.priceChange24h >= 0 ? '+' : ''}${analysis.priceChange24h?.toFixed(2)}%\n\n` +
          `**${analysis.recommendation}**\n\n` +
          `📊 **Indicators:**\n` +
          `• **RSI:** ${analysis.rsi?.toFixed(1)}\n` +
          `• **MACD:** ${analysis.macd?.value.toFixed(2)} | Signal: ${analysis.macd?.signal.toFixed(2)}\n` +
          `• **EMA 50:** $${analysis.ema50?.toFixed(4)}\n` +
          `• **Support:** $${analysis.support?.toFixed(4)}\n` +
          `• **Resistance:** $${analysis.resistance?.toFixed(4)}\n\n` +
          `⚠️ **Signals (${analysis.signals?.length || 0}):**\n` +
          (analysis.signals?.slice(0, 3).map(s => `• ${s}`).join('\n') || 'None');

        return { response, success: true };
      }

      // Unknown command
      return {
        response: "Commands:\n• BTC, ETH, SOL (any ticker)\n• SCAN - Top 10 cryptos\n\n⚠️ Wallet features disabled",
        success: true
      };

    } catch (error: any) {
      logger?.error('❌ [DarkWaveWorkflow] Error', { error: error.message });
      return {
        response: `⚠️ Error: ${error.message}`,
        success: false
      };
    }
  },
});

export const darkwaveWorkflow = createWorkflow({
  id: "darkwave-workflow",
  
  inputSchema: z.object({
    message: z.string(),
    userId: z.string().optional(),
  }),

  outputSchema: z.object({
    response: z.string(),
    success: z.boolean(),
  }),
})
  .then(processMessage)
  .commit();
