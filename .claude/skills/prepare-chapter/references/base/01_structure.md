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

## 0.5. Mots-clés (optionnel)

**Recommandé pour les chapitres formels et mathématiques. Optionnel pour les chapitres procéduraux ou outillés.**

Rôle : donner au lecteur les termes importants du chapitre avant d'entrer dans le contenu. Ce n'est pas un résumé — c'est un **amorçage du vocabulaire** : le lecteur croise les mots une première fois, ce qui facilite leur ancrage lors de la lecture.

**Contraintes :**
- 2-5 termes maximum — uniquement les mots vraiment nouveaux de CE chapitre
- Définitions en langage naturel (pas de notation formelle à ce stade)
- Ne pas anticiper les explications des sections de contenu : les définitions ici sont courtes et intuitives, les sections approfondissent
- Seulement les termes de CE chapitre, pas les prérequis des chapitres précédents

```html
<h2>Mots-clés</h2>
<dl>
  <dt><strong>Terme 1</strong></dt>
  <dd>Définition courte en 1-2 phrases, sans jargon non encore introduit.</dd>
  <dt><strong>Terme 2</strong></dt>
  <dd>...</dd>
</dl>
```

**Exemple :**
```html
<h2>Mots-clés</h2>
<dl>
  <dt><strong>Vecteur</strong></dt>
  <dd>Un objet mathématique défini par une liste ordonnée de nombres (ses composantes). Contrairement à un point, un vecteur représente un déplacement, pas une position.</dd>
  <dt><strong>Scalaire</strong></dt>
  <dd>Un simple nombre réel, utilisé pour étirer ou rétrécir un vecteur par multiplication.</dd>
  <dt><strong>Combinaison linéaire</strong></dt>
  <dd>L'opération qui consiste à multiplier des vecteurs par des scalaires puis à les additionner. C'est l'opération fondamentale de l'algèbre linéaire.</dd>
</dl>
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

## 3. Sections de Contenu : structure adaptative par type

Chaque section `<h2>` adopte la structure la mieux adaptée à ce qu'elle enseigne. Le rédacteur identifie le **type** de chaque section parmi les 5 ci-dessous, puis applique le template correspondant.

**Règle commune à tous les types :**
- `<h3>En pratique</h3>` est **obligatoire** dans chaque section (sauf Distinction, qui a "Le test décisif")
- Les exemples concrets sont obligatoires et suivent les règles de `00_principes.md` (contexte universel, arc narratif, rampe de difficulté)
- Utiliser Mermaid seulement si la relation est impossible à exprimer clairement en texte (voir `03_diagrammes.md`)

<!-- RÈGLE EXEMPLES (rappel — s'applique à tous les types) :
     Le contexte doit être déjà connu du lecteur.
     ❌ INTERDIT : protocoles, capteurs, IoT, domotique, bases de données — jargon non acquis
     ✅ AUTORISÉ : lampe allumée/éteinte, pile ou face, commander au restaurant, jeu de cartes
     Le domaine technique peut apparaître EN CONCLUSION (application concrète), jamais en point de départ.
     Voir 00_principes.md → "Qualité des Exemples Pédagogiques" -->

---

### Type 1 : Processus / Algorithme

**Quand l'utiliser :** il y a des **étapes internes** à dérouler, un "comment ça marche" séquentiel.
**Signaux de détection :** instructions ordonnées, pipeline, boucle, algorithme, encodage, transformation étape par étape.

```html
<h2>[Nom de la section]</h2>

<h3>Le principe</h3>
<p>[Ce que ça fait et pourquoi ça existe — 1-2 paragraphes]</p>

<h3>Comment ça fonctionne</h3>
<!-- RÈGLE : chaque étape explique la CAUSE du passage à l'étape suivante.
     Commencer par une analogie courte (optionnelle), puis dérouler les étapes avec causalité.
     Connecteurs obligatoires : "parce que", "c'est pourquoi", "d'où le fait que" -->
<p>[Analogie optionnelle — 1 phrase]</p>
<ol>
  <li>[Étape 1 : ce qui se passe + pourquoi]</li>
  <li>[Étape 2 : ce qui résulte de l'étape 1, et pourquoi]</li>
  <li>[Étape 3 si nécessaire]</li>
</ol>
<p>[Implication clé : "C'est pourquoi…" — lien mécanisme → conséquence pratique]</p>

<h3>En pratique</h3>
<p>[Situation de départ — contexte universel]</p>
<pre><code>[Déroulé concret du processus sur un cas simple]</code></pre>
<p>[Bridge vers le domaine technique du cours]</p>

<h3>Erreurs fréquentes</h3>  <!-- si pertinent -->
<ul>
  <li><strong>Erreur :</strong> [Description] → <strong>Solution :</strong> [Correction]</li>
</ul>
```

**Exemple complet (type Processus) :**
```html
<h2>Représentation des entiers signés</h2>

<h3>Le principe</h3>
<p>Imaginez une horloge à 16 positions : avancer de 3 heures ou reculer de 13 heures arrivent exactement au même endroit. Le <strong>complément à deux</strong> applique cette logique au binaire : les nombres négatifs sont représentés comme de "grands positifs" qui, additionnés, dépassent la capacité du registre et donnent le bon résultat.</p>
<p>Concrètement, le bit de poids fort joue le rôle du signe : 0 indique un positif, 1 un négatif.</p>

<h3>Comment ça fonctionne</h3>
<p>Comme une horloge où reculer de 1 heure équivaut à avancer de 11, le complément à deux encode -x comme un grand positif qui "fait le tour" du registre.</p>
<ol>
  <li>Écrire x en binaire, parce que c'est la base de départ naturelle.</li>
  <li>Inverser tous les bits, parce que cela donne le complément à un, une valeur qui, additionnée à x, donne uniquement des 1 (le maximum du registre).</li>
  <li>Ajouter 1, parce qu'on veut que x + (-x) = 0, pas 11111111. Cet ajout décale le résultat d'un cran pour obtenir le dépassement exact.</li>
</ol>
<p>C'est pourquoi les processeurs n'ont besoin que d'un seul circuit d'addition pour les positifs et les négatifs.</p>

<h3>En pratique</h3>
<p>Calculons la représentation de -5 sur 8 bits :</p>
<pre><code>5 en binaire :      00000101
Complément à un :  11111010   ← tous les bits inversés
Ajouter 1 :        11111011   ← représentation de -5

Vérification : 00000101 + 11111011 = 100000000
                                      ↑ retenue ignorée → résultat = 00000000 = 0 ✓
</code></pre>
<p>En pratique, c'est pourquoi <code>int</code> sur 32 bits va de -2 147 483 648 à +2 147 483 647 : le zéro "consomme" une place du côté positif.</p>

<h3>Erreurs fréquentes</h3>
<ul>
  <li><strong>Erreur :</strong> Confondre complément à un et complément à deux →
  <strong>Solution :</strong> Le complément à deux ajoute toujours +1 après l'inversion</li>
  <li><strong>Erreur :</strong> Oublier que INT_MIN n'a pas d'équivalent positif →
  <strong>Solution :</strong> Plage sur n bits : [-2<sup>n-1</sup>, 2<sup>n-1</sup>-1]</li>
</ul>
```

---

### Type 2 : Définition / Objet formel

**Quand l'utiliser :** on pose un **concept, une structure ou un objet mathématique**. Il n'y a pas d'étapes internes, mais une définition à comprendre en profondeur.
**Signaux de détection :** "on appelle X...", définition formelle, notation, axiomes, espace/ensemble/structure, propriétés.

```html
<h2>[Nom de la section]</h2>

<h3>De quoi parle-t-on</h3>
<!-- RÈGLE : explication en langage naturel AVANT toute notation formelle.
     1-2 paragraphes qui posent le concept sans symboles, puis la définition formelle si nécessaire. -->
<p>[Explication en langage naturel : qu'est-ce que c'est, à quoi ça sert]</p>
<p>[Définition formelle ou notation, si nécessaire]</p>

<h3>L'intuition</h3>
<!-- RÈGLE : pas une reformulation du concept. Expliquer POURQUOI la définition
     est construite comme ça, ce qu'elle capture, ce qu'elle exclut.
     Connecteurs obligatoires : "parce que", "c'est pourquoi", "d'où le fait que" -->
<p>[Pourquoi cette définition a cette forme — causalité, pas description]</p>

<h3>En pratique</h3>
<p>[Exemple concret qui ancre la définition dans un cas simple]</p>
<pre><code>[Illustration sur un cas minimal]</code></pre>
<p>[Bridge vers le domaine technique]</p>
```

**Exemple complet (type Définition) :**
```html
<h2>Les axiomes de Kolmogorov : fonder la mesure d'incertitude</h2>

<h3>De quoi parle-t-on</h3>
<p>Une <strong>mesure de probabilité</strong> P est une fonction qui assigne un nombre réel à chaque événement. Mais pas n'importe quelle fonction : elle doit respecter trois contraintes, les <strong>axiomes de Kolmogorov</strong>.</p>
<pre><code>Axiome 1 : P(A) ≥ 0                pour tout événement A
Axiome 2 : P(Ω) = 1                la certitude totale vaut 1
Axiome 3 : Si A₁, A₂, ... sont disjoints :
           P(A₁ ∪ A₂ ∪ ...) = P(A₁) + P(A₂) + ...
</code></pre>

<h3>L'intuition</h3>
<p>Ces trois axiomes capturent exactement les propriétés d'une <em>proportion</em>, et c'est précisément ce qu'est une probabilité. Une proportion ne peut pas être négative, d'où l'Axiome 1. La proportion de "tout" vaut 1, d'où l'Axiome 2. Si deux catégories ne se chevauchent pas, leurs proportions s'additionnent, d'où l'Axiome 3.</p>
<p>C'est pourquoi des résultats non évidents en découlent naturellement : <span class="math-inline">P(A^c) = 1 - P(A)</span>, <span class="math-inline">P(\emptyset) = 0</span>, et la formule d'inclusion-exclusion.</p>

<h3>En pratique</h3>
<p>Avec un dé équilibré (P uniforme, chaque face vaut 1/6), calculons P(pair OU ≤ 3) :</p>
<pre><code>A = {2, 4, 6} → P(A) = 1/2
B = {1, 2, 3} → P(B) = 1/2
A ∩ B = {2}   → P(A ∩ B) = 1/6

P(A ∪ B) = 1/2 + 1/2 - 1/6 = 5/6
</code></pre>
<p>Vérification : A ∪ B = {1, 2, 3, 4, 6} contient 5 faces sur 6. Sans soustraire P(A ∩ B), la face 2 serait comptée deux fois.</p>
```

---

### Type 3 : Distinction / Piège conceptuel

**Quand l'utiliser :** deux notions sont **systématiquement confondues** et il faut les démêler. La tension pédagogique vient du contraste, pas d'une explication linéaire.
**Signaux de détection :** "à ne pas confondre avec", "contrairement à", deux termes proches (indépendant/disjoint, corrélation/causalité, biais/variance, précision/rappel).

```html
<h2>[Nom de la section]</h2>

<h3>La confusion courante</h3>
<!-- RÈGLE : commencer par l'erreur, pas par la bonne réponse.
     Expliquer pourquoi l'erreur est naturelle (pas stupide). -->
<p>[L'erreur que la plupart des gens font + pourquoi elle est intuitivement raisonnable]</p>

<h3>La différence réelle</h3>
<!-- RÈGLE : contraste clair, côte à côte. Tableau ou deux blocs en parallèle.
     Chaque côté doit avoir : définition + implication concrète. -->
<p>[Contraste structuré entre les deux notions]</p>

<h3>Le test décisif</h3>
<!-- Remplace "En pratique" pour ce type. Un exemple ou une question
     qui tranche immédiatement entre les deux notions. -->
<p>[Un cas concret où la distinction change le résultat]</p>
<pre><code>[Calcul ou raisonnement qui montre la différence en action]</code></pre>
```

**Exemple complet (type Distinction) :**
```html
<h2>Indépendance vs disjonction</h2>

<h3>La confusion courante</h3>
<p>Si deux événements "n'ont rien à voir", ils sont indépendants. Et s'ils ne peuvent pas se produire en même temps, ils sont aussi indépendants, non ? C'est l'intuition naturelle, et elle est fausse. La disjonction (A ∩ B = ∅) et l'indépendance (P(A ∩ B) = P(A) × P(B)) sont deux propriétés radicalement différentes.</p>

<h3>La différence réelle</h3>
<p><strong>Disjoints :</strong> A et B ne peuvent pas se produire simultanément. Savoir que A s'est produit <em>élimine</em> B. C'est une dépendance maximale.</p>
<p><strong>Indépendants :</strong> savoir que A s'est produit ne change rien à la probabilité de B. Aucune information transmise.</p>
<p>Des événements disjoints de probabilité non nulle sont donc <em>dépendants</em> : si A se produit, P(B|A) = 0, alors que P(B) > 0.</p>

<h3>Le test décisif</h3>
<p>Dé équilibré. A = {2, 4, 6} (pair), B = {1, 2, 3, 4} (≤ 4).</p>
<pre><code>P(A) × P(B) = 1/2 × 2/3 = 1/3
P(A ∩ B) = P({2, 4}) = 2/6 = 1/3   ✓ Indépendants

Maintenant C = {1, 3, 5} (impair) :
A ∩ C = ∅   → disjoints
P(A) × P(C) = 1/2 × 1/2 = 1/4 ≠ 0 = P(A ∩ C)   ✗ Dépendants
</code></pre>
<p>Des événements disjoints sont toujours dépendants (sauf si l'un a probabilité 0).</p>
```

---

### Type 4 : Théorème / Résultat

**Quand l'utiliser :** on énonce un **résultat puissant** (théorème, loi, formule) qu'il faut comprendre et savoir appliquer.
**Signaux de détection :** "théorème de...", "loi de...", formule centrale, résultat qu'on démontre ou justifie, conséquence fondamentale.

```html
<h2>[Nom de la section]</h2>

<h3>Ce que dit le théorème</h3>
<!-- RÈGLE : d'abord en langage naturel (1-2 phrases), puis la formule. -->
<p>[Énoncé en langage naturel : "si... alors..."]</p>
<div class="math-block">[Formule]</div>

<h3>Pourquoi c'est vrai</h3>
<!-- RÈGLE : pas une preuve formelle. Un argument de plausibilité qui donne
     l'intuition de "ah oui, c'est logique". Causalité obligatoire. -->
<p>[Argument intuitif ou preuve guidée — le "ah oui, c'est logique"]</p>

<h3>En pratique</h3>
<p>[Application concrète : situation → calcul → interprétation du résultat]</p>
<pre><code>[Calcul complet]</code></pre>
<p>[Ce que le résultat nous apprend concrètement]</p>
```

**Exemple complet (type Théorème) :**
```html
<h2>Le théorème de Bayes : mettre à jour nos croyances</h2>

<h3>Ce que dit le théorème</h3>
<p>Si on observe un résultat B, la probabilité d'une hypothèse A<sub>i</sub> se met à jour selon :</p>
<div class="math-block">P(A_i \mid B) = \frac{P(B \mid A_i) \cdot P(A_i)}{P(B)}</div>
<p>P(A<sub>i</sub>) est la croyance <strong>a priori</strong> (avant d'observer B), P(A<sub>i</sub>|B) est la croyance <strong>a posteriori</strong>.</p>

<h3>Pourquoi c'est vrai</h3>
<p>La formule fait trois choses. Elle part de la croyance initiale P(A<sub>i</sub>), ce qu'on savait avant. Elle la multiplie par P(B|A<sub>i</sub>), la vraisemblance : à quel point B est compatible avec A<sub>i</sub>. Elle normalise par P(B) pour que la somme des probabilités a posteriori reste 1.</p>
<p>C'est pourquoi une forte vraisemblance ne suffit pas : si P(A<sub>i</sub>) est très faible, le résultat a posteriori peut rester faible malgré tout.</p>

<h3>En pratique</h3>
<p>Un filtre anti-spam analyse un email contenant le mot "gratuit" :</p>
<pre><code>P(spam) = 0,7         P("gratuit"|spam) = 0,9
P(légitime) = 0,3     P("gratuit"|légitime) = 0,01

P("gratuit") = 0,9×0,7 + 0,01×0,3 = 0,633

P(spam|"gratuit") = (0,9 × 0,7) / 0,633 ≈ 0,995
</code></pre>
<p>Avec 99,5 % de probabilité a posteriori, le filtre classe l'email comme spam. La forte probabilité a priori du spam, combinée à la haute vraisemblance de "gratuit", domine le résultat.</p>
```

---

### Type 5 : Outil / Technique

**Quand l'utiliser :** on apprend à **utiliser** quelque chose pour résoudre un problème concret. L'accent est sur l'usage, pas sur la théorie.
**Signaux de détection :** "comment faire pour...", recette, paramètres à choisir, inputs/outputs, interprétation de résultats, méthode appliquée.

```html
<h2>[Nom de la section]</h2>

<h3>À quoi ça sert</h3>
<p>[Le problème concret que ça résout — cas d'usage typique]</p>

<h3>Comment s'en servir</h3>
<!-- RÈGLE : recette opérationnelle. Inputs → opération → output.
     Mentionner les choix à faire et leurs conséquences. -->
<p>[Recette : ce qu'on donne, ce qu'on fait, ce qu'on obtient]</p>

<h3>En pratique</h3>
<p>[Exemple complet : de la question posée au résultat interprété]</p>
<pre><code>[Calcul ou code]</code></pre>
<p>[Interprétation du résultat]</p>

<h3>Les pièges</h3>  <!-- si pertinent -->
<ul>
  <li><strong>Piège :</strong> [Description] → <strong>Solution :</strong> [Correction]</li>
</ul>
```

---

### Guide de détection automatique

Pour chaque section `<h2>` du chapitre, identifier le type en se posant cette question :

| Question | Si oui → Type |
|----------|---------------|
| Y a-t-il des **étapes séquentielles** à dérouler ? | **Processus** |
| Pose-t-on un **concept ou une structure formelle** ? | **Définition** |
| Démêle-t-on **deux notions confondues** ? | **Distinction** |
| Énonce-t-on un **résultat qu'on peut formuler comme "si... alors..."** ? | **Théorème** |
| Apprend-on à **utiliser une méthode** pour résoudre un problème ? | **Outil** |

**Règle de priorité :** si une section pourrait être deux types, choisir celui qui correspond à la tension pédagogique principale. Par exemple, "la probabilité conditionnelle" peut être une Définition (on pose P(A|B)) ou un Théorème (on énonce la formule). Si le chapitre met l'accent sur la compréhension de ce qu'est P(A|B), c'est une Définition. Si l'accent est sur l'application de la formule, c'est un Théorème.

**Variété obligatoire :** un chapitre dont toutes les sections utilisent le même type est un signal d'alerte. Vérifier que le type choisi est bien le plus adapté à chaque section.

---

### Règle commune : qualité des exemples

S'applique au `<h3>En pratique</h3>` (ou `<h3>Le test décisif</h3>` pour les Distinctions) de **tous les types** :

- Arc narratif en 3 temps : situation → friction → résolution + bridge technique
- Phase 1 (OBLIGATOIRE) : cas minimal, contexte universel, zéro jargon
- Phase 2 (recommandé) : montée en réalisme ou contraste sans/avec
- Phase 3 (OBLIGATOIRE) : bridge vers le domaine technique du cours

**Exemple de la règle des exemples pédagogiques :**

Pour expliquer "2 bits permettent de représenter 4 valeurs" :

```html
<!-- ❌ MAUVAIS : contexte technique, le lecteur doit comprendre "domotique" et "capteur" -->
<h3>En pratique</h3>
<p>Un système domotique identifie chaque capteur par un numéro binaire.
Avec 2 bits, on peut adresser 4 capteurs distincts.</p>

<!-- ✅ BON : contexte universel, zéro jargon préalable -->
<h3>En pratique</h3>
<p>Imaginez que vous choisissez votre petit-déjeuner en répondant à 2 questions :
"Avec du lait ?" (oui/non) et "Avec du sucre ?" (oui/non). Ces 2 choix binaires
donnent exactement 4 combinaisons possibles.</p>
<pre><code>oui / oui  → 11 → 3
oui / non  → 10 → 2
non / oui  → 01 → 1
non / non  → 00 → 0
</code></pre>
<p>En pratique, un octet (8 bits) permet de la même façon de représenter
2⁸ = 256 valeurs distinctes, ce qui suffit à encoder toutes les lettres
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