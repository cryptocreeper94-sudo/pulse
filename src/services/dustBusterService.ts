import { Connection, PublicKey, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction, createBurnInstruction } from '@solana/spl-token';
import axios from 'axios';
import { db } from '../db/client';
import { dustBusterHistory, dustBusterStats } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export const RENT_PER_ACCOUNT = 0.00203928;
export const FEE_PERCENTAGE = 0.125;
export const THRESHOLDS = {
  small: 1,
  medium: 2,
  large: 5,
};

export interface TokenAccountInfo {
  pubkey: string;
  mint: string;
  balance: string;
  decimals: number;
  uiBalance: number;
  valueUsd: number;
  symbol?: string;
  name?: string;
  logoUri?: string;
  isEmpty: boolean;
  isDust: boolean;
  rent: number;
}

export interface ScanResult {
  walletAddress: string;
  totalAccounts: number;
  emptyAccounts: TokenAccountInfo[];
  dustAccounts: TokenAccountInfo[];
  healthyAccounts: TokenAccountInfo[];
  totalReclaimableSol: number;
  estimatedFee: number;
  netRecovery: number;
}

export interface CleanupPreview {
  walletAddress: string;
  threshold: number;
  burnMode: boolean;
  accountsToClose: TokenAccountInfo[];
  tokensToBurn: TokenAccountInfo[];
  totalAccounts: number;
  totalReclaimableSol: number;
  estimatedFee: number;
  netRecovery: number;
  serializedTransaction?: string;
}

export interface CleanupResult {
  success: boolean;
  accountsClosed: number;
  tokensBurned: number;
  solRecovered: string;
  feePaid: string;
  txSignatures: string[];
  historyId?: number;
}

class DustBusterService {
  private connection: Connection;
  private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
  private PRICE_CACHE_TTL = 60000;

  constructor() {
    this.connection = new Connection(HELIUS_RPC, 'confirmed');
  }

  async scanWallet(walletAddress: string): Promise<ScanResult> {
    console.log(`[DustBuster] Scanning wallet: ${walletAddress}`);

    const walletPubkey = new PublicKey(walletAddress);

    const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { programId: TOKEN_PROGRAM_ID }
    );

    const emptyAccounts: TokenAccountInfo[] = [];
    const dustAccounts: TokenAccountInfo[] = [];
    const healthyAccounts: TokenAccountInfo[] = [];

    for (const { pubkey, account } of tokenAccounts.value) {
      const parsedInfo = account.data.parsed.info;
      const balance = parsedInfo.tokenAmount.amount;
      const decimals = parsedInfo.tokenAmount.decimals;
      const uiBalance = parsedInfo.tokenAmount.uiAmount || 0;
      const mint = parsedInfo.mint;

      let valueUsd = 0;
      let tokenMetadata: { symbol?: string; name?: string; logoUri?: string } = {};

      if (uiBalance > 0) {
        try {
          valueUsd = await this.getTokenValue(mint, uiBalance);
          tokenMetadata = await this.getTokenMetadata(mint);
        } catch (e) {
          console.log(`[DustBuster] Failed to get price for ${mint}`);
        }
      }

      const accountInfo: TokenAccountInfo = {
        pubkey: pubkey.toString(),
        mint,
        balance,
        decimals,
        uiBalance,
        valueUsd,
        symbol: tokenMetadata.symbol,
        name: tokenMetadata.name,
        logoUri: tokenMetadata.logoUri,
        isEmpty: uiBalance === 0,
        isDust: valueUsd > 0 && valueUsd < THRESHOLDS.large,
        rent: RENT_PER_ACCOUNT,
      };

      if (uiBalance === 0) {
        emptyAccounts.push(accountInfo);
      } else if (valueUsd < THRESHOLDS.large) {
        dustAccounts.push(accountInfo);
      } else {
        healthyAccounts.push(accountInfo);
      }
    }

    const totalReclaimableSol = (emptyAccounts.length + dustAccounts.length) * RENT_PER_ACCOUNT;
    const estimatedFee = totalReclaimableSol * FEE_PERCENTAGE;
    const netRecovery = totalReclaimableSol - estimatedFee;

    console.log(`[DustBuster] Found ${emptyAccounts.length} empty, ${dustAccounts.length} dust accounts`);

    return {
      walletAddress,
      totalAccounts: tokenAccounts.value.length,
      emptyAccounts,
      dustAccounts,
      healthyAccounts,
      totalReclaimableSol,
      estimatedFee,
      netRecovery,
    };
  }

  async previewCleanup(
    walletAddress: string,
    threshold: number = THRESHOLDS.small,
    burnMode: boolean = false
  ): Promise<CleanupPreview> {
    console.log(`[DustBuster] Previewing cleanup: wallet=${walletAddress}, threshold=$${threshold}, burnMode=${burnMode}`);

    const scan = await this.scanWallet(walletAddress);
    
    const accountsToClose = [...scan.emptyAccounts];
    const tokensToBurn: TokenAccountInfo[] = [];

    if (burnMode) {
      for (const dustAccount of scan.dustAccounts) {
        if (dustAccount.valueUsd <= threshold) {
          tokensToBurn.push(dustAccount);
          accountsToClose.push(dustAccount);
        }
      }
    }

    const totalAccounts = accountsToClose.length;
    const totalReclaimableSol = totalAccounts * RENT_PER_ACCOUNT;
    const estimatedFee = totalReclaimableSol * FEE_PERCENTAGE;
    const netRecovery = totalReclaimableSol - estimatedFee;

    let serializedTransaction: string | undefined;

    if (totalAccounts > 0) {
      try {
        const transaction = await this.buildCleanupTransaction(
          walletAddress,
          accountsToClose,
          tokensToBurn
        );
        serializedTransaction = transaction.serialize({ requireAllSignatures: false }).toString('base64');
      } catch (e: any) {
        console.log(`[DustBuster] Failed to build transaction preview: ${e.message}`);
      }
    }

    return {
      walletAddress,
      threshold,
      burnMode,
      accountsToClose,
      tokensToBurn,
      totalAccounts,
      totalReclaimableSol,
      estimatedFee,
      netRecovery,
      serializedTransaction,
    };
  }

  async buildCleanupTransaction(
    walletAddress: string,
    accountsToClose: TokenAccountInfo[],
    tokensToBurn: TokenAccountInfo[]
  ): Promise<Transaction> {
    const walletPubkey = new PublicKey(walletAddress);
    const transaction = new Transaction();

    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPubkey;

    for (const account of tokensToBurn) {
      if (account.uiBalance > 0) {
        const burnIx = createBurnInstruction(
          new PublicKey(account.pubkey),
          new PublicKey(account.mint),
          walletPubkey,
          BigInt(account.balance)
        );
        transaction.add(burnIx);
      }
    }

    for (const account of accountsToClose) {
      const closeIx = createCloseAccountInstruction(
        new PublicKey(account.pubkey),
        walletPubkey,
        walletPubkey
      );
      transaction.add(closeIx);
    }

    return transaction;
  }

  async recordCleanup(
    walletAddress: string,
    userId: string | undefined,
    accountsClosed: number,
    tokensBurned: number,
    solRecovered: string,
    feePaid: string,
    txSignatures: string[]
  ): Promise<CleanupResult> {
    console.log(`[DustBuster] Recording cleanup: ${accountsClosed} accounts, ${solRecovered} SOL recovered`);

    try {
      const [historyRecord] = await db.insert(dustBusterHistory).values({
        userId,
        walletAddress,
        accountsClosed,
        tokensBurned,
        solRecovered,
        feePaid,
        txSignatures: JSON.stringify(txSignatures),
      }).returning();

      if (userId) {
        await this.updateUserStats(userId, accountsClosed, tokensBurned, solRecovered, feePaid);
      }

      return {
        success: true,
        accountsClosed,
        tokensBurned,
        solRecovered,
        feePaid,
        txSignatures,
        historyId: historyRecord.id,
      };
    } catch (error: any) {
      console.error(`[DustBuster] Failed to record cleanup: ${error.message}`);
      return {
        success: false,
        accountsClosed,
        tokensBurned,
        solRecovered,
        feePaid,
        txSignatures,
      };
    }
  }

  async updateUserStats(
    userId: string,
    accountsClosed: number,
    tokensBurned: number,
    solRecovered: string,
    feePaid: string
  ): Promise<void> {
    const existing = await db.select().from(dustBusterStats).where(eq(dustBusterStats.userId, userId)).limit(1);

    if (existing.length === 0) {
      await db.insert(dustBusterStats).values({
        userId,
        totalSolRecovered: solRecovered,
        totalFeePaid: feePaid,
        totalAccountsClosed: accountsClosed,
        totalTokensBurned: tokensBurned,
      });
    } else {
      await db.update(dustBusterStats)
        .set({
          totalSolRecovered: sql`${dustBusterStats.totalSolRecovered} + ${solRecovered}`,
          totalFeePaid: sql`${dustBusterStats.totalFeePaid} + ${feePaid}`,
          totalAccountsClosed: sql`${dustBusterStats.totalAccountsClosed} + ${accountsClosed}`,
          totalTokensBurned: sql`${dustBusterStats.totalTokensBurned} + ${tokensBurned}`,
          updatedAt: new Date(),
        })
        .where(eq(dustBusterStats.userId, userId));
    }
  }

  async getUserStats(userId: string): Promise<typeof dustBusterStats.$inferSelect | null> {
    const [stats] = await db.select().from(dustBusterStats).where(eq(dustBusterStats.userId, userId)).limit(1);
    return stats || null;
  }

  async getTokenPrice(mint: string): Promise<number> {
    const cached = this.priceCache.get(mint);
    if (cached && Date.now() - cached.timestamp < this.PRICE_CACHE_TTL) {
      return cached.price;
    }

    try {
      const response = await axios.get(
        `https://api.jup.ag/price/v2?ids=${mint}`,
        { timeout: 5000 }
      );

      const price = response.data?.data?.[mint]?.price || 0;
      this.priceCache.set(mint, { price, timestamp: Date.now() });
      return price;
    } catch (error) {
      console.log(`[DustBuster] Failed to fetch price for ${mint}`);
      return 0;
    }
  }

  async getTokenValue(mint: string, amount: number): Promise<number> {
    const price = await this.getTokenPrice(mint);
    return price * amount;
  }

  async getTokenMetadata(mint: string): Promise<{ symbol?: string; name?: string; logoUri?: string }> {
    try {
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${mint}`,
        { timeout: 5000 }
      );

      const pair = response.data?.pairs?.[0];
      if (pair?.baseToken) {
        return {
          symbol: pair.baseToken.symbol,
          name: pair.baseToken.name,
          logoUri: pair.info?.imageUrl,
        };
      }
    } catch (error) {
      console.log(`[DustBuster] Failed to fetch metadata for ${mint}`);
    }

    return {};
  }

  async getCleanupHistory(walletAddress: string, limit: number = 10) {
    return db
      .select()
      .from(dustBusterHistory)
      .where(eq(dustBusterHistory.walletAddress, walletAddress))
      .orderBy(sql`${dustBusterHistory.createdAt} DESC`)
      .limit(limit);
  }
}

export const dustBusterService = new DustBusterService();
