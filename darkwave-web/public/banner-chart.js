// DarkWave Banner - Aggressive Dynamic Candlestick Wave
// Many narrow candles with extreme volatility, dramatic ups/downs, chaotic but clear
window.bannerChartManager = {
  canvas: null,
  ctx: null,
  animationFrame: null,
  scrollOffset: 0,
  initialized: false,
  candleData: [],
  smokeTrails: [],
  noiseValues: [],

  init: function() {
    console.log('🎬 Aggressive Candlestick Wave Banner init');
    
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

    // Generate AGGRESSIVE volatile data with extreme price swings
    this.generateAggressiveVolatileCandleData(150);
    this.initializeNoiseValues();
    this.initializeSmokeTrails();
    this.initialized = true;
    console.log('✅ Aggressive wave banner ready');
    
    this.animate();
  },

  generateAggressiveVolatileCandleData: function(count) {
    let price = 42500;
    this.candleData = [];
    
    for (let i = 0; i < count; i++) {
      // Create aggressive, chaotic movement
      const trend = Math.sin(i / 8) * 0.5; // Stronger trend cycles
      const volatility = 0.03 + Math.abs(Math.sin(i / 4)) * 0.08; // Much higher volatility
      const randomWalk = (Math.random() - 0.5) * 3.5; // Stronger random walk
      
      const dailyChange = (trend + randomWalk) * price * volatility;
      const open = price;
      const close = price + dailyChange;
      
      // Occasional HUGE spikes and drops (crypto nature!)
      const hasExtremeMove = Math.random() > 0.85;
      const extremeSize = hasExtremeMove ? (Math.random() - 0.5) * 0.08 : 0; // ±8% extreme moves
      
      const high = Math.max(open, close) * (1 + extremeSize + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.abs(extremeSize) - Math.random() * 0.02);
      
      price = close;
      
      this.candleData.push({
        open: Math.round(open),
        close: Math.round(close),
        high: Math.round(high),
        low: Math.round(low),
        volume: Math.random() * 1000000
      });
    }
  },

  initializeNoiseValues: function() {
    this.noiseValues = [];
    for (let i = 0; i < 500; i++) {
      this.noiseValues.push(Math.random());
    }
  },

  perlinNoise: function(x) {
    const i = Math.floor(x) % this.noiseValues.length;
    const f = x - Math.floor(x);
    const u = f * f * (3.0 - 2.0 * f);
    
    const next = (i + 1) % this.noiseValues.length;
    return this.noiseValues[i] * (1 - u) + this.noiseValues[next] * u;
  },

  initializeSmokeTrails: function() {
    this.smokeTrails = [];
    for (let i = 0; i < 60; i++) {
      this.smokeTrails.push({
        startX: Math.random() * this.canvas.width,
        startY: this.canvas.height / 2,
        age: Math.random() * 100,
        seed: Math.random() * 1000
      });
    }
  },

  animate: function() {
    this.draw();
    
    // Very slow scroll: canvas.width pixels in 180 seconds
    this.scrollOffset += this.canvas.width / 10800;
    
    this.smokeTrails.forEach(trail => {
      trail.age += 0.5;
      if (trail.age > 200) {
        trail.age = 0;
        trail.startX = Math.random() * this.canvas.width;
        trail.seed = Math.random() * 1000;
      }
    });
    
    this.animationFrame = requestAnimationFrame(() => this.animate());
  },

  draw: function() {
    if (!this.canvas || !this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.fillStyle = '#0F0F23';
    this.ctx.fillRect(0, 0, w, h);

    // Layer 1: Visible wispy smoke trails
    this.drawVisibleWispySmoke(w, h);
    
    // Layer 2: Aggressive dynamic candlestick wave
    this.drawAggressiveCandlestickWave(w, h);
  },

  drawVisibleWispySmoke: function(w, h) {
    const centerY = h / 2;
    
    const smokeColors = [
      { r: 200, g: 40, b: 80 },
      { r: 220, g: 60, b: 120 },
      { r: 180, g: 80, b: 140 },
      { r: 160, g: 100, b: 160 },
      { r: 140, g: 120, b: 180 },
      { r: 200, g: 80, b: 120 }
    ];

    this.smokeTrails.forEach(trail => {
      const age = trail.age;
      if (age >= 200) return;
      
      const lifePercent = age / 200;
      const opacity = (1 - lifePercent) * 0.55;
      
      const colorIdx = Math.floor(trail.seed) % smokeColors.length;
      const color = smokeColors[colorIdx];
      
      const trailLength = 80 + lifePercent * 50;
      
      this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
      this.ctx.lineWidth = 1.8;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      
      this.ctx.beginPath();
      let pathStarted = false;
      
      for (let dist = 0; dist < trailLength; dist += 2) {
        const noiseVal = this.perlinNoise((dist + trail.seed + age * 0.3) / 12);
        const sideWave = (noiseVal - 0.5) * 35 * (1 - dist / trailLength);
        
        const x = trail.startX + dist * 0.9;
        const y = centerY + sideWave - lifePercent * 45;
        
        if (x < -10 || x > w + 10) continue;
        
        if (!pathStarted) {
          this.ctx.moveTo(x, y);
          pathStarted = true;
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.stroke();
    });
  },

  drawAggressiveCandlestickWave: function(w, h) {
    if (this.candleData.length === 0) return;
    
    const centerY = h / 2;
    const chartHeight = h * 0.80; // Use most of banner height
    
    const maxPrice = Math.max(...this.candleData.map(c => c.high));
    const minPrice = Math.min(...this.candleData.map(c => c.low));
    const priceRange = maxPrice - minPrice || 1;
    
    // Many narrow candles = dynamic wave
    const totalCandlesVisible = 40; // ~3x more candles than before
    const pixelsPerCandle = w / totalCandlesVisible;
    
    const startCandleIdx = Math.floor((this.scrollOffset / pixelsPerCandle)) % this.candleData.length;
    
    // Draw candlesticks with aggressive volatility
    for (let i = 0; i < totalCandlesVisible + 2; i++) {
      const candleIdx = (startCandleIdx + i) % this.candleData.length;
      const candle = this.candleData[candleIdx];
      
      const x = i * pixelsPerCandle - (this.scrollOffset % pixelsPerCandle);
      
      if (x < -5 || x > w + 5) continue;
      
      const openY = centerY - ((candle.open - minPrice) / priceRange - 0.5) * chartHeight;
      const closeY = centerY - ((candle.close - minPrice) / priceRange - 0.5) * chartHeight;
      const highY = centerY - ((candle.high - minPrice) / priceRange - 0.5) * chartHeight;
      const lowY = centerY - ((candle.low - minPrice) / priceRange - 0.5) * chartHeight;
      
      const isGreen = candle.close >= candle.open;
      
      // Draw wick (always visible, shows full range)
      this.ctx.strokeStyle = isGreen ? 'rgba(100, 220, 140, 0.9)' : 'rgba(255, 100, 100, 0.9)';
      this.ctx.lineWidth = 1.3;
      this.ctx.beginPath();
      this.ctx.moveTo(x + pixelsPerCandle / 2, highY);
      this.ctx.lineTo(x + pixelsPerCandle / 2, lowY);
      this.ctx.stroke();
      
      // Draw NARROW body with tight spacing
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(closeY - openY), 2);
      
      // Narrow body = 30% of candle width
      const bodyWidth = Math.max(pixelsPerCandle * 0.30, 1.5);
      const bodyX = x + (pixelsPerCandle - bodyWidth) / 2;
      
      this.ctx.fillStyle = isGreen ? 'rgba(100, 220, 140, 0.95)' : 'rgba(255, 100, 100, 0.95)';
      this.ctx.strokeStyle = isGreen ? 'rgba(150, 255, 180, 1)' : 'rgba(255, 150, 150, 1)';
      this.ctx.lineWidth = 0.8;
      
      this.ctx.fillRect(bodyX, bodyTop, bodyWidth, bodyHeight);
      this.ctx.strokeRect(bodyX, bodyTop, bodyWidth, bodyHeight);
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.bannerChartManager.init(), 100);
  });
} else {
  setTimeout(() => window.bannerChartManager.init(), 100);
}
