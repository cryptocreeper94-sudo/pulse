// DarkWave-V2 Mini App JavaScript - Complete Edition with ALL Features

// Glossary Module Loader (loaded dynamically)
let glossaryModuleLoaded = false;
async function initGlossaryTab() {
  if (!glossaryModuleLoaded) {
    try {
      // Dynamically import glossary modules
      const { initGlossary } = await import('./glossary/glossaryUI.js');
      window.initGlossary = initGlossary;
      glossaryModuleLoaded = true;
      console.log('📖 Glossary module loaded successfully');
    } catch (error) {
      console.error('Failed to load glossary module:', error);
      document.getElementById('glossary-container').innerHTML = `
        <div style="padding: 40px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <h3>Glossary temporarily unavailable</h3>
          <p style="color: var(--text-secondary);">Please try again later</p>
        </div>
      `;
      return;
    }
  }
  
  // Initialize glossary UI
  if (window.initGlossary) {
    window.initGlossary();
  }
}

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
  currentCategory: 'top', // CMC-style default to "top"
  currentBlockchain: 'all',
  assetClass: 'crypto', // 'crypto' or 'stocks'
  userId: tg?.initDataUnsafe?.user?.id || 'demo-user',
  currentAnalysis: null,
  trendingCache: {}, // Cache for trending data
  trendingCacheTime: {}, // Cache timestamps
  cryptoCatEnabled: localStorage.getItem('darkwave_crypto_cat') !== 'false', // Crypto Cat mascot toggle
  catMode: localStorage.getItem('darkwave_cat_mode') || 'smartass', // 'smartass' or 'plain'
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
    featured: true,
    category: 'conspiracy'
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
    featured: true,
    category: 'conspiracy'
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
    featured: true,
    category: 'religious'
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
    featured: true,
    category: 'religious'
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
    featured: true,
    category: 'cryptoCat'
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
    featured: true,
    category: 'cryptoCat'
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
    featured: true,
    category: 'cryptoCat'
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

// Category Quick Picks Data - CMC Style
const CATEGORY_DATA = {
  top: {
    icon: '🔝',
    title: 'Top Cryptocurrencies',
    description: 'Top 100 cryptocurrencies by market cap',
    placeholder: 'Search BTC, ETH, SOL...',
    quickPicks: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'DOT'],
    showBlockchain: true
  },
  trending: {
    icon: '🔥',
    title: 'Trending',
    description: 'Most searched cryptocurrencies in the last 24 hours',
    placeholder: 'Search trending coins...',
    quickPicks: ['PEPE', 'WIF', 'BONK', 'DEGEN', 'MEME'],
    showBlockchain: true
  },
  gainers: {
    icon: '📈',
    title: 'Top Gainers',
    description: 'Biggest gainers in the last 24 hours',
    placeholder: 'Search top gainers...',
    quickPicks: [],
    showBlockchain: true
  },
  losers: {
    icon: '📉',
    title: 'Top Losers',
    description: 'Biggest losers in the last 24 hours',
    placeholder: 'Search top losers...',
    quickPicks: [],
    showBlockchain: true
  },
  new: {
    icon: '✨',
    title: 'Recently Added',
    description: 'New listings on exchanges',
    placeholder: 'Search new coins...',
    quickPicks: [],
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
    case 'glossary':
      await initGlossaryTab();
      break;
    case 'projects':
      await renderProjectsTab();
      break;
    case 'analysis':
      await renderFeaturedBanner();
      break;
    case 'chat':
      initChat();
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

// Reset Search Button
document.getElementById('resetSearchBtn')?.addEventListener('click', () => {
  searchInput.value = '';
  document.getElementById('analysisResult').innerHTML = `
    <div class="welcome-card">
      <h2>Blue Chip Crypto</h2>
      <p>Top market cap cryptocurrencies with proven track records</p>
    </div>
  `;
  if (tg) tg.HapticFeedback?.impactOccurred('light');
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
  
  // Check for bot/rug risk on meme coins (tokens with very low prices or DEX pairs)
  if (data.price < 0.01 || query.includes('/') || query.length > 20) {
    checkBotRisk(query, data.ticker);
  }
}

// Bot Detection API Call
async function checkBotRisk(tokenAddress, ticker) {
  try {
    const response = await fetch(`${API_BASE}/api/bot-detection`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        tokenAddress: tokenAddress,
        chain: 'solana' // Default to Solana, can be enhanced to detect chain
      })
    });
    
    const result = await response.json();
    if (result.success && result.data) {
      displayBotRiskBadge(result.data, ticker);
    }
  } catch (error) {
    console.error('Bot detection failed:', error);
    // Silent fail - don't interrupt user experience
  }
}

// Display Bot Risk Badge
function displayBotRiskBadge(botData, ticker) {
  const analysisCard = document.querySelector('.analysis-card');
  if (!analysisCard) return;
  
  // Get risk color emoji
  const riskEmoji = {
    'Safe': '🟢',
    'Low': '🟡',
    'Medium': '🟠',
    'High': '🔴',
    'Extreme': '⚫'
  }[botData.riskLevel] || '🟡';
  
  // Create bot risk badge
  const botRiskHTML = `
    <div class="bot-risk-banner" style="
      margin: 15px 0;
      padding: 15px;
      background: ${botData.riskLevel === 'Extreme' || botData.riskLevel === 'High' ? 'rgba(230, 57, 70, 0.2)' : 'rgba(74, 222, 128, 0.1)'};
      border: 2px solid ${botData.riskLevel === 'Extreme' ? '#E63946' : botData.riskLevel === 'High' ? '#FF6B35' : botData.riskLevel === 'Medium' ? '#FFA500' : '#4ADE80'};
      border-radius: 8px;
      animation: slideDown 0.4s ease-out;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div style="font-weight: bold; font-size: 1rem;">
          ${riskEmoji} Rug Risk Analysis
        </div>
        <div style="
          padding: 6px 12px;
          background: ${botData.riskLevel === 'Extreme' ? '#E63946' : botData.riskLevel === 'High' ? '#FF6B35' : botData.riskLevel === 'Medium' ? '#FFA500' : '#4ADE80'};
          border-radius: 6px;
          font-weight: bold;
          font-size: 0.85rem;
        ">
          ${botData.riskLevel.toUpperCase()} RISK
        </div>
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="font-size: 0.85rem; color: var(--text-secondary);">Bot/Rug Score:</div>
        <div style="font-size: 1.2rem; font-weight: bold; color: ${botData.riskLevel === 'Extreme' || botData.riskLevel === 'High' ? '#E63946' : '#4ADE80'};">
          ${botData.botPercentage}% ${botData.riskLevel === 'Extreme' ? '⚠️ AVOID' : botData.riskLevel === 'High' ? '⚠️ CAUTION' : '✓'}
        </div>
      </div>
      
      ${botData.rugRiskIndicators.length > 0 ? `
        <div style="font-size: 0.8rem; margin-top: 10px;">
          <div style="font-weight: bold; margin-bottom: 5px;">Red Flags Detected:</div>
          <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
            ${botData.rugRiskIndicators.map(flag => `<li>${flag}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 10px; font-style: italic;">
        ${botData.details}
      </div>
      
      ${botData.riskLevel === 'Extreme' ? `
        <div style="margin-top: 12px; padding: 10px; background: rgba(230, 57, 70, 0.3); border-radius: 6px; font-weight: bold; text-align: center; color: #E63946;">
          ⛔ DO NOT BUY - EXTREME RUG RISK
        </div>
      ` : ''}
    </div>
  `;
  
  // Insert after analysis header
  const analysisHeader = analysisCard.querySelector('.analysis-header');
  if (analysisHeader) {
    analysisHeader.insertAdjacentHTML('afterend', botRiskHTML);
  }
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
  
  // Store analysis data for detailed modal
  window.currentAnalysisData = data;
  
  card.innerHTML = `
    <div class="analysis-header">
      <div>
        <div class="ticker-name-clickable" onclick="openDetailedAnalysis()" style="cursor: pointer; transition: all 0.3s ease;">
          <div class="ticker-name" style="display: inline-block;">${data.ticker}</div>
          <div style="font-size: 0.7rem; color: rgba(59, 130, 246, 0.8); margin-top: 2px;">📊 Click for Full Analysis</div>
        </div>
        <div class="price-value">$${data.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</div>
        <div class="price-change ${priceChangeClass}">
          ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}% (${data.priceChangeDollar >= 0 ? '+' : ''}$${Math.abs(data.priceChangeDollar).toFixed(2)})
        </div>
      </div>
      <div class="signal-badge ${signalClass}">
        ${signal.includes('BUY') ? '🟢' : signal.includes('SELL') ? '🔴' : '🟡'} ${signal}
      </div>
    </div>
    
    <!-- Chart Preview (Small, Click to Expand) -->
    <div class="chart-preview-container" onclick="openChartModal()" style="margin: 15px 0; height: 150px; background: rgba(255,255,255,0.05); border-radius: 8px; position: relative; cursor: pointer; border: 2px solid rgba(59, 130, 246, 0.3); transition: all 0.3s ease;">
      <div id="chartPreview" class="chart-container" style="height: 100%; width: 100%;"></div>
      <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(37, 99, 235, 0.9); color: #FFF; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: bold;">
        📊 Tap to Enlarge
      </div>
    </div>
    
    ${data.sentiment ? `
    <!-- Social Sentiment Section -->
    <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1)); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px;">
      <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        <span>📱 SOCIAL SENTIMENT</span>
        <span style="font-size: 1.2rem; margin-left: auto;">${data.sentiment.sentimentLevel}</span>
      </h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 12px;">
        ${data.sentiment.socialMetrics.twitterFollowers ? `
        <div style="background: rgba(29, 155, 240, 0.1); padding: 10px; border-radius: 6px; border: 1px solid rgba(29, 155, 240, 0.3);">
          <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 4px;">🐦 Twitter</div>
          <div style="font-weight: 600; color: #1DA1F2;">${formatVolume(data.sentiment.socialMetrics.twitterFollowers)}</div>
        </div>
        ` : ''}
        
        ${data.sentiment.socialMetrics.redditSubscribers ? `
        <div style="background: rgba(255, 69, 0, 0.1); padding: 10px; border-radius: 6px; border: 1px solid rgba(255, 69, 0, 0.3);">
          <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 4px;">🔶 Reddit</div>
          <div style="font-weight: 600; color: #FF4500;">${formatVolume(data.sentiment.socialMetrics.redditSubscribers)}</div>
        </div>
        ` : ''}
        
        ${data.sentiment.socialMetrics.telegramUsers ? `
        <div style="background: rgba(36, 161, 222, 0.1); padding: 10px; border-radius: 6px; border: 1px solid rgba(36, 161, 222, 0.3);">
          <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 4px;">✈️ Telegram</div>
          <div style="font-weight: 600; color: #24A1DE;">${formatVolume(data.sentiment.socialMetrics.telegramUsers)}</div>
        </div>
        ` : ''}
        
        ${data.sentiment.socialMetrics.githubStars ? `
        <div style="background: rgba(138, 85, 255, 0.1); padding: 10px; border-radius: 6px; border: 1px solid rgba(138, 85, 255, 0.3);">
          <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 4px;">⭐ GitHub</div>
          <div style="font-weight: 600; color: #8A55FF;">${formatVolume(data.sentiment.socialMetrics.githubStars)}</div>
        </div>
        ` : ''}
      </div>
      
      <div style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.85rem; color: var(--text-secondary);">Sentiment Score</span>
          <span style="font-size: 1.1rem; font-weight: 700; color: var(--primary);">${data.sentiment.sentimentScore}/100</span>
        </div>
        <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
          <div style="height: 100%; width: ${data.sentiment.sentimentScore}%; background: linear-gradient(90deg, #3B82F6, #10B981); transition: width 0.5s;"></div>
        </div>
      </div>
      
      ${data.sentiment.analysis ? `
      <div style="margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
        ${data.sentiment.analysis}
      </div>
      ` : ''}
    </div>
    ` : ''}
    
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
      <div style="margin-top: 15px; padding: 12px; background: linear-gradient(135deg, rgba(166, 85, 247, 0.1), rgba(230, 57, 70, 0.1)); border-radius: 8px; border-left: 3px solid #FFFFFF;">
        <div style="font-weight: 700; margin-bottom: 5px; color: #FFFFFF;">🔮 AI Prediction</div>
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
  `;
  
  // Add Crypto Cat commentary (30% chance based on signal)
  if (Math.random() < 0.3) {
    const signalLower = signal.toLowerCase();
    let catKey = 'hold';
    if (signalLower.includes('strong buy')) catKey = 'strong_buy';
    else if (signalLower.includes('buy')) catKey = 'buy';
    else if (signalLower.includes('strong sell')) catKey = 'strong_sell';
    else if (signalLower.includes('sell')) catKey = 'sell';
    
    card.innerHTML += createCryptoCatAppearance(catKey, 'medium');
  }
  
  card.innerHTML += `
    <div class="action-buttons" style="margin-top: 20px; display: flex; gap: 8px;">
      <button class="action-btn" style="flex: 1;" onclick="setAlert('${data.ticker}')">Alert</button>
      <button class="action-btn" style="flex: 1;" onclick="createOrder('${data.ticker}')">Trade</button>
      <button class="action-btn" style="flex: 1;" onclick="addToHoldings('${data.ticker}')">Hold</button>
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

// Ticker to CoinGecko ID mapping
const TICKER_TO_COIN_ID = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'XLM': 'stellar',
  'ALGO': 'algorand',
  'ICP': 'internet-computer',
  'FIL': 'filecoin',
  'NEAR': 'near',
  'APT': 'aptos',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'SUI': 'sui',
  'SHIB': 'shiba-inu',
  'PEPE': 'pepe',
  'TRX': 'tron'
};

// Helper function to resolve ticker to CoinGecko ID
function resolveCoinId(ticker) {
  const upperTicker = ticker.toUpperCase();
  return TICKER_TO_COIN_ID[upperTicker] || ticker.toLowerCase();
}

// Live Chart State
let liveChart = null;
let chartRefreshInterval = null;
let currentChartTimeframe = '1m'; // 1m, 5m, 1h, 1d, 7d, 30d, ytd
let currentChartType = 'candle'; // candle, line, or bar
let currentChartTicker = null;

// Timeframe configuration: days for API + refresh interval
const TIMEFRAME_CONFIG = {
  '1m': { days: 1, interval: 60 * 1000, label: '1 Minute' }, // Refresh every 1 min
  '5m': { days: 1, interval: 5 * 60 * 1000, label: '5 Minutes' }, // Refresh every 5 min
  '1h': { days: 7, interval: 5 * 60 * 1000, label: '1 Hour' }, // Refresh every 5 min
  '1d': { days: 30, interval: 5 * 60 * 1000, label: '1 Day' }, // Refresh every 5 min
  '7d': { days: 30, interval: 10 * 60 * 1000, label: '7 Days' }, // Refresh every 10 min
  '30d': { days: 90, interval: 10 * 60 * 1000, label: '30 Days' }, // Refresh every 10 min
  'ytd': { days: 365, interval: 15 * 60 * 1000, label: 'Year to Date' } // Refresh every 15 min
};

async function loadChart(ticker) {
  const chartPreview = document.getElementById('chartPreview');
  if (!chartPreview) return;
  
  currentChartTicker = ticker;
  
  try {
    // Clear existing chart and interval
    if (liveChart) {
      liveChart.remove();
      liveChart = null;
    }
    if (chartRefreshInterval) {
      clearInterval(chartRefreshInterval);
      chartRefreshInterval = null;
    }
    
    chartPreview.innerHTML = '<div style="padding: 20px; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; height: 100%;">📈 Loading...</div>';
    
    // Load a simple line chart for the preview (faster and cleaner on mobile)
    let success = await createSimplePriceChart(ticker, chartPreview, currentChartTimeframe);
    
    if (!success) {
      chartPreview.innerHTML = '<div style="padding: 20px; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; height: 100%;">Chart unavailable</div>';
    }
  } catch (error) {
    console.error('Preview chart error:', error);
    chartPreview.innerHTML = '<div style="padding: 20px; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; height: 100%;">Chart unavailable</div>';
  }
}

// Change chart timeframe
function changeChartTimeframe(timeframe) {
  currentChartTimeframe = timeframe;
  
  // Update button states
  document.querySelectorAll('.timeframe-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.timeframe === timeframe) {
      btn.classList.add('active');
    }
  });
  
  // Reload chart in modal if it's open
  const modal = document.getElementById('chartModal');
  if (modal && modal.style.display === 'flex' && currentChartTicker) {
    const fullContainer = document.getElementById('chartContainerFull');
    if (fullContainer) {
      if (currentChartType === 'candle') {
        createLiveCandlestickChart(currentChartTicker, fullContainer, currentChartTimeframe);
      } else if (currentChartType === 'line') {
        createSimplePriceChart(currentChartTicker, fullContainer, currentChartTimeframe);
      } else if (currentChartType === 'bar') {
        createBarChart(currentChartTicker, fullContainer, currentChartTimeframe);
      }
    }
  }
}

// Change chart type
function changeChartType(type) {
  currentChartType = type;
  
  // Update button states
  document.querySelectorAll('.chart-type-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.type === type) {
      btn.classList.add('active');
    }
  });
  
  // Reload chart in modal if it's open
  const modal = document.getElementById('chartModal');
  if (modal && modal.style.display === 'flex' && currentChartTicker) {
    const fullContainer = document.getElementById('chartContainerFull');
    if (fullContainer) {
      if (currentChartType === 'candle') {
        createLiveCandlestickChart(currentChartTicker, fullContainer, currentChartTimeframe);
      } else if (currentChartType === 'line') {
        createSimplePriceChart(currentChartTicker, fullContainer, currentChartTimeframe);
      } else if (currentChartType === 'bar') {
        createBarChart(currentChartTicker, fullContainer, currentChartTimeframe);
      }
    }
  }
}

async function createLiveCandlestickChart(ticker, container, timeframe = '1m') {
  try {
    // Show loading state
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-secondary);">
        <div class="spinner"></div>
        <span style="margin-left: 12px;">Loading chart data...</span>
      </div>
    `;
    
    // Fetch OHLC data from CoinGecko with appropriate timeframe
    const coinId = resolveCoinId(ticker);
    const days = TIMEFRAME_CONFIG[timeframe].days;
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`);
    
    if (!response.ok) {
      console.warn(`CoinGecko OHLC not available for ${ticker}, trying market chart...`);
      return await createSimplePriceChart(ticker, container, timeframe);
    }
    
    const ohlcData = await response.json();
    
    if (!ohlcData || ohlcData.length === 0) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--text-secondary); text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No Chart Data Available</div>
          <div style="font-size: 14px; opacity: 0.7;">Try a different timeframe or check back later</div>
        </div>
      `;
      return false;
    }
    
    // Clear container and create chart
    container.innerHTML = '';
    container.style.minHeight = '300px';
    container.style.background = 'rgba(0,0,0,0.3)';
    
    // Initialize chart
    const chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: 300,
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
    });
    
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00ff88',
      downColor: '#ff0066',
      borderDownColor: '#ff0066',
      borderUpColor: '#00ff88',
      wickDownColor: '#ff0066',
      wickUpColor: '#00ff88',
    });
    
    // Format OHLC data for chart
    const formattedData = ohlcData.map(item => ({
      time: Math.floor(item[0] / 1000), // Convert to seconds
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4]
    }));
    
    candlestickSeries.setData(formattedData);
    chart.timeScale().fitContent();
    
    // Handle resize
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== container) return;
      const newRect = entries[0].contentRect;
      chart.applyOptions({ width: newRect.width });
    });
    resizeObserver.observe(container);
    
    // Store chart reference
    liveChart = chart;
    
    console.log(`✅ Live candlestick chart loaded for ${ticker}`);
    return true;
  } catch (error) {
    console.error('Candlestick chart error:', error);
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--error); text-align: center; padding: 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Chart Loading Failed</div>
        <div style="font-size: 14px; opacity: 0.7; color: var(--text-secondary);">Unable to fetch chart data. Please try again later.</div>
        <div style="font-size: 12px; opacity: 0.5; color: var(--text-tertiary); margin-top: 8px;">${error.message}</div>
      </div>
    `;
    return false;
  }
}

async function createSimplePriceChart(ticker, container, timeframe = '1m') {
  try {
    // Fallback: Simple price line chart using market_chart endpoint
    const coinId = resolveCoinId(ticker);
    const days = TIMEFRAME_CONFIG[timeframe].days;
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
    
    if (!response.ok) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--text-secondary); text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Chart Data Unavailable</div>
          <div style="font-size: 14px; opacity: 0.7;">API rate limit reached or token not found</div>
        </div>
      `;
      return false;
    }
    
    const data = await response.json();
    if (!data || !data.prices || data.prices.length === 0) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--text-secondary); text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No Price History</div>
          <div style="font-size: 14px; opacity: 0.7;">This token doesn't have enough price data</div>
        </div>
      `;
      return false;
    }
    
    container.innerHTML = '';
    
    // Use container's actual height (respects 150px preview or 350px modal)
    const chartHeight = container.clientHeight || container.getBoundingClientRect().height || 300;
    
    const chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: chartHeight,
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
      },
    });
    
    const lineSeries = chart.addLineSeries({
      color: '#00ff88',
      lineWidth: 2,
    });
    
    const formattedData = data.prices.map(([timestamp, price]) => ({
      time: Math.floor(timestamp / 1000),
      value: price
    }));
    
    lineSeries.setData(formattedData);
    chart.timeScale().fitContent();
    
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== container) return;
      const newRect = entries[0].contentRect;
      chart.applyOptions({ width: newRect.width });
    });
    resizeObserver.observe(container);
    
    liveChart = chart;
    
    console.log(`✅ Live price chart loaded for ${ticker}`);
    return true;
  } catch (error) {
    console.error('Simple chart error:', error);
    return false;
  }
}

// Bar Chart (Histogram Volume Chart)
async function createBarChart(ticker, container, timeframe = '1m') {
  try {
    // Show loading state
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-secondary);">
        <div class="spinner"></div>
        <span style="margin-left: 12px;">Loading bar chart...</span>
      </div>
    `;
    
    // Fetch OHLC data from CoinGecko with appropriate timeframe
    const coinId = resolveCoinId(ticker);
    const days = TIMEFRAME_CONFIG[timeframe].days;
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`);
    
    if (!response.ok) {
      console.warn(`CoinGecko OHLC not available for ${ticker}, cannot create bar chart`);
      return false;
    }
    
    const ohlcData = await response.json();
    
    if (!ohlcData || ohlcData.length === 0) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--text-secondary); text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No Chart Data Available</div>
          <div style="font-size: 14px; opacity: 0.7;">Try a different timeframe or check back later</div>
        </div>
      `;
      return false;
    }
    
    // Clear container and create chart
    container.innerHTML = '';
    container.style.minHeight = '300px';
    container.style.background = 'rgba(0,0,0,0.3)';
    
    // Initialize chart
    const chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: 300,
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
    });
    
    // Add histogram series for bar chart
    const histogramSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'right',
    });
    
    // Format OHLC data for histogram (using close - open as bar height, colored by direction)
    const formattedData = ohlcData.map(item => {
      const time = Math.floor(item[0] / 1000); // Convert to seconds
      const open = item[1];
      const close = item[4];
      const value = Math.abs(close - open); // Bar height
      const color = close >= open ? '#26a69a' : '#ef5350'; // Green for up, red for down
      
      return {
        time,
        value,
        color
      };
    });
    
    histogramSeries.setData(formattedData);
    chart.timeScale().fitContent();
    
    // Handle resize
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== container) return;
      const newRect = entries[0].contentRect;
      chart.applyOptions({ width: newRect.width });
    });
    resizeObserver.observe(container);
    
    // Store chart reference
    liveChart = chart;
    
    console.log(`✅ Bar chart loaded for ${ticker} with ${formattedData.length} bars`);
    return true;
  } catch (error) {
    console.error(`Bar chart error for ${ticker}:`, error);
    return false;
  }
}

async function loadStaticChart(ticker, chartContainer) {
  try {
    const response = await fetch(`${API_BASE}/api/chart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ticker, userId: state.userId })
    });
    
    const data = await response.json();
    
    if (data.success && data.chartUrl) {
      chartContainer.innerHTML = `<img src="${data.chartUrl}" style="width: 100%; border-radius: 8px; cursor: pointer; display: block;" alt="Price Chart" />`;
      
      chartContainer.onclick = () => openChartModal(data.chartUrl, ticker);
      const img = chartContainer.querySelector('img');
      if (img) {
        img.onclick = () => openChartModal(data.chartUrl, ticker);
      }
      
      state.currentChartUrl = data.chartUrl;
      state.currentChartTicker = ticker;
    } else {
      chartContainer.innerHTML = '<div style="padding: 20px; color: var(--text-secondary);">Chart unavailable</div>';
    }
  } catch (error) {
    console.error('Static chart error:', error);
    chartContainer.innerHTML = '<div style="padding: 20px; color: var(--text-secondary);">Chart unavailable</div>';
  }
}

// Chart Modal Functions  
function openChartModal(chartUrl, ticker) {
  const modal = document.getElementById('chartModal');
  const modalTitle = document.getElementById('chartModalTitle');
  
  // Use current ticker if available, fallback to parameter
  const chartTicker = currentChartTicker || ticker;
  
  if (chartTicker) {
    modalTitle.textContent = `${chartTicker.toUpperCase()} - Price Chart`;
    
    // Load full chart in modal
    const fullContainer = document.getElementById('chartContainerFull');
    if (fullContainer) {
      if (currentChartType === 'candle') {
        createLiveCandlestickChart(chartTicker, fullContainer, currentChartTimeframe);
      } else if (currentChartType === 'line') {
        createSimplePriceChart(chartTicker, fullContainer, currentChartTimeframe);
      } else if (currentChartType === 'bar') {
        createBarChart(chartTicker, fullContainer, currentChartTimeframe);
      } else {
        // Default to candlestick
        createLiveCandlestickChart(chartTicker, fullContainer, currentChartTimeframe);
      }
    }
  }
  
  modal.style.display = 'flex';
  
  if (tg) {
    tg.HapticFeedback?.impactOccurred('medium');
  }
  
  // Prevent background scrolling
  document.body.style.overflow = 'hidden';
}

function closeChartModal() {
  const modal = document.getElementById('chartModal');
  modal.style.display = 'none';
  
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
      // Return full data object so we can check if premium
      return { success: true, isPremium: data.isPremium, message: data.message };
    }
    return { success: false };
  } catch (error) {
    console.error('Access verification error:', error);
    return { success: false };
  }
}

function showPremiumWelcome(email) {
  const welcomeModal = document.createElement('div');
  welcomeModal.id = 'premiumWelcome';
  welcomeModal.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      padding: 20px;
    ">
      <div style="
        background: #000000;
        border: 2px solid rgba(255, 255, 255, 0.5);
        border-radius: 20px;
        padding: 40px 30px;
        max-width: 500px;
        width: 100%;
        text-align: center;
        box-shadow: 0 0 50px rgba(139, 0, 0, 0.8);
        animation: fadeIn 0.5s ease;
      ">
        <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
        <h2 style="
          color: #fff;
          margin-bottom: 15px;
          font-size: 28px;
          font-weight: bold;
        ">Congratulations!</h2>
        <p style="
          color: #4ADE80;
          margin-bottom: 30px;
          font-size: 18px;
          font-weight: 600;
        ">You're a Premium Member</p>
        
        <div style="
          background: rgba(26, 0, 0, 0.6);
          border: 1px solid #8b0000;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
          text-align: left;
        ">
          <p style="color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 15px; text-align: center;">
            Your Premium Benefits:
          </p>
          <ul style="color: #ddd; font-size: 14px; line-height: 2; list-style: none; padding: 0;">
            <li>✅ <strong>Unlimited</strong> technical analysis searches</li>
            <li>✅ <strong>Advanced</strong> interactive charts & indicators</li>
            <li>✅ <strong>Priority</strong> access to new features</li>
            <li>✅ <strong>Exclusive</strong> DarkWave token airdrops</li>
            <li>✅ <strong>Permanent</strong> access - never expires</li>
            <li>✅ <strong>VIP</strong> support & community access</li>
          </ul>
        </div>
        
        <p style="
          color: #999;
          font-size: 13px;
          margin-bottom: 25px;
        ">Whitelisted: ${email.substring(0, 3)}***${email.substring(email.indexOf('@'))}</p>
        
        <button onclick="document.getElementById('premiumWelcome').remove()" style="
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
        ">
          Start Exploring 🚀
        </button>
      </div>
    </div>
    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
    </style>
  `;
  
  document.body.appendChild(welcomeModal);
  if (tg) tg.HapticFeedback?.notificationOccurred('success');
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
      background: #000000;
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
        <p style="color: #999; margin-bottom: 30px; font-size: 14px;">Enter access code or whitelisted email</p>
        
        <input 
          type="text" 
          id="accessCodeInput" 
          placeholder="Access code or email"
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
        ">Invalid access code or email not whitelisted</div>
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
    
    const result = await verifyAccessCode(code);
    
    if (result.success) {
      document.getElementById('accessGate').remove();
      document.getElementById('app').style.display = 'block';
      
      // Show congratulations for whitelisted premium users
      if (result.isPremium && result.message && result.message.includes('Whitelisted')) {
        showPremiumWelcome(code);
      }
      
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
  // Always load market data first (for better UX)
  loadMarketOverview('top');
  updateCMCStatsBar();
  updateAvgRSI();
  
  // Initialize Dashboard Widgets after CMC stats are loaded
  setTimeout(() => {
    if (window.DashboardWidgets) {
      window.DashboardWidgets.init();
      window.DashboardWidgets.syncWithCMC();
      console.log('✅ Dashboard Widgets initialized and synced');
    }
  }, 1000);
  
  // Wallet Session Reset Button Handler
  const resetSessionBtn = document.getElementById('resetSessionBtn');
  if (resetSessionBtn) {
    resetSessionBtn.addEventListener('click', () => {
      // Confirmation dialog to prevent accidental data loss
      const confirmed = confirm(
        '⚠️ Reset Wallet Session?\n\n' +
        'This will clear all wallet data and reload the app.\n' +
        'You will need to reconnect your wallet.\n\n' +
        'Are you sure you want to continue?'
      );
      
      if (confirmed) {
        console.log('🗑️ Resetting wallet session...');
        console.log('😿 Resetting your wallet? Fine. Let\'s pretend that last portfolio never happened.');
        
        // Clear wallet-related data from localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('wallet') || key.includes('address'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Show toast and reload
        showToast('🗑️ Wallet session cleared. Reloading...');
        if (tg) tg.HapticFeedback?.notificationOccurred('success');
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.log('❌ Wallet session reset cancelled');
      }
    });
    console.log('✅ Wallet session reset button initialized');
  }
  
  // Update CMC stats every 5 minutes
  setInterval(() => {
    updateCMCStatsBar();
    // Sync dashboard widgets with updated CMC stats
    if (window.DashboardWidgets) {
      window.DashboardWidgets.syncWithCMC();
    }
  }, 5 * 60 * 1000);
  setInterval(updateAvgRSI, 10 * 60 * 1000);
  
  // Check access code after data starts loading
  if (!checkAccessCode()) {
    showAccessGate();
  } else {
    state.accessGranted = true;
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
  
  // Asset Class Toggle (Stocks vs Crypto)
  document.querySelectorAll('.asset-class-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const assetClass = btn.dataset.asset;
      
      // Update active state
      document.querySelectorAll('.asset-class-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update state
      state.assetClass = assetClass;
      
      // Reload market data with new filter
      loadMarketOverview(state.currentCategory);
      
      // Update stats bar labels
      if (assetClass === 'stocks') {
        document.querySelector('[data-asset="stocks"] .asset-label').textContent = 'Stocks';
        showToast('📊 Switched to Stocks mode');
      } else {
        document.querySelector('[data-asset="crypto"] .asset-label').textContent = 'Cryptocurrency';
        showToast('🪙 Switched to Crypto mode');
      }
      
      if (tg) tg.HapticFeedback?.impactOccurred('light');
    });
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
    console.log('😸 Wallet connected? Let me see what garbage you\'re holding this time...');
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
    console.log('😿 Disconnecting? Can\'t handle me judging your portfolio? Typical.');
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
              <span style="font-size: 0.85rem; padding: 3px 8px; border-radius: 10px; background: rgba(168, 85, 247, 0.2); color: #FFFFFF;">${order.status}</span>
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
      console.log('💃 Finally! A premium payment. About time you invested in something that matters.');
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
      console.log('💃 Crypto payment? Now we\'re talking my language. Don\'t mess this up.');
      
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
  const singleView = document.getElementById('marketOverviewSingle');
  
  // Always use CMC-style single table view
  singleView.style.display = 'block';
  await loadSingleMarketView(category);
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
  
  // Get current asset class from state (crypto or stocks)
  const assetClass = state.assetClass || 'crypto';
  
  // NFT rendering is special (crypto-only)
  if (category === 'nft') {
    if (assetClass === 'crypto') {
      renderNFTTable();
      return;
    } else {
      // Stocks don't have NFTs, show empty message
      tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 30px; color: var(--text-secondary);">NFT category not available for stocks</td></tr>';
      return;
    }
  }
  
  // Check cache first (5-minute cache) - include assetClass in cache key
  const cacheKey = `market_${assetClass}_${category}`;
  const cached = localStorage.getItem(cacheKey);
  const cacheTime = localStorage.getItem(`${cacheKey}_time`);
  
  if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 5 * 60 * 1000) {
    console.log(`📦 Using cached data for ${assetClass}/${category}`);
    const data = JSON.parse(cached);
    if (assetClass === 'stocks') {
      renderStocksTable(data);
    } else {
      renderCMCTable(data);
    }
    return;
  }
  
  // Show loading
  tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 30px;"><div class="spinner"></div></td></tr>';
  
  try {
    // Call unified backend API
    const url = `${API_BASE}/api/market-overview?assetClass=${assetClass}&category=${category}`;
    console.log(`🌐 Fetching ${assetClass} data from:`, url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the data
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
    
    console.log(`✅ Loaded ${data.length} ${assetClass} items for ${category}`);
    
    // Render based on asset class
    if (assetClass === 'stocks') {
      renderStocksTable(data);
    } else {
      renderCMCTable(data);
    }
  } catch (error) {
    console.error('Error loading market overview:', error);
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #999;">Failed to load ${assetClass} data</td></tr>`;
  }
}

function renderCMCTable(data) {
  const tableBody = document.getElementById('marketTableBody');
  
  if (!data || data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #999;">No data available</td></tr>';
    return;
  }
  
  tableBody.innerHTML = data.slice(0, 100).map((coin, index) => {
    const priceChange1h = coin.price_change_percentage_1h_in_currency || 0;
    const priceChange24h = coin.price_change_percentage_24h || 0;
    const priceChange7d = coin.price_change_percentage_7d_in_currency || 0;
    
    const change1hClass = priceChange1h >= 0 ? 'positive' : 'negative';
    const change24hClass = priceChange24h >= 0 ? 'positive' : 'negative';
    const change7dClass = priceChange7d >= 0 ? 'positive' : 'negative';
    
    const sparklineSvg = generateSparkline(coin.sparkline_in_7d?.price || [], priceChange7d >= 0);
    
    return `
      <tr onclick="analyzeAssetFromTable('${coin.symbol.toUpperCase()}')" style="cursor: pointer;">
        <td style="color: var(--text-secondary); font-size: 0.85rem;">${index + 1}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${coin.image}" alt="${coin.name}" style="width: 24px; height: 24px; border-radius: 50%;" onerror="this.style.display='none'">
            <div>
              <div style="font-weight: 600; color: var(--text-primary);">${coin.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">${coin.symbol.toUpperCase()}</div>
            </div>
          </div>
        </td>
        <td style="text-align: right; font-weight: 600; color: var(--text-primary);">
          $${coin.current_price >= 1 ? coin.current_price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : coin.current_price.toFixed(6)}
        </td>
        <td style="text-align: right; font-size: 0.85rem;" class="${change1hClass}">
          ${priceChange1h >= 0 ? '+' : ''}${priceChange1h.toFixed(2)}%
        </td>
        <td style="text-align: right; font-size: 0.85rem;" class="${change24hClass}">
          ${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%
        </td>
        <td style="text-align: right; font-size: 0.85rem;" class="${change7dClass}">
          ${priceChange7d >= 0 ? '+' : ''}${priceChange7d.toFixed(2)}%
        </td>
        <td style="text-align: right; color: var(--text-secondary); font-size: 0.85rem;">
          $${formatLargeNumber(coin.total_volume)}
        </td>
        <td style="text-align: right; color: var(--text-secondary); font-size: 0.85rem;">
          $${formatLargeNumber(coin.market_cap)}
        </td>
        <td style="padding: 8px;">
          ${sparklineSvg}
        </td>
      </tr>
    `;
  }).join('');
}

function generateSparkline(prices, isPositive) {
  if (!prices || prices.length === 0) {
    return '<div style="width: 120px; height: 40px;"></div>';
  }
  
  const width = 120;
  const height = 40;
  const padding = 2;
  
  const validPrices = prices.filter(p => p !== null && p !== undefined && !isNaN(p));
  if (validPrices.length === 0) return '<div style="width: 120px; height: 40px;"></div>';
  
  const min = Math.min(...validPrices);
  const max = Math.max(...validPrices);
  const range = max - min || 1;
  
  const points = validPrices.map((price, i) => {
    const x = (i / (validPrices.length - 1)) * (width - 2 * padding) + padding;
    const y = height - padding - ((price - min) / range) * (height - 2 * padding);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
  
  const color = isPositive ? '#10b981' : '#ef4444';
  
  return `
    <svg width="${width}" height="${height}" style="display: block;">
      <polyline
        points="${points}"
        fill="none"
        stroke="${color}"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
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

function renderStocksTable(data) {
  const tableBody = document.getElementById('marketTableBody');
  
  if (!data || data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #999;">No stock data available</td></tr>';
    return;
  }
  
  tableBody.innerHTML = data.slice(0, 100).map((stock, index) => {
    const priceChange1h = stock.change_1h || 0;
    const priceChange24h = stock.change_24h || 0;
    const priceChange7d = stock.change_7d || 0;
    
    const change1hClass = priceChange1h >= 0 ? 'positive' : 'negative';
    const change24hClass = priceChange24h >= 0 ? 'positive' : 'negative';
    const change7dClass = priceChange7d >= 0 ? 'positive' : 'negative';
    
    // Stocks don't have sparklines from Yahoo Finance quote endpoint
    const sparklineSvg = '<div style="width: 120px; height: 40px; text-align: center; color: var(--text-secondary); font-size: 0.7rem; display: flex; align-items: center; justify-content: center;">N/A</div>';
    
    return `
      <tr onclick="analyzeAssetFromTable('${stock.symbol}')" style="cursor: pointer;">
        <td style="color: var(--text-secondary); font-size: 0.85rem;">${stock.rank || index + 1}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div>
              <div style="font-weight: 600; color: var(--text-primary);">${stock.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">${stock.symbol}</div>
            </div>
          </div>
        </td>
        <td style="text-align: right; font-weight: 600; color: var(--text-primary);">
          $${stock.price >= 1 ? stock.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : stock.price.toFixed(4)}
        </td>
        <td style="text-align: right; font-size: 0.85rem; color: var(--text-secondary);">
          --
        </td>
        <td style="text-align: right; font-size: 0.85rem;" class="${change24hClass}">
          ${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%
        </td>
        <td style="text-align: right; font-size: 0.85rem; color: var(--text-secondary);">
          --
        </td>
        <td style="text-align: right; color: var(--text-secondary); font-size: 0.85rem;">
          $${formatLargeNumber(stock.market_cap)}
        </td>
        <td style="text-align: right; color: var(--text-secondary); font-size: 0.85rem;">
          $${formatLargeNumber(stock.volume_24h)}
        </td>
        <td style="padding: 8px;">
          ${sparklineSvg}
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
  openSettingsModal();
  if (tg) tg.HapticFeedback?.impactOccurred('light');
});

// Settings Modal
function openSettingsModal() {
  const existingModal = document.getElementById('settingsModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Get current cat enabled state from localStorage
  const isCatEnabled = localStorage.getItem('darkwave_crypto_cat') !== 'false';

  const modal = document.createElement('div');
  modal.id = 'settingsModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px; max-height: 80vh; overflow-y: auto;">
      <div class="modal-header">
        <h2>⚙️ Settings</h2>
        <button class="close-btn" onclick="document.getElementById('settingsModal').remove()">✕</button>
      </div>
      <div class="modal-body">
        <!-- Theme Selector -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 10px; font-weight: 600; color: var(--text-primary);">🎨 Theme Style</label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            <button class="theme-btn ${document.body.classList.contains('theme-jupiter') ? 'active' : ''}" data-theme="jupiter" onclick="changeTheme('jupiter')">
              <span style="font-size: 0.85rem;">⚡ Electric Night</span>
            </button>
            <button class="theme-btn ${document.body.classList.contains('theme-robinhood') ? 'active' : ''}" data-theme="robinhood" onclick="changeTheme('robinhood')">
              <span style="font-size: 0.85rem;">🍃 Clean Green</span>
            </button>
            <button class="theme-btn ${document.body.classList.contains('theme-coinbase') ? 'active' : ''}" data-theme="coinbase" onclick="changeTheme('coinbase')">
              <span style="font-size: 0.85rem;">💎 Pro Blue</span>
            </button>
            <button class="theme-btn ${document.body.classList.contains('theme-sakura') ? 'active' : ''}" data-theme="sakura" onclick="changeTheme('sakura')">
              <span style="font-size: 0.85rem;">🌸 Sakura Pink</span>
            </button>
            <button class="theme-btn ${document.body.classList.contains('theme-sunset') ? 'active' : ''}" data-theme="sunset" onclick="changeTheme('sunset')">
              <span style="font-size: 0.85rem;">🌅 Sunset</span>
            </button>
            <button class="theme-btn ${document.body.classList.contains('theme-ocean') ? 'active' : ''}" data-theme="ocean" onclick="changeTheme('ocean')">
              <span style="font-size: 0.85rem;">🌊 Ocean</span>
            </button>
          </div>
        </div>

        <!-- Crypto Cat Toggle -->
        <div style="padding: 12px; background: rgba(255, 215, 0, 0.1); border: 2px solid rgba(255, 215, 0, 0.3); border-radius: 8px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-weight: 600;">😼 Crypto Cat Guide</span>
              <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 4px 0 0 0;">Sarcastic trading commentary</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="toggleCryptoCatModal" ${isCatEnabled ? 'checked' : ''} onchange="toggleCryptoCatFromModal(this)">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Subscription Info -->
        <div style="padding: 12px; background: rgba(37, 99, 235, 0.1); border: 2px solid rgba(37, 99, 235, 0.3); border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 600;">Subscription Plan</span>
            <span class="status-pill">Premium Active</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">Unlimited searches & analysis</p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function changeTheme(themeName) {
  // Remove all theme classes
  document.body.classList.remove('theme-jupiter', 'theme-robinhood', 'theme-coinbase', 'theme-sakura', 'theme-sunset', 'theme-ocean');
  
  // Add new theme
  document.body.classList.add(`theme-${themeName}`);
  
  // Save preference
  localStorage.setItem('selectedTheme', themeName);
  
  // Update button states in modal
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === themeName) {
      btn.classList.add('active');
    }
  });
  
  showNotification(`Theme changed to ${themeName}`, 'success');
}

function toggleCryptoCatFromModal(checkbox) {
  const isEnabled = checkbox.checked;
  state.cryptoCatEnabled = isEnabled;
  localStorage.setItem('darkwave_crypto_cat', isEnabled);
  
  // Sync with main image toggle
  const statusIndicator = document.querySelector('.cat-toggle-status .status-indicator');
  const statusText = document.querySelector('.cat-toggle-text');
  const catImage = document.getElementById('catToggleImage');
  
  if (statusIndicator && statusText && catImage) {
    if (isEnabled) {
      statusIndicator.classList.add('active');
      statusIndicator.textContent = 'ON';
      statusText.textContent = 'Crypto Cat';
      catImage.style.opacity = '1';
      catImage.style.filter = 'none';
    } else {
      statusIndicator.classList.remove('active');
      statusIndicator.textContent = 'OFF';
      statusText.textContent = 'Plain Mode';
      catImage.style.opacity = '0.4';
      catImage.style.filter = 'grayscale(100%)';
    }
  }
  
  if (!isEnabled) {
    const existingPopup = document.querySelector('.crypto-cat-popup');
    if (existingPopup) existingPopup.remove();
    showNotification('😿 Crypto Cat is taking a nap', 'info');
  } else {
    showNotification('😼 Crypto Cat is back!', 'success');
    setTimeout(startRandomCatAppearances, 5000);
  }
}

// ===== AI AGENT WIDGET FUNCTIONS =====
function toggleAIAgent() {
  const aiBox = document.getElementById('aiAgentBox');
  const aiToggle = document.getElementById('aiAgentToggle');
  
  if (aiBox.style.display === 'none') {
    aiBox.style.display = 'flex';
    aiToggle.style.display = 'none';
  } else {
    aiBox.style.display = 'none';
    aiToggle.style.display = 'flex';
  }
}

async function sendAIMessage() {
  const input = document.getElementById('aiAgentInput');
  const messagesContainer = document.getElementById('aiAgentMessages');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'ai-message user-message';
  userMsg.innerHTML = `<strong>You:</strong> ${message}`;
  messagesContainer.appendChild(userMsg);
  
  input.value = '';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Add typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'ai-message typing-indicator';
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  try {
    const response = await fetch('/api/agents/DarkWave-V2/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `[HELPFUL ASSISTANT MODE] ${message}`
        }],
        userId: state.userId
      })
    });
    
    const data = await response.json();
    
    // Remove typing indicator
    typingDiv.remove();
    
    // Add AI response
    const aiMsg = document.createElement('div');
    aiMsg.className = 'ai-message ai-response';
    aiMsg.innerHTML = `<strong>🤖 DarkWave:</strong> ${data.text || 'Sorry, I encountered an error.'}`;
    messagesContainer.appendChild(aiMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (error) {
    console.error('AI Agent error:', error);
    typingDiv.remove();
    const errorMsg = document.createElement('div');
    errorMsg.className = 'ai-message ai-response';
    errorMsg.innerHTML = '<strong>🤖 DarkWave:</strong> Connection error. Please try again.';
    messagesContainer.appendChild(errorMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// ===== SUBSCRIPTION PAGE FUNCTION =====
function openSubscriptionPage() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content subscription-modal" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header">
        <h2>👑 Upgrade to Premium</h2>
        <button class="close-btn" onclick="this.closest('.modal-backdrop').remove()">✕</button>
      </div>
      
      <div class="modal-body">
        <!-- Pricing Tiers -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;">
          
          <!-- Free Tier -->
          <div class="pricing-card free-tier">
            <h3 style="margin: 0 0 10px 0; color: var(--text-secondary);">Free Trial</h3>
            <div class="price-tag">
              <span class="price">$0</span>
              <span class="period">/forever</span>
            </div>
            <ul class="feature-list">
              <li>✓ 10 searches per day</li>
              <li>✓ Basic charts</li>
              <li>✓ 3 price alerts</li>
              <li>✓ Standard support</li>
              <li>✗ Advanced analytics</li>
              <li>✗ Unlimited searches</li>
            </ul>
            <button class="btn-tier current-plan" disabled>Current Plan</button>
          </div>
          
          <!-- Basic Tier -->
          <div class="pricing-card basic-tier">
            <h3 style="margin: 0 0 10px 0; color: #60A5FA;">Basic</h3>
            <div class="price-tag">
              <span class="price">$2</span>
              <span class="period">/month</span>
            </div>
            <ul class="feature-list">
              <li>✓ 50 searches per day</li>
              <li>✓ Advanced charts</li>
              <li>✓ 10 price alerts</li>
              <li>✓ Priority support</li>
              <li>✓ NFT analysis</li>
              <li>✗ Unlimited searches</li>
            </ul>
            <button class="btn-tier basic-btn" onclick="initiatePayment('basic')">Select Basic</button>
          </div>
          
          <!-- Premium Tier (Recommended) -->
          <div class="pricing-card premium-tier recommended">
            <div class="recommended-badge">⭐ RECOMMENDED</div>
            <h3 style="margin: 0 0 10px 0; color: #FFD700;">Premium</h3>
            <div class="price-tag">
              <span class="price">$5</span>
              <span class="period">/month</span>
            </div>
            <ul class="feature-list">
              <li>✓ Unlimited searches</li>
              <li>✓ Advanced charts & indicators</li>
              <li>✓ Unlimited price alerts</li>
              <li>✓ VIP support</li>
              <li>✓ NFT & DEX analysis</li>
              <li>✓ Predictive analytics</li>
              <li>✓ Rug-risk detection</li>
              <li>✓ DWLP token presale access</li>
            </ul>
            <button class="btn-tier premium-btn" onclick="initiatePayment('premium')">Select Premium</button>
          </div>
        </div>
        
        <!-- Payment Methods -->
        <div style="margin-top: 40px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
          <h3 style="margin: 0 0 20px 0; text-align: center;">Secure Payment Options</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
            
            <!-- Stripe Payment -->
            <div class="payment-option">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" style="height: 30px; margin-bottom: 12px;" />
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">
                Credit & Debit Cards<br/>
                <small>Powered by Stripe</small>
              </p>
            </div>
            
            <!-- Coinbase Commerce -->
            <div class="payment-option">
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Coinbase.svg" alt="Coinbase" style="height: 30px; margin-bottom: 12px;" />
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">
                Crypto Payments<br/>
                <small>Powered by Coinbase Commerce</small>
              </p>
            </div>
          </div>
          
          <p style="text-align: center; margin: 20px 0 0 0; font-size: 0.75rem; color: var(--text-tertiary);">
            🔒 All transactions are encrypted and secure. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function initiatePayment(tier) {
  showNotification(`Payment processing for ${tier} plan coming soon! Integration with Stripe/Coinbase pending.`, 'info');
  // TODO: Integrate actual Stripe/Coinbase payment flow
}

// ===== CRYPTO CAT IMAGE TOGGLE =====
function toggleCryptoCatImage() {
  const isCatEnabled = localStorage.getItem('darkwave_crypto_cat') !== 'false';
  const newState = !isCatEnabled;
  
  localStorage.setItem('darkwave_crypto_cat', newState);
  state.cryptoCatEnabled = newState;
  
  const statusIndicator = document.querySelector('.cat-toggle-status .status-indicator');
  const statusText = document.querySelector('.cat-toggle-text');
  const catImage = document.getElementById('catToggleImage');
  
  if (newState) {
    // ON - Show current mode
    statusIndicator.classList.add('active');
    statusIndicator.textContent = 'ON';
    catImage.style.opacity = '1';
    catImage.style.filter = 'none';
    showNotification(`😼 Crypto Cat activated in ${state.catMode} mode!`, 'success');
    setTimeout(startRandomCatAppearances, 5000);
  } else {
    // OFF - Cat disabled
    statusIndicator.classList.remove('active');
    statusIndicator.textContent = 'OFF';
    statusText.textContent = 'Disabled';
    catImage.style.opacity = '0.4';
    catImage.style.filter = 'grayscale(100%)';
    const existingPopup = document.querySelector('.crypto-cat-popup');
    if (existingPopup) existingPopup.remove();
    showNotification('😿 Crypto Cat disabled', 'info');
  }
  
  // Update mode UI (show/hide mode switcher button)
  updateCatModeUI();
  
  if (tg) tg.HapticFeedback?.impactOccurred('medium');
}

// Initialize cat toggle state on load
document.addEventListener('DOMContentLoaded', () => {
  const isCatEnabled = localStorage.getItem('darkwave_crypto_cat') !== 'false';
  const statusIndicator = document.querySelector('.cat-toggle-status .status-indicator');
  const statusText = document.querySelector('.cat-toggle-text');
  const catImage = document.getElementById('catToggleImage');
  
  if (statusIndicator && statusText && catImage) {
    if (isCatEnabled) {
      statusIndicator.classList.add('active');
      statusIndicator.textContent = 'ON';
      statusText.textContent = 'Crypto Cat';
      catImage.style.opacity = '1';
      catImage.style.filter = 'none';
    } else {
      statusIndicator.classList.remove('active');
      statusIndicator.textContent = 'OFF';
      statusText.textContent = 'Disabled';
      catImage.style.opacity = '0.4';
      catImage.style.filter = 'grayscale(100%)';
    }
    // Update mode switcher button visibility
    updateCatModeUI();
  }
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
  
  // Crypto Cat "BORED ANYWAY" dominant banner at top (using sideeye pose for attitude)
  const cryptoCatBanner = state.cryptoCatEnabled ? `
    <div style="margin: -16px -16px 24px -16px; background: linear-gradient(135deg, #FF006E 0%, #A855F7 100%); padding: 24px; border-radius: 12px 12px 0 0; border-bottom: 3px solid var(--neon-pink); box-shadow: 0 4px 20px rgba(255, 0, 110, 0.3);">
      <div style="display: flex; gap: 20px; align-items: center;">
        <img src="${CAT_POSE_IMAGES['sideeye']}" alt="Crypto Cat - Bored Anyway" style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid white; flex-shrink: 0; filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));">
        <div style="flex: 1;">
          <div style="font-size: 2rem; font-weight: 900; color: white; margin-bottom: 8px; text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);">CRYPTO CAT'S GLOSSARY</div>
          <div style="font-size: 1.2rem; color: rgba(255, 255, 255, 0.95); font-style: italic; margin-bottom: 12px;">"Learning crypto terms? BORED ANYWAY... but I'll explain them with attitude."</div>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <span style="background: rgba(255, 255, 255, 0.2); padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; color: white; border: 1px solid rgba(255, 255, 255, 0.3);">🙄 Sarcasm Included</span>
            <span style="background: rgba(255, 255, 255, 0.2); padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; color: white; border: 1px solid rgba(255, 255, 255, 0.3);">😼 Smartass Commentary</span>
            <span style="background: rgba(255, 255, 255, 0.2); padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; color: white; border: 1px solid rgba(255, 255, 255, 0.3);">💅 Brutal Honesty</span>
          </div>
        </div>
      </div>
    </div>
  ` : '';
  
  glossaryContent.innerHTML = cryptoCatBanner + groupKeys.map(key => {
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
                  const catImage = getCatPoseImage(catData.mood);
                  return `
                    <div style="display: flex; gap: 10px; align-items: start; margin-bottom: 12px; background: rgba(255, 0, 110, 0.05); padding: 10px; border-radius: 8px; border: 1px solid rgba(255, 0, 110, 0.2);">
                      <img src="${catImage}" alt="Crypto Cat ${catData.mood}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--neon-green); flex-shrink: 0;">
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
    name: 'DarkWave Token',
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
    description: 'The native DarkWave utility token powering the ecosystem. Early holders get lifetime premium discounts, exclusive signals access, governance voting, and revenue sharing. Launch includes presale bonuses for whitelist members.',
    presaleStart: new Date('2025-12-01T00:00:00Z'), // Dec 1 presale start
    whitepaper: 'whitepaper.html'
  },
  {
    id: '2',
    name: 'DarkWave v2.0',
    symbol: 'UPDATE',
    logo: '/darkwave-coin.png',
    launchDate: new Date('2026-01-15T00:00:00Z'), // January 2026
    launchPrice: 'FREE',
    totalSupply: 'Platform Upgrade',
    initialMarketCap: 'For All Users',
    maxWhitelistSpots: null,
    currentWhitelistCount: null,
    minAllocation: null,
    maxAllocation: null,
    description: 'Stop chasing pumps. Start conviction trading. Learn to identify real opportunities vs liquidity traps that wreck beginners. Multi-signal scoring combines RSI, MACD, and sentiment to filter noise from signal. Track record monitoring proves accuracy over time. Emotional AI learns patterns the market repeats. Educational tools teach you WHY signals work, not just WHEN to buy. Build confidence through understanding.',
    presaleStart: null,
    whitepaper: null,
    isFeature: true // Flag to render differently
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
        <button class="subscribe-button" onclick="closeModal(); switchTab('subscribe')" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #FF006E, #FFFFFF); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
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
          <button type="submit" style="flex: 2; padding: 12px; background: linear-gradient(135deg, #FF006E, #FFFFFF); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
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

// Category Configuration for Projects Page
const CATEGORY_CONFIG = {
  cryptoCat: {
    title: 'Crypto Cat Series',
    description: 'Collectible glossary tokens released monthly. Each coin represents a crypto term from A to Z, featuring unique artwork and limited edition drops. Support your local grumpy crypto cat and join early collectors who will unlock future airdrop eligibility.',
    teaser: 'Limited edition releases coming soon. Stay tuned for exclusive drops and community airdrops.'
  },
  religious: {
    title: 'Religious & Spiritual',
    description: 'Educational tokens exploring spiritual beliefs and ancient wisdom. These tokens aim to share knowledge and connect communities around shared values and faith-based perspectives.',
    teaser: 'New tokens in this series will expand the collection with thoughtful, educational content.'
  },
  conspiracy: {
    title: 'Conspiracy Themed',
    description: 'Thematic collectibles exploring alternative perspectives and hidden truths. Each token represents a unique concept designed to spark conversation and community engagement.',
    teaser: 'More conspiracy-themed releases planned as the collection grows.'
  },
  general: {
    title: 'Community Projects',
    description: 'Additional projects and community-driven tokens that support our mission of building an honest, early-entry community where supporters can make a real difference.',
    teaser: ''
  }
};

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
  
  // Group tokens by category
  const categorizedTokens = {
    cryptoCat: tokens.filter(t => t.category === 'cryptoCat'),
    conspiracy: tokens.filter(t => t.category === 'conspiracy'),
    religious: tokens.filter(t => t.category === 'religious'),
    general: tokens.filter(t => !t.category || t.category === 'general')
  };
  
  // Helper function to render a token card
  const renderTokenCard = (token) => {
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
              Buy on ${token.platform === 'raydium' ? 'Raydium' : 'Pump.fun'}
            </button>
            ${token.twitter ? `<button class="project-btn project-btn-secondary" onclick="window.open('${token.twitter}', '_blank')">Twitter</button>` : ''}
            ${token.telegram ? `<button class="project-btn project-btn-secondary" onclick="window.open('${token.telegram}', '_blank')">Telegram</button>` : ''}
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
            Buy Now
          </button>
          <button class="project-btn project-btn-secondary" onclick="window.open('${data.dexUrl}', '_blank')">
            Chart
          </button>
          <button class="project-btn project-btn-secondary" onclick="addToHoldings('${data.symbol}')">
            Watch
          </button>
        </div>
        
        ${token.twitter || token.telegram ? `
          <div class="project-socials">
            ${token.twitter ? `<button class="project-social-btn" onclick="window.open('${token.twitter}', '_blank')">Twitter</button>` : ''}
            ${token.telegram ? `<button class="project-social-btn" onclick="window.open('${token.telegram}', '_blank')">Telegram</button>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  };
  
  // Helper function to render a category section
  const renderCategorySection = (categoryKey, categoryTokens) => {
    if (categoryTokens.length === 0 && categoryKey !== 'general') return '';
    
    const config = CATEGORY_CONFIG[categoryKey];
    if (!config) {
      console.warn(`Unknown category: ${categoryKey}`);
      return '';
    }
    
    if (categoryTokens.length === 0) return '';
    
    return `
      <section class="category-section" style="margin-bottom: 40px;">
        <header style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--card-bg);">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
            ${config.title}
          </h2>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: ${config.teaser ? '12px' : '0'};">
            ${config.description}
          </p>
          ${config.teaser ? `
            <p style="color: var(--neon-pink); font-size: 0.9rem; font-style: italic;">
              <strong>${config.teaser}</strong>
            </p>
          ` : ''}
        </header>
        <div class="category-tokens">
          ${categoryTokens.map(renderTokenCard).join('')}
        </div>
      </section>
    `;
  };
  
  // Render all category sections in priority order
  container.innerHTML = `
    ${renderCategorySection('cryptoCat', categorizedTokens.cryptoCat)}
    ${renderCategorySection('conspiracy', categorizedTokens.conspiracy)}
    ${renderCategorySection('religious', categorizedTokens.religious)}
    ${renderCategorySection('general', categorizedTokens.general)}
    
    ${tokens.length > 0 ? `
      <footer style="margin-top: 60px; padding: 24px; background: rgba(255, 0, 110, 0.05); border-radius: 12px; border: 1px solid rgba(255, 0, 110, 0.2); text-align: center;">
        <p style="color: var(--text-primary); font-size: 1.1rem; font-weight: 600; margin-bottom: 12px;">
          Join the Community Early
        </p>
        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          We're building an honest community of early supporters. Get in early and make a real difference for yourself and help grow this project. Limited editions, exclusive airdrops, and community rewards are on the horizon.
        </p>
      </footer>
    ` : ''}
  `;
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
        
        // Show success feedback message (Crypto Cat purring!)
        const successMsg = document.getElementById('tokenSuccessMessage');
        if (successMsg) {
          successMsg.style.display = 'block';
          console.log('😸 *purr* Your token looks interesting. I\'ll review it when I feel like it, human.');
          // Auto-hide after 8 seconds
          setTimeout(() => {
            successMsg.style.display = 'none';
          }, 8000);
        }
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
  
  // Welcome message handled by initChat() function later
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
    // Use CoinGecko trending data as market news
    const response = await fetch(`https://api.coingecko.com/api/v3/search/trending`);
    const data = await response.json();
    
    if (data.coins) {
      // Transform trending coins into news format
      const newsItems = data.coins.map((coin, index) => ({
        id: coin.item.id,
        title: `${coin.item.name} (${coin.item.symbol}) - #${index + 1} Trending`,
        url: `https://www.coingecko.com/en/coins/${coin.item.id}`,
        published_at: new Date().toISOString(),
        source: { title: 'CoinGecko' },
        votes: { positive: coin.item.score || 10, negative: 0 },
        description: `Market Cap Rank: #${coin.item.market_cap_rank || 'N/A'} | 24h Price Change: ${coin.item.data?.price_change_percentage_24h?.usd?.toFixed(2) || 'N/A'}%`
      }));
      
      newsCache = { data: newsItems, timestamp: now };
      displayNews(newsItems, filter);
    } else {
      newsFeed.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">📰 News feed temporarily unavailable</p>';
    }
  } catch (error) {
    console.error('News fetch error:', error);
    newsFeed.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">⚠️ Unable to load news. Please try again later.</p>';
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

// ===== THEME SWITCHING FUNCTIONALITY =====
function initializeThemeSwitcher() {
  const themeButtons = document.querySelectorAll('.theme-btn');
  if (!themeButtons.length) return;
  
  // Load saved theme preference (default to jupiter)
  const savedTheme = localStorage.getItem('darkwave_active_theme') || 'jupiter';
  
  // Apply saved theme on load
  document.body.className = ''; // Clear all classes
  document.body.classList.add(`theme-${savedTheme}`);
  
  // Set active button
  themeButtons.forEach(btn => {
    if (btn.dataset.theme === savedTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Handle theme button clicks
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const newTheme = btn.dataset.theme;
      
      // Remove all theme classes
      document.body.className = '';
      document.body.classList.add(`theme-${newTheme}`);
      
      // Update active button
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Save preference
      localStorage.setItem('darkwave_active_theme', newTheme);
      
      // Show toast
      const themeNames = {
        jupiter: 'Electric Night',
        robinhood: 'Clean Green',
        coinbase: 'Pro Blue',
        sakura: 'Cherry Blossom',
        sunset: 'Pastel Dreams',
        ocean: 'Ocean Waves',
        cyberglitch: 'Cyber Glitch',
        neongrid: 'Neon Grid',
        galaxy: 'Galaxy'
      };
      
      showToast(`✨ ${themeNames[newTheme]} theme activated`);
      
      if (tg) tg.HapticFeedback?.impactOccurred('medium');
    });
  });
}

// Initialize theme switcher
initializeThemeSwitcher();

// ===== STAT EXPLANATION MODALS =====

function openStatModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function closeStatModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Make global for onclick handlers
window.openStatModal = openStatModal;
window.closeStatModal = closeStatModal;

// Make stat items clickable
function initializeStatClickers() {
  const stats = document.querySelectorAll('.cmc-stat-item');
  if (stats.length >= 4) {
    // Fear & Greed (first stat)
    stats[0].addEventListener('click', () => {
      openStatModal('fearGreedModal');
      console.log('😸 Want to learn about Fear & Greed? I'll explain it... if I feel like it.');
    });
    
    // Altcoin Season (second stat)
    stats[1].addEventListener('click', () => {
      openStatModal('altSeasonModal');
      console.log('😸 Altcoin season? More like alt-COIN-TOSS season. Let me explain.');
    });
    
    // Avg RSI (third stat - after logo)
    stats[2].addEventListener('click', () => {
      openStatModal('avgRsiModal');
      console.log('😸 RSI? Fancy way of saying "overbought" or "oversold." Here\'s the breakdown.');
    });
    
    // Market Cap (fourth stat)
    stats[3].addEventListener('click', () => {
      openStatModal('marketCapModal');
      console.log('😸 Market cap is just price × supply. Not rocket science, humans.');
    });
  }
}

// Close modals on background click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('stat-modal')) {
    closeStatModal(e.target.id);
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeStatClickers);
} else {
  initializeStatClickers();
}

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
  
  // Signal analysis commentary (30% random chance)
  'strong_buy': { quote: "Strong buy signal? Sure, until it dumps tomorrow. But hey, this one MIGHT work.", mood: "cautiously-optimistic", pose: "*shrugging with mild hope*" },
  'buy': { quote: "Buy signal detected. Don't say I didn't warn you when it goes sideways.", mood: "resigned", pose: "*sighing heavily*" },
  'hold': { quote: "HOLD means 'I have no idea what's happening either.' Classic.", mood: "confused", pose: "*scratching head*" },
  'sell': { quote: "Sell signal! Finally, some wisdom in this market. Take profits while you can.", mood: "wise", pose: "*nodding approvingly*" },
  'strong_sell': { quote: "STRONG SELL. Get out. Now. Before this becomes a tax write-off.", mood: "urgent", pose: "*waving arms frantically*" },
  
  // Holdings commentary
  'empty_watchlist': { quote: "No holdings? Smart move. Can't lose money if you don't invest. Big brain energy.", mood: "approving", pose: "*tapping temple wisely*" },
  'added_holding': { quote: "Added to watchlist! Now you can watch it dump in real-time. Progress!", mood: "sarcastic-cheerful", pose: "*fake enthusiasm*" },
  
  // Wallet tracking
  'wallet_connected': { quote: "Wallet connected! Time to see your losses in HD. Exciting times.", mood: "entertained", pose: "*munching popcorn*" },
  'low_balance': { quote: "That balance though... Have you considered a savings account instead?", mood: "concerned", pose: "*offering financial advice pamphlet*" },
  
  // Market movers (appears on volatile tokens 15% chance)
  'extreme_pump': { quote: "15%+ pump in 24h? Yeah, that's totally sustainable. Definitely not a trap.", mood: "dripping-sarcasm", pose: "*rolling eyes so hard they're stuck*" },
  'extreme_dump': { quote: "Ouch. That's gonna leave a mark. Want me to call someone?", mood: "sympathetic", pose: "*offering ice pack*" },
  
  // News commentary (5% chance)
  'bullish_news': { quote: "Bullish news? Let me guess: 'Major partnership' with a company nobody's heard of?", mood: "skeptical", pose: "*air quotes*" },
  'bearish_news': { quote: "Bearish news means discount prices! Or just the beginning of the end. Who knows?", mood: "philosophical", pose: "*contemplating universe*" },
  
  // Easter eggs
  'launch_countdown': { quote: "December 25th launch? Bold move launching on Christmas. I respect the audacity.", mood: "impressed", pose: "*slow nod of respect*" },
  'scanner_results': { quote: "Scanner found signals? Cute. I found the best hiding spots. Beat that.", mood: "competitive", pose: "*flexing*" },
  
  // Feature announcements with personality
  'launching_soon': { quote: "Oh look, another presale! This one's definitely not going to rug... probably.", mood: "skeptical", pose: "*rolling eyes hard*" },
  'whitelist': { quote: "Congrats! You're on the whitelist. Now you get to lose money first!", mood: "sarcastic-congratulations", pose: "*slow clapping*" },
  'premium': { quote: "Premium features unlocked! Time to make slightly more informed bad decisions.", mood: "helpful-ish", pose: "*thumbs up with attitude*" },
  'wallet_tracking': { quote: "Track your portfolio losses in real-time. Technological progress!", mood: "proud", pose: "*chest puffed out proudly*" },
  'market_overview': { quote: "Fresh data for your doom scrolling pleasure. You're welcome.", mood: "serving", pose: "*presenting data like a waiter*" },
  'price_alerts': { quote: "I'll notify you when things go south. Which is basically always.", mood: "resigned", pose: "*shrugging with phone*" },
  
  // Hide-and-Seek Random Popups (appears randomly throughout app)
  'hideseek_1': { quote: "Found you scrolling again! Don't you have charts to stare at?", mood: "playful", pose: "*peeking from behind corner*", hideSeek: "I've been watching you refresh that price 47 times..." },
  'hideseek_2': { quote: "Psst! I'm hiding in the code. Bet you can't find all my spots!", mood: "mischievous", pose: "*tail poking out*", hideSeek: "There are 7 hiding spots. Good luck!" },
  'hideseek_3': { quote: "Surprise! Miss me? Of course you did.", mood: "smug", pose: "*appearing dramatically*", hideSeek: "I saw you checking your losses again..." },
  'hideseek_4': { quote: "Still trading? Bold strategy. I'm just here for the chaos.", mood: "entertained", pose: "*munching popcorn*", hideSeek: "This is better than Netflix" },
  'hideseek_5': { quote: "Quick question: When moon? Asking for a friend.", mood: "sarcastic", pose: "*checking imaginary watch*", hideSeek: "Spoiler: Not today" },
  'hideseek_6': { quote: "I've analyzed your trading strategy. Conclusion: Coin flips might be more effective.", mood: "analytical", pose: "*reviewing clipboard*", hideSeek: "But hey, what do I know? I'm just a cat." },
  'hideseek_7': { quote: "Plot twist: I'M the whale manipulating your favorite token.", mood: "villainous", pose: "*evil laugh pose*", hideSeek: "Just kidding... or am I?" },
  'hideseek_8': { quote: "Taking a break from judging your trades to say hi!", mood: "friendly-ish", pose: "*waving paw*", hideSeek: "Back to judging now" },
  'hideseek_9': { quote: "Did someone say 'technical analysis'? I only do emotional analysis.", mood: "honest", pose: "*shrugging*", hideSeek: "Current emotion: entertained by your choices" },
  'hideseek_10': { quote: "Checking in! How's your portfolio doing? Never mind, I can see your face.", mood: "observant", pose: "*staring knowingly*", hideSeek: "The charts don't lie, but I might..." },
  'hideseek_11': { quote: "Random fact: 90% of day traders lose money. But you're different, right?", mood: "educational", pose: "*teacher pose*", hideSeek: "Right...?" },
  'hideseek_12': { quote: "I'm not saying you're obsessed, but you've checked the app 23 times today.", mood: "concerned", pose: "*counting on paws*", hideSeek: "24 now" },
};

// Crypto Cat Pose Image Mapping - Fixed paths
const CAT_POSE_IMAGES = {
  'sideeye': '/crypto-cat-poses/sideeye.png',
  'neutral': '/crypto-cat-poses/neutral.png',
  'arms-crossed': '/crypto-cat-poses/crossed.png',
  'thumbs-up': '/crypto-cat-poses/thumbsup.png',
  'pointing': '/crypto-cat-poses/pointing.png',
  'walking': '/crypto-cat-poses/walking.png',
  'fist-pump': '/crypto-cat-poses/fist.png',
  'angry': '/crypto-cat-poses/angry.png',
  'facepalm': '/crypto-cat-poses/facepalm.png',
  'default': '/crypto-cat-mascot.png'
};

// Map moods to specific pose images
function getCatPoseImage(mood) {
  const moodToPose = {
    'playful': 'fist-pump',
    'mischievous': 'sideeye',
    'smug': 'thumbs-up',
    'entertained': 'neutral',
    'sarcastic': 'sideeye',
    'analytical': 'neutral',
    'villainous': 'angry',
    'friendly-ish': 'thumbs-up',
    'honest': 'neutral',
    'observant': 'sideeye',
    'educational': 'pointing',
    'concerned': 'facepalm',
    'eye-roll': 'sideeye',
    'grumpy': 'arms-crossed',
    'annoyed': 'arms-crossed',
    'amused': 'neutral',
    'knowing': 'sideeye',
    'sympathetic-ish': 'neutral',
    'skeptical': 'sideeye',
    'judging': 'arms-crossed',
    'bitter': 'angry',
    'warning': 'pointing',
    'mocking': 'sideeye',
    'frustrated': 'facepalm',
    'unimpressed': 'sideeye',
    'wise': 'neutral',
    'experienced': 'neutral',
    'cynical': 'arms-crossed',
    'dismissive': 'sideeye',
    'bored': 'neutral',
    'cautiously-optimistic': 'thumbs-up',
    'resigned': 'facepalm',
    'confused': 'facepalm',
    'urgent': 'pointing',
    'approving': 'thumbs-up',
    'sarcastic-cheerful': 'thumbs-up',
    'dripping-sarcasm': 'sideeye',
    'sympathetic': 'neutral',
    'philosophical': 'neutral',
    'impressed': 'thumbs-up',
    'competitive': 'fist-pump',
    'helpful-ish': 'thumbs-up',
    'proud': 'fist-pump',
    'serving': 'walking'
  };
  
  const poseKey = moodToPose[mood] || 'neutral';
  return CAT_POSE_IMAGES[poseKey] || CAT_POSE_IMAGES.default;
}

// Random Hide-and-Seek Popup System
let hideSeekTimer = null;

function startHideAndSeek() {
  if (!state.cryptoCatEnabled) {
    if (hideSeekTimer) clearInterval(hideSeekTimer);
    return;
  }
  
  // Clear existing timer
  if (hideSeekTimer) clearInterval(hideSeekTimer);
  
  // Show random popup every 2-5 minutes
  const scheduleNextPopup = () => {
    const randomDelay = (Math.random() * 180000) + 120000; // 2-5 minutes in ms
    
    setTimeout(() => {
      if (state.cryptoCatEnabled) {
        showRandomHideSeekPopup();
        scheduleNextPopup(); // Schedule next one
      }
    }, randomDelay);
  };
  
  scheduleNextPopup();
}

function showRandomHideSeekPopup() {
  const hideSeekQuotes = [
    'hideseek_1', 'hideseek_2', 'hideseek_3', 'hideseek_4',
    'hideseek_5', 'hideseek_6', 'hideseek_7', 'hideseek_8',
    'hideseek_9', 'hideseek_10', 'hideseek_11', 'hideseek_12'
  ];
  
  const randomKey = hideSeekQuotes[Math.floor(Math.random() * hideSeekQuotes.length)];
  const catData = getCryptoCatQuote(randomKey);
  
  if (!catData) return;
  
  // Get the correct pose image based on mood
  const catImage = getCatPoseImage(catData.mood);
  
  // Create floating popup
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    max-width: 350px;
    background: linear-gradient(135deg, rgba(255, 0, 110, 0.95), rgba(168, 85, 247, 0.95));
    border: 2px solid var(--neon-pink);
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(255, 0, 110, 0.4);
    z-index: 10000;
    animation: slideInRight 0.5s ease-out, bounce 1s ease-in-out 0.5s 3;
    cursor: pointer;
  `;
  
  popup.innerHTML = `
    <div style="display: flex; gap: 12px; align-items: start;">
      <img src="${catImage}" alt="Crypto Cat ${catData.mood}" style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid white; flex-shrink: 0; animation: wiggle 0.5s ease-in-out infinite;">
      <div style="flex: 1;">
        <div style="font-size: 0.75rem; color: white; font-weight: 700; margin-bottom: 4px;">🐱 CRYPTO CAT FOUND YOU!</div>
        <div style="font-size: 0.8rem; color: #FFE5F0; font-style: italic; margin-bottom: 6px;">${catData.pose}</div>
        <div style="font-size: 0.9rem; color: white; line-height: 1.4; margin-bottom: 6px;">"${catData.quote}"</div>
        ${catData.hideSeek ? `<div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.7); font-style: italic;">💭 ${catData.hideSeek}</div>` : ''}
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1;">×</button>
    </div>
  `;
  
  popup.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') {
      popup.style.animation = 'slideOutRight 0.5s ease-in';
      setTimeout(() => popup.remove(), 500);
    }
  });
  
  document.body.appendChild(popup);
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (popup.parentElement) {
      popup.style.animation = 'slideOutRight 0.5s ease-in';
      setTimeout(() => popup.remove(), 500);
    }
  }, 8000);
  
  if (tg) tg.HapticFeedback?.impactOccurred('medium');
}

function initializeCryptoCat() {
  const cryptoCatToggle = document.getElementById('toggleCryptoCat');
  const settingsToggle = document.getElementById('toggleCryptoCatSettings');
  
  if (!cryptoCatToggle) return;
  
  // Update button visual state
  const updateCatButton = () => {
    cryptoCatToggle.setAttribute('data-active', state.cryptoCatEnabled.toString());
    cryptoCatToggle.title = state.cryptoCatEnabled ? 'Crypto Cat ON 😼' : 'Crypto Cat OFF 😿';
    
    // Sync settings toggle if it exists
    if (settingsToggle) {
      settingsToggle.checked = state.cryptoCatEnabled;
    }
  };
  updateCatButton();
  
  // Handle toggle button click
  cryptoCatToggle.addEventListener('click', () => {
    state.cryptoCatEnabled = !state.cryptoCatEnabled;
    localStorage.setItem('darkwave_crypto_cat', state.cryptoCatEnabled.toString());
    updateCatButton();
    
    if (state.cryptoCatEnabled) {
      showToast('🐱 Crypto Cat is back! Prepare for sarcasm.');
      startHideAndSeek(); // Start random popups
    } else {
      showToast('😿 Crypto Cat will miss you...');
      if (hideSeekTimer) clearInterval(hideSeekTimer); // Stop random popups
    }
    
    // Re-render glossary if we're on the learn tab
    if (state.currentTab === 'learn') {
      renderGlossary(document.getElementById('glossarySearch')?.value || '');
    }
    
    if (tg) tg.HapticFeedback?.impactOccurred('medium');
  });
  
  // Also listen to settings toggle
  if (settingsToggle) {
    settingsToggle.addEventListener('change', () => {
      state.cryptoCatEnabled = settingsToggle.checked;
      localStorage.setItem('darkwave_crypto_cat', state.cryptoCatEnabled.toString());
      updateCatButton();
    });
  }
}

// Initialize crypto cat
initializeCryptoCat();

// Start hide-and-seek if enabled
if (state.cryptoCatEnabled) {
  startHideAndSeek();
}

// Function to get Crypto Cat's commentary
function getCryptoCatQuote(term) {
  if (!state.cryptoCatEnabled) return null;
  const normalizedData = NORMALIZED_CAT_QUOTES[term];
  if (!normalizedData) return null;
  
  // Return the quote based on current mode (smartass or plain)
  return normalizedData[state.catMode] || normalizedData.smartass;
}

// Helper function to create a compact Crypto Cat appearance
function createCryptoCatAppearance(quoteKey, size = 'small') {
  if (!state.cryptoCatEnabled) return '';
  
  const catData = getCryptoCatQuote(quoteKey);
  if (!catData) return '';
  
  const catImage = getCatPoseImage(catData.mood);
  const imgSize = size === 'small' ? '30px' : size === 'medium' ? '50px' : '70px';
  const fontSize = size === 'small' ? '0.75rem' : size === 'medium' ? '0.85rem' : '0.95rem';
  
  return `
    <div style="display: flex; gap: 8px; align-items: center; margin: 10px 0; padding: 8px 12px; background: linear-gradient(135deg, rgba(255, 0, 110, 0.08), rgba(168, 85, 247, 0.08)); border-radius: 8px; border: 1px solid rgba(255, 0, 110, 0.25);">
      <img src="${catImage}" alt="Crypto Cat ${catData.mood}" style="width: ${imgSize}; height: ${imgSize}; border-radius: 50%; border: 2px solid var(--neon-pink); flex-shrink: 0;">
      <div style="flex: 1;">
        <div style="font-size: ${fontSize}; color: var(--text-primary); font-style: italic; line-height: 1.3; margin-bottom: 3px;">"${catData.quote}"</div>
        ${catData.hideSeek ? `<div style="font-size: calc(${fontSize} - 0.1rem); color: var(--text-secondary); opacity: 0.7; font-style: italic;">💭 ${catData.hideSeek}</div>` : ''}
      </div>
    </div>
  `;
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
  const catImage = catData ? getCatPoseImage(catData.mood) : CAT_POSE_IMAGES.default;
  
  return `
    <div style="padding: 12px;">
      <div style="display: flex; gap: 12px; align-items: start; margin-bottom: 12px;">
        <img src="${catImage}" alt="Crypto Cat ${catData ? catData.mood : ''}" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid var(--neon-green);">
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
  const catImage = catData ? getCatPoseImage(catData.mood) : CAT_POSE_IMAGES.default;
  
  showModal(`
    <div style="padding: 24px; text-align: center;">
      <img src="${catImage}" alt="Crypto Cat ${catData ? catData.mood : ''}" style="width: 100px; height: 100px; margin: 0 auto 16px; border-radius: 50%; border: 3px solid var(--neon-pink); animation: bounce 2s ease-in-out infinite;">
      <h3 style="margin-bottom: 12px; color: var(--neon-pink);">${title}</h3>
      <p style="color: var(--text-secondary); margin-bottom: 16px;">${message}</p>
      ${catData ? `
        <div style="background: linear-gradient(135deg, rgba(255, 0, 110, 0.1), rgba(168, 85, 247, 0.1)); border: 2px solid rgba(255, 0, 110, 0.3); padding: 16px; border-radius: 12px; margin-bottom: 20px;">
          <div style="font-size: 0.8rem; color: var(--neon-green); font-weight: 700; margin-bottom: 4px;">🐱 CRYPTO CAT'S HOT TAKE:</div>
          <div style="font-size: 0.8rem; color: var(--neon-pink); font-style: italic; margin-bottom: 8px;">${catData.pose}</div>
          <div style="font-size: 0.95rem; color: var(--text-primary); font-style: italic;">"${catData.quote}"</div>
        </div>
      ` : ''}
      <button onclick="closeModal()" style="padding: 12px 32px; background: linear-gradient(135deg, #FF006E, #FFFFFF); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
        Got it!
      </button>
    </div>
  `);
}

// CMC Stats Bar - Update live market data
async function updateCMCStatsBar() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/global');
    const data = await response.json();
    
    if (data.data) {
      const marketData = data.data;
      
      // Market Cap
      const totalMcap = (marketData.total_market_cap.usd / 1e12).toFixed(2);
      const mcapChange = marketData.market_cap_change_percentage_24h_usd.toFixed(2);
      document.getElementById('cmcTotalMarketCap').textContent = `$${totalMcap}T`;
      document.getElementById('cmcMarketCapChange').textContent = `${mcapChange > 0 ? '+' : ''}${mcapChange}%`;
      document.getElementById('cmcMarketCapChange').className = `cmc-stat-change ${mcapChange >= 0 ? 'positive' : 'negative'}`;
      
      // Fear & Greed (simplified - use 50 as neutral baseline)
      const fearGreed = Math.min(100, Math.max(0, Math.round(50 + mcapChange * 5)));
      document.getElementById('cmcFearGreed').textContent = fearGreed;
      const fgLabel = fearGreed < 25 ? 'Extreme Fear' : fearGreed < 45 ? 'Fear' : fearGreed < 55 ? 'Neutral' : fearGreed < 75 ? 'Greed' : 'Extreme Greed';
      document.querySelector('#cmcFearGreed').nextElementSibling.textContent = fgLabel;
      
      // Altcoin Season (BTC dominance inverse indicator)
      const btcDom = marketData.market_cap_percentage.btc;
      const altSeasonScore = Math.round((100 - btcDom) * 2);
      document.getElementById('cmcAltSeason').textContent = `${altSeasonScore}/100`;
      document.querySelector('#cmcAltSeason').nextElementSibling.textContent = altSeasonScore > 50 ? 'Altcoin' : 'Bitcoin';
    }
  } catch (error) {
    console.error('Failed to update CMC stats bar:', error);
  }
}

// Calculate Average RSI across top coins
async function updateAvgRSI() {
  try {
    const topCoins = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple'];
    let totalRSI = 0;
    let count = 0;
    
    for (const coinId of topCoins) {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=14`);
        const data = await response.json();
        
        if (data.prices) {
          const prices = data.prices.map(p => p[1]);
          const rsi = calculateRSI(prices, 14);
          if (!isNaN(rsi)) {
            totalRSI += rsi;
            count++;
          }
        }
      } catch (err) {
        console.warn(`Failed to get RSI for ${coinId}`);
      }
    }
    
    if (count > 0) {
      const avgRSI = (totalRSI / count).toFixed(1);
      document.getElementById('cmcAvgRSI').textContent = avgRSI;
      const rsiLabel = avgRSI < 30 ? 'Oversold' : avgRSI > 70 ? 'Overbought' : 'Neutral';
      document.querySelector('#cmcAvgRSI').nextElementSibling.textContent = rsiLabel;
    }
  } catch (error) {
    console.error('Failed to calculate avg RSI:', error);
  }
}

// Helper: Calculate RSI
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return NaN;
  
  let gains = 0, losses = 0;
  
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// ===== CHART DRAWING TOOLS =====
let chartDrawings = [];
let drawingMode = null; // 'trendline' | 'horizontal' | null
let drawingStart = null;

function enableTrendline() {
  drawingMode = 'trendline';
  showToast('📐 Click two points on the chart to draw a trendline');
  document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

function enableHorizontalLine() {
  drawingMode = 'horizontal';
  showToast('➖ Click on the chart to draw a horizontal line');
  document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

function clearDrawings() {
  chartDrawings = [];
  drawingMode = null;
  drawingStart = null;
  
  // Clear active state from all tool buttons
  document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
  
  // Reload the chart to remove drawings
  if (currentChartTicker) {
    loadChart(currentChartTicker);
  }
  
  showToast('🗑️ All drawings cleared');
}

// Chart click handler for drawing tools (this would be integrated with lightweight-charts events)
function handleChartClick(price, time) {
  if (!drawingMode) return;
  
  if (drawingMode === 'trendline') {
    if (!drawingStart) {
      drawingStart = { price, time };
      showToast('📐 Click second point to complete trendline');
    } else {
      chartDrawings.push({
        type: 'trendline',
        start: drawingStart,
        end: { price, time }
      });
      drawingStart = null;
      drawingMode = null;
      document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
      showToast('✅ Trendline added');
    }
  } else if (drawingMode === 'horizontal') {
    chartDrawings.push({
      type: 'horizontal',
      price: price
    });
    drawingMode = null;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    showToast('✅ Horizontal line added');
  }
}

// ===== AI CHAT FUNCTIONALITY =====
function initChat() {
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  
  // Show welcome message if chat is empty
  if (!chatMessages.innerHTML || chatMessages.children.length === 0) {
    addChatMessage('assistant', `😼 Meow! Crypto Cat here. I'm your grumpy trading guru with decades of market wisdom (in cat years, of course).

Ask me about:
• Technical analysis & indicators
• Trading strategies & risk management  
• Crypto, stocks, or NFT explanations
• Market trends & sentiment

No BS. No fluff. Just straight talk from a cat who's seen it all. Fire away! 🐾`);
  }
  
  // Wire up send button
  chatSendBtn.onclick = () => sendChatMessage();
  chatInput.onkeypress = (e) => {
    if (e.key === 'Enter') sendChatMessage();
  };
}

// ===== FLOATING CHAT WIDGET =====
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatDialogue = document.getElementById('chatDialogue');
const closeChatBtn = document.getElementById('closeChatBtn');
const floatingChatInput = document.getElementById('floatingChatInput');
const floatingChatSendBtn = document.getElementById('floatingChatSendBtn');
const floatingChatMessages = document.getElementById('floatingChatMessages');

// Toggle chat dialogue
if (chatToggleBtn) {
  chatToggleBtn.addEventListener('click', () => {
    const isHidden = chatDialogue.style.display === 'none';
    chatDialogue.style.display = isHidden ? 'flex' : 'none';
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  });
}

// Close chat dialogue
if (closeChatBtn) {
  closeChatBtn.addEventListener('click', () => {
    chatDialogue.style.display = 'none';
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  });
}

// Send floating chat message
if (floatingChatSendBtn) {
  floatingChatSendBtn.addEventListener('click', () => sendFloatingChatMessage());
}

if (floatingChatInput) {
  floatingChatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendFloatingChatMessage();
    }
  });
}

async function sendFloatingChatMessage() {
  const message = floatingChatInput.value.trim();
  
  if (!message) return;
  
  // Add user message to floating chat
  addFloatingChatMessage('user', message);
  floatingChatInput.value = '';
  
  // Show typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing-indicator';
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  floatingChatMessages.appendChild(typingDiv);
  floatingChatMessages.scrollTop = floatingChatMessages.scrollHeight;
  
  try {
    // Call the Mastra API for chat
    const response = await fetch('/api/agents/darkwave-v2/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        userId: getUserId()
      })
    });
    
    if (!response.ok) throw new Error('Chat API error');
    
    const data = await response.json();
    const botReply = data.text || 'Sorry, I encountered an error. Please try again.';
    
    // Remove typing indicator
    typingDiv.remove();
    
    // Add bot response
    addFloatingChatMessage('bot', botReply);
  } catch (error) {
    console.error('Floating chat error:', error);
    typingDiv.remove();
    addFloatingChatMessage('bot', '⚠️ Connection error. Please try again.');
  }
}

function addFloatingChatMessage(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${role}-message`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = content;
  
  messageDiv.appendChild(contentDiv);
  floatingChatMessages.appendChild(messageDiv);
  floatingChatMessages.scrollTop = floatingChatMessages.scrollHeight;
}

async function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();
  
  if (!message) return;
  
  // Add user message
  addChatMessage('user', message);
  chatInput.value = '';
  
  // Show typing indicator
  addChatMessage('typing', '');
  
  try {
    const response = await fetch('/api/agents/DarkWave-V2/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `[CHAT MODE - Respond as Crypto Cat: grumpy, sarcastic trading guru with personality] ${message}`
        }],
        userId: state.userId
      })
    });
    
    const data = await response.json();
    
    // Remove typing indicator
    const typingMsg = document.querySelector('.chat-message.typing');
    if (typingMsg) typingMsg.remove();
    
    // Add assistant response
    if (data.text) {
      addChatMessage('assistant', data.text);
    } else {
      addChatMessage('assistant', '😾 Hmm, my cat brain is buffering. Try again, human.');
    }
  } catch (error) {
    console.error('Chat error:', error);
    const typingMsg = document.querySelector('.chat-message.typing');
    if (typingMsg) typingMsg.remove();
    addChatMessage('assistant', '😿 Ugh, connection issues. Even cats have bad days. Try again?');
  }
}

function addChatMessage(role, content) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${role}`;
  
  if (role === 'typing') {
    messageDiv.innerHTML = `
      <div class="chat-bubble typing">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
  } else {
    const avatar = role === 'assistant' ? '😼' : '👤';
    messageDiv.innerHTML = `
      <div class="chat-avatar">${avatar}</div>
      <div class="chat-bubble ${role}">
        ${content.replace(/\n/g, '<br>')}
      </div>
    `;
  }
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== CRYPTO CAT POPUP SYSTEM =====
const CAT_MESSAGES = [
  "📉 Another day, another trader thinking they're the next Warren Buffett...",
  "🎯 Buy high, sell low - it's the human way, isn't it?",
  "💎 'Diamond hands' they said... while their portfolio bleeds red.",
  "🚀 'To the moon!' they scream, right before the rug pull.",
  "😹 Stop checking charts every 5 seconds. Touch grass.",
  "🎰 Leverage? Might as well go to Vegas, better buffets there.",
  "📊 Technical analysis: Where humans draw lines and call it science.",
  "🤡 'This time it's different' - famous last words.",
  "⚡ FOMO is the enemy of profit. Write that down.",
  "🎪 Welcome to the casino, where everyone's a genius in a bull market.",
  "💸 DCA stands for 'Don't Chase Anything' - probably.",
  "🔮 Trust me bro' is not a viable trading strategy.",
  "😼 If trading was easy, everyone would be rich. Spoiler: they're not.",
  "🌊 Altcoin season? More like 'lose your life savings' season.",
  "🎁 Diversify or cry later. Your choice, human.",
  "📱 Stop refreshing CoinMarketCap. It won't make your bags pump.",
  "🧠 Intelligence is knowing tomatoes are fruit. Wisdom is not YOLOing into shitcoins.",
  "⏰ Best time to buy was yesterday. Second best time? Not when I'm napping.",
  "🎭 Paper trading: Where everyone's a genius. Real trading: Where reality hits.",
  "🍕 Remember: Someone bought Bitcoin for pizza. Don't be that guy."
];

let catPopupTimeout = null;

function showCryptoCat(customMessage = null) {
  // Check if Crypto Cat is enabled
  if (!state.cryptoCatEnabled) return;
  
  const popup = document.getElementById('cryptoCatPopup');
  const messageEl = document.getElementById('catMessage');
  
  if (!popup || !messageEl) return;
  
  // Clear any existing timeout
  if (catPopupTimeout) {
    clearTimeout(catPopupTimeout);
  }
  
  // Set message (random or custom)
  const message = customMessage || CAT_MESSAGES[Math.floor(Math.random() * CAT_MESSAGES.length)];
  messageEl.textContent = message;
  
  // Show popup
  popup.classList.add('show');
  
  // Auto-hide after 8 seconds
  catPopupTimeout = setTimeout(() => {
    closeCryptoCat();
  }, 8000);
}

function closeCryptoCat() {
  const popup = document.getElementById('cryptoCatPopup');
  if (popup) {
    popup.classList.remove('show');
  }
  
  if (catPopupTimeout) {
    clearTimeout(catPopupTimeout);
    catPopupTimeout = null;
  }
}

// Show Crypto Cat randomly
function startRandomCatAppearances() {
  // Check if Crypto Cat is still enabled before scheduling
  if (!state.cryptoCatEnabled) return;
  
  // Random appearance every 45-90 seconds
  const randomDelay = 45000 + Math.random() * 45000;
  
  setTimeout(() => {
    if (state.cryptoCatEnabled) {
      showCryptoCat();
      startRandomCatAppearances(); // Schedule next appearance
    }
  }, randomDelay);
}

// Start random appearances after 30 seconds (only if enabled)
setTimeout(() => {
  if (state.cryptoCatEnabled) {
    startRandomCatAppearances();
  }
}, 30000);

// ===== POPULATE NEWSPAPER BOXES WITH LIVE DATA =====
let marketDataCache = {
  trending: null,
  global: null,
  timestamp: 0
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchMarketData() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (marketDataCache.timestamp && (now - marketDataCache.timestamp < CACHE_TTL)) {
    console.log('📦 Using cached market data');
    return marketDataCache;
  }
  
  try {
    console.log('🌐 Fetching fresh market data...');
    
    // Fetch multiple data sources in parallel
    const [trendingResponse, globalResponse] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/search/trending'),
      fetch('https://api.coingecko.com/api/v3/global')
    ]);
    
    const trendingData = await trendingResponse.json();
    const globalData = await globalResponse.json();
    
    // Update cache
    marketDataCache = {
      trending: trendingData,
      global: globalData,
      timestamp: now
    };
    
    console.log('✅ Market data fetched and cached');
    return marketDataCache;
  } catch (error) {
    console.error('❌ Error fetching market data:', error);
    // Return cached data even if expired, or null
    return marketDataCache.trending ? marketDataCache : null;
  }
}

async function populateAllNewspaperBoxes() {
  const data = await fetchMarketData();
  if (!data) {
    console.warn('No market data available, using fallback');
    populateNewspaperBoxesStatic();
    return;
  }
  
  const { trending, global } = data;
  
  //  Populate Hot Right Now
  const hotNow = document.getElementById('hotNow');
  if (hotNow && trending?.coins) {
    const top3 = trending.coins.slice(0, 3).map(c => c.item.symbol).join(', ');
    hotNow.innerHTML = `🔥 <strong>Trending Now:</strong> ${top3}<br>📈 <strong>Most Searched:</strong> ${trending.coins[0]?.item.name || 'Bitcoin'}<br>💡 <strong>Market Cap Rank:</strong> #${trending.coins[0]?.item.market_cap_rank || '1'}`;
  }
    
  // Populate Whale Alert - use global BTC dominance data
  const whaleAlert = document.getElementById('whaleAlert');
  if (whaleAlert && global?.data) {
    const btcDom = global.data.market_cap_percentage?.btc?.toFixed(1) || '56.2';
    const ethDom = global.data.market_cap_percentage?.eth?.toFixed(1) || '13.5';
    whaleAlert.innerHTML = `<strong>BTC Dominance:</strong> ${btcDom}%<br><strong>ETH Dominance:</strong> ${ethDom}%<br><strong>Total Volume 24h:</strong> $${(global.data.total_volume?.usd / 1e9).toFixed(1)}B`;
  }
    
  // Populate Market Pulse with global data
  const marketPulse = document.getElementById('marketPulse');
  if (marketPulse && global?.data) {
    const fgValue = document.getElementById('cmcFearGreed')?.textContent || '50';
    const fgNum = parseInt(fgValue);
    const fgText = fgNum < 25 ? 'Extreme Fear' : fgNum < 45 ? 'Fear' : fgNum < 55 ? 'Neutral' : fgNum < 75 ? 'Greed' : 'Extreme Greed';
    const marketCap = `$${(global.data.total_market_cap?.usd / 1e12).toFixed(2)}T`;
    const btcDom = global.data.market_cap_percentage?.btc?.toFixed(1) || '56.2';
    marketPulse.innerHTML = `<strong>${fgText}:</strong> Index at ${fgValue}/100<br><strong>Total Market Cap:</strong> ${marketCap}<br><strong>BTC Dominance:</strong> ${btcDom}%`;
  }
    
  // Populate Flash Updates with real data
  const flashUpdates = document.getElementById('flashUpdates');
  if (flashUpdates && global?.data) {
    const btcDom = global.data.market_cap_percentage?.btc?.toFixed(1) || '56.2';
    const activeCoins = global.data.active_cryptocurrencies?.toLocaleString() || '13,000';
    const markets = global.data.markets || 'N/A';
    flashUpdates.innerHTML = `<strong>BTC Dominance:</strong> ${btcDom}%<br><strong>Active Coins:</strong> ${activeCoins}<br><strong>Markets:</strong> ${markets}`;
  }
    
  // Populate Support/Resistance - using trending data  
  const srLevels = document.getElementById('srLevels');
  if (srLevels && trending?.coins) {
    const top3 = trending.coins.slice(0, 3);
    srLevels.innerHTML = top3.map(c => {
      const symbol = c.item.symbol;
      const price = c.item.data?.price || 'N/A';
      return `<strong>${symbol}:</strong> $${price} - Trending #${c.item.market_cap_rank || 'N/A'}`;
    }).join('<br>');
  }
    
  // Populate Holdings Portfolio Stats
  const portfolioStats = document.getElementById('portfolioStats');
  if (portfolioStats) {
    const holdings = state.holdings || [];
    const totalValue = holdings.reduce((sum, h) => sum + (h.value || 0), 0);
    portfolioStats.innerHTML = `<strong>Total Tracked:</strong> ${holdings.length} assets<br><strong>Total Value:</strong> $${totalValue.toFixed(2)}<br><strong>Alerts Set:</strong> 0`;
  }
    
  // Populate Top Picks
  const topPicks = document.getElementById('topPicks');
  if (topPicks && trending?.coins) {
    const picks = trending.coins.slice(0, 3);
    topPicks.innerHTML = picks.map(p => {
      const symbol = p.item.symbol;
      const rank = p.item.market_cap_rank;
      return `<strong>${symbol}:</strong> Rank #${rank} - Trending`;
    }).join('<br>');
  }
    
  // Populate Breaking News
  const breakingNews = document.getElementById('breakingNews');
  if (breakingNews && trending?.coins) {
    const topCoin = trending.coins[0].item;
    breakingNews.innerHTML = `<strong>${topCoin.name} (${topCoin.symbol})</strong> hits #1 trending<br><strong>Market Cap Rank:</strong> #${topCoin.market_cap_rank || 'N/A'}<br><strong>Search Volume:</strong> Surging 📈`;
  }
    
  // Populate Sentiment Box
  const sentimentBox = document.getElementById('sentimentBox');
  if (sentimentBox) {
    const fgValue = parseInt(document.getElementById('cmcFearGreed')?.textContent || '50');
    const sentiment = fgValue < 40 ? '🔴 Bearish' : fgValue > 60 ? '🟢 Bullish' : '🟡 Neutral';
    sentimentBox.innerHTML = `<strong>Overall Mood:</strong> ${sentiment}<br><strong>Fear & Greed:</strong> ${fgValue}/100<br><strong>Market State:</strong> ${fgValue < 40 ? 'Fearful' : fgValue > 60 ? 'Greedy' : 'Balanced'}`;
  }
    
  // Update Headlines
  const headlines = document.getElementById('headlines');
  if (headlines && trending?.coins) {
    const coin1 = trending.coins[0]?.item.name;
    const coin2 = trending.coins[1]?.item.name;
    headlines.innerHTML = `<strong>Top Trending:</strong> ${coin1}, ${coin2}<br><strong>Market Activity:</strong> High search volume<br><strong>Latest:</strong> Check News feed below`;
  }
    
  console.log('✅ All newspaper boxes updated with live data');
}

function populateNewspaperBoxesStatic() {
  // Fallback static content
  const whaleAlert = document.getElementById('whaleAlert');
  if (whaleAlert) {
    whaleAlert.innerHTML = '<strong>BTC:</strong> $124M moved to cold storage<br><strong>ETH:</strong> Whale accumulated 15,000 ETH<br><strong>SOL:</strong> Major exchange outflow detected';
  }
  
  const hotNow = document.getElementById('hotNow');
  if (hotNow) {
    hotNow.innerHTML = '🔥 <strong>Trending:</strong> AI agents, Solana memes, Base ecosystem<br>📈 <strong>Volume Leaders:</strong> BTC, ETH, SOL<br>💡 <strong>New Listings:</strong> Check Projects tab';
  }
}

// Initialize newspaper boxes with live data
setTimeout(populateAllNewspaperBoxes, 2000);

// Refresh every 5 minutes
setInterval(populateAllNewspaperBoxes, 5 * 60 * 1000);

// ===== UNIVERSAL WEB3 SEARCH FUNCTIONALITY =====
const universalSearchInput = document.getElementById('universalSearchInput');
const universalSearchBtn = document.getElementById('universalSearchBtn');

async function performUniversalSearch() {
  const query = universalSearchInput.value.trim();
  if (!query) {
    showNotification('Please enter a token, stock, NFT, or contract address', 'warning');
    return;
  }

  console.log('🔍 Universal search query:', query);
  showNotification(`Analyzing ${query}...`, 'info');
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Analyze ${query}. Provide comprehensive technical analysis.`,
        userId: state.userId
      })
    });

    if (!response.ok) throw new Error('Search failed');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullResponse += data.content;
            }
          } catch (e) {}
        }
      }
    }

    // Show results in Analysis tab
    switchTab('analysis');
    const analysisContent = document.getElementById('analysisContent');
    if (analysisContent) {
      analysisContent.innerHTML = `
        <div class="analysis-result" style="padding: 20px; background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1)); border: 2px solid rgba(37, 99, 235, 0.3); border-radius: 12px; margin: 16px 0;">
          <h3 style="color: #FFD700; margin-bottom: 12px;">📊 Analysis: ${query}</h3>
          <div style="color: var(--text-primary); line-height: 1.8; white-space: pre-wrap;">${fullResponse}</div>
        </div>
      `;
    }

    showNotification(`Analysis complete for ${query}`, 'success');
    universalSearchInput.value = '';
  } catch (error) {
    console.error('Search error:', error);
    showNotification('Search failed. Please try again.', 'error');
  }
}

universalSearchBtn.addEventListener('click', performUniversalSearch);
universalSearchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performUniversalSearch();
});

// Legacy crypto cat toggle code removed - now handled by toggleCryptoCatImage()

// ===== AI-POWERED DAILY PLAYBOOK WIDGET =====
async function generateDailyPlaybook() {
  const outlookEl = document.getElementById('playbookOutlook');
  const levelsEl = document.getElementById('playbookLevels');
  const focusEl = document.getElementById('playbookFocus');
  const catEl = document.getElementById('playbookCat');
  const refreshBtn = document.getElementById('refreshPlaybookBtn');
  
  if (!outlookEl || !levelsEl || !focusEl || !catEl) return;
  
  try {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '⏳ Generating...';
    
    outlookEl.textContent = 'Analyzing market conditions...';
    levelsEl.textContent = 'Calculating key levels...';
    focusEl.textContent = 'Identifying opportunities...';
    catEl.textContent = '"Hold on, I\'m thinking..." - Crypto Cat';
    
    const response = await fetch('/api/agents/DarkWave-V2/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: 'Generate a concise daily market playbook with: 1) Market Outlook (one sentence on BTC/crypto trends), 2) Key Levels (BTC and ETH support/resistance), 3) Today\'s Focus (one actionable trading tip), 4) Cat\'s Wisdom (one sarcastic but wise trading quote from Crypto Cat). Keep each section under 100 characters.'
        }],
        userId: state.userId
      })
    });
    
    const data = await response.json();
    const playbookText = data.text || data.message || 'Unable to generate playbook at this time.';
    
    const sections = playbookText.split('\n').filter(l => l.trim());
    
    outlookEl.textContent = sections[0] || 'Bullish momentum building across major cryptocurrencies';
    levelsEl.textContent = sections[1] || 'BTC $98k support | ETH $3,500 resistance';
    focusEl.textContent = sections[2] || 'Watch for breakout above key resistance levels';
    catEl.textContent = sections[3] || '"Markets go up, markets go down. Cats don\'t care." - Crypto Cat';
    
    refreshBtn.disabled = false;
    refreshBtn.textContent = '🔄 Refresh';
    showNotification('✅ Daily Playbook updated with fresh AI insights!', 'success');
    
  } catch (error) {
    console.error('Playbook generation error:', error);
    outlookEl.textContent = 'Bullish momentum on BTC, consolidation on altcoins';
    levelsEl.textContent = 'BTC $98k support, ETH $3,500 resistance';
    focusEl.textContent = 'Watch Fear & Greed Index for sentiment shifts';
    catEl.textContent = '"Don\'t fight the trend, ride it like a lazy cat on a Roomba." - Crypto Cat';
    
    refreshBtn.disabled = false;
    refreshBtn.textContent = '🔄 Refresh';
    showNotification('⚠️ Using cached playbook - AI temporarily unavailable', 'warning');
  }
}

document.getElementById('refreshPlaybookBtn')?.addEventListener('click', generateDailyPlaybook);

// Auto-generate playbook on page load
setTimeout(generateDailyPlaybook, 3000);

// ===== SENTIMENT TRACKER WIDGET (Using CoinGecko Free API) =====
async function updateSentimentTracker() {
  const socialEl = document.getElementById('socialSentiment');
  const newsEl = document.getElementById('newsSentiment');
  const trendEl = document.getElementById('trendSentiment');
  
  if (!socialEl || !newsEl || !trendEl) return;
  
  try {
    // Use CoinGecko's free global crypto data endpoint
    const response = await fetch('https://api.coingecko.com/api/v3/global');
    const data = await response.json();
    
    if (data && data.data) {
      const marketCapChangePercent = data.data.market_cap_change_percentage_24h_usd || 0;
      
      // Derive sentiment from market cap change and volume
      const socialScore = Math.min(95, Math.max(5, 50 + (marketCapChangePercent * 5)));
      const newsScore = Math.min(90, Math.max(10, 50 + (marketCapChangePercent * 4)));
      
      const socialSentiment = socialScore > 65 ? 'Bullish' : socialScore > 45 ? 'Neutral' : 'Bearish';
      const newsSentiment = newsScore > 60 ? 'Positive' : newsScore > 40 ? 'Neutral' : 'Negative';
      const trend = marketCapChangePercent > 1 ? '↗️ Bullish' : marketCapChangePercent > -1 ? '→ Neutral' : '↘️ Bearish';
      
      socialEl.textContent = `${socialSentiment} ${Math.round(socialScore)}%`;
      socialEl.style.color = socialScore > 65 ? '#00ff88' : socialScore > 45 ? '#FFD700' : '#ff6b6b';
      
      newsEl.textContent = `${newsSentiment} ${Math.round(newsScore)}%`;
      newsEl.style.color = newsScore > 60 ? '#00ff88' : newsScore > 40 ? '#FFD700' : '#ff6b6b';
      
      trendEl.textContent = trend;
      trendEl.style.color = trend.includes('Bullish') ? '#00ff88' : trend.includes('Neutral') ? '#FFD700' : '#ff6b6b';
    }
  } catch (error) {
    console.error('Sentiment update error:', error);
    // Fallback to reasonable defaults
    socialEl.textContent = 'Neutral 52%';
    newsEl.textContent = 'Neutral 48%';
    trendEl.textContent = '→ Neutral';
  }
}

// ===== MARKET PULSE VISUAL INDICATOR =====
async function updateMarketPulse() {
  const strengthBar = document.getElementById('marketStrength');
  const strengthText = document.getElementById('marketStrengthText');
  const pulseText = document.getElementById('marketPulseText');
  
  if (!strengthBar || !strengthText || !pulseText) return;
  
  try {
    // Calculate market strength from Fear & Greed and other indicators
    const fearGreed = parseInt(document.getElementById('cmcFearGreed')?.textContent) || 50;
    const strength = Math.min(95, Math.max(10, fearGreed + (Math.random() * 20 - 10)));
    
    strengthBar.style.width = `${strength}%`;
    strengthText.textContent = `${Math.round(strength)}%`;
    
    // Color code based on strength
    if (strength > 70) {
      strengthBar.style.background = 'linear-gradient(90deg, #00ff88, #00dd70)';
      strengthText.style.color = '#00ff88';
      pulseText.textContent = '🚀 Strong bullish momentum detected';
    } else if (strength > 50) {
      strengthBar.style.background = 'linear-gradient(90deg, #60A5FA, #3b82f6)';
      strengthText.style.color = '#60A5FA';
      pulseText.textContent = '📊 Moderate bullish trend in progress';
    } else if (strength > 30) {
      strengthBar.style.background = 'linear-gradient(90deg, #FFD700, #FFA500)';
      strengthText.style.color = '#FFD700';
      pulseText.textContent = '⚖️ Neutral market conditions';
    } else {
      strengthBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff4444)';
      strengthText.style.color = '#ff6b6b';
      pulseText.textContent = '⚠️ Bearish pressure detected';
    }
    
  } catch (error) {
    console.error('Market pulse update error:', error);
  }
}

// Initialize widgets
setTimeout(() => {
  updateSentimentTracker();
  updateMarketPulse();
}, 4000);

// Refresh every 2 minutes
setInterval(() => {
  updateSentimentTracker();
  updateMarketPulse();
}, 120000);


// ===== DETAILED ANALYSIS MODAL =====
function openDetailedAnalysis() {
  const modal = document.getElementById('detailedAnalysisModal');
  const titleEl = document.getElementById('detailedAnalysisTicker');
  const contentEl = document.getElementById('detailedAnalysisContent');
  const catCommentEl = document.getElementById('detailedAnalysisCatComment');
  
  const data = window.currentAnalysisData;
  if (!data) {
    showToast('No analysis data available');
    return;
  }
  
  titleEl.textContent = `${data.ticker} - Full Analysis`;
  
  // Build detailed analysis content
  const signal = data.recommendation || 'HOLD';
  const signalClass = signal.includes('BUY') ? 'buy' : signal.includes('SELL') ? 'sell' : 'hold';
  const signalColor = signal.includes('BUY') ? '#00FF88' : signal.includes('SELL') ? '#FF4444' : '#FFD700';
  
  let analysisHTML = `
    <div style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(147, 51, 234, 0.1)); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid ${signalColor}40;">
      <h3 style="margin: 0 0 12px 0; color: ${signalColor}; font-size: 1.5rem; display: flex; align-items: center; gap: 12px;">
        ${signal.includes('BUY') ? '🟢' : signal.includes('SELL') ? '🔴' : '🟡'}
        ${signal}
      </h3>
      <p style="margin: 0; font-size: 0.95rem; color: var(--text-secondary);">
        Current Price: <strong style="color: var(--text-primary);">$${data.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</strong>
      </p>
      <p style="margin: 8px 0 0 0; font-size: 0.95rem; color: var(--text-secondary);">
        24h Change: <strong style="color: ${data.priceChange >= 0 ? '#00FF88' : '#FF4444'};">${data.priceChange >= 0 ? '+' : ''}${data.priceChange?.toFixed(2)}%</strong>
      </p>
    </div>
  `;
  
  // Technical Indicators
  if (data.technicalIndicators) {
    analysisHTML += `
      <h3 style="margin: 24px 0 12px 0; color: var(--primary); font-size: 1.1rem;">📈 Technical Indicators</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
    `;
    
    const indicators = data.technicalIndicators;
    if (indicators.rsi !== undefined) {
      const rsiColor = indicators.rsi > 70 ? '#FF4444' : indicators.rsi < 30 ? '#00FF88' : '#FFD700';
      analysisHTML += `
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border-left: 4px solid ${rsiColor};">
          <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 4px;">RSI (14)</div>
          <div style="font-size: 1.2rem; font-weight: 600; color: ${rsiColor};">${indicators.rsi.toFixed(2)}</div>
          <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 4px;">
            ${indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
          </div>
        </div>
      `;
    }
    
    if (indicators.macd !== undefined) {
      analysisHTML += `
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border-left: 4px solid var(--primary);">
          <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 4px;">MACD</div>
          <div style="font-size: 1.2rem; font-weight: 600; color: var(--text-primary);">${indicators.macd.toFixed(4)}</div>
        </div>
      `;
    }
    
    if (indicators.ema20 !== undefined) {
      analysisHTML += `
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border-left: 4px solid #00FF88;">
          <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 4px;">EMA (20)</div>
          <div style="font-size: 1.2rem; font-weight: 600; color: #00FF88;">$${indicators.ema20.toFixed(2)}</div>
        </div>
      `;
    }
    
    if (indicators.volume !== undefined) {
      analysisHTML += `
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border-left: 4px solid #8B5CF6;">
          <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 4px;">24h Volume</div>
          <div style="font-size: 1.2rem; font-weight: 600; color: #8B5CF6;">$${formatVolume(indicators.volume)}</div>
        </div>
      `;
    }
    
    analysisHTML += `</div>`;
  }
  
  // Reasoning/Analysis
  if (data.reasoning) {
    analysisHTML += `
      <h3 style="margin: 24px 0 12px 0; color: var(--primary); font-size: 1.1rem;">🧠 Analysis Reasoning</h3>
      <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-bottom: 20px; line-height: 1.6;">
        ${data.reasoning}
      </div>
    `;
  }
  
  contentEl.innerHTML = analysisHTML;
  
  // Crypto Cat comment based on recommendation and mode
  const catCommentsSmartass = {
    'BUY': `"Alright, ${data.ticker} is looking decent. But don't come crying to me when it dumps tomorrow. I told you what to do." - Crypto Cat`,
    'STRONG BUY': `"Yeah, ${data.ticker} looks good. Go ahead and FOMO in. Just remember: I was right, and you'll probably still mess it up somehow." - Crypto Cat`,
    'SELL': `"Time to dump ${data.ticker} before you lose your shirt. But hey, you probably won't listen anyway. You never do." - Crypto Cat`,
    'STRONG SELL': `"Get out of ${data.ticker} NOW. Seriously. Even I wouldn't touch this garbage with a ten-foot pole. But you'll probably hold anyway." - Crypto Cat`,
    'HOLD': `"Just HODL ${data.ticker} and stop checking the charts every 5 minutes. You're stressing me out more than yourself." - Crypto Cat`
  };
  
  const catCommentsPlain = {
    'BUY': `"${data.ticker} shows bullish indicators. Technical analysis supports a buy position at current levels." - Crypto Cat`,
    'STRONG BUY': `"${data.ticker} demonstrates strong buy signals across multiple indicators. High confidence recommendation." - Crypto Cat`,
    'SELL': `"${data.ticker} technical indicators suggest taking profits. Consider reducing exposure at current levels." - Crypto Cat`,
    'STRONG SELL': `"${data.ticker} shows multiple sell signals. Strong recommendation to exit position." - Crypto Cat`,
    'HOLD': `"${data.ticker} signals suggest maintaining current position. Monitor for trend changes." - Crypto Cat`
  };
  
  const catComments = state.catMode === 'smartass' ? catCommentsSmartass : catCommentsPlain;
  catCommentEl.textContent = catComments[signal] || `"Analysis complete for ${data.ticker}." - Crypto Cat`;
  
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  if (tg) {
    tg.HapticFeedback?.impactOccurred('medium');
  }
}

function closeDetailedAnalysis() {
  const modal = document.getElementById('detailedAnalysisModal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
  
  if (tg) {
    tg.HapticFeedback?.impactOccurred('light');
  }
}

// ===== CATEGORY NAVIGATION =====
let currentCategory = 'trending';

function selectCategory(category) {
  currentCategory = category;
  
  // Update button states
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-category="${category}"]`).classList.add('active');
  
  // Show toast with category name
  const categoryNames = {
    'trending': '🔥 Trending Tokens',
    'dex': '💱 DEX Pairs',
    'defi': '🏦 DeFi Tokens',
    'meme': '🐕 Meme Coins',
    'bluechip': '💎 Blue Chip Tokens'
  };
  
  showToast(`Loading ${categoryNames[category]}...`);
  
  // Trigger haptic feedback on Telegram
  if (tg) {
    tg.HapticFeedback?.impactOccurred('light');
  }
  
  console.log(`Selected category: ${category}`);
  
  // Load category-specific trending data
  loadCategoryData(category);
}

async function loadCategoryData(category) {
  console.log(`📊 Loading data for category: ${category}`);
  
  const container = document.getElementById('analysisResult');
  if (!container) return;
  
  // Show loading state
  container.innerHTML = `
    <div style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
      <div style="font-size: 2rem; margin-bottom: 12px;">📊</div>
      <div>Loading ${category} tokens...</div>
    </div>
  `;
  
  try {
    // Category-specific token lists
    const categoryTokens = {
      'trending': ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC'],
      'dex': ['UNI', 'SUSHI', 'CAKE', 'JOE', 'DYDX'],
      'defi': ['AAVE', 'MKR', 'COMP', 'CRV', 'YFI'],
      'meme': ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK'],
      'bluechip': ['BTC', 'ETH', 'BNB', 'XRP', 'ADA']
    };
    
    const tokens = categoryTokens[category] || categoryTokens['trending'];
    
    // Build category view with token cards
    let html = `
      <div style="margin: 20px 0;">
        <h3 style="color: var(--primary); font-size: 1.2rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          ${category === 'trending' ? '🔥' : category === 'dex' ? '💱' : category === 'defi' ? '🏦' : category === 'meme' ? '🐕' : '💎'}
          ${category.charAt(0).toUpperCase() + category.slice(1)} Tokens
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;">
    `;
    
    for (const token of tokens) {
      html += `
        <div class="category-token-card" onclick="searchToken('${token}')" style="
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          <div style="font-size: 1.5rem; text-align: center; margin-bottom: 8px;">
            ${token === 'BTC' ? '₿' : token === 'ETH' ? '⟠' : token === 'SOL' ? '◎' : '🪙'}
          </div>
          <div style="font-weight: 600; color: var(--text-primary); text-align: center; font-size: 1rem;">
            ${token}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-align: center; margin-top: 4px;">
            Tap to Analyze
          </div>
        </div>
      `;
    }
    
    html += `
        </div>
        <div style="margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px; text-align: center; color: var(--text-secondary);">
          💡 Click any token to analyze, or use the search bar above
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    console.log(`✅ Loaded ${tokens.length} tokens for ${category} category`);
    
  } catch (error) {
    console.error('Category data loading error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
        <div style="font-size: 2rem; margin-bottom: 12px;">⚠️</div>
        <div>Failed to load category data</div>
      </div>
    `;
  }
}

// Helper function to search a token from category view
function searchToken(ticker) {
  const searchInput = document.getElementById('universalSearchInput');
  if (searchInput) {
    searchInput.value = ticker;
    performUniversalSearch();
  }
}

// Initialize with default category on page load
setTimeout(() => {
  loadCategoryData('trending');
  console.log('📊 Category navigation initialized with Trending');
}, 2000);
// Plain mode commentary - helpful and professional
const CRYPTO_CAT_PLAIN_OVERRIDES = {
  // Glossary terms - helpful explanations
  'ATH': { quote: "All-Time High - The highest price level this asset has ever reached. A key reference point for investors.", mood: "helpful" },
  'DYOR': { quote: "Do Your Own Research - Always verify information and understand investments before committing capital.", mood: "helpful" },
  'FOMO': { quote: "Fear Of Missing Out - An emotional response that can lead to impulsive investment decisions.", mood: "helpful" },
  'FUD': { quote: "Fear, Uncertainty, and Doubt - Negative information (sometimes intentional) that can affect market sentiment.", mood: "helpful" },
  'HODL': { quote: "Hold On for Dear Life - A long-term investment strategy despite short-term volatility.", mood: "helpful" },
  'Whale': { quote: "An investor holding large amounts of cryptocurrency capable of influencing market movements.", mood: "helpful" },
  'Bag Holder': { quote: "Someone holding an asset that has decreased significantly in value.", mood: "helpful" },
  'Diamond Hands': { quote: "Investors who maintain positions through volatility, showing strong conviction.", mood: "helpful" },
  'Paper Hands': { quote: "Investors who sell quickly during downturns, prioritizing capital preservation.", mood: "helpful" },
  'Rug Pull': { quote: "A scam where developers abandon a project and take investor funds. Always verify project legitimacy.", mood: "warning" },
  'Pump and Dump': { quote: "Market manipulation where price is artificially inflated then sold off. Stay vigilant.", mood: "warning" },
  'To the Moon': { quote: "A phrase expressing optimism about significant price increases.", mood: "helpful" },
  'Gas Fees': { quote: "Transaction costs on blockchain networks, particularly Ethereum. Consider timing and network congestion.", mood: "helpful" },
  'Airdrop': { quote: "Free token distribution, often for marketing or rewarding early supporters.", mood: "helpful" },
  'Staking': { quote: "Locking cryptocurrency to support network operations and earn rewards.", mood: "helpful" },
  'DEX': { quote: "Decentralized Exchange - Trade directly from your wallet without intermediaries.", mood: "helpful" },
  'Smart Contract': { quote: "Self-executing code on the blockchain that automates transactions.", mood: "helpful" },
  'Tokenomics': { quote: "The economic model governing a token's supply, distribution, and utility.", mood: "helpful" },
  'Utility': { quote: "The practical use cases and value proposition of a cryptocurrency.", mood: "helpful" },
  'Whitepaper': { quote: "Technical document explaining a project's vision, technology, and roadmap.", mood: "helpful" },
  
  // Signal analysis
  'strong_buy': { quote: "Strong buy signal detected. Multiple indicators suggest bullish momentum.", mood: "helpful" },
  'buy': { quote: "Buy signal identified. Technical indicators show positive potential.", mood: "helpful" },
  'hold': { quote: "Hold recommended. Current conditions suggest maintaining position.", mood: "helpful" },
  'sell': { quote: "Sell signal detected. Consider taking profits or reducing exposure.", mood: "helpful" },
  'strong_sell': { quote: "Strong sell signal. Multiple indicators suggest downside risk.", mood: "warning" },
  
  // Holdings
  'empty_watchlist': { quote: "Your watchlist is empty. Search for tokens to start tracking.", mood: "helpful" },
  'added_holding': { quote: "Token added to watchlist. You can now track its performance.", mood: "helpful" },
  
  // Wallet tracking
  'wallet_connected': { quote: "Wallet connected successfully. Your holdings are now tracked.", mood: "helpful" },
  'low_balance': { quote: "Low balance detected. Consider your investment allocation carefully.", mood: "helpful" },
  
  // Market movers
  'extreme_pump': { quote: "Significant 15%+ increase in 24 hours. Monitor for profit-taking opportunities.", mood: "helpful" },
  'extreme_dump': { quote: "Sharp price decline detected. Review your risk management strategy.", mood: "helpful" },
  
  // News commentary
  'bullish_news': { quote: "Positive news identified. Verify sources and consider market impact.", mood: "helpful" },
  'bearish_news': { quote: "Negative news detected. Stay informed and assess your positions.", mood: "helpful" },
  
  // Features
  'launch_countdown': { quote: "Token launch scheduled for December 25th. Mark your calendar.", mood: "helpful" },
  'scanner_results': { quote: "Scanner analysis complete. Review signals for trading opportunities.", mood: "helpful" },
  'launching_soon': { quote: "New token launching soon. Research thoroughly before participating.", mood: "helpful" },
  'whitelist': { quote: "Whitelist access granted. You have priority access to this opportunity.", mood: "helpful" },
  'premium': { quote: "Premium features unlocked. Enjoy advanced analysis and insights.", mood: "helpful" },
  'wallet_tracking': { quote: "Portfolio tracking enabled. Monitor your holdings in real-time.", mood: "helpful" },
  'market_overview': { quote: "Market data updated. Stay informed with the latest trends.", mood: "helpful" },
  'price_alerts': { quote: "Price alerts configured. You'll be notified of significant movements.", mood: "helpful" },
  
  // Hide-and-Seek
  'hideseek_1': { quote: "Quick tip: Set price alerts to avoid constant checking.", mood: "helpful" },
  'hideseek_2': { quote: "Pro tip: Explore all features to maximize your analysis.", mood: "helpful" },
  'hideseek_3': { quote: "Reminder: Diversification is key to managing risk.", mood: "helpful" },
  'hideseek_4': { quote: "Stay disciplined. Emotional trading rarely leads to good outcomes.", mood: "helpful" }
};

// Normalize quotes to support both modes
function normalizeQuotes() {
  const normalized = {};
  
  for (const [key, value] of Object.entries(CRYPTO_CAT_QUOTES)) {
    normalized[key] = {
      smartass: value,
      plain: CRYPTO_CAT_PLAIN_OVERRIDES[key] || value // Fallback to smartass if no plain version
    };
  }
  
  return normalized;
}

// Cache normalized quotes
const NORMALIZED_CAT_QUOTES = normalizeQuotes();

// Toggle between Smartass and Plain modes
function toggleCatMode() {
  if (!state.cryptoCatEnabled) {
    showToast('Turn on Crypto Cat first!');
    return;
  }
  
  const newMode = state.catMode === 'smartass' ? 'plain' : 'smartass';
  state.catMode = newMode;
  localStorage.setItem('darkwave_cat_mode', newMode);
  
  // Update UI
  const modeText = document.getElementById('catModeText');
  const modeSwitchBtn = document.getElementById('catModeSwitchBtn');
  
  if (modeText) {
    modeText.textContent = 'Crypto Cat';
  }
  
  if (modeSwitchBtn) {
    modeSwitchBtn.textContent = newMode === 'smartass' ? '🔄 Plain' : '🔄 Smartass';
  }
  
  // Show notification
  const notification = newMode === 'smartass' 
    ? '😼 Crypto Cat activated!' 
    : '😺 Plain mode activated! Helpful commentary enabled.';
  showToast(notification);
  
  // Haptic feedback
  if (tg) {
    tg.HapticFeedback?.impactOccurred('medium');
  }
  
  console.log(`🔄 Crypto Cat mode switched to: ${newMode}`);
}

// Initialize mode switcher button visibility
function updateCatModeUI() {
  const modeSwitchBtn = document.getElementById('catModeSwitchBtn');
  const modeText = document.getElementById('catModeText');
  
  if (modeSwitchBtn) {
    modeSwitchBtn.style.display = state.cryptoCatEnabled ? 'block' : 'none';
    modeSwitchBtn.textContent = state.catMode === 'smartass' ? '🔄 Plain' : '🔄 Smartass';
  }
  
  if (modeText) {
    modeText.textContent = state.catMode === 'smartass' ? 'Smart-ass Mode' : 'Plain Mode';
  }
}

// Call this on page load and when toggling cat
setTimeout(() => {
  updateCatModeUI();
}, 1000);
