// Agent Selector - Compact Carousel with Subscription Gating
console.log('✅ Agent Selector System loaded');

// Store user's selected agent in localStorage
function getUserSelectedAgent() {
  const savedAgentId = localStorage.getItem('userSelectedAgent');
  if (savedAgentId) {
    return getAgentById(parseInt(savedAgentId));
  }
  return getRandomAgent();
}

function setUserSelectedAgent(agentId) {
  localStorage.setItem('userSelectedAgent', agentId);
}

// Show agent popup with info
function showAgentPopup(agent) {
  if (!agent) agent = getUserSelectedAgent();
  
  const modal = document.getElementById('agentPopupModal');
  if (!modal) {
    console.warn('Agent popup modal not found');
    return;
  }
  
  const agentImage = document.getElementById('agentPopupImage');
  const agentName = document.getElementById('agentPopupName');
  const agentTitle = document.getElementById('agentPopupTitle');
  const agentHighlight = document.getElementById('agentPopupHighlight');
  const agentFunFact = document.getElementById('agentPopupFunFact');
  
  if (agentImage) agentImage.src = agent.image;
  if (agentName) agentName.textContent = agent.name;
  if (agentTitle) agentTitle.textContent = agent.title;
  if (agentHighlight) agentHighlight.textContent = `🏆 ${agent.careerHighlight}`;
  if (agentFunFact) agentFunFact.textContent = `⚡ ${agent.funFact}`;
  
  modal.style.display = 'flex';
}

function closeAgentPopup() {
  const modal = document.getElementById('agentPopupModal');
  if (modal) modal.style.display = 'none';
}

// Check subscription status
function isUserSubscribed() {
  const access = typeof getUserAccessLevel === 'function' ? getUserAccessLevel() : { isPaid: false };
  return access.isPaid === true;
}

// Open agent selector carousel
function openAgentSelector() {
  const modal = document.getElementById('agentSelectorModal');
  if (!modal) {
    console.warn('Agent selector modal not found');
    return;
  }
  
  console.log('✅ Opening agent selector');
  
  // Check subscription
  if (!isUserSubscribed()) {
    console.log('🔒 User not subscribed - showing locked state');
    showAgentSelectorLocked(modal);
    return;
  }
  
  console.log('✅ User subscribed - showing carousel');
  showAgentCarousel(modal);
}

function showAgentSelectorLocked(modal) {
  const container = document.getElementById('agentSelectorContainer');
  if (!container) return;
  
  container.innerHTML = `
    <div class="agent-selector-locked">
      <button class="agent-carousel-close" onclick="closeAgentSelector()" style="position: absolute; top: 12px; right: 12px;">×</button>
      <div class="agent-lock-icon">🔒</div>
      <h3>Premium Feature</h3>
      <p>Choose from 18 AI agents</p>
      <button class="agent-upgrade-btn" onclick="switchTab('settings')">UPGRADE NOW</button>
    </div>
  `;
  modal.style.display = 'flex';
}

function showAgentCarousel(modal) {
  const container = document.getElementById('agentSelectorContainer');
  if (!container) return;
  
  // Create carousel structure
  container.innerHTML = `
    <div class="agent-carousel-wrapper">
      <div class="agent-carousel-header">
        <h3>Select Your Agent</h3>
        <span class="agent-carousel-close" onclick="closeAgentSelector()">×</span>
      </div>
      
      <div class="agent-carousel-filters">
        <button class="agent-filter-btn active" data-filter="all">All</button>
        <button class="agent-filter-btn" data-filter="young">Young (20-30)</button>
        <button class="agent-filter-btn" data-filter="middle">Middle (35-55)</button>
        <button class="agent-filter-btn" data-filter="old">Senior (55+)</button>
      </div>
      
      <div class="agent-carousel">
        <button class="agent-carousel-nav agent-carousel-prev" onclick="agentCarouselPrev()">❮</button>
        <div class="agent-carousel-track" id="agentCarouselTrack"></div>
        <button class="agent-carousel-nav agent-carousel-next" onclick="agentCarouselNext()">❯</button>
      </div>
      
      <div class="agent-carousel-dots" id="agentCarouselDots"></div>
    </div>
  `;
  
  renderAgentCarousel('all');
  attachAgentCarouselListeners();
  modal.style.display = 'flex';
}

function renderAgentCarousel(filter = 'all') {
  const track = document.getElementById('agentCarouselTrack');
  if (!track) {
    console.warn('Carousel track not found');
    return;
  }
  
  // Check if AGENTS is available
  if (typeof window.AGENTS === 'undefined' || !window.AGENTS) {
    console.warn('AGENTS not loaded yet');
    track.innerHTML = '<p style="padding: 20px; color: var(--text-secondary);">Loading agents...</p>';
    return;
  }
  
  const filtered = filter === 'all' 
    ? window.AGENTS
    : window.AGENTS.filter(a => a.ageGroup === filter);
  
  console.log(`✅ Rendering ${filtered.length} agents (filter: ${filter})`);
  
  track.innerHTML = filtered.map(agent => `
    <div class="agent-carousel-card" onclick="selectAgentFromCarousel(${agent.id})">
      <img src="${agent.image}" alt="${agent.name}" />
      <div class="agent-card-info">
        <div class="agent-card-name">${agent.name}</div>
        <div class="agent-card-age">${agent.age ? agent.age : 'N/A'}</div>
      </div>
    </div>
  `).join('');
  
  // Update dots
  const dotsContainer = document.getElementById('agentCarouselDots');
  if (dotsContainer) {
    dotsContainer.innerHTML = filtered.map((_, i) => `
      <button class="agent-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>
    `).join('');
  }
}

function attachAgentCarouselListeners() {
  const filterBtns = document.querySelectorAll('.agent-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAgentCarousel(btn.dataset.filter);
    });
  });
}

function selectAgentFromCarousel(agentId) {
  console.log(`✅ Selected agent ID: ${agentId}`);
  const agent = getAgentById(agentId);
  if (agent) {
    setUserSelectedAgent(agentId);
    console.log(`✅ Agent ${agent.name} selected`);
    showAgentPopup(agent);
    closeAgentSelector();
  } else {
    console.warn(`Agent with ID ${agentId} not found`);
  }
}

function agentCarouselNext() {
  const track = document.getElementById('agentCarouselTrack');
  if (track) track.scrollBy({ left: 200, behavior: 'smooth' });
}

function agentCarouselPrev() {
  const track = document.getElementById('agentCarouselTrack');
  if (track) track.scrollBy({ left: -200, behavior: 'smooth' });
}

function closeAgentSelector() {
  const modal = document.getElementById('agentSelectorModal');
  if (modal) modal.style.display = 'none';
}

function initializeAgentSystem() {
  const agent = getUserSelectedAgent();
  window.currentAgent = agent;
  console.log(`✅ Agent System initialized with ${agent.name}`);
}

// Expose globally
window.showAgentPopup = showAgentPopup;
window.closeAgentPopup = closeAgentPopup;
window.openAgentSelector = openAgentSelector;
window.closeAgentSelector = closeAgentSelector;
window.initializeAgentSystem = initializeAgentSystem;
window.getUserSelectedAgent = getUserSelectedAgent;
window.setUserSelectedAgent = setUserSelectedAgent;
window.agentCarouselNext = agentCarouselNext;
window.agentCarouselPrev = agentCarouselPrev;
window.selectAgentFromCarousel = selectAgentFromCarousel;
