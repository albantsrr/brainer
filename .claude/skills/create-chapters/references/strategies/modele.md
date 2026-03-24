# Stratégie : Modèle

## Quand utiliser

Le contenu présente un **modèle** (mathématique, statistique, mental, ou conceptuel) qui représente une réalité simplifiée. Le lecteur doit comprendre que le modèle est un **outil utile**, pas une vérité absolue.

**Signaux :** "modèle", "hypothèses", "approximation", "on suppose que", distributions (Poisson, normale, binomiale), paramètres, ajustement, validation.

---

## Séquence pédagogique

### 1. Phénomène réel
Décrire le phénomène concret qu'on cherche à comprendre ou prédire.
> "Combien de clients arrivent par heure dans un magasin ?"

### 2. Hypothèses simplificatrices
Énoncer les hypothèses et expliquer POURQUOI elles sont raisonnables (pas seulement les lister).
> "On suppose que les arrivées sont indépendantes — le fait qu'un client vienne n'influence pas le suivant. Raisonnable en dehors des heures de pointe."

### 3. Construction du modèle
Montrer comment les hypothèses mènent au modèle mathématique. Le modèle doit être une **conséquence logique** des hypothèses, pas un objet tombé du ciel.

### 4. Vérification sur données concrètes
Comparer les prédictions du modèle avec des données réelles. Le lecteur doit voir que ça colle (et où ça ne colle pas).

### 5. Limites et violation des hypothèses
Montrer ce qui se passe quand les hypothèses sont violées. C'est ici que le lecteur comprend la valeur et les limites du modèle.

---

## Piège à éviter

**Présenter le modèle comme une vérité mathématique plutôt que comme une approximation utile.**

"La loi de Poisson dit que..." → NON. "Si les arrivées sont indépendantes et à taux constant, le nombre d'arrivées suit une loi de Poisson. En pratique..." → OUI.

---

## Exemple d'application

**Sujet :** Modèle de Poisson pour les arrivées

1. **Phénomène :** Nombre d'appels reçus par un centre d'appel par tranche de 10 minutes
2. **Hypothèses :** Arrivées indépendantes, taux moyen constant (λ = 5 appels/10 min), pas d'arrivées simultanées
3. **Modèle :** P(k appels) = e^(-λ) × λ^k / k! — construit à partir des hypothèses
4. **Vérification :** Sur 100 tranches observées, la distribution réelle vs. la distribution théorique
5. **Limites :** À l'heure du déjeuner, le taux n'est pas constant → le modèle sous-estime les pics

---

## Diagrammes recommandés

- Comparaison modèle vs. réalité → `xychart-beta` Mermaid
- Flux du modèle (entrées → paramètres → prédictions) → `graph LR` Mermaid
