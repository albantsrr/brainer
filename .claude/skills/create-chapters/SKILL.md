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
1. Verify the course exists in the database via `GET /api/courses/{slug}` — **noter le champ `difficulty`** (debutant/intermediaire/avance). Si absent, utiliser `intermediaire` par défaut.
2. Retrieve existing chapter info from API: `GET /api/courses/{slug}/chapters`
3. Identify the target chapter by `order` number → get its `slug`
4. **If `chapter_order > 1` — fetch the synopsis of up to 3 previous chapters:**
   - For each chapter with `order` in `[target_order - 1, target_order - 2, target_order - 3]` (if they exist):
     - Find it in the chapters list → get its `slug`
     - Call `GET /api/courses/{slug}/chapters/{chapter_slug}` → read the `synopsis` field
   - Use these synopses to:
     - Identify concepts already introduced (do not re-explain them)
     - Identify terms already defined (use them directly without re-defining)
     - Write the bridge sentence in the introduction (see `references/01_structure_chapitre.md`)
     - Identify **connections** to leverage in the plan pédagogique (Step 3, question 8)
5. **Find source XHTML files** via source-map (preferred) or chapter number (fallback):
   - Search `books/*/source-map.json` for a file where `course_slug` matches the course
   - Look up the chapter slug in `source_map["chapters"]` to get `source_files: []`
   - If no source-map exists (older courses): fall back to `books/{course-title}/OEBPS/ch{XX}.xhtml`
5. For each file in `source_files`, locate it in the book's OEBPS directory (the script handles this)

**Note:** A single course chapter may map to multiple book XHTML files (e.g., `["ch01.xhtml", "ch02.xhtml", "ch03.xhtml"]`). The script concatenates them before extraction — treat the combined content as one source to analyze.

### Step 2: Extract Source Content

**Read the XHTML file:**
- Parse HTML structure (headings, paragraphs, lists, code blocks, blockquotes)
- Extract text content while preserving semantic structure
- Note section hierarchy and organization

**Après l'extraction, le livre sert de référence, pas de modèle.**
Les exemples et analogies du livre peuvent être conservés s'ils sont pédagogiquement pertinents — mais toujours reformulés avec ses propres mots.

### Step 2.5: Sélectionner la Posture et les Stratégies Pédagogiques

**⚠️ Cette étape se fait APRÈS la lecture du XHTML** — la sélection est guidée par le contenu réel du chapitre, pas par le titre du cours.

**Charger les références de base (toujours) :**
`references/base/00_principes.md`, `references/base/01_structure.md`, `references/base/02_langue_francais.md`, `references/base/03_diagrammes.md`, `references/base/04_illustrations.md`, `references/base/05_analyse_pedagogique.md`, `references/base/06_niveaux.md`

**Analyser le contenu XHTML extrait et sélectionner :**

#### 1. Une posture dominante (le ton général du chapitre)

Scanner le contenu et choisir **une seule** posture :

| Posture | Signaux dans le contenu | Fichier |
|---------|------------------------|---------|
| **Ingénieur** | Architecture, composants système, code, configurations, protocoles, décisions de conception | `references/postures/ingenieur.md` |
| **Pédagogue formel** | Définitions, théorèmes, preuves, notation symbolique dense (∀, ∃, ∑, ∫), dérivations | `references/postures/pedagogue-formel.md` |
| **Vulgarisateur** | Concepts de haut niveau, méthodologies, bonnes pratiques, vocabulaire de domaine, pas de formalisme lourd | `references/postures/vulgarisateur.md` |

#### 2. Deux à quatre stratégies (selon les types de contenu présents)

Scanner les sections du chapitre et identifier les types de contenu dominants. Charger **2-4 stratégies** correspondantes :

| Stratégie | Signaux | Fichier |
|-----------|---------|---------|
| **Mécanisme** | "comment ça fonctionne", composants internes, flux, "quand X, Y fait Z" | `references/strategies/mecanisme.md` |
| **Formalisme** | Définitions, théorèmes, notation symbolique, axiomes | `references/strategies/formalisme.md` |
| **Algorithme** | Pseudocode, code, complexité O(), tri/recherche/parcours | `references/strategies/algorithme.md` |
| **Protocole** | Requête/réponse, client/serveur, handshakes, messages | `references/strategies/protocole.md` |
| **Taxonomie** | "N types de...", comparaisons, catégories, tableaux | `references/strategies/taxonomie.md` |
| **Pattern** | Design patterns, abstractions, découplage, architecture | `references/strategies/pattern.md` |
| **Processus** | Pipeline, workflow, étapes ordonnées, flux de bout en bout | `references/strategies/processus.md` |
| **Modèle** | Modèle math/stat, hypothèses, approximation, distributions | `references/strategies/modele.md` |
| **Preuve** | Démonstrations, preuves formelles, raisonnement déductif | `references/strategies/preuve.md` |
| **Sécurité** | Vulnérabilités, attaques, défenses, chiffrement | `references/strategies/securite.md` |

**Exemple de sélection pour un chapitre sur l'arithmétique flottante :**
- Posture : `pedagogue-formel` (beaucoup de notation et de calcul)
- Stratégies : `formalisme` (définitions IEEE 754), `mecanisme` (comment le CPU encode), `algorithme` (arrondi, propagation d'erreur)

**Exemple pour un chapitre sur la mémoire virtuelle :**
- Posture : `ingenieur` (système, hardware, OS)
- Stratégies : `mecanisme` (table des pages, TLB), `pattern` (isolation comme pattern de conception), `securite` (protection mémoire)

**Afficher la sélection à l'utilisateur** dans le plan pédagogique (Step 3) pour validation.

### Step 3: Plan Pédagogique (OBLIGATOIRE — pause avant génération)

**⚠️ ÉTAPE CRITIQUE.** Avant de générer le moindre contenu, produire un plan pédagogique structuré en répondant aux 8 questions définies dans `references/base/05_analyse_pedagogique.md`.

**Actions :**
1. Lire `references/base/05_analyse_pedagogique.md` pour le template complet et les exemples
2. Analyser le contenu source extrait à l'étape 2
3. Si `chapter_order > 1` : consulter les synopsis des **3 derniers chapitres** (N-1, N-2, N-3) récupérés en Step 1 pour assurer la continuité et les connexions
4. Consulter `references/base/06_niveaux.md` pour adapter le plan au niveau de difficulté du cours (récupéré en Step 1)
5. Produire le plan en répondant aux 8 questions (adaptées au niveau) :
   - **Posture et stratégies** — sélection du Step 2.5 (pour rappel)
   - **Nœud de difficulté** — LE concept que les lecteurs ratent
   - **Porte d'entrée** — par quoi attaquer (type adapté au niveau : quotidien / professionnel / conceptuel)
   - **Fil rouge** — la question que le chapitre résout progressivement
   - **Prérequis implicites** — ce que le livre suppose connu (quantité de rappels selon le niveau)
   - **Pièges d'intuition** — où le lecteur va se tromper (type d'erreurs selon le niveau)
   - **Progression** — l'ordre des sections avec les dépendances
   - **Moment eureka** — le déclic intellectuel du chapitre : où le lecteur passe de la confusion à la compréhension, et comment le préparer
   - **Connexions** — quels concepts des chapitres précédents sont réutilisés, approfondis ou remis en question (si chapter_order > 1)

6. **AFFICHER le plan à l'utilisateur** dans le format défini par `05_analyse_pedagogique.md` — inclure le niveau détecté (`difficulty`) et la sélection posture/stratégies en en-tête
7. **ATTENDRE la validation** avant de passer au Step 4

**Le plan pédagogique guide toute la suite :**
- Le fil rouge détermine l'introduction et la synthèse
- Les pièges d'intuition deviennent les sections "Erreurs fréquentes"
- La progression définit l'ordre des `<h2>`
- La porte d'entrée devient le premier paragraphe de l'introduction
- Les prérequis implicites deviennent des rappels brefs aux endroits pertinents

### Step 3.5: Identify Visual Concepts

**⚠️ IMPORTANT: External images are NOT used.**

Instead, identify concepts that benefit from a diagram:
- Technical architectures and system diagrams
- Memory layouts and data structures
- Process flows and state machines
- Code execution patterns

**These concepts will be illustrated using inline Mermaid diagrams in Step 5.**

### Step 4: Generate Pedagogical Content

**Générer le contenu en suivant le plan pédagogique validé au Step 3.**

Le plan pédagogique guide la génération :
- L'introduction s'ouvre avec la **porte d'entrée** choisie et pose le **fil rouge**
- Les sections `<h2>` suivent la **progression** définie dans le plan
- Les **pièges d'intuition** sont intégrés aux sections pertinentes (dans "Erreurs fréquentes" ou directement dans l'explication)
- Les **prérequis implicites** sont rappelés brièvement au moment où ils sont nécessaires
- La synthèse répond au **fil rouge** et rappelle le **nœud de difficulté** résolu

**CRITICAL:** Refer to the `references/` folder for complete guidelines (chargés aux étapes précédentes) :

**Base (toujours) :**
- `references/base/00_principes.md` — Mission, reformulation, registre, exemples, mécanismes, profondeur, checklist
- `references/base/01_structure.md` — Structure obligatoire des chapitres (templates + exemples)
- `references/base/02_langue_francais.md` — Règles français/anglais
- `references/base/03_diagrammes.md` — Guidelines Mermaid (types, conventions, règles taille)
- `references/base/04_illustrations.md` — Guidelines SVG (templates, palette, règles format)

**Posture (une seule, selon Step 2.5) :**
- `references/postures/ingenieur.md` — Ton technique, causalité, "comportement → mécanisme → justification"
- `references/postures/pedagogue-formel.md` — Intuition avant formalisme, notation, rigueur progressive
- `references/postures/vulgarisateur.md` — Accessibilité, zéro jargon, concret → abstrait

**Stratégies (2-4, selon Step 2.5) :**
- `references/strategies/mecanisme.md` — Symptôme → mécanisme → justification → défaillance
- `references/strategies/formalisme.md` — Problème → intuition → exemple → notation formelle
- `references/strategies/algorithme.md` — Problème → naïve → déroulé manuel → code → complexité
- `references/strategies/protocole.md` — Scénario → sequence diagram → messages → erreurs
- `references/strategies/taxonomie.md` — Critère → catégories → exemple discriminant → tableau
- `references/strategies/pattern.md` — Douleur → diagnostic → pattern → résolution → limites
- `references/strategies/processus.md` — Vue d'ensemble → zoom étapes → flux complet → variantes
- `references/strategies/modele.md` — Phénomène → hypothèses → modèle → vérification → limites
- `references/strategies/preuve.md` — Roadmap → preuve guidée → interprétation concrète
- `references/strategies/securite.md` — Attaque → mécanisme exploité → défense → vérification

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

**REFORMULATION — CONTRAINTE ABSOLUE :**
Le XHTML indique QUOI enseigner. La formulation doit être originale.
- Exemples : les exemples du livre peuvent être gardés s'ils sont pertinents, mais reformulés avec ses propres mots
- Code : adapter (noms, scénario) — ne jamais copier verbatim
- Analogies : conserver si éclairantes, reformuler
- Structure des `<h2>` : suivre `01_structure_chapitre.md`, pas l'ordre du livre

Voir `references/00_principes.md` → section "Reformulation — Règle Absolue"

> ⚠️ **PIÈGE FRÉQUENT — Exemples pédagogiques :**
> Les exemples doivent être **plus simples** que le concept qu'ils illustrent.
> **Contextes INTERDITS comme support d'exemple :** protocoles, capteurs, IoT, domotique, réseaux industriels, bases de données — le lecteur ne maîtrise pas encore ces domaines.
> **Contextes autorisés :** lampe allumée/éteinte, pile ou face, commander au restaurant, jeu de cartes, choisir une glace — des situations universelles, zéro jargon technique requis.
> Ces domaines techniques peuvent apparaître en *conclusion* d'un exemple (comme application concrète), jamais comme point de départ.
> Voir `references/00_principes.md` → section "Qualité des Exemples Pédagogiques"

**Critical Constraints:**
- ⛔ **TIRET CADRATIN (—) INTERDIT PARTOUT** — dans les `<h2>`, `<h3>` ET dans les `<p>`. Utiliser `:` dans les titres, des virgules dans le texte. Aucune exception dans les titres.
- ✅ Couvrir TOUS les mécanismes centraux — avec des EXPLICATIONS ORIGINALES
- ✅ NEVER remove essential technical content
- ✅ Simplify language WITHOUT making content incorrect/incomplete
- ✅ Reduce length to **60% of original maximum** — being below is fine as long as all essential content is covered
- ✅ Remove redundancies, digressions, tangential anecdotes

**HTML Structure:**
- Use semantic HTML5 tags only (h2, h3, p, ul, ol, pre, code, blockquote)
- NO inline styles, NO presentational tags — **jamais `<div style="...">` pour encadrer du code**
- Code blocks: `<pre><code class="language-python">` (ou `-c`, `-bash`, `-javascript`, `-mermaid`)
- Texte préformaté non-code: `<pre><code>` **sans classe** — jamais `class="language-text"`
- ALWAYS use `<ul>`/`<ol>` for lists — NEVER convert to paragraphs
- Code: Complete, executable examples with comments

**Language:** All content in French — see `references/03_langue_francais.md`

### Step 5: Create Inline Diagrams

Use **Mermaid.js** for all technical diagrams — see `references/02_diagrammes.md` for types, conventions, size constraints, and **aesthetic rules** (classDef, shapes, colors).

**⚠️ Qualité ou rien.** Avant chaque diagramme, appliquer le test en 3 questions (`02_diagrammes.md → Test de Qualité`). Un diagramme flou ou redondant nuit à la lecture. **Zéro diagramme est une réponse valide pour un chapitre.**

```html
<pre><code class="language-mermaid">
graph TD
    classDef primary fill:#4A90D9,stroke:#2c6fad,color:#fff
    classDef neutral fill:#F0F0F0,stroke:#aaa,color:#333

    A([Composant A]):::primary -->|Flux| B[Composant B]:::neutral
</code></pre>
```

Créer **0-3 diagrammes** selon le contenu. Chaque diagramme doit :
- Être compréhensible en moins de 5 secondes
- Montrer quelque chose impossible à exprimer aussi clairement en texte
- Utiliser `classDef` styling — plain grey nodes sont inacceptables

### Step 5.5: Créer des Illustrations SVG (si pertinent)

Après les diagrammes Mermaid, évaluer si des illustrations SVG sont utiles.

**Critères d'utilisation :**
- Le chapitre présente un algorithme ou une structure de données dont l'**état visuel** est clé pour comprendre (tableau trié/non-trié, arbre, pile, liste chaînée...)
- La visualisation n'est **pas faisable avec Mermaid** (état concret d'un tableau avec valeurs, arbre avec nœuds colorés selon l'étape...)
- Le concept n'est pas déjà couvert par un diagramme Mermaid

**Appliquer le test qualité** de `references/base/04_illustrations.md` avant chaque illustration.
**Utiliser les templates SVG** définis dans ce même fichier — palette, format HTML (`<div class="illustration">`), règles.

```html
<div class="illustration">
  <svg viewBox="0 0 W H" xmlns="http://www.w3.org/2000/svg">
    <!-- SVG généré selon les templates de 04_illustrations.md -->
  </svg>
  <p class="illustration-caption">Légende obligatoire</p>
</div>
```

Créer **0-2 illustrations** selon le contenu. Zéro illustration est une réponse valide.

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
- 🎨 Diagrams created: {diagram_count} (Mermaid) + {illustration_count} (SVG)
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

Règles pédagogiques modulaires composables. **Base** chargée toujours, **1 posture + 2-4 stratégies** sélectionnées après lecture du XHTML (Step 2.5).

**base/** (toujours) :
- `base/00_principes.md` — Mission, reformulation, registre, exemples, mécanismes, checklist
- `base/01_structure.md` — Structure obligatoire avec templates et exemples
- `base/02_langue_francais.md` — Règles français/anglais avec exemples
- `base/03_diagrammes.md` — Guidelines Mermaid (types, conventions, taille)
- `base/04_illustrations.md` — Guidelines SVG (templates array/arbre/pile/liste, palette)
- `base/05_analyse_pedagogique.md` — Plan pédagogique obligatoire (8 questions, template, exemples)
- `base/06_niveaux.md` — Adaptation par niveau de difficulté (débutant/intermédiaire/avancé)

**postures/** (une seule selon Step 2.5) :
- `postures/ingenieur.md` — Ton technique, causalité systématique, "comportement → mécanisme → justification"
- `postures/pedagogue-formel.md` — Intuition avant formalisme, notation mathématique, rigueur progressive
- `postures/vulgarisateur.md` — Accessibilité maximale, zéro jargon, concret → abstrait

**strategies/** (2-4 selon Step 2.5) :
- `strategies/mecanisme.md` — Symptôme → mécanisme interne → justification → défaillance
- `strategies/formalisme.md` — Problème → intuition → exemple numérique → notation formelle
- `strategies/algorithme.md` — Problème → naïve → déroulé manuel → code → complexité
- `strategies/protocole.md` — Scénario → sequence diagram → messages → cas d'erreur
- `strategies/taxonomie.md` — Critère → catégories → exemple discriminant → tableau
- `strategies/pattern.md` — Douleur → diagnostic → pattern → résolution → limites
- `strategies/processus.md` — Vue d'ensemble → zoom étapes → flux complet → variantes
- `strategies/modele.md` — Phénomène → hypothèses → modèle → vérification → limites
- `strategies/preuve.md` — Roadmap → preuve guidée → interprétation concrète
- `strategies/securite.md` — Attaque → mécanisme exploité → défense → vérification
