/* ═══════════════════════════════════════════════════════════
   VocaPath - Filters Module
   Handles CEFR level filters, word type filters, and search
   ══════════════════════════════════════════════════════════ */

/* ═══ PAGINATION STATE ═══ */
let PAGINATION = {
  currentPage: 1,
  wordsPerPage: 10, // Fixed at 10 for Home page
  totalPages: 1
};

/* ═══ NUMBERING MODE STATE ═══ */
let NUMBERING_MODE = {
  sequential: false // false = Oxford order, true = Sequential (1,2,3...)
};

/* ═══ FILTER INITIALIZATION ═══ */
function initFilters() {
  renderChips();
  loadNumberingMode();
}

/* ═══ NUMBERING MODE MANAGEMENT ═══ */
function loadNumberingMode() {
  try {
    const saved = localStorage.getItem('vocapath_numbering_mode');
    if (saved) {
      NUMBERING_MODE.sequential = saved === 'sequential';
      const checkbox = document.getElementById('sequentialNumbering');
      if (checkbox) {
        checkbox.checked = NUMBERING_MODE.sequential;
      }
    }
  } catch (error) {
    console.error('Failed to load numbering mode:', error);
  }
}

function toggleNumberingMode(isSequential) {
  NUMBERING_MODE.sequential = isSequential;
  try {
    localStorage.setItem('vocapath_numbering_mode', isSequential ? 'sequential' : 'oxford');
  } catch (error) {
    console.error('Failed to save numbering mode:', error);
  }
  applyFilters(); // Re-render with new numbering
}

/* ═══ SAVE SETTINGS (CALLED BY SAVE BUTTON) ═══ */
function saveSettings() {
  const checkbox = document.getElementById('sequentialNumbering');
  if (checkbox) {
    const isSequential = checkbox.checked;
    NUMBERING_MODE.sequential = isSequential;
    try {
      localStorage.setItem('vocapath_numbering_mode', isSequential ? 'sequential' : 'oxford');
      applyFilters(); // Re-render with new numbering
      
      // Show success toast
      if (window.showToast) {
        window.showToast('Settings saved successfully!', 2000);
      }
      
      // Close filter panel
      toggleFilter();
    } catch (error) {
      console.error('Failed to save settings:', error);
      if (window.showToast) {
        window.showToast('Failed to save settings. Please try again.', 3000);
      }
    }
  }
}

/* ═══ TYPE NORMALIZER ═══ */
function typeKey(type) {
  const v = type.toLowerCase();
  if (v.includes('noun')) return 'noun';
  if (v.includes('verb')) return 'verb';
  if (v.includes('adj')) return 'adjective';
  if (v.includes('adv')) return 'adverb';
  if (v.includes('prep')) return 'preposition';
  if (v.includes('conj')) return 'conjunction';
  return 'other';
}

/* ═══ CHIP RENDERING ═══ */
function renderChips() {
  // Render level chips
  document.querySelectorAll('[data-level]').forEach(el => {
    const level = el.dataset.level;
    const on = STATE.levels[level];
    el.classList.toggle('off', !on);
    const checkmark = el.querySelector('.ck');
    if (checkmark) {
      checkmark.textContent = on ? '✓' : '✕';
    }
  });
  
  // Render type chips
  document.querySelectorAll('[data-type]').forEach(el => {
    const type = el.dataset.type;
    const on = STATE.types[type];
    el.classList.toggle('off', !on);
    const checkmark = el.querySelector('.ck');
    if (checkmark) {
      checkmark.textContent = on ? '✓' : '✕';
    }
  });
  
  // Update filter indicator dot
  const allOn = Object.values(STATE.levels).every(Boolean) && 
                Object.values(STATE.types).every(Boolean) &&
                STATE.alphabet.length === 26;
  const filterDot = document.getElementById('filterDot');
  if (filterDot) {
    filterDot.classList.toggle('show', !allOn);
  }
}

/* ═══ CHIP TOGGLE ═══ */
function toggleChip(el, kind) {
  if (kind === 'level') {
    const level = el.dataset.level;
    STATE.levels[level] = !STATE.levels[level];
  } else if (kind === 'type') {
    const type = el.dataset.type;
    STATE.types[type] = !STATE.types[type];
  }
  saveState();
  renderChips();
  applyFilters();
}

/* ═══ BULK CHIP CONTROLS ═══ */
function allLevels(value) {
  Object.keys(STATE.levels).forEach(k => STATE.levels[k] = value);
  saveState();
  renderChips();
  applyFilters();
}

function allTypes(value) {
  Object.keys(STATE.types).forEach(k => STATE.types[k] = value);
  saveState();
  renderChips();
  applyFilters();
}

function resetAll() {
  STATE.levels = { A1: true, A2: true, B1: true, B2: true, C1: true };
  STATE.types = { noun: true, verb: true, adjective: true, adverb: true, preposition: true, conjunction: true, other: true };
  STATE.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  saveState();
  renderChips();
  renderAlphabetChips();
  applyFilters();
}

/* ═══ FILTER PANEL TOGGLE ═══ */
function toggleFilter() {
  const panel = document.getElementById('filterPanel');
  const btn = document.getElementById('filterBtn');
  if (panel) panel.classList.toggle('open');
  if (btn) btn.classList.toggle('open');
}

/* ═══ APPLY FILTERS & RENDER WORD LIST ═══ */
function applyFilters() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const wordList = document.getElementById('wordList');
  
  const WORDS = window.WORDS || [];
  if (!wordList || !WORDS.length) return;
  
  // Filter words
  const filtered = WORDS.filter(word => {
    // Check CEFR level
    if (!STATE.levels[word.level]) return false;
    
    // Check word type
    if (!STATE.types[typeKey(word.type)]) return false;
    
    // Check alphabet filter
    const firstLetter = word.word.charAt(0).toUpperCase();
    if (!STATE.alphabet.includes(firstLetter)) return false;
    
    // Check search query
    if (query) {
      const matchesEnglish = word.word.toLowerCase().includes(query);
      const matchesArabic = word.arabic.includes(query);
      if (!matchesEnglish && !matchesArabic) return false;
    }
    
    return true;
  });
  
  // Update results info
  const resultsInfo = document.getElementById('resultsInfo');
  if (resultsInfo) {
    resultsInfo.innerHTML = `Showing <strong>${filtered.length}</strong> of ${WORDS.length} words`;
  }
  
  // Render word list
  if (filtered.length === 0) {
    wordList.innerHTML = `
      <div class="empty-state">
        <div class="big">🔍</div>
        <h3>No words found</h3>
        <p>Try a different search term or adjust the filters.</p>
      </div>`;
    return;
  }
  
  // Calculate pagination
  const wordsPerPage = PAGINATION.wordsPerPage;
  const totalPages = Math.ceil(filtered.length / wordsPerPage);
  PAGINATION.totalPages = totalPages;
  
  // Ensure current page is valid
  if (PAGINATION.currentPage > totalPages) {
    PAGINATION.currentPage = 1;
  }
  
  // Get words for current page
  const startIndex = (PAGINATION.currentPage - 1) * wordsPerPage;
  const endIndex = startIndex + wordsPerPage;
  const wordsToRender = filtered.slice(startIndex, endIndex);
  
  wordList.innerHTML = wordsToRender.map((word, i) => {
    const globalIndex = WORDS.indexOf(word);
    // Use numbering mode: Oxford (original index) or Sequential (filtered index)
    const wordNumber = NUMBERING_MODE.sequential 
      ? (PAGINATION.currentPage - 1) * PAGINATION.wordsPerPage + i + 1 
      : globalIndex + 1;
    const parts = word.arabic.split('|').map(s => s.trim());
    const main = parts[0];
    const extra = parts.slice(1).join(' | ');
    const delay = (Math.min(i, 30) * 0.025).toFixed(3);
    const wSafe = word.word.replace(/'/g, "\\'");
    const wordId = window.getWordId ? window.getWordId(word) : '';
    const hasProgressClass = window.hasProgress && window.hasProgress(word) ? 'has-progress' : '';
    
    // Highlight search matches
    let displayWord = word.word;
    if (query) {
      const regex = new RegExp(`(${query})`, 'gi');
      displayWord = word.word.replace(regex, '<span class="highlight">$1</span>');
    }
    
    return `
    <div class="word-row ${hasProgressClass}" style="animation-delay:${delay}s" data-word-id="${wordId}" data-word='${JSON.stringify(word).replace(/'/g, "&#39;")}' onclick="handleRowClick(this)">
      <div class="word-number">#${String(wordNumber).padStart(3, '0')}</div>
      <div class="col-english">
        <div class="word-en">
          <span>${displayWord}</span>
          <span class="type-badge">${word.type}</span>
        </div>
        <div class="inline-meaning" style="display: none;">
          <div class="inline-def">${word.def}</div>
          ${word.example ? `
            <div class="inline-example-en">${word.example}</div>
            ${word.exampleAr ? `<div class="inline-example-ar">${word.exampleAr}</div>` : ''}
          ` : ''}
        </div>
      </div>
      <div class="col-arabic">
        <div class="ar-main">${main}</div>
        ${extra ? `<div class="ar-extra">${extra}</div>` : ''}
      </div>
      <div class="col-level"><span class="badge ${word.level}">${word.level}</span></div>
      <div class="col-actions">
        <button class="icon-btn snd" title="Listen to pronunciation"
                onclick="event.stopPropagation(); handleMainAudioClick(this)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </button>
        <button class="icon-btn info" title="Show details"
                onclick="event.stopPropagation(); handleMainInfoClick(this)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </button>
        <button class="icon-btn unlearn ${hasProgressClass ? 'active' : 'disabled'}" 
                title="${hasProgressClass ? 'Reset progress for this word' : 'No progress yet'}"
                onclick="event.stopPropagation(); handleUnlearnClick(this)"
                ${hasProgressClass ? '' : 'disabled'}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
  
  // Add pagination controls
  if (totalPages > 1) {
    wordList.innerHTML += renderPagination(totalPages, PAGINATION.currentPage);
  }
}

/* ═══ PAGINATION RENDERING ═══ */
function renderPagination(totalPages, currentPage) {
  let paginationHTML = '<div class="pagination">';
  
  // Previous button
  paginationHTML += `
    <button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
  `;
  
  // Page numbers
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  if (startPage > 1) {
    paginationHTML += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
    if (startPage > 2) {
      paginationHTML += `<span style="padding: 0 8px; color: var(--text3);">...</span>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
        ${i}
      </button>
    `;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span style="padding: 0 8px; color: var(--text3);">...</span>`;
    }
    paginationHTML += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
  }
  
  // Go to page input
  paginationHTML += `
    <div class="go-to-page">
      <input type="number" id="gotoPageInput" min="1" max="${totalPages}" placeholder="Go to" 
             onkeypress="if(event.key==='Enter') goToPageInput()" />
      <button class="page-btn" onclick="goToPageInput()">Go</button>
    </div>
  `;
  
  // Next button
  paginationHTML += `
    <button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  `;
  
  paginationHTML += '</div>';
  return paginationHTML;
}

/* ═══ PAGE NAVIGATION ═══ */
function goToPage(page) {
  if (page < 1 || page > PAGINATION.totalPages) return;
  PAGINATION.currentPage = page;
  applyFilters();
  
  // Scroll to top of word list
  const wordList = document.getElementById('wordList');
  if (wordList) {
    wordList.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ═══ GO TO PAGE INPUT ═══ */
function goToPageInput() {
  const input = document.getElementById('gotoPageInput');
  if (!input) return;
  
  const page = parseInt(input.value, 10);
  
  if (isNaN(page) || page < 1 || page > PAGINATION.totalPages) {
    window.showToast(`Please enter a valid page number between 1 and ${PAGINATION.totalPages}`, 3000);
    input.value = '';
    return;
  }
  
  goToPage(page);
  input.value = '';
}


/* ═══ ROW INTERACTION ═══ */
function toggleRow(row) {
  row.classList.toggle('open');
  const infoBtn = row.querySelector('.icon-btn.info');
  if (infoBtn) {
    infoBtn.classList.toggle('on', row.classList.contains('open'));
  }
}

function expandRow(btn) {
  const row = btn.closest('.word-row');
  if (row) toggleRow(row);
}

/* ═══ ROW CLICK HANDLER - INLINE MEANING REVEAL ═══ */
function handleRowClick(row) {
  try {
    const wordData = JSON.parse(row.dataset.word.replace(/&#39;/g, "'"));
    const meaningEl = row.querySelector('.inline-meaning');
    
    if (!meaningEl) return;
    
    // Toggle inline meaning
    const isVisible = meaningEl.style.display !== 'none';
    meaningEl.style.display = isVisible ? 'none' : 'block';
    
    // Track progress on reveal (first time only)
    if (!isVisible && window.markMeaningRevealed) {
      window.markMeaningRevealed(wordData);
    }
  } catch (error) {
    console.error('Failed to toggle meaning:', error);
  }
}

/* ═══ MAIN PAGE INTERACTION HANDLERS WITH PROGRESS TRACKING ═══ */
function handleMainAudioClick(btn) {
  const row = btn.closest('.word-row');
  if (!row) return;
  
  try {
    const wordData = JSON.parse(row.dataset.word.replace(/&#39;/g, "'"));
    const wordText = wordData.word;
    
    // Track progress
    if (window.markAudioPlayed) {
      window.markAudioPlayed(wordData);
    }
    
    // Play audio
    if (window.playWord) {
      window.playWord(wordText, btn);
    }
  } catch (error) {
    console.error('Failed to play audio:', error);
  }
}

function handleMainInfoClick(btn) {
  const row = btn.closest('.word-row');
  if (!row) return;
  
  try {
    const wordData = JSON.parse(row.dataset.word.replace(/&#39;/g, "'"));
    
    // Track progress
    if (window.markInfoViewed) {
      window.markInfoViewed(wordData);
    }
    
    // Open detail modal
    if (window.openWordDetailModal) {
      window.openWordDetailModal(wordData);
    }
  } catch (error) {
    console.error('Failed to show info:', error);
  }
}

/* ═══ HANDLE UNLEARN BUTTON CLICK ═══ */
function handleUnlearnClick(btn) {
  const row = btn.closest('.word-row');
  if (!row) return;
  
  // Only allow unlearning if word has progress
  if (!row.classList.contains('has-progress')) {
    return;
  }
  
  try {
    const wordData = JSON.parse(row.dataset.word.replace(/&#39;/g, "'"));
    
    // Unlearn the word
    if (window.ProgressStore && window.ProgressStore.unlearnWord) {
      window.ProgressStore.unlearnWord(wordData);
      showToast('Progress reset for this word', 1500);
    }
  } catch (error) {
    console.error('Failed to unlearn word:', error);
  }
}

/* ═══ EXPORT FUNCTIONS TO GLOBAL SCOPE ═══ */
window.initFilters = initFilters;
window.toggleChip = toggleChip;
window.allLevels = allLevels;
window.allTypes = allTypes;
window.resetAll = resetAll;
window.toggleFilter = toggleFilter;
window.applyFilters = applyFilters;
window.toggleRow = toggleRow;
window.handleUnlearnClick = handleUnlearnClick;
window.expandRow = expandRow;
window.typeKey = typeKey;
window.renderChips = renderChips;
window.goToPage = goToPage;
window.goToPageInput = goToPageInput;
window.renderPagination = renderPagination;
window.handleRowClick = handleRowClick;
window.handleMainAudioClick = handleMainAudioClick;
window.handleMainInfoClick = handleMainInfoClick;
window.toggleNumberingMode = toggleNumberingMode;
window.saveSettings = saveSettings;
window.PAGINATION = PAGINATION;
window.NUMBERING_MODE = NUMBERING_MODE;
window.NUMBERING_MODE = NUMBERING_MODE;
