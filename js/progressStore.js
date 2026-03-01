/* ═══════════════════════════════════════════════════════════
   VocaPath - Progress Store (Single Source of Truth)
   Pub/Sub pattern for cross-window progress updates
   ══════════════════════════════════════════════════════════ */

const PROGRESS_STORAGE_KEY = 'vocapath_progress';
const PROGRESS_EVENT = 'vocapath:progress:updated';

// Central progress state
let PROGRESS_DATA = {};
let listeners = [];

/* ═══ WORD ID GENERATOR ═══ */
function getWordId(word) {
  const english = (word.word || '').toLowerCase().trim();
  const arabic = (word.arabic || '').split('|')[0].trim();
  return `${english}_${arabic}`.replace(/[^a-z0-9_\u0600-\u06FF]/gi, '');
}

/* ═══ LOAD FROM LOCALSTORAGE ═══ */
function loadProgress() {
  try {
    const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (saved) {
      PROGRESS_DATA = JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load progress:', error);
    PROGRESS_DATA = {};
  }
}

/* ═══ SAVE TO LOCALSTORAGE ═══ */
function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(PROGRESS_DATA));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

/* ═══ NOTIFY ALL LISTENERS ═══ */
function notifyListeners() {
  // Dispatch custom event for same-window listeners
  const event = new CustomEvent(PROGRESS_EVENT, { 
    detail: { 
      progress: PROGRESS_DATA,
      stats: getProgressStats()
    } 
  });
  window.dispatchEvent(event);
  
  // Call registered callbacks
  listeners.forEach(callback => {
    try {
      callback(PROGRESS_DATA);
    } catch (error) {
      console.error('Listener error:', error);
    }
  });
  
  // Update localStorage to trigger storage event in other windows
  saveProgress();
}

/* ═══ SUBSCRIBE TO PROGRESS UPDATES ═══ */
function subscribe(callback) {
  if (typeof callback === 'function') {
    listeners.push(callback);
  }
  return () => {
    listeners = listeners.filter(cb => cb !== callback);
  };
}

/* ═══ MARK PROGRESS ACTIONS ═══ */
function markInfoViewed(word) {
  const wordId = getWordId(word);
  if (!PROGRESS_DATA[wordId]) {
    PROGRESS_DATA[wordId] = { infoViewed: false, audioPlayed: false, meaningRevealed: false };
  }
  PROGRESS_DATA[wordId].infoViewed = true;
  PROGRESS_DATA[wordId].timestamp = Date.now();
  notifyListeners();
}

function markAudioPlayed(word) {
  const wordId = getWordId(word);
  if (!PROGRESS_DATA[wordId]) {
    PROGRESS_DATA[wordId] = { infoViewed: false, audioPlayed: false, meaningRevealed: false };
  }
  PROGRESS_DATA[wordId].audioPlayed = true;
  PROGRESS_DATA[wordId].timestamp = Date.now();
  notifyListeners();
}

function markMeaningRevealed(word) {
  const wordId = getWordId(word);
  if (!PROGRESS_DATA[wordId]) {
    PROGRESS_DATA[wordId] = { infoViewed: false, audioPlayed: false, meaningRevealed: false };
  }
  PROGRESS_DATA[wordId].meaningRevealed = true;
  PROGRESS_DATA[wordId].timestamp = Date.now();
  notifyListeners();
}

/* ═══ CHECK IF WORD HAS PROGRESS ═══ */
function hasProgress(word) {
  const wordId = getWordId(word);
  const progress = PROGRESS_DATA[wordId];
  if (!progress) return false;
  return progress.infoViewed || progress.audioPlayed || progress.meaningRevealed;
}

/* ═══ UNLEARN WORD (RESET PROGRESS) ═══ */
function unlearnWord(word) {
  const wordId = getWordId(word);
  if (PROGRESS_DATA[wordId]) {
    delete PROGRESS_DATA[wordId];
    notifyListeners();
  }
}

/* ═══ RESET ALL PROGRESS ═══ */
function resetAllProgress() {
  PROGRESS_DATA = {};
  saveProgress();
  notifyListeners();
}

/* ═══ GET PROGRESS STATISTICS ═══ */
function getProgressStats() {
  // Get actual total words from database
  const totalWords = window.WORDS ? window.WORDS.length : 0;
  
  let progressedWords = 0;

  if (window.WORDS && Array.isArray(window.WORDS)) {
    window.WORDS.forEach(word => {
      const wordId = getWordId(word);
      const progress = PROGRESS_DATA[wordId];
      if (progress) {
        if (progress.infoViewed || progress.audioPlayed || progress.meaningRevealed) {
          progressedWords++;
        }
      }
    });
  }

  const percentage = totalWords > 0 ? Math.round((progressedWords / totalWords) * 100) : 0;

  return {
    totalWords,
    progressedWords,
    percentage
  };
}

/* ═══ UPDATE PROGRESS UI ═══ */
function updateProgressUI() {
  const stats = getProgressStats();
  
  // Update Home page progress section
  const progressCount = document.getElementById('progressCount');
  const progressStats = document.querySelector('.progress-stats');
  const progressFill = document.querySelector('.progress-bar-fill');
  const progressPercentage = document.querySelector('.progress-percentage');
  
  if (progressCount) {
    progressCount.textContent = `${stats.progressedWords} / ${stats.totalWords}`;
  }
  
  if (progressStats) {
    progressStats.innerHTML = `You have learned <strong>${stats.progressedWords} / ${stats.totalWords}</strong> words`;
  }
  
  if (progressFill) {
    progressFill.style.width = `${stats.percentage}%`;
  }
  
  if (progressPercentage) {
    progressPercentage.textContent = `${stats.percentage}% Completed`;
  }
  
  // Update Full Mode progress counter
  const fullModeProgressCount = document.getElementById('fullModeProgressCount');
  if (fullModeProgressCount) {
    fullModeProgressCount.textContent = `${stats.progressedWords} / ${stats.totalWords}`;
  }
}

/* ═══ UPDATE WORD ROW STYLES ═══ */
function updateWordRowStyles() {
  document.querySelectorAll('.word-row[data-word-id]').forEach(row => {
    const wordId = row.dataset.wordId;
    const progress = PROGRESS_DATA[wordId];
    const hasProgressNow = progress && (progress.infoViewed || progress.audioPlayed || progress.meaningRevealed);
    
    // Update row class
    if (hasProgressNow) {
      row.classList.add('has-progress');
    } else {
      row.classList.remove('has-progress');
    }
    
    // Update unlearn button state
    const unlearnBtn = row.querySelector('.icon-btn.unlearn');
    if (unlearnBtn) {
      if (hasProgressNow) {
        unlearnBtn.classList.remove('disabled');
        unlearnBtn.classList.add('active');
        unlearnBtn.removeAttribute('disabled');
        unlearnBtn.setAttribute('title', 'Reset progress for this word');
      } else {
        unlearnBtn.classList.remove('active');
        unlearnBtn.classList.add('disabled');
        unlearnBtn.setAttribute('disabled', 'true');
        unlearnBtn.setAttribute('title', 'No progress yet');
      }
    }
  });
}

/* ═══ INITIALIZE PROGRESS SYSTEM ═══ */
function initProgress() {
  loadProgress();
  updateProgressUI();
  updateWordRowStyles();
  
  // Subscribe to own updates
  subscribe(() => {
    updateProgressUI();
    updateWordRowStyles();
  });
  
  // Listen for localStorage changes from other windows
  window.addEventListener('storage', (e) => {
    if (e.key === PROGRESS_STORAGE_KEY && e.newValue) {
      try {
        PROGRESS_DATA = JSON.parse(e.newValue);
        notifyListeners();
      } catch (error) {
        console.error('Failed to parse progress from storage event:', error);
      }
    }
  });
  
  // Listen for custom events
  window.addEventListener(PROGRESS_EVENT, () => {
    updateProgressUI();
    updateWordRowStyles();
  });
}

/* ═══ EXPORT TO GLOBAL SCOPE ═══ */
window.ProgressStore = {
  init: initProgress,
  subscribe,
  markInfoViewed,
  markAudioPlayed,
  markMeaningRevealed,
  hasProgress,
  unlearnWord,
  resetAllProgress,
  getProgressStats,
  getWordId,
  updateUI: updateProgressUI,
  updateWordRowStyles,
  getData: () => PROGRESS_DATA
};

// Legacy exports for backwards compatibility
window.initProgress = initProgress;
window.markInfoViewed = markInfoViewed;
window.markAudioPlayed = markAudioPlayed;
window.markMeaningRevealed = markMeaningRevealed;
window.hasProgress = hasProgress;
window.getProgressStats = getProgressStats;
window.updateProgressUI = updateProgressUI;
window.getWordId = getWordId;
window.unlearnWord = unlearnWord;
window.resetAllProgress = resetAllProgress;

// Export PROGRESS_DATA as a getter to always return current state
Object.defineProperty(window, 'PROGRESS_DATA', {
  get: () => PROGRESS_DATA,
  enumerable: true
});
