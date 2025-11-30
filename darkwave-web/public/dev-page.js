// Developer Dashboard Page - Full system controls with accordion UI

const DevDashboard = {
  adminCode: null,
  dashboardData: null,
  
  async init(code) {
    this.adminCode = code || prompt('Enter Admin Access Code:');
    if (!this.adminCode) {
      alert('Access code required');
      return false;
    }
    
    await this.loadDashboard();
    return true;
  },
  
  async loadDashboard() {
    try {
      const response = await fetch(`/api/dev/dashboard?code=${encodeURIComponent(this.adminCode)}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          alert('Invalid admin code');
          return;
        }
        throw new Error('Failed to load dashboard');
      }
      
      const data = await response.json();
      this.dashboardData = data.dashboard;
      console.log('✅ [DevDashboard] Data loaded', this.dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      alert('Failed to load developer dashboard');
    }
  },
  
  async updateConfig(key, value, description, isSecret = false) {
    try {
      const response = await fetch('/api/dev/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Code': this.adminCode
        },
        body: JSON.stringify({ key, value, description, isSecret })
      });
      
      if (response.ok) {
        alert(`Config "${key}" updated successfully`);
        await this.loadDashboard();
        return true;
      } else {
        alert('Failed to update config');
        return false;
      }
    } catch (error) {
      console.error('Config update error:', error);
      alert('Error updating config');
      return false;
    }
  },
  
  formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num || 0);
  },
  
  formatCurrency(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num || 0);
  },
  
  renderPage() {
    const d = this.dashboardData;
    if (!d) return '<div class="dev-loading">Loading developer dashboard...</div>';
    
    return `
      <div class="dev-dashboard">
        <div class="dev-header">
          <h1>🛠️ Developer Dashboard</h1>
          <p class="dev-subtitle">Full system control and monitoring</p>
        </div>
        
        <!-- Quick Stats Row -->
        <div class="dev-stats-row">
          <div class="dev-stat">
            <span class="dev-stat-value">${this.formatNumber(d.subscriptions?.total)}</span>
            <span class="dev-stat-label">Total Users</span>
          </div>
          <div class="dev-stat dev-stat-green">
            <span class="dev-stat-value">${this.formatCurrency(d.subscriptions?.monthlyRevenue)}</span>
            <span class="dev-stat-label">Monthly Revenue</span>
          </div>
          <div class="dev-stat dev-stat-blue">
            <span class="dev-stat-value">${this.formatNumber(d.auditTrail?.total)}</span>
            <span class="dev-stat-label">Audit Events</span>
          </div>
          <div class="dev-stat dev-stat-purple">
            <span class="dev-stat-value">${this.formatNumber(d.hallmarks?.total)}</span>
            <span class="dev-stat-label">Hallmarks</span>
          </div>
        </div>
        
        <!-- Accordion Sections -->
        <div class="accordion-container">
          
          <!-- Subscriptions -->
          <div class="accordion-item">
            <div class="accordion-header" onclick="DevDashboard.toggleAccordion(this)">
              <span class="accordion-icon">💳</span>
              <span class="accordion-title">Subscriptions</span>
              <span class="accordion-arrow">▼</span>
            </div>
            <div class="accordion-content">
              <div class="dev-grid-2">
                <div class="dev-info-box">
                  <label>Premium Users</label>
                  <span class="dev-value">${d.subscriptions?.premium || 0}</span>
                </div>
                <div class="dev-info-box">
                  <label>Basic Users</label>
                  <span class="dev-value">${d.subscriptions?.basic || 0}</span>
                </div>
                <div class="dev-info-box">
                  <label>Total Subscribers</label>
                  <span class="dev-value">${d.subscriptions?.total || 0}</span>
                </div>
                <div class="dev-info-box">
                  <label>Monthly Revenue</label>
                  <span class="dev-value dev-value-green">${this.formatCurrency(d.subscriptions?.monthlyRevenue)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Users & Sessions -->
          <div class="accordion-item">
            <div class="accordion-header" onclick="DevDashboard.toggleAccordion(this)">
              <span class="accordion-icon">👥</span>
              <span class="accordion-title">Users & Sessions</span>
              <span class="accordion-arrow">▼</span>
            </div>
            <div class="accordion-content">
              <div class="dev-grid-2">
                <div class="dev-info-box">
                  <label>Whitelisted Users</label>
                  <span class="dev-value">${d.users?.whitelisted || 0}</span>
                </div>
                <div class="dev-info-box">
                  <label>Active Sessions</label>
                  <span class="dev-value">${d.users?.activeSessions || 0}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Audit Trail -->
          <div class="accordion-item">
            <div class="accordion-header" onclick="DevDashboard.toggleAccordion(this)">
              <span class="accordion-icon">🔗</span>
              <span class="accordion-title">Blockchain Audit Trail</span>
              <span class="accordion-arrow">▼</span>
            </div>
            <div class="accordion-content">
              <div class="dev-grid-3">
                <div class="dev-info-box">
                  <label>Total Events</label>
                  <span class="dev-value">${d.auditTrail?.total || 0}</span>
                </div>
                <div class="dev-info-box">
                  <label>Pending</label>
                  <span class="dev-value dev-value-yellow">${d.auditTrail?.pending || 0}</span>
                </div>
                <div class="dev-info-box">
                  <label>On-Chain</label>
                  <span class="dev-value dev-value-green">${d.auditTrail?.confirmed || 0}</span>
                </div>
              </div>
              <div class="dev-status-row">
                <span class="dev-status ${d.heliusConfigured ? 'dev-status-ok' : 'dev-status-warn'}">
                  ${d.heliusConfigured ? '✅ Helius API Configured' : '⚠️ Helius API Not Set'}
                </span>
                <span class="dev-status ${d.walletConfigured ? 'dev-status-ok' : 'dev-status-warn'}">
                  ${d.walletConfigured ? '✅ Solana Wallet Set' : '⏳ Waiting for Wallet'}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Hallmarks -->
          <div class="accordion-item">
            <div class="accordion-header" onclick="DevDashboard.toggleAccordion(this)">
              <span class="accordion-icon">🏆</span>
              <span class="accordion-title">Hallmark NFTs</span>
              <span class="accordion-arrow">▼</span>
            </div>
            <div class="accordion-content">
              <div class="dev-grid-2">
                <div class="dev-info-box">
                  <label>Total Minted</label>
                  <span class="dev-value">${d.hallmarks?.total || 0}</span>
                </div>
                <div class="dev-info-box">
                  <label>Revenue</label>
                  <span class="dev-value dev-value-green">${this.formatCurrency(d.hallmarks?.revenue)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- System Configuration -->
          <div class="accordion-item">
            <div class="accordion-header" onclick="DevDashboard.toggleAccordion(this)">
              <span class="accordion-icon">⚙️</span>
              <span class="accordion-title">System Configuration</span>
              <span class="accordion-arrow">▼</span>
            </div>
            <div class="accordion-content">
              <div class="dev-config-section">
                <h4>Current Config</h4>
                <div class="dev-config-list">
                  ${Object.keys(d.systemConfig || {}).length > 0 
                    ? Object.entries(d.systemConfig).map(([key, value]) => `
                        <div class="dev-config-item">
                          <span class="dev-config-key">${key}</span>
                          <span class="dev-config-value">${value}</span>
                        </div>
                      `).join('')
                    : '<p class="dev-empty">No configuration set</p>'
                  }
                </div>
                
                <h4>Add/Update Config</h4>
                <div class="dev-config-form">
                  <input type="text" id="configKey" placeholder="Key (e.g., solana_audit_wallet)" class="dev-input">
                  <input type="text" id="configValue" placeholder="Value" class="dev-input">
                  <input type="text" id="configDesc" placeholder="Description (optional)" class="dev-input">
                  <label class="dev-checkbox">
                    <input type="checkbox" id="configSecret"> Is Secret
                  </label>
                  <button onclick="DevDashboard.saveConfig()" class="dev-button">Save Config</button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="accordion-item">
            <div class="accordion-header" onclick="DevDashboard.toggleAccordion(this)">
              <span class="accordion-icon">⚡</span>
              <span class="accordion-title">Quick Actions</span>
              <span class="accordion-arrow">▼</span>
            </div>
            <div class="accordion-content">
              <div class="dev-actions-grid">
                <button onclick="DevDashboard.loadDashboard()" class="dev-action-btn">
                  🔄 Refresh Data
                </button>
                <button onclick="window.open('/admin?code=' + DevDashboard.adminCode, '_blank')" class="dev-action-btn">
                  📊 Full Admin Panel
                </button>
                <button onclick="DevDashboard.testAuditEvent()" class="dev-action-btn">
                  🧪 Test Audit Event
                </button>
                <button onclick="window.location.reload()" class="dev-action-btn">
                  ↻ Reload Page
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    `;
  },
  
  toggleAccordion(header) {
    const item = header.parentElement;
    const content = item.querySelector('.accordion-content');
    const arrow = header.querySelector('.accordion-arrow');
    
    const isOpen = content.classList.contains('accordion-open');
    
    if (isOpen) {
      content.classList.remove('accordion-open');
      arrow.style.transform = 'rotate(0deg)';
    } else {
      content.classList.add('accordion-open');
      arrow.style.transform = 'rotate(180deg)';
    }
  },
  
  async saveConfig() {
    const key = document.getElementById('configKey')?.value;
    const value = document.getElementById('configValue')?.value;
    const description = document.getElementById('configDesc')?.value;
    const isSecret = document.getElementById('configSecret')?.checked;
    
    if (!key || !value) {
      alert('Key and Value are required');
      return;
    }
    
    await this.updateConfig(key, value, description, isSecret);
  },
  
  async testAuditEvent() {
    try {
      const response = await fetch('/api/audit-trail/stats');
      const data = await response.json();
      alert(`Audit Trail Stats:\nTotal: ${data.stats?.totalEvents || 0}\nPending: ${data.stats?.pendingEvents || 0}\nConfirmed: ${data.stats?.confirmedEvents || 0}`);
    } catch (error) {
      alert('Failed to fetch audit stats');
    }
  }
};

// Export for global access
window.DevDashboard = DevDashboard;

console.log('✅ Developer Dashboard module loaded');
