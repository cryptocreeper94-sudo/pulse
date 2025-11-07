// DarkWave-V2 Mini App JavaScript - Complete Edition with ALL Features

// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.enableClosingConfirmation();
}

// API Configuration
const API_BASE = window.location.origin;

// State Management
const state = {
  currentTab: 'analysis',
  currentCategory: 'bluechip',
  currentBlockchain: 'all',
  userId: tg?.initDataUnsafe?.user?.id || 'demo-user',
  currentAnalysis: null
};

// ===== FEATURED TOKENS CONFIGURATION =====
// Paste your token contract addresses here as you get them
const FEATURED_TOKENS = [
  // Token #1: Justice for Humanity
  { 
    address: '22PXfkPGkhVUwMqQaeFzjtdzyFNU8ZQRk2shifwAuSkx',
    name: 'Justice for Humanity',
    symbol: '$JH-25',
    description: 'A movement for global justice and humanitarian causes',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #2: United
  { 
    address: 'Gvt8zjmMrUXKgvckQzJMobsegF373M6ALYtmCq6qpump',
    name: 'United',
    symbol: '$LOVE',
    description: 'United in love and community',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #3: Illuminati
  { 
    address: 'FXXVV7T7MHptzLMd9b4cCtUYpqqbVg8rUGxMtRTuUq5k',
    name: 'Illuminati',
    symbol: '$OBEY',
    description: 'The all-seeing eye watches',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #4: Vertigo I
  { 
    address: 'DitutwBDmEU1fM82ePTymzjLStjraLdwSQDwvSdgCmTs',
    name: 'Vertigo I',
    symbol: '$V-25',
    description: 'Experience the rush',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #5: Pumpaholic - 2025
  { 
    address: '3gyRB7GVxzM4tUj41WvWpcgaHqbmZsvU7ANP9vnaLSgZ',
    name: 'Pumpaholic - 2025',
    symbol: '$CHEERS',
    description: 'Celebrating the pump lifestyle',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #6: Pumpocracy - 2025
  { 
    address: '3eFj4ujRnuWH9SpvHyK9o4VJymkWHKsoweP5916Rywux',
    name: 'Pumpocracy - 2025',
    symbol: '$P-25',
    description: 'Power to the pumpers',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #7: Yahusha
  { 
    address: 'ADRs4hrVr729GDqCS5NeRSrVLPBvErpWJcF69vCJWsZT',
    name: 'Yahusha',
    symbol: '$YAHU',
    description: 'Yahusha token on Solana',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #8: (Not on Dexscreener yet - please provide name/symbol)
  { 
    address: 'ERf16TD1VrUHdhpUFbUJpSPXVu9rbtzrzkKfCbwLMYiP',
    name: 'Token Name TBD',
    symbol: '$TBD',
    description: 'Token description coming soon',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #9: Liquidation (Crypto Cat)
  { 
    address: '4BqYgxjhcc3ew44WEkaxzxxtSUpL62emzmRvuraxpump',
    name: 'Liquidation (Crypto Cat)',
    symbol: '$REKTMEOW',
    description: 'When crypto cats get liquidated',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #10: (Not on Dexscreener yet - please provide name/symbol)
  { 
    address: 'H9BhViZnhNDpUAwv1vpt2waRNLcRNNQ1wYsaWJ6Npump',
    name: 'Token Name TBD',
    symbol: '$TBD',
    description: 'Token description coming soon',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #11: (Not on Dexscreener yet - please provide name/symbol)
  { 
    address: 'HssQ9yerrCxVW32eYvL5XnJPC7zfRT9E6SpEkKyLpump',
    name: 'Token Name TBD',
    symbol: '$TBD',
    description: 'Token description coming soon',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #12: (Not on Dexscreener yet - please provide name/symbol)
  { 
    address: 'HEkEQd1nwvD7qiRHcwLEw9d7bnsg2PffrkZrWMkKpump',
    name: 'Token Name TBD',
    symbol: '$TBD',
    description: 'Token description coming soon',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #13: (Not on Dexscreener yet - please provide name/symbol)
  { 
    address: 'CyokFVBYyvdDzvScSSpHeJ3gR2oGPU5o9CjBHXwkpump',
    name: 'Token Name TBD',
    symbol: '$TBD',
    description: 'Token description coming soon',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Add more tokens below as you send them:
  
];

// Category Quick Picks Data
const CATEGORY_DATA = {
  bluechip: {
    icon: '🔵',
    title: 'Blue Chip Crypto',
    description: 'Top market cap cryptocurrencies with proven track records',
    placeholder: 'Search BTC, ETH, SOL...',
    quickPicks: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'DOT'],
    showBlockchain: true
  },
  stocks: {
    icon: '📈',
    title: 'Stock Market',
    description: 'Analyze stocks with comprehensive technical indicators',
    placeholder: 'Search AAPL, AMD, NVDA...',
    quickPicks: ['AAPL', 'AMD', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'META', 'AMZN'],
    showBlockchain: false
  },
  meme: {
    icon: '🐸',
    title: 'Meme Coins',
    description: 'High-volatility meme coins and community tokens',
    placeholder: 'Search PEPE, DOGE, SHIB...',
    quickPicks: ['PEPE', 'DOGE', 'SHIB', 'WIF', 'BONK', 'FLOKI', 'MEME', 'DEGEN'],
    showBlockchain: true
  },
  defi: {
    icon: '💎',
    title: 'DeFi Tokens',
    description: 'Decentralized finance protocols and governance tokens',
    placeholder: 'Search UNI, AAVE, CRV...',
    quickPicks: ['UNI', 'AAVE', 'MKR', 'CRV', 'COMP', 'SNX', 'SUSHI', 'LDO'],
    showBlockchain: true
  },
  dex: {
    icon: '🔄',
    title: 'DEX Pairs',
    description: 'Search any token pair across all DEXes and chains',
    placeholder: 'Search token name or address...',
    quickPicks: [],
    showBlockchain: true
  }
};

// Comprehensive Trading Glossary
const GLOSSARY_TERMS = [
  {
    term: 'RSI',
    full: 'Relative Strength Index',
    level: 'beginner',
    definition: 'A momentum indicator that measures the speed and magnitude of price changes on a scale of 0-100. Values above 70 suggest overbought conditions, while values below 30 indicate oversold conditions.',
    example: 'If BTC has an RSI of 25, it may be oversold and due for a bounce upward.'
  },
  {
    term: 'MACD',
    full: 'Moving Average Convergence Divergence',
    level: 'intermediate',
    definition: 'A trend-following momentum indicator that shows the relationship between two exponential moving averages (12-day and 26-day). When MACD crosses above the signal line, it generates a bullish signal.',
    example: 'A MACD crossover from -2.5 to +1.2 suggests strengthening upward momentum.'
  },
  {
    term: 'EMA',
    full: 'Exponential Moving Average',
    level: 'beginner',
    definition: 'A type of moving average that gives more weight to recent prices, making it more responsive to new information than a simple moving average.',
    example: 'The 50-day EMA is often used to identify the medium-term trend direction.'
  },
  {
    term: 'SMA',
    full: 'Simple Moving Average',
    level: 'beginner',
    definition: 'The average price over a specific number of periods, calculated by adding closing prices and dividing by the number of periods. Smooths out price data to identify trends.',
    example: 'A 200-day SMA is commonly used to determine the long-term trend - prices above it suggest a bull market.'
  },
  {
    term: 'Support',
    level: 'beginner',
    definition: 'A price level where buying interest is strong enough to prevent the price from falling further. Acts as a "floor" for the price.',
    example: 'If ETH repeatedly bounces at $3,000, that level becomes a strong support zone.'
  },
  {
    term: 'Resistance',
    level: 'beginner',
    definition: 'A price level where selling pressure is strong enough to prevent the price from rising higher. Acts as a "ceiling" for the price.',
    example: 'If SOL fails to break above $150 multiple times, that becomes a resistance level.'
  },
  {
    term: 'Bollinger Bands',
    level: 'intermediate',
    definition: 'Volatility indicator consisting of a moving average with upper and lower bands 2 standard deviations away. Price touching the upper band suggests overbought, lower band suggests oversold.',
    example: 'When price breaks above the upper Bollinger Band, it often indicates strong momentum but potential reversal.'
  },
  {
    term: 'Volume',
    level: 'beginner',
    definition: 'The number of shares or coins traded during a specific period. High volume confirms trend strength, while low volume suggests weak conviction.',
    example: 'A price breakout with 3x average volume is more reliable than one with low volume.'
  },
  {
    term: 'Market Cap',
    full: 'Market Capitalization',
    level: 'beginner',
    definition: 'The total value of all coins or shares in circulation, calculated as price × circulating supply. Indicates the relative size of an asset.',
    example: 'BTC with a $1.2T market cap is a blue chip, while a $50M cap coin is considered small cap.'
  },
  {
    term: 'Liquidity',
    level: 'intermediate',
    definition: 'How easily an asset can be bought or sold without significantly affecting its price. Higher liquidity means tighter spreads and less slippage.',
    example: 'A DEX pair with $10M liquidity will have less slippage than one with $100K.'
  },
  {
    term: 'Bull Market',
    level: 'beginner',
    definition: 'A market condition characterized by rising prices and optimistic investor sentiment, typically defined as a 20%+ increase from recent lows.',
    example: 'The 2021 crypto bull market saw BTC rise from $10K to $69K.'
  },
  {
    term: 'Bear Market',
    level: 'beginner',
    definition: 'A market condition characterized by falling prices and pessimistic sentiment, typically defined as a 20%+ decline from recent highs.',
    example: 'The 2022 bear market saw many altcoins drop 80-90% from their peaks.'
  },
  {
    term: 'Breakout',
    level: 'intermediate',
    definition: 'When price moves above a resistance level or below a support level with increased volume, often signaling the start of a new trend.',
    example: 'BTC breaking above $50K resistance with high volume could signal a move to $60K.'
  },
  {
    term: 'Consolidation',
    level: 'intermediate',
    definition: 'A period where price moves sideways in a tight range, typically occurring after a strong move as the market digests gains or losses.',
    example: 'After rallying 40%, ETH consolidated between $3,200-$3,400 for two weeks.'
  },
  {
    term: 'Divergence',
    level: 'advanced',
    definition: 'When price and an indicator (like RSI or MACD) move in opposite directions. Bullish divergence: price makes lower lows while indicator makes higher lows. Bearish divergence: opposite.',
    example: 'Price making new lows while RSI makes higher lows (bullish divergence) often precedes a reversal.'
  },
  {
    term: 'Stop Loss',
    level: 'beginner',
    definition: 'An order placed to automatically sell an asset when it reaches a specific price, limiting potential losses on a trade.',
    example: 'Setting a stop loss at $95 when buying at $100 limits your maximum loss to 5%.'
  },
  {
    term: 'Take Profit',
    level: 'beginner',
    definition: 'An order to automatically sell an asset when it reaches a target price, locking in gains.',
    example: 'Setting a take profit at $120 when buying at $100 secures a 20% gain.'
  },
  {
    term: 'DCA',
    full: 'Dollar-Cost Averaging',
    level: 'beginner',
    definition: 'An investment strategy of buying fixed dollar amounts at regular intervals regardless of price, reducing the impact of volatility.',
    example: 'Buying $100 of BTC every week averages out your entry price over time.'
  },
  {
    term: 'ATH',
    full: 'All-Time High',
    level: 'beginner',
    definition: 'The highest price an asset has ever reached in its trading history.',
    example: 'BTC\'s ATH was $69,000 in November 2021.'
  },
  {
    term: 'ATL',
    full: 'All-Time Low',
    level: 'beginner',
    definition: 'The lowest price an asset has ever reached since it began trading.',
    example: 'Many altcoins hit new ATLs during the 2022 bear market.'
  },
  {
    term: 'FOMO',
    full: 'Fear Of Missing Out',
    level: 'beginner',
    definition: 'The anxiety of potentially missing a profitable opportunity, often leading to impulsive buying at high prices.',
    example: 'FOMO drove many retail investors to buy BTC near $69K in 2021.'
  },
  {
    term: 'FUD',
    full: 'Fear, Uncertainty, and Doubt',
    level: 'beginner',
    definition: 'Negative information or rumors spread to create fear and drive prices down, sometimes deliberately by competitors or short sellers.',
    example: 'Regulatory FUD can cause sudden price drops even without actual policy changes.'
  },
  {
    term: 'Whale',
    level: 'intermediate',
    definition: 'An individual or entity that holds a very large amount of a cryptocurrency, capable of moving the market with their trades.',
    example: 'A whale selling 10,000 BTC can cause significant price drops.'
  },
  {
    term: 'Rug Pull',
    level: 'intermediate',
    definition: 'A scam where developers abandon a project and run away with investors\' funds, common in new DeFi tokens and meme coins.',
    example: 'The project\'s liquidity was drained overnight - it was a rug pull.'
  },
  {
    term: 'Gas Fees',
    level: 'beginner',
    definition: 'Transaction fees paid to blockchain validators for processing transactions. Varies by network congestion.',
    example: 'Ethereum gas fees can range from $2 during low activity to $50+ during high demand.'
  },
  {
    term: 'Slippage',
    level: 'intermediate',
    definition: 'The difference between the expected price of a trade and the actual executed price, caused by market movement or low liquidity.',
    example: 'With 5% slippage, a $100 buy order might execute at $105 in a fast-moving market.'
  },
  {
    term: 'Pump and Dump',
    level: 'intermediate',
    definition: 'A scheme where a group artificially inflates (pumps) the price of an asset through coordinated buying or hype, then sells (dumps) at the peak.',
    example: 'The coin pumped 300% in an hour, then crashed 90% - classic pump and dump.'
  },
  {
    term: 'Hodl',
    level: 'beginner',
    definition: 'A misspelling of "hold" that became a meme, meaning to hold crypto long-term regardless of price fluctuations.',
    example: 'Many BTC hodlers who held through the 2018 bear market profited in 2021.'
  },
  {
    term: 'Market Order',
    level: 'beginner',
    definition: 'An order to buy or sell immediately at the current market price, guaranteeing execution but not price.',
    example: 'A market order to buy 1 ETH will execute instantly at whatever price sellers are offering.'
  },
  {
    term: 'Limit Order',
    level: 'beginner',
    definition: 'An order to buy or sell at a specific price or better. Won\'t execute until the market reaches that price.',
    example: 'A limit buy order at $50K for BTC will only execute if BTC drops to $50K or below.'
  }
];

// Technical term tooltips
const TOOLTIPS = {
  'RSI': 'Relative Strength Index - Momentum indicator measuring overbought (>70) or oversold (<30) conditions on a 0-100 scale',
  'MACD': 'Moving Average Convergence Divergence - Trend-following momentum indicator showing relationship between two moving averages',
  'EMA': 'Exponential Moving Average - Weighted average giving more importance to recent prices, responds faster to price changes',
  'SMA': 'Simple Moving Average - Average price over a specific time period, smooths out price data to identify trends',
  'Bollinger Bands': 'Volatility indicator with upper/lower bands around a moving average - price touching bands suggests overbought/oversold',
  'Volume': 'Number of shares/coins traded - high volume confirms trend strength, low volume suggests weak trends',
  'Support': 'Price level where buying interest prevents further decline - acts as a floor',
  'Resistance': 'Price level where selling interest prevents further gains - acts as a ceiling',
  'Liquidity': 'How easily an asset can be bought/sold without affecting price - higher is better for trading',
  'Market Cap': 'Total value of all coins/shares in circulation - calculated as price × circulating supply'
};

// Add tooltips to text containing technical terms
function addTooltips(text) {
  if (!text) return text;
  let result = text;
  
  for (const [term, definition] of Object.entries(TOOLTIPS)) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    result = result.replace(regex, match => {
      return `<span class="tooltip">${match}<span class="tooltip-text">${definition}</span></span>`;
    });
  }
  
  return result;
}

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const analysisResult = document.getElementById('analysisResult');
const loadingSpinner = document.getElementById('loadingSpinner');
const toast = document.getElementById('toast');

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    switchTab(tab);
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  });
});

function switchTab(tabName) {
  state.currentTab = tabName;
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === tabName);
  });
  
  loadTabContent(tabName);
}

async function loadTabContent(tabName) {
  switch(tabName) {
    case 'holdings':
      await loadHoldings();
      break;
    case 'wallet':
      await loadWallet();
      break;
    case 'settings':
      await loadSettings();
      break;
  }
}

// Category Navigation
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;
    switchCategory(category);
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  });
});

function switchCategory(category) {
  state.currentCategory = category;
  
  // Update active button
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  
  // Update UI for category
  updateCategoryUI(category);
}

function updateCategoryUI(category) {
  const data = CATEGORY_DATA[category];
  
  // Update search placeholder
  searchInput.placeholder = data.placeholder;
  
  // Show/hide blockchain filter
  const blockchainFilter = document.getElementById('blockchainFilter');
  if (blockchainFilter) {
    blockchainFilter.style.display = data.showBlockchain ? 'flex' : 'none';
  }
  
  // Update quick picks
  const quickPicksContainer = document.getElementById('quickPicksContainer');
  if (data.quickPicks && data.quickPicks.length > 0) {
    quickPicksContainer.innerHTML = `
      <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem; font-weight: 600;">
        ${data.icon} Popular ${data.title}
      </h3>
      <div class="quick-picks">
        ${data.quickPicks.map(ticker => `
          <button class="quick-pick-btn" data-ticker="${ticker}">${ticker}</button>
        `).join('')}
      </div>
    `;
    
    // Add click handlers to new quick pick buttons
    quickPicksContainer.querySelectorAll('.quick-pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        searchInput.value = btn.dataset.ticker;
        performSearch();
        if (tg) tg.HapticFeedback?.impactOccurred('medium');
      });
    });
  } else {
    quickPicksContainer.innerHTML = '';
  }
  
  // Update welcome card
  analysisResult.innerHTML = `
    <div class="welcome-card">
      <div class="welcome-icon">${data.icon}</div>
      <h2>${data.title}</h2>
      <p>${data.description}</p>
    </div>
  `;
}

// Blockchain Filter
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const chain = chip.dataset.chain;
    state.currentBlockchain = chain;
    
    document.querySelectorAll('.filter-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.chain === chain);
    });
    
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  });
});

// Initialize with Blue Chip category
updateCategoryUI('bluechip');

// Search Functionality
searchBtn.addEventListener('click', () => performSearch());
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performSearch();
});

async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  
  showLoading();
  if (tg) tg.HapticFeedback?.impactOccurred('light');
  
  try {
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ticker: query,
        userId: state.userId 
      })
    });
    
    const data = await response.json();
    if (data.error) {
      showToast(data.error);
      hideLoading();
      return;
    }
    
    state.currentAnalysis = data;
    displayAnalysis(data);
    
    // Load chart in background
    loadChart(query);
  } catch (error) {
    showToast('Error fetching analysis. Please try again.');
    console.error('Search error:', error);
  } finally {
    hideLoading();
  }
}

function displayAnalysis(data) {
  const signal = data.recommendation || 'HOLD';
  const signalClass = signal.includes('BUY') ? 'buy' : signal.includes('SELL') ? 'sell' : 'hold';
  const priceChange = data.priceChange || 0;
  const priceChangeClass = priceChange >= 0 ? 'positive' : 'negative';
  
  const card = document.createElement('div');
  card.className = 'analysis-card';
  card.style.cssText = 'animation: slideUp 0.3s ease-out;';
  
  card.innerHTML = `
    <div class="analysis-header">
      <div>
        <div class="ticker-name">${data.ticker}</div>
        <div class="price-value">$${data.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</div>
        <div class="price-change ${priceChangeClass}">
          ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}% (${data.priceChangeDollar >= 0 ? '+' : ''}$${Math.abs(data.priceChangeDollar).toFixed(2)})
        </div>
      </div>
      <div class="signal-badge ${signalClass}">
        ${signal.includes('BUY') ? '🟢' : signal.includes('SELL') ? '🔴' : '🟡'} ${signal}
      </div>
    </div>
    
    <div class="chart-container" id="chartContainer" style="margin: 15px 0; min-height: 200px; background: rgba(255,255,255,0.05); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
      <div>📈 Loading chart...</div>
    </div>
    
    <div style="margin-top: 20px;">
      <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">📊 CORE INDICATORS</h3>
      <div class="indicators-grid">
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">RSI<span class="tooltip-text">Relative Strength Index - Momentum indicator measuring overbought (>70) or oversold (<30) conditions on a 0-100 scale</span></span> (14)</div>
          <div class="indicator-value" style="color: ${data.rsi > 70 ? '#E63946' : data.rsi < 30 ? '#4ADE80' : '#fff'}">${data.rsi?.toFixed(1) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">MACD<span class="tooltip-text">Moving Average Convergence Divergence - Trend-following momentum indicator showing relationship between two moving averages</span></span></div>
          <div class="indicator-value">${data.macd?.value?.toFixed(2) || 'N/A'}</div>
          <div style="font-size:0.7rem; color: var(--text-secondary);">Signal: ${data.macd?.signal?.toFixed(2) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">24h High/Low<span class="tooltip-text">Highest and lowest price in the last 24 hours - shows the price range and daily volatility</span></span></div>
          <div class="indicator-value" style="font-size: 0.85rem;">
            $${data.high24h?.toFixed(2) || 'N/A'}<br>
            $${data.low24h?.toFixed(2) || 'N/A'}
          </div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">Volatility<span class="tooltip-text">Measures how much the price fluctuates - higher volatility means bigger price swings and more risk/reward potential</span></span></div>
          <div class="indicator-value">${data.volatility?.toFixed(2) || 'N/A'}%</div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 20px;">
      <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">📈 MOVING AVERAGES</h3>
      <div class="indicators-grid">
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">EMA<span class="tooltip-text">Exponential Moving Average - Weighted average giving more importance to recent prices, responds faster to price changes</span></span> 50</div>
          <div class="indicator-value">$${data.ema50?.toFixed(2) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">EMA<span class="tooltip-text">Exponential Moving Average - Weighted average giving more importance to recent prices, responds faster to price changes</span></span> 200</div>
          <div class="indicator-value">$${data.ema200?.toFixed(2) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">SMA<span class="tooltip-text">Simple Moving Average - Average price over a specific time period, smooths out price data to identify trends</span></span> 50</div>
          <div class="indicator-value">$${data.sma50?.toFixed(2) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">SMA<span class="tooltip-text">Simple Moving Average - Average price over a specific time period, smooths out price data to identify trends</span></span> 200</div>
          <div class="indicator-value">$${data.sma200?.toFixed(2) || 'N/A'}</div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 20px;">
      <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">💎 ADVANCED METRICS</h3>
      <div class="indicators-grid">
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">Volume Delta<span class="tooltip-text">Difference between buying and selling volume - positive means more buying pressure, negative means more selling pressure</span></span></div>
          <div class="indicator-value" style="color: ${data.volumeDelta?.delta >= 0 ? '#4ADE80' : '#E63946'}">
            ${data.volumeDelta?.delta >= 0 ? '+' : ''}${formatVolume(data.volumeDelta?.delta)}
          </div>
          <div style="font-size:0.7rem; color: var(--text-secondary);">
            Buy: ${formatVolume(data.volumeDelta?.buyVolume)}<br>
            Sell: ${formatVolume(data.volumeDelta?.sellVolume)}
          </div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">Buy/Sell Ratio<span class="tooltip-text">Ratio of buying to selling volume - above 1.0 means more buyers than sellers, below 1.0 means more sellers than buyers</span></span></div>
          <div class="indicator-value" style="color: ${data.volumeDelta?.buySellRatio >= 1 ? '#4ADE80' : '#E63946'}">
            ${data.volumeDelta?.buySellRatio?.toFixed(2) || 'N/A'}
          </div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">Spike Score<span class="tooltip-text">Measures unusual price and volume spikes - scores above 70 indicate strong momentum, below 40 suggests weak movement</span></span></div>
          <div class="indicator-value" style="color: ${data.spikeScore?.score > 70 ? '#4ADE80' : data.spikeScore?.score > 40 ? '#F59E0B' : '#E63946'}">
            ${data.spikeScore?.score?.toFixed(1) || 'N/A'}/100
          </div>
          <div style="font-size:0.7rem; color: var(--text-secondary);">${data.spikeScore?.signal || 'NO_SIGNAL'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">Volume<span class="tooltip-text">Number of shares/coins traded - high volume confirms trend strength, low volume suggests weak trends</span></span></div>
          <div class="indicator-value">${formatVolume(data.volume?.current)}</div>
          <div style="font-size:0.7rem; color: ${data.volume?.changePercent >= 0 ? '#4ADE80' : '#E63946'};">
            ${data.volume?.changePercent >= 0 ? '+' : ''}${data.volume?.changePercent?.toFixed(1) || '0'}% vs avg
          </div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 20px;">
      <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">🎯 SUPPORT & RESISTANCE</h3>
      <div class="indicators-grid">
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">Support<span class="tooltip-text">Price level where buying interest prevents further decline - acts as a floor</span></span></div>
          <div class="indicator-value" style="color: #4ADE80;">$${data.support?.toFixed(2) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label"><span class="tooltip">Resistance<span class="tooltip-text">Price level where selling interest prevents further gains - acts as a ceiling</span></span></div>
          <div class="indicator-value" style="color: #E63946;">$${data.resistance?.toFixed(2) || 'N/A'}</div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 20px;">
      <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">📊 BOLLINGER BANDS</h3>
      <div class="indicators-grid">
        <div class="indicator-item">
          <div class="indicator-label">BB Upper</div>
          <div class="indicator-value">$${data.bollingerBands?.upper?.toFixed(2) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">BB Middle</div>
          <div class="indicator-value">$${data.bollingerBands?.middle?.toFixed(2) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">BB Lower</div>
          <div class="indicator-value">$${data.bollingerBands?.lower?.toFixed(2) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">BB Bandwidth</div>
          <div class="indicator-value">${data.bollingerBands?.bandwidth?.toFixed(2) || 'N/A'}%</div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 20px;">
      <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">⏱️ PATTERN DURATION</h3>
      <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
        <div style="font-size: 0.95rem; margin-bottom: 5px;">
          <strong>Type:</strong> ${data.patternDuration?.type || 'Unknown'}
        </div>
        <div style="font-size: 0.95rem; margin-bottom: 5px;">
          <strong>Estimate:</strong> ${data.patternDuration?.estimate || 'Unknown'}
        </div>
        <div style="font-size: 0.95rem;">
          <strong>Confidence:</strong> ${data.patternDuration?.confidence || 'Low'}
        </div>
      </div>
    </div>
    
    ${data.spikeScore?.prediction ? `
      <div style="margin-top: 15px; padding: 12px; background: linear-gradient(135deg, rgba(166, 85, 247, 0.1), rgba(230, 57, 70, 0.1)); border-radius: 8px; border-left: 3px solid #A855F7;">
        <div style="font-weight: 700; margin-bottom: 5px; color: #A855F7;">🔮 AI Prediction</div>
        <div style="font-size: 0.9rem;">${data.spikeScore.prediction}</div>
      </div>
    ` : ''}
    
    ${data.signals && data.signals.length > 0 ? `
      <div style="margin-top: 15px;">
        <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;">🎯 SIGNALS (${data.signalCount?.bullish || 0} Bullish, ${data.signalCount?.bearish || 0} Bearish)</h3>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${data.signals.map(signal => `
            <div style="padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 0.85rem;">
              ${signal}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
    
    <div class="action-buttons" style="margin-top: 20px; display: flex; gap: 8px;">
      <button class="action-btn" style="flex: 1;" onclick="setAlert('${data.ticker}')">🔔 Alert</button>
      <button class="action-btn" style="flex: 1;" onclick="createOrder('${data.ticker}')">💰 Trade</button>
      <button class="action-btn" style="flex: 1;" onclick="addToHoldings('${data.ticker}')">⭐ Hold</button>
    </div>
  `;
  
  analysisResult.innerHTML = '';
  analysisResult.appendChild(card);
}

async function loadChart(ticker) {
  try {
    const response = await fetch(`${API_BASE}/api/chart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, userId: state.userId })
    });
    
    const data = await response.json();
    const chartContainer = document.getElementById('chartContainer');
    
    if (data.success && data.chartUrl && chartContainer) {
      chartContainer.innerHTML = `<img src="${data.chartUrl}" style="width: 100%; border-radius: 8px;" alt="Price Chart" />`;
      
      // Add click handler to open full-screen modal
      chartContainer.onclick = () => openChartModal(data.chartUrl, ticker);
      
      // Store chart URL for modal
      state.currentChartUrl = data.chartUrl;
      state.currentChartTicker = ticker;
    } else {
      chartContainer.innerHTML = '<div style="padding: 20px; color: var(--text-secondary);">Chart unavailable</div>';
    }
  } catch (error) {
    console.error('Chart error:', error);
  }
}

// Chart Modal Functions
function openChartModal(chartUrl, ticker) {
  const modal = document.getElementById('chartModal');
  const modalImage = document.getElementById('chartModalImage');
  const modalTitle = document.getElementById('chartModalTitle');
  
  modalImage.src = chartUrl;
  modalTitle.textContent = `${ticker.toUpperCase()} - Price Chart`;
  modal.classList.add('active');
  
  if (tg) {
    tg.HapticFeedback?.impactOccurred('medium');
  }
  
  // Prevent background scrolling
  document.body.style.overflow = 'hidden';
}

function closeChartModal() {
  const modal = document.getElementById('chartModal');
  modal.classList.remove('active');
  
  // Re-enable background scrolling
  document.body.style.overflow = '';
  
  if (tg) {
    tg.HapticFeedback?.impactOccurred('light');
  }
}

// Modal Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('closeChartModal');
  const modal = document.getElementById('chartModal');
  const modalContent = document.getElementById('chartModalImage');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeChartModal);
  }
  
  if (modal) {
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target === modalContent) {
        closeChartModal();
      }
    });
  }
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeChartModal();
    }
  });
});

function formatVolume(volume) {
  if (!volume && volume !== 0) return 'N/A';
  const absVol = Math.abs(volume);
  if (absVol >= 1e9) return `${volume >= 0 ? '' : '-'}$${(absVol / 1e9).toFixed(2)}B`;
  if (absVol >= 1e6) return `${volume >= 0 ? '' : '-'}$${(absVol / 1e6).toFixed(2)}M`;
  if (absVol >= 1e3) return `${volume >= 0 ? '' : '-'}$${(absVol / 1e3).toFixed(2)}K`;
  return `${volume >= 0 ? '' : '-'}$${absVol.toFixed(2)}`;
}

// Holdings
async function loadHoldings() {
  const holdingsList = document.getElementById('holdingsList');
  holdingsList.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  
  try {
    const response = await fetch(`${API_BASE}/api/holdings?userId=${state.userId}`);
    const holdings = await response.json();
    
    let html = '';
    
    // Scanner button
    html += `
      <div style="margin-bottom: 15px;">
        <button class="action-btn" onclick="runScanner()" style="width: 100%; padding: 12px;">
          🔍 Scan Market for Buy Signals
        </button>
      </div>
    `;
    
    if (holdings.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-icon">⭐</div>
          <p>No holdings yet</p>
          <button class="action-btn" onclick="switchTab('analysis')">+ Add Ticker</button>
        </div>
      `;
    } else {
      html += holdings.map(h => `
        <div class="holding-card" onclick="searchInput.value='${h.ticker}'; switchTab('analysis'); performSearch();" style="cursor: pointer;">
          <div>
            <div style="font-weight:700; font-size:1.2rem;">${h.ticker}</div>
            <div style="color:var(--text-secondary); font-size:0.9rem;">$${h.price?.toFixed(2)}</div>
          </div>
          <div style="text-align:right;">
            <div class="price-change ${h.change >= 0 ? 'positive' : 'negative'}">
              ${h.change >= 0 ? '+' : ''}${h.change.toFixed(2)}%
            </div>
            <div style="font-size:0.8rem; color: var(--text-secondary);">${formatVolume(h.volume)}</div>
          </div>
        </div>
      `).join('');
    }
    
    holdingsList.innerHTML = html;
  } catch (error) {
    showToast('Error loading holdings');
    console.error('Holdings error:', error);
  }
}

async function runScanner() {
  const holdingsList = document.getElementById('holdingsList');
  const originalContent = holdingsList.innerHTML;
  
  holdingsList.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Scanning top 20 assets...</p></div>';
  if (tg) tg.HapticFeedback?.impactOccurred('medium');
  
  try {
    const response = await fetch(`${API_BASE}/api/scanner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'crypto', limit: 20, userId: state.userId })
    });
    
    const data = await response.json();
    
    let html = `
      <div style="margin-bottom: 15px;">
        <h3 style="margin-bottom: 10px;">📊 Scanner Results (${data.results.length} signals found)</h3>
        <button class="action-btn" onclick="loadHoldings()" style="width: 100%; padding: 8px; font-size: 0.9rem;">
          ← Back to Watchlist
        </button>
      </div>
    `;
    
    if (data.results.length > 0) {
      html += data.results.map(asset => `
        <div class="holding-card" onclick="searchInput.value='${asset.ticker}'; switchTab('analysis'); performSearch();" style="cursor: pointer; border-left: 3px solid #4ADE80;">
          <div>
            <div style="font-weight:700; font-size:1.1rem;">${asset.ticker}</div>
            <div style="color:var(--text-secondary); font-size:0.85rem;">${asset.name}</div>
            <div style="font-size:0.75rem; color: #4ADE80; margin-top: 4px;">${asset.recommendation}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1rem; font-weight: 600;">$${asset.currentPrice?.toFixed(2)}</div>
            <div class="price-change positive">+${asset.priceChangePercent24h?.toFixed(2)}%</div>
            <div style="font-size:0.75rem; color: var(--text-secondary);">RSI: ${asset.rsi?.toFixed(1)}</div>
          </div>
        </div>
      `).join('');
    } else {
      html += '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No strong buy signals found</div>';
    }
    
    holdingsList.innerHTML = html;
    if (tg) tg.HapticFeedback?.notificationOccurred('success');
  } catch (error) {
    showToast('Scanner error');
    holdingsList.innerHTML = originalContent;
    console.error('Scanner error:', error);
  }
}

async function addToHoldings(ticker) {
  try {
    await fetch(`${API_BASE}/api/holdings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, userId: state.userId })
    });
    showToast(`${ticker} added to watchlist!`);
    if (tg) tg.HapticFeedback?.notificationOccurred('success');
  } catch (error) {
    showToast('Error adding to watchlist');
  }
}

// Wallet
async function loadWallet() {
  try {
    const response = await fetch(`${API_BASE}/api/wallet?userId=${state.userId}`);
    const wallet = await response.json();
    
    const walletStatus = document.getElementById('walletStatus');
    const walletBalance = document.getElementById('walletBalance');
    const walletInputSection = document.getElementById('walletInputSection');
    const walletDisconnectSection = document.getElementById('walletDisconnectSection');
    const fullWalletAddress = document.getElementById('fullWalletAddress');
    const limitOrdersSection = document.getElementById('limitOrdersSection');
    const snipingSection = document.getElementById('snipingSection');
    
    if (wallet.connected) {
      walletStatus.textContent = `${wallet.address.slice(0,6)}...${wallet.address.slice(-4)}`;
      walletStatus.className = 'status-badge connected';
      walletBalance.classList.remove('hidden');
      walletInputSection.classList.add('hidden');
      walletDisconnectSection.classList.remove('hidden');
      fullWalletAddress.textContent = wallet.address;
      document.getElementById('solBalance').textContent = wallet.balance.toFixed(4);
      
      // Show trading features
      limitOrdersSection.classList.remove('hidden');
      snipingSection.classList.remove('hidden');
      
      // Load trading data
      await loadLimitOrders();
      await loadSniping();
    } else {
      walletStatus.textContent = 'Not Connected';
      walletStatus.className = 'status-badge disconnected';
      walletBalance.classList.add('hidden');
      walletInputSection.classList.remove('hidden');
      walletDisconnectSection.classList.add('hidden');
      limitOrdersSection.classList.add('hidden');
      snipingSection.classList.add('hidden');
    }
  } catch (error) {
    console.error('Wallet error:', error);
  }
}

document.getElementById('connectWalletBtn')?.addEventListener('click', async () => {
  const input = document.getElementById('walletAddressInput').value.trim();
  if (!input) {
    showToast('Please enter a wallet address');
    return;
  }
  
  try {
    await fetch(`${API_BASE}/api/wallet/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: input, userId: state.userId })
    });
    showToast('Wallet connected! ✅');
    if (tg) tg.HapticFeedback?.notificationOccurred('success');
    document.getElementById('walletAddressInput').value = '';
    await loadWallet();
  } catch (error) {
    showToast('Error connecting wallet');
  }
});

document.getElementById('disconnectWalletBtn')?.addEventListener('click', async () => {
  try {
    await fetch(`${API_BASE}/api/wallet/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.userId })
    });
    showToast('Wallet disconnected');
    if (tg) tg.HapticFeedback?.notificationOccurred('warning');
    await loadWallet();
  } catch (error) {
    showToast('Error disconnecting wallet');
  }
});

document.getElementById('refreshBalanceBtn')?.addEventListener('click', async () => {
  showToast('Refreshing balance...');
  await loadWallet();
  if (tg) tg.HapticFeedback?.impactOccurred('light');
});

// Limit Orders
async function loadLimitOrders() {
  try {
    const response = await fetch(`${API_BASE}/api/limit-orders?userId=${state.userId}`);
    const data = await response.json();
    
    const ordersList = document.getElementById('ordersList');
    const limitOrdersSection = document.getElementById('limitOrdersSection');
    
    if (data.orders && data.orders.length > 0) {
      let html = '';
      data.orders.forEach(order => {
        const typeColor = order.type === 'buy' ? '#4ADE80' : '#E63946';
        html += `
          <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 600; color: ${typeColor};">${order.type.toUpperCase()} ${order.ticker}</span>
              <span style="font-size: 0.85rem; padding: 3px 8px; border-radius: 10px; background: rgba(168, 85, 247, 0.2); color: #A855F7;">${order.status}</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">
              Target: $${order.targetPrice} | Amount: ${order.amount}
            </div>
          </div>
        `;
      });
      ordersList.innerHTML = html;
    } else {
      ordersList.innerHTML = '<div class="empty-state" style="text-align: center; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 8px;"><p style="color: var(--text-secondary); font-size: 0.9rem;">No active orders</p></div>';
    }
  } catch (error) {
    console.error('Error loading limit orders:', error);
  }
}

document.getElementById('createOrderBtn')?.addEventListener('click', () => {
  document.getElementById('createOrderForm').classList.remove('hidden');
  if (tg) tg.HapticFeedback?.impactOccurred('light');
});

document.getElementById('cancelOrderFormBtn')?.addEventListener('click', () => {
  document.getElementById('createOrderForm').classList.add('hidden');
  document.getElementById('orderTicker').value = '';
  document.getElementById('orderPrice').value = '';
  document.getElementById('orderAmount').value = '';
});

document.getElementById('submitOrderBtn')?.addEventListener('click', async () => {
  const orderType = document.getElementById('orderType').value;
  const ticker = document.getElementById('orderTicker').value.trim().toUpperCase();
  const targetPrice = parseFloat(document.getElementById('orderPrice').value);
  const amount = parseFloat(document.getElementById('orderAmount').value);
  
  if (!ticker || !targetPrice || !amount) {
    showToast('Please fill all fields');
    return;
  }
  
  try {
    await fetch(`${API_BASE}/api/limit-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.userId, orderType, ticker, targetPrice, amount })
    });
    showToast('Limit order created! ✅');
    if (tg) tg.HapticFeedback?.notificationOccurred('success');
    document.getElementById('createOrderForm').classList.add('hidden');
    document.getElementById('orderTicker').value = '';
    document.getElementById('orderPrice').value = '';
    document.getElementById('orderAmount').value = '';
    await loadLimitOrders();
  } catch (error) {
    showToast('Error creating order');
  }
});

// Token Sniping
async function loadSniping() {
  try {
    const response = await fetch(`${API_BASE}/api/sniping?userId=${state.userId}`);
    const data = await response.json();
    
    if (data.config) {
      const { enabled, minLiquidity, maxRugScore, autoExecute, maxBuyAmount } = data.config;
      
      const statusEl = document.getElementById('snipingStatus');
      statusEl.textContent = enabled ? 'Enabled' : 'Disabled';
      statusEl.style.background = enabled ? 'rgba(74, 222, 128, 0.2)' : 'rgba(230, 57, 70, 0.2)';
      statusEl.style.color = enabled ? '#4ADE80' : '#E63946';
      
      document.getElementById('snipingMinLiq').textContent = `$${minLiquidity.toLocaleString()}`;
      document.getElementById('snipingMaxRug').textContent = `${maxRugScore}/100`;
      document.getElementById('snipingMaxBuy').textContent = `${maxBuyAmount} SOL`;
      document.getElementById('snipingAutoExecute').textContent = autoExecute ? 'ON' : 'OFF';
    }
  } catch (error) {
    console.error('Error loading sniping config:', error);
  }
}

document.getElementById('configureSnipingBtn')?.addEventListener('click', () => {
  showToast('💡 Configure sniping in the Settings tab!');
  switchTab('settings');
});

// Settings
async function loadSettings() {
  try {
    const response = await fetch(`${API_BASE}/api/settings?userId=${state.userId}`);
    const settings = await response.json();
    
    document.getElementById('toggleAlerts').checked = settings.alerts;
    document.getElementById('toggleAutoMonitor').checked = settings.autoMonitor;
    document.getElementById('toggleSniping').checked = settings.sniping;
    document.getElementById('toggleAutoExecute').checked = settings.autoExecute;
    
    document.querySelectorAll('.scope-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.scope === settings.scope);
    });
    
    document.querySelectorAll('[data-exchange]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.exchange === settings.exchange);
    });
    
    // Load price alerts
    await loadPriceAlerts();
  } catch (error) {
    console.error('Settings load error:', error);
  }
}

// ===== PRICE ALERTS FUNCTIONALITY =====
async function loadPriceAlerts() {
  try {
    const response = await fetch(`${API_BASE}/api/alerts?userId=${state.userId}`);
    const data = await response.json();
    
    const alertsList = document.getElementById('alertsList');
    
    if (!data.alerts || data.alerts.length === 0) {
      alertsList.innerHTML = `
        <div class="empty-state" style="padding: 20px; text-align: center;">
          <p style="color: var(--text-secondary); font-size: 0.9rem;">No alerts configured</p>
        </div>
      `;
      return;
    }
    
    alertsList.innerHTML = data.alerts.map(alert => `
      <div class="alert-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--card-bg); border-radius: 8px; margin-bottom: 8px;">
        <div>
          <div style="font-weight: 600;">${alert.ticker}</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary);">
            ${alert.condition === 'above' ? '⬆️' : '⬇️'} ${alert.condition} $${alert.targetPrice}
          </div>
        </div>
        <button class="action-btn danger-btn" onclick="deleteAlert('${alert.id}')" style="padding: 4px 12px; font-size: 0.85rem;">
          🗑️ Delete
        </button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading alerts:', error);
  }
}

async function deleteAlert(alertId) {
  try {
    const response = await fetch(`${API_BASE}/api/alerts/${alertId}?userId=${state.userId}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    
    if (result.success) {
      showToast('✅ Alert deleted');
      await loadPriceAlerts();
      if (tg) tg.HapticFeedback?.notificationOccurred('success');
    } else {
      showToast('❌ Failed to delete alert');
    }
  } catch (error) {
    console.error('Error deleting alert:', error);
    showToast('❌ Error deleting alert');
  }
}

// Add alert button handler
window.addPriceAlert = async function() {
  const ticker = prompt('Enter ticker symbol (e.g., BTC, ETH):');
  if (!ticker) return;
  
  const targetPrice = parseFloat(prompt('Enter target price:'));
  if (!targetPrice || isNaN(targetPrice)) {
    showToast('❌ Invalid price');
    return;
  }
  
  const condition = confirm('Alert when price goes ABOVE this target?\n\nClick OK for ABOVE, Cancel for BELOW') ? 'above' : 'below';
  
  try {
    const response = await fetch(`${API_BASE}/api/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker: ticker.toUpperCase(),
        targetPrice,
        condition,
        userId: state.userId
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(`✅ Alert created: ${ticker} ${condition} $${targetPrice}`);
      await loadPriceAlerts();
      if (tg) tg.HapticFeedback?.notificationOccurred('success');
    } else {
      showToast('❌ Failed to create alert');
    }
  } catch (error) {
    console.error('Error creating alert:', error);
    showToast('❌ Error creating alert');
  }
}

['toggleAlerts', 'toggleAutoMonitor', 'toggleSniping', 'toggleAutoExecute'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', async (e) => {
    const setting = id.replace('toggle', '').charAt(0).toLowerCase() + id.replace('toggle', '').slice(1);
    await updateSetting(setting, e.target.checked);
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  });
});

document.querySelectorAll('.scope-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const scope = btn.dataset.scope;
    if (scope) {
      document.querySelectorAll('.scope-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      await updateSetting('scope', scope);
      if (tg) tg.HapticFeedback?.impactOccurred('light');
    }
    
    const exchange = btn.dataset.exchange;
    if (exchange) {
      document.querySelectorAll('[data-exchange]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      await updateSetting('exchange', exchange);
      if (tg) tg.HapticFeedback?.impactOccurred('light');
    }
  });
});

async function updateSetting(key, value) {
  try {
    await fetch(`${API_BASE}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: state.userId,
        [key]: value 
      })
    });
    showToast('Settings updated!');
  } catch (error) {
    showToast('Error updating settings');
  }
}

// Helper functions
function setAlert(ticker) {
  const price = prompt(`Set alert price for ${ticker}:`);
  if (price) {
    showToast(`Alert set for ${ticker} at $${price}`);
    if (tg) tg.HapticFeedback?.notificationOccurred('success');
  }
}

function createOrder(ticker) {
  showToast(`Opening order form for ${ticker}...`);
  if (tg) tg.HapticFeedback?.impactOccurred('medium');
}

function showLoading() {
  loadingSpinner.classList.remove('hidden');
  analysisResult.classList.add('hidden');
}

function hideLoading() {
  loadingSpinner.classList.add('hidden');
  analysisResult.classList.remove('hidden');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

document.getElementById('refreshBtn')?.addEventListener('click', () => {
  if (state.currentTab === 'analysis' && searchInput.value) {
    performSearch();
  } else {
    loadTabContent(state.currentTab);
  }
  if (tg) tg.HapticFeedback?.impactOccurred('light');
});

document.getElementById('settingsBtn')?.addEventListener('click', () => {
  switchTab('settings');
  if (tg) tg.HapticFeedback?.impactOccurred('light');
});

// Scan button in holdings tab
document.getElementById('scanBtn')?.addEventListener('click', runScanner);

// Add alert button
document.getElementById('addAlertBtn')?.addEventListener('click', () => {
  addPriceAlert();
  if (tg) tg.HapticFeedback?.impactOccurred('medium');
});

// ===== GLOSSARY FUNCTIONALITY =====
let currentLetter = 'ALL';
let expandedTerms = new Set();

function renderGlossary(searchTerm = '') {
  const glossaryContent = document.getElementById('glossaryContent');
  
  let filteredTerms = GLOSSARY_TERMS;
  
  // Filter by search term
  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    filteredTerms = filteredTerms.filter(t => 
      t.term.toLowerCase().includes(search) ||
      (t.full && t.full.toLowerCase().includes(search)) ||
      t.definition.toLowerCase().includes(search)
    );
  }
  
  // Filter by letter if not ALL
  if (currentLetter !== 'ALL') {
    filteredTerms = filteredTerms.filter(t => t.term.charAt(0).toUpperCase() === currentLetter);
  }
  
  if (filteredTerms.length === 0) {
    glossaryContent.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 40px;">
        <div style="font-size: 3rem; margin-bottom: 16px;">📚</div>
        <p style="color: var(--text-secondary);">No terms found</p>
      </div>
    `;
    return;
  }
  
  // Group by first letter
  const grouped = {};
  filteredTerms.forEach(term => {
    const letter = term.term.charAt(0).toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(term);
  });
  
  // Sort alphabetically
  const letters = Object.keys(grouped).sort();
  
  glossaryContent.innerHTML = letters.map(letter => `
    <div class="letter-group" style="margin-bottom: 24px;">
      <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-bottom: 12px; padding: 8px 0; border-bottom: 2px solid var(--primary);">
        ${letter}
      </div>
      ${grouped[letter].map(term => {
        const termId = term.term.replace(/\s+/g, '-').toLowerCase();
        const isExpanded = expandedTerms.has(termId);
        return `
          <div class="glossary-term-compact" style="margin-bottom: 8px; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 8px; overflow: hidden;">
            <div class="glossary-term-header-compact" onclick="toggleTerm('${termId}')" style="padding: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: ${isExpanded ? 'rgba(168, 85, 247, 0.1)' : 'transparent'};">
              <div>
                <span style="font-weight: 600; font-size: 1rem;">${term.term}</span>
                ${term.full ? `<span style="color: var(--text-secondary); font-size: 0.85rem; margin-left: 8px;">(${term.full})</span>` : ''}
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span class="glossary-term-level ${term.level}" style="padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">${term.level.toUpperCase()}</span>
                <span style="font-size: 1.2rem; transition: transform 0.2s; transform: rotate(${isExpanded ? '180deg' : '0deg'});">▼</span>
              </div>
            </div>
            <div id="term-${termId}" class="glossary-term-content" style="display: ${isExpanded ? 'block' : 'none'}; padding: 0 12px 12px 12px;">
              <div style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 8px;">${term.definition}</div>
              ${term.example ? `<div style="background: rgba(168, 85, 247, 0.1); padding: 8px; border-radius: 4px; font-size: 0.9rem;"><strong>Example:</strong> ${term.example}</div>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `).join('');
}

// Toggle term expansion
window.toggleTerm = function(termId) {
  if (expandedTerms.has(termId)) {
    expandedTerms.delete(termId);
  } else {
    expandedTerms.add(termId);
  }
  renderGlossary(document.getElementById('glossarySearch')?.value || '');
  if (tg) tg.HapticFeedback?.impactOccurred('light');
};

// Glossary search
const glossarySearch = document.getElementById('glossarySearch');
if (glossarySearch) {
  glossarySearch.addEventListener('input', (e) => {
    renderGlossary(e.target.value);
  });
}

// Alphabet navigation buttons
document.querySelectorAll('.path-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const letter = btn.dataset.path.toUpperCase();
    currentLetter = letter;
    
    document.querySelectorAll('.path-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    renderGlossary(glossarySearch?.value || '');
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  });
});

// ===== TOP MOVERS FUNCTIONALITY =====
async function loadTopMovers(category = 'gainers') {
  const moversContent = document.getElementById('moversContent');
  
  moversContent.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading ${category}...</p>
    </div>
  `;
  
  try {
    const response = await fetch(`${API_BASE}/api/movers?category=${category}&userId=${state.userId}`);
    const data = await response.json();
    
    if (!data.movers || data.movers.length === 0) {
      moversContent.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 40px;">
          <div style="font-size: 3rem; margin-bottom: 16px;">🔥</div>
          <p style="color: var(--text-secondary);">No data available</p>
        </div>
      `;
      return;
    }
    
    moversContent.innerHTML = data.movers.map((mover, index) => {
      const changeClass = mover.change >= 0 ? 'positive' : 'negative';
      const changeIcon = mover.change >= 0 ? '📈' : '📉';
      
      return `
        <div class="mover-card" onclick="searchInput.value='${mover.ticker}'; switchTab('analysis'); performSearch();">
          <span class="mover-rank">#${index + 1}</span>
          <div class="mover-info">
            <div class="mover-ticker">${mover.ticker}</div>
            <div class="mover-price">$${mover.price?.toFixed(2) || 'N/A'}</div>
          </div>
          <div class="mover-change ${changeClass}">
            ${changeIcon} ${mover.change >= 0 ? '+' : ''}${mover.change.toFixed(2)}%
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading movers:', error);
    moversContent.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 40px;">
        <div style="font-size: 3rem; margin-bottom: 16px;">⚠️</div>
        <p style="color: var(--text-secondary);">Error loading data</p>
        <button class="action-btn" onclick="loadTopMovers('${category}')" style="margin-top: 16px;">Retry</button>
      </div>
    `;
  }
}

// Mover category buttons
document.querySelectorAll('.mover-category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.moverCategory;
    
    document.querySelectorAll('.mover-category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    loadTopMovers(category);
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  });
});

// Refresh movers button
document.getElementById('refreshMoversBtn')?.addEventListener('click', () => {
  const activeCategory = document.querySelector('.mover-category-btn.active')?.dataset.moverCategory || 'gainers';
  loadTopMovers(activeCategory);
  if (tg) tg.HapticFeedback?.impactOccurred('light');
});

// Update loadTabContent to initialize movers and glossary
const originalLoadTabContent = loadTabContent;
async function loadTabContent(tabName) {
  await originalLoadTabContent(tabName);
  
  if (tabName === 'movers') {
    loadTopMovers('gainers');
  } else if (tabName === 'learn') {
    // Initialize glossary with all terms visible
    renderGlossary('', 'all');
  }
}

// Initialize on DOM ready
console.log('🌊 DarkWave-V2 Mini App loaded with ALL features');
if (tg) {
  console.log('Telegram WebApp initialized', tg.initDataUnsafe);
}

// Make sure glossary initializes if we're on the learn tab on page load
if (state.currentTab === 'learn') {
  renderGlossary('', 'all');
}

// ===== FEATURED TOKENS SYSTEM =====

// Fetch token data from Dexscreener
async function fetchTokenData(tokenAddress) {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
    if (!response.ok) throw new Error('Failed to fetch token data');
    const data = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) return null;
    
    const pair = data.pairs[0];
    return {
      address: tokenAddress,
      name: pair.baseToken?.name || 'Unknown',
      symbol: pair.baseToken?.symbol || '???',
      price: parseFloat(pair.priceUsd || 0),
      priceChange24h: parseFloat(pair.priceChange?.h24 || 0),
      volume24h: parseFloat(pair.volume?.h24 || 0),
      liquidity: parseFloat(pair.liquidity?.usd || 0),
      marketCap: parseFloat(pair.fdv || 0),
      holders: 'N/A',
      pairAddress: pair.pairAddress,
      dexUrl: pair.url,
      chain: pair.chainId || 'solana'
    };
  } catch (error) {
    console.error('Error fetching token data:', error);
    return null;
  }
}

// Render Projects Tab
async function renderProjectsTab() {
  const container = document.getElementById('projectsContent');
  
  if (!FEATURED_TOKENS || FEATURED_TOKENS.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🚀</div>
        <h3 style="color: var(--text-primary); margin-bottom: 12px;">No Projects Yet</h3>
        <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto;">
          Featured projects will appear here once tokens are added.
        </p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading ${FEATURED_TOKENS.length} projects...</p>
    </div>
  `;
  
  const tokenDataPromises = FEATURED_TOKENS.map(token => 
    fetchTokenData(token.address).then(data => ({ ...token, liveData: data }))
  );
  
  const tokens = await Promise.all(tokenDataPromises);
  
  container.innerHTML = tokens.map(token => {
    const data = token.liveData;
    if (!data) {
      return `
        <div class="project-card">
          <div style="text-align: center; padding: 20px;">
            <p style="color: var(--text-secondary);">Failed to load: ${token.name || token.address}</p>
          </div>
        </div>
      `;
    }
    
    const changeClass = data.priceChange24h >= 0 ? 'positive' : 'negative';
    const platformClass = token.platform === 'raydium' ? 'raydium' : 'pumpfun';
    const buyUrl = token.platform === 'raydium' 
      ? `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${token.address}`
      : `https://pump.fun/${token.address}`;
    
    return `
      <div class="project-card">
        <div class="project-header">
          <div class="project-title">
            <h3>
              ${data.name}
              <span class="project-platform-badge ${platformClass}">${token.platform || 'pumpfun'}</span>
            </h3>
            <div class="project-symbol">$${data.symbol}</div>
          </div>
          <div class="project-price-info">
            <div class="project-price">$${data.price.toFixed(8)}</div>
            <div class="project-change ${changeClass}">
              ${data.priceChange24h >= 0 ? '+' : ''}${data.priceChange24h.toFixed(2)}%
            </div>
          </div>
        </div>
        
        ${token.description ? `<div class="project-description">${token.description}</div>` : ''}
        
        <div class="project-stats">
          <div class="project-stat">
            <span class="project-stat-label">Volume 24h</span>
            <span class="project-stat-value">$${formatNumber(data.volume24h)}</span>
          </div>
          <div class="project-stat">
            <span class="project-stat-label">Liquidity</span>
            <span class="project-stat-value">$${formatNumber(data.liquidity)}</span>
          </div>
          <div class="project-stat">
            <span class="project-stat-label">Market Cap</span>
            <span class="project-stat-value">$${formatNumber(data.marketCap)}</span>
          </div>
        </div>
        
        <div class="project-actions">
          <button class="project-btn project-btn-primary" onclick="window.open('${buyUrl}', '_blank')">
            💰 Buy Now
          </button>
          <button class="project-btn project-btn-secondary" onclick="window.open('${data.dexUrl}', '_blank')">
            📊 Chart
          </button>
          <button class="project-btn project-btn-secondary" onclick="addToHoldings('${data.symbol}')">
            ⭐ Watch
          </button>
        </div>
        
        ${token.twitter || token.telegram ? `
          <div class="project-socials">
            ${token.twitter ? `<button class="project-social-btn" onclick="window.open('${token.twitter}', '_blank')">🐦 Twitter</button>` : ''}
            ${token.telegram ? `<button class="project-social-btn" onclick="window.open('${token.telegram}', '_blank')">📱 Telegram</button>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Render Featured Banner
async function renderFeaturedBanner() {
  const banner = document.getElementById('featuredBanner');
  const carousel = document.getElementById('featuredTokensCarousel');
  
  const featuredTokens = FEATURED_TOKENS.filter(t => t.featured);
  
  if (!featuredTokens || featuredTokens.length === 0) {
    banner.style.display = 'none';
    return;
  }
  
  banner.style.display = 'block';
  carousel.innerHTML = `<div class="spinner" style="margin: 20px auto;"></div>`;
  
  const tokenDataPromises = featuredTokens.slice(0, 5).map(token => 
    fetchTokenData(token.address).then(data => ({ ...token, liveData: data }))
  );
  
  const tokens = await Promise.all(tokenDataPromises);
  
  carousel.innerHTML = tokens.map(token => {
    const data = token.liveData;
    if (!data) return '';
    
    const changeClass = data.priceChange24h >= 0 ? 'positive' : 'negative';
    
    return `
      <div class="featured-token-card" onclick="switchTab('projects')">
        <div class="featured-token-header">
          <div class="featured-token-info">
            <h4>${data.name}</h4>
            <p>$${data.symbol}</p>
          </div>
          <div class="featured-token-price">
            <div class="price">$${data.price.toFixed(8)}</div>
            <div class="change ${changeClass}">
              ${data.priceChange24h >= 0 ? '+' : ''}${data.priceChange24h.toFixed(2)}%
            </div>
          </div>
        </div>
        <div class="featured-token-stats">
          <div class="featured-stat">
            <div class="featured-stat-label">Volume</div>
            <div class="featured-stat-value">$${formatNumber(data.volume24h)}</div>
          </div>
          <div class="featured-stat">
            <div class="featured-stat-label">Liquidity</div>
            <div class="featured-stat-value">$${formatNumber(data.liquidity)}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Show Token of the Day popup
async function showTokenOfDay() {
  const lastShown = localStorage.getItem('tokenOfDayShown');
  const today = new Date().toDateString();
  
  if (lastShown === today) return;
  
  const featuredTokens = FEATURED_TOKENS.filter(t => t.featured);
  if (!featuredTokens || featuredTokens.length === 0) return;
  
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const tokenIndex = dayOfYear % featuredTokens.length;
  const token = featuredTokens[tokenIndex];
  
  const data = await fetchTokenData(token.address);
  if (!data) return;
  
  const changeClass = data.priceChange24h >= 0 ? 'positive' : 'negative';
  const buyUrl = token.platform === 'raydium' 
    ? `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${token.address}`
    : `https://pump.fun/${token.address}`;
  
  document.getElementById('tokenOfDayContent').innerHTML = `
    <div class="token-modal-badge">💎 Token of the Day</div>
    <h2 class="token-modal-title">${data.name}</h2>
    <p class="token-modal-subtitle">$${data.symbol} on ${token.platform || 'Pump.fun'}</p>
    
    <div class="project-header" style="margin-bottom: 20px;">
      <div class="project-price-info" style="text-align: left;">
        <div class="project-price">$${data.price.toFixed(8)}</div>
        <div class="project-change ${changeClass}">
          ${data.priceChange24h >= 0 ? '📈 +' : '📉 '}${Math.abs(data.priceChange24h).toFixed(2)}% (24h)
        </div>
      </div>
    </div>
    
    ${token.description ? `<p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">${token.description}</p>` : ''}
    
    <div class="project-stats" style="margin-bottom: 20px;">
      <div class="project-stat">
        <span class="project-stat-label">Volume 24h</span>
        <span class="project-stat-value">$${formatNumber(data.volume24h)}</span>
      </div>
      <div class="project-stat">
        <span class="project-stat-label">Liquidity</span>
        <span class="project-stat-value">$${formatNumber(data.liquidity)}</span>
      </div>
      <div class="project-stat">
        <span class="project-stat-label">Market Cap</span>
        <span class="project-stat-value">$${formatNumber(data.marketCap)}</span>
      </div>
    </div>
    
    <div class="project-actions">
      <button class="project-btn project-btn-primary" onclick="window.open('${buyUrl}', '_blank')">
        💰 Buy Now
      </button>
      <button class="project-btn project-btn-secondary" onclick="switchTab('projects'); closeTokenOfDay();">
        🚀 View All Projects
      </button>
    </div>
  `;
  
  document.getElementById('tokenOfDayModal').style.display = 'flex';
  localStorage.setItem('tokenOfDayShown', today);
}

// Close Token of the Day popup
function closeTokenOfDay() {
  document.getElementById('tokenOfDayModal').style.display = 'none';
}

// Helper function to format numbers
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toFixed(2);
}

// Update loadTabContent to handle Projects tab
const originalLoadTabContent2 = loadTabContent;
async function loadTabContent(tabName) {
  await originalLoadTabContent2(tabName);
  
  if (tabName === 'movers') {
    loadTopMovers('gainers');
  } else if (tabName === 'learn') {
    renderGlossary('', 'all');
  } else if (tabName === 'projects') {
    await renderProjectsTab();
  } else if (tabName === 'analysis') {
    await renderFeaturedBanner();
  }
}

// Initialize featured system on page load
setTimeout(() => {
  renderFeaturedBanner();
  showTokenOfDay();
}, 1000);
