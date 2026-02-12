# EPUB Reformat Scripts Overview

This document provides technical details about the scripts used in the `/reformat-epub` skill.

## Script Dependency Graph

```
reformat_epub.py (orchestrator)
├── epub_analyzer.py (analysis)
├── parse_toc.py (standard EPUBs)
└── normalize_epub.py (malformed EPUBs)
    ├── epub_analyzer.py (detect structure)
    ├── semantic_chapter_detector.py (find chapters)
    ├── image_normalizer.py (rename images)
    └── parse_toc.py (generate course plan from normalized output)
```

## Script Details

### reformat_epub.py (Orchestrator)

**Location:** `.claude/skills/reformat-epub/scripts/reformat_epub.py`

**Purpose:** Main entry point that intelligently routes to the correct processing pipeline.

**Decision logic:**
1. Analyze EPUB structure (has toc.ncx?)
2. If standard → parse_toc.py
3. If malformed → normalize_epub.py
4. Validate output
5. Report next steps

**Usage:**
```bash
python .claude/skills/reformat-epub/scripts/reformat_epub.py "books/Book Name/"
```

**Exit codes:**
- 0: Success
- 1: Error occurred

---

### epub_analyzer.py

**Location:** `.claude/skills/reformat-epub/scripts/epub_analyzer.py`

**Purpose:** Detect EPUB type and structure without modifying files.

**Detects:**
- EPUB version (2.0, 3.0, or non-standard)
- Metadata files (content.opf, toc.ncx, nav.xhtml)
- Content file patterns (_split files, standard chapters, etc.)
- Image locations and formats
- Book title and author (if available)

**Output:** Console report with recommendations

**Key functions:**
- `analyze_epub(epub_path)` → Returns analysis dict
- `detect_epub_type()` → "epub2", "epub3", or "non-standard"
- `find_metadata_files()` → List of metadata file paths
- `analyze_content_structure()` → Content file patterns

---

### parse_toc.py

**Location:** `.claude/skills/import-course/scripts/parse_toc.py`

**Purpose:** Parse standard EPUB toc.ncx into course-plan.json

**Requirements:**
- Book must have a valid toc.ncx file
- TOC must use standard NCX format

**Process:**
1. Find toc.ncx file (searches recursively)
2. Parse XML structure
3. Identify parts (Roman numerals: I., II., III.)
4. Identify chapters (numeric: 1., 2., 3.)
5. Generate slugs (kebab-case from titles)
6. Output course-plan.json

**Output file:** `course-plan.json` in project root

**Usage:**
```bash
python .claude/skills/import-course/scripts/parse_toc.py "books/Book Name/"
python .claude/skills/import-course/scripts/parse_toc.py books/Book-Name/OEBPS/toc.ncx
```

---

### normalize_epub.py (Pipeline)

**Location:** `.claude/skills/reformat-epub/scripts/normalize_epub.py`

**Purpose:** Transform malformed EPUBs into standardized structure

**Pipeline stages:**

#### 1. Analysis
- Calls `epub_analyzer.py` to understand structure

#### 2. Chapter Detection
- Calls `semantic_chapter_detector.py`
- Analyzes HTML heading hierarchy
- Identifies logical chapter boundaries
- Handles split files and merged content

#### 3. Chapter Normalization
- Creates ch01.xhtml, ch02.xhtml, etc.
- Preserves original HTML structure
- Filters front matter (copyright, TOC pages, etc.)

#### 4. Image Normalization
- Calls `image_normalizer.py`
- Renames images: chapter-01-image-01.png
- Updates all XHTML references

#### 5. Course Plan Generation
- Creates course-plan.json
- Compatible with `/import-course`

**Output directory:** `books/{book-name}-normalized/`

**Usage:**
```bash
python .claude/skills/reformat-epub/scripts/normalize_epub.py "books/Book Name/"
python .claude/skills/reformat-epub/scripts/normalize_epub.py books/book.epub --output books/custom-output/
```

**Options:**
- `--output DIR`: Custom output directory
- `--dry-run`: Analyze without writing files

---

### semantic_chapter_detector.py

**Location:** `scripts/semantic_chapter_detector.py`

**Purpose:** Identify chapter boundaries using semantic HTML analysis

**Algorithm:**

1. **Heading Analysis**
   - Parse all XHTML files for h1, h2, h3 tags
   - Build heading hierarchy

2. **Pattern Detection**
   - Chapter N
   - Numeric patterns (1., 2., 3.)
   - Part/Section markers

3. **Split File Handling**
   - Analyze files like ch01_split_000.xhtml, ch01_split_001.xhtml
   - Merge content that belongs to the same logical chapter

4. **Front Matter Filtering**
   - Detect copyright pages (keywords: "Copyright", "©", "Publisher")
   - Detect HTML TOCs (multiple links, "Contents" heading)
   - Detect title pages (short content, title keywords)

**Heuristics:**
- Content < 1000 characters → likely front matter
- > 20 internal links → likely TOC page
- First 3 files with specific patterns → likely front matter

**Output:** List of chapter boundaries with titles

**Usage:**
```bash
python scripts/semantic_chapter_detector.py "books/Book Name/OEBPS/"
```

---

### image_normalizer.py

**Location:** `scripts/image_normalizer.py`

**Purpose:** Rename images with predictable names and update references

**Naming convention:**
```
chapter-{chapter_num:02d}-image-{img_num:02d}.{extension}
```

**Examples:**
- chapter-01-image-01.png
- chapter-03-image-05.jpg
- chapter-12-image-03.gif

**Process:**
1. Scan all XHTML files for image references
2. Build chapter → images mapping
3. Copy images to Images/ with new names
4. Update all `<img src="...">` references in XHTML
5. Handle relative paths correctly

**Handles:**
- PNG, JPG, JPEG, GIF, SVG formats
- Relative paths (Images/fig01.png, ../Images/fig01.png)
- Case-insensitive file matching

**Usage:**
```bash
python scripts/image_normalizer.py "books/Book-normalized/OEBPS/"
```

---

### epub_validator.py

**Location:** `scripts/epub_validator.py`

**Purpose:** Validate that normalized EPUB is ready for import

**Checks:**

1. **File structure**
   - Chapter files exist (ch01.xhtml, ch02.xhtml, ...)
   - Images directory exists
   - course-plan.json exists and is valid JSON

2. **Content validation**
   - XHTML files are well-formed
   - Images referenced in XHTML exist on disk
   - No broken internal links

3. **Course plan validation**
   - Valid JSON structure
   - All referenced source files exist
   - Slugs are valid (kebab-case)
   - Order sequence is correct (1, 2, 3, ...)

**Output:** Validation report with errors/warnings

**Exit codes:**
- 0: All validations passed
- 1: Validation errors found

**Usage:**
```bash
python scripts/epub_validator.py "books/Book-normalized/"
```

---

## Common Patterns

### Error Handling

All scripts follow these patterns:

1. **Input validation**
   ```python
   if not path.exists():
       print(f"ERROR: Path not found: {path}")
       sys.exit(1)
   ```

2. **Graceful degradation**
   - Missing optional files → warning, continue
   - Missing required files → error, exit

3. **Clear error messages**
   - What went wrong
   - What was expected
   - Suggestions for fixing

### Output Conventions

- ✅ Success indicators
- ❌ Error indicators
- ⚠️  Warning indicators
- 📍 Step markers
- 💡 Tips and suggestions

### File Paths

All scripts use `pathlib.Path` for cross-platform compatibility:

```python
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
BOOKS_DIR = PROJECT_ROOT / "books"
```

### Subprocess Calls

Scripts call each other using subprocess:

```python
import subprocess
import sys

result = subprocess.run(
    [sys.executable, str(script_path), str(arg)],
    capture_output=True,
    text=True,
    check=True  # Raise CalledProcessError on non-zero exit
)
```

## Testing Scripts Individually

Each script can be run standalone for testing:

```bash
# Activate virtual environment
source brainer_venv/bin/activate

# Test analyzer
python .claude/skills/reformat-epub/scripts/epub_analyzer.py "books/Test Book/"

# Test TOC parser
python .claude/skills/import-course/scripts/parse_toc.py "books/Test Book/"

# Test normalizer
python .claude/skills/reformat-epub/scripts/normalize_epub.py "books/Test Book/"

# Test chapter detector
python scripts/semantic_chapter_detector.py "books/Test Book/OEBPS/"

# Test image normalizer (run after chapter normalization)
python scripts/image_normalizer.py "books/test-book-normalized/OEBPS/"

# Test validator
python scripts/epub_validator.py "books/test-book-normalized/"
```

## Debugging Tips

### Enable verbose output

Most scripts support environment variables:

```bash
DEBUG=1 python .claude/skills/reformat-epub/scripts/normalize_epub.py "books/Book/"
```

### Check intermediate files

Normalized output is in stages:
1. After chapter detection: chapters list in console
2. After normalization: ch01.xhtml, ch02.xhtml, etc.
3. After image normalization: renamed images
4. Final: course-plan.json

### Common issues

1. **"No toc.ncx found"**
   - Solution: Use normalize_epub.py instead

2. **"Chapter detection found 0 chapters"**
   - Check: Are XHTML files in OEBPS/ or different location?
   - Debug: Run semantic_chapter_detector.py with DEBUG=1

3. **"Images not found after normalization"**
   - Check: Original image paths in XHTML
   - Run: image_normalizer.py separately to see logs

4. **"course-plan.json missing expected fields"**
   - Validate: `python -m json.tool course-plan.json`
   - Check: Schema in references/course_plan_schema.md
