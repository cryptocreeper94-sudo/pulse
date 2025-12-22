import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { marketDataTool } from './3ad8b4ec-d99b-430e-9928-3aa487d45658.mjs';
import { t as technicalAnalysisTool } from '../technicalAnalysisTool.mjs';
import 'axios';
import '../subscriptionCheck.mjs';
import 'technicalindicators';
import '../client.mjs';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import 'crypto';

const CRYPTO_NAMES = {
  "BTC": "Bitcoin",
  "ETH": "Ethereum",
  "SOL": "Solana",
  "BNB": "BNB",
  "XRP": "XRP",
  "ADA": "Cardano",
  "DOGE": "Dogecoin",
  "AVAX": "Avalanche",
  "LINK": "Chainlink",
  "MATIC": "Polygon",
  "DOT": "Polkadot",
  "UNI": "Uniswap",
  "ATOM": "Cosmos",
  "LTC": "Litecoin",
  "BCH": "Bitcoin Cash",
  "NEAR": "NEAR Protocol",
  "APT": "Aptos",
  "ARB": "Arbitrum",
  "OP": "Optimism",
  "SUI": "Sui",
  "FIL": "Filecoin",
  "ICP": "Internet Computer",
  "VET": "VeChain",
  "ALGO": "Algorand",
  "SAND": "The Sandbox",
  "MANA": "Decentraland",
  "AXS": "Axie Infinity",
  "FTM": "Fantom",
  "AAVE": "Aave",
  "GRT": "The Graph",
  "SNX": "Synthetix",
  "AR": "Arweave",
  "HBAR": "Hedera",
  "XLM": "Stellar",
  "TRX": "TRON",
  "ETC": "Ethereum Classic",
  "XMR": "Monero",
  "TON": "Toncoin",
  "SHIB": "Shiba Inu",
  "PEPE": "Pepe",
  "WIF": "dogwifhat",
  "BONK": "Bonk",
  "FLOKI": "FLOKI",
  "INJ": "Injective",
  "TIA": "Celestia",
  "SEI": "Sei",
  "RUNE": "THORChain",
  "OSMO": "Osmosis",
  "JUNO": "Juno",
  "CRV": "Curve DAO"
};
const scannerTool = createTool({
  id: "scanner-tool",
  description: "Scans top cryptocurrencies or stocks for spike potential based on historic patterns. Returns assets showing strong buy signals with bullish convergence (volume spikes, RSI recovery, MACD crossovers, resistance breaks). Use when user says 'crypto' or 'stock'.",
  inputSchema: z.object({
    type: z.enum(["crypto", "stock"]).describe("Type of assets to scan - 'crypto' for top 50 cryptocurrencies, 'stock' for top 100 stocks"),
    limit: z.number().optional().default(10).describe("Maximum number of results to return")
  }),
  outputSchema: z.object({
    scannedCount: z.number(),
    strongBuys: z.array(z.object({
      ticker: z.string(),
      name: z.string(),
      type: z.string(),
      currentPrice: z.number(),
      volume24h: z.number(),
      volumeChangePercent: z.number(),
      priceChangePercent24h: z.number(),
      rsi: z.number(),
      recommendation: z.string(),
      patternDuration: z.object({
        estimate: z.string(),
        confidence: z.string(),
        type: z.string()
      }).optional(),
      signalCount: z.object({
        bullish: z.number(),
        bearish: z.number()
      })
    })),
    message: z.string()
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F527} [ScannerTool] Starting scan", { type: context.type, limit: context.limit });
    const TOP_50_CRYPTOS = [
      "BTC",
      "ETH",
      "SOL",
      "BNB",
      "XRP",
      "ADA",
      "DOGE",
      "AVAX",
      "LINK",
      "MATIC",
      "DOT",
      "UNI",
      "ATOM",
      "LTC",
      "BCH",
      "NEAR",
      "APT",
      "ARB",
      "OP",
      "SUI",
      "FIL",
      "ICP",
      "VET",
      "ALGO",
      "SAND",
      "MANA",
      "AXS",
      "FTM",
      "AAVE",
      "GRT",
      "SNX",
      "AR",
      "HBAR",
      "XLM",
      "TRX",
      "ETC",
      "XMR",
      "TON",
      "SHIB",
      "PEPE",
      "WIF",
      "BONK",
      "FLOKI",
      "INJ",
      "TIA",
      "SEI",
      "RUNE",
      "OSMO",
      "JUNO",
      "CRV"
    ];
    const TOP_100_STOCKS = [
      "AAPL",
      "MSFT",
      "GOOGL",
      "AMZN",
      "NVDA",
      "META",
      "TSLA",
      "JPM",
      "V",
      "WMT",
      "JNJ",
      "PG",
      "MA",
      "HD",
      "CVX",
      "MRK",
      "ABBV",
      "PEP",
      "KO",
      "COST",
      "AVGO",
      "TMO",
      "ORCL",
      "ACN",
      "MCD",
      "CSCO",
      "NKE",
      "ABT",
      "ADBE",
      "CRM",
      "LIN",
      "NFLX",
      "PFE",
      "DHR",
      "TXN",
      "DIS",
      "UNP",
      "VZ",
      "INTC",
      "AMD",
      "NEE",
      "CMCSA",
      "UNH",
      "RTX",
      "QCOM",
      "PM",
      "BMY",
      "HON",
      "T",
      "AMGN",
      "BA",
      "GE",
      "IBM",
      "CAT",
      "SBUX",
      "LOW",
      "INTU",
      "ISRG",
      "MS",
      "GS",
      "BLK",
      "AXP",
      "DE",
      "SPGI",
      "NOW",
      "GILD",
      "BKNG",
      "MDLZ",
      "LRCX",
      "ADI",
      "MMM",
      "SYK",
      "VRTX",
      "AMT",
      "PLD",
      "TJX",
      "REGN",
      "ZTS",
      "CI",
      "CVS",
      "MO",
      "CB",
      "SO",
      "BDX",
      "DUK",
      "TGT",
      "USB",
      "PNC",
      "EOG",
      "CCI",
      "CL",
      "ITW",
      "BSX",
      "SHW",
      "APD",
      "EL",
      "CME",
      "EQIX",
      "NSC",
      "MCO"
    ];
    let tickersToScan = [];
    if (context.type === "crypto") {
      tickersToScan.push(...TOP_50_CRYPTOS.map((t) => ({ ticker: t, type: "crypto" })));
    } else if (context.type === "stock") {
      tickersToScan.push(...TOP_100_STOCKS.map((t) => ({ ticker: t, type: "stock" })));
    }
    logger?.info("\u{1F4CA} [ScannerTool] Scanning tickers", { count: tickersToScan.length });
    const strongBuys = [];
    let scanned = 0;
    for (const { ticker, type } of tickersToScan) {
      try {
        logger?.info(`\u{1F50D} [ScannerTool] Analyzing ${ticker}`, { type });
        const marketData = await marketDataTool.execute({
          context: { ticker, days: 90, type },
          mastra,
          runtimeContext: void 0
        });
        const analysis = await technicalAnalysisTool.execute({
          context: {
            ticker: marketData.ticker,
            currentPrice: marketData.currentPrice,
            priceChange24h: marketData.priceChange24h,
            priceChangePercent24h: marketData.priceChangePercent24h,
            volume24h: marketData.volume24h,
            prices: marketData.prices
          },
          mastra,
          runtimeContext: void 0
        });
        scanned++;
        if (analysis.recommendation === "BUY" || analysis.recommendation === "STRONG_BUY") {
          strongBuys.push({
            ticker: analysis.ticker,
            name: type === "crypto" ? CRYPTO_NAMES[ticker] || ticker : ticker,
            type,
            currentPrice: analysis.currentPrice,
            volume24h: marketData.volume24h,
            volumeChangePercent: analysis.volume.changePercent,
            priceChangePercent24h: marketData.priceChangePercent24h,
            rsi: analysis.rsi,
            recommendation: analysis.recommendation,
            patternDuration: analysis.patternDuration,
            signalCount: analysis.signalCount
          });
        }
        await new Promise((resolve) => setTimeout(resolve, type === "crypto" ? 1e3 : 200));
      } catch (error) {
        logger?.warn(`\u26A0\uFE0F [ScannerTool] Failed to analyze ${ticker}`, { error: error.message });
      }
    }
    logger?.info("\u2705 [ScannerTool] Scan complete", {
      scanned,
      strongBuysFound: strongBuys.length
    });
    return {
      scannedCount: scanned,
      strongBuys,
      message: strongBuys.length > 0 ? `Found ${strongBuys.length} asset(s) with strong buy signals out of ${scanned} scanned.` : `No strong buy signals found in ${scanned} assets scanned.`
    };
  }
});

export { scannerTool };
//# sourceMappingURL=b241ccba-a166-451d-920a-fb16f923d2fe.mjs.map
