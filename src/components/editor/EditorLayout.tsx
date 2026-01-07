/**
 * EDITOR LAYOUT COMPONENT - WITH DARK MODE & REAL-TIME TOC
 * 
 * Main layout container for the XCCM editor.
 * Implements three-column layout: TOC (left) | Main Editor (center) | IconBar + Panels (right)
 * 
 * Now with real-time Table of Contents extraction from TipTap editor!
 * Dark mode support added matching rest of site (Navbar colors)
 * 
 * @author ALD
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
import Navbar from '../layout/Navbar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseCreateRequest } from '@/lib';
import { CourseControllerService } from '@/lib/services/CourseControllerService';


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
  const [showSidebar, setShowSidebar] = useState(true);

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

  // Ref for MainEditor to handle imperative updates from TOC
  const editorRef = React.useRef<{ handleTOCAction: (action: 'rename' | 'delete', itemId: string, newTitle?: string) => void }>(null);

  // Ref for auto-save timer
  const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleTOCItemRename = (itemId: string, newTitle: string) => {
    if (editorRef.current) {
      editorRef.current.handleTOCAction('rename', itemId, newTitle);
    }
  };

  const handleTOCItemDelete = (itemId: string) => {
    if (editorRef.current) {
      editorRef.current.handleTOCAction('delete', itemId);
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

 const handleSave = async (publish: boolean = false, silent: boolean = false) => {
  
  if (!editorInstance) {
    if (!silent) alert("L'éditeur n'est pas encore chargé.");
    return;
  }

  const jsonContent = editorInstance.getJSON();

  // Payload conforme à CourseCreateRequest attendu par le backend
  const requestBody: CourseCreateRequest = {
    title: courseTitle.trim() || "Cours sans titre",
    category: "Informatique", // À rendre dynamique plus tard (ex: via un select)
    description: "Description à venir...", // Optionnel, à enrichir plus tard
    content: jsonContent, // TipTap JSON → stringifié
    //published: publish,
  };

  try {
    // Récupérer l'ID de l'auteur connecté (à adapter selon votre auth)
    
    const user = localStorage.getItem("currentUser"); // ← À remplacer par le vrai ID utilisateur
    console.log("Current user from localStorage:", user);
    const authorId = user ? JSON.parse(user).id : null;
    console.log("Author ID:", authorId);

    
    // Appel au service backend
    console.log("Saving course...", { publish, silent });
    const response = await CourseControllerService.createCourse(authorId, requestBody);
    alert('Sauvegarde réussie !');
    console.log("Réponse du backend :", response.data);
    
    // Succès : confirmation + mise à jour de l'ID courant
    // if (response?.data?.id) {
    //   setCurrentCourseId(response.data.id);
    // }

    // if (!silent) {
    //   alert(
    //     publish
    //       ? "Cours publié avec succès sur le serveur !"
    //       : "Cours sauvegardé avec succès sur le serveur !"
    //   );
    // }


  } catch (error: any) {
    console.error("Erreur lors de la sauvegarde sur le serveur :", error);

    if (!silent) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Impossible de contacter le serveur.";

      alert(`Échec de la sauvegarde : ${message}`);
    }
  }
};

  /**
   * Handle editor content change
   */
  const handleEditorChange = (content: string) => {
    // Determine title from content if needed? No, title is separate.

    // Debounced auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(false, true); // Auto-save, silent
    }, 2000); // 2 seconds debounce
  };

  return (

    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      {/* Navbar at the top */}
      <nav className="h-16 flex-none z-10">
        <Navbar />
      </nav>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar for TOC */}
        <aside
          className={`${showSidebar ? 'w-80' : 'w-0'
            } flex-none bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out relative z-0 print:hidden`}
        >
          <TableOfContents
            items={tocItems}
            onItemClick={handleTOCItemClick}
            onItemRename={handleTOCItemRename}
            onItemDelete={handleTOCItemDelete}
            onItemMove={(itemId, targetId, position) => {
              if (editorRef.current) {
                editorRef.current.handleTOCAction('move', itemId, { targetId, position });
              }
            }}
          />
        </aside>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={`absolute top-4 z-20 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ${showSidebar ? 'left-80' : 'left-0'
            }`}
          title={showSidebar ? 'Masquer la table des matières' : 'Afficher la table des matières'}
        >
          {showSidebar ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-100 dark:bg-gray-900 relative z-0 overflow-hidden">
          <MainEditor
            initialContent=""
            onContentChange={handleEditorChange}
            onEditorReady={(editor) => {
              setEditorInstance(editor);
            }}
            ref={editorRef}
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
            <div className="flex-1"></div>

            {/* Bottom action buttons */}
            <button
              onClick={() => handleSave(false)}
              className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Sauvegarder"
            >
              <FaSave className="text-xl" />
            </button>
            <button
              onClick={() => handleSave(true)}
              className="flex h-12 w-12 items-center justify-center rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
              title="Publier"
            >
              <FaPaperPlane className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>

  );
};

export default EditorLayout;