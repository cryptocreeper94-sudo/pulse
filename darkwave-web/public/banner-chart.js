// DarkWave Banner - Layered Waveform Contours
// Many distinct wave curves with large amplitude creating visual depth
window.bannerChartManager = {
  canvas: null,
  ctx: null,
  animationFrame: null,
  scrollOffset: 0,
  initialized: false,
  candleData: [],

  init: function() {
    console.log('🎬 Layered Waveform Banner init');
    
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

    this.generateCandleData(100);
    this.initialized = true;
    console.log('✅ Layered waveform banner ready');
    
    this.animate();
  },

  generateCandleData: function(count) {
    let price = 45000;
    this.candleData = [];
    for (let i = 0; i < count; i++) {
      const change = (Math.random() - 0.48) * price * 0.02;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) * 1.01;
      const low = Math.min(open, close) * 0.99;
      price = close;
      this.candleData.push({ open, close, high, low });
    }
  },

  animate: function() {
    this.draw();
    this.scrollOffset += this.canvas.width / 10800;
    this.animationFrame = requestAnimationFrame(() => this.animate());
  },

  draw: function() {
    if (!this.canvas || !this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.fillStyle = '#0a0a14';
    this.ctx.fillRect(0, 0, w, h);

    this.drawCandleBackground(w, h);
    this.drawLayeredWaveform(w, h);
  },

  drawCandleBackground: function(w, h) {
    if (this.candleData.length === 0) return;
    
    const maxPrice = Math.max(...this.candleData.map(c => c.high));
    const minPrice = Math.min(...this.candleData.map(c => c.low));
    const priceRange = maxPrice - minPrice || 1;
    
    const chartHeight = h * 0.8;
    const centerY = h / 2;
    
    this.candleData.forEach((candle, idx) => {
      const x = (idx * w / this.candleData.length - this.scrollOffset) % w;
      
      const highY = centerY - ((candle.high - minPrice) / priceRange - 0.5) * chartHeight;
      const lowY = centerY - ((candle.low - minPrice) / priceRange - 0.5) * chartHeight;
      
      this.ctx.strokeStyle = 'rgba(100, 100, 150, 0.1)';
      this.ctx.lineWidth = 0.6;
      this.ctx.beginPath();
      this.ctx.moveTo(x, highY);
      this.ctx.lineTo(x, lowY);
      this.ctx.stroke();
    });
  },

  drawLayeredWaveform: function(w, h) {
    // Color gradient: red → magenta → purple → blue
    const colors = [
      { r: 255, g: 20, b: 60 },
      { r: 255, g: 40, b: 100 },
      { r: 255, g: 60, b: 130 },
      { r: 240, g: 80, b: 150 },
      { r: 220, g: 100, b: 160 },
      { r: 200, g: 120, b: 170 },
      { r: 180, g: 140, b: 190 },
      { r: 160, g: 160, b: 210 },
      { r: 140, g: 180, b: 225 },
      { r: 120, g: 200, b: 240 },
      { r: 100, g: 210, b: 250 },
      { r: 80, g: 200, b: 255 }
    ];
    
    // Draw 35 distinct wave curves with LARGE oscillation
    const numWaves = 35;
    const waveSpacing = h / numWaves; // Vertical spacing
    const waveHeight = h * 0.05; // How much each wave oscillates
    
    for (let waveIdx = 0; waveIdx < numWaves; waveIdx++) {
      // Center line for this specific wave
      const waveCenterY = (waveIdx + 0.5) * waveSpacing;
      const frequency = 0.4 + (waveIdx % 4) * 0.15;
      
      const colorIdx = Math.floor((waveIdx / numWaves) * (colors.length - 1));
      const color = colors[colorIdx];
      
      const opacity = 0.85 - (waveIdx / numWaves) * 0.25;
      this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
      this.ctx.lineWidth = 1;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      
      this.ctx.beginPath();
      let pathStarted = false;
      
      for (let x = 0; x <= w; x += 0.8) {
        const phase = (x - this.scrollOffset) * 0.005 * frequency;
        const yWave = Math.sin(phase) * waveHeight;
        const y = waveCenterY + yWave;
        
        if (!pathStarted) {
          this.ctx.moveTo(x, y);
          pathStarted = true;
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.stroke();
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
