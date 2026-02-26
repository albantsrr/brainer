# Principes de Transformation Pédagogique

## Mission

Créer un cours pédagogique **entièrement original** sur un sujet technique.

Le chapitre XHTML est fourni comme **source d'information** (pour comprendre quels concepts enseigner), **pas comme texte à transformer**. Il joue le même rôle qu'un livre de référence consulté par un enseignant pour préparer son cours.

**Le contenu généré doit :**
- Enseigner les mêmes concepts et mécanismes techniques
- Être rédigé comme si un enseignant expert écrivait son propre cours
- Utiliser des exemples, analogies et code **entièrement inventés**
- Ne laisser aucune trace de la structure, du style ou des formulations du livre source
- Être condensé : **40-60% de la longueur du source** (contrainte de concision, pas de fidélité)

**Interdit :**
- Paraphraser ou traduire le texte du livre (même librement)
- Reprendre les exemples, analogies ou métaphores du livre
- Réutiliser la structure de sections du livre
- Copier ou adapter du code présent dans le livre
- Références au livre source : "dans ce livre", "les auteurs montrent", "ce chapitre"
- Styles inline, balises présentationnelles

---

## Indépendance de la Source — Règle Absolue

Le livre est fermé. Le cours est écrit de mémoire, par un enseignant expert.

### Faits techniques et concepts

**Autorisé** : les faits (définitions, algorithmes, comportements système) ne sont pas protégeables par le droit d'auteur.
**Contrainte** : les exprimer avec ses propres mots, pas ceux du livre.

### Exemples et code

**INTERDIT** de reprendre ou adapter les exemples du livre.

Chaque exemple pratique, chaque extrait de code **DOIT être inventé de toutes pièces** pour servir le propos pédagogique.

Règles pour le code :
- Noms de variables, de fonctions, de fichiers : inventés (pas ceux du livre)
- Scénario illustré : différent de celui du livre (contexte, domaine différents)
- Si le livre trie des noms d'étudiants → inventer un tri sur des températures de capteurs

### Analogies et métaphores

**INTERDIT** de reprendre ou adapter les analogies du livre.

Règle pratique : si une analogie "vient naturellement" après avoir lu le livre → la rejeter et en inventer une autre dans un domaine différent.

### Structure et organisation

Le plan du cours n'a pas à suivre le plan du chapitre source.

Les sections `<h2>` sont définies par la logique pédagogique (voir `01_structure_chapitre.md`), pas par les titres de sections du livre.

---

## Qualité des Exemples Pédagogiques — Règle Absolue

**Règle centrale : l'exemple doit être plus simple que le concept qu'il illustre. Jamais l'inverse.**

### Test de l'exemple

Avant de valider un exemple, appliquer ce test :

> Est-il compréhensible par quelqu'un qui ne sait rien des ordinateurs, des réseaux ou des protocoles ?

Si l'exemple nécessite de comprendre un terme technique pour être suivi, il est raté.

### Contextes autorisés

Choisir des contextes que n'importe quel lecteur maîtrise déjà :

- **Objets du quotidien** : lampe allumée/éteinte, pièce de monnaie (pile/face), dé, jeu de cartes
- **Activités universelles** : choisir une glace (vanille/chocolat), commander au restaurant, jouer à pile ou face
- **Situations concrètes** : trier des t-shirts par couleur, compter sur ses doigts, décrire une météo
- **Jeux simples** : devinettes par oui/non, jeu de morpion, lancer de dé

### Contextes INTERDITS comme support d'exemple

Ne jamais utiliser ces domaines **comme contexte** d'un exemple, car ils nécessitent une formation préalable :

- Protocoles de communication, capteurs, IoT, domotique, réseaux industriels
- Bases de données, architectures logicielles, systèmes distribués
- Tout jargon technique que le lecteur est en train d'apprendre

**Exception autorisée :** ces domaines peuvent apparaître en *conclusion* d'un exemple, comme application concrète une fois le concept compris — jamais comme point de départ.

### Anti-patterns documentés

| ❌ Mauvais exemple | Pourquoi c'est raté |
|---|---|
| "Un protocole de communication entre capteurs industriels utilise des codes sur 4 bits" | Le lecteur doit comprendre "protocole", "capteur industriel" avant de saisir le concept |
| "Un système domotique identifie chaque capteur par un numéro binaire" | "Domotique" et "capteur" sont déjà du jargon technique |
| "Un système de gestion de stock utilise des codes pour indiquer l'état de chaque article" | "Gestion de stock" complexifie sans rien apporter au concept |

| ✅ Bon exemple | Pourquoi ça marche |
|---|---|
| "Avec 3 ampoules allumées/éteintes, on peut envoyer 8 messages différents à son voisin" | Tout le monde comprend une ampoule allumée ou éteinte |
| "Avec 2 questions oui/non, vous pouvez décrire 4 menus de restaurant différents" | Le contexte (commander un repas) est universel |
| "Sur un dé à 6 faces, chaque résultat est une valeur distincte sur 3 bits (2³ = 8 > 6)" | Connu de tous, zéro jargon |

### Règle du concept unique

Chaque exemple n'introduit qu'**un seul** concept nouveau à la fois. Si l'exemple nécessite d'expliquer son propre contexte, il est trop complexe.

---

## Réduction 40-60%

**Supprimer :** redondances, digressions, anecdotes tangentielles, répétitions
**Garder :** concepts structurants, mécanismes techniques, exemples clés, définitions

**Exemple de la distinction :**

Source (livre) :
```
Data engineering is a term that has gained significant popularity in recent years,
though there remains considerable confusion about what it actually means. The field
emerged from various disciplines including database administration, business intelligence...
```

❌ **INTERDIT** — paraphrase traduite :
```
L'ingénierie des données est un terme qui a gagné en popularité ces dernières années,
bien qu'il reste une certaine confusion sur sa définition. Le domaine est issu de
plusieurs disciplines dont l'administration de bases de données...
```
→ C'est le texte du livre traduit et compressé.

✅ **AUTORISÉ** — cours original :
```html
<p>L'<strong>ingénierie des données</strong> désigne l'ensemble des pratiques permettant
de collecter, transformer et mettre à disposition des données exploitables. C'est le
maillon entre les systèmes qui produisent des données et ceux qui les consomment,
qu'il s'agisse de tableaux de bord, de modèles prédictifs ou de rapports métier.</p>
```
→ Même concept, formulation entièrement inventée par l'enseignant.

---

## Mécanismes Centraux — Règle d'Or

**Ne JAMAIS supprimer une explication technique essentielle.**

Un mécanisme central est une explication qui :
- Décrit le **fonctionnement interne** d'un système
- Explique **pourquoi** quelque chose fonctionne d'une certaine manière
- Est **essentiel** pour résoudre des problèmes pratiques ou comprendre les implications

**✅ Mécanisme central (à préserver) :**
```
"Le complément à deux est utilisé car il permet d'utiliser les mêmes circuits
d'addition pour les nombres positifs et négatifs, simplifiant la conception
des processeurs."
```
→ Explique le POURQUOI d'une décision technique fondamentale.

**❌ Anecdote (à supprimer) :**
```
"En 1964, lors d'une conférence à Stanford, plusieurs ingénieurs ont proposé
différentes représentations pour les nombres négatifs..."
```
→ Contexte historique intéressant mais non essentiel au mécanisme.

**Stratégie de réduction :**
1. Identifier les mécanismes centraux dans l'original
2. Préserver l'explication technique complète
3. Simplifier le langage (pas les concepts)
4. Supprimer répétitions et digressions autour du mécanisme

---

## Checklist Qualité

### Structure
- [ ] Introduction présente (2-3 paragraphes, ton narratif, sans `<h2>`)
- [ ] Section "Objectifs d'apprentissage" avec 3-6 objectifs actionnables
- [ ] Section "Pourquoi c'est important" avec impact concret
- [ ] Chaque section `<h2>` contient : Concept + Mécanisme + Exemple
- [ ] Section "Synthèse" avec résumé structuré
- [ ] Hiérarchie h2 → h3 respectée (pas de saut de niveau)

### Contenu
- [ ] Longueur réduite à 40-60% de l'original
- [ ] TOUS les mécanismes centraux couverts (avec formulations originales)
- [ ] Exemples concrets dans chaque section
- [ ] Aucune référence au livre source

### Anti-Plagiat
- [ ] Aucun exemple du livre repris ou adapté — tous les exemples sont inventés
- [ ] Aucune analogie ou métaphore du livre réutilisée
- [ ] Tout le code est écrit de zéro (noms, scénario, structure différents du livre)
- [ ] Aucune section `<h2>` ne copie un titre du livre
- [ ] La formulation serait méconnaissable comme dérivée d'un livre spécifique

### Technique
- [ ] HTML sémantique uniquement (pas de styles inline)
- [ ] Contenu en français (termes techniques en anglais + explication)
- [ ] Virgules pour les insertions parenthétiques — **PAS de tirets cadratins (—)** sauf en fin de phrase (voir `03_langue_francais.md`)
- [ ] Code complet et exécutable
- [ ] Diagrammes Mermaid pertinents (voir `02_diagrammes.md`)
- [ ] Pas de `\n` dans les labels Mermaid — utiliser des sauts de ligne réels
- [ ] Expressions mathématiques : `<sup>` / `<sub>` + Unicode — **jamais `^` ou `_` dans le texte courant** (voir `04_maths.md`)
