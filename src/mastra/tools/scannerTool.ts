import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { marketDataTool } from "./marketDataTool";
import { technicalAnalysisTool } from "./technicalAnalysisTool";

/**
 * Scanner Tool - Scans top cryptos and stocks for strong buy signals
 * Returns only assets that meet buy criteria based on technical analysis
 */

export const scannerTool = createTool({
  id: "scanner-tool",
  description: "Scans top cryptocurrencies and stocks for spike potential based on historic patterns. Returns assets showing strong buy signals with bullish convergence (volume spikes, RSI recovery, MACD crossovers, resistance breaks). Use when user says 'market'.",

  inputSchema: z.object({
    type: z.enum(['crypto', 'stock', 'both']).optional().default('both').describe("Type of assets to scan"),
    limit: z.number().optional().default(10).describe("Maximum number of results to return"),
  }),

  outputSchema: z.object({
    scannedCount: z.number(),
    strongBuys: z.array(z.object({
      ticker: z.string(),
      type: z.string(),
      currentPrice: z.number(),
      volume24h: z.number(),
      priceChangePercent24h: z.number(),
      rsi: z.number(),
      recommendation: z.string(),
      signalCount: z.object({
        bullish: z.number(),
        bearish: z.number(),
      }),
    })),
    message: z.string(),
  }),

  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [ScannerTool] Starting scan', { type: context.type, limit: context.limit });

    // Top crypto tickers to scan (reduced to avoid CoinGecko rate limits)
    const TOP_CRYPTOS = [
      'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK', 'MATIC',
    ];

    // Top stock tickers to scan (limited for API constraints)
    const TOP_STOCKS = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'WMT',
    ];

    let tickersToScan: { ticker: string; type: 'crypto' | 'stock' }[] = [];

    if (context.type === 'crypto' || context.type === 'both') {
      tickersToScan.push(...TOP_CRYPTOS.map(t => ({ ticker: t, type: 'crypto' as const })));
    }
    if (context.type === 'stock' || context.type === 'both') {
      tickersToScan.push(...TOP_STOCKS.map(t => ({ ticker: t, type: 'stock' as const })));
    }

    logger?.info('📊 [ScannerTool] Scanning tickers', { count: tickersToScan.length });

    const strongBuys: any[] = [];
    let scanned = 0;

    // Scan each ticker for buy signals
    for (const { ticker, type } of tickersToScan) {
      try {
        logger?.info(`🔍 [ScannerTool] Analyzing ${ticker}`, { type });

        // Fetch market data
        const marketData = await marketDataTool.execute({
          context: { ticker, days: 90, type },
          mastra,
          runtimeContext: undefined as any,
        });

        // Perform technical analysis
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
          runtimeContext: undefined as any,
        });

        scanned++;

        // Filter for BUY or STRONG_BUY signals
        if (analysis.recommendation === 'BUY' || analysis.recommendation === 'STRONG_BUY') {
          strongBuys.push({
            ticker: analysis.ticker,
            type,
            currentPrice: analysis.currentPrice,
            volume24h: marketData.volume24h,
            priceChangePercent24h: marketData.priceChangePercent24h,
            rsi: analysis.rsi,
            recommendation: analysis.recommendation,
            signalCount: analysis.signalCount,
          });
        }

        // Stop if we have enough results
        if (strongBuys.length >= context.limit) {
          break;
        }

        // Add delay to avoid hitting CoinGecko rate limits (critical for crypto scans)
        await new Promise(resolve => setTimeout(resolve, type === 'crypto' ? 500 : 200));

      } catch (error: any) {
        logger?.warn(`⚠️ [ScannerTool] Failed to analyze ${ticker}`, { error: error.message });
        // Continue scanning other tickers
      }
    }

    logger?.info('✅ [ScannerTool] Scan complete', { 
      scanned,
      strongBuysFound: strongBuys.length 
    });

    return {
      scannedCount: scanned,
      strongBuys,
      message: strongBuys.length > 0 
        ? `Found ${strongBuys.length} asset(s) with strong buy signals out of ${scanned} scanned.`
        : `No strong buy signals found in ${scanned} assets scanned.`,
    };
  },
});
