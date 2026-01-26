// src/app/(dashboard)/profdashboard/exercises/[courseId]/page.tsx - VERSION CORRIGÉE AVEC SERVICE
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { 
  Calendar,
  Users,
  Award,
  BarChart3,
  FileText,
  ChevronRight,
  Download,
  Filter,
  Search,
  PlusCircle,
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  Copy,
  Loader2,
  BookOpen,
  TrendingUp
} from 'lucide-react';

// Import des services
import { ExerciseService } from '@/lib3/services/ExerciseService';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { Exercise as BaseExercise } from '@/types/exercise';


import { useAuth } from '@/contexts/AuthContext';
// Étendre le type Exercise pour inclure 'DRAFT'
type Exercise = BaseExercise & { status: 'PUBLISHED' | 'DRAFT' | 'CLOSED' | 'ARCHIVED' };
// Types pour les réponses du service de cours
interface CourseResponse {
  id: number;
  title: string;
  description: string;
  category?: string;
  authorId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  viewCount: number;
  likeCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface EnrichedCourseResponse extends CourseResponse {
  studentCount: number;
  exerciseCount: number;
  averageRating?: number;
}

export default function CourseExercisesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const courseId = params?.courseId ? parseInt(params.courseId as string) : 0;
  
  // Vérification du courseId
  if (!courseId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Cours non trouvé
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
  
  const [courseInfo, setCourseInfo] = useState<EnrichedCourseResponse>({
    id: courseId,
    title: `Cours #${courseId}`,
    description: 'Chargement...',
    category: '',
    authorId: '',
    status: 'DRAFT',
    viewCount: 0,
    likeCount: 0,
    downloadCount: 0,
    studentCount: 0,
    exerciseCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      router.push('/login');
      return;
    }
    
    loadCourseInfo();
    loadExercises();
  }, [courseId, user, router]);

  const loadCourseInfo = async () => {
    try {
      setLoadingCourse(true);
      const response = await CourseControllerService.getEnrichedCourse(courseId);
      
      if (response.data) {
        const courseData = response.data as EnrichedCourseResponse;
        setCourseInfo(courseData);
      } else {
        toast.error('Impossible de charger les informations du cours');
      }
    } catch (error: any) {
      console.error('Erreur chargement infos cours:', error);
      toast.error(error.message || 'Impossible de charger les informations du cours');
    } finally {
      setLoadingCourse(false);
    }
  };

  const loadExercises = async () => {
    try {
      setLoading(true);
      const exercisesData = await ExerciseService.getExercisesForCourse(courseId);
      setExercises(exercisesData || []);
    } catch (error: any) {
      console.error('Erreur chargement exercices:', error);
      toast.error(error.message || 'Impossible de charger les exercices');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: number, exerciseTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'exercice "${exerciseTitle}" ?`)) {
      return;
    }
    
    try {
      const success = await ExerciseService.deleteExercise(exerciseId);
      if (success) {
        toast.success('✅ Exercice supprimé avec succès');
        loadExercises(); // Recharger la liste
      } else {
        toast.error('❌ Erreur lors de la suppression');
      }
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleDuplicateExercise = async (exerciseId: number) => {
    try {
      toast.loading('Duplication en cours...');
      const result = await ExerciseService.duplicateExercise(exerciseId, courseId);
      
      toast.dismiss();
      
      if (result.success) {
        toast.success('✅ Exercice dupliqué avec succès');
        loadExercises(); // Recharger la liste
      } else {
        toast.error(result.message || '❌ Erreur lors de la duplication');
      }
    } catch (error: any) {
      toast.dismiss();
      console.error('Erreur duplication:', error);
      toast.error(error.message || 'Erreur lors de la duplication');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non définie';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    
    switch (status) {
      case 'PUBLISHED': 
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'CLOSED':
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status?: string) => {
    if (!status) return 'Inconnu';
    
    switch (status) {
      case 'PUBLISHED': return 'Publié';
      case 'DRAFT': return 'Brouillon';
      case 'CLOSED': return 'Fermé';
      case 'ARCHIVED': return 'Archivé';
      default: return status;
    }
  };

  // Filtrer les exercices
  const filteredExercises = exercises.filter(exercise => {
    // Filtre par recherche
    const matchesSearch = searchTerm === '' || 
      exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exercise.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // Filtre par statut
    const matchesStatus = filterStatus === 'all' || 
      exercise.status === filterStatus.toUpperCase();
    
    return matchesSearch && matchesStatus;
  });

  // Calculer les statistiques
  const stats = {
    totalExercises: exercises.length,
    publishedExercises: exercises.filter(e => e.status === 'PUBLISHED').length,
    draftExercises: exercises.filter(e => e.status === 'DRAFT').length,
    closedExercises: exercises.filter(e => e.status === 'CLOSED' || e.status === 'ARCHIVED').length,
    totalSubmissions: exercises.reduce((sum, e) => sum + (e.submissionCount || e.submissionCount || 0), 0),
    averageScore: exercises.length > 0 
      ? Math.round(exercises.reduce((sum, e) => sum + (e.averageScore || 0), 0) / exercises.length * 10) / 10
      : 0
  };

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des informations du cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8">
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
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {courseInfo.title}
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/profdashboard/exercises')}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Retour aux cours
            </button>
            
            <Link
              href={`/profdashboard/exercises/${courseId}/create`}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Créer un exercice
            </Link>
          </div>
        </div>

        {/* En-tête du cours */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl">
                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        {courseInfo.title}
                      </h1>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        courseInfo.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : courseInfo.status === 'DRAFT'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {courseInfo.status === 'PUBLISHED' ? 'Publié' :
                         courseInfo.status === 'DRAFT' ? 'Brouillon' : 'Archivé'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {courseInfo.description}
                    </p>
                    {courseInfo.category && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 rounded-full text-sm font-medium">
                          {courseInfo.category}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Créé le {formatDate(courseInfo.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                          {stats.totalExercises}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Exercices
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                          {courseInfo.studentCount || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Étudiants
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-purple-500" />
                      <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                          {stats.averageScore || '--'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Moyenne
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                          {courseInfo.viewCount || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Vues
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un exercice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="published">Publiés</option>
                <option value="draft">Brouillons</option>
                <option value="closed">Fermés/Archivés</option>
              </select>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Réinitialiser les filtres"
              >
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Liste des exercices */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Exercices du cours
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {filteredExercises.length} exercice{filteredExercises.length !== 1 ? 's' : ''} trouvé{filteredExercises.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <Link
                href={`/profdashboard/exercises/${courseId}/create`}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
              >
                <PlusCircle size={18} />
                Créer un exercice
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des exercices...</p>
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aucun exercice trouvé
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  {exercises.length === 0 
                    ? 'Ce cours ne contient pas encore d\'exercices. Créez votre premier exercice !'
                    : 'Aucun exercice ne correspond à vos critères de recherche.'
                  }
                </p>
                <Link
                  href={`/profdashboard/exercises/${courseId}/create`}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium inline-flex items-center gap-2"
                >
                  <PlusCircle size={18} />
                  Créer un exercice
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExercises.map((exercise) => (
                  <div 
                    key={exercise.id} 
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                {exercise.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exercise.status)}`}>
                                {getStatusText(exercise.status)}
                              </span>
                            </div>
                            
                            {exercise.description && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                {exercise.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-3 text-sm">
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <Calendar size={14} />
                                <span>Échéance: {formatDate(exercise.dueDate)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <Award size={14} />
                                <span>{exercise.maxScore} points</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <Users size={14} />
                                <span>{exercise.submissionCount || exercise.submissionCount || 0} soumissions</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <FileText size={14} />
                                <span>{exercise.questions?.length || 0} questions</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDuplicateExercise(exercise.id)}
                          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Dupliquer"
                        >
                          <Copy size={18} />
                        </button>
                        
                        <Link
                          href={`/profdashboard/exercises/${courseId}/view/${exercise.id}`}
                          className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye size={18} />
                        </Link>
                        
                        <Link
                          href={`/profdashboard/exercises/${courseId}/update/${exercise.id}`}
                          className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteExercise(exercise.id, exercise.title)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Statistiques avancées
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Consultez des analyses détaillées sur les performances des étudiants et la progression du cours
            </p>
            <button 
              onClick={() => router.push(`/profdashboard/analytics/${courseId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voir les analyses
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Export des données
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Exportez les résultats des exercices au format CSV ou Excel pour analyse externe
            </p>
            <button 
              onClick={() => {
                toast.loading('Préparation de l\'export...');
                setTimeout(() => {
                  toast.dismiss();
                  toast.success('Export prêt au téléchargement');
                }, 1500);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Exporter les données
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}