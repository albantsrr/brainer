---
name: generate-chapter
description: Génère le contenu HTML pédagogique d'un chapitre à partir d'un plan pré-analysé (fichier temp/chapter_plan_*.md produit par /prepare-chapter). Démarre avec un contexte propre — deuxième moitié du workflow.
---

# Generate Chapter

## Overview

Ce skill réalise la **phase de génération** : il lit le plan pédagogique sauvegardé par `/prepare-chapter`, charge uniquement les références nécessaires à la rédaction, génère le contenu HTML, et met à jour le chapitre via l'API.

**Pré-requis :** le fichier `temp/chapter_plan_{slug}_ch{N:02d}.md` doit exister (produit par `/prepare-chapter`).

**Workflow complet :**
```
/prepare-chapter {slug} {N}   → sauvegarde temp/chapter_plan_{slug}_ch{N:02d}.md
  (réinitialiser la conversation)
/generate-chapter {slug} {N}  → lit le plan, génère le HTML, met à jour l'API
```

## Workflow

### Step 1 : Lire le plan pédagogique

**Lancer le script pour vérifier le plan et récupérer les métadonnées :**
```bash
source brainer_venv/bin/activate
python .claude/skills/generate-chapter/scripts/generate_chapter.py <course-slug> <chapter-number>
```

Le script vérifie que le fichier plan existe et affiche les métadonnées clés (chapter_slug, difficulty, posture, strategies).

**Lire le fichier plan :** `temp/chapter_plan_{slug}_ch{N:02d}.md`

Ce fichier est la **seule source de vérité** pour cette session. Il contient :
- Les métadonnées (slug, difficulté, posture, stratégies) dans le frontmatter YAML
- Les 8 réponses du plan pédagogique
- Les visuels prévus
- Les points techniques essentiels à préserver
- Le résumé de continuité pour l'intro (si chapitre > 1)

⛔ **NE PAS** recharger le XHTML source — les points techniques essentiels sont dans le plan.
⛔ **NE PAS** recharger les synopsis des chapitres précédents — le résumé de continuité est dans le plan.

### Step 2 : Charger les références de génération

Charger **uniquement** les références nécessaires à la rédaction (lire le frontmatter du plan pour déterminer la posture et les stratégies) :

**Toujours :**
- `.claude/skills/prepare-chapter/references/base/00_principes.md`
- `.claude/skills/prepare-chapter/references/base/01_structure.md`
- `.claude/skills/prepare-chapter/references/base/02_langue_francais.md`

**La posture sélectionnée (une seule, selon le frontmatter du plan) :**
- `.claude/skills/prepare-chapter/references/postures/ingenieur.md`
- `.claude/skills/prepare-chapter/references/postures/pedagogue-formel.md`
- `.claude/skills/prepare-chapter/references/postures/vulgarisateur.md`

**Les stratégies sélectionnées (2-4, selon le frontmatter du plan) :**
- `.claude/skills/prepare-chapter/references/strategies/mecanisme.md`
- `.claude/skills/prepare-chapter/references/strategies/formalisme.md`
- `.claude/skills/prepare-chapter/references/strategies/algorithme.md`
- `.claude/skills/prepare-chapter/references/strategies/protocole.md`
- `.claude/skills/prepare-chapter/references/strategies/taxonomie.md`
- `.claude/skills/prepare-chapter/references/strategies/pattern.md`
- `.claude/skills/prepare-chapter/references/strategies/processus.md`
- `.claude/skills/prepare-chapter/references/strategies/modele.md`
- `.claude/skills/prepare-chapter/references/strategies/preuve.md`
- `.claude/skills/prepare-chapter/references/strategies/securite.md`

> `03_diagrammes.md` et `04_illustrations.md` seront chargés au moment où ils sont nécessaires (Steps 5 et 5.5). Ne pas les charger maintenant.

### Step 3 : Générer le contenu pédagogique

**Générer le contenu en suivant le plan pédagogique.**

Le plan guide chaque choix :
- L'introduction s'ouvre avec la **porte d'entrée** et pose le **fil rouge**
- Si `chapter_number > 1` : inclure 1-2 phrases de transition depuis le **résumé de continuité** du plan
- Les sections `<h2>` suivent la **progression** définie dans le plan
- Les **pièges d'intuition** sont intégrés aux sections pertinentes
- Les **prérequis implicites** sont rappelés brièvement au moment nécessaire
- La synthèse répond au **fil rouge** et rappelle le **nœud de difficulté** résolu
- Les **points techniques essentiels à préserver** du plan doivent tous être couverts

**Structure obligatoire (dans cet ordre) :**

0. **Introduction** (pas de `<h2>` — paragraphes directs)
   - 2-3 paragraphes, ton narratif et engageant
   - Contextualise le chapitre dans le cours
   - Si chapitre > 1 : 1-2 phrases de pont depuis le "Résumé de continuité" du plan
   - ⚠️ L'accroche doit passer le **test d'isomorphisme** (voir `00_principes.md`) : si l'analogie peut être remplacée 1:1 par les éléments du concept, la supprimer et préférer une question ou application concrète

0.5. **Mots-clés** (`<h2>Mots-clés</h2>`) — **recommandé pour les chapitres formels/mathématiques**
   - 2-5 termes nouveaux introduits dans ce chapitre
   - Définitions courtes en langage naturel (pas de notation formelle)
   - Format `<dl><dt><dd>` — voir `01_structure.md` pour le template complet

1. **Objectifs d'apprentissage** (`<h2>Objectifs d'apprentissage</h2>`)
   - 3-6 objectifs actionnables avec verbes d'action

2. **Pourquoi c'est important** (`<h2>Pourquoi c'est important</h2>`)
   - Impact concret : performance, sécurité, architecture, débogage
   - 2-4 paragraphes maximum

3. **Sections de contenu** (structure adaptative par type — voir `references/base/01_structure.md`)
   - Chaque `<h2>` principal adopte la structure correspondant à son type :
     - **Processus** : Le principe / Comment ça fonctionne / En pratique
     - **Définition** : De quoi parle-t-on / L'intuition / En pratique
     - **Distinction** : La confusion courante / La différence réelle / Le test décisif
     - **Théorème** : Ce que dit le théorème / Pourquoi c'est vrai / En pratique
     - **Outil** : À quoi ça sert / Comment s'en servir / En pratique / Les pièges
   - `En pratique` (ou `Le test décisif`) est OBLIGATOIRE dans chaque section
   - Les types doivent varier entre sections

4. **Synthèse** (`<h2>Synthèse</h2>`)
   - Résumé structuré des points clés (3-6 bullets)
   - Prochaines étapes d'apprentissage

**REFORMULATION — CONTRAINTE ABSOLUE :**
La formulation doit être originale. Ne jamais copier verbatim depuis le synopsis ou le plan.

> ⚠️ **Exemples pédagogiques :**
> Les exemples doivent être **plus simples** que le concept qu'ils illustrent.
> **Contextes INTERDITS comme support d'exemple :** protocoles, capteurs, IoT, domotique, réseaux industriels, bases de données.
> **Contextes autorisés :** lampe allumée/éteinte, pile ou face, commander au restaurant, jeu de cartes.

**Contraintes critiques :**
- ⛔ **TIRET CADRATIN (—) INTERDIT PARTOUT** — utiliser `:` dans les titres, virgules dans le texte
- ✅ Couvrir TOUS les mécanismes des "Points techniques essentiels" du plan
- ✅ Réduire à **60% de la longueur originale maximum**
- ✅ HTML5 sémantique uniquement — pas de styles inline

**HTML :**
- `<pre><code class="language-python">` pour le code (ou `-c`, `-bash`, `-javascript`, `-mermaid`)
- Texte préformaté non-code : `<pre><code>` **sans classe**
- Toujours `<ul>`/`<ol>` pour les listes

**Langue :** Tout le contenu en français — voir `references/base/02_langue_francais.md`

### Step 4 : Audit anti-tiret cadratin (BLOQUANT)

⛔ **NE PAS passer à l'étape 5 avant d'avoir effectué cet audit.**

Parcourir le HTML généré ligne par ligne et chercher le caractère `—` (U+2014) :

1. Lister chaque occurrence avec son contexte
2. Corriger : `<h2>`/`<h3>` → remplacer par `:` ; `<p>` → remplacer par `,`
3. Confirmer : **"Audit tiret cadratin : X occurrence(s) corrigée(s)"** (ou "0 trouvé")

### Step 5 : Créer les diagrammes Mermaid

**Charger maintenant : `.claude/skills/prepare-chapter/references/base/03_diagrammes.md`**

Se référer aux **visuels prévus** dans le plan. Créer les diagrammes Mermaid listés (ou décider de ne pas les créer si le test qualité échoue).

```html
<pre><code class="language-mermaid">
graph TD
    classDef primary fill:#4A90D9,stroke:#2c6fad,color:#fff
    classDef neutral fill:#F0F0F0,stroke:#aaa,color:#333

    A([Composant A]):::primary -->|Flux| B[Composant B]:::neutral
</code></pre>
```

- 0-3 diagrammes selon le contenu
- Chaque diagramme doit être compréhensible en moins de 5 secondes
- Utiliser `classDef` — nœuds gris unis inacceptables
- **Zéro diagramme est une réponse valide**

### Step 5.5 : Créer les illustrations SVG (si prévu dans le plan)

**Charger maintenant : `.claude/skills/prepare-chapter/references/base/04_illustrations.md`**

Se référer aux **visuels prévus** dans le plan. Créer les illustrations SVG listées (ou décider de ne pas les créer si le test qualité échoue).

```html
<div class="illustration">
  <svg viewBox="0 0 W H" xmlns="http://www.w3.org/2000/svg">
    <!-- SVG généré selon les templates de 04_illustrations.md -->
  </svg>
  <p class="illustration-caption">Légende obligatoire</p>
</div>
```

- 0-2 illustrations selon le contenu
- **Zéro illustration est une réponse valide**

### Step 6 : Mettre à jour le chapitre via l'API

**Endpoint :** `PUT /api/courses/{course_slug}/chapters/{chapter_slug}`

```json
{
  "content": "<p>Contenu pédagogique généré...</p>..."
}
```

Utiliser le script ou un appel curl direct :
```bash
curl -s -X PUT "http://localhost:8000/api/courses/{course_slug}/chapters/{chapter_slug}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BRAINER_TOKEN" \
  -d '{"content": "..."}'
```

### Step 7 : Rapport final et nettoyage

**Afficher un résumé :**
- ✅ Chapitre mis à jour : {chapter_title}
- 📄 Longueur : {word_count} mots
- 🎨 Diagrammes créés : {diagram_count} (Mermaid) + {illustration_count} (SVG)
- 🔗 Voir : `http://localhost:3000/courses/{course_slug}/chapters/{chapter_slug}`

**Supprimer le fichier plan :**
```bash
rm temp/chapter_plan_{slug}_ch{N:02d}.md
```

## Notes importantes

- **Backend requis** sur `http://localhost:8000`
- **`BRAINER_TOKEN` requis** — obtenir via `POST /api/auth/login`
- **Le cours et le chapitre doivent déjà exister** (créés par `/import-course`)
- **Les exercices se créent séparément** via le skill `/create-exercise`

## Exemple d'utilisation

```
/generate-chapter algebre-lineaire-geometrie 3
```

Actions :
1. ✅ Plan trouvé : `temp/chapter_plan_algebre-lineaire-geometrie_ch03.md`
2. 📋 Posture : pédagogue-formel | Stratégies : formalisme, mécanisme, taxonomie
3. 📚 Références chargées : 00_principes + 01_structure + 02_langue + 1 posture + 3 stratégies
4. ✍️ Contenu généré : ~5 200 mots, 2 diagrammes Mermaid
5. ✅ Audit tiret cadratin : 0 trouvé
6. ✅ Chapitre mis à jour via API
7. 🗑️ Plan supprimé

## Resources

### scripts/generate_chapter.py

Vérifie l'existence du plan et fournit les fonctions d'API.

**Usage :**
```bash
source brainer_venv/bin/activate
python .claude/skills/generate-chapter/scripts/generate_chapter.py <course-slug> <chapter-number>
```
