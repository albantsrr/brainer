# API Examples for Exercise Creation

Complete examples of API interactions for creating, updating, and managing exercises.

## Base URL

```
http://localhost:8000
```

All endpoints require the backend to be running.

## Getting Chapter Information

### Get Course and Chapters

```bash
# Get course details
GET /api/courses/fundamentals-of-data-engineering

Response:
{
  "id": 1,
  "title": "Fundamentals of Data Engineering",
  "slug": "fundamentals-of-data-engineering",
  "description": "...",
  "created_at": "2024-02-10T10:00:00",
  "updated_at": "2024-02-10T10:00:00"
}
```

```bash
# Get all chapters for a course
GET /api/courses/fundamentals-of-data-engineering/chapters

Response:
[
  {
    "id": 1,
    "order": 1,
    "title": "Data Engineering Described",
    "slug": "data-engineering-described",
    "part_id": 1
  },
  {
    "id": 2,
    "order": 2,
    "title": "The Data Engineering Lifecycle",
    "slug": "the-data-engineering-lifecycle",
    "part_id": 1
  }
]
```

### Get Chapter Details with Content

```bash
# Get full chapter details including HTML content
GET /api/courses/fundamentals-of-data-engineering/chapters/data-engineering-described

Response:
{
  "id": 1,
  "course_id": 1,
  "part_id": 1,
  "order": 1,
  "title": "Data Engineering Described",
  "slug": "data-engineering-described",
  "content": "<h2>Introduction</h2><p>...</p>",
  "image": "/static/images/chapter1.png",
  "created_at": "2024-02-10T10:00:00",
  "updated_at": "2024-02-10T10:00:00"
}
```

## Listing Existing Exercises

### Get All Exercises for a Chapter

```bash
# Get exercises by chapter ID
GET /api/chapters/1/exercises

Response:
[
  {
    "id": 1,
    "chapter_id": 1,
    "order": 1,
    "title": "Définition du Data Engineering",
    "type": "multiple_choice",
    "content": {
      "question": "Quel est le rôle principal d'un data engineer ?",
      "options": [
        "Analyser les données",
        "Construire l'infrastructure de données",
        "Créer des modèles ML",
        "Designer des interfaces"
      ],
      "correct_index": 1,
      "explanation": "..."
    },
    "image": null,
    "auto_generated": false,
    "created_at": "2024-02-10T10:00:00",
    "updated_at": "2024-02-10T10:00:00"
  },
  {
    "id": 2,
    "chapter_id": 1,
    "order": 2,
    "title": "Composants d'un Pipeline",
    "type": "true_false",
    "content": {
      "statement": "Un pipeline de données inclut toujours une étape de machine learning.",
      "correct_answer": false,
      "explanation": "..."
    },
    "image": null,
    "auto_generated": false,
    "created_at": "2024-02-10T10:00:00",
    "updated_at": "2024-02-10T10:00:00"
  }
]
```

**Note:** Use this to determine the next `order` value and to avoid creating duplicate exercises.

## Creating Exercises

### Create Multiple Choice Exercise

```bash
POST /api/chapters/1/exercises
Content-Type: application/json

{
  "order": 3,
  "title": "Architecture de Data Warehouse",
  "type": "multiple_choice",
  "content": {
    "question": "Quelle architecture est typiquement utilisée dans un data warehouse ?",
    "options": [
      "Architecture microservices",
      "Architecture en étoile (star schema)",
      "Architecture monolithique",
      "Architecture événementielle"
    ],
    "correct_index": 1,
    "explanation": "Les data warehouses utilisent généralement une architecture en étoile (star schema) avec une table de faits centrale entourée de tables de dimensions. Cette structure facilite les requêtes analytiques et améliore les performances. Les autres architectures sont utilisées pour des systèmes différents."
  },
  "auto_generated": true
}

Response: 201 Created
{
  "id": 3,
  "chapter_id": 1,
  "order": 3,
  "title": "Architecture de Data Warehouse",
  "type": "multiple_choice",
  "content": { ... },
  "image": null,
  "auto_generated": true,
  "created_at": "2024-02-10T11:00:00",
  "updated_at": "2024-02-10T11:00:00"
}
```

### Create True/False Exercise

```bash
POST /api/chapters/1/exercises
Content-Type: application/json

{
  "order": 4,
  "title": "Scalabilité Verticale vs Horizontale",
  "type": "true_false",
  "content": {
    "statement": "La scalabilité horizontale est toujours préférable à la scalabilité verticale pour les systèmes de données.",
    "correct_answer": false,
    "explanation": "Faux. Le choix entre scalabilité horizontale (ajouter des machines) et verticale (augmenter les ressources d'une machine) dépend du cas d'usage. La scalabilité verticale peut être plus simple et moins coûteuse pour des charges modérées, tandis que l'horizontale est meilleure pour une croissance massive. Chaque approche a ses avantages selon le contexte."
  },
  "auto_generated": true
}

Response: 201 Created
{
  "id": 4,
  "chapter_id": 1,
  "order": 4,
  "title": "Scalabilité Verticale vs Horizontale",
  "type": "true_false",
  "content": { ... },
  "image": null,
  "auto_generated": true,
  "created_at": "2024-02-10T11:01:00",
  "updated_at": "2024-02-10T11:01:00"
}
```

### Create Code Exercise (Python)

```bash
POST /api/chapters/2/exercises
Content-Type: application/json

{
  "order": 1,
  "title": "Filtrage de Données avec Pandas",
  "type": "code",
  "content": {
    "instructions": "Écrivez une fonction qui prend un DataFrame pandas et filtre les lignes où la colonne 'status' est 'active' et la colonne 'created_at' est dans les 30 derniers jours. Le DataFrame contient les colonnes : 'id' (int), 'status' (str), 'created_at' (datetime), 'value' (float).",
    "language": "python",
    "starter_code": "import pandas as pd\nfrom datetime import datetime, timedelta\n\ndef filter_recent_active(df: pd.DataFrame) -> pd.DataFrame:\n    \"\"\"\n    Filtre le DataFrame pour ne garder que les entrées actives récentes.\n    \n    Args:\n        df: DataFrame avec colonnes id, status, created_at, value\n    \n    Returns:\n        DataFrame filtré\n    \"\"\"\n    # TODO: Calculer la date limite (30 jours avant aujourd'hui)\n    \n    # TODO: Filtrer sur status == 'active' ET created_at >= date limite\n    \n    pass",
    "solution": "import pandas as pd\nfrom datetime import datetime, timedelta\n\ndef filter_recent_active(df: pd.DataFrame) -> pd.DataFrame:\n    \"\"\"\n    Filtre le DataFrame pour ne garder que les entrées actives récentes.\n    \n    Args:\n        df: DataFrame avec colonnes id, status, created_at, value\n    \n    Returns:\n        DataFrame filtré\n    \"\"\"\n    # Calculer la date limite (30 jours avant aujourd'hui)\n    cutoff_date = datetime.now() - timedelta(days=30)\n    \n    # Filtrer sur les deux conditions\n    filtered_df = df[\n        (df['status'] == 'active') & \n        (df['created_at'] >= cutoff_date)\n    ]\n    \n    return filtered_df",
    "hints": [
      "Utilisez datetime.now() et timedelta pour calculer une date dans le passé",
      "Pandas permet de combiner plusieurs conditions avec & (et)",
      "N'oubliez pas les parenthèses autour de chaque condition lors de la combinaison"
    ]
  },
  "auto_generated": true
}

Response: 201 Created
{
  "id": 5,
  "chapter_id": 2,
  "order": 1,
  ...
}
```

### Create Code Exercise (SQL)

```bash
POST /api/chapters/3/exercises
Content-Type: application/json

{
  "order": 2,
  "title": "Agrégation avec GROUP BY",
  "type": "code",
  "content": {
    "instructions": "Écrivez une requête SQL qui calcule le nombre de commandes et le montant total par client pour l'année 2024. La table 'orders' contient : order_id (int), customer_id (int), order_date (date), amount (decimal). Triez les résultats par montant total décroissant.",
    "language": "sql",
    "starter_code": "-- Calculer les statistiques par client pour 2024\n-- Table: orders (order_id, customer_id, order_date, amount)\n-- Résultat: customer_id, nombre de commandes, montant total\n\nSELECT \n    customer_id,\n    -- TODO: Compter le nombre de commandes\n    -- TODO: Calculer la somme des montants\nFROM orders\nWHERE \n    -- TODO: Filtrer pour l'année 2024\nGROUP BY \n    -- TODO: Grouper par customer_id\nORDER BY \n    -- TODO: Trier par montant total décroissant\n;",
    "solution": "-- Calculer les statistiques par client pour 2024\nSELECT \n    customer_id,\n    COUNT(*) as order_count,\n    SUM(amount) as total_amount\nFROM orders\nWHERE \n    YEAR(order_date) = 2024\nGROUP BY \n    customer_id\nORDER BY \n    total_amount DESC;",
    "hints": [
      "Utilisez COUNT(*) pour compter les lignes et SUM(amount) pour le total",
      "La fonction YEAR() extrait l'année d'une date",
      "ORDER BY peut utiliser les alias définis dans SELECT"
    ]
  },
  "auto_generated": true
}

Response: 201 Created
{ ... }
```

## Updating Exercises

### Update Exercise Content

```bash
PUT /api/exercises/3
Content-Type: application/json

{
  "title": "Architecture de Data Warehouse (mis à jour)",
  "content": {
    "question": "Quelle architecture de modélisation est la plus courante dans un data warehouse ?",
    "options": [
      "Modèle plat (flat)",
      "Modèle en étoile (star schema)",
      "Modèle orienté objets",
      "Modèle hiérarchique"
    ],
    "correct_index": 1,
    "explanation": "Le modèle en étoile (star schema) est l'architecture de modélisation la plus répandue dans les data warehouses. Il organise les données en une table de faits centrale (mesures) entourée de tables de dimensions (contexte). Cette structure simplifie les requêtes analytiques et optimise les performances."
  }
}

Response: 200 OK
{
  "id": 3,
  "chapter_id": 1,
  "order": 3,
  "title": "Architecture de Data Warehouse (mis à jour)",
  "type": "multiple_choice",
  "content": { ... },
  "updated_at": "2024-02-10T12:00:00"
}
```

### Update Only the Title

```bash
PUT /api/exercises/3
Content-Type: application/json

{
  "title": "Nouveau Titre"
}

Response: 200 OK
{
  "id": 3,
  "title": "Nouveau Titre",
  ...
}
```

### Update Exercise Order

```bash
PUT /api/exercises/3
Content-Type: application/json

{
  "order": 1
}

Response: 200 OK
```

**Note:** Be careful with order changes - they can create conflicts if another exercise already has that order.

## Deleting Exercises

### Delete an Exercise

```bash
DELETE /api/exercises/3

Response: 204 No Content
```

**Note:** Exercise is permanently deleted. This does NOT automatically reorder remaining exercises.

## Batch Operations

### Creating Multiple Exercises

When creating multiple exercises at once, send separate requests for each:

```python
import requests

base_url = "http://localhost:8000"
chapter_id = 1

exercises = [
    {
        "order": 3,
        "title": "Exercise 1",
        "type": "multiple_choice",
        "content": { ... },
        "auto_generated": True
    },
    {
        "order": 4,
        "title": "Exercise 2",
        "type": "true_false",
        "content": { ... },
        "auto_generated": True
    },
    {
        "order": 5,
        "title": "Exercise 3",
        "type": "code",
        "content": { ... },
        "auto_generated": True
    }
]

for exercise in exercises:
    response = requests.post(
        f"{base_url}/api/chapters/{chapter_id}/exercises",
        json=exercise
    )
    if response.status_code == 201:
        print(f"✅ Created: {exercise['title']}")
    else:
        print(f"❌ Failed: {exercise['title']} - {response.text}")
```

## Error Handling

### Common Errors

#### 404 - Chapter Not Found

```bash
POST /api/chapters/999/exercises

Response: 404 Not Found
{
  "detail": "Chapter 999 not found"
}
```

**Solution:** Verify chapter ID exists via `GET /api/courses/{slug}/chapters`

#### 422 - Validation Error

```bash
POST /api/chapters/1/exercises
{
  "order": 1,
  "title": "Test",
  "type": "invalid_type",
  "content": {}
}

Response: 422 Unprocessable Entity
{
  "detail": [
    {
      "loc": ["body", "type"],
      "msg": "value is not a valid enumeration member; permitted: 'multiple_choice', 'true_false', 'code'",
      "type": "type_error.enum"
    }
  ]
}
```

**Solution:** Check type is one of: `multiple_choice`, `true_false`, `code`

#### 422 - Invalid Content Structure

```bash
POST /api/chapters/1/exercises
{
  "order": 1,
  "title": "Test",
  "type": "multiple_choice",
  "content": {
    "question": "Question?"
    // Missing options and correct_index
  }
}

Response: 422 Unprocessable Entity
{
  "detail": "Invalid content structure for multiple_choice exercise"
}
```

**Solution:** Ensure content structure matches exercise type requirements

#### 409 - Order Conflict

```bash
POST /api/chapters/1/exercises
{
  "order": 1,  // Already exists
  "title": "Test",
  "type": "multiple_choice",
  "content": { ... }
}

Response: 409 Conflict
{
  "detail": "Exercise with order 1 already exists for this chapter"
}
```

**Solution:** Get existing exercises first, use next available order

## Complete Workflow Example

### Creating 3 Exercises for a Chapter

```python
import requests
from datetime import datetime

base_url = "http://localhost:8000"
course_slug = "fundamentals-of-data-engineering"
chapter_slug = "data-engineering-described"

# Step 1: Get chapter ID
response = requests.get(f"{base_url}/api/courses/{course_slug}/chapters/{chapter_slug}")
chapter = response.json()
chapter_id = chapter['id']
print(f"Chapter ID: {chapter_id}")

# Step 2: Get existing exercises to determine next order
response = requests.get(f"{base_url}/api/chapters/{chapter_id}/exercises")
existing_exercises = response.json()
next_order = len(existing_exercises) + 1
print(f"Existing exercises: {len(existing_exercises)}, next order: {next_order}")

# Step 3: Define new exercises
new_exercises = [
    {
        "order": next_order,
        "title": "Rôle du Data Engineer",
        "type": "multiple_choice",
        "content": {
            "question": "Quelle est la responsabilité principale d'un data engineer ?",
            "options": [
                "Créer des dashboards de visualisation",
                "Construire et maintenir l'infrastructure de données",
                "Analyser les données pour en extraire des insights",
                "Développer des modèles de machine learning"
            ],
            "correct_index": 1,
            "explanation": "Les data engineers sont responsables de la construction et de la maintenance de l'infrastructure qui permet la collecte, le stockage et le traitement des données. Les autres rôles sont assurés par les data analysts (option A et C) et les ML engineers (option D)."
        },
        "auto_generated": True
    },
    {
        "order": next_order + 1,
        "title": "Evolution du Data Engineering",
        "type": "true_false",
        "content": {
            "statement": "Le data engineering a émergé comme discipline distincte après l'apparition du big data dans les années 2000.",
            "correct_answer": True,
            "explanation": "Vrai. Bien que les concepts de gestion de données existaient auparavant, le data engineering en tant que discipline distincte a émergé avec l'avènement du big data, notamment après les publications de Google sur MapReduce et GFS au début des années 2000."
        },
        "auto_generated": True
    },
    {
        "order": next_order + 2,
        "title": "Pipeline ETL Simple",
        "type": "code",
        "content": {
            "instructions": "Créez une fonction Python simple qui lit un fichier CSV, filtre les lignes où 'age' > 18, et écrit le résultat dans un nouveau fichier CSV. Utilisez pandas.",
            "language": "python",
            "starter_code": "import pandas as pd\n\ndef filter_adults(input_file: str, output_file: str):\n    \"\"\"\n    Filtre les adultes (age > 18) d'un CSV.\n    \n    Args:\n        input_file: Chemin du CSV source\n        output_file: Chemin du CSV de sortie\n    \"\"\"\n    # TODO: Lire le CSV\n    \n    # TODO: Filtrer age > 18\n    \n    # TODO: Écrire le résultat\n    \n    pass",
            "solution": "import pandas as pd\n\ndef filter_adults(input_file: str, output_file: str):\n    \"\"\"\n    Filtre les adultes (age > 18) d'un CSV.\n    \n    Args:\n        input_file: Chemin du CSV source\n        output_file: Chemin du CSV de sortie\n    \"\"\"\n    # Lire le fichier CSV source\n    df = pd.read_csv(input_file)\n    \n    # Filtrer les lignes où age > 18\n    adults_df = df[df['age'] > 18]\n    \n    # Écrire dans le fichier de sortie\n    adults_df.to_csv(output_file, index=False)\n    \n    print(f\"Filtré {len(adults_df)} adultes sur {len(df)} lignes\")",
            "hints": [
                "Utilisez pd.read_csv() pour lire le fichier",
                "Le filtrage avec pandas : df[df['column'] > value]",
                "Utilisez df.to_csv() avec index=False pour éviter d'écrire l'index"
            ]
        },
        "auto_generated": True
    }
]

# Step 4: Create exercises
created_count = 0
for exercise in new_exercises:
    response = requests.post(
        f"{base_url}/api/chapters/{chapter_id}/exercises",
        json=exercise
    )
    if response.status_code == 201:
        created = response.json()
        print(f"✅ Created exercise {created['order']}: {created['title']}")
        created_count += 1
    else:
        print(f"❌ Failed to create: {exercise['title']}")
        print(f"   Error: {response.text}")

print(f"\n🎉 Created {created_count} exercises successfully!")
print(f"🔗 View at: http://localhost:3000/courses/{course_slug}/chapters/{chapter_slug}")
```

This example demonstrates the complete workflow for creating multiple exercises programmatically.
