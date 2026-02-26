# Notation Mathématique

## Règle principale

**Ne jamais écrire une expression mathématique en notation ASCII brute dans du texte courant.**

| ❌ Interdit | ✅ Correct |
|------------|-----------|
| `2^n` | `2<sup>n</sup>` |
| `a_i` ou `a_1` | `a<sub>i</sub>` |
| `log2(n)` | `log<sub>2</sub>(n)` |
| `O(n^2)` | `O(n<sup>2</sup>)` |
| `x >= 0` | `x ≥ 0` |
| `-2^(n-1)` | `-2<sup>n-1</sup>` |

---

## Exposants et indices

### `<sup>` — Exposants / puissances

```html
<!-- Complexité -->
<p>La complexité est O(n<sup>2</sup>).</p>

<!-- Plage d'entiers signés sur n bits : [-2^(n-1), 2^(n-1)-1] -->
<p>La plage d'un entier signé sur n bits est [-2<sup>n-1</sup>, 2<sup>n-1</sup>-1].</p>

<!-- Notation scientifique -->
<p>Un octet peut stocker 2<sup>8</sup> = 256 valeurs.</p>
```

### `<sub>` — Indices / bases numériques

```html
<!-- Base numérique -->
<p>La valeur 1010<sub>2</sub> vaut 10<sub>10</sub>.</p>

<!-- Logarithme -->
<p>log<sub>2</sub>(1024) = 10</p>

<!-- Suite / tableau -->
<p>L'élément a<sub>i</sub> est comparé à a<sub>i+1</sub>.</p>
```

### Combiné

```html
<p>La somme S = a<sub>1</sub> + a<sub>2</sub> + ... + a<sub>n</sub> est calculée en O(n).</p>
```

---

## Symboles Unicode courants

Utiliser directement les caractères Unicode — **pas d'entités HTML** (`&le;`, `&ge;`...).

| Symbole | Caractère | Usage |
|---------|-----------|-------|
| ≤       | `≤`       | inférieur ou égal |
| ≥       | `≥`       | supérieur ou égal |
| ≠       | `≠`       | différent de |
| ≈       | `≈`       | environ égal |
| ×       | `×`       | multiplication |
| ÷       | `÷`       | division |
| ±       | `±`       | plus ou moins |
| √       | `√`       | racine carrée |
| ∞       | `∞`       | infini |
| ∑       | `∑`       | somme |
| ∏       | `∏`       | produit |
| ∈       | `∈`       | appartient à |
| ∉       | `∉`       | n'appartient pas à |
| →       | `→`       | flèche (implication) |
| ⌊       | `⌊`       | plancher (floor) |
| ⌋       | `⌋`       | plancher fermant |
| ⌈       | `⌈`       | plafond (ceil) |
| ⌉       | `⌉`       | plafond fermant |

**Exemple :**
```html
<p>Pour tout n ≥ 1, le temps d'exécution est au plus C × n<sup>2</sup>.</p>
<p>Le résultat est ⌊log<sub>2</sub>(n)⌋ + 1 bits.</p>
```

---

## Formules complexes : utiliser `<pre><code>`

Pour les formules multilignes ou les démonstrations, préférer un bloc de code texte explicite :

```html
<pre><code>Complément à deux sur n bits :
  Plage positive : [0, 2^(n-1) - 1]
  Plage négative : [-2^(n-1), -1]
  Total          : 2^n valeurs distinctes
</code></pre>
```

> **Quand utiliser `<pre><code>` vs `<sup>`/`<sub>` :**
> - Expression courte dans une phrase → `<sup>`/`<sub>` + Unicode
> - Dérivation / calcul multiligne → `<pre><code>`
> - Expression dans un bloc de code existant → garder la notation ASCII du langage concerné (`x**2` en Python, `1 << n` en C, etc.)

---

## Cas particulier : code source

Dans un vrai bloc de code (`<pre><code class="language-python">`), garder la syntaxe du langage :

```html
<!-- ✅ Correct : syntaxe Python dans un bloc de code -->
<pre><code class="language-python">result = 2 ** n  # 2 puissance n
mask = (1 << bits) - 1
</code></pre>

<!-- ✅ Correct : expression mathématique dans le texte autour -->
<p>Le masque <code>(1 &lt;&lt; n) - 1</code> sélectionne les n bits de poids faible,
soit 2<sup>n</sup> - 1 en valeur décimale.</p>
```

---

## Checklist math

- [ ] Aucun `^` utilisé pour les puissances dans le texte courant → `<sup>`
- [ ] Aucun `_` utilisé pour les indices dans le texte courant → `<sub>`
- [ ] Symboles mathématiques Unicode directs (≤, ≥, ×, √...) — pas d'entités HTML
- [ ] Formules multilignes dans `<pre><code>` si elles ne rentrent pas dans une ligne
- [ ] Notation ASCII autorisée uniquement à l'intérieur des blocs de code source
