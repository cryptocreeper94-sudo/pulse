export default function LegacyFoundersBanner({ onUpgrade }) {
  return (
    <div className="legacy-founders-banner" style={{
      background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.15), rgba(0, 212, 255, 0.1))',
      border: '1px solid rgba(157, 78, 221, 0.4)',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        background: 'radial-gradient(circle, rgba(157, 78, 221, 0.2) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      
      <div style={{ position: 'relative' }}>
        <div style={{ 
          display: 'inline-block',
          background: 'linear-gradient(135deg, #9D4EDD, #FFA500)',
          padding: '4px 12px',
          borderRadius: 20,
          fontSize: 10,
          fontWeight: 700,
          color: '#000',
          marginBottom: 12,
          letterSpacing: '1px'
        }}>
          LIMITED TIME OFFER
        </div>
        
        <h3 style={{ 
          fontSize: 20, 
          fontWeight: 800, 
          marginBottom: 8,
          background: 'linear-gradient(135deg, #9D4EDD, #FFA500, #9D4EDD)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Become a Legacy Founder
        </h3>
        
        <p style={{ color: '#ccc', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
          Lock in <strong style={{ color: '#39FF14' }}>$4/month</strong> pricing FOREVER + earn{' '}
          <strong style={{ color: '#FFA500' }}>35,000 DWT tokens</strong> on DarkWave Chain (Feb 14, 2026)
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 8,
          marginBottom: 16
        }}>
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            borderRadius: 8, 
            padding: '10px 12px',
            borderLeft: '3px solid #39FF14'
          }}>
            <div style={{ fontSize: 10, color: '#888' }}>MONTHLY PRICE</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#39FF14' }}>$4</div>
            <div style={{ fontSize: 9, color: '#666', textDecoration: 'line-through' }}>$20 after V2</div>
          </div>
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            borderRadius: 8, 
            padding: '10px 12px',
            borderLeft: '3px solid #FFA500'
          }}>
            <div style={{ fontSize: 10, color: '#888' }}>TOKEN REWARD</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#FFA500' }}>35K</div>
            <div style={{ fontSize: 9, color: '#666' }}>DWT tokens</div>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 8,
          fontSize: 11,
          color: '#aaa',
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#39FF14' }}>✓</span>
            <span>Unlimited AI analysis for cryptocurrency</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#39FF14' }}>✓</span>
            <span>FREE lifetime access after 6 months</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#39FF14' }}>✓</span>
            <span>Priority access to DarkWave Chain</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#39FF14' }}>✓</span>
            <span>Early access to all new features</span>
          </div>
        </div>
        
        <button 
          onClick={onUpgrade}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #9D4EDD, #FFA500)',
            border: 'none',
            borderRadius: 10,
            color: '#000',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 4px 20px rgba(157, 78, 221, 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          Join Legacy Founders - $4/month
        </button>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: 10, 
          fontSize: 10, 
          color: '#666' 
        }}>
          💎 First 10,000 spots • Closes Feb 14, 2026
        </div>
      </div>
    </div>
  )
}
