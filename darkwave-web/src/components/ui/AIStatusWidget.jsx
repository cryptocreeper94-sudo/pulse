import { useState, useEffect } from 'react'

const TARGET_PREDICTIONS = 50

export default function AIStatusWidget() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/ml/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
          setError(false)
        } else {
          setError(true)
        }
      } catch (err) {
        console.log('Failed to fetch AI stats')
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div style={{
        background: '#1a1a1a',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #222'
      }}>
        <div style={{ color: '#666', fontSize: '13px' }}>Loading AI Status...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: '#1a1a1a',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🧠</span>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>AI Status</span>
        </div>
        <p style={{ color: '#666', fontSize: '12px', margin: '12px 0 0 0' }}>
          Status unavailable - will retry shortly
        </p>
      </div>
    )
  }

  const totalPredictions = stats?.totalPredictions || 0
  const progress = Math.min((totalPredictions / TARGET_PREDICTIONS) * 100, 100)
  
  const getStatus = () => {
    if (totalPredictions >= TARGET_PREDICTIONS) return { label: 'Active', color: '#00ff88' }
    if (totalPredictions >= TARGET_PREDICTIONS / 2) return { label: 'Training', color: '#ffaa00' }
    return { label: 'Learning', color: '#00D4FF' }
  }

  const status = getStatus()

  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #222'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🧠</span>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>AI Status</span>
        </div>
        <span style={{
          padding: '3px 10px',
          background: status.color + '22',
          color: status.color,
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600
        }}>
          {status.label}
        </span>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: '#888', fontSize: '12px' }}>Learning Progress</span>
          <span style={{ color: '#fff', fontSize: '12px' }}>{totalPredictions} / {TARGET_PREDICTIONS}</span>
        </div>
        <div style={{ 
          background: '#333', 
          borderRadius: '6px', 
          height: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: status.color,
            borderRadius: '6px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      <p style={{ 
        color: '#888', 
        fontSize: '12px', 
        margin: 0,
        lineHeight: 1.4
      }}>
        {totalPredictions >= TARGET_PREDICTIONS 
          ? "AI is actively improving predictions based on your analyses!"
          : `${totalPredictions} predictions collected - Your analyses help train our AI!`
        }
      </p>
    </div>
  )
}
