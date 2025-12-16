import { useState, useEffect } from 'react';

const BUSINESS_DOCS = [
  { id: 'executive', title: 'Executive Summary', icon: '📋', file: '/business-docs/DARKWAVE_EXECUTIVE_SUMMARY_CONSERVATIVE.md', description: 'Company overview, problem, solution, business model' },
  { id: 'investor', title: 'Investor Brief', icon: '💼', file: '/business-docs/DARKWAVE_INVESTOR_BRIEF_CONSERVATIVE.md', description: 'Full business plan for investors' },
  { id: 'roadmap', title: 'Product Roadmap', icon: '🗺️', file: '/business-docs/DARKWAVE_ROADMAP.md', description: '2025-2028 development timeline' },
  { id: 'bootstrap', title: 'Bootstrap Plan', icon: '🚀', file: '/business-docs/DARKWAVE_BOOTSTRAP_PLAN.md', description: 'Lean startup strategy' },
];

const DEFAULT_TASKS = [
  { id: 1, text: 'Complete AI prediction system testing', done: false, priority: 'high' },
  { id: 2, text: 'Finalize token launch date', done: false, priority: 'high' },
  { id: 3, text: 'Review and update executive summary', done: true, priority: 'medium' },
  { id: 4, text: 'Set up marketing campaign for launch', done: false, priority: 'medium' },
  { id: 5, text: 'Complete mobile app beta testing', done: false, priority: 'low' },
  { id: 6, text: 'Update investor brief with Q4 metrics', done: false, priority: 'medium' },
  { id: 7, text: 'Configure Stripe production keys', done: true, priority: 'high' },
  { id: 8, text: 'Deploy StrikeAgent to mainnet', done: false, priority: 'high' },
];

const SectionCard = ({ title, icon, children, fullWidth }) => (
  <div style={{
    background: 'rgba(26, 26, 26, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #2a2a2a',
    gridColumn: fullWidth ? '1 / -1' : 'span 1',
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
    background: '#1a1a1a',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #2a2a2a',
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
    background: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #00D4FF30',
    boxShadow: '0 0 30px #00D4FF15',
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
    background: '#1a1a1a',
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
      background: '#1a1a1a',
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

const BusinessDocCard = ({ doc, onView }) => (
  <div 
    onClick={() => onView(doc)}
    style={{
      background: '#1a1a1a',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #2a2a2a',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.borderColor = '#00D4FF';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.borderColor = '#2a2a2a';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <span style={{ fontSize: '24px' }}>{doc.icon}</span>
      <div>
        <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{doc.title}</div>
        <div style={{ color: '#666', fontSize: '12px' }}>{doc.description}</div>
      </div>
    </div>
  </div>
);

const TodoItem = ({ task, onToggle }) => {
  const priorityColors = { high: '#FF4444', medium: '#FFB344', low: '#44FF44' };
  return (
    <div 
      onClick={() => onToggle(task.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: task.done ? '#1a2a1a' : '#1a1a1a',
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
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: priorityColors[task.priority],
        flexShrink: 0,
      }} />
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
      background: '#1a1a1a',
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
  const [newKeyGenerated, setNewKeyGenerated] = useState(null);
  const [apiKeysCopied, setApiKeysCopied] = useState({});
  
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
          environment: newKeyEnvironment 
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
        });
        setNewKeyName('');
        setApiKeys(prev => [...prev, {
          id: data.keyId,
          name: newKeyName.trim(),
          prefix: data.prefix,
          environment: data.environment || newKeyEnvironment,
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
              background: activeTab === tab.id ? 'linear-gradient(135deg, #00D4FF, #0099CC)' : '#1a1a1a',
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
                background: '#2a2a2a',
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
              <div style={{ textAlign: 'center', padding: '12px', background: '#0f0f0f', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#00D4FF' }}>{d.today?.views || 0}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>Today</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: '#0f0f0f', borderRadius: '8px' }}>
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
                    background: '#0f0f0f',
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
                  background: '#2a2a2a',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #00D4FF30',
            boxShadow: '0 0 30px #00D4FF15',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>🚀</span>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Pulse Developer API</h3>
                <p style={{ margin: '4px 0 0', color: '#888', fontSize: '13px' }}>Access AI signals, market data & safety scanning</p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: '#0f0f0f', borderRadius: '10px', border: '1px solid #2a2a2a' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#00D4FF' }}>Free</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>60 req/min</div>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>Market + Signals</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#0f0f0f', borderRadius: '10px', border: '1px solid #39FF1430' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#39FF14' }}>Pro</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>600 req/min</div>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>+ Predictions</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#0f0f0f', borderRadius: '10px', border: '1px solid #8B5CF630' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#8B5CF6' }}>Enterprise</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>3000 req/min</div>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>+ Webhooks</div>
              </div>
            </div>
          </div>
          
          <SectionCard title="Generate API Key" icon="🔐">
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g., My Trading Bot)"
                style={{
                  flex: 1,
                  minWidth: '200px',
                  background: '#0f0f0f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <div style={{ display: 'flex', gap: '4px', background: '#0f0f0f', borderRadius: '8px', padding: '4px', border: '1px solid #333' }}>
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
                background: '#0a1a0a',
                border: '1px solid #39FF1440',
                borderRadius: '10px',
                padding: '16px',
                marginTop: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ color: '#39FF14', fontSize: '16px' }}>✓</span>
                  <span style={{ color: '#39FF14', fontWeight: '600' }}>API Key Generated!</span>
                </div>
                <p style={{ color: '#888', fontSize: '12px', margin: '0 0 12px' }}>
                  Copy this key now - it won't be shown again!
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#0f0f0f',
                  padding: '12px',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                }}>
                  <code style={{ flex: 1, color: '#00D4FF', fontSize: '13px', wordBreak: 'break-all' }}>
                    {newKeyGenerated.key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newKeyGenerated.key, 'newKey')}
                    style={{
                      background: apiKeysCopied['newKey'] ? '#39FF14' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: apiKeysCopied['newKey'] ? '#000' : '#fff',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {apiKeysCopied['newKey'] ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <button
                  onClick={() => setNewKeyGenerated(null)}
                  style={{
                    marginTop: '12px',
                    background: '#2a2a2a',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Dismiss
                </button>
              </div>
            )}
          </SectionCard>
          
          {apiKeys.length > 0 && (
            <SectionCard title="Your API Keys" icon="📋">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: '#0f0f0f',
                      borderRadius: '8px',
                      border: '1px solid #2a2a2a',
                    }}
                  >
                    <div>
                      <div style={{ color: '#fff', fontWeight: '500', fontSize: '14px' }}>{key.name}</div>
                      <div style={{ color: '#666', fontSize: '12px', fontFamily: 'monospace' }}>{key.prefix}...</div>
                    </div>
                    <div style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: key.status === 'active' ? '#39FF1420' : '#FF6B3520',
                      color: key.status === 'active' ? '#39FF14' : '#FF6B35',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}>
                      {key.status === 'active' ? 'Active' : 'Revoked'}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
          
          <SectionCard title="API Documentation" icon="📖" fullWidth>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#0f0f0f', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ background: '#39FF14', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>GET</span>
                  <code style={{ color: '#ccc', fontSize: '13px' }}>/api/v1/market-overview?category=top</code>
                </div>
                <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Get market overview with top coins, BTC dominance, and sentiment</p>
              </div>
              
              <div style={{ padding: '12px', background: '#0f0f0f', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ background: '#39FF14', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>GET</span>
                  <code style={{ color: '#ccc', fontSize: '13px' }}>/api/v1/price/:symbol</code>
                </div>
                <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Get current price for a cryptocurrency (e.g., BTC, ETH, SOL)</p>
              </div>
              
              <div style={{ padding: '12px', background: '#0f0f0f', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ background: '#39FF14', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>GET</span>
                  <code style={{ color: '#ccc', fontSize: '13px' }}>/api/v1/signals?symbol=BTC</code>
                </div>
                <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Get AI analysis signals for a coin (BUY/SELL/HOLD with confidence)</p>
              </div>
              
              <div style={{ padding: '12px', background: '#0f0f0f', borderRadius: '8px', border: '1px solid #8B5CF630' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ background: '#8B5CF6', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>PRO</span>
                  <code style={{ color: '#ccc', fontSize: '13px' }}>/api/v1/predictions/:symbol?horizon=4h</code>
                </div>
                <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Get ML predictions with probability scores (Pro tier required)</p>
              </div>
              
              <div style={{ marginTop: '8px', padding: '12px', background: '#1a1a2a', borderRadius: '8px', border: '1px solid #00D4FF30' }}>
                <p style={{ color: '#00D4FF', fontSize: '12px', margin: 0 }}>
                  <strong>Authentication:</strong> Include your API key in the <code style={{ background: '#0f0f0f', padding: '2px 6px', borderRadius: '4px' }}>X-Pulse-Api-Key</code> header
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
      
      {activeTab === 'documents' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {BUSINESS_DOCS.map(doc => (
            <BusinessDocCard key={doc.id} doc={doc} onView={handleViewDoc} />
          ))}
        </div>
      )}
      
      {activeTab === 'tasks' && (
        <div>
          <div style={{
            background: '#1a1a1a',
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
                background: '#1a1a1a',
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
    </div>
  );
}
