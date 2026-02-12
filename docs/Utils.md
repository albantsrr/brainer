# Utils - Setup & Launch Guide

## Prerequisites

- Python 3.10+
- Node.js 18+
- pip and npm

## Initial Setup

### 1. Backend Setup

```bash
# Create and activate virtual environment
python -m venv brainer_venv
source brainer_venv/bin/activate  # Linux/Mac
# brainer_venv\Scripts\activate   # Windows

# Install all dependencies (extraction + API)
pip install -r requirements.txt
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Environment Variables

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the Project

### Option 1: Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
source brainer_venv/bin/activate
uvicorn api.main:app --reload --host 0.0.0.0
```
→ Backend runs on http://localhost:8000
→ API docs: http://localhost:8000/docs
→ **WSL users:** `--host 0.0.0.0` is required to access from Windows browser

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
→ Frontend runs on http://localhost:3000

### Option 2: Production Build

```bash
# Backend
source brainer_venv/bin/activate
uvicorn api.main:app --host 0.0.0.0 --port 8000  # 0.0.0.0 required for WSL

# Frontend (separate terminal)
cd frontend
npm run build
npm start
```

## Common Operations

### Generate TypeScript Types
```bash
# Backend must be running first
cd frontend
npm run generate:types
```

### Parse a New Book
```bash
source brainer_venv/bin/activate
python .claude/skills/import-course/scripts/parse_toc.py "books/Book Title/toc.ncx"
```

### Clean Book Files
```bash
# Dry run (list files)
python .claude/skills/reformat-epub/scripts/clean_ebook_data.py "books/Book Title/OEBPS"

# Actually delete
python .claude/skills/reformat-epub/scripts/clean_ebook_data.py "books/Book Title/OEBPS" --delete
```

## Database

SQLite database is created automatically at `brainer.db` on first run.

To reset: `rm brainer.db` and restart the backend.

## Troubleshooting

**"Address already in use" error:**
```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process (replace PID with actual process ID)
kill <PID>

# Or kill all uvicorn processes
pkill -f uvicorn
```

**Backend won't start (ModuleNotFoundError):**
- Make sure you run `uvicorn api.main:app` from **project root**, not from `api/` folder
- Verify venv is activated: `which python` should show path with `brainer_venv`

**Frontend can't reach backend:**
- Check backend is running on port 8000: `curl http://localhost:8000/api/courses`
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

**TypeScript errors:**
- Run `npm run generate:types` after backend changes
- Restart frontend dev server

**CORS errors:**
- Backend has CORS enabled for all origins in development
- Check browser console for specific errors
