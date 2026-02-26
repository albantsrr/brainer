---
name: update-chapters
description: Apply targeted modifications to an existing chapter in the Brainer system. Use when the user wants to improve a specific section, fix an explanation, rewrite a part, or apply any change to chapter HTML content. Works from the current HTML in the database — does NOT re-read the original XHTML source and does NOT apply generic guidelines.
---

# Update Chapters

## Overview

This skill applies **user-specified modifications** to an existing chapter's HTML content. It fetches the current content from the API, applies exactly what the user asked, and pushes the result back.

**This skill does NOT:**
- Apply generic content guidelines
- Enforce structure from other skills
- Re-read the original XHTML source

**This skill does:**
- Fetch current chapter HTML
- Apply the specific change described by the user
- Push the updated HTML back

---

## Workflow

### Step 1: Fetch Current Content

```bash
source brainer_venv/bin/activate
python .claude/skills/update-chapters/scripts/get_chapter.py <course-slug> <chapter-number>
```

This saves:
- `temp/chapter_{course-slug}_ch{XX}_current.html` — the HTML to modify
- `temp/chapter_{course-slug}_ch{XX}_meta.json` — slug and id for the API call

Read both files before proceeding.

### Step 2: Apply the Requested Change

Read the user's instruction and apply it precisely. Do not go beyond what was asked.

**Scope rules:**
- Modify only the sections / blocks the user explicitly targeted
- Preserve everything else as-is
- If the user asks for a rewrite of a section, rewrite only that section
- If the user asks to add something, add only that thing

### Step 3: Update via API

```bash
export BRAINER_TOKEN=$(grep BRAINER_TOKEN .env | cut -d= -f2)

curl -s -X PUT "http://localhost:8000/api/courses/{course_slug}/chapters/{chapter_slug}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BRAINER_TOKEN" \
  -d '{"content": "<updated HTML>"}'
```

The `course_slug` and `chapter_slug` come from the meta.json file.

### Step 3.5: Update the Synopsis

After saving the content, update (or create) the synopsis.

**When to update:**
- The change modifies a key concept, explanation, or technical section → regenerate the synopsis
- No synopsis exists yet (`synopsis` is empty in meta.json) → always create one

**When to skip:**
- The change is a typo fix, formatting adjustment, or minor wording tweak that doesn't affect the substance

**Synopsis format (strict):**
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
- 300-500 words max
- In French, technical terms in English where appropriate
- Pure Markdown — no HTML

**Save via:**
```bash
curl -s -X PUT "http://localhost:8000/api/courses/{course_slug}/chapters/{chapter_slug}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BRAINER_TOKEN" \
  -d '{"synopsis": "## Points clés\n..."}'
```

### Step 4: Report

```
✅ Chapter updated: {chapter_title}
📄 Changes: {brief description of what was changed}
📋 Synopsis: updated / created / unchanged
🔗 View: http://localhost:3000/courses/{course_slug}/chapters/{chapter_slug}
```

---

## Notes

- Backend must be running on `http://localhost:8000`
- Never remove content the user didn't ask to change
- The token in `.env` expires after 24h — re-login if needed:
  ```bash
  curl -s -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"skills@brainer.dev","password":"brainer-skills-2026"}' \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])"
  ```
