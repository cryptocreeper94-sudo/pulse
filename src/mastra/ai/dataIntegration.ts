import axios from 'axios';

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export interface MarketDataSource {
  name: string;
  type: 'crypto' | 'stock' | 'onchain' | 'sentiment';
  priority: number;
  rateLimit: number;
  enabled: boolean;
}

export const dataSources: MarketDataSource[] = [
  { name: 'coingecko', type: 'crypto', priority: 1, rateLimit: 50, enabled: true },
  { name: 'dexscreener', type: 'crypto', priority: 2, rateLimit: 100, enabled: true },
  { name: 'helius', type: 'onchain', priority: 1, rateLimit: 100, enabled: true },
  { name: 'yahoofinance', type: 'stock', priority: 1, rateLimit: 200, enabled: true },
  { name: 'finnhub', type: 'stock', priority: 2, rateLimit: 60, enabled: true },
  { name: 'cryptocompare', type: 'sentiment', priority: 1, rateLimit: 100, enabled: false },
  { name: 'santiment', type: 'sentiment', priority: 2, rateLimit: 50, enabled: false },
  { name: 'glassnode', type: 'onchain', priority: 2, rateLimit: 30, enabled: false },
  { name: 'lunarcrush', type: 'sentiment', priority: 3, rateLimit: 100, enabled: false },
  { name: 'messari', type: 'crypto', priority: 3, rateLimit: 100, enabled: false },
];

export interface UnifiedMarketData {
  ticker: string;
  name: string;
  price: number;
  change24h: number;
  change7d?: number;
  volume24h: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
  ath?: number;
  athDate?: string;
  circulatingSupply?: number;
  totalSupply?: number;
  sources: string[];
  timestamp: Date;
}

export interface OnChainData {
  ticker: string;
  chain: string;
  holders?: number;
  transactions24h?: number;
  activeAddresses24h?: number;
  whaleHoldings?: number;
  topHoldersPercent?: number;
  liquidityUsd?: number;
  sources: string[];
  timestamp: Date;
}

export interface SentimentData {
  ticker: string;
  overallScore: number;
  twitterMentions?: number;
  twitterSentiment?: number;
  redditMentions?: number;
  redditSentiment?: number;
  newsArticles?: number;
  newsSentiment?: number;
  fearGreedIndex?: number;
  sources: string[];
  timestamp: Date;
}

export class DataIntegrationLayer {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  private cacheTimeout = 60000;

  constructor(private logger?: any) {}

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any, timeout?: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + (timeout || this.cacheTimeout)
    });
  }

  async fetchCryptoData(ticker: string): Promise<UnifiedMarketData | null> {
    const cacheKey = `crypto:${ticker}`;
    const cached = this.getCached<UnifiedMarketData>(cacheKey);
    if (cached) return cached;

    const sources: string[] = [];
    let data: Partial<UnifiedMarketData> = {
      ticker: ticker.toUpperCase(),
      sources: [],
      timestamp: new Date()
    };

    try {
      const cgResponse = await retryWithBackoff(async () => {
        return axios.get(
          `https://api.coingecko.com/api/v3/simple/price`,
          {
            params: {
              ids: this.tickerToCoingeckoId(ticker),
              vs_currencies: 'usd',
              include_24hr_change: true,
              include_24hr_vol: true,
              include_market_cap: true
            },
            timeout: 5000
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
        sources.push('coingecko');
      }
    } catch (error) {
      this.logger?.warn('CoinGecko fetch failed after retries', { ticker, error });
    }

    try {
      const dexResponse = await retryWithBackoff(async () => {
        return axios.get(
          `https://api.dexscreener.com/latest/dex/search?q=${ticker}`,
          { timeout: 5000 }
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
        sources.push('dexscreener');
      }
    } catch (error) {
      this.logger?.warn('Dexscreener fetch failed after retries', { ticker, error });
    }

    if (!data.price) {
      return null;
    }

    data.sources = sources;
    const result = data as UnifiedMarketData;
    this.setCache(cacheKey, result);
    return result;
  }

  async fetchStockData(ticker: string): Promise<UnifiedMarketData | null> {
    const cacheKey = `stock:${ticker}`;
    const cached = this.getCached<UnifiedMarketData>(cacheKey);
    if (cached) return cached;

    const sources: string[] = [];
    let data: Partial<UnifiedMarketData> = {
      ticker: ticker.toUpperCase(),
      sources: [],
      timestamp: new Date()
    };

    try {
      const yhResponse = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`,
        {
          params: { interval: '1d', range: '5d' },
          timeout: 5000
        }
      );

      const quote = yhResponse.data?.chart?.result?.[0];
      if (quote) {
        const meta = quote.meta;
        data.price = meta.regularMarketPrice;
        data.name = meta.shortName;
        data.change24h = ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100;
        data.volume24h = meta.regularMarketVolume;
        data.high24h = meta.regularMarketDayHigh;
        data.low24h = meta.regularMarketDayLow;
        sources.push('yahoofinance');
      }
    } catch (error) {
      this.logger?.warn('Yahoo Finance fetch failed', { ticker, error });
    }

    if (process.env.FINNHUB_API_KEY && !data.price) {
      try {
        const fhResponse = await axios.get(
          `https://finnhub.io/api/v1/quote`,
          {
            params: { symbol: ticker, token: process.env.FINNHUB_API_KEY },
            timeout: 5000
          }
        );

        if (fhResponse.data?.c) {
          data.price = fhResponse.data.c;
          data.change24h = fhResponse.data.dp;
          data.high24h = fhResponse.data.h;
          data.low24h = fhResponse.data.l;
          sources.push('finnhub');
        }
      } catch (error) {
        this.logger?.warn('Finnhub fetch failed', { ticker, error });
      }
    }

    if (!data.price) {
      return null;
    }

    data.sources = sources;
    const result = data as UnifiedMarketData;
    this.setCache(cacheKey, result);
    return result;
  }

  async fetchOnChainData(ticker: string, chain: string = 'solana'): Promise<OnChainData | null> {
    const cacheKey = `onchain:${chain}:${ticker}`;
    const cached = this.getCached<OnChainData>(cacheKey);
    if (cached) return cached;

    const sources: string[] = [];
    let data: Partial<OnChainData> = {
      ticker: ticker.toUpperCase(),
      chain,
      sources: [],
      timestamp: new Date()
    };

    if (chain === 'solana' && process.env.HELIUS_API_KEY) {
      try {
        sources.push('helius');
      } catch (error) {
        this.logger?.warn('Helius fetch failed', { ticker, error });
      }
    }

    data.sources = sources;
    const result = data as OnChainData;
    this.setCache(cacheKey, result);
    return result;
  }

  async fetchSentimentData(ticker: string): Promise<SentimentData | null> {
    const cacheKey = `sentiment:${ticker}`;
    const cached = this.getCached<SentimentData>(cacheKey);
    if (cached) return cached;

    const sources: string[] = [];
    let data: Partial<SentimentData> = {
      ticker: ticker.toUpperCase(),
      overallScore: 50,
      sources: [],
      timestamp: new Date()
    };

    try {
      const fgiResponse = await axios.get(
        'https://api.alternative.me/fng/',
        { timeout: 5000 }
      );

      if (fgiResponse.data?.data?.[0]) {
        data.fearGreedIndex = parseInt(fgiResponse.data.data[0].value);
        sources.push('alternative.me');
      }
    } catch (error) {
      this.logger?.warn('Fear & Greed fetch failed', { error });
    }

    data.sources = sources;
    const result = data as SentimentData;
    this.setCache(cacheKey, result);
    return result;
  }

  async fetchUnifiedData(ticker: string): Promise<{
    market: UnifiedMarketData | null;
    onchain: OnChainData | null;
    sentiment: SentimentData | null;
  }> {
    const isStock = this.isStockTicker(ticker);
    
    const [market, onchain, sentiment] = await Promise.all([
      isStock ? this.fetchStockData(ticker) : this.fetchCryptoData(ticker),
      isStock ? Promise.resolve(null) : this.fetchOnChainData(ticker),
      this.fetchSentimentData(ticker)
    ]);

    return { market, onchain, sentiment };
  }

  private tickerToCoingeckoId(ticker: string): string {
    const mapping: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'BNB': 'binancecoin',
      'XRP': 'ripple',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'DOT': 'polkadot',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2',
      'SHIB': 'shiba-inu',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'ATOM': 'cosmos',
      'LTC': 'litecoin',
      'PEPE': 'pepe',
      'BONK': 'bonk',
      'WIF': 'dogwifcoin',
    };
    return mapping[ticker.toUpperCase()] || ticker.toLowerCase();
  }

  private isSolanaToken(ticker: string): boolean {
    const solanaTokens = ['SOL', 'BONK', 'WIF', 'JTO', 'PYTH', 'JUP', 'ORCA', 'RAY', 'MNGO'];
    return solanaTokens.includes(ticker.toUpperCase());
  }

  private isStockTicker(ticker: string): boolean {
    const stockPatterns = /^[A-Z]{1,5}$/;
    const knownStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'AMD', 'INTC', 'IBM'];
    const knownCrypto = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'AVAX'];
    
    if (knownStocks.includes(ticker.toUpperCase())) return true;
    if (knownCrypto.includes(ticker.toUpperCase())) return false;
    
    return stockPatterns.test(ticker) && ticker.length <= 4;
  }
}

export const dataIntegration = new DataIntegrationLayer();
