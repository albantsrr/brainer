---
name: create-review-sheets
description: Generate concise review sheets (fiches de révision) for a course part or full course. Reads chapter synopses from the API and synthesizes them into a structured, student-ready revision document. Use when the user wants to create review material from existing course content.
---

# Create Review Sheets

## Overview

This skill generates **fiches de révision** (revision sheets) from chapter synopses stored in the database. It does NOT read full chapter HTML — it uses the lightweight `synopsis` field available on every chapter. Each synopsis is ~300-500 words, making this skill fast and context-efficient even for full courses.

**Prerequisite:** Chapters must have their `synopsis` field populated (done automatically by the `/create-chapters` skill).

---

## When to Use This Skill

- "Crée une fiche de révision pour la partie 1 du cours [slug]"
- "Génère une fiche de révision de l'ensemble du cours [slug]"
- "Je veux réviser la partie 2 du cours [slug]"

---

## Workflow

### Step 1: Identify Scope

Determine from the user's request:
- **Course slug** (required) — e.g., `fundamentals-of-data-engineering`
- **Scope** — one of:
  - A specific **part** (e.g., "partie 1", "part 2")
  - The **full course** ("tout le cours")

### Step 2: Fetch Chapter List with Synopses

```bash
curl -s "http://localhost:8000/api/courses/{course_slug}/chapters"
```

This returns all chapters including their `synopsis` field (the list endpoint includes it). Filter by `part_id` if targeting a specific part.

**If synopses are missing (null):** Warn the user that the relevant chapters need to be processed with `/create-chapters` first.

### Step 3: Identify Part Structure (if needed)

If filtering by part, also fetch parts to get their titles:

```bash
curl -s "http://localhost:8000/api/courses/{course_slug}/parts"
```

### Step 4: Generate the Review Sheet

Using the chapter synopses, synthesize a **fiche de révision** in Markdown.

**Output structure:**

```markdown
# Fiche de révision — [Part Title or Course Title]
> Cours : [Course Title] | [N] chapitres couverts

---

## [Chapter Title]

### Points clés
[Synthesized from synopsis — keep only the most essential]

### Concepts à maîtriser
[Key terms and definitions from synopsis]

### À retenir
[The non-negotiable takeaways]

---

[Repeat for each chapter]

---

## Synthèse globale

### Idées centrales du [cours/partie]
[3-5 overarching ideas that connect the chapters]

### Questions d'auto-évaluation
1. [Question testing understanding of chapter 1]
2. [Question testing understanding of chapter 2]
...
[1-2 questions per chapter, focused on fundamentals]
```

**Generation rules:**
- Stay faithful to synopsis content — do not invent or hallucinate
- Synthesize, don't just copy — reformulate for revision clarity
- Keep it **scannable**: short bullets, bold key terms
- In French; technical terms in English where standard (e.g., pipeline, batch, stream)
- Target total length: 600-1200 words for a part, 1500-2500 for a full course

**Formatting — bullet points:**
- Always use `-` for bullet lists — never `•`, never `*`

**Formatting — punctuation (virgules vs tirets) :**
- Use commas for parenthetical insertions mid-sentence — not em-dashes (—)
- ❌ `Le pipeline — conçu pour le streaming — traite les données en temps réel.`
- ✅ `Le pipeline, conçu pour le streaming, traite les données en temps réel.`
- Em-dashes are only allowed to introduce a direct explanation or example at the end of a sentence

**Formatting — mathematical notation:**
- Never write math expressions in raw ASCII in running text
- Exponents: use `<sup>` — e.g. `2<sup>n</sup>`, `O(n<sup>2</sup>)`
- Subscripts: use `<sub>` — e.g. `log<sub>2</sub>(n)`, `a<sub>i</sub>`
- Use Unicode math symbols directly: ≤ ≥ ≠ ≈ × ÷ ± √ ∞ ∑ → ⌊ ⌋ ⌈ ⌉
- ❌ `2^n`, `O(n^2)`, `x >= 0`, `log2(n)`
- ✅ `2<sup>n</sup>`, `O(n<sup>2</sup>)`, `x ≥ 0`, `log<sub>2</sub>(n)`

### Step 5: Output and Save the Review Sheet

Print the Markdown directly in the conversation, then **save it to the database**.

**For a specific part**, call the upsert endpoint (creates or replaces):
```bash
TOKEN=$(grep BRAINER_TOKEN .env | cut -d= -f2)
curl -s -X POST "http://localhost:8000/api/parts/{part_id}/review-sheet" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"content\": $(python3 -c "import json,sys; print(json.dumps(sys.stdin.read()))" <<'MARKDOWN'
{generated_markdown}
MARKDOWN
)}"
```

Or more simply with Python to handle the JSON escaping:
```bash
TOKEN=$(grep BRAINER_TOKEN .env | cut -d= -f2)
python3 -c "
import json, urllib.request
content = '''
{generated_markdown}
'''
data = json.dumps({'content': content}).encode()
req = urllib.request.Request(
    'http://localhost:8000/api/parts/{part_id}/review-sheet',
    data=data,
    headers={'Authorization': f'Bearer $TOKEN', 'Content-Type': 'application/json'},
    method='POST'
)
resp = urllib.request.urlopen(req)
print(json.loads(resp.read()))
"
```

**For a full course**, call the endpoint once per part that has a review sheet.

**Auth note:** Token is in `.env` as `BRAINER_TOKEN`. If missing or expired, re-login:
```bash
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"skills@brainer.dev","password":"brainer-skills-2026"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])"
```

### Step 6: Report

```
✅ Fiche de révision générée et sauvegardée en BDD
📚 Cours : {course_title}
📂 Scope : {Part Title | Cours complet}
📖 Chapitres couverts : {N}
💾 Sauvegardé : review_sheet id={id} (partie {part_id})
⚠️  Synopses manquants : {list of chapters without synopsis, if any}
```

---

## Notes

- **Backend must be running** on `http://localhost:8000`
- Read endpoints are public; write endpoints require auth (`BRAINER_TOKEN`)
- If a chapter has no synopsis, skip it and warn the user
- POST `/parts/{part_id}/review-sheet` is an **upsert** — safe to call multiple times (regenerate = replace)
- For **interview questions** covering the full course, use the same approach with the `/create-interview-questions` skill (not yet implemented — use this skill as a reference)

---

## Example Usage

**User request:**
> "Crée une fiche de révision pour la partie 1 du cours fundamentals-of-data-engineering"

**Skill actions:**
1. `GET /api/courses/fundamentals-of-data-engineering/chapters` → 12 chapters with synopses
2. Filter chapters where `part_id == 1` → 4 chapters
3. `GET /api/courses/fundamentals-of-data-engineering/parts` → get part title
4. Generate fiche de révision from 4 synopses (~1600 tokens input)
5. Output structured Markdown

**Total context used for chapter content:** ~2000 tokens (4 synopses × 500 words) — very efficient.
