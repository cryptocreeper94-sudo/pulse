// DarkWave-V2 Mini App JavaScript - Complete Edition with ALL Features

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
  currentAnalysis: null
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
  }
}

// Search Functionality
searchBtn.addEventListener('click', () => performSearch());
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performSearch();
});

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
    if (data.error) {
      showToast(data.error);
      hideLoading();
      return;
    }
    
    state.currentAnalysis = data;
    displayAnalysis(data);
    
    // Load chart in background
    loadChart(query);
  } catch (error) {
    showToast('Error fetching analysis. Please try again.');
    console.error('Search error:', error);
  } finally {
    hideLoading();
  }
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
          <div class="indicator-label">RSI (14)</div>
          <div class="indicator-value" style="color: ${data.rsi > 70 ? '#E63946' : data.rsi < 30 ? '#4ADE80' : '#fff'}">${data.rsi?.toFixed(1) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">MACD</div>
          <div class="indicator-value">${data.macd?.value?.toFixed(2) || 'N/A'}</div>
          <div style="font-size:0.7rem; color: var(--text-secondary);">Signal: ${data.macd?.signal?.toFixed(2) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">24h High/Low</div>
          <div class="indicator-value" style="font-size: 0.85rem;">
            $${data.high24h?.toFixed(2) || 'N/A'}<br>
            $${data.low24h?.toFixed(2) || 'N/A'}
          </div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">Volatility</div>
          <div class="indicator-value">${data.volatility?.toFixed(2) || 'N/A'}%</div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 20px;">
      <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">📈 MOVING AVERAGES</h3>
      <div class="indicators-grid">
        <div class="indicator-item">
          <div class="indicator-label">EMA 50</div>
          <div class="indicator-value">$${data.ema50?.toFixed(2) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">EMA 200</div>
          <div class="indicator-value">$${data.ema200?.toFixed(2) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">SMA 50</div>
          <div class="indicator-value">$${data.sma50?.toFixed(2) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">SMA 200</div>
          <div class="indicator-value">$${data.sma200?.toFixed(2) || 'N/A'}</div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 20px;">
      <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">💎 ADVANCED METRICS</h3>
      <div class="indicators-grid">
        <div class="indicator-item">
          <div class="indicator-label">Volume Delta</div>
          <div class="indicator-value" style="color: ${data.volumeDelta?.delta >= 0 ? '#4ADE80' : '#E63946'}">
            ${data.volumeDelta?.delta >= 0 ? '+' : ''}${formatVolume(data.volumeDelta?.delta)}
          </div>
          <div style="font-size:0.7rem; color: var(--text-secondary);">
            Buy: ${formatVolume(data.volumeDelta?.buyVolume)}<br>
            Sell: ${formatVolume(data.volumeDelta?.sellVolume)}
          </div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">Buy/Sell Ratio</div>
          <div class="indicator-value" style="color: ${data.volumeDelta?.buySellRatio >= 1 ? '#4ADE80' : '#E63946'}">
            ${data.volumeDelta?.buySellRatio?.toFixed(2) || 'N/A'}
          </div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">Spike Score</div>
          <div class="indicator-value" style="color: ${data.spikeScore?.score > 70 ? '#4ADE80' : data.spikeScore?.score > 40 ? '#F59E0B' : '#E63946'}">
            ${data.spikeScore?.score?.toFixed(1) || 'N/A'}/100
          </div>
          <div style="font-size:0.7rem; color: var(--text-secondary);">${data.spikeScore?.signal || 'NO_SIGNAL'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">Volume</div>
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
          <div class="indicator-label">Support</div>
          <div class="indicator-value" style="color: #4ADE80;">$${data.support?.toFixed(2) || 'N/A'}</div>
        </div>
        <div class="indicator-item">
          <div class="indicator-label">Resistance</div>
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

async function loadChart(ticker) {
  try {
    const response = await fetch(`${API_BASE}/api/chart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, userId: state.userId })
    });
    
    const data = await response.json();
    const chartContainer = document.getElementById('chartContainer');
    
    if (data.success && data.chartUrl && chartContainer) {
      chartContainer.innerHTML = `<img src="${data.chartUrl}" style="width: 100%; border-radius: 8px;" alt="Price Chart" />`;
    } else {
      chartContainer.innerHTML = '<div style="padding: 20px; color: var(--text-secondary);">Chart unavailable</div>';
    }
  } catch (error) {
    console.error('Chart error:', error);
  }
}

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
    const response = await fetch(`${API_BASE}/api/holdings?userId=${state.userId}`);
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
      headers: { 'Content-Type': 'application/json' },
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
    const walletInputSection = document.getElementById('walletInputSection');
    const walletDisconnectSection = document.getElementById('walletDisconnectSection');
    const fullWalletAddress = document.getElementById('fullWalletAddress');
    
    if (wallet.connected) {
      walletStatus.textContent = `${wallet.address.slice(0,6)}...${wallet.address.slice(-4)}`;
      walletStatus.className = 'status-badge connected';
      walletBalance.classList.remove('hidden');
      walletInputSection.classList.add('hidden');
      walletDisconnectSection.classList.remove('hidden');
      fullWalletAddress.textContent = wallet.address;
      document.getElementById('solBalance').textContent = wallet.balance.toFixed(4);
    } else {
      walletStatus.textContent = 'Not Connected';
      walletStatus.className = 'status-badge disconnected';
      walletBalance.classList.add('hidden');
      walletInputSection.classList.remove('hidden');
      walletDisconnectSection.classList.add('hidden');
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
  } catch (error) {
    console.error('Settings load error:', error);
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

// Scan button in holdings tab
document.getElementById('scanBtn')?.addEventListener('click', runScanner);

// Initialize
console.log('🌊 DarkWave-V2 Mini App loaded with ALL features');
if (tg) {
  console.log('Telegram WebApp initialized', tg.initDataUnsafe);
}
