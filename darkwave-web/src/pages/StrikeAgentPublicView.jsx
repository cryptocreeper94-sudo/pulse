import { useState, useEffect } from 'react'

export default function StrikeAgentPublicView({ onSubscribe }) {
  const [signals, setSignals] = useState([])
  const [executions, setExecutions] = useState([])
  const [stats, setStats] = useState({ totalSignals: 0, winRate: 0, activeToday: 0, tradesExecuted: 0 })
  const [loading, setLoading] = useState(true)
  const [activeSignalIndex, setActiveSignalIndex] = useState(0)

  useEffect(() => {
    const fetchWithRetry = async (url, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        const res = await fetch(url, { cache: 'no-store' })
        if (res.ok) return res
        if (res.status === 503) {
          await new Promise(r => setTimeout(r, 2000))
          continue
        }
        return res
      }
      return fetch(url, { cache: 'no-store' })
    }

    const fetchData = async () => {
      try {
        const cacheBust = `?_t=${Date.now()}`
        const [signalsRes, executionsRes, statsRes] = await Promise.all([
          fetchWithRetry(`/api/public/strikeagent/signals${cacheBust}`),
          fetchWithRetry(`/api/public/strikeagent/executions${cacheBust}`),
          fetchWithRetry(`/api/public/strikeagent/stats${cacheBust}`)
        ])
        
        const signalsData = await signalsRes.json()
        const executionsData = await executionsRes.json()
        const statsData = await statsRes.json()
        
        const signalsList = signalsData.signals || signalsData.data || []
        if (signalsList.length > 0) setSignals(signalsList)
        
        const executionsList = executionsData.executions || executionsData.data || []
        if (executionsList.length > 0) setExecutions(executionsList)
        
        const statsObj = statsData.stats || statsData
        setStats({
          totalSignals: Number(statsObj.totalSignals) || 0,
          winRate: Number(statsObj.winRate) || 0,
          activeToday: Number(statsObj.activeToday) || 0,
          tradesExecuted: Number(statsObj.tradesExecuted) || 0
        })
      } catch (err) {
        console.error('Failed to fetch public data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (signals.length > 0) {
      const interval = setInterval(() => {
        setActiveSignalIndex(prev => (prev + 1) % signals.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [signals.length])

  const currentSignal = signals[activeSignalIndex] || null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%)',
      padding: '16px',
      paddingBottom: '100px',
      color: '#fff',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
        paddingTop: 20,
      }}>
        <div style={{
          width: 72,
          height: 72,
          background: 'linear-gradient(135deg, #00D4FF 0%, #39FF14 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          boxShadow: '0 0 40px rgba(0, 212, 255, 0.5)',
        }}>
          🎯
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            margin: 0,
            background: 'linear-gradient(135deg, #00D4FF, #39FF14)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            StrikeAgent
          </h1>
          <p style={{ color: '#888', fontSize: 14, margin: '4px 0 0' }}>
            AI-Powered Trading Signals
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: 'rgba(57, 255, 20, 0.15)',
          border: '1px solid rgba(57, 255, 20, 0.3)',
          borderRadius: 20,
        }}>
          <div style={{
            width: 8,
            height: 8,
            background: '#39FF14',
            borderRadius: '50%',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#39FF14' }}>LIVE</span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        marginBottom: 24,
      }}>
        <StatCard label="Total Signals" value={stats.totalSignals || 0} />
        <StatCard label="Win Rate" value={`${parseFloat(stats.winRate || 0).toFixed(1)}%`} highlight />
        <StatCard label="Active Today" value={stats.activeToday || 0} />
        <StatCard label="Trades" value={stats.tradesExecuted || 0} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          Loading signals...
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Live Signal" icon="📡" />
            {currentSignal ? (
              <SignalCard signal={currentSignal} />
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                padding: 24,
                textAlign: 'center',
                color: '#666',
              }}>
                No active signals at the moment
              </div>
            )}
            {signals.length > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 6,
                marginTop: 12,
              }}>
                {signals.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: i === activeSignalIndex ? '#00D4FF' : 'rgba(255,255,255,0.2)',
                      transition: 'background 0.3s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Recent Activity" icon="⚡" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {executions.length > 0 ? (
                executions.slice(0, 5).map((exec, i) => (
                  <ExecutionRow key={i} execution={exec} />
                ))
              ) : (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: 20,
                  textAlign: 'center',
                  color: '#666',
                }}>
                  No recent executions
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px',
        background: 'linear-gradient(180deg, transparent 0%, #0a0a0a 30%)',
        paddingTop: 40,
      }}>
        <button
          onClick={onSubscribe}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #00D4FF 0%, #00A0CC 100%)',
            border: 'none',
            borderRadius: 12,
            color: '#000',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
          }}
        >
          <span>🚀</span>
          <span>Get Full Access</span>
        </button>
        <p style={{
          textAlign: 'center',
          fontSize: 11,
          color: '#666',
          margin: '8px 0 0',
        }}>
          Unlock real-time alerts, auto-trading & more
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

function StatCard({ label, value, highlight }) {
  return (
    <div style={{
      background: highlight 
        ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(57, 255, 20, 0.08) 100%)'
        : 'rgba(255, 255, 255, 0.03)',
      border: highlight 
        ? '1px solid rgba(0, 212, 255, 0.3)'
        : '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 12,
      padding: '16px 12px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 24,
        fontWeight: 700,
        color: highlight ? '#00D4FF' : '#fff',
        marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  )
}

function SectionHeader({ title, icon }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{title}</span>
    </div>
  )
}

function SignalCard({ signal }) {
  const isSnipe = signal.type === 'SNIPE'
  const color = isSnipe ? '#00D4FF' : '#39FF14'
  
  return (
    <div style={{
      background: `linear-gradient(135deg, ${isSnipe ? 'rgba(0, 212, 255, 0.12)' : 'rgba(57, 255, 20, 0.12)'} 0%, rgba(20, 20, 20, 0.6) 100%)`,
      border: `1px solid ${color}40`,
      borderRadius: 16,
      padding: 20,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
      }}>
        <div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
            marginBottom: 4,
          }}>
            {signal.token || 'TOKEN'}
          </div>
          <div style={{ fontSize: 13, color: '#888' }}>
            {signal.name || 'Unknown Token'}
          </div>
        </div>
        <div style={{
          padding: '6px 12px',
          background: `${color}20`,
          border: `1px solid ${color}50`,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
          color: color,
        }}>
          {signal.type}
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>PRICE</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
            {signal.price || '--'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>24H</div>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: (signal.change24h || 0) >= 0 ? '#39FF14' : '#FF4444',
          }}>
            {signal.change24h ? `${signal.change24h > 0 ? '+' : ''}${signal.change24h.toFixed(1)}%` : '--'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>CONFIDENCE</div>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: signal.confidence === 'HIGH' ? '#39FF14' : signal.confidence === 'MEDIUM' ? '#FFD700' : '#888',
          }}>
            {signal.confidence || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}

function ExecutionRow({ execution }) {
  const isBuy = execution.action === 'BUY'
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 10,
      padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: isBuy ? 'rgba(57, 255, 20, 0.15)' : 'rgba(255, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
        }}>
          {isBuy ? '📈' : '📉'}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
            {execution.token || 'TOKEN'}
          </div>
          <div style={{ fontSize: 11, color: '#666' }}>
            {execution.chain?.toUpperCase() || 'SOL'}
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
          {execution.amount || '--'}
        </div>
        {execution.pnl && (
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: execution.pnl.startsWith('+') ? '#39FF14' : '#FF4444',
          }}>
            {execution.pnl}
          </div>
        )}
      </div>
    </div>
  )
}
