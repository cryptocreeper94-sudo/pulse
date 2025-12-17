import { randomBytes } from 'crypto';
import { db } from '../../db/client.js';
import { sessions } from '../../db/schema.js';
import { eq, lt } from 'drizzle-orm';

// Session expiry durations
const FREE_TIER_DURATION_MS = 2 * 24 * 60 * 60 * 1000;     // 2 days for free tier (777 trial)
const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000;      // 30 days for paid premium
const WHITELIST_DURATION_MS = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years for whitelisted (effectively permanent)

// Rotation thresholds
const ROTATION_LAST_USED_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
const ROTATION_EXPIRY_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 1 day

export interface SessionInfo {
  token: string;
  userId: string;
  email: string | null;
  accessLevel: string | null;
}

export interface VerifyAndRotateResult {
  valid: boolean;
  session?: SessionInfo;
  rotated?: boolean;
}

export async function generateSessionToken(
  userId: string, 
  email?: string, 
  isPremium: boolean = false, 
  isWhitelisted: boolean = false,
  accessLevel: string = 'user'
): Promise<string> {
  if (!userId || userId === 'demo-user') {
    throw new Error('Valid userId required for session generation');
  }
  
  const token = randomBytes(32).toString('hex');
  const now = new Date();
  
  // Whitelisted users get permanent access (10 years)
  let sessionDuration: number;
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
  
  // Clean up expired sessions periodically
  cleanExpiredSessions();
  
  return token;
}

export async function verifyAndRotateSession(token: string | null | undefined): Promise<VerifyAndRotateResult> {
  if (!token) {
    return { valid: false };
  }

  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) {
      return { valid: false };
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    // Check if expired - delete and reject
    if (now > expiresAt) {
      await db.delete(sessions).where(eq(sessions.token, token));
      return { valid: false };
    }

    // Check if rotation is needed
    const lastUsed = new Date(session.lastUsed);
    const lastUsedAgeMs = now.getTime() - lastUsed.getTime();
    const timeToExpiryMs = expiresAt.getTime() - now.getTime();
    
    const needsRotation = 
      lastUsedAgeMs > ROTATION_LAST_USED_THRESHOLD_MS || 
      timeToExpiryMs < ROTATION_EXPIRY_THRESHOLD_MS;

    if (needsRotation) {
      // Generate new token with same user data
      const newToken = randomBytes(32).toString('hex');
      
      // Determine session duration based on access level
      let sessionDuration: number;
      const accessLevel = session.accessLevel || 'user';
      if (accessLevel === 'owner' || accessLevel === 'admin') {
        sessionDuration = WHITELIST_DURATION_MS;
      } else if (accessLevel === 'premium') {
        sessionDuration = PREMIUM_DURATION_MS;
      } else {
        sessionDuration = FREE_TIER_DURATION_MS;
      }

      const newExpiresAt = new Date(now.getTime() + sessionDuration);

      // Insert new session first (for safety)
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

      // Delete old session after successful insert
      await db.delete(sessions).where(eq(sessions.token, token));

      return {
        valid: true,
        session: {
          token: newToken,
          userId: session.userId!,
          email: session.email,
          accessLevel: session.accessLevel
        },
        rotated: true
      };
    }

    // No rotation needed - just update lastUsed
    await db
      .update(sessions)
      .set({ lastUsed: now })
      .where(eq(sessions.token, token));

    return {
      valid: true,
      session: {
        token,
        userId: session.userId!,
        email: session.email,
        accessLevel: session.accessLevel
      },
      rotated: false
    };
  } catch (error) {
    console.error('Session verify/rotate error:', error);
    return { valid: false };
  }
}

export async function verifySessionToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  
  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);
    
    if (!session) return false;
    
    // Check if expired
    if (new Date() > new Date(session.expiresAt)) {
      await db.delete(sessions).where(eq(sessions.token, token));
      return false;
    }
    
    // Update last used timestamp
    await db
      .update(sessions)
      .set({ lastUsed: new Date() })
      .where(eq(sessions.token, token));
    
    return true;
  } catch (error) {
    console.error('Session verification error:', error);
    return false;
  }
}

export async function revokeSessionToken(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}

async function cleanExpiredSessions(): Promise<void> {
  try {
    const now = new Date();
    await db.delete(sessions).where(lt(sessions.expiresAt, now));
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}

// Clean expired sessions every hour
setInterval(cleanExpiredSessions, 60 * 60 * 1000);

// Helper to check session in request (async now that we use database)
export async function checkAccessSession(c: any): Promise<{ valid: boolean; userId?: string; error?: any }> {
  const sessionToken = c.req.header('X-Session-Token');
  
  if (!sessionToken) {
    return {
      valid: false,
      error: c.json({ 
        error: 'Access denied. Please enter the access code.',
        requiresAccessCode: true 
      }, 401)
    };
  }
  
  try {
    // Fetch session and extract userId
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, sessionToken))
      .limit(1);
    
    if (!session) {
      return {
        valid: false,
        error: c.json({ 
          error: 'Access denied. Please enter the access code.',
          requiresAccessCode: true 
        }, 401)
      };
    }
    
    // Check if expired
    if (new Date() > new Date(session.expiresAt)) {
      await db.delete(sessions).where(eq(sessions.token, sessionToken));
      return {
        valid: false,
        error: c.json({ 
          error: 'Session expired. Please enter the access code again.',
          requiresAccessCode: true 
        }, 401)
      };
    }
    
    // Update last used timestamp
    await db
      .update(sessions)
      .set({ lastUsed: new Date() })
      .where(eq(sessions.token, sessionToken));
    
    if (!session.userId) {
      return {
        valid: false,
        error: c.json({ error: 'Invalid session: no user ID' }, 401)
      };
    }
    
    return { valid: true, userId: session.userId };
  } catch (error) {
    console.error('Session verification error:', error);
    return {
      valid: false,
      error: c.json({ error: 'Session validation failed' }, 500)
    };
  }
}
