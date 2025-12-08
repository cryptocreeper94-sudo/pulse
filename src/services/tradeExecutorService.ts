import axios from 'axios';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { SnipePresetConfig } from './sniperBotService';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Jupiter API
const JUPITER_API = 'https://quote-api.jup.ag/v6';

// SOL mint address
const SOL_MINT = 'So11111111111111111111111111111111111111112';

interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: any[];
}

interface SwapResult {
  success: boolean;
  txSignature?: string;
  error?: string;
  inputAmount: string;
  outputAmount?: string;
  priceImpact?: string;
}

class TradeExecutorService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(HELIUS_RPC || 'https://api.mainnet-beta.solana.com');
  }

  // ============================================
  // JUPITER SWAP QUOTES
  // ============================================

  async getSwapQuote(
    inputMint: string,
    outputMint: string,
    amountLamports: string,
    slippageBps: number = 500 // 5% default
  ): Promise<JupiterQuote | null> {
    try {
      const response = await axios.get(`${JUPITER_API}/quote`, {
        params: {
          inputMint,
          outputMint,
          amount: amountLamports,
          slippageBps,
          swapMode: 'ExactIn',
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error: any) {
      console.error('[TradeExecutor] Quote error:', error.message);
      return null;
    }
  }

  async getBuyQuote(
    tokenMint: string,
    solAmount: number,
    slippagePercent: number = 5
  ): Promise<JupiterQuote | null> {
    const lamports = Math.floor(solAmount * 1e9).toString();
    const slippageBps = Math.floor(slippagePercent * 100);
    
    return this.getSwapQuote(SOL_MINT, tokenMint, lamports, slippageBps);
  }

  async getSellQuote(
    tokenMint: string,
    tokenAmount: string,
    slippagePercent: number = 5
  ): Promise<JupiterQuote | null> {
    const slippageBps = Math.floor(slippagePercent * 100);
    
    return this.getSwapQuote(tokenMint, SOL_MINT, tokenAmount, slippageBps);
  }

  // ============================================
  // SWAP TRANSACTION BUILDING
  // ============================================

  async buildSwapTransaction(
    quote: JupiterQuote,
    userPublicKey: string,
    priorityFee: 'low' | 'medium' | 'high' | 'auto' = 'auto'
  ): Promise<{ transaction: string; lastValidBlockHeight: number } | null> {
    try {
      // Determine priority fee
      const priorityFeeLamports = this.getPriorityFeeLamports(priorityFee);

      const response = await axios.post(
        `${JUPITER_API}/swap`,
        {
          quoteResponse: quote,
          userPublicKey,
          wrapAndUnwrapSol: true,
          computeUnitPriceMicroLamports: priorityFeeLamports,
          dynamicComputeUnitLimit: true,
        },
        { timeout: 15000 }
      );

      return {
        transaction: response.data.swapTransaction,
        lastValidBlockHeight: response.data.lastValidBlockHeight,
      };
    } catch (error: any) {
      console.error('[TradeExecutor] Build swap error:', error.message);
      return null;
    }
  }

  private getPriorityFeeLamports(level: 'low' | 'medium' | 'high' | 'auto'): number {
    switch (level) {
      case 'low':
        return 1000; // 0.001 SOL
      case 'medium':
        return 10000; // 0.01 SOL
      case 'high':
        return 100000; // 0.1 SOL
      case 'auto':
      default:
        return 5000; // 0.005 SOL - balanced
    }
  }

  // ============================================
  // EXECUTE SWAP (Requires wallet signing)
  // ============================================

  async executeSwap(
    signedTransaction: string
  ): Promise<SwapResult> {
    try {
      // Decode the signed transaction
      const txBuffer = Buffer.from(signedTransaction, 'base64');
      
      // Send transaction
      const signature = await this.connection.sendRawTransaction(txBuffer, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        return {
          success: false,
          error: `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
          inputAmount: '0',
        };
      }

      return {
        success: true,
        txSignature: signature,
        inputAmount: '0', // Would be filled from actual tx
      };
    } catch (error: any) {
      console.error('[TradeExecutor] Execute swap error:', error.message);
      return {
        success: false,
        error: error.message,
        inputAmount: '0',
      };
    }
  }

  // ============================================
  // POSITION MONITORING
  // ============================================

  async checkTokenPrice(tokenMint: string): Promise<{
    priceUsd: number;
    priceSol: number;
  } | null> {
    try {
      // Get a tiny quote to determine current price
      const quote = await this.getSwapQuote(
        tokenMint,
        SOL_MINT,
        '1000000000', // 1 billion tokens (arbitrary for price check)
        50 // 0.5% slippage
      );

      if (!quote) return null;

      const tokensIn = parseFloat(quote.inAmount);
      const solOut = parseFloat(quote.outAmount) / 1e9;
      const priceSol = solOut / tokensIn;
      
      // Get SOL price in USD
      const solPrice = await this.getSolPrice();
      const priceUsd = priceSol * solPrice;

      return { priceUsd, priceSol };
    } catch (error) {
      console.error('[TradeExecutor] Price check error:', error);
      return null;
    }
  }

  async getSolPrice(): Promise<number> {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
        { timeout: 5000 }
      );
      return response.data?.solana?.usd || 0;
    } catch {
      return 0;
    }
  }

  // ============================================
  // STOP LOSS / TAKE PROFIT CHECKS
  // ============================================

  shouldTriggerExit(
    entryPriceSol: number,
    currentPriceSol: number,
    config: SnipePresetConfig
  ): { trigger: boolean; reason: 'take_profit' | 'stop_loss' | 'trailing_stop' | null } {
    const changePercent = ((currentPriceSol - entryPriceSol) / entryPriceSol) * 100;

    // Check take profit
    if (changePercent >= config.tradeControls.takeProfitPercent) {
      return { trigger: true, reason: 'take_profit' };
    }

    // Check stop loss
    if (changePercent <= -config.tradeControls.stopLossPercent) {
      return { trigger: true, reason: 'stop_loss' };
    }

    // Trailing stop would need tracking of highest price reached
    // This is simplified - real implementation would track max price

    return { trigger: false, reason: null };
  }

  // ============================================
  // WALLET BALANCE
  // ============================================

  async getWalletSolBalance(walletAddress: string): Promise<number> {
    try {
      const pubkey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(pubkey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('[TradeExecutor] Balance check error:', error);
      return 0;
    }
  }

  async getWalletTokenBalance(
    walletAddress: string,
    tokenMint: string
  ): Promise<{ amount: string; decimals: number } | null> {
    try {
      const walletPubkey = new PublicKey(walletAddress);
      const mintPubkey = new PublicKey(tokenMint);

      const accounts = await this.connection.getParsedTokenAccountsByOwner(
        walletPubkey,
        { mint: mintPubkey }
      );

      if (accounts.value.length === 0) return null;

      const account = accounts.value[0].account.data.parsed.info;
      return {
        amount: account.tokenAmount.amount,
        decimals: account.tokenAmount.decimals,
      };
    } catch (error) {
      console.error('[TradeExecutor] Token balance error:', error);
      return null;
    }
  }

  // ============================================
  // SIMULATION (for testing without real trades)
  // ============================================

  async simulateBuy(
    tokenMint: string,
    solAmount: number,
    slippagePercent: number
  ): Promise<{
    success: boolean;
    expectedTokens: string;
    priceImpact: string;
    error?: string;
  }> {
    const quote = await this.getBuyQuote(tokenMint, solAmount, slippagePercent);
    
    if (!quote) {
      return {
        success: false,
        expectedTokens: '0',
        priceImpact: '0',
        error: 'Failed to get quote',
      };
    }

    return {
      success: true,
      expectedTokens: quote.outAmount,
      priceImpact: quote.priceImpactPct,
    };
  }

  async simulateSell(
    tokenMint: string,
    tokenAmount: string,
    slippagePercent: number
  ): Promise<{
    success: boolean;
    expectedSol: string;
    priceImpact: string;
    error?: string;
  }> {
    const quote = await this.getSellQuote(tokenMint, tokenAmount, slippagePercent);
    
    if (!quote) {
      return {
        success: false,
        expectedSol: '0',
        priceImpact: '0',
        error: 'Failed to get quote',
      };
    }

    return {
      success: true,
      expectedSol: (parseFloat(quote.outAmount) / 1e9).toFixed(6),
      priceImpact: quote.priceImpactPct,
    };
  }
}

export const tradeExecutorService = new TradeExecutorService();
