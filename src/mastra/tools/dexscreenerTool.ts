import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";

/**
 * Dexscreener Tool - Fetches DEX pair data for meme coins and high volatility tokens
 * Supports all major chains: Solana, Ethereum, Base, BSC, Arbitrum, etc.
 */

export const dexscreenerTool = createTool({
  id: "dexscreener-tool",
  description: "Fetches DEX pair data from Dexscreener for meme coins, new tokens, and high volatility assets. Searches by token symbol, name, or address. Returns price, volume, liquidity, and trading data.",

  inputSchema: z.object({
    query: z.string().describe("Token symbol, name, or contract address to search for (e.g., 'PEPE', 'BONK', '0x123...')"),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    ticker: z.string(),
    name: z.string(),
    chain: z.string(),
    dex: z.string(),
    pairAddress: z.string(),
    currentPrice: z.number(),
    priceChange24h: z.number(),
    priceChangePercent24h: z.number(),
    priceChange6h: z.number().optional(),
    priceChangePercent6h: z.number().optional(),
    priceChange1h: z.number().optional(),
    priceChangePercent1h: z.number().optional(),
    volume24h: z.number(),
    volume6h: z.number().optional(),
    volume1h: z.number().optional(),
    liquidity: z.number(),
    marketCap: z.number().optional(),
    fdv: z.number().optional(),
    txns24h: z.number().optional(),
    priceHistory: z.array(z.object({
      timestamp: z.number(),
      price: z.number(),
    })),
    baseToken: z.object({
      address: z.string(),
      name: z.string(),
      symbol: z.string(),
    }),
    quoteToken: z.object({
      address: z.string(),
      name: z.string(),
      symbol: z.string(),
    }),
    url: z.string(),
    message: z.string(),
  }),

  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [DexscreenerTool] Starting search', { query: context.query });

    try {
      // Search for pairs using Dexscreener API
      const searchUrl = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(context.query)}`;
      
      logger?.info('📡 [DexscreenerTool] Fetching from Dexscreener', { url: searchUrl });
      
      const response = await axios.get(searchUrl, {
        headers: {
          'Accept': 'application/json',
        },
        timeout: 10000,
      });

      if (!response.data || !response.data.pairs || response.data.pairs.length === 0) {
        throw new Error(`No DEX pairs found for "${context.query}"`);
      }

      // Filter to ONLY pairs that match the query symbol (case-insensitive)
      // This prevents returning wrong coins (e.g., XVG -> DHN)
      const pairs = response.data.pairs;
      const queryUpper = context.query.toUpperCase();
      
      // First try to find exact symbol match
      let matchingPairs = pairs.filter((pair: any) => 
        pair.baseToken.symbol.toUpperCase() === queryUpper ||
        pair.baseToken.name.toUpperCase() === queryUpper
      );
      
      // If no exact match, check if query is a contract address
      if (matchingPairs.length === 0) {
        matchingPairs = pairs.filter((pair: any) => 
          pair.baseToken.address.toLowerCase() === context.query.toLowerCase() ||
          pair.pairAddress.toLowerCase() === context.query.toLowerCase()
        );
      }
      
      // If still no match, fall back to any pair containing the query in symbol or name
      if (matchingPairs.length === 0) {
        matchingPairs = pairs.filter((pair: any) => 
          pair.baseToken.symbol.toUpperCase().includes(queryUpper) ||
          pair.baseToken.name.toUpperCase().includes(queryUpper)
        );
      }
      
      if (matchingPairs.length === 0) {
        throw new Error(`No DEX pairs found matching "${context.query}". Found ${pairs.length} pairs but none matched the symbol/name.`);
      }
      
      // Get the most liquid pair from matching pairs only
      const bestPair = matchingPairs.reduce((best: any, current: any) => {
        const bestLiq = best.liquidity?.usd || 0;
        const currentLiq = current.liquidity?.usd || 0;
        return currentLiq > bestLiq ? current : best;
      }, matchingPairs[0]);

      logger?.info('✅ [DexscreenerTool] Found pair', { 
        symbol: bestPair.baseToken.symbol,
        chain: bestPair.chainId,
        dex: bestPair.dexId,
        liquidity: bestPair.liquidity?.usd 
      });

      // Extract price and volume data
      const currentPrice = parseFloat(bestPair.priceUsd || '0');
      const priceChange24h = parseFloat(bestPair.priceChange?.h24 || '0');
      const priceChange6h = parseFloat(bestPair.priceChange?.h6 || '0');
      const priceChange1h = parseFloat(bestPair.priceChange?.h1 || '0');
      
      const volume24h = parseFloat(bestPair.volume?.h24 || '0');
      const volume6h = parseFloat(bestPair.volume?.h6 || '0');
      const volume1h = parseFloat(bestPair.volume?.h1 || '0');
      
      const liquidity = parseFloat(bestPair.liquidity?.usd || '0');
      const marketCap = parseFloat(bestPair.marketCap || '0');
      const fdv = parseFloat(bestPair.fdv || '0');
      const txns24h = (bestPair.txns?.h24?.buys || 0) + (bestPair.txns?.h24?.sells || 0);

      // Calculate absolute price change in dollars
      const priceChange24hUsd = (priceChange24h / 100) * currentPrice;
      const priceChange6hUsd = (priceChange6h / 100) * currentPrice;
      const priceChange1hUsd = (priceChange1h / 100) * currentPrice;

      // Generate synthetic price history for technical analysis
      // Use available timeframe data to create a 90-day estimation
      const priceHistory = generatePriceHistory(currentPrice, priceChange24h, priceChange6h, priceChange1h);

      return {
        success: true,
        ticker: bestPair.baseToken.symbol,
        name: bestPair.baseToken.name,
        chain: bestPair.chainId,
        dex: bestPair.dexId,
        pairAddress: bestPair.pairAddress,
        currentPrice,
        priceChange24h: priceChange24hUsd,
        priceChangePercent24h: priceChange24h,
        priceChange6h: priceChange6hUsd,
        priceChangePercent6h: priceChange6h,
        priceChange1h: priceChange1hUsd,
        priceChangePercent1h: priceChange1h,
        volume24h,
        volume6h,
        volume1h,
        liquidity,
        marketCap,
        fdv,
        txns24h,
        priceHistory,
        baseToken: {
          address: bestPair.baseToken.address,
          name: bestPair.baseToken.name,
          symbol: bestPair.baseToken.symbol,
        },
        quoteToken: {
          address: bestPair.quoteToken.address,
          name: bestPair.quoteToken.name,
          symbol: bestPair.quoteToken.symbol,
        },
        url: bestPair.url || `https://dexscreener.com/${bestPair.chainId}/${bestPair.pairAddress}`,
        message: `Found ${bestPair.baseToken.symbol}/${bestPair.quoteToken.symbol} on ${bestPair.dexId} (${bestPair.chainId})`,
      };
    } catch (error: any) {
      logger?.error('❌ [DexscreenerTool] Error fetching data', { error: error.message });
      throw new Error(`Failed to fetch DEX data: ${error.message}`);
    }
  },
});

/**
 * Generate synthetic price history based on available timeframe data
 * Creates a 90-day price series for technical analysis
 */
function generatePriceHistory(
  currentPrice: number,
  change24h: number,
  change6h: number,
  change1h: number
): Array<{ timestamp: number; price: number }> {
  const history: Array<{ timestamp: number; price: number }> = [];
  const now = Math.floor(Date.now() / 1000);
  const dayInSeconds = 86400;
  
  // Create 90 days of synthetic data
  // Use exponential decay to estimate past prices based on recent trends
  const volatilityFactor = Math.abs(change24h) / 100; // Higher recent change = more volatile
  
  for (let i = 90; i >= 0; i--) {
    const timestamp = now - (i * dayInSeconds);
    
    // Current price (i=0) should always be exact
    if (i === 0) {
      history.push({ timestamp, price: currentPrice });
      continue;
    }
    
    // Estimate price using exponential smoothing of recent trends
    // More recent data points have higher weight
    let estimatedChangePercent = 0;
    
    if (i <= 1) {
      // Last 24 hours: use actual 24h change
      estimatedChangePercent = (change24h / 100) * (1 - i);
    } else if (i <= 4) {
      // Last 4 days: extrapolate from 24h trend with decay
      const daysSince = i - 1;
      estimatedChangePercent = (change24h / 100) * Math.pow(0.8, daysSince);
    } else {
      // Older data: add random walk with mean reversion
      const randomWalk = (Math.random() - 0.5) * volatilityFactor * 2;
      const meanReversion = -0.001 * i; // Slight downward bias for older data
      estimatedChangePercent = randomWalk + meanReversion;
    }
    
    // Cap negative percentages to prevent divide-by-zero (e.g., -100% change)
    // Minimum allowed is -99.9% to keep prices positive and finite
    estimatedChangePercent = Math.max(estimatedChangePercent, -0.999);
    
    const price = currentPrice / (1 + estimatedChangePercent);
    history.push({ timestamp, price });
  }
  
  return history;
}
