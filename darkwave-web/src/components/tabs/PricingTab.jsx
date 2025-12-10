import { useState } from 'react'
import './PricingTab.css'

const PLANS = [
  {
    id: 'free',
    name: 'Free Trial',
    price: '$0',
    period: 'forever',
    description: 'Get started with basic access',
    features: [
      '10 AI analysis searches',
      'Basic market overview',
      'Fear & Greed index',
      'Limited chart access'
    ],
    notIncluded: [
      'Advanced AI predictions',
      'Sniper Bot access',
      'DWAV token rewards',
      'Priority support'
    ],
    cta: 'Current Plan',
    popular: false,
    disabled: true
  },
  {
    id: 'base',
    name: 'Base',
    price: '$4',
    period: '/month',
    description: 'Unlimited access for serious traders',
    features: [
      'Unlimited AI searches',
      'Advanced technical analysis',
      'Real-time price alerts',
      'Full chart access',
      'Knowledge Base access'
    ],
    notIncluded: [
      'Sniper Bot access',
      'DWAV token rewards',
      'Priority support'
    ],
    cta: 'Subscribe',
    popular: false,
    action: 'upgradeBase'
  },
  {
    id: 'founder',
    name: 'Legacy Founder',
    badge: 'BEST VALUE',
    price: '$24',
    period: 'one-time',
    description: '6 months access + lifetime token rewards',
    features: [
      'Everything in Base',
      '6 months full access',
      '35,000 DWAV tokens (Feb 14)',
      'Sniper Bot access',
      'Built-in multi-chain wallet',
      'Priority support',
      'Early feature access',
      'Founding member badge'
    ],
    notIncluded: [],
    cta: 'Claim Founder Spot',
    popular: true,
    action: 'upgradeLegacyFounder'
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$80',
    period: '/year',
    savings: 'Save $16',
    description: '12 months of full access',
    features: [
      'Everything in Base',
      '2 months FREE',
      'Sniper Bot access',
      'Built-in wallet',
      'Guardian Bot access',
      'Priority support'
    ],
    notIncluded: [
      'DWAV token rewards'
    ],
    cta: 'Subscribe Yearly',
    popular: false,
    action: 'upgradeAnnual'
  }
]

export default function PricingTab({ userId, currentTier }) {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  const handleUpgrade = async (plan) => {
    if (!plan.action) return
    
    setLoading(plan.id)
    setError('')
    
    try {
      let endpoint = ''
      if (plan.action === 'upgradeBase') {
        endpoint = '/api/payments/stripe/create-base'
      } else if (plan.action === 'upgradeLegacyFounder') {
        endpoint = '/api/payments/stripe/create-founder'
      } else if (plan.action === 'upgradeAnnual') {
        endpoint = '/api/payments/stripe/create-annual'
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId })
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        setError(data.error)
      }
    } catch (err) {
      setError(err.message || 'Failed to start checkout')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="tab-content pricing-tab">
      <div className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p>Unlock the full power of AI-driven trading analysis</p>
      </div>

      {error && <div className="pricing-error">{error}</div>}

      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <div 
            key={plan.id} 
            className={`pricing-card ${plan.popular ? 'popular' : ''} ${currentTier === plan.id ? 'current' : ''}`}
          >
            {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
            
            <div className="pricing-card-header">
              <h2>{plan.name}</h2>
              <div className="pricing-price">
                <span className="price-amount">{plan.price}</span>
                <span className="price-period">{plan.period}</span>
              </div>
              {plan.savings && <div className="pricing-savings">{plan.savings}</div>}
              <p className="pricing-description">{plan.description}</p>
            </div>

            <div className="pricing-features">
              <ul className="feature-list">
                {plan.features.map((feature, i) => (
                  <li key={i} className="feature-item included">
                    <span className="feature-icon">&#10003;</span>
                    {feature}
                  </li>
                ))}
                {plan.notIncluded.map((feature, i) => (
                  <li key={`not-${i}`} className="feature-item not-included">
                    <span className="feature-icon">&#10005;</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              className={`pricing-cta ${plan.popular ? 'primary' : 'secondary'}`}
              onClick={() => handleUpgrade(plan)}
              disabled={plan.disabled || loading === plan.id || currentTier === plan.id}
            >
              {loading === plan.id ? 'Processing...' : 
               currentTier === plan.id ? 'Current Plan' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <div className="pricing-guarantee">
          <span className="guarantee-icon">&#128274;</span>
          <div>
            <strong>Secure Payment</strong>
            <p>All transactions processed securely via Stripe</p>
          </div>
        </div>
        <div className="pricing-guarantee">
          <span className="guarantee-icon">&#128176;</span>
          <div>
            <strong>DWAV Token Launch</strong>
            <p>February 14, 2026 - Founders get 35,000 tokens</p>
          </div>
        </div>
      </div>

      <div className="pricing-faq">
        <h3>Frequently Asked Questions</h3>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>What is the DWAV token?</h4>
            <p>DWAV is the DarkWave Studios ecosystem token on Solana. It powers staking rewards, premium access, and cross-app benefits across all our products.</p>
          </div>
          <div className="faq-item">
            <h4>When do Founders get their tokens?</h4>
            <p>All Legacy Founder members receive 35,000 DWAV tokens on February 14, 2026 when the token launches.</p>
          </div>
          <div className="faq-item">
            <h4>Can I cancel my subscription?</h4>
            <p>Yes, you can cancel anytime from your Settings. Your access continues until the end of your billing period.</p>
          </div>
          <div className="faq-item">
            <h4>What payment methods are accepted?</h4>
            <p>We accept all major credit/debit cards through Stripe. Crypto payments coming soon via Coinbase Commerce.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
