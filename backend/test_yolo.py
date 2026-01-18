"""
Quick test script to verify YOLOv8 is working.
Run this to test computer vision before running the full server.
"""
from services.object_detector import ObjectDetector
from PIL import Image
import numpy as np

def test_yolo():
    print("=" * 60)
    print("YOLOv8 Computer Vision Test")
    print("=" * 60)
    
    # Initialize detector
    print("\n1. Initializing YOLOv8 detector...")
    detector = ObjectDetector()
    
    if detector.model is None:
        print("❌ FAILED: YOLOv8 model not loaded!")
        print("   Make sure you have installed: pip install ultralytics")
        return False
    
    print("✅ YOLOv8 model loaded successfully")
    print(f"   Model can detect {len(detector.model.names)} object classes")
    
    # Create a simple test image (red square)
    print("\n2. Creating test image...")
    test_image = Image.new('RGB', (640, 480), color='red')
    print(f"   Test image size: {test_image.size}")
    
    # Run detection
    print("\n3. Running object detection...")
    results = detector.detect(test_image)
    
    print(f"\n4. Results: Found {len(results)} objects")
    for i, obj in enumerate(results, 1):
        print(f"   {i}. {obj['name']} (confidence: {obj['confidence']:.2f})")
    
    if len(results) > 0:
        print("\n✅ SUCCESS: YOLOv8 computer vision is working!")
        return True
    else:
        print("\n⚠️  No objects detected (this is normal for a simple test image)")
        print("   Try with a real photo containing objects like: person, car, dog, etc.")
        return True  # Still success - model is working, just no detections

if __name__ == "__main__":
    test_yolo()
