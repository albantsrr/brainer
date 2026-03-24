# Stratégie : Formalisme

## Quand utiliser

Le contenu introduit des **définitions formelles, théorèmes, propriétés mathématiques ou notations symboliques**. Le lecteur doit acquérir un vocabulaire formel et savoir l'utiliser.

**Signaux :** "Définition :", "Théorème :", "Propriété :", notation dense (∀, ∃, ∑, ∫), expressions symboliques, axiomes.

---

## Séquence pédagogique

### 1. Problème motivant
Quel problème concret cette formalisation résout-elle ? Pourquoi a-t-on besoin de ce concept ?
> "On veut comparer la 'distance' entre deux distributions de données — mais comment mesurer une distance entre des formes ?"

### 2. Intuition en langage ordinaire
Explication en 2-3 phrases, sans aucun symbole. Le lecteur doit pouvoir reformuler l'idée à un ami.

### 3. Exemple numérique concret
Un cas particulier avec des valeurs simples (calculables mentalement). Le lecteur manipule le concept avant de voir sa forme abstraite.

### 4. Définition / énoncé formel
Maintenant que le lecteur sait CE QU'IL VA LIRE, la notation formelle ancre et précise l'intuition.

### 5. Conditions d'application
Quand le concept NE s'applique PAS. Les limites et les cas d'invalidité.

---

## Piège à éviter

**Commencer par "Soit X un espace..." en première phrase.**

Le lecteur décroche immédiatement sans motivation. L'intuition DOIT précéder le formalisme — pas le suivre comme une note de bas de page.

---

## Exemple d'application

**Sujet :** L'espérance mathématique

1. **Problème :** "Si vous jouez 1000 fois à un jeu de hasard, combien allez-vous gagner en moyenne ?"
2. **Intuition :** "L'espérance, c'est la valeur moyenne qu'on obtiendrait si on répétait l'expérience un très grand nombre de fois. Ce n'est pas ce qu'on obtient à un coup — c'est la tendance sur le long terme."
3. **Exemple :** "Un dé à 6 faces : on gagne le nombre affiché en euros. Espérance = (1+2+3+4+5+6)/6 = 3,50 €. On ne gagnera jamais exactement 3,50 € en un lancer — mais sur 1000 lancers, la moyenne sera très proche."
4. **Formel :** E[X] = ∑ xᵢ · P(X = xᵢ)
5. **Limites :** "L'espérance n'existe pas toujours — certaines distributions (Cauchy) n'ont pas d'espérance finie."

---

## Règle de notation

- Formule inline : `<span class="math-inline">...</span>`
- Formule en bloc : `<div class="math-block">...</div>`
- Dérivations étape par étape : `<pre><code>` sans classe
- Texte courant simple : `<sup>`, `<sub>`, `<span class="frac">`, symboles Unicode
