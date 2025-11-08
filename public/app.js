// DarkWave-V2 Mini App JavaScript - Complete Edition with ALL Features

// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand(); // Maximize viewport on mobile
  
  // Request fullscreen mode (Telegram Mini Apps 2.0 feature)
  // This removes Telegram's top/bottom bars for a more immersive experience
  if (tg.requestFullscreen && typeof tg.requestFullscreen === 'function') {
    try {
      tg.requestFullscreen();
      console.log('✅ Fullscreen mode requested');
    } catch (err) {
      console.log('ℹ️ Fullscreen not available on this platform');
    }
  }
  
  tg.enableClosingConfirmation();
  
  // Show desktop experience banner when running in Telegram
  // You can change this URL to your Squarespace site when ready
  const desktopBanner = document.getElementById('desktopBanner');
  const webAppLink = document.getElementById('webAppLink');
  
  if (desktopBanner && webAppLink) {
    // Set the link to the standalone web app (change to your Squarespace URL later)
    const standaloneURL = window.location.origin; // Use your published Replit URL or Squarespace URL
    webAppLink.href = standaloneURL;
    
    // Show banner in Telegram environment
    desktopBanner.style.display = 'block';
    console.log('💻 Desktop experience banner shown for Telegram users');
  }
}

// API Configuration
const API_BASE = window.location.origin;

// State Management
const state = {
  currentTab: 'analysis',
  currentCategory: 'bluechip',
  currentBlockchain: 'all',
  userId: tg?.initDataUnsafe?.user?.id || 'demo-user',
  currentAnalysis: null,
  trendingCache: {}, // Cache for trending data
  trendingCacheTime: {}, // Cache timestamps
  cryptoCatEnabled: localStorage.getItem('darkwave_crypto_cat') !== 'false', // Crypto Cat mascot toggle
  subscription: {
    plan: 'free',
    status: 'inactive',
    expiryDate: null
  },
  accessGranted: false // Access code verification status
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
  
  // Token #8: Yahuah
  { 
    address: 'ERf16TD1VrUHdhpUFbUJpSPXVu9rbtzrzkKfCbwLMYiP',
    name: 'Yahuah',
    symbol: '$YAH',
    description: 'Divine token on Solana',
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
  
  // Token #10: Uncertainty
  { 
    address: 'H9BhViZnhNDpUAwv1vpt2waRNLcRNNQ1wYsaWJ6Npump',
    name: 'Uncertainty',
    symbol: '$UNCAT',
    description: 'Embracing the unknown',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #11: Crypto Cat Halloween 2025
  { 
    address: 'HssQ9yerrCxVW32eYvL5XnJPC7zfRT9E6SpEkKyLpump',
    name: 'Crypto Cat Halloween 2025',
    symbol: '$GRIMCAT',
    description: 'Spooky crypto cat for Halloween',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #12: Rhodium
  { 
    address: 'HEkEQd1nwvD7qiRHcwLEw9d7bnsg2PffrkZrWMkKpump',
    name: 'Rhodium',
    symbol: '$RHODI',
    description: 'Precious metal token on Solana',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #13: CryptoCat
  { 
    address: 'CyokFVBYyvdDzvScSSpHeJ3gR2oGPU5o9CjBHXwkpump',
    name: 'CryptoCat',
    symbol: '$CCAT',
    description: 'The crypto cat community token',
    platform: 'pumpfun',
    twitter: '',
    telegram: '',
    featured: true
  },
  
  // Token #14: Catwifcash (Raydium)
  { 
    address: '75A2MwNbiXMBNoJuKFgEsaN42fHAqjHhEuW4fPpKMGF',
    name: 'Catwifcash',
    symbol: '$CWC',
    description: 'Cat with cash on Raydium',
    platform: 'raydium',
    twitter: '',
    telegram: '',
    featured: true
  },
  
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
  },
  nft: {
    icon: '🎨',
    title: 'NFT Collections',
    description: 'Analyze NFT floor prices, volume, and market trends',
    placeholder: 'Search collection name or address...',
    quickPicks: ['BAYC', 'Azuki', 'Pudgy Penguins', 'DeGods', 'Milady', 'Lil Pudgys'],
    showBlockchain: false
  }
};

// Comprehensive Trading Glossary with Categories
const GLOSSARY_TERMS = [
  // Technical Indicators
  {
    term: 'RSI',
    full: 'Relative Strength Index',
    category: 'indicators',
    level: 'beginner',
    definition: 'A momentum indicator that measures the speed and magnitude of price changes on a scale of 0-100. Values above 70 suggest overbought conditions, while values below 30 indicate oversold conditions.',
    example: 'If BTC has an RSI of 25, it may be oversold and due for a bounce upward.'
  },
  {
    term: 'MACD',
    full: 'Moving Average Convergence Divergence',
    category: 'indicators',
    level: 'intermediate',
    definition: 'A trend-following momentum indicator that shows the relationship between two exponential moving averages (12-day and 26-day). When MACD crosses above the signal line, it generates a bullish signal.',
    example: 'A MACD crossover from -2.5 to +1.2 suggests strengthening upward momentum.'
  },
  {
    term: 'EMA',
    full: 'Exponential Moving Average',
    category: 'indicators',
    level: 'beginner',
    definition: 'A type of moving average that gives more weight to recent prices, making it more responsive to new information than a simple moving average.',
    example: 'The 50-day EMA is often used to identify the medium-term trend direction.'
  },
  {
    term: 'SMA',
    full: 'Simple Moving Average',
    category: 'indicators',
    level: 'beginner',
    definition: 'The average price over a specific number of periods, calculated by adding closing prices and dividing by the number of periods. Smooths out price data to identify trends.',
    example: 'A 200-day SMA is commonly used to determine the long-term trend - prices above it suggest a bull market.'
  },
  {
    term: 'Bollinger Bands',
    category: 'indicators',
    level: 'intermediate',
    definition: 'Volatility indicator consisting of a moving average with upper and lower bands 2 standard deviations away. Price touching the upper band suggests overbought, lower band suggests oversold.',
    example: 'When price breaks above the upper Bollinger Band, it often indicates strong momentum but potential reversal.'
  },
  {
    term: 'Volume',
    category: 'indicators',
    level: 'beginner',
    definition: 'The number of shares or coins traded during a specific period. High volume confirms trend strength, while low volume suggests weak conviction.',
    example: 'A price breakout with 3x average volume is more reliable than one with low volume.'
  },
  
  // Chart Patterns & Analysis
  {
    term: 'Support',
    category: 'patterns',
    level: 'beginner',
    definition: 'A price level where buying interest is strong enough to prevent the price from falling further. Acts as a "floor" for the price.',
    example: 'If ETH repeatedly bounces at $3,000, that level becomes a strong support zone.'
  },
  {
    term: 'Resistance',
    category: 'patterns',
    level: 'beginner',
    definition: 'A price level where selling pressure is strong enough to prevent the price from rising higher. Acts as a "ceiling" for the price.',
    example: 'If SOL fails to break above $150 multiple times, that becomes a resistance level.'
  },
  {
    term: 'Breakout',
    category: 'patterns',
    level: 'intermediate',
    definition: 'When price moves above a resistance level or below a support level with increased volume, often signaling the start of a new trend.',
    example: 'BTC breaking above $50K resistance with high volume could signal a move to $60K.'
  },
  {
    term: 'Consolidation',
    category: 'patterns',
    level: 'intermediate',
    definition: 'A period where price moves sideways in a tight range, typically occurring after a strong move as the market digests gains or losses.',
    example: 'After rallying 40%, ETH consolidated between $3,200-$3,400 for two weeks.'
  },
  {
    term: 'Divergence',
    category: 'patterns',
    level: 'advanced',
    definition: 'When price and an indicator (like RSI or MACD) move in opposite directions. Bullish divergence: price makes lower lows while indicator makes higher lows. Bearish divergence: opposite.',
    example: 'Price making new lows while RSI makes higher lows (bullish divergence) often precedes a reversal.'
  },
  
  // Trading Strategies
  {
    term: 'Stop Loss',
    category: 'trading',
    level: 'beginner',
    definition: 'An order placed to automatically sell an asset when it reaches a specific price, limiting potential losses on a trade.',
    example: 'Setting a stop loss at $95 when buying at $100 limits your maximum loss to 5%.'
  },
  {
    term: 'Take Profit',
    category: 'trading',
    level: 'beginner',
    definition: 'An order to automatically sell an asset when it reaches a target price, locking in gains.',
    example: 'Setting a take profit at $120 when buying at $100 secures a 20% gain.'
  },
  {
    term: 'DCA',
    full: 'Dollar-Cost Averaging',
    category: 'trading',
    level: 'beginner',
    definition: 'An investment strategy of buying fixed dollar amounts at regular intervals regardless of price, reducing the impact of volatility.',
    example: 'Buying $100 of BTC every week averages out your entry price over time.'
  },
  {
    term: 'Market Order',
    category: 'trading',
    level: 'beginner',
    definition: 'An order to buy or sell immediately at the current market price, guaranteeing execution but not price.',
    example: 'A market order to buy 1 ETH will execute instantly at whatever price sellers are offering.'
  },
  {
    term: 'Limit Order',
    category: 'trading',
    level: 'beginner',
    definition: 'An order to buy or sell at a specific price or better. Won\'t execute until the market reaches that price.',
    example: 'A limit buy order at $50K for BTC will only execute if BTC drops to $50K or below.'
  },
  
  // Crypto Acronyms & Slang
  {
    term: 'ATH',
    full: 'All-Time High',
    category: 'acronyms',
    level: 'beginner',
    definition: 'The highest price an asset has ever reached in its trading history.',
    example: 'BTC\'s ATH was $69,000 in November 2021.'
  },
  {
    term: 'ATL',
    full: 'All-Time Low',
    category: 'acronyms',
    level: 'beginner',
    definition: 'The lowest price an asset has ever reached since it began trading.',
    example: 'Many altcoins hit new ATLs during the 2022 bear market.'
  },
  {
    term: 'FOMO',
    full: 'Fear Of Missing Out',
    category: 'acronyms',
    level: 'beginner',
    definition: 'The anxiety of potentially missing a profitable opportunity, often leading to impulsive buying at high prices.',
    example: 'FOMO drove many retail investors to buy BTC near $69K in 2021.'
  },
  {
    term: 'FUD',
    full: 'Fear, Uncertainty, and Doubt',
    category: 'acronyms',
    level: 'beginner',
    definition: 'Negative information or rumors spread to create fear and drive prices down, sometimes deliberately by competitors or short sellers.',
    example: 'Regulatory FUD can cause sudden price drops even without actual policy changes.'
  },
  {
    term: 'Hodl',
    category: 'acronyms',
    level: 'beginner',
    definition: 'A misspelling of "hold" that became a meme, meaning to hold crypto long-term regardless of price fluctuations.',
    example: 'Many BTC hodlers who held through the 2018 bear market profited in 2021.'
  },
  
  // Market Terms
  {
    term: 'Market Cap',
    full: 'Market Capitalization',
    category: 'market',
    level: 'beginner',
    definition: 'The total value of all coins or shares in circulation, calculated as price × circulating supply. Indicates the relative size of an asset.',
    example: 'BTC with a $1.2T market cap is a blue chip, while a $50M cap coin is considered small cap.'
  },
  {
    term: 'Liquidity',
    category: 'market',
    level: 'intermediate',
    definition: 'How easily an asset can be bought or sold without significantly affecting its price. Higher liquidity means tighter spreads and less slippage.',
    example: 'A DEX pair with $10M liquidity will have less slippage than one with $100K.'
  },
  {
    term: 'Bull Market',
    category: 'market',
    level: 'beginner',
    definition: 'A market condition characterized by rising prices and optimistic investor sentiment, typically defined as a 20%+ increase from recent lows.',
    example: 'The 2021 crypto bull market saw BTC rise from $10K to $69K.'
  },
  {
    term: 'Bear Market',
    category: 'market',
    level: 'beginner',
    definition: 'A market condition characterized by falling prices and pessimistic sentiment, typically defined as a 20%+ decline from recent highs.',
    example: 'The 2022 bear market saw many altcoins drop 80-90% from their peaks.'
  },
  {
    term: 'Whale',
    category: 'market',
    level: 'intermediate',
    definition: 'An individual or entity that holds a very large amount of a cryptocurrency, capable of moving the market with their trades.',
    example: 'A whale selling 10,000 BTC can cause significant price drops.'
  },
  
  // Blockchain & DeFi
  {
    term: 'Gas Fees',
    category: 'blockchain',
    level: 'beginner',
    definition: 'Transaction fees paid to blockchain validators for processing transactions. Varies by network congestion.',
    example: 'Ethereum gas fees can range from $2 during low activity to $50+ during high demand.'
  },
  {
    term: 'Slippage',
    category: 'blockchain',
    level: 'intermediate',
    definition: 'The difference between the expected price of a trade and the actual executed price, caused by market movement or low liquidity.',
    example: 'With 5% slippage, a $100 buy order might execute at $105 in a fast-moving market.'
  },
  {
    term: 'Rug Pull',
    category: 'blockchain',
    level: 'intermediate',
    definition: 'A scam where developers abandon a project and run away with investors\' funds, common in new DeFi tokens and meme coins.',
    example: 'The project\'s liquidity was drained overnight - it was a rug pull.'
  },
  {
    term: 'Pump and Dump',
    category: 'blockchain',
    level: 'intermediate',
    definition: 'A scheme where a group artificially inflates (pumps) the price of an asset through coordinated buying or hype, then sells (dumps) at the peak.',
    example: 'The coin pumped 300% in an hour, then crashed 90% - classic pump and dump.'
  },
  
  // NFT Terms
  {
    term: 'Floor Price',
    category: 'nft',
    level: 'beginner',
    definition: 'The lowest price at which an NFT from a collection is currently listed for sale. Acts as the entry price to own any NFT from that collection.',
    example: 'BAYC floor price is 30 ETH, meaning that\'s the minimum you need to buy any Bored Ape.'
  },
  {
    term: 'Mint',
    category: 'nft',
    level: 'beginner',
    definition: 'The process of creating and issuing a new NFT on the blockchain. Buying directly from the project during initial release.',
    example: 'The project will mint 10,000 NFTs at 0.08 ETH each on Saturday.'
  },
  {
    term: 'Reveal',
    category: 'nft',
    level: 'beginner',
    definition: 'When the actual artwork/traits of an NFT are disclosed after minting. Many projects use delayed reveals to prevent rarity sniping.',
    example: 'The collection reveals 48 hours after mint - you won\'t know what you got until then.'
  },
  {
    term: 'Utility',
    category: 'nft',
    level: 'intermediate',
    definition: 'Additional benefits or use cases an NFT provides beyond just art/collectibility, like access to events, airdrops, or governance rights.',
    example: 'This NFT grants you access to exclusive alpha channels and quarterly airdrops.'
  },
  {
    term: 'Royalties',
    category: 'nft',
    level: 'intermediate',
    definition: 'A percentage of secondary sales that goes back to the original creator. Programmed into the smart contract.',
    example: 'This collection has 5% royalties, so the artist gets 5% every time an NFT is resold.'
  },
  {
    term: 'Trait Rarity',
    category: 'nft',
    level: 'intermediate',
    definition: 'How uncommon specific attributes of an NFT are within its collection. Rarer traits typically command higher prices.',
    example: 'Only 2% of this collection has the "laser eyes" trait, making those NFTs more valuable.'
  },
  {
    term: 'Allowlist',
    full: 'Whitelist',
    category: 'nft',
    level: 'beginner',
    definition: 'A pre-approved list of wallet addresses that get early or guaranteed access to mint an NFT collection.',
    example: 'Being on the allowlist lets you mint 24 hours before public sale at a lower price.'
  },
  {
    term: 'Bluechip NFT',
    category: 'nft',
    level: 'intermediate',
    definition: 'Established, high-value NFT collections with strong communities and track records, considered safer investments.',
    example: 'BAYC, Azuki, and Pudgy Penguins are considered bluechip NFTs in the space.'
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
    case 'movers':
      loadTopMovers('gainers');
      break;
    case 'learn':
      renderGlossary('', 'all');
      break;
    case 'projects':
      await renderProjectsTab();
      break;
    case 'analysis':
      await renderFeaturedBanner();
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
  
  // Load market overview table for the category
  loadMarketOverview(category);
  
  // Update trending carousel
  loadTrendingCarousel(category);
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

// Trending Carousel Configuration (icons, tickers, and logo URLs)
const TRENDING_CONFIG = {
  bluechip: [
    { icon: '₿', id: 'bitcoin', ticker: 'BTC', logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
    { icon: '♦️', id: 'ethereum', ticker: 'ETH', logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
    { icon: '⚡', id: 'solana', ticker: 'SOL', logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
    { icon: '🟡', id: 'binancecoin', ticker: 'BNB', logo: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
    { icon: '🔷', id: 'ripple', ticker: 'XRP', logo: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
    { icon: '🌙', id: 'cardano', ticker: 'ADA', logo: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' }
  ],
  stocks: [
    { icon: '🍎', ticker: 'AAPL', name: 'Apple', logo: 'https://logo.clearbit.com/apple.com' },
    { icon: '⚡', ticker: 'TSLA', name: 'Tesla', logo: 'https://logo.clearbit.com/tesla.com' },
    { icon: '🎮', ticker: 'NVDA', name: 'NVIDIA', logo: 'https://logo.clearbit.com/nvidia.com' },
    { icon: '🛒', ticker: 'AMZN', name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com' },
    { icon: '🔍', ticker: 'GOOGL', name: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { icon: '💻', ticker: 'MSFT', name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com' }
  ],
  meme: [
    { icon: '🐕', id: 'dogecoin', ticker: 'DOGE', logo: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
    { icon: '🐸', id: 'pepe', ticker: 'PEPE', logo: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg' },
    { icon: '🐶', id: 'shiba-inu', ticker: 'SHIB', logo: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png' },
    { icon: '🦴', id: 'bonk', ticker: 'BONK', logo: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg' },
    { icon: '🧢', id: 'dogwifcoin', ticker: 'WIF', logo: 'https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg' },
    { icon: '🎩', id: 'floki', ticker: 'FLOKI', logo: 'https://assets.coingecko.com/coins/images/16746/large/PNG_image.png' }
  ],
  defi: [
    { icon: '🦄', id: 'uniswap', ticker: 'UNI', logo: 'https://assets.coingecko.com/coins/images/12504/large/uni.jpg' },
    { icon: '👻', id: 'aave', ticker: 'AAVE', logo: 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png' },
    { icon: '🏦', id: 'maker', ticker: 'MKR', logo: 'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png' },
    { icon: '💎', id: 'compound-governance-token', ticker: 'COMP', logo: 'https://assets.coingecko.com/coins/images/10775/large/COMP.png' },
    { icon: '🌊', id: 'sushi', ticker: 'SUSHI', logo: 'https://assets.coingecko.com/coins/images/12271/large/512x512_Logo_no_chop.png' },
    { icon: '🔵', id: 'curve-dao-token', ticker: 'CRV', logo: 'https://assets.coingecko.com/coins/images/12124/large/Curve.png' }
  ],
  dex: [
    { icon: '🔥', ticker: 'BONK', search: 'bonk solana', logo: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg' },
    { icon: '🚀', ticker: 'PEPE', search: 'pepe ethereum', logo: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg' },
    { icon: '💫', ticker: 'WIF', search: 'wif solana', logo: 'https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg' },
    { icon: '⚡', ticker: 'MEME', search: 'meme solana', logo: 'https://dd.dexscreener.com/ds-data/tokens/solana/meme.png' },
    { icon: '🌟', ticker: 'BOME', search: 'bome solana', logo: 'https://dd.dexscreener.com/ds-data/tokens/solana/bome.png' },
    { icon: '💎', ticker: 'MEW', search: 'mew solana', logo: 'https://dd.dexscreener.com/ds-data/tokens/solana/mew.png' }
  ],
  nft: [
    { icon: '🐵', ticker: 'BAYC', name: 'BAYC', logo: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?w=500' },
    { icon: '🎨', ticker: 'AZUKI', name: 'Azuki', logo: 'https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT?w=500' },
    { icon: '🐧', ticker: 'PPG', name: 'Pudgys', logo: 'https://i.seadn.io/gae/yNi-XdGxsgQCPpqSio4o31ygAV6wURdIdInWRcFIl46UjUQ1eV7BEndGe8L661OoG-clRi7EgInLX4LPu9Jfw4fq0bnVYHqg7RFi?w=500' },
    { icon: '👑', ticker: 'DGOD', name: 'DeGods', logo: 'https://i.seadn.io/gcs/files/3d8e01bf38ecdeb7e6e3c6e88e463843.png?w=500' },
    { icon: '✨', ticker: 'MIL', name: 'Milady', logo: 'https://i.seadn.io/gcs/files/b33a2b6a0b4c8ce0e7d0d4e5f9e9e9e9.png?w=500' },
    { icon: '🐧', ticker: 'LPG', name: 'Lil Pudgys', logo: 'https://i.seadn.io/gcs/files/c1e5e2e2e2e2e2e2e2e2e2e2e2e2e2e2.png?w=500' }
  ]
};

// Fetch live trending data with 5-minute caching
async function fetchLiveTrendingData(category) {
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();
  
  // Check cache
  if (state.trendingCache[category] && 
      state.trendingCacheTime[category] && 
      (now - state.trendingCacheTime[category] < CACHE_DURATION)) {
    return state.trendingCache[category];
  }
  
  try {
    const config = TRENDING_CONFIG[category];
    if (!config) return [];
    
    let items = [];
    
    if (category === 'bluechip' || category === 'meme' || category === 'defi') {
      // Fetch crypto data from CoinGecko
      const ids = config.map(c => c.id).join(',');
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
      const data = await response.json();
      
      items = config.map(cfg => {
        const coinData = data[cfg.id];
        if (!coinData) return null;
        
        const price = coinData.usd;
        const change = coinData.usd_24h_change || 0;
        
        return {
          icon: cfg.icon,
          name: cfg.ticker,
          ticker: cfg.ticker,
          logo: cfg.logo,
          price: price >= 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(6)}`,
          change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
          positive: change >= 0
        };
      }).filter(item => item !== null);
      
    } else if (category === 'stocks') {
      // For stocks, use static data (Yahoo Finance requires API key for live data)
      items = config.map(cfg => ({
        icon: cfg.icon,
        name: cfg.name,
        ticker: cfg.ticker,
        logo: cfg.logo,
        price: '–',
        change: 'Live',
        positive: true
      }));
      
    } else if (category === 'dex') {
      // Fetch DEX data from Dexscreener
      const searchPromises = config.map(async cfg => {
        try {
          const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${cfg.search || cfg.ticker}`);
          const data = await response.json();
          
          if (data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0];
            const change = parseFloat(pair.priceChange?.h24 || 0);
            
            return {
              icon: cfg.icon,
              name: pair.baseToken?.symbol || cfg.ticker,
              ticker: cfg.ticker,
              logo: cfg.logo,
              price: pair.priceUsd ? `$${parseFloat(pair.priceUsd).toFixed(8)}` : '–',
              change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
              positive: change >= 0
            };
          }
        } catch (e) {
          console.error('DEX fetch error:', e);
        }
        return null;
      });
      
      const results = await Promise.all(searchPromises);
      items = results.filter(item => item !== null);
      
    } else if (category === 'nft') {
      // NFT data remains static (no free API)
      items = config.map(cfg => ({
        icon: cfg.icon,
        name: cfg.name,
        ticker: cfg.ticker,
        logo: cfg.logo,
        price: '–',
        change: 'Floor',
        positive: true
      }));
    }
    
    // Cache the results
    state.trendingCache[category] = items;
    state.trendingCacheTime[category] = now;
    
    return items;
    
  } catch (error) {
    console.error('Error fetching trending data:', error);
    return [];
  }
}

async function loadTrendingCarousel(category) {
  const trendingItems = document.getElementById('trendingItems');
  
  // Show loading state
  trendingItems.innerHTML = '<div style="color: var(--text-secondary); padding: 1rem; text-align: center;">Loading trending...</div>';
  document.getElementById('trendingCarousel').style.display = 'block';
  
  // Fetch live data
  const items = await fetchLiveTrendingData(category);
  
  if (items.length === 0) {
    document.getElementById('trendingCarousel').style.display = 'none';
    return;
  }
  
  // Duplicate items for seamless infinite scroll
  const duplicatedItems = [...items, ...items];
  
  trendingItems.innerHTML = duplicatedItems.map(item => `
    <div class="trending-item" data-ticker="${item.ticker}" data-category="${category}">
      <div class="trending-item-logo">
        <img src="${item.logo || ''}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <div class="trending-item-icon-fallback" style="display: none;">${item.icon}</div>
      </div>
      <div class="trending-item-name">${item.name}</div>
      <div class="trending-item-ticker">${item.ticker}</div>
      <div class="trending-item-price">${item.price}</div>
      <div class="trending-item-change ${item.positive ? 'positive' : 'negative'}">
        ${item.change}
      </div>
    </div>
  `).join('');
  
  // Add click handlers
  trendingItems.querySelectorAll('.trending-item').forEach(item => {
    item.addEventListener('click', () => {
      const ticker = item.dataset.ticker;
      searchInput.value = ticker;
      performSearch();
      if (tg) tg.HapticFeedback?.impactOccurred('medium');
    });
  });
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
loadTrendingCarousel('bluechip');

// Search Functionality
searchBtn.addEventListener('click', () => performSearch());
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performSearch();
});

async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  
  // Check usage limits for free users
  if (!await checkUsageLimit('search')) {
    return;
  }
  
  showLoading();
  if (tg) tg.HapticFeedback?.impactOccurred('light');
  
  try {
    // Route to appropriate endpoint based on category
    if (state.currentCategory === 'nft') {
      await searchNFT(query);
    } else {
      await searchAsset(query);
    }
  } catch (error) {
    showToast('Error fetching analysis. Please try again.');
    console.error('Search error:', error);
  } finally {
    hideLoading();
  }
}

// Usage limit checking for feature gates
async function checkUsageLimit(feature) {
  const isPremium = state.subscription.plan === 'premium' && state.subscription.status === 'active';
  
  if (isPremium) {
    return true; // Premium users have unlimited access
  }
  
  // Free users have limits
  const limits = {
    search: 10, // 10 searches per day
    alert: 3    // 3 price alerts max
  };
  
  // Check local storage for today's usage
  const today = new Date().toDateString();
  const usageKey = `usage_${feature}_${today}`;
  const currentUsage = parseInt(localStorage.getItem(usageKey) || '0');
  
  if (currentUsage >= limits[feature]) {
    showUpgradeLimitModal(feature, limits[feature]);
    return false;
  }
  
  // Increment usage
  localStorage.setItem(usageKey, (currentUsage + 1).toString());
  return true;
}

function showUpgradeLimitModal(feature, limit) {
  const featureNames = {
    search: 'searches',
    alert: 'price alerts'
  };
  
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px; text-align: center;">
      <div style="font-size: 4rem; margin-bottom: 15px;">🚫</div>
      <h3 style="margin-bottom: 15px;">Daily Limit Reached</h3>
      <p style="margin-bottom: 20px; opacity: 0.9;">
        You've used all ${limit} ${featureNames[feature]} on the free plan today.
      </p>
      <p style="margin-bottom: 25px; color: #FFD700; font-weight: bold;">
        Upgrade to Premium for unlimited ${featureNames[feature]}! 🚀
      </p>
      
      <button class="action-btn" style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; font-weight: bold; width: 100%; margin-bottom: 10px;" onclick="this.closest('.modal-backdrop').remove(); showUpgradeModal();">
        👑 Upgrade to Premium
      </button>
      
      <button class="secondary-btn" style="width: 100%;" onclick="this.closest('.modal-backdrop').remove()">
        Close
      </button>
      
      <p style="margin-top: 15px; font-size: 0.85rem; opacity: 0.6;">
        Limit resets tomorrow
      </p>
    </div>
  `;
  
  document.body.appendChild(modal);
  if (tg) tg.HapticFeedback?.impactOccurred('heavy');
}

// Search for traditional assets (stocks, crypto, DEX pairs)
async function searchAsset(query) {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
      ticker: query,
      userId: state.userId 
    })
  });
  
  const data = await response.json();
  
  // Check for server-side limit enforcement
  if (response.status === 402 && data.upgradeRequired) {
    hideLoading();
    showUpgradeLimitModal('search', 10);
    return;
  }
  
  if (data.error) {
    showToast(data.error);
    hideLoading();
    return;
  }
  
  state.currentAnalysis = data;
  displayAnalysis(data);
  
  // Load chart in background
  loadChart(query);
}

// Search for NFT collections
async function searchNFT(query) {
  const response = await fetch(`${API_BASE}/api/nft-analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
      query: query,
      userId: state.userId 
    })
  });
  
  const data = await response.json();
  if (!data.success || data.error) {
    showToast(data.error || 'NFT collection not found');
    hideLoading();
    return;
  }
  
  displayNFTAnalysis(data.collection);
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

function displayNFTAnalysis(nft) {
  const volumeChange = nft.volumeChange24h || 0;
  const volumeChangeClass = volumeChange >= 0 ? 'positive' : 'negative';
  const floorChange = ((nft.floorPriceUsd || 0) / ((nft.floorPriceUsd || 1) - volumeChange / 100)) - 1;
  
  const card = document.createElement('div');
  card.className = 'analysis-card';
  card.style.cssText = 'animation: slideUp 0.3s ease-out;';
  
  card.innerHTML = `
    <div class="analysis-header">
      <div style="display: flex; align-items: center; gap: 12px;">
        ${nft.image ? `<img src="${nft.image}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;" alt="${nft.name}" />` : ''}
        <div>
          <div class="ticker-name">🎨 ${nft.name}</div>
          <div class="price-value">Floor: ${nft.floorPrice?.toFixed(4) || '0'} ${nft.chain === 'Ethereum' ? 'ETH' : 'Token'}</div>
          <div class="price-change" style="color: var(--text-secondary);">
            $${nft.floorPriceUsd?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'} USD
          </div>
        </div>
      </div>
      <div class="signal-badge" style="background: var(--gradient-primary); color: white;">
        ${nft.chain}
      </div>
    </div>
    
    <div style="margin-top: 20px;">
      <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">📊 COLLECTION STATS</h3>
      <div class="indicators-grid">
        <div class="indicator-item">
          <div class="indicator-label">24h Volume</div>
          <div class="indicator-value">${nft.volume24h?.toFixed(4) || 'N/A'} ${nft.chain === 'Ethereum' ? 'ETH' : 'Token'}</div>
          <div style="font-size:0.7rem; color: var(--text-secondary);">
            $${(nft.volume24hUsd || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
          </div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">Volume Change</div>
          <div class="indicator-value ${volumeChangeClass}">
            ${volumeChange >= 0 ? '+' : ''}${volumeChange.toFixed(1)}%
          </div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">Market Cap</div>
          <div class="indicator-value">$${((nft.marketCap || 0) / 1000000).toFixed(2)}M</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">24h Sales</div>
          <div class="indicator-value">${nft.sales24h || 0}</div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 20px;">
      <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">🏛️ COLLECTION INFO</h3>
      <div class="indicators-grid">
        <div class="indicator-item">
          <div class="indicator-label">Total Supply</div>
          <div class="indicator-value">${(nft.totalSupply || 0).toLocaleString()}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">Owners</div>
          <div class="indicator-value">${(nft.owners || 0).toLocaleString()}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">Listed</div>
          <div class="indicator-value">${(nft.listedCount || 0).toLocaleString()}</div>
          <div style="font-size:0.7rem; color: var(--text-secondary);">
            ${nft.totalSupply ? ((nft.listedCount / nft.totalSupply) * 100).toFixed(1) : '0'}%
          </div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">Contract</div>
          <div class="indicator-value" style="font-size: 0.7rem; word-break: break-all;">
            ${nft.contractAddress ? nft.contractAddress.substring(0, 6) + '...' + nft.contractAddress.substring(38) : 'N/A'}
          </div>
        </div>
      </div>
    </div>
    
    ${nft.description ? `
      <div style="margin-top: 20px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
        ${nft.description.length > 200 ? nft.description.substring(0, 200) + '...' : nft.description}
      </div>
    ` : ''}
    
    <div class="action-buttons" style="margin-top: 20px; display: flex; gap: 8px;">
      <button class="action-btn" style="flex: 1;" onclick="setAlert('${nft.name}')">🔔 Alert</button>
      <button class="action-btn" style="flex: 1;" onclick="addToHoldings('${nft.name}')">⭐ Watch</button>
      ${nft.contractAddress ? `<button class="action-btn" style="flex: 1;" onclick="window.open('https://opensea.io/assets/${nft.chain.toLowerCase()}/${nft.contractAddress}', '_blank')">🛒 View on OpenSea</button>` : ''}
    </div>
  `;
  
  analysisResult.innerHTML = '';
  analysisResult.appendChild(card);
}

async function loadChart(ticker) {
  try {
    const response = await fetch(`${API_BASE}/api/chart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ticker, userId: state.userId })
    });
    
    const data = await response.json();
    const chartContainer = document.getElementById('chartContainer');
    
    if (data.success && data.chartUrl && chartContainer) {
      chartContainer.innerHTML = `<img src="${data.chartUrl}" style="width: 100%; border-radius: 8px; cursor: pointer; display: block;" alt="Price Chart" />`;
      
      // Add click handler to both container and image for full clickability
      chartContainer.onclick = () => openChartModal(data.chartUrl, ticker);
      const img = chartContainer.querySelector('img');
      if (img) {
        img.onclick = () => openChartModal(data.chartUrl, ticker);
      }
      
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

// ===== ACCESS CODE SYSTEM =====
function checkAccessCode() {
  const savedToken = localStorage.getItem('darkwave_session');
  return !!savedToken;
}

function getAuthHeaders() {
  const sessionToken = localStorage.getItem('darkwave_session');
  return {
    'Content-Type': 'application/json',
    'X-Session-Token': sessionToken || ''
  };
}

async function verifyAccessCode(code) {
  try {
    // Get or generate persistent userId
    let userId = localStorage.getItem('darkwave_userId');
    if (!userId) {
      // Generate a unique ID for this browser/user
      userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
      localStorage.setItem('darkwave_userId', userId);
    }
    state.userId = userId;
    
    const response = await fetch(`${API_BASE}/api/verify-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userId })
    });
    
    const data = await response.json();
    
    if (data.success && data.sessionToken) {
      localStorage.setItem('darkwave_session', data.sessionToken);
      localStorage.setItem('darkwave_access', 'granted');
      state.accessGranted = true;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Access verification error:', error);
    return false;
  }
}

function showAccessGate() {
  // Hide main app
  document.getElementById('app').style.display = 'none';
  
  // Create and show access gate
  const gateHtml = `
    <div id="accessGate" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a0000 0%, #0d0011 50%, #000000 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    ">
      <div style="
        background: rgba(26, 0, 0, 0.95);
        border: 2px solid #8b0000;
        border-radius: 16px;
        padding: 40px 30px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        box-shadow: 0 0 30px rgba(139, 0, 0, 0.5);
      ">
        <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
        <h2 style="color: #fff; margin-bottom: 10px; font-size: 24px;">DarkWave-V2</h2>
        <p style="color: #999; margin-bottom: 30px; font-size: 14px;">Enter access code to continue</p>
        
        <input 
          type="text" 
          id="accessCodeInput" 
          placeholder="Enter access code"
          style="
            width: 100%;
            padding: 15px;
            border: 2px solid #8b0000;
            border-radius: 8px;
            background: rgba(13, 0, 17, 0.8);
            color: #fff;
            font-size: 16px;
            margin-bottom: 20px;
            text-align: center;
            box-sizing: border-box;
          "
          autocomplete="off"
        />
        
        <button 
          id="accessCodeSubmit"
          style="
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #8b0000 0%, #4b0000 100%);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          "
        >
          Unlock
        </button>
        
        <div id="accessError" style="
          color: #ff4444;
          margin-top: 15px;
          font-size: 14px;
          display: none;
        ">Invalid access code</div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', gateHtml);
  
  // Add event listeners
  const input = document.getElementById('accessCodeInput');
  const submit = document.getElementById('accessCodeSubmit');
  const error = document.getElementById('accessError');
  
  const handleSubmit = async () => {
    const code = input.value.trim();
    if (!code) return;
    
    submit.textContent = 'Verifying...';
    submit.disabled = true;
    error.style.display = 'none';
    
    const isValid = await verifyAccessCode(code);
    
    if (isValid) {
      document.getElementById('accessGate').remove();
      document.getElementById('app').style.display = 'block';
      if (tg) tg.HapticFeedback?.notificationOccurred('success');
    } else {
      error.style.display = 'block';
      input.value = '';
      input.focus();
      submit.textContent = 'Unlock';
      submit.disabled = false;
      if (tg) tg.HapticFeedback?.notificationOccurred('error');
    }
  };
  
  submit.addEventListener('click', handleSubmit);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });
  
  // Focus input
  setTimeout(() => input.focus(), 100);
}

// Modal Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Check access code first
  if (!checkAccessCode()) {
    showAccessGate();
  } else {
    state.accessGranted = true;
    // Load initial market overview table for bluechip category
    loadMarketOverview('bluechip');
  }
  
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
    const response = await fetch(`${API_BASE}/api/holdings?userId=${state.userId}`, {
      headers: getAuthHeaders()
    });
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
    const response = await fetch(`${API_BASE}/api/wallet?userId=${state.userId}`, {
      headers: getAuthHeaders()
    });
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
    
    // Load subscription status and price alerts
    await loadSubscriptionStatus();
    await loadPriceAlerts();
  } catch (error) {
    console.error('Settings load error:', error);
  }
}

// ===== SUBSCRIPTION FUNCTIONALITY =====
async function loadSubscriptionStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/subscription?userId=${state.userId}`);
    const data = await response.json();
    
    if (data.success && data.subscription) {
      state.subscription = data.subscription;
      updateSubscriptionUI();
    }
  } catch (error) {
    console.error('Subscription load error:', error);
  }
}

function updateSubscriptionUI() {
  const statusEl = document.getElementById('subscriptionStatus');
  const planBadge = document.getElementById('planBadge');
  const upgradeBtn = document.getElementById('upgradeBtn');
  const upgradeBanner = document.getElementById('upgradeBanner');
  
  if (!statusEl || !planBadge || !upgradeBtn) return;
  
  const isPremium = state.subscription.plan === 'premium' && state.subscription.status === 'active';
  
  // Show/hide upgrade banner on main page based on subscription status
  if (upgradeBanner) {
    upgradeBanner.style.display = isPremium ? 'none' : 'block';
  }
  
  if (isPremium) {
    planBadge.textContent = '👑 Premium';
    planBadge.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
    planBadge.style.color = '#000';
    statusEl.innerHTML = `
      <p style="color: #4ADE80;">✅ Active subscription</p>
      ${state.subscription.expiryDate ? `<p style="font-size: 0.9rem; opacity: 0.8;">Renews: ${new Date(state.subscription.expiryDate).toLocaleDateString()}</p>` : ''}
    `;
    upgradeBtn.textContent = 'Manage Subscription';
    upgradeBtn.onclick = showManageSubscription;
  } else {
    planBadge.textContent = 'Free';
    planBadge.style.background = 'rgba(107,0,0,0.3)';
    planBadge.style.color = '#fff';
    statusEl.innerHTML = `
      <p style="opacity: 0.8;">Limited to 10 searches/day</p>
      <p style="font-size: 0.9rem; color: #FFD700;">Upgrade for unlimited access! 🚀</p>
    `;
    upgradeBtn.textContent = '👑 Upgrade to Premium';
    upgradeBtn.onclick = showUpgradeModal;
  }
}

async function showUpgradeModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <h3 style="margin-bottom: 20px;">🚀 Upgrade to Premium</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
        <div style="padding: 15px; border: 1px solid rgba(168,85,247,0.3); border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: #999;">Free Plan</h4>
          <p style="font-size: 2rem; margin: 0; color: #6B0000;">$0</p>
          <ul style="list-style: none; padding: 0; margin: 15px 0 0 0; text-align: left;">
            <li style="margin: 8px 0;">❌ 10 searches/day</li>
            <li style="margin: 8px 0;">❌ Basic charts</li>
            <li style="margin: 8px 0;">❌ 3 price alerts</li>
            <li style="margin: 8px 0;">❌ Standard support</li>
          </ul>
        </div>
        
        <div style="padding: 15px; border: 2px solid #FFD700; border-radius: 8px; background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.1));">
          <h4 style="margin: 0 0 10px 0; color: #FFD700;">👑 Premium</h4>
          <p style="font-size: 2rem; margin: 0; color: #FFD700;">$5<span style="font-size: 1rem;">/mo</span></p>
          <ul style="list-style: none; padding: 0; margin: 15px 0 0 0; text-align: left;">
            <li style="margin: 8px 0;">✅ Unlimited searches</li>
            <li style="margin: 8px 0;">✅ Advanced charts</li>
            <li style="margin: 8px 0;">✅ Unlimited alerts</li>
            <li style="margin: 8px 0;">✅ Priority support</li>
          </ul>
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <p style="margin-bottom: 12px; font-size: 0.9rem; opacity: 0.8; text-align: center;">Choose your payment method:</p>
        
        <button class="action-btn" style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; font-weight: bold; width: 100%; margin-bottom: 12px;" onclick="initiateCheckout()">
          💳 Pay with Card - $5/month
        </button>
        
        <button class="action-btn" style="background: linear-gradient(135deg, #F7931A, #E67E22); color: #fff; font-weight: bold; width: 100%;" onclick="initiateCryptoPayment()">
          💎 Pay with Crypto - $5 (BTC, ETH, USDC)
        </button>
        
        <p style="margin-top: 12px; font-size: 0.75rem; opacity: 0.6; text-align: center;">
          Card payments: Auto-renew monthly • Cancel anytime<br>
          Crypto payments: One-time 30-day access • No auto-renew
        </p>
      </div>
      
      <button class="secondary-btn" style="margin-top: 15px; width: 100%;" onclick="this.closest('.modal-backdrop').remove()">
        Maybe Later
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  if (tg) tg.HapticFeedback?.impactOccurred('medium');
}

async function initiateCheckout() {
  try {
    showLoading();
    
    const response = await fetch(`${API_BASE}/api/subscription/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.userId })
    });
    
    const data = await response.json();
    
    if (data.success && data.checkoutUrl) {
      // Open Stripe checkout in new window
      if (tg) {
        tg.openLink(data.checkoutUrl);
      } else {
        window.open(data.checkoutUrl, '_blank');
      }
      
      showToast('Opening checkout... Complete payment to activate Premium!');
      document.querySelector('.modal-backdrop')?.remove();
    } else {
      showToast('Error creating checkout session. Please try again.');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showToast('Error starting checkout. Please try again.');
  } finally {
    hideLoading();
  }
}

async function initiateCryptoPayment() {
  try {
    showLoading();
    
    const response = await fetch(`${API_BASE}/api/crypto/create-charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.userId })
    });
    
    const data = await response.json();
    
    if (data.success && data.hostedUrl) {
      // Close current modal
      document.querySelector('.modal-backdrop')?.remove();
      
      // Open Coinbase Commerce payment page
      if (tg) {
        tg.openLink(data.hostedUrl);
      } else {
        window.open(data.hostedUrl, '_blank');
      }
      
      showToast('Opening crypto payment... Complete payment to activate Premium!', 5000);
      
      // Show waiting modal
      showCryptoWaitingModal();
    } else {
      showToast(data.error || 'Error creating crypto payment. Please try again.');
    }
  } catch (error) {
    console.error('Crypto checkout error:', error);
    showToast('Error starting crypto payment. Please try again.');
  } finally {
    hideLoading();
  }
}

function showCryptoWaitingModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'cryptoWaitingModal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 450px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 16px;">💎</div>
      <h3 style="margin-bottom: 16px;">Waiting for Payment...</h3>
      
      <div style="padding: 20px; background: rgba(247,147,26,0.1); border: 1px solid #F7931A; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 12px 0; opacity: 0.9;">
          Complete your payment in the Coinbase Commerce window to activate Premium.
        </p>
        
        <div style="margin: 16px 0;">
          <div class="spinner" style="margin: 0 auto; width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #F7931A; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
        
        <p style="margin: 12px 0 0 0; font-size: 0.85rem; opacity: 0.7;">
          ⏱️ Payment confirmation may take 1-10 minutes depending on network
        </p>
      </div>
      
      <div style="padding: 15px; background: rgba(255,215,0,0.1); border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 0.9rem;">
          <strong>Accepted Cryptocurrencies:</strong><br>
          Bitcoin (BTC) • Ethereum (ETH) • USD Coin (USDC)<br>
          Litecoin (LTC) • Dogecoin (DOGE) • Bitcoin Cash (BCH)
        </p>
      </div>
      
      <button class="secondary-btn" style="width: 100%;" onclick="closeCryptoWaiting()">
        Close
      </button>
      
      <p style="margin-top: 12px; font-size: 0.75rem; opacity: 0.6;">
        You'll be automatically upgraded once payment is confirmed
      </p>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Check payment status every 10 seconds
  const checkInterval = setInterval(async () => {
    await loadSubscriptionStatus();
    if (state.subscription.plan === 'premium' && state.subscription.status === 'active') {
      clearInterval(checkInterval);
      closeCryptoWaiting();
      showToast('🎉 Payment confirmed! Premium activated!', 5000);
      updateSubscriptionUI();
    }
  }, 10000); // Check every 10 seconds
  
  // Store interval ID to clear on close
  modal.dataset.checkInterval = checkInterval;
}

function closeCryptoWaiting() {
  const modal = document.getElementById('cryptoWaitingModal');
  if (modal) {
    // Clear the interval
    if (modal.dataset.checkInterval) {
      clearInterval(parseInt(modal.dataset.checkInterval));
    }
    modal.remove();
  }
}

async function showManageSubscription() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <h3 style="margin-bottom: 20px;">👑 Manage Subscription</h3>
      
      <div style="padding: 20px; background: rgba(255,215,0,0.1); border: 1px solid #FFD700; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0; color: #FFD700; font-weight: bold;">Premium Plan Active</p>
        <p style="margin: 0; font-size: 0.9rem;">
          ${state.subscription.expiryDate ? `Renews: ${new Date(state.subscription.expiryDate).toLocaleDateString()}` : 'Active subscription'}
        </p>
      </div>
      
      <p style="margin-bottom: 20px; opacity: 0.9;">
        Enjoying Premium? You can cancel anytime and retain access until the end of your billing period.
      </p>
      
      <button class="action-btn danger" style="width: 100%;" onclick="cancelSubscription()">
        Cancel Subscription
      </button>
      
      <button class="secondary-btn" style="margin-top: 10px; width: 100%;" onclick="this.closest('.modal-backdrop').remove()">
        Keep Premium
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  if (tg) tg.HapticFeedback?.impactOccurred('medium');
}

async function cancelSubscription() {
  if (!confirm('Are you sure you want to cancel Premium? You\'ll lose access to unlimited searches and advanced features.')) {
    return;
  }
  
  try {
    showLoading();
    
    const response = await fetch(`${API_BASE}/api/subscription/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.userId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Subscription cancelled. You\'ll retain Premium until your billing period ends.');
      document.querySelector('.modal-backdrop')?.remove();
      await loadSubscriptionStatus();
    } else {
      showToast('Error cancelling subscription. Please try again.');
    }
  } catch (error) {
    console.error('Cancel error:', error);
    showToast('Error cancelling subscription. Please try again.');
  } finally {
    hideLoading();
  }
}

// ===== PRICE ALERTS FUNCTIONALITY =====
async function loadPriceAlerts() {
  try {
    const response = await fetch(`${API_BASE}/api/alerts?userId=${state.userId}`, {
      headers: getAuthHeaders()
    });
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
      method: 'DELETE',
      headers: getAuthHeaders()
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
  // Check usage limits for free users
  if (!await checkUsageLimit('alert')) {
    return;
  }
  
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
      headers: getAuthHeaders(),
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

function openAdminLogin() {
  const code = prompt('Enter admin access code:');
  if (code && code.trim()) {
    window.location.href = `/admin?code=${encodeURIComponent(code.trim())}`;
  }
}

// ===== MARKET OVERVIEW TABLE =====
async function loadMarketOverview(category) {
  const splitView = document.getElementById('marketOverview');
  const singleView = document.getElementById('marketOverviewSingle');
  
  // Show split view only for bluechip category (initial load)
  if (category === 'bluechip') {
    splitView.style.display = 'grid';
    singleView.style.display = 'none';
    await loadSplitMarketView();
  } else {
    // Show single view for all other categories
    splitView.style.display = 'none';
    singleView.style.display = 'block';
    await loadSingleMarketView(category);
  }
}

async function loadSplitMarketView() {
  // Load both stocks and crypto side by side
  await Promise.all([
    loadStocksSplit(),
    loadCryptoSplit(),
    loadMarketSnapshots()
  ]);
}

async function loadStocksSplit() {
  const stocksBody = document.getElementById('stocksTableBody');
  const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'V', 'JPM'];
  
  stocksBody.innerHTML = stocks.map((ticker) => {
    return `
      <tr onclick="analyzeAssetFromTable('${ticker}')" style="cursor: pointer;">
        <td style="font-weight: 600; color: var(--text-primary);">${ticker}</td>
        <td style="text-align: right; color: var(--text-secondary);">--</td>
        <td style="text-align: right; color: var(--text-secondary);">--</td>
      </tr>
    `;
  }).join('');
}

async function loadCryptoSplit() {
  const cryptoBody = document.getElementById('cryptoTableBody');
  
  try {
    const cryptoIds = 'bitcoin,ethereum,solana,binancecoin,ripple,cardano,polkadot,avalanche-2,chainlink,polygon';
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds}&order=market_cap_desc&per_page=10&sparkline=false`);
    const data = await response.json();
    
    cryptoBody.innerHTML = data.slice(0, 10).map((coin) => {
      const priceChange = coin.price_change_percentage_24h || 0;
      const changeClass = priceChange >= 0 ? 'positive' : 'negative';
      const changeSymbol = priceChange >= 0 ? '+' : '';
      
      return `
        <tr onclick="analyzeAssetFromTable('${coin.symbol.toUpperCase()}')" style="cursor: pointer;">
          <td>
            <div style="font-weight: 600; color: var(--text-primary);">${coin.name}</div>
            <div style="font-size: 0.7rem; color: var(--text-secondary);">${coin.symbol.toUpperCase()}</div>
          </td>
          <td style="text-align: right; font-weight: 600;">$${coin.current_price >= 1 ? coin.current_price.toFixed(2) : coin.current_price.toFixed(6)}</td>
          <td style="text-align: right;" class="${changeClass}">${changeSymbol}${priceChange.toFixed(1)}%</td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading crypto split:', error);
    cryptoBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #999;">Failed to load</td></tr>';
  }
}

async function loadMarketSnapshots() {
  try {
    // Fetch global crypto market data
    const globalResponse = await fetch('https://api.coingecko.com/api/v3/global');
    const globalData = await globalResponse.json();
    
    if (globalData && globalData.data) {
      const btcDom = globalData.data.market_cap_percentage?.btc || 0;
      const ethDom = globalData.data.market_cap_percentage?.eth || 0;
      const totalMcap = globalData.data.total_market_cap?.usd || 0;
      const totalVolume = globalData.data.total_volume?.usd || 0;
      const mcapChange = globalData.data.market_cap_change_percentage_24h_usd || 0;
      
      // BTC Dominance (show change from 50%)
      const btcDomChange = btcDom - 50;
      document.getElementById('btcDominance').textContent = `${btcDom.toFixed(1)}%`;
      document.getElementById('btcDomChange').textContent = `${btcDomChange >= 0 ? '+' : ''}${btcDomChange.toFixed(1)}%`;
      document.getElementById('btcDomChange').className = `market-stat-change ${btcDomChange >= 0 ? 'positive' : 'negative'}`;
      
      // ETH Dominance
      document.getElementById('ethDominance').textContent = `${ethDom.toFixed(1)}%`;
      
      // Total Market Cap with 24h change
      document.getElementById('totalMcap').textContent = `$${(totalMcap / 1e12).toFixed(2)}T`;
      document.getElementById('totalMcapChange').textContent = `${mcapChange >= 0 ? '+' : ''}${mcapChange.toFixed(1)}%`;
      document.getElementById('totalMcapChange').className = `market-stat-change ${mcapChange >= 0 ? 'positive' : 'negative'}`;
      
      // 24h Volume with change estimate (volume doesn't have 24h change in API, use mcap change as proxy)
      document.getElementById('cryptoVolume').textContent = `$${(totalVolume / 1e9).toFixed(1)}B`;
      document.getElementById('cryptoVolumeChange').textContent = `${mcapChange >= 0 ? '+' : ''}${(mcapChange * 0.8).toFixed(1)}%`;
      document.getElementById('cryptoVolumeChange').className = `market-stat-change ${mcapChange >= 0 ? 'positive' : 'negative'}`;
    }
    
    // Stock market data (using placeholders as Yahoo Finance requires API key)
    document.getElementById('sp500Price').textContent = '$4,850';
    document.getElementById('sp500Change').textContent = '+0.5%';
    document.getElementById('sp500Change').className = 'market-stat-change positive';
    
    document.getElementById('nasdaqPrice').textContent = '$15,200';
    document.getElementById('nasdaqChange').textContent = '+0.8%';
    document.getElementById('nasdaqChange').className = 'market-stat-change positive';
    
  } catch (error) {
    console.error('Error loading market snapshots:', error);
  }
}

async function loadSingleMarketView(category) {
  const tableBody = document.getElementById('marketTableBody');
  const titleEl = document.getElementById('marketOverviewTitle');
  
  // Show loading
  tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;"><div class="spinner"></div></td></tr>';
  
  try {
    let data = [];
    let title = '';
    
    if (category === 'stocks') {
      title = '📈 Top Stocks';
      const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'V', 'JPM'];
      renderStocksTable(stocks);
    } else if (category === 'meme') {
      title = '🐸 Top Meme Coins';
      const memeIds = 'dogecoin,shiba-inu,pepe,bonk,floki,baby-doge-coin,dogwifcoin,meme,popcat,mog-coin';
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${memeIds}&order=market_cap_desc&per_page=10&sparkline=false`);
      data = await response.json();
      renderCryptoTable(data);
    } else if (category === 'defi') {
      title = '💎 Top DeFi Tokens';
      const defiIds = 'uniswap,aave,maker,lido-dao,curve-dao-token,compound-governance-token,pancakeswap-token,synthetix-network-token,yearn-finance,sushi';
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${defiIds}&order=market_cap_desc&per_page=10&sparkline=false`);
      data = await response.json();
      renderCryptoTable(data);
    } else if (category === 'dex') {
      title = '🔄 Trending DEX Pairs';
      renderDEXTable();
    } else if (category === 'nft') {
      title = '🎨 Top NFT Collections';
      renderNFTTable();
    }
    
    titleEl.textContent = title;
  } catch (error) {
    console.error('Error loading market overview:', error);
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">Failed to load data</td></tr>';
  }
}

function renderCryptoTable(data) {
  const tableBody = document.getElementById('marketTableBody');
  
  if (!data || data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">No data available</td></tr>';
    return;
  }
  
  tableBody.innerHTML = data.slice(0, 10).map((coin, index) => {
    const priceChange = coin.price_change_percentage_24h || 0;
    const changeClass = priceChange >= 0 ? 'price-change-positive' : 'price-change-negative';
    const changeSymbol = priceChange >= 0 ? '▲' : '▼';
    
    return `
      <tr onclick="analyzeAssetFromTable('${coin.symbol.toUpperCase()}')">
        <td style="color: var(--text-secondary);">${index + 1}</td>
        <td>
          <div class="coin-name">
            <span style="font-weight: 600;">${coin.name}</span>
            <span class="coin-symbol">${coin.symbol.toUpperCase()}</span>
          </div>
        </td>
        <td style="text-align: right; font-weight: 600;">$${coin.current_price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 6})}</td>
        <td style="text-align: right;" class="${changeClass}">${changeSymbol} ${Math.abs(priceChange).toFixed(2)}%</td>
        <td style="text-align: right; color: var(--text-secondary);">$${formatLargeNumber(coin.total_volume)}</td>
        <td style="text-align: right; color: var(--text-secondary);">$${formatLargeNumber(coin.market_cap)}</td>
      </tr>
    `;
  }).join('');
}

function renderStocksTable(stocks) {
  const tableBody = document.getElementById('marketTableBody');
  
  tableBody.innerHTML = stocks.map((ticker, index) => {
    return `
      <tr onclick="analyzeAssetFromTable('${ticker}')">
        <td style="color: var(--text-secondary);">${index + 1}</td>
        <td>
          <div class="coin-name">
            <span style="font-weight: 600;">${ticker}</span>
          </div>
        </td>
        <td colspan="4" style="text-align: center; color: var(--text-secondary); font-size: 0.8rem;">
          Click to analyze
        </td>
      </tr>
    `;
  }).join('');
}

function renderDEXTable() {
  const tableBody = document.getElementById('marketTableBody');
  const pairs = ['SOL/USDC', 'ETH/USDC', 'BONK/SOL', 'WIF/SOL', 'PEPE/ETH', 'MATIC/USDC', 'ARB/ETH', 'OP/USDC', 'AVAX/USDC', 'BNB/USDT'];
  
  tableBody.innerHTML = pairs.map((pair, index) => {
    return `
      <tr onclick="analyzeAssetFromTable('${pair.split('/')[0]}')">
        <td style="color: var(--text-secondary);">${index + 1}</td>
        <td>
          <div class="coin-name">
            <span style="font-weight: 600;">${pair}</span>
          </div>
        </td>
        <td colspan="4" style="text-align: center; color: var(--text-secondary); font-size: 0.8rem;">
          Click to search on Dexscreener
        </td>
      </tr>
    `;
  }).join('');
}

function renderNFTTable() {
  const tableBody = document.getElementById('marketTableBody');
  const collections = [
    { name: 'Bored Ape Yacht Club', symbol: 'BAYC' },
    { name: 'Azuki', symbol: 'AZUKI' },
    { name: 'Pudgy Penguins', symbol: 'PPG' },
    { name: 'DeGods', symbol: 'DEGODS' },
    { name: 'Milady', symbol: 'MIL' },
    { name: 'Lil Pudgys', symbol: 'LILPPG' }
  ];
  
  tableBody.innerHTML = collections.map((nft, index) => {
    return `
      <tr onclick="analyzeAssetFromTable('${nft.symbol}')">
        <td style="color: var(--text-secondary);">${index + 1}</td>
        <td>
          <div class="coin-name">
            <span style="font-weight: 600;">${nft.name}</span>
            <span class="coin-symbol">${nft.symbol}</span>
          </div>
        </td>
        <td colspan="4" style="text-align: center; color: var(--text-secondary); font-size: 0.8rem;">
          Click to analyze
        </td>
      </tr>
    `;
  }).join('');
}

function analyzeAssetFromTable(ticker) {
  searchInput.value = ticker;
  performSearch();
  if (tg) tg.HapticFeedback?.impactOccurred('medium');
}

function formatLargeNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
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

document.getElementById('walletBtn')?.addEventListener('click', () => {
  switchTab('wallet');
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
let currentCategory = 'all';
let expandedTerms = new Set();

const CATEGORY_NAMES = {
  indicators: '📊 Technical Indicators',
  patterns: '📈 Chart Patterns & Analysis',
  trading: '💰 Trading Strategies',
  acronyms: '🔤 Crypto Acronyms & Slang',
  market: '💎 Market Terms',
  blockchain: '⛓️ Blockchain & DeFi',
  nft: '🎨 NFT Terms'
};

function renderGlossary(searchTerm = '', category = null) {
  const glossaryContent = document.getElementById('glossaryContent');
  
  // Update current category if provided
  if (category !== null) {
    currentCategory = category;
  }
  
  let filteredTerms = GLOSSARY_TERMS;
  
  // Filter by category
  if (currentCategory !== 'all') {
    filteredTerms = filteredTerms.filter(t => t.category === currentCategory);
  }
  
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
  
  // Group by category if showing all, otherwise by letter
  let grouped = {};
  if (currentCategory === 'all' && !searchTerm && currentLetter === 'ALL') {
    // Group by category
    filteredTerms.forEach(term => {
      const cat = term.category || 'other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(term);
    });
  } else {
    // Group by first letter
    filteredTerms.forEach(term => {
      const letter = term.term.charAt(0).toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(term);
    });
  }
  
  const groupKeys = Object.keys(grouped).sort();
  
  glossaryContent.innerHTML = groupKeys.map(key => {
    const isCategory = currentCategory === 'all' && !searchTerm && currentLetter === 'ALL';
    const groupTitle = isCategory ? (CATEGORY_NAMES[key] || key) : key;
    
    return `
    <div class="letter-group" style="margin-bottom: 24px;">
      <div style="font-size: 1.5rem; font-weight: 700; color: var(--glow-purple); margin-bottom: 12px; padding: 8px 0; border-bottom: 2px solid var(--glow-purple);">
        ${groupTitle}
      </div>
      ${grouped[key].map(term => {
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
              ${(() => {
                const catData = state.cryptoCatEnabled ? getCryptoCatQuote(term.term) : null;
                if (catData) {
                  return `
                    <div style="display: flex; gap: 10px; align-items: start; margin-bottom: 12px; background: rgba(255, 0, 110, 0.05); padding: 10px; border-radius: 8px; border: 1px solid rgba(255, 0, 110, 0.2);">
                      <img src="assets/crypto-cat.png" alt="Crypto Cat" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--neon-green); flex-shrink: 0;">
                      <div style="flex: 1;">
                        <div style="font-size: 0.7rem; color: var(--neon-green); font-weight: 700; margin-bottom: 4px;">🐱 CRYPTO CAT SAYS:</div>
                        <div style="font-size: 0.75rem; color: var(--neon-pink); font-style: italic; margin-bottom: 4px;">${catData.pose}</div>
                        <div style="font-size: 0.85rem; color: var(--text-primary); font-style: italic; line-height: 1.4;">"${catData.quote}"</div>
                      </div>
                    </div>
                  `;
                }
                return '';
              })()}
              <div style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 8px;">${term.definition}</div>
              ${term.example ? `<div style="background: rgba(168, 85, 247, 0.1); padding: 8px; border-radius: 4px; font-size: 0.9rem;"><strong>Example:</strong> ${term.example}</div>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `}).join('');
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

// Category filter buttons
document.querySelectorAll('.category-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;
    currentCategory = category;
    currentLetter = 'ALL'; // Reset letter filter when changing category
    
    document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Reset alphabet nav to ALL
    document.querySelectorAll('.path-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.path-btn[data-path="all"]')?.classList.add('active');
    
    renderGlossary('', category);
    if (tg) tg.HapticFeedback?.impactOccurred('medium');
  });
});

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

// Movers tab loading handled in main loadTabContent function

// ===== MARKET TICKER =====

// Fetch and display market ticker
async function loadMarketTicker() {
  const tickerContent = document.getElementById('tickerContent');
  const tickerContentClone = document.getElementById('tickerContentClone');
  
  try {
    // Top 10 cryptos from CoinGecko
    const cryptoIds = 'bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,polkadot,tron,avalanche-2';
    const cryptoResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true`);
    const cryptoData = await cryptoResponse.json();
    
    const cryptoTickers = [
      { id: 'bitcoin', symbol: 'BTC' },
      { id: 'ethereum', symbol: 'ETH' },
      { id: 'solana', symbol: 'SOL' },
      { id: 'binancecoin', symbol: 'BNB' },
      { id: 'ripple', symbol: 'XRP' },
      { id: 'cardano', symbol: 'ADA' },
      { id: 'dogecoin', symbol: 'DOGE' },
      { id: 'polkadot', symbol: 'DOT' },
      { id: 'tron', symbol: 'TRX' },
      { id: 'avalanche-2', symbol: 'AVAX' }
    ];
    
    const stockTickers = [
      { symbol: 'AAPL', name: 'Apple' },
      { symbol: 'TSLA', name: 'Tesla' },
      { symbol: 'NVDA', name: 'NVIDIA' },
      { symbol: 'AMZN', name: 'Amazon' },
      { symbol: 'GOOGL', name: 'Google' },
      { symbol: 'MSFT', name: 'Microsoft' },
      { symbol: 'META', name: 'Meta' },
      { symbol: 'NFLX', name: 'Netflix' },
      { symbol: 'AMD', name: 'AMD' },
      { symbol: 'COIN', name: 'Coinbase' }
    ];
    
    let tickerHTML = '';
    
    // Add crypto tickers
    cryptoTickers.forEach(crypto => {
      const data = cryptoData[crypto.id];
      if (data) {
        const price = data.usd;
        const change = data.usd_24h_change || 0;
        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeSymbol = change >= 0 ? '▲' : '▼';
        
        tickerHTML += `
          <div class="ticker-item">
            <span class="ticker-symbol">${crypto.symbol}</span>
            <span class="ticker-price">$${price >= 1 ? price.toFixed(2) : price.toFixed(6)}</span>
            <span class="ticker-change ${changeClass}">${changeSymbol} ${Math.abs(change).toFixed(1)}%</span>
          </div>
        `;
      }
    });
    
    // Add stock tickers (with static Live indicator since free APIs are limited)
    stockTickers.forEach(stock => {
      tickerHTML += `
        <div class="ticker-item">
          <span class="ticker-symbol">${stock.symbol}</span>
          <span class="ticker-price" style="color: #94A3B8;">Live</span>
          <span class="ticker-change positive" style="opacity: 0.6;">▲ Market</span>
        </div>
      `;
    });
    
    // Set content and clone for seamless loop
    tickerContent.innerHTML = tickerHTML;
    tickerContentClone.innerHTML = tickerHTML;
    
  } catch (error) {
    console.error('Error loading market ticker:', error);
    // Fallback to simple loading message
    tickerContent.innerHTML = '<div style="padding: 0 30px; color: #999;">Loading market data...</div>';
  }
}

// Load ticker on page load
loadMarketTicker();

// Refresh ticker every 10 minutes
setInterval(loadMarketTicker, 10 * 60 * 1000);

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

// Fetch token data from Dexscreener with timeout
async function fetchTokenData(tokenAddress) {
  try {
    // Add 5-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Failed to fetch token data');
    const data = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) return null;
    
    const pair = data.pairs[0];
    return {
      address: tokenAddress,
      name: pair.baseToken?.name || 'Unknown',
      symbol: pair.baseToken?.symbol || '???',
      logo: pair.info?.imageUrl || pair.baseToken?.logo || null,
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

// ===== LAUNCHING SOON SECTION =====
let countdownIntervals = [];

// Token launches data (will be fetched from API in production)
const UPCOMING_LAUNCHES = [
  {
    id: '1',
    name: 'DarkWave',
    symbol: 'DWLP',
    logo: '/darkwave-coin.png', // Official DWLP token logo
    launchDate: new Date('2025-12-25T00:00:00Z'), // Christmas Day 2025 - REAL LAUNCH DATE
    launchPrice: '$0.01',
    totalSupply: '100M DWLP',
    initialMarketCap: '$1M Target',
    maxWhitelistSpots: 1000,
    currentWhitelistCount: 0, // Will be fetched from database
    minAllocation: '100 DWLP ($1)',
    maxAllocation: '500,000 DWLP ($5,000)',
    description: 'The official DarkWave utility token - Staking rewards, subscription discounts, governance rights, and revenue sharing from the platform',
    presaleStart: new Date('2025-12-01T00:00:00Z'), // Dec 1 presale start
    whitepaper: 'whitepaper.html'
  }
];

function calculateCountdown(targetDate) {
  const now = new Date().getTime();
  const distance = targetDate - now;
  
  if (distance < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
    expired: false
  };
}

function renderLaunchingSoon() {
  const container = document.getElementById('launchingTokens');
  
  if (!UPCOMING_LAUNCHES || UPCOMING_LAUNCHES.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 3rem; margin-bottom: 16px;">🚀</div>
        <h3 style="color: var(--text-primary); margin-bottom: 8px;">No Upcoming Launches</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Check back soon for new IDOs and presales!</p>
      </div>
    `;
    return;
  }
  
  // Clear existing intervals
  countdownIntervals.forEach(interval => clearInterval(interval));
  countdownIntervals = [];
  
  container.innerHTML = UPCOMING_LAUNCHES.map(launch => {
    const spotsRemaining = launch.maxWhitelistSpots - launch.currentWhitelistCount;
    const spotsPercentage = (launch.currentWhitelistCount / launch.maxWhitelistSpots * 100).toFixed(0);
    
    return `
      <div class="launch-card" data-launch-id="${launch.id}">
        <div class="launch-header">
          <img src="${launch.logo}" alt="${launch.name}" class="launch-logo" onerror="this.src='https://via.placeholder.com/60'">
          <div class="launch-info">
            <h3 class="launch-name">${launch.name}</h3>
            <div class="launch-symbol">$${launch.symbol}</div>
          </div>
        </div>
        
        <div class="launch-countdown">
          <div class="countdown-label">Launch Countdown</div>
          <div class="countdown-timer" id="countdown-${launch.id}">
            <div class="countdown-unit">
              <div class="countdown-value" data-unit="days">00</div>
              <div class="countdown-unit-label">Days</div>
            </div>
            <div class="countdown-unit">
              <div class="countdown-value" data-unit="hours">00</div>
              <div class="countdown-unit-label">Hrs</div>
            </div>
            <div class="countdown-unit">
              <div class="countdown-value" data-unit="minutes">00</div>
              <div class="countdown-unit-label">Min</div>
            </div>
            <div class="countdown-unit">
              <div class="countdown-value" data-unit="seconds">00</div>
              <div class="countdown-unit-label">Sec</div>
            </div>
          </div>
        </div>
        
        <div class="launch-details">
          <div class="launch-detail">
            <div class="launch-detail-label">Launch Price</div>
            <div class="launch-detail-value">${launch.launchPrice}</div>
          </div>
          <div class="launch-detail">
            <div class="launch-detail-label">Market Cap</div>
            <div class="launch-detail-value">${launch.initialMarketCap}</div>
          </div>
          <div class="launch-detail">
            <div class="launch-detail-label">Min/Max</div>
            <div class="launch-detail-value">${launch.minAllocation} - ${launch.maxAllocation}</div>
          </div>
          <div class="launch-detail">
            <div class="launch-detail-label">Total Supply</div>
            <div class="launch-detail-value">${launch.totalSupply}</div>
          </div>
        </div>
        
        <div class="launch-whitelist-status">
          <div>
            <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px;">Whitelist Progress</div>
            <div class="whitelist-spots">${launch.currentWhitelistCount} / ${launch.maxWhitelistSpots} spots filled (${spotsPercentage}%)</div>
          </div>
          <div style="font-size: 1.5rem; color: var(--neon-green);">✓</div>
        </div>
        
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <button class="launch-action-btn" onclick="joinWhitelist('${launch.id}', '${launch.name}')" style="flex: 1;">
            🚀 Join Whitelist
          </button>
          ${launch.whitepaper ? `<button class="launch-action-btn" onclick="window.open('${launch.whitepaper}', '_blank')" style="flex: 1; background: linear-gradient(135deg, #8B0000, #FF006E);">
            📄 Whitepaper
          </button>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  // Start countdown timers
  UPCOMING_LAUNCHES.forEach(launch => {
    const interval = setInterval(() => {
      const countdown = calculateCountdown(new Date(launch.launchDate).getTime());
      const container = document.querySelector(`#countdown-${launch.id}`);
      
      if (!container) {
        clearInterval(interval);
        return;
      }
      
      if (countdown.expired) {
        container.innerHTML = '<div style="color: var(--neon-green); font-weight: 700;">🎉 LIVE NOW!</div>';
        clearInterval(interval);
        return;
      }
      
      container.querySelector('[data-unit="days"]').textContent = String(countdown.days).padStart(2, '0');
      container.querySelector('[data-unit="hours"]').textContent = String(countdown.hours).padStart(2, '0');
      container.querySelector('[data-unit="minutes"]').textContent = String(countdown.minutes).padStart(2, '0');
      container.querySelector('[data-unit="seconds"]').textContent = String(countdown.seconds).padStart(2, '0');
    }, 1000);
    
    countdownIntervals.push(interval);
  });
}

function joinWhitelist(launchId, launchName) {
  // Check if user is subscribed
  if (!isUserSubscribed()) {
    showModal(`
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 3rem; margin-bottom: 16px;">🔒</div>
        <h3 style="margin-bottom: 12px;">Premium Feature</h3>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">
          Join the whitelist for <strong>${launchName}</strong> with a premium subscription
        </p>
        <button class="subscribe-button" onclick="closeModal(); switchTab('subscribe')" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #FF006E, #A855F7); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
          Subscribe Now
        </button>
      </div>
    `);
    return;
  }
  
  // Show whitelist signup modal
  showModal(`
    <div style="padding: 20px;">
      <h3 style="margin-bottom: 16px; color: var(--neon-pink);">🚀 Join ${launchName} Whitelist</h3>
      <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 0.9rem;">
        Enter your wallet address to secure your spot in the ${launchName} presale
      </p>
      
      <form id="whitelistForm" onsubmit="submitWhitelist(event, '${launchId}', '${launchName}')">
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-secondary);">
            Wallet Address *
          </label>
          <input 
            type="text" 
            id="walletAddress" 
            required
            placeholder="Enter your Solana wallet address"
            style="width: 100%; padding: 12px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 0, 110, 0.3); border-radius: 8px; color: var(--text-primary); font-size: 0.9rem;"
          >
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" required style="width: 18px; height: 18px;">
            <span style="font-size: 0.85rem; color: var(--text-secondary);">
              I agree to the terms and understand investment risks
            </span>
          </label>
        </div>
        
        <div style="display: flex; gap: 12px;">
          <button type="button" onclick="closeModal()" style="flex: 1; padding: 12px; background: rgba(255, 255, 255, 0.1); color: var(--text-primary); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; font-weight: 600; cursor: pointer;">
            Cancel
          </button>
          <button type="submit" style="flex: 2; padding: 12px; background: linear-gradient(135deg, #FF006E, #A855F7); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
            Join Whitelist
          </button>
        </div>
      </form>
    </div>
  `);
}

function submitWhitelist(event, launchId, launchName) {
  event.preventDefault();
  
  const walletAddress = document.getElementById('walletAddress').value;
  
  // In production, this would make an API call to save the whitelist entry
  console.log('Whitelist signup:', { launchId, launchName, walletAddress, userId: USER_ID });
  
  closeModal();
  
  // Show success message
  showModal(`
    <div style="text-align: center; padding: 30px 20px;">
      <div style="font-size: 4rem; margin-bottom: 16px;">✅</div>
      <h3 style="margin-bottom: 12px; color: var(--neon-green);">Whitelist Joined!</h3>
      <p style="color: var(--text-secondary); margin-bottom: 20px;">
        You've successfully joined the <strong>${launchName}</strong> whitelist
      </p>
      <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 20px;">
        We'll notify you when the presale goes live
      </p>
      <button onclick="closeModal()" style="padding: 12px 32px; background: linear-gradient(135deg, #4ADE80, #22C55E); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
        Got it!
      </button>
    </div>
  `);
  
  // Update the button in the launch card
  const launchCard = document.querySelector(`[data-launch-id="${launchId}"]`);
  if (launchCard) {
    const btn = launchCard.querySelector('.launch-action-btn');
    btn.textContent = '✓ Whitelist Joined';
    btn.classList.add('joined');
    btn.disabled = true;
  }
}

// Render Projects Tab
async function renderProjectsTab() {
  // Render launching soon section first
  renderLaunchingSoon();
  
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
    fetchTokenData(token.address)
      .then(data => ({ ...token, liveData: data }))
      .catch(err => {
        console.warn(`Failed to fetch data for ${token.name}:`, err);
        return { ...token, liveData: null };
      })
  );
  
  const results = await Promise.allSettled(tokenDataPromises);
  const tokens = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  
  container.innerHTML = tokens.map(token => {
    const data = token.liveData;
    const platformClass = token.platform === 'raydium' ? 'raydium' : 'pumpfun';
    const buyUrl = token.platform === 'raydium' 
      ? `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${token.address}`
      : `https://pump.fun/${token.address}`;
    
    // Show token info even without live data
    if (!data) {
      return `
        <div class="project-card">
          <div class="project-header">
            <div class="project-title">
              <h3>
                ${token.name}
                <span class="project-platform-badge ${platformClass}">${token.platform || 'pumpfun'}</span>
              </h3>
              <div class="project-symbol">${token.symbol}</div>
            </div>
          </div>
          
          ${token.description ? `<div class="project-description">${token.description}</div>` : ''}
          
          <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
            <p style="font-size: 0.9rem;">⏳ Price data loading...</p>
            <p style="font-size: 0.8rem; margin-top: 8px;">This token may not be listed on DEX yet</p>
          </div>
          
          <div class="project-actions">
            <button class="project-btn project-btn-primary" onclick="window.open('${buyUrl}', '_blank')">
              💰 Buy on ${token.platform === 'raydium' ? 'Raydium' : 'Pump.fun'}
            </button>
            ${token.twitter ? `<button class="project-btn project-btn-secondary" onclick="window.open('${token.twitter}', '_blank')">🐦 Twitter</button>` : ''}
            ${token.telegram ? `<button class="project-btn project-btn-secondary" onclick="window.open('${token.telegram}', '_blank')">💬 Telegram</button>` : ''}
          </div>
        </div>
      `;
    }
    
    const changeClass = data.priceChange24h >= 0 ? 'positive' : 'negative';
    
    return `
      <div class="project-card">
        <div class="project-header">
          ${data.logo ? `
            <div class="project-logo" style="width: 48px; height: 48px; margin-right: 12px; flex-shrink: 0;">
              <img src="${data.logo}" alt="${data.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none'">
            </div>
          ` : ''}
          <div class="project-title" style="flex: 1;">
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

// Projects tab loading handled in main loadTabContent function

// Initialize featured system on page load
setTimeout(() => {
  renderFeaturedBanner();
  showTokenOfDay();
}, 1000);

// ===== TRACKED WALLETS FEATURE (Read-Only, Up to 5 Wallets) =====
async function loadTrackedWallets() {
  const list = document.getElementById('trackedWalletsList');
  list.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  
  try {
    const response = await fetch(`${API_BASE}/api/tracked-wallets`, { headers: getAuthHeaders() });
    const data = await response.json();
    
    if (!data.wallets || data.wallets.length === 0) {
      list.innerHTML = `
        <div class="empty-state" style="padding: 40px 20px; text-align: center;">
          <div class="empty-icon">💰</div>
          <p style="color: var(--text-secondary);">No wallets tracked yet</p>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">Add up to 5 wallet addresses to track</p>
        </div>
      `;
      return;
    }
    
    list.innerHTML = data.wallets.map(wallet => {
      const shortAddr = `${wallet.address.slice(0,6)}...${wallet.address.slice(-4)}`;
      const chain = wallet.chain || 'solana';
      
      // Chain badges with colors
      const chainBadges = {
        solana: { emoji: '◎', name: 'SOL', color: '#14F195' },
        ethereum: { emoji: '♦', name: 'ETH', color: '#627EEA' },
        polygon: { emoji: '⬡', name: 'MATIC', color: '#8247E5' },
        arbitrum: { emoji: '◆', name: 'ARB', color: '#28A0F0' },
        base: { emoji: '🔵', name: 'BASE', color: '#0052FF' },
        bsc: { emoji: '◉', name: 'BSC', color: '#F3BA2F' }
      };
      
      const badge = chainBadges[chain] || chainBadges.solana;
      
      // Format balance based on chain
      let balanceDisplay;
      if (chain === 'solana') {
        const solBalance = wallet.balance?.nativeBalance || 0;
        const tokenCount = wallet.balance?.tokens?.length || 0;
        balanceDisplay = `
          <div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Balance</div>
            <div style="font-weight: 600;">${(solBalance / 1e9).toFixed(4)} ${badge.name}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Tokens</div>
            <div style="font-weight: 600;">${tokenCount} tokens</div>
          </div>
        `;
      } else {
        // EVM chains - balance could be number or string
        const nativeBalance = wallet.balance?.nativeBalanceFormatted || 0;
        const balanceNum = typeof nativeBalance === 'string' ? parseFloat(nativeBalance) : nativeBalance;
        const balanceStr = balanceNum.toFixed(6);
        balanceDisplay = `
          <div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Balance</div>
            <div style="font-weight: 600;">${balanceStr} ${badge.name}</div>
          </div>
        `;
      }
      
      return `
        <div class="wallet-card" style="margin-bottom: 12px; border-left: 3px solid ${badge.color};">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                ${wallet.nickname ? `<span style="font-weight: 600;">${wallet.nickname}</span>` : ''}
                <span style="padding: 2px 8px; border-radius: 12px; background: ${badge.color}20; color: ${badge.color}; font-size: 0.7rem; font-weight: 600;">${badge.emoji} ${badge.name}</span>
              </div>
              <div style="font-family: monospace; font-size: 0.85rem; color: var(--text-secondary);">${shortAddr}</div>
            </div>
            <button onclick="removeTrackedWallet('${wallet.id}')" style="padding: 4px 8px; background: rgba(230, 57, 70, 0.2); border: 1px solid #E63946; border-radius: 6px; color: #E63946; font-size: 0.8rem; cursor: pointer;">
              🗑️
            </button>
          </div>
          <div style="display: flex; gap: 16px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
            ${balanceDisplay}
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Load wallets error:', error);
    showToast('Error loading wallets');
    list.innerHTML = '<div class="empty-state"><p>Error loading wallets</p></div>';
  }
}

window.removeTrackedWallet = async function(walletId) {
  if (!confirm('Remove this wallet?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/tracked-wallets/${walletId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    if (data.success) {
      showToast('✅ Wallet removed');
      if (tg) tg.HapticFeedback?.notificationOccurred('success');
      await loadTrackedWallets();
    } else {
      showToast('❌ ' + (data.message || 'Failed to remove wallet'));
    }
  } catch (error) {
    console.error('Remove wallet error:', error);
    showToast('Error removing wallet');
  }
};

// Add Wallet Button Handler
document.getElementById('addWalletBtn')?.addEventListener('click', async () => {
  const address = document.getElementById('walletAddressInput').value.trim();
  const nickname = document.getElementById('walletNicknameInput').value.trim();
  const chain = document.getElementById('walletChainSelect')?.value || 'solana';
  
  if (!address) {
    showToast('Please enter a wallet address');
    return;
  }
  
  try {
    showLoading();
    const response = await fetch(`${API_BASE}/api/tracked-wallets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ address, nickname: nickname || null, chain })
    });
    
    const data = await response.json();
    hideLoading();
    
    if (data.success) {
      showToast('✅ Wallet added!');
      if (tg) tg.HapticFeedback?.notificationOccurred('success');
      document.getElementById('walletAddressInput').value = '';
      document.getElementById('walletNicknameInput').value = '';
      await loadTrackedWallets();
    } else {
      showToast('❌ ' + (data.message || 'Failed to add wallet'));
    }
  } catch (error) {
    hideLoading();
    console.error('Add wallet error:', error);
    showToast('Error adding wallet');
  }
});

// Clear All Wallets Button Handler
document.getElementById('clearAllWalletsBtn')?.addEventListener('click', async () => {
  if (!confirm('Clear all tracked wallets? This cannot be undone.')) return;
  
  try {
    showLoading();
    const response = await fetch(`${API_BASE}/api/tracked-wallets/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    hideLoading();
    
    if (data.success) {
      showToast('✅ All wallets cleared');
      if (tg) tg.HapticFeedback?.notificationOccurred('warning');
      await loadTrackedWallets();
    } else {
      showToast('❌ Failed to clear wallets');
    }
  } catch (error) {
    hideLoading();
    console.error('Clear wallets error:', error);
    showToast('Error clearing wallets');
  }
});

// Update loadWallet to use tracked wallets
const originalLoadWallet = loadWallet;
loadWallet = async function() {
  await loadTrackedWallets();
};

// ===== FEEDBACK & TOKEN SUBMISSION =====

// Store uploaded token logo and documents
let uploadedTokenLogo = null;
let uploadedDocuments = {
  whitepaper: null,
  tokenomics: null,
  audit: null
};

// Handle token logo upload
function handleTokenLogoUpload(input) {
  const file = input.files[0];
  if (!file) return;
  
  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showToast('⚠️ Image too large. Please use a file under 2MB.');
    input.value = '';
    return;
  }
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    showToast('⚠️ Please upload an image file (PNG or JPG).');
    input.value = '';
    return;
  }
  
  // Read file as base64
  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedTokenLogo = {
      filename: file.name,
      mimeType: file.type,
      data: e.target.result
    };
    
    // Show preview
    document.getElementById('logoPreviewImage').src = e.target.result;
    document.getElementById('logoPreview').style.display = 'block';
    showToast('✅ Token image uploaded!');
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  };
  reader.readAsDataURL(file);
}

// Handle document upload (whitepaper, tokenomics, audit)
function handleDocumentUpload(input, docType) {
  const file = input.files[0];
  if (!file) return;
  
  // Check file size (max 5MB for PDFs)
  if (file.size > 5 * 1024 * 1024) {
    showToast('⚠️ Document too large. Please use a file under 5MB.');
    input.value = '';
    return;
  }
  
  // Check file type
  if (file.type !== 'application/pdf') {
    showToast('⚠️ Please upload a PDF file.');
    input.value = '';
    return;
  }
  
  // Read file as base64
  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedDocuments[docType] = {
      filename: file.name,
      mimeType: file.type,
      data: e.target.result
    };
    
    // Show preview
    document.getElementById(`${docType}Preview`).style.display = 'block';
    showToast(`✅ ${docType.charAt(0).toUpperCase() + docType.slice(1)} uploaded!`);
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  };
  reader.readAsDataURL(file);
}

async function submitFeedback(event, type) {
  event.preventDefault();
  
  let data = {};
  let formId, successMessage;
  
  if (type === 'suggestion') {
    formId = 'suggestionForm';
    data = {
      type: 'suggestion',
      userId: state.userId,
      suggestion: document.getElementById('suggestionText').value
    };
    successMessage = '✅ Suggestion sent! Thank you for your feedback!';
  } else if (type === 'token') {
    formId = 'tokenSubmissionForm';
    data = {
      type: 'token',
      userId: state.userId,
      tokenName: document.getElementById('tokenName').value,
      tokenSymbol: document.getElementById('tokenSymbol').value,
      tokenContract: document.getElementById('tokenContract').value,
      tokenChain: document.getElementById('tokenChain').value,
      tokenDescription: document.getElementById('tokenDescription').value,
      tokenContact: document.getElementById('tokenContact').value || 'Not provided',
      tokenLogo: uploadedTokenLogo, // Include image data
      
      // Social Links
      website: document.getElementById('tokenWebsite').value || null,
      twitter: document.getElementById('tokenTwitter').value || null,
      telegram: document.getElementById('tokenTelegram').value || null,
      discord: document.getElementById('tokenDiscord').value || null,
      
      // Documentation
      whitepaper: uploadedDocuments.whitepaper || null,
      tokenomics: uploadedDocuments.tokenomics || null,
      auditReport: uploadedDocuments.audit || null,
      
      // Project Qualifiers
      hasWhitepaper: document.getElementById('hasWhitepaper').checked,
      hasAudit: document.getElementById('hasAudit').checked,
      isDoxxedTeam: document.getElementById('isDoxxedTeam').checked,
      hasLockedLiquidity: document.getElementById('hasLockedLiquidity').checked
    };
    successMessage = '✅ Token submitted for review! We\'ll evaluate it soon!';
  }
  
  try {
    showLoading();
    const response = await fetch(`${API_BASE}/api/submit-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    
    hideLoading();
    
    if (response.ok) {
      showToast(successMessage);
      if (tg) tg.HapticFeedback?.notificationOccurred('success');
      document.getElementById(formId).reset();
      
      // Clear token logo and documents after submission
      if (type === 'token') {
        uploadedTokenLogo = null;
        uploadedDocuments = { whitepaper: null, tokenomics: null, audit: null };
        document.getElementById('logoPreview').style.display = 'none';
        document.getElementById('whitepaperPreview').style.display = 'none';
        document.getElementById('tokenomicsPreview').style.display = 'none';
        document.getElementById('auditPreview').style.display = 'none';
      }
    } else {
      const error = await response.json();
      showToast('❌ ' + (error.message || 'Failed to submit'));
    }
  } catch (error) {
    hideLoading();
    console.error('Feedback submission error:', error);
    showToast('❌ Error submitting feedback');
  }
}

// ===== EMAIL MODAL FUNCTIONS =====
function showEmailModal() {
  const modal = document.getElementById('emailModal');
  const hasSubmittedEmail = localStorage.getItem('darkwave_email_submitted');
  
  // Show modal on first visit only
  if (!hasSubmittedEmail && modal) {
    modal.style.display = 'flex';
  }
}

async function submitEmail() {
  const emailInput = document.getElementById('emailInput');
  const email = emailInput?.value?.trim();
  
  if (!email) {
    showToast('⚠️ Please enter an email address');
    return;
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('⚠️ Please enter a valid email address');
    return;
  }
  
  try {
    const sessionToken = localStorage.getItem('sessionToken');
    const response = await fetch(`${API_BASE}/api/register-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email, 
        sessionToken 
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      // Show success message
      document.getElementById('emailFormContainer').style.display = 'none';
      document.getElementById('emailSuccess').style.display = 'block';
      
      // Mark as submitted
      localStorage.setItem('darkwave_email_submitted', 'true');
      localStorage.setItem('darkwave_user_email', email);
      
      // Update subscription status
      state.subscription.plan = 'premium';
      state.subscription.status = 'active';
      
      // Hide upgrade banner
      const upgradeBanner = document.getElementById('upgradeBanner');
      if (upgradeBanner) upgradeBanner.style.display = 'none';
      
      if (tg) tg.HapticFeedback?.notificationOccurred('success');
    } else {
      showToast('❌ ' + (result.message || 'Registration failed'));
    }
  } catch (error) {
    console.error('Email registration error:', error);
    showToast('❌ Error registering email');
  }
}

function skipEmail() {
  closeEmailModal();
  localStorage.setItem('darkwave_email_skipped', 'true');
  showToast('💡 You can register your email anytime in Settings');
}

function closeEmailModal() {
  const modal = document.getElementById('emailModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Show email modal on page load (after access code verified)
document.addEventListener('DOMContentLoaded', () => {
  const accessGranted = localStorage.getItem('accessGranted');
  if (accessGranted === 'true') {
    // Wait 2 seconds after page load to show email modal
    setTimeout(showEmailModal, 2000);
  }
  
  // Initialize new features
  initializeChat();
  initializeNews();
  initializeCompare();
});

// ===== AI CHAT FUNCTIONALITY =====
let chatHistory = [];

function initializeChat() {
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  
  if (!chatInput || !chatSendBtn) return;
  
  // Handle send message
  chatSendBtn.addEventListener('click', () => sendChatMessage());
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
  
  // Welcome message
  addChatMessage('assistant', '👋 Hi! I\'m your AI trading assistant. Ask me about:\n\n• Technical indicators (RSI, MACD, etc.)\n• Trading strategies\n• Market analysis\n• Term explanations\n• Investment advice\n\nWhat would you like to know?');
}

function addChatMessage(role, content) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message chat-message-${role}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar';
  avatar.textContent = role === 'user' ? '👤' : '🤖';
  
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = content;
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);
  chatMessages.appendChild(messageDiv);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();
  
  if (!message) return;
  
  // Add user message
  addChatMessage('user', message);
  chatInput.value = '';
  
  // Add to history
  chatHistory.push({ role: 'user', content: message });
  
  try {
    // Call backend AI endpoint
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Session-Token': localStorage.getItem('sessionToken') || ''
      },
      body: JSON.stringify({
        message,
        history: chatHistory.slice(-10), // Last 10 messages
        userId: state.userId || 'demo-user'
      })
    });
    
    const data = await response.json();
    
    if (data.reply) {
      addChatMessage('assistant', data.reply);
      chatHistory.push({ role: 'assistant', content: data.reply });
    } else {
      addChatMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    }
  } catch (error) {
    console.error('Chat error:', error);
    addChatMessage('assistant', '❌ Connection error. Please try again.');
  }
}

// ===== NEWS FEED FUNCTIONALITY =====
let newsCache = { data: null, timestamp: 0 };
const NEWS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function initializeNews() {
  const newsFilterBtns = document.querySelectorAll('.news-filter-btn');
  
  newsFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      newsFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Fetch filtered news
      const filter = btn.dataset.filter;
      fetchNews(filter);
    });
  });
  
  // Load initial news
  fetchNews('all');
}

async function fetchNews(filter = 'all') {
  const newsFeed = document.getElementById('newsFeed');
  if (!newsFeed) return;
  
  // Check cache
  const now = Date.now();
  if (newsCache.data && (now - newsCache.timestamp < NEWS_CACHE_DURATION) && filter === 'all') {
    displayNews(newsCache.data, filter);
    return;
  }
  
  newsFeed.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  
  try {
    // Use CryptoPanic API (free tier)
    const url = `https://cryptopanic.com/api/free/v1/posts/?auth_token=free&filter=${filter}&public=true`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results) {
      // Cache the data
      newsCache = { data: data.results, timestamp: now };
      displayNews(data.results, filter);
    } else {
      newsFeed.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No news available</p>';
    }
  } catch (error) {
    console.error('News fetch error:', error);
    newsFeed.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Failed to load news. Please try again.</p>';
  }
}

function displayNews(newsItems, filter) {
  const newsFeed = document.getElementById('newsFeed');
  if (!newsFeed) return;
  
  newsFeed.innerHTML = '';
  
  // Filter news items based on selected filter
  let filtered = newsItems;
  if (filter !== 'all') {
    filtered = newsItems.filter(item => {
      if (filter === 'bullish') return item.votes?.positive > item.votes?.negative;
      if (filter === 'bearish') return item.votes?.negative > item.votes?.positive;
      return true;
    });
  }
  
  filtered.slice(0, 20).forEach(item => {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.onclick = () => window.open(item.url, '_blank');
    
    // Determine sentiment
    let sentiment = 'neutral';
    let sentimentText = 'Neutral';
    if (item.votes) {
      const pos = item.votes.positive || 0;
      const neg = item.votes.negative || 0;
      if (pos > neg && pos > 5) {
        sentiment = 'positive';
        sentimentText = 'Bullish';
      } else if (neg > pos && neg > 5) {
        sentiment = 'negative';
        sentimentText = 'Bearish';
      }
    }
    
    const timeAgo = getTimeAgo(item.published_at);
    const source = item.source?.title || 'Unknown';
    
    card.innerHTML = `
      <div class="news-header">
        <span class="news-source">${source}</span>
        <span class="news-sentiment ${sentiment}">${sentimentText}</span>
      </div>
      <div class="news-title">${item.title}</div>
      <div class="news-meta">
        <span>📅 ${timeAgo}</span>
        <span class="news-votes">👍 ${item.votes?.positive || 0} 👎 ${item.votes?.negative || 0}</span>
      </div>
    `;
    
    newsFeed.appendChild(card);
  });
}

function getTimeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const seconds = Math.floor((now - past) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ===== ASSET COMPARISON FUNCTIONALITY =====
const comparisonAssets = [];

async function addToComparison(slot) {
  const input = document.getElementById(`compareAsset${slot}`);
  const ticker = input.value.trim().toUpperCase();
  
  if (!ticker) {
    showToast('❌ Please enter a ticker symbol');
    return;
  }
  
  if (comparisonAssets.length >= 3) {
    showToast('❌ Maximum 3 assets for comparison');
    return;
  }
  
  // Check if already added
  if (comparisonAssets.find(a => a.ticker === ticker)) {
    showToast('ℹ️ Asset already added');
    return;
  }
  
  showToast('🔍 Fetching ' + ticker + '...');
  
  try {
    // Fetch analysis data
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, userId })
    });
    
    const data = await response.json();
    
    if (data.error) {
      showToast('❌ ' + data.error);
      return;
    }
    
    comparisonAssets.push(data);
    input.value = '';
    displayComparison();
    showToast('✅ Added ' + ticker);
  } catch (error) {
    console.error('Comparison fetch error:', error);
    showToast('❌ Failed to fetch data');
  }
}

function displayComparison() {
  const container = document.getElementById('comparisonResults');
  if (!container) return;
  
  container.innerHTML = '';
  
  comparisonAssets.forEach((asset, index) => {
    const card = document.createElement('div');
    card.className = 'compare-asset-card';
    
    const priceChange = asset.priceChange || 0;
    const priceChangeClass = priceChange >= 0 ? 'positive' : 'negative';
    const signal = asset.recommendation || 'HOLD';
    const signalEmoji = signal.includes('BUY') ? '🟢' : signal.includes('SELL') ? '🔴' : '🟡';
    
    card.innerHTML = `
      <div class="compare-asset-header">
        <div class="compare-asset-ticker">${asset.ticker}</div>
        <div class="compare-asset-price">$${asset.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</div>
        <div class="price-change ${priceChangeClass}">
          ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%
        </div>
      </div>
      <div class="compare-metrics">
        <div class="compare-metric">
          <span class="compare-metric-label">Signal</span>
          <span class="compare-metric-value">${signalEmoji} ${signal}</span>
        </div>
        <div class="compare-metric">
          <span class="compare-metric-label">RSI</span>
          <span class="compare-metric-value" style="color: ${asset.rsi > 70 ? '#E63946' : asset.rsi < 30 ? '#4ADE80' : '#fff'}">${asset.rsi?.toFixed(1) || 'N/A'}</span>
        </div>
        <div class="compare-metric">
          <span class="compare-metric-label">MACD</span>
          <span class="compare-metric-value">${asset.macd?.value?.toFixed(2) || 'N/A'}</span>
        </div>
        <div class="compare-metric">
          <span class="compare-metric-label">24h High</span>
          <span class="compare-metric-value">$${asset.high24h?.toLocaleString() || 'N/A'}</span>
        </div>
        <div class="compare-metric">
          <span class="compare-metric-label">24h Low</span>
          <span class="compare-metric-value">$${asset.low24h?.toLocaleString() || 'N/A'}</span>
        </div>
        <div class="compare-metric">
          <span class="compare-metric-label">Volume</span>
          <span class="compare-metric-value">$${asset.volume?.toLocaleString() || 'N/A'}</span>
        </div>
      </div>
      <button class="action-btn" style="margin-top: 1rem; width: 100%;" onclick="removeFromComparison(${index})">
        ❌ Remove
      </button>
    `;
    
    container.appendChild(card);
  });
}

function removeFromComparison(index) {
  comparisonAssets.splice(index, 1);
  displayComparison();
  showToast('✅ Asset removed');
}

function initializeCompare() {
  // Already handled by onclick attributes in HTML
}

// ===== DARK MODE FUNCTIONALITY =====
function initializeDarkMode() {
  const darkModeToggle = document.getElementById('toggleDarkMode');
  if (!darkModeToggle) return;
  
  // Load saved preference
  const savedTheme = localStorage.getItem('darkwave_theme') || 'dark';
  document.body.classList.add(savedTheme);
  darkModeToggle.checked = (savedTheme === 'dark');
  
  // Handle toggle
  darkModeToggle.addEventListener('change', (e) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(newTheme);
    localStorage.setItem('darkwave_theme', newTheme);
    
    showToast(newTheme === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
    
    if (tg) tg.HapticFeedback?.impactOccurred('medium');
  });
}

// Initialize dark mode
initializeDarkMode();

// ===== CRYPTO CAT MASCOT FUNCTIONALITY =====

const CRYPTO_CAT_QUOTES = {
  // Glossary terms - sarcastic explanations with varied moods
  'ATH': { quote: "All-Time High... yeah, that moment before everyone panic sold. Classic.", mood: "eye-roll", pose: "*flipping middle finger up*" },
  'DYOR': { quote: "Do Your Own Research. Translation: Don't blame me when you FOMO into a rugpull.", mood: "grumpy", pose: "*arms crossed, scowling*" },
  'FOMO': { quote: "Fear Of Missing Out. The crypto investor's eternal curse. You're welcome.", mood: "sarcastic", pose: "*shrugging with attitude*" },
  'FUD': { quote: "Fear, Uncertainty, and Doubt. Usually spread by people who sold too early. Meow.", mood: "annoyed", pose: "*tail swishing irritably*" },
  'HODL': { quote: "Hold On for Dear Life. Or just a drunk typo that became legendary. Either works.", mood: "amused", pose: "*smirking slightly*" },
  'Whale': { quote: "Someone with enough crypto to manipulate markets while you watch in horror.", mood: "knowing", pose: "*tapping temple with paw*" },
  'Bag Holder': { quote: "You, after buying at ATH. It builds character though!", mood: "sympathetic-ish", pose: "*patting your shoulder half-heartedly*" },
  'Diamond Hands': { quote: "Refusing to sell even when it's clearly a good idea. Stubborn or genius? Time will tell.", mood: "skeptical", pose: "*raising one eyebrow*" },
  'Paper Hands': { quote: "Selling at the first sign of trouble. Smart risk management or cowardice? I'll let you decide.", mood: "judging", pose: "*staring intensely*" },
  'Rug Pull': { quote: "When developers take the money and run. Always fun to watch... from a distance.", mood: "bitter", pose: "*showing frown face t-shirt*" },
  'Pump and Dump': { quote: "Classic market manipulation. Don't be the dump.", mood: "warning", pose: "*pointing finger accusingly*" },
  'To the Moon': { quote: "Unrealistic price expectations. But hey, dream big!", mood: "mocking", pose: "*looking upward dramatically*" },
  'Gas Fees': { quote: "The price you pay for using Ethereum. Sometimes more than your actual transaction. Yikes.", mood: "frustrated", pose: "*face-palming with both paws*" },
  'Airdrop': { quote: "Free tokens! Usually worth nothing, but free is free.", mood: "unimpressed", pose: "*yawning*" },
  'Staking': { quote: "Locking up your crypto to earn rewards. Hope the project doesn't rug!", mood: "concerned", pose: "*ears pinned back nervously*" },
  'DEX': { quote: "Decentralized Exchange. No KYC, no problem... until you need customer support.", mood: "wise", pose: "*stroking whiskers thoughtfully*" },
  'Smart Contract': { quote: "Code that executes automatically. Smart until it's not.", mood: "experienced", pose: "*adjusting glasses knowingly*" },
  'Tokenomics': { quote: "How a token's economy works. Usually designed to make early investors rich.", mood: "cynical", pose: "*counting money*" },
  'Utility': { quote: "What a token supposedly does. Often just marketing fluff.", mood: "dismissive", pose: "*waving paw dismissively*" },
  'Whitepaper': { quote: "The project's manifesto. 90% buzzwords, 10% actual info.", mood: "bored", pose: "*pretending to fall asleep*" },
  
  // Feature announcements with personality
  'launching_soon': { quote: "Oh look, another presale! This one's definitely not going to rug... probably.", mood: "skeptical", pose: "*rolling eyes hard*" },
  'whitelist': { quote: "Congrats! You're on the whitelist. Now you get to lose money first!", mood: "sarcastic-congratulations", pose: "*slow clapping*" },
  'premium': { quote: "Premium features unlocked! Time to make slightly more informed bad decisions.", mood: "helpful-ish", pose: "*thumbs up with attitude*" },
  'wallet_tracking': { quote: "Track your portfolio losses in real-time. Technological progress!", mood: "proud", pose: "*chest puffed out proudly*" },
  'market_overview': { quote: "Fresh data for your doom scrolling pleasure. You're welcome.", mood: "serving", pose: "*presenting data like a waiter*" },
  'price_alerts': { quote: "I'll notify you when things go south. Which is basically always.", mood: "resigned", pose: "*shrugging with phone*" },
};

function initializeCryptoCat() {
  const cryptoCatToggle = document.getElementById('toggleCryptoCat');
  if (!cryptoCatToggle) return;
  
  // Set toggle to match state
  cryptoCatToggle.checked = state.cryptoCatEnabled;
  
  // Handle toggle
  cryptoCatToggle.addEventListener('change', (e) => {
    state.cryptoCatEnabled = e.target.checked;
    localStorage.setItem('darkwave_crypto_cat', state.cryptoCatEnabled.toString());
    
    if (state.cryptoCatEnabled) {
      showToast('🐱 Crypto Cat is back! Prepare for sarcasm.');
    } else {
      showToast('😿 Crypto Cat will miss you...');
    }
    
    // Re-render glossary if we're on the learn tab
    if (state.currentTab === 'learn') {
      renderGlossary(document.getElementById('glossarySearch')?.value || '');
    }
    
    if (tg) tg.HapticFeedback?.impactOccurred('medium');
  });
}

// Initialize crypto cat
initializeCryptoCat();

// Function to get Crypto Cat's commentary
function getCryptoCatQuote(term) {
  if (!state.cryptoCatEnabled) return null;
  const catData = CRYPTO_CAT_QUOTES[term];
  return catData || null;
}

// Function to create Crypto Cat tooltip
function createCryptoCatTooltip(term, definition) {
  if (!state.cryptoCatEnabled) {
    return `
      <div style="padding: 12px;">
        <strong>${term}</strong>
        <p style="margin: 8px 0 0 0; font-size: 0.9rem; color: var(--text-secondary);">${definition}</p>
      </div>
    `;
  }
  
  const catData = getCryptoCatQuote(term);
  
  return `
    <div style="padding: 12px;">
      <div style="display: flex; gap: 12px; align-items: start; margin-bottom: 12px;">
        <img src="assets/crypto-cat.png" alt="Crypto Cat" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid var(--neon-green);">
        <div style="flex: 1;">
          <strong style="color: var(--neon-pink);">${term}</strong>
          <p style="margin: 8px 0 0 0; font-size: 0.9rem; color: var(--text-secondary);">${definition}</p>
        </div>
      </div>
      ${catData ? `
        <div style="background: rgba(0, 255, 133, 0.1); border-left: 3px solid var(--neon-green); padding: 8px 12px; border-radius: 4px;">
          <div style="font-size: 0.75rem; color: var(--neon-green); font-weight: 700; margin-bottom: 4px;">🐱 CRYPTO CAT SAYS:</div>
          <div style="font-size: 0.75rem; color: var(--neon-pink); font-style: italic; margin-bottom: 4px;">${catData.pose}</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); font-style: italic;">"${catData.quote}"</div>
        </div>
      ` : ''}
    </div>
  `;
}

// Function to show Crypto Cat banner
function showCryptoCatBanner(type, title, message) {
  if (!state.cryptoCatEnabled) {
    showToast(`${title}: ${message}`);
    return;
  }
  
  const catData = getCryptoCatQuote(type);
  
  showModal(`
    <div style="padding: 24px; text-align: center;">
      <img src="assets/crypto-cat.png" alt="Crypto Cat" style="width: 100px; height: 100px; margin: 0 auto 16px; border-radius: 50%; border: 3px solid var(--neon-pink); animation: bounce 2s ease-in-out infinite;">
      <h3 style="margin-bottom: 12px; color: var(--neon-pink);">${title}</h3>
      <p style="color: var(--text-secondary); margin-bottom: 16px;">${message}</p>
      ${catData ? `
        <div style="background: linear-gradient(135deg, rgba(255, 0, 110, 0.1), rgba(168, 85, 247, 0.1)); border: 2px solid rgba(255, 0, 110, 0.3); padding: 16px; border-radius: 12px; margin-bottom: 20px;">
          <div style="font-size: 0.8rem; color: var(--neon-green); font-weight: 700; margin-bottom: 4px;">🐱 CRYPTO CAT'S HOT TAKE:</div>
          <div style="font-size: 0.8rem; color: var(--neon-pink); font-style: italic; margin-bottom: 8px;">${catData.pose}</div>
          <div style="font-size: 0.95rem; color: var(--text-primary); font-style: italic;">"${catData.quote}"</div>
        </div>
      ` : ''}
      <button onclick="closeModal()" style="padding: 12px 32px; background: linear-gradient(135deg, #FF006E, #A855F7); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
        Got it!
      </button>
    </div>
  `);
}
