import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';
import { checkSubscriptionLimit } from '../subscriptionCheck.mjs';

const dataCache = /* @__PURE__ */ new Map();
const CACHE_TTL = 10 * 60 * 1e3;
const marketDataTool = createTool({
  id: "market-data-tool",
  description: "Fetches historical price data for crypto or stock tickers. Returns OHLCV (Open, High, Low, Close, Volume) data for technical analysis.",
  inputSchema: z.object({
    ticker: z.string().describe("Ticker symbol (e.g., BTC, ETH, AAPL, TSLA)"),
    days: z.number().optional().default(90).describe("Number of days of historical data (default: 90)"),
    type: z.enum(["crypto", "stock"]).optional().describe("Asset type - auto-detected if not specified")
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
      volume: z.number()
    })),
    marketCap: z.number().optional()
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F527} [MarketDataTool] Starting execution", { ticker: context.ticker, days: context.days });
    const userId = runtimeContext?.resourceId || "unknown";
    const limitCheck = await checkSubscriptionLimit(userId);
    logger?.info("\u{1F510} [MarketDataTool] Subscription check result", { userId, allowed: limitCheck.allowed, isPremium: limitCheck.isPremium });
    if (!limitCheck.allowed) {
      logger?.warn("\u26A0\uFE0F [MarketDataTool] Usage limit exceeded", { userId, message: limitCheck.message });
      throw new Error(limitCheck.message || "Daily search limit reached. Upgrade to Premium for unlimited access!");
    }
    const ticker = context.ticker.toUpperCase();
    const days = context.days || 90;
    let assetType = context.type;
    if (!assetType) {
      const knownCryptos = ["BTC", "ETH", "SOL", "USDT", "USDC", "BNB", "XRP", "ADA", "DOGE", "MATIC", "DOT", "SHIB", "AVAX", "UNI", "LINK", "ATOM", "LTC", "BCH", "XLM", "ALGO", "ICP", "FIL", "NEAR", "APT", "ARB", "OP", "SUI"];
      if (knownCryptos.includes(ticker)) {
        assetType = "crypto";
      } else if (ticker.includes(".")) {
        assetType = "stock";
      } else if (ticker.length > 5) {
        assetType = "crypto";
      } else {
        assetType = "stock";
      }
    }
    logger?.info("\u{1F4DD} [MarketDataTool] Initial detection", { ticker, assetType });
    try {
      if (assetType === "crypto") {
        logger?.info("\u{1F4CA} [MarketDataTool] Fetching as crypto", { ticker });
        try {
          return await fetchCryptoDataWithRetry(ticker, days, logger);
        } catch (cryptoError) {
          logger?.warn("\u26A0\uFE0F [MarketDataTool] Crypto fetch failed, trying as stock", {
            error: cryptoError.message
          });
          return await fetchStockData(ticker, days, logger);
        }
      } else {
        logger?.info("\u{1F4CA} [MarketDataTool] Fetching as stock", { ticker });
        try {
          return await fetchStockData(ticker, days, logger);
        } catch (stockError) {
          logger?.warn("\u26A0\uFE0F [MarketDataTool] Stock fetch failed, trying as crypto", {
            error: stockError.message
          });
          return await fetchCryptoDataWithRetry(ticker, days, logger);
        }
      }
    } catch (error) {
      logger?.error("\u274C [MarketDataTool] All fetch attempts failed", { error: error.message });
      throw new Error(`Failed to fetch market data for ${ticker}: Not found in crypto or stock markets`);
    }
  }
});
async function fetchCryptoDataWithRetry(ticker, days, logger, maxRetries = 3) {
  const cacheKey = `crypto_${ticker}_${days}`;
  const cached = dataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger?.info("\u{1F4BE} [MarketDataTool] Using cached data", { ticker, age: Math.round((Date.now() - cached.timestamp) / 1e3) + "s" });
    return cached.data;
  }
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const data = await fetchCryptoData(ticker, days, logger);
      dataCache.set(cacheKey, { data, timestamp: Date.now() });
      logger?.info("\u{1F4BE} [MarketDataTool] Data cached", { ticker, ttl: CACHE_TTL / 1e3 + "s" });
      return data;
    } catch (error) {
      const isRateLimit = error.response?.status === 429 || error.response?.status === 401 || error.message?.includes("429") || error.message?.includes("401");
      if (isRateLimit && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 2e3;
        logger?.warn(`\u23F3 [MarketDataTool] Rate limited/auth error, retrying in ${delay / 1e3}s (attempt ${attempt}/${maxRetries})`, {
          ticker,
          attempt
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
}
async function fetchCryptoData(ticker, days, logger) {
  logger?.info("\u{1F4CA} [MarketDataTool] Fetching crypto data from CryptoCompare", { ticker, days });
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
  const limit = Math.min(days * 6, 2e3);
  const historyUrl = `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${ticker}&tsym=USD&limit=${limit}`;
  const historyResponse = await axios.get(historyUrl);
  const histData = historyResponse.data?.Data?.Data || [];
  const candleSize = 4;
  const prices = [];
  for (let i = 0; i < histData.length; i += candleSize) {
    const candles = histData.slice(i, Math.min(i + candleSize, histData.length));
    if (candles.length === 0) continue;
    const open = candles[0].open;
    const close = candles[candles.length - 1].close;
    const high = Math.max(...candles.map((c) => c.high));
    const low = Math.min(...candles.map((c) => c.low));
    const volume = candles.reduce((sum, c) => sum + c.volumeto, 0);
    const timestamp = candles[0].time * 1e3;
    prices.push({ timestamp, open, high, low, close, volume });
  }
  logger?.info("\u2705 [MarketDataTool] Successfully fetched crypto data from CryptoCompare", {
    ticker,
    dataPoints: prices.length,
    currentPrice
  });
  return {
    ticker,
    type: "crypto",
    currentPrice,
    priceChange24h: currentPrice * (priceChangePercent24h / 100),
    priceChangePercent24h,
    volume24h,
    marketCap,
    prices
  };
}
async function fetchStockDataAlphaVantage(ticker, days, logger) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    logger?.warn("\u26A0\uFE0F [MarketDataTool] Alpha Vantage API key not configured, skipping fallback");
    throw new Error("Alpha Vantage API key not configured");
  }
  logger?.info("\u{1F4CA} [MarketDataTool] Fetching stock data from Alpha Vantage (fallback)", { ticker, days });
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${apiKey}`;
  const response = await axios.get(url, {
    timeout: 15e3
  });
  if (response.data["Error Message"]) {
    throw new Error(`Alpha Vantage: ${response.data["Error Message"]}`);
  }
  if (response.data["Note"]) {
    throw new Error("Alpha Vantage rate limit exceeded (25 calls/day)");
  }
  const timeSeries = response.data["Time Series (Daily)"];
  if (!timeSeries) {
    throw new Error(`Stock ${ticker} not found on Alpha Vantage`);
  }
  const dates = Object.keys(timeSeries).slice(0, days);
  const prices = dates.map((date) => {
    const data = timeSeries[date];
    return {
      timestamp: new Date(date).getTime(),
      open: parseFloat(data["1. open"]),
      high: parseFloat(data["2. high"]),
      low: parseFloat(data["3. low"]),
      close: parseFloat(data["4. close"]),
      volume: parseFloat(data["5. volume"])
    };
  }).reverse();
  const latestData = timeSeries[dates[0]];
  const previousData = timeSeries[dates[1]] || latestData;
  const currentPrice = parseFloat(latestData["4. close"]);
  const previousClose = parseFloat(previousData["4. close"]);
  const priceChange = currentPrice - previousClose;
  const priceChangePercent = priceChange / previousClose * 100;
  logger?.info("\u2705 [MarketDataTool] Successfully fetched stock data from Alpha Vantage", {
    ticker,
    dataPoints: prices.length,
    currentPrice
  });
  return {
    ticker,
    type: "stock",
    currentPrice,
    priceChange24h: priceChange,
    priceChangePercent24h: priceChangePercent,
    prices
  };
}
async function fetchStockData(ticker, days, logger) {
  const cacheKey = `stock_${ticker}_${days}`;
  const cached = dataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger?.info("\u{1F4BE} [MarketDataTool] Using cached data", { ticker, age: Math.round((Date.now() - cached.timestamp) / 1e3) + "s" });
    return cached.data;
  }
  try {
    logger?.info("\u{1F4CA} [MarketDataTool] Fetching stock data from Yahoo Finance", { ticker, days });
    const period2 = Math.floor(Date.now() / 1e3);
    const period1 = period2 - days * 24 * 60 * 60;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 1e4
    });
    const result = response.data.chart.result[0];
    if (!result) {
      throw new Error(`Stock ${ticker} not found on Yahoo Finance`);
    }
    const quote = result.indicators.quote[0];
    const timestamps = result.timestamp;
    const prices = timestamps.map((ts, i) => ({
      timestamp: ts * 1e3,
      open: quote.open[i] || 0,
      high: quote.high[i] || 0,
      low: quote.low[i] || 0,
      close: quote.close[i] || 0,
      volume: quote.volume[i] || 0
    }));
    const currentPrice = result.meta.regularMarketPrice;
    const previousClose = result.meta.chartPreviousClose;
    const priceChange = currentPrice - previousClose;
    const priceChangePercent = priceChange / previousClose * 100;
    const data = {
      ticker,
      type: "stock",
      currentPrice,
      priceChange24h: priceChange,
      priceChangePercent24h: priceChangePercent,
      prices
    };
    dataCache.set(cacheKey, { data, timestamp: Date.now() });
    logger?.info("\u{1F4BE} [MarketDataTool] Data cached", { ticker, ttl: CACHE_TTL / 1e3 + "s" });
    logger?.info("\u2705 [MarketDataTool] Successfully fetched stock data from Yahoo Finance", {
      ticker,
      dataPoints: prices.length,
      currentPrice
    });
    return data;
  } catch (yahooError) {
    logger?.warn("\u26A0\uFE0F [MarketDataTool] Yahoo Finance failed, trying Alpha Vantage fallback", {
      error: yahooError.message
    });
    try {
      const data = await fetchStockDataAlphaVantage(ticker, days, logger);
      dataCache.set(cacheKey, { data, timestamp: Date.now() });
      logger?.info("\u{1F4BE} [MarketDataTool] Fallback data cached", { ticker, ttl: CACHE_TTL / 1e3 + "s" });
      return data;
    } catch (alphaError) {
      logger?.error("\u274C [MarketDataTool] Both Yahoo and Alpha Vantage failed", {
        yahooError: yahooError.message,
        alphaError: alphaError.message
      });
      throw new Error(`Failed to fetch stock data for ${ticker}: ${yahooError.message}`);
    }
  }
}

export { marketDataTool };
//# sourceMappingURL=66c9e7d8-3521-4d98-b9f9-59869963a125.mjs.map
