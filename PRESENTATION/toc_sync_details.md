# Synchronisation Table des Matières (TOC) & Éditeur - XCCM

La synchronisation bidirectionnelle entre la barre latérale (Table des Matières) et la zone d'édition centrale est un pilier de l'IHM de XCCM pour assurer une navigation fluide.

---

## 1. Flux : Éditeur → Table des Matières (Extraction)
Le système extrait la TOC en temps réel à chaque modification du cours.

### Le Hook `useTOC.ts`
1.  **Écoute d'événements** : Le hook s'abonne à l'événement `update` de l'éditeur TipTap.
2.  **Extraction JSON** : Le contenu structuré du document est récupéré via `editor.getJSON()`.
3.  **Analyse Récursive (`extractTOC.ts`)** : 
    *   L'utilitaire parcourt l'arbre JSON pour identifier les nœuds "Hiérarchie" (H1, sections, chapitres, notions).
    *   Il génère dynamiquement la numérotation (ex: 1.1.2) en fonction de la position relative des nœuds.
4.  **Optimisation (Debounce)** : Un délai de **300ms** est appliqué pour éviter de surcharger le processeur à chaque touche pressée, garantissant que l'IHM reste fluide.

---

## 2. Flux : Table des Matières → Éditeur (Navigation & Actions)
La TOC n'est pas qu'un affichage, c'est une télécommande pour le document.

### A. Navigation par clic (Scrolling)
Lorsqu'un utilisateur sélectionne un item dans la TOC :
1.  On récupère l'**ID unique** associé à l'item.
2.  L'application recherche l'élément correspondant dans le DOM de l'éditeur via le sélecteur `[data-id="..."]`.
3.  Un **défilement fluide** (`scrollIntoView({ behavior: 'smooth' })`) centre l'éditeur sur la section choisie.

### B. Actions Impératives (Renommer / Supprimer)
Si un utilisateur renomme ou supprime un chapitre directement depuis la barre latérale :
1.  **Communication par Ref** : `EditorLayout` appelle la fonction `handleTOCAction` exposée par le `MainEditor` via un `useImperativeHandle`.
2.  **Transaction ProseMirror** : L'éditeur parcourt son état interne pour trouver le nœud cible et applique une transformation atomique (mise à jour d'attribut ou suppression). 
3.  **Justification IHM** : Cela permet une gestion centralisée de la structure sans obliger l'utilisateur à chercher précisément l'endroit dans le texte pour faire des changements structurels.

---

## 3. Avantages IHM pour la soutenance
*   **Visibilité de l'état du système** : La TOC reflète instantanément la structure du cours, évitant à l'utilisateur de "se perdre" dans de longs documents.
*   **Contrôle utilisateur et Liberté** : La possibilité de restructurer le cours depuis la barre latérale offre une flexibilité maximale.
*   **Coopération entre vues** : Les deux colonnes travaillent de concert sur le même modèle de données JSON, assurant une **cohérence absolue**.
