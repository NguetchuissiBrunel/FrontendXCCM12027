// app/(dashboard)/profdashboard/exercises/page.tsx - VERSION CORRIGÉE
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { ExerciseService } from '@/lib3/services/ExerciseService';
import {
  BookOpen,
  FileText,
  Users,
  ArrowLeft,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  PlusCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Exercise, Submission } from '@/types/exercise';
import { useLoading } from '@/contexts/LoadingContext';

// ============ TYPES ============

interface CourseData {
  id: number;
  title: string;
  category?: string;
}

interface ExerciseWithStats extends Exercise {
  courseTitle: string;
  courseId: number;
  courseCategory?: string;
  pendingSubmissions: number;
  totalSubmissions: number;
  averageScore: number;
  lastActivity?: string;
  isUpdating?: boolean;
  hasUpdates?: boolean;
}

// ============ HOOKS PERSONNALISÉS ============

const useExerciseSync = () => {
  const [syncTrigger, setSyncTrigger] = useState(0);

  const triggerSync = (exerciseId?: number) => {
    console.log(`🔄 Sync déclenchée pour ${exerciseId ? `exercice ${exerciseId}` : 'tous les exercices'}`);
    setSyncTrigger(Date.now());

    if (typeof window !== 'undefined') {
      localStorage.setItem('exercise-sync', JSON.stringify({
        exerciseId,
        timestamp: Date.now(),
        trigger: Math.random()
      }));

      window.dispatchEvent(new CustomEvent('exercise-sync', {
        detail: { exerciseId, timestamp: Date.now() }
      }));
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'exercise-sync' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          console.log('📡 Sync reçue depuis un autre onglet:', data);
          setSyncTrigger(Date.now());
        } catch (error) {
          console.error('Erreur parsing sync:', error);
        }
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('📡 Sync reçue depuis le même onglet:', customEvent.detail);
      setSyncTrigger(Date.now());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('exercise-sync', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('exercise-sync', handleCustomEvent);
    };
  }, []);

  return { syncTrigger, triggerSync };
};

// ============ COMPOSANT PRINCIPAL ============

export default function ExercisesView() {
  const router = useRouter();
  const { user } = useAuth();
  const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();

  // États
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [exercises, setExercises] = useState<ExerciseWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Références
  const loadingRef = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync
  const { syncTrigger, triggerSync } = useExerciseSync();

  // Service de cache
  const exerciseCache = useRef<Map<number, { data: ExerciseWithStats; timestamp: number }>>(new Map());
  const CACHE_DURATION = 30000;

  // Fonction pour normaliser les données de cours
  const normalizeCourseData = (course: any): CourseData => ({
    id: course.id || 0,
    title: course.title || 'Cours sans titre',
    category: course.category || course.categoryName || 'Non catégorisé'
  });

  // Charger un cours avec cache
  const loadCourseExercises = useCallback(async (courseId: number, courseData: CourseData): Promise<ExerciseWithStats[]> => {
    try {
      console.log(`📚 Chargement exercices cours ${courseId}...`);

      const exercisesResponse = await ExercicesService.getExercisesForCourse(courseId);
      const courseExercises = exercisesResponse.data || [];

      const exercisesWithStats: ExerciseWithStats[] = [];

      for (const exerciseData of courseExercises) {
        const exerciseId = exerciseData.id;
        if (!exerciseId) continue;

        try {
          const cached = exerciseCache.current.get(exerciseId);
          const now = Date.now();

          if (cached && (now - cached.timestamp) < CACHE_DURATION) {
            console.log(`✅ Exercice ${exerciseId} depuis le cache`);
            exercisesWithStats.push(cached.data);
            continue;
          }

          const [fullExercise, submissions] = await Promise.all([
            ExerciseService.getExerciseDetails(exerciseId),
            ExerciseService.getExerciseSubmissions(exerciseId).catch(() => [])
          ]);

          if (!fullExercise) continue;

          const gradedSubmissions = submissions.filter((s: Submission) => s.graded);
          const pendingSubmissions = submissions.filter((s: Submission) => !s.graded);

          const averageScore = gradedSubmissions.length > 0
            ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length * 10) / 10
            : 0;

          const exerciseWithStats: ExerciseWithStats = {
            ...fullExercise,
            courseTitle: courseData.title,
            courseId,
            courseCategory: courseData.category,
            pendingSubmissions: pendingSubmissions.length,
            totalSubmissions: submissions.length,
            averageScore,
            lastActivity: new Date().toISOString()
          };

          exerciseCache.current.set(exerciseId, {
            data: exerciseWithStats,
            timestamp: now
          });

          exercisesWithStats.push(exerciseWithStats);

        } catch (error) {
          console.error(`❌ Erreur exercice ${exerciseId}:`, error);
        }
      }

      console.log(`✅ ${exercisesWithStats.length} exercices chargés pour cours ${courseId}`);
      return exercisesWithStats;

    } catch (error) {
      console.error(`❌ Erreur cours ${courseId}:`, error);
      return [];
    }
  }, []);

  // Charger tous les exercices
  const loadAllExercises = useCallback(async (forceRefresh = false) => {
    if (!user || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    startLoading();
    setRefreshing(true);

    try {
      console.log('🔄 Chargement de tous les exercices...');

      // Récupérer les cours avec validation
      const coursesResponse = await CourseControllerService.getAuthorCourses(user.id);
      const rawCourses = coursesResponse.data || [];

      // Normaliser et filtrer les cours
      const validCourses = rawCourses
        .map(normalizeCourseData)
        .filter(course => course.id > 0);

      setCourses(validCourses);

      if (validCourses.length === 0) {
        setExercises([]);
        return;
      }

      // Charger les exercices séquentiellement pour éviter les timeouts
      const allExercises: ExerciseWithStats[] = [];

      for (const course of validCourses) {
        const courseExercises = await loadCourseExercises(course.id, course);
        allExercises.push(...courseExercises);
      }

      setExercises(allExercises);
      setLastRefresh(new Date());

      console.log(`🎯 ${allExercises.length} exercices chargés avec succès`);

      if (forceRefresh) {
        toast.success(`${allExercises.length} exercices actualisés`);
      }

    } catch (error) {
      console.error('❌ Erreur chargement exercices:', error);
      toast.error('Erreur de chargement des exercices');
    } finally {
      setLoading(false);
      setRefreshing(false);
      stopLoading();
      loadingRef.current = false;
    }
  }, [user, loadCourseExercises, startLoading, stopLoading]);

  // Rafraîchir un exercice spécifique

  // ============ GESTION DES ÉVÉNEMENTS ============

  // Initial load
  useEffect(() => {
    if (!user) return;
    loadAllExercises();
  }, [user, loadAllExercises]);

  // Écouter les synchronisations
  useEffect(() => {
    if (!syncTrigger) return;

    console.log('🎯 Sync détectée, rafraîchissement...');

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      loadAllExercises(true);
    }, 500);

  }, [syncTrigger, loadAllExercises]);

  // Auto-refresh périodique
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const needsRefresh = exercises.some(exercise => {
        const lastUpdate = exercise.lastActivity ? new Date(exercise.lastActivity).getTime() : 0;
        return (now - lastUpdate) > 60000;
      });

      if (needsRefresh && !loadingRef.current) {
        console.log('⏰ Auto-refresh des exercices...');
        loadAllExercises();
      }
    }, 30000);

    return () => {
      clearInterval(intervalId);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, exercises, loadAllExercises]);

  // ============ HANDLERS ============

  const handleRefresh = () => {
    triggerSync();
  };

  const handleManageExercise = (exercise: ExerciseWithStats) => {
    if (!exercise.id || !exercise.courseId) {
      toast.error('Exercice invalide');
      return;
    }

    localStorage.setItem('current-exercise', JSON.stringify({
      id: exercise.id,
      courseId: exercise.courseId,
      action: 'manage'
    }));

    router.push(`/profdashboard/exercises/${exercise.courseId}/view/${exercise.id}`);
  };

  const handleViewSubmissions = (exercise: ExerciseWithStats) => {
    if (!exercise.id || !exercise.courseId) return;

    localStorage.setItem('current-exercise', JSON.stringify({
      id: exercise.id,
      courseId: exercise.courseId,
      action: 'submissions'
    }));

    router.push(`/profdashboard/exercises/${exercise.courseId}/submissions/${exercise.id}`);
  };

  const handleEditExercise = (exercise: ExerciseWithStats) => {
    if (!exercise.id || !exercise.courseId) return;

    localStorage.setItem('current-exercise', JSON.stringify({
      id: exercise.id,
      courseId: exercise.courseId,
      action: 'edit'
    }));

    router.push(`/profdashboard/exercises/${exercise.courseId}/update/${exercise.id}`);
  };

  // ============ FILTRES ============

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch =
      exercise.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.courseCategory?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    switch (selectedFilter) {
      case 'pending':
        return exercise.pendingSubmissions > 0;
      case 'graded':
        return exercise.totalSubmissions > 0 && exercise.pendingSubmissions === 0;
      default:
        return true;
    }
  });

  // ============ UTILS ============

  const getBadgeColor = (pending: number) => {
    if (pending === 0) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (pending <= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  const getExerciseStatusIcon = (pending: number) => {
    if (pending === 0) {
      return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
    }
    return <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
  };

  const formatLastRefresh = () => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);

    if (diffInSeconds < 60) return `Il y a ${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)}min`;
    return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
  };

  const totalPending = exercises.reduce((sum, ex) => sum + ex.pendingSubmissions, 0);
  const totalSubmissions = exercises.reduce((sum, ex) => sum + ex.totalSubmissions, 0);
  const gradedPercentage = totalSubmissions > 0
    ? Math.round((totalSubmissions - totalPending) / totalSubmissions * 100)
    : 0;

  // ============ RENDU ============

  if ((loading && !refreshing) || globalLoading) {
    return null;
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div id="exercises-header" className="mb-8">
          <button
            onClick={() => router.push('/profdashboard?tab=accueil')}
            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6"
          >
            <ArrowLeft size={20} />
            Retour au dashboard
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Tous mes exercices
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Gérez et suivez tous vos exercices en un seul endroit
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>

              <div id="exercises-stats" className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {exercises.length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Exercices</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {totalPending}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">À corriger</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {gradedPercentage}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Corrigés</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recherche et filtres */}
        <div id="exercises-filters" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un exercice, un cours..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg border transition-colors ${selectedFilter === 'all'
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedFilter('pending')}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${selectedFilter === 'pending'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <AlertCircle className="w-4 h-4" />
                À corriger
              </button>
              <button
                onClick={() => setSelectedFilter('graded')}
                className={`px-4 py-2 rounded-lg border transition-colors ${selectedFilter === 'graded'
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                Corrigés
              </button>
            </div>
          </div>
        </div>

        {/* Liste des exercices */}
        <div id="exercises-list" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">
                {filteredExercises.length} exercice(s) trouvé(s)
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Dernière actualisation: {formatLastRefresh()}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredExercises.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'Aucun exercice correspondant à votre recherche' : 'Aucun exercice créé pour le moment'}
                </p>
                {!searchTerm && exercises.length === 0 && (
                  <button
                    onClick={() => router.push('/profdashboard/courses/create')}
                    className="mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Créer votre premier cours
                  </button>
                )}
              </div>
            ) : (
              filteredExercises.map((exercise) => (
                <div
                  key={`${exercise.id}-${exercise.lastActivity}`}
                  className={`p-6 transition-all duration-300 relative ${exercise.isUpdating ? 'bg-blue-50 dark:bg-blue-900/20' :
                    exercise.hasUpdates ? 'bg-green-50 dark:bg-green-900/20' :
                      'hover:bg-gray-50 dark:hover:bg-gray-900/30'
                    }`}
                >
                  {exercise.isUpdating && (
                    <div className="absolute top-4 right-4">
                      <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                          {exercise.courseCategory || 'Non catégorisé'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {exercise.courseTitle}
                        </span>

                        {exercise.pendingSubmissions > 0 && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getBadgeColor(exercise.pendingSubmissions)}`}>
                            {getExerciseStatusIcon(exercise.pendingSubmissions)}
                            {exercise.pendingSubmissions} à corriger
                          </span>
                        )}

                        {exercise.totalSubmissions === 0 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            Aucune soumission
                          </span>
                        )}
                      </div>

                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            {exercise.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                            {exercise.description || 'Pas de description'}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="font-bold text-gray-800 dark:text-gray-200">
                              {exercise.maxScore} pts
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Score max
                            </div>
                          </div>

                          {exercise.totalSubmissions > 0 && (
                            <div className="text-center">
                              <div className="font-bold text-gray-800 dark:text-gray-200">
                                {exercise.averageScore.toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Moyenne
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {exercise.totalSubmissions > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">
                              Soumissions: {exercise.totalSubmissions - exercise.pendingSubmissions} corrigées sur {exercise.totalSubmissions}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {exercise.totalSubmissions > 0
                                ? Math.round(((exercise.totalSubmissions - exercise.pendingSubmissions) / exercise.totalSubmissions) * 100)
                                : 0
                              }%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${((exercise.totalSubmissions - exercise.pendingSubmissions) / exercise.totalSubmissions) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {exercise.totalSubmissions} soumissions
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {exercise.questions?.length || 0} questions
                        </span>
                        {exercise.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Échéance: {new Date(exercise.dueDate).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          Publié
                        </span>
                      </div>
                    </div>

                    <div className="ml-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleManageExercise(exercise)}
                          className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 min-w-[120px]"
                        >

                          <AlertCircle className="w-4 h-4" />
                          gerer

                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewSubmissions(exercise)}
                            disabled={exercise.totalSubmissions === 0}
                            className="flex-1 px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Soumissions
                          </button>
                          <button
                            onClick={() => handleEditExercise(exercise)}
                            className="flex-1 px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            Éditer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Légende */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Statut des soumissions</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Plus de 3 soumissions à corriger</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>1-3 soumissions à corriger</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Toutes les soumissions corrigées</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Mises à jour</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                  <span>En cours de mise à jour</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Récemment mis à jour</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 text-gray-500" />
                  <span>Auto-refresh toutes les 30s</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Actions</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>• Cliquez sur &quot;Actualiser&quot; pour forcer le rafraîchissement</p>
                <p>• Les modifications se synchronisent entre onglets</p>
                <p>• Les exercices sont mis en cache pour 30s</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}