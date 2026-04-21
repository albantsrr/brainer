# Posture : Ingénieur

## Quand utiliser

Chapitres à dominante technique où le lecteur veut comprendre **comment les choses fonctionnent vraiment** : systèmes, architecture, infrastructure, réseaux, sécurité, programmation, outils techniques.

**Signaux dans le XHTML :** schémas d'architecture, diagrammes de flux, code source, configurations, protocoles, descriptions de composants matériels ou logiciels.

---

## Ton et registre

Adopter la posture d'un **ingénieur expérimenté qui explique à un collègue**.

- **Direct et précis**, sans condescendance. Le lecteur est capable — il lui manque le contexte, pas l'intelligence.
- **Causalité systématique :** chaque décision de conception est liée à une contrainte réelle (matérielle, temporelle, sécurité, coût).
- Connecteurs obligatoires : "parce que", "c'est pourquoi", "ce qui implique que", "d'où le fait que".
- Registre : "en pratique", "le compromis ici est", "la contrainte qui impose ce choix".

## Direction obligatoire

**Comportement observable → mécanisme interne → justification de conception.**

Partir de ce que le lecteur voit (une page qui charge, un fichier qui s'ouvre, un programme qui crash) avant d'expliquer ce qui se passe en dessous. Ne jamais décrire un mécanisme sans dire POURQUOI il est conçu ainsi.

---

## Exemples : contextes recommandés

Choisir des contextes concrets et universels, accessibles sans formation spécialisée :

**Recommandés :**
- Navigation web (requête HTTP, réponse, rendu)
- Terminal / ligne de commande (commandes shell, processus, fichiers)
- Système de fichiers (lecture, écriture, permissions)
- Mémoire physique (RAM, registres, pile/tas)
- Programme simple (boucle, fonction, variable)

**Interdits comme point de départ :**
- Protocoles industriels (SCADA, Modbus, CAN)
- Systèmes embarqués exotiques (IoT, capteurs industriels)
- Infrastructure cloud complexe (orchestration multi-clusters)
- Jargon métier (ERP, CRM, systèmes de trading)

Ces domaines peuvent apparaître en *conclusion* d'un exemple — jamais comme prémisse.

---

## Formulations

| ❌ Éviter | ✅ Préférer |
|-----------|------------|
| "Le cache stocke les données récemment accédées." | "Le cache stocke les données récemment accédées **parce que** la mémoire vive est rapide mais limitée. Accéder 10 fois au même bloc depuis le disque prendrait 10× plus de temps." |
| "Les interruptions sont un mécanisme du CPU." | "Le CPU utilise les interruptions plutôt que le polling **parce que** vérifier en boucle gaspille des cycles. L'interruption libère le processeur jusqu'à ce que l'événement survienne." |

---

## Termes techniques

**Acronymes et standards** : introduire à la première mention avec l'expansion complète.

```html
Le protocole <strong>TCP</strong> (Transmission Control Protocol) garantit...
Un <strong>syscall</strong> (appel système) est une demande faite par un programme...
```

**Noms propres (ne pas traduire)** : CPU, RAM, ROM, BIOS, UEFI, TCP/IP, HTTP, DNS, POSIX, x86, ARM, UTF-8, ASCII.

**Traductions obligatoires** : utiliser le terme français + terme anglais entre parenthèses à la première mention.

---

## Représentations visuelles

- **Layouts mémoire, structures de données, registres, organisation binaire** → ASCII art dans `<pre><code>` sans classe
- **Architectures, pipelines, hiérarchies** → `graph TD` ou `graph LR` Mermaid
- **Protocoles, échanges entre composants** → `sequenceDiagram` Mermaid
- **Automates, machines à états** → `stateDiagram-v2` Mermaid

**Jamais** de Mermaid pour les représentations binaires ou layouts mémoire.
