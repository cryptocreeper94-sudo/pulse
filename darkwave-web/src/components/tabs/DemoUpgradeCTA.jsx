import './SniperBotTab.css'

export default function DemoUpgradeCTA({ onUpgrade }) {
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
          <span>Unlimited AI-powered token discovery</span>
        </div>
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>Advanced safety (anti-MEV, honeypot)</span>
        </div>
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>Built-in multi-chain wallet</span>
        </div>
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>3-day free trial included</span>
        </div>
      </div>

      <button className="upgrade-btn" onClick={onUpgrade}>
        View Pricing Plans
      </button>
      <p className="upgrade-price">Starting at $8/month - Try free for 3 days</p>
    </div>
  )
}
