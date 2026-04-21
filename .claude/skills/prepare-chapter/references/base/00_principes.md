# Principes de Transformation Pédagogique

## Mission

Créer un cours pédagogique **original dans sa formulation** sur un sujet technique.

Le chapitre XHTML est une **source d'information** (quels concepts enseigner), pas un texte à transformer. Il joue le rôle d'un livre de référence consulté par un enseignant pour préparer son cours.

**Le contenu généré doit :**
- Enseigner les mêmes concepts avec ses propres mots (reformulation, pas copie)
- Être rédigé comme si un enseignant expert écrivait son propre cours
- Être condensé : **60% de la longueur du source maximum**

**Interdit :**
- Copier ou paraphraser verbatim le texte du livre
- Réutiliser la structure de sections du livre
- Références au livre source : "dans ce livre", "les auteurs montrent"
- Styles inline, balises présentationnelles

---

## Reformulation — Règle Absolue

Les faits techniques, exemples et analogies du livre peuvent être conservés s'ils sont pédagogiquement pertinents, **à condition d'être réécrits avec ses propres mots**.

- **Code** : adapter les noms de variables et le scénario — jamais copier verbatim
- **Structure** : le plan du cours suit la logique pédagogique (voir `01_structure.md`), pas le plan du livre
- Si aucun exemple du livre n'est convaincant → en inventer un meilleur

---

## Registre du Langage — Règle Absolue

**Écrire comme un professeur qui parle à un élève, pas comme un manuel.**

### Une idée par phrase

Jamais deux concepts formels enchaînés dans une même phrase.

| ❌ Style manuel | ✅ Style professeur |
|---|---|
| "Le cache L1, intégré directement au cœur du processeur avec une latence d'accès de 1 ns et une capacité typique de 32 Ko, constitue le premier niveau d'une hiérarchie mémoire." | "Le cache L1 est le plus rapide de tous. Il est intégré directement au cœur du processeur — d'où sa latence de 1 ns. Sa contrepartie : une capacité minuscule, typiquement 32 Ko." |

### Explication simple avant notation formelle

Présenter l'idée en langage naturel **avant** d'introduire la notation technique. Signal d'alerte : une phrase contient plus de deux termes définis dans ce même chapitre → la couper.

---

## Qualité des Exemples Pédagogiques — Règle Absolue

**L'exemple doit être plus simple que le concept qu'il illustre. Jamais l'inverse.**

> Test : est-il compréhensible par quelqu'un qui ne sait rien des ordinateurs, réseaux ou protocoles ?

### Contextes autorisés
Objets du quotidien (lampe, pièce, dé, cartes), activités universelles (commander au restaurant, trier des t-shirts, compter sur ses doigts), jeux simples (devinettes oui/non, morpion).

### Contextes INTERDITS comme support d'exemple
Protocoles de communication, capteurs, IoT, domotique, bases de données, systèmes distribués, tout jargon que le lecteur est en train d'apprendre.

**Exception** : ces domaines peuvent apparaître en *conclusion* d'un exemple, comme application concrète une fois le concept compris — jamais comme point de départ.

### Test d'isomorphisme (pour les analogies d'introduction)

Avant d'utiliser une analogie comme accroche d'introduction ou d'une section, poser cette question :

**Peut-on remplacer chaque élément de l'analogie 1:1 par un élément du concept enseigné ?**

→ Si oui : c'est une définition circulaire déguisée en analogie. **La supprimer.**

| ❌ Analogie isomorphe | ✅ Point d'entrée valide |
|---|---|
| Vecteurs → carte + points cardinaux (est/nord = x/y, position = vecteur) | "Comment représenter d'un seul objet la direction ET l'intensité d'un son, d'une force, d'une couleur ?" |
| Probabilités → billes dans des urnes (urne = espace, bille = événement) | "Combien de fois sur 100 un médicament fonctionne-t-il — et comment être sûr que ce 70% n'est pas dû au hasard ?" |
| Graphes → réseau routier (ville = nœud, route = arête) | "Comment savoir si deux personnes sur un réseau social peuvent se contacter en moins de 6 intermédiaires ?" |

Règle pratique : si l'analogie *est* le concept renommé, préférer une **question qui motive le concept** ou une **application inattendue** qui montre son utilité avant de le définir.

### Arc narratif minimal

Un exemple court doit avoir trois temps :
1. **Situation de départ** : contexte universel, sans jargon
2. **Friction** : le problème ou la contrainte
3. **Résolution** : le concept à l'œuvre + bridge vers le domaine technique

### Règle du concept unique

Chaque exemple n'introduit qu'**un seul** concept nouveau à la fois.

### Rampe de difficulté (flow state)

Chaque section contient au minimum **2 exemples de difficulté croissante** :

1. **Exemple trivial** — Le lecteur doit pouvoir le résoudre mentalement. Il crée un sentiment de compétence ("j'ai compris").
2. **Exemple avec subtilité** — Introduit un cas limite, une exception, ou une nuance. Il crée une tension productive ("ah, c'est pas si simple").

Cette progression imite le **flow state** (Csikszentmihalyi) : la difficulté est juste au-dessus du niveau actuel de compétence. Trop facile → ennui. Trop dur → frustration.

| ❌ Pas de rampe | ✅ Rampe |
|---|---|
| Un seul exemple complexe qui tente de tout montrer | Ex.1 : "5 en binaire = 101" (trivial) → Ex.2 : "-5 en complément à deux = ?" (subtilité) |
| Deux exemples au même niveau de difficulté | Ex.1 : "Moyenne de [2, 4, 6]" (trivial) → Ex.2 : "Moyenne de [2, 4, 6, 1000]" (cas limite : l'outlier fausse tout) |

---

## Mécanismes Centraux — Règle d'Or

**Ne JAMAIS supprimer une explication technique essentielle.**

Un mécanisme central : décrit le fonctionnement interne, explique **pourquoi** quelque chose fonctionne, est essentiel pour résoudre des problèmes pratiques.

**Stratégie de réduction :**
1. Identifier les mécanismes centraux dans l'original
2. Préserver l'explication technique complète
3. Simplifier le langage (pas les concepts)
4. Supprimer répétitions et digressions

---

## Profondeur des Explications — Règle Absolue

Une explication superficielle **décrit**. Une explication profonde explique **pourquoi** et construit un modèle mental.

### Principe 1 : Analogie avant mécanisme (si utilisée)

Si une analogie est utilisée, la placer *avant* le mécanisme. **L'analogie n'est pas obligatoire** — pour un concept concret, une explication causale directe est plus efficace.

### Principe 2 : Causalité, pas description

Utiliser : "parce que", "c'est pourquoi", "cela implique que", "d'où le fait que".

| ❌ Superficiel | ✅ Profond |
|---|---|
| "Le cache stocke les données récemment accédées." | "Le cache stocke les données récemment accédées **parce que** la mémoire vive est rapide mais limitée. Accéder 10 fois au même bloc depuis le disque prendrait 10× plus de temps." |

### Principe 3 : Du simple au complexe

Commencer par le cas le plus simple sans exceptions, puis ajouter la complexité une couche à la fois.

### Principe 4 : Maximum 2 analogies par chapitre — règle absolue

**Plafond dur : 2 analogies** pour l'ensemble du chapitre, toutes sections confondues.

Test avant chaque analogie :
1. Le concept est-il suffisamment abstrait pour qu'une explication causale directe soit insuffisante ?
2. L'analogie apporte-t-elle un *cadre mental* nouveau, pas juste une métaphore décorative ?

→ Si l'une des réponses est "non" : **supprimer l'analogie**.

**La formule "Comme un X..." qui apparaît section après section est un signal d'échec.** Ne jamais utiliser le même domaine avec deux mappings différents dans le même chapitre.

---

## Checklist Qualité

### Structure
- [ ] Introduction présente (2-3 paragraphes, ton narratif, sans `<h2>`)
- [ ] Section "Mots-clés" présente si chapitre formel/mathématique (2-5 termes, définitions courtes)
- [ ] Section "Objectifs d'apprentissage" avec 3-6 objectifs actionnables
- [ ] Section "Pourquoi c'est important" avec impact concret
- [ ] Chaque section `<h2>` a un type identifié (Processus / Définition / Distinction / Théorème / Outil) et suit le template correspondant (voir `01_structure.md`)
- [ ] Chaque section a un `<h3>En pratique</h3>` ou `<h3>Le test décisif</h3>` (Distinction)
- [ ] Les types sont variés dans le chapitre (pas tous identiques)
- [ ] Section "Avant la synthèse" avec 2 questions de rappel actif
- [ ] Section "Synthèse" avec résumé structuré

### Contenu
- [ ] Longueur ≤ 60% de l'original
- [ ] Tous les mécanismes centraux couverts (formulations originales)
- [ ] Exemples concrets dans chaque section
- [ ] Aucune référence au livre source
- [ ] **Maximum 2 analogies dans l'ensemble du chapitre**

### Reformulation
- [ ] Aucun texte copié verbatim — chaque phrase est réécrite
- [ ] Exemples du livre reformulés (mise en situation différente)
- [ ] Code adapté ou réécrit (pas copié tel quel)
- [ ] Aucune section `<h2>` ne copie un titre du livre

### Registre
- [ ] Registre "professeur" — aucune phrase n'enchaîne deux concepts formels
- [ ] Chaque notation formelle précédée d'une explication en langage naturel

### Technique
- [ ] HTML sémantique uniquement (pas de styles inline)
- [ ] Jamais `<div style="...">` pour du code — uniquement `<pre><code>` sans attribut style
- [ ] Jamais `class="language-text"` — pour texte préformaté non-code : `<pre><code>` sans classe
- [ ] Classes de code autorisées : `language-python`, `language-c`, `language-bash`, `language-javascript`, `language-mermaid` uniquement
- [ ] Pas de `\n` dans les labels Mermaid — utiliser des sauts de ligne réels
