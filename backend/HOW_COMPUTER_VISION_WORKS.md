# How Computer Vision Works in Augmented AAC

## Overview

We use **YOLOv8** (You Only Look Once version 8) - a state-of-the-art object detection model that uses deep learning to identify objects in images.

## The Flow

```
User uploads image
    ↓
Backend receives image (PIL Image object)
    ↓
YOLOv8 model analyzes image pixels
    ↓
Model returns detected objects (e.g., "pizza", "person", "dog")
    ↓
AAC logic maps objects to AAC words
    ↓
Frontend displays detected objects as tappable buttons
```

## Technical Details

### 1. YOLOv8 Model

- **What it is**: A pre-trained neural network that can detect 80+ object classes
- **Model size**: YOLOv8n (nano) - ~6MB, optimized for speed
- **How it works**: 
  - Takes image pixels as input
  - Uses convolutional neural networks to identify patterns
  - Outputs bounding boxes and class labels for detected objects

### 2. Implementation Location

**File**: `backend/services/object_detector.py`

**Key Code**:
```python
# Initialize model (happens once at startup)
self.model = YOLO("yolov8n.pt")  # Downloads model if not present

# Run inference on image
results = self.model(image, conf=0.25)  # This is the CV magic!

# Extract detections
for box in results.boxes:
    class_name = self.model.names[box.cls]  # e.g., "pizza"
    confidence = box.conf  # e.g., 0.85 (85% sure)
```

### 3. Where It's Called

**File**: `backend/main.py`

**Endpoint**: `POST /analyze-image`

```python
# User uploads image → FastAPI receives it
image = Image.open(io.BytesIO(image_bytes))

# THIS IS WHERE COMPUTER VISION HAPPENS
detected_objects = object_detector.detect(image)
# Returns: [{"name": "pizza", "confidence": 0.92}, ...]

# Then we process through AAC logic
result = aac_logic.process_detections(detected_objects)
```

## Testing Computer Vision

### Quick Test

Run the test script:
```bash
cd backend
python test_yolo.py
```

This will:
1. Load the YOLOv8 model
2. Create a test image
3. Run detection
4. Show results

### Test with Real Image

1. Start the server: `python main.py`
2. Use the frontend to upload a photo
3. Check backend console for detection logs:
   ```
   🔍 Running YOLOv8 inference on image...
   ✓ Detected: pizza (confidence: 0.92)
   ✓ Detected: person (confidence: 0.87)
   ```

## Common Issues

### Model Not Loading

**Symptom**: No detections, errors in console

**Solutions**:
1. Check if `ultralytics` is installed: `pip install ultralytics`
2. Check internet connection (model downloads on first use)
3. Check console for error messages

### No Objects Detected

**Possible reasons**:
- Image doesn't contain recognizable objects
- Objects are too small/blurry
- Confidence threshold too high (default: 0.25)

**Solution**: Try a clear photo with common objects (person, car, dog, pizza, etc.)

### Slow Performance

**YOLOv8n is fast**, but if it's slow:
- First run downloads model (~6MB)
- CPU inference is slower than GPU
- Large images take longer

**Optimization**: Model is already using YOLOv8n (nano) - fastest variant

## What Objects Can It Detect?

YOLOv8 can detect 80 classes including:
- **People**: person
- **Vehicles**: car, truck, bus, bicycle, motorcycle
- **Animals**: dog, cat, bird, horse, cow, sheep
- **Food**: pizza, hot dog, hamburger, cake, apple, banana
- **Furniture**: chair, couch, bed
- **Electronics**: laptop, mouse, keyboard, cell phone, TV
- **Sports**: sports ball, baseball bat, tennis racket
- And many more!

See full list: https://docs.ultralytics.com/models/yolov8/

## Verification Checklist

✅ **Computer vision is working if**:
- Backend console shows "✅ YOLOv8 model loaded successfully" on startup
- When you upload an image, console shows detection logs
- Frontend displays detected objects after upload
- Test script (`test_yolo.py`) runs without errors

❌ **Computer vision is NOT working if**:
- Console shows "❌ ERROR: Failed to load YOLOv8 model"
- No detections ever appear
- `ultralytics` import fails
- Model file (`yolov8n.pt`) not downloading

## Next Steps

If computer vision isn't working:
1. Run `python test_yolo.py` to diagnose
2. Check `pip list | grep ultralytics` to verify installation
3. Check backend console logs for errors
4. Try uploading a clear photo with obvious objects (person, car, dog)
