import { useState, useEffect, useRef, useCallback } from 'react'
import { createChart, CandlestickSeries, AreaSeries } from 'lightweight-charts'

const TIMEFRAMES = [
  { id: '1S', label: '1S', isLive: true },
  { id: '1H', label: '1H', days: 1 },
  { id: '4H', label: '4H', days: 7 },
  { id: '1D', label: '1D', days: 1 },
  { id: '7D', label: '7D', days: 7 },
  { id: '30D', label: '30D', days: 30 },
  { id: '1Y', label: '1Y', days: 365 },
  { id: 'ALL', label: 'ALL', days: 'max' },
]

const DEFAULT_COLORS = {
  upColor: '#39FF14',
  downColor: '#FF4444',
  lineColor: '#00D4FF',
  areaTopColor: 'rgba(0, 212, 255, 0.4)',
  areaBottomColor: 'rgba(0, 212, 255, 0.05)',
}

const COLOR_PRESETS = [
  { name: 'Neon', up: '#39FF14', down: '#FF4444', line: '#00D4FF' },
  { name: 'Classic', up: '#26a69a', down: '#ef5350', line: '#2196f3' },
  { name: 'Purple', up: '#9D4EDD', down: '#FF006E', line: '#E0AAFF' },
  { name: 'Gold', up: '#FFD700', down: '#FF6B6B', line: '#FFA500' },
]

function generateSampleData(days = 30) {
  const data = []
  const now = Math.floor(Date.now() / 1000)
  const oneDay = 86400
  const hoursPerDay = days <= 1 ? 24 : days <= 7 ? 4 : 1
  const interval = days <= 1 ? 3600 : days <= 7 ? 3600 * 6 : oneDay
  const points = days <= 1 ? 24 : days <= 7 ? 28 : days
  
  let basePrice = 97000 + Math.random() * 2000
  
  for (let i = points - 1; i >= 0; i--) {
    const time = now - i * interval
    const volatility = 0.02
    const change = (Math.random() - 0.5) * 2 * volatility
    const open = basePrice
    const close = open * (1 + change)
    const high = Math.max(open, close) * (1 + Math.random() * 0.01)
    const low = Math.min(open, close) * (1 - Math.random() * 0.01)
    
    data.push({
      time,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    })
    
    basePrice = close
  }
  
  return data
}

export default function BitcoinChart() {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const basePriceRef = useRef(null)
  const dataRef = useRef([])
  
  const [chartType, setChartType] = useState('area')
  const [timeframe, setTimeframe] = useState('7D')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [colors, setColors] = useState(DEFAULT_COLORS)
  const [lastPrice, setLastPrice] = useState(null)
  const [priceChange, setPriceChange] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])
  const [viewMode, setViewMode] = useState('price') // 'price' or 'volume'
  const [dataScope, setDataScope] = useState('bitcoin') // 'bitcoin' or 'macro'

  const fetchLivePrice = useCallback(async () => {
    try {
      const response = await fetch('/api/crypto/btc-price')
      if (response.ok) {
        const priceData = await response.json()
        if (priceData && priceData.price) {
          const now = Math.floor(Date.now() / 1000)
          const price = priceData.price
          
          setData(prev => {
            const newPoint = {
              time: now,
              open: price,
              high: price,
              low: price,
              close: price,
            }
            
            if (prev.length === 0) {
              basePriceRef.current = price
              dataRef.current = [newPoint]
              return [newPoint]
            }
            
            const updated = [...prev]
            const lastPoint = updated[updated.length - 1]
            
            if (now - lastPoint.time < 1) {
              lastPoint.close = price
              lastPoint.high = Math.max(lastPoint.high, price)
              lastPoint.low = Math.min(lastPoint.low, price)
            } else {
              updated.push(newPoint)
              if (updated.length > 120) updated.shift()
            }
            
            dataRef.current = updated
            return updated
          })
          
          setLastPrice(price)
          if (basePriceRef.current) {
            const change = ((price - basePriceRef.current) / basePriceRef.current) * 100
            setPriceChange(change.toFixed(2))
          }
        }
      }
    } catch (err) {
      console.log('Live price fetch error')
    }
  }, [])

  const fetchData = useCallback(async () => {
    const selectedTimeframe = TIMEFRAMES.find(t => t.id === timeframe)
    
    basePriceRef.current = null
    dataRef.current = []
    
    if (selectedTimeframe.isLive) {
      setData([])
      return
    }
    
    try {
      const response = await fetch(`/api/crypto/btc-history?days=${selectedTimeframe.days}`)
      if (response.ok) {
        const apiData = await response.json()
        if (apiData && apiData.length > 0) {
          setData(apiData)
          dataRef.current = apiData
          if (apiData[0]) basePriceRef.current = apiData[0].open
          return
        }
      }
    } catch (err) {
      console.log('API unavailable, using sample data')
    }
    
    const numDays = selectedTimeframe.days === 'max' ? 1825 : selectedTimeframe.days
    const sampleData = generateSampleData(numDays)
    setData(sampleData)
    dataRef.current = sampleData
    if (sampleData[0]) basePriceRef.current = sampleData[0].open
  }, [timeframe])

  useEffect(() => {
    const selectedTimeframe = TIMEFRAMES.find(t => t.id === timeframe)
    
    fetchData()
    setIsLoading(false)
    
    if (selectedTimeframe.isLive) {
      fetchLivePrice()
      const liveInterval = setInterval(fetchLivePrice, 1000)
      return () => clearInterval(liveInterval)
    } else {
      const refreshInterval = setInterval(fetchData, 30000)
      return () => clearInterval(refreshInterval)
    }
  }, [fetchData, fetchLivePrice, timeframe])

  // Initialize chart only when chartType or colors change (not on every data update)
  useEffect(() => {
    if (!chartContainerRef.current) return

    let chart = null
    let isActive = true

    try {
      if (chartRef.current) {
        try {
          chartRef.current.remove()
        } catch (e) {}
        chartRef.current = null
        seriesRef.current = null
      }

      chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: 'solid', color: 'transparent' },
          textColor: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.06)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.06)' },
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: colors.lineColor,
            width: 1,
            style: 2,
            labelBackgroundColor: colors.lineColor,
          },
          horzLine: {
            color: colors.lineColor,
            width: 1,
            style: 2,
            labelBackgroundColor: colors.lineColor,
          },
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          timeVisible: true,
          secondsVisible: true,
        },
        handleScale: { mouseWheel: true, pinch: true },
        handleScroll: { mouseWheel: true, pressedMouseMove: true },
      })

      if (!isActive) {
        chart.remove()
        return
      }

      chartRef.current = chart

      let series
      if (chartType === 'candlestick') {
        series = chart.addSeries(CandlestickSeries, {
          upColor: colors.upColor,
          downColor: colors.downColor,
          borderUpColor: colors.upColor,
          borderDownColor: colors.downColor,
          wickUpColor: colors.upColor,
          wickDownColor: colors.downColor,
        })
      } else {
        series = chart.addSeries(AreaSeries, {
          lineColor: colors.lineColor,
          topColor: colors.areaTopColor,
          bottomColor: colors.areaBottomColor,
          lineWidth: 2,
        })
      }

      seriesRef.current = series

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          try {
            chart.applyOptions({
              width: chartContainerRef.current.clientWidth,
              height: chartContainerRef.current.clientHeight,
            })
          } catch (e) {}
        }
      }

      window.addEventListener('resize', handleResize)
      handleResize()
      
      // Delayed resize for mobile - ensure container is properly sized
      const delayedResize = setTimeout(() => {
        handleResize()
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent()
        }
      }, 100)

      return () => {
        clearTimeout(delayedResize)
        isActive = false
        window.removeEventListener('resize', handleResize)
        if (chart) {
          try {
            chart.remove()
          } catch (e) {}
        }
        chartRef.current = null
        seriesRef.current = null
      }
    } catch (err) {
      console.log('Chart initialization error:', err)
    }
  }, [chartType, colors])

  // Update data without recreating chart - prevents 1S flashing
  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return

    try {
      if (chartType === 'candlestick') {
        seriesRef.current.setData(data)
      } else {
        seriesRef.current.setData(data.map(d => ({ time: d.time, value: d.close })))
      }

      const latest = data[data.length - 1]
      const first = data[0]
      setLastPrice(latest.close)
      const change = ((latest.close - first.open) / first.open) * 100
      setPriceChange(change.toFixed(2))

      if (chartRef.current) {
        chartRef.current.timeScale().fitContent()
      }
    } catch (err) {
      console.log('Chart data update error:', err)
    }
  }, [data, chartType])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const applyColorPreset = (preset) => {
    setColors({
      upColor: preset.up,
      downColor: preset.down,
      lineColor: preset.line,
      areaTopColor: `${preset.line}66`,
      areaBottomColor: `${preset.line}0D`,
    })
    setShowColorPicker(false)
  }

  const containerClass = isFullscreen 
    ? 'bitcoin-chart-container fullscreen' 
    : 'bitcoin-chart-container'

  return (
    <div className={containerClass}>
      <div className="chart-header">
        <div className="chart-title-section">
          <div className="chart-title">
            <span className="btc-icon">₿</span>
            <span>BTC/USD</span>
          </div>
          {lastPrice && (
            <div className="chart-price-info">
              <span className="current-price">${lastPrice.toLocaleString()}</span>
              {priceChange && (
                <span className={`price-change ${parseFloat(priceChange) >= 0 ? 'positive' : 'negative'}`}>
                  {parseFloat(priceChange) >= 0 ? '+' : ''}{priceChange}%
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="chart-controls">
          <div className="chart-type-toggle">
            <button
              className={`toggle-btn ${viewMode === 'price' ? 'active' : ''}`}
              onClick={() => setViewMode('price')}
              title="Price"
            >
              💲
            </button>
            <button
              className={`toggle-btn ${viewMode === 'volume' ? 'active' : ''}`}
              onClick={() => setViewMode('volume')}
              title="Volume"
            >
              📊
            </button>
          </div>

          <div className="chart-type-toggle">
            <button
              className={`toggle-btn ${dataScope === 'bitcoin' ? 'active' : ''}`}
              onClick={() => setDataScope('bitcoin')}
              title="Bitcoin"
            >
              ₿
            </button>
            <button
              className={`toggle-btn ${dataScope === 'macro' ? 'active' : ''}`}
              onClick={() => setDataScope('macro')}
              title="Macro Market"
            >
              🌐
            </button>
          </div>

          <div className="chart-type-toggle">
            <button
              className={`toggle-btn ${chartType === 'candlestick' ? 'active' : ''}`}
              onClick={() => setChartType('candlestick')}
              title="Candlestick"
            >
              📈
            </button>
            <button
              className={`toggle-btn ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
              title="Area/Sparkline"
            >
              〰️
            </button>
          </div>

          <div className="timeframe-buttons">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.id}
                className={`tf-btn ${timeframe === tf.id ? 'active' : ''}`}
                onClick={() => setTimeframe(tf.id)}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="chart-actions">
            <div className="color-picker-wrapper">
              <button
                className="action-btn"
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Color Theme"
              >
                🎨
              </button>
              {showColorPicker && (
                <div className="color-picker-dropdown">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      className="color-preset-btn"
                      onClick={() => applyColorPreset(preset)}
                    >
                      <span className="color-swatch" style={{ background: preset.line }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              className="action-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? '⛶' : '⛶'}
            </button>
          </div>
        </div>
      </div>

      <div className="chart-wrapper" ref={chartContainerRef}>
        {isLoading && (
          <div className="chart-loading">
            <div className="loading-spinner" />
            <span>Loading chart...</span>
          </div>
        )}
      </div>

      <div className="chart-footer">
        <span className="auto-refresh-indicator">
          <span className="pulse-dot" />
          Auto-refresh: 30s
        </span>
      </div>

      <style>{`
        .bitcoin-chart-container {
          background: linear-gradient(145deg, #0f0f0f 0%, #141414 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }

        .bitcoin-chart-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          border-radius: 0;
          padding: 20px;
          background: #0a0a0a;
        }

        .chart-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .chart-title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .chart-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
        }

        .btc-icon {
          font-size: 24px;
          color: #F7931A;
        }

        .chart-price-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .current-price {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
        }

        .price-change {
          font-size: 14px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .price-change.positive {
          color: #39FF14;
          background: rgba(57, 255, 20, 0.15);
        }

        .price-change.negative {
          color: #FF4444;
          background: rgba(255, 68, 68, 0.15);
        }

        .chart-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .chart-type-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2px;
        }

        .toggle-btn {
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s ease;
        }

        .toggle-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .toggle-btn.active {
          background: rgba(0, 212, 255, 0.2);
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
        }

        .timeframe-buttons {
          display: flex;
          gap: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2px;
        }

        .tf-btn {
          padding: 6px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tf-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .tf-btn.active {
          background: rgba(0, 212, 255, 0.2);
          color: #00D4FF;
          box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
        }

        .chart-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(0, 212, 255, 0.15);
          border-color: rgba(0, 212, 255, 0.4);
        }

        .color-picker-wrapper {
          position: relative;
        }

        .color-picker-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 8px;
          z-index: 100;
          min-width: 140px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        }

        .color-preset-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #fff;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .color-preset-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .color-swatch {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .chart-wrapper {
          height: 300px;
          width: 100%;
          position: relative;
          border-radius: 8px;
          overflow: hidden;
        }

        .bitcoin-chart-container.fullscreen .chart-wrapper {
          height: calc(100vh - 140px);
        }

        .chart-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(0, 0, 0, 0.6);
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(0, 212, 255, 0.2);
          border-top-color: #00D4FF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .chart-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }

        .auto-refresh-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background: #39FF14;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        @media (max-width: 600px) {
          .bitcoin-chart-container {
            padding: 12px;
          }

          .chart-header {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .chart-title-section {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
          }

          .chart-title {
            font-size: 16px;
          }

          .btc-icon {
            font-size: 20px;
          }

          .current-price {
            font-size: 16px;
          }

          .chart-controls {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }

          .chart-type-toggle {
            flex-shrink: 0;
          }

          .timeframe-buttons {
            overflow-x: auto;
            max-width: 100%;
            -webkit-overflow-scrolling: touch;
            flex-shrink: 1;
          }

          .tf-btn {
            padding: 6px 10px;
            font-size: 11px;
            flex-shrink: 0;
          }

          .chart-actions {
            margin-left: auto;
          }

          .color-picker-wrapper {
            position: static;
          }

          .color-picker-dropdown {
            position: fixed;
            top: auto;
            bottom: 20px;
            left: 20px;
            right: 20px;
            margin-top: 0;
            min-width: auto;
            z-index: 1000;
          }

          .action-btn {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }

          .chart-wrapper {
            height: 250px;
            width: 100%;
            min-width: 0;
          }
        }
      `}</style>
    </div>
  )
}
