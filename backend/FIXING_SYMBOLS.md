# Fixing Missing Symbol Placeholders

## Problem
Many core words are showing placeholder question marks instead of actual AAC symbols because:
1. Some symbols don't exist in the library (e.g., exact matches for YOU, ME, STOP)
2. Some have poor matches (single letters like O.svg, L.svg)
3. The mapping needs better symbol files

## Solution Applied

I've updated `aac_map.json` to use `unknown.svg` for words without good symbol matches. This ensures:
- ✅ Consistent placeholder display instead of random letters
- ✅ All words have a valid path (won't cause 404 errors)
- ✅ You can easily identify which words need better symbols

## Words Currently Using unknown.svg

These words need better symbol files added to `frontend/public/acc/symbols/`:
- YOU
- ME  
- STOP
- LIKE
- FEEL
- PLEASE
- THAT
- NOT
- BOTTLE

## How to Add Better Symbols

1. **Find or create better SVG symbols** for the words above
2. **Name them appropriately** (e.g., `you.svg`, `me.svg`, `stop.svg`)
3. **Place them in** `frontend/public/acc/symbols/`
4. **Update aac_map.json**:
   ```json
   {
     "YOU": "you.svg",
     "ME": "me.svg",
     "STOP": "stop.svg"
   }
   ```
5. **Restart the backend** to load the new mapping

## Current Status

✅ **Working symbols** (16 words): I, GO, LOOK, SEE, OPEN, CLOSE, EAT, DRINK, HELP, WANT, NEED, COME, PLAY, MORE, LITTLE, GOOD, BAD, HAPPY, SAD, IN, OUT, UP, DOWN, ON, OFF, WHAT, WHERE, YES, NO, THIS, NOW, HERE

⚠️ **Using unknown.svg** (9 words): YOU, ME, STOP, LIKE, FEEL, PLEASE, THAT, NOT, BOTTLE

## Quick Fix

If you want to use the best available matches (even if not perfect), you can manually edit `aac_map.json` to use symbols that exist but aren't perfect matches. For example:
- `"YOU": "young.svg"` (if that symbol exists)
- `"STOP": "backstop.svg"` (if that symbol exists)

The current setup will show `unknown.svg` for words without good matches, which is better than showing random letters.
