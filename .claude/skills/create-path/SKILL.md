---
name: create-path
description: Generate a curated learning path for a given profession by identifying its fundamental, timeless skills and pairing each with the single most authoritative book on the subject. Use when the user wants to know what to master to excel in a profession, what books are the canonical references for a field, or how to build a deep, durable skill set. Trigger phrases: "create a path for", "learning path for", "what to master to become", "fundamental skills for", "books to read for", "review the path for".
---

# Create Path

## Overview

This skill generates a **curated learning path** for a given profession, organized into **3 progressive tiers**: Fondations → Maîtrise → Excellence. Each tier builds on the previous with accessible gateway books before advancing to rigorous canonical references.

**Target audience:** Anyone — from curious beginners to degree-holders seeking their first position. The path meets the learner where they are and builds progressively toward senior-level mastery.

**Philosophy:** Learning is most effective when it follows a gradient. The beginner tier builds intuition and vocabulary. The intermediate tier develops applied rigor. The advanced tier delivers the canonical depth that senior practitioners cite. No redundancy between tiers on the same competency.

**What this is NOT:**
- Not a list of tools or frameworks to learn
- Not a generic curriculum — every book must be defensible and battle-tested
- Not a survey of "useful things" — it's a ranked shortlist of leverage points per tier

**Output:** A structured JSON file saved to `docs/path/path-{slug}.json` + a formatted summary.

---

## Workflow

### Step 1: Parse Input

The profession comes from the skill argument (e.g., `/create-path Software Engineer` → profession = "Software Engineer").

If the profession is ambiguous or too broad, ask one clarifying question before proceeding:
- "Backend engineer" vs "Frontend engineer" vs "Full-stack engineer"
- "Data Scientist" vs "ML Engineer" vs "Research Scientist"

If the argument is `--review {slug}`, switch to **Update / Review Mode** (see section below).

---

### Step 2: Define the Profession Scope

Before loading existing paths or generating any skills, explicitly write out the scope definition for the profession. This gates everything that follows.

**Write down, for this profession:**

**OWNS — core problem domains:**
Numbered list of the problems this practitioner is hired to solve. These are problems no other profession has primary responsibility for.

**DOES NOT OWN — adjacent exclusions:**
Capabilities that are adjacent and useful, but where primary responsibility belongs to another profession. Name that adjacent profession explicitly.

**BORROWS — shared foundations:**
Foundational knowledge shared with other professions (mathematics, theory, etc.). These may appear as `shared_foundations_with`, not as primary skills.

**Litmus test before moving to Step 3:**
For each item on the OWNS list: *"Would this appear as a required responsibility — not just a nice-to-have — in a senior [profession] job description?"*
If not → move it to DOES NOT OWN.

**This scope definition is a hard gate:** any skill candidate in Steps 4–5 that falls outside OWNS must be cut or moved to an appropriate tier's entry_requirements.

---

### Step 3: Load Existing Paths for Context

Before generating anything, read all existing path files:

```bash
ls docs/path/*.json 2>/dev/null
```

For each existing path found, note:
- Which profession it covers
- Which books are already recommended (title + skill they cover, at which tier)
- Which skills appear across multiple paths (shared foundations)

**Use this context to:**
1. Identify related professions that share a common foundation with the target profession
2. Flag skills/books already covered in related paths — reference them explicitly rather than silently duplicating
3. Reuse the same canonical book for a shared foundational skill when the overlap is intentional and explicit

---

### Step 4: Define Entry Requirements per Tier

Define what the learner needs to bring for each tier.

**Tier Fondations (beginner):**
- `assumed_knowledge`: curiosity, general literacy, no formal prerequisites required
- `assumed_tools`: nothing assumed — a beginner can start here from zero
- `note`: who this tier is for (truly anyone who wants to enter the field)

**Tier Maîtrise (intermediate):**
- `note`: "Completion of the Fondations tier, or equivalent background (1+ year in the field, STEM degree, etc.)"

**Tier Excellence (advanced):**
- `note`: "Completion of the Maîtrise tier, or equivalent senior experience"

**Rule:** If a skill candidate belongs in prerequisites (it is a tool, a basic practice, or knowledge the target audience already has for a given tier), it goes in that tier's `entry_requirements` — not in the skills list.

---

### Step 5: Generate Skills Per Tier — Apply the Appropriate Filter

**Read `references/quality-criteria.md`** before generating skills. The 5 core filters (Timelessness, Leverage, Rootedness, Book, Universal Applicability) apply to all tiers, with the following tier-specific adaptations:

#### Tier Fondations — Build Intuition (3–4 skills)

Goal: *"After this tier, the learner has correct mental models, vocabulary, and enough intuition to engage with the intermediate material without being blocked."*

- Select skills that introduce the **core concepts** of the profession — not just tools or practices
- The **Filter 4 variant**: replace "Canonical Book" with **Best Gateway Book** — the book must be the most recommended accessible entry point, even if not the deepest reference
  - OK: books that build intuition via examples and analogies, without formal notation from page 1
  - OK: books that are newer if they represent the best pedagogical entry currently available
  - NOT OK: books that assume mathematical formalism, graduate-level prerequisites, or prior practitioner experience
- Skills at this tier should produce **intuitive understanding**, not complete mastery
- Keep prerequisites simple — rank 1 in this tier has `prerequisites: []`, later ranks can reference earlier ones

#### Tier Maîtrise — Build Applied Rigor (3–4 skills)

Goal: *"After this tier, the learner can work independently on real problems and understand the theory behind their decisions."*

- Select skills that deepen the foundations and introduce **applied practice with theoretical grounding**
- Filter 4: books must be widely recommended by practitioners for autonomous study; can require some math/CS background
- Skills can build on the Fondations tier concepts — reference these via `prerequisites_tier: "beginner"` in the tier metadata
- No redundancy: if a concept was covered in Fondations, this tier should go further, not repeat it

#### Tier Excellence — Canonical References (3–5 skills)

Goal: *"After this tier, the learner operates at senior practitioner level and can engage with the research literature and edge cases."*

- Apply **all 5 original filters strictly** (see quality-criteria.md)
- Books must be the canonical references senior practitioners cite without hesitation
- Skills here push the ceiling — they are what most practitioners skip because they are uncomfortable or demanding
- At least 1–2 skills in this tier should be ones most practitioners bypass

**Cross-tier redundancy check:** For each skill across tiers, verify that each tier adds NEW territory on that competency, not a restatement. The progression should feel like zooming in progressively, not circling the same point.

**Total: 9–12 skills across all 3 tiers.** Record every rejected candidate in `considered_and_rejected`.

---

### Step 6: Order Skills Within Each Tier and Verify Pedagogical Coherence

Within each tier, order from **most foundational to most advanced**:
- Rank 1 within the tier is prerequisite for everything else in the tier
- A learner reads all books in a tier sequentially before moving to the next tier

For each skill, add a `prerequisites` field listing the **ranks within the same tier** that must be understood before tackling this one.

**Prerequisite rules:**
- Rank 1 in every tier always has `prerequisites: []`
- Every rank ≥ 3 within a tier must have at least one explicit prerequisite
- Cross-tier prerequisites are handled by the tier's `entry_requirements.note`, not by individual skill fields

**Pedagogical coherence check — run this before finalizing:**

For each skill at rank N within its tier:
1. *Can a learner who has only completed skills 1 to N-1 of this tier pick up this book and follow it without being blocked?*
2. *Does the book's assumed baseline match what the previous books in this tier actually taught?*
3. *Does the transition from one tier to the next feel like a natural step up, not a cliff?*

---

### Step 7: Select the Book for Each Skill

For each skill, select **exactly one book**. Apply the tier-appropriate criteria from `references/quality-criteria.md` (see "Tier-Appropriate Book Criteria" section).

**For ALL tiers:**
- Not a blog post, online course, or documentation — a real book
- If two books tie, choose the one with better pedagogical fit for the tier level

**Intra-tier content overlap check:**
- If two books in the same tier cover >30% of the same concepts, replace one with a book covering genuinely different territory

**Add a `why_this_book` justification** — what makes this THE book for this skill at this tier level.

**Note on shared books across professions:** A book appearing in another profession's path is acceptable when the skill is a shared foundation. Note it explicitly with `"shared_with": ["{other-profession-slug}"]`.

---

### Step 8: Generate the Output

Build the JSON structure and save it:

```bash
mkdir -p docs/path
python3 -c "
import json

path = {
    'profession': '{profession}',
    'slug': '{profession-slug}',
    'generated_at': '{YYYY-MM-DD}',
    'rationale': '{1-2 sentences on the philosophy behind this path — what the learner gains that competitors do not have}',
    'shared_foundations_with': ['{slug of related professions with overlapping skills, if any}'],
    'considered_and_rejected': [
        {
            'name': '{skill name}',
            'rejected_because': '{one sentence explanation}',
            'filter_failed': '{timelessness|leverage|rootedness|canonical_book|gateway_book|specialty_trap}'
        }
    ],
    'tiers': [
        {
            'level': 'beginner',
            'label': 'Fondations',
            'goal': '{What the learner can do after completing this tier}',
            'entry_requirements': {
                'assumed_knowledge': ['{Conceptual prerequisite — keep minimal for beginner tier}'],
                'assumed_tools': ['{Tool or environment — keep minimal for beginner tier}'],
                'note': '{Who this tier is for}'
            },
            'skills': [
                {
                    'rank': 1,
                    'name': '{skill name}',
                    'category': '{foundation|systems|design|craft|leadership}',
                    'description': '{what this skill actually means — concrete, accessible}',
                    'why_fundamental': '{why this belongs at the start of this profession path}',
                    'prerequisites': [],
                    'mastery_signals': [
                        '{specific, observable behavior at beginner level}',
                        '{another signal}',
                        '{another signal}'
                    ],
                    'book': {
                        'title': '{exact published title}',
                        'authors': '{Author Last, First Name; ...}',
                        'year': 2000,
                        'why_this_book': '{why this is the best gateway book for this skill}',
                        'shared_with': []
                    }
                }
            ]
        },
        {
            'level': 'intermediate',
            'label': 'Maîtrise',
            'goal': '{What the learner can do after completing this tier}',
            'entry_requirements': {
                'note': '{Completion of Fondations tier, or equivalent}'
            },
            'skills': []
        },
        {
            'level': 'advanced',
            'label': 'Excellence',
            'goal': '{What the learner can do after completing this tier}',
            'entry_requirements': {
                'note': '{Completion of Maîtrise tier, or equivalent}'
            },
            'skills': []
        }
    ]
}

with open('docs/path/path-{slug}.json', 'w') as f:
    json.dump(path, f, indent=2, ensure_ascii=False)
print('Saved.')
"
```

---

### Step 9: Post-Generation Critique (Devil's Advocate Review)

Mandatory adversarial review before presenting. Goal: find problems, not confirm quality.

**For each skill in the final list, ask:**
- "Would a senior practitioner in a different industry context still need this?" → If no, reconsider
- "Is this skill present because it is genuinely foundational, or because it was the first strong candidate?" → Find a challenger
- "Does the mastery signal actually test this skill at the right level for this tier?" → If wrong level, rewrite
- "Does `why_fundamental` name and dismiss plausible alternatives?" → If not, add them

**8 binary checks — fix any failure before presenting:**

1. Does every skill at rank ≥ 3 within its tier have at least one explicit prerequisite?
2. Can you write a one-sentence justification for each of the 5 filters (or Gateway Book filter for beginner tier) for every skill?
3. Is there any skill that falls outside the OWNS scope defined in Step 2?
4. Is any skill in the final list also in `considered_and_rejected`? *(Consistency check)*
5. Do any two books within the same tier cover >30% of the same core concepts?
6. Does the path include at least one skill per tier that most candidates skip?
7. **NEW — Accessibility check:** Is every beginner-tier book truly accessible without formal prerequisites? Could a motivated non-specialist pick it up?
8. **NEW — Cross-tier redundancy check:** For each competency area, does each tier add new territory rather than restating the previous tier's content?

**Specialty Trap scan:** *"If I changed the profession title to the most adjacent profession, would more than 2 of these skills still apply unchanged?"* If yes → the path is not differentiated enough.

**Tier coherence check:** Read the full path from top to bottom. Does the progression feel like a continuous gradient — each book building directly on what came before, with a satisfying increase in depth? If there is a sudden jump in difficulty between any two books, adjust the tier assignment.

**Only after all 8 checks pass:** proceed to Step 10.

---

### Step 10: Present the Results

Display a formatted summary in the conversation:

```markdown
# Learning Path — {Profession}

> {rationale}

---

## 🟢 Tier 1 — Fondations
> _{goal}_

**Entry requirements:** _{entry_requirements.note}_

| # | Skill | Category | Prerequisites | Book |
|---|-------|----------|---------------|------|
| 1 | **{skill name}** | {category} | — | *{Book Title}* — {Authors} |
| 2 | ... | ... | #1 | ... |

---

## 🔵 Tier 2 — Maîtrise
> _{goal}_

**Entry requirements:** _{entry_requirements.note}_

| # | Skill | Category | Prerequisites | Book |
|---|-------|----------|---------------|------|
| 1 | **{skill name}** | {category} | — | *{Book Title}* — {Authors} |

---

## 🟣 Tier 3 — Excellence
> _{goal}_

**Entry requirements:** _{entry_requirements.note}_

| # | Skill | Category | Prerequisites | Book |
|---|-------|----------|---------------|------|
| 1 | **{skill name}** | {category} | — | *{Book Title}* — {Authors} |

---

### Skill Details

#### 🟢 Fondations

**1. {Skill Name}** _{category}_
{description}

**Why it is fundamental:** {why_fundamental}

**Prerequisites:** _{rank numbers or "None"}_

**Mastery signals:**
- {mastery signal 1}
- {mastery signal 2}
- {mastery signal 3}

**{Book Title}** ({year}) — {Authors}
_{why_this_book}_

---
[repeat for each skill, grouped by tier]

#### 🔵 Maîtrise
[repeat pattern]

#### 🟣 Excellence
[repeat pattern]

---

**Considered and rejected ({N} candidates):**
| Skill | Filter Failed | Reason |
|-------|--------------|--------|
| {name} | {filter} | {rejected_because} |

💾 Saved to `docs/path/path-{slug}.json`
```

---

## Update / Review Mode

Use this mode when reviewing or improving an **existing** path JSON file.

**Trigger:** `/create-path --review {slug}` or "review the {profession} path"

### Review Step 1: Load and Audit the Existing Path

Read `docs/path/path-{slug}.json`.

**Format detection:**
- If the JSON has a top-level `skills` array (old format) → migrate to the new `tiers` format as part of this review
- If it has a top-level `tiers` array → proceed with the review as-is

Identify immediately:
- Is `tiers` present? If not (old format) → migrate: move existing skills to the appropriate tier (most will go to `advanced/Excellence`) and generate the missing `beginner` and `intermediate` tiers
- Is `considered_and_rejected` present? If missing → reconstruct it
- Does the `rationale` reflect a coherent OWNS scope? If not → rewrite it

### Review Step 2: Re-run Step 9 (Post-Generation Critique) on the Existing Path

Run all 8 checks from Step 9 against the loaded path. List each failure explicitly — do not silently skip.

### Review Step 3: For Each Failure Found

- Missing beginner/intermediate tier → generate them following Steps 4–7
- Skill fails a filter → remove or rewrite until it passes
- Skill belongs in a different tier → move it, justify the move
- Mastery signal wrong level for its tier → rewrite it: observable, specific, discriminating for that level
- `considered_and_rejected` is empty → reconstruct by listing obvious candidates not in the path

### Review Step 4: Update the File and Re-present

Rewrite the JSON with all corrections. Proceed to the full Step 10 presentation. **Flag all changes made vs. the original version** in the summary.

---

## Quality Bar

**Hard rules — break any of these and the path fails:**
- ❌ No frameworks or tools in the skill list
- ❌ No skills that are just "good practices" without depth
- ❌ No more than 12 skills total across all 3 tiers — if tempted to add more, remove two instead
- ❌ No book that isn't genuinely considered a classic, canonical reference, OR the best available gateway for its tier
- ❌ No skill without observable mastery signals appropriate to its tier level
- ❌ No skill at rank ≥ 3 within a tier without at least one explicit prerequisite
- ❌ Two books in the same tier that cover >30% of the same core concepts
- ❌ No skill that is essential only within one sub-specialty or vertical of the profession *(Specialty Trap)*
- ❌ No `considered_and_rejected` field left empty
- ❌ A beginner-tier book that requires graduate-level math or prior practitioner experience
- ❌ Cross-tier redundancy: two books covering the same competency at the same depth in different tiers

**Positive signals — a great tiered path has these:**
- ✅ A complete beginner could pick up the first book on day 1 without feeling lost
- ✅ Reading all books in sequence feels like a coherent curriculum with a satisfying gradient of depth
- ✅ Each tier has a clear, distinct goal — completing tier 1 enables tier 2, completing tier 2 enables tier 3
- ✅ At least 1 skill per tier that most practitioners skip because it is hard or uncomfortable
- ✅ Skills compound across tiers — the beginner intuition built in tier 1 makes the advanced theory in tier 3 click
- ✅ Mastery signals at the beginner tier are achievable and motivating; signals at the advanced tier are genuinely demanding
- ✅ The path would not pass for an adjacent profession's path — it is distinctively this profession

---

## References

- `references/quality-criteria.md` — Detailed criteria for filtering fundamental vs. trendy skills, the 5 filters, anti-patterns, category decision rules, and book selection guidance per tier
