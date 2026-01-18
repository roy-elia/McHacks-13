# Troubleshooting Guide

## "Failed to fetch" Error

If you see "Failed to fetch" when uploading a photo, it usually means the backend server isn't running or isn't reachable.

### Quick Fix

1. **Check if backend is running:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

2. **Verify backend is accessible:**
   - Open http://localhost:8000/health in your browser
   - Should return: `{"ok": true}`

3. **Check frontend is using correct URL:**
   - Default: `http://localhost:8000`
   - Can override with `NEXT_PUBLIC_API_URL` environment variable

### Common Issues

#### Backend Not Running
- **Symptom**: "Failed to fetch" or "Cannot connect to backend"
- **Solution**: Start the backend server (see Quick Fix above)

#### Wrong Port
- **Symptom**: Backend running on different port
- **Solution**: 
  - Check what port backend is using
  - Set `NEXT_PUBLIC_API_URL=http://localhost:YOUR_PORT` in `.env.local`

#### CORS Errors
- **Symptom**: Browser console shows CORS errors
- **Solution**: Backend CORS is configured for `localhost:3000`. Make sure frontend runs on that port.

#### Backend Error
- **Symptom**: Server error message in response
- **Solution**: Check backend terminal for error logs

### Testing Backend Manually

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test image upload (replace image.jpg with your file)
curl -X POST http://localhost:8000/analyze-image \
  -F "file=@image.jpg"
```

### Environment Variables

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then restart the Next.js dev server.
