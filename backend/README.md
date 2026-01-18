# Augmented AAC Backend

FastAPI backend for the Augmented AAC hackathon project.

## Setup

### 1. Create virtual environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Build AAC symbol mapping

**Important**: Run this before starting the server to generate `aac_map.json`:

```bash
python build_aac_map.py
```

This scans `../frontend/public/acc/symbols/*.svg` and creates mappings from words to SVG filenames.

### 4. Run the server

```bash
python main.py
# Or: uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Note**: YOLOv8 will automatically download the model (`yolov8n.pt`) on first use (~6MB).

## API Endpoints

### `GET /health`
Returns `{"ok": true}`

### `POST /analyze-image`
Upload image (multipart/form-data) and get detected objects with AAC suggestions.

**Response:**
```json
{
  "detected": ["PIZZA", "PERSON"],
  "detectedTiles": [
    {"word": "PIZZA", "icon": "/acc/symbols/pizza.svg"},
    {"word": "PERSON", "icon": "/acc/symbols/person.svg"}
  ],
  "suggested_words": ["I", "WANT", "PIZZA"],
  "icons": ["/acc/symbols/i.svg", "/acc/symbols/want.svg", "/acc/symbols/pizza.svg"],
  "sentence": "I want pizza"
}
```

The `detectedTiles` array contains 1-5 detected nouns with their matched AAC symbol icons, ready for display in the frontend.

## Project Structure

```
backend/
├── main.py                 # FastAPI app
├── aac_logic.py            # Core/fringe word logic
├── aac_matcher.py          # YOLO label → AAC symbol matcher
├── build_aac_map.py        # Symbol mapping generator
├── aac_map.json            # Word → SVG mapping (auto-generated)
├── core_words.json         # 40 core AAC words
├── services/
│   └── object_detector.py  # YOLOv8 integration
└── requirements.txt
```

## Development

View API docs at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testing Computer Vision

To verify YOLOv8 is working:

```bash
python test_yolo.py
```

This will test the object detection model and show you what it can detect.

## Troubleshooting

- **aac_map.json missing**: Run `python build_aac_map.py`
- **YOLOv8 model not downloading**: Ensure internet connection on first run
- **No objects detected**: Try a clear photo with common objects (person, car, dog, pizza)
- **Computer vision not working**: See `HOW_COMPUTER_VISION_WORKS.md` for detailed guide
- **CORS errors**: Check `allow_origins` in `main.py` includes frontend URL (localhost:3000)
