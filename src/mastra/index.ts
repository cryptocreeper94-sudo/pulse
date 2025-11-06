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
    port: 5000,
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
      // Mini App Backend API Routes
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
            
            // Return ALL structured data for Mini App including advanced predictive metrics
            return c.json({
              ticker: ticker.toUpperCase(),
              price: analysis.currentPrice || marketData.currentPrice,
              priceChange: analysis.priceChangePercent24h || marketData.priceChangePercent24h || 0, // PERCENTAGE
              priceChangeDollar: analysis.priceChange24h || marketData.priceChange24h || 0, // DOLLAR AMOUNT
              recommendation: analysis.recommendation || 'HOLD',
              
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
      {
        path: "/api/holdings",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
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
      {
        path: "/api/wallet",
        method: "GET",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
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
      // Chart endpoint
      {
        path: "/api/chart",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
          try {
            const { ticker, userId } = await c.req.json();
            logger?.info('📈 [Mini App] Chart request', { ticker, userId });
            
            // Get market data first
            const marketData = await marketDataTool.execute({
              context: { ticker, days: 90 },
              mastra,
              runtimeContext: null as any
            });
            
            // Get analysis for EMAs
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
            
            // Prepare data for chart
            const prices = marketData.prices.map((p: any) => ({
              timestamp: p.timestamp,
              close: p.close
            }));
            
            // Create EMA arrays (simplified - use last value for all points)
            const ema50 = new Array(prices.length).fill(analysis.ema50);
            const ema200 = new Array(prices.length).fill(analysis.ema200);
            
            const result = await chartGeneratorTool.execute({
              context: { ticker, prices, ema50, ema200 },
              mastra,
              runtimeContext: null as any
            });
            
            return c.json({
              chartUrl: result.chartUrl || '',
              ticker: ticker.toUpperCase(),
              success: result.success || false,
              message: result.message || ''
            });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Chart error', { error: error.message });
            return c.json({ chartUrl: '', ticker: '', success: false, error: error.message }, 500);
          }
        },
      },
      // DEX Search endpoint
      {
        path: "/api/dex-search",
        method: "POST",
        createHandler: async ({ mastra }) => async (c: any) => {
          const logger = mastra.getLogger();
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
      // Mini App static files
      {
        path: "/mini-app",
        method: "GET",
        createHandler: async () => async (c: any) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          const html = await fs.readFile(path.join(process.cwd(), 'public', 'index.html'), 'utf-8');
          return c.html(html);
        },
      },
      {
        path: "/styles.css",
        method: "GET",
        createHandler: async () => async (c: any) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          const css = await fs.readFile(path.join(process.cwd(), 'public', 'styles.css'), 'utf-8');
          c.header('Content-Type', 'text/css');
          return c.body(css);
        },
      },
      {
        path: "/app.js",
        method: "GET",
        createHandler: async () => async (c: any) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          const js = await fs.readFile(path.join(process.cwd(), 'public', 'app.js'), 'utf-8');
          c.header('Content-Type', 'application/javascript');
          return c.body(js);
        },
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
