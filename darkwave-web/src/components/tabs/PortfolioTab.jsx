import { BentoGrid, BentoItem } from '../ui'

export default function PortfolioTab() {
  return (
    <div className="portfolio-tab">
      <div className="section-box mb-md">
        <div style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📈</div>
          <h2 style={{ marginBottom: 8 }}>Portfolio Tracker</h2>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
            Track your cryptocurrency holdings in one place
          </p>
          <div style={{ 
            padding: 16, 
            background: 'rgba(0, 212, 255, 0.1)', 
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: 12,
            marginBottom: 16
          }}>
            <div style={{ fontSize: 12, color: '#00D4FF', marginBottom: 4 }}>TOTAL VALUE</div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>$0.00</div>
            <div style={{ fontSize: 12, color: '#888' }}>Connect your wallet to get started</div>
          </div>
          <button className="btn btn-primary">Connect Wallet</button>
        </div>
      </div>
      
      <BentoGrid columns={2}>
        <BentoItem>
          <div style={{ textAlign: 'center', padding: 12 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>💰</div>
            <div style={{ fontSize: 11, color: '#888' }}>24H CHANGE</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#39FF14' }}>+$0.00</div>
          </div>
        </BentoItem>
        <BentoItem>
          <div style={{ textAlign: 'center', padding: 12 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
            <div style={{ fontSize: 11, color: '#888' }}>ASSETS</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>0</div>
          </div>
        </BentoItem>
      </BentoGrid>
      
      <div className="section-box" style={{ marginTop: 16 }}>
        <div className="section-header">
          <h3 className="section-title">Holdings</h3>
        </div>
        <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>🔗</div>
          <p>No holdings yet. Connect your wallet to import.</p>
        </div>
      </div>
    </div>
  )
}
