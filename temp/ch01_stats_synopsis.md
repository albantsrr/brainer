## Points clés

- La probabilité est une mesure mathématique rigoureuse de l'incertitude, définie sur un espace de résultats Ω
- Tout événement est un sous-ensemble de Ω ; les opérations ensemblistes (union, intersection, complémentaire) s'appliquent directement aux événements
- Les trois axiomes de Kolmogorov (non-négativité, normalisation, additivité) suffisent à fonder toute la théorie des probabilités
- Sur un espace fini équiprobable, P(A) = |A| / |Ω| : le calcul de probabilité se réduit à du dénombrement
- Deux événements sont indépendants si P(A ∩ B) = P(A) × P(B) ; être disjoints est une propriété opposée, non similaire
- La probabilité conditionnelle P(A|B) = P(A ∩ B) / P(B) mesure la probabilité de A sachant que B s'est réalisé
- P(A|B) ≠ P(B|A) en général — la confusion entre les deux est une erreur classique et coûteuse
- Le théorème de Bayes permet d'inverser le conditionnement : de P(B|Aᵢ) vers P(Aᵢ|B), via la loi des probabilités totales

## Concepts importants

- **Espace Ω** : ensemble exhaustif de tous les résultats possibles d'une expérience aléatoire
- **Événement** : sous-ensemble de Ω ; peut être simple (un résultat) ou composé (plusieurs résultats)
- **Axiomes de Kolmogorov** : les trois règles (P ≥ 0, P(Ω) = 1, additivité sur disjoints) qui définissent une mesure de probabilité valide
- **Loi uniforme** : distribution équiprobable sur espace fini — P(A) = |A| / |Ω|
- **Événements disjoints** : A ∩ B = ∅ ; mutuellement exclusifs, donc très dépendants
- **Indépendance** : P(A ∩ B) = P(A) × P(B) ; rend la multiplication des probabilités possible
- **Probabilité conditionnelle** : P(A|B) = P(A ∩ B) / P(B) — restreint l'espace de référence à B
- **Loi des probabilités totales** : P(B) = Σᵢ P(B|Aᵢ) × P(Aᵢ) pour toute partition {Aᵢ} de Ω
- **Théorème de Bayes** : P(Aᵢ|B) = P(B|Aᵢ) × P(Aᵢ) / P(B) — inverse le conditionnement
- **Probabilité a priori / a posteriori** : P(A) avant observation vs. P(A|B) après observation de B

## À retenir absolument

- Les trois axiomes de Kolmogorov suffisent à dériver toutes les propriétés de la probabilité (P(∅) = 0, P(Ac) = 1 − P(A), formule de l'union...)
- Disjonction ≠ indépendance : des événements disjoints avec probabilité positive sont toujours dépendants
- P(A|B) ≠ P(B|A) — confondre les deux est l'"erreur du procureur", une faute grave de raisonnement
- Le théorème de Bayes est le seul outil rigoureux pour passer de la vraisemblance P(données | hypothèse) à la probabilité a posteriori P(hypothèse | données)
- Un test médical fiable à 90% peut ne donner qu'une probabilité de 8% d'être malade après un résultat positif, si la prévalence est faible — Bayes seul évite cette erreur d'intuition
