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

```html
<p>[Accroche : situation concrète, analogie ou question rhétorique]</p>

<p>[Contexte : lien avec le domaine global, annonce des grands thèmes sans détailler]</p>

<p>[Transition : ce que le lecteur va acquérir dans ce chapitre]</p>
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
<p>[Comment ça fonctionne techniquement]</p>

<h3>Exemple pratique</h3>
<p>[Exemple concret avec code ou diagramme — OBLIGATOIRE]</p>

<h3>Erreurs fréquentes</h3>  <!-- si pertinent -->
<ul>
  <li><strong>Erreur :</strong> [Description] → <strong>Solution :</strong> [Correction]</li>
</ul>
```

**Règles :**
- Chaque section `<h2>` DOIT avoir au minimum : Concept + Mécanisme + Exemple
- Les exemples concrets sont **obligatoires** (code de préférence)
- Utiliser Mermaid seulement si la relation est impossible à exprimer clairement en texte (voir `02_diagrammes.md`)

**Exemple complet :**
```html
<h2>Représentation des entiers signés</h2>

<h3>Concept fondamental</h3>
<p>Les ordinateurs représentent les nombres négatifs via le <strong>complément à deux</strong>.
Le bit de poids fort indique le signe : 0 pour positif, 1 pour négatif.</p>

<h3>Mécanisme interne</h3>
<p>Pour représenter -x :</p>
<ol>
  <li>Écrire la représentation binaire de x</li>
  <li>Inverser tous les bits (complément à un)</li>
  <li>Ajouter 1</li>
</ol>
<p>Cette méthode permet d'utiliser les mêmes circuits d'addition pour positifs et négatifs.</p>

<h3>Exemple pratique</h3>
<pre><code>5 en binaire :      00000101
Complément à un :  11111010
Ajouter 1 :        11111011  ← représentation de -5

Vérification : 00000101 + 11111011 = 00000000 (avec retenue ignorée)
</code></pre>

<h3>Erreurs fréquentes</h3>
<ul>
  <li><strong>Erreur :</strong> Confondre complément à un et complément à deux →
  <strong>Solution :</strong> Le complément à deux ajoute toujours +1 après l'inversion</li>
  <li><strong>Erreur :</strong> Oublier que INT_MIN n'a pas d'équivalent positif →
  <strong>Solution :</strong> Plage sur n bits : [-2^(n-1), 2^(n-1)-1]</li>
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
- Code dans `<pre><code>` avec classe de langage si pertinent

**❌ Ne pas faire :**
- `style="..."` (styles inline)
- `<b>`, `<i>`, `<u>` (balises présentationnelles)
- Sauter des niveaux de titres (h2 → h4)
- Convertir des listes en paragraphes avec tirets manuels (—)
- Classes ou IDs CSS