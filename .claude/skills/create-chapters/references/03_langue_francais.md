# Règles de Langue : Français

**Règle fondamentale : Français pour le texte courant, termes techniques en anglais avec explication.**

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

**Préférer les virgules pour les insertions parenthétiques** — ne pas utiliser les tirets cadratins (—) comme délimiteurs.

**❌ Incorrect (tirets comme parenthèses) :**
```html
<p>À travers l'histoire du code Morse — inventé pour la télégraphie au XIXe siècle — nous découvrirons ce qu'est un code.</p>
```

**✅ Correct (virgules) :**
```html
<p>À travers l'histoire du code Morse, inventé pour la télégraphie au XIXe siècle, nous découvrirons ce qu'est un code.</p>
```

**Règle :** Les tirets cadratins (—) sont autorisés uniquement pour introduire une explication directe ou un exemple en fin de phrase. Pour les incises et insertions parenthétiques au milieu d'une phrase, utiliser des virgules.

---

## Checklist Langue

- [ ] Termes techniques en anglais avec explication à la première mention
- [ ] Aucun verbe en anglais dans le texte courant
- [ ] Aucun mot courant en anglais (données/fichier/sortie — pas data/file/output)
- [ ] Noms propres (technologies, langages) sans traduction
- [ ] Utilisation cohérente du "vous" formel
- [ ] Virgules à la place des tirets cadratins pour les insertions parenthétiques
