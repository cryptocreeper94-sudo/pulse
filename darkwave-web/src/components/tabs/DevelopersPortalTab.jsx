import { useState, useEffect, useRef } from 'react';

const DOC_CATEGORIES = [
  {
    id: 'business',
    title: 'Business Documents',
    icon: '💼',
    color: '#00D4FF',
    docs: [
      { id: 'executive', title: 'Executive Summary', icon: '📋', file: '/business-docs/DARKWAVE_EXECUTIVE_SUMMARY_CONSERVATIVE.md', description: 'Company overview, problem, solution' },
      { id: 'investor', title: 'Investor Brief', icon: '💰', file: '/business-docs/DARKWAVE_INVESTOR_BRIEF_CONSERVATIVE.md', description: 'Full business plan for investors' },
      { id: 'roadmap', title: 'Product Roadmap', icon: '🗺️', file: '/business-docs/DARKWAVE_ROADMAP.md', description: '2025-2028 development timeline' },
      { id: 'bootstrap', title: 'Bootstrap Plan', icon: '🚀', file: '/business-docs/DARKWAVE_BOOTSTRAP_PLAN.md', description: 'Lean startup strategy' },
    ],
  },
  {
    id: 'token',
    title: 'DarkWave Chain',
    icon: '⛓️',
    color: '#39FF14',
    docs: [
      { id: 'dwc', title: 'DarkWave Chain', icon: '⛓️', file: 'https://darkwavechain.com', description: 'Visit darkwavechain.com for DWT token info', external: true },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing & Launch',
    icon: '📢',
    color: '#8B5CF6',
    docs: [
      { id: 'social', title: 'Social Media Posts', icon: '📱', file: '/marketing/SOCIAL_MEDIA_POSTS.md', description: '7 ready-to-post templates' },
      { id: 'action', title: '2-Week Action Plan', icon: '📅', file: '/marketing/ACTION_PLAN_2_WEEKS.md', description: 'Marketing launch strategy' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal & Compliance',
    icon: '⚖️',
    color: '#FFB800',
    docs: [
      { id: 'disclaimer', title: 'Legal Disclaimer', icon: '📜', file: '/docs/LEGAL_DISCLAIMER.md', description: 'Risk disclosures & terms' },
    ],
  },
];

const BUSINESS_DOCS = DOC_CATEGORIES.flatMap(cat => cat.docs);

const DEFAULT_TASKS = [
  { id: 1, text: 'Post whitepaper announcement on X/Twitter', done: false, priority: 'high' },
  { id: 2, text: 'Share launch content on Telegram channel', done: false, priority: 'high' },
  { id: 3, text: 'Set up Facebook business page', done: false, priority: 'medium' },
  { id: 4, text: 'Apply for CEX listings (post-launch)', done: false, priority: 'low' },
  { id: 5, text: 'Set up MoonPay crypto on-ramp', done: false, priority: 'medium', link: 'https://dashboard.moonpay.com', instructions: '1. Create account at dashboard.moonpay.com\n2. Complete business verification\n3. Get your API key (pk_live_xxx)\n4. Get your Secret key for URL signing\n5. Add keys to Replit Secrets: MOONPAY_API_KEY, MOONPAY_SECRET_KEY' },
  { id: 6, text: 'Set up Transak crypto on-ramp', done: false, priority: 'low', link: 'https://dashboard.transak.com', instructions: '1. Create account at dashboard.transak.com\n2. Complete KYB verification\n3. Get your API key from Settings\n4. Add key to Replit Secrets: TRANSAK_API_KEY' },
  { id: 7, text: 'Apply for Stripe Crypto Onramp', done: false, priority: 'low', link: 'https://stripe.com/crypto', instructions: '1. Go to Stripe Dashboard > Products > Crypto Onramp\n2. Click "Request Access"\n3. Complete application form\n4. Wait for approval (1-2 weeks)' },
];

const TIER_COLORS = {
  free: '#00D4FF',
  pro: '#39FF14',
  enterprise: '#8B5CF6',
};

const TIER_SCOPES = {
  free: ['market:read', 'signals:read'],
  pro: ['market:read', 'signals:read', 'predictions:read', 'accuracy:read'],
  enterprise: ['market:read', 'signals:read', 'predictions:read', 'accuracy:read', 'strikeagent:read', 'webhooks:write'],
};

const glassmorphism = {
  background: 'rgba(26, 26, 26, 0.6)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
};

const SectionCard = ({ title, icon, children, fullWidth, glowColor }) => (
  <div style={{
    ...glassmorphism,
    borderRadius: '16px',
    padding: '20px',
    border: `1px solid ${glowColor ? `${glowColor}40` : '#2a2a2a'}`,
    gridColumn: fullWidth ? '1 / -1' : 'span 1',
    boxShadow: glowColor ? `0 0 30px ${glowColor}20` : 'none',
    transition: 'all 0.3s ease',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '600' }}>{title}</h3>
    </div>
    {children}
  </div>
);

const StatCard = ({ title, value, subtitle, icon, glow }) => (
  <div style={{
    ...glassmorphism,
    borderRadius: '16px',
    padding: '20px',
    border: `1px solid ${glow ? `${glow}40` : '#2a2a2a'}`,
    boxShadow: glow ? `0 0 20px ${glow}20` : 'none',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <span style={{ fontSize: '14px', color: '#888' }}>{title}</span>
      <span style={{ fontSize: '20px' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
      {value}
    </div>
    {subtitle && <div style={{ fontSize: '12px', color: '#666' }}>{subtitle}</div>}
  </div>
);

const LiveVisitors = ({ count }) => (
  <div style={{
    ...glassmorphism,
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    boxShadow: '0 0 40px rgba(0, 212, 255, 0.15)',
    textAlign: 'center',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
      <div style={{
        width: '12px', height: '12px', borderRadius: '50%',
        background: '#39FF14', boxShadow: '0 0 10px #39FF14',
        animation: 'pulse 2s infinite',
      }} />
      <span style={{ fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '2px' }}>
        Live Visitors
      </span>
    </div>
    <div style={{ fontSize: '48px', fontWeight: '800', color: '#00D4FF' }}>
      {count}
    </div>
    <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
  </div>
);

const TopList = ({ title, items, labelKey, valueKey, icon }) => (
  <div style={{
    ...glassmorphism,
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #2a2a2a',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <span>{icon}</span>
      <span style={{ fontWeight: '600', color: '#fff' }}>{title}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.length === 0 ? (
        <div style={{ color: '#666', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No data yet</div>
      ) : items.slice(0, 5).map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < Math.min(items.length, 5) - 1 ? '1px solid #2a2a2a' : 'none' }}>
          <span style={{ color: '#ccc', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
            {item[labelKey]}
          </span>
          <span style={{ color: '#00D4FF', fontWeight: '600', fontSize: '13px' }}>
            {item[valueKey]}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const DeviceBreakdown = ({ data }) => {
  const devices = [
    { key: 'desktop', label: 'Desktop', icon: '🖥️', color: '#00D4FF' },
    { key: 'mobile', label: 'Mobile', icon: '📱', color: '#39FF14' },
    { key: 'tablet', label: 'Tablet', icon: '📲', color: '#8B5CF6' },
  ];
  
  return (
    <div style={{
      ...glassmorphism,
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #2a2a2a',
    }}>
      <div style={{ fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Device Breakdown</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {devices.map(d => (
          <div key={d.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#888', fontSize: '13px' }}>{d.icon} {d.label}</span>
              <span style={{ color: d.color, fontWeight: '600' }}>{data[d.key]}%</span>
            </div>
            <div style={{ height: '6px', background: '#2a2a2a', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${data[d.key]}%`, height: '100%', background: d.color, borderRadius: '3px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BusinessDocCard = ({ doc, onView, color = '#00D4FF' }) => (
  <div 
    onClick={() => onView(doc)}
    style={{
      ...glassmorphism,
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #2a2a2a',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '220px',
      flex: '0 0 auto',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.borderColor = color;
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 0 25px ${color}30`;
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.borderColor = '#2a2a2a';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <span style={{ fontSize: '28px' }}>{doc.icon}</span>
      <div>
        <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{doc.title}</div>
        <div style={{ color: '#666', fontSize: '11px' }}>{doc.description}</div>
      </div>
    </div>
  </div>
);

const DocCarousel = ({ category, onViewDoc }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) ref.addEventListener('scroll', checkScroll);
    return () => ref?.removeEventListener('scroll', checkScroll);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      ...glassmorphism,
      borderRadius: '16px',
      padding: '20px',
      border: `1px solid ${category.color}30`,
      boxShadow: `0 0 30px ${category.color}10`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>{category.icon}</span>
          <h3 style={{ margin: 0, color: category.color, fontSize: '16px', fontWeight: '600' }}>{category.title}</h3>
          <span style={{
            background: `${category.color}20`,
            color: category.color,
            fontSize: '10px',
            padding: '3px 8px',
            borderRadius: '8px',
            fontWeight: '600',
          }}>
            {category.docs.length} docs
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: canScrollLeft ? category.color : '#333',
              color: canScrollLeft ? '#000' : '#666',
              cursor: canScrollLeft ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            ←
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: canScrollRight ? category.color : '#333',
              color: canScrollRight ? '#000' : '#666',
              cursor: canScrollRight ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            →
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '4px',
        }}
      >
        {category.docs.map(doc => (
          <BusinessDocCard key={doc.id} doc={doc} onView={onViewDoc} color={category.color} />
        ))}
      </div>
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

const QuickAccessCard = ({ doc, onView, color }) => (
  <div
    onClick={() => onView(doc)}
    style={{
      ...glassmorphism,
      borderRadius: '12px',
      padding: '16px',
      border: `1px solid ${color}30`,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      minHeight: '100px',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.borderColor = color;
      e.currentTarget.style.boxShadow = `0 0 30px ${color}30`;
      e.currentTarget.style.transform = 'scale(1.02)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.borderColor = `${color}30`;
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'scale(1)';
    }}
  >
    <span style={{ fontSize: '32px', marginBottom: '8px' }}>{doc.icon}</span>
    <div style={{ color: '#fff', fontWeight: '600', fontSize: '13px' }}>{doc.title}</div>
  </div>
);

const TodoItem = ({ task, onToggle }) => {
  const priorityColors = { high: '#FF4444', medium: '#FFB344', low: '#44FF44' };
  const [showInstructions, setShowInstructions] = useState(false);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div 
        onClick={() => onToggle(task.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: task.done ? 'rgba(26, 42, 26, 0.6)' : 'rgba(26, 26, 26, 0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '8px',
          border: `1px solid ${task.done ? '#39FF1430' : '#2a2a2a'}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '4px',
          border: `2px solid ${task.done ? '#39FF14' : '#444'}`,
          background: task.done ? '#39FF14' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {task.done && <span style={{ color: '#000', fontSize: '12px' }}>✓</span>}
        </div>
        <span style={{
          flex: 1,
          color: task.done ? '#666' : '#fff',
          textDecoration: task.done ? 'line-through' : 'none',
          fontSize: '14px',
        }}>
          {task.text}
        </span>
        {task.link && (
          <a 
            href={task.link} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
              color: '#000',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '600',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            Open →
          </a>
        )}
        {task.instructions && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowInstructions(!showInstructions); }}
            style={{
              background: '#333',
              border: 'none',
              color: '#888',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {showInstructions ? 'Hide' : 'Steps'}
          </button>
        )}
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: priorityColors[task.priority],
          flexShrink: 0,
        }} />
      </div>
      {showInstructions && task.instructions && (
        <div style={{
          marginLeft: '32px',
          padding: '12px',
          background: 'rgba(0, 212, 255, 0.05)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#aaa',
          whiteSpace: 'pre-line',
          lineHeight: '1.6',
        }}>
          {task.instructions}
        </div>
      )}
    </div>
  );
};

const DocViewer = ({ doc, content, onClose }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>{doc.icon}</span>
        <h2 style={{ margin: 0, color: '#fff' }}>{doc.title}</h2>
      </div>
      <button
        onClick={onClose}
        style={{
          background: '#333',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          padding: '8px 16px',
          cursor: 'pointer',
        }}
      >
        ✕ Close
      </button>
    </div>
    <div style={{
      flex: 1,
      overflow: 'auto',
      ...glassmorphism,
      borderRadius: '12px',
      padding: '24px',
      whiteSpace: 'pre-wrap',
      fontFamily: 'monospace',
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#ccc',
    }}>
      {content || 'Loading...'}
    </div>
  </div>
);

const PricingCard = ({ tier, price, monthlyPrice, annualPrice, billingPeriod, features, limits, scopes, isCurrentPlan, isPopular, onUpgrade, onManage }) => {
  const [isHovered, setIsHovered] = useState(false);
  const color = TIER_COLORS[tier];
  const displayPrice = billingPeriod === 'annual' ? annualPrice : monthlyPrice;
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...glassmorphism,
        textAlign: 'center',
        padding: '24px 20px',
        borderRadius: '16px',
        border: `1px solid ${color}40`,
        position: 'relative',
        boxShadow: isHovered ? `0 0 40px ${color}40, 0 0 60px ${color}20` : `0 0 20px ${color}15`,
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.3s ease',
      }}
    >
      {isPopular && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: `linear-gradient(135deg, ${color}, ${color}CC)`,
          color: tier === 'pro' ? '#000' : '#fff',
          fontSize: '10px',
          fontWeight: '700',
          padding: '6px 16px',
          borderRadius: '12px',
          boxShadow: `0 0 15px ${color}60`,
        }}>
          POPULAR
        </div>
      )}
      
      {isCurrentPlan && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          right: '12px',
          background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
          color: '#fff',
          fontSize: '9px',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: '8px',
          textTransform: 'uppercase',
        }}>
          Current Plan
        </div>
      )}
      
      <div style={{ fontSize: '22px', fontWeight: '700', color, marginTop: isPopular ? '8px' : 0 }}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </div>
      
      <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', margin: '12px 0 4px' }}>
        ${displayPrice}
        <span style={{ fontSize: '14px', color: '#888', fontWeight: '400' }}>/mo</span>
      </div>
      
      {billingPeriod === 'annual' && tier !== 'free' && (
        <div style={{ fontSize: '11px', color, marginBottom: '8px' }}>
          ${displayPrice * 12}/year (billed annually)
        </div>
      )}
      
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{limits}</div>
      <div style={{ fontSize: '11px', color: '#666', marginBottom: '12px' }}>{features}</div>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        justifyContent: 'center',
        marginTop: '12px',
        padding: '10px',
        background: 'rgba(15, 15, 15, 0.6)',
        borderRadius: '8px',
      }}>
        {scopes.map((scope, i) => (
          <span
            key={i}
            style={{
              fontSize: '9px',
              padding: '3px 6px',
              borderRadius: '4px',
              background: `${color}20`,
              color: color,
              border: `1px solid ${color}40`,
            }}
          >
            {scope}
          </span>
        ))}
      </div>
      
      <div style={{ marginTop: '16px' }}>
        {isCurrentPlan ? (
          tier === 'free' ? (
            <div style={{
              padding: '10px 20px',
              background: '#333',
              borderRadius: '8px',
              color: '#888',
              fontSize: '12px',
            }}>
              Current Plan
            </div>
          ) : (
            <button
              onClick={onManage}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'transparent',
                border: `1px solid ${color}`,
                borderRadius: '8px',
                color: color,
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Manage Subscription
            </button>
          )
        ) : (
          <button
            onClick={() => onUpgrade(tier)}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: tier === 'free' ? '#333' : `linear-gradient(135deg, ${color}, ${color}CC)`,
              border: 'none',
              borderRadius: '8px',
              color: tier === 'pro' ? '#000' : '#fff',
              fontSize: '12px',
              fontWeight: '700',
              cursor: tier === 'free' ? 'default' : 'pointer',
              boxShadow: tier !== 'free' ? `0 0 15px ${color}40` : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {tier === 'free' ? 'Free Forever' : `Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`}
          </button>
        )}
      </div>
    </div>
  );
};

const EnvironmentBadge = ({ environment }) => {
  const isLive = environment === 'live';
  return (
    <span style={{
      padding: '3px 8px',
      borderRadius: '4px',
      fontSize: '9px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      background: isLive ? 'rgba(57, 255, 20, 0.15)' : 'rgba(255, 184, 0, 0.15)',
      color: isLive ? '#39FF14' : '#FFB800',
      border: `1px solid ${isLive ? 'rgba(57, 255, 20, 0.4)' : 'rgba(255, 184, 0, 0.4)'}`,
    }}>
      {isLive ? 'LIVE' : 'TEST'}
    </span>
  );
};

const ScopeBadge = ({ scope }) => {
  const colors = {
    'market:read': '#00D4FF',
    'signals:read': '#39FF14',
    'predictions:read': '#8B5CF6',
    'accuracy:read': '#FFB800',
    'strikeagent:read': '#FF6B35',
    'webhooks:write': '#FF4444',
  };
  const color = colors[scope] || '#888';
  
  return (
    <span style={{
      padding: '2px 5px',
      borderRadius: '3px',
      fontSize: '8px',
      fontWeight: '600',
      background: `${color}15`,
      color: color,
      border: `1px solid ${color}30`,
    }}>
      {scope}
    </span>
  );
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      zIndex: 10001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        ...glassmorphism,
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '400px',
        width: '100%',
        border: '1px solid #FF444440',
        boxShadow: '0 0 40px rgba(255, 68, 68, 0.2)',
      }}>
        <h3 style={{ margin: '0 0 12px', color: '#fff', fontSize: '18px' }}>{title}</h3>
        <p style={{ margin: '0 0 20px', color: '#888', fontSize: '14px', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              background: '#333',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #FF4444, #FF6B6B)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DevelopersPortalTab() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('adminTasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });
  const [viewingDoc, setViewingDoc] = useState(null);
  const [docContent, setDocContent] = useState('');
  const [apiKeys, setApiKeys] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnvironment, setNewKeyEnvironment] = useState('live');
  const [newKeyScopes, setNewKeyScopes] = useState(['market:read', 'signals:read']);
  const [newKeyGenerated, setNewKeyGenerated] = useState(null);
  const [apiKeysCopied, setApiKeysCopied] = useState({});
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [currentTier, setCurrentTier] = useState('free');
  const [regenerateConfirm, setRegenerateConfirm] = useState(null);
  
  useEffect(() => {
    localStorage.setItem('adminTasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, liveRes] = await Promise.all([
          fetch('/api/analytics/dashboard?tenantId=pulse'),
          fetch('/api/analytics/live?tenantId=pulse'),
        ]);
        const dashData = await dashRes.json();
        const liveData = await liveRes.json();
        setDashboard(dashData);
        setLiveCount(liveData.liveVisitors || 0);
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
    const interval = setInterval(async () => {
      try {
        const liveRes = await fetch('/api/analytics/live?tenantId=pulse');
        const liveData = await liveRes.json();
        setLiveCount(liveData.liveVisitors || 0);
      } catch (e) {}
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const session = JSON.parse(localStorage.getItem('userSession') || '{}');
        const sessionToken = session.sessionToken || session.token;
        if (!sessionToken) return;
        
        const res = await fetch('/api/developer/subscription', {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({ sessionToken }),
        });
        const data = await res.json();
        if (data.tier) {
          setCurrentTier(data.tier);
          setNewKeyScopes(TIER_SCOPES[data.tier] || TIER_SCOPES.free);
        }
      } catch (e) {
        console.error('Failed to fetch subscription:', e);
      }
    };
    
    fetchSubscription();
  }, []);
  
  const handleViewDoc = async (doc) => {
    setViewingDoc(doc);
    setDocContent('Loading...');
    try {
      const res = await fetch(doc.file);
      const text = await res.text();
      setDocContent(text);
    } catch (e) {
      setDocContent('Failed to load document');
    }
  };
  
  const handleToggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };
  
  const completedTasks = tasks.filter(t => t.done).length;
  const progressPercent = Math.round((completedTasks / tasks.length) * 100);
  
  const d = dashboard || {};
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'api', label: 'API', icon: '🔑' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  const handleApiUpgrade = async (tier) => {
    if (tier === 'free') return;
    try {
      const session = JSON.parse(localStorage.getItem('userSession') || '{}');
      const userId = session.id || session.email;
      
      if (!userId) {
        console.error('No user session found');
        return;
      }
      
      let endpoint;
      if (tier === 'enterprise') {
        endpoint = billingPeriod === 'annual' 
          ? '/api/developer/billing/create-enterprise-annual'
          : '/api/developer/billing/create-enterprise-monthly';
      } else {
        endpoint = billingPeriod === 'annual'
          ? '/api/developer/billing/create-pro-annual'
          : '/api/developer/billing/create-pro-monthly';
      }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session:', data.error);
      }
    } catch (e) {
      console.error('Upgrade error:', e);
    }
  };
  
  const handleManageSubscription = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('userSession') || '{}');
      const sessionToken = session.sessionToken || session.token;
      
      const res = await fetch('/api/developer/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken }),
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error('Failed to open billing portal:', e);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!newKeyName.trim()) return;
    setApiLoading(true);
    try {
      const session = JSON.parse(localStorage.getItem('userSession') || '{}');
      const sessionToken = session.sessionToken || session.token;
      
      if (!sessionToken) {
        console.error('No session token found - user not authenticated');
        return;
      }
      
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionToken, 
          name: newKeyName.trim(),
          environment: newKeyEnvironment,
          scopes: newKeyScopes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewKeyGenerated({
          key: data.apiKey,
          keyId: data.keyId,
          prefix: data.prefix,
          name: newKeyName.trim(),
          environment: data.environment || newKeyEnvironment,
          scopes: data.scopes || newKeyScopes,
        });
        setNewKeyName('');
        setApiKeys(prev => [...prev, {
          id: data.keyId,
          name: newKeyName.trim(),
          prefix: data.prefix,
          environment: data.environment || newKeyEnvironment,
          scopes: data.scopes || newKeyScopes,
          createdAt: new Date().toISOString(),
          status: 'active',
        }]);
      } else if (data.error) {
        console.error('API key generation failed:', data.error);
      }
    } catch (e) {
      console.error('Failed to generate API key:', e);
    } finally {
      setApiLoading(false);
    }
  };
  
  const handleRegenerateKey = async (keyId) => {
    try {
      const session = JSON.parse(localStorage.getItem('userSession') || '{}');
      const sessionToken = session.sessionToken || session.token;
      
      const res = await fetch('/api/developer/keys/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, keyId }),
      });
      
      const data = await res.json();
      if (data.success) {
        const key = apiKeys.find(k => k.id === keyId);
        setNewKeyGenerated({
          key: data.apiKey,
          keyId: data.keyId,
          prefix: data.prefix,
          name: key?.name || 'Regenerated Key',
          environment: key?.environment || 'live',
          scopes: key?.scopes || newKeyScopes,
        });
        setApiKeys(prev => prev.map(k => 
          k.id === keyId ? { ...k, prefix: data.prefix } : k
        ));
      }
    } catch (e) {
      console.error('Failed to regenerate key:', e);
    } finally {
      setRegenerateConfirm(null);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setApiKeysCopied(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setApiKeysCopied(prev => ({ ...prev, [id]: false })), 2000);
  };
  
  return (
    <div style={{ padding: '20px 0', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', margin: 0 }}>
          🛠️ Developers Portal
        </h1>
        <p style={{ color: '#888', margin: '8px 0 0', fontSize: '14px' }}>Admin dashboard, business docs & analytics</p>
      </div>
      
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'linear-gradient(135deg, #00D4FF, #0099CC)' : 'rgba(26, 26, 26, 0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: activeTab === tab.id ? 'none' : '1px solid #2a2a2a',
              borderRadius: '8px',
              padding: '10px 16px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <LiveVisitors count={liveCount} />
          
          <SectionCard title="Task Progress" icon="📋">
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#888', fontSize: '13px' }}>{completedTasks} of {tasks.length} tasks done</span>
                <span style={{ color: '#00D4FF', fontWeight: '600' }}>{progressPercent}%</span>
              </div>
              <div style={{ height: '8px', background: '#2a2a2a', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00D4FF, #39FF14)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              style={{
                width: '100%',
                background: 'rgba(42, 42, 42, 0.6)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              View All Tasks →
            </button>
          </SectionCard>
          
          <SectionCard title="Quick Stats" icon="⚡">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#00D4FF' }}>{d.today?.views || 0}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>Today</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#39FF14' }}>{d.allTime?.views || 0}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>All Time</div>
              </div>
            </div>
          </SectionCard>
          
          <SectionCard title="Business Documents" icon="📁">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {BUSINESS_DOCS.slice(0, 3).map(doc => (
                <div
                  key={doc.id}
                  onClick={() => handleViewDoc(doc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    background: 'rgba(15, 15, 15, 0.6)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <span>{doc.icon}</span>
                  <span style={{ color: '#ccc', fontSize: '13px' }}>{doc.title}</span>
                </div>
              ))}
              <button
                onClick={() => setActiveTab('documents')}
                style={{
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                View All Docs →
              </button>
            </div>
          </SectionCard>
        </div>
      )}
      
      {activeTab === 'api' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gap: '16px',
        }}>
          <div style={{
            gridColumn: '1 / -1',
            ...glassmorphism,
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            boxShadow: '0 0 50px rgba(0, 212, 255, 0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '28px' }}>🚀</span>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '700' }}>Pulse Developer API</h3>
                  <p style={{ margin: '4px 0 0', color: '#888', fontSize: '13px' }}>Access AI signals, market data & safety scanning</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  background: 'rgba(15, 15, 15, 0.6)', 
                  borderRadius: '10px', 
                  padding: '4px', 
                  border: '1px solid #333' 
                }}>
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    style={{
                      background: billingPeriod === 'monthly' ? 'linear-gradient(135deg, #00D4FF, #0099CC)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      color: billingPeriod === 'monthly' ? '#fff' : '#888',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '12px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod('annual')}
                    style={{
                      background: billingPeriod === 'annual' ? 'linear-gradient(135deg, #39FF14, #2ECC71)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      color: billingPeriod === 'annual' ? '#000' : '#888',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '12px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Annual
                  </button>
                </div>
                {billingPeriod === 'annual' && (
                  <span style={{ 
                    background: 'linear-gradient(135deg, #39FF14, #2ECC71)', 
                    color: '#000', 
                    fontSize: '10px', 
                    fontWeight: '700', 
                    padding: '6px 12px', 
                    borderRadius: '12px',
                    boxShadow: '0 0 10px rgba(57, 255, 20, 0.4)',
                  }}>
                    ~17% savings
                  </span>
                )}
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: '20px', 
              marginTop: '20px' 
            }}>
              <PricingCard
                tier="free"
                monthlyPrice={0}
                annualPrice={0}
                billingPeriod={billingPeriod}
                limits="60 req/min • 2K/day"
                features="Market Data + Signals"
                scopes={TIER_SCOPES.free}
                isCurrentPlan={currentTier === 'free'}
                onUpgrade={handleApiUpgrade}
                onManage={handleManageSubscription}
              />
              <PricingCard
                tier="pro"
                monthlyPrice={29}
                annualPrice={24}
                billingPeriod={billingPeriod}
                limits="600 req/min • 100K/day"
                features="+ Predictions + Accuracy"
                scopes={TIER_SCOPES.pro}
                isCurrentPlan={currentTier === 'pro'}
                isPopular={true}
                onUpgrade={handleApiUpgrade}
                onManage={handleManageSubscription}
              />
              <PricingCard
                tier="enterprise"
                monthlyPrice={99}
                annualPrice={82}
                billingPeriod={billingPeriod}
                limits="3000 req/min • 1M/day"
                features="+ StrikeAgent + Webhooks"
                scopes={TIER_SCOPES.enterprise}
                isCurrentPlan={currentTier === 'enterprise'}
                onUpgrade={handleApiUpgrade}
                onManage={handleManageSubscription}
              />
            </div>
          </div>
          
          <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <SectionCard title="Generate API Key" icon="🔐" glowColor="#00D4FF">
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name (e.g., My Trading Bot)"
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    background: 'rgba(15, 15, 15, 0.6)',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '8px', padding: '4px', border: '1px solid #333' }}>
                  <button
                    onClick={() => setNewKeyEnvironment('live')}
                    style={{
                      background: newKeyEnvironment === 'live' ? 'linear-gradient(135deg, #39FF14, #2ECC71)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      color: newKeyEnvironment === 'live' ? '#000' : '#888',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '12px',
                    }}
                  >
                    Live
                  </button>
                  <button
                    onClick={() => setNewKeyEnvironment('test')}
                    style={{
                      background: newKeyEnvironment === 'test' ? 'linear-gradient(135deg, #FFB800, #FF8C00)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      color: newKeyEnvironment === 'test' ? '#000' : '#888',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '12px',
                    }}
                  >
                    Test
                  </button>
                </div>
                <button
                  onClick={handleGenerateApiKey}
                  disabled={apiLoading || !newKeyName.trim()}
                  style={{
                    background: apiLoading ? '#333' : 'linear-gradient(135deg, #00D4FF, #0099CC)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    color: '#fff',
                    cursor: apiLoading ? 'wait' : 'pointer',
                    fontWeight: '600',
                    opacity: !newKeyName.trim() ? 0.5 : 1,
                    boxShadow: !apiLoading && newKeyName.trim() ? '0 0 15px rgba(0, 212, 255, 0.3)' : 'none',
                  }}
                >
                  {apiLoading ? 'Generating...' : 'Generate Key'}
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '12px' }}>
                {newKeyEnvironment === 'live' 
                  ? '🟢 Live keys access real data and count against rate limits' 
                  : '🟡 Test keys return mock data for development - no rate limit impact'}
              </div>
              
              {newKeyGenerated && (
                <div style={{
                  background: 'rgba(10, 26, 10, 0.6)',
                  border: '2px solid #39FF14',
                  borderRadius: '12px',
                  padding: '20px',
                  marginTop: '16px',
                  boxShadow: '0 0 30px rgba(57, 255, 20, 0.3), inset 0 0 20px rgba(57, 255, 20, 0.05)',
                  animation: 'glowPulse 2s ease-in-out infinite',
                }}>
                  <style>{`
                    @keyframes glowPulse {
                      0%, 100% { box-shadow: 0 0 30px rgba(57, 255, 20, 0.3), inset 0 0 20px rgba(57, 255, 20, 0.05); }
                      50% { box-shadow: 0 0 40px rgba(57, 255, 20, 0.5), inset 0 0 30px rgba(57, 255, 20, 0.1); }
                    }
                  `}</style>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ color: '#39FF14', fontSize: '20px' }}>✓</span>
                    <span style={{ color: '#39FF14', fontWeight: '700', fontSize: '16px' }}>API Key Generated!</span>
                  </div>
                  <div style={{
                    background: 'rgba(255, 68, 68, 0.1)',
                    border: '1px solid rgba(255, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                  }}>
                    <p style={{ color: '#FF6B6B', fontSize: '13px', margin: 0, fontWeight: '600' }}>
                      ⚠️ Save this key now - it cannot be retrieved again!
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(15, 15, 15, 0.8)',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #39FF1440',
                    fontFamily: 'monospace',
                  }}>
                    <code style={{ flex: 1, color: '#00D4FF', fontSize: '13px', wordBreak: 'break-all' }}>
                      {newKeyGenerated.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newKeyGenerated.key, 'newKey')}
                      style={{
                        background: apiKeysCopied['newKey'] ? '#39FF14' : 'linear-gradient(135deg, #333, #444)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 16px',
                        color: apiKeysCopied['newKey'] ? '#000' : '#fff',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {apiKeysCopied['newKey'] ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                  <button
                    onClick={() => setNewKeyGenerated(null)}
                    style={{
                      marginTop: '16px',
                      background: 'rgba(42, 42, 42, 0.6)',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      color: '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </SectionCard>
            
            {apiKeys.length > 0 && (
              <SectionCard title="Your API Keys" icon="📋" glowColor="#8B5CF6">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      style={{
                        ...glassmorphism,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '14px',
                        borderRadius: '10px',
                        border: '1px solid #2a2a2a',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div>
                            <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{key.name}</div>
                            <div style={{ color: '#666', fontSize: '12px', fontFamily: 'monospace' }}>{key.prefix}...</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <EnvironmentBadge environment={key.environment} />
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: key.status === 'active' ? 'rgba(57, 255, 20, 0.15)' : 'rgba(255, 107, 53, 0.15)',
                            color: key.status === 'active' ? '#39FF14' : '#FF6B35',
                            fontSize: '11px',
                            fontWeight: '600',
                          }}>
                            {key.status === 'active' ? 'Active' : 'Revoked'}
                          </span>
                        </div>
                      </div>
                      
                      {key.scopes && key.scopes.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {key.scopes.map((scope, i) => (
                            <ScopeBadge key={i} scope={scope} />
                          ))}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          onClick={() => setRegenerateConfirm(key.id)}
                          style={{
                            padding: '8px 14px',
                            background: 'rgba(255, 184, 0, 0.1)',
                            border: '1px solid rgba(255, 184, 0, 0.3)',
                            borderRadius: '6px',
                            color: '#FFB800',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          🔄 Regenerate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <SectionCard title="API Documentation" icon="📖" fullWidth glowColor="#00D4FF">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ 
                  background: 'linear-gradient(135deg, #00D4FF, #0099CC)', 
                  color: '#fff', 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontSize: '11px', 
                  fontWeight: '700' 
                }}>
                  v1.21.0
                </span>
                <span style={{ color: '#888', fontSize: '12px' }}>Latest release with WebAuthn & Session Security</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '14px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '10px', border: '1px solid #2a2a2a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ background: '#39FF14', color: '#000', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>GET</span>
                    <code style={{ color: '#ccc', fontSize: '13px' }}>/api/v1/market-overview?category=top</code>
                  </div>
                  <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Get market overview with top coins, BTC dominance, and sentiment</p>
                </div>
                
                <div style={{ padding: '14px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '10px', border: '1px solid #2a2a2a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ background: '#39FF14', color: '#000', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>GET</span>
                    <code style={{ color: '#ccc', fontSize: '13px' }}>/api/v1/price/:symbol</code>
                  </div>
                  <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Get current price for a cryptocurrency (e.g., BTC, ETH, SOL)</p>
                </div>
                
                <div style={{ padding: '14px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '10px', border: '1px solid #2a2a2a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ background: '#39FF14', color: '#000', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>GET</span>
                    <code style={{ color: '#ccc', fontSize: '13px' }}>/api/v1/signals?symbol=BTC</code>
                  </div>
                  <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Get AI analysis signals for a coin (BUY/SELL/HOLD with confidence)</p>
                </div>
                
                <div style={{ padding: '14px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ background: '#8B5CF6', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>PRO</span>
                    <code style={{ color: '#ccc', fontSize: '13px' }}>/api/v1/predictions/:symbol?horizon=4h</code>
                  </div>
                  <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Get ML predictions with probability scores (Pro tier required)</p>
                </div>
              </div>
              
              <div style={{ 
                marginTop: '16px', 
                padding: '14px', 
                background: 'rgba(26, 26, 42, 0.6)', 
                borderRadius: '10px', 
                border: '1px solid rgba(0, 212, 255, 0.3)' 
              }}>
                <p style={{ color: '#00D4FF', fontSize: '13px', margin: 0 }}>
                  <strong>Authentication:</strong> Include your API key in the <code style={{ background: 'rgba(15, 15, 15, 0.6)', padding: '3px 8px', borderRadius: '4px' }}>X-Pulse-Api-Key</code> header
                </p>
              </div>
            </SectionCard>
          </div>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <SectionCard title="🔐 Security Features (v1.21.0)" icon="🛡️" fullWidth glowColor="#39FF14">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>🔑</span>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: '600' }}>Biometric Authentication (WebAuthn)</h4>
                  <span style={{ 
                    background: 'rgba(57, 255, 20, 0.15)', 
                    color: '#39FF14', 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    fontSize: '10px', 
                    fontWeight: '700' 
                  }}>NEW</span>
                </div>
                <p style={{ color: '#888', fontSize: '13px', margin: '0 0 12px', lineHeight: 1.5 }}>
                  Optional 2FA using fingerprint, Face ID, or security keys. Users can enable biometric verification for login, wallet transactions, or both.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  <div style={{ padding: '12px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '8px', border: '1px solid rgba(57, 255, 20, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ background: '#FFB800', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>POST</span>
                      <code style={{ color: '#ccc', fontSize: '12px' }}>/api/webauthn/register-options</code>
                    </div>
                    <p style={{ color: '#666', fontSize: '11px', margin: 0 }}>Get WebAuthn registration options for credential creation</p>
                  </div>
                  
                  <div style={{ padding: '12px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '8px', border: '1px solid rgba(57, 255, 20, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ background: '#FFB800', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>POST</span>
                      <code style={{ color: '#ccc', fontSize: '12px' }}>/api/webauthn/register-verify</code>
                    </div>
                    <p style={{ color: '#666', fontSize: '11px', margin: 0 }}>Verify and store new biometric credential</p>
                  </div>
                  
                  <div style={{ padding: '12px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '8px', border: '1px solid rgba(57, 255, 20, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ background: '#FFB800', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>POST</span>
                      <code style={{ color: '#ccc', fontSize: '12px' }}>/api/webauthn/auth-options</code>
                    </div>
                    <p style={{ color: '#666', fontSize: '11px', margin: 0 }}>Get authentication challenge for biometric login</p>
                  </div>
                  
                  <div style={{ padding: '12px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '8px', border: '1px solid rgba(57, 255, 20, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ background: '#FFB800', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>POST</span>
                      <code style={{ color: '#ccc', fontSize: '12px' }}>/api/webauthn/auth-verify</code>
                    </div>
                    <p style={{ color: '#666', fontSize: '11px', margin: 0 }}>Verify biometric authentication response</p>
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: '12px', 
                  padding: '10px 14px', 
                  background: 'rgba(57, 255, 20, 0.05)', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(57, 255, 20, 0.15)' 
                }}>
                  <p style={{ color: '#39FF14', fontSize: '12px', margin: 0 }}>
                    💡 <strong>User Settings:</strong> Enable for login only, wallet transactions only, both, or neither. Fully user-controlled.
                  </p>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>🔒</span>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: '600' }}>Session Security</h4>
                  <span style={{ 
                    background: 'rgba(57, 255, 20, 0.15)', 
                    color: '#39FF14', 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    fontSize: '10px', 
                    fontWeight: '700' 
                  }}>NEW</span>
                </div>
                <p style={{ color: '#888', fontSize: '13px', margin: '0 0 12px', lineHeight: 1.5 }}>
                  Enhanced session management with automatic token rotation for improved security.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  <div style={{ padding: '12px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '8px', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ color: '#00D4FF', fontSize: '14px' }}>🔄</span>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Token Rotation</span>
                    </div>
                    <p style={{ color: '#666', fontSize: '11px', margin: 0 }}>Session tokens rotate automatically to prevent session hijacking</p>
                  </div>
                  
                  <div style={{ padding: '12px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '8px', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ color: '#00D4FF', fontSize: '14px' }}>📡</span>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>X-Session-Token-Rotated</span>
                    </div>
                    <p style={{ color: '#666', fontSize: '11px', margin: 0 }}>Response header signals when token has been refreshed</p>
                  </div>
                  
                  <div style={{ padding: '12px', background: 'rgba(15, 15, 15, 0.6)', borderRadius: '8px', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ color: '#00D4FF', fontSize: '14px' }}>⏱️</span>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Tier-Based Durations</span>
                    </div>
                    <p style={{ color: '#666', fontSize: '11px', margin: 0 }}>Session lengths vary by subscription tier for flexible security</p>
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: '12px', 
                  padding: '10px 14px', 
                  background: 'rgba(0, 212, 255, 0.05)', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(0, 212, 255, 0.15)' 
                }}>
                  <p style={{ color: '#00D4FF', fontSize: '12px', margin: 0 }}>
                    🔧 <strong>Frontend Integration:</strong> Check for <code style={{ background: 'rgba(15, 15, 15, 0.6)', padding: '2px 6px', borderRadius: '4px' }}>X-Session-Token-Rotated</code> header and update stored token when present.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
      
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            ...glassmorphism,
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #2a2a2a',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '600' }}>Quick Access</h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '12px',
            }}>
              {[
                { ...DOC_CATEGORIES[1].docs[0], color: '#39FF14' },
                { ...DOC_CATEGORIES[0].docs[1], color: '#00D4FF' },
                { ...DOC_CATEGORIES[2].docs[1], color: '#8B5CF6' },
                { ...DOC_CATEGORIES[0].docs[2], color: '#00D4FF' },
              ].map(doc => (
                <QuickAccessCard key={doc.id} doc={doc} onView={handleViewDoc} color={doc.color} />
              ))}
            </div>
          </div>

          {DOC_CATEGORIES.map(category => (
            <DocCarousel key={category.id} category={category} onViewDoc={handleViewDoc} />
          ))}

          <div style={{
            ...glassmorphism,
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #333',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
              Total Documents: {DOC_CATEGORIES.reduce((acc, cat) => acc + cat.docs.length, 0)}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              Click any document to view. All files are in markdown format.
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'tasks' && (
        <div>
          <div style={{
            ...glassmorphism,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#fff', fontWeight: '600' }}>Progress</span>
              <span style={{ color: '#00D4FF', fontWeight: '700' }}>{progressPercent}%</span>
            </div>
            <div style={{ height: '12px', background: '#2a2a2a', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00D4FF, #39FF14)',
                borderRadius: '6px',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '16px', fontSize: '12px', color: '#666' }}>
              <span>🔴 High: {tasks.filter(t => t.priority === 'high' && !t.done).length}</span>
              <span>🟡 Medium: {tasks.filter(t => t.priority === 'medium' && !t.done).length}</span>
              <span>🟢 Low: {tasks.filter(t => t.priority === 'low' && !t.done).length}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...tasks].sort((a, b) => {
              if (a.done !== b.done) return a.done ? 1 : -1;
              const priority = { high: 0, medium: 1, low: 2 };
              return priority[a.priority] - priority[b.priority];
            }).map(task => (
              <TodoItem key={task.id} task={task} onToggle={handleToggleTask} />
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#888' }}>
              Loading analytics...
            </div>
          ) : (
            <>
              <LiveVisitors count={liveCount} />
              <StatCard title="Today" value={d.today?.views || 0} subtitle={`${d.today?.sessions || 0} sessions`} icon="📅" glow="#00D4FF" />
              <StatCard title="This Week" value={d.week?.views || 0} icon="📊" glow="#39FF14" />
              <StatCard title="This Month" value={d.month?.views || 0} icon="📈" glow="#8B5CF6" />
              <StatCard title="All Time" value={d.allTime?.views || 0} subtitle={`${d.allTime?.sessions || 0} unique sessions`} icon="🌍" glow="#FF6B35" />
              <TopList title="Top Pages" items={d.topPages || []} labelKey="page" valueKey="views" icon="📄" />
              <TopList title="Top Referrers" items={d.topReferrers || []} labelKey="referrer" valueKey="count" icon="🔗" />
              <DeviceBreakdown data={d.deviceBreakdown || { desktop: 0, mobile: 0, tablet: 0 }} />
              <div style={{
                ...glassmorphism,
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #2a2a2a',
              }}>
                <div style={{ fontWeight: '600', color: '#fff', marginBottom: '12px' }}>Avg. Session Duration</div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#00D4FF' }}>
                  {Math.floor((d.avgDuration || 0) / 60)}m {(d.avgDuration || 0) % 60}s
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {viewingDoc && (
        <DocViewer doc={viewingDoc} content={docContent} onClose={() => setViewingDoc(null)} />
      )}
      
      <ConfirmModal
        isOpen={!!regenerateConfirm}
        title="Regenerate API Key?"
        message="This will invalidate your current key and generate a new one. Any applications using the old key will stop working immediately."
        onConfirm={() => handleRegenerateKey(regenerateConfirm)}
        onCancel={() => setRegenerateConfirm(null)}
      />
    </div>
  );
}
