# Domaine : Mathématiques

## Types d'exercices à privilégier

**Ordre de préférence :**
1. `calculation` — pour appliquer une formule, un théorème, une méthode de calcul
2. `multiple_choice` — pour les définitions, les propriétés, les conditions d'application
3. `true_false` — pour les propriétés, les contre-exemples, les idées reçues

**Ne JAMAIS utiliser** `code` pour un chapitre de maths pures.

Exception : si le chapitre traite de statistiques computationnelles (simulation, bootstrap, régression numérique) avec du code Python/R, `code` est acceptable.

---

## Exercices `calculation` : bonnes pratiques

### Structure obligatoire

1. **Énoncé (`problem`)** : situation concrète avec valeurs numériques précises
   - Donner un contexte (jeu de données, expérience, mesure)
   - Définir les variables avec des valeurs (ex : n = 20, μ = 50, σ = 5)
   - Formuler une question précise : "Calculez X", "Déterminez Y"
   - Toutes les formules en KaTeX : `<span class="math-inline">LaTeX</span>` ou `<div class="math-block">LaTeX</div>`

2. **Étapes (`steps`)** : texte simple décrivant chaque étape de calcul
   - Pas de HTML dans les steps — texte brut
   - 3-5 étapes courtes et précises
   - Chaque étape = une action concrète (identifier la formule, substituer, calculer, interpréter)

3. **Solution (`solution`)** : HTML complet avec tous les calculs intermédiaires
   - Chaque substitution numérique en KaTeX
   - Résultat final mis en valeur (`<strong>`)
   - Interprétation en français (1-2 phrases)

4. **Indices (`hints`)** : 3 indices progressifs
   - Indice 1 : orienter vers la bonne formule ou le bon concept
   - Indice 2 : préciser quel paramètre substituer
   - Indice 3 : donner la formule avec les valeurs partiellement substituées

### Exemple de `calculation` bien construit

```json
{
  "problem": "<p>Un fabricant mesure le diamètre (en mm) de 15 pièces produites et obtient une moyenne <span class=\"math-inline\">\\bar{x} = 12.4</span> mm et un écart-type <span class=\"math-inline\">s = 0.3</span> mm. Calculez l'intervalle de confiance à 95% pour la moyenne réelle <span class=\"math-inline\">\\mu</span>.</p>",
  "steps": [
    "Identifier la formule de l'intervalle de confiance avec variance inconnue (loi de Student)",
    "Trouver la valeur critique t pour n-1 = 14 degrés de liberté à 95%",
    "Calculer la marge d'erreur",
    "Construire l'intervalle [x̄ - marge, x̄ + marge]",
    "Interpréter le résultat"
  ],
  "solution": "<p>On utilise la formule : <div class=\"math-block\">\\bar{x} \\pm t_{\\alpha/2, n-1} \\cdot \\frac{s}{\\sqrt{n}}</div></p><p>Avec <span class=\"math-inline\">t_{0.025, 14} \\approx 2.145</span>, la marge est : <div class=\"math-block\">2.145 \\times \\frac{0.3}{\\sqrt{15}} \\approx 0.166</div></p><p><strong>Intervalle : [12.23 ; 12.57] mm</strong></p><p>On peut affirmer avec 95% de confiance que le diamètre moyen réel se situe entre 12.23 mm et 12.57 mm.</p>",
  "hints": [
    "La variance de la population est inconnue — quelle loi utilise-t-on dans ce cas ?",
    "Cherchez la valeur critique de Student pour 14 degrés de liberté et α/2 = 0.025",
    "La marge d'erreur est t × s/√n, soit environ 2.145 × 0.3/√15"
  ]
}
```

---

## Multiple choice en maths : bonnes pratiques

- Formules inline dans les options : `<span class="math-inline">LaTeX</span>`
- Distracteurs plausibles :
  - Erreurs de signe (confondre P(A∩B) et P(A∪B))
  - Confusion entre deux formules similaires (variance corrigée vs biaisée)
  - Valeur numérique incorrecte due à une erreur classique (diviser par n au lieu de n-1)
  - Conditions d'application non vérifiées
- Questions typiques :
  - "Quelle est la condition pour appliquer le théorème X ?"
  - "Parmi ces affirmations, laquelle est toujours vraie ?"
  - "Quel est le résultat de ce calcul ?"
  - "Quelle formule correspond à la définition de X ?"

---

## True/False en maths : bonnes pratiques

- Propriétés des distributions (ex : "la médiane d'une loi normale est égale à sa moyenne")
- Conditions nécessaires vs suffisantes (ex : "l'indépendance implique la non-corrélation — mais l'inverse n'est pas vrai")
- Contre-exemples courants (ex : "si P(A∩B) = P(A)·P(B), alors A et B sont indépendants — vrai")
- Idées reçues statistiques (ex : "un p-value < 0.05 prouve que H1 est vraie — faux")

---

## KaTeX obligatoire

Dans tous les exercices maths :
- Formules → `<span class="math-inline">LaTeX</span>` ou `<div class="math-block">LaTeX</div>`
- JAMAIS `^` pour les exposants hors KaTeX → utiliser `<sup>` ou KaTeX
- JAMAIS `_` pour les indices hors KaTeX → utiliser `<sub>` ou KaTeX
- Symboles unicode directs dans le texte : ≤ ≥ ≠ ≈ × ÷ ± √ ∞ ∑ ∏ ∈

---

## Checklist

- [ ] Au moins 1 exercice `calculation` par lot pour un chapitre de maths
- [ ] Valeurs numériques concrètes dans l'énoncé (pas seulement des variables abstraites)
- [ ] Toutes les formules en KaTeX (aucun `^` ou `_` hors balises)
- [ ] Solution avec tous les calculs intermédiaires
- [ ] Résultat final interprété en français
- [ ] 3 indices progressifs
- [ ] Aucun exercice `code` sauf si le chapitre traite de stats computationnelles
