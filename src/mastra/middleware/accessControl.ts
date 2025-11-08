import { randomBytes } from 'crypto';
import { db } from '../../db/client.js';
import { sessions } from '../../db/schema.js';
import { eq, lt } from 'drizzle-orm';

// Session expiry: 30 days
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export async function generateSessionToken(userId: string, email?: string): Promise<string> {
  if (!userId || userId === 'demo-user') {
    throw new Error('Valid userId required for session generation');
  }
  
  const token = randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
  
  await db.insert(sessions).values({
    token,
    userId,
    email: email || null,
    issuedAt: now,
    expiresAt,
    lastUsed: now
  });
  
  // Clean up expired sessions periodically
  cleanExpiredSessions();
  
  return token;
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
