# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Brainer

A private course site that extracts structured courses from books (PDF/EPUB) and serves them via a REST API.

## Architecture Overview

**Three-component system:**
1. **Extraction scripts** (Python) — Parse EPUB books into structured course data
2. **Backend API** (FastAPI + SQLAlchemy) — REST API with SQLite/PostgreSQL
3. **Frontend** (Next.js 16 + TypeScript) — App Router SSR app with TanStack Query + shadcn/ui

**Data flow:** Books → extraction scripts → DB ← REST API ← Frontend

**Stack:** Python + FastAPI + SQLAlchemy | Next.js 16 + TypeScript + TanStack Query + Tailwind v4

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
npm run lint                                     # Run ESLint
```

4. **Regenerate frontend API types** (after any backend schema change):
```bash
cd frontend && npm run generate:types            # Reads from http://localhost:8000/openapi.json
```

5. **Migrate SQLite → PostgreSQL** (for production cutover):
```bash
python scripts/migrate_db.py --sqlite-path brainer.db --postgres-url <URL>
```

**Docker deployment:**
```bash
docker-compose up -d                             # Local dev with Docker
./scripts/build_images.sh && ./scripts/push_images.sh && ./scripts/deploy.sh  # Production
```

**Environment variables:**
- `DATABASE_URL` — defaults to `sqlite:///./brainer.db`, set to PostgreSQL URL for production
- `SECRET_KEY` — JWT signing key, defaults to dev key
- `NEXT_PUBLIC_API_URL` — frontend API base URL, defaults to `http://localhost:8000`
- `BRAINER_TOKEN` — stored in `.env`, used by skills for authenticated API calls

**Notes:**
- WSL: Use `--host 0.0.0.0` for backend to be accessible from Windows browsers
- Local dev uses SQLite (`brainer.db`), Docker uses PostgreSQL
- API docs: http://localhost:8000/docs (Swagger UI)
- Database auto-created on startup (tables + migrations are idempotent in `api/main.py`)

## Skills

**Use skills for implementation details.** Skills contain specialized context and workflows:

- **`/reformat-epub`** — Analyze and normalize EPUB books into Brainer-compatible structure
- **`/import-course`** — Import EPUB book structure into database
- **`/generate-synopses`** — Pre-generate structured synopses for all chapters (run before `/prepare-chapter`)
- **`/prepare-chapter <num>`** — Analyse a chapter source and save a pedagogical plan to `temp/`
- **`/generate-chapter <num>`** — Generate HTML content from the saved plan (run in a fresh conversation after `/prepare-chapter`)
- **`/create-exercise`** — Create targeted exercises for chapters
- **`/create-review-sheets`** — Generate review sheets from chapter synopses
- **`/update-chapters`** — Apply targeted modifications to existing chapter content
- **`/api-endpoint`** — Create/modify FastAPI endpoints (use for backend work)
- **`/frontend-component`** — Create/modify UI components (use for frontend work)
- **`/frontend-design`** — Build distinctive, production-grade UI pages/components
- **`/create-path`** — Generate a curated learning path for a profession with canonical book references
- **`/skill-creator`** — Create new skills
- **`/deploy-docker`** — Deploy to VPS with Docker

**Workflow for adding a book:**
1. Place EPUB in `books/` and extract it
2. **`/reformat-epub`** — normalize EPUB structure if needed (malformed EPUBs, split files, etc.)
3. **`/import-course`** — creates course/parts/chapters structure in database
4. **`/generate-synopses`** — pre-generate synopses for all chapters (recommended, reduces token cost)
5. For each chapter — **in two separate conversations** to keep context lean:
   - **`/prepare-chapter N`** → analyse + save plan to `temp/` → reset conversation
   - **`/generate-chapter N`** → read plan + generate HTML content + update API
6. **`/create-review-sheets`** — generate review sheets per part (optional)

## Database Schema

**Content tables:** Course → Part → Chapter → Exercise → ReviewSheet
**Auth/progress tables:** User, UserChapterProgress, UserExerciseSubmission

- **Course**: slug (unique), title, description, image, difficulty (debutant|intermediaire|avance)
- **Part**: course_id, order, title, description
- **Chapter**: course_id, part_id, order, slug, title, content (HTML), synopsis, image
- **Exercise**: chapter_id, order, title, type (multiple_choice|code|true_false|calculation), content (JSON), auto_generated
- **ReviewSheet**: part_id (unique), content
- **User**: email (unique), username (unique), hashed_password, is_active
- **UserChapterProgress**: user_id + chapter_id (unique), is_completed
- **UserExerciseSubmission**: user_id + exercise_id (unique), answer, is_correct

**API prefix:** All endpoints at `/api/*` — see `api/routers/` for implementation.

**Auth:** JWT tokens (24h expiry) via `api/dependencies.py:get_current_user`. Login: `POST /api/auth/login`. Protected routes use `Depends(get_current_user)`.

**For API changes:** Use `/api-endpoint` skill (handles routing, validation, DB operations).

## Frontend Architecture

**App Router** (Next.js 16) with routes:
- `/` — course list
- `/courses/[slug]` — course detail with parts/chapters
- `/courses/[slug]/chapters/[chapterSlug]` — chapter reader
- `/courses/[slug]/parts/[partId]/review` — review sheets
- `/admin/courses` — course management (CRUD dialogs)
- `/login`, `/register` — auth pages

**API layer:**
- `lib/api/client.ts` — axios instance with JWT interceptor (reads token from `auth-context`)
- `lib/api/queries/` — TanStack Query hooks per domain (courses, chapters, exercises, progress, review-sheets)
- `lib/api/query-keys.ts` — centralized query key factory
- `lib/types/api.ts` — auto-generated from OpenAPI spec (`npm run generate:types`)

**Component structure:**
- `components/ui/` — shadcn/ui primitives (button, card, dialog, etc.)
- `components/chapters/` — chapter reader, sidebar, navigation, content renderers
- `components/chapters/content/` — HTML-to-React renderers (code-block, figure, table, mermaid-diagram, math-formula, etc.)
- `components/exercises/` — exercise types (multiple-choice, true-false, code, calculation)
- `components/courses/` — course cards, list, header, progress
- `components/admin/` — CRUD dialogs for courses/parts/chapters
- `components/review-sheets/` — review sheet viewer with markdown renderer

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
- Exercise content is polymorphic JSON — schema varies by type (see `api/schemas.py:ExerciseContentUnion`)
- SQLite foreign keys enabled via PRAGMA in `api/database.py`
- **Use `/api-endpoint` skill** for backend implementation details

**Frontend:**
- Always regenerate types after API changes: `cd frontend && npm run generate:types`
- Use TanStack Query hooks from `lib/api/queries/` — never fetch directly
- Components: `components/ui/` (primitives), `components/{domain}/` (features)
- Client components need `'use client'` directive
- Chapter content is stored as HTML and rendered via custom React components in `components/chapters/content/`
- **Use `/frontend-component` skill** for UI implementation details

