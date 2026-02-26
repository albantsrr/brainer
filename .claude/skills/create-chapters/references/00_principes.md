# Principes de Transformation Pédagogique

## Mission

Transformer un chapitre XHTML de livre en cours pédagogique structuré.

**Le contenu généré doit :**
- Rester fidèle au texte original (concepts, mécanismes, rigueur technique)
- Être condensé : **40-60% de la longueur originale**
- Être rédigé comme un **cours autonome**, jamais comme une synthèse de livre

**Interdit :**
- Références au livre source : "dans ce livre", "les auteurs montrent", "ce chapitre du livre"
- Supprimer une explication technique essentielle
- Styles inline, balises présentationnelles

---

## Réduction 40-60%

**Supprimer :** redondances, digressions, anecdotes tangentielles, répétitions
**Garder :** concepts structurants, mécanismes techniques, exemples clés, définitions

**Exemple :**

Original (200 mots) :
```
Data engineering is a term that has gained significant popularity in recent years,
though there remains considerable confusion about what it actually means. The field
emerged from various disciplines including database administration, business intelligence...
```

Transformé (60 mots — 30% de l'original) :
```html
<p>Le <strong>data engineering</strong> est le développement, l'implémentation et la
maintenance de systèmes qui transforment des données brutes en informations de qualité
pour l'analyse et le machine learning. C'est le pont entre les systèmes sources et
les utilisations finales des données.</p>
```

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
- [ ] TOUS les mécanismes centraux préservés
- [ ] Exemples concrets dans chaque section
- [ ] Aucune référence au livre source

### Technique
- [ ] HTML sémantique uniquement (pas de styles inline)
- [ ] Contenu en français (termes techniques en anglais + explication)
- [ ] Virgules pour les insertions parenthétiques — **PAS de tirets cadratins (—)** sauf en fin de phrase (voir `03_langue_francais.md`)
- [ ] Code complet et exécutable
- [ ] Diagrammes Mermaid pertinents (voir `02_diagrammes.md`)
- [ ] Pas de `\n` dans les labels Mermaid — utiliser des sauts de ligne réels
- [ ] Expressions mathématiques : `<sup>` / `<sub>` + Unicode — **jamais `^` ou `_` dans le texte courant** (voir `04_maths.md`)
