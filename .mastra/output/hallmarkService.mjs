import { randomBytes, createHash } from 'crypto';
import { d as db, h as hallmarkProfiles, b as auditEvents, c as hallmarkMints } from './client.mjs';
import { eq, desc, and, sql } from 'drizzle-orm';
import { a as auditTrailService, E as EVENT_CATEGORIES, A as AUDIT_EVENT_TYPES, d as darkwaveChainClient } from './index.mjs';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import '@mastra/core/eval';
import '@mastra/core/hooks';
import '@mastra/core/storage';
import '@mastra/core/scores/scoreTraces';
import '@mastra/core/utils';
import '@mastra/core';
import '@mastra/core/error';
import '@mastra/loggers';
import '@mastra/mcp';
import 'inngest';
import 'zod';
import 'axios';
import '@mastra/pg';
import '@inngest/realtime';
import '@mastra/inngest';
import '@solana/web3.js';
import 'bs58';
import './technicalAnalysisTool.mjs';
import '@mastra/core/tools';
import 'technicalindicators';
import './subscriptionCheck.mjs';
import 'uuid';
import 'pino';
import 'ethers';
import './tools/43e67546-a7df-4486-a8f6-203e85f8295e.mjs';
import './tools/9b8623f4-2d53-4e39-a9df-1dbd9309d5d0.mjs';
import './tools/cb15bcd7-6fb6-49f5-8432-0753fc5066a7.mjs';
import './tools/ea768fa3-0d7c-4189-b730-250e1659adac.mjs';
import './tools/a807c9a5-b54e-4867-a0a1-97c1d636fa90.mjs';
import './tools/4484916e-7530-45e5-90b9-555889d9d8e5.mjs';
import '@ai-sdk/openai';
import '@mastra/core/agent';
import '@mastra/memory';
import './tools/ed21de59-e62a-4798-8f55-d411ffe8a47c.mjs';
import './tools/9b3c2d57-ca30-45ee-b4de-be2e3c7eb1c8.mjs';
import './tools/bda10c6d-9db0-4209-8998-45e4827f9523.mjs';
import './tools/210a62a8-9dff-46c9-a27a-33d36c7a8dfe.mjs';
import './tools/8ea93424-190c-4ec1-879f-ae2c2b7d17de.mjs';
import './tools/5a705921-0f70-47b2-a33b-670de3d05455.mjs';
import './tools/86c71d03-71ac-4986-8275-8e2c4275d55b.mjs';
import './tools/599fabfb-b31c-4f0b-9a34-c6e4b5bb2106.mjs';
import './tools/740167e1-f813-4f44-a9aa-fa9bbb266993.mjs';
import './tools/839c65c9-82fa-4b2c-856c-e94b48b9218d.mjs';
import './tools/f61df5ce-c5f5-49c7-a3cb-411eab7625a1.mjs';
import './tools/f22fbb9a-fdbf-4968-a35d-e52698d45ee1.mjs';
import './tools/fb9b7a84-c601-4747-a274-8d8402f359d7.mjs';
import './tools/1ffc711a-8fe4-4a9c-8f24-026e7dc0c718.mjs';
import 'stripe';
import 'bip39';
import 'ed25519-hd-key';
import '@trustwallet/wallet-core';
import '@solana/spl-token';
import '@sqds/multisig';
import '@safe-global/protocol-kit';
import 'bcrypt';
import '@simplewebauthn/server';
import 'fs/promises';
import 'https';
import 'path/posix';
import 'http';
import 'http2';
import 'stream';
import 'fs';
import 'path';
import '@mastra/core/runtime-context';
import '@mastra/core/telemetry';
import '@mastra/core/llm';
import '@mastra/core/stream';
import 'util';
import 'buffer';
import '@mastra/core/ai-tracing';
import '@mastra/core/utils/zod-to-json';
import '@mastra/core/a2a';
import 'stream/web';
import '@mastra/core/memory';
import 'zod/v4';
import 'zod/v3';
import 'child_process';
import 'module';
import 'os';
import '@mastra/core/workflows';
import './tools.mjs';

class HallmarkService {
  HALLMARK_PRICE_USD = "1.99";
  /**
   * Generate a unique Hallmark ID
   */
  generateHallmarkId() {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(8).toString("hex");
    return `hm_${timestamp}_${random}`;
  }
  /**
   * Generate a unique serial number for a user
   * Format: HW-{USERID}-{0001} where USERID is the sanitized user ID
   */
  generateSerialNumber(userId, serial) {
    const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().substring(0, 12);
    return `HW-${cleanUserId}-${serial.toString().padStart(4, "0")}`;
  }
  /**
   * Get or create a user's Hallmark profile
   */
  async getOrCreateProfile(userId, displayName) {
    const [existing] = await db.select().from(hallmarkProfiles).where(eq(hallmarkProfiles.userId, userId)).limit(1);
    if (existing) {
      return existing;
    }
    const [profile] = await db.insert(hallmarkProfiles).values({
      userId,
      avatarType: "agent",
      currentSerial: 0,
      preferredTemplate: "classic",
      displayName: displayName || null
    }).returning();
    return profile;
  }
  /**
   * Update a user's Hallmark profile
   */
  async updateProfile(userId, updates) {
    const [profile] = await db.update(hallmarkProfiles).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(hallmarkProfiles.userId, userId)).returning();
    return profile;
  }
  /**
   * Create a draft Hallmark (before payment)
   */
  async createDraftHallmark(userId, options) {
    const profile = await this.getOrCreateProfile(userId);
    const recentEvents = await db.select().from(auditEvents).where(eq(auditEvents.userId, userId)).orderBy(desc(auditEvents.createdAt)).limit(10);
    const newSerial = profile.currentSerial + 1;
    const serialNumber = this.generateSerialNumber(userId, newSerial);
    const payload = {
      userId,
      serialNumber,
      avatarType: options?.avatarType || profile.avatarType,
      avatarId: options?.avatarId || profile.avatarId,
      template: options?.template || profile.preferredTemplate || "classic",
      recentEventHashes: recentEvents.map((e) => e.payloadHash),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const payloadHash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    const hallmarkId = this.generateHallmarkId();
    const [mint] = await db.insert(hallmarkMints).values({
      id: hallmarkId,
      userId,
      serialNumber,
      avatarSnapshot: JSON.stringify({
        type: options?.avatarType || profile.avatarType,
        id: options?.avatarId || profile.avatarId
      }),
      templateUsed: options?.template || profile.preferredTemplate || "classic",
      payloadHash,
      auditEventIds: JSON.stringify(recentEvents.map((e) => e.id)),
      priceUsd: this.HALLMARK_PRICE_USD,
      status: "draft"
    }).returning();
    console.log(`\u{1F4CB} [Hallmark] Draft created: ${serialNumber}`, { hallmarkId, payloadHash: payloadHash.substring(0, 16) + "..." });
    return mint;
  }
  /**
   * Process payment for a Hallmark
   */
  async processPayment(hallmarkId, paymentInfo) {
    const [hallmark] = await db.select().from(hallmarkMints).where(eq(hallmarkMints.id, hallmarkId)).limit(1);
    if (!hallmark) {
      throw new Error("Hallmark not found");
    }
    if (hallmark.status !== "draft") {
      throw new Error("Hallmark is not in draft status");
    }
    const [updated] = await db.update(hallmarkMints).set({
      paymentProvider: paymentInfo.provider,
      paymentId: paymentInfo.paymentId,
      status: "paid",
      paidAt: /* @__PURE__ */ new Date()
    }).where(eq(hallmarkMints.id, hallmarkId)).returning();
    const [profile] = await db.select().from(hallmarkProfiles).where(eq(hallmarkProfiles.userId, hallmark.userId)).limit(1);
    if (profile) {
      await db.update(hallmarkProfiles).set({
        currentSerial: profile.currentSerial + 1,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(hallmarkProfiles.userId, hallmark.userId));
    }
    await auditTrailService.logEvent({
      userId: hallmark.userId,
      eventType: AUDIT_EVENT_TYPES.HALLMARK_PURCHASED,
      category: EVENT_CATEGORIES.HALLMARK,
      data: {
        hallmarkId,
        serialNumber: hallmark.serialNumber,
        amount: this.HALLMARK_PRICE_USD,
        provider: paymentInfo.provider
      }
    });
    console.log(`\u{1F4B0} [Hallmark] Payment processed: ${hallmark.serialNumber}`);
    this.queueForMinting(hallmarkId);
    return updated;
  }
  /**
   * Queue a hallmark for on-chain minting
   */
  async queueForMinting(hallmarkId) {
    const walletConfigured = await auditTrailService.isWalletConfigured();
    if (!walletConfigured) {
      console.log(`\u23F3 [Hallmark] ${hallmarkId} queued for minting - waiting for wallet`);
      return;
    }
    this.processHallmarkMint(hallmarkId);
  }
  /**
   * Process the actual NFT minting via DarkWave Chain
   */
  async processHallmarkMint(hallmarkId) {
    try {
      const hallmark = await this.getHallmark(hallmarkId);
      if (!hallmark) {
        console.error(`\u274C [Hallmark] Hallmark not found: ${hallmarkId}`);
        return;
      }
      const result = await darkwaveChainClient.generateHallmark({
        productType: "pulse_hallmark",
        productId: hallmarkId,
        metadata: {
          serialNumber: hallmark.serialNumber,
          template: hallmark.templateUsed,
          payloadHash: hallmark.payloadHash,
          userId: hallmark.userId
        }
      });
      if (result.id) {
        await db.update(hallmarkMints).set({
          memoSignature: result.txHash || result.id,
          metadataUri: result.verificationUrl,
          status: "minted",
          mintedAt: /* @__PURE__ */ new Date()
        }).where(eq(hallmarkMints.id, hallmarkId));
        console.log(`\u{1F3A8} [Hallmark] ${hallmarkId} minted on DarkWave Chain: ${result.id}`);
      }
    } catch (error) {
      console.warn(`\u26A0\uFE0F [Hallmark] DarkWave Chain minting unavailable: ${error.message}`);
    }
  }
  /**
   * Verify a hallmark on DarkWave Chain
   */
  async verifyOnChain(hallmarkId) {
    try {
      const result = await darkwaveChainClient.verifyHallmark(hallmarkId);
      return {
        valid: result.valid,
        onChain: result.onChain,
        blockNumber: result.blockNumber,
        verificationUrl: result.hallmark?.verificationUrl
      };
    } catch (error) {
      return { valid: false, onChain: false };
    }
  }
  /**
   * Get a user's Hallmark collection
   */
  async getUserHallmarks(userId) {
    const hallmarks = await db.select().from(hallmarkMints).where(and(
      eq(hallmarkMints.userId, userId),
      sql`${hallmarkMints.status} != 'draft'`
    )).orderBy(desc(hallmarkMints.createdAt));
    return hallmarks;
  }
  /**
   * Get a specific Hallmark by ID
   */
  async getHallmark(hallmarkId) {
    const [hallmark] = await db.select().from(hallmarkMints).where(eq(hallmarkMints.id, hallmarkId)).limit(1);
    return hallmark;
  }
  /**
   * Get Hallmark by serial number
   */
  async getHallmarkBySerial(serialNumber) {
    const [hallmark] = await db.select().from(hallmarkMints).where(eq(hallmarkMints.serialNumber, serialNumber)).limit(1);
    return hallmark;
  }
  /**
   * Verify a Hallmark's authenticity
   */
  async verifyHallmark(serialNumber) {
    const hallmark = await this.getHallmarkBySerial(serialNumber);
    if (!hallmark) {
      return { valid: false };
    }
    return {
      valid: true,
      hallmark,
      onChain: !!hallmark.memoSignature
    };
  }
  /**
   * Get statistics for admin dashboard
   */
  async getStats() {
    const allHallmarks = await db.select().from(hallmarkMints).where(sql`${hallmarkMints.status} != 'draft'`);
    const stats = {
      totalHallmarks: allHallmarks.length,
      pendingMints: allHallmarks.filter((h) => h.status === "paid").length,
      mintedHallmarks: allHallmarks.filter((h) => h.status === "minted").length,
      totalRevenue: allHallmarks.filter((h) => h.paidAt).length * parseFloat(this.HALLMARK_PRICE_USD),
      hallmarksByTemplate: {}
    };
    allHallmarks.forEach((h) => {
      const template = h.templateUsed;
      stats.hallmarksByTemplate[template] = (stats.hallmarksByTemplate[template] || 0) + 1;
    });
    return stats;
  }
}
const hallmarkService = new HallmarkService();

export { hallmarkService };
//# sourceMappingURL=hallmarkService.mjs.map
