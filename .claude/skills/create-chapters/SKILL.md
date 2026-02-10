---
name: create-chapters
description: Transform raw XHTML chapter content from EPUB books into concise, pedagogical course content with exercises and images. Use when the user wants to create or update a specific chapter's content in the Brainer system.
---

# Create Chapters

## Overview

This skill transforms raw book chapters (XHTML files) into structured, pedagogical course content. It extracts content from EPUB chapter files, identifies associated images, generates concise learning material with exercises, uploads images to the API, and updates the chapter in the database.

**Key difference from import-course:** The `import-course` skill creates the course structure (course, parts, chapters) with placeholder content. This skill fills in the actual chapter content by processing XHTML files and creating educational material.

## When to Use This Skill

Invoke this skill when the user wants to:
- Create pedagogical content for a specific chapter from an XHTML file
- Transform raw book content into a structured, concise course
- Add exercises to a chapter
- Update chapter content with associated images
- Process one chapter at a time (not bulk processing)

## Workflow

### Step 1: Identify Chapter and Course

**Required information:**
- Course slug (e.g., `fundamentals-of-data-engineering`)
- Chapter number (e.g., `1` for ch01.xhtml)

**Actions:**
1. Verify the course exists in the database via `GET /api/courses/{slug}`
2. Find the chapter XHTML file: `books/{course-title}/OEBPS/ch{XX}.xhtml` (where XX is zero-padded chapter number)
3. Retrieve existing chapter info from API: `GET /api/courses/{slug}/chapters`
4. Identify the chapter slug to update

### Step 2: Extract and Analyze Content

**Read the XHTML file:**
- Parse HTML structure (headings, paragraphs, lists, code blocks, blockquotes)
- Extract text content while preserving semantic structure
- Identify image references (e.g., `<img src="Images/fode_0101.png"/>`)
- Note section hierarchy and organization

**Analyze the content:**
- Identify main topics and key concepts
- Determine learning objectives
- Spot opportunities for exercises (concepts to test, practical applications)
- Understand the pedagogical flow

### Step 3: Find Associated Images

**Image naming convention:**
- Chapter 1 images: `fode_01*.png` (e.g., fode_0101.png, fode_0102.png)
- Chapter 2 images: `fode_02*.png`
- Chapter N images: `fode_0N*.png` (for N < 10) or `fode_N*.png` (for N >= 10)

**Location:** `books/{course-title}/OEBPS/Images/`

**Actions:**
1. List all images matching the pattern for this chapter
2. Note which images are referenced in the XHTML
3. Prepare to upload all chapter images (even if not currently used in generated content)

### Step 4: Generate Pedagogical Content

**Transform the content into a concise, structured course:**

**Guidelines:**
- **Conciseness:** Distill the essential concepts, removing verbose explanations
- **Pedagogy:** Structure content for learning, not just reading
  - Start with learning objectives or key questions
  - Use clear section headings
  - Include practical examples
  - Add visual elements (diagrams, code examples)
- **Clarity:** Use simple, direct language
- **Structure:** Use semantic HTML5 tags:
  - `<h2>` for main sections
  - `<h3>` for subsections
  - `<p>` for paragraphs
  - `<ul>` or `<ol>` for lists
  - `<pre><code>` for code blocks
  - `<blockquote>` for important quotes or callouts
  - `<figure>` and `<figcaption>` for images
  - `<strong>` for emphasis, `<em>` for italics

**Image integration:**
- Reference images using the uploaded URL format: `/static/images/{filename}`
- Add descriptive captions
- Place images contextually near relevant content

**Content length target:** Aim for 40-60% of the original length while preserving all key concepts.

### Step 5: Generate Exercises

**Create 2-4 exercises per chapter** based on the content:

**Exercise types:**
1. **Multiple Choice** - Test conceptual understanding
2. **True/False** - Quick comprehension checks
3. **Code/Practical** - Apply concepts (for technical chapters)

**Exercise creation via API:**

**Endpoint:** `POST /api/chapters/{chapter_id}/exercises`

**Multiple Choice format:**
```json
{
  "order": 1,
  "title": "Understanding Data Engineering",
  "type": "multiple_choice",
  "content": {
    "question": "What is the primary role of a data engineer?",
    "options": [
      "Analyze data to extract insights",
      "Build and maintain data pipelines and infrastructure",
      "Create machine learning models",
      "Design user interfaces for data visualization"
    ],
    "correct_index": 1,
    "explanation": "Data engineers focus on building and maintaining the infrastructure and systems that enable data collection, storage, and processing. Data scientists analyze the data, ML engineers build models, and UI designers create visualizations."
  }
}
```

**True/False format:**
```json
{
  "order": 2,
  "title": "Data Engineering Evolution",
  "type": "true_false",
  "content": {
    "statement": "Big data tools like Hadoop are always necessary for processing large datasets.",
    "correct_answer": false,
    "explanation": "Modern cloud services and managed solutions often provide better alternatives to managing Hadoop clusters, especially with simplified abstractions and pay-as-you-go models."
  }
}
```

**Code Exercise format:**
```json
{
  "order": 3,
  "title": "SQL Query Practice",
  "type": "code",
  "content": {
    "instructions": "Write a SQL query to select all users who joined in the last 30 days.",
    "language": "sql",
    "starter_code": "SELECT * FROM users\nWHERE ",
    "solution": "SELECT * FROM users\nWHERE created_at >= CURRENT_DATE - INTERVAL '30 days';",
    "hints": [
      "Use the CURRENT_DATE function",
      "Consider using INTERVAL for date arithmetic"
    ]
  }
}
```

**Exercise guidelines:**
- Order exercises logically (start easy, increase difficulty)
- Ensure exercises cover different aspects of the chapter
- Provide clear, helpful explanations for correct answers
- Make distractors plausible but clearly incorrect

### Step 6: Upload Images

**For each image found in Step 3:**

1. **Read image file:** `books/{course-title}/OEBPS/Images/{filename}`
2. **Upload via API:** `POST /api/images/upload`
   - Content-Type: `multipart/form-data`
   - Field name: `file`
3. **Receive URL:** Response contains the static URL (e.g., `/static/images/fode_0101.png`)
4. **Update content references:** Replace image references in the HTML content with the returned URLs

**Note:** Images are uploaded to `api/static/images/` and served at `/static/images/{filename}`

### Step 7: Update Chapter Content

**Update the chapter via API:**

**Endpoint:** `PUT /api/courses/{course_slug}/chapters/{chapter_slug}`

**Request body:**
```json
{
  "content": "<h2>Introduction</h2><p>Generated pedagogical content...</p>..."
}
```

**The content field should contain:**
- Complete HTML content from Step 4
- Image references using uploaded URLs from Step 6
- No inline styles (use semantic HTML, styling handled by frontend)

**Note:** Exercises are created separately (Step 5), not included in chapter content.

### Step 8: Report Results

**Display a summary:**
- ✅ Chapter updated: {chapter_title}
- 📄 Content length: {word_count} words
- 🖼️  Images uploaded: {image_count}
- ✏️  Exercises created: {exercise_count}
- 🔗 View at: `http://localhost:3000/courses/{course_slug}/chapters/{chapter_slug}`

## Important Notes

- **Backend must be running** on `http://localhost:8000` (or configured API URL)
- **Course and chapter must already exist** (created by `import-course` skill first)
- **One chapter at a time** - This skill is not designed for bulk processing
- **Content is pedagogical transformation** - Not literal translation, but educational adaptation
- **French content** - Generate content in French for French courses
- **Preserve technical accuracy** - Simplify explanations but keep technical details correct
- **Image optimization** - Images are uploaded as-is, no resizing or compression

## Example Usage

**User request:**
> "Crée le contenu pédagogique pour le chapitre 1 du cours Fundamentals of Data Engineering"

**Skill actions:**
1. ✅ Course found: `fundamentals-of-data-engineering`
2. ✅ Chapter found: `ch01.xhtml` → "Data Engineering Described"
3. 📖 Extracted content: ~15,000 words, 12 images referenced
4. 🖼️  Found 12 images: `fode_0101.png` through `fode_0112.png`
5. ✍️  Generated pedagogical content: ~6,500 words (concise, structured)
6. ✏️  Created 3 exercises: 2 multiple choice, 1 true/false
7. ⬆️  Uploaded 12 images
8. ✅ Updated chapter in database
9. 🔗 View at: http://localhost:3000/courses/fundamentals-of-data-engineering/chapters/data-engineering-described

## Resources

### scripts/create_chapter.py

Python script that orchestrates the chapter creation process:
- Finds and validates chapter XHTML files
- Extracts content and structure from XHTML
- Identifies and uploads images
- Coordinates with Claude for content generation
- Makes API requests to update chapters and create exercises
- Provides detailed progress reporting

**Usage:**
```bash
source brainer_venv/bin/activate
python .claude/skills/create-chapters/scripts/create_chapter.py <course-slug> <chapter-number>
```

**Examples:**
```bash
# Create chapter 1
python .claude/skills/create-chapters/scripts/create_chapter.py fundamentals-of-data-engineering 1

# Create chapter 5
python .claude/skills/create-chapters/scripts/create_chapter.py fundamentals-of-data-engineering 5
```

### references/content_transformation.md

Guidelines for transforming raw book content into pedagogical course material:
- Principles of concise writing
- Structuring for learning
- Examples of good transformations
- HTML structure guidelines

### references/exercise_creation.md

Guidelines and examples for creating effective exercises:
- Exercise type selection criteria
- Writing good questions and distractors
- Explanation best practices
- Examples for each exercise type
