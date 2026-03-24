# Adaptation par Niveau de Difficulté

## Pourquoi cette adaptation existe

Un livre d'introduction pour débutants et une référence canonique pour experts ne s'enseignent pas de la même façon. Le même sujet (ex: les probabilités) demande des portes d'entrée, un ton, et une profondeur différents selon le public.

Le champ `difficulty` du cours en base de données (`debutant`, `intermediaire`, `avance`) détermine le niveau. **Cette information module le plan pédagogique (Step 3) et la génération (Step 4).**

---

## Débutant (difficulty = "debutant")

**Public :** Étudiants, reconvertis, personnes sans background dans le domaine. Aucun prérequis ne peut être assumé.

### Porte d'entrée
- **Toujours** une analogie du quotidien ou un problème concret universel
- Le lecteur doit comprendre la porte d'entrée SANS aucune connaissance technique
- Exemples : lancer un dé, commander au restaurant, trier des cartes, chercher un mot dans un dictionnaire

### Prérequis
- **Tout est expliqué.** Aucun concept n'est supposé connu
- Si un concept nécessaire a été vu dans un chapitre précédent, le rappeler brièvement (1-2 phrases)
- Si un concept vient d'un autre domaine (ex: algèbre de base pour des stats), inclure un encadré de rappel

### Exemples
- Simples, visuels, issus du quotidien
- Valeurs numériques petites (5 éléments, pas 1000)
- Montrer chaque étape de calcul/raisonnement — ne rien sauter
- Un seul exemple par concept (pas de variantes — le lecteur a besoin de clarté, pas de volume)

### Formalisme
- **Minimum.** L'intuition en langage naturel TOUJOURS avant la notation formelle
- Si une formule est nécessaire, la construire progressivement :
  1. D'abord en mots ("la somme de toutes les valeurs divisée par le nombre de valeurs")
  2. Puis en notation ("ce qui s'écrit : ...")
- Éviter les lettres grecques tant que possible — préférer des noms explicites

### Erreurs fréquentes
- Cibler les misconceptions de base ("la probabilité c'est le pourcentage de chances")
- Ton encourageant : "c'est une erreur très courante", pas "attention, piège"

### Ton
- Encourageant, bienveillant, zéro jargon non expliqué
- "Nous allons voir", "imaginons que", "essayons de"
- Phrases courtes, vocabulaire simple
- Le lecteur ne doit jamais se sentir stupide

---

## Intermédiaire (difficulty = "intermediaire")

**Public :** Professionnels juniors, étudiants avancés. Ils ont les bases mais manquent de profondeur et d'expérience pratique.

### Porte d'entrée
- Un **problème concret du métier** que le lecteur a pu rencontrer ou rencontrera bientôt
- Exemples : "votre pipeline de données tombe en panne tous les lundis", "votre modèle a une accuracy de 95% mais les utilisateurs se plaignent"

### Prérequis
- Les fondamentaux sont acquis — rappels brefs uniquement si le concept est contre-intuitif ou souvent mal compris
- Pas de rappel pour les concepts de base (ex: pas besoin de redéfinir ce qu'est une variable aléatoire dans un cours intermédiaire de stats)

### Exemples
- **Appliqués au domaine professionnel** — pas des dés ou des pièces, mais des datasets, des systèmes, des architectures
- Données réalistes (taille, format, contraintes)
- Montrer l'exemple complet PUIS les variantes importantes

### Formalisme
- Présent et motivé par le besoin ("pour quantifier cette intuition, on utilise...")
- Notation standard du domaine — le lecteur doit s'y familiariser
- Moins de construction progressive — donner la formule, puis l'expliquer

### Erreurs fréquentes
- Cibler les erreurs de mise en pratique ("utiliser une moyenne sur des données asymétriques")
- Inclure les erreurs de jugement professionnel ("choisir cette architecture sans considérer la scalabilité")

### Ton
- Direct, professionnel, respectueux
- "En pratique", "dans un contexte réel", "le compromis ici est"
- Le lecteur est compétent — il lui manque l'expérience, pas l'intelligence

---

## Avancé (difficulty = "avance")

**Public :** Professionnels expérimentés, profils seniors. Ils connaissent le domaine mais veulent approfondir, comprendre les nuances, et maîtriser les cas limites.

### Porte d'entrée
- Une **question conceptuelle**, une **limite d'approche connue**, ou un **cas contre-intuitif avancé**
- Exemples : "pourquoi l'approche fréquentiste échoue-t-elle pour les événements rares ?", "dans quelles conditions le théorème CAP est-il réellement contraignant ?"

### Prérequis
- **La maîtrise est assumée.** Aller droit au sujet sans rappels
- Si un concept avancé d'un autre chapitre est utilisé, une référence suffit ("comme vu au chapitre 3")
- Le lecteur connaît les outils — il veut comprendre POURQUOI ils fonctionnent et QUAND ils échouent

### Exemples
- **Cas limites, trade-offs, nuances**
- Montrer où l'approche standard échoue et quelle alternative utiliser
- Exemples issus de situations réelles complexes (systèmes distribués à l'échelle, datasets pathologiques)
- Comparer plusieurs approches sur le même problème

### Formalisme
- **Assumé et rigoureux.** La notation est l'outil principal, pas un complément
- Démonstrations incluses quand elles éclairent le concept (pas les preuves purement mécaniques)
- Conditions d'application et cas d'invalidité systématiquement mentionnés

### Erreurs fréquentes
- Cibler les **subtilités et fausses généralisations** ("ce théorème s'applique aux variables i.i.d. — pas aux séries temporelles")
- Erreurs de raisonnement avancé ("confondre corrélation et causalité même avec un modèle sophistiqué")

### Ton
- **Pair à pair**, discussion technique entre professionnels
- "On observe que", "il est intéressant de noter", "une subtilité importante"
- Pas de simplification excessive — le lecteur préfère la précision à l'accessibilité
- Reconnaître la complexité quand elle est réelle ("ce problème n'a pas de solution simple")

---

## Comment utiliser dans le workflow

### Step 1 : Récupérer le niveau
Lors de la récupération du cours (`GET /api/courses/{slug}`), lire le champ `difficulty`. Si absent ou null, utiliser `intermediaire` par défaut.

### Step 3 : Adapter le plan pédagogique
Le niveau influence directement les choix du plan :
- **Porte d'entrée** → type d'accroche (quotidien / professionnel / conceptuel)
- **Prérequis implicites** → quantité de rappels (tout / bref / aucun)
- **Pièges d'intuition** → type d'erreurs ciblées (base / pratique / avancé)
- **Progression** → rythme (lent et guidé / modéré / dense et direct)

### Step 4 : Adapter la génération
Le niveau influence le contenu généré :
- **Ton** et registre linguistique
- **Quantité de formalisme** et moment d'introduction
- **Type d'exemples** et leur complexité
- **Profondeur** des explications mécaniques
