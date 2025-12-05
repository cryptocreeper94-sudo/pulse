import { createHash, randomBytes } from 'crypto';
import { db } from '../db/client.js';
import { auditEvents, hallmarkProfiles, hallmarkMints, systemConfig } from '../db/schema.js';
import { eq, desc, and, sql } from 'drizzle-orm';
import { Connection, Keypair, Transaction, TransactionInstruction, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// Event types that get hashed to Solana
export const AUDIT_EVENT_TYPES = {
  // Account Events
  ACCOUNT_CREATED: 'account.created',
  ACCOUNT_UPDATED: 'account.updated',
  ACCOUNT_DELETED: 'account.deleted',
  EMAIL_VERIFIED: 'account.email_verified',
  SETTINGS_CHANGED: 'account.settings_changed',
  
  // Subscription Events
  SUBSCRIPTION_STARTED: 'subscription.started',
  SUBSCRIPTION_UPGRADED: 'subscription.upgraded',
  SUBSCRIPTION_DOWNGRADED: 'subscription.downgraded',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  
  // Payment Events
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  REFUND_ISSUED: 'payment.refund',
  
  // Wallet Events
  WALLET_CONNECTED: 'wallet.connected',
  WALLET_DISCONNECTED: 'wallet.disconnected',
  WALLET_BALANCE_SNAPSHOT: 'wallet.balance_snapshot',
  
  // Presale/Founder Events
  WHITELIST_SIGNUP: 'presale.whitelist_signup',
  PRESALE_PARTICIPATION: 'presale.participation',
  NFT_ALLOCATION: 'presale.nft_allocation',
  TOKEN_CLAIM: 'presale.token_claim',
  
  // Security Events
  LOGIN_NEW_DEVICE: 'security.new_device_login',
  PASSWORD_CHANGED: 'security.password_changed',
  TWO_FA_ENABLED: 'security.2fa_enabled',
  TWO_FA_DISABLED: 'security.2fa_disabled',
  
  // Hallmark Events
  HALLMARK_PURCHASED: 'hallmark.purchased',
  HALLMARK_MINTED: 'hallmark.minted',
  
  // System Events
  SYSTEM_DEPLOYMENT: 'system.deployment',
  SYSTEM_VERSION_STAMP: 'system.version_stamp',
  SYSTEM_REPAIR_REPLACE: 'system.repair_replace',
} as const;

export type AuditEventType = typeof AUDIT_EVENT_TYPES[keyof typeof AUDIT_EVENT_TYPES];

export const EVENT_CATEGORIES = {
  ACCOUNT: 'account',
  SUBSCRIPTION: 'subscription',
  PAYMENT: 'payment',
  WALLET: 'wallet',
  PRESALE: 'presale',
  SECURITY: 'security',
  HALLMARK: 'hallmark',
  SYSTEM: 'system',
} as const;

interface AuditEventPayload {
  userId: string;
  eventType: AuditEventType;
  category: string;
  actor?: string;
  data: Record<string, any>;
  timestamp?: Date;
}

interface AuditEvent {
  id: string;
  userId: string;
  eventType: string;
  eventCategory: string;
  actor: string | null;
  payload: string;
  payloadHash: string;
  hashAlgorithm: string;
  status: string;
  onchainSignature: string | null;
  heliusTxId: string | null;
  solanaSlot: number | null;
  createdAt: Date;
  processedAt: Date | null;
  confirmedAt: Date | null;
}

class AuditTrailService {
  private isInitialized = false;
  
  async initialize(): Promise<void> {
    this.isInitialized = true;
    console.log('✅ [AuditTrail] Service initialized');
  }
  
  /**
   * Generate a deterministic hash from a payload
   */
  private generateHash(payload: Record<string, any>): string {
    // Sort keys for deterministic JSON
    const sortedPayload = this.sortObjectKeys(payload);
    const canonicalJson = JSON.stringify(sortedPayload);
    return createHash('sha256').update(canonicalJson).digest('hex');
  }
  
  /**
   * Recursively sort object keys for deterministic serialization
   */
  private sortObjectKeys(obj: Record<string, any>): Record<string, any> {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.sortObjectKeys(item));
    
    return Object.keys(obj)
      .sort()
      .reduce((sorted: Record<string, any>, key) => {
        sorted[key] = this.sortObjectKeys(obj[key]);
        return sorted;
      }, {});
  }
  
  /**
   * Generate a unique event ID
   */
  private generateEventId(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(8).toString('hex');
    return `evt_${timestamp}_${random}`;
  }
  
  /**
   * Log an audit event
   */
  async logEvent(eventPayload: AuditEventPayload): Promise<AuditEvent> {
    // Auto-initialize if needed
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const eventId = this.generateEventId();
    const timestamp = eventPayload.timestamp || new Date();
    
    // Build the canonical payload
    const canonicalPayload = {
      eventId,
      userId: eventPayload.userId,
      eventType: eventPayload.eventType,
      category: eventPayload.category,
      actor: eventPayload.actor || eventPayload.userId,
      timestamp: timestamp.toISOString(),
      data: eventPayload.data,
    };
    
    // Generate deterministic hash
    const payloadHash = this.generateHash(canonicalPayload);
    
    // Store in database
    const [event] = await db.insert(auditEvents).values({
      id: eventId,
      userId: eventPayload.userId,
      eventType: eventPayload.eventType,
      eventCategory: eventPayload.category,
      actor: eventPayload.actor || eventPayload.userId,
      payload: JSON.stringify(canonicalPayload),
      payloadHash,
      hashAlgorithm: 'SHA-256',
      status: 'pending',
      createdAt: timestamp,
    }).returning();
    
    console.log(`📝 [AuditTrail] Event logged: ${eventPayload.eventType}`, { eventId, payloadHash: payloadHash.substring(0, 16) + '...' });
    
    // Queue for on-chain processing if wallet is configured
    this.queueForOnChain(eventId);
    
    return event as AuditEvent;
  }
  
  /**
   * Queue an event for on-chain processing
   */
  private async queueForOnChain(eventId: string): Promise<void> {
    // Check if Solana wallet is configured
    const walletConfigured = await this.isWalletConfigured();
    
    if (!walletConfigured) {
      console.log(`⏳ [AuditTrail] Event ${eventId} queued - waiting for wallet configuration`);
      return;
    }
    
    // Process the event (will be implemented with Helius)
    this.processOnChain(eventId);
  }
  
  /**
   * Check if Solana audit wallet is configured
   */
  async isWalletConfigured(): Promise<boolean> {
    try {
      const [config] = await db.select()
        .from(systemConfig)
        .where(eq(systemConfig.key, 'solana_audit_wallet'))
        .limit(1);
      
      return !!config?.value;
    } catch {
      return false;
    }
  }
  
  /**
   * Process an event to post on-chain via Helius
   */
  private async processOnChain(eventId: string): Promise<void> {
    try {
      // Get the event
      const [event] = await db.select()
        .from(auditEvents)
        .where(eq(auditEvents.id, eventId))
        .limit(1);
      
      if (!event) {
        console.error(`❌ [AuditTrail] Event not found: ${eventId}`);
        return;
      }
      
      // Get Helius API key
      const heliusApiKey = process.env.HELIUS_API_KEY;
      if (!heliusApiKey) {
        console.log('⚠️ [AuditTrail] HELIUS_API_KEY not configured');
        return;
      }
      
      // Get wallet configuration
      const [walletConfig] = await db.select()
        .from(systemConfig)
        .where(eq(systemConfig.key, 'solana_audit_wallet'))
        .limit(1);
      
      if (!walletConfig?.value) {
        console.log('⚠️ [AuditTrail] Solana wallet not configured');
        return;
      }
      
      // Post to Solana via Helius Memo program
      const txSignature = await this.postToSolanaMemo(
        event.payloadHash,
        eventId,
        heliusApiKey,
        walletConfig.value
      );
      
      if (txSignature) {
        // Update event with on-chain info
        await db.update(auditEvents)
          .set({
            status: 'confirmed',
            onchainSignature: txSignature,
            processedAt: new Date(),
            confirmedAt: new Date(),
          })
          .where(eq(auditEvents.id, eventId));
        
        console.log(`✅ [AuditTrail] Event ${eventId} posted on-chain: ${txSignature}`);
      }
    } catch (error: any) {
      console.error(`❌ [AuditTrail] Failed to process on-chain: ${error.message}`);
      
      // Mark as failed
      await db.update(auditEvents)
        .set({
          status: 'failed',
          processedAt: new Date(),
        })
        .where(eq(auditEvents.id, eventId));
    }
  }
  
  /**
   * Post a hash to Solana via Helius using Memo program
   */
  private async postToSolanaMemo(
    payloadHash: string,
    eventId: string,
    heliusApiKey: string,
    _walletPublicKey: string
  ): Promise<string | null> {
    try {
      // Get the audit wallet private key from environment
      const walletPrivateKey = process.env.SOLANA_AUDIT_WALLET_KEY;
      if (!walletPrivateKey) {
        console.log('⚠️ [AuditTrail] SOLANA_AUDIT_WALLET_KEY not configured');
        return null;
      }
      
      // Decode the private key and create keypair
      const secretKey = bs58.decode(walletPrivateKey);
      const payer = Keypair.fromSecretKey(secretKey);
      
      // Create connection to Helius RPC
      const connection = new Connection(
        `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`,
        'confirmed'
      );
      
      // Create memo content: eventId + hash (max 566 bytes for memo)
      const memoContent = `DWP:${eventId}:${payloadHash}`;
      
      // Create memo instruction
      const memoInstruction = new TransactionInstruction({
        keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: false }],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memoContent, 'utf-8'),
      });
      
      // Create and send transaction
      const transaction = new Transaction().add(memoInstruction);
      
      console.log(`🔗 [AuditTrail] Posting to Solana: ${payloadHash.substring(0, 16)}... for event ${eventId}`);
      
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payer],
        { commitment: 'confirmed' }
      );
      
      console.log(`✅ [AuditTrail] Solana tx confirmed: ${signature}`);
      return signature;
      
    } catch (error: any) {
      console.error(`❌ [AuditTrail] Solana memo failed: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Get audit trail for a user
   */
  async getUserAuditTrail(userId: string, limit = 50): Promise<AuditEvent[]> {
    const events = await db.select()
      .from(auditEvents)
      .where(eq(auditEvents.userId, userId))
      .orderBy(desc(auditEvents.createdAt))
      .limit(limit);
    
    return events as AuditEvent[];
  }
  
  /**
   * Get pending events that need on-chain processing
   */
  async getPendingEvents(limit = 100): Promise<AuditEvent[]> {
    const events = await db.select()
      .from(auditEvents)
      .where(eq(auditEvents.status, 'pending'))
      .orderBy(auditEvents.createdAt)
      .limit(limit);
    
    return events as AuditEvent[];
  }
  
  /**
   * Verify an event hash
   */
  async verifyEventHash(eventId: string): Promise<{ valid: boolean; event?: AuditEvent; computedHash?: string }> {
    const [event] = await db.select()
      .from(auditEvents)
      .where(eq(auditEvents.id, eventId))
      .limit(1);
    
    if (!event) {
      return { valid: false };
    }
    
    const payload = JSON.parse(event.payload);
    const computedHash = this.generateHash(payload);
    
    return {
      valid: computedHash === event.payloadHash,
      event: event as AuditEvent,
      computedHash,
    };
  }
  
  /**
   * Get statistics for admin dashboard
   */
  async getStats(): Promise<{
    totalEvents: number;
    pendingEvents: number;
    confirmedEvents: number;
    failedEvents: number;
    eventsByCategory: Record<string, number>;
  }> {
    const allEvents = await db.select().from(auditEvents);
    
    const stats = {
      totalEvents: allEvents.length,
      pendingEvents: allEvents.filter(e => e.status === 'pending').length,
      confirmedEvents: allEvents.filter(e => e.status === 'confirmed').length,
      failedEvents: allEvents.filter(e => e.status === 'failed').length,
      eventsByCategory: {} as Record<string, number>,
    };
    
    allEvents.forEach(event => {
      const category = event.eventCategory;
      stats.eventsByCategory[category] = (stats.eventsByCategory[category] || 0) + 1;
    });
    
    return stats;
  }
}

// Export singleton instance
export const auditTrailService = new AuditTrailService();

// Helper function to log common events
export async function logAccountEvent(userId: string, eventType: AuditEventType, data: Record<string, any>) {
  return auditTrailService.logEvent({
    userId,
    eventType,
    category: EVENT_CATEGORIES.ACCOUNT,
    data,
  });
}

export async function logPaymentEvent(userId: string, eventType: AuditEventType, data: Record<string, any>) {
  return auditTrailService.logEvent({
    userId,
    eventType,
    category: EVENT_CATEGORIES.PAYMENT,
    data,
  });
}

export async function logSubscriptionEvent(userId: string, eventType: AuditEventType, data: Record<string, any>) {
  return auditTrailService.logEvent({
    userId,
    eventType,
    category: EVENT_CATEGORIES.SUBSCRIPTION,
    data,
  });
}

export async function logWalletEvent(userId: string, eventType: AuditEventType, data: Record<string, any>) {
  return auditTrailService.logEvent({
    userId,
    eventType,
    category: EVENT_CATEGORIES.WALLET,
    data,
  });
}

export async function logSecurityEvent(userId: string, eventType: AuditEventType, data: Record<string, any>) {
  return auditTrailService.logEvent({
    userId,
    eventType,
    category: EVENT_CATEGORIES.SECURITY,
    data,
  });
}

export async function logSystemEvent(eventType: AuditEventType, data: Record<string, any>) {
  return auditTrailService.logEvent({
    userId: 'SYSTEM',
    eventType,
    category: EVENT_CATEGORIES.SYSTEM,
    actor: 'system',
    data,
  });
}

/**
 * Stamp a deployment/version to Solana
 */
export async function stampDeployment(version: string, description: string, deploymentType: 'release' | 'hotfix' | 'repair_replace' = 'release') {
  const eventType = deploymentType === 'repair_replace' 
    ? AUDIT_EVENT_TYPES.SYSTEM_REPAIR_REPLACE 
    : AUDIT_EVENT_TYPES.SYSTEM_DEPLOYMENT;
    
  return auditTrailService.logEvent({
    userId: 'SYSTEM',
    eventType,
    category: EVENT_CATEGORIES.SYSTEM,
    actor: 'admin',
    data: {
      version,
      description,
      deploymentType,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
    },
  });
}
