import { useState, useEffect } from 'react'

const TARGET_PREDICTIONS = 50

export default function AIStatusWidget() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showModal, setShowModal] = useState(false)

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

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    if (showModal) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showModal])

  if (loading) {
    return (
      <div style={{
        background: '#0f0f0f',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #222',
        height: '100%',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{ color: '#666', fontSize: '13px' }}>Loading AI Status...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: '#0f0f0f',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #222',
        height: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxSizing: 'border-box',
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
    <>
      <div 
        onClick={() => setShowModal(true)}
        style={{
          background: '#0f0f0f',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #222',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          height: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#333'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#222'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🧠</span>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>AI Status</span>
            <span style={{ color: '#555', fontSize: '11px' }}>Tap for details</span>
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

      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: 'min(420px, 90vw)',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              border: '1px solid #333',
              boxShadow: '0 0 40px rgba(0, 212, 255, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🧠</span>
                <span style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>How AI Learning Works</span>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                background: status.color + '15', 
                border: `1px solid ${status.color}40`,
                borderRadius: '12px', 
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ color: status.color, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Current Status: {status.label}
                </div>
                <div style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>
                  {totalPredictions} / {TARGET_PREDICTIONS} predictions
                </div>
                <div style={{ 
                  background: '#333', 
                  borderRadius: '6px', 
                  height: '10px',
                  overflow: 'hidden',
                  marginTop: '12px'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: status.color,
                    borderRadius: '6px'
                  }} />
                </div>
              </div>
            </div>

            <div style={{ color: '#ccc', fontSize: '14px', lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 16px 0' }}>
                <strong style={{ color: '#fff' }}>What does this mean?</strong><br />
                Every time you analyze a coin, our AI records the market conditions and your analysis. 
                This data trains the AI to make better predictions over time.
              </p>
              
              <p style={{ margin: '0 0 16px 0' }}>
                <strong style={{ color: '#fff' }}>The Progress Bar</strong><br />
                Shows how many predictions have been collected. Once we reach {TARGET_PREDICTIONS} predictions, 
                the AI has enough data to start making reliable forecasts.
              </p>

              <p style={{ margin: '0 0 16px 0' }}>
                <strong style={{ color: '#fff' }}>Status Levels:</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#00D4FF' }}>Learning</span> - Collecting data (0-24 predictions)
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#ffaa00' }}>Training</span> - Building patterns (25-49 predictions)
                </li>
                <li>
                  <span style={{ color: '#00ff88' }}>Active</span> - AI is making predictions (50+ predictions)
                </li>
              </ul>
            </div>

            <button 
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '14px',
                background: 'linear-gradient(135deg, #00D4FF, #0099FF)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
