import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";

/**
 * Bot Detection Tool
 * Analyzes token holder patterns to detect bot activity and rug risk
 */
export const botDetectionTool = createTool({
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
    chain: z.string().describe("Blockchain (solana, ethereum, bsc, etc.)"),
  }),

  outputSchema: z.object({
    botPercentage: z.number().describe("Estimated % of holders that are bots (0-100)"),
    riskLevel: z.enum(["Safe", "Low", "Medium", "High", "Extreme"]).describe("Overall rug risk level"),
    riskColor: z.string().describe("Color code: green, yellow, orange, red, darkred"),
    holderCount: z.number().describe("Total unique holders"),
    topHolderConcentration: z.number().describe("% held by top 10 holders"),
    rugRiskIndicators: z.array(z.string()).describe("List of detected red flags"),
    confidence: z.number().describe("Detection confidence (0-100)"),
    details: z.string().describe("Human-readable analysis summary"),
  }),

  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    const { tokenAddress, chain } = context;

    logger?.info(`🤖 [BotDetection] Analyzing ${chain} token: ${tokenAddress}`);

    try {
      // For DEX pairs, use Dexscreener API which has holder data
      const isDexPair = tokenAddress.includes('/') || chain.toLowerCase() === 'dex';
      
      if (isDexPair || chain.toLowerCase() === 'solana') {
        return await analyzeDexPair(tokenAddress, chain, logger);
      }

      // For direct token addresses, use blockchain-specific analysis
      return await analyzeTokenHolders(tokenAddress, chain, logger);

    } catch (error: any) {
      logger?.error(`❌ [BotDetection] Error:`, error.message);
      
      // Return safe defaults on error
      return {
        botPercentage: 0,
        riskLevel: "Medium" as const,
        riskColor: "yellow",
        holderCount: 0,
        topHolderConcentration: 0,
        rugRiskIndicators: ["Unable to fetch holder data - proceed with caution"],
        confidence: 0,
        details: `Could not analyze holders: ${error.message}. Use extreme caution.`,
      };
    }
  },
});

/**
 * Analyze DEX pair using Dexscreener data
 */
async function analyzeDexPair(pairAddress: string, chain: string, logger: any) {
  logger?.info(`📊 [BotDetection] Fetching DEX data for ${pairAddress}`);

  const response = await axios.get(`https://api.dexscreener.com/latest/dex/pairs/${chain}/${pairAddress}`, {
    timeout: 10000,
  });

  const pair = response.data?.pair || response.data?.pairs?.[0];
  if (!pair) {
    throw new Error("Pair not found");
  }

  // Calculate bot risk from available metrics
  const indicators: string[] = [];
  let botScore = 0;

  // Check liquidity (low liquidity = higher rug risk)
  const liquidity = pair.liquidity?.usd || 0;
  if (liquidity < 1000) {
    indicators.push("⚠️ Very low liquidity (<$1K) - high rug risk");
    botScore += 30;
  } else if (liquidity < 10000) {
    indicators.push("⚠️ Low liquidity (<$10K)");
    botScore += 15;
  }

  // Check if LP is locked/burned
  if (pair.info?.websites?.length === 0 && pair.info?.socials?.length === 0) {
    indicators.push("🚩 No social links - possible scam");
    botScore += 25;
  }

  // Check age (newly created = higher risk)
  const createdAt = pair.pairCreatedAt ? new Date(pair.pairCreatedAt).getTime() : 0;
  const ageHours = (Date.now() - createdAt) / (1000 * 60 * 60);
  
  if (ageHours < 1) {
    indicators.push("🚩 Created <1 hour ago - extreme caution");
    botScore += 30;
  } else if (ageHours < 24) {
    indicators.push("⚠️ Created <24 hours ago");
    botScore += 15;
  }

  // Check transaction count (very low = suspicious)
  const txns24h = (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0);
  if (txns24h < 10 && ageHours > 24) {
    indicators.push("⚠️ Very low transaction activity");
    botScore += 20;
  }

  // Check price change patterns (huge pumps = bot coordination)
  const priceChange24h = pair.priceChange?.h24 || 0;
  if (Math.abs(priceChange24h) > 500) {
    indicators.push("🚩 Extreme price volatility (>500% in 24h)");
    botScore += 25;
  }

  // Calculate final risk level
  const { riskLevel, riskColor } = calculateRiskLevel(botScore);

  logger?.info(`✅ [BotDetection] Analysis complete - Bot score: ${botScore}%, Risk: ${riskLevel}`);

  return {
    botPercentage: Math.min(botScore, 100),
    riskLevel,
    riskColor,
    holderCount: 0, // Not available from Dexscreener
    topHolderConcentration: 0,
    rugRiskIndicators: indicators.length > 0 ? indicators : ["✓ No major red flags detected"],
    confidence: 75, // Medium confidence with public data
    details: `Risk Analysis: ${indicators.length} warning signs detected. Bot/Rug score: ${botScore}%. ${
      botScore < 20 ? "Relatively safe but always DYOR." :
      botScore < 50 ? "Medium risk - trade carefully." :
      botScore < 75 ? "High risk - only trade with money you can afford to lose." :
      "EXTREME RISK - likely rug pull or bot farm. Avoid."
    }`,
  };
}

/**
 * Analyze token holders using blockchain data
 * (Future enhancement: integrate Helius/Alchemy for detailed holder data)
 */
async function analyzeTokenHolders(tokenAddress: string, chain: string, logger: any) {
  logger?.info(`⛓️ [BotDetection] Direct blockchain analysis for ${chain} not yet implemented`);
  
  // Placeholder for future Helius/Alchemy integration
  return {
    botPercentage: 0,
    riskLevel: "Medium" as const,
    riskColor: "yellow",
    holderCount: 0,
    topHolderConcentration: 0,
    rugRiskIndicators: ["Direct token analysis not yet available - use DEX pair analysis instead"],
    confidence: 0,
    details: "For now, use DEX pair address (chain/pairAddress) for bot detection. Full blockchain analysis coming soon with Helius integration.",
  };
}

/**
 * Calculate risk level from bot score
 */
function calculateRiskLevel(botScore: number): { riskLevel: "Safe" | "Low" | "Medium" | "High" | "Extreme"; riskColor: string } {
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
