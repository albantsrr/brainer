# Guide de traduction française

Ce document explique comment traduire les titres de cours, parties et chapitres en français lors de l'import d'un livre EPUB.

## Principes de traduction

**⚠️ PAS de traduction littérale !** Les titres doivent être traduits de manière logique, compréhensible et pédagogique.

### 1. Titres et descriptions de cours

**Objectifs :**
- Titre **original et accrocheur**, pas une traduction du titre du livre
- Exprime ce que l'étudiant va maîtriser/accomplir (angle outcome, pas sujet académique)
- Description concise et informative (1-2 phrases, angle pédagogique)

**⚠️ ANTIPLAGIAT DE TITRE — CONTRAINTE ABSOLUE**

Le titre du cours NE DOIT PAS :
- Traduire le titre du livre, même librement
- Reprendre les mots-clés principaux du titre original dans le même ordre
- Ressembler à un titre de livre ou de manuel académique

Le titre du cours DOIT :
- Être inventé de toutes pièces, comme si le cours existait indépendamment du livre
- Exprimer le bénéfice ou l'outcome pour l'étudiant
- Utiliser des structures engageantes : "Maîtriser X", "Comprendre X de l'intérieur", "De zéro à X", "X en pratique", "Concevoir des X robustes"

**Exemples de titres :**

| Livre (anglais) | ❌ Traduction plate (interdit) | ✅ Titre créatif (requis) |
|---------|------------------------|---------------------|
| Fundamentals of Data Engineering | Principes fondamentaux de l'ingénierie des données | Maîtriser les données de bout en bout |
| Computer Systems: A Programmer's Perspective | Systèmes informatiques : une approche pratique | Comprendre l'ordinateur de l'intérieur |
| Docker Deep Dive | Docker en profondeur | Déployer avec Docker, de zéro à la production |
| Grokking Algorithms | Algorithmes illustrés | Penser algorithmique : résoudre avec élégance |
| Learning Python | Apprendre Python | Maîtriser Python, du script au programme structuré |

**Exemples de descriptions :**

| Cours | ❌ Mauvaise description | ✅ Bonne description |
|-------|------------------------|---------------------|
| Docker Deep Dive | by Nigel Poulton | Guide complet de Docker, des concepts de base aux fonctionnalités avancées : conteneurs, images, réseaux, volumes, Compose, Swarm et sécurité. |
| Fundamentals of Data Engineering | by Joe Reis and Matt Housley | Introduction complète à l'ingénierie des données : pipelines, architectures, outils modernes et bonnes pratiques pour construire des systèmes de données robustes. |
| Computer Systems | Un livre sur les systèmes informatiques | Exploration approfondie des systèmes informatiques du point de vue du programmeur : architecture matérielle, systèmes d'exploitation, réseaux et optimisation. |

**Règles :**
- Le titre inventé peut être court ou long — pas de contrainte de format
- Garder les noms de langages/technologies tels quels (Python, Docker, SQL, etc.)
- Le slug du cours est généré depuis ce titre inventé (kebab-case, sans accents)
- **Description : 1-2 phrases maximum, résumant les compétences acquises (PAS le nom de l'auteur)**

**Règle d'originalité pour les descriptions :**

La description NE DOIT PAS :
- Paraphraser la 4e de couverture ou la présentation officielle du livre
- Reprendre le résumé de l'introduction ou de la préface
- Mentionner l'auteur, l'éditeur ou la réputation du livre

La description DOIT :
- Être rédigée comme si on présentait ce cours à un étudiant, indépendamment du livre
- Refléter les compétences que l'étudiant va acquérir (angle pédagogique, pas éditorial)

❌ "Ce livre reconnu comme référence mondiale explore l'architecture des processeurs modernes..."
✅ "Comprendre comment un programme en C devient des instructions machine, comment la mémoire est organisée, et comment optimiser les performances au niveau système."

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

**⚠️ IMPORTANT :** Les titres de chapitres sont **toujours des affirmations de compétence** (verbe d'action + objet). La forme question est **strictement interdite**.

**Règle absolue :**
- ✅ TOUJOURS : verbe d'action à l'infinitif + objet ("Construire X", "Analyser Y", "Optimiser Z")
- ❌ JAMAIS : forme interrogative ("Comment X ?", "Pourquoi Y ?", "Qu'est-ce que Z ?")

**Objectifs :**
- Exprimer ce que l'étudiant sait faire après le chapitre
- Court, scannable, actionnable dans un sommaire ou une sidebar
- Format consistant avec préfixe numéroté

**Exemples :**

| Sujet du chapitre | ❌ Forme question (interdite) | ✅ Affirmation de compétence (requis) |
|---------|------------------------|---------------------|
| Introduction à l'ingénierie des données | Comment définir l'ingénierie des données ? | Définir le rôle de l'ingénieur des données |
| Modélisation des données | Pourquoi modéliser ses données ? | Concevoir un modèle de données efficace |
| Pipelines de données | Comment construire un pipeline robuste ? | Construire un pipeline de données robuste |
| Optimisation SQL | Quand et pourquoi optimiser ses requêtes ? | Optimiser les requêtes SQL pour la production |
| Représentation binaire | Comment deux symboles suffisent-ils à tout représenter ? | Encoder l'information avec seulement deux états |

**Règles :**
- **Format final : "Chapitre {numéro} : {affirmation de compétence}"**
- Verbe à l'infinitif en tête : "Construire", "Analyser", "Optimiser", "Concevoir", "Implémenter", "Comprendre"
- ≤ 7 mots après "Chapitre N :"
- Utiliser l'article défini : "les données", "les API", "les performances"

### 4. Règle de concision (LIMITE ABSOLUE)

Les titres verbeux sont le défaut le plus courant. Appliquer ces limites strictement.

**Limites de longueur :**
- Partie : ≤ 6 mots après "Partie N : "
- Chapitre : ≤ 7 mots après "Chapitre N : "

**Interdiction du "et" à double concept :**
Dès qu'un titre contient "et" pour relier deux idées distinctes, c'est un signal d'alerte — couper le titre à l'idée principale ou scinder le chapitre.

| ❌ Trop long / double concept | ✅ Concis et net |
|-------------------------------|-----------------|
| "Comprendre le rôle du data engineer et maîtriser le cycle de vie des données" | "Le cycle de vie du data engineer" |
| "Concevoir et architecturer des systèmes de données" | "Concevoir des systèmes de données" |
| "Transformer, servir et pérenniser les données" | "Transformer et servir les données" |
| "Sécuriser les pipelines et anticiper l'avenir du data engineering" | "Sécuriser les pipelines de données" |
| "Concevoir une architecture de données scalable et résiliente" | "Architecturer des systèmes scalables" |
| "Choisir les technologies adaptées au cycle de vie des données" | "Choisir ses outils selon le cycle de vie" |

**Règle du "et" acceptable :** Un seul "et" est toléré uniquement si les deux éléments forment une opération indissociable et courte (ex : "Lire et écrire des fichiers" — 5 mots, opération unique). Au-delà, supprimer le second élément.

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
    "title": "Maîtriser les données de bout en bout",
    "slug": "maitriser-les-donnees-de-bout-en-bout",
    "author": "Joe Reis, Matt Housley",
    "description": "Construire des pipelines de données robustes, choisir les bonnes architectures et maîtriser les outils modernes de l'ingénierie des données.",
    "difficulty": "intermediaire"
  },
  "parts": [
    {
      "order": 1,
      "title": "Partie 1 : Poser les bases de l'ingénierie des données"
    },
    {
      "order": 2,
      "title": "Partie 2 : Orchestrer le cycle de vie des données"
    }
  ],
  "chapters": [
    {
      "order": 1,
      "title": "Chapitre 1 : Définir le rôle de l'ingénieur des données",
      "slug": "chapitre-1-definir-le-role-de-lingenieur-des-donnees",
      "source_files": ["ch01.xhtml"],
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

**Source (course-plan.json) :**
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
    },
    {
      "order": 2,
      "title": "Chapter 2: Representing and Manipulating Information"
    }
  ]
}
```

**Français (temp/course-plan-fr.json) — découpage pédagogique :**

Le chapitre 1 du livre ("A Tour") couvre 3 angles distincts (le programme, la mémoire, le réseau) → scindé en 3 chapitres de cours. Le chapitre 2 du livre ("Representing and Manipulating") couvre 2 modèles distincts (encodage des entiers, encodage des flottants) → scindé en 2 chapitres. Résultat : 2 chapitres de livre → 5 chapitres de cours.

```json
{
  "course": {
    "title": "Comprendre l'ordinateur de l'intérieur",
    "slug": "comprendre-lordinateur-de-linterieur",
    "description": "Comprendre comment un programme C devient des instructions machine, comment la mémoire est organisée, et comment optimiser les performances au niveau système.",
    "difficulty": "avance"
  },
  "parts": [
    {
      "order": 1,
      "title": "Partie 1 : Exécuter et représenter les programmes"
    }
  ],
  "chapters": [
    {
      "order": 1,
      "title": "Chapitre 1 : Situer le programme dans le système",
      "slug": "chapitre-1-situer-le-programme-dans-le-systeme",
      "source_files": ["ch01.xhtml"]
    },
    {
      "order": 2,
      "title": "Chapitre 2 : Comprendre la hiérarchie mémoire",
      "slug": "chapitre-2-comprendre-la-hierarchie-memoire",
      "source_files": ["ch01.xhtml"]
    },
    {
      "order": 3,
      "title": "Chapitre 3 : Lire le voyage d'une requête réseau",
      "slug": "chapitre-3-lire-le-voyage-dune-requete-reseau",
      "source_files": ["ch01.xhtml"]
    },
    {
      "order": 4,
      "title": "Chapitre 4 : Encoder les entiers en binaire",
      "slug": "chapitre-4-encoder-les-entiers-en-binaire",
      "source_files": ["ch02.xhtml"]
    },
    {
      "order": 5,
      "title": "Chapitre 5 : Représenter les nombres flottants",
      "slug": "chapitre-5-representer-les-nombres-flottants",
      "source_files": ["ch02.xhtml"]
    }
  ]
}
```

**Note :** Plusieurs chapitres de cours peuvent pointer vers le même `source_files` — le skill `/create-chapters` sait quelle partie du XHTML exploiter grâce au titre et au plan pédagogique.

---

## Notes importantes

- **Ne PAS modifier les slugs** : Ils restent en anglais pour la compatibilité
- **Préserver la structure JSON** : Ne pas modifier les clés, seulement les valeurs "title" et "description"
- **Conserver les métadonnées** : Author, order, etc. restent identiques
- **Respecter la hiérarchie** : Partie → Chapitre
- **OBLIGATOIRE : Ajouter une description** : Le champ "description" doit contenir une phrase descriptive (1-2 phrases), PAS le nom de l'auteur
