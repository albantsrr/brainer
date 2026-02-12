---
name: reformat-epub
description: Analyze and normalize EPUB books (standard or malformed) into a standardized structure compatible with Brainer. Handles toc.ncx parsing, EPUB normalization, chapter detection, and image renaming. Use when you need to prepare an EPUB for import into the Brainer system.
---

# Reformat EPUB

## Overview

This skill provides a complete pipeline for analyzing and normalizing EPUB books into a standardized structure that Brainer can import. It handles both standard EPUBs (with toc.ncx) and malformed/non-standard EPUBs (split files, HTML TOC only, inconsistent naming).

The skill orchestrates multiple specialized scripts to:
1. Analyze EPUB structure and detect metadata
2. Identify logical chapter boundaries semantically
3. Normalize XHTML files into ch01.xhtml, ch02.xhtml, etc.
4. Rename and normalize image references
5. Generate a course-plan.json compatible with `/import-course`

## When to Use This Skill

Invoke this skill when:
- You need to prepare an EPUB book for import into Brainer
- The EPUB has no toc.ncx or malformed table of contents
- The EPUB has split files (_split_000, _split_001, etc.)
- The EPUB uses HTML TOC only (like "Computer Systems" book)
- File naming is inconsistent across the book
- You want to analyze an EPUB's structure before importing
- A standard EPUB needs validation before import

## Workflow

### Step 1: Analyze EPUB Structure

Use `epub_analyzer.py` to detect:
- EPUB type (EPUB 2, EPUB 3, or non-standard)
- Available metadata files (content.opf, toc.ncx, nav.xhtml)
- Content structure and file patterns
- Image locations and naming conventions

**Script:** `.claude/skills/reformat-epub/scripts/epub_analyzer.py`

```bash
python .claude/skills/reformat-epub/scripts/epub_analyzer.py "books/Book Name/"
```

**Output:** Detailed analysis report showing:
- Detected EPUB type
- Metadata files found
- Content files count and patterns
- Image inventory
- Recommendations for next steps

### Step 2: Normalize EPUB (if needed)

For non-standard or malformed EPUBs, run the normalization pipeline:

**Script:** `.claude/skills/reformat-epub/scripts/normalize_epub.py`

```bash
python .claude/skills/reformat-epub/scripts/normalize_epub.py "books/Book Name/"
```

This orchestrates:
1. **Structure Analysis** (epub_analyzer.py)
2. **Semantic Chapter Detection** (semantic_chapter_detector.py)
   - Analyzes heading patterns (h1, h2, h3)
   - Identifies chapter boundaries
   - Handles split files and merged content
3. **Chapter Normalization**
   - Creates ch01.xhtml, ch02.xhtml, etc.
   - Preserves HTML structure and formatting
   - Filters out front matter (copyright, TOC pages)
4. **Image Normalization** (image_normalizer.py)
   - Renames images: chapter-01-image-01.png, etc.
   - Updates all XHTML references
   - Maintains image quality and format
5. **Course Plan Generation**
   - Creates course-plan.json with chapters list
   - Compatible with `/import-course` skill

**Output directory:** `books/Book-Name-normalized/`
- Standardized XHTML files (ch01.xhtml, ch02.xhtml, ...)
- Renamed images with predictable names
- Generated course-plan.json

### Step 3: Parse TOC (for standard EPUBs)

For EPUBs with valid toc.ncx:

**Script:** `.claude/skills/import-course/scripts/parse_toc.py`

```bash
python .claude/skills/import-course/scripts/parse_toc.py "books/Book Name/"
```

**Output:** `course-plan.json` with:
- Course metadata (title, slug, description)
- Parts structure (I, II, III, etc.)
- Chapters list with titles and source files

### Step 4: Validate Structure

Use `epub_validator.py` to ensure the normalized structure is ready for import:

**Script:** `.claude/skills/reformat-epub/scripts/epub_validator.py`

```bash
python .claude/skills/reformat-epub/scripts/epub_validator.py "books/Book-Name-normalized/"
```

**Checks:**
- All chapter files exist (ch01.xhtml, ch02.xhtml, ...)
- Images are properly referenced
- course-plan.json is valid and complete
- No broken links or missing resources

### Step 5: Next Steps

After successful normalization:
1. Use `/import-course` to create the course structure in the database
2. Use `/create-chapters 1`, `/create-chapters 2`, etc. to generate pedagogical content

## Decision Tree

Use this logic to determine which approach to take:

```
Does the EPUB have a toc.ncx file?
├─ YES: Is it well-formed and accurate?
│  ├─ YES: Run parse_toc.py → course-plan.json → /import-course
│  └─ NO:  Run normalize_epub.py → normalized structure → /import-course
└─ NO:  Does it have nav.xhtml (EPUB 3)?
   ├─ YES: Run normalize_epub.py (handles EPUB 3)
   └─ NO:  Run normalize_epub.py (semantic detection)
```

## Important Notes

- **Python virtual environment required**: Activate `brainer_venv` before running scripts
- **Dependencies**: ebooklib, beautifulsoup4, lxml (see requirements.txt)
- **Normalization is non-destructive**: Original files are preserved, normalized output goes to a new directory
- **Large books may take 1-2 minutes** to process completely
- **Images are copied, not moved** from the original EPUB
- **Front matter is filtered out** (copyright pages, publisher info, HTML TOC)

## Script Reference

### Main Scripts

All scripts located in `.claude/skills/reformat-epub/scripts/` directory:

#### `normalize_epub.py`
Main pipeline orchestrator. Calls all other scripts in sequence.

**Usage:**
```bash
python .claude/skills/reformat-epub/scripts/normalize_epub.py "books/Source Book/"
python .claude/skills/reformat-epub/scripts/normalize_epub.py books/book.epub --output books/output/
```

**Options:**
- `--output`: Specify output directory (default: books/{BookTitle}-normalized/)
- `--dry-run`: Analyze without writing files

#### `epub_analyzer.py`
Detects EPUB structure and metadata.

**Usage:**
```bash
python .claude/skills/reformat-epub/scripts/epub_analyzer.py "books/Book Name/"
```

**Output:** Analysis report (printed to console)

#### `semantic_chapter_detector.py`
Identifies chapter boundaries using semantic analysis.

**Usage:**
```bash
python .claude/skills/reformat-epub/scripts/semantic_chapter_detector.py "books/Book Name/OEBPS/"
```

**Algorithm:**
- Analyzes HTML heading hierarchy (h1 > h2 > h3)
- Detects chapter patterns (numeric, "Chapter N", etc.)
- Handles split files by content analysis
- Filters front matter using heuristics

#### `image_normalizer.py`
Renames images and updates all references.

**Usage:**
```bash
python .claude/skills/reformat-epub/scripts/image_normalizer.py "books/Book-normalized/OEBPS/"
```

**Naming convention:** `chapter-{N:02d}-image-{M:02d}.{ext}`
- Example: chapter-01-image-01.png, chapter-03-image-05.jpg

#### `epub_validator.py`
Validates normalized EPUB structure.

**Usage:**
```bash
python .claude/skills/reformat-epub/scripts/epub_validator.py "books/Book-normalized/"
```

**Exit codes:**
- 0: Valid structure
- 1: Validation errors found

#### `parse_toc.py`
Parses standard toc.ncx files.

**Usage:**
```bash
python .claude/skills/import-course/scripts/parse_toc.py "books/Book Name/"
```

**Output:** course-plan.json in project root

### Helper Scripts

#### `clean_ebook_data.py`
Removes temporary files and caches from books directory.

## Example Workflows

### Example 1: Standard EPUB (has toc.ncx)

**User request:**
> "Prepare Fundamentals of Data Engineering for import"

**Actions:**
1. Check for toc.ncx: ✓ Found
2. Run: `python .claude/skills/import-course/scripts/parse_toc.py "books/Fundamentals of Data Engineering/"`
3. Output: course-plan.json created
4. Next: `/import-course Fundamentals of Data Engineering`

### Example 2: Malformed EPUB (no toc.ncx)

**User request:**
> "Prepare Computer Systems: A Programmer's Perspective for import"

**Actions:**
1. Check for toc.ncx: ✗ Not found
2. Run analyzer: `python .claude/skills/reformat-epub/scripts/epub_analyzer.py "books/Computer Systems/"`
3. Analyzer reports: Non-standard structure, split files detected
4. Run normalizer: `python .claude/skills/reformat-epub/scripts/normalize_epub.py "books/Computer Systems/"`
5. Normalizer creates: `books/computer-systems-a-programmers-perspective-normalized/`
6. Output includes: 15 chapters (ch01.xhtml - ch15.xhtml), renamed images, course-plan.json
7. Validate: `python .claude/skills/reformat-epub/scripts/epub_validator.py "books/computer-systems-a-programmers-perspective-normalized/"`
8. Next: `/import-course computer-systems-a-programmers-perspective-normalized`

### Example 3: Analysis Only

**User request:**
> "Analyze the structure of the new EPUB I just added"

**Actions:**
1. Run: `python .claude/skills/reformat-epub/scripts/epub_analyzer.py "books/New Book/"`
2. Report findings: EPUB type, structure, recommendations
3. User decides next steps based on analysis

## Integration with Other Skills

**After using this skill:**

1. **`/import-course`** — Creates course/parts/chapters in database
   - Uses the generated course-plan.json
   - Creates empty chapter placeholders

2. **`/create-chapters N`** — Generates pedagogical content for chapter N
   - Reads the normalized XHTML files
   - Extracts and summarizes content
   - Creates exercises

3. **`/create-exercise`** — Adds additional exercises to chapters
   - After chapters are created with content

## Troubleshooting

### Problem: "No toc.ncx found" error

**Solution:** Use normalize_epub.py instead of parse_toc.py
```bash
python .claude/skills/reformat-epub/scripts/normalize_epub.py "books/Book Name/"
```

### Problem: Images not displaying after import

**Check:**
1. Image files exist in normalized directory
2. Paths in XHTML use relative references
3. Run image_normalizer.py again if needed

### Problem: Chapters detected incorrectly

**Adjust semantic_chapter_detector.py:**
- Check heading hierarchy in source XHTML
- Modify detection patterns if book uses non-standard structure
- May need manual adjustment of chapter boundaries

### Problem: Front matter included in chapters

**Filter front matter:**
- semantic_chapter_detector.py has heuristics to skip TOC, copyright, etc.
- May need to adjust filters for specific book formats
- Check first few chapters and regenerate if needed

## Resources

### Directory Structure After Normalization

```
books/
├── Original Book Name/           # Original EPUB (preserved)
│   └── OEBPS/
│       ├── ch01_original.xhtml
│       ├── ch02_split_000.xhtml
│       └── Images/
└── original-book-name-normalized/  # Normalized output
    ├── course-plan.json          # Generated course plan
    └── OEBPS/
        ├── ch01.xhtml            # Standardized chapter files
        ├── ch02.xhtml
        ├── ch03.xhtml
        └── Images/
            ├── chapter-01-image-01.png  # Renamed images
            └── chapter-02-image-01.jpg
```

### course-plan.json Format

```json
{
  "course": {
    "title": "Book Title",
    "slug": "book-title",
    "description": "by Author Name"
  },
  "parts": [
    {
      "order": 1,
      "title": "Part I: Introduction",
      "chapters": [
        {
          "order": 1,
          "title": "Chapter 1: Getting Started",
          "slug": "getting-started",
          "source_file": "ch01.xhtml"
        }
      ]
    }
  ]
}
```

## Performance Notes

- **Small books (< 10 chapters)**: ~30 seconds
- **Medium books (10-20 chapters)**: ~1-2 minutes
- **Large books (> 20 chapters)**: ~2-5 minutes

Most time is spent in:
1. Semantic chapter detection (analyzing HTML structure)
2. Image processing (copying and renaming)

## Future Enhancements

- Batch processing multiple books
- Parallel chapter processing
- OCR for scanned images (currently not supported)
- PDF support (currently EPUB only)
- Interactive chapter boundary adjustment
- Web UI for normalization pipeline
