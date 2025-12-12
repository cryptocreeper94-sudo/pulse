import { demoTradeService, DemoPortfolio } from '../../services/demoTradeService';
import { telegramNotificationService } from '../../services/telegramNotificationService';
import { referralService } from '../../services/referralService';
import axios from 'axios';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover'
});

const PRICE_IDS = {
  base: process.env.BASE_PRICE_ID || process.env.STRIPE_BASE_MONTHLY_PRICE,
  annual: process.env.ANNUAL_SUBSCRIPTION_PRICE_ID || process.env.STRIPE_ANNUAL_PRICE,
  legacyFounder: process.env.LEGACY_FOUNDER_6MONTH_PRICE_ID || process.env.STRIPE_LEGACY_FOUNDER_PRICE,
};

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
  {
    path: "/api/demo/capture-lead",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { email, telegram } = body;
        
        if (!email && !telegram) {
          return c.json({ success: false, error: 'Email or Telegram required' }, 400);
        }
        
        logger?.info('📧 [Demo] Lead captured', { 
          email: email ? email.substring(0, 3) + '***' : null, 
          telegram: telegram || null,
          timestamp: new Date().toISOString()
        });
        
        return c.json({ 
          success: true, 
          message: 'Successfully registered for early access' 
        });
      } catch (error: any) {
        logger?.error('❌ [Demo] Lead capture error', { error: error.message });
        return c.json({ success: false, error: 'Failed to register' }, 500);
      }
    }
  },
  {
    path: "/api/demo/checkout",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { planId, email, sessionId } = body;
        
        if (!planId) {
          return c.json({ success: false, error: 'Plan ID required' }, 400);
        }
        
        let priceId: string | undefined;
        let planType: string;
        
        let isOneTime = false;
        
        if (planId === 'rm_monthly') {
          priceId = PRICE_IDS.base;
          planType = 'base';
        } else if (planId === 'rm_annual') {
          priceId = PRICE_IDS.annual;
          planType = 'annual';
        } else if (planId === 'legacy_founder') {
          priceId = PRICE_IDS.legacyFounder;
          planType = 'legacy_founder';
          isOneTime = true;
        } else {
          return c.json({ success: false, error: 'Invalid plan' }, 400);
        }
        
        if (!priceId) {
          logger?.error('❌ [Demo Checkout] Price ID not configured', { planId });
          return c.json({ success: false, error: 'Payment configuration missing' }, 500);
        }
        
        const baseUrl = process.env.REPLIT_DEV_DOMAIN 
          ? 'https://' + process.env.REPLIT_DEV_DOMAIN 
          : 'http://localhost:5000';
        
        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
          payment_method_types: ['card'],
          mode: isOneTime ? 'payment' : 'subscription',
          line_items: [{
            price: priceId,
            quantity: 1
          }],
          success_url: `${baseUrl}/app?tab=settings&payment=success&plan=${planType}&source=demo`,
          cancel_url: `${baseUrl}/demo?payment=cancelled`,
          metadata: {
            planType,
            demoSessionId: sessionId || 'unknown',
            source: 'strikeagent_demo'
          }
        };
        
        if (!isOneTime) {
          sessionConfig.subscription_data = {
            trial_period_days: 3
          };
        }
        
        if (email) {
          sessionConfig.customer_email = email;
        }
        
        const session = await stripe.checkout.sessions.create(sessionConfig);
        
        logger?.info('✅ [Demo Checkout] Session created', { 
          sessionId: session.id, 
          planType,
          hasEmail: !!email
        });
        
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [Demo Checkout] Error', { error: error.message });
        
        if (error.message?.includes('No such price')) {
          return c.json({ 
            success: false, 
            error: 'Payment configuration incomplete. Please contact support.' 
          }, 500);
        }
        
        return c.json({ success: false, error: 'Checkout failed. Please try again.' }, 500);
      }
    }
  },
  {
    path: "/api/demo/telegram/register",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { chatId, sessionId, userName } = body;
        
        if (!chatId) {
          return c.json({ success: false, error: 'Chat ID required' }, 400);
        }
        
        await telegramNotificationService.sendWelcomeMessage(chatId, userName);
        
        logger?.info('📱 [Telegram] User registered', { chatId, sessionId });
        return c.json({ success: true, message: 'Telegram notifications enabled' });
      } catch (error: any) {
        logger?.error('❌ [Telegram] Registration error', { error: error.message });
        return c.json({ success: false, error: 'Failed to register Telegram' }, 500);
      }
    }
  },
  {
    path: "/api/demo/telegram/test",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { chatId } = body;
        
        if (!chatId) {
          return c.json({ success: false, error: 'Chat ID required' }, 400);
        }
        
        const testToken = {
          symbol: 'TEST',
          name: 'Test Token',
          price: 0.001234,
          priceChange24h: 42.5,
          volume24h: 150000,
          safetyScore: 'B',
          chain: 'Solana'
        };
        
        await telegramNotificationService.sendHotTokenAlert(chatId, testToken);
        
        logger?.info('📱 [Telegram] Test notification sent', { chatId });
        return c.json({ success: true, message: 'Test notification sent' });
      } catch (error: any) {
        logger?.error('❌ [Telegram] Test error', { error: error.message });
        return c.json({ success: false, error: 'Failed to send test' }, 500);
      }
    }
  },
  {
    path: "/api/user/referral-code",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        
        if (!userId) {
          return c.json({ success: false, error: 'User ID required' }, 400);
        }
        
        const code = await referralService.getUserReferralCode(userId);
        
        logger?.info('🎁 [Referral] Code retrieved', { userId });
        return c.json({ success: true, referralCode: code });
      } catch (error: any) {
        logger?.error('❌ [Referral] Code error', { error: error.message });
        return c.json({ success: false, error: 'Failed to get referral code' }, 500);
      }
    }
  },
  {
    path: "/api/user/referral/apply",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const { referralCode, userId } = body;
        
        if (!referralCode || !userId) {
          return c.json({ success: false, error: 'Referral code and user ID required' }, 400);
        }
        
        const result = await referralService.trackReferral(referralCode, userId);
        
        if (!result.success) {
          logger?.warn('⚠️ [Referral] Apply failed', { referralCode, error: result.error });
          return c.json({ success: false, error: result.error }, 400);
        }
        
        logger?.info('🎁 [Referral] Code applied', { referralCode, userId });
        return c.json({ success: true, message: 'Referral code applied successfully' });
      } catch (error: any) {
        logger?.error('❌ [Referral] Apply error', { error: error.message });
        return c.json({ success: false, error: 'Failed to apply referral code' }, 500);
      }
    }
  },
  {
    path: "/api/user/referral/stats",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        
        if (!userId) {
          return c.json({ success: false, error: 'User ID required' }, 400);
        }
        
        const stats = await referralService.getReferralStats(userId);
        
        logger?.info('🎁 [Referral] Stats retrieved', { userId, stats: stats.completedReferrals });
        return c.json({ success: true, stats });
      } catch (error: any) {
        logger?.error('❌ [Referral] Stats error', { error: error.message });
        return c.json({ success: false, error: 'Failed to get referral stats' }, 500);
      }
    }
  },
];
