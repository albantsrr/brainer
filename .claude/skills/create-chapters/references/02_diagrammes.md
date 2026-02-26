# Diagrammes Mermaid

**Règle fondamentale : la qualité prime sur la quantité. Objectif : 2-4 diagrammes par chapitre.**

---

## Quand Utiliser un Diagramme ?

**✅ Utiliser si :**
- Il illustre une **relation entre composants** plus clairement qu'un paragraphe
- Il montre un **flux ou séquence** dont l'ordre est critique pour la compréhension
- Il révèle une **structure hiérarchique** qui bénéficie d'une représentation visuelle
- Il synthétise les **concepts clés** d'une section ou du chapitre

**❌ Ne PAS créer si :**
- Il résume exactement ce qui vient d'être dit en texte (redondance pure)
- Il illustre un concept trivial qui tient en 1 phrase
- Il est là pour "remplir" une section sans valeur ajoutée

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
