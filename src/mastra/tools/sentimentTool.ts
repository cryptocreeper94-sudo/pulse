import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";
import { checkSubscriptionLimit } from "../middleware/subscriptionCheck.js";

/**
 * Sentiment Tool - Analyzes social sentiment and community activity
 * Uses CoinGecko's free community data: Twitter, Reddit, GitHub activity
 * Calculates sentiment scores from social engagement metrics
 */

// In-memory cache with 5-minute TTL (sentiment changes faster than price)
const sentimentCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const sentimentTool = createTool({
  id: "sentiment-tool",
  description: "Analyzes social sentiment and community activity for crypto assets. Returns Twitter followers, Reddit subscribers, GitHub activity, developer engagement, and calculated sentiment score (0-100). Higher scores indicate stronger community bullishness.",

  inputSchema: z.object({
    ticker: z.string().describe("Cryptocurrency ticker symbol (e.g., BTC, ETH, SOL)"),
  }),

  outputSchema: z.object({
    ticker: z.string(),
    sentimentScore: z.number().describe("Overall sentiment score 0-100 (higher = more bullish)"),
    sentimentLevel: z.enum(["🔴 Bearish", "🟡 Neutral", "🟢 Bullish", "🚀 Very Bullish"]),
    socialMetrics: z.object({
      twitterFollowers: z.number().optional(),
      redditSubscribers: z.number().optional(),
      telegramUsers: z.number().optional(),
      githubStars: z.number().optional(),
    }),
    communityActivity: z.object({
      reddit48hComments: z.number().optional(),
      reddit48hPosts: z.number().optional(),
      githubCommits4w: z.number().optional(),
      developerScore: z.number().optional(),
    }),
    marketSentiment: z.object({
      marketCapRank: z.number().optional(),
      volumeChangePercent: z.number().optional(),
      priceChangePercent24h: z.number().optional(),
    }),
    analysis: z.string().describe("Human-readable sentiment analysis"),
  }),

  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [SentimentTool] Starting execution', { ticker: context.ticker });

    // Extract userId from runtimeContext
    const userId = (runtimeContext as any)?.resourceId || 'unknown';
    
    // Check subscription limit
    const limitCheck = await checkSubscriptionLimit(userId, 'search');
    logger?.info('🔐 [SentimentTool] Subscription check result', { userId, allowed: limitCheck.allowed });
    
    if (!limitCheck.allowed) {
      logger?.warn('⚠️ [SentimentTool] Usage limit exceeded', { userId, message: limitCheck.message });
      throw new Error(limitCheck.message || 'Daily search limit reached. Upgrade to Premium for unlimited access!');
    }

    const ticker = context.ticker.toUpperCase();

    // Check cache first
    const cacheKey = `sentiment-${ticker}`;
    const cached = sentimentCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      logger?.info('📦 [SentimentTool] Returning cached data', { ticker, cacheAge: Date.now() - cached.timestamp });
      return cached.data;
    }

    // CoinGecko ID mapping (same as marketDataTool)
    const COINGECKO_MAP: Record<string, string> = {
      'BTC': 'bitcoin', 'ETH': 'ethereum', 'USDT': 'tether', 'BNB': 'binancecoin',
      'SOL': 'solana', 'USDC': 'usd-coin', 'XRP': 'ripple', 'ADA': 'cardano',
      'DOGE': 'dogecoin', 'TRX': 'tron', 'LINK': 'chainlink', 'AVAX': 'avalanche-2',
      'SHIB': 'shiba-inu', 'DOT': 'polkadot', 'MATIC': 'matic-network', 'UNI': 'uniswap',
      'NEAR': 'near', 'PEPE': 'pepe', 'APT': 'aptos', 'ARB': 'arbitrum', 'OP': 'optimism',
      'SUI': 'sui', 'ATOM': 'cosmos', 'FIL': 'filecoin', 'LTC': 'litecoin', 'BCH': 'bitcoin-cash',
      'XLM': 'stellar', 'ALGO': 'algorand', 'ICP': 'internet-computer', 'WIF': 'dogwifcoin',
    };

    const coinId = COINGECKO_MAP[ticker] || ticker.toLowerCase();

    try {
      logger?.info('📊 [SentimentTool] Fetching CoinGecko data', { ticker, coinId });

      // Fetch coin data with community metrics
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: true,
          developer_data: true,
        },
        timeout: 10000,
      });

      const data = response.data;
      
      // Extract social metrics
      const socialMetrics = {
        twitterFollowers: data.community_data?.twitter_followers || 0,
        redditSubscribers: data.community_data?.reddit_subscribers || 0,
        telegramUsers: data.community_data?.telegram_channel_user_count || 0,
        githubStars: data.developer_data?.stars || 0,
      };

      // Extract community activity
      const communityActivity = {
        reddit48hComments: data.community_data?.reddit_average_comments_48h || 0,
        reddit48hPosts: data.community_data?.reddit_average_posts_48h || 0,
        githubCommits4w: data.developer_data?.commit_count_4_weeks || 0,
        developerScore: data.developer_score || 0,
      };

      // Extract market sentiment indicators
      const marketSentiment = {
        marketCapRank: data.market_cap_rank || 9999,
        volumeChangePercent: data.market_data?.volume_change_24h || 0,
        priceChangePercent24h: data.market_data?.price_change_percentage_24h || 0,
      };

      // Calculate composite sentiment score (0-100)
      const sentimentScore = calculateSentimentScore(
        socialMetrics,
        communityActivity,
        marketSentiment
      );

      // Determine sentiment level
      const sentimentLevel = 
        sentimentScore >= 75 ? "🚀 Very Bullish" :
        sentimentScore >= 50 ? "🟢 Bullish" :
        sentimentScore >= 30 ? "🟡 Neutral" :
        "🔴 Bearish";

      // Generate analysis text
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
        analysis,
      };

      // Cache the result
      sentimentCache.set(cacheKey, { data: result, timestamp: Date.now() });
      logger?.info('✅ [SentimentTool] Sentiment analysis complete', { ticker, sentimentScore, sentimentLevel });

      return result;

    } catch (error: any) {
      logger?.error('❌ [SentimentTool] Failed to fetch sentiment data', { 
        ticker, 
        error: error.message 
      });
      
      // Return neutral sentiment on error
      return {
        ticker,
        sentimentScore: 50,
        sentimentLevel: "🟡 Neutral" as const,
        socialMetrics: {},
        communityActivity: {},
        marketSentiment: {},
        analysis: `Unable to fetch sentiment data for ${ticker}. The community metrics may not be available for this asset.`,
      };
    }
  },
});

/**
 * Calculate composite sentiment score from multiple data points
 * Score ranges from 0-100 (higher = more bullish)
 */
function calculateSentimentScore(
  social: any,
  activity: any,
  market: any
): number {
  let score = 0;
  let weights = 0;

  // Social following strength (0-25 points)
  if (social.twitterFollowers > 0 || social.redditSubscribers > 0) {
    const socialScore = Math.min(25, 
      (social.twitterFollowers / 100000) * 10 + // Max 10 points for 1M+ followers
      (social.redditSubscribers / 50000) * 10 +  // Max 10 points for 500K+ subscribers
      (social.telegramUsers / 50000) * 5         // Max 5 points for 500K+ users
    );
    score += socialScore;
    weights += 25;
  }

  // Community engagement (0-25 points)
  if (activity.reddit48hComments > 0 || activity.reddit48hPosts > 0) {
    const engagementScore = Math.min(25,
      (activity.reddit48hComments / 100) * 15 +  // Max 15 points for 1000+ comments
      (activity.reddit48hPosts / 50) * 10        // Max 10 points for 500+ posts
    );
    score += engagementScore;
    weights += 25;
  }

  // Developer activity (0-20 points)
  if (activity.githubCommits4w > 0 || activity.developerScore > 0) {
    const devScore = Math.min(20,
      (activity.githubCommits4w / 10) * 10 +     // Max 10 points for 100+ commits
      (activity.developerScore / 10) * 10        // Max 10 points for 100+ dev score
    );
    score += devScore;
    weights += 20;
  }

  // Market sentiment (0-30 points)
  if (market.priceChangePercent24h !== undefined) {
    const priceScore = Math.min(30, Math.max(0,
      (market.priceChangePercent24h + 10) * 1.5  // -10% = 0 points, +10% = 30 points
    ));
    score += priceScore;
    weights += 30;
  }

  // Normalize to 0-100 scale
  return weights > 0 ? (score / weights) * 100 : 50;
}

/**
 * Generate human-readable sentiment analysis
 */
function generateAnalysis(
  ticker: string,
  score: number,
  level: string,
  social: any,
  activity: any,
  market: any
): string {
  const parts: string[] = [];

  // Overall sentiment
  parts.push(`${ticker} sentiment: ${level} (${Math.round(score)}/100)`);

  // Social presence
  if (social.twitterFollowers || social.redditSubscribers) {
    const socialDesc = [];
    if (social.twitterFollowers) socialDesc.push(`${formatNumber(social.twitterFollowers)} Twitter followers`);
    if (social.redditSubscribers) socialDesc.push(`${formatNumber(social.redditSubscribers)} Reddit subscribers`);
    parts.push(`Social: ${socialDesc.join(', ')}`);
  }

  // Community engagement
  if (activity.reddit48hComments || activity.reddit48hPosts) {
    parts.push(`Reddit 48h: ${activity.reddit48hComments || 0} comments, ${activity.reddit48hPosts || 0} posts`);
  }

  // Developer activity
  if (activity.githubCommits4w) {
    parts.push(`Dev activity: ${activity.githubCommits4w} GitHub commits (4 weeks)`);
  }

  // Market performance
  if (market.priceChangePercent24h !== undefined) {
    const priceEmoji = market.priceChangePercent24h > 0 ? "📈" : "📉";
    parts.push(`${priceEmoji} 24h price: ${market.priceChangePercent24h.toFixed(2)}%`);
  }

  // Interpretation
  if (score >= 75) {
    parts.push("Community is highly engaged and bullish. Strong social momentum.");
  } else if (score >= 50) {
    parts.push("Positive community sentiment with healthy engagement.");
  } else if (score >= 30) {
    parts.push("Neutral sentiment. Community activity is moderate.");
  } else {
    parts.push("Weak community engagement. Social metrics are below average.");
  }

  return parts.join(' | ');
}

/**
 * Format numbers with K/M/B suffixes
 */
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
