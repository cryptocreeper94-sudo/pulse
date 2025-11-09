import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";
import { checkSubscriptionLimit } from "../middleware/subscriptionCheck.js";

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

  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [MarketDataTool] Starting execution', { ticker: context.ticker, days: context.days });

    // Extract userId from runtimeContext
    const userId = (runtimeContext as any)?.resourceId || 'unknown';
    
    // Check subscription limit for searches
    const limitCheck = await checkSubscriptionLimit(userId, 'search');
    logger?.info('🔐 [MarketDataTool] Subscription check result', { userId, allowed: limitCheck.allowed, isPremium: limitCheck.isPremium });
    
    if (!limitCheck.allowed) {
      logger?.warn('⚠️ [MarketDataTool] Usage limit exceeded', { userId, message: limitCheck.message });
      throw new Error(limitCheck.message || 'Daily search limit reached. Upgrade to Premium for unlimited access!');
    }

    const ticker = context.ticker.toUpperCase();
    const days = context.days || 90;

    // Auto-detect asset type with smart fallback logic
    let assetType = context.type;
    
    if (!assetType) {
      // Known crypto tickers - if matches, definitely crypto
      const knownCryptos = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'BNB', 'XRP', 'ADA', 'DOGE', 'MATIC', 'DOT', 'SHIB', 'AVAX', 'UNI', 'LINK', 'ATOM', 'LTC', 'BCH', 'XLM', 'ALGO', 'ICP', 'FIL', 'NEAR', 'APT', 'ARB', 'OP', 'SUI'];
      
      if (knownCryptos.includes(ticker)) {
        assetType = 'crypto';
      } else if (ticker.includes('.')) {
        // Stocks with exchange suffix: BRK.B, GOOGL.L
        assetType = 'stock';
      } else if (ticker.length > 5) {
        // Most stocks are 1-5 chars
        assetType = 'crypto';
      } else {
        // For ambiguous 1-5 character tickers, try stock first (AMD, AAPL, TSLA, etc.)
        assetType = 'stock';
      }
    }

    logger?.info('📝 [MarketDataTool] Initial detection', { ticker, assetType });

    // Try the detected type first, then fallback to the other
    try {
      if (assetType === 'crypto') {
        logger?.info('📊 [MarketDataTool] Fetching as crypto', { ticker });
        try {
          return await fetchCryptoDataWithRetry(ticker, days, logger);
        } catch (cryptoError: any) {
          logger?.warn('⚠️ [MarketDataTool] Crypto fetch failed, trying as stock', { 
            error: cryptoError.message 
          });
          // Fallback to stock if crypto fails
          return await fetchStockData(ticker, days, logger);
        }
      } else {
        logger?.info('📊 [MarketDataTool] Fetching as stock', { ticker });
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
  logger?.info('📊 [MarketDataTool] Fetching crypto data from CryptoCompare', { ticker, days });

  // Get current price data
  const priceUrl = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${ticker}&tsyms=USD`;
  const priceResponse = await axios.get(priceUrl);
  
  const coinData = priceResponse.data?.RAW?.[ticker]?.USD;
  if (!coinData) {
    throw new Error(`Cryptocurrency ${ticker} not found on CryptoCompare`);
  }

  const currentPrice = coinData.PRICE || 0;
  const priceChangePercent24h = coinData.CHANGEPCT24HOUR || 0;
  const volume24h = coinData.VOLUME24HOURTO || 0;
  const marketCap = coinData.MKTCAP || 0;
  
  // Get historical hourly data (limit: 2000 points free)
  const limit = Math.min(days * 6, 2000); // 4-hour candles
  const historyUrl = `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${ticker}&tsym=USD&limit=${limit}`;
  const historyResponse = await axios.get(historyUrl);

  const histData = historyResponse.data?.Data?.Data || [];
  
  // Group hourly data into 4-hour candles
  const candleSize = 4;
  const prices = [];
  
  for (let i = 0; i < histData.length; i += candleSize) {
    const candles = histData.slice(i, Math.min(i + candleSize, histData.length));
    if (candles.length === 0) continue;
    
    const open = candles[0].open;
    const close = candles[candles.length - 1].close;
    const high = Math.max(...candles.map((c: any) => c.high));
    const low = Math.min(...candles.map((c: any) => c.low));
    const volume = candles.reduce((sum: number, c: any) => sum + c.volumeto, 0);
    const timestamp = candles[0].time * 1000; // Convert to ms
    
    prices.push({ timestamp, open, high, low, close, volume });
  }

  logger?.info('✅ [MarketDataTool] Successfully fetched crypto data from CryptoCompare', { 
    ticker,
    dataPoints: prices.length,
    currentPrice 
  });

  return {
    ticker,
    type: 'crypto',
    currentPrice,
    priceChange24h: currentPrice * (priceChangePercent24h / 100),
    priceChangePercent24h,
    volume24h,
    marketCap,
    prices,
  };
}

/**
 * Fallback function using Alpha Vantage API (25 calls/day free tier)
 * Used when Yahoo Finance fails or rate limits
 */
async function fetchStockDataAlphaVantage(ticker: string, days: number, logger: any) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!apiKey) {
    logger?.warn('⚠️ [MarketDataTool] Alpha Vantage API key not configured, skipping fallback');
    throw new Error('Alpha Vantage API key not configured');
  }

  logger?.info('📊 [MarketDataTool] Fetching stock data from Alpha Vantage (fallback)', { ticker, days });

  // Alpha Vantage TIME_SERIES_DAILY for historical data
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${apiKey}`;
  
  const response = await axios.get(url, {
    timeout: 15000,
  });

  // Check for rate limit or error messages
  if (response.data['Error Message']) {
    throw new Error(`Alpha Vantage: ${response.data['Error Message']}`);
  }
  
  if (response.data['Note']) {
    // Rate limit hit
    throw new Error('Alpha Vantage rate limit exceeded (25 calls/day)');
  }

  const timeSeries = response.data['Time Series (Daily)'];
  if (!timeSeries) {
    throw new Error(`Stock ${ticker} not found on Alpha Vantage`);
  }

  // Convert time series to array format
  const dates = Object.keys(timeSeries).slice(0, days);
  const prices = dates.map(date => {
    const data = timeSeries[date];
    return {
      timestamp: new Date(date).getTime(),
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseFloat(data['5. volume']),
    };
  }).reverse(); // Oldest to newest

  const latestData = timeSeries[dates[0]];
  const previousData = timeSeries[dates[1]] || latestData;
  
  const currentPrice = parseFloat(latestData['4. close']);
  const previousClose = parseFloat(previousData['4. close']);
  const priceChange = currentPrice - previousClose;
  const priceChangePercent = (priceChange / previousClose) * 100;

  logger?.info('✅ [MarketDataTool] Successfully fetched stock data from Alpha Vantage', { 
    ticker,
    dataPoints: prices.length,
    currentPrice 
  });

  return {
    ticker,
    type: 'stock',
    currentPrice,
    priceChange24h: priceChange,
    priceChangePercent24h: priceChangePercent,
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

  // Try Yahoo Finance first (free and reliable)
  try {
    logger?.info('📊 [MarketDataTool] Fetching stock data from Yahoo Finance', { ticker, days });

    const period2 = Math.floor(Date.now() / 1000); // current timestamp
    const period1 = period2 - (days * 24 * 60 * 60); // days ago
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      timeout: 10000,
    });

    const result = response.data.chart.result[0];
    if (!result) {
      throw new Error(`Stock ${ticker} not found on Yahoo Finance`);
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

    logger?.info('✅ [MarketDataTool] Successfully fetched stock data from Yahoo Finance', { 
      ticker, 
      dataPoints: prices.length,
      currentPrice 
    });

    return data;
    
  } catch (yahooError: any) {
    // Fallback to Alpha Vantage if Yahoo fails
    logger?.warn('⚠️ [MarketDataTool] Yahoo Finance failed, trying Alpha Vantage fallback', { 
      error: yahooError.message 
    });
    
    try {
      const data = await fetchStockDataAlphaVantage(ticker, days, logger);
      
      // Cache successful fallback response
      dataCache.set(cacheKey, { data, timestamp: Date.now() });
      logger?.info('💾 [MarketDataTool] Fallback data cached', { ticker, ttl: CACHE_TTL / 1000 + 's' });
      
      return data;
    } catch (alphaError: any) {
      logger?.error('❌ [MarketDataTool] Both Yahoo and Alpha Vantage failed', {
        yahooError: yahooError.message,
        alphaError: alphaError.message
      });
      
      // Re-throw original Yahoo error
      throw new Error(`Failed to fetch stock data for ${ticker}: ${yahooError.message}`);
    }
  }
}
