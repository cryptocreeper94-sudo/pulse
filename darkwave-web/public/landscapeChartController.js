// Landscape Fullscreen Chart Controller
// Tap chart → Landscape fullscreen with pinch-to-zoom, 2/3 chart + 1/3 metrics

const landscapeChartController = {
  isActive: false,
  chart: null,
  chartSeries: null,
  chartData: [],
  currentMode: 'sparkline',
  assetData: null,
  overlayEl: null,
  
  // Pinch-to-zoom state
  lastTouchDistance: 0,
  currentZoom: 1,
  
  // Debounce for tap activation
  activateDebounce: null,
  
  // Activate landscape fullscreen
  activate(chartData, mode = 'sparkline', assetData = null) {
    if (this.isActive) return;
    
    // Clear any pending debounce
    if (this.activateDebounce) {
      clearTimeout(this.activateDebounce);
    }
    
    // Debounce activation to prevent double-tap issues
    this.activateDebounce = setTimeout(() => {
      this._doActivate(chartData, mode, assetData);
    }, 50);
  },
  
  // Actual activation logic
  _doActivate(chartData, mode = 'sparkline', assetData = null) {
    if (this.isActive) return;
    
    // Validate chart data
    if (!chartData || chartData.length === 0) {
      console.error('❌ Cannot activate landscape fullscreen: No chart data provided');
      return;
    }
    
    this.chartData = chartData;
    this.currentMode = mode;
    this.assetData = assetData;
    this.isActive = true;
    this.currentTimeframe = '1d';
    
    console.log('🌄 Activating landscape fullscreen chart with', chartData.length, 'data points');
    
    // Request screen orientation (landscape) - gracefully handle errors
    try {
      if (screen.orientation && typeof screen.orientation.lock === 'function') {
        screen.orientation.lock('landscape').catch(err => {
          console.log('Could not lock landscape orientation (safe to ignore):', err);
        });
      }
    } catch (err) {
      // iOS Safari doesn't support orientation lock
      console.log('Orientation lock not supported (safe to ignore)');
    }
    
    // Create fullscreen overlay
    this.createOverlay();
    
    // Initialize chart
    this.initializeChart();
    
    // Bind gestures
    this.bindGestures();
  },
  
  // Create fullscreen overlay
  createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'landscape-fullscreen-overlay';
    overlay.className = 'landscape-fullscreen-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000000;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `;
    
    overlay.innerHTML = `
      <!-- Header with Controls -->
      <div style="padding: 12px 16px; background: rgba(20, 20, 30, 0.95); border-bottom: 1px solid rgba(100, 150, 255, 0.1); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <select id="landscape-timeframe-select" style="padding: 6px 10px; background: rgba(56, 97, 251, 0.1); border: 2px solid rgba(56, 97, 251, 0.3); border-radius: 4px; color: #ffffff; font-size: 12px; font-weight: 600; cursor: pointer; text-transform: uppercase;" onchange="landscapeChartController.changeTimeframe(this.value)">
            <option value="1s">1 Second</option>
            <option value="5m">5 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="6h">6 Hours</option>
            <option value="1d" selected>24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="6mo">6 Months</option>
            <option value="1y">1 Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div style="display: flex; gap: 8px;">
          <span id="landscape-timestamp" style="font-size: 12px; color: #888;">—</span>
        </div>
        <button class="landscape-exit-btn" onclick="landscapeChartController.exit()" style="padding: 8px 12px; background: rgba(255,0,0,0.2); border: 1px solid #ff006e; border-radius: 4px; color: #ff006e; cursor: pointer; font-weight: 600; font-size: 12px;">✕ Exit</button>
      </div>
      
      <!-- Main Content Area -->
      <div style="display: flex; flex: 1; overflow: hidden; gap: 0;">
        <!-- Chart Section (66% width) -->
        <div style="flex: 2; display: flex; flex-direction: column; position: relative; overflow: hidden;">
          <div id="landscape-chart-container" style="flex: 1; width: 100%; height: 100%;"></div>
          
          <!-- Zoom & Status Indicators -->
          <div style="padding: 8px 12px; background: rgba(20, 20, 30, 0.8); border-top: 1px solid rgba(100, 150, 255, 0.1); display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
            <span id="landscape-zoom-indicator" style="color: #3861FB; font-weight: 600;">Zoom: 1.0x</span>
            <span id="landscape-status" style="color: #10B981;">Ready</span>
          </div>
        </div>
        
        <!-- Metrics Sidebar (34% width) -->
        <div style="flex: 1; background: rgba(20, 20, 30, 0.9); border-left: 1px solid rgba(100, 150, 255, 0.1); overflow-y: auto; padding: 16px; display: flex; flex-direction: column;">
          <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(100, 150, 255, 0.1);">
            <h3 style="margin: 0; font-size: 16px; color: #ffffff; margin-bottom: 6px;">${this.assetData?.displayName || this.assetData?.name || 'Asset'}</h3>
            <div style="font-size: 20px; font-weight: 700; color: #3861FB;">${this.formatPrice(this.assetData?.price)}</div>
          </div>
          
          <div style="flex: 1; overflow-y: auto; font-size: 13px;">
            ${this.renderMetrics()}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    this.overlayEl = overlay;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Update timestamp immediately
    this.updateTimestamp();
    
    // Update timestamp every second
    this.timestampInterval = setInterval(() => {
      this.updateTimestamp();
    }, 1000);
    
    // Link glossary terms after DOM is ready
    setTimeout(() => {
      this.linkGlossaryTerms();
      this.loadNotepadContent();
    }, 100);
  },
  
  // Link clickable glossary terms
  linkGlossaryTerms() {
    const terms = this.overlayEl.querySelectorAll('.landscape-term');
    terms.forEach(label => {
      const term = label.getAttribute('data-term');
      if (!term) return;
      
      // Make it clickable
      label.style.cursor = 'pointer';
      label.style.textDecoration = 'underline dotted';
      label.style.textUnderlineOffset = '2px';
      
      label.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showGlossaryPopup(term);
      });
      
      // Hover effect
      label.addEventListener('mouseenter', () => {
        label.style.color = 'var(--accent)';
      });
      
      label.addEventListener('mouseleave', () => {
        label.style.color = '';
      });
    });
  },
  
  // Show glossary popup
  showGlossaryPopup(term) {
    if (window.glossaryService && window.showCatPopup) {
      const definition = window.glossaryService.getDefinition(term);
      if (definition) {
        const catMode = window.currentCatMode || 'off';
        let popupText = '';
        
        if (catMode === 'business') {
          popupText = `${definition.definition}\n\n💼 Business Cat: Professional investors use this metric to analyze market trends and make informed decisions.`;
        } else if (catMode === 'casual') {
          popupText = `${definition.definition}\n\n🐱 Casual Cat: ${definition.commentary}`;
        } else {
          popupText = definition.definition;
        }
        
        window.showCatPopup(term.toUpperCase(), popupText);
      }
    }
  },
  
  // Load notepad content for current asset
  loadNotepadContent() {
    const notepad = document.getElementById('landscape-notepad');
    if (!notepad || !this.assetData) return;
    
    const symbol = this.assetData.symbol || 'BTC';
    const savedNotes = localStorage.getItem(`analysis-notes-${symbol}`);
    if (savedNotes) {
      notepad.value = savedNotes;
    }
    
    // Auto-save on input
    notepad.addEventListener('input', () => {
      localStorage.setItem(`analysis-notes-${symbol}`, notepad.value);
      console.log(`💾 Notes auto-saved for ${symbol}`);
    });
  },
  
  // Copy notes to clipboard
  copyNotes() {
    const notepad = document.getElementById('landscape-notepad');
    if (!notepad) return;
    
    if (notepad.value.trim() === '') {
      if (window.showCatPopup) {
        window.showCatPopup('EMPTY NOTEPAD', 'Nothing to copy! Write some notes first.');
      }
      return;
    }
    
    notepad.select();
    document.execCommand('copy');
    
    if (window.showCatPopup) {
      window.showCatPopup('COPIED!', 'Your notes have been copied to clipboard. Paste them anywhere!');
    }
    console.log('📋 Notes copied to clipboard');
  },
  
  // Render metrics sidebar with clickable glossary terms
  renderMetrics() {
    if (!this.assetData) {
      return '<p style="color: #888;">No data available</p>';
    }
    
    return `
      <div class="landscape-metric-group">
        <label>24h Change</label>
        <span class="${this.assetData.priceChange24h >= 0 ? 'positive' : 'negative'}">
          ${this.assetData.priceChange24h >= 0 ? '+' : ''}${this.assetData.priceChange24h?.toFixed(2) || '0.00'}%
        </span>
      </div>
      
      <div class="landscape-metric-group">
        <label class="landscape-term" data-term="Market Cap">Market Cap</label>
        <span>${this.formatMarketCap(this.assetData.marketCap)}</span>
      </div>
      
      <div class="landscape-metric-group">
        <label class="landscape-term" data-term="Volume">24h Volume</label>
        <span>${this.formatVolume(this.assetData.volume24h)}</span>
      </div>
      
      <div class="landscape-metric-group">
        <label>Circulating Supply</label>
        <span>${this.formatSupply(this.assetData.circulatingSupply)}</span>
      </div>
      
      ${this.assetData.ath ? `
        <div class="landscape-metric-group">
          <label class="landscape-term" data-term="ATH">All-Time High</label>
          <span>${this.formatPrice(this.assetData.ath)}</span>
        </div>
      ` : ''}
      
      <div class="landscape-metric-divider"></div>
      
      <div class="landscape-metric-group">
        <label class="landscape-term" data-term="RSI">RSI (14)</label>
        <span>${this.assetData.rsi?.toFixed(2) || 'N/A'}</span>
      </div>
      
      <div class="landscape-metric-group">
        <label class="landscape-term" data-term="SMA (50-day)">SMA 50</label>
        <span>${this.formatPrice(this.assetData.sma50)}</span>
      </div>
      
      <div class="landscape-metric-group">
        <label class="landscape-term" data-term="SMA (200-day)">SMA 200</label>
        <span>${this.formatPrice(this.assetData.sma200)}</span>
      </div>
      
      <!-- Notepad Section -->
      <div class="landscape-metric-divider"></div>
      <div class="landscape-notepad-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <label style="font-size: 12px; font-weight: 700; color: var(--text-primary);">QUICK NOTES</label>
          <button onclick="landscapeChartController.copyNotes()" style="font-size: 10px; padding: 4px 8px; background: var(--accent); color: #000; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">📋 Copy</button>
        </div>
        <textarea id="landscape-notepad" placeholder="Jot down observations, targets, strategies..." style="width: 100%; height: 80px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; color: var(--text-primary); font-size: 11px; resize: vertical; font-family: inherit;"></textarea>
        <div style="font-size: 9px; color: #666; margin-top: 4px;">Auto-saves as you type</div>
      </div>
    `;
  },
  
  // Initialize chart
  initializeChart() {
    const container = document.getElementById('landscape-chart-container');
    if (!container) {
      console.error('Landscape chart container not found');
      return;
    }
    
    // Force explicit dimensions for the container
    const width = window.innerWidth * 0.66; // 66% of viewport
    const height = window.innerHeight - 100; // Account for header + footer
    
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    
    // Create Lightweight Chart with explicit sizing
    this.chart = LightweightCharts.createChart(container, {
      width: Math.floor(width),
      height: Math.floor(height),
      layout: {
        background: { color: '#000000' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: '#1A1A1A' },
        horzLines: { color: '#1A1A1A' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Magnet,
        vertLine: {
          color: '#3861FB',
          width: 2,
          style: LightweightCharts.LineStyle.Solid,
          labelBackgroundColor: '#3861FB',
        },
        horzLine: {
          color: '#3861FB',
          width: 2,
          style: LightweightCharts.LineStyle.Solid,
          labelBackgroundColor: '#3861FB',
        },
      },
      timeScale: {
        borderColor: '#2B2B2B',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2B2B2B',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true, // Enable pinch-to-zoom
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
    });
    
    // Add series based on mode
    if (this.currentMode === 'candle') {
      this.chartSeries = this.chart.addCandlestickSeries({
        upColor: '#10B981',
        downColor: '#EF4444',
        borderVisible: false,
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
      });
    } else {
      this.chartSeries = this.chart.addAreaSeries({
        lineColor: '#3861FB',
        topColor: 'rgba(56, 97, 251, 0.4)',
        bottomColor: 'rgba(56, 97, 251, 0.0)',
        lineWidth: 2,
      });
    }
    
    // Set data
    this.chartSeries.setData(this.chartData);
    
    // Fit content
    this.chart.timeScale().fitContent();
    
    console.log('✅ Landscape chart initialized with', this.chartData.length, 'points');
  },
  
  // Bind pinch-to-zoom gestures
  bindGestures() {
    const container = document.getElementById('landscape-chart-container');
    if (!container) return;
    
    let initialDistance = 0;
    
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialDistance = this.getTouchDistance(e.touches);
      }
    });
    
    container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        
        const currentDistance = this.getTouchDistance(e.touches);
        const zoomDelta = currentDistance / initialDistance;
        
        // Update zoom level (clamp between 0.5x and 5x)
        this.currentZoom = Math.max(0.5, Math.min(5, this.currentZoom * zoomDelta));
        
        // Update zoom indicator
        const indicator = document.getElementById('landscape-zoom-indicator');
        if (indicator) {
          indicator.textContent = `Zoom: ${this.currentZoom.toFixed(1)}x`;
          indicator.style.opacity = '1';
          
          // Fade out after 1 second
          clearTimeout(this.zoomTimeout);
          this.zoomTimeout = setTimeout(() => {
            indicator.style.opacity = '0';
          }, 1000);
        }
        
        initialDistance = currentDistance;
      }
    });
    
    container.addEventListener('touchend', () => {
      initialDistance = 0;
    });
  },
  
  // Get distance between two touch points
  getTouchDistance(touches) {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  },
  
  // Change timeframe
  changeTimeframe(tf) {
    this.currentTimeframe = tf;
    
    // Update dropdown value
    const select = document.getElementById('landscape-timeframe-select');
    if (select) select.value = tf;
    
    console.log(`✅ Analysis timeframe changed to: ${tf}`);
    
    // Update timestamp
    this.updateTimestamp();
  },
  
  // Update timestamp display
  updateTimestamp() {
    const timestampEl = document.getElementById('landscape-timestamp');
    if (!timestampEl) return;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    timestampEl.textContent = `${dateStr} ${timeStr}`;
  },
  
  // Exit fullscreen
  exit() {
    if (!this.isActive) return;
    
    console.log('🌄 Exiting landscape fullscreen');
    
    // Clear timestamp interval
    if (this.timestampInterval) {
      clearInterval(this.timestampInterval);
      this.timestampInterval = null;
    }
    
    // Unlock orientation (gracefully handle errors and unsupported browsers)
    try {
      if (screen.orientation && typeof screen.orientation.unlock === 'function') {
        screen.orientation.unlock();
      }
    } catch (err) {
      // iOS Safari and some browsers don't support orientation lock/unlock
      console.log('Orientation unlock not supported or failed (safe to ignore)');
    }
    
    // Destroy chart
    if (this.chart) {
      try {
        this.chart.remove();
      } catch (err) {
        console.warn('Chart cleanup error (safe to ignore):', err);
      }
      this.chart = null;
    }
    
    // Remove overlay
    if (this.overlayEl && this.overlayEl.parentNode) {
      this.overlayEl.remove();
      this.overlayEl = null;
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    this.isActive = false;
    this.currentZoom = 1;
  },
  
  // Format price
  formatPrice(price) {
    if (!price) return 'N/A';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },
  
  // Format market cap
  formatMarketCap(value) {
    if (!value) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  },
  
  // Format volume
  formatVolume(value) {
    if (!value) return 'N/A';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toLocaleString()}`;
  },
  
  // Format supply
  formatSupply(value) {
    if (!value) return 'N/A';
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toLocaleString();
  }
};

// Expose to window for global access
window.landscapeChartController = landscapeChartController;

console.log('✅ Landscape Chart Controller loaded');
