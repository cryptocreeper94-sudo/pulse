// DarkWave Banner - Organic Smoke Background + Candlestick Charts
// Background: Pure hazy smoke with random flowing motion, no structure
// Foreground: Candlesticks anchored on smoke, scrolling horizontally
window.bannerChartManager = {
  canvas: null,
  ctx: null,
  animationFrame: null,
  time: 0,
  initialized: false,
  candleData: [],
  smokeNoise: [],

  init: function() {
    console.log('🎬 Organic Smoke Banner init');
    
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
    this.initializeSmokeNoise();
    this.initialized = true;
    console.log('✅ Organic smoke banner ready');
    
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

  initializeSmokeNoise: function() {
    // Pre-generate random noise for organic smoke movement
    for (let i = 0; i < 100; i++) {
      this.smokeNoise.push(Math.random());
    }
  },

  // Simple Perlin-like noise
  noise: function(index) {
    const i = Math.floor(index) % this.smokeNoise.length;
    const nextI = (i + 1) % this.smokeNoise.length;
    const t = index - Math.floor(index);
    const smoothT = t * t * (3 - 2 * t); // Smoothstep interpolation
    
    return this.smokeNoise[i] * (1 - smoothT) + this.smokeNoise[nextI] * smoothT;
  },

  animate: function() {
    this.draw();
    this.time += 0.005; // Very slow movement for organic feel
    this.animationFrame = requestAnimationFrame(() => this.animate());
  },

  draw: function() {
    if (!this.canvas || !this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const time = this.time;

    this.ctx.fillStyle = 'rgba(15, 15, 35, 1)';
    this.ctx.fillRect(0, 0, w, h);

    // Layer 1: Hazy organic smoke background (NO STRUCTURE)
    this.drawSmokeHaze(w, h, time);
    
    // Layer 2: Candlestick chart on top (anchored, scrolling horizontally)
    this.drawCandleStream(w, h, time);
  },

  drawSmokeHaze: function(w, h, time) {
    const centerY = h / 2;
    
    // Create multiple layers of hazy smoke
    const smokeLayers = 8;
    
    for (let layer = 0; layer < smokeLayers; layer++) {
      const layerHeight = h / smokeLayers;
      const baseY = layer * layerHeight;
      
      // Draw smooth, flowing haze across width
      for (let x = 0; x <= w; x += 3) {
        // Generate organic Y offset using noise
        const noiseVal1 = this.noise(x * 0.01 + time * 0.5 + layer * 2);
        const noiseVal2 = this.noise(x * 0.005 + time * 0.3 + layer);
        const noiseVal3 = this.noise(x * 0.002 + time * 0.8 + layer * 3);
        
        // Combine noises for organic motion
        const yOffset = (noiseVal1 - 0.5) * 20 + 
                       (noiseVal2 - 0.5) * 15 + 
                       (noiseVal3 - 0.5) * 10;
        
        const y = baseY + yOffset;
        
        // Determine color based on position and time
        const hue = (x / w) * 360 + time * 10;
        const colorPhase = (hue % 360) / 360;
        
        let color;
        if (colorPhase < 0.3) {
          // Red to pink
          const t = colorPhase / 0.3;
          color = `rgba(${255}, ${30 + t * 50}, ${80}, ${0.3})`;
        } else if (colorPhase < 0.6) {
          // Pink to purple
          const t = (colorPhase - 0.3) / 0.3;
          color = `rgba(${255 - t * 55}, ${80 + t * 60}, ${140}, ${0.3})`;
        } else {
          // Purple to maroon
          const t = (colorPhase - 0.6) / 0.4;
          color = `rgba(${200 - t * 100}, ${140 - t * 40}, ${180}, ${0.3})`;
        }
        
        this.ctx.fillStyle = color;
        // Draw soft circles for haze effect
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15 + Math.sin(time + x * 0.01) * 8, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Add overall haze blur effect with gradient overlay
    const hazeGradient = this.ctx.createLinearGradient(0, 0, w, 0);
    hazeGradient.addColorStop(0, 'rgba(255, 30, 80, 0.15)');
    hazeGradient.addColorStop(0.3, 'rgba(220, 100, 160, 0.15)');
    hazeGradient.addColorStop(0.6, 'rgba(180, 140, 190, 0.15)');
    hazeGradient.addColorStop(1, 'rgba(255, 80, 120, 0.15)');
    
    this.ctx.fillStyle = hazeGradient;
    this.ctx.fillRect(0, 0, w, h);
  },

  drawCandleStream: function(w, h, time) {
    const maxPrice = Math.max(...this.candleData.map(c => c.high));
    const minPrice = Math.min(...this.candleData.map(c => c.low));
    const priceRange = maxPrice - minPrice || 1;
    
    const candleWidth = 2.5;
    const spacing = candleWidth + 0.8;
    const totalWidth = this.candleData.length * spacing;
    const scrollPos = (time * 40) % (totalWidth + w); // Slow horizontal scroll
    
    // Candlesticks positioned in middle section of banner
    const chartTop = h * 0.15;
    const chartHeight = h * 0.7;

    for (let i = 0; i < this.candleData.length; i++) {
      const candle = this.candleData[i];
      const x = scrollPos - (this.candleData.length - i) * spacing;
      
      if (x < -10 || x > w + 10) continue;

      const high = chartTop + chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight;
      const low = chartTop + chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight;
      const open = chartTop + chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight;
      const close = chartTop + chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;

      const isGreen = close < open;

      // Draw wick with glow
      this.ctx.strokeStyle = isGreen ? 'rgba(100, 255, 140, 0.9)' : 'rgba(255, 90, 90, 0.9)';
      this.ctx.lineWidth = 1.2;
      this.ctx.lineCap = 'round';
      this.ctx.shadowColor = isGreen ? 'rgba(100, 255, 140, 0.5)' : 'rgba(255, 90, 90, 0.5)';
      this.ctx.shadowBlur = 6;

      this.ctx.beginPath();
      this.ctx.moveTo(x + candleWidth / 2, high);
      this.ctx.lineTo(x + candleWidth / 2, low);
      this.ctx.stroke();

      // Draw body with glow
      const bodyColor = isGreen ? 'rgba(100, 255, 140, 0.95)' : 'rgba(255, 90, 90, 0.95)';
      const bodyStroke = isGreen ? 'rgba(150, 255, 180, 1)' : 'rgba(255, 130, 130, 1)';
      
      this.ctx.fillStyle = bodyColor;
      this.ctx.strokeStyle = bodyStroke;
      this.ctx.lineWidth = 1;
      this.ctx.shadowColor = isGreen ? 'rgba(100, 255, 140, 0.6)' : 'rgba(255, 90, 90, 0.6)';
      this.ctx.shadowBlur = 5;

      const bodyTop = Math.min(open, close);
      const bodyHeight = Math.max(Math.abs(close - open), 2);
      
      this.ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
      this.ctx.strokeRect(x, bodyTop, candleWidth, bodyHeight);

      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
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
