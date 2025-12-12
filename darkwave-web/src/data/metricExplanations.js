export const METRIC_EXPLANATIONS = {
  rsi: {
    name: 'RSI (Relative Strength Index)',
    shortName: 'RSI',
    emoji: '📊',
    description: 'Measures how fast and how much a price has moved recently.',
    howToRead: [
      { range: 'Below 30', meaning: 'Oversold - Price dropped a lot, might bounce back up', signal: 'bullish' },
      { range: '30-50', meaning: 'Slightly weak - More selling than buying recently', signal: 'neutral' },
      { range: '50-70', meaning: 'Slightly strong - More buying than selling recently', signal: 'neutral' },
      { range: 'Above 70', meaning: 'Overbought - Price rose a lot, might pull back down', signal: 'bearish' },
    ],
    whyItMatters: 'RSI helps spot when a coin might be "due" for a reversal. When everyone has already bought (overbought), there are fewer buyers left. When everyone has sold (oversold), the selling pressure may be exhausted.',
    tradingTip: 'Don\'t buy just because RSI is low - look for RSI to start rising FROM a low level. Same for selling - wait for RSI to start falling FROM a high level.',
    timeframe: 'Standard is 14 periods (14 hours on hourly chart, 14 days on daily chart)',
  },

  macd: {
    name: 'MACD (Moving Average Convergence Divergence)',
    shortName: 'MACD',
    emoji: '📈',
    description: 'Shows the relationship between two moving averages to identify trend changes.',
    howToRead: [
      { range: 'MACD above Signal', meaning: 'Bullish momentum - buying pressure increasing', signal: 'bullish' },
      { range: 'MACD below Signal', meaning: 'Bearish momentum - selling pressure increasing', signal: 'bearish' },
      { range: 'Histogram growing', meaning: 'Momentum strengthening in current direction', signal: 'neutral' },
      { range: 'Histogram shrinking', meaning: 'Momentum weakening, possible reversal coming', signal: 'neutral' },
    ],
    whyItMatters: 'MACD is a trend-following indicator that shows when momentum is shifting. It\'s great for confirming trends and spotting when they might be ending.',
    tradingTip: 'The crossover (when MACD crosses above/below the signal line) is a classic buy/sell signal. But wait for confirmation - one crossover isn\'t enough.',
    timeframe: 'Uses 12-period and 26-period EMAs with a 9-period signal line',
  },

  sma: {
    name: 'SMA (Simple Moving Average)',
    shortName: 'SMA',
    emoji: '📉',
    description: 'The average price over a set number of periods. Smooths out price noise to show the trend.',
    howToRead: [
      { range: 'Price above SMA', meaning: 'Uptrend - buyers in control', signal: 'bullish' },
      { range: 'Price below SMA', meaning: 'Downtrend - sellers in control', signal: 'bearish' },
      { range: 'Price crossing above', meaning: 'Potential trend reversal to bullish', signal: 'bullish' },
      { range: 'Price crossing below', meaning: 'Potential trend reversal to bearish', signal: 'bearish' },
    ],
    whyItMatters: 'Moving averages act as dynamic support/resistance levels. Traders watch them to decide when to buy or sell.',
    tradingTip: 'The 20-day SMA is popular for short-term trends. The 50-day and 200-day SMAs are watched by everyone - when price crosses them, big moves often follow.',
    timeframe: 'SMA(20) uses the last 20 periods',
  },

  ema: {
    name: 'EMA (Exponential Moving Average)',
    shortName: 'EMA',
    emoji: '⚡',
    description: 'Like SMA but gives more weight to recent prices, making it react faster to new information.',
    howToRead: [
      { range: 'Price above EMA', meaning: 'Short-term uptrend in progress', signal: 'bullish' },
      { range: 'Price below EMA', meaning: 'Short-term downtrend in progress', signal: 'bearish' },
      { range: 'EMA12 above EMA26', meaning: 'Bullish crossover - momentum shifting up', signal: 'bullish' },
      { range: 'EMA12 below EMA26', meaning: 'Bearish crossover - momentum shifting down', signal: 'bearish' },
    ],
    whyItMatters: 'EMAs react faster than SMAs, making them better for catching early trend changes. Many trading algorithms use EMA crossovers.',
    tradingTip: 'The 12 and 26 period EMAs are the foundation of MACD. When the fast EMA (12) crosses above the slow EMA (26), it\'s a bullish signal.',
    timeframe: 'EMA(12) focuses on the last 12 periods with exponential weighting',
  },

  volume: {
    name: 'Trading Volume',
    shortName: 'Volume',
    emoji: '📊',
    description: 'How much of the coin was bought and sold in a given period.',
    howToRead: [
      { range: 'High volume + price up', meaning: 'Strong buying - uptrend is healthy', signal: 'bullish' },
      { range: 'High volume + price down', meaning: 'Strong selling - downtrend is strong', signal: 'bearish' },
      { range: 'Low volume + price up', meaning: 'Weak rally - might not last', signal: 'neutral' },
      { range: 'Low volume + price down', meaning: 'Weak selloff - might recover', signal: 'neutral' },
    ],
    whyItMatters: 'Volume confirms price moves. A big price move on high volume is more meaningful than one on low volume. "Volume precedes price" - often volume spikes before big moves.',
    tradingTip: 'Watch for volume spikes - they often signal the start or end of big moves. Breakouts on high volume are more likely to succeed.',
    timeframe: 'Usually measured in 24-hour periods for crypto',
  },

  marketCap: {
    name: 'Market Capitalization',
    shortName: 'Market Cap',
    emoji: '💰',
    description: 'Total value of all coins in circulation. Price × Circulating Supply = Market Cap.',
    howToRead: [
      { range: 'Over $10B', meaning: 'Large cap - established, lower risk, slower gains', signal: 'neutral' },
      { range: '$1B - $10B', meaning: 'Mid cap - moderate risk and reward potential', signal: 'neutral' },
      { range: '$100M - $1B', meaning: 'Small cap - higher risk, higher potential gains', signal: 'neutral' },
      { range: 'Under $100M', meaning: 'Micro cap - very high risk, can 10x or go to zero', signal: 'neutral' },
    ],
    whyItMatters: 'Market cap tells you how "big" a project really is. A $1 coin with 1 billion supply has the same market cap as a $1000 coin with 1 million supply.',
    tradingTip: 'Smaller market caps mean bigger potential moves in both directions. For safety, larger caps are more stable. For moonshots, smaller caps have more room to grow.',
    timeframe: 'Real-time calculation',
  },

  volatility: {
    name: 'Volatility',
    shortName: 'Volatility',
    emoji: '🎢',
    description: 'How much the price swings up and down. High volatility = big moves, low volatility = stable.',
    howToRead: [
      { range: 'Very High (>10%)', meaning: 'Extreme swings - high risk, high reward', signal: 'neutral' },
      { range: 'High (5-10%)', meaning: 'Active trading - good for day traders', signal: 'neutral' },
      { range: 'Medium (2-5%)', meaning: 'Normal crypto volatility', signal: 'neutral' },
      { range: 'Low (<2%)', meaning: 'Stable - good for holding, less trading opportunity', signal: 'neutral' },
    ],
    whyItMatters: 'Volatility affects how you size your trades. High volatility means you need smaller positions to manage risk. It also means more profit potential.',
    tradingTip: 'Volatility tends to cluster - periods of high volatility are often followed by more high volatility. Same for calm periods.',
    timeframe: 'Usually measured over 24 hours or 30 days',
  },

  fearGreed: {
    name: 'Fear & Greed Index',
    shortName: 'Fear/Greed',
    emoji: '😨',
    description: 'Measures overall market sentiment from 0 (extreme fear) to 100 (extreme greed).',
    howToRead: [
      { range: '0-25', meaning: 'Extreme Fear - people are scared, might be buying opportunity', signal: 'bullish' },
      { range: '25-45', meaning: 'Fear - market is nervous', signal: 'neutral' },
      { range: '45-55', meaning: 'Neutral - balanced sentiment', signal: 'neutral' },
      { range: '55-75', meaning: 'Greed - market is optimistic', signal: 'neutral' },
      { range: '75-100', meaning: 'Extreme Greed - might be time to take profits', signal: 'bearish' },
    ],
    whyItMatters: '"Be fearful when others are greedy, and greedy when others are fearful." - Warren Buffett. Extreme readings often mark turning points.',
    tradingTip: 'Use this as a contrarian indicator. When everyone is scared, consider buying. When everyone is euphoric, consider taking profits.',
    timeframe: 'Updated daily, based on multiple factors including volatility, volume, social media, and surveys',
  },

  altcoinSeason: {
    name: 'Altcoin Season Index',
    shortName: 'Alt Season',
    emoji: '🚀',
    description: 'Shows whether altcoins or Bitcoin is leading the market.',
    howToRead: [
      { range: '0-25', meaning: 'Bitcoin Season - BTC outperforming, stick with BTC', signal: 'neutral' },
      { range: '25-50', meaning: 'Slight BTC dominance', signal: 'neutral' },
      { range: '50-75', meaning: 'Slight altcoin favor', signal: 'neutral' },
      { range: '75-100', meaning: 'Altcoin Season - alts outperforming, time for alt plays', signal: 'neutral' },
    ],
    whyItMatters: 'Money flows between Bitcoin and altcoins. During "alt season", smaller coins often make bigger gains. During "BTC season", altcoins often underperform.',
    tradingTip: 'When the index is high (alt season), consider rotating some BTC profits into quality altcoins. When it\'s low, consider consolidating back to BTC.',
    timeframe: 'Based on 90-day performance comparison',
  },

  btcDominance: {
    name: 'Bitcoin Dominance',
    shortName: 'BTC.D',
    emoji: '👑',
    description: 'Percentage of total crypto market cap that is Bitcoin.',
    howToRead: [
      { range: 'Rising dominance', meaning: 'Money flowing to Bitcoin - risk-off sentiment', signal: 'neutral' },
      { range: 'Falling dominance', meaning: 'Money flowing to altcoins - risk-on sentiment', signal: 'neutral' },
      { range: 'Above 55%', meaning: 'Bitcoin heavy market - altcoins may underperform', signal: 'neutral' },
      { range: 'Below 45%', meaning: 'Altcoin friendly market - alt opportunities', signal: 'neutral' },
    ],
    whyItMatters: 'BTC dominance helps you decide how to allocate between Bitcoin and altcoins. It often moves inversely to alt season.',
    tradingTip: 'When dominance is high and starts falling, it often signals the start of alt season. When dominance is low and starts rising, altcoins may dump.',
    timeframe: 'Real-time calculation',
  },

  support: {
    name: 'Support Level',
    shortName: 'Support',
    emoji: '🛡️',
    description: 'A price level where buying interest is strong enough to prevent further decline.',
    howToRead: [
      { range: 'Price near support', meaning: 'Potential bounce zone - buyers often step in here', signal: 'bullish' },
      { range: 'Price breaks support', meaning: 'Bearish - could fall to next support level', signal: 'bearish' },
    ],
    whyItMatters: 'Support levels are where many traders place buy orders. When price approaches support, demand often increases, causing bounces.',
    tradingTip: 'Consider buying near support with a stop-loss just below it. If support breaks, don\'t fight it - the next support could be much lower.',
    timeframe: 'Identified from historical price action',
  },

  resistance: {
    name: 'Resistance Level',
    shortName: 'Resistance',
    emoji: '🧱',
    description: 'A price level where selling interest is strong enough to prevent further rise.',
    howToRead: [
      { range: 'Price near resistance', meaning: 'Potential rejection zone - sellers often step in here', signal: 'bearish' },
      { range: 'Price breaks resistance', meaning: 'Bullish - could rise to next resistance level', signal: 'bullish' },
    ],
    whyItMatters: 'Resistance levels are where many traders place sell orders or take profits. When price approaches resistance, supply often increases.',
    tradingTip: 'Consider taking some profits near resistance. If price breaks above with strong volume, it could run significantly higher.',
    timeframe: 'Identified from historical price action',
  },

  confidence: {
    name: 'AI Confidence Score',
    shortName: 'Confidence',
    emoji: '🤖',
    description: 'How confident the AI is in its prediction, based on indicator alignment and historical patterns.',
    howToRead: [
      { range: '80-100%', meaning: 'High confidence - multiple indicators agree', signal: 'neutral' },
      { range: '60-80%', meaning: 'Moderate confidence - some conflicting signals', signal: 'neutral' },
      { range: '40-60%', meaning: 'Low confidence - mixed signals, proceed with caution', signal: 'neutral' },
      { range: 'Below 40%', meaning: 'Very low confidence - too uncertain to act', signal: 'neutral' },
    ],
    whyItMatters: 'Higher confidence means more indicators are pointing the same direction. Lower confidence means the market is sending mixed signals.',
    tradingTip: 'Size your positions based on confidence. Higher confidence = larger position. Lower confidence = smaller position or skip the trade entirely.',
    timeframe: 'Calculated at time of analysis',
  },
}

export const SAFETY_EXPLANATIONS = {
  mintAuthority: {
    name: 'Mint Authority',
    emoji: '🏭',
    risk: 'high',
    description: 'Whether the token creator can create unlimited new tokens.',
    safe: 'Mint authority revoked - no new tokens can be created',
    risky: 'Mint authority active - creator can print unlimited tokens (rug risk)',
    whyItMatters: 'If someone can create unlimited tokens, they can crash the price to zero instantly by flooding the market.',
  },

  freezeAuthority: {
    name: 'Freeze Authority',
    emoji: '❄️',
    risk: 'high',
    description: 'Whether the token creator can freeze your tokens, preventing you from selling.',
    safe: 'Freeze authority revoked - your tokens cannot be frozen',
    risky: 'Freeze authority active - creator can prevent you from selling (honeypot risk)',
    whyItMatters: 'Honeypot scam: you can buy but not sell. The creator freezes your tokens while they dump.',
  },

  lpLocked: {
    name: 'Liquidity Lock',
    emoji: '🔒',
    risk: 'medium',
    description: 'Whether the trading liquidity is locked and for how long.',
    safe: 'LP locked for 6+ months - liquidity cannot be removed',
    risky: 'LP not locked - creator can remove liquidity anytime (rug pull risk)',
    whyItMatters: 'A rug pull happens when the creator removes all liquidity. You\'re left holding worthless tokens that can\'t be sold.',
  },

  holderConcentration: {
    name: 'Holder Concentration',
    emoji: '🐋',
    risk: 'medium',
    description: 'What percentage of tokens are held by the top wallets.',
    safe: 'Top 10 wallets hold <30% - distributed ownership',
    risky: 'Top 10 wallets hold >50% - whales can crash the price',
    whyItMatters: 'If a few wallets hold most of the supply, they can coordinate to dump, crashing your investment.',
  },

  contractVerified: {
    name: 'Contract Verified',
    emoji: '✅',
    risk: 'medium',
    description: 'Whether the smart contract code is publicly visible and verified.',
    safe: 'Contract verified on explorer - code can be audited',
    risky: 'Contract not verified - hidden code could contain traps',
    whyItMatters: 'Unverified contracts can hide malicious code like hidden taxes, transfer blocks, or owner-only functions.',
  },

  tokenAge: {
    name: 'Token Age',
    emoji: '📅',
    risk: 'low',
    description: 'How long the token has been active.',
    safe: '30+ days old with consistent activity - established',
    risky: 'Less than 24 hours old - very new, highest risk',
    whyItMatters: 'New tokens are most likely to be scams. Older tokens have survived longer but still need due diligence.',
  },

  honeypotSimulation: {
    name: 'Honeypot Test',
    emoji: '🍯',
    risk: 'critical',
    description: 'Simulation that tests if you can actually sell the token after buying.',
    safe: 'Sell simulation passed - you can sell your tokens',
    risky: 'Sell simulation failed - YOU CANNOT SELL (honeypot)',
    whyItMatters: 'This is the ultimate scam check. If you can\'t sell, your investment is worthless. Always verify before buying.',
  },

  mevProtection: {
    name: 'MEV Protection',
    emoji: '🛡️',
    risk: 'medium',
    description: 'Protection against bots front-running your trades.',
    safe: 'MEV protection active - your trades are protected',
    risky: 'No MEV protection - bots may sandwich your trades',
    whyItMatters: 'MEV bots can see your pending transaction and buy before you, then sell to you at a higher price. You lose money on every trade.',
  },
}

export const SIGNAL_EXPLANATIONS = {
  STRONG_BUY: {
    name: 'Strong Buy',
    emoji: '🚀',
    color: '#39FF14',
    description: 'Multiple indicators strongly suggest price will rise',
    action: 'Consider entering a position with proper risk management',
  },
  BUY: {
    name: 'Buy',
    emoji: '📈',
    color: '#00D4FF',
    description: 'Indicators lean bullish, favorable entry point',
    action: 'Consider a smaller position or wait for confirmation',
  },
  HOLD: {
    name: 'Hold',
    emoji: '⏸️',
    color: '#888888',
    description: 'Mixed signals, no clear direction',
    action: 'If you own it, hold. If you don\'t, wait for clearer signals',
  },
  SELL: {
    name: 'Sell',
    emoji: '📉',
    color: '#FF6B6B',
    description: 'Indicators lean bearish, consider taking profits',
    action: 'Consider reducing position or setting stop-losses',
  },
  STRONG_SELL: {
    name: 'Strong Sell',
    emoji: '🚨',
    color: '#FF4444',
    description: 'Multiple indicators strongly suggest price will fall',
    action: 'Consider exiting position or hedging',
  },
}

export const getMetricExplanation = (key) => METRIC_EXPLANATIONS[key] || null
export const getSafetyExplanation = (key) => SAFETY_EXPLANATIONS[key] || null
export const getSignalExplanation = (signal) => SIGNAL_EXPLANATIONS[signal?.toUpperCase()] || null

export default { METRIC_EXPLANATIONS, SAFETY_EXPLANATIONS, SIGNAL_EXPLANATIONS }
