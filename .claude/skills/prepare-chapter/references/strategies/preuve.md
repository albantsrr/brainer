# Stratégie : Preuve

## Quand utiliser

Le contenu contient une **démonstration mathématique, une preuve formelle, ou un raisonnement déductif structuré**. Le lecteur doit comprendre non seulement le résultat mais la logique qui y mène.

**Signaux :** "Preuve :", "Démonstration :", "montrons que", "supposons par l'absurde", "par récurrence", "CQFD", "□".

---

## Séquence pédagogique

### 1. Idée de la preuve (roadmap)
Résumer la stratégie en 1-2 phrases non formelles AVANT de commencer. Le lecteur doit savoir OÙ IL VA.
> "On va montrer que si c'était faux, on arriverait à une contradiction avec le fait que la somme des probabilités vaut 1."

### 2. Preuve formelle guidée
Dérouler la preuve avec justification de chaque étape. Chaque transition logique est expliquée :
- "Puisque A est vrai (par hypothèse)..."
- "On applique le théorème X (vu en section précédente)..."
- "Ce qui contredit l'hypothèse de départ..."

### 3. Interprétation concrète
Après la preuve, revenir au monde réel.
> "Ce qui veut dire concrètement que peu importe la distribution de départ, la moyenne de suffisamment d'échantillons sera toujours approximativement normale."

---

## Piège à éviter

**Preuve formelle sans aucune indication de direction.**

Le lecteur suit les symboles sans savoir où il va — c'est l'équivalent de suivre un GPS sans voir la carte. La roadmap en début de preuve change tout.

---

## Quand OMETTRE la démonstration

Si la preuve est purement mécanique (induction sans insight, calcul technique) et n'éclaire pas le concept :
- Résumer l'idée clé de la preuve
- Énoncer le résultat clairement
- Renvoyer à une référence pour la preuve complète

**Mieux vaut un théorème bien compris sans preuve qu'une preuve subie sans compréhension.**

---

## Exemple d'application

**Sujet :** Preuve que √2 est irrationnel

1. **Roadmap :** "On va supposer que √2 est rationnel (= une fraction) et montrer que cette hypothèse mène à une impossibilité."
2. **Preuve :** Si √2 = p/q (fraction irréductible), alors 2 = p²/q², donc p² = 2q². Donc p² est pair, donc p est pair. Si p = 2k, alors 4k² = 2q², donc q² = 2k², donc q est aussi pair. Contradiction : p et q ne peuvent pas être tous deux pairs si la fraction est irréductible.
3. **Interprétation :** "√2 n'est pas une fraction — il existe des nombres qui 'tombent entre' les rationnels. C'est ce constat qui a mené les Grecs à découvrir les irrationnels."
