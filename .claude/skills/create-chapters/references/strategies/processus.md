# Stratégie : Processus

## Quand utiliser

Le contenu décrit un **workflow, un pipeline, une chaîne de traitement, ou une séquence d'étapes ordonnées**. Le lecteur doit comprendre le flux de bout en bout.

**Signaux :** "pipeline", "workflow", "étapes", "processus", "chaîne", diagrammes de flux, entrée → traitement → sortie.

---

## Séquence pédagogique

### 1. Vue d'ensemble en une phrase + diagramme
Donner la big picture avant les détails. Un `graph LR` simple qui montre le flux complet.
> "Les données passent par 3 étapes : ingestion → transformation → stockage."

### 2. Zoom sur chaque étape
Pour chaque étape :
- **Que reçoit-elle ?** (entrée)
- **Que fait-elle ?** (traitement)
- **Que produit-elle ?** (sortie)
- **Pourquoi est-elle nécessaire ?** (justification)

### 3. Exemple concret traversant le flux
Prendre des données réelles (ou réalistes) et les faire traverser chaque étape. Le lecteur suit la donnée de bout en bout.

### 4. Variantes et alternatives
Que change-t-on si le contexte est différent ? Quelles étapes sont optionnelles ? Quelles alternatives existent ?

---

## Piège à éviter

**Lister les étapes sans jamais expliquer POURQUOI cet ordre, ni montrer un exemple qui traverse tout le pipeline.**

Un processus sans donnée concrète qui le traverse est abstrait. Un processus sans justification d'ordre est une liste.

---

## Exemple d'application

**Sujet :** Pipeline ETL

1. **Vue d'ensemble :** Données brutes → Extract → Transform → Load → Base analytique
2. **Zoom :**
   - Extract : lit les données depuis les sources (API, fichiers, bases) → données brutes
   - Transform : nettoie, normalise, enrichit → données propres
   - Load : écrit dans la base cible → données requêtables
3. **Exemple :** "Un fichier CSV de ventes quotidiennes → extraction des colonnes pertinentes → conversion des dates au format ISO + calcul du TTC → insertion dans la table `sales`"
4. **Variantes :** ELT (charger d'abord, transformer dans la base), streaming (pas de batch)

---

## Diagrammes recommandés

- Flux principal → `graph LR` Mermaid
- Flux avec branches/conditions → `graph TD` Mermaid
- Interactions temporelles entre composants → `sequenceDiagram` Mermaid
