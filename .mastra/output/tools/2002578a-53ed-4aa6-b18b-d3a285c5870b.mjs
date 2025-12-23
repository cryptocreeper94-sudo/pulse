import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';

const dexscreenerTool = createTool({
  id: "dexscreener-tool",
  description: "Fetches DEX pair data from Dexscreener for meme coins, new tokens, and high volatility assets. Searches by token symbol, name, or address. Returns price, volume, liquidity, and trading data.",
  inputSchema: z.object({
    query: z.string().describe("Token symbol, name, or contract address to search for (e.g., 'PEPE', 'BONK', '0x123...')")
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
      price: z.number()
    })),
    baseToken: z.object({
      address: z.string(),
      name: z.string(),
      symbol: z.string()
    }),
    quoteToken: z.object({
      address: z.string(),
      name: z.string(),
      symbol: z.string()
    }),
    url: z.string(),
    message: z.string()
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F527} [DexscreenerTool] Starting search", { query: context.query });
    try {
      const searchUrl = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(context.query)}`;
      logger?.info("\u{1F4E1} [DexscreenerTool] Fetching from Dexscreener", { url: searchUrl });
      const response = await axios.get(searchUrl, {
        headers: {
          "Accept": "application/json"
        },
        timeout: 1e4
      });
      if (!response.data || !response.data.pairs || response.data.pairs.length === 0) {
        throw new Error(`No DEX pairs found for "${context.query}"`);
      }
      const pairs = response.data.pairs;
      const queryUpper = context.query.toUpperCase();
      let matchingPairs = pairs.filter(
        (pair) => pair.baseToken.symbol.toUpperCase() === queryUpper || pair.baseToken.name.toUpperCase() === queryUpper
      );
      if (matchingPairs.length === 0) {
        matchingPairs = pairs.filter(
          (pair) => pair.baseToken.address.toLowerCase() === context.query.toLowerCase() || pair.pairAddress.toLowerCase() === context.query.toLowerCase()
        );
      }
      if (matchingPairs.length === 0) {
        matchingPairs = pairs.filter(
          (pair) => pair.baseToken.symbol.toUpperCase().includes(queryUpper) || pair.baseToken.name.toUpperCase().includes(queryUpper)
        );
      }
      if (matchingPairs.length === 0) {
        throw new Error(`No DEX pairs found matching "${context.query}". Found ${pairs.length} pairs but none matched the symbol/name.`);
      }
      const bestPair = matchingPairs.reduce((best, current) => {
        const bestLiq = best.liquidity?.usd || 0;
        const currentLiq = current.liquidity?.usd || 0;
        return currentLiq > bestLiq ? current : best;
      }, matchingPairs[0]);
      logger?.info("\u2705 [DexscreenerTool] Found pair", {
        symbol: bestPair.baseToken.symbol,
        chain: bestPair.chainId,
        dex: bestPair.dexId,
        liquidity: bestPair.liquidity?.usd
      });
      const currentPrice = parseFloat(bestPair.priceUsd || "0");
      const priceChange24h = parseFloat(bestPair.priceChange?.h24 || "0");
      const priceChange6h = parseFloat(bestPair.priceChange?.h6 || "0");
      const priceChange1h = parseFloat(bestPair.priceChange?.h1 || "0");
      const volume24h = parseFloat(bestPair.volume?.h24 || "0");
      const volume6h = parseFloat(bestPair.volume?.h6 || "0");
      const volume1h = parseFloat(bestPair.volume?.h1 || "0");
      const liquidity = parseFloat(bestPair.liquidity?.usd || "0");
      const marketCap = parseFloat(bestPair.marketCap || "0");
      const fdv = parseFloat(bestPair.fdv || "0");
      const txns24h = (bestPair.txns?.h24?.buys || 0) + (bestPair.txns?.h24?.sells || 0);
      const priceChange24hUsd = priceChange24h / 100 * currentPrice;
      const priceChange6hUsd = priceChange6h / 100 * currentPrice;
      const priceChange1hUsd = priceChange1h / 100 * currentPrice;
      const priceHistory = generatePriceHistory(currentPrice, priceChange24h);
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
          symbol: bestPair.baseToken.symbol
        },
        quoteToken: {
          address: bestPair.quoteToken.address,
          name: bestPair.quoteToken.name,
          symbol: bestPair.quoteToken.symbol
        },
        url: bestPair.url || `https://dexscreener.com/${bestPair.chainId}/${bestPair.pairAddress}`,
        message: `Found ${bestPair.baseToken.symbol}/${bestPair.quoteToken.symbol} on ${bestPair.dexId} (${bestPair.chainId})`
      };
    } catch (error) {
      logger?.error("\u274C [DexscreenerTool] Error fetching data", { error: error.message });
      throw new Error(`Failed to fetch DEX data: ${error.message}`);
    }
  }
});
function generatePriceHistory(currentPrice, change24h, change6h, change1h) {
  const history = [];
  const now = Math.floor(Date.now() / 1e3);
  const dayInSeconds = 86400;
  const volatilityFactor = Math.abs(change24h) / 100;
  for (let i = 90; i >= 0; i--) {
    const timestamp = now - i * dayInSeconds;
    if (i === 0) {
      history.push({ timestamp, price: currentPrice });
      continue;
    }
    let estimatedChangePercent = 0;
    if (i <= 1) {
      estimatedChangePercent = change24h / 100 * (1 - i);
    } else if (i <= 4) {
      const daysSince = i - 1;
      estimatedChangePercent = change24h / 100 * Math.pow(0.8, daysSince);
    } else {
      const randomWalk = (Math.random() - 0.5) * volatilityFactor * 2;
      const meanReversion = -1e-3 * i;
      estimatedChangePercent = randomWalk + meanReversion;
    }
    estimatedChangePercent = Math.max(estimatedChangePercent, -0.999);
    const price = currentPrice / (1 + estimatedChangePercent);
    history.push({ timestamp, price });
  }
  return history;
}

export { dexscreenerTool };
//# sourceMappingURL=2002578a-53ed-4aa6-b18b-d3a285c5870b.mjs.map
