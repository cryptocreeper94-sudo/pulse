import { useState, useEffect } from 'react'
import './ArbitrageTab.css'

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : ''

export default function ArbitrageTab({ userId }) {
  const [activeView, setActiveView] = useState('cex')
  const [opportunities, setOpportunities] = useState([])
  const [dexOpportunities, setDexOpportunities] = useState([])
  const [triangular, setTriangular] = useState([])
  const [loading, setLoading] = useState(true)
  const [minSpread, setMinSpread] = useState(0.5)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetchOpportunities()
    const interval = setInterval(fetchOpportunities, 30000)
    return () => clearInterval(interval)
  }, [activeView, minSpread])

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      if (activeView === 'cex') {
        const res = await fetch(`${API_BASE}/api/arbitrage/opportunities?minSpread=${minSpread}`)
        const data = await res.json()
        setOpportunities(data.opportunities || [])
        setLastUpdated(data.lastUpdated)
      } else if (activeView === 'dex') {
        const res = await fetch(`${API_BASE}/api/arbitrage/dex-opportunities`)
        const data = await res.json()
        setDexOpportunities(data.opportunities || [])
      } else if (activeView === 'triangular') {
        const res = await fetch(`${API_BASE}/api/arbitrage/triangular`)
        const data = await res.json()
        setTriangular(data.opportunities || [])
      }
    } catch (error) {
      console.error('Failed to fetch opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="arbitrage-tab">
      <div className="arbitrage-header">
        <div className="header-text">
          <h1>Arbitrage Scanner</h1>
          <p>Find price differences across exchanges</p>
        </div>
        <div className="header-controls">
          <div className="min-spread-control">
            <label>Min Spread</label>
            <input 
              type="number" 
              value={minSpread} 
              onChange={(e) => setMinSpread(parseFloat(e.target.value))}
              step="0.1"
              min="0"
            />
            <span>%</span>
          </div>
          <button className="refresh-btn" onClick={fetchOpportunities}>
            Refresh
          </button>
        </div>
      </div>

      <div className="arbitrage-nav">
        <button 
          className={activeView === 'cex' ? 'active' : ''} 
          onClick={() => setActiveView('cex')}
        >
          CEX Arbitrage
        </button>
        <button 
          className={activeView === 'dex' ? 'active' : ''} 
          onClick={() => setActiveView('dex')}
        >
          DEX Arbitrage
        </button>
        <button 
          className={activeView === 'triangular' ? 'active' : ''} 
          onClick={() => setActiveView('triangular')}
        >
          Triangular
        </button>
      </div>

      {lastUpdated && (
        <div className="last-updated">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}

      {loading ? (
        <div className="arbitrage-loading">Scanning for opportunities...</div>
      ) : (
        <div className="arbitrage-content">
          {activeView === 'cex' && (
            <div className="opportunities-table-container">
              <table className="opportunities-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Buy Exchange</th>
                    <th>Buy Price</th>
                    <th>Sell Exchange</th>
                    <th>Sell Price</th>
                    <th>Spread</th>
                    <th>Profit ($100)</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.length > 0 ? opportunities.map((opp, i) => (
                    <tr key={i}>
                      <td className="symbol">{opp.symbol}</td>
                      <td className="exchange buy">{opp.buyExchange}</td>
                      <td>${parseFloat(opp.buyPrice).toLocaleString()}</td>
                      <td className="exchange sell">{opp.sellExchange}</td>
                      <td>${parseFloat(opp.sellPrice).toLocaleString()}</td>
                      <td className="spread">{opp.spreadPercent}%</td>
                      <td className="profit">${opp.potentialProfit}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="no-opportunities">
                        No arbitrage opportunities found above {minSpread}% spread
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeView === 'dex' && (
            <div className="dex-opportunities">
              {dexOpportunities.length > 0 ? dexOpportunities.map((opp, i) => (
                <div key={i} className="dex-card">
                  <div className="dex-header">
                    <span className="symbol">{opp.symbol}</span>
                    <span className="chain">{opp.chain}</span>
                  </div>
                  <div className="dex-route">
                    <div className="route-step buy">
                      <span>Buy on</span>
                      <strong>{opp.buyDex}</strong>
                      <span className="price">${opp.buyPrice}</span>
                    </div>
                    <div className="route-arrow">→</div>
                    <div className="route-step sell">
                      <span>Sell on</span>
                      <strong>{opp.sellDex}</strong>
                      <span className="price">${opp.sellPrice}</span>
                    </div>
                  </div>
                  <div className="dex-profit">
                    <span>Spread</span>
                    <strong>{opp.spreadPercent}%</strong>
                  </div>
                </div>
              )) : (
                <div className="no-dex">No DEX arbitrage opportunities found</div>
              )}
            </div>
          )}

          {activeView === 'triangular' && (
            <div className="triangular-opportunities">
              {triangular.length > 0 ? triangular.map((opp, i) => (
                <div key={i} className="triangular-card">
                  <div className="triangular-path">
                    <span className="path-label">Path</span>
                    <span className="path-route">{opp.path}</span>
                  </div>
                  <div className="triangular-details">
                    <div className="detail">
                      <span>Exchange</span>
                      <strong>{opp.exchange}</strong>
                    </div>
                    <div className="detail">
                      <span>Est. Profit</span>
                      <strong className="profit">{opp.estimatedProfit}</strong>
                    </div>
                    <div className="detail">
                      <span>Capital</span>
                      <strong>{opp.requiredCapital}</strong>
                    </div>
                    <div className="detail">
                      <span>Gas</span>
                      <strong>{opp.gasEstimate}</strong>
                    </div>
                  </div>
                  <div className="complexity">
                    Complexity: <span className={opp.complexity.toLowerCase()}>{opp.complexity}</span>
                  </div>
                </div>
              )) : (
                <div className="no-triangular">No triangular opportunities found</div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="arbitrage-disclaimer">
        Prices are indicative only. Actual execution prices may vary due to slippage, fees, and market movement.
        Always verify prices on exchanges before trading.
      </div>
    </div>
  )
}
