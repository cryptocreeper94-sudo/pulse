import './GuardianAITab.css'

export default function GuardianAITab() {
  return (
    <div className="guardian-tab">
      {/* Hero Section */}
      <div className="guardian-hero">
        <div className="hero-shield">
          <div className="shield-glow"></div>
          <div className="shield-icon">🛡️</div>
        </div>
        <h1>Guardian AI</h1>
        <p className="hero-tagline">The World's First Certification System for AI Agents</p>
      </div>

      {/* Problem Statement */}
      <div className="guardian-section problem-section">
        <div className="section-badge">The Problem</div>
        <h2>The AI Agent Trust Crisis</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">1M+</div>
            <div className="stat-label">AI agents projected on-chain by end of 2025</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">$50B+</div>
            <div className="stat-label">AI crypto market cap and growing</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">21,000+</div>
            <div className="stat-label">AI agent tokens launched in a single month</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">ZERO</div>
            <div className="stat-label">Industry-wide certification standards... until now</div>
          </div>
        </div>
        <p className="problem-text">
          Users have <strong>no way to verify</strong> which AI agents are safe. Malicious bots can drain wallets, 
          manipulate trades, and steal funds. The industry needed a trust layer.
        </p>
      </div>

      {/* Solution Section */}
      <div className="guardian-section solution-section">
        <div className="section-badge solution">The Solution</div>
        <h2>Comprehensive Trust Verification</h2>
        
        <div className="trust-metrics">
          <div className="metric-card">
            <div className="metric-icon">🔒</div>
            <h3>Security Score</h3>
            <p>Code integrity, vulnerabilities, access control analysis</p>
          </div>
          <div className="metric-card">
            <div className="metric-icon">👁️</div>
            <h3>Transparency Score</h3>
            <p>Open source status, documentation, audit history</p>
          </div>
          <div className="metric-card">
            <div className="metric-icon">⚡</div>
            <h3>Reliability Score</h3>
            <p>Uptime, error handling, edge case coverage</p>
          </div>
          <div className="metric-card">
            <div className="metric-icon">✓</div>
            <h3>Compliance Score</h3>
            <p>Regulatory alignment, data handling, consent</p>
          </div>
        </div>
      </div>

      {/* For Developers / For Users */}
      <div className="guardian-section dual-section">
        <div className="dual-card developers">
          <div className="dual-header">
            <span className="dual-icon">👨‍💻</span>
            <h3>For AI Developers</h3>
          </div>
          <ul>
            <li>Submit agents for comprehensive security review</li>
            <li>Receive trust scores across 4 dimensions</li>
            <li>Get listed in the public Guardian AI Registry</li>
            <li>Earn the <strong>Guardian AI Certified</strong> badge</li>
            <li>Certified agents see <strong>3x higher adoption</strong></li>
          </ul>
        </div>
        <div className="dual-card users">
          <div className="dual-header">
            <span className="dual-icon">👥</span>
            <h3>For Users</h3>
          </div>
          <ul>
            <li>Search certified AI agents before trusting them</li>
            <li>View trust scores on a 0-100 scale</li>
            <li>Verify certification status on-chain</li>
            <li>Make informed decisions about which bots to use</li>
            <li>Protect your wallet from malicious agents</li>
          </ul>
        </div>
      </div>

      {/* Certification Tiers */}
      <div className="guardian-section tiers-section">
        <div className="section-badge tiers">Certification Tiers</div>
        <h2>Choose Your Level</h2>
        
        <div className="tiers-grid">
          <div className="tier-card basic">
            <div className="tier-name">Basic</div>
            <div className="tier-price">$999</div>
            <div className="tier-duration">3-5 days • 6 month validity</div>
            <ul className="tier-features">
              <li>Automated analysis</li>
              <li>Basic security scan</li>
              <li>Registry listing</li>
              <li>Certified badge</li>
            </ul>
          </div>
          <div className="tier-card advanced">
            <div className="tier-badge-popular">Most Popular</div>
            <div className="tier-name">Advanced</div>
            <div className="tier-price">$4,999</div>
            <div className="tier-duration">1-2 weeks • 12 month validity</div>
            <ul className="tier-features">
              <li>Deep code review</li>
              <li>API security analysis</li>
              <li>Attack simulation</li>
              <li>Priority support</li>
            </ul>
          </div>
          <div className="tier-card enterprise">
            <div className="tier-name">Enterprise</div>
            <div className="tier-price">$14,999</div>
            <div className="tier-duration">3-4 weeks • 24 month validity</div>
            <ul className="tier-features">
              <li>Full security audit</li>
              <li>Penetration testing</li>
              <li>Formal verification</li>
              <li>Guardian Shield monitoring</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="guardian-cta">
        <div className="cta-content">
          <h2>Ready to Get Certified?</h2>
          <p>Join the growing registry of trusted AI agents and stand out from the noise.</p>
          <div className="cta-buttons">
            <a 
              href="https://dwsc.io/guardian-ai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="cta-btn primary"
            >
              <span className="btn-icon">🛡️</span>
              Submit for Certification
            </a>
            <a 
              href="https://dwsc.io/guardian-ai-registry" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="cta-btn secondary"
            >
              View Certified Registry
            </a>
          </div>
        </div>
        <div className="cta-badge">
          <div className="badge-shield">🛡️</div>
          <div className="badge-text">Guardian AI Certified</div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="guardian-footer">
        <p>"Before you give an AI bot access to your wallet, check if it's Guardian Certified."</p>
      </div>
    </div>
  )
}
