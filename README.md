# VocaPath

**Your structured path to English mastery**

A modern vocabulary learning platform based on the Oxford 3000 & 5000 word lists. Designed for Arabic-speaking learners with CEFR levels, filters, and progress tracking.

## Project Structure

```
VocaPath/
├── index.html           # Main page
├── about.html           # About
├── goals.html           # Goals
├── privacy.html         # Privacy policy
├── fullmode.html        # Full study mode
├── css/
│   └── styles.css       # Styles (dark mode, responsive)
├── js/
│   ├── app.js           # Main app logic
│   ├── filters.js       # CEFR & type filters
│   ├── alphabet.js      # A–Z filter modal
│   ├── audio.js         # Pronunciation (API + TTS)
│   ├── progress.js      # Progress tracking
│   ├── progressStore.js # Progress persistence
│   └── wordmodal.js     # Word detail modal
├── data/
│   ├── words.json       # Vocabulary data
│   └── The_Oxford_5000.pdf
├── BOOK/
│   ├── OXFORD.pdf       # Oxford 3000 list
│   └── ENGLISH_CORE (2).pdf
├── images/
│   └── logo.png
├── videos/
│   └── HERO.mp4
├── server.js            # Optional local server
├── start_server.py      # Python server alternative
├── start_server.bat     # Windows launcher
└── package.json
```

## Features

- **CEFR Levels** — A1 to C1 filtering
- **Search** — English and Arabic
- **Alphabet filter** — A–Z multi-select
- **Progress tracking** — Learned words, persisted
- **Dark mode** — Theme toggle
- **Audio** — Free Dictionary API + TTS fallback
- **Full Mode** — Extended study view
- **Download resources** — Oxford 3000 & 5000 PDFs

## Getting Started

### Option 1: Open directly
Open `index.html` in a browser. Works client-side with no server (some features like CORS for data may require a server).

### Option 2: Local server (recommended)

**Node.js:**
```bash
npm start
```

**Python:**
```bash
python start_server.py
```

**Windows:** Double-click `start_server.bat`

Then open: `http://localhost:3001/vocapath`

## Browser support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Reference

Based on Oxford 3000™ and Oxford 5000 word lists (CEFR).

## Author

**A. Algamel** — © 2026

## License

Educational use.
