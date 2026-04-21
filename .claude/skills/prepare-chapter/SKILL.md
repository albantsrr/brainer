---
name: prepare-chapter
description: Analyse un chapitre source (XHTML ou synopsis) et produit un plan pédagogique structuré sauvegardé dans temp/. Première moitié du workflow de création de contenu — à suivre de /generate-chapter dans une nouvelle conversation.
---

# Prepare Chapter

## Overview

Ce skill réalise la **phase d'analyse** de la création de contenu : il lit la source du chapitre, sélectionne la posture et les stratégies pédagogiques, produit le plan pédagogique en 8 questions, et sauvegarde ce plan dans `temp/`. Le plan sert de "handoff" vers `/generate-chapter`, qui démarre dans une conversation propre sans le poids de l'analyse.

**Workflow complet :**
```
/prepare-chapter {slug} {N}   → sauvegarde temp/chapter_plan_{slug}_ch{N:02d}.md
  (réinitialiser la conversation)
/generate-chapter {slug} {N}  → lit le plan, génère le HTML, met à jour l'API
```

## Workflow

### Step 1 : Identifier le chapitre et le cours

**Informations requises :**
- Slug du cours (ex. `algebre-lineaire-geometrie`)
- Numéro du chapitre (ex. `1`)

**Actions :**
1. Vérifier que le cours existe via `GET /api/courses/{slug}` — **noter le champ `difficulty`** (debutant/intermediaire/avance). Si absent, utiliser `intermediaire`.
2. Récupérer la liste des chapitres : `GET /api/courses/{slug}/chapters`
3. Identifier le chapitre cible par son numéro `order` → récupérer son `slug`
4. **Si `chapter_order > 1` — récupérer les synopsis des 3 chapitres précédents (N-1, N-2, N-3) :**
   - Pour chaque chapitre existant avec `order` dans `[target_order - 1, target_order - 2, target_order - 3]`
   - Appeler `GET /api/courses/{slug}/chapters/{chapter_slug}` → lire le champ `synopsis`
   - Utiliser ces synopsis pour : identifier les concepts déjà introduits, écrire la phrase de transition de l'intro, répondre à la question 8 (Connexions) du plan pédagogique
5. **Trouver les fichiers XHTML source** via source-map (préféré) ou fallback numéro de chapitre :
   - Chercher `books/*/source-map.json` avec `course_slug` correspondant
   - Trouver le slug du chapitre dans `source_map["chapters"]` → `source_files: []`
   - Si pas de source-map : fallback `books/{course-title}/OEBPS/ch{XX}.xhtml`

**Note :** Un chapitre peut mapper vers plusieurs fichiers XHTML. Le script les concatène.

### Step 1.5 : Vérifier si un synopsis pré-généré existe

Appeler `GET /api/courses/{slug}/chapters/{chapter_slug}` → lire le champ `synopsis`.

- **Si `synopsis` non-vide** → utiliser ce synopsis comme source principale. **Sauter le Step 2.** Passer directement au Step 2.5 en basant l'analyse sur le synopsis pré-généré (il contient : structure, concepts clés, exemples, prérequis, points de difficulté, progression conceptuelle).

- **Si `synopsis` vide** → procéder normalement avec le Step 2.

### Step 2 : Extraire le contenu source (si pas de synopsis)

**Lancer le script :**
```bash
source brainer_venv/bin/activate
python .claude/skills/prepare-chapter/scripts/prepare_chapter.py <course-slug> <chapter-number>
```

Le script produit un fichier `temp/chapter_{slug}_ch{N:02d}_extracted.json` — lire ce fichier pour analyser le contenu XHTML extrait.

**Après l'extraction, le livre sert de référence, pas de modèle.**

### Step 2.5 : Sélectionner la posture et les stratégies pédagogiques

**⚠️ Cette étape se fait APRÈS la lecture du synopsis ou du XHTML** — la sélection est guidée par le contenu réel du chapitre, pas par le titre du cours.

**Charger les références de base (toujours) :**
`.claude/skills/prepare-chapter/references/base/00_principes.md`, `.claude/skills/prepare-chapter/references/base/01_structure.md`, `.claude/skills/prepare-chapter/references/base/02_langue_francais.md`, `.claude/skills/prepare-chapter/references/base/05_analyse_pedagogique.md`, `.claude/skills/prepare-chapter/references/base/06_niveaux.md`

**Analyser le contenu et sélectionner :**

#### 1. Une posture dominante (une seule)

| Posture | Signaux | Fichier |
|---------|---------|---------|
| **Ingénieur** | Architecture, composants système, code, protocoles, décisions de conception | `.claude/skills/prepare-chapter/references/postures/ingenieur.md` |
| **Pédagogue formel** | Définitions, théorèmes, preuves, notation symbolique dense (∀, ∃, ∑, ∫) | `.claude/skills/prepare-chapter/references/postures/pedagogue-formel.md` |
| **Vulgarisateur** | Concepts de haut niveau, méthodologies, bonnes pratiques, vocabulaire de domaine | `.claude/skills/prepare-chapter/references/postures/vulgarisateur.md` |

#### 2. Deux à quatre stratégies (selon les types de contenu présents)

| Stratégie | Signaux | Fichier |
|-----------|---------|---------|
| **Mécanisme** | "comment ça fonctionne", composants internes, flux | `.claude/skills/prepare-chapter/references/strategies/mecanisme.md` |
| **Formalisme** | Définitions, théorèmes, notation symbolique, axiomes | `.claude/skills/prepare-chapter/references/strategies/formalisme.md` |
| **Algorithme** | Pseudocode, code, complexité O(), tri/recherche | `.claude/skills/prepare-chapter/references/strategies/algorithme.md` |
| **Protocole** | Requête/réponse, client/serveur, handshakes | `.claude/skills/prepare-chapter/references/strategies/protocole.md` |
| **Taxonomie** | "N types de...", comparaisons, catégories, tableaux | `.claude/skills/prepare-chapter/references/strategies/taxonomie.md` |
| **Pattern** | Design patterns, abstractions, découplage, architecture | `.claude/skills/prepare-chapter/references/strategies/pattern.md` |
| **Processus** | Pipeline, workflow, étapes ordonnées | `.claude/skills/prepare-chapter/references/strategies/processus.md` |
| **Modèle** | Modèle math/stat, hypothèses, distributions | `.claude/skills/prepare-chapter/references/strategies/modele.md` |
| **Preuve** | Démonstrations, preuves formelles, raisonnement déductif | `.claude/skills/prepare-chapter/references/strategies/preuve.md` |
| **Sécurité** | Vulnérabilités, attaques, défenses, chiffrement | `.claude/skills/prepare-chapter/references/strategies/securite.md` |

### Step 3 : Plan pédagogique

**Actions :**
1. Analyser le contenu source (synopsis ou XHTML extrait)
2. Si `chapter_order > 1` : utiliser les synopsis des chapitres précédents (récupérés en Step 1) pour les connexions
3. Consulter `references/base/06_niveaux.md` pour adapter le plan au niveau de difficulté
4. Produire le plan en répondant aux 8 questions (template dans `references/base/05_analyse_pedagogique.md`) :
   - **Posture et stratégies** — rappel de la sélection du Step 2.5
   - **Nœud de difficulté** — LE concept que les lecteurs ratent
   - **Porte d'entrée** — par quoi attaquer (analogie / problème motivant / contre-exemple / question)
   - **Fil rouge** — la question que le chapitre résout progressivement
   - **Prérequis implicites** — ce que le livre suppose connu
   - **Pièges d'intuition** — 2-4 erreurs spécifiques à adresser
   - **Progression** — 3-6 sections avec leur **type** (Processus / Définition / Distinction / Théorème / Outil)
   - **Moment eureka** — où la compréhension se produit (tension → résolution)
   - **Connexions** — concepts des chapitres précédents réutilisés/approfondis/remis en question (si `chapter_order > 1`)
   - **Visuels prévus** — liste des diagrammes Mermaid et illustrations SVG envisagés (section et type), ou `[aucun]`

### Step 4 : Sauvegarder le plan

Sauvegarder le plan dans `temp/chapter_plan_{slug}_ch{N:02d}.md` en utilisant le format suivant :

```markdown
---
course_slug: {slug}
chapter_slug: {chapter_slug}
chapter_number: {N}
difficulty: {debutant|intermediaire|avance}
posture: {ingenieur|pedagogue-formel|vulgarisateur}
strategies: [{strategy1}, {strategy2}, ...]
---

# Plan — {Course Title}, Ch.{N} : {Chapter Title}

## Analyse pédagogique

1. **Nœud de difficulté** : ...
2. **Porte d'entrée** : ...
3. **Fil rouge** : ...
4. **Prérequis implicites** : ...
5. **Pièges d'intuition** :
   - ...
   - ...
6. **Progression** :
   - Section 1 (Type) : Titre
   - Section 2 (Type) : Titre
   - ...
7. **Moment eureka** : ...
8. **Connexions** : ... (ou "N/A — premier chapitre")

## Visuels prévus
- [Mermaid — graph TD] Description → section "Titre"
- [SVG — type] Description → section "Titre"
(ou [aucun])

## Points techniques essentiels à préserver
- Mécanisme/théorème/algorithme clé 1
- Mécanisme/théorème/algorithme clé 2
- ...

## Résumé de continuité
(1-2 phrases sur les chapitres précédents utiles pour la transition en introduction — ou vide si chapitre 1)
```

**⚠️ Important :** La section "Points techniques essentiels à préserver" et "Résumé de continuité" permettent à `/generate-chapter` de travailler sans recharger le XHTML ou les synopsis précédents. Être précis et complet ici.

### Step 5 : Instructions de handoff

Afficher :

```
✅ Plan sauvegardé : temp/chapter_plan_{slug}_ch{N:02d}.md

Prochaine étape :
1. Réinitialiser la conversation (nouveau contexte propre)
2. Lancer : /generate-chapter {slug} {N}
```

## Notes importantes

- **Backend requis** sur `http://localhost:8000`
- **`BRAINER_TOKEN` requis** pour les endpoints protégés
- **Ce skill ne génère pas de contenu HTML** — il prépare uniquement le plan
- **Un chapitre à la fois** — ce skill n'est pas conçu pour le traitement en lot

## Exemple d'utilisation

```
/prepare-chapter algebre-lineaire-geometrie 3
```

Actions :
1. ✅ Cours trouvé, difficulté : intermédiaire
2. ✅ Chapitre 3 : "Vecteurs et espaces vectoriels"
3. 📖 Synopsis pré-généré trouvé — extraction XHTML sautée
4. 🎯 Posture : pédagogue-formel | Stratégies : formalisme, mécanisme, taxonomie
5. 📋 Plan pédagogique en 8 questions généré
6. 💾 Plan sauvegardé : `temp/chapter_plan_algebre-lineaire-geometrie_ch03.md`

## Resources

### scripts/prepare_chapter.py

Extrait le contenu XHTML et prépare les données pour l'analyse.

**Usage :**
```bash
source brainer_venv/bin/activate
python .claude/skills/prepare-chapter/scripts/prepare_chapter.py <course-slug> <chapter-number>
```

### references/

Règles pédagogiques modulaires. Chargées en Step 2.5 selon le contenu du chapitre.

**base/** (toujours) :
- `base/00_principes.md` — Mission, reformulation, registre, exemples, mécanismes, checklist
- `base/01_structure.md` — Structure obligatoire avec templates et exemples
- `base/02_langue_francais.md` — Règles français/anglais avec exemples
- `base/05_analyse_pedagogique.md` — Plan pédagogique obligatoire (8 questions, template, exemples)
- `base/06_niveaux.md` — Adaptation par niveau de difficulté

**postures/** (une seule) :**
- `postures/ingenieur.md`
- `postures/pedagogue-formel.md`
- `postures/vulgarisateur.md`

**strategies/** (2-4) :**
- `strategies/mecanisme.md`, `strategies/formalisme.md`, `strategies/algorithme.md`
- `strategies/protocole.md`, `strategies/taxonomie.md`, `strategies/pattern.md`
- `strategies/processus.md`, `strategies/modele.md`, `strategies/preuve.md`, `strategies/securite.md`
