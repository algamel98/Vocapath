/* ═══════════════════════════════════════════════════════════
   VocaPath - Audio Pronunciation Module
   Handles word pronunciation using Dictionary API and fallback TTS
   ══════════════════════════════════════════════════════════ */

/* ═══ PLAY WORD PRONUNCIATION ═══ */
async function playWord(word, btn) {
  if (btn.classList.contains('playing')) return;
  
  btn.classList.add('playing');
  
  try {
    // Try to fetch pronunciation from Dictionary API
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await response.json();
    
    if (Array.isArray(data) && data[0]) {
      const phonetics = data[0].phonetics || [];
      const audioData = phonetics.find(p => p.audio && p.audio.length > 0);
      
      if (audioData) {
        let audioUrl = audioData.audio;
        
        // Fix protocol-relative URLs
        if (audioUrl.startsWith('//')) {
          audioUrl = 'https:' + audioUrl;
        }
        
        // Play audio
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          btn.classList.remove('playing');
        };
        
        audio.onerror = () => {
          btn.classList.remove('playing');
          fallbackTTS(word, btn);
        };
        
        await audio.play();
        return;
      }
    }
  } catch (error) {
    console.log('Dictionary API failed, using fallback TTS');
  }
  
  // Fallback to browser TTS
  fallbackTTS(word, btn);
}

/* ═══ FALLBACK TEXT-TO-SPEECH ═══ */
function fallbackTTS(word, btn) {
  // Cancel any ongoing speech
  speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  
  utterance.onend = () => {
    if (btn) btn.classList.remove('playing');
  };
  
  utterance.onerror = () => {
    if (btn) btn.classList.remove('playing');
    showToast('Unable to play pronunciation');
  };
  
  speechSynthesis.speak(utterance);
}

/* ═══ EXPORT FUNCTIONS TO GLOBAL SCOPE ═══ */
window.playWord = playWord;
window.fallbackTTS = fallbackTTS;
