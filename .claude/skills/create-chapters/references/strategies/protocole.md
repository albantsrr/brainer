# Stratégie : Protocole

## Quand utiliser

Le contenu décrit une **communication entre entités** : protocoles réseau, échanges client-serveur, handshakes, API, communication inter-processus, échanges de messages.

**Signaux :** requête/réponse, client/serveur, messages, paquets, en-têtes, ports, sockets, séquences d'échanges.

---

## Séquence pédagogique

### 1. Scénario concret et familier
Choisir un scénario que le lecteur a vécu.
> "Vous tapez une URL dans le navigateur et la page s'affiche — que s'est-il passé entre ces deux instants ?"

### 2. Déroulé des échanges
Utiliser un `sequenceDiagram` Mermaid avec les messages réels. Chaque flèche = un message concret.

### 3. Explication de chaque message
Pour chaque échange : pourquoi il est nécessaire, que contient-il, que se passe-t-il si on l'omet.

### 4. Cas d'erreur
Montrer les scénarios de défaillance (timeout, perte de paquet, rejet, retransmission) et comment le protocole les gère. C'est ici que le lecteur comprend la robustesse du design.

---

## Piège à éviter

**Lister les champs d'un en-tête de protocole sans contexte.**

Le lecteur a besoin de VOIR le protocole en action avant de comprendre ses composants. Un en-tête HTTP n'a de sens que dans le contexte d'une requête réelle.

---

## Exemple d'application

**Sujet :** Le handshake TCP

1. **Scénario :** "Votre navigateur veut télécharger une page — avant d'envoyer la moindre donnée, il doit d'abord 'se présenter' au serveur."
2. **Déroulé :**
   ```
   sequenceDiagram
     Client->>Serveur: SYN (je veux parler)
     Serveur->>Client: SYN-ACK (ok, je t'écoute)
     Client->>Serveur: ACK (c'est parti)
   ```
3. **Explication :** Pourquoi 3 étapes et pas 1 ? Parce que chaque partie doit confirmer qu'elle peut recevoir — sinon on enverrait des données dans le vide.
4. **Erreur :** Que se passe-t-il si le SYN-ACK n'arrive jamais ? Timeout + retransmission. Et si quelqu'un envoie des milliers de SYN sans finir le handshake ? SYN flood — d'où les SYN cookies comme défense.

---

## Diagrammes recommandés

- Échanges entre entités → `sequenceDiagram` Mermaid (usage principal)
- Architecture réseau / composants → `graph TD` Mermaid
- Structure de paquet / en-tête → ASCII art dans `<pre><code>` sans classe
