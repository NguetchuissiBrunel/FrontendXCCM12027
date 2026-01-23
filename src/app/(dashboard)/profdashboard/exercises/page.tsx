// app/(dashboard)/profdashboard/exercises/page.tsx - VERSION AVEC RAFRAÎCHISSEMENT
'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Exercise, Submission } from '@/types/exercise';

interface ExerciseWithStats extends Exercise {
  courseTitle: string;
  courseId: number;
  courseCategory?: string;
  pendingSubmissions?: number;
  totalSubmissions?: number;
  averageScore?: number;
  submissionStats?: {
    graded: number;
    pending: number;
    total: number;
  };
  lastUpdated: string; // Pour suivre les mises à jour
}

export default function AllExercisesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [exercises, setExercises] = useState<ExerciseWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fonction pour charger les exercices
  const loadAllExercises = useCallback(async () => {
    if (!user) return;

    try {
      setRefreshing(true);

      // 1. Récupérer tous les cours du professeur
      const coursesResponse = await CourseControllerService.getAuthorCourses(user.id);
      const coursesData = coursesResponse.data || [];
      setCourses(coursesData);

      // 2. Pour chaque cours, récupérer les exercices et leurs stats
      const allExercises: ExerciseWithStats[] = [];
      
      for (const course of coursesData) {
        const courseId = course.id;
        if (!courseId) continue;
        
        try {
          const exercisesResponse = await ExercicesService.getExercisesForCourse(courseId);
          const courseExercises = exercisesResponse.data || [];
          
          // Pour chaque exercice, charger les statistiques de soumissions
          for (const exerciseData of courseExercises) {
            try {
              // Vérifier que l'ID de l'exercice existe
              const exerciseId = exerciseData.id;
              if (!exerciseId || typeof exerciseId !== 'number') {
                console.warn(`Exercice sans ID valide dans le cours ${courseId}:`, exerciseData);
                continue;
              }

              // Obtenir l'exercice complet avec le service unifié
              const fullExercise = await ExerciseService.getExerciseDetails(exerciseId);
              if (!fullExercise) {
                console.warn(`Exercice ${exerciseId} non trouvé par le service unifié`);
                continue;
              }

              // Charger les soumissions pour cet exercice
              let submissionStats = { graded: 0, pending: 0, total: 0 };
              let averageScore = 0;
              
              try {
                const submissions = await ExerciseService.getExerciseSubmissions(exerciseId);
                
                const gradedSubmissions = submissions.filter((s: Submission) => s.graded);
                const pendingSubmissions = submissions.filter((s: Submission) => !s.graded);
                
                submissionStats = {
                  graded: gradedSubmissions.length,
                  pending: pendingSubmissions.length,
                  total: submissions.length
                };
                
                // Calculer le score moyen
                if (gradedSubmissions.length > 0) {
                  const totalScore = gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
                  averageScore = Math.round((totalScore / gradedSubmissions.length) * 10) / 10;
                }
              } catch (submissionError) {
                console.warn(`Erreur chargement soumissions exercice ${exerciseId}:`, submissionError);
              }

              const exerciseWithStats: ExerciseWithStats = {
                ...fullExercise,
                courseTitle: course.title || 'Sans titre',
                courseId: courseId,
                courseCategory: course.category || 'Non catégorisé',
                pendingSubmissions: submissionStats.pending,
                totalSubmissions: submissionStats.total,
                averageScore,
                submissionStats,
                lastUpdated: new Date().toISOString() // Timestamp de mise à jour
              };
              
              allExercises.push(exerciseWithStats);
            } catch (exerciseError) {
              console.error(`Erreur traitement exercice dans cours ${courseId}:`, exerciseError);
              // Fallback: exercice sans stats
              const fallbackExercise: ExerciseWithStats = {
                id: exerciseData.id || 0,
                courseId: courseId,
                title: exerciseData.title || 'Exercice sans titre',
                description: exerciseData.description || '',
                maxScore: exerciseData.maxScore || 0,
                status: 'PUBLISHED',
                createdAt: exerciseData.createdAt || new Date().toISOString(),
                questions: [],
                version: '1.0',
                courseTitle: course.title || 'Sans titre',
                courseCategory: course.category || 'Non catégorisé',
                pendingSubmissions: 0,
                totalSubmissions: 0,
                averageScore: 0,
                submissionStats: { graded: 0, pending: 0, total: 0 },
                lastUpdated: new Date().toISOString()
              };
              allExercises.push(fallbackExercise);
            }
          }
        } catch (error) {
          console.error(`Erreur chargement exercices cours ${courseId}:`, error);
          toast.error(`Erreur chargement exercices pour le cours: ${course.title}`);
        }
      }

      setExercises(allExercises);
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error('Erreur chargement des exercices:', error);
      toast.error('Erreur de chargement des exercices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Chargement initial
  useEffect(() => {
    if (!user) return;
    loadAllExercises();
  }, [user, loadAllExercises]);

  // Rafraîchissement automatique toutes les 30 secondes
  useEffect(() => {
    if (!user) return;
    
    const intervalId = setInterval(() => {
      console.log('Auto-refresh des exercices...');
      loadAllExercises();
    }, 30000); // 30 secondes

    return () => clearInterval(intervalId);
  }, [user, loadAllExercises]);

  // Rafraîchissement manuel
  const handleRefresh = () => {
    setRefreshing(true);
    loadAllExercises();
    toast.success('Liste des exercices actualisée');
  };

  // Mise à jour d'un exercice spécifique (à appeler après notation)
  const updateExerciseStats = async (exerciseId: number) => {
    try {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      if (!exercise) return;

      // Recharger les stats pour cet exercice
      const submissions = await ExerciseService.getExerciseSubmissions(exerciseId);
      
      const gradedSubmissions = submissions.filter((s: Submission) => s.graded);
      const pendingSubmissions = submissions.filter((s: Submission) => !s.graded);
      
      const submissionStats = {
        graded: gradedSubmissions.length,
        pending: pendingSubmissions.length,
        total: submissions.length
      };
      
      let averageScore = 0;
      if (gradedSubmissions.length > 0) {
        const totalScore = gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
        averageScore = Math.round((totalScore / gradedSubmissions.length) * 10) / 10;
      }

      // Mettre à jour l'exercice dans la liste
      setExercises(prev => prev.map(ex => 
        ex.id === exerciseId 
          ? { 
              ...ex, 
              pendingSubmissions: submissionStats.pending,
              totalSubmissions: submissionStats.total,
              averageScore,
              submissionStats,
              lastUpdated: new Date().toISOString()
            } 
          : ex
      ));

      toast.success('Statistiques mises à jour');
      
    } catch (error) {
      console.error('Erreur mise à jour stats:', error);
    }
  };

  // Gérer la navigation avec callback pour rafraîchir
  const handleManageExercise = (exercise: ExerciseWithStats) => {
    if (!exercise.id || !exercise.courseId) {
      toast.error('Erreur: Exercice invalide');
      return;
    }
    
    // Stocker un callback pour la mise à jour
    sessionStorage.setItem('refreshOnReturn', 'true');
    sessionStorage.setItem('exerciseToUpdate', exercise.id.toString());
    
    // Rediriger vers la page de soumissions si il y en a
    if (exercise.pendingSubmissions && exercise.pendingSubmissions > 0) {
      router.push(`/profdashboard/exercises/${exercise.courseId}/submissions/${exercise.id}`);
    } else {
      router.push(`/profdashboard/exercises/${exercise.courseId}/view/${exercise.id}`);
    }
  };

  // Vérifier si on doit rafraîchir au retour
  useEffect(() => {
    const shouldRefresh = sessionStorage.getItem('refreshOnReturn');
    const exerciseIdToUpdate = sessionStorage.getItem('exerciseToUpdate');
    
    if (shouldRefresh === 'true') {
      if (exerciseIdToUpdate) {
        updateExerciseStats(parseInt(exerciseIdToUpdate));
      } else {
        loadAllExercises();
      }
      
      // Nettoyer le sessionStorage
      sessionStorage.removeItem('refreshOnReturn');
      sessionStorage.removeItem('exerciseToUpdate');
    }
  }, [loadAllExercises]);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = 
      exercise.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (selectedFilter) {
      case 'pending':
        return (exercise.submissionStats?.pending || 0) > 0;
      case 'graded':
        return (exercise.submissionStats?.graded || 0) > 0;
      default:
        return true;
    }
  });

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

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des exercices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/profdashboard')}
            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6"
          >
            <ArrowLeft size={20} />
            Retour au dashboard
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                Tous mes exercices
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Vue d'ensemble de tous les exercices et leurs soumissions
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Bouton rafraîchir */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
                <span className="text-xs text-gray-500">{formatLastRefresh()}</span>
              </button>
              
              {/* Statistiques globales */}
              <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {exercises.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Exercices</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {exercises.reduce((sum, ex) => sum + (ex.pendingSubmissions || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">À corriger</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recherche et filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-purple-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un exercice, un cours ou un étudiant..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedFilter('pending')}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  selectedFilter === 'pending'
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                À corriger
              </button>
              <button
                onClick={() => setSelectedFilter('graded')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedFilter === 'graded'
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">
                {filteredExercises.length} exercice(s) trouvé(s)
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  {exercises.reduce((sum, ex) => sum + (ex.pendingSubmissions || 0), 0)} à corriger
                </span>
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
                  key={`${exercise.id}-${exercise.lastUpdated}`} 
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                          {exercise.courseCategory}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {exercise.courseTitle}
                        </span>
                        
                        {/* Badge de statut des soumissions */}
                        {(exercise.pendingSubmissions || 0) > 0 && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getBadgeColor(exercise.pendingSubmissions || 0)}`}>
                            {getExerciseStatusIcon(exercise.pendingSubmissions || 0)}
                            {exercise.pendingSubmissions} à corriger
                          </span>
                        )}
                        
                        {/* Indicateur de mise à jour récente */}
                        {Date.now() - new Date(exercise.lastUpdated).getTime() < 60000 && ( // < 1 minute
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                            Récemment mis à jour
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            {exercise.title || 'Exercice sans titre'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                            {exercise.description || 'Pas de description'}
                          </p>
                        </div>
                        
                        {/* Statistiques rapides */}
                        <div className="flex items-center gap-4 text-sm">
                          {(exercise.totalSubmissions || 0) > 0 && (
                            <div className="text-center">
                              <div className="font-bold text-gray-800 dark:text-gray-200">
                                {exercise.totalSubmissions}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Soumissions
                              </div>
                            </div>
                          )}
                          
                          {exercise.averageScore && exercise.averageScore > 0 && (
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
                      
                      {/* Barre de progression des soumissions */}
                      {(exercise.totalSubmissions || 0) > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">
                              Soumissions: {exercise.submissionStats?.graded || 0} corrigées / {exercise.totalSubmissions} total
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {Math.round(((exercise.submissionStats?.graded || 0) / (exercise.totalSubmissions || 1)) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${((exercise.submissionStats?.graded || 0) / (exercise.totalSubmissions || 1)) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {exercise.totalSubmissions || 0} soumissions
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          Score max: {exercise.maxScore || 0} pts
                        </span>
                        {exercise.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Échéance: {new Date(exercise.dueDate).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        <span className={`flex items-center gap-1 ${
                          exercise.status === 'PUBLISHED' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          <CheckCircle className="w-4 h-4" />
                          {exercise.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {/* Menu d'actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleManageExercise(exercise)}
                          className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                          {(exercise.pendingSubmissions || 0) > 0 ? (
                            <>
                              <AlertCircle className="w-4 h-4" />
                              Corriger ({exercise.pendingSubmissions})
                            </>
                          ) : (
                            'Gérer'
                          )}
                        </button>
                        
                        {(exercise.totalSubmissions || 0) > 0 && (
                          <button
                            onClick={() => router.push(`/profdashboard/exercises/${exercise.courseId}/submissions/${exercise.id}`)}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <BarChart3 className="w-4 h-4" />
                            Statistiques
                          </button>
                        )}
                      </div>
                      
                      {/* Actions secondaires */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/profdashboard/exercises/${exercise.courseId}/view/${exercise.id}`)}
                          className="flex-1 px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => router.push(`/profdashboard/exercises/${exercise.courseId}/duplicate/${exercise.id}`)}
                          className="flex-1 px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Dupliquer
                        </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Statut des soumissions</h4>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>• Auto-rafraîchissement toutes les 30 secondes</p>
                <p>• Cliquez sur "Actualiser" pour forcer le rafraîchissement</p>
                <p>• Les exercices notés récemment sont mis en évidence</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}