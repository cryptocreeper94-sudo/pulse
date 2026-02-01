import { useState, useEffect } from 'react'
import './NFTTab.css'

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : ''

export default function NFTTab({ userId }) {
  const [activeView, setActiveView] = useState('portfolio')
  const [portfolio, setPortfolio] = useState({ nfts: [], summary: {} })
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncWallet, setSyncWallet] = useState({ address: '', chain: 'ethereum' })
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [userId, activeView])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeView === 'portfolio') {
        const res = await fetch(`${API_BASE}/api/nft/portfolio/${userId}`)
        const data = await res.json()
        setPortfolio(data)
      } else if (activeView === 'trending') {
        const res = await fetch(`${API_BASE}/api/nft/collections/trending`)
        const data = await res.json()
        setTrending(data.collections || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncWallet = async () => {
    if (!syncWallet.address) return
    try {
      setSyncing(true)
      await fetch(`${API_BASE}/api/nft/sync-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...syncWallet })
      })
      fetchData()
      setSyncWallet({ address: '', chain: 'ethereum' })
    } catch (error) {
      console.error('Failed to sync:', error)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="nft-tab">
      <div className="nft-header">
        <h1>NFT Portfolio</h1>
        <p>Track your NFT holdings across chains</p>
      </div>

      <div className="nft-nav">
        <button 
          className={activeView === 'portfolio' ? 'active' : ''} 
          onClick={() => setActiveView('portfolio')}
        >
          My NFTs
        </button>
        <button 
          className={activeView === 'trending' ? 'active' : ''} 
          onClick={() => setActiveView('trending')}
        >
          Trending Collections
        </button>
        <button 
          className={activeView === 'alerts' ? 'active' : ''} 
          onClick={() => setActiveView('alerts')}
        >
          Floor Alerts
        </button>
      </div>

      {activeView === 'portfolio' && (
        <div className="sync-wallet-form">
          <input
            type="text"
            placeholder="Wallet address"
            value={syncWallet.address}
            onChange={(e) => setSyncWallet({ ...syncWallet, address: e.target.value })}
          />
          <select
            value={syncWallet.chain}
            onChange={(e) => setSyncWallet({ ...syncWallet, chain: e.target.value })}
          >
            <option value="ethereum">Ethereum</option>
            <option value="solana">Solana</option>
            <option value="polygon">Polygon</option>
          </select>
          <button onClick={handleSyncWallet} disabled={syncing}>
            {syncing ? 'Syncing...' : 'Sync Wallet'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="nft-loading">Loading...</div>
      ) : (
        <div className="nft-content">
          {activeView === 'portfolio' && (
            <>
              <div className="portfolio-summary">
                <div className="summary-card">
                  <span>Total NFTs</span>
                  <strong>{portfolio.summary?.totalNfts || 0}</strong>
                </div>
                <div className="summary-card">
                  <span>Est. Value</span>
                  <strong>${portfolio.summary?.totalValue?.toLocaleString() || 0}</strong>
                </div>
                <div className="summary-card">
                  <span>Collections</span>
                  <strong>{portfolio.summary?.uniqueCollections || 0}</strong>
                </div>
                <div className="summary-card">
                  <span>Chains</span>
                  <strong>{portfolio.summary?.chains?.length || 0}</strong>
                </div>
              </div>

              <div className="nft-grid">
                {portfolio.nfts?.length > 0 ? portfolio.nfts.map((nft, i) => (
                  <div key={i} className="nft-card">
                    <div className="nft-image">
                      {nft.image_url ? (
                        <img src={nft.image_url} alt={nft.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                      <span className="chain-badge">{nft.chain}</span>
                    </div>
                    <div className="nft-info">
                      <h4>{nft.name || 'Unnamed'}</h4>
                      <span className="collection">{nft.collection_name}</span>
                      {nft.estimated_value > 0 && (
                        <span className="value">${nft.estimated_value}</span>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="no-nfts">
                    <h3>No NFTs found</h3>
                    <p>Sync a wallet to see your NFTs</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeView === 'trending' && (
            <div className="trending-table-container">
              <table className="trending-table">
                <thead>
                  <tr>
                    <th>Collection</th>
                    <th>Floor Price</th>
                    <th>24h Volume</th>
                    <th>24h Change</th>
                    <th>Chain</th>
                  </tr>
                </thead>
                <tbody>
                  {trending.map((col, i) => (
                    <tr key={i}>
                      <td className="collection-name">{col.name}</td>
                      <td>{col.floor} {col.chain === 'solana' ? 'SOL' : 'ETH'}</td>
                      <td>{col.volume24h} {col.chain === 'solana' ? 'SOL' : 'ETH'}</td>
                      <td className={col.change24h >= 0 ? 'positive' : 'negative'}>
                        {col.change24h >= 0 ? '+' : ''}{col.change24h}%
                      </td>
                      <td className="chain">{col.chain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeView === 'alerts' && (
            <div className="floor-alerts">
              <div className="no-alerts">
                <h3>No floor alerts set</h3>
                <p>Get notified when collection floor prices hit your targets</p>
                <button>Create Alert</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
