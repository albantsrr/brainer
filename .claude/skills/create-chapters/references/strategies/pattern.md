# Stratégie : Pattern

## Quand utiliser

Le contenu présente un **pattern de conception, une abstraction architecturale, ou une solution réutilisable** à un problème récurrent. Le lecteur doit comprendre non seulement le pattern, mais POURQUOI il existe.

**Signaux :** "pattern", "design pattern", "architecture", "abstraction", "découplage", "encapsulation", noms de patterns (Observer, Factory, MVC, pub/sub).

---

## Séquence pédagogique

### 1. La douleur SANS le pattern
Montrer un code ou une architecture qui souffre d'un problème concret : duplication, couplage fort, fragilité, rigidité. **La douleur doit être palpable.**

### 2. Diagnostic précis
Identifier exactement ce qui ne va pas et pourquoi. Nommer le problème en termes concrets.
> "Chaque fois qu'on ajoute un nouveau format d'export, il faut modifier 4 fichiers. Si on oublie un fichier, le système casse silencieusement."

### 3. Le pattern comme réponse
Introduire le pattern comme solution directe à cette douleur spécifique. Le lecteur doit voir le lien causal : "ce problème → ce pattern".

### 4. Le même exemple, résolu
Réécrire le même cas avec le pattern appliqué. Le gain doit être **immédiat et visible** — moins de code, moins de couplage, plus de flexibilité.

### 5. Quand NE PAS utiliser
Indiquer les situations où le pattern est du sur-engineering. Un pattern sans douleur est une complication gratuite.

---

## Piège à éviter

**Présenter le pattern en abstrait avec un diagramme UML avant que le lecteur comprenne le problème.**

Sans la douleur, la solution semble artificielle. Le lecteur se demande "pourquoi tant de complexité ?" au lieu de "ah, ça résout mon problème !".

---

## Exemple d'application

**Sujet :** Le pattern Observer

1. **Douleur :** Un système de notifications où chaque composant vérifie manuellement si l'état a changé — polling constant, code dupliqué, composants qui doivent se connaître mutuellement.
2. **Diagnostic :** Couplage fort — ajouter un nouveau composant qui réagit aux changements demande de modifier le composant source.
3. **Pattern :** "Au lieu que chaque composant demande 'ça a changé ?', le composant source prévient tous les intéressés automatiquement."
4. **Résolu :** Même système avec subscribe/notify — ajouter un nouveau listener = 1 ligne.
5. **Ne pas utiliser :** Quand il n'y a qu'un seul consommateur et que la relation est stable — le pattern ajoute de l'indirection sans gain.
