import { useState, useEffect } from 'react'

const API_BASE = ''

function StatCard({ title, value, subtitle, color = '#00D4FF', icon }) {
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #222',
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <span style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: '#888' }}>{subtitle}</div>
      )}
    </div>
  )
}

function WinRateBar({ label, rate, samples, isImproving }) {
  const rateNum = parseFloat(rate) || 0
  const getColor = (r) => {
    if (r >= 60) return '#39FF14'
    if (r >= 50) return '#00D4FF'
    if (r >= 40) return '#FFD700'
    return '#FF4444'
  }
  
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{label}</span>
          {isImproving !== null && (
            <span style={{ 
              fontSize: 10, 
              color: isImproving ? '#39FF14' : isImproving === false ? '#FF4444' : '#888' 
            }}>
              {isImproving ? '↑ Improving' : isImproving === false ? '↓ Declining' : '— Stable'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: getColor(rateNum) }}>
            {rateNum.toFixed(1)}%
          </span>
          <span style={{ fontSize: 10, color: '#666' }}>({samples} samples)</span>
        </div>
      </div>
      <div style={{
        height: 8,
        background: '#222',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, rateNum)}%`,
          background: `linear-gradient(90deg, ${getColor(rateNum)}, ${getColor(rateNum)}88)`,
          borderRadius: 4,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}

function SignalDistribution({ buy, sell, hold }) {
  const total = buy + sell + hold || 1
  const buyPct = (buy / total) * 100
  const sellPct = (sell / total) * 100
  const holdPct = (hold / total) * 100
  
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', marginBottom: 8 }}>Signal Distribution</div>
      <div style={{
        height: 24,
        background: '#222',
        borderRadius: 6,
        overflow: 'hidden',
        display: 'flex',
      }}>
        <div style={{
          width: `${buyPct}%`,
          background: '#39FF14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {buyPct > 15 && <span style={{ fontSize: 9, fontWeight: 700, color: '#000' }}>BUY</span>}
        </div>
        <div style={{
          width: `${holdPct}%`,
          background: '#888',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {holdPct > 15 && <span style={{ fontSize: 9, fontWeight: 700, color: '#000' }}>HOLD</span>}
        </div>
        <div style={{
          width: `${sellPct}%`,
          background: '#FF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {sellPct > 15 && <span style={{ fontSize: 9, fontWeight: 700, color: '#000' }}>SELL</span>}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: '#39FF14' }}>Buy: {buy} ({buyPct.toFixed(0)}%)</span>
        <span style={{ fontSize: 10, color: '#888' }}>Hold: {hold} ({holdPct.toFixed(0)}%)</span>
        <span style={{ fontSize: 10, color: '#FF4444' }}>Sell: {sell} ({sellPct.toFixed(0)}%)</span>
      </div>
    </div>
  )
}

function RecentPrediction({ prediction }) {
  const getSignalColor = (signal) => {
    if (signal?.includes('BUY')) return '#39FF14'
    if (signal?.includes('SELL')) return '#FF4444'
    return '#888'
  }
  
  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #222',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ 
          fontSize: 11, 
          fontWeight: 700, 
          color: getSignalColor(prediction.signal),
          padding: '2px 8px',
          background: `${getSignalColor(prediction.signal)}20`,
          borderRadius: 4,
        }}>
          {prediction.signal || prediction.signalType}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
          {prediction.ticker?.toUpperCase()}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#888' }}>
          ${parseFloat(prediction.price || prediction.priceAtPrediction || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <span style={{ fontSize: 10, color: '#666' }}>
          {formatTime(prediction.createdAt)}
        </span>
      </div>
    </div>
  )
}

function LearningProgress({ totalPredictions, minRequired = 50 }) {
  const progress = Math.min(100, (totalPredictions / minRequired) * 100)
  const isReady = totalPredictions >= minRequired
  
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #222',
      borderRadius: 12,
      padding: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>AI Learning Progress</span>
        <span style={{ 
          fontSize: 10, 
          color: isReady ? '#39FF14' : '#FFD700',
          fontWeight: 600,
        }}>
          {isReady ? '✓ Ready to Train' : `${totalPredictions}/${minRequired} samples`}
        </span>
      </div>
      <div style={{
        height: 12,
        background: '#222',
        borderRadius: 6,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: isReady 
            ? 'linear-gradient(90deg, #39FF14, #2ECC71)' 
            : 'linear-gradient(90deg, #FFD700, #FF8C00)',
          borderRadius: 6,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 8 }}>
        {isReady 
          ? 'The AI has collected enough data to start making intelligent predictions. Models train automatically every Sunday.'
          : `The AI needs ${minRequired - totalPredictions} more predictions to begin training. Keep using the platform!`
        }
      </div>
    </div>
  )
}

export default function AccuracyDashboard() {
  const [stats, setStats] = useState(null)
  const [trends, setTrends] = useState(null)
  const [modelStatus, setModelStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [statsRes, trendsRes, modelRes] = await Promise.all([
        fetch(`${API_BASE}/api/ml/stats`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/api/ml/accuracy-trends`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/api/ml/model-status`).then(r => r.json()).catch(() => null),
      ])
      
      setStats(statsRes)
      setTrends(trendsRes)
      setModelStatus(modelRes)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        background: '#0f0f0f',
        border: '1px solid #222',
        borderRadius: 12,
        padding: 40,
        textAlign: 'center',
        color: '#666',
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
        Loading accuracy data...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: '#0f0f0f',
        border: '1px solid #FF4444',
        borderRadius: 12,
        padding: 20,
        textAlign: 'center',
        color: '#FF4444',
      }}>
        Failed to load accuracy data: {error}
      </div>
    )
  }

  const totalPredictions = stats?.totalPredictions || 0
  const overallWinRate = trends?.overall?.currentWinRate || '0'
  const hasEnoughData = totalPredictions >= 50

  return (
    <div style={{
      background: '#0f0f0f',
      border: '1px solid #222',
      borderRadius: 12,
      padding: 20,
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <h3 style={{ margin: 0, fontSize: 18, color: '#00D4FF', fontWeight: 700 }}>
          📊 AI Prediction Accuracy
        </h3>
        <button 
          onClick={fetchAllData}
          style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: 6,
            padding: '6px 12px',
            color: '#00D4FF',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          ↻ Refresh
        </button>
      </div>

      <LearningProgress totalPredictions={totalPredictions} minRequired={50} />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: 12,
        marginTop: 16,
        marginBottom: 20,
      }}>
        <StatCard 
          title="Total Predictions" 
          value={totalPredictions.toLocaleString()}
          subtitle="Logged signals"
          icon="📈"
          color="#00D4FF"
        />
        <StatCard 
          title="Overall Win Rate" 
          value={hasEnoughData ? `${overallWinRate}%` : 'N/A'}
          subtitle={hasEnoughData ? 'Based on outcomes' : 'Need more data'}
          icon="🎯"
          color={parseFloat(overallWinRate) >= 50 ? '#39FF14' : '#FFD700'}
        />
        <StatCard 
          title="Active Models" 
          value={modelStatus?.activeModels || 0}
          subtitle={`of ${modelStatus?.totalModels || 0} trained`}
          icon="🧠"
          color="#9B59B6"
        />
        <StatCard 
          title="Trend" 
          value={trends?.overall?.trend === 'improving' ? '↑' : trends?.overall?.trend === 'declining' ? '↓' : '—'}
          subtitle={trends?.overall?.trend || 'stable'}
          icon="📉"
          color={trends?.overall?.trend === 'improving' ? '#39FF14' : trends?.overall?.trend === 'declining' ? '#FF4444' : '#888'}
        />
      </div>

      <div style={{
        background: '#1a1a1a',
        border: '1px solid #222',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 16, textTransform: 'uppercase' }}>
          Win Rate by Time Horizon
        </div>
        
        {['1h', '4h', '24h', '7d'].map(horizon => {
          const horizonData = trends?.byHorizon?.[horizon] || stats?.outcomesByHorizon?.[horizon]
          const rate = horizonData?.currentWinRate || horizonData?.winRate || 0
          const samples = horizonData?.currentSamples || horizonData?.total || 0
          const trend = horizonData?.trend
          const isImproving = trend === 'improving' ? true : trend === 'declining' ? false : null
          
          return (
            <WinRateBar 
              key={horizon}
              label={horizon === '1h' ? '1 Hour' : horizon === '4h' ? '4 Hours' : horizon === '24h' ? '24 Hours' : '7 Days'}
              rate={rate}
              samples={samples}
              isImproving={samples > 0 ? isImproving : null}
            />
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #222',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 8, textTransform: 'uppercase' }}>
            Signal Breakdown
          </div>
          <SignalDistribution 
            buy={stats?.buySignals || 0}
            sell={stats?.sellSignals || 0}
            hold={stats?.holdSignals || 0}
          />
        </div>

        <div style={{
          background: '#1a1a1a',
          border: '1px solid #222',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 12, textTransform: 'uppercase' }}>
            Recent Predictions
          </div>
          {stats?.recentPredictions?.length > 0 ? (
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {stats.recentPredictions.slice(0, 5).map((pred, i) => (
                <RecentPrediction key={pred.id || i} prediction={pred} />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: '#666', textAlign: 'center', padding: 20 }}>
              No predictions yet. Start analyzing coins to collect data!
            </div>
          )}
        </div>
      </div>

      <div style={{
        marginTop: 16,
        padding: 12,
        background: 'rgba(0, 212, 255, 0.05)',
        borderRadius: 8,
        border: '1px solid rgba(0, 212, 255, 0.1)',
      }}>
        <div style={{ fontSize: 10, color: '#666', lineHeight: 1.6 }}>
          <strong style={{ color: '#00D4FF' }}>How it works:</strong> Every time you analyze a coin, the AI logs the prediction with full indicator data. 
          After 1h, 4h, 24h, and 7d, outcomes are recorded. Once 50+ samples exist per time horizon, 
          the AI trains prediction models automatically every Sunday at 3 AM. Models with &gt;55% accuracy become active.
        </div>
      </div>
    </div>
  )
}
