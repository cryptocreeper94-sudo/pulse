import { createStep, createWorkflow } from "../inngest";
import { z } from "zod";
import { marketDataTool } from "../tools/marketDataTool";
import { technicalAnalysisTool } from "../tools/technicalAnalysisTool";
import { scannerTool } from "../tools/scannerTool";
import { holdingsTool } from "../tools/holdingsTool";
import { dexscreenerTool } from "../tools/dexscreenerTool";
import { dexAnalysisTool } from "../tools/dexAnalysisTool";
import { preferencesTool } from "../tools/preferencesTool";

/**
 * DarkWave-V2 Workflow - NO AI, NO WALLET (disabled to prevent issues)
 * Budget-friendly: Free APIs only, no OpenAI
 */

const processMessage = createStep({
  id: "process-telegram-message",
  description: "Processes commands without AI - simple pattern matching",

  inputSchema: z.object({
    message: z.string(),
    userId: z.string().optional(),
  }),

  outputSchema: z.object({
    response: z.string(),
    success: z.boolean(),
  }),

  execute: async ({ inputData, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    const msg = inputData.message.trim().toUpperCase();
    const userId = inputData.userId || "default-user";

    logger?.info('🚀 [DarkWaveWorkflow] Processing command', { message: msg, userId });

    try {
      // HELP / COMMANDS - Show available commands
      if (msg === "HELP" || msg === "COMMANDS" || msg === "START") {
        return {
          response: "🤖 *DarkWave-V2 Commands*\n\n" +
            "*📊 Analysis:*\n" +
            "• Send any ticker (BTC, ETH, XVG, MXC, AAPL, TSLA, etc.)\n" +
            "• Get full technical analysis with RSI, MACD, EMAs, Bollinger Bands\n\n" +
            "*🔍 Market Scan:*\n" +
            "• SCAN or CRYPTO - Top 10 cryptos with buy signals\n\n" +
            "*📋 Watchlist (Holdings):*\n" +
            "• ADD [ticker] or HOLD [ticker] - Add to watchlist\n" +
            "• REMOVE [ticker] - Remove from watchlist\n" +
            "• LIST or HOLDINGS - View your watchlist\n" +
            "• CLEAR - Clear entire watchlist\n\n" +
            "*⚙️ Settings:*\n" +
            "• SET LINKS DEFAULT - Links to CoinGecko/Yahoo Finance\n" +
            "• SET LINKS KRAKEN - Links to Kraken.com\n\n" +
            "*⚠️ Note:*\n" +
            "• Wallet features are permanently disabled\n" +
            "• All analysis uses FREE APIs only\n" +
            "• DEX pairs always link to Dexscreener",
          success: true
        };
      }

      // WALLET FEATURE PERMANENTLY DISABLED - technical limitation causing charges
      if (msg === "WALLET" || msg === "BALANCE" || msg.startsWith("WITHDRAW")) {
        return {
          response: "⚠️ *Wallet feature disabled permanently*\n\nThis feature has a technical bug that created multiple wallets and charged you over $400. I've stopped all servers to prevent further charges.\n\n*Your existing wallet with funds:*\n6vexNEjjuygFqvQehKyDBNCZ4WRRo7G5BmoZmG8x3bR1\n\n*Next steps:*\n1. Contact Replit support for a refund\n2. Use your Phantom wallet directly\n3. Technical analysis (BTC, ETH, SCAN) still works",
          success: true
        };
      }

      // HOLDINGS - ADD ticker to watchlist
      if (msg.startsWith("ADD ") || msg.startsWith("HOLD ")) {
        const ticker = msg.replace(/^(ADD|HOLD)\s+/, '').trim();
        if (ticker) {
          const result = await holdingsTool.execute({
            context: { action: 'add', ticker, userId },
            mastra,
            runtimeContext: undefined as any
          });
          return {
            response: `✅ ${result.message}\n\n*Your watchlist (${result.holdings.length}):*\n${result.holdings.join(', ')}`,
            success: true
          };
        }
      }

      // HOLDINGS - REMOVE ticker from watchlist
      if (msg.startsWith("REMOVE ")) {
        const ticker = msg.replace(/^REMOVE\s+/, '').trim();
        if (ticker) {
          const result = await holdingsTool.execute({
            context: { action: 'remove', ticker, userId },
            mastra,
            runtimeContext: undefined as any
          });
          return {
            response: `✅ ${result.message}\n\n*Your watchlist (${result.holdings.length}):*\n${result.holdings.length > 0 ? result.holdings.join(', ') : 'Empty'}`,
            success: true
          };
        }
      }

      // HOLDINGS - LIST watchlist with full analysis
      if (msg === "LIST" || msg === "HOLDINGS" || msg === "WATCHLIST") {
        const result = await holdingsTool.execute({
          context: { action: 'list', userId },
          mastra,
          runtimeContext: undefined as any
        });

        if (result.holdings.length === 0) {
          return {
            response: "📋 *Your watchlist is empty*\n\nAdd tickers with:\n• ADD BTC\n• HOLD ETH",
            success: true
          };
        }

        // Analyze each holding
        let response = `📋 *Your Watchlist (${result.holdings.length} tickers)*\n\n`;
        
        for (const ticker of result.holdings.slice(0, 5)) {
          try {
            const marketData = await marketDataTool.execute({
              context: { ticker, days: 90 },
              mastra,
              runtimeContext: undefined as any
            });

            const analysis = await technicalAnalysisTool.execute({
              context: {
                ticker: marketData.ticker,
                currentPrice: marketData.currentPrice,
                priceChange24h: marketData.priceChange24h,
                priceChangePercent24h: marketData.priceChangePercent24h,
                volume24h: marketData.volume24h,
                prices: marketData.prices,
              },
              mastra,
              runtimeContext: undefined as any
            });

            let emoji = "🟡";
            if (analysis.recommendation === "BUY" || analysis.recommendation === "STRONG_BUY") emoji = "🟢";
            if (analysis.recommendation === "SELL" || analysis.recommendation === "STRONG_SELL") emoji = "🔴";

            response += `${emoji} *${ticker}* - $${analysis.currentPrice?.toFixed(4)} (${analysis.priceChange24h >= 0 ? '+' : ''}${analysis.priceChange24h?.toFixed(2)}%)\n`;
            response += `   ${analysis.recommendation} | RSI: ${analysis.rsi?.toFixed(1)}\n\n`;
          } catch (error) {
            response += `⚠️ *${ticker}* - Error fetching data\n\n`;
          }
        }

        if (result.holdings.length > 5) {
          response += `\n_Showing 5 of ${result.holdings.length} holdings_`;
        }

        return { response, success: true };
      }

      // HOLDINGS - CLEAR watchlist
      if (msg === "CLEAR" || msg === "CLEAR HOLDINGS") {
        const result = await holdingsTool.execute({
          context: { action: 'clear', userId },
          mastra,
          runtimeContext: undefined as any
        });
        return {
          response: `✅ ${result.message}`,
          success: true
        };
      }

      // SETTINGS - SET LINKS preference
      if (msg === "SET LINKS DEFAULT" || msg === "SET LINKS KRAKEN") {
        const preference = msg.includes("KRAKEN") ? 'kraken' : 'default';
        const result = await preferencesTool.execute({
          context: { action: 'set', linkPreference: preference, userId },
          mastra,
          runtimeContext: undefined as any
        });
        return {
          response: result.message,
          success: true
        };
      }

      // SCAN command - LIMITED TO 10 TICKERS
      if (msg === "SCAN" || msg === "CRYPTO") {
        // Get user's link preference
        const prefResult = await preferencesTool.execute({
          context: { action: 'get', userId },
          mastra,
          runtimeContext: undefined as any
        });
        const linkPref = prefResult.linkPreference;

        const result = await scannerTool.execute({ 
          context: { type: "crypto", limit: 10 },
          mastra, 
          runtimeContext: undefined as any
        });
        
        if (result.strongBuys.length === 0) {
          return {
            response: "⚠️ No strong buy signals found in top 10 cryptos. Try again later.",
            success: true
          };
        }

        // CoinGecko ID mapping for top cryptos
        const coinGeckoMap: Record<string, string> = {
          'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'BNB': 'binancecoin', 
          'XRP': 'ripple', 'ADA': 'cardano', 'DOGE': 'dogecoin', 'AVAX': 'avalanche-2', 
          'LINK': 'chainlink', 'MATIC': 'matic-network', 'DOT': 'polkadot', 'UNI': 'uniswap',
          'ATOM': 'cosmos', 'LTC': 'litecoin', 'BCH': 'bitcoin-cash', 'NEAR': 'near',
          'APT': 'aptos', 'ARB': 'arbitrum', 'OP': 'optimism', 'SUI': 'sui',
          'FIL': 'filecoin', 'ICP': 'internet-computer', 'VET': 'vechain', 'ALGO': 'algorand',
          'SAND': 'the-sandbox', 'MANA': 'decentraland', 'AXS': 'axie-infinity', 'FTM': 'fantom',
          'AAVE': 'aave', 'GRT': 'the-graph', 'SNX': 'havven', 'AR': 'arweave',
          'HBAR': 'hedera-hashgraph', 'XLM': 'stellar', 'TRX': 'tron', 'ETC': 'ethereum-classic',
          'XMR': 'monero', 'TON': 'the-open-network', 'SHIB': 'shiba-inu', 'PEPE': 'pepe',
          'WIF': 'dogwifcoin', 'BONK': 'bonk', 'FLOKI': 'floki', 'INJ': 'injective-protocol',
          'TIA': 'celestia', 'SEI': 'sei-network', 'RUNE': 'thorchain', 'OSMO': 'osmosis',
          'JUNO': 'juno-network', 'CRV': 'curve-dao-token'
        };

        // Kraken name mapping for scanner
        const krakenMap: Record<string, string> = {
          'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'BNB': 'binance-coin',
          'XRP': 'xrp', 'ADA': 'cardano', 'DOGE': 'dogecoin', 'AVAX': 'avalanche',
          'LINK': 'chainlink', 'MATIC': 'polygon', 'DOT': 'polkadot', 'UNI': 'uniswap',
          'ATOM': 'cosmos', 'LTC': 'litecoin', 'BCH': 'bitcoin-cash', 'NEAR': 'near-protocol',
          'APT': 'aptos', 'ARB': 'arbitrum', 'OP': 'optimism', 'SUI': 'sui',
          'FIL': 'filecoin', 'ICP': 'internet-computer', 'VET': 'vechain', 'ALGO': 'algorand',
          'SAND': 'the-sandbox', 'MANA': 'decentraland', 'AXS': 'axie-infinity', 'FTM': 'fantom',
          'AAVE': 'aave', 'GRT': 'the-graph', 'SNX': 'synthetix', 'AR': 'arweave',
          'HBAR': 'hedera', 'XLM': 'stellar-lumens', 'TRX': 'tron', 'ETC': 'ethereum-classic',
          'XMR': 'monero', 'TON': 'toncoin', 'SHIB': 'shiba-inu', 'PEPE': 'pepe',
          'WIF': 'dogwifhat', 'BONK': 'bonk', 'FLOKI': 'floki', 'INJ': 'injective',
          'TIA': 'celestia', 'SEI': 'sei', 'RUNE': 'thorchain', 'OSMO': 'osmosis',
          'JUNO': 'juno', 'CRV': 'curve-dao-token'
        };

        let response = "🔍 *Crypto Market Scan*\n\n";
        result.strongBuys.slice(0, 10).forEach((rec: any) => {
          let url: string;
          if (linkPref === 'kraken') {
            // Kraken format: /prices/{crypto-name}
            const krakenName = krakenMap[rec.ticker] || rec.ticker.toLowerCase();
            url = `https://www.kraken.com/prices/${krakenName}`;
          } else {
            // Default: CoinGecko
            const coinGeckoId = coinGeckoMap[rec.ticker] || rec.ticker.toLowerCase();
            url = `https://www.coingecko.com/en/coins/${coinGeckoId}`;
          }
          
          const duration = rec.patternDuration?.estimate || 'Unknown';
          response += `🟢 ${rec.name} [${rec.ticker}](${url}) - ${rec.recommendation}\n`;
          response += `⏱️ Duration: ${duration}\n`;
          response += `📊 RSI: ${rec.rsi?.toFixed(1)}\n`;
          response += `💰 24h Price: ${rec.priceChangePercent24h >= 0 ? '+' : ''}${rec.priceChangePercent24h?.toFixed(2)}%\n`;
          response += `📈 24h Volume: ${rec.volumeChangePercent >= 0 ? '+' : ''}${rec.volumeChangePercent?.toFixed(1)}%\n\n`;
        });
        
        return { response, success: true };
      }

      // CONTRACT ADDRESS DETECTION (Ethereum 0x... or Solana base58)
      const isEthAddress = /^0x[a-fA-F0-9]{40}$/i.test(msg);
      const isSolAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(msg);
      
      if (isEthAddress || isSolAddress) {
        logger?.info('💎 [DarkWaveWorkflow] Contract address detected', { address: msg.substring(0, 10) + '...' });
        
        try {
          // Use dexscreener for contract addresses
          const dexData = await dexscreenerTool.execute({
            context: { query: msg },
            mastra,
            runtimeContext: undefined as any
          });

          // Analyze with DEX-specific analysis tool
          const analysis = await dexAnalysisTool.execute({
            context: {
              ticker: dexData.ticker,
              name: dexData.name,
              chain: dexData.chain,
              dex: dexData.dex,
              currentPrice: dexData.currentPrice,
              priceChange24h: dexData.priceChange24h,
              priceChangePercent24h: dexData.priceChangePercent24h,
              volume24h: dexData.volume24h,
              liquidity: dexData.liquidity,
              priceHistory: dexData.priceHistory,
            },
            mastra,
            runtimeContext: undefined as any
          });

          let emoji = "🟡";
          if (analysis.recommendation === "BUY" || analysis.recommendation === "STRONG_BUY") emoji = "🟢";
          if (analysis.recommendation === "SELL" || analysis.recommendation === "STRONG_SELL") emoji = "🔴";

          return {
            response: `${emoji} *${dexData.ticker} (${dexData.name})*\n\n` +
              `🔗 *Chain:* ${dexData.chain} | *DEX:* ${dexData.dex}\n` +
              `💰 *Price:* $${dexData.currentPrice?.toFixed(8)}\n` +
              `📈 *24h Change:* ${dexData.priceChangePercent24h >= 0 ? '+' : ''}${dexData.priceChangePercent24h?.toFixed(2)}%\n\n` +
              `${emoji} *${analysis.recommendation}*\n` +
              `⚠️ *Rug Risk:* ${analysis.rugRisk}\n` +
              `💧 *Liquidity Score:* ${analysis.liquidityScore}/10\n\n` +
              `📊 *INDICATORS:*\n` +
              `• *RSI (14):* ${analysis.rsi?.toFixed(1)}\n` +
              `• *Volume 24h:* $${(dexData.volume24h / 1000000).toFixed(2)}M\n` +
              `• *Liquidity:* $${(dexData.liquidity / 1000).toFixed(1)}K\n` +
              `• *Volatility:* ${analysis.volatility?.toFixed(1)}%\n\n` +
              `⚠️ *SIGNALS (${analysis.signals?.length || 0}):*\n` +
              (analysis.signals?.map(s => `• ${s}`).join('\n') || '• None') + `\n\n` +
              `🔗 ${dexData.url}`,
            success: true
          };
        } catch (dexError: any) {
          return {
            response: `⚠️ Contract address not found on DEX.\n\nTry:\n• Token symbol instead (e.g., PEPE)\n• Or search on dexscreener.com`,
            success: false
          };
        }
      }

      // Single ticker analysis (BTC, ETH, etc.)
      const ticker = msg.replace(/[^A-Z0-9]/g, '');
      if (ticker.length >= 2 && ticker.length <= 6) {
        logger?.info('📊 [DarkWaveWorkflow] Analyzing ticker', { ticker });
        
        // Get user's link preference
        const prefResult = await preferencesTool.execute({
          context: { action: 'get', userId },
          mastra,
          runtimeContext: undefined as any
        });
        const linkPref = prefResult.linkPreference;

        // Blue chips and stocks ONLY use CoinCap/Yahoo Finance
        // NO fallback to Dexscreener (prevents BTC linking to dead Dexscreener duplicates)
        const marketData = await marketDataTool.execute({ 
          context: { ticker, days: 90 },
          mastra, 
          runtimeContext: undefined as any
        });

        const analysis = await technicalAnalysisTool.execute({ 
          context: { 
            ticker: marketData.ticker,
            currentPrice: marketData.currentPrice,
            priceChange24h: marketData.priceChange24h,
            priceChangePercent24h: marketData.priceChangePercent24h,
            volume24h: marketData.volume24h,
            prices: marketData.prices,
          },
          mastra, 
          runtimeContext: undefined as any
        });

        let emoji = "🟡";
        if (analysis.recommendation === "BUY" || analysis.recommendation === "STRONG_BUY") emoji = "🟢";
        if (analysis.recommendation === "SELL" || analysis.recommendation === "STRONG_SELL") emoji = "🔴";

        // Generate hyperlink based on preference and asset type
        const coinGeckoMap: Record<string, string> = {
          'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'BNB': 'binancecoin', 
          'XRP': 'ripple', 'ADA': 'cardano', 'DOGE': 'dogecoin', 'AVAX': 'avalanche-2', 
          'LINK': 'chainlink', 'MATIC': 'matic-network', 'DOT': 'polkadot', 'UNI': 'uniswap',
          'ATOM': 'cosmos', 'LTC': 'litecoin', 'BCH': 'bitcoin-cash', 'NEAR': 'near',
          'APT': 'aptos', 'ARB': 'arbitrum', 'OP': 'optimism', 'SUI': 'sui',
          'FIL': 'filecoin', 'ICP': 'internet-computer', 'VET': 'vechain', 'ALGO': 'algorand',
          'SAND': 'the-sandbox', 'MANA': 'decentraland', 'AXS': 'axie-infinity', 'FTM': 'fantom',
          'AAVE': 'aave', 'GRT': 'the-graph', 'SNX': 'havven', 'AR': 'arweave',
          'HBAR': 'hedera-hashgraph', 'XLM': 'stellar', 'TRX': 'tron', 'ETC': 'ethereum-classic',
          'XMR': 'monero', 'TON': 'the-open-network', 'SHIB': 'shiba-inu', 'PEPE': 'pepe',
          'WIF': 'dogwifcoin', 'BONK': 'bonk', 'FLOKI': 'floki', 'INJ': 'injective-protocol',
          'TIA': 'celestia', 'SEI': 'sei-network', 'RUNE': 'thorchain', 'OSMO': 'osmosis',
          'JUNO': 'juno-network', 'CRV': 'curve-dao-token'
        };

        // Kraken uses crypto names, not tickers
        const krakenMap: Record<string, string> = {
          'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'BNB': 'binance-coin',
          'XRP': 'xrp', 'ADA': 'cardano', 'DOGE': 'dogecoin', 'AVAX': 'avalanche',
          'LINK': 'chainlink', 'MATIC': 'polygon', 'DOT': 'polkadot', 'UNI': 'uniswap',
          'ATOM': 'cosmos', 'LTC': 'litecoin', 'BCH': 'bitcoin-cash', 'NEAR': 'near-protocol',
          'APT': 'aptos', 'ARB': 'arbitrum', 'OP': 'optimism', 'SUI': 'sui',
          'FIL': 'filecoin', 'ICP': 'internet-computer', 'VET': 'vechain', 'ALGO': 'algorand',
          'SAND': 'the-sandbox', 'MANA': 'decentraland', 'AXS': 'axie-infinity', 'FTM': 'fantom',
          'AAVE': 'aave', 'GRT': 'the-graph', 'SNX': 'synthetix', 'AR': 'arweave',
          'HBAR': 'hedera', 'XLM': 'stellar-lumens', 'TRX': 'tron', 'ETC': 'ethereum-classic',
          'XMR': 'monero', 'TON': 'toncoin', 'SHIB': 'shiba-inu', 'PEPE': 'pepe',
          'WIF': 'dogwifhat', 'BONK': 'bonk', 'FLOKI': 'floki', 'INJ': 'injective',
          'TIA': 'celestia', 'SEI': 'sei', 'RUNE': 'thorchain', 'OSMO': 'osmosis',
          'JUNO': 'juno', 'CRV': 'curve-dao-token'
        };

        let tickerUrl: string;
        const isCrypto = marketData.type === 'crypto';

        if (linkPref === 'kraken') {
          // Kraken format: /prices/{crypto-name}
          if (isCrypto) {
            const krakenName = krakenMap[ticker] || ticker.toLowerCase();
            tickerUrl = `https://www.kraken.com/prices/${krakenName}`;
          } else {
            // For stocks, use Yahoo Finance even in Kraken mode
            tickerUrl = `https://finance.yahoo.com/quote/${ticker}`;
          }
        } else {
          // DEFAULT mode
          if (isCrypto) {
            const coinGeckoId = coinGeckoMap[ticker] || ticker.toLowerCase();
            tickerUrl = `https://www.coingecko.com/en/coins/${coinGeckoId}`;
          } else {
            // Stock - Yahoo Finance
            tickerUrl = `https://finance.yahoo.com/quote/${ticker}`;
          }
        }

        // Simplified output format with duration estimate
        const volumeChange = analysis.volume?.changePercent || 0;
        const duration = analysis.patternDuration?.estimate || 'Unknown';
        const response = `${emoji} [${ticker}](${tickerUrl}) - ${analysis.recommendation}\n` +
          `⏱️ Duration: ${duration}\n` +
          `📊 RSI: ${analysis.rsi?.toFixed(1)}\n` +
          `💰 24h Price: ${analysis.priceChangePercent24h >= 0 ? '+' : ''}${analysis.priceChangePercent24h?.toFixed(2)}%\n` +
          `📈 24h Volume: ${volumeChange >= 0 ? '+' : ''}${volumeChange?.toFixed(1)}%`;

        return { response, success: true };
      }

      // Unknown command
      return {
        response: "Commands:\n• BTC, ETH, SOL (any ticker)\n• SCAN - Top 10 cryptos\n\n⚠️ Wallet features disabled",
        success: true
      };

    } catch (error: any) {
      logger?.error('❌ [DarkWaveWorkflow] Error', { error: error.message });
      return {
        response: `⚠️ Error: ${error.message}`,
        success: false
      };
    }
  },
});

export const darkwaveWorkflow = createWorkflow({
  id: "darkwave-workflow",
  
  inputSchema: z.object({
    message: z.string(),
    userId: z.string().optional(),
  }),

  outputSchema: z.object({
    response: z.string(),
    success: z.boolean(),
  }),
})
  .then(processMessage)
  .commit();
