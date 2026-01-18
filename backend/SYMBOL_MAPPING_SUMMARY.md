# Symbol Mapping Summary

## ✅ Status: All Core Words Mapped!

The `build_aac_map.py` script has successfully mapped all 41 core words to SVG symbols from `frontend/public/acc/symbols/`.

## How It Works

1. **Automatic Matching**: The script scans all SVG files and matches them to core words using:
   - Exact filename matches (e.g., `I.svg` → "I")
   - Action word patterns (e.g., `go_,_to.svg` → "GO")
   - Word boundary matching
   - Substring matching (as fallback)

2. **Mapping File**: Results are saved to `aac_map.json` which maps:
   ```json
   {
     "I": "I.svg",
     "GO": "go_,_to.svg",
     "WANT": "want_,_to.svg",
     ...
   }
   ```

3. **Backend Usage**: `aac_logic.py` reads this mapping and returns icon paths like:
   - `/acc/symbols/I.svg`
   - `/acc/symbols/go_,_to.svg`
   - `/acc/symbols/want_,_to.svg`

4. **Frontend Display**: Components fetch these paths and display the SVG images.

## View Your Mappings

To see all mappings:
```bash
cd backend
cat aac_map.json | python -m json.tool
```

To verify which symbols are found:
```bash
python verify_symbols.py
```

## Rebuilding Mappings

If you add new SVG files or want to rematch:
```bash
cd backend
python build_aac_map.py
```

## Notes

- Some words may have less-than-perfect matches (e.g., single letters)
- Words without matches will use `/acc/unknown.svg` as fallback
- The mapping prioritizes exact matches and action word patterns (`word_,_to.svg`)
