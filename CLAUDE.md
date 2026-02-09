# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Brainer

A private course site that extracts structured courses from books (PDF/EPUB) and serves them via a REST API.

## Architecture

Three-component system:

1. **Extraction scripts** (Python) — `books/` → `course-plan.json`
   - `scripts/parse_toc.py` parses a book's TOC into a structured plan (`course-plan.json`)
   - `scripts/extract.py` (not yet written) will read the plan and load content into the database
   - EPUB uses `ebooklib` (preferred); PDF uses `pdfplumber`

2. **Backend API** (FastAPI + SQLAlchemy) — `api/`
   - REST API with endpoints for courses, parts, chapters, and exercises
   - SQLite database (`brainer.db`) with four main tables: Course, Part, Chapter, Exercise
   - Image upload/serving via `/static` mount
   - CORS enabled for frontend access

3. **Frontend** (planned, not yet built)
   - Will consume the REST API to display courses and chapters
   - Technology stack TBD (Next.js, React, etc.)

**Data flow:** Books → extraction scripts → SQLite DB ← REST API ← Frontend

## Commands

### Extraction scripts (Python)

The venv at `venv/` has dependencies from root `requirements.txt` (ebooklib, beautifulsoup4, lxml).

```bash
source venv/bin/activate
python scripts/parse_toc.py <path>                  # parse toc.ncx → course-plan.json
python scripts/extract.py <book-filename>           # NOT YET WRITTEN — will load data into DB
python scripts/clean_ebook_data.py <path>           # dry-run: list non-chapter files
python scripts/clean_ebook_data.py <path> --delete  # remove non-chapter files
```

### Backend API (FastAPI)

The API has its own requirements at `api/requirements.txt` (fastapi, uvicorn, sqlalchemy, python-multipart).

```bash
# Install API dependencies (in venv)
pip install -r api/requirements.txt

# Run development server (from project root)
uvicorn api.main:app --reload                       # starts on http://localhost:8000
uvicorn api.main:app --reload --port 8080           # custom port

# API documentation automatically available at:
# - http://localhost:8000/docs (Swagger UI)
# - http://localhost:8000/redoc (ReDoc)
```

### Frontend (not yet built)

Planned, technology stack TBD.

### Skill utilities

```bash
python .claude/skills/skil-creator/scripts/init_skill.py <name>          # scaffold a new skill
python .claude/skills/skil-creator/scripts/package_skill.py <path>       # package into .skill file
python .claude/skills/skil-creator/scripts/quick_validate.py             # validate skill structure
```

## API Structure

### Database Models (SQLAlchemy)

- **Course**: `id`, `title`, `slug` (unique), `description`, `image`, timestamps
- **Part**: `id`, `course_id`, `order`, `title`, `description`
  Unique constraint on `(course_id, order)`
- **Chapter**: `id`, `course_id`, `part_id`, `order`, `title`, `slug`, `content` (text), `image`, timestamps
  Unique constraints on `(course_id, order)` and `(course_id, slug)`
- **Exercise**: `id`, `chapter_id`, `order`, `title`, `type` (enum: multiple_choice|code|true_false), `content` (JSON), `image`, `auto_generated` (bool), timestamps
  Unique constraint on `(chapter_id, order)`

### REST Endpoints

All endpoints are prefixed with `/api`:

**Courses:**
- `GET /api/courses` — list all courses
- `POST /api/courses` — create course
- `GET /api/courses/{slug}` — get course by slug
- `PUT /api/courses/{slug}` — update course
- `DELETE /api/courses/{slug}` — delete course (cascades to parts/chapters/exercises)

**Parts:**
- `GET /api/courses/{slug}/parts` — list parts for course
- `POST /api/courses/{slug}/parts` — create part
- `GET /api/courses/{slug}/parts/{part_id}` — get part
- `PUT /api/courses/{slug}/parts/{part_id}` — update part
- `DELETE /api/courses/{slug}/parts/{part_id}` — delete part (cascades to chapters)

**Chapters:**
- `GET /api/courses/{slug}/chapters` — list chapters (lightweight, no content field)
- `POST /api/courses/{slug}/chapters` — create chapter
- `GET /api/courses/{slug}/chapters/{chapter_slug}` — get full chapter (includes content)
- `PUT /api/courses/{slug}/chapters/{chapter_slug}` — update chapter
- `DELETE /api/courses/{slug}/chapters/{chapter_slug}` — delete chapter (cascades to exercises)

**Exercises:**
- `GET /api/chapters/{chapter_id}/exercises` — list exercises for chapter
- `POST /api/chapters/{chapter_id}/exercises` — create exercise
- `GET /api/chapters/{chapter_id}/exercises/{exercise_id}` — get exercise
- `PUT /api/chapters/{chapter_id}/exercises/{exercise_id}` — update exercise
- `DELETE /api/chapters/{chapter_id}/exercises/{exercise_id}` — delete exercise

**Images:**
- `POST /api/images/upload` — upload image (returns URL)
- Uploaded images served at `/static/images/{filename}`

## Book data layout

The first book's EPUB has been unpacked into raw OEBPS files:

```
books/
└── Fundamentals of Data Engineering/
    ├── toc.ncx                              # EPUB table of contents (XML, NCX format)
    └── OEBPS/
        ├── ch01.xhtml … ch11.xhtml          # chapter content (87–195 KB each)
        ├── part01.xhtml … part03.xhtml      # part dividers (minimal content)
        └── Images/                          # 97 PNGs, named fode_XXYY.png (XX=chapter, YY=figure)
```

The book has 3 parts, 11 chapters, and 2 appendices. `parse_toc.py` classifies TOC entries: Roman-numeral prefixes (`I.`, `II.`, …) are parts, decimal prefixes (`1.`, `2.`, …) are chapters, everything else (preface, appendices, index) is skipped. `clean_ebook_data.py` keeps only files whose names start with `ch`, `part`, or `fode`.

## Conventions

- **Course slugs:** kebab-case from the book title (e.g. `fundamentals-of-data-engineering`), stored in DB as unique index
- **Order fields:** All `order` fields are integers starting from 1, enforced by unique constraints per parent
- **Cascading deletes:** Enabled in SQLAlchemy foreign keys (deleting course → deletes parts, chapters, exercises)
- **Chapter slugs:** kebab-case, unique within a course
- **Exercise types:** `multiple_choice`, `code`, or `true_false` (enum in DB)
- **Exercise content:** Polymorphic JSON field validated by Pydantic schemas (MultipleChoiceContent, CodeContent, TrueFalseContent)
- **File structure:** Python extraction → `scripts/`; FastAPI backend → `api/`; uploaded images → `api/static/images/`
- **Adding a book:** drop in `books/`, run `parse_toc.py`, then run `extract.py` (to load into DB)

## Skills

Custom Claude skills live in `.claude/skills/`. Each skill is a directory with a `SKILL.md` (YAML frontmatter with `name` and `description`, then instructions), plus optional `scripts/`, `references/`, and `assets/` subdirectories.

The `skil-creator` skill is a meta-skill for scaffolding and packaging new skills — read `.claude/skills/skil-creator/Skill.md` for the full process.

## Current Books

| Book Title | Format | Course Slug | Status |
|------------|--------|-------------|--------|
| Fundamentals of Data Engineering | EPUB | fundamentals-of-data-engineering | OEBPS unpacked, TOC parsed, `course-plan.json` generated; needs `extract.py` to load into DB |

## What exists vs. what's planned

**Built:**
- `books/` — one EPUB unpacked into OEBPS (Fundamentals of Data Engineering)
- `scripts/parse_toc.py` — parses `toc.ncx`, classifies parts/chapters, produces `course-plan.json`
- `scripts/clean_ebook_data.py` — strips non-chapter files from unpacked EPUB
- `course-plan.json` — generated plan for *Fundamentals of Data Engineering*
- `api/` — complete FastAPI backend with:
  - SQLAlchemy models: Course, Part, Chapter, Exercise
  - REST endpoints for full CRUD on all models
  - SQLite database (`brainer.db`, created automatically on startup)
  - Image upload and static file serving
  - Pydantic schemas for request/response validation
  - CORS middleware configured
- Root `requirements.txt` (extraction deps) + `api/requirements.txt` (API deps)
- `venv/` — Python virtual environment
- `.claude/skills/skil-creator` — skill creation framework

**Not yet built:**
- `scripts/extract.py` — the bridge script that will:
  - Read `course-plan.json`
  - Parse XHTML chapter files from `books/*/OEBPS/`
  - Create Course, Parts, and Chapters in the database via API or direct DB access
  - Handle images (extract from `Images/` dir, upload to `/static/images/`)
- Frontend web application (technology stack TBD)
- Exercise generation/import logic
