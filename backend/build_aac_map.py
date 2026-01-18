"""
Build AAC symbol mapping by scanning frontend/public/acc/symbols/*.svg files.
Maps core words and common verbs to best-matching SVG filenames.
"""
import json
import os
from pathlib import Path
from typing import Dict, Optional
import re


def normalize_filename(filename: str) -> str:
    """Remove .svg extension and normalize."""
    return filename.replace(".svg", "").lower()


def find_best_match(word: str, svg_files: list) -> Optional[str]:
    """
    Find best matching SVG file for a word.
    
    Priority:
    1. Exact match (word.lower() == filename_without_ext)
    2. Word with action suffix (word_,_to.svg or word_to.svg)
    3. Word at start of filename (word_...)
    4. Word appears in filename (but not as part of another word)
    5. Substring match (avoid single letters)
    """
    word_lower = word.lower()
    word_clean = re.sub(r'[^a-zA-Z0-9]', '', word_lower)
    
    # Skip single-letter matches (they're usually not good)
    skip_single_letter = len(word_clean) == 1
    
    # Priority 1: Exact match
    for svg_file in svg_files:
        filename_norm = normalize_filename(svg_file)
        if filename_norm == word_lower:
            return svg_file
    
    # Priority 2: Action words with _,to or _to suffix (e.g., "go_,_to.svg", "want_to.svg")
    action_patterns = [
        f"{word_lower}_,_to",
        f"{word_lower}_to",
        f"{word_lower}_,_to_",
        f"{word_lower}_1_,_to",  # For numbered variants like "eat_1_,_to.svg"
        f"{word_lower}_2_,_to",
    ]
    for pattern in action_patterns:
        for svg_file in svg_files:
            filename_norm = normalize_filename(svg_file)
            if filename_norm.startswith(pattern) or filename_norm == pattern:
                return svg_file
    
    # Priority 3: Word at start of filename (word_...)
    for svg_file in svg_files:
        filename_norm = normalize_filename(svg_file)
        if filename_norm.startswith(word_lower + "_") or filename_norm.startswith(word_lower + " "):
            # Skip if it's just a single letter match
            if skip_single_letter and len(filename_norm) <= 2:
                continue
            return svg_file
    
    # Priority 4: Word appears in filename (but not as part of another word)
    word_boundary_pattern = re.compile(r'\b' + re.escape(word_lower) + r'\b', re.IGNORECASE)
    candidates = []
    for svg_file in svg_files:
        filename_norm = normalize_filename(svg_file)
        if word_boundary_pattern.search(filename_norm):
            # Skip single-letter matches
            if skip_single_letter and len(filename_norm) <= 2:
                continue
            candidates.append(svg_file)
    
    # Prefer shorter, more specific matches
    if candidates:
        # Sort by: exact word match first, then by length (shorter = better)
        candidates.sort(key=lambda x: (
            0 if normalize_filename(x).startswith(word_lower) else 1,
            len(x)
        ))
        return candidates[0]
    
    # Priority 5: Substring match (fallback, but avoid single letters)
    if not skip_single_letter:
        for svg_file in svg_files:
            filename_norm = normalize_filename(svg_file)
            filename_clean = re.sub(r'[^a-zA-Z0-9]', '', filename_norm)
            
            if word_lower in filename_norm or filename_norm in word_lower:
                return svg_file
            if word_clean in filename_clean or filename_clean in word_clean:
                return svg_file
    
    return None


def build_aac_map(core_words_path: str = "core_words.json",
                  svg_dir: str = "../frontend/public/acc/symbols",
                  output_path: str = "aac_map.json",
                  manual_map_path: str = "manual_symbol_map.json") -> Dict:
    """
    Build AAC symbol mapping from SVG files.
    
    Returns mapping dict: { "WORD": "filename.svg" }
    """
    # Load core words
    with open(core_words_path, 'r') as f:
        core_words = json.load(f)
    
    # Load manual overrides if they exist
    manual_map = {}
    if Path(manual_map_path).exists():
        with open(manual_map_path, 'r') as f:
            manual_map = json.load(f)
        print(f"📝 Loaded {len(manual_map)} manual symbol overrides")
    
    # Get all SVG files
    svg_path = Path(svg_dir)
    if not svg_path.exists():
        print(f"⚠️  Warning: SVG directory not found: {svg_dir}")
        print("   Creating empty mapping...")
        return {}
    
    svg_files = [f.name for f in svg_path.glob("*.svg")]
    print(f"📁 Found {len(svg_files)} SVG files")
    
    # Build mapping
    aac_map = {}
    matched_count = 0
    
    # Map core words
    for word in core_words:
        word_upper = word.upper()
        
        # Check manual override first
        if word_upper in manual_map:
            override_file = manual_map[word_upper]
            # Verify the file exists
            if (svg_path / override_file).exists():
                aac_map[word_upper] = override_file
                matched_count += 1
                print(f"  ✓ {word_upper} -> {override_file} (manual override)")
                continue
            else:
                print(f"  ⚠️  {word_upper} -> manual override '{override_file}' not found, trying auto-match")
        
        # Auto-match
        match = find_best_match(word, svg_files)
        if match:
            aac_map[word_upper] = match
            matched_count += 1
            print(f"  ✓ {word_upper} -> {match}")
        else:
            print(f"  ✗ {word_upper} -> no match")
    
    # Add common verbs/actions that might be in SVGs
    common_verbs = ["WANT", "SEE", "LOOK", "GO", "STOP", "EAT", "DRINK", 
                   "PLAY", "HELP", "LIKE", "FEEL", "OPEN", "CLOSE", "COME"]
    
    for verb in common_verbs:
        if verb not in aac_map:
            match = find_best_match(verb, svg_files)
            if match:
                aac_map[verb] = match
                matched_count += 1
                print(f"  ✓ {verb} -> {match}")
    
    # Add common nouns that might be detected
    common_nouns = ["BALL", "BOOK", "CAR", "DOG", "CAT", "PHONE", "CUP", 
                   "BOTTLE", "TOY", "CHAIR", "BED", "PIZZA", "APPLE", "BANANA"]
    
    for noun in common_nouns:
        if noun not in aac_map:
            match = find_best_match(noun, svg_files)
            if match:
                aac_map[noun] = match
                matched_count += 1
                print(f"  ✓ {noun} -> {match}")
    
    print(f"\n✅ Mapped {matched_count} words to symbols")
    print(f"📝 Total mappings: {len(aac_map)}")
    
    # Save mapping
    with open(output_path, 'w') as f:
        json.dump(aac_map, f, indent=2)
    
    print(f"💾 Saved mapping to {output_path}")
    
    return aac_map


if __name__ == "__main__":
    import sys
    from pathlib import Path
    
    # Get absolute path to SVG directory
    script_dir = Path(__file__).parent
    default_svg_dir = script_dir.parent / "frontend" / "public" / "acc" / "symbols"
    
    # Allow custom paths via command line
    if len(sys.argv) > 1:
        svg_dir = sys.argv[1]
    else:
        svg_dir = str(default_svg_dir)
    
    print(f"🔍 Scanning SVG directory: {svg_dir}")
    build_aac_map(svg_dir=svg_dir)
