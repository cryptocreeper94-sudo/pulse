import { createHash, randomBytes } from 'crypto';

// Simple in-memory session store (could be moved to database later)
const activeSessions = new Map<string, { createdAt: Date; expiresAt: Date }>();

// Session expiry: 30 days
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export function generateSessionToken(): string {
  const token = randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
  
  activeSessions.set(token, {
    createdAt: now,
    expiresAt
  });
  
  cleanExpiredSessions();
  return token;
}

export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false;
  
  const session = activeSessions.get(token);
  if (!session) return false;
  
  // Check if expired
  if (new Date() > session.expiresAt) {
    activeSessions.delete(token);
    return false;
  }
  
  return true;
}

export function revokeSessionToken(token: string): void {
  activeSessions.delete(token);
}

function cleanExpiredSessions(): void {
  const now = new Date();
  for (const [token, session] of activeSessions.entries()) {
    if (now > session.expiresAt) {
      activeSessions.delete(token);
    }
  }
}

// Clean expired sessions every hour
setInterval(cleanExpiredSessions, 60 * 60 * 1000);
