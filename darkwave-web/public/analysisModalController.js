// Analysis Modal Controller - Orchestrates the full analysis modal

const analysisModalController = {
  currentAsset: null,
  currentAssetData: null, // Store complete asset data for landscape fullscreen
  currentTimeframe: '1d',
  currentATH: null,
  currentAssetType: 'crypto',
  currentSolanaData: null,
  timeframeButtonsSetup: false,
  liveUpdateInterval: null, // Live price update interval
  
  // Open analysis modal for a given asset
  async openAnalysisModal({ symbol, name, assetType = 'crypto', tokenAddress = null }) {
    const modal = document.getElementById('analysisModal');
    if (!modal) return;
    
    // Store asset type and token address
    this.currentAssetType = assetType;
    this.currentSolanaData = null;
    
    // Show modal with loading state
    modal.style.display = 'block';
    this.showLoadingState();
    
    try {
      // Fetch asset data based on type with BIDIRECTIONAL FALLBACK
      console.log(`📊 Loading ${assetType} analysis for ${symbol}...`);
      let assetData;
      let finalAssetType = assetType;
      
      if (assetType === 'stock') {
        try {
          assetData = await analysisDataService.getStockData(symbol, this.currentTimeframe);
          // Stocks don't have circulating supply - ensure it's zero
          if (assetData) assetData.circulatingSupply = 0;
        } catch (stockError) {
          // Fallback: if stock lookup fails, try as crypto
          console.warn(`⚠️ Stock lookup failed for ${symbol}, retrying as crypto...`);
          assetData = await analysisDataService.getAssetData(symbol, this.currentTimeframe);
          finalAssetType = 'crypto';
          this.currentAssetType = 'crypto';
          // Fetch ATH data for crypto
          this.currentATH = await analysisDataService.getATHData(symbol);
        }
      } else {
        // Start with crypto, but fallback to stock if crypto fails
        try {
          assetData = await analysisDataService.getAssetData(symbol, this.currentTimeframe);
          // Fetch ATH data for crypto only (optional - don't fail if it errors)
          try {
            this.currentATH = await analysisDataService.getATHData(symbol);
          } catch (athError) {
            console.warn(`⚠️ ATH data failed (non-critical):`, athError.message);
            this.currentATH = null; // Set to null but don't fail
          }
        } catch (cryptoError) {
          // Only fallback to stock if this is a NOT FOUND error (404), not transient errors (500, 429, etc.)
          // Error messages from analysisDataService include "HTTP {status}" format
          const errorMsg = cryptoError.message || '';
          const isNotFound = 
            errorMsg.includes('HTTP 404') || 
            errorMsg.includes('404') || 
            errorMsg.includes('not found') ||
            errorMsg.includes('Not Found');
          
          console.log(`🔍 Crypto fetch error for ${symbol}:`, errorMsg, `| isNotFound: ${isNotFound}`);
          
          // Fallback: if crypto NOT FOUND AND symbol looks like a stock ticker (short, all-caps)
          // try as stock. This handles stocks not in our hardcoded list.
          if (isNotFound && symbol.length <= 5 && /^[A-Z.]+$/.test(symbol)) {
            console.warn(`⚠️ Crypto not found for ${symbol}, retrying as stock...`);
            try {
              assetData = await analysisDataService.getStockData(symbol, this.currentTimeframe);
              finalAssetType = 'stock';
              this.currentAssetType = 'stock';
              this.currentATH = null; // No ATH for stocks
              // Clear circulatingSupply to prevent showing crypto data for stocks
              if (assetData) assetData.circulatingSupply = 0;
            } catch (stockError) {
              // Stock also failed - throw original crypto error for better diagnostics
              console.error(`❌ Both crypto and stock lookup failed for ${symbol}`);
              throw cryptoError;
            }
          } else {
            // Not a 404 or not stock pattern - re-throw the original crypto error
            throw cryptoError;
          }
        }
        
        // Also try to fetch ATH for stocks (optional - don't fail if it errors)
        if (finalAssetType === 'stock') {
          try {
            this.currentATH = await analysisDataService.getATHData(symbol);
          } catch (athError) {
            console.warn(`⚠️ ATH data failed (non-critical):`, athError.message);
            this.currentATH = null;
          }
        }
      }
      
      this.currentAsset = {
        ...assetData,
        displayName: name || assetData.name,
        symbol: symbol,
        assetType: finalAssetType
      };
      
      // Calculate technical indicators
      const indicators = this.calculateIndicators(assetData);
      
      // Generate buy/sell/hold signal
      const signal = analysisIndicators.generateSignal(indicators);
      
      // Populate modal with data
      this.populateModal(assetData, indicators, signal);
      
      // Show avatar now that data is loaded
      const avatarContainer = document.getElementById('avatarDisplayContainer');
      if (avatarContainer) avatarContainer.style.display = 'block';
      
      // Render avatar display
      if (typeof avatarDisplaySystem !== 'undefined') {
        avatarDisplaySystem.renderAvatarInModal();
      }
      
      // Initialize interactive chart
      this.initializeInteractiveChart(assetData.historical);
      
      // Setup timeframe buttons
      this.setupTimeframeButtons();
      
      // Generate AI analysis
      this.generateAIAnalysis(assetData, indicators, signal);
      
      // Fetch Market Cycle Outlook (Premium feature)
      this.fetchAndDisplayMarketCycle(symbol);
      
      // Initialize notepad for this asset (Premium feature)
      if (typeof window.initNotepadForAsset === 'function') {
        window.initNotepadForAsset(symbol);
      }
      
      // Fetch Solana on-chain data if this is a Solana token
      if (assetType === 'solana' && tokenAddress) {
        this.fetchAndDisplaySolanaData(tokenAddress);
      }
      
      // Start live price updates for crypto (1 per second)
      if (finalAssetType === 'crypto') {
        this.startLiveUpdates();
      }
      
      console.log(`✅ Analysis loaded for ${symbol} as ${finalAssetType}`);
      
    } catch (error) {
      console.error('Failed to load analysis:', error);
      this.showErrorState(error.message);
    }
  },
  
  // Start live price streaming (every 1 second)
  startLiveUpdates() {
    // Clear any existing interval
    if (this.liveUpdateInterval) {
      clearInterval(this.liveUpdateInterval);
    }
    
    this.liveUpdateInterval = setInterval(async () => {
      if (!this.currentAsset || this.currentAssetType !== 'crypto') {
        clearInterval(this.liveUpdateInterval);
        return;
      }
      
      try {
        // Fetch latest 60 candles (last 60 minutes if 1-minute candles)
        const response = await fetch(`/api/crypto-candles/${this.currentAsset.symbol}?interval=1m&limit=60`);
        if (!response.ok) return;
        
        const data = await response.json();
        if (!data || !data.candles || data.candles.length === 0) return;
        
        // Update chart with new candles
        const closes = data.candles.map(c => c.close);
        const sparklineData = window.interactiveChartManager.transformSparklineToLWCFormat(
          closes,
          data.candles,
          60 // 1-minute candles
        );
        
        // Update the sparkline series if it exists
        if (window.interactiveChartManager && window.interactiveChartManager.sparklineSeries) {
          window.interactiveChartManager.sparklineSeries.setData(sparklineData);
          window.interactiveChartManager.chart.timeScale().fitContent();
        }
        
        // Update indicators with new price data
        if (window.chartEnhancer) {
          window.chartEnhancer.updatePriceData(data.candles);
        }
        
      } catch (error) {
        // Silently fail - don't spam console during live updates
      }
    }, 1000); // Update every 1 second
  },
  
  // Setup timeframe button click handlers (only once)
  setupTimeframeButtons() {
    if (this.timeframeButtonsSetup) return;
    
    const buttons = document.querySelectorAll('.timeframe-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const timeframe = e.target.dataset.timeframe;
        await this.changeTimeframe(timeframe);
      });
    });
    
    this.timeframeButtonsSetup = true;
  },
  
  // Change chart timeframe
  async changeTimeframe(timeframe) {
    if (!this.currentAsset) return;
    
    this.currentTimeframe = timeframe;
    
    // Update active button
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.timeframe === timeframe);
    });
    
    try {
      // Reload data with new timeframe based on asset type
      let assetData;
      if (this.currentAssetType === 'stock') {
        assetData = await analysisDataService.getStockData(this.currentAsset.symbol, timeframe);
      } else {
        // Use symbol instead of id (id may be undefined for crypto assets)
        assetData = await analysisDataService.getAssetData(this.currentAsset.symbol, timeframe);
      }
      
      this.currentAsset = { ...this.currentAsset, ...assetData };
      
      // Recalculate indicators
      const indicators = this.calculateIndicators(assetData);
      const signal = analysisIndicators.generateSignal(indicators);
      
      // Update indicators (keep market data same)
      this.updateIndicators(indicators, signal);
      
      // Update charts
      this.updateInteractiveChart(assetData.historical);
      
    } catch (error) {
      console.error('Failed to change timeframe:', error);
    }
  },
  
  // Initialize interactive chart with historical data
  initializeInteractiveChart(historical) {
    if (!window.interactiveChartManager) {
      console.error('Interactive chart manager not loaded');
      return;
    }
    
    // Create chart instance (will clean up old chart if exists)
    window.interactiveChartManager.createChart('analysisInteractiveChart');
    
    // Load sparkline data by default (matches button state)
    const closes = historical.map(c => c.close);
    const sparklineData = window.interactiveChartManager.transformSparklineToLWCFormat(
      closes,
      historical,
      this.getIntervalSeconds(this.currentTimeframe)
    );
    window.interactiveChartManager.setSparklineData(sparklineData);
    
    // Initialize advanced indicator controls and manager
    if (window.chartEnhancer) {
      const chartContainer = document.getElementById('analysisInteractiveChart');
      if (chartContainer && !chartContainer.hasAttribute('data-indicators-initialized')) {
        window.chartEnhancer.init(chartContainer);
        window.chartEnhancer.setChart(window.interactiveChartManager.chart);
        
        // Pass price data to indicator manager
        if (historical && historical.length > 0) {
          window.chartEnhancer.updatePriceData(historical);
        }
        
        chartContainer.setAttribute('data-indicators-initialized', 'true');
        console.log('✅ Advanced indicator controls initialized');
      }
    }
    
    // Add fullscreen handlers to analysis chart
    this.addAnalysisChartFullscreenHandlers();
    
    console.log('✅ Interactive chart initialized with sparkline,', sparklineData.length, 'points');
  },
  
  // Add fullscreen handlers to analysis modal chart
  addAnalysisChartFullscreenHandlers() {
    const container = document.getElementById('analysisInteractiveChart');
    if (!container) return;
    
    // Prevent duplicate listeners
    if (container.hasAttribute('data-fullscreen-ready')) {
      return;
    }
    container.setAttribute('data-fullscreen-ready', 'true');
    
    let lastTap = 0;
    
    const activateFullscreen = () => {
      if (!window.landscapeChartController || !this.currentAsset) return;
      
      // Get current chart data from interactiveChartManager
      let chartData = [];
      const chartMode = window.interactiveChartManager?.currentMode || 'sparkline';
      
      if (chartMode === 'candle' && window.interactiveChartManager?.candleData) {
        chartData = window.interactiveChartManager.candleData;
      } else if (window.interactiveChartManager?.areaData) {
        chartData = window.interactiveChartManager.areaData;
      }
      
      if (chartData.length > 0) {
        window.landscapeChartController.activate(
          chartData,
          chartMode,
          this.currentAsset
        );
      } else {
        console.warn('⚠️ No analysis chart data available for fullscreen');
      }
    };
    
    // Mobile: Double-tap to activate
    container.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 300 && tapLength > 0) {
        activateFullscreen();
      }
      
      lastTap = currentTime;
    });
    
    // Desktop: Double-click to activate
    container.addEventListener('dblclick', (e) => {
      activateFullscreen();
    });
    
    console.log('✅ Fullscreen handlers added to analysis chart');
  },
  
  // Update interactive chart with new data
  updateInteractiveChart(historical) {
    if (!window.interactiveChartManager || !window.interactiveChartManager.chart) {
      console.warn('Chart not initialized, initializing now...');
      this.initializeInteractiveChart(historical);
      return;
    }
    
    // Check if we're in volume mode
    if (currentAnalysisDataType === 'volume') {
      const volumeData = historical.map(c => ({
        time: c.time,
        value: c.volume || 0,
        color: (c.close >= c.open) ? '#10B981' : '#EF4444'
      }));
      window.interactiveChartManager.setVolumeData(volumeData, window.interactiveChartManager.currentMode);
    } else {
      // Update current chart mode with price data
      if (window.interactiveChartManager.currentMode === 'candle') {
        const candleData = window.interactiveChartManager.transformToLWCFormat(historical);
        window.interactiveChartManager.setCandlestickData(candleData);
      } else {
        const closes = historical.map(c => c.close);
        const sparklineData = window.interactiveChartManager.transformSparklineToLWCFormat(
          closes,
          historical,
          this.getIntervalSeconds(this.currentTimeframe)
        );
        window.interactiveChartManager.setSparklineData(sparklineData);
      }
    }
    
    console.log('✅ Interactive chart updated');
  },
  
  // Get interval in seconds for a timeframe
  getIntervalSeconds(timeframe) {
    const map = {
      '1s': 1,
      '1m': 60,
      '5m': 300,
      '1h': 3600,
      '6h': 21600,
      '1d': 86400,
      '24hr': 86400,
      '30d': 86400,
      '6mo': 86400,
      '1y': 86400,
      'ytd': 86400,
      'all': 86400
    };
    return map[timeframe] || 86400;
  },
  
  // Calculate all technical indicators
  calculateIndicators(assetData) {
    const closes = assetData.closes;
    const dataPoints = closes ? closes.length : 0;
    
    console.log(`📊 Calculating indicators with ${dataPoints} data points`);
    
    const sma50 = analysisIndicators.calculateSMA(closes, 50);
    const sma200 = analysisIndicators.calculateSMA(closes, 200);
    const ema50 = analysisIndicators.calculateEMA(closes, 50);
    const ema200 = analysisIndicators.calculateEMA(closes, 200);
    const rsi = analysisIndicators.calculateRSI(closes, 14);
    const macd = analysisIndicators.calculateMACD(closes);
    
    const cross = analysisIndicators.detectCross(
      sma50 ? sma50.values : null,
      sma200 ? sma200.values : null
    );
    
    if (!sma50 || !ema50) console.warn(`⚠️ Insufficient data for 50-period indicators (need 50, have ${dataPoints})`);
    if (!sma200 || !ema200) console.warn(`⚠️ Insufficient data for 200-period indicators (need 200, have ${dataPoints})`);
    if (!rsi) console.warn(`⚠️ Insufficient data for RSI (need 15, have ${dataPoints})`);
    
    return {
      price: assetData.price,
      dataPoints: dataPoints,
      sma50: sma50 ? sma50.latest : null,
      sma200: sma200 ? sma200.latest : null,
      ema50: ema50 ? ema50.latest : null,
      ema200: ema200 ? ema200.latest : null,
      rsi: rsi ? rsi.latest : null,
      macd: macd,
      cross: cross
    };
  },
  
  // Populate modal with data
  populateModal(assetData, indicators, signal) {
    // Store complete asset data for landscape fullscreen
    this.currentAssetData = {
      ...assetData,
      ...indicators,
      signal: signal.signal,
      confidence: signal.confidence
    };
    
    // Header with logo
    document.getElementById('analysisAssetName').textContent = assetData.displayName || assetData.name;
    
    // Set coin logo
    const logoImg = document.getElementById('analysisAssetLogo');
    if (logoImg) {
      const logoUrl = this.getCoinLogo(assetData.symbol);
      if (logoUrl) {
        logoImg.src = logoUrl;
        logoImg.style.background = 'transparent';
        logoImg.style.padding = '0';
      } else {
        // Fallback: show first letter
        logoImg.style.display = 'flex';
        logoImg.style.alignItems = 'center';
        logoImg.style.justifyContent = 'center';
        logoImg.textContent = assetData.symbol.substring(0, 1);
        logoImg.style.fontSize = '16px';
        logoImg.style.fontWeight = 'bold';
        logoImg.style.color = '#fff';
      }
    }
    
    const signalBadge = document.getElementById('analysisSignal');
    signalBadge.textContent = `${signal.signal} (${signal.confidence})`;
    signalBadge.className = 'signal-badge ' + signal.signal.toLowerCase();
    
    // Price section with color coding
    const priceEl = document.getElementById('analysisPrice');
    const changeEl = document.getElementById('analysisChange');
    
    const isPricePositive = assetData.priceChange24h >= 0;
    priceEl.textContent = `$${this.formatNumber(assetData.price)}`;
    priceEl.style.color = isPricePositive ? 'var(--green)' : 'var(--red)';
    
    const changeSign = isPricePositive ? '+' : '';
    changeEl.textContent = `${changeSign}${assetData.priceChange24h.toFixed(2)}%`;
    changeEl.className = isPricePositive ? 'price-change positive' : 'price-change negative';
    
    document.getElementById('analysisVolume').textContent = `$${this.formatLargeNumber(assetData.volume24h)}`;
    document.getElementById('analysisMarketCap').textContent = `$${this.formatLargeNumber(assetData.marketCap)}`;
    
    // ATH Market Cap - Calculate from ATH price and circulating supply (crypto only)
    const athMarketCapEl = document.getElementById('analysisATHMarketCap');
    if (this.currentATH && this.currentATH.price && assetData.circulatingSupply) {
      const athMarketCap = this.currentATH.price * assetData.circulatingSupply;
      athMarketCapEl.textContent = `ATH: $${this.formatLargeNumber(athMarketCap)}`;
      athMarketCapEl.style.color = '#888';
    } else if (this.currentAssetType === 'stock') {
      athMarketCapEl.textContent = 'ATH: N/A';
      athMarketCapEl.style.color = '#888';
    } else {
      athMarketCapEl.textContent = 'ATH: —';
      athMarketCapEl.style.color = '#888';
    }
    
    document.getElementById('analysisRank').textContent = `#${assetData.rank}`;
    
    // Volume Change (Inflow/Outflow) - simple indicator based on price direction
    const volumeChangeEl = document.getElementById('analysisVolumeChange');
    if (volumeChangeEl) {
      if (assetData.volume24h && (assetData.priceChange24h !== undefined || assetData.priceChangePercent24h !== undefined)) {
        // Use whichever price change field is available (crypto has priceChange24h, stocks have priceChangePercent24h)
        const priceChange = assetData.priceChange24h !== undefined ? assetData.priceChange24h : assetData.priceChangePercent24h;
        
        // Show simple Inflow/Outflow indicator based on price direction
        if (priceChange > 0) {
          volumeChangeEl.textContent = '↑ Inflow';
          volumeChangeEl.style.color = '#00ff41';
        } else if (priceChange < 0) {
          volumeChangeEl.textContent = '↓ Outflow';
          volumeChangeEl.style.color = '#ff006e';
        } else {
          volumeChangeEl.textContent = '— Neutral';
          volumeChangeEl.style.color = '#888';
        }
      } else {
        volumeChangeEl.textContent = '';
      }
    }
    
    // ATH Data
    if (this.currentATH) {
      const athDate = new Date(this.currentATH.date);
      document.getElementById('athPrice').textContent = `$${this.formatNumber(this.currentATH.price)}`;
      document.getElementById('athDate').textContent = athDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const athPercent = document.getElementById('athPercent');
      athPercent.textContent = `${this.currentATH.percentFromATH.toFixed(1)}%`;
      athPercent.style.color = 'var(--red)';
    }
    
    // Indicators
    this.updateIndicators(indicators, signal);
    
    // Update cat image based on persona
    const catImage = document.getElementById('analysisCatImage');
    if (catImage && window.personaManager) {
      catImage.src = personaManager.getImage('explaining');
    }
    
    // Link glossary terms in analysis modal
    if (window.glossaryLinker) {
      setTimeout(() => {
        window.glossaryLinker.linkAnalysisModal();
      }, 100);
    }
    
    // Fetch and display related news
    this.fetchAndDisplayNews(assetData.symbol);
  },
  
  // Fetch and display Market Cycle Outlook
  async fetchAndDisplayMarketCycle(asset = 'BTC') {
    const cycleSection = document.getElementById('marketCycleSection');
    const cycleLoading = document.getElementById('marketCycleLoading');
    const cycleData = document.getElementById('marketCycleData');
    const cycleGate = document.getElementById('marketCycleGate');
    
    if (!cycleSection) return;
    
    // Check Premium access using centralized feature control
    const hasPremiumAccess = typeof hasFeatureAccess !== 'undefined' && hasFeatureAccess('marketCycleOutlook');
    
    cycleSection.style.display = 'block';
    
    if (!hasPremiumAccess) {
      // Show Premium gate
      cycleLoading.style.display = 'none';
      cycleData.style.display = 'none';
      cycleGate.style.display = 'block';
      return;
    }
    
    // Show loading state
    cycleLoading.style.display = 'block';
    cycleData.style.display = 'none';
    cycleGate.style.display = 'none';
    
    try {
      const response = await fetch(`/api/analysis/market-cycle?asset=${asset}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const prediction = await response.json();
      
      // Populate data
      this.populateMarketCycleData(prediction);
      
      // Show data, hide loading
      cycleLoading.style.display = 'none';
      cycleData.style.display = 'block';
      
      console.log('✅ Market Cycle data loaded');
    } catch (error) {
      console.error('Failed to load Market Cycle data:', error);
      cycleLoading.innerHTML = '<p style="color: var(--red);">Failed to load market cycle data.</p>';
    }
  },
  
  // Populate Market Cycle UI with data
  populateMarketCycleData(prediction) {
    // Overall signal card
    const signalCard = document.getElementById('cycleSignalCard');
    const signalValue = document.getElementById('cycleSignal');
    const confidence = document.getElementById('cycleConfidence');
    
    signalValue.textContent = prediction.signal;
    confidence.textContent = prediction.confidence;
    
    // Apply signal colors
    signalCard.className = 'cycle-signal-card ' + prediction.signal.toLowerCase();
    signalValue.className = 'cycle-signal-value ' + prediction.signal.toLowerCase();
    
    // Fear & Greed
    document.getElementById('cycleFearGreed').textContent = prediction.fearGreed.value;
    document.getElementById('cycleFearGreedSignal').textContent = prediction.fearGreed.signal;
    document.getElementById('cycleFearGreedSignal').className = `cycle-indicator-signal ${prediction.fearGreed.signal.toLowerCase()}`;
    
    // RSI
    const rsiValue = prediction.rsi.value ? prediction.rsi.value.toFixed(2) : '--';
    document.getElementById('cycleRSI').textContent = rsiValue;
    document.getElementById('cycleRSISignal').textContent = prediction.rsi.signal;
    document.getElementById('cycleRSISignal').className = `cycle-indicator-signal ${prediction.rsi.signal.toLowerCase()}`;
    
    // MACD
    const macdValue = prediction.macd.histogram ? prediction.macd.histogram.toFixed(2) : '--';
    document.getElementById('cycleMACDHist').textContent = macdValue;
    document.getElementById('cycleMACDSignal').textContent = prediction.macd.signal;
    document.getElementById('cycleMACDSignal').className = `cycle-indicator-signal ${prediction.macd.signal.toLowerCase()}`;
    
    // Trend
    document.getElementById('cycleTrendValue').textContent = prediction.trend.description || '--';
    document.getElementById('cycleTrendSignal').textContent = prediction.trend.signal;
    document.getElementById('cycleTrendSignal').className = `cycle-indicator-signal ${prediction.trend.signal.toLowerCase()}`;
    
    // Explanation
    const explanation = document.getElementById('cycleExplanation');
    explanation.textContent = prediction.explanation || 'Market cycle analysis complete.';
    
    // Last updated
    const updatedAt = new Date(prediction.updatedAt);
    const timeAgo = this.getTimeAgo(updatedAt);
    document.getElementById('cycleUpdated').textContent = `Updated: ${timeAgo}`;
  },
  
  // Get human-readable time ago
  getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleString();
  },

  // Fetch and display asset-specific news
  async fetchAndDisplayNews(symbol) {
    const newsSection = document.getElementById('analysisNewsSection');
    const newsList = document.getElementById('analysisNewsList');
    
    if (!newsSection || !newsList) return;
    
    // Check if this is a stock (known stock symbols) or crypto
    const knownStocks = ['AAPL', 'TSLA', 'SPY', 'NVDA', 'GOOGL', 'MSFT', 'AMZN', 'META', 'AMD', 'QQQ', 'DIA'];
    const isStock = knownStocks.includes(symbol.toUpperCase());
    
    try {
      // Show loading state
      newsSection.style.display = 'block';
      newsList.innerHTML = '<p class="loading-text">Loading news...</p>';
      
      let response, data;
      
      if (isStock) {
        // Fetch stock news from Finnhub
        response = await fetch(`/api/news/${symbol}`);
        data = await response.json();
      } else {
        // Fetch crypto-specific news from CryptoCompare
        response = await fetch(`/api/crypto-news/coin/${symbol}`);
        data = await response.json();
      }
      
      if (data.articles && data.articles.length > 0) {
        newsList.innerHTML = data.articles.map(article => `
          <div class="news-item" onclick="window.open('${article.url}', '_blank')">
            <div class="news-item-title">${article.title}</div>
            <div class="news-item-source">
              <span>${article.source}</span>
              <span class="news-item-date">•</span>
              <span class="news-item-date">${this.formatNewsDate(article.publishedAt)}</span>
            </div>
          </div>
        `).join('');
      } else {
        newsList.innerHTML = '<p class="loading-text">No recent news available for this asset.</p>';
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      newsList.innerHTML = '<p class="loading-text">Unable to load news at this time.</p>';
    }
  },
  
  // Format news date (timestamp to readable format)
  formatNewsDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },
  
  // Fetch and display Solana on-chain data
  async fetchAndDisplaySolanaData(tokenAddress) {
    const solanaSection = document.getElementById('solanaSectionWrapper');
    if (!solanaSection) {
      console.warn('Solana section not found in DOM');
      return;
    }
    
    try {
      console.log(`🔍 Fetching Solana data for ${tokenAddress}...`);
      
      // Show loading state
      solanaSection.style.display = 'block';
      solanaSection.innerHTML = `
        <div class="analysis-section" style="margin-top: 20px;">
          <h3>SOLANA DETAILS</h3>
          <p class="loading-text">Loading on-chain data...</p>
        </div>
      `;
      
      // Fetch token metadata and holders
      const [metadataRes, holdersRes] = await Promise.all([
        fetch(`/api/solana/metadata/${tokenAddress}`),
        fetch(`/api/solana/holders/${tokenAddress}`)
      ]);
      
      let metadata = null, holders = null;
      
      if (metadataRes.ok) {
        const metadataResponse = await metadataRes.json();
        metadata = metadataResponse.data || metadataResponse;
      }
      
      if (holdersRes.ok) {
        const holdersResponse = await holdersRes.json();
        holders = holdersResponse.data || holdersResponse;
      }
      
      // Store for later use
      this.currentSolanaData = { metadata, holders };
      
      // Build UI
      let html = '<div class="analysis-section" style="margin-top: 20px;"><h3>SOLANA DETAILS</h3>';
      
      // Token metadata
      if (metadata && metadata.name) {
        html += `
          <div class="solana-info-grid">
            <div class="solana-info-item">
              <span class="solana-label">Name:</span>
              <span class="solana-value">${metadata.name || 'Unknown'}</span>
            </div>
            <div class="solana-info-item">
              <span class="solana-label">Symbol:</span>
              <span class="solana-value">${metadata.symbol || 'N/A'}</span>
            </div>
            <div class="solana-info-item">
              <span class="solana-label">Decimals:</span>
              <span class="solana-value">${metadata.decimals !== undefined ? metadata.decimals : 'N/A'}</span>
            </div>
            <div class="solana-info-item">
              <span class="solana-label">Supply:</span>
              <span class="solana-value">${metadata.supply ? this.formatLargeNumber(metadata.supply) : 'N/A'}</span>
            </div>
          </div>
        `;
      }
      
      // Token holders
      if (holders && holders.totalHolders !== undefined) {
        html += `
          <div class="solana-holders-section" style="margin-top: 15px;">
            <h4 style="color: var(--blue); font-size: 14px; margin-bottom: 10px;">HOLDER DISTRIBUTION</h4>
            <div class="solana-info-item">
              <span class="solana-label">Total Holders:</span>
              <span class="solana-value">${holders.totalHolders.toLocaleString()}</span>
            </div>
        `;
        
        if (holders.topHolders && holders.topHolders.length > 0) {
          html += '<h4 style="color: var(--blue); font-size: 14px; margin: 15px 0 10px;">TOP HOLDERS</h4>';
          html += '<div class="solana-holders-list">';
          
          holders.topHolders.slice(0, 5).forEach((holder, idx) => {
            const percentage = holder.percentage ? holder.percentage.toFixed(2) : '0.00';
            const balance = holder.balance ? this.formatLargeNumber(holder.balance) : '0';
            const address = holder.address || 'Unknown';
            const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
            
            html += `
              <div class="solana-holder-item">
                <span class="holder-rank">#${idx + 1}</span>
                <span class="holder-address" title="${address}">${shortAddress}</span>
                <span class="holder-balance">${balance}</span>
                <span class="holder-percentage">${percentage}%</span>
              </div>
            `;
          });
          
          html += '</div>';
        }
        
        html += '</div>';
      }
      
      // Contract address
      html += `
        <div class="solana-info-item" style="margin-top: 15px;">
          <span class="solana-label">Contract:</span>
          <span class="solana-value" style="word-break: break-all; font-size: 11px;">${tokenAddress}</span>
        </div>
      `;
      
      html += '</div>';
      
      // Update UI
      solanaSection.innerHTML = html;
      
      console.log('✅ Solana data loaded successfully');
      
    } catch (error) {
      console.error('Failed to fetch Solana data:', error);
      solanaSection.innerHTML = `
        <div class="analysis-section" style="margin-top: 20px;">
          <h3>SOLANA DETAILS</h3>
          <p class="loading-text">Unable to load on-chain data at this time.</p>
        </div>
      `;
    }
  },
  
  // Update technical indicators only (for timeframe changes)
  updateIndicators(indicators, signal) {
    const insufficientData = indicators.dataPoints < 200;
    const insufficientForSMA50 = indicators.dataPoints < 50;
    const insufficientForRSI = indicators.dataPoints < 15;
    
    document.getElementById('ema50').textContent = indicators.ema50 ? `$${this.formatNumber(indicators.ema50)}` : (insufficientForSMA50 ? 'Need 50+ pts' : '-');
    document.getElementById('ema200').textContent = indicators.ema200 ? `$${this.formatNumber(indicators.ema200)}` : (insufficientData ? 'Need 200+ pts' : '-');
    document.getElementById('sma50').textContent = indicators.sma50 ? `$${this.formatNumber(indicators.sma50)}` : (insufficientForSMA50 ? 'Need 50+ pts' : '-');
    document.getElementById('sma200').textContent = indicators.sma200 ? `$${this.formatNumber(indicators.sma200)}` : (insufficientData ? 'Need 200+ pts' : '-');
    document.getElementById('rsi14').textContent = indicators.rsi ? indicators.rsi.toFixed(2) : (insufficientForRSI ? 'Need 15+ pts' : '-');
    document.getElementById('macd').textContent = indicators.macd ? indicators.macd.latest.toFixed(2) : '-';
    
    // Update signal badge
    const signalBadge = document.getElementById('analysisSignal');
    signalBadge.textContent = `${signal.signal} (${signal.confidence})`;
    signalBadge.className = 'signal-badge ' + signal.signal.toLowerCase();
    
    // Cross signal
    const crossSignalEl = document.getElementById('crossSignal');
    const crossTextEl = document.getElementById('crossText');
    
    if (indicators.cross && (indicators.cross.type === 'golden' || indicators.cross.type === 'death')) {
      crossSignalEl.style.display = 'block';
      crossSignalEl.className = 'cross-signal ' + indicators.cross.type;
      crossTextEl.textContent = indicators.cross.message;
    } else {
      crossSignalEl.style.display = 'none';
    }
    
    // Re-link glossary terms after updating indicators
    if (window.glossaryLinker) {
      setTimeout(() => {
        window.glossaryLinker.linkAnalysisModal();
      }, 50);
    }
  },
  
  // Generate AI analysis text
  generateAIAnalysis(assetData, indicators, signal) {
    const persona = window.personaManager ? personaManager.getPersona() : 'business';
    const aiText = document.getElementById('aiAnalysis');
    
    let analysis = '';
    
    if (persona === 'casual') {
      // Smart-ass commentary
      analysis = `Alright, let's break down ${assetData.symbol}... `;
      
      if (signal.signal === 'BUY') {
        analysis += `Looking pretty tasty right now! ${signal.reasons.join(', ')}. `;
        analysis += `But hey, don't blame me if this ages like milk. 😼`;
      } else if (signal.signal === 'SELL') {
        analysis += `Yikes, not looking great. ${signal.reasons.join(', ')}. `;
        analysis += `Might wanna exit stage left before this dumpster catches fire. 🔥`;
      } else {
        analysis += `Meh, it's in limbo. ${signal.reasons.join(', ')}. `;
        analysis += `Probably safe to sit on your hands for now. 😴`;
      }
      
      if (indicators.rsi) {
        if (indicators.rsi < 30) {
          analysis += ` RSI says it's oversold - everyone's panic selling like there's no tomorrow!`;
        } else if (indicators.rsi > 70) {
          analysis += ` RSI is screaming overbought - FOMO is real right now.`;
        }
      }
    } else {
      // Professional commentary
      analysis = `Technical analysis for ${assetData.symbol}: `;
      
      if (signal.signal === 'BUY') {
        analysis += `Bullish indicators present. ${signal.reasons.join(', ')}. `;
        analysis += `Consider this a potential entry opportunity based on technical signals.`;
      } else if (signal.signal === 'SELL') {
        analysis += `Bearish signals detected. ${signal.reasons.join(', ')}. `;
        analysis += `Risk management suggests caution or position reduction.`;
      } else {
        analysis += `Neutral market conditions. ${signal.reasons.join(', ')}. `;
        analysis += `Monitor for clear directional signals before taking action.`;
      }
      
      if (indicators.cross && indicators.cross.type !== 'none') {
        analysis += ` ${indicators.cross.message}`;
      }
    }
    
    aiText.textContent = analysis;
  },
  
  // Show loading state
  showLoadingState() {
    // Hide avatar until data loads
    const avatarContainer = document.getElementById('avatarDisplayContainer');
    if (avatarContainer) avatarContainer.style.display = 'none';
    
    document.getElementById('analysisAssetName').textContent = 'Loading...';
    document.getElementById('analysisSignal').textContent = 'ANALYZING';
    document.getElementById('analysisSignal').className = 'signal-badge';
    document.getElementById('analysisSignal').style.display = 'block';
    document.getElementById('analysisPrice').textContent = '$0.00';
    document.getElementById('analysisChange').textContent = '+0%';
    document.getElementById('aiAnalysis').textContent = 'Analyzing market conditions...';
  },
  
  // Show error state - silently close modal instead of showing error
  showErrorState(message) {
    // Silently close the modal and let user try another ticker
    console.warn(`Analysis failed: ${message}`);
    this.closeAnalysisModal();
  },
  
  // Close modal
  closeAnalysisModal() {
    const modal = document.getElementById('analysisModal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    // Stop live updates
    if (this.liveUpdateInterval) {
      clearInterval(this.liveUpdateInterval);
      this.liveUpdateInterval = null;
    }
    
    // Destroy chart to clean up resources
    if (window.interactiveChartManager) {
      window.interactiveChartManager.destroyChart();
    }
    
    this.currentAsset = null;
  },
  
  // Helper: Format number
  formatNumber(num) {
    if (num >= 1000) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return num.toFixed(2);
  },
  
  // Helper: Get coin logo URL
  getCoinLogo(symbol) {
    const logoMap = {
      'BTC': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      'ETH': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      'BNB': 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      'SOL': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      'XRP': 'https://assets.coingecko.com/coins/images/44/large/xrp-icon.png',
      'BONK': 'https://assets.coingecko.com/coins/images/28600/large/bonk_200x200.png',
      'WIF': 'https://assets.coingecko.com/coins/images/33677/large/dogwifhat.png',
      'PEPE': 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.png',
      'DOGE': 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
      'SHIB': 'https://assets.coingecko.com/coins/images/11939/large/shib.png',
      'UNI': 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
      'LINK': 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
      'AAVE': 'https://assets.coingecko.com/coins/images/13016/large/aave-token-square.png',
      'USDT': 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png',
      'USDC': 'https://assets.coingecko.com/coins/images/6319/large/usd-coin-usdc.png',
      'ADA': 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
      'DOT': 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
      'AVAX': 'https://assets.coingecko.com/coins/images/9072/large/avalanche.png'
    };
    return logoMap[symbol] || null;
  },

  // Helper: Format market cap and volume with adaptive precision
  formatLargeNumber(num) {
    // Reject null/undefined/NaN/Infinity, preserve sub-dollar values and zero
    if (num == null || !isFinite(num)) return '0';
    
    // Handle negative numbers
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    
    let formatted;
    if (absNum >= 1e12) {
      // Trillions: 2 decimals
      formatted = (absNum / 1e12).toFixed(2) + 'T';
    } else if (absNum >= 1e9) {
      // Billions: 1 decimal
      formatted = (absNum / 1e9).toFixed(1) + 'B';
    } else if (absNum >= 1e6) {
      // Millions: 1 decimal
      formatted = (absNum / 1e6).toFixed(1) + 'M';
    } else if (absNum >= 1e3) {
      // Thousands: 0 decimals
      formatted = (absNum / 1e3).toFixed(0) + 'K';
    } else {
      // Sub-thousand values: preserve precision
      formatted = absNum.toFixed(2);
    }
    
    return isNegative ? '-' + formatted : formatted;
  }
};

// Global functions for HTML onclick handlers
function closeAnalysisModal() {
  analysisModalController.closeAnalysisModal();
}

// Current analysis data type ('price' or 'volume')
let currentAnalysisDataType = 'price';

function toggleAnalysisDataType(dataType) {
  currentAnalysisDataType = dataType;
  
  // Update button states
  const priceBtn = document.getElementById('analysisPriceBtn');
  const volumeBtn = document.getElementById('analysisVolumeBtn');
  
  if (priceBtn && volumeBtn) {
    priceBtn.classList.toggle('active', dataType === 'price');
    volumeBtn.classList.toggle('active', dataType === 'volume');
  }
  
  // Update chart title
  const chartTitle = document.getElementById('analysisChartTitle');
  if (chartTitle) {
    chartTitle.textContent = dataType === 'price' ? 'Price Chart' : 'Volume Chart';
  }
  
  // Refresh chart with current data
  if (analysisModalController.currentAsset && analysisModalController.currentAsset.historical) {
    if (dataType === 'volume') {
      // Switch to volume histogram display - preserve current mode (sparkline or candle)
      const currentMode = window.interactiveChartManager.currentMode || 'sparkline';
      const volumeData = analysisModalController.currentAsset.historical.map(c => ({
        time: c.time,
        value: c.volume || 0,
        color: (c.close >= c.open) ? '#10B981' : '#EF4444' // Green for up, red for down
      }));
      window.interactiveChartManager.setVolumeData(volumeData, currentMode);
    } else {
      // Switch back to price display - use last mode (sparkline or candle)
      const btnSparkline = document.getElementById('btnSparkline');
      const isSparklineActive = btnSparkline && btnSparkline.classList.contains('active');
      toggleAnalysisChart(isSparklineActive ? 'sparkline' : 'candle');
    }
  }
  
  console.log(`📊 Analysis chart switched to ${dataType}`);
}

function toggleAnalysisChart(type) {
  if (!window.interactiveChartManager || !window.interactiveChartManager.chart) {
    console.warn('Chart not initialized');
    return;
  }
  
  const btnSparkline = document.getElementById('btnSparkline');
  const btnCandle = document.getElementById('btnCandle');
  
  if (type === 'sparkline') {
    btnSparkline.classList.add('active');
    btnCandle.classList.remove('active');
  } else {
    btnSparkline.classList.remove('active');
    btnCandle.classList.add('active');
  }
  
  // Check if we're in volume mode
  if (currentAnalysisDataType === 'volume') {
    // Show volume histogram regardless of sparkline/candle toggle
    if (analysisModalController.currentAsset && analysisModalController.currentAsset.historical) {
      const volumeData = analysisModalController.currentAsset.historical.map(c => ({
        time: c.time,
        value: c.volume || 0,
        color: (c.close >= c.open) ? '#10B981' : '#EF4444'
      }));
      window.interactiveChartManager.setVolumeData(volumeData, type);
    }
  } else {
    // Show price data (sparkline or candle)
    if (analysisModalController.currentAsset && analysisModalController.currentAsset.historical) {
      if (type === 'sparkline') {
        const closes = analysisModalController.currentAsset.historical.map(c => c.close);
        const sparklineData = window.interactiveChartManager.transformSparklineToLWCFormat(
          closes,
          analysisModalController.currentAsset.historical,
          analysisModalController.getIntervalSeconds(analysisModalController.currentTimeframe)
        );
        window.interactiveChartManager.setSparklineData(sparklineData);
      } else {
        const candleData = window.interactiveChartManager.transformToLWCFormat(
          analysisModalController.currentAsset.historical
        );
        window.interactiveChartManager.setCandlestickData(candleData);
      }
    }
  }
  
  console.log('✅ Chart toggled to', type, '(data type:', currentAnalysisDataType + ')');
}
