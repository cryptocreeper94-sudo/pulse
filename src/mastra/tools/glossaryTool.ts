import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Glossary Tool - Provides definitions and usage guidance for technical analysis terms
 */

const glossary: Record<string, { definition: string; howToUse: string }> = {
  RSI: {
    definition: "Relative Strength Index - A momentum oscillator that measures the speed and magnitude of price changes on a scale of 0-100.",
    howToUse: "Values below 30 indicate oversold conditions (potential buy opportunity). Values above 70 indicate overbought conditions (potential sell opportunity). Use it to identify when an asset might reverse direction.",
  },
  MACD: {
    definition: "Moving Average Convergence Divergence - A trend-following momentum indicator that shows the relationship between two moving averages.",
    howToUse: "When MACD crosses above the signal line, it's a bullish signal (consider buying). When it crosses below, it's bearish (consider selling). The histogram shows the strength of the trend.",
  },
  EMA: {
    definition: "Exponential Moving Average - A type of moving average that gives more weight to recent prices, making it more responsive to new information.",
    howToUse: "When price is above the EMA, the trend is bullish. When below, it's bearish. EMA crossovers (like EMA 50 crossing EMA 200) signal trend changes. Shorter EMAs (9, 21) react faster to price changes.",
  },
  SMA: {
    definition: "Simple Moving Average - The average price over a specific number of periods, giving equal weight to all data points.",
    howToUse: "Similar to EMA but smoother and slower to react. When price crosses above SMA, it's bullish. Below SMA is bearish. Common periods: 20, 50, 200 days.",
  },
  "BOLLINGER BANDS": {
    definition: "Bollinger Bands - A volatility indicator consisting of a middle band (SMA) and two outer bands that are 2 standard deviations away.",
    howToUse: "When price touches the lower band, the asset may be oversold (buy signal). When it touches the upper band, it may be overbought (sell signal). Narrow bands indicate low volatility; wide bands indicate high volatility.",
  },
  BB: {
    definition: "Bollinger Bands - A volatility indicator consisting of a middle band (SMA) and two outer bands that are 2 standard deviations away.",
    howToUse: "When price touches the lower band, the asset may be oversold (buy signal). When it touches the upper band, it may be overbought (sell signal). Narrow bands indicate low volatility; wide bands indicate high volatility.",
  },
  VOLUME: {
    definition: "Volume - The total number of shares or contracts traded during a specific time period.",
    howToUse: "High volume during price increases confirms the trend is strong. Low volume suggests weak conviction. Volume spikes often precede major price moves.",
  },
  "SUPPORT": {
    definition: "Support Level - A price level where buying pressure is strong enough to prevent the price from falling further.",
    howToUse: "If price approaches support and bounces up, it confirms the support level. Breaking below support often leads to further declines. Use it to set buy orders or stop losses.",
  },
  "RESISTANCE": {
    definition: "Resistance Level - A price level where selling pressure is strong enough to prevent the price from rising further.",
    howToUse: "If price approaches resistance and falls back, it confirms the resistance level. Breaking above resistance often leads to further gains. Use it to set sell orders or take profits.",
  },
  LIQUIDITY: {
    definition: "Liquidity - The ease with which an asset can be bought or sold without causing significant price changes.",
    howToUse: "High liquidity means you can enter/exit positions easily with minimal slippage. Low liquidity increases risk of price manipulation and large spreads. Always check liquidity before trading.",
  },
  "RUG RISK": {
    definition: "Rug Risk - The probability that a token's developers will abandon the project and drain liquidity, causing the price to crash to zero.",
    howToUse: "High rug risk tokens should be avoided or traded with extreme caution. Check: liquidity depth, holder distribution, contract verification, and team transparency. Never invest more than you can lose.",
  },
  SLIPPAGE: {
    definition: "Slippage - The difference between the expected price of a trade and the actual executed price, common in low-liquidity markets.",
    howToUse: "Higher slippage means you get a worse price than expected. Low-liquidity DEX pairs have high slippage. Set slippage tolerance in your trades to avoid unexpected losses.",
  },
  DEX: {
    definition: "DEX (Decentralized Exchange) - A cryptocurrency exchange that operates without a central authority, allowing peer-to-peer trading.",
    howToUse: "DEXs like Uniswap, PancakeSwap offer more tokens but higher risk. Check liquidity and rug risk before trading. DEX pairs often have higher volatility than centralized exchanges.",
  },
  "MARKET CAP": {
    definition: "Market Capitalization - The total value of all circulating tokens/shares, calculated as price × circulating supply.",
    howToUse: "Higher market cap = more established and stable. Lower market cap = higher growth potential but higher risk. Compare market cap to liquidity to assess legitimacy.",
  },
  FDV: {
    definition: "Fully Diluted Valuation - The theoretical market cap if all tokens were in circulation, calculated as price × total supply.",
    howToUse: "If FDV is much higher than market cap, many tokens will be unlocked later (dilution risk). Compare FDV to current market cap to assess future selling pressure.",
  },
  BULLISH: {
    definition: "Bullish - A market sentiment indicating expectation of rising prices. Opposite of bearish.",
    howToUse: "Bullish signals suggest buying or holding. Look for: RSI recovery, MACD crossovers, price above moving averages, increasing volume.",
  },
  BEARISH: {
    definition: "Bearish - A market sentiment indicating expectation of falling prices. Opposite of bullish.",
    howToUse: "Bearish signals suggest selling or staying out. Look for: RSI decline, MACD negative crossovers, price below moving averages, decreasing volume.",
  },
  OVERBOUGHT: {
    definition: "Overbought - A condition where an asset has risen too quickly and may be due for a correction or pullback.",
    howToUse: "RSI above 70 or price above upper Bollinger Band indicates overbought. Consider taking profits or waiting for a pullback before buying.",
  },
  OVERSOLD: {
    definition: "Oversold - A condition where an asset has fallen too quickly and may be due for a bounce or reversal.",
    howToUse: "RSI below 30 or price below lower Bollinger Band indicates oversold. Consider buying at these levels for potential bounce plays.",
  },
  MOMENTUM: {
    definition: "Momentum - The rate of acceleration of price movement. Strong momentum indicates a trend is likely to continue.",
    howToUse: "MACD histogram and RSI measure momentum. Increasing momentum confirms trend strength. Decreasing momentum warns of potential reversal.",
  },
  VOLATILITY: {
    definition: "Volatility - The degree of price fluctuation over time. Higher volatility means larger and faster price swings.",
    howToUse: "High volatility = higher risk and reward. Bollinger Band width measures volatility. DEX pairs typically have much higher volatility than stocks.",
  },
  CROSSOVER: {
    definition: "Crossover - When one indicator line crosses above or below another, signaling a potential trend change.",
    howToUse: "EMA crossovers (fast over slow = bullish) and MACD crossovers (MACD over signal = bullish) are common buy/sell signals.",
  },
};

export const glossaryTool = createTool({
  id: "glossary-tool",
  description: "Provides definitions and usage guidance for technical analysis terms. Use this when user asks about a term like 'RSI', 'MACD', 'EMA', etc. without specifying a ticker.",

  inputSchema: z.object({
    term: z.string().describe("The technical term to look up (e.g., 'RSI', 'MACD', 'EMA')"),
  }),

  outputSchema: z.object({
    term: z.string(),
    definition: z.string(),
    howToUse: z.string(),
    found: z.boolean(),
  }),

  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [GlossaryTool] Looking up term', { term: context.term });

    const normalizedTerm = context.term.toUpperCase().trim();
    const entry = glossary[normalizedTerm];

    if (!entry) {
      logger?.info('❌ [GlossaryTool] Term not found', { term: normalizedTerm });
      return {
        term: context.term,
        definition: "",
        howToUse: "",
        found: false,
      };
    }

    logger?.info('✅ [GlossaryTool] Term found', { term: normalizedTerm });

    return {
      term: context.term,
      definition: entry.definition,
      howToUse: entry.howToUse,
      found: true,
    };
  },
});
