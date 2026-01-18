"""
AAC Logic: Core vs Fringe word processing and sentence generation.
Handles mapping detected objects to AAC words and generating suggested sentences.
"""
import json
import os
from pathlib import Path
from typing import List, Dict, Optional
import re


class AACLogic:
    def __init__(self, core_words_path: str = "core_words.json", aac_map_path: str = "aac_map.json"):
        """
        Initialize AAC logic with core words and symbol mappings.
        """
        # Load core words
        with open(core_words_path, 'r') as f:
            self.core_words = [word.upper() for word in json.load(f)]
        
        # Load AAC symbol map
        if os.path.exists(aac_map_path):
            with open(aac_map_path, 'r') as f:
                self.aac_map = json.load(f)
        else:
            self.aac_map = {}
            print(f"⚠️  Warning: {aac_map_path} not found. Run build_aac_map.py first.")
        
        # Food keywords for "I WANT" pattern
        self.food_keywords = [
            "pizza", "cookie", "apple", "banana", "cake", "bread", "sandwich",
            "hot dog", "hamburger", "orange", "carrot", "broccoli", "cup",
            "bottle", "donut", "ice cream", "pasta", "rice", "soup", "cereal",
            "milk", "juice", "water", "drink", "food", "snack", "meal"
        ]
        
        # YOLO label to AAC word mappings (normalize common detections)
        self.label_aliases = {
            "sports ball": "BALL",
            "tennis ball": "BALL",
            "soccer ball": "BALL",
            "basketball": "BALL",
            "baseball": "BALL",
            "cell phone": "PHONE",
            "mobile phone": "PHONE",
            "teddy bear": "TOY",
            "book": "BOOK",
            "cup": "CUP",
            "bottle": "BOTTLE",
            "pizza": "PIZZA",
            "hot dog": "HOTDOG",
            "hamburger": "BURGER",
            "apple": "APPLE",
            "banana": "BANANA",
            "orange": "ORANGE",
            "car": "CAR",
            "truck": "TRUCK",
            "bus": "BUS",
            "bicycle": "BIKE",
            "dog": "DOG",
            "cat": "CAT",
            "bird": "BIRD",
            "person": "PERSON",
            "chair": "CHAIR",
            "couch": "COUCH",
            "bed": "BED",
            "laptop": "COMPUTER",
            "mouse": "MOUSE",
            "keyboard": "KEYBOARD",
        }
    
    def is_core_word(self, word: str) -> bool:
        """Check if a word is in the core vocabulary."""
        return word.upper() in self.core_words
    
    def normalize_detected_label(self, label: str) -> Optional[str]:
        """
        Normalize YOLO detection label to AAC word.
        Returns uppercase token or None if no match.
        """
        label_lower = label.lower().strip()
        
        # Check aliases first
        if label_lower in self.label_aliases:
            return self.label_aliases[label_lower]
        
        # Try direct uppercase match
        label_upper = label.upper().replace(" ", "_")
        if label_upper in self.aac_map:
            return label_upper
        
        # Try substring match in aac_map keys
        for key in self.aac_map.keys():
            if label_lower in key.lower() or key.lower() in label_lower:
                return key.upper()
        
        # Try removing spaces and special chars
        normalized = re.sub(r'[^a-zA-Z0-9]', '', label).upper()
        if normalized in self.aac_map:
            return normalized
        
        return None
    
    def get_icon_path(self, word: str) -> str:
        """
        Get icon path for a word.
        Returns /acc/symbols/{filename}.svg or /acc/unknown.svg as fallback.
        """
        word_upper = word.upper()
        
        if word_upper in self.aac_map:
            filename = self.aac_map[word_upper]
            # Handle unknown.svg specially - it's in /acc/ not /acc/symbols/
            if filename == "unknown.svg":
                return "/acc/unknown.svg"
            # Always return the path - let the frontend handle 404s
            return f"/acc/symbols/{filename}"
        
        # Try lowercase
        word_lower = word.lower()
        if word_lower in self.aac_map:
            filename = self.aac_map[word_lower]
            if filename == "unknown.svg":
                return "/acc/unknown.svg"
            return f"/acc/symbols/{filename}"
        
        return "/acc/unknown.svg"
    
    def generate_suggested_sentence(self, detected_nouns: List[str]) -> Dict:
        """
        Generate suggested AAC sentence from detected nouns.
        
        Rules:
        - If noun is food-like: "I WANT <NOUN>"
        - Else: "I SEE <NOUN>"
        - Max 3-4 words for simplicity
        
        Returns:
        {
            "suggested_words": ["I", "WANT", "PIZZA"],
            "icons": ["/acc/symbols/i.svg", "/acc/symbols/want.svg", "/acc/symbols/pizza.svg"],
            "sentence": "I want pizza"
        }
        """
        if not detected_nouns:
            return {
                "suggested_words": ["I", "SEE", "NOTHING"],
                "icons": [self.get_icon_path("I"), self.get_icon_path("SEE"), self.get_icon_path("NOTHING")],
                "sentence": "I see nothing"
            }
        
        # Take first detected noun (highest confidence)
        primary_noun = detected_nouns[0].upper()
        
        # Check if it's food-like
        is_food = any(keyword in primary_noun.lower() for keyword in self.food_keywords)
        
        if is_food:
            suggested_words = ["I", "WANT", primary_noun]
            sentence = f"I want {primary_noun.lower()}"
        else:
            suggested_words = ["I", "SEE", primary_noun]
            sentence = f"I see {primary_noun.lower()}"
        
        # Get icon paths
        icons = [self.get_icon_path(word) for word in suggested_words]
        
        return {
            "suggested_words": suggested_words,
            "icons": icons,
            "sentence": sentence
        }
    
    def process_detections(self, detected_objects: List[Dict]) -> Dict:
        """
        Process YOLO detections into AAC format.
        
        Args:
            detected_objects: List of dicts with "name" and "confidence"
        
        Returns:
            {
                "detected": ["PIZZA", "PERSON"],
                "suggested_words": ["I", "WANT", "PIZZA"],
                "icons": [...],
                "sentence": "I want pizza"
            }
        """
        # Normalize detected labels to AAC words
        detected_nouns = []
        for obj in detected_objects[:3]:  # Top 3 objects
            normalized = self.normalize_detected_label(obj["name"])
            if normalized and normalized not in detected_nouns:
                detected_nouns.append(normalized)
        
        # Generate suggested sentence
        suggestion = self.generate_suggested_sentence(detected_nouns)
        
        return {
            "detected": detected_nouns,
            "suggested_words": suggestion["suggested_words"],
            "icons": suggestion["icons"],
            "sentence": suggestion["sentence"]
        }
