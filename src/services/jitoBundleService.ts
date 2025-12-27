import { 
  Connection, 
  Keypair, 
  Transaction, 
  VersionedTransaction,
  PublicKey,
  SystemProgram,
  TransactionInstruction
} from '@solana/web3.js';
import axios from 'axios';
import bs58 from 'bs58';

const JITO_BLOCK_ENGINE = 'https://mainnet.block-engine.jito.wtf/api/v1/bundles';
const JITO_TIP_FLOOR_API = 'https://bundles.jito.wtf/api/v1/bundles/tip_floor';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const PUBLIC_SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const HELIUS_RPC = HELIUS_API_KEY 
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}` 
  : PUBLIC_SOLANA_RPC;

interface JitoBundleResult {
  success: boolean;
  bundleId?: string;
  error?: string;
  explorerUrl?: string;
}

interface TipFloorData {
  landed_tips_25th_percentile: number;
  landed_tips_50th_percentile: number;
  landed_tips_75th_percentile: number;
  landed_tips_95th_percentile: number;
  landed_tips_99th_percentile: number;
}

class JitoBundleService {
  private connection: Connection;
  private tipAccounts: string[] = [];
  private lastTipAccountFetch: number = 0;
  private cachedTipFloor: number = 10000;

  constructor() {
    this.connection = new Connection(HELIUS_RPC, 'confirmed');
  }

  async getTipAccounts(): Promise<string[]> {
    const now = Date.now();
    if (this.tipAccounts.length > 0 && now - this.lastTipAccountFetch < 60000) {
      return this.tipAccounts;
    }

    try {
      const response = await axios.post(JITO_BLOCK_ENGINE, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTipAccounts',
        params: []
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      if (response.data?.result) {
        this.tipAccounts = response.data.result;
        this.lastTipAccountFetch = now;
        console.log(`[Jito] Fetched ${this.tipAccounts.length} tip accounts`);
      }
    } catch (error) {
      console.error('[Jito] Failed to fetch tip accounts:', error);
      this.tipAccounts = [
        'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
        'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
        '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
        '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
        'HFqU5x63VTqvQss8hp11i4bVFgvSoNx6QKPMZ6mxJFN',
        'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
        'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
        'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh'
      ];
    }

    return this.tipAccounts;
  }

  async getRecommendedTip(priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'): Promise<number> {
    try {
      const response = await axios.get(JITO_TIP_FLOOR_API, { timeout: 5000 });
      const tipData: TipFloorData[] = response.data;
      
      if (tipData && tipData.length > 0) {
        const floor = tipData[0];
        switch (priority) {
          case 'low':
            return Math.max(10000, Math.floor(floor.landed_tips_25th_percentile));
          case 'medium':
            return Math.max(10000, Math.floor(floor.landed_tips_50th_percentile));
          case 'high':
            return Math.max(10000, Math.floor(floor.landed_tips_75th_percentile));
          case 'urgent':
            return Math.max(10000, Math.floor(floor.landed_tips_95th_percentile));
        }
      }
    } catch (error) {
      console.error('[Jito] Failed to fetch tip floor:', error);
    }
    
    const defaultTips = {
      low: 10000,
      medium: 50000,
      high: 100000,
      urgent: 500000
    };
    return defaultTips[priority];
  }

  async createTipInstruction(
    payerPubkey: PublicKey, 
    tipLamports: number
  ): Promise<TransactionInstruction> {
    const tipAccounts = await this.getTipAccounts();
    const randomTipAccount = tipAccounts[Math.floor(Math.random() * tipAccounts.length)];
    
    return SystemProgram.transfer({
      fromPubkey: payerPubkey,
      toPubkey: new PublicKey(randomTipAccount),
      lamports: tipLamports
    });
  }

  async sendBundle(
    transactions: (Transaction | VersionedTransaction)[],
    options: {
      tipPriority?: 'low' | 'medium' | 'high' | 'urgent';
      customTipLamports?: number;
    } = {}
  ): Promise<JitoBundleResult> {
    try {
      if (transactions.length === 0) {
        return { success: false, error: 'No transactions provided' };
      }

      if (transactions.length > 5) {
        return { success: false, error: 'Bundle can have max 5 transactions' };
      }

      const serializedTxs = transactions.map(tx => {
        const serialized = tx.serialize();
        return bs58.encode(serialized);
      });

      console.log(`[Jito] Sending bundle with ${transactions.length} transactions`);

      const response = await axios.post(JITO_BLOCK_ENGINE, {
        jsonrpc: '2.0',
        id: 1,
        method: 'sendBundle',
        params: [serializedTxs]
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      if (response.data?.error) {
        console.error('[Jito] Bundle error:', response.data.error);
        return { 
          success: false, 
          error: response.data.error.message || 'Bundle submission failed' 
        };
      }

      const bundleId = response.data?.result;
      console.log(`[Jito] Bundle submitted: ${bundleId}`);

      return {
        success: true,
        bundleId,
        explorerUrl: `https://explorer.jito.wtf/bundle/${bundleId}`
      };

    } catch (error: any) {
      console.error('[Jito] Send bundle error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send bundle' 
      };
    }
  }

  async simulateBundle(
    transactions: (Transaction | VersionedTransaction)[]
  ): Promise<{ success: boolean; error?: string; logs?: string[] }> {
    try {
      const serializedTxs = transactions.map(tx => {
        const serialized = tx.serialize();
        return bs58.encode(serialized);
      });

      const response = await axios.post(JITO_BLOCK_ENGINE, {
        jsonrpc: '2.0',
        id: 1,
        method: 'simulateBundle',
        params: [{ encodedTransactions: serializedTxs }]
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      if (response.data?.error) {
        return { 
          success: false, 
          error: response.data.error.message 
        };
      }

      const result = response.data?.result;
      if (result?.value?.err) {
        return { 
          success: false, 
          error: JSON.stringify(result.value.err),
          logs: result.value.logs
        };
      }

      return { 
        success: true,
        logs: result?.value?.logs || []
      };

    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Simulation failed' 
      };
    }
  }

  async getBundleStatus(bundleId: string): Promise<{
    status: 'pending' | 'landed' | 'failed' | 'unknown';
    slot?: number;
    error?: string;
  }> {
    try {
      const response = await axios.post(JITO_BLOCK_ENGINE, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getBundleStatuses',
        params: [[bundleId]]
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      const statuses = response.data?.result?.value;
      if (!statuses || statuses.length === 0) {
        return { status: 'pending' };
      }

      const bundleResult = statuses[0];
      const innerStatus = bundleResult?.status || bundleResult;
      
      const err = innerStatus?.err || bundleResult?.err;
      if (err) {
        return { 
          status: 'failed', 
          error: typeof err === 'string' ? err : JSON.stringify(err) 
        };
      }
      
      const confirmationStatus = innerStatus?.confirmationStatus || bundleResult?.confirmationStatus;
      
      if (confirmationStatus === 'failed' || confirmationStatus === 'rejected') {
        return { status: 'failed', error: 'Bundle confirmation failed' };
      }
      
      if (confirmationStatus === 'finalized' || confirmationStatus === 'confirmed') {
        return { status: 'landed', slot: innerStatus?.slot || bundleResult?.slot };
      }

      return { status: 'pending' };

    } catch (error) {
      return { status: 'unknown' };
    }
  }

  async waitForBundleLanding(
    bundleId: string, 
    timeoutMs: number = 60000,
    pollIntervalMs: number = 2000
  ): Promise<{ landed: boolean; slot?: number; error?: string }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const status = await this.getBundleStatus(bundleId);
      
      if (status.status === 'landed') {
        console.log(`[Jito] Bundle ${bundleId} landed in slot ${status.slot}`);
        return { landed: true, slot: status.slot };
      }
      
      if (status.status === 'failed') {
        console.log(`[Jito] Bundle ${bundleId} failed: ${status.error}`);
        return { landed: false, error: status.error };
      }
      
      if (status.status === 'unknown') {
        console.log(`[Jito] Bundle ${bundleId} status unknown, continuing to poll...`);
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    console.log(`[Jito] Bundle ${bundleId} timeout waiting for landing`);
    return { landed: false, error: 'Timeout waiting for bundle confirmation' };
  }
}

export const jitoBundleService = new JitoBundleService();
