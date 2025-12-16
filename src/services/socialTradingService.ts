import { db } from '../db/client.js';
import { traderProfiles, copyTradingSubscriptions } from '../db/schema.js';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

export type Timeframe = 'daily' | 'weekly' | 'monthly' | 'alltime';

export interface FollowSettings {
  allocationPercent?: number;
  maxPositionSize?: number;
}

export interface TraderProfile {
  id: string;
  userId: string;
  displayName: string | null;
  bio: string | null;
  totalPnl: string;
  winRate: string;
  totalTrades: number;
  followers: number;
  rank: number | null;
  isPublic: boolean;
  createdAt: Date;
}

class SocialTradingService {
  async getLeaderboard(timeframe: Timeframe = 'alltime', limit: number = 50): Promise<TraderProfile[]> {
    try {
      let dateFilter: Date | null = null;
      const now = new Date();
      
      switch (timeframe) {
        case 'daily':
          dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = null;
      }

      const query = db
        .select()
        .from(traderProfiles)
        .where(eq(traderProfiles.isPublic, true))
        .orderBy(desc(traderProfiles.totalPnl))
        .limit(limit);

      const traders = await query;
      
      return traders.map((t, idx) => ({
        id: t.id,
        userId: t.userId,
        displayName: t.displayName,
        bio: t.bio,
        totalPnl: t.totalPnl || '0',
        winRate: t.winRate || '0',
        totalTrades: t.totalTrades || 0,
        followers: t.followers || 0,
        rank: idx + 1,
        isPublic: t.isPublic ?? true,
        createdAt: t.createdAt || new Date(),
      }));
    } catch (error: any) {
      console.error('[SocialTradingService] getLeaderboard error:', error.message);
      throw error;
    }
  }

  async getTraderProfile(traderId: string): Promise<TraderProfile | null> {
    try {
      const [trader] = await db
        .select()
        .from(traderProfiles)
        .where(eq(traderProfiles.id, traderId))
        .limit(1);

      if (!trader) return null;

      return {
        id: trader.id,
        userId: trader.userId,
        displayName: trader.displayName,
        bio: trader.bio,
        totalPnl: trader.totalPnl || '0',
        winRate: trader.winRate || '0',
        totalTrades: trader.totalTrades || 0,
        followers: trader.followers || 0,
        rank: trader.rank,
        isPublic: trader.isPublic ?? true,
        createdAt: trader.createdAt || new Date(),
      };
    } catch (error: any) {
      console.error('[SocialTradingService] getTraderProfile error:', error.message);
      throw error;
    }
  }

  async followTrader(followerId: string, traderId: string, settings: FollowSettings = {}): Promise<{ success: boolean; subscriptionId?: string }> {
    try {
      const existing = await db
        .select()
        .from(copyTradingSubscriptions)
        .where(
          and(
            eq(copyTradingSubscriptions.followerId, followerId),
            eq(copyTradingSubscriptions.traderId, traderId),
            eq(copyTradingSubscriptions.isActive, true)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return { success: false };
      }

      const [subscription] = await db
        .insert(copyTradingSubscriptions)
        .values({
          followerId,
          traderId,
          allocationPercent: settings.allocationPercent?.toString() || '10',
          maxPositionSize: settings.maxPositionSize?.toString(),
          isActive: true,
        })
        .returning();

      await db
        .update(traderProfiles)
        .set({
          followers: sql`COALESCE(followers, 0) + 1`,
          updatedAt: new Date(),
        })
        .where(eq(traderProfiles.id, traderId));

      return { success: true, subscriptionId: subscription.id };
    } catch (error: any) {
      console.error('[SocialTradingService] followTrader error:', error.message);
      throw error;
    }
  }

  async unfollowTrader(followerId: string, traderId: string): Promise<{ success: boolean }> {
    try {
      await db
        .update(copyTradingSubscriptions)
        .set({ isActive: false })
        .where(
          and(
            eq(copyTradingSubscriptions.followerId, followerId),
            eq(copyTradingSubscriptions.traderId, traderId)
          )
        );

      await db
        .update(traderProfiles)
        .set({
          followers: sql`GREATEST(COALESCE(followers, 0) - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(traderProfiles.id, traderId));

      return { success: true };
    } catch (error: any) {
      console.error('[SocialTradingService] unfollowTrader error:', error.message);
      throw error;
    }
  }

  async getFollowers(traderId: string): Promise<any[]> {
    try {
      const followers = await db
        .select()
        .from(copyTradingSubscriptions)
        .where(
          and(
            eq(copyTradingSubscriptions.traderId, traderId),
            eq(copyTradingSubscriptions.isActive, true)
          )
        );

      return followers;
    } catch (error: any) {
      console.error('[SocialTradingService] getFollowers error:', error.message);
      throw error;
    }
  }

  async getFollowing(userId: string): Promise<any[]> {
    try {
      const following = await db
        .select()
        .from(copyTradingSubscriptions)
        .where(
          and(
            eq(copyTradingSubscriptions.followerId, userId),
            eq(copyTradingSubscriptions.isActive, true)
          )
        );

      return following;
    } catch (error: any) {
      console.error('[SocialTradingService] getFollowing error:', error.message);
      throw error;
    }
  }

  async updateTraderStats(userId: string, stats: { pnl?: number; winRate?: number; trades?: number }): Promise<void> {
    try {
      const updates: any = { updatedAt: new Date() };
      
      if (stats.pnl !== undefined) {
        updates.totalPnl = stats.pnl.toString();
      }
      if (stats.winRate !== undefined) {
        updates.winRate = stats.winRate.toString();
      }
      if (stats.trades !== undefined) {
        updates.totalTrades = stats.trades;
      }

      await db
        .update(traderProfiles)
        .set(updates)
        .where(eq(traderProfiles.userId, userId));
    } catch (error: any) {
      console.error('[SocialTradingService] updateTraderStats error:', error.message);
      throw error;
    }
  }

  async createTraderProfile(userId: string, displayName?: string, bio?: string): Promise<TraderProfile> {
    try {
      const [trader] = await db
        .insert(traderProfiles)
        .values({
          userId,
          displayName,
          bio,
        })
        .returning();

      return {
        id: trader.id,
        userId: trader.userId,
        displayName: trader.displayName,
        bio: trader.bio,
        totalPnl: trader.totalPnl || '0',
        winRate: trader.winRate || '0',
        totalTrades: trader.totalTrades || 0,
        followers: trader.followers || 0,
        rank: null,
        isPublic: trader.isPublic ?? true,
        createdAt: trader.createdAt || new Date(),
      };
    } catch (error: any) {
      console.error('[SocialTradingService] createTraderProfile error:', error.message);
      throw error;
    }
  }

  async getOrCreateTraderProfile(userId: string): Promise<TraderProfile> {
    try {
      const [existing] = await db
        .select()
        .from(traderProfiles)
        .where(eq(traderProfiles.userId, userId))
        .limit(1);

      if (existing) {
        return {
          id: existing.id,
          userId: existing.userId,
          displayName: existing.displayName,
          bio: existing.bio,
          totalPnl: existing.totalPnl || '0',
          winRate: existing.winRate || '0',
          totalTrades: existing.totalTrades || 0,
          followers: existing.followers || 0,
          rank: existing.rank,
          isPublic: existing.isPublic ?? true,
          createdAt: existing.createdAt || new Date(),
        };
      }

      return this.createTraderProfile(userId);
    } catch (error: any) {
      console.error('[SocialTradingService] getOrCreateTraderProfile error:', error.message);
      throw error;
    }
  }
}

export const socialTradingService = new SocialTradingService();
