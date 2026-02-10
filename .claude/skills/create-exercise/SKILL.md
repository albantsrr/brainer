---
name: create-exercise
description: Create targeted exercises for chapters or course sections to test and reinforce learning. Generates multiple choice, true/false, or code exercises based on chapter content. Use when you want to add exercises to existing course material.
---

# Create Exercise

## Overview

This skill creates pedagogical exercises for course chapters. It analyzes chapter content to generate targeted exercises that test understanding and reinforce key concepts. Exercises can be created individually or in batches, and are integrated directly into the course structure via the API.

**Key difference from create-chapters:** The `create-chapters` skill transforms raw book content into pedagogical material and creates initial exercises. This skill is focused solely on creating additional exercises for existing content, allowing for iterative improvement and customization of the learning experience.

## When to Use This Skill

Invoke this skill when the user wants to:
- Add new exercises to an existing chapter
- Create exercises on specific topics or concepts from a chapter
- Generate exercises for a particular part or section
- Replace or improve existing exercises
- Create exercises based on a specific difficulty level
- Generate exercises of a specific type (e.g., only code exercises)

## Workflow

### Step 1: Identify Target Content

**Required information:**
- Course slug (e.g., `fundamentals-of-data-engineering`)
- Chapter slug or chapter ID
- Optional: Specific section or topic to focus on
- Optional: Exercise type preference (multiple_choice, true_false, code)
- Optional: Difficulty level (easy, medium, hard)
- Optional: Number of exercises to create (default: 2-4)

**Actions:**
1. Verify the course exists via `GET /api/courses/{slug}`
2. Retrieve chapter info via `GET /api/courses/{slug}/chapters/{chapter_slug}`
3. Fetch chapter content to analyze
4. List existing exercises via `GET /api/chapters/{chapter_id}/exercises` to avoid duplication

### Step 2: Analyze Chapter Content

**Read and analyze the chapter content:**
- Parse HTML structure to identify main topics
- Extract key concepts, definitions, and technical terms
- Identify code examples and practical applications
- Note any existing exercises to ensure new ones are complementary
- Understand the chapter's learning objectives

**If targeting a specific section:**
- Focus analysis on the relevant section only
- Extract section-specific concepts and examples
- Ensure exercises test understanding of that section

### Step 3: Determine Exercise Strategy

**Based on content type and user preferences:**

**For conceptual content:**
- Multiple choice for definitions and comparisons
- True/false for common misconceptions
- Focus on understanding "why" not just "what"

**For technical content:**
- Code exercises for practical application
- Multiple choice for tool selection and trade-offs
- True/false for capability statements

**For mixed content:**
- Balance exercise types (mix of all three)
- Progress from conceptual to practical
- Ensure coverage of different aspects

**Difficulty considerations:**
- **Easy:** Basic definitions, straightforward facts
- **Medium:** Application of concepts, comparisons
- **Hard:** Problem-solving, multi-step reasoning, edge cases

### Step 4: Generate Exercises

**Create exercises following these guidelines:**

#### Multiple Choice Exercise

**API Endpoint:** `POST /api/chapters/{chapter_id}/exercises`

**Format:**
```json
{
  "order": 1,
  "title": "Titre court et descriptif",
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
    "explanation": "Explication détaillée de pourquoi B est correct et pourquoi les autres options sont incorrectes."
  },
  "auto_generated": true
}
```

**Quality criteria:**
- Question tests understanding, not memorization
- 4 options with plausible distractors
- Correct answer is clearly the best
- Explanation reinforces learning (2-4 sentences)
- All text in French

#### True/False Exercise

**Format:**
```json
{
  "order": 2,
  "title": "Titre court et descriptif",
  "type": "true_false",
  "content": {
    "statement": "Affirmation claire et testable.",
    "correct_answer": false,
    "explanation": "Explication de pourquoi c'est vrai/faux avec contexte additionnel."
  },
  "auto_generated": true
}
```

**Quality criteria:**
- Statement is clearly true or false (not ambiguous)
- Tests important concept or common misconception
- Explanation provides educational value
- Avoid absolute terms unless accurate

#### Code Exercise

**Format:**
```json
{
  "order": 3,
  "title": "Titre court et descriptif",
  "type": "code",
  "content": {
    "instructions": "Description claire de ce que l'apprenant doit accomplir.",
    "language": "python",
    "starter_code": "# Point de départ avec structure\ndef function_name():\n    # TODO: Implémenter\n    pass",
    "solution": "# Solution complète et correcte\ndef function_name():\n    # Implémentation avec commentaires\n    return result",
    "hints": [
      "Indice 1 : Guide la réflexion",
      "Indice 2 : Plus direct",
      "Indice 3 : Presque la solution"
    ]
  },
  "auto_generated": true
}
```

**Quality criteria:**
- Instructions are specific and clear
- Starter code provides structure
- Solution is complete and follows best practices
- Hints are progressive (subtle → direct)
- Code is realistic and practical

### Step 5: Create Exercises via API

**For each generated exercise:**

1. **Determine order:**
   - Get existing exercises count
   - Assign sequential order (existing_count + 1, existing_count + 2, etc.)

2. **Create via API:** `POST /api/chapters/{chapter_id}/exercises`
   - Set `auto_generated: true` to mark as AI-generated
   - Include complete exercise content

3. **Handle errors:**
   - If order conflict, retry with updated order
   - Validate JSON structure before sending
   - Provide clear error messages

### Step 6: Report Results

**Display a summary:**
- ✅ Exercices créés: {count}
- 📝 Types: {breakdown by type}
- 📊 Niveau: {difficulty if specified}
- 🎯 Chapitre: {chapter_title}
- 🔗 Voir les exercices: `http://localhost:3000/courses/{course_slug}/chapters/{chapter_slug}`

**List each created exercise:**
```
1. [Type] Titre de l'exercice
   - Question/Statement summary
   - Difficulté: {if specified}
```

## Exercise Creation Strategies

### Strategy 1: Comprehensive Coverage

**When:** User wants complete exercise set for a chapter
**Approach:**
- Analyze entire chapter content
- Identify 3-5 main topics
- Create 1-2 exercises per topic
- Mix exercise types (don't use only one type)
- Progress from easy to hard

### Strategy 2: Targeted Topic

**When:** User wants exercises on a specific concept
**Approach:**
- Focus only on specified topic/section
- Create 2-3 exercises on that topic
- Use most appropriate exercise type for the content
- Ensure exercises approach concept from different angles

### Strategy 3: Type-Specific

**When:** User wants only code exercises (or only MCQ, etc.)
**Approach:**
- Create multiple exercises of requested type
- Vary difficulty and approach
- Cover different aspects of the content
- Ensure quality doesn't suffer from type constraint

### Strategy 4: Difficulty-Specific

**When:** User wants exercises at specific difficulty level
**Approach:**
- Focus on appropriate complexity
- Easy: Basic facts and definitions
- Medium: Application and comparison
- Hard: Problem-solving and edge cases

## Important Notes

- **Backend must be running** on `http://localhost:8000` (or configured API URL)
- **Chapter must exist** - Cannot create exercises for non-existent chapters
- **Content analysis is key** - Read chapter content thoroughly before generating exercises
- **Avoid duplication** - Check existing exercises to create complementary ones
- **Quality over quantity** - Better to create 2 excellent exercises than 5 mediocre ones
- **French content** - All exercises must be in French
- **Technical accuracy** - Verify technical details are correct
- **Mark as auto-generated** - Set `auto_generated: true` for tracking

## Example Usage

### Example 1: Add exercises to existing chapter

**User request:**
> "Ajoute 3 nouveaux exercices au chapitre 'Data Engineering Described' du cours Fundamentals of Data Engineering"

**Skill actions:**
1. ✅ Course found: `fundamentals-of-data-engineering`
2. ✅ Chapter found: "Data Engineering Described" (slug: `data-engineering-described`)
3. 📖 Analyzed chapter content: ~6,500 words, 3 main sections
4. 📋 Existing exercises: 3 (will create exercises 4-6)
5. ✍️  Generated 3 new exercises:
   - Exercise 4: [Multiple Choice] "Évolution du Data Engineering"
   - Exercise 5: [True/False] "Composants d'un Pipeline"
   - Exercise 6: [Code] "Requête SQL de Filtrage"
6. ✅ Created 3 exercises via API
7. 🔗 View at: http://localhost:3000/courses/fundamentals-of-data-engineering/chapters/data-engineering-described

### Example 2: Create code exercises only

**User request:**
> "Crée 2 exercices de code Python pour le chapitre 5, focus sur les data pipelines"

**Skill actions:**
1. ✅ Chapter 5 found: "Building Data Pipelines"
2. 📖 Analyzed content: focus on pipeline concepts and implementation
3. 📋 Existing exercises: 4
4. ✍️  Generated 2 code exercises (Python):
   - Exercise 5: "Créer un Pipeline ETL Simple"
   - Exercise 6: "Gestion des Erreurs dans un Pipeline"
5. ✅ Both exercises created with starter code, solutions, and hints
6. 🔗 View at: http://localhost:3000/courses/fundamentals-of-data-engineering/chapters/building-data-pipelines

### Example 3: Replace existing exercises

**User request:**
> "Les exercices du chapitre 2 sont trop faciles, crée 3 exercices de niveau intermédiaire"

**Skill actions:**
1. ✅ Chapter 2 found: "The Data Engineering Lifecycle"
2. 📋 Listed 3 existing exercises (will replace by adjusting order)
3. 📖 Analyzed content for medium-difficulty topics
4. ✍️  Generated 3 medium-difficulty exercises:
   - Mix of types: 2 MCQ, 1 Code
   - Focus on application and comparison
5. ⚠️  Note: Old exercises still exist (recommend deletion via API or frontend)
6. ✅ Created 3 new exercises
7. 🔗 View at: http://localhost:3000/courses/fundamentals-of-data-engineering/chapters/the-data-engineering-lifecycle

## Resources

### references/exercise_guidelines.md

Complete guidelines for creating effective exercises:
- Exercise type selection
- Writing clear questions
- Creating plausible distractors
- Crafting helpful explanations
- Code exercise best practices
- Quality checklist

### references/api_examples.md

API request/response examples:
- Creating each exercise type
- Handling errors
- Updating exercise order
- Deleting exercises
- Batch operations

## API Reference

### Get Chapter Exercises

```bash
GET /api/chapters/{chapter_id}/exercises
```

Returns list of all exercises for a chapter, ordered by `order` field.

### Create Exercise

```bash
POST /api/chapters/{chapter_id}/exercises
Content-Type: application/json

{
  "order": 1,
  "title": "Exercise Title",
  "type": "multiple_choice|true_false|code",
  "content": { /* type-specific content */ },
  "auto_generated": true
}
```

### Update Exercise

```bash
PUT /api/exercises/{exercise_id}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": { /* updated content */ }
}
```

### Delete Exercise

```bash
DELETE /api/exercises/{exercise_id}
```

Returns 204 No Content on success.
