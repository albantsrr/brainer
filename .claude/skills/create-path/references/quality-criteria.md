# Quality Criteria — Fundamental Skills

## The Core Question

For each candidate skill, ask: **"Would a top-10% practitioner in this field, 10 years from now, still consider this essential?"**

If yes AND the skill has a canonical book: include it.
If any doubt: cut it.

---

## The 5 Filters

### Filter 1 — Timelessness
The skill must remain relevant regardless of:
- Which programming language is in fashion
- Which cloud provider dominates
- Which framework the company uses
- Whether LLMs have automated junior tasks

**Pass:** Algorithms & Data Structures, Statistics, Database theory, Distributed Systems concepts
**Fail:** React, Kubernetes, AWS Lambda, Terraform, LangChain

### Filter 2 — Leverage
Deep mastery must provide genuine competitive advantage — not just "useful to know".

Ask: "Does someone who has deeply mastered this skill outperform others in ways that are hard to replicate quickly?"

**Pass:** Systems programming, Statistical inference, System design, Compiler theory
**Fail:** "Write good documentation", "Communicate clearly", "Use version control"

### Filter 3 — Rootedness
The skill must be a root cause, not a symptom. It must stand on its own, not be a subset of another skill on the list.

**Pass:** Operating Systems (root) → enables understanding of concurrency, memory, I/O
**Fail:** "Understand file descriptors" (too narrow — covered by OS fundamentals)

### Filter 4 — Canonical Book Exists
A skill without a canonical book is likely either too broad, too new, or too tool-specific.

If you can't name THE book that 80%+ of practitioners would cite, the skill is probably not well-defined enough.

### Filter 5 — Universal Applicability Within the Profession
The skill must be foundational across the WHOLE profession, not just within one sub-specialty or industry vertical.

Ask: **"Is there a significant population of excellent [profession] practitioners who do not need deep mastery of this skill?"**

**Pass:** Any senior practitioner, regardless of industry or sub-specialty, would recognize this as load-bearing.
**Fail:** Critical in one vertical or domain of the profession, but practitioners in other verticals function at the same level without it.

**What to do with specialty skills:**
- If it is expected background the learner brings → add to `entry_requirements.assumed_knowledge`
- If it is out of scope for this path → add to `considered_and_rejected` with `filter_failed: "specialty_trap"`

**If the profession itself IS a specialty** (e.g., the path is for "ML Engineer — NLP" not "ML Engineer"): specialty skills of that sub-specialty ARE universal within its scope. Apply the filter relative to the defined profession, not the parent profession.

**Why this is separate from Rootedness (Filter 3):** Rootedness catches skills that are subsets of another skill already on the list. The Specialty Trap catches skills that are root competencies within a vertical but not universal across the profession. A specialty skill may have no parent on the list — it is simply out of scope.

---

## Anti-Patterns to Reject

### The "Soft Skill" Trap
Skills like "communicate effectively", "work in a team", "give feedback" — these are universally important but not profession-specific and don't have canonical technical books. Exclude unless the profession is specifically leadership/management.

### The "Obvious Practice" Trap
"Write tests", "use source control", "document your code" — these are hygiene, not mastery. They don't separate good from great.

### The "Popular Framework" Trap
The most common failure mode. "Know React" or "know Kubernetes" fails Filter 1 immediately. The underlying principle (component-based UI architecture, container orchestration theory) might pass.

### The "Adjacent Domain" Trap
For a Backend Engineer, "understand UI/UX" or "know basic DevOps" may be useful but they are not what makes a top-10% backend engineer. Stay within the profession's core domain.

### The "Trendy Topic" Trap
Blockchain, Web3, AR/VR, specific AI frameworks — these are waves. The underlying math/CS (cryptography, computer graphics, linear algebra) may be timeless. Distinguish the wave from the ocean.

### The "Specialty Trap"
A skill that is genuinely critical in one sub-specialty or industry vertical, but where practitioners in other verticals function excellently without it. Subtle because it often passes Filters 1–4 (timeless, high-leverage, root, canonical book exists) — it fails Filter 5.

Diagnostic question: "Is there a meaningful population of excellent [profession] practitioners who have never needed to master this?"

If yes → record in `considered_and_rejected` with `filter_failed: "specialty_trap"`.

---

## Categories

Each skill must be assigned exactly one category. When in doubt, apply the decision rules below — they take precedence over intuition.

### foundation
**Definition:** Abstract, formal knowledge you think WITH, not something you do. Produces no artifact — sharpens reasoning.
**Decision rule:** Removing this skill would make 3+ other skills in the path harder to REASON ABOUT (not just harder to execute).
**Confused with:** `design` — a design skill produces an artifact (a schema, an architecture, a decision); a foundation skill does not.

### systems
**Definition:** How the substrate of your work actually operates below your abstractions.
**Decision rule:** The skill answers "what is actually happening when X runs / executes / processes?"
**Confused with:** `foundation` (explains WHY the mechanism is designed as it is) and `craft` (how to operate or tune the system). A systems skill is about understanding the mechanism itself.

### design
**Definition:** Structuring something complex — a system, a schema, an experiment, an organization — so it is coherent, maintainable, and correct. Design skills produce architectural decisions.
**Decision rule:** The skill's output is a structural decision that affects everything built on top of it.
**Confused with:** `craft` — design is the blueprint; craft is the construction quality. If the skill is about how well you build rather than what structure you build, it is craft.

### craft
**Definition:** The discipline of doing the work well at execution level: rigor, quality, diagnosis, and professional judgment in moment-to-moment decisions.
**Decision rule:** The skill primarily improves the QUALITY or RELIABILITY of work produced, not the structure of what is produced.
**Confused with:** `design` — craft determines how well you execute a design; design determines what you are executing toward.

### leadership
**Definition:** Amplifying impact through others — technical decision-making at scale, mentoring, influencing without authority, navigating organizational constraints.
**Decision rule:** The skill primarily multiplies someone else's effectiveness, or involves making irreversible decisions that affect many people.
**Restriction:** Only include for senior+ level paths. If the path targets early-career practitioners, leadership skills are premature and dilute the foundational skills that should be there instead.
**Confused with:** `craft` (professional discipline applied to your own work) and `design` (organizational design = design, not leadership).

---

## Mastery Signals — How to Write Them

Mastery signals must be:
- **Observable** — something you can demonstrate or observe in an interview/code review
- **Specific** — not "understands X" but "can implement X from scratch" or "can explain Y to a non-specialist"
- **Discriminating** — a mid-level practitioner cannot fake it

**Bad signals:**
- "Understands algorithms" ← too vague
- "Has read CLRS" ← not observable
- "Is comfortable with concurrency" ← not specific

**Good signals:**
- "Can implement a red-black tree insertion from memory, explain the rotations, and state the time complexity"
- "Can debug a race condition using only thread dumps and logs, without a debugger"
- "Can explain why a B-tree outperforms a balanced BST for disk I/O without looking it up"

---

## How to Apply the Filters to Unfamiliar Professions

When generating a path for a profession you have limited domain knowledge about, follow this sequence:

1. **Define the problem domain first.** Ask: "What is the single hardest unsolved problem this profession is paid to solve?" The answer defines the core. Skills that are required to solve that problem reliably are candidates.

2. **Find the oldest still-cited references.** Books that are 15+ years old and still recommended by practitioners are the most reliable signal of what is foundational vs. trendy. If you can't find books that old, the field may be too new or too tool-specific to have canonical references yet.

3. **Identify what the role optimizes for.** Some professions optimize for correctness, others for reliability under uncertainty, others for resource efficiency, others for persuasion and adoption. The optimization target defines which foundations are actually load-bearing for that profession.

4. **Use the Specialty Trap check proactively.** For any profession with named sub-specialties, ask for each candidate skill: "Is this required across ALL sub-specialties, or only in one?" If only one → specialty, cut or move to `entry_requirements`.

5. **Tiebreaker between two candidates:** Apply Filter 2 (Leverage). The skill where deep mastery is harder to replicate quickly wins.

---

## Book Selection Guidance

### What Makes a Canonical Book

1. **Age + Relevance:** A book that's 20+ years old and still recommended is almost certainly canonical. A book published last year has not proven itself yet.

2. **Community consensus:** If you mention the title in a senior engineering Slack and 3 people immediately say "+1", it's canonical.

3. **Depth over breadth:** Prefer books that go deep on one thing over surveys that skim many things.

4. **Theory + practice:** The best canonical books combine rigorous theory with applied examples. Pure theory books are often too academic; pure practice books age quickly.

### Red Flags for Book Selection
- Published in the last 2 years: probably not canonical yet
- Title includes a specific version number (e.g., "Python 3.11 Cookbook"): tool-specific, not fundamental
- Author is primarily an influencer/content creator rather than a practitioner: often low depth
- Book is primarily a narrative/memoir with technical anecdotes: not a reference

---

## Tier-Appropriate Book Criteria

Each tier requires a different book selection standard. Apply the correct criteria based on where the skill sits in the path.

### Tier Fondations — Gateway Books

**Goal:** The learner builds correct intuitions and vocabulary, not mastery.

**Selection test:** *"Could a motivated high-school graduate or career-changer with no domain background pick up this book and follow it without being blocked on the first chapter?"*

**Criteria:**
- Prioritize **pedagogical clarity** over theoretical rigor — examples, analogies, and stories over formal proofs
- OK: books that are less rigorous mathematically if the intuitions they build are correct and will transfer to the intermediate tier
- OK: books published more recently (last 5–10 years) if they represent the best available pedagogical entry point
- OK: books that use visuals, humor, and real-world cases to motivate concepts
- NOT OK: books that open with formal mathematical notation, assume prior academic training, or require practitioner experience to follow
- NOT OK: popular-science books that build *incorrect* intuitions (misleading simplifications that must be unlearned later)

**Well-calibrated examples:**
- Statistics: *Naked Statistics* (Wheelan), *Statistics* (Freedman, Pisani, Purves)
- Algorithms: *Grokking Algorithms* (Bhargava), *The Algorithm Design Manual* — only introductory chapters
- Systems: *Code* (Petzold), *But How Do It Know?* (Scott)
- Economics: *The Worldly Philosophers* (Heilbroner), *Basic Economics* (Sowell)

**Anti-patterns:**
- Using a shortened version of the advanced canonical (e.g., ISLR as a "beginner" book — it is intermediate at best)
- Choosing a MOOC companion book that only makes sense alongside a video course
- Choosing a book whose author is primarily a blogger or content creator

---

### Tier Maîtrise — Applied Bridge Books

**Goal:** The learner develops autonomous practice and theoretical grounding, able to work on real problems and justify their decisions.

**Selection test:** *"Could a practitioner with 1 year of experience, or someone who completed the Fondations tier, read this independently and apply it to real work?"*

**Criteria:**
- The book can assume the intuitions built in the Fondations tier
- OK: books that require some mathematical literacy (algebra, basic calculus, descriptive statistics)
- OK: books where the primary mode is applied examples + explanation of underlying theory
- NOT OK: books that require graduate-level formalism throughout
- NOT OK: books that simply repeat the Fondations tier content at a slower pace — must cover genuinely new territory

**Well-calibrated examples:**
- Statistics: *An Introduction to Statistical Learning* (James, Witten, Hastie, Tibshirani), *The Art of Statistics* (Spiegelhalter)
- ML: *Hands-On Machine Learning* (Géron) — for the applied bridge tier, not as a canonical reference
- Causal Inference: *The Effect* (Huntington-Klein) — free, applied, and accessible before Angrist & Pischke
- Bayesian: *Statistical Rethinking* (McElreath) — bridges intuition to full Bayesian workflow

**No downgrade of canonical books:** If a canonical advanced book (ESL, BDA3, CLRS) is significantly more accessible than alternatives, it may be appropriate at intermediate — but justify it explicitly in `why_this_book`.

---

### Tier Excellence — Canonical References

**Goal:** The learner reaches senior practitioner level — capable of engaging with research literature, edge cases, and original reasoning.

Apply the **full 5-filter standard** without relaxation:
- Filter 4 (Canonical Book): the book must be cited by 80%+ of senior practitioners in the field
- Age + community consensus criteria apply in full
- Depth over breadth: choose the book that goes deepest on the skill, even if harder to read
- Theory + practice: prefer books that combine formal grounding with applied examples

**Examples (from data-scientist path):**
- *The Elements of Statistical Learning* (Hastie, Tibshirani, Friedman)
- *Bayesian Data Analysis* (Gelman et al.)
- *Mostly Harmless Econometrics* (Angrist & Pischke)
- *Computer Age Statistical Inference* (Efron & Hastie)

---

### Cross-Tier Coherence Rules

1. **No vertical redundancy:** If a concept is introduced in the Fondations tier, the Maîtrise tier must go deeper — not restate it. The Excellence tier must go deeper still.
   - Wrong: Fondations introduces probability → Maîtrise re-explains probability → Excellence adds formal proofs
   - Right: Fondations builds intuition → Maîtrise builds applied inference → Excellence builds asymptotic theory

2. **Progressive difficulty gradient:** The jump in difficulty between consecutive books should feel like a step, not a cliff. If a beginner would need 2 years of study to move from book N to book N+1, insert an intermediate book or adjust tier assignments.

3. **Vocabulary continuity:** Terms introduced in the Fondations tier should be used (and extended) in the Maîtrise tier. A learner should feel rewarded for having read the earlier books, not confused.

4. **Dopamine design principle:** The first book in each tier should be one the learner can finish with a sense of genuine accomplishment. Prefer books that offer quick wins early (solved examples, exercises with solutions) over books that are uniformly dense.
