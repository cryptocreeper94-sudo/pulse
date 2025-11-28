// Crypto Cat Popup System
let cryptoCatMode = 'off'; // 'off', 'business', 'casual' - DEFAULT: minimized

// Casual (Sarcastic) responses for glossary terms
const casualResponses = {
  'liquidation': '💧 Where your tears flow when the market decides you had too much leverage!',
  'fomo': '😱 That feeling when everyone is making money except you... spoiler: they aren\'t!',
  'hodl': '💎 Hold On for Dear Life... or just can\'t spell "hold". Both valid!',
  'whale': '🐋 Not the ocean kind. These are the folks who can move markets with a sneeze!',
  'pump': '🚀 When price goes up fast. Usually followed by...',
  'dump': '📉 When whales decide it\'s time to take profits. RIP your portfolio!',
  'rug pull': '🏃 When developers say "thanks for the money, suckers!" and vanish!',
  'moon': '🌙 That mythical place your coins will never reach. But we keep hoping!',
  'dyor': '🔍 Do Your Own Research... but you won\'t, and that\'s why I\'m here!',
  'rekt': '💀 Past tense of "wrecked". Your portfolio after ignoring my advice!',
  'ath': '📊 All-Time High. That price you bought at before it crashed!',
  'atl': '🔻 All-Time Low. Where you should\'ve bought but didn\'t!',
  'bag holder': '🎒 Congrats! You\'re holding worthless tokens while pretending it\'s "investing"!',
  'diamond hands': '💎 Refusing to sell even as your portfolio burns. Brave or stupid? You decide!',
  'paper hands': '📄 Selling at the first sign of trouble. Probably the smarter move, honestly!',
  'degen': '🎰 Someone who makes terrible financial decisions. Hi there!',
  'gas fee': '⛽ The fee that costs more than your actual transaction. Welcome to Ethereum!',
  'bear market': '🐻 When everything goes down and hopium is all you have left!',
  'bull market': '🐂 When everyone\'s a genius and buying high seems like a great idea!',
  'shitcoin': '💩 99% of all cryptocurrencies. But yours is different, right?'
};

// Business (Professional) responses for glossary terms
const businessResponses = {
  'liquidation': 'Forced position closure when margin requirements aren\'t met. Risk management is crucial.',
  'fomo': 'Fear Of Missing Out - emotion-driven investment decisions typically lead to buying at peaks.',
  'hodl': 'Long-term holding strategy, originally a misspelling that became crypto culture.',
  'whale': 'Entity holding significant cryptocurrency amounts, capable of influencing market prices.',
  'pump': 'Rapid price increase, often artificially induced through coordinated buying.',
  'dump': 'Large-scale selling causing significant price decrease. Watch for volume spikes.',
  'rug pull': 'Exit scam where developers abandon project and drain liquidity. Due diligence is essential.',
  'moon': 'Significant price appreciation. Set realistic targets and take profits incrementally.',
  'dyor': 'Do Your Own Research - fundamental analysis is critical before any investment.',
  'rekt': 'Substantial financial loss. Proper risk management and position sizing prevent this.',
  'ath': 'All-Time High - historical peak price. Useful resistance level for technical analysis.',
  'atl': 'All-Time Low - historical bottom price. Potential support level when analyzing trends.',
  'bag holder': 'Investor holding depreciated assets. Dollar-cost averaging can mitigate this risk.',
  'diamond hands': 'Strong conviction holding despite volatility. Requires solid fundamental thesis.',
  'paper hands': 'Premature selling under pressure. Sometimes cutting losses is the prudent choice.',
  'degen': 'High-risk trader prioritizing potential returns over safety. Not recommended for beginners.',
  'gas fee': 'Transaction cost on blockchain networks. Higher fees during network congestion.',
  'bear market': 'Extended period of declining prices. Opportunity for accumulation at lower valuations.',
  'bull market': 'Sustained upward price trend. Be cautious of euphoria and maintain discipline.',
  'shitcoin': 'Low-quality cryptocurrency with questionable fundamentals. Thorough vetting required.'
};

function showCatPopup(term, definition) {
  // Determine response and cat image based on mode
  let catResponse;
  let catImage = '/trading-cards/Grumpy_cat_neutral_pose_ba4a1b4d.png';
  
  if (cryptoCatMode === 'off') {
    catResponse = definition;
  } else if (cryptoCatMode === 'business') {
    catResponse = businessResponses[term.toLowerCase()] || definition;
    catImage = '/trading-cards/Grumpy_cat_neutral_pose_ba4a1b4d.png';
  } else {
    catResponse = casualResponses[term.toLowerCase()] || `🐱 ${definition}`;
    catImage = '/trading-cards/Grumpy_cat_sideeye_pose_5e52df88.png';
  }
  
  // Use new slide-in popup system
  if (window.showSlideInPopup) {
    window.showSlideInPopup({
      image: catImage,
      name: 'Grumpy Cat',
      title: term,
      message: catResponse,
      direction: 'right',
      duration: 10000
    });
  }
}

function closeCatPopup() {
  // Use new slide-in close if available
  if (window.closeSlideInPopup) {
    window.closeSlideInPopup('right');
    return;
  }
  // Fallback for old system
  const popup = document.getElementById('catPopup');
  if (popup) {
    popup.classList.add('cat-popup-closing');
    setTimeout(() => popup.remove(), 300);
  }
}

function setCryptoCatMode(mode) {
  cryptoCatMode = mode; // 'off', 'business', 'casual'
  window.currentCatMode = mode; // CRITICAL: Sync to window for gauge needles
  localStorage.setItem('cryptoCatMode', mode);
  
  // NOTE: Do NOT call personaManager.setPersona here - setPersonaMode already handles it
  // This prevents duplicate personaChanged events
  
  // Update hide and seek based on mode
  if (typeof window.hideSeekEnabled !== 'undefined') {
    window.hideSeekEnabled = mode !== 'off';
  }
  
  // Update glossary banner cats based on mode
  updateGlossaryBannerCats(mode);
  
  console.log(`🎙️ Commentary Mode set to: ${mode}`);
}

function updateGlossaryBannerCats(mode) {
  const casualCat = document.getElementById('casualGlossaryCat');
  const businessCat = document.getElementById('businessGlossaryCat');
  const bannerContainer = document.querySelector('.glossary-banner-container');
  
  if (!casualCat || !businessCat) return;
  
  if (mode === 'off') {
    // Hide both cats and the entire banner container when OFF
    if (bannerContainer) bannerContainer.style.display = 'none';
  } else {
    // Show banner container
    if (bannerContainer) bannerContainer.style.display = 'block';
    
    // Toggle between business and casual cats
    if (mode === 'business') {
      casualCat.style.display = 'none';
      businessCat.style.display = 'block';
    } else { // casual
      casualCat.style.display = 'block';
      businessCat.style.display = 'none';
    }
  }
}

function getCryptoCatMode() {
  return cryptoCatMode;
}


// Legacy function for backwards compatibility
function toggleCryptoCat(enabled) {
  setCryptoCatMode(enabled ? 'casual' : 'off');
}

// Load saved preference
if (typeof window !== 'undefined') {
  window.showCatPopup = showCatPopup;
  window.closeCatPopup = closeCatPopup;
  window.setCryptoCatMode = setCryptoCatMode;
  window.getCryptoCatMode = getCryptoCatMode;
  window.toggleCryptoCat = toggleCryptoCat;
  
  document.addEventListener('DOMContentLoaded', function() {
    const savedMode = localStorage.getItem('cryptoCatMode') || 'off';
    cryptoCatMode = savedMode;
    
    // Sync with persona manager if it exists
    if (window.personaManager && personaManager.getPersona) {
      const currentPersona = personaManager.getPersona();
      if (cryptoCatMode !== 'off' && currentPersona !== cryptoCatMode) {
        cryptoCatMode = currentPersona;
        localStorage.setItem('cryptoCatMode', cryptoCatMode);
      }
    }
    
    // Set initial glossary banner cat visibility
    updateGlossaryBannerCats(cryptoCatMode);
  });
}
