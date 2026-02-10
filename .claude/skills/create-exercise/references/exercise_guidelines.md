# Exercise Creation Guidelines

Complete guidelines for creating effective exercises that test understanding and reinforce learning.

## Exercise Types Overview

### When to Use Each Type

| Exercise Type | Best For | Typical Use Cases |
|--------------|----------|------------------|
| **Multiple Choice** | Conceptual understanding, comparisons, selecting best approach | Definitions, tool selection, design decisions, comparing options |
| **True/False** | Quick comprehension checks, testing misconceptions | Fact verification, capability statements, common mistakes |
| **Code** | Practical application, problem-solving | Writing queries, implementing functions, fixing bugs, applying patterns |

## Multiple Choice Exercises

### Structure

```json
{
  "order": 1,
  "title": "Titre court (max 60 caractères)",
  "type": "multiple_choice",
  "content": {
    "question": "Question claire et précise ?",
    "options": [
      "Option A",
      "Option B (correcte)",
      "Option C",
      "Option D"
    ],
    "correct_index": 1,
    "explanation": "Explication détaillée (2-4 phrases)"
  },
  "auto_generated": true
}
```

### Question Writing Best Practices

**DO:**
- Ask clear, specific questions
- Focus on one concept per question
- Use realistic scenarios
- Make questions straightforward
- Test understanding, not memorization

**DON'T:**
- Use "all of the above" or "none of the above"
- Include negative phrasing ("which is NOT...")
- Make questions unnecessarily complex
- Test trivial details
- Use trick questions

### Examples

#### Good Question
```json
{
  "question": "Quel est le rôle principal d'un data warehouse ?",
  "options": [
    "Exécuter des transactions en temps réel",
    "Stocker et organiser des données pour l'analyse",
    "Gérer les connexions utilisateurs",
    "Sauvegarder les données en temps réel"
  ],
  "correct_index": 1,
  "explanation": "Un data warehouse stocke et organise des données historiques optimisées pour l'analyse et le reporting. Les transactions en temps réel sont gérées par des bases de données OLTP, pas par des data warehouses."
}
```

#### Bad Question (too negative)
```json
{
  "question": "Laquelle de ces affirmations sur les data warehouses n'est PAS vraie ?",
  "options": [
    "Ils stockent des données historiques",
    "Ils sont optimisés pour les écritures rapides",
    "Ils supportent l'analyse de données",
    "Ils utilisent des schémas en étoile"
  ],
  "correct_index": 1
}
```

### Option Writing Guidelines

**Creating Good Distractors (wrong answers):**
- Make them plausible to someone who hasn't fully understood
- Related to the topic (not obviously wrong)
- Similar length to the correct answer
- Based on common misconceptions
- Mutually exclusive with other options

**The Correct Answer Should:**
- Be clearly the best answer
- Not stand out in length or style
- Be factually accurate and complete
- Not require interpretation

### Example with Analysis

```json
{
  "question": "Quelle est la principale différence entre un data lake et un data warehouse ?",
  "options": [
    "Le data lake stocke uniquement des données structurées",
    "Le data warehouse ne peut pas être interrogé avec SQL",
    "Le data lake stocke les données brutes dans leur format natif",
    "Le data warehouse est toujours plus rapide"
  ],
  "correct_index": 2,
  "explanation": "Un data lake stocke les données dans leur format brut et natif (structurées, semi-structurées, ou non structurées), tandis qu'un data warehouse transforme et structure les données avant de les stocker. L'option A est fausse car les data lakes peuvent stocker tous types de données. L'option B est fausse car les data warehouses sont conçus pour SQL. L'option D est trop absolue et dépend du cas d'usage."
}
```

**Why this works:**
- **Question:** Clear, tests core concept
- **Correct answer:** Precise and accurate
- **Distractor A:** Reverses a key characteristic (plausible confusion)
- **Distractor B:** False capability statement (related misconception)
- **Distractor D:** Oversimplification (common assumption)
- **Explanation:** Explains correct answer AND why others are wrong

### Explanation Writing

**Good explanations have:**
1. Clear statement of why correct answer is right
2. Brief mention of why wrong answers are incorrect
3. Additional context or insight
4. 2-4 sentences (concise but complete)

**Examples:**

**Good Explanation:**
```
"MapReduce est un paradigme de programmation qui permet de traiter de grandes quantités de données en parallèle. Il décompose le calcul en deux phases : 'map' (transformation) et 'reduce' (agrégation). Ce n'est pas un langage de programmation (A), une base de données (C), ou un outil de visualisation (D)."
```

**Bad Explanation:**
```
"C'est la bonne réponse."
```

## True/False Exercises

### Structure

```json
{
  "order": 2,
  "title": "Titre court",
  "type": "true_false",
  "content": {
    "statement": "Affirmation claire et testable.",
    "correct_answer": false,
    "explanation": "Pourquoi c'est vrai/faux avec contexte."
  },
  "auto_generated": true
}
```

### Statement Writing Best Practices

**DO:**
- Make statements clearly true OR clearly false
- Test important concepts or common misconceptions
- Use specific, factual statements
- Focus on meaningful knowledge

**DON'T:**
- Use absolute terms ("always", "never") unless accurate
- Make statements ambiguous
- Test trivial facts
- Create trick statements

### Examples

#### Good True Statement
```json
{
  "statement": "Le data engineering inclut la collecte, le stockage, et la transformation des données.",
  "correct_answer": true,
  "explanation": "Vrai. Ces trois activités sont au cœur du data engineering : collecter les données depuis les sources, les stocker de manière organisée, et les transformer pour l'analyse. Ces étapes constituent le pipeline de données typique."
}
```

#### Good False Statement
```json
{
  "statement": "Hadoop est toujours nécessaire pour traiter de grandes quantités de données.",
  "correct_answer": false,
  "explanation": "Faux. Les services cloud modernes (AWS EMR, Google BigQuery, Snowflake) offrent souvent de meilleures alternatives à la gestion manuelle de clusters Hadoop, avec des abstractions simplifiées et des modèles de paiement à l'usage. Hadoop reste pertinent dans certains cas, mais n'est plus la seule solution."
}
```

#### Bad Statement (ambiguous)
```json
{
  "statement": "Le data engineering est important.",
  "correct_answer": true,
  "explanation": "Vrai, c'est important."
}
```

**Why this is bad:**
- "Important" is subjective
- Tests opinion, not knowledge
- Explanation adds no value
- Doesn't test understanding

## Code Exercises

### Structure

```json
{
  "order": 3,
  "title": "Titre descriptif de la tâche",
  "type": "code",
  "content": {
    "instructions": "Description claire de la tâche avec contexte et contraintes.",
    "language": "python",
    "starter_code": "# Structure de départ\ndef function():\n    # TODO\n    pass",
    "solution": "# Solution complète avec commentaires\ndef function():\n    # Implémentation\n    return result",
    "hints": [
      "Indice 1 : Orientation générale",
      "Indice 2 : Plus spécifique",
      "Indice 3 : Presque la solution"
    ]
  },
  "auto_generated": true
}
```

### Instruction Writing

**Clear instructions should specify:**
1. What to accomplish (the goal)
2. Input/output format and types
3. Any constraints or requirements
4. Context (what is the data, what is the scenario)

**Examples:**

**Good Instructions:**
```
"Écrivez une fonction Python qui filtre une liste de dictionnaires représentant des utilisateurs et ne retourne que ceux actifs dans les 7 derniers jours. Chaque dictionnaire contient les clés 'user_id' (int), 'name' (str), et 'last_active' (datetime). La fonction doit retourner une nouvelle liste."
```

**Bad Instructions:**
```
"Écrivez une fonction pour filtrer les utilisateurs."
```

### Starter Code Guidelines

**Provide:**
- Function signature with correct parameters
- Docstring or comments explaining the task
- Type hints (for Python, TypeScript)
- Any necessary imports
- Structure to guide implementation

**Examples:**

**Python Example:**
```python
from datetime import datetime, timedelta

def filter_active_users(users: list[dict]) -> list[dict]:
    """
    Filtre les utilisateurs actifs dans les 7 derniers jours.

    Args:
        users: Liste de dicts avec 'user_id', 'name', 'last_active'

    Returns:
        Liste des utilisateurs actifs
    """
    # TODO: Calculer la date de référence (7 jours avant aujourd'hui)

    # TODO: Filtrer les utilisateurs dont last_active >= date de référence

    pass
```

**SQL Example:**
```sql
-- Sélectionner les commandes des 30 derniers jours
-- Table: orders (id, customer_id, order_date, total)
-- Retourner: order_id, customer_id, order_date, total

SELECT
    -- TODO: Sélectionner les colonnes appropriées

FROM orders
WHERE
    -- TODO: Ajouter la condition sur order_date

ORDER BY
    -- TODO: Trier par date décroissante
;
```

### Solution Guidelines

**Provide:**
- Complete, working code
- Comments explaining key steps
- Best practices (error handling where appropriate)
- Readable, maintainable code

**Example:**

```python
from datetime import datetime, timedelta

def filter_active_users(users: list[dict]) -> list[dict]:
    """
    Filtre les utilisateurs actifs dans les 7 derniers jours.

    Args:
        users: Liste de dicts avec 'user_id', 'name', 'last_active'

    Returns:
        Liste des utilisateurs actifs
    """
    # Calculer la date limite (7 jours avant maintenant)
    cutoff_date = datetime.now() - timedelta(days=7)

    # Filtrer les utilisateurs actifs
    active_users = [
        user for user in users
        if user['last_active'] >= cutoff_date
    ]

    return active_users
```

### Hints Guidelines

**Create progressive hints:**
1. **Hint 1:** General direction, conceptual
2. **Hint 2:** More specific, mentions functions/methods
3. **Hint 3:** Very specific, almost gives away solution

**Example:**

```json
"hints": [
  "Vous devez calculer une date de référence basée sur la date actuelle",
  "Utilisez datetime.now() et timedelta pour calculer une date dans le passé",
  "Comparez user['last_active'] >= (datetime.now() - timedelta(days=7))"
]
```

## Exercise Ordering and Progression

### Ordering Principles

1. **Easy → Hard:** Start with basic concepts, increase complexity
2. **Conceptual → Practical:** Theory first, then application
3. **Simple → Complex:** Single concept before combining concepts

### Example Progression

**Chapter on SQL and Databases:**

```
Order 1: [True/False - Easy]
"Une base de données relationnelle organise les données en tables."
→ Tests basic understanding

Order 2: [Multiple Choice - Easy]
"Quelle commande SQL permet de récupérer des données ?"
→ Tests basic SQL knowledge

Order 3: [Multiple Choice - Medium]
"Quelle est la différence entre INNER JOIN et LEFT JOIN ?"
→ Tests understanding of concepts

Order 4: [Code - Medium]
"Écrivez une requête pour joindre deux tables et filtrer les résultats."
→ Applies JOIN knowledge

Order 5: [Code - Hard]
"Optimisez cette requête complexe avec plusieurs JOINs et sous-requêtes."
→ Advanced problem-solving
```

## Difficulty Levels

### Easy Exercises

**Characteristics:**
- Basic definitions
- Straightforward facts
- Single concept
- Minimal reasoning

**Example:**
```json
{
  "title": "Définition de ETL",
  "type": "multiple_choice",
  "content": {
    "question": "Que signifie ETL ?",
    "options": [
      "Extract, Transform, Load",
      "Execute, Test, Launch",
      "Evaluate, Track, Log",
      "Export, Transfer, List"
    ],
    "correct_index": 0
  }
}
```

### Medium Exercises

**Characteristics:**
- Application of concepts
- Comparison between options
- Multi-step reasoning
- Understanding implications

**Example:**
```json
{
  "title": "Choix d'Architecture",
  "type": "multiple_choice",
  "content": {
    "question": "Pour un système nécessitant des requêtes analytiques complexes sur des données historiques, quelle solution est la plus appropriée ?",
    "options": [
      "Base de données OLTP",
      "Data warehouse",
      "Cache mémoire",
      "File d'attente de messages"
    ],
    "correct_index": 1
  }
}
```

### Hard Exercises

**Characteristics:**
- Problem-solving
- Edge cases
- Combining multiple concepts
- Complex scenarios
- Performance optimization

**Example:**
```json
{
  "title": "Optimisation de Pipeline",
  "type": "code",
  "content": {
    "instructions": "Un pipeline traite 1 million de lignes par minute mais certaines lignes causent des erreurs. Modifiez le code pour gérer les erreurs sans arrêter le pipeline, enregistrer les lignes problématiques dans un fichier séparé, et continuer le traitement.",
    "language": "python"
  }
}
```

## Quality Checklist

Before creating exercises, verify:

### Content Quality
- [ ] Tests important concepts (not trivial details)
- [ ] Clear and unambiguous
- [ ] Factually accurate
- [ ] Appropriate difficulty level
- [ ] All text in French

### Multiple Choice Specific
- [ ] 4 plausible options
- [ ] One clearly correct answer
- [ ] Distractors are related but wrong
- [ ] Explanation covers all options
- [ ] No "all/none of the above"

### True/False Specific
- [ ] Statement is clearly T or F
- [ ] Tests meaningful knowledge
- [ ] Not trivial or obvious
- [ ] Explanation adds educational value

### Code Exercise Specific
- [ ] Instructions are complete and clear
- [ ] Starter code provides structure
- [ ] Solution is correct and well-commented
- [ ] Hints are progressive
- [ ] Realistic and practical

### Integration Quality
- [ ] Complements existing exercises
- [ ] Covers different aspect of content
- [ ] Fits in logical progression
- [ ] Appropriate order assigned

## Common Mistakes to Avoid

### 1. Testing Memorization Instead of Understanding

**Bad:**
```
"En quelle année Hadoop a-t-il été créé ?"
```

**Good:**
```
"Pourquoi Hadoop a-t-il révolutionné le traitement de données massives ?"
```

### 2. Ambiguous Questions

**Bad:**
```
"Est-ce que Python est mieux que SQL pour le traitement de données ?"
```

**Good:**
```
"Quel langage est le plus approprié pour des transformations de données dans une base de données : Python ou SQL ?"
```

### 3. Too Easy (Obvious)

**Bad:**
```
Statement: "Les bases de données stockent des données."
Answer: True
```

**Good:**
```
Statement: "Les bases de données NoSQL garantissent toujours la cohérence forte des données."
Answer: False
```

### 4. Too Complex (Overwhelming)

**Bad:**
```
"Écrivez une fonction qui implémente un ETL complet avec extraction depuis une API REST paginée, transformation avec validation de schéma et nettoyage, chargement incrémental vers une base de données avec gestion des conflits, logging détaillé, gestion des erreurs, retry logic, et monitoring."
```

**Good:**
```
"Écrivez une fonction qui extrait des données depuis une API REST et les transforme en DataFrame pandas."
```

### 5. Trick Questions

**Bad:**
```
"Quelle commande SQL permet de SUPPRIMER des données ?"
Options: ["DROP", "DELETE", "REMOVE", "DESTROY"]
(Trick: both DROP and DELETE can delete, but context matters)
```

**Good:**
```
"Quelle commande SQL supprime des lignes spécifiques d'une table selon une condition ?"
Options: ["DROP", "DELETE", "TRUNCATE", "REMOVE"]
Answer: DELETE
```

## Language: French Content

All exercises must be in French with:
- Professional, clear language
- "Vous" (formal) for instructions
- Consistent terminology
- Proper accents and grammar

**Technical terms:**
- Keep English when standard in industry: "pipeline", "big data", "cloud"
- Translate when French equivalent exists: "storage" → "stockage"
- Be consistent across all exercises
