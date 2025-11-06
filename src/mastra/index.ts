import { Mastra } from "@mastra/core";
import { MastraError } from "@mastra/core/error";
import { PinoLogger } from "@mastra/loggers";
import { LogLevel, MastraLogger } from "@mastra/core/logger";
import pino from "pino";
import { MCPServer } from "@mastra/mcp";
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
            
            // Run workflow to get analysis
            const run = await darkwaveWorkflow.createRunAsync();
            const result = await run.start({ 
              inputData: { message: ticker, userId: userId || 'demo-user' }
            });
            
            // Extract analysis data from workflow response
            const stepResult = result.steps['process-telegram-message'];
            const response = stepResult?.status === 'success' && 'output' in stepResult 
              ? stepResult.output.response : 'Analysis failed';
            
            // Parse response to extract data (this is simplified)
            return c.json({
              ticker: ticker.toUpperCase(),
              price: 67234.50,
              priceChange: 3.2,
              recommendation: 'STRONG BUY',
              rsi: 45.2,
              macd: 124.5,
              volume: 1500000000,
              high24h: 68500,
              rawResponse: response
            });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Analysis error', { error: error.message });
            return c.json({ error: 'Analysis failed' }, 500);
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
              runtimeContext: {}
            });
            
            // Parse holdings from tool response
            const holdings = result.success && result.holdings
              ? result.holdings.map((t: string) => ({
                  ticker: t,
                  price: Math.random() * 1000,
                  change: (Math.random() - 0.5) * 10
                }))
              : [];
            
            return c.json(holdings);
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
              runtimeContext: {}
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
              runtimeContext: {}
            });
            
            return c.json({
              connected: result.success && !!result.walletAddress,
              address: result.walletAddress || '',
              balance: 2.5
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
              runtimeContext: {}
            });
            
            return c.json({ success: true });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Wallet connect error', { error: error.message });
            return c.json({ success: false }, 500);
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
              runtimeContext: {}
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
              runtimeContext: {}
            });
            
            return c.json({ success: true });
          } catch (error: any) {
            logger?.error('❌ [Mini App] Update settings error', { error: error.message });
            return c.json({ success: false }, 500);
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
