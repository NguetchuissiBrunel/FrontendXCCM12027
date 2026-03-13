// app/(dashboard)/etudashboard/courses/[courseId]/exercises/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useCourseExercises } from '@/hooks/useExercise';
import {
  BookOpen,
  FileText,
  Clock,
  Award,
  Filter,
  Search,
  Calendar,
  CheckCircle,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photoUrl?: string;
  specialization?: string;
}

import { CourseControllerService } from '@/lib/services/CourseControllerService';

interface CourseInfo {
  id: number;
  title: string;
  description?: string;
  instructor?: string;
  photoUrl?: string;
}

export default function CourseExercisesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.courseId as string);

  const [user, setUser] = useState<User | null>(null);
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [filter, setFilter] = useState({
    status: 'all', // 'all', 'pending', 'submitted', 'graded'
    search: '',
    sortBy: 'dueDate' // 'dueDate', 'title', 'points'
  });

  // Utiliser le hook pour les exercices du cours
  const {
    exercises,
    isLoading,
    error,
    refetch
  } = useCourseExercises(courseId, {
    enabled: !!courseId,
    autoRefetch: true
  });

  // Charger les données utilisateur et cours
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger l'utilisateur
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
          router.push('/login');
          return;
        }

        const userData = JSON.parse(currentUser) as User;
        if (userData.role !== 'student') {
          router.push('/profdashboard');
          return;
        }

        setUser(userData);

        // Charger les infos du cours
        const response = await CourseControllerService.getEnrichedCourse(courseId);
        if (response && response.success && response.data) {
          const courseData = response.data;
          setCourseInfo({
            id: courseData.id || courseId,
            title: courseData.title || `Cours #${courseId}`,
            description: courseData.category || 'Description du cours...',
            instructor: courseData.author ? `${courseData.author.name}` : 'Professeur Exemple',
            photoUrl: courseData.image // EnrichedCourseResponse uses 'image' based on model file
          });
        } else {
          // Fallback if API fails
          setCourseInfo({
            id: courseId,
            title: `Cours #${courseId}`,
            description: 'Description du cours...',
            instructor: 'Professeur Exemple'
          });
        }

      } catch (error) {
        console.error('Erreur chargement données:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    if (courseId) {
      loadData();
    }
  }, [courseId, router]);

  // Filtrer et trier les exercices
  const filteredExercises = exercises.filter(exercise => {
    // Filtre par statut
    if (filter.status !== 'all') {
      const submitted = exercise.alreadySubmitted || false;
      const graded = exercise.studentScore !== undefined;

      if (filter.status === 'pending' && submitted) return false;
      if (filter.status === 'submitted' && !submitted) return false;
      if (filter.status === 'graded' && !graded) return false;
    }

    // Filtre par recherche
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      if (!exercise.title.toLowerCase().includes(searchLower) &&
        !(exercise.description?.toLowerCase().includes(searchLower))) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    // Trier les exercices
    switch (filter.sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'points':
        return (b.maxScore || 0) - (a.maxScore || 0);
      case 'dueDate':
      default:
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return dateA - dateB;
    }
  });

  // Gestion des actions
  const handleStartExercise = (exerciseId: number) => {
    router.push(`/etudashboard/exercises/${exerciseId}/submit`);
  };

  const handleViewExercise = (exerciseId: number) => {
    router.push(`/etudashboard/exercises/${exerciseId}`);
  };

  const handleViewSubmission = (exerciseId: number) => {
    // Trouver la soumission pour cet exercice
    router.push(`/etudashboard/submissions?exerciseId=${exerciseId}`);
  };

  const getExerciseStatus = (exercise: any) => {
    if (exercise.studentScore !== undefined) {
      return {
        label: 'Noté',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle
      };
    }
    if (exercise.alreadySubmitted) {
      return {
        label: 'Soumis',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: FileText
      };
    }
    return {
      label: 'En attente',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: Clock
    };
  };

  const isDueDatePassed = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (!user || !courseInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  const displayName = `${user.firstName} ${user.lastName}`;
  const userLevel = user.specialization || 'Étudiant';

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
      <Sidebar
        userRole="student"
        userName={displayName}
        userLevel={userLevel}
        activeTab="cours"
      />

      <main className="flex-1 p-4 md:p-8">
        {/* En-tête du cours */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 mb-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-4">
                {courseInfo.photoUrl ? (
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-sm border border-purple-100 dark:border-gray-700 flex-shrink-0">
                    <img
                      src={courseInfo.photoUrl}
                      alt={courseInfo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex-shrink-0">
                    <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-purple-600 dark:text-purple-400" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {courseInfo.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                    {courseInfo.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm mt-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Enseignant:</span>
                  <span className="bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full text-purple-700 dark:text-purple-400">
                    {courseInfo.instructor}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-400">
                  {filteredExercises.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Exercices</div>
              </div>
              <div className="h-10 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                  {filteredExercises.filter(e => e.alreadySubmitted).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Soumis</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un exercice..."
                  value={filter.search}
                  onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tous les exercices</option>
                <option value="pending">En attente</option>
                <option value="submitted">Soumis</option>
                <option value="graded">Notés</option>
              </select>

              <select
                value={filter.sortBy}
                onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="dueDate">Trier par date</option>
                <option value="title">Trier par titre</option>
                <option value="points">Trier par points</option>
              </select>

              <button
                onClick={() => refetch()}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des exercices */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des exercices...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-300 mb-1">
                    Erreur de chargement
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error.message || 'Impossible de charger les exercices'}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aucun exercice trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {filter.search || filter.status !== 'all'
                  ? 'Aucun exercice ne correspond à vos critères de recherche.'
                  : 'Aucun exercice n\'est disponible pour ce cours pour le moment.'}
              </p>
              {(filter.search || filter.status !== 'all') && (
                <button
                  onClick={() => setFilter({ status: 'all', search: '', sortBy: 'dueDate' })}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            filteredExercises.map((exercise) => {
              const status = getExerciseStatus(exercise);
              const StatusIcon = status.icon;
              const isDue = isDueDatePassed(exercise.dueDate);

              return (
                <div
                  key={exercise.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {exercise.title}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>

                        {exercise.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {exercise.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Award className="w-4 h-4" />
                            <span>{exercise.maxScore} points</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FileText className="w-4 h-4" />
                            <span>{exercise.questions?.length || 0} questions</span>
                          </div>

                          {exercise.dueDate && (
                            <div className={`flex items-center gap-2 ${isDue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                              <Calendar className="w-4 h-4" />
                              <span>
                                {isDue ? 'Échéance dépassée' : 'Échéance'} : {new Date(exercise.dueDate).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-3">
                        {/* Score si noté */}
                        {exercise.studentScore !== undefined && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {exercise.studentScore}/{exercise.maxScore}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Votre score
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewExercise(exercise.id)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            Voir
                          </button>

                          {exercise.alreadySubmitted ? (
                            <button
                              onClick={() => handleViewSubmission(exercise.id)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                              Voir soumission
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartExercise(exercise.id)}
                              disabled={isDue}
                              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${isDue
                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                            >
                              {isDue ? 'Échéance dépassée' : 'Commencer'}
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pied de page */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Affichage de {filteredExercises.length} exercice{filteredExercises.length !== 1 ? 's' : ''}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/etudashboard')}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm"
              >
                ← Retour au dashboard
              </button>

              <button
                onClick={() => router.push(`/courses/${courseId}`)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors text-sm"
              >
                Voir le cours complet
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}