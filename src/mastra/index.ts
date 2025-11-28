import { Mastra } from "@mastra/core";
import { MastraError } from "@mastra/core/error";
import { PinoLogger } from "@mastra/loggers";
import { LogLevel, MastraLogger } from "@mastra/core/logger";
import pino from "pino";
import { MCPServer } from "@mastra/mcp";
import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";
import { NonRetriableError } from "inngest";
import { z } from "zod";
import { desc } from "drizzle-orm";

import { sharedPostgresStorage } from "./storage";
import { inngest, inngestServe } from "./inngest";
import { darkwaveWorkflow } from "./workflows/darkwaveWorkflow";
import { darkwaveAgent } from "./agents/darkwaveAgent";
import { registerTelegramTrigger } from "../triggers/telegramTriggers";

// Import trading tools
import { walletConnectionTool } from "./tools/walletConnectionTool";
import { userSettingsTool } from "./tools/userSettingsTool";
import { balanceCheckerTool } from "./tools/balanceCheckerTool";
import { jupiterLimitOrderTool } from "./tools/jupiterLimitOrderTool";
import { tokenSnipingTool } from "./tools/tokenSnipingTool";

// Import existing tools
import { marketDataTool } from "./tools/marketDataTool";
import { technicalAnalysisTool } from "./tools/technicalAnalysisTool";
import { holdingsTool } from "./tools/holdingsTool";
import { scannerTool } from "./tools/scannerTool";
import { chartGeneratorTool } from "./tools/chartGeneratorTool";
import { dexscreenerTool } from "./tools/dexscreenerTool";
import { dexAnalysisTool } from "./tools/dexAnalysisTool";
import { priceAlertTool } from "./tools/priceAlertTool";
import { nftTool } from "./tools/nftTool";
import { subscriptionTool } from "./tools/subscriptionTool";
import { botDetectionTool } from "./tools/botDetectionTool";
import { sentimentTool } from "./tools/sentimentTool";

class ProductionPinoLogger extends MastraLogger {
  protected logger: pino.Logger;

  constructor(
    options: {
      name?: string;
      level?: LogLevel;
    } = {},
  ) {
    super(options);

    this.logger = pino({
      name: options.name || "app",
      level: options.level || LogLevel.INFO,
      base: {},
      formatters: {
        level: (label: string, _number: number) => ({
          level: label,
        }),
      },
      timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    });
  }

  debug(message: string, args: Record<string, any> = {}): void {
    this.logger.debug(args, message);
  }

  info(message: string, args: Record<string, any> = {}): void {
    this.logger.info(args, message);
  }

  warn(message: string, args: Record<string, any> = {}): void {
    this.logger.warn(args, message);
  }

  error(message: string, args: Record<string, any> = {}): void {
    this.logger.error(args, message);
  }
}

export const mastra = new Mastra({
  storage: sharedPostgresStorage,
  // Register your workflows here
  workflows: { darkwaveWorkflow },
  // Agent enabled with Replit AI Integrations (free OpenAI access, no charges)
  agents: { darkwaveAgent },
  mcpServers: {
    allTools: new MCPServer({
      name: "allTools",
      version: "1.0.0",
      tools: {
        // Wallet & Trading Tools
        'wallet-connection': walletConnectionTool,
        'user-settings': userSettingsTool,
        'balance-checker': balanceCheckerTool,
        'jupiter-limit-order': jupiterLimitOrderTool,
        'token-sniping': tokenSnipingTool,
        
        // Market Analysis Tools
        'market-data-tool': marketDataTool,
        'technical-analysis-tool': technicalAnalysisTool,
        'holdings-tool': holdingsTool,
        'scanner-tool': scannerTool,
        'chart-generator-tool': chartGeneratorTool,
        'dexscreener-tool': dexscreenerTool,
        'dex-analysis-tool': dexAnalysisTool,
        'price-alert-tool': priceAlertTool,
        'nft-tool': nftTool,
        'subscription-tool': subscriptionTool,
        'bot-detection-tool': botDetectionTool,
        'sentiment-tool': sentimentTool,
      },
    }),
  },
  bundler: {
    // A few dependencies are not properly picked up by
    // the bundler if they are not added directly to the
    // entrypoint.
    externals: [
      "@slack/web-api",
      "inngest",
      "inngest/hono",
      "hono",
      "hono/streaming",
    ],
    // sourcemaps are good for debugging.
    sourcemap: true,
  },
  server: {
    host: "0.0.0.0",
    port: 3001,
    middleware: [
      async (c, next) => {
        const mastra = c.get("mastra");
        const logger = mastra?.getLogger();
        logger?.debug("[Request]", { method: c.req.method, url: c.req.url });
        try {
          await next();
        } catch (error) {
          logger?.error("[Response]", {
            method: c.req.method,
            url: c.req.url,
            error,
          });
          if (error instanceof MastraError) {
            if (error.id === "AGENT_MEMORY_MISSING_RESOURCE_ID") {
              // This is typically a non-retirable error. It means that the request was not
              // setup correctly to pass in the necessary parameters.
              throw new NonRetriableError(error.message, { cause: error });
            }
          } else if (error instanceof z.ZodError) {
            // Validation errors are never retriable.
            throw new NonRetriableError(error.message, { cause: error });
          }

          throw error;
        }
      },
    ],
    apiRoutes: [
      // This API route is used to register the Mastra workflow (inngest function) on the inngest server
      {
        path: "/api/inngest",
        method: "ALL",
        createHandler: async ({ mastra }) => inngestServe({ mastra, inngest }),
        // The inngestServe function integrates Mastra workflows with Inngest by:
        // 1. Creating Inngest functions for each workflow with unique IDs (workflow.${workflowId})
        // 2. Setting up event handlers that:
        //    - Generate unique run IDs for each workflow execution
        //    - Create an InngestExecutionEngine to manage step execution
        //    - Handle workflow state persistence and real-time updates
        // 3. Establishing a publish-subscribe system for real-time monitoring
        //    through the workflow:${workflowId}:${runId} channel
      },
      // Register Telegram webhook routes
      ...registerTelegramTrigger({
        triggerType: "telegram/message",
        handler: async (mastra, triggerInfo) => {
          const logger = mastra.getLogger();
          logger?.info("✅ [Telegram] Handler called", { 
            userName: triggerInfo.params.userName,
            message: triggerInfo.params.message.substring(0, 50)
          });
        },
      }),
      // Market Overview API - Unified endpoint for stocks and crypto
      {
        path: "/api/market-overview",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          logger?.info('🔧 [MarketOverviewAPI] Request received');
          
          const assetClass = c.req.query('assetClass') || 'crypto';
          const category = c.req.query('category') || 'top';
          
          logger?.info('📝 [MarketOverviewAPI] Parameters', { assetClass, category });
          
          // Validate parameters
          const validAssetClasses = ['crypto', 'stocks'];
          const validCategories = ['top', 'trending', 'gainers', 'losers', 'new', 'defi', 'nft'];
          
          if (!validAssetClasses.includes(assetClass)) {
            logger?.warn('⚠️ [MarketOverviewAPI] Invalid asset class', { assetClass });
            return c.json({ error: 'Invalid asset class. Must be crypto or stocks' }, 400);
          }
          
          if (!validCategories.includes(category)) {
            logger?.warn('⚠️ [MarketOverviewAPI] Invalid category', { category });
            return c.json({ error: 'Invalid category' }, 400);
          }
          
          try {
            const { fetchStocksOverview, fetchCryptoOverview } = await import('./tools/helpers/marketOverview.js');
            
            let data;
            if (assetClass === 'stocks') {
              data = await fetchStocksOverview(category, logger);
            } else {
              data = await fetchCryptoOverview(category, logger);
            }
            
            logger?.info('✅ [MarketOverviewAPI] Data fetched successfully', { 
              assetClass, 
              category, 
              count: data.length 
            });
            
            return c.json(data);
          } catch (error: any) {
            logger?.error('❌ [MarketOverviewAPI] Error fetching data', { 
              error: error.message,
              assetClass,
              category
            });
            return c.json({ error: 'Failed to fetch market data' }, 500);
          }
        }
      },
      // News endpoint
      {
        path: "/api/news",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          logger?.info('📰 [News] Request received');
          
          const articles = [
            { title: "Bitcoin Surges Past $95K", source: "CoinDesk", url: "https://www.coindesk.com", publishedAt: new Date().toISOString() },
            { title: "Ethereum 2.0 Update Released", source: "CoinTelegraph", url: "https://cointelegraph.com", publishedAt: new Date().toISOString() },
            { title: "Tech Stocks Rally on AI News", source: "Bloomberg", url: "https://www.bloomberg.com", publishedAt: new Date().toISOString() },
            { title: "Fed Holds Rates Steady", source: "CNBC", url: "https://www.cnbc.com", publishedAt: new Date().toISOString() },
            { title: "NFT Market Shows Recovery", source: "Decrypt", url: "https://decrypt.co", publishedAt: new Date().toISOString() },
            { title: "Altcoin Season Approaching", source: "CryptoSlate", url: "https://cryptoslate.com", publishedAt: new Date().toISOString() }
          ];
          
          return c.json({ success: true, articles });
        }
      },
      // Multi-Model Streaming Analysis endpoint
      {
        path: "/api/stream-analysis",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          try {
            const { ticker, provider, analysisType } = await c.req.json();
            logger?.info('🧠 [StreamAnalysis] Request received', { ticker, provider, analysisType });
            
            if (!ticker) {
              return c.json({ error: 'Ticker is required' }, 400);
            }
            
            const { streamAnalysis } = await import('./ai/streamingAnalysis.js');
            
            c.header('Content-Type', 'text/event-stream');
            c.header('Cache-Control', 'no-cache');
            c.header('Connection', 'keep-alive');
            
            const stream = new ReadableStream({
              async start(controller) {
                try {
                  for await (const chunk of streamAnalysis({
                    ticker,
                    analysisType: analysisType || 'technical',
                    provider: provider || 'openai'
                  })) {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
                  }
                  controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                  controller.close();
                } catch (error: any) {
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
                  controller.close();
                }
              }
            });
            
            return new Response(stream, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
              }
            });
          } catch (error: any) {
            logger?.error('❌ [StreamAnalysis] Error', { error: error.message });
            return c.json({ error: error.message || 'Streaming failed' }, 500);
          }
        }
      },
      // Multi-Model Ensemble Analysis endpoint
      {
        path: "/api/ensemble-analysis",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          try {
            const { ticker } = await c.req.json();
            logger?.info('🧠 [EnsembleAnalysis] Request received', { ticker });
            
            if (!ticker) {
              return c.json({ error: 'Ticker is required' }, 400);
            }
            
            const { streamMultiModelAnalysis } = await import('./ai/streamingAnalysis.js');
            
            const results = await streamMultiModelAnalysis(ticker, (chunk, source) => {
              logger?.debug(`[${source}] ${chunk.substring(0, 50)}...`);
            });
            
            logger?.info('✅ [EnsembleAnalysis] Completed', { ticker });
            return c.json({
              ticker,
              openaiAnalysis: results.openai,
              claudeAnalysis: results.claude,
              consensusAnalysis: results.consensus,
              providers: ['openai', 'claude'],
              timestamp: new Date().toISOString()
            });
          } catch (error: any) {
            logger?.error('❌ [EnsembleAnalysis] Error', { error: error.message });
            return c.json({ error: error.message || 'Ensemble analysis failed' }, 500);
          }
        }
      },
      // Agent Personas endpoint
      {
        path: "/api/agent-personas",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          logger?.info('🤖 [AgentPersonas] Request received');
          
          try {
            const { agentPersonas } = await import('./ai/agentPersonas.js');
            
            const personas = Object.values(agentPersonas).map(p => ({
              id: p.id,
              name: p.name,
              displayName: p.displayName,
              age: p.age,
              gender: p.gender,
              tradingStyle: p.tradingStyle,
              specialization: p.specialization,
              riskTolerance: p.riskTolerance,
              catchphrase: p.catchphrase
            }));
            
            return c.json({ personas, count: personas.length });
          } catch (error: any) {
            logger?.error('❌ [AgentPersonas] Error', { error: error.message });
            return c.json({ error: error.message }, 500);
          }
        }
      },
      // Unified Market Data endpoint
      {
        path: "/api/unified-data",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          try {
            const { ticker } = await c.req.json();
            logger?.info('📊 [UnifiedData] Request received', { ticker });
            
            if (!ticker) {
              return c.json({ error: 'Ticker is required' }, 400);
            }
            
            const { dataIntegration } = await import('./ai/dataIntegration.js');
            const data = await dataIntegration.fetchUnifiedData(ticker);
            
            logger?.info('✅ [UnifiedData] Data fetched', { 
              ticker, 
              sources: data.market?.sources?.length || 0 
            });
            
            return c.json({
              ticker,
              ...data,
              timestamp: new Date().toISOString()
            });
          } catch (error: any) {
            logger?.error('❌ [UnifiedData] Error', { error: error.message });
            return c.json({ error: error.message || 'Data fetch failed' }, 500);
          }
        }
      },
      // AI Chat endpoint - Compatible with AI SDK v4
      {
        path: "/api/chat",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          try {
            const { prompt, userId } = await c.req.json();
            logger?.info('💬 [AIChat] Request received', { userId, promptLength: prompt?.length });
            
            if (!prompt) {
              return c.json({ error: 'Prompt is required' }, 400);
            }
            
            const agent = mastra.getAgent('darkwaveAgent');
            if (!agent) {
              logger?.error('❌ [AIChat] Agent not found');
              return c.json({ error: 'Agent not found' }, 404);
            }
            
            // Use generateLegacy for AI SDK v4 compatibility
            const response = await agent.generateLegacy(prompt, {
              maxSteps: 3
            });
            
            logger?.info('✅ [AIChat] Response generated', { responseLength: response.text?.length });
            
            return c.json({ 
              text: response.text,
              toolCalls: response.toolCalls || []
            });
          } catch (error: any) {
            logger?.error('❌ [AIChat] Error', { error: error.message, stack: error.stack });
            return c.json({ error: error.message || 'Failed to generate response' }, 500);
          }
        }
      },
      // Analyze endpoint - Technical analysis for any ticker
      {
        path: "/api/analyze",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          try {
            const { ticker, userId } = await c.req.json();
            logger?.info('📊 [Analyze] Request received', { ticker, userId });
            
            if (!ticker) {
              return c.json({ error: 'Ticker is required' }, 400);
            }
            
            // Call technical analysis tool via workflow execution
            const result = await technicalAnalysisTool.execute(
              { context: { ticker: ticker.toUpperCase() }, mastra }
            );
            
            logger?.info('✅ [Analyze] Analysis completed', { ticker });
            return c.json(result);
          } catch (error: any) {
            logger?.error('❌ [Analyze] Error', { error: error.message });
            return c.json({ error: error.message || 'Analysis failed' }, 500);
          }
        }
      },
      // Stripe Checkout Session endpoint
      {
        path: "/api/create-checkout-session",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          try {
            const { plan, userId } = await c.req.json();
            logger?.info('💳 [Stripe] Creating checkout session', { plan, userId });
            
            if (!plan || !['basic', 'premium'].includes(plan)) {
              return c.json({ error: 'Invalid plan. Must be basic or premium' }, 400);
            }
            
            // Check for Stripe secret key
            if (!process.env.STRIPE_SECRET_KEY) {
              logger?.error('❌ [Stripe] STRIPE_SECRET_KEY not configured');
              return c.json({ error: 'Payment system not configured' }, 500);
            }
            
            // Dynamically import Stripe
            const Stripe = (await import('stripe')).default;
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
              apiVersion: '2025-10-29.clover'
            });
            
            // Get current domain for success/cancel URLs
            const baseUrl = process.env.REPL_SLUG 
              ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
              : 'http://localhost:5000';
            
            // Plan pricing
            const planPrices: Record<string, { amount: number, name: string }> = {
              basic: { amount: 200, name: 'DarkWave PULSE - Basic Plan' },
              premium: { amount: 600, name: 'DarkWave PULSE - Premium Plan' }
            };
            
            const selectedPlan = planPrices[plan];
            
            // Create Stripe Checkout Session
            const session = await stripe.checkout.sessions.create({
              mode: 'subscription',
              payment_method_types: ['card'],
              line_items: [
                {
                  price_data: {
                    currency: 'usd',
                    product_data: {
                      name: selectedPlan.name,
                      description: `${plan === 'premium' ? 'Advanced' : 'Essential'} market analysis features`
                    },
                    unit_amount: selectedPlan.amount,
                    recurring: {
                      interval: 'month'
                    }
                  },
                  quantity: 1
                }
              ],
              success_url: `${baseUrl}?session_id={CHECKOUT_SESSION_ID}&payment=success`,
              cancel_url: `${baseUrl}?payment=cancelled`,
              metadata: {
                userId: userId || 'unknown',
                plan: plan
              }
            });
            
            logger?.info('✅ [Stripe] Checkout session created', { 
              sessionId: session.id,
              url: session.url 
            });
            
            return c.json({ url: session.url, sessionId: session.id });
          } catch (error: any) {
            logger?.error('❌ [Stripe] Error creating checkout session', { 
              error: error.message,
              stack: error.stack 
            });
            return c.json({ error: 'Failed to create checkout session' }, 500);
          }
        }
      },
      // Serve frontend HTML at root
      {
        path: "/",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          const url = await import('url');
          
          // Try multiple paths for dev vs deployment
          const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
          const possiblePaths = [
            path.join(process.cwd(), 'public', 'index.html'),
            path.join(__dirname, '..', '..', 'public', 'index.html'),
            path.join(__dirname, '..', '..', '..', 'public', 'index.html'),
          ];
          
          for (const filePath of possiblePaths) {
            try {
              const html = await fs.readFile(filePath, 'utf-8');
              return c.html(html);
            } catch (err) {
              continue;
            }
          }
          
          return c.text('Frontend not found. Tried paths: ' + possiblePaths.join(', '), 404);
        }
      },
      // Serve static assets
      {
        path: "/app.js",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          const url = await import('url');
          
          const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
          const possiblePaths = [
            path.join(process.cwd(), 'public', 'app.js'),
            path.join(__dirname, '..', '..', 'public', 'app.js'),
            path.join(__dirname, '..', '..', '..', 'public', 'app.js'),
          ];
          
          for (const filePath of possiblePaths) {
            try {
              const js = await fs.readFile(filePath, 'utf-8');
              c.header('Content-Type', 'application/javascript');
              return c.body(js);
            } catch (err) {
              continue;
            }
          }
          
          return c.text('app.js not found', 404);
        }
      },
      {
        path: "/styles.css",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          const url = await import('url');
          
          const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
          const possiblePaths = [
            path.join(process.cwd(), 'public', 'styles.css'),
            path.join(__dirname, '..', '..', 'public', 'styles.css'),
            path.join(__dirname, '..', '..', '..', 'public', 'styles.css'),
          ];
          
          for (const filePath of possiblePaths) {
            try {
              const css = await fs.readFile(filePath, 'utf-8');
              c.header('Content-Type', 'text/css');
              return c.body(css);
            } catch (err) {
              continue;
            }
          }
          
          return c.text('styles.css not found', 404);
        }
      },
      {
        path: "/darkwave-logo.jpg",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          const url = await import('url');
          
          const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
          const possiblePaths = [
            path.join(process.cwd(), 'public', 'darkwave-logo.jpg'),
            path.join(__dirname, '..', '..', 'public', 'darkwave-logo.jpg'),
            path.join(__dirname, '..', '..', '..', 'public', 'darkwave-logo.jpg'),
          ];
          
          for (const filePath of possiblePaths) {
            try {
              const image = await fs.readFile(filePath);
              c.header('Content-Type', 'image/jpeg');
              return c.body(image);
            } catch (err) {
              continue;
            }
          }
          
          return c.text('Logo not found', 404);
        }
      },
      // ALIAS: /api/crypto/coin-prices -> /api/market-overview
      {
        path: "/api/crypto/coin-prices",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          try {
            const response = await fetch('http://localhost:3001/api/market-overview');
            const data = await response.json();
            return c.json(data);
          } catch (error) {
            return c.json({ error: 'Failed to fetch coin prices' }, 500);
          }
        }
      },
      // Crypto Category Filter Routes - Used by coin table filter buttons
      {
        path: "/api/crypto/category/:category",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const category = c.req.param('category');
          const timeframe = c.req.query('timeframe') || '24h';
          
          logger?.info('📊 [CryptoCategory] Request', { category, timeframe });
          
          try {
            const axios = (await import('axios')).default;
            
            // Map frontend categories to CoinGecko API calls
            let coins: any[] = [];
            
            switch (category) {
              case 'top':
                // Top 10 by market cap
                const topRes = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                  params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: 10,
                    page: 1,
                    sparkline: false,
                    price_change_percentage: '24h'
                  },
                  timeout: 10000
                });
                coins = topRes.data.map((coin: any) => ({
                  symbol: coin.symbol.toUpperCase(),
                  name: coin.name,
                  price: coin.current_price,
                  change24h: coin.price_change_percentage_24h || 0,
                  volume: coin.total_volume,
                  image: coin.image
                }));
                break;
                
              case 'meme':
                // Meme coins category
                const memeRes = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                  params: {
                    vs_currency: 'usd',
                    category: 'meme-token',
                    order: 'market_cap_desc',
                    per_page: 10,
                    page: 1,
                    sparkline: false,
                    price_change_percentage: '24h'
                  },
                  timeout: 10000
                });
                coins = memeRes.data.map((coin: any) => ({
                  symbol: coin.symbol.toUpperCase(),
                  name: coin.name,
                  price: coin.current_price,
                  change24h: coin.price_change_percentage_24h || 0,
                  volume: coin.total_volume,
                  image: coin.image
                }));
                break;
                
              case 'defi':
                // DeFi tokens
                const defiRes = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                  params: {
                    vs_currency: 'usd',
                    category: 'decentralized-finance-defi',
                    order: 'market_cap_desc',
                    per_page: 10,
                    page: 1,
                    sparkline: false,
                    price_change_percentage: '24h'
                  },
                  timeout: 10000
                });
                coins = defiRes.data.map((coin: any) => ({
                  symbol: coin.symbol.toUpperCase(),
                  name: coin.name,
                  price: coin.current_price,
                  change24h: coin.price_change_percentage_24h || 0,
                  volume: coin.total_volume,
                  image: coin.image
                }));
                break;
                
              case 'bluechip':
                // Blue chips (top market cap, established coins)
                const blueRes = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                  params: {
                    vs_currency: 'usd',
                    ids: 'bitcoin,ethereum,binancecoin,solana,ripple,cardano,avalanche-2,polkadot,chainlink,polygon',
                    order: 'market_cap_desc',
                    sparkline: false,
                    price_change_percentage: '24h'
                  },
                  timeout: 10000
                });
                coins = blueRes.data.map((coin: any) => ({
                  symbol: coin.symbol.toUpperCase(),
                  name: coin.name,
                  price: coin.current_price,
                  change24h: coin.price_change_percentage_24h || 0,
                  volume: coin.total_volume,
                  image: coin.image
                }));
                break;
                
              case 'gainers':
                // Top gainers
                const gainersRes = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                  params: {
                    vs_currency: 'usd',
                    order: timeframe === '1h' ? 'volume_desc' : 'market_cap_desc',
                    per_page: 100,
                    page: 1,
                    sparkline: false,
                    price_change_percentage: timeframe === '1h' ? '1h' : '24h'
                  },
                  timeout: 10000
                });
                const changeKey = timeframe === '1h' ? 'price_change_percentage_1h_in_currency' : 'price_change_percentage_24h';
                coins = gainersRes.data
                  .filter((coin: any) => (coin[changeKey] || coin.price_change_percentage_24h || 0) > 0)
                  .sort((a: any, b: any) => (b[changeKey] || b.price_change_percentage_24h || 0) - (a[changeKey] || a.price_change_percentage_24h || 0))
                  .slice(0, 10)
                  .map((coin: any) => ({
                    symbol: coin.symbol.toUpperCase(),
                    name: coin.name,
                    price: coin.current_price,
                    change24h: coin[changeKey] || coin.price_change_percentage_24h || 0,
                    volume: coin.total_volume,
                    image: coin.image
                  }));
                break;
                
              case 'losers':
                // Top losers
                const losersRes = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                  params: {
                    vs_currency: 'usd',
                    order: timeframe === '1h' ? 'volume_desc' : 'market_cap_desc',
                    per_page: 100,
                    page: 1,
                    sparkline: false,
                    price_change_percentage: timeframe === '1h' ? '1h' : '24h'
                  },
                  timeout: 10000
                });
                const loseChangeKey = timeframe === '1h' ? 'price_change_percentage_1h_in_currency' : 'price_change_percentage_24h';
                coins = losersRes.data
                  .filter((coin: any) => (coin[loseChangeKey] || coin.price_change_percentage_24h || 0) < 0)
                  .sort((a: any, b: any) => (a[loseChangeKey] || a.price_change_percentage_24h || 0) - (b[loseChangeKey] || b.price_change_percentage_24h || 0))
                  .slice(0, 10)
                  .map((coin: any) => ({
                    symbol: coin.symbol.toUpperCase(),
                    name: coin.name,
                    price: coin.current_price,
                    change24h: coin[loseChangeKey] || coin.price_change_percentage_24h || 0,
                    volume: coin.total_volume,
                    image: coin.image
                  }));
                break;
                
              default:
                return c.json({ error: 'Invalid category' }, 400);
            }
            
            logger?.info('✅ [CryptoCategory] Success', { category, count: coins.length });
            return c.json(coins);
            
          } catch (error: any) {
            logger?.error('❌ [CryptoCategory] Error', { category, error: error.message });
            return c.json({ error: 'Failed to fetch category data' }, 500);
          }
        }
      },
      // ALIAS: /api/sentiment/fear-greed
      {
        path: "/api/sentiment/fear-greed",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          try {
            return c.json({
              data: [{
                value: 65,
                valueClassification: 'Greed',
                timestamp: Math.floor(Date.now() / 1000)
              }]
            });
          } catch (error) {
            return c.json({ error: 'Failed to fetch fear & greed' }, 500);
          }
        }
      },
      // ALIAS: /api/crypto/market-chart (with 60-second cache using CoinGecko API)
      {
        path: "/api/crypto/market-chart",
        method: "GET",
        createHandler: async ({ mastra }) => {
          // In-memory cache for market chart data (60 second TTL) - keyed by interval
          const chartCacheMap: Map<string, { data: any; timestamp: number }> = new Map();
          const CACHE_TTL_MS = 60000; // 60 seconds
          
          return async (c: any) => {
            try {
              const { interval } = c.req.query();
              const logger = mastra.getLogger();
              const currentInterval = interval || '60';
              
              // Return cached data if still valid for this specific interval
              const cachedEntry = chartCacheMap.get(currentInterval);
              if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL_MS) {
                logger?.info('📦 [MarketChart] Returning cached data for interval', { interval: currentInterval });
                return c.json(cachedEntry.data);
              }
              
              logger?.info('📊 [MarketChart] Fetching fresh data from CoinGecko', { interval: currentInterval });
              
              const intervalMinutes = parseInt(currentInterval) || 60;
              let days: number | string = 1;
              if (intervalMinutes <= 1) days = 1;        // 1hr view: 1 day of minute data
              else if (intervalMinutes <= 60) days = 1;  // 24hr view: 1 day of hourly data
              else if (intervalMinutes <= 240) days = 7; // 7d view
              else if (intervalMinutes <= 720) days = 14;
              else if (intervalMinutes <= 1440) days = 30; // 1 month view
              else if (intervalMinutes <= 10080) days = 365; // 1 year / all time view - get full year of data
              
              const axios = (await import('axios')).default;
              
              // Fetch OHLC data for candlesticks
              const ohlcUrl = `https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=${days}`;
              const ohlcResponse = await axios.get(ohlcUrl, {
                headers: { 'Accept': 'application/json' },
                timeout: 10000
              });
              
              // Fetch market_chart for volume data
              const marketChartUrl = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`;
              const marketResponse = await axios.get(marketChartUrl, {
                headers: { 'Accept': 'application/json' },
                timeout: 10000
              });
              
              const ohlcData = ohlcResponse.data;
              const marketData = marketResponse.data;
              
              if (!ohlcData || !Array.isArray(ohlcData) || ohlcData.length === 0) {
                logger?.warn('⚠️ [MarketChart] No OHLC data from CoinGecko');
                if (cachedEntry && cachedEntry.data) {
                  return c.json(cachedEntry.data);
                }
                return c.json({ candleData: [], sparklineData: [] });
              }
              
              // Build volume lookup map from market_chart data
              const volumeMap: Map<number, number> = new Map();
              if (marketData?.total_volumes && Array.isArray(marketData.total_volumes)) {
                marketData.total_volumes.forEach((v: number[]) => {
                  // Round timestamp to nearest hour for matching
                  const roundedTs = Math.floor(v[0] / 3600000) * 3600000;
                  volumeMap.set(roundedTs, v[1]);
                });
              }
              
              // CoinGecko OHLC format: [timestamp, open, high, low, close]
              const candleData = ohlcData.map((candle: number[]) => {
                const ts = candle[0];
                const roundedTs = Math.floor(ts / 3600000) * 3600000;
                // Find closest volume data point
                let volume = volumeMap.get(roundedTs) || 0;
                if (volume === 0) {
                  // Try finding nearby volume
                  for (let offset = 3600000; offset <= 7200000; offset += 3600000) {
                    volume = volumeMap.get(roundedTs - offset) || volumeMap.get(roundedTs + offset) || 0;
                    if (volume > 0) break;
                  }
                }
                return {
                  timestamp: ts,
                  open: candle[1],
                  high: candle[2],
                  low: candle[3],
                  close: candle[4],
                  volume: volume
                };
              });
              
              // Extract sparkline (just closing prices)
              const sparklineData = candleData.map((c: any) => c.close);
              
              const responseData = { candleData, sparklineData, interval: currentInterval };
              
              // Update cache for this interval
              chartCacheMap.set(currentInterval, {
                data: responseData,
                timestamp: Date.now()
              });
              
              // Clean old cache entries (keep last 5 intervals)
              if (chartCacheMap.size > 5) {
                const oldestKey = chartCacheMap.keys().next().value;
                if (oldestKey) chartCacheMap.delete(oldestKey);
              }
              
              logger?.info('✅ [MarketChart] Data cached from CoinGecko', { 
                interval: currentInterval,
                candleCount: candleData.length, 
                sparklineCount: sparklineData.length,
                hasVolume: candleData.some((c: any) => c.volume > 0)
              });
              
              return c.json(responseData);
            } catch (error: any) {
              const logger = mastra.getLogger();
              logger?.error('❌ [MarketChart] Error fetching data', { error: error.message });
              // Return any cached data if available
              const cachedEntry = chartCacheMap.values().next().value;
              if (cachedEntry && cachedEntry.data) {
                return c.json(cachedEntry.data);
              }
              return c.json({ candleData: [], sparklineData: [] });
            }
          };
        }
      },
      // Trading API: Buy Limit Order (V2 Feature - Locked)
      {
        path: "/api/trading/buy-limit",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            const { tokenSymbol, targetPrice, amount, walletAddress } = await c.req.json();
            logger?.info('📈 [BuyLimit] Order received', { tokenSymbol, targetPrice, amount });
            
            // V2 Locked Feature - Return locked response
            return c.json({
              success: false,
              locked: true,
              message: '🔒 Buy Limit Orders are a V2 Predictive Trading feature. Coming Dec 25, 2025!',
              features: {
                description: 'Set automatic buy orders when your target price is reached',
                predictiveEdge: 'AI-powered entry points based on technical signals',
                autoExecution: 'Executes instantly when conditions are met'
              }
            }, 423);
          } catch (error: any) {
            return c.json({ error: error.message }, 400);
          }
        }
      },
      // Trading API: Sell Limit Order (V2 Feature - Locked)
      {
        path: "/api/trading/sell-limit",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            const { tokenSymbol, targetPrice, amount, walletAddress } = await c.req.json();
            logger?.info('📉 [SellLimit] Order received', { tokenSymbol, targetPrice, amount });
            
            // V2 Locked Feature - Return locked response
            return c.json({
              success: false,
              locked: true,
              message: '🔒 Sell Limit Orders are a V2 Predictive Trading feature. Coming Dec 25, 2025!',
              features: {
                description: 'Set automatic sell orders at your target price',
                riskManagement: 'Built-in stop-loss and take-profit levels',
                prediction: 'AI-powered exit signals for optimal profits'
              }
            }, 423);
          } catch (error: any) {
            return c.json({ error: error.message }, 400);
          }
        }
      },
      // Trading API: List Active Orders (V2 Feature - Locked)
      {
        path: "/api/trading/orders",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            logger?.info('📋 [Orders] List request');
            
            // V2 Locked Feature - Return locked response
            return c.json({
              success: false,
              locked: true,
              message: '🔒 Order Management is a V2 Predictive Trading feature. Coming Dec 25, 2025!',
              orders: [],
              upgradeUrl: '/pricing'
            }, 423);
          } catch (error: any) {
            return c.json({ error: error.message }, 400);
          }
        }
      },
      // ALIAS: /api/payments/plans
      {
        path: "/api/payments/plans",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          try {
            return c.json([
              { id: 'free', name: 'Free Trial', price: 0 },
              { id: 'basic', name: 'Basic', price: 9.99 },
              { id: 'premium', name: 'Premium', price: 29.99 }
            ]);
          } catch (error) {
            return c.json({ error: 'Failed to fetch payment plans' }, 500);
          }
        }
      },
      // Serve coins directory (JSON and images)
      {
        path: "/coins/*",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          const url = await import('url');
          
          const requestedFile = c.req.path.replace('/coins/', '');
          const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
          const possiblePaths = [
            path.join(process.cwd(), 'public', 'coins', requestedFile),
            path.join(__dirname, '..', '..', 'public', 'coins', requestedFile),
            path.join(__dirname, '..', '..', '..', 'public', 'coins', requestedFile),
          ];
          
          for (const filePath of possiblePaths) {
            try {
              const fileBuffer = await fs.readFile(filePath);
              
              // Set content type based on file extension
              if (requestedFile.endsWith('.json')) {
                c.header('Content-Type', 'application/json');
              } else if (requestedFile.endsWith('.jpg') || requestedFile.endsWith('.jpeg')) {
                c.header('Content-Type', 'image/jpeg');
              } else if (requestedFile.endsWith('.png')) {
                c.header('Content-Type', 'image/png');
              }
              
              return c.body(fileBuffer);
            } catch (err) {
              continue;
            }
          }
          
          return c.text('File not found: ' + requestedFile, 404);
        }
      },
      // Admin Dashboard - View subscribers and manage whitelist
      {
        path: "/admin",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          // Simple admin authentication - check if access code matches
          const adminCode = c.req.query('code');
          const expectedCode = process.env.ADMIN_ACCESS_CODE;
          
          if (!expectedCode) {
            logger?.error('❌ [Admin] ADMIN_ACCESS_CODE not configured');
            return c.text('Admin dashboard not configured', 500);
          }
          
          if (adminCode !== expectedCode) {
            return c.html(`
              <html>
                <head>
                  <title>Admin Access</title>
                  <style>
                    body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; background: #1a1a1a; color: #fff; }
                    input { width: 100%; padding: 12px; margin: 10px 0; background: #2a2a2a; border: 1px solid #4ADE80; color: #fff; border-radius: 4px; }
                    button { width: 100%; padding: 12px; background: #4ADE80; color: #000; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
                    button:hover { background: #3BC970; }
                  </style>
                </head>
                <body>
                  <h2>🔐 Admin Access</h2>
                  <form action="/admin" method="GET">
                    <input type="password" name="code" placeholder="Enter admin code" required>
                    <button type="submit">Access Dashboard</button>
                  </form>
                </body>
              </html>
            `);
          }
          
          // Fetch all subscribers, whitelisted users, and token submissions
          const { db } = await import('../db/client.js');
          const { subscriptions, whitelistedUsers, tokenSubmissions } = await import('../db/schema.js');
          
          const allSubscribers = await db.select().from(subscriptions);
          const allWhitelisted = await db.select().from(whitelistedUsers);
          const allTokenSubmissions = await db.select().from(tokenSubmissions).orderBy(desc(tokenSubmissions.submittedAt));
          
          const premiumCount = allSubscribers.filter(s => s.plan === 'premium' && s.status === 'active').length;
          const basicCount = allSubscribers.filter(s => s.plan === 'basic' && s.status === 'active').length;
          const monthlyRevenue = (premiumCount * 6) + (basicCount * 2);
          
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>DarkWave Admin Dashboard</title>
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #8B0000 0%, #4B0082 50%, #000000 100%); color: #fff; padding: 20px; }
                  .container { max-width: 1200px; margin: 0 auto; }
                  h1 { margin-bottom: 30px; text-align: center; }
                  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                  .stat-card { background: rgba(0,0,0,0.5); padding: 20px; border-radius: 8px; border: 1px solid #4ADE80; }
                  .stat-value { font-size: 32px; font-weight: bold; color: #4ADE80; }
                  .stat-label { color: #aaa; margin-top: 5px; }
                  .section { background: rgba(0,0,0,0.5); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #666; }
                  .section h2 { margin-bottom: 15px; color: #4ADE80; }
                  table { width: 100%; border-collapse: collapse; }
                  th { background: rgba(74,222,128,0.2); padding: 12px; text-align: left; border-bottom: 2px solid #4ADE80; }
                  td { padding: 12px; border-bottom: 1px solid #333; }
                  tr:hover { background: rgba(74,222,128,0.1); }
                  .status-active { color: #4ADE80; font-weight: bold; }
                  .status-inactive { color: #999; }
                  .add-whitelist { background: #4ADE80; color: #000; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
                  .add-whitelist:hover { background: #3BC970; }
                  input { padding: 8px; background: #2a2a2a; border: 1px solid #666; color: #fff; border-radius: 4px; margin-right: 10px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>🌊 DarkWave Admin Dashboard</h1>
                  
                  <div class="stats">
                    <div class="stat-card">
                      <div class="stat-value">${allSubscribers.length}</div>
                      <div class="stat-label">Total Users</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-value">${basicCount}</div>
                      <div class="stat-label">Basic ($2/mo)</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-value">${premiumCount}</div>
                      <div class="stat-label">Premium ($6/mo)</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-value">$${monthlyRevenue}</div>
                      <div class="stat-label">Monthly Revenue (MRR)</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-value">${allWhitelisted.length}</div>
                      <div class="stat-label">Whitelisted Users</div>
                    </div>
                  </div>
                  
                  <div class="section">
                    <h2>💳 Active Subscribers (Basic + Premium)</h2>
                    <table>
                      <thead>
                        <tr>
                          <th>User ID</th>
                          <th>Plan</th>
                          <th>Status</th>
                          <th>Provider</th>
                          <th>Expiry Date</th>
                          <th>Auto-Renew</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${allSubscribers.filter(s => (s.plan === 'premium' || s.plan === 'basic') && s.status === 'active').map(sub => `
                          <tr>
                            <td>${sub.userId}</td>
                            <td>${sub.plan.toUpperCase()}</td>
                            <td class="status-${sub.status}">${sub.status}</td>
                            <td>${sub.provider || 'N/A'}</td>
                            <td>${sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : 'N/A'}</td>
                            <td>${sub.autoRenew ? '✅ Yes' : '❌ No'}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                  
                  <div class="section">
                    <h2>⭐ Whitelisted Users</h2>
                    <form action="/admin/whitelist/add" method="POST" style="margin-bottom: 20px;">
                      <input type="hidden" name="code" value="${adminCode}">
                      <input type="text" name="userId" placeholder="User ID or Email" required>
                      <input type="text" name="reason" placeholder="Reason (optional)">
                      <button type="submit" class="add-whitelist">Add to Whitelist</button>
                    </form>
                    <p style="color: #aaa; margin-bottom: 20px; font-size: 14px;">
                      💡 Tip: Add Telegram IDs for bot users, or emails for website/app subscribers. Stripe subscriptions are auto-whitelisted.
                    </p>
                    <table>
                      <thead>
                        <tr>
                          <th>User ID / Email</th>
                          <th>Email</th>
                          <th>Reason</th>
                          <th>Expires At</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${allWhitelisted.map(user => `
                          <tr>
                            <td>${user.userId}</td>
                            <td>${user.email || 'N/A'}</td>
                            <td>${user.reason || 'N/A'}</td>
                            <td>${user.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : 'Never'}</td>
                            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                              <form action="/admin/whitelist/remove" method="POST" style="display: inline;">
                                <input type="hidden" name="code" value="${adminCode}">
                                <input type="hidden" name="userId" value="${user.userId}">
                                <button type="submit" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Remove</button>
                              </form>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                  
                  <div class="section">
                    <h2>🚀 Token Submissions</h2>
                    <p style="color: #aaa; margin-bottom: 20px; font-size: 14px;">
                      Review and approve/reject user-submitted tokens. Approved tokens appear in the Projects section.
                    </p>
                    <table>
                      <thead>
                        <tr>
                          <th>Logo</th>
                          <th>Name / Symbol</th>
                          <th>Contract</th>
                          <th>Chain</th>
                          <th>Submitted By</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${allTokenSubmissions.length === 0 ? `
                          <tr>
                            <td colspan="8" style="text-align: center; color: #aaa;">No token submissions yet</td>
                          </tr>
                        ` : allTokenSubmissions.map(submission => {
                          const statusColors = {
                            pending: '#FFA500',
                            approved: '#4ADE80',
                            rejected: '#ff4444'
                          };
                          const statusColor = statusColors[submission.status as keyof typeof statusColors] || '#aaa';
                          
                          return `
                          <tr>
                            <td>
                              ${submission.tokenLogo ? `
                                <img src="${submission.tokenLogo}" 
                                     style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" 
                                     alt="${submission.tokenSymbol}">
                              ` : '🪙'}
                            </td>
                            <td>
                              <strong>${submission.tokenName}</strong><br>
                              <span style="color: #aaa;">${submission.tokenSymbol}</span>
                            </td>
                            <td>
                              <code style="font-size: 11px; word-break: break-all;">${submission.tokenContract}</code>
                            </td>
                            <td>${submission.tokenChain}</td>
                            <td>${submission.submittedBy}</td>
                            <td style="color: ${statusColor}; font-weight: bold;">
                              ${submission.status.toUpperCase()}
                            </td>
                            <td>${new Date(submission.submittedAt).toLocaleDateString()}</td>
                            <td>
                              ${submission.status === 'pending' ? `
                                <button 
                                  onclick="approveToken('${submission.id}')" 
                                  style="background: #4ADE80; color: #000; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                                  ✅ Approve
                                </button>
                                <button 
                                  onclick="rejectToken('${submission.id}')" 
                                  style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                  ❌ Reject
                                </button>
                              ` : `
                                <span style="color: #aaa;">—</span>
                              `}
                            </td>
                          </tr>
                        `;
                        }).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <script>
                  const adminCode = '${adminCode}';
                  
                  async function approveToken(submissionId) {
                    if (!confirm('Approve this token? It will be published to the Projects section.')) return;
                    
                    try {
                      const response = await fetch('/api/admin/approve-token', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'X-Admin-Code': adminCode
                        },
                        body: JSON.stringify({ submissionId })
                      });
                      
                      const result = await response.json();
                      if (response.ok) {
                        alert('✅ Token approved and published!');
                        window.location.reload();
                      } else {
                        alert('❌ Error: ' + result.error);
                      }
                    } catch (error) {
                      alert('❌ Error approving token');
                      console.error(error);
                    }
                  }
                  
                  async function rejectToken(submissionId) {
                    const reason = prompt('Why are you rejecting this token? (optional)');
                    if (reason === null) return; // User cancelled
                    
                    try {
                      const response = await fetch('/api/admin/reject-token', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'X-Admin-Code': adminCode
                        },
                        body: JSON.stringify({ submissionId, reason })
                      });
                      
                      const result = await response.json();
                      if (response.ok) {
                        alert('✅ Token rejected');
                        window.location.reload();
                      } else {
                        alert('❌ Error: ' + result.error);
                      }
                    } catch (error) {
                      alert('❌ Error rejecting token');
                      console.error(error);
                    }
                  }
                </script>
              </body>
            </html>
          `;
          
          return c.html(html);
        }
      },
      // Admin: Add user to whitelist
      {
        path: "/admin/whitelist/add",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const expectedCode = process.env.ADMIN_ACCESS_CODE;
          
          if (!expectedCode) {
            logger?.error('❌ [Admin] ADMIN_ACCESS_CODE not configured');
            return c.text('Admin dashboard not configured', 500);
          }
          
          const formData = await c.req.parseBody();
          const adminCode = formData.code || c.req.header('X-Admin-Code');
          
          // SECURITY: Validate admin code from form data or header
          if (adminCode !== expectedCode) {
            logger?.warn('⚠️ [Admin] Unauthorized whitelist add attempt');
            return c.text('Unauthorized', 401);
          }
          
          // SECURITY: Validate userId/email input
          const userIdOrEmail = formData.userId as string;
          if (!userIdOrEmail || typeof userIdOrEmail !== 'string' || userIdOrEmail.trim().length === 0) {
            logger?.warn('⚠️ [Admin] Invalid userId/email provided for whitelist');
            return c.text('Invalid userId/email', 400);
          }
          
          const { db } = await import('../db/client.js');
          const { whitelistedUsers } = await import('../db/schema.js');
          
          // Detect if input is an email address
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userIdOrEmail.trim());
          
          if (isEmail) {
            // Store email in both userId AND email field for backwards compatibility
            await db.insert(whitelistedUsers).values({
              userId: userIdOrEmail.trim(),
              email: userIdOrEmail.trim(),
              reason: (formData.reason as string) || 'Email subscription',
              expiresAt: null,
            }).onConflictDoNothing();
            
            logger?.info('✅ [Admin] Email added to whitelist', { email: userIdOrEmail.trim(), reason: formData.reason });
          } else {
            // Store as Telegram ID (userId)
            await db.insert(whitelistedUsers).values({
              userId: userIdOrEmail.trim(),
              email: null,
              reason: (formData.reason as string) || null,
              expiresAt: null,
            }).onConflictDoNothing();
            
            logger?.info('✅ [Admin] Telegram ID added to whitelist', { userId: userIdOrEmail.trim(), reason: formData.reason });
          }
          
          return c.redirect(`/admin?code=${adminCode}`);
        }
      },
      // Admin: Remove user from whitelist
      {
        path: "/admin/whitelist/remove",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const expectedCode = process.env.ADMIN_ACCESS_CODE;
          
          if (!expectedCode) {
            logger?.error('❌ [Admin] ADMIN_ACCESS_CODE not configured');
            return c.text('Admin dashboard not configured', 500);
          }
          
          const formData = await c.req.parseBody();
          const adminCode = formData.code || c.req.header('X-Admin-Code');
          
          // SECURITY: Validate admin code from form data or header
          if (adminCode !== expectedCode) {
            logger?.warn('⚠️ [Admin] Unauthorized whitelist remove attempt');
            return c.text('Unauthorized', 401);
          }
          
          // SECURITY: Validate userId input
          const userId = formData.userId as string;
          if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
            logger?.warn('⚠️ [Admin] Invalid userId provided for removal');
            return c.text('Invalid userId', 400);
          }
          
          const { db } = await import('../db/client.js');
          const { whitelistedUsers } = await import('../db/schema.js');
          const { eq } = await import('drizzle-orm');
          
          await db.delete(whitelistedUsers).where(eq(whitelistedUsers.userId, userId.trim()));
          
          logger?.info('✅ [Admin] User removed from whitelist', { userId: userId.trim() });
          
          return c.redirect(`/admin?code=${adminCode}`);
        }
      },
      // Admin API: Get all token submissions
      {
        path: "/api/admin/token-submissions",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const expectedCode = process.env.ADMIN_ACCESS_CODE;
          
          if (!expectedCode) {
            logger?.error('❌ [Admin] ADMIN_ACCESS_CODE not configured');
            return c.json({ error: 'Admin dashboard not configured' }, 500);
          }
          
          const adminCode = c.req.query('code') || c.req.header('X-Admin-Code');
          
          if (adminCode !== expectedCode) {
            logger?.warn('⚠️ [Admin] Unauthorized token submissions request');
            return c.json({ error: 'Unauthorized' }, 401);
          }
          
          const { db } = await import('../db/client.js');
          const { tokenSubmissions } = await import('../db/schema.js');
          
          const submissions = await db.select().from(tokenSubmissions).orderBy(desc(tokenSubmissions.submittedAt));
          
          logger?.info('✅ [Admin] Token submissions retrieved', { count: submissions.length });
          return c.json({ submissions });
        }
      },
      // Admin API: Approve token submission
      {
        path: "/api/admin/approve-token",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const expectedCode = process.env.ADMIN_ACCESS_CODE;
          
          if (!expectedCode) {
            logger?.error('❌ [Admin] ADMIN_ACCESS_CODE not configured');
            return c.json({ error: 'Admin dashboard not configured' }, 500);
          }
          
          const adminCode = c.req.header('X-Admin-Code');
          
          if (adminCode !== expectedCode) {
            logger?.warn('⚠️ [Admin] Unauthorized token approval attempt');
            return c.json({ error: 'Unauthorized' }, 401);
          }
          
          const { submissionId } = await c.req.json();
          
          const { db } = await import('../db/client.js');
          const { tokenSubmissions, approvedTokens } = await import('../db/schema.js');
          const { eq } = await import('drizzle-orm');
          
          // Get the submission
          const [submission] = await db.select().from(tokenSubmissions).where(eq(tokenSubmissions.id, submissionId)).limit(1);
          
          if (!submission) {
            return c.json({ error: 'Submission not found' }, 404);
          }
          
          // Create approved token with all comprehensive fields
          const tokenId = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await db.insert(approvedTokens).values({
            id: tokenId,
            address: submission.tokenContract,
            name: submission.tokenName,
            symbol: submission.tokenSymbol,
            description: submission.tokenDescription,
            chain: submission.tokenChain.toLowerCase(),
            platform: 'pumpfun', // Default, can be updated later
            logo: submission.tokenLogo,
            
            // Social Links
            website: submission.website,
            twitter: submission.twitter,
            telegram: submission.telegram,
            discord: submission.discord,
            
            // Documentation
            whitepaper: submission.whitepaper,
            tokenomics: submission.tokenomics,
            auditReport: submission.auditReport,
            
            // Project Qualifiers
            hasWhitepaper: submission.hasWhitepaper,
            hasAudit: submission.hasAudit,
            isDoxxedTeam: submission.isDoxxedTeam,
            hasLockedLiquidity: submission.hasLockedLiquidity,
            
            featured: true,
            displayOrder: 0,
          }).onConflictDoNothing();
          
          // Update submission status
          await db.update(tokenSubmissions)
            .set({ 
              status: 'approved',
              reviewedBy: 'admin',
              reviewedAt: new Date()
            })
            .where(eq(tokenSubmissions.id, submissionId));
          
          logger?.info('✅ [Admin] Token approved', { submissionId, tokenContract: submission.tokenContract });
          return c.json({ success: true, message: 'Token approved and published' });
        }
      },
      // Admin API: Reject token submission
      {
        path: "/api/admin/reject-token",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const expectedCode = process.env.ADMIN_ACCESS_CODE;
          
          if (!expectedCode) {
            logger?.error('❌ [Admin] ADMIN_ACCESS_CODE not configured');
            return c.json({ error: 'Admin dashboard not configured' }, 500);
          }
          
          const adminCode = c.req.header('X-Admin-Code');
          
          if (adminCode !== expectedCode) {
            logger?.warn('⚠️ [Admin] Unauthorized token rejection attempt');
            return c.json({ error: 'Unauthorized' }, 401);
          }
          
          const { submissionId, reason } = await c.req.json();
          
          const { db } = await import('../db/client.js');
          const { tokenSubmissions } = await import('../db/schema.js');
          const { eq } = await import('drizzle-orm');
          
          await db.update(tokenSubmissions)
            .set({ 
              status: 'rejected',
              reviewedBy: 'admin',
              reviewedAt: new Date(),
              rejectionReason: reason || 'Does not meet listing criteria'
            })
            .where(eq(tokenSubmissions.id, submissionId));
          
          logger?.info('✅ [Admin] Token rejected', { submissionId, reason });
          return c.json({ success: true, message: 'Token rejected' });
        }
      },
      // Mini App Backend API Routes
      // Access Code Verification
      {
        path: "/api/verify-access",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            const { code, userId } = await c.req.json();
            logger?.info('🔐 [Access Code] Verification attempt', { userId });
            
            if (!userId || typeof userId !== 'string' || userId.trim() === '') {
              return c.json({ 
                success: false, 
                message: 'User ID is required' 
              }, 400);
            }
            
            const correctCode = process.env.ACCESS_CODE;
            
            if (!correctCode) {
              logger?.error('🚨 [Access Code] ACCESS_CODE not configured');
              return c.json({ error: 'Access code system not configured' }, 500);
            }
            
            // METHOD 1: Check if code matches "lucky 777"
            if (code === correctCode) {
              // Generate session token with user ID (7-day free tier)
              const { generateSessionToken } = await import('./middleware/accessControl.js');
              const sessionToken = await generateSessionToken(userId.trim(), undefined, false);
              
              logger?.info('✅ [Access Code] Valid code entered, 7-day session created', { userId: userId.trim() });
              return c.json({ 
                success: true, 
                message: 'Access granted (7-day trial)',
                sessionToken 
              });
            }
            
            // METHOD 2: Check if input is an email and if it's whitelisted
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(code)) {
              const cleanEmail = code.trim().toLowerCase();
              const { db } = await import('../db/client.js');
              const { whitelistedUsers } = await import('../db/schema.js');
              const { eq, or } = await import('drizzle-orm');
              
              // Check if email is in whitelist
              const whitelist = await db.select()
                .from(whitelistedUsers)
                .where(eq(whitelistedUsers.email, cleanEmail))
                .limit(1);
              
              if (whitelist.length > 0) {
                const whitelistEntry = whitelist[0];
                
                // Check if whitelist has expired
                if (whitelistEntry.expiresAt && new Date(whitelistEntry.expiresAt) < new Date()) {
                  logger?.warn('❌ [Email Access] Whitelist expired', { email: cleanEmail });
                  return c.json({ success: false, message: 'Email whitelist has expired' }, 401);
                }
                
                // Generate session token with email attached (permanent access for whitelisted)
                const { generateSessionToken } = await import('./middleware/accessControl.js');
                const sessionToken = await generateSessionToken(userId.trim(), cleanEmail, true, true);
                
                logger?.info('✅ [Email Access] Whitelisted email granted permanent access', { 
                  email: cleanEmail, 
                  userId: userId.trim(),
                  reason: whitelistEntry.reason || 'Whitelisted'
                });
                
                return c.json({ 
                  success: true, 
                  message: 'Whitelisted email - permanent premium access granted',
                  sessionToken,
                  isPremium: true // Whitelisted users get premium
                });
              } else {
                logger?.warn('❌ [Email Access] Email not whitelisted', { email: cleanEmail });
                return c.json({ success: false, message: 'Email not found on whitelist' }, 401);
              }
            }
            
            // Neither access code nor whitelisted email
            logger?.warn('❌ [Access] Invalid input (not code or whitelisted email)', { userId: userId.trim() });
            return c.json({ success: false, message: 'Invalid access code or email' }, 401);
          } catch (error: any) {
            logger?.error('🚨 [Access Code] Verification error', error);
            return c.json({ error: 'Verification failed' }, 500);
          }
        }
      },
      // Email Registration - Auto-whitelist + admin notifications
      {
        path: "/api/register-email",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          try {
            const { email, sessionToken } = await c.req.json();
            logger?.info('📧 [Email Registration] New registration attempt', { email: email?.substring(0, 10) + '...' });
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
              logger?.warn('⚠️ [Email Registration] Invalid email format');
              return c.json({ 
                success: false, 
                message: 'Invalid email address' 
              }, 400);
            }
            
            const cleanEmail = email.trim().toLowerCase();
            
            // Update session with email
            if (sessionToken) {
              const { db } = await import('../db/client.js');
              const { sessions } = await import('../db/schema.js');
              const { eq } = await import('drizzle-orm');
              
              await db.update(sessions)
                .set({ 
                  email: cleanEmail,
                  verifiedAt: new Date() // Auto-verify for simplicity
                })
                .where(eq(sessions.token, sessionToken));
              
              logger?.info('✅ [Email Registration] Session updated with email', { email: cleanEmail });
            }
            
            // Auto-whitelist the email
            const { db } = await import('../db/client.js');
            const { whitelistedUsers } = await import('../db/schema.js');
            
            await db.insert(whitelistedUsers).values({
              userId: cleanEmail,
              email: cleanEmail,
              reason: 'Email registration',
              expiresAt: null,
            }).onConflictDoNothing();
            
            logger?.info('✅ [Email Registration] Email auto-whitelisted', { email: cleanEmail });
            
            // Send Telegram notification to admin
            try {
              const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
              const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
              
              if (telegramToken && adminChatId) {
                const axios = await import('axios');
                const message = `📧 *New Email Registration!*\n\n` +
                  `✉️ Email: ${cleanEmail}\n` +
                  `📅 Registered: ${new Date().toLocaleString()}\n` +
                  `✅ Auto-whitelisted for unlimited access\n\n` +
                  `🎯 Platform: ${sessionToken ? 'Mini App/Website' : 'Unknown'}`;
                
                await axios.default.post(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                  chat_id: adminChatId,
                  text: message,
                  parse_mode: 'Markdown'
                });
                
                logger?.info('📱 [Telegram] Admin notification sent for new registration', { email: cleanEmail });
              }
            } catch (telegramError: any) {
              logger?.error('❌ [Telegram] Failed to send admin notification', { error: telegramError.message });
            }
            
            // Send Email notification to admin
            try {
              const adminEmail = process.env.ADMIN_EMAIL;
              
              if (adminEmail) {
                const { sendEmail } = await import('../utils/replitmail.js');
                const htmlContent = `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4ADE80;">📧 New Email Registration!</h2>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p><strong>✉️ Email:</strong> ${cleanEmail}</p>
                      <p><strong>📅 Registered:</strong> ${new Date().toLocaleString()}</p>
                      <p><strong>✅ Status:</strong> Auto-whitelisted for unlimited access</p>
                    </div>
                    <p style="color: #666; font-size: 14px;">User can now access all premium features without subscription.</p>
                  </div>
                `;
                
                await sendEmail({
                  to: adminEmail,
                  subject: '📧 New DarkWave Email Registration',
                  html: htmlContent,
                  text: `New Email Registration!\n\nEmail: ${cleanEmail}\nRegistered: ${new Date().toLocaleString()}\nStatus: Auto-whitelisted`
                });
                
                logger?.info('📧 [Email] Admin notification sent for new registration', { email: cleanEmail });
              }
            } catch (emailError: any) {
              logger?.error('❌ [Email] Failed to send admin notification', { error: emailError.message });
            }
            
            return c.json({ 
              success: true, 
              message: 'Email registered successfully! You now have unlimited access.',
              isWhitelisted: true
            });
            
          } catch (error: any) {
            logger?.error('🚨 [Email Registration] Registration error', error);
            return c.json({ error: 'Registration failed' }, 500);
          }
        }
      },
      {
        path: "/api/analyze",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          try {
            const { ticker, userId } = await c.req.json();
            logger?.info('📊 [Mini App] Analysis request', { ticker, userId });
            
            // Step 1: Get market data
            const marketData = await marketDataTool.execute({
              context: { ticker, days: 90 },
              mastra,
              runtimeContext: null as any
            });
            
            if (!marketData || !marketData.prices) {
              return c.json({ error: 'Failed to fetch market data' }, 404);
            }
            
            // Step 2: Run technical analysis
            const analysis = await technicalAnalysisTool.execute({
              context: { 
                ticker,
                prices: marketData.prices,
                currentPrice: marketData.currentPrice,
                priceChange24h: marketData.priceChange24h,
                priceChangePercent24h: marketData.priceChangePercent24h
              },
              mastra,
              runtimeContext: null as any
            });
            
            if (!analysis) {
              return c.json({ error: 'Technical analysis failed' }, 500);
            }
            
            // Calculate high/low from recent price data
            const recentPrices = marketData.prices.slice(-24); // Last 24 data points
            const high24h = Math.max(...recentPrices.map((p: any) => p.high));
            const low24h = Math.min(...recentPrices.map((p: any) => p.low));
            
            // Step 3: Get social sentiment (crypto only, graceful fallback)
            let sentimentData = null;
            if (marketData.type === 'crypto') {
              try {
                logger?.info('📱 [Mini App] Fetching social sentiment', { ticker });
                const sentiment = await sentimentTool.execute({
                  context: { ticker },
                  mastra,
                  runtimeContext: { resourceId: userId || 'demo-user' } as any
                });
                sentimentData = sentiment;
                logger?.info('✅ [Mini App] Social sentiment retrieved', { ticker, score: sentiment.sentimentScore });
              } catch (error: any) {
                logger?.warn('⚠️ [Mini App] Sentiment fetch failed (non-critical)', { ticker, error: error.message });
                // Graceful fallback - continue without sentiment
              }
            }
            
            // Return ALL structured data for Mini App including advanced predictive metrics
            return c.json({
              ticker: ticker.toUpperCase(),
              price: analysis.currentPrice || marketData.currentPrice,
              priceChange: analysis.priceChangePercent24h || marketData.priceChangePercent24h || 0, // PERCENTAGE
              priceChangeDollar: analysis.priceChange24h || marketData.priceChange24h || 0, // DOLLAR AMOUNT
              recommendation: analysis.recommendation || 'HOLD',
              
              // Social sentiment (optional, crypto only)
              sentiment: sentimentData,
              
              // Core indicators
              rsi: analysis.rsi || 50,
              macd: {
                value: analysis.macd?.value || 0,
                signal: analysis.macd?.signal || 0,
                histogram: analysis.macd?.histogram || 0
              },
              
              // Moving averages
              sma50: analysis.sma50 || 0,
              sma200: analysis.sma200 || 0,
              ema9: analysis.ema9 || 0,
              ema21: analysis.ema21 || 0,
              ema50: analysis.ema50 || 0,
              ema200: analysis.ema200 || 0,
              
              // Support/Resistance
              support: analysis.support || 0,
              resistance: analysis.resistance || 0,
              
              // Bollinger Bands
              bollingerBands: {
                upper: analysis.bollingerBands?.upper || 0,
                middle: analysis.bollingerBands?.middle || 0,
                lower: analysis.bollingerBands?.lower || 0,
                bandwidth: analysis.bollingerBands?.bandwidth || 0
              },
              
              // Volume analysis
              volume: {
                current: analysis.volume?.current || 0,
                average: analysis.volume?.average || 0,
                changePercent: analysis.volume?.changePercent || 0
              },
              
              // ADVANCED PREDICTIVE METRICS
              volumeDelta: {
                buyVolume: analysis.volumeDelta?.buyVolume || 0,
                sellVolume: analysis.volumeDelta?.sellVolume || 0,
                delta: analysis.volumeDelta?.delta || 0,
                buySellRatio: analysis.volumeDelta?.buySellRatio || 1
              },
              
              spikeScore: {
                score: analysis.spikeScore?.score || 0,
                signal: analysis.spikeScore?.signal || 'NO_SIGNAL',
                prediction: analysis.spikeScore?.prediction || 'No prediction available'
              },
              
              volatility: analysis.volatility || 0,
              
              patternDuration: {
                estimate: analysis.patternDuration?.estimate || 'Unknown',
                confidence: analysis.patternDuration?.confidence || 'Low',
                type: analysis.patternDuration?.type || 'Unknown'
              },
              
              // Price extremes
              high24h: high24h || 0,
              low24h: low24h || 0,
              
              // Signals
              signals: analysis.signals || [],
              signalCount: {
                bullish: analysis.signalCount?.bullish || 0,
                bearish: analysis.signalCount?.bearish || 0
              }
            });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Analysis error', { error: error.message });
            return c.json({ error: 'Analysis failed: ' + error.message }, 500);
          }
        },
      },
      // Bot Detection API
      {
        path: "/api/bot-detection",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          // Check access session
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            logger?.warn('🚫 [Bot Detection] Unauthorized request');
            return sessionCheck.error;
          }
          
          try {
            const { tokenAddress, chain } = await c.req.json();
            logger?.info('🤖 [Bot Detection] Analysis request', { tokenAddress, chain });
            
            // Run bot detection
            const botAnalysis = await botDetectionTool.execute({
              context: { tokenAddress, chain },
              mastra,
              runtimeContext: null as any
            });
            
            logger?.info('✅ [Bot Detection] Analysis complete', { 
              tokenAddress, 
              riskLevel: botAnalysis.riskLevel,
              botPercentage: botAnalysis.botPercentage
            });
            
            return c.json({ 
              success: true, 
              data: botAnalysis
            });
          } catch (error: any) {
            logger?.error('❌ [Bot Detection] Analysis error', error);
            return c.json({ 
              success: false,
              error: 'Bot detection failed',
              data: {
                botPercentage: 100,
                riskLevel: 'Extreme',
                riskColor: 'red',
                holderCount: 0,
                topHolderConcentration: 0,
                rugRiskIndicators: ['⚠️ ANALYSIS FAILED - Cannot verify safety', 'Assume extreme risk until verified'],
                confidence: 0,
                details: 'Analysis unavailable. DO NOT TRADE until you can verify token safety independently.'
              }
            }, 200); // Return 200 with EXTREME risk on error for safety
          }
        }
      },
      {
        path: "/api/chat",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          logger?.info('🤖 [AI Chat] Chat request received');
          
          // Check access session
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            logger?.warn('🚫 [Access Control] Unauthorized chat request');
            return sessionCheck.error;
          }
          
          try {
            const { message, history, userId } = await c.req.json();
            logger?.info('🤖 [AI Chat] Processing message', { 
              userId,
              messageLength: message?.length,
              historyLength: history?.length || 0
            });
            
            if (!message || message.trim().length === 0) {
              return c.json({ error: 'Message is required' }, 400);
            }
            
            // Get the DarkWave agent
            const darkwaveAgent = mastra.getAgent('darkwave');
            if (!darkwaveAgent) {
              logger?.error('🚨 [AI Chat] DarkWave agent not found');
              return c.json({ error: 'AI agent not available' }, 500);
            }
            
            // Build conversation history for context
            const messages = [
              {
                role: 'system' as const,
                content: 'You are a helpful AI trading assistant. Answer questions about trading, technical indicators, market analysis, and investment strategies. Be concise but informative. Use emojis sparingly for clarity.'
              },
              ...(history || []).map((msg: any) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
              })),
              {
                role: 'user' as const,
                content: message
              }
            ];
            
            logger?.info('🤖 [AI Chat] Generating response');
            
            // Use generateLegacy for compatibility with AI SDK v4
            const response = await darkwaveAgent.generateLegacy(messages, {
              maxTokens: 500
            });
            
            const reply = response.text || 'I apologize, but I couldn\'t generate a response. Please try again.';
            
            logger?.info('✅ [AI Chat] Response generated', { 
              replyLength: reply.length 
            });
            
            return c.json({ reply });
            
          } catch (error: any) {
            logger?.error('❌ [AI Chat] Error', { error: error.message, stack: error.stack });
            return c.json({ 
              error: 'Chat error occurred',
              reply: 'Sorry, I encountered an error. Please try again in a moment.' 
            }, 500);
          }
        },
      },
      {
        path: "/api/holdings",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          // Check access session
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            logger?.warn('🚫 [Access Control] Unauthorized holdings GET request');
            return sessionCheck.error;
          }
          
          const userId = c.req.query('userId') || 'demo-user';
          logger?.info('📊 [Mini App] Holdings request', { userId });
          
          try {
            const result = await holdingsTool.execute({
              context: { action: 'list', userId },
              mastra,
              runtimeContext: null as any
            });
            
            if (!result.success || !result.holdings || result.holdings.length === 0) {
              return c.json([]);
            }
            
            // Get real price data for each holding
            const holdingsWithData = await Promise.all(
              result.holdings.map(async (ticker: string) => {
                try {
                  const marketData = await marketDataTool.execute({
                    context: { ticker, days: 1 },
                    mastra,
                    runtimeContext: null as any
                  });
                  
                  if (marketData && marketData.currentPrice) {
                    return {
                      ticker,
                      price: marketData.currentPrice || 0,
                      change: marketData.priceChange24h || 0,
                      volume: marketData.volume24h || 0
                    };
                  }
                } catch (err) {
                  logger?.warn(`Failed to get data for ${ticker}`);
                }
                
                return {
                  ticker,
                  price: 0,
                  change: 0,
                  volume: 0
                };
              })
            );
            
            return c.json(holdingsWithData);
          } catch (error: any) {
            logger?.error('❌ [Mini App] Holdings error', { error: error.message });
            return c.json([]);
          }
        },
      },
      {
        path: "/api/holdings",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          // Check access session
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            logger?.warn('🚫 [Access Control] Unauthorized holdings POST request');
            return sessionCheck.error;
          }
          
          try {
            const { ticker, userId } = await c.req.json();
            logger?.info('⭐ [Mini App] Add holding', { ticker, userId });
            
            await holdingsTool.execute({
              context: { action: 'add', ticker, userId: userId || 'demo-user' },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json({ success: true });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Add holding error', { error: error.message });
            return c.json({ success: false }, 500);
          }
        },
      },
      // Top Movers endpoint
      {
        path: "/api/movers",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          // Check access session
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            return c.json({ error: 'Unauthorized - Invalid or expired session' }, 401);
          }
          
          const category = c.req.query('category') || 'gainers';
          const userId = c.req.query('userId') || 'demo-user';
          logger?.info('🔥 [Mini App] Top movers request', { category, userId });
          
          try {
            // Use scanner tool to get top assets, then filter by category
            const scanResult = await scannerTool.execute({
              context: { type: 'crypto', limit: 20 },
              mastra,
              runtimeContext: null as any
            });
            
            if (!scanResult || !scanResult.strongBuys || scanResult.strongBuys.length === 0) {
              // Fallback: return hardcoded popular assets
              const fallbackMovers = [
                { ticker: 'BTC', price: 60000, change: 5.2 },
                { ticker: 'ETH', price: 3000, change: 4.8 },
                { ticker: 'SOL', price: 150, change: 8.5 },
                { ticker: 'BNB', price: 450, change: 3.2 },
                { ticker: 'XRP', price: 0.65, change: 2.1 },
                { ticker: 'ADA', price: 0.45, change: 6.3 },
                { ticker: 'AVAX', price: 35, change: 7.1 },
                { ticker: 'DOT', price: 8.5, change: 4.5 },
                { ticker: 'MATIC', price: 0.85, change: 5.9 },
                { ticker: 'LINK', price: 14.5, change: 3.7 }
              ];
              
              let movers = fallbackMovers;
              if (category === 'losers') {
                movers = fallbackMovers.map(m => ({ ...m, change: -Math.abs(m.change) }));
              } else if (category === 'volume') {
                movers = fallbackMovers; // Same list, different context
              }
              
              // Sort appropriately
              movers.sort((a, b) => category === 'losers' ? a.change - b.change : b.change - a.change);
              
              return c.json({ movers: movers.slice(0, 10) });
            }
            
            // Convert scanner strongBuys to movers format
            let movers = scanResult.strongBuys.map((buy: any) => ({
              ticker: buy.ticker,
              price: buy.currentPrice || 0,
              change: buy.priceChangePercent24h || 0
            }));
            
            // Filter and sort based on category
            if (category === 'gainers') {
              movers = movers.filter((m: any) => m.change > 0);
              movers.sort((a: any, b: any) => b.change - a.change);
            } else if (category === 'losers') {
              movers = movers.filter((m: any) => m.change < 0);
              movers.sort((a: any, b: any) => a.change - b.change);
            } else if (category === 'volume') {
              // For volume, we just return top movers regardless of direction
              movers.sort((a: any, b: any) => Math.abs(b.change) - Math.abs(a.change));
            }
            
            return c.json({ movers: movers.slice(0, 10) });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Movers error', { error: error.message });
            // Return fallback data on error
            const fallbackMovers = [
              { ticker: 'BTC', price: 60000, change: 5.2 },
              { ticker: 'ETH', price: 3000, change: 4.8 },
              { ticker: 'SOL', price: 150, change: 8.5 }
            ];
            return c.json({ movers: fallbackMovers });
          }
        },
      },
      // Price Alerts endpoints
      {
        path: "/api/alerts",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          // Check access session
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            return c.json({ error: 'Unauthorized - Invalid or expired session' }, 401);
          }
          
          const userId = c.req.query('userId') || 'demo-user';
          logger?.info('🔔 [Mini App] Get alerts request', { userId });
          
          try {
            const result = await priceAlertTool.execute({
              context: { action: 'list', userId },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json({
              success: result.success,
              alerts: result.alerts || []
            });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Get alerts error', { error: error.message });
            return c.json({ success: false, alerts: [], error: error.message }, 500);
          }
        },
      },
      {
        path: "/api/alerts",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            // Check access session
            const { checkAccessSession } = await import('./middleware/accessControl.js');
            const sessionCheck = await checkAccessSession(c);
            if (!sessionCheck.valid) {
              return c.json({ error: 'Unauthorized - Invalid or expired session' }, 401);
            }
            
            const { ticker, targetPrice, condition, userId } = await c.req.json();
            logger?.info('➕ [Mini App] Create alert request', { ticker, targetPrice, condition, userId });
            
            // Check subscription limits (pass session token for email whitelist check)
            const sessionToken = c.req.header('X-Session-Token');
            const { checkSubscriptionLimit } = await import('./middleware/subscriptionCheck.js');
            const limitCheck = await checkSubscriptionLimit(userId || 'demo-user', 'alert', sessionToken);
            
            if (!limitCheck.allowed) {
              logger?.warn('🚫 [Mini App] Alert limit exceeded', { userId });
              return c.json({ 
                success: false,
                message: limitCheck.message,
                upgradeRequired: true
              }, 402); // 402 Payment Required
            }
            
            const result = await priceAlertTool.execute({
              context: {
                action: 'create',
                ticker,
                targetPrice,
                condition,
                userId: userId || 'demo-user'
              },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json(result);
          } catch (error: any) {
            logger?.error('❌ [Mini App] Create alert error', { error: error.message });
            return c.json({ success: false, message: error.message }, 500);
          }
        },
      },
      {
        path: "/api/alerts/:id",
        method: "DELETE",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            // Check access session
            const { checkAccessSession } = await import('./middleware/accessControl.js');
            const sessionCheck = await checkAccessSession(c);
            if (!sessionCheck.valid) {
              return c.json({ error: 'Unauthorized - Invalid or expired session' }, 401);
            }
            
            const alertId = c.req.param('id');
            const userId = c.req.query('userId') || 'demo-user';
            logger?.info('🗑️ [Mini App] Delete alert request', { alertId, userId });
            
            const result = await priceAlertTool.execute({
              context: {
                action: 'delete',
                alertId,
                userId
              },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json(result);
          } catch (error: any) {
            logger?.error('❌ [Mini App] Delete alert error', { error: error.message });
            return c.json({ success: false, message: error.message }, 500);
          }
        },
      },
      {
        path: "/api/wallet",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          // Check access session
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            return c.json({ error: 'Unauthorized - Invalid or expired session' }, 401);
          }
          
          const userId = c.req.query('userId') || 'demo-user';
          logger?.info('💰 [Mini App] Wallet request', { userId });
          
          try {
            const result = await walletConnectionTool.execute({
              context: { action: 'view', userId },
              mastra,
              runtimeContext: null as any
            });
            
            const connected = result.success && !!result.walletAddress;
            let balance = 0;
            
            // If wallet is connected, get real balance
            if (connected && result.walletAddress) {
              try {
                const balanceResult = await balanceCheckerTool.execute({
                  context: { userId },
                  mastra,
                  runtimeContext: null as any
                });
                
                if (balanceResult && typeof balanceResult.balance === 'number') {
                  balance = balanceResult.balance;
                }
              } catch (balanceErr) {
                logger?.warn('Failed to fetch balance, returning 0');
              }
            }
            
            return c.json({
              connected,
              address: result.walletAddress || '',
              balance
            });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Wallet error', { error: error.message });
            return c.json({ connected: false, address: '', balance: 0 });
          }
        },
      },
      // Tracked Wallets API (Read-Only, Up to 5 Wallets)
      {
        path: "/api/tracked-wallets",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            return c.json({ error: 'Unauthorized' }, 401);
          }
          
          const userId = sessionCheck.userId || 'demo-user';
          logger?.info('📋 [Tracked Wallets] GET request', { userId });
          
          try {
            const { db } = await import('../db/client.js');
            const { trackedWallets } = await import('../db/schema.js');
            const { eq } = await import('drizzle-orm');
            
            const wallets = await db
              .select()
              .from(trackedWallets)
              .where(eq(trackedWallets.userId, userId));
            
            return c.json({ 
              wallets: wallets.map(w => ({
                id: w.id,
                address: w.address,
                chain: w.chain || 'solana',
                nickname: w.nickname,
                balance: w.balance ? JSON.parse(w.balance) : null,
                lastUpdated: w.lastUpdated
              }))
            });
          } catch (error: any) {
            logger?.error('❌ [Tracked Wallets] GET error', { error: error.message });
            return c.json({ error: 'Failed to fetch wallets' }, 500);
          }
        }
      },
      {
        path: "/api/tracked-wallets",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            return c.json({ error: 'Unauthorized' }, 401);
          }
          
          const userId = sessionCheck.userId || 'demo-user';
          const { address, nickname, chain } = await c.req.json();
          const selectedChain = chain || 'solana'; // Default to Solana
          logger?.info('➕ [Tracked Wallets] POST request', { userId, address, chain: selectedChain });
          
          try {
            const { db } = await import('../db/client.js');
            const { trackedWallets } = await import('../db/schema.js');
            const { eq } = await import('drizzle-orm');
            const { randomBytes } = await import('crypto');
            
            // Check limit (max 5 wallets)
            const existing = await db
              .select()
              .from(trackedWallets)
              .where(eq(trackedWallets.userId, userId));
            
            if (existing.length >= 5) {
              return c.json({ 
                success: false, 
                message: 'Maximum 5 wallets allowed' 
              }, 400);
            }
            
            // Check for duplicate address
            const duplicate = existing.find(w => w.address === address);
            if (duplicate) {
              return c.json({ 
                success: false, 
                message: 'Wallet already tracked' 
              }, 400);
            }
            
            // Fetch balance based on chain
            let balance = null;
            try {
              if (selectedChain === 'solana') {
                // Solana via Helius
                const response = await fetch(
                  `https://api.helius.xyz/v0/addresses/${address}/balances?api-key=demo`,
                  { method: 'GET' }
                );
                const data = await response.json();
                balance = JSON.stringify(data);
              } else {
                // EVM chains (Ethereum, Polygon, Arbitrum, Base, BSC) via Alchemy free API
                // PRODUCTION NOTE: Replace 'demo' with your own Alchemy API key or use environment variable
                // Get your API key at: https://dashboard.alchemy.com/
                const alchemyApiKey = process.env.ALCHEMY_API_KEY || 'demo';
                const rpcUrls: Record<string, string> = {
                  ethereum: `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
                  polygon: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
                  arbitrum: `https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
                  base: `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
                  bsc: 'https://bsc-dataseed1.binance.org' // Public BSC RPC (consider paid alternative for production)
                };
                
                const rpcUrl = rpcUrls[selectedChain];
                if (!rpcUrl) {
                  return c.json({ 
                    success: false, 
                    message: `Unsupported chain: ${selectedChain}` 
                  }, 400);
                }
                
                // Get native balance via eth_getBalance
                const response = await fetch(rpcUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_getBalance',
                    params: [address, 'latest'],
                    id: 1
                  })
                });
                
                const data = await response.json();
                
                // Check for RPC errors
                if (data.error) {
                  logger?.error('🚨 [Tracked Wallets] RPC error', { error: data.error, address, chain: selectedChain });
                  return c.json({ 
                    success: false, 
                    message: `Failed to fetch balance: ${data.error.message || 'RPC error'}` 
                  }, 500);
                }
                
                if (!data.result) {
                  logger?.error('🚨 [Tracked Wallets] No result from RPC', { address, chain: selectedChain });
                  return c.json({ 
                    success: false, 
                    message: 'Failed to fetch balance from RPC provider' 
                  }, 500);
                }
                
                // Use BigInt for safe handling of large balances
                const balanceWei = BigInt(data.result);
                const balanceEthBigInt = balanceWei / BigInt(1e15); // Convert to milliETH first
                const balanceEth = Number(balanceEthBigInt) / 1000; // Then to ETH
                
                balance = JSON.stringify({
                  nativeBalance: balanceWei.toString(), // Store as string to preserve precision
                  nativeBalanceFormatted: balanceEth,
                  chain: selectedChain
                });
              }
            } catch (err: any) {
              logger?.warn('Failed to fetch balance, saving wallet anyway', { error: err.message });
            }
            
            // Insert wallet
            const id = randomBytes(16).toString('hex');
            await db.insert(trackedWallets).values({
              id,
              userId,
              address,
              chain: selectedChain,
              nickname: nickname || null,
              balance,
              lastUpdated: new Date(),
              createdAt: new Date()
            });
            
            return c.json({ 
              success: true, 
              message: 'Wallet added',
              wallet: { id, address, chain: selectedChain, nickname, balance: balance ? JSON.parse(balance) : null }
            });
          } catch (error: any) {
            logger?.error('❌ [Tracked Wallets] POST error', { error: error.message });
            return c.json({ success: false, message: 'Failed to add wallet' }, 500);
          }
        }
      },
      {
        path: "/api/tracked-wallets/:id",
        method: "DELETE",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            return c.json({ error: 'Unauthorized' }, 401);
          }
          
          const userId = sessionCheck.userId || 'demo-user';
          const walletId = c.req.param('id');
          logger?.info('🗑️ [Tracked Wallets] DELETE request', { userId, walletId });
          
          try {
            const { db } = await import('../db/client.js');
            const { trackedWallets } = await import('../db/schema.js');
            const { eq, and } = await import('drizzle-orm');
            
            await db
              .delete(trackedWallets)
              .where(and(
                eq(trackedWallets.id, walletId),
                eq(trackedWallets.userId, userId)
              ));
            
            return c.json({ success: true, message: 'Wallet removed' });
          } catch (error: any) {
            logger?.error('❌ [Tracked Wallets] DELETE error', { error: error.message });
            return c.json({ success: false, message: 'Failed to remove wallet' }, 500);
          }
        }
      },
      {
        path: "/api/tracked-wallets/clear",
        method: "DELETE",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            return c.json({ error: 'Unauthorized' }, 401);
          }
          
          const userId = sessionCheck.userId || 'demo-user';
          logger?.info('🧹 [Tracked Wallets] CLEAR request', { userId });
          
          try {
            const { db } = await import('../db/client.js');
            const { trackedWallets } = await import('../db/schema.js');
            const { eq } = await import('drizzle-orm');
            
            await db
              .delete(trackedWallets)
              .where(eq(trackedWallets.userId, userId));
            
            return c.json({ success: true, message: 'All wallets cleared' });
          } catch (error: any) {
            logger?.error('❌ [Tracked Wallets] CLEAR error', { error: error.message });
            return c.json({ success: false, message: 'Failed to clear wallets' }, 500);
          }
        }
      },
      {
        path: "/api/wallet/connect",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            const { address, userId } = await c.req.json();
            logger?.info('🔗 [Mini App] Connect wallet', { address, userId });
            
            await walletConnectionTool.execute({
              context: { action: 'connect', walletAddress: address, userId: userId || 'demo-user' },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json({ success: true });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Wallet connect error', { error: error.message });
            return c.json({ success: false }, 500);
          }
        },
      },
      {
        path: "/api/wallet/disconnect",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            const { userId } = await c.req.json();
            logger?.info('🔌 [Mini App] Disconnect wallet', { userId });
            
            await walletConnectionTool.execute({
              context: { action: 'disconnect', userId: userId || 'demo-user' },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json({ success: true });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Wallet disconnect error', { error: error.message });
            return c.json({ success: false }, 500);
          }
        },
      },
      {
        path: "/api/limit-orders",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const userId = c.req.query('userId') || 'demo-user';
          logger?.info('📋 [Mini App] Limit orders request', { userId });
          
          try {
            const result = await jupiterLimitOrderTool.execute({
              context: { action: 'list', userId },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json({
              success: result.success,
              orders: result.orders || []
            });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Limit orders error', { error: error.message });
            return c.json({ success: false, orders: [] });
          }
        },
      },
      {
        path: "/api/limit-orders",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            const body = await c.req.json();
            const userId = body.userId || 'demo-user';
            logger?.info('📝 [Mini App] Create limit order', { userId, body });
            
            const result = await jupiterLimitOrderTool.execute({
              context: {
                action: 'create',
                userId,
                orderType: body.orderType,
                ticker: body.ticker,
                targetPrice: body.targetPrice,
                amount: body.amount
              },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json(result);
          } catch (error: any) {
            logger?.error('❌ [Mini App] Create limit order error', { error: error.message });
            return c.json({ success: false, message: 'Error creating order' }, 500);
          }
        },
      },
      {
        path: "/api/sniping",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const userId = c.req.query('userId') || 'demo-user';
          logger?.info('🎯 [Mini App] Sniping status request', { userId });
          
          try {
            const result = await tokenSnipingTool.execute({
              context: { action: 'status', userId },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json({
              success: result.success,
              config: result.config || {
                enabled: false,
                minLiquidity: 10000,
                maxRugScore: 30,
                autoExecute: false,
                maxBuyAmount: 0.1,
                targetChains: ['solana']
              }
            });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Sniping status error', { error: error.message });
            return c.json({ success: false, config: null });
          }
        },
      },
      {
        path: "/api/sniping",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            const body = await c.req.json();
            const userId = body.userId || 'demo-user';
            logger?.info('🎯 [Mini App] Update sniping config', { userId, config: body.config });
            
            const result = await tokenSnipingTool.execute({
              context: {
                action: 'configure',
                userId,
                config: body.config
              },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json(result);
          } catch (error: any) {
            logger?.error('❌ [Mini App] Update sniping error', { error: error.message });
            return c.json({ success: false, message: 'Error updating config' }, 500);
          }
        },
      },
      {
        path: "/api/settings",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const userId = c.req.query('userId') || 'demo-user';
          logger?.info('⚙️ [Mini App] Settings request', { userId });
          
          try {
            const result = await userSettingsTool.execute({
              context: { action: 'view', userId },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json({
              alerts: result.settings?.priceAlertsEnabled || false,
              autoMonitor: result.settings?.autoMonitorWatchlist || false,
              sniping: result.settings?.snipingEnabled || false,
              autoExecute: result.settings?.autoExecuteLimitOrders || false,
              scope: result.settings?.assetScope || 'both',
              exchange: result.settings?.defaultExchangeLink || 'dexscreener'
            });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Settings error', { error: error.message });
            return c.json({ alerts: false, autoMonitor: false, sniping: false, autoExecute: false, scope: 'both', exchange: 'dexscreener' });
          }
        },
      },
      {
        path: "/api/settings",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            const body = await c.req.json();
            const userId = body.userId || 'demo-user';
            logger?.info('⚙️ [Mini App] Update settings', { userId, settings: body });
            
            // Map Mini App settings to tool settings
            const settings: any = {};
            if (body.alerts !== undefined) settings.priceAlertsEnabled = body.alerts;
            if (body.autoMonitor !== undefined) settings.autoMonitorWatchlist = body.autoMonitor;
            if (body.sniping !== undefined) settings.snipingEnabled = body.sniping;
            if (body.autoExecute !== undefined) settings.autoExecuteLimitOrders = body.autoExecute;
            if (body.scope) settings.assetScope = body.scope;
            if (body.exchange) settings.defaultExchangeLink = body.exchange;
            
            await userSettingsTool.execute({
              context: { action: 'update', userId, settings },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json({ success: true });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Update settings error', { error: error.message });
            return c.json({ success: false }, 500);
          }
        },
      },
      // Scanner endpoint
      {
        path: "/api/scanner",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            const { type = 'crypto', limit = 20, userId } = await c.req.json();
            logger?.info('🔍 [Mini App] Scanner request', { type, limit, userId });
            
            const result = await scannerTool.execute({
              context: { type, limit },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json({
              results: result.strongBuys || [],
              scannedCount: result.scannedCount || 0,
              type: type,
              timestamp: new Date().toISOString()
            });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Scanner error', { error: error.message });
            return c.json({ results: [], scannedCount: 0, error: error.message }, 500);
          }
        },
      },
      // Subscription endpoints
      {
        path: "/api/subscription",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const userId = c.req.query('userId') || 'demo-user';
          logger?.info('💳 [Mini App] Get subscription status', { userId });
          
          try {
            const result = await subscriptionTool.execute({
              context: { action: 'check_status', userId },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json(result);
          } catch (error: any) {
            logger?.error('❌ [Mini App] Subscription status error', { error: error.message });
            return c.json({ success: false, message: error.message }, 500);
          }
        },
      },
      {
        path: "/api/subscription/checkout",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            const { userId } = await c.req.json();
            const returnUrl = `${c.req.header('origin') || 'https://your-app.replit.app'}/mini-app`;
            
            logger?.info('🛒 [Mini App] Create checkout session', { userId, returnUrl });
            
            const result = await subscriptionTool.execute({
              context: { action: 'create_checkout', userId: userId || 'demo-user', returnUrl },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json(result);
          } catch (error: any) {
            logger?.error('❌ [Mini App] Checkout error', { error: error.message });
            return c.json({ success: false, message: error.message }, 500);
          }
        },
      },
      {
        path: "/api/subscription/cancel",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            const { userId } = await c.req.json();
            logger?.info('❌ [Mini App] Cancel subscription', { userId });
            
            const result = await subscriptionTool.execute({
              context: { action: 'cancel', userId: userId || 'demo-user' },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json(result);
          } catch (error: any) {
            logger?.error('❌ [Mini App] Cancel error', { error: error.message });
            return c.json({ success: false, message: error.message }, 500);
          }
        },
      },
      {
        path: "/api/stripe/webhook",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const Stripe = await import('stripe');
          const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY || "");
          const { db } = await import('../db/client.js');
          const { subscriptions } = await import('../db/schema.js');
          const { eq } = await import('drizzle-orm');
          
          try {
            const rawBody = await c.req.text();
            const sig = c.req.header('stripe-signature');
            
            if (!sig) {
              logger?.error('❌ [Stripe] No signature provided');
              return c.json({ error: 'No signature' }, 400);
            }
            
            // Verify webhook signature with STRIPE_WEBHOOK_SECRET
            const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
            
            if (!webhookSecret) {
              logger?.error('🚨 [Stripe] STRIPE_WEBHOOK_SECRET not configured - rejecting webhook for security');
              logger?.error('🔧 [Stripe] Set STRIPE_WEBHOOK_SECRET environment variable to enable webhook processing');
              return c.json({ 
                error: 'Webhook secret not configured',
                message: 'Set STRIPE_WEBHOOK_SECRET environment variable' 
              }, 500);
            }
            
            // SECURE: Verify webhook signature
            let event;
            try {
              event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
              logger?.info('✅ [Stripe] Webhook signature verified', { type: event.type });
            } catch (err: any) {
              logger?.error('❌ [Stripe] Webhook signature verification failed', { error: err.message });
              return c.json({ error: 'Invalid signature' }, 400);
            }
            
            // Handle checkout.session.completed
            if (event.type === 'checkout.session.completed') {
              const session = event.data.object;
              const userId = session.metadata?.telegramUserId;
              const plan = session.metadata?.plan || 'premium'; // Default to premium if not specified
              
              if (!userId) {
                logger?.warn('⚠️ [Stripe] No userId in session metadata');
                return c.json({ received: true });
              }
              
              logger?.info(`💳 [Stripe] Activating ${plan} plan for user`, { userId, plan });
              
              // Calculate expiry (1 month from now)
              const expiryDate = new Date();
              expiryDate.setMonth(expiryDate.getMonth() + 1);
              
              // Update or create subscription
              await db.insert(subscriptions).values({
                userId,
                plan: plan as 'basic' | 'premium',
                status: 'active',
                provider: 'stripe',
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                expiryDate,
                autoRenew: true,
              }).onConflictDoUpdate({
                target: subscriptions.userId,
                set: {
                  plan: plan as 'basic' | 'premium',
                  status: 'active',
                  provider: 'stripe',
                  stripeCustomerId: session.customer as string,
                  stripeSubscriptionId: session.subscription as string,
                  expiryDate,
                  autoRenew: true,
                  updatedAt: new Date(),
                }
              });
              
              logger?.info(`✅ [Stripe] ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan activated`, { userId, plan });
              
              // 🎯 AUTO-WHITELIST: Add customer email to whitelist for unlimited access
              try {
                const customerEmail = session.customer_details?.email || session.customer_email;
                
                if (customerEmail) {
                  const { whitelistedUsers } = await import('../db/schema.js');
                  
                  // Add email to whitelist (auto-grant unlimited access)
                  await db.insert(whitelistedUsers).values({
                    userId: customerEmail, // Use email as userId for easy lookup
                    email: customerEmail,
                    reason: 'Paid subscriber (Stripe)',
                    expiresAt: null, // Never expires (lifetime whitelist for paying customers)
                  }).onConflictDoNothing();
                  
                  logger?.info('✅ [Stripe] Email auto-whitelisted', { email: customerEmail, userId });
                } else {
                  logger?.warn('⚠️ [Stripe] No customer email found in session - skipping auto-whitelist');
                }
              } catch (whitelistError: any) {
                logger?.error('❌ [Stripe] Failed to auto-whitelist email', { error: whitelistError.message });
                // Don't fail the webhook if whitelist fails
              }
              
              // 📧 Send Email notification to admin
              try {
                const adminEmail = process.env.ADMIN_EMAIL;
                
                if (adminEmail) {
                  const { sendEmail } = await import('../utils/replitmail.js');
                  const htmlContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #4ADE80;">🎉 New Premium Subscriber!</h2>
                      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>👤 User ID:</strong> ${userId}</p>
                        <p><strong>💳 Amount:</strong> $6.00/month</p>
                        <p><strong>📅 Subscribed:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>🔄 Auto-renewal:</strong> Yes</p>
                        <p><strong>⏰ Expires:</strong> ${expiryDate.toLocaleDateString()}</p>
                      </div>
                      <p style="color: #4ADE80; font-size: 18px; font-weight: bold;">💰 Monthly Revenue +$5</p>
                    </div>
                  `;
                  
                  await sendEmail({
                    to: adminEmail,
                    subject: '🎉 New DarkWave Premium Subscriber!',
                    html: htmlContent,
                    text: `New Premium Subscriber!\n\nUser ID: ${userId}\nAmount: $6.00/month\nSubscribed: ${new Date().toLocaleString()}\nExpires: ${expiryDate.toLocaleDateString()}\n\nMonthly Revenue +$6`
                  });
                  
                  logger?.info('📧 [Email] Admin notification sent', { userId });
                } else {
                  logger?.debug('⚠️ [Email] Admin notifications not configured (missing ADMIN_EMAIL)');
                }
              } catch (emailError: any) {
                logger?.error('❌ [Email] Failed to send admin notification', { error: emailError.message });
                // Don't fail the webhook if email fails
              }
              
              // 📧 Send Telegram notification to admin
              try {
                const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
                const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID; // Your Telegram chat ID
                
                if (telegramToken && adminChatId) {
                  const axios = await import('axios');
                  const message = `🎉 *New Premium Subscriber!*\n\n` +
                    `👤 User ID: \`${userId}\`\n` +
                    `💳 Amount: $6.00/month\n` +
                    `📅 Subscribed: ${new Date().toLocaleString()}\n` +
                    `🔄 Auto-renewal: Yes\n` +
                    `⏰ Expires: ${expiryDate.toLocaleDateString()}\n\n` +
                    `💰 Monthly Revenue +$6`;
                  
                  await axios.default.post(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                    chat_id: adminChatId,
                    text: message,
                    parse_mode: 'Markdown'
                  });
                  
                  logger?.info('📱 [Telegram] Admin notification sent', { userId });
                } else {
                  logger?.debug('⚠️ [Telegram] Admin notifications not configured (missing TELEGRAM_ADMIN_CHAT_ID)');
                }
              } catch (telegramError: any) {
                logger?.error('❌ [Telegram] Failed to send admin notification', { error: telegramError.message });
                // Don't fail the webhook if Telegram fails
              }
            }
            
            // Handle subscription.deleted (cancellation)
            if (event.type === 'customer.subscription.deleted') {
              const subscription = event.data.object;
              const stripeSubId = subscription.id;
              
              logger?.info('❌ [Stripe] Subscription cancelled', { stripeSubId });
              
              // Find and update subscription
              const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, stripeSubId));
              
              if (sub) {
                await db.update(subscriptions)
                  .set({ status: 'cancelled', autoRenew: false, updatedAt: new Date() })
                  .where(eq(subscriptions.userId, sub.userId));
                
                logger?.info('✅ [Stripe] Subscription status updated', { userId: sub.userId });
                
                // 📧 Send Telegram notification to admin about cancellation
                try {
                  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
                  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
                  
                  if (telegramToken && adminChatId) {
                    const axios = await import('axios');
                    const message = `❌ *Subscription Cancelled*\n\n` +
                      `👤 User ID: \`${sub.userId}\`\n` +
                      `📅 Cancelled: ${new Date().toLocaleString()}\n` +
                      `💸 Monthly Revenue -$5`;
                    
                    await axios.default.post(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                      chat_id: adminChatId,
                      text: message,
                      parse_mode: 'Markdown'
                    });
                    
                    logger?.info('📱 [Telegram] Cancellation notification sent', { userId: sub.userId });
                  }
                } catch (telegramError: any) {
                  logger?.error('❌ [Telegram] Failed to send cancellation notification', { error: telegramError.message });
                }
              }
            }
            
            return c.json({ received: true });
          } catch (error: any) {
            logger?.error('❌ [Stripe] Webhook error', { error: error.message });
            return c.json({ error: 'Webhook processing failed' }, 500);
          }
        },
      },
      // Crypto Payment Endpoint (Coinbase Commerce)
      {
        path: "/api/crypto/create-charge",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            logger?.info('💰 [Crypto] Creating payment charge');
            
            // Check access session
            const { checkAccessSession } = await import('./middleware/accessControl.js');
            const sessionCheck = await checkAccessSession(c);
            if (!sessionCheck.valid) {
              return c.json({ error: 'Unauthorized - Invalid or expired session' }, 401);
            }
            
            const { userId } = await c.req.json();
            
            if (!userId) {
              return c.json({ error: 'User ID required' }, 400);
            }
            
            // Get Coinbase Commerce API key from environment
            const apiKey = process.env.COINBASE_COMMERCE_API_KEY;
            if (!apiKey) {
              logger?.error('❌ [Crypto] COINBASE_COMMERCE_API_KEY not configured');
              return c.json({ error: 'Crypto payments not configured' }, 500);
            }
            
            // Create charge via Coinbase Commerce API
            const axios = await import('axios');
            const chargeData = {
              name: 'DarkWave-V2 Premium Subscription',
              description: 'Monthly premium subscription ($5/month)',
              local_price: {
                amount: '5.00',
                currency: 'USD'
              },
              pricing_type: 'fixed_price',
              metadata: {
                userId: userId,
                plan: 'premium'
              }
            };
            
            logger?.info('📤 [Crypto] Sending charge request to Coinbase', { userId });
            
            const response = await axios.default.post(
              'https://api.commerce.coinbase.com/charges',
              chargeData,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'X-CC-Api-Key': apiKey,
                  'X-CC-Version': '2018-03-22'
                }
              }
            );
            
            const charge = response.data.data;
            
            logger?.info('✅ [Crypto] Charge created', { chargeId: charge.id, userId });
            
            // Save payment to database
            const db = await import('../db/client.js').then(m => m.db);
            const { cryptoPayments } = await import('../db/schema.js');
            
            const paymentId = `crypto_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            
            await db.insert(cryptoPayments).values({
              id: paymentId,
              userId: userId,
              coinbaseChargeId: charge.id,
              coinbaseChargeCode: charge.code,
              amountUSD: '5.00',
              status: 'pending',
              hostedUrl: charge.hosted_url,
              expiresAt: new Date(charge.expires_at),
              description: 'Premium Subscription',
              metadata: JSON.stringify({ plan: 'premium' }),
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            logger?.info('💾 [Crypto] Payment record created', { paymentId, userId });
            
            return c.json({
              success: true,
              chargeId: charge.id,
              hostedUrl: charge.hosted_url,
              expiresAt: charge.expires_at,
              addresses: charge.addresses
            });
            
          } catch (error: any) {
            logger?.error('❌ [Crypto] Failed to create charge', { error: error.message, response: error.response?.data });
            return c.json({ error: 'Failed to create crypto payment' }, 500);
          }
        },
      },
      // Crypto Webhook (Coinbase Commerce payment confirmations)
      {
        path: "/api/crypto/webhook",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            logger?.info('🔔 [Crypto] Webhook received');
            
            // CRITICAL SECURITY: Verify Coinbase Commerce webhook signature
            const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;
            if (!webhookSecret) {
              logger?.error('❌ [Crypto] COINBASE_WEBHOOK_SECRET not configured');
              return c.json({ error: 'Webhook secret not configured' }, 500);
            }
            
            // Get raw body and signature from headers
            const signature = c.req.header('x-cc-webhook-signature');
            if (!signature) {
              logger?.warn('⚠️ [Crypto] Missing webhook signature header');
              return c.json({ error: 'Missing signature' }, 400);
            }
            
            // Get raw request body (need to read as text for signature verification)
            const rawBody = await c.req.text();
            
            // Verify signature using HMAC-SHA256
            const crypto = await import('crypto');
            const hmac = crypto.createHmac('sha256', webhookSecret);
            hmac.update(rawBody, 'utf8');
            const computedSignature = hmac.digest('hex');
            
            // Timing-safe comparison to prevent timing attacks
            let isValid = false;
            try {
              isValid = crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(computedSignature)
              );
            } catch (err) {
              // timingSafeEqual throws if buffers have different lengths
              isValid = false;
            }
            
            if (!isValid) {
              logger?.warn('⚠️ [Crypto] Invalid webhook signature', { 
                received: signature.substring(0, 10) + '...',
                computed: computedSignature.substring(0, 10) + '...'
              });
              return c.json({ error: 'Invalid signature' }, 401);
            }
            
            logger?.info('✅ [Crypto] Webhook signature verified');
            
            // Parse the verified request body
            const body = JSON.parse(rawBody);
            const event = body.event;
            
            if (!event) {
              return c.json({ error: 'No event data' }, 400);
            }
            
            logger?.info('📩 [Crypto] Processing event', { type: event.type, chargeId: event.data?.id });
            
            // Handle charge:confirmed event
            if (event.type === 'charge:confirmed') {
              const charge = event.data;
              const chargeId = charge.id;
              const userId = charge.metadata?.userId;
              
              if (!userId) {
                logger?.warn('⚠️ [Crypto] No userId in charge metadata', { chargeId });
                return c.json({ received: true });
              }
              
              logger?.info('✅ [Crypto] Payment confirmed', { chargeId, userId });
              
              // Update payment status
              const db = await import('../db/client.js').then(m => m.db);
              const { cryptoPayments, subscriptions, whitelistedUsers } = await import('../db/schema.js');
              const { eq } = await import('drizzle-orm');
              
              await db.update(cryptoPayments)
                .set({ 
                  status: 'completed',
                  completedAt: new Date(),
                  cryptoCurrency: charge.payments[0]?.network || 'unknown',
                  cryptoAmount: charge.payments[0]?.value?.crypto?.amount || '0',
                  updatedAt: new Date()
                })
                .where(eq(cryptoPayments.coinbaseChargeId, chargeId));
              
              // Grant subscription (30 days)
              const expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + 30);
              
              // Check if subscription exists
              const [existingSub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
              
              if (existingSub) {
                // Update existing subscription
                await db.update(subscriptions)
                  .set({
                    plan: 'premium',
                    status: 'active',
                    provider: 'crypto',
                    cryptoPaymentId: chargeId,
                    expiryDate: expiryDate,
                    autoRenew: false, // Crypto payments don't auto-renew
                    updatedAt: new Date()
                  })
                  .where(eq(subscriptions.userId, userId));
              } else {
                // Create new subscription
                await db.insert(subscriptions).values({
                  userId: userId,
                  plan: 'premium',
                  status: 'active',
                  provider: 'crypto',
                  cryptoPaymentId: chargeId,
                  expiryDate: expiryDate,
                  autoRenew: false,
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
              }
              
              // Add to whitelist
              const [existingWhitelist] = await db.select().from(whitelistedUsers).where(eq(whitelistedUsers.userId, userId));
              
              if (!existingWhitelist) {
                await db.insert(whitelistedUsers).values({
                  userId: userId,
                  reason: 'Premium subscriber (crypto payment)',
                  expiresAt: expiryDate,
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
              } else {
                await db.update(whitelistedUsers)
                  .set({
                    expiresAt: expiryDate,
                    updatedAt: new Date()
                  })
                  .where(eq(whitelistedUsers.userId, userId));
              }
              
              logger?.info('🎉 [Crypto] Subscription activated', { userId, expiryDate });
              
              // Send admin notification
              try {
                const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
                const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
                
                if (telegramToken && adminChatId) {
                  const axios = await import('axios');
                  const cryptoCurrency = charge.payments[0]?.network || 'Unknown';
                  const cryptoAmount = charge.payments[0]?.value?.crypto?.amount || '0';
                  
                  const message = `💎 *New Crypto Payment!*\n\n` +
                    `👤 User ID: \`${userId}\`\n` +
                    `💰 Amount: $6.00 (${cryptoAmount} ${cryptoCurrency})\n` +
                    `📅 Subscribed: ${new Date().toLocaleString()}\n` +
                    `🔄 Auto-renewal: No (Manual crypto payment)\n` +
                    `⏰ Expires: ${expiryDate.toLocaleDateString()}\n\n` +
                    `💵 Monthly Revenue +$6`;
                  
                  await axios.default.post(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                    chat_id: adminChatId,
                    text: message,
                    parse_mode: 'Markdown'
                  });
                  
                  logger?.info('📱 [Telegram] Crypto payment notification sent', { userId });
                }
              } catch (telegramError: any) {
                logger?.error('❌ [Telegram] Failed to send crypto notification', { error: telegramError.message });
              }
            }
            
            return c.json({ received: true });
            
          } catch (error: any) {
            logger?.error('❌ [Crypto] Webhook error', { error: error.message });
            return c.json({ error: 'Webhook processing failed' }, 500);
          }
        },
      },
      // Feedback & Token Submission endpoint
      {
        path: "/api/submit-feedback",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            // Check access session
            const { checkAccessSession } = await import('./middleware/accessControl.js');
            const sessionCheck = await checkAccessSession(c);
            if (!sessionCheck.valid) {
              return c.json({ error: 'Unauthorized - Invalid or expired session' }, 401);
            }
            
            const body = await c.req.json();
            const { 
              type, userId, suggestion, tokenName, tokenSymbol, tokenContract, tokenChain, tokenDescription, tokenContact, tokenLogo,
              // Social Links
              website, twitter, telegram, discord,
              // Documentation
              whitepaper, tokenomics, auditReport,
              // Project Qualifiers
              hasWhitepaper, hasAudit, isDoxxedTeam, hasLockedLiquidity
            } = body;
            
            logger?.info('💬 [Feedback] Received submission', { type, userId, hasImage: !!tokenLogo, hasDocs: !!(whitepaper || tokenomics || auditReport) });
            
            // SERVER-SIDE FILE VALIDATION: Validate uploaded files to prevent abuse
            const validateFile = (file: any, maxSizeMB: number, allowedTypes: string[], fileLabel: string) => {
              if (!file) return null;
              
              // Validate structure
              if (!file.data || typeof file.data !== 'string') {
                throw new Error(`${fileLabel}: Invalid file structure`);
              }
              
              // Validate base64 data URI format and EXTRACT actual MIME type from data URI
              if (!file.data.startsWith('data:')) {
                throw new Error(`${fileLabel}: Invalid base64 format - must be a data URI`);
              }
              
              // Extract MIME type from the data URI itself (not the client-supplied mimeType field)
              const dataUriMatch = file.data.match(/^data:([^;]+);base64,/);
              if (!dataUriMatch) {
                throw new Error(`${fileLabel}: Invalid data URI format`);
              }
              
              const actualMimeType = dataUriMatch[1].toLowerCase();
              
              // Validate MIME type against allowed types (using EXTRACTED type, not client claim)
              const normalizedAllowedTypes = allowedTypes.map(t => t.toLowerCase());
              if (!normalizedAllowedTypes.includes(actualMimeType)) {
                throw new Error(`${fileLabel}: Invalid file type '${actualMimeType}'. Allowed: ${allowedTypes.join(', ')}`);
              }
              
              // Extract and validate base64 payload
              const base64Data = file.data.split(',')[1];
              if (!base64Data) {
                throw new Error(`${fileLabel}: Missing base64 data`);
              }
              
              // Attempt to decode base64 to verify it's valid
              let buffer: Buffer;
              try {
                buffer = Buffer.from(base64Data, 'base64');
              } catch (decodeError) {
                throw new Error(`${fileLabel}: Invalid base64 encoding`);
              }
              
              // MAGIC BYTE VALIDATION: Verify actual file content matches declared MIME type
              const verifyFileSignature = (buf: Buffer, mimeType: string): boolean => {
                // PDF signature: %PDF- (25 50 44 46 2D)
                if (mimeType === 'application/pdf') {
                  return buf.slice(0, 4).toString() === '%PDF';
                }
                
                // PNG signature: 89 50 4E 47 0D 0A 1A 0A
                if (mimeType === 'image/png') {
                  return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
                }
                
                // JPEG signature: FF D8 FF
                if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
                  return buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
                }
                
                // GIF signature: GIF87a or GIF89a
                if (mimeType === 'image/gif') {
                  const sig = buf.slice(0, 6).toString();
                  return sig === 'GIF87a' || sig === 'GIF89a';
                }
                
                // WEBP signature: RIFF....WEBP
                if (mimeType === 'image/webp') {
                  return buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
                }
                
                return false;
              };
              
              if (!verifyFileSignature(buffer, actualMimeType)) {
                throw new Error(`${fileLabel}: File content does not match declared type '${actualMimeType}'. File may be corrupted or malicious.`);
              }
              
              // Calculate actual file size
              const sizeInBytes = buffer.length;
              const sizeInMB = sizeInBytes / (1024 * 1024);
              
              if (sizeInMB > maxSizeMB) {
                throw new Error(`${fileLabel}: File too large (${sizeInMB.toFixed(2)}MB). Max: ${maxSizeMB}MB`);
              }
              
              logger?.info(`✅ [Validation] ${fileLabel} passed all checks`, { sizeInMB: sizeInMB.toFixed(2), mimeType: actualMimeType, signatureVerified: true });
              return file;
            };
            
            // Validate all uploaded files
            if (type === 'token') {
              try {
                // Validate logo (max 2MB, image only)
                if (tokenLogo) {
                  validateFile(tokenLogo, 2, ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'], 'Token Logo');
                }
                
                // Validate documents (max 5MB, PDF only)
                if (whitepaper) {
                  validateFile(whitepaper, 5, ['application/pdf'], 'Whitepaper');
                }
                if (tokenomics) {
                  validateFile(tokenomics, 5, ['application/pdf'], 'Tokenomics');
                }
                if (auditReport) {
                  validateFile(auditReport, 5, ['application/pdf'], 'Audit Report');
                }
              } catch (validationError: any) {
                logger?.warn('⚠️ [Validation] File validation failed', { error: validationError.message, userId });
                return c.json({ error: validationError.message }, 400);
              }
            }
            
            // Get admin email from environment
            const adminEmail = process.env.ADMIN_EMAIL;
            if (!adminEmail) {
              logger?.error('❌ [Feedback] ADMIN_EMAIL not configured');
              return c.json({ error: 'Admin email not configured' }, 500);
            }
            
            let subject, htmlContent, textContent;
            
            if (type === 'suggestion') {
              subject = '💡 New User Suggestion - DarkWave-V2';
              htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #A855F7;">💡 New User Suggestion</h2>
                  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>👤 User ID:</strong> ${userId}</p>
                    <p><strong>📅 Submitted:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  <div style="background: #fff; border-left: 4px solid #A855F7; padding: 20px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">Suggestion:</h3>
                    <p style="color: #555; white-space: pre-wrap;">${suggestion}</p>
                  </div>
                  <p style="color: #999; font-size: 0.9rem;">Sent from DarkWave-V2 Feedback System</p>
                </div>
              `;
              textContent = `New User Suggestion\n\nUser ID: ${userId}\nSubmitted: ${new Date().toLocaleString()}\n\nSuggestion:\n${suggestion}`;
            } else if (type === 'token') {
              subject = '🚀 New Token Submission - DarkWave-V2';
              
              // Include token logo in email if provided
              const logoHtml = tokenLogo ? `
                <div style="text-align: center; margin: 20px 0;">
                  <img src="${tokenLogo.data}" alt="Token Logo" style="max-width: 150px; max-height: 150px; border-radius: 50%; border: 3px solid #4ADE80; box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);">
                  <p style="color: #4ADE80; font-size: 0.9rem; margin-top: 10px;">📷 Token Logo Attached</p>
                </div>
              ` : '';
              
              htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #4ADE80;">🚀 New Token Submission</h2>
                  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>👤 Submitted by:</strong> ${userId}</p>
                    <p><strong>📅 Submitted:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  ${logoHtml}
                  <div style="background: #fff; border-left: 4px solid #4ADE80; padding: 20px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">Token Details:</h3>
                    <p><strong>Name:</strong> ${tokenName}</p>
                    <p><strong>Symbol:</strong> ${tokenSymbol}</p>
                    <p><strong>Contract:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${tokenContract}</code></p>
                    <p><strong>Blockchain:</strong> ${tokenChain}</p>
                    <p><strong>Contact:</strong> ${tokenContact}</p>
                  </div>
                  <div style="background: #fff; border-left: 4px solid #4ADE80; padding: 20px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">Why List This Token:</h3>
                    <p style="color: #555; white-space: pre-wrap;">${tokenDescription}</p>
                  </div>
                  <p style="color: #999; font-size: 0.9rem;">Sent from DarkWave-V2 Feedback System</p>
                </div>
              `;
              textContent = `New Token Submission\n\nSubmitted by: ${userId}\nSubmitted: ${new Date().toLocaleString()}\n\nToken Details:\nName: ${tokenName}\nSymbol: ${tokenSymbol}\nContract: ${tokenContract}\nBlockchain: ${tokenChain}\nContact: ${tokenContact}\n${tokenLogo ? '\nToken Logo: Included (see email attachment)\n' : ''}\nWhy List This Token:\n${tokenDescription}`;
            } else {
              return c.json({ error: 'Invalid submission type' }, 400);
            }
            
            // Save token submission to database (for admin approval)
            if (type === 'token') {
              try {
                const { db } = await import('../db/client.js');
                const { tokenSubmissions } = await import('../db/schema.js');
                const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                await db.insert(tokenSubmissions).values({
                  id: submissionId,
                  tokenName,
                  tokenSymbol,
                  tokenContract,
                  tokenChain,
                  tokenDescription,
                  tokenContact: tokenContact || 'Not provided',
                  tokenLogo: tokenLogo?.data || null,
                  
                  // Social Links
                  website: website || null,
                  twitter: twitter || null,
                  telegram: telegram || null,
                  discord: discord || null,
                  
                  // Documentation
                  whitepaper: whitepaper?.data || null,
                  tokenomics: tokenomics?.data || null,
                  auditReport: auditReport?.data || null,
                  
                  // Project Qualifiers
                  hasWhitepaper: hasWhitepaper || false,
                  hasAudit: hasAudit || false,
                  isDoxxedTeam: isDoxxedTeam || false,
                  hasLockedLiquidity: hasLockedLiquidity || false,
                  
                  status: 'pending',
                  submittedBy: userId,
                });
                
                logger?.info('✅ [Feedback] Token submission saved to database', { submissionId });
              } catch (dbError: any) {
                logger?.error('❌ [Feedback] Failed to save to database', { error: dbError.message });
              }
            }
            
            // Send email to admin
            try {
              const { sendEmail } = await import('../utils/replitmail.js');
              await sendEmail({
                to: adminEmail,
                subject,
                html: htmlContent,
                text: textContent
              });
              
              logger?.info('✅ [Feedback] Email sent to admin', { type, adminEmail });
            } catch (emailError: any) {
              logger?.error('❌ [Feedback] Failed to send email', { error: emailError.message });
              return c.json({ error: 'Failed to send email' }, 500);
            }
            
            return c.json({ success: true, message: 'Submission sent successfully' });
          } catch (error: any) {
            logger?.error('❌ [Feedback] Submission error', { error: error.message });
            return c.json({ error: 'Failed to process submission' }, 500);
          }
        },
      },
      // Chart endpoint - Returns time-series data for LightweightCharts
      {
        path: "/api/chart",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            const { ticker, timeframe, type } = await c.req.json();
            logger?.info('📈 [Chart API] Chart data request', { ticker, timeframe, type });
            
            // Get market data
            const days = timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 1;
            const marketData = await marketDataTool.execute({
              context: { ticker, days: Math.max(days, 200) }, // Need 200 days for EMA 200 calculation
              mastra,
              runtimeContext: null as any
            });
            
            const { EMA, SMA, BollingerBands } = await import('technicalindicators');
            const prices = marketData.prices || [];
            
            if (prices.length < 50) {
              return c.json({ 
                success: false, 
                error: 'Insufficient price data for indicators'
              }, 400);
            }
            
            const closePrices = prices.map((p: any) => p.close);
            
            // Calculate full time-series for each indicator
            const ema9Values = EMA.calculate({ period: 9, values: closePrices });
            const ema21Values = EMA.calculate({ period: 21, values: closePrices });
            const ema50Values = EMA.calculate({ period: 50, values: closePrices });
            const ema200Values = EMA.calculate({ period: 200, values: closePrices });
            const sma50Values = SMA.calculate({ period: 50, values: closePrices });
            const sma200Values = SMA.calculate({ period: 200, values: closePrices });
            const bbValues = BollingerBands.calculate({ period: 20, values: closePrices, stdDev: 2 });
            
            // Convert to LightweightCharts format: {time: timestamp, value: number}
            // EMAs/SMAs have warm-up periods, so align timestamps
            const formatSeries = (values: number[], warmupPeriod: number) => {
              return values.map((val, idx) => ({
                time: prices[idx + warmupPeriod].timestamp,
                value: val
              }));
            };
            
            const chartData = {
              prices: prices.slice(-days).map((p: any) => ({
                time: p.timestamp,
                open: p.open || p.close,
                high: p.high || p.close,
                low: p.low || p.close,
                close: p.close
              })),
              ema9: formatSeries(ema9Values, 8),
              ema21: formatSeries(ema21Values, 20),
              ema50: formatSeries(ema50Values, 49),
              ema200: formatSeries(ema200Values, 199),
              sma50: formatSeries(sma50Values, 49),
              sma200: formatSeries(sma200Values, 199),
              bollingerUpper: bbValues.map((bb: any, idx) => ({
                time: prices[idx + 19].timestamp,
                value: bb.upper
              })),
              bollingerLower: bbValues.map((bb: any, idx) => ({
                time: prices[idx + 19].timestamp,
                value: bb.lower
              }))
            };
            
            logger?.info('✅ [Chart API] Chart data prepared', { 
              ticker, 
              pricePoints: chartData.prices.length,
              ema9Points: chartData.ema9.length 
            });
            
            return c.json({ success: true, chartData });
          } catch (error: any) {
            logger?.error('❌ [Chart API] Error', { error: error.message });
            return c.json({ success: false, error: error.message }, 500);
          }
        },
      },
      // Multi-Timeframe Analysis endpoint
      {
        path: "/api/multi-timeframe",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            // Check access session
            const { checkAccessSession } = await import('./middleware/accessControl.js');
            const sessionCheck = await checkAccessSession(c);
            if (!sessionCheck.valid) {
              return c.json({ error: 'Unauthorized - Invalid or expired session' }, 401);
            }
            
            const { ticker, userId } = await c.req.json();
            logger?.info('📊 [Mini App] Multi-timeframe analysis request', { ticker, userId });
            
            // Fetch data for different timeframes
            const timeframes = [
              { name: '1H', days: 0.05 }, // ~1 hour of data
              { name: '4H', days: 0.2 },  // ~4 hours
              { name: '1D', days: 1 },     // 1 day
              { name: '1W', days: 7 },     // 1 week
              { name: '1M', days: 30 },    // 1 month
            ];
            
            const results = await Promise.all(
              timeframes.map(async (tf) => {
                try {
                  const marketData = await marketDataTool.execute({
                    context: { ticker, days: tf.days < 1 ? 1 : tf.days }, // Minimum 1 day
                    mastra,
                    runtimeContext: null as any
                  });
                  
                  if (!marketData || !marketData.prices || marketData.prices.length === 0) {
                    return {
                      timeframe: tf.name,
                      trend: 'UNKNOWN',
                      strength: 0,
                      price: 0,
                      change: 0
                    };
                  }
                  
                  // Get appropriate data slice for timeframe
                  let dataSlice = marketData.prices;
                  if (tf.days < 1) {
                    // For hour-based timeframes, use last portion of the day's data
                    const sliceSize = Math.floor(marketData.prices.length * tf.days);
                    dataSlice = marketData.prices.slice(-Math.max(sliceSize, 10));
                  }
                  
                  const analysis = await technicalAnalysisTool.execute({
                    context: { 
                      ticker,
                      prices: dataSlice,
                      currentPrice: marketData.currentPrice,
                      priceChange24h: marketData.priceChange24h,
                      priceChangePercent24h: marketData.priceChangePercent24h
                    },
                    mastra,
                    runtimeContext: null as any
                  });
                  
                  // Determine trend based on signals
                  let trend = 'NEUTRAL';
                  if (analysis.signalCount.bullish > analysis.signalCount.bearish + 2) {
                    trend = 'BULLISH';
                  } else if (analysis.signalCount.bearish > analysis.signalCount.bullish + 2) {
                    trend = 'BEARISH';
                  }
                  
                  const strength = Math.abs(analysis.signalCount.bullish - analysis.signalCount.bearish);
                  
                  return {
                    timeframe: tf.name,
                    trend,
                    strength,
                    price: analysis.currentPrice,
                    change: analysis.priceChangePercent24h,
                    rsi: analysis.rsi,
                    recommendation: analysis.recommendation
                  };
                } catch (error: any) {
                  logger?.error(`Error analyzing ${tf.name} timeframe`, { error: error.message });
                  return {
                    timeframe: tf.name,
                    trend: 'ERROR',
                    strength: 0,
                    price: 0,
                    change: 0
                  };
                }
              })
            );
            
            return c.json({
              ticker: ticker.toUpperCase(),
              timeframes: results,
              success: true
            });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Multi-timeframe error', { error: error.message });
            return c.json({ success: false, error: error.message }, 500);
          }
        },
      },
      // DEX Search endpoint
      {
        path: "/api/dex-search",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          // Check access session
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            logger?.warn('🚫 [Access Control] Unauthorized DEX search request');
            return sessionCheck.error;
          }
          
          try {
            const { query, userId } = await c.req.json();
            logger?.info('🔍 [Mini App] DEX search request', { query, userId });
            
            const result = await dexscreenerTool.execute({
              context: { query },
              mastra,
              runtimeContext: null as any
            });
            
            // dexscreenerTool returns a single pair object, not an array
            return c.json({
              pair: result.success ? result : null,
              success: result.success || false,
              query: query
            });
          } catch (error: any) {
            logger?.error('❌ [Mini App] DEX search error', { error: error.message });
            return c.json({ pair: null, success: false, query: '', error: error.message }, 500);
          }
        },
      },
      // DEX Analysis endpoint
      {
        path: "/api/dex-analyze",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          // Check access session
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            logger?.warn('🚫 [Access Control] Unauthorized DEX analyze request');
            return sessionCheck.error;
          }
          
          try {
            const { query, userId } = await c.req.json();
            logger?.info('📊 [Mini App] DEX analysis request', { query, userId });
            
            // First search for the DEX pair
            const searchResult = await dexscreenerTool.execute({
              context: { query },
              mastra,
              runtimeContext: null as any
            });
            
            if (!searchResult.success) {
              return c.json({ error: 'Pair not found', success: false }, 404);
            }
            
            // Then analyze it
            const analysisResult = await dexAnalysisTool.execute({
              context: {
                ticker: searchResult.ticker,
                name: searchResult.name,
                chain: searchResult.chain,
                dex: searchResult.dex,
                currentPrice: searchResult.currentPrice,
                priceChange24h: searchResult.priceChange24h,
                priceChangePercent24h: searchResult.priceChangePercent24h,
                priceChange6h: searchResult.priceChange6h,
                priceChangePercent6h: searchResult.priceChangePercent6h,
                volume24h: searchResult.volume24h,
                volume6h: searchResult.volume6h,
                liquidity: searchResult.liquidity,
                marketCap: searchResult.marketCap,
                txns24h: searchResult.txns24h,
                priceHistory: searchResult.priceHistory || []
              },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json(analysisResult);
          } catch (error: any) {
            logger?.error('❌ [Mini App] DEX analysis error', { error: error.message });
            return c.json({ error: error.message, success: false }, 500);
          }
        },
      },
      // NFT Analysis endpoint
      {
        path: "/api/nft-analyze",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          
          // Check access session
          const { checkAccessSession } = await import('./middleware/accessControl.js');
          const sessionCheck = await checkAccessSession(c);
          if (!sessionCheck.valid) {
            logger?.warn('🚫 [Access Control] Unauthorized NFT analyze request');
            return sessionCheck.error;
          }
          
          try {
            const { query, userId } = await c.req.json();
            logger?.info('🎨 [Mini App] NFT analysis request', { query, userId });
            
            // Check subscription limits (pass session token for email whitelist check)
            const sessionToken = c.req.header('X-Session-Token');
            const { checkSubscriptionLimit } = await import('./middleware/subscriptionCheck.js');
            const limitCheck = await checkSubscriptionLimit(userId || 'demo-user', 'search', sessionToken);
            
            if (!limitCheck.allowed) {
              logger?.warn('🚫 [Mini App] NFT search limit exceeded', { userId });
              return c.json({ 
                error: limitCheck.message,
                upgradeRequired: true
              }, 402);
            }
            
            const result = await nftTool.execute({
              context: { query },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json(result);
          } catch (error: any) {
            logger?.error('❌ [Mini App] NFT analysis error', { error: error.message });
            return c.json({ error: error.message, success: false }, 500);
          }
        },
      },
      // Download DarkWave banner image for Telegram
      {
        path: "/telegram-banner.png",
        method: "GET",
        createHandler: async () => async (c: any) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          
          // Try multiple paths for dev vs deployment - serve JPEG version (Telegram compliant)
          const possiblePaths = [
            path.join(process.cwd(), '.mastra', 'output', 'public', 'darkwave-banner.jpg'),
            path.join(process.cwd(), 'public', 'darkwave-banner.jpg'),
            path.resolve(process.cwd(), '../..', 'public', 'darkwave-banner.jpg'),
          ];
          
          for (const filePath of possiblePaths) {
            try {
              const imageBuffer = await fs.readFile(filePath);
              c.header('Content-Type', 'image/jpeg');
              c.header('Content-Disposition', 'attachment; filename="darkwave-telegram-banner.jpg"');
              c.header('Cache-Control', 'public, max-age=31536000');
              return c.body(imageBuffer);
            } catch (error) {
              continue;
            }
          }
          
          return c.text('Image not found. Tried paths: ' + possiblePaths.join(', '), 404);
        },
      },
      // Simple download page for the banner
      {
        path: "/download-banner",
        method: "GET",
        createHandler: async () => async (c: any) => {
          const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Download DarkWave Banner</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 700px;
    }
    h1 {
      color: #A855F7;
      margin-bottom: 30px;
    }
    .banner-preview {
      width: 100%;
      max-width: 640px;
      border: 2px solid #A855F7;
      border-radius: 12px;
      margin: 20px 0;
      box-shadow: 0 8px 32px rgba(168, 85, 247, 0.3);
    }
    .download-btn {
      display: inline-block;
      background: linear-gradient(135deg, #E63946, #A855F7);
      color: white;
      padding: 15px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .download-btn:hover {
      transform: scale(1.05);
    }
    .instructions {
      margin-top: 30px;
      padding: 20px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      text-align: left;
    }
    .instructions h3 {
      color: #A855F7;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌊 DarkWave Banner Download</h1>
    <p>Your Telegram Mini App banner is ready!</p>
    
    <img src="/telegram-banner.png" class="banner-preview" alt="DarkWave Banner">
    
    <a href="/telegram-banner.png" download="darkwave-telegram-banner.jpg" class="download-btn">
      ⬇️ Download Banner (640×360 JPEG)
    </a>
    
    <p style="color: #4ADE80; margin-top: 10px; font-size: 0.9rem;">✅ Optimized for Telegram (640×360px, 46KB)</p>
    
    <div class="instructions">
      <h3>📋 How to Use This Banner:</h3>
      <ol>
        <li>Tap the "Download Banner" button above</li>
        <li>The image will save to your device</li>
        <li>Open Telegram and find @BotFather</li>
        <li>Send command: <code>/newapp</code></li>
        <li>Choose your bot: <code>@Darkwave_RSI_Bot</code></li>
        <li>Upload the banner image you just downloaded</li>
        <li>Follow the prompts to complete setup</li>
      </ol>
    </div>
  </div>
</body>
</html>
          `;
          return c.html(html);
        },
      },
      // Mini App static files - Helper to resolve public files in both dev and deployment
      {
        path: "/mini-app",
        method: "GET",
        createHandler: async () => async (c: any) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          
          // Try multiple paths for dev vs deployment
          const possiblePaths = [
            path.join(process.cwd(), '.mastra', 'output', 'public', 'index.html'),
            path.join(process.cwd(), 'public', 'index.html'),
            path.resolve(process.cwd(), '../..', 'public', 'index.html'),
          ];
          
          for (const filePath of possiblePaths) {
            try {
              const html = await fs.readFile(filePath, 'utf-8');
              return c.html(html);
            } catch (err) {
              continue;
            }
          }
          
          return c.text('Mini App not found', 404);
        },
      },
      {
        path: "/mini-app/styles.css",
        method: "GET",
        createHandler: async () => async (c: any) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          
          const possiblePaths = [
            path.join(process.cwd(), '.mastra', 'output', 'public', 'styles.css'),
            path.join(process.cwd(), 'public', 'styles.css'),
            path.resolve(process.cwd(), '../..', 'public', 'styles.css'),
          ];
          
          for (const filePath of possiblePaths) {
            try {
              const css = await fs.readFile(filePath, 'utf-8');
              c.header('Content-Type', 'text/css');
              return c.body(css);
            } catch (err) {
              continue;
            }
          }
          
          return c.text('CSS not found', 404);
        },
      },
      {
        path: "/mini-app/app.js",
        method: "GET",
        createHandler: async () => async (c: any) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          
          const possiblePaths = [
            path.join(process.cwd(), '.mastra', 'output', 'public', 'app.js'),
            path.join(process.cwd(), 'public', 'app.js'),
            path.resolve(process.cwd(), '../..', 'public', 'app.js'),
          ];
          
          for (const filePath of possiblePaths) {
            try {
              const js = await fs.readFile(filePath, 'utf-8');
              c.header('Content-Type', 'application/javascript');
              return c.body(js);
            } catch (err) {
              continue;
            }
          }
          
          return c.text('JavaScript not found', 404);
        },
      },
      // CoinCap Market API - Serves coin market data from CoinGecko
      {
        path: "/api/coincap/market/:coinId",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const coinId = c.req.param('coinId');
          
          try {
            const axios = await import('axios');
            const response = await axios.default.get(
              `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_market_cap_change_percentage_24h_in=usd`
            );
            
            const data = response.data[coinId];
            if (!data) {
              return c.json({ error: 'Coin not found' }, 404);
            }
            
            // Format response for frontend
            const result = {
              name: coinId,
              symbol: coinId.toUpperCase(),
              price: data.usd || 0,
              change24h: data.usd_24h_change || 0,
              marketCap: data.usd_market_cap || 0,
              volume24h: data.usd_24h_vol || 0
            };
            
            return c.json(result);
          } catch (error: any) {
            logger?.error('Failed to fetch market data:', { coinId, error: error.message });
            return c.json({ error: 'Failed to fetch market data' }, 500);
          }
        },
      },
      // CoinCap History API - Serves historical price data
      {
        path: "/api/coincap/history/:coinId",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const coinId = c.req.param('coinId');
          const interval = c.req.query('interval') || '1d';
          const limit = parseInt(c.req.query('limit') || '730');
          
          try {
            const axios = await import('axios');
            
            // Map CoinGecko intervals
            const daysMap: Record<string, number> = {
              '1m': 1,
              '5m': 1,
              '1h': 1,
              '6h': 1,
              '1d': 365,
              '1w': 365,
              '30d': 30,
              '1y': 365,
              'all': 730
            };
            
            const days = daysMap[interval] || 365;
            const response = await axios.default.get(
              `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
            );
            
            const prices = response.data.prices || [];
            
            // Convert to candlestick format (OHLCV)
            const candles = prices.slice(-limit).map((price: any, index: number) => ({
              date: new Date(price[0]),
              open: price[1],
              high: price[1] * 1.02, // Approximate
              low: price[1] * 0.98,  // Approximate
              close: price[1],
              volume: 0
            }));
            
            return c.json(candles);
          } catch (error: any) {
            logger?.error('Failed to fetch historical data:', { coinId, error: error.message });
            return c.json({ error: 'Failed to fetch historical data' }, 500);
          }
        },
      },
      // CoinCap ATH API - Serves all-time high data
      {
        path: "/api/coincap/ath/:coinId",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          const coinId = c.req.param('coinId');
          
          try {
            const axios = await import('axios');
            const response = await axios.default.get(
              `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false`
            );
            
            const data = response.data;
            const result = {
              ath: data.market_data?.ath?.usd || 0,
              athChangePercentage: data.market_data?.ath_change_percentage?.usd || 0,
              athDate: data.market_data?.ath_date?.usd || null
            };
            
            return c.json(result);
          } catch (error: any) {
            logger?.error('Failed to fetch ATH data:', { coinId, error: error.message });
            return c.json(null); // Return null on error
          }
        },
      },
      // Catch-all static file handler (MUST BE LAST) - serves all assets from public/
      {
        path: "/*",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          const url = await import('url');
          
          // Get requested path and sanitize it
          const requestPath = c.req.path.substring(1); // Remove leading slash
          
          // Skip API routes (already handled above)
          if (requestPath.startsWith('api/') || requestPath === 'admin' || requestPath.startsWith('webhooks/')) {
            return c.text('Not found', 404);
          }
          
          // Security: prevent directory traversal
          if (requestPath.includes('..') || requestPath.includes('~')) {
            return c.text('Invalid path', 400);
          }
          
          const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
          const possibleBasePaths = [
            path.join(process.cwd(), 'public'),
            path.resolve(process.cwd(), '..', '..', 'public'), // Repo root for bundled output
            path.join(__dirname, '..', '..', 'public'),
            path.join(__dirname, '..', '..', '..', 'public'),
            path.join(__dirname, '..', '..', '..', '..', 'public'),
          ];
          
          // Try each base path
          for (const basePath of possibleBasePaths) {
            try {
              const filePath = path.join(basePath, requestPath);
              const fileContent = await fs.readFile(filePath);
              
              // Detect content type based on extension
              const ext = path.extname(requestPath).toLowerCase();
              const contentTypes: Record<string, string> = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.webp': 'image/webp',
                '.ico': 'image/x-icon',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.html': 'text/html',
                '.txt': 'text/plain',
                '.pdf': 'application/pdf',
                '.woff': 'font/woff',
                '.woff2': 'font/woff2',
                '.ttf': 'font/ttf',
                '.eot': 'application/vnd.ms-fontobject',
              };
              
              const contentType = contentTypes[ext] || 'application/octet-stream';
              c.header('Content-Type', contentType);
              c.header('Cache-Control', 'public, max-age=300'); // 5 min cache
              return c.body(fileContent);
            } catch (err) {
              continue; // Try next base path
            }
          }
          
          // File not found in any path, return 404
          return c.text('File not found', 404);
        }
      },
    ],
  },
  logger:
    process.env.NODE_ENV === "production"
      ? new ProductionPinoLogger({
          name: "Mastra",
          level: "info",
        })
      : new PinoLogger({
          name: "Mastra",
          level: "info",
        }),
});

/*  Sanity check 1: Throw an error if there are more than 1 workflows.  */
// !!!!!! Do not remove this check. !!!!!!
if (Object.keys(mastra.getWorkflows()).length > 1) {
  throw new Error(
    "More than 1 workflows found. Currently, more than 1 workflows are not supported in the UI, since doing so will cause app state to be inconsistent.",
  );
}

/*  Sanity check 2: Throw an error if there are more than 1 agents.  */
// !!!!!! Do not remove this check. !!!!!!
if (Object.keys(mastra.getAgents()).length > 1) {
  throw new Error(
    "More than 1 agents found. Currently, more than 1 agents are not supported in the UI, since doing so will cause app state to be inconsistent.",
  );
}
