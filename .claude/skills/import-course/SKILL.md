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

Use the existing `scripts/parse_toc.py` to:
- Extract course metadata (title, author)
- Identify parts (Roman numeral sections: I., II., III.)
- Identify chapters (numeric sections: 1., 2., 3.)
- Generate a course slug (kebab-case from title)
- Output a `course-plan.json` with the complete structure

### Step 3: Create Course in Database

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

### Step 4: Report Results

Display a summary:
- Course created with slug
- Number of parts created
- Number of chapters created
- Direct link to view the course in the frontend

## Important Notes

- **Backend must be running** on `http://localhost:8000` (or configured API URL)
- The skill creates the **structure only** (course, parts, chapters)
- Chapter **content extraction** from XHTML files is a separate step (not yet implemented)
- Images are not handled by this skill yet
- If the course slug already exists in the database, the API will return an error

## Script Reference

This skill uses `scripts/import_course.py` which:
- Wraps `parse_toc.py` to generate the course plan
- Makes REST API calls using the `requests` library
- Handles errors gracefully (missing files, API failures, etc.)
- Reads API URL from environment variable `API_URL` (defaults to `http://localhost:8000`)

## Example Usage

**User request:**
> "Import the Fundamentals of Data Engineering book into the database"

**Skill actions:**
1. Find `books/Fundamentals of Data Engineering/toc.ncx`
2. Parse TOC → generate course-plan.json
3. Create course with slug `fundamentals-of-data-engineering`
4. Create 3 parts (from Roman numerals in TOC)
5. Create 11 chapters (from numeric sections in TOC)
6. Report: "✅ Course imported successfully! View at http://localhost:3000/courses/fundamentals-of-data-engineering"

## Resources

### scripts/import_course.py
Python script that performs the actual import:
- Finds and validates toc.ncx files
- Calls parse_toc.py to generate course plan
- Makes API requests to create course entities
- Provides detailed progress and error reporting

Usage:
```bash
source brainer_venv/bin/activate
python .claude/skills/import-course/scripts/import_course.py [book-name]
```

### references/api_endpoints.md
Documents the exact API endpoints and payload formats used for course creation.
