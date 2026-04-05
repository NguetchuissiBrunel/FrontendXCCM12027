# Réponses aux Questions du Jury - Projet XCCM (UE IHM)

Ce document récapitule les arguments théoriques et techniques pour répondre aux questions critiques du jury lors de la session de Questions-Réponses (10 min).

---

## 1. Choix de Conception IHM
### Comment garantissez-vous la cohérence visuelle ?
**Réponse :** Nous utilisons un **Design System** unifié. Les couleurs (HSL Tailored), la typographie (Inter/Outfit) et les composants (boutons, cartes) sont identiques entre l'espace de création de granules et l'éditeur de cours. Cela réduit la **charge cognitive** car l'utilisateur n'a pas à réapprendre l'interface.

### Quels principes fondamentaux d'IHM avez-vous privilégiés ?
**Réponse :** 
1. **Feedback utilisateur** : Chaque action (sauvegarde, drag-and-drop) déclenche un toast de confirmation.
2. **Affordance** : Les éléments interactifs sont visuellement explicites.
3. **Visibilité de l'état du système** : Indicateurs de statut (Brouillon/Publié) clairs.

---

## 2. Ergonomie et Utilisabilité
### Comment gérez-vous les erreurs dans vos formulaires ?
**Réponse :** Nous avons implémenté des **validations dynamiques explicites**. Les champs s'affichent en rouge avec des messages d'erreur immédiats (ex: "Titre requis") avant même la soumission. Cela respecte le principe de **prévention des erreurs**.

### Comment simplifiez-vous le workflow pédagogique ?
**Réponse :** Par la **navigation < 3 clics**. L'interface SPA (Single Page Application) permet de passer du tableau de bord à l'édition d'une granule de manière fluide, sans rechargement de page, minimisant les interruptions de tâche.

---

## 3. Accessibilité et Inclusion
### Comment répondez-vous aux normes d'accessibilité ?
**Réponse :** 
1. **Contraste élevé** : Respect des ratios de contraste pour les textes et les icônes.
2. **Navigation clavier** : Prise en charge complète de la touche `Tab` et ajout de raccourcis clavier (`Ctrl+S`).
3. **Sémantique HTML** : Utilisation de balises appropriées (h1, button, nav) pour les lecteurs d'écran.

---

## 4. Architecture Technique et Défis
### Pourquoi React/Next.js est-il pertinent pour l'IHM ?
**Réponse :** Pour la réactivité. L'interface réagit instantanément aux interactions utilisateur (mises à jour d'état atomiques), garantissant des **temps de chargement courts** et une sensation de fluidité propre aux applications modernes.

### Quel a été le défi du Drag & Drop ?
**Réponse :** Le défi était de maintenir la hiérarchie sémantique. Nous avons utilisé un payload JSON structuré lors du transfert pour que l'éditeur puisse reconstruire fidèlement les relations (Section -> Chapitre -> Notion) sans perte d'information.

---

## 5. Retours Utilisateurs (Tests réels)
### Quels ont été les résultats de vos tests utilisateurs ?
**Réponse :** Les tests avec les enseignants ont révélé un besoin de filtrage plus fin. Nous avons donc ajouté des outils de **filtrage efficaces** par catégorie dans la bibliothèque, améliorant la vitesse de récupération des granules existantes.

---

## 💡 Rappel pour le candidat
- **Présentez-vous** avant chaque réponse si vous n'avez pas parlé pendant la démo.
- Soyez **précis et argumenté** (utilisez les termes en gras).
- Si une limite est identifiée, proposez immédiatement une **piste d'amélioration future** (ex: collaboration temps réel).
