import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { ecosystemApps } from "../../db/schema.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const SSO_JWT_SECRET = process.env.SSO_JWT_SECRET || "";

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString("utf8");
}

function hmacSign(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function verifyWidgetToken(token: string): any | null {
  if (!SSO_JWT_SECRET) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signature] = parts;
    const expectedSig = hmacSign(`${headerB64}.${payloadB64}`, SSO_JWT_SECRET);
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

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

  {
    path: "/api/ecosystem/widget-data",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();

      const authHeader = c.req.header("Authorization");
      let authedUser: any = null;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        authedUser = verifyWidgetToken(token);
      }

      try {
        const apps = await db
          .select()
          .from(ecosystemApps)
          .where(eq(ecosystemApps.status, "approved"));

        const allApps = [
          {
            id: "pulse",
            appName: PULSE_ECOSYSTEM_METADATA.appName,
            category: PULSE_ECOSYSTEM_METADATA.category,
            hook: PULSE_ECOSYSTEM_METADATA.hook,
            keyTags: PULSE_ECOSYSTEM_METADATA.keyTags,
            websiteUrl: PULSE_ECOSYSTEM_METADATA.websiteUrl,
            isNative: true,
          },
          ...apps.map((app: any) => ({
            id: app.id,
            appName: app.appName,
            category: app.category,
            hook: app.hook,
            keyTags: app.keyTags || [],
            websiteUrl: app.websiteUrl,
            isNative: false,
          })),
        ];

        let platformStats: any = {
          totalApps: allApps.length,
          ecosystem: "DarkWave Trust Layer",
          version: "1.0",
        };

        if (authedUser) {
          try {
            const predCountResult = await db.execute(
              sql`SELECT COUNT(*)::int as count FROM strikeagent_predictions`
            );
            const signalCountResult = await db.execute(
              sql`SELECT COUNT(*)::int as count FROM strike_agent_signals`
            );
            const userCountResult = await db.execute(
              sql`SELECT COUNT(*)::int as count FROM users`
            );
            const accuracyResult = await db.execute(
              sql`SELECT COALESCE(AVG(win_rate), 0)::numeric(5,2) as avg_win_rate FROM prediction_accuracy_stats WHERE total_predictions > 5`
            );

            platformStats = {
              ...platformStats,
              totalPredictions: predCountResult.rows?.[0]?.count || 0,
              activeSignals: signalCountResult.rows?.[0]?.count || 0,
              registeredUsers: userCountResult.rows?.[0]?.count || 0,
              avgAccuracy: parseFloat(String(accuracyResult.rows?.[0]?.avg_win_rate ?? "0")),
              ssoEnabled: true,
              authedAs: authedUser.email,
            };
          } catch (dbErr: any) {
            logger?.warn("[Widget] Stats query failed:", { error: dbErr.message });
          }
        }

        logger?.info("[Widget] Widget data served", {
          authed: !!authedUser,
          appCount: allApps.length,
        });

        return c.json({
          success: true,
          ecosystem: "DarkWave Trust Layer",
          apps: allApps,
          stats: platformStats,
          ssoEndpoints: {
            issue: "/api/sso/issue",
            verify: "/api/sso/verify",
            exchange: "/api/sso/exchange",
          },
          generatedAt: new Date().toISOString(),
        });
      } catch (error: any) {
        logger?.error("[Widget] Widget data error:", { error: error.message });
        return c.json({ success: false, error: error.message }, 500);
      }
    },
  },

  {
    path: "/api/ecosystem/widget.js",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      logger?.info("[Widget] widget.js requested");

      const widgetScript = `(function(){
  "use strict";
  var WIDGET_API = (document.currentScript && document.currentScript.src)
    ? new URL(document.currentScript.src).origin + "/api/ecosystem/widget-data"
    : "https://dwsc.io/api/ecosystem/widget-data";

  var STYLES = {
    container: "position:fixed;bottom:20px;right:20px;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;",
    badge: "display:flex;align-items:center;gap:8px;padding:10px 16px;background:#0f0f0f;border:1px solid rgba(0,212,255,0.3);border-radius:12px;cursor:pointer;box-shadow:0 4px 24px rgba(0,212,255,0.15);transition:all 0.3s ease;",
    badgeHover: "border-color:rgba(0,212,255,0.6);box-shadow:0 4px 32px rgba(0,212,255,0.3);",
    logo: "width:24px;height:24px;border-radius:6px;background:linear-gradient(135deg,#00D4FF,#39FF14);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#000;flex-shrink:0;",
    text: "color:#ccc;font-size:12px;line-height:1.3;",
    label: "color:#00D4FF;font-weight:700;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;",
    panel: "position:absolute;bottom:50px;right:0;width:320px;background:#0f0f0f;border:1px solid rgba(0,212,255,0.2);border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.6);overflow:hidden;display:none;",
    panelHeader: "padding:16px;background:linear-gradient(135deg,rgba(0,212,255,0.08),rgba(57,255,20,0.04));border-bottom:1px solid rgba(0,212,255,0.1);",
    panelTitle: "color:#fff;font-size:14px;font-weight:700;margin:0 0 4px 0;",
    panelSub: "color:#888;font-size:11px;margin:0;",
    appList: "padding:8px;max-height:280px;overflow-y:auto;",
    appCard: "display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;margin-bottom:4px;cursor:pointer;transition:background 0.2s;",
    appCardHover: "background:rgba(0,212,255,0.06);",
    appIcon: "width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#000;flex-shrink:0;",
    appName: "color:#fff;font-size:13px;font-weight:600;",
    appHook: "color:#777;font-size:11px;margin-top:2px;",
    appTag: "display:inline-block;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:600;color:#00D4FF;background:rgba(0,212,255,0.1);margin-right:4px;margin-top:4px;",
    footer: "padding:12px 16px;border-top:1px solid rgba(0,212,255,0.1);text-align:center;",
    footerLink: "color:#00D4FF;text-decoration:none;font-size:11px;font-weight:600;",
    statsRow: "display:flex;justify-content:space-around;padding:12px 16px;border-bottom:1px solid rgba(0,212,255,0.08);",
    stat: "text-align:center;",
    statVal: "color:#00D4FF;font-size:16px;font-weight:700;",
    statLabel: "color:#666;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;",
    pulse: "width:8px;height:8px;border-radius:50%;background:#39FF14;box-shadow:0 0 6px rgba(57,255,20,0.6);flex-shrink:0;animation:dw-pulse 2s infinite;",
  };

  var css = document.createElement("style");
  css.textContent = "@keyframes dw-pulse{0%,100%{opacity:1}50%{opacity:0.4}}";
  document.head.appendChild(css);

  var container = document.createElement("div");
  container.style.cssText = STYLES.container;

  var badge = document.createElement("div");
  badge.style.cssText = STYLES.badge;
  badge.innerHTML = '<div style="' + STYLES.logo + '">DW</div>' +
    '<div><div style="' + STYLES.label + '">DarkWave Trust Layer</div>' +
    '<div style="' + STYLES.text + '">Verified Ecosystem</div></div>' +
    '<div style="' + STYLES.pulse + '"></div>';

  badge.addEventListener("mouseenter", function(){ badge.style.cssText = STYLES.badge + STYLES.badgeHover; });
  badge.addEventListener("mouseleave", function(){ badge.style.cssText = STYLES.badge; });

  var panel = document.createElement("div");
  panel.style.cssText = STYLES.panel;

  var open = false;
  badge.addEventListener("click", function(){
    open = !open;
    panel.style.display = open ? "block" : "none";
    if (open) loadWidgetData();
  });

  function loadWidgetData(){
    panel.innerHTML = '<div style="padding:40px;text-align:center;color:#555;">Loading...</div>';
    var headers = {};
    if (window.DW_SSO_TOKEN) headers["Authorization"] = "Bearer " + window.DW_SSO_TOKEN;
    fetch(WIDGET_API, { headers: headers })
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (!data.success) { panel.innerHTML = '<div style="padding:20px;color:#f44;">Error loading data</div>'; return; }
        renderPanel(data);
      })
      .catch(function(){ panel.innerHTML = '<div style="padding:20px;color:#f44;">Connection failed</div>'; });
  }

  var COLORS = ["#00D4FF","#39FF14","#FF006E","#8B5CF6","#F59E0B","#06B6D4","#EC4899"];
  function renderPanel(data){
    var html = '<div style="' + STYLES.panelHeader + '">' +
      '<p style="' + STYLES.panelTitle + '">DarkWave Ecosystem</p>' +
      '<p style="' + STYLES.panelSub + '">' + data.apps.length + ' connected app' + (data.apps.length !== 1 ? 's' : '') + '</p></div>';

    if (data.stats && data.stats.totalPredictions) {
      html += '<div style="' + STYLES.statsRow + '">';
      html += '<div style="' + STYLES.stat + '"><div style="' + STYLES.statVal + '">' + formatNum(data.stats.totalPredictions) + '</div><div style="' + STYLES.statLabel + '">Predictions</div></div>';
      if (data.stats.avgAccuracy > 0) html += '<div style="' + STYLES.stat + '"><div style="' + STYLES.statVal + '">' + data.stats.avgAccuracy + '%</div><div style="' + STYLES.statLabel + '">Accuracy</div></div>';
      html += '<div style="' + STYLES.stat + '"><div style="' + STYLES.statVal + '">' + formatNum(data.stats.registeredUsers || 0) + '</div><div style="' + STYLES.statLabel + '">Users</div></div>';
      html += '</div>';
    }

    html += '<div style="' + STYLES.appList + '">';
    data.apps.forEach(function(app, i){
      var color = COLORS[i % COLORS.length];
      var initial = app.appName.charAt(0).toUpperCase();
      html += '<div class="dw-app-card" style="' + STYLES.appCard + '" data-url="' + (app.websiteUrl || '#') + '">' +
        '<div style="' + STYLES.appIcon + 'background:' + color + ';">' + initial + '</div>' +
        '<div style="flex:1;min-width:0;">' +
        '<div style="' + STYLES.appName + '">' + esc(app.appName) + '</div>' +
        '<div style="' + STYLES.appHook + '">' + esc(app.hook || '') + '</div>';
      if (app.keyTags && app.keyTags.length) {
        html += '<div>';
        app.keyTags.slice(0, 3).forEach(function(tag){ html += '<span style="' + STYLES.appTag + '">' + esc(tag) + '</span>'; });
        html += '</div>';
      }
      html += '</div></div>';
    });
    html += '</div>';

    html += '<div style="' + STYLES.footer + '"><a href="https://dwsc.io" target="_blank" rel="noopener" style="' + STYLES.footerLink + '">Powered by DarkWave Studios</a></div>';

    panel.innerHTML = html;

    panel.querySelectorAll(".dw-app-card").forEach(function(card){
      card.addEventListener("mouseenter", function(){ card.style.background = "rgba(0,212,255,0.06)"; });
      card.addEventListener("mouseleave", function(){ card.style.background = "transparent"; });
      card.addEventListener("click", function(){
        var url = card.getAttribute("data-url");
        if (url && url !== "#") window.open(url, "_blank", "noopener");
      });
    });
  }

  function formatNum(n){
    if (n >= 1e6) return (n/1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n/1e3).toFixed(1) + "K";
    return String(n);
  }

  function esc(s){
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  container.appendChild(panel);
  container.appendChild(badge);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ document.body.appendChild(container); });
  } else {
    document.body.appendChild(container);
  }
})();`;

      return new Response(widgetScript, {
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "public, max-age=300",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
        },
      });
    },
  },
];
