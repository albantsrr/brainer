# Diagrammes Mermaid

**Règle absolue : un diagramme médiocre est pire qu'aucun diagramme.**

L'objectif n'est pas d'avoir des diagrammes — c'est d'aider le lecteur à comprendre. Un diagramme flou, trop chargé ou redondant avec le texte nuit à la lecture. **Zéro diagramme est une réponse valide.**

---

## Test de Qualité — Obligatoire Avant Tout Diagramme

Avant de créer un diagramme, répondre à ces 3 questions :

1. **Ce concept est-il nettement plus clair en visuel qu'en texte ?**
   Si on peut l'expliquer en 1-2 phrases limpides, pas de diagramme.

2. **Le diagramme sera-t-il compréhensible en moins de 5 secondes, sans relecture ?**
   Si le lecteur doit analyser la structure avant de comprendre, pas de diagramme.

3. **Le diagramme tient-il en ≤ 6 nœuds avec une structure simple ?**
   Si le concept nécessite 8+ nœuds ou des connexions croisées, il vaut mieux un texte structuré.

**Si la réponse à l'une de ces questions est non → supprimer le diagramme.**

**Anti-pattern fréquent :** créer un diagramme qui répète visuellement ce que le texte précédent vient d'expliquer. C'est une redondance inutile, pas une aide pédagogique.

---

## Quand Utiliser un Diagramme ?

**✅ Utiliser uniquement si le diagramme passe le test de qualité ci-dessus ET :**
- Il illustre une **relation entre composants** impossible à décrire aussi clairement en texte
- Il montre un **flux ou séquence** dont l'ordre est critique et difficile à suivre sans visuel
- Il révèle une **structure hiérarchique** que le texte seul rendrait difficile à saisir

**❌ Ne PAS créer si :**
- Il résume ce qui vient d'être dit (redondance)
- Il illustre un concept trivial qui tient en 1 phrase
- Il est là pour "remplir" ou "décorer" une section
- Il nécessite une légende ou une explication pour être compris

---

## Contraintes de Taille

**CRITIQUE :** Les diagrammes larges (nombreux nœuds en horizontal) s'affichent en minuscule.

- **Max 6-8 nœuds** par diagramme
- **Préférer `graph TD`** (vertical) à `graph LR` (horizontal) pour les hiérarchies
- **Jamais plus de 3 nœuds en parallèle** sur la même ligne

**❌ Trop large, illisible :**
```
graph LR
    DE --> T1 --> T1a
    T1 --> T1b & T1c
    DE --> T2 --> T2a & T2b & T2c
    DE --> T3 --> T3a & T3b & T3c
```

**✅ Simplifié (détails en texte) :**
```html
<pre><code class="language-mermaid">
graph TD
    DE[Data Engineer]
    DE --> T1[Type 1 : SQL]
    DE --> T2[Type 2 : Big Data]
    DE --> T3[Type 3 : Full-stack]
</code></pre>
```

---

## Format

```html
<pre><code class="language-mermaid">
TYPE_DE_DIAGRAMME
    CONTENU
</code></pre>
```

**⚠️ Sauts de ligne dans les labels :** Ne jamais utiliser `\n` comme séquence d'échappement dans les labels Mermaid — utiliser des **sauts de ligne réels** dans le code source.

**❌ Incorrect (`\n` littéral) :**
```
graph LR
    A["Ligne 1\nLigne 2\nLigne 3"]
```

**✅ Correct (saut de ligne réel) :**
```
graph LR
    A["Ligne 1
Ligne 2
Ligne 3"]
```

---

## Types et Cas d'Usage

| Concept à Illustrer | Type Mermaid |
|---------------------|--------------|
| Architecture système | `graph TD/LR` |
| Flux de données / pipeline | `graph LR` |
| Communication entre services | `sequenceDiagram` |
| Modèle de données / classes | `classDiagram` ou `erDiagram` |
| États d'une application | `stateDiagram-v2` |
| Évolution historique | `timeline` |
| Hiérarchie / Organisation | `graph TD` |
| Distributions discrètes, histogrammes | `xychart-beta` |

### Flowchart (`graph TD/LR`)
```html
<pre><code class="language-mermaid">
graph TD
    A[Serveur Physique] --> B[Hyperviseur]
    B --> C[VM 1]
    B --> D[VM 2]
    B --> E[VM 3]
</code></pre>
```

```html
<pre><code class="language-mermaid">
graph LR
    Client[Client HTTP] -->|Requête| Nginx[Proxy Nginx]
    Nginx -->|Transmission| API[Backend FastAPI]
    API -->|Requête SQL| DB[(PostgreSQL)]
    DB -->|Données| API
    API -->|Réponse| Nginx
    Nginx -->|Réponse| Client
</code></pre>
```

### Sequence Diagram
```html
<pre><code class="language-mermaid">
sequenceDiagram
    participant Utilisateur
    participant API
    participant BD

    Utilisateur->>API: Requête
    API->>BD: Lecture
    BD-->>API: Données
    API-->>Utilisateur: Réponse
</code></pre>
```

### Class Diagram
```html
<pre><code class="language-mermaid">
classDiagram
    class Cours {
        +string slug
        +string titre
    }
    class Chapitre {
        +int cours_id
        +string contenu
    }
    Cours "1" --> "*" Chapitre : contient
</code></pre>
```

### State Diagram
```html
<pre><code class="language-mermaid">
stateDiagram-v2
    [*] --> Inactif
    Inactif --> Chargement: Action
    Chargement --> Succès: Réception
    Chargement --> Erreur: Échec
    Succès --> Inactif: Réinitialisation
</code></pre>
```

### ER Diagram
```html
<pre><code class="language-mermaid">
erDiagram
    COURS ||--o{ CHAPITRE : contient
    CHAPITRE ||--o{ EXERCICE : inclut

    COURS {
        int id PK
        string slug UK
        string titre
    }
</code></pre>
```

### XY Chart (histogrammes, distributions)
```html
<pre><code class="language-mermaid">
xychart-beta
    title "Fréquence des valeurs"
    x-axis ["A", "B", "C", "D", "E"]
    y-axis "Fréquence" 0 --> 100
    bar [30, 70, 50, 90, 40]
</code></pre>
```

**Usage :** données discrètes, comparaisons de fréquences, histogrammes. Pas de courbes continues.

---

### Timeline
```html
<pre><code class="language-mermaid">
timeline
    title Évolution du Déploiement
    1990-2000 : Serveurs Physiques : 1 app = 1 serveur
    2000-2010 : Machines Virtuelles : Hyperviseur
    2010-2015 : Conteneurs : Docker
    2015-2025 : Orchestration : Kubernetes
</code></pre>
```

---

## Esthétique — Règle Obligatoire

**Un diagramme moche n'aide pas.** Chaque diagramme DOIT utiliser des couleurs et des formes adaptées.

### classDef — Palette Standard

Toujours définir des classes pour distinguer visuellement les types de nœuds :

```
classDef primary   fill:#4A90D9,stroke:#2c6fad,color:#fff
classDef success   fill:#5BAD6F,stroke:#3d8b46,color:#fff
classDef warning   fill:#F5A623,stroke:#c47f00,color:#fff
classDef neutral   fill:#F0F0F0,stroke:#aaa,color:#333
classDef danger    fill:#E05C5C,stroke:#b03030,color:#fff
```

Appliquer avec `class NomNœud NomClasse` ou directement sur la déclaration :

```
A[Processeur]:::primary
B[(Mémoire)]:::neutral
```

### Formes de Nœuds — Choisir selon le sens

| Forme | Syntaxe | Utiliser pour |
|---|---|---|
| Rectangle | `[Texte]` | Composants, modules, données |
| Arrondi | `(Texte)` | Processus, étapes |
| Stade/Pill | `([Texte])` | États, modes |
| Losange | `{Texte}` | Décisions, conditions |
| Cercle | `((Texte))` | Points d'entrée/sortie |
| Cylindre | `[(Texte)]` | Bases de données, stockage |
| Hexagone | `{{Texte}}` | Préparations, configurations |

### Avant / Après — Exemple Complet

**❌ Sans style (gris, plat, illisible) :**
```
graph TD
    A[Encodeur] --> B[Canal]
    B --> C[Décodeur]
    C --> D[Message]
```

**✅ Avec style (clair, lisible, différencié) :**
```
graph TD
    classDef primary fill:#4A90D9,stroke:#2c6fad,color:#fff
    classDef neutral fill:#F0F0F0,stroke:#aaa,color:#333
    classDef success fill:#5BAD6F,stroke:#3d8b46,color:#fff

    A([Émetteur]):::primary -->|Encodage| B[/Signal/]:::neutral
    B -->|Transmission| C[/Signal/]:::neutral
    C -->|Décodage| D([Récepteur]):::success
```

### Règles Esthétiques Minimales

1. **Au moins 2 `classDef` différents** par diagramme si plus de 3 nœuds
2. **Labels sur les flèches** pour tous les flux importants (`-->|Requête|`)
3. **Formes variées** pour distinguer les types (processus ≠ données ≠ décision)
4. **Pas de nœuds génériques** : `[A]`, `[B]`, `[?]` sont interdits — chaque nœud a un label significatif

---

## Conventions de Nommage

### Langue : 100% Français
Tout le texte dans les nœuds et labels en français.
Exception : noms propres (PostgreSQL, FastAPI, HTTP, JSON, Docker...).

### Nœuds : Noms Communs
**✅** `Serveur`, `Base de données`, `Client`, `Processeur`
**❌** `Traite les données` (verbe conjugué dans un nœud)

### Labels (Flèches) : Noms d'Actions Courts (1-3 mots)
**✅** `Requête`, `Réponse`, `Transmission`, `Lecture`, `Écriture`
**❌** `Envoie`, `Reçoit` (verbes conjugués)
**❌** `L'utilisateur clique sur le bouton` (phrase complète)

### Avant / Après

**❌ Incorrect (franglais + verbes conjugués) :**
```
graph LR
    User[Utilisateur] -->|Click| UI[Interface]
    UI -->|Send Request| API[Backend]
    DB -->|Returns Data| API
```

**✅ Correct :**
```
graph LR
    Utilisateur -->|Action| Interface
    Interface -->|Requête| API[Backend]
    BD[(Base de données)] -->|Données| API
```
