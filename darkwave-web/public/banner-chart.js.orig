// DarkWave Banner - Neon Wave Animation
window.bannerChartManager = {
  canvas: null,
  ctx: null,
  animationFrame: null,
  time: 0,
  initialized: false,

  init: function() {
    console.log('🎬 Banner init called');
    
    if (this.initialized) {
      console.log('Already initialized');
      return;
    }

    // Find or create canvas
    let canvas = document.getElementById('banner-chart-canvas');
    if (!canvas) {
      console.log('Creating new canvas');
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
      console.log('Canvas created:', canvas.width, 'x', canvas.height);
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
    this.time += 0.016;
    this.animationFrame = requestAnimationFrame(() => this.animate());
  },

  draw: function() {
    if (!this.canvas || !this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const time = this.time;

    // Clear
    this.ctx.fillStyle = 'rgba(15, 15, 35, 0.95)';
    this.ctx.fillRect(0, 0, w, h);

    // Draw waves
    const centerY = h / 2;
    
    // Wave 1
    this.ctx.strokeStyle = 'rgba(157, 78, 221, 0.7)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    for (let x = 0; x < w; x += 3) {
      const y = centerY + Math.sin((x + time * 50) * 0.02) * 40;
      if (x === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();

    // Wave 2 (secondary)
    this.ctx.strokeStyle = 'rgba(224, 170, 255, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    for (let x = 0; x < w; x += 4) {
      const y = centerY + Math.sin((x - time * 30) * 0.015) * 30;
      if (x === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();

    // Draw candles
    this.drawCandles(w, h, time);
  },

  drawCandles: function(w, h, time) {
    const centerY = h / 2;
    const spacing = 40;
    
    for (let i = 0; i < w / spacing; i++) {
      const x = (time * 60) + i * spacing;
      if (x < -30 || x > w) continue;

      const isGreen = i % 2 === 0;
      const waveOffset = Math.sin((x + time * 50) * 0.02) * 25;
      
      // Wick
      this.ctx.strokeStyle = isGreen ? 'rgba(100, 255, 150, 0.8)' : 'rgba(255, 100, 100, 0.8)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 6, centerY - 35 + waveOffset);
      this.ctx.lineTo(x + 6, centerY + 35 + waveOffset);
      this.ctx.stroke();

      // Body
      this.ctx.fillStyle = isGreen ? 'rgba(100, 255, 150, 0.7)' : 'rgba(255, 100, 100, 0.7)';
      this.ctx.strokeStyle = isGreen ? 'rgba(150, 255, 180, 0.9)' : 'rgba(255, 150, 150, 0.9)';
      this.ctx.lineWidth = 1.5;
      
      const bodyTop = centerY - 15 + waveOffset;
      this.ctx.fillRect(x, bodyTop, 12, 20);
      this.ctx.strokeRect(x, bodyTop, 12, 20);
    }
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
