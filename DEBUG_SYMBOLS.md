# Debugging Symbol Loading Issues

## Quick Diagnostic Steps

### 1. Check Backend is Running
```bash
curl http://localhost:8000/api/core-words
```

Should return JSON with `icons` object mapping words to paths.

### 2. Check Browser Console
Open browser DevTools (F12) and check:
- **Console tab**: Look for errors like "Failed to load symbol" or "404 Not Found"
- **Network tab**: Check if requests to `/acc/symbols/*.svg` are returning 200 or 404

### 3. Verify Symbol Files Exist
```bash
cd frontend/public/acc/symbols
ls -1 I.svg go_,_to.svg look_,_to.svg eat_,_to.svg
```

### 4. Test Direct Symbol Access
In browser, try accessing:
- `http://localhost:3000/acc/symbols/I.svg`
- `http://localhost:3000/acc/symbols/go_,_to.svg`

Should display the SVG image.

## Common Issues

### Issue: All symbols show question marks
**Cause**: Backend not running or API call failing
**Fix**: 
1. Start backend: `cd backend && python main.py`
2. Check CORS settings in `main.py`
3. Check browser console for fetch errors

### Issue: Some symbols work, others don't
**Cause**: Symbol files missing or wrong paths
**Fix**:
1. Check `aac_map.json` has correct filenames
2. Verify files exist in `frontend/public/acc/symbols/`
3. Check browser Network tab for 404 errors

### Issue: Backend returns paths but frontend can't load
**Cause**: Path construction issue
**Fix**:
- Paths should be: `/acc/symbols/filename.svg`
- Not: `acc/symbols/filename.svg` (missing leading slash)
- Not: `/aac/symbols/filename.svg` (wrong directory name)

## Testing Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] `aac_map.json` exists in backend/
- [ ] Symbol files exist in `frontend/public/acc/symbols/`
- [ ] `unknown.svg` exists in `frontend/public/acc/`
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows successful SVG loads (200 status)
- [ ] API endpoint `/api/core-words` returns correct paths
