# Stratégie : Mécanisme

## Quand utiliser

Le contenu explique **comment quelque chose fonctionne en interne** : un composant système, un protocole, un processus physique, un algorithme de bas niveau. Le lecteur observe un comportement et veut comprendre ce qui se passe "sous le capot".

**Signaux :** descriptions de composants internes, flux de données entre modules, diagrammes d'architecture, "quand X se produit, Y fait Z".

---

## Séquence pédagogique

### 1. Symptôme observable
Partir d'un comportement que le lecteur peut observer ou expérimenter.
> "Votre programme utilise 4 Go de RAM mais la machine n'en a que 2 — pourtant, il tourne."

### 2. Mécanisme interne
Expliquer la machinerie qui produit ce comportement. Décomposer en étapes, avec un diagramme si le mécanisme implique plusieurs composants.

### 3. Justification de conception
Pour chaque décision de design dans le mécanisme, expliquer la **contrainte** qui l'a motivée :
- Contrainte matérielle (taille, vitesse, coût)
- Contrainte de performance (latence, débit)
- Contrainte de sécurité (isolation, intégrité)
- Contrainte de compatibilité (rétrocompatibilité, standards)

### 4. Cas de défaillance
Montrer ce qui se passe quand le mécanisme échoue ou atteint ses limites. C'est souvent le moment où le lecteur comprend le mieux POURQUOI le mécanisme est conçu ainsi.

---

## Piège à éviter

**Décrire le mécanisme sans jamais dire POURQUOI il est conçu ainsi.**

Le lecteur retient 10× mieux quand il comprend la contrainte qui a motivé le choix. "La table des pages existe parce que..." est plus puissant que "La table des pages est une structure qui...".

---

## Exemple d'application

**Sujet :** Le cache CPU

1. **Symptôme :** "Deux programmes identiques — l'un parcourt un tableau ligne par ligne, l'autre colonne par colonne. Le premier est 10× plus rapide. Pourquoi ?"
2. **Mécanisme :** Le cache charge des lignes entières (64 octets). L'accès séquentiel touche des données déjà chargées. L'accès par colonne saute d'une ligne mémoire à l'autre → cache miss à chaque accès.
3. **Justification :** Le cache est petit (32 Ko L1) **parce que** la proximité au cœur impose une taille limitée. La localité spatiale est exploitée **parce que** les programmes accèdent typiquement à des données adjacentes.
4. **Défaillance :** Thrashing — quand le working set dépasse la taille du cache, les performances s'effondrent.

---

## Diagrammes recommandés

- Architecture interne → `graph TD`
- Flux entre composants → `graph LR`
- Layout mémoire / registres → ASCII art dans `<pre><code>` sans classe
