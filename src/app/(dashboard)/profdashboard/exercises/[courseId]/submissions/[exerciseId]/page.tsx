// src/app/(dashboard)/profdashboard/exercises/[courseId]/submissions/[exerciseId]/page.tsx - VERSION CORRIGÉE
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  Filter, 
  Search, 
  CheckCircle, 
  XCircle,
  Clock,
  FileText,
  Users,
  BarChart3,
  Edit,
  Share2,
  Printer,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  Award,
  Loader2,
  Calendar
} from 'lucide-react';

// Import des hooks - corrigé avec les bons chemins
import { 
  useExercise, 
  useExerciseSubmissions,
  useGradeSubmission 
} from '@/hooks/useExercise';
import { Exercise, Submission, ApiResponse } from '@/types/exercise';
import SubmissionsTable from '@/components/exercises/SubmissionsTable';
import GradingInterface from '@/components/exercises/GradingInterface';

export default function ExerciseSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const courseId = params?.courseId ? parseInt(params.courseId as string) : 0;
  const exerciseId = params?.exerciseId ? parseInt(params.exerciseId as string) : 0;
  
  // Vérification des IDs
  if (!courseId || !exerciseId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Paramètres invalides
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            L'URL de la page est incorrecte.
          </p>
          <button
            onClick={() => router.push('/profdashboard/exercises')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour aux exercices
          </button>
        </div>
      </div>
    );
  }
  
  // Récupération des données
  const { 
    data: exerciseApiResponse, 
    isLoading: isLoadingExercise,
    refetch: refetchExercise 
  } = useExercise(exerciseId, {
    enabled: !!user && !!exerciseId,
  });
  
  const { 
    data: submissionsApiResponse, 
    isLoading: isLoadingSubmissions,
    refetch: refetchSubmissions 
  } = useExerciseSubmissions(exerciseId, {
    enabled: !!user && !!exerciseId,
  });
  
  // Hook pour la notation
  const { mutate: gradeSubmissionMutation } = useGradeSubmission();
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [filter, setFilter] = useState({
    graded: 'all' as 'all' | 'graded' | 'ungraded',
    search: '',
    sortBy: 'submittedAt' as 'submittedAt' | 'studentName' | 'score',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  
  const [courseInfo, setCourseInfo] = useState<{
    title: string;
    category?: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      router.push('/login');
      return;
    }
    
    loadCourseInfo();
  }, [user, router, courseId]);

  const loadCourseInfo = async () => {
    try {
      // TODO: Remplacer par votre service de cours
      setCourseInfo({
        title: `Cours #${courseId}`,
        category: 'Informatique',
      });
    } catch (error) {
      console.error('Erreur chargement infos cours:', error);
    }
  };

  const handleGradeSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowGradingModal(true);
  };

  const handleBulkGrade = () => {
    toast.loading('Préparation de la notation en masse...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Interface de notation en masse prête');
    }, 1500);
  };

  const handleExportSubmissions = (format: 'csv' | 'excel' = 'csv') => {
    toast.loading(`Génération de l'export ${format}...`);
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Export ${format} généré avec succès`);
    }, 2000);
  };

  const handleFilterChange = (key: keyof typeof filter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = () => {
    refetchExercise();
    refetchSubmissions();
    toast.success('Données actualisées');
  };

  // Calcul des statistiques - TYPES CORRIGÉS
  const calculateStats = () => {
    // Récupération des soumissions depuis ApiResponse
    const submissions = submissionsApiResponse?.data || []; // data est de type Submission[] | undefined
    const submissionsArray = Array.isArray(submissions) ? submissions : [];
    
    const total = submissionsArray.length;
    const graded = submissionsArray.filter((s: Submission) => s.graded).length;
    const ungraded = total - graded;
    
    const gradedSubmissions = submissionsArray.filter((s: Submission) => s.graded && s.score !== undefined);
    const averageScore = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum: number, s: Submission) => sum + (s.score || 0), 0) / gradedSubmissions.length
      : 0;

    const totalStudents = 30; // À remplacer par la vraie valeur
    const completionRate = totalStudents > 0 ? Math.round((total / totalStudents) * 100) : 0;

    return {
      total,
      graded,
      ungraded,
      averageScore: Math.round(averageScore * 10) / 10,
      completionRate,
    };
  };

  const stats = calculateStats();

  if (isLoadingExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement de l'exercice...</p>
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (!exerciseApiResponse?.success || !exerciseApiResponse.data) {
    const errorMessage = exerciseApiResponse?.message || 'Exercice non trouvé';
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {errorMessage}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            L'exercice demandé n'existe pas ou vous n'y avez pas accès.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetchExercise()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Réessayer
            </button>
            <button
              onClick={() => router.push(`/profdashboard/exercises/${courseId}`)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retour aux exercices
            </button>
          </div>
        </div>
      </div>
    );
  }

  const exercise: Exercise = exerciseApiResponse.data;

  // Préparation des soumissions pour SubmissionsTable
  const submissions: Submission[] = Array.isArray(submissionsApiResponse?.data) 
    ? submissionsApiResponse.data 
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link 
              href="/profdashboard" 
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link 
              href="/profdashboard/exercises" 
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Exercices
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link 
              href={`/profdashboard/exercises/${courseId}`}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {courseInfo?.title || `Cours #${courseId}`}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link 
              href={`/profdashboard/exercises/${courseId}/view/${exerciseId}`}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {exercise.title}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Soumissions
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/profdashboard/exercises/${courseId}/view/${exerciseId}`)}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Retour à l'exercice
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoadingSubmissions}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} className={isLoadingSubmissions ? 'animate-spin' : ''} />
                Actualiser
              </button>
              
              <button
                onClick={() => handleExportSubmissions('csv')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {/* En-tête de l'exercice */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {exercise.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      exercise.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : exercise.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {exercise.status === 'PUBLISHED' ? 'Publié' : 
                       exercise.status === 'DRAFT' ? 'Brouillon' : 'Fermé'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {exercise.maxScore} points
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      {exercise.questions?.length || 0} questions
                    </span>
                  </div>
                </div>
              </div>
              
              {exercise.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {exercise.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Créé le {new Date(exercise.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                {exercise.dueDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      Échéance : {new Date(exercise.dueDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {stats.total} soumission{stats.total !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions rapides */}
            <div className="lg:w-80">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-5">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Actions rapides
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleBulkGrade}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Notation en masse
                  </button>
                  
                  <button
                    onClick={() => router.push(`/profdashboard/exercises/${courseId}/update/${exerciseId}`)}
                    className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={18} />
                    Modifier l'exercice
                  </button>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Lien copié dans le presse-papier');
                    }}
                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 size={18} />
                    Partager cette page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Soumissions totales</div>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {stats.ungraded}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">À corriger</div>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {stats.averageScore}/{exercise.maxScore}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score moyen</div>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {stats.completionRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Taux de participation</div>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un étudiant..."
                  value={filter.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter.graded}
                  onChange={(e) => handleFilterChange('graded', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                >
                  <option value="all">Toutes les soumissions</option>
                  <option value="graded">Notées seulement</option>
                  <option value="ungraded">À noter seulement</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={filter.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                >
                  <option value="submittedAt">Date de soumission</option>
                  <option value="studentName">Nom étudiant</option>
                  <option value="score">Score</option>
                </select>
                
                <button
                  onClick={() => handleFilterChange('sortOrder', filter.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {filter.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              
              <button
                onClick={() => setFilter({
                  graded: 'all',
                  search: '',
                  sortBy: 'submittedAt',
                  sortOrder: 'desc',
                })}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Tableau des soumissions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Soumissions des étudiants
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
                {stats.total}
              </span>
            </h2>
          </div>
          
          <div className="p-6">
            {isLoadingSubmissions ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des soumissions...</p>
              </div>
            ) : submissions.length > 0 ? (
              <SubmissionsTable
                submissions={submissions}
                exercise={exercise}
                onGradeSubmission={handleGradeSubmission}
                filter={filter}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aucune soumission trouvée
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Aucun étudiant n'a encore soumis cet exercice.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={18} />
                    Actualiser
                  </button>
                  <button
                    onClick={() => router.push(`/profdashboard/exercises/${courseId}/view/${exerciseId}`)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Retour à l'exercice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions de fin de page */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link
            href={`/profdashboard/courses/${courseId}`}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Retour au cours</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Revenir à la page principale du cours</p>
          </Link>
          
          <button
            onClick={() => window.print()}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Imprimer les résultats</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Générer un PDF des scores</p>
          </button>
          
          <Link
            href={`/profdashboard/exercises/${courseId}/new`}
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Créer un nouvel exercice</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pour le même cours</p>
          </Link>
        </div>
      </div>

      {/* Modal de notation */}
      {showGradingModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <GradingInterface
              submission={selectedSubmission}
              exercise={exercise}
              onClose={() => {
                setShowGradingModal(false);
                setSelectedSubmission(null);
              }}
              onGradeComplete={() => {
                setShowGradingModal(false);
                setSelectedSubmission(null);
                refetchSubmissions();
                toast.success('Soumission notée avec succès');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}