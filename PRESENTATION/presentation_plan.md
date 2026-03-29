# Plan de Présentation du Projet XCCM (Interaction Homme-Machine)

Ce document constitue le guide de présentation pour le contrôle de projet. Il est conçu pour un groupe de **12 membres**, respectant les contraintes de temps et les critères de notation.

---

## ⏱️ Structure de la Session (40 min Total)
- **10 min :** Évaluation QCM individuelle (Compréhension théorique IHM).
- **20 min :** Démonstration fonctionnelle (SANS PowerPoint - Flux direct).
- **10 min :** Session de Questions-Réponses (Focus sur les membres ayant moins parlé).

---

## 🎤 Répartition des Paroles (20 min de Démo)

| Phase | Durée | Intervenants | Thèmes abordés |
| :--- | :--- | :--- | :--- |
| **Intro & Accès** | 2 min | Membres 1 & 2 | Présentation du groupe, Login, Rôles (Enseignant/Admin). |
| **Création de Granules** | 3 min | Membres 3 & 4 | Formulaires, aides contextuelles, validations dynamiques. |
| **Bibliothèque** | 3 min | Membres 5 & 6 | Filtres de recherche, catégories, charge cognitive faible. |
| **Éditeur (Assemblage)** | 5 min | Membres 7 & 8 | **Drag & Drop**, gestion de la hiérarchie, feedback visuel. |
| **Exercices & Notes** | 3 min | Membres 9 & 10 | Création d'exercices, interface de notation, reports. |
| **Vue Étudiant & Fin** | 4 min | Membre 11 & 12 | Accessibilité, navigation < 3 clics, résumé pré-validation. |

---

## 🛠️ Focus Technique Spécifique au Projet

### 1. Le Fonctionnement du Drag & Drop (Le "Cœur" de XCCM)
Le mécanisme repose sur une communication entre la **Bibliothèque** (Source) et le **MainEditor** (Cible) :
*   **Transfert de Données :** Lors du `onDragStart` dans la bibliothèque, nous encapsulons la donnée dans un type MIME personnalisé `application/xccm-knowledge`. Le payload est une chaîne **JSON** contenant l'ID, le type (Granule, Section, etc.) et le contenu html.
*   **Reconstruction Sémantique :** Lors du `handleDrop` dans l'éditeur (basé sur TipTap), le système parse le JSON et utilise un `buildNode` récursif pour transformer les données brutes en nœuds structurés.
*   **Justification IHM :** Ce processus simplifie drastiquement l'**affordance** de l'outil : "Je vois un contenu, je l'attrape, je le pose là où je veux qu'il apparaisse."

### 2. La Hiérarchie Pédagogique
XCCM impose une cohérence visuelle absolue via une structure fixe :
`Cours → Section → Chapitre → Paragraphe → Notion → Exercice`
*   Chaque niveau a une **couleur distincte** dans la bibliothèque (Bleu, Violet, Vert, Orange, Rouge, Indigo) pour aider la reconnaissance visuelle instantanée.

---

## 🧠 Réponses aux Questions Stratégiques

### Q1 : Comment minimisez-vous la charge cognitive ?
**Réponse :** À travers deux mécanismes clés : 
1. **L'organisation des menus** : On ne montre que ce dont l'enseignant a besoin à l'instant T (Single-select filters).
2. **Le feedback immédiat** : Les "Toasts" confirment chaque succès, évitant à l'utilisateur de se demander si sa modification a été prise en compte.

### Q2 : Justifiez vos choix de navigation (Règle des 3 clics).
**Réponse :** La navigation est horizontale et logique. Un enseignant peut :
*   1. Ouvrir la Bibliothèque.
*   2. Sélectionner son contenu.
*   3. Le glisser dans l'éditeur.
Tout se fait sur le même écran (**SPA - Single Page Application**), ce qui assure des transitions transparentes.

### Q3 : Comment avez-vous assuré la robustesse ?
**Réponse :** Par la **validation dynamique des formulaires**. Nous empêchons la soumission de données incohérentes (ex: exercice sans question ou cours sans titre) directement dans l'interface, avec des indicateurs visuels rouges explicites.

---

## ⚠️ Rappels Critiques pour le Jour J
1.  **S'identifier TOUJOURS** avant de prendre la parole ("Bonjour, je suis [Nom]...").
2.  **Vérifier le HDMI** et avoir **deux machines** prêtes avec les comptes de test déjà connectés.
3.  **Ne pas parler seul :** Si le jury voit qu'un membre est silencieux, il sera la cible principale du Q&A de 10 min.
4.  **Montrer, pas raconter :** Si vous dites que l'interface s'adapte, redimensionnez la fenêtre en direct pour montrer le côté "Responsive".
