# Fonctionnement Technique du Drag & Drop - Projet XCCM

Le système de **Glisser-Déposer** (Drag & Drop) est la fonctionnalité centrale de l'expérience utilisateur (IHM) de XCCM. Il permet aux enseignants de construire des cours de manière intuitive par manipulation directe.

---

## 1. Origine : La Bibliothèque de Connaissances
Dans le composant `StructureDeCours.tsx`, chaque élément (Cours, Section, Notion...) est rendu avec l'attribut HTML `draggable`.

### Le processus de départ (`onDragStart`) :
Lorsqu'un utilisateur commence à faire glisser un item, l'application exécute la logique suivante :
1.  **Récupération de la Hiérarchie** : La fonction `getItemWithHierarchy(itemId)` extrait non seulement l'item sélectionné, mais aussi tous ses enfants récursifs (ex: glisser une Section emporte tous ses Chapitres et Notions).
2.  **Encapsulation des Données** : Les données sont sérialisées en JSON.
3.  **Type MIME Personnalisé** : On utilise un type spécifique pour sécuriser le transfert :
    ```javascript
    e.dataTransfer.setData('application/xccm-knowledge', JSON.stringify(fullItem));
    ```

---

## 2. Destination : L'Éditeur Principal (MainEditor)
Le `MainEditor.tsx` (basé sur TipTap/ProseMirror) écoute l'événement de dépôt (`handleDrop`).

### Le processus de réception :
1.  **Interception** : L'éditeur vérifie la présence du type MIME `application/xccm-knowledge`.
2.  **Localisation** : `view.posAtCoords` calcule précisément où l'utilisateur a relâché la souris dans le texte pour insérer le contenu à l'endroit exact.
3.  **Reconstruction Sémantique (`buildNode`)** : C'est la phase la plus complexe. Une fonction récursive transforme le JSON en nœuds compatibles avec l'éditeur :
    *   **Mapping des types** : `course` devient `heading`, `section` devient un nœud personnalisé `section`, etc.
    *   **Traitement spécial pour les Notions** : Le titre est inséré comme un paragraphe, suivi du contenu HTML s'il existe.
    *   **Traitement pour les Exercices** : Les questions sont extraites et formatées en liste numérotée automatiquement.

---

## 3. Justifications IHM (Points clés pour le jury)

### A. Affordance et Manipulation Directe
*   **Concept** : L'utilisateur n'a pas besoin de remplir un formulaire complexe pour lier une notion à un cours.
*   **Bénéfice** : Réduction drastique de la **charge cognitive**. L'action physique de "déplacer" l'objet correspond au modèle mental de "construction".

### B. Feedback Visuel et Précision
*   **Drop Cursor** : Un curseur violet (`#a78bfa`) suit le mouvement dans l'éditeur pour indiquer exactement où l'élément sera inséré avant même que l'utilisateur ne lâche la souris.
*   **Feedback Immédiat** : Dès le dépôt, le contenu structuré apparaît avec son style propre (couleurs par niveau), validant instantanément le succès de l'opération.

### C. Préservation du Contexte
*   Contrairement à un simple copier-coller, le Drag & Drop de XCCM préserve la **hiérarchie sémantique**. Si vous glissez une section, l'IHM reconstruit toute l'arborescence interne automatiquement, garantissant la **robustesse** des contenus pédagogiques.
