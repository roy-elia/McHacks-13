"""
AAC Symbol Matcher: Maps YOLO detection labels to AAC SVG filenames.
Implements filename matching logic to find the best symbol for detected objects.
"""
import os
import re
from pathlib import Path
from typing import Optional, List, Dict


class AACMatcher:
    """
    Matches YOLO detection labels to AAC SVG symbol filenames.
    """
    
    def __init__(self, symbols_dir: str = "../frontend/public/acc/symbols"):
        """
        Initialize matcher with path to symbols directory.
        
        Args:
            symbols_dir: Path to directory containing SVG symbol files
        """
        # Resolve to absolute path
        script_dir = Path(__file__).parent
        symbols_path = Path(script_dir) / symbols_dir
        self.symbols_dir = symbols_path.resolve()
        
        # Cache of available SVG filenames (without .svg extension)
        self._svg_cache = None
        self._load_symbols()
        
        # Common YOLO label aliases
        self.label_aliases = {
            "sports ball": "ball",
            "tennis ball": "ball",
            "soccer ball": "ball",
            "basketball": "ball",
            "baseball": "ball",
            "cell phone": "phone",
            "mobile phone": "phone",
            "teddy bear": "toy",
            "hot dog": "hotdog",
            "dining table": "table",
            "potted plant": "plant",
            "traffic light": "light",
            "stop sign": "sign",
            "parking meter": "meter",
            "fire hydrant": "hydrant",
        }
    
    def _load_symbols(self):
        """Load list of available SVG filenames."""
        if not self.symbols_dir.exists():
            print(f"⚠️  Warning: Symbols directory not found: {self.symbols_dir}")
            self._svg_cache = []
            return
        
        svg_files = list(self.symbols_dir.glob("*.svg"))
        # Store filenames without extension, normalized to lowercase
        self._svg_cache = [f.stem.lower() for f in svg_files]
        print(f"📁 Loaded {len(self._svg_cache)} symbol files from {self.symbols_dir}")
    
    def normalize_label(self, label: str) -> str:
        """
        Normalize YOLO label using aliases.
        
        Args:
            label: Raw YOLO detection label (e.g., "sports ball")
        
        Returns:
            Normalized label (e.g., "ball")
        """
        label_lower = label.lower().strip()
        
        # Check aliases first
        if label_lower in self.label_aliases:
            return self.label_aliases[label_lower]
        
        return label_lower
    
    def find_best_match(self, label: str) -> Optional[str]:
        """
        Find best matching SVG filename for a YOLO label.
        
        Matching priority:
        1. Exact match (normalized label == filename stem)
        2. Underscore match (spaces -> underscores)
        3. Token match (all label tokens appear in filename)
        4. Substring match (label appears in filename)
        5. None (use unknown.svg)
        
        Args:
            label: YOLO detection label (e.g., "sports ball")
        
        Returns:
            SVG filename (e.g., "ball.svg") or None
        """
        if not self._svg_cache:
            return None
        
        normalized = self.normalize_label(label)
        
        # Priority 1: Exact match
        if normalized in self._svg_cache:
            return f"{normalized}.svg"
        
        # Priority 2: Underscore match (spaces -> underscores)
        underscore_version = normalized.replace(" ", "_")
        if underscore_version in self._svg_cache:
            return f"{underscore_version}.svg"
        
        # Priority 3: Token match
        # Split label into tokens
        label_tokens = set(re.findall(r'\w+', normalized))
        if not label_tokens:
            return None
        
        # Find files where all tokens appear
        token_matches = []
        for filename in self._svg_cache:
            filename_tokens = set(re.findall(r'\w+', filename))
            # Check if all label tokens appear in filename
            if label_tokens.issubset(filename_tokens):
                # Prefer shorter, more specific matches
                token_matches.append((len(filename), filename))
        
        if token_matches:
            # Sort by length (shorter = better), then alphabetically
            token_matches.sort()
            return f"{token_matches[0][1]}.svg"
        
        # Priority 4: Substring match
        # Find files containing the label as substring
        substring_matches = []
        for filename in self._svg_cache:
            if normalized in filename or filename in normalized:
                # Prefer matches that start with the label
                priority = 0 if filename.startswith(normalized) else 1
                substring_matches.append((priority, len(filename), filename))
        
        if substring_matches:
            substring_matches.sort()
            return f"{substring_matches[0][2]}.svg"
        
        # No match found
        return None
    
    def match_detections(self, detections: List[Dict]) -> List[Dict]:
        """
        Match multiple YOLO detections to AAC symbols.
        
        Args:
            detections: List of dicts with "name" and optionally "confidence"
        
        Returns:
            List of dicts with "word" (uppercase), "icon" (path), and "confidence"
        """
        matched = []
        seen_words = set()
        
        for det in detections:
            label = det.get("name", "")
            confidence = det.get("confidence", 0.0)
            
            # Find best matching symbol
            symbol_file = self.find_best_match(label)
            
            # Normalize word to uppercase for display
            word = self.normalize_label(label).upper().replace("_", " ")
            
            # Use matched symbol or fallback
            if symbol_file:
                icon_path = f"/acc/symbols/{symbol_file}"
            else:
                icon_path = "/acc/unknown.svg"
            
            # Avoid duplicates
            if word not in seen_words:
                matched.append({
                    "word": word,
                    "icon": icon_path,
                    "confidence": confidence
                })
                seen_words.add(word)
        
        return matched
