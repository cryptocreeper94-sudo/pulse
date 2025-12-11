import { useState, useEffect, useRef, useCallback } from 'react'
import { createChart } from 'lightweight-charts'
import BentoGrid, { BentoItem } from '../ui/BentoGrid'
import { useWalletState } from '../../context/WalletContext'
import { useBuiltInWallet } from '../../context/BuiltInWalletContext'
import ManualWatchlist from '../trading/ManualWatchlist'
import SafetyReport from '../trading/SafetyReport'
import DemoTradeHistory from './DemoTradeHistory'
import DemoLeadCapture from './DemoLeadCapture'
import DemoUpgradeCTA from './DemoUpgradeCTA'
import './SniperBotTab.css'

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

function LiveCandleChart({ tokenSymbol, priceData, entryPrice, takeProfitPrice, stopLossPrice }) {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#0a0a0a' },
        textColor: '#888',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.03)' },
        horzLines: { color: 'rgba(255,255,255,0.03)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 180,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#222',
      },
      rightPriceScale: {
        borderColor: '#222',
      },
      crosshair: {
        mode: 1,
        vertLine: { color: 'rgba(0, 212, 255, 0.3)', width: 1, style: 2 },
        horzLine: { color: 'rgba(0, 212, 255, 0.3)', width: 1, style: 2 },
      },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#39FF14',
      downColor: '#FF4444',
      borderUpColor: '#39FF14',
      borderDownColor: '#FF4444',
      wickUpColor: '#39FF14',
      wickDownColor: '#FF4444',
    })

    if (entryPrice) {
      candleSeries.createPriceLine({
        price: entryPrice,
        color: '#00D4FF',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'ENTRY',
      })
    }

    if (takeProfitPrice) {
      candleSeries.createPriceLine({
        price: takeProfitPrice,
        color: '#39FF14',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'TP',
      })
    }

    if (stopLossPrice) {
      candleSeries.createPriceLine({
        price: stopLossPrice,
        color: '#FF4444',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'SL',
      })
    }

    chartRef.current = chart
    candleSeriesRef.current = candleSeries

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [entryPrice, takeProfitPrice, stopLossPrice])

  useEffect(() => {
    if (candleSeriesRef.current && priceData?.length > 0) {
      candleSeriesRef.current.setData(priceData)
    }
  }, [priceData])

  return (
    <div className="sniper-chart-container">
      <div className="sniper-chart-header">
        <span className="sniper-chart-symbol">{tokenSymbol || 'SELECT TOKEN'}</span>
        <span className="sniper-chart-timeframe">1s</span>
      </div>
      <div ref={chartContainerRef} className="sniper-chart-canvas" />
    </div>
  )
}

function SessionStatsCard({ stats, isActive }) {
  return (
    <div className="section-box sniper-stats-card">
      <div className="sniper-stats-header">
        <div className="sniper-status-indicator">
          <span className={`sniper-status-dot ${isActive ? 'active' : ''}`} />
          <span className="sniper-status-text">
            {isActive ? 'SESSION ACTIVE' : 'SESSION IDLE'}
          </span>
        </div>
      </div>
      <div className="sniper-stats-grid">
        <div className="sniper-stat-item">
          <div className="sniper-stat-label">TRADES</div>
          <div className="sniper-stat-value cyan">
            {stats?.tradesExecuted || 0}
            <span className="sniper-stat-max">/{stats?.maxTrades || 10}</span>
          </div>
        </div>
        <div className="sniper-stat-item">
          <div className="sniper-stat-label">WIN RATE</div>
          <div className={`sniper-stat-value ${(stats?.winRate || 0) >= 50 ? 'green' : 'red'}`}>
            {(stats?.winRate || 0).toFixed(0)}%
          </div>
        </div>
        <div className="sniper-stat-item">
          <div className="sniper-stat-label">SOL USED</div>
          <div className="sniper-stat-value cyan">
            {(stats?.solUsed || 0).toFixed(2)}
            <span className="sniper-stat-max">/{stats?.maxSol || 5}</span>
          </div>
        </div>
        <div className="sniper-stat-item">
          <div className="sniper-stat-label">P&L</div>
          <div className={`sniper-stat-value ${(stats?.totalPnl || 0) >= 0 ? 'green' : 'red'}`}>
            {(stats?.totalPnl || 0) >= 0 ? '+' : ''}{(stats?.totalPnl || 0).toFixed(3)}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivePositionCard({ position, onClose }) {
  const pnlPercent = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100
  const isProfit = pnlPercent >= 0
  const pnlSol = position.amountSol * (pnlPercent / 100)

  return (
    <div className={`section-box sniper-position-card ${isProfit ? 'profit' : 'loss'}`}>
      <div className="sniper-position-header">
        <div className="sniper-position-token">
          <div className="sniper-token-icon">
            {position.symbol?.slice(0, 2) || '??'}
          </div>
          <div className="sniper-token-info">
            <div className="sniper-token-symbol">{position.symbol}</div>
            <div className="sniper-token-meta">via {position.dex} • {position.age}</div>
          </div>
        </div>
        <div className="sniper-position-pnl">
          <div className={`sniper-pnl-percent ${isProfit ? 'green' : 'red'}`}>
            {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
          </div>
          <div className={`sniper-pnl-sol ${isProfit ? 'green' : 'red'}`}>
            {isProfit ? '+' : ''}{pnlSol.toFixed(4)} SOL
          </div>
        </div>
      </div>
      <div className="sniper-position-prices">
        <div className="sniper-price-item">
          <span className="sniper-price-label">Entry</span>
          <span className="sniper-price-value">${position.entryPrice?.toFixed(8)}</span>
        </div>
        <div className="sniper-price-item">
          <span className="sniper-price-label">Current</span>
          <span className="sniper-price-value">${position.currentPrice?.toFixed(8)}</span>
        </div>
      </div>
      <div className="sniper-position-actions">
        <button className="sniper-btn-close" onClick={() => onClose(position.id, 'manual')}>
          Close Position
        </button>
        <button className="sniper-btn-adjust">Adjust TP/SL</button>
      </div>
    </div>
  )
}

function getSafetyGradeColor(grade) {
  switch(grade) {
    case 'A': return '#39FF14'
    case 'B': return '#7CFC00'
    case 'C': return '#FFD700'
    case 'D': return '#FF8C00'
    case 'F': return '#FF4444'
    default: return '#888'
  }
}

function DiscoveredTokenCard({ token, onSnipe, onWatch, onSafetyCheck, disabled, isDemoMode }) {
  const gradeColor = getSafetyGradeColor(token.safetyGrade)
  const dexColor = token.dex === 'pumpfun' ? '#FF69B4' : token.dex === 'raydium' ? '#9D4EDD' : '#00D4FF'

  return (
    <div className="section-box sniper-token-card">
      <div className="sniper-token-row">
        <div className="sniper-token-left">
          <div className="sniper-safety-badge" style={{ '--grade-color': gradeColor }}>
            <span className="sniper-grade-value">{token.safetyGrade || '?'}</span>
            <span className="sniper-grade-score">{token.safetyScore || 0}</span>
          </div>
          <div className="sniper-token-details">
            <div className="sniper-token-name">{token.symbol}</div>
            <div className="sniper-token-fullname">{token.name?.slice(0, 20)}</div>
            <div className="sniper-token-dex" style={{ color: dexColor }}>{token.dex}</div>
          </div>
        </div>
        <div className="sniper-token-right">
          <div className="sniper-token-price">${token.price < 0.01 ? token.price.toExponential(2) : token.price?.toFixed(4)}</div>
          <div className={`sniper-token-change ${(token.priceChange24h || 0) >= 0 ? 'green' : 'red'}`}>
            {(token.priceChange24h || 0) >= 0 ? '+' : ''}{(token.priceChange24h || 0).toFixed(1)}%
          </div>
        </div>
      </div>
      <div className="sniper-token-metrics">
        <div className="sniper-metric">
          <span className="sniper-metric-label">Liq</span>
          <span className="sniper-metric-value">${((token.liquidity || 0) / 1000).toFixed(1)}K</span>
        </div>
        <div className="sniper-metric">
          <span className="sniper-metric-label">24h Vol</span>
          <span className="sniper-metric-value">${((token.volume || 0) / 1000).toFixed(1)}K</span>
        </div>
        <div className="sniper-metric">
          <span className="sniper-metric-label">FDV</span>
          <span className="sniper-metric-value">${((token.fdv || 0) / 1000000).toFixed(2)}M</span>
        </div>
      </div>
      {token.risks && token.risks.length > 0 && (
        <div className="sniper-token-risks">
          {token.risks.slice(0, 2).map((risk, i) => (
            <span key={i} className="sniper-risk-tag">⚠️ {risk}</span>
          ))}
        </div>
      )}
      <div className="sniper-token-actions">
        <button 
          className="sniper-btn-snipe" 
          onClick={() => onSnipe(token)}
          disabled={disabled && !isDemoMode}
        >
          {disabled && !isDemoMode ? 'Connect Wallet' : '🎯 BUY'}
        </button>
        <button className="sniper-btn-watch" onClick={() => onWatch(token)}>👁️</button>
        <button 
          className="sniper-btn-safety" 
          onClick={() => onSafetyCheck && onSafetyCheck(token)}
          title="Run Safety Check"
        >
          🛡️
        </button>
      </div>
    </div>
  )
}

function DemoPositionCard({ position, onSell, currentPrice }) {
  const pnlPercent = position.pnlPercent || ((currentPrice - position.entryPriceUsd) / position.entryPriceUsd) * 100
  const isProfit = pnlPercent >= 0
  const currentValue = position.tokenAmount * (currentPrice || position.currentPriceUsd || position.entryPriceUsd)
  const pnlAmount = currentValue - position.entryPriceSol

  return (
    <div className={`section-box demo-position-card ${isProfit ? 'profit' : 'loss'}`}>
      <div className="demo-position-header">
        <div className="demo-position-token">
          <div className="demo-position-icon">
            {position.tokenSymbol?.slice(0, 2) || '??'}
          </div>
          <div className="demo-position-info">
            <div className="demo-position-symbol">{position.tokenSymbol}</div>
            <div className="demo-position-name">{position.tokenName?.slice(0, 15)}</div>
          </div>
        </div>
        <div className="demo-position-pnl">
          <div className={`demo-pnl-percent ${isProfit ? 'green' : 'red'}`}>
            {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
          </div>
          <div className={`demo-pnl-amount ${isProfit ? 'green' : 'red'}`}>
            {isProfit ? '+' : ''}${pnlAmount.toFixed(2)}
          </div>
        </div>
      </div>
      <div className="demo-position-prices">
        <div className="demo-price-item">
          <span className="demo-price-label">Entry</span>
          <span className="demo-price-value">${position.entryPriceUsd < 0.01 ? position.entryPriceUsd.toExponential(2) : position.entryPriceUsd?.toFixed(6)}</span>
        </div>
        <div className="demo-price-item">
          <span className="demo-price-label">Current</span>
          <span className="demo-price-value">${(currentPrice || position.currentPriceUsd || position.entryPriceUsd) < 0.01 ? (currentPrice || position.currentPriceUsd || position.entryPriceUsd).toExponential(2) : (currentPrice || position.currentPriceUsd || position.entryPriceUsd)?.toFixed(6)}</span>
        </div>
        <div className="demo-price-item">
          <span className="demo-price-label">Value</span>
          <span className="demo-price-value">${currentValue.toFixed(2)}</span>
        </div>
      </div>
      <button 
        className="demo-sell-btn"
        onClick={() => onSell(position, currentPrice || position.currentPriceUsd || position.entryPriceUsd)}
      >
        💰 SELL
      </button>
    </div>
  )
}

function SmartAutoModePanel({ isActive, onToggle, config, disabled }) {
  return (
    <div className={`section-box sniper-automode-panel ${disabled ? 'disabled' : ''}`}>
      <div className="sniper-automode-header">
        <div>
          <h4 className="sniper-automode-title">Smart Auto Mode</h4>
          <p className="sniper-automode-desc">
            {disabled ? 'Connect wallet to enable' : 'AI-powered autonomous trading'}
          </p>
        </div>
        <button 
          className={`sniper-automode-btn ${isActive ? 'active' : ''}`}
          onClick={onToggle}
          disabled={disabled}
        >
          {isActive ? 'STOP' : 'START'}
        </button>
      </div>
      <div className="sniper-automode-limits">
        <div className="sniper-limit-item">
          <span className="sniper-limit-label">Max Trades</span>
          <span className="sniper-limit-value">{config?.autoModeSettings?.maxTradesPerSession || 10}</span>
        </div>
        <div className="sniper-limit-item">
          <span className="sniper-limit-label">Max SOL</span>
          <span className="sniper-limit-value">{config?.autoModeSettings?.maxSolPerSession || 5}</span>
        </div>
        <div className="sniper-limit-item">
          <span className="sniper-limit-label">Cooldown</span>
          <span className="sniper-limit-value">{config?.autoModeSettings?.cooldownSeconds || 60}s</span>
        </div>
        <div className="sniper-limit-item">
          <span className="sniper-limit-label">Auto-Stop</span>
          <span className="sniper-limit-value">{config?.autoModeSettings?.maxConsecutiveLosses || 3} losses</span>
        </div>
      </div>
    </div>
  )
}

function BuiltInWalletUnlock({ onUnlock, loading }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleUnlock = async () => {
    if (!password) {
      setError('Please enter your password')
      return
    }
    setError('')
    try {
      await onUnlock(password)
    } catch (err) {
      setError(err.message || 'Invalid password')
    }
  }

  return (
    <div className="sniper-wallet-unlock-form">
      <p>Enter password to unlock your built-in wallet:</p>
      <div className="sniper-unlock-row">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Wallet password"
          className="sniper-unlock-input"
          onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
        />
        <button
          className="sniper-unlock-btn"
          onClick={handleUnlock}
          disabled={loading}
        >
          {loading ? 'Unlocking...' : 'Unlock'}
        </button>
      </div>
      {error && <p className="sniper-unlock-error">{error}</p>}
    </div>
  )
}

function QuickSettingsPanel({ config, updateConfig, expanded, onToggle }) {
  return (
    <div className="section-box sniper-settings-panel">
      <button className="sniper-accordion-header" onClick={onToggle}>
        <span className="sniper-accordion-title">Quick Settings</span>
        <span className={`sniper-accordion-arrow ${expanded ? 'expanded' : ''}`}>▼</span>
      </button>
      {expanded && (
        <div className="sniper-settings-grid">
          <label className="sniper-setting-item">
            <span className="sniper-setting-label">Buy Amount (SOL)</span>
            <input
              type="number"
              step="0.1"
              value={config.tradeControls.buyAmountSol}
              onChange={(e) => updateConfig('tradeControls', 'buyAmountSol', parseFloat(e.target.value))}
              className="sniper-input"
            />
          </label>
          <label className="sniper-setting-item">
            <span className="sniper-setting-label">Slippage %</span>
            <input
              type="number"
              value={config.tradeControls.slippagePercent}
              onChange={(e) => updateConfig('tradeControls', 'slippagePercent', parseInt(e.target.value))}
              className="sniper-input"
            />
          </label>
          <label className="sniper-setting-item">
            <span className="sniper-setting-label">Take Profit %</span>
            <input
              type="number"
              value={config.tradeControls.takeProfitPercent}
              onChange={(e) => updateConfig('tradeControls', 'takeProfitPercent', parseInt(e.target.value))}
              className="sniper-input"
            />
          </label>
          <label className="sniper-setting-item">
            <span className="sniper-setting-label">Stop Loss %</span>
            <input
              type="number"
              value={config.tradeControls.stopLossPercent}
              onChange={(e) => updateConfig('tradeControls', 'stopLossPercent', parseInt(e.target.value))}
              className="sniper-input"
            />
          </label>
        </div>
      )}
    </div>
  )
}

function SafetyFiltersPanel({ config, updateConfig, expanded, onToggle }) {
  return (
    <div className="section-box sniper-settings-panel">
      <button className="sniper-accordion-header" onClick={onToggle}>
        <span className="sniper-accordion-title">Safety Filters</span>
        <span className={`sniper-accordion-arrow ${expanded ? 'expanded' : ''}`}>▼</span>
      </button>
      {expanded && (
        <div className="sniper-settings-grid">
          <label className="sniper-setting-item">
            <span className="sniper-setting-label">Max Bot %</span>
            <input
              type="number"
              value={config.safetyFilters.maxBotPercent}
              onChange={(e) => updateConfig('safetyFilters', 'maxBotPercent', parseInt(e.target.value))}
              className="sniper-input"
            />
          </label>
          <label className="sniper-setting-item">
            <span className="sniper-setting-label">Max Bundle %</span>
            <input
              type="number"
              value={config.safetyFilters.maxBundlePercent}
              onChange={(e) => updateConfig('safetyFilters', 'maxBundlePercent', parseInt(e.target.value))}
              className="sniper-input"
            />
          </label>
          <label className="sniper-setting-item">
            <span className="sniper-setting-label">Max Top10 %</span>
            <input
              type="number"
              value={config.safetyFilters.maxTop10HoldersPercent}
              onChange={(e) => updateConfig('safetyFilters', 'maxTop10HoldersPercent', parseInt(e.target.value))}
              className="sniper-input"
            />
          </label>
          <label className="sniper-setting-item">
            <span className="sniper-setting-label">Min Liquidity $</span>
            <input
              type="number"
              value={config.safetyFilters.minLiquidityUsd}
              onChange={(e) => updateConfig('safetyFilters', 'minLiquidityUsd', parseInt(e.target.value))}
              className="sniper-input"
            />
          </label>
        </div>
      )}
    </div>
  )
}

function RPCSettingsPanel({ rpcStatus, customRPC, setCustomRPC, onSaveCustomRPC, expanded, onToggle }) {
  const getStatusColor = (status) => {
    if (status === 'healthy') return '#39FF14'
    if (status === 'degraded') return '#FFD700'
    return '#FF4444'
  }

  return (
    <div className="section-box sniper-settings-panel">
      <button className="sniper-accordion-header" onClick={onToggle}>
        <span className="sniper-accordion-title">RPC Configuration</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span 
            className="sniper-rpc-badge"
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '9px',
              fontWeight: 700,
              background: rpcStatus?.type === 'helius' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(157, 78, 221, 0.2)',
              color: rpcStatus?.type === 'helius' ? '#00D4FF' : '#9D4EDD',
              border: `1px solid ${rpcStatus?.type === 'helius' ? 'rgba(0, 212, 255, 0.4)' : 'rgba(157, 78, 221, 0.4)'}`,
            }}
          >
            {rpcStatus?.active || 'Loading...'}
          </span>
          <span className={`sniper-accordion-arrow ${expanded ? 'expanded' : ''}`}>▼</span>
        </div>
      </button>
      {expanded && (
        <div style={{ padding: '0 16px 16px' }}>
          <div className="sniper-rpc-status" style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '16px', 
            marginBottom: '16px',
            padding: '12px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
          }}>
            <div>
              <div style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase' }}>Status</div>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                color: getStatusColor(rpcStatus?.status),
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: getStatusColor(rpcStatus?.status),
                  boxShadow: `0 0 8px ${getStatusColor(rpcStatus?.status)}`,
                }} />
                {rpcStatus?.status?.toUpperCase() || 'CHECKING'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase' }}>Latency</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                {rpcStatus?.latencyMs ? `${rpcStatus.latencyMs}ms` : '--'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase' }}>Type</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#00D4FF' }}>
                {rpcStatus?.type === 'helius' ? 'Premium (Helius)' : rpcStatus?.type === 'custom' ? 'Custom' : 'Public'}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', color: '#666' }}>Custom RPC Endpoint (Optional)</span>
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="https://your-rpc-endpoint.com"
                value={customRPC}
                onChange={(e) => setCustomRPC(e.target.value)}
                className="sniper-input"
                style={{ flex: 1, minWidth: '200px' }}
              />
              <button
                onClick={onSaveCustomRPC}
                style={{
                  padding: '10px 16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: customRPC ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 68, 68, 0.15)',
                  color: customRPC ? '#00D4FF' : '#FF4444',
                  border: `1px solid ${customRPC ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255, 68, 68, 0.4)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {customRPC ? 'Set Custom RPC' : 'Use Default'}
              </button>
            </div>
            <div style={{ fontSize: '10px', color: '#444', marginTop: '6px' }}>
              Power users can use their own Helius, QuickNode, or Triton endpoint for faster execution
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SniperBotTab() {
  const externalWallet = useWalletState()
  const builtInWallet = useBuiltInWallet()
  const [walletSource, setWalletSource] = useState('external')
  const [mode, setMode] = useState('simple')
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [discoveredTokens, setDiscoveredTokens] = useState([])
  const [isScanning, setIsScanning] = useState(false)
  const [activePositions, setActivePositions] = useState([])
  const [stats, setStats] = useState({ tradesExecuted: 0, winRate: 0, solUsed: 0, totalPnl: 0, maxTrades: 10, maxSol: 5 })
  const [solPrice, setSolPrice] = useState(0)
  const [autoModeActive, setAutoModeActive] = useState(false)
  const [scanInterval, setScanInterval] = useState(null)
  const [expandedSettings, setExpandedSettings] = useState(false)
  const [expandedSafety, setExpandedSafety] = useState(false)
  const [expandedRPC, setExpandedRPC] = useState(false)
  const [rpcStatus, setRpcStatus] = useState(null)
  const [customRPC, setCustomRPC] = useState('')
  const [safetyCheckToken, setSafetyCheckToken] = useState(null)
  const [selectedChain, setSelectedChain] = useState('solana')
  const [availableChains] = useState([
    { id: 'solana', name: 'Solana', symbol: 'SOL', isEvm: false },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', isEvm: true },
    { id: 'base', name: 'Base', symbol: 'ETH', isEvm: true },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC', isEvm: true },
    { id: 'arbitrum', name: 'Arbitrum', symbol: 'ETH', isEvm: true },
    { id: 'bsc', name: 'BSC', symbol: 'BNB', isEvm: true },
    { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', isEvm: true },
    { id: 'fantom', name: 'Fantom', symbol: 'FTM', isEvm: true },
    { id: 'optimism', name: 'Optimism', symbol: 'ETH', isEvm: true },
    { id: 'cronos', name: 'Cronos', symbol: 'CRO', isEvm: true },
    { id: 'gnosis', name: 'Gnosis', symbol: 'xDAI', isEvm: true },
    { id: 'celo', name: 'Celo', symbol: 'CELO', isEvm: true },
    { id: 'moonbeam', name: 'Moonbeam', symbol: 'GLMR', isEvm: true },
    { id: 'moonriver', name: 'Moonriver', symbol: 'MOVR', isEvm: true },
    { id: 'harmony', name: 'Harmony', symbol: 'ONE', isEvm: true },
    { id: 'metis', name: 'Metis', symbol: 'METIS', isEvm: true },
    { id: 'aurora', name: 'Aurora', symbol: 'ETH', isEvm: true },
    { id: 'zksync', name: 'zkSync', symbol: 'ETH', isEvm: true },
    { id: 'linea', name: 'Linea', symbol: 'ETH', isEvm: true },
    { id: 'scroll', name: 'Scroll', symbol: 'ETH', isEvm: true },
    { id: 'mantle', name: 'Mantle', symbol: 'MNT', isEvm: true },
    { id: 'kava', name: 'Kava', symbol: 'KAVA', isEvm: true },
    { id: 'evmos', name: 'Evmos', symbol: 'EVMOS', isEvm: true },
  ])
  
  const isDemoMode = sessionStorage.getItem('dwp_demo_mode') === 'true'
  const [demoBalance, setDemoBalance] = useState(parseFloat(sessionStorage.getItem('dwp_demo_balance') || '10000'))
  const [demoPositions, setDemoPositions] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('dwp_demo_positions') || '[]')
    } catch { return [] }
  })
  const [demoSessionId] = useState(() => {
    const stored = sessionStorage.getItem('dwp_demo_session_id')
    if (stored) return stored
    const newId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('dwp_demo_session_id', newId)
    return newId
  })
  const [showTradeHistory, setShowTradeHistory] = useState(false)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [livePrices, setLivePrices] = useState({})
  const [activeSubTab, setActiveSubTab] = useState('discovery')
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const [leadCaptured, setLeadCaptured] = useState(() => {
    return sessionStorage.getItem('dwp_lead_captured') === 'true'
  })
  
  const wallet = isDemoMode
    ? {
        connected: true,
        address: 'DEMO_WALLET_' + demoSessionId.slice(0, 8),
        shortAddress: 'DEMO...' + demoSessionId.slice(-4),
        balance: (demoBalance / (solPrice || 1)).toFixed(4),
        isDemoWallet: true
      }
    : walletSource === 'external' 
      ? { 
          connected: externalWallet.connected, 
          address: externalWallet.address,
          shortAddress: externalWallet.shortAddress,
          balance: externalWallet.balance 
        }
      : { 
          connected: builtInWallet.isUnlocked, 
          address: builtInWallet.solanaAddress,
          shortAddress: builtInWallet.solanaAddress?.slice(0, 4) + '...' + builtInWallet.solanaAddress?.slice(-4),
          balance: builtInWallet.solanaBalance?.toFixed(4)
        }

  useEffect(() => {
    fetchSolPrice()
    fetchRPCStatus()
    const interval = setInterval(fetchSolPrice, 30000)
    const rpcInterval = setInterval(fetchRPCStatus, 60000)
    return () => {
      clearInterval(interval)
      clearInterval(rpcInterval)
    }
  }, [])

  useEffect(() => {
    if (isDemoMode && demoPositions.length > 0) {
      fetchLivePrices()
      const priceInterval = setInterval(fetchLivePrices, 10000)
      return () => clearInterval(priceInterval)
    }
  }, [isDemoMode, demoPositions.length])

  useEffect(() => {
    if (isDemoMode) {
      sessionStorage.setItem('dwp_demo_positions', JSON.stringify(demoPositions))
    }
  }, [demoPositions, isDemoMode])

  useEffect(() => {
    if (!wallet.connected && autoModeActive) {
      setAutoModeActive(false)
    }
  }, [wallet.connected])

  useEffect(() => {
    if (autoModeActive && !scanInterval) {
      const interval = setInterval(discoverTokens, 10000)
      setScanInterval(interval)
    } else if (!autoModeActive && scanInterval) {
      clearInterval(scanInterval)
      setScanInterval(null)
    }
    return () => {
      if (scanInterval) clearInterval(scanInterval)
    }
  }, [autoModeActive])

  const fetchSolPrice = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sniper/sol-price`)
      const data = await res.json()
      if (data.price) setSolPrice(data.price)
    } catch (err) {
      console.error('Error fetching SOL price:', err)
    }
  }

  const fetchRPCStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sniper/rpc/status`)
      const data = await res.json()
      setRpcStatus(data)
    } catch (err) {
      console.error('Error fetching RPC status:', err)
      setRpcStatus({ status: 'unhealthy', active: 'Unknown', type: 'unknown' })
    }
  }

  const saveCustomRPC = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sniper/rpc/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: customRPC || null })
      })
      const data = await res.json()
      if (data.success) {
        await fetchRPCStatus()
      } else {
        alert(data.error || 'Failed to set custom RPC')
      }
    } catch (err) {
      console.error('Error saving custom RPC:', err)
      alert('Failed to connect to RPC endpoint')
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

  const discoverAITokens = async () => {
    setIsDiscovering(true)
    try {
      const res = await fetch(`${API_BASE}/api/demo/discover`)
      const data = await res.json()
      if (data.success) {
        setDiscoveredTokens(data.tokens || [])
        console.log('🔍 AI Discovery found', data.tokens?.length, 'tokens')
      }
    } catch (err) {
      console.error('AI Discovery error:', err)
    }
    setIsDiscovering(false)
  }

  const fetchLivePrices = async () => {
    if (demoPositions.length === 0) return
    try {
      const addresses = demoPositions.map(p => p.tokenAddress)
      const res = await fetch(`${API_BASE}/api/demo/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses })
      })
      const data = await res.json()
      if (data.success && data.prices) {
        setLivePrices(data.prices)
      }
    } catch (err) {
      console.error('Price fetch error:', err)
    }
  }

  const handleSnipe = async (token) => {
    if (!wallet.connected && !isDemoMode) {
      alert('Please connect your wallet first')
      return
    }
    
    if (isDemoMode) {
      const buyAmount = config.tradeControls?.buyAmountSol || 0.5
      const buyAmountUsd = buyAmount * solPrice
      
      if (buyAmountUsd > demoBalance) {
        alert('Insufficient demo balance')
        return
      }
      
      try {
        const res = await fetch(`${API_BASE}/api/demo/buy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: demoSessionId,
            token: {
              address: token.address || token.mint,
              symbol: token.symbol,
              name: token.name,
              priceUsd: token.priceUsd || token.price || 0.001,
              priceSol: (token.priceUsd || token.price || 0.001) / solPrice
            },
            amountUsd: buyAmountUsd
          })
        })
        const data = await res.json()
        if (data.success) {
          setDemoBalance(data.portfolio.balanceSol)
          setDemoPositions(data.portfolio.positions)
          setStats(prev => ({
            ...prev,
            tradesExecuted: data.portfolio.stats.totalTrades,
            totalPnl: data.portfolio.stats.totalPnlSol
          }))
          sessionStorage.setItem('dwp_demo_balance', data.portfolio.balanceSol.toString())
          setHistoryRefreshKey(prev => prev + 1)
          console.log('📊 Demo buy executed:', token.symbol, buyAmountUsd)
        } else {
          alert(data.error || 'Demo trade failed')
        }
      } catch (err) {
        console.error('Demo buy error:', err)
        alert('Failed to execute demo trade')
      }
      return
    }
    
    console.log('StrikeAgent executing on token:', token, 'from wallet:', wallet.address)
  }
  
  const handleDemoSell = async (position, currentPrice) => {
    if (!isDemoMode) return
    
    const sellPrice = currentPrice || livePrices[position.tokenAddress] || position.currentPriceUsd || position.entryPriceUsd * 1.05
    
    try {
      const res = await fetch(`${API_BASE}/api/demo/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: demoSessionId,
          positionId: position.id,
          currentPriceUsd: sellPrice
        })
      })
      const data = await res.json()
      if (data.success) {
        setDemoBalance(data.portfolio.balanceSol)
        setDemoPositions(data.portfolio.positions)
        setStats(prev => ({
          ...prev,
          tradesExecuted: data.portfolio.stats.totalTrades,
          winRate: data.portfolio.stats.winRate,
          totalPnl: data.portfolio.stats.totalPnlSol
        }))
        sessionStorage.setItem('dwp_demo_balance', data.portfolio.balanceSol.toString())
        sessionStorage.setItem('dwp_demo_positions', JSON.stringify(data.portfolio.positions))
        setHistoryRefreshKey(prev => prev + 1)
        console.log('📊 Demo sell executed, P&L:', data.pnl)
      }
    } catch (err) {
      console.error('Demo sell error:', err)
    }
  }

  const handleWatch = async (token) => {
    console.log('Watching token:', token)
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

  return (
    <div className="sniper-tab">
      <div className="sniper-header section-box">
        <div className="sniper-header-left">
          <h1 className="sniper-title">STRIKEAGENT</h1>
          <p className="sniper-subtitle">AI-Powered Predictive Trading</p>
        </div>
        <div className="sniper-header-right">
          <div className="sniper-sol-price">
            <span className="sniper-sol-label">SOL</span>
            <span className="sniper-sol-value">${solPrice.toFixed(2)}</span>
          </div>
          {wallet.connected && (
            <div className="sniper-wallet-balance">
              <span className="sniper-wallet-label">Balance</span>
              <span className="sniper-wallet-value">
                {wallet.balanceLoading ? '...' : `${parseFloat(wallet.balance || 0).toFixed(4)} SOL`}
              </span>
            </div>
          )}
          <div className="sniper-mode-toggle">
            <button
              className={`sniper-mode-btn ${mode === 'simple' ? 'active' : ''}`}
              onClick={() => setMode('simple')}
            >
              Simple
            </button>
            <button
              className={`sniper-mode-btn ${mode === 'advanced' ? 'active' : ''}`}
              onClick={() => setMode('advanced')}
            >
              Advanced
            </button>
          </div>
        </div>
      </div>

      <div className="sniper-chain-selector section-box">
        <div className="sniper-chain-header">
          <span className="sniper-chain-label">Target Chain</span>
          <div className="sniper-chain-buttons">
            {availableChains.map(chain => (
              <button
                key={chain.id}
                className={`sniper-chain-btn ${selectedChain === chain.id ? 'active' : ''} ${chain.isEvm ? 'evm' : 'solana'}`}
                onClick={() => setSelectedChain(chain.id)}
                title={`${chain.name} (${chain.symbol})`}
              >
                <span className="chain-icon">{chain.isEvm ? '⬡' : '◎'}</span>
                <span className="chain-name">{chain.name}</span>
              </button>
            ))}
          </div>
        </div>
        {selectedChain !== 'solana' && (
          <div className="sniper-chain-notice">
            <span className="notice-icon">🔮</span>
            <span className="notice-text">
              {availableChains.find(c => c.id === selectedChain)?.name} support coming soon. 
              Safety analysis available, trading in development.
            </span>
          </div>
        )}
      </div>

      <div className="sniper-wallet-source section-box">
        <div className="sniper-wallet-source-header">
          <span className="sniper-wallet-source-label">Wallet Source</span>
          <div className="sniper-wallet-source-toggle">
            <button
              className={`sniper-wallet-src-btn ${walletSource === 'external' ? 'active' : ''}`}
              onClick={() => setWalletSource('external')}
            >
              External (Phantom)
            </button>
            <button
              className={`sniper-wallet-src-btn ${walletSource === 'builtin' ? 'active' : ''}`}
              onClick={() => setWalletSource('builtin')}
            >
              Built-in Wallet
            </button>
          </div>
        </div>
        {walletSource === 'builtin' && builtInWallet.hasWallet && !builtInWallet.isUnlocked && (
          <BuiltInWalletUnlock onUnlock={builtInWallet.unlock} loading={builtInWallet.loading} />
        )}
        {walletSource === 'builtin' && !builtInWallet.hasWallet && (
          <div className="sniper-wallet-unlock">
            <p>No built-in wallet found. Go to Wallet tab to create one.</p>
          </div>
        )}
      </div>

      {isDemoMode && (
        <div className="sniper-demo-banner section-box" style={{
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(138, 43, 226, 0.15) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.4)',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>🎮</span>
            <div>
              <strong style={{ color: '#00D4FF' }}>Demo Mode Active</strong>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                Paper trading with ${demoBalance.toLocaleString()} virtual balance
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00D4FF' }}>
              ${demoBalance.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>Demo Balance</div>
          </div>
        </div>
      )}

      {!wallet.connected && !isDemoMode && (
        <div className="sniper-wallet-warning section-box">
          <div className="sniper-warning-icon">⚠️</div>
          <div className="sniper-warning-text">
            <strong>Wallet Required</strong>
            <p>{walletSource === 'external' 
              ? 'Connect your Solana wallet (Phantom or Solflare) to start sniping tokens'
              : 'Unlock your built-in wallet to start sniping tokens'}</p>
          </div>
        </div>
      )}

      <BentoGrid columns={2} gap="md">
        <BentoItem span={2}>
          <SessionStatsCard stats={stats} isActive={autoModeActive} />
        </BentoItem>

        <BentoItem span={2}>
          <SmartAutoModePanel 
            isActive={autoModeActive} 
            onToggle={() => {
              if (!wallet.connected) {
                alert('Please connect your wallet first')
                return
              }
              setAutoModeActive(!autoModeActive)
            }}
            config={config}
            disabled={!wallet.connected}
          />
        </BentoItem>

        {isDemoMode && (
          <BentoItem span={2} className="sniper-demo-tabs-section">
            <div className="section-box demo-section-tabs">
              <div className="demo-tabs-header">
                <button 
                  className={`demo-tab-btn ${activeSubTab === 'discovery' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('discovery')}
                >
                  🔍 Discover
                </button>
                <button 
                  className={`demo-tab-btn ${activeSubTab === 'positions' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('positions')}
                >
                  📊 Positions ({demoPositions.length})
                </button>
                <button 
                  className={`demo-tab-btn ${activeSubTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('history')}
                >
                  📜 History
                </button>
              </div>
            </div>
          </BentoItem>
        )}

        {(!isDemoMode || activeSubTab === 'positions') && (
          <BentoItem span={2} className="sniper-positions-section">
            <div className="section-box">
              <div className="sniper-section-header">
                <h3 className="sniper-section-title">
                  {isDemoMode ? 'My Positions' : 'Active Positions'} ({isDemoMode ? demoPositions.length : activePositions.length})
                </h3>
                {isDemoMode && demoPositions.length > 0 && (
                  <span className="positions-live-indicator">● Live</span>
                )}
              </div>
              <div className="sniper-positions-content">
                {isDemoMode ? (
                  demoPositions.length > 0 ? (
                    <div className="demo-positions-grid">
                      {demoPositions.map(pos => (
                        <DemoPositionCard 
                          key={pos.id} 
                          position={pos} 
                          onSell={handleDemoSell}
                          currentPrice={livePrices[pos.tokenAddress] || pos.currentPriceUsd}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="sniper-empty-state">
                      <div className="sniper-empty-icon">💼</div>
                      <div className="sniper-empty-text">No open positions</div>
                      <div className="sniper-empty-hint">Discover tokens and buy to start trading</div>
                    </div>
                  )
                ) : (
                  activePositions.length > 0 ? (
                    activePositions.map(pos => (
                      <ActivePositionCard 
                        key={pos.id} 
                        position={pos} 
                        onClose={(id, reason) => console.log('Close position', id, reason)}
                      />
                    ))
                  ) : (
                    <div className="sniper-empty-state">
                      <div className="sniper-empty-icon">🎯</div>
                      <div className="sniper-empty-text">No active positions</div>
                      <div className="sniper-empty-hint">Strike a token to see live tracking here</div>
                    </div>
                  )
                )}
              </div>
            </div>
          </BentoItem>
        )}

        {isDemoMode && activeSubTab === 'history' && (
          <BentoItem span={2} className="sniper-history-section">
            <div className="section-box">
              <DemoTradeHistory sessionId={demoSessionId} refreshKey={historyRefreshKey} />
            </div>
          </BentoItem>
        )}

        {isDemoMode && !leadCaptured && (
          <BentoItem span={1} className="sniper-lead-capture-section">
            <DemoLeadCapture 
              onSuccess={() => setLeadCaptured(true)}
            />
          </BentoItem>
        )}

        {isDemoMode && (
          <BentoItem span={leadCaptured ? 2 : 1} className="sniper-upgrade-section">
            <DemoUpgradeCTA />
          </BentoItem>
        )}

        {!isDemoMode && (
          <BentoItem span={2} className="sniper-watchlist-section">
            <ManualWatchlist />
          </BentoItem>
        )}

        {(!isDemoMode || activeSubTab === 'discovery') && (
          <BentoItem span={2} className="sniper-discovery-section">
            <div className="section-box">
              <div className="sniper-section-header">
                <h3 className="sniper-section-title">
                  {isDemoMode ? '🤖 AI Token Discovery' : 'Token Discovery'}
                </h3>
                <div className="discovery-btn-group">
                  {isDemoMode && (
                    <button 
                      className={`sniper-discover-btn ${isDiscovering ? 'discovering' : ''}`}
                      onClick={discoverAITokens}
                      disabled={isDiscovering}
                    >
                      {isDiscovering ? '⏳ Discovering...' : '✨ Discover Tokens'}
                    </button>
                  )}
                  {!isDemoMode && (
                    <button 
                      className={`sniper-scan-btn ${isScanning ? 'scanning' : ''}`}
                      onClick={discoverTokens}
                      disabled={isScanning}
                    >
                      {isScanning ? 'Scanning...' : 'Scan Now'}
                    </button>
                  )}
                </div>
              </div>
              <div className="sniper-discovery-content">
                {discoveredTokens.length > 0 ? (
                  <div className="sniper-token-list">
                    {discoveredTokens.map((token, i) => (
                      <DiscoveredTokenCard 
                        key={token.address || i}
                        token={token}
                        onSnipe={handleSnipe}
                        onWatch={handleWatch}
                        onSafetyCheck={(t) => setSafetyCheckToken(t.address)}
                        disabled={!wallet.connected}
                        isDemoMode={isDemoMode}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="sniper-empty-state">
                    <div className="sniper-empty-icon">🔍</div>
                    <div className="sniper-empty-text">No tokens discovered</div>
                    <div className="sniper-empty-hint">
                      {isDemoMode ? 'Click "Discover Tokens" to find trending coins' : 'Click "Scan Now" or enable Auto Mode'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </BentoItem>
        )}

        {safetyCheckToken && (
          <BentoItem span={2} className="sniper-safety-section">
            <SafetyReport 
              tokenAddress={safetyCheckToken}
              onClose={() => setSafetyCheckToken(null)}
            />
          </BentoItem>
        )}

        {mode === 'advanced' && (
          <>
            <BentoItem span={2}>
              <QuickSettingsPanel 
                config={config}
                updateConfig={updateConfig}
                expanded={expandedSettings}
                onToggle={() => setExpandedSettings(!expandedSettings)}
              />
            </BentoItem>
            <BentoItem span={2}>
              <SafetyFiltersPanel 
                config={config}
                updateConfig={updateConfig}
                expanded={expandedSafety}
                onToggle={() => setExpandedSafety(!expandedSafety)}
              />
            </BentoItem>
            <BentoItem span={2}>
              <RPCSettingsPanel 
                rpcStatus={rpcStatus}
                customRPC={customRPC}
                setCustomRPC={setCustomRPC}
                onSaveCustomRPC={saveCustomRPC}
                expanded={expandedRPC}
                onToggle={() => setExpandedRPC(!expandedRPC)}
              />
            </BentoItem>
          </>
        )}
      </BentoGrid>
    </div>
  )
}
