// Collectible Agent Cards System for Projects Page
console.log('✅ Agent Cards system loaded');

// Create small carousel-style agent card
function createAgentCard(agent) {
  const card = document.createElement('div');
  card.className = 'featured-coin-card';
  card.onclick = () => {
    setUserSelectedAgent(agent.id);
    showAgentPopup(agent);
  };
  card.innerHTML = `
    <div style="position: relative; width: 100%; aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center;">
      <img src="${agent.image}" alt="${agent.name}" class="featured-coin-image" onerror="this.src='/darkwave-coin.png'" />
      <img src="/darkwave-lapel-pin.svg" alt="DarkWave lapel pin" style="position: absolute; width: 28%; height: 28%; top: 8%; left: 12%; filter: drop-shadow(0 0 4px rgba(255, 136, 153, 0.6)); pointer-events: none;" />
    </div>
    <div style="font-size: 9px; font-weight: 700; color: #FFF; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">${agent.name}</div>
  `;
  return card;
}

// Render all agent cards in a container
function renderAgentCards(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Agent cards container "${containerId}" not found`);
    return;
  }
  
  container.innerHTML = '';
  container.className = 'featured-coins-grid';
  
  AGENTS.forEach(agent => {
    const card = createAgentCard(agent);
    container.appendChild(card);
  });
  
  console.log(`✅ Rendered ${AGENTS.length} Agent cards in carousel`);
}

// Expose globally
window.createAgentCard = createAgentCard;
window.renderAgentCards = renderAgentCards;
