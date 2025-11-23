// DarkWave Guide Controller
// Manages the knowledge base interface

let currentChapterIndex = -1;

// Initialize guide on page load
function initializeGuide() {
  if (!window.CRYPTO_GUIDE) {
    console.warn('⏳ Waiting for guide content to load...');
    // Retry after a short delay
    setTimeout(initializeGuide, 100);
    return;
  }

  renderChaptersList();
  console.log('✅ Knowledge Base initialized:', CRYPTO_GUIDE.chapters.length, 'chapters');
}

// Toggle between cover and reader view
function toggleGuideView() {
  // Check subscription access before allowing guide access
  const userTier = localStorage.getItem('userTier') || 'trial';
  const dwpUser = JSON.parse(localStorage.getItem('dwp_user') || '{}');
  const isWhitelisted = dwpUser.isWhitelisted || false;
  
  // Block trial users who are not whitelisted
  if (userTier === 'trial' && !isWhitelisted) {
    // Educational content is locked for trial users
    console.log('🔒 Educational content locked for trial users');
    // Optionally show an alert or scroll to the gate
    const educationalGate = document.getElementById('educationalGate');
    if (educationalGate && educationalGate.style.display === 'flex') {
      educationalGate.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return; // Block access
  }
  
  const cover = document.querySelector('.guide-cover');
  const reader = document.getElementById('guideReader');
  
  if (reader.style.display === 'none') {
    cover.style.display = 'none';
    reader.style.display = 'block';
    showChaptersMenu();
  } else {
    cover.style.display = 'flex';
    reader.style.display = 'none';
    currentChapterIndex = -1;
  }
}

// Render chapters list
function renderChaptersList() {
  const chaptersList = document.getElementById('chaptersList');
  if (!chaptersList) return;

  chaptersList.innerHTML = CRYPTO_GUIDE.chapters.map((chapter, index) => `
    <div class="chapter-item" onclick="openChapter(${index})">
      <div class="chapter-number">Chapter ${chapter.id}</div>
      <div class="chapter-info">
        <div class="chapter-icon">${chapter.icon}</div>
        <div class="chapter-title-text">${chapter.title}</div>
      </div>
      <div class="chapter-arrow">→</div>
    </div>
  `).join('');
}

// Open a specific chapter
function openChapter(index) {
  currentChapterIndex = index;
  const chapter = CRYPTO_GUIDE.chapters[index];
  
  const chaptersMenu = document.getElementById('chaptersMenu');
  const chapterView = document.getElementById('chapterView');
  const chapterContent = document.getElementById('chapterContent');
  
  // Hide chapters menu, show chapter view
  chaptersMenu.style.display = 'none';
  chapterView.style.display = 'block';
  
  // Render chapter content with markdown-style formatting
  const formattedContent = formatMarkdownContent(chapter.content);
  chapterContent.innerHTML = `
    <div class="chapter-header">
      <div class="chapter-icon-large">${chapter.icon}</div>
      <h1 class="chapter-title-main">Chapter ${chapter.id}</h1>
      <h2 class="chapter-title-sub">${chapter.title}</h2>
    </div>
    <div class="chapter-body" id="guideChapterBody">
      ${formattedContent}
    </div>
  `;
  
  // Apply glossary term linking (if glossary linker is loaded)
  if (window.linkGlossaryTermsInContent) {
    setTimeout(() => {
      const bodyElement = document.getElementById('guideChapterBody');
      if (bodyElement) {
        window.linkGlossaryTermsInContent(bodyElement);
        console.log('✅ Glossary terms linked in guide chapter');
      }
    }, 100);
  }
  
  // Update navigation buttons
  updateChapterNavigation();
  
  // Update progress
  updateProgress();
  
  // Scroll to top
  chapterContent.scrollTop = 0;
}

// Format markdown-style content to HTML
function formatMarkdownContent(content) {
  let html = content
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="content-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="content-h2">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li class="content-li">$1</li>')
    .replace(/^✓ (.+)$/gm, '<li class="content-check">✓ $1</li>')
    .replace(/^❌ (.+)$/gm, '<li class="content-cross">❌ $1</li>')
    .replace(/^⚠️ (.+)$/gm, '<li class="content-warn">⚠️ $1</li>')
    // Paragraphs
    .replace(/^([^<\n#-✓❌⚠️].+)$/gm, '<p class="content-p">$1</p>')
    // Code blocks
    .replace(/`(.+?)`/g, '<code class="content-code">$1</code>')
    // Examples
    .replace(/\*Example\*:/g, '<strong class="content-example">Example:</strong>')
    .replace(/\*Strategy\*:/g, '<strong class="content-strategy">Strategy:</strong>')
    .replace(/\*Pros\*:/g, '<strong class="content-pros">Pros:</strong>')
    .replace(/\*Cons\*:/g, '<strong class="content-cons">Cons:</strong>');
  
  // Wrap consecutive list items in ul
  html = html.replace(/(<li class="content-li">.*?<\/li>\n?)+/gs, match => `<ul class="content-ul">${match}</ul>`);
  html = html.replace(/(<li class="content-check">.*?<\/li>\n?)+/gs, match => `<ul class="content-checklist">${match}</ul>`);
  html = html.replace(/(<li class="content-cross">.*?<\/li>\n?)+/gs, match => `<ul class="content-crosslist">${match}</ul>`);
  html = html.replace(/(<li class="content-warn">.*?<\/li>\n?)+/gs, match => `<ul class="content-warnlist">${match}</ul>`);
  
  return html;
}

// Navigate to next/previous chapter
function navigateChapter(direction) {
  const newIndex = direction === 'next' ? currentChapterIndex + 1 : currentChapterIndex - 1;
  
  if (newIndex >= 0 && newIndex < CRYPTO_GUIDE.chapters.length) {
    openChapter(newIndex);
  } else if (direction === 'next' && newIndex >= CRYPTO_GUIDE.chapters.length) {
    // Finished all chapters - go back to menu
    showChaptersMenu();
  }
}

// Update chapter navigation buttons
function updateChapterNavigation() {
  const prevBtn = document.getElementById('prevChapterBtn');
  const nextBtn = document.getElementById('nextChapterBtn');
  
  if (currentChapterIndex > 0) {
    prevBtn.style.display = 'block';
    prevBtn.textContent = `← Chapter ${currentChapterIndex}`;
  } else {
    prevBtn.style.display = 'none';
  }
  
  if (currentChapterIndex < CRYPTO_GUIDE.chapters.length - 1) {
    nextBtn.textContent = `Chapter ${currentChapterIndex + 2} →`;
  } else {
    nextBtn.textContent = 'Back to Chapters ✓';
  }
}

// Show chapters menu
function showChaptersMenu() {
  const chaptersMenu = document.getElementById('chaptersMenu');
  const chapterView = document.getElementById('chapterView');
  
  chaptersMenu.style.display = 'block';
  chapterView.style.display = 'none';
  currentChapterIndex = -1;
  updateProgress();
}

// Update progress indicator
function updateProgress() {
  const progress = document.getElementById('guideProgress');
  if (!progress) return;
  
  if (currentChapterIndex === -1) {
    progress.textContent = 'Table of Contents';
  } else {
    progress.textContent = `Chapter ${currentChapterIndex + 1} of ${CRYPTO_GUIDE.chapters.length}`;
  }
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGuide);
} else {
  initializeGuide();
}

console.log('✅ Guide Controller loaded');
