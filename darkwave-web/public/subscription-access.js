// Centralized Subscription Access Control System
// Manages feature access based on subscription tier

// Get current user's subscription tier and whitelist status
function getUserAccessLevel() {
  const userTier = localStorage.getItem('userTier') || 'trial';
  const dwpUser = JSON.parse(localStorage.getItem('dwp_user') || '{}');
  const isWhitelisted = dwpUser.isWhitelisted || false;
  
  return {
    tier: userTier,
    isWhitelisted,
    isTrial: userTier === 'trial' && !isWhitelisted,
    isBase: userTier === 'base' || isWhitelisted,
    isTop: userTier === 'top' || isWhitelisted,
    isPaid: (userTier === 'base' || userTier === 'top' || isWhitelisted)
  };
}

// Check if user has access to a specific feature
function hasFeatureAccess(feature) {
  const access = getUserAccessLevel();
  
  const featureMap = {
    // Free trial features (everyone gets these)
    'assetLookup': true,
    'webResearch': true,
    'projects': true,
    'mainDashboard': true,
    
    // Paid features (BASE + TOP + whitelisted)
    'colorPicker': access.isPaid,
    'portfolio': access.isPaid,
    'educationalContent': access.isPaid,
    'glossary': access.isPaid,
    'beginnersGuide': access.isPaid,
    
    // Premium-only features (TOP tier + whitelisted)
    'marketCycleOutlook': access.isTop,  // Market Cycle Prediction (Premium only)
    
    // Crypto Cat features
    'cryptoCat': access.isPaid,  // Full cat features
    'cryptoCatTeaser': true,  // Trial users get metric box popups only
    'cryptoCatGlossary': access.isPaid,
    'cryptoCatHideSeek': access.isPaid,
    'cryptoCatCoinPopups': access.isPaid,
    'cryptoCatMetricPopups': true,  // Everyone gets these as teaser
    
    // Future features (no one has access yet)
    'nftMarket': false,
    'advancedCharts': false,
    'priceAlerts': false,
    'communityChat': false
  };
  
  return featureMap[feature] !== undefined ? featureMap[feature] : false;
}

// Check Portfolio access
function checkPortfolioAccess() {
  const access = getUserAccessLevel();
  const portfolioTab = document.getElementById('tab_portfolio');
  
  if (portfolioTab && access.isTrial) {
    console.log('🔒 Portfolio tab hidden for trial user');
  }
}

// Check Educational access
function checkEducationalAccess() {
  const access = getUserAccessLevel();
  console.log('🔓 Educational features:', {
    glossary: hasFeatureAccess('glossary'),
    beginnersGuide: hasFeatureAccess('beginnersGuide')
  });
}

// Apply UI restrictions based on subscription tier
function applySubscriptionRestrictions() {
  const access = getUserAccessLevel();
  
  // Hide Color Picker for trial users
  const colorPickerBtn = document.getElementById('colorPickerBtn');
  if (colorPickerBtn) {
    if (access.isTrial) {
      colorPickerBtn.style.display = 'none';
      console.log('🔒 Color Picker hidden for trial user');
    } else {
      colorPickerBtn.style.display = 'flex';
    }
  }
  
  // Block Portfolio tab for trial users
  checkPortfolioAccess();
  
  // Block Educational content for trial users
  checkEducationalAccess();
  
  console.log('✅ Subscription restrictions applied', {
    tier: access.tier,
    isWhitelisted: access.isWhitelisted,
    isPaid: access.isPaid
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applySubscriptionRestrictions);
} else {
  applySubscriptionRestrictions();
}

console.log('✅ Subscription Access Control loaded');
