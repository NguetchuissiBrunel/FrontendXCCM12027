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
  TrendingUp,
  Layout
} from 'lucide-react';

// Import des services
import { ExerciseService } from '@/lib3/services/ExerciseService';
import { ClassesDeCoursService } from '@/lib/services/ClassesDeCoursService';
import { Exercise as BaseExercise } from '@/types/exercise';
import { useAuth } from '@/contexts/AuthContext';

// Étendre le type Exercise pour inclure 'DRAFT'
type Exercise = BaseExercise & { status: 'PUBLISHED' | 'DRAFT' | 'CLOSED' | 'ARCHIVED'; courseId?: number };

interface CourseClass {
  id: number;
  name: string;
  theme?: string;
  description?: string;
  coverImage?: string;
  status: 'OPEN' | 'CLOSED' | 'ARCHIVED';
  maxStudents?: number;
  studentCount?: number;
  createdAt?: string;
  courses?: any[]; // On n'a pas besoin du détail complet des cours ici pour l'instant
}

export default function ClassExercisesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // On garde param.courseId car c'est le nom du dossier dans Next.js, mais contextuellement c'est le classId
  const classId = params?.courseId ? parseInt(params.courseId as string) : 0;

  const [classInfo, setClassInfo] = useState<CourseClass>({
    id: classId,
    name: `Classe #${classId}`,
    description: 'Chargement...',
    theme: '',
    status: 'OPEN',
    studentCount: 0,
    courses: []
  });

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClass, setLoadingClass] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      router.push('/login');
      return;
    }

    if (!classId) return;

    loadClassInfo();
  }, [classId, user, router]);

  // Vérification du classId après TOUS les hooks
  if (!classId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Classe non trouvée
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            L'URL de la page est incorrecte.
          </p>
          <button
            onClick={() => router.push('/profdashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const loadClassInfo = async () => {
    try {
      setLoadingClass(true);
      const response = await ClassesDeCoursService.getClassById(classId);

      if (response && response.data) {
        const classData = response.data as CourseClass;
        setClassInfo(classData);

        // Charger les exercices de tous les cours de la classe
        if (classData.courses && classData.courses.length > 0) {
          await loadAllExercises(classData.courses);
        } else {
          setExercises([]);
          setLoading(false);
        }
      } else {
        toast.error('Impossible de charger les informations de la classe');
      }
    } catch (error: any) {
      console.error('Erreur chargement infos classe:', error);
      toast.error(error.message || 'Impossible de charger les informations de la classe');
    } finally {
      setLoadingClass(false);
    }
  };

  const loadAllExercises = async (courses: any[]) => {
    try {
      setLoading(true);
      let allExercises: Exercise[] = [];

      for (const course of courses) {
        const exercisesData = await ExerciseService.getExercisesForCourse(course.id);
        if (exercisesData && exercisesData.length > 0) {
          // Ajouter l'ID du cours pour pouvoir l'utiliser dans les actions futures
          const exercisesWithCourse = exercisesData.map((e: any) => ({ ...e, courseId: course.id }));
          allExercises = [...allExercises, ...exercisesWithCourse];
        }
      }

      setExercises(allExercises);
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
        loadClassInfo(); // Recharger la liste
      } else {
        toast.error('❌ Erreur lors de la suppression');
      }
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleDuplicateExercise = async (exerciseId: number, originalCourseId: number) => {
    try {
      toast.loading('Duplication en cours...');
      const result = await ExerciseService.duplicateExercise(exerciseId, originalCourseId);

      toast.dismiss();

      if (result.success) {
        toast.success('✅ Exercice dupliqué avec succès');
        loadClassInfo(); // Recharger la liste
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
      case 'OPEN':
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
      case 'PUBLISHED':
      case 'OPEN': return 'Publié';
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

  if (loadingClass) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des informations de la classe...</p>
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
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {classInfo.name}
            </span>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Exercices
            </span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/profdashboard')}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Retour au tableau de bord
            </button>
          </div>
        </div>

        {/* En-tête de la classe */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl">
                    <Layout className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        {classInfo.name}
                      </h1>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(classInfo.status)}`}>
                        {getStatusText(classInfo.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {classInfo.description || 'Aucune description.'}
                    </p>
                    {classInfo.theme && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 rounded-full text-sm font-medium">
                          {classInfo.theme}
                        </span>
                        {classInfo.createdAt && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Créée le {formatDate(classInfo.createdAt)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-500" />
                      <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                          {stats.totalExercises}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Exercices Totaux
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                          {classInfo.studentCount || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Étudiants
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                          {classInfo.courses?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Cours liés
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                          {stats.averageScore || '--'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Moyenne Globale
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Exercices de la classe
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {filteredExercises.length} exercice{filteredExercises.length !== 1 ? 's' : ''} trouvé{filteredExercises.length !== 1 ? 's' : ''} provenant de {classInfo.courses?.length || 0} cours.
                </p>
              </div>

              <div className="flex gap-2">
                {(!classInfo.courses || classInfo.courses.length === 0) ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-300 text-white rounded-lg cursor-not-allowed flex items-center gap-2"
                    title="Ajoutez d'abord un cours à cette classe"
                  >
                    <PlusCircle size={18} />
                    Créer un exercice
                  </button>
                ) : (
                  <Link
                    href={`/profdashboard/exercises/${classInfo.courses[0].id}/create`}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                    title={`Créer un exercice dans ${classInfo.courses[0].title}`}
                  >
                    <PlusCircle size={18} />
                    Nouvel exercice
                  </Link>
                )}
              </div>
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
                  {(!classInfo.courses || classInfo.courses.length === 0)
                    ? 'Ajoutez d\'abord un cours à cette classe pour pouvoir y attacher des exercices.'
                    : 'Aucun exercice n\'a été créé dans les cours de cette classe.'
                  }
                </p>
                {(classInfo.courses && classInfo.courses.length > 0) && (
                  <Link
                    href={`/profdashboard/exercises/${classInfo.courses[0].id}/create`}
                    className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium inline-flex items-center gap-2"
                  >
                    <PlusCircle size={18} />
                    Créer un exercice
                  </Link>
                )}
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
                        {exercise.courseId && (
                          <button
                            onClick={() => handleDuplicateExercise(exercise.id, exercise.courseId as number)}
                            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Dupliquer"
                          >
                            <Copy size={18} />
                          </button>
                        )}

                        <Link
                          href={`/profdashboard/exercises/${exercise.courseId || classId}/view/${exercise.id}`}
                          className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye size={18} />
                        </Link>

                        <Link
                          href={`/profdashboard/exercises/${exercise.courseId || classId}/update/${exercise.id}`}
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

      </div>
    </div>
  );
}