from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import List, Dict
import io
from PIL import Image

from services.object_detector import ObjectDetector
from aac_logic import AACLogic
from aac_matcher import AACMatcher

app = FastAPI(title="AACTION API", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services (load YOLO model once at startup)
print("🚀 Initializing services...")
object_detector = ObjectDetector()
aac_logic = AACLogic()
aac_matcher = AACMatcher()
print("✅ Services ready")


@app.get("/")
async def root():
    return {"message": "AACTION API", "status": "running"}


@app.get("/health")
async def health():
    return {"ok": True}


@app.get("/api/core-words")
async def get_core_words():
    """
    Get core words with their icon paths.
    Returns mapping of word -> icon path for all core words.
    """
    core_words = aac_logic.core_words
    word_icons = {}
    for word in core_words:
        icon_path = aac_logic.get_icon_path(word)
        word_icons[word] = icon_path
    
    return {
        "core_words": core_words,
        "icons": word_icons,
        "total_words": len(core_words),
        "total_icons": len(word_icons)
    }


@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze uploaded image and return detected objects with AAC suggestions.
    
    Returns:
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
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image (jpg/png)")
        
        # Read image
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Detect objects using YOLOv8 computer vision
        print(f"📸 Processing image: {image.size[0]}x{image.size[1]} pixels")
        detected_objects = object_detector.detect(image)
        
        if not detected_objects:
            print("⚠️  No objects detected by YOLOv8")
            # Return empty result
            return JSONResponse(status_code=200, content={
                "detected": [],
                "detectedTiles": [],
                "suggested_words": ["I", "SEE", "NOTHING"],
                "icons": [
                    aac_logic.get_icon_path("I"),
                    aac_logic.get_icon_path("SEE"),
                    aac_logic.get_icon_path("NOTHING")
                ],
                "sentence": "I see nothing"
            })
        
        print(f"✅ YOLOv8 detected {len(detected_objects)} objects: {[obj['name'] for obj in detected_objects]}")
        
        # Match detections to AAC symbols using the matcher
        # Take top 1-5 unique detections
        top_detections = detected_objects[:5]
        matched_tiles = aac_matcher.match_detections(top_detections)
        
        # Extract detected word list for backward compatibility
        detected_words = [tile["word"] for tile in matched_tiles]
        
        # Process detections through AAC logic for suggested sentence
        result = aac_logic.process_detections(detected_objects)
        
        # Add detectedTiles to result
        result["detectedTiles"] = [
            {"word": tile["word"], "icon": tile["icon"]}
            for tile in matched_tiles
        ]
        
        return JSONResponse(status_code=200, content=result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
