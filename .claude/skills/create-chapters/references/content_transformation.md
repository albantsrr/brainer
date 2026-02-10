# Content Transformation Guidelines

This document provides guidelines for transforming raw book chapter content into concise, pedagogical course material.

## Core Principles

### 1. Conciseness
- **Target:** 40-60% of original length
- **Method:** Extract essential concepts, remove verbose explanations
- **Keep:** Key definitions, important examples, critical insights
- **Remove:** Repetitive explanations, tangential anecdotes, excessive detail

### 2. Pedagogical Structure
- **Start with objectives:** What will the learner understand after this chapter?
- **Progressive disclosure:** Simple concepts first, build complexity gradually
- **Active learning:** Frame content as questions and answers
- **Practical examples:** Prefer concrete examples over abstract theory

### 3. Clarity
- **Simple language:** Use clear, direct sentences
- **Technical accuracy:** Simplify explanations but keep technical details correct
- **Define terms:** Explain jargon on first use
- **Visual hierarchy:** Use headings to structure content logically

## HTML Structure Guidelines

### Semantic HTML Tags

Use semantic HTML5 tags for proper structure and styling:

```html
<!-- Main section headings -->
<h2>Section Title</h2>

<!-- Subsection headings -->
<h3>Subsection Title</h3>

<!-- Paragraphs -->
<p>Regular paragraph text with <strong>emphasis</strong> and <em>italics</em>.</p>

<!-- Unordered lists -->
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>

<!-- Ordered lists -->
<ol>
  <li>Step one</li>
  <li>Step two</li>
</ol>

<!-- Code blocks -->
<pre><code class="language-python">
def example():
    return "Hello World"
</code></pre>

<!-- Inline code -->
<p>Use the <code>print()</code> function to output text.</p>

<!-- Important quotes or callouts -->
<blockquote>
  <p>An important principle or quote to highlight.</p>
</blockquote>

<!-- Images with captions -->
<figure>
  <img src="/static/images/fode_0101.png" alt="Description of image" />
  <figcaption>Figure 1: Caption explaining what the image shows</figcaption>
</figure>

<!-- Tables (when necessary) -->
<table>
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
```

### Style Guidelines

**DO:**
- Use semantic tags (`<strong>`, `<em>`, `<code>`)
- Keep structure clean and readable
- Add descriptive alt text to images
- Use figure captions to explain images
- Structure content hierarchically (h2 → h3 → p)

**DON'T:**
- Use inline styles (`style="..."`)
- Use presentational tags (`<b>`, `<i>`, `<u>`)
- Nest headings incorrectly (h2 → h4, skipping h3)
- Include CSS classes or IDs (handled by frontend)
- Use deprecated HTML tags

## Transformation Process

### Step 1: Analyze Original Content

**Identify:**
- Main topics and subtopics
- Key concepts and definitions
- Important examples and case studies
- Visual elements (diagrams, tables, code)
- Learning objectives (explicit or implicit)

### Step 2: Extract Core Concepts

**For each section:**
1. What is the essential idea?
2. What must the learner understand?
3. What examples best illustrate this?
4. What can be removed without losing meaning?

### Step 3: Restructure for Learning

**Organize content:**
1. **Introduction:** What will be learned and why it matters
2. **Core concepts:** Build from simple to complex
3. **Examples:** Practical applications
4. **Summary:** Key takeaways

### Step 4: Integrate Visual Elements

**Images:**
- Place images near relevant text
- Add descriptive captions
- Use images to clarify complex concepts
- Reference images in text: "As shown in Figure 1..."

**Code examples:**
- Keep code concise and focused
- Add comments to explain key lines
- Show complete, runnable examples when possible

## Example Transformations

### Example 1: Definition Section

**Original (verbose):**
```
Data engineering is a term that has gained significant popularity in recent years,
though there remains considerable confusion about what it actually means. The field
emerged from various disciplines including database administration, business intelligence,
and software engineering. After conducting extensive research, we found over 91,000
different definitions when searching for "what is data engineering?" Various experts
have proposed different perspectives...

[3 more paragraphs of similar background]

We define data engineering as the development, implementation, and maintenance of
systems and processes that take in raw data and produce high-quality, consistent
information that supports downstream use cases.
```

**Transformed (concise and pedagogical):**
```html
<h2>Qu'est-ce que le Data Engineering ?</h2>

<p>Le <strong>data engineering</strong> est le développement, l'implémentation et la
maintenance de systèmes qui transforment des données brutes en informations de qualité
pour l'analyse et le machine learning.</p>

<p>Un data engineer gère le cycle de vie des données :</p>
<ul>
  <li>Collecte des données depuis les sources</li>
  <li>Stockage et organisation</li>
  <li>Transformation et nettoyage</li>
  <li>Mise à disposition pour l'analyse</li>
</ul>

<p>C'est le pont entre les systèmes sources et les utilisations finales des données.</p>
```

### Example 2: Technical Explanation

**Original (detailed but dense):**
```
The Google File System paper, published in 2003, described a distributed file system
designed to provide efficient, reliable access to data using large clusters of
commodity hardware. Shortly thereafter, in 2004, Google published another seminal
paper describing MapReduce, which represented an ultra-scalable data-processing
paradigm. MapReduce allows programmers to process massive datasets in parallel
across distributed systems by breaking computation into map and reduce phases...

[2 more paragraphs with implementation details]
```

**Transformed (focused on concepts):**
```html
<h3>L'Émergence du Big Data</h3>

<p>En 2003-2004, Google publie deux innovations majeures :</p>

<ol>
  <li><strong>Google File System (GFS)</strong> : stockage distribué sur des milliers
  de machines ordinaires</li>
  <li><strong>MapReduce</strong> : traitement de données massives en parallèle</li>
</ol>

<blockquote>
  <p>Ces innovations permettent de traiter des pétaoctets de données avec du matériel
  standard, rendant le big data accessible à toutes les entreprises.</p>
</blockquote>

<p>En 2006, ces concepts inspirent la création d'<strong>Apache Hadoop</strong>,
la première plateforme big data open source.</p>

<figure>
  <img src="/static/images/fode_0102.png" alt="Evolution de l'intérêt pour le big data" />
  <figcaption>Figure 2 : L'intérêt pour le "big data" explose dans les années 2010</figcaption>
</figure>
```

### Example 3: Code Example

**Original:**
```
When working with data pipelines, you'll often need to write SQL queries. For example,
if you want to select user data, you might write something like this: SELECT * FROM users
WHERE created_at > '2023-01-01'. This query selects all columns from the users table
for users created after January 1st, 2023. You can also filter by other criteria...
```

**Transformed:**
```html
<h3>Requêtes SQL de Base</h3>

<p>Exemple de requête pour récupérer les utilisateurs récents :</p>

<pre><code class="language-sql">
-- Sélectionner les utilisateurs créés après le 1er janvier 2023
SELECT
  user_id,
  username,
  email,
  created_at
FROM users
WHERE created_at > '2023-01-01'
ORDER BY created_at DESC;
</code></pre>

<p>Cette requête filtre sur la date de création et trie les résultats du plus récent
au plus ancien.</p>
```

## Language: French Content

**All content should be in French:**
- Translate technical terms when a French equivalent exists
- Keep English terms when they're standard in the industry (e.g., "big data", "cloud")
- Use "vous" (formal) form for instructions
- Use clear, professional French

**Examples:**
- "data engineering" → "ingénierie des données" or "data engineering" (both acceptable)
- "storage" → "stockage"
- "pipeline" → "pipeline de données"
- "you will learn" → "vous apprendrez"

## Quality Checklist

Before finalizing content, verify:

- [ ] Length is 40-60% of original
- [ ] All key concepts are preserved
- [ ] Content flows logically
- [ ] Examples are clear and relevant
- [ ] Images have descriptive captions
- [ ] Code examples are complete and correct
- [ ] HTML structure is semantic and clean
- [ ] All content is in French
- [ ] Technical terms are accurate
- [ ] No inline styles or classes
