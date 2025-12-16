import { inngest } from "./client";
import { predictionLearningService } from "../../services/predictionLearningService.js";

type TimeHorizon = '1h' | '4h' | '24h' | '7d';

const HORIZONS: TimeHorizon[] = ['1h', '4h', '24h', '7d'];
const MIN_TRAINING_SAMPLES = 50;

export const dailyModelTrainingWorker = inngest.createFunction(
  {
    id: "daily-model-training-worker",
    name: "Daily Model Training",
  },
  [
    { cron: "0 2 * * *" },
    { event: "model/train-daily" },
  ],
  async ({ event, step }) => {
    console.log("🧠 [DailyModelTraining] Starting daily model training check...");
    
    const status = await step.run("check-model-status", async () => {
      return await predictionLearningService.getModelStatus();
    });

    console.log(`📊 [DailyModelTraining] Total features in database: ${status.totalFeatures}`);
    
    const results: Record<string, any> = {};
    let trainedCount = 0;
    let skippedCount = 0;

    for (const horizon of HORIZONS) {
      const isReady = status.readyToTrain[horizon];
      const hasActiveModel = status.horizons[horizon]?.hasActiveModel || false;
      
      console.log(`📈 [DailyModelTraining] ${horizon}: ready=${isReady}, hasActiveModel=${hasActiveModel}`);
      
      if (isReady) {
        const trainResult = await step.run(`train-model-${horizon}`, async () => {
          console.log(`🎯 [DailyModelTraining] Training model for ${horizon} horizon...`);
          try {
            const result = await predictionLearningService.trainModel(horizon);
            return result;
          } catch (error: any) {
            console.error(`❌ [DailyModelTraining] Training failed for ${horizon}:`, error.message);
            return { success: false, error: error.message };
          }
        });
        
        results[horizon] = trainResult;
        
        if (trainResult.success) {
          trainedCount++;
          console.log(`✅ [DailyModelTraining] ${horizon} model trained successfully`);
          console.log(`   Model ID: ${'modelId' in trainResult ? trainResult.modelId : 'N/A'}`);
          const metrics = 'metrics' in trainResult ? trainResult.metrics : null;
          console.log(`   Accuracy: ${((metrics?.accuracy || 0) * 100).toFixed(1)}%`);
          console.log(`   Precision: ${((metrics?.precision || 0) * 100).toFixed(1)}%`);
          console.log(`   Recall: ${((metrics?.recall || 0) * 100).toFixed(1)}%`);
          console.log(`   F1 Score: ${((metrics?.f1Score || 0) * 100).toFixed(1)}%`);
        } else {
          console.log(`⚠️ [DailyModelTraining] ${horizon} model training failed: ${trainResult.error}`);
        }
      } else {
        skippedCount++;
        results[horizon] = { 
          success: false, 
          skipped: true,
          error: `Insufficient training samples (need ${MIN_TRAINING_SAMPLES})` 
        };
        console.log(`⏳ [DailyModelTraining] ${horizon} skipped - insufficient data`);
      }
    }

    const driftCheck = await step.run("check-model-drift", async () => {
      console.log(`🔍 [DailyModelTraining] Checking for model drift...`);
      try {
        return await predictionLearningService.checkAllHorizonsDrift(7);
      } catch (error: any) {
        console.error(`⚠️ [DailyModelTraining] Drift check failed:`, error.message);
        return null;
      }
    });

    if (driftCheck?.hasAnyDrift) {
      console.log(`⚠️ [DailyModelTraining] Model drift detected!`);
      console.log(`   Recommendation: ${driftCheck.overallRecommendation}`);
    }

    const summary = {
      timestamp: new Date().toISOString(),
      totalFeatures: status.totalFeatures,
      modelsTrained: trainedCount,
      modelsSkipped: skippedCount,
      results,
      driftCheck: driftCheck ? {
        hasAnyDrift: driftCheck.hasAnyDrift,
        recommendation: driftCheck.overallRecommendation,
      } : null,
    };

    console.log(`🎉 [DailyModelTraining] Completed: ${trainedCount} models trained, ${skippedCount} skipped`);
    return summary;
  }
);

export const modelTrainingWorkerFunctions = [
  dailyModelTrainingWorker,
];
