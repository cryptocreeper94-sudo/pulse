import { useState, useEffect, useRef } from 'react'

function getGradientColor(value) {
  if (value <= 50) {
    const ratio = value / 50
    const r = 234
    const g = Math.round(57 + (245 - 57) * ratio)
    const b = Math.round(67 * (1 - ratio))
    return `rgb(${r}, ${g}, ${b})`
  } else {
    const ratio = (value - 50) / 50
    const r = Math.round(245 - (245 - 16) * ratio)
    const g = Math.round(245 - (245 - 199) * ratio)
    const b = Math.round(11 + (132 - 11) * ratio)
    return `rgb(${r}, ${g}, ${b})`
  }
}

function getAltSeasonGradientColor(value) {
  const ratio = value / 100
  const r = Math.round(255 * (1 - ratio))
  const g = Math.round(215 + (255 - 215) * ratio)
  const b = Math.round(0 + 255 * ratio)
  return `rgb(${r}, ${g}, ${b})`
}

export default function Gauge({ 
  value = 50, 
  type = 'fearGreed',
  size = 200,
  showLabels = true,
  animate = true 
}) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const prevValueRef = useRef(0)
  
  useEffect(() => {
    if (!animate) {
      setAnimatedValue(value)
      return
    }
    
    const startValue = prevValueRef.current
    const endValue = value
    const duration = 800
    const startTime = Date.now()
    
    const animateValue = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (endValue - startValue) * easeProgress
      
      setAnimatedValue(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(animateValue)
      } else {
        prevValueRef.current = endValue
      }
    }
    
    requestAnimationFrame(animateValue)
  }, [value, animate])
  
  const getColorFunc = type === 'altcoinSeason' ? getAltSeasonGradientColor : getGradientColor
  const needleColor = getColorFunc(animatedValue)
  
  const centerX = size / 2
  const centerY = size * 0.55
  const radius = size * 0.42
  const arcWidth = size * 0.12
  
  const angle = Math.PI + (Math.PI * (animatedValue / 100))
  const needleLength = radius + 8
  const needleX = centerX + Math.cos(angle) * needleLength
  const needleY = centerY + Math.sin(angle) * needleLength
  
  const segments = 20
  const arcPaths = []
  for (let i = 0; i < segments; i++) {
    const startAngle = Math.PI + (i * Math.PI / segments)
    const endAngle = Math.PI + ((i + 1) * Math.PI / segments)
    const segmentValue = (i / (segments - 1)) * 100
    const segmentColor = getColorFunc(segmentValue)
    
    const x1 = centerX + Math.cos(startAngle) * radius
    const y1 = centerY + Math.sin(startAngle) * radius
    const x2 = centerX + Math.cos(endAngle) * radius
    const y2 = centerY + Math.sin(endAngle) * radius
    
    arcPaths.push(
      <path
        key={i}
        d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
        stroke={segmentColor}
        strokeWidth={arcWidth}
        fill="none"
        strokeLinecap="round"
      />
    )
  }
  
  const labels = type === 'altcoinSeason' 
    ? { left: 'BTC', center: 'Neutral', right: 'ALT' }
    : { left: 'Fear', center: 'Neutral', right: 'Greed' }
  
  const getSentimentLabel = () => {
    if (type === 'altcoinSeason') {
      if (animatedValue < 25) return 'Bitcoin Season'
      if (animatedValue < 45) return 'BTC Leaning'
      if (animatedValue < 55) return 'Neutral'
      if (animatedValue < 75) return 'Alt Leaning'
      return 'Altcoin Season'
    } else {
      if (animatedValue < 20) return 'Extreme Fear'
      if (animatedValue < 40) return 'Fear'
      if (animatedValue < 60) return 'Neutral'
      if (animatedValue < 80) return 'Greed'
      return 'Extreme Greed'
    }
  }
  
  return (
    <div className="gauge-container" style={{ width: size, height: size * 0.6 }}>
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        <defs>
          <filter id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id={`needle-shadow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)"/>
          </filter>
        </defs>
        
        <g filter={`url(#glow-${type})`}>
          {arcPaths}
        </g>
        
        <g filter={`url(#needle-shadow-${type})`}>
          <polygon
            points={`
              ${centerX + Math.cos(angle + Math.PI/2) * 6},${centerY + Math.sin(angle + Math.PI/2) * 6}
              ${needleX},${needleY}
              ${centerX + Math.cos(angle - Math.PI/2) * 6},${centerY + Math.sin(angle - Math.PI/2) * 6}
            `}
            fill={needleColor}
            stroke="#FFFFFF"
            strokeWidth="1.5"
            style={{ transition: animate ? 'none' : 'all 0.3s ease' }}
          />
        </g>
        
        <circle
          cx={centerX}
          cy={centerY}
          r={8}
          fill="#00D4FF"
          stroke="#FFFFFF"
          strokeWidth="2"
          filter={`url(#glow-${type})`}
        />
        
        <text
          x={centerX}
          y={centerY - size * 0.15}
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize={size * 0.18}
          fontWeight="800"
          style={{ 
            textShadow: '0 0 10px rgba(0,0,0,0.8)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}
        >
          {Math.round(animatedValue)}
        </text>
        
        {showLabels && (
          <>
            <text
              x={centerX - radius - 5}
              y={centerY + 5}
              textAnchor="end"
              fill="rgba(255,255,255,0.6)"
              fontSize={size * 0.055}
              fontWeight="600"
            >
              {labels.left}
            </text>
            <text
              x={centerX}
              y={centerY - size * 0.35}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize={size * 0.045}
              fontWeight="500"
            >
              {labels.center}
            </text>
            <text
              x={centerX + radius + 5}
              y={centerY + 5}
              textAnchor="start"
              fill="rgba(255,255,255,0.6)"
              fontSize={size * 0.055}
              fontWeight="600"
            >
              {labels.right}
            </text>
          </>
        )}
      </svg>
      
      <div className="gauge-sentiment" style={{ color: needleColor }}>
        {getSentimentLabel()}
      </div>
    </div>
  )
}

export function GaugeCard({ title, value, type = 'fearGreed', onClick }) {
  return (
    <div className="gauge-card" onClick={onClick}>
      <div className="gauge-card-title">{title}</div>
      <div style={{ marginTop: type === 'fearGreed' ? '24px' : '0' }}>
        <Gauge value={value} type={type} size={160} />
      </div>
    </div>
  )
}
