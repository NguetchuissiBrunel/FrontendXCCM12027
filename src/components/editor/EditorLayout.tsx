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

import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
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
import { useAuth } from '@/contexts/AuthContext';
import ConfirmModal from '../ui/ConfirmModal';
import { CourseControllerService, CourseCreateRequest, CourseUpdateRequest } from '@/lib';
import EditorEntranceModal from './EditorEntranceModal';
import CreateCourseModal from '@/components/create-course/page';


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
  const [courseCategory, setCourseCategory] = useState<string>("Informatique");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [courseDescription, setCourseDescription] = useState<string>("");
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);

  const { user } = useAuth();

  // State to store editor instance
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  // Modal state for save/publish confirmation
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    type: 'save' | 'publish' | null;
  }>({ isOpen: false, type: null });

  const [isEntranceModalOpen, setIsEntranceModalOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const searchParams = useSearchParams();

  // Handle initialization from query params
  useEffect(() => {
    const isNew = searchParams.get('new') === 'true';
    if (isNew) {
      const title = searchParams.get('title');
      const category = searchParams.get('category');
      const description = searchParams.get('description');

      if (title) setCourseTitle(title);
      if (category) setCourseCategory(category);
      if (description) setCourseDescription(description);

      setIsEntranceModalOpen(false);
    }
  }, [searchParams]);

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
  const editorRef = React.useRef<{ handleTOCAction: (action: 'rename' | 'delete' | 'move', itemId: string, newTitle?: string | any) => void }>(null);

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
      if (!silent) toast.error("L'éditeur n'est pas encore chargé.");
      return;
    }

    if (!user) {
      if (!silent) toast.error("Vous devez être connecté pour sauvegarder votre cours.");
      return;
    }

    const jsonContent = editorInstance.getJSON();

    try {
      if (currentCourseId) {
        // Update existing course
        const updateData: CourseUpdateRequest = {
          title: courseTitle.trim() || "Cours sans titre",
          content: jsonContent as any,
          category: courseCategory.trim() || "Informatique",
          description: courseDescription.trim() || "Description du cours",
        };

        await CourseControllerService.updateCourse(currentCourseId, updateData);

        // Update status if publish is requested
        if (publish) {
          await CourseControllerService.updateCourseStatus(currentCourseId, 'PUBLISHED');
        }

        if (!silent) toast.success(publish ? "Cours publié avec succès !" : "Cours mis à jour !");
      } else {
        // Create new course
        const createData: CourseCreateRequest = {
          title: courseTitle.trim() || "Cours sans titre",
          content: jsonContent as any,
          category: courseCategory.trim() || "Informatique",
          description: courseDescription.trim() || "Description du cours",
        };

        const response = await CourseControllerService.createCourse(user.id, createData);

        // Standardize response extraction based on OpenAPI output (ApiResponseCourseResponse)
        const responseData = (response as any).data || response;
        const createdCourseId = responseData?.id;

        if (createdCourseId) {
          setCurrentCourseId(createdCourseId);

          // Publish if requested
          if (publish) {
            await CourseControllerService.updateCourseStatus(createdCourseId, 'PUBLISHED');
          }

          if (!silent) toast.success(publish ? "Cours publié avec succès !" : "Cours créé et sauvegardé !");
        } else {
          throw new Error("Impossible de récupérer l'ID du cours créé.");
        }
      }
    } catch (error: any) {
      console.error("Erreur sauvegarde :", error);
      const message = error?.response?.data?.message || error?.message || "Erreur de communication avec le serveur.";
      if (!silent) toast.error(`Échec de la sauvegarde : ${message}`);
    }
  };

  const triggerSaveConfirm = (isPublish: boolean) => {
    setConfirmConfig({ isOpen: true, type: isPublish ? 'publish' : 'save' });
  };

  const handleConfirmedAction = () => {
    if (confirmConfig.type === 'publish') {
      handleSave(true);
    } else if (confirmConfig.type === 'save') {
      handleSave(false);
    }
    setConfirmConfig({ isOpen: false, type: null });
  };

  const handleCreateCourse = (data: { title: string; category: string; description: string }) => {
    setCourseTitle(data.title);
    setCourseCategory(data.category);
    setCustomCategory(["Informatique", "Mathématiques", "Physique", "Langues"].includes(data.category) ? "" : data.category);
    setCourseDescription(data.description);
    setCurrentCourseId(null);
    if (editorInstance) {
      editorInstance.commands.setContent('');
    }
    setIsCreateModalOpen(false);
    toast.success("Nouveau cours initialisé !");
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
      {/* Entrance Modal */}
      <EditorEntranceModal
        isOpen={isEntranceModalOpen}
        onClose={() => setIsEntranceModalOpen(false)}
        onCreateNew={() => {
          setIsEntranceModalOpen(false);
          setIsCreateModalOpen(true);
        }}
        onModifyExisting={() => {
          setIsEntranceModalOpen(false);
          setActivePanel('author'); // Open 'Mes Cours' panel
        }}
      />

      {/* Course Creation Modal */}
      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCourse}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false, type: null })}
        onConfirm={handleConfirmedAction}
        title={confirmConfig.type === 'publish' ? 'Publier le cours' : 'Sauvegarder le cours'}
        message={confirmConfig.type === 'publish'
          ? 'Êtes-vous sûr de vouloir publier ce cours ? Il sera visible par tous les étudiants.'
          : 'Voulez-vous enregistrer les modifications actuelles ?'
        }
        confirmText={confirmConfig.type === 'publish' ? 'Publier maintenant' : 'Enregistrer'}
        type={confirmConfig.type === 'publish' ? 'info' : 'warning'}
      />
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      Titre du cours
                    </label>
                    <input
                      type="text"
                      className="w-full text-sm py-2 px-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded outline-none focus:border-purple-500 transition-colors"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      Catégorie
                    </label>
                    <select
                      className="w-full text-sm py-2 px-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded outline-none focus:border-purple-500 transition-colors"
                      value={["Informatique", "Mathématiques", "Physique", "Langues"].includes(courseCategory) ? courseCategory : "Autre"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Autre") {
                          setCourseCategory("Autre");
                          setCustomCategory("");
                        } else {
                          setCourseCategory(val);
                        }
                      }}
                    >
                      <option value="Informatique">Informatique</option>
                      <option value="Mathématiques">Mathématiques</option>
                      <option value="Physique">Physique</option>
                      <option value="Langues">Langues</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  {!["Informatique", "Mathématiques", "Physique", "Langues"].includes(courseCategory) && (
                    <div className="animate-in slide-in-from-top-1 duration-200">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                        Nom de la catégorie
                      </label>
                      <input
                        type="text"
                        placeholder="Saisissez une catégorie..."
                        className="w-full text-sm py-2 px-3 border-b-2 border-purple-400 bg-purple-50/30 dark:bg-purple-900/10 outline-none focus:border-purple-600 transition-colors"
                        value={courseCategory === "Autre" ? customCategory : courseCategory}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomCategory(val);
                          setCourseCategory(val || "Autre");
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      className="w-full text-sm py-2 px-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded outline-none focus:border-purple-500 transition-colors resize-none"
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      placeholder="Résumé du cours..."
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => triggerSaveConfirm(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                      <FaSave /> Sauvegarder les infos
                    </button>
                  </div>
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
                onLoadCourse={(content, courseId, title, category, description) => {
                  if (editorInstance) {
                    editorInstance.commands.setContent(content);
                    setCurrentCourseId(Number(courseId));
                    setCourseTitle(title);
                    setCourseCategory(category);
                    setCustomCategory(["Informatique", "Mathématiques", "Physique", "Langues"].includes(category) ? "" : category);
                    setCourseDescription(description);
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
              onClick={() => triggerSaveConfirm(false)}
              className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Sauvegarder"
            >
              <FaSave className="text-xl" />
            </button>
            <button
              onClick={() => triggerSaveConfirm(true)}
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