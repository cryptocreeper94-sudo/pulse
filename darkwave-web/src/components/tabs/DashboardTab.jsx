import { useState, useEffect } from 'react'
import { useFavorites } from '../../context/FavoritesContext'
import { useAvatar } from '../../context/AvatarContext'
import BitcoinChart from '../charts/BitcoinChart'
import CoinAnalysisModal from '../modals/CoinAnalysisModal'
import { GaugeCard } from '../ui'

function WelcomeCard({ hallmarkId, avatarSvg }) {
  return (
    <div className="dashboard-welcome-card">
      <div className="welcome-avatar">
        {avatarSvg ? (
          <div 
            className="avatar-preview-small"
            dangerouslySetInnerHTML={{ __html: avatarSvg }}
            style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden' }}
          />
        ) : (
          <div className="avatar-placeholder" style={{ width: 60, height: 60, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 24 }}>👤</span>
          </div>
        )}
      </div>
      <div className="welcome-text">
        <h2 style={{ margin: 0, fontSize: 18 }}>Welcome back!</h2>
        {hallmarkId && (
          <div className="hallmark-badge" style={{ fontSize: 12, color: '#00D4FF', marginTop: 4 }}>
            {hallmarkId}
          </div>
        )}
      </div>
    </div>
  )
}

function FavoritesWidget({ favorites, onCoinClick }) {
  if (!favorites || favorites.length === 0) {
    return (
      <div className="section-box mb-md">
        <div className="section-header">
          <h3 className="section-title">⭐ Your Favorites</h3>
        </div>
        <div className="section-content" style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#888', marginBottom: 10 }}>No favorites yet</p>
          <p style={{ color: '#666', fontSize: 12 }}>Go to Markets tab and tap the ⭐ on any coin to add it here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="section-box mb-md">
      <div className="section-header">
        <h3 className="section-title">⭐ Your Favorites</h3>
      </div>
      <div className="section-content">
        <div className="favorites-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {favorites.map(fav => (
            <div 
              key={fav.id} 
              className="favorite-card"
              onClick={() => onCoinClick({ symbol: fav.symbol, name: fav.name })}
              style={{
                background: '#1a1a1a',
                borderRadius: 8,
                padding: 12,
                cursor: 'pointer',
                border: '1px solid #333',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14 }}>{fav.symbol}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{fav.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function QuickStatsWidget({ marketData }) {
  return (
    <div className="gauge-row" style={{ marginBottom: 16 }}>
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
  )
}

function MainChartWidget({ defaultChart, userConfig }) {
  return (
    <div className="section-box mb-md">
      <div className="section-header">
        <h3 className="section-title">📈 {defaultChart?.toUpperCase() || 'BTC'} Chart</h3>
      </div>
      <div className="section-content">
        <BitcoinChart />
      </div>
    </div>
  )
}

export default function DashboardTab({ userId, userConfig }) {
  const { favorites, loading: favoritesLoading } = useFavorites()
  const { avatarSvg } = useAvatar()
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hallmarkId, setHallmarkId] = useState(userConfig?.hallmarkId || null)
  const [marketData, setMarketData] = useState({
    fearGreed: 65,
    altcoinSeason: 75,
  })

  useEffect(() => {
    if (userConfig?.hallmarkId) {
      setHallmarkId(userConfig.hallmarkId)
    } else if (userId && !hallmarkId) {
      fetch(`/api/users/${userId}/hallmark`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.hallmarkId) {
            setHallmarkId(data.hallmarkId)
          }
        })
        .catch(err => console.log('Failed to generate hallmark'))
    }
  }, [userId, userConfig, hallmarkId])

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

  const handleCoinClick = (coin) => {
    setSelectedCoin(coin)
    setIsModalOpen(true)
  }

  return (
    <div className="dashboard-tab">
      <WelcomeCard hallmarkId={hallmarkId} avatarSvg={avatarSvg} />
      
      <QuickStatsWidget marketData={marketData} />
      
      <FavoritesWidget 
        favorites={favorites} 
        onCoinClick={handleCoinClick}
      />
      
      <MainChartWidget 
        defaultChart={userConfig?.defaultChart || 'bitcoin'} 
        userConfig={userConfig}
      />
      
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
