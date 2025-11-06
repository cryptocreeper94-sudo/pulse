import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { RSI, MACD, EMA, SMA, BollingerBands } from "technicalindicators";

/**
 * Technical Analysis Tool - Calculates all technical indicators and generates buy/sell signals
 * Analyzes: RSI, MACD, EMAs, SMAs, Bollinger Bands, Support/Resistance, Volume
 */

export const technicalAnalysisTool = createTool({
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
      volume: z.number(),
    })).describe("Historical OHLCV data"),
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
      histogram: z.number(),
    }),
    ema50: z.number(),
    ema200: z.number(),
    sma50: z.number(),
    sma200: z.number(),
    bollingerBands: z.object({
      upper: z.number(),
      middle: z.number(),
      lower: z.number(),
      bandwidth: z.number(),
    }),
    support: z.number(),
    resistance: z.number(),
    volume: z.object({
      current: z.number(),
      average: z.number(),
      changePercent: z.number(),
    }),
    volumeDelta: z.object({
      buyVolume: z.number(),
      sellVolume: z.number(),
      delta: z.number(),
      buySellRatio: z.number(),
    }),
    spikeScore: z.object({
      score: z.number(),
      signal: z.enum(['SPIKE_SIGNAL', 'WATCHLIST', 'NO_SIGNAL']),
      prediction: z.string(),
    }),
    volatility: z.number(),
    patternDuration: z.object({
      estimate: z.string(),
      confidence: z.string(),
      type: z.string(),
    }),
    signals: z.array(z.string()),
    recommendation: z.enum(['BUY', 'SELL', 'HOLD', 'STRONG_BUY', 'STRONG_SELL']),
    signalCount: z.object({
      bullish: z.number(),
      bearish: z.number(),
    }),
  }),

  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [TechnicalAnalysisTool] Starting analysis', { ticker: context.ticker });

    const closePrices = context.prices.map(p => p.close);
    const highPrices = context.prices.map(p => p.high);
    const lowPrices = context.prices.map(p => p.low);
    const volumes = context.prices.map(p => p.volume);

    logger?.info('📊 [TechnicalAnalysisTool] Calculating indicators', { dataPoints: closePrices.length });

    // Calculate RSI (14 period)
    const rsiValues = RSI.calculate({ values: closePrices, period: 14 });
    const currentRSI = rsiValues[rsiValues.length - 1] || 50;

    // Calculate MACD (12, 26, 9)
    const macdValues = MACD.calculate({
      values: closePrices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });
    const currentMACD = macdValues[macdValues.length - 1] || { MACD: 0, signal: 0, histogram: 0 };

    // Calculate EMAs
    const ema50Values = EMA.calculate({ values: closePrices, period: 50 });
    const ema200Values = EMA.calculate({ values: closePrices, period: 200 });
    const currentEMA50 = ema50Values[ema50Values.length - 1] || context.currentPrice;
    const currentEMA200 = ema200Values[ema200Values.length - 1] || context.currentPrice;

    // Calculate SMAs
    const sma50Values = SMA.calculate({ values: closePrices, period: 50 });
    const sma200Values = SMA.calculate({ values: closePrices, period: 200 });
    const currentSMA50 = sma50Values[sma50Values.length - 1] || context.currentPrice;
    const currentSMA200 = sma200Values[sma200Values.length - 1] || context.currentPrice;

    // Calculate Bollinger Bands
    const bbValues = BollingerBands.calculate({
      values: closePrices,
      period: 20,
      stdDev: 2,
    });
    const currentBB = bbValues[bbValues.length - 1] || { upper: 0, middle: 0, lower: 0 };
    const bandwidth = ((currentBB.upper - currentBB.lower) / currentBB.middle) * 100;

    // Calculate dynamic support and resistance (recent 30-day window)
    const recentPrices = context.prices.slice(-30);
    const support = calculateDynamicSupport(recentPrices, context.currentPrice);
    const resistance = calculateDynamicResistance(recentPrices, context.currentPrice);

    // Calculate volume metrics
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const currentVolume = context.volume24h || volumes[volumes.length - 1] || 0;
    const volumeChangePercent = ((currentVolume - avgVolume) / avgVolume) * 100;

    // Calculate volatility (standard deviation of recent returns)
    const volatility = calculateVolatility(closePrices.slice(-30));

    // Calculate Volume Delta (estimate buy vs sell pressure)
    const volumeDelta = calculateVolumeDelta(
      context.prices.slice(-20),
      currentVolume,
      context.priceChangePercent24h
    );

    // Calculate Spike Score (predictive score 0-100)
    const spikeScore = calculateSpikeScore({
      volumeDelta: volumeDelta.delta,
      rsi: currentRSI,
      momentum: context.priceChangePercent24h,
      volumeChange: volumeChangePercent,
      trendStrength: Math.abs(currentEMA50 - currentEMA200) / context.currentPrice * 100,
    });

    // Calculate pattern duration estimate
    const patternDuration = estimatePatternDuration(
      context.prices,
      currentRSI,
      currentMACD,
      volumeChangePercent,
      context.currentPrice,
      currentEMA50,
      currentEMA200
    );

    logger?.info('📝 [TechnicalAnalysisTool] Generating signals');

    // Generate signals
    const signals: string[] = [];
    let bullishCount = 0;
    let bearishCount = 0;

    // RSI signals
    if (currentRSI < 30) {
      signals.push('RSI oversold (bullish)');
      bullishCount++;
    } else if (currentRSI > 70) {
      signals.push('RSI overbought (bearish)');
      bearishCount++;
    }

    // MACD signals
    if (currentMACD.histogram && currentMACD.MACD && currentMACD.signal) {
      if (currentMACD.histogram > 0 && currentMACD.MACD > currentMACD.signal) {
        signals.push('MACD bullish crossover');
        bullishCount++;
      } else if (currentMACD.histogram < 0 && currentMACD.MACD < currentMACD.signal) {
        signals.push('MACD bearish crossover');
        bearishCount++;
      }
    }

    // Moving average signals
    if (context.currentPrice > currentEMA50 && currentEMA50 > currentEMA200) {
      signals.push('Golden cross pattern (bullish)');
      bullishCount++;
    } else if (context.currentPrice < currentEMA50 && currentEMA50 < currentEMA200) {
      signals.push('Death cross pattern (bearish)');
      bearishCount++;
    }

    // Price vs MA signals
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

    // Bollinger Band signals
    if (context.currentPrice < currentBB.lower) {
      signals.push('Price below lower Bollinger Band (bullish)');
      bullishCount++;
    } else if (context.currentPrice > currentBB.upper) {
      signals.push('Price above upper Bollinger Band (bearish)');
      bearishCount++;
    }

    // Support/Resistance signals
    const distanceToSupport = ((context.currentPrice - support) / support) * 100;
    const distanceToResistance = ((resistance - context.currentPrice) / context.currentPrice) * 100;

    if (distanceToSupport < 2) {
      signals.push('Near support level (potential bounce)');
      bullishCount++;
    }

    if (distanceToResistance < 2) {
      signals.push('Near resistance level (potential rejection)');
      bearishCount++;
    }

    // Volume signals
    if (volumeChangePercent > 50 && context.priceChangePercent24h > 0) {
      signals.push('High volume breakout (bullish)');
      bullishCount++;
    } else if (volumeChangePercent > 50 && context.priceChangePercent24h < 0) {
      signals.push('High volume selloff (bearish)');
      bearishCount++;
    }

    // Determine recommendation
    let recommendation: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
    const netSignal = bullishCount - bearishCount;

    if (netSignal >= 3) {
      recommendation = 'STRONG_BUY';
    } else if (netSignal >= 1) {
      recommendation = 'BUY';
    } else if (netSignal <= -3) {
      recommendation = 'STRONG_SELL';
    } else if (netSignal <= -1) {
      recommendation = 'SELL';
    } else {
      recommendation = 'HOLD';
    }

    logger?.info('✅ [TechnicalAnalysisTool] Analysis complete', { 
      ticker: context.ticker,
      recommendation,
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
        histogram: parseFloat((currentMACD.histogram || 0).toFixed(2)),
      },
      ema50: parseFloat(currentEMA50.toFixed(2)),
      ema200: parseFloat(currentEMA200.toFixed(2)),
      sma50: parseFloat(currentSMA50.toFixed(2)),
      sma200: parseFloat(currentSMA200.toFixed(2)),
      bollingerBands: {
        upper: parseFloat(currentBB.upper.toFixed(2)),
        middle: parseFloat(currentBB.middle.toFixed(2)),
        lower: parseFloat(currentBB.lower.toFixed(2)),
        bandwidth: parseFloat(bandwidth.toFixed(2)),
      },
      support: parseFloat(support.toFixed(2)),
      resistance: parseFloat(resistance.toFixed(2)),
      volume: {
        current: parseFloat(currentVolume.toFixed(2)),
        average: parseFloat(avgVolume.toFixed(2)),
        changePercent: parseFloat(volumeChangePercent.toFixed(1)),
      },
      volumeDelta: {
        buyVolume: parseFloat(volumeDelta.buyVolume.toFixed(2)),
        sellVolume: parseFloat(volumeDelta.sellVolume.toFixed(2)),
        delta: parseFloat(volumeDelta.delta.toFixed(2)),
        buySellRatio: parseFloat(volumeDelta.buySellRatio.toFixed(2)),
      },
      spikeScore: {
        score: parseFloat(spikeScore.score.toFixed(1)),
        signal: spikeScore.signal,
        prediction: spikeScore.prediction,
      },
      volatility: parseFloat(volatility.toFixed(1)),
      patternDuration,
      signals,
      recommendation,
      signalCount: {
        bullish: bullishCount,
        bearish: bearishCount,
      },
    };
  },
});

// Helper functions

function calculateDynamicSupport(recentPrices: any[], currentPrice: number): number {
  const lows = recentPrices.map(p => p.low);
  const sortedLows = [...lows].sort((a, b) => a - b);
  
  // Find support levels below current price
  const belowCurrent = sortedLows.filter(low => low < currentPrice);
  
  if (belowCurrent.length === 0) return sortedLows[0];
  
  // Return the highest low below current price (nearest support)
  return belowCurrent[belowCurrent.length - 1];
}

function calculateDynamicResistance(recentPrices: any[], currentPrice: number): number {
  const highs = recentPrices.map(p => p.high);
  const sortedHighs = [...highs].sort((a, b) => b - a);
  
  // Find resistance levels above current price
  const aboveCurrent = sortedHighs.filter(high => high > currentPrice);
  
  if (aboveCurrent.length === 0) return sortedHighs[0];
  
  // Return the lowest high above current price (nearest resistance)
  return aboveCurrent[aboveCurrent.length - 1];
}

function calculateVolatility(prices: number[]): number {
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  return stdDev * 100; // Convert to percentage
}

function estimatePatternDuration(
  prices: any[],
  currentRSI: number,
  currentMACD: any,
  volumeChange: number,
  currentPrice: number,
  ema50: number,
  ema200: number
): { estimate: string; confidence: string; type: string } {
  // Analyze historical patterns to estimate duration of current trend
  
  const closePrices = prices.map(p => p.close);
  let patternType = 'consolidation';
  let estimatedDays = 0;
  let confidence = 'low';
  
  // RSI-based duration analysis
  if (currentRSI < 30) {
    // Oversold - analyze past oversold recoveries
    const oversoldDurations = analyzeOversoldRecoveries(closePrices, prices);
    estimatedDays = oversoldDurations.avgDuration;
    confidence = oversoldDurations.confidence;
    patternType = 'potential rally from oversold';
  } else if (currentRSI > 70) {
    // Overbought - analyze past overbought corrections
    const overboughtDurations = analyzeOverboughtCorrections(closePrices, prices);
    estimatedDays = overboughtDurations.avgDuration;
    confidence = overboughtDurations.confidence;
    patternType = 'potential correction from overbought';
  }
  
  // MACD momentum duration
  else if (currentMACD.histogram && Math.abs(currentMACD.histogram) > 0) {
    const macdDurations = analyzeMACDMomentum(closePrices, prices);
    estimatedDays = macdDurations.avgDuration;
    confidence = macdDurations.confidence;
    if (currentMACD.histogram > 0) {
      patternType = 'bullish momentum continuation';
    } else {
      patternType = 'bearish momentum continuation';
    }
  }
  
  // Trend-based duration (EMA crossovers)
  else if (currentPrice > ema50 && ema50 > ema200) {
    const trendDurations = analyzeUptrends(closePrices, prices);
    estimatedDays = trendDurations.avgDuration;
    confidence = trendDurations.confidence;
    patternType = 'uptrend continuation';
  } else if (currentPrice < ema50 && ema50 < ema200) {
    const trendDurations = analyzeDowntrends(closePrices, prices);
    estimatedDays = trendDurations.avgDuration;
    confidence = trendDurations.confidence;
    patternType = 'downtrend continuation';
  }
  
  // Volume spike patterns
  else if (volumeChange > 50) {
    estimatedDays = 5; // Volume spikes typically precede 3-7 day moves
    confidence = 'medium';
    patternType = 'volume breakout pattern';
  }
  
  // Default consolidation
  else {
    estimatedDays = 7;
    confidence = 'low';
    patternType = 'consolidation/range-bound';
  }
  
  // Format estimate as time range
  let estimate = '';
  if (estimatedDays < 2) {
    estimate = '1-2 days';
  } else if (estimatedDays < 7) {
    estimate = `${Math.floor(estimatedDays)}-${Math.ceil(estimatedDays + 2)} days`;
  } else if (estimatedDays < 14) {
    estimate = '1-2 weeks';
  } else if (estimatedDays < 30) {
    estimate = '2-4 weeks';
  } else {
    estimate = '1-2 months';
  }
  
  return {
    estimate,
    confidence,
    type: patternType,
  };
}

function analyzeOversoldRecoveries(closePrices: number[], prices: any[]): { avgDuration: number; confidence: string } {
  // Calculate RSI for all data points
  const rsiValues = RSI.calculate({ values: closePrices, period: 14 });
  
  const recoveries: number[] = [];
  let inOversold = false;
  let oversoldStart = 0;
  
  for (let i = 0; i < rsiValues.length; i++) {
    if (rsiValues[i] < 30 && !inOversold) {
      inOversold = true;
      oversoldStart = i;
    } else if (rsiValues[i] >= 50 && inOversold) {
      // Recovery complete
      const duration = i - oversoldStart;
      if (duration > 0 && duration < 60) { // Filter outliers
        recoveries.push(duration);
      }
      inOversold = false;
    }
  }
  
  if (recoveries.length >= 3) {
    const avg = recoveries.reduce((a, b) => a + b, 0) / recoveries.length;
    return { avgDuration: Math.round(avg), confidence: 'high' };
  } else if (recoveries.length > 0) {
    const avg = recoveries.reduce((a, b) => a + b, 0) / recoveries.length;
    return { avgDuration: Math.round(avg), confidence: 'medium' };
  }
  
  return { avgDuration: 5, confidence: 'low' }; // Default estimate
}

function analyzeOverboughtCorrections(closePrices: number[], prices: any[]): { avgDuration: number; confidence: string } {
  const rsiValues = RSI.calculate({ values: closePrices, period: 14 });
  
  const corrections: number[] = [];
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
    return { avgDuration: Math.round(avg), confidence: 'high' };
  } else if (corrections.length > 0) {
    const avg = corrections.reduce((a, b) => a + b, 0) / corrections.length;
    return { avgDuration: Math.round(avg), confidence: 'medium' };
  }
  
  return { avgDuration: 7, confidence: 'low' };
}

function analyzeMACDMomentum(closePrices: number[], prices: any[]): { avgDuration: number; confidence: string } {
  const macdValues = MACD.calculate({
    values: closePrices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  
  const momentumPeriods: number[] = [];
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
    return { avgDuration: Math.round(avg), confidence: 'high' };
  } else if (momentumPeriods.length > 0) {
    const avg = momentumPeriods.reduce((a, b) => a + b, 0) / momentumPeriods.length;
    return { avgDuration: Math.round(avg), confidence: 'medium' };
  }
  
  return { avgDuration: 8, confidence: 'low' };
}

function analyzeUptrends(closePrices: number[], prices: any[]): { avgDuration: number; confidence: string } {
  const ema50 = EMA.calculate({ values: closePrices, period: 50 });
  
  const trends: number[] = [];
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
    return { avgDuration: Math.round(avg), confidence: 'medium' };
  }
  
  return { avgDuration: 14, confidence: 'low' };
}

function analyzeDowntrends(closePrices: number[], prices: any[]): { avgDuration: number; confidence: string } {
  const ema50 = EMA.calculate({ values: closePrices, period: 50 });
  
  const trends: number[] = [];
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
    return { avgDuration: Math.round(avg), confidence: 'medium' };
  }
  
  return { avgDuration: 12, confidence: 'low' };
}

function calculateVolumeDelta(
  recentPrices: any[],
  currentVolume: number,
  priceChangePercent: number
): { buyVolume: number; sellVolume: number; delta: number; buySellRatio: number } {
  // Estimate buy/sell volume based on price movement and volume distribution
  // If price is up, more volume is attributed to buys; if down, to sells
  
  let buyVolume = 0;
  let sellVolume = 0;
  
  // Calculate buy/sell ratio from recent price action
  for (let i = 1; i < recentPrices.length; i++) {
    const priceChange = recentPrices[i].close - recentPrices[i - 1].close;
    const volume = recentPrices[i].volume;
    
    if (priceChange > 0) {
      // Price went up - attribute more to buys
      const buyRatio = Math.min(0.7 + (Math.abs(priceChange) / recentPrices[i].close) * 10, 0.95);
      buyVolume += volume * buyRatio;
      sellVolume += volume * (1 - buyRatio);
    } else if (priceChange < 0) {
      // Price went down - attribute more to sells
      const sellRatio = Math.min(0.7 + (Math.abs(priceChange) / recentPrices[i].close) * 10, 0.95);
      sellVolume += volume * sellRatio;
      buyVolume += volume * (1 - sellRatio);
    } else {
      // No change - split 50/50
      buyVolume += volume * 0.5;
      sellVolume += volume * 0.5;
    }
  }
  
  const delta = buyVolume - sellVolume;
  const ratio = buyVolume / (sellVolume + 1e-6); // Avoid division by zero
  
  return {
    buyVolume,
    sellVolume,
    delta,
    buySellRatio: ratio,
  };
}

function calculateSpikeScore(metrics: {
  volumeDelta: number;
  rsi: number;
  momentum: number;
  volumeChange: number;
  trendStrength: number;
}): { score: number; signal: 'SPIKE_SIGNAL' | 'WATCHLIST' | 'NO_SIGNAL'; prediction: string } {
  // Weighted scoring system (0-100)
  const weights = {
    volumeDelta: 0.3,
    rsi: 0.2,
    momentum: 0.2,
    volumeChange: 0.15,
    trendStrength: 0.15,
  };
  
  // Normalize metrics to 0-100 scale
  const normalizedVolumeDelta = Math.min(Math.max((metrics.volumeDelta / 1000000) * 50 + 50, 0), 100);
  const normalizedRSI = metrics.rsi;
  const normalizedMomentum = Math.min(Math.max(metrics.momentum * 2 + 50, 0), 100);
  const normalizedVolumeChange = Math.min(Math.max(metrics.volumeChange + 50, 0), 100);
  const normalizedTrendStrength = Math.min(metrics.trendStrength * 10, 100);
  
  // Calculate weighted score
  const score =
    weights.volumeDelta * normalizedVolumeDelta +
    weights.rsi * normalizedRSI +
    weights.momentum * normalizedMomentum +
    weights.volumeChange * normalizedVolumeChange +
    weights.trendStrength * normalizedTrendStrength;
  
  // Determine signal level
  let signal: 'SPIKE_SIGNAL' | 'WATCHLIST' | 'NO_SIGNAL';
  let prediction: string;
  
  if (score > 75) {
    signal = 'SPIKE_SIGNAL';
    prediction = 'Strong upward momentum - high probability of price spike';
  } else if (score > 50) {
    signal = 'WATCHLIST';
    prediction = 'Moderate bullish signals - watch for breakout';
  } else {
    signal = 'NO_SIGNAL';
    prediction = 'Weak momentum - no clear entry signal';
  }
  
  return {
    score: Math.min(Math.max(score, 0), 100),
    signal,
    prediction,
  };
}
