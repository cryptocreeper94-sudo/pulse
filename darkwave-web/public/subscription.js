// DarkWave Pulse Subscription & Billing System

// Plan IDs from database
const PLAN_IDS = {
  base: 1,
  premium: 2
};

// Load and display subscription status
async function loadSubscriptionStatus() {
  try {
    const currentTierDisplay = document.getElementById('currentTierDisplay');
    const subscriptionDetails = document.getElementById('subscriptionDetails');
    
    if (!currentTierDisplay || !subscriptionDetails) return;
    
    currentTierDisplay.innerHTML = 'Loading...';
    subscriptionDetails.innerHTML = 'Fetching latest subscription data...';
    
    const validateResponse = await fetch('/api/auth/validate', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!validateResponse.ok) {
      currentTierDisplay.innerHTML = '❌ ERROR';
      subscriptionDetails.innerHTML = 'Failed to load subscription data';
      return;
    }
    
    const result = await validateResponse.json();
    
    if (!result.valid || !result.user) {
      currentTierDisplay.innerHTML = '❌ NOT LOGGED IN';
      subscriptionDetails.innerHTML = 'Please log in to view subscription status';
      return;
    }
    
    const session = JSON.parse(localStorage.getItem('darkwaveSession') || '{}');
    session.user = result.user;
    localStorage.setItem('darkwaveSession', JSON.stringify(session));
    
    const tier = result.user.subscriptionTier || 'trial';
    const monthlyCount = result.user.monthlySearchCount || 0;
    const monthlyLimit = result.user.monthlySearchLimit || 10;
    const cancelButton = document.getElementById('cancelSubButton');
    
    if (tier === 'trial') {
      currentTierDisplay.innerHTML = '🎁 FREE TRIAL';
      currentTierDisplay.style.color = '#fbbf24';
      subscriptionDetails.innerHTML = `${Math.max(0, 10 - monthlyCount)}/10 searches remaining • Upgrade to continue after trial`;
      if (cancelButton) cancelButton.style.display = 'none';
    } else if (tier === 'base') {
      currentTierDisplay.innerHTML = '💎 LEGACY FOUNDER - BETA V1';
      currentTierDisplay.style.color = '#10b981';
      subscriptionDetails.innerHTML = `∞ Unlimited searches • $4/month • 35,000 PULSE tokens Dec 25!`;
      if (cancelButton) cancelButton.style.display = 'block';
    } else if (tier === 'premium') {
      currentTierDisplay.innerHTML = '💎 LEGACY FOUNDER - BETA V1';
      currentTierDisplay.style.color = '#10b981';
      subscriptionDetails.innerHTML = '∞ Unlimited searches • $4/month • 35,000 PULSE tokens Dec 25!';
      if (cancelButton) cancelButton.style.display = 'block';
    } else if (tier === 'expired_trial') {
      currentTierDisplay.innerHTML = '❌ TRIAL EXPIRED';
      currentTierDisplay.style.color = '#ef4444';
      subscriptionDetails.innerHTML = 'Subscribe to continue using DarkWave Pulse';
      if (cancelButton) cancelButton.style.display = 'none';
    } else if (tier === 'admin') {
      currentTierDisplay.innerHTML = '👑 ADMIN ACCESS';
      currentTierDisplay.style.color = '#a855f7';
      subscriptionDetails.innerHTML = 'Full system access with unlimited everything';
      if (cancelButton) cancelButton.style.display = 'none';
    }
  } catch (error) {
    console.error('Failed to load subscription status:', error);
    const currentTierDisplay = document.getElementById('currentTierDisplay');
    const subscriptionDetails = document.getElementById('subscriptionDetails');
    if (currentTierDisplay) currentTierDisplay.innerHTML = '❌ ERROR';
    if (subscriptionDetails) subscriptionDetails.innerHTML = 'Failed to fetch subscription data';
  }
}

// NEW: Base Subscription checkout ($4/month recurring)
async function upgradeBase() {
  try {
    console.log('🔄 Starting Base Subscription checkout...');
    
    const user = JSON.parse(localStorage.getItem('dwp_user') || '{}');
    const userId = user.id;
    
    if (!userId) {
      alert('Please log in to subscribe');
      window.location.href = '/';
      return;
    }
    
    const confirmMessage = '💳 Base Subscription\n\n$4/month recurring:\n\n✅ Unlimited searches\n✅ All premium features\n\n❌ No PULSE token rewards\n❌ No lifetime access (recurring monthly)\n\nContinue?';
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    showCheckoutLoading();
    
    const response = await fetch('/api/payments/stripe/create-base', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId })
    });
    
    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📦 Response data:', data);
    hideCheckoutLoading();
    
    if (data.success && data.url) {
      console.log('✅ Opening Stripe checkout in new window:', data.url);
      const checkoutWindow = window.open(data.url, '_blank');
      if (!checkoutWindow) {
        alert('Popup blocked! Please allow popups for DarkWave Pulse to complete checkout.');
      } else {
        checkoutWindow.focus();
      }
      return;
    } else {
      console.log('❌ Checkout failed:', data.error);
      alert(data.error || 'Failed to create checkout session');
    }
  } catch (error) {
    hideCheckoutLoading();
    console.error('Stripe checkout error:', error);
    alert('Failed to start checkout. Please try again.');
  }
}

// NEW: Legacy Founder 6-Month checkout ($24 one-time)
async function upgradeLegacyFounder() {
  try {
    console.log('🔄 Starting Legacy Founder 6-Month checkout...');
    
    const user = JSON.parse(localStorage.getItem('dwp_user') || '{}');
    const userId = user.id;
    
    if (!userId) {
      alert('Please log in to subscribe');
      window.location.href = '/';
      return;
    }
    
    const confirmMessage = '💎 Become a Legacy Founder?\n\n$24 one-time payment for:\n\n✅ 6 months guaranteed access\n✅ FREE lifetime access after\n✅ 35,000 PULSE tokens (Dec 25)\n✅ Unlimited searches\n✅ All premium features\n\n⏰ Offer closes Dec 25, 2025!';
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    showCheckoutLoading();
    
    const response = await fetch('/api/payments/stripe/create-legacy-founder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId })
    });
    
    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📦 Response data:', data);
    hideCheckoutLoading();
    
    if (data.success && data.url) {
      console.log('✅ Opening Stripe checkout in new window:', data.url);
      const checkoutWindow = window.open(data.url, '_blank');
      if (!checkoutWindow) {
        alert('Popup blocked! Please allow popups for DarkWave Pulse to complete checkout.');
      } else {
        checkoutWindow.focus();
      }
      return;
    } else {
      alert(data.error || 'Failed to create checkout session');
    }
  } catch (error) {
    hideCheckoutLoading();
    console.error('Stripe checkout error:', error);
    alert('Failed to start checkout. Please try again.');
  }
}

// NEW: Annual Subscription checkout ($80/year)
async function upgradeAnnual() {
  try {
    console.log('🔄 Starting Annual Subscription checkout...');
    
    const user = JSON.parse(localStorage.getItem('dwp_user') || '{}');
    const userId = user.id;
    
    if (!userId) {
      alert('Please log in to subscribe');
      window.location.href = '/';
      return;
    }
    
    const confirmMessage = '💳 Annual Subscription\n\n$80/year recurring:\n\n✅ Unlimited searches\n✅ All premium features\n✅ Save $16/year (2 months free)\n\n❌ No PULSE token rewards\n\nContinue?';
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    showCheckoutLoading();
    
    const response = await fetch('/api/payments/stripe/create-annual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId })
    });
    
    const data = await response.json();
    hideCheckoutLoading();
    
    if (data.success && data.url) {
      console.log('✅ Opening Stripe checkout in new window:', data.url);
      const checkoutWindow = window.open(data.url, '_blank');
      if (!checkoutWindow) {
        alert('Popup blocked! Please allow popups for DarkWave Pulse to complete checkout.');
      } else {
        checkoutWindow.focus();
      }
      return;
    } else {
      alert(data.error || 'Failed to create checkout session');
    }
  } catch (error) {
    hideCheckoutLoading();
    console.error('Stripe checkout error:', error);
    alert('Failed to start checkout. Please try again.');
  }
}

// Helper functions for loading UI
function showCheckoutLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'stripeCheckoutLoading';
  loadingDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  `;
  loadingDiv.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 20px;">⚡</div>
    <div style="color: white; font-size: 18px; font-weight: 700; margin-bottom: 10px;">Redirecting to Stripe...</div>
    <div style="color: #888; font-size: 12px;">Secure checkout powered by Stripe</div>
  `;
  document.body.appendChild(loadingDiv);
}

function hideCheckoutLoading() {
  const loadingDiv = document.getElementById('stripeCheckoutLoading');
  if (loadingDiv) loadingDiv.remove();
}

// OLD: Trigger Stripe checkout for selected tier (DEPRECATED - keeping for backward compatibility)
async function upgradeToStripe(tier) {
  try {
    console.log(`🔄 Starting Stripe checkout for ${tier} plan...`);
    
    const planId = tier === 'premium' ? PLAN_IDS.premium : PLAN_IDS.base;
    const session = JSON.parse(localStorage.getItem('darkwaveSession') || '{}');
    const userId = session.user?.id;
    
    if (!userId) {
      alert('Please log in to subscribe');
      return;
    }
    
    const currentTier = session.user?.subscriptionTier || 'trial';
    if (tier === 'base' && (currentTier === 'premium' || currentTier === 'base')) {
      alert('You are already subscribed to this tier or higher');
      return;
    }
    
    if (tier === 'premium' && currentTier === 'premium') {
      alert('You already have Premium access!');
      return;
    }
    
    const confirmMessage = 'Become a Legacy Founder for $4/month?\n\n✅ Unlimited searches\n✅ All premium features\n✅ Knowledge Base + Glossary\n✅ Market cycle predictions\n✅ 35,000 PULSE tokens\n✅ FREE lifetime access after 6 months\n✅ $4 rate locked FOREVER';
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'stripeCheckoutLoading';
    loadingDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    `;
    loadingDiv.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">⚡</div>
      <div style="color: white; font-size: 18px; font-weight: 700; margin-bottom: 10px;">Redirecting to Stripe...</div>
      <div style="color: #888; font-size: 12px;">Secure checkout powered by Stripe</div>
    `;
    document.body.appendChild(loadingDiv);
    
    const response = await fetch('/api/payments/stripe/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId,
        planId,
        userEmail: session.user?.email
      })
    });
    
    const data = await response.json();
    
    loadingDiv.remove();
    
    if (data.success && data.url) {
      console.log('✅ Stripe session created, redirecting...');
      window.location.href = data.url;
    } else {
      console.error('❌ Stripe checkout failed:', data.error);
      alert(`Checkout failed: ${data.error || 'Unknown error'}. Please try again or contact support.`);
    }
  } catch (error) {
    console.error('❌ Upgrade error:', error);
    document.getElementById('stripeCheckoutLoading')?.remove();
    alert('Failed to start checkout. Please check your connection and try again.');
  }
}

// Handle payment success/cancel redirects
function handlePaymentRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');
  
  if (paymentStatus === 'success') {
    const successModal = document.createElement('div');
    successModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-out;
    `;
    successModal.innerHTML = `
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: 2px solid #34d399; border-radius: 16px; padding: 32px; max-width: 400px; text-align: center; box-shadow: 0 20px 60px rgba(16, 185, 129, 0.4);">
        <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
        <h2 style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 12px;">Payment Successful!</h2>
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 24px;">
          Your subscription is now active. Welcome to the DarkWave family!
        </p>
        <button onclick="this.parentElement.parentElement.remove(); window.location.href = '/app';" class="submit-btn" style="background: white; color: #059669; font-weight: 700; padding: 14px 28px; border-radius: 8px; border: none; cursor: pointer; font-size: 16px;">
          Start Using DarkWave →
        </button>
      </div>
    `;
    document.body.appendChild(successModal);
    
    setTimeout(() => {
      window.history.replaceState({}, document.title, '/app');
    }, 500);
  } else if (paymentStatus === 'canceled') {
    const cancelModal = document.createElement('div');
    cancelModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-out;
    `;
    cancelModal.innerHTML = `
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border: 2px solid #f87171; border-radius: 16px; padding: 32px; max-width: 400px; text-align: center; box-shadow: 0 20px 60px rgba(239, 68, 68, 0.4);">
        <div style="font-size: 64px; margin-bottom: 16px;">❌</div>
        <h2 style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 12px;">Payment Canceled</h2>
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 24px;">
          No worries! You can try again anytime from Settings → Subscription.
        </p>
        <button onclick="this.parentElement.parentElement.remove(); window.location.href = '/app';" class="submit-btn" style="background: white; color: #dc2626; font-weight: 700; padding: 14px 28px; border-radius: 8px; border: none; cursor: pointer; font-size: 16px;">
          Back to App
        </button>
      </div>
    `;
    document.body.appendChild(cancelModal);
    
    setTimeout(() => {
      window.history.replaceState({}, document.title, '/app');
    }, 500);
  }
}

// Cancel active subscription
async function cancelSubscription() {
  try {
    const session = JSON.parse(localStorage.getItem('darkwaveSession') || '{}');
    const tier = session.user?.subscriptionTier || 'trial';
    
    if (tier === 'trial' || tier === 'expired_trial' || tier === 'admin') {
      alert('You do not have an active subscription to cancel');
      return;
    }
    
    const confirmMessage = `Are you sure you want to cancel your ${tier.toUpperCase()} subscription?\n\nYou'll keep access until the end of your billing period, then your account will revert to expired trial status.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'cancelLoading';
    loadingDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    `;
    loadingDiv.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
      <div style="color: white; font-size: 18px; font-weight: 700;">Canceling subscription...</div>
    `;
    document.body.appendChild(loadingDiv);
    
    const response = await fetch('/api/payments/stripe/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    loadingDiv.remove();
    
    if (data.success) {
      alert('✅ Subscription canceled.\n\nYou\'ll keep access until the end of your billing period.');
      loadSubscriptionStatus();
    } else {
      alert(`❌ Cancellation failed: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Cancel error:', error);
    document.getElementById('cancelLoading')?.remove();
    alert('Failed to cancel subscription. Please try again.');
  }
}

// Coinbase Commerce Crypto Payment Functions
async function upgradeBaseCrypto() {
  try {
    console.log('🔄 Starting Base Subscription crypto checkout...');
    
    const user = JSON.parse(localStorage.getItem('dwp_user') || '{}');
    const userId = user.id;
    
    if (!userId) {
      alert('Please log in to subscribe');
      window.location.href = '/';
      return;
    }
    
    const confirmMessage = '₿ Pay with Crypto\n\n$4/month recurring subscription\n\nAccepted cryptocurrencies:\n• Bitcoin (BTC)\n• Ethereum (ETH)\n• Solana (SOL)\n• USDC/USDT stablecoins\n\nContinue to Coinbase Commerce?';
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    showCryptoLoading();
    
    const response = await fetch('/api/payments/coinbase/create-charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, planId: 1 })
    });
    
    const data = await response.json();
    hideCryptoLoading();
    
    if (data.success && data.hostedUrl) {
      console.log('✅ Opening Coinbase Commerce checkout:', data.hostedUrl);
      const checkoutWindow = window.open(data.hostedUrl, '_blank');
      if (!checkoutWindow) {
        alert('Popup blocked! Please allow popups for DarkWave Pulse to complete checkout.');
      } else {
        checkoutWindow.focus();
      }
    } else {
      alert(data.error || 'Failed to create crypto checkout');
    }
  } catch (error) {
    hideCryptoLoading();
    console.error('Crypto checkout error:', error);
    alert('Failed to start crypto checkout. Please try again.');
  }
}

async function upgradeLegacyFounderCrypto() {
  try {
    console.log('🔄 Starting Legacy Founder crypto checkout...');
    
    const user = JSON.parse(localStorage.getItem('dwp_user') || '{}');
    const userId = user.id;
    
    if (!userId) {
      alert('Please log in to subscribe');
      window.location.href = '/';
      return;
    }
    
    const confirmMessage = '₿ Pay $24 with Crypto\n\nLegacy Founder (6 months + lifetime):\n• 35,000 PULSE tokens (Dec 25)\n• FREE lifetime access after 6 months\n• All premium features\n\nAccepted: BTC, ETH, SOL, USDC, USDT\n\nContinue?';
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    showCryptoLoading();
    
    const response = await fetch('/api/payments/coinbase/create-charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, planId: 2 })
    });
    
    const data = await response.json();
    hideCryptoLoading();
    
    if (data.success && data.hostedUrl) {
      console.log('✅ Opening Coinbase Commerce checkout:', data.hostedUrl);
      const checkoutWindow = window.open(data.hostedUrl, '_blank');
      if (!checkoutWindow) {
        alert('Popup blocked! Please allow popups for DarkWave Pulse to complete checkout.');
      } else {
        checkoutWindow.focus();
      }
    } else {
      alert(data.error || 'Failed to create crypto checkout');
    }
  } catch (error) {
    hideCryptoLoading();
    console.error('Crypto checkout error:', error);
    alert('Failed to start crypto checkout. Please try again.');
  }
}

async function upgradeAnnualCrypto() {
  try {
    console.log('🔄 Starting Annual crypto checkout...');
    
    const user = JSON.parse(localStorage.getItem('dwp_user') || '{}');
    const userId = user.id;
    
    if (!userId) {
      alert('Please log in to subscribe');
      window.location.href = '/';
      return;
    }
    
    const confirmMessage = '₿ Pay $80/year with Crypto\n\nAnnual Subscription:\n• Save $16/year (2 months free)\n• All premium features\n• Unlimited searches\n\nAccepted: BTC, ETH, SOL, USDC, USDT\n\nContinue?';
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    showCryptoLoading();
    
    const response = await fetch('/api/payments/coinbase/create-charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, planId: 3 })
    });
    
    const data = await response.json();
    hideCryptoLoading();
    
    if (data.success && data.hostedUrl) {
      console.log('✅ Opening Coinbase Commerce checkout:', data.hostedUrl);
      const checkoutWindow = window.open(data.hostedUrl, '_blank');
      if (!checkoutWindow) {
        alert('Popup blocked! Please allow popups for DarkWave Pulse to complete checkout.');
      } else {
        checkoutWindow.focus();
      }
    } else {
      alert(data.error || 'Failed to create crypto checkout');
    }
  } catch (error) {
    hideCryptoLoading();
    console.error('Crypto checkout error:', error);
    alert('Failed to start crypto checkout. Please try again.');
  }
}

function showCryptoLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'cryptoCheckoutLoading';
  loadingDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  `;
  loadingDiv.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 20px;">₿</div>
    <div style="color: white; font-size: 18px; font-weight: 700; margin-bottom: 10px;">Redirecting to Coinbase Commerce...</div>
    <div style="color: #888; font-size: 12px;">Pay with BTC, ETH, SOL, USDC, or USDT</div>
  `;
  document.body.appendChild(loadingDiv);
}

function hideCryptoLoading() {
  document.getElementById('cryptoCheckoutLoading')?.remove();
}

// Initialize subscription system on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSubscriptionStatus();
  handlePaymentRedirect();
  
  const settingsTab = document.querySelector('[data-tab="settings"]');
  if (settingsTab) {
    settingsTab.addEventListener('click', () => {
      setTimeout(loadSubscriptionStatus, 100);
    });
  }
});

console.log('✅ Subscription System loaded - Stripe & Coinbase Commerce ready');
