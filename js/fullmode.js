/* ═══════════════════════════════════════════════════════════
   VocaPath - Full Mode Module
   Handles Full Mode rendering, search, filters, pagination
   ══════════════════════════════════════════════════════════ */

/* ═══ FULL MODE STATE ═══ */
const FULLMODE_STATE = {
  searchQuery: '',
  currentPage: 1,
  wordsPerPage: 100,
  totalPages: 1,
  filteredWords: [],
  sequentialNumbering: false // false = Oxford order, true = Sequential
};

/* ═══ LOAD PAGE SIZE FROM LOCALSTORAGE ═══ */
function loadPageSize() {
  try {
    const saved = localStorage.getItem('vocapath_pagesize');
    if (saved) {
      const size = parseInt(saved, 10);
      if ([5, 10, 25, 50, 100].includes(size)) {
        FULLMODE_STATE.wordsPerPage = size;
      }
    }
  } catch (error) {
    console.error('Failed to load page size:', error);
  }
}

/* ═══ LOAD NUMBERING MODE FROM LOCALSTORAGE ═══ */
function loadNumberingMode() {
  try {
    const saved = localStorage.getItem('vocapath_numbering_mode');
    if (saved) {
      FULLMODE_STATE.sequentialNumbering = saved === 'sequential';
      const checkbox = document.getElementById('sequentialNumberingFull');
      if (checkbox) {
        checkbox.checked = FULLMODE_STATE.sequentialNumbering;
      }
    }
  } catch (error) {
    console.error('Failed to load numbering mode:', error);
  }
}

/* ═══ TOGGLE NUMBERING MODE ═══ */
function toggleFullModeNumberingMode(isSequential) {
  FULLMODE_STATE.sequentialNumbering = isSequential;
  try {
    localStorage.setItem('vocapath_numbering_mode', isSequential ? 'sequential' : 'oxford');
  } catch (error) {
    console.error('Failed to save numbering mode:', error);
  }
  renderFullModeWordList(); // Re-render with new numbering
}

/* ═══ SAVE FULL MODE SETTINGS (CALLED BY SAVE BUTTON) ═══ */
function saveFullModeSettings() {
  const checkbox = document.getElementById('sequentialNumberingFull');
  if (checkbox) {
    const isSequential = checkbox.checked;
    FULLMODE_STATE.sequentialNumbering = isSequential;
    try {
      localStorage.setItem('vocapath_numbering_mode', isSequential ? 'sequential' : 'oxford');
      renderFullModeWordList(); // Re-render with new numbering
      
      // Show success toast
      if (window.showToast) {
        window.showToast('Settings saved successfully!', 2000);
      }
      
      // Close filter panel
      toggleFullModeFilter();
    } catch (error) {
      console.error('Failed to save settings:', error);
      if (window.showToast) {
        window.showToast('Failed to save settings. Please try again.', 3000);
      }
    }
  }
}

/* ═══ SAVE PAGE SIZE TO LOCALSTORAGE ═══ */
function savePageSize(size) {
  try {
    localStorage.setItem('vocapath_pagesize', size.toString());
  } catch (error) {
    console.error('Failed to save page size:', error);
  }
}

/* ═══ APPLY FULL MODE FILTERS ═══ */
function applyFullModeFilters() {
  if (!window.WORDS || !window.WORDS.length) return;

  const query = FULLMODE_STATE.searchQuery.toLowerCase().trim();
  
  // Filter words based on state and search
  FULLMODE_STATE.filteredWords = window.WORDS.filter(word => {
    // Check CEFR level
    if (!window.STATE.levels[word.level]) return false;
    
    // Check word type
    const typeKey = (type) => {
      const v = type.toLowerCase();
      if (v.includes('noun')) return 'noun';
      if (v.includes('verb')) return 'verb';
      if (v.includes('adj')) return 'adjective';
      if (v.includes('adv')) return 'adverb';
      if (v.includes('prep')) return 'preposition';
      if (v.includes('conj')) return 'conjunction';
      return 'other';
    };
    if (!window.STATE.types[typeKey(word.type)]) return false;
    
    // Check alphabet filter
    const firstLetter = word.word.charAt(0).toUpperCase();
    if (!window.STATE.alphabet.includes(firstLetter)) return false;
    
    // Check search query (English + Arabic)
    if (query) {
      const matchesEnglish = word.word.toLowerCase().includes(query);
      const matchesArabic = word.arabic.includes(query);
      if (!matchesEnglish && !matchesArabic) return false;
    }
    
    return true;
  });

  // Reset to page 1 when filters change
  FULLMODE_STATE.currentPage = 1;
  
  // Calculate total pages
  FULLMODE_STATE.totalPages = Math.ceil(FULLMODE_STATE.filteredWords.length / FULLMODE_STATE.wordsPerPage);
  
  // Render
  renderFullModeWordList();
  updateFullModeInfo();
}

/* ═══ RENDER FULL MODE WORD LIST ═══ */
function renderFullModeWordList() {
  const wordList = document.getElementById('wordList');
  if (!wordList) return;

  const filtered = FULLMODE_STATE.filteredWords;
  
  if (filtered.length === 0) {
    wordList.innerHTML = `
      <div class="empty-state">
        <div class="big">🔍</div>
        <h3>No words found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>
    `;
    return;
  }

  // Calculate pagination
  const startIndex = (FULLMODE_STATE.currentPage - 1) * FULLMODE_STATE.wordsPerPage;
  const endIndex = startIndex + FULLMODE_STATE.wordsPerPage;
  const wordsToRender = filtered.slice(startIndex, endIndex);
  
  // Calculate global word number (absolute index in full dataset)
  const globalStartIndex = window.WORDS.indexOf(filtered[startIndex]);

  wordList.innerHTML = wordsToRender.map((word, i) => {
    const globalIndex = window.WORDS.indexOf(word);
    
    // Calculate word number based on numbering mode
    let wordNumber;
    if (FULLMODE_STATE.sequentialNumbering) {
      // Sequential: based on filtered list position
      wordNumber = startIndex + i + 1;
    } else {
      // Oxford: original position in full WORDS array
      wordNumber = globalIndex + 1;
    }
    
    const parts = word.arabic.split('|').map(s => s.trim());
    const main = parts[0];
    const extra = parts.slice(1).join(' | ');
    const delay = (Math.min(i, 30) * 0.025).toFixed(3);
    const wSafe = word.word.replace(/'/g, "\\'");
    const wordId = window.getWordId ? window.getWordId(word) : '';
    const hasProgressClass = window.hasProgress && window.hasProgress(word) ? 'has-progress' : '';
    
    // Highlight search matches
    let displayWord = word.word;
    const query = FULLMODE_STATE.searchQuery.trim();
    if (query) {
      const regex = new RegExp(`(${query})`, 'gi');
      displayWord = word.word.replace(regex, '<span class="highlight">$1</span>');
    }
    
    return `
    <div class="word-row ${hasProgressClass}" style="animation-delay:${delay}s" data-word-id="${wordId}" data-word='${JSON.stringify(word).replace(/'/g, "&#39;")}' onclick="handleFullModeRowClick(this)">
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
                onclick="event.stopPropagation(); handleAudioClick(this)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </button>
        <button class="icon-btn info" title="Show details"
                onclick="event.stopPropagation(); handleInfoClick(this)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </button>
        <button class="icon-btn unlearn ${hasProgressClass ? 'active' : 'disabled'}" 
                title="${hasProgressClass ? 'Reset progress for this word' : 'No progress yet'}"
                onclick="event.stopPropagation(); handleFullModeUnlearnClick(this)"
                ${hasProgressClass ? '' : 'disabled'}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
  
  // Render pagination at bottom
  renderFullModeBottomInfo();
}

/* ═══ RENDER FULL MODE PAGINATION ═══ */
function renderFullModePagination() {
  const { currentPage, totalPages } = FULLMODE_STATE;
  let html = '<div class="pagination">';
  
  // Previous button
  html += `
    <button class="page-btn" onclick="goToFullModePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
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
    html += `<button class="page-btn" onclick="goToFullModePage(1)">1</button>`;
    if (startPage > 2) {
      html += `<span style="padding: 0 8px; color: var(--text3);">...</span>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    html += `
      <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToFullModePage(${i})">
        ${i}
      </button>
    `;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<span style="padding: 0 8px; color: var(--text3);">...</span>`;
    }
    html += `<button class="page-btn" onclick="goToFullModePage(${totalPages})">${totalPages}</button>`;
  }
  
  // Go to page input
  html += `
    <div class="go-to-page">
      <input type="number" id="gotoPageInputFull" min="1" max="${totalPages}" placeholder="Go to" 
             onkeypress="if(event.key==='Enter') goToFullModePageInput()" />
      <button class="page-btn" onclick="goToFullModePageInput()">Go</button>
    </div>
  `;
  
  // Next button
  html += `
    <button class="page-btn" onclick="goToFullModePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  `;
  
  html += '</div>';
  return html;
}

/* ═══ GO TO PAGE ═══ */
function goToFullModePage(page) {
  if (page < 1 || page > FULLMODE_STATE.totalPages) return;
  FULLMODE_STATE.currentPage = page;
  renderFullModeWordList();
  updateFullModeInfo();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══ GO TO PAGE INPUT ═══ */
function goToFullModePageInput() {
  const input = document.getElementById('gotoPageInputFull');
  if (!input) return;
  
  const page = parseInt(input.value, 10);
  
  if (isNaN(page) || page < 1 || page > FULLMODE_STATE.totalPages) {
    if (window.showToast) {
      window.showToast(`Please enter a valid page number between 1 and ${FULLMODE_STATE.totalPages}`, 3000);
    } else {
      alert(`Please enter a valid page number between 1 and ${FULLMODE_STATE.totalPages}`);
    }
    input.value = '';
    return;
  }
  
  goToFullModePage(page);
  input.value = '';
}

/* ═══ CHANGE PAGE SIZE ═══ */
function changePageSize(size) {
  FULLMODE_STATE.wordsPerPage = parseInt(size, 10);
  FULLMODE_STATE.currentPage = 1;
  savePageSize(FULLMODE_STATE.wordsPerPage);
  applyFullModeFilters();
}

/* ═══ UPDATE FULL MODE INFO (LEGACY - kept for compatibility) ═══ */
function updateFullModeInfo() {
  // This function is kept for backwards compatibility but now delegates to renderFullModeBottomInfo
  renderFullModeBottomInfo();
}

/* ═══ RENDER BOTTOM INFO AND PAGINATION ═══ */
function renderFullModeBottomInfo() {
  const bottomInfoEl = document.querySelector('#fullModeInfoBottom .results-info');
  const paginationEl = document.getElementById('fullModePagination');
  
  if (bottomInfoEl) {
    const { filteredWords, currentPage, totalPages, wordsPerPage } = FULLMODE_STATE;
    const startIndex = (currentPage - 1) * wordsPerPage + 1;
    const endIndex = Math.min(currentPage * wordsPerPage, filteredWords.length);
    const totalWords = window.WORDS ? window.WORDS.length : 0;
    
    bottomInfoEl.innerHTML = `
      <select id="pageSizeSelector" class="page-size-selector" onchange="changePageSize(this.value)">
        <option value="5" ${wordsPerPage === 5 ? 'selected' : ''}>5 per page</option>
        <option value="10" ${wordsPerPage === 10 ? 'selected' : ''}>10 per page</option>
        <option value="25" ${wordsPerPage === 25 ? 'selected' : ''}>25 per page</option>
        <option value="50" ${wordsPerPage === 50 ? 'selected' : ''}>50 per page</option>
        <option value="100" ${wordsPerPage === 100 ? 'selected' : ''}>100 per page</option>
      </select>
      <span class="info-divider">|</span>
      Showing <strong>${startIndex}-${endIndex}</strong> of <strong>${filteredWords.length}</strong> words
      ${totalPages > 1 ? ` (Page <strong>${currentPage}</strong> of <strong>${totalPages}</strong>)` : ''}
      <span class="info-divider">|</span>
      Total database: <strong>${totalWords}</strong> words
    `;
  }
  
  if (paginationEl) {
    if (FULLMODE_STATE.totalPages > 1) {
      paginationEl.innerHTML = renderFullModePagination();
    } else {
      paginationEl.innerHTML = '';
    }
  }
}

/* ═══ HANDLE SEARCH INPUT ═══ */
function handleFullModeSearch(input) {
  FULLMODE_STATE.searchQuery = input.value;
  applyFullModeFilters();
}

/* ═══ HANDLE ROW CLICK - INLINE MEANING REVEAL ═══ */
function handleFullModeRowClick(row) {
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

/* ═══ HANDLE AUDIO CLICK WITH PROGRESS TRACKING ═══ */
function handleAudioClick(btn) {
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

/* ═══ HANDLE INFO CLICK WITH PROGRESS TRACKING ═══ */
function handleInfoClick(btn) {
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

/* ═══ HANDLE UNLEARN BUTTON CLICK (FULL MODE) ═══ */
function handleFullModeUnlearnClick(btn) {
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

/* ═══ INITIALIZE FULL MODE ═══ */
function initFullMode() {
  loadPageSize();
  loadNumberingMode();
  
  // Set up page size selector
  const pageSizeSelector = document.getElementById('pageSizeSelector');
  if (pageSizeSelector) {
    pageSizeSelector.value = FULLMODE_STATE.wordsPerPage;
  }
  
  // Initial render
  applyFullModeFilters();
}

/* ═══ EXPORT FUNCTIONS TO GLOBAL SCOPE ═══ */
window.initFullMode = initFullMode;
window.applyFullModeFilters = applyFullModeFilters;
window.renderFullModeWordList = renderFullModeWordList;
window.goToFullModePage = goToFullModePage;
window.goToFullModePageInput = goToFullModePageInput;
window.changePageSize = changePageSize;
window.handleFullModeSearch = handleFullModeSearch;
window.handleFullModeRowClick = handleFullModeRowClick;
window.handleAudioClick = handleAudioClick;
window.handleInfoClick = handleInfoClick;
window.toggleFullModeNumberingMode = toggleFullModeNumberingMode;
window.saveFullModeSettings = saveFullModeSettings;
window.FULLMODE_STATE = FULLMODE_STATE;
