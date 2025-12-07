// DarkWave NFT Trading Cards Carousel
console.log('✅ Trading Cards Carousel system loaded');

class TradingCardCarousel {
  constructor() {
    this.currentIndex = 0;
    this.cards = TRADING_CARDS || [];
    this.isLocked = this.checkV2Lock();
    this.init();
  }

  checkV2Lock() {
    // Check if V2 features are unlocked
    if (typeof isV2Unlocked === 'function') {
      return !isV2Unlocked('NFT Trading Cards');
    }
    // Default: check date
    const releaseDate = new Date('2026-02-14');
    const now = new Date();
    return now < releaseDate;
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    const container = document.getElementById('trading-cards-carousel');
    if (!container) return;

    if (this.isLocked) {
      container.innerHTML = `
        <div class="trading-carousel-locked">
          <div class="trading-carousel-header">
            <h2>🎴 NFT Trading Cards Collection</h2>
            <div class="trading-lock-badge">
              <span class="lock-icon">🔒</span>
              <span class="lock-text">Unlocks Feb 14</span>
            </div>
          </div>
          <div class="trading-carousel-preview">
            <p>20 collectible AI agents, each with unique career highlights, fun facts, and holographic refractor frames.</p>
            <div class="trading-cards-grid-preview">
              ${this.cards.slice(0, 4).map(card => `
                <div class="trading-card-preview-item">
                  <div class="trading-card-image-wrapper">
                    <img src="${card.image}" alt="${card.name}" loading="lazy" />
                  </div>
                  <div class="trading-card-locked-overlay">
                    <span class="locked-icon">🔒</span>
                  </div>
                </div>
              `).join('')}
            </div>
            <p class="trading-preview-text">See the full collection in 32 days!</p>
          </div>
        </div>
      `;
    } else {
      const card = this.cards[this.currentIndex];
      container.innerHTML = `
        <div class="trading-carousel-container">
          <div class="trading-carousel-header">
            <h2>🎴 NFT Trading Cards Collection</h2>
            <div class="trading-carousel-stats">
              <span class="stat">${this.currentIndex + 1} / ${this.cards.length}</span>
              <span class="stat">Series #1</span>
            </div>
          </div>

          <div class="trading-carousel-main">
            <button class="trading-carousel-nav trading-carousel-prev" id="trading-prev">❮</button>
            
            <div class="trading-card-display">
              <div class="trading-card-frame" style="--refractor-color: ${this.getRefractorGradient(card.refractorColor)}">
                <div class="trading-card-hologram">
                  <img src="${card.image}" alt="${card.name}" class="trading-card-image" />
                </div>
                <div class="trading-card-header">
                  <h3>${card.name.toUpperCase()}</h3>
                  <span class="trading-card-age">AGE: ${card.age === 'UNKNOWN' ? 'UNKNOWN' : card.age}</span>
                </div>
                <div class="trading-card-details">
                  <div class="trading-card-detail-section">
                    <strong>CAREER NOTE:</strong>
                    <p>${card.careerNote}</p>
                  </div>
                  <div class="trading-card-detail-section">
                    <strong>FUN FACT:</strong>
                    <p>${card.funFact}</p>
                  </div>
                  <div class="trading-card-footer">
                    <div class="trading-card-serial">${card.serialNumber}</div>
                    <div class="trading-card-qr">
                      <div class="trading-qr-code" id="trading-qr-${card.id}"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button class="trading-carousel-nav trading-carousel-next" id="trading-next">❯</button>
          </div>

          <div class="trading-carousel-info">
            <div class="trading-info-box">
              <span class="trading-info-label">Race:</span>
              <span class="trading-info-value">${card.race}</span>
            </div>
            <div class="trading-info-box">
              <span class="trading-info-label">Gender:</span>
              <span class="trading-info-value">${card.gender}</span>
            </div>
            <div class="trading-info-box">
              <span class="trading-info-label">Refractor:</span>
              <span class="trading-info-value">${card.refractorColor}</span>
            </div>
            <div class="trading-info-box">
              <span class="trading-info-label">Serial:</span>
              <span class="trading-info-value" style="font-size: 11px;">${card.id}</span>
            </div>
          </div>

          <div class="trading-carousel-nav-dots">
            ${this.cards.map((_, i) => `
              <button class="trading-dot ${i === this.currentIndex ? 'active' : ''}" data-index="${i}"></button>
            `).join('')}
          </div>
        </div>
      `;

      this.attachEventListeners();
      this.generateQRCode(card);
    }
  }

  attachEventListeners() {
    const prevBtn = document.getElementById('trading-prev');
    const nextBtn = document.getElementById('trading-next');
    const dots = document.querySelectorAll('.trading-dot');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => this.goToIndex(parseInt(e.target.dataset.index)));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    this.render();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    this.render();
  }

  goToIndex(index) {
    this.currentIndex = index;
    this.render();
  }

  generateQRCode(card) {
    setTimeout(() => {
      const container = document.getElementById(`trading-qr-${card.id}`);
      if (container && typeof QRCode !== 'undefined') {
        container.innerHTML = '';
        // Get current domain dynamically
        const domain = window.location.origin;
        const profileUrl = `${domain}/?cardId=${card.id}`;
        new QRCode(container, {
          text: profileUrl,
          width: 100,
          height: 100,
          colorDark: '#00ff88',
          colorLight: '#0a0a0a',
          correctLevel: QRCode.CorrectLevel.H
        });
      }
    }, 100);
  }

  getRefractorGradient(color) {
    const gradients = {
      'Neon Cyan Blue': 'linear-gradient(135deg, #00ffff, #0088ff)',
      'Electric Gold': 'linear-gradient(135deg, #ffdd00, #ffaa00)',
      'Crimson Flame': 'linear-gradient(135deg, #ff0040, #ff6600)',
      'Amber Gleam': 'linear-gradient(135deg, #ffaa00, #ffdd00)',
      'Onyx Pulse': 'linear-gradient(135deg, #1a1a1a, #444444)',
      'Magenta Surge': 'linear-gradient(135deg, #ff00ff, #ff0088)',
      'Prismatic Violet': 'linear-gradient(135deg, #bb00ff, #ff00ff)',
      'Holographic Silver': 'linear-gradient(135deg, #cccccc, #ffffff)',
      'Steel Horizon': 'linear-gradient(135deg, #888888, #0088ff)',
      'Cosmic Indigo': 'linear-gradient(135deg, #1a0055, #6600ff)',
      'Cyber Pink': 'linear-gradient(135deg, #ff0088, #ffaa00)',
      'Pearl Shimmer': 'linear-gradient(135deg, #ffffff, #ccffff)',
      'Scarlet Blaze': 'linear-gradient(135deg, #ff0000, #ffaa00)',
      'Bronze Mystique': 'linear-gradient(135deg, #996600, #ddaa00)',
      'Amethyst Glow': 'linear-gradient(135deg, #bb00ff, #0088ff)',
      'Royal Violet': 'linear-gradient(135deg, #5500aa, #bb00ff)',
      'Opalescent Sky': 'linear-gradient(135deg, #88ddff, #ddddff)',
      'Emerald Whisper': 'linear-gradient(135deg, #00aa66, #00ffaa)',
      'Topaz Aurora': 'linear-gradient(135deg, #ffaa00, #ffdd00)',
      'Sapphire Dusk': 'linear-gradient(135deg, #0044aa, #6600ff)'
    };
    return gradients[color] || 'linear-gradient(135deg, #00D4FF, #ff0088)';
  }
}

// Initialize carousel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.tradingCardCarousel = new TradingCardCarousel();
  });
} else {
  window.tradingCardCarousel = new TradingCardCarousel();
}

window.TradingCardCarousel = TradingCardCarousel;
console.log('✅ Trading Card Carousel ready');
