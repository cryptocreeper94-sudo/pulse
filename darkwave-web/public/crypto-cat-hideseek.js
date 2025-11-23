// Crypto Cat Hide and Seek System
let hideSeekEnabled = true;
let foundCats = [];
let lastPopupTime = 0;
const POPUP_COOLDOWN_MIN = 120000; // Minimum 2 minutes between popups
const POPUP_COOLDOWN_MAX = 240000; // Maximum 4 minutes between popups

// Track recently shown content to avoid immediate repeats
let recentMessages = [];
let recentImages = [];
const MAX_RECENT_HISTORY = 5; // Remember last 5 messages/images

// Get random cooldown time for more natural feel
function getRandomCooldown() {
  return POPUP_COOLDOWN_MIN + Math.random() * (POPUP_COOLDOWN_MAX - POPUP_COOLDOWN_MIN);
}

let currentCooldown = getRandomCooldown();

// Smart randomization: Only trigger 15% of the time (1 in ~7 hovers)
// This makes it feel random and surprising instead of constant
const TRIGGER_PROBABILITY = 0.15; // 15% chance

// Track button/area usage frequency to reduce popups on frequently-used areas
let areaHoverCounts = {};

// BUSINESS MODE - Professional, helpful tips
const hideSeekMessagesBusiness = [
  "🐱 You found me! Trading insight: Avoid buying when market sentiment reaches euphoric levels. Peak FOMO often signals local tops.",
  "💼 Well spotted! Risk management tip: Projects promising unrealistic returns (1000x+) typically lack sustainable fundamentals.",
  "🎯 Excellent! Research reminder: DYOR (Do Your Own Research) is essential. Verify all claims through multiple sources.",
  "📊 Sharp observation! Market timing: Accumulation during corrections historically provides better risk-to-reward ratios.",
  "🐱 Good attention to detail! Whale behavior: Institutional investors execute positions quietly without public announcements.",
  "💡 You're improving! Portfolio strategy: Most altcoins don't survive full bear cycles. Diversification and project quality matter.",
  "📈 Nice work! Due diligence: If you cannot articulate a project's value proposition clearly, reconsider your investment thesis.",
  "⛽ Well done! Cost awareness: Layer 1 gas fees can significantly impact smaller transactions. Factor these into your strategy.",
  "📊 Persistent! Market psychology: Bull markets create overconfidence. True skill is tested during bearish conditions.",
  "💼 Impressive! Statistics: Approximately 90% of active traders underperform passive strategies. Ensure you have a genuine edge.",
  "🎯 Found me! Volatility management: Falling prices can continue declining. Implement proper position sizing and stop losses.",
  "📈 Smart! Exit planning: Define profit targets before entering positions. Emotion-free exits require predetermined strategies.",
  "⏱️ Well spotted! Behavioral finance: Excessive monitoring leads to impulsive decisions. Trust your analysis and remain disciplined.",
  "🔍 Great work! Innovation assessment: Evaluate unique value propositions. Many projects lack differentiation despite marketing claims.",
  "📢 Excellent! Sentiment analysis: Widespread retail enthusiasm can indicate overheated conditions. Monitor contrarian indicators."
];

// CASUAL MODE - Witty, sarcastic, fun personality
const hideSeekMessagesCasual = [
  "🐱 You found me! Here's a tip: Never buy when everyone's screaming 'TO THE MOON!' That's usually the top!",
  "😼 Well well, look who's paying attention! Pro tip: If a project promises 1000x returns, run the other way!",
  "🎯 Got me! Quick lesson: 'DYOR' means Do Your Own Research... but you won't, and that's why you need me!",
  "🐈 Sneaky! Here's wisdom: The best time to buy was yesterday. The second best? When there's blood in the streets!",
  "😺 You're getting good at this! Remember: Whales don't announce their moves on Twitter. They just... move!",
  "🐱 Caught red-pawed! Truth bomb: Most altcoins won't survive the next bear market. Choose wisely!",
  "😸 Nice catch! Hot take: If you can't explain the project to your grandma, you probably shouldn't invest in it!",
  "🎪 Found me again! Lesson time: Gas fees on Ethereum will cost more than your coffee. Welcome to DeFi!",
  "🐾 You're persistent! Here's the deal: Everyone's a genius in a bull market. The real test is the bear!",
  "😽 Impressive! Crypto fact: 90% of traders lose money. But YOU'RE different, right? (Spoiler: probably not)",
  "🌟 Got me! Word of wisdom: 'Buy the dip' sounds smart until you realize it can keep dipping!",
  "🎭 Well played! Remember: Paper hands sell too early. Diamond hands hold too long. Smart hands? They take profits!",
  "🔥 You found my hiding spot! Real talk: If you're checking prices every 5 minutes, you're doing it wrong!",
  "💎 Busted! Fun fact: Most 'revolutionary' projects are just copying each other with different names!",
  "🚀 You got me! Truth: When your Uber driver is giving crypto advice, it's time to get cautious!"
];

// Non-character-specific trading tips for Commentary Mode OFF
const hideSeekMessagesNeutral = [
  "💡 Trading Tip: Avoid buying assets when hype is at peak levels. Euphoric market conditions often signal local tops.",
  "📊 Market Insight: Projects promising unrealistic returns (1000x+) are typically unsustainable. Focus on fundamentals.",
  "🔍 Research Reminder: DYOR (Do Your Own Research) is essential. Never invest based solely on social media hype.",
  "⏰ Timing Strategy: Accumulating during market downturns historically offers better risk/reward than buying rallies.",
  "🐋 Whale Activity: Large investors typically execute positions quietly without broadcasting intentions on social media.",
  "📉 Market Cycles: Most altcoins fail to survive full bear market cycles. Project selection is critical for long-term success.",
  "🎓 Investment Principle: If you cannot clearly explain a project's value proposition, reconsider your investment thesis.",
  "⛽ Transaction Costs: Ethereum gas fees can significantly impact small transactions. Factor costs into your strategy.",
  "📈 Bull vs Bear: Strong performance in bull markets is common. True investment skill is tested during bear market conditions.",
  "📊 Statistics: Approximately 90% of active traders underperform buy-and-hold strategies. Consider your edge carefully.",
  "💰 Buy The Dip: Falling prices can continue declining further. Ensure proper risk management when adding to positions.",
  "🎯 Exit Strategy: Successful trading requires disciplined profit-taking. Define exit points before entering positions.",
  "⏱️ Price Monitoring: Excessive chart watching often leads to emotional decisions. Trust your analysis and maintain discipline.",
  "🔄 Project Differentiation: Many new projects lack true innovation. Evaluate unique value propositions carefully.",
  "📢 Market Sentiment: Widespread retail enthusiasm (even from non-investors) can signal overheated market conditions."
];

// Randomize hotspot positions to avoid repetitive placement
function randomizeHotspots() {
  const randomSpots = [];
  for (let i = 0; i < 5; i++) {
    randomSpots.push({
      id: `spot${i}`,
      top: `${Math.random() * 70 + 15}%`,
      left: `${Math.random() * 70 + 15}%`,
      width: `${Math.random() * 60 + 120}px`,
      height: `${Math.random() * 40 + 60}px`
    });
  }
  return randomSpots;
}

// Generate random hotspots on init
let hotspots = randomizeHotspots();

function initHideAndSeek() {
  if (!hideSeekEnabled) return;
  
  // Regenerate random hotspots each time
  hotspots = randomizeHotspots();
  foundCats = [];
  
  // Reset hover counts when reinitializing
  areaHoverCounts = {};
  
  // Create invisible hotspots
  hotspots.forEach(spot => {
    if (foundCats.includes(spot.id)) return; // Already found this one
    
    const hotspot = document.createElement('div');
    hotspot.className = 'cat-hotspot';
    hotspot.id = `hotspot-${spot.id}`;
    hotspot.style.cssText = `
      position: fixed;
      top: ${spot.top};
      left: ${spot.left};
      width: ${spot.width};
      height: ${spot.height};
      z-index: 1;
      cursor: help;
      pointer-events: auto;
    `;
    
    hotspot.addEventListener('mouseenter', () => {
      const now = Date.now();
      
      // Track hover count for this area
      if (!areaHoverCounts[spot.id]) {
        areaHoverCounts[spot.id] = 0;
      }
      areaHoverCounts[spot.id]++;
      
      // Reduce probability for frequently-hovered areas
      // First 3 hovers: 15% chance
      // 4-10 hovers: 10% chance
      // 11+ hovers: 5% chance (very rare for frequently-used buttons)
      let probability = TRIGGER_PROBABILITY;
      if (areaHoverCounts[spot.id] > 10) {
        probability = 0.05; // Only 5% for heavily-used areas
      } else if (areaHoverCounts[spot.id] > 3) {
        probability = 0.10; // 10% for moderately-used areas
      }
      
      // Random chance check + cooldown check
      const shouldTrigger = Math.random() < probability;
      
      if (shouldTrigger && now - lastPopupTime > currentCooldown) {
        showHideSeekPopup(spot.id);
        lastPopupTime = now;
        // Generate new random cooldown for next popup
        currentCooldown = getRandomCooldown();
      }
    });
    
    document.body.appendChild(hotspot);
  });
}

function showHideSeekPopup(spotId) {
  if (!hideSeekEnabled) return;
  
  // NO CRYPTO CAT POPUPS on Projects page (accessible to everyone)
  const currentTab = document.querySelector('.tab-pane.active');
  if (currentTab && currentTab.id === 'projects') {
    console.log('🔒 Crypto Cat popups disabled on Projects page');
    return;
  }
  
  // Check if user has access to hide-and-seek popups (paid subscribers only)
  if (typeof hasFeatureAccess === 'function' && !hasFeatureAccess('cryptoCatHideSeek')) {
    console.log('🔒 Hide-and-seek popups restricted to paid subscribers');
    return;
  }
  
  foundCats.push(spotId);
  
  // Remove the hotspot so it can't be triggered again
  const hotspot = document.getElementById(`hotspot-${spotId}`);
  if (hotspot) hotspot.remove();
  
  const existingPopup = document.getElementById('catPopup');
  if (existingPopup) existingPopup.remove();
  
  // Get current persona mode using the standard window.currentCatMode
  const persona = window.currentCatMode || 'casual';
  
  // Select message based on Commentary Mode (with anti-repeat logic)
  let messageArray;
  if (persona === 'business') {
    messageArray = hideSeekMessagesBusiness; // Professional tips
  } else if (persona === 'casual') {
    messageArray = hideSeekMessagesCasual; // Witty, sarcastic tips
  } else {
    messageArray = hideSeekMessagesNeutral; // Neutral tips (OFF mode)
  }
  
  // Filter out recently shown messages
  const availableMessages = messageArray.filter(msg => !recentMessages.includes(msg));
  const messagesToChooseFrom = availableMessages.length > 0 ? availableMessages : messageArray;
  const message = messagesToChooseFrom[Math.floor(Math.random() * messagesToChooseFrom.length)];
  
  // Track this message
  recentMessages.push(message);
  if (recentMessages.length > MAX_RECENT_HISTORY) recentMessages.shift();
  
  // Select cat image based on persona (ALL AVAILABLE IMAGES for maximum variety)
  const catImages = persona === 'business' 
    ? [
        '/crypto-cat-images/business-cat-pointing.jpg',
        '/crypto-cat-images/business-cat-explaining.jpg',
        '/crypto-cat-images/business-cat-facepalm.jpg',
        '/crypto-cat-images/business-cat-sitting.jpg'
      ]
    : [
        '/crypto-cat-images/sarcastic-cat-pointing.jpg',
        '/crypto-cat-images/sarcastic-cat-sunglasses.jpg',
        '/crypto-cat-images/sarcastic-cat-facepalm.jpg',
        '/crypto-cat-images/sarcastic-cat.png'
      ];
  
  // Filter out recently shown images
  const availableImages = catImages.filter(img => !recentImages.includes(img));
  const imagesToChooseFrom = availableImages.length > 0 ? availableImages : catImages;
  const randomImage = imagesToChooseFrom[Math.floor(Math.random() * imagesToChooseFrom.length)];
  
  // Track this image
  recentImages.push(randomImage);
  if (recentImages.length > MAX_RECENT_HISTORY) recentImages.shift();
  
  // Check if Commentary Mode is OFF
  const showCatPanel = persona === 'business' || persona === 'casual';
  
  const popup = document.createElement('div');
  popup.id = 'catPopup';
  popup.className = 'cat-popup';
  
  popup.innerHTML = `
    <div class="cat-popup-content ${!showCatPanel ? 'cat-popup-simple' : ''}">
      ${showCatPanel ? `
      <!-- Cat Image -->
      <div class="cat-popup-cat">
        <img src="${randomImage}" alt="Crypto Cat" />
      </div>
      ` : ''}
      
      <!-- Panel 2: Content (Full Screen) -->
      <div class="cat-popup-panel-content">
        <button class="cat-popup-close" onclick="closeCatPopup()" style="position: absolute; top: 20px; right: 20px; z-index: 10;">×</button>
        <div class="cat-popup-panel-content-inner">
          <div class="cat-popup-term">${showCatPanel ? 'You Found Me!' : 'Hidden Insight Discovered'}</div>
          <div class="cat-popup-text">${message}</div>
          <div class="cat-found-count" style="margin-top: 15px; color: var(--accent-blue); font-weight: bold;">${foundCats.length} / ${hotspots.length} discovered</div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Auto close after 10 seconds
  setTimeout(() => closeCatPopup(), 10000);
  
  // Check if all cats found
  if (foundCats.length === hotspots.length) {
    setTimeout(() => {
      showAllCatsFoundPopup();
    }, 8500);
  }
}

function showAllCatsFoundPopup() {
  // Get current persona mode
  const persona = window.currentCatMode || 'casual';
  const showCatPanel = persona === 'business' || persona === 'casual';
  
  const popup = document.createElement('div');
  popup.id = 'catPopup';
  popup.className = 'cat-popup';
  
  // Title and message based on Commentary Mode
  const title = showCatPanel ? '🎉 You Found Them All!' : '🎉 All Insights Discovered!';
  const completionMessage = showCatPanel 
    ? "Impressive! You've got the attention span of a true degen trader. Now use that focus to actually read the charts instead of hunting for cats! 😼"
    : "Excellent attention to detail! You've discovered all hidden trading insights. Apply this same level of focus when analyzing market data and charts.";
  
  popup.innerHTML = `
    <div class="cat-popup-content ${!showCatPanel ? 'cat-popup-simple' : ''}">
      ${showCatPanel ? `
      <!-- Cat Image -->
      <div class="cat-popup-cat">
        <img src="/crypto-cat-images/sarcastic-cat-coins.jpg" alt="Crypto Cat" />
      </div>
      ` : ''}
      
      <!-- Panel 2: Content (Full Screen) -->
      <div class="cat-popup-panel-content">
        <button class="cat-popup-close" onclick="closeCatPopup()" style="position: absolute; top: 20px; right: 20px; z-index: 10;">×</button>
        <div class="cat-popup-panel-content-inner">
          <div class="cat-popup-term">${title}</div>
          <div class="cat-popup-text">${completionMessage}</div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  setTimeout(() => closeCatPopup(), 12000);
  
  // Reset after finding all
  setTimeout(() => {
    foundCats = [];
    initHideAndSeek();
  }, 15000);
}

function toggleHideSeek(enabled) {
  hideSeekEnabled = enabled;
  
  if (!enabled) {
    // Remove all hotspots
    document.querySelectorAll('.cat-hotspot').forEach(h => h.remove());
  } else {
    // Reinitialize
    initHideAndSeek();
  }
}

function teardownHideAndSeek() {
  // Explicitly remove all hotspots and reset state
  document.querySelectorAll('.cat-hotspot').forEach(h => h.remove());
  foundCats = [];
  areaHoverCounts = {}; // Reset hover tracking
  hideSeekEnabled = false;
  console.log('🐱 Hide and seek torn down');
}

// Initialize when page loads
if (typeof window !== 'undefined') {
  window.initHideAndSeek = initHideAndSeek;
  window.toggleHideSeek = toggleHideSeek;
  window.teardownHideAndSeek = teardownHideAndSeek;
  
  document.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('cryptoCatEnabled');
    hideSeekEnabled = saved === null ? true : saved === 'true';
    
    if (hideSeekEnabled) {
      setTimeout(initHideAndSeek, 2000); // Wait 2s after page load
    }
  });
}
