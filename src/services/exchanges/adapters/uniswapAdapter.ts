import { ethers } from 'ethers';
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
  TimeInForce
} from '../exchangeConnector.js';

const UNISWAP_V3_QUOTER = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
const UNISWAP_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

const QUOTER_ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)',
  'function quoteExactInput(bytes memory path, uint256 amountIn) external returns (uint256 amountOut)'
];

const ROUTER_ABI = [
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
  'function exactInput((bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum)) external payable returns (uint256 amountOut)'
];

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

interface ChainConfig {
  rpcUrl: string;
  quoter: string;
  router: string;
  weth: string;
  chainId: number;
}

const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  ethereum: {
    rpcUrl: 'https://eth.llamarpc.com',
    quoter: UNISWAP_V3_QUOTER,
    router: UNISWAP_V3_ROUTER,
    weth: WETH_ADDRESS,
    chainId: 1
  },
  arbitrum: {
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    chainId: 42161
  },
  base: {
    rpcUrl: 'https://mainnet.base.org',
    quoter: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
    router: '0x2626664c2603336E57B271c5C0b26F421741e481',
    weth: '0x4200000000000000000000000000000000000006',
    chainId: 8453
  },
  polygon: {
    rpcUrl: 'https://polygon-rpc.com',
    quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    weth: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    chainId: 137
  }
};

export class UniswapAdapter implements DEXConnector {
  name = 'Uniswap';
  type: 'DEX' = 'DEX';
  chains = ['ethereum', 'arbitrum', 'base', 'polygon'];

  private providers: Map<string, ethers.JsonRpcProvider> = new Map();
  private walletAddress?: string;
  private privateKey?: string;
  private activeChain: string = 'ethereum';
  private lastRequestTime: number = 0;
  private minRequestInterval = 100;

  constructor(walletAddress?: string, privateKey?: string, chain: string = 'ethereum') {
    this.walletAddress = walletAddress;
    this.privateKey = privateKey;
    this.activeChain = chain;

    for (const [chainId, config] of Object.entries(CHAIN_CONFIGS)) {
      this.providers.set(chainId, new ethers.JsonRpcProvider(config.rpcUrl));
    }
  }

  private getProvider(): ethers.JsonRpcProvider {
    return this.providers.get(this.activeChain) || this.providers.get('ethereum')!;
  }

  private getConfig(): ChainConfig {
    return CHAIN_CONFIGS[this.activeChain] || CHAIN_CONFIGS.ethereum;
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
    console.error(`[Uniswap] ${method} error:`, error.message || error);
  }

  setChain(chain: string): void {
    if (CHAIN_CONFIGS[chain]) {
      this.activeChain = chain;
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const provider = this.getProvider();
      await provider.getBlockNumber();
      return true;
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
      const provider = this.getProvider();
      const ethBalance = await provider.getBalance(this.walletAddress);
      
      return {
        ETH: {
          available: parseFloat(ethers.formatEther(ethBalance)),
          locked: 0
        }
      };
    } catch (error) {
      this.logError('getBalances', error);
      return {};
    }
  }

  async getTokenBalance(tokenAddress: string): Promise<number> {
    if (!this.walletAddress) {
      return 0;
    }

    try {
      const provider = this.getProvider();
      const config = this.getConfig();

      if (tokenAddress.toLowerCase() === 'eth' || tokenAddress.toLowerCase() === config.weth.toLowerCase()) {
        const balance = await provider.getBalance(this.walletAddress);
        return parseFloat(ethers.formatEther(balance));
      }

      const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const [balance, decimals] = await Promise.all([
        token.balanceOf(this.walletAddress),
        token.decimals()
      ]);

      return parseFloat(ethers.formatUnits(balance, decimals));
    } catch (error) {
      this.logError('getTokenBalance', error);
      return 0;
    }
  }

  async getMarkets(): Promise<MarketInfo[]> {
    const commonPairs = [
      { baseAsset: 'WETH', quoteAsset: 'USDC' },
      { baseAsset: 'WETH', quoteAsset: 'USDT' },
      { baseAsset: 'WETH', quoteAsset: 'DAI' },
      { baseAsset: 'WBTC', quoteAsset: 'WETH' },
      { baseAsset: 'UNI', quoteAsset: 'WETH' },
      { baseAsset: 'LINK', quoteAsset: 'WETH' },
      { baseAsset: 'AAVE', quoteAsset: 'WETH' }
    ];

    return commonPairs.map(pair => ({
      symbol: `${pair.baseAsset}/${pair.quoteAsset}`,
      baseAsset: pair.baseAsset,
      quoteAsset: pair.quoteAsset,
      minOrderSize: 0.0001,
      tickSize: 0.000001,
      stepSize: 0.000001,
      status: 'active'
    }));
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

  async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
    try {
      await this.rateLimit();

      const provider = this.getProvider();
      const config = this.getConfig();
      const quoter = new ethers.Contract(config.quoter, QUOTER_ABI, provider);

      const fee = 3000;

      const amountOut = await quoter.quoteExactInputSingle.staticCall(
        params.inputMint,
        params.outputMint,
        fee,
        params.amount,
        0
      );

      const priceImpact = 0.3;

      return {
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        inAmount: params.amount,
        outAmount: Number(amountOut),
        priceImpact,
        fee: 0,
        route: [params.inputMint, params.outputMint],
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
      const provider = this.getProvider();
      const config = this.getConfig();
      const wallet = new ethers.Wallet(this.privateKey, provider);

      const router = new ethers.Contract(config.router, ROUTER_ABI, wallet);

      const minAmountOut = BigInt(Math.floor(quote.outAmount * (1 - params.slippageBps / 10000)));
      const deadline = Math.floor(Date.now() / 1000) + 300;

      const swapParams = {
        tokenIn: params.inputMint,
        tokenOut: params.outputMint,
        fee: 3000,
        recipient: this.walletAddress,
        deadline,
        amountIn: params.amount,
        amountOutMinimum: minAmountOut,
        sqrtPriceLimitX96: 0
      };

      const inputToken = new ethers.Contract(params.inputMint, ERC20_ABI, wallet);
      const allowance = await inputToken.allowance(this.walletAddress, config.router);
      
      if (allowance < BigInt(params.amount)) {
        const approveTx = await inputToken.approve(config.router, ethers.MaxUint256);
        await approveTx.wait();
      }

      const tx = await router.exactInputSingle(swapParams);
      const receipt = await tx.wait();

      return {
        success: true,
        txSignature: receipt.hash,
        inputAmount: params.amount,
        outputAmount: Number(quote.outAmount),
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

  async createOrder(_params: CreateOrderParams): Promise<Order> {
    throw new Error('Use getSwapQuote and executeSwap for DEX trades');
  }

  async cancelOrder(_orderId: string, _symbol: string): Promise<boolean> {
    return false;
  }

  async getOrder(_orderId: string, _symbol: string): Promise<Order> {
    throw new Error('Uniswap does not support order queries - use transaction history');
  }

  async getOpenOrders(_symbol?: string): Promise<Order[]> {
    return [];
  }

  async getOrderHistory(_symbol?: string, _limit?: number): Promise<Order[]> {
    return [];
  }
}
