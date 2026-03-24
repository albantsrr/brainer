# Stratégie : Algorithme

## Quand utiliser

Le contenu présente un **algorithme, une méthode de calcul, ou une procédure systématique**. Le lecteur doit comprendre non seulement les étapes mais pourquoi cette approche est efficace.

**Signaux :** pseudocode, code source, complexité (O(n), O(log n)), "étape 1... étape 2...", tri, recherche, parcours, heuristique.

---

## Séquence pédagogique

### 1. Problème concret
Poser un problème que l'algorithme résout, avec un cas concret et motivant.
> "Trouver un mot dans un dictionnaire de 100 000 entrées."

### 2. Solution naïve et sa limite
Montrer l'approche la plus simple et pourquoi elle ne suffit pas.
> "Parcourir les 100 000 entrées une par une → 100 000 comparaisons dans le pire cas."

### 3. Déroulé manuel sur petit exemple
Exécuter l'algorithme **à la main** sur un exemple de 5-10 éléments, étape par étape. Le lecteur doit pouvoir suivre sans connaître le code.

### 4. Code commenté
Le code arrive APRÈS que le lecteur a compris le mécanisme. Chaque bloc est lié à une étape du déroulé manuel.

### 5. Analyse de complexité
Relier la complexité au déroulé : "on divise par 2 à chaque étape → log₂(n) étapes". Comparer avec la solution naïve pour montrer le gain.

---

## Piège à éviter

**Donner le code d'abord et expliquer ensuite.**

Le lecteur ne sait pas encore POURQUOI chaque ligne existe. Le code sans contexte est opaque — le déroulé manuel crée le contexte.

---

## Exemple d'application

**Sujet :** Recherche dichotomique

1. **Problème :** "Trouver le numéro 42 dans une liste triée de 1 000 000 de numéros"
2. **Naïve :** Parcourir du début → jusqu'à 1 000 000 de comparaisons
3. **Déroulé :** Liste [2, 5, 8, 12, 16, 23, 38, 42, 56, 72]
   - Milieu = 16 → 42 > 16 → on garde la moitié droite
   - Milieu = 42 → trouvé ! En 2 étapes au lieu de 8
4. **Code :** Python avec commentaires reliant chaque ligne au déroulé
5. **Complexité :** "On divise par 2 à chaque étape → log₂(1 000 000) ≈ 20 comparaisons au lieu de 1 000 000"

---

## Diagrammes recommandés

- États successifs d'une structure → ASCII art dans `<pre><code>` sans classe
- Arbre de récursion / décision → `graph TD` Mermaid
- Comparaison de performances → `xychart-beta` Mermaid
