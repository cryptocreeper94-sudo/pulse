// DarkWave PULSE - Simplified Single-Scroll App
// Clean, functional, professional

const API_BASE = '';
let currentAsset = 'crypto';
let currentCategory = 'top';
let currentChart = null;
let currentTicker = '';

// Technical terms glossary for hyperlinks
const TECHNICAL_TERMS = {
  'RSI': 'Relative Strength Index - momentum oscillator (0-100). <30 = oversold (buy signal), >70 = overbought (sell signal)',
  'MACD': 'Moving Average Convergence Divergence - trend & momentum indicator. Bullish cross = buy, bearish cross = sell',
  'EMA': 'Exponential Moving Average - trend indicator giving more weight to recent prices. Price above EMA = uptrend',
  'SMA': 'Simple Moving Average - average price over set period. 50/200 crossovers are powerful signals',
  'BOLLINGER BANDS': 'Volatility bands (SMA ± 2 std dev). Price at lower band = oversold, upper band = overbought',
  'BB': 'Bollinger Bands - volatility indicator. Bands squeeze = big move coming, expansion = trend in progress',
  'VOLUME': 'Total units traded. High volume confirms price moves, low volume = weak/unreliable signals',
  'SUPPORT': 'Price floor where buyers prevent further decline. Buy near support, exit if broken',
  'RESISTANCE': 'Price ceiling where sellers prevent rise. Take profits near resistance, breakouts need volume',
  'LIQUIDITY': 'Ability to buy/sell without moving price. DEX pairs need $50k+ for safe trading',
  'RUG RISK': 'Probability devs will drain liquidity. Check: locked liquidity, verified contract, holder distribution',
  'SLIPPAGE': 'Difference between expected vs actual price. Set 1-3% for liquid pairs, avoid >15%',
  'DEX': 'Decentralized Exchange - peer-to-peer trading without central authority. Higher risk than CEX',
  'MARKET CAP': 'Total value (price × supply). Higher cap = stable, lower cap = risky/high growth potential',
  'FDV': 'Fully Diluted Valuation - market cap if all tokens unlocked. High FDV/cap ratio = dilution risk',
  'BULLISH': 'Expecting price rise. Signals: RSI recovery, MACD cross up, price above EMAs, volume up',
  'BEARISH': 'Expecting price fall. Signals: RSI decline, MACD cross down, price below EMAs, volume down',
  'OVERBOUGHT': 'Risen too fast, correction likely. RSI >70 or price above upper BB = take profits',
  'OVERSOLD': 'Fallen too fast, bounce likely. RSI <30 or price below lower BB = buying opportunity',
  'MOMENTUM': 'Rate of price acceleration. Strong momentum = trend continues, weak = reversal warning',
  'VOLATILITY': 'Degree of price fluctuation. High vol = bigger swings, higher risk/reward',
  'CROSSOVER': 'One indicator crosses another - signals trend change. EMA/MACD crossovers are key buy/sell signals'
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DarkWave PULSE initializing...');
  
  // Bind events
  bindSearchEvents();
  bindChartEvents();
  bindAIChat();
  bindAdminButton();
  
  // Load initial data
  loadMarketData('crypto', 'top');
  loadMarketTicker();
  loadNewsLinks();
  
  console.log('✅ DarkWave PULSE ready');
});

// Subscribe function
function subscribePlan(plan) {
  alert(`Opening ${plan.toUpperCase()} subscription checkout...`);
  // TODO: Integrate with Stripe Checkout
  window.open('https://buy.stripe.com/your-link-here', '_blank');
}

// Hyperlink technical terms with tooltips
function linkTechnicalTerms(text) {
  if (!text) return text;
  
  let result = text;
  
  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = Object.keys(TECHNICAL_TERMS).sort((a, b) => b.length - a.length);
  
  sortedTerms.forEach(term => {
    const definition = TECHNICAL_TERMS[term];
    // Create regex that matches whole words only (case insensitive)
    const regex = new RegExp(`\\b(${term})\\b`, 'gi');
    
    result = result.replace(regex, (match) => {
      return `<span class="tech-term" data-tooltip="${definition}">${match}</span>`;
    });
  });
  
  return result;
}

// ===== SEARCH / ANALYZE =====
function bindSearchEvents() {
  const searchBtn = document.getElementById('universalSearchBtn');
  const searchInput = document.getElementById('universalSearchInput');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', performAnalysis);
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performAnalysis();
    });
  }
}

async function performAnalysis() {
  const input = document.getElementById('universalSearchInput');
  const query = input?.value.trim().toUpperCase();
  
  if (!query) {
    showNotification('Please enter a ticker symbol');
    return;
  }
  
  const resultsDiv = document.getElementById('analysisResults');
  resultsDiv.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="spinner"></div><p>Analyzing ' + query + '...</p></div>';
  
  try {
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: query, userId: 'user-' + Date.now() })
    });
    
    const data = await response.json();
    
    // API returns data directly (not wrapped)
    if (data.error) {
      resultsDiv.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--danger);"><h3>❌ Analysis Failed</h3><p>${data.error || 'Unable to analyze ' + query}</p></div>`;
    } else {
      displayAnalysis(data, query);
    }
  } catch (error) {
    console.error('Analysis error:', error);
    resultsDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger);"><h3>❌ Error</h3><p>Failed to connect to analysis service</p></div>';
  }
}

function displayAnalysis(data, ticker) {
  const signal = data.recommendation || 'HOLD';
  const signalColor = signal.includes('BUY') ? 'var(--success)' : signal.includes('SELL') ? 'var(--danger)' : 'var(--warning)';
  const signalIcon = signal.includes('BUY') ? '🟢' : signal.includes('SELL') ? '🔴' : '🟡';
  
  // RSI status
  const rsiValue = data.rsi || 50;
  const rsiStatus = rsiValue > 70 ? 'Overbought' : rsiValue < 30 ? 'Oversold' : 'Neutral';
  const rsiColor = rsiValue > 70 ? 'var(--danger)' : rsiValue < 30 ? 'var(--success)' : 'var(--text-primary)';
  
  // MACD status
  const macdValue = data.macd?.histogram || 0;
  const macdStatus = macdValue > 0 ? 'Bullish' : 'Bearish';
  const macdColor = macdValue > 0 ? 'var(--success)' : 'var(--danger)';
  
  const html = `
    <!-- Two Column Layout: Analysis + Chart -->
    <div class="analysis-two-column">
      
      <!-- LEFT: Analysis Panel -->
      <div style="background: var(--bg-secondary); border-radius: 8px; padding: 10px; border: 1px solid ${signalColor};">
      
      <!-- Header with Price & Recommendation -->
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h2 style="margin: 0 0 4px 0; color: var(--text-primary); font-size: 1.125rem;">${ticker}</h2>
          <div style="font-size: 1rem; color: var(--text-primary); font-weight: 700;">$${data.price?.toFixed(2) || '0.00'}</div>
          <div style="color: ${data.priceChange >= 0 ? 'var(--success)' : 'var(--danger)'}; font-size: 0.75rem; margin-top: 2px; font-weight: 600;">
            ${data.priceChange >= 0 ? '+' : ''}${data.priceChange?.toFixed(2) || '0'}% (24h)
          </div>
          ${data.sentiment ? `
            <div style="margin-top: 4px; padding: 3px 6px; background: rgba(59, 130, 246, 0.1); border: 1px solid var(--primary); border-radius: 4px; display: inline-block;">
              <span style="font-size: 0.75rem; color: var(--text-secondary);">Sentiment:</span>
              <span style="font-weight: 600; color: var(--primary); margin-left: 4px; font-size: 0.75rem;">${data.sentiment.sentimentScore || 'N/A'}/100</span>
            </div>
          ` : ''}
        </div>
        <div style="text-align: right;">
          <div style="background: ${signalColor}; color: white; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 0.875rem; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
            ${signalIcon} ${signal}
          </div>
        </div>
      </div>
      
      <!-- Key Indicators Grid - Compact -->
      <div class="analysis-metrics-grid">
        
        <!-- RSI -->
        <div class="metric-card" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; border: 1px solid var(--border-primary);">
          <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; font-weight: 600;">RSI (14)</div>
          <div style="color: ${rsiColor}; font-size: 1.125rem; font-weight: 700; line-height: 1.2;">${rsiValue.toFixed(1)}</div>
          <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 3px;">${rsiStatus}</div>
        </div>
        
        <!-- MACD -->
        <div class="metric-card" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; border: 1px solid var(--border-primary);">
          <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; font-weight: 600;">MACD</div>
          <div style="color: ${macdColor}; font-size: 1.125rem; font-weight: 700; line-height: 1.2;">${(data.macd?.value || 0).toFixed(2)}</div>
          <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 3px;">${macdStatus}</div>
        </div>
        
        <!-- EMA 9 -->
        <div class="metric-card" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; border: 1px solid var(--border-primary);">
          <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; font-weight: 600;">EMA 9</div>
          <div style="color: var(--text-primary); font-size: 1.125rem; font-weight: 700; line-height: 1.2;">$${(data.ema9 || 0).toFixed(2)}</div>
          <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 3px;">9-day</div>
        </div>
        
        <!-- EMA 21 -->
        <div class="metric-card" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; border: 1px solid var(--border-primary);">
          <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; font-weight: 600;">EMA 21</div>
          <div style="color: var(--text-primary); font-size: 1.125rem; font-weight: 700; line-height: 1.2;">$${(data.ema21 || 0).toFixed(2)}</div>
          <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 3px;">21-day</div>
        </div>
        
        <!-- EMA 50 -->
        <div class="metric-card" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; border: 1px solid var(--border-primary);">
          <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; font-weight: 600;">EMA 50</div>
          <div style="color: var(--text-primary); font-size: 1.125rem; font-weight: 700; line-height: 1.2;">$${(data.ema50 || 0).toFixed(2)}</div>
          <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 3px;">50-day</div>
        </div>
        
        <!-- EMA 200 -->
        <div class="metric-card" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; border: 1px solid var(--border-primary);">
          <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; font-weight: 600;">EMA 200</div>
          <div style="color: var(--text-primary); font-size: 1.125rem; font-weight: 700; line-height: 1.2;">$${(data.ema200 || 0).toFixed(2)}</div>
          <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 3px;">200-day</div>
        </div>
        
        <!-- SMA 50 -->
        <div class="metric-card" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; border: 1px solid var(--border-primary);">
          <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; font-weight: 600;">SMA 50</div>
          <div style="color: var(--text-primary); font-size: 1.125rem; font-weight: 700; line-height: 1.2;">$${(data.sma50 || 0).toFixed(2)}</div>
          <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 3px;">50-day</div>
        </div>
        
        <!-- SMA 200 -->
        <div class="metric-card" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; border: 1px solid var(--border-primary);">
          <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; font-weight: 600;">SMA 200</div>
          <div style="color: var(--text-primary); font-size: 1.125rem; font-weight: 700; line-height: 1.2;">$${(data.sma200 || 0).toFixed(2)}</div>
          <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 3px;">200-day</div>
        </div>
        
        <!-- Bollinger Upper -->
        <div class="metric-card" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; border: 1px solid var(--border-primary);">
          <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; font-weight: 600;">BB Upper</div>
          <div style="color: var(--danger); font-size: 1.125rem; font-weight: 700; line-height: 1.2;">$${(data.bollingerBands?.upper || 0).toFixed(2)}</div>
          <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 3px;">Resistance</div>
        </div>
        
        <!-- Bollinger Lower -->
        <div class="metric-card" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; border: 1px solid var(--border-primary);">
          <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; font-weight: 600;">BB Lower</div>
          <div style="color: var(--success); font-size: 1.125rem; font-weight: 700; line-height: 1.2;">$${(data.bollingerBands?.lower || 0).toFixed(2)}</div>
          <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 3px;">Support</div>
        </div>
        
        <!-- Support -->
        <div class="metric-card" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; border: 1px solid var(--border-primary);">
          <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; font-weight: 600;">Support</div>
          <div style="color: var(--success); font-size: 1.125rem; font-weight: 700; line-height: 1.2;">$${(data.support || 0).toFixed(2)}</div>
          <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 3px;">Floor</div>
        </div>
        
        <!-- Resistance -->
        <div class="metric-card" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; border: 1px solid var(--border-primary);">
          <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; font-weight: 600;">Resistance</div>
          <div style="color: var(--danger); font-size: 1.125rem; font-weight: 700; line-height: 1.2;">$${(data.resistance || 0).toFixed(2)}</div>
          <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 3px;">Ceiling</div>
        </div>
        
      </div>
      
      <!-- Signals List -->
      ${data.signals && data.signals.length > 0 ? `
        <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid var(--border-primary);">
          <h3 style="color: var(--text-primary); margin: 0 0 6px 0; font-size: 0.75rem;">📊 Trading Signals</h3>
          <div style="display: grid; gap: 4px;">
            ${data.signals.map(sig => {
              const isBullish = sig.toLowerCase().includes('bullish') || sig.toLowerCase().includes('oversold') || sig.toLowerCase().includes('golden');
              return `<div style="padding: 4px 6px; background: ${isBullish ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border-left: 2px solid ${isBullish ? 'var(--success)' : 'var(--danger)'}; border-radius: 3px; color: var(--text-primary); font-size: 0.75rem;">${isBullish ? '🟢' : '🔴'} ${sig}</div>`;
            }).join('')}
          </div>
          <div style="margin-top: 6px; display: flex; gap: 8px; justify-content: center; font-size: 0.75rem;">
            <span style="color: var(--success); font-weight: 600;">🟢 Bullish: ${data.signalCount?.bullish || 0}</span>
            <span style="color: var(--danger); font-weight: 600;">🔴 Bearish: ${data.signalCount?.bearish || 0}</span>
          </div>
        </div>
      ` : ''}
      
      </div><!-- End LEFT Analysis Panel -->
      
      <!-- RIGHT: Live Chart Panel -->
      <div style="background: var(--bg-secondary); border-radius: 8px; padding: 10px; border: 1px solid var(--border-primary);">
        <h3 style="margin: 0 0 6px 0; color: var(--text-primary); font-size: 0.75rem;">📊 Live Chart</h3>
        <div id="inlineChart" style="height: 350px; background: rgba(0,0,0,0.2); border-radius: 6px;"></div>
      </div>
      
    </div><!-- End Two Column Grid -->
  `;
  
  document.getElementById('analysisResults').innerHTML = html;
  
  // Load chart inline after rendering
  setTimeout(() => renderInlineChart(ticker, '1D', 'candlestick'), 100);
}

// ===== ASSET SWITCHING =====
function switchAsset(asset) {
  currentAsset = asset;
  
  // Update tab UI
  document.querySelectorAll('.asset-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.asset === asset);
    tab.style.borderBottom = tab.dataset.asset === asset ? '3px solid var(--primary)' : '3px solid transparent';
    tab.style.color = tab.dataset.asset === asset ? 'var(--text-primary)' : 'var(--text-secondary)';
  });
  
  // Load data for this asset
  loadMarketData(asset, currentCategory);
}

function loadCategory(category) {
  currentCategory = category;
  
  // Update category button UI
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  
  loadMarketData(currentAsset, category);
}

// ===== MARKET DATA =====
async function loadMarketData(asset, category) {
  const tbody = document.getElementById('marketTableBody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">Loading...</td></tr>';
  
  // NFTs use a different approach (show message for now)
  if (asset === 'nfts') {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">NFT analysis available via Search - Enter collection name (e.g., BAYC)</td></tr>';
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/market-overview?assetClass=${asset}&category=${category}`);
    const data = await response.json();
    
    // Backend returns raw array, not wrapped object
    const items = Array.isArray(data) ? data : (data.data || []);
    
    if (items && items.length > 0) {
      renderMarketTable(items);
    } else {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">No data available</td></tr>';
    }
  } catch (error) {
    console.error('Market data error:', error);
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--danger);">Failed to load data</td></tr>';
  }
}

function renderMarketTable(items) {
  const tbody = document.getElementById('marketTableBody');
  
  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">No data available</td></tr>';
    return;
  }
  
  // Filter out invalid items
  const validItems = items.filter(item => item && item.ticker && item.name && item.price);
  
  if (validItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">No valid data available</td></tr>';
    return;
  }
  
  tbody.innerHTML = validItems.map((item, index) => {
    const changeColor = (item.change24h || 0) >= 0 ? 'var(--success)' : 'var(--danger)';
    const changeIcon = (item.change24h || 0) >= 0 ? '▲' : '▼';
    
    // Generate logo URL based on asset type (with safe toLowerCase)
    const ticker = (item.ticker || '').toLowerCase();
    const name = (item.name || '').toLowerCase().replace(/\s+/g, '-');
    const logoUrl = item.type === 'stock' 
      ? `https://logo.clearbit.com/${ticker}.com`
      : `https://cryptologos.cc/logos/${ticker}-${name}-logo.png`;
    
    return `
      <tr style="border-bottom: 1px solid var(--border-primary); cursor: pointer; transition: background 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'" onclick="quickAnalyze('${item.ticker}')">
        <td style="padding: 6px 8px; color: var(--text-secondary); font-size: 0.75rem;">${index + 1}</td>
        <td style="padding: 6px 8px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <img src="${logoUrl}" alt="${item.ticker}" style="width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.1);" onerror="this.style.display='none'" />
            <div>
              <div style="font-weight: 600; color: var(--text-primary); font-size: 0.75rem;">${item.name}</div>
              <div style="font-size: 0.625rem; color: var(--text-secondary);">${item.ticker}</div>
            </div>
          </div>
        </td>
        <td style="padding: 6px 8px; text-align: right; color: var(--text-primary); font-size: 0.75rem;">$${item.price?.toLocaleString() || '0.00'}</td>
        <td style="padding: 6px 8px; text-align: right; color: ${changeColor}; font-weight: 600; font-size: 0.75rem;">${changeIcon} ${Math.abs(item.change24h || 0).toFixed(2)}%</td>
        <td style="padding: 6px 8px; text-align: right; color: var(--text-secondary); font-size: 0.75rem;">$${(item.marketCap || 0).toLocaleString(undefined, {notation: 'compact', maximumFractionDigits: 2})}</td>
        <td style="padding: 6px 8px; text-align: right; color: var(--text-secondary); font-size: 0.75rem;">$${(item.volume || 0).toLocaleString(undefined, {notation: 'compact', maximumFractionDigits: 2})}</td>
        <td style="padding: 6px 8px; text-align: center;">
          <span style="padding: 2px 4px; border-radius: 3px; font-size: 0.75rem; background: ${item.rsi > 70 ? 'var(--danger-bg)' : item.rsi < 30 ? 'var(--success-bg)' : 'var(--warning-bg)'}; color: ${item.rsi > 70 ? 'var(--danger)' : item.rsi < 30 ? 'var(--success)' : 'var(--warning)'};">
            ${item.rsi?.toFixed(0) || 'N/A'}
          </span>
        </td>
        <td style="padding: 6px 8px; text-align: center;">
          <button onclick="event.stopPropagation(); openChart('${item.ticker}')" style="padding: 3px 6px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: 600;">
            Chart
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function quickAnalyze(ticker) {
  document.getElementById('universalSearchInput').value = ticker;
  performAnalysis();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== MARKET TICKER =====
async function loadMarketTicker() {
  try {
    const response = await fetch(`${API_BASE}/api/market-overview?assetClass=crypto&category=top`);
    const data = await response.json();
    
    // Backend returns raw array
    const items = Array.isArray(data) ? data : (data.data || []);
    
    if (items && items.length > 0) {
      const tickerHTML = items.slice(0, 20).map(item => {
        if (!item || !item.ticker || !item.price) return '';
        const color = (item.change24h || 0) >= 0 ? 'var(--success)' : 'var(--danger)';
        const price = typeof item.price === 'number' ? item.price : parseFloat(item.price);
        const change = typeof item.change24h === 'number' ? item.change24h : parseFloat(item.change24h || 0);
        return `
          <span class="ticker-item" style="display: inline-flex; align-items: center; gap: 8px; margin-right: 32px;">
            <strong>${item.ticker}</strong>
            <span style="color: var(--text-primary);">$${price.toFixed(2)}</span>
            <span style="color: ${color};">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span>
          </span>
        `;
      }).filter(html => html).join('');
      
      if (tickerHTML) {
        document.getElementById('tickerContent').innerHTML = tickerHTML;
        document.getElementById('tickerContentClone').innerHTML = tickerHTML;
      }
    }
  } catch (error) {
    console.error('Ticker error:', error);
  }
  
  // Refresh every 30 seconds
  setTimeout(loadMarketTicker, 30000);
}

// ===== NEWS LINKS - Newspaper Style with Project Ads =====
async function loadNewsLinks() {
  const newsDiv = document.getElementById('newsLinks');
  
  // Project ads to mix into news
  const projectAds = [
    { name: 'Crypto Cat House', description: 'Your Gateway to Web3 Projects', url: 'https://www.cryptocathouse.com/projects' },
    { name: 'DarkWave Token', description: 'Revolutionary Trading Analytics Platform', url: 'https://www.cryptocathouse.com/projects' },
    { name: 'NFT Marketplace', description: 'Discover Exclusive Digital Collectibles', url: 'https://www.cryptocathouse.com/projects' },
    { name: 'Web3 Launchpad', description: 'Early Access to Premium Projects', url: 'https://www.cryptocathouse.com/projects' }
  ];
  
  try {
    const response = await fetch(`${API_BASE}/api/news`);
    const data = await response.json();
    
    if (data.success && data.articles) {
      const articles = data.articles.slice(0, 25);
      const newsItems = [];
      
      // Mix news and ads
      articles.forEach((article, index) => {
        // Add news item with newspaper format: "Source: Title"
        const fontSize = index % 3 === 0 ? '1rem' : index % 5 === 0 ? '0.95rem' : '0.875rem';
        const fontWeight = index % 4 === 0 ? '700' : '400';
        
        newsItems.push(`
          <div style="line-height: 1.6;">
            <span style="color: var(--text-secondary); font-size: ${fontSize};">${article.source}:</span>
            <a href="${article.url}" target="_blank" rel="noopener" style="color: var(--text-primary); text-decoration: underline; font-size: ${fontSize}; font-weight: ${fontWeight}; transition: color 0.2s; margin-left: 4px;" onmouseover="this.style.color='#FF00FF'" onmouseout="this.style.color='var(--text-primary)'">
              ${article.title}
            </a>
          </div>
        `);
        
        // Insert project ad every 6 news items
        if ((index + 1) % 6 === 0 && projectAds[Math.floor(index / 6)]) {
          const ad = projectAds[Math.floor(index / 6)];
          newsItems.push(`
            <div style="padding: 12px; background: rgba(255, 0, 255, 0.08); border: 1px solid rgba(255, 0, 255, 0.3); border-radius: 6px; line-height: 1.4;">
              <a href="${ad.url}" target="_blank" rel="noopener" style="text-decoration: none;">
                <div style="color: #FF00FF; font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">🚀 ${ad.name}</div>
                <div style="color: var(--text-secondary); font-size: 0.75rem;">${ad.description}</div>
              </a>
            </div>
          `);
        }
      });
      
      newsDiv.innerHTML = newsItems.join('');
    }
  } catch (error) {
    console.error('News error:', error);
    newsDiv.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.875rem; text-align: center;">News unavailable</p>';
  }
}

// ===== INLINE CHART (for two-column layout) =====
async function renderInlineChart(ticker, timeframe, type) {
  const container = document.getElementById('inlineChart');
  if (!container) return;
  
  container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">Loading chart...</div>';
  
  try {
    const response = await fetch(`${API_BASE}/api/chart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, timeframe, type })
    });
    
    const data = await response.json();
    
    if (data.success && data.chartData) {
      renderChartInto('inlineChart', data.chartData, type);
    } else {
      container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--danger);">Chart data unavailable</div>';
    }
  } catch (error) {
    console.error('Inline chart error:', error);
    container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--danger);">Failed to load chart</div>';
  }
}

function renderChartInto(containerId, chartData, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!window.LightweightCharts || !chartData) return;
  
  // Clean up previous chart if exists
  if (currentChart) {
    currentChart.remove();
    currentChart = null;
  }
  
  currentChart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: 350,
    layout: {
      background: { color: 'transparent' },
      textColor: '#9CA3AF'
    },
    grid: {
      vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
      horzLines: { color: 'rgba(255, 255, 255, 0.1)' }
    },
    rightPriceScale: {
      borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    timeScale: {
      borderColor: 'rgba(255, 255, 255, 0.1)'
    }
  });
  
  // Main price series
  let mainSeries;
  if (type === 'candlestick') {
    mainSeries = currentChart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444'
    });
    mainSeries.setData(chartData.prices || chartData);
  } else {
    mainSeries = currentChart.addLineSeries({ 
      color: '#3B82F6',
      lineWidth: 2
    });
    const priceData = (chartData.prices || chartData).map(d => ({ 
      time: d.time, 
      value: d.close || d.value 
    }));
    mainSeries.setData(priceData);
  }
  
  // Add EMA overlays
  if (chartData.ema9) {
    const ema9Series = currentChart.addLineSeries({
      color: '#22C55E',
      lineWidth: 1
    });
    ema9Series.setData(chartData.ema9);
  }
  
  if (chartData.ema21) {
    const ema21Series = currentChart.addLineSeries({
      color: '#F59E0B',
      lineWidth: 1
    });
    ema21Series.setData(chartData.ema21);
  }
  
  if (chartData.ema50) {
    const ema50Series = currentChart.addLineSeries({
      color: '#3B82F6',
      lineWidth: 2
    });
    ema50Series.setData(chartData.ema50);
  }
}

// ===== CHART MODAL =====
function bindChartEvents() {
  const closeBtn = document.getElementById('closeChartBtn');
  const modal = document.getElementById('chartModal');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeChart);
  }
  
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeChart();
    });
  }
}

function openChart(ticker) {
  currentTicker = ticker;
  document.getElementById('chartModalTitle').textContent = `${ticker} Price Chart`;
  document.getElementById('chartModal').style.display = 'flex';
  
  // Load chart data
  loadChartData(ticker, '1D', 'candlestick');
}

function closeChart() {
  document.getElementById('chartModal').style.display = 'none';
  if (currentChart) {
    currentChart.remove();
    currentChart = null;
  }
}

async function loadChartData(ticker, timeframe, type) {
  const container = document.getElementById('chartContainer');
  container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">Loading chart...</div>';
  
  try {
    const response = await fetch(`${API_BASE}/api/chart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, timeframe, type })
    });
    
    const data = await response.json();
    
    if (data.success && data.chartData) {
      renderChart(data.chartData, type);
    } else {
      container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--danger);">Chart data unavailable</div>';
    }
  } catch (error) {
    console.error('Chart error:', error);
    container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--danger);">Failed to load chart</div>';
  }
}

function renderChart(chartData, type) {
  const container = document.getElementById('chartContainer');
  container.innerHTML = '';
  
  if (!window.LightweightCharts || !chartData) return;
  
  currentChart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: 350,
    layout: {
      background: { color: 'transparent' },
      textColor: '#9CA3AF'
    },
    grid: {
      vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
      horzLines: { color: 'rgba(255, 255, 255, 0.1)' }
    },
    rightPriceScale: {
      borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    timeScale: {
      borderColor: 'rgba(255, 255, 255, 0.1)'
    }
  });
  
  // Main price series
  let mainSeries;
  if (type === 'candlestick') {
    mainSeries = currentChart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444'
    });
    mainSeries.setData(chartData.prices || chartData);
  } else {
    mainSeries = currentChart.addLineSeries({ 
      color: '#3B82F6',
      lineWidth: 2
    });
    const priceData = (chartData.prices || chartData).map(d => ({ 
      time: d.time, 
      value: d.close || d.value 
    }));
    mainSeries.setData(priceData);
  }
  
  // Add EMA 9 (fast - bright green)
  if (chartData.ema9 && chartData.ema9.length > 0) {
    const ema9Series = currentChart.addLineSeries({
      color: '#22C55E',
      lineWidth: 1,
      title: 'EMA 9'
    });
    ema9Series.setData(chartData.ema9);
  }
  
  // Add EMA 21 (medium - orange)
  if (chartData.ema21 && chartData.ema21.length > 0) {
    const ema21Series = currentChart.addLineSeries({
      color: '#F59E0B',
      lineWidth: 1,
      title: 'EMA 21'
    });
    ema21Series.setData(chartData.ema21);
  }
  
  // Add EMA 50 (slow - blue)
  if (chartData.ema50 && chartData.ema50.length > 0) {
    const ema50Series = currentChart.addLineSeries({
      color: '#3B82F6',
      lineWidth: 2,
      title: 'EMA 50'
    });
    ema50Series.setData(chartData.ema50);
  }
  
  // Add EMA 200 (very slow - purple)
  if (chartData.ema200 && chartData.ema200.length > 0) {
    const ema200Series = currentChart.addLineSeries({
      color: '#A855F7',
      lineWidth: 2,
      title: 'EMA 200'
    });
    ema200Series.setData(chartData.ema200);
  }
  
  // Add SMA 50 (dashed yellow)
  if (chartData.sma50 && chartData.sma50.length > 0) {
    const sma50Series = currentChart.addLineSeries({
      color: '#FBBF24',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      title: 'SMA 50'
    });
    sma50Series.setData(chartData.sma50);
  }
  
  // Add SMA 200 (dashed red)
  if (chartData.sma200 && chartData.sma200.length > 0) {
    const sma200Series = currentChart.addLineSeries({
      color: '#EF4444',
      lineWidth: 2,
      lineStyle: 2, // Dashed
      title: 'SMA 200'
    });
    sma200Series.setData(chartData.sma200);
  }
  
  // Add Bollinger Bands (light semi-transparent)
  if (chartData.bollingerUpper && chartData.bollingerLower) {
    const upperBand = currentChart.addLineSeries({
      color: 'rgba(239, 68, 68, 0.5)',
      lineWidth: 1,
      title: 'BB Upper'
    });
    upperBand.setData(chartData.bollingerUpper);
    
    const lowerBand = currentChart.addLineSeries({
      color: 'rgba(16, 185, 129, 0.5)',
      lineWidth: 1,
      title: 'BB Lower'
    });
    lowerBand.setData(chartData.bollingerLower);
  }
  
  currentChart.timeScale().fitContent();
}

function changeTimeframe(timeframe) {
  document.querySelectorAll('[data-timeframe]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.timeframe === timeframe);
  });
  loadChartData(currentTicker, timeframe, 'candlestick');
}

function changeChartType(type) {
  document.querySelectorAll('[data-type]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
  loadChartData(currentTicker, '1D', type);
}

// ===== AI CHAT =====
function bindAIChat() {
  const toggle = document.getElementById('aiAgentToggle');
  const close = document.getElementById('closeChatBtn');
  const send = document.getElementById('aiSendBtn');
  const input = document.getElementById('aiAgentInput');
  
  if (toggle) {
    toggle.addEventListener('click', () => {
      const box = document.getElementById('aiAgentBox');
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    });
  }
  
  if (close) {
    close.addEventListener('click', () => {
      document.getElementById('aiAgentBox').style.display = 'none';
    });
  }
  
  if (send) {
    send.addEventListener('click', sendAIMessage);
  }
  
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendAIMessage();
    });
  }
}

async function sendAIMessage() {
  const input = document.getElementById('aiAgentInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  const messages = document.getElementById('aiAgentMessages');
  
  // Add user message
  messages.innerHTML += `<div style="background: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 12px; text-align: right;"><strong>You:</strong> ${message}</div>`;
  input.value = '';
  messages.scrollTop = messages.scrollHeight;
  
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId: 'user-' + Date.now() })
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiResponse = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) aiResponse += data.content;
          } catch (e) {}
        }
      }
    }
    
    const linkedResponse = linkTechnicalTerms(aiResponse);
    messages.innerHTML += `<div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-bottom: 12px;"><strong>DarkWave:</strong> ${linkedResponse}</div>`;
    messages.scrollTop = messages.scrollHeight;
  } catch (error) {
    console.error('AI chat error:', error);
    messages.innerHTML += `<div style="background: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 12px; color: var(--danger);"><strong>Error:</strong> Failed to get response</div>`;
  }
}

// ===== ADMIN =====
function bindAdminButton() {
  const btn = document.getElementById('adminBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      const code = prompt('Enter admin access code:');
      if (code && code.trim()) {
        window.location.href = `/admin?code=${encodeURIComponent(code.trim())}`;
      }
    });
  }
}

// ===== UTILITIES =====
function showNotification(message) {
  // Simple toast notification
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = 'position: fixed; top: 24px; right: 24px; background: var(--bg-secondary); color: var(--text-primary); padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000; border: 1px solid var(--border-primary);';
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ===== PAGE INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DarkWave PULSE - Initializing...');
  
  // Load initial market data
  loadMarketData(currentAsset, currentCategory);
  
  // Load market ticker
  loadMarketTicker();
  
  // Load news
  loadNewsLinks();
  
  // Bind search functionality
  const searchBtn = document.getElementById('universalSearchBtn');
  const searchInput = document.getElementById('universalSearchInput');
  if (searchBtn) searchBtn.addEventListener('click', performAnalysis);
  if (searchInput) searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performAnalysis();
  });
  
  // Bind AI agent
  bindAIAgent();
  
  // Bind admin
  bindAdminButton();
  
  console.log('✅ DarkWave PULSE loaded');
});

