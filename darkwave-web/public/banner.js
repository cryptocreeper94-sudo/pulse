// Banner initialization helper
(function() {
  function initBanner() {
    const bannerWave = document.querySelector('.banner-wave');
    if (!bannerWave) return;

    // Create canvas if needed
    let canvas = document.getElementById('banner-chart-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'banner-chart-canvas';
      canvas.style.cssText = 'display:block;width:100%;height:100%;position:absolute;top:0;left:0;';
      bannerWave.appendChild(canvas);
    }

    // Initialize banner manager
    if (window.bannerChartManager) {
      window.bannerChartManager.canvas = canvas;
      window.bannerChartManager.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();
