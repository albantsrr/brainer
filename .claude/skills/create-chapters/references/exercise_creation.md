# Exercise Creation Guidelines

Guidelines for creating effective exercises that reinforce chapter content and test understanding.

## Exercise Types

### 1. Multiple Choice (QCM)
**Best for:** Testing conceptual understanding, definitions, comparing options

**Structure:**
```json
{
  "order": 1,
  "title": "Short descriptive title",
  "type": "multiple_choice",
  "content": {
    "question": "Clear, specific question",
    "options": [
      "Option A",
      "Option B",
      "Option C (correct)",
      "Option D"
    ],
    "correct_index": 2,
    "explanation": "Why this is correct and why others are wrong"
  }
}
```

### 2. True/False (Vrai/Faux)
**Best for:** Testing understanding of specific facts, common misconceptions

**Structure:**
```json
{
  "order": 2,
  "title": "Short descriptive title",
  "type": "true_false",
  "content": {
    "statement": "A clear, testable statement",
    "correct_answer": false,
    "explanation": "Why this is true/false with context"
  }
}
```

### 3. Code Exercise
**Best for:** Testing practical application, problem-solving skills

**Structure:**
```json
{
  "order": 3,
  "title": "Short descriptive title",
  "type": "code",
  "content": {
    "instructions": "What the learner should accomplish",
    "language": "python",
    "starter_code": "# Starting point\n",
    "solution": "# Complete solution\n",
    "hints": [
      "Hint 1",
      "Hint 2"
    ]
  }
}
```

## Writing Good Multiple Choice Questions

### Question Writing

**DO:**
- Ask clear, specific questions
- Focus on one concept per question
- Use realistic scenarios when possible
- Make questions straightforward (avoid tricks)

**DON'T:**
- Use "all of the above" or "none of the above"
- Include negative phrasing ("which is NOT...")
- Make questions unnecessarily complex
- Test trivial details

**Examples:**

**Good:**
```
Question: "Quel est le rôle principal d'un data engineer ?"
- Analyser les données pour en extraire des insights
- Construire et maintenir l'infrastructure de données (correct)
- Créer des modèles de machine learning
- Concevoir des visualisations de données
```

**Bad:**
```
Question: "Laquelle de ces affirmations sur les data engineers n'est PAS vraie ?"
- Ils travaillent avec des bases de données
- Ils ne font jamais d'analyse de données (correct)
- Ils utilisent Python
- Ils créent des pipelines ETL
```

### Option Writing

**Distractors (wrong answers) should be:**
- Plausible to someone who hasn't fully understood
- Related to the topic (not obviously wrong)
- Similar in length and complexity to the correct answer

**The correct answer should be:**
- Clearly the best answer (not just "most correct")
- Not obviously different in length or style
- Factually accurate and complete

**Example:**

```json
{
  "question": "Qu'est-ce que MapReduce ?",
  "options": [
    "Un langage de programmation pour le big data",
    "Un paradigme de traitement parallèle de données massives", // Correct
    "Une base de données distribuée",
    "Un outil de visualisation de données"
  ],
  "correct_index": 1,
  "explanation": "MapReduce est un paradigme de programmation qui permet de traiter
  de grandes quantités de données en parallèle sur des clusters distribués. Ce n'est
  pas un langage (option A), une base de données (option C), ou un outil de
  visualisation (option D)."
}
```

### Explanation Writing

**Good explanations:**
- Explain why the correct answer is right
- Briefly mention why common wrong answers are incorrect
- Reinforce the learning objective
- Are concise but complete (2-4 sentences)

**Example explanations:**

**Good:**
```
"MapReduce est un paradigme de programmation qui permet de traiter de grandes
quantités de données en parallèle. Il décompose le calcul en deux phases :
'map' (transformation des données) et 'reduce' (agrégation des résultats).
C'est une méthode de traitement, pas un langage ou une base de données."
```

**Bad:**
```
"C'est la bonne réponse parce que c'est correct."
```

## Writing Good True/False Questions

### Statement Writing

**DO:**
- Make statements clearly true or clearly false
- Test important concepts or common misconceptions
- Use specific, factual statements

**DON'T:**
- Use absolute terms ("always", "never") unless accurate
- Make statements ambiguous
- Test trivial facts

**Examples:**

**Good:**
```json
{
  "statement": "Hadoop est toujours nécessaire pour traiter de grandes quantités
  de données.",
  "correct_answer": false,
  "explanation": "Faux. Les services cloud modernes et les solutions managées
  offrent souvent de meilleures alternatives à la gestion de clusters Hadoop,
  avec des abstractions simplifiées et des modèles de paiement à l'usage."
}
```

**Good:**
```json
{
  "statement": "Le data engineering inclut la collecte, le stockage, et la
  transformation des données.",
  "correct_answer": true,
  "explanation": "Vrai. Ces trois activités font partie du cycle de vie du
  data engineering, qui couvre l'ensemble du processus depuis la génération
  des données jusqu'à leur utilisation."
}
```

**Bad:**
```json
{
  "statement": "Le data engineering est important.",
  "correct_answer": true,
  "explanation": "Vrai, c'est important."
}
```

## Writing Good Code Exercises

### Instruction Writing

**Clear instructions should:**
- Specify exactly what to accomplish
- Mention any constraints or requirements
- Provide context (what is the data, what is the goal)

**Example:**

**Good:**
```
"Écrivez une requête SQL qui sélectionne tous les utilisateurs ayant créé leur
compte au cours des 30 derniers jours. La table s'appelle 'users' et contient
une colonne 'created_at' de type DATE."
```

**Bad:**
```
"Écrivez une requête pour les utilisateurs récents."
```

### Starter Code

**Provide:**
- Enough structure to guide the learner
- Comments indicating where to fill in code
- Any necessary imports or setup

**Example:**

```python
# Starter code for a Python exercise
import pandas as pd

def filter_active_users(df):
    """
    Filter users who have been active in the last week.

    Args:
        df: DataFrame with columns 'user_id', 'last_active'

    Returns:
        DataFrame with only active users
    """
    # TODO: Filter users where last_active is within 7 days
    pass
```

### Solution

**Provide:**
- Complete, working code
- Comments explaining key steps
- Follow best practices

**Example:**

```python
import pandas as pd
from datetime import datetime, timedelta

def filter_active_users(df):
    """
    Filter users who have been active in the last week.

    Args:
        df: DataFrame with columns 'user_id', 'last_active'

    Returns:
        DataFrame with only active users
    """
    # Calculate the cutoff date (7 days ago)
    cutoff_date = datetime.now() - timedelta(days=7)

    # Filter DataFrame for recent activity
    active_users = df[df['last_active'] >= cutoff_date]

    return active_users
```

### Hints

**Good hints:**
- Progressive (hint 1 is subtle, hint 2 more direct)
- Guide thinking without giving away the answer
- Point to relevant concepts or functions

**Example:**

```json
"hints": [
  "Utilisez la fonction CURRENT_DATE pour obtenir la date actuelle",
  "L'opérateur INTERVAL permet de manipuler des dates",
  "La condition WHERE doit comparer created_at avec CURRENT_DATE - INTERVAL '30 days'"
]
```

## Exercise Ordering and Difficulty

### Order Exercises Logically

1. **Start easy:** Test basic definitions and concepts
2. **Increase complexity:** Move to application and comparison
3. **End practical:** Finish with code or real-world scenarios

### Example Set

```json
[
  {
    "order": 1,
    "title": "Définition du Data Engineering",
    "type": "multiple_choice",
    // Basic definition question
  },
  {
    "order": 2,
    "title": "Composants du Data Engineering",
    "type": "true_false",
    // Test understanding of components
  },
  {
    "order": 3,
    "title": "Comparaison des Approches",
    "type": "multiple_choice",
    // Compare different approaches or tools
  },
  {
    "order": 4,
    "title": "Pipeline de Données Simple",
    "type": "code",
    // Apply concepts in practice
  }
]
```

## Exercise Quality Checklist

Before creating exercises, verify:

- [ ] 2-4 exercises per chapter
- [ ] Mix of exercise types (not all multiple choice)
- [ ] Questions test different aspects of the chapter
- [ ] Difficulty progresses from easy to harder
- [ ] Questions are clear and specific
- [ ] Explanations are helpful and educational
- [ ] Code exercises are practical and realistic
- [ ] All content is in French
- [ ] Technical terms are accurate
- [ ] Distractors are plausible but clearly wrong

## Examples by Chapter Topic

### For Conceptual Chapters (Theory, Principles)

**Good mix:**
- 2 multiple choice (definitions, comparisons)
- 1 true/false (common misconceptions)
- 1 optional code (if applicable)

### For Technical Chapters (Tools, Implementations)

**Good mix:**
- 1 multiple choice (concepts)
- 1 true/false (tool capabilities)
- 2 code exercises (practical application)

### For Architecture Chapters (Design, Patterns)

**Good mix:**
- 2 multiple choice (design principles, trade-offs)
- 1 true/false (pattern characteristics)
- 1 code or scenario-based exercise
