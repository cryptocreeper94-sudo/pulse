import { useState, useEffect } from 'react'
import { useFavorites } from '../../context/FavoritesContext'
import { useAvatar } from '../../context/AvatarContext'
import BitcoinChart from '../charts/BitcoinChart'
import Gauge from '../ui/Gauge'
import FlipCarousel from '../ui/FlipCarousel'
import MobileCardCarousel from '../ui/MobileCardCarousel'
import AIStatusWidget from '../ui/AIStatusWidget'
import versionData from '../../data/version.json'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  
  return isMobile
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
        background: '#0f0f0f',
        border: '1px solid #222',
        borderRadius: 12,
        padding: 10,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
        overflow: isTable ? 'visible' : undefined,
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#333'
        e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#222'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </div>
  )
}

function TileLabel({ children, color = '#555' }) {
  return (
    <div style={{
      fontSize: 9,
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

function QuickActionContent({ action, fullCard = false }) {
  if (fullCard) {
    return (
      <div style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
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
          padding: '40px 16px 16px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{action.title}</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>{action.subtitle}</div>
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100%',
      gap: 8,
      padding: 12,
    }}>
      <div style={{ 
        width: 64,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <img 
          src={action.image} 
          alt={action.title}
          style={{ 
            width: 56, 
            height: 56, 
            objectFit: 'cover',
            borderRadius: 12,
          }}
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.parentElement.innerHTML = '<span style="font-size: 28px">📊</span>'
          }}
        />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{action.title}</div>
      <div style={{ fontSize: 11, color: '#888' }}>{action.subtitle}</div>
    </div>
  )
}

function MetricContent({ title, value, change }) {
  const isPositive = change >= 0
  const hasChange = change !== null && change !== undefined
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 110,
      padding: 12,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 }}>
        {title}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: hasChange ? 6 : 0 }}>
        {value}
      </div>
      {hasChange && (
        <div style={{ 
          fontSize: 13, 
          fontWeight: 600, 
          color: isPositive ? '#39FF14' : '#ff4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}>
          <span>{isPositive ? '▲' : '▼'}</span>
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      )}
    </div>
  )
}

function GaugeContent({ title, value, type, accentColor, isMobile = false }) {
  const gaugeSize = isMobile ? 80 : 120
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: isMobile ? 110 : 140,
      padding: 12,
    }}>
      <div style={{ 
        color: accentColor, 
        fontSize: isMobile ? 10 : 12, 
        fontWeight: 700, 
        textTransform: 'uppercase', 
        letterSpacing: 1,
        marginBottom: isMobile ? 6 : 10,
      }}>
        {title}
      </div>
      <div style={{ width: '100%', maxWidth: gaugeSize, display: 'flex', justifyContent: 'center' }}>
        <Gauge value={value} type={type} size={gaugeSize} showLabels={false} />
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
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
        borderRadius: 12,
        color: '#666',
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
      background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
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
            background: '#333',
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
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
            {coin.symbol?.toUpperCase() || 'UNKNOWN'}
            {isFavorite && <span style={{ color: '#FFD700', marginLeft: 6 }}>★</span>}
          </div>
          <div style={{ fontSize: 11, color: '#666' }}>{coin.name || 'Unknown'}</div>
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
        {formatPrice(coin.current_price || coin.price)}
      </div>
      <div style={{ 
        fontSize: 13, 
        fontWeight: 600, 
        color: isPositive ? '#39FF14' : '#ff4444',
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
        color: '#fff', 
        lineHeight: 1.4,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        marginBottom: 8,
      }}>
        {news.title}
      </div>
      <div style={{ fontSize: 10, color: '#555' }}>{news.time}</div>
    </div>
  )
}

function MobileNewsCard({ news }) {
  return (
    <div 
      className="mobile-news-card"
      onClick={() => news.url && window.open(news.url, '_blank')}
    >
      <div className="news-card-bg">
        <div className="news-card-overlay"></div>
        <div className="news-card-content">
          <div className="news-source">{news.source}</div>
          <div className="news-title">{news.title}</div>
          <div className="news-time">{news.time}</div>
        </div>
      </div>
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

function MiniCoinTable({ coins, onCoinClick, favorites, selectedCoinId }) {
  const [category, setCategory] = useState('top')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const isFavorite = (symbol) => favorites?.some(f => f.symbol?.toUpperCase() === symbol?.toUpperCase())
  
  const getFilteredCoins = () => {
    let filtered = coins
    switch(category) {
      case 'gainers':
        filtered = [...coins].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 10)
        break
      case 'losers':
        filtered = [...coins].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)).slice(0, 10)
        break
      case 'meme':
        filtered = coins.filter(c => memeCoins.includes(c.symbol?.toLowerCase())).slice(0, 10)
        break
      case 'defi':
        filtered = coins.filter(c => defiCoins.includes(c.symbol?.toLowerCase())).slice(0, 10)
        break
      case 'dex':
        filtered = coins.filter(c => dexCoins.includes(c.symbol?.toLowerCase())).slice(0, 10)
        break
      default:
        filtered = coins.slice(0, 10)
    }
    
    if (searchQuery && !searchResults) {
      const query = searchQuery.toLowerCase()
      filtered = coins.filter(c => 
        c.name?.toLowerCase().includes(query) || 
        c.symbol?.toLowerCase().includes(query)
      ).slice(0, 10)
    }
    
    return searchResults ? [searchResults] : filtered
  }
  
  const handleSearchChange = async (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setSearchResults(null)
    
    const caType = isContractAddress(value)
    if (caType) {
      setIsSearching(true)
      try {
        const response = await fetch(`/api/crypto/token-lookup?address=${encodeURIComponent(value.trim())}`)
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
  
  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <TileLabel>{category === 'top' ? 'Top Coins' : category === 'gainers' ? 'Top Gainers' : category === 'losers' ? 'Top Losers' : category === 'meme' ? 'Meme Coins' : category === 'defi' ? 'DeFi' : 'DEX Tokens'}</TileLabel>
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
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 8,
              color: '#fff',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#00D4FF'}
            onBlur={(e) => e.target.style.borderColor = '#333'}
          />
          {isSearching && (
            <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#00D4FF', fontSize: 10 }}>
              ...
            </div>
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
        <div style={{ fontSize: 11, color: '#444', display: 'flex', padding: '8px 4px', borderBottom: '1px solid #222', position: 'sticky', top: 0, background: '#0f0f0f', zIndex: 1, minWidth: 580, letterSpacing: '0.04em' }}>
          <span style={{ width: '3%', minWidth: 28, textAlign: 'center' }}>#</span>
          <span style={{ width: '12%', minWidth: 75 }}>Coin</span>
          <span style={{ width: '12%', minWidth: 75, textAlign: 'right' }}>Price</span>
          <span style={{ width: '8%', minWidth: 50, textAlign: 'right' }}>24h</span>
          <span style={{ width: '8%', minWidth: 50, textAlign: 'right' }}>7d</span>
          <span style={{ width: '10%', minWidth: 60, textAlign: 'right' }}>MC</span>
          <span style={{ width: '10%', minWidth: 60, textAlign: 'right' }}>Vol</span>
          <span style={{ width: '12%', minWidth: 65, textAlign: 'right' }}>Circ</span>
          <span style={{ width: '15%', minWidth: 55, textAlign: 'center' }}>7d Chart</span>
          <span style={{ width: '10%', minWidth: 55, textAlign: 'right' }}>ATH</span>
        </div>
        {displayCoins.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: '#666', fontSize: 11 }}>
            {coins.length === 0 ? 'Loading coins...' : 'No coins found for this category'}
          </div>
        )}
        {displayCoins.map((coin, i) => {
          const change24h = coin.price_change_percentage_24h || 0
          const change7d = coin.price_change_percentage_7d_in_currency || 0
          const isPositive24h = change24h >= 0
          const isPositive7d = change7d >= 0
          const mc = coin.market_cap ? (coin.market_cap >= 1e12 ? `${(coin.market_cap / 1e12).toFixed(1)}T` : coin.market_cap >= 1e9 ? `${(coin.market_cap / 1e9).toFixed(1)}B` : `${(coin.market_cap / 1e6).toFixed(0)}M`) : '-'
          const vol = coin.total_volume ? (coin.total_volume >= 1e9 ? `${(coin.total_volume / 1e9).toFixed(1)}B` : `${(coin.total_volume / 1e6).toFixed(0)}M`) : '-'
          const supply = coin.circulating_supply ? (coin.circulating_supply >= 1e9 ? `${(coin.circulating_supply / 1e9).toFixed(1)}B` : coin.circulating_supply >= 1e6 ? `${(coin.circulating_supply / 1e6).toFixed(0)}M` : `${(coin.circulating_supply / 1e3).toFixed(0)}K`) : '-'
          const athChange = coin.ath_change_percentage || 0
          const sparkline = coin.sparkline_in_7d?.price || []
          const isSelected = coin.id === selectedCoinId
          return (
            <div 
              key={coin.id || i}
              onClick={() => onCoinClick(coin)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '10px 4px',
                borderBottom: '1px solid #1a1a1a',
                cursor: 'pointer',
                transition: 'background 0.2s',
                background: isSelected ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                borderLeft: isSelected ? '2px solid #00D4FF' : '2px solid transparent',
                minWidth: 580,
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#1a1a1a' }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ width: '3%', minWidth: 28, textAlign: 'center', fontSize: 11, color: '#666' }}>
                {coin.market_cap_rank || i + 1}
              </div>
              <div style={{ width: '12%', minWidth: 75, display: 'flex', alignItems: 'center', gap: 4 }}>
                {coin.image && (
                  <img src={coin.image} alt="" style={{ width: 18, height: 18, borderRadius: '50%' }} />
                )}
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                  {coin.symbol?.toUpperCase()}
                  {isFavorite(coin.symbol) && <span style={{ color: '#FFD700', marginLeft: 3 }}>★</span>}
                </span>
              </div>
              <div style={{ width: '12%', minWidth: 75, textAlign: 'right', fontSize: 12, color: '#fff' }}>
                {formatPrice(coin.current_price)}
              </div>
              <div style={{ width: '8%', minWidth: 50, textAlign: 'right', fontSize: 11, fontWeight: 600, color: isPositive24h ? '#39FF14' : '#ff4444' }}>
                {change24h.toFixed(1)}%
              </div>
              <div style={{ width: '8%', minWidth: 50, textAlign: 'right', fontSize: 11, fontWeight: 600, color: isPositive7d ? '#39FF14' : '#ff4444' }}>
                {change7d.toFixed(1)}%
              </div>
              <div style={{ width: '10%', minWidth: 60, textAlign: 'right', fontSize: 11, color: '#888' }}>
                {mc}
              </div>
              <div style={{ width: '10%', minWidth: 60, textAlign: 'right', fontSize: 11, color: '#888' }}>
                {vol}
              </div>
              <div style={{ width: '12%', minWidth: 65, textAlign: 'right', fontSize: 11, color: '#888' }}>
                {supply}
              </div>
              <div style={{ width: '15%', minWidth: 55, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {sparkline.length > 0 ? (
                  <svg width="36" height="16" viewBox="0 0 36 16">
                    <polyline
                      fill="none"
                      stroke={sparkline[sparkline.length - 1] >= sparkline[0] ? '#39FF14' : '#ff4444'}
                      strokeWidth="1.4"
                      points={sparkline.filter((_, idx) => idx % Math.ceil(sparkline.length / 16) === 0).map((price, idx, arr) => {
                        const min = Math.min(...arr)
                        const max = Math.max(...arr)
                        const range = max - min || 1
                        const x = (idx / (arr.length - 1)) * 36
                        const y = 14 - ((price - min) / range) * 12
                        return `${x},${y}`
                      }).join(' ')}
                    />
                  </svg>
                ) : <span style={{ fontSize: 10, color: '#444' }}>-</span>}
              </div>
              <div style={{ width: '10%', minWidth: 55, textAlign: 'right', fontSize: 11, color: athChange >= -10 ? '#39FF14' : athChange >= -50 ? '#FFD700' : '#ff4444' }}>
                {athChange.toFixed(0)}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChartMetricsPanel({ coin }) {
  if (!coin) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        color: '#666',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid #222' }}>
        {coin.image && (
          <img src={coin.image} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
        )}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{coin.name}</div>
          <div style={{ fontSize: 11, color: '#666' }}>{coin.symbol?.toUpperCase()}</div>
        </div>
      </div>
      
      <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
        {formatPrice(coin.current_price)}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', marginBottom: 2 }}>24h Change</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: isPositive24h ? '#39FF14' : '#ff4444' }}>
            {isPositive24h ? '+' : ''}{change24h.toFixed(2)}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', marginBottom: 2 }}>7d Change</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: isPositive7d ? '#39FF14' : '#ff4444' }}>
            {isPositive7d ? '+' : ''}{change7d.toFixed(2)}%
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#666' }}>Market Cap</span>
          <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{formatMarketCap(coin.market_cap)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#666' }}>24h Volume</span>
          <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{formatMarketCap(coin.total_volume)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#666' }}>Circulating Supply</span>
          <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{formatSupply(coin.circulating_supply)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#666' }}>ATH</span>
          <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{formatPrice(coin.ath)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#666' }}>From ATH</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: athChange >= -10 ? '#39FF14' : athChange >= -50 ? '#FFD700' : '#ff4444' }}>
            {athChange.toFixed(1)}%
          </span>
        </div>
      </div>
      
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
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>StrikeAgent</div>
            <div style={{ fontSize: 11, color: '#00D4FF' }}>AI-Powered Trading Automation</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#ccc', lineHeight: 1.6, marginBottom: 10 }}>
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
          <span style={{ fontSize: 10, color: '#39FF14', fontWeight: 600 }}>SAVE 60%+</span>
          <span style={{ fontSize: 10, color: '#888' }}>vs SolSniper ($75/mo)</span>
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
          background: '#141414',
          borderRadius: 16,
          border: '1px solid #333',
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
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Trending Coins</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Top 10 by market cap</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
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
                  borderBottom: '1px solid #1a1a1a',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 28, fontSize: 12, color: '#666', fontWeight: 600 }}>
                  {idx + 1}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  {coin.image && (
                    <img src={coin.image} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  )}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {coin.symbol?.toUpperCase()}
                      {isFavorite(coin.symbol) && <span style={{ color: '#FFD700' }}>★</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#888' }}>{coin.name}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                    ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: isPositive ? '#39FF14' : '#ff4444',
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
  const [coins, setCoins] = useState([])
  const [coinsLoading, setCoinsLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [showTrendingModal, setShowTrendingModal] = useState(false)
  const [marketData, setMarketData] = useState({
    fearGreed: 65,
    altcoinSeason: 75,
    totalMarketCap: 3.2e12,
    totalMarketCapChange: 2.1,
    totalVolume: 98e9,
    totalVolumeChange: -1.8,
    btcDominance: 54.5,
  })
  const [news, setNews] = useState([])

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/crypto/market-overview')
        if (response.ok) {
          const data = await response.json()
          setMarketData(prev => ({ ...prev, ...data }))
        }
      } catch (err) {
        console.log('Using default market data')
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
      { source: 'CoinDesk', title: 'Bitcoin Holds Above $90K as Market Awaits Fed Decision', time: '2h ago', url: 'https://coindesk.com' },
      { source: 'CoinTelegraph', title: 'Ethereum Layer-2 Solutions See Record Growth in Q4', time: '4h ago', url: 'https://cointelegraph.com' },
      { source: 'The Block', title: 'Solana DeFi TVL Surges Past $5 Billion Milestone', time: '6h ago', url: 'https://theblock.co' },
      { source: 'Decrypt', title: 'AI Tokens Lead Altcoin Rally as Sector Gains Momentum', time: '8h ago', url: 'https://decrypt.co' },
    ]
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/crypto/news')
        if (response.ok) {
          const data = await response.json()
          setNews(data.news || data || defaultNews)
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
    { image: '/assets/generated_images/ai_trading_strikeagent_icon.png', title: 'StrikeAgent', subtitle: 'AI Predictive Trading', color: '#00D4FF', tab: 'sniper' },
    { image: '/assets/generated_images/multi-chain_wallet_icon.png', title: 'Wallet', subtitle: 'Multi-chain', color: '#9D4EDD', tab: 'wallet' },
    { image: '/assets/generated_images/watchlist_limit_orders_icon.png', title: 'Watchlist', subtitle: 'Limit orders', color: '#39FF14', tab: 'watchlist' },
    { image: '/assets/generated_images/markets_live_prices_icon.png', title: 'Markets', subtitle: 'Live prices', color: '#FF006E', tab: 'markets' },
  ]

  const marketOverviewItems = [
    { type: 'metric', title: 'Market Cap', value: formatMarketCap(marketData.totalMarketCap), change: marketData.totalMarketCapChange },
    { type: 'metric', title: '24h Volume', value: formatMarketCap(marketData.totalVolume), change: marketData.totalVolumeChange },
    { type: 'metric', title: 'BTC Dominance', value: `${marketData.btcDominance?.toFixed(1) || '54.5'}%`, change: null },
    { type: 'gauge', title: 'Fear & Greed', value: marketData.fearGreed, gaugeType: 'fearGreed', color: '#FF006E' },
    { type: 'gauge', title: 'Altcoin Season', value: marketData.altcoinSeason, gaugeType: 'altcoinSeason', color: '#00D4FF' },
  ]

  return (
    <>
      <style>{`
        .bento-dashboard {
          padding: 12px;
          padding-top: 60px;
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-template-rows: minmax(180px, auto) minmax(380px, auto) minmax(400px, auto);
          gap: 12px;
          max-width: 1200px;
          margin: 0 auto;
        }
        /* Row 1: AI Status + Predictive side by side */
        .bento-ai-status { grid-area: 1 / 1 / 2 / 5; min-height: 180px; }
        .bento-predict { grid-area: 1 / 5 / 2 / 9; min-height: 180px; }
        .bento-quick { grid-area: 1 / 9 / 2 / 13; min-height: 180px; }
        .bento-market { display: none; }
        .bento-trending { display: none; }
        .bento-news { display: none; }
        /* Row 2: Table left, News right */
        .bento-table { grid-area: 2 / 1 / 3 / 7; }
        .desktop-news-grid { 
          grid-area: 2 / 7 / 3 / 13;
          background: #0f0f0f;
          border: 1px solid #222;
          border-radius: 12px;
          padding: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        /* Row 3: Chart full width */
        .bento-chart-section { 
          grid-area: 3 / 1 / 4 / 13;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 12px;
        }
        .chart-metrics {
          background: #0f0f0f;
          border: 1px solid #222;
          border-radius: 12px;
          padding: 16px;
        }
        .chart-container {
          background: #0f0f0f;
          border: 1px solid #222;
          border-radius: 12px;
          padding: 8px;
          min-height: 300px;
        }
        
        @media (max-width: 1200px) {
          .bento-dashboard {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: auto auto auto auto auto;
            gap: 10px;
            padding: 10px;
            padding-top: 60px;
          }
          .bento-ai-status, .bento-quick, .bento-predict, .bento-market, .bento-trending, .bento-news {
            grid-area: auto;
            min-height: 140px;
          }
          .bento-table { grid-column: 1 / -1; min-height: 350px; }
          .desktop-news-grid { display: none; }
          .bento-chart-section { 
            grid-column: 1 / -1;
            min-height: 400px;
            grid-template-columns: 1fr 2fr;
          }
        }
        
        @media (max-width: 1024px) {
          .bento-dashboard {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: auto;
            gap: 8px;
            padding: 10px;
            padding-top: 60px;
          }
          .bento-ai-status, .bento-quick, .bento-predict, .bento-market, .bento-trending, .bento-news {
            grid-area: auto;
          }
          .bento-ai-status { min-height: 100px; }
          .bento-predict { min-height: 140px; }
          .bento-quick { min-height: 160px; }
          .bento-market { min-height: 160px; }
          .bento-trending { min-height: 160px; }
          .bento-news { min-height: 160px; display: flex; }
          .bento-table { min-height: 350px; grid-column: 1 / -1; }
          .desktop-news-grid { display: none; }
          .bento-chart-section { 
            min-height: 400px; 
            grid-column: 1 / -1;
            grid-template-columns: 1fr 2fr;
          }
        }
        
        @media (max-width: 640px) {
          .bento-dashboard {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 10px;
            padding-top: 60px;
          }
          .bento-ai-status, .bento-predict, .bento-quick, .bento-market, .bento-trending, .bento-news { 
            display: none !important;
          }
          .bento-table { 
            min-height: 300px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .bento-chart-section { 
            min-height: 500px;
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
          }
          .chart-metrics {
            padding: 12px;
          }
          .chart-container {
            min-height: 280px;
          }
          .mobile-categories-wrapper {
            display: block !important;
          }
        }
        
        /* Default - hide mobile wrapper */
        .mobile-categories-wrapper {
          display: none;
        }
        
        .mobile-category-card {
          background: rgba(20, 20, 20, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 16px;
          min-height: 220px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.15);
          overflow: hidden;
        }
        .mobile-category-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent);
        }
        
        /* Landscape mode on mobile - show full table layout */
        @media (max-height: 500px) and (orientation: landscape) {
          .bento-dashboard {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: auto;
            gap: 8px;
            padding: 8px;
          }
          .bento-quick, .bento-market, .bento-trending, .bento-news { 
            display: none !important;
          }
          .bento-table { 
            grid-column: 1 / -1;
            min-height: 200px;
            max-height: 45vh;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
          }
          .bento-chart-section { 
            grid-column: 1 / -1;
            min-height: 300px;
            grid-template-columns: 1fr 2fr;
          }
          .chart-metrics {
            padding: 8px;
          }
          .chart-container {
            min-height: 200px;
          }
          .mobile-categories-wrapper {
            display: none !important;
          }
          .mobile-news-section {
            display: none !important;
          }
        }
        .mobile-category-card .market-item-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .coin-filter-section {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
        }
        .coin-filter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .coin-filter-btn {
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid #333;
          border-radius: 20px;
          cursor: pointer;
          background: #1a1a1a;
          color: #888;
          transition: all 0.2s ease;
          min-width: 70px;
          text-align: center;
        }
        .coin-filter-btn:hover {
          border-color: rgba(0, 212, 255, 0.5);
          color: #fff;
        }
        .coin-filter-btn.active {
          background: linear-gradient(135deg, #00D4FF, #0099FF);
          border-color: transparent;
          color: #000;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
        }
        
        @media (max-width: 640px) {
          .coin-filter-buttons {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            width: 100%;
          }
          .coin-filter-btn {
            padding: 10px 8px;
            font-size: 12px;
            text-align: center;
            border-radius: 12px;
          }
          .coin-filter-section {
            flex-direction: column;
            gap: 12px;
          }
          .coin-filter-section > div:last-child {
            width: 100%;
          }
          .coin-filter-section input {
            width: 100% !important;
          }
          
          .mobile-news-section {
            margin-top: 20px;
            margin-bottom: 80px;
          }
        }
        
        .news-arrow-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #333;
          background: #1a1a1a;
          color: #fff;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .news-arrow-btn:hover {
          border-color: #00D4FF;
          background: rgba(0, 212, 255, 0.1);
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
        }
        .news-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .desktop-news-card:hover {
          border-color: #00D4FF !important;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
          transform: translateY(-2px);
        }
        .desktop-news-section {
          margin-bottom: 60px;
        }
        .mobile-news-card {
            cursor: pointer;
            border-radius: 16px;
            overflow: hidden;
            background: rgba(20, 20, 20, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: transform 0.2s ease;
          }
          .mobile-news-card:active {
            transform: scale(0.98);
          }
          .news-card-bg {
            position: relative;
            min-height: 180px;
            background: linear-gradient(135deg, #001a2c 0%, #003355 50%, #001a2c 100%);
            background-image: 
              radial-gradient(ellipse at 20% 50%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 50%, rgba(0, 153, 255, 0.1) 0%, transparent 50%),
              linear-gradient(135deg, #001a2c 0%, #003355 50%, #001a2c 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .news-card-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
          }
          .news-card-content {
            position: relative;
            z-index: 2;
            padding: 20px;
            text-align: center;
          }
          .news-source {
            font-size: 11px;
            font-weight: 700;
            color: #00D4FF;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          .news-title {
            font-size: 16px;
            font-weight: 600;
            color: #fff;
            line-height: 1.4;
            margin-bottom: 12px;
          }
          .news-time {
            font-size: 11px;
            color: #666;
          }
        }
      `}</style>
      <div className="bento-dashboard">
      
      <div className="bento-ai-status">
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
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              Predictive AI System
            </div>
            <div style={{ fontSize: 11, color: '#888', lineHeight: 1.5 }}>
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
            <div style={{ fontSize: 14, fontWeight: 700, color: '#00D4FF' }}>1H</div>
            <div style={{ fontSize: 9, color: '#666' }}>Short</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#39FF14' }}>4H</div>
            <div style={{ fontSize: 9, color: '#666' }}>Swing</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#FFD700' }}>24H</div>
            <div style={{ fontSize: 9, color: '#666' }}>Daily</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#9D4EDD' }}>7D</div>
            <div style={{ fontSize: 9, color: '#666' }}>Weekly</div>
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

      {isMobile && (
        <div className="mobile-categories-wrapper">
          <MobileCardCarousel>
            <div className="mobile-category-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 220 }}>
                <FlipCarousel
                  items={quickActions}
                  style={{ height: 220 }}
                  renderItem={(action) => (
                    <div 
                      onClick={() => onNavigate && onNavigate(action.tab)}
                      style={{ height: 220, cursor: 'pointer', background: '#0f0f0f', borderRadius: 12, overflow: 'hidden' }}
                    >
                      <QuickActionContent action={action} fullCard={true} />
                    </div>
                  )}
                  showDots={false}
                  showArrows={false}
                  showCounter={false}
                  autoPlay={false}
                  interval={6000}
                />
              </div>
            </div>
            
            <div className="mobile-category-card">
              <TileLabel color="#00D4FF">Market Overview</TileLabel>
              <div style={{ height: 180 }}>
                <FlipCarousel
                  items={marketOverviewItems}
                  style={{ height: 180 }}
                  renderItem={(item) => (
                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f', borderRadius: 12 }}>
                      {item.type === 'metric' 
                        ? <MetricContent title={item.title} value={item.value} change={item.change} />
                        : <GaugeContent title={item.title} value={item.value} type={item.gaugeType} accentColor={item.color} isMobile={true} />
                      }
                    </div>
                  )}
                  showDots={false}
                  showArrows={false}
                  showCounter={false}
                  autoPlay={false}
                  interval={5000}
                />
              </div>
            </div>
            
            <div className="mobile-category-card" onClick={() => setShowTrendingModal(true)} style={{ cursor: 'pointer' }}>
              <TileLabel color="#00D4FF">Trending</TileLabel>
              <div style={{ height: 180 }}>
                {coinsLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: '#666' }}>
                    Loading...
                  </div>
                ) : (
                  <FlipCarousel
                    items={coins.slice(0, 10)}
                    style={{ height: 180 }}
                    renderItem={(coin) => (
                      <div style={{ height: 180, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f', borderRadius: 12, position: 'relative' }}>
                        <CoinContent coin={coin} isFavorite={isFavorite(coin.symbol)} />
                        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#00D4FF' }}>
                          Tap to see all trending
                        </div>
                      </div>
                    )}
                    showDots={false}
                    showArrows={false}
                    showCounter={false}
                    autoPlay={false}
                    interval={4000}
                  />
                )}
              </div>
            </div>
          </MobileCardCarousel>
        </div>
      )}
      
      <BentoTile className="bento-quick" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 10, left: 12, zIndex: 10 }}>
          <TileLabel>Quick Actions</TileLabel>
        </div>
        <div style={{ flex: 1, height: '100%' }}>
          <FlipCarousel
            items={quickActions}
            renderItem={(action) => (
              <div 
                onClick={() => onNavigate && onNavigate(action.tab)}
                style={{ height: '100%', cursor: 'pointer' }}
              >
                <QuickActionContent action={action} fullCard={true} />
              </div>
            )}
            showDots={true}
            autoPlay={true}
            interval={6000}
          />
        </div>
      </BentoTile>

      <BentoTile className="bento-market">
        <TileLabel>Market Overview</TileLabel>
        <div style={{ flex: 1, minHeight: 160 }}>
          <FlipCarousel
            items={marketOverviewItems}
            renderItem={(item) => (
              item.type === 'metric' 
                ? <MetricContent title={item.title} value={item.value} change={item.change} />
                : <GaugeContent title={item.title} value={item.value} type={item.gaugeType} accentColor={item.color} isMobile={false} />
            )}
            showDots={true}
            autoPlay={true}
            interval={5000}
          />
        </div>
      </BentoTile>

      <BentoTile className="bento-trending" onClick={() => setShowTrendingModal(true)} style={{ cursor: 'pointer' }}>
        <TileLabel>Trending</TileLabel>
        <div style={{ flex: 1, minHeight: 160, position: 'relative' }}>
          {coinsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
              Loading...
            </div>
          ) : (
            <>
              <FlipCarousel
                items={coins.slice(0, 10)}
                renderItem={(coin) => (
                  <div style={{ height: '100%', cursor: 'pointer' }}>
                    <CoinContent coin={coin} isFavorite={isFavorite(coin.symbol)} />
                  </div>
                )}
                showDots={true}
                autoPlay={true}
                interval={4000}
              />
              <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#00D4FF', pointerEvents: 'none' }}>
                Click to see all trending
              </div>
            </>
          )}
        </div>
      </BentoTile>

      <BentoTile className="bento-news">
        <TileLabel>News</TileLabel>
        <div style={{ flex: 1, minHeight: 160 }}>
          <FlipCarousel
            items={news}
            renderItem={(item) => <NewsContent news={item} />}
            showDots={true}
            autoPlay={true}
            interval={7000}
          />
        </div>
      </BentoTile>

      <BentoTile className="bento-table">
        <MiniCoinTable 
          coins={coins} 
          onCoinClick={handleCoinClick} 
          favorites={favorites} 
          selectedCoinId={selectedCoin?.id}
        />
      </BentoTile>

      {!isMobile && news.length > 0 && (
        <div className="desktop-news-grid">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <TileLabel color="#00D4FF">Latest News</TileLabel>
          </div>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {news.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="desktop-news-card"
                style={{
                  background: '#141414',
                  border: '1px solid #222',
                  borderRadius: 10,
                  padding: 14,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: '#00D4FF', textTransform: 'uppercase', marginBottom: 6 }}>
                  {item.source}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 10, color: '#666' }}>
                  {item.time}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="bento-chart-section">
        <div className="chart-metrics">
          <ChartMetricsPanel coin={selectedCoin} />
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
          <FlipCarousel
            items={news}
            renderItem={(item) => <MobileNewsCard news={item} />}
            showDots={true}
            autoPlay={true}
            interval={8000}
          />
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
      }}>
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
      
          </div>
    </>
  )
}
