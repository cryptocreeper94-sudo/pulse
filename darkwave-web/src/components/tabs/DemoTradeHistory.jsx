import { useState, useEffect } from 'react'
import './SniperBotTab.css'

const API_BASE = ''

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

function formatPrice(price) {
  if (price < 0.00001) return price.toExponential(2)
  if (price < 1) return price.toFixed(6)
  return price.toFixed(4)
}

export default function DemoTradeHistory({ sessionId, onClose, refreshKey }) {
  const [trades, setTrades] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTradeHistory()
  }, [sessionId, refreshKey])

  const fetchTradeHistory = async () => {
    if (!sessionId) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/demo/trades/${sessionId}`)
      const data = await res.json()
      if (data.success) {
        setTrades(data.trades || [])
        setStats(data.stats || null)
      }
    } catch (err) {
      console.error('Failed to fetch trade history:', err)
    }
    setLoading(false)
  }

  const closedTrades = trades.filter(t => t.status === 'closed' && t.action === 'sell')

  return (
    <div className="demo-trade-history">
      <div className="demo-history-header">
        <h3 className="demo-history-title">Trade History</h3>
        {onClose && (
          <button className="demo-history-close" onClick={onClose}>×</button>
        )}
      </div>

      {stats && (
        <div className="demo-stats-summary">
          <div className="demo-stats-grid">
            <div className="demo-stat-card">
              <div className="demo-stat-label">Total Trades</div>
              <div className="demo-stat-value cyan">{stats.totalTrades || 0}</div>
            </div>
            <div className="demo-stat-card">
              <div className="demo-stat-label">Win Rate</div>
              <div className={`demo-stat-value ${(stats.winRate || 0) >= 50 ? 'green' : 'red'}`}>
                {(stats.winRate || 0).toFixed(1)}%
              </div>
            </div>
            <div className="demo-stat-card">
              <div className="demo-stat-label">Total P&L</div>
              <div className={`demo-stat-value ${(stats.totalPnlSol || 0) >= 0 ? 'green' : 'red'}`}>
                {(stats.totalPnlSol || 0) >= 0 ? '+' : ''}${(stats.totalPnlSol || 0).toFixed(2)}
              </div>
            </div>
            <div className="demo-stat-card">
              <div className="demo-stat-label">Best Trade</div>
              <div className="demo-stat-value green">
                {stats.bestTrade ? `+${stats.bestTrade.toFixed(1)}%` : '--'}
              </div>
            </div>
            <div className="demo-stat-card">
              <div className="demo-stat-label">Worst Trade</div>
              <div className="demo-stat-value red">
                {stats.worstTrade ? `${stats.worstTrade.toFixed(1)}%` : '--'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="demo-trades-list">
        {loading ? (
          <div className="demo-loading">Loading trades...</div>
        ) : closedTrades.length > 0 ? (
          closedTrades.map((trade, i) => (
            <div key={trade.id || i} className={`demo-trade-item ${(trade.pnlSol || 0) >= 0 ? 'profit' : 'loss'}`}>
              <div className="demo-trade-row">
                <div className="demo-trade-token">
                  <div className="demo-trade-icon">
                    {trade.tokenSymbol?.slice(0, 2) || '??'}
                  </div>
                  <div className="demo-trade-info">
                    <div className="demo-trade-symbol">{trade.tokenSymbol}</div>
                    <div className="demo-trade-time">{formatTime(trade.timestamp)}</div>
                  </div>
                </div>
                <div className="demo-trade-pnl">
                  <div className={`demo-trade-pnl-percent ${(trade.pnlPercent || 0) >= 0 ? 'green' : 'red'}`}>
                    {(trade.pnlPercent || 0) >= 0 ? '+' : ''}{(trade.pnlPercent || 0).toFixed(2)}%
                  </div>
                  <div className={`demo-trade-pnl-amount ${(trade.pnlSol || 0) >= 0 ? 'green' : 'red'}`}>
                    {(trade.pnlSol || 0) >= 0 ? '+' : ''}${(trade.pnlSol || 0).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="demo-trade-prices">
                <div className="demo-trade-price">
                  <span className="demo-price-label">Entry</span>
                  <span className="demo-price-value">${formatPrice(trade.entryPrice || 0)}</span>
                </div>
                <div className="demo-trade-arrow">→</div>
                <div className="demo-trade-price">
                  <span className="demo-price-label">Exit</span>
                  <span className="demo-price-value">${formatPrice(trade.exitPrice || 0)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="demo-empty-trades">
            <div className="demo-empty-icon">📊</div>
            <div className="demo-empty-text">No closed trades yet</div>
            <div className="demo-empty-hint">Your completed trades will appear here</div>
          </div>
        )}
      </div>
    </div>
  )
}
