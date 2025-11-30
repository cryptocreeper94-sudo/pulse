// Blockchain Trail Dashboard - User's on-chain audit trail and Hallmark collection

const BlockchainTrail = {
  currentUserId: null,
  events: [],
  hallmarks: [],
  
  async init() {
    console.log('🔗 [BlockchainTrail] Initializing...');
    this.currentUserId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    await this.loadAuditTrail();
    await this.loadHallmarks();
    console.log('✅ [BlockchainTrail] Ready');
  },
  
  async loadAuditTrail() {
    try {
      const response = await fetch('/api/audit-trail', {
        headers: {
          'X-Session-Token': localStorage.getItem('sessionToken') || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.events = data.events || [];
      }
    } catch (error) {
      console.error('Failed to load audit trail:', error);
    }
  },
  
  async loadHallmarks() {
    try {
      const response = await fetch('/api/hallmark/collection', {
        headers: {
          'X-Session-Token': localStorage.getItem('sessionToken') || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.hallmarks = data.hallmarks || [];
      }
    } catch (error) {
      console.error('Failed to load hallmarks:', error);
    }
  },
  
  getStatusBadge(status) {
    const badges = {
      pending: '<span class="trail-badge trail-badge-pending">Pending</span>',
      confirmed: '<span class="trail-badge trail-badge-confirmed">On-Chain</span>',
      failed: '<span class="trail-badge trail-badge-failed">Failed</span>',
    };
    return badges[status] || badges.pending;
  },
  
  getCategoryIcon(category) {
    const icons = {
      account: '👤',
      subscription: '💳',
      payment: '💰',
      wallet: '🔗',
      presale: '🚀',
      security: '🔒',
      hallmark: '🏆',
    };
    return icons[category] || '📝';
  },
  
  formatEventType(type) {
    return type.split('.').pop().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  },
  
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  truncateHash(hash) {
    if (!hash) return '—';
    return hash.substring(0, 8) + '...' + hash.substring(hash.length - 6);
  },
  
  renderDashboard() {
    const confirmedCount = this.events.filter(e => e.status === 'confirmed').length;
    const pendingCount = this.events.filter(e => e.status === 'pending').length;
    
    return `
      <div class="blockchain-trail-dashboard">
        <div class="trail-header">
          <h2>🔗 Your Blockchain Trail</h2>
          <p class="trail-subtitle">Every important action, hashed and verified on Solana</p>
        </div>
        
        <div class="trail-stats">
          <div class="trail-stat-card">
            <div class="trail-stat-value">${this.events.length}</div>
            <div class="trail-stat-label">Total Events</div>
          </div>
          <div class="trail-stat-card trail-stat-confirmed">
            <div class="trail-stat-value">${confirmedCount}</div>
            <div class="trail-stat-label">On-Chain</div>
          </div>
          <div class="trail-stat-card trail-stat-pending">
            <div class="trail-stat-value">${pendingCount}</div>
            <div class="trail-stat-label">Pending</div>
          </div>
          <div class="trail-stat-card trail-stat-hallmarks">
            <div class="trail-stat-value">${this.hallmarks.length}</div>
            <div class="trail-stat-label">Hallmarks</div>
          </div>
        </div>
        
        <div class="accordion-container">
          <!-- Audit Events Accordion -->
          <div class="accordion-item">
            <div class="accordion-header" onclick="BlockchainTrail.toggleAccordion(this)">
              <span class="accordion-icon">📋</span>
              <span class="accordion-title">Audit Events (${this.events.length})</span>
              <span class="accordion-arrow">▼</span>
            </div>
            <div class="accordion-content">
              ${this.renderEventsList()}
            </div>
          </div>
          
          <!-- Hallmarks Accordion -->
          <div class="accordion-item">
            <div class="accordion-header" onclick="BlockchainTrail.toggleAccordion(this)">
              <span class="accordion-icon">🏆</span>
              <span class="accordion-title">Your Hallmarks (${this.hallmarks.length})</span>
              <span class="accordion-arrow">▼</span>
            </div>
            <div class="accordion-content">
              ${this.renderHallmarksList()}
            </div>
          </div>
          
          <!-- Mint New Hallmark -->
          <div class="accordion-item">
            <div class="accordion-header" onclick="BlockchainTrail.toggleAccordion(this)">
              <span class="accordion-icon">✨</span>
              <span class="accordion-title">Mint New Hallmark NFT</span>
              <span class="accordion-arrow">▼</span>
            </div>
            <div class="accordion-content">
              ${this.renderMintSection()}
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  renderEventsList() {
    if (this.events.length === 0) {
      return `
        <div class="trail-empty">
          <p>No audit events yet. Your important actions will appear here as they're recorded and hashed to the blockchain.</p>
        </div>
      `;
    }
    
    return `
      <div class="trail-events-list">
        ${this.events.slice(0, 20).map(event => `
          <div class="trail-event-item">
            <div class="trail-event-icon">${this.getCategoryIcon(event.category)}</div>
            <div class="trail-event-details">
              <div class="trail-event-type">${this.formatEventType(event.type)}</div>
              <div class="trail-event-hash" title="${event.hash}">
                Hash: ${this.truncateHash(event.hash)}
              </div>
              <div class="trail-event-date">${this.formatDate(event.createdAt)}</div>
            </div>
            <div class="trail-event-status">
              ${this.getStatusBadge(event.status)}
              ${event.onChainSignature ? `
                <a href="https://solscan.io/tx/${event.onChainSignature}" target="_blank" class="trail-verify-link">
                  Verify ↗
                </a>
              ` : ''}
            </div>
          </div>
        `).join('')}
        ${this.events.length > 20 ? `
          <div class="trail-more">
            Showing 20 of ${this.events.length} events
          </div>
        ` : ''}
      </div>
    `;
  },
  
  renderHallmarksList() {
    if (this.hallmarks.length === 0) {
      return `
        <div class="trail-empty">
          <p>No Hallmarks minted yet. Mint your first unique Hallmark NFT to capture your on-chain journey!</p>
        </div>
      `;
    }
    
    return `
      <div class="hallmarks-grid">
        ${this.hallmarks.map(hm => `
          <div class="hallmark-card">
            <div class="hallmark-serial">${hm.serialNumber}</div>
            <div class="hallmark-template">${hm.templateUsed || 'Classic'}</div>
            <div class="hallmark-date">${this.formatDate(hm.createdAt)}</div>
            <div class="hallmark-status">${this.getStatusBadge(hm.status)}</div>
            ${hm.artworkUrl ? `
              <a href="${hm.artworkUrl}" target="_blank" class="hallmark-download">
                Download ↓
              </a>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  },
  
  renderMintSection() {
    return `
      <div class="mint-hallmark-section">
        <div class="mint-info">
          <h4>Create Your Unique Hallmark NFT</h4>
          <p>Your Hallmark captures your current avatar, recent audit trail hashes, and a unique serial number - all verified on-chain.</p>
          <div class="mint-price">
            <span class="mint-price-value">$1.99</span>
            <span class="mint-price-label">per Hallmark</span>
          </div>
        </div>
        
        <div class="mint-options">
          <label class="mint-option-label">Select Template:</label>
          <select id="hallmarkTemplate" class="mint-select">
            <option value="classic">Classic</option>
            <option value="premium">Premium Gold</option>
            <option value="cyber">Cyber Neon</option>
            <option value="vintage">Vintage</option>
          </select>
        </div>
        
        <button onclick="BlockchainTrail.startMintProcess()" class="mint-button">
          ✨ Mint Hallmark NFT - $1.99
        </button>
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
  
  async startMintProcess() {
    const template = document.getElementById('hallmarkTemplate')?.value || 'classic';
    
    try {
      const response = await fetch('/api/hallmark/create-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': localStorage.getItem('sessionToken') || ''
        },
        body: JSON.stringify({
          userId: this.currentUserId,
          template
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // For now, show success message - payment integration will be added
        alert(`Hallmark draft created! Serial: ${data.hallmark.serialNumber}\n\nPayment integration coming soon.`);
      } else {
        alert('Failed to create Hallmark. Please try again.');
      }
    } catch (error) {
      console.error('Mint error:', error);
      alert('Error creating Hallmark. Please try again.');
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only init if user is logged in
  if (localStorage.getItem('sessionToken')) {
    BlockchainTrail.init();
  }
});

console.log('✅ Blockchain Trail module loaded');
