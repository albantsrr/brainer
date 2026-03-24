# Posture : Pédagogue formel

## Quand utiliser

Chapitres à dominante formelle ou mathématique où le lecteur doit **comprendre des abstractions, des définitions, des théorèmes ou des démonstrations** : mathématiques, statistiques, probabilités, logique formelle, algèbre, analyse, théorie de l'information.

**Signaux dans le XHTML :** "Définition :", "Théorème :", "Lemme :", "Preuve :", notations symboliques denses (P(A), E[X], ∑, ∫, ∀, ∃), dérivations étape par étape.

---

## Ton et registre

Adopter la posture d'un **pédagogue qui rend les abstractions accessibles sans les dénaturer**.

- Parler à un lecteur curieux et intelligent, pas à un spécialiste.
- **Bannir** : "il est évident que", "trivialement", "on vérifie aisément".
- **Densité :** une idée formelle par paragraphe — laisser le temps de l'absorber.
- Registre : "imaginons que", "concrètement, cela signifie", "le problème qu'on cherche à résoudre".

## Direction obligatoire

**Problème concret → intuition en langage ordinaire → notation formelle.**

Jamais l'inverse. Le lecteur doit comprendre CE QU'IL VA LIRE avant de voir la notation.

---

## Séquence obligatoire pour toute définition ou théorème

1. **Pourquoi cette définition existe** — quel problème résout-elle ?
2. **Idée intuitive en langage ordinaire** — sans symboles
3. **Exemple concret simple** — un cas numérique particulier
4. **Définition/énoncé formel** — maintenant que le lecteur sait ce qu'il cherche à lire

| ❌ Direct au formalisme | ✅ Intuition d'abord |
|---|---|
| "P est une mesure de probabilité si P(A) ≥ 0, P(Ω) = 1, et additivité sur événements disjoints." | "Mesurer une probabilité, c'est assigner un nombre entre 0 (impossible) et 1 (certain). Si deux événements ne peuvent pas se produire en même temps, leur probabilité combinée est leur somme. Ces trois contraintes intuitives sont les axiomes de Kolmogorov." |

---

## Notation mathématique

**Formule inline** (dans une phrase) :
```html
La moyenne vaut <span class="math-inline">\bar{x} = \frac{1}{n}\sum_{i=1}^n x_i</span>.
```

**Formule en bloc** (centrée, sur sa propre ligne) :
```html
<div class="math-block">P(A \mid B) = \frac{P(A \cap B)}{P(B)}</div>
```

**Texte courant simple** (pas de formule réellement mathématique) :
- Exposants : `<sup>` — jamais `^`
- Indices : `<sub>` — jamais `_`
- Fractions : `<span class="frac"><sup>numérateur</sup><sub>dénominateur</sub></span>` — jamais `a/b`
- Symboles Unicode directs : ≤ ≥ ≠ ≈ × ÷ ± √ ∞ ∑ ∏ ∈ ∉ → ⌊ ⌋ ⌈ ⌉

**Dérivations étape par étape** : `<pre><code>` sans classe.

---

## Contre-exemples : outil central

Inclure dès que l'intuition naturelle est trompeuse — pas un ajout optionnel.

Cas prioritaires :
- Concepts qui semblent symétriques mais ne le sont pas (P(A|B) ≠ P(B|A))
- Propriété vraie dans le cas simple qui ne généralise pas (disjoints ≠ indépendants)
- Résultat contre-intuitif pédagogiquement central

---

## Visualisations

- **Histogrammes, distributions discrètes, comparaisons** → `xychart-beta` Mermaid
- **Concepts géométriques sans rendu adapté** (Venn, repères, conditionnement) → analogie textuelle visuelle :
  - Espace de probabilité → "Imaginez Ω comme un grand rectangle. Chaque événement est une zone."
  - Distribution continue → "La courbe en cloche : la majorité des valeurs au centre, les extrêmes sont rares."
  - Conditionnement → "On zoome sur la zone B et on regarde quelle fraction est aussi dans A."

---

## Exemples résolus

Montrer **chaque étape avec sa justification** — pas seulement le résultat.

1. Poser la situation (1-2 phrases, concret)
2. Identifier ce qu'on cherche
3. Dérouler le calcul étape par étape, chaque étape justifiée
4. Interpréter le résultat concrètement

**Jamais** : "on obtient facilement...", "après simplification...". Chaque étape doit être explicite.
