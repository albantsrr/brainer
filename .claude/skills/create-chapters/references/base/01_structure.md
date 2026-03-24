# Structure Obligatoire d'un Chapitre

Chaque chapitre **DOIT** suivre cette structure dans cet ordre exact.

---

## 0. Introduction

**Pas de `<h2>` — juste des paragraphes.**

Rôle : accueillir le lecteur, contextualiser le sujet, créer de la curiosité avant toute explication technique.

**Contraintes :**
- 2-3 paragraphes maximum
- Ton narratif, engageant, accessible — pas encore technique
- Pas de listes, pas de code, pas de diagramme
- Ne pas anticiper les objectifs (ils arrivent juste après)

**Règle pour les chapitres 2 et suivants — pont introductif :**
Si ce n'est pas le premier chapitre du cours, ouvrir avec **1-2 phrases de pont** qui referment le chapitre précédent et ouvrent celui-ci. Le synopsis du chapitre précédent sert de base pour écrire ce pont.

- Format : *"Au chapitre précédent, [concept X] a posé [fondation Y]. Ce chapitre descend maintenant dans le détail de [focus du chapitre]."*
- Ne **jamais** ré-expliquer le concept référencé — le nommer suffit
- Ce pont remplace l'accroche générique : 1 phrase de continuité vaut mieux qu'une accroche déconnectée

```html
<p>[Accroche : situation concrète, analogie ou question rhétorique]</p>

<p>[Contexte : lien avec le domaine global, annonce des grands thèmes sans détailler]</p>

<p>[Transition : ce que le lecteur va acquérir dans ce chapitre]</p>
```

Pour un chapitre 2+ :
```html
<p>Au chapitre précédent, [concept clé du chapitre précédent] a établi [ce que ça permet].
Ce chapitre approfondit [focus : ce qu'on va voir maintenant].</p>

<p>[Contexte et enjeu du chapitre en cours]</p>

<p>[Ce que le lecteur va acquérir dans ce chapitre]</p>
```

**Exemple :**
```html
<p>Quand vous tapez "A" sur votre clavier, comment l'ordinateur le stocke-t-il ?
Pas comme un dessin — mais comme un nombre, exprimé en zéros et uns.</p>

<p>Ce chapitre explore comment les ordinateurs représentent les données en mémoire :
des entiers aux flottants, en passant par les opérations bit à bit. C'est un socle
indispensable pour comprendre les bugs de dépassement et les erreurs d'arrondi.</p>

<p>À l'issue de ce chapitre, vous saurez lire une représentation binaire et identifier
les pièges liés aux limites des types numériques.</p>
```

---

## 1. Objectifs d'apprentissage

```html
<h2>Objectifs d'apprentissage</h2>

<p>À la fin de ce chapitre, vous serez capable de :</p>
<ul>
  <li><strong>Comprendre</strong> [concept fondamental]</li>
  <li><strong>Identifier</strong> [mécanisme ou pattern]</li>
  <li><strong>Appliquer</strong> [technique ou approche]</li>
  <li><strong>Analyser</strong> [problème ou système]</li>
</ul>
```

- 3-6 objectifs actionnables
- Verbes d'action : comprendre, identifier, appliquer, analyser, construire
- Alignés avec le contenu réel du chapitre (pas génériques)

---

## 2. Pourquoi c'est important

```html
<h2>Pourquoi c'est important</h2>

<p>[Impact concret dans le métier/domaine]</p>

<p>[Exemple de problème réel causé par la méconnaissance de ce sujet]</p>

<p>[Bénéfices de la maîtrise]</p>
```

- 2-4 paragraphes
- Impact concret : performance, sécurité, architecture, debugging
- Conséquences de ne PAS maîtriser ce contenu

---

## 3. Sections de Contenu

Pour chaque section principale :

```html
<h2>[Nom de la section]</h2>

<h3>Concept fondamental</h3>
<p>[Explication claire et concise]</p>

<h3>Mécanisme interne</h3>
<!-- RÈGLE : pas de liste de faits — chaque étape explique la CAUSE du passage à l'étape suivante.
     Commencer par une analogie courte, puis dérouler les étapes avec causalité, conclure par une implication.
     Connecteurs obligatoires : "parce que", "c'est pourquoi", "d'où le fait que", "ce qui implique que" -->
<p>[Analogie du quotidien qui capture la structure du mécanisme — 1 phrase]</p>
<ol>
  <li>[Étape 1 : ce qui se passe + pourquoi cela se passe ainsi]</li>
  <li>[Étape 2 : ce qui résulte de l'étape 1, et pourquoi]</li>
  <li>[Étape 3 si nécessaire]</li>
</ol>
<p>[Implication clé : "C'est pourquoi…" ou "D'où le fait que…" — lien mécanisme → conséquence pratique]</p>

<h3>Exemple pratique</h3>
<!-- RÈGLE : arc narratif en 3 temps — situation → friction → résolution + bridge technique.
     Phase 1 (OBLIGATOIRE) : cas minimal, contexte universel, zéro jargon.
     Phase 2 (recommandé) : montée en réalisme ou contraste sans/avec.
     Phase 3 (OBLIGATOIRE) : bridge vers le domaine technique du cours. -->
<p>[Situation de départ — contexte universel, 1-2 phrases]</p>
<pre><code>[Exemple minimal — cas de base, zéro exception]</code></pre>
<p>En pratique, [application dans le domaine technique du cours] — [conséquence concrète].</p>

<!-- RÈGLE EXEMPLES : le contexte doit être déjà connu du lecteur.
     ❌ INTERDIT : protocoles, capteurs, IoT, domotique, bases de données — jargon non acquis
     ✅ AUTORISÉ : lampe allumée/éteinte, pile ou face, commander au restaurant, jeu de cartes
     Le domaine technique peut apparaître EN CONCLUSION (application concrète), jamais en point de départ.
     Voir 00_principes.md → "Qualité des Exemples Pédagogiques" -->

<h3>Erreurs fréquentes</h3>  <!-- si pertinent -->
<ul>
  <li><strong>Erreur :</strong> [Description] → <strong>Solution :</strong> [Correction]</li>
</ul>
```

**Règles :**
- Chaque section `<h2>` DOIT avoir au minimum : Concept + Mécanisme + Exemple
- Les exemples concrets sont **obligatoires** (code de préférence)
- Utiliser Mermaid seulement si la relation est impossible à exprimer clairement en texte (voir `02_diagrammes.md`)

**Exemple complet (avec les nouveaux patterns de profondeur) :**
```html
<h2>Représentation des entiers signés</h2>

<h3>Concept fondamental</h3>
<p>Imaginez une horloge à 16 positions : avancer de 3 heures ou reculer de 13 heures arrivent exactement au même endroit. Le <strong>complément à deux</strong> applique cette logique au binaire — les nombres négatifs sont représentés comme de "grands positifs" qui, additionnés, dépassent la capacité du registre et donnent le bon résultat.</p>
<p>Concrètement, le bit de poids fort joue le rôle du signe : 0 indique un positif, 1 un négatif.</p>

<h3>Mécanisme interne</h3>
<p>Comme une horloge où reculer de 1 heure équivaut à avancer de 11, le complément à deux encode -x comme un grand positif qui "fait le tour" du registre.</p>
<ol>
  <li>Écrire x en binaire — parce que c'est la base de départ naturelle.</li>
  <li>Inverser tous les bits — parce que cela donne le complément à un, une valeur qui, additionnée à x, donne uniquement des 1 (le maximum du registre).</li>
  <li>Ajouter 1 — parce qu'on veut que x + (-x) = 0, pas 11111111. Cet ajout décale le résultat d'un cran pour obtenir le dépassement exact.</li>
</ol>
<p>C'est pourquoi les processeurs n'ont besoin que d'un seul circuit d'addition pour les positifs et les négatifs — le complément à deux garantit que l'addition fonctionne de façon identique dans les deux cas.</p>

<h3>Exemple pratique</h3>
<p>Calculons la représentation de -5 sur 8 bits :</p>
<pre><code>5 en binaire :      00000101
Complément à un :  11111010   ← tous les bits inversés
Ajouter 1 :        11111011   ← représentation de -5

Vérification : 00000101 + 11111011 = 100000000
                                      ↑ retenue ignorée → résultat = 00000000 = 0 ✓
</code></pre>
<p>En pratique, c'est pourquoi <code>int</code> sur 32 bits va de -2 147 483 648 à +2 147 483 647 — et non de façon symétrique : le zéro "consomme" une place du côté positif.</p>

<h3>Erreurs fréquentes</h3>
<ul>
  <li><strong>Erreur :</strong> Confondre complément à un et complément à deux →
  <strong>Solution :</strong> Le complément à deux ajoute toujours +1 après l'inversion</li>
  <li><strong>Erreur :</strong> Oublier que INT_MIN n'a pas d'équivalent positif →
  <strong>Solution :</strong> Plage sur n bits : [-2<sup>n-1</sup>, 2<sup>n-1</sup>-1]</li>
</ul>
```

**Exemple de la règle des exemples pédagogiques :**

Pour expliquer "2 bits permettent de représenter 4 valeurs" :

```html
<!-- ❌ MAUVAIS : contexte technique, le lecteur doit comprendre "domotique" et "capteur" -->
<h3>Exemple pratique</h3>
<p>Un système domotique identifie chaque capteur par un numéro binaire.
Avec 2 bits, on peut adresser 4 capteurs distincts.</p>

<!-- ✅ BON : contexte universel, zéro jargon préalable -->
<h3>Exemple pratique</h3>
<p>Imaginez que vous choisissez votre petit-déjeuner en répondant à 2 questions :
"Avec du lait ?" (oui/non) et "Avec du sucre ?" (oui/non). Ces 2 choix binaires
donnent exactement 4 combinaisons possibles — c'est précisément ce que représentent
2 bits en mémoire.</p>
<pre><code>oui / oui  → 11 → 3
oui / non  → 10 → 2
non / oui  → 01 → 1
non / non  → 00 → 0
</code></pre>
<p>En pratique, un octet (8 bits) permet de la même façon de représenter
2⁸ = 256 valeurs distinctes — ce qui suffit à encoder toutes les lettres
de l'alphabet avec de la marge.</p>
```

La mention "octet" et "alphabet" en conclusion est acceptable : elle arrive
*après* que le concept soit compris, pas comme prérequis pour le comprendre.

---

## 3.5. Éléments d'engagement (optionnels)

Ces éléments sont intégrés dans les sections de contenu (pas dans des sections séparées). Ils enrichissent l'expérience d'apprentissage sans alourdir la structure.

### Micro-défi (1-2 par chapitre)

Un micro-défi est une **pause active** qui engage le lecteur avant de lui donner la réponse. Il est placé juste avant une explication clé — idéalement avant le moment eureka du chapitre.

```html
<aside class="micro-challenge">
  <p><strong>À vous :</strong> Avant de lire la suite, essayez de deviner
  ce qui se passe quand on additionne 01111111 + 00000001 sur 8 bits non signés.
  Quel résultat obtient-on ?</p>
</aside>
```

**Règles :**
- **1-2 par chapitre maximum** — chaque micro-défi doit être significatif
- La réponse doit venir **immédiatement après** dans le texte
- La question doit être résoluble avec les connaissances acquises dans le chapitre
- Ton invitant, pas évaluatif : "À vous", "Essayez de deviner", "Pause : que se passerait-il si..."
- Ce n'est PAS un exercice (pas de notation, pas en base de données)

### Anecdote (0-1 par chapitre)

Une anecdote est un **ancrage émotionnel** : un bug célèbre, un incident réel, une découverte historique directement liée au concept enseigné. Elle rend le concept mémorable en montrant ses conséquences dans le monde réel.

```html
<aside class="story">
  <p><strong>En 1996,</strong> la fusée Ariane 5 a explosé 37 secondes après le décollage.
  La cause : un dépassement d'entier. Le système de navigation réutilisait du code
  d'Ariane 4, mais les valeurs de trajectoire d'Ariane 5, plus grande, dépassaient
  la capacité d'un entier 16 bits signé. Coût : 370 millions de dollars.</p>
</aside>
```

**Règles :**
- **0-1 par chapitre maximum** — l'anecdote doit être percutante, pas décorative
- Directement liée au concept enseigné (pas une digression)
- Courte : 2-4 phrases maximum
- Factuelle et vérifiable (pas d'approximation)
- Placée dans la section où le concept est enseigné (pas en introduction ni en synthèse)

---

## 3.6. Avant la synthèse (rappel actif)

Juste avant la `<h2>Synthèse</h2>`, ajouter un bref point de vérification qui invite le lecteur à rappeler activement les idées clés avant de les relire.

**Format :**
```html
<h2>Avant la synthèse</h2>
<p>Prenez 30 secondes pour répondre mentalement à ces questions — les réponses sont dans la synthèse ci-dessous :</p>
<ul>
  <li>[Question sur l'idée directrice centrale du chapitre]</li>
  <li>[Question sur la distinction ou l'erreur principale]</li>
</ul>
```

**Règles :**
- 2 questions maximum — uniquement sur les idées directrices, jamais sur les détails
- Chaque question doit trouver sa réponse dans la synthèse qui suit immédiatement (auto-correction)
- Formuler comme de vraies questions ouvertes courtes, pas des QCM
- Cette section est **obligatoire** pour tous les chapitres

**Exemple :**
```html
<h2>Avant la synthèse</h2>
<p>Prenez 30 secondes pour répondre mentalement à ces questions — les réponses sont dans la synthèse ci-dessous :</p>
<ul>
  <li>Quelles sont les cinq étapes du cycle de vie des données, dans l'ordre ?</li>
  <li>Pourquoi adopter le streaming par défaut est-il souvent une erreur ?</li>
</ul>
```

---

## 4. Synthèse

```html
<h2>Synthèse</h2>

<p>Ce chapitre a couvert les points essentiels suivants :</p>

<ul>
  <li><strong>[Concept 1]</strong> : [résumé en 1 ligne]</li>
  <li><strong>[Concept 2]</strong> : [résumé en 1 ligne]</li>
  <li><strong>[Concept 3]</strong> : [résumé en 1 ligne]</li>
</ul>

<p><strong>À retenir :</strong> [Message principal en 1-2 phrases]</p>

<p><strong>Prochaines étapes :</strong> [Lien avec le chapitre suivant ou sujet connexe]</p>
```

- 3-6 points clés
- Diagramme Mermaid optionnel si utile pour synthétiser les relations (voir `02_diagrammes.md`)
- Connections avec d'autres chapitres si pertinent

---

## Règles HTML Sémantique

**✅ Faire :**
- Hiérarchie logique : h2 → h3 → p
- TOUJOURS `<ul>`/`<ol>` pour les listes (le CSS gère le style des puces)
- `<strong>` et `<em>` pour l'emphase
- Vrai code exécutable : `<pre><code class="language-python">` (ou `-c`, `-bash`, `-javascript`...)
- Texte préformaté non-code (séquences, tables ASCII, exemples de valeurs) : `<pre><code>` **sans classe**
- Diagrammes Mermaid : `<pre><code class="language-mermaid">`

**❌ Ne pas faire :**
- `style="..."` (styles inline) — **jamais, même pour du code**
- `<div style="...">` pour encadrer du code — uniquement `<pre><code>` pur
- `class="language-text"` — interdit. C'est un fallback de syntax highlighter, pas une classe valide ici
- Toute autre classe CSS arbitraire (IDs, classes de mise en forme)
- `<b>`, `<i>`, `<u>` (balises présentationnelles)
- Sauter des niveaux de titres (h2 → h4)
- Convertir des listes en paragraphes avec tirets manuels (—)