/* ═══════════════════════════════════════════════════════════
   VocaPath - Progress Tracking Module
   Centralized learning progress management
   ══════════════════════════════════════════════════════════ */

/* ═══ PROGRESS STATE ═══ */
const PROGRESS_STORAGE_KEY = 'vocapath_progress';

// Progress tracking: { wordId: { infoViewed: bool, audioPlayed: bool, meaningRevealed: bool, timestamp: number } }
let PROGRESS_DATA = {};

/* ═══ WORD ID GENERATOR ═══ */
function getWordId(word) {
  // Create stable ID from English word + Arabic (in case of duplicates)
  const english = (word.word || '').toLowerCase().trim();
  const arabic = (word.arabic || '').split('|')[0].trim();
  return `${english}_${arabic}`.replace(/[^a-z0-9_\u0600-\u06FF]/gi, '');
}

/* ═══ LOAD PROGRESS FROM LOCALSTORAGE ═══ */
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

/* ═══ SAVE PROGRESS TO LOCALSTORAGE ═══ */
function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(PROGRESS_DATA));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

/* ═══ MARK PROGRESS ACTIONS ═══ */
function markInfoViewed(word) {
  const wordId = getWordId(word);
  if (!PROGRESS_DATA[wordId]) {
    PROGRESS_DATA[wordId] = { infoViewed: false, audioPlayed: false, meaningRevealed: false };
  }
  PROGRESS_DATA[wordId].infoViewed = true;
  PROGRESS_DATA[wordId].timestamp = Date.now();
  saveProgress();
  updateProgressUI();
}

function markAudioPlayed(word) {
  const wordId = getWordId(word);
  if (!PROGRESS_DATA[wordId]) {
    PROGRESS_DATA[wordId] = { infoViewed: false, audioPlayed: false, meaningRevealed: false };
  }
  PROGRESS_DATA[wordId].audioPlayed = true;
  PROGRESS_DATA[wordId].timestamp = Date.now();
  saveProgress();
  updateProgressUI();
}

function markMeaningRevealed(word) {
  const wordId = getWordId(word);
  if (!PROGRESS_DATA[wordId]) {
    PROGRESS_DATA[wordId] = { infoViewed: false, audioPlayed: false, meaningRevealed: false };
  }
  PROGRESS_DATA[wordId].meaningRevealed = true;
  PROGRESS_DATA[wordId].timestamp = Date.now();
  saveProgress();
  updateProgressUI();
}

/* ═══ CHECK IF WORD HAS PROGRESS ═══ */
function hasProgress(word) {
  const wordId = getWordId(word);
  const progress = PROGRESS_DATA[wordId];
  if (!progress) return false;
  return progress.infoViewed || progress.audioPlayed || progress.meaningRevealed;
}

/* ═══ GET PROGRESS STATISTICS ═══ */
function getProgressStats() {
  const totalWords = window.WORDS ? window.WORDS.length : 0;
  let progressedWords = 0;
  let infoViewedCount = 0;
  let audioPlayedCount = 0;
  let meaningRevealedCount = 0;

  if (window.WORDS && Array.isArray(window.WORDS)) {
    window.WORDS.forEach(word => {
      const wordId = getWordId(word);
      const progress = PROGRESS_DATA[wordId];
      if (progress) {
        if (progress.infoViewed || progress.audioPlayed || progress.meaningRevealed) {
          progressedWords++;
        }
        if (progress.infoViewed) infoViewedCount++;
        if (progress.audioPlayed) audioPlayedCount++;
        if (progress.meaningRevealed) meaningRevealedCount++;
      }
    });
  }

  const percentage = totalWords > 0 ? Math.round((progressedWords / totalWords) * 100) : 0;

  return {
    totalWords,
    progressedWords,
    percentage,
    infoViewedCount,
    audioPlayedCount,
    meaningRevealedCount
  };
}

/* ═══ UPDATE PROGRESS UI ═══ */
function updateProgressUI() {
  const stats = getProgressStats();
  
  // Update main page progress section
  const progressStats = document.querySelector('.progress-stats');
  const progressFill = document.querySelector('.progress-bar-fill');
  const progressPercentage = document.querySelector('.progress-percentage');
  
  if (progressStats) {
    progressStats.innerHTML = `You have learned <strong>${stats.progressedWords} / ${stats.totalWords}</strong> words`;
  }
  
  if (progressFill) {
    progressFill.style.width = `${stats.percentage}%`;
  }
  
  if (progressPercentage) {
    progressPercentage.textContent = `${stats.percentage}% Completed`;
  }

  // Update detailed breakdown if exists
  const breakdownEl = document.getElementById('progressBreakdown');
  if (breakdownEl) {
    breakdownEl.innerHTML = `
      <div class="progress-detail-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        <span>Info viewed: <strong>${stats.infoViewedCount}</strong></span>
      </div>
      <div class="progress-detail-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        <span>Audio played: <strong>${stats.audioPlayedCount}</strong></span>
      </div>
      <div class="progress-detail-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        <span>Meaning revealed: <strong>${stats.meaningRevealedCount}</strong></span>
      </div>
    `;
  }
}

/* ═══ INITIALIZE PROGRESS SYSTEM ═══ */
function initProgress() {
  loadProgress();
  updateProgressUI();
}

/* ═══ EXPORT FUNCTIONS TO GLOBAL SCOPE ═══ */
window.initProgress = initProgress;
window.loadProgress = loadProgress;
window.saveProgress = saveProgress;
window.markInfoViewed = markInfoViewed;
window.markAudioPlayed = markAudioPlayed;
window.markMeaningRevealed = markMeaningRevealed;
window.hasProgress = hasProgress;
window.getProgressStats = getProgressStats;
window.updateProgressUI = updateProgressUI;
window.getWordId = getWordId;
window.PROGRESS_DATA = PROGRESS_DATA;
