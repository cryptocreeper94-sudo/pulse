import { useState, useEffect } from 'react';

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
    gridColumn: 'span 1',
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
    <div style={{ fontSize: '64px', fontWeight: '800', color: '#00D4FF' }}>
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
      ) : items.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < items.length - 1 ? '1px solid #2a2a2a' : 'none' }}>
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

const HourlyChart = ({ data }) => {
  const max = Math.max(...data, 1);
  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #2a2a2a',
      gridColumn: 'span 1',
    }}>
      <div style={{ fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Today's Traffic (Hourly)</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '100px' }}>
        {data.map((val, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '100%',
              height: `${(val / max) * 80}px`,
              background: `linear-gradient(180deg, #00D4FF, #00D4FF50)`,
              borderRadius: '2px 2px 0 0',
              minHeight: val > 0 ? '4px' : '0',
            }} />
            {i % 4 === 0 && <span style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>{i}h</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

const DailyChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.views), 1);
  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #2a2a2a',
      gridColumn: 'span 1',
    }}>
      <div style={{ fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Weekly Traffic Trend</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: '#00D4FF', marginBottom: '4px' }}>{d.views}</div>
            <div style={{
              width: '100%',
              height: `${(d.views / max) * 80}px`,
              background: 'linear-gradient(180deg, #8B5CF6, #8B5CF650)',
              borderRadius: '4px 4px 0 0',
              minHeight: d.views > 0 ? '8px' : '0',
            }} />
            <span style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
              {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DevelopersPortalTab() {
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  
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
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ color: '#888' }}>Loading analytics...</div>
      </div>
    );
  }
  
  const d = dashboard || {};
  
  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: 0 }}>
          🛠️ Developers Portal
        </h1>
        <p style={{ color: '#888', margin: '8px 0 0' }}>Real-time analytics for Pulse platform</p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr',
        }
      }}
      className="analytics-grid"
      >
        <LiveVisitors count={liveCount} />
        
        <StatCard title="Today" value={d.today?.views || 0} subtitle={`${d.today?.sessions || 0} sessions`} icon="📅" glow="#00D4FF" />
        <StatCard title="This Week" value={d.week?.views || 0} icon="📊" glow="#39FF14" />
        <StatCard title="This Month" value={d.month?.views || 0} icon="📈" glow="#8B5CF6" />
        <StatCard title="All Time" value={d.allTime?.views || 0} subtitle={`${d.allTime?.sessions || 0} unique sessions`} icon="🌍" glow="#FF6B35" />
        
        <HourlyChart data={d.hourlyStats || new Array(24).fill(0)} />
        
        <TopList title="Top Pages" items={d.topPages || []} labelKey="page" valueKey="views" icon="📄" />
        <TopList title="Top Referrers" items={d.topReferrers || []} labelKey="referrer" valueKey="count" icon="🔗" />
        
        <DeviceBreakdown data={d.deviceBreakdown || { desktop: 0, mobile: 0, tablet: 0 }} />
        
        <DailyChart data={d.dailyStats || []} />
        
        <div style={{
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #2a2a2a',
          gridColumn: 'span 1',
        }}>
          <div style={{ fontWeight: '600', color: '#fff', marginBottom: '12px' }}>Avg. Session Duration</div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#00D4FF' }}>
            {Math.floor((d.avgDuration || 0) / 60)}m {(d.avgDuration || 0) % 60}s
          </div>
        </div>
      </div>
    </div>
  );
}
