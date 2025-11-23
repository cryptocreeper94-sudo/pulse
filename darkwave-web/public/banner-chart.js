// DarkWave Banner - Real Candlestick Chart with Wispy Smoke Trails
// Uses Perlin-like noise for defined smoke wisps, real market data pattern
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
    console.log('🎬 Wispy Smoke Banner init');
    
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

    // Generate realistic 6-month Bitcoin candlestick data
    this.generateRealisticCandleData(180); // 6 months
    this.initializeNoiseValues();
    this.initializeSmokeTrails();
    this.initialized = true;
    console.log('✅ Wispy smoke banner ready');
    
    this.animate();
  },

  generateRealisticCandleData: function(count) {
    // Start with realistic Bitcoin price pattern
    let price = 42500;
    this.candleData = [];
    
    for (let i = 0; i < count; i++) {
      // Create realistic volatility clusters
      const trend = Math.sin(i / 30) * 0.3;
      const volatility = 0.02 + Math.abs(Math.sin(i / 15)) * 0.025;
      const randomWalk = (Math.random() - 0.5) * 2;
      
      const dailyChange = (trend + randomWalk) * price * volatility;
      const open = price;
      const close = price + dailyChange;
      
      // Realistic high/low with occasional spikes
      const hasSpike = Math.random() > 0.9;
      const spikeSize = hasSpike ? Math.random() * 0.03 : 0;
      
      const high = Math.max(open, close) * (1 + spikeSize + Math.random() * 0.012);
      const low = Math.min(open, close) * (1 - Math.random() * 0.012);
      
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
    // Pre-generate Perlin-like noise for smoke trails
    this.noiseValues = [];
    for (let i = 0; i < 500; i++) {
      this.noiseValues.push(Math.random());
    }
  },

  perlinNoise: function(x) {
    const i = Math.floor(x) % this.noiseValues.length;
    const f = x - Math.floor(x);
    const u = f * f * (3.0 - 2.0 * f); // Smoothstep
    
    const next = (i + 1) % this.noiseValues.length;
    return this.noiseValues[i] * (1 - u) + this.noiseValues[next] * u;
  },

  initializeSmokeTrails: function() {
    this.smokeTrails = [];
    for (let i = 0; i < 40; i++) {
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
    
    // Very slow scroll: 1 screen width in 180 seconds = 0.333px/frame at 60fps
    // For 3 minutes = 180 seconds, that's canvas.width pixels in 180*60 = 10800 frames
    // So scrollOffset increases by canvas.width / 10800 per frame
    this.scrollOffset += this.canvas.width / 10800;
    
    // Update smoke trails
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

    // Black background
    this.ctx.fillStyle = '#0F0F23';
    this.ctx.fillRect(0, 0, w, h);

    // Layer 1: Wispy smoke trails
    this.drawWispySmoke(w, h);
    
    // Layer 2: Candlestick chart
    this.drawCandlestickChart(w, h);
  },

  drawWispySmoke: function(w, h) {
    const centerY = h / 2;
    
    // Darker holographic colors for smoke
    const smokeColors = [
      { r: 180, g: 30, b: 60 },      // Darker maroon
      { r: 200, g: 50, b: 100 },     // Dark red-pink
      { r: 160, g: 60, b: 120 },     // Dark purple-pink
      { r: 140, g: 70, b: 140 },     // Dark purple
      { r: 120, g: 80, b: 160 },     // Dark lavender
      { r: 180, g: 60, b: 100 }      // Dark orange-pink
    ];

    this.smokeTrails.forEach(trail => {
      const age = trail.age;
      if (age >= 200) return;
      
      const lifePercent = age / 200;
      const opacity = (1 - lifePercent) * 0.25; // Very subtle
      
      const colorIdx = Math.floor(trail.seed) % smokeColors.length;
      const color = smokeColors[colorIdx];
      
      // Draw defined wispy trails using Perlin noise
      const trailLength = 60 + lifePercent * 40;
      
      this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
      this.ctx.lineWidth = 1.2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      
      this.ctx.beginPath();
      let pathStarted = false;
      
      for (let dist = 0; dist < trailLength; dist += 2) {
        const noiseVal = this.perlinNoise((dist + trail.seed + age * 0.3) / 15);
        const sideWave = (noiseVal - 0.5) * 25 * (1 - dist / trailLength);
        
        const x = trail.startX + dist * 0.8;
        const y = centerY + sideWave - lifePercent * 40;
        
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

  drawCandlestickChart: function(w, h) {
    if (this.candleData.length === 0) return;
    
    const centerY = h / 2;
    const chartHeight = h * 0.55;
    
    // Calculate price range
    const maxPrice = Math.max(...this.candleData.map(c => c.high));
    const minPrice = Math.min(...this.candleData.map(c => c.low));
    const priceRange = maxPrice - minPrice || 1;
    
    // Calculate pixels per candle
    const totalCandlesVisible = Math.ceil(w / 2.5);
    const pixelsPerCandle = w / totalCandlesVisible;
    
    // Scrolling position
    const startCandleIdx = Math.floor((this.scrollOffset / pixelsPerCandle)) % this.candleData.length;
    
    // Draw candlesticks
    for (let i = 0; i < totalCandlesVisible + 2; i++) {
      const candleIdx = (startCandleIdx + i) % this.candleData.length;
      const candle = this.candleData[candleIdx];
      
      const x = i * pixelsPerCandle - (this.scrollOffset % pixelsPerCandle);
      
      if (x < -5 || x > w + 5) continue;
      
      // Calculate positions
      const openY = centerY - ((candle.open - minPrice) / priceRange - 0.5) * chartHeight;
      const closeY = centerY - ((candle.close - minPrice) / priceRange - 0.5) * chartHeight;
      const highY = centerY - ((candle.high - minPrice) / priceRange - 0.5) * chartHeight;
      const lowY = centerY - ((candle.low - minPrice) / priceRange - 0.5) * chartHeight;
      
      const isGreen = candle.close >= candle.open;
      
      // Draw wick
      this.ctx.strokeStyle = isGreen ? 'rgba(80, 200, 120, 0.8)' : 'rgba(255, 80, 80, 0.8)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(x + pixelsPerCandle / 2, highY);
      this.ctx.lineTo(x + pixelsPerCandle / 2, lowY);
      this.ctx.stroke();
      
      // Draw body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);
      
      this.ctx.fillStyle = isGreen ? 'rgba(80, 200, 120, 0.85)' : 'rgba(255, 80, 80, 0.85)';
      this.ctx.strokeStyle = isGreen ? 'rgba(120, 255, 160, 1)' : 'rgba(255, 120, 120, 1)';
      this.ctx.lineWidth = 0.8;
      
      const bodyWidth = Math.max(pixelsPerCandle * 0.6, 1.5);
      const bodyX = x + (pixelsPerCandle - bodyWidth) / 2;
      
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
