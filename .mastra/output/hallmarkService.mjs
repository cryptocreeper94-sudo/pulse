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
import './tools/b4bb918d-ac0b-4f21-a7e2-be17b541264b.mjs';
import './tools/a14f3839-fd98-49bf-9aba-24f9bb57d38f.mjs';
import './tools/280e17e9-9061-4195-8ab4-db6f440c6077.mjs';
import './tools/bd86d401-2379-48fd-b681-1e635a929012.mjs';
import './tools/3cb6a2f5-fe89-4e11-8a37-99904abb0924.mjs';
import './tools/338020ea-ee68-4220-ac6c-c49909ab6ee6.mjs';
import '@ai-sdk/openai';
import '@mastra/core/agent';
import '@mastra/memory';
import './tools/f1842152-a424-4646-aecc-5caab6023634.mjs';
import './tools/cde57a54-34d3-46c5-9a3f-77270722c384.mjs';
import './tools/0e8f4c25-82c5-4329-85af-cd734beadb71.mjs';
import './tools/10aacead-ec23-499c-8e6c-5b16df184e66.mjs';
import './tools/3a38ef64-efba-42dc-bd19-d316aa9697d0.mjs';
import './tools/790af2c5-ddc1-48c9-acce-b0a243d18162.mjs';
import './tools/e26fa63d-daf6-465b-b4af-44b43589f12c.mjs';
import './tools/7d53e7bc-c1a2-4d9a-bcdc-a5d8c104d888.mjs';
import './tools/e13f6e0f-fde4-4060-96f7-9f33dfff4323.mjs';
import './tools/a59b4a5f-fe62-4665-a0fb-60d1ab197b81.mjs';
import './tools/8720dfc5-a71b-4d10-a14b-60894cf7e977.mjs';
import './tools/c738dd40-ea4a-4266-80df-b84af25ddf05.mjs';
import './tools/2dd5083f-2455-4f1f-badd-8a1214e9fa54.mjs';
import './tools/2bb018e9-1f35-4d03-97db-e300fe09ff2e.mjs';
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
