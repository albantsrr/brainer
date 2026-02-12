---
name: create-chapters
description: Transform raw XHTML chapter content from EPUB books into concise, pedagogical course content with images. Use when the user wants to create or update a specific chapter's content in the Brainer system.
---

# Create Chapters

## Overview

This skill transforms raw book chapters (XHTML files) into structured, pedagogical course content. It extracts content from EPUB chapter files, identifies associated images, generates concise learning material, uploads images to the API, and updates the chapter in the database.

**Key difference from import-course:** The `import-course` skill creates the course structure (course, parts, chapters) with placeholder content. This skill fills in the actual chapter content by processing XHTML files and creating educational material.

## When to Use This Skill

Invoke this skill when the user wants to:
- Create pedagogical content for a specific chapter from an XHTML file
- Transform raw book content into a structured, concise course
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
- Understand the pedagogical flow

### Step 3: Identify Visual Concepts

**⚠️ IMPORTANT: External images are NOT used.**

Instead of uploading images from EPUB files (often poorly positioned), identify visual concepts that need illustration:
- Technical architectures and system diagrams
- Memory layouts and data structures
- Process flows and state machines
- Code execution patterns

**These concepts will be illustrated using inline diagrams (SVG or ASCII art) in Step 5.**

### Step 4: Generate Pedagogical Content

**Transform the content into a concise, structured course following strict pedagogical guidelines.**

**CRITICAL:** Refer to `references/content_transformation.md` for complete transformation guidelines.

**Mandatory Structure (in this exact order):**

1. **Objectifs d'apprentissage** (`<h2>Objectifs d'apprentissage</h2>`)
   - 3-6 actionable learning objectives
   - Use action verbs: comprendre, identifier, appliquer, analyser, construire
   - Aligned with actual chapter content

2. **Pourquoi c'est important** (`<h2>Pourquoi c'est important</h2>`)
   - Concrete impact: performance, security, architecture, debugging
   - Real-world consequences of not mastering this content
   - 2-4 paragraphs maximum

3. **Content Sections** (hierarchical structure)
   - Each main section (`<h2>`) MUST contain:
     - **Concept fondamental** (`<h3>`) - Core concept explanation
     - **Mécanisme interne** (`<h3>`) - How it works technically
     - **Exemple pratique** (`<h3>`) - Concrete example (MANDATORY)
     - **Erreurs fréquentes** (`<h3>`) - Common mistakes (if relevant)
   - Use inline SVG diagrams or ASCII art to clarify complex mechanisms

4. **Synthèse** (`<h2>Synthèse</h2>`)
   - Structured summary of key points (3-6 bullets)
   - Logical schema or mind map (if relevant)
   - Connections to other chapters
   - Next learning steps

**Critical Constraints:**
- ✅ Preserve ALL central mechanisms (technical explanations)
- ✅ NEVER remove essential technical content
- ✅ Simplify language WITHOUT making content incorrect/incomplete
- ✅ Reduce length to 40-60% of original
- ✅ Remove redundancies, digressions, tangential anecdotes
- ✅ Keep all structuring concepts, key examples, definitions

**Level Adaptation (beginner/intermediate/advanced):**
- **beginner**: Simplified vocabulary, analogies, very concrete examples, gradual progression
- **intermediate** (default): Balance theory/practice, technical terms with definitions, focus on patterns
- **advanced**: Implementation details, performance analysis, edge cases, architectural implications

**HTML Structure:**
- Use semantic HTML5 tags only (h2, h3, p, ul, ol, pre, code, blockquote, figure, svg)
- NO inline styles, NO presentational tags, NO CSS classes
- Diagrams: Inline SVG or ASCII art (NO external images)
- Each diagram wrapped in `<figure>` with descriptive `<figcaption>`
- Code: Complete, executable examples with comments

**Language:** All content in French (see `references/content_transformation.md` for translation guidelines)

### Step 5: Create Inline Diagrams

**⚠️ NO external images are uploaded. Create diagrams directly in HTML.**

**Diagram Types:**

1. **SVG Diagrams** - For complex technical concepts:
   ```html
   <figure>
     <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
       <rect x="10" y="10" width="100" height="50" fill="#e0e0e0" stroke="#333"/>
       <text x="60" y="40" text-anchor="middle">Component</text>
       <!-- Additional SVG elements -->
     </svg>
     <figcaption>Diagram description</figcaption>
   </figure>
   ```

2. **ASCII Art** - For simple illustrations:
   ```html
   <figure>
     <pre>
   ┌─────────┐
   │   CPU   │
   └────┬────┘
        │
   ┌────▼────┐
   │ Memory  │
   └─────────┘
     </pre>
     <figcaption>Simple architecture</figcaption>
   </figure>
   ```

3. **Unicode Box-Drawing** - For structured diagrams:
   ```html
   <pre>
   ╔════════════════╗
   ║   Process      ║
   ╠════════════════╣
   ║ Code   │ Data  ║
   ╚════════════════╝
   </pre>
   ```

**When to use diagrams:**
- Memory layouts and address spaces
- System architectures (CPU, memory, I/O)
- Data flows and pipelines
- State machines and control flows
- Stack frames and function calls

### Step 6: Update Chapter Content

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
- Inline diagrams (SVG or ASCII art) from Step 5
- No inline styles (use semantic HTML, styling handled by frontend)
- NO external image references

**Note:** Exercises are created separately via the `/create-exercise` skill.

### Step 7: Report Results

**Display a summary:**
- ✅ Chapter updated: {chapter_title}
- 📄 Content length: {word_count} words
- 🎨 Diagrams created: {diagram_count} inline diagrams
- 📁 Temporary files stored in: `temp/`
- 🔗 View at: `http://localhost:3000/courses/{course_slug}/chapters/{chapter_slug}`

## Important Notes

- **Backend must be running** on `http://localhost:8000` (or configured API URL)
- **Course and chapter must already exist** (created by `import-course` skill first)
- **One chapter at a time** - This skill is not designed for bulk processing
- **Content is pedagogical transformation** - Not literal translation, but educational adaptation
- **Mandatory structure** - MUST follow the exact structure defined in `references/content_transformation.md`
- **Preserve central mechanisms** - NEVER remove essential technical explanations
- **Level parameter** - Optional: `beginner`, `intermediate` (default), or `advanced`
- **French content** - Generate content in French for French courses
- **Preserve technical accuracy** - Simplify language but keep technical details correct
- **Inline diagrams only** - NO external images, create SVG/ASCII diagrams in HTML
- **Temporary files** - All extracted content is stored in `temp/` directory (created automatically)

## Example Usage

**User request:**
> "Crée le contenu pédagogique pour le chapitre 1 du cours [course-name]"

**Skill actions:**
1. ✅ Course found: `course-slug`
2. ✅ Chapter found: `ch01.xhtml` → "Chapter Title"
3. 📖 Extracted content: ~15,000 words → saved to `temp/chapter_course-slug_ch01_extracted.json`
4. 🎨 Skipping image upload (creating inline diagrams instead)
5. ✍️  Generated pedagogical content: ~6,500 words with 8 inline diagrams
6. ✅ Updated chapter in database
7. 🔗 View at: http://localhost:3000/courses/course-slug/chapters/chapter-slug

## Resources

### scripts/create_chapter.py

Python script that orchestrates the chapter creation process:
- Finds and validates chapter XHTML files
- Extracts content and structure from XHTML
- Saves extracted content to `temp/chapter_{course-slug}_ch{XX}_extracted.json`
- Coordinates with Claude for content generation
- Makes API requests to update chapters
- Provides detailed progress reporting
- Automatically creates `temp/` directory if it doesn't exist

**Usage:**
```bash
source brainer_venv/bin/activate
python .claude/skills/create-chapters/scripts/create_chapter.py <course-slug> <chapter-number> [level]
```

**Parameters:**
- `<course-slug>`: Course identifier (e.g., `fundamentals-of-data-engineering`)
- `<chapter-number>`: Chapter number to process (e.g., `1`, `5`)
- `[level]`: Optional difficulty level - `beginner`, `intermediate` (default), or `advanced`

**Examples:**
```bash
# Create chapter 1 (intermediate level by default)
python .claude/skills/create-chapters/scripts/create_chapter.py fundamentals-of-data-engineering 1

# Create chapter 5 for beginners
python .claude/skills/create-chapters/scripts/create_chapter.py fundamentals-of-data-engineering 5 beginner

# Create chapter 3 for advanced learners
python .claude/skills/create-chapters/scripts/create_chapter.py computer-systems-a-programmers-perspective 3 advanced
```

### references/content_transformation.md

Guidelines for transforming raw book content into pedagogical course material:
- Principles of concise writing
- Structuring for learning
- Examples of good transformations
- HTML structure guidelines
