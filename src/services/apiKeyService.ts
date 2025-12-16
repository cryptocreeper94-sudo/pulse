import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '../db/client';
import { apiKeys, apiUsageDaily, apiRequestLogs, API_SCOPES } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

const BCRYPT_SALT_ROUNDS = 12;
const IP_HASH_SALT = process.env.SESSION_SECRET || 'darkwave-api-ip-salt-fallback-2024';

const LEGACY_SCOPE_MAP: Record<string, string> = {
  'market': 'market:read',
  'signals': 'signals:read',
  'predictions': 'predictions:read',
  'accuracy': 'accuracy:read',
  'strikeagent': 'strikeagent:read',
  'webhooks': 'webhooks:write',
};

// Environment types
export type ApiEnvironment = 'live' | 'test';

// Tier definitions with rate limits and scoped permissions
export const API_TIERS = {
  free: {
    name: 'Free',
    rateLimit: 60,      // requests per minute
    dailyLimit: 2000,   // requests per day
    scopes: ['market:read', 'signals:read'],
  },
  pro: {
    name: 'Pro',
    rateLimit: 600,     // requests per minute
    dailyLimit: 100000, // requests per day
    scopes: ['market:read', 'signals:read', 'predictions:read', 'accuracy:read', 'strikeagent:read'],
  },
  enterprise: {
    name: 'Enterprise',
    rateLimit: 3000,    // requests per minute
    dailyLimit: 1000000, // requests per day
    scopes: ['market:read', 'signals:read', 'predictions:read', 'accuracy:read', 'strikeagent:read', 'webhooks:write'],
  },
};

// Export scopes for external use
export { API_SCOPES };

// In-memory rate limiting (simple implementation - could upgrade to Redis later)
const rateLimitStore: Map<string, { count: number; resetAt: number }> = new Map();

export class ApiKeyService {
  
  // Generate a new API key for a user
  async generateApiKey(
    userId: string, 
    name: string, 
    tier: keyof typeof API_TIERS = 'free', 
    description?: string,
    environment: ApiEnvironment = 'live',
    customScopes?: string[]
  ): Promise<{ key: string; keyId: string; prefix: string; environment: ApiEnvironment }> {
    const keyId = crypto.randomUUID();
    
    // Generate key with environment prefix: pk_live_ or pk_test_
    const randomPart = crypto.randomBytes(24).toString('base64url');
    const key = `pk_${environment}_${randomPart}`;
    const prefix = key.substring(0, 13); // pk_live_xxxx or pk_test_xxxx for display
    
    // Hash the key securely with bcrypt
    const keyHash = await bcrypt.hash(key, BCRYPT_SALT_ROUNDS);
    
    const tierConfig = API_TIERS[tier];
    
    // Use custom scopes if provided, otherwise use tier defaults
    const scopes = customScopes || tierConfig.scopes;
    
    await db.insert(apiKeys).values({
      id: keyId,
      userId,
      name,
      keyPrefix: prefix,
      keyHash,
      environment,
      tier,
      rateLimit: tierConfig.rateLimit,
      dailyLimit: tierConfig.dailyLimit,
      status: 'active',
      permissions: JSON.stringify(scopes),
      description,
      createdAt: new Date(),
    });
    
    return { key, keyId, prefix, environment };
  }
  
  // Validate an API key and return the key record
  async validateApiKey(key: string): Promise<{ valid: boolean; keyRecord?: any; error?: string; environment?: ApiEnvironment }> {
    // Support both pk_live_ and pk_test_ prefixes
    if (!key || (!key.startsWith('pk_live_') && !key.startsWith('pk_test_'))) {
      return { valid: false, error: 'Invalid API key format' };
    }
    
    // Determine environment from prefix
    const environment: ApiEnvironment = key.startsWith('pk_test_') ? 'test' : 'live';
    
    // Extract prefix from the key for lookup (first 13 chars: pk_live_xxxx or pk_test_xxxx)
    const prefix = key.substring(0, 13);
    
    // Find keys by prefix first
    const records = await db.select().from(apiKeys).where(eq(apiKeys.keyPrefix, prefix));
    
    if (records.length === 0) {
      return { valid: false, error: 'API key not found' };
    }
    
    // Check each matching record with bcrypt.compare
    for (const keyRecord of records) {
      const isMatch = await bcrypt.compare(key, keyRecord.keyHash);
      
      if (isMatch) {
        if (keyRecord.status !== 'active') {
          return { valid: false, error: `API key is ${keyRecord.status}` };
        }
        
        if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
          return { valid: false, error: 'API key has expired' };
        }
        
        // Update last used timestamp
        await db.update(apiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(apiKeys.id, keyRecord.id));
        
        // Use stored environment if available, fallback to prefix detection for legacy records
        const resolvedEnvironment: ApiEnvironment = keyRecord.environment || environment;
        
        // Handle backward-compatible scopes
        let scopes: string[] = [];
        try {
          const parsedPermissions = keyRecord.permissions ? JSON.parse(keyRecord.permissions) : [];
          if (Array.isArray(parsedPermissions) && parsedPermissions.length > 0) {
            scopes = parsedPermissions.map((scope: string) => {
              return LEGACY_SCOPE_MAP[scope] || scope;
            });
          } else {
            const tierConfig = API_TIERS[keyRecord.tier as keyof typeof API_TIERS];
            scopes = tierConfig?.scopes || API_TIERS.free.scopes;
          }
        } catch {
          const tierConfig = API_TIERS[keyRecord.tier as keyof typeof API_TIERS];
          scopes = tierConfig?.scopes || API_TIERS.free.scopes;
        }
        
        const enrichedKeyRecord = { ...keyRecord, scopes };
        
        return { valid: true, keyRecord: enrichedKeyRecord, environment: resolvedEnvironment };
      }
    }
    
    return { valid: false, error: 'API key not found' };
  }
  
  // Log a detailed API request for debugging and analytics
  async logRequest(params: {
    keyId: string;
    endpoint: string;
    method: string;
    statusCode: number;
    latencyMs: number;
    ipAddress?: string;
    userAgent?: string;
    requestParams?: string;
    responsePreview?: string;
    errorMessage?: string;
  }) {
    try {
      // Hash IP for privacy using HMAC-SHA256 with secret salt
      const ipHash = params.ipAddress 
        ? crypto.createHmac('sha256', IP_HASH_SALT).update(params.ipAddress).digest('hex').substring(0, 16)
        : null;
      
      await db.insert(apiRequestLogs).values({
        id: crypto.randomUUID(),
        keyId: params.keyId,
        endpoint: params.endpoint,
        method: params.method,
        statusCode: params.statusCode,
        latencyMs: params.latencyMs,
        ipHash,
        userAgent: params.userAgent?.substring(0, 500), // Truncate long user agents
        requestParams: params.requestParams?.substring(0, 1000),
        responsePreview: params.responsePreview?.substring(0, 500),
        errorMessage: params.errorMessage,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('[API Logging] Failed to log request:', error);
    }
  }
  
  // Check rate limit for a key
  async checkRateLimit(keyId: string, rateLimit: number): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    
    const cached = rateLimitStore.get(keyId);
    
    if (!cached || cached.resetAt < now) {
      // New window
      rateLimitStore.set(keyId, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: rateLimit - 1, resetIn: windowMs };
    }
    
    if (cached.count >= rateLimit) {
      return { allowed: false, remaining: 0, resetIn: cached.resetAt - now };
    }
    
    cached.count++;
    return { allowed: true, remaining: rateLimit - cached.count, resetIn: cached.resetAt - now };
  }
  
  // Check daily limit for a key
  async checkDailyLimit(keyId: string, dailyLimit: number): Promise<{ allowed: boolean; used: number; remaining: number }> {
    const today = new Date().toISOString().split('T')[0];
    
    const usage = await db.select()
      .from(apiUsageDaily)
      .where(and(
        eq(apiUsageDaily.keyId, keyId),
        eq(apiUsageDaily.date, today)
      ));
    
    const used = usage.length > 0 ? usage[0].requestCount : 0;
    
    return {
      allowed: used < dailyLimit,
      used,
      remaining: Math.max(0, dailyLimit - used),
    };
  }
  
  // Record API usage
  async recordUsage(keyId: string, endpoint: string, statusCode: number, latencyMs?: number, error?: string) {
    const today = new Date().toISOString().split('T')[0];
    const isSuccess = statusCode >= 200 && statusCode < 300;
    
    // Upsert daily usage
    const existing = await db.select()
      .from(apiUsageDaily)
      .where(and(
        eq(apiUsageDaily.keyId, keyId),
        eq(apiUsageDaily.date, today)
      ));
    
    if (existing.length === 0) {
      await db.insert(apiUsageDaily).values({
        id: crypto.randomUUID(),
        keyId,
        date: today,
        requestCount: 1,
        successCount: isSuccess ? 1 : 0,
        errorCount: isSuccess ? 0 : 1,
        endpointBreakdown: JSON.stringify({ [endpoint]: 1 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      const record = existing[0];
      const breakdown = record.endpointBreakdown ? JSON.parse(record.endpointBreakdown) : {};
      breakdown[endpoint] = (breakdown[endpoint] || 0) + 1;
      
      await db.update(apiUsageDaily)
        .set({
          requestCount: record.requestCount + 1,
          successCount: record.successCount + (isSuccess ? 1 : 0),
          errorCount: record.errorCount + (isSuccess ? 0 : 1),
          endpointBreakdown: JSON.stringify(breakdown),
          updatedAt: new Date(),
        })
        .where(eq(apiUsageDaily.id, record.id));
    }
    
    // Optionally log individual request (for debugging/analytics)
    if (error || latencyMs) {
      await db.insert(apiRequestLogs).values({
        id: crypto.randomUUID(),
        keyId,
        endpoint,
        method: 'GET',
        statusCode,
        latencyMs,
        errorMessage: error,
        createdAt: new Date(),
      });
    }
  }
  
  // Get all API keys for a user
  async getUserApiKeys(userId: string) {
    return await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      tier: apiKeys.tier,
      status: apiKeys.status,
      rateLimit: apiKeys.rateLimit,
      dailyLimit: apiKeys.dailyLimit,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
      expiresAt: apiKeys.expiresAt,
    }).from(apiKeys).where(eq(apiKeys.userId, userId));
  }
  
  // Get usage stats for a key
  async getKeyUsageStats(keyId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    return await db.select()
      .from(apiUsageDaily)
      .where(and(
        eq(apiUsageDaily.keyId, keyId),
        sql`${apiUsageDaily.date} >= ${startDateStr}`
      ));
  }
  
  // Revoke an API key
  async revokeApiKey(keyId: string, userId: string): Promise<boolean> {
    const result = await db.update(apiKeys)
      .set({ status: 'revoked', revokedAt: new Date() })
      .where(and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.userId, userId)
      ));
    
    return true;
  }
  
  // Rotate an API key (revoke old, create new with same settings)
  async rotateApiKey(keyId: string, userId: string): Promise<{ key: string; keyId: string; prefix: string } | null> {
    const existing = await db.select().from(apiKeys).where(
      and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId))
    );
    
    if (existing.length === 0) return null;
    
    const oldKey = existing[0];
    
    // Revoke old key
    await this.revokeApiKey(keyId, userId);
    
    // Create new key with same settings
    return await this.generateApiKey(
      userId,
      `${oldKey.name} (rotated)`,
      oldKey.tier as keyof typeof API_TIERS,
      oldKey.description || undefined
    );
  }
}

export const apiKeyService = new ApiKeyService();
