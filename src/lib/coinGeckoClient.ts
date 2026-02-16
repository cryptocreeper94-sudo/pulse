import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';
const USE_PRO_API = COINGECKO_API_KEY.startsWith('CG-') || process.env.COINGECKO_PRO === 'true';

const COINGECKO_PRO_URL = 'https://pro-api.coingecko.com/api/v3';
const COINGECKO_FREE_URL = 'https://api.coingecko.com/api/v3';

const FALLBACK_APIS = [
  { name: 'CoinCap', baseUrl: 'https://api.coincap.io/v2', rateLimit: 200 },
  { name: 'CryptoCompare', baseUrl: 'https://min-api.cryptocompare.com', rateLimit: 100 },
  { name: 'Kraken', baseUrl: 'https://api.kraken.com/0/public', rateLimit: 60 },
];

interface FallbackState {
  currentIndex: number;
  lastRotation: number;
  failureCount: Record<string, number>;
  cooldowns: Record<string, number>;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const CACHE_TTLS: Record<string, number> = {
  '/simple/price': 300_000,
  '/coins/markets': 600_000,
  '/coins/': 600_000,
  '/global': 600_000,
  '/search/trending': 600_000,
  '/coins/.*/ohlc': 600_000,
  '/coins/.*/market_chart': 600_000,
};

const STALE_MULTIPLIER = 5;

function getCacheTTL(endpoint: string): number {
  for (const [pattern, ttl] of Object.entries(CACHE_TTLS)) {
    if (endpoint.match(new RegExp(pattern))) return ttl;
  }
  return 300_000;
}

import * as fs from 'fs';
import * as pathLib from 'path';

const DISK_CACHE_DIR = pathLib.join(process.cwd(), '.cache');
try { if (!fs.existsSync(DISK_CACHE_DIR)) fs.mkdirSync(DISK_CACHE_DIR, { recursive: true }); } catch {}

function saveToDisk(key: string, data: any): void {
  try {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
    fs.writeFileSync(
      pathLib.join(DISK_CACHE_DIR, `${safeKey}.json`),
      JSON.stringify({ data, timestamp: Date.now() }),
      'utf-8'
    );
  } catch {}
}

function loadFromDisk(key: string): { data: any; timestamp: number } | null {
  try {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
    const filePath = pathLib.join(DISK_CACHE_DIR, `${safeKey}.json`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

console.log(`[CoinGecko] Using ${USE_PRO_API ? 'PRO' : 'Demo'} API at ${USE_PRO_API ? COINGECKO_PRO_URL : COINGECKO_FREE_URL}`);

class CoinGeckoClient {
  private client: AxiosInstance;
  private freeClient: AxiosInstance;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private minRequestInterval = USE_PRO_API ? 500 : 2100;
  private fallbackState: FallbackState = {
    currentIndex: 0,
    lastRotation: Date.now(),
    failureCount: {},
    cooldowns: {}
  };
  private usingFallback = false;
  private coinGeckoFailures = 0;
  private readonly MAX_COINGECKO_FAILURES = 3;
  private readonly COOLDOWN_DURATION = 30000;

  private responseCache = new Map<string, CacheEntry>();
  private dailyCallCount = 0;
  private dailyCallDate = new Date().toDateString();
  private readonly DAILY_CALL_BUDGET = 8000;

  constructor() {
    this.client = axios.create({
      baseURL: USE_PRO_API ? COINGECKO_PRO_URL : COINGECKO_FREE_URL,
      timeout: 15000,
      headers: { 'Accept': 'application/json' }
    });

    this.freeClient = axios.create({
      baseURL: COINGECKO_FREE_URL,
      timeout: 15000,
      headers: { 'Accept': 'application/json' }
    });

    this.client.interceptors.request.use((config) => {
      if (COINGECKO_API_KEY) {
        if (USE_PRO_API) {
          config.headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
        } else {
          config.params = { ...config.params, x_cg_demo_api_key: COINGECKO_API_KEY };
        }
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        this.coinGeckoFailures = 0;
        return response;
      },
      async (error) => {
        if (error.response?.status === 429 || error.response?.status === 503 || error.response?.status >= 500) {
          this.coinGeckoFailures++;
          console.warn(`[CoinGecko] API error (${error.response?.status}) - failure count: ${this.coinGeckoFailures}/${this.MAX_COINGECKO_FAILURES}`);
          
          if (this.coinGeckoFailures >= this.MAX_COINGECKO_FAILURES) {
            console.warn('[CoinGecko] Max failures reached - switching to fallback APIs');
            this.usingFallback = true;
          }
        }
        throw error;
      }
    );

    setInterval(() => this.cleanCache(), 120_000);
    this.loadDiskCacheOnStartup();
  }

  private getCacheKey(endpoint: string, config?: AxiosRequestConfig): string {
    const params = config?.params ? JSON.stringify(config.params, Object.keys(config.params).sort()) : '';
    return `${endpoint}:${params}`;
  }

  private getFromCache(key: string): any | null {
    const entry = this.responseCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      return null;
    }
    return entry.data;
  }

  private getStaleFromCache(key: string): any | null {
    const entry = this.responseCache.get(key);
    if (entry && Date.now() - entry.timestamp < entry.ttl * STALE_MULTIPLIER) {
      return entry.data;
    }
    const diskEntry = loadFromDisk(key);
    if (diskEntry && Date.now() - diskEntry.timestamp < 3600_000) {
      return diskEntry.data;
    }
    return null;
  }

  private setCache(key: string, data: any, endpoint: string): void {
    const ttl = getCacheTTL(endpoint);
    this.responseCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    saveToDisk(key, data);
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.responseCache.entries()) {
      if (now - entry.timestamp > entry.ttl * STALE_MULTIPLIER) {
        this.responseCache.delete(key);
      }
    }
  }

  private loadDiskCacheOnStartup(): void {
    try {
      const files = fs.readdirSync(DISK_CACHE_DIR);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        try {
          const raw = fs.readFileSync(pathLib.join(DISK_CACHE_DIR, file), 'utf-8');
          const { data, timestamp } = JSON.parse(raw);
          if (Date.now() - timestamp < 3600_000) {
            const key = file.replace('.json', '');
            this.responseCache.set(key, { data, timestamp, ttl: 600_000 });
          }
        } catch {}
      }
      console.log(`[Cache] Loaded ${this.responseCache.size} entries from disk`);
    } catch {}
  }

  private trackDailyCall(): void {
    const today = new Date().toDateString();
    if (today !== this.dailyCallDate) {
      console.log(`[CoinGecko] Daily reset - yesterday: ${this.dailyCallCount} calls`);
      this.dailyCallCount = 0;
      this.dailyCallDate = today;
    }
    this.dailyCallCount++;
    if (this.dailyCallCount % 100 === 0) {
      console.log(`[CoinGecko] Daily call count: ${this.dailyCallCount}/${this.DAILY_CALL_BUDGET}`);
    }
    if (this.dailyCallCount >= this.DAILY_CALL_BUDGET) {
      console.warn(`[CoinGecko] DAILY BUDGET EXCEEDED (${this.dailyCallCount}) - switching to fallbacks`);
      this.usingFallback = true;
    }
  }

  private async throttledRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
    return requestFn();
  }

  private getNextFallbackApi(): typeof FALLBACK_APIS[0] | null {
    const now = Date.now();
    
    for (let i = 0; i < FALLBACK_APIS.length; i++) {
      const idx = (this.fallbackState.currentIndex + i) % FALLBACK_APIS.length;
      const api = FALLBACK_APIS[idx];
      const cooldownEnd = this.fallbackState.cooldowns[api.name] || 0;
      
      if (now > cooldownEnd) {
        this.fallbackState.currentIndex = (idx + 1) % FALLBACK_APIS.length;
        return api;
      }
    }
    
    return null;
  }

  private setCooldown(apiName: string): void {
    this.fallbackState.cooldowns[apiName] = Date.now() + this.COOLDOWN_DURATION;
    this.fallbackState.failureCount[apiName] = (this.fallbackState.failureCount[apiName] || 0) + 1;
    console.warn(`[Fallback] ${apiName} on cooldown for ${this.COOLDOWN_DURATION / 1000}s`);
  }

  private async fetchFromCoinCap(endpoint: string, params: any): Promise<any> {
    const api = FALLBACK_APIS[0];
    
    if (endpoint.includes('/coins/markets') || endpoint.includes('/simple/price')) {
      const response = await axios.get(`${api.baseUrl}/assets`, {
        timeout: 10000,
        params: { limit: params.per_page || 50 }
      });
      
      return response.data.data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toLowerCase(),
        name: coin.name,
        current_price: parseFloat(coin.priceUsd),
        market_cap: parseFloat(coin.marketCapUsd),
        market_cap_rank: parseInt(coin.rank),
        total_volume: parseFloat(coin.volumeUsd24Hr),
        price_change_percentage_24h: parseFloat(coin.changePercent24Hr),
        image: `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`
      }));
    }
    
    if (endpoint.includes('/global')) {
      const response = await axios.get(`${api.baseUrl}/global`, { timeout: 10000 });
      return {
        data: {
          total_market_cap: { usd: parseFloat(response.data.data.totalMarketCapUsd) },
          market_cap_change_percentage_24h_usd: parseFloat(response.data.data.marketCapChangePercent24Hr)
        }
      };
    }
    
    throw new Error('Endpoint not supported by CoinCap fallback');
  }

  private async fetchFromCryptoCompare(endpoint: string, params: any): Promise<any> {
    const api = FALLBACK_APIS[1];
    console.log(`[CryptoCompare DEBUG] endpoint="${endpoint}", params.per_page=${params.per_page}, params keys=${Object.keys(params).join(',')}`);
    
    if (endpoint.includes('/coins/markets') || endpoint.includes('/simple/price')) {
      const requestedLimit = params.per_page || 50;
      console.log(`[CryptoCompare] Requesting ${requestedLimit} coins (per_page: ${params.per_page}, endpoint: ${endpoint})`);
      const response = await axios.get(`${api.baseUrl}/data/top/mktcapfull`, {
        timeout: 10000,
        params: { limit: requestedLimit, tsym: 'USD' }
      });
      console.log(`[CryptoCompare] API returned ${response.data.Data?.length} coins`);
      
      return response.data.Data.map((item: any, index: number) => ({
        id: item.CoinInfo.Name.toLowerCase(),
        symbol: item.CoinInfo.Name.toLowerCase(),
        name: item.CoinInfo.FullName,
        current_price: item.RAW?.USD?.PRICE || 0,
        market_cap: item.RAW?.USD?.MKTCAP || 0,
        market_cap_rank: index + 1,
        total_volume: item.RAW?.USD?.VOLUME24HOUR || 0,
        price_change_percentage_24h: item.RAW?.USD?.CHANGEPCT24HOUR || 0,
        image: `https://www.cryptocompare.com${item.CoinInfo.ImageUrl}`
      }));
    }

    if (endpoint.includes('/ohlc') || endpoint.includes('/market_chart')) {
      const coinMatch = endpoint.match(/\/coins\/([^/]+)\//);
      const coinId = coinMatch ? coinMatch[1] : 'bitcoin';
      const symbol = this.coinIdToSymbol(coinId) || coinId.toUpperCase();
      const days = params.days || 7;
      const daysNum = typeof days === 'string' ? parseInt(days) : days;

      let apiEndpoint: string;
      let limit: number;
      if (daysNum <= 1) {
        apiEndpoint = `${api.baseUrl}/data/v2/histohour`;
        limit = 24;
      } else if (daysNum <= 30) {
        apiEndpoint = `${api.baseUrl}/data/v2/histohour`;
        limit = Math.min(daysNum * 24, 720);
      } else {
        apiEndpoint = `${api.baseUrl}/data/v2/histoday`;
        limit = Math.min(daysNum, 365);
      }

      const response = await axios.get(apiEndpoint, {
        timeout: 10000,
        params: { fsym: symbol, tsym: 'USD', limit }
      });

      const histData = response.data?.Data?.Data || [];
      if (endpoint.includes('/ohlc')) {
        return histData.map((d: any) => ([
          d.time * 1000,
          d.open,
          d.high,
          d.low,
          d.close
        ]));
      }
      return {
        prices: histData.map((d: any) => [d.time * 1000, d.close]),
        market_caps: histData.map((d: any) => [d.time * 1000, 0]),
        total_volumes: histData.map((d: any) => [d.time * 1000, d.volumeto])
      };
    }

    if (endpoint.includes('/global')) {
      const response = await axios.get(`${api.baseUrl}/data/top/mktcapfull`, {
        timeout: 10000,
        params: { limit: 10, tsym: 'USD' }
      });
      let totalMcap = 0;
      let btcMcap = 0;
      let ethMcap = 0;
      for (const item of (response.data.Data || [])) {
        const mcap = item.RAW?.USD?.MKTCAP || 0;
        totalMcap += mcap;
        if (item.CoinInfo.Name === 'BTC') btcMcap = mcap;
        if (item.CoinInfo.Name === 'ETH') ethMcap = mcap;
      }
      return {
        data: {
          total_market_cap: { usd: totalMcap },
          market_cap_change_percentage_24h_usd: 0,
          market_cap_percentage: {
            btc: totalMcap > 0 ? (btcMcap / totalMcap) * 100 : 54,
            eth: totalMcap > 0 ? (ethMcap / totalMcap) * 100 : 12,
          },
          active_cryptocurrencies: 15000,
          markets: 800
        }
      };
    }
    
    throw new Error('Endpoint not supported by CryptoCompare fallback');
  }

  private async fetchFromKraken(endpoint: string, params: any): Promise<any> {
    const api = FALLBACK_APIS[2];
    
    if (endpoint.includes('/simple/price')) {
      const ids = params.ids?.split(',') || [];
      const results: Record<string, any> = {};
      
      for (const id of ids.slice(0, 10)) {
        const symbol = this.coinIdToKrakenPair(id);
        if (!symbol) continue;
        
        try {
          const response = await axios.get(`${api.baseUrl}/Ticker`, {
            timeout: 5000,
            params: { pair: symbol }
          });
          
          if (response.data.result) {
            const pairData = Object.values(response.data.result)[0] as any;
            results[id] = {
              usd: parseFloat(pairData.c[0]),
              usd_24h_change: ((parseFloat(pairData.c[0]) - parseFloat(pairData.o)) / parseFloat(pairData.o)) * 100,
              usd_24h_vol: parseFloat(pairData.v[1])
            };
          }
        } catch (e) {
          continue;
        }
      }
      
      return results;
    }
    
    if (endpoint.includes('/coins/markets')) {
      const requestedCount = params.per_page || 50;
      if (requestedCount > 10) {
        throw new Error('Kraken only supports up to 10 market pairs - use CryptoCompare for larger requests');
      }
      const response = await axios.get(`${api.baseUrl}/Ticker`, {
        timeout: 10000,
        params: { pair: 'BTCUSD,ETHUSD,SOLUSD,XRPUSD,ADAUSD,DOGEUSD,DOTUSD,LINKUSD,LTCUSD,UNIUSD' }
      });
      
      if (response.data.result) {
        const coins = [];
        const pairMapping: Record<string, { id: string; name: string; symbol: string }> = {
          'XXBTZUSD': { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc' },
          'XETHZUSD': { id: 'ethereum', name: 'Ethereum', symbol: 'eth' },
          'SOLUSD': { id: 'solana', name: 'Solana', symbol: 'sol' },
          'XXRPZUSD': { id: 'ripple', name: 'XRP', symbol: 'xrp' },
          'ADAUSD': { id: 'cardano', name: 'Cardano', symbol: 'ada' },
          'XDGUSD': { id: 'dogecoin', name: 'Dogecoin', symbol: 'doge' },
          'DOTUSD': { id: 'polkadot', name: 'Polkadot', symbol: 'dot' },
          'LINKUSD': { id: 'chainlink', name: 'Chainlink', symbol: 'link' },
          'XLTCZUSD': { id: 'litecoin', name: 'Litecoin', symbol: 'ltc' },
          'UNIUSD': { id: 'uniswap', name: 'Uniswap', symbol: 'uni' }
        };
        
        let rank = 1;
        for (const [pair, data] of Object.entries(response.data.result)) {
          const mapping = pairMapping[pair];
          if (mapping) {
            const pairData = data as any;
            coins.push({
              id: mapping.id,
              symbol: mapping.symbol,
              name: mapping.name,
              current_price: parseFloat(pairData.c[0]),
              market_cap: 0,
              market_cap_rank: rank++,
              total_volume: parseFloat(pairData.v[1]) * parseFloat(pairData.c[0]),
              price_change_percentage_24h: ((parseFloat(pairData.c[0]) - parseFloat(pairData.o)) / parseFloat(pairData.o)) * 100,
              image: `https://assets.coincap.io/assets/icons/${mapping.symbol}@2x.png`
            });
          }
        }
        return coins;
      }
    }
    
    throw new Error('Endpoint not supported by Kraken fallback');
  }

  private coinIdToKrakenPair(coinId: string): string | null {
    const mapping: Record<string, string> = {
      'bitcoin': 'XBTUSD', 'ethereum': 'ETHUSD', 'solana': 'SOLUSD',
      'ripple': 'XRPUSD', 'cardano': 'ADAUSD', 'dogecoin': 'DOGEUSD',
      'polkadot': 'DOTUSD', 'chainlink': 'LINKUSD', 'litecoin': 'LTCUSD',
      'uniswap': 'UNIUSD', 'stellar': 'XLMUSD', 'cosmos': 'ATOMUSD'
    };
    return mapping[coinId] || null;
  }

  private coinIdToSymbol(coinId: string): string | null {
    const mapping: Record<string, string> = {
      'bitcoin': 'BTC', 'ethereum': 'ETH', 'solana': 'SOL',
      'binancecoin': 'BNB', 'ripple': 'XRP', 'cardano': 'ADA',
      'dogecoin': 'DOGE', 'polkadot': 'DOT', 'avalanche-2': 'AVAX',
      'chainlink': 'LINK', 'polygon': 'MATIC', 'litecoin': 'LTC',
      'uniswap': 'UNI', 'stellar': 'XLM', 'cosmos': 'ATOM'
    };
    return mapping[coinId] || null;
  }

  private async tryFallbackApis(endpoint: string, params: any): Promise<any> {
    const errors: string[] = [];
    
    for (let attempt = 0; attempt < FALLBACK_APIS.length; attempt++) {
      const api = this.getNextFallbackApi();
      if (!api) {
        throw new Error(`All fallback APIs on cooldown: ${errors.join('; ')}`);
      }
      
      try {
        console.log(`[Fallback] Trying ${api.name}...`);
        
        let result;
        switch (api.name) {
          case 'CoinCap':
            result = await this.fetchFromCoinCap(endpoint, params);
            break;
          case 'CryptoCompare':
            result = await this.fetchFromCryptoCompare(endpoint, params);
            break;
          case 'Kraken':
            result = await this.fetchFromKraken(endpoint, params);
            break;
          default:
            throw new Error(`Unknown API: ${api.name}`);
        }
        
        console.log(`[Fallback] ${api.name} succeeded`);
        this.fallbackState.failureCount[api.name] = 0;
        return result;
        
      } catch (error: any) {
        errors.push(`${api.name}: ${error.message}`);
        this.setCooldown(api.name);
      }
    }
    
    throw new Error(`All fallback APIs failed: ${errors.join('; ')}`);
  }

  async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, config);
    const cached = this.getFromCache(cacheKey);
    if (cached !== null) {
      return cached as T;
    }

    const staleData = this.getStaleFromCache(cacheKey);

    return this.throttledRequest(async () => {
      const cachedAgain = this.getFromCache(cacheKey);
      if (cachedAgain !== null) return cachedAgain as T;

      this.trackDailyCall();

      const tryFetchFresh = async (): Promise<T> => {
        if (!this.usingFallback) {
          try {
            const response = await this.client.get<T>(endpoint, config);
            this.setCache(cacheKey, response.data, endpoint);
            return response.data;
          } catch (error: any) {
            if (error.response?.status === 429 || error.response?.status >= 500) {
              console.warn(`[CoinGecko] Pro API failed (${error.response?.status}), trying fallback APIs...`);
              const result = await this.tryFallbackApis(endpoint, config?.params || {});
              this.setCache(cacheKey, result, endpoint);
              return result as T;
            }
            throw error;
          }
        } else {
          const now = Date.now();
          if (now - this.fallbackState.lastRotation > 600000) {
            console.log('[CoinGecko] Attempting to restore primary API...');
            this.usingFallback = false;
            this.coinGeckoFailures = 0;
            this.fallbackState.lastRotation = now;
            
            try {
              const response = await this.client.get<T>(endpoint, config);
              console.log('[CoinGecko] Primary API restored successfully');
              this.setCache(cacheKey, response.data, endpoint);
              return response.data;
            } catch (error) {
              console.warn('[CoinGecko] Primary API still failing, continuing with fallbacks');
              this.usingFallback = true;
            }
          }
          
          const result = await this.tryFallbackApis(endpoint, config?.params || {});
          this.setCache(cacheKey, result, endpoint);
          return result as T;
        }
      };

      try {
        return await tryFetchFresh();
      } catch (error: any) {
        if (staleData !== null) {
          console.warn(`[Cache] Serving stale data for ${endpoint} (all APIs failed)`);
          return staleData as T;
        }
        throw error;
      }
    });
  }

  async getMarketChart(coinId: string = 'bitcoin', days: number | string = 1, vsCurrency: string = 'usd') {
    return this.get(`/coins/${coinId}/market_chart`, {
      params: { vs_currency: vsCurrency, days }
    });
  }

  async getOHLC(coinId: string = 'bitcoin', days: number = 1, vsCurrency: string = 'usd') {
    return this.get(`/coins/${coinId}/ohlc`, {
      params: { vs_currency: vsCurrency, days }
    });
  }

  async getMarkets(params: {
    vs_currency?: string;
    order?: string;
    per_page?: number;
    page?: number;
    sparkline?: boolean;
    price_change_percentage?: string;
    category?: string;
    ids?: string;
  } = {}) {
    return this.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 50,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h',
        ...params
      }
    });
  }

  async getSimplePrice(ids: string, vsCurrencies: string = 'usd', includeMarketCap: boolean = true, include24hrVol: boolean = true, include24hrChange: boolean = true) {
    return this.get('/simple/price', {
      params: {
        ids,
        vs_currencies: vsCurrencies,
        include_market_cap: includeMarketCap,
        include_24hr_vol: include24hrVol,
        include_24hr_change: include24hrChange,
        include_market_cap_change_percentage_24h_in: vsCurrencies
      }
    });
  }

  async getCoinDetails(coinId: string) {
    return this.get(`/coins/${coinId}`, {
      params: { localization: false }
    });
  }

  async getGlobal() {
    return this.get('/global');
  }

  async getTrending() {
    return this.get('/search/trending');
  }

  hasApiKey(): boolean {
    return !!COINGECKO_API_KEY;
  }

  getApiStatus(): { hasKey: boolean; isPro: boolean; baseUrl: string; usingFallback: boolean; failureCount: number; dailyCalls: number; cacheSize: number } {
    return {
      hasKey: !!COINGECKO_API_KEY,
      isPro: USE_PRO_API,
      baseUrl: USE_PRO_API ? COINGECKO_PRO_URL : COINGECKO_FREE_URL,
      usingFallback: this.usingFallback,
      failureCount: this.coinGeckoFailures,
      dailyCalls: this.dailyCallCount,
      cacheSize: this.responseCache.size
    };
  }

  resetFallbackState(): void {
    this.usingFallback = false;
    this.coinGeckoFailures = 0;
    this.fallbackState = {
      currentIndex: 0,
      lastRotation: Date.now(),
      failureCount: {},
      cooldowns: {}
    };
    console.log('[CoinGecko] Fallback state reset');
  }
}

export const coinGeckoClient = new CoinGeckoClient();
export default coinGeckoClient;
