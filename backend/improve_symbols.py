"""
Script to find better symbol matches for core words that currently have poor matches.
"""
import json
from pathlib import Path
from build_aac_map import find_best_match

def find_better_symbols():
    """Find better symbol matches for words with poor current matches."""
    
    # Words that need better symbols (currently have single letters or poor matches)
    problem_words = ["YOU", "ME", "STOP", "SEE", "LIKE", "FEEL", "BIG", "YES", "NO", "PLEASE", "THAT", "NOT", "HERE"]
    
    # Load current mapping
    with open("aac_map.json", 'r') as f:
        current_map = json.load(f)
    
    # Get all SVG files
    svg_dir = Path("../frontend/public/acc/symbols")
    svg_files = [f.name for f in svg_dir.glob("*.svg")]
    
    print("🔍 Searching for better symbol matches...\n")
    
    improvements = {}
    
    for word in problem_words:
        current = current_map.get(word, "NOT FOUND")
        print(f"{word:8} Current: {current}")
        
        # Try to find better match
        better = find_best_match(word.lower(), svg_files)
        
        if better and better != current:
            print(f"         Better: {better}")
            improvements[word] = better
        else:
            print(f"         No better match found")
        print()
    
    if improvements:
        print(f"✅ Found {len(improvements)} potential improvements")
        print("\nSuggested manual overrides:")
        print(json.dumps(improvements, indent=2))
        
        # Update the mapping
        current_map.update(improvements)
        with open("aac_map.json", 'w') as f:
            json.dump(current_map, f, indent=2)
        print(f"\n💾 Updated aac_map.json")
    else:
        print("⚠️  No better matches found")

if __name__ == "__main__":
    find_better_symbols()
