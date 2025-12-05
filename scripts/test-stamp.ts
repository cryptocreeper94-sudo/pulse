import { stampDeployment, auditTrailService } from '../src/services/auditTrailService.js';

async function test() {
  console.log('🔗 Stamping v1205a repair-and-replace to Solana mainnet...');
  try {
    // First log the event
    const event = await stampDeployment('1205a', 'UI repair and replace - new slim header and metric cards', 'repair_replace');
    console.log('📝 Event logged:', event.id);
    console.log('🔑 SHA-256 Hash:', event.payloadHash);
    
    // Now post to Solana and wait for confirmation
    console.log('⏳ Posting to Solana mainnet via Helius...');
    const signature = await auditTrailService.postOnChainAndWait(event.id);
    
    if (signature) {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ SOLANA STAMP CONFIRMED!');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📋 Event ID:', event.id);
      console.log('🔑 SHA-256 Hash:', event.payloadHash);
      console.log('🔗 Transaction:', signature);
      console.log('🌐 View on Solscan: https://solscan.io/tx/' + signature);
      console.log('═══════════════════════════════════════════════════════');
    } else {
      console.log('❌ Failed to post to Solana - check logs for details');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
}

test();
