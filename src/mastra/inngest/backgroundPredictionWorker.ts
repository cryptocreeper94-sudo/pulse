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
  ema200: number;
  sma50: number;
  sma200: number;
  bollingerBands: { upper: number; middle: number; lower: number; bandwidth: number };
  support: number;
  resistance: number;
  volumeDelta: { buyVolume: number; sellVolume: number; delta: number; buySellRatio: number };
  spikeScore: { score: number; signal: string; prediction: string };
  volatility: number;
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
  const rsiValues = RSI.calculate({ values: closePrices, period: 14 });
  const currentRSI = rsiValues[rsiValues.length - 1] || 50;

  const macdValues = MACD.calculate({
    values: closePrices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  const currentMACD = macdValues[macdValues.length - 1] || { MACD: 0, signal: 0, histogram: 0 };

  const ema9Values = EMA.calculate({ values: closePrices, period: 9 });
  const ema21Values = EMA.calculate({ values: closePrices, period: 21 });
  const ema50Values = EMA.calculate({ values: closePrices, period: 50 });
  const ema200Values = EMA.calculate({ values: closePrices, period: 200 });
  const currentEMA9 = ema9Values[ema9Values.length - 1] || currentPrice;
  const currentEMA21 = ema21Values[ema21Values.length - 1] || currentPrice;
  const currentEMA50 = ema50Values[ema50Values.length - 1] || currentPrice;
  const currentEMA200 = ema200Values[ema200Values.length - 1] || currentPrice;

  const sma50Values = SMA.calculate({ values: closePrices, period: 50 });
  const sma200Values = SMA.calculate({ values: closePrices, period: 200 });
  const currentSMA50 = sma50Values[sma50Values.length - 1] || currentPrice;
  const currentSMA200 = sma200Values[sma200Values.length - 1] || currentPrice;

  const bbValues = BollingerBands.calculate({
    values: closePrices,
    period: 20,
    stdDev: 2,
  });
  const currentBB = bbValues[bbValues.length - 1] || { upper: currentPrice * 1.05, middle: currentPrice, lower: currentPrice * 0.95 };
  const bandwidth = currentBB.middle > 0 ? ((currentBB.upper - currentBB.lower) / currentBB.middle) * 100 : 0;

  const recentHighs = highPrices.slice(-30);
  const recentLows = lowPrices.slice(-30);
  const support = Math.min(...recentLows.filter(l => l < currentPrice)) || currentPrice * 0.95;
  const resistance = Math.max(...recentHighs.filter(h => h > currentPrice)) || currentPrice * 1.05;

  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / Math.max(volumes.slice(-20).length, 1);
  const currentVolume = volumes[volumes.length - 1] || 0;
  const volumeChangePercent = avgVolume > 0 ? ((currentVolume - avgVolume) / avgVolume) * 100 : 0;

  const returns = [];
  for (let i = 1; i < Math.min(closePrices.length, 30); i++) {
    if (closePrices[i - 1] > 0) {
      returns.push((closePrices[i] - closePrices[i - 1]) / closePrices[i - 1]);
    }
  }
  const mean = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 0 ? returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length : 0;
  const volatility = Math.sqrt(variance) * 100;

  const buyRatio = priceChangePercent24h > 0 ? 0.5 + (priceChangePercent24h / 100) : 0.5 - Math.abs(priceChangePercent24h / 100);
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
  if (Math.abs(priceChangePercent24h) > 5) spikeScore += 20;
  if (currentRSI < 30 || currentRSI > 70) spikeScore += 15;
  if (volumeDelta.buySellRatio > 1.5 || volumeDelta.buySellRatio < 0.67) spikeScore += 15;
  const trendStrength = Math.abs(currentEMA50 - currentEMA200) / currentPrice * 100;
  if (trendStrength > 5) spikeScore += 15;
  spikeScore = Math.min(100, spikeScore);

  const signals: string[] = [];
  let bullishCount = 0;
  let bearishCount = 0;

  if (currentRSI < 30) { signals.push('RSI oversold (bullish)'); bullishCount++; }
  else if (currentRSI > 70) { signals.push('RSI overbought (bearish)'); bearishCount++; }

  if (currentMACD.histogram && currentMACD.MACD && currentMACD.signal) {
    if (currentMACD.histogram > 0 && currentMACD.MACD > currentMACD.signal) {
      signals.push('MACD bullish crossover'); bullishCount++;
    } else if (currentMACD.histogram < 0 && currentMACD.MACD < currentMACD.signal) {
      signals.push('MACD bearish crossover'); bearishCount++;
    }
  }

  if (currentPrice > currentEMA50 && currentEMA50 > currentEMA200) {
    signals.push('Golden cross pattern (bullish)'); bullishCount++;
  } else if (currentPrice < currentEMA50 && currentEMA50 < currentEMA200) {
    signals.push('Death cross pattern (bearish)'); bearishCount++;
  }

  if (currentPrice > currentSMA50) bullishCount++; else bearishCount++;
  if (currentPrice > currentSMA200) bullishCount++; else bearishCount++;

  if (currentPrice < currentBB.lower) { signals.push('Price below lower Bollinger Band (bullish)'); bullishCount++; }
  else if (currentPrice > currentBB.upper) { signals.push('Price above upper Bollinger Band (bearish)'); bearishCount++; }

  const distanceToSupport = ((currentPrice - support) / support) * 100;
  const distanceToResistance = ((resistance - currentPrice) / currentPrice) * 100;
  if (distanceToSupport < 2) { signals.push('Near support level (potential bounce)'); bullishCount++; }
  if (distanceToResistance < 2) { signals.push('Near resistance level (potential rejection)'); bearishCount++; }

  if (volumeChangePercent > 50 && priceChangePercent24h > 0) {
    signals.push('High volume breakout (bullish)'); bullishCount++;
  } else if (volumeChangePercent > 50 && priceChangePercent24h < 0) {
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
    rsi: parseFloat(currentRSI.toFixed(1)),
    macd: {
      value: parseFloat((currentMACD.MACD || 0).toFixed(4)),
      signal: parseFloat((currentMACD.signal || 0).toFixed(4)),
      histogram: parseFloat((currentMACD.histogram || 0).toFixed(4)),
    },
    ema9: parseFloat(currentEMA9.toFixed(4)),
    ema21: parseFloat(currentEMA21.toFixed(4)),
    ema50: parseFloat(currentEMA50.toFixed(4)),
    ema200: parseFloat(currentEMA200.toFixed(4)),
    sma50: parseFloat(currentSMA50.toFixed(4)),
    sma200: parseFloat(currentSMA200.toFixed(4)),
    bollingerBands: {
      upper: parseFloat(currentBB.upper.toFixed(4)),
      middle: parseFloat(currentBB.middle.toFixed(4)),
      lower: parseFloat(currentBB.lower.toFixed(4)),
      bandwidth: parseFloat(bandwidth.toFixed(2)),
    },
    support: parseFloat(support.toFixed(4)),
    resistance: parseFloat(resistance.toFixed(4)),
    volumeDelta: {
      buyVolume: parseFloat(volumeDelta.buyVolume.toFixed(2)),
      sellVolume: parseFloat(volumeDelta.sellVolume.toFixed(2)),
      delta: parseFloat(volumeDelta.delta.toFixed(2)),
      buySellRatio: parseFloat(volumeDelta.buySellRatio.toFixed(2)),
    },
    spikeScore: {
      score: spikeScore,
      signal: spikeScore >= 60 ? 'SPIKE_SIGNAL' : spikeScore >= 40 ? 'WATCHLIST' : 'NO_SIGNAL',
      prediction: spikeScore >= 60 ? 'High probability of significant move' : 'Normal market conditions',
    },
    volatility: parseFloat(volatility.toFixed(2)),
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

        if (!ohlcData || ohlcData.length < 50) {
          console.warn(`⚠️ [BackgroundPredictionWorker] Insufficient data for ${coinId}`);
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
              return null;
            }
          }
        );

        if (!priceData || !priceData.usd) {
          console.warn(`⚠️ [BackgroundPredictionWorker] No price data for ${coinId}`);
          errorCount++;
          continue;
        }

        const result = await step.run(
          `analyze-${coinId}`,
          async () => {
            const closePrices = ohlcData.map((d: number[]) => d[4]);
            const highPrices = ohlcData.map((d: number[]) => d[2]);
            const lowPrices = ohlcData.map((d: number[]) => d[3]);
            const volumes = ohlcData.map(() => priceData.usd_24h_vol || 0);
            const currentPrice = priceData.usd;
            const priceChangePercent24h = priceData.usd_24h_change || 0;

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
              id: predResult.id,
              coinId,
              signal: recommendation,
              success: predResult.success,
            };
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
