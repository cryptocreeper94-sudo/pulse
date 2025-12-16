import { db } from '../db/client.js';
import { communitySignals, signalVotes, traderProfiles } from '../db/schema.js';
import { eq, desc, and, sql, or } from 'drizzle-orm';

export interface Signal {
  ticker: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  targetPrice?: number;
  stopLoss?: number;
  analysis?: string;
  expiresAt?: Date;
}

export interface CommunitySignal {
  id: string;
  traderId: string;
  traderName?: string;
  ticker: string;
  signal: string;
  targetPrice: string | null;
  stopLoss: string | null;
  analysis: string | null;
  upvotes: number;
  downvotes: number;
  score: number;
  status: string;
  createdAt: Date;
  expiresAt: Date | null;
}

class CommunitySignalService {
  async postSignal(traderId: string, signal: Signal): Promise<CommunitySignal> {
    try {
      const [created] = await db
        .insert(communitySignals)
        .values({
          traderId,
          ticker: signal.ticker.toUpperCase(),
          signal: signal.signal,
          targetPrice: signal.targetPrice?.toString(),
          stopLoss: signal.stopLoss?.toString(),
          analysis: signal.analysis,
          expiresAt: signal.expiresAt,
          status: 'active',
        })
        .returning();

      return {
        id: created.id,
        traderId: created.traderId,
        ticker: created.ticker,
        signal: created.signal,
        targetPrice: created.targetPrice,
        stopLoss: created.stopLoss,
        analysis: created.analysis,
        upvotes: created.upvotes || 0,
        downvotes: created.downvotes || 0,
        score: (created.upvotes || 0) - (created.downvotes || 0),
        status: created.status || 'active',
        createdAt: created.createdAt || new Date(),
        expiresAt: created.expiresAt,
      };
    } catch (error: any) {
      console.error('[CommunitySignalService] postSignal error:', error.message);
      throw error;
    }
  }

  async getLatestSignals(limit: number = 20, category?: string): Promise<CommunitySignal[]> {
    try {
      let query = db
        .select({
          id: communitySignals.id,
          traderId: communitySignals.traderId,
          ticker: communitySignals.ticker,
          signal: communitySignals.signal,
          targetPrice: communitySignals.targetPrice,
          stopLoss: communitySignals.stopLoss,
          analysis: communitySignals.analysis,
          upvotes: communitySignals.upvotes,
          downvotes: communitySignals.downvotes,
          status: communitySignals.status,
          createdAt: communitySignals.createdAt,
          expiresAt: communitySignals.expiresAt,
          traderName: traderProfiles.displayName,
        })
        .from(communitySignals)
        .leftJoin(traderProfiles, eq(communitySignals.traderId, traderProfiles.id))
        .where(eq(communitySignals.status, 'active'))
        .orderBy(desc(communitySignals.createdAt))
        .limit(limit);

      const signals = await query;

      return signals.map((s) => ({
        id: s.id,
        traderId: s.traderId,
        traderName: s.traderName || undefined,
        ticker: s.ticker,
        signal: s.signal,
        targetPrice: s.targetPrice,
        stopLoss: s.stopLoss,
        analysis: s.analysis,
        upvotes: s.upvotes || 0,
        downvotes: s.downvotes || 0,
        score: (s.upvotes || 0) - (s.downvotes || 0),
        status: s.status || 'active',
        createdAt: s.createdAt || new Date(),
        expiresAt: s.expiresAt,
      }));
    } catch (error: any) {
      console.error('[CommunitySignalService] getLatestSignals error:', error.message);
      throw error;
    }
  }

  async upvoteSignal(signalId: string, userId: string): Promise<{ upvotes: number; downvotes: number }> {
    try {
      const [existing] = await db
        .select()
        .from(signalVotes)
        .where(
          and(
            eq(signalVotes.signalId, signalId),
            eq(signalVotes.userId, userId)
          )
        )
        .limit(1);

      if (existing) {
        if (existing.vote === 1) {
          return this.getSignalVotes(signalId);
        }
        
        await db
          .update(signalVotes)
          .set({ vote: 1 })
          .where(eq(signalVotes.id, existing.id));

        if (existing.vote === -1) {
          await db
            .update(communitySignals)
            .set({
              upvotes: sql`COALESCE(upvotes, 0) + 1`,
              downvotes: sql`GREATEST(COALESCE(downvotes, 0) - 1, 0)`,
            })
            .where(eq(communitySignals.id, signalId));
        } else {
          await db
            .update(communitySignals)
            .set({ upvotes: sql`COALESCE(upvotes, 0) + 1` })
            .where(eq(communitySignals.id, signalId));
        }
      } else {
        await db.insert(signalVotes).values({
          signalId,
          userId,
          vote: 1,
        });

        await db
          .update(communitySignals)
          .set({ upvotes: sql`COALESCE(upvotes, 0) + 1` })
          .where(eq(communitySignals.id, signalId));
      }

      return this.getSignalVotes(signalId);
    } catch (error: any) {
      console.error('[CommunitySignalService] upvoteSignal error:', error.message);
      throw error;
    }
  }

  async downvoteSignal(signalId: string, userId: string): Promise<{ upvotes: number; downvotes: number }> {
    try {
      const [existing] = await db
        .select()
        .from(signalVotes)
        .where(
          and(
            eq(signalVotes.signalId, signalId),
            eq(signalVotes.userId, userId)
          )
        )
        .limit(1);

      if (existing) {
        if (existing.vote === -1) {
          return this.getSignalVotes(signalId);
        }

        await db
          .update(signalVotes)
          .set({ vote: -1 })
          .where(eq(signalVotes.id, existing.id));

        if (existing.vote === 1) {
          await db
            .update(communitySignals)
            .set({
              upvotes: sql`GREATEST(COALESCE(upvotes, 0) - 1, 0)`,
              downvotes: sql`COALESCE(downvotes, 0) + 1`,
            })
            .where(eq(communitySignals.id, signalId));
        } else {
          await db
            .update(communitySignals)
            .set({ downvotes: sql`COALESCE(downvotes, 0) + 1` })
            .where(eq(communitySignals.id, signalId));
        }
      } else {
        await db.insert(signalVotes).values({
          signalId,
          userId,
          vote: -1,
        });

        await db
          .update(communitySignals)
          .set({ downvotes: sql`COALESCE(downvotes, 0) + 1` })
          .where(eq(communitySignals.id, signalId));
      }

      return this.getSignalVotes(signalId);
    } catch (error: any) {
      console.error('[CommunitySignalService] downvoteSignal error:', error.message);
      throw error;
    }
  }

  async getSignalVotes(signalId: string): Promise<{ upvotes: number; downvotes: number }> {
    try {
      const [signal] = await db
        .select({
          upvotes: communitySignals.upvotes,
          downvotes: communitySignals.downvotes,
        })
        .from(communitySignals)
        .where(eq(communitySignals.id, signalId))
        .limit(1);

      return {
        upvotes: signal?.upvotes || 0,
        downvotes: signal?.downvotes || 0,
      };
    } catch (error: any) {
      console.error('[CommunitySignalService] getSignalVotes error:', error.message);
      throw error;
    }
  }

  async getUserSignals(traderId: string, limit: number = 20): Promise<CommunitySignal[]> {
    try {
      const signals = await db
        .select()
        .from(communitySignals)
        .where(eq(communitySignals.traderId, traderId))
        .orderBy(desc(communitySignals.createdAt))
        .limit(limit);

      return signals.map((s) => ({
        id: s.id,
        traderId: s.traderId,
        ticker: s.ticker,
        signal: s.signal,
        targetPrice: s.targetPrice,
        stopLoss: s.stopLoss,
        analysis: s.analysis,
        upvotes: s.upvotes || 0,
        downvotes: s.downvotes || 0,
        score: (s.upvotes || 0) - (s.downvotes || 0),
        status: s.status || 'active',
        createdAt: s.createdAt || new Date(),
        expiresAt: s.expiresAt,
      }));
    } catch (error: any) {
      console.error('[CommunitySignalService] getUserSignals error:', error.message);
      throw error;
    }
  }

  async updateSignalStatus(signalId: string, status: 'active' | 'hit_target' | 'stopped_out' | 'expired'): Promise<void> {
    try {
      await db
        .update(communitySignals)
        .set({ status })
        .where(eq(communitySignals.id, signalId));
    } catch (error: any) {
      console.error('[CommunitySignalService] updateSignalStatus error:', error.message);
      throw error;
    }
  }
}

export const communitySignalService = new CommunitySignalService();
