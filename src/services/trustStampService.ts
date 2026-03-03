import { createHash, randomBytes } from 'crypto';
import { db } from '../db/client.js';
import { trustStamps } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

const STANDARDIZED_CATEGORIES = [
  'auth-login',
  'auth-register',
  'auth-logout',
  'profile-update',
  'wallet-send',
  'wallet-receive',
  'wallet-swap',
  'staking-stake',
  'staking-unstake',
  'purchase',
  'subscription-start',
  'subscription-cancel',
  'stripe-connect',
  'stripe-disconnect',
  'affiliate-payout-request',
  'affiliate-referral-converted',
  'hallmark-generated',
] as const;

interface CreateTrustStampParams {
  userId?: string | null;
  category: string;
  data: Record<string, any>;
}

function generateSimulatedTxHash(): string {
  return '0x' + randomBytes(32).toString('hex');
}

function generateSimulatedBlockHeight(): string {
  return String(1000000 + Math.floor(Math.random() * 9000000));
}

function hashPayload(payload: Record<string, any>): string {
  const jsonString = JSON.stringify(payload);
  return createHash('sha256').update(jsonString).digest('hex');
}

export async function createTrustStamp(params: CreateTrustStampParams) {
  const { userId, category, data } = params;

  const stampData = {
    ...data,
    appContext: data.appContext || 'pulse',
    timestamp: new Date().toISOString(),
  };

  const dataHash = hashPayload(stampData);
  const txHash = generateSimulatedTxHash();
  const blockHeight = generateSimulatedBlockHeight();

  const [stamp] = await db.insert(trustStamps).values({
    userId: userId ?? null,
    category,
    data: stampData,
    dataHash,
    txHash,
    blockHeight,
  }).returning();

  console.log(`🔏 [TrustStamp] Created stamp: category=${category}, hash=${dataHash.substring(0, 16)}...`);

  return stamp;
}

export async function getStampsByUser(userId: string, limit = 50) {
  const stamps = await db.select()
    .from(trustStamps)
    .where(eq(trustStamps.userId, userId))
    .orderBy(desc(trustStamps.createdAt))
    .limit(limit);

  return stamps;
}

export async function getStampsByCategory(category: string, limit = 50) {
  const stamps = await db.select()
    .from(trustStamps)
    .where(eq(trustStamps.category, category))
    .orderBy(desc(trustStamps.createdAt))
    .limit(limit);

  return stamps;
}
