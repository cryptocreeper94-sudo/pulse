import { useState, useEffect, useRef, useCallback } from 'react'
import '../../styles/command-center.css'

const CC_PIN = '741963'
const SESSION_KEY = 'cc_auth_ts'
const SESSION_TTL = 30 * 60 * 1000

const IMAGES = {
  dashboardOverview: '/assets/command-center/dashboard-overview.png',
  aiPredictions: '/assets/command-center/ai-predictions.png',
  tradingTerminal: '/assets/command-center/trading-terminal.png',
  walletSecurity: '/assets/command-center/wallet-security.png',
  analyticsData: '/assets/command-center/analytics-data.png',
  securityOps: '/assets/command-center/security-ops.png',
  developerTools: '/assets/command-center/developer-tools.png',
  financeBilling: '/assets/command-center/finance-billing.png',
  blockchainNetwork: '/assets/command-center/blockchain-network.png',
  socialCommunity: '/assets/command-center/social-community.png',
}

const GLOW = {
  blue: '0 4px 20px rgba(0, 212, 255, 0.2)',
  purple: '0 4px 20px rgba(139, 92, 246, 0.2)',
  green: '0 4px 20px rgba(16, 185, 129, 0.2)',
  red: '0 4px 20px rgba(255, 59, 48, 0.2)',
  pink: '0 4px 20px rgba(236, 72, 153, 0.2)',
  cyan: '0 4px 20px rgba(6, 182, 212, 0.2)',
  teal: '0 4px 20px rgba(20, 184, 166, 0.2)',
  silver: '0 4px 20px rgba(148, 163, 184, 0.2)',
}

const ICON_BG = {
  blue: 'linear-gradient(135deg, #00D4FF, #0088CC)',
  purple: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  green: 'linear-gradient(135deg, #10B981, #059669)',
  red: 'linear-gradient(135deg, #FF3B30, #CC2D26)',
  pink: 'linear-gradient(135deg, #EC4899, #DB2777)',
  cyan: 'linear-gradient(135deg, #06B6D4, #0891B2)',
  teal: 'linear-gradient(135deg, #14B8A6, #0D9488)',
  silver: 'linear-gradient(135deg, #94A3B8, #64748B)',
}

function getCategories(onNavigate) {
  return [
    {
      title: 'Mission Control',
      icon: '🎯',
      gradient: ICON_BG.blue,
      description: 'Your primary command tools. Monitor the platform, view real-time metrics, and oversee all operations from a single vantage point.',
      cards: [
        { label: 'Dashboard', description: 'Main platform overview with live metrics', href: 'dashboard', icon: '🏠', image: IMAGES.dashboardOverview, glow: GLOW.blue, badge: 'Live', featured: true },
        { label: 'Guardian AI', description: 'AI-powered platform security monitoring', href: 'guardian-ai', icon: '🛡️', image: IMAGES.securityOps, glow: GLOW.green, badge: 'New' },
        { label: 'Markets', description: 'Live cryptocurrency market data', href: 'markets', icon: '📊', image: IMAGES.analyticsData, glow: GLOW.blue },
        { label: 'Risk Dashboard', description: 'Real-time risk assessment and monitoring', href: 'risk', icon: '⚡', image: IMAGES.securityOps, glow: GLOW.red },
      ]
    },
    {
      title: 'AI & Predictions',
      icon: '🧠',
      gradient: ICON_BG.purple,
      description: 'Manage the AI prediction engine, review accuracy metrics across all timeframes, configure ML models, and set up autonomous trading rules.',
      cards: [
        { label: 'AI Accuracy', description: 'Track prediction accuracy across 1H/4H/24H/7D', href: 'accuracy', icon: '🎯', image: IMAGES.aiPredictions, glow: GLOW.purple, featured: true },
        { label: 'ML Dashboard', description: 'Machine learning model management', href: 'ml-dashboard', icon: '🧬', image: IMAGES.aiPredictions, glow: GLOW.purple, badge: 'Admin' },
        { label: 'Auto-Trade', description: 'Configure autonomous AI trading rules', href: 'auto-trade', icon: '🤖', image: IMAGES.tradingTerminal, glow: GLOW.purple, badge: 'Beta' },
        { label: 'Analysis', description: 'Deep coin analysis with AI insights', href: 'analysis', icon: '🔬', image: IMAGES.analyticsData, glow: GLOW.blue },
      ]
    },
    {
      title: 'Trading Operations',
      icon: '⚔️',
      gradient: ICON_BG.cyan,
      description: 'All trading tools in one place. Launch StrikeAgent, manage copy trading, scan for arbitrage opportunities, and monitor your portfolio.',
      cards: [
        { label: 'StrikeAgent', description: 'AI-powered token sniper and trading bot', href: 'sniper', icon: '🎯', image: IMAGES.tradingTerminal, glow: GLOW.cyan, badge: 'Pro', featured: true },
        { label: 'Copy Trading', description: 'Mirror trades from top performers', href: 'copy-trading', icon: '📋', image: IMAGES.tradingTerminal, glow: GLOW.cyan },
        { label: 'Arbitrage Scanner', description: 'Cross-exchange arbitrage opportunities', href: 'arbitrage', icon: '🔄', image: IMAGES.analyticsData, glow: GLOW.green },
        { label: 'Social Trading', description: 'Leaderboards and signal sharing', href: 'social', icon: '🏆', image: IMAGES.socialCommunity, glow: GLOW.pink },
        { label: 'Portfolio', description: 'Track all your holdings and P&L', href: 'portfolio', icon: '📈', image: IMAGES.financeBilling, glow: GLOW.blue },
      ]
    },
    {
      title: 'Wallet & Assets',
      icon: '💼',
      gradient: ICON_BG.teal,
      description: 'Manage your multi-chain wallet, clean up dust tokens, track NFT collections, and handle DeFi positions across all supported chains.',
      cards: [
        { label: 'Wallet', description: 'Multi-chain HD wallet management', href: 'wallet', icon: '💰', image: IMAGES.walletSecurity, glow: GLOW.teal, featured: true },
        { label: 'Dust Buster', description: 'Clean up small token balances', href: 'dust-buster', icon: '🧹', image: IMAGES.walletSecurity, glow: GLOW.teal, badge: 'Earn' },
        { label: 'NFT Portfolio', description: 'Multi-chain NFT tracking and analytics', href: 'nft', icon: '🖼️', image: IMAGES.blockchainNetwork, glow: GLOW.purple },
        { label: 'DeFi Dashboard', description: 'Staking, LP, and vault positions', href: 'defi', icon: '🏦', image: IMAGES.financeBilling, glow: GLOW.green },
      ]
    },
    {
      title: 'Intelligence & Alerts',
      icon: '🔔',
      gradient: ICON_BG.cyan,
      description: 'Stay ahead with price alerts, on-chain analytics, whale tracking, and crypto calendar events. Never miss a market-moving event.',
      cards: [
        { label: 'Price Alerts', description: 'Custom price and volume notifications', href: 'alerts', icon: '🔔', image: IMAGES.analyticsData, glow: GLOW.cyan, featured: true },
        { label: 'On-Chain Analytics', description: 'Gas tracker, DEX volume, token flows', href: 'onchain', icon: '⛓️', image: IMAGES.blockchainNetwork, glow: GLOW.blue },
        { label: 'Crypto Calendar', description: 'Unlocks, airdrops, and IDO schedule', href: 'calendar', icon: '📅', image: IMAGES.socialCommunity, glow: GLOW.purple },
      ]
    },
    {
      title: 'Finance & Revenue',
      icon: '💳',
      gradient: ICON_BG.green,
      description: 'Manage subscription tiers, view billing, generate tax reports, and track your referral earnings. All financial tools consolidated.',
      cards: [
        { label: 'Pricing Plans', description: 'Manage subscription tiers and billing', href: 'pricing', icon: '💳', image: IMAGES.financeBilling, glow: GLOW.green, featured: true },
        { label: 'Tax Reports', description: 'FIFO/LIFO calculation and export', href: 'tax', icon: '📋', image: IMAGES.analyticsData, glow: GLOW.green },
        { label: 'Referral Program', description: '10% lifetime commission tracking', href: 'referral', icon: '🤝', image: IMAGES.socialCommunity, glow: GLOW.pink, badge: 'Earn' },
      ]
    },
    {
      title: 'Developer & Technical',
      icon: '🛠️',
      gradient: ICON_BG.red,
      description: 'Access the developer API portal, review platform versioning, explore technical documentation, and manage integrations.',
      cards: [
        { label: 'Developer Portal', description: 'API keys, docs, and rate limits', href: 'dev-portal', icon: '🛠️', image: IMAGES.developerTools, glow: GLOW.red, badge: 'Admin', featured: true },
        { label: 'V2 Details', description: 'Platform version and release notes', href: 'v2-details', icon: '📦', image: IMAGES.developerTools, glow: GLOW.red },
      ]
    },
    {
      title: 'Learning & Resources',
      icon: '📚',
      gradient: ICON_BG.pink,
      description: 'Educational resources, trading strategies, platform guides, and the full whitepaper. Perfect for onboarding and skill development.',
      cards: [
        { label: 'Learn', description: 'Trading guides and educational content', href: 'learn', icon: '💡', image: IMAGES.socialCommunity, glow: GLOW.pink, featured: true },
        { label: 'Settings', description: 'Account preferences and configuration', href: 'settings', icon: '⚙️', image: IMAGES.securityOps, glow: GLOW.blue },
      ]
    },
  ]
}

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef([])

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setError('')

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newPin = pasted.split('')
      setPin(newPin)
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = () => {
    const entered = pin.join('')
    if (entered.length < 6) return
    setLoading(true)
    setTimeout(() => {
      if (entered === CC_PIN) {
        sessionStorage.setItem(SESSION_KEY, Date.now().toString())
        onUnlock()
      } else {
        setError('Invalid access code')
        setPin(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
      setLoading(false)
    }, 500)
  }

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  return (
    <div className="cc-pin-gate">
      <div className="cc-pin-box">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <h2>Command Center</h2>
        <p>Enter your 6-digit access code to continue</p>
        <div className="cc-pin-input-row" onPaste={handlePaste}>
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`cc-pin-digit ${error ? 'error' : ''}`}
              autoComplete="off"
            />
          ))}
        </div>
        <button
          className="cc-pin-submit"
          onClick={handleSubmit}
          disabled={pin.join('').length < 6 || loading}
        >
          {loading ? 'Verifying...' : 'Unlock Command Center'}
        </button>
        {error && <div className="cc-pin-error">{error}</div>}
      </div>
    </div>
  )
}

function CarouselSection({ cards, onNavigate }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (!scrollRef.current) return
    const amount = direction === 'left' ? -300 : 300
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className="cc-carousel-wrapper">
      <button className="cc-carousel-arrow left" onClick={() => scroll('left')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div className="cc-carousel" ref={scrollRef}>
        {cards.map((card, i) => (
          <div
            key={card.label}
            className={`cc-card ${card.featured ? 'featured' : ''}`}
            onClick={() => onNavigate(card.href)}
            style={{ boxShadow: card.glow }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = card.glow.replace('0.2)', '0.5)')}
            onMouseLeave={e => e.currentTarget.style.boxShadow = card.glow}
          >
            <img className="cc-card-image" src={card.image} alt="" loading="lazy" />
            <div className="cc-card-overlay" />
            <div className="cc-card-content">
              <div className="cc-card-icon-wrap" style={{ background: ICON_BG[Object.keys(GLOW).find(k => GLOW[k] === card.glow) || 'blue'] }}>
                {card.icon}
              </div>
              <div className="cc-card-label">{card.label}</div>
              <div className="cc-card-desc">{card.description}</div>
            </div>
            {card.badge && (
              <span className={`cc-card-badge ${card.badge.toLowerCase()}`}>
                {card.badge}
              </span>
            )}
          </div>
        ))}
      </div>
      <button className="cc-carousel-arrow right" onClick={() => scroll('right')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  )
}

export default function CommandCenterTab({ onNavigate, userConfig }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ts = sessionStorage.getItem(SESSION_KEY)
    if (ts && Date.now() - parseInt(ts) < SESSION_TTL) {
      setAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLock = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="cc-page">
        <div className="cc-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="cc-skeleton" style={{ height: 200 }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <PinGate onUnlock={() => setAuthenticated(true)} />
  }

  const categories = getCategories(onNavigate)

  return (
    <div className="cc-page">
      <div className="cc-sticky-header">
        <div className="cc-header-left">
          <button className="cc-back-btn" onClick={() => onNavigate('dashboard')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div>
            <div className="cc-header-title">COMMAND CENTER</div>
            <div className="cc-header-subtitle">DarkWave Studios Operations Hub</div>
          </div>
        </div>
        <div className="cc-header-right">
          <div className="cc-user-badge">
            <span>👑</span>
            <span>{userConfig?.accessLevel === 'owner' ? 'Owner' : 'Admin'}</span>
          </div>
          <button className="cc-lock-btn" onClick={handleLock}>
            🔒 Lock
          </button>
        </div>
      </div>

      <div className="cc-content">
        <div className="cc-hero">
          <div className="cc-hero-icon">🚀</div>
          <h1>Mission Control</h1>
          <p>
            Every tool, every feature, every management page — all in one place. 
            Select a category to launch into any part of the Pulse ecosystem.
          </p>
        </div>

        {categories.map((cat, catIndex) => (
          <div key={cat.title} className="cc-category" style={{ animationDelay: `${catIndex * 0.06}s` }}>
            <div className="cc-category-header">
              <div className="cc-category-icon" style={{ background: cat.gradient }}>
                {cat.icon}
              </div>
              <div className="cc-category-info">
                <h3>{cat.title}</h3>
                <p>{cat.description}</p>
              </div>
            </div>
            <CarouselSection cards={cat.cards} onNavigate={onNavigate} />
          </div>
        ))}
      </div>
    </div>
  )
}
