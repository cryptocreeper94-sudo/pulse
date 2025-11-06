import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";

/**
 * Market Data Tool - Fetches historical price data for stocks and crypto
 * Uses free APIs: CoinGecko for crypto, Yahoo Finance for stocks
 * Implements caching to stay within free tier rate limits
 */

// In-memory cache with 10-minute TTL to reduce API calls
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const marketDataTool = createTool({
  id: "market-data-tool",
  description: "Fetches historical price data for crypto or stock tickers. Returns OHLCV (Open, High, Low, Close, Volume) data for technical analysis.",

  inputSchema: z.object({
    ticker: z.string().describe("Ticker symbol (e.g., BTC, ETH, AAPL, TSLA)"),
    days: z.number().optional().default(90).describe("Number of days of historical data (default: 90)"),
    type: z.enum(["crypto", "stock"]).optional().describe("Asset type - auto-detected if not specified"),
  }),

  outputSchema: z.object({
    ticker: z.string(),
    type: z.string(),
    currentPrice: z.number(),
    priceChange24h: z.number(),
    priceChangePercent24h: z.number(),
    volume24h: z.number().optional(),
    prices: z.array(z.object({
      timestamp: z.number(),
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
      volume: z.number(),
    })),
    marketCap: z.number().optional(),
  }),

  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [MarketDataTool] Starting execution', { ticker: context.ticker, days: context.days });

    const ticker = context.ticker.toUpperCase();
    const days = context.days || 90;

    // Auto-detect asset type with fallback logic
    let assetType = context.type;
    
    if (!assetType) {
      // Common stock patterns (longer tickers, dots for classes, known extensions)
      const stockPatterns = [
        ticker.includes('.'),  // E.g., BRK.B, GOOGL.L
        ticker.length > 5,     // Most stocks are 1-5 chars, cryptos vary
        /^[A-Z]{1,5}$/.test(ticker) && ticker !== ticker.slice(0, 4).toUpperCase(), // Typical stock format
      ];
      
      // If it looks like a stock ticker, try stock first
      if (stockPatterns.some(p => p)) {
        assetType = 'stock';
      } else {
        assetType = 'crypto'; // Try crypto first for ambiguous cases
      }
    }

    logger?.info('📝 [MarketDataTool] Initial detection', { ticker, assetType });

    // STRICT SEPARATION: Crypto → Binance, Stocks → Yahoo Finance
    try {
      if (assetType === 'crypto') {
        // For crypto, use Binance ONLY (keeps crypto separate from stocks)
        logger?.info('📊 [MarketDataTool] Fetching crypto from Binance', { ticker });
        return await fetchCryptoDataWithRetry(ticker, days, logger);
      } else {
        // For stocks, use Yahoo Finance ONLY
        try {
          return await fetchStockData(ticker, days, logger);
        } catch (stockError: any) {
          logger?.warn('⚠️ [MarketDataTool] Stock fetch failed, trying as crypto', { 
            error: stockError.message 
          });
          // Fallback to crypto if stock fails
          return await fetchCryptoDataWithRetry(ticker, days, logger);
        }
      }
    } catch (error: any) {
      logger?.error('❌ [MarketDataTool] All fetch attempts failed', { error: error.message });
      throw new Error(`Failed to fetch market data for ${ticker}: Not found in crypto or stock markets`);
    }
  },
});

// CoinGecko mapping for top 100+ cryptocurrencies
// CoinGecko uses lowercase coin names as IDs (bitcoin, ethereum, etc.)
const COINGECKO_MAP: Record<string, string> = {
  // Top 10
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDT': 'tether',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'USDC': 'usd-coin',
  'XRP': 'ripple',
  'STETH': 'staked-ether',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  
  // Top 11-30
  'TRX': 'tron',
  'TON': 'the-open-network',
  'LINK': 'chainlink',
  'AVAX': 'avalanche-2',
  'SHIB': 'shiba-inu',
  'WBTC': 'wrapped-bitcoin',
  'DOT': 'polkadot',
  'DAI': 'dai',
  'BCH': 'bitcoin-cash',
  'LTC': 'litecoin',
  'MATIC': 'matic-network',
  'UNI': 'uniswap',
  'LEO': 'leo-token',
  'NEAR': 'near',
  'PEPE': 'pepe',
  'APT': 'aptos',
  'ICP': 'internet-computer',
  'WIF': 'dogwifcoin',
  'POL': 'polygon-ecosystem-token',
  'ETC': 'ethereum-classic',
  
  // Top 31-60
  'FET': 'fetch-ai',
  'RENDER': 'render-token',
  'STX': 'blockstack',
  'ARB': 'arbitrum',
  'XLM': 'stellar',
  'IMX': 'immutable-x',
  'MNT': 'mantle',
  'HBAR': 'hedera-hashgraph',
  'ATOM': 'cosmos',
  'CRO': 'crypto-com-chain',
  'INJ': 'injective-protocol',
  'FIL': 'filecoin',
  'OP': 'optimism',
  'VET': 'vechain',
  'TIA': 'celestia',
  'TAO': 'bittensor',
  'BONK': 'bonk',
  'SUI': 'sui',
  'ALGO': 'algorand',
  'XMR': 'monero',
  'SEI': 'sei-network',
  'THETA': 'theta-token',
  'AAVE': 'aave',
  'GRT': 'the-graph',
  'RUNE': 'thorchain',
  'MKR': 'maker',
  'FTM': 'fantom',
  'FLOW': 'flow',
  'EOS': 'eos',
  'BSV': 'bitcoin-cash-sv',
  
  // Top 61-100
  'SNX': 'synthetix-network-token',
  'SAND': 'the-sandbox',
  'MANA': 'decentraland',
  'AXS': 'axie-infinity',
  'AR': 'arweave',
  'FLOKI': 'floki',
  'KAVA': 'kava',
  'NEO': 'neo',
  'XTZ': 'tezos',
  'GALA': 'gala',
  'ZEC': 'zcash',
  'QNT': 'quant-network',
  'EGLD': 'elrond-erd-2',
  'KLAY': 'klay-token',
  'MINA': 'mina-protocol',
  'CHZ': 'chiliz',
  'ROSE': 'oasis-network',
  'CFX': 'conflux-token',
  'CELO': 'celo',
  'ZIL': 'zilliqa',
  'ENJ': 'enjincoin',
  'IOTA': 'iota',
  'LDO': 'lido-dao',
  'COMP': 'compound-governance-token',
  'CRV': 'curve-dao-token',
  '1INCH': '1inch',
  'BAT': 'basic-attention-token',
  'ZRX': '0x',
  'SUSHI': 'sushi',
  'YFI': 'yearn-finance',
  'DASH': 'dash',
  'WAVES': 'waves',
  'HOT': 'holotoken',
  'DCR': 'decred',
  'QTUM': 'qtum',
  'OMG': 'omisego',
  'ICX': 'icon',
  'ZEN': 'zencash',
  'ONT': 'ontology',
  'XVG': 'verge',
  
  // Other notable coins
  'OSMO': 'osmosis',
  'JUNO': 'juno-network',
  'LUNA': 'terra-luna-2',
  'LUNC': 'terra-luna',
  'FTT': 'ftx-token',
};

// Retry function with exponential backoff for rate limits
async function fetchCryptoDataWithRetry(ticker: string, days: number, logger: any, maxRetries = 3) {
  // Check cache first
  const cacheKey = `crypto_${ticker}_${days}`;
  const cached = dataCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger?.info('💾 [MarketDataTool] Using cached data', { ticker, age: Math.round((Date.now() - cached.timestamp) / 1000) + 's' });
    return cached.data;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const data = await fetchCryptoData(ticker, days, logger);
      
      // Cache successful response
      dataCache.set(cacheKey, { data, timestamp: Date.now() });
      logger?.info('💾 [MarketDataTool] Data cached', { ticker, ttl: CACHE_TTL / 1000 + 's' });
      
      return data;
    } catch (error: any) {
      const isRateLimit = error.response?.status === 429 || 
                         error.response?.status === 401 ||
                         error.message?.includes('429') ||
                         error.message?.includes('401');
      
      if (isRateLimit && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 2000; // 4s, 8s, 16s
        logger?.warn(`⏳ [MarketDataTool] Rate limited/auth error, retrying in ${delay/1000}s (attempt ${attempt}/${maxRetries})`, {
          ticker,
          attempt
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Re-throw if not rate limit or max retries reached
      }
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
}

async function fetchCryptoData(ticker: string, days: number, logger: any) {
  logger?.info('📊 [MarketDataTool] Fetching crypto data from Binance', { ticker, days });

  // Binance uses USDT pairs for crypto (BTC → BTCUSDT)
  const symbol = `${ticker}USDT`;
  
  // Determine interval based on days (4h candles for better analysis)
  const interval = '4h';
  const limit = Math.min(Math.ceil((days * 24) / 4), 500); // Max 500 candles from Binance
  
  // Fetch OHLCV data from Binance public API (FREE, NO RATE LIMITS!)
  const klineUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const klineResponse = await axios.get(klineUrl);
  
  const candles = klineResponse.data;
  if (!candles || candles.length === 0) {
    throw new Error(`Cryptocurrency ${ticker} not found on Binance`);
  }

  // Parse Binance kline data [timestamp, open, high, low, close, volume, ...]
  const prices = candles.map((candle: any) => ({
    timestamp: candle[0], // Unix timestamp in ms
    open: parseFloat(candle[1]),
    high: parseFloat(candle[2]),
    low: parseFloat(candle[3]),
    close: parseFloat(candle[4]),
    volume: parseFloat(candle[5]),
  }));

  const latestCandle = prices[prices.length - 1];
  const prevCandle = prices[prices.length - 2] || latestCandle;
  
  const currentPrice = latestCandle.close;
  const priceChange24h = currentPrice - prevCandle.close;
  const priceChangePercent24h = (priceChange24h / prevCandle.close) * 100;
  
  // Calculate 24h volume (sum of recent candles)
  const volume24h = prices.slice(-6).reduce((sum, p) => sum + p.volume, 0); // Last 6 4h candles = 24h

  logger?.info('✅ [MarketDataTool] Successfully fetched crypto data from Binance', { 
    ticker,
    symbol,
    dataPoints: prices.length,
    currentPrice 
  });

  return {
    ticker,
    type: 'crypto',
    currentPrice,
    priceChange24h,
    priceChangePercent24h,
    volume24h,
    marketCap: 0, // Binance doesn't provide market cap, set to 0
    prices,
  };
}

async function fetchStockData(ticker: string, days: number, logger: any) {
  // Check cache first
  const cacheKey = `stock_${ticker}_${days}`;
  const cached = dataCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger?.info('💾 [MarketDataTool] Using cached data', { ticker, age: Math.round((Date.now() - cached.timestamp) / 1000) + 's' });
    return cached.data;
  }

  logger?.info('📊 [MarketDataTool] Fetching stock data from Yahoo Finance', { ticker, days });

  // Yahoo Finance v8 API endpoint
  const period2 = Math.floor(Date.now() / 1000); // current timestamp
  const period1 = period2 - (days * 24 * 60 * 60); // days ago
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d`;

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const result = response.data.chart.result[0];
  if (!result) {
    throw new Error(`Stock ${ticker} not found`);
  }

  const quote = result.indicators.quote[0];
  const timestamps = result.timestamp;

  const prices = timestamps.map((ts: number, i: number) => ({
    timestamp: ts * 1000,
    open: quote.open[i] || 0,
    high: quote.high[i] || 0,
    low: quote.low[i] || 0,
    close: quote.close[i] || 0,
    volume: quote.volume[i] || 0,
  }));

  const currentPrice = result.meta.regularMarketPrice;
  const previousClose = result.meta.chartPreviousClose;
  const priceChange = currentPrice - previousClose;
  const priceChangePercent = (priceChange / previousClose) * 100;

  const data = {
    ticker,
    type: 'stock',
    currentPrice,
    priceChange24h: priceChange,
    priceChangePercent24h: priceChangePercent,
    prices,
  };

  // Cache successful response
  dataCache.set(cacheKey, { data, timestamp: Date.now() });
  logger?.info('💾 [MarketDataTool] Data cached', { ticker, ttl: CACHE_TTL / 1000 + 's' });

  logger?.info('✅ [MarketDataTool] Successfully fetched stock data', { 
    ticker, 
    dataPoints: prices.length,
    currentPrice 
  });

  return data;
}
