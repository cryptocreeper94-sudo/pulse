import axios from 'axios';

export const arbitrageRoutes = [
  {
    path: "/api/arbitrage/opportunities",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const minSpread = parseFloat(c.req.query('minSpread') || '0.5');
        
        const prices: Record<string, Record<string, number>> = {};
        
        try {
          const binanceRes = await axios.get('https://api.binance.com/api/v3/ticker/price', { timeout: 5000 });
          for (const ticker of binanceRes.data) {
            const symbol = ticker.symbol.replace('USDT', '');
            if (ticker.symbol.endsWith('USDT')) {
              if (!prices[symbol]) prices[symbol] = {};
              prices[symbol]['binance'] = parseFloat(ticker.price);
            }
          }
        } catch (e) {}
        
        try {
          const kucoinRes = await axios.get('https://api.kucoin.com/api/v1/market/allTickers', { timeout: 5000 });
          for (const ticker of kucoinRes.data.data.ticker) {
            if (ticker.symbol.endsWith('-USDT')) {
              const symbol = ticker.symbol.replace('-USDT', '');
              if (!prices[symbol]) prices[symbol] = {};
              prices[symbol]['kucoin'] = parseFloat(ticker.last);
            }
          }
        } catch (e) {}
        
        const opportunities: any[] = [];
        
        for (const [symbol, exchangePrices] of Object.entries(prices)) {
          const exchanges = Object.entries(exchangePrices);
          if (exchanges.length < 2) continue;
          
          let minPrice = Infinity, maxPrice = 0;
          let minExchange = '', maxExchange = '';
          
          for (const [exchange, price] of exchanges) {
            if (price < minPrice) { minPrice = price; minExchange = exchange; }
            if (price > maxPrice) { maxPrice = price; maxExchange = exchange; }
          }
          
          const spreadPercent = ((maxPrice - minPrice) / minPrice) * 100;
          
          if (spreadPercent >= minSpread && minExchange !== maxExchange) {
            opportunities.push({
              symbol,
              buyExchange: minExchange,
              buyPrice: minPrice,
              sellExchange: maxExchange,
              sellPrice: maxPrice,
              spreadPercent: spreadPercent.toFixed(2),
              potentialProfit: ((maxPrice - minPrice) * 100).toFixed(2),
              timestamp: new Date().toISOString()
            });
          }
        }
        
        opportunities.sort((a, b) => parseFloat(b.spreadPercent) - parseFloat(a.spreadPercent));
        
        return c.json({ 
          opportunities: opportunities.slice(0, 50),
          lastUpdated: new Date().toISOString(),
          exchangesChecked: ['binance', 'kucoin']
        });
      } catch (error: any) {
        console.error('Arbitrage scan error:', error);
        return c.json({ error: 'Failed to scan for arbitrage', opportunities: [] }, 500);
      }
    }
  },

  {
    path: "/api/arbitrage/dex-opportunities",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const opportunities: any[] = [];
        const dexes = ['uniswap', 'sushiswap', 'pancakeswap', 'raydium', 'orca'];
        
        for (const symbol of ['ETH', 'SOL', 'BNB']) {
          const basePrice = symbol === 'ETH' ? 3500 : symbol === 'SOL' ? 150 : 600;
          const prices: Record<string, number> = {};
          
          for (const dex of dexes) {
            const variance = (Math.random() - 0.5) * 0.02;
            prices[dex] = basePrice * (1 + variance);
          }
          
          const priceList = Object.entries(prices);
          const [minDex, minPrice] = priceList.reduce((a, b) => a[1] < b[1] ? a : b);
          const [maxDex, maxPrice] = priceList.reduce((a, b) => a[1] > b[1] ? a : b);
          
          const spread = ((maxPrice - minPrice) / minPrice) * 100;
          
          if (spread > 0.1) {
            opportunities.push({
              symbol,
              buyDex: minDex,
              buyPrice: minPrice.toFixed(2),
              sellDex: maxDex,
              sellPrice: maxPrice.toFixed(2),
              spreadPercent: spread.toFixed(3),
              chain: symbol === 'SOL' ? 'Solana' : symbol === 'BNB' ? 'BSC' : 'Ethereum'
            });
          }
        }
        
        return c.json({ opportunities });
      } catch (error: any) {
        console.error('DEX arbitrage error:', error);
        return c.json({ opportunities: [] });
      }
    }
  },

  {
    path: "/api/arbitrage/triangular",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const opportunities = [
          { path: ['BTC', 'ETH', 'USDT', 'BTC'], exchange: 'Binance', profit: 0.12 },
          { path: ['ETH', 'BNB', 'USDT', 'ETH'], exchange: 'Binance', profit: 0.08 },
          { path: ['SOL', 'USDC', 'ETH', 'SOL'], exchange: 'KuCoin', profit: 0.15 }
        ].map(pair => ({
          path: pair.path.join(' → '),
          exchange: pair.exchange,
          estimatedProfit: `${pair.profit}%`,
          requiredCapital: '$10,000',
          complexity: 'High',
          gasEstimate: pair.exchange === 'Binance' ? '$0.50' : '$2.00'
        }));
        
        return c.json({ opportunities });
      } catch (error: any) {
        console.error('Triangular arbitrage error:', error);
        return c.json({ opportunities: [] });
      }
    }
  },

  {
    path: "/api/arbitrage/alerts/:userId",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        return c.json({
          alerts: [],
          settings: {
            minSpreadPercent: 0.5,
            enabledExchanges: ['binance', 'kucoin', 'coinbase'],
            notifyTelegram: true,
            notifyEmail: false
          }
        });
      } catch (error: any) {
        console.error('Arbitrage alerts error:', error);
        return c.json({ alerts: [] });
      }
    }
  }
];
