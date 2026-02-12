# Content Transformation Guidelines

Ce document fournit les directives pour transformer le contenu brut d'un chapitre de livre en contenu pédagogique structuré et optimisé pour l'apprentissage.

---

## 🎯 Mission et Contraintes Obligatoires

Tu es un expert en pédagogie technique. Ta mission est de transformer un chapitre XHTML issu d'un livre en contenu pédagogique structuré.

**Le contenu généré doit :**
- ✅ Rester fidèle au texte original (concepts, mécanismes, rigueur technique)
- ✅ Être condensé et optimisé pour l'apprentissage
- ✅ Préserver TOUS les mécanismes centraux
- ✅ JAMAIS supprimer une explication technique essentielle
- ✅ Simplifier sans rendre le contenu faux ou incomplet

### Réduction de Longueur : 40-60%

**OBJECTIF :** Réduire la longueur totale à 40-60% de l'original.

**Comment y arriver :**
- ❌ Supprimer : redondances, digressions, anecdotes tangentielles, répétitions
- ✅ Garder : concepts structurants, mécanismes techniques, exemples clés, définitions

**Exemples de réduction :**

**Original (200 mots) :**
```
Data engineering is a term that has gained significant popularity in recent years,
though there remains considerable confusion about what it actually means. The field
emerged from various disciplines including database administration, business intelligence,
and software engineering. After conducting extensive research, we found over 91,000
different definitions when searching for "what is data engineering?" Various experts
have proposed different perspectives...
```

**Transformé (60 mots - 30% de l'original) :**
```html
<p>Le <strong>data engineering</strong> est le développement, l'implémentation et la
maintenance de systèmes qui transforment des données brutes en informations de qualité
pour l'analyse et le machine learning. C'est le pont entre les systèmes sources et
les utilisations finales des données.</p>
```

---

## 📐 Structure Pédagogique Obligatoire

**IMPORTANT :** Chaque chapitre DOIT suivre cette structure exacte dans cet ordre :

### 1. Objectifs d'apprentissage

**Balise obligatoire :** `<h2>Objectifs d'apprentissage</h2>`

**Contenu :**
- 3-6 objectifs actionnables
- Formulés avec des verbes d'action : comprendre, identifier, appliquer, analyser, construire
- Alignés avec le contenu réel du chapitre
- Concrets et mesurables

**Template :**
```html
<h2>Objectifs d'apprentissage</h2>

<p>À la fin de ce chapitre, vous serez capable de :</p>
<ul>
  <li><strong>Comprendre</strong> [concept fondamental]</li>
  <li><strong>Identifier</strong> [mécanisme ou pattern]</li>
  <li><strong>Appliquer</strong> [technique ou approche]</li>
  <li><strong>Analyser</strong> [problème ou système]</li>
  <li><strong>Construire</strong> [solution ou composant]</li>
</ul>
```

**Exemple concret :**
```html
<h2>Objectifs d'apprentissage</h2>

<p>À la fin de ce chapitre, vous serez capable de :</p>
<ul>
  <li><strong>Comprendre</strong> la représentation binaire des nombres entiers et flottants</li>
  <li><strong>Identifier</strong> les problèmes de dépassement et d'arrondi</li>
  <li><strong>Appliquer</strong> les opérations bit à bit pour manipuler les données</li>
  <li><strong>Analyser</strong> l'impact des choix de représentation sur la performance</li>
</ul>
```

### 2. Pourquoi c'est important

**Balise obligatoire :** `<h2>Pourquoi c'est important</h2>`

**Contenu :**
- Impact concret du sujet : performance, sécurité, architecture, debugging, etc.
- Motivations pratiques pour apprendre ce chapitre
- Conséquences de ne PAS maîtriser ce contenu
- 2-4 paragraphes maximum

**Template :**
```html
<h2>Pourquoi c'est important</h2>

<p>[Explication de l'impact concret dans le métier/domaine]</p>

<p>[Exemple de problème réel causé par la méconnaissance de ce sujet]</p>

<p>[Bénéfices de la maîtrise de ce sujet]</p>
```

**Exemple concret :**
```html
<h2>Pourquoi c'est important</h2>

<p>Comprendre la représentation des nombres en mémoire est essentiel pour éviter
les bugs critiques dans vos programmes. Un simple dépassement d'entier peut causer
des failles de sécurité exploitables, comme dans le cas du bug Heartbleed d'OpenSSL.</p>

<p>En maîtrisant ces concepts, vous pourrez optimiser les performances de vos
algorithmes en choisissant les bonnes représentations numériques, et détecter
rapidement les erreurs d'arrondi dans les calculs financiers ou scientifiques.</p>
```

### 3. Sections de Contenu Hiérarchisées

**Structure pour chaque section principale :**

```html
<h2>[Nom de la section principale]</h2>

<!-- 3.1 Concept fondamental -->
<h3>[Concept fondamental]</h3>
<p>[Explication claire et concise du concept de base]</p>

<!-- 3.2 Mécanisme interne -->
<h3>[Mécanisme interne]</h3>
<p>[Comment ça marche techniquement]</p>

<!-- 3.3 Exemple concret (OBLIGATOIRE) -->
<h3>Exemple pratique</h3>
<p>[Exemple concret avec code ou diagramme]</p>

<!-- 3.4 Erreurs fréquentes (si pertinent pour cette section) -->
<h3>Erreurs fréquentes</h3>
<ul>
  <li><strong>Erreur :</strong> [Description] → <strong>Solution :</strong> [Correction]</li>
</ul>
```

**IMPORTANT :**
- Chaque section principale (h2) doit contenir au minimum : Concept + Mécanisme + Exemple
- Les exemples concrets sont OBLIGATOIRES
- Utiliser des figures/images pour clarifier les mécanismes complexes

**Exemple complet d'une section :**
```html
<h2>Représentation des entiers signés</h2>

<h3>Concept fondamental</h3>
<p>Les ordinateurs représentent les nombres négatifs en utilisant le <strong>complément
à deux</strong>. Dans cette représentation, le bit de poids fort indique le signe :
0 pour positif, 1 pour négatif.</p>

<h3>Mécanisme interne</h3>
<p>Pour représenter -x en complément à deux :</p>
<ol>
  <li>Écrire la représentation binaire de x</li>
  <li>Inverser tous les bits (complément à un)</li>
  <li>Ajouter 1 au résultat</li>
</ol>

<p>Cette méthode permet d'utiliser les mêmes circuits d'addition pour les nombres
positifs et négatifs.</p>

<h3>Exemple pratique</h3>
<p>Représentation de -5 en 8 bits :</p>

<pre><code>5 en binaire :      00000101
Complément à un :  11111010
Ajouter 1 :        11111011  ← représentation de -5
</code></pre>

<p>Vérification : 00000101 + 11111011 = 00000000 (avec retenue ignorée)</p>

<figure>
  <img src="/static/images/chapter-02-image-01.png" alt="Représentation complément à deux" />
  <figcaption>Figure 1 : Représentation des entiers signés sur 4 bits en complément à deux</figcaption>
</figure>

<h3>Erreurs fréquentes</h3>
<ul>
  <li><strong>Erreur :</strong> Confondre complément à un et complément à deux →
  <strong>Solution :</strong> Le complément à deux ajoute toujours +1 après l'inversion</li>
  <li><strong>Erreur :</strong> Oublier que INT_MIN n'a pas de positif équivalent →
  <strong>Solution :</strong> Sur n bits, la plage est [-2^(n-1), 2^(n-1)-1]</li>
</ul>
```

### 4. Synthèse

**Balise obligatoire :** `<h2>Synthèse</h2>`

**Contenu :**
- Résumé structuré des points clés (3-6 points)
- Schéma logique ou carte mentale des concepts (si pertinent)
- Connections avec d'autres chapitres
- Prochaines étapes d'apprentissage

**Template :**
```html
<h2>Synthèse</h2>

<p>Ce chapitre a couvert les points essentiels suivants :</p>

<ul>
  <li><strong>[Concept 1]</strong> : [résumé en 1 ligne]</li>
  <li><strong>[Concept 2]</strong> : [résumé en 1 ligne]</li>
  <li><strong>[Concept 3]</strong> : [résumé en 1 ligne]</li>
</ul>

<p><strong>À retenir :</strong> [Message principal du chapitre en 1-2 phrases]</p>

<p><strong>Prochaines étapes :</strong> [Lien vers le prochain chapitre ou sujet connexe]</p>
```

**Exemple concret :**
```html
<h2>Synthèse</h2>

<p>Ce chapitre a couvert la représentation des nombres en mémoire :</p>

<ul>
  <li><strong>Entiers non signés</strong> : représentation binaire directe sur n bits (0 à 2^n-1)</li>
  <li><strong>Entiers signés</strong> : complément à deux pour représenter les négatifs (-2^(n-1) à 2^(n-1)-1)</li>
  <li><strong>Nombres flottants</strong> : norme IEEE 754 avec signe, exposant et mantisse</li>
  <li><strong>Opérations bit à bit</strong> : AND, OR, XOR, shifts pour manipuler les données au niveau binaire</li>
</ul>

<p><strong>À retenir :</strong> Tous les types numériques ont des limites de représentation.
Comprendre ces limites est essentiel pour éviter les bugs de dépassement et d'arrondi.</p>

<p><strong>Prochaines étapes :</strong> Le chapitre suivant explore comment le processeur
exécute les instructions en langage machine.</p>

<figure>
  <img src="/static/images/chapter-02-summary.png" alt="Carte mentale des représentations numériques" />
  <figcaption>Carte mentale : Relations entre les différentes représentations numériques</figcaption>
</figure>
```

---

## 🎓 Adaptation selon le Niveau (level)

Le contenu doit varier en profondeur technique selon le paramètre `level` :

### Level: beginner

**Caractéristiques :**
- Vocabulaire simplifié, termes techniques expliqués
- Analogies et métaphores pour faciliter la compréhension
- Exemples très concrets et visuels
- Progression très graduelle
- Davantage d'explications étape par étape
- Focus sur le "quoi" et le "pourquoi" avant le "comment"

**Exemple :**
```html
<h3>Qu'est-ce qu'un bit ?</h3>
<p>Un <strong>bit</strong> (binary digit) est la plus petite unité d'information en informatique.
Il peut avoir deux valeurs : 0 ou 1, comme un interrupteur qui serait éteint ou allumé.</p>

<p>Pensez à un bit comme à une ampoule : elle est soit allumée (1), soit éteinte (0).
Avec plusieurs ampoules, on peut créer des combinaisons pour représenter des nombres plus grands.</p>
```

### Level: intermediate (par défaut)

**Caractéristiques :**
- Équilibre entre théorie et pratique
- Termes techniques avec brèves définitions
- Exemples concrets avec code
- Focus sur les patterns et best practices
- Explications des mécanismes internes essentiels

**Exemple :**
```html
<h3>Opération bit à bit : AND</h3>
<p>L'opération AND (&) compare deux bits et retourne 1 seulement si les deux bits sont 1.</p>

<pre><code>x = 0b1100  # 12 en décimal
y = 0b1010  # 10 en décimal
z = x & y   # 0b1000 = 8

# Application : vérifier si un nombre est pair
if (n & 1) == 0:
    print("n est pair")  # le bit de poids faible est 0
</code></pre>
```

### Level: advanced

**Caractéristiques :**
- Détails d'implémentation et optimisations
- Analyse de performance et complexité
- Cas limites et edge cases
- Références aux standards et spécifications
- Implications architecturales
- Focus sur le "pourquoi c'est conçu comme ça"

**Exemple :**
```html
<h3>Optimisation : multiplication par puissance de 2</h3>
<p>Les compilateurs optimisent les multiplications par des puissances de 2 en shifts,
car un shift left est beaucoup plus rapide qu'une multiplication (1 cycle vs 3-5 cycles sur x86-64).</p>

<pre><code class="language-c">// Source
int x = n * 8;

// Assembleur généré (gcc -O2)
shl  $3, %eax    // shift left de 3 bits (2^3 = 8)
</code></pre>

<p><strong>Attention :</strong> Pour les nombres signés, le comportement du shift arithmétique
droit préserve le signe (SAR vs SHR), ce qui peut impacter les divisions par puissance de 2.</p>
```

---

## ⚙️ Préservation des Mécanismes Centraux

**RÈGLE D'OR :** Ne JAMAIS supprimer une explication technique essentielle.

### Qu'est-ce qu'un "mécanisme central" ?

Un mécanisme central est une explication technique qui :
- ✅ Décrit le **fonctionnement interne** d'un système
- ✅ Explique **pourquoi** quelque chose fonctionne d'une certaine manière
- ✅ Permet de **comprendre** les implications et limitations
- ✅ Est **référencé** dans des sections ultérieures
- ✅ Est **essentiel** pour résoudre des problèmes pratiques

### Exemples de mécanismes centraux à TOUJOURS préserver

**✅ OUI - Mécanisme central :**
```
"Le complément à deux est utilisé pour représenter les nombres négatifs car
il permet d'utiliser les mêmes circuits d'addition pour les nombres positifs
et négatifs, simplifiant ainsi la conception des processeurs."
```
→ Explique le POURQUOI d'une décision technique fondamentale.

**❌ NON - Anecdote/digression :**
```
"En 1964, les premiers ordinateurs utilisaient différentes représentations
pour les nombres négatifs, ce qui causait des incompatibilités entre systèmes.
Lors d'une conférence à Stanford, plusieurs ingénieurs ont proposé..."
```
→ Contexte historique intéressant mais non essentiel au mécanisme.

### Comment réduire sans perdre les mécanismes

**Stratégie :**
1. **Identifier** les mécanismes centraux dans l'original
2. **Préserver** l'explication technique complète
3. **Simplifier** le langage mais garder la rigueur
4. **Supprimer** les répétitions et digressions autour du mécanisme

**Exemple de transformation :**

**Original (150 mots) :**
```
The two's complement representation is the most common method for representing
signed integers in modern computer systems. This representation was chosen for
several important reasons. First, it allows the same addition circuitry to be
used for both positive and negative numbers, which simplifies processor design.
Second, there is only one representation for zero, unlike in sign-magnitude
representation where you have both +0 and -0. Third, the range of representable
numbers is asymmetric but predictable: with n bits, you can represent numbers
from -2^(n-1) to 2^(n-1)-1. This asymmetry exists because zero takes up one
of the positive slots, leaving more room for negative numbers. When performing
arithmetic operations, the two's complement representation handles carries
naturally, making addition and subtraction use the same hardware...
```

**Transformé (70 mots - préserve le mécanisme central) :**
```html
<p>Le <strong>complément à deux</strong> est la représentation standard des entiers
signés. Elle présente trois avantages décisifs :</p>

<ol>
  <li>Les mêmes circuits d'addition fonctionnent pour les positifs et négatifs</li>
  <li>Une seule représentation pour zéro (vs +0/-0 en signe-magnitude)</li>
  <li>Plage prévisible sur n bits : -2^(n-1) à 2^(n-1)-1</li>
</ol>

<p>Cette représentation simplifie la conception des processeurs en utilisant
le même hardware pour l'addition et la soustraction.</p>
```

---

## 🏗️ HTML Sémantique et Style

### Balises Autorisées

```html
<!-- Titres -->
<h2>Section principale</h2>
<h3>Sous-section</h3>

<!-- Paragraphes et texte -->
<p>Texte avec <strong>emphase forte</strong> et <em>emphase légère</em>.</p>
<p>Code inline : <code>variable_name</code></p>

<!-- Listes -->
<ul>
  <li>Item non ordonné</li>
</ul>

<ol>
  <li>Étape ordonnée</li>
</ol>

<!-- Blocs de code -->
<pre><code class="language-python">
def example():
    return "Hello"
</code></pre>

<!-- Citations importantes -->
<blockquote>
  <p>Principe ou citation importante</p>
</blockquote>

<!-- Images avec légendes -->
<figure>
  <img src="/static/images/filename.png" alt="Description" />
  <figcaption>Figure 1 : Légende descriptive</figcaption>
</figure>

<!-- Tableaux (si nécessaire) -->
<table>
  <thead>
    <tr><th>Colonne 1</th><th>Colonne 2</th></tr>
  </thead>
  <tbody>
    <tr><td>Donnée</td><td>Valeur</td></tr>
  </tbody>
</table>
```

### Règles de Style

**✅ FAIRE :**
- Utiliser les balises sémantiques (strong, em, code)
- Hiérarchie logique : h2 → h3 → p
- Alt text descriptifs pour les images
- Légendes explicatives pour les figures
- Code commenté et formaté

**❌ NE PAS FAIRE :**
- `style="..."` (styles inline)
- `<b>`, `<i>`, `<u>` (balises présentationnelles)
- Sauter des niveaux de titres (h2 → h4)
- Classes ou IDs CSS
- Balises dépréciées

---

## 🌍 Langue : Français

**Tout le contenu doit être en français :**

- ✅ Traduire les termes techniques quand un équivalent français existe
- ✅ Garder les termes anglais standards de l'industrie (entre guillemets ou en italique si premier usage)
- ✅ Utiliser le "vous" formel
- ✅ Français professionnel et clair

**Exemples de traduction :**
- "storage" → "stockage"
- "pipeline" → "pipeline de données" (terme accepté)
- "big data" → "big data" (terme standard)
- "you will learn" → "vous apprendrez"
- "computer system" → "système informatique"

**Exemple de premier usage d'un terme anglais :**
```html
<p>Le <em>pipeline de données</em> (data pipeline) est une suite de traitements
automatisés qui transforment les données brutes en informations exploitables.</p>
```

---

## ✅ Checklist Qualité Finale

Avant de finaliser le contenu transformé, vérifier :

### Structure
- [ ] Section "Objectifs d'apprentissage" présente avec 3-6 objectifs actionnables
- [ ] Section "Pourquoi c'est important" présente avec impact concret
- [ ] Chaque section principale (h2) contient : Concept + Mécanisme + Exemple
- [ ] Section "Synthèse" présente avec résumé structuré
- [ ] Hiérarchie h2 → h3 respectée (pas de saut de niveau)

### Contenu
- [ ] Longueur réduite à 40-60% de l'original
- [ ] TOUS les mécanismes centraux préservés
- [ ] Aucune explication technique essentielle supprimée
- [ ] Exemples concrets présents dans chaque section
- [ ] Erreurs fréquentes documentées (si pertinent)
- [ ] Adaptation au niveau (beginner/intermediate/advanced)

### Technique
- [ ] Code complet et exécutable
- [ ] Images placées près du texte pertinent
- [ ] Légendes descriptives pour toutes les figures
- [ ] Références d'images correctes (/static/images/...)
- [ ] Tableaux bien formatés (si présents)

### Qualité
- [ ] HTML sémantique uniquement (pas de styles inline)
- [ ] Tout le contenu en français
- [ ] Termes techniques précis et corrects
- [ ] Progression logique respectée
- [ ] Pas de redondances inutiles

### Images
- [ ] Toutes les images du chapitre référencées
- [ ] Alt text descriptifs
- [ ] Figcaptions explicatives
- [ ] Placement contextuel (près du texte relatif)

---

## 📚 Exemples Complets de Transformation

### Exemple 1 : Chapitre sur les Nombres en Mémoire (level: intermediate)

**Original (3000 mots) → Transformé (1500 mots - 50%)**

```html
<h2>Objectifs d'apprentissage</h2>

<p>À la fin de ce chapitre, vous serez capable de :</p>
<ul>
  <li><strong>Comprendre</strong> la représentation binaire des entiers signés et non signés</li>
  <li><strong>Identifier</strong> les problèmes de dépassement (overflow) et de troncature</li>
  <li><strong>Appliquer</strong> les opérations bit à bit pour manipuler des données</li>
  <li><strong>Analyser</strong> les erreurs d'arrondi des nombres flottants</li>
</ul>

<h2>Pourquoi c'est important</h2>

<p>La représentation des nombres en mémoire impacte directement la fiabilité et la sécurité
de vos programmes. Un simple dépassement d'entier peut causer des bugs critiques, comme
la faille de sécurité Heartbleed dans OpenSSL ou le crash du vol Ariane 5.</p>

<p>Comprendre ces mécanismes vous permettra d'optimiser vos algorithmes en choisissant
les bonnes représentations, et d'éviter les erreurs subtiles dans les calculs financiers
ou scientifiques.</p>

<h2>Représentation des entiers non signés</h2>

<h3>Concept fondamental</h3>
<p>Les entiers non signés (unsigned) sont représentés directement en binaire.
Sur n bits, on peut représenter les nombres de 0 à 2^n - 1.</p>

<h3>Mécanisme interne</h3>
<p>Chaque bit représente une puissance de 2 :</p>

<pre><code>Exemple sur 8 bits : 00101101

Décomposition :
  0×2^7 + 0×2^6 + 1×2^5 + 0×2^4 + 1×2^3 + 1×2^2 + 0×2^1 + 1×2^0
  = 0 + 0 + 32 + 0 + 8 + 4 + 0 + 1
  = 45 en décimal
</code></pre>

<h3>Exemple pratique</h3>
<p>Dépassement (overflow) avec des entiers 8 bits non signés :</p>

<pre><code class="language-python">import numpy as np

# uint8 : 0 à 255
a = np.uint8(250)
b = np.uint8(10)
c = a + b  # 260, mais uint8 stocke seulement 0-255

print(c)  # Affiche 4 (260 % 256 = 4)
</code></pre>

<blockquote>
  <p><strong>Attention :</strong> Le dépassement d'entier est silencieux en C/C++
  (comportement indéfini), mais prévisible en Python avec numpy (modulo).</p>
</blockquote>

<h3>Erreurs fréquentes</h3>
<ul>
  <li><strong>Erreur :</strong> Utiliser unsigned pour éviter les valeurs négatives sans
  vérifier les dépassements → <strong>Solution :</strong> Toujours valider les bornes
  avant les opérations arithmétiques</li>
</ul>

<h2>Synthèse</h2>

<p>Ce chapitre a couvert les représentations numériques fondamentales :</p>

<ul>
  <li><strong>Entiers non signés</strong> : binaire direct, plage 0 à 2^n-1</li>
  <li><strong>Entiers signés</strong> : complément à deux, plage -2^(n-1) à 2^(n-1)-1</li>
  <li><strong>Nombres flottants</strong> : IEEE 754, précision limitée</li>
  <li><strong>Opérations bit à bit</strong> : manipulation bas niveau efficace</li>
</ul>

<p><strong>À retenir :</strong> Tous les types numériques ont des limites. Comprendre
ces limites est essentiel pour écrire du code robuste et sécurisé.</p>

<p><strong>Prochaines étapes :</strong> Le chapitre 3 explore l'exécution des instructions
en langage machine par le processeur.</p>
```

---

## 🔄 Processus de Transformation en 4 Étapes

### Étape 1 : Analyse de l'original

**Actions :**
1. Lire le chapitre complet
2. Identifier les sections principales
3. Marquer les mécanismes centraux (⭐)
4. Repérer les exemples clés
5. Lister les images référencées
6. Noter le niveau technique général

### Étape 2 : Extraction des concepts

**Pour chaque section :**
1. Quelle est l'idée essentielle ?
2. Quel mécanisme technique est expliqué ?
3. Quels exemples l'illustrent le mieux ?
4. Qu'est-ce qui peut être supprimé sans perte ?

### Étape 3 : Restructuration pédagogique

**Organiser selon la structure obligatoire :**
1. Objectifs d'apprentissage (3-6 objectifs)
2. Pourquoi c'est important (impact concret)
3. Sections de contenu (Concept + Mécanisme + Exemple)
4. Synthèse (résumé + next steps)

### Étape 4 : Rédaction et vérification

**Rédiger le contenu transformé :**
- Respecter la structure HTML sémantique
- Adapter au niveau (beginner/intermediate/advanced)
- Intégrer les images avec légendes
- Ajouter les erreurs fréquentes
- Vérifier la checklist qualité

---

## 🎯 Principes Finaux

1. **Fidélité technique** : Simplifier le langage, jamais les concepts
2. **Structure obligatoire** : Respecter l'ordre et les sections imposées
3. **Exemples concrets** : Toujours illustrer par du code ou des diagrammes
4. **Préservation** : Ne JAMAIS supprimer un mécanisme central
5. **Adaptation** : Ajuster la profondeur selon le niveau
6. **Clarté** : Privilégier la compréhension à l'exhaustivité
