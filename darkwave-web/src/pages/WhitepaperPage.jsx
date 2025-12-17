import { useState } from 'react';

const glassmorphism = {
  background: 'rgba(26, 26, 26, 0.6)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
};

const TOKEN_ALLOCATION = [
  { label: 'Public Sale', amount: 40, color: '#00D4FF' },
  { label: 'Development', amount: 20, color: '#8B5CF6' },
  { label: 'Team', amount: 15, color: '#39FF14' },
  { label: 'Marketing', amount: 10, color: '#FFB800' },
  { label: 'Liquidity', amount: 10, color: '#FF6B35' },
  { label: 'Reserve', amount: 5, color: '#FF4444' },
];

const VESTING_SCHEDULE = [
  { category: 'Public Sale', cliff: 'None', vest: 'Immediate', color: '#00D4FF' },
  { category: 'Team', cliff: '6 months', vest: '12 months linear', color: '#39FF14' },
  { category: 'Development', cliff: 'None', vest: 'As needed', color: '#8B5CF6' },
  { category: 'Marketing', cliff: 'None', vest: 'Unlocked', color: '#FFB800' },
  { category: 'Liquidity', cliff: 'None', vest: 'Locked in DEX', color: '#FF6B35' },
  { category: 'Reserve', cliff: '12 months', vest: 'Locked', color: '#FF4444' },
];

const ROADMAP = [
  { phase: 'Q4 2024 - Q1 2025', title: 'Foundation', status: 'complete', items: ['Core platform launch', 'AI Agent system (18 agents)', 'Blockchain audit trail', 'Multi-chain wallet'] },
  { phase: 'Q2 2025', title: 'Enhancement', status: 'current', items: ['ML accuracy tracking', 'StrikeAgent beta', 'Premium subscription launch', 'Telegram bot upgrade'] },
  { phase: 'Q1 2026', title: 'Token Launch', status: 'upcoming', items: ['Smart contract deployment', 'DWAV token launch (Feb 14)', 'Staking system activation', 'Governance framework'] },
  { phase: 'Q2-Q4 2026', title: 'Expansion', status: 'future', items: ['Mobile apps (iOS/Android)', 'NFT Trading Cards', 'Partner integrations', 'International expansion'] },
];

const REVENUE_PROJECTIONS = [
  { year: '2025', subscribers: '500', arr: '$48K' },
  { year: '2026', subscribers: '5,000', arr: '$600K' },
  { year: '2027', subscribers: '25,000', arr: '$3M' },
  { year: '2028', subscribers: '70,000', arr: '$8.4M' },
];

const PieChart = ({ data }) => {
  let cumulativePercent = 0;
  
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ width: '220px', height: '220px', transform: 'rotate(-90deg)' }}>
        {data.map((slice, i) => {
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
          cumulativePercent += slice.amount / 100;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          const largeArcFlag = slice.amount > 50 ? 1 : 0;
          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
          ].join(' ');
          return (
            <path
              key={i}
              d={pathData}
              fill={slice.color}
              stroke="#0f0f0f"
              strokeWidth="0.02"
              style={{ filter: `drop-shadow(0 0 8px ${slice.color}40)` }}
            />
          );
        })}
        <circle cx="0" cy="0" r="0.5" fill="#0f0f0f" />
        <text x="0" y="0.05" textAnchor="middle" fill="#fff" fontSize="0.2" fontWeight="700" style={{ transform: 'rotate(90deg)' }}>100M</text>
        <text x="0" y="0.22" textAnchor="middle" fill="#888" fontSize="0.1" style={{ transform: 'rotate(90deg)' }}>DWAV</text>
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', width: '100%' }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color, boxShadow: `0 0 8px ${item.color}60` }} />
            <span style={{ color: '#ccc', fontSize: '12px' }}>{item.label} ({item.amount}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatBox = ({ value, label, color = '#00D4FF' }) => (
  <div style={{
    ...glassmorphism,
    padding: '20px',
    borderRadius: '12px',
    border: `1px solid ${color}30`,
    textAlign: 'center',
  }}>
    <div style={{ fontSize: '28px', fontWeight: '700', color, marginBottom: '4px' }}>{value}</div>
    <div style={{ fontSize: '12px', color: '#888' }}>{label}</div>
  </div>
);

const SectionCard = ({ id, title, icon, children, color = '#00D4FF' }) => (
  <section id={id} style={{
    ...glassmorphism,
    padding: '32px',
    borderRadius: '16px',
    border: `1px solid ${color}20`,
    marginBottom: '24px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
      <span style={{ fontSize: '28px' }}>{icon}</span>
      <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: '600' }}>{title}</h2>
    </div>
    {children}
  </section>
);

const TimelineItem = ({ phase, title, status, items }) => {
  const statusColors = {
    complete: '#39FF14',
    current: '#00D4FF',
    upcoming: '#FFB800',
    future: '#888',
  };
  const color = statusColors[status];
  
  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 12px ${color}60`,
        }} />
        <div style={{ width: '2px', flex: 1, background: '#333', marginTop: '8px' }} />
      </div>
      <div style={{ flex: 1, paddingBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{phase}</div>
        <div style={{ fontSize: '18px', fontWeight: '600', color, marginBottom: '12px' }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ccc' }}>
              <span style={{ color }}>{status === 'complete' ? '✓' : '○'}</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TableOfContents = ({ activeSection }) => {
  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'problem', label: 'The Problem' },
    { id: 'solution', label: 'The Solution' },
    { id: 'strikeagent', label: 'StrikeAgent' },
    { id: 'tokenomics', label: 'Tokenomics' },
    { id: 'utility', label: 'Utility' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div style={{
      ...glassmorphism,
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #2a2a2a',
      position: 'sticky',
      top: '80px',
    }}>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Contents</div>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          style={{
            display: 'block',
            padding: '8px 12px',
            marginBottom: '4px',
            borderRadius: '6px',
            color: activeSection === section.id ? '#00D4FF' : '#888',
            background: activeSection === section.id ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
            textDecoration: 'none',
            fontSize: '13px',
            transition: 'all 0.2s ease',
          }}
        >
          {section.label}
        </a>
      ))}
    </div>
  );
};

export default function WhitepaperPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const handleDownload = () => {
    window.open('/docs/DWAV_WHITEPAPER.md', '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <div style={{
        background: 'linear-gradient(180deg, rgba(0, 212, 255, 0.08) 0%, transparent 50%)',
        padding: '60px 20px 40px',
        textAlign: 'center',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(57, 255, 20, 0.1)',
            border: '1px solid rgba(57, 255, 20, 0.3)',
            padding: '6px 14px',
            borderRadius: '20px',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '12px', color: '#39FF14' }}>Version 1.0 | December 2024</span>
          </div>
          
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: '800',
            color: '#fff',
            margin: '0 0 16px',
            letterSpacing: '-1px',
          }}>
            DWAV Token <span style={{ color: '#00D4FF' }}>Whitepaper</span>
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: '#9ca3af',
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: 1.6,
          }}>
            The official documentation for DWAV, the utility token powering the DarkWave Studios ecosystem and PULSE trading platform.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownload}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
              }}
            >
              <span>📄</span> Download Whitepaper
            </button>
            <a
              href="#tokenomics"
              style={{
                padding: '14px 28px',
                background: 'transparent',
                border: '1px solid #00D4FF',
                borderRadius: '10px',
                color: '#00D4FF',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              View Tokenomics
            </a>
          </div>
        </div>
      </div>

      <div style={{
        background: '#0a0a0a',
        padding: '24px 20px',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
        }}>
          <StatBox value="100M" label="Total Supply" color="#00D4FF" />
          <StatBox value="0%" label="Buy Tax" color="#39FF14" />
          <StatBox value="5%" label="Sell Tax" color="#FFB800" />
          <StatBox value="Feb 14, 2026" label="Launch Date" color="#8B5CF6" />
          <StatBox value="12-24%" label="Staking APY" color="#FF6B35" />
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          
          <SectionCard id="overview" title="Executive Summary" icon="📋" color="#00D4FF">
            <p style={{ color: '#ccc', lineHeight: 1.8, fontSize: '15px', marginBottom: '20px' }}>
              DarkWave Studios is building the future of AI-powered trading intelligence. Our flagship platform, <strong style={{ color: '#00D4FF' }}>PULSE</strong>, combines advanced artificial intelligence, real-time market data, and blockchain technology to deliver institutional-grade analytics to retail traders worldwide.
            </p>
            <p style={{ color: '#ccc', lineHeight: 1.8, fontSize: '15px', marginBottom: '24px' }}>
              <strong style={{ color: '#39FF14' }}>DWAV</strong> is the native utility token powering this ecosystem, providing holders with staking rewards, premium access discounts, governance rights, and exclusive benefits across all DarkWave products.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              {[
                { icon: '🤖', text: 'Operational Product with 18 AI Agents' },
                { icon: '⛓️', text: 'Blockchain Verification on Solana' },
                { icon: '🌐', text: '23+ Chains Supported' },
                { icon: '🔒', text: 'WebAuthn Biometric Security' },
                { icon: '📈', text: 'Path to $8.4M ARR by 2028' },
                { icon: '📅', text: 'Token Launch: Feb 14, 2026' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  background: 'rgba(0, 212, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 212, 255, 0.1)',
                }}>
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <span style={{ color: '#fff', fontSize: '13px' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard id="problem" title="The Problem" icon="⚠️" color="#FF4444">
            <p style={{ color: '#ccc', lineHeight: 1.8, fontSize: '15px', marginBottom: '20px' }}>
              The cryptocurrency and stock markets are dominated by institutional players with access to advanced analytics, real-time data, dedicated research teams, and sophisticated risk management systems. Meanwhile, retail traders face:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}>
              {[
                { title: 'Information Gap', desc: 'Hours behind institutions' },
                { title: 'Analysis Paralysis', desc: 'Too much data, no insight' },
                { title: 'Emotional Trading', desc: 'Fear and greed drive losses' },
                { title: 'Fragmented Tools', desc: 'No unified view' },
                { title: 'Security Risks', desc: 'Vulnerable to scams' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '16px',
                  background: 'rgba(255, 68, 68, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 68, 68, 0.1)',
                }}>
                  <div style={{ color: '#FF4444', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ color: '#888', fontSize: '12px' }}>{item.desc}</div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: '24px',
              padding: '20px',
              background: 'rgba(255, 68, 68, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 68, 68, 0.2)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#FF4444' }}>90%</div>
              <div style={{ color: '#ccc', fontSize: '14px' }}>of retail traders lose money due to lack of proper tools</div>
            </div>
          </SectionCard>

          <SectionCard id="solution" title="The Solution: PULSE" icon="💡" color="#39FF14">
            <p style={{ color: '#ccc', lineHeight: 1.8, fontSize: '15px', marginBottom: '24px' }}>
              PULSE democratizes access to institutional-grade analytics through AI-powered trading intelligence, blockchain verification, and comprehensive security.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
            }}>
              {[
                { icon: '🤖', title: 'AI Agent System', desc: '18 unique AI personas with specialized expertise in technical analysis, fundamentals, risk management, and market psychology' },
                { icon: '⛓️', title: 'Blockchain Verification', desc: 'Every AI prediction is hashed to Solana mainnet, creating an immutable record for radical transparency' },
                { icon: '💼', title: 'Multi-Chain Wallet', desc: 'Integrated wallet supporting 23+ blockchain networks with biometric security' },
                { icon: '📊', title: 'Real-Time Analytics', desc: 'Live market data, fear & greed indices, altcoin season tracking, and comprehensive charting' },
              ].map((item, i) => (
                <div key={i} style={{
                  ...glassmorphism,
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(57, 255, 20, 0.2)',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                  <div style={{ color: '#39FF14', fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>{item.title}</div>
                  <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard id="strikeagent" title="StrikeAgent: Autonomous Trading" icon="⚡" color="#FF6B35">
            <p style={{ color: '#ccc', lineHeight: 1.8, fontSize: '15px', marginBottom: '24px' }}>
              StrikeAgent is our revolutionary AI-powered autonomous trading system that executes trades based on proven prediction accuracy. As our AI's accuracy surpasses key thresholds, it earns the ability to make trading decisions with configurable levels of autonomy.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}>
              {[
                { mode: 'Observer', desc: 'AI monitors and suggests trades', color: '#888', icon: '👁️' },
                { mode: 'Approval', desc: 'Trades require manual confirmation', color: '#00D4FF', icon: '✋' },
                { mode: 'Semi-Auto', desc: 'Small trades auto-execute', color: '#FFB800', icon: '⚙️' },
                { mode: 'Full-Auto', desc: 'AI executes with safety limits', color: '#39FF14', icon: '🤖' },
              ].map((item, i) => (
                <div key={i} style={{
                  ...glassmorphism,
                  padding: '20px',
                  borderRadius: '12px',
                  border: `1px solid ${item.color}30`,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ color: item.color, fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>{item.mode}</div>
                  <div style={{ color: '#888', fontSize: '12px' }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <div style={{
              ...glassmorphism,
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 107, 53, 0.2)',
              marginBottom: '20px',
            }}>
              <h4 style={{ color: '#FF6B35', fontSize: '16px', marginBottom: '16px' }}>Key Features</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                {[
                  'Real-time token discovery with safety filters',
                  'Multi-chain support (Solana + 22 EVM chains)',
                  'Configurable risk parameters and position limits',
                  'Automatic stop-loss and take-profit execution',
                  'ML-powered signal accuracy tracking',
                  'WebAuthn biometric transaction confirmation',
                ].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#39FF14' }}>✓</span>
                    <span style={{ color: '#ccc', fontSize: '13px' }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(57, 255, 20, 0.05))',
              borderRadius: '10px',
              border: '1px solid rgba(255, 107, 53, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>🔐</span>
                <div>
                  <div style={{ color: '#FF6B35', fontWeight: '600', fontSize: '14px' }}>Safety First Architecture</div>
                  <div style={{ color: '#888', fontSize: '12px' }}>Daily loss limits, position caps, and emergency stop functionality protect your capital</div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="tokenomics" title="Token Economics" icon="🪙" color="#00D4FF">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px',
              marginBottom: '32px',
            }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>Token Allocation</h3>
                <PieChart data={TOKEN_ALLOCATION} />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>Vesting Schedule</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {VESTING_SCHEDULE.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'rgba(15, 15, 15, 0.6)',
                      borderRadius: '8px',
                      borderLeft: `3px solid ${item.color}`,
                    }}>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{item.category}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: item.color, fontSize: '12px' }}>{item.cliff} cliff</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>{item.vest}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              ...glassmorphism,
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
            }}>
              <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>Tax Structure</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#39FF14' }}>0%</div>
                  <div style={{ color: '#888', fontSize: '13px' }}>Buy Tax</div>
                  <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>Encourage accumulation</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#FFB800' }}>5%</div>
                  <div style={{ color: '#888', fontSize: '13px' }}>Sell Tax</div>
                  <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>Revenue generation</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#FF6B35' }}>5%</div>
                  <div style={{ color: '#888', fontSize: '13px' }}>Transfer Tax</div>
                  <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>Anti-manipulation</div>
                </div>
              </div>
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px' }}>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Tax Distribution</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#00D4FF', fontSize: '13px' }}>2% Treasury</span>
                  <span style={{ color: '#39FF14', fontSize: '13px' }}>2% Liquidity</span>
                  <span style={{ color: '#8B5CF6', fontSize: '13px' }}>1% Marketing</span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="utility" title="Token Utility" icon="🔧" color="#8B5CF6">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}>
              {[
                { icon: '💰', title: 'Staking Rewards', desc: '12-24% APY from platform revenue', color: '#39FF14' },
                { icon: '🎫', title: 'Premium Discounts', desc: 'Up to 50% off subscriptions', color: '#00D4FF' },
                { icon: '🗳️', title: 'Governance Rights', desc: 'Vote on platform decisions', color: '#8B5CF6' },
                { icon: '🎴', title: 'NFT Trading Cards', desc: 'Unlock exclusive AI agents', color: '#FFB800' },
                { icon: '🌐', title: 'Cross-App Benefits', desc: 'Rewards across ecosystem', color: '#FF6B35' },
              ].map((item, i) => (
                <div key={i} style={{
                  ...glassmorphism,
                  padding: '20px',
                  borderRadius: '12px',
                  border: `1px solid ${item.color}20`,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>{item.icon}</div>
                  <div style={{ color: item.color, fontWeight: '600', fontSize: '15px', marginBottom: '6px' }}>{item.title}</div>
                  <div style={{ color: '#888', fontSize: '12px' }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Holder Discount Tiers</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                {[
                  { hold: '1,000', discount: '5%' },
                  { hold: '10,000', discount: '15%' },
                  { hold: '50,000', discount: '25%' },
                  { hold: '100,000', discount: '50%' },
                ].map((tier, i) => (
                  <div key={i} style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(0, 212, 255, 0.1))',
                    borderRadius: '10px',
                    textAlign: 'center',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                  }}>
                    <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700' }}>{tier.hold} DWAV</div>
                    <div style={{ color: '#8B5CF6', fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>{tier.discount} OFF</div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <SectionCard id="roadmap" title="Roadmap" icon="🗺️" color="#FFB800">
              {ROADMAP.map((phase, i) => (
                <TimelineItem key={i} {...phase} />
              ))}
            </SectionCard>

            <SectionCard id="revenue" title="Revenue Projections" icon="📈" color="#39FF14">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>Conservative Growth Model</div>
                {REVENUE_PROJECTIONS.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    background: i % 2 === 0 ? 'rgba(57, 255, 20, 0.05)' : 'transparent',
                    borderRadius: '8px',
                  }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: '600' }}>{item.year}</div>
                      <div style={{ color: '#888', fontSize: '12px' }}>{item.subscribers} subscribers</div>
                    </div>
                    <div style={{ color: '#39FF14', fontSize: '20px', fontWeight: '700' }}>{item.arr}</div>
                  </div>
                ))}
              </div>
              <div style={{
                padding: '16px',
                background: 'rgba(57, 255, 20, 0.1)',
                borderRadius: '10px',
                textAlign: 'center',
                border: '1px solid rgba(57, 255, 20, 0.2)',
              }}>
                <div style={{ color: '#39FF14', fontSize: '28px', fontWeight: '800' }}>$8.4M ARR</div>
                <div style={{ color: '#888', fontSize: '12px' }}>Target by 2028</div>
              </div>
            </SectionCard>
          </div>

          <SectionCard id="security" title="Security & Compliance" icon="🔒" color="#00D4FF">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
            }}>
              <div style={{
                ...glassmorphism,
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #2a2a2a',
              }}>
                <h4 style={{ color: '#00D4FF', marginBottom: '12px', fontSize: '15px' }}>Smart Contract Security</h4>
                <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#aaa', fontSize: '13px', lineHeight: 1.8 }}>
                  <li>Anchor Framework (industry standard)</li>
                  <li>No freeze authority</li>
                  <li>Max tax cap: 10% hardcoded</li>
                  <li>Immutable metadata at launch</li>
                  <li>Contract audit before deployment</li>
                </ul>
              </div>
              <div style={{
                ...glassmorphism,
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #2a2a2a',
              }}>
                <h4 style={{ color: '#39FF14', marginBottom: '12px', fontSize: '15px' }}>Platform Security</h4>
                <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#aaa', fontSize: '13px', lineHeight: 1.8 }}>
                  <li>WebAuthn biometric authentication</li>
                  <li>Auto-rotating session tokens</li>
                  <li>AES-256-GCM encryption</li>
                  <li>Biometric transaction confirmation</li>
                  <li>Tier-based session durations</li>
                </ul>
              </div>
            </div>
          </SectionCard>

          <div style={{
            ...glassmorphism,
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1))',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📄</div>
            <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '12px' }}>Ready to Learn More?</h3>
            <p style={{ color: '#888', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
              Download the complete whitepaper for detailed information about DWAV token economics, technical specifications, and the DarkWave ecosystem.
            </p>
            <button
              onClick={handleDownload}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
              }}
            >
              Download Full Whitepaper
            </button>
          </div>

          <div style={{
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 184, 0, 0.3)',
            background: 'rgba(255, 184, 0, 0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div>
                <div style={{ color: '#FFB800', fontWeight: '600', marginBottom: '8px' }}>Risk Disclaimer</div>
                <p style={{ color: '#888', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
                  Cryptocurrency investments are highly speculative and involve substantial risk of loss. The value of DWAV tokens may fluctuate significantly. Only invest what you can afford to lose. Past performance does not guarantee future results. This is not financial advice. Do your own research.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <footer style={{
        padding: '24px 20px',
        borderTop: '1px solid #1a1a1a',
        textAlign: 'center',
      }}>
        <div style={{ color: '#666', fontSize: '12px' }}>
          DarkWave Studios, LLC | Version 1.0 | December 2024
        </div>
      </footer>
    </div>
  );
}
