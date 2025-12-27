import axios from 'axios';
import { 
  TokenSafetyMetrics, 
  TokenMovementMetrics, 
  DiscoveredToken, 
  SnipePresetConfig 
} from './sniperBotService';
import { tokenAuthorityService } from './tokenAuthorityService';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const PUBLIC_SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const HELIUS_RPC = HELIUS_API_KEY 
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}` 
  : PUBLIC_SOLANA_RPC;

// DEX API endpoints
const DEX_APIS = {
  dexscreener: 'https://api.dexscreener.com/latest/dex',
  jupiter: 'https://quote-api.jup.ag/v6',
  birdeye: 'https://public-api.birdeye.so',
};

interface DexScreenerToken {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  priceNative: string;
  liquidity: { usd: number };
  fdv: number;
  volume: { h24: number; h1: number; m5: number };
  priceChange: { h24: number; h1: number; m5: number };
  txns: { 
    h24: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    m5: { buys: number; sells: number };
  };
  pairCreatedAt: number;
}

interface TokenHolderData {
  totalHolders: number;
  top10Percent: number;
  botPercent: number;
}

class TokenScannerService {
  // ============================================
  // TOKEN DISCOVERY
  // ============================================

  async discoverTokens(config: SnipePresetConfig): Promise<DiscoveredToken[]> {
    try {
      // Fetch new tokens from DexScreener
      const response = await axios.get(`${DEX_APIS.dexscreener}/tokens/solana`, {
        timeout: 10000,
      });
      
      if (!response.data?.pairs) {
        console.log('[TokenScanner] No pairs found from DexScreener');
        return [];
      }

      const pairs: DexScreenerToken[] = response.data.pairs;
      const now = Date.now();
      
      // Filter and analyze tokens
      const discoveredTokens: DiscoveredToken[] = [];
      
      for (const pair of pairs.slice(0, 100)) { // Limit to 100 for performance
        try {
          const ageMinutes = (now - pair.pairCreatedAt) / (1000 * 60);
          
          // Apply discovery filters
          if (ageMinutes < config.discoveryFilters.minTokenAgeMinutes) continue;
          if (ageMinutes > config.discoveryFilters.maxTokenAgeMinutes) continue;
          
          // Check liquidity
          if ((pair.liquidity?.usd || 0) < config.safetyFilters.minLiquidityUsd) continue;
          
          // Check DEX is enabled
          if (!config.dexPreferences.enabledDexes.includes(pair.dexId)) continue;
          
          // Calculate movement metrics
          const movementMetrics = this.calculateMovementMetrics(pair, config);
          
          // Apply movement filters
          if (!this.passesMovementFilters(movementMetrics, config)) continue;
          
          // Fetch safety metrics (rate limited)
          const safetyMetrics = await this.analyzeSafetyMetrics(pair.baseToken.address);
          
          // Apply safety filters
          if (!this.passesSafetyFilters(safetyMetrics, config)) continue;
          
          // Calculate AI score
          const aiAnalysis = this.calculateAIScore(safetyMetrics, movementMetrics);
          
          discoveredTokens.push({
            address: pair.baseToken.address,
            symbol: pair.baseToken.symbol,
            name: pair.baseToken.name,
            dex: pair.dexId,
            priceUsd: parseFloat(pair.priceUsd || '0'),
            priceSol: parseFloat(pair.priceNative || '0'),
            marketCapUsd: pair.fdv || 0,
            liquidityUsd: pair.liquidity?.usd || 0,
            ageMinutes,
            safetyMetrics,
            movementMetrics,
            aiScore: aiAnalysis.score,
            aiRecommendation: aiAnalysis.recommendation,
            aiReasoning: aiAnalysis.reasoning,
          });
        } catch (err) {
          // Skip tokens that fail analysis
          continue;
        }
      }
      
      // Sort by AI score (best first)
      discoveredTokens.sort((a, b) => b.aiScore - a.aiScore);
      
      return discoveredTokens.slice(0, 20); // Return top 20
    } catch (error) {
      console.error('[TokenScanner] Discovery error:', error);
      return [];
    }
  }

  async getNewPumpFunTokens(limit = 50): Promise<any[]> {
    try {
      // Pump.fun doesn't have a public API, so we use DexScreener filtered
      const response = await axios.get(`${DEX_APIS.dexscreener}/search?q=pumpfun`, {
        timeout: 10000,
      });
      
      if (!response.data?.pairs) return [];
      
      return response.data.pairs
        .filter((p: any) => p.dexId === 'pumpfun' || p.dexId === 'raydium')
        .slice(0, limit);
    } catch (error) {
      console.error('[TokenScanner] Pump.fun fetch error:', error);
      return [];
    }
  }

  async getTokenDetails(tokenAddress: string): Promise<DexScreenerToken | null> {
    try {
      const response = await axios.get(
        `${DEX_APIS.dexscreener}/tokens/${tokenAddress}`,
        { timeout: 10000 }
      );
      
      const pairs = response.data?.pairs;
      if (!pairs || pairs.length === 0) return null;
      
      // Return the pair with highest liquidity
      return pairs.sort((a: any, b: any) => 
        (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
      )[0];
    } catch (error) {
      console.error('[TokenScanner] Token details error:', error);
      return null;
    }
  }

  // ============================================
  // SAFETY ANALYSIS
  // ============================================

  async analyzeSafetyMetrics(tokenAddress: string, pairAddress?: string): Promise<TokenSafetyMetrics & {
    mintAuthorityActive: boolean;
    freezeAuthorityActive: boolean;
    isHoneypot: boolean;
    liquidityLocked: boolean;
    isPumpFun: boolean;
    allRisks: string[];
  }> {
    try {
      const [holderData, creatorRisky, comprehensiveSafety] = await Promise.all([
        this.getHolderDistribution(tokenAddress),
        this.checkCreatorWallet(tokenAddress),
        tokenAuthorityService.getComprehensiveSafetyCheck(tokenAddress, pairAddress)
      ]);
      
      return {
        botPercent: holderData.botPercent,
        bundlePercent: 0,
        top10HoldersPercent: holderData.top10Percent,
        liquidityUsd: 0,
        holderCount: holderData.totalHolders,
        creatorWalletRisky: creatorRisky,
        mintAuthorityActive: comprehensiveSafety.authorities.authorities.mintAuthority !== null,
        freezeAuthorityActive: comprehensiveSafety.authorities.authorities.freezeAuthority !== null,
        isHoneypot: comprehensiveSafety.honeypot.isHoneypot,
        liquidityLocked: comprehensiveSafety.liquidity.isLocked || comprehensiveSafety.liquidity.isBurned,
        isPumpFun: comprehensiveSafety.authorities.isPumpFun,
        allRisks: comprehensiveSafety.allRisks,
      };
    } catch (error) {
      console.error('[TokenScanner] Safety analysis error:', error);
      return {
        botPercent: 50,
        bundlePercent: 50,
        top10HoldersPercent: 50,
        liquidityUsd: 0,
        holderCount: 0,
        creatorWalletRisky: true,
        mintAuthorityActive: true,
        freezeAuthorityActive: true,
        isHoneypot: true,
        liquidityLocked: false,
        isPumpFun: false,
        allRisks: ['Safety analysis failed - blocking trade'],
      };
    }
  }

  async getHolderDistribution(tokenAddress: string): Promise<TokenHolderData> {
    try {
      if (!HELIUS_API_KEY) {
        return { totalHolders: 100, top10Percent: 50, botPercent: 30 };
      }

      // Use Helius DAS API to get token accounts
      const response = await axios.post(
        HELIUS_RPC,
        {
          jsonrpc: '2.0',
          id: 'holder-check',
          method: 'getTokenAccounts',
          params: {
            mint: tokenAddress,
            limit: 100,
          },
        },
        { timeout: 10000 }
      );
      
      const accounts = response.data?.result?.token_accounts || [];
      const totalHolders = accounts.length;
      
      if (totalHolders === 0) {
        return { totalHolders: 0, top10Percent: 100, botPercent: 100 };
      }
      
      // Calculate top 10 holder concentration
      const sorted = accounts.sort((a: any, b: any) => 
        parseFloat(b.amount) - parseFloat(a.amount)
      );
      
      const totalSupply = accounts.reduce((sum: number, a: any) => 
        sum + parseFloat(a.amount), 0
      );
      
      const top10Supply = sorted.slice(0, 10).reduce((sum: number, a: any) => 
        sum + parseFloat(a.amount), 0
      );
      
      const top10Percent = (top10Supply / totalSupply) * 100;
      
      // Estimate bot percentage (simplified - would need more sophisticated analysis)
      const botPercent = this.estimateBotPercent(accounts);
      
      return { totalHolders, top10Percent, botPercent };
    } catch (error) {
      console.error('[TokenScanner] Holder distribution error:', error);
      return { totalHolders: 100, top10Percent: 50, botPercent: 30 };
    }
  }

  private estimateBotPercent(accounts: any[]): number {
    // Simplified bot detection heuristics:
    // - Accounts created in quick succession
    // - Small, uniform amounts
    // - Known bot wallet patterns
    
    // This is a placeholder - real implementation would be more sophisticated
    return 20; // Default estimate
  }

  async checkCreatorWallet(tokenAddress: string): Promise<boolean> {
    try {
      if (!HELIUS_API_KEY) return false;

      // Get token metadata to find creator
      const response = await axios.post(
        HELIUS_RPC,
        {
          jsonrpc: '2.0',
          id: 'creator-check',
          method: 'getAsset',
          params: { id: tokenAddress },
        },
        { timeout: 10000 }
      );
      
      const asset = response.data?.result;
      if (!asset?.creators?.[0]?.address) return false;
      
      const creatorAddress = asset.creators[0].address;
      
      // Check creator's transaction history for rug patterns
      // (multiple failed projects, quick sells, etc.)
      // This is simplified - real implementation would check:
      // 1. How many tokens they've created
      // 2. Performance of previous tokens
      // 3. Sell patterns
      
      return false; // Assume not risky by default
    } catch (error) {
      return false;
    }
  }

  // ============================================
  // MOVEMENT ANALYSIS
  // ============================================

  calculateMovementMetrics(pair: DexScreenerToken, config: SnipePresetConfig): TokenMovementMetrics {
    const timeframe = config.movementFilters.movementTimeframeMinutes;
    
    // Use appropriate timeframe for price change
    let priceChange = 0;
    let txns = { buys: 0, sells: 0 };
    let volume = 0;
    
    if (timeframe <= 5) {
      priceChange = pair.priceChange?.m5 || 0;
      txns = pair.txns?.m5 || { buys: 0, sells: 0 };
      volume = pair.volume?.m5 || 0;
    } else if (timeframe <= 60) {
      priceChange = pair.priceChange?.h1 || 0;
      txns = pair.txns?.h1 || { buys: 0, sells: 0 };
      volume = pair.volume?.h1 || 0;
    } else {
      priceChange = pair.priceChange?.h24 || 0;
      txns = pair.txns?.h24 || { buys: 0, sells: 0 };
      volume = pair.volume?.h24 || 0;
    }
    
    // Calculate volume multiplier (compare current to average)
    const avgVolume = (pair.volume?.h24 || 0) / 24;
    const currentHourVolume = pair.volume?.h1 || 0;
    const volumeMultiplier = avgVolume > 0 ? currentHourVolume / avgVolume : 1;
    
    // Trades per minute
    const tradesPerMinute = ((txns.buys + txns.sells) / timeframe) || 0;
    
    // Buy/sell ratio
    const buySellRatio = txns.sells > 0 ? txns.buys / txns.sells : txns.buys > 0 ? 10 : 1;
    
    return {
      priceChangePercent: priceChange,
      volumeMultiplier,
      tradesPerMinute,
      buySellRatio,
      holderGrowthPercent: 0, // Would need historical data
    };
  }

  passesMovementFilters(metrics: TokenMovementMetrics, config: SnipePresetConfig): boolean {
    const { movementFilters } = config;
    
    if (metrics.priceChangePercent < movementFilters.minPriceChangePercent) return false;
    if (metrics.volumeMultiplier < movementFilters.minVolumeMultiplier) return false;
    if (metrics.tradesPerMinute < movementFilters.minTradesPerMinute) return false;
    if (metrics.buySellRatio < movementFilters.minBuySellRatio) return false;
    
    return true;
  }

  passesSafetyFilters(metrics: TokenSafetyMetrics, config: SnipePresetConfig): boolean {
    const { safetyFilters } = config;
    
    if (metrics.botPercent > safetyFilters.maxBotPercent) return false;
    if (metrics.bundlePercent > safetyFilters.maxBundlePercent) return false;
    if (metrics.top10HoldersPercent > safetyFilters.maxTop10HoldersPercent) return false;
    if (safetyFilters.checkCreatorWallet && metrics.creatorWalletRisky) return false;
    
    return true;
  }

  // ============================================
  // AI SCORING
  // ============================================

  calculateAIScore(
    safety: TokenSafetyMetrics, 
    movement: TokenMovementMetrics
  ): { score: number; recommendation: 'snipe' | 'watch' | 'avoid'; reasoning: string } {
    let score = 50; // Start neutral
    const reasons: string[] = [];
    
    // Safety scoring (up to +/-25 points)
    if (safety.botPercent < 20) { score += 10; reasons.push('Low bot activity'); }
    else if (safety.botPercent > 60) { score -= 15; reasons.push('High bot activity'); }
    
    if (safety.top10HoldersPercent < 40) { score += 10; reasons.push('Well distributed'); }
    else if (safety.top10HoldersPercent > 70) { score -= 15; reasons.push('Concentrated holdings'); }
    
    if (safety.holderCount > 100) { score += 5; reasons.push('Good holder count'); }
    if (safety.creatorWalletRisky) { score -= 20; reasons.push('Risky creator wallet'); }
    
    // Movement scoring (up to +/-25 points)
    if (movement.priceChangePercent > 10) { score += 15; reasons.push('Strong momentum'); }
    else if (movement.priceChangePercent > 3) { score += 8; reasons.push('Good momentum'); }
    else if (movement.priceChangePercent < 0) { score -= 10; reasons.push('Negative momentum'); }
    
    if (movement.volumeMultiplier > 5) { score += 10; reasons.push('Volume spike'); }
    else if (movement.volumeMultiplier > 2) { score += 5; reasons.push('Elevated volume'); }
    
    if (movement.buySellRatio > 2) { score += 10; reasons.push('Strong buying pressure'); }
    else if (movement.buySellRatio > 1.5) { score += 5; reasons.push('More buyers than sellers'); }
    else if (movement.buySellRatio < 0.8) { score -= 10; reasons.push('Sell pressure'); }
    
    // Clamp score
    score = Math.max(0, Math.min(100, score));
    
    // Determine recommendation
    let recommendation: 'snipe' | 'watch' | 'avoid';
    if (score >= 70) {
      recommendation = 'snipe';
    } else if (score >= 45) {
      recommendation = 'watch';
    } else {
      recommendation = 'avoid';
    }
    
    return {
      score,
      recommendation,
      reasoning: reasons.join('. ') || 'Standard metrics',
    };
  }
}

export const tokenScannerService = new TokenScannerService();
