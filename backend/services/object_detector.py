"""
Object detection service using YOLOv8.
Detects objects in images and returns them with confidence scores.
"""
from ultralytics import YOLO
from PIL import Image
import torch
from typing import List, Dict
import os
import traceback


class ObjectDetector:
    def __init__(self, model_path: str = None):
        """
        Initialize YOLOv8 model.
        Downloads model automatically on first use if not found.
        """
        self.model = None
        self.model_loaded = False
        
        try:
            print("🔄 Loading YOLOv8 model (this may take a moment on first run)...")
            # Use YOLOv8n (nano) for speed - perfect for hackathon demo
            # This will download the model (~6MB) if not present
            self.model = YOLO("yolov8n.pt")
            self.model.fuse()  # Fuse layers for faster inference
            self.model_loaded = True
            print("✅ YOLOv8 model loaded successfully")
            print(f"   Model can detect {len(self.model.names)} object classes")
        except ImportError as e:
            print(f"❌ ERROR: ultralytics package not installed!")
            print(f"   Run: pip install ultralytics")
            print(f"   Error: {e}")
            self.model = None
        except Exception as e:
            print(f"⚠️  Warning: Could not load YOLOv8 model: {e}")
            print(f"   Full error: {traceback.format_exc()}")
            print("   Model will be downloaded on first detection")
            self.model = None
    
    def detect(self, image: Image.Image, confidence_threshold: float = 0.25) -> List[Dict]:
        """
        Detect objects in image using YOLOv8 computer vision.
        
        Args:
            image: PIL Image
            confidence_threshold: Minimum confidence score (0-1)
        
        Returns:
            List of detected objects with name, confidence, and bbox
        """
        # Lazy load model if not loaded yet
        if self.model is None:
            try:
                print("🔄 Attempting to load YOLOv8 model...")
                self.model = YOLO("yolov8n.pt")
                self.model.fuse()
                self.model_loaded = True
                print("✅ YOLOv8 model loaded successfully")
            except Exception as e:
                print(f"❌ ERROR: Failed to load YOLOv8 model: {e}")
                print(f"   Make sure ultralytics is installed: pip install ultralytics")
                print(f"   Full error: {traceback.format_exc()}")
                return []
        
        if not self.model_loaded:
            print("⚠️  YOLOv8 model not loaded, skipping detection")
            return []
        
        try:
            print(f"🔍 Running YOLOv8 inference on image (size: {image.size})...")
            
            # Run YOLOv8 inference - this is the computer vision step!
            # The model analyzes the image pixels and identifies objects
            results = self.model(image, conf=confidence_threshold, verbose=False)
            
            detected_objects = []
            
            # Extract detections from YOLOv8 results
            for result in results:
                boxes = result.boxes
                if boxes is not None and len(boxes) > 0:
                    print(f"   Found {len(boxes)} detected objects")
                    for i in range(len(boxes)):
                        # Get class name and confidence from YOLOv8
                        class_id = int(boxes.cls[i])
                        class_name = self.model.names[class_id]
                        confidence = float(boxes.conf[i])
                        
                        # Get bounding box coordinates
                        bbox = boxes.xyxy[i].tolist()
                        
                        detected_objects.append({
                            "name": class_name,
                            "confidence": confidence,
                            "bbox": bbox
                        })
                        print(f"   ✓ Detected: {class_name} (confidence: {confidence:.2f})")
                else:
                    print("   No objects detected in image")
            
            # Sort by confidence (highest first)
            detected_objects.sort(key=lambda x: x["confidence"], reverse=True)
            
            # Return top 3 objects for simplicity (AAC sentences are short)
            top_objects = detected_objects[:3]
            if top_objects:
                print(f"✅ Returning top {len(top_objects)} detected objects")
            else:
                print("⚠️  No objects detected above confidence threshold")
            
            return top_objects
        
        except Exception as e:
            print(f"❌ ERROR in object detection: {e}")
            print(f"   Full traceback: {traceback.format_exc()}")
            return []
