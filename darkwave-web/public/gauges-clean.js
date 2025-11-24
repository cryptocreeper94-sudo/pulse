// Clean Gauges - Needle Only (No Cat Features)
console.log('✅ Clean Gauges loaded - Needle only mode with gradient needles');

// Unregister ALL service workers to clear caches
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
    console.log('🧹 Service workers unregistered - cache cleared');
  });
}

// Helper function to calculate gradient color based on value
// For Fear & Greed: 0 (red) → 50 (yellow) → 100 (green)
function getGradientColor(value) {
  if (value <= 50) {
    // Red to Yellow (0-50)
    const ratio = value / 50;
    const r = 234; // Red stays high
    const g = Math.round(57 + (245 - 57) * ratio); // Green increases
    const b = Math.round(67 * (1 - ratio)); // Blue decreases
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to Green (50-100)
    const ratio = (value - 50) / 50;
    const r = Math.round(245 - (245 - 16) * ratio); // Red decreases
    const g = Math.round(245 - (245 - 199) * ratio); // Green adjusts
    const b = Math.round(11 + (132 - 11) * ratio); // Blue increases
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// Helper function for Altcoin Season gradient
// 0 (Bitcoin dominance - Gold) → 100 (Altcoin dominance - Cyan)
function getAltSeasonGradientColor(value) {
  const ratio = value / 100;
  // Gold: rgb(255, 215, 0) → Cyan: rgb(0, 255, 255)
  const r = Math.round(255 * (1 - ratio)); // Red decreases from 255 to 0
  const g = Math.round(215 + (255 - 215) * ratio); // Green increases from 215 to 255
  const b = Math.round(0 + 255 * ratio); // Blue increases from 0 to 255
  return `rgb(${r}, ${g}, ${b})`;
}

// Fear & Greed Gauge - Clean Version
function drawFearGreedGaugeClean(canvasId, value) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const radius = Math.min(canvas.width, canvas.height) / 2 - 15;
  const centerY = canvas.height - 10;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background arc with smooth gradient from red to dark green
  const numSegments = 20; // Smooth gradient with many small segments
  const totalAngle = Math.PI; // 180 degrees
  const segmentAngle = totalAngle / numSegments;
  const lineWidth = Math.max(8, radius / 3);
  
  for (let i = 0; i < numSegments; i++) {
    const startAngle = Math.PI + (i * segmentAngle);
    const endAngle = startAngle + segmentAngle;
    const segmentValue = (i / (numSegments - 1)) * 100; // 0 to 100
    const segmentColor = getGradientColor(segmentValue);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = segmentColor;
    ctx.stroke();
  }
  
  // Draw gradient needle based on value
  const angle = Math.PI + (Math.PI * (value / 100));
  const needleLength = radius + 5;
  const needleColor = getGradientColor(value);
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(needleLength, 0);
  ctx.lineTo(0, 12);
  ctx.closePath();
  
  ctx.fillStyle = needleColor;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.restore();
  
  // Draw center dot
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#3861FB';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();
  
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

// Altcoin Season Gauge - Clean Version
function drawAltSeasonGaugeClean(canvas, value) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const radius = Math.min(width, height) / 2 - 15;
  const centerY = height - 10;
  const lineWidth = Math.max(8, radius / 3);
  
  ctx.clearRect(0, 0, width, height);
  
  // Draw background arc with smooth gradient from gold (Bitcoin) to cyan (Altcoin)
  const numSegments = 20; // Smooth gradient with many small segments
  const totalAngle = Math.PI; // 180 degrees
  const segmentAngle = totalAngle / numSegments;
  
  for (let i = 0; i < numSegments; i++) {
    const startAngle = Math.PI + (i * segmentAngle);
    const endAngle = startAngle + segmentAngle;
    const segmentValue = (i / (numSegments - 1)) * 100; // 0 to 100
    const segmentColor = getAltSeasonGradientColor(segmentValue);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = segmentColor;
    ctx.stroke();
  }
  
  // Draw gradient needle based on value (gold to cyan)
  const needleAngle = Math.PI + (value / 100) * Math.PI;
  const needleLength = radius + 5;
  
  // Altcoin Season: 0 (Bitcoin dominance - gold) → 100 (Altcoin dominance - cyan)
  const altColor = getAltSeasonGradientColor(value);
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(needleAngle);
  
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(needleLength, 0);
  ctx.lineTo(0, 12);
  ctx.closePath();
  
  ctx.fillStyle = altColor;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.restore();
  
  // Draw center dot
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#3861FB';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();
  
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

// Expose globally
window.drawFearGreedGaugeClean = drawFearGreedGaugeClean;
window.drawAltSeasonGaugeClean = drawAltSeasonGaugeClean;
