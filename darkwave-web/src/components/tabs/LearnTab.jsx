import { useState } from 'react'
import { CategoryPills, Accordion, AccordionItem, GlossaryTerm } from '../ui'
import { searchGlossary, categories as glossaryCategories } from '../../data/glossary'

const learnCategories = [
  { id: 'founder', icon: '👤', label: 'Founder' },
  { id: 'why', icon: '🎯', label: 'Why Pulse' },
  { id: 'faqs', icon: '❓', label: 'FAQs' },
  { id: 'glossary', icon: '📖', label: 'Glossary' },
]

const faqs = [
  {
    question: 'What is Pulse?',
    answer: 'Pulse is an AI-powered predictive trading analysis platform that provides institutional-grade market insights for cryptocurrency. Our AI agents analyze market data 24/7 to deliver actionable trading signals.'
  },
  {
    question: 'How much does it cost?',
    answer: 'During our Beta V1 phase, Founders can lock in lifetime pricing at just $4/month. This includes access to all AI agents, trading signals, and 35,000 DWT tokens on DarkWave Chain.'
  },
  {
    question: 'What is DarkWave Chain?',
    answer: 'DarkWave Chain is our upcoming Layer 1 blockchain. It will host the DWT token, staking rewards, and governance features. Visit darkwavechain.com for more information. Launch: February 14, 2026.'
  },
  {
    question: 'How accurate are the predictions?',
    answer: 'Our AI models are continuously trained on market data and track prediction accuracy across 1hr, 4hr, 24hr, and 7-day timeframes. Every prediction is blockchain-stamped for transparency.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use industry-standard encryption, secure authentication, and never share your personal data. All predictions are verified on blockchain for transparency.'
  },
]

export default function LearnTab() {
  const [activeSection, setActiveSection] = useState('founder')
  const [glossaryFilter, setGlossaryFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredTerms = searchGlossary(searchQuery).filter(term => 
    glossaryFilter === 'All' || term.category === glossaryFilter
  )
  
  const renderContent = () => {
    switch (activeSection) {
      case 'founder':
        return (
          <div className="section-box">
            <div style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #00D4FF, #9D4EDD)',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36
              }}>
                👨‍💻
              </div>
              <h2 style={{ marginBottom: 8 }}>Jason</h2>
              <p style={{ color: '#00D4FF', fontSize: 12, marginBottom: 16 }}>Founder & CEO, DarkWave Studios</p>
              <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>
                Building the future of AI-powered trading analysis. With a background in software engineering 
                and a passion for democratizing financial tools, Jason created Pulse to give everyday traders 
                access to institutional-grade market intelligence.
              </p>
            </div>
          </div>
        )
        
      case 'why':
        return (
          <div className="section-box">
            <div style={{ padding: 16 }}>
              <h3 style={{ marginBottom: 16, color: '#00D4FF' }}>Why Choose Pulse?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🤖</div>
                  <h4 style={{ marginBottom: 4 }}>AI-Powered Analysis</h4>
                  <p style={{ fontSize: 12, color: '#888' }}>18 specialized AI agents analyzing markets 24/7</p>
                </div>
                <div className="card">
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⛓️</div>
                  <h4 style={{ marginBottom: 4 }}>Blockchain Verified</h4>
                  <p style={{ fontSize: 12, color: '#888' }}>Every prediction stamped on Solana for transparency</p>
                </div>
                <div className="card">
                  <div style={{ fontSize: 24, marginBottom: 8 }}>💰</div>
                  <h4 style={{ marginBottom: 4 }}>Affordable Access</h4>
                  <p style={{ fontSize: 12, color: '#888' }}>Institutional tools at $4/month for founders</p>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'faqs':
        return (
          <Accordion singleOpen={true}>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} title={faq.question} icon="❓">
                <p>{faq.answer}</p>
              </AccordionItem>
            ))}
          </Accordion>
        )
        
      case 'glossary':
        return (
          <div className="section-box">
            <div style={{ padding: 16 }}>
              <h3 style={{ marginBottom: 12 }}>Trading Glossary</h3>
              <p style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>
                Tap any term to see the full definition
              </p>
              
              <input
                type="text"
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 13,
                  marginBottom: 12
                }}
              />
              
              <div style={{ 
                display: 'flex', 
                gap: 6, 
                flexWrap: 'wrap',
                marginBottom: 16
              }}>
                {glossaryCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setGlossaryFilter(cat)}
                    style={{
                      padding: '4px 10px',
                      background: glossaryFilter === cat 
                        ? 'linear-gradient(135deg, #00D4FF, #9D4EDD)'
                        : 'rgba(255,255,255,0.05)',
                      border: glossaryFilter === cat 
                        ? 'none'
                        : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      color: glossaryFilter === cat ? '#000' : '#fff',
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 8,
                maxHeight: 400,
                overflowY: 'auto'
              }}>
                {filteredTerms.map((item, i) => (
                  <GlossaryTerm key={i} term={item.term}>
                    {item.term}
                  </GlossaryTerm>
                ))}
              </div>
              
              {filteredTerms.length === 0 && (
                <p style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>
                  No terms found matching "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className="learn-tab">
      <CategoryPills 
        categories={learnCategories}
        activeCategory={activeSection}
        onSelect={setActiveSection}
      />
      
      <div style={{ marginTop: 16 }}>
        {renderContent()}
      </div>
    </div>
  )
}
