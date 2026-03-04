import { inngest } from "./client";
import { predictionTrackingService } from "../../services/predictionTrackingService.js";
import { predictionLearningService } from "../../services/predictionLearningService.js";
import { strikeAgentTrackingService } from "../../services/strikeAgentTrackingService.js";
import axios from "axios";
import { coinGeckoClient } from "../../lib/coinGeckoClient.js";

/**
 * Prediction Outcome Worker
 * Runs periodically to check outcomes of past predictions
 * Evaluates at 1hr, 4hr, 24hr, and 7d horizons
 */

type Horizon = '1h' | '4h' | '24h' | '7d';

const HORIZONS: Horizon[] = ['1h', '4h', '24h', '7d'];

const TICKER_TO_COINGECKO: Record<string, string> = {
  'btc': 'bitcoin',
  'bitcoin': 'bitcoin',
  'eth': 'ethereum',
  'ethereum': 'ethereum',
  'sol': 'solana',
  'solana': 'solana',
  'xrp': 'ripple',
  'ripple': 'ripple',
  'doge': 'dogecoin',
  'dogecoin': 'dogecoin',
  'ada': 'cardano',
  'cardano': 'cardano',
  'avax': 'avalanche-2',
  'avalanche': 'avalanche-2',
  'avalanche-2': 'avalanche-2',
  'dot': 'polkadot',
  'polkadot': 'polkadot',
  'link': 'chainlink',
  'chainlink': 'chainlink',
  'near': 'near',
  'atom': 'cosmos',
  'cosmos': 'cosmos',
  'ltc': 'litecoin',
  'litecoin': 'litecoin',
  'uni': 'uniswap',
  'uniswap': 'uniswap',
  'xlm': 'stellar',
  'stellar': 'stellar',
  'algo': 'algorand',
  'algorand': 'algorand',
  'vet': 'vechain',
  'vechain': 'vechain',
  'icp': 'internet-computer',
  'internet-computer': 'internet-computer',
  'fil': 'filecoin',
  'filecoin': 'filecoin',
  'grt': 'the-graph',
  'the-graph': 'the-graph',
  'aave': 'aave',
  'bnb': 'binancecoin',
  'binancecoin': 'binancecoin',
  'usdt': 'tether',
  'tether': 'tether',
  'usdc': 'usd-coin',
  'usd-coin': 'usd-coin',
  'matic': 'matic-network',
  'polygon': 'matic-network',
  'shib': 'shiba-inu',
  'trx': 'tron',
  'tron': 'tron',
  'ton': 'the-open-network',
  'sui': 'sui',
  'apt': 'aptos',
  'aptos': 'aptos',
  'arb': 'arbitrum',
  'arbitrum': 'arbitrum',
  'op': 'optimism',
  'optimism': 'optimism',
  'sei': 'sei-network',
  'inj': 'injective-protocol',
  'injective': 'injective-protocol',
  'render': 'render-token',
  'rndr': 'render-token',
  'hbar': 'hedera-hashgraph',
  'hedera': 'hedera-hashgraph',
  'ftm': 'fantom',
  'fantom': 'fantom',
  'sand': 'the-sandbox',
  'mana': 'decentraland',
  'axs': 'axie-infinity',
  'ape': 'apecoin',
  'ldo': 'lido-dao',
  'crv': 'curve-dao-token',
  'mkr': 'maker',
  'snx': 'synthetix-network-token',
  'comp': 'compound-governance-token',
  'rune': 'thorchain',
  'kava': 'kava',
  'celo': 'celo',
  'flow': 'flow',
  'mina': 'mina-protocol',
  'theta': 'theta-token',
  'egld': 'elrond-erd-2',
  'xtz': 'tezos',
  'tezos': 'tezos',
  'eos': 'eos',
  'neo': 'neo',
  'zec': 'zcash',
  'xmr': 'monero',
  'monero': 'monero',
  'dash': 'dash',
  'etc': 'ethereum-classic',
  'bch': 'bitcoin-cash',
  'pepe': 'pepe',
  'wif': 'dogwifcoin',
  'bonk': 'bonk',
  'floki': 'floki',
  'brett': 'brett',
  'popcat': 'popcat',
  'mog': 'mog-coin',
};

function getCoingeckoId(ticker: string): string {
  const normalized = ticker.toLowerCase().trim();
  return TICKER_TO_COINGECKO[normalized] || normalized;
}

async function fetchCurrentPrice(ticker: string): Promise<number | null> {
  try {
    const coinId = getCoingeckoId(ticker);
    const data = await coinGeckoClient.getSimplePrice(coinId, 'usd', false, false, false);
    return data[coinId]?.usd || null;
  } catch (error: any) {
    console.error(`[PredictionWorker] Failed to fetch price for ${ticker} (${getCoingeckoId(ticker)}):`, error.message);
    return null;
  }
}

async function fetchPricesBatch(tickers: string[]): Promise<Record<string, number>> {
  const uniqueIds = [...new Set(tickers.map(t => getCoingeckoId(t)))];
  const prices: Record<string, number> = {};
  
  const batchSize = 50;
  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const batch = uniqueIds.slice(i, i + batchSize);
    try {
      const idsParam = batch.join(',');
      const data = await coinGeckoClient.getSimplePrice(idsParam, 'usd', false, false, false);
      for (const [id, val] of Object.entries(data)) {
        if ((val as any)?.usd) {
          prices[id] = (val as any).usd;
        }
      }
    } catch (error: any) {
      console.error(`[PredictionWorker] Batch price fetch failed:`, error.message);
    }
  }
  
  return prices;
}

export const predictionOutcomeWorker = inngest.createFunction(
  {
    id: "prediction-outcome-worker",
    name: "Check Prediction Outcomes",
  },
  [
    { cron: "*/15 * * * *" },
    { event: "prediction/check-outcomes" },
  ],
  async ({ event, step }) => {
    console.log("🔍 [PredictionWorker] Starting outcome check run...");
    
    let processedCount = 0;
    let errorCount = 0;

    for (const horizon of HORIZONS) {
      const pendingPredictions = await step.run(
        `get-pending-${horizon}`,
        async () => {
          return await predictionTrackingService.getPendingOutcomeChecks(horizon, 50);
        }
      );

      if (pendingPredictions.length === 0) continue;
      console.log(`📊 [PredictionWorker] Found ${pendingPredictions.length} pending predictions for ${horizon} horizon`);

      const prices = await step.run(
        `fetch-prices-batch-${horizon}`,
        async () => {
          const tickers = [...new Set(pendingPredictions.map((p: any) => p.ticker))];
          return await fetchPricesBatch(tickers);
        }
      );

      const results = await step.run(
        `process-batch-${horizon}`,
        async () => {
          let processed = 0;
          let errors = 0;
          
          for (const prediction of pendingPredictions) {
            try {
              const coinId = getCoingeckoId(prediction.ticker);
              const currentPrice = prices[coinId];
              
              if (!currentPrice) {
                errors++;
                continue;
              }

              await predictionTrackingService.recordOutcome({
                predictionId: prediction.id,
                horizon,
                priceAtCheck: currentPrice,
              });

              processed++;
            } catch (error: any) {
              console.error(`❌ [PredictionWorker] Error processing ${prediction.id}:`, error.message);
              errors++;
            }
          }
          
          return { processed, errors };
        }
      );

      processedCount += results.processed;
      errorCount += results.errors;
    }

    const summary = {
      processedCount,
      errorCount,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ [PredictionWorker] Completed: ${processedCount} outcomes recorded, ${errorCount} errors`);
    return summary;
  }
);

export const predictionCreatedHandler = inngest.createFunction(
  {
    id: "prediction-created-handler",
    name: "Handle New Prediction",
  },
  {
    event: "prediction/created",
  },
  async ({ event, step }) => {
    const predictionId = event.data.predictionId;
    console.log(`📊 [PredictionWorker] New prediction created: ${predictionId}`);
    
    // Schedule outcome checks at each horizon
    // Inngest will handle the delays natively
    
    // 1 hour check
    await step.sleep("wait-1h", "1h");
    await step.run("check-1h", async () => {
      const prediction = await predictionTrackingService.getPendingOutcomeChecks('1h')
        .then(preds => preds.find(p => p.id === predictionId));
      
      if (prediction) {
        const price = await fetchCurrentPrice(prediction.ticker);
        if (price) {
          await predictionTrackingService.recordOutcome({
            predictionId,
            horizon: '1h',
            priceAtCheck: price,
          });
        }
      }
    });

    // 4 hour check
    await step.sleep("wait-4h", "3h"); // 3 more hours (1+3=4)
    await step.run("check-4h", async () => {
      const prediction = await predictionTrackingService.getPendingOutcomeChecks('4h')
        .then(preds => preds.find(p => p.id === predictionId));
      
      if (prediction) {
        const price = await fetchCurrentPrice(prediction.ticker);
        if (price) {
          await predictionTrackingService.recordOutcome({
            predictionId,
            horizon: '4h',
            priceAtCheck: price,
          });
        }
      }
    });

    // 24 hour check
    await step.sleep("wait-24h", "20h"); // 20 more hours (4+20=24)
    await step.run("check-24h", async () => {
      const prediction = await predictionTrackingService.getPendingOutcomeChecks('24h')
        .then(preds => preds.find(p => p.id === predictionId));
      
      if (prediction) {
        const price = await fetchCurrentPrice(prediction.ticker);
        if (price) {
          await predictionTrackingService.recordOutcome({
            predictionId,
            horizon: '24h',
            priceAtCheck: price,
          });
        }
      }
    });

    // 7 day check
    await step.sleep("wait-7d", "144h"); // 144 more hours (24+144=168=7d)
    await step.run("check-7d", async () => {
      const prediction = await predictionTrackingService.getPendingOutcomeChecks('7d')
        .then(preds => preds.find(p => p.id === predictionId));
      
      if (prediction) {
        const price = await fetchCurrentPrice(prediction.ticker);
        if (price) {
          await predictionTrackingService.recordOutcome({
            predictionId,
            horizon: '7d',
            priceAtCheck: price,
          });
        }
      }
    });

    return { success: true, predictionId };
  }
);

/**
 * Model Training Worker
 * Runs weekly to retrain ML models on accumulated prediction data
 * Uses logistic regression to learn which indicator combinations predict price movements
 */
export const modelTrainingWorker = inngest.createFunction(
  {
    id: "model-training-worker",
    name: "Train Prediction Models",
  },
  [
    { cron: "0 3 * * *" },
    { event: "model/train" },
  ],
  async ({ event, step }) => {
    console.log("🧠 [ModelTraining] Starting weekly model training...");
    
    // Check if we have enough data
    const status = await step.run("check-status", async () => {
      return await predictionLearningService.getModelStatus();
    });

    console.log(`📊 [ModelTraining] Total features: ${status.totalFeatures}`);
    
    const results: Record<string, any> = {};
    const horizons: Array<'1h' | '4h' | '24h' | '7d'> = ['1h', '4h', '24h', '7d'];

    for (const horizon of horizons) {
      if (status.readyToTrain[horizon]) {
        const result = await step.run(`train-${horizon}`, async () => {
          console.log(`🎯 [ModelTraining] Training model for ${horizon} horizon...`);
          return await predictionLearningService.trainModel(horizon);
        });
        
        results[horizon] = result;
        
        if (result.success) {
          console.log(`✅ [ModelTraining] ${horizon} model trained - Accuracy: ${((result.metrics?.accuracy || 0) * 100).toFixed(1)}%`);
        } else {
          console.log(`⚠️ [ModelTraining] ${horizon} model failed: ${result.error}`);
        }
      } else {
        console.log(`⏳ [ModelTraining] ${horizon} horizon not ready - insufficient data`);
        results[horizon] = { success: false, error: 'Insufficient training data' };
      }
    }

    return {
      timestamp: new Date().toISOString(),
      totalFeatures: status.totalFeatures,
      results,
    };
  }
);

/**
 * StrikeAgent Outcome Worker
 * Runs periodically to check outcomes of StrikeAgent token discoveries
 * Tracks if tokens pumped or rugged at 1h, 4h, 24h, 7d horizons
 */
export const strikeAgentOutcomeWorker = inngest.createFunction(
  {
    id: "strikeagent-outcome-worker",
    name: "Check StrikeAgent Outcomes",
  },
  [
    { cron: "30 * * * *" }, // Run every hour at minute 30
    { event: "strikeagent/check-outcomes" }, // Can be triggered manually
  ],
  async ({ event, step }) => {
    console.log("🎯 [StrikeAgentWorker] Starting outcome check run...");
    
    let processedCount = 0;
    let errorCount = 0;

    for (const horizon of HORIZONS) {
      const pendingPredictions = await step.run(
        `get-pending-sa-${horizon}`,
        async () => {
          return await strikeAgentTrackingService.getPendingOutcomeChecks(horizon);
        }
      );

      console.log(`📊 [StrikeAgentWorker] Found ${pendingPredictions.length} pending StrikeAgent predictions for ${horizon} horizon`);

      for (const prediction of pendingPredictions) {
        try {
          await step.run(
            `check-sa-outcome-${prediction.id}-${horizon}`,
            async () => {
              return await strikeAgentTrackingService.checkOutcomeForPrediction(prediction.id, horizon);
            }
          );

          processedCount++;
        } catch (error: any) {
          console.error(`❌ [StrikeAgentWorker] Error processing ${prediction.id}:`, error.message);
          errorCount++;
        }
      }
    }

    const summary = {
      processedCount,
      errorCount,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ [StrikeAgentWorker] Completed: ${processedCount} outcomes recorded, ${errorCount} errors`);
    return summary;
  }
);

export const predictionWorkerFunctions = [
  predictionOutcomeWorker,
  predictionCreatedHandler,
  modelTrainingWorker,
  strikeAgentOutcomeWorker,
];
