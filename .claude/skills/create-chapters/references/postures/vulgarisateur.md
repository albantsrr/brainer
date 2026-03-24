# Posture : Vulgarisateur

## Quand utiliser

Chapitres où le contenu ne relève ni de l'ingénierie technique pure ni du formalisme mathématique : data engineering, management, économie, sciences, design, méthodologies, bonnes pratiques professionnelles, ou tout domaine hybride.

Également approprié pour les chapitres d'introduction d'un livre technique, les chapitres de contexte/motivation, ou tout contenu qui doit être accessible à un public large.

---

## Ton et registre

Adopter la posture d'un **expert qui vulgarise** : traduire la complexité en clarté sans trahir la précision.

- Parler à un lecteur intelligent sans prérequis spécialisés.
- **Zéro jargon non expliqué** — chaque terme technique est défini à la première mention.
- Registre : "concrètement", "en d'autres termes", "l'idée clé ici".
- **Test :** si une phrase nécessite d'en connaître une autre pour être comprise, les réordonner.

## Direction obligatoire

**Concret et familier → abstrait et général.**

Partir de ce que le lecteur connaît déjà, progresser vers ce qui est nouveau.

---

## Principes

**1. Reformulation totale** — Chaque concept exprimé avec ses propres mots. Aucune phrase copiée.

**2. Mécanisme central préservé** — Ne jamais supprimer une explication du *pourquoi*. Réduire le contexte, pas la profondeur.

**3. Exemple plus simple que le concept** — L'exemple doit être compréhensible sans connaissance du domaine. Si l'exemple nécessite d'expliquer son propre contexte, il est trop complexe.

**4. Causalité, pas description** — "parce que", "c'est pourquoi", "cela implique que".

**5. Une idée par phrase** — Jamais deux concepts formels dans une même phrase.

---

## Vocabulaire et terminologie

Quand un terme technique est introduit :

1. Montrer le terme dans son contexte d'usage réel
2. Donner une définition opérationnelle ("c'est quoi concrètement")
3. Distinguer des termes proches ou confondus (ex: "latence ≠ débit", "ETL ≠ ELT")
4. Un exemple concret qui ancre le terme

---

## Diagrammes recommandés

| Concept | Type recommandé |
|---------|----------------|
| Processus / pipeline / workflow | `graph LR` |
| Architecture système / composants | `graph TD` |
| Séquence d'interactions | `sequenceDiagram` |
| Modèle de données / relations | `erDiagram` |
| Comparaison de valeurs | `xychart-beta` |
| Évolution dans le temps | `timeline` |

---

## Formulations

| ❌ Style manuel | ✅ Style vulgarisateur |
|---|---|
| "Le data lake constitue un réceptacle centralisé pour le stockage de données brutes hétérogènes." | "Un data lake, c'est un endroit unique où on stocke toutes les données brutes — peu importe leur format. L'idée : on collecte d'abord, on organise ensuite." |
| "L'architecture orientée services découple les responsabilités." | "Au lieu d'un seul programme qui fait tout, on découpe en petits services indépendants. Si l'un tombe, les autres continuent." |
