import { useState } from 'react'
import './PricingTab.css'

const PLANS = [
  {
    id: 'pulse_pro',
    name: 'Pulse Pro',
    badge: 'MOST POPULAR',
    price: '$14.99',
    period: '/month',
    annualPrice: '$149.99',
    annualPeriod: '/year',
    savings: 'Save $30/yr',
    description: 'AI-powered predictions & unlimited searches',
    features: [
      'Unlimited AI searches',
      'Advanced AI predictions',
      'Full technical analysis',
      'Real-time price alerts',
      'Fear & Greed analytics',
      'Knowledge Base access',
      '2-day free trial'
    ],
    notIncluded: [
      'StrikeAgent sniper bot',
      'Multi-chain support',
      'DWAV token rewards'
    ],
    cta: 'Start Free Trial',
    popular: true,
    action: 'upgradePulseMonthly',
    annualAction: 'upgradePulseAnnual'
  },
  {
    id: 'strike_agent',
    name: 'StrikeAgent Elite',
    price: '$30',
    period: '/month',
    annualPrice: '$300',
    annualPeriod: '/year',
    savings: 'Save $60/yr',
    description: 'Full sniper bot with safety checks',
    features: [
      'AI-powered sniper bot',
      'Honeypot detection',
      'Anti-MEV protection',
      'Multi-chain support (23 chains)',
      'Built-in wallet',
      'Trade history & analytics',
      '2-day free trial'
    ],
    notIncluded: [
      'AI predictions (Pulse Pro)',
      'DWAV token rewards'
    ],
    cta: 'Start Free Trial',
    popular: false,
    action: 'upgradeStrikeMonthly',
    annualAction: 'upgradeStrikeAnnual'
  },
  {
    id: 'complete_bundle',
    name: 'DarkWave Complete',
    badge: 'BEST VALUE',
    price: '$39.99',
    period: '/month',
    annualPrice: '$399.99',
    annualPeriod: '/year',
    savings: 'Save $80/yr + $5/mo vs separate',
    description: 'Everything included - ultimate trading suite',
    features: [
      'Everything in Pulse Pro',
      'Everything in StrikeAgent Elite',
      'Priority support',
      'Early feature access',
      'Guardian Bot access',
      'Save $5/mo vs buying separately',
      '2-day free trial'
    ],
    notIncluded: [],
    cta: 'Start Free Trial',
    popular: false,
    action: 'upgradeBundleMonthly',
    annualAction: 'upgradeBundleAnnual'
  },
  {
    id: 'founder',
    name: 'Legacy Founder',
    badge: 'GRANDFATHERED',
    price: '$24',
    period: 'one-time',
    description: '6 months access + 35K DWAV tokens',
    features: [
      'Full access for 6 months',
      '35,000 DWAV tokens (Feb 14, 2026)',
      'StrikeAgent access',
      'Founding member badge',
      'No recurring billing'
    ],
    notIncluded: [],
    cta: 'No Longer Available',
    popular: false,
    disabled: true,
    legacy: true
  }
]

export default function PricingTab({ userId, currentTier }) {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')
  const [billingCycle, setBillingCycle] = useState('monthly')

  const handleUpgrade = async (plan, isAnnual = false) => {
    const action = isAnnual ? plan.annualAction : plan.action
    if (!action) return
    
    setLoading(plan.id + (isAnnual ? '_annual' : ''))
    setError('')
    
    try {
      let endpoint = ''
      switch (action) {
        case 'upgradePulseMonthly':
          endpoint = '/api/payments/stripe/create-pulse-monthly'
          break
        case 'upgradePulseAnnual':
          endpoint = '/api/payments/stripe/create-pulse-annual'
          break
        case 'upgradeStrikeMonthly':
          endpoint = '/api/payments/stripe/create-strike-monthly'
          break
        case 'upgradeStrikeAnnual':
          endpoint = '/api/payments/stripe/create-strike-annual'
          break
        case 'upgradeBundleMonthly':
          endpoint = '/api/payments/stripe/create-bundle-monthly'
          break
        case 'upgradeBundleAnnual':
          endpoint = '/api/payments/stripe/create-bundle-annual'
          break
        case 'upgradeLegacyFounder':
          endpoint = '/api/payments/stripe/create-founder'
          break
        default:
          return
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
        <p>Start your 2-day free trial • 3-day refund policy • Cancel anytime</p>
        
        <div className="billing-toggle-wrapper">
          <div className="billing-toggle">
            <button 
              className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual
            </button>
          </div>
          <span className="save-badge-standalone">Save up to 17%</span>
        </div>
      </div>

      {error && <div className="pricing-error">{error}</div>}

      <div className="pricing-grid">
        {PLANS.filter(p => !p.legacy).map((plan) => (
          <div 
            key={plan.id} 
            className={`pricing-card ${plan.popular ? 'popular' : ''} ${currentTier === plan.id ? 'current' : ''}`}
          >
            {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
            
            <div className="pricing-card-header">
              <h2>{plan.name}</h2>
              <div className="pricing-price">
                <span className="price-amount">
                  {billingCycle === 'annual' && plan.annualPrice ? plan.annualPrice : plan.price}
                </span>
                <span className="price-period">
                  {billingCycle === 'annual' && plan.annualPeriod ? plan.annualPeriod : plan.period}
                </span>
              </div>
              {billingCycle === 'annual' && plan.savings && (
                <div className="pricing-savings">{plan.savings}</div>
              )}
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
              onClick={() => handleUpgrade(plan, billingCycle === 'annual')}
              disabled={plan.disabled || loading === plan.id || loading === plan.id + '_annual' || currentTier === plan.id}
            >
              {loading === plan.id || loading === plan.id + '_annual' ? 'Processing...' : 
               currentTier === plan.id ? 'Current Plan' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="legacy-section">
        <details>
          <summary className="legacy-toggle">
            <span>🏆 Legacy Founder (Grandfathered - No longer available)</span>
          </summary>
          <div className="legacy-card">
            <p>The Legacy Founder plan was available during our early launch. Existing Founders retain their 6-month access and 35,000 DWAV tokens.</p>
          </div>
        </details>
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
            <strong>3-Day Refund Policy</strong>
            <p>Not satisfied? Get a full refund within 3 days</p>
          </div>
        </div>
        <div className="pricing-guarantee">
          <span className="guarantee-icon">&#9889;</span>
          <div>
            <strong>2-Day Free Trial</strong>
            <p>Try all features before you're charged</p>
          </div>
        </div>
      </div>

      <div className="pricing-faq">
        <h3>Frequently Asked Questions</h3>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>How does the 2-day trial work?</h4>
            <p>Start using all features immediately. You won't be charged until after 2 days. Cancel anytime during the trial.</p>
          </div>
          <div className="faq-item">
            <h4>What's the difference between Pulse Pro and StrikeAgent?</h4>
            <p>Pulse Pro focuses on AI predictions and analysis. StrikeAgent is our automated sniper bot for trading. Get both with DarkWave Complete.</p>
          </div>
          <div className="faq-item">
            <h4>Can I cancel my subscription?</h4>
            <p>Yes, cancel anytime from Settings. Your access continues until the end of your billing period.</p>
          </div>
          <div className="faq-item">
            <h4>What's the refund policy?</h4>
            <p>Full refund within 3 days of purchase, no questions asked. After that, you can still cancel but won't receive a refund.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
