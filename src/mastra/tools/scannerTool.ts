import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { marketDataTool } from "./marketDataTool";
import { technicalAnalysisTool } from "./technicalAnalysisTool";

/**
 * Scanner Tool - Scans top cryptos and stocks for strong buy signals
 * Returns only assets that meet buy criteria based on technical analysis
 */

// Crypto name mapping for display purposes
const CRYPTO_NAMES: Record<string, string> = {
  'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'SOL': 'Solana', 'BNB': 'BNB', 'XRP': 'XRP',
  'ADA': 'Cardano', 'DOGE': 'Dogecoin', 'AVAX': 'Avalanche', 'LINK': 'Chainlink', 
  'MATIC': 'Polygon', 'DOT': 'Polkadot', 'UNI': 'Uniswap', 'ATOM': 'Cosmos', 
  'LTC': 'Litecoin', 'BCH': 'Bitcoin Cash', 'NEAR': 'NEAR Protocol', 'APT': 'Aptos',
  'ARB': 'Arbitrum', 'OP': 'Optimism', 'SUI': 'Sui', 'FIL': 'Filecoin', 
  'ICP': 'Internet Computer', 'VET': 'VeChain', 'ALGO': 'Algorand', 'SAND': 'The Sandbox',
  'MANA': 'Decentraland', 'AXS': 'Axie Infinity', 'FTM': 'Fantom', 'AAVE': 'Aave',
  'GRT': 'The Graph', 'SNX': 'Synthetix', 'AR': 'Arweave', 'HBAR': 'Hedera',
  'XLM': 'Stellar', 'TRX': 'TRON', 'ETC': 'Ethereum Classic', 'XMR': 'Monero',
  'TON': 'Toncoin', 'SHIB': 'Shiba Inu', 'PEPE': 'Pepe', 'WIF': 'dogwifhat',
  'BONK': 'Bonk', 'FLOKI': 'FLOKI', 'INJ': 'Injective', 'TIA': 'Celestia',
  'SEI': 'Sei', 'RUNE': 'THORChain', 'OSMO': 'Osmosis', 'JUNO': 'Juno', 'CRV': 'Curve DAO'
};

export const scannerTool = createTool({
  id: "scanner-tool",
  description: "Scans top cryptocurrencies or stocks for spike potential based on historic patterns. Returns assets showing strong buy signals with bullish convergence (volume spikes, RSI recovery, MACD crossovers, resistance breaks). Use when user says 'crypto' or 'stock'.",

  inputSchema: z.object({
    type: z.enum(['crypto', 'stock']).describe("Type of assets to scan - 'crypto' for top 50 cryptocurrencies, 'stock' for top 100 stocks"),
    limit: z.number().optional().default(10).describe("Maximum number of results to return"),
  }),

  outputSchema: z.object({
    scannedCount: z.number(),
    strongBuys: z.array(z.object({
      ticker: z.string(),
      name: z.string(),
      type: z.string(),
      currentPrice: z.number(),
      volume24h: z.number(),
      volumeChangePercent: z.number(),
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

    // Top 50 crypto tickers by market cap (optimized for CoinGecko free tier rate limits)
    const TOP_50_CRYPTOS = [
      'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK', 'MATIC',
      'DOT', 'UNI', 'ATOM', 'LTC', 'BCH', 'NEAR', 'APT', 'ARB', 'OP', 'SUI',
      'FIL', 'ICP', 'VET', 'ALGO', 'SAND', 'MANA', 'AXS', 'FTM', 'AAVE', 'GRT',
      'SNX', 'AR', 'HBAR', 'XLM', 'TRX', 'ETC', 'XMR', 'TON', 'SHIB', 'PEPE',
      'WIF', 'BONK', 'FLOKI', 'INJ', 'TIA', 'SEI', 'RUNE', 'OSMO', 'JUNO', 'CRV',
    ];

    // Top 100 stock tickers by market cap
    const TOP_100_STOCKS = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'WMT',
      'JNJ', 'PG', 'MA', 'HD', 'CVX', 'MRK', 'ABBV', 'PEP', 'KO', 'COST',
      'AVGO', 'TMO', 'ORCL', 'ACN', 'MCD', 'CSCO', 'NKE', 'ABT', 'ADBE', 'CRM',
      'LIN', 'NFLX', 'PFE', 'DHR', 'TXN', 'DIS', 'UNP', 'VZ', 'INTC', 'AMD',
      'NEE', 'CMCSA', 'UNH', 'RTX', 'QCOM', 'PM', 'BMY', 'HON', 'T', 'AMGN',
      'BA', 'GE', 'IBM', 'CAT', 'SBUX', 'LOW', 'INTU', 'ISRG', 'MS', 'GS',
      'BLK', 'AXP', 'DE', 'SPGI', 'NOW', 'GILD', 'BKNG', 'MDLZ', 'LRCX', 'ADI',
      'MMM', 'SYK', 'VRTX', 'AMT', 'PLD', 'TJX', 'REGN', 'ZTS', 'CI', 'CVS',
      'MO', 'CB', 'SO', 'BDX', 'DUK', 'TGT', 'USB', 'PNC', 'EOG', 'CCI',
      'CL', 'ITW', 'BSX', 'SHW', 'APD', 'EL', 'CME', 'EQIX', 'NSC', 'MCO',
    ];

    let tickersToScan: { ticker: string; type: 'crypto' | 'stock' }[] = [];

    if (context.type === 'crypto') {
      tickersToScan.push(...TOP_50_CRYPTOS.map(t => ({ ticker: t, type: 'crypto' as const })));
    } else if (context.type === 'stock') {
      tickersToScan.push(...TOP_100_STOCKS.map(t => ({ ticker: t, type: 'stock' as const })));
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
            name: type === 'crypto' ? (CRYPTO_NAMES[ticker] || ticker) : ticker,
            type,
            currentPrice: analysis.currentPrice,
            volume24h: marketData.volume24h,
            volumeChangePercent: analysis.volume.changePercent,
            priceChangePercent24h: marketData.priceChangePercent24h,
            rsi: analysis.rsi,
            recommendation: analysis.recommendation,
            signalCount: analysis.signalCount,
          });
        }

        // Add delay to avoid overwhelming Yahoo Finance
        // Crypto: 1 second (Yahoo Finance is more permissive than CoinGecko)
        // Stocks: 200ms (Yahoo Finance handles high request rates well)
        await new Promise(resolve => setTimeout(resolve, type === 'crypto' ? 1000 : 200));

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
