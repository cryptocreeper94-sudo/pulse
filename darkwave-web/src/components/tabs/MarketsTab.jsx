import { useState, useEffect } from 'react'
import { Carousel, BentoGrid, BentoItem, CategoryPills, GaugeCard } from '../ui'
import BitcoinChart from '../charts/BitcoinChart'
import CoinAnalysisModal from '../modals/CoinAnalysisModal'
import { fetchTopPredictions } from '../../services/api'

const coinCategories = [
  { id: 'top', label: 'Top 10' },
  { id: 'meme', icon: '🎪', label: 'Memes' },
  { id: 'defi', icon: '💎', label: 'DeFi' },
  { id: 'bluechip', icon: '🏆', label: 'Blue Chips' },
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

function CoinRow({ coin, onClick }) {
  const isPositive = parseFloat(coin.change) > 0
  
  const handleClick = () => {
    if (onClick) onClick(coin)
  }
  
  return (
    <tr className="clickable-row" onClick={handleClick}>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={coin.logo} 
            alt={coin.name}
            style={{ width: 24, height: 24, borderRadius: '50%' }}
            onError={(e) => e.target.src = '/darkwave-coin.png'}
          />
          <strong>{coin.symbol}</strong>
        </div>
      </td>
      <td>{coin.price}</td>
      <td className={isPositive ? 'positive' : 'negative'}>{coin.change}</td>
      <td>{coin.volume}</td>
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

export default function MarketsTab() {
  const [activeCategory, setActiveCategory] = useState('top')
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [predictions, setPredictions] = useState([])
  const [predictionsLoading, setPredictionsLoading] = useState(true)
  const [marketData, setMarketData] = useState({
    fearGreed: 65,
    altcoinSeason: 75,
    marketCap: '$3.14T',
    marketCapChange: '+1.5%',
    volume: '$64.1B',
    volumeChange: '+2.8%',
    volumeFlow: 'inflow',
  })
  const [coins, setCoins] = useState([
    { symbol: 'BTC', name: 'Bitcoin', logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', price: '$97,234', change: '+2.3%', volume: '$28.5B' },
    { symbol: 'ETH', name: 'Ethereum', logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', price: '$3,845', change: '+1.8%', volume: '$12.1B' },
    { symbol: 'SOL', name: 'Solana', logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', price: '$242.50', change: '-0.5%', volume: '$2.3B' },
    { symbol: 'BNB', name: 'BNB', logo: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', price: '$698.20', change: '+3.1%', volume: '$1.8B' },
  ])
  const [news, setNews] = useState([
    { source: 'CoinDesk', title: 'Bitcoin Surges Past $97K as Institutional Demand Grows', time: '2h ago' },
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
        <div className="section-header">
          <h3 className="section-title">📊 Live Prices</h3>
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
                  <th>Coin</th>
                  <th>Price</th>
                  <th>24h %</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {coins.map(coin => (
                  <CoinRow 
                    key={coin.symbol} 
                    coin={coin}
                    onClick={(clickedCoin) => {
                      console.log('Opening modal for:', clickedCoin.symbol)
                      setSelectedCoin(clickedCoin)
                      setIsModalOpen(true)
                    }}
                  />
                ))}
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
