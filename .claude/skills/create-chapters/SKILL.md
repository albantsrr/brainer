---
name: create-chapters
description: Transform raw XHTML chapter content from EPUB books into concise, pedagogical course content with inline diagrams. Use when the user wants to create or update a specific chapter's content in the Brainer system.
---

# Create Chapters

## Overview

This skill transforms raw book chapters (XHTML files) into structured, pedagogical course content. It extracts content from EPUB chapter files, generates concise learning material with inline diagrams, and updates the chapter in the database.

**Key difference from import-course:** The `import-course` skill creates the course structure (course, parts, chapters) with placeholder content. This skill fills in the actual chapter content by processing XHTML files and creating educational material.

## When to Use This Skill

Invoke this skill when the user wants to:
- Create pedagogical content for a specific chapter from an XHTML file
- Transform raw book content into a structured, concise course
- Process one chapter at a time (not bulk processing)

## Workflow

### Step 1: Identify Chapter and Course

**Required information:**
- Course slug (e.g., `fundamentals-of-data-engineering`)
- Chapter number (e.g., `1` for the first course chapter)

**Actions:**
1. Verify the course exists in the database via `GET /api/courses/{slug}`
2. Retrieve existing chapter info from API: `GET /api/courses/{slug}/chapters`
3. Identify the target chapter by `order` number → get its `slug`
4. **Find source XHTML files** via source-map (preferred) or chapter number (fallback):
   - Search `books/*/source-map.json` for a file where `course_slug` matches the course
   - Look up the chapter slug in `source_map["chapters"]` to get `source_files: []`
   - If no source-map exists (older courses): fall back to `books/{course-title}/OEBPS/ch{XX}.xhtml`
5. For each file in `source_files`, locate it in the book's OEBPS directory (the script handles this)

**Note:** A single course chapter may map to multiple book XHTML files (e.g., `["ch01.xhtml", "ch02.xhtml", "ch03.xhtml"]`). The script concatenates them before extraction — treat the combined content as one source to analyze.

### Step 2: Extract and Analyze Content

**Read the XHTML file:**
- Parse HTML structure (headings, paragraphs, lists, code blocks, blockquotes)
- Extract text content while preserving semantic structure
- Note section hierarchy and organization

**Analyze the content:**
- Identify main topics and key concepts
- Determine learning objectives
- Understand the pedagogical flow

**Après l'analyse, le livre est fermé mentalement.**
Le fichier XHTML a servi à comprendre quels concepts enseigner.
Le contenu de l'Étape 4 doit venir de l'expertise de l'enseignant, pas du texte lu.

### Step 3: Identify Visual Concepts

**⚠️ IMPORTANT: External images are NOT used.**

Instead, identify concepts that benefit from a diagram:
- Technical architectures and system diagrams
- Memory layouts and data structures
- Process flows and state machines
- Code execution patterns

**These concepts will be illustrated using inline Mermaid diagrams in Step 5.**

### Step 4: Generate Pedagogical Content

**Transform the content into a concise, structured course following the pedagogical guidelines.**

**CRITICAL:** Refer to the `references/` folder for complete guidelines:
- `references/00_principes.md` — Mission, contraintes, mécanismes centraux, checklist
- `references/01_structure_chapitre.md` — Structure obligatoire des chapitres (templates + exemples)
- `references/02_diagrammes.md` — Guidelines Mermaid (types, conventions, règles taille)
- `references/03_langue_francais.md` — Règles français/anglais
- `references/04_maths.md` — Notation mathématique (`<sup>`, `<sub>`, Unicode) — jamais `^` ou `_` dans le texte

**Mandatory Structure (in this exact order):**

0. **Introduction** (no `<h2>` header — just paragraphs at the top)
   - 2-3 paragraphs, narrative and engaging tone
   - Contextualizes the chapter in the overall course
   - Eases the reader in gently (no technical depth yet)

1. **Objectifs d'apprentissage** (`<h2>Objectifs d'apprentissage</h2>`)
   - 3-6 actionable learning objectives with action verbs

2. **Pourquoi c'est important** (`<h2>Pourquoi c'est important</h2>`)
   - Concrete impact: performance, security, architecture, debugging
   - 2-4 paragraphs maximum

3. **Content Sections** (hierarchical structure)
   - Each main section (`<h2>`) MUST contain:
     - **Concept fondamental** (`<h3>`) - Core concept explanation
     - **Mécanisme interne** (`<h3>`) - How it works technically
     - **Exemple pratique** (`<h3>`) - Concrete example (MANDATORY)
     - **Erreurs fréquentes** (`<h3>`) - Common mistakes (if relevant)

4. **Synthèse** (`<h2>Synthèse</h2>`)
   - Structured summary of key points (3-6 bullets)
   - Next learning steps

**ANTIPLAGIAT — CONTRAINTE ABSOLUE :**
Le XHTML indique QUOI enseigner. Il ne dicte pas COMMENT l'exprimer.
- Exemples : inventer de toutes pièces — jamais réutiliser ceux du livre
- Code : écrire de zéro (variables, scénario, structure différents du livre)
- Analogies : inventer. Si une vient "naturellement" du livre, la rejeter et en créer une autre
- Structure des `<h2>` : suivre `01_structure_chapitre.md`, pas l'ordre du livre

Voir `references/00_principes.md` → section "Indépendance de la Source — Règle Absolue"

**Critical Constraints:**
- ✅ Couvrir TOUS les mécanismes centraux — avec des EXPLICATIONS ORIGINALES
- ✅ NEVER remove essential technical content
- ✅ Simplify language WITHOUT making content incorrect/incomplete
- ✅ Reduce length to 40-60% of original
- ✅ Remove redundancies, digressions, tangential anecdotes

**HTML Structure:**
- Use semantic HTML5 tags only (h2, h3, p, ul, ol, pre, code, blockquote)
- NO inline styles, NO presentational tags, NO CSS classes
- ALWAYS use `<ul>`/`<ol>` for lists — NEVER convert to paragraphs
- Code: Complete, executable examples with comments

**Language:** All content in French — see `references/03_langue_francais.md`

### Step 5: Create Inline Diagrams

Use **Mermaid.js** for all technical diagrams — see `references/02_diagrammes.md` for types, conventions, and size constraints.

```html
<pre><code class="language-mermaid">
graph TD
    A[Component A] --> B[Component B]
</code></pre>
```

Target 2-4 diagrams per chapter. Only use diagrams when they add clarity beyond what text can express.

### Step 6: Update Chapter Content

**Endpoint:** `PUT /api/courses/{course_slug}/chapters/{chapter_slug}`

**Request body:**
```json
{
  "content": "<p>Generated pedagogical content...</p>..."
}
```

**Note:** Exercises are created separately via the `/create-exercise` skill.

### Step 6.5: Generate and Save the Synopsis

**After saving the HTML content**, generate a concise Markdown synopsis of the chapter. The synopsis is used by downstream skills (`/create-review-sheets`, `/create-interview-questions`) — it must be self-contained and independent from the HTML.

**Format (strict):**
```markdown
## Points clés
- [5-8 bullet points covering the most important ideas]

## Concepts importants
- **Terme** : définition courte (1 ligne max)
- ...

## À retenir absolument
- [3-5 items — what a student must know for an exam or interview]
```

**Constraints:**
- 300-500 words max — concise is the goal
- In French, technical terms in English where appropriate
- No HTML — pure Markdown
- Does NOT duplicate the HTML content structure — it synthesizes it

**Save via:**
```bash
curl -s -X PUT "http://localhost:8000/api/courses/{course_slug}/chapters/{chapter_slug}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BRAINER_TOKEN" \
  -d '{"synopsis": "## Points clés\n..."}'
```

Or using the helper function available in `scripts/create_chapter.py`:
```python
from create_chapter import update_chapter_synopsis
update_chapter_synopsis(course_slug, chapter_slug, synopsis_markdown)
```

### Step 7: Report Results

**Display a summary:**
- ✅ Chapter updated: {chapter_title}
- 📄 Content length: {word_count} words
- 🎨 Diagrams created: {diagram_count}
- 📋 Synopsis: generated ({word_count_synopsis} words)
- 🔗 View at: `http://localhost:3000/courses/{course_slug}/chapters/{chapter_slug}`

## Important Notes

- **Backend must be running** on `http://localhost:8000`
- **`BRAINER_TOKEN` required:** Write endpoints are protected. Get a token first:
  ```bash
  export BRAINER_TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"you@example.com","password":"yourpassword"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
  ```
- **Course and chapter must already exist** (created by `import-course` skill first)
- **One chapter at a time** — This skill is not designed for bulk processing

## Example Usage

**User request:**
> "Crée le contenu pédagogique pour le chapitre 1 du cours [course-name]"

**Skill actions:**
1. ✅ Course found: `course-slug`
2. ✅ Chapter found: `ch01.xhtml` → "Chapter Title"
3. 📖 Extracted content: ~15,000 words → saved to `temp/chapter_course-slug_ch01_extracted.json`
4. ✍️  Generated pedagogical content: ~6,500 words with 3 Mermaid diagrams
5. ✅ Updated chapter in database
6. 🔗 View at: http://localhost:3000/courses/course-slug/chapters/chapter-slug

## Resources

### scripts/create_chapter.py

Orchestrates the chapter creation process:
- Finds and validates chapter XHTML files
- Extracts content and structure from XHTML
- Saves extracted content to `temp/chapter_{course-slug}_ch{XX}_extracted.json`
- Makes API requests to update chapters

**Usage:**
```bash
source brainer_venv/bin/activate
python .claude/skills/create-chapters/scripts/create_chapter.py <course-slug> <chapter-number>
```

**Parameters:**
- `<course-slug>`: Course identifier (e.g., `fundamentals-of-data-engineering`)
- `<chapter-number>`: Chapter number to process (e.g., `1`, `5`)

**Examples:**
```bash
python .claude/skills/create-chapters/scripts/create_chapter.py fundamentals-of-data-engineering 1
python .claude/skills/create-chapters/scripts/create_chapter.py computer-systems-a-programmers-perspective 3
```

### references/

Modular guidelines for content transformation:
- `00_principes.md` — Mission, contraintes, mécanismes centraux, checklist
- `01_structure_chapitre.md` — Structure obligatoire avec templates et exemples
- `02_diagrammes.md` — Guidelines Mermaid (types, conventions, taille)
- `03_langue_francais.md` — Règles français/anglais avec exemples
- `04_maths.md` — Notation mathématique (`<sup>`, `<sub>`, Unicode) — jamais `^` ou `_` dans le texte
