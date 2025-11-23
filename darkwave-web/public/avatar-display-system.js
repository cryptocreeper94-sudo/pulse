// Avatar Display System - Manages avatar modes and display in analysis modal
console.log('✅ Avatar Display System loaded');

const avatarDisplaySystem = {
  currentMode: 'agent', // 'agent', 'crypto-cat', 'off'
  currentAgentId: null,
  
  // Initialize avatar system
  init() {
    this.loadMode();
    this.loadAgentSelection();
    console.log(`✅ Avatar system initialized - Mode: ${this.currentMode}`);
  },
  
  // Get current mode
  getMode() {
    return this.currentMode;
  },
  
  // Set display mode
  setMode(mode) {
    if (!['agent', 'crypto-cat', 'off'].includes(mode)) {
      console.warn(`❌ Invalid mode: ${mode}`);
      return;
    }
    this.currentMode = mode;
    localStorage.setItem('avatarDisplayMode', mode);
    console.log(`✅ Avatar mode changed to: ${mode}`);
    
    // Refresh modal if open
    const modal = document.getElementById('analysisModal');
    if (modal && modal.style.display !== 'none') {
      this.renderAvatarInModal();
    }
  },
  
  // Load mode from storage
  loadMode() {
    const saved = localStorage.getItem('avatarDisplayMode');
    if (saved && ['agent', 'crypto-cat', 'off'].includes(saved)) {
      this.currentMode = saved;
    }
  },
  
  // Load agent selection
  loadAgentSelection() {
    const agentId = localStorage.getItem('userSelectedAgent');
    if (agentId) {
      this.currentAgentId = parseInt(agentId);
    }
  },
  
  // Get current agent
  getCurrentAgent() {
    if (this.currentAgentId && typeof getAgentById !== 'undefined') {
      return getAgentById(this.currentAgentId);
    }
    if (typeof getUserSelectedAgent !== 'undefined') {
      const agent = getUserSelectedAgent();
      this.currentAgentId = agent.id;
      return agent;
    }
    return null;
  },
  
  // Set agent
  setAgent(agentId) {
    this.currentAgentId = agentId;
    localStorage.setItem('userSelectedAgent', agentId);
    if (typeof setUserSelectedAgent !== 'undefined') {
      setUserSelectedAgent(agentId);
    }
    this.renderAvatarInModal();
  },
  
  // Get avatar color by agent ID
  getAgentColor(agentId) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9CCE3',
      '#F5B7B1', '#ABEBC6', '#D7BDE2', '#F9E79F', '#A3E4D7'
    ];
    return colors[(agentId - 1) % colors.length];
  },
  
  // Render avatar display in modal
  renderAvatarInModal() {
    const container = document.getElementById('avatarDisplayContainer');
    if (!container) return;
    
    let html = '';
    
    if (this.currentMode === 'agent') {
      const agent = this.getCurrentAgent();
      if (agent) {
        const bgColor = this.getAgentColor(agent.id);
        const initials = agent.name.split(' ').map(n => n[0]).join('');
        
        html = `
          <div class="avatar-display agent-avatar" style="
            display: flex; align-items: center; gap: 12px; padding: 12px; 
            background: rgba(0,0,0,0.3); border: 1px solid rgba(59,130,246,0.2); border-radius: 8px;
          ">
            <div class="avatar-circle" style="
              width: 50px; height: 50px; border-radius: 50%; background: ${bgColor}; 
              display: flex; align-items: center; justify-content: center; flex-shrink: 0;
              font-weight: 700; color: white; font-size: 20px;
            ">${initials}</div>
            <div class="avatar-info" style="flex: 1; min-width: 0;">
              <div class="avatar-name" style="font-weight: 600; color: white; font-size: 13px;">${agent.name}</div>
              <div class="avatar-title" style="color: rgba(255,255,255,0.7); font-size: 11px;">${agent.title}</div>
            </div>
            <button class="avatar-selector-btn" onclick="avatarDisplaySystem.openAgentSelector()" title="Change Agent" style="
              background: rgba(59,130,246,0.2); border: 1px solid rgba(59,130,246,0.3); border-radius: 6px;
              padding: 6px 10px; color: #60a5fa; cursor: pointer; font-size: 12px; white-space: nowrap;
            ">🔄 Change</button>
          </div>
        `;
      }
    } else if (this.currentMode === 'crypto-cat') {
      html = `
        <div class="avatar-display crypto-cat" style="
          display: flex; align-items: center; gap: 12px; padding: 12px;
          background: rgba(0,0,0,0.3); border: 1px solid rgba(139,92,246,0.2); border-radius: 8px;
        ">
          <div class="crypto-cat-emoji" style="
            font-size: 40px; flex-shrink: 0;
          ">🐱</div>
          <div class="avatar-info" style="flex: 1;">
            <div class="avatar-name" style="font-weight: 600; color: white; font-size: 13px;">Crypto Cat</div>
            <div class="avatar-title" style="color: rgba(255,255,255,0.7); font-size: 11px;">Your Trading Companion</div>
          </div>
          <button class="avatar-selector-btn" onclick="avatarDisplaySystem.openModeSelector()" title="Change Mode" style="
            background: rgba(139,92,246,0.2); border: 1px solid rgba(139,92,246,0.3); border-radius: 6px;
            padding: 6px 10px; color: #a78bfa; cursor: pointer; font-size: 12px; white-space: nowrap;
          ">🔄 Change</button>
        </div>
      `;
    } else {
      html = `
        <div class="avatar-display off-mode" style="
          padding: 8px 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(107,114,128,0.2);
          border-radius: 6px; color: rgba(255,255,255,0.6); text-align: center; font-size: 12px;
          display: flex; align-items: center; justify-content: space-between;
        ">
          <span>Avatar Display: Off</span>
          <button class="avatar-selector-btn" onclick="avatarDisplaySystem.openModeSelector()" title="Change Mode" style="
            background: rgba(107,114,128,0.2); border: 1px solid rgba(107,114,128,0.3); border-radius: 6px;
            padding: 4px 8px; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 11px;
          ">🔄</button>
        </div>
      `;
    }
    
    container.innerHTML = html;
  },
  
  // Open mode selector
  openModeSelector() {
    const html = `
      <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 12px;">
        <button onclick="avatarDisplaySystem.setMode('agent')" style="padding: 8px 12px; background: ${this.currentMode === 'agent' ? '#3b82f6' : 'rgba(59,130,246,0.3)'}; border: 1px solid ${this.currentMode === 'agent' ? '#60a5fa' : 'rgba(59,130,246,0.5)'}; border-radius: 6px; color: white; cursor: pointer; font-weight: 600; font-size: 12px;">🤖 Agent Mode</button>
        <button onclick="avatarDisplaySystem.setMode('crypto-cat')" style="padding: 8px 12px; background: ${this.currentMode === 'crypto-cat' ? '#8b5cf6' : 'rgba(139,92,246,0.3)'}; border: 1px solid ${this.currentMode === 'crypto-cat' ? '#a78bfa' : 'rgba(139,92,246,0.5)'}; border-radius: 6px; color: white; cursor: pointer; font-weight: 600; font-size: 12px;">🐱 Cat Mode</button>
        <button onclick="avatarDisplaySystem.setMode('off')" style="padding: 8px 12px; background: ${this.currentMode === 'off' ? '#6b7280' : 'rgba(107,114,128,0.3)'}; border: 1px solid ${this.currentMode === 'off' ? '#9ca3af' : 'rgba(107,114,128,0.5)'}; border-radius: 6px; color: white; cursor: pointer; font-weight: 600; font-size: 12px;">🔇 Off</button>
      </div>
    `;
    
    const container = document.getElementById('avatarDisplayContainer');
    if (container) {
      const modeSelector = document.createElement('div');
      modeSelector.id = 'avatarModeSelector';
      modeSelector.innerHTML = html;
      container.parentElement.insertBefore(modeSelector, container);
      
      setTimeout(() => {
        modeSelector.remove();
      }, 8000);
    }
  },
  
  // Open agent selector
  openAgentSelector() {
    const userData = window.userData || {};
    const isAdmin = userData.accessLevel === 'admin';
    
    // Create agent selector modal
    const modal = document.createElement('div');
    modal.id = 'avatarAgentSelectorModal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8);
      display: flex; align-items: center; justify-content: center; z-index: 10000;
    `;
    
    let agentCards = AGENTS.map(agent => `
      <div class="agent-card" onclick="avatarDisplaySystem.setAgent(${agent.id})" style="
        cursor: pointer; padding: 12px; text-align: center; border: 2px solid ${this.currentAgentId === agent.id ? '#3b82f6' : 'rgba(255,255,255,0.2)'}; 
        border-radius: 8px; background: rgba(0,0,0,0.3); transition: all 0.2s;
      " onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='${this.currentAgentId === agent.id ? '#3b82f6' : 'rgba(255,255,255,0.2)'}'">
        <img src="${agent.image}" alt="${agent.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-bottom: 8px; display: block; margin-left: auto; margin-right: auto;" onerror="this.src='/agent-avatars/placeholder.png'">
        <div style="font-weight: 600; font-size: 12px;">${agent.name}</div>
      </div>
    `).join('');
    
    const content = `
      <div style="background: #1a1f2e; border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 20px; max-width: 90vw; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: white;">Select Your Agent 🤖</h3>
          <button onclick="document.getElementById('avatarAgentSelectorModal').remove()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 10px; margin-bottom: 15px;">
          ${agentCards}
        </div>
        
        ${isAdmin ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
            <button onclick="avatarDisplaySystem.openAvatarBuilder()" style="
              width: 100%; padding: 10px; background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.1)); 
              border: 1px solid rgba(168,85,247,0.3); border-radius: 6px; color: #c084fc; font-weight: 600; cursor: pointer;
            ">
              🎨 Avatar Builder (Admin Only)
            </button>
            <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 6px; text-align: center;">
              Create custom avatars - Unlocks in V2 for all users
            </div>
          </div>
        ` : ''}
      </div>
    `;
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },
  
  // Avatar builder (admin only)
  openAvatarBuilder() {
    const userData = window.userData || {};
    if (userData.accessLevel !== 'admin') {
      alert('⚠️ Avatar Builder is locked until V2 release on December 25, 2025');
      return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'avatarBuilderModal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9);
      display: flex; align-items: center; justify-content: center; z-index: 10001;
    `;
    
    modal.innerHTML = `
      <div style="background: #1a1f2e; border: 1px solid rgba(168,85,247,0.3); border-radius: 12px; padding: 30px; max-width: 600px; text-align: center;">
        <h2 style="color: #c084fc; margin: 0 0 15px 0;">🎨 Avatar Builder (Admin Preview)</h2>
        <p style="color: rgba(255,255,255,0.8); line-height: 1.6;">
          This is where admins can create and test custom avatars before the full V2 release on December 25, 2025.
        </p>
        <div style="margin: 20px 0; padding: 15px; background: rgba(168,85,247,0.1); border-radius: 8px; border: 1px solid rgba(168,85,247,0.2);">
          <p style="color: #c084fc; font-weight: 600; margin: 0 0 10px 0;">Features Coming:</p>
          <ul style="color: rgba(255,255,255,0.7); text-align: left; display: inline-block; line-height: 1.8;">
            <li>✅ Upload custom character images</li>
            <li>✅ Configure personality traits</li>
            <li>✅ Test in live analysis</li>
            <li>✅ Share with team</li>
          </ul>
        </div>
        <button onclick="document.getElementById('avatarBuilderModal').remove()" style="
          margin-top: 15px; padding: 10px 20px; background: rgba(59,130,246,0.2); border: 1px solid rgba(59,130,246,0.3);
          border-radius: 6px; color: #60a5fa; font-weight: 600; cursor: pointer;
        ">Close</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => avatarDisplaySystem.init());
} else {
  avatarDisplaySystem.init();
}

// Expose globally
window.avatarDisplaySystem = avatarDisplaySystem;
