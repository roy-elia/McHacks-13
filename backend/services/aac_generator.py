"""
AAC (Augmentative and Alternative Communication) sentence generator.
Converts detected objects into simple AAC-style sentences with symbols.
"""
from typing import List, Dict
import re


class AACGenerator:
    def __init__(self):
        """
        Initialize AAC generator with symbol mappings and grammar rules.
        """
        # Emoji/symbol mappings for common objects and concepts
        self.object_symbols = {
            # Food items
            "cookie": "🍪", "cookies": "🍪",
            "apple": "🍎", "apples": "🍎",
            "banana": "🍌", "bananas": "🍌",
            "pizza": "🍕", "pizzas": "🍕",
            "cake": "🎂", "cakes": "🎂",
            "bread": "🍞", "breads": "🍞",
            "sandwich": "🥪", "sandwiches": "🥪",
            "hot dog": "🌭", "hot dogs": "🌭",
            "hamburger": "🍔", "hamburgers": "🍔",
            "orange": "🍊", "oranges": "🍊",
            "carrot": "🥕", "carrots": "🥕",
            "broccoli": "🥦", "broccolis": "🥦",
            
            # Animals
            "dog": "🐕", "dogs": "🐕",
            "cat": "🐈", "cats": "🐈",
            "bird": "🐦", "birds": "🐦",
            "horse": "🐴", "horses": "🐴",
            "cow": "🐄", "cows": "🐄",
            "sheep": "🐑", "sheep": "🐑",
            "bear": "🐻", "bears": "🐻",
            "elephant": "🐘", "elephants": "🐘",
            "zebra": "🦓", "zebras": "🦓",
            "giraffe": "🦒", "giraffes": "🦒",
            
            # Toys/Objects
            "ball": "⚽", "balls": "⚽",
            "toy": "🧸", "toys": "🧸",
            "book": "📚", "books": "📚",
            "car": "🚗", "cars": "🚗",
            "truck": "🚚", "trucks": "🚚",
            "bus": "🚌", "buses": "🚌",
            "bicycle": "🚲", "bicycles": "🚲",
            "airplane": "✈️", "airplanes": "✈️",
            "boat": "⛵", "boats": "⛵",
            
            # People
            "person": "🧍", "people": "🧍",
            "child": "👶", "children": "👶",
            "baby": "👶", "babies": "👶",
            
            # Common items
            "cup": "🥤", "cups": "🥤",
            "bottle": "🍼", "bottles": "🍼",
            "phone": "📱", "phones": "📱",
            "chair": "🪑", "chairs": "🪑",
            "table": "🪑", "tables": "🪑",
            "bed": "🛏️", "beds": "🛏️",
        }
        
        # Action/feeling symbols
        self.action_symbols = {
            "want": "❤️",
            "like": "👍",
            "see": "👁️",
            "eat": "🍽️",
            "play": "🎮",
            "go": "➡️",
            "stop": "🛑",
            "help": "🆘",
            "more": "➕",
            "yes": "✅",
            "no": "❌",
        }
        
        # Personal pronouns
        self.pronoun_symbols = {
            "i": "🧍",
            "me": "🧍",
            "my": "🧍",
            "you": "👤",
        }
    
    def generate_sentence(self, detected_objects: List[Dict]) -> Dict:
        """
        Generate AAC sentence from detected objects.
        
        Rules:
        - Max 5 words
        - Telegraphic style (simple grammar)
        - Start with "I want" or "I see" pattern
        - Include object symbols
        
        Args:
            detected_objects: List of dicts with "name" and "confidence"
        
        Returns:
            Dict with "sentence", "symbols", and "confidence"
        """
        if not detected_objects:
            return {
                "sentence": "I see nothing",
                "symbols": ["🧍", "👁️", "❌"],
                "confidence": 0.0
            }
        
        # Get primary object (highest confidence)
        primary_obj = detected_objects[0]
        obj_name = primary_obj["name"].lower()
        
        # Choose sentence pattern based on object type
        # Food items -> "I want [object]"
        # Animals/toys -> "I see [object]"
        # Toys -> "I want [object]"
        
        food_keywords = ["cookie", "apple", "banana", "pizza", "cake", "bread", 
                        "sandwich", "hot dog", "hamburger", "orange", "carrot", 
                        "broccoli", "cup", "bottle"]
        
        if any(keyword in obj_name for keyword in food_keywords):
            sentence = f"I want {obj_name}"
            symbols = [
                self.pronoun_symbols.get("i", "🧍"),
                self.action_symbols.get("want", "❤️"),
                self.object_symbols.get(obj_name, "📦")
            ]
        else:
            sentence = f"I see {obj_name}"
            symbols = [
                self.pronoun_symbols.get("i", "🧍"),
                self.action_symbols.get("see", "👁️"),
                self.object_symbols.get(obj_name, "📦")
            ]
        
        # Handle multiple objects (if detected)
        if len(detected_objects) > 1:
            # Add "and" for second object if space allows
            if len(sentence.split()) < 4:
                second_obj = detected_objects[1]["name"].lower()
                sentence = f"{sentence} and {second_obj}"
                symbols.append("➕")
                symbols.append(self.object_symbols.get(second_obj, "📦"))
        
        # Ensure max 5 words
        words = sentence.split()
        if len(words) > 5:
            words = words[:5]
            sentence = " ".join(words)
            # Trim symbols to match
            symbols = symbols[:5]
        
        return {
            "sentence": sentence,
            "symbols": symbols,
            "confidence": primary_obj.get("confidence", 0.8)
        }
    
    def text_to_aac(self, text: str) -> Dict:
        """
        Convert spoken/typed text to AAC format.
        Simple keyword extraction for demo purposes.
        
        Args:
            text: Input text (e.g., "I want a cookie")
        
        Returns:
            Dict with "sentence" and "symbols"
        """
        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        
        symbols = []
        sentence_parts = []
        
        # Extract pronouns, actions, and objects
        for word in words:
            if word in self.pronoun_symbols:
                symbols.append(self.pronoun_symbols[word])
                sentence_parts.append(word)
            elif word in self.action_symbols:
                symbols.append(self.action_symbols[word])
                sentence_parts.append(word)
            elif word in self.object_symbols:
                symbols.append(self.object_symbols[word])
                sentence_parts.append(word)
        
        # If no matches, try to find partial matches
        if not symbols:
            for word in words:
                for key, symbol in self.object_symbols.items():
                    if key in word or word in key:
                        symbols.append(symbol)
                        sentence_parts.append(key)
                        break
        
        # Generate simple sentence
        if sentence_parts:
            sentence = " ".join(sentence_parts[:5])  # Max 5 words
        else:
            sentence = text[:30]  # Fallback: truncate original text
            symbols = ["📝"]
        
        return {
            "sentence": sentence,
            "symbols": symbols[:5]  # Max 5 symbols
        }
