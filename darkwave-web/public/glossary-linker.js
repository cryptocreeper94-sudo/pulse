// ═══════════════════════════════════════════════════════════════
// 🔗 DarkWave Pulse - Glossary Linker
// Makes financial terms clickable throughout the app
// ═══════════════════════════════════════════════════════════════

class GlossaryLinker {
  constructor() {
    this.linkedElements = new Set();
    this.termsToLink = [
      // Crypto terms
      'EMA (50-day)',
      'EMA (200-day)',
      'SMA (50-day)',
      'SMA (200-day)',
      'RSI (14-day)',
      'MACD',
      'All-Time High',
      'ATH Date',
      'From ATH',
      'Golden Cross',
      'Death Cross',
      'Market Cap',
      'Volume',
      '24H Volume',
      'Fear & Greed',
      'Altcoin Season',
      // Stock terms
      'NASDAQ',
      'Dow Jones',
      'S&P 500',
      'Market Breadth',
      'Bullish',
      'Bearish',
      'Neutral',
      'P/E Ratio',
      'Earnings',
      'Dividend'
    ];
  }

  /**
   * Link all glossary terms in a container
   * @param {HTMLElement} container - The container to scan for terms
   */
  linkTerms(container) {
    if (!container) return;

    // Find all indicator labels in the analysis modal
    const labels = container.querySelectorAll('.indicator-label');
    labels.forEach(label => {
      const term = label.textContent.trim();
      if (this.termsToLink.includes(term) && !this.linkedElements.has(label)) {
        this.makeClickable(label, term);
        this.linkedElements.add(label);
      }
    });

    // Find metric boxes in dashboard
    const metricLabels = container.querySelectorAll('.metric-label');
    metricLabels.forEach(label => {
      const term = label.textContent.trim();
      if (this.termsToLink.includes(term) && !this.linkedElements.has(label)) {
        this.makeClickable(label, term);
        this.linkedElements.add(label);
      }
    });

    // Find gauge labels
    const gaugeLabels = container.querySelectorAll('.gauge-label');
    gaugeLabels.forEach(label => {
      const term = label.textContent.trim();
      if (this.termsToLink.includes(term) && !this.linkedElements.has(label)) {
        this.makeClickable(label, term);
        this.linkedElements.add(label);
      }
    });
  }

  /**
   * Make an element clickable and show glossary popup
   */
  makeClickable(element, term) {
    // Add visual indicator that it's clickable
    element.style.cursor = 'pointer';
    element.style.textDecoration = 'underline dotted';
    element.style.textUnderlineOffset = '3px';
    
    // Add click handler
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showGlossaryPopup(term);
    });

    // Add hover effect
    element.addEventListener('mouseenter', () => {
      element.style.color = 'var(--accent-blue)';
    });

    element.addEventListener('mouseleave', () => {
      element.style.color = '';
    });
  }

  /**
   * Show glossary popup for a term
   */
  showGlossaryPopup(term) {
    // NO CRYPTO CAT POPUPS on Projects page (accessible to everyone)
    const currentTab = document.querySelector('.tab-pane.active');
    if (currentTab && currentTab.id === 'projects') {
      console.log('🔒 Crypto Cat popups disabled on Projects page');
      return;
    }
    
    // Check subscription access - metric box terms allowed for everyone, others restricted
    const isMetricBoxTerm = ['Fear & Greed', 'Altcoin Season'].includes(term);
    
    if (!isMetricBoxTerm && typeof hasFeatureAccess === 'function' && !hasFeatureAccess('cryptoCatGlossary')) {
      console.log('🔒 Glossary popups restricted to paid subscribers (except metric boxes)');
      return;
    }
    
    // Sync persona before getting definition
    const catMode = window.currentCatMode || 'off';
    if (window.glossaryService) {
      window.glossaryService.setPersona(catMode);
    }
    
    const definition = window.glossaryService.getDefinition(term);
    
    if (!definition) {
      console.warn(`No glossary definition found for: ${term}`);
      return;
    }
    
    // Build the popup text based on persona
    let popupText = '';
    
    if (catMode === 'business') {
      popupText = `${definition.definition}\n\n💼 Business Cat says: Professional investors use this metric to analyze market trends and make informed decisions.`;
    } else if (catMode === 'casual') {
      popupText = `${definition.definition}\n\n🐱 Casual Cat says: ${definition.commentary}`;
    } else {
      // Off mode - just the definition
      popupText = definition.definition;
    }

    // Use new slide-in popup system
    if (window.showCharacterSlideIn) {
      window.showCharacterSlideIn({
        term: definition.term.toUpperCase(),
        definition: popupText,
        message: popupText
      });
    } else if (window.showCatPopup) {
      // Fallback to old system
      window.showCatPopup(definition.term.toUpperCase(), popupText);
    }
  }

  /**
   * Link terms in the analysis modal
   */
  linkAnalysisModal() {
    const analysisContainer = document.getElementById('analysisModal');
    if (analysisContainer) {
      this.linkTerms(analysisContainer);
    }
  }

  /**
   * Link terms in the dashboard (crypto)
   */
  linkDashboard() {
    const dashboard = document.querySelector('.crypto-dashboard');
    if (dashboard) {
      this.linkTerms(dashboard);
    }
  }

  /**
   * Link terms in the stocks page
   */
  linkStocksPage() {
    const stocksTab = document.getElementById('stocks');
    if (stocksTab) {
      this.linkTerms(stocksTab);
    }
  }

  /**
   * Link all terms throughout the app
   */
  linkAll() {
    this.linkAnalysisModal();
    this.linkDashboard();
    this.linkStocksPage();
  }

  /**
   * Reset linked elements (useful when DOM changes)
   */
  reset() {
    this.linkedElements.clear();
  }
}

// Create global singleton instance
window.glossaryLinker = new GlossaryLinker();
