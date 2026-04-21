# Analyse et Plan Pédagogique

## Pourquoi cette étape existe

La qualité d'un chapitre dépend des choix pédagogiques faits AVANT d'écrire : par quoi attaquer, quel fil conducteur, quels pièges anticiper. Sans planification explicite, ces choix sont faits implicitement et varient d'une génération à l'autre — d'où une qualité inconsistante.

**Cette étape est obligatoire.** Elle produit un plan structuré qui guide toute la génération. Le plan est affiché à l'utilisateur pour validation avant de continuer.

---

## Les 8 Questions du Plan Pédagogique

Après avoir lu le contenu source (XHTML), répondre à ces 8 questions **dans cet ordre**. Chaque réponse fait 2-4 phrases maximum.

### 1. Nœud de difficulté

> Quel est LE concept de ce chapitre que les lecteurs ratent le plus souvent ? Pourquoi est-il difficile ?

Identifier le point précis où l'incompréhension se produit. Ce n'est pas "le chapitre est dur" — c'est "tel mécanisme spécifique est contre-intuitif parce que...".

| ❌ Trop vague | ✅ Précis |
|---|---|
| "La mémoire virtuelle est un sujet complexe" | "Le lecteur confond espace d'adressage virtuel et mémoire physique — il pense que chaque processus a sa propre RAM dédiée" |
| "Les probabilités conditionnelles sont difficiles" | "Le lecteur inverse P(A\|B) et P(B\|A) — il confond la probabilité d'avoir la maladie sachant un test positif avec la fiabilité du test" |
| "Les design patterns sont abstraits" | "Le lecteur ne voit pas POURQUOI utiliser le pattern Observer — sans le problème concret de couplage, la solution semble artificielle" |

### 2. Porte d'entrée

> Par quoi commencer pour que le lecteur soit immédiatement engagé ?

Choisir UNE stratégie parmi :

- **Analogie concrète** — Une situation du quotidien qui capture l'essence du mécanisme (ex: "la mémoire virtuelle fonctionne comme une bibliothèque avec un bureau limité")
- **Problème motivant** — Une situation où l'absence du concept cause un problème réel (ex: "votre programme crash avec 'segfault' — pourquoi ?")
- **Contre-exemple surprenant** — Un résultat contre-intuitif qui crée la curiosité (ex: "un test fiable à 99% qui se trompe 9 fois sur 10")
- **Question provocante** — Une question dont la réponse intuitive est fausse (ex: "combien de mémoire utilise un processus de 4 Go sur une machine de 8 Go ?")

**Critère de choix :** La porte d'entrée doit être compréhensible SANS le concept qu'on va enseigner. Si elle nécessite des prérequis non acquis, choisir une autre stratégie.

### 3. Fil rouge

> Quelle question unique le chapitre résout-il progressivement ?

Le fil rouge est une question formulée en langage naturel qui traverse tout le chapitre. Chaque section y apporte un élément de réponse. Le lecteur sait à tout moment POURQUOI il lit cette section.

| ❌ Pas un fil rouge | ✅ Fil rouge |
|---|---|
| "Comprendre la mémoire virtuelle" (c'est un objectif, pas une question) | "Comment l'OS donne-t-il à chaque programme l'illusion d'avoir toute la mémoire pour lui ?" |
| "Les probabilités conditionnelles" (c'est un sujet) | "Pourquoi un test médical fiable peut-il donner un résultat trompeur ?" |
| "Étudier les arbres binaires" (c'est une activité) | "Comment stocker des données pour retrouver n'importe quel élément en quelques comparaisons ?" |

### 4. Prérequis implicites

> Quels concepts le livre suppose connus mais que le lecteur pourrait ne pas maîtriser ?

Lister les 2-5 concepts que le chapitre utilise sans les expliquer. Pour chacun, indiquer :
- Le concept
- Pourquoi il est nécessaire pour ce chapitre
- Comment le rappeler brièvement (1-2 phrases, pas un cours complet)

**Ne pas confondre avec les prérequis explicites** (les chapitres précédents). Ici on cherche les connaissances que le livre assume SANS les avoir enseignées.

### 5. Pièges d'intuition

> Où le lecteur va-t-il se tromper ? Quelles misconceptions faut-il anticiper ?

Lister les 2-4 erreurs de raisonnement les plus probables. Pour chaque piège :
- La misconception (ce que le lecteur croit à tort)
- Pourquoi c'est tentant de croire ça
- À quel moment du chapitre le piège doit être adressé

**Ces pièges doivent apparaître dans le contenu** — soit comme sections "Erreurs fréquentes", soit intégrés dans l'explication au moment pertinent.

### 6. Progression des sections

> Dans quel ordre présenter les concepts pour que chaque section s'appuie sur la précédente ?

Lister les 3-6 sections principales (`<h2>`) avec pour chacune :
- Titre provisoire
- **Type de section** : Processus / Définition / Distinction / Théorème / Outil (voir `01_structure.md` pour les templates)
- Ce que cette section apporte au fil rouge
- Ce qu'elle suppose acquis des sections précédentes

**Règle de variété :** vérifier que les types sont variés. Un chapitre avec toutes les sections en "Définition" est un signal d'alerte — certaines sections sont probablement mieux servies par un autre type.

**Règle de dépendance :** Si le concept B utilise le concept A, A doit être présenté avant B. Pas de références en avant ("nous verrons plus tard que...").

### 7. Moment eureka

> À quel moment du chapitre le lecteur passera de la confusion à la compréhension ? Quel est le déclic intellectuel ?

Le moment eureka est le point culminant pédagogique du chapitre. Il se prépare en deux temps :
1. **La tension** — les sections précédentes créent une question, un paradoxe, ou une incompréhension délibérée
2. **La résolution** — un exemple, une explication, ou une démonstration qui fait "clic"

| ❌ Pas un moment eureka | ✅ Moment eureka |
|---|---|
| "Le lecteur comprend la mémoire virtuelle" (trop vague) | "Quand le lecteur voit le schéma adresses virtuelles → table des pages → RAM physique, il réalise que l'adresse 0x1000 du processus A et l'adresse 0x1000 du processus B pointent vers des cases physiques différentes. Le même 'numéro de maison' dans deux quartiers différents." |
| "Le lecteur apprend le théorème de Bayes" (c'est un objectif) | "Quand le lecteur calcule que le test médical fiable à 99% se trompe 9 fois sur 10 pour une maladie rare, il réalise physiquement que fiabilité du test ≠ fiabilité du résultat. Le chiffre contre-intuitif crée le déclic." |

**Placement :** Le moment eureka se situe typiquement entre le 2ème et le 3ème tiers du chapitre — après avoir posé les bases, avant la synthèse. Indiquer dans quelle section il se produit.

### 8. Connexions (si chapter_order > 1)

> Quels concepts des chapitres précédents sont réutilisés, approfondis ou remis en question dans ce chapitre ?

Consulter les synopsis des 3 derniers chapitres et identifier :
- **Réutilisation** — un concept vu précédemment est utilisé comme outil (ex: "la notion d'adresse vue au ch.2 est essentielle pour comprendre les pointeurs au ch.3")
- **Approfondissement** — un concept simplifié est maintenant détaillé (ex: "le cache, mentionné au ch.4 comme 'mémoire rapide', est maintenant expliqué en détail")
- **Remise en question** — une simplification précédente est nuancée (ex: "au ch.1 on a dit que les processus sont isolés — en réalité, le shared memory permet des exceptions contrôlées")

Pour chaque connexion, indiquer comment la signaler au lecteur dans le contenu (rappel explicite, référence au chapitre, ou bridge dans l'introduction).

**Si chapter_order = 1 :** omettre cette question.

---

## Format de Sortie

Le plan pédagogique est affiché à l'utilisateur dans ce format exact :

```markdown
## Plan pédagogique : [Titre du chapitre]

**Posture :** [posture choisie] | **Stratégies :** [liste des stratégies]

**Nœud de difficulté :** [2-3 phrases]

**Porte d'entrée :** [Type choisi] — [Description en 2-3 phrases]

**Fil rouge :** "[La question en italique]"

**Prérequis implicites :**
- [Concept] — [Rappel prévu]
- ...

**Pièges d'intuition :**
1. [Misconception] → adressé dans [section]
2. ...

**Progression :**
1. [Section] — apporte [quoi au fil rouge]
2. [Section] — s'appuie sur [section précédente], apporte [quoi]
3. ...

**Moment eureka :** [Description du déclic] → se produit dans [section N]

**Connexions :** *(si chapitre > 1)*
- [Concept du ch.N] → [réutilisé/approfondi/remis en question] dans [section]
- ...
```

**Après affichage, attendre la validation de l'utilisateur avant de générer le contenu.**

---

## Exemples

### Bon plan — Chapitre "Mémoire virtuelle" (informatique, tier 1)

```markdown
## Plan pédagogique : La mémoire virtuelle

**Posture :** Ingénieur | **Stratégies :** mécanisme, pattern

**Nœud de difficulté :** Le lecteur confond espace d'adressage virtuel et
mémoire physique. Il pense que chaque processus a "sa propre RAM" alors que
la mémoire virtuelle est une abstraction — une table de correspondance entre
adresses fictives et emplacements réels.

**Porte d'entrée :** Problème motivant — "Vous lancez 3 programmes qui
demandent chacun 4 Go de RAM sur une machine de 8 Go. Pourtant, ça
fonctionne. Comment ?"

**Fil rouge :** "Comment l'OS donne-t-il à chaque programme l'illusion
d'avoir toute la mémoire pour lui seul ?"

**Prérequis implicites :**
- Adresse mémoire (qu'est-ce qu'un pointeur/adresse) — rappel en 1 phrase
  dans la section sur l'espace d'adressage
- Différence RAM/disque — rappel via l'analogie bureau/bibliothèque

**Pièges d'intuition :**
1. "Chaque processus a sa propre RAM physique" → adressé dès la section 1
   avec le schéma adresses virtuelles → physiques
2. "La mémoire virtuelle = le swap" → adressé en section 3, le swap est
   UNE conséquence, pas le mécanisme entier
3. "Plus de RAM virtuelle = meilleure performance" → adressé en erreurs
   fréquentes, le coût du page fault

**Progression :**
1. Le problème : plusieurs programmes, une seule mémoire — pose le fil rouge
2. L'espace d'adressage virtuel — chaque processus voit un espace privé
   (l'illusion)
3. La table des pages — le mécanisme de traduction (comment l'illusion
   fonctionne)
4. Le page fault et le swap — que se passe-t-il quand la RAM physique est
   pleine
5. Protection et isolation — pourquoi un programme ne peut pas lire la
   mémoire d'un autre

**Moment eureka :** Quand le lecteur voit le schéma adresse virtuelle →
table des pages → adresse physique, il réalise que l'adresse 0x1000 du
processus A et l'adresse 0x1000 du processus B pointent vers des cases
physiques différentes. → se produit dans la section 3

**Connexions :**
- Notion d'adresse mémoire (ch.1) → réutilisée comme fondation dans section 2
- Hiérarchie mémoire (ch.5) → approfondie : le swap ajoute un niveau
  supplémentaire à la hiérarchie
```

### Mauvais plan — les erreurs typiques

```markdown
❌ Nœud de difficulté vague :
"La mémoire virtuelle est un concept complexe qui demande de bien comprendre
le système d'exploitation."
→ Ne dit pas OÙ l'incompréhension se produit.

❌ Fil rouge absent :
"Ce chapitre couvre la mémoire virtuelle, la pagination et le swap."
→ C'est une table des matières, pas une question à résoudre.

❌ Progression sans dépendances :
"1. Mémoire virtuelle  2. TLB  3. Swap  4. Protection"
→ Pas de lien entre sections — on ne sait pas pourquoi cet ordre.

❌ Piège trop générique :
"Le lecteur pourrait ne pas comprendre la mémoire virtuelle"
→ Ne dit pas QUOI précisément il comprend mal.
```
