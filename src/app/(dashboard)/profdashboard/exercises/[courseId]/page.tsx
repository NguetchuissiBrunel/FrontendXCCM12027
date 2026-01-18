// src/app/(dashboard)/profdashboard/exercises/[courseId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { EnseignantService } from '@/lib/services/EnseignantService';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import type { Exercise } from '@/types/exercise';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  BarChart3,
  Calendar,
  FileText,
  Users,
  ArrowLeft,
  BookOpen,
  Filter,
  Search,
  Clock,
  Award,
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLoading } from '@/contexts/LoadingContext';

// Interface locale étendue avec les propriétés supplémentaires
interface LocalExercise extends Exercise {
  pendingCount?: number;
  difficulty?: string;
  duration?: number;
}

export default function CourseExercisesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.courseId as string);

  const [exercises, setExercises] = useState<LocalExercise[]>([]);
  const { startLoading, stopLoading, isLoading: globalLoading } = useLoading();

  // Plus besoin du useEffect local
  const [courseInfo, setCourseInfo] = useState<{
    title: string;
    category?: string;
    description?: string;
    status?: string;
  } | null>(null);

  // États pour les filtres
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  useEffect(() => {
    loadExercises();
    loadCourseInfo();
  }, [courseId]);

  const loadExercises = async () => {
    try {
      startLoading();
      const resp = await ExercicesService.getExercisesForCourse(courseId);
      const list = (resp as any)?.data || [];
      // Map Api ExerciseResponse -> local Exercise shape with defaults
      const mapped: LocalExercise[] = list.map((e: any) => ({
        id: e.id ?? 0,
        courseId: e.courseId ?? courseId,
        title: e.title ?? '',
        description: e.description ?? '',
        maxScore: e.maxScore ?? 0,
        dueDate: e.dueDate ?? '',
        createdAt: e.createdAt ?? new Date().toISOString(),
        status: (e.status as any) || 'DRAFT',
        submissionsCount: e.submissionsCount ?? 0,
        pendingCount: e.pendingCount ?? 0,
        difficulty: e.difficulty || 'medium',
        duration: e.duration || 0,
      }));
      setExercises(mapped);
    } catch (error) {
      console.error('Erreur chargement exercices:', error);
      toast.error('Erreur lors du chargement des exercices');
    } finally {
      stopLoading();
    }
  };

  const loadCourseInfo = async () => {
    try {
      // Essayer de récupérer les infos du cours depuis l'API
      // Si l'API n'existe pas, on peut essayer d'autres méthodes
      const response = await CourseControllerService.getAuthorCourses('current');
      const courses = response.data as any[];
      const currentCourse = courses?.find(c => c.id === courseId);

      if (currentCourse) {
        setCourseInfo({
          title: currentCourse.title || `Cours #${courseId}`,
          category: currentCourse.category || 'Non spécifié',
          description: currentCourse.description,
          status: currentCourse.status
        });
      } else {
        // Fallback si on ne trouve pas le cours
        setCourseInfo({
          title: `Cours #${courseId}`,
          category: 'Non spécifié'
        });
      }
    } catch (error) {
      console.error('Erreur chargement infos cours:', error);
      // Fallback
      setCourseInfo({
        title: `Cours #${courseId}`,
        category: 'Non spécifié'
      });
    }
  };

  const handleCreateExercise = () => {
    router.push(`/profdashboard/exercises/${courseId}/create`);
  };

  const handleEditExercise = (exerciseId: number) => {
    router.push(`/profdashboard/exercises/${courseId}/update/${exerciseId}`);
  };

  const handleViewSubmissions = (exerciseId: number) => {
    router.push(`/profdashboard/exercises/${courseId}/submissions/${exerciseId}`);
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
      try {
        await EnseignantService.deleteExercise(exerciseId);
        toast.success('Exercice supprimé avec succès');
        loadExercises(); // Recharger la liste
      } catch (error) {
        console.error('Erreur suppression exercice:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handlePublishExercise = async (exerciseId: number) => {
    try {
      await EnseignantService.updateExercise(exerciseId, { status: 'PUBLISHED' } as any);
      toast.success('Exercice publié');
      loadExercises();
    } catch (error) {
      console.error('Erreur publication:', error);
      toast.error('Erreur lors de la publication');
    }
  };

  const handleCloseExercise = async (exerciseId: number) => {
    try {
      await EnseignantService.updateExercise(exerciseId, { status: 'CLOSED' } as any);
      toast.success('Exercice fermé');
      loadExercises();
    } catch (error) {
      console.error('Erreur fermeture:', error);
      toast.error('Erreur lors de la fermeture');
    }
  };

  // Filtrer les exercices
  const filteredExercises = exercises.filter(exercise => {
    // Filtre par statut
    if (filter !== 'all' && exercise.status?.toLowerCase() !== filter) {
      return false;
    }

    // Filtre par recherche
    if (search && !exercise.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Calculer les statistiques
  const totalSubmissions = exercises.reduce((sum, e) => sum + (e.submissionsCount || 0), 0);
  const totalPending = exercises.reduce((sum, e) => sum + (e.pendingCount || 0), 0);
  const publishedCount = exercises.filter(e => e.status === 'PUBLISHED').length;
  const draftCount = exercises.filter(e => e.status === 'DRAFT').length;

  if (globalLoading && exercises.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* En-tête avec navigation */}
        <div className="mb-8 pt-4">
          <button
            onClick={() => router.push('/profdashboard')}
            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Retour au dashboard
          </button>

          {/* En-tête principal avec infos du cours */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm dark:shadow-gray-900/30 border border-purple-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl">
                  <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {courseInfo?.title || `Cours #${courseId}`}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        {courseInfo?.category || 'Non catégorisé'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {exercises.length} exercices
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {courseInfo?.description || 'Gérez les exercices de ce cours'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateExercise}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm"
              >
                <Plus size={18} />
                Nouvel exercice
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-gray-800/80 rounded-xl p-4 border border-purple-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {exercises.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Exercices
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white to-green-50 dark:from-gray-800 dark:to-gray-800/80 rounded-xl p-4 border border-green-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {publishedCount}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Publiés
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white to-yellow-50 dark:from-gray-800 dark:to-gray-800/80 rounded-xl p-4 border border-yellow-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Eye className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {draftCount}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Brouillons
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-gray-800/80 rounded-xl p-4 border border-blue-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {totalSubmissions}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Soumissions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm dark:shadow-gray-900/30 border border-purple-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Barre de recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un exercice..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtres par statut */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              {[
                { value: 'all', label: 'Tous', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
                { value: 'published', label: 'Publiés', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
                { value: 'draft', label: 'Brouillons', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
                { value: 'closed', label: 'Fermés', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' }
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 text-sm ${filter === value
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm'
                    : `${color} hover:opacity-90`
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste des exercices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-purple-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                {filteredExercises.length} exercice(s) trouvé(s)
              </h2>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {totalPending > 0 && (
                  <span className="text-red-500 dark:text-red-400 font-medium">
                    {totalPending} en attente
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredExercises.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {exercises.length === 0 ? 'Aucun exercice créé' : 'Aucun résultat'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {exercises.length === 0
                    ? 'Créez votre premier exercice pour ce cours.'
                    : 'Modifiez vos critères de recherche.'
                  }
                </p>
                {exercises.length === 0 && (
                  <button
                    onClick={handleCreateExercise}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Créer un exercice
                  </button>
                )}
              </div>
            ) : (
              filteredExercises.map((exercise) => {
                const pendingCount = exercise.pendingCount || 0;
                const duration = exercise.duration || 0;

                return (
                  <div key={exercise.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Informations de l'exercice */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                            {exercise.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${exercise.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : exercise.status === 'DRAFT'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                            {exercise.status === 'PUBLISHED' ? 'Publié' :
                              exercise.status === 'DRAFT' ? 'Brouillon' : 'Fermé'}
                          </span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-1">
                          {exercise.description || 'Aucune description'}
                        </p>

                        {/* Métadonnées */}
                        <div className="flex flex-wrap gap-3 text-xs">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Calendar size={12} className="text-purple-500" />
                            <span>{exercise.dueDate ? new Date(exercise.dueDate).toLocaleDateString() : 'Pas d\'échéance'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Award size={12} className="text-blue-500" />
                            <span>{exercise.maxScore} pts</span>
                          </div>
                          {duration > 0 && (
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <Clock size={12} className="text-emerald-500" />
                              <span>{duration} min</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Users size={12} className="text-orange-500" />
                            <span>
                              {exercise.submissionsCount || 0}
                              {pendingCount > 0 && (
                                <span className="text-red-500 dark:text-red-400 ml-1">
                                  ({pendingCount})
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions - Petits boutons */}
                      <div className="flex items-center gap-1">
                        {/* Bouton principal - Voir soumissions */}
                        <button
                          onClick={() => handleViewSubmissions(exercise.id)}
                          title="Voir les soumissions"
                          className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Bouton modifier */}
                        <button
                          onClick={() => handleEditExercise(exercise.id)}
                          title="Modifier"
                          className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors"
                        >
                          <Edit size={16} />
                        </button>

                        {/* Bouton spécifique selon le statut */}
                        {exercise.status === 'DRAFT' && (
                          <button
                            onClick={() => handlePublishExercise(exercise.id)}
                            title="Publier"
                            className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors"
                          >
                            <Download size={16} />
                          </button>
                        )}

                        {exercise.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleCloseExercise(exercise.id)}
                            title="Fermer"
                            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs px-2 py-1"
                          >
                            Fermer
                          </button>
                        )}

                        {/* Bouton supprimer */}
                        <button
                          onClick={() => handleDeleteExercise(exercise.id)}
                          title="Supprimer"
                          className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Note informative */}
        {exercises.length > 0 && (
          <div className="mt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200 dark:border-purple-700/30">
              <BarChart3 size={14} className="text-purple-600 dark:text-purple-400" />
              <p className="text-xs text-gray-600 dark:text-gray-300">
                <span className="font-medium text-purple-600 dark:text-purple-400">Statistiques :</span>
                {' '}{totalSubmissions} soumissions • {totalPending} en attente
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}