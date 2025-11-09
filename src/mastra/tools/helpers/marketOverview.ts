import axios from 'axios';

/**
 * Market Overview Helper
 * Provides batch fetching for stocks and crypto market data
 * Maps categories to ticker lists and normalizes data for CMC-style tables
 */

// Stock ticker mappings by category
export const STOCK_TICKERS = {
  top: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'V', 'JPM', 'WMT', 'LLY', 'UNH', 'XOM', 'MA', 'PG', 'JNJ', 'HD', 'MRK', 'CVX'],
  trending: ['NVDA', 'TSLA', 'AMD', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX', 'COIN', 'PLTR', 'RIVN', 'LCID', 'NIO', 'SOFI', 'HOOD', 'RBLX', 'U', 'SNOW', 'DKNG'],
  gainers: ['NVDA', 'AMD', 'TSLA', 'PLTR', 'COIN', 'RBLX', 'SNOW', 'DKNG', 'NET', 'DDOG', 'ZS', 'CRWD', 'OKTA', 'TEAM', 'SHOP', 'SQ', 'PYPL', 'ROKU', 'UBER', 'LYFT'],
  losers: ['INTC', 'T', 'VZ', 'PFE', 'CVS', 'KO', 'PEP', 'WMT', 'TGT', 'HD', 'LOW', 'NKE', 'DIS', 'BA', 'GE', 'F', 'GM', 'DAL', 'AAL', 'UAL'],
  new: ['RIVN', 'LCID', 'RBLX', 'COIN', 'HOOD', 'SOFI', 'UPST', 'OPEN', 'WISH', 'CLOV'],
  defi: [], // Stocks don't have DeFi category
  nft: [] // Stocks don't have NFT category
};

// Cache for market data (5 minutes TTL)
const marketCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface MarketOverviewItem {
  rank: number;
  symbol: string;
  name: string;
  price: number;
  change_1h?: number;
  change_24h: number;
  change_7d?: number;
  market_cap: number;
  volume_24h: number;
  sparkline_7d?: number[];
}

/**
 * Fetch stock market overview data from Yahoo Finance
 */
export async function fetchStocksOverview(category: string, logger?: any): Promise<MarketOverviewItem[]> {
  logger?.info('📊 [MarketOverview] Fetching stocks', { category });
  
  // Check cache first
  const cacheKey = `market:stocks:${category}`;
  const cached = marketCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    logger?.info('📦 [MarketOverview] Using cached stocks data', { category });
    return cached.data;
  }
  
  const tickers = STOCK_TICKERS[category as keyof typeof STOCK_TICKERS] || STOCK_TICKERS.top;
  
  if (tickers.length === 0) {
    logger?.warn('⚠️ [MarketOverview] No stock tickers for category', { category });
    return [];
  }
  
  try {
    // Yahoo Finance quote API (batch request)
    const symbols = tickers.join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
    
    logger?.info('🌐 [MarketOverview] Calling Yahoo Finance', { url: url.substring(0, 100) });
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const quotes = response.data?.quoteResponse?.result || [];
    logger?.info('✅ [MarketOverview] Yahoo Finance response', { count: quotes.length });
    
    // Normalize to CMC format
    const normalized: MarketOverviewItem[] = quotes
      .filter((q: any) => q.regularMarketPrice) // Only include valid quotes
      .map((quote: any, index: number) => ({
        rank: index + 1,
        symbol: quote.symbol,
        name: quote.shortName || quote.longName || quote.symbol,
        price: quote.regularMarketPrice || 0,
        change_1h: 0, // Yahoo doesn't provide 1h change
        change_24h: quote.regularMarketChangePercent || 0,
        change_7d: 0, // Yahoo doesn't provide 7d change in quote endpoint
        market_cap: quote.marketCap || 0,
        volume_24h: quote.regularMarketVolume || 0,
        sparkline_7d: [] // Would need separate API call for historical data
      }));
    
    // Sort by category
    if (category === 'gainers') {
      normalized.sort((a, b) => b.change_24h - a.change_24h);
    } else if (category === 'losers') {
      normalized.sort((a, b) => a.change_24h - b.change_24h);
    } else if (category === 'trending') {
      normalized.sort((a, b) => b.volume_24h - a.volume_24h);
    } else {
      normalized.sort((a, b) => b.market_cap - a.market_cap);
    }
    
    // Update ranks after sorting
    normalized.forEach((item, index) => {
      item.rank = index + 1;
    });
    
    // Cache the result
    marketCache.set(cacheKey, {
      data: normalized,
      timestamp: Date.now()
    });
    
    logger?.info('✅ [MarketOverview] Stocks data normalized', { count: normalized.length });
    return normalized;
    
  } catch (error: any) {
    logger?.error('❌ [MarketOverview] Yahoo Finance error', { 
      error: error.message,
      category 
    });
    
    // Return empty array on error
    return [];
  }
}

/**
 * Fetch crypto market overview from CoinGecko
 * (Keep this for potential backend caching in the future)
 */
export async function fetchCryptoOverview(category: string, logger?: any): Promise<any[]> {
  logger?.info('📊 [MarketOverview] Fetching crypto', { category });
  
  // Check cache first
  const cacheKey = `market:crypto:${category}`;
  const cached = marketCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    logger?.info('📦 [MarketOverview] Using cached crypto data', { category });
    return cached.data;
  }
  
  try {
    let url = '';
    
    // Build CoinGecko URL based on category
    if (category === 'top') {
      url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d';
    } else if (category === 'trending') {
      url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d';
    } else if (category === 'gainers' || category === 'losers') {
      url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=true&price_change_percentage=1h,24h,7d';
    } else if (category === 'new') {
      url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=gecko_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d';
    } else if (category === 'defi') {
      const defiIds = 'uniswap,aave,maker,lido-dao,curve-dao-token,compound-governance-token,pancakeswap-token,synthetix-network-token,yearn-finance,sushi,thorchain,convex-finance,frax-share,rocket-pool,balancer,1inch,0x,raydium,gmx,ribbon-finance';
      url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${defiIds}&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d`;
    } else {
      // Default to top
      url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=1h,24h,7d';
    }
    
    const response = await axios.get(url, { timeout: 10000 });
    let data = response.data;
    
    // Filter and sort for gainers/losers
    if (category === 'gainers') {
      data = data
        .filter((coin: any) => coin.price_change_percentage_24h > 0)
        .sort((a: any, b: any) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
        .slice(0, 100);
    } else if (category === 'losers') {
      data = data
        .filter((coin: any) => coin.price_change_percentage_24h < 0)
        .sort((a: any, b: any) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
        .slice(0, 100);
    }
    
    // Cache the result
    marketCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    logger?.info('✅ [MarketOverview] Crypto data fetched', { count: data.length });
    return data;
    
  } catch (error: any) {
    logger?.error('❌ [MarketOverview] CoinGecko error', { 
      error: error.message,
      category 
    });
    return [];
  }
}
