// DarkWave Banner - Perpetual Line Over Massive Candlesticks
// Single continuous wavy line that never breaks, with candles as the main visual
window.bannerChartManager = {
  canvas: null,
  ctx: null,
  animationFrame: null,
  scrollOffset: 0,
  timeOffset: 0,
  initialized: false,
  candleData: [],
  noise: [],

  init: function() {
    console.log('🎬 Chaotic Twisting Waves Banner init');
    
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

    this.generateCandleData(50);
    this.generateNoise();
    this.initialized = true;
    console.log('✅ Chaotic twisting waves banner ready');
    
    this.animate();
  },

  generateCandleData: function(count) {
    let price = 45000;
    this.candleData = [];
    for (let i = 0; i < count; i++) {
      const change = (Math.random() - 0.45) * price * 0.03;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      price = close;
      this.candleData.push({ open, close, high, low });
    }
  },

  generateNoise: function() {
    this.noise = [];
    for (let i = 0; i < 400; i++) {
      this.noise.push(Math.random());
    }
  },

  perlinNoise: function(x, y) {
    const xi = Math.floor(x) % this.noise.length;
    const yi = Math.floor(y) % this.noise.length;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    
    const n00 = this.noise[(xi + yi * 13) % this.noise.length];
    const n10 = this.noise[((xi + 1) + yi * 13) % this.noise.length];
    const n01 = this.noise[(xi + (yi + 1) * 13) % this.noise.length];
    const n11 = this.noise[((xi + 1) + (yi + 1) * 13) % this.noise.length];
    
    const nx0 = n00 * (1 - u) + n10 * u;
    const nx1 = n01 * (1 - u) + n11 * u;
    return nx0 * (1 - v) + nx1 * v;
  },

  animate: function() {
    this.draw();
    this.scrollOffset += this.canvas.width / 10800;
    this.timeOffset += 0.002;
    this.animationFrame = requestAnimationFrame(() => this.animate());
  },

  draw: function() {
    if (!this.canvas || !this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.fillStyle = '#0a0a14';
    this.ctx.fillRect(0, 0, w, h);

    this.drawLargeCandleSticks(w, h);
    this.drawPerpetualLine(w, h);
  },

  drawLargeCandleSticks: function(w, h) {
    if (this.candleData.length === 0) return;
    
    const maxPrice = Math.max(...this.candleData.map(c => c.high));
    const minPrice = Math.min(...this.candleData.map(c => c.low));
    const priceRange = maxPrice - minPrice || 1;
    
    const candleWidth = w / (this.candleData.length * 1.2);
    const bodyWidth = candleWidth * 0.65; // WIDER BODIES - 65% of candle width
    const chartHeight = h * 0.80;
    const centerY = h / 2;
    
    this.candleData.forEach((candle, idx) => {
      const x = (idx * w / (this.candleData.length * 0.67) - this.scrollOffset) % w;
      
      const openY = centerY - ((candle.open - minPrice) / priceRange - 0.5) * chartHeight;
      const closeY = centerY - ((candle.close - minPrice) / priceRange - 0.5) * chartHeight;
      const highY = centerY - ((candle.high - minPrice) / priceRange - 0.5) * chartHeight;
      const lowY = centerY - ((candle.low - minPrice) / priceRange - 0.5) * chartHeight;
      
      const isGreen = candle.close >= candle.open;
      
      // Draw the THIN wick (line from high to low) - LESS PROMINENT
      this.ctx.strokeStyle = isGreen ? 'rgba(80, 200, 100, 0.6)' : 'rgba(220, 60, 60, 0.6)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(x + bodyWidth / 2, highY);
      this.ctx.lineTo(x + bodyWidth / 2, lowY);
      this.ctx.stroke();
      
      // Draw the THICK body (rectangle) - DOMINANT
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(closeY - openY), 3);
      
      this.ctx.fillStyle = isGreen ? 'rgba(80, 200, 100, 0.95)' : 'rgba(220, 60, 60, 0.95)';
      this.ctx.fillRect(x + (candleWidth - bodyWidth) / 2, bodyTop, bodyWidth, bodyHeight);
    });
  },

  drawPerpetualLine: function(w, h) {
    // ONE continuous line that never breaks - traces across candle tops
    if (this.candleData.length === 0) return;
    
    const maxPrice = Math.max(...this.candleData.map(c => c.high));
    const minPrice = Math.min(...this.candleData.map(c => c.low));
    const priceRange = maxPrice - minPrice || 1;
    
    const chartHeight = h * 0.80;
    const centerY = h / 2;
    
    // Gradient colors for the line
    const colors = [
      '#ff1e50',  // red
      '#ff3278',  // red-magenta
      '#f05096',  // magenta
      '#c878b4',  // magenta-purple
      '#a096d2',  // purple
      '#78b4f0',  // blue-purple
      '#50c8ff'   // bright blue
    ];
    
    // Draw the line with color gradient
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = 1.5; // THIN LINE - doesn't dominate
    
    this.ctx.beginPath();
    let firstPoint = true;
    
    for (let x = -20; x <= w + 20; x += 2) {
      // Get candle data smoothly across screen
      const candle_idx = Math.floor((x / w) * this.candleData.length);
      if (candle_idx < 0 || candle_idx >= this.candleData.length) continue;
      
      const candle = this.candleData[candle_idx];
      
      // Get close price for line position (traces candle bodies)
      const closeY = centerY - ((candle.close - minPrice) / priceRange - 0.5) * chartHeight;
      
      // Add SLIGHT wavy motion to the line
      const waveAmplitude = h * 0.12; // Small waves
      const waveX = (x - this.scrollOffset) * 0.008;
      const noiseVal = this.perlinNoise(waveX, this.timeOffset);
      const wave = (noiseVal - 0.5) * waveAmplitude * 2;
      
      const y = closeY + wave;
      
      const colorIdx = Math.floor((x / w) * colors.length) % colors.length;
      this.ctx.strokeStyle = colors[colorIdx];
      
      if (firstPoint) {
        this.ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.stroke();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.bannerChartManager.init(), 100);
  });
} else {
  setTimeout(() => window.bannerChartManager.init(), 100);
}
