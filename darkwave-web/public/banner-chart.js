// DarkWave Banner - Fluid Organic Waves Over Candlesticks
// Tight rope-like pattern with cohesive motion - all waves follow same pattern
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
    console.log('🎬 Fluid Waves Banner init');
    
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

    this.generateCandleData(80);
    this.generateNoise();
    this.initialized = true;
    console.log('✅ Fluid waves banner ready');
    
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
    this.drawTightRopeWaves(w, h);
  },

  drawLargeCandleSticks: function(w, h) {
    if (this.candleData.length === 0) return;
    
    const maxPrice = Math.max(...this.candleData.map(c => c.high));
    const minPrice = Math.min(...this.candleData.map(c => c.low));
    const priceRange = maxPrice - minPrice || 1;
    
    const candleWidth = w / (this.candleData.length * 0.8);
    const chartHeight = h * 0.85;
    const centerY = h / 2;
    
    this.candleData.forEach((candle, idx) => {
      const x = (idx * w / this.candleData.length - this.scrollOffset) % w;
      
      const openY = centerY - ((candle.open - minPrice) / priceRange - 0.5) * chartHeight;
      const closeY = centerY - ((candle.close - minPrice) / priceRange - 0.5) * chartHeight;
      const highY = centerY - ((candle.high - minPrice) / priceRange - 0.5) * chartHeight;
      const lowY = centerY - ((candle.low - minPrice) / priceRange - 0.5) * chartHeight;
      
      const isGreen = candle.close >= candle.open;
      
      this.ctx.strokeStyle = isGreen ? 'rgba(80, 200, 100, 0.5)' : 'rgba(220, 60, 60, 0.5)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(x + candleWidth / 2, highY);
      this.ctx.lineTo(x + candleWidth / 2, lowY);
      this.ctx.stroke();
      
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(closeY - openY), 2);
      
      this.ctx.fillStyle = isGreen ? 'rgba(80, 200, 100, 0.6)' : 'rgba(220, 60, 60, 0.6)';
      this.ctx.fillRect(x, bodyTop, candleWidth * 0.7, bodyHeight);
    });
  },

  drawTightRopeWaves: function(w, h) {
    // Color gradient: red → magenta → purple → blue
    const colors = [
      { r: 255, g: 30, b: 80 },
      { r: 255, g: 50, b: 120 },
      { r: 240, g: 80, b: 150 },
      { r: 200, g: 120, b: 180 },
      { r: 160, g: 150, b: 210 },
      { r: 120, g: 180, b: 240 },
      { r: 80, g: 200, b: 255 }
    ];
    
    const centerY = h / 2;
    const numWaves = 7;
    const amplitude = h * 0.25;
    const waveSpacing = h * 0.035; // Spread out more - balanced spacing
    
    // Draw 7 waves that all follow the SAME pattern but are spaced nicely
    for (let waveIdx = 0; waveIdx < numWaves; waveIdx++) {
      const yOffset = (waveIdx - numWaves / 2) * waveSpacing;
      const waveFreqOffset = waveIdx * 0.02; // Slight individual variation
      
      const color = colors[waveIdx];
      const opacity = 0.8 - (waveIdx / numWaves) * 0.3;
      
      this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
      this.ctx.lineWidth = 1.8;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      
      this.ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.5})`;
      this.ctx.shadowBlur = 6;
      
      this.ctx.beginPath();
      let pathStarted = false;
      
      for (let x = 0; x <= w; x += 2) {
        // All waves use the SAME base noise pattern
        const noiseX = (x - this.scrollOffset) * 0.02;
        const noiseY = this.timeOffset;
        
        const baseNoise = this.perlinNoise(noiseX, noiseY);
        
        // Add small individual variation per wave
        const waveNoise = this.perlinNoise(noiseX + waveFreqOffset, noiseY + waveFreqOffset);
        
        // Blend: mostly base pattern, tiny bit of individual randomness
        const combined = baseNoise * 0.9 + waveNoise * 0.1;
        const fluidWave = (combined - 0.5) * amplitude * 2;
        
        const y = centerY + yOffset + fluidWave;
        
        if (!pathStarted) {
          this.ctx.moveTo(x, y);
          pathStarted = true;
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.stroke();
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
