import { Connection, PublicKey, VersionedTransaction, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import {
  DEXConnector,
  Balance,
  MarketInfo,
  OrderBook,
  Ticker,
  Order,
  CreateOrderParams,
  SwapQuote,
  SwapParams,
  SwapResult,
  OrderStatus,
  TimeInForce
} from '../exchangeConnector.js';

const JUPITER_API_URL = 'https://quote-api.jup.ag/v6';
const JUPITER_PRICE_API = 'https://price.jup.ag/v4';
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const PUBLIC_SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const SOLANA_RPC = HELIUS_API_KEY 
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}` 
  : PUBLIC_SOLANA_RPC;

interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label?: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot: number;
  timeTaken: number;
}

interface JupiterToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

export class JupiterAdapter implements DEXConnector {
  name = 'Jupiter';
  type: 'DEX' = 'DEX';
  chains = ['solana'];

  private connection: Connection;
  private walletAddress?: string;
  private privateKey?: string;
  private lastRequestTime: number = 0;
  private minRequestInterval = 100;

  constructor(walletAddress?: string, privateKey?: string) {
    this.connection = new Connection(SOLANA_RPC, 'confirmed');
    this.walletAddress = walletAddress;
    this.privateKey = privateKey;
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  private logError(method: string, error: any): void {
    console.error(`[Jupiter] ${method} error:`, error.message || error);
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${JUPITER_PRICE_API}/price?ids=So11111111111111111111111111111111111111112`);
      return response.ok;
    } catch (error) {
      this.logError('validateConnection', error);
      return false;
    }
  }

  async getBalance(asset: string): Promise<Balance> {
    if (!this.walletAddress) {
      return { available: 0, locked: 0 };
    }

    try {
      const balance = await this.getTokenBalance(asset);
      return { available: balance, locked: 0 };
    } catch (error) {
      this.logError('getBalance', error);
      return { available: 0, locked: 0 };
    }
  }

  async getBalances(): Promise<Record<string, Balance>> {
    if (!this.walletAddress) {
      return {};
    }

    try {
      const pubkey = new PublicKey(this.walletAddress);
      
      const solBalance = await this.connection.getBalance(pubkey);
      const balances: Record<string, Balance> = {
        SOL: { available: solBalance / 1e9, locked: 0 }
      };

      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(pubkey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });

      for (const account of tokenAccounts.value) {
        const info = account.account.data.parsed.info;
        const mint = info.mint;
        const amount = parseFloat(info.tokenAmount.uiAmountString || '0');
        if (amount > 0) {
          balances[mint] = { available: amount, locked: 0 };
        }
      }

      return balances;
    } catch (error) {
      this.logError('getBalances', error);
      return {};
    }
  }

  async getTokenBalance(tokenMint: string): Promise<number> {
    if (!this.walletAddress) {
      return 0;
    }

    try {
      if (tokenMint === 'So11111111111111111111111111111111111111112' || tokenMint === 'SOL') {
        const pubkey = new PublicKey(this.walletAddress);
        const balance = await this.connection.getBalance(pubkey);
        return balance / 1e9;
      }

      const pubkey = new PublicKey(this.walletAddress);
      const mintPubkey = new PublicKey(tokenMint);
      
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(pubkey, {
        mint: mintPubkey
      });

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      const accountInfo = await this.connection.getParsedAccountInfo(tokenAccounts.value[0].pubkey);
      const data = accountInfo.value?.data;
      
      if (data && 'parsed' in data) {
        return parseFloat(data.parsed.info.tokenAmount.uiAmountString || '0');
      }

      return 0;
    } catch (error) {
      this.logError('getTokenBalance', error);
      return 0;
    }
  }

  async getMarkets(): Promise<MarketInfo[]> {
    try {
      await this.rateLimit();
      const response = await fetch('https://token.jup.ag/strict');
      const tokens: JupiterToken[] = await response.json();

      return tokens.slice(0, 100).map(token => ({
        symbol: `${token.symbol}/USDC`,
        baseAsset: token.symbol,
        quoteAsset: 'USDC',
        minOrderSize: 0.000001,
        tickSize: 0.000001,
        stepSize: Math.pow(10, -token.decimals),
        status: 'active'
      }));
    } catch (error) {
      this.logError('getMarkets', error);
      return [];
    }
  }

  async getOrderBook(_symbol: string, _limit?: number): Promise<OrderBook> {
    return {
      symbol: _symbol,
      bids: [],
      asks: [],
      timestamp: Date.now()
    };
  }

  async getTicker(symbol: string): Promise<Ticker> {
    try {
      await this.rateLimit();
      const baseAsset = symbol.split('/')[0];
      
      const response = await fetch(`${JUPITER_PRICE_API}/price?ids=${baseAsset}`);
      const data = await response.json();
      const price = data.data?.[baseAsset]?.price || 0;

      return {
        symbol,
        lastPrice: price,
        bidPrice: price,
        askPrice: price,
        volume24h: 0,
        priceChange24h: 0,
        priceChangePercent24h: 0,
        high24h: 0,
        low24h: 0,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logError('getTicker', error);
      return {
        symbol,
        lastPrice: 0,
        bidPrice: 0,
        askPrice: 0,
        volume24h: 0,
        priceChange24h: 0,
        priceChangePercent24h: 0,
        high24h: 0,
        low24h: 0,
        timestamp: Date.now()
      };
    }
  }

  async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
    try {
      await this.rateLimit();

      const url = new URL(`${JUPITER_API_URL}/quote`);
      url.searchParams.set('inputMint', params.inputMint);
      url.searchParams.set('outputMint', params.outputMint);
      url.searchParams.set('amount', Math.floor(params.amount).toString());
      url.searchParams.set('slippageBps', params.slippageBps.toString());

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Jupiter quote failed: ${response.statusText}`);
      }

      const quote: JupiterQuote = await response.json();

      const route = quote.routePlan.map(r => r.swapInfo.label || 'Unknown').join(' -> ');
      const totalFee = quote.routePlan.reduce((sum, r) => sum + parseInt(r.swapInfo.feeAmount), 0);

      return {
        inputMint: quote.inputMint,
        outputMint: quote.outputMint,
        inAmount: parseInt(quote.inAmount),
        outAmount: parseInt(quote.outAmount),
        priceImpact: parseFloat(quote.priceImpactPct),
        fee: totalFee,
        route: route.split(' -> '),
        expiresAt: Date.now() + 30000
      };
    } catch (error) {
      this.logError('getSwapQuote', error);
      throw error;
    }
  }

  async executeSwap(params: SwapParams): Promise<SwapResult> {
    if (!this.walletAddress || !this.privateKey) {
      return {
        success: false,
        inputAmount: params.amount,
        outputAmount: 0,
        priceImpact: 0,
        fee: 0,
        error: 'Wallet not configured for signing'
      };
    }

    try {
      const quote = await this.getSwapQuote(params);

      await this.rateLimit();
      const swapResponse = await fetch(`${JUPITER_API_URL}/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: this.walletAddress,
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 'auto'
        })
      });

      if (!swapResponse.ok) {
        throw new Error(`Jupiter swap request failed: ${swapResponse.statusText}`);
      }

      const swapData = await swapResponse.json();
      const swapTransactionBuf = Buffer.from(swapData.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      const keypair = Keypair.fromSecretKey(bs58.decode(this.privateKey));
      transaction.sign([keypair]);

      const signature = await this.connection.sendTransaction(transaction, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      await this.connection.confirmTransaction(signature, 'confirmed');

      return {
        success: true,
        txSignature: signature,
        inputAmount: quote.inAmount,
        outputAmount: quote.outAmount,
        priceImpact: quote.priceImpact,
        fee: quote.fee
      };
    } catch (error: any) {
      this.logError('executeSwap', error);
      return {
        success: false,
        inputAmount: params.amount,
        outputAmount: 0,
        priceImpact: 0,
        fee: 0,
        error: error.message
      };
    }
  }

  async createOrder(params: CreateOrderParams): Promise<Order> {
    throw new Error('Use getSwapQuote and executeSwap for DEX trades');
  }

  async cancelOrder(_orderId: string, _symbol: string): Promise<boolean> {
    return false;
  }

  async getOrder(_orderId: string, _symbol: string): Promise<Order> {
    throw new Error('Jupiter does not support order queries - use transaction history');
  }

  async getOpenOrders(_symbol?: string): Promise<Order[]> {
    return [];
  }

  async getOrderHistory(_symbol?: string, _limit?: number): Promise<Order[]> {
    return [];
  }
}
