import { useState, useEffect } from 'react'
import { useFavorites } from '../../context/FavoritesContext'
import { useAvatar } from '../../context/AvatarContext'
import BitcoinChart from '../charts/BitcoinChart'
import Gauge from '../ui/Gauge'
import FlipCarousel from '../ui/FlipCarousel'
import MobileCardCarousel from '../ui/MobileCardCarousel'
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
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: '#0f0f0f',
        border: '1px solid #222',
        borderRadius: 12,
        padding: 12,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
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

function QuickActionContent({ action }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100%',
      gap: 8,
      padding: 16,
    }}>
      <div style={{ 
        fontSize: 32,
        width: 56,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${action.color}20`,
        borderRadius: 12,
        boxShadow: `0 0 20px ${action.color}30`,
      }}>
        {action.icon}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{action.title}</div>
      <div style={{ fontSize: 11, color: '#666' }}>{action.subtitle}</div>
    </div>
  )
}

function MetricContent({ title, value, change }) {
  const isPositive = change >= 0
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: 8,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 10, color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ 
        fontSize: 12, 
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
    </div>
  )
}

function GaugeContent({ title, value, type, accentColor }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: 8,
    }}>
      <div style={{ 
        color: accentColor, 
        fontSize: 10, 
        fontWeight: 700, 
        textTransform: 'uppercase', 
        letterSpacing: 1,
        marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{ width: '100%', maxWidth: 120 }}>
        <Gauge value={value} type={type} size={120} showLabels={false} />
      </div>
    </div>
  )
}

function CoinContent({ coin, isFavorite }) {
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
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {coin.image && (
          <img 
            src={coin.image} 
            alt="" 
            style={{ width: 36, height: 36, borderRadius: '50%' }}
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
            {coin.symbol?.toUpperCase()}
            {isFavorite && <span style={{ color: '#FFD700', marginLeft: 6 }}>★</span>}
          </div>
          <div style={{ fontSize: 11, color: '#666' }}>{coin.name}</div>
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
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {coinCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setSearchQuery(''); setSearchResults(null); }}
              style={{
                padding: '4px 10px',
                fontSize: 10,
                fontWeight: 600,
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                background: category === cat.id ? '#00D4FF' : '#1a1a1a',
                color: category === cat.id ? '#000' : '#888',
                transition: 'all 0.2s',
              }}
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
              width: 200,
              padding: '6px 10px',
              fontSize: 10,
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
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 8, color: '#444', display: 'flex', padding: '4px 0', borderBottom: '1px solid #222', position: 'sticky', top: 0, background: '#0f0f0f', zIndex: 1 }}>
          <span style={{ flex: '0 0 20px', textAlign: 'center' }}>#</span>
          <span style={{ flex: '1 1 45px', minWidth: 40 }}>Coin</span>
          <span style={{ flex: '1 1 50px', minWidth: 45, textAlign: 'right' }}>Price</span>
          <span style={{ flex: '0 0 38px', textAlign: 'right' }}>24h</span>
          <span style={{ flex: '0 0 38px', textAlign: 'right' }}>7d</span>
          <span style={{ flex: '0 0 38px', textAlign: 'right' }}>MC</span>
          <span style={{ flex: '0 0 35px', textAlign: 'right' }}>Vol</span>
          <span style={{ flex: '0 0 42px', textAlign: 'right' }}>Circ</span>
          <span style={{ flex: '0 0 40px', textAlign: 'center' }}>7d</span>
          <span style={{ flex: '0 0 38px', textAlign: 'right' }}>ATH</span>
        </div>
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
                padding: '5px 0',
                borderBottom: '1px solid #1a1a1a',
                cursor: 'pointer',
                transition: 'background 0.2s',
                background: isSelected ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                borderLeft: isSelected ? '2px solid #00D4FF' : '2px solid transparent',
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#1a1a1a' }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ flex: '0 0 20px', textAlign: 'center', fontSize: 9, color: '#666' }}>
                {coin.market_cap_rank || i + 1}
              </div>
              <div style={{ flex: '1 1 45px', minWidth: 40, display: 'flex', alignItems: 'center', gap: 3 }}>
                {coin.image && (
                  <img src={coin.image} alt="" style={{ width: 14, height: 14, borderRadius: '50%' }} />
                )}
                <span style={{ fontSize: 9, fontWeight: 600, color: '#fff' }}>
                  {coin.symbol?.toUpperCase()}
                  {isFavorite(coin.symbol) && <span style={{ color: '#FFD700', marginLeft: 2 }}>★</span>}
                </span>
              </div>
              <div style={{ flex: '1 1 50px', minWidth: 45, textAlign: 'right', fontSize: 9, color: '#fff' }}>
                {formatPrice(coin.current_price)}
              </div>
              <div style={{ flex: '0 0 38px', textAlign: 'right', fontSize: 9, fontWeight: 600, color: isPositive24h ? '#39FF14' : '#ff4444' }}>
                {change24h.toFixed(1)}%
              </div>
              <div style={{ flex: '0 0 38px', textAlign: 'right', fontSize: 9, fontWeight: 600, color: isPositive7d ? '#39FF14' : '#ff4444' }}>
                {change7d.toFixed(1)}%
              </div>
              <div style={{ flex: '0 0 38px', textAlign: 'right', fontSize: 9, color: '#888' }}>
                {mc}
              </div>
              <div style={{ flex: '0 0 35px', textAlign: 'right', fontSize: 9, color: '#888' }}>
                {vol}
              </div>
              <div style={{ flex: '0 0 42px', textAlign: 'right', fontSize: 9, color: '#888' }}>
                {supply}
              </div>
              <div style={{ flex: '0 0 40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {sparkline.length > 0 ? (
                  <svg width="32" height="14" viewBox="0 0 32 14">
                    <polyline
                      fill="none"
                      stroke={sparkline[sparkline.length - 1] >= sparkline[0] ? '#39FF14' : '#ff4444'}
                      strokeWidth="1.2"
                      points={sparkline.filter((_, idx) => idx % Math.ceil(sparkline.length / 16) === 0).map((price, idx, arr) => {
                        const min = Math.min(...arr)
                        const max = Math.max(...arr)
                        const range = max - min || 1
                        const x = (idx / (arr.length - 1)) * 32
                        const y = 12 - ((price - min) / range) * 10
                        return `${x},${y}`
                      }).join(' ')}
                    />
                  </svg>
                ) : <span style={{ fontSize: 8, color: '#444' }}>-</span>}
              </div>
              <div style={{ flex: '0 0 38px', textAlign: 'right', fontSize: 9, color: athChange >= -10 ? '#39FF14' : athChange >= -50 ? '#FFD700' : '#ff4444' }}>
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
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
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
    </div>
  )
}

export default function DashboardTab({ userId, userConfig, onNavigate, onAnalyzeCoin }) {
  const { favorites } = useFavorites()
  const isMobile = useIsMobile()
  const [coins, setCoins] = useState([])
  const [coinsLoading, setCoinsLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState(null)
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
    const fetchCoins = async () => {
      setCoinsLoading(true)
      try {
        const response = await fetch('/api/market-overview?category=top')
        if (response.ok) {
          const data = await response.json()
          const coinList = Array.isArray(data) ? data : (data.coins || [])
          setCoins(coinList)
          if (!selectedCoin && coinList.length > 0) {
            setSelectedCoin(coinList[0])
          }
        }
      } catch (err) {
        console.log('Failed to fetch coins')
      } finally {
        setCoinsLoading(false)
      }
    }
    fetchCoins()
    const interval = setInterval(fetchCoins, 60000)
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
    { icon: '🎯', title: 'StrikeAgent', subtitle: 'AI Predictive Trading', color: '#00D4FF', tab: 'sniper' },
    { icon: '💼', title: 'Wallet', subtitle: 'Multi-chain', color: '#9D4EDD', tab: 'wallet' },
    { icon: '📋', title: 'Watchlist', subtitle: 'Limit orders', color: '#39FF14', tab: 'watchlist' },
    { icon: '📊', title: 'Markets', subtitle: 'Live prices', color: '#FF006E', tab: 'markets' },
    { icon: '⚙️', title: 'Settings', subtitle: 'Preferences', color: '#888', tab: 'settings' },
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
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-template-rows: minmax(220px, auto) minmax(220px, auto) minmax(280px, auto) minmax(350px, auto);
          gap: 10px;
        }
        .bento-quick { grid-area: 1 / 1 / 3 / 4; }
        .bento-market { grid-area: 1 / 4 / 3 / 7; }
        .bento-trending { grid-area: 1 / 7 / 3 / 10; }
        .bento-news { grid-area: 1 / 10 / 3 / 13; }
        .bento-table { grid-area: 3 / 1 / 4 / 13; }
        .bento-chart-section { 
          grid-area: 4 / 1 / 5 / 13;
          display: grid;
          grid-template-columns: 1fr 3fr;
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
        
        @media (max-width: 1024px) {
          .bento-dashboard {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: auto;
            gap: 10px;
            padding: 10px;
          }
          .bento-quick, .bento-market, .bento-trending, .bento-news,
          .bento-table, .bento-chart-section {
            grid-area: auto;
          }
          .bento-quick { min-height: 200px; }
          .bento-market { min-height: 200px; }
          .bento-trending { min-height: 200px; }
          .bento-news { min-height: 200px; }
          .bento-table { min-height: 350px; grid-column: 1 / -1; }
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
          }
          .bento-quick, .bento-market, .bento-trending, .bento-news { 
            display: none;
          }
          .bento-table { min-height: 300px; }
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
            display: block;
          }
        }
        
        .mobile-categories-wrapper {
          display: none;
        }
        
        .mobile-category-card {
          background: #0f0f0f;
          border: 1px solid #222;
          border-radius: 12px;
          padding: 16px;
          min-height: 280px;
          display: flex;
          flex-direction: column;
        }
      `}</style>
      <div className="bento-dashboard">
      
      {isMobile && (
        <div className="mobile-categories-wrapper">
          <MobileCardCarousel>
            <div className="mobile-category-card">
              <TileLabel>Quick Actions</TileLabel>
              <div style={{ flex: 1 }}>
                <FlipCarousel
                  items={quickActions}
                  renderItem={(action) => (
                    <div 
                      onClick={() => onNavigate && onNavigate(action.tab)}
                      style={{ height: '100%', cursor: 'pointer' }}
                    >
                      <QuickActionContent action={action} />
                    </div>
                  )}
                  showDots={true}
                  autoPlay={false}
                  interval={6000}
                />
              </div>
            </div>
            
            <div className="mobile-category-card">
              <TileLabel>Market Overview</TileLabel>
              <div style={{ flex: 1 }}>
                <FlipCarousel
                  items={marketOverviewItems}
                  renderItem={(item) => (
                    item.type === 'metric' 
                      ? <MetricContent title={item.title} value={item.value} change={item.change} />
                      : <GaugeContent title={item.title} value={item.value} type={item.gaugeType} accentColor={item.color} />
                  )}
                  showDots={true}
                  autoPlay={false}
                  interval={5000}
                />
              </div>
            </div>
            
            <div className="mobile-category-card">
              <TileLabel>Trending</TileLabel>
              <div style={{ flex: 1 }}>
                {coinsLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                    Loading...
                  </div>
                ) : (
                  <FlipCarousel
                    items={coins.slice(0, 10)}
                    renderItem={(coin) => (
                      <div onClick={() => handleCoinClick(coin)} style={{ height: '100%', cursor: 'pointer' }}>
                        <CoinContent coin={coin} isFavorite={isFavorite(coin.symbol)} />
                      </div>
                    )}
                    showDots={true}
                    autoPlay={false}
                    interval={4000}
                  />
                )}
              </div>
            </div>
            
            <div className="mobile-category-card">
              <TileLabel>News</TileLabel>
              <div style={{ flex: 1 }}>
                <FlipCarousel
                  items={news}
                  renderItem={(item) => <NewsContent news={item} />}
                  showDots={true}
                  autoPlay={false}
                  interval={7000}
                />
              </div>
            </div>
          </MobileCardCarousel>
        </div>
      )}
      
      <BentoTile className="bento-quick">
        <TileLabel>Quick Actions</TileLabel>
        <div style={{ flex: 1, minHeight: 160 }}>
          <FlipCarousel
            items={quickActions}
            renderItem={(action) => (
              <div 
                onClick={() => onNavigate && onNavigate(action.tab)}
                style={{ height: '100%', cursor: 'pointer' }}
              >
                <QuickActionContent action={action} />
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
                : <GaugeContent title={item.title} value={item.value} type={item.gaugeType} accentColor={item.color} />
            )}
            showDots={true}
            autoPlay={true}
            interval={5000}
          />
        </div>
      </BentoTile>

      <BentoTile className="bento-trending">
        <TileLabel>Trending</TileLabel>
        <div style={{ flex: 1, minHeight: 160 }}>
          {coinsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
              Loading...
            </div>
          ) : (
            <FlipCarousel
              items={coins.slice(0, 10)}
              renderItem={(coin) => (
                <div onClick={() => handleCoinClick(coin)} style={{ height: '100%', cursor: 'pointer' }}>
                  <CoinContent coin={coin} isFavorite={isFavorite(coin.symbol)} />
                </div>
              )}
              showDots={true}
              autoPlay={true}
              interval={4000}
            />
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

      <div className="bento-chart-section">
        <div className="chart-metrics">
          <ChartMetricsPanel coin={selectedCoin} />
        </div>
        <div className="chart-container">
          <BitcoinChart compact={false} coinId={selectedCoin?.id} />
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        padding: '6px 0',
        background: '#0a0a0a',
        color: '#444',
        fontSize: 10,
        borderTop: '1px solid #1a1a1a',
      }}>
        Powered by DarkWave Studios, LLC © 2025 | v{versionData.version}
      </div>
      
          </div>
    </>
  )
}
