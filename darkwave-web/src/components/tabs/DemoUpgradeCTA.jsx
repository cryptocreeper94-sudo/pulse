import './SniperBotTab.css'

export default function DemoUpgradeCTA({ onUpgrade }) {
  const handleSubscribe = () => {
    window.location.href = 'https://darkwavepulse.com/app?tab=pricing'
  }

  return (
    <div className="demo-upgrade-cta">
      <div className="upgrade-badge">StrikeAgent Elite</div>
      <div className="upgrade-icon">🎯</div>
      <h3 className="upgrade-title">Ready to Trade for Real?</h3>
      <p className="upgrade-desc">
        You've seen what StrikeAgent can do. Subscribe now to execute real trades with AI-powered precision across 23 blockchains.
      </p>
      
      <div className="upgrade-features">
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>Real money trading on Solana + 22 EVM chains</span>
        </div>
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>Unlimited AI token discovery with safety scoring</span>
        </div>
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>Anti-MEV protection & honeypot simulation</span>
        </div>
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>Built-in multi-chain HD wallet with encryption</span>
        </div>
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>Priority Telegram alerts for hot tokens</span>
        </div>
        <div className="upgrade-feature">
          <span className="upgrade-feature-icon">✓</span>
          <span>2-day free trial - cancel anytime</span>
        </div>
      </div>

      <button className="upgrade-btn" onClick={onUpgrade || handleSubscribe}>
        Subscribe Now
      </button>
      <p className="upgrade-price">
        <strong>$30/month</strong> or <strong>$300/year</strong> (save 17%)
      </p>
    </div>
  )
}
