// DarkWave-V2 Mini App JavaScript

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
  userId: tg?.initDataUnsafe?.user?.id || 'demo-user',
  settings: {
    alerts: false,
    autoMonitor: false,
    sniping: false,
    autoExecute: false,
    scope: 'both',
    exchange: 'dexscreener'
  }
};

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
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  
  // Update tab panes
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === tabName);
  });
  
  // Load tab content
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

// Search Functionality
searchBtn.addEventListener('click', () => performSearch());
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performSearch();
});

// Quick pick buttons
document.querySelectorAll('.quick-pick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const ticker = btn.dataset.ticker;
    searchInput.value = ticker;
    performSearch();
    if (tg) tg.HapticFeedback?.impactOccurred('medium');
  });
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
    displayAnalysis(data);
  } catch (error) {
    showToast('Error fetching analysis. Please try again.');
    console.error('Search error:', error);
  } finally {
    hideLoading();
  }
}

function displayAnalysis(data) {
  const card = document.createElement('div');
  card.className = 'analysis-card';
  
  const signal = data.recommendation || 'HOLD';
  const signalClass = signal.includes('BUY') ? 'buy' : signal.includes('SELL') ? 'sell' : 'hold';
  const priceChange = data.priceChange || 0;
  const priceChangeClass = priceChange >= 0 ? 'positive' : 'negative';
  
  card.innerHTML = `
    <div class="analysis-header">
      <div class="ticker-name">${data.ticker}</div>
      <div class="price-info">
        <div class="price-value">$${data.price?.toFixed(2) || '0.00'}</div>
        <div class="price-change ${priceChangeClass}">
          ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%
        </div>
      </div>
    </div>
    
    <div class="signal-badge ${signalClass}">
      ${signal === 'BUY' ? '🟢' : signal === 'SELL' ? '🔴' : '🟡'} ${signal}
    </div>
    
    <div class="indicators-grid">
      <div class="indicator-item">
        <div class="indicator-label">RSI</div>
        <div class="indicator-value">${data.rsi?.toFixed(1) || 'N/A'}</div>
      </div>
      <div class="indicator-item">
        <div class="indicator-label">MACD</div>
        <div class="indicator-value">${data.macd?.toFixed(2) || 'N/A'}</div>
      </div>
      <div class="indicator-item">
        <div class="indicator-label">Volume</div>
        <div class="indicator-value">${formatVolume(data.volume)}</div>
      </div>
      <div class="indicator-item">
        <div class="indicator-label">24h High</div>
        <div class="indicator-value">$${data.high24h?.toFixed(2) || 'N/A'}</div>
      </div>
    </div>
    
    <div class="action-buttons">
      <button class="action-btn" onclick="setAlert('${data.ticker}')">🔔 Alert</button>
      <button class="action-btn" onclick="createOrder('${data.ticker}')">💰 Trade</button>
      <button class="action-btn" onclick="addToHoldings('${data.ticker}')">⭐ Hold</button>
    </div>
  `;
  
  analysisResult.innerHTML = '';
  analysisResult.appendChild(card);
}

function formatVolume(volume) {
  if (!volume) return 'N/A';
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
  return `$${volume.toFixed(2)}`;
}

// Holdings
async function loadHoldings() {
  const holdingsList = document.getElementById('holdingsList');
  holdingsList.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  
  try {
    const response = await fetch(`${API_BASE}/api/holdings?userId=${state.userId}`);
    const holdings = await response.json();
    
    if (holdings.length === 0) {
      holdingsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⭐</div>
          <p>No holdings yet</p>
          <button class="action-btn" onclick="switchTab('analysis')">+ Add Ticker</button>
        </div>
      `;
    } else {
      holdingsList.innerHTML = holdings.map(h => `
        <div class="holding-card">
          <div>
            <div style="font-weight:700; font-size:1.2rem;">${h.ticker}</div>
            <div style="color:var(--text-secondary); font-size:0.9rem;">$${h.price?.toFixed(2)}</div>
          </div>
          <div style="text-align:right;">
            <div class="price-change ${h.change >= 0 ? 'positive' : 'negative'}">
              ${h.change >= 0 ? '+' : ''}${h.change.toFixed(2)}%
            </div>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    showToast('Error loading holdings');
    console.error('Holdings error:', error);
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
    const connectBtn = document.getElementById('connectWalletBtn');
    
    if (wallet.connected) {
      walletStatus.textContent = `${wallet.address.slice(0,6)}...${wallet.address.slice(-4)}`;
      walletStatus.className = 'status-badge connected';
      walletBalance.classList.remove('hidden');
      document.getElementById('solBalance').textContent = wallet.balance.toFixed(4);
      connectBtn.textContent = 'Disconnect Wallet';
    } else {
      walletStatus.textContent = 'Not Connected';
      walletStatus.className = 'status-badge disconnected';
      walletBalance.classList.add('hidden');
      connectBtn.textContent = 'Connect Phantom Wallet';
    }
  } catch (error) {
    console.error('Wallet error:', error);
  }
}

document.getElementById('connectWalletBtn')?.addEventListener('click', async () => {
  const input = prompt('Enter your Phantom wallet public address:');
  if (!input) return;
  
  try {
    await fetch(`${API_BASE}/api/wallet/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: input, userId: state.userId })
    });
    showToast('Wallet connected!');
    if (tg) tg.HapticFeedback?.notificationOccurred('success');
    await loadWallet();
  } catch (error) {
    showToast('Error connecting wallet');
  }
});

// Settings
async function loadSettings() {
  // Load current settings from backend
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
  } catch (error) {
    console.error('Settings load error:', error);
  }
}

// Toggle event listeners
['toggleAlerts', 'toggleAutoMonitor', 'toggleSniping', 'toggleAutoExecute'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', async (e) => {
    const setting = id.replace('toggle', '').charAt(0).toLowerCase() + id.replace('toggle', '').slice(1);
    await updateSetting(setting, e.target.checked);
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  });
});

// Scope buttons
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

// Refresh button
document.getElementById('refreshBtn')?.addEventListener('click', () => {
  if (state.currentTab === 'analysis' && searchInput.value) {
    performSearch();
  } else {
    loadTabContent(state.currentTab);
  }
  if (tg) tg.HapticFeedback?.impactOccurred('light');
});

// Settings button
document.getElementById('settingsBtn')?.addEventListener('click', () => {
  switchTab('settings');
  if (tg) tg.HapticFeedback?.impactOccurred('light');
});

// Initialize
console.log('🌊 DarkWave-V2 Mini App loaded');
if (tg) {
  console.log('Telegram WebApp initialized', tg.initDataUnsafe);
}
