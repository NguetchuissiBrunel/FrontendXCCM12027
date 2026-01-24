// app/(dashboard)/etudashboard/page.tsx - VERSION AVEC IMPLÉMENTATION RÉELLE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { BookOpen, FileText, Award, Clock, TrendingUp, Users, Loader2 } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import { useCourseExercises, useMySubmissions } from '@/hooks/useExercise';
import { useCourses } from '@/hooks/useCourses';
import { EnrichedCourse } from '@/types/enrollment';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photoUrl?: string;
  specialization?: string;
  level?: string;
  university?: string;
  city?: string;
}

interface Enrollment {
  id: number;
  courseId: number;
  courseTitle?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  progress?: number;
}

interface DashboardStats {
  averageScore: number;
  totalSubmissions: number;
  pendingExercises: number;
  completedExercises: number;
  submissionRate: number;
}

export default function StudentHome() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrichedCourse[]>([]);
  const [pendingExercises, setPendingExercises] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    averageScore: 0,
    totalSubmissions: 0,
    pendingExercises: 0,
    completedExercises: 0,
    submissionRate: 0
  });

  const router = useRouter();

  // Utiliser les nouveaux hooks
  const { courses: allCourses, loading: coursesLoading } = useCourses();
  const {
    submissions: mySubmissions,
    isLoading: submissionsLoading,
    refetch: refetchSubmissions
  } = useMySubmissions();

  // Charger les données de l'étudiant
  const loadStudentData = async (userData: User) => {
    try {
      startLoading();

      // 1. Charger les inscriptions aux cours
      await loadEnrollments();

      // 2. Calculer les statistiques à partir des soumissions
      calculateStats(mySubmissions);

      // 3. Charger les exercices en attente pour chaque cours
      if (enrolledCourses.length > 0) {
        await loadPendingExercises();
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données étudiant:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  // Charger les inscriptions
  const loadEnrollments = async () => {
    try {
      // Utiliser le service d'inscription existant
      const { EnrollmentService } = await import('@/utils/enrollmentService');
      const enrollments = await EnrollmentService.getMyEnrollments();

      // Filtrer uniquement les inscriptions approuvées
      const approvedEnrollments = (enrollments || []).filter(
        (e: any) => e.status === 'APPROVED'
      );

      // Enrichir avec les détails des cours (comme dans StudentCourses)
      const enriched = approvedEnrollments.map((enrollment: any) => {
        const courseDetail = allCourses.find(c => c.id === enrollment.courseId);

        // Si on trouve les détails du cours, on les utilise
        if (courseDetail) {
          return {
            id: courseDetail.id,
            title: courseDetail.title,
            category: courseDetail.category || 'Formation',
            image: courseDetail.image,
            author: courseDetail.author,
            enrollment: {
              ...enrollment,
              status: enrollment.status
            }
          } as unknown as EnrichedCourse;
        }

        // Sinon, on retourne un objet partiel
        return {
          id: enrollment.courseId,
          title: `Cours #${enrollment.courseId}`,
          category: 'Cours',
          image: '',
          author: {
            name: 'Inconnu',
            image: ''
          },
          enrollment: {
            ...enrollment,
            status: enrollment.status
          }
        } as EnrichedCourse;
      });

      setEnrolledCourses(enriched);

    } catch (err) {
      console.error("Erreur lors du chargement des inscriptions:", err);
      toast.error('Impossible de charger vos inscriptions');
      setEnrolledCourses([]);
    }
  };

  // Calculer les statistiques
  const calculateStats = (submissionsList: any[]) => {
    const gradedSubmissions = submissionsList.filter(s => s.graded);
    const totalScore = gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);

    const totalMaxScore = gradedSubmissions.reduce((sum, s) => sum + (s.maxScore || 0), 0);

    const averageScore = gradedSubmissions.length > 0 && totalMaxScore > 0
      ? (totalScore / totalMaxScore) * 100
      : 0;

    setStats(prev => ({
      ...prev,
      averageScore: Math.round(averageScore),
      totalSubmissions: submissionsList.length,
      completedExercises: gradedSubmissions.length
    }));
  };

  // Charger les exercices en attente
  const loadPendingExercises = async () => {
    try {
      const allExercises: any[] = [];
      const now = new Date();

      // Pour chaque cours, charger les exercices réels
      for (const course of enrolledCourses) {
        try {
          // Utiliser le hook useCourseExercises pour chaque cours
          const { exercises: courseExercises } = await (async () => {
            // Pour l'instant, utilisons une approche directe
            // Vous devrez peut-être adapter cela selon votre implémentation
            const { ExerciseService } = await import('@/lib3/services/ExerciseService');
            const exercises = await ExerciseService.getExercisesForCourse(course.id);
            return { exercises };
          })();

          // Filtrer les exercices non soumis et non échus
          const submittedExerciseIds = new Set(
            mySubmissions.map(s => s.exerciseId)
          );

          const pendingForCourse = courseExercises.filter((exercise: any) => {
            const dueDate = exercise.dueDate ? new Date(exercise.dueDate) : null;
            const alreadySubmitted = submittedExerciseIds.has(exercise.id);
            const canSubmit = dueDate ? dueDate > now : true;

            return !alreadySubmitted && canSubmit;
          });

          // Ajouter les informations du cours
          pendingForCourse.forEach((exercise: any) => {
            allExercises.push({
              ...exercise,
              courseTitle: course.title
            });
          });

        } catch (error) {
          console.error(`Erreur chargement exercices cours ${course.id}:`, error);
          // Continuer avec le cours suivant
        }
      }

      setPendingExercises(allExercises);
      setStats(prev => ({
        ...prev,
        pendingExercises: allExercises.length
      }));

    } catch (error) {
      console.error('Erreur chargement exercices en attente:', error);
      toast.error('Impossible de charger les exercices en attente');
      setPendingExercises([]);
    }
  };

  // Chargement initial
  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = localStorage.getItem('currentUser');

        if (!currentUser) {
          router.push('/login');
          return;
        }

        const userData = JSON.parse(currentUser) as User;

        // Vérifier le rôle
        if (userData.role !== 'student') {
          router.push('/profdashboard');
          return;
        }

        setUser(userData);
        await loadStudentData(userData);

      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        router.push('/login');
      }
    };

    loadData();
  }, [router]);

  // Recalculer les stats quand les soumissions changent
  useEffect(() => {
    if (mySubmissions.length > 0 && enrolledCourses.length > 0) {
      calculateStats(mySubmissions);
      loadPendingExercises();
    }
  }, [mySubmissions, enrolledCourses]);

  // Recharger les inscriptions quand les cours sont disponibles
  useEffect(() => {
    if (!coursesLoading && allCourses.length > 0 && user) {
      loadEnrollments();
    }
  }, [coursesLoading, allCourses, user]);

  // Rafraîchir les données périodiquement
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user) {
        refetchSubmissions();
        loadEnrollments();
      }
    }, 30000); // Rafraîchir toutes les 30 secondes

    return () => clearInterval(intervalId);
  }, [user, refetchSubmissions]);

  // Gestion des actions
  const handleStartExercise = (exerciseId: number) => {
    router.push(`/etudashboard/exercises/${exerciseId}/submit`);
  };

  const handleViewSubmission = (submissionId: number) => {
    router.push(`/etudashboard/submissions/${submissionId}`);
  };

  const handleViewCourseExercises = (courseId: number) => {
    router.push(`/etudashboard/courses/${courseId}/exercises`);
  };

  // Composant de chargement
  if (loading || globalLoading || coursesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastName}`;
  const userLevel = user.specialization || user.level || 'Étudiant';

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
      <Sidebar
        userRole="student"
        userName={displayName}
        userLevel={userLevel}
        activeTab="accueil"
      />

      <main className="flex-1 p-4 md:p-8">
        {/* Section de bienvenue et statistiques */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 mb-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-3xl">
              <h1 className="text-2xl md:text-4xl font-bold text-purple-700 dark:text-purple-400 mb-4">
                Bienvenue {user.firstName} !
              </h1>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte."
              </p>
            </div>

            {/* Statistiques rapides */}
            <div className="bg-purple-50 dark:bg-gray-700 rounded-xl p-4 w-full md:w-auto">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {stats.averageScore}%
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Moyenne</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {stats.totalSubmissions}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Soumissions</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-red-600">
                    {stats.pendingExercises}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">En attente</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-green-600">
                    {stats.completedExercises}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Terminés</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Colonne gauche : Mes Cours */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <BookOpen className="text-purple-600 w-5 h-5 md:w-6 md:h-6" />
                Mes Cours ({enrolledCourses.length})
              </h2>
              <button
                onClick={() => router.push('/bibliotheque')}
                className="text-purple-600 hover:text-purple-700 font-medium hover:underline text-sm md:text-base"
              >
                Explorer la bibliothèque →
              </button>
            </div>

            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="h-24 md:h-32 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 relative">
                      <div className="absolute inset-0 flex items-center justify-center text-white opacity-80">
                        <BookOpen className="w-8 h-8 md:w-12 md:h-12" />
                      </div>
                    </div>
                    <div className="p-4 md:p-5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Actif
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          {course.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">
                        {course.title}
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1 text-gray-500">
                            <span>Progression</span>
                            <span>{course.enrollment?.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-purple-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${course.enrollment?.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewCourseExercises(course.id)}
                            className="flex-1 py-2 text-xs md:text-sm border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                          >
                            Voir les exercices
                          </button>
                          <button
                            onClick={() => router.push(`/courses/${course.id}`)}
                            className="flex-1 py-2 text-xs md:text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Continuer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 md:p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
                <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Aucun cours pour le moment
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Vous n'êtes inscrit à aucun cours.
                </p>
                <button
                  onClick={() => router.push('/bibliotheque')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Découvrir les cours
                </button>
              </div>
            )}
          </div>

          {/* Colonne droite : Exercices et Soumissions */}
          <div className="space-y-6">
            {/* Exercices en attente */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Clock className="text-red-500 w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">Exercices en attente</span>
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                    {pendingExercises.length}
                  </span>
                </h3>
              </div>

              {pendingExercises.length > 0 ? (
                <div className="space-y-3">
                  {pendingExercises.slice(0, 3).map((exercise) => (
                    <div
                      key={exercise.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm text-gray-800 dark:text-white line-clamp-1">
                            {exercise.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {exercise.courseTitle}
                          </p>
                          {exercise.dueDate && (
                            <p className="text-xs text-red-600 mt-1">
                              Échéance: {new Date(exercise.dueDate).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => router.push(`/etudashboard/exercises/${exercise.id}`)}
                          className="flex-1 py-1 text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => handleStartExercise(exercise.id)}
                          className="flex-1 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                          Commencer
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingExercises.length > 3 && (
                    <button
                      onClick={() => router.push('/etudashboard/exercises')}
                      className="w-full py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Voir tous ({pendingExercises.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucun exercice en attente
                  </p>
                </div>
              )}
            </div>

            {/* Dernières soumissions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Award className="text-green-500 w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">Dernières soumissions</span>
                </h3>
                <button
                  onClick={() => router.push('/etudashboard/submissions')}
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  Voir tout
                </button>
              </div>

              {mySubmissions.length > 0 ? (
                <div className="space-y-3">
                  {mySubmissions.slice(0, 3).map((submission) => (
                    <div key={submission.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-800 dark:text-white line-clamp-1">
                            {submission.exerciseTitle || 'Exercice'}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Soumis le {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className={`text-sm font-bold ml-2 ${submission.graded ?
                          ((submission.score || 0) / (submission.maxScore || 1) >= 0.5 ?
                            'text-green-600' : 'text-red-600') :
                          'text-yellow-600'
                          }`}>
                          {submission.graded ?
                            `${submission.score || 0}/${submission.maxScore || 0}` :
                            'En attente'
                          }
                        </div>
                      </div>

                      {submission.graded && submission.feedback && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {submission.feedback}
                        </p>
                      )}

                      <button
                        onClick={() => handleViewSubmission(submission.id)}
                        className="mt-2 w-full py-1 text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Voir détails
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucune soumission
                  </p>
                  <button
                    onClick={() => router.push('/etudashboard/exercises')}
                    className="mt-2 text-xs text-purple-600 hover:text-purple-700"
                  >
                    Voir les exercices disponibles
                  </button>
                </div>
              )}
            </div>

            {/* Actions rapides */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 md:p-5 border border-purple-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-sm md:text-base">
                Actions rapides
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/etudashboard/exercises')}
                  className="w-full py-2 text-center bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                >
                  Voir tous les exercices
                </button>
                <button
                  onClick={() => router.push('/etudashboard/submissions')}
                  className="w-full py-2 text-center border border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-sm"
                >
                  Mes soumissions
                </button>
                <button
                  onClick={() => {
                    if (pendingExercises.length > 0) {
                      handleStartExercise(pendingExercises[0].id);
                    } else {
                      router.push('/etudashboard/exercises');
                    }
                  }}
                  className="w-full py-2 text-center bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={pendingExercises.length === 0}
                >
                  {pendingExercises.length > 0 ?
                    'Commencer un exercice' :
                    'Aucun exercice en attente'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}