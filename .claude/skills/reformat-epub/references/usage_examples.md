# Usage Examples for /reformat-epub

This document provides practical examples of using the `/reformat-epub` skill in different scenarios.

## Quick Reference

```bash
# Analyze and process any EPUB (auto-detects standard vs malformed)
/reformat-epub "Book Name"

# Analyze structure only (no processing)
/reformat-epub "Book Name" --analyze-only

# Force normalization even if toc.ncx exists
/reformat-epub "Book Name" --force-normalize
```

## Example 1: Standard EPUB with toc.ncx

### Scenario
You have "Fundamentals of Data Engineering" book with a well-formed toc.ncx file.

### User Request
> "Prepare Fundamentals of Data Engineering for import"

### Skill Actions

1. **Detect structure**
   ```
   📚 Book: Fundamentals of Data Engineering
   📂 Path: /home/teissier/brainer/books/Fundamentals of Data Engineering

   📍 Step 1: Analyzing EPUB structure
   ----------------------------------------
   ✅ EPUB Type: Standard EPUB 2.0
   ✅ Metadata: Found toc.ncx
   ✅ Structure: Well-formed
   📋 Recommendation: Use parse_toc.py
   ```

2. **Parse TOC**
   ```
   📍 Step 2: Parsing TOC (standard EPUB)
   ----------------------------------------
   📖 Parsing TOC: .../toc.ncx
   ✅ Found 3 parts
   ✅ Found 11 chapters
   ✅ course-plan.json created successfully
   ```

3. **Report results**
   ```
   ============================================================
   Next Steps
   ============================================================
   ✅ EPUB reformatting complete!

   📋 To import this book into Brainer:

      1. Run: /import-course Fundamentals of Data Engineering
      2. After import, generate chapter content:
         /create-chapters 1
         /create-chapters 2
         /create-chapters 3
         ... (repeat for all chapters)

   💡 Tip: You can batch chapter creation later
   ```

### Result
- ✅ course-plan.json created at project root
- ✅ Ready for `/import-course`
- ⏱️ Time: ~5 seconds

---

## Example 2: Malformed EPUB (No toc.ncx)

### Scenario
You have "Computer Systems: A Programmer's Perspective" with split files and no toc.ncx.

### User Request
> "Prepare Computer Systems book for Brainer"

### Skill Actions

1. **Detect malformed structure**
   ```
   📚 Book: Computer Systems
   📂 Path: /home/teissier/brainer/books/Computer Systems

   📍 Step 1: Analyzing EPUB structure
   ----------------------------------------
   ⚠️  EPUB Type: Non-standard
   ❌ Metadata: No toc.ncx found
   ✅ Content: 127 files detected
   📊 Patterns: _split_000, _split_001 files detected
   📋 Recommendation: Use normalize_epub.py
   ```

2. **Run normalization pipeline**
   ```
   📍 Step 2: Normalizing EPUB (non-standard structure)
   ----------------------------------------

   ======================================================================
     EPUB Normalization Pipeline
   ======================================================================
   Source: /home/teissier/brainer/books/Computer Systems

   [1/5] Analyzing structure...
   ✅ Structure analyzed

   [2/5] Detecting chapters semantically...
   📖 Scanning XHTML files...
   📊 Analyzing heading hierarchy...
   🔍 Found 15 logical chapters
   ✅ Chapter boundaries identified

   [3/5] Normalizing chapter files...
   📝 Creating ch01.xhtml - A Tour of Computer Systems
   📝 Creating ch02.xhtml - Representing and Manipulating Information
   📝 Creating ch03.xhtml - Machine-Level Representation of Programs
   ... (12 more)
   ✅ 15 chapter files created

   [4/5] Normalizing images...
   🖼️  Renaming image: fig1.png → chapter-01-image-01.png
   🖼️  Renaming image: fig2.jpg → chapter-01-image-02.jpg
   ... (156 images total)
   🔗 Updating XHTML references...
   ✅ 156 images normalized

   [5/5] Generating course plan...
   ✅ course-plan.json created

   ✅ Normalized book created at:
      books/computer-systems-a-programmers-perspective-normalized/
   ✅ course-plan.json found at: books/course-plan.json
   ```

3. **Validate output**
   ```
   📍 Step 3: Validating output structure
   ----------------------------------------
   ✅ All chapter files exist (ch01-ch15.xhtml)
   ✅ All images found (156 files)
   ✅ course-plan.json is valid JSON
   ✅ All source_file references valid
   ✅ Validation passed
   ```

4. **Report results**
   ```
   ============================================================
   Next Steps
   ============================================================
   ✅ EPUB reformatting complete!

   📋 To import this book into Brainer:

      1. Run: /import-course computer-systems-a-programmers-perspective-normalized
      2. After import, generate chapter content:
         /create-chapters 1
         /create-chapters 2
         /create-chapters 3
         ... (repeat for all 15 chapters)
   ```

### Result
- ✅ Normalized directory created: `books/computer-systems-a-programmers-perspective-normalized/`
- ✅ 15 standardized chapter files (ch01.xhtml - ch15.xhtml)
- ✅ 156 images renamed with predictable names
- ✅ course-plan.json generated
- ✅ Ready for `/import-course`
- ⏱️ Time: ~2 minutes

---

## Example 3: Analysis Only (Before Processing)

### Scenario
You want to check if a new EPUB is standard or malformed before processing.

### User Request
> "Analyze the structure of the new Python book I just added"

### Command
```
/reformat-epub "Python Programming" --analyze-only
```

### Skill Actions

1. **Analyze structure**
   ```
   📚 Book: Python Programming
   📂 Path: /home/teissier/brainer/books/Python Programming

   📍 Step 1: Analyzing EPUB structure
   ----------------------------------------

   EPUB Analysis Report
   ══════════════════════════════════════════

   📚 Book: Python Programming
   📂 Location: books/Python Programming/

   📋 EPUB Type: EPUB 3.0

   📄 Metadata Files:
   ✅ content.opf found
   ✅ nav.xhtml found (EPUB 3 navigation)
   ❌ toc.ncx not found (EPUB 2 TOC)

   📚 Content Structure:
   - Total XHTML files: 45
   - Naming pattern: ch01.xhtml, ch02.xhtml, ...
   - File structure: Standard sequential naming

   🖼️  Images:
   - Total images: 67
   - Formats: PNG (45), JPG (22)
   - Location: Images/ directory

   📊 Analysis Complete

   💡 Recommendations:
   - EPUB 3 format detected (nav.xhtml instead of toc.ncx)
   - Use normalize_epub.py to handle EPUB 3 structure
   - Standard sequential naming detected - should process smoothly
   ```

2. **Report**
   ```
   ============================================================
   Analysis Complete
   ============================================================
   Run without --analyze-only to process the book
   ```

### Result
- ✅ Structure analyzed
- ✅ Recommendation provided
- ❌ No files modified
- ⏱️ Time: ~10 seconds

---

## Example 4: Force Normalization

### Scenario
An EPUB has toc.ncx but it's inaccurate. You want to use semantic detection instead.

### User Request
> "The TOC for this book is wrong. Can you normalize it using semantic detection?"

### Command
```
/reformat-epub "Book Name" --force-normalize
```

### Skill Actions

1. **Detect structure**
   ```
   📚 Book: Book Name

   📍 Step 1: Analyzing EPUB structure
   ----------------------------------------
   ✅ EPUB Type: Standard EPUB 2.0
   ✅ Metadata: Found toc.ncx

   ⚠️  --force-normalize flag detected
   📋 Skipping toc.ncx, using normalization pipeline
   ```

2. **Run normalization** (same as Example 2)

3. **Result:** Normalized structure created even though toc.ncx exists

### Result
- ✅ TOC ignored, semantic detection used instead
- ✅ More accurate chapter boundaries based on actual content
- ⏱️ Time: ~1-2 minutes

---

## Example 5: Error - Book Not Found

### Scenario
User provides incorrect book name.

### User Request
> "Prepare JavaScript Book for import"

### Skill Actions

```
📚 Book: JavaScript Book
📂 Path: /home/teissier/brainer/books/JavaScript Book

❌ Error: Book path not found: /home/teissier/brainer/books/JavaScript Book

💡 Available books in /home/teissier/brainer/books/:
   - Fundamentals of Data Engineering
   - Computer Systems
   - computer-systems-a-programmers-perspective-normalized
   - Python Programming
```

### User Response
> "Oh, it's called 'JavaScript: The Good Parts'. Try that."

### Retry
```
/reformat-epub "JavaScript: The Good Parts"
```

---

## Example 6: Complete Workflow (New Book to Database)

### Scenario
You just downloaded a new EPUB and want to get it into Brainer.

### Complete Steps

1. **Place EPUB in books/**
   ```bash
   # User copies EPUB
   cp ~/Downloads/new-book.epub books/

   # Extract if needed (some EPUBs come pre-extracted)
   cd books/
   unzip new-book.epub -d "New Book"
   ```

2. **Reformat EPUB**
   ```
   /reformat-epub "New Book"
   ```

   Result:
   - Detects structure (standard or malformed)
   - Processes accordingly
   - Creates course-plan.json
   - Reports: "Ready for /import-course"

3. **Import course structure**
   ```
   /import-course "New Book"
   ```

   Result:
   - Creates Course, Parts, Chapters in database
   - Reports: "Course imported with 12 chapters"

4. **Generate chapter content**
   ```
   /create-chapters 1
   /create-chapters 2
   /create-chapters 3
   ... etc
   ```

   Result:
   - Extracts content from XHTML
   - Generates exercises
   - Updates database

5. **View in frontend**
   ```
   Open: http://localhost:3000/courses/new-book
   ```

### Total Time
- Small book (10 chapters): ~15-20 minutes
- Medium book (20 chapters): ~30-40 minutes
- Large book (30+ chapters): ~60+ minutes

Most time is spent in `/create-chapters` (uses Claude to generate content).

---

## Troubleshooting Examples

### Issue: Pipeline Fails During Normalization

**Error:**
```
❌ Error running normalize_epub.py:
  Traceback (most recent call last):
  ...
  ValueError: No chapters detected
```

**Diagnosis:**
```
/reformat-epub "Book Name" --analyze-only
```

Check the analysis report:
- Are XHTML files in the expected location?
- Are there any heading tags (h1, h2, h3)?
- Is this actually front matter only?

**Solution:**
- Verify XHTML files exist in OEBPS/ or similar
- Check first few XHTML files manually
- May need to adjust semantic_chapter_detector.py patterns

---

### Issue: Images Not Displaying After Import

**Diagnosis:**
Check normalized output:
```bash
ls books/book-normalized/OEBPS/Images/
```

Verify image references in XHTML:
```bash
grep -r "img src" books/book-normalized/OEBPS/ch01.xhtml
```

**Solution:**
If images weren't normalized:
```bash
python scripts/image_normalizer.py "books/book-normalized/OEBPS/"
```

Then re-import course.

---

## Tips and Best Practices

### 1. Always analyze first for new EPUBs

```
/reformat-epub "New Book" --analyze-only
```

This helps you understand:
- What type of EPUB it is
- If it will need normalization
- Estimated processing time

### 2. Keep original EPUBs

Never delete the original EPUB after normalization. The normalized version is in a separate directory:
- Original: `books/Book Name/`
- Normalized: `books/book-name-normalized/`

### 3. Check course-plan.json before importing

```bash
cat course-plan.json | python -m json.tool
```

Verify:
- Chapter titles look correct
- Slugs are valid
- Source files reference correct paths

### 4. Incremental approach for large books

For books with 30+ chapters:
1. Reformat EPUB
2. Import course structure
3. Generate content for a few chapters to verify quality
4. Then batch process the rest

### 5. Backend must be running

Before using `/import-course` (after reformat), ensure:
```bash
# In terminal
source brainer_venv/bin/activate
uvicorn api.main:app --reload --host 0.0.0.0
```

## Performance Benchmarks

Based on actual books processed:

| Book | Chapters | Images | TOC Type | Time | Notes |
|------|----------|--------|----------|------|-------|
| Fundamentals of Data Engineering | 11 | 43 | toc.ncx | 8s | Standard EPUB |
| Computer Systems | 15 | 156 | None | 2m 15s | Split files, normalization |
| Python Crash Course | 20 | 89 | nav.xhtml | 1m 45s | EPUB 3, normalization |
| Clean Code | 17 | 34 | toc.ncx | 6s | Standard EPUB |

**Factors affecting time:**
- Number of XHTML files to process
- Number of images to rename
- Need for semantic detection vs. simple TOC parsing
- File size and complexity
