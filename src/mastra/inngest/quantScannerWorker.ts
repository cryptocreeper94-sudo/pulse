import { inngest } from './client';
import { db } from '../../db/client.js';
import { quantScanConfig, quantLearningMetrics, strikeAgentSignals } from '../../db/schema.js';
import { topSignalsService, SUPPORTED_CHAINS } from '../../services/topSignalsService.js';
import { ChainId } from '../../services/multiChainProvider.js';
import { eq, and, desc, lte } from 'drizzle-orm';
import { randomBytes } from 'crypto';

const generateId = () => `qs_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`;

export const quantCategoryScanner = inngest.createFunction(
  { id: 'quant-category-scanner', name: 'Quant System Category Scanner' },
  { cron: '*/15 * * * *' },
  async ({ event, step }) => {
    const scanResults = await step.run('scan-enabled-categories', async () => {
      try {
        console.log('[QuantScanner] Starting category-based scan...');
        
        const now = new Date();
        const configs = await db.select().from(quantScanConfig).where(eq(quantScanConfig.enabled, true));
        
        if (configs.length === 0) {
          console.log('[QuantScanner] No enabled scan configs found');
          return { scanned: 0, categories: [] };
        }

        const results: Array<{
          category: string;
          tokensFound: number;
          signalsGenerated: number;
        }> = [];

        for (const config of configs) {
          const lastScan = config.lastScanAt ? new Date(config.lastScanAt) : null;
          const intervalMs = (config.scanIntervalMinutes || 5) * 60 * 1000;
          
          if (lastScan && (now.getTime() - lastScan.getTime()) < intervalMs) {
            console.log(`[QuantScanner] Skipping ${config.category} - not due yet`);
            continue;
          }

          // Parse chains from config (defaults to all supported chains)
          let chains: ChainId[] = SUPPORTED_CHAINS;
          try {
            if (config.chains) {
              const parsedChains = JSON.parse(config.chains);
              if (Array.isArray(parsedChains) && parsedChains.length > 0) {
                chains = parsedChains.filter(c => SUPPORTED_CHAINS.includes(c));
              }
            }
          } catch (e) {
            console.warn(`[QuantScanner] Failed to parse chains config, using all chains`);
          }

          console.log(`[QuantScanner] Scanning category: ${config.category} on chains: ${chains.join(', ')}`);
          
          try {
            const signals = await topSignalsService.scanAndScoreTokens(chains);
            
            const filteredSignals = signals.filter(s => {
              if (config.category !== 'all' && s.category !== config.category) return false;
              if (s.liquidityUsd < parseFloat(config.minLiquidityUsd?.toString() || '5000')) return false;
              if (s.marketCapUsd < parseFloat(config.minMarketCapUsd?.toString() || '10000')) return false;
              if (config.maxMarketCapUsd && s.marketCapUsd > parseFloat(config.maxMarketCapUsd.toString())) return false;
              if (s.safetyScore < (config.minSafetyScore || 50)) return false;
              if (s.compositeScore < (config.minCompositeScore || 60)) return false;
              return true;
            });

            await db.update(quantScanConfig)
              .set({
                lastScanAt: now,
                lastScanTokensFound: signals.length,
                lastScanSignalsGenerated: filteredSignals.length,
                updatedAt: now,
              })
              .where(eq(quantScanConfig.id, config.id));

            results.push({
              category: config.category,
              tokensFound: signals.length,
              signalsGenerated: filteredSignals.length,
            });

            console.log(`[QuantScanner] ${config.category}: ${filteredSignals.length} signals from ${signals.length} tokens`);
          } catch (err) {
            console.error(`[QuantScanner] Error scanning ${config.category}:`, err);
          }
        }

        if (results.length > 0) {
          try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const totalTokens = results.reduce((sum, r) => sum + r.tokensFound, 0);
            const totalSignals = results.reduce((sum, r) => sum + r.signalsGenerated, 0);
            
            await db.insert(quantLearningMetrics).values({
              id: generateId(),
              periodType: 'daily',
              periodStart: today,
              totalScans: results.length,
              totalTokensAnalyzed: totalTokens,
              signalsGenerated: totalSignals,
              createdAt: now,
              updatedAt: now,
            }).onConflictDoNothing();
          } catch (err) {
            console.error('[QuantScanner] Error updating metrics:', err);
          }
        }

        return { scanned: results.length, categories: results };
      } catch (error) {
        console.error('[QuantScanner] Fatal error:', error);
        throw error;
      }
    });

    return { ...scanResults, timestamp: new Date().toISOString() };
  }
);

export const quantManualScan = inngest.createFunction(
  { id: 'quant-manual-scan', name: 'Quant System Manual Scan' },
  { event: 'quant/scan.trigger' },
  async ({ event, step }) => {
    const { category, userId } = event.data || {};
    
    const result = await step.run('manual-category-scan', async () => {
      console.log(`[QuantScanner] Manual scan triggered for ${category || 'all'} by ${userId}`);
      
      const signals = await topSignalsService.scanAndScoreTokens();
      
      const filtered = category && category !== 'all' 
        ? signals.filter(s => s.category === category)
        : signals;
      
      return {
        category: category || 'all',
        tokensFound: signals.length,
        signalsGenerated: filtered.length,
        topSignals: filtered.slice(0, 10).map(s => ({
          symbol: s.tokenSymbol,
          score: s.compositeScore,
          safety: s.safetyScore,
          price: s.priceUsd,
        })),
      };
    });

    return { ...result, timestamp: new Date().toISOString() };
  }
);

export const quantScannerWorkerFunctions = [quantCategoryScanner, quantManualScan];
