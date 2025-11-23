// DarkWave Banner - Professional Neon Wave Pattern with Candlestick Overlay
window.bannerChartManager = {
  canvas: null,
  ctx: null,
  animationFrame: null,
  time: 0,
  initialized: false,

  init: function() {
    console.log('🎬 Banner init called');
    
    if (this.initialized) return;

    // Find or create canvas
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

    this.initialized = true;
    console.log('✅ Banner animated wave initialized');
    
    this.animate();
  },

  animate: function() {
    this.draw();
    this.time += 0.008; // Slower, smoother motion
    this.animationFrame = requestAnimationFrame(() => this.animate());
  },

  draw: function() {
    if (!this.canvas || !this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const time = this.time;

    // Dark background
    this.ctx.fillStyle = 'rgba(15, 15, 35, 0.95)';
    this.ctx.fillRect(0, 0, w, h);

    // Draw multiple parallel neon lines (30 waves)
    this.drawNeonWaves(w, h, time);
    
    // Draw candlestick pattern overlay
    this.drawCandleOverlay(w, h, time);
  },

  drawNeonWaves: function(w, h, time) {
    const centerY = h / 2;
    const numWaves = 32; // 30+ parallel lines
    const spacing = h / (numWaves + 1);
    const waveAmp = 35; // Wave amplitude
    const waveFreq = 0.008; // Frequency of the main wave

    // Gradient colors from purple to lavender
    const colors = [
      'rgba(200, 100, 255, 0.7)',  // Bright magenta
      'rgba(180, 120, 255, 0.7)',  // Purple
      'rgba(160, 140, 255, 0.7)',  // Light purple
      'rgba(157, 78, 221, 0.8)',   // Deep purple
      'rgba(192, 125, 255, 0.8)',  // Medium purple
      'rgba(224, 170, 255, 0.8)',  // Lavender
    ];

    for (let waveIdx = 0; waveIdx < numWaves; waveIdx++) {
      const baseY = spacing * (waveIdx + 1);
      const colorIdx = waveIdx % colors.length;
      const color = colors[colorIdx];

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 1.5;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      this.ctx.beginPath();
      
      for (let x = 0; x < w; x += 2) {
        // Main wave motion (horizontal scroll)
        const scrollOffset = time * 80; // Scroll speed
        const xNorm = (x + scrollOffset) * waveFreq;
        
        // Multi-layered sine wave for complex motion
        const wave1 = Math.sin(xNorm * Math.PI / 100) * waveAmp;
        const wave2 = Math.sin((xNorm * 0.5 - time) * Math.PI / 100) * (waveAmp * 0.4);
        const wave3 = Math.cos((xNorm * 0.25 + time * 0.5) * Math.PI / 100) * (waveAmp * 0.2);
        
        const y = baseY + wave1 + wave2 + wave3;

        if (x === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      
      this.ctx.stroke();
    }

    // Add subtle glow effect
    this.ctx.shadowColor = 'rgba(157, 78, 221, 0.4)';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  },

  drawCandleOverlay: function(w, h, time) {
    const centerY = h / 2;
    const spacing = 45;
    const scrollOffset = time * 80;
    
    // Generate candlestick pattern
    for (let i = 0; i < (w / spacing) + 2; i++) {
      const x = scrollOffset + i * spacing;
      
      // Calculate wave height at this position for candlestick
      const xNorm = x * 0.008;
      const waveHeight = Math.sin(xNorm * Math.PI / 100) * 35 + 
                         Math.sin((xNorm * 0.5 - time) * Math.PI / 100) * 15 +
                         Math.cos((xNorm * 0.25 + time * 0.5) * Math.PI / 100) * 8;
      
      const isGreen = i % 2 === 0;
      
      // High and low points
      const high = centerY - Math.abs(waveHeight) - 15;
      const low = centerY + Math.abs(waveHeight) + 15;
      
      // Open/close based on trend
      const open = centerY + (isGreen ? 8 : -8) + (waveHeight * 0.3);
      const close = centerY - (isGreen ? 8 : -8) + (waveHeight * 0.3);

      // Draw wick (thin line from high to low)
      this.ctx.strokeStyle = isGreen ? 
        'rgba(100, 255, 150, 0.9)' : 'rgba(255, 100, 100, 0.9)';
      this.ctx.lineWidth = 2.5;
      this.ctx.lineCap = 'round';
      this.ctx.shadowColor = isGreen ? 
        'rgba(100, 255, 150, 0.7)' : 'rgba(255, 100, 100, 0.7)';
      this.ctx.shadowBlur = 12;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;

      this.ctx.beginPath();
      this.ctx.moveTo(x + 6, high);
      this.ctx.lineTo(x + 6, low);
      this.ctx.stroke();

      // Draw body (rectangle)
      this.ctx.fillStyle = isGreen ? 
        'rgba(100, 255, 150, 0.8)' : 'rgba(255, 100, 100, 0.8)';
      this.ctx.strokeStyle = isGreen ? 
        'rgba(150, 255, 200, 1)' : 'rgba(255, 150, 150, 1)';
      this.ctx.lineWidth = 2;

      const bodyTop = Math.min(open, close);
      const bodyHeight = Math.max(Math.abs(close - open), 4);
      
      this.ctx.fillRect(x, bodyTop, 14, bodyHeight);
      this.ctx.strokeRect(x, bodyTop, 14, bodyHeight);
    }

    // Reset shadow
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
  }
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - initializing banner');
    setTimeout(() => window.bannerChartManager.init(), 100);
  });
} else {
  console.log('DOM ready - initializing banner immediately');
  setTimeout(() => window.bannerChartManager.init(), 100);
}
