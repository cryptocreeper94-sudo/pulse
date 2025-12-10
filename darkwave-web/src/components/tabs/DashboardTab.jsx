import { useState, useEffect } from 'react'
import { useFavorites } from '../../context/FavoritesContext'
import { useAvatar } from '../../context/AvatarContext'
import BitcoinChart from '../charts/BitcoinChart'
import CoinAnalysisModal from '../modals/CoinAnalysisModal'
import Gauge from '../ui/Gauge'
import FlipCarousel from '../ui/FlipCarousel'

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

function BentoTile({ children, gridArea, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        gridArea,
        background: '#0f0f0f',
        border: '1px solid #222',
        borderRadius: 12,
        padding: 12,
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
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
      justifyContent: 'center',
      height: '100%',
      padding: 8,
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
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        cursor: 'pointer',
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

function MiniCoinTable({ coins, onCoinClick, favorites }) {
  const displayCoins = coins.slice(0, 5)
  const isFavorite = (symbol) => favorites?.some(f => f.symbol?.toUpperCase() === symbol?.toUpperCase())
  
  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <TileLabel>Top Coins</TileLabel>
      <div style={{ fontSize: 9, color: '#444', display: 'flex', padding: '4px 0', borderBottom: '1px solid #222' }}>
        <span style={{ flex: 2 }}>Coin</span>
        <span style={{ flex: 1, textAlign: 'right' }}>Price</span>
        <span style={{ flex: 1, textAlign: 'right' }}>24h</span>
      </div>
      {displayCoins.map((coin, i) => {
        const change = coin.price_change_percentage_24h || 0
        const isPositive = change >= 0
        return (
          <div 
            key={coin.id || i}
            onClick={() => onCoinClick(coin)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '6px 0',
              borderBottom: '1px solid #1a1a1a',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              {coin.image && (
                <img src={coin.image} alt="" style={{ width: 18, height: 18, borderRadius: '50%' }} />
              )}
              <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>
                {coin.symbol?.toUpperCase()}
                {isFavorite(coin.symbol) && <span style={{ color: '#FFD700', marginLeft: 4 }}>★</span>}
              </span>
            </div>
            <div style={{ flex: 1, textAlign: 'right', fontSize: 11, color: '#fff' }}>
              {formatPrice(coin.current_price)}
            </div>
            <div style={{ flex: 1, textAlign: 'right', fontSize: 11, fontWeight: 600, color: isPositive ? '#39FF14' : '#ff4444' }}>
              {isPositive ? '+' : ''}{change.toFixed(1)}%
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardTab({ userId, userConfig, onNavigate }) {
  const { favorites } = useFavorites()
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [coins, setCoins] = useState([])
  const [coinsLoading, setCoinsLoading] = useState(true)
  const [marketData, setMarketData] = useState({
    fearGreed: 65,
    altcoinSeason: 75,
    totalMarketCap: 3.2e12,
    totalMarketCapChange: 2.1,
    totalVolume: 98e9,
    totalVolumeChange: -1.8,
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
          setCoins(Array.isArray(data) ? data : (data.coins || []))
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
    setIsModalOpen(true)
  }

  const isFavorite = (symbol) => favorites?.some(f => f.symbol?.toUpperCase() === symbol?.toUpperCase())

  const quickActions = [
    { icon: '🎯', title: 'Sniper Bot', subtitle: 'AI trading', color: '#00D4FF', tab: 'sniper' },
    { icon: '💼', title: 'Wallet', subtitle: 'Multi-chain', color: '#9D4EDD', tab: 'wallet' },
    { icon: '📋', title: 'Watchlist', subtitle: 'Limit orders', color: '#39FF14', tab: 'watchlist' },
    { icon: '📊', title: 'Markets', subtitle: 'Live prices', color: '#FF006E', tab: 'markets' },
    { icon: '⚙️', title: 'Settings', subtitle: 'Preferences', color: '#888', tab: 'settings' },
  ]

  const marketOverviewItems = [
    { type: 'metric', title: 'Market Cap', value: formatMarketCap(marketData.totalMarketCap), change: marketData.totalMarketCapChange },
    { type: 'metric', title: '24h Volume', value: formatMarketCap(marketData.totalVolume), change: marketData.totalVolumeChange },
    { type: 'gauge', title: 'Fear & Greed', value: marketData.fearGreed, gaugeType: 'fearGreed', color: '#FF006E' },
    { type: 'gauge', title: 'Altcoin Season', value: marketData.altcoinSeason, gaugeType: 'altcoinSeason', color: '#00D4FF' },
  ]

  return (
    <div style={{ 
      height: 'calc(100vh - 100px)',
      padding: 12,
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gridTemplateRows: 'repeat(4, 1fr)',
      gap: 10,
      overflow: 'hidden',
    }}>
      
      <BentoTile gridArea="1 / 1 / 3 / 4">
        <TileLabel>Quick Actions</TileLabel>
        <div style={{ height: 'calc(100% - 24px)' }}>
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

      <BentoTile gridArea="1 / 4 / 3 / 7">
        <TileLabel>Market Overview</TileLabel>
        <div style={{ height: 'calc(100% - 24px)' }}>
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

      <BentoTile gridArea="1 / 7 / 3 / 10">
        <TileLabel>Trending</TileLabel>
        <div style={{ height: 'calc(100% - 24px)' }}>
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

      <BentoTile gridArea="1 / 10 / 3 / 13">
        <TileLabel>News</TileLabel>
        <div style={{ height: 'calc(100% - 24px)' }}>
          <FlipCarousel
            items={news}
            renderItem={(item) => <NewsContent news={item} />}
            showDots={true}
            autoPlay={true}
            interval={7000}
          />
        </div>
      </BentoTile>

      <BentoTile gridArea="3 / 1 / 5 / 5">
        <MiniCoinTable coins={coins} onCoinClick={handleCoinClick} favorites={favorites} />
      </BentoTile>

      <BentoTile gridArea="3 / 5 / 5 / 13" style={{ padding: 8 }}>
        <TileLabel>Bitcoin Chart</TileLabel>
        <div style={{ height: 'calc(100% - 28px)' }}>
          <BitcoinChart compact={true} />
        </div>
      </BentoTile>

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
        Powered by DarkWave Studios, LLC © 2025 | v2.0.6
      </div>
      
      <CoinAnalysisModal 
        coin={selectedCoin}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCoin(null)
        }}
      />
    </div>
  )
}
