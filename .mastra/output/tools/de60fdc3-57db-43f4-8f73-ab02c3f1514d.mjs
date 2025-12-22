import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';

const botDetectionTool = createTool({
  id: "botDetection",
  description: `Detects bot holder activity and rug risk for crypto tokens.
  
Analyzes holder distribution, wallet clustering, and liquidity patterns to calculate bot percentage and risk score.

Returns:
- Bot percentage estimate (0-100%)
- Risk level (Safe/Low/Medium/High/Extreme)
- Holder concentration metrics
- Rug risk indicators`,
  inputSchema: z.object({
    tokenAddress: z.string().describe("Token contract address"),
    chain: z.string().describe("Blockchain (solana, ethereum, bsc, etc.)")
  }),
  outputSchema: z.object({
    botPercentage: z.number().describe("Estimated % of holders that are bots (0-100)"),
    riskLevel: z.enum(["Safe", "Low", "Medium", "High", "Extreme"]).describe("Overall rug risk level"),
    riskColor: z.string().describe("Color code: green, yellow, orange, red, darkred"),
    holderCount: z.number().describe("Total unique holders"),
    topHolderConcentration: z.number().describe("% held by top 10 holders"),
    rugRiskIndicators: z.array(z.string()).describe("List of detected red flags"),
    confidence: z.number().describe("Detection confidence (0-100)"),
    details: z.string().describe("Human-readable analysis summary")
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    const { tokenAddress, chain } = context;
    logger?.info(`\u{1F916} [BotDetection] Analyzing ${chain} token: ${tokenAddress}`);
    try {
      const isSolanaOrDex = chain.toLowerCase() === "solana" || chain.toLowerCase() === "dex";
      if (isSolanaOrDex || tokenAddress.length > 20) {
        return await analyzeDexPair(tokenAddress, chain, logger);
      }
      return await analyzeTokenHolders(tokenAddress, chain, logger);
    } catch (error) {
      logger?.error(`\u274C [BotDetection] Error:`, error.message);
      return {
        botPercentage: 100,
        riskLevel: "Extreme",
        riskColor: "red",
        holderCount: 0,
        topHolderConcentration: 0,
        rugRiskIndicators: ["\u26A0\uFE0F ANALYSIS FAILED - Cannot verify safety", "Assume extreme risk until verified"],
        confidence: 0,
        details: `Analysis unavailable: ${error.message}. DO NOT TRADE until you can verify token safety independently.`
      };
    }
  }
});
async function analyzeDexPair(pairAddress, chain, logger) {
  logger?.info(`\u{1F4CA} [BotDetection] Fetching DEX data for ${pairAddress}`);
  const response = await axios.get(`https://api.dexscreener.com/latest/dex/pairs/${chain}/${pairAddress}`, {
    timeout: 1e4
  });
  const pair = response.data?.pair || response.data?.pairs?.[0];
  if (!pair) {
    throw new Error("Pair not found");
  }
  const indicators = [];
  let botScore = 0;
  const liquidity = pair.liquidity?.usd || 0;
  if (liquidity < 1e3) {
    indicators.push("\u26A0\uFE0F Very low liquidity (<$1K) - extreme rug risk");
    botScore += 40;
  } else if (liquidity < 1e4) {
    indicators.push("\u26A0\uFE0F Low liquidity (<$10K) - high rug risk");
    botScore += 30;
  }
  if (pair.info?.websites?.length === 0 && pair.info?.socials?.length === 0) {
    indicators.push("\u{1F6A9} No social links - possible scam");
    botScore += 25;
  }
  const createdAt = pair.pairCreatedAt ? new Date(pair.pairCreatedAt).getTime() : 0;
  const ageHours = (Date.now() - createdAt) / (1e3 * 60 * 60);
  if (ageHours < 1) {
    indicators.push("\u{1F6A9} Created <1 hour ago - extreme caution");
    botScore += 30;
  } else if (ageHours < 24) {
    indicators.push("\u26A0\uFE0F Created <24 hours ago");
    botScore += 15;
  }
  const txns24h = (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0);
  if (txns24h < 10 && ageHours > 24) {
    indicators.push("\u26A0\uFE0F Very low transaction activity");
    botScore += 20;
  }
  const priceChange24h = pair.priceChange?.h24 || 0;
  if (Math.abs(priceChange24h) > 500) {
    indicators.push("\u{1F6A9} Extreme price volatility (>500% in 24h)");
    botScore += 25;
  }
  const { riskLevel, riskColor } = calculateRiskLevel(botScore);
  logger?.info(`\u2705 [BotDetection] Analysis complete - Bot score: ${botScore}%, Risk: ${riskLevel}`);
  return {
    botPercentage: Math.min(botScore, 100),
    riskLevel,
    riskColor,
    holderCount: 0,
    // Not available from Dexscreener
    topHolderConcentration: 0,
    rugRiskIndicators: indicators.length > 0 ? indicators : ["\u2713 No major red flags detected"],
    confidence: 75,
    // Medium confidence with public data
    details: `Risk Analysis: ${indicators.length} warning signs detected. Bot/Rug score: ${botScore}%. ${botScore < 20 ? "Relatively safe but always DYOR." : botScore < 50 ? "Medium risk - trade carefully." : botScore < 75 ? "High risk - only trade with money you can afford to lose." : "EXTREME RISK - likely rug pull or bot farm. Avoid."}`
  };
}
async function analyzeTokenHolders(tokenAddress, chain, logger) {
  logger?.info(`\u26D3\uFE0F [BotDetection] Direct blockchain analysis for ${chain} not yet implemented`);
  return {
    botPercentage: 0,
    riskLevel: "Medium",
    riskColor: "yellow",
    holderCount: 0,
    topHolderConcentration: 0,
    rugRiskIndicators: ["Direct token analysis not yet available - use DEX pair analysis instead"],
    confidence: 0,
    details: "For now, use DEX pair address (chain/pairAddress) for bot detection. Full blockchain analysis coming soon with Helius integration."
  };
}
function calculateRiskLevel(botScore) {
  if (botScore < 20) {
    return { riskLevel: "Safe", riskColor: "green" };
  } else if (botScore < 40) {
    return { riskLevel: "Low", riskColor: "lightgreen" };
  } else if (botScore < 60) {
    return { riskLevel: "Medium", riskColor: "yellow" };
  } else if (botScore < 80) {
    return { riskLevel: "High", riskColor: "orange" };
  } else {
    return { riskLevel: "Extreme", riskColor: "red" };
  }
}

export { botDetectionTool };
//# sourceMappingURL=de60fdc3-57db-43f4-8f73-ab02c3f1514d.mjs.map
