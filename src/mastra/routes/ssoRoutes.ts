import * as crypto from "crypto";

const SSO_JWT_SECRET = process.env.SSO_JWT_SECRET || "";
const SSO_TOKEN_EXPIRY = 5 * 60;
const SSO_SESSION_EXPIRY = 24 * 60 * 60;

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

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

function createSsoToken(payload: any, expiresIn: number): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
    iss: "darkwave-pulse",
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(claims));
  const signature = hmacSign(`${headerB64}.${payloadB64}`, SSO_JWT_SECRET);

  return `${headerB64}.${payloadB64}.${signature}`;
}

function verifySsoToken(token: string): any | null {
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

export const ssoRoutes = [
  {
    path: "/api/sso/status",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      return c.json({
        success: true,
        ssoEnabled: !!SSO_JWT_SECRET,
        issuer: "darkwave-pulse",
        tokenExpiry: `${SSO_TOKEN_EXPIRY}s`,
        sessionExpiry: `${SSO_SESSION_EXPIRY}s`,
        endpoints: {
          issue: "/api/sso/issue",
          verify: "/api/sso/verify",
          exchange: "/api/sso/exchange",
          status: "/api/sso/status",
        },
      });
    },
  },

  {
    path: "/api/sso/issue",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();

      if (!SSO_JWT_SECRET) {
        return c.json({ success: false, error: "SSO not configured" }, 503);
      }

      try {
        const body = await c.req.json();
        const { uid, email, displayName, photoURL, sourceApp, hallmarkId } = body;

        if (!uid || !email) {
          return c.json(
            { success: false, error: "uid and email are required" },
            400
          );
        }

        const crossAppToken = createSsoToken(
          {
            sub: uid,
            email,
            displayName: displayName || null,
            photoURL: photoURL || null,
            hallmarkId: hallmarkId || null,
            sourceApp: sourceApp || "pulse",
            type: "cross_app",
          },
          SSO_TOKEN_EXPIRY
        );

        logger?.info("[SSO] Cross-app token issued", {
          email,
          sourceApp: sourceApp || "pulse",
        });

        return c.json({
          success: true,
          token: crossAppToken,
          expiresIn: SSO_TOKEN_EXPIRY,
          type: "cross_app",
        });
      } catch (error: any) {
        logger?.error("[SSO] Issue error:", { error: error.message });
        return c.json({ success: false, error: "Failed to issue token" }, 500);
      }
    },
  },

  {
    path: "/api/sso/verify",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();

      if (!SSO_JWT_SECRET) {
        return c.json({ success: false, error: "SSO not configured" }, 503);
      }

      try {
        let token: string | null = null;

        const authHeader = c.req.header("Authorization");
        if (authHeader?.startsWith("Bearer ")) {
          token = authHeader.replace("Bearer ", "");
        }

        if (!token) {
          const body = await c.req.json().catch(() => ({}));
          token = body.token;
        }

        if (!token) {
          return c.json(
            { success: false, error: "Token required (Authorization header or body)" },
            400
          );
        }

        const payload = verifySsoToken(token);

        if (!payload) {
          logger?.warn("[SSO] Token verification failed");
          return c.json({ success: false, error: "Invalid or expired token" }, 401);
        }

        logger?.info("[SSO] Token verified", {
          email: payload.email,
          sourceApp: payload.sourceApp,
          type: payload.type,
        });

        return c.json({
          success: true,
          valid: true,
          user: {
            uid: payload.sub,
            email: payload.email,
            displayName: payload.displayName,
            photoURL: payload.photoURL,
            hallmarkId: payload.hallmarkId,
            sourceApp: payload.sourceApp,
          },
          issuedAt: new Date(payload.iat * 1000).toISOString(),
          expiresAt: new Date(payload.exp * 1000).toISOString(),
        });
      } catch (error: any) {
        logger?.error("[SSO] Verify error:", { error: error.message });
        return c.json({ success: false, error: "Verification failed" }, 500);
      }
    },
  },

  {
    path: "/api/sso/exchange",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();

      if (!SSO_JWT_SECRET) {
        return c.json({ success: false, error: "SSO not configured" }, 503);
      }

      try {
        let token: string | null = null;

        const authHeader = c.req.header("Authorization");
        if (authHeader?.startsWith("Bearer ")) {
          token = authHeader.replace("Bearer ", "");
        }

        if (!token) {
          const body = await c.req.json().catch(() => ({}));
          token = body.token;
        }

        if (!token) {
          return c.json(
            { success: false, error: "Cross-app token required" },
            400
          );
        }

        const payload = verifySsoToken(token);

        if (!payload) {
          return c.json({ success: false, error: "Invalid or expired token" }, 401);
        }

        if (payload.type !== "cross_app") {
          return c.json(
            { success: false, error: "Only cross_app tokens can be exchanged" },
            400
          );
        }

        const sessionToken = createSsoToken(
          {
            sub: payload.sub,
            email: payload.email,
            displayName: payload.displayName,
            photoURL: payload.photoURL,
            hallmarkId: payload.hallmarkId,
            sourceApp: payload.sourceApp,
            targetApp: "pulse",
            type: "session",
          },
          SSO_SESSION_EXPIRY
        );

        const dbUrl = process.env.DATABASE_URL;
        if (dbUrl) {
          try {
            const { Pool } = await import("pg");
            const pool = new Pool({ connectionString: dbUrl });

            const existing = await pool.query(
              "SELECT * FROM users WHERE email = $1",
              [payload.email]
            );

            if (existing.rows.length === 0) {
              const hallmarkId =
                payload.hallmarkId ||
                `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();

              await pool.query(
                `INSERT INTO users (email, firebase_uid, display_name, photo_url, access_level, subscription_tier, hallmark_id, created_at, last_login)
                 VALUES ($1, $2, $3, $4, 'user', 'free', $5, NOW(), NOW())
                 ON CONFLICT (email) DO UPDATE SET
                   firebase_uid = COALESCE(EXCLUDED.firebase_uid, users.firebase_uid),
                   display_name = COALESCE(EXCLUDED.display_name, users.display_name),
                   last_login = NOW()`,
                [
                  payload.email,
                  payload.sub,
                  payload.displayName,
                  payload.photoURL,
                  hallmarkId,
                ]
              );
              logger?.info("[SSO] Created user from cross-app auth", {
                email: payload.email,
              });
            } else {
              await pool.query(
                `UPDATE users SET last_login = NOW() WHERE email = $1`,
                [payload.email]
              );
            }

            await pool.end();
          } catch (dbErr: any) {
            logger?.warn("[SSO] DB sync failed (non-fatal):", {
              error: dbErr.message,
            });
          }
        }

        logger?.info("[SSO] Token exchanged for session", {
          email: payload.email,
          sourceApp: payload.sourceApp,
        });

        return c.json({
          success: true,
          sessionToken,
          expiresIn: SSO_SESSION_EXPIRY,
          user: {
            uid: payload.sub,
            email: payload.email,
            displayName: payload.displayName,
            photoURL: payload.photoURL,
            hallmarkId: payload.hallmarkId,
          },
        });
      } catch (error: any) {
        logger?.error("[SSO] Exchange error:", { error: error.message });
        return c.json({ success: false, error: "Exchange failed" }, 500);
      }
    },
  },
];
