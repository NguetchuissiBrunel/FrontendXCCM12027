# IHM Improvements for XCCM Project

This plan addresses the specific requirements for project control, focusing on visual coherence, feedback, validations, accessibility, and reporting.

## Proposed Changes

### [Component] Modals & Forms
#### [MODIFY] [CreateCourseModal.tsx](file:///home/delmat/4GI%20NEW/SEMESTRE1/IHM/XCCM1/FrontendXCCM12027/src/components/create-course/page.tsx)
- Implement dynamic validation: show red borders and error messages if the title is too short or category is not selected.
- Disable the "Créer le cours" button until the form is valid.

### [Component] Editor
#### [MODIFY] [EditorLayout.tsx](file:///home/delmat/4GI%20NEW/SEMESTRE1/IHM/XCCM1/FrontendXCCM12027/src/components/editor/EditorLayout.tsx)
- Add Tooltips (using a simple custom tooltip or title attribute) for all sidebar icons to provide discrete contextual help.
- Ensure keyboard shortcuts for saving (Ctrl+S) and common actions are explicitly mentioned in UI.

#### [MODIFY] [StructureDeCours.tsx](file:///home/delmat/4GI%20NEW/SEMESTRE1/IHM/XCCM1/FrontendXCCM12027/src/components/editor/StructureDeCours.tsx)
- Add info icons next to filters to explain what "Granule", "Notion", etc., mean in the context of XCCM.

### [Component] Reports & Analytics
#### [MODIFY] [ProfileCard.tsx](file:///home/delmat/4GI%20NEW/SEMESTRE1/IHM/XCCM1/FrontendXCCM12027/src/components/professor/ProfileCard.tsx)
- Transform the "Statistiques par Cours" card list into a **clear table** as per instructions.
- Columns: Title, Category, Enrolled, Active, Participation Rate, Progress, Completed.

### [Component] Visual Coherence & Accessibility
#### [MODIFY] [globals.css](file:///home/delmat/4GI%20NEW/SEMESTRE1/IHM/XCCM1/FrontendXCCM12027/src/app/globals.css)
- Ensure focus rings are highly visible for keyboard navigation (`focus-visible:ring-2`).

## Verification Plan

### Automated Tests
- N/A (Build check only: `npm run build`)

### Manual Verification
1. **Validations**: Open "Créer un cours" modal. Try to click create without a title. Verify error message appears.
2. **Contextual Help**: Hover over editor icons. Verify tooltips appear.
3. **Table Reports**: Go to Prof Dashboard -> Profil -> Statistiques par Cours. Verify it is displayed as a table.
4. **Navigation**: Verify switching from dashboard to editor and back takes < 3 clicks.
5. **Accessibility**: Navigate through the app using ONLY the `Tab` key. Verify all interactive elements are reachable.
