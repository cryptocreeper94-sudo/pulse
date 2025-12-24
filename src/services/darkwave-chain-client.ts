/**
 * DarkWave Chain Integration Client
 * Connects Pulse predictive/quant systems to DarkWave Chain L1 blockchain
 * 
 * API: https://darkwave-studios.replit.app
 * Launch: February 14, 2026
 */

const DARKWAVE_CHAIN_API = 'https://darkwave-studios.replit.app';

// ============================================================================
// TYPES
// ============================================================================

export interface TradingSignal {
  action: 'BUY' | 'SELL';
  token: string;
  confidence: number;
  amount: string;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  fromAmount?: string;
  toAmount?: string;
  error?: string;
}

export interface StakePosition {
  id: string;
  amount: string;
  apy: number;
  lockEnd: string;
  rewards: string;
}

export interface PortfolioData {
  balances: any;
  staking: { positions: StakePosition[] };
  transactions: any[];
}

export interface ChainStats {
  blockHeight: number;
  totalTransactions: number;
  tps: number;
  activeValidators: number;
  totalStaked: string;
}

export interface SwapQuote {
  fromAmount: string;
  toAmount: string;
  price: number;
  priceImpact: number;
  fee: string;
}

// ============================================================================
// SECTION 2: AI SIGNALS → AUTO-TRADING
// ============================================================================

/**
 * Execute a trading signal on DarkWave DEX
 * Only executes if confidence >= 0.75
 * Available pairs: DWT/USDC, DWT/wETH, DWT/wSOL, DWT/USDT, USDC/wETH
 */
export async function executeSignal(signal: TradingSignal, userWalletAddress: string): Promise<SwapResult | null> {
  if (signal.confidence < 0.75) {
    console.log(`[DarkWave Chain] Signal confidence ${signal.confidence} below threshold 0.75, skipping`);
    return null;
  }

  try {
    const response = await fetch(`${DARKWAVE_CHAIN_API}/api/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromToken: signal.action === 'BUY' ? 'USDC' : 'DWT',
        toToken: signal.action === 'BUY' ? 'DWT' : 'USDC',
        amount: signal.amount,
        walletAddress: userWalletAddress,
        slippage: 0.5
      })
    });

    const result = await response.json();
    console.log(`[DarkWave Chain] Swap executed:`, result);
    return result;
  } catch (error) {
    console.error('[DarkWave Chain] Swap execution failed:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get a swap quote without executing
 */
export async function getSwapQuote(fromToken: string, toToken: string, amount: string): Promise<SwapQuote | null> {
  try {
    const response = await fetch(
      `${DARKWAVE_CHAIN_API}/api/swap/quote?from=${fromToken}&to=${toToken}&amount=${amount}`
    );
    return response.json();
  } catch (error) {
    console.error('[DarkWave Chain] Quote fetch failed:', error);
    return null;
  }
}

// ============================================================================
// SECTION 3: STAKING OPTIMIZATION
// ============================================================================

/**
 * Stake DWT tokens
 * @param amount Amount to stake
 * @param walletAddress User's wallet address
 * @param lockPeriod Lock period in days (default 30)
 */
export async function stakeTokens(amount: string, walletAddress: string, lockPeriod: number = 30) {
  try {
    const response = await fetch(`${DARKWAVE_CHAIN_API}/api/staking/stake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, walletAddress, lockPeriod })
    });
    return response.json();
  } catch (error) {
    console.error('[DarkWave Chain] Stake failed:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Unstake tokens from a position
 */
export async function unstakeTokens(positionId: string, walletAddress: string) {
  try {
    const response = await fetch(`${DARKWAVE_CHAIN_API}/api/staking/unstake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionId, walletAddress })
    });
    return response.json();
  } catch (error) {
    console.error('[DarkWave Chain] Unstake failed:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Liquid stake for 12% APY - tokens remain liquid as stDWT
 */
export async function liquidStake(amount: string, walletAddress: string) {
  try {
    const response = await fetch(`${DARKWAVE_CHAIN_API}/api/liquid-staking/stake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, walletAddress })
    });
    return response.json();
  } catch (error) {
    console.error('[DarkWave Chain] Liquid stake failed:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get staking positions for a wallet
 */
export async function getStakingPositions(walletAddress: string): Promise<{ positions: StakePosition[] } | null> {
  try {
    const response = await fetch(`${DARKWAVE_CHAIN_API}/api/staking/positions/${walletAddress}`);
    return response.json();
  } catch (error) {
    console.error('[DarkWave Chain] Get staking positions failed:', error);
    return null;
  }
}

// ============================================================================
// SECTION 4: WEBHOOK EVENTS REGISTRATION
// ============================================================================

const WEBHOOK_EVENTS = [
  'swap.executed',
  'stake.created',
  'stake.claimed',
  'block.produced',
  'transaction.confirmed',
  'liquidity.added',
  'token.launched',
  'bridge.locked',
  'bridge.released'
];

/**
 * Register Pulse to receive webhook events from DarkWave Chain
 * Call this on server startup
 */
export async function registerWebhooks(pulseWebhookUrl: string) {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('[DarkWave Chain] WEBHOOK_SECRET not set, skipping webhook registration');
    return { success: false, error: 'WEBHOOK_SECRET not configured' };
  }

  try {
    const response = await fetch(`${DARKWAVE_CHAIN_API}/api/webhooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: pulseWebhookUrl,
        secret: webhookSecret,
        events: WEBHOOK_EVENTS
      })
    });
    
    const result = await response.json();
    console.log('[DarkWave Chain] Webhooks registered:', result);
    return result;
  } catch (error) {
    console.error('[DarkWave Chain] Webhook registration failed:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Verify webhook signature using HMAC-SHA256
 */
export function verifyWebhookSignature(data: any, signature: string): boolean {
  const crypto = require('crypto');
  const webhookSecret = process.env.WEBHOOK_SECRET;
  
  if (!webhookSecret) return false;
  
  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(data))
    .digest('hex');
  
  return signature === expectedSig;
}

// ============================================================================
// SECTION 5: SHARED WALLET (SAME SEED = SAME ADDRESSES)
// ============================================================================

// Derivation paths (identical on both platforms)
export const DERIVATION_PATHS = {
  darkwave: "m/44'/60'/0'/0/0",
  ethereum: "m/44'/60'/0'/0/0",
  solana: "m/44'/501'/0'/0'"
};

// ============================================================================
// SECTION 6: PORTFOLIO SYNC
// ============================================================================

/**
 * Sync full portfolio from DarkWave Chain
 */
export async function syncPortfolio(walletAddress: string): Promise<PortfolioData | null> {
  try {
    const [balances, staking, transactions] = await Promise.all([
      fetch(`${DARKWAVE_CHAIN_API}/api/portfolio/${walletAddress}`).then(r => r.json()),
      fetch(`${DARKWAVE_CHAIN_API}/api/staking/positions/${walletAddress}`).then(r => r.json()),
      fetch(`${DARKWAVE_CHAIN_API}/api/transactions/${walletAddress}?limit=50`).then(r => r.json())
    ]);

    return { balances, staking, transactions };
  } catch (error) {
    console.error('[DarkWave Chain] Portfolio sync failed:', error);
    return null;
  }
}

/**
 * Get balances across all 9 supported chains
 */
export async function getMultiChainBalances(walletAddress: string) {
  const chains = ['darkwave', 'solana', 'ethereum', 'base', 'polygon', 'arbitrum', 'bsc', 'optimism', 'avalanche'];

  try {
    const balances = await Promise.all(chains.map(async chain => {
      const res = await fetch(`${DARKWAVE_CHAIN_API}/api/wallet/balance/${chain}/${walletAddress}`);
      return { chain, ...(await res.json()) };
    }));

    return balances;
  } catch (error) {
    console.error('[DarkWave Chain] Multi-chain balance fetch failed:', error);
    return null;
  }
}

// ============================================================================
// SECTION 7: DATA ENDPOINTS FOR DASHBOARDS
// ============================================================================

/**
 * Get blockchain stats
 */
export async function getChainStats(): Promise<ChainStats | null> {
  try {
    const response = await fetch(`${DARKWAVE_CHAIN_API}/api/chain/stats`);
    return response.json();
  } catch (error) {
    console.error('[DarkWave Chain] Chain stats fetch failed:', error);
    return null;
  }
}

/**
 * Get price history for charts
 */
export async function getPriceHistory(token: string = 'DWT', timeframe: string = '24h') {
  try {
    const response = await fetch(`${DARKWAVE_CHAIN_API}/api/charts/price-history?token=${token}&timeframe=${timeframe}`);
    return response.json();
  } catch (error) {
    console.error('[DarkWave Chain] Price history fetch failed:', error);
    return null;
  }
}

/**
 * Get transaction history for a wallet
 */
export async function getTransactionHistory(walletAddress: string, limit: number = 50) {
  try {
    const response = await fetch(`${DARKWAVE_CHAIN_API}/api/transactions/${walletAddress}?limit=${limit}`);
    return response.json();
  } catch (error) {
    console.error('[DarkWave Chain] Transaction history fetch failed:', error);
    return null;
  }
}

// ============================================================================
// SECTION 8: CROSS-CHAIN ARBITRAGE
// ============================================================================

export interface ArbitrageOpportunity {
  opportunity: 'ETH' | 'SOL' | null;
  spread: number;
  dwtPrice: number;
  targetPrice: number;
}

/**
 * Check for arbitrage opportunities between DarkWave DEX and external chains
 * @param getExternalPrice Function to fetch wDWT price from external DEX (Uniswap, Raydium, etc.)
 */
export async function checkArbitrage(
  walletAddress: string,
  getExternalPrice: (chain: 'ethereum' | 'solana') => Promise<number>
): Promise<ArbitrageOpportunity | null> {
  try {
    const dwtQuote = await getSwapQuote('DWT', 'USDC', '1000');
    if (!dwtQuote) return null;

    const dwtPrice = parseFloat(dwtQuote.toAmount) / 1000;

    const wdwtEthPrice = await getExternalPrice('ethereum');
    const wdwtSolPrice = await getExternalPrice('solana');

    if (wdwtEthPrice > dwtPrice * 1.02) {
      await fetch(`${DARKWAVE_CHAIN_API}/api/bridge/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: '1000',
          targetChain: 'ethereum',
          walletAddress
        })
      });
      return {
        opportunity: 'ETH',
        spread: ((wdwtEthPrice / dwtPrice) - 1) * 100,
        dwtPrice,
        targetPrice: wdwtEthPrice
      };
    }

    if (wdwtSolPrice > dwtPrice * 1.02) {
      await fetch(`${DARKWAVE_CHAIN_API}/api/bridge/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: '1000',
          targetChain: 'solana',
          walletAddress
        })
      });
      return {
        opportunity: 'SOL',
        spread: ((wdwtSolPrice / dwtPrice) - 1) * 100,
        dwtPrice,
        targetPrice: wdwtSolPrice
      };
    }

    return null;
  } catch (error) {
    console.error('[DarkWave Chain] Arbitrage check failed:', error);
    return null;
  }
}

// ============================================================================
// EXPORTS SUMMARY
// ============================================================================

export default {
  executeSignal,
  getSwapQuote,
  stakeTokens,
  unstakeTokens,
  liquidStake,
  getStakingPositions,
  registerWebhooks,
  verifyWebhookSignature,
  syncPortfolio,
  getMultiChainBalances,
  getChainStats,
  getPriceHistory,
  getTransactionHistory,
  checkArbitrage,
  DERIVATION_PATHS,
  DARKWAVE_CHAIN_API
};
