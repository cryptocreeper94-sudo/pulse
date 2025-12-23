import { db } from '../../db/client.js';
import { predictionEvents } from '../../db/schema';
import { desc, gte } from 'drizzle-orm';

export const strikeAgentSignalsRoutes = [
  {
    path: "/api/strike-agent/top-signals",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      logger?.info('🎯 [StrikeAgent] Top signals request');
      
      try {
        const chain = c.req.query('chain') || 'all';
        
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const predictions = await db.select()
          .from(predictionEvents)
          .where(gte(predictionEvents.createdAt, since))
          .orderBy(desc(predictionEvents.createdAt))
          .limit(10);
        
        const signals = predictions.map((p: any) => ({
          ticker: p.ticker,
          chain: p.assetType === 'crypto' ? 'solana' : 'ethereum',
          signal: p.signal,
          confidence: p.confidence || 'MEDIUM',
          price: p.priceAtPrediction,
          change24h: 0,
          timestamp: p.createdAt,
          category: p.assetType === 'crypto' ? 'crypto' : 'stock'
        }));
        
        logger?.info('✅ [StrikeAgent] Signals retrieved', { count: signals.length });
        
        return c.json({
          success: true,
          signals,
          lastUpdated: new Date().toISOString()
        });
      } catch (error: any) {
        logger?.error('❌ [StrikeAgent] Top signals error', { error: error.message });
        return c.json({
          success: true,
          signals: [],
          lastUpdated: new Date().toISOString()
        });
      }
    }
  }
];
