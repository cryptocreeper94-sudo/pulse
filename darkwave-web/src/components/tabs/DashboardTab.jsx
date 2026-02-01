import { useState, useEffect } from 'react'
import { useFavorites } from '../../context/FavoritesContext'
import BitcoinChart from '../charts/BitcoinChart'
import Sparkline from '../charts/Sparkline'
import Gauge from '../ui/Gauge'
import FlipCarousel from '../ui/FlipCarousel'
import MobileCardCarousel from '../ui/MobileCardCarousel'
import AIStatusWidget from '../ui/AIStatusWidget'
import StrikeAgentLiveWidget from '../ui/StrikeAgentLiveWidget'
import MetricInfoModal from '../modals/MetricInfoModal'
import versionData from '../../data/version.json'
import { useIsMobile, useViewportBreakpoint } from '../../hooks/useViewportBreakpoint'
import '../../styles/dashboard.css'

// Layout hook - uses shared viewport breakpoint hook for consistent mobile detection
function useMobileLayout() {
  return useIsMobile()
}

// Device hook - detects actual mobile devices for data fetching (keeps desktop data paths working)
function useIsMobileDevice() {
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  
  useEffect(() => {
    const ua = navigator.userAgent || ''
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
                     (navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches)
    setIsMobileDevice(isMobile)
  }, [])
  
  return isMobileDevice
}

// Legacy hook for backwards compatibility - uses device detection for data, not viewport
function useLegacyIsMobile() {
  return useIsMobileDevice()
}

function formatMarketCap(value) {
  if (!value) return '—'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

function formatPrice(price) {
  if (!price) return '$0.00'
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1) return `$${price.toFixed(4)}`
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatSupply(value) {
  if (!value) return '—'
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
  return value.toFixed(0)
}

function BentoTile({ children, className = '', style = {}, onClick }) {
  const isTable = className.includes('bento-table')
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: 'rgba(26, 58, 92, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 212, 255, 0.15)',
        borderRadius: 12,
        padding: 10,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: isTable ? 'visible' : undefined,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 212, 255, 0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.15)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      {children}
    </div>
  )
}

function TileLabel({ children, color = 'var(--text-muted)' }) {
  const isMobileLayout = window.matchMedia('(max-width: 1024px)').matches
  return (
    <div className="tile-label" style={{
      fontSize: isMobileLayout ? 12 : 9,
      fontWeight: 700,
      color,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

function QuickActionContent({ action, isMobile = false }) {
  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: '100%',
      borderRadius: isMobile ? 8 : 12,
      overflow: 'hidden',
      background: '#1a1a1a',
    }}>
      <img 
        src={action.image} 
        alt={action.title}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
        }}
        onError={(e) => {
          e.target.style.display = 'none'
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: isMobile ? '20px 8px 8px' : '40px 16px 16px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
      }}>
        <div style={{ fontSize: isMobile ? 12 : 18, fontWeight: 700, color: action.color, whiteSpace: 'nowrap' }}>{action.title}</div>
        <div style={{ fontSize: isMobile ? 9 : 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{action.subtitle}</div>
      </div>
    </div>
  )
}

function MetricContent({ title, value, change, isMobile = false }) {
  const isPositive = change >= 0
  const hasChange = change !== null && change !== undefined
  const valueColor = hasChange ? (isPositive ? 'var(--neon-green)' : 'var(--accent-red)') : 'var(--text-primary)'
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: isMobile ? 120 : 110,
      padding: isMobile ? 8 : 12,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: isMobile ? 9 : 10, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: isMobile ? 4 : 10, letterSpacing: isMobile ? 0.5 : 1 }}>
        {title}
      </div>
      <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 800, color: valueColor, marginBottom: hasChange ? (isMobile ? 3 : 6) : 0 }}>
        {value}
      </div>
      {hasChange && (
        <div style={{ 
          fontSize: isMobile ? 11 : 13, 
          fontWeight: 600, 
          color: isPositive ? 'var(--neon-green)' : 'var(--accent-red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? 2 : 4,
        }}>
          <span>{isPositive ? '▲' : '▼'}</span>
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      )}
    </div>
  )
}

function GaugeContent({ title, value, type, accentColor, isMobile = false }) {
  const { gaugeSize: hookGaugeSize, isMobile: hookIsMobile, isVerySmall } = useViewportBreakpoint()
  const effectiveIsMobile = isMobile || hookIsMobile
  // Compact gauge sizes - 140px on mobile, 200px on desktop for tight DexScreener-style layout
  const gaugeSize = effectiveIsMobile ? 140 : Math.min(hookGaugeSize * 1.5, 200)
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: effectiveIsMobile ? 160 : 220,
      padding: effectiveIsMobile ? 4 : 12,
      overflow: 'hidden',
    }}>
      <div style={{ 
        color: accentColor, 
        fontSize: effectiveIsMobile ? 10 : 14, 
        fontWeight: 700, 
        textTransform: 'uppercase', 
        letterSpacing: effectiveIsMobile ? 0.5 : 1,
        marginBottom: effectiveIsMobile ? 4 : 10,
        textAlign: 'center',
        width: '100%',
      }}>
        {title}
      </div>
      <div style={{ width: '100%', maxWidth: gaugeSize, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <Gauge value={value} type={type} size={gaugeSize} showLabels={!effectiveIsMobile} />
      </div>
    </div>
  )
}

function CoinContent({ coin, isFavorite }) {
  if (!coin) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        background: 'linear-gradient(135deg, var(--bg-surface-2) 0%, var(--bg-surface) 100%)',
        borderRadius: 12,
        color: 'var(--text-muted)',
      }}>
        No data
      </div>
    )
  }
  
  const change = coin.price_change_percentage_24h || 0
  const isPositive = change >= 0
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: 12,
      gap: 8,
      background: 'linear-gradient(135deg, var(--bg-surface-2) 0%, var(--bg-surface) 100%)',
      borderRadius: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {coin.image ? (
          <img 
            src={coin.image} 
            alt="" 
            style={{ width: 36, height: 36, borderRadius: '50%' }}
            onError={(e) => e.target.style.display = 'none'}
          />
        ) : (
          <div style={{ 
            width: 36, 
            height: 36, 
            borderRadius: '50%', 
            background: 'var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00D4FF',
            fontWeight: 'bold',
            fontSize: 14,
          }}>
            {coin.symbol?.charAt(0) || '?'}
          </div>
        )}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {coin.symbol?.toUpperCase() || 'UNKNOWN'}
            {isFavorite && <span style={{ color: 'var(--neon-blue)', marginLeft: 6 }}>★</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{coin.name || 'Unknown'}</div>
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
        {formatPrice(coin.current_price || coin.price)}
      </div>
      <div style={{ 
        fontSize: 13, 
        fontWeight: 600, 
        color: isPositive ? 'var(--neon-green)' : 'var(--accent-red)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <span>{isPositive ? '▲' : '▼'}</span>
        <span>{Math.abs(change).toFixed(2)}%</span>
      </div>
    </div>
  )
}

function NewsContent({ news }) {
  return (
    <div 
      style={{ 
        height: '100%',
        padding: '8px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        cursor: 'pointer',
        textAlign: 'center',
      }}
      onClick={() => news.url && window.open(news.url, '_blank')}
    >
      <div style={{ fontSize: 10, color: '#00D4FF', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>
        {news.source}
      </div>
      <div style={{ 
        fontSize: 13, 
        fontWeight: 600, 
        color: 'var(--text-primary)', 
        lineHeight: 1.4,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        marginBottom: 8,
      }}>
        {news.title}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{news.time}</div>
    </div>
  )
}

function MobileNewsCard({ news }) {
  if (!news) return null
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation()
        if (news?.url && news.url !== '#') {
          window.open(news.url, '_blank', 'noopener,noreferrer')
        }
      }}
      style={{
        background: 'var(--bg-surface-2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-light)',
        borderRadius: 20,
        padding: 24,
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 212, 255, 0.1)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Top glow accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '20%',
        right: '20%',
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.6), transparent)',
      }} />
      
      {/* Corner glow */}
      <div style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      
      <div style={{ 
        fontSize: 11, 
        color: '#00D4FF', 
        fontWeight: 700, 
        marginBottom: 12, 
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}>
        {news.source}
      </div>
      <div style={{ 
        fontSize: 16, 
        fontWeight: 600, 
        color: 'var(--text-primary)', 
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        marginBottom: 14,
      }}>
        {news.title}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{news.time}</div>
    </div>
  )
}

const coinCategories = [
  { id: 'top', label: 'Top' },
  { id: 'gainers', label: 'Gainers' },
  { id: 'losers', label: 'Losers' },
  { id: 'meme', label: 'Meme' },
  { id: 'defi', label: 'DeFi' },
  { id: 'dex', label: 'DEX' },
]

const memeCoins = ['doge', 'shib', 'pepe', 'floki', 'bonk', 'wif', 'meme', 'turbo', 'brett', 'mog', 'popcat', 'neiro', 'pnut', 'act', 'goat', 'cow', 'fartcoin', 'chillguy', 'ponke', 'slerf']
const defiCoins = ['uni', 'aave', 'mkr', 'ldo', 'crv', 'snx', 'comp', 'sushi', 'yfi', '1inch', 'pendle', 'ena', 'ethfi', 'eigen', 'ondo']
const dexCoins = ['uni', 'cake', 'ray', 'jup', 'dydx', 'gmx', 'sushi', '1inch', 'crv', 'bal', 'joe', 'orca', 'velo', 'aero', 'osmo']

function isContractAddress(input) {
  if (!input) return false
  const trimmed = input.trim()
  if (trimmed.startsWith('0x') && trimmed.length === 42) return 'evm'
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) return 'solana'
  return false
}

function MiniCoinTable({ coins: initialCoins, onCoinClick, favorites, selectedCoinId }) {
  const [category, setCategory] = useState('top')
  const [timeframe, setTimeframe] = useState('24h')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [categoryCoins, setCategoryCoins] = useState([])
  const [loading, setLoading] = useState(false)
  const isFavorite = (symbol) => favorites?.some(f => f.symbol?.toUpperCase() === symbol?.toUpperCase())
  
  useEffect(() => {
    let retryCount = 0
    let retryTimer = null
    
    const fetchCategoryCoins = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/crypto/category/${category}?timeframe=${timeframe}`)
        if (response.ok) {
          const data = await response.json()
          if (data.coins && Array.isArray(data.coins)) {
            setCategoryCoins(data.coins)
            retryCount = 0
          }
        } else if (retryCount < 5) {
          retryCount++
          retryTimer = setTimeout(fetchCategoryCoins, 2000)
        }
      } catch (err) {
        console.log('Failed to fetch category coins:', err)
        if (retryCount < 5) {
          retryCount++
          retryTimer = setTimeout(fetchCategoryCoins, 2000)
        } else {
          setCategoryCoins([])
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategoryCoins()
    
    return () => {
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [category, timeframe])
  
  const getFilteredCoins = () => {
    if (searchResults) return [searchResults]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return categoryCoins.filter(c => 
        c.name?.toLowerCase().includes(query) || 
        c.symbol?.toLowerCase().includes(query)
      ).slice(0, 20)
    }
    
    return categoryCoins.slice(0, 20)
  }
  
  const handleSearchChange = async (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setSearchResults(null)
    
    const caType = isContractAddress(value)
    if (caType) {
      setIsSearching(true)
      try {
        const response = await fetch(`/api/token-lookup?address=${encodeURIComponent(value.trim())}`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.id) {
            setSearchResults(data)
          }
        }
      } catch (err) {
        console.log('Token lookup failed:', err)
      } finally {
        setIsSearching(false)
      }
    }
  }
  
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const displayCoins = getFilteredCoins()
      if (displayCoins.length > 0) {
        onCoinClick(displayCoins[0])
      }
    }
  }
  
  const displayCoins = getFilteredCoins()
  
  const isMobileView = window.matchMedia('(max-width: 1024px)').matches
  return (
    <div style={{ height: isMobileView ? 380 : 600, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobileView ? 6 : 8, flexWrap: 'wrap', gap: isMobileView ? 4 : 8 }}>
        <TileLabel>{category === 'top' ? 'Top Coins' : category === 'gainers' ? 'Top Gainers' : category === 'losers' ? 'Top Losers' : category === 'meme' ? 'Meme Coins' : category === 'defi' ? 'DeFi' : 'DEX Tokens'}</TileLabel>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface-2)', borderRadius: 6, padding: 2 }}>
          <button
            onClick={() => setTimeframe('1h')}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              border: 'none',
              background: timeframe === '1h' ? '#00D4FF' : 'transparent',
              color: timeframe === '1h' ? '#000' : 'var(--text-muted)',
              fontWeight: timeframe === '1h' ? 600 : 400,
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            1H
          </button>
          <button
            onClick={() => setTimeframe('24h')}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              border: 'none',
              background: timeframe === '24h' ? '#00D4FF' : 'transparent',
              color: timeframe === '24h' ? '#000' : 'var(--text-muted)',
              fontWeight: timeframe === '24h' ? 600 : 400,
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            24H
          </button>
        </div>
      </div>
      <div className="coin-filter-section">
        <div className="coin-filter-buttons">
          {coinCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setSearchQuery(''); setSearchResults(null); }}
              className={`coin-filter-btn ${category === cat.id ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search coin or paste contract address..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            style={{
              width: 220,
              padding: '8px 12px',
              fontSize: 12,
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#00D4FF'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
          {isSearching && (
            <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#00D4FF', fontSize: 10 }}>
              ...
            </div>
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', padding: '8px 4px', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1, minWidth: 320, letterSpacing: '0.04em' }}>
          <span style={{ width: '10%', minWidth: 32, textAlign: 'center' }}>#</span>
          <span style={{ width: '30%', minWidth: 80 }}>Coin</span>
          <span style={{ width: '25%', minWidth: 70, textAlign: 'right' }}>Price</span>
          <span style={{ width: '15%', minWidth: 55, textAlign: 'right' }}>{timeframe === '1h' ? '1h' : '24h'}</span>
          <span style={{ width: '20%', minWidth: 60, textAlign: 'right' }}>Volume</span>
        </div>
        {loading ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span>Loading coins...</span>
            </div>
          </div>
        ) : displayCoins.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: 11 }}>
            No coins found for this category
          </div>
        ) : displayCoins.map((coin, i) => {
          const priceNum = typeof coin.price === 'number' ? coin.price : parseFloat(coin.price) || 0
          const changeNum = typeof coin.change === 'number' ? coin.change : parseFloat(coin.change) || 0
          const volumeNum = typeof coin.volume === 'number' ? coin.volume : parseFloat(coin.volume) || 0
          const isPositive = changeNum >= 0
          const vol = volumeNum >= 1e9 ? `$${(volumeNum / 1e9).toFixed(1)}B` : volumeNum >= 1e6 ? `$${(volumeNum / 1e6).toFixed(0)}M` : volumeNum >= 1e3 ? `$${(volumeNum / 1e3).toFixed(0)}K` : `$${volumeNum.toFixed(0)}`
          const isSelected = coin.symbol === selectedCoinId
          return (
            <div 
              key={coin.symbol || i}
              onClick={() => onCoinClick({ ...coin, current_price: priceNum, id: coin.symbol?.toLowerCase() })}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '10px 4px',
                borderBottom: '1px solid var(--bg-surface-2)',
                cursor: 'pointer',
                transition: 'background 0.2s',
                background: isSelected ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                borderLeft: isSelected ? '2px solid #00D4FF' : '2px solid transparent',
                minWidth: 320,
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface-2)' }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ width: '8%', minWidth: 28, textAlign: 'center', fontSize: 11, color: '#00D4FF', fontWeight: 600 }}>
                {i + 1}
              </div>
              <div style={{ width: '22%', minWidth: 70, display: 'flex', alignItems: 'center', gap: 5 }}>
                {coin.image && (
                  <img src={coin.image} alt="" style={{ width: 18, height: 18, borderRadius: '50%' }} onError={(e) => e.target.style.display = 'none'} />
                )}
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {coin.symbol?.toUpperCase()}
                  {isFavorite(coin.symbol) && <span style={{ color: 'var(--neon-blue)', marginLeft: 2 }}>★</span>}
                </span>
              </div>
              <div style={{ width: '20%', minWidth: 60, textAlign: 'right', fontSize: 11, color: 'var(--text-primary)' }}>
                {formatPrice(priceNum)}
              </div>
              <div style={{ width: '12%', minWidth: 48, textAlign: 'right', fontSize: 10, fontWeight: 600, color: isPositive ? 'var(--neon-green)' : 'var(--accent-red)' }}>
                {isPositive ? '+' : ''}{changeNum.toFixed(1)}%
              </div>
              <div style={{ width: '18%', minWidth: 70, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Sparkline 
                  data={coin.sparkline_in_7d?.price || coin.sparkline || null}
                  width={60}
                  height={24}
                  showPositive={true}
                />
              </div>
              <div style={{ width: '18%', minWidth: 55, textAlign: 'right', fontSize: 10, color: 'var(--text-secondary)' }}>
                {vol}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChartMetricsPanel({ coin, isMobile = false }) {
  if (!coin) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        color: 'var(--text-muted)',
        fontSize: 12,
      }}>
        Select a coin to view metrics
      </div>
    )
  }
  
  const change24h = coin.price_change_percentage_24h || 0
  const change7d = coin.price_change_percentage_7d_in_currency || 0
  const athChange = coin.ath_change_percentage || 0
  const isPositive24h = change24h >= 0
  const isPositive7d = change7d >= 0
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
        {coin.image && (
          <img src={coin.image} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
        )}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{coin.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{coin.symbol?.toUpperCase()}</div>
        </div>
      </div>
      
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
        {formatPrice(coin.current_price)}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>24h Change</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: isPositive24h ? 'var(--neon-green)' : 'var(--accent-red)' }}>
            {isPositive24h ? '+' : ''}{change24h.toFixed(2)}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>7d Change</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: isPositive7d ? 'var(--neon-green)' : 'var(--accent-red)' }}>
            {isPositive7d ? '+' : ''}{change7d.toFixed(2)}%
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Market Cap</span>
          <span style={{ fontSize: 10, color: 'var(--text-primary)', fontWeight: 600 }}>{formatMarketCap(coin.market_cap)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>24h Volume</span>
          <span style={{ fontSize: 10, color: 'var(--text-primary)', fontWeight: 600 }}>{formatMarketCap(coin.total_volume)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Circulating Supply</span>
          <span style={{ fontSize: 10, color: 'var(--text-primary)', fontWeight: 600 }}>{formatSupply(coin.circulating_supply)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>ATH</span>
          <span style={{ fontSize: 10, color: 'var(--text-primary)', fontWeight: 600 }}>{formatPrice(coin.ath)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>From ATH</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: athChange >= -10 ? 'var(--neon-green)' : athChange >= -50 ? 'var(--neon-blue)' : 'var(--accent-red)' }}>
            {athChange.toFixed(1)}%
          </span>
        </div>
      </div>
      
      {!isMobile && (
        <div style={{ 
          marginTop: 'auto',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(57, 255, 20, 0.08) 100%)',
          borderRadius: 12,
          border: '1px solid rgba(0, 212, 255, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ 
              width: 42, 
              height: 42, 
              background: 'linear-gradient(135deg, #00D4FF, #39FF14)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
            }}>
              🎯
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>StrikeAgent</div>
              <div style={{ fontSize: 11, color: '#00D4FF' }}>AI-Powered Trading Automation</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
            Automate your trades on any token with AI-driven entry/exit signals, real-time safety checks, and anti-MEV protection. Set limit orders, stop-losses, and let AI monitor markets 24/7.
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            marginBottom: 12,
            padding: '8px 10px',
            background: 'rgba(57, 255, 20, 0.1)',
            borderRadius: 6,
            border: '1px solid rgba(57, 255, 20, 0.2)',
          }}>
            <span style={{ fontSize: 10, color: 'var(--neon-green)', fontWeight: 600 }}>SAVE 60%+</span>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>vs SolSniper ($75/mo)</span>
          </div>
          <button style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: 12,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #00D4FF, #39FF14)',
            border: 'none',
            borderRadius: 8,
            color: '#000',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)',
          }}
          onMouseEnter={(e) => { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = '0 0 25px rgba(0, 212, 255, 0.5)' }}
          onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.3)' }}
          >
            Start Trading Smarter
          </button>
        </div>
      )}
    </div>
  )
}

function TrendingModal({ coins, onClose, onSelectCoin, favorites }) {
  const isFavorite = (symbol) => favorites?.some(f => f.symbol?.toUpperCase() === symbol?.toUpperCase())
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 16,
          border: '1px solid var(--border-color)',
          maxWidth: 'min(500px, 90vw)',
          width: '100%',
          maxHeight: '85vh',
          overflow: 'hidden',
          boxShadow: '0 0 40px rgba(0, 212, 255, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Trending Coins</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Top 10 by market cap</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: 24,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ maxHeight: 'calc(80vh - 80px)', overflowY: 'auto', padding: '8px 0' }}>
          {coins.slice(0, 10).map((coin, idx) => {
            const change = coin.price_change_percentage_24h || 0
            const isPositive = change >= 0
            return (
              <div
                key={coin.id || idx}
                onClick={() => onSelectCoin(coin)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  borderBottom: '1px solid var(--bg-surface-2)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 28, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {idx + 1}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  {coin.image && (
                    <img src={coin.image} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  )}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {coin.symbol?.toUpperCase()}
                      {isFavorite(coin.symbol) && <span style={{ color: 'var(--neon-blue)' }}>★</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{coin.name}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: isPositive ? 'var(--neon-green)' : 'var(--accent-red)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 3,
                  }}>
                    <span>{isPositive ? '▲' : '▼'}</span>
                    <span>{Math.abs(change).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function DashboardTab({ userId, userConfig, onNavigate, onAnalyzeCoin }) {
  const { favorites } = useFavorites()
  const isMobile = useIsMobile()
  const isMobileLayout = useMobileLayout()
  const [coins, setCoins] = useState([])
  const [coinsLoading, setCoinsLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [showTrendingModal, setShowTrendingModal] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState(null)
  const [marketData, setMarketData] = useState({
    fearGreed: null,
    altcoinSeason: null,
    totalMarketCap: null,
    totalMarketCapChange: null,
    totalVolume: null,
    totalVolumeChange: null,
    btcDominance: null,
  })
  const [news, setNews] = useState([
    { source: 'CoinDesk', title: 'Market Analysis: Key Levels to Watch This Week', time: 'Today', url: 'https://coindesk.com' },
    { source: 'CoinTelegraph', title: 'Institutional Adoption Continues to Drive Crypto Growth', time: 'Today', url: 'https://cointelegraph.com' },
    { source: 'The Block', title: 'DeFi Protocol Activity Reaches New Highs', time: 'Today', url: 'https://theblock.co' },
    { source: 'Decrypt', title: 'AI and Blockchain Integration Trends for 2025', time: 'Today', url: 'https://decrypt.co' },
  ])

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/crypto/market-overview')
        if (response.ok) {
          const data = await response.json()
          setMarketData(data)
        } else {
          setMarketData({
            fearGreed: 50,
            altcoinSeason: 50,
            totalMarketCap: 3.2e12,
            totalMarketCapChange: 0,
            totalVolume: 98e9,
            totalVolumeChange: 0,
            btcDominance: 54.5,
          })
        }
      } catch (err) {
        console.log('Using default market data')
        setMarketData({
          fearGreed: 50,
          altcoinSeason: 50,
          totalMarketCap: 3.2e12,
          totalMarketCapChange: 0,
          totalVolume: 98e9,
          totalVolumeChange: 0,
          btcDominance: 54.5,
        })
      }
    }
    fetchMarketData()
  }, [])

  useEffect(() => {
    let retryCount = 0
    const maxRetries = 5
    const fetchCoins = async (isRetry = false) => {
      if (!isRetry) setCoinsLoading(true)
      try {
        const response = await fetch('/api/market-overview?category=top')
        if (response.ok) {
          const data = await response.json()
          const coinList = Array.isArray(data) ? data : (data.coins || [])
          setCoins(coinList)
          if (!selectedCoin && coinList.length > 0) {
            setSelectedCoin(coinList[0])
          }
          retryCount = 0
        } else if (retryCount < maxRetries) {
          retryCount++
          setTimeout(() => fetchCoins(true), 3000)
        }
      } catch (err) {
        console.log('Failed to fetch coins, retrying...')
        if (retryCount < maxRetries) {
          retryCount++
          setTimeout(() => fetchCoins(true), 3000)
        }
      } finally {
        if (!retryCount) setCoinsLoading(false)
      }
    }
    fetchCoins()
    const interval = setInterval(() => fetchCoins(), 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const defaultNews = [
      { source: 'CoinDesk', title: 'Market Analysis: Key Levels to Watch This Week', time: 'Today', url: 'https://coindesk.com' },
      { source: 'CoinTelegraph', title: 'Institutional Adoption Continues to Drive Crypto Growth', time: 'Today', url: 'https://cointelegraph.com' },
      { source: 'The Block', title: 'DeFi Protocol Activity Reaches New Highs', time: 'Today', url: 'https://theblock.co' },
      { source: 'Decrypt', title: 'AI and Blockchain Integration Trends for 2025', time: 'Today', url: 'https://decrypt.co' },
    ]
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news')
        if (response.ok) {
          const data = await response.json()
          const articles = data.articles || data.news || data || []
          const formattedNews = articles.map(article => ({
            source: article.source || 'Unknown',
            title: article.title || 'No title',
            time: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Today',
            url: article.url || '#'
          }))
          setNews(formattedNews.length > 0 ? formattedNews : defaultNews)
        } else {
          setNews(defaultNews)
        }
      } catch {
        setNews(defaultNews)
      }
    }
    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleCoinClick = (coin) => {
    setSelectedCoin(coin)
    if (onAnalyzeCoin) {
      onAnalyzeCoin({
        id: coin.id,
        symbol: coin.symbol?.toUpperCase(),
        name: coin.name,
        image: coin.image,
        price: `$${coin.current_price?.toLocaleString() || '0'}`,
        change: `${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h?.toFixed(2) || '0'}%`,
        marketCap: `$${(coin.market_cap / 1e9)?.toFixed(2) || '0'}B`,
        volume: `$${(coin.total_volume / 1e9)?.toFixed(2) || '0'}B`,
      })
    }
  }

  const isFavorite = (symbol) => favorites?.some(f => f.symbol?.toUpperCase() === symbol?.toUpperCase())

  const quickActions = [
    { image: '/assets/generated_images/ai_trading_terminal.png', title: 'StrikeAgent', subtitle: 'AI Predictive Trading', color: '#00D4FF', tab: 'sniper' },
    { image: '/assets/generated_images/multi-chain_crypto_wallet.png', title: 'Wallet', subtitle: 'Multi-chain', color: '#9D4EDD', tab: 'wallet' },
    { image: '/assets/generated_images/crypto_dust_cleaning.png', title: 'Dust Buster', subtitle: '12.5% Fee', color: '#39FF14', tab: 'dust-buster' },
    { image: '/assets/generated_images/crypto_watchlist_display.png', title: 'Watchlist', subtitle: 'Limit orders', color: 'var(--neon-green)', tab: 'watchlist' },
    { image: '/assets/generated_images/ai_prediction_signals.png', title: 'AI Signals', subtitle: '71.5% Accuracy', color: '#FF006E', tab: 'predictions' },
  ]

  const marketOverviewItems = [
    { type: 'gauge', title: 'Fear & Greed', value: marketData.fearGreed, gaugeType: 'fearGreed', color: '#FF006E' },
    { type: 'gauge', title: 'Altcoin Season', value: marketData.altcoinSeason, gaugeType: 'altcoinSeason', color: '#00D4FF' },
    { type: 'metric', title: 'Market Cap', value: formatMarketCap(marketData.totalMarketCap), change: marketData.totalMarketCapChange },
    { type: 'metric', title: '24h Volume', value: formatMarketCap(marketData.totalVolume), change: marketData.totalVolumeChange },
    { type: 'metric', title: 'BTC Dominance', value: `${marketData.btcDominance?.toFixed(1) || '54.5'}%`, change: null },
  ]

  return (
    <>
      {/* Three-Column Top Section with Self-Contained Carousels */}
      <div className="top-carousels-container">
        {/* Metrics Carousel - 1/3 width on desktop, 1/2 on mobile */}
        <div className="carousel-section metrics-carousel-section">
          <div className="carousel-label">Market Metrics</div>
          <div style={{ height: isMobileLayout ? 160 : 280, width: '100%', flex: 1 }}>
            {isMobileLayout ? (
              <MobileCardCarousel
                items={marketOverviewItems}
                renderItem={(item) => (
                  <div 
                    className="market-overview-card"
                    onClick={() => setSelectedMetric(item.title)}
                    style={{ height: '100%', cursor: 'pointer' }}
                  >
                    {item.type === 'metric' ? (
                      <MetricContent title={item.title} value={item.value} change={item.change} isMobile={true} />
                    ) : (
                      <GaugeContent title={item.title} value={item.value} type={item.gaugeType} accentColor={item.color} isMobile={true} />
                    )}
                  </div>
                )}
              />
            ) : (
              <FlipCarousel
                items={marketOverviewItems}
                renderItem={(item) => (
                  <div 
                    className="market-overview-card market-overview-card--clickable"
                    onClick={() => setSelectedMetric(item.title)}
                    title={`Click for info about ${item.title}`}
                    style={{ height: '100%', cursor: 'pointer' }}
                  >
                    {item.type === 'metric' ? (
                      <MetricContent title={item.title} value={item.value} change={item.change} />
                    ) : (
                      <GaugeContent title={item.title} value={item.value} type={item.gaugeType} accentColor={item.color} isMobile={false} />
                    )}
                    <div className="metric-info-hint">
                      <span>ℹ️</span>
                    </div>
                  </div>
                )}
                showDots={true}
                showArrows={true}
                autoPlay={false}
              />
            )}
          </div>
        </div>

        {/* Quick Actions Carousel - 1/3 width on desktop, 1/2 on mobile */}
        <div className="carousel-section quick-actions-carousel-section">
          <div className="carousel-label">Quick Actions</div>
          <div style={{ height: isMobileLayout ? 160 : 280, width: '100%', flex: 1 }}>
            {isMobileLayout ? (
              <MobileCardCarousel
                items={quickActions}
                renderItem={(action) => (
                  <div 
                    className="market-overview-card"
                    onClick={() => onNavigate && onNavigate(action.tab)}
                    style={{ height: '100%', cursor: 'pointer', overflow: 'hidden', borderRadius: 12 }}
                  >
                    <QuickActionContent action={action} isMobile={true} />
                  </div>
                )}
              />
            ) : (
              <FlipCarousel
                items={quickActions}
                renderItem={(action) => (
                  <div 
                    className="market-overview-card market-overview-card--clickable"
                    onClick={() => onNavigate && onNavigate(action.tab)}
                    style={{ height: '100%', cursor: 'pointer', overflow: 'hidden', borderRadius: 12 }}
                  >
                    <QuickActionContent action={action} isMobile={false} />
                  </div>
                )}
                showDots={true}
                showArrows={true}
                autoPlay={false}
              />
            )}
          </div>
        </div>

        {/* News Carousel - 1/3 width (hidden on mobile via CSS) */}
        <div className="carousel-section news-carousel-section">
          <div className="carousel-label">Latest News</div>
          <div style={{ height: 260, width: '100%', flex: 1 }}>
            <FlipCarousel
              items={news.length > 0 ? news : [{ title: 'No news available', source: 'System', time: 'Now', url: '#' }]}
              renderItem={(item) => (
                <div 
                  onClick={() => item.url && item.url !== '#' && window.open(item.url, '_blank')}
                  style={{ height: '100%', cursor: item.url && item.url !== '#' ? 'pointer' : 'default' }}
                >
                  <MobileNewsCard news={item} />
                </div>
              )}
              showDots={true}
              showArrows={true}
              autoPlay={false}
            />
          </div>
        </div>
      </div>
      
      <div className="bento-dashboard">
      
      <div className="bento-ai-status" style={{ display: 'flex', height: '100%' }}>
        <AIStatusWidget />
      </div>

      <BentoTile className="bento-predict" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            background: 'linear-gradient(135deg, #9D4EDD 0%, #00D4FF 100%)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
            boxShadow: '0 0 20px rgba(157, 78, 221, 0.4)',
          }}>
            🧠
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Predictive AI System
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Our AI learns from every analysis, tracking predictions at multiple intervals. As accuracy improves beyond 55%, it powers autonomous trading.
            </div>
          </div>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: 8, 
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid #222',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--neon-blue)' }}>1H</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Short</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--neon-green)' }}>4H</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Swing</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--neon-purple)' }}>24H</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Daily</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--neon-purple)' }}>7D</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Weekly</div>
          </div>
        </div>
        
        <div style={{
          marginTop: 10,
          padding: '8px 10px',
          background: 'rgba(0, 212, 255, 0.08)',
          borderRadius: 8,
          border: '1px solid rgba(0, 212, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 12 }}>🔗</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: '#00D4FF', fontWeight: 600 }}>Blockchain Verified</div>
            <div style={{ fontSize: 9, color: '#666' }}>Predictions hashed on Solana</div>
          </div>
        </div>
      </BentoTile>

      <div className="strikeagent-widget-container" style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, minHeight: 300 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <StrikeAgentLiveWidget isLocked={true} onUnlock={() => onNavigate?.('pricing')} />
        </div>
      </div>

      <BentoTile className="bento-table">
        <MiniCoinTable 
          coins={coins} 
          onCoinClick={handleCoinClick} 
          favorites={favorites} 
          selectedCoinId={selectedCoin?.id}
        />
      </BentoTile>

      <div className="bento-chart-section">
        <div className="chart-metrics">
          <ChartMetricsPanel coin={selectedCoin} isMobile={isMobile} />
        </div>
        <div className="chart-container">
          <BitcoinChart compact={false} coinId={selectedCoin?.id} />
        </div>
      </div>


      {isMobile && news.length > 0 && (
        <div className="mobile-news-section">
          <div style={{ marginBottom: 12, paddingLeft: 4 }}>
            <TileLabel color="#00D4FF">Latest News</TileLabel>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <FlipCarousel
              items={news}
              renderItem={(item) => <MobileNewsCard news={item} />}
              showDots={true}
              autoPlay={true}
              interval={8000}
            />
          </div>
        </div>
      )}

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        padding: '8px 16px',
        background: '#0a0a0a',
        borderTop: '1px solid #1a1a1a',
        maxHeight: '50px',
        boxSizing: 'border-box',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a 
            href="https://x.com/DarkWaveStudios" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ opacity: 0.5, transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a 
            href="https://t.me/DarkWavePulse_bot" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ opacity: 0.5, transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </a>
          <a 
            href="https://facebook.com/DarkWaveStudios" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ opacity: 0.5, transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
        </div>
        <span style={{ color: '#333' }}>|</span>
        <span style={{ color: '#444', fontSize: 10 }}>
          Powered by DarkWave Studios, LLC © 2025 | v{versionData.version}
        </span>
        {(userConfig?.accessLevel === 'admin' || userConfig?.accessLevel === 'owner') && (
          <button
            onClick={() => onNavigate('dev-portal')}
            style={{
              background: 'transparent',
              border: '1px solid #2a2a2a',
              borderRadius: '4px',
              padding: '4px 10px',
              color: '#00D4FF',
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#1a1a1a';
              e.target.style.borderColor = '#00D4FF40';
              e.target.style.boxShadow = '0 0 8px #00D4FF20';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = '#2a2a2a';
              e.target.style.boxShadow = 'none';
            }}
          >
            🛠️ Dev Portal
          </button>
        )}
      </div>

      {showTrendingModal && (
        <TrendingModal 
          coins={coins}
          favorites={favorites}
          onClose={() => setShowTrendingModal(false)}
          onSelectCoin={(coin) => {
            setShowTrendingModal(false)
            handleCoinClick(coin)
          }}
        />
      )}

      <MetricInfoModal
        isOpen={!!selectedMetric}
        onClose={() => setSelectedMetric(null)}
        metric={selectedMetric}
      />
      
          </div>
    </>
  )
}
