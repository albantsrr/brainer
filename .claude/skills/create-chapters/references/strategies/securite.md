# Stratégie : Sécurité

## Quand utiliser

Le contenu traite de **vulnérabilités, attaques, mécanismes de défense, ou concepts de sécurité informatique**. Le lecteur doit comprendre la menace pour comprendre la défense.

**Signaux :** "vulnérabilité", "attaque", "injection", "authentification", "chiffrement", "buffer overflow", "privilege escalation", CVE, exploit.

---

## Séquence pédagogique

### 1. Attaque concrète simplifiée
Montrer une attaque sur un exemple simplifié mais réaliste. Le lecteur doit VOIR comment ça casse.
> "Voici un formulaire de login. Si on tape `admin' OR '1'='1` dans le champ mot de passe..."

### 2. Mécanisme exploité
Expliquer QUEL mécanisme est vulnérable et POURQUOI. Ce n'est pas magique — c'est une conséquence d'un choix de conception.
> "Le problème : le serveur construit la requête SQL en collant le texte de l'utilisateur directement. Le texte de l'utilisateur DEVIENT du code SQL."

### 3. Défense et son fonctionnement
Présenter la défense ET expliquer POURQUOI elle fonctionne — pas juste "utilisez X".
> "Les requêtes préparées séparent le code SQL des données. Le texte de l'utilisateur ne peut JAMAIS être interprété comme du code — il est traité comme une valeur littérale."

### 4. Vérification mentale
Rejouer l'attaque avec la défense en place pour que le lecteur voie concrètement que ça bloque.

---

## Piège à éviter

**"Utilisez des requêtes préparées" sans expliquer pourquoi ça marche.**

Une règle de sécurité sans compréhension du mécanisme sera contournée dès que le contexte change légèrement. Le lecteur doit comprendre le PRINCIPE, pas mémoriser la RECETTE.

---

## Exemple d'application

**Sujet :** Buffer overflow

1. **Attaque :** Un programme lit un nom d'utilisateur dans un buffer de 32 octets. On envoie 64 octets — les 32 derniers écrasent l'adresse de retour de la fonction.
2. **Mécanisme :** La pile mémoire stocke les variables locales ET l'adresse de retour côte à côte. Sans vérification de taille, écrire au-delà du buffer écrase l'adresse de retour → exécution de code arbitraire.
3. **Défense :** Canary (valeur sentinelle entre buffer et adresse de retour), ASLR (adresses aléatoires), NX bit (pile non exécutable). Chacun bloque un aspect différent de l'attaque.
4. **Vérification :** Avec un canary, l'écrasement est détecté avant le retour de fonction → le programme crash proprement au lieu d'exécuter le code malveillant.

---

## Diagrammes recommandés

- Layout mémoire (pile, buffer, adresses) → ASCII art dans `<pre><code>` sans classe
- Séquence d'attaque → `sequenceDiagram` Mermaid
- Architecture de défense → `graph TD` Mermaid
