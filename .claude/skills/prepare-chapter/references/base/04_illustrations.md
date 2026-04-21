# Illustrations SVG — Guide de création

Les illustrations SVG complètent les diagrammes Mermaid pour tout concept dont la **visualisation est plus claire que le texte seul**. Elles ne se limitent pas aux structures de données : repères géométriques, courbes, histogrammes, transformations, distributions, plans 2D/3D — tout ce qui gagne en clarté visuellement est candidat.

---

## Mermaid vs SVG : quand utiliser quoi

| Utilise Mermaid | Utilise SVG |
|---|---|
| Flux logique, pipeline, architecture | État d'un tableau, d'un arbre, d'une pile |
| Séquence d'appels, état machine | Concept géométrique ou spatial (vecteurs, repère, plan) |
| Relations entre composants | Courbe, histogramme, distribution statistique |
| Diagrammes de classes, ER | Transformation linéaire, projection, comparaison "avant/après" |

**Règle simple :** si la visualisation montre *comment ça marche* → Mermaid. Si elle montre *à quoi ça ressemble* ou *comment c'est disposé dans l'espace* → SVG.

SVG ne se limite pas aux structures de données. Dès qu'un concept gagne en clarté grâce à une visualisation spatiale ou graphique, SVG est approprié. L'important est que l'illustration soit plus claire que le texte seul, pas qu'elle suive un template prédéfini.

---

## Test de qualité obligatoire

Avant de créer une illustration, répondre aux 3 questions :

1. L'état de la structure est-il **significativement plus clair visuellement** qu'en texte ?
2. L'illustration est-elle **compréhensible en < 5 secondes** sans relire ?
3. La légende (`illustration-caption`) est-elle **suffisante sans le texte autour** ?

**Si non à une question → supprimer l'illustration.**

Maximum **2 illustrations par section `<h2>`**.

---

## Format HTML obligatoire

```html
<div class="illustration">
  <svg viewBox="0 0 W H" xmlns="http://www.w3.org/2000/svg">
    <!-- contenu SVG -->
  </svg>
  <p class="illustration-caption">Description concise de l'étape ou de l'état</p>
</div>
```

**Règles impératives :**
- Toujours `viewBox="0 0 W H"` — pas de `width`/`height` fixes sur `<svg>`
- Toujours `xmlns="http://www.w3.org/2000/svg"` sur `<svg>`
- La légende est **obligatoire** — jamais d'illustration sans `illustration-caption`
- Police : `font-family="system-ui, sans-serif"` et `font-size="14"` (ou `12` si espace contraint)
- Attributs SVG directs uniquement — pas de `style="..."` inline

---

## Palette de couleurs (alignée Mermaid)

```
primary   fill="#4A90D9" stroke="#2c6fad"  → élément actif, comparé, sélectionné
success   fill="#5BAD6F" stroke="#3d8b46"  → élément trouvé, valide, correct
warning   fill="#F5A623" stroke="#c47f00"  → pivot, point de décision, attention
neutral   fill="#F0F0F0" stroke="#aaa"     → élément passif, non-traité
danger    fill="#E05C5C" stroke="#b03030"  → erreur, suppression, invalide

text_dark   fill="#333"   → texte sur fond neutre
text_light  fill="#fff"   → texte sur fond coloré
label_gray  fill="#666"   → indices, annotations secondaires
```

---

## Template : Tableau 1D (array)

Cas d'usage : recherche binaire, tri, parcours.

```html
<div class="illustration">
  <svg viewBox="0 0 420 90" xmlns="http://www.w3.org/2000/svg">
    <!-- Indices -->
    <text x="35"  y="18" text-anchor="middle" font-size="12" font-family="system-ui, sans-serif" fill="#666">0</text>
    <text x="95"  y="18" text-anchor="middle" font-size="12" font-family="system-ui, sans-serif" fill="#666">1</text>
    <text x="155" y="18" text-anchor="middle" font-size="12" font-family="system-ui, sans-serif" fill="#666">2</text>
    <text x="215" y="18" text-anchor="middle" font-size="12" font-family="system-ui, sans-serif" fill="#666">3</text>
    <text x="275" y="18" text-anchor="middle" font-size="12" font-family="system-ui, sans-serif" fill="#666">4</text>
    <!-- Cellules -->
    <rect x="10"  y="25" width="50" height="40" rx="3" fill="#F0F0F0" stroke="#aaa" stroke-width="1.5"/>
    <rect x="70"  y="25" width="50" height="40" rx="3" fill="#F0F0F0" stroke="#aaa" stroke-width="1.5"/>
    <rect x="130" y="25" width="50" height="40" rx="3" fill="#4A90D9" stroke="#2c6fad" stroke-width="1.5"/>
    <rect x="190" y="25" width="50" height="40" rx="3" fill="#5BAD6F" stroke="#3d8b46" stroke-width="1.5"/>
    <rect x="250" y="25" width="50" height="40" rx="3" fill="#F0F0F0" stroke="#aaa" stroke-width="1.5"/>
    <!-- Valeurs -->
    <text x="35"  y="50" text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#333">1</text>
    <text x="95"  y="50" text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#333">3</text>
    <text x="155" y="50" text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#fff">5</text>
    <text x="215" y="50" text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#fff">7</text>
    <text x="275" y="50" text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#333">9</text>
    <!-- Pointeurs -->
    <text x="155" y="82" text-anchor="middle" font-size="12" font-family="system-ui, sans-serif" fill="#4A90D9">mid</text>
    <text x="215" y="82" text-anchor="middle" font-size="12" font-family="system-ui, sans-serif" fill="#5BAD6F">cible</text>
  </svg>
  <p class="illustration-caption">Recherche binaire : mid=index 2 (valeur 5), cible=7 → chercher à droite</p>
</div>
```

**Variante avec flèche de pointeur :**
```svg
<defs>
  <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
    <path d="M0,0 L8,4 L0,8 Z" fill="#4A90D9"/>
  </marker>
</defs>
<line x1="155" y1="78" x2="155" y2="68" stroke="#4A90D9" stroke-width="1.5" marker-end="url(#arrow-blue)"/>
```

---

## Template : Arbre binaire

Cas d'usage : BST, tas, parcours DFS/BFS.

```html
<div class="illustration">
  <svg viewBox="0 0 320 190" xmlns="http://www.w3.org/2000/svg">
    <!-- Arêtes (tracer avant les noeuds) -->
    <line x1="160" y1="45" x2="80"  y2="105" stroke="#aaa" stroke-width="1.5"/>
    <line x1="160" y1="45" x2="240" y2="105" stroke="#aaa" stroke-width="1.5"/>
    <line x1="80"  y1="105" x2="40"  y2="165" stroke="#aaa" stroke-width="1.5"/>
    <line x1="80"  y1="105" x2="120" y2="165" stroke="#aaa" stroke-width="1.5"/>
    <!-- Racine -->
    <circle cx="160" cy="35"  r="28" fill="#4A90D9" stroke="#2c6fad" stroke-width="1.5"/>
    <text x="160" y="40"  text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#fff">8</text>
    <!-- Niveau 2 -->
    <circle cx="80"  cy="105" r="25" fill="#F0F0F0" stroke="#aaa" stroke-width="1.5"/>
    <text x="80"  y="110" text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#333">3</text>
    <circle cx="240" cy="105" r="25" fill="#F0F0F0" stroke="#aaa" stroke-width="1.5"/>
    <text x="240" y="110" text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#333">10</text>
    <!-- Niveau 3 -->
    <circle cx="40"  cy="165" r="22" fill="#F0F0F0" stroke="#aaa" stroke-width="1.5"/>
    <text x="40"  y="170" text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#333">1</text>
    <circle cx="120" cy="165" r="22" fill="#5BAD6F" stroke="#3d8b46" stroke-width="1.5"/>
    <text x="120" y="170" text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#fff">6</text>
  </svg>
  <p class="illustration-caption">BST : insertion de 6 (vert) — 6 &lt; 8 → gauche, 6 &gt; 3 → droite</p>
</div>
```

---

## Template : Pile (stack)

```html
<div class="illustration">
  <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg">
    <text x="80" y="18" text-anchor="middle" font-size="12" font-family="system-ui, sans-serif" fill="#666">sommet</text>
    <rect x="30" y="25"  width="100" height="40" rx="3" fill="#4A90D9" stroke="#2c6fad" stroke-width="1.5"/>
    <text x="80" y="50"  text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#fff">C</text>
    <rect x="30" y="70"  width="100" height="40" rx="3" fill="#F0F0F0" stroke="#aaa" stroke-width="1.5"/>
    <text x="80" y="95"  text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#333">B</text>
    <rect x="30" y="115" width="100" height="40" rx="3" fill="#F0F0F0" stroke="#aaa" stroke-width="1.5"/>
    <text x="80" y="140" text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#333">A</text>
    <line x1="20" y1="162" x2="140" y2="162" stroke="#333" stroke-width="2"/>
    <text x="80" y="182" text-anchor="middle" font-size="12" font-family="system-ui, sans-serif" fill="#666">base</text>
  </svg>
  <p class="illustration-caption">Pile LIFO : C est au sommet, dernier entré, premier sorti</p>
</div>
```

---

## Template : Liste chaînée

```html
<div class="illustration">
  <svg viewBox="0 0 400 75" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#4A90D9"/>
      </marker>
    </defs>
    <!-- Noeud 1 -->
    <rect x="10"  y="17" width="80" height="40" rx="3" fill="#F0F0F0" stroke="#aaa" stroke-width="1.5"/>
    <line x1="60" y1="17" x2="60" y2="57" stroke="#aaa" stroke-width="1"/>
    <text x="35"  y="42" text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#333">3</text>
    <line x1="95"  y1="37" x2="120" y2="37" stroke="#4A90D9" stroke-width="1.5" marker-end="url(#arr)"/>
    <!-- Noeud 2 -->
    <rect x="125" y="17" width="80" height="40" rx="3" fill="#F0F0F0" stroke="#aaa" stroke-width="1.5"/>
    <line x1="175" y1="17" x2="175" y2="57" stroke="#aaa" stroke-width="1"/>
    <text x="150"  y="42" text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#333">7</text>
    <line x1="210"  y1="37" x2="235" y2="37" stroke="#4A90D9" stroke-width="1.5" marker-end="url(#arr)"/>
    <!-- Noeud 3 (actif) -->
    <rect x="240" y="17" width="80" height="40" rx="3" fill="#4A90D9" stroke="#2c6fad" stroke-width="1.5"/>
    <line x1="290" y1="17" x2="290" y2="57" stroke="#2c6fad" stroke-width="1"/>
    <text x="265"  y="42" text-anchor="middle" font-size="14" font-family="system-ui, sans-serif" fill="#fff">12</text>
    <line x1="325"  y1="37" x2="350" y2="37" stroke="#4A90D9" stroke-width="1.5" marker-end="url(#arr)"/>
    <!-- NULL -->
    <text x="360" y="42" font-size="13" font-family="system-ui, sans-serif" fill="#aaa">null</text>
  </svg>
  <p class="illustration-caption">Insertion en fin de liste : noeud 12 (bleu) ajouté après 7</p>
</div>
```

---

## Erreurs fréquentes à éviter

- `width="500"` sur `<svg>` — toujours utiliser `viewBox` uniquement
- `style="color: blue"` — utiliser les attributs SVG (`fill`, `stroke`)
- Oublier `illustration-caption` — toute illustration sans légende est invalide
- Trop d'éléments : plus de 8 cellules/noeuds → illisible sur mobile
- `font-size` inférieur à 11 dans le `viewBox`
- Illustrations pour des concepts purement textuels — si le texte suffit, pas d'illustration
