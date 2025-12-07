import { inngest } from "./client";
import { predictionTrackingService } from "../../services/predictionTrackingService.js";
import axios from "axios";

/**
 * Prediction Outcome Worker
 * Runs periodically to check outcomes of past predictions
 * Evaluates at 1hr, 4hr, 24hr, and 7d horizons
 */

type Horizon = '1h' | '4h' | '24h' | '7d';

const HORIZONS: Horizon[] = ['1h', '4h', '24h', '7d'];

async function fetchCurrentPrice(ticker: string): Promise<number | null> {
  try {
    const cgTicker = ticker.toLowerCase();
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price`,
      {
        params: {
          ids: cgTicker === 'btc' ? 'bitcoin' : 
               cgTicker === 'eth' ? 'ethereum' :
               cgTicker === 'sol' ? 'solana' :
               cgTicker,
          vs_currencies: 'usd',
        },
        timeout: 10000,
        headers: process.env.COINGECKO_API_KEY ? {
          'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
        } : {},
      }
    );

    const coinId = cgTicker === 'btc' ? 'bitcoin' : 
                   cgTicker === 'eth' ? 'ethereum' :
                   cgTicker === 'sol' ? 'solana' :
                   cgTicker;
    
    return response.data[coinId]?.usd || null;
  } catch (error: any) {
    console.error(`[PredictionWorker] Failed to fetch price for ${ticker}:`, error.message);
    return null;
  }
}

export const predictionOutcomeWorker = inngest.createFunction(
  {
    id: "prediction-outcome-worker",
    name: "Check Prediction Outcomes",
  },
  [
    { cron: "0 * * * *" }, // Run every hour at minute 0
    { event: "prediction/check-outcomes" }, // Can also be triggered manually
  ],
  async ({ event, step }) => {
    console.log("🔍 [PredictionWorker] Starting outcome check run...");
    
    let processedCount = 0;
    let errorCount = 0;

    // Check each horizon
    for (const horizon of HORIZONS) {
      const pendingPredictions = await step.run(
        `get-pending-${horizon}`,
        async () => {
          return await predictionTrackingService.getPendingOutcomeChecks(horizon);
        }
      );

      console.log(`📊 [PredictionWorker] Found ${pendingPredictions.length} pending predictions for ${horizon} horizon`);

      // Process each prediction
      for (const prediction of pendingPredictions) {
        try {
          const currentPrice = await step.run(
            `fetch-price-${prediction.id}-${horizon}`,
            async () => {
              return await fetchCurrentPrice(prediction.ticker);
            }
          );

          if (currentPrice === null) {
            console.warn(`⚠️ [PredictionWorker] Could not fetch price for ${prediction.ticker}`);
            errorCount++;
            continue;
          }

          await step.run(
            `record-outcome-${prediction.id}-${horizon}`,
            async () => {
              return await predictionTrackingService.recordOutcome({
                predictionId: prediction.id,
                horizon,
                priceAtCheck: currentPrice,
              });
            }
          );

          processedCount++;
        } catch (error: any) {
          console.error(`❌ [PredictionWorker] Error processing ${prediction.id}:`, error.message);
          errorCount++;
        }
      }
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

export const predictionWorkerFunctions = [
  predictionOutcomeWorker,
  predictionCreatedHandler,
];
