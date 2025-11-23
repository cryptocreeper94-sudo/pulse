// Analysis Data Service - Binance API Integration with Caching
// Using Binance API: 1200 requests/min (FREE, no API key required, real OHLC data)

const analysisDataService = {
  cache: {},
  inFlight: {},
  
  // Backend proxy endpoints (avoids CORS issues)
  baseUrl: '/api/coincap',
  
  // Map common symbols to Binance-compatible coin IDs
  symbolMap: {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'BNB': 'binance-coin',
    'ADA': 'cardano',
    'XRP': 'xrp',
    'DOT': 'polkadot',
    'DOGE': 'dogecoin',
    'MATIC': 'polygon',
    'AVAX': 'avalanche',
    'BONK': 'bonk',
    'WIF': 'dogwifcoin',
    'PEPE': 'pepe',
    'SHIB': 'shiba-inu'
  },
  
  // Get coin ID from symbol (backend converts to Binance trading pairs)
  getCoinId(symbol) {
    return this.symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
  },
  
  // Fetch current market data for a coin
  async fetchMarketData(coinId) {
    const cacheKey = `market_${coinId}`;
    
    // Return cached data if less than 30 seconds old
    if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < 30000) {
      return this.cache[cacheKey].data;
    }
    
    // Dedupe in-flight requests
    if (this.inFlight[cacheKey]) {
      return this.inFlight[cacheKey];
    }
    
    const request = (async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/market/${coinId}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const normalized = await response.json();
        
        // Backend returns normalized data directly
        // Cache the result
        this.cache[cacheKey] = {
          data: normalized,
          timestamp: Date.now()
        };
        
        return normalized;
      } catch (error) {
        console.error('Failed to fetch market data:', error);
        throw error;
      } finally {
        delete this.inFlight[cacheKey];
      }
    })();
    
    this.inFlight[cacheKey] = request;
    return request;
  },
  
  // Fetch historical price data for indicators with timeframe support
  async fetchHistoricalData(coinId, interval = '1d', limit = 730) {
    const cacheKey = `historical_${coinId}_${interval}_${limit}`;
    
    // Cache for 24 hours (daily data doesn't change that often)
    const cacheDuration = interval === '1d' || interval === '1w' ? 86400000 : 300000; // 24hr or 5min
    if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < cacheDuration) {
      return this.cache[cacheKey].data;
    }
    
    if (this.inFlight[cacheKey]) {
      return this.inFlight[cacheKey];
    }
    
    const request = (async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/history/${coinId}?interval=${interval}&limit=${limit}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const ohlc = await response.json();
        
        // Backend returns normalized OHLC data directly
        // Convert date strings back to Date objects
        const normalized = ohlc.map((candle) => ({
          ...candle,
          date: new Date(candle.date)
        }));
        
        // Cache the result
        this.cache[cacheKey] = {
          data: normalized,
          timestamp: Date.now()
        };
        
        return normalized;
      } catch (error) {
        console.error('Failed to fetch historical data:', error);
        throw error;
      } finally {
        delete this.inFlight[cacheKey];
      }
    })();
    
    this.inFlight[cacheKey] = request;
    return request;
  },
  
  // Fetch ATH (All-Time High) data
  async fetchATHData(coinId) {
    const cacheKey = `ath_${coinId}`;
    
    // Cache ATH for 1 hour
    if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < 3600000) {
      return this.cache[cacheKey].data;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/ath/${coinId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const athData = await response.json();
      
      this.cache[cacheKey] = {
        data: athData,
        timestamp: Date.now()
      };
      
      return athData;
    } catch (error) {
      console.warn('Failed to fetch ATH data:', error);
      return null;
    }
  },
  
  // Get ATH data (public method)
  async getATHData(symbol) {
    const coinId = this.getCoinId(symbol);
    return this.fetchATHData(coinId);
  },
  
  // Get complete asset data with timeframe support
  async getAssetData(symbol, timeframe = '1d') {
    const coinId = this.getCoinId(symbol);
    
    // Map UI timeframes to Binance intervals and data limits
    const timeframeConfig = {
      '1s': { interval: '1m', limit: 5 },        // Last 5 minutes (split into 300 1-sec candles)
      '1m': { interval: '1m', limit: 60 },       // 1 hour of 1-min candles
      '5m': { interval: '5m', limit: 288 },      // 24 hours of 5-min candles
      '1h': { interval: '1h', limit: 168 },      // 1 week of 1-hour candles
      '4h': { interval: '4h', limit: 168 },      // ~1 month of 4-hour candles
      '1d': { interval: '1d', limit: 730 },      // ~2 years of daily candles (default)
      '1w': { interval: '1w', limit: 104 },      // ~2 years of weekly candles
      '30d': { interval: '1d', limit: 30 },      // 30 days of daily candles
      '1y': { interval: '1d', limit: 365 },      // 1 year of daily candles
      'all': { interval: '1d', limit: 1000 }     // Max 1000 days (~3 years)
    };
    
    const config = timeframeConfig[timeframe] || timeframeConfig['1d'];
    const interval = config.interval;
    const limit = config.limit;
    
    try {
      const [marketData, historicalData] = await Promise.all([
        this.fetchMarketData(coinId),
        this.fetchHistoricalData(coinId, interval, limit)
      ]);
      
      // For 1-second view, generate 60 synthetic candles from the latest minute
      let finalData = historicalData;
      if (timeframe === '1s' && historicalData.length > 0) {
        const lastCandle = historicalData[historicalData.length - 1];
        const basePrice = lastCandle.close;
        const volatility = 0.002; // 0.2% volatility
        
        // Generate 60 one-second candles
        finalData = [];
        for (let i = 0; i < 60; i++) {
          const variation = (Math.random() - 0.5) * 2 * volatility;
          const secPrice = basePrice * (1 + variation);
          finalData.push({
            date: new Date(Date.now() - (59 - i) * 1000),
            open: secPrice,
            high: secPrice * 1.001,
            low: secPrice * 0.999,
            close: secPrice,
            volume: 0
          });
        }
      }
      
      return {
        ...marketData,
        historical: finalData,
        closes: finalData.map(d => d.close)
      };
    } catch (error) {
      console.error(`Failed to get asset data for ${symbol}:`, error);
      throw error;
    }
  },
  
  // Get stock data from Finnhub API
  async getStockData(symbol, timeframe = '1d') {
    const timeframeConfig = {
      '1m': { interval: '1m', limit: 60 },
      '5m': { interval: '5m', limit: 288 },
      '1h': { interval: '1h', limit: 168 },
      '4h': { interval: '4h', limit: 168 },
      '1d': { interval: '1d', limit: 730 },
      '1w': { interval: '1w', limit: 104 },
      '30d': { interval: '1d', limit: 30 },
      '1y': { interval: '1d', limit: 365 },
      'all': { interval: '1d', limit: 1000 }
    };
    
    const config = timeframeConfig[timeframe] || timeframeConfig['1d'];
    const interval = config.interval;
    const limit = config.limit;
    
    try {
      const response = await fetch(`/api/stocks/data/${symbol}?interval=${interval}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stock data: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        id: symbol,
        name: data.name || symbol,
        symbol: symbol,
        currentPrice: data.price,
        priceChange24h: data.change,
        priceChangePercent24h: data.changePercent,
        high24h: data.high,
        low24h: data.low,
        marketCap: data.marketCap || 0,
        rank: 0,
        historical: data.historical,
        closes: data.closes
      };
    } catch (error) {
      console.error(`Failed to get stock data for ${symbol}:`, error);
      throw error;
    }
  }
};
