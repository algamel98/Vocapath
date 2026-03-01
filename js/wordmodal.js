/* ═══════════════════════════════════════════════════════════
   VocaPath - Word Detail Modal Module
   Handles detailed word information display
   ══════════════════════════════════════════════════════════ */

/* ═══ OPEN WORD DETAIL MODAL ═══ */
function openWordDetailModal(word) {
  // Create modal if it doesn't exist
  let modal = document.getElementById('wordDetailModal');
  if (!modal) {
    modal = createWordDetailModal();
    document.body.appendChild(modal);
  }

  // Populate modal with word data
  const parts = word.arabic.split('|').map(s => s.trim());
  const mainArabic = parts[0];
  const extraArabic = parts.slice(1);

  const modalContent = modal.querySelector('.word-detail-content');
  if (modalContent) {
    modalContent.innerHTML = `
      <div class="word-detail-header">
        <div class="word-detail-english">
          <h2>${word.word}</h2>
          <span class="type-badge large">${word.type}</span>
          <span class="badge ${word.level} large">${word.level}</span>
        </div>
        <button class="modal-close-btn" onclick="closeWordDetailModal()" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="word-detail-body">
        <div class="word-detail-section">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              <path d="M2 12h20"/>
            </svg>
            Arabic Translation
          </h3>
          <div class="arabic-translation">
            <div class="ar-main-large">${mainArabic}</div>
            ${extraArabic.length > 0 ? `<div class="ar-extra-large">${extraArabic.join(' | ')}</div>` : ''}
          </div>
        </div>

        <div class="word-detail-section">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
            Definition
          </h3>
          <p class="word-definition">${word.def}</p>
        </div>

        ${word.example ? `
        <div class="word-detail-section example-section">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Example Sentence
          </h3>
          <div class="example-sentences">
            <p class="example-en">${word.example}</p>
            ${word.exampleAr ? `<p class="example-ar">${word.exampleAr}</p>` : ''}
          </div>
        </div>
        ` : ''}

        <div class="word-detail-section">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Word Details
          </h3>
          <div class="word-metadata">
            <div class="metadata-item">
              <strong>Type:</strong> ${word.type}
            </div>
            <div class="metadata-item">
              <strong>CEFR Level:</strong> ${word.level} (${getLevelDescription(word.level)})
            </div>
            <div class="metadata-item">
              <strong>First Letter:</strong> ${word.word.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div class="word-detail-actions">
          <button class="btn-modal primary" onclick="playWordFromModal('${word.word.replace(/'/g, "\\'")}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            Listen to Pronunciation
          </button>
          <button class="btn-modal secondary" onclick="closeWordDetailModal()">
            Close
          </button>
        </div>
      </div>
    `;
  }

  // Show modal
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ═══ CLOSE WORD DETAIL MODAL ═══ */
function closeWordDetailModal() {
  const modal = document.getElementById('wordDetailModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ═══ CREATE WORD DETAIL MODAL ELEMENT ═══ */
function createWordDetailModal() {
  const modal = document.createElement('div');
  modal.id = 'wordDetailModal';
  modal.className = 'modal-overlay word-detail-modal';
  modal.innerHTML = `
    <div class="modal word-detail-modal-content">
      <div class="word-detail-content">
        <!-- Content will be populated dynamically -->
      </div>
    </div>
  `;

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeWordDetailModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeWordDetailModal();
    }
  });

  return modal;
}

/* ═══ GET LEVEL DESCRIPTION ═══ */
function getLevelDescription(level) {
  const descriptions = {
    'A1': 'Beginner',
    'A2': 'Elementary',
    'B1': 'Intermediate',
    'B2': 'Upper-Intermediate',
    'C1': 'Advanced',
    'C2': 'Proficient'
  };
  return descriptions[level] || level;
}

/* ═══ PLAY WORD FROM MODAL ═══ */
function playWordFromModal(word) {
  const btn = document.querySelector('.word-detail-modal .btn-modal.primary');
  if (btn && window.playWord) {
    window.playWord(word, btn);
  }
}

/* ═══ EXPORT FUNCTIONS TO GLOBAL SCOPE ═══ */
window.openWordDetailModal = openWordDetailModal;
window.closeWordDetailModal = closeWordDetailModal;
window.playWordFromModal = playWordFromModal;
window.getLevelDescription = getLevelDescription;
