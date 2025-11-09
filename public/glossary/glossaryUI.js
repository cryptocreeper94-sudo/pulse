// ─────────────────────────────────────────────
// 🎨 Glossary UI Components
// ─────────────────────────────────────────────

import {
  getAllTerms,
  filterGlossaryByCategory,
  searchGlossary,
  getGlossaryTerm,
  getRandomTerm,
  getRecentTerms,
  getCategoryCounts,
  trackRecentTerm,
  categories
} from './glossaryEngine.js';

// Global state
let currentSassMode = localStorage.getItem('glossarySassMode') !== 'false'; // Default true
let currentCategory = 'All';
let currentSearchTerm = '';
let currentTerms = [];

// Initialize glossary page
export function initGlossary() {
  console.log('🔤 Initializing glossary...');
  
  renderGlossaryPage();
  loadTerms();
  
  // Add event listeners
  document.getElementById('glossary-search')?.addEventListener('input', handleSearch);
  document.getElementById('sass-toggle-btn')?.addEventListener('click', toggleSassMode);
  
  // Category filter buttons
  document.querySelectorAll('.category-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => handleCategoryFilter(btn.dataset.category));
  });
}

// Render glossary page structure
function renderGlossaryPage() {
  const container = document.getElementById('glossary-container');
  if (!container) return;
  
  const categoryCounts = getCategoryCounts();
  const recentTerms = getRecentTerms(currentSassMode);
  const termOfDay = getRandomTerm(currentSassMode);
  
  container.innerHTML = `
    <div class="glossary-page">
      <!-- Header -->
      <div class="glossary-header">
        <div class="glossary-title-section">
          <h1 class="glossary-title">📖 DarkWave Glossary</h1>
          <p class="glossary-subtitle">
            Your grumpy guide to crypto, finance, and NFTs
          </p>
        </div>
        
        <!-- Sass Toggle -->
        <button id="sass-toggle-btn" class="sass-toggle-btn ${currentSassMode ? 'active' : ''}">
          <span class="toggle-icon">${currentSassMode ? '😾' : '📚'}</span>
          <span class="toggle-text">
            ${currentSassMode ? 'Sass Mode ON' : 'Plain Mode'}
          </span>
        </button>
      </div>
      
      <!-- Search Bar -->
      <div class="glossary-search-section">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            id="glossary-search" 
            class="glossary-search-input"
            placeholder="Search terms, definitions..." 
            value="${currentSearchTerm}"
          />
          <button class="search-clear-btn" id="search-clear-btn" style="display: ${currentSearchTerm ? 'flex' : 'none'}">×</button>
        </div>
      </div>
      
      <!-- Category Filters -->
      <div class="category-filters">
        ${categories.map(cat => `
          <button 
            class="category-filter-btn ${currentCategory === cat ? 'active' : ''}" 
            data-category="${cat}"
          >
            ${cat}
            ${cat !== 'All' ? `<span class="category-count">${categoryCounts[cat] || 0}</span>` : ''}
          </button>
        `).join('')}
      </div>
      
      <!-- Recent Terms (if any) -->
      ${recentTerms.length > 0 ? `
        <div class="recent-terms-section">
          <h3 class="recent-terms-title">📌 Recently Viewed</h3>
          <div class="recent-terms-chips">
            ${recentTerms.map(term => `
              <button class="recent-term-chip" onclick="window.viewGlossaryTerm('${term.term}')">
                ${term.term}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- Term of the Day -->
      <div class="term-of-day-section">
        <div class="term-of-day-card">
          <div class="term-of-day-header">
            <span class="term-of-day-label">✨ Random Term</span>
            <button class="term-of-day-refresh" onclick="window.refreshTermOfDay()">🔄</button>
          </div>
          <h3 class="term-of-day-term">${termOfDay.term}</h3>
          <p class="term-of-day-definition">${termOfDay.definition}</p>
          <img 
            src="/crypto-cat-poses/${termOfDay.pose}.png" 
            alt="${termOfDay.term}" 
            class="term-of-day-cat"
            onerror="this.style.display='none'"
          />
        </div>
      </div>
      
      <!-- Results Count -->
      <div class="glossary-results-header">
        <span class="results-count" id="results-count">Loading...</span>
      </div>
      
      <!-- Terms Grid -->
      <div class="glossary-grid" id="glossary-grid">
        <div class="loading-spinner"></div>
      </div>
    </div>
  `;
  
  // Add clear button listener
  document.getElementById('search-clear-btn')?.addEventListener('click', () => {
    document.getElementById('glossary-search').value = '';
    currentSearchTerm = '';
    handleSearch({ target: { value: '' } });
  });
}

// Load and render terms
function loadTerms() {
  if (currentSearchTerm) {
    currentTerms = searchGlossary(currentSearchTerm, currentSassMode);
  } else if (currentCategory !== 'All') {
    currentTerms = filterGlossaryByCategory(currentCategory, currentSassMode);
  } else {
    currentTerms = getAllTerms(currentSassMode);
  }
  
  renderTermsGrid();
}

// Render terms grid
function renderTermsGrid() {
  const grid = document.getElementById('glossary-grid');
  const resultsCount = document.getElementById('results-count');
  
  if (!grid) return;
  
  // Update results count
  if (resultsCount) {
    resultsCount.textContent = `${currentTerms.length} term${currentTerms.length !== 1 ? 's' : ''}`;
  }
  
  // Render cards
  if (currentTerms.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🤷</div>
        <h3>No terms found</h3>
        <p>Try a different search or category</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = currentTerms.map(term => `
    <div class="glossary-card" onclick="window.viewGlossaryTerm('${term.term}')">
      <div class="glossary-card-content">
        <div class="glossary-card-header">
          <h3 class="glossary-term-name">${term.term}</h3>
          <span class="glossary-category-badge">${term.category}</span>
        </div>
        <p class="glossary-definition">${term.definition}</p>
      </div>
      <div class="glossary-card-cat">
        <img 
          src="/crypto-cat-poses/${term.pose}.png" 
          alt="${term.pose} crypto cat" 
          class="crypto-cat-pose"
          onerror="this.src='/crypto-cat-mascot.png'"
        />
      </div>
    </div>
  `).join('');
}

// Handle search input
function handleSearch(e) {
  currentSearchTerm = e.target.value;
  
  // Show/hide clear button
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) {
    clearBtn.style.display = currentSearchTerm ? 'flex' : 'none';
  }
  
  // Debounce search
  clearTimeout(window.glossarySearchTimeout);
  window.glossarySearchTimeout = setTimeout(() => {
    loadTerms();
  }, 300);
}

// Handle category filter
function handleCategoryFilter(category) {
  currentCategory = category;
  currentSearchTerm = '';
  
  // Update search input
  const searchInput = document.getElementById('glossary-search');
  if (searchInput) searchInput.value = '';
  
  // Update active button
  document.querySelectorAll('.category-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  
  loadTerms();
}

// Toggle sass mode
function toggleSassMode() {
  currentSassMode = !currentSassMode;
  localStorage.setItem('glossarySassMode', currentSassMode);
  
  // Update button
  const btn = document.getElementById('sass-toggle-btn');
  if (btn) {
    btn.classList.toggle('active', currentSassMode);
    btn.querySelector('.toggle-icon').textContent = currentSassMode ? '😾' : '📚';
    btn.querySelector('.toggle-text').textContent = currentSassMode ? 'Sass Mode ON' : 'Plain Mode';
  }
  
  // Reload terms with new mode
  loadTerms();
}

// View individual term (modal)
window.viewGlossaryTerm = function(termName) {
  const term = getGlossaryTerm(termName, currentSassMode);
  if (!term) return;
  
  // Track as recent
  trackRecentTerm(termName);
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'glossary-modal-overlay';
  modal.innerHTML = `
    <div class="glossary-modal">
      <button class="glossary-modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
      
      <div class="glossary-modal-content">
        <div class="glossary-modal-header">
          <h2 class="glossary-modal-term">${term.term}</h2>
          <span class="glossary-modal-category">${term.category}</span>
        </div>
        
        <div class="glossary-modal-cat">
          <img 
            src="/crypto-cat-poses/${term.pose}.png" 
            alt="${term.pose} crypto cat" 
            class="glossary-modal-cat-img"
            onerror="this.src='/crypto-cat-mascot.png'"
          />
        </div>
        
        <div class="glossary-modal-definitions">
          <div class="glossary-modal-definition ${currentSassMode ? 'active' : ''}">
            <h4 class="definition-label">😾 Sass Mode</h4>
            <p class="definition-text">${term.smartass}</p>
          </div>
          
          <div class="glossary-modal-definition ${!currentSassMode ? 'active' : ''}">
            <h4 class="definition-label">📚 Plain Mode</h4>
            <p class="definition-text">${term.plain}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
};

// Refresh term of day
window.refreshTermOfDay = function() {
  const termOfDay = getRandomTerm(currentSassMode);
  const card = document.querySelector('.term-of-day-card');
  if (!card) return;
  
  // Animate refresh
  card.style.opacity = '0.5';
  setTimeout(() => {
    card.querySelector('.term-of-day-term').textContent = termOfDay.term;
    card.querySelector('.term-of-day-definition').textContent = termOfDay.definition;
    card.querySelector('.term-of-day-cat').src = `/crypto-cat-poses/${termOfDay.pose}.png`;
    card.style.opacity = '1';
  }, 200);
};

export {
  initGlossary,
  toggleSassMode,
  handleSearch,
  handleCategoryFilter
};
