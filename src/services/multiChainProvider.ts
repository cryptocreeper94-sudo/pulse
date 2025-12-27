import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import axios from 'axios';

export type ChainId = 'solana' | 'ethereum' | 'base' | 'polygon' | 'arbitrum' | 'bsc';

export interface ChainConfig {
  id: ChainId;
  name: string;
  symbol: string;
  chainId?: number;
  rpcUrl: string;
  explorerUrl: string;
  dexScreenerChainId: string;
  coingeckoId: string;
  nativeTokenDecimals: number;
  isEvm: boolean;
  uniswapRouterAddress?: string;
  factoryAddress?: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  chain: ChainId;
  logoUrl?: string;
  priceUsd?: number;
  marketCapUsd?: number;
  volume24h?: number;
  liquidity?: number;
  pairAddress?: string;
}

export interface TokenHolder {
  address: string;
  balance: string;
  percentage: number;
}

export interface LiquidityInfo {
  pairAddress: string;
  dexName: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  liquidityUsd: number;
  lpTokenAddress?: string;
  lpTokenSupply?: string;
}

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const PUBLIC_SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const SOLANA_RPC_URL = HELIUS_API_KEY 
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}` 
  : PUBLIC_SOLANA_RPC;

export const CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  solana: {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    rpcUrl: SOLANA_RPC_URL,
    explorerUrl: 'https://solscan.io',
    dexScreenerChainId: 'solana',
    coingeckoId: 'solana',
    nativeTokenDecimals: 9,
    isEvm: false,
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    dexScreenerChainId: 'ethereum',
    coingeckoId: 'ethereum',
    nativeTokenDecimals: 18,
    isEvm: true,
    uniswapRouterAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    factoryAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  },
  base: {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    dexScreenerChainId: 'base',
    coingeckoId: 'base',
    nativeTokenDecimals: 18,
    isEvm: true,
    uniswapRouterAddress: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
    factoryAddress: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    dexScreenerChainId: 'polygon',
    coingeckoId: 'polygon-pos',
    nativeTokenDecimals: 18,
    isEvm: true,
    uniswapRouterAddress: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    factoryAddress: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    dexScreenerChainId: 'arbitrum',
    coingeckoId: 'arbitrum-one',
    nativeTokenDecimals: 18,
    isEvm: true,
    uniswapRouterAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    factoryAddress: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Chain',
    symbol: 'BNB',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    dexScreenerChainId: 'bsc',
    coingeckoId: 'binance-smart-chain',
    nativeTokenDecimals: 18,
    isEvm: true,
    uniswapRouterAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    factoryAddress: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
  },
};

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function owner() view returns (address)',
  'function getOwner() view returns (address)',
];

const PAIR_ABI = [
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112, uint112, uint32)',
  'function totalSupply() view returns (uint256)',
];

class MultiChainProvider {
  private solanaConnection: Connection;
  private evmProviders: Map<ChainId, ethers.JsonRpcProvider> = new Map();

  constructor() {
    this.solanaConnection = new Connection(CHAIN_CONFIGS.solana.rpcUrl, 'confirmed');

    for (const [chainId, config] of Object.entries(CHAIN_CONFIGS)) {
      if (config.isEvm) {
        this.evmProviders.set(chainId as ChainId, new ethers.JsonRpcProvider(config.rpcUrl));
      }
    }
  }

  getChainConfig(chain: ChainId): ChainConfig {
    return CHAIN_CONFIGS[chain];
  }

  getSupportedChains(): ChainId[] {
    return Object.keys(CHAIN_CONFIGS) as ChainId[];
  }

  async getTokenInfo(chain: ChainId, tokenAddress: string): Promise<TokenInfo | null> {
    const config = CHAIN_CONFIGS[chain];

    try {
      const dexData = await this.getDexScreenerData(chain, tokenAddress);

      if (config.isEvm) {
        return await this.getEvmTokenInfo(chain, tokenAddress, dexData);
      } else {
        return await this.getSolanaTokenInfo(tokenAddress, dexData);
      }
    } catch (error) {
      console.error(`[MultiChain] Error getting token info for ${chain}:${tokenAddress}:`, error);
      return null;
    }
  }

  private async getEvmTokenInfo(chain: ChainId, tokenAddress: string, dexData: any): Promise<TokenInfo> {
    const provider = this.evmProviders.get(chain)!;
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name().catch(() => 'Unknown'),
      contract.symbol().catch(() => 'UNKNOWN'),
      contract.decimals().catch(() => 18),
      contract.totalSupply().catch(() => '0'),
    ]);

    return {
      address: tokenAddress,
      symbol,
      name,
      decimals: Number(decimals),
      totalSupply: totalSupply.toString(),
      chain,
      priceUsd: dexData?.priceUsd,
      marketCapUsd: dexData?.marketCap,
      volume24h: dexData?.volume24h,
      liquidity: dexData?.liquidity,
      pairAddress: dexData?.pairAddress,
      logoUrl: dexData?.imageUrl,
    };
  }

  private async getSolanaTokenInfo(tokenAddress: string, dexData: any): Promise<TokenInfo> {
    try {
      const response = await axios.post(CHAIN_CONFIGS.solana.rpcUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getAsset',
        params: { id: tokenAddress },
      });

      const asset = response.data?.result;

      return {
        address: tokenAddress,
        symbol: asset?.content?.metadata?.symbol || dexData?.symbol || 'UNKNOWN',
        name: asset?.content?.metadata?.name || dexData?.name || 'Unknown Token',
        decimals: asset?.token_info?.decimals || 9,
        totalSupply: asset?.token_info?.supply || '0',
        chain: 'solana',
        priceUsd: dexData?.priceUsd,
        marketCapUsd: dexData?.marketCap,
        volume24h: dexData?.volume24h,
        liquidity: dexData?.liquidity,
        pairAddress: dexData?.pairAddress,
        logoUrl: asset?.content?.links?.image || dexData?.imageUrl,
      };
    } catch (error) {
      return {
        address: tokenAddress,
        symbol: dexData?.symbol || 'UNKNOWN',
        name: dexData?.name || 'Unknown Token',
        decimals: 9,
        totalSupply: '0',
        chain: 'solana',
        priceUsd: dexData?.priceUsd,
        marketCapUsd: dexData?.marketCap,
        volume24h: dexData?.volume24h,
        liquidity: dexData?.liquidity,
        pairAddress: dexData?.pairAddress,
      };
    }
  }

  private async getDexScreenerData(chain: ChainId, tokenAddress: string): Promise<any> {
    try {
      const config = CHAIN_CONFIGS[chain];
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
      );

      const pairs = response.data?.pairs || [];
      const chainPairs = pairs.filter((p: any) => p.chainId === config.dexScreenerChainId);

      if (chainPairs.length === 0) return null;

      const topPair = chainPairs.sort((a: any, b: any) => 
        (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
      )[0];

      return {
        priceUsd: parseFloat(topPair.priceUsd) || 0,
        marketCap: topPair.marketCap || 0,
        volume24h: topPair.volume?.h24 || 0,
        liquidity: topPair.liquidity?.usd || 0,
        pairAddress: topPair.pairAddress,
        symbol: topPair.baseToken?.symbol,
        name: topPair.baseToken?.name,
        imageUrl: topPair.info?.imageUrl,
      };
    } catch (error) {
      return null;
    }
  }

  async getTopHolders(chain: ChainId, tokenAddress: string, limit: number = 10): Promise<TokenHolder[]> {
    const config = CHAIN_CONFIGS[chain];

    try {
      if (!config.isEvm) {
        return await this.getSolanaTopHolders(tokenAddress, limit);
      } else {
        return await this.getEvmTopHolders(chain, tokenAddress, limit);
      }
    } catch (error) {
      console.error(`[MultiChain] Error getting top holders:`, error);
      return [];
    }
  }

  private async getSolanaTopHolders(tokenAddress: string, limit: number): Promise<TokenHolder[]> {
    try {
      const response = await axios.post(CHAIN_CONFIGS.solana.rpcUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenLargestAccounts',
        params: [tokenAddress],
      });

      const accounts = response.data?.result?.value || [];
      const totalSupply = accounts.reduce((sum: number, acc: any) => 
        sum + parseFloat(acc.uiAmountString || '0'), 0);

      return accounts.slice(0, limit).map((acc: any) => ({
        address: acc.address,
        balance: acc.uiAmountString || '0',
        percentage: totalSupply > 0 
          ? (parseFloat(acc.uiAmountString || '0') / totalSupply) * 100 
          : 0,
      }));
    } catch (error) {
      return [];
    }
  }

  private async getEvmTopHolders(chain: ChainId, tokenAddress: string, limit: number): Promise<TokenHolder[]> {
    return [];
  }

  async getLiquidityInfo(chain: ChainId, tokenAddress: string): Promise<LiquidityInfo[]> {
    try {
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
      );

      const pairs = response.data?.pairs || [];
      const config = CHAIN_CONFIGS[chain];
      const chainPairs = pairs.filter((p: any) => p.chainId === config.dexScreenerChainId);

      return chainPairs.map((pair: any) => ({
        pairAddress: pair.pairAddress,
        dexName: pair.dexId,
        token0: pair.baseToken?.address || '',
        token1: pair.quoteToken?.address || '',
        reserve0: '0',
        reserve1: '0',
        liquidityUsd: pair.liquidity?.usd || 0,
      }));
    } catch (error) {
      return [];
    }
  }

  async discoverNewTokens(chain: ChainId, maxAge: number = 60): Promise<TokenInfo[]> {
    try {
      const response = await axios.get(
        `https://api.dexscreener.com/token-profiles/latest/v1`
      );

      const tokens = response.data || [];
      const config = CHAIN_CONFIGS[chain];

      return tokens
        .filter((t: any) => t.chainId === config.dexScreenerChainId)
        .slice(0, 20)
        .map((t: any) => ({
          address: t.tokenAddress,
          symbol: t.symbol || 'UNKNOWN',
          name: t.name || 'Unknown',
          decimals: 18,
          totalSupply: '0',
          chain,
          logoUrl: t.icon,
        }));
    } catch (error) {
      console.error(`[MultiChain] Error discovering tokens on ${chain}:`, error);
      return [];
    }
  }

  async getNativeBalance(chain: ChainId, address: string): Promise<string> {
    const config = CHAIN_CONFIGS[chain];

    try {
      if (!config.isEvm) {
        const pubkey = new PublicKey(address);
        const balance = await this.solanaConnection.getBalance(pubkey);
        return (balance / Math.pow(10, config.nativeTokenDecimals)).toString();
      } else {
        const provider = this.evmProviders.get(chain)!;
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
      }
    } catch (error) {
      return '0';
    }
  }

  async getTokenBalance(chain: ChainId, tokenAddress: string, walletAddress: string): Promise<string> {
    const config = CHAIN_CONFIGS[chain];

    try {
      if (!config.isEvm) {
        const response = await axios.post(CHAIN_CONFIGS.solana.rpcUrl, {
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            walletAddress,
            { mint: tokenAddress },
            { encoding: 'jsonParsed' },
          ],
        });

        const accounts = response.data?.result?.value || [];
        if (accounts.length === 0) return '0';

        return accounts[0].account.data.parsed.info.tokenAmount.uiAmountString || '0';
      } else {
        const provider = this.evmProviders.get(chain)!;
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = await contract.balanceOf(walletAddress);
        const decimals = await contract.decimals();
        return ethers.formatUnits(balance, decimals);
      }
    } catch (error) {
      return '0';
    }
  }
}

export const multiChainProvider = new MultiChainProvider();
