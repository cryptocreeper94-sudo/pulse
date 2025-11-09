// ─────────────────────────────────────────────
// 🔧 Glossary Engine - Search, Filter, Fetch
// ─────────────────────────────────────────────

import { glossary, categories, emotionTags } from './glossaryData.js';

// Get single glossary term with sass mode toggle
export function getGlossaryTerm(term, sassMode = true) {
  const entry = glossary[term];
  if (!entry) return null;
  
  return {
    term,
    definition: sassMode ? entry.smartass : entry.plain,
    category: entry.category,
    pose: sassMode ? entry.pose : 'neutral',
    emotionTag: entry.emotionTag || 'neutral',
    // Include both definitions for toggle
    smartass: entry.smartass,
    plain: entry.plain
  };
}

// Get all terms as array (for rendering)
export function getAllTerms(sassMode = true) {
  return Object.keys(glossary).sort().map(term => getGlossaryTerm(term, sassMode));
}

// Filter glossary by category
export function filterGlossaryByCategory(category, sassMode = true) {
  if (category === 'All') {
    return getAllTerms(sassMode);
  }
  
  return Object.entries(glossary)
    .filter(([_, entry]) => entry.category === category)
    .sort(([termA], [termB]) => termA.localeCompare(termB))
    .map(([term, entry]) => ({
      term,
      definition: sassMode ? entry.smartass : entry.plain,
      category: entry.category,
      pose: sassMode ? entry.pose : 'neutral',
      emotionTag: entry.emotionTag || 'neutral',
      smartass: entry.smartass,
      plain: entry.plain
    }));
}

// Search glossary by keyword (searches term, smartass, and plain)
export function searchGlossary(keyword, sassMode = true) {
  if (!keyword || keyword.trim() === '') {
    return getAllTerms(sassMode);
  }
  
  const lower = keyword.toLowerCase().trim();
  
  return Object.entries(glossary)
    .filter(([term, entry]) =>
      term.toLowerCase().includes(lower) ||
      entry.smartass.toLowerCase().includes(lower) ||
      entry.plain.toLowerCase().includes(lower)
    )
    .sort(([termA], [termB]) => termA.localeCompare(termB))
    .map(([term, entry]) => ({
      term,
      definition: sassMode ? entry.smartass : entry.plain,
      category: entry.category,
      pose: sassMode ? entry.pose : 'neutral',
      emotionTag: entry.emotionTag || 'neutral',
      smartass: entry.smartass,
      plain: entry.plain,
      // Highlight matching text for search results
      matchedIn: term.toLowerCase().includes(lower) ? 'term' : 'definition'
    }));
}

// Filter by emotion tag
export function filterByEmotion(emotionTag, sassMode = true) {
  return Object.entries(glossary)
    .filter(([_, entry]) => entry.emotionTag === emotionTag)
    .sort(([termA], [termB]) => termA.localeCompare(termB))
    .map(([term, entry]) => ({
      term,
      definition: sassMode ? entry.smartass : entry.plain,
      category: entry.category,
      pose: sassMode ? entry.pose : 'neutral',
      emotionTag: entry.emotionTag || 'neutral',
      smartass: entry.smartass,
      plain: entry.plain
    }));
}

// Get random term (for "Term of the Day")
export function getRandomTerm(sassMode = true) {
  const terms = Object.keys(glossary);
  const randomTerm = terms[Math.floor(Math.random() * terms.length)];
  return getGlossaryTerm(randomTerm, sassMode);
}

// Get related terms based on category or emotion
export function getRelatedTerms(term, limit = 5, sassMode = true) {
  const entry = glossary[term];
  if (!entry) return [];
  
  // Find terms in same category or with same emotion tag
  const related = Object.entries(glossary)
    .filter(([t, e]) => 
      t !== term && 
      (e.category === entry.category || e.emotionTag === entry.emotionTag)
    )
    .slice(0, limit)
    .map(([t]) => getGlossaryTerm(t, sassMode));
  
  return related;
}

// Get categories with counts
export function getCategoryCounts() {
  const counts = {};
  Object.values(glossary).forEach(entry => {
    counts[entry.category] = (counts[entry.category] || 0) + 1;
  });
  return counts;
}

// Track recently viewed terms (localStorage)
export function trackRecentTerm(term) {
  try {
    const recent = JSON.parse(localStorage.getItem('recentGlossary') || '[]');
    
    // Remove if already exists
    const filtered = recent.filter(t => t !== term);
    
    // Add to front
    filtered.unshift(term);
    
    // Keep only last 10
    const updated = filtered.slice(0, 10);
    
    localStorage.setItem('recentGlossary', JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not track recent term:', e);
  }
}

// Get recently viewed terms
export function getRecentTerms(sassMode = true) {
  try {
    const recent = JSON.parse(localStorage.getItem('recentGlossary') || '[]');
    return recent
      .map(term => getGlossaryTerm(term, sassMode))
      .filter(Boolean); // Remove any null entries
  } catch (e) {
    return [];
  }
}

// Export all functions and data
export {
  categories,
  emotionTags,
  glossary
};
