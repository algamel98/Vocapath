/* ═══════════════════════════════════════════════════════════
   VocaPath - Alphabet Filter Modal
   Handles A-Z letter filtering
   ══════════════════════════════════════════════════════════ */

/* ═══ ALPHABET MODAL INITIALIZATION ═══ */
function initAlphabetModal() {
  renderAlphabetChips();
  
  // Close modal on overlay click
  const overlay = document.getElementById('alphabetModal');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeAlphabetModal();
      }
    });
  }
}

/* ═══ RENDER ALPHABET CHIPS ═══ */
function renderAlphabetChips() {
  const grid = document.getElementById('alphabetGrid');
  if (!grid) return;
  
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  grid.innerHTML = letters.map(letter => {
    const selected = STATE.alphabet.includes(letter);
    return `
      <div class="letter-chip ${selected ? 'selected' : ''}" 
           data-letter="${letter}"
           onclick="toggleLetter('${letter}')">
        ${letter}
      </div>
    `;
  }).join('');
}

/* ═══ TOGGLE LETTER ═══ */
function toggleLetter(letter) {
  const index = STATE.alphabet.indexOf(letter);
  
  if (index > -1) {
    // Remove letter
    STATE.alphabet.splice(index, 1);
  } else {
    // Add letter
    STATE.alphabet.push(letter);
    // Keep alphabetically sorted
    STATE.alphabet.sort();
  }
  
  renderAlphabetChips();
}

/* ═══ BULK LETTER CONTROLS ═══ */
function selectAllLetters() {
  STATE.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  renderAlphabetChips();
}

function deselectAllLetters() {
  STATE.alphabet = [];
  renderAlphabetChips();
}

/* ═══ MODAL CONTROLS ═══ */
function openAlphabetModal() {
  const modal = document.getElementById('alphabetModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeAlphabetModal() {
  const modal = document.getElementById('alphabetModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function applyAlphabetFilter() {
  saveState();
  renderChips();
  applyFilters();
  closeAlphabetModal();
  
  if (STATE.alphabet.length === 0) {
    showToast('No letters selected. Showing empty results.');
  } else if (STATE.alphabet.length < 26) {
    showToast(`Filtering by ${STATE.alphabet.length} letter(s)`);
  }
}

/* ═══ EXPORT FUNCTIONS TO GLOBAL SCOPE ═══ */
window.initAlphabetModal = initAlphabetModal;
window.renderAlphabetChips = renderAlphabetChips;
window.toggleLetter = toggleLetter;
window.selectAllLetters = selectAllLetters;
window.deselectAllLetters = deselectAllLetters;
window.openAlphabetModal = openAlphabetModal;
window.closeAlphabetModal = closeAlphabetModal;
window.applyAlphabetFilter = applyAlphabetFilter;
