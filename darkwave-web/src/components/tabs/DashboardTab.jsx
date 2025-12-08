import { useState, useEffect } from 'react'
import { useFavorites } from '../../context/FavoritesContext'
import { useAvatar } from '../../context/AvatarContext'
import BitcoinChart from '../charts/BitcoinChart'
import CoinAnalysisModal from '../modals/CoinAnalysisModal'
import Gauge from '../ui/Gauge'

function formatMarketCap(value) {
  if (!value) return '—'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

function MiniSparkline({ data, positive }) {
  if (!data || data.length < 2) return null
  
  const samples = data.length > 20 ? data.filter((_, i) => i % Math.floor(data.length / 20) === 0) : data
  const min = Math.min(...samples)
  const max = Math.max(...samples)
  const range = max - min || 1
  
  const width = 60
  const height = 24
  const points = samples.map((val, i) => {
    const x = (i / (samples.length - 1)) * width
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  }).join(' ')
  
  const color = positive ? '#39FF14' : '#FF4444'
  
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PromoBanner({ onNavigate }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(157, 78, 221, 0.1) 100%)',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    }}>
      <div style={{ 
        display: 'inline-block',
        background: '#39FF14',
        color: '#000',
        padding: '3px 8px',
        borderRadius: 3,
        fontSize: 9,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
      }}>
        Coming Soon
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#fff' }}>
        AI Sniper Bot
      </h3>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
        Set parameters, let AI find opportunities.
      </p>
      <button
        onClick={() => onNavigate && onNavigate('trading')}
        style={{
          background: 'linear-gradient(135deg, #00D4FF 0%, #0099cc 100%)',
          color: '#000',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 11,
          cursor: 'pointer',
        }}
      >
        Learn More
      </button>
    </div>
  )
}

function GaugeSection({ marketData }) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(2, 1fr)', 
      gap: 12, 
      marginBottom: 16 
    }}>
      <div style={{
        background: '#0f0f0f',
        borderRadius: 12,
        padding: 12,
        border: '1px solid #222',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ 
          color: '#FF006E', 
          fontSize: 10, 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: 1,
          marginBottom: 4,
        }}>
          Fear & Greed
        </div>
        <div style={{ width: '100%', maxWidth: 120, margin: '0 auto' }}>
          <Gauge value={marketData.fearGreed} type="fearGreed" size={120} showLabels={false} />
        </div>
      </div>
      <div style={{
        background: '#0f0f0f',
        borderRadius: 12,
        padding: 12,
        border: '1px solid #222',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ 
          color: '#00D4FF', 
          fontSize: 10, 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: 1,
          marginBottom: 4,
        }}>
          Altcoin Season
        </div>
        <div style={{ width: '100%', maxWidth: 120, margin: '0 auto' }}>
          <Gauge value={marketData.altcoinSeason} type="altcoinSeason" size={120} showLabels={false} />
        </div>
      </div>
    </div>
  )
}

function CoinTableWidget({ coins, favorites, onCoinClick, activeView, setActiveView, timeframe, setTimeframe, loading }) {
  const getDisplayCoins = () => {
    if (!coins || coins.length === 0) return []
    
    switch (activeView) {
      case 'favorites':
        return favorites || []
      case 'gainers':
        return [...coins]
          .sort((a, b) => (timeframe === '1h' 
            ? (b.price_change_percentage_1h_in_currency || 0) - (a.price_change_percentage_1h_in_currency || 0)
            : (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)))
          .slice(0, 10)
      case 'losers':
        return [...coins]
          .sort((a, b) => (timeframe === '1h'
            ? (a.price_change_percentage_1h_in_currency || 0) - (b.price_change_percentage_1h_in_currency || 0)
            : (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)))
          .slice(0, 10)
      default:
        return coins.slice(0, 10)
    }
  }

  const displayCoins = getDisplayCoins()
  const isFavorite = (symbol) => favorites?.some(f => f.symbol?.toUpperCase() === symbol?.toUpperCase())

  const formatPrice = (price) => {
    if (!price) return '$0.00'
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatChange = (change) => {
    if (change === null || change === undefined) return '-'
    const color = change >= 0 ? '#39FF14' : '#ff4444'
    const arrow = change >= 0 ? '▲' : '▼'
    return <span style={{ color }}>{arrow} {Math.abs(change).toFixed(1)}%</span>
  }

  const tabs = [
    { id: 'top10', label: 'Top 10' },
    { id: 'favorites', label: 'Favs' },
    { id: 'gainers', label: 'Gainers' },
    { id: 'losers', label: 'Losers' }
  ]

  return (
    <div style={{ background: '#0f0f0f', border: '1px solid #222', borderRadius: 12, marginBottom: 16 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px 10px', 
        borderBottom: '1px solid #222',
        overflowX: 'auto',
        gap: 8,
      }}>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              style={{
                padding: '5px 8px',
                fontSize: 10,
                height: 26,
                background: activeView === tab.id ? '#00D4FF' : '#1a1a1a',
                color: activeView === tab.id ? '#000' : '#888',
                border: activeView === tab.id ? '1px solid #00D4FF' : '1px solid #333',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: activeView === tab.id ? 700 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
          {['1H', '24H'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf.toLowerCase())}
              style={{
                padding: '5px 8px',
                fontSize: 10,
                height: 26,
                background: timeframe === tf.toLowerCase() ? '#1a1a1a' : 'transparent',
                color: timeframe === tf.toLowerCase() ? '#00D4FF' : '#555',
                border: timeframe === tf.toLowerCase() ? '1px solid #00D4FF' : '1px solid #333',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>
            <div style={{ 
              width: 24, 
              height: 24, 
              border: '2px solid #333', 
              borderTop: '2px solid #00D4FF', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 8px'
            }}></div>
            Loading...
          </div>
        ) : displayCoins.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 12 }}>
            {activeView === 'favorites' ? 'No favorites yet' : 'No coins found'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #222' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#555', fontWeight: 600, fontSize: 10 }}>#</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#555', fontWeight: 600, fontSize: 10 }}>Coin</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', color: '#555', fontWeight: 600, fontSize: 10 }}>Price</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', color: '#555', fontWeight: 600, fontSize: 10 }}>{timeframe.toUpperCase()}</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', color: '#555', fontWeight: 600, fontSize: 10 }}>Market Cap</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', color: '#555', fontWeight: 600, fontSize: 10 }}>Volume (24h)</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#555', fontWeight: 600, fontSize: 10 }}>7D</th>
              </tr>
            </thead>
            <tbody>
              {displayCoins.map((coin, index) => {
                const change = timeframe === '1h' 
                  ? (coin.price_change_percentage_1h_in_currency || coin.priceChange1h)
                  : (coin.price_change_percentage_24h || coin.priceChange24h)
                const sparkline = coin.sparkline_in_7d?.price || []
                const sparklinePositive = sparkline.length > 1 ? sparkline[sparkline.length - 1] > sparkline[0] : true
                return (
                  <tr 
                    key={coin.id || coin.symbol} 
                    onClick={() => onCoinClick(coin)}
                    style={{ borderBottom: '1px solid #1a1a1a', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 8px', color: '#444' }}>{index + 1}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {coin.image && (
                          <img 
                            src={coin.image} 
                            alt="" 
                            style={{ width: 24, height: 24, borderRadius: '50%' }}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12, color: '#fff' }}>
                            {coin.symbol?.toUpperCase()}
                            {isFavorite(coin.symbol) && <span style={{ color: '#FFD700', marginLeft: 4 }}>★</span>}
                          </div>
                          <div style={{ fontSize: 10, color: '#666' }}>{coin.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600, color: '#fff', fontSize: 12 }}>
                      {formatPrice(coin.current_price || coin.price)}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600, fontSize: 11 }}>
                      {formatChange(change)}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#999', fontSize: 11 }}>
                      {formatMarketCap(coin.market_cap)}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#888', fontSize: 11 }}>
                      {formatMarketCap(coin.total_volume)}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      {sparkline.length > 0 ? (
                        <MiniSparkline data={sparkline} positive={sparklinePositive} />
                      ) : (
                        <span style={{ color: '#444', fontSize: 10 }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function ChartWidget() {
  return (
    <div style={{ 
      background: '#0f0f0f', 
      border: '1px solid #222', 
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16
    }}>
      <div style={{ 
        padding: '10px 12px', 
        borderBottom: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span style={{ fontSize: 14 }}>📈</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Bitcoin Chart</span>
      </div>
      <BitcoinChart />
    </div>
  )
}

const NEWS_IMAGES = [
  '/assets/news/bitcoin_cryptocurren_e03615e0.jpg',
  '/assets/news/bitcoin_cryptocurren_49ee9303.jpg',
  '/assets/news/bitcoin_cryptocurren_56c58d38.jpg',
  '/assets/news/bitcoin_cryptocurren_766043e0.jpg',
]

function NewsCarousel({ news, currentIndex, onNext, onPrev }) {
  if (!news || news.length === 0) {
    return (
      <div style={{ 
        background: '#0f0f0f', 
        border: '1px solid #222', 
        borderRadius: 12,
        padding: 20,
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
        marginBottom: 16
      }}>
        No news available
      </div>
    )
  }

  const currentNews = news[currentIndex]
  const newsImage = currentNews.image || NEWS_IMAGES[currentIndex % NEWS_IMAGES.length]

  return (
    <div style={{ 
      background: '#0f0f0f', 
      border: '1px solid #222', 
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16
    }}>
      <div style={{ 
        padding: '10px 12px', 
        borderBottom: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Crypto News</span>
        <span style={{ fontSize: 10, color: '#666' }}>{currentIndex + 1} / {news.length}</span>
      </div>
      <div style={{ position: 'relative', display: 'flex', minHeight: 140 }}>
        <div 
          style={{
            width: '45%',
            backgroundImage: `url(${newsImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRight: '1px solid #222',
          }}
        />
        <div 
          style={{
            width: '55%',
            display: 'flex',
            flexDirection: 'column',
            padding: 14,
            justifyContent: 'center',
          }}
        >
          <div style={{ 
            fontSize: 9, 
            color: '#00D4FF', 
            fontWeight: 600, 
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            {currentNews.source}
          </div>
          <div style={{ 
            fontSize: 13, 
            fontWeight: 700, 
            color: '#fff', 
            marginBottom: 8,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {currentNews.title}
          </div>
          <div style={{ 
            fontSize: 10, 
            color: 'rgba(255,255,255,0.5)', 
            marginBottom: 10 
          }}>
            {currentNews.time}
          </div>
          {currentNews.url && (
            <a 
              href={currentNews.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                fontSize: 10,
                color: '#00D4FF',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Read More →
            </a>
          )}
        </div>
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          display: 'flex',
          gap: 6,
        }}>
          <button
            onClick={onPrev}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid #333',
              color: '#fff',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto'
            }}
          >
            ←
          </button>
          <button
            onClick={onNext}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid #333',
              color: '#fff',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto'
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '8px 0',
      marginTop: 0,
      color: '#666',
      fontSize: 11,
      fontWeight: 500,
    }}>
      Powered by DarkWave Studios, LLC © 2025 | v2.0.6
    </div>
  )
}

export default function DashboardTab({ userId, userConfig, onNavigate }) {
  const { favorites, loading: favoritesLoading } = useFavorites()
  const { avatarSvg } = useAvatar()
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [coins, setCoins] = useState([])
  const [coinsLoading, setCoinsLoading] = useState(true)
  const [activeView, setActiveView] = useState('top10')
  const [timeframe, setTimeframe] = useState('24h')
  const [marketData, setMarketData] = useState({
    fearGreed: 65,
    altcoinSeason: 75,
  })
  const [news, setNews] = useState([])
  const [newsIndex, setNewsIndex] = useState(0)

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
      { source: 'CoinDesk', title: 'Bitcoin Holds Above $90K as Market Awaits Fed Decision', time: '2 hours ago', url: 'https://coindesk.com' },
      { source: 'CoinTelegraph', title: 'Ethereum Layer-2 Solutions See Record Growth in Q4', time: '4 hours ago', url: 'https://cointelegraph.com' },
      { source: 'The Block', title: 'Solana DeFi TVL Surges Past $5 Billion Milestone', time: '6 hours ago', url: 'https://theblock.co' },
      { source: 'Decrypt', title: 'AI Tokens Lead Altcoin Rally as Sector Gains Momentum', time: '8 hours ago', url: 'https://decrypt.co' },
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
      } catch (err) {
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

  const handleNextNews = () => {
    setNewsIndex(prev => (prev + 1) % news.length)
  }

  const handlePrevNews = () => {
    setNewsIndex(prev => (prev - 1 + news.length) % news.length)
  }

  return (
    <div style={{ padding: '12px 12px 0' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <PromoBanner onNavigate={onNavigate} />
      
      <GaugeSection marketData={marketData} />
      
      <CoinTableWidget 
        coins={coins}
        favorites={favorites}
        onCoinClick={handleCoinClick}
        activeView={activeView}
        setActiveView={setActiveView}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        loading={coinsLoading}
      />
      
      <ChartWidget />
      
      <NewsCarousel 
        news={news}
        currentIndex={newsIndex}
        onNext={handleNextNews}
        onPrev={handlePrevNews}
      />
      
      <Footer />
      
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
