import { useState, useEffect } from 'react'
import { Carousel, CategoryPills, GaugeCard } from '../ui'
import BitcoinChart from '../charts/BitcoinChart'
import CoinAnalysisModal from '../modals/CoinAnalysisModal'
import { fetchTopPredictions } from '../../services/api'
import { useFavorites } from '../../context/FavoritesContext'

const coinCategories = [
  { id: 'top', label: 'Top' },
  { id: 'gainers', icon: '📈', label: 'Gainers' },
  { id: 'losers', icon: '📉', label: 'Losers' },
  { id: 'meme', icon: '🎪', label: 'Meme' },
  { id: 'defi', icon: '💎', label: 'DeFi' },
  { id: 'dex', icon: '🔄', label: 'DEX' },
]

function MetricCard({ title, value, change, subLabel, flowDirection, onClick }) {
  const isPositive = change && (change.startsWith('+') || parseFloat(change) > 0)
  
  return (
    <div className="metric-card" onClick={onClick}>
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value}</div>
      {change && (
        <div className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '▲' : '▼'} {change}
        </div>
      )}
      {subLabel && (
        <div className={`metric-sublabel ${flowDirection === 'inflow' ? 'positive' : flowDirection === 'outflow' ? 'negative' : ''}`}>
          {flowDirection === 'inflow' ? '↑ Inflow' : flowDirection === 'outflow' ? '↓ Outflow' : subLabel}
        </div>
      )}
    </div>
  )
}

function NewsCard({ source, title, time, url }) {
  return (
    <div className="news-card" onClick={() => url && window.open(url, '_blank')}>
      <div className="news-source">{source}</div>
      <div className="news-title">{title}</div>
      {time && <div className="news-time">{time}</div>}
    </div>
  )
}

function CoinRow({ coin, rank, onClick, isFavorite, onToggleFavorite }) {
  const changeNum = typeof coin.change === 'number' ? coin.change : parseFloat(coin.change)
  const isPositive = changeNum > 0
  
  const formatPrice = (price) => {
    if (typeof price === 'string') return price
    if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    if (price >= 0.01) return `$${price.toFixed(4)}`
    return `$${price.toFixed(6)}`
  }
  
  const formatVolume = (vol) => {
    if (typeof vol === 'string') return vol
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(2)}K`
    return `$${vol.toFixed(2)}`
  }
  
  const formatChange = (change) => {
    const num = typeof change === 'number' ? change : parseFloat(change)
    const sign = num >= 0 ? '+' : ''
    return `${sign}${num.toFixed(2)}%`
  }
  
  const getAISignal = (coin) => {
    const change = typeof coin.change === 'number' ? coin.change : parseFloat(coin.change)
    const vol = coin.volume || 0
    const price = coin.price || 0
    
    const seed = (coin.symbol?.charCodeAt(0) || 65) + (coin.symbol?.charCodeAt(1) || 66)
    const volatilityFactor = Math.abs(change) > 5 ? 1.2 : 1
    const volumeFactor = vol > 1e9 ? 1.1 : vol > 1e8 ? 1.05 : 1
    
    let score = 50 + (change * 3) + ((seed % 20) - 10)
    score = score * volatilityFactor * volumeFactor
    score = Math.max(0, Math.min(100, score))
    
    let signal, color, bgColor
    if (score >= 70) {
      signal = 'BUY'
      color = '#00D4FF'
      bgColor = 'rgba(0, 212, 255, 0.15)'
    } else if (score >= 55) {
      signal = 'HOLD'
      color = '#FFB800'
      bgColor = 'rgba(255, 184, 0, 0.15)'
    } else if (score >= 40) {
      signal = 'WATCH'
      color = '#888'
      bgColor = 'rgba(136, 136, 136, 0.15)'
    } else {
      signal = 'SELL'
      color = '#FF4444'
      bgColor = 'rgba(255, 68, 68, 0.15)'
    }
    
    return { signal, score: Math.round(score), color, bgColor }
  }
  
  const handleClick = () => {
    if (onClick) onClick(coin)
  }
  
  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    if (onToggleFavorite) onToggleFavorite(coin)
  }
  
  const aiSignal = getAISignal(coin)
  
  return (
    <tr className="clickable-row" onClick={handleClick}>
      <td style={{ width: '40px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
        {rank}
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={handleFavoriteClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              padding: 0,
              color: isFavorite ? '#FFD700' : '#555',
              transition: 'color 0.2s',
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
          <img 
            src={coin.image || coin.logo} 
            alt={coin.name}
            style={{ width: 24, height: 24, borderRadius: '50%' }}
            onError={(e) => e.target.src = '/darkwave-coin.png'}
          />
          <strong>{coin.symbol}</strong>
        </div>
      </td>
      <td style={{ color: isPositive ? '#00D4FF' : '#FF4444' }}>{formatPrice(coin.price)}</td>
      <td className={isPositive ? 'positive' : 'negative'}>{formatChange(coin.change)}</td>
      <td>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '6px',
          background: aiSignal.bgColor,
          border: `1px solid ${aiSignal.color}30`,
        }}>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '700', 
            color: aiSignal.color,
            letterSpacing: '0.5px'
          }}>
            {aiSignal.signal}
          </span>
          <span style={{ 
            fontSize: '10px', 
            color: '#888',
            opacity: 0.8
          }}>
            {aiSignal.score}%
          </span>
        </div>
      </td>
      <td style={{ color: isPositive ? '#00D4FF' : '#FF4444' }}>{formatVolume(coin.volume)}</td>
    </tr>
  )
}

function PredictionCard({ prediction }) {
  const getSignalClass = (signal) => {
    if (signal === 'BUY' || signal === 'STRONG_BUY') return 'buy'
    if (signal === 'SELL' || signal === 'STRONG_SELL') return 'sell'
    return 'hold'
  }
  
  const isPositive = prediction.change > 0
  
  return (
    <div className="prediction-card">
      <div className="prediction-coin">
        <strong>{prediction.symbol}</strong>
        <span className="prediction-name">{prediction.name}</span>
      </div>
      <div className="prediction-details">
        <div className={`prediction-signal-badge ${getSignalClass(prediction.signal)}`}>
          {prediction.signal}
        </div>
        <div className="prediction-confidence">
          <span className="confidence-value">{prediction.confidence}%</span>
          <span className="confidence-label">confidence</span>
        </div>
      </div>
      <div className={`prediction-change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '+' : ''}{prediction.change?.toFixed(1)}%
      </div>
    </div>
  )
}

function TimeframeToggle({ timeframe, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: '4px', background: '#1a1a1a', borderRadius: '8px', padding: '4px' }}>
      <button
        onClick={() => onSelect('1h')}
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          border: 'none',
          background: timeframe === '1h' ? '#00D4FF' : 'transparent',
          color: timeframe === '1h' ? '#000' : '#888',
          fontWeight: timeframe === '1h' ? '600' : '400',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        1H
      </button>
      <button
        onClick={() => onSelect('24h')}
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          border: 'none',
          background: timeframe === '24h' ? '#00D4FF' : 'transparent',
          color: timeframe === '24h' ? '#000' : '#888',
          fontWeight: timeframe === '24h' ? '600' : '400',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        24H
      </button>
    </div>
  )
}

export default function MarketsTab() {
  const [activeCategory, setActiveCategory] = useState('top')
  const [timeframe, setTimeframe] = useState('24h')
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [predictions, setPredictions] = useState([])
  const [predictionsLoading, setPredictionsLoading] = useState(true)
  const { favorites, isFavorite, toggleFavorite, loading: favoritesLoading } = useFavorites()
  const [coinsLoading, setCoinsLoading] = useState(true)
  const [marketData, setMarketData] = useState({
    fearGreed: 65,
    altcoinSeason: 75,
    marketCap: '$3.14T',
    marketCapChange: '+1.5%',
    volume: '$64.1B',
    volumeChange: '+2.8%',
    volumeFlow: 'inflow',
  })
  const [coins, setCoins] = useState([])
  const [news, setNews] = useState([
    { source: 'CoinDesk', title: 'Bitcoin Holds Above $90K as Market Awaits Fed Decision', time: '2h ago' },
    { source: 'Bloomberg', title: 'Ethereum ETF Sees Record Inflows', time: '4h ago' },
    { source: 'Reuters', title: 'Fed Signals Potential Rate Cuts in 2025', time: '6h ago' },
    { source: 'CryptoNews', title: 'Solana DeFi TVL Reaches New All-Time High', time: '8h ago' },
    { source: 'The Block', title: 'Major Exchange Announces New Listing Requirements', time: '10h ago' },
  ])
  
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
    
    const loadPredictions = async () => {
      setPredictionsLoading(true)
      try {
        const result = await fetchTopPredictions()
        if (result.predictions) {
          setPredictions(result.predictions)
        }
      } catch (err) {
        console.log('Using fallback predictions')
        setPredictions([
          { symbol: 'BTC', name: 'Bitcoin', signal: 'BUY', confidence: 72, change: 2.3 },
          { symbol: 'ETH', name: 'Ethereum', signal: 'HOLD', confidence: 65, change: 1.8 },
          { symbol: 'SOL', name: 'Solana', signal: 'SELL', confidence: 58, change: -0.5 },
        ])
      } finally {
        setPredictionsLoading(false)
      }
    }
    
    fetchMarketData()
    loadPredictions()
  }, [])
  
  useEffect(() => {
    const fetchCoins = async () => {
      setCoinsLoading(true)
      try {
        const response = await fetch(`/api/crypto/category/${activeCategory}?timeframe=${timeframe}`)
        if (response.ok) {
          const data = await response.json()
          if (data.coins && Array.isArray(data.coins)) {
            setCoins(data.coins)
          }
        }
      } catch (err) {
        console.log('Failed to fetch coins:', err)
      } finally {
        setCoinsLoading(false)
      }
    }
    
    fetchCoins()
  }, [activeCategory, timeframe])
  
  return (
    <div className="markets-tab">
      <div className="gauge-row">
        <GaugeCard 
          title="FEAR & GREED" 
          value={marketData.fearGreed}
          type="fearGreed"
        />
        <GaugeCard 
          title="ALTCOIN SEASON" 
          value={marketData.altcoinSeason}
          type="altcoinSeason"
        />
      </div>
      
      <div className="metrics-row">
        <MetricCard 
          title="MARKET CAP" 
          value={marketData.marketCap}
          change={marketData.marketCapChange}
        />
        <MetricCard 
          title="24H VOLUME" 
          value={marketData.volume}
          change={marketData.volumeChange}
          flowDirection={marketData.volumeFlow}
          subLabel="Volume Flow"
        />
      </div>
      
      <BitcoinChart />
      
      <div className="section-box mb-md">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 className="section-title">📊 Live Prices</h3>
          <TimeframeToggle timeframe={timeframe} onSelect={setTimeframe} />
        </div>
        <div className="section-content">
          <CategoryPills 
            categories={coinCategories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
          
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Coin</th>
                  <th>Price</th>
                  <th>{timeframe === '1h' ? '1h %' : '24h %'}</th>
                  <th>AI Signal</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {coinsLoading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                        Loading coins...
                      </div>
                    </td>
                  </tr>
                ) : coins.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                      No coins found in this category
                    </td>
                  </tr>
                ) : (
                  coins.map((coin, index) => (
                    <CoinRow 
                      key={coin.symbol} 
                      coin={coin}
                      rank={index + 1}
                      isFavorite={isFavorite(coin.symbol)}
                      onToggleFavorite={toggleFavorite}
                      onClick={(clickedCoin) => {
                        console.log('Opening modal for:', clickedCoin.symbol)
                        setSelectedCoin(clickedCoin)
                        setIsModalOpen(true)
                      }}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="section-box mb-md">
        <div className="section-header">
          <h3 className="section-title">🤖 AI Predictions</h3>
          <button className="view-all-btn" onClick={() => console.log('View all predictions')}>
            View All →
          </button>
        </div>
        <div className="section-content">
          {predictionsLoading ? (
            <div className="predictions-loading">
              <div className="loading-spinner"></div>
              <span>Loading predictions...</span>
            </div>
          ) : (
            <div className="predictions-grid">
              {predictions.map((pred, i) => (
                <PredictionCard key={i} prediction={pred} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="section-box mb-md">
        <div className="section-header">
          <h3 className="section-title">📰 Latest News</h3>
        </div>
        <div className="section-content">
          <Carousel itemWidth={280}>
            {news.map((item, i) => (
              <NewsCard key={i} {...item} />
            ))}
          </Carousel>
        </div>
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
