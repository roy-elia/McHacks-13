"""
Verify which core words have matching symbols and which are missing.
Helps identify which symbols need to be found or created.
"""
import json
from pathlib import Path
from build_aac_map import find_best_match, normalize_filename

def verify_core_word_symbols():
    """Check which core words have symbols and which don't."""
    
    # Load core words
    with open("core_words.json", 'r') as f:
        core_words = json.load(f)
    
    # Get all SVG files
    svg_dir = Path("../frontend/public/acc/symbols")
    if not svg_dir.exists():
        print(f"❌ SVG directory not found: {svg_dir}")
        return
    
    svg_files = [f.name for f in svg_dir.glob("*.svg")]
    print(f"📁 Found {len(svg_files)} SVG files\n")
    
    # Check each core word
    found = []
    missing = []
    
    print("Checking core words for symbol matches...\n")
    
    for word in core_words:
        word_upper = word.upper()
        match = find_best_match(word, svg_files)
        
        if match:
            found.append((word_upper, match))
            print(f"✅ {word_upper:8} -> {match}")
        else:
            missing.append(word_upper)
            print(f"❌ {word_upper:8} -> NO MATCH")
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  ✅ Found: {len(found)}/{len(core_words)}")
    print(f"  ❌ Missing: {len(missing)}/{len(core_words)}")
    
    if missing:
        print(f"\n⚠️  Words without symbols:")
        for word in missing:
            print(f"   - {word}")
        print(f"\n💡 These will use /acc/unknown.svg as fallback")
    
    return found, missing

if __name__ == "__main__":
    verify_core_word_symbols()
