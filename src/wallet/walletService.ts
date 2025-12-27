import { initWasm, TW } from '@trustwallet/wallet-core';
import { Connection, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction, Keypair } from '@solana/web3.js';
import { ethers } from 'ethers';
import bs58 from 'bs58';
import crypto from 'crypto';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const PUBLIC_SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const SOLANA_RPC = HELIUS_API_KEY 
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}` 
  : PUBLIC_SOLANA_RPC;

interface ChainConfig {
  id: string;
  name: string;
  symbol: string;
  coinType: number;
  rpcUrl: string;
  chainId?: number;
  explorer: string;
  logo?: string;
}

interface WalletAccount {
  chain: string;
  address: string;
  path: string;
}

interface WalletData {
  id: string;
  createdAt: Date;
  accounts: WalletAccount[];
  encryptedMnemonic?: string;
}

interface BalanceInfo {
  balance: string;
  usd: number;
  symbol: string;
}

const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  solana: {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    coinType: 501,
    rpcUrl: SOLANA_RPC,
    explorer: 'https://solscan.io'
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    coinType: 60,
    rpcUrl: 'https://eth.llamarpc.com',
    chainId: 1,
    explorer: 'https://etherscan.io'
  },
  base: {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    coinType: 60,
    rpcUrl: 'https://mainnet.base.org',
    chainId: 8453,
    explorer: 'https://basescan.org'
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    coinType: 60,
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137,
    explorer: 'https://polygonscan.com'
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    coinType: 60,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    explorer: 'https://arbiscan.io'
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Chain',
    symbol: 'BNB',
    coinType: 60,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    chainId: 56,
    explorer: 'https://bscscan.com'
  }
};

class MultiChainWalletService {
  private solanaConnection: Connection;
  private evmProviders: Map<string, ethers.JsonRpcProvider> = new Map();
  private walletCore: any = null;
  private initialized: boolean = false;
  
  constructor() {
    this.solanaConnection = new Connection(SOLANA_RPC, 'confirmed');
    
    for (const [chain, config] of Object.entries(SUPPORTED_CHAINS)) {
      if (chain !== 'solana' && config.rpcUrl) {
        this.evmProviders.set(chain, new ethers.JsonRpcProvider(config.rpcUrl));
      }
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      this.walletCore = await initWasm();
      this.initialized = true;
      console.log('[Wallet] Trust Wallet Core initialized');
    } catch (error) {
      console.error('[Wallet] Failed to initialize Trust Wallet Core:', error);
    }
  }

  generateMnemonic(wordCount: 12 | 24 = 12): string {
    const entropyBytes = wordCount === 12 ? 16 : 32;
    const entropy = crypto.randomBytes(entropyBytes);
    const mnemonic = ethers.Mnemonic.fromEntropy(entropy);
    return mnemonic.phrase;
  }

  validateMnemonic(mnemonic: string): boolean {
    try {
      ethers.Mnemonic.fromPhrase(mnemonic.trim());
      return true;
    } catch {
      return false;
    }
  }

  encryptMnemonic(mnemonic: string, password: string): string {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(mnemonic, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return Buffer.concat([salt, iv, authTag, Buffer.from(encrypted, 'hex')]).toString('base64');
  }

  decryptMnemonic(encryptedData: string, password: string): string {
    try {
      const data = Buffer.from(encryptedData, 'base64');
      const salt = data.subarray(0, 16);
      const iv = data.subarray(16, 32);
      const authTag = data.subarray(32, 48);
      const encrypted = data.subarray(48);
      
      const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error('Invalid password or corrupted data');
    }
  }

  deriveAddresses(mnemonic: string): WalletAccount[] {
    const accounts: WalletAccount[] = [];
    const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
    
    for (const [chainId, config] of Object.entries(SUPPORTED_CHAINS)) {
      if (chainId === 'solana') {
        const solanaAccount = this.deriveSolanaAddress(mnemonic);
        accounts.push(solanaAccount);
      } else {
        const evmPath = `m/44'/${config.coinType}'/0'/0/0`;
        const evmNode = hdNode.derivePath(evmPath);
        
        accounts.push({
          chain: chainId,
          address: evmNode.address,
          path: evmPath
        });
      }
    }
    
    return accounts;
  }

  private deriveSolanaAddress(mnemonic: string): WalletAccount {
    const { mnemonicToSeedSync } = require('bip39');
    const { derivePath } = require('ed25519-hd-key');
    
    const seed = mnemonicToSeedSync(mnemonic);
    const path = "m/44'/501'/0'/0'";
    const { key } = derivePath(path, seed.toString('hex'));
    const keypair = Keypair.fromSeed(key);
    
    return {
      chain: 'solana',
      address: keypair.publicKey.toBase58(),
      path
    };
  }

  getPrivateKey(mnemonic: string, chain: string): string {
    const config = SUPPORTED_CHAINS[chain];
    
    if (chain === 'solana') {
      const { mnemonicToSeedSync } = require('bip39');
      const { derivePath } = require('ed25519-hd-key');
      
      const seed = mnemonicToSeedSync(mnemonic);
      const path = "m/44'/501'/0'/0'";
      const { key } = derivePath(path, seed.toString('hex'));
      const keypair = Keypair.fromSeed(key);
      return bs58.encode(keypair.secretKey);
    } else {
      const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
      const evmPath = `m/44'/${config.coinType}'/0'/0/0`;
      const evmNode = hdNode.derivePath(evmPath);
      return evmNode.privateKey;
    }
  }

  async getBalance(chain: string, address: string): Promise<BalanceInfo> {
    const config = SUPPORTED_CHAINS[chain];
    if (!config) {
      return { balance: '0', usd: 0, symbol: 'UNKNOWN' };
    }

    try {
      if (chain === 'solana') {
        const pubkey = new PublicKey(address);
        const lamports = await this.solanaConnection.getBalance(pubkey);
        const solBalance = lamports / LAMPORTS_PER_SOL;
        
        let solPrice = 0;
        try {
          const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
          const priceData = await priceResponse.json();
          solPrice = priceData.solana?.usd || 0;
        } catch {}
        
        return {
          balance: solBalance.toFixed(6),
          usd: solBalance * solPrice,
          symbol: 'SOL'
        };
      } else {
        const provider = this.evmProviders.get(chain);
        if (!provider) throw new Error(`No provider for chain: ${chain}`);
        
        const balanceWei = await provider.getBalance(address);
        const balanceEth = parseFloat(ethers.formatEther(balanceWei));
        
        let coinId = 'ethereum';
        if (chain === 'polygon') coinId = 'matic-network';
        if (chain === 'bsc') coinId = 'binancecoin';
        
        let price = 0;
        try {
          const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
          const priceData = await priceResponse.json();
          price = priceData[coinId]?.usd || 0;
        } catch {}
        
        return {
          balance: balanceEth.toFixed(6),
          usd: balanceEth * price,
          symbol: config.symbol
        };
      }
    } catch (error) {
      console.error(`[Wallet] Balance check error for ${chain}:`, error);
      return { balance: '0', usd: 0, symbol: config.symbol };
    }
  }

  async getAllBalances(accounts: WalletAccount[]): Promise<Record<string, BalanceInfo>> {
    const balances: Record<string, BalanceInfo> = {};
    
    await Promise.all(
      accounts.map(async (account) => {
        balances[account.chain] = await this.getBalance(account.chain, account.address);
      })
    );
    
    return balances;
  }

  async getTotalPortfolioValue(accounts: WalletAccount[]): Promise<number> {
    const balances = await this.getAllBalances(accounts);
    return Object.values(balances).reduce((total, b) => total + b.usd, 0);
  }

  async estimateGas(chain: string, from: string, to: string, amount: string): Promise<{
    gasLimit: string;
    gasPrice: string;
    estimatedFee: string;
    estimatedFeeUsd: number;
  }> {
    if (chain === 'solana') {
      return {
        gasLimit: '1',
        gasPrice: '5000',
        estimatedFee: '0.000005',
        estimatedFeeUsd: 0.001
      };
    }
    
    const provider = this.evmProviders.get(chain);
    if (!provider) throw new Error(`No provider for chain: ${chain}`);
    
    try {
      const feeData = await provider.getFeeData();
      const gasLimit = await provider.estimateGas({
        from,
        to,
        value: ethers.parseEther(amount)
      });
      
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      const estimatedFee = ethers.formatEther(gasLimit * gasPrice);
      
      let ethPrice = 2000;
      try {
        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const priceData = await priceResponse.json();
        ethPrice = priceData.ethereum?.usd || 2000;
      } catch {}
      
      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        estimatedFee,
        estimatedFeeUsd: parseFloat(estimatedFee) * ethPrice
      };
    } catch (error: any) {
      return {
        gasLimit: '21000',
        gasPrice: '20',
        estimatedFee: '0.00042',
        estimatedFeeUsd: 1.00
      };
    }
  }

  async sendTransaction(
    chain: string,
    mnemonic: string,
    to: string,
    amount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string; explorerUrl?: string }> {
    try {
      const config = SUPPORTED_CHAINS[chain];
      if (!config) throw new Error(`Unsupported chain: ${chain}`);

      if (chain === 'solana') {
        const privateKeyBs58 = this.getPrivateKey(mnemonic, 'solana');
        const keypair = Keypair.fromSecretKey(bs58.decode(privateKeyBs58));
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: new PublicKey(to),
            lamports: Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL)
          })
        );
        
        const { blockhash } = await this.solanaConnection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = keypair.publicKey;
        
        const signature = await this.solanaConnection.sendTransaction(transaction, [keypair]);
        await this.solanaConnection.confirmTransaction(signature);
        
        return { 
          success: true, 
          txHash: signature,
          explorerUrl: `${config.explorer}/tx/${signature}`
        };
      } else {
        const provider = this.evmProviders.get(chain);
        if (!provider) throw new Error(`No provider for chain: ${chain}`);
        
        const privateKey = this.getPrivateKey(mnemonic, chain);
        const wallet = new ethers.Wallet(privateKey, provider);
        
        const tx = await wallet.sendTransaction({
          to,
          value: ethers.parseEther(amount)
        });
        
        await tx.wait();
        
        return { 
          success: true, 
          txHash: tx.hash,
          explorerUrl: `${config.explorer}/tx/${tx.hash}`
        };
      }
    } catch (error: any) {
      console.error(`[Wallet] Send transaction error:`, error);
      return { success: false, error: error.message };
    }
  }

  async sendWithPrivateKey(
    chain: string,
    privateKey: string,
    to: string,
    amount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string; explorerUrl?: string }> {
    try {
      const config = SUPPORTED_CHAINS[chain];
      if (!config) throw new Error(`Unsupported chain: ${chain}`);

      if (chain === 'solana') {
        const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: new PublicKey(to),
            lamports: Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL)
          })
        );
        
        const { blockhash } = await this.solanaConnection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = keypair.publicKey;
        
        const signature = await this.solanaConnection.sendTransaction(transaction, [keypair]);
        await this.solanaConnection.confirmTransaction(signature);
        
        return { 
          success: true, 
          txHash: signature,
          explorerUrl: `${config.explorer}/tx/${signature}`
        };
      } else {
        const provider = this.evmProviders.get(chain);
        if (!provider) throw new Error(`No provider for chain: ${chain}`);
        
        const wallet = new ethers.Wallet(privateKey, provider);
        
        const tx = await wallet.sendTransaction({
          to,
          value: ethers.parseEther(amount)
        });
        
        await tx.wait();
        
        return { 
          success: true, 
          txHash: tx.hash,
          explorerUrl: `${config.explorer}/tx/${tx.hash}`
        };
      }
    } catch (error: any) {
      console.error(`[Wallet] Send with private key error:`, error);
      return { success: false, error: error.message };
    }
  }

  getSupportedChains(): ChainConfig[] {
    return Object.values(SUPPORTED_CHAINS);
  }

  getChainConfig(chain: string): ChainConfig | undefined {
    return SUPPORTED_CHAINS[chain];
  }

  createWalletId(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}

export const walletService = new MultiChainWalletService();
export { SUPPORTED_CHAINS, WalletAccount, WalletData, ChainConfig, BalanceInfo };
