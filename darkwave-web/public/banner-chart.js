// DarkWave Banner - Simple Looping Candlestick Chart
// Real candlestick chart that loops infinitely - no effects, no dancing
window.bannerChartManager = {
  canvas: null,
  ctx: null,
  animationFrame: null,
  scrollOffset: 0,
  timeOffset: 0,
  initialized: false,
  candleData: [],

  init: function() {
    console.log('🎬 Simple Candlestick Banner init');
    
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

    this.generateCandleData(60);
    this.initialized = true;
    console.log('✅ Simple candlestick banner ready');
    
    this.animate();
  },

  generateCandleData: function(count) {
    let price = 45000;
    this.candleData = [];
    
    for (let i = 0; i < count; i++) {
      // Random direction and size - more natural variation
      const direction = Math.random() > 0.5 ? 1 : -1;
      const changePercent = Math.random() * 0.05; // 0-5% change
      const change = price * changePercent * direction;
      
      const open = price;
      const close = price + change;
      
      // High and low with some randomness
      const high = Math.max(open, close) * (1 + Math.random() * 0.015);
      const low = Math.min(open, close) * (1 - Math.random() * 0.015);
      
      price = close;
      
      this.candleData.push({ open, close, high, low });
    }
  },

  animate: function() {
    this.draw();
    this.scrollOffset += this.canvas.width / 14400; // Ultra slow scroll = 4 min per screen
    this.timeOffset += 0.002;
    this.animationFrame = requestAnimationFrame(() => this.animate());
  },

  draw: function() {
    if (!this.canvas || !this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.fillStyle = '#0a0a14';
    this.ctx.fillRect(0, 0, w, h);

    this.drawSimpleCandleChart(w, h);
  },

  drawSimpleCandleChart: function(w, h) {
    if (this.candleData.length === 0) return;
    
    // Calculate price range
    const maxPrice = Math.max(...this.candleData.map(c => c.high));
    const minPrice = Math.min(...this.candleData.map(c => c.low));
    const priceRange = maxPrice - minPrice || 1;
    
    // Chart dimensions
    const chartHeight = h * 0.75;
    const centerY = h / 2;
    const candleSpacing = w / 20; // Width per candle + spacing
    const candleWidth = candleSpacing * 0.6; // Thin bodies with gaps
    
    // Draw candlesticks - simple, clean
    this.candleData.forEach((candle, idx) => {
      // Position with looping scroll
      let x = (idx * candleSpacing - this.scrollOffset) % w;
      if (x < -candleSpacing) x += w + candleSpacing;
      
      // Price to Y coordinate
      const openY = centerY - ((candle.open - minPrice) / priceRange - 0.5) * chartHeight;
      const closeY = centerY - ((candle.close - minPrice) / priceRange - 0.5) * chartHeight;
      const highY = centerY - ((candle.high - minPrice) / priceRange - 0.5) * chartHeight;
      const lowY = centerY - ((candle.low - minPrice) / priceRange - 0.5) * chartHeight;
      
      const isGreen = candle.close >= candle.open;
      const color = isGreen ? 'rgba(80, 200, 100, 0.9)' : 'rgba(220, 60, 60, 0.9)';
      
      // Draw thin wick (vertical line from high to low)
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(x + candleWidth / 2, highY);
      this.ctx.lineTo(x + candleWidth / 2, lowY);
      this.ctx.stroke();
      
      // Draw body (rectangle)
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
      
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.bannerChartManager.init(), 100);
  });
} else {
  setTimeout(() => window.bannerChartManager.init(), 100);
}
