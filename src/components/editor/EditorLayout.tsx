/**
 * EDITOR LAYOUT COMPONENT - WITH DARK MODE & REAL-TIME TOC
 * 
 * Main layout container for the XCCM editor.
 * Implements three-column layout: TOC (left) | Main Editor (center) | IconBar + Panels (right)
 * 
 * Now with real-time Table of Contents extraction from TipTap editor!
 * Dark mode support added matching rest of site (Navbar colors)
 * 
 * @author JOHAN
 * @date November 2025
 */

'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { 
  FaCloudUploadAlt, 
  FaInfo, 
  FaComments, 
  FaFolderOpen, 
  FaChalkboardTeacher, 
  FaCog,
  FaSave,
  FaPaperPlane,
  FaTimes
} from 'react-icons/fa';
import TableOfContents from './TableOfContents';
import MainEditor from './MainEditor';
import StructureDeCours from './StructureDeCours';
import { useTOC } from '@/hooks/useTOC';
import MyCoursesPanel from './MyCoursesPanel';

interface EditorLayoutProps {
  children?: React.ReactNode;
}

/**
 * Right panel types matching original implementation
 */
type RightPanelType = 'structure' | 'info' | 'feedback' | 'author' | 'worksheet' | 'properties' | null;

/**
 * EditorLayout Component
 * 
 * Layout structure:
 * - Header: Fixed top toolbar (64px height)
 * - Content: Three columns below header
 *   - Left: Table of Contents (288px fixed) - Now with real-time extraction!
 *   - Center: Main editor (flexible width)
 *   - Right: IconBar (64px fixed) + Panel (288px when open)
 */
export const EditorLayout: React.FC<EditorLayoutProps> = ({ children }) => {
  // State for active right panel
  const [activePanel, setActivePanel] = useState<RightPanelType>('structure');
  
  // State for course title and current course ID
  const [courseTitle, setCourseTitle] = useState<string>("Nouveau cours");
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);

  // State to store editor instance
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  
  // Extract TOC from editor in real-time
  const tocItems = useTOC(editorInstance, 300);
  
  // Handle TOC item click - scroll to node
  const handleTOCItemClick = (itemId: string) => {
    if (!editorInstance) return;
    
    // Find the node by data-id attribute
    const editorDom = editorInstance.view.dom;
    const element = editorDom.querySelector(`[data-id="${itemId}"]`);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Optional: Flash highlight or focus
    }
  };

  /**
   * Toggle panel - close if same icon clicked, switch if different
   */
  const togglePanel = (panelType: RightPanelType) => {
    if (activePanel === panelType) {
      setActivePanel(null); // Close if clicking same icon
    } else {
      setActivePanel(panelType); // Switch to new panel
    }
  };

  /**
   * IconBar Button Component
   */
  const IconButton = ({
    icon,
    label,
    panelType,
    colorClass = 'text-purple-600 dark:text-purple-400'
  }: {
    icon: React.ReactNode;
    label: string;
    panelType: RightPanelType;
    colorClass?: string;
  }) => {
    const isActive = activePanel === panelType;

    return (
      <button
        onClick={() => togglePanel(panelType)}
        className={`flex h-12 w-12 items-center justify-center rounded-lg transition-all ${isActive
          ? `${colorClass} bg-purple-100 dark:bg-purple-900`
          : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        title={label}
      >
        <span className="text-xl">{icon}</span>
      </button>
    );
  };

const handleSave = async (publish: boolean = false) => {
  if (!editorInstance) {
    alert("L'éditeur n'est pas encore chargé.");
    return;
  }

  const jsonContent = editorInstance.getJSON();

  const now = new Date();
  const savedCourse = {
    id: currentCourseId || Date.now().toString(),
    title: courseTitle.trim() || "Cours sans titre",
    content: jsonContent,
    html: editorInstance.getHTML(),
    published: publish,
    savedAt: now.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }), // e.g., "03/01/2026 14:35"
  };

  try {
    const existingCourses = JSON.parse(localStorage.getItem('xccm_saved_courses') || '[]');

    if (currentCourseId) {
      // Update existing
      const updated = existingCourses.map((c: any) =>
        c.id === currentCourseId ? savedCourse : c
      );
      localStorage.setItem('xccm_saved_courses', JSON.stringify(updated));
      alert(publish ? "Cours publié avec succès !" : "Cours mis à jour !");
    } else {
      // Create new
      existingCourses.push(savedCourse);
      localStorage.setItem('xccm_saved_courses', JSON.stringify(existingCourses));
      setCurrentCourseId(savedCourse.id);
      alert(publish ? "Cours publié avec succès !" : "Cours créé et sauvegardé !");
    }
  } catch (error) {
    console.error("Erreur sauvegarde :", error);
    alert("Erreur lors de la sauvegarde.");
  }
};

  return (
    <div className="mt-16 flex h-screen w-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* HEADER - Editor toolbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 px-6 shadow-md">
        {/* Left: Editable Title */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className="bg-transparent text-lg font-bold text-white outline-none border-b-2 border-transparent focus:border-white/50 transition-colors min-w-48"
            placeholder="Titre du cours..."
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleSave(false)}
            className="rounded bg-white dark:bg-gray-200 bg-opacity-20 dark:bg-opacity-30 px-4 py-1.5 text-sm font-medium text-black hover:bg-gray-100 dark:hover:bg-gray-300 transition-all">
            Sauvegarder
          </button>
          <button 
            onClick={() => handleSave(true)}
            className="rounded bg-white dark:bg-gray-200 px-4 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-800 hover:bg-gray-100 dark:hover:bg-gray-300 transition-all">
            Publier
          </button>
        </div>
      </header>

      {/* MAIN CONTENT - Three columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR - Table of Contents */}
        <aside className="w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
          <TableOfContents 
            items={tocItems}
            onItemClick={handleTOCItemClick}
          />
        </aside>

        {/* CENTER - Main Editor */}
        <main className="flex-1 overflow-hidden bg-white dark:bg-gray-900">
          <MainEditor
            initialContent="<p>Commencez à écrire votre contenu ici...</p>"
            onContentChange={(content) => console.log('Content changed:', content)}
            onEditorReady={(editor) => setEditorInstance(editor)}
          />
        </main>

        {/* RIGHT SECTION - IconBar + Panel */}
        <div className="flex">
          {/* Panel Area - Slides based on activePanel */}
          <div
            className={`overflow-y-auto border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ${activePanel ? 'w-72' : 'w-0 overflow-hidden'
              }`}
          >
            {/* PANEL 1: Structure de cours */}
            {activePanel === 'structure' && (
              <StructureDeCours onClose={() => setActivePanel(null)} />
            )}

            {/* PANEL 2: Infos */}
            {activePanel === 'info' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Infos</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Informations du cours à venir...
                </div>
              </div>
            )}

            {/* PANEL 3: Appréciations */}
            {activePanel === 'feedback' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Appréciations</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Commentaires et questions à venir...
                </div>
              </div>
            )}

            {/* PANEL 4: Mes Cours */}
            {activePanel === 'author' && (
              <MyCoursesPanel
                onClose={() => setActivePanel(null)}
                onLoadCourse={(content, courseId, title) => {
                  if (editorInstance) {
                    editorInstance.commands.setContent(content);
                    setCurrentCourseId(courseId);
                    setCourseTitle(title);
                  }
                }}
              />
            )}

            {/* PANEL 5: Travaux Dirigés */}
            {activePanel === 'worksheet' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Travaux Dirigés</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Feuilles de TD à venir...
                </div>
              </div>
            )}

            {/* PANEL 6: Propriétés */}
            {activePanel === 'properties' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Propriétés</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Propriétés du document à venir...
                </div>
              </div>
            )}
          </div>

          {/* Icon Bar - Always visible */}
          <div className="flex w-16 flex-col items-center gap-3 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-6">
            {/* Panel toggle icons */}
            <IconButton
              icon={<FaCloudUploadAlt />}
              label="Importer des connaissances"
              panelType="structure"
              colorClass="text-purple-600 dark:text-purple-400"
            />
            <IconButton
              icon={<FaInfo />}
              label="Infos"
              panelType="info"
              colorClass="text-blue-600 dark:text-blue-400"
            />
            <IconButton
              icon={<FaComments />}
              label="Appréciations"
              panelType="feedback"
              colorClass="text-green-600 dark:text-green-400"
            />
            <IconButton
              icon={<FaFolderOpen />}
              label="Mes Cours"
              panelType="author"
              colorClass="text-orange-600 dark:text-orange-400"
            />
            <IconButton
              icon={<FaChalkboardTeacher />}
              label="Travaux Dirigés"
              panelType="worksheet"
              colorClass="text-indigo-600 dark:text-indigo-400"
            />
            <IconButton
              icon={<FaCog />}
              label="Propriétés"
              panelType="properties"
              colorClass="text-gray-600 dark:text-gray-400"
            />

            {/* Spacer to push actions to bottom */}
            <div className="flex-1"></div>

            {/* Bottom action buttons
            <button 
              className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Sauvegarder"
            >
              <FaSave className="text-xl" />
            </button>
            <button 
              className="flex h-12 w-12 items-center justify-center rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
              title="Publier"
            >
              <FaPaperPlane className="text-xl" />
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;