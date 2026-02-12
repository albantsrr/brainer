---
name: import-course
description: Import a course from an EPUB book into the database by parsing toc.ncx files and creating course, parts, and chapters via the API. Use when the user wants to add a new book/course to the Brainer system.
---

# Import Course

## Overview

This skill automates the process of importing a course from an EPUB book into the Brainer database. It finds toc.ncx files in the books/ directory, parses them to extract course structure (title, parts, chapters), and creates all entities in the database via REST API calls.

## When to Use This Skill

Invoke this skill when the user wants to:
- Import a new book/course into Brainer
- Add a course from the books/ directory to the database
- Convert an EPUB's table of contents into a structured course

## Workflow

### Step 1: Find TOC File

Search for `toc.ncx` files in the `books/` directory:
- If a specific book name is provided, search only in that subdirectory
- If no name provided, list all available books with toc.ncx files
- Ask user to confirm which book to import if multiple are found

### Step 2: Parse TOC Structure

Use the existing `.claude/skills/import-course/scripts/parse_toc.py` to:
- Extract course metadata (title, author)
- Identify parts (Roman numeral sections: I., II., III.)
- Identify chapters (numeric sections: 1., 2., 3.)
- Generate a course slug (kebab-case from title)
- Output a `temp/course-plan.json` with the complete structure

### Step 3: Translate to French

**⚠️ IMPORTANT: All titles must be translated to French before importing.**

1. Read the generated `temp/course-plan.json` file
2. Translate ALL titles (course, parts, chapters) to French:
   - **NOT literal translation** - use pedagogical, comprehensible French
   - Preserve technical terms when appropriate (e.g., "Data Engineering" → "Ingénierie des données")
   - Make titles clear and educational (e.g., "Getting Started" → "Premiers pas")
3. Save the translated version as `temp/course-plan-fr.json`
4. The script will automatically use the French version if it exists

**Translation Guidelines:**
- Course title: Clear, professional French (e.g., "Fundamentals of Data Engineering" → "Principes fondamentaux de l'ingénierie des données")
- Part titles: Natural French structure (e.g., "Part I: Introduction" → "Partie I : Introduction")
- Chapter titles: Educational and clear (e.g., "Chapter 1: Getting Started" → "Chapitre 1 : Premiers pas")
- Keep technical keywords recognizable for search/SEO

### Step 4: Create Course in Database

Make API calls to create the course structure:

1. **Create Course** (`POST /api/courses`)
   ```json
   {
     "title": "Course title from TOC",
     "slug": "course-slug",
     "description": "by Author Name (if available)"
   }
   ```

2. **Create Parts** (`POST /api/courses/{slug}/parts` for each part)
   ```json
   {
     "order": 1,
     "title": "Part title from TOC",
     "description": ""
   }
   ```

3. **Create Chapters** (`POST /api/courses/{slug}/chapters` for each chapter)
   ```json
   {
     "part_id": 123,
     "order": 1,
     "title": "Chapter title from TOC",
     "slug": "chapter-slug",
     "content": "<p>Chapter content will be added later</p>"
   }
   ```

### Step 5: Report Results

Display a summary:
- Course created with slug (in French)
- Number of parts created
- Number of chapters created
- Direct link to view the course in the frontend

## Important Notes

- **Backend must be running** on `http://localhost:8000` (or configured API URL)
- **All titles MUST be in French** - the skill will generate and use `temp/course-plan-fr.json`
- The skill creates the **structure only** (course, parts, chapters with placeholder content)
- Chapter **content extraction** from XHTML files is done separately via `/create-chapters`
- Images are handled by the `/create-chapters` skill
- If the course slug already exists in the database, the API will return an error
- Temporary files are stored in `temp/` directory (created automatically)

## Script Reference

This skill uses `.claude/skills/import-course/scripts/import_course.py` which:
- Wraps `parse_toc.py` to generate the course plan in `temp/course-plan.json`
- Looks for French translation in `temp/course-plan-fr.json` (required)
- Makes REST API calls using the `requests` library
- Handles errors gracefully (missing files, API failures, etc.)
- Reads API URL from environment variable `API_URL` (defaults to `http://localhost:8000`)
- Automatically creates `temp/` directory if it doesn't exist

## Example Usage

**User request:**
> "Import the Fundamentals of Data Engineering book into the database"

**Skill actions:**
1. Find `books/Fundamentals of Data Engineering/toc.ncx`
2. Parse TOC → generate `temp/course-plan.json`
3. **Translate to French** → generate `temp/course-plan-fr.json` with:
   - Course: "Principes fondamentaux de l'ingénierie des données"
   - Parts: "Partie I : Fondations de l'ingénierie des données", etc.
   - Chapters: "Chapitre 1 : Introduction à l'ingénierie des données", etc.
4. Create course with slug `fundamentals-of-data-engineering` (from French title)
5. Create 3 parts (with French titles)
6. Create 11 chapters (with French titles)
7. Report: "✅ Course imported successfully! View at http://localhost:3000/courses/fundamentals-of-data-engineering"

## Resources

### .claude/skills/import-course/scripts/import_course.py
Python script that performs the actual import:
- Finds and validates toc.ncx files
- Calls parse_toc.py to generate course plan
- Makes API requests to create course entities
- Provides detailed progress and error reporting

Usage:
```bash
source brainer_venv/bin/activate

# Step 1: Generate course plan (English)
python .claude/skills/import-course/scripts/import_course.py --generate-plan "Book Name"

# Step 2: Claude translates temp/course-plan.json to temp/course-plan-fr.json

# Step 3: Import with French titles
python .claude/skills/import-course/scripts/import_course.py "Book Name"
```

### references/api_endpoints.md
Documents the exact API endpoints and payload formats used for course creation.

### references/french_translation_guide.md
Complete guide for translating course, part, and chapter titles to French:
- Translation principles (pedagogical, not literal)
- Common technical terms dictionary
- Examples of good and bad translations
- Complete workflow from English plan to French import
