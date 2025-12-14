import { useState, useEffect, useCallback } from 'react'
import './TopSignalsWidget.css'

const API_BASE = ''

const CHAIN_CONFIG = {
  all: { label: 'All Chains', icon: '🌐', color: '#00D4FF' },
  solana: { label: 'Solana', icon: '◎', color: '#9945FF' },
  ethereum: { label: 'Ethereum', icon: '⬡', color: '#627EEA' },
  base: { label: 'Base', icon: '🔵', color: '#0052FF' },
  polygon: { label: 'Polygon', icon: '⬡', color: '#8247E5' },
  arbitrum: { label: 'Arbitrum', icon: '🔷', color: '#28A0F0' },
  bsc: { label: 'BSC', icon: '⬡', color: '#F3BA2F' },
}

function getChainBadge(chain) {
  const config = CHAIN_CONFIG[chain?.toLowerCase()] || CHAIN_CONFIG.solana
  const shortLabels = {
    solana: 'SOL',
    ethereum: 'ETH',
    base: 'BASE',
    polygon: 'MATIC',
    arbitrum: 'ARB',
    bsc: 'BNB',
  }
  return {
    icon: config.icon,
    label: shortLabels[chain?.toLowerCase()] || 'SOL',
    color: config.color,
  }
}

function getScoreColor(score) {
  if (score >= 70) return '#39FF14'
  if (score >= 40) return '#FFD700'
  return '#FF4444'
}

function getCategoryColor(category) {
  switch (category) {
    case 'blue_chip': return { bg: 'rgba(0, 123, 255, 0.15)', color: '#007BFF', border: 'rgba(0, 123, 255, 0.4)' }
    case 'defi': return { bg: 'rgba(138, 43, 226, 0.15)', color: '#9D4EDD', border: 'rgba(138, 43, 226, 0.4)' }
    case 'meme': return { bg: 'rgba(255, 105, 180, 0.15)', color: '#FF69B4', border: 'rgba(255, 105, 180, 0.4)' }
    case 'dex': return { bg: 'rgba(0, 212, 255, 0.15)', color: '#00D4FF', border: 'rgba(0, 212, 255, 0.4)' }
    case 'new': return { bg: 'rgba(57, 255, 20, 0.15)', color: '#39FF14', border: 'rgba(57, 255, 20, 0.4)' }
    default: return { bg: 'rgba(136, 136, 136, 0.15)', color: '#888', border: 'rgba(136, 136, 136, 0.4)' }
  }
}

function getCategoryLabel(category) {
  switch (category) {
    case 'blue_chip': return 'Blue Chip'
    case 'defi': return 'DeFi'
    case 'meme': return 'Meme'
    case 'dex': return 'DEX'
    case 'new': return 'New'
    default: return category || 'Unknown'
  }
}

function getIndicatorStyle(indicator) {
  const lowerIndicator = indicator.toLowerCase()
  if (lowerIndicator.includes('bullish') || lowerIndicator.includes('oversold') || lowerIndicator.includes('surge') || lowerIndicator.includes('buy')) {
    return { bg: 'rgba(57, 255, 20, 0.15)', color: '#39FF14', border: 'rgba(57, 255, 20, 0.3)' }
  }
  if (lowerIndicator.includes('bearish') || lowerIndicator.includes('overbought') || lowerIndicator.includes('sell')) {
    return { bg: 'rgba(255, 68, 68, 0.15)', color: '#FF4444', border: 'rgba(255, 68, 68, 0.3)' }
  }
  return { bg: 'rgba(0, 212, 255, 0.15)', color: '#00D4FF', border: 'rgba(0, 212, 255, 0.3)' }
}

function formatPrice(price) {
  if (!price && price !== 0) return '$0.00'
  if (price < 0.0001) return `$${price.toExponential(2)}`
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1) return `$${price.toFixed(4)}`
  if (price < 1000) return `$${price.toFixed(2)}`
  return `$${(price / 1000).toFixed(2)}K`
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Just now'
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

export default function TopSignalsWidget({ onAnalyze }) {
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshCountdown, setRefreshCountdown] = useState(60)
  const [selectedChain, setSelectedChain] = useState('all')

  const fetchSignals = useCallback(async () => {
    try {
      setError(null)
      const chainParam = selectedChain !== 'all' ? `?chain=${selectedChain}` : ''
      const res = await fetch(`${API_BASE}/api/strike-agent/top-signals${chainParam}`)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      if (data.success && data.signals) {
        setSignals(data.signals.slice(0, 10))
        setLastUpdated(new Date())
      } else if (data.error) {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error('Failed to fetch top signals:', err)
      setError(err.message || 'Failed to load signals')
    } finally {
      setLoading(false)
      setRefreshCountdown(60)
    }
  }, [selectedChain])

  useEffect(() => {
    fetchSignals()
    const interval = setInterval(fetchSignals, 60000)
    return () => clearInterval(interval)
  }, [fetchSignals])

  const handleChainChange = (chain) => {
    setSelectedChain(chain)
    setLoading(true)
  }

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setRefreshCountdown(prev => (prev > 0 ? prev - 1 : 60))
    }, 1000)
    return () => clearInterval(countdownInterval)
  }, [])

  const handleCardClick = (signal) => {
    if (onAnalyze) {
      onAnalyze(signal)
    }
  }

  if (loading) {
    return (
      <div className="top-signals-widget">
        <div className="signals-loading">
          <div className="signals-spinner"></div>
          <span>Analyzing markets...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="top-signals-widget">
      <div className="signals-disclaimer">
        ⚠️ Not financial advice - Always DYOR (Do Your Own Research)
      </div>

      <div className="signals-chain-filter">
        <div className="chain-filter-scroll">
          {Object.entries(CHAIN_CONFIG).map(([key, config]) => (
            <button
              key={key}
              className={`chain-filter-btn ${selectedChain === key ? 'active' : ''}`}
              onClick={() => handleChainChange(key)}
              style={{
                '--chain-color': config.color,
                '--chain-glow': `${config.color}40`,
              }}
            >
              <span className="chain-icon">{config.icon}</span>
              <span className="chain-label">{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="signals-header">
        <div className="signals-title-group">
          <h3 className="signals-title">🎯 Top 10 Tokens to Watch</h3>
          <span className="signals-subtitle">AI-powered signal analysis</span>
        </div>
        <div className="signals-meta">
          {lastUpdated && (
            <span className="signals-last-updated">
              Updated {formatTimeAgo(lastUpdated)}
            </span>
          )}
          <span className="signals-refresh-timer">
            Refresh in {refreshCountdown}s
          </span>
          <button className="signals-refresh-btn" onClick={fetchSignals} disabled={loading}>
            ↻
          </button>
        </div>
      </div>

      {error && (
        <div className="signals-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <button className="error-retry" onClick={fetchSignals}>Retry</button>
        </div>
      )}

      {!error && signals.length === 0 && (
        <div className="signals-empty">
          <div className="empty-icon">📊</div>
          <div className="empty-text">No signals available</div>
          <div className="empty-hint">Check back soon for AI-analyzed trading opportunities</div>
        </div>
      )}

      {!error && signals.length > 0 && (
        <div className="signals-list">
          {signals.map((signal, index) => {
            const catStyle = getCategoryColor(signal.category)
            const scoreColor = getScoreColor(signal.compositeScore || 0)
            
            return (
              <div
                key={signal.id || signal.tokenAddress || index}
                className="signal-card"
                onClick={() => handleCardClick(signal)}
              >
                <div className="signal-rank" style={{ color: index < 3 ? '#FFD700' : '#00D4FF' }}>
                  #{index + 1}
                </div>

                <div className="signal-main">
                  <div className="signal-token-info">
                    <span className="signal-symbol">{signal.tokenSymbol || signal.symbol}</span>
                    <span className="signal-name">{signal.tokenName || signal.name}</span>
                  </div>
                  <div className="signal-price">
                    {formatPrice(signal.priceUsd || signal.price)}
                  </div>
                </div>

                <div className="signal-score-section">
                  <div 
                    className="signal-score" 
                    style={{ 
                      color: scoreColor,
                      textShadow: `0 0 10px ${scoreColor}40`
                    }}
                  >
                    {Math.round(signal.compositeScore || 0)}
                  </div>
                  <span className="signal-score-label">Score</span>
                </div>

                <div className="signal-badges">
                  {(() => {
                    const chainBadge = getChainBadge(signal.chain || 'solana')
                    return (
                      <span 
                        className="signal-chain-badge"
                        style={{
                          background: `${chainBadge.color}15`,
                          color: chainBadge.color,
                          borderColor: `${chainBadge.color}40`
                        }}
                      >
                        {chainBadge.icon} {chainBadge.label}
                      </span>
                    )
                  })()}
                  <span 
                    className="signal-category-badge"
                    style={{
                      background: catStyle.bg,
                      color: catStyle.color,
                      borderColor: catStyle.border
                    }}
                  >
                    {getCategoryLabel(signal.category)}
                  </span>
                  
                  {signal.indicators && signal.indicators.slice(0, 2).map((indicator, i) => {
                    const indStyle = getIndicatorStyle(indicator)
                    return (
                      <span 
                        key={i}
                        className="signal-indicator-badge"
                        style={{
                          background: indStyle.bg,
                          color: indStyle.color,
                          borderColor: indStyle.border
                        }}
                      >
                        {indicator}
                      </span>
                    )
                  })}
                </div>

                <div className="signal-action">
                  <span className="signal-analyze-hint">Click to analyze →</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
