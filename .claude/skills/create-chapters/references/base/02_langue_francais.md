# Règles de Langue : Français

**Règle fondamentale : Français pour le texte courant, termes techniques en anglais avec explication.**

---

## ⛔ INTERDICTION ABSOLUE : Le Tiret Cadratin (—)

**Cette règle s'applique PARTOUT : titres (`<h2>`, `<h3>`) ET texte courant (`<p>`).**

Le tiret cadratin **—** est interdit dans tout contenu généré. Zéro exception dans les titres. Quasi-zéro dans le texte.

### Dans les titres — INTERDIT SANS EXCEPTION

```html
<!-- ❌ JAMAIS -->
<h3>Mécanisme interne — les axiomes de Kolmogorov</h3>
<h2>Probabilités — définition et mesure</h2>

<!-- ✅ TOUJOURS -->
<h3>Mécanisme interne : les axiomes de Kolmogorov</h3>
<h2>Probabilités : définition et mesure</h2>

<!-- ✅ OU reformuler sans séparateur -->
<h3>Les axiomes de Kolmogorov</h3>
```

### Dans le texte courant — remplacer par des virgules

```html
<!-- ❌ JAMAIS — incise avec tirets -->
<p>Le processeur — composant central du calcul — exécute les instructions.</p>

<!-- ✅ TOUJOURS — virgules -->
<p>Le processeur, composant central du calcul, exécute les instructions.</p>
```

**Seule exception autorisée** (avec extrême parcimonie) : une explication en toute fin de phrase — jamais au milieu.

---

---

## Termes Techniques : Garder en Anglais + Expliquer

**Format obligatoire à la première mention :**
```html
<p>Un <strong>buffer</strong> (tampon mémoire temporaire) stocke les données...</p>
```

**Mentions suivantes :** utiliser directement le terme sans répéter l'explication.

**Termes à garder en anglais :**
- Concepts bas niveau : buffer, cache, thread, process, stack, heap, pipeline, queue
- Structures de données : array, hash table, linked list, tree, graph
- Patterns : observer, singleton, factory, adapter
- Opérations : parsing, mapping, serialization, hashing
- Composants : parser, compiler, interpreter, scheduler

---

## Texte Courant : 100% Français

**❌ Verbes anglais interdits :**
- `On va parser` → `On va analyser`
- `On va implement` → `On va implémenter`
- `On va builder` → `On va construire`

**❌ Mots courants anglais interdits :**
- `la data` → `les données`
- `le file` → `le fichier`
- `l'output` → `la sortie`
- `les requests` → `les requêtes`

---

## Noms Propres : Toujours en Anglais (sans traduction)

Python, JavaScript, C++, Rust, Java, PostgreSQL, Docker, Kubernetes, Redis, Nginx,
HTTP, TCP/IP, REST, WebSocket, JSON, XML, YAML, IEEE 754, UTF-8, ASCII, Unicode

---

## Exemples Avant / Après

**❌ Incorrect (franglais) :**
```html
<p>On va parser le fichier JSON pour extraire la data et la store dans un buffer.</p>
```

**✅ Correct :**
```html
<p>On va analyser le fichier JSON pour extraire les données et les stocker dans
un <strong>buffer</strong> (tampon mémoire temporaire).</p>
```

---

**❌ Incorrect :**
```html
<p>Le thread va process les requests et return les résultats.</p>
```

**✅ Correct :**
```html
<p>Le thread va traiter les requêtes et retourner les résultats.</p>
```

---

**❌ Incorrect :**
```html
<p>Pour améliorer les performances, on peut utiliser un cache qui va store
les résultats. Le load balancer va distribuer les requests entre les workers.</p>
```

**✅ Correct :**
```html
<p>Pour améliorer les performances, on peut utiliser un <strong>cache</strong>
(mémoire rapide temporaire) qui stocke les résultats. Le <strong>load balancer</strong>
(répartiteur de charge) distribue les requêtes entre les <strong>workers</strong>
(processus de traitement).</p>
```

---

## Ponctuation : Virgules plutôt que Tirets

**⚠️ RÈGLE STRICTE — Tolérance zéro sur ce point.**

Le tiret cadratin (—) est **presque toujours une erreur** dans le texte courant. La règle est simple :

| Cas | Règle | Ponctuation |
|-----|-------|-------------|
| Incise au milieu d'une phrase | **INTERDIT** | Virgules obligatoires |
| Explication directe en fin de phrase | Autorisé avec parcimonie | — accepté |

**❌ INTERDIT — incise avec tirets :**
```html
<p>C'est la différence entre un code naïf — où toutes les lettres ont la même longueur — et un code optimisé.</p>
<p>À travers l'histoire du code Morse — inventé pour la télégraphie au XIXe siècle — nous découvrirons ce qu'est un code.</p>
<p>Le processeur — composant central du calcul — exécute les instructions en séquence.</p>
```

**✅ Correct — virgules :**
```html
<p>C'est la différence entre un code naïf, où toutes les lettres ont la même longueur, et un code optimisé.</p>
<p>À travers l'histoire du code Morse, inventé pour la télégraphie au XIXe siècle, nous découvrirons ce qu'est un code.</p>
<p>Le processeur, composant central du calcul, exécute les instructions en séquence.</p>
```

**✅ Cas autorisé — explication directe en fin de phrase :**
```html
<p>Un accord partagé entre émetteur et récepteur — sans cet accord, les symboles sont du bruit.</p>
```

**Test rapide :** Si les tirets peuvent être remplacés par des virgules sans changer le sens → utiliser des virgules. Les tirets ne doivent jamais encadrer une incise dans la phrase.

---

---

## Termes Techniques Français : Introduire Avant d'Utiliser

**Cette règle s'applique à TOUS les termes techniques, pas seulement aux mots anglais.**

Tout terme spécialisé, qu'il soit français ou anglais, doit être **défini ou introduit** avant d'être utilisé. Le lecteur ne doit jamais tomber sur un terme inconnu sans filet.

### Format d'introduction (French terms)

Pour un terme technique français, l'introduire avec une définition courte intégrée au texte :

```html
<!-- ❌ Mauvais : terme utilisé avant d'être défini -->
<p>L'arbre de décodage garantit qu'aucun code n'est le préfixe d'un autre.</p>

<!-- ✅ Bon : terme introduit avec définition en contexte -->
<p>L'<strong>arbre de décodage</strong>, une structure en branches où chaque chemin mène à un symbole, garantit qu'aucun code n'est le préfixe d'un autre.</p>
```

### Règle de séquencement

Si un concept B dépend du concept A pour être compris, A doit apparaître **en premier dans le chapitre**, pas simultanément ni après.

**❌ Incorrect — terme B suppose la connaissance de A non encore défini :**
```html
<p>Le nœud feuille dans l'arbre de Huffman reçoit le code le plus long.</p>
<!-- "nœud feuille", "arbre de Huffman" : deux termes non encore introduits -->
```

**✅ Correct — introduction progressive :**
```html
<p>Un <strong>arbre de Huffman</strong> est une structure en branches où chaque bifurcation représente un choix binaire. Les éléments terminaux de cet arbre — les <strong>nœuds feuilles</strong> — correspondent chacun à un symbole du code.</p>
```

### Test de relecture

Avant de finaliser un chapitre, relire séquentiellement et demander : "est-ce que le lecteur dispose déjà de tous les concepts nécessaires pour comprendre cette phrase ?" Si non, réorganiser ou ajouter une définition en amont.

---

## Checklist Langue

- [ ] Termes techniques **anglais** avec explication à la première mention
- [ ] Termes techniques **français** introduits et définis avant d'être utilisés
- [ ] Concepts présentés dans l'ordre de dépendance (A avant B si B dépend de A)
- [ ] Aucun verbe en anglais dans le texte courant
- [ ] Aucun mot courant en anglais (données/fichier/sortie — pas data/file/output)
- [ ] Noms propres (technologies, langages) sans traduction
- [ ] Utilisation cohérente du "vous" formel
- [ ] **Tirets cadratins (—) : INTERDIT dans les titres (`<h2>`, `<h3>`) → utiliser `:`**
- [ ] **Tirets cadratins (—) dans le texte : uniquement en fin de phrase** — jamais pour encadrer une incise
