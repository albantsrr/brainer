# Guide de traduction française

Ce document explique comment traduire les titres de cours, parties et chapitres en français lors de l'import d'un livre EPUB.

## Principes de traduction

**⚠️ PAS de traduction littérale !** Les titres doivent être traduits de manière logique, compréhensible et pédagogique.

### 1. Titres et descriptions de cours

**Objectifs :**
- Clarté et professionnalisme
- Préserver les termes techniques reconnaissables
- Format académique français
- Description concise et informative (1-2 phrases)

**Exemples de titres :**

| Anglais | ❌ Mauvaise traduction | ✅ Bonne traduction |
|---------|------------------------|---------------------|
| Fundamentals of Data Engineering | Fondamentaux de l'Ingénierie des Données | Principes fondamentaux de l'ingénierie des données |
| Computer Systems: A Programmer's Perspective | Systèmes Informatiques : Une Perspective de Programmeur | Systèmes informatiques : Une approche pratique pour les programmeurs |
| Learning Python | Apprendre Python | Apprendre Python |
| Docker Deep Dive | Plongée Profonde dans Docker | Docker en profondeur |

**Exemples de descriptions :**

| Cours | ❌ Mauvaise description | ✅ Bonne description |
|-------|------------------------|---------------------|
| Docker Deep Dive | by Nigel Poulton | Guide complet de Docker, des concepts de base aux fonctionnalités avancées : conteneurs, images, réseaux, volumes, Compose, Swarm et sécurité. |
| Fundamentals of Data Engineering | by Joe Reis and Matt Housley | Introduction complète à l'ingénierie des données : pipelines, architectures, outils modernes et bonnes pratiques pour construire des systèmes de données robustes. |
| Computer Systems | Un livre sur les systèmes informatiques | Exploration approfondie des systèmes informatiques du point de vue du programmeur : architecture matérielle, systèmes d'exploitation, réseaux et optimisation. |

**Règles :**
- Utiliser "Principes fondamentaux" plutôt que "Fondamentaux"
- Préférer "ingénierie des données" à "Ingénierie des Données"
- Adapter les sous-titres pour qu'ils soient naturels en français
- Garder les noms de langages/technologies tels quels (Python, Java, etc.)
- **Description : 1-2 phrases maximum, résumant les sujets clés du cours (PAS le nom de l'auteur)**

### 2. Titres de parties

**Objectifs :**
- Structure claire et hiérarchique
- Conservation du format "Partie X : Titre"
- Titres concis et descriptifs

**Exemples :**

| Anglais | ❌ Mauvaise traduction | ✅ Bonne traduction |
|---------|------------------------|---------------------|
| Part I: Introduction to Data Engineering | Partie I : Introduction à l'Ingénierie des Données | Partie I : Introduction à l'ingénierie des données |
| Part II: Building Data Pipelines | Partie II : Construction de Pipelines de Données | Partie II : Construction de pipelines de données |
| Part III: Advanced Topics | Partie III : Sujets Avancés | Partie III : Concepts avancés |

**Règles :**
- Format : "Partie {numéro} : {titre}"
- Pas de majuscules excessives (sauf début de titre)
- Préférer "concepts" à "sujets" ou "topics"
- Utiliser "fondations" plutôt que "fondamentaux" pour les bases

### 3. Titres de chapitres

**⚠️ IMPORTANT :** Les titres de chapitres dans `course-plan.json` incluent TOUJOURS le préfixe "Chapter X:" automatiquement. Il faut simplement le traduire en "Chapitre X:".

**Objectifs :**
- Précision pédagogique
- Action et apprentissage
- Format consistant avec préfixe numéroté

**Exemples :**

| Anglais (course-plan.json) | ❌ Mauvaise traduction | ✅ Bonne traduction |
|---------|------------------------|---------------------|
| Chapter 1: Getting Started | Chapitre 1 : Commencer | Chapitre 1 : Premiers pas |
| Chapter 2: Data Modeling | Chapitre 2 : Modélisation de Données | Chapitre 2 : Modélisation des données |
| Chapter 3: Working with APIs | Chapitre 3 : Travailler avec des APIs | Chapitre 3 : Travailler avec les API |
| Chapter 4: Performance Optimization | Chapitre 4 : Optimisation de Performance | Chapitre 4 : Optimisation des performances |

**Règles :**
- **Transformer "Chapter {num}:" en "Chapitre {num} :"** (noter l'espace avant les deux-points en français)
- Format final : "Chapitre {numéro} : {titre}"
- "Getting Started" → "Premiers pas" (pas "Commencer" ou "Démarrage")
- "Working with X" → "Travailler avec X" (pas "Travailler sur")
- Utiliser l'article défini : "les données", "les API", "les performances"
- API reste au singulier en français (une API, les API)

## Termes techniques courants

| Anglais | Français |
|---------|----------|
| Data Engineering | Ingénierie des données |
| Data Pipeline | Pipeline de données |
| Data Warehouse | Entrepôt de données |
| Data Lake | Lac de données |
| Machine Learning | Apprentissage automatique (ou Machine Learning) |
| Deep Learning | Apprentissage profond (ou Deep Learning) |
| API | API (invariable) |
| Framework | Framework (ou cadriciel) |
| Backend | Backend (ou système backend) |
| Frontend | Frontend (ou interface utilisateur) |
| Database | Base de données |
| Query | Requête |
| Schema | Schéma |
| Batch Processing | Traitement par lots |
| Stream Processing | Traitement de flux |
| Real-time | Temps réel |
| Architecture | Architecture |
| Pattern | Motif (ou pattern) |
| Best Practices | Bonnes pratiques |

## Workflow de traduction

### 1. Générer le plan en anglais

```bash
python .claude/skills/import-course/scripts/import_course.py --generate-plan "Book Name"
```

Cela crée `temp/course-plan.json` en anglais.

### 2. Lire et analyser le plan

```bash
cat temp/course-plan.json
```

Examiner :
- Le titre du cours
- Les titres des parties
- Les titres des chapitres

### 3. Traduire intelligemment et générer une description

Créer `temp/course-plan-fr.json` en appliquant les règles ci-dessus :

```json
{
  "course": {
    "title": "Principes fondamentaux de l'ingénierie des données",
    "slug": "fundamentals-of-data-engineering",
    "author": "Joe Reis, Matt Housley",
    "description": "Introduction complète à l'ingénierie des données : pipelines, architectures, outils modernes et bonnes pratiques pour construire des systèmes de données robustes."
  },
  "parts": [
    {
      "order": 1,
      "title": "Partie I : Fondations de l'ingénierie des données"
    },
    {
      "order": 2,
      "title": "Partie II : Le cycle de vie de l'ingénierie des données"
    }
  ],
  "chapters": [
    {
      "order": 1,
      "title": "Chapitre 1 : Introduction à l'ingénierie des données",
      "slug": "data-engineering-described",
      "part": 1
    }
  ]
}
```

### 4. Importer avec les titres français

```bash
python .claude/skills/import-course/scripts/import_course.py "Book Name"
```

Le script utilisera automatiquement `temp/course-plan-fr.json`.

## Validation

Après l'import, vérifier :

1. **Cohérence** : Tous les titres suivent le même style
2. **Grammaire** : Pas de fautes, bon usage des articles
3. **Lisibilité** : Les titres sont clairs et compréhensibles
4. **Technique** : Les termes techniques sont corrects
5. **Format** : Respect de "Partie X :" et "Chapitre X :"

## Exemples complets

### Computer Systems: A Programmer's Perspective

**Anglais (temp/course-plan.json) :**
```json
{
  "course": {
    "title": "Computer Systems: A Programmer's Perspective",
    "slug": "computer-systems-a-programmers-perspective"
  },
  "parts": [
    {
      "order": 1,
      "title": "Part I: Program Structure and Execution"
    }
  ],
  "chapters": [
    {
      "order": 1,
      "title": "Chapter 1: A Tour of Computer Systems"
    }
  ]
}
```

**Français (temp/course-plan-fr.json) :**
```json
{
  "course": {
    "title": "Systèmes informatiques : Une approche pratique pour les programmeurs",
    "slug": "computer-systems-a-programmers-perspective",
    "description": "Exploration approfondie des systèmes informatiques du point de vue du programmeur : architecture matérielle, systèmes d'exploitation, réseaux et optimisation."
  },
  "parts": [
    {
      "order": 1,
      "title": "Partie I : Structure et exécution des programmes"
    }
  ],
  "chapters": [
    {
      "order": 1,
      "title": "Chapitre 1 : Tour d'horizon des systèmes informatiques"
    }
  ]
}
```

---

## Notes importantes

- **Ne PAS modifier les slugs** : Ils restent en anglais pour la compatibilité
- **Préserver la structure JSON** : Ne pas modifier les clés, seulement les valeurs "title" et "description"
- **Conserver les métadonnées** : Author, order, etc. restent identiques
- **Respecter la hiérarchie** : Partie → Chapitre
- **OBLIGATOIRE : Ajouter une description** : Le champ "description" doit contenir une phrase descriptive (1-2 phrases), PAS le nom de l'auteur
