import { useState, useEffect } from 'react'
import { Carousel, CategoryPills, Accordion, AccordionItem } from '../ui'

const coinCategories = [
  { id: 'cryptocat', icon: '🐱', label: 'Crypto Cat' },
  { id: 'conspiracy', icon: '👁️', label: 'Conspiracy' },
  { id: 'spiritual', icon: '✨', label: 'Spiritual' },
  { id: 'meme', icon: '🎪', label: 'Meme' },
]

const projectCoins = {
  cryptocat: [
    { id: 'ccat', name: 'CryptoCat', ticker: '$CCAT', logo: '/coins/ccat-cryptocat.jpg' },
    { id: 'cwc', name: 'Cat Wif Cash', ticker: '$CWC', logo: '/coins/cwc-catwifcash.png' },
    { id: 'uncat', name: 'Uncertainty Cat', ticker: '$UNCAT', logo: '/coins/uncat-uncertainty.jpg' },
    { id: 'rektmeow', name: 'RektMeow', ticker: '$REKT', logo: '/coins/rektmeow-liquidation.jpg' },
  ],
  conspiracy: [
    { id: 'obey', name: 'Illuminati', ticker: '$OBEY', logo: '/coins/obey-illuminati.jpg' },
    { id: 'v25', name: 'Vertigo', ticker: '$V25', logo: '/coins/v25-vertigo.jpg' },
    { id: 'p25', name: 'Pumpocracy', ticker: '$P25', logo: '/coins/p25-pumpocracy.jpg' },
    { id: 'insane', name: 'Overstimulated', ticker: '$INSANE', logo: '/coins/insane-overstimulated.jpg' },
  ],
  spiritual: [
    { id: 'yah', name: 'Yahuah', ticker: '$YAH', logo: '/coins/yah-yahuah.jpg' },
    { id: 'yahu', name: 'Yahusha', ticker: '$YAHU', logo: '/coins/yahu-yahusha.jpg' },
    { id: 'jh25', name: 'Justice', ticker: '$JH25', logo: '/coins/jh25-justice.jpg' },
  ],
  meme: [
    { id: 'love', name: 'United', ticker: '$LOVE', logo: '/coins/love-united.jpg' },
    { id: 'cheers', name: 'Pumpaholic', ticker: '$CHEERS', logo: '/coins/cheers-pumpaholic.jpg' },
    { id: 'rhodi', name: 'Rhodium', ticker: '$RHODI', logo: '/coins/rhodi-rhodium.jpg' },
  ],
}

const agentStyles = [
  { id: 'pixar', label: 'Friendly', icon: '😊' },
  { id: 'serious', label: 'Professional', icon: '🕶️' },
  { id: 'anime', label: 'Anime', icon: '✨' },
  { id: 'headshot', label: 'Headshots', icon: '👤' },
]

const agents = [
  { id: 1, name: 'Devon', specialty: 'Market Analysis', slug: 'devon', fallback: '/trading-cards-cutouts/caucasian_brown-haired_male.png' },
  { id: 2, name: 'Claire', specialty: 'Technical Trading', slug: 'claire', fallback: '/trading-cards-cutouts/caucasian_blonde_female.png' },
  { id: 3, name: 'Marcus', specialty: 'Risk Management', slug: 'marcus', fallback: '/trading-cards-cutouts/african_american_bald_male.png' },
  { id: 4, name: 'Aria', specialty: 'DeFi Expert', slug: 'aria', fallback: '/trading-cards-cutouts/asian_female_agent.png' },
  { id: 5, name: 'Jin', specialty: 'Altcoin Hunter', slug: 'jin', fallback: '/trading-cards-cutouts/asian_male_agent_headshot.png' },
  { id: 6, name: 'Sophia', specialty: 'Macro Analysis', slug: 'sophia', fallback: '/trading-cards-cutouts/latina_female_agent.png' },
  { id: 7, name: 'Rafael', specialty: 'Whale Tracker', slug: 'rafael', fallback: '/trading-cards-cutouts/latino_male_agent.png' },
  { id: 8, name: 'Zara', specialty: 'NFT Analytics', slug: 'zara', fallback: '/trading-cards-cutouts/african_american_female_agent.png' },
  { id: 9, name: 'Blake', specialty: 'Meme Coin Expert', slug: 'blake', fallback: '/trading-cards-cutouts/caucasian_redhead_male_agent.png' },
  { id: 10, name: 'Luna', specialty: 'Sentiment Analysis', slug: 'luna', fallback: '/trading-cards-cutouts/mixed_asian-caucasian_female.png' },
  { id: 11, name: 'Kai', specialty: 'Derivatives', slug: 'kai', fallback: '/trading-cards-cutouts/mixed_asian-caucasian_male.png' },
  { id: 12, name: 'Maya', specialty: 'Yield Farming', slug: 'maya', fallback: '/trading-cards-cutouts/mixed_black-caucasian_female.png' },
  { id: 13, name: 'Jasper', specialty: 'Layer 2 Expert', slug: 'jasper', fallback: '/trading-cards-cutouts/mixed_black-caucasian_male.png' },
  { id: 14, name: 'Nina', specialty: 'Stablecoin Strategy', slug: 'nina', fallback: '/trading-cards-cutouts/mixed_black-latina_female.png' },
  { id: 15, name: 'Carlos', specialty: 'Exchange Arbitrage', slug: 'carlos', fallback: '/trading-cards-cutouts/mixed_black-latino_male.png' },
  { id: 16, name: 'Jade', specialty: 'Airdrop Hunter', slug: 'jade', fallback: '/trading-cards-cutouts/mixed_latina-asian_female.png' },
  { id: 17, name: 'Eli', specialty: 'Smart Money Flow', slug: 'eli', fallback: '/trading-cards-cutouts/mixed_latino-asian_male.png' },
  { id: 18, name: 'CryptoCat', specialty: 'Head Analyst', slug: 'cryptocat', fallback: '/trading-cards-cutouts/Grumpy_orange_Crypto_Cat_ac1ff7e8.png' },
]

function getAgentImage(agent, style) {
  if (style === 'headshot') {
    return agent.fallback
  }
  return `/agents/${style}/${agent.slug}.png`
}

function CoinCard({ coin, onClick }) {
  return (
    <div className="coin-card" onClick={() => onClick?.(coin)}>
      <img 
        src={coin.logo} 
        alt={coin.name} 
        className="coin-logo"
        onError={(e) => e.target.src = '/darkwave-coin.png'}
      />
      <div className="coin-name">{coin.name}</div>
      <div className="coin-ticker">{coin.ticker}</div>
    </div>
  )
}

function AgentCard({ agent, style }) {
  const imageSrc = getAgentImage(agent, style)
  const isFullBody = style !== 'headshot'
  
  return (
    <div className="agent-card" style={{ 
      width: isFullBody ? 160 : 140, 
      textAlign: 'center',
      background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
      borderRadius: 12,
      padding: '12px 8px',
      border: '1px solid rgba(255,255,255,0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}>
      <div style={{ 
        width: isFullBody ? 120 : 80, 
        height: isFullBody ? 160 : 80, 
        borderRadius: isFullBody ? 12 : '50%', 
        background: 'linear-gradient(135deg, #00D4FF, #9D4EDD)',
        margin: '0 auto 10px',
        overflow: 'hidden',
        border: '2px solid rgba(0, 212, 255, 0.5)',
        boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
      }}>
        <img 
          src={imageSrc} 
          alt={agent.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center'
          }}
          onError={(e) => {
            if (e.target.dataset.triedFallback !== 'true') {
              e.target.dataset.triedFallback = 'true'
              e.target.src = agent.fallback
            } else {
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = '<span style="font-size:32px;display:flex;align-items:center;justify-content:center;height:100%;">👤</span>'
            }
          }}
        />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{agent.name}</div>
      <div style={{ fontSize: 10, color: '#00D4FF', fontWeight: 600 }}>{agent.specialty}</div>
    </div>
  )
}

function StylePicker({ activeStyle, onSelect }) {
  return (
    <div style={{ 
      display: 'flex', 
      gap: 6, 
      marginBottom: 12,
      overflowX: 'auto',
      paddingBottom: 4
    }}>
      {agentStyles.map(style => (
        <button
          key={style.id}
          onClick={() => onSelect(style.id)}
          style={{
            padding: '6px 12px',
            background: activeStyle === style.id 
              ? 'linear-gradient(135deg, #00D4FF, #9D4EDD)'
              : 'rgba(255,255,255,0.05)',
            border: activeStyle === style.id 
              ? 'none'
              : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            color: activeStyle === style.id ? '#000' : '#fff',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <span>{style.icon}</span>
          <span>{style.label}</span>
        </button>
      ))}
    </div>
  )
}

export default function ProjectsTab() {
  const [activeCategory, setActiveCategory] = useState('cryptocat')
  const [agentStyle, setAgentStyle] = useState(() => {
    return localStorage.getItem('pulse-agent-style') || 'pixar'
  })
  
  useEffect(() => {
    localStorage.setItem('pulse-agent-style', agentStyle)
  }, [agentStyle])
  
  const handleCoinClick = (coin) => {
    console.log('Open coin details for', coin.name)
  }
  
  return (
    <div className="projects-tab">
      <div className="section-box mb-md" style={{ 
        background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.1), rgba(0, 212, 255, 0.1))',
        border: '1px solid rgba(57, 255, 20, 0.3)'
      }}>
        <div style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#39FF14', fontWeight: 700, marginBottom: 4 }}>
            ⭐ FEATURED
          </div>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>United ($LOVE)</h2>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
            💜 United in Love & Community. Live on Solana.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => window.open('https://jup.ag/swap/SOL-Gvt8zjmMrUXKgvckQzJMobsegF373M6ALYtmCq6qpump', '_blank')}
          >
            🪐 Buy on Jupiter
          </button>
        </div>
      </div>
      
      <div className="section-box mb-md">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h3 className="section-title">🕵️ Agent Series</h3>
          <div style={{ fontSize: 10, color: '#888' }}>Choose your style</div>
        </div>
        <div className="section-content">
          <StylePicker activeStyle={agentStyle} onSelect={setAgentStyle} />
          <Carousel itemWidth={agentStyle === 'headshot' ? 140 : 160}>
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} style={agentStyle} />
            ))}
          </Carousel>
        </div>
      </div>
      
      <div className="section-box mb-md">
        <div className="section-header">
          <h3 className="section-title">🪙 Project Coins</h3>
        </div>
        <div className="section-content">
          <CategoryPills 
            categories={coinCategories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
          
          <Carousel itemWidth={160}>
            {projectCoins[activeCategory]?.map(coin => (
              <CoinCard 
                key={coin.id} 
                coin={coin}
                onClick={handleCoinClick}
              />
            ))}
          </Carousel>
        </div>
      </div>
      
      <Accordion singleOpen={true}>
        <AccordionItem title="Submit Your Project" icon="📝">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input 
              type="text" 
              placeholder="Token Ticker (e.g., PULSE)"
              style={{
                padding: '12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14
              }}
            />
            <input 
              type="text" 
              placeholder="Token Name"
              style={{
                padding: '12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14
              }}
            />
            <input 
              type="text" 
              placeholder="Contract Address"
              style={{
                padding: '12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14
              }}
            />
            <button className="btn btn-primary">Submit for Review</button>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
