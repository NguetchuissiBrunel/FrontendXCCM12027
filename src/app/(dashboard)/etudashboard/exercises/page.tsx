// src/app/(dashboard)/etudashboard/exercises/page.tsx - VERSION FONCTIONNELLE
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMySubmissions, useCourseExercises } from '@/hooks/useExercise';
import { Exercise, Submission } from '@/types/exercise';
import { ExerciseService } from '@/lib3/services/ExerciseService';
import Sidebar from '@/components/Sidebar';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  BookOpen, 
  Award, 
  Calendar,
  BarChart3,
  Eye,
  PlayCircle,
  Loader2,
  FileText,
  AlertCircle,
  Target,
  TrendingUp,
  FileCheck,
  RefreshCw,
  AlertTriangle,
  CheckSquare,
  XCircle,
  GraduationCap,
  ListTodo,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

// Données combinées exercice + statut étudiant
interface StudentExerciseData {
  exercise: Exercise;
  submission?: Submission;
  studentStatus: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  courseTitle: string;
  courseId: number;
  canSubmit: boolean;
  dueDateStatus?: 'open' | 'closed' | 'no_due_date';
  progress?: number;
  timeSpent?: number;
}

// Options de filtre
interface FilterOption {
  value: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

// Badge de statut
interface StatusBadge {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<any>;
  label: string;
}

// Données de cours mockées (à remplacer par votre API)
const MOCK_COURSES = [
  { id: 1, title: 'Algorithmique Avancée', code: 'INF301' },
  { id: 2, title: 'Structures de Données', code: 'INF302' },
  { id: 3, title: 'Base de Données', code: 'INF303' },
  { id: 4, title: 'Développement Web', code: 'INF304' },
];

export default function StudentExercisesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // États
  const [exercisesData, setExercisesData] = useState<StudentExerciseData[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<StudentExerciseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer les soumissions
  const { 
    submissions, 
    isLoading: submissionsLoading, 
    error: submissionsError,
    refetch: refetchSubmissions 
  } = useMySubmissions();

  // Charger les exercices pour chaque cours
  const loadAllExercises = useCallback(async (): Promise<Exercise[]> => {
    if (!user?.id) return [];
    
    try {
      console.log('📚 Récupération des exercices pour tous les cours...');
      
      let allExercises: Exercise[] = [];
      
      // Méthode 1: Par les cours mockés (démonstration)
      for (const course of MOCK_COURSES) {
        try {
          const exercises = await ExerciseService.getExercisesForCourse(course.id);
          
          // Ajouter le titre du cours à chaque exercice
          const enrichedExercises = exercises.map(exercise => ({
            ...exercise,
            courseTitle: course.title,
            courseCode: course.code
          }));
          
          allExercises = [...allExercises, ...enrichedExercises];
        } catch (courseError) {
          console.warn(`Erreur cours ${course.id}:`, courseError);
        }
      }
      
      // Méthode 2: Fallback avec données mockées si aucun exercice
      if (allExercises.length === 0) {
        console.log('⚠️ Aucun exercice API, utilisation de données mockées');
        allExercises = getMockExercises();
      }
      
      console.log(`✅ ${allExercises.length} exercices récupérés`);
      return allExercises;
      
    } catch (error) {
      console.error('❌ Erreur récupération exercices:', error);
      // Fallback aux données mockées
      return getMockExercises();
    }
  }, [user]);

  // Données mockées pour démo
  const getMockExercises = (): Exercise[] => {
    return [
      {
        id: 1,
        courseId: 1,
        courseTitle: 'Algorithmique Avancée',
        title: 'Introduction aux algorithmes de tri',
        description: 'Implémentez les algorithmes de tri classiques et analysez leur complexité.',
        maxScore: 20,
        dueDate: '2024-12-31T23:59:00',
        status: 'PUBLISHED',
        createdAt: '2024-01-15T10:00:00',
        questions: [
          { id: 1, exerciseId: 1, text: 'Implémentez le tri rapide', type: 'CODE', points: 10, order: 0 },
          { id: 2, exerciseId: 1, text: 'Complexité du tri fusion', type: 'TEXT', points: 5, order: 1 },
          { id: 3, exerciseId: 1, text: 'Quiz sur les tris', type: 'MULTIPLE_CHOICE', points: 5, order: 2, options: ['O(n²)', 'O(n log n)', 'O(n!)'] }
        ],
        version: '2.0',
        submissionCount: 45,
        averageScore: 14.5
      },
      {
        id: 2,
        courseId: 2,
        courseTitle: 'Structures de Données',
        title: 'Manipulation des arbres binaires',
        description: 'Exercices sur les parcours et propriétés des arbres binaires.',
        maxScore: 15,
        dueDate: '2024-12-20T23:59:00',
        status: 'PUBLISHED',
        createdAt: '2024-01-20T14:30:00',
        questions: [
          { id: 1, exerciseId: 2, text: 'Parcours pré-ordre', type: 'CODE', points: 8, order: 0 },
          { id: 2, exerciseId: 2, text: 'Hauteur d\'un arbre', type: 'TEXT', points: 7, order: 1 }
        ],
        version: '2.0',
        submissionCount: 32,
        averageScore: 11.2
      },
      {
        id: 3,
        courseId: 3,
        courseTitle: 'Base de Données',
        title: 'Requêtes SQL avancées',
        description: 'Maîtrisez les jointures, sous-requêtes et fonctions d\'agrégation.',
        maxScore: 25,
        dueDate: '2024-12-25T23:59:00',
        status: 'PUBLISHED',
        createdAt: '2024-01-25T09:15:00',
        questions: [
          { id: 1, exerciseId: 3, text: 'Jointure multiple', type: 'CODE', points: 10, order: 0 },
          { id: 2, exerciseId: 3, text: 'Sous-requêtes', type: 'CODE', points: 10, order: 1 },
          { id: 3, exerciseId: 3, text: 'Fonctions d\'agrégation', type: 'TEXT', points: 5, order: 2 }
        ],
        version: '2.0',
        submissionCount: 28,
        averageScore: 18.7
      },
      {
        id: 4,
        courseId: 4,
        courseTitle: 'Développement Web',
        title: 'Création d\'une API REST',
        description: 'Développez une API REST complète avec Express.js et MongoDB.',
        maxScore: 30,
        dueDate: undefined, // Pas de date limite
        status: 'PUBLISHED',
        createdAt: '2024-02-01T16:45:00',
        questions: [
          { id: 1, exerciseId: 4, text: 'Structure du projet', type: 'TEXT', points: 5, order: 0 },
          { id: 2, exerciseId: 4, text: 'Routes CRUD', type: 'CODE', points: 15, order: 1 },
          { id: 3, exerciseId: 4, text: 'Validation des données', type: 'CODE', points: 10, order: 2 }
        ],
        version: '2.0',
        submissionCount: 12,
        averageScore: 22.4
      },
      {
        id: 5,
        courseId: 1,
        courseTitle: 'Algorithmique Avancée',
        title: 'Algorithmes de graphes',
        description: 'Implémentation des algorithmes de parcours et de chemin le plus court.',
        maxScore: 20,
        dueDate: '2024-12-28T23:59:00',
        status: 'PUBLISHED',
        createdAt: '2024-02-05T11:20:00',
        questions: [
          { id: 1, exerciseId: 5, text: 'Parcours BFS/DFS', type: 'CODE', points: 8, order: 0 },
          { id: 2, exerciseId: 5, text: 'Algorithme de Dijkstra', type: 'CODE', points: 12, order: 1 }
        ],
        version: '2.0',
        submissionCount: 0,
        averageScore: 0
      }
    ];
  };

  /**
   * Charger toutes les données étudiant
   */
  const loadStudentData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des exercices étudiant...');
      
      // 1. Récupérer TOUS les exercices
      const exercises = await loadAllExercises();
      
      if (exercises.length === 0) {
        console.log('⚠️ Aucun exercice trouvé');
        setExercisesData([]);
        setFilteredExercises([]);
        return;
      }
      
      console.log(`✅ ${exercises.length} exercices récupérés`);
      
      // 2. Enrichir avec les soumissions et déterminer les statuts
      const enrichedData: StudentExerciseData[] = exercises.map(exercise => {
        const submission = submissions?.find(s => s.exerciseId === exercise.id);
        
        // Déterminer le statut d'échéance
        let dueDateStatus: 'open' | 'closed' | 'no_due_date' = 'no_due_date';
        if (exercise.dueDate) {
          const due = new Date(exercise.dueDate);
          const now = new Date();
          dueDateStatus = now > due ? 'closed' : 'open';
        }
        
        // Déterminer le statut étudiant
        let studentStatus: 'not_started' | 'in_progress' | 'submitted' | 'graded' = 'not_started';
        let canSubmit = true;
        
        if (submission) {
          if (submission.graded) {
            studentStatus = 'graded';
            canSubmit = false;
          } else {
            studentStatus = 'submitted';
            canSubmit = false;
          }
        }
        
        // Pour démo: simuler quelques exercices en cours
        if (exercise.id === 5 && !submission) {
          studentStatus = 'in_progress';
        }
        
        return {
          exercise,
          submission,
          studentStatus,
          courseTitle: exercise.courseTitle || `Cours #${exercise.courseId}`,
          courseId: exercise.courseId,
          canSubmit: canSubmit && dueDateStatus === 'open' && exercise.status === 'PUBLISHED',
          dueDateStatus,
          progress: exercise.id === 5 ? 1 : 0, // Pour démo
          timeSpent: exercise.id === 5 ? 1200 : 0 // 20 minutes en secondes
        };
      });
      
      setExercisesData(enrichedData);
      setFilteredExercises(enrichedData); // Initialiser les filtres
      console.log(`🎯 ${enrichedData.length} exercices enrichis`);
      
    } catch (error: any) {
      console.error('❌ Erreur chargement données étudiant:', error);
      setError(error.message || 'Erreur de chargement des exercices');
      toast.error('Erreur de chargement des exercices');
    } finally {
      setLoading(false);
    }
  }, [user, loadAllExercises, submissions]);

  /**
   * Actualiser les données
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      await Promise.all([
        loadStudentData(),
        refetchSubmissions()
      ]);
      toast.success('✅ Données actualisées');
    } catch (error) {
      toast.error('❌ Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  // ============ FILTRES ============

  // Options de filtre
  const statusOptions: FilterOption[] = [
    { value: 'all', label: 'Tous', icon: BookOpen, color: 'text-gray-600', bgColor: 'bg-gray-100' },
    { value: 'not_started', label: 'À commencer', icon: PlayCircle, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { value: 'in_progress', label: 'En cours', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { value: 'submitted', label: 'Soumis', icon: FileCheck, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { value: 'graded', label: 'Notés', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  ];

  // Extraire les cours uniques pour le filtre
  const uniqueCourses = Array.from(
    new Set(
      exercisesData
        .map(data => data.courseId)
    )
  ).map(courseId => {
    const exercise = exercisesData.find(e => e.courseId === courseId);
    return {
      id: courseId,
      title: exercise?.courseTitle || `Cours #${courseId}`
    };
  });

  // Appliquer les filtres
  useEffect(() => {
    if (!exercisesData.length) {
      setFilteredExercises([]);
      return;
    }
    
    const filtered = exercisesData.filter(item => {
      // Filtre recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          item.exercise.title.toLowerCase().includes(searchLower) ||
          item.exercise.description?.toLowerCase().includes(searchLower) ||
          item.courseTitle.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Filtre statut
      if (selectedStatus !== 'all' && item.studentStatus !== selectedStatus) {
        return false;
      }
      
      // Filtre cours
      if (selectedCourse !== 'all' && item.courseId !== parseInt(selectedCourse)) {
        return false;
      }
      
      return true;
    });
    
    setFilteredExercises(filtered);
  }, [exercisesData, searchTerm, selectedStatus, selectedCourse]);

  // ============ UTILITAIRES ============

  /**
   * Obtenir les infos du badge de statut
   */
  const getStatusBadge = (status: string): StatusBadge => {
    switch (status) {
      case 'not_started':
        return { 
          color: 'text-blue-600 dark:text-blue-400', 
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          icon: PlayCircle, 
          label: 'À commencer' 
        };
      case 'in_progress':
        return { 
          color: 'text-yellow-600 dark:text-yellow-400', 
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: Clock, 
          label: 'En cours' 
        };
      case 'submitted':
        return { 
          color: 'text-purple-600 dark:text-purple-400', 
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
          borderColor: 'border-purple-200 dark:border-purple-800',
          icon: FileCheck, 
          label: 'Soumis' 
        };
      case 'graded':
        return { 
          color: 'text-green-600 dark:text-green-400', 
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: CheckCircle, 
          label: 'Noté' 
        };
      default:
        return { 
          color: 'text-gray-600 dark:text-gray-400', 
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: BookOpen, 
          label: 'Inconnu' 
        };
    }
  };

  /**
   * Obtenir le statut d'échéance
   */
  const getDueDateStatus = (exercise: Exercise) => {
    if (!exercise.dueDate) return null;
    
    const due = new Date(exercise.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { 
        color: 'text-red-600 dark:text-red-400', 
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: AlertCircle,
        label: 'Échéance dépassée' 
      };
    } else if (diffDays === 0) {
      return { 
        color: 'text-red-600 dark:text-red-400', 
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: AlertCircle,
        label: 'Aujourd\'hui' 
      };
    } else if (diffDays <= 3) {
      return { 
        color: 'text-orange-600 dark:text-orange-400', 
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        borderColor: 'border-orange-200 dark:border-orange-800',
        icon: AlertTriangle,
        label: `${diffDays} jour${diffDays > 1 ? 's' : ''}` 
      };
    } else if (diffDays <= 7) {
      return { 
        color: 'text-yellow-600 dark:text-yellow-400', 
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        icon: Clock,
        label: `${diffDays} jours` 
      };
    } else {
      return { 
        color: 'text-green-600 dark:text-green-400', 
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        borderColor: 'border-green-200 dark:border-green-800',
        icon: Calendar,
        label: `${diffDays} jours` 
      };
    }
  };

  /**
   * Calculer les statistiques
   */
  const calculateStats = () => {
    const stats = {
      total: exercisesData.length,
      notStarted: exercisesData.filter(e => e.studentStatus === 'not_started').length,
      inProgress: exercisesData.filter(e => e.studentStatus === 'in_progress').length,
      submitted: exercisesData.filter(e => e.studentStatus === 'submitted').length,
      graded: exercisesData.filter(e => e.studentStatus === 'graded').length,
      openDeadlines: exercisesData.filter(e => e.dueDateStatus === 'open').length,
      closedDeadlines: exercisesData.filter(e => e.dueDateStatus === 'closed').length,
      averageScore: 0,
      totalPossibleScore: exercisesData.reduce((sum, e) => sum + e.exercise.maxScore, 0),
      totalEarnedScore: exercisesData
        .filter(e => e.studentStatus === 'graded' && e.submission?.score !== undefined)
        .reduce((sum, e) => sum + (e.submission!.score || 0), 0)
    };
    
    const gradedExercises = exercisesData.filter(e => e.studentStatus === 'graded' && e.submission?.score !== undefined);
    if (gradedExercises.length > 0) {
      stats.averageScore = gradedExercises.reduce((sum, e) => sum + e.submission!.score!, 0) / gradedExercises.length;
    }
    
    return stats;
  };

  // ============ HANDLERS ============

  const handleStartExercise = (exercise: StudentExerciseData) => {
    if (!exercise.canSubmit) {
      toast.error('Vous ne pouvez pas soumettre cet exercice');
      return;
    }
    
    router.push(`/etudashboard/exercises/${exercise.exercise.id}/attempt`);
  };

  const handleViewExercise = (exercise: StudentExerciseData) => {
    if (exercise.studentStatus === 'graded' && exercise.submission) {
      router.push(`/etudashboard/submissions/${exercise.submission.id}`);
    } else if (exercise.studentStatus === 'submitted') {
      toast('Votre soumission est en attente de correction');
    } else if (exercise.studentStatus === 'in_progress') {
      router.push(`/etudashboard/exercises/${exercise.exercise.id}/attempt`);
    } else {
      router.push(`/etudashboard/exercises/${exercise.exercise.id}/preview`);
    }
  };

  const handleViewStats = (exercise: StudentExerciseData) => {
    if (exercise.studentStatus === 'graded') {
      router.push(`/etudashboard/exercises/${exercise.exercise.id}/stats`);
    } else {
      toast('Les statistiques sont disponibles après notation');
    }
  };

  // ============ EFFETS ============

  // Charger les données au montage
  useEffect(() => {
    if (user && !authLoading) {
      loadStudentData();
    }
  }, [user, authLoading, loadStudentData]);

  // Gérer les erreurs de soumissions
  useEffect(() => {
    if (submissionsError) {
      toast.error('Erreur de chargement des soumissions');
    }
  }, [submissionsError]);

  // ============ RENDU ============

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Non authentifié
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Accès non autorisé
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous devez être connecté pour accéder à cette page.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  const userSpecialization = user.specialization || 'Étudiant';

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Sidebar
        userRole="student"
        userName={displayName}
        userLevel={userSpecialization}
        activeTab="exercices"
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Mes exercices
                </h1>
                {refreshing && (
                  <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Suivez votre progression sur {stats.total} exercice{stats.total !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {stats.graded > 0 && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {stats.graded}/{stats.total} notés
                  </span>
                </div>
              )}
              
              <button
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                  <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.notStarted}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">À commencer</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.inProgress}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">En cours</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                  <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.submitted}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Soumis</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {stats.graded}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Notés</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher un exercice..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Filtres */}
            <div className="flex flex-wrap gap-3">
              {/* Boutons de statut */}
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = selectedStatus === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedStatus(option.value)}
                      disabled={loading}
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all text-sm ${
                        isActive 
                          ? `${option.bgColor} ${option.color} border ${option.bgColor.replace('bg-', 'border-')}`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      } disabled:opacity-50`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* Sélecteur de cours - optionnel */}
              {uniqueCourses.length > 0 && (
                <div className="relative min-w-[180px]">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    disabled={loading}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none disabled:opacity-50"
                  >
                    <option value="all">Tous les cours</option>
                    {uniqueCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* État de chargement/erreur */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement de vos exercices...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-red-200 dark:border-red-800">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-red-700 dark:text-red-400 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-4">
              <ListTodo className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {searchTerm || selectedStatus !== 'all' || selectedCourse !== 'all' 
                ? 'Aucun exercice trouvé'
                : 'Aucun exercice disponible'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm || selectedStatus !== 'all' || selectedCourse !== 'all' 
                ? 'Aucun exercice ne correspond à vos critères de recherche.'
                : 'Vous n\'avez pas encore d\'exercices disponibles.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedCourse('all');
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Liste des exercices */}
            <div className="space-y-4">
              {filteredExercises.map((data) => {
                const statusBadge = getStatusBadge(data.studentStatus);
                const dueDateStatus = getDueDateStatus(data.exercise);
                const StatusIcon = statusBadge.icon;
                const DueDateIcon = dueDateStatus?.icon || Calendar;
                
                return (
                  <div 
                    key={data.exercise.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Informations principales */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            {/* Cours */}
                            <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {data.courseTitle}
                            </span>
                            
                            {/* Statut */}
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusBadge.bgColor} ${statusBadge.color} border ${statusBadge.borderColor}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusBadge.label}
                            </span>
                            
                            {/* Échéance */}
                            {dueDateStatus && (
                              <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${dueDateStatus.bgColor} ${dueDateStatus.color} border ${dueDateStatus.borderColor}`}>
                                <DueDateIcon className="w-3 h-3" />
                                {dueDateStatus.label}
                              </span>
                            )}
                            
                            {/* Progression en cours */}
                            {data.progress && data.progress > 0 && data.studentStatus === 'in_progress' && (
                              <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                                {data.progress} réponse{data.progress > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            {data.exercise.title}
                          </h3>
                          
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {data.exercise.description || 'Aucune description'}
                          </p>
                          
                          {/* Métadonnées */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {data.exercise.maxScore} points
                              </span>
                            </div>
                            
                            <span className="text-gray-400">•</span>
                            
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              <span>{data.exercise.questions?.length || 0} question{data.exercise.questions?.length !== 1 ? 's' : ''}</span>
                            </div>
                            
                            {data.exercise.dueDate && (
                              <>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  <span>
                                    Échéance: {new Date(data.exercise.dueDate).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Score et actions */}
                        <div className="lg:w-64 flex flex-col gap-4">
                          {/* Score si noté */}
                          {data.studentStatus === 'graded' && data.submission && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                  Votre score
                                </span>
                                <span className={`text-lg font-bold ${
                                  data.submission.score! >= data.exercise.maxScore * 0.8 ? 'text-green-600 dark:text-green-400' :
                                  data.submission.score! >= data.exercise.maxScore * 0.6 ? 'text-yellow-600 dark:text-yellow-400' : 
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {data.submission.score}/{data.exercise.maxScore}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    data.submission.score! >= data.exercise.maxScore * 0.8 ? 'bg-green-600' :
                                    data.submission.score! >= data.exercise.maxScore * 0.6 ? 'bg-yellow-600' : 
                                    'bg-red-600'
                                  }`}
                                  style={{ 
                                    width: `${(data.submission.score! / data.exercise.maxScore) * 100}%` 
                                  }}
                                />
                              </div>
                              {data.submission.feedback && (
                                <p className="text-xs text-green-700 dark:text-green-300 mt-2 line-clamp-2">
                                  {data.submission.feedback}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            {/* Action principale */}
                            {data.studentStatus === 'not_started' ? (
                              <button
                                onClick={() => handleStartExercise(data)}
                                disabled={!data.canSubmit}
                                className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                                  data.canSubmit
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                <PlayCircle className="w-5 h-5" />
                                Commencer
                              </button>
                            ) : data.studentStatus === 'graded' ? (
                              <button
                                onClick={() => handleViewExercise(data)}
                                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 font-medium"
                              >
                                <Eye className="w-5 h-5" />
                                Voir les résultats
                              </button>
                            ) : data.studentStatus === 'submitted' ? (
                              <button
                                onClick={() => handleViewExercise(data)}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 font-medium"
                              >
                                <Clock className="w-5 h-5" />
                                En attente
                              </button>
                            ) : (
                              <button
                                onClick={() => handleViewExercise(data)}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 font-medium"
                              >
                                <Eye className="w-5 h-5" />
                                Continuer
                              </button>
                            )}
                            
                            {/* Actions secondaires */}
                            <div className="grid grid-cols-2 gap-2">
                              {data.studentStatus === 'graded' && (
                                <button
                                  onClick={() => handleViewStats(data)}
                                  className="py-2 px-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  Stats
                                </button>
                              )}
                              
                              <button
                                onClick={() => router.push(`/etudashboard/exercises/${data.exercise.id}`)}
                                className="py-2 px-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                              >
                                <Eye className="w-4 h-4" />
                                Détails
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pied de page */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Affichage de <span className="font-medium text-gray-900 dark:text-white">{filteredExercises.length}</span> exercice{filteredExercises.length > 1 ? 's' : ''} sur <span className="font-medium text-gray-900 dark:text-white">{exercisesData.length}</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  {stats.graded > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Score moyen:</div>
                      <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                        {stats.averageScore.toFixed(1)}/20
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-green-600 dark:text-green-400">{stats.openDeadlines}</span> échéances ouvertes • 
                    <span className="font-medium text-red-600 dark:text-red-400 ml-2">{stats.closedDeadlines}</span> échéances fermées
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}