# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Brainer

A private course site that extracts structured courses from books (PDF/EPUB) and renders them as a Next.js site.

## Architecture

Two-pipeline system:

1. **Extraction** (Python) — `books/` → `content/courses/<slug>/`
   - Two stages: `scripts/parse_toc.py` parses a book's TOC into a structured plan (`course-plan.json`), then `scripts/extract.py` (not yet written) reads that plan and converts each XHTML chapter into an MDX file.
   - `course-plan.json` is the contract between the two stages — it records chapter order, titles, source files, slugs, and output filenames.
   - EPUB uses `ebooklib` (preferred — structured TOC); PDF uses `pdfplumber` (noisier, line-break issues).
   - Output: `00-index.mdx` (course overview from TOC), then `01-<chapter>.mdx`, `02-<chapter>.mdx`, …

2. **Rendering** (Next.js App Router) — `content/courses/` → browsable site
   - Dynamic routes: `app/courses/[slug]/page.tsx` (course listing), `app/courses/[slug]/[chapter]/page.tsx` (chapter view)
   - MDX rendered via Next.js MDX support configured in `next.config.mjs`

**Critical rule:** Files in `content/courses/` are generated. Do not hand-edit them — re-running extraction overwrites everything. If manual overrides are needed in the future, they go in a separate `overrides/` layer (TBD).

## Commands

### Python (extraction pipeline)

The venv at `venv/` is already set up with dependencies from `requirements.txt` (`ebooklib`, `beautifulsoup4`, `lxml`).

```bash
source venv/bin/activate
python scripts/parse_toc.py <path>                  # parse toc.ncx → course-plan.json  (path = dir or file)
python scripts/extract.py <book-filename>           # NOT YET WRITTEN — will read course-plan.json and emit MDX
python scripts/clean_ebook_data.py <path>           # dry-run: list non-chapter files that would be removed
python scripts/clean_ebook_data.py <path> --delete  # actually remove non-chapter files
```

### Next.js (rendering pipeline — not yet scaffolded)

```bash
npm run dev    # dev server
npm run build  # production build
```

### Skill utilities

```bash
python .claude/skills/skil-creator/scripts/init_skill.py <name>          # scaffold a new skill
python .claude/skills/skil-creator/scripts/package_skill.py <path>       # package into .skill file
python .claude/skills/skil-creator/scripts/quick_validate.py             # validate skill structure
```

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

- **Course slugs:** kebab-case from the book title (e.g. `fundamentals-of-data-engineering`)
- **Chapter files:** zero-padded numeric prefix matching TOC order (`00-index.mdx`, `01-<chapter>.mdx`, …)
- **MDX frontmatter fields:** `title`, `order`, `course`, `book` (original filename)
- **File placement:** Python extraction scripts → `scripts/`; Node.js tooling → `package.json` scripts
- **Adding a book:** drop it in `books/`, run `parse_toc.py` on it, then run `extract.py`

## Skills

Custom Claude skills live in `.claude/skills/`. Each skill is a directory with a `SKILL.md` (YAML frontmatter with `name` and `description`, then instructions), plus optional `scripts/`, `references/`, and `assets/` subdirectories.

The `skil-creator` skill is a meta-skill for scaffolding and packaging new skills — read `.claude/skills/skil-creator/Skill.md` for the full process.

## Current Books

| File | Format | Course Slug | Status |
|------|--------|-------------|--------|
| Fundamentals of Data Engineering | EPUB | fundamentals-of-data-engineering | OEBPS unpacked, TOC parsed, `course-plan.json` generated; `extract.py` not yet written |

## What exists vs. what's planned

**Built:**
- `books/` — one EPUB unpacked into OEBPS
- `scripts/parse_toc.py` — parses `toc.ncx`, classifies parts/chapters, produces `course-plan.json`
- `scripts/clean_ebook_data.py` — strips non-chapter files from an unpacked EPUB directory
- `course-plan.json` — generated plan for *Fundamentals of Data Engineering* (1 index + 11 chapters across 3 parts → 12 MDX files)
- `requirements.txt` + `venv/` — Python environment ready to use
- `.claude/skills/skil-creator` — skill creation framework

**Not yet built (planned):**
- `scripts/extract.py` — reads `course-plan.json`, converts XHTML chapters → MDX in `content/courses/<slug>/`
- `package.json`, Next.js config, TypeScript config, ESLint config
- `app/` — Next.js App Router pages
- `content/courses/` — generated MDX output
