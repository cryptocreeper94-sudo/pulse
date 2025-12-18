import { useState, useEffect } from 'react'

export default function StrikeAgentLiveWidget({ isLocked = true, onUnlock }) {
  const [signals, setSignals] = useState([
    { id: 'sa_1', type: 'SNIPE', token: 'MOG', price: '$0.3704', confidence: 'HIGH', timestamp: 'Just now' },
    { id: 'sa_2', type: 'WATCH', token: 'SHIB', price: '$0.000007495', confidence: 'MEDIUM', timestamp: '2m ago' },
    { id: 'sa_3', type: 'SNIPE', token: 'PEPE', price: '$0.000003979', confidence: 'HIGH', timestamp: '5m ago' },
  ])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % signals.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [signals.length])

  const currentSignal = signals[activeIndex]
  const signalColor = currentSignal.type === 'SNIPE' ? '#00D4FF' : '#39FF14'

  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(57, 255, 20, 0.04) 100%)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: 16,
        padding: 20,
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Lock Badge - Subtle Top Right */}
      {isLocked && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(0, 212, 255, 0.15)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: 6,
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 600,
            color: '#00D4FF',
            zIndex: 10,
          }}
        >
          <span>🔒</span>
          <span>Pro</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #00D4FF 0%, #39FF14 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
          }}
        >
          🎯
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>StrikeAgent</div>
          <div style={{ fontSize: 11, color: '#00D4FF', marginTop: 2 }}>AI Trading Bot</div>
        </div>
      </div>

      {/* Live Signal Display */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 180,
        }}
      >
        {/* Signal Card */}
        <div
          style={{
            background: `linear-gradient(135deg, rgba(${currentSignal.type === 'SNIPE' ? '0, 212, 255' : '57, 255, 20'}, 0.12) 0%, rgba(20, 20, 20, 0.4) 100%)`,
            border: `1px solid ${signalColor}40`,
            borderRadius: 12,
            padding: 16,
            transition: 'all 0.4s ease-out',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                Signal Type
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: signalColor,
                  textShadow: `0 0 10px ${signalColor}40`,
                }}
              >
                {currentSignal.type}
              </div>
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '4px 8px',
                background: currentSignal.confidence === 'HIGH' ? 'rgba(57, 255, 20, 0.2)' : 'rgba(255, 215, 0, 0.2)',
                color: currentSignal.confidence === 'HIGH' ? '#39FF14' : '#FFD700',
                borderRadius: 4,
                border: `1px solid ${currentSignal.confidence === 'HIGH' ? '#39FF1480' : '#FFD70080'}`,
              }}
            >
              {currentSignal.confidence}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 9, color: '#666', marginBottom: 4 }}>TOKEN</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{currentSignal.token}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: '#666', marginBottom: 4 }}>ENTRY</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{currentSignal.price}</div>
            </div>
          </div>

          <div style={{ fontSize: 10, color: '#666' }}>
            {currentSignal.timestamp}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8,
            marginTop: 16,
          }}
        >
          <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(0, 212, 255, 0.08)', borderRadius: 8 }}>
            <div style={{ fontSize: 9, color: '#666', marginBottom: 2 }}>ACTIVE</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#00D4FF' }}>47</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(57, 255, 20, 0.08)', borderRadius: 8 }}>
            <div style={{ fontSize: 9, color: '#666', marginBottom: 2 }}>WIN RATE</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#39FF14' }}>73%</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255, 215, 0, 0.08)', borderRadius: 8 }}>
            <div style={{ fontSize: 9, color: '#666', marginBottom: 2 }}>24H GAIN</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#FFD700' }}>+18%</div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid rgba(0, 212, 255, 0.1)',
        }}
      >
        {signals.map((_, i) => (
          <div
            key={i}
            onClick={() => setActiveIndex(i)}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: i === activeIndex ? '#00D4FF' : '#333',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: i === activeIndex ? '0 0 8px rgba(0, 212, 255, 0.6)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Unlock CTA - Subtle */}
      {isLocked && (
        <button
          onClick={onUnlock}
          style={{
            marginTop: 16,
            width: '100%',
            padding: '10px 12px',
            fontSize: 12,
            fontWeight: 600,
            background: 'transparent',
            border: '1px solid rgba(0, 212, 255, 0.4)',
            borderRadius: 8,
            color: '#00D4FF',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 212, 255, 0.1)'
            e.target.style.borderColor = 'rgba(0, 212, 255, 0.8)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent'
            e.target.style.borderColor = 'rgba(0, 212, 255, 0.4)'
          }}
        >
          Unlock Full Access → View Plans
        </button>
      )}
    </div>
  )
}
