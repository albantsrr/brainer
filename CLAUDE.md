# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Brainer

A private course site that extracts structured courses from books (PDF/EPUB) and serves them via a REST API.

## Architecture Overview

**Three-component system:**
1. **Extraction scripts** (Python) — Parse EPUB books into structured course data
2. **Backend API** (FastAPI + SQLAlchemy) — REST API with SQLite database
3. **Frontend** (Next.js 16 + TypeScript) — SSR app with TanStack Query + shadcn/ui

**Data flow:** Books → extraction scripts → SQLite DB ← REST API ← Frontend

**Stack:** Python + FastAPI + SQLAlchemy + SQLite | Next.js 16 + TypeScript + TanStack Query + Tailwind

## Quick Start

**Local development (recommended):**

1. **Setup Python environment:**
```bash
python -m venv brainer_venv
source brainer_venv/bin/activate
pip install -r requirements.txt
```

2. **Run backend (FastAPI):**
```bash
source brainer_venv/bin/activate
uvicorn api.main:app --reload --host 0.0.0.0    # http://localhost:8000
```

3. **Run frontend (Next.js):**
```bash
cd frontend
npm install
npm run dev                                      # http://localhost:3000
npm run build                                    # Production build
npm run start                                    # Production server
npm run lint                                     # Run ESLint
```

**Docker deployment:**
```bash
# Local development with Docker
docker-compose up -d

# Production deployment (see /deploy-docker skill)
./scripts/build_images.sh      # Build Docker images
./scripts/push_images.sh       # Push to registry
./scripts/deploy.sh            # Deploy to VPS
```

**Notes:**
- WSL: Use `--host 0.0.0.0` for backend to be accessible from Windows browsers
- Local dev uses SQLite (`brainer.db`), Docker uses PostgreSQL
- API docs available at: http://localhost:8000/docs (Swagger UI)

## Skills

**Use skills for implementation details.** Skills contain specialized context and workflows:

- **`/reformat-epub`** — Analyze and normalize EPUB books into Brainer-compatible structure
- **`/import-course`** — Import EPUB book structure into database
- **`/create-chapters <num>`** — Generate pedagogical content for a chapter
- **`/create-exercise`** — Create targeted exercises for chapters
- **`/api-endpoint`** — Create/modify FastAPI endpoints (use for backend work)
- **`/frontend-component`** — Create/modify UI components (use for frontend work)
- **`/skill-creator`** — Create new skills

**Workflow for adding a book:**
1. Place EPUB in `books/` and extract it
2. **`/reformat-epub`** — normalize EPUB structure if needed (malformed EPUBs, split files, etc.)
3. **`/import-course`** — creates course/parts/chapters structure in database
4. **`/create-chapters 1`**, **`/create-chapters 2`**, etc. — fills content + exercises for each chapter

## Database Schema

**Four main tables:** Course → Part → Chapter → Exercise

- **Course**: slug (unique), title, description, image
- **Part**: course_id, order, title (for organizing chapters)
- **Chapter**: course_id, part_id, order, slug, content (HTML), image
- **Exercise**: chapter_id, order, type (multiple_choice|code|true_false), content (JSON)

**API prefix:** All endpoints at `/api/*` — see [api/routers/](api/routers/) for implementation details.

**For API changes:** Use `/api-endpoint` skill (handles routing, validation, DB operations).

## Book Data Layout

**Structure:** `books/<Book Title>/OEBPS/`
- `toc.ncx` — Table of contents (parsed by `/import-course`)
- `ch01.xhtml`, `ch02.xhtml`, etc. — Chapter content
- `part01.xhtml`, etc. — Part dividers
- `Images/` — Book figures/diagrams

## Key Conventions

**Backend:**
- Slugs are kebab-case (courses, chapters)
- Order fields start at 1, enforced by unique constraints
- Cascading deletes enabled (course → parts → chapters → exercises)
- Exercise types: `multiple_choice`, `code`, `true_false`
- **Use `/api-endpoint` skill** for backend implementation details

**Frontend:**
- Regenerate types after API changes: `cd frontend && npm run generate:types`
- Use TanStack Query hooks from `lib/api/queries/` — never fetch directly
- Components: `components/ui/` (primitives), `components/{domain}/` (features)
- Client components need `'use client'` directive
- **Use `/frontend-component` skill** for UI implementation details

## Current Status

**Books in `books/`:**
- Fundamentals of Data Engineering (EPUB, unpacked)
- Computer Systems: A Programmer's Perspective (EPUB, unpacked + normalized)

**What works:**
- Full-stack app: extraction scripts, FastAPI backend, Next.js frontend
- Skills for automation: `/reformat-epub`, `/import-course`, `/create-chapters`, `/create-exercise`, `/api-endpoint`, `/frontend-component`
- Database auto-created on startup (`brainer.db`)
- Type-safe frontend with auto-generated API types
- EPUB normalization for malformed/non-standard books

**Roadmap:**
- Batch chapter processing (currently one-at-a-time via `/create-chapters`)
- Auto exercise generation enhancements
