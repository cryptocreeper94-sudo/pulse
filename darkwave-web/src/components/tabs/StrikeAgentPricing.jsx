import './StrikeAgentPricing.css'

const PLANS = [
  {
    id: 'free_demo',
    name: 'Free Demo',
    price: '$0',
    period: 'forever',
    description: 'Paper trading to learn the ropes',
    features: [
      'Paper trading mode',
      '10 AI discoveries/day',
      'Basic safety checks',
      'Trade history'
    ],
    cta: 'Current Plan',
    popular: false,
    disabled: true
  },
  {
    id: 'rm_monthly',
    name: 'RM+ Monthly',
    badge: 'RECOMMENDED',
    trialBadge: '3-DAY FREE TRIAL',
    price: '$8',
    period: '/month',
    description: 'Full trading power unlocked',
    features: [
      'Real trading enabled',
      'Unlimited AI discoveries',
      'Advanced safety (anti-MEV, honeypot)',
      'Multi-chain support (23 chains)',
      'Built-in wallet',
      '3-day free trial'
    ],
    cta: 'Start Free Trial',
    popular: true,
    action: 'subscribe_monthly'
  },
  {
    id: 'rm_annual',
    name: 'RM+ Annual',
    trialBadge: '3-DAY FREE TRIAL',
    price: '$80',
    period: '/year',
    savings: 'Save 17% (2 months free)',
    description: 'Best value for serious traders',
    features: [
      'Everything in Monthly',
      '2 months FREE',
      'Priority support',
      'Early feature access'
    ],
    cta: 'Start Free Trial',
    popular: false,
    action: 'subscribe_annual'
  }
]

const FAQ_ITEMS = [
  {
    question: 'How does the 3-day free trial work?',
    answer: 'Start using all RM+ features immediately. You won\'t be charged until the trial ends. Cancel anytime during the trial period.'
  },
  {
    question: 'When will I be billed?',
    answer: 'Your first charge occurs 3 days after starting the trial. After that, you\'ll be billed monthly or annually based on your plan.'
  },
  {
    question: 'Can I switch between plans?',
    answer: 'Yes, you can upgrade or downgrade anytime. When upgrading, you get immediate access. When downgrading, changes take effect at the next billing cycle.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit/debit cards through Stripe. Crypto payments coming soon.'
  }
]

export default function StrikeAgentPricing({ onSelectPlan, isDemo = true }) {
  const handleSelectPlan = (plan) => {
    if (!plan.action || plan.disabled) return
    onSelectPlan?.(plan.id)
  }

  return (
    <div className="strike-pricing">
      <div className="strike-pricing-header">
        <div className="strike-pricing-logo">
          <span className="strike-logo-icon">🎯</span>
          <span className="strike-logo-text">StrikeAgent</span>
        </div>
        <h1 className="strike-pricing-title">Upgrade Your Trading</h1>
        <p className="strike-pricing-subtitle">
          Unlock real trading, unlimited AI, and advanced safety features
        </p>
      </div>

      <div className="strike-pricing-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`strike-pricing-card ${plan.popular ? 'popular' : ''} ${plan.disabled ? 'current' : ''}`}
          >
            {plan.badge && <div className="strike-card-badge">{plan.badge}</div>}
            {plan.trialBadge && <div className="strike-trial-badge">{plan.trialBadge}</div>}

            <div className="strike-card-header">
              <h2 className="strike-plan-name">{plan.name}</h2>
              <div className="strike-price-row">
                <span className="strike-price-amount">{plan.price}</span>
                <span className="strike-price-period">{plan.period}</span>
              </div>
              {plan.savings && <div className="strike-savings">{plan.savings}</div>}
              <p className="strike-plan-description">{plan.description}</p>
            </div>

            <div className="strike-card-features">
              <ul className="strike-feature-list">
                {plan.features.map((feature, i) => (
                  <li key={i} className="strike-feature-item">
                    <span className="strike-feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`strike-cta-btn ${plan.popular ? 'primary' : 'secondary'}`}
              onClick={() => handleSelectPlan(plan)}
              disabled={plan.disabled}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="strike-pricing-footer">
        <div className="strike-guarantee">
          <span className="strike-guarantee-icon">🔒</span>
          <div className="strike-guarantee-text">
            <strong>Secure Payment</strong>
            <p>All transactions processed securely via Stripe</p>
          </div>
        </div>
        <div className="strike-guarantee">
          <span className="strike-guarantee-icon">↩️</span>
          <div className="strike-guarantee-text">
            <strong>Cancel Anytime</strong>
            <p>No lock-in, cancel your subscription anytime</p>
          </div>
        </div>
      </div>

      <div className="strike-pricing-faq">
        <h3 className="strike-faq-title">Frequently Asked Questions</h3>
        <div className="strike-faq-grid">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="strike-faq-item">
              <h4 className="strike-faq-question">{item.question}</h4>
              <p className="strike-faq-answer">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {isDemo && (
        <div className="strike-demo-notice">
          <span className="strike-demo-icon">ℹ️</span>
          <span>You're currently using the demo. Upgrade to unlock real trading.</span>
        </div>
      )}
    </div>
  )
}
