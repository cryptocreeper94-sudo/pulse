import { db } from "../../db/client.js";
import { subscriptions, userUsage, whitelistedUsers } from "../../db/schema.js";
import { eq, or } from "drizzle-orm";

// Helper: Get email from session token
async function getEmailFromSession(sessionToken?: string): Promise<string | null> {
  if (!sessionToken) return null;
  
  try {
    const { sessions } = await import('../../db/schema.js');
    const [session] = await db.select()
      .from(sessions)
      .where(eq(sessions.token, sessionToken))
      .limit(1);
    
    return session?.email || null;
  } catch {
    return null;
  }
}

export async function checkSubscriptionLimit(userId: string, feature: 'search' | 'alert', sessionToken?: string): Promise<{ allowed: boolean; isPremium: boolean; isWhitelisted?: boolean; message?: string }> {
  try {
    // TEMPORARY: Disable limits for owner testing
    console.log(`🔓 [SubscriptionCheck] LIMITS DISABLED FOR TESTING - User ${userId} granted unlimited access`);
    return { allowed: true, isPremium: true, isWhitelisted: true };
    
    /* ORIGINAL LOGIC - RE-ENABLE BEFORE PRODUCTION
    // Get email from session if token provided
    const userEmail = await getEmailFromSession(sessionToken);
    
    // Check if user is whitelisted first (by userId OR email)
    let whitelist;
    if (userEmail) {
      // Check by userId OR email
      whitelist = await db.select()
        .from(whitelistedUsers)
        .where(or(
          eq(whitelistedUsers.userId, userId),
          eq(whitelistedUsers.email, userEmail)
        ))
        .limit(1);
    } else {
      // Check by userId only
      whitelist = await db.select()
        .from(whitelistedUsers)
        .where(eq(whitelistedUsers.userId, userId))
        .limit(1);
    }
    
    if (whitelist.length > 0) {
      const whitelistEntry = whitelist[0];
      
      // Check if whitelist has expired
      if (whitelistEntry.expiresAt && new Date(whitelistEntry.expiresAt) < new Date()) {
        // Whitelist expired, continue with normal checks
      } else {
        // Active whitelist - grant premium access
        console.log(`✅ [Whitelist] User ${userId} granted premium access (${whitelistEntry.reason || 'No reason'})`);
        return { allowed: true, isPremium: true, isWhitelisted: true };
      }
    }
    */
    
    // Get user's subscription status
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    
    const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';
    const isBasic = subscription?.plan === 'basic' && subscription?.status === 'active';
    
    // Premium users have unlimited access
    if (isPremium) {
      return { allowed: true, isPremium: true };
    }
    
    // Basic and Free tier limits (updated Nov 2025)
    const limits = {
      search: 20,  // 20 searches/day for both Basic ($2/mo) and Free trial (7 days)
      alert: 3     // 3 price alerts/day
    };
    
    // Get or create usage record
    let [usage] = await db
      .select()
      .from(userUsage)
      .where(eq(userUsage.userId, userId));
    
    if (!usage) {
      // Create new usage record
      await db.insert(userUsage).values({
        userId,
        searchCount: 0,
        alertCount: 0,
      });
      usage = { userId, searchCount: 0, alertCount: 0, lastResetDate: new Date(), createdAt: new Date(), updatedAt: new Date() };
    }
    
    // Check if we need to reset (daily reset)
    const now = new Date();
    const lastReset = new Date(usage.lastResetDate);
    const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceReset >= 1) {
      // Reset counts
      await db.update(userUsage)
        .set({ searchCount: 0, alertCount: 0, lastResetDate: now, updatedAt: now })
        .where(eq(userUsage.userId, userId));
      usage.searchCount = 0;
      usage.alertCount = 0;
    }
    
    // Check current usage
    const currentCount = feature === 'search' ? usage.searchCount : usage.alertCount;
    const limit = limits[feature];
    
    if (currentCount >= limit) {
      return {
        allowed: false,
        isPremium: false,
        message: `Daily limit reached (${limit} ${feature}es per day on free plan). Upgrade to Premium for unlimited access!`
      };
    }
    
    // Increment usage
    const updateField = feature === 'search' ? { searchCount: currentCount + 1 } : { alertCount: currentCount + 1 };
    await db.update(userUsage)
      .set({ ...updateField, updatedAt: now })
      .where(eq(userUsage.userId, userId));
    
    // Basic and Free tiers both have same limits, just return allowed
    return { allowed: true, isPremium: false };
  } catch (error) {
    // SECURITY: Fail closed on errors to prevent bypass
    console.error('Subscription check error:', error);
    return { 
      allowed: false, 
      isPremium: false, 
      message: 'Unable to verify subscription status. Please try again.' 
    };
  }
}
