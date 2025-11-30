import { createHash, randomBytes } from 'crypto';
import { db } from '../db/client.js';
import { hallmarkProfiles, hallmarkMints, auditEvents } from '../db/schema.js';
import { eq, desc, and, sql } from 'drizzle-orm';
import { auditTrailService, AUDIT_EVENT_TYPES, EVENT_CATEGORIES } from './auditTrailService.js';

interface HallmarkProfile {
  userId: string;
  avatarType: string;
  avatarId: string | null;
  customAvatarUrl: string | null;
  currentSerial: number;
  preferredTemplate: string | null;
  displayName: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface HallmarkMint {
  id: string;
  userId: string;
  serialNumber: string;
  avatarSnapshot: string | null;
  templateUsed: string;
  payloadHash: string;
  auditEventIds: string | null;
  memoSignature: string | null;
  heliusTxId: string | null;
  artworkUrl: string | null;
  metadataUri: string | null;
  priceUsd: string;
  paymentProvider: string | null;
  paymentId: string | null;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
  mintedAt: Date | null;
}

class HallmarkService {
  private readonly HALLMARK_PRICE_USD = '1.99';
  
  /**
   * Generate a unique Hallmark ID
   */
  private generateHallmarkId(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(8).toString('hex');
    return `hm_${timestamp}_${random}`;
  }
  
  /**
   * Generate a unique serial number for a user
   * Format: HW-{USERID}-{0001} where USERID is the sanitized user ID
   */
  private generateSerialNumber(userId: string, serial: number): string {
    // Sanitize user ID: keep alphanumeric only, uppercase, max 12 chars
    const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 12);
    return `HW-${cleanUserId}-${serial.toString().padStart(4, '0')}`;
  }
  
  /**
   * Get or create a user's Hallmark profile
   */
  async getOrCreateProfile(userId: string, displayName?: string): Promise<HallmarkProfile> {
    const [existing] = await db.select()
      .from(hallmarkProfiles)
      .where(eq(hallmarkProfiles.userId, userId))
      .limit(1);
    
    if (existing) {
      return existing as HallmarkProfile;
    }
    
    // Create new profile
    const [profile] = await db.insert(hallmarkProfiles).values({
      userId,
      avatarType: 'agent',
      currentSerial: 0,
      preferredTemplate: 'classic',
      displayName: displayName || null,
    }).returning();
    
    return profile as HallmarkProfile;
  }
  
  /**
   * Update a user's Hallmark profile
   */
  async updateProfile(userId: string, updates: Partial<{
    avatarType: string;
    avatarId: string;
    customAvatarUrl: string;
    preferredTemplate: string;
    displayName: string;
    bio: string;
  }>): Promise<HallmarkProfile> {
    const [profile] = await db.update(hallmarkProfiles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(hallmarkProfiles.userId, userId))
      .returning();
    
    return profile as HallmarkProfile;
  }
  
  /**
   * Create a draft Hallmark (before payment)
   */
  async createDraftHallmark(userId: string, options?: {
    avatarType?: string;
    avatarId?: string;
    template?: string;
  }): Promise<HallmarkMint> {
    // Get or create profile
    const profile = await this.getOrCreateProfile(userId);
    
    // Get recent audit events for this user
    const recentEvents = await db.select()
      .from(auditEvents)
      .where(eq(auditEvents.userId, userId))
      .orderBy(desc(auditEvents.createdAt))
      .limit(10);
    
    // Increment serial
    const newSerial = profile.currentSerial + 1;
    const serialNumber = this.generateSerialNumber(userId, newSerial);
    
    // Build payload for hashing
    const payload = {
      userId,
      serialNumber,
      avatarType: options?.avatarType || profile.avatarType,
      avatarId: options?.avatarId || profile.avatarId,
      template: options?.template || profile.preferredTemplate || 'classic',
      recentEventHashes: recentEvents.map(e => e.payloadHash),
      createdAt: new Date().toISOString(),
    };
    
    const payloadHash = createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');
    
    // Create the draft mint
    const hallmarkId = this.generateHallmarkId();
    const [mint] = await db.insert(hallmarkMints).values({
      id: hallmarkId,
      userId,
      serialNumber,
      avatarSnapshot: JSON.stringify({
        type: options?.avatarType || profile.avatarType,
        id: options?.avatarId || profile.avatarId,
      }),
      templateUsed: options?.template || profile.preferredTemplate || 'classic',
      payloadHash,
      auditEventIds: JSON.stringify(recentEvents.map(e => e.id)),
      priceUsd: this.HALLMARK_PRICE_USD,
      status: 'draft',
    }).returning();
    
    console.log(`📋 [Hallmark] Draft created: ${serialNumber}`, { hallmarkId, payloadHash: payloadHash.substring(0, 16) + '...' });
    
    return mint as HallmarkMint;
  }
  
  /**
   * Process payment for a Hallmark
   */
  async processPayment(hallmarkId: string, paymentInfo: {
    provider: string;
    paymentId: string;
  }): Promise<HallmarkMint> {
    // Get the hallmark
    const [hallmark] = await db.select()
      .from(hallmarkMints)
      .where(eq(hallmarkMints.id, hallmarkId))
      .limit(1);
    
    if (!hallmark) {
      throw new Error('Hallmark not found');
    }
    
    if (hallmark.status !== 'draft') {
      throw new Error('Hallmark is not in draft status');
    }
    
    // Update to paid status
    const [updated] = await db.update(hallmarkMints)
      .set({
        paymentProvider: paymentInfo.provider,
        paymentId: paymentInfo.paymentId,
        status: 'paid',
        paidAt: new Date(),
      })
      .where(eq(hallmarkMints.id, hallmarkId))
      .returning();
    
    // Update user's serial counter
    const [profile] = await db.select()
      .from(hallmarkProfiles)
      .where(eq(hallmarkProfiles.userId, hallmark.userId))
      .limit(1);
    
    if (profile) {
      await db.update(hallmarkProfiles)
        .set({
          currentSerial: profile.currentSerial + 1,
          updatedAt: new Date(),
        })
        .where(eq(hallmarkProfiles.userId, hallmark.userId));
    }
    
    // Log the purchase event
    await auditTrailService.logEvent({
      userId: hallmark.userId,
      eventType: AUDIT_EVENT_TYPES.HALLMARK_PURCHASED,
      category: EVENT_CATEGORIES.HALLMARK,
      data: {
        hallmarkId,
        serialNumber: hallmark.serialNumber,
        amount: this.HALLMARK_PRICE_USD,
        provider: paymentInfo.provider,
      },
    });
    
    console.log(`💰 [Hallmark] Payment processed: ${hallmark.serialNumber}`);
    
    // Queue for minting
    this.queueForMinting(hallmarkId);
    
    return updated as HallmarkMint;
  }
  
  /**
   * Queue a hallmark for on-chain minting
   */
  private async queueForMinting(hallmarkId: string): Promise<void> {
    // Check if wallet is configured
    const walletConfigured = await auditTrailService.isWalletConfigured();
    
    if (!walletConfigured) {
      console.log(`⏳ [Hallmark] ${hallmarkId} queued for minting - waiting for wallet`);
      return;
    }
    
    // Will be implemented with full Helius/Metaplex integration
    this.processHallmarkMint(hallmarkId);
  }
  
  /**
   * Process the actual NFT minting
   */
  private async processHallmarkMint(hallmarkId: string): Promise<void> {
    // This will be fully implemented when wallet is configured
    console.log(`🎨 [Hallmark] Would mint NFT for ${hallmarkId}`);
  }
  
  /**
   * Get a user's Hallmark collection
   */
  async getUserHallmarks(userId: string): Promise<HallmarkMint[]> {
    const hallmarks = await db.select()
      .from(hallmarkMints)
      .where(and(
        eq(hallmarkMints.userId, userId),
        sql`${hallmarkMints.status} != 'draft'`
      ))
      .orderBy(desc(hallmarkMints.createdAt));
    
    return hallmarks as HallmarkMint[];
  }
  
  /**
   * Get a specific Hallmark by ID
   */
  async getHallmark(hallmarkId: string): Promise<HallmarkMint | null> {
    const [hallmark] = await db.select()
      .from(hallmarkMints)
      .where(eq(hallmarkMints.id, hallmarkId))
      .limit(1);
    
    return hallmark as HallmarkMint | null;
  }
  
  /**
   * Get Hallmark by serial number
   */
  async getHallmarkBySerial(serialNumber: string): Promise<HallmarkMint | null> {
    const [hallmark] = await db.select()
      .from(hallmarkMints)
      .where(eq(hallmarkMints.serialNumber, serialNumber))
      .limit(1);
    
    return hallmark as HallmarkMint | null;
  }
  
  /**
   * Verify a Hallmark's authenticity
   */
  async verifyHallmark(serialNumber: string): Promise<{
    valid: boolean;
    hallmark?: HallmarkMint;
    onChain?: boolean;
  }> {
    const hallmark = await this.getHallmarkBySerial(serialNumber);
    
    if (!hallmark) {
      return { valid: false };
    }
    
    return {
      valid: true,
      hallmark,
      onChain: !!hallmark.memoSignature,
    };
  }
  
  /**
   * Get statistics for admin dashboard
   */
  async getStats(): Promise<{
    totalHallmarks: number;
    pendingMints: number;
    mintedHallmarks: number;
    totalRevenue: number;
    hallmarksByTemplate: Record<string, number>;
  }> {
    const allHallmarks = await db.select()
      .from(hallmarkMints)
      .where(sql`${hallmarkMints.status} != 'draft'`);
    
    const stats = {
      totalHallmarks: allHallmarks.length,
      pendingMints: allHallmarks.filter(h => h.status === 'paid').length,
      mintedHallmarks: allHallmarks.filter(h => h.status === 'minted').length,
      totalRevenue: allHallmarks.filter(h => h.paidAt).length * parseFloat(this.HALLMARK_PRICE_USD),
      hallmarksByTemplate: {} as Record<string, number>,
    };
    
    allHallmarks.forEach(h => {
      const template = h.templateUsed;
      stats.hallmarksByTemplate[template] = (stats.hallmarksByTemplate[template] || 0) + 1;
    });
    
    return stats;
  }
}

// Export singleton instance
export const hallmarkService = new HallmarkService();
