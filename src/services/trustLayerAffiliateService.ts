import { db } from '../db/client.js';
import { affiliateReferrals, affiliateCommissions, userUniqueHashes } from '../db/schema.js';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { createTrustStamp } from './trustStampService.js';

const COMMISSION_TIERS = [
  { name: 'diamond', minReferrals: 50, rate: 0.20 },
  { name: 'platinum', minReferrals: 30, rate: 0.175 },
  { name: 'gold', minReferrals: 15, rate: 0.15 },
  { name: 'silver', minReferrals: 5, rate: 0.125 },
  { name: 'base', minReferrals: 0, rate: 0.10 },
] as const;

const APP_REGISTRY = [
  { name: 'Trust Layer Hub', domain: 'trusthub.tlid.io' },
  { name: 'Trust Layer (L1)', domain: 'dwtl.io' },
  { name: 'TrustHome', domain: 'trusthome.tlid.io' },
  { name: 'TrustVault', domain: 'trustvault.tlid.io' },
  { name: 'TLID.io', domain: 'tlid.io' },
  { name: 'THE VOID', domain: 'thevoid.tlid.io' },
  { name: 'Signal Chat', domain: 'signalchat.tlid.io' },
  { name: 'DarkWave Studio', domain: 'darkwavestudio.tlid.io' },
  { name: 'Guardian Shield', domain: 'guardianshield.tlid.io' },
  { name: 'Guardian Scanner', domain: 'guardianscanner.tlid.io' },
  { name: 'Guardian Screener', domain: 'guardianscreener.tlid.io' },
  { name: 'TradeWorks AI', domain: 'tradeworks.tlid.io' },
  { name: 'StrikeAgent', domain: 'strikeagent.tlid.io' },
  { name: 'Pulse', domain: 'pulse.tlid.io' },
  { name: 'Chronicles', domain: 'chronicles.tlid.io' },
  { name: 'The Arcade', domain: 'thearcade.tlid.io' },
  { name: 'Bomber', domain: 'bomber.tlid.io' },
  { name: 'Trust Golf', domain: 'trustgolf.tlid.io' },
  { name: 'ORBIT Staffing OS', domain: 'orbit.tlid.io' },
  { name: 'Orby Commander', domain: 'orby.tlid.io' },
  { name: 'GarageBot', domain: 'garagebot.tlid.io' },
  { name: 'Lot Ops Pro', domain: 'lotops.tlid.io' },
  { name: 'TORQUE', domain: 'torque.tlid.io' },
  { name: 'TL Driver Connect', domain: 'driverconnect.tlid.io' },
  { name: 'VedaSolus', domain: 'vedasolus.tlid.io' },
  { name: 'Verdara', domain: 'verdara.tlid.io' },
  { name: 'Arbora', domain: 'arbora.tlid.io' },
  { name: 'PaintPros', domain: 'paintpros.tlid.io' },
  { name: 'Nashville Painting Professionals', domain: 'nashvillepainting.tlid.io' },
  { name: 'Trust Book', domain: 'trustbook.tlid.io' },
  { name: 'DarkWave Academy', domain: 'darkwaveacademy.tlid.io' },
  { name: 'Happy Eats', domain: 'happyeats.tlid.io' },
  { name: 'Brew & Board Coffee', domain: 'brewandboard.tlid.io' },
];

export async function getUserTier(userId: string) {
  const [result] = await db.select({ count: count() })
    .from(affiliateReferrals)
    .where(and(
      eq(affiliateReferrals.referrerId, userId),
      eq(affiliateReferrals.status, 'converted')
    ));

  const convertedCount = result?.count ?? 0;

  for (const tier of COMMISSION_TIERS) {
    if (convertedCount >= tier.minReferrals) {
      return { tier: tier.name, rate: tier.rate, convertedReferrals: convertedCount };
    }
  }

  return { tier: 'base', rate: 0.10, convertedReferrals: convertedCount };
}

export async function getDashboard(userId: string) {
  const tierInfo = await getUserTier(userId);

  const allReferrals = await db.select()
    .from(affiliateReferrals)
    .where(eq(affiliateReferrals.referrerId, userId))
    .orderBy(desc(affiliateReferrals.createdAt));

  const totalReferrals = allReferrals.length;
  const convertedReferrals = allReferrals.filter(r => r.status === 'converted').length;
  const pendingReferrals = allReferrals.filter(r => r.status === 'pending').length;

  const allCommissions = await db.select()
    .from(affiliateCommissions)
    .where(eq(affiliateCommissions.referrerId, userId))
    .orderBy(desc(affiliateCommissions.createdAt));

  let pendingEarnings = 0;
  let paidEarnings = 0;
  for (const c of allCommissions) {
    const amount = parseFloat(c.amount || '0');
    if (c.status === 'pending') pendingEarnings += amount;
    else if (c.status === 'paid') paidEarnings += amount;
  }

  return {
    tier: tierInfo.tier,
    rate: tierInfo.rate,
    totalReferrals,
    convertedReferrals,
    pendingReferrals,
    pendingEarnings: pendingEarnings.toFixed(2),
    paidEarnings: paidEarnings.toFixed(2),
    recentReferrals: allReferrals.slice(0, 10),
    recentCommissions: allCommissions.slice(0, 10),
  };
}

export async function getReferralLink(userId: string) {
  const hashRecord = await db.select()
    .from(userUniqueHashes)
    .where(eq(userUniqueHashes.userId, userId))
    .limit(1);

  let uniqueHash: string;

  if (hashRecord.length > 0) {
    uniqueHash = hashRecord[0].uniqueHash;
  } else {
    const { randomBytes } = await import('crypto');
    uniqueHash = randomBytes(6).toString('hex');
    await db.insert(userUniqueHashes).values({
      userId,
      uniqueHash,
      createdAt: new Date(),
    });
  }

  const primaryLink = `https://pulse.tlid.io/ref/${uniqueHash}`;

  const crossPlatformLinks = APP_REGISTRY.map(app => ({
    appName: app.name,
    link: `https://${app.domain}/ref/${uniqueHash}`,
  }));

  return {
    referralLink: primaryLink,
    uniqueHash,
    crossPlatformLinks,
  };
}

export async function trackReferral(referralHash: string, platform: string = 'pulse') {
  const hashRecord = await db.select()
    .from(userUniqueHashes)
    .where(eq(userUniqueHashes.uniqueHash, referralHash))
    .limit(1);

  if (hashRecord.length === 0) {
    return { success: false, error: 'Invalid referral hash' };
  }

  const referrerId = hashRecord[0].userId;

  const [referral] = await db.insert(affiliateReferrals).values({
    referrerId,
    referralHash,
    platform: platform || 'pulse',
    status: 'pending',
  }).returning();

  return { success: true, referralId: referral.id };
}

export async function convertReferral(referredUserId: string) {
  const pendingReferrals = await db.select()
    .from(affiliateReferrals)
    .where(and(
      eq(affiliateReferrals.status, 'pending'),
      sql`${affiliateReferrals.referredUserId} IS NULL OR ${affiliateReferrals.referredUserId} = ${referredUserId}`
    ))
    .orderBy(desc(affiliateReferrals.createdAt))
    .limit(1);

  if (pendingReferrals.length === 0) {
    return { success: false, error: 'No pending referral found' };
  }

  const referral = pendingReferrals[0];

  await db.update(affiliateReferrals)
    .set({
      referredUserId,
      status: 'converted',
      convertedAt: new Date(),
    })
    .where(eq(affiliateReferrals.id, referral.id));

  await createTrustStamp({
    userId: referral.referrerId,
    category: 'affiliate-referral-converted',
    data: {
      referralId: referral.id,
      referredUserId,
      platform: referral.platform,
      appContext: 'pulse',
    },
  });

  return { success: true, referralId: referral.id, referrerId: referral.referrerId };
}

export async function createCommission(referrerId: string, referralId: number, amount: number) {
  const tierInfo = await getUserTier(referrerId);
  const commissionAmount = (amount * tierInfo.rate).toFixed(2);

  const [commission] = await db.insert(affiliateCommissions).values({
    referrerId,
    referralId,
    amount: commissionAmount,
    currency: 'SIG',
    tier: tierInfo.tier,
    status: 'pending',
  }).returning();

  return commission;
}

export async function requestPayout(userId: string) {
  const pendingCommissions = await db.select()
    .from(affiliateCommissions)
    .where(and(
      eq(affiliateCommissions.referrerId, userId),
      eq(affiliateCommissions.status, 'pending')
    ));

  let totalPending = 0;
  for (const c of pendingCommissions) {
    totalPending += parseFloat(c.amount || '0');
  }

  if (totalPending < 10) {
    return { success: false, error: 'Minimum payout is 10 SIG', pendingAmount: totalPending.toFixed(2) };
  }

  const commissionIds = pendingCommissions.map(c => c.id);

  for (const id of commissionIds) {
    await db.update(affiliateCommissions)
      .set({ status: 'processing' })
      .where(eq(affiliateCommissions.id, id));
  }

  await createTrustStamp({
    userId,
    category: 'affiliate-payout-request',
    data: {
      amount: totalPending.toFixed(2),
      currency: 'SIG',
      commissionsCount: commissionIds.length,
      appContext: 'pulse',
    },
  });

  return {
    success: true,
    amount: totalPending.toFixed(2),
    currency: 'SIG',
    commissionsCount: commissionIds.length,
  };
}
