import { useState, useEffect, useCallback } from 'react'
import { BentoGrid, BentoItem } from '../ui'

const API_BASE = ''

const DEFAULT_CONFIG = {
  mode: 'simple',
  safetyFilters: {
    maxBotPercent: 80,
    maxBundlePercent: 50,
    maxTop10HoldersPercent: 80,
    minLiquidityUsd: 5000,
    checkCreatorWallet: true,
  },
  discoveryFilters: {
    minTokenAgeMinutes: 5,
    maxTokenAgeMinutes: 1440,
    minHolders: 50,
    minWatchers: 10,
  },
  movementFilters: {
    minPriceChangePercent: 1.5,
    movementTimeframeMinutes: 5,
    minVolumeMultiplier: 2,
    minTradesPerMinute: 5,
    minBuySellRatio: 1.2,
    minHolderGrowthPercent: 5,
  },
  dexPreferences: {
    enabledDexes: ['raydium', 'pumpfun', 'jupiter', 'orca', 'meteora'],
    preferredDex: 'jupiter',
  },
  tradeControls: {
    buyAmountSol: 0.5,
    slippagePercent: 5,
    priorityFee: 'auto',
    takeProfitPercent: 50,
    stopLossPercent: 20,
  },
  autoModeSettings: {
    maxTradesPerSession: 10,
    maxSolPerSession: 5,
    cooldownSeconds: 60,
    maxConsecutiveLosses: 3,
  },
}

export default function SniperBotTab() {
  const [mode, setMode] = useState('simple')
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [discoveredTokens, setDiscoveredTokens] = useState([])
  const [isScanning, setIsScanning] = useState(false)
  const [activeOrders, setActiveOrders] = useState([])
  const [positions, setPositions] = useState([])
  const [stats, setStats] = useState(null)
  const [solPrice, setSolPrice] = useState(0)
  const [selectedToken, setSelectedToken] = useState(null)
  const [autoModeActive, setAutoModeActive] = useState(false)

  useEffect(() => {
    fetchSolPrice()
    const interval = setInterval(fetchSolPrice, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchSolPrice = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sniper/sol-price`)
      const data = await res.json()
      if (data.price) setSolPrice(data.price)
    } catch (err) {
      console.error('Error fetching SOL price:', err)
    }
  }

  const discoverTokens = async () => {
    setIsScanning(true)
    try {
      const res = await fetch(`${API_BASE}/api/sniper/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      })
      const data = await res.json()
      setDiscoveredTokens(data.tokens || [])
    } catch (err) {
      console.error('Discovery error:', err)
    }
    setIsScanning(false)
  }

  const analyzeToken = async (tokenAddress) => {
    try {
      const res = await fetch(`${API_BASE}/api/sniper/analyze-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenAddress })
      })
      const data = await res.json()
      setSelectedToken(data)
    } catch (err) {
      console.error('Analysis error:', err)
    }
  }

  const updateConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const getScoreColor = (score) => {
    if (score >= 70) return '#39FF14'
    if (score >= 45) return '#FFD700'
    return '#FF4444'
  }

  const getRecommendationBadge = (rec) => {
    const styles = {
      snipe: { bg: 'rgba(57, 255, 20, 0.2)', border: '#39FF14', color: '#39FF14', text: '🎯 SNIPE' },
      watch: { bg: 'rgba(255, 215, 0, 0.2)', border: '#FFD700', color: '#FFD700', text: '👀 WATCH' },
      avoid: { bg: 'rgba(255, 68, 68, 0.2)', border: '#FF4444', color: '#FF4444', text: '⚠️ AVOID' },
    }
    const s = styles[rec] || styles.avoid
    return (
      <span style={{
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
      }}>
        {s.text}
      </span>
    )
  }

  return (
    <div className="sniper-bot-tab">
      <div className="section-box mb-md" style={{ 
        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(157, 78, 221, 0.1))',
        border: '1px solid rgba(0, 212, 255, 0.4)'
      }}>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                🎯 AI Sniper Bot
                <span style={{
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 600,
                  background: 'rgba(0, 212, 255, 0.2)',
                  border: '1px solid #00D4FF',
                  color: '#00D4FF',
                }}>BETA</span>
              </h2>
              <p style={{ color: '#888', fontSize: 13 }}>
                Set your parameters, let AI find opportunities
              </p>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setMode('simple')}
                style={{
                  padding: '6px 14px',
                  fontSize: 11,
                  fontWeight: mode === 'simple' ? 700 : 500,
                  background: mode === 'simple' ? '#00D4FF' : '#1a1a1a',
                  color: mode === 'simple' ? '#000' : '#888',
                  border: mode === 'simple' ? '1px solid #00D4FF' : '1px solid #333',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Simple
              </button>
              <button
                onClick={() => setMode('advanced')}
                style={{
                  padding: '6px 14px',
                  fontSize: 11,
                  fontWeight: mode === 'advanced' ? 700 : 500,
                  background: mode === 'advanced' ? '#9D4EDD' : '#1a1a1a',
                  color: mode === 'advanced' ? '#000' : '#888',
                  border: mode === 'advanced' ? '1px solid #9D4EDD' : '1px solid #333',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Advanced
              </button>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: 16, 
            marginTop: 16,
            padding: 12,
            background: '#0f0f0f',
            borderRadius: 8,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>SOL Price</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#00D4FF' }}>
                ${solPrice.toFixed(2)}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>Buy Amount</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {config.tradeControls.buyAmountSol} SOL
              </div>
              <div style={{ fontSize: 10, color: '#888' }}>
                ≈ ${(config.tradeControls.buyAmountSol * solPrice).toFixed(2)}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>Take Profit</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#39FF14' }}>
                +{config.tradeControls.takeProfitPercent}%
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>Stop Loss</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FF4444' }}>
                -{config.tradeControls.stopLossPercent}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <BentoGrid columns={mode === 'advanced' ? 2 : 1}>
        <BentoItem title="Token Discovery">
          <div style={{ padding: 12 }}>
            <button
              onClick={discoverTokens}
              disabled={isScanning}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: 700,
                background: isScanning ? '#333' : 'linear-gradient(135deg, #00D4FF, #9D4EDD)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: isScanning ? 'not-allowed' : 'pointer',
                marginBottom: 12,
              }}
            >
              {isScanning ? '🔍 Scanning...' : '🔍 Scan for Tokens'}
            </button>
            
            {discoveredTokens.length > 0 && (
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {discoveredTokens.map((token, i) => (
                  <div
                    key={token.address}
                    onClick={() => setSelectedToken(token)}
                    style={{
                      padding: 10,
                      background: selectedToken?.address === token.address ? '#1a1a1a' : '#0f0f0f',
                      border: selectedToken?.address === token.address ? '1px solid #00D4FF' : '1px solid #222',
                      borderRadius: 8,
                      marginBottom: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{token.symbol}</div>
                        <div style={{ fontSize: 10, color: '#888' }}>{token.name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: 16, 
                          fontWeight: 800,
                          color: getScoreColor(token.aiScore)
                        }}>
                          {token.aiScore}
                        </div>
                        {getRecommendationBadge(token.aiRecommendation)}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: 12, 
                      marginTop: 8, 
                      fontSize: 10, 
                      color: '#888' 
                    }}>
                      <span>💧 ${(token.liquidityUsd/1000).toFixed(1)}K</span>
                      <span>📈 {token.movementMetrics?.priceChangePercent?.toFixed(1)}%</span>
                      <span>🔥 {token.movementMetrics?.volumeMultiplier?.toFixed(1)}x vol</span>
                      <span style={{ color: token.dex === 'pumpfun' ? '#FF006E' : '#00D4FF' }}>
                        {token.dex}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {discoveredTokens.length === 0 && !isScanning && (
              <div style={{ 
                textAlign: 'center', 
                padding: 24, 
                color: '#555',
                fontSize: 12,
              }}>
                Click "Scan for Tokens" to find opportunities matching your filters
              </div>
            )}
          </div>
        </BentoItem>

        {mode === 'advanced' && (
          <BentoItem title="Filter Settings">
            <div style={{ padding: 12, fontSize: 11 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: '#00D4FF', fontWeight: 700, marginBottom: 8 }}>
                  🛡️ Safety Filters
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: '#888' }}>Max Bot %</span>
                    <input
                      type="number"
                      value={config.safetyFilters.maxBotPercent}
                      onChange={(e) => updateConfig('safetyFilters', 'maxBotPercent', parseInt(e.target.value))}
                      style={{
                        padding: '6px 8px',
                        background: '#0f0f0f',
                        border: '1px solid #333',
                        borderRadius: 4,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: '#888' }}>Max Top 10 %</span>
                    <input
                      type="number"
                      value={config.safetyFilters.maxTop10HoldersPercent}
                      onChange={(e) => updateConfig('safetyFilters', 'maxTop10HoldersPercent', parseInt(e.target.value))}
                      style={{
                        padding: '6px 8px',
                        background: '#0f0f0f',
                        border: '1px solid #333',
                        borderRadius: 4,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: '#888' }}>Min Liquidity $</span>
                    <input
                      type="number"
                      value={config.safetyFilters.minLiquidityUsd}
                      onChange={(e) => updateConfig('safetyFilters', 'minLiquidityUsd', parseInt(e.target.value))}
                      style={{
                        padding: '6px 8px',
                        background: '#0f0f0f',
                        border: '1px solid #333',
                        borderRadius: 4,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
                    <input
                      type="checkbox"
                      checked={config.safetyFilters.checkCreatorWallet}
                      onChange={(e) => updateConfig('safetyFilters', 'checkCreatorWallet', e.target.checked)}
                    />
                    <span style={{ color: '#888' }}>Check Creator</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ color: '#39FF14', fontWeight: 700, marginBottom: 8 }}>
                  📈 Movement Filters
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: '#888' }}>Min Price Change %</span>
                    <input
                      type="number"
                      step="0.1"
                      value={config.movementFilters.minPriceChangePercent}
                      onChange={(e) => updateConfig('movementFilters', 'minPriceChangePercent', parseFloat(e.target.value))}
                      style={{
                        padding: '6px 8px',
                        background: '#0f0f0f',
                        border: '1px solid #333',
                        borderRadius: 4,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: '#888' }}>Min Volume X</span>
                    <input
                      type="number"
                      step="0.5"
                      value={config.movementFilters.minVolumeMultiplier}
                      onChange={(e) => updateConfig('movementFilters', 'minVolumeMultiplier', parseFloat(e.target.value))}
                      style={{
                        padding: '6px 8px',
                        background: '#0f0f0f',
                        border: '1px solid #333',
                        borderRadius: 4,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: '#888' }}>Min Trades/Min</span>
                    <input
                      type="number"
                      value={config.movementFilters.minTradesPerMinute}
                      onChange={(e) => updateConfig('movementFilters', 'minTradesPerMinute', parseInt(e.target.value))}
                      style={{
                        padding: '6px 8px',
                        background: '#0f0f0f',
                        border: '1px solid #333',
                        borderRadius: 4,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: '#888' }}>Min Buy/Sell Ratio</span>
                    <input
                      type="number"
                      step="0.1"
                      value={config.movementFilters.minBuySellRatio}
                      onChange={(e) => updateConfig('movementFilters', 'minBuySellRatio', parseFloat(e.target.value))}
                      style={{
                        padding: '6px 8px',
                        background: '#0f0f0f',
                        border: '1px solid #333',
                        borderRadius: 4,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <div style={{ color: '#9D4EDD', fontWeight: 700, marginBottom: 8 }}>
                  💰 Trade Controls
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: '#888' }}>Buy Amount (SOL)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={config.tradeControls.buyAmountSol}
                      onChange={(e) => updateConfig('tradeControls', 'buyAmountSol', parseFloat(e.target.value))}
                      style={{
                        padding: '6px 8px',
                        background: '#0f0f0f',
                        border: '1px solid #333',
                        borderRadius: 4,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: '#888' }}>Slippage %</span>
                    <input
                      type="number"
                      value={config.tradeControls.slippagePercent}
                      onChange={(e) => updateConfig('tradeControls', 'slippagePercent', parseInt(e.target.value))}
                      style={{
                        padding: '6px 8px',
                        background: '#0f0f0f',
                        border: '1px solid #333',
                        borderRadius: 4,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: '#888' }}>Take Profit %</span>
                    <input
                      type="number"
                      value={config.tradeControls.takeProfitPercent}
                      onChange={(e) => updateConfig('tradeControls', 'takeProfitPercent', parseInt(e.target.value))}
                      style={{
                        padding: '6px 8px',
                        background: '#0f0f0f',
                        border: '1px solid #333',
                        borderRadius: 4,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: '#888' }}>Stop Loss %</span>
                    <input
                      type="number"
                      value={config.tradeControls.stopLossPercent}
                      onChange={(e) => updateConfig('tradeControls', 'stopLossPercent', parseInt(e.target.value))}
                      style={{
                        padding: '6px 8px',
                        background: '#0f0f0f',
                        border: '1px solid #333',
                        borderRadius: 4,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </BentoItem>
        )}
      </BentoGrid>

      {selectedToken && (
        <div className="section-box" style={{ marginTop: 16 }}>
          <div className="section-header">
            <h3 className="section-title">Selected: {selectedToken.symbol}</h3>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: '#888' }}>Price</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  ${selectedToken.priceUsd?.toFixed(8) || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#888' }}>Liquidity</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#00D4FF' }}>
                  ${((selectedToken.liquidityUsd || 0)/1000).toFixed(1)}K
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#888' }}>AI Score</div>
                <div style={{ 
                  fontSize: 16, 
                  fontWeight: 700, 
                  color: getScoreColor(selectedToken.aiScore || 0) 
                }}>
                  {selectedToken.aiScore || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#888' }}>DEX</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {selectedToken.dex || 'Unknown'}
                </div>
              </div>
            </div>
            
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              background: '#0f0f0f', 
              borderRadius: 8,
              border: '1px solid #222',
            }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
                🤖 AI Analysis
              </div>
              <div style={{ fontSize: 12 }}>
                {selectedToken.aiReasoning || 'No analysis available'}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: 12,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #39FF14, #00D4FF)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                🎯 Snipe Now
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: 12,
                  fontWeight: 700,
                  background: '#1a1a1a',
                  color: '#888',
                  border: '1px solid #333',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                👀 Add to Watch
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="section-box" style={{ marginTop: 16 }}>
        <div className="section-header">
          <h3 className="section-title">Smart Auto Mode</h3>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Autonomous Sniping</div>
              <div style={{ fontSize: 11, color: '#888' }}>
                Bot will automatically execute trades based on your filters
              </div>
            </div>
            <button
              onClick={() => setAutoModeActive(!autoModeActive)}
              style={{
                padding: '10px 24px',
                fontSize: 12,
                fontWeight: 700,
                background: autoModeActive ? '#FF4444' : '#39FF14',
                color: '#000',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              {autoModeActive ? '⏹ STOP' : '▶️ START'}
            </button>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 12,
            padding: 12,
            background: '#0f0f0f',
            borderRadius: 8,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#888' }}>Max Trades</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {config.autoModeSettings.maxTradesPerSession}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#888' }}>Max SOL</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#00D4FF' }}>
                {config.autoModeSettings.maxSolPerSession}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#888' }}>Cooldown</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {config.autoModeSettings.cooldownSeconds}s
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#888' }}>Auto-Stop</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FF4444' }}>
                {config.autoModeSettings.maxConsecutiveLosses} losses
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
