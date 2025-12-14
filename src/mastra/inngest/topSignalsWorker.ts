import { inngest } from './client';
import { topSignalsService } from '../../services/topSignalsService.js';

export const topSignalsScanner = inngest.createFunction(
  { id: 'top-signals-scanner', name: 'Top Signals Market Scanner' },
  { cron: '*/3 * * * *' },
  async ({ event, step }) => {
    const result = await step.run('scan-markets', async () => {
      try {
        console.log('[TopSignals] Starting market scan...');
        const signals = await topSignalsService.scanAndScoreTokens();
        console.log(`[TopSignals] Scanned ${signals.length} tokens`);
        return signals;
      } catch (error) {
        console.error('[TopSignals] Scan error:', error);
        throw error;
      }
    });
    
    return { signalsCount: result.length, timestamp: new Date().toISOString() };
  }
);

export const topSignalsWorkerFunctions = [topSignalsScanner];
