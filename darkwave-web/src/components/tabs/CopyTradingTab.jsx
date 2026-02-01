import { useState, useEffect } from 'react'
import './CopyTradingTab.css'

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : ''

export default function CopyTradingTab({ userId }) {
  const [activeView, setActiveView] = useState('discover')
  const [traders, setTraders] = useState([])
  const [myCopies, setMyCopies] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [userId, activeView])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeView === 'discover') {
        const res = await fetch(`${API_BASE}/api/copy-trading/available-traders`)
        const data = await res.json()
        setTraders(data.traders || [])
      } else if (activeView === 'my-copies') {
        const res = await fetch(`${API_BASE}/api/copy-trading/my-copies/${userId}`)
        const data = await res.json()
        setMyCopies(data.copies || [])
      } else if (activeView === 'history') {
        const res = await fetch(`${API_BASE}/api/copy-trading/history/${userId}`)
        const data = await res.json()
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (traderId) => {
    try {
      await fetch(`${API_BASE}/api/copy-trading/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          traderId,
          settings: { allocationPercent: 10, maxTradeSize: 100 }
        })
      })
      fetchData()
    } catch (error) {
      console.error('Failed to follow:', error)
    }
  }

  const handleUnfollow = async (traderId) => {
    try {
      await fetch(`${API_BASE}/api/copy-trading/unfollow/${userId}/${traderId}`, {
        method: 'DELETE'
      })
      fetchData()
    } catch (error) {
      console.error('Failed to unfollow:', error)
    }
  }

  return (
    <div className="copy-trading-tab">
      <div className="copy-header">
        <h1>Copy Trading</h1>
        <p>Automatically mirror trades from top performers</p>
      </div>

      <div className="copy-nav">
        <button 
          className={activeView === 'discover' ? 'active' : ''} 
          onClick={() => setActiveView('discover')}
        >
          Discover Traders
        </button>
        <button 
          className={activeView === 'my-copies' ? 'active' : ''} 
          onClick={() => setActiveView('my-copies')}
        >
          My Copies
        </button>
        <button 
          className={activeView === 'history' ? 'active' : ''} 
          onClick={() => setActiveView('history')}
        >
          Trade History
        </button>
      </div>

      {loading ? (
        <div className="copy-loading">Loading...</div>
      ) : (
        <div className="copy-content">
          {activeView === 'discover' && (
            <div className="traders-grid">
              {traders.length > 0 ? traders.map((trader, i) => (
                <div key={i} className="trader-card">
                  <div className="trader-avatar">
                    {trader.avatar_url ? (
                      <img src={trader.avatar_url} alt="" />
                    ) : (
                      <div className="avatar-placeholder">
                        {trader.display_name?.[0] || '?'}
                      </div>
                    )}
                    {trader.verified && <span className="verified-badge">✓</span>}
                  </div>
                  <h3>{trader.display_name || 'Anonymous'}</h3>
                  <div className="trader-stats">
                    <div className="stat">
                      <span>Win Rate</span>
                      <strong className="positive">{trader.win_rate?.toFixed(1) || 0}%</strong>
                    </div>
                    <div className="stat">
                      <span>Total P&L</span>
                      <strong className={trader.total_pnl >= 0 ? 'positive' : 'negative'}>
                        ${trader.total_pnl?.toLocaleString() || 0}
                      </strong>
                    </div>
                    <div className="stat">
                      <span>Trades</span>
                      <strong>{trader.total_trades || 0}</strong>
                    </div>
                    <div className="stat">
                      <span>Copiers</span>
                      <strong>{trader.copier_count || 0}</strong>
                    </div>
                  </div>
                  <button 
                    className="copy-btn"
                    onClick={() => handleFollow(trader.user_id)}
                  >
                    Copy Trader
                  </button>
                </div>
              )) : (
                <div className="no-traders">No traders available yet</div>
              )}
            </div>
          )}

          {activeView === 'my-copies' && (
            <div className="my-copies-list">
              {myCopies.length > 0 ? myCopies.map((copy, i) => (
                <div key={i} className="copy-card">
                  <div className="copy-info">
                    <div className="copy-avatar">
                      {copy.avatar_url ? (
                        <img src={copy.avatar_url} alt="" />
                      ) : (
                        <div className="avatar-placeholder">
                          {copy.display_name?.[0] || '?'}
                        </div>
                      )}
                    </div>
                    <div className="copy-details">
                      <h4>{copy.display_name}</h4>
                      <span>Copying since {new Date(copy.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="copy-stats">
                    <div className="stat">
                      <span>Win Rate</span>
                      <strong>{copy.trader_win_rate?.toFixed(1)}%</strong>
                    </div>
                    <div className="stat">
                      <span>Allocation</span>
                      <strong>{copy.allocation_percent}%</strong>
                    </div>
                    <div className="stat">
                      <span>Max Trade</span>
                      <strong>${copy.max_trade_size}</strong>
                    </div>
                  </div>
                  <div className="copy-actions">
                    <button 
                      className={`toggle-btn ${copy.enabled ? 'enabled' : 'disabled'}`}
                    >
                      {copy.enabled ? 'Active' : 'Paused'}
                    </button>
                    <button 
                      className="stop-btn"
                      onClick={() => handleUnfollow(copy.trader_id)}
                    >
                      Stop Copying
                    </button>
                  </div>
                </div>
              )) : (
                <div className="no-copies">
                  <h3>Not copying anyone yet</h3>
                  <p>Discover top traders and start copying their trades</p>
                  <button onClick={() => setActiveView('discover')}>
                    Find Traders
                  </button>
                </div>
              )}
            </div>
          )}

          {activeView === 'history' && (
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Trader</th>
                    <th>Asset</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? history.map((trade, i) => (
                    <tr key={i}>
                      <td>{new Date(trade.executed_at).toLocaleString()}</td>
                      <td>{trade.trader_name}</td>
                      <td>{trade.symbol}</td>
                      <td className={trade.type}>{trade.type}</td>
                      <td>${trade.amount?.toLocaleString()}</td>
                      <td className={trade.pnl >= 0 ? 'positive' : 'negative'}>
                        ${trade.pnl?.toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="no-history">No copy trades yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
