# Stratégie : Taxonomie

## Quand utiliser

Le contenu **classe, compare ou distingue** des concepts, technologies, approches ou types. Le lecteur doit comprendre les différences et savoir **quand choisir quoi**.

**Signaux :** "il existe N types de...", "on distingue... de...", listes de catégories, tableaux comparatifs, "à la différence de".

---

## Séquence pédagogique

### 1. Critère de distinction
Commencer par LE critère qui sépare les catégories. Pas la liste des catégories — le POURQUOI de la distinction.
> "La différence clé entre batch et streaming, c'est QUAND les données sont traitées — en bloc après coup, ou en continu à l'arrivée."

### 2. Chaque catégorie avec un exemple concret
Présenter chaque catégorie par un exemple familier, pas par une définition abstraite.

### 3. Exemple discriminant
Un cas concret où le choix de catégorie a un **impact réel** — un scénario où choisir A plutôt que B change le résultat.

### 4. Tableau comparatif
Résumer en un tableau clair. **Maximum 4-5 lignes**, critères les plus importants uniquement.

---

## Piège à éviter

**Lister les catégories sans jamais dire QUAND choisir l'une plutôt que l'autre.**

La classification n'a de valeur que si elle aide à décider. "Il existe 4 types de bases de données" sans guide de choix est de l'information morte.

---

## Exemple d'application

**Sujet :** Types de bases de données

1. **Critère :** "Le choix dépend de la FORME de vos données et de COMMENT vous les interrogez."
2. **Catégories :**
   - Relationnelle → "vos données ont des relations claires (clients → commandes → produits)"
   - Document → "chaque entrée est autonome et peut avoir une structure différente (profils utilisateurs)"
   - Clé-valeur → "vous avez besoin de retrouver une valeur par sa clé, très vite (cache, sessions)"
3. **Discriminant :** "Un réseau social : les relations entre utilisateurs (amis, followers) → une base graphe bat une relationnelle de plusieurs ordres de grandeur sur les requêtes de parcours."
4. **Tableau :**

| Type | Force | Faiblesse | Choisir si... |
|------|-------|-----------|---------------|
| Relationnelle | Intégrité, requêtes complexes | Schéma rigide | Relations structurées et stables |
| Document | Flexibilité, scalabilité | Pas de jointures natives | Données hétérogènes |
| Clé-valeur | Ultra rapide | Requêtes limitées | Accès par clé uniquement |
