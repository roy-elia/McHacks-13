# AACTION - McHacks 13

**A-A-C-T-I-O-N** (not AAACTION)

**AACTION: Accessible, Intelligent, Empowering communication for everyone.**

An AI-powered Augmentative and Alternative Communication (AAC) web app that combines core vocabulary with dynamic context-aware object detection.

## 🎯 Project Overview

**AACTION** helps non-verbal children communicate by combining:
- **Core AAC vocabulary** (40 common words: I, YOU, WANT, SEE, etc.)
- **Dynamic object detection** (YOLOv8 computer vision detects objects in photos)
- **Real AAC pictograms** (3500+ SVG symbols from ARASAAC/OpenSymbols)

The app translates camera images into AAC sentences, allowing users to build communication strips by tapping core words + detected objects, then speak them aloud.

## 🏗️ Architecture

- **Frontend**: Next.js 14 + TypeScript + React
- **Backend**: FastAPI (Python) + YOLOv8 (ultralytics)
- **Symbols**: Local SVG library (3500+ files in `frontend/public/acc/symbols/`)

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Build AAC symbol mapping (scans SVG files and creates aac_map.json)
python build_aac_map.py

# Run server
python main.py
# Or: uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs at `http://localhost:3000`

## 📁 Project Structure

```
McHacks-13/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── aac_logic.py         # Core/fringe word logic
│   ├── build_aac_map.py     # Symbol mapping generator
│   ├── aac_map.json         # Word → SVG filename mapping (auto-generated)
│   ├── core_words.json      # 40 core AAC words
│   ├── services/
│   │   └── object_detector.py  # YOLOv8 integration
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Next.js app directory
│   │   ├── page.tsx         # Main page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ImageUpload.tsx
│   │   ├── CoreWordBar.tsx
│   │   ├── SuggestionsBar.tsx
│   │   ├── SentenceStrip.tsx
│   │   └── SpeakButton.tsx
│   ├── public/
│   │   └── aac/
│   │       ├── symbols/     # 3500+ SVG files
│   │       └── unknown.svg  # Fallback symbol
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### `GET /health`
Health check endpoint.

**Response:**
```json
{ "ok": true }
```

### `POST /analyze-image`
Analyze uploaded image and return detected objects with AAC suggestions.

**Request:** `multipart/form-data` with `file` (image)

**Response:**
```json
{
  "detected": ["PIZZA", "PERSON"],
  "suggested_words": ["I", "WANT", "PIZZA"],
  "icons": ["/acc/symbols/i.svg", "/acc/symbols/want.svg", "/acc/symbols/pizza.svg"],
  "sentence": "I want pizza"
}
```

## 🎨 Features

### Core Word Bar
Always-visible bar with 40 core AAC words (I, YOU, WANT, SEE, etc.) that users can tap to build sentences.

### Dynamic Object Detection
- Upload a photo → YOLOv8 detects objects
- Detected nouns appear as large, tappable buttons
- System suggests sentences like "I WANT PIZZA" or "I SEE DOG"

### Sentence Strip
- Visual sentence builder showing selected words with pictograms
- Tap words to remove them
- Clear button to reset

### Text-to-Speech
- "Speak" button uses Web Speech API
- Reads the assembled sentence aloud
- Stop button to cancel speech

### Suggestion System
- After image analysis, shows suggested sentence
- "Use Suggestion" button adds all suggested words at once

## 🔧 Development

### Backend Development

```bash
# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# View API docs
# http://localhost:8000/docs (Swagger UI)
# http://localhost:8000/redoc (ReDoc)
```

### Frontend Development

```bash
# Run dev server with hot reload
npm run dev

# Build for production
npm run build
npm start
```

### Rebuilding Symbol Map

If you add/modify SVG files, regenerate the mapping:

```bash
cd backend
python build_aac_map.py
```

## 📝 Symbol Attribution

The AAC symbol library (3500+ SVG files) is sourced from:
- **ARASAAC** (Aragonese Portal of Augmentative and Alternative Communication)
- **OpenSymbols** (Open-licensed symbol sets)

**License**: CC BY-NC-SA 4.0 (Attribution-NonCommercial-ShareAlike)

For hackathon/demo purposes, these symbols are used under fair use. For production deployment, ensure proper licensing compliance.

## 🎯 Hackathon Notes

- **Speed over perfection**: YOLOv8n (nano) model for fast inference
- **Simple grammar**: Rules-based sentence generation (not ML-based)
- **Max 5 words**: AAC sentences kept short for clarity
- **Fallback handling**: Unknown words use `/acc/unknown.svg`
- **No database**: All mappings in JSON files

## 🐛 Troubleshooting

### Backend Issues

- **YOLOv8 model not downloading**: Ensure internet connection on first run
- **aac_map.json missing**: Run `python build_aac_map.py`
- **CORS errors**: Check `allow_origins` in `main.py` includes your frontend URL

### Frontend Issues

- **Icons not loading**: Check that SVG files exist in `public/acc/symbols/`
- **API connection failed**: Ensure backend is running on port 8000
- **Text-to-speech not working**: Check browser support (Chrome/Edge recommended)

## 📄 License

This project is built for McHacks 13 hackathon. See symbol attribution above for SVG library licensing.

## 👥 Team

Built by a team of 3 for McHacks 13 - focusing on accessibility and assistive technology.

---

**Made with ❤️ for non-verbal communication**
