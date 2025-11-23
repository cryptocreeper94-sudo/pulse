// DarkWave Banner - Full-Width Holographic Wave with Dynamic Stretching
window.bannerChartManager = {
  canvas: null,
  ctx: null,
  animationFrame: null,
  time: 0,
  initialized: false,
  candleData: [],

  init: function() {
    console.log('🎬 Full-Width Wave Banner init');
    
    if (this.initialized) return;

    let canvas = document.getElementById('banner-chart-canvas');
    if (!canvas) {
      const bannerWave = document.querySelector('.banner-wave');
      if (!bannerWave) {
        console.error('banner-wave not found!');
        return;
      }
      
      canvas = document.createElement('canvas');
      canvas.id = 'banner-chart-canvas';
      canvas.width = window.innerWidth;
      canvas.height = 150;
      canvas.style.cssText = 'display:block;position:absolute;top:0;left:0;width:100%;height:100%;';
      bannerWave.appendChild(canvas);
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    if (!this.ctx) {
      console.error('Failed to get 2D context');
      return;
    }

    this.generateCandleData(300);
    this.initialized = true;
    console.log('✅ Full-Width Wave banner ready');
    
    this.animate();
  },

  generateCandleData: function(count) {
    let price = 50000;
    for (let i = 0; i < count; i++) {
      const change = (Math.random() - 0.48) * 1500;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * 800;
      const low = Math.min(open, close) - Math.random() * 800;
      price = close;
      
      this.candleData.push({ open, high, low, close, volume: Math.random() * 1000000 });
    }
  },

  animate: function() {
    this.draw();
    this.time += 0.008;
    this.animationFrame = requestAnimationFrame(() => this.animate());
  },

  draw: function() {
    if (!this.canvas || !this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const time = this.time;

    this.ctx.fillStyle = 'rgba(15, 15, 35, 0.96)';
    this.ctx.fillRect(0, 0, w, h);

    // Draw full-width rope wave (much larger)
    this.drawFullWidthRopeWave(w, h, time);
    
    // Draw candlestick stream
    this.drawCandleStream(w, h, time);
  },

  drawFullWidthRopeWave: function(w, h, time) {
    const centerY = h / 2;
    const numStrings = 12; // 10-12 intertwined lines
    
    const colors = [
      'rgba(255, 30, 80, 0.70)',
      'rgba(255, 60, 120, 0.72)',
      'rgba(240, 80, 140, 0.74)',
      'rgba(220, 100, 160, 0.76)',
      'rgba(200, 120, 180, 0.76)',
      'rgba(180, 140, 190, 0.76)',
      'rgba(160, 160, 200, 0.75)',
      'rgba(150, 150, 210, 0.73)',
      'rgba(180, 120, 200, 0.71)',
      'rgba(220, 100, 160, 0.70)',
      'rgba(240, 80, 140, 0.69)',
      'rgba(255, 60, 100, 0.68)',
    ];

    for (let stringIdx = 0; stringIdx < numStrings; stringIdx++) {
      // Vertical offset between strings (spread them across height)
      const verticalSpacing = h / (numStrings + 1);
      const baseY = verticalSpacing * (stringIdx + 1);
      const color = colors[stringIdx % colors.length];

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2.5;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      this.ctx.beginPath();
      
      for (let x = 0; x < w; x += 2) {
        // STRETCHED WAVE PATTERN: Covers full width with 1-2 cycles
        // Very long wavelength to stretch across entire banner
        const wavePhase = (x / w) * Math.PI * 2; // One full sine cycle across width
        
        // Primary wave: massive amplitude
        const primaryWave = Math.sin(wavePhase - time * 0.8) * (h * 0.32);
        
        // Secondary wave: adds complexity (different frequency = 2 cycles)
        const secondaryWave = Math.sin((x / w) * Math.PI * 4 - time * 1.2) * (h * 0.15);
        
        // Tertiary wave: adds subtle variation
        const tertiaryWave = Math.sin((x / w) * Math.PI * 6 - time * 0.5) * (h * 0.08);
        
        // Per-string variation: slight offset for rope effect
        const stringVariation = Math.sin(stringIdx * 0.5 + time * 0.3) * 6;
        
        // Dynamic stretching effect: amplitude changes over time
        const stretchFactor = 0.8 + Math.sin(time * 0.5) * 0.4;
        
        const y = baseY + (primaryWave + secondaryWave + tertiaryWave + stringVariation) * stretchFactor;

        if (x === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      
      this.ctx.stroke();
    }

    // Holographic glow
    this.ctx.shadowColor = 'rgba(255, 80, 150, 0.3)';
    this.ctx.shadowBlur = 30;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  },

  drawCandleStream: function(w, h, time) {
    const maxPrice = Math.max(...this.candleData.map(c => c.high));
    const minPrice = Math.min(...this.candleData.map(c => c.low));
    const priceRange = maxPrice - minPrice || 1;
    
    const candleWidth = 1.6;
    const spacing = candleWidth + 0.4;
    const totalWidth = this.candleData.length * spacing;
    const scrollPos = (time * 100) % (totalWidth + w);
    
    // Candlestick chart in lower portion
    const chartTop = h * 0.55;
    const chartHeight = h * 0.40;

    for (let i = 0; i < this.candleData.length; i++) {
      const candle = this.candleData[i];
      const x = scrollPos - (this.candleData.length - i) * spacing;
      
      if (x < -10 || x > w + 10) continue;

      const high = chartTop + chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight;
      const low = chartTop + chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight;
      const open = chartTop + chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight;
      const close = chartTop + chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;

      const isGreen = close < open;

      // Wick
      this.ctx.strokeStyle = isGreen ? 'rgba(100, 240, 120, 0.75)' : 'rgba(255, 100, 80, 0.75)';
      this.ctx.lineWidth = 0.7;
      this.ctx.shadowColor = isGreen ? 'rgba(100, 240, 120, 0.3)' : 'rgba(255, 100, 80, 0.3)';
      this.ctx.shadowBlur = 4;

      this.ctx.beginPath();
      this.ctx.moveTo(x + candleWidth / 2, high);
      this.ctx.lineTo(x + candleWidth / 2, low);
      this.ctx.stroke();

      // Body
      const bodyColor = isGreen ? 'rgba(100, 240, 120, 0.8)' : 'rgba(255, 100, 80, 0.8)';
      const bodyStroke = isGreen ? 'rgba(150, 255, 160, 1)' : 'rgba(255, 140, 100, 1)';
      
      this.ctx.fillStyle = bodyColor;
      this.ctx.strokeStyle = bodyStroke;
      this.ctx.lineWidth = 0.5;
      this.ctx.shadowColor = isGreen ? 'rgba(100, 240, 120, 0.3)' : 'rgba(255, 100, 80, 0.3)';
      this.ctx.shadowBlur = 3;

      const bodyTop = Math.min(open, close);
      const bodyHeight = Math.max(Math.abs(close - open), 1);
      
      this.ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
      if (bodyHeight > 1) {
        this.ctx.strokeRect(x, bodyTop, candleWidth, bodyHeight);
      }
    }

    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.bannerChartManager.init(), 100);
  });
} else {
  setTimeout(() => window.bannerChartManager.init(), 100);
}
