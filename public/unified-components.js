/* ============================================ */
/* UNIFIED COMPONENTS - JavaScript             */
/* Carousel, Accordion, Category Pills         */
/* ============================================ */

class UnifiedCarousel {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;
    
    this.options = {
      itemsToShow: options.itemsToShow || 'auto',
      gap: options.gap || 12,
      showArrows: options.showArrows !== false,
      showDots: options.showDots !== false,
      swipe: options.swipe !== false,
      autoplay: options.autoplay || false,
      autoplayInterval: options.autoplayInterval || 5000,
      loop: options.loop !== false,
      ...options
    };
    
    this.currentIndex = 0;
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    this.init();
  }
  
  init() {
    this.track = this.container.querySelector('.u-carousel-track');
    this.items = this.track ? Array.from(this.track.children) : [];
    
    if (this.items.length === 0) return;
    
    if (this.options.showArrows) this.createArrows();
    if (this.options.showDots) this.createDots();
    if (this.options.swipe) this.enableSwipe();
    if (this.options.autoplay) this.startAutoplay();
    
    this.updateVisibility();
    window.addEventListener('resize', () => this.updateVisibility());
  }
  
  createArrows() {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'u-carousel-nav prev';
    prevBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>';
    prevBtn.addEventListener('click', () => this.prev());
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'u-carousel-nav next';
    nextBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>';
    nextBtn.addEventListener('click', () => this.next());
    
    this.container.appendChild(prevBtn);
    this.container.appendChild(nextBtn);
    
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
  }
  
  createDots() {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'u-carousel-dots';
    
    const pageCount = this.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'u-carousel-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => this.goToPage(i));
      dotsContainer.appendChild(dot);
    }
    
    this.container.appendChild(dotsContainer);
    this.dotsContainer = dotsContainer;
  }
  
  getItemWidth() {
    if (this.items.length === 0) return 0;
    const itemStyle = window.getComputedStyle(this.items[0]);
    return this.items[0].offsetWidth + parseInt(itemStyle.marginRight || 0);
  }
  
  getVisibleItems() {
    const containerWidth = this.container.offsetWidth;
    const itemWidth = this.getItemWidth();
    return Math.max(1, Math.floor(containerWidth / (itemWidth + this.options.gap)));
  }
  
  getPageCount() {
    const visibleItems = this.getVisibleItems();
    return Math.ceil(this.items.length / visibleItems);
  }
  
  getMaxIndex() {
    return Math.max(0, this.items.length - this.getVisibleItems());
  }
  
  next() {
    const maxIndex = this.getMaxIndex();
    if (this.currentIndex < maxIndex) {
      this.currentIndex++;
    } else if (this.options.loop) {
      this.currentIndex = 0;
    }
    this.updatePosition();
  }
  
  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else if (this.options.loop) {
      this.currentIndex = this.getMaxIndex();
    }
    this.updatePosition();
  }
  
  goToPage(page) {
    const visibleItems = this.getVisibleItems();
    this.currentIndex = Math.min(page * visibleItems, this.getMaxIndex());
    this.updatePosition();
  }
  
  updatePosition() {
    if (!this.track) return;
    
    const itemWidth = this.getItemWidth();
    const offset = this.currentIndex * (itemWidth + this.options.gap);
    this.track.style.transform = `translateX(-${offset}px)`;
    
    this.updateDots();
    this.updateArrows();
  }
  
  updateDots() {
    if (!this.dotsContainer) return;
    
    const dots = this.dotsContainer.querySelectorAll('.u-carousel-dot');
    const visibleItems = this.getVisibleItems();
    const currentPage = Math.floor(this.currentIndex / visibleItems);
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentPage);
    });
  }
  
  updateArrows() {
    if (!this.prevBtn || !this.nextBtn) return;
    
    const maxIndex = this.getMaxIndex();
    
    if (!this.options.loop) {
      this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.3' : '1';
      this.nextBtn.style.opacity = this.currentIndex >= maxIndex ? '0.3' : '1';
    }
  }
  
  updateVisibility() {
    const containerWidth = this.container.offsetWidth;
    const totalWidth = this.items.reduce((sum, item) => sum + item.offsetWidth + this.options.gap, 0);
    
    const needsNav = totalWidth > containerWidth;
    
    if (this.prevBtn) this.prevBtn.style.display = needsNav ? 'flex' : 'none';
    if (this.nextBtn) this.nextBtn.style.display = needsNav ? 'flex' : 'none';
    if (this.dotsContainer) this.dotsContainer.style.display = needsNav ? 'flex' : 'none';
    
    if (this.dotsContainer) {
      this.dotsContainer.innerHTML = '';
      const pageCount = this.getPageCount();
      for (let i = 0; i < pageCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'u-carousel-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => this.goToPage(i));
        this.dotsContainer.appendChild(dot);
      }
    }
    
    this.updatePosition();
  }
  
  enableSwipe() {
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    this.container.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
  }
  
  handleSwipe() {
    const threshold = 50;
    const diff = this.touchStartX - this.touchEndX;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }
  
  startAutoplay() {
    this.autoplayTimer = setInterval(() => this.next(), this.options.autoplayInterval);
    
    this.container.addEventListener('mouseenter', () => this.stopAutoplay());
    this.container.addEventListener('mouseleave', () => this.startAutoplay());
  }
  
  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
  
  destroy() {
    this.stopAutoplay();
    if (this.prevBtn) this.prevBtn.remove();
    if (this.nextBtn) this.nextBtn.remove();
    if (this.dotsContainer) this.dotsContainer.remove();
  }
}

class UnifiedAccordion {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;
    
    this.options = {
      singleOpen: options.singleOpen !== false,
      defaultOpen: options.defaultOpen || null,
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.items = this.container.querySelectorAll('.u-accordion-item');
    
    this.items.forEach((item, index) => {
      const header = item.querySelector('.u-accordion-header');
      if (header) {
        header.addEventListener('click', () => this.toggle(item));
      }
      
      if (this.options.defaultOpen === index || item.classList.contains('open')) {
        item.classList.add('open');
      }
    });
  }
  
  toggle(item) {
    const isOpen = item.classList.contains('open');
    
    if (this.options.singleOpen) {
      this.items.forEach(i => i.classList.remove('open'));
    }
    
    if (!isOpen) {
      item.classList.add('open');
    } else if (!this.options.singleOpen) {
      item.classList.remove('open');
    }
  }
  
  openAll() {
    this.items.forEach(item => item.classList.add('open'));
  }
  
  closeAll() {
    this.items.forEach(item => item.classList.remove('open'));
  }
}

class CategoryPills {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;
    
    this.options = {
      onSelect: options.onSelect || null,
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.pills = this.container.querySelectorAll('.u-category-pill');
    
    this.pills.forEach(pill => {
      pill.addEventListener('click', () => this.select(pill));
    });
  }
  
  select(pill) {
    this.pills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    
    if (this.options.onSelect) {
      this.options.onSelect(pill.dataset.category || pill.textContent);
    }
  }
  
  getActive() {
    const active = this.container.querySelector('.u-category-pill.active');
    return active ? active.dataset.category || active.textContent : null;
  }
}

class CollapsibleForm {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;
    
    this.init();
  }
  
  init() {
    const header = this.container.querySelector('.u-collapsible-form-header');
    if (header) {
      header.addEventListener('click', () => this.toggle());
    }
  }
  
  toggle() {
    this.container.classList.toggle('open');
  }
  
  open() {
    this.container.classList.add('open');
  }
  
  close() {
    this.container.classList.remove('open');
  }
}

function initNewsCarousel(containerId, newsData) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let html = '<div class="u-carousel"><div class="u-carousel-track">';
  
  newsData.forEach(news => {
    html += `
      <div class="u-carousel-item u-news-card" onclick="window.open('${news.url}', '_blank')">
        <div class="u-news-source">${news.source}</div>
        <div class="u-news-title">${news.title}</div>
        <div class="u-news-meta">${news.time || ''}</div>
      </div>
    `;
  });
  
  html += '</div></div>';
  container.innerHTML = html;
  
  return new UnifiedCarousel(container.querySelector('.u-carousel'));
}

function initCoinCategoryCarousel(containerId, coins, onCoinClick) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let html = '<div class="u-carousel"><div class="u-carousel-track">';
  
  coins.forEach(coin => {
    html += `
      <div class="u-carousel-item u-coin-card" data-coin-id="${coin.id}" onclick="${onCoinClick ? `${onCoinClick}('${coin.id}')` : ''}">
        <img src="${coin.logo}" alt="${coin.name}" class="u-coin-logo" onerror="this.src='/darkwave-coin.png'" />
        <div class="u-coin-name">${coin.name}</div>
        <div class="u-coin-ticker">${coin.ticker}</div>
        ${coin.price ? `<div class="u-coin-price">${coin.price}</div>` : ''}
      </div>
    `;
  });
  
  html += '</div></div>';
  container.innerHTML = html;
  
  return new UnifiedCarousel(container.querySelector('.u-carousel'));
}

window.UnifiedCarousel = UnifiedCarousel;
window.UnifiedAccordion = UnifiedAccordion;
window.CategoryPills = CategoryPills;
window.CollapsibleForm = CollapsibleForm;
window.initNewsCarousel = initNewsCarousel;
window.initCoinCategoryCarousel = initCoinCategoryCarousel;

console.log('✅ Unified Components loaded');
