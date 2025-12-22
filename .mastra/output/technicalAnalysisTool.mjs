import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { RSI, MACD, EMA, SMA, BollingerBands } from 'technicalindicators';
import { checkSubscriptionLimit } from './subscriptionCheck.mjs';
import { d as db, p as predictionEvents, e as predictionFeatures, f as predictionModelVersions } from './client.mjs';
import { eq, and, isNotNull, desc, sql, gte, lte } from 'drizzle-orm';
import { randomBytes } from 'crypto';

const FEATURE_NAMES = [
  "rsiNormalized",
  "macdSignal",
  "macdStrength",
  "ema9Spread",
  "ema21Spread",
  "ema50Spread",
  "ema200Spread",
  "ema9Over21",
  "ema50Over200",
  "bbPosition",
  "bbWidth",
  "volumeDeltaNorm",
  "spikeScoreNorm",
  "volatilityNorm",
  "distanceToSupport",
  "distanceToResistance"
];
const MIN_TRAINING_SAMPLES = 50;
class PredictionLearningService {
  modelCache = /* @__PURE__ */ new Map();
  async extractFeatures(predictionId, horizon, priceChangePercent, isWin) {
    const prediction = await db.select().from(predictionEvents).where(eq(predictionEvents.id, predictionId)).limit(1);
    if (!prediction.length) {
      console.log(`[ML] Prediction ${predictionId} not found`);
      return;
    }
    const pred = prediction[0];
    const indicators = JSON.parse(pred.indicators);
    const price = parseFloat(pred.priceAtPrediction);
    const features = this.normalizeIndicators(indicators, price);
    const featureId = `feat_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
    await db.insert(predictionFeatures).values({
      id: featureId,
      predictionId,
      horizon,
      rsiNormalized: features.rsiNormalized.toFixed(4),
      macdSignal: features.macdSignal.toFixed(4),
      macdStrength: features.macdStrength.toFixed(4),
      ema9Spread: features.ema9Spread.toFixed(4),
      ema21Spread: features.ema21Spread.toFixed(4),
      ema50Spread: features.ema50Spread.toFixed(4),
      ema200Spread: features.ema200Spread.toFixed(4),
      ema9Over21: features.ema9Over21 > 0,
      ema50Over200: features.ema50Over200 > 0,
      bbPosition: features.bbPosition.toFixed(4),
      bbWidth: features.bbWidth.toFixed(4),
      volumeDeltaNorm: features.volumeDeltaNorm.toFixed(4),
      spikeScoreNorm: features.spikeScoreNorm.toFixed(4),
      volatilityNorm: features.volatilityNorm.toFixed(4),
      distanceToSupport: features.distanceToSupport.toFixed(4),
      distanceToResistance: features.distanceToResistance.toFixed(4),
      priceChangePercent: priceChangePercent.toFixed(4),
      isWin
    });
    console.log(`[ML] Extracted features for prediction ${predictionId} horizon ${horizon}`);
  }
  normalizeIndicators(indicators, price) {
    const rsi = this.safeNumber(indicators.rsi, 50);
    const macdHistogram = this.safeNumber(indicators.macd?.histogram, 0);
    const macdValue = this.safeNumber(indicators.macd?.value, 0);
    const macdSignalLine = this.safeNumber(indicators.macd?.signal, 0);
    const ema9 = this.safeNumber(indicators.ema9, price);
    const ema21 = this.safeNumber(indicators.ema21, price);
    const ema50 = this.safeNumber(indicators.ema50, price);
    const ema200 = this.safeNumber(indicators.ema200, price);
    const bbUpper = this.safeNumber(indicators.bollingerBands?.upper, price * 1.02);
    const bbLower = this.safeNumber(indicators.bollingerBands?.lower, price * 0.98);
    const bbMiddle = this.safeNumber(indicators.bollingerBands?.middle, price);
    const volumeDeltaValue = typeof indicators.volumeDelta === "object" ? this.safeNumber(indicators.volumeDelta?.delta, 0) : this.safeNumber(indicators.volumeDelta, 0);
    const spikeScoreValue = typeof indicators.spikeScore === "object" ? this.safeNumber(indicators.spikeScore?.score, 0) : this.safeNumber(indicators.spikeScore, 0);
    const volatility = this.safeNumber(indicators.volatility, 0);
    const support = this.safeNumber(indicators.support, price * 0.95);
    const resistance = this.safeNumber(indicators.resistance, price * 1.05);
    const bbRange = bbUpper - bbLower;
    const bbPositionRaw = bbRange > 0 ? (price - bbMiddle) / (bbRange / 2) : 0;
    return {
      rsiNormalized: this.safeNumber(rsi / 100, 0.5),
      macdSignal: macdHistogram > 0 ? 1 : macdHistogram < 0 ? -1 : 0,
      macdStrength: price > 0 ? Math.min(Math.abs(macdValue - macdSignalLine) / price * 100, 1) : 0,
      ema9Spread: this.clamp((price - ema9) / (price || 1) * 100, -10, 10) / 10,
      ema21Spread: this.clamp((price - ema21) / (price || 1) * 100, -10, 10) / 10,
      ema50Spread: this.clamp((price - ema50) / (price || 1) * 100, -20, 20) / 20,
      ema200Spread: this.clamp((price - ema200) / (price || 1) * 100, -50, 50) / 50,
      ema9Over21: ema9 > ema21 ? 1 : 0,
      ema50Over200: ema50 > ema200 ? 1 : 0,
      bbPosition: this.clamp(bbPositionRaw, -1, 1),
      bbWidth: bbMiddle > 0 ? Math.min(bbRange / bbMiddle, 0.2) / 0.2 : 0,
      volumeDeltaNorm: this.clamp(volumeDeltaValue / 100, -1, 1),
      spikeScoreNorm: Math.min(Math.max(spikeScoreValue / 100, 0), 1),
      volatilityNorm: Math.min(Math.max(volatility / 10, 0), 1),
      distanceToSupport: this.clamp((price - support) / (price || 1) * 100, 0, 20) / 20,
      distanceToResistance: this.clamp((resistance - price) / (price || 1) * 100, 0, 20) / 20
    };
  }
  safeNumber(value, defaultValue) {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  async getTrainingData(horizon) {
    const features = await db.select().from(predictionFeatures).where(and(
      eq(predictionFeatures.horizon, horizon),
      isNotNull(predictionFeatures.isWin)
    ));
    const featureVectors = [];
    const labels = [];
    for (const f of features) {
      const vector = [
        parseFloat(f.rsiNormalized || "0.5"),
        parseFloat(f.macdSignal || "0"),
        parseFloat(f.macdStrength || "0"),
        parseFloat(f.ema9Spread || "0"),
        parseFloat(f.ema21Spread || "0"),
        parseFloat(f.ema50Spread || "0"),
        parseFloat(f.ema200Spread || "0"),
        f.ema9Over21 ? 1 : 0,
        f.ema50Over200 ? 1 : 0,
        parseFloat(f.bbPosition || "0"),
        parseFloat(f.bbWidth || "0"),
        parseFloat(f.volumeDeltaNorm || "0"),
        parseFloat(f.spikeScoreNorm || "0"),
        parseFloat(f.volatilityNorm || "0"),
        parseFloat(f.distanceToSupport || "0"),
        parseFloat(f.distanceToResistance || "0")
      ];
      featureVectors.push(vector);
      labels.push(f.isWin ? 1 : 0);
    }
    return { features: featureVectors, labels, featureNames: FEATURE_NAMES };
  }
  async trainModel(horizon) {
    console.log(`[ML] Starting model training for horizon ${horizon}`);
    const data = await this.getTrainingData(horizon);
    if (data.features.length < MIN_TRAINING_SAMPLES) {
      return {
        success: false,
        error: `Insufficient data: ${data.features.length}/${MIN_TRAINING_SAMPLES} samples`
      };
    }
    const splitIndex = Math.floor(data.features.length * 0.8);
    const indices = this.shuffleArray([...Array(data.features.length).keys()]);
    const trainIndices = indices.slice(0, splitIndex);
    const valIndices = indices.slice(splitIndex);
    const trainX = trainIndices.map((i) => data.features[i]);
    const trainY = trainIndices.map((i) => data.labels[i]);
    const valX = valIndices.map((i) => data.features[i]);
    const valY = valIndices.map((i) => data.labels[i]);
    const coefficients = this.trainLogisticRegression(trainX, trainY, 0.01, 1e3);
    const metrics = this.evaluateModel(coefficients, valX, valY);
    const existingModels = await db.select().from(predictionModelVersions).where(eq(predictionModelVersions.horizon, horizon)).orderBy(desc(predictionModelVersions.version)).limit(1);
    const newVersion = existingModels.length > 0 ? existingModels[0].version + 1 : 1;
    const modelId = `model_${horizon}_v${newVersion}_${randomBytes(4).toString("hex")}`;
    await db.insert(predictionModelVersions).values({
      id: modelId,
      modelName: "logistic_v1",
      horizon,
      version: newVersion,
      coefficients: JSON.stringify(coefficients),
      featureNames: JSON.stringify(FEATURE_NAMES),
      trainingSamples: trainX.length,
      validationSamples: valX.length,
      trainingDateRange: JSON.stringify({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString(),
        end: (/* @__PURE__ */ new Date()).toISOString()
      }),
      accuracy: metrics.accuracy.toFixed(4),
      precision: metrics.precision.toFixed(4),
      recall: metrics.recall.toFixed(4),
      f1Score: metrics.f1Score.toFixed(4),
      auroc: metrics.auroc.toFixed(4),
      status: "validated",
      isActive: false
    });
    console.log(`[ML] Model ${modelId} trained - Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%`);
    if (metrics.accuracy >= 0.55) {
      await this.activateModel(modelId, horizon);
    }
    return { success: true, modelId, metrics };
  }
  trainLogisticRegression(X, y, learningRate, iterations) {
    const numFeatures = X[0].length;
    let weights = new Array(numFeatures).fill(0);
    let intercept = 0;
    for (let iter = 0; iter < iterations; iter++) {
      let interceptGrad = 0;
      const weightGrads = new Array(numFeatures).fill(0);
      for (let i = 0; i < X.length; i++) {
        const z = intercept + X[i].reduce((sum, x, j) => sum + x * weights[j], 0);
        const pred = this.sigmoid(z);
        const error = pred - y[i];
        interceptGrad += error;
        for (let j = 0; j < numFeatures; j++) {
          weightGrads[j] += error * X[i][j];
        }
      }
      intercept -= learningRate * (interceptGrad / X.length);
      for (let j = 0; j < numFeatures; j++) {
        weights[j] -= learningRate * (weightGrads[j] / X.length);
      }
    }
    const weightObj = {};
    FEATURE_NAMES.forEach((name, i) => {
      weightObj[name] = weights[i];
    });
    return { intercept, weights: weightObj };
  }
  sigmoid(z) {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
  }
  evaluateModel(coefficients, X, y) {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    const predictions = [];
    for (let i = 0; i < X.length; i++) {
      const prob = this.predictProbability(coefficients, X[i]);
      predictions.push(prob);
      const pred = prob >= 0.5 ? 1 : 0;
      if (pred === 1 && y[i] === 1) tp++;
      else if (pred === 1 && y[i] === 0) fp++;
      else if (pred === 0 && y[i] === 0) tn++;
      else fn++;
    }
    const accuracy = (tp + tn) / (tp + tn + fp + fn);
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1Score = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
    const auroc = this.calculateAUROC(predictions, y);
    return { accuracy, precision, recall, f1Score, auroc };
  }
  calculateAUROC(predictions, labels) {
    const pairs = predictions.map((p, i) => ({ pred: p, label: labels[i] }));
    pairs.sort((a, b) => b.pred - a.pred);
    let auc = 0;
    let tp = 0;
    const totalPos = labels.filter((l) => l === 1).length;
    const totalNeg = labels.length - totalPos;
    if (totalPos === 0 || totalNeg === 0) return 0.5;
    for (const pair of pairs) {
      if (pair.label === 1) {
        tp++;
      } else {
        auc += tp;
      }
    }
    return auc / (totalPos * totalNeg);
  }
  predictProbability(coefficients, features) {
    let z = coefficients.intercept;
    FEATURE_NAMES.forEach((name, i) => {
      z += features[i] * (coefficients.weights[name] || 0);
    });
    return this.sigmoid(z);
  }
  async activateModel(modelId, horizon) {
    await db.update(predictionModelVersions).set({ isActive: false }).where(and(
      eq(predictionModelVersions.horizon, horizon),
      eq(predictionModelVersions.isActive, true)
    ));
    await db.update(predictionModelVersions).set({ isActive: true, status: "active", activatedAt: /* @__PURE__ */ new Date() }).where(eq(predictionModelVersions.id, modelId));
    this.modelCache.delete(horizon);
    console.log(`[ML] Activated model ${modelId} for horizon ${horizon}`);
  }
  async getActiveModel(horizon) {
    if (this.modelCache.has(horizon)) {
      return this.modelCache.get(horizon);
    }
    const model = await db.select().from(predictionModelVersions).where(and(
      eq(predictionModelVersions.horizon, horizon),
      eq(predictionModelVersions.isActive, true)
    )).limit(1);
    if (!model.length) return null;
    const cached = {
      coefficients: JSON.parse(model[0].coefficients),
      version: model[0].id
    };
    this.modelCache.set(horizon, cached);
    return cached;
  }
  async predictWithModel(indicators, price, horizon = "24h") {
    const model = await this.getActiveModel(horizon);
    if (!model) {
      return {
        probability: 0.5,
        confidence: "LOW",
        signal: "HOLD",
        modelVersion: "none",
        isModelBased: false
      };
    }
    const features = this.normalizeIndicators(indicators, price);
    const featureVector = FEATURE_NAMES.map((name) => features[name]);
    const probability = this.predictProbability(model.coefficients, featureVector);
    let signal;
    let confidence;
    if (probability >= 0.7) {
      signal = "BUY";
      confidence = "HIGH";
    } else if (probability >= 0.6) {
      signal = "BUY";
      confidence = "MEDIUM";
    } else if (probability <= 0.3) {
      signal = "SELL";
      confidence = "HIGH";
    } else if (probability <= 0.4) {
      signal = "SELL";
      confidence = "MEDIUM";
    } else {
      signal = "HOLD";
      confidence = probability >= 0.45 && probability <= 0.55 ? "MEDIUM" : "LOW";
    }
    return {
      probability,
      confidence,
      signal,
      modelVersion: model.version,
      isModelBased: true
    };
  }
  async getModelStatus() {
    const horizons = ["1h", "4h", "24h", "7d"];
    const result = { horizons: {}, totalFeatures: 0, readyToTrain: {} };
    for (const horizon of horizons) {
      const model = await db.select().from(predictionModelVersions).where(and(
        eq(predictionModelVersions.horizon, horizon),
        eq(predictionModelVersions.isActive, true)
      )).limit(1);
      const featureCount = await db.select({ count: sql`count(*)` }).from(predictionFeatures).where(and(
        eq(predictionFeatures.horizon, horizon),
        isNotNull(predictionFeatures.isWin)
      ));
      const count = Number(featureCount[0]?.count || 0);
      result.totalFeatures += count;
      result.readyToTrain[horizon] = count >= MIN_TRAINING_SAMPLES;
      if (model.length) {
        result.horizons[horizon] = {
          hasActiveModel: true,
          modelVersion: model[0].id,
          accuracy: parseFloat(model[0].accuracy),
          trainingSamples: model[0].trainingSamples,
          trainedAt: model[0].trainedAt?.toISOString()
        };
      } else {
        result.horizons[horizon] = {
          hasActiveModel: false
        };
      }
    }
    return result;
  }
  async trainAllHorizons() {
    const horizons = ["1h", "4h", "24h", "7d"];
    const results = {};
    for (const horizon of horizons) {
      const result = await this.trainModel(horizon);
      results[horizon] = {
        success: result.success,
        error: result.error,
        accuracy: result.metrics?.accuracy
      };
    }
    return results;
  }
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  async detectDrift(horizon, windowDays = 7) {
    const now = /* @__PURE__ */ new Date();
    const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1e3);
    const historicalStart = new Date(windowStart.getTime() - windowDays * 24 * 60 * 60 * 1e3);
    const recentFeatures = await db.select().from(predictionFeatures).where(and(
      eq(predictionFeatures.horizon, horizon),
      isNotNull(predictionFeatures.isWin),
      gte(predictionFeatures.createdAt, windowStart)
    ));
    const historicalFeatures = await db.select().from(predictionFeatures).where(and(
      eq(predictionFeatures.horizon, horizon),
      isNotNull(predictionFeatures.isWin),
      gte(predictionFeatures.createdAt, historicalStart),
      lte(predictionFeatures.createdAt, windowStart)
    ));
    const recentWins = recentFeatures.filter((f) => f.isWin).length;
    const recentTotal = recentFeatures.length;
    const historicalWins = historicalFeatures.filter((f) => f.isWin).length;
    const historicalTotal = historicalFeatures.length;
    const recentAccuracy = recentTotal > 0 ? recentWins / recentTotal * 100 : 50;
    const historicalAccuracy = historicalTotal > 0 ? historicalWins / historicalTotal * 100 : 50;
    const accuracyDrop = historicalAccuracy - recentAccuracy;
    let severity = "LOW";
    let hasDrift = false;
    let recommendation = "Model performing within expected parameters";
    if (accuracyDrop > 5 && recentTotal >= 10) {
      hasDrift = true;
      if (accuracyDrop > 20) {
        severity = "CRITICAL";
        recommendation = "Immediate retraining required - significant performance degradation detected";
      } else if (accuracyDrop > 15) {
        severity = "HIGH";
        recommendation = "Schedule retraining soon - notable performance decline";
      } else if (accuracyDrop > 10) {
        severity = "MEDIUM";
        recommendation = "Monitor closely - moderate performance decline observed";
      } else {
        severity = "LOW";
        recommendation = "Minor drift detected - continue monitoring";
      }
    }
    if (recentAccuracy < 45 && recentTotal >= 10) {
      hasDrift = true;
      severity = severity === "CRITICAL" ? "CRITICAL" : "HIGH";
      recommendation = "Model accuracy below threshold - retraining recommended";
    }
    return {
      hasDrift,
      severity,
      metrics: {
        recentAccuracy: Math.round(recentAccuracy * 10) / 10,
        historicalAccuracy: Math.round(historicalAccuracy * 10) / 10,
        accuracyDrop: Math.round(accuracyDrop * 10) / 10,
        recentSamples: recentTotal,
        historicalSamples: historicalTotal
      },
      recommendation
    };
  }
  async checkAllHorizonsDrift(windowDays = 7) {
    const horizons = ["1h", "4h", "24h", "7d"];
    const results = { hasAnyDrift: false, horizonStatus: {}, overallRecommendation: "" };
    let highestSeverity = "LOW";
    for (const horizon of horizons) {
      const drift = await this.detectDrift(horizon, windowDays);
      results.horizonStatus[horizon] = {
        hasDrift: drift.hasDrift,
        severity: drift.severity,
        recentAccuracy: drift.metrics.recentAccuracy,
        recommendation: drift.recommendation
      };
      if (drift.hasDrift) {
        results.hasAnyDrift = true;
        if (drift.severity === "CRITICAL" || drift.severity === "HIGH" && highestSeverity !== "CRITICAL") {
          highestSeverity = drift.severity;
        }
      }
    }
    if (highestSeverity === "CRITICAL") {
      results.overallRecommendation = "Immediate action needed: Critical drift detected in one or more models";
    } else if (highestSeverity === "HIGH") {
      results.overallRecommendation = "Schedule retraining: High drift detected";
    } else if (results.hasAnyDrift) {
      results.overallRecommendation = "Monitor: Minor drift detected in some models";
    } else {
      results.overallRecommendation = "All models performing within expected parameters";
    }
    return results;
  }
}
const predictionLearningService = new PredictionLearningService();

var predictionLearningService$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  predictionLearningService: predictionLearningService
});

const technicalAnalysisTool = createTool({
  id: "technical-analysis-tool",
  description: "Performs comprehensive technical analysis on price data. Calculates RSI, MACD, moving averages, Bollinger Bands, support/resistance levels, and generates buy/sell signals.",
  inputSchema: z.object({
    ticker: z.string().describe("Ticker symbol"),
    currentPrice: z.number().describe("Current market price"),
    priceChange24h: z.number().describe("24h price change in dollars"),
    priceChangePercent24h: z.number().describe("24h price change percentage"),
    volume24h: z.number().optional().describe("24h trading volume"),
    prices: z.array(z.object({
      timestamp: z.number(),
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
      volume: z.number()
    })).describe("Historical OHLCV data")
  }),
  outputSchema: z.object({
    ticker: z.string(),
    currentPrice: z.number(),
    priceChange24h: z.number(),
    priceChangePercent24h: z.number(),
    rsi: z.number(),
    macd: z.object({
      value: z.number(),
      signal: z.number(),
      histogram: z.number()
    }),
    ema9: z.number(),
    ema21: z.number(),
    ema50: z.number(),
    ema200: z.number(),
    sma50: z.number(),
    sma200: z.number(),
    bollingerBands: z.object({
      upper: z.number(),
      middle: z.number(),
      lower: z.number(),
      bandwidth: z.number()
    }),
    support: z.number(),
    resistance: z.number(),
    volume: z.object({
      current: z.number(),
      average: z.number(),
      changePercent: z.number()
    }),
    volumeDelta: z.object({
      buyVolume: z.number(),
      sellVolume: z.number(),
      delta: z.number(),
      buySellRatio: z.number()
    }),
    spikeScore: z.object({
      score: z.number(),
      signal: z.enum(["SPIKE_SIGNAL", "WATCHLIST", "NO_SIGNAL"]),
      prediction: z.string()
    }),
    volatility: z.number(),
    patternDuration: z.object({
      estimate: z.string(),
      confidence: z.string(),
      type: z.string()
    }),
    signals: z.array(z.string()),
    recommendation: z.enum(["BUY", "SELL", "HOLD", "STRONG_BUY", "STRONG_SELL"]),
    signalCount: z.object({
      bullish: z.number(),
      bearish: z.number()
    })
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F527} [TechnicalAnalysisTool] Starting analysis", { ticker: context.ticker });
    const userId = runtimeContext?.resourceId || "unknown";
    const limitCheck = await checkSubscriptionLimit(userId);
    logger?.info("\u{1F510} [TechnicalAnalysisTool] Subscription check result", { userId, allowed: limitCheck.allowed, isPremium: limitCheck.isPremium });
    if (!limitCheck.allowed) {
      logger?.warn("\u26A0\uFE0F [TechnicalAnalysisTool] Usage limit exceeded", { userId, message: limitCheck.message });
      throw new Error(limitCheck.message || "Daily search limit reached. Upgrade to Premium for unlimited access!");
    }
    const closePrices = context.prices.map((p) => p.close);
    context.prices.map((p) => p.high);
    context.prices.map((p) => p.low);
    const volumes = context.prices.map((p) => p.volume);
    logger?.info("\u{1F4CA} [TechnicalAnalysisTool] Calculating indicators", { dataPoints: closePrices.length });
    const rsiValues = RSI.calculate({ values: closePrices, period: 14 });
    const currentRSI = rsiValues[rsiValues.length - 1] || 50;
    const macdValues = MACD.calculate({
      values: closePrices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    });
    const currentMACD = macdValues[macdValues.length - 1] || { MACD: 0, signal: 0, histogram: 0 };
    const ema9Values = EMA.calculate({ values: closePrices, period: 9 });
    const ema21Values = EMA.calculate({ values: closePrices, period: 21 });
    const ema50Values = EMA.calculate({ values: closePrices, period: 50 });
    const ema200Values = EMA.calculate({ values: closePrices, period: 200 });
    const currentEMA9 = ema9Values[ema9Values.length - 1] || context.currentPrice;
    const currentEMA21 = ema21Values[ema21Values.length - 1] || context.currentPrice;
    const currentEMA50 = ema50Values[ema50Values.length - 1] || context.currentPrice;
    const currentEMA200 = ema200Values[ema200Values.length - 1] || context.currentPrice;
    const sma50Values = SMA.calculate({ values: closePrices, period: 50 });
    const sma200Values = SMA.calculate({ values: closePrices, period: 200 });
    const currentSMA50 = sma50Values[sma50Values.length - 1] || context.currentPrice;
    const currentSMA200 = sma200Values[sma200Values.length - 1] || context.currentPrice;
    const bbValues = BollingerBands.calculate({
      values: closePrices,
      period: 20,
      stdDev: 2
    });
    const currentBB = bbValues[bbValues.length - 1] || { upper: 0, middle: 0, lower: 0 };
    const bandwidth = (currentBB.upper - currentBB.lower) / currentBB.middle * 100;
    const recentPrices = context.prices.slice(-30);
    const support = calculateDynamicSupport(recentPrices, context.currentPrice);
    const resistance = calculateDynamicResistance(recentPrices, context.currentPrice);
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const currentVolume = context.volume24h || volumes[volumes.length - 1] || 0;
    const volumeChangePercent = (currentVolume - avgVolume) / avgVolume * 100;
    const volatility = calculateVolatility(closePrices.slice(-30));
    const volumeDelta = calculateVolumeDelta(
      context.prices.slice(-20));
    const spikeScore = calculateSpikeScore({
      volumeDelta: volumeDelta.delta,
      rsi: currentRSI,
      momentum: context.priceChangePercent24h,
      volumeChange: volumeChangePercent,
      trendStrength: Math.abs(currentEMA50 - currentEMA200) / context.currentPrice * 100
    });
    const patternDuration = estimatePatternDuration(
      context.prices,
      currentRSI,
      currentMACD,
      volumeChangePercent,
      context.currentPrice,
      currentEMA50,
      currentEMA200
    );
    logger?.info("\u{1F4DD} [TechnicalAnalysisTool] Generating signals");
    const signals = [];
    let bullishCount = 0;
    let bearishCount = 0;
    if (currentRSI < 30) {
      signals.push("RSI oversold (bullish)");
      bullishCount++;
    } else if (currentRSI > 70) {
      signals.push("RSI overbought (bearish)");
      bearishCount++;
    }
    if (currentMACD.histogram && currentMACD.MACD && currentMACD.signal) {
      if (currentMACD.histogram > 0 && currentMACD.MACD > currentMACD.signal) {
        signals.push("MACD bullish crossover");
        bullishCount++;
      } else if (currentMACD.histogram < 0 && currentMACD.MACD < currentMACD.signal) {
        signals.push("MACD bearish crossover");
        bearishCount++;
      }
    }
    if (context.currentPrice > currentEMA50 && currentEMA50 > currentEMA200) {
      signals.push("Golden cross pattern (bullish)");
      bullishCount++;
    } else if (context.currentPrice < currentEMA50 && currentEMA50 < currentEMA200) {
      signals.push("Death cross pattern (bearish)");
      bearishCount++;
    }
    if (context.currentPrice > currentSMA50) {
      bullishCount++;
    } else {
      bearishCount++;
    }
    if (context.currentPrice > currentSMA200) {
      bullishCount++;
    } else {
      bearishCount++;
    }
    if (context.currentPrice < currentBB.lower) {
      signals.push("Price below lower Bollinger Band (bullish)");
      bullishCount++;
    } else if (context.currentPrice > currentBB.upper) {
      signals.push("Price above upper Bollinger Band (bearish)");
      bearishCount++;
    }
    const distanceToSupport = (context.currentPrice - support) / support * 100;
    const distanceToResistance = (resistance - context.currentPrice) / context.currentPrice * 100;
    if (distanceToSupport < 2) {
      signals.push("Near support level (potential bounce)");
      bullishCount++;
    }
    if (distanceToResistance < 2) {
      signals.push("Near resistance level (potential rejection)");
      bearishCount++;
    }
    if (volumeChangePercent > 50 && context.priceChangePercent24h > 0) {
      signals.push("High volume breakout (bullish)");
      bullishCount++;
    } else if (volumeChangePercent > 50 && context.priceChangePercent24h < 0) {
      signals.push("High volume selloff (bearish)");
      bearishCount++;
    }
    let recommendation;
    const netSignal = bullishCount - bearishCount;
    let ruleBasedRec;
    if (netSignal >= 3) {
      ruleBasedRec = "STRONG_BUY";
    } else if (netSignal >= 1) {
      ruleBasedRec = "BUY";
    } else if (netSignal <= -3) {
      ruleBasedRec = "STRONG_SELL";
    } else if (netSignal <= -1) {
      ruleBasedRec = "SELL";
    } else {
      ruleBasedRec = "HOLD";
    }
    let isModelBased = false;
    let modelProbability = 0.5;
    try {
      const indicators = {
        rsi: currentRSI,
        macd: { macdLine: currentMACD.MACD, signalLine: currentMACD.signal, histogram: currentMACD.histogram },
        ema9: currentEMA9,
        ema21: currentEMA21,
        ema50: currentEMA50,
        ema200: currentEMA200,
        bollingerBands: { upper: currentBB.upper, middle: currentBB.middle, lower: currentBB.lower },
        support,
        resistance,
        volumeDelta: volumeDelta.delta,
        spikeScore: spikeScore.score,
        volatility
      };
      const mlPrediction = await predictionLearningService.predictWithModel(indicators, context.currentPrice, "24h");
      if (mlPrediction.isModelBased) {
        isModelBased = true;
        modelProbability = mlPrediction.probability;
        const mlSignal = mlPrediction.signal;
        const mlConfidence = mlPrediction.confidence;
        if (mlConfidence === "HIGH") {
          if (mlSignal === "BUY" && (ruleBasedRec === "BUY" || ruleBasedRec === "STRONG_BUY")) {
            recommendation = modelProbability >= 0.75 ? "STRONG_BUY" : "BUY";
            signals.push(`ML model: ${(modelProbability * 100).toFixed(0)}% bullish probability (HIGH confidence)`);
          } else if (mlSignal === "SELL" && (ruleBasedRec === "SELL" || ruleBasedRec === "STRONG_SELL")) {
            recommendation = modelProbability <= 0.25 ? "STRONG_SELL" : "SELL";
            signals.push(`ML model: ${((1 - modelProbability) * 100).toFixed(0)}% bearish probability (HIGH confidence)`);
          } else if (mlSignal !== ruleBasedRec && mlConfidence === "HIGH") {
            recommendation = mlSignal;
            signals.push(`ML model override: ${mlSignal} (${(mlPrediction.probability * 100).toFixed(0)}% probability)`);
          } else {
            recommendation = ruleBasedRec;
          }
        } else if (mlConfidence === "MEDIUM") {
          if (mlSignal === ruleBasedRec || mlSignal === "BUY" && ruleBasedRec === "STRONG_BUY" || mlSignal === "SELL" && ruleBasedRec === "STRONG_SELL") {
            recommendation = ruleBasedRec;
            signals.push(`ML model confirms: ${(modelProbability * 100).toFixed(0)}% probability`);
          } else {
            recommendation = "HOLD";
            signals.push(`ML model uncertain: ${(modelProbability * 100).toFixed(0)}% probability vs rule-based ${ruleBasedRec}`);
          }
        } else {
          recommendation = ruleBasedRec;
        }
        logger?.info("\u{1F9E0} [TechnicalAnalysisTool] ML prediction used", {
          mlSignal,
          mlConfidence,
          probability: modelProbability,
          ruleBasedRec,
          finalRec: recommendation
        });
      } else {
        recommendation = ruleBasedRec;
      }
    } catch (mlError) {
      logger?.warn("\u26A0\uFE0F [TechnicalAnalysisTool] ML prediction failed, using rule-based", { error: mlError });
      recommendation = ruleBasedRec;
    }
    logger?.info("\u2705 [TechnicalAnalysisTool] Analysis complete", {
      ticker: context.ticker,
      recommendation,
      isModelBased,
      signals: signals.length
    });
    return {
      ticker: context.ticker,
      currentPrice: context.currentPrice,
      priceChange24h: context.priceChange24h,
      priceChangePercent24h: context.priceChangePercent24h,
      rsi: parseFloat(currentRSI.toFixed(1)),
      macd: {
        value: parseFloat((currentMACD.MACD || 0).toFixed(2)),
        signal: parseFloat((currentMACD.signal || 0).toFixed(2)),
        histogram: parseFloat((currentMACD.histogram || 0).toFixed(2))
      },
      ema9: parseFloat(currentEMA9.toFixed(2)),
      ema21: parseFloat(currentEMA21.toFixed(2)),
      ema50: parseFloat(currentEMA50.toFixed(2)),
      ema200: parseFloat(currentEMA200.toFixed(2)),
      sma50: parseFloat(currentSMA50.toFixed(2)),
      sma200: parseFloat(currentSMA200.toFixed(2)),
      bollingerBands: {
        upper: parseFloat(currentBB.upper.toFixed(2)),
        middle: parseFloat(currentBB.middle.toFixed(2)),
        lower: parseFloat(currentBB.lower.toFixed(2)),
        bandwidth: parseFloat(bandwidth.toFixed(2))
      },
      support: parseFloat(support.toFixed(2)),
      resistance: parseFloat(resistance.toFixed(2)),
      volume: {
        current: parseFloat(currentVolume.toFixed(2)),
        average: parseFloat(avgVolume.toFixed(2)),
        changePercent: parseFloat(volumeChangePercent.toFixed(1))
      },
      volumeDelta: {
        buyVolume: parseFloat(volumeDelta.buyVolume.toFixed(2)),
        sellVolume: parseFloat(volumeDelta.sellVolume.toFixed(2)),
        delta: parseFloat(volumeDelta.delta.toFixed(2)),
        buySellRatio: parseFloat(volumeDelta.buySellRatio.toFixed(2))
      },
      spikeScore: {
        score: parseFloat(spikeScore.score.toFixed(1)),
        signal: spikeScore.signal,
        prediction: spikeScore.prediction
      },
      volatility: parseFloat(volatility.toFixed(1)),
      patternDuration,
      signals,
      recommendation,
      signalCount: {
        bullish: bullishCount,
        bearish: bearishCount
      }
    };
  }
});
function calculateDynamicSupport(recentPrices, currentPrice) {
  const lows = recentPrices.map((p) => p.low);
  const sortedLows = [...lows].sort((a, b) => a - b);
  const belowCurrent = sortedLows.filter((low) => low < currentPrice);
  if (belowCurrent.length === 0) return sortedLows[0];
  return belowCurrent[belowCurrent.length - 1];
}
function calculateDynamicResistance(recentPrices, currentPrice) {
  const highs = recentPrices.map((p) => p.high);
  const sortedHighs = [...highs].sort((a, b) => b - a);
  const aboveCurrent = sortedHighs.filter((high) => high > currentPrice);
  if (aboveCurrent.length === 0) return sortedHighs[0];
  return aboveCurrent[aboveCurrent.length - 1];
}
function calculateVolatility(prices) {
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  return stdDev * 100;
}
function estimatePatternDuration(prices, currentRSI, currentMACD, volumeChange, currentPrice, ema50, ema200) {
  const closePrices = prices.map((p) => p.close);
  let patternType = "consolidation";
  let estimatedDays = 0;
  let confidence = "low";
  if (currentRSI < 30) {
    const oversoldDurations = analyzeOversoldRecoveries(closePrices);
    estimatedDays = oversoldDurations.avgDuration;
    confidence = oversoldDurations.confidence;
    patternType = "potential rally from oversold";
  } else if (currentRSI > 70) {
    const overboughtDurations = analyzeOverboughtCorrections(closePrices);
    estimatedDays = overboughtDurations.avgDuration;
    confidence = overboughtDurations.confidence;
    patternType = "potential correction from overbought";
  } else if (currentMACD.histogram && Math.abs(currentMACD.histogram) > 0) {
    const macdDurations = analyzeMACDMomentum(closePrices);
    estimatedDays = macdDurations.avgDuration;
    confidence = macdDurations.confidence;
    if (currentMACD.histogram > 0) {
      patternType = "bullish momentum continuation";
    } else {
      patternType = "bearish momentum continuation";
    }
  } else if (currentPrice > ema50 && ema50 > ema200) {
    const trendDurations = analyzeUptrends(closePrices);
    estimatedDays = trendDurations.avgDuration;
    confidence = trendDurations.confidence;
    patternType = "uptrend continuation";
  } else if (currentPrice < ema50 && ema50 < ema200) {
    const trendDurations = analyzeDowntrends(closePrices);
    estimatedDays = trendDurations.avgDuration;
    confidence = trendDurations.confidence;
    patternType = "downtrend continuation";
  } else if (volumeChange > 50) {
    estimatedDays = 5;
    confidence = "medium";
    patternType = "volume breakout pattern";
  } else {
    estimatedDays = 7;
    confidence = "low";
    patternType = "consolidation/range-bound";
  }
  let estimate = "";
  if (estimatedDays < 2) {
    estimate = "1-2 days";
  } else if (estimatedDays < 7) {
    estimate = `${Math.floor(estimatedDays)}-${Math.ceil(estimatedDays + 2)} days`;
  } else if (estimatedDays < 14) {
    estimate = "1-2 weeks";
  } else if (estimatedDays < 30) {
    estimate = "2-4 weeks";
  } else {
    estimate = "1-2 months";
  }
  return {
    estimate,
    confidence,
    type: patternType
  };
}
function analyzeOversoldRecoveries(closePrices, prices) {
  const rsiValues = RSI.calculate({ values: closePrices, period: 14 });
  const recoveries = [];
  let inOversold = false;
  let oversoldStart = 0;
  for (let i = 0; i < rsiValues.length; i++) {
    if (rsiValues[i] < 30 && !inOversold) {
      inOversold = true;
      oversoldStart = i;
    } else if (rsiValues[i] >= 50 && inOversold) {
      const duration = i - oversoldStart;
      if (duration > 0 && duration < 60) {
        recoveries.push(duration);
      }
      inOversold = false;
    }
  }
  if (recoveries.length >= 3) {
    const avg = recoveries.reduce((a, b) => a + b, 0) / recoveries.length;
    return { avgDuration: Math.round(avg), confidence: "high" };
  } else if (recoveries.length > 0) {
    const avg = recoveries.reduce((a, b) => a + b, 0) / recoveries.length;
    return { avgDuration: Math.round(avg), confidence: "medium" };
  }
  return { avgDuration: 5, confidence: "low" };
}
function analyzeOverboughtCorrections(closePrices, prices) {
  const rsiValues = RSI.calculate({ values: closePrices, period: 14 });
  const corrections = [];
  let inOverbought = false;
  let overboughtStart = 0;
  for (let i = 0; i < rsiValues.length; i++) {
    if (rsiValues[i] > 70 && !inOverbought) {
      inOverbought = true;
      overboughtStart = i;
    } else if (rsiValues[i] <= 50 && inOverbought) {
      const duration = i - overboughtStart;
      if (duration > 0 && duration < 60) {
        corrections.push(duration);
      }
      inOverbought = false;
    }
  }
  if (corrections.length >= 3) {
    const avg = corrections.reduce((a, b) => a + b, 0) / corrections.length;
    return { avgDuration: Math.round(avg), confidence: "high" };
  } else if (corrections.length > 0) {
    const avg = corrections.reduce((a, b) => a + b, 0) / corrections.length;
    return { avgDuration: Math.round(avg), confidence: "medium" };
  }
  return { avgDuration: 7, confidence: "low" };
}
function analyzeMACDMomentum(closePrices, prices) {
  const macdValues = MACD.calculate({
    values: closePrices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });
  const momentumPeriods = [];
  let currentSign = 0;
  let periodStart = 0;
  for (let i = 0; i < macdValues.length; i++) {
    const hist = macdValues[i].histogram || 0;
    const sign = hist > 0 ? 1 : hist < 0 ? -1 : 0;
    if (sign !== currentSign && currentSign !== 0) {
      const duration = i - periodStart;
      if (duration > 0 && duration < 60) {
        momentumPeriods.push(duration);
      }
      periodStart = i;
    }
    currentSign = sign;
  }
  if (momentumPeriods.length >= 3) {
    const avg = momentumPeriods.reduce((a, b) => a + b, 0) / momentumPeriods.length;
    return { avgDuration: Math.round(avg), confidence: "high" };
  } else if (momentumPeriods.length > 0) {
    const avg = momentumPeriods.reduce((a, b) => a + b, 0) / momentumPeriods.length;
    return { avgDuration: Math.round(avg), confidence: "medium" };
  }
  return { avgDuration: 8, confidence: "low" };
}
function analyzeUptrends(closePrices, prices) {
  const ema50 = EMA.calculate({ values: closePrices, period: 50 });
  const trends = [];
  let inUptrend = false;
  let trendStart = 0;
  for (let i = 50; i < closePrices.length; i++) {
    const idx = i - 50;
    if (idx >= ema50.length) continue;
    const priceAboveEMA = closePrices[i] > ema50[idx];
    if (priceAboveEMA && !inUptrend) {
      inUptrend = true;
      trendStart = i;
    } else if (!priceAboveEMA && inUptrend) {
      const duration = i - trendStart;
      if (duration > 0 && duration < 90) {
        trends.push(duration);
      }
      inUptrend = false;
    }
  }
  if (trends.length >= 2) {
    const avg = trends.reduce((a, b) => a + b, 0) / trends.length;
    return { avgDuration: Math.round(avg), confidence: "medium" };
  }
  return { avgDuration: 14, confidence: "low" };
}
function analyzeDowntrends(closePrices, prices) {
  const ema50 = EMA.calculate({ values: closePrices, period: 50 });
  const trends = [];
  let inDowntrend = false;
  let trendStart = 0;
  for (let i = 50; i < closePrices.length; i++) {
    const idx = i - 50;
    if (idx >= ema50.length) continue;
    const priceBelowEMA = closePrices[i] < ema50[idx];
    if (priceBelowEMA && !inDowntrend) {
      inDowntrend = true;
      trendStart = i;
    } else if (!priceBelowEMA && inDowntrend) {
      const duration = i - trendStart;
      if (duration > 0 && duration < 90) {
        trends.push(duration);
      }
      inDowntrend = false;
    }
  }
  if (trends.length >= 2) {
    const avg = trends.reduce((a, b) => a + b, 0) / trends.length;
    return { avgDuration: Math.round(avg), confidence: "medium" };
  }
  return { avgDuration: 12, confidence: "low" };
}
function calculateVolumeDelta(recentPrices, currentVolume, priceChangePercent) {
  let buyVolume = 0;
  let sellVolume = 0;
  for (let i = 1; i < recentPrices.length; i++) {
    const priceChange = recentPrices[i].close - recentPrices[i - 1].close;
    const volume = recentPrices[i].volume;
    if (priceChange > 0) {
      const buyRatio = Math.min(0.7 + Math.abs(priceChange) / recentPrices[i].close * 10, 0.95);
      buyVolume += volume * buyRatio;
      sellVolume += volume * (1 - buyRatio);
    } else if (priceChange < 0) {
      const sellRatio = Math.min(0.7 + Math.abs(priceChange) / recentPrices[i].close * 10, 0.95);
      sellVolume += volume * sellRatio;
      buyVolume += volume * (1 - sellRatio);
    } else {
      buyVolume += volume * 0.5;
      sellVolume += volume * 0.5;
    }
  }
  const delta = buyVolume - sellVolume;
  const ratio = buyVolume / (sellVolume + 1e-6);
  return {
    buyVolume,
    sellVolume,
    delta,
    buySellRatio: ratio
  };
}
function calculateSpikeScore(metrics) {
  const weights = {
    volumeDelta: 0.3,
    rsi: 0.2,
    momentum: 0.2,
    volumeChange: 0.15,
    trendStrength: 0.15
  };
  const normalizedVolumeDelta = Math.min(Math.max(metrics.volumeDelta / 1e6 * 50 + 50, 0), 100);
  const normalizedRSI = metrics.rsi;
  const normalizedMomentum = Math.min(Math.max(metrics.momentum * 2 + 50, 0), 100);
  const normalizedVolumeChange = Math.min(Math.max(metrics.volumeChange + 50, 0), 100);
  const normalizedTrendStrength = Math.min(metrics.trendStrength * 10, 100);
  const score = weights.volumeDelta * normalizedVolumeDelta + weights.rsi * normalizedRSI + weights.momentum * normalizedMomentum + weights.volumeChange * normalizedVolumeChange + weights.trendStrength * normalizedTrendStrength;
  let signal;
  let prediction;
  if (score > 75) {
    signal = "SPIKE_SIGNAL";
    prediction = "Strong upward momentum - high probability of price spike";
  } else if (score > 50) {
    signal = "WATCHLIST";
    prediction = "Moderate bullish signals - watch for breakout";
  } else {
    signal = "NO_SIGNAL";
    prediction = "Weak momentum - no clear entry signal";
  }
  return {
    score: Math.min(Math.max(score, 0), 100),
    signal,
    prediction
  };
}

export { predictionLearningService$1 as a, predictionLearningService as p, technicalAnalysisTool as t };
//# sourceMappingURL=technicalAnalysisTool.mjs.map
