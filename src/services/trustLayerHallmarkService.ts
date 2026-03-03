import { createHash, randomBytes } from 'crypto';
import { db } from '../db/client.js';
import { trustLayerHallmarks, hallmarkCounter } from '../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';

const APP_PREFIX = 'PU';
const COUNTER_ID = 'pu-master';

function generateSimulatedTxHash(): string {
  return '0x' + randomBytes(32).toString('hex');
}

function generateSimulatedBlockHeight(): string {
  return String(1000000 + Math.floor(Math.random() * 9000000));
}

function formatHallmarkId(prefix: string, sequence: number): string {
  return `${prefix}-${sequence.toString().padStart(8, '0')}`;
}

function hashPayload(payload: Record<string, any>): string {
  const jsonStr = JSON.stringify(payload);
  return createHash('sha256').update(jsonStr).digest('hex');
}

export async function generateHallmark(params: {
  userId?: string;
  appId: string;
  appName: string;
  productName: string;
  releaseType: string;
  metadata?: Record<string, any>;
}): Promise<any> {
  const result = await db.execute(sql`
    INSERT INTO hallmark_counter (id, current_sequence)
    VALUES (${COUNTER_ID}, '1')
    ON CONFLICT (id) DO UPDATE
    SET current_sequence = (CAST(hallmark_counter.current_sequence AS integer) + 1)::text
    RETURNING current_sequence
  `);

  const newSequence = parseInt((result as any).rows?.[0]?.current_sequence || (result as any)[0]?.current_sequence || '1', 10);
  const thId = formatHallmarkId(APP_PREFIX, newSequence);

  const payload = {
    thId,
    userId: params.userId || null,
    appId: params.appId,
    appName: params.appName,
    productName: params.productName,
    releaseType: params.releaseType,
    metadata: params.metadata || {},
    timestamp: new Date().toISOString(),
  };

  const dataHash = hashPayload(payload);
  const txHash = generateSimulatedTxHash();
  const blockHeight = generateSimulatedBlockHeight();
  const verificationUrl = `https://pulse.tlid.io/api/hallmark/${thId}/verify`;

  const [hallmark] = await db.insert(trustLayerHallmarks).values({
    thId,
    userId: params.userId || null,
    appId: params.appId,
    appName: params.appName,
    productName: params.productName,
    releaseType: params.releaseType,
    metadata: params.metadata || {},
    dataHash,
    txHash,
    blockHeight,
    verificationUrl,
    hallmarkId: newSequence,
  }).returning();

  console.log(`🏅 [TrustLayer] Hallmark generated: ${thId} (hash: ${dataHash.substring(0, 16)}...)`);
  return hallmark;
}

export async function createGenesisHallmark(): Promise<any> {
  const genesisId = formatHallmarkId(APP_PREFIX, 1);

  const [existing] = await db.select()
    .from(trustLayerHallmarks)
    .where(eq(trustLayerHallmarks.thId, genesisId))
    .limit(1);

  if (existing) {
    console.log(`🏅 [TrustLayer] Genesis hallmark ${genesisId} already exists.`);
    return existing;
  }

  await db.execute(sql`
    INSERT INTO hallmark_counter (id, current_sequence)
    VALUES (${COUNTER_ID}, '0')
    ON CONFLICT (id) DO UPDATE
    SET current_sequence = '0'
  `);

  const hallmark = await generateHallmark({
    appId: 'pulse-genesis',
    appName: 'Pulse',
    productName: 'Genesis Block',
    releaseType: 'genesis',
    metadata: {
      ecosystem: 'Trust Layer',
      version: '1.0.0',
      domain: 'pulse.tlid.io',
      operator: 'DarkWave Studios LLC',
      chain: 'Trust Layer Blockchain',
      consensus: 'Proof of Trust',
      launchDate: '2026-08-23T00:00:00.000Z',
      nativeAsset: 'SIG',
      utilityToken: 'Shells',
      parentApp: 'Trust Layer Hub',
      parentGenesis: 'TH-00000001',
    },
  });

  console.log(`🏅 [TrustLayer] Genesis hallmark created: ${genesisId}`);
  return hallmark;
}

export async function verifyHallmark(hallmarkId: string): Promise<{
  verified: boolean;
  hallmark?: any;
  error?: string;
}> {
  const [hallmark] = await db.select()
    .from(trustLayerHallmarks)
    .where(eq(trustLayerHallmarks.thId, hallmarkId))
    .limit(1);

  if (!hallmark) {
    return { verified: false, error: 'Hallmark not found' };
  }

  return {
    verified: true,
    hallmark: {
      thId: hallmark.thId,
      appName: hallmark.appName,
      productName: hallmark.productName,
      releaseType: hallmark.releaseType,
      dataHash: hallmark.dataHash,
      txHash: hallmark.txHash,
      blockHeight: hallmark.blockHeight,
      createdAt: hallmark.createdAt,
    },
  };
}

export async function getHallmarkById(hallmarkId: string): Promise<any | null> {
  const [hallmark] = await db.select()
    .from(trustLayerHallmarks)
    .where(eq(trustLayerHallmarks.thId, hallmarkId))
    .limit(1);

  return hallmark || null;
}

export async function getUserHallmarks(userId: string): Promise<any[]> {
  const hallmarks = await db.select()
    .from(trustLayerHallmarks)
    .where(eq(trustLayerHallmarks.userId, userId))
    .orderBy(desc(trustLayerHallmarks.createdAt));

  return hallmarks;
}
