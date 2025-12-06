import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';
const USE_PRO_API = COINGECKO_API_KEY.startsWith('CG-') || process.env.COINGECKO_PRO === 'true';

const BASE_URL = USE_PRO_API 
  ? 'https://pro-api.coingecko.com/api/v3'
  : 'https://api.coingecko.com/api/v3';

console.log(`[CoinGecko] Using ${USE_PRO_API ? 'PRO' : 'Demo'} API at ${BASE_URL}`);

class CoinGeckoClient {
  private client: AxiosInstance;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private minRequestInterval = USE_PRO_API ? 250 : 2100; // Pro: 240/min, Demo: ~28/min

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
      }
    });

    this.client.interceptors.request.use((config) => {
      if (COINGECKO_API_KEY) {
        if (USE_PRO_API) {
          config.headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
        } else {
          config.params = {
            ...config.params,
            x_cg_demo_api_key: COINGECKO_API_KEY
          };
        }
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          console.warn('[CoinGecko] Rate limited - waiting 60s before retry');
          await new Promise(resolve => setTimeout(resolve, 60000));
          return this.client.request(error.config);
        }
        throw error;
      }
    );
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

  async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return this.throttledRequest(async () => {
      const response = await this.client.get<T>(endpoint, config);
      return response.data;
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
        per_page: 10,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h',
        ...params
      }
    });
  }

  async getSimplePrice(ids: string, vsCurrencies: string = 'usd', includeMarketCap: boolean = true, include24hrVol: boolean = true) {
    return this.get('/simple/price', {
      params: {
        ids,
        vs_currencies: vsCurrencies,
        include_market_cap: includeMarketCap,
        include_24hr_vol: include24hrVol,
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

  getApiStatus(): { hasKey: boolean; isPro: boolean; baseUrl: string } {
    return {
      hasKey: !!COINGECKO_API_KEY,
      isPro: USE_PRO_API,
      baseUrl: BASE_URL
    };
  }
}

export const coinGeckoClient = new CoinGeckoClient();
export default coinGeckoClient;
