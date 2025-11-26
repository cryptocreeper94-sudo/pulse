// Fear & Greed Gauge - CMC Style (UPDATED VERSION - NOV 14 2025)
console.log('🎯 Fear & Greed Gauge UPDATED VERSION loaded - Nov 14 2025');

// Cat images for Fear & Greed gauge disabled - using clean gauges instead (Nov 26 2025)
const businessCatImages = {
  grumpyFace: null,
  coolFace: null,
  arm: null,
  loaded: false
};

function preloadBusinessCatImages() {
  // Disabled - no longer using cat sprite sheets for gauges
  // Using clean needle-only gauges from gauges-clean.js
  console.log('ℹ️ Cat gauge images disabled - using clean gauges');
}

// Preload images on script load
if (typeof window !== 'undefined') {
  preloadBusinessCatImages();
}

function drawFearGreedGaugeBackground(ctx, centerX, centerY, radius) {
  // Draw background arc segments (shared by both needle types)
  const segments = [
    { start: Math.PI, end: Math.PI * 1.2, color: '#EA3943', label: 'Fear' },
    { start: Math.PI * 1.2, end: Math.PI * 1.4, color: '#F59E0B', label: 'Neutral' },
    { start: Math.PI * 1.4, end: Math.PI * 1.6, color: '#10B981', label: 'Greed' },
    { start: Math.PI * 1.6, end: Math.PI * 1.8, color: '#16C784', label: 'Extreme' },
    { start: Math.PI * 1.8, end: Math.PI * 2, color: '#059669', label: 'Greed' }
  ];
  
  const lineWidth = Math.max(8, radius / 3);
  segments.forEach(seg => {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, seg.start, seg.end);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = seg.color;
    ctx.stroke();
  });
}

function drawRegularNeedle(ctx, centerX, centerY, radius, angle, needleLength) {
  // Regular static needle (when Commentary Mode is OFF)
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle); // Fixed: removed + Math.PI / 2 offset
  
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(needleLength, 0);
  ctx.lineTo(0, 12);
  ctx.closePath();
  
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#3861FB';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  ctx.restore();
}

function drawCatNeedle(ctx, centerX, centerY, radius, angle, needleLength, value, scaleFactor = 1, canvasHeight) {
  // SIMPLIFIED: Just white needle + cat face (no arm for now)
  if (!businessCatImages.loaded) {
    drawRegularNeedle(ctx, centerX, centerY, radius, angle, needleLength);
    return;
  }
  
  // Use same cat face for both business and casual modes (grumpy face)
  const catFace = businessCatImages.grumpyFace;
  
  if (!catFace) {
    drawRegularNeedle(ctx, centerX, centerY, radius, angle, needleLength);
    return;
  }
  
  // 1. Draw regular white needle
  drawRegularNeedle(ctx, centerX, centerY, radius, angle, needleLength);
  
  // 2. Draw cat face on baseline (proper proportions)
  const faceWidth = 50 * scaleFactor;
  const faceScale = faceWidth / catFace.width;
  const faceHeight = catFace.height * faceScale;
  const faceX = centerX - faceWidth / 2;
  const faceY = centerY - faceHeight;
  
  ctx.drawImage(catFace, faceX, faceY, faceWidth, faceHeight);
}

function drawFearGreedGauge(canvasId, value, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const radius = Math.min(canvas.width, canvas.height) / 2 - 15;
  const centerY = canvas.height - 10;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  drawFearGreedGaugeBackground(ctx, centerX, centerY, radius);
  
  const angle = Math.PI + (Math.PI * (value / 100));
  const needleLength = radius + 5;
  
  // Check persona mode: Business/Casual = cat needles, Off = regular needles
  const isDashboard = options.mode === 'dashboard';
  const personaMode = window.currentCatMode || 'off';
  const catNeedleEnabled = !isDashboard && (personaMode === 'business' || personaMode === 'casual');
  
  console.log('Drawing Fear & Greed needle:', { value, angle, catMode: catNeedleEnabled, personaMode, mode: options.mode });
  
  // Scale factor: popup mode gets 2.2x larger cat images for visibility
  const scaleFactor = options.mode === 'popup' ? 2.2 : 1;
  
  if (catNeedleEnabled) {
    drawCatNeedle(ctx, centerX, centerY, radius, angle, needleLength, value, scaleFactor, canvas.height);
    // NO CENTER DOT for cat needle - cat body covers it
  } else {
    drawRegularNeedle(ctx, centerX, centerY, radius, angle, needleLength);
    // Draw center circle only for regular needle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#3861FB';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  
  // Draw value number - COMMENTED OUT: values now displayed in gauge-value-display div above canvas
  // ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  // ctx.fillStyle = '#FFFFFF';
  // ctx.textAlign = 'center';
  // ctx.textBaseline = 'middle';
  // ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  // ctx.shadowBlur = 4;
  // ctx.shadowOffsetX = 0;
  // ctx.shadowOffsetY = 0;
  // ctx.fillText(Math.round(value), centerX, centerY - 35);
  // ctx.shadowBlur = 0;
}

// Initialize on load
if (typeof window !== 'undefined') {
  window.drawFearGreedGauge = drawFearGreedGauge;
}
