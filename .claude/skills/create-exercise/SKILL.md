---
name: create-exercise
description: Create targeted exercises for chapters or course sections to test and reinforce learning. Generates multiple choice, true/false, code, or calculation exercises based on chapter content and pedagogical domain. Use when you want to add exercises to existing course material.
---

# Create Exercise

## Overview

This skill creates pedagogical exercises for course chapters. It detects the pedagogical domain (informatique, maths, general) and generates domain-appropriate exercises that test understanding and reinforce key concepts.

**Exercise types available:**
- `multiple_choice` — 4 options with explanation (all domains)
- `true_false` — statement + boolean answer with explanation (all domains)
- `code` — code to write with starter + solution + hints (informatique only)
- `calculation` — math problem with step hints and HTML solution (maths only)

## Workflow

### Step 1: Identify Target Content

**Required information:**
- Course slug (e.g., `statistiques-theorie-methodes`)
- Chapter slug or chapter ID
- Optional: specific section or topic
- Optional: exercise type preference
- Optional: number of exercises to create (default: 2-4)

**Actions:**
1. Verify the course exists via `GET /api/courses/{slug}`
2. Retrieve chapter info via `GET /api/courses/{slug}/chapters` — response includes `id`, `slug`, `title`, and **`synopsis`** for each chapter
3. List existing exercises via `GET /api/chapters/{chapter_id}/exercises` to avoid duplication

### Step 1.5: Detect Pedagogical Domain

**Priority order:**
1. Explicit mention in user prompt ("exercices de maths", "code Python", etc.)
2. Course title keywords:
   - **informatique** — "computer", "systems", "data engineering", "programming", "algorithms", "networks"
   - **maths** — "statistiques", "mathématiques", "probabilités", "algèbre", "analyse", "calcul"
   - **general** — anything else
3. Ask the user if ambiguous

**Once detected, load the corresponding domain reference:**
- `references/domains/informatique.md` — CS: favour `code` + `multiple_choice`
- `references/domains/maths.md` — maths: favour `calculation` + `multiple_choice`, NO `code`
- `references/domains/general.md` — mix based on content

### Step 2: Analyze the Chapter Synopsis

**The `synopsis` field is the primary source for exercise generation.** It contains:
- Key bullet points summarizing main ideas
- A "Concepts importants" section with definitions
- An "À retenir absolument" section

**Use the synopsis to:**
- Identify the 3-5 core concepts to test
- Understand key definitions and their nuances
- Extract common misconceptions (good for true/false)
- Find "why" explanations (good for application-level MCQ)

**Do NOT fetch the full chapter HTML content** — the synopsis is sufficient.

### Step 3: Determine Exercise Strategy

**For conceptual content:**
- Multiple choice for definitions and comparisons
- True/false for common misconceptions
- Focus on understanding "why" not just "what"

**For technical/CS content:**
- Code exercises for practical application
- Multiple choice for tool selection and trade-offs
- True/false for capability statements

**For mathematical content:**
- Calculation exercises for numerical application of theorems/formulas
- Multiple choice with KaTeX formulas, plausible distractors (sign errors, theorem confusion)
- True/false for properties and conditions

**Difficulty considerations:**
- **Easy:** Basic definitions, straightforward facts
- **Medium:** Application of concepts, comparisons
- **Hard:** Problem-solving, multi-step reasoning, edge cases

### Step 4: Generate Exercises

**All text must be in French.**

---

#### Multiple Choice Exercise

```json
{
  "order": 1,
  "title": "Titre court et descriptif",
  "type": "multiple_choice",
  "content": {
    "question": "Question claire et précise ?",
    "options": [
      {"text": "Option A", "is_correct": false},
      {"text": "Option B (correcte)", "is_correct": true},
      {"text": "Option C", "is_correct": false},
      {"text": "Option D", "is_correct": false}
    ],
    "explanation": "Explication détaillée de pourquoi B est correct et pourquoi les autres options sont incorrectes."
  },
  "auto_generated": true
}
```

**Quality criteria:**
- Question tests understanding, not memorization
- 4 options with plausible distractors (not obviously wrong)
- Explanation reinforces learning (2-4 sentences)
- For maths: formulas in `<span class="math-inline">LaTeX</span>` inside question/options/explanation

---

#### True/False Exercise

```json
{
  "order": 2,
  "title": "Titre court et descriptif",
  "type": "true_false",
  "content": {
    "statement": "Affirmation claire et testable.",
    "answer": false,
    "explanation": "Explication de pourquoi c'est vrai/faux avec contexte additionnel."
  },
  "auto_generated": true
}
```

**Quality criteria:**
- Statement is clearly true or false (not ambiguous)
- Tests important concept or common misconception
- Explanation provides educational value

---

#### Code Exercise (informatique uniquement)

```json
{
  "order": 3,
  "title": "Titre court et descriptif",
  "type": "code",
  "content": {
    "instructions": "Description claire de ce que l'apprenant doit accomplir.",
    "language": "python",
    "starter_code": "# Point de départ\ndef function_name():\n    # TODO: Implémenter\n    pass",
    "solution": "def function_name():\n    # Implémentation complète\n    return result",
    "hints": [
      "Indice 1 : Guide la réflexion",
      "Indice 2 : Plus direct",
      "Indice 3 : Presque la solution"
    ]
  },
  "auto_generated": true
}
```

**Quality criteria:**
- Instructions specific and clear
- Starter code provides structure
- Solution complete and follows best practices
- Hints are progressive (subtle → direct)
- **DO NOT use for maths chapters** — use `calculation` instead

---

#### Calculation Exercise (maths uniquement)

```json
{
  "order": 4,
  "title": "Titre court et descriptif",
  "type": "calculation",
  "content": {
    "problem": "<p>HTML de l'énoncé avec formules <span class=\"math-inline\">LaTeX</span> et éventuellement <div class=\"math-block\">LaTeX</div>.</p>",
    "steps": [
      "Description étape 1 (en texte simple, sans HTML)",
      "Description étape 2",
      "Description étape 3"
    ],
    "solution": "<p>HTML de la solution complète, avec chaque calcul dans <span class=\"math-inline\">LaTeX</span> ou <div class=\"math-block\">LaTeX</div>. Interpréter le résultat en français.</p>",
    "hints": [
      "Indice 1 : orientez-vous vers la bonne formule",
      "Indice 2 : plus précis",
      "Indice 3 : presque la réponse"
    ]
  },
  "auto_generated": true
}
```

**Quality criteria:**
- Problem: HTML with KaTeX for all formulas — NEVER plain text `^` or `_`
- Steps: plain text descriptions of each calculation step (shown as progressive hints if requested)
- Solution: HTML with KaTeX, showing each step and interpreting the result
- Hints: 3 progressive hints (vague → precise)
- Numerical values should be concrete (e.g., n=10 data points, not abstract variables only)
- Follow the pattern: concrete situation → identify what to calculate → step-by-step → interpret

**KaTeX notation rules (in problem and solution HTML):**
- Inline formula: `<span class="math-inline">\bar{x} = \frac{1}{n}\sum_{i=1}^n x_i</span>`
- Block formula: `<div class="math-block">P(A \mid B) = \frac{P(A \cap B)}{P(B)}</div>`
- Unicode in plain text: ≤ ≥ ≠ ≈ × ÷ ± √ ∞ ∑ ∏ ∈
- NEVER use `^` for exponents or `_` for subscripts outside KaTeX

---

### Step 5: Create Exercises via API

```bash
POST /api/chapters/{chapter_id}/exercises
Authorization: Bearer $BRAINER_TOKEN
Content-Type: application/json
```

Assign sequential order (existing_count + 1, +2, ...).

### Step 6: Report Results

```
✅ Exercices créés : {count}
📝 Types : {breakdown}
🎯 Chapitre : {chapter_title}
🔗 http://localhost:3000/courses/{course_slug}/chapters/{chapter_slug}
```

---

## Important Notes

- **Backend must be running** on `http://localhost:8000`
- **Use synopsis, not full HTML** for content analysis
- **Avoid duplication** — check existing exercises first
- **Quality over quantity** — 2 excellent exercises beat 5 mediocre ones
- **French content** — all text in French
- **Mark as auto-generated** — `auto_generated: true`
- **Domain rules are mandatory** — don't generate `code` for math, don't generate `calculation` for CS

---

## Domain Reference Files

Loaded after domain detection:
- `references/domains/informatique.md`
- `references/domains/maths.md`
- `references/domains/general.md`

---

## API Reference

```bash
GET  /api/chapters/{chapter_id}/exercises        # list exercises
POST /api/chapters/{chapter_id}/exercises        # create exercise
PUT  /api/exercises/{exercise_id}                # update exercise
DELETE /api/exercises/{exercise_id}              # delete exercise
```
