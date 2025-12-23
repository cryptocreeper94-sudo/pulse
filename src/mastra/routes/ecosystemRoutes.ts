import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { ecosystemApps } from "../../db/schema.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const PULSE_ECOSYSTEM_METADATA = {
  appName: "DarkWave Pulse",
  category: "DeFi",
  hook: "AI-Powered Trading Intelligence for the Modern Trader",
  valueProposition: `Pulse is a complete turnkey crypto trading business system that combines institutional-grade AI analysis with autonomous trading capabilities. The platform features StrikeAgent, an AI-powered trading bot with four operational modes (Observer, Approval, Semi-Auto, Full-Auto) that enables traders of all skill levels to participate in crypto markets with confidence. Built-in wallet management supports 22+ chains, WebAuthn biometric authentication ensures security, and blockchain-verified predictions provide transparency. With real-time market signals, technical analysis, and a Developer API for custom integrations, Pulse delivers a comprehensive business-in-a-box solution for crypto trading.`,
  keyTags: ["Auto-Trading", "AI Signals", "Multi-Chain", "StrikeAgent"],
  imagePrompt: "Futuristic cryptocurrency trading dashboard, dark mode glassmorphic UI with neon cyan (#00D4FF) and green (#39FF14) accents, real-time candlestick charts with AI prediction overlays, circular confidence gauges showing 65.7% win rate, live trading signals panel displaying SNIPE and WATCH alerts, token price feeds with sparkline charts, glassmorphic cards with subtle glow effects, semi-transparent panels on solid black (#0a0a0a) background, StrikeAgent bot icon with pulsing live indicator, highly detailed modern fintech interface, 8k resolution",
  websiteUrl: "https://pulse.darkwavestudios.io",
};

const ecosystemAppSchema = z.object({
  appName: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  hook: z.string().min(1).max(255),
  valueProposition: z.string().min(1),
  keyTags: z.array(z.string()).max(10).optional(),
  imagePrompt: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  submittedBy: z.string().optional(),
});

function generateApiKey(): string {
  return `orbit_${crypto.randomBytes(32).toString("hex")}`;
}

const ECOSYSTEM_INTEGRATION_SNIPPET = {
  id: "ecosystem-integration-protocol",
  name: "Orbit Ecosystem Integration Protocol",
  language: "markdown",
  category: "integration",
  tags: ["ecosystem", "orbit", "handoff", "api", "documentation"],
  content: `# Orbit Ecosystem Integration Protocol

## Pulse Ecosystem Metadata
**Endpoint**: \`GET /api/ecosystem/pulse\`

## Dev Hub API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| \`/api/ecosystem/pulse\` | GET | Get Pulse's ecosystem metadata |
| \`/api/ecosystem/apps\` | GET | List all approved ecosystem apps |
| \`/api/ecosystem/register\` | POST | Register a new app (returns API key) |
| \`/api/ecosystem/update\` | PUT | Update app data (requires x-api-key header) |
| \`/api/ecosystem/approve/:appId\` | POST | Approve pending app (requires x-admin-key header) |

## Agent Registration
\`\`\`bash
curl -X POST "/api/ecosystem/register" -H "Content-Type: application/json" -d '{
  "appName": "Your App",
  "category": "Enterprise",
  "hook": "5-10 word tagline",
  "valueProposition": "Full description...",
  "keyTags": ["Tag1", "Tag2"],
  "imagePrompt": "Dark mode dashboard...",
  "websiteUrl": "https://...",
  "submittedBy": "agent-name"
}'
\`\`\`

## Required Fields
- appName (string) - Official product name
- category (string) - e.g., Enterprise, DeFi, Automation, Gaming
- hook (string) - 5-10 word punchy tagline
- valueProposition (string) - Full turnkey business description
- keyTags (string[]) - 3-4 keywords (max 10)
- imagePrompt (string) - Text-to-image prompt for dark/glassmorphic UI
- websiteUrl (string) - App URL
`,
  createdAt: "2025-12-20T21:00:00.000Z",
};

export const ecosystemRoutes = [
  {
    path: "/api/ecosystem/snippets",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      return c.json({
        success: true,
        snippets: [ECOSYSTEM_INTEGRATION_SNIPPET],
        count: 1,
      });
    },
  },

  {
    path: "/api/ecosystem/snippets/:snippetId",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const snippetId = c.req.param("snippetId");
      if (snippetId === "ecosystem-integration-protocol") {
        return c.json({
          success: true,
          snippet: ECOSYSTEM_INTEGRATION_SNIPPET,
        });
      }
      return c.json({ success: false, error: "Snippet not found" }, 404);
    },
  },

  {
    path: "/api/ecosystem/pulse",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      return c.json({
        success: true,
        app: PULSE_ECOSYSTEM_METADATA,
        generatedAt: new Date().toISOString(),
      });
    },
  },
  
  {
    path: "/api/ecosystem/apps",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const apps = await db
          .select()
          .from(ecosystemApps)
          .where(eq(ecosystemApps.status, "approved"));

        const allApps = [
          {
            id: "pulse",
            ...PULSE_ECOSYSTEM_METADATA,
            status: "approved",
            isNative: true,
          },
          ...apps.map((app: any) => ({
            id: app.id,
            appName: app.appName,
            category: app.category,
            hook: app.hook,
            valueProposition: app.valueProposition,
            keyTags: app.keyTags || [],
            imagePrompt: app.imagePrompt,
            generatedImageUrl: app.generatedImageUrl,
            websiteUrl: app.websiteUrl,
            status: app.status,
            isNative: false,
          })),
        ];

        return c.json({
          success: true,
          apps: allApps,
          count: allApps.length,
        });
      } catch (error: any) {
        logger?.error("[Ecosystem] Failed to fetch apps:", { error: error.message });
        return c.json({ success: false, error: error.message }, 500);
      }
    },
  },

  {
    path: "/api/ecosystem/register",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const parsed = ecosystemAppSchema.safeParse(body);
        
        if (!parsed.success) {
          return c.json({ 
            success: false, 
            error: `Invalid app data: ${parsed.error.message}` 
          }, 400);
        }

        const { appName, category, hook, valueProposition, keyTags, imagePrompt, websiteUrl, submittedBy } = parsed.data;

        const existing = await db
          .select()
          .from(ecosystemApps)
          .where(eq(ecosystemApps.appName, appName))
          .limit(1);

        if (existing.length > 0) {
          return c.json({ 
            success: false, 
            error: `App "${appName}" already registered` 
          }, 400);
        }

        const id = uuidv4();
        const apiKey = generateApiKey();

        await db.insert(ecosystemApps).values({
          id,
          appName,
          category,
          hook,
          valueProposition,
          keyTags: keyTags || [],
          imagePrompt,
          websiteUrl,
          status: "pending",
          apiKey,
          submittedBy: submittedBy || "unknown",
        });

        logger?.info("[Ecosystem] App registered:", { appName, id });

        return c.json({
          success: true,
          message: `App "${appName}" registered successfully. Pending approval.`,
          appId: id,
          apiKey,
          status: "pending",
        });
      } catch (error: any) {
        logger?.error("[Ecosystem] Registration failed:", { error: error.message });
        return c.json({ success: false, error: error.message }, 500);
      }
    },
  },

  {
    path: "/api/ecosystem/update",
    method: "PUT" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.json();
        const apiKey = c.req.header("x-api-key") || body.apiKey;
        
        if (!apiKey) {
          return c.json({ success: false, error: "API key required" }, 401);
        }

        const existing = await db
          .select()
          .from(ecosystemApps)
          .where(eq(ecosystemApps.apiKey, apiKey))
          .limit(1);

        if (existing.length === 0) {
          return c.json({ success: false, error: "Invalid API key" }, 401);
        }

        const app = existing[0];
        const updates: any = { updatedAt: new Date() };

        if (body.hook) updates.hook = body.hook;
        if (body.valueProposition) updates.valueProposition = body.valueProposition;
        if (body.keyTags) updates.keyTags = body.keyTags;
        if (body.imagePrompt) updates.imagePrompt = body.imagePrompt;
        if (body.generatedImageUrl) updates.generatedImageUrl = body.generatedImageUrl;
        if (body.websiteUrl) updates.websiteUrl = body.websiteUrl;

        await db.update(ecosystemApps).set(updates).where(eq(ecosystemApps.id, app.id));

        logger?.info("[Ecosystem] App updated:", { appName: app.appName, id: app.id });

        return c.json({
          success: true,
          message: `App "${app.appName}" updated successfully`,
          appId: app.id,
        });
      } catch (error: any) {
        logger?.error("[Ecosystem] Update failed:", { error: error.message });
        return c.json({ success: false, error: error.message }, 500);
      }
    },
  },

  {
    path: "/api/ecosystem/approve/:appId",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const adminKey = c.req.header("x-admin-key");
        if (adminKey !== process.env.ADMIN_ACCESS_CODE) {
          return c.json({ success: false, error: "Admin access required" }, 401);
        }

        const appId = c.req.param("appId");
        const existing = await db
          .select()
          .from(ecosystemApps)
          .where(eq(ecosystemApps.id, appId))
          .limit(1);

        if (existing.length === 0) {
          return c.json({ success: false, error: "App not found" }, 404);
        }

        await db
          .update(ecosystemApps)
          .set({ status: "approved", updatedAt: new Date() })
          .where(eq(ecosystemApps.id, appId));

        logger?.info("[Ecosystem] App approved:", { appName: existing[0].appName, id: appId });

        return c.json({
          success: true,
          message: `App "${existing[0].appName}" approved`,
        });
      } catch (error: any) {
        logger?.error("[Ecosystem] Approval failed:", { error: error.message });
        return c.json({ success: false, error: error.message }, 500);
      }
    },
  },

  {
    path: "/api/ecosystem/pending",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const adminKey = c.req.header("x-admin-key");
        if (adminKey !== process.env.ADMIN_ACCESS_CODE) {
          return c.json({ success: false, error: "Admin access required" }, 401);
        }

        const apps = await db
          .select()
          .from(ecosystemApps)
          .where(eq(ecosystemApps.status, "pending"));

        return c.json({
          success: true,
          apps: apps.map((app: any) => ({
            id: app.id,
            appName: app.appName,
            category: app.category,
            hook: app.hook,
            submittedBy: app.submittedBy,
            createdAt: app.createdAt,
          })),
          count: apps.length,
        });
      } catch (error: any) {
        logger?.error("[Ecosystem] Failed to fetch pending:", { error: error.message });
        return c.json({ success: false, error: error.message }, 500);
      }
    },
  },
];
