// V2 Feature Lock System - Controls locked features until V2 launch (Feb 14)
console.log('✅ V2 Feature Lock system loaded');

// Feature lock configuration
const V2_FEATURES = {
  'avatar-king': {
    name: 'Agent Builder',
    launchDate: '2026-02-14',
    icon: '👤',
    description: 'Choose your AI agent'
  },
  'nft-collection': {
    name: 'NFT Collection',
    launchDate: '2026-02-14',
    icon: '🎨',
    description: 'Build your own NFT avatar'
  }
};

// Check if feature is locked
function isFeatureLocked(featureId) {
  // Admin always has access
  if (window.currentSession?.accessLevel === 'admin') {
    return false;
  }
  
  // Check if we're testing (uncomment to unlock all features locally)
  // return false;
  
  const feature = V2_FEATURES[featureId];
  if (!feature) return false;
  
  const launchDate = new Date(feature.launchDate);
  const now = new Date();
  return now < launchDate;
}

// Get days until launch
function getDaysUntilLaunch(launchDate) {
  const launch = new Date(launchDate);
  const now = new Date();
  const diff = launch - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

// Show V2 lock modal
function showV2LockModal(featureId) {
  const feature = V2_FEATURES[featureId];
  if (!feature) return;
  
  const daysLeft = getDaysUntilLaunch(feature.launchDate);
  
  // Create lock modal
  const lockModal = document.createElement('div');
  lockModal.className = 'v2-lock-modal';
  lockModal.innerHTML = `
    <div class="v2-lock-content">
      <button class="v2-lock-close" onclick="this.closest('.v2-lock-modal').remove()">×</button>
      <div class="v2-lock-header">
        <div class="v2-lock-icon">🔒</div>
        <h2>Coming in V2</h2>
      </div>
      <div class="v2-lock-body">
        <p class="v2-feature-name">${feature.icon} ${feature.name}</p>
        <p class="v2-lock-description">${feature.description}</p>
        <div class="v2-countdown">
          <div class="countdown-number">${daysLeft}</div>
          <div class="countdown-label">days until launch</div>
        </div>
        <p class="v2-launch-date">February 14, 2026</p>
      </div>
      <div class="v2-lock-footer">
        <p style="font-size: 12px; color: rgba(255,255,255,0.6); margin: 0;">V2 features will be fully accessible to all users</p>
      </div>
    </div>
  `;
  
  lockModal.addEventListener('click', (e) => {
    if (e.target === lockModal) {
      lockModal.remove();
    }
  });
  
  document.body.appendChild(lockModal);
  console.log(`🔒 V2 Lock modal shown for ${feature.name}`);
}

// Toggle V2 feature lock (admin only)
function toggleV2Feature(featureId) {
  // Check admin status
  if (window.currentSession?.accessLevel !== 'admin') {
    alert('Admin access required');
    return;
  }
  
  const feature = V2_FEATURES[featureId];
  if (!feature) return;
  
  // Get current lock status from localStorage
  const lockedFeaturesKey = 'v2_locked_features';
  let lockedFeatures = JSON.parse(localStorage.getItem(lockedFeaturesKey) || '{}');
  
  // Toggle the lock
  lockedFeatures[featureId] = !lockedFeatures[featureId];
  localStorage.setItem(lockedFeaturesKey, JSON.stringify(lockedFeatures));
  
  // Update UI
  const statusEl = document.getElementById(featureId.replace('-', '') + 'Status');
  if (statusEl) {
    statusEl.textContent = lockedFeatures[featureId] ? 'LOCKED' : 'UNLOCKED';
    statusEl.style.color = lockedFeatures[featureId] ? '#10b981' : '#fbbf24';
  }
  
  console.log(`🔐 V2 Feature ${featureId} toggled: ${lockedFeatures[featureId] ? 'LOCKED' : 'UNLOCKED'}`);
}

// Check if feature is locked - UPDATED to check admin override
function isFeatureLocked(featureId) {
  // Admin always has access
  if (window.currentSession?.accessLevel === 'admin') {
    return false;
  }
  
  // Check if admin has unlocked for testing
  const lockedFeaturesKey = 'v2_locked_features';
  const lockedFeatures = JSON.parse(localStorage.getItem(lockedFeaturesKey) || '{}');
  if (lockedFeatures[featureId] === false) {
    // Admin has unlocked this for testing
    return false;
  }
  
  // Check launch date
  const feature = V2_FEATURES[featureId];
  if (!feature) return false;
  
  const launchDate = new Date(feature.launchDate);
  const now = new Date();
  return now < launchDate;
}

// Expose globally
window.V2_FEATURES = V2_FEATURES;
window.isFeatureLocked = isFeatureLocked;
window.getDaysUntilLaunch = getDaysUntilLaunch;
window.showV2LockModal = showV2LockModal;
window.toggleV2Feature = toggleV2Feature;
