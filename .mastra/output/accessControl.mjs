import { randomBytes } from 'crypto';
import { d as db, s as sessions, e as eq, l as lt } from './mastra.mjs';
import 'stream/web';
import 'node:url';
import 'node:path';
import 'node:module';
import 'events';
import 'pino';
import 'node:crypto';
import 'path';
import 'util';
import 'buffer';
import 'string_decoder';
import 'stream';
import 'async_hooks';
import 'url';
import 'node:process';
import 'inngest';
import 'http';
import 'https';
import 'fs';
import 'http2';
import 'assert';
import 'tty';
import 'os';
import 'zlib';
import 'pg';
import '@mastra/inngest';
import '@solana/web3.js';
import 'uuid';
import 'net';
import 'tls';
import 'child_process';
import 'fs/promises';
import '@solana/spl-token';
import '@sqds/multisig';
import 'bcrypt';
import '@simplewebauthn/server';

const FREE_TIER_DURATION_MS = 2 * 24 * 60 * 60 * 1e3;
const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1e3;
const WHITELIST_DURATION_MS = 10 * 365 * 24 * 60 * 60 * 1e3;
const ROTATION_LAST_USED_THRESHOLD_MS = 60 * 60 * 1e3;
const ROTATION_EXPIRY_THRESHOLD_MS = 24 * 60 * 60 * 1e3;
async function generateSessionToken(userId, email, isPremium = false, isWhitelisted = false, accessLevel = "user") {
  if (!userId || userId === "demo-user") {
    throw new Error("Valid userId required for session generation");
  }
  const token = randomBytes(32).toString("hex");
  const now = /* @__PURE__ */ new Date();
  let sessionDuration;
  if (isWhitelisted) {
    sessionDuration = WHITELIST_DURATION_MS;
  } else if (isPremium) {
    sessionDuration = PREMIUM_DURATION_MS;
  } else {
    sessionDuration = FREE_TIER_DURATION_MS;
  }
  const expiresAt = new Date(now.getTime() + sessionDuration);
  await db.insert(sessions).values({
    token,
    userId,
    email: email || null,
    issuedAt: now,
    expiresAt,
    lastUsed: now,
    accessLevel
  });
  cleanExpiredSessions();
  return token;
}
async function verifyAndRotateSession(token) {
  if (!token) {
    return { valid: false };
  }
  try {
    const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    if (!session) {
      return { valid: false };
    }
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(session.expiresAt);
    if (now > expiresAt) {
      await db.delete(sessions).where(eq(sessions.token, token));
      return { valid: false };
    }
    const lastUsed = new Date(session.lastUsed);
    const lastUsedAgeMs = now.getTime() - lastUsed.getTime();
    const timeToExpiryMs = expiresAt.getTime() - now.getTime();
    const needsRotation = lastUsedAgeMs > ROTATION_LAST_USED_THRESHOLD_MS || timeToExpiryMs < ROTATION_EXPIRY_THRESHOLD_MS;
    if (needsRotation) {
      const newToken = randomBytes(32).toString("hex");
      let sessionDuration;
      const accessLevel = session.accessLevel || "user";
      if (accessLevel === "owner" || accessLevel === "admin") {
        sessionDuration = WHITELIST_DURATION_MS;
      } else if (accessLevel === "premium") {
        sessionDuration = PREMIUM_DURATION_MS;
      } else {
        sessionDuration = FREE_TIER_DURATION_MS;
      }
      const newExpiresAt = new Date(now.getTime() + sessionDuration);
      await db.insert(sessions).values({
        token: newToken,
        userId: session.userId,
        email: session.email,
        verifiedAt: session.verifiedAt,
        issuedAt: now,
        expiresAt: newExpiresAt,
        lastUsed: now,
        accessLevel: session.accessLevel
      });
      await db.delete(sessions).where(eq(sessions.token, token));
      return {
        valid: true,
        session: {
          token: newToken,
          userId: session.userId,
          email: session.email,
          accessLevel: session.accessLevel
        },
        rotated: true
      };
    }
    await db.update(sessions).set({ lastUsed: now }).where(eq(sessions.token, token));
    return {
      valid: true,
      session: {
        token,
        userId: session.userId,
        email: session.email,
        accessLevel: session.accessLevel
      },
      rotated: false
    };
  } catch (error) {
    console.error("Session verify/rotate error:", error);
    return { valid: false };
  }
}
async function cleanExpiredSessions() {
  try {
    const now = /* @__PURE__ */ new Date();
    await db.delete(sessions).where(lt(sessions.expiresAt, now));
  } catch (error) {
    console.error("Session cleanup error:", error);
  }
}
setInterval(cleanExpiredSessions, 60 * 60 * 1e3);
async function checkAccessSession(c) {
  const sessionToken = c.req.header("X-Session-Token");
  if (!sessionToken) {
    return {
      valid: false,
      error: c.json({
        error: "Access denied. Please enter the access code.",
        requiresAccessCode: true
      }, 401)
    };
  }
  try {
    const [session] = await db.select().from(sessions).where(eq(sessions.token, sessionToken)).limit(1);
    if (!session) {
      return {
        valid: false,
        error: c.json({
          error: "Access denied. Please enter the access code.",
          requiresAccessCode: true
        }, 401)
      };
    }
    if (/* @__PURE__ */ new Date() > new Date(session.expiresAt)) {
      await db.delete(sessions).where(eq(sessions.token, sessionToken));
      return {
        valid: false,
        error: c.json({
          error: "Session expired. Please enter the access code again.",
          requiresAccessCode: true
        }, 401)
      };
    }
    await db.update(sessions).set({ lastUsed: /* @__PURE__ */ new Date() }).where(eq(sessions.token, sessionToken));
    if (!session.userId) {
      return {
        valid: false,
        error: c.json({ error: "Invalid session: no user ID" }, 401)
      };
    }
    return { valid: true, userId: session.userId };
  } catch (error) {
    console.error("Session verification error:", error);
    return {
      valid: false,
      error: c.json({ error: "Session validation failed" }, 500)
    };
  }
}

export { checkAccessSession, generateSessionToken, verifyAndRotateSession };
//# sourceMappingURL=accessControl.mjs.map
