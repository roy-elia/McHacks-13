# Quick Start Guide

## Start the Backend

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (if not already created):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   You should see:
   ```
   🚀 Initializing services...
   🔄 Loading YOLOv8 model...
   ✅ YOLOv8 model loaded successfully
   ✅ Services ready
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

## Start the Frontend

1. **Open a new terminal and navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the dev server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   ```

## Verify Everything Works

1. **Check backend health:**
   - Open http://localhost:8000/health in browser
   - Should return: `{"ok": true}`

2. **Check frontend:**
   - Open http://localhost:3000
   - Should see the AACTION interface

3. **Test image upload:**
   - Click "Upload Photo"
   - Select an image file
   - Should see detected objects in "Things I See" section

## Troubleshooting

If you see "Failed to fetch" or "Cannot connect to backend":
- Make sure backend is running on port 8000
- Check terminal for backend errors
- See `TROUBLESHOOTING.md` for more help
