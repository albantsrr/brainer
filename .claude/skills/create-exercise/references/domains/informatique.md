# Domaine : Informatique

## Types d'exercices à privilégier

**Ordre de préférence :**
1. `code` — pour tout ce qui peut s'implémenter (fonctions, algorithmes, structures de données, manipulation de fichiers, requêtes)
2. `multiple_choice` — pour les concepts, les trade-offs, les comportements de programmes
3. `true_false` — pour les propriétés, les garanties, les idées reçues

**Ne JAMAIS utiliser** `calculation` pour un chapitre d'informatique pure.

Exception : si le chapitre couvre des statistiques computationnelles ou de l'analyse de complexité avec des calculs formels, `calculation` est acceptable.

---

## Exercices de code : bonnes pratiques

- Préférer Python par défaut, sauf si le chapitre porte sur un autre langage (C, Bash, JavaScript)
- `starter_code` : fournir la signature de fonction + commentaire `# TODO`
- `solution` : code propre, commenté sur les points non évidents
- `hints` : 3 indices progressifs — le premier oriente (pensez à X), le deuxième précise (utilisez tel opérateur/structure), le troisième est presque la solution

**Exemples de sujets pour `code` :**
- Implémenter un tri, une recherche, un parcours de graphe
- Lire/écrire un fichier, parser un format (CSV, JSON)
- Simuler un mécanisme (pipeline, scheduler simple)
- Écrire une fonction utilitaire liée au chapitre

---

## Multiple choice : focus CS

- Tester le comportement observable, pas la définition abstraite
- Distracteurs plausibles : valeurs proches, erreurs de fencepost, confusion entre deux mécanismes similaires
- Inclure des options avec du code court (`<code>x += 1</code>`) quand c'est pertinent
- Questions typiques :
  - "Que retourne ce code ?"
  - "Quelle est la complexité de X ?"
  - "Pourquoi utiliser X plutôt que Y dans cette situation ?"
  - "Quel problème peut causer cette implémentation ?"

---

## True/False : focus CS

- Affirmations sur les propriétés des algorithmes et structures de données
- Idées reçues courantes (ex : "un tableau trié permet la recherche en O(1)")
- Garanties et limites des outils (ex : "un lock garantit l'absence de deadlock")
- Comportements contre-intuitifs

---

## Checklist

- [ ] Au moins 1 exercice `code` par lot pour un chapitre technique
- [ ] Starter code fourni pour tous les `code`
- [ ] Distracteurs plausibles dans les MCQ (pas trivialement faux)
- [ ] Language explicitement défini dans `code` (python/c/bash/javascript)
- [ ] Aucun `calculation` sauf cas exceptionnel justifié
