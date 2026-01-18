"""
Quick script to verify symbol mappings and check which files exist.
Run this to diagnose symbol loading issues.
"""
import json
from pathlib import Path

def check_symbols():
    """Check which symbols exist and which don't."""
    
    # Load mapping
    with open("aac_map.json", 'r') as f:
        aac_map = json.load(f)
    
    # Check symbol directory
    symbol_dir = Path("../frontend/public/acc/symbols")
    unknown_path = Path("../frontend/public/acc/unknown.svg")
    
    print("🔍 Checking symbol mappings...\n")
    print(f"Symbol directory: {symbol_dir}")
    print(f"Symbol directory exists: {symbol_dir.exists()}\n")
    
    if not symbol_dir.exists():
        print("❌ Symbol directory not found!")
        return
    
    existing = []
    missing = []
    using_unknown = []
    
    for word, filename in aac_map.items():
        symbol_path = symbol_dir / filename
        
        if filename == "unknown.svg":
            using_unknown.append(word)
            if unknown_path.exists():
                print(f"⚠️  {word:8} -> {filename:40} (using unknown.svg)")
            else:
                print(f"❌ {word:8} -> {filename:40} (unknown.svg NOT FOUND!)")
        elif symbol_path.exists():
            existing.append((word, filename))
            print(f"✅ {word:8} -> {filename:40} (exists)")
        else:
            missing.append((word, filename))
            print(f"❌ {word:8} -> {filename:40} (FILE NOT FOUND)")
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  ✅ Existing symbols: {len(existing)}")
    print(f"  ⚠️  Using unknown.svg: {len(using_unknown)}")
    print(f"  ❌ Missing files: {len(missing)}")
    
    if using_unknown:
        print(f"\n⚠️  Words using unknown.svg (need better symbols):")
        for word in using_unknown:
            print(f"   - {word}")
    
    if missing:
        print(f"\n❌ Files referenced but not found:")
        for word, filename in missing:
            print(f"   - {word}: {filename}")

if __name__ == "__main__":
    check_symbols()
