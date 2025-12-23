import { a as axios } from './mastra.mjs';
import 'stream/web';
import 'crypto';
import 'node:url';
import 'node:path';
import 'node:module';
import 'events';
import 'pino';
import 'node:crypto';
import 'path';
import 'util';
import 'buffer';
import 'string_decoder';
import 'stream';
import 'async_hooks';
import 'url';
import 'node:process';
import 'inngest';
import 'http';
import 'https';
import 'fs';
import 'http2';
import 'assert';
import 'tty';
import 'os';
import 'zlib';
import 'pg';
import '@mastra/inngest';
import '@solana/web3.js';
import 'uuid';
import 'net';
import 'tls';
import 'child_process';
import 'fs/promises';
import '@solana/spl-token';
import 'bcrypt';
import '@simplewebauthn/server';
import 'rss-parser';

async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1e3) {
  let lastError = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}
class DataIntegrationLayer {
  constructor(logger) {
    this.logger = logger;
  }
  cache = /* @__PURE__ */ new Map();
  cacheTimeout = 6e4;
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    return null;
  }
  setCache(key, data, timeout) {
    this.cache.set(key, {
      data,
      expires: Date.now() + (timeout || this.cacheTimeout)
    });
  }
  async fetchCryptoData(ticker) {
    const cacheKey = `crypto:${ticker}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    const sources = [];
    let data = {
      ticker: ticker.toUpperCase(),
      sources: [],
      timestamp: /* @__PURE__ */ new Date()
    };
    try {
      const cgResponse = await retryWithBackoff(async () => {
        return axios.get(
          `https://api.coingecko.com/api/v3/simple/price`,
          {
            params: {
              ids: this.tickerToCoingeckoId(ticker),
              vs_currencies: "usd",
              include_24hr_change: true,
              include_24hr_vol: true,
              include_market_cap: true
            },
            timeout: 5e3
          }
        );
      }, 3, 500);
      const coinId = this.tickerToCoingeckoId(ticker);
      if (cgResponse.data[coinId]) {
        const coinData = cgResponse.data[coinId];
        data.price = coinData.usd;
        data.change24h = coinData.usd_24h_change;
        data.volume24h = coinData.usd_24h_vol;
        data.marketCap = coinData.usd_market_cap;
        sources.push("coingecko");
      }
    } catch (error) {
      this.logger?.warn("CoinGecko fetch failed after retries", { ticker, error });
    }
    try {
      const dexResponse = await retryWithBackoff(async () => {
        return axios.get(
          `https://api.dexscreener.com/latest/dex/search?q=${ticker}`,
          { timeout: 5e3 }
        );
      }, 3, 500);
      if (dexResponse.data?.pairs?.length > 0) {
        const pair = dexResponse.data.pairs[0];
        if (!data.price) {
          data.price = parseFloat(pair.priceUsd);
        }
        if (!data.change24h) {
          data.change24h = pair.priceChange?.h24 || 0;
        }
        if (!data.volume24h) {
          data.volume24h = pair.volume?.h24 || 0;
        }
        data.name = pair.baseToken?.name;
        sources.push("dexscreener");
      }
    } catch (error) {
      this.logger?.warn("Dexscreener fetch failed after retries", { ticker, error });
    }
    if (!data.price) {
      return null;
    }
    data.sources = sources;
    const result = data;
    this.setCache(cacheKey, result);
    return result;
  }
  async fetchStockData(ticker) {
    const cacheKey = `stock:${ticker}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    const sources = [];
    let data = {
      ticker: ticker.toUpperCase(),
      sources: [],
      timestamp: /* @__PURE__ */ new Date()
    };
    try {
      const yhResponse = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`,
        {
          params: { interval: "1d", range: "5d" },
          timeout: 5e3
        }
      );
      const quote = yhResponse.data?.chart?.result?.[0];
      if (quote) {
        const meta = quote.meta;
        data.price = meta.regularMarketPrice;
        data.name = meta.shortName;
        data.change24h = (meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100;
        data.volume24h = meta.regularMarketVolume;
        data.high24h = meta.regularMarketDayHigh;
        data.low24h = meta.regularMarketDayLow;
        sources.push("yahoofinance");
      }
    } catch (error) {
      this.logger?.warn("Yahoo Finance fetch failed", { ticker, error });
    }
    if (process.env.FINNHUB_API_KEY && !data.price) {
      try {
        const fhResponse = await axios.get(
          `https://finnhub.io/api/v1/quote`,
          {
            params: { symbol: ticker, token: process.env.FINNHUB_API_KEY },
            timeout: 5e3
          }
        );
        if (fhResponse.data?.c) {
          data.price = fhResponse.data.c;
          data.change24h = fhResponse.data.dp;
          data.high24h = fhResponse.data.h;
          data.low24h = fhResponse.data.l;
          sources.push("finnhub");
        }
      } catch (error) {
        this.logger?.warn("Finnhub fetch failed", { ticker, error });
      }
    }
    if (!data.price) {
      return null;
    }
    data.sources = sources;
    const result = data;
    this.setCache(cacheKey, result);
    return result;
  }
  async fetchOnChainData(ticker, chain = "solana") {
    const cacheKey = `onchain:${chain}:${ticker}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    const sources = [];
    let data = {
      ticker: ticker.toUpperCase(),
      chain,
      sources: [],
      timestamp: /* @__PURE__ */ new Date()
    };
    if (chain === "solana" && process.env.HELIUS_API_KEY) {
      try {
        sources.push("helius");
      } catch (error) {
        this.logger?.warn("Helius fetch failed", { ticker, error });
      }
    }
    data.sources = sources;
    const result = data;
    this.setCache(cacheKey, result);
    return result;
  }
  async fetchSentimentData(ticker) {
    const cacheKey = `sentiment:${ticker}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    const sources = [];
    let data = {
      ticker: ticker.toUpperCase(),
      overallScore: 50,
      sources: [],
      timestamp: /* @__PURE__ */ new Date()
    };
    try {
      const fgiResponse = await axios.get(
        "https://api.alternative.me/fng/",
        { timeout: 5e3 }
      );
      if (fgiResponse.data?.data?.[0]) {
        data.fearGreedIndex = parseInt(fgiResponse.data.data[0].value);
        sources.push("alternative.me");
      }
    } catch (error) {
      this.logger?.warn("Fear & Greed fetch failed", { error });
    }
    data.sources = sources;
    const result = data;
    this.setCache(cacheKey, result);
    return result;
  }
  async fetchUnifiedData(ticker) {
    const isStock = this.isStockTicker(ticker);
    const [market, onchain, sentiment] = await Promise.all([
      isStock ? this.fetchStockData(ticker) : this.fetchCryptoData(ticker),
      isStock ? Promise.resolve(null) : this.fetchOnChainData(ticker),
      this.fetchSentimentData(ticker)
    ]);
    return { market, onchain, sentiment };
  }
  tickerToCoingeckoId(ticker) {
    const mapping = {
      "BTC": "bitcoin",
      "ETH": "ethereum",
      "SOL": "solana",
      "BNB": "binancecoin",
      "XRP": "ripple",
      "ADA": "cardano",
      "DOGE": "dogecoin",
      "DOT": "polkadot",
      "MATIC": "matic-network",
      "AVAX": "avalanche-2",
      "SHIB": "shiba-inu",
      "LINK": "chainlink",
      "UNI": "uniswap",
      "ATOM": "cosmos",
      "LTC": "litecoin",
      "PEPE": "pepe",
      "BONK": "bonk",
      "WIF": "dogwifcoin"
    };
    return mapping[ticker.toUpperCase()] || ticker.toLowerCase();
  }
  isSolanaToken(ticker) {
    const solanaTokens = ["SOL", "BONK", "WIF", "JTO", "PYTH", "JUP", "ORCA", "RAY", "MNGO"];
    return solanaTokens.includes(ticker.toUpperCase());
  }
  isStockTicker(ticker) {
    const stockPatterns = /^[A-Z]{1,5}$/;
    const knownStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "AMD", "INTC", "IBM"];
    const knownCrypto = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "DOT", "MATIC", "AVAX"];
    if (knownStocks.includes(ticker.toUpperCase())) return true;
    if (knownCrypto.includes(ticker.toUpperCase())) return false;
    return stockPatterns.test(ticker) && ticker.length <= 4;
  }
}
const dataIntegration = new DataIntegrationLayer();

export { DataIntegrationLayer, dataIntegration };
//# sourceMappingURL=dataIntegration.mjs.map
