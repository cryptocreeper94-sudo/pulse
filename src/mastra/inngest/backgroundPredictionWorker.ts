import { inngest } from "./client";
import { predictionTrackingService } from "../../services/predictionTrackingService.js";
import { coinGeckoClient } from "../../lib/coinGeckoClient.js";
import { RSI, MACD, EMA, SMA, BollingerBands } from "technicalindicators";

const TOP_COINS = [
  'bitcoin', 'ethereum', 'solana', 'cardano', 'avalanche-2',
  'polkadot', 'chainlink', 'polygon', 'near', 'cosmos',
  'litecoin', 'uniswap', 'stellar', 'algorand', 'vechain',
  'hedera', 'internet-computer', 'filecoin', 'the-graph', 'aave'
];

interface IndicatorSnapshot {
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  ema9: number;
  ema21: number;
  ema50: number;
  sma20: number;
  sma50: number;
  bollingerBands: { upper: number; middle: number; lower: number; bandwidth: number };
  support: number;
  resistance: number;
  volumeDelta: { buyVolume: number; sellVolume: number; delta: number; buySellRatio: number };
  spikeScore: { score: number; signal: string; prediction: string };
  volatility: number;
}

function safeNumber(value: number | undefined | null, fallback: number = 0): number {
  if (value === undefined || value === null || isNaN(value) || !isFinite(value)) {
    return fallback;
  }
  return value;
}

function safeFixed(value: number | undefined | null, decimals: number, fallback: number = 0): number {
  const safeVal = safeNumber(value, fallback);
  return parseFloat(safeVal.toFixed(decimals));
}

function getLastValue<T>(arr: T[] | undefined | null, fallback: T): T {
  if (!arr || arr.length === 0) return fallback;
  return arr[arr.length - 1] ?? fallback;
}

function calculateIndicators(
  closePrices: number[],
  highPrices: number[],
  lowPrices: number[],
  volumes: number[],
  currentPrice: number,
  priceChangePercent24h: number
): {
  indicators: IndicatorSnapshot;
  signals: string[];
  bullishCount: number;
  bearishCount: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
} {
  const dataLength = closePrices.length;
  const safePrices = closePrices.filter(p => typeof p === 'number' && !isNaN(p) && isFinite(p));
  const safeCurrentPrice = safeNumber(currentPrice, safePrices[safePrices.length - 1] || 1);
  const safePriceChange = safeNumber(priceChangePercent24h, 0);

  let currentRSI = 50;
  if (safePrices.length >= 15) {
    const rsiValues = RSI.calculate({ values: safePrices, period: 14 });
    currentRSI = safeNumber(getLastValue(rsiValues, 50), 50);
  }

  let currentMACD = { MACD: 0, signal: 0, histogram: 0 };
  if (safePrices.length >= 35) {
    const macdValues = MACD.calculate({
      values: safePrices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });
    const lastMACD = getLastValue(macdValues, null);
    if (lastMACD) {
      currentMACD = {
        MACD: safeNumber(lastMACD.MACD, 0),
        signal: safeNumber(lastMACD.signal, 0),
        histogram: safeNumber(lastMACD.histogram, 0),
      };
    }
  }

  let currentEMA9 = safeCurrentPrice;
  let currentEMA21 = safeCurrentPrice;
  let currentEMA50 = safeCurrentPrice;
  
  if (safePrices.length >= 10) {
    const ema9Values = EMA.calculate({ values: safePrices, period: 9 });
    currentEMA9 = safeNumber(getLastValue(ema9Values, safeCurrentPrice), safeCurrentPrice);
  }
  if (safePrices.length >= 22) {
    const ema21Values = EMA.calculate({ values: safePrices, period: 21 });
    currentEMA21 = safeNumber(getLastValue(ema21Values, safeCurrentPrice), safeCurrentPrice);
  }
  if (safePrices.length >= 51) {
    const ema50Values = EMA.calculate({ values: safePrices, period: 50 });
    currentEMA50 = safeNumber(getLastValue(ema50Values, safeCurrentPrice), safeCurrentPrice);
  }

  let currentSMA20 = safeCurrentPrice;
  let currentSMA50 = safeCurrentPrice;
  
  if (safePrices.length >= 21) {
    const sma20Values = SMA.calculate({ values: safePrices, period: 20 });
    currentSMA20 = safeNumber(getLastValue(sma20Values, safeCurrentPrice), safeCurrentPrice);
  }
  if (safePrices.length >= 51) {
    const sma50Values = SMA.calculate({ values: safePrices, period: 50 });
    currentSMA50 = safeNumber(getLastValue(sma50Values, safeCurrentPrice), safeCurrentPrice);
  }

  let currentBB = { upper: safeCurrentPrice * 1.05, middle: safeCurrentPrice, lower: safeCurrentPrice * 0.95 };
  if (safePrices.length >= 21) {
    const bbValues = BollingerBands.calculate({
      values: safePrices,
      period: 20,
      stdDev: 2,
    });
    const lastBB = getLastValue(bbValues, null);
    if (lastBB) {
      currentBB = {
        upper: safeNumber(lastBB.upper, safeCurrentPrice * 1.05),
        middle: safeNumber(lastBB.middle, safeCurrentPrice),
        lower: safeNumber(lastBB.lower, safeCurrentPrice * 0.95),
      };
    }
  }
  const bandwidth = currentBB.middle > 0 ? ((currentBB.upper - currentBB.lower) / currentBB.middle) * 100 : 0;

  const safeHighs = highPrices.filter(h => typeof h === 'number' && !isNaN(h) && isFinite(h));
  const safeLows = lowPrices.filter(l => typeof l === 'number' && !isNaN(l) && isFinite(l));
  const recentHighs = safeHighs.slice(-30);
  const recentLows = safeLows.slice(-30);
  
  const lowsBelow = recentLows.filter(l => l < safeCurrentPrice);
  const highsAbove = recentHighs.filter(h => h > safeCurrentPrice);
  const support = lowsBelow.length > 0 ? Math.min(...lowsBelow) : safeCurrentPrice * 0.95;
  const resistance = highsAbove.length > 0 ? Math.max(...highsAbove) : safeCurrentPrice * 1.05;

  const safeVolumes = volumes.filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v > 0);
  const avgVolume = safeVolumes.length > 0 
    ? safeVolumes.slice(-20).reduce((a, b) => a + b, 0) / Math.max(safeVolumes.slice(-20).length, 1)
    : 0;
  const currentVolume = safeVolumes.length > 0 ? safeVolumes[safeVolumes.length - 1] : 0;
  const volumeChangePercent = avgVolume > 0 ? ((currentVolume - avgVolume) / avgVolume) * 100 : 0;

  const returns: number[] = [];
  for (let i = 1; i < Math.min(safePrices.length, 30); i++) {
    if (safePrices[i - 1] > 0) {
      returns.push((safePrices[i] - safePrices[i - 1]) / safePrices[i - 1]);
    }
  }
  const mean = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 0 ? returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length : 0;
  const volatility = Math.sqrt(variance) * 100;

  const buyRatio = safePriceChange > 0 ? 0.5 + (safePriceChange / 100) : 0.5 - Math.abs(safePriceChange / 100);
  const clampedBuyRatio = Math.max(0.1, Math.min(0.9, buyRatio));
  const buyVolume = currentVolume * clampedBuyRatio;
  const sellVolume = currentVolume * (1 - clampedBuyRatio);
  const volumeDelta = {
    buyVolume,
    sellVolume,
    delta: buyVolume - sellVolume,
    buySellRatio: sellVolume > 0 ? buyVolume / sellVolume : 1,
  };

  let spikeScore = 0;
  if (volumeChangePercent > 50) spikeScore += 25;
  if (Math.abs(safePriceChange) > 5) spikeScore += 20;
  if (currentRSI < 30 || currentRSI > 70) spikeScore += 15;
  if (volumeDelta.buySellRatio > 1.5 || volumeDelta.buySellRatio < 0.67) spikeScore += 15;
  const trendStrength = safeCurrentPrice > 0 ? Math.abs(currentEMA21 - currentEMA50) / safeCurrentPrice * 100 : 0;
  if (trendStrength > 5) spikeScore += 15;
  spikeScore = Math.min(100, spikeScore);

  const signals: string[] = [];
  let bullishCount = 0;
  let bearishCount = 0;

  if (currentRSI < 30) { signals.push('RSI oversold (bullish)'); bullishCount++; }
  else if (currentRSI > 70) { signals.push('RSI overbought (bearish)'); bearishCount++; }

  if (currentMACD.histogram !== 0 && currentMACD.MACD !== 0 && currentMACD.signal !== 0) {
    if (currentMACD.histogram > 0 && currentMACD.MACD > currentMACD.signal) {
      signals.push('MACD bullish crossover'); bullishCount++;
    } else if (currentMACD.histogram < 0 && currentMACD.MACD < currentMACD.signal) {
      signals.push('MACD bearish crossover'); bearishCount++;
    }
  }

  if (safeCurrentPrice > currentEMA21 && currentEMA21 > currentEMA50) {
    signals.push('Bullish EMA alignment'); bullishCount++;
  } else if (safeCurrentPrice < currentEMA21 && currentEMA21 < currentEMA50) {
    signals.push('Bearish EMA alignment'); bearishCount++;
  }

  if (safeCurrentPrice > currentSMA20) bullishCount++; else bearishCount++;
  if (safeCurrentPrice > currentSMA50) bullishCount++; else bearishCount++;

  if (safeCurrentPrice < currentBB.lower) { signals.push('Price below lower Bollinger Band (bullish)'); bullishCount++; }
  else if (safeCurrentPrice > currentBB.upper) { signals.push('Price above upper Bollinger Band (bearish)'); bearishCount++; }

  const distanceToSupport = support > 0 ? ((safeCurrentPrice - support) / support) * 100 : 100;
  const distanceToResistance = safeCurrentPrice > 0 ? ((resistance - safeCurrentPrice) / safeCurrentPrice) * 100 : 100;
  if (distanceToSupport < 2) { signals.push('Near support level (potential bounce)'); bullishCount++; }
  if (distanceToResistance < 2) { signals.push('Near resistance level (potential rejection)'); bearishCount++; }

  if (volumeChangePercent > 50 && safePriceChange > 0) {
    signals.push('High volume breakout (bullish)'); bullishCount++;
  } else if (volumeChangePercent > 50 && safePriceChange < 0) {
    signals.push('High volume selloff (bearish)'); bearishCount++;
  }

  const netSignal = bullishCount - bearishCount;
  let recommendation: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
  if (netSignal >= 3) recommendation = 'STRONG_BUY';
  else if (netSignal >= 1) recommendation = 'BUY';
  else if (netSignal <= -3) recommendation = 'STRONG_SELL';
  else if (netSignal <= -1) recommendation = 'SELL';
  else recommendation = 'HOLD';

  const indicators: IndicatorSnapshot = {
    rsi: safeFixed(currentRSI, 1, 50),
    macd: {
      value: safeFixed(currentMACD.MACD, 4, 0),
      signal: safeFixed(currentMACD.signal, 4, 0),
      histogram: safeFixed(currentMACD.histogram, 4, 0),
    },
    ema9: safeFixed(currentEMA9, 4, safeCurrentPrice),
    ema21: safeFixed(currentEMA21, 4, safeCurrentPrice),
    ema50: safeFixed(currentEMA50, 4, safeCurrentPrice),
    sma20: safeFixed(currentSMA20, 4, safeCurrentPrice),
    sma50: safeFixed(currentSMA50, 4, safeCurrentPrice),
    bollingerBands: {
      upper: safeFixed(currentBB.upper, 4, safeCurrentPrice * 1.05),
      middle: safeFixed(currentBB.middle, 4, safeCurrentPrice),
      lower: safeFixed(currentBB.lower, 4, safeCurrentPrice * 0.95),
      bandwidth: safeFixed(bandwidth, 2, 0),
    },
    support: safeFixed(support, 4, safeCurrentPrice * 0.95),
    resistance: safeFixed(resistance, 4, safeCurrentPrice * 1.05),
    volumeDelta: {
      buyVolume: safeFixed(volumeDelta.buyVolume, 2, 0),
      sellVolume: safeFixed(volumeDelta.sellVolume, 2, 0),
      delta: safeFixed(volumeDelta.delta, 2, 0),
      buySellRatio: safeFixed(volumeDelta.buySellRatio, 2, 1),
    },
    spikeScore: {
      score: spikeScore,
      signal: spikeScore >= 60 ? 'SPIKE_SIGNAL' : spikeScore >= 40 ? 'WATCHLIST' : 'NO_SIGNAL',
      prediction: spikeScore >= 60 ? 'High probability of significant move' : 'Normal market conditions',
    },
    volatility: safeFixed(volatility, 2, 0),
  };

  return { indicators, signals, bullishCount, bearishCount, recommendation };
}

export const backgroundPredictionWorker = inngest.createFunction(
  {
    id: "background-prediction-worker",
    name: "Generate Background Predictions",
  },
  [
    { cron: "0 */4 * * *" },
    { event: "prediction/generate-background" },
  ],
  async ({ event, step }) => {
    console.log("🔮 [BackgroundPredictionWorker] Starting prediction generation...");
    
    let successCount = 0;
    let errorCount = 0;
    const predictions: { coinId: string; signal: string; id: string }[] = [];

    for (const coinId of TOP_COINS) {
      try {
        const ohlcData = await step.run(
          `fetch-ohlc-${coinId}`,
          async () => {
            try {
              const data = await coinGeckoClient.getOHLC(coinId, 30, 'usd');
              return data;
            } catch (err: any) {
              console.warn(`⚠️ [BackgroundPredictionWorker] Failed to fetch OHLC for ${coinId}: ${err.message}`);
              return null;
            }
          }
        );

        if (!ohlcData || !Array.isArray(ohlcData) || ohlcData.length < 20) {
          console.warn(`⚠️ [BackgroundPredictionWorker] Insufficient data for ${coinId} (got ${ohlcData?.length || 0} points, need 20+)`);
          errorCount++;
          continue;
        }

        const priceData = await step.run(
          `fetch-price-${coinId}`,
          async () => {
            try {
              const data = await coinGeckoClient.getSimplePrice(coinId, 'usd', true, true, true);
              return data[coinId];
            } catch (err: any) {
              console.warn(`⚠️ [BackgroundPredictionWorker] Failed to fetch price for ${coinId}: ${err.message}`);
              return null;
            }
          }
        );

        if (!priceData || typeof priceData.usd !== 'number' || isNaN(priceData.usd)) {
          console.warn(`⚠️ [BackgroundPredictionWorker] No valid price data for ${coinId}`);
          errorCount++;
          continue;
        }

        const result = await step.run(
          `analyze-${coinId}`,
          async () => {
            try {
              const closePrices = ohlcData
                .map((d: number[]) => d[4])
                .filter((p: number) => typeof p === 'number' && !isNaN(p) && isFinite(p));
              const highPrices = ohlcData
                .map((d: number[]) => d[2])
                .filter((p: number) => typeof p === 'number' && !isNaN(p) && isFinite(p));
              const lowPrices = ohlcData
                .map((d: number[]) => d[3])
                .filter((p: number) => typeof p === 'number' && !isNaN(p) && isFinite(p));
              
              const volume24h = typeof priceData.usd_24h_vol === 'number' && !isNaN(priceData.usd_24h_vol) 
                ? priceData.usd_24h_vol 
                : 0;
              const volumes = ohlcData.map(() => volume24h);
              
              const currentPrice = priceData.usd;
              const priceChangePercent24h = typeof priceData.usd_24h_change === 'number' && !isNaN(priceData.usd_24h_change)
                ? priceData.usd_24h_change
                : 0;

              if (closePrices.length < 15) {
                console.warn(`⚠️ [BackgroundPredictionWorker] Not enough valid close prices for ${coinId} (${closePrices.length})`);
                return { id: '', coinId, signal: 'HOLD', success: false };
              }

              const { indicators, signals, bullishCount, bearishCount, recommendation } = calculateIndicators(
                closePrices,
                highPrices,
                lowPrices,
                volumes,
                currentPrice,
                priceChangePercent24h
              );

              const predResult = await predictionTrackingService.logPrediction({
                ticker: coinId.toUpperCase(),
                assetType: 'crypto',
                priceAtPrediction: currentPrice,
                signal: recommendation,
                indicators,
                bullishSignals: bullishCount,
                bearishSignals: bearishCount,
                signalsList: signals,
                userId: 'system-background-worker',
              });

              return {
                id: predResult.id || '',
                coinId,
                signal: recommendation,
                success: predResult.success,
              };
            } catch (indicatorError: any) {
              console.error(`❌ [BackgroundPredictionWorker] Indicator calculation failed for ${coinId}:`, indicatorError.message);
              return { id: '', coinId, signal: 'HOLD', success: false };
            }
          }
        );

        if (result.success) {
          predictions.push({ coinId: result.coinId, signal: result.signal, id: result.id });
          successCount++;
          console.log(`✅ [BackgroundPredictionWorker] Generated prediction for ${coinId}: ${result.signal}`);
        } else {
          errorCount++;
        }

      } catch (error: any) {
        console.error(`❌ [BackgroundPredictionWorker] Error processing ${coinId}:`, error.message);
        errorCount++;
      }
    }

    const summary = {
      successCount,
      errorCount,
      totalCoins: TOP_COINS.length,
      predictions,
      timestamp: new Date().toISOString(),
    };

    console.log(`🔮 [BackgroundPredictionWorker] Completed: ${successCount} predictions generated, ${errorCount} errors`);
    return summary;
  }
);

export const backgroundPredictionWorkerFunctions = [
  backgroundPredictionWorker,
];
