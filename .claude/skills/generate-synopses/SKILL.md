---
name: generate-synopses
description: Pre-generate structured synopses for all chapters of a course from raw XHTML source. Lightweight skill (no pedagogical references) designed to run before /create-chapters to reduce its token consumption. Each synopsis is 800-1200 words and structured to answer the 8 pedagogical analysis questions used in /create-chapters. Use when you want to pre-process all chapters of a course before running /create-chapters.
---

# Generate Synopses

## Overview

Ce skill pré-génère des **synopsis structurés** pour tous les chapitres d'un cours à partir du XHTML source brut. Ces synopsis remplacent ensuite le chargement du XHTML dans `/create-chapters`, réduisant significativement sa consommation de tokens.

**Philosophie :** Skill ultra-léger. Aucun fichier de référence pédagogique. Son seul rôle est d'extraire et structurer l'information essentielle du XHTML sous une forme dense et réutilisable.

**Workflow typique :**
1. `/import-course` → crée la structure avec contenu placeholder
2. `/generate-synopses` → pré-génère les synopsis structurés (ce skill)
3. `/create-chapters N` → génère le contenu pédagogique depuis le synopsis (plus rapide)

## Quand utiliser ce skill

- Avant de lancer `/create-chapters` sur un cours complet
- Quand le XHTML source est volumineux (> 50 KB par chapitre)
- Pour préparer un cours en lot sans saturer le contexte

## Workflow

### Step 1: Identifier le cours et les chapitres

1. Vérifier que le cours existe : `GET /api/courses/{slug}`
2. Récupérer la liste des chapitres : `GET /api/courses/{slug}/chapters`
3. Identifier le `source-map.json` du cours :
   - Chercher dans `books/*/source-map.json` le fichier dont `course_slug` correspond
   - Ce fichier liste les `source_files` de chaque chapitre
4. Afficher la liste des chapitres à traiter avec leur statut synopsis (vide / déjà généré)
5. Demander confirmation avant de commencer

### Step 2: Pour chaque chapitre — Nettoyer et lire le XHTML source

**⚠️ L'utilisateur doit réinitialiser le contexte entre chaque chapitre** — ce skill confirme à la fin de chaque synopsis qu'il faut reset avant le suivant.

Localiser les fichiers source du chapitre :
- Via `source-map.json` : `source_map["chapters"][chapter_slug]["source_files"]`
- Fallback (anciens cours sans source-map) : `books/{course-title}/OEBPS/ch{XX}.xhtml`

**Avant de lire, nettoyer le XHTML avec le script dédié :**

```bash
source brainer_venv/bin/activate

# Fichier unique :
python .claude/skills/generate-synopses/scripts/clean_xhtml.py \
  books/{book-dir}/OEBPS/ch{XX}.xhtml \
  temp/clean_{course-slug}_ch{XX}.html

# Chapitre multi-fichiers (concaténer dans l'ordre) :
python -c "
import sys
from pathlib import Path
sys.path.insert(0, '.claude/skills/generate-synopses/scripts')
from clean_xhtml import clean_xhtml_files
parts = [Path('books/{book-dir}/OEBPS/{file1}'), Path('books/{book-dir}/OEBPS/{file2}')]
out = clean_xhtml_files(parts)
Path('temp/clean_{course-slug}_ch{XX}.html').write_text(out)
print(len(out), 'chars')
"
```

Le script affiche dans stderr la réduction obtenue (ex: `Reduction: 89%`).

**Appliquer le scope si défini** — si `source_map["chapters"][chapter_slug]` contient un champ `scope_headings`, extraire uniquement la portion délimitée :

```bash
python -c "
import sys
sys.path.insert(0, '.claude/skills/generate-synopses/scripts')
from clean_xhtml import extract_scope
content = open('temp/clean_{course-slug}_ch{XX}.html').read()
scoped = extract_scope(content, '{scope_headings.start}', {repr(scope_headings.get('end'))})
open('temp/clean_{course-slug}_ch{XX}.html', 'w').write(scoped)
print(len(scoped), 'chars after scope filter')
"
```

Si `scope_headings` est absent du source-map pour ce chapitre → passer cette étape.

**Lire le fichier nettoyé** `temp/clean_{course-slug}_ch{XX}.html` — **jamais le XHTML brut**.

Le nettoyage supprime : `<head>`, attributs Calibre (`class="calibreXX"`), CSS inline, `<img>`, `<sup>` (footnotes), ancres de navigation vides, `<figure>`. Le contenu sémantique (titres, paragraphes, listes, blockquotes, code) est préservé intact.

### Step 3: Générer le synopsis structuré

Analyser le contenu XHTML et produire un synopsis structuré en Markdown **strictement dans ce format** :

```markdown
## Structure du chapitre

[2-5 sections principales avec pour chacune :
- Titre de la section
- Type : Processus / Définition / Distinction / Théorème / Outil
- Contenu clé en 1-2 phrases

Exemple :
- **Vecteurs et représentation** (Définition) : Introduit les vecteurs comme objets mathématiques avec composantes, norme et direction. Établit la notation et les opérations de base.
- **Combinaisons linéaires** (Processus) : Montre comment construire de nouveaux vecteurs par somme pondérée. Le livre insiste sur l'interprétation géométrique via le déplacement dans l'espace.]

## Concepts clés

- **[Terme]** : [Définition précise, 1-2 lignes]
- [5-10 concepts selon la densité du chapitre]

## Exemples et analogies importants

[3-5 exemples concrets que le livre utilise, avec leur rôle pédagogique.
Exemple : "L'auteur illustre la combinaison linéaire avec l'exemple de mélanges de couleurs RGB — cela rend l'abstraction immédiatement visuelle."]

## Prérequis supposés

[Ce que le livre assume connu sans l'expliquer — 3-6 points.
Exemple : "Notion de coordonnées cartésiennes (x, y)", "Lecture de notation ensembliste basique"]

## Points de difficulté

[Où les lecteurs risquent de se tromper ou de bloquer — 2-4 points précis.
Exemple : "Confusion entre vecteur (direction + magnitude) et point (position) — le livre ne la traite pas explicitement"]

## Progression conceptuelle

[Comment la compréhension se construit au fil du chapitre — 100-150 mots.
Décrire l'arc intellectuel : de quoi part-on, comment les concepts s'enchaînent, quel est le résultat final de la compréhension.]
```

**Contraintes :**
- 800-1 200 mots total
- Markdown pur, pas d'HTML
- Précis et dense — chaque ligne doit être utile à la génération de contenu
- En français, termes techniques en anglais si standard (eigenvector, softmax, etc.)

### Step 4: Sauvegarder le synopsis

```bash
curl -s -X PUT "http://localhost:8000/api/courses/{course_slug}/chapters/{chapter_slug}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BRAINER_TOKEN" \
  -d "{\"synopsis\": \"$(echo "$SYNOPSIS" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))" | tr -d '\"')\"}"
```

Ou directement via l'API avec le body JSON :
```json
{
  "synopsis": "## Structure du chapitre\n\n..."
}
```

### Step 5: Confirmer et passer au suivant

Afficher :
```
✅ Synopsis généré — Chapitre {N} : {chapter_title}
   Taille : {word_count} mots
   Sections identifiées : {section_count}

⚠️  RÉINITIALISE LE CONTEXTE avant le chapitre suivant.
   Prochain : Chapitre {N+1} — {next_chapter_title}
   Commande : /generate-synopses {course_slug} {N+1}
```

## Invocation

**Pour un chapitre unique :**
> "Génère le synopsis structuré pour le chapitre {N} du cours {slug}"

**Pour tous les chapitres (un par un avec reset de contexte) :**
> "Génère les synopsis structurés pour tous les chapitres du cours {slug}"
> → Le skill affiche la liste, confirme, génère le chapitre 1, puis indique de reset avant le chapitre 2.

## Notes importantes

- **Backend requis** sur `http://localhost:8000`
- **`BRAINER_TOKEN` requis** pour les appels PUT :
  ```bash
  export BRAINER_TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"skills@brainer.dev","password":"brainer-skills-2026"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
  ```
- **Le synopsis est temporaire** — `/create-chapters` le remplacera par un synopsis concis (300-500 mots) en Step 6.5 après génération du contenu
- **Si le synopsis existe déjà** pour un chapitre, demander confirmation avant d'écraser
- **Aucun fichier de référence pédagogique à charger** — ce skill n'utilise que le XHTML source
