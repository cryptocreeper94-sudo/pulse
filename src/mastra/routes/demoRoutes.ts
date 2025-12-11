import { demoTradeService, DemoPortfolio } from '../../services/demoTradeService';
import axios from 'axios';

const demoSessions = new Map<string, DemoPortfolio>();

function getOrCreatePortfolio(sessionId: string): DemoPortfolio {
  if (!demoSessions.has(sessionId)) {
    demoSessions.set(sessionId, demoTradeService.initializePortfolio(sessionId));
  }
  return demoSessions.get(sessionId)!;
}

function calculateSafetyScore(token: any): { safetyScore: number; safetyGrade: 'A' | 'B' | 'C' | 'D' | 'F'; risks: string[] } {
  let score = 100;
  const risks: string[] = [];

  const liquidity = token.liquidity?.usd || 0;
  if (liquidity < 5000) {
    score -= 30;
    risks.push('Low liquidity');
  } else if (liquidity < 20000) {
    score -= 15;
    risks.push('Moderate liquidity');
  }

  const volume24h = token.volume?.h24 || 0;
  if (volume24h < 1000) {
    score -= 20;
    risks.push('Very low volume');
  } else if (volume24h < 10000) {
    score -= 10;
  }

  const priceChange = token.priceChange?.h24 || 0;
  if (priceChange < -50) {
    score -= 25;
    risks.push('Major price dump');
  } else if (priceChange < -20) {
    score -= 10;
  }

  const txns = token.txns?.h24 || {};
  const buys = txns.buys || 0;
  const sells = txns.sells || 0;
  if (sells > buys * 2) {
    score -= 15;
    risks.push('High sell pressure');
  }

  const fdv = token.fdv || 0;
  if (fdv > 100000000) {
    score -= 10;
    risks.push('High FDV');
  }

  score = Math.max(0, Math.min(100, score));

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 80) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else if (score >= 35) grade = 'D';
  else grade = 'F';

  return { safetyScore: score, safetyGrade: grade, risks };
}

export const demoRoutes = [
  {
    path: "/api/demo/discover",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      
      const generateDemoTokens = () => {
        const demoTokens = [
          { symbol: 'BONK', name: 'Bonk', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', basePrice: 0.00002234, safetyGrade: 'A' as const },
          { symbol: 'WIF', name: 'dogwifhat', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', basePrice: 2.45, safetyGrade: 'A' as const },
          { symbol: 'JUP', name: 'Jupiter', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', basePrice: 0.89, safetyGrade: 'A' as const },
          { symbol: 'PYTH', name: 'Pyth Network', address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', basePrice: 0.42, safetyGrade: 'B' as const },
          { symbol: 'RAY', name: 'Raydium', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', basePrice: 4.85, safetyGrade: 'A' as const },
          { symbol: 'ORCA', name: 'Orca', address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', basePrice: 3.12, safetyGrade: 'A' as const },
          { symbol: 'DRIFT', name: 'Drift Protocol', address: 'DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7', basePrice: 1.05, safetyGrade: 'B' as const },
          { symbol: 'MEME', name: 'Memecoin', address: 'MemeXKZv5TghVKUJwD7dDvWVX3FEXXnTwXf7yKuSUUP', basePrice: 0.0034, safetyGrade: 'C' as const },
        ];
        
        return demoTokens.map((token, i) => {
          const priceVariation = 1 + (Math.random() - 0.5) * 0.1;
          const price = token.basePrice * priceVariation;
          const priceChange = (Math.random() - 0.4) * 40;
          const volume = Math.floor(50000 + Math.random() * 500000);
          const liquidity = Math.floor(100000 + Math.random() * 1000000);
          
          const safetyScores = { A: 85 + Math.floor(Math.random() * 15), B: 65 + Math.floor(Math.random() * 15), C: 45 + Math.floor(Math.random() * 15), D: 25 + Math.floor(Math.random() * 15), F: 10 + Math.floor(Math.random() * 15) };
          
          return {
            address: token.address,
            symbol: token.symbol,
            name: token.name,
            price,
            priceChange24h: priceChange,
            volume,
            liquidity,
            safetyScore: safetyScores[token.safetyGrade],
            safetyGrade: token.safetyGrade,
            risks: token.safetyGrade === 'C' ? ['Moderate liquidity', 'High volatility'] : [],
            dex: 'raydium',
            pairAddress: token.address + '_SOL',
            fdv: liquidity * 10,
            txns24h: Math.floor(1000 + Math.random() * 5000),
          };
        });
      };
      
      try {
        logger?.info('🔍 [Demo] Discovering trending tokens');
        
        const response = await axios.get(
          'https://api.dexscreener.com/latest/dex/search?q=solana',
          { timeout: 10000 }
        );

        let pairs = response.data?.pairs || [];
        
        const solanaPairs = pairs.filter((p: any) => 
          p.chainId === 'solana' && 
          (p.liquidity?.usd || 0) >= 1000 &&
          (p.volume?.h24 || 0) >= 500
        ).slice(0, 10);

        if (solanaPairs.length === 0) {
          logger?.info('🔍 [Demo] Using demo tokens (API returned empty)');
          return c.json({
            success: true,
            tokens: generateDemoTokens(),
            timestamp: new Date().toISOString(),
            source: 'demo',
          });
        }

        const processedTokens = solanaPairs.map((pair: any) => {
          const { safetyScore, safetyGrade, risks } = calculateSafetyScore(pair);
          
          return {
            address: pair.baseToken?.address || pair.pairAddress,
            symbol: pair.baseToken?.symbol || 'UNKNOWN',
            name: pair.baseToken?.name || pair.baseToken?.symbol || 'Unknown Token',
            price: parseFloat(pair.priceUsd || '0'),
            priceChange24h: pair.priceChange?.h24 || 0,
            volume: pair.volume?.h24 || 0,
            liquidity: pair.liquidity?.usd || 0,
            safetyScore,
            safetyGrade,
            risks,
            dex: pair.dexId || 'unknown',
            pairAddress: pair.pairAddress,
            fdv: pair.fdv || 0,
            txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
          };
        });

        logger?.info(`🔍 [Demo] Found ${processedTokens.length} tokens`);
        
        return c.json({
          success: true,
          tokens: processedTokens,
          timestamp: new Date().toISOString(),
          source: 'live',
        });
      } catch (error: any) {
        logger?.warn('⚠️ [Demo] API failed, using demo tokens', { error: error.message });
        return c.json({ 
          success: true, 
          tokens: generateDemoTokens(),
          timestamp: new Date().toISOString(),
          source: 'demo',
        });
      }
    }
  },
  {
    path: "/api/demo/prices",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { addresses } = body;
        
        if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
          return c.json({ success: true, prices: {} });
        }

        const prices: Record<string, number> = {};
        
        for (const address of addresses.slice(0, 20)) {
          try {
            const response = await axios.get(
              `https://api.dexscreener.com/latest/dex/tokens/${address}`,
              { timeout: 5000 }
            );
            const pairs = response.data?.pairs;
            if (pairs && pairs.length > 0) {
              prices[address] = parseFloat(pairs[0].priceUsd || '0');
            }
          } catch (err) {
            logger?.warn(`Failed to fetch price for ${address}`);
          }
        }

        return c.json({ success: true, prices });
      } catch (error: any) {
        logger?.error('❌ [Demo] Prices error', { error: error.message });
        return c.json({ success: false, error: 'Failed to fetch prices', prices: {} }, 500);
      }
    }
  },
  {
    path: "/api/demo/portfolio/:sessionId",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const sessionId = c.req.param('sessionId');
      const portfolio = getOrCreatePortfolio(sessionId);
      const totalValue = demoTradeService.getPortfolioValue(portfolio);
      
      return c.json({
        success: true,
        portfolio,
        totalValue,
        pnlPercent: ((totalValue - portfolio.initialBalanceSol) / portfolio.initialBalanceSol) * 100,
      });
    }
  },
  {
    path: "/api/demo/buy",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { sessionId, token, amountUsd } = body;
        
        if (!sessionId || !token || !amountUsd) {
          return c.json({ success: false, error: 'Missing required fields' }, 400);
        }
        
        const portfolio = getOrCreatePortfolio(sessionId);
        const result = await demoTradeService.executeBuy(sessionId, portfolio, token, amountUsd);
        
        if (result.success) {
          demoSessions.set(sessionId, result.portfolio);
        }
        
        logger?.info('📊 [Demo] Buy executed', { sessionId, token: token.symbol, amount: amountUsd });
        return c.json(result);
      } catch (error: any) {
        logger?.error('❌ [Demo] Buy error', { error: error.message });
        return c.json({ success: false, error: 'Trade execution failed' }, 500);
      }
    }
  },
  {
    path: "/api/demo/sell",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { sessionId, positionId, currentPriceUsd } = body;
        
        if (!sessionId || !positionId || !currentPriceUsd) {
          return c.json({ success: false, error: 'Missing required fields' }, 400);
        }
        
        const portfolio = getOrCreatePortfolio(sessionId);
        const result = await demoTradeService.executeSell(sessionId, portfolio, positionId, currentPriceUsd);
        
        if (result.success) {
          demoSessions.set(sessionId, result.portfolio);
        }
        
        logger?.info('📊 [Demo] Sell executed', { sessionId, positionId, pnl: result.pnl });
        return c.json(result);
      } catch (error: any) {
        logger?.error('❌ [Demo] Sell error', { error: error.message });
        return c.json({ success: false, error: 'Trade execution failed' }, 500);
      }
    }
  },
  {
    path: "/api/demo/reset",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { sessionId } = body;
        
        if (!sessionId) {
          return c.json({ success: false, error: 'Missing sessionId' }, 400);
        }
        
        const portfolio = demoTradeService.resetPortfolio(sessionId);
        demoSessions.set(sessionId, portfolio);
        
        logger?.info('📊 [Demo] Portfolio reset', { sessionId });
        return c.json({ success: true, portfolio });
      } catch (error: any) {
        logger?.error('❌ [Demo] Reset error', { error: error.message });
        return c.json({ success: false, error: 'Reset failed' }, 500);
      }
    }
  },
  {
    path: "/api/demo/trades/:sessionId",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const sessionId = c.req.param('sessionId');
      const portfolio = getOrCreatePortfolio(sessionId);
      
      return c.json({
        success: true,
        trades: portfolio.tradeHistory,
        stats: portfolio.stats,
      });
    }
  },
];
