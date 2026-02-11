import { useState } from 'react'

export default function MaintenanceBanner() {
  const [dismissed, setDismissed] = useState(false)
  
  if (dismissed) return null
  
  return (
    <div style={{
      background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
      border: '1px solid rgba(0, 150, 255, 0.3)',
      borderRadius: '8px',
      padding: '10px 16px',
      margin: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '13px',
      color: '#94a3b8',
      boxShadow: '0 0 15px rgba(0, 150, 255, 0.1)',
    }}>
      <span style={{ fontSize: '16px', flexShrink: 0 }}>🔧</span>
      <span style={{ flex: 1 }}>
        <strong style={{ color: '#60a5fa' }}>Scheduled Maintenance:</strong>{' '}
        Market data feeds are being optimized. Some data may be temporarily delayed. Full service will resume shortly.
      </span>
      <button 
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '2px 6px',
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  )
}
