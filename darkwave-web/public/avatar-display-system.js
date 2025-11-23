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
            margin-bottom: 12px;
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
          margin-bottom: 12px;
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
    }
    // Off mode: don't show anything
    
    container.innerHTML = html;
    container.style.display = html ? 'block' : 'none';
    
    // Also show signal badge when avatar is displayed
    const signalBadge = document.getElementById('analysisSignal');
    if (signalBadge && html) {
      signalBadge.style.display = 'flex';
    }
  },
  
  // Open mode selector with floating agent buttons
  openModeSelector() {
    const agent = this.getCurrentAgent();
    const agentColor = this.getAgentColor(agent ? agent.id : 1);
    
    // Create a fixed modal overlay to ensure visibility
    const modal = document.createElement('div');
    modal.id = 'avatarModeSelectorModal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.4); z-index: 5000; display: flex; 
      align-items: center; justify-content: center;
    `;
    
    const html = `
      <div style="
        position: relative; width: 90%; max-width: 400px; height: 150px; 
        display: flex; align-items: center; justify-content: space-between;
        background: rgba(0,0,0,0.2); border: 1px solid rgba(168,85,247,0.2); 
        border-radius: 16px; padding: 30px 20px;
      ">
        <!-- Agent Mode Button (Left) -->
        <button onclick="avatarDisplaySystem.setMode('agent'); document.getElementById('avatarModeSelectorModal').remove();" style="
          position: absolute; left: 20px; top: 50%; transform: translateY(-50%);
          width: 120px; border: none; background: none; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          transition: all 0.3s;
        " onmouseover="this.style.transform='translateY(-50%) scale(1.1)'" onmouseout="this.style.transform='translateY(-50%) scale(1)'">
          <div style="
            width: 80px; height: 80px; border-radius: 50%; 
            background: ${agentColor}; 
            display: flex; align-items: center; justify-content: center;
            font-weight: 700; color: white; font-size: 32px;
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8), 0 0 80px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(255,255,255,0.1);
            position: relative; z-index: 2;
          ">${agent ? agent.name.split(' ').map(n => n[0]).join('') : 'AG'}</div>
          <div style="
            margin-top: 8px; font-size: 11px; color: rgba(255,255,255,0.9);
            font-weight: 600; white-space: nowrap;
          ">🤖 Agent</div>
        </button>
        
        <!-- Center Label -->
        <div style="
          position: absolute; left: 50%; transform: translateX(-50%); 
          text-align: center; z-index: 1; width: 60px;
        ">
          <div style="font-size: 11px; color: rgba(255,255,255,0.6); letter-spacing: 1px; font-weight: 600;">
            SELECT<br/>MODE
          </div>
        </div>
        
        <!-- Cat Mode Button (Center-Right) -->
        <button onclick="avatarDisplaySystem.setMode('crypto-cat'); document.getElementById('avatarModeSelectorModal').remove();" style="
          position: absolute; left: 50%; transform: translateX(-50%) translateY(-50%); top: 50%;
          width: 120px; border: none; background: none; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          transition: all 0.3s;
        " onmouseover="this.style.transform='translateX(-50%) translateY(-50%) scale(1.1)'" onmouseout="this.style.transform='translateX(-50%) translateY(-50%) scale(1)'">
          <div style="
            width: 80px; height: 80px; border-radius: 50%; 
            background: linear-gradient(135deg, #a855f7, #7c3aed);
            display: flex; align-items: center; justify-content: center;
            font-size: 40px;
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8), 0 0 80px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(255,255,255,0.1);
            position: relative; z-index: 2;
          ">🐱</div>
          <div style="
            margin-top: 8px; font-size: 11px; color: rgba(255,255,255,0.9);
            font-weight: 600; white-space: nowrap;
          ">🐱 Cat</div>
        </button>
        
        <!-- Off Mode Button (Right) -->
        <button onclick="avatarDisplaySystem.setMode('off'); document.getElementById('avatarModeSelectorModal').remove();" style="
          position: absolute; right: 20px; top: 50%; transform: translateY(-50%);
          width: 120px; border: none; background: none; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          transition: all 0.3s;
        " onmouseover="this.style.transform='translateY(-50%) scale(1.1)'" onmouseout="this.style.transform='translateY(-50%) scale(1)'">
          <div style="
            width: 80px; height: 80px; border-radius: 50%; 
            background: linear-gradient(135deg, #6b7280, #4b5563);
            display: flex; align-items: center; justify-content: center;
            font-size: 40px;
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8), 0 0 80px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(255,255,255,0.1);
            position: relative; z-index: 2;
          ">🔇</div>
          <div style="
            margin-top: 8px; font-size: 11px; color: rgba(255,255,255,0.9);
            font-weight: 600; white-space: nowrap;
          ">Off</div>
        </button>
      </div>
    `;
    
    modal.innerHTML = html;
    document.body.appendChild(modal);
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    // Auto-close after 10 seconds
    setTimeout(() => {
      const el = document.getElementById('avatarModeSelectorModal');
      if (el) el.remove();
    }, 10000);
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
    
    // Check if light theme is active
    const isLightTheme = document.body.style.backgroundColor === '#D4D4D4' || 
                         document.documentElement.classList.contains('light-theme');
    const bgColor = isLightTheme ? '#CCCCCC' : '#2A2A2A'; // Solid light gray or dark gray
    
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: ${bgColor};
      display: flex; align-items: center; justify-content: center; z-index: 10001; overflow-y: auto;
    `;
    
    const isPaid = window.userData?.isPaid || false;
    
    // Avatar skin themes
    const skinThemes = [
      { name: '🌌 Deep Space', color: '#0B0C10', desc: 'Cosmic depths' },
      { name: '🌊 Ocean', color: '#0d1b2a', desc: 'Deep blue waters' },
      { name: '🌲 Forest', color: '#0f1419', desc: 'Green canopy' },
      { name: '🌄 Outdoors', color: '#2A2416', desc: 'Countryside sunrise' },
      { name: '🏈 Sports Pro', color: '#1a1a1a', desc: 'Professional sports' },
      { name: '🎓 College', color: '#0a0e27', desc: 'College colors' },
      { name: '🌀 Paisley', color: '#1a0f1f', desc: 'Ornate patterns' },
      { name: '🌸 Flowers', color: '#2d1b2e', desc: 'Floral designs' },
      { name: '⚫ Solid Black', color: '#000000', desc: 'Sleek black' },
      { name: '⚪ Solid White', color: '#E8E8E8', desc: 'Clean white' }
    ];
    
    const availableSkins = isPaid ? skinThemes : skinThemes.slice(7); // Nonsubscribers see paisleys, flowers, solid colors only
    
    const skinsHTML = availableSkins.map(skin => `
      <div style="
        padding: 12px; background: linear-gradient(135deg, ${skin.color}, rgba(255,255,255,0.05));
        border: 2px solid rgba(168,85,247,0.3); border-radius: 8px; cursor: pointer; 
        transition: all 0.2s; text-align: center;
      " onmouseover="this.style.borderColor='#a78bfa'; this.style.boxShadow='0 0 15px rgba(168,85,247,0.4)'" 
        onmouseout="this.style.borderColor='rgba(168,85,247,0.3)'; this.style.boxShadow=''">
        <div style="font-weight: 700; color: #fff; margin-bottom: 4px;">${skin.name}</div>
        <div style="font-size: 11px; color: rgba(255,255,255,0.6);">${skin.desc}</div>
        <div style="margin-top: 8px; height: 30px; background: ${skin.color}; border-radius: 4px; opacity: 0.7;"></div>
      </div>
    `).join('');
    
    modal.innerHTML = `
      <div style="background: #1a1f2e; border: 2px solid rgba(168,85,247,0.5); border-radius: 12px; padding: 25px; max-width: 700px; max-height: 85vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="color: #c084fc; margin: 0;">🎨 Avatar Theme Builder</h2>
          <button onclick="document.getElementById('avatarBuilderModal').remove()" style="
            background: none; border: none; color: #c084fc; font-size: 24px; cursor: pointer; padding: 0;
          ">×</button>
        </div>
        
        <p style="color: rgba(255,255,255,0.8); margin: 0 0 15px 0; font-size: 12px;">
          ${isPaid ? '✅ Premium: Choose from all 10 avatar theme skins' : '⚠️ Free: Choose from 3 limited theme skins (Paisley, Flowers, Solid Colors)'}
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px;">
          ${skinsHTML}
        </div>
        
        <div style="background: rgba(168,85,247,0.1); border-left: 3px solid #a78bfa; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
          <p style="color: #c084fc; font-size: 12px; margin: 0; font-weight: 600;">💡 How It Works:</p>
          <ul style="color: rgba(255,255,255,0.7); font-size: 11px; margin: 8px 0 0 0; padding-left: 20px;">
            <li>Click a theme skin to select</li>
            <li>Upload or use default avatar image</li>
            <li>Add watermark or pattern overlay</li>
            <li>Preview in real-time</li>
            <li>Save to your profile</li>
          </ul>
        </div>
        
        ${!isPaid ? `
          <div style="background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.1)); border: 1px solid rgba(59,130,246,0.3); padding: 12px; border-radius: 6px; margin-bottom: 15px; text-align: center;">
            <p style="color: #60a5fa; font-size: 12px; margin: 0; font-weight: 600;">🔓 Unlock Premium for 10+ Avatar Themes</p>
            <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 6px 0 0 0;">Space, Ocean, Forest, Sports, College, and more</p>
          </div>
        ` : ''}
        
        <button onclick="document.getElementById('avatarBuilderModal').remove()" style="
          width: 100%; padding: 10px; background: rgba(59,130,246,0.2); border: 1px solid rgba(59,130,246,0.3);
          border-radius: 6px; color: #60a5fa; font-weight: 600; cursor: pointer; font-size: 12px;
        ">Done</button>
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
