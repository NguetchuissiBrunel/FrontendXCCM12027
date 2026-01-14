/**
 * EDITOR LAYOUT COMPONENT - WITH DARK MODE & REAL-TIME TOC
 * 
 * Main layout container for the XCCM editor.
 * Implements three-column layout: TOC (left) | Main Editor (center) | IconBar + Panels (right)
 * 
 * Now with real-time Table of Contents extraction from TipTap editor!
 * Dark mode support added matching rest of site (Navbar colors)
 * 
 * Features added:
 * - Exercise management panel
 * - Grading interface
 * - Real-time course editing
 * 
 * @author ALD
 * @date November 2025
 * @updated January 2026
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { toast } from 'react-hot-toast';
import {
  FaCloudUploadAlt,
  FaInfo,
  FaComments,
  FaFolderOpen,
  FaChalkboardTeacher,
  FaCog,
  FaSave,
  FaPaperPlane,
  FaTimes,
  FaGraduationCap,
  FaTasks,
  FaFileAlt,
  FaPlus,
  FaList,
  FaEye
} from 'react-icons/fa';
import TableOfContents from './TableOfContents';
import MainEditor from './MainEditor';
import StructureDeCours from './StructureDeCours';
import { useTOC } from '@/hooks/useTOC';
import MyCoursesPanel from './MyCoursesPanel';
import Navbar from '../layout/Navbar';
import { ChevronLeft, ChevronRight, BookOpen, CheckSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CourseControllerService, CourseCreateRequest, CourseUpdateRequest } from '@/lib';
import { ExerciseService } from '@/lib/services/ExerciseService';
import type { Exercise, Submission } from '@/types/exercise';

interface EditorLayoutProps {
  children?: React.ReactNode;
}

/**
 * Right panel types matching original implementation
 */
type RightPanelType = 'structure' | 'info' | 'feedback' | 'author' | 'worksheet' | 'properties' | 'exercises' | 'grading' | null;

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
  const [courseDescription, setCourseDescription] = useState<string>("");
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);

  // Exercise management states
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [gradingLoading, setGradingLoading] = useState(false);
  const [exerciseStats, setExerciseStats] = useState({
    total: 0,
    published: 0,
    pendingGrading: 0
  });

  const { user } = useAuth();

  // State to store editor instance
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  // Extract TOC from editor in real-time
  const tocItems = useTOC(editorInstance, 300);

  // Load exercises when course changes
  useEffect(() => {
    if (currentCourseId) {
      loadExercises();
      calculateExerciseStats();
    }
  }, [currentCourseId]);

  // Load submissions for grading
  useEffect(() => {
    if (selectedExercise?.id) {
      loadSubmissions(selectedExercise.id);
    }
  }, [selectedExercise]);

  const loadExercises = async () => {
    if (!currentCourseId) return;
    
    try {
      setExerciseLoading(true);
      const exercisesData = await ExerciseService.getCourseExercises(currentCourseId);
      setExercises(exercisesData || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast.error('Erreur de chargement des exercices');
    } finally {
      setExerciseLoading(false);
    }
  };

  const loadSubmissions = async (exerciseId: number) => {
    try {
      setGradingLoading(true);
      const submissionsData = await ExerciseService.getExerciseSubmissions(exerciseId);
      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Erreur de chargement des soumissions');
    } finally {
      setGradingLoading(false);
    }
  };

  const calculateExerciseStats = () => {
    const total = exercises.length;
    const published = exercises.filter(e => e.status === 'PUBLISHED').length;
    const pendingGrading = submissions.filter(s => !s.graded).length;
    
    setExerciseStats({ total, published, pendingGrading });
  };

  // Handle TOC item click - scroll to node
  const handleTOCItemClick = (itemId: string) => {
    if (!editorInstance) return;

    // Find the node by data-id attribute
    const editorDom = editorInstance.view.dom;
    const element = editorDom.querySelector(`[data-id="${itemId}"]`);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    colorClass = 'text-purple-600 dark:text-purple-400',
    disabled = false,
    badge
  }: {
    icon: React.ReactNode;
    label: string;
    panelType: RightPanelType;
    colorClass?: string;
    disabled?: boolean;
    badge?: number;
  }) => {
    const isActive = activePanel === panelType;

    return (
      <button
        onClick={() => !disabled && togglePanel(panelType)}
        disabled={disabled}
        className={`relative flex h-12 w-12 items-center justify-center rounded-lg transition-all ${isActive
          ? `${colorClass} bg-purple-100 dark:bg-purple-900`
          : disabled
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        title={disabled ? `Créer un cours d'abord pour ${label.toLowerCase()}` : label}
      >
        <span className="text-xl">{icon}</span>
        {badge && badge > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
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

  // Handle exercise actions
  const handleCreateExercise = () => {
    setEditingExercise({
      id: 0,
      courseId: currentCourseId!,
      title: '',
      description: '',
      maxScore: 20,
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'DRAFT',
      questions: []
    });
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    if (confirm('Supprimer cet exercice ?')) {
      try {
        await ExerciseService.deleteExercise(exerciseId);
        toast.success('Exercice supprimé');
        loadExercises();
      } catch (error) {
        toast.error('Erreur de suppression');
      }
    }
  };

  const handleSaveExercise = async (exercise: Exercise) => {
    try {
      if (exercise.id) {
        // Update existing exercise
        await ExerciseService.updateExercise(exercise.id, exercise);
        toast.success('Exercice mis à jour');
      } else {
        // Create new exercise
        await ExerciseService.createExercise(currentCourseId!, exercise);
        toast.success('Exercice créé');
      }
      setEditingExercise(null);
      loadExercises();
    } catch (error) {
      toast.error('Erreur de sauvegarde');
    }
  };

  const handleGradeSubmission = async (submissionId: number, score: number, feedback: string) => {
    try {
      await ExerciseService.gradeSubmission(submissionId, { score, feedback });
      toast.success('Soumission notée');
      if (selectedExercise) {
        loadSubmissions(selectedExercise.id);
      }
    } catch (error) {
      toast.error('Erreur de notation');
    }
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
            className={`overflow-y-auto border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ${activePanel ? 'w-96' : 'w-0 overflow-hidden'
              }`}
          >
            {/* PANEL 1: Structure de cours */}
            {activePanel === 'structure' && (
              <StructureDeCours onClose={() => setActivePanel(null)} />
            )}

            {/* PANEL 2: Infos */}
            {activePanel === 'info' && (
              <div className="p-4 h-full">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Infos du cours</h2>
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
                      value={courseCategory}
                      onChange={(e) => setCourseCategory(e.target.value)}
                    >
                      <option value="Informatique">Informatique</option>
                      <option value="Mathématiques">Mathématiques</option>
                      <option value="Physique">Physique</option>
                      <option value="Langues">Langues</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

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

                  {currentCourseId && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                        ID du cours
                      </div>
                      <div className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                        {currentCourseId}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => handleSave(false)}
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
              <div className="p-4 h-full">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Appréciations</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <div className="text-center py-8">
                    <FaComments className="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">Section en développement</p>
                    <p className="text-xs text-gray-400 mt-2">Les commentaires et questions arrivent bientôt</p>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 4: Mes Cours */}
            {activePanel === 'author' && (
              <div className="h-full">
                <MyCoursesPanel
                  onClose={() => setActivePanel(null)}
                  onLoadCourse={(content, courseId, title, category, description) => {
                    if (editorInstance) {
                      editorInstance.commands.setContent(content);
                      setCurrentCourseId(Number(courseId));
                      setCourseTitle(title);
                      setCourseCategory(category);
                      setCourseDescription(description);
                    }
                  }}
                />
              </div>
            )}

            {/* PANEL 5: Travaux Dirigés */}
            {activePanel === 'worksheet' && (
              <div className="p-4 h-full">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Travaux Dirigés</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <div className="text-center py-8">
                    <FaChalkboardTeacher className="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">Gestion des exercices</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Utilisez le panneau "Exercices" pour créer et gérer les travaux pratiques
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 6: Propriétés */}
            {activePanel === 'properties' && (
              <div className="p-4 h-full">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Propriétés</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <div className="text-center py-8">
                    <FaCog className="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">Paramètres avancés</p>
                    <p className="text-xs text-gray-400 mt-2">Configuration du cours</p>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 7: Gestion des exercices */}
            {activePanel === 'exercises' && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FaTasks /> Gestion des exercices
                    </h2>
                    <button
                      onClick={() => setActivePanel(null)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  {!currentCourseId ? (
                    <div className="text-center py-8">
                      <BookOpen className="text-4xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Chargez ou créez un cours pour gérer les exercices
                      </p>
                    </div>
                  ) : editingExercise ? (
                    <div className="flex-1 overflow-y-auto">
                      {/* Exercise Editor Component */}
                      <div className="p-2">
                        <h3 className="font-medium mb-4 dark:text-white">
                          {editingExercise.id ? 'Modifier l\'exercice' : 'Nouvel exercice'}
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium mb-1 dark:text-gray-300">
                              Titre
                            </label>
                            <input
                              type="text"
                              value={editingExercise.title}
                              onChange={(e) => setEditingExercise({...editingExercise, title: e.target.value})}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                              placeholder="Titre de l'exercice"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-1 dark:text-gray-300">
                              Description
                            </label>
                            <textarea
                              value={editingExercise.description}
                              onChange={(e) => setEditingExercise({...editingExercise, description: e.target.value})}
                              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                              rows={3}
                              placeholder="Instructions..."
                            />
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-xs font-medium mb-1 dark:text-gray-300">
                                Score max
                              </label>
                              <input
                                type="number"
                                value={editingExercise.maxScore}
                                onChange={(e) => setEditingExercise({...editingExercise, maxScore: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                              />
                            </div>
                            
                            <div className="flex-1">
                              <label className="block text-xs font-medium mb-1 dark:text-gray-300">
                                Statut
                              </label>
                              <select
                                value={editingExercise.status}
                                onChange={(e) => setEditingExercise({...editingExercise, status: e.target.value as any})}
                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                              >
                                <option value="DRAFT">Brouillon</option>
                                <option value="PUBLISHED">Publié</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <button
                              onClick={() => setEditingExercise(null)}
                              className="flex-1 px-4 py-2 border rounded dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleSaveExercise(editingExercise)}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              {editingExercise.id ? 'Mettre à jour' : 'Créer'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 grid grid-cols-3 gap-2">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-center">
                          <div className="text-lg font-bold">{exerciseStats.total}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Exercices</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded text-center">
                          <div className="text-lg font-bold">{exerciseStats.published}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Publiés</div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded text-center">
                          <div className="text-lg font-bold">{exerciseStats.pendingGrading}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">À corriger</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleCreateExercise}
                        className="w-full mb-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <FaPlus /> Nouvel exercice
                      </button>
                      
                      {exerciseLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Chargement...</p>
                        </div>
                      ) : exercises.length === 0 ? (
                        <div className="text-center py-8">
                          <FaFileAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-300">
                            Aucun exercice pour ce cours
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Créez votre premier exercice
                          </p>
                        </div>
                      ) : (
                        <div className="flex-1 overflow-y-auto">
                          <div className="space-y-2">
                            {exercises.map((exercise) => (
                              <div
                                key={exercise.id}
                                className="p-3 border rounded dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium dark:text-white">{exercise.title}</h4>
                                    <p className="text-xs text-gray-500 truncate">
                                      {exercise.description || 'Pas de description'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        exercise.status === 'PUBLISHED'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                      }`}>
                                        {exercise.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        Échéance: {new Date(exercise.dueDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEditExercise(exercise)}
                                      className="p-1 text-blue-500 hover:text-blue-700"
                                      title="Modifier"
                                    >
                                      <FaEye />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteExercise(exercise.id)}
                                      className="p-1 text-red-500 hover:text-red-700"
                                      title="Supprimer"
                                    >
                                      <FaTimes />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* PANEL 8: Correction des exercices */}
            {activePanel === 'grading' && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <CheckSquare size={16} /> Correction des exercices
                    </h2>
                    <button
                      onClick={() => setActivePanel(null)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  {!currentCourseId ? (
                    <div className="text-center py-8">
                      <BookOpen className="text-4xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Chargez ou créez un cours pour corriger les exercices
                      </p>
                    </div>
                  ) : (
                    <>
                      {selectedExercise ? (
                        <div className="flex-1 overflow-y-auto">
                          {/* Grading Interface */}
                          <div className="p-2">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="font-medium dark:text-white">
                                {selectedExercise.title}
                              </h3>
                              <button
                                onClick={() => setSelectedExercise(null)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                              >
                                ← Retour
                              </button>
                            </div>
                            
                            {gradingLoading ? (
                              <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-sm text-gray-500 mt-2">Chargement des soumissions...</p>
                              </div>
                            ) : submissions.length === 0 ? (
                              <div className="text-center py-8">
                                <FaList className="text-4xl text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-300">
                                  Aucune soumission pour cet exercice
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {submissions.map((submission) => (
                                  <div
                                    key={submission.id}
                                    className="p-3 border rounded dark:border-gray-700"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <h4 className="font-medium dark:text-white">
                                          {submission.studentName}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                          Soumis le {new Date(submission.submittedAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <span className={`text-sm font-medium ${
                                        submission.graded
                                          ? 'text-green-600 dark:text-green-400'
                                          : 'text-orange-600 dark:text-orange-400'
                                      }`}>
                                        {submission.graded ? `${submission.score}/${submission.maxScore}` : 'À noter'}
                                      </span>
                                    </div>
                                    
                                    {!submission.graded && (
                                      <div className="mt-2">
                                        <div className="flex gap-2 mb-2">
                                          <input
                                            type="number"
                                            min="0"
                                            max={submission.maxScore}
                                            defaultValue={0}
                                            className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="Note"
                                          />
                                          <button
                                            onClick={() => {
                                              const scoreInput = document.querySelector(`input[type="number"]`) as HTMLInputElement;
                                              if (scoreInput) {
                                                handleGradeSubmission(
                                                  submission.id,
                                                  parseInt(scoreInput.value),
                                                  'Bon travail'
                                                );
                                              }
                                            }}
                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                          >
                                            Noter
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {submission.feedback && (
                                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                          {submission.feedback}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Sélectionnez un exercice pour voir les soumissions
                          </p>
                          
                          {exerciseLoading ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                          ) : exercises.length === 0 ? (
                            <div className="text-center py-8">
                              <FaFileAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 dark:text-gray-300">
                                Aucun exercice à corriger
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {exercises
                                .filter(ex => ex.status === 'PUBLISHED')
                                .map((exercise) => (
                                  <button
                                    key={exercise.id}
                                    onClick={() => setSelectedExercise(exercise)}
                                    className="w-full p-3 border rounded dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h4 className="font-medium dark:text-white">{exercise.title}</h4>
                                        <p className="text-xs text-gray-500">
                                          Échéance: {new Date(exercise.dueDate).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-medium">
                                          {exercise.submissionsCount || 0} soumissions
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {exercise.averageScore ? `Moyenne: ${exercise.averageScore}/${exercise.maxScore}` : 'Pas encore noté'}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
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
              label="Infos du cours"
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
              icon={<FaTasks />}
              label="Exercices"
              panelType="exercises"
              colorClass="text-blue-600 dark:text-blue-400"
              disabled={!currentCourseId}
              badge={exerciseStats.pendingGrading}
            />
            <IconButton
              icon={<FaGraduationCap />}
              label="Correction"
              panelType="grading"
              colorClass="text-green-600 dark:text-green-400"
              disabled={!currentCourseId}
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