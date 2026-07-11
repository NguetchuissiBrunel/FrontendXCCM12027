'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Editor } from '@tiptap/react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Wand2 } from 'lucide-react';
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
import PdfPreview from './PdfPreview';
import { useTOC } from '@/hooks/useTOC';
import MyCoursesPanel from './MyCoursesPanel';
import { RecommendationsPanel } from './RecommendationsPanel';
import Navbar from '../layout/Navbar';
import { ChevronLeft, ChevronRight, BookOpen, CheckSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLoading } from '@/contexts/LoadingContext';
import ConfirmModal from '../ui/ConfirmModal';
import { CourseControllerService, CourseCreateRequest, CourseUpdateRequest } from '@/lib';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { EnseignantService } from '@/lib/services/EnseignantService';
import { EnrollmentControllerService } from '@/lib/services/EnrollmentControllerService';
import type { Exercise as ExerciseType, Submission } from '@/types/exercise';
import EditorEntranceModal from './EditorEntranceModal';
import CreateCourseModal from '@/components/create-course/page';
import { CollaborationProvider } from '@/contexts/CollaborationContext';
import CollaborationSync from './CollaborationSync';
import { useHocuspocus } from '@/hooks/useHocuspocus';

// Édition collaborative temps réel Y.js/Hocuspocus (Phase 2).
// Désactivé par défaut tant que non testé à 2 navigateurs (risque de duplication
// de contenu). Mettre à true + tester à 2 comptes avant de faire confiance.
const COLLAB_ENABLED = false;
import ImageUploader from '../upload/ImageUploader';
import CollabInviteButton from './CollabInviteButton';
import CollaboratorsPanel from './CollaboratorsPanel';
import { getAuthToken } from '@/utils/authHelpers';
import { ApiError } from '@/lib/core/ApiError';
import AIGenerateCourseModal from './AIGenerateCourseModal';
import {
  AI_GENERATION_OPEN_MODAL_EVENT,
  consumeAIGenerationModalOpenRequest,
} from '@/utils/aiGenerationNavigation';


interface EditorLayoutProps {
  children?: React.ReactNode;
}

/**
 * Right panel types matching original implementation
 */
type RightPanelType = 'structure' | 'info' | 'feedback' | 'author' | 'worksheet' | 'properties' | 'exercises' | 'grading' | 'preview' | 'recommendations' | null;

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
  const t = useTranslations('editor');
  // State for active right panel
  const [activePanel, setActivePanel] = useState<RightPanelType>('structure');
  const [showSidebar, setShowSidebar] = useState(true);

  // State for course title and current course ID
  const [courseTitle, setCourseTitle] = useState<string>("Nouveau cours");
  const [courseCategory, setCourseCategory] = useState<string>("Informatique");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [courseDescription, setCourseDescription] = useState<string>("");
  const [courseImage, setCourseImage] = useState<string | undefined>(undefined);
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
  const [currentCourseAuthorId, setCurrentCourseAuthorId] = useState<string | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [pendingContent, setPendingContent] = useState<any>(null);

  // Exercise management states
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [editingExercise, setEditingExercise] = useState<ExerciseType | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [gradingLoading, setGradingLoading] = useState(false);
  const [exerciseStats, setExerciseStats] = useState({
    total: 0,
    published: 0,
    pendingGrading: 0
  });

  const { user } = useAuth();

  // Connexion collaborative Y.js/Hocuspocus pour le cours courant
  const { ydoc, provider, isSynced: collabSynced } = useHocuspocus(currentCourseId, COLLAB_ENABLED);
  const collabUser = React.useMemo(() => {
    const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];
    return {
      name: user?.firstName || user?.email?.split('@')[0] || 'Collaborateur',
      color: colors[Math.abs((user?.email || 'u').charCodeAt(0)) % colors.length],
    };
  }, [user?.firstName, user?.email]);

  // State to store editor instance
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const { startLoading, stopLoading, isLoading: globalLoading } = useLoading();

  // Panel resizing states
  const [panelWidth, setPanelWidth] = useState(384); // Default to w-96 (24rem = 384px)
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback((e: MouseEvent) => {
    if (isResizing) {
      // Correct width calculation:
      // Distance from right edge of window to mouse, minus the narrow icon bar (64px)
      const newWidth = window.innerWidth - e.clientX - 64;

      // Enforce min/max constraints
      if (newWidth > 320 && newWidth < window.innerWidth * 0.7) {
        setPanelWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  useEffect(() => {
    if (isLoadingCourse || exerciseLoading || gradingLoading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [isLoadingCourse, exerciseLoading, gradingLoading, startLoading, stopLoading]);

  // Modal state for save/publish confirmation
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    type: 'save' | 'publish' | null;
  }>({ isOpen: false, type: null });

  const [isEntranceModalOpen, setIsEntranceModalOpen] = useState(true);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('editor-entrance-modal', { detail: { open: isEntranceModalOpen } }));
  }, [isEntranceModalOpen]);

  useEffect(() => {
    const openStructureForTour = () => setActivePanel('structure');
    window.addEventListener('editor-onboarding-open-structure', openStructureForTour);
    return () => window.removeEventListener('editor-onboarding-open-structure', openStructureForTour);
  }, []);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIGenerateModalOpen, setIsAIGenerateModalOpen] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const openAIGenerationModal = () => {
      setIsEntranceModalOpen(false);
      setIsAIGenerateModalOpen(true);
    };

    if (consumeAIGenerationModalOpenRequest()) {
      openAIGenerationModal();
    }

    window.addEventListener(AI_GENERATION_OPEN_MODAL_EVENT, openAIGenerationModal);
    return () => window.removeEventListener(AI_GENERATION_OPEN_MODAL_EVENT, openAIGenerationModal);
  }, []);

  // Handle initialization from query params
  useEffect(() => {
    const isNew = searchParams?.get('new') === 'true';
    const courseIdParam = searchParams?.get('courseId');

    if (isNew) {
      const title = searchParams?.get('title');
      const category = searchParams?.get('category');
      const description = searchParams?.get('description');

      if (title) setCourseTitle(title);
      if (category) setCourseCategory(category);
      if (description) setCourseDescription(description);

      setIsEntranceModalOpen(false);
    } else if (courseIdParam && currentCourseId === null && !isLoadingCourse && user?.id) {
      const id = Number(courseIdParam);
      if (!isNaN(id)) {
        loadSpecificCourse(id, user.id);
      }
    }
  }, [searchParams, currentCourseId, isLoadingCourse, user]);

  // Apply pending content when editor is ready
  useEffect(() => {
    if (editorInstance && pendingContent) {
      // Defer execution to avoid "flushSync was called from inside a lifecycle method"
      const timer = setTimeout(() => {
        try {
          if (COLLAB_ENABLED) {
            // Y.js : seed le doc partagé UNE fois, uniquement s'il est vide après sync.
            // Tant que la sync n'est pas faite, on garde pendingContent (l'effet se relance).
            if (!collabSynced) return;
            if (editorInstance.isEmpty) {
              editorInstance.commands.setContent(pendingContent);
            }
            setPendingContent(null);
            return;
          }
          editorInstance.commands.setContent(pendingContent);
          setPendingContent(null); // Clear after applying
        } catch (error) {
          console.error('Error applying content to editor:', error);
          // Don't show toast here as it might be annoying on every attempt
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [editorInstance, pendingContent, collabSynced]);

  const getAccessibleCourses = React.useCallback(async (userId: string) => {
    const [authorResponse, enrollmentsResponse, allCoursesResponse] = await Promise.all([
      CourseControllerService.getAuthorCourses(userId),
      EnrollmentControllerService.getMyEnrollments(),
      CourseControllerService.getAllCourses(),
    ]);

    const authorCourses = (authorResponse as any)?.data || [];
    const allCourses = (allCoursesResponse as any)?.data || [];
    const enrollments = enrollmentsResponse.data || [];

    const accessibleCourseIds = new Set<number>();

    authorCourses.forEach((course: any) => {
      if (typeof course.id === 'number') {
        accessibleCourseIds.add(course.id);
      }
    });

    enrollments
      .filter((enrollment: any) =>
        typeof enrollment.courseId === 'number' &&
        (enrollment.status === 'APPROVED' || enrollment.status === 'INVITED')
      )
      .forEach((enrollment: any) => {
        accessibleCourseIds.add(enrollment.courseId);
      });

    const mergedCourses = [
      ...allCourses.filter((course: any) => typeof course.id === 'number' && accessibleCourseIds.has(course.id)),
      ...authorCourses.filter((course: any) => typeof course.id === 'number' && accessibleCourseIds.has(course.id)),
    ];

    return mergedCourses.filter((course: any, index: number, array: any[]) =>
      course?.id && array.findIndex((item) => item?.id === course.id) === index
    );
  }, []);

  const fetchCourseContentById = React.useCallback(async (courseId: number) => {
    console.info('🔍 Fetching course content via service:', courseId);
    return await CourseControllerService.getEnrichedCourse(courseId);
  }, []);

  const loadSpecificCourse = async (id: number, userId: string) => {
    try {
      setIsLoadingCourse(true);
      // Chargement direct par ID : le backend autorise selon les droits (auteur,
      // collaborateur/éditeur via course_editors, ou inscription). On ne bloque plus
      // sur la liste pré-agrégée (getAccessibleCourses) qui excluait les cours non
      // publiés et les collaborations -> "Cours non trouvé dans votre bibliothèque".
      let resolvedCourse: any = null;
      try {
        const response = await fetchCourseContentById(id);
        // Le service renvoie ApiResponseEnrichedCourseResponse, on extrait .data
        resolvedCourse = (response as any)?.data || response;
      } catch (error) {
        console.error('Chargement du cours par ID échoué (accès refusé ?) :', error);
      }

      if (resolvedCourse && resolvedCourse.id) {
        let content = resolvedCourse.content;

        // Handle cases where content might be a string (JSON) instead of an object
        if (typeof content === 'string' && content.trim().startsWith('{')) {
          try {
            content = JSON.parse(content);
          } catch (e) {
            console.error('Failed to parse content JSON string:', e);
          }
        }

        setPendingContent(content || '');
        setCurrentCourseId(resolvedCourse.id || id);
        setCurrentCourseAuthorId(resolvedCourse.author?.id || null);
        setCourseTitle(resolvedCourse.title || "Sans titre");
        setCourseCategory(resolvedCourse.category || "Informatique");
        setCourseDescription(resolvedCourse.description || "");
        setCourseImage(resolvedCourse.photoUrl || resolvedCourse.coverImage);

        toast.success(`Cours "${resolvedCourse.title || 'Sans titre'}" chargé`);
        setIsEntranceModalOpen(false);
        setActivePanel('structure');
      } else {
        toast.error('Cours introuvable ou accès non autorisé.');
      }
    } catch (error) {
      console.error('Erreur chargement cours spécifique:', error);
      toast.error('Impossible de charger le cours spécifié.');
    } finally {
      setIsLoadingCourse(false);
    }
  };

  // Extract TOC from editor in real-time
  const [tocItems, refreshTOC] = useTOC(editorInstance, 300);

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
      const resp = await ExercicesService.getExercisesForCourse(currentCourseId);
      const list = (resp as any)?.data || [];
      const mapped = list.map((e: any) => ({
        id: e.id ?? 0,
        courseId: e.courseId ?? currentCourseId,
        title: e.title ?? '',
        description: e.description ?? '',
        maxScore: e.maxScore ?? 0,
        dueDate: e.dueDate ?? '',
        createdAt: e.createdAt ?? new Date().toISOString(),
        status: (e.status as any) || 'DRAFT'
      }));
      setExercises(mapped);
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast.error(t('toast.exerciseLoadError'));
    } finally {
      setExerciseLoading(false);
    }
  };

  const loadSubmissions = async (exerciseId: number) => {
    try {
      setGradingLoading(true);
      const resp = await EnseignantService.getSubmissions(exerciseId);
      const subs = (resp as any)?.data || [];
      setSubmissions(subs);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error(t('toast.submissionLoadError'));
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

  // ---------- Exercise handlers (create / edit / save / delete / grade) ----------
  const handleCreateExercise = () => {
    if (!currentCourseId) {
      toast.error(t('toast.createBeforeExercise'));
      return;
    }

    const newExercise: ExerciseType = {
      id: 0,
      courseId: currentCourseId,
      title: '',
      description: '',
      maxScore: 10,
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'DRAFT'
    } as ExerciseType;

    setEditingExercise(newExercise);
  };

  const handleEditExercise = (exercise: ExerciseType) => {
    setEditingExercise(exercise);
  };

  const handleSaveExercise = async (exercise: ExerciseType | null) => {
    if (!exercise) return;
    try {
      setExerciseLoading(true);

      if (exercise.id && exercise.id > 0) {
        await EnseignantService.updateExercise(exercise.id, {
          title: exercise.title,
          description: exercise.description,
          maxScore: exercise.maxScore,
          dueDate: exercise.dueDate,
        });
        toast.success(t('toast.exerciseUpdated'));
      } else {
        if (!currentCourseId) throw new Error('Course ID manquant');
        await EnseignantService.createExercise(currentCourseId, {
          title: exercise.title,
          description: exercise.description,
          maxScore: exercise.maxScore,
          dueDate: exercise.dueDate,
        });
        toast.success(t('toast.exerciseCreated'));
      }

      setEditingExercise(null);
      await loadExercises();
      calculateExerciseStats();
    } catch (error) {
      console.error('Erreur saving exercise', error);
      toast.error(t('toast.exerciseSaveError'));
    } finally {
      setExerciseLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    if (!confirm(t('toast.exerciseDeleteConfirm'))) return;
    try {
      setExerciseLoading(true);
      await EnseignantService.deleteExercise(exerciseId);
      toast.success(t('toast.exerciseDeleted'));
      await loadExercises();
      calculateExerciseStats();
    } catch (error) {
      console.error('Erreur suppression exercice', error);
      toast.error(t('toast.exerciseDeleteError'));
    } finally {
      setExerciseLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId: number, score: number, feedback?: string) => {
    try {
      setGradingLoading(true);
      await EnseignantService.gradeSubmission(submissionId, { score, feedback });
      toast.success(t('toast.gradeSuccess'));
      if (selectedExercise?.id) await loadSubmissions(selectedExercise.id);
      await loadExercises();
      calculateExerciseStats();
    } catch (error) {
      console.error('Erreur notation', error);
      toast.error(t('toast.gradeError'));
    } finally {
      setGradingLoading(false);
    }
  };

  // Handle TOC item click - scroll to node
  const handleTOCItemClick = (itemId: string) => {
    if (!editorInstance) return;

    // Find the node by data-id attribute
    const editorDom = editorInstance.view.dom;
    const element = editorDom.querySelector(`[data-id="${itemId}"]`);

    if (element) {
      // Focus the editor to ensure proper interaction
      editorInstance.view.focus();

      // Scroll element to the beginning of viewport (top alignment)
      // Using 'start' instead of 'center' for accurate positioning at content start
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Ref for MainEditor to handle imperative updates from TOC
  const editorRef = React.useRef<{ handleTOCAction: (action: 'rename' | 'delete' | 'move' | 'copy' | 'paste' | 'duplicate', itemId: string, payload?: any) => void }>(null);

  // Ref for auto-save timer
  const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const skipNextAutoSaveRef = React.useRef(false);

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
      if (!silent) toast.error(t('toast.editorNotLoaded'));
      return;
    }

    if (!user) {
      if (!silent) toast.error(t('toast.notLoggedIn'));
      return;
    }

    const finalTitle = courseTitle.trim() || "Cours sans titre";
    const finalCategory = courseCategory.trim() || "Informatique";
    const finalDescription = courseDescription.trim() || "Description du cours";
    
    if (!editorInstance) return;
    const jsonContent = editorInstance.getJSON();

    try {
      if (currentCourseId) {
        console.info('🔍 Save debug:update:start', {
          courseId: currentCourseId,
          userId: user.id,
          currentCourseAuthorId,
          publish,
        });

        // Update existing course
        const updateData: CourseUpdateRequest = {
          title: finalTitle,
          content: jsonContent as any,
          category: finalCategory,
          description: finalDescription,
          coverImage: courseImage,
          photoUrl: courseImage,
        };

        await CourseControllerService.updateCourse(currentCourseId, updateData);
        console.info('✅ Save debug:update:success', {
          courseId: currentCourseId,
          userId: user.id,
          currentCourseAuthorId,
        });

        // Update status if publish is requested
        if (publish) {
          await CourseControllerService.updateCourseStatus(currentCourseId, 'PUBLISHED');
        }

        if (!silent) toast.success(publish ? t('toast.publishSuccess') : t('toast.updateSuccess'));
      } else {
        // Create new course
        const createData: CourseCreateRequest = {
          title: finalTitle,
          content: jsonContent as any,
          category: finalCategory,
          description: finalDescription,
          photoUrl: courseImage,
        };

        const response = await CourseControllerService.createCourse(user.id, createData);

        // Standardize response extraction based on OpenAPI output (ApiResponseCourseResponse)
        const responseData = (response as any).data || response;
        const createdCourseId = responseData?.id;

        if (createdCourseId) {
          setCurrentCourseId(createdCourseId);
          setCurrentCourseAuthorId(user.id);

          // Publish if requested
          if (publish) {
            await CourseControllerService.updateCourseStatus(createdCourseId, 'PUBLISHED');
          }

          if (!silent) toast.success(publish ? t('toast.publishSuccess') : t('toast.createSuccess'));
        } else {
          throw new Error("Impossible de récupérer l'ID du cours créé.");
        }
      }
    } catch (error: any) {
      console.error("Erreur sauvegarde :", error);
      if (error instanceof ApiError) {
        console.error('❌ Save debug:update:error', {
          courseId: currentCourseId,
          userId: user.id,
          currentCourseAuthorId,
          status: error.status,
          statusText: error.statusText,
          body: error.body,
          url: error.url,
        });
      }
      const message =
        error instanceof ApiError
          ? (error.body?.message || error.body?.error || error.message)
          : (error?.response?.data?.message || error?.message || "Erreur de communication avec le serveur.");
      if (!silent) toast.error(`${t('toast.saveError')} : ${message}`);
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

  const handleAIGenerated = async (content: object, title: string, description: string) => {
    if (!user?.id) {
      toast.error(t('toast.notLoggedIn'));
      throw new Error('Utilisateur non connecté');
    }

    const finalTitle = title.trim() || 'Cours généré par IA';
    const finalDescription = description.trim() || "Cours généré avec l'IA";
    const finalCategory = courseCategory.trim() || 'Informatique';

    try {
      const createData: CourseCreateRequest = {
        title: finalTitle,
        content: content as CourseCreateRequest['content'],
        category: finalCategory,
        description: finalDescription,
        photoUrl: courseImage,
      };

      const response = await CourseControllerService.createCourse(user.id, createData);
      const responseData = (response as any).data || response;
      const createdCourseId = responseData?.id;

      if (!createdCourseId) {
        throw new Error("Impossible de récupérer l'ID du cours créé.");
      }

      setCourseTitle(finalTitle);
      setCourseDescription(finalDescription);
      setCurrentCourseId(createdCourseId);
      setCurrentCourseAuthorId(user.id);

      if (editorInstance) {
        skipNextAutoSaveRef.current = true;
        editorInstance.commands.setContent(content);
      } else {
        setPendingContent(content);
      }

      setIsEntranceModalOpen(false);
      setActivePanel('structure');
      toast.success(`Cours "${finalTitle}" généré et enregistré`);
    } catch (error: unknown) {
      console.error('Erreur création du cours généré par IA :', error);
      const message =
        error instanceof ApiError
          ? (error.body?.message || error.body?.error || error.message)
          : error instanceof Error
            ? error.message
            : "Erreur de communication avec le serveur.";
      toast.error(`${t('toast.saveError')} : ${message}`);
      throw error;
    }
  };

  const handleCreateCourse = (data: { title: string; category: string; description: string }) => {
    setCourseTitle(data.title);
    setCourseCategory(data.category);
    setCustomCategory(["Informatique", "Mathématiques", "Physique", "Langues"].includes(data.category) ? "" : data.category);
    setCourseDescription(data.description);
    setCurrentCourseId(null);
    setCurrentCourseAuthorId(null);
    if (editorInstance) {
      editorInstance.commands.setContent('');
    }
    setIsCreateModalOpen(false);
    toast.success(t('toast.courseInit'));
  };

  /**
   * Handle editor content change
   */
  const handleEditorChange = (content: string) => {
    // Determine title from content if needed? No, title is separate.
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }

    // Debounced auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(false, true); // Auto-save, silent
    }, 2000); // 2 seconds debounce
  };

  return (
    <CollaborationProvider courseId={currentCourseId}>
      <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
        {/* Entrance Modal */}
        <EditorEntranceModal
          isOpen={isEntranceModalOpen}
          onClose={() => setIsEntranceModalOpen(false)}
          onCreateNew={(title) => {
            setCourseTitle(title);
            setIsEntranceModalOpen(false);
            if (editorInstance) {
              // Insérer une structure par défaut complète pour faciliter la saisie
              const timestamp = Date.now();
              const defaultContent = {
                type: 'doc',
                content: [
                  {
                    type: 'section',
                    attrs: { id: `section-${timestamp}`, title: 'Partie' },
                    content: [
                      {
                        type: 'chapitre',
                        attrs: { id: `chapitre-${timestamp}`, title: 'Chapitre' },
                        content: [
                          {
                            type: 'paragraphe',
                            attrs: { id: `paragraphe-${timestamp}`, title: 'Paragraphe' },
                            content: [
                              {
                                type: 'notion',
                                attrs: { id: `notion-${timestamp}`, title: 'Notion' },
                                content: [
                                  { type: 'paragraph', content: [{ type: 'text', text: 'Contenu de la notion...' }] }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              };
              editorInstance.commands.setContent(defaultContent);
            }
          }}
          onModifyExisting={() => {
            setIsEntranceModalOpen(false);
            setActivePanel('author'); // Open 'Mes Cours' panel
          }}
          onGenerateCourse={() => {
            setIsEntranceModalOpen(false);
            setIsAIGenerateModalOpen(true);
          }}
        />

        {/* Course Creation Modal */}
        <CreateCourseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCourse}
        />

        {/* AI Course Generation Modal */}
        <AIGenerateCourseModal
          isOpen={isAIGenerateModalOpen}
          onClose={() => setIsAIGenerateModalOpen(false)}
          onGenerated={handleAIGenerated}
        />

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig({ isOpen: false, type: null })}
          onConfirm={handleConfirmedAction}
          title={confirmConfig.type === 'publish' ? t('confirm.publishTitle') : t('confirm.saveTitle')}
          message={confirmConfig.type === 'publish'
            ? t('confirm.publishMessage')
            : t('confirm.saveMessage')
          }
          confirmText={confirmConfig.type === 'publish' ? t('confirm.publishConfirm') : t('confirm.saveConfirm')}
          type={confirmConfig.type === 'publish' ? 'info' : 'warning'}
        />
        {/* Spacer for Navbar at the top */}
        <nav id="navbar" className="h-16 flex-none z-10">
          <Navbar />
        </nav>
        {/* Floating Buttons */}
        <CollabInviteButton
          courseId={currentCourseId}
          courseTitle={courseTitle}
          canInvite={!!user?.id && !!currentCourseAuthorId && user.id === currentCourseAuthorId}
        />

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar for TOC */}
          <aside
            id="sidebar-toc"
            className={`${showSidebar ? 'w-80' : 'w-0'
              } flex-none bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out relative z-0 print:hidden`}
          >
            <TableOfContents
              items={tocItems}
              onItemClick={handleTOCItemClick}
              onItemRename={handleTOCItemRename}
              onItemDelete={handleTOCItemDelete}
              onItemDuplicate={(itemId) => {
                if (editorRef.current) {
                  editorRef.current.handleTOCAction('duplicate', itemId);
                }
              }}
              onItemPaste={(targetId, item) => {
                if (editorRef.current) {
                  editorRef.current.handleTOCAction('paste', targetId, item);
                }
              }}
              onItemCopy={(item) => {
                if (editorRef.current) {
                  editorRef.current.handleTOCAction('copy', item.id);
                }
                console.log('Item copié dans TOC:', item.title);
              }}
              onItemMove={(itemId, targetId, position) => {
                if (editorRef.current) {
                  editorRef.current.handleTOCAction('move', itemId, { targetId, position });
                }
              }}
            />
          </aside>

          {/* Toggle Sidebar Button */}
          <button
            id="btn-toggle-toc"
            onClick={() => setShowSidebar(!showSidebar)}
            className={`absolute top-24 z-20 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ${showSidebar ? 'left-80' : 'left-0'
              }`}
            title={showSidebar ? t('toolbar.hideToc') : t('toolbar.showToc')}
          >
            {showSidebar ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Main Editor Area */}
          <main id="main-editor-container" className="flex-1 flex flex-col min-w-0 bg-gray-100 dark:bg-gray-900 relative z-0 overflow-hidden">
            <MainEditor
              initialContent=""
              onContentChange={handleEditorChange}
              onEditorReady={(editor) => {
                setEditorInstance(editor);
              }}
              ref={editorRef}
              ydoc={ydoc}
              provider={provider}
              collaborationEnabled={COLLAB_ENABLED}
              isSynced={collabSynced}
              collabUser={collabUser}
            >
              <CollaborationSync editorRef={editorRef} editorInstance={editorInstance} yjsEnabled={COLLAB_ENABLED && !!ydoc} />
            </MainEditor>
          </main>

          {/* Resizer Handle */}
          {activePanel && (
            <div
              className={`w-1.5 cursor-col-resize hover:bg-purple-400 active:bg-purple-600 transition-colors h-full flex-none z-30 ${isResizing ? 'bg-purple-600' : 'bg-gray-100 dark:bg-gray-800'}`}
              onMouseDown={startResizing}
            />
          )}

          {/* RIGHT SECTION - Unified Sidebar + Panel Area */}
          <div className="flex print:hidden relative">
            {/* Main Sidebar - Unified */}
            <div id="right-icon-bar" className="w-16 flex-none bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-3 z-20">
              <IconButton
                icon={<FaList id="icon-structure" />}
                label={t('panels.structure')}
                panelType="structure"
                colorClass="text-purple-600 dark:text-purple-400"
              />
              <IconButton
                icon={<FaInfo id="icon-info" />}
                label={t('panels.info')}
                panelType="info"
                colorClass="text-blue-600 dark:text-blue-400"
              />
              <IconButton
                icon={<FaEye id="icon-preview" />}
                label={t('panels.pdfPreview')}
                panelType="preview"
                colorClass="text-cyan-600 dark:text-cyan-400"
              />
              <IconButton
                icon={<FaComments id="icon-feedback" />}
                label={t('panels.feedback')}
                panelType="feedback"
                colorClass="text-green-600 dark:text-green-400"
              />
              <IconButton
                icon={<Sparkles className="h-4 w-4" id="icon-recommendations" />}
                label={t('panels.recommendations') || "Recommandations IA"}
                panelType="recommendations"
                colorClass="text-purple-600 dark:text-purple-400"
              />

              <div className="flex-grow" />

              <IconButton
                icon={<FaFolderOpen id="icon-my-courses" />}
                label={t('panels.myCourses')}
                panelType="author"
                colorClass="text-orange-600 dark:text-orange-400"
              />
              <IconButton
                icon={<FaTasks id="icon-exercises" />}
                label={t('panels.exercises')}
                panelType="exercises"
                badge={exercises.length}
                colorClass="text-blue-600 dark:text-blue-400"
                disabled={!currentCourseId}
              />
              <IconButton
                icon={<FaGraduationCap id="icon-grading" />}
                label={t('panels.grading')}
                panelType="grading"
                badge={exerciseStats.pendingGrading}
                colorClass="text-indigo-600 dark:text-indigo-400"
                disabled={!currentCourseId}
              />
              <IconButton
                icon={<FaChalkboardTeacher id="icon-workshops" />}
                label={t('panels.workshops')}
                panelType="worksheet"
                colorClass="text-indigo-600 dark:text-indigo-400"
                disabled={!currentCourseId}
              />
              <IconButton
                icon={<FaCog id="icon-settings" />}
                label={t('panels.properties')}
                panelType="properties"
                colorClass="text-gray-600 dark:text-gray-400"
              />

              <div className="border-t border-gray-100 dark:border-gray-700 w-8 my-2" />

              {/* Bottom Actions */}
              <button
                id="btn-save-course"
                onClick={() => triggerSaveConfirm(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={t('toolbar.save')}
              >
                <FaSave className="text-lg" />
              </button>
              <button
                id="btn-publish-course"
                onClick={() => triggerSaveConfirm(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors"
                title={t('toolbar.publish')}
              >
                <FaPaperPlane className="text-lg" />
              </button>
            </div>
            {/* Panel Area - Slides based on activePanel */}
            <div
              id="sidebar-structure-panel"
              className={`overflow-y-auto border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all ease-in-out ${activePanel ? '' : 'w-0 overflow-hidden'
                }`}
              style={{ width: activePanel ? `${panelWidth}px` : '0px', transition: isResizing ? 'none' : 'width 300ms' }}
            >
              {/* PANEL 1: Structure de cours */}
              {activePanel === 'structure' && (
                <StructureDeCours onClose={() => setActivePanel(null)} />
              )}

              {/* PANEL 1.5: Aperçu PDF */}
              {activePanel === 'preview' && (
                <PdfPreview
                  content={editorInstance?.getJSON()}
                  title={courseTitle}
                  onElementClick={handleTOCItemClick}
                />
              )}

              {/* PANEL 1.6: Recommandations IA */}
              {activePanel === 'recommendations' && (
                <RecommendationsPanel
                  courseTitle={courseTitle}
                  courseDescription={courseDescription}
                  courseContent={editorInstance?.getText()}
                  onClose={() => setActivePanel(null)}
                  onImportCourse={(id) => {
                    toast.promise(
                      loadSpecificCourse(id, user?.id || ''),
                      {
                        loading: 'Importation du cours...',
                        success: 'Cours importé avec succès',
                        error: 'Erreur lors de l\'importation'
                      }
                    );
                  }}
                />
              )}

              {/* PANEL 2: Infos */}
              {activePanel === 'info' && (
                <div className="p-4 h-full">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('info.panelTitle')}</h2>
                    <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <FaTimes />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                        {t('info.courseTitle')}
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
                        {t('info.category')}
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
                        <option value="Informatique">{t('info.categories.computer')}</option>
                        <option value="Mathématiques">{t('info.categories.mathematics')}</option>
                        <option value="Physique">{t('info.categories.physics')}</option>
                        <option value="Langues">{t('info.categories.languages')}</option>
                        <option value="Autre">{t('info.categories.other')}</option>
                      </select>
                    </div>

                    {!["Informatique", "Mathématiques", "Physique", "Langues"].includes(courseCategory) && (
                      <div className="animate-in slide-in-from-top-1 duration-200">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                          {t('info.categoryName')}
                        </label>
                        <input
                          type="text"
                          placeholder={t('info.categoryPlaceholder')}
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
                        {t('info.description')}
                      </label>
                      <textarea
                        rows={4}
                        className="w-full text-sm py-2 px-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded outline-none focus:border-purple-500 transition-colors resize-none"
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                        placeholder={t('info.descriptionPlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                        {t('info.coverImage')}
                      </label>
                      <ImageUploader
                        currentImageUrl={courseImage}
                        onUploadComplete={(url) => setCourseImage(url)}
                        onUploadError={(err) => toast.error(err)}
                        placeholder={t('info.coverImagePlaceholder')}
                        className="mt-1"
                      />
                    </div>

                    {currentCourseId && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                          {t('info.courseId')}
                        </div>
                        <div className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                          {currentCourseId}
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={() => triggerSaveConfirm(false)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                      >
                        <FaSave /> {t('info.saveInfos')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 3: Appréciations */}
              {activePanel === 'feedback' && (
                <div className="p-4 h-full">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('feedback.panelTitle')}</h2>
                    <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <FaTimes />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <div className="text-center py-8">
                      <FaComments className="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500">{t('feedback.comingSoon')}</p>
                      <p className="text-xs text-gray-400 mt-2">{t('feedback.comingSoonDetail')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 4: Mes Cours */}
              {activePanel === 'author' && (
                <MyCoursesPanel
                  onClose={() => setActivePanel(null)}
                  onLoadCourse={async (course) => {
                    if (!user?.id || !course.id) return;
                    await loadSpecificCourse(course.id, user.id);
                    setCustomCategory(["Informatique", "Mathématiques", "Physique", "Langues"].includes(course.category || "") ? "" : (course.category || ""));
                    setTimeout(() => refreshTOC(), 100);
                  }}
                />
              )}

              {/* PANEL 5: Travaux Dirigés */}
              {activePanel === 'worksheet' && (
                <CollaboratorsPanel
                  courseId={currentCourseId}
                  owner={{
                    name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email,
                    email: user?.email,
                    image: user?.photoUrl,
                  }}
                  onClose={() => setActivePanel(null)}
                />
              )}

              {/* PANEL 6: Propriétés */}
              {activePanel === 'properties' && (() => {
                const plainText = editorInstance?.getText() ?? '';
                const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
                const charCount = plainText.length;
                const readingMinutes = Math.max(1, Math.round(wordCount / 200));
                const rows: { label: string; value: React.ReactNode }[] = [
                  { label: 'Identifiant', value: currentCourseId ?? '— (non enregistré)' },
                  { label: 'Titre', value: courseTitle || '—' },
                  { label: 'Catégorie', value: courseCategory || '—' },
                  { label: 'Éléments (plan)', value: tocItems?.length ?? 0 },
                  { label: 'Mots', value: wordCount.toLocaleString('fr-FR') },
                  { label: 'Caractères', value: charCount.toLocaleString('fr-FR') },
                  { label: 'Lecture estimée', value: `~${readingMinutes} min` },
                  {
                    label: 'Collaboration temps réel',
                    value: (
                      <span className={COLLAB_ENABLED ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                        {COLLAB_ENABLED ? 'Activée' : 'Désactivée'}
                      </span>
                    ),
                  },
                ];
                return (
                  <div className="flex h-full flex-col">
                    <div className="mb-4 flex items-center justify-between p-4 pb-0">
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('properties.panelTitle')}</h2>
                      <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <FaTimes />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                        {rows.map((row) => (
                          <div key={row.label} className="flex items-center justify-between gap-3 px-3 py-2.5">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{row.label}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white text-right truncate max-w-[55%]">{row.value}</span>
                          </div>
                        ))}
                      </div>
                      {courseDescription && (
                        <div className="mt-4">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Description</p>
                          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">{courseDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* PANEL 7: Gestion des exercices */}
              {activePanel === 'exercises' && (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FaTasks /> {t('exercises.panelTitle')}
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
                          {t('exercises.noCourse')}
                        </p>
                      </div>
                    ) : editingExercise ? (
                      <div className="flex-1 overflow-y-auto">
                        {/* Exercise Editor Component */}
                        <div className="p-2">
                          <h3 className="font-medium mb-4 dark:text-white">
                            {editingExercise.id ? t('exercises.editTitle') : t('exercises.newTitle')}
                          </h3>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium mb-1 dark:text-gray-300">
                                {t('exercises.titleLabel')}
                              </label>
                              <input
                                type="text"
                                value={editingExercise.title}
                                onChange={(e) => setEditingExercise({ ...editingExercise, title: e.target.value })}
                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                placeholder={t('exercises.titlePlaceholder')}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-1 dark:text-gray-300">
                                {t('exercises.descLabel')}
                              </label>
                              <textarea
                                value={editingExercise.description}
                                onChange={(e) => setEditingExercise({ ...editingExercise, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                rows={3}
                                placeholder={t('exercises.descPlaceholder')}
                              />
                            </div>

                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="block text-xs font-medium mb-1 dark:text-gray-300">
                                  {t('exercises.maxScore')}
                                </label>
                                <input
                                  type="number"
                                  value={editingExercise.maxScore}
                                  onChange={(e) => setEditingExercise({ ...editingExercise, maxScore: parseInt(e.target.value) })}
                                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                              </div>

                              <div className="flex-1">
                                <label className="block text-xs font-medium mb-1 dark:text-gray-300">
                                  {t('exercises.status')}
                                </label>
                                <select
                                  value={editingExercise.status}
                                  onChange={(e) => setEditingExercise({ ...editingExercise, status: e.target.value as any })}
                                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                >
                                  <option value="DRAFT">{t('exercises.draft')}</option>
                                  <option value="PUBLISHED">{t('exercises.published')}</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <button
                                onClick={() => setEditingExercise(null)}
                                className="flex-1 px-4 py-2 border rounded dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {t('exercises.cancel')}
                              </button>
                              <button
                                onClick={() => handleSaveExercise(editingExercise)}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                {editingExercise.id ? t('exercises.update') : t('exercises.create')}
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
                          <FaPlus /> {t('exercises.newExercise')}
                        </button>

                        {exerciseLoading ? (
                          null
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
                                        {exercise.description || t('exercises.noDescription')}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-2 py-1 rounded-full ${exercise.status === 'PUBLISHED'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                          }`}>
                                          {exercise.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {t('exercises.deadline')}: {exercise.dueDate ? new Date(exercise.dueDate).toLocaleDateString() : t('exercises.deadlineNone')}
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
                        <CheckSquare size={16} /> {t('gradingPanel.panelTitle')}
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
                          {t('gradingPanel.noCourse')}
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
                                  {t('gradingPanel.back')}
                                </button>
                              </div>

                              {gradingLoading ? (
                                null
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
                                            {t('gradingPanel.submittedOn')} {new Date(submission.submittedAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <span className={`text-sm font-medium ${submission.graded
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
                              {t('gradingPanel.selectExercise')}
                            </p>

                            {exerciseLoading ? (
                              null
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
                                            {t('exercises.deadline')}: {exercise.dueDate ? new Date(exercise.dueDate).toLocaleDateString() : 'Non définie'}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-medium">
                                            {exercise.submissionCount || 0} soumissions
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

          </div>
        </div>
      </div>
    </CollaborationProvider>
  );
};

export default EditorLayout;
