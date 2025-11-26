// ═══════════════════════════════════════════════════════════════
// 💬 DarkWave Pulse - Dynamic Popup Commentary System
// Multiple rotating variations for each metric popup
// Business (professional) vs Casual (smartass) personas
// November 15, 2025
// ═══════════════════════════════════════════════════════════════

const POPUP_COMMENTARY = {
  feargreed: {
    business: [
      "When everyone panics, smart money accumulates. Market fear creates opportunity.",
      "Extreme sentiment often marks turning points. Contrarian positioning pays off.",
      "Fear levels this high suggest capitulation is near. Watch for reversal signals.",
      "Emotional markets create mispricing. Institutional money enters during fear.",
      "Market sentiment is a lagging indicator. Use it to gauge entry timing.",
      "Greed signals overextension. Consider scaling out of positions.",
      "Historical data shows extreme fear precedes significant rallies.",
      "Sentiment extremes typically resolve within 1-3 weeks. Position accordingly.",
      "High fear readings correlate with local bottoms across market cycles.",
      "Greed phases end abruptly. Risk management becomes critical at these levels.",
      "Fear Index below 25 has historically offered 6-month forward returns averaging 45%.",
      "Contrarian indicators work because emotions drive poor decision-making at extremes."
    ],
    casual: [
      "Everyone's selling their bags in panic while I'm over here buying the dip. Your loss is my gain! 😼",
      "Fear Index says 'extreme fear' - translation: time to be greedy when others are scared. You know the drill!",
      "Market's scared? Good. That's when the real money is made. Retail panic = pro opportunity.",
      "Oh look, another panic sell-off. How original. Meanwhile, smart money is loading up.",
      "Extreme fear means capitulation. Translation: weak hands selling to strong hands. Nature is healing! 🐱",
      "Everyone's freaking out and I'm just sitting here waiting for the discount to get better.",
      "Fear & Greed at extreme levels? Time to do the opposite of whatever your Twitter timeline is screaming.",
      "When normies panic, legends accumulate. Which one are you? 😹",
      "Greed level: maximum. Translation: someone's about to get rekt and it ain't me! 💰",
      "The Fear Index is basically a map showing you where retail is wrong. Use it wisely!",
      "Extreme greed = time to take profits. Extreme fear = time to buy. It's not rocket surgery! 🚀",
      "Everyone buying at ATH because of greed. Classic. Can't wait for the 'I lost everything' posts.",
      "Fear so high you can smell the panic sweat through the screen. Beautiful buying opportunity! 😼",
      "Greed Index maxed out? That's your signal to be the only smart person in the room and exit.",
      "The herd is terrified. Good. More cheap coins for those of us with a backbone. 🐱"
    ]
  },
  
  altseason: {
    business: [
      "Altcoin dominance indicates where capital is rotating. Use this to time sector exposure.",
      "Bitcoin season favors conservative positioning. Alt season rewards selective risk-taking.",
      "Historical patterns show alt seasons follow Bitcoin consolidation periods.",
      "Capital rotation from BTC to alts signals risk-on market behavior.",
      "Alt season metrics help identify optimal rebalancing opportunities.",
      "When Bitcoin dominates, focus on quality. When alts lead, diversification pays.",
      "Market structure shifts between BTC consolidation and alt expansion phases.",
      "Alt season index above 75 historically lasts 2-8 weeks before mean reversion.",
      "Bitcoin dominance rising suggests risk-off positioning. Reduce alt exposure accordingly.",
      "Altcoin rallies during BTC consolidation offer tactical trading opportunities.",
      "90-day performance divergence signals capital flow direction between BTC and alts.",
      "Strong alt seasons typically occur mid-cycle. Early and late cycles favor Bitcoin."
    ],
    casual: [
      "Alt season is HERE! Bitcoin who? Those dusty old altcoins in your portfolio might actually pump for once. Don't get too excited though! 🚀",
      "Bitcoin's boring right now. Alts are where the action is. Time to gamble on your favorite dog coins? 🐕",
      "Everyone's portfolio just turned green. Alt season baby! Enjoy it while it lasts - usually doesn't. 😼",
      "Alt season means it's time for every coin with a dog logo to 10x for no reason. What a time to be alive!",
      "Bitcoin consolidating while alts pump? Classic rotation. Your bags might actually be worth something today!",
      "When Bitcoin sleeps, the altcoins come out to play. And by play, I mean wreck your portfolio with volatility. 😹",
      "Alt season: where everyone thinks they're a genius trader until Bitcoin starts moving again.",
      "Altcoins are outperforming! Quick, someone check if hell froze over. Actually, this happens every cycle - pay attention!",
      "Bitcoin dominance dropping = alt season starting. Translation: time to watch your meme coins actually do something! 🎰",
      "All your random altcoins are pumping? Yeah, that's alt season. Sell before it ends! Trust me.",
      "Bitcoin range-bound, alts going crazy. This is your window. Don't be greedy - alt seasons end FAST. ⚡",
      "Alt season detected! Time for that coin you bought as a joke to pump 400%. Crypto is weird. 😹",
      "Everyone's chasing altcoin pumps right now. Remember: musical chairs. Don't be left standing when music stops! 🎵",
      "Bitcoin being boring is actually exciting - means altcoins get to have their moment in the spotlight! 🌟",
      "Altcoin Season Index: 75+. Translation: Your portfolio of questionable decisions might finally pay off! 😼"
    ]
  },
  
  marketcap: {
    business: [
      "Total market cap reflects aggregate capital deployed across crypto assets.",
      "Market cap growth indicates institutional and retail capital inflows.",
      "Rising market cap with stable prices suggests new project launches absorbing capital.",
      "Market cap trends show macro sentiment toward the entire crypto sector.",
      "Comparing market cap to previous cycles helps gauge market maturity.",
      "Market cap approaching previous ATH suggests cycle continuation. Watch for breakout confirmation.",
      "Declining market cap with stable BTC price indicates altcoin capitulation phase.",
      "Market cap velocity correlates with new participant onboarding rates.",
      "Total value locked plus market cap provides comprehensive DeFi ecosystem health metrics.",
      "Market cap recovery speed after corrections indicates underlying demand strength."
    ],
    casual: [
      "3 TRILLION dollars! That's a lot of money people are willing to lose in this casino. 💰",
      "The total crypto market cap is basically how much money is trapped in this beautiful Ponzi scheme we all love.",
      "Market cap go up = everyone's happy. Market cap go down = everyone pretends they're 'in it for the tech.' 😼",
      "All that money and people still can't figure out when to take profits. Amazing!",
      "Billions flowing in and out daily. It's like watching a chaotic money printer with extra steps. 😹",
      "Market cap represents how much collective delusion exists in crypto at any given moment. Bullish! 🚀",
      "Trillions of dollars in crypto and we still can't decide if it's the future or a scam. Love it! 😼",
      "Market cap dropping? Don't worry, everyone's just 'DCAing' (coping mechanism). 💸",
      "The entire crypto market worth trillions and people still think their $100 investment will change their life.",
      "Market cap at ATH = peak euphoria. Market cap at ATL = 'I'm never selling!' Both are wrong. 😹",
      "Total market cap is literally just a scoreboard for who's winning at financial chicken right now. 🐔"
    ]
  },
  
  volume: {
    business: [
      "Trading volume indicates market liquidity and participant engagement levels.",
      "High volume confirms price movements. Low volume suggests weak conviction.",
      "Volume spikes often precede significant price action in either direction.",
      "Institutional activity correlates with sustained volume increases.",
      "Volume analysis helps distinguish between noise and meaningful market moves.",
      "Declining volume during rallies signals distribution phase. Exercise caution.",
      "Volume-price divergence often marks trend exhaustion points.",
      "Sustained high volume validates breakouts. Low volume breakouts typically fail.",
      "Volume concentration in specific hours indicates geographic trading patterns.",
      "On-chain volume versus exchange volume ratio shows holder conviction levels."
    ],
    casual: [
      "Volume's pumping! Everyone's trading like there's no tomorrow. There might not be after those gas fees! 😼",
      "High volume = everyone's either panic buying or panic selling. Either way, it's entertaining.",
      "Trading volume tells you how many people are currently making bad decisions at the same time.",
      "Big volume moves mean either institutions are accumulating or retail is getting liquidated. Fun times! 😹",
      "Look at all that volume! Someone's definitely getting rekt today, just not sure who yet.",
      "Trading volume spiking? That's just the sound of portfolios evaporating in real-time. Music to my ears! 🎵",
      "High volume with no price movement = whales playing ping pong with retail's emotions. Classic. 🏓",
      "Everyone's trading today! Good news for exchanges collecting fees. Bad news for your portfolio. 💸",
      "Volume dumping hard = everyone running for the exit at the same time. Good luck with that! 🏃",
      "Low volume? Market's boring. High volume? Market's terrifying. Pick your poison! ☠️",
      "Volume chart looking like a seismograph during an earthquake. Someone's getting absolutely demolished. 😹"
    ]
  }
};

// ═══════════════════════════════════════════════════════════════
// Random Commentary Selector
// Ensures variety by tracking recently shown comments
// ═══════════════════════════════════════════════════════════════

class CommentaryManager {
  constructor() {
    this.recentComments = {};
  }
  
  getRandomComment(metricType, persona = 'business') {
    const comments = POPUP_COMMENTARY[metricType];
    if (!comments || !comments[persona]) {
      return null;
    }
    
    const availableComments = comments[persona];
    if (availableComments.length === 0) {
      return null;
    }
    
    // Initialize recent tracking for this metric/persona combo
    const key = `${metricType}_${persona}`;
    if (!this.recentComments[key]) {
      this.recentComments[key] = [];
    }
    
    // Filter out recently shown comments (last 3)
    const recentlyShown = this.recentComments[key];
    let eligibleComments = availableComments.filter(c => !recentlyShown.includes(c));
    
    // If all comments were recent, reset and use full pool
    if (eligibleComments.length === 0) {
      eligibleComments = availableComments;
      this.recentComments[key] = [];
    }
    
    // Select random comment
    const randomIndex = Math.floor(Math.random() * eligibleComments.length);
    const selectedComment = eligibleComments[randomIndex];
    
    // Track this comment as recently shown
    this.recentComments[key].push(selectedComment);
    if (this.recentComments[key].length > 3) {
      this.recentComments[key].shift(); // Keep only last 3
    }
    
    return selectedComment;
  }
  
  // Get static base definition (always the same)
  getBaseDefinition(metricType) {
    const definitions = {
      feargreed: 'The Fear & Greed Index measures investor sentiment in the cryptocurrency market. A score below 50 indicates fear (potential buying opportunity), while above 50 shows greed (market may be overheated). This helps traders avoid emotional decision-making.',
      altseason: 'The Alt Season Index tracks whether Bitcoin or altcoins are dominating the market. When altcoins outperform Bitcoin by 75% or more over a 90-day period, it signals "Alt Season" - a time when alternative cryptocurrencies typically see significant gains.',
      marketcap: 'The Total Market Cap represents the combined value of all cryptocurrencies. This metric shows the overall health and growth of the crypto market. Increases indicate capital inflow and bullish sentiment, while decreases suggest capital outflow or bearish trends.',
      volume: 'The 24h Trading Volume shows how much cryptocurrency was traded in the last day. High volume indicates strong market activity and liquidity, while low volume suggests quiet markets. Volume often precedes major price movements.'
    };
    
    return definitions[metricType] || '';
  }
}

// Global instance
window.commentaryManager = new CommentaryManager();

// ═══════════════════════════════════════════════════════════════
// Dynamic Cat Image Manager
// Rotates through available cat images to keep popups fresh
// ═══════════════════════════════════════════════════════════════

class CatImageManager {
  constructor() {
    this.recentImages = {};
    
    // Available cat images for popups - Using Grumpy Cat from trading-cards (transparent PNGs)
    this.catImages = {
      business: [
        '/trading-cards/Grumpy_cat_neutral_pose_ba4a1b4d.png',
        '/trading-cards/Grumpy_cat_arms_crossed_f8e46099.png',
        '/trading-cards/Grumpy_cat_pointing_pose_6bbe6ae8.png',
        '/trading-cards/Grumpy_cat_thumbs_up_e77056f4.png',
        '/trading-cards/Grumpy_cat_fist_pump_e028a55a.png'
      ],
      casual: [
        '/trading-cards/Grumpy_cat_sideeye_pose_5e52df88.png',
        '/trading-cards/Grumpy_cat_facepalm_pose_2fdc5a6a.png',
        '/trading-cards/Grumpy_cat_angry_pose_63318575.png',
        '/trading-cards/Grumpy_cat_walking_pose_4be44c5b.png',
        '/trading-cards/Grumpy_orange_Crypto_Cat_ac1ff7e8.png'
      ]
    };
  }
  
  getRandomCatImage(persona = 'business') {
    const images = this.catImages[persona];
    if (!images || images.length === 0) {
      return this.catImages.business[0]; // Fallback
    }
    
    // Initialize recent tracking for this persona
    if (!this.recentImages[persona]) {
      this.recentImages[persona] = [];
    }
    
    // Filter out recently shown images (last 3)
    const recentlyShown = this.recentImages[persona];
    let eligibleImages = images.filter(img => !recentlyShown.includes(img));
    
    // If all images were recent, reset and use full pool
    if (eligibleImages.length === 0) {
      eligibleImages = images;
      this.recentImages[persona] = [];
    }
    
    // Select random image
    const randomIndex = Math.floor(Math.random() * eligibleImages.length);
    const selectedImage = eligibleImages[randomIndex];
    
    // Track this image as recently shown
    this.recentImages[persona].push(selectedImage);
    if (this.recentImages[persona].length > 3) {
      this.recentImages[persona].shift(); // Keep only last 3
    }
    
    return selectedImage;
  }
  
  // Add new images to the pool (call this after user uploads)
  addImages(persona, imagePaths) {
    if (!this.catImages[persona]) {
      this.catImages[persona] = [];
    }
    this.catImages[persona].push(...imagePaths);
    console.log(`✅ Added ${imagePaths.length} images to ${persona} cat pool`);
  }
}

// Global instance
window.catImageManager = new CatImageManager();
