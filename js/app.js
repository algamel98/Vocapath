/* ═══════════════════════════════════════════════════════════
   VocaPath - Main Application Controller
   ══════════════════════════════════════════════════════════ */

// Global state
let WORDS = [];
let STATE = {
  levels: { A1: true, A2: true, B1: true, B2: true, C1: true },
  types: { noun: true, verb: true, adjective: true, adverb: true, preposition: true, conjunction: true, other: true },
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  learnedWords: []
};

// Export to window for cross-module access
window.STATE = STATE;

/* ═══ INITIALIZATION ═══ */
async function init() {
  // Load vocabulary data
  await loadWords();
  
  // Load saved state from localStorage
  loadState();
  
  // Initialize progress tracking
  if (window.initProgress) {
    window.initProgress();
  }
  
  // Force progress UI update after words are loaded
  if (window.updateProgressUI) {
    window.updateProgressUI();
  }
  
  // Initialize dark mode
  initDarkMode();
  
  // Initialize UI components
  initFilters();
  initAlphabetModal();
  initMobileNav();
  
  // Render initial word list
  applyFilters();
  
  // Update progress (legacy - now handled by progress.js)
  updateProgress();
}

/* ═══ DATA LOADING ═══ */
async function loadWords() {
  try {
    // Compute base path relative to the HTML document location
    const basePath = getBasePath();
    const response = await fetch(`${basePath}data/words.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    WORDS = await response.json();
    
    if (!WORDS || !Array.isArray(WORDS)) {
      throw new Error('Invalid data format');
    }
    
    // Export to window for progress tracking
    window.WORDS = WORDS;
  } catch (error) {
    console.error('Failed to load vocabulary data:', error);
    showToast('Failed to load vocabulary data. Please refresh the page.');
    
    // Show error state in word list
    const wordList = document.getElementById('wordList');
    if (wordList) {
      wordList.innerHTML = `
        <div class="empty-state">
          <div class="big">⚠️</div>
          <h3>Failed to load vocabulary</h3>
          <p>${error.message}</p>
          <button class="btn-hero primary" onclick="location.reload()" style="margin-top: 16px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Retry
          </button>
        </div>
      `;
    }
  }
}

/* ═══ BASE PATH RESOLUTION ═══ */
function getBasePath() {
  // Get the directory of the current HTML page
  const currentPath = window.location.pathname;
  const directory = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  
  // Return the base path (works for root and subdirectories)
  return directory;
}

/* ═══ STATE MANAGEMENT ═══ */
function loadState() {
  try {
    const saved = localStorage.getItem('vocapath_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      STATE = { ...STATE, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
}

function saveState() {
  try {
    localStorage.setItem('vocapath_state', JSON.stringify(STATE));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

/* ═══ DARK MODE ═══ */
function initDarkMode() {
  const savedTheme = localStorage.getItem('vocapath_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('vocapath_theme', isDark ? 'dark' : 'light');
}

/* ═══ MOBILE NAVIGATION ═══ */
function initMobileNav() {
  document.addEventListener('click', (e) => {
    const nav = document.getElementById('mainNav');
    const ham = document.getElementById('ham');
    if (nav && ham && !nav.contains(e.target) && !ham.contains(e.target)) {
      nav.classList.remove('open');
    }
  });
}

function toggleMenu() {
  document.getElementById('mainNav')?.classList.toggle('open');
}

/* ═══ PROGRESS TRACKING ═══ */
function updateProgress() {
  // Delegate to new progress system
  if (window.updateProgressUI) {
    window.updateProgressUI();
  }
}

function markWordAsLearned(word) {
  if (!STATE.learnedWords.includes(word)) {
    STATE.learnedWords.push(word);
    saveState();
    updateProgress();
  }
}

/* ═══ TOAST NOTIFICATIONS ═══ */
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
}

/* ═══ SCROLL CONTROLS ═══ */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// Show/hide scroll buttons based on scroll position
function updateScrollButtons() {
  const scrollUpBtn = document.querySelector('.scroll-up');
  const scrollDownBtn = document.querySelector('.scroll-down');
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.body.scrollHeight;
  
  if (scrollUpBtn) {
    if (scrollPosition > 300) {
      scrollUpBtn.classList.add('visible');
    } else {
      scrollUpBtn.classList.remove('visible');
    }
  }
  
  if (scrollDownBtn) {
    if (scrollPosition < documentHeight - windowHeight - 300) {
      scrollDownBtn.classList.add('visible');
    } else {
      scrollDownBtn.classList.remove('visible');
    }
  }
}

// Scroll functions for filter panel
function scrollFilterUp() {
  const filterPanel = document.getElementById('filterPanel');
  if (filterPanel) {
    filterPanel.scrollBy({ top: -200, behavior: 'smooth' });
  }
}

function scrollFilterDown() {
  const filterPanel = document.getElementById('filterPanel');
  if (filterPanel) {
    filterPanel.scrollBy({ top: 200, behavior: 'smooth' });
  }
}

// Listen for scroll events
window.addEventListener('scroll', updateScrollButtons);
window.addEventListener('resize', updateScrollButtons);

/* ═══ CLICK OUTSIDE TO CLOSE PANELS ═══ */
document.addEventListener('click', function(event) {
  // Close filter panel if clicking outside
  const filterPanel = document.getElementById('filterPanel');
  const filterBtn = document.getElementById('filterBtn');
  if (filterPanel && filterPanel.classList.contains('open')) {
    if (!filterPanel.contains(event.target) && !filterBtn.contains(event.target)) {
      toggleFilter();
    }
  }
  
  // Close alphabet modal if clicking outside
  const alphabetModal = document.getElementById('alphabetModal');
  if (alphabetModal && alphabetModal.classList.contains('show')) {
    const modalContent = alphabetModal.querySelector('.modal');
    if (modalContent && !modalContent.contains(event.target)) {
      if (typeof closeAlphabetModal === 'function') {
        closeAlphabetModal();
      }
    }
  }
});

/* ═══ HERO BUTTONS ═══ */
function startLearning() {
  const toolbar = document.querySelector('.toolbar');
  if (toolbar) {
    // Scroll to toolbar section (search box, filters, etc.)
    toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function viewProgress() {
  const progressSection = document.querySelector('.progress-section');
  if (progressSection) {
    // Scroll to progress section exactly
    progressSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Add a brief highlight effect
    progressSection.style.boxShadow = '0 0 0 4px rgba(31, 78, 121, 0.3)';
    setTimeout(() => {
      progressSection.style.boxShadow = '';
    }, 1500);
  }
}

/* ═══ FULL MODE ═══ */
function openFullMode() {
  // Save current state to sessionStorage
  try {
    sessionStorage.setItem('vocapath_fullmode_words', JSON.stringify(window.WORDS || []));
    sessionStorage.setItem('vocapath_fullmode_state', JSON.stringify(window.STATE || {}));
    
    // Open fullmode.html in new window
    const baseUrl = window.location.href.split('?')[0].replace('index.html', '');
    window.open(baseUrl + 'fullmode.html', 'VocaPath Full Mode', 'width=1200,height=800');
  } catch (error) {
    console.error('Failed to open Full Mode:', error);
    showToast('Failed to open Full Mode. Please check your browser settings.');
  }
}


/* ═══ EXPORT FUNCTIONS TO GLOBAL SCOPE ═══ */
window.toggleDarkMode = toggleDarkMode;
window.toggleMenu = toggleMenu;
window.startLearning = startLearning;
window.viewProgress = viewProgress;
window.showToast = showToast;
window.markWordAsLearned = markWordAsLearned;
window.scrollToTop = scrollToTop;
window.scrollToBottom = scrollToBottom;
window.openFullMode = openFullMode;
window.getBasePath = getBasePath;

/* ═══ RESET PROGRESS MODAL ═══ */
function openResetProgressModal() {
  const modal = document.getElementById('resetProgressModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeResetProgressModal() {
  const modal = document.getElementById('resetProgressModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function confirmResetProgress() {
  if (window.resetAllProgress) {
    window.resetAllProgress();
    showToast('All progress has been reset successfully!', 2500);
    closeResetProgressModal();
  }
}

window.openResetProgressModal = openResetProgressModal;
window.closeResetProgressModal = closeResetProgressModal;
window.confirmResetProgress = confirmResetProgress;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
