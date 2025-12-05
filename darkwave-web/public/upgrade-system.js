// DarkWave Pulse Upgrade System - Make Premium irresistible

// Track user's current tier and search usage
let userTier = 'trial'; // trial, base, premium
let searchesRemaining = 10;
let searchLimit = 10;

// Initialize upgrade system
function initUpgradeSystem() {
  // Check user tier from session
  const session = JSON.parse(localStorage.getItem('darkwaveSession') || '{}');
  
  if (session.user) {
    userTier = session.user.subscriptionTier || 'trial';
    searchesRemaining = session.user.searchesRemaining || 10;
    searchLimit = session.user.monthlySearchLimit || 10;
    
    // Show floating banner for Base users
    if (userTier === 'base' || userTier === 'trial') {
      showFloatingUpgradeBanner();
    }
    
    // Update search counter display
    updateSearchCounter();
  }
}

// Show floating upgrade banner (dismissible)
function showFloatingUpgradeBanner() {
  // Don't show if already dismissed this session
  if (sessionStorage.getItem('upgradeBannerDismissed')) return;
  
  const banner = document.createElement('div');
  banner.id = 'floatingUpgradeBanner';
  banner.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    max-width: 320px;
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    border: 2px solid #60a5fa;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
    z-index: 9999;
    animation: slideInRight 0.5s ease-out;
  `;
  
  banner.innerHTML = `
    <button onclick="dismissUpgradeBanner()" style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.2); border: none; color: white; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 16px; line-height: 1;">×</button>
    
    <div style="margin-bottom: 12px;">
      <div style="font-size: 20px; margin-bottom: 4px;">⚡</div>
      <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: white;">Become a Legacy Founder</h3>
      <p style="margin: 8px 0 0; font-size: 12px; color: rgba(255,255,255,0.9); line-height: 1.4;">
        Get <strong>unlimited everything</strong> + <strong>35K PULSE tokens</strong> + <strong>FREE lifetime access</strong> for just <strong>$4/month</strong>
      </p>
    </div>
    
    <button onclick="switchTab('settings')" class="submit-btn" style="width: 100%; background: white; color: #1e40af; font-weight: 700; padding: 12px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
      Join Legacy Founders →
    </button>
    
    <p style="margin: 8px 0 0; font-size: 10px; color: rgba(255,255,255,0.7); text-align: center;">
      💎 First 10,000 lock in $4/month + 35K PULSE tokens
    </p>
  `;
  
  document.body.appendChild(banner);
}

// Dismiss floating banner
function dismissUpgradeBanner() {
  const banner = document.getElementById('floatingUpgradeBanner');
  if (banner) {
    banner.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => banner.remove(), 300);
  }
  sessionStorage.setItem('upgradeBannerDismissed', 'true');
}

// Update search counter in UI
function updateSearchCounter() {
  const counter = document.getElementById('searchCounter');
  if (!counter) return;
  
  // Fetch fresh session data to get current count
  const session = JSON.parse(localStorage.getItem('darkwaveSession') || '{}');
  const tier = session.user?.subscriptionTier || 'trial';
  const monthlyCount = session.user?.monthlySearchCount || 0;
  
  // Hide counter for expired_trial and admin users
  if (tier === 'expired_trial' || session.user?.accessLevel === 'admin') {
    counter.style.display = 'none';
    return;
  }
  
  // Trial users have total limit (10 searches over 7 days)
  if (tier === 'trial') {
    const trialLimit = 10;
    const remaining = Math.max(0, trialLimit - monthlyCount);
    const isLow = remaining <= 2;
    const color = isLow ? '#ef4444' : '#fbbf24'; // Yellow/orange for trial
    
    counter.innerHTML = `<span style="color: ${color};">🎁 Trial: ${remaining}/${trialLimit} left</span>`;
    counter.style.display = 'inline-flex';
    
    // Show warning if 2 or less remain
    if (isLow && remaining > 0) {
      showSearchWarning(remaining);
    }
    return;
  }
  
  // Premium users get unlimited searches badge
  if (tier === 'premium') {
    counter.innerHTML = '<span style="color: #10b981;">∞ Unlimited</span>';
    counter.style.display = 'inline-flex';
    return;
  }
  
  // Base users have monthly limit (10 searches)
  if (tier === 'base') {
    const monthlyLimit = 10;
    const remaining = Math.max(0, monthlyLimit - monthlyCount);
    const isLow = remaining <= 2;
    const color = isLow ? '#ef4444' : '#60a5fa';
    
    counter.innerHTML = `<span style="color: ${color};">${remaining}/${monthlyLimit} searches left</span>`;
    counter.style.display = 'inline-flex';
    
    // Show warning if 2 or less remain
    if (isLow && remaining > 0) {
      showSearchWarning(remaining);
    }
    return;
  }
  
  // Fallback: hide counter
  counter.style.display = 'none';
}

// Show warning when running low on searches
function showSearchWarning(remaining) {
  const warning = document.getElementById('searchWarning');
  if (warning || sessionStorage.getItem('searchWarningShown')) return;
  
  const warningDiv = document.createElement('div');
  warningDiv.id = 'searchWarning';
  warningDiv.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    max-width: 400px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border: 2px solid #f87171;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4);
    z-index: 9999;
    animation: pulse 2s infinite;
  `;
  
  warningDiv.innerHTML = `
    <button onclick="this.parentElement.remove(); sessionStorage.setItem('searchWarningShown', 'true');" style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.2); border: none; color: white; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 16px; line-height: 1;">×</button>
    
    <div style="text-align: center;">
      <div style="font-size: 32px; margin-bottom: 8px;">⚠️</div>
      <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: white;">Only ${remaining} ${remaining === 1 ? 'Search' : 'Searches'} Left!</h3>
      <p style="margin: 8px 0 12px; font-size: 12px; color: rgba(255,255,255,0.9);">
        Upgrade to Premium for unlimited searches + V2 features
      </p>
      
      <button onclick="showUpgradeModal()" class="submit-btn" style="width: 100%; background: white; color: #dc2626; font-weight: 700; padding: 12px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px;">
        Upgrade Now →
      </button>
    </div>
  `;
  
  document.body.appendChild(warningDiv);
  sessionStorage.setItem('searchWarningShown', 'true');
}

// Show upgrade modal (main conversion point)
function showUpgradeModal(context = 'general') {
  const modal = document.createElement('div');
  modal.id = 'upgradeModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease-out;
    overflow-y: auto;
  `;
  
  // Different messaging based on context
  let headline = 'Become a Legacy Founder';
  let subheadline = 'Get unlimited access + 35K PULSE tokens for just $4/month';
  
  if (context === 'search_limit') {
    headline = '🚀 You\'ve Used All Your Searches!';
    subheadline = 'Upgrade now and never hit a limit again';
  } else if (context === 'v2_feature') {
    headline = '✨ V2 Features Are Premium Only';
    subheadline = 'Get instant access to category filters and more';
  } else if (context === 'knowledge_base') {
    headline = '📚 Knowledge Base Is Premium Only';
    subheadline = 'Learn crypto trading from scratch with 8 comprehensive chapters';
  }
  
  modal.innerHTML = `
    <div style="background: var(--bg-secondary); max-width: 600px; width: 100%; border-radius: 16px; border: 2px solid var(--accent-blue); box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3); position: relative; max-height: 90vh; overflow-y: auto; margin: auto;">
      
      <!-- Close Button -->
      <button onclick="closeUpgradeModal()" style="position: absolute; top: 16px; right: 16px; background: var(--bg-tertiary); border: 1px solid var(--border-color); color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 20px; line-height: 1; z-index: 1;">×</button>
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 24px 20px; text-align: center; border-radius: 14px 14px 0 0;">
        <div style="font-size: 40px; margin-bottom: 8px;">⚡</div>
        <h2 style="margin: 0 0 6px; font-size: 20px; font-weight: 700; color: white; line-height: 1.2;">${headline}</h2>
        <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.9); line-height: 1.3;">${subheadline}</p>
      </div>
      
      <!-- Comparison Table -->
      <div style="padding: 20px;">
        <div class="upgrade-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
          
          <!-- Trial Plan Column -->
          <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px;">
            <div style="text-align: center; margin-bottom: 12px;">
              <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 700; color: white;">Trial</h3>
              <p style="margin: 0; font-size: 20px; font-weight: 700; color: var(--accent-blue);">FREE<span style="font-size: 12px; font-weight: 400; color: #888;">/7 days</span></p>
            </div>
            
            <div style="font-size: 11px; line-height: 1.5; color: #ccc;">
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #10b981;">✓</span>
                <span><strong>10 searches</strong>/day</span>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #10b981;">✓</span>
                <span>Crypto Cat AI (basic)</span>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #10b981;">✓</span>
                <span>Interactive charts</span>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #10b981;">✓</span>
                <span>Glossary access</span>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px; opacity: 0.4;">
                <span style="color: #ef4444;">✗</span>
                <span>V2 category filters</span>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px; opacity: 0.4;">
                <span style="color: #ef4444;">✗</span>
                <span>Knowledge Base</span>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px; opacity: 0.4;">
                <span style="color: #ef4444;">✗</span>
                <span>Unlimited searches</span>
              </div>
            </div>
          </div>
          
          <!-- Premium Plan Column (HIGHLIGHTED) -->
          <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(30, 64, 175, 0.2) 100%); border: 2px solid var(--accent-blue); border-radius: 10px; padding: 16px; position: relative; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);">
            <div style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 3px 10px; border-radius: 10px; font-size: 9px; font-weight: 700; color: white; white-space: nowrap;">
              🔥 BEST VALUE
            </div>
            
            <div style="text-align: center; margin-bottom: 12px;">
              <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 700; color: white;">Legacy Founder</h3>
              <p style="margin: 0; font-size: 20px; font-weight: 700; color: var(--accent-blue);">$4<span style="font-size: 12px; font-weight: 400; color: #888;">/mo</span></p>
              <p style="margin: 4px 0 0; font-size: 9px; color: #10b981;">Lock in + 35K PULSE ⚡</p>
            </div>
            
            <div style="font-size: 11px; line-height: 1.5; color: #fff;">
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #10b981;">✓</span>
                <span><strong>Unlimited</strong> searches</span>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #10b981;">✓</span>
                <span>Full Crypto Cat AI</span>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #10b981;">✓</span>
                <span>Interactive charts</span>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #10b981;">✓</span>
                <span>Glossary access</span>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #10b981;">✓</span>
                <span><strong>V2 category filters</strong></span>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #10b981;">✓</span>
                <span><strong>Knowledge Base (8 chapters)</strong></span>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #10b981;">✓</span>
                <span><strong>Priority support</strong></span>
              </div>
            </div>
            
            <button onclick="window.location.href='/subscribe?tier=premium'" class="submit-btn" style="width: 100%; margin-top: 12px; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; font-weight: 700; padding: 12px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);">
              Upgrade to Premium →
            </button>
          </div>
        </div>
        
        <!-- Value Proposition -->
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 12px; text-align: center; margin-bottom: 12px;">
          <p style="margin: 0; font-size: 12px; color: #10b981; font-weight: 600; line-height: 1.4;">
            💰 Legacy Founder = Lifetime access + 35K PULSE tokens + $4 rate locked forever
          </p>
          <p style="margin: 6px 0 0; font-size: 10px; color: #888; line-height: 1.3;">
            V2 pricing jumps to $8/month on Dec 26. Prices rise to $20/month in future. Lock in $4 now, forever.
          </p>
        </div>
        
        <!-- Testimonial / Social Proof -->
        <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; text-align: center;">
          <p style="margin: 0; font-size: 10px; color: #888; line-height: 1.4;">
            ⭐⭐⭐⭐⭐ "Premium is absolutely worth it. The V2 filters alone save me hours of research." - DW
          </p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Close upgrade modal
function closeUpgradeModal() {
  const modal = document.getElementById('upgradeModal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.2s ease-in';
    setTimeout(() => modal.remove(), 200);
  }
}

// Check if user can perform search
function canPerformSearch() {
  if (userTier === 'premium' || searchLimit === -1) {
    return true;
  }
  
  return searchesRemaining < searchLimit;
}

// Track search usage
function trackSearch() {
  if (userTier === 'premium' || searchLimit === -1) {
    return; // Unlimited, no tracking needed
  }
  
  searchesRemaining++;
  updateSearchCounter();
  
  // Save to server
  fetch('/api/user/track-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }).catch(err => console.error('Failed to track search:', err));
}

// Show search limit reached modal
function showSearchLimitModal() {
  showUpgradeModal('search_limit');
}

// Check V2 feature access (for category filters)
function checkV2Access(featureName, callback) {
  const user = JSON.parse(localStorage.getItem('dwp_user') || '{}');
  const tier = user.subscriptionTier || 'trial';
  const accessLevel = user.accessLevel || 'user';
  const isWhitelisted = user.isWhitelisted || false;
  
  // Admin ALWAYS has access, whitelisted users get access, Premium users get access
  if (accessLevel === 'admin' || isWhitelisted || tier === 'premium') {
    console.log(`✅ V2 Access granted for ${featureName}:`, { accessLevel, isWhitelisted, tier });
    callback();
  } else {
    console.log(`🔒 V2 Access denied for ${featureName}:`, { accessLevel, isWhitelisted, tier });
    showUpgradeModal('v2_feature');
  }
}

// Lock V2 features for Base users
function lockV2Feature(featureName) {
  showUpgradeModal('v2_feature');
}

// Lock Knowledge Base for Base users
function lockKnowledgeBase() {
  showUpgradeModal('knowledge_base');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  /* Mobile responsive grid */
  @media (max-width: 500px) {
    .upgrade-grid {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: translateX(-50%) scale(1); }
    50% { transform: translateX(-50%) scale(1.02); }
  }
`;
document.head.appendChild(style);

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUpgradeSystem);
} else {
  initUpgradeSystem();
}

// Expose functions to global scope for HTML onclick handlers
window.checkV2Access = checkV2Access;
window.showUpgradeModal = showUpgradeModal;
window.lockV2Feature = lockV2Feature;
window.lockKnowledgeBase = lockKnowledgeBase;

console.log('✅ Upgrade System loaded - Premium conversion ready');
