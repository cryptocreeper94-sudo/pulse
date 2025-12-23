import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';
import { checkSubscriptionLimit } from '../subscriptionCheck.mjs';

const sentimentCache = /* @__PURE__ */ new Map();
const CACHE_TTL = 5 * 60 * 1e3;
const sentimentTool = createTool({
  id: "sentiment-tool",
  description: "Analyzes social sentiment and community activity for crypto assets. Returns Twitter followers, Reddit subscribers, GitHub activity, developer engagement, and calculated sentiment score (0-100). Higher scores indicate stronger community bullishness.",
  inputSchema: z.object({
    ticker: z.string().describe("Cryptocurrency ticker symbol (e.g., BTC, ETH, SOL)")
  }),
  outputSchema: z.object({
    ticker: z.string(),
    sentimentScore: z.number().describe("Overall sentiment score 0-100 (higher = more bullish)"),
    sentimentLevel: z.enum(["\u{1F534} Bearish", "\u{1F7E1} Neutral", "\u{1F7E2} Bullish", "\u{1F680} Very Bullish"]),
    socialMetrics: z.object({
      twitterFollowers: z.number().optional(),
      redditSubscribers: z.number().optional(),
      telegramUsers: z.number().optional(),
      githubStars: z.number().optional()
    }),
    communityActivity: z.object({
      reddit48hComments: z.number().optional(),
      reddit48hPosts: z.number().optional(),
      githubCommits4w: z.number().optional(),
      developerScore: z.number().optional()
    }),
    marketSentiment: z.object({
      marketCapRank: z.number().optional(),
      volumeChangePercent: z.number().optional(),
      priceChangePercent24h: z.number().optional()
    }),
    analysis: z.string().describe("Human-readable sentiment analysis")
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F527} [SentimentTool] Starting execution", { ticker: context.ticker });
    const userId = runtimeContext?.resourceId || "unknown";
    const limitCheck = await checkSubscriptionLimit(userId);
    logger?.info("\u{1F510} [SentimentTool] Subscription check result", { userId, allowed: limitCheck.allowed });
    if (!limitCheck.allowed) {
      logger?.warn("\u26A0\uFE0F [SentimentTool] Usage limit exceeded", { userId, message: limitCheck.message });
      throw new Error(limitCheck.message || "Daily search limit reached. Upgrade to Premium for unlimited access!");
    }
    const ticker = context.ticker.toUpperCase();
    const cacheKey = `sentiment-${ticker}`;
    const cached = sentimentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      logger?.info("\u{1F4E6} [SentimentTool] Returning cached data", { ticker, cacheAge: Date.now() - cached.timestamp });
      return cached.data;
    }
    const COINGECKO_MAP = {
      "BTC": "bitcoin",
      "ETH": "ethereum",
      "USDT": "tether",
      "BNB": "binancecoin",
      "SOL": "solana",
      "USDC": "usd-coin",
      "XRP": "ripple",
      "ADA": "cardano",
      "DOGE": "dogecoin",
      "TRX": "tron",
      "LINK": "chainlink",
      "AVAX": "avalanche-2",
      "SHIB": "shiba-inu",
      "DOT": "polkadot",
      "MATIC": "matic-network",
      "UNI": "uniswap",
      "NEAR": "near",
      "PEPE": "pepe",
      "APT": "aptos",
      "ARB": "arbitrum",
      "OP": "optimism",
      "SUI": "sui",
      "ATOM": "cosmos",
      "FIL": "filecoin",
      "LTC": "litecoin",
      "BCH": "bitcoin-cash",
      "XLM": "stellar",
      "ALGO": "algorand",
      "ICP": "internet-computer",
      "WIF": "dogwifcoin"
    };
    const coinId = COINGECKO_MAP[ticker] || ticker.toLowerCase();
    try {
      logger?.info("\u{1F4CA} [SentimentTool] Fetching CoinGecko data", { ticker, coinId });
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: true,
          developer_data: true
        },
        timeout: 1e4
      });
      const data = response.data;
      const socialMetrics = {
        twitterFollowers: data.community_data?.twitter_followers || 0,
        redditSubscribers: data.community_data?.reddit_subscribers || 0,
        telegramUsers: data.community_data?.telegram_channel_user_count || 0,
        githubStars: data.developer_data?.stars || 0
      };
      const communityActivity = {
        reddit48hComments: data.community_data?.reddit_average_comments_48h || 0,
        reddit48hPosts: data.community_data?.reddit_average_posts_48h || 0,
        githubCommits4w: data.developer_data?.commit_count_4_weeks || 0,
        developerScore: data.developer_score || 0
      };
      const marketSentiment = {
        marketCapRank: data.market_cap_rank || 9999,
        volumeChangePercent: data.market_data?.volume_change_24h || 0,
        priceChangePercent24h: data.market_data?.price_change_percentage_24h || 0
      };
      const sentimentScore = calculateSentimentScore(
        socialMetrics,
        communityActivity,
        marketSentiment
      );
      const sentimentLevel = sentimentScore >= 75 ? "\u{1F680} Very Bullish" : sentimentScore >= 50 ? "\u{1F7E2} Bullish" : sentimentScore >= 30 ? "\u{1F7E1} Neutral" : "\u{1F534} Bearish";
      const analysis = generateAnalysis(
        ticker,
        sentimentScore,
        sentimentLevel,
        socialMetrics,
        communityActivity,
        marketSentiment
      );
      const result = {
        ticker,
        sentimentScore: Math.round(sentimentScore),
        sentimentLevel,
        socialMetrics,
        communityActivity,
        marketSentiment,
        analysis
      };
      sentimentCache.set(cacheKey, { data: result, timestamp: Date.now() });
      logger?.info("\u2705 [SentimentTool] Sentiment analysis complete", { ticker, sentimentScore, sentimentLevel });
      return result;
    } catch (error) {
      logger?.error("\u274C [SentimentTool] Failed to fetch sentiment data", {
        ticker,
        error: error.message
      });
      return {
        ticker,
        sentimentScore: 50,
        sentimentLevel: "\u{1F7E1} Neutral",
        socialMetrics: {},
        communityActivity: {},
        marketSentiment: {},
        analysis: `Unable to fetch sentiment data for ${ticker}. The community metrics may not be available for this asset.`
      };
    }
  }
});
function calculateSentimentScore(social, activity, market) {
  let score = 0;
  let weights = 0;
  if (social.twitterFollowers > 0 || social.redditSubscribers > 0) {
    const socialScore = Math.min(
      25,
      social.twitterFollowers / 1e5 * 10 + // Max 10 points for 1M+ followers
      social.redditSubscribers / 5e4 * 10 + // Max 10 points for 500K+ subscribers
      social.telegramUsers / 5e4 * 5
      // Max 5 points for 500K+ users
    );
    score += socialScore;
    weights += 25;
  }
  if (activity.reddit48hComments > 0 || activity.reddit48hPosts > 0) {
    const engagementScore = Math.min(
      25,
      activity.reddit48hComments / 100 * 15 + // Max 15 points for 1000+ comments
      activity.reddit48hPosts / 50 * 10
      // Max 10 points for 500+ posts
    );
    score += engagementScore;
    weights += 25;
  }
  if (activity.githubCommits4w > 0 || activity.developerScore > 0) {
    const devScore = Math.min(
      20,
      activity.githubCommits4w / 10 * 10 + // Max 10 points for 100+ commits
      activity.developerScore / 10 * 10
      // Max 10 points for 100+ dev score
    );
    score += devScore;
    weights += 20;
  }
  if (market.priceChangePercent24h !== void 0) {
    const priceScore = Math.min(30, Math.max(
      0,
      (market.priceChangePercent24h + 10) * 1.5
      // -10% = 0 points, +10% = 30 points
    ));
    score += priceScore;
    weights += 30;
  }
  return weights > 0 ? score / weights * 100 : 50;
}
function generateAnalysis(ticker, score, level, social, activity, market) {
  const parts = [];
  parts.push(`${ticker} sentiment: ${level} (${Math.round(score)}/100)`);
  if (social.twitterFollowers || social.redditSubscribers) {
    const socialDesc = [];
    if (social.twitterFollowers) socialDesc.push(`${formatNumber(social.twitterFollowers)} Twitter followers`);
    if (social.redditSubscribers) socialDesc.push(`${formatNumber(social.redditSubscribers)} Reddit subscribers`);
    parts.push(`Social: ${socialDesc.join(", ")}`);
  }
  if (activity.reddit48hComments || activity.reddit48hPosts) {
    parts.push(`Reddit 48h: ${activity.reddit48hComments || 0} comments, ${activity.reddit48hPosts || 0} posts`);
  }
  if (activity.githubCommits4w) {
    parts.push(`Dev activity: ${activity.githubCommits4w} GitHub commits (4 weeks)`);
  }
  if (market.priceChangePercent24h !== void 0) {
    const priceEmoji = market.priceChangePercent24h > 0 ? "\u{1F4C8}" : "\u{1F4C9}";
    parts.push(`${priceEmoji} 24h price: ${market.priceChangePercent24h.toFixed(2)}%`);
  }
  if (score >= 75) {
    parts.push("Community is highly engaged and bullish. Strong social momentum.");
  } else if (score >= 50) {
    parts.push("Positive community sentiment with healthy engagement.");
  } else if (score >= 30) {
    parts.push("Neutral sentiment. Community activity is moderate.");
  } else {
    parts.push("Weak community engagement. Social metrics are below average.");
  }
  return parts.join(" | ");
}
function formatNumber(num) {
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

export { sentimentTool };
//# sourceMappingURL=343187cf-89e7-439e-b4ba-b7d70b6d1f9d.mjs.map
