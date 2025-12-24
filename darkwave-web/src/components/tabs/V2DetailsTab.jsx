import { useState } from 'react'
import { CategoryPills, Accordion, AccordionItem } from '../ui'
import LegacyFoundersBanner from '../marketing/LegacyFoundersBanner'

const categories = [
  { id: 'overview', icon: '🚀', label: 'Overview' },
  { id: 'pricing', icon: '💰', label: 'Pricing' },
  { id: 'roadmap', icon: '📅', label: 'Roadmap' },
  { id: 'token', icon: '💎', label: 'DarkWave Chain' },
]

const roadmapPhases = [
  {
    phase: 'Phase 1',
    title: 'Foundation',
    status: 'completed',
    date: 'Q3 2024',
    items: ['Core platform development', 'AI agent framework', 'Beta testing with 10 users']
  },
  {
    phase: 'Phase 2',
    title: 'Beta V1 Launch',
    status: 'completed',
    date: 'Q4 2024',
    items: ['Public beta release', 'CoinGecko API integration', 'Technical indicators']
  },
  {
    phase: 'Phase 3',
    title: 'Legacy Founders Program',
    status: 'active',
    date: 'Dec 2024 - Feb 2026',
    items: ['$4/month founder pricing', '35K DWT token rewards', 'Stripe payment integration']
  },
  {
    phase: 'Phase 4',
    title: 'DarkWave Chain Launch',
    status: 'upcoming',
    date: 'Feb 14, 2026',
    items: ['L1 blockchain deployment', 'DWT token launch', 'Staking on darkwavechain.com']
  },
  {
    phase: 'Phase 5',
    title: 'V2 Premium Launch',
    status: 'upcoming',
    date: 'Q2 2026',
    items: ['$20/month standard pricing', 'Advanced ML predictions', 'Multi-exchange support']
  },
]

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['5 coin analyses/day', 'Basic market overview', 'Limited indicators'],
    highlighted: false,
    cta: 'Current Plan'
  },
  {
    name: 'Legacy Founder',
    price: '$4',
    period: '/month',
    features: [
      'Unlimited analyses',
      'All 18 AI agents',
      '35,000 DWT tokens (Feb 14, 2026)',
      'Lifetime access after 6mo',
      'Priority support',
      'Early feature access'
    ],
    highlighted: true,
    cta: 'Become a Founder',
    badge: 'BEST VALUE'
  },
  {
    name: 'Premium (V2)',
    price: '$20',
    period: '/month',
    features: ['Unlimited analyses', 'All features', 'No token rewards', 'Standard support'],
    highlighted: false,
    cta: 'Coming Feb 2026',
    disabled: true
  }
]

function RoadmapCard({ phase }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(57, 255, 20, 0.1)', border: '#39FF14', text: '#39FF14' }
      case 'active':
        return { bg: 'rgba(0, 212, 255, 0.1)', border: '#00D4FF', text: '#00D4FF' }
      default:
        return { bg: 'rgba(255, 255, 255, 0.05)', border: '#444', text: '#888' }
    }
  }
  
  const style = getStatusStyle(phase.status)
  
  return (
    <div style={{
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: style.text, fontWeight: 700 }}>{phase.phase}</span>
        <span style={{ 
          fontSize: 9, 
          padding: '3px 8px', 
          borderRadius: 10,
          background: style.text,
          color: '#000',
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          {phase.status === 'completed' ? '✓ Done' : phase.status === 'active' ? 'In Progress' : 'Upcoming'}
        </span>
      </div>
      <h4 style={{ fontSize: 16, marginBottom: 4, color: '#fff' }}>{phase.title}</h4>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>{phase.date}</div>
      <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
        {phase.items.map((item, i) => (
          <li key={i} style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function PricingCard({ tier, onSelect }) {
  return (
    <div style={{
      background: tier.highlighted 
        ? 'linear-gradient(145deg, rgba(157, 78, 221, 0.15), rgba(0, 212, 255, 0.1))'
        : '#141414',
      border: tier.highlighted 
        ? '2px solid #9D4EDD' 
        : '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      padding: 20,
      position: 'relative',
      flex: 1,
      minWidth: 200
    }}>
      {tier.badge && (
        <div style={{
          position: 'absolute',
          top: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #9D4EDD, #FFA500)',
          padding: '4px 12px',
          borderRadius: 20,
          fontSize: 9,
          fontWeight: 700,
          color: '#000',
          letterSpacing: '1px'
        }}>
          {tier.badge}
        </div>
      )}
      
      <h4 style={{ fontSize: 18, marginBottom: 8, color: '#fff' }}>{tier.name}</h4>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: tier.highlighted ? '#39FF14' : '#fff' }}>
          {tier.price}
        </span>
        <span style={{ fontSize: 12, color: '#888' }}>{tier.period}</span>
      </div>
      
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
        {tier.features.map((feature, i) => (
          <li key={i} style={{ 
            fontSize: 12, 
            color: '#aaa', 
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{ color: '#39FF14' }}>✓</span>
            {feature}
          </li>
        ))}
      </ul>
      
      <button 
        onClick={() => !tier.disabled && onSelect?.(tier)}
        disabled={tier.disabled}
        style={{
          width: '100%',
          padding: '12px',
          background: tier.highlighted 
            ? 'linear-gradient(135deg, #9D4EDD, #FFA500)'
            : tier.disabled 
              ? '#333'
              : 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: 8,
          color: tier.highlighted ? '#000' : tier.disabled ? '#666' : '#fff',
          fontSize: 12,
          fontWeight: 700,
          cursor: tier.disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {tier.cta}
      </button>
    </div>
  )
}

export default function V2DetailsTab() {
  const [activeSection, setActiveSection] = useState('overview')
  
  const handleUpgrade = () => {
    window.location.href = '/api/stripe/checkout'
  }
  
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div>
            <LegacyFoundersBanner onUpgrade={handleUpgrade} />
            
            <div className="section-box" style={{ padding: 20 }}>
              <h3 style={{ marginBottom: 16, color: '#00D4FF' }}>What's Coming in V2</h3>
              
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ 
                  background: '#1a1a1a', 
                  borderRadius: 12, 
                  padding: 16,
                  borderLeft: '3px solid #39FF14'
                }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>🤖</div>
                  <h4 style={{ marginBottom: 4 }}>ML-Powered Predictions</h4>
                  <p style={{ fontSize: 12, color: '#888' }}>
                    Machine learning models trained on historical data for improved accuracy
                  </p>
                </div>
                
                <div style={{ 
                  background: '#1a1a1a', 
                  borderRadius: 12, 
                  padding: 16,
                  borderLeft: '3px solid #9D4EDD'
                }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>💎</div>
                  <h4 style={{ marginBottom: 4 }}>DarkWave Chain</h4>
                  <p style={{ fontSize: 12, color: '#888' }}>
                    Our L1 blockchain with DWT token staking at darkwavechain.com
                  </p>
                </div>
                
                <div style={{ 
                  background: '#1a1a1a', 
                  borderRadius: 12, 
                  padding: 16,
                  borderLeft: '3px solid #FFA500'
                }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>📊</div>
                  <h4 style={{ marginBottom: 4 }}>Advanced Portfolio</h4>
                  <p style={{ fontSize: 12, color: '#888' }}>
                    Track your holdings, PnL, and get personalized recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'pricing':
        return (
          <div>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: 24 
            }}>
              <h2 style={{ marginBottom: 8 }}>Choose Your Plan</h2>
              <p style={{ color: '#888', fontSize: 13 }}>
                Lock in Legacy Founder pricing before Feb 14, 2026
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 16,
              '@media (min-width: 600px)': {
                flexDirection: 'row'
              }
            }}>
              {pricingTiers.map((tier, i) => (
                <PricingCard key={i} tier={tier} onSelect={handleUpgrade} />
              ))}
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              marginTop: 24, 
              padding: 16,
              background: 'rgba(255, 165, 0, 0.1)',
              border: '1px solid rgba(255, 165, 0, 0.3)',
              borderRadius: 12
            }}>
              <div style={{ fontSize: 12, color: '#FFA500', fontWeight: 700 }}>
                ⏰ PRICE INCREASE NOTICE
              </div>
              <p style={{ fontSize: 11, color: '#888', margin: '8px 0 0' }}>
                V2 pricing increases to $20/month on Feb 14, 2026. Lock in $4/month now.
              </p>
            </div>
          </div>
        )
        
      case 'roadmap':
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2 style={{ marginBottom: 8 }}>Development Roadmap</h2>
              <p style={{ color: '#888', fontSize: 13 }}>Our journey to V2 and beyond</p>
            </div>
            
            {roadmapPhases.map((phase, i) => (
              <RoadmapCard key={i} phase={phase} />
            ))}
          </div>
        )
        
      case 'token':
        return (
          <div>
            <div className="section-box" style={{ 
              padding: 20, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.1), rgba(255, 165, 0, 0.1))',
              border: '1px solid rgba(157, 78, 221, 0.3)'
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⛓️</div>
              <h2 style={{ 
                background: 'linear-gradient(135deg, #9D4EDD, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: 8
              }}>
                DarkWave Chain
              </h2>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
                Our Layer 1 blockchain launching February 14, 2026
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 12,
                marginBottom: 20
              }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 10, color: '#888' }}>LAUNCH DATE</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#FFA500' }}>Feb 14, 2026</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 10, color: '#888' }}>NETWORK</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#9D4EDD' }}>DarkWave L1</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 10, color: '#888' }}>TOKEN</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>DWT</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 10, color: '#888' }}>WEBSITE</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#39FF14' }}>darkwavechain.com</div>
                </div>
              </div>
              
              <a 
                href="https://darkwavechain.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #9D4EDD, #FFA500)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#000',
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
              >
                Visit DarkWave Chain
              </a>
            </div>
            
            <div className="section-box" style={{ padding: 20, marginTop: 16 }}>
              <h3 style={{ marginBottom: 16 }}>DarkWave Chain Features</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>⚡</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>DWT Token Staking</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Earn passive income with staking pools on DarkWave Chain</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>🔓</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>Ecosystem Access</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Unlock features across all DarkWave apps</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>🗳️</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>Governance</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Vote on platform decisions and features</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className="v2-details-tab">
      <CategoryPills 
        categories={categories}
        activeCategory={activeSection}
        onSelect={setActiveSection}
      />
      
      <div style={{ marginTop: 16 }}>
        {renderContent()}
      </div>
    </div>
  )
}
