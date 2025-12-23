import { a as axios } from '../mastra.mjs';
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
import '@sqds/multisig';
import 'bcrypt';
import '@simplewebauthn/server';

const STOCK_TICKERS = {
  top: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK.B", "V", "JPM", "WMT", "LLY", "UNH", "XOM", "MA", "PG", "JNJ", "HD", "MRK", "CVX"],
  trending: ["NVDA", "TSLA", "AMD", "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NFLX", "COIN", "PLTR", "RIVN", "LCID", "NIO", "SOFI", "HOOD", "RBLX", "U", "SNOW", "DKNG"],
  gainers: ["NVDA", "AMD", "TSLA", "PLTR", "COIN", "RBLX", "SNOW", "DKNG", "NET", "DDOG", "ZS", "CRWD", "OKTA", "TEAM", "SHOP", "SQ", "PYPL", "ROKU", "UBER", "LYFT"],
  losers: ["INTC", "T", "VZ", "PFE", "CVS", "KO", "PEP", "WMT", "TGT", "HD", "LOW", "NKE", "DIS", "BA", "GE", "F", "GM", "DAL", "AAL", "UAL"],
  new: ["RIVN", "LCID", "RBLX", "COIN", "HOOD", "SOFI", "UPST", "OPEN", "WISH", "CLOV"],
  defi: [],
  // Stocks don't have DeFi category
  nft: []
  // Stocks don't have NFT category
};
const marketCache = /* @__PURE__ */ new Map();
const CACHE_TTL = 5 * 60 * 1e3;
async function fetchStocksOverview(category, logger) {
  logger?.info("\u{1F4CA} [MarketOverview] Fetching stocks", { category });
  const cacheKey = `market:stocks:${category}`;
  const cached = marketCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger?.info("\u{1F4E6} [MarketOverview] Using cached stocks data", { category });
    return cached.data;
  }
  const tickers = STOCK_TICKERS[category] || STOCK_TICKERS.top;
  if (tickers.length === 0) {
    logger?.warn("\u26A0\uFE0F [MarketOverview] No stock tickers for category", { category });
    return [];
  }
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    logger?.error("\u274C [MarketOverview] Finnhub API key not found");
    return [];
  }
  try {
    const normalized = [];
    const topTickers = tickers.slice(0, 20);
    logger?.info("\u{1F310} [MarketOverview] Fetching from Finnhub", { count: topTickers.length });
    const batchSize = 5;
    for (let i = 0; i < topTickers.length; i += batchSize) {
      const batch = topTickers.slice(i, i + batchSize);
      await Promise.all(batch.map(async (symbol) => {
        try {
          const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
          const quoteResp = await axios.get(quoteUrl, { timeout: 1e4 });
          const quote = quoteResp.data;
          const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`;
          const profileResp = await axios.get(profileUrl, { timeout: 1e4 });
          const profile = profileResp.data;
          if (quote && quote.c) {
            const price = quote.c;
            const changePercent = quote.dp || 0;
            normalized.push({
              rank: normalized.length + 1,
              symbol,
              name: profile?.name || symbol,
              price,
              change_1h: 0,
              // Finnhub doesn't provide 1h change for stocks
              change_24h: changePercent,
              change_7d: 0,
              market_cap: profile?.marketCapitalization ? profile.marketCapitalization * 1e6 : 0,
              volume_24h: quote.v || 0,
              // v = volume
              sparkline_7d: []
            });
            logger?.info(`\u2705 [MarketOverview] Fetched ${symbol}`, {
              price,
              change: changePercent
            });
          }
        } catch (err) {
          logger?.warn("\u26A0\uFE0F [MarketOverview] Failed to fetch stock", {
            symbol,
            error: err.message
          });
        }
      }));
      if (i + batchSize < topTickers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1e3));
      }
    }
    if (category === "gainers") {
      normalized.sort((a, b) => b.change_24h - a.change_24h);
    } else if (category === "losers") {
      normalized.sort((a, b) => a.change_24h - b.change_24h);
    } else if (category === "trending") {
      normalized.sort((a, b) => b.volume_24h - a.volume_24h);
    } else {
      normalized.sort((a, b) => b.market_cap - a.market_cap);
    }
    normalized.forEach((item, index) => {
      item.rank = index + 1;
    });
    marketCache.set(cacheKey, {
      data: normalized,
      timestamp: Date.now()
    });
    logger?.info("\u2705 [MarketOverview] Stocks data normalized", { count: normalized.length });
    return normalized;
  } catch (error) {
    logger?.error("\u274C [MarketOverview] Finnhub error", {
      error: error.message,
      category
    });
    return [];
  }
}
async function fetchCryptoOverview(category, logger) {
  logger?.info("\u{1F4CA} [MarketOverview] Fetching crypto", { category });
  const cacheKey = `market:crypto:${category}`;
  const cached = marketCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger?.info("\u{1F4E6} [MarketOverview] Using cached crypto data", { category });
    return cached.data;
  }
  try {
    let url = "";
    if (category === "top") {
      url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d";
    } else if (category === "trending") {
      url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d";
    } else if (category === "gainers" || category === "losers") {
      url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=true&price_change_percentage=1h,24h,7d";
    } else if (category === "new") {
      url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=gecko_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d";
    } else if (category === "defi") {
      const defiIds = "uniswap,aave,maker,lido-dao,curve-dao-token,compound-governance-token,pancakeswap-token,synthetix-network-token,yearn-finance,sushi,thorchain,convex-finance,frax-share,rocket-pool,balancer,1inch,0x,raydium,gmx,ribbon-finance";
      url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${defiIds}&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d`;
    } else {
      url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d";
    }
    const response = await axios.get(url, { timeout: 1e4 });
    let data = response.data;
    if (category === "gainers") {
      data = data.filter((coin) => coin.price_change_percentage_24h > 0).sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 100);
    } else if (category === "losers") {
      data = data.filter((coin) => coin.price_change_percentage_24h < 0).sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)).slice(0, 100);
    }
    marketCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    logger?.info("\u2705 [MarketOverview] Crypto data fetched", { count: data.length });
    return data;
  } catch (error) {
    logger?.error("\u274C [MarketOverview] CoinGecko error", {
      error: error.message,
      category
    });
    return [];
  }
}

export { STOCK_TICKERS, fetchCryptoOverview, fetchStocksOverview };
//# sourceMappingURL=83dd953d-dd7f-4c26-8d7b-ccc40af99594.mjs.map
