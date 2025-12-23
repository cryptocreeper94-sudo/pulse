import { topSignalsService } from '../src/services/topSignalsService.js';

async function main() {
  console.log('[Scheduled] Starting token scan at', new Date().toISOString());
  
  try {
    const signals = await topSignalsService.scanAndScoreTokens();
    console.log(`[Scheduled] Scan complete - saved ${signals.length} signals`);
    
    if (signals.length > 0) {
      console.log('[Scheduled] Top 5 tokens:');
      signals.slice(0, 5).forEach(s => {
        console.log(`  ${s.tokenSymbol} (${s.chain}): score ${s.compositeScore}`);
      });
    }
    
    console.log('[Scheduled] Job finished successfully');
    process.exit(0);
  } catch (error) {
    console.error('[Scheduled] Scan failed:', error);
    process.exit(1);
  }
}

main();
