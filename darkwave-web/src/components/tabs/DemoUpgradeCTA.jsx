import './SniperBotTab.css'

export default function DemoUpgradeCTA({ onUpgrade }) {
  const handleUpgrade = () => {
    window.location.href = '/pricing'
  }

  return (
    <div className="demo-upgrade-cta">
      <div className="upgrade-icon">⚡</div>
      <h3 className="upgrade-title">Ready for Real Trading?</h3>
      <p className="upgrade-desc">
        Upgrade to Pulse RM+ to unlock live trading with real funds and all StrikeAgent features.
      </p>
      
      <div className="upgrade-features">
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>Real money trading on 23 chains</span>
        </div>
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>AI-powered token discovery</span>
        </div>
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>Institutional-grade safety checks</span>
        </div>
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>Smart Auto Mode</span>
        </div>
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>Multi-wallet support</span>
        </div>
      </div>

      <button className="upgrade-btn" onClick={onUpgrade || handleUpgrade}>
        Upgrade to RM+
      </button>
      <p className="upgrade-price">Starting at $29/month</p>
    </div>
  )
}
