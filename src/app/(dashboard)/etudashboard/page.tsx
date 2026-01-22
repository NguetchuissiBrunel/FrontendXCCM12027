// app/(dashboard)/etudashboard/page.tsx - Version mise à jour
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { BookOpen, FileText, Award, Clock } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { useCourses } from '@/hooks/useCourses';
import { Submission } from '@/types/exercise'; // ou le chemin correct
import { toast } from 'react-toastify';

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

/*interface Submission {
  id: number;
  exerciseId: number;
  exerciseTitle: string;
  score: number;
  maxScore: number;
  submittedAt: string;
  graded: boolean;
  courseId?: number;
  courseTitle?: string;
}*/

interface Exercise {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  courseId: number;
  courseTitle?: string;
  alreadySubmitted?: boolean;
  canSubmit?: boolean;
}

export default function StudentHome() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pendingExercises, setPendingExercises] = useState<Exercise[]>([]);
  const [stats, setStats] = useState({
    averageScore: 0,
    totalSubmissions: 0,
    pendingExercises: 0,
    completedExercises: 0
  });
  const { courses: allCourses, loading: coursesLoading } = useCourses();
  const router = useRouter();

  useEffect(() => {
    if (loading || coursesLoading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [loading, coursesLoading, startLoading, stopLoading]);

  const loadStudentData = async (userData: User) => {
    try {
      // 1. Charger les inscriptions
      try {
        const { EnrollmentService } = await import('@/utils/enrollmentService');
        const enrollments = await EnrollmentService.getMyEnrollments();
        setEnrolledCourses(enrollments || []);

        // 2. Charger les soumissions et exercices pour chaque cours
        const approvedEnrollments = (enrollments || []).filter(e => e.status === 'APPROVED');
        if (approvedEnrollments.length > 0) {
          await loadExercisesAndSubmissions(approvedEnrollments);
        }
      } catch (err) {
        console.error("Erreur chargement données:", err);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données étudiant:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExercisesAndSubmissions = async (enrollments: any[]) => {
    try {
      // Charger les soumissions de l'étudiant
      const mySubmissionsResp = await ExercicesService.getMySubmissions();
      const mySubmissions = (((mySubmissionsResp as any)?.data) || []) as Submission[];
      setSubmissions(mySubmissions);

      // Charger les exercices en attente
      const pending: Exercise[] = [];

      for (const enrollment of enrollments) {
        if (enrollment.status === 'APPROVED' && enrollment.courseId) {
          try {
            const resp = await ExercicesService.getExercisesForCourse(enrollment.courseId);
            const exercises = (((resp as any)?.data) || []) as Exercise[];

            // Filtrer les exercices non soumis ou dont la date d'échéance n'est pas passée
            const now = new Date();
            const pendingForCourse = exercises.filter((exercise: Exercise) => {
              const dueDate = new Date(exercise.dueDate);
              const alreadySubmitted = mySubmissions.some((s: Submission) => s.exerciseId === exercise.id);
              return !alreadySubmitted && dueDate > now;
            });

            pending.push(...pendingForCourse.map((ex: Exercise) => {
              const courseDetail = allCourses.find(c => c.id === enrollment.courseId);
              return {
                ...ex,
                courseTitle: courseDetail?.title || enrollment.courseTitle || `Cours #${enrollment.courseId}`
              };
            }));
          } catch (error) {
            console.error(`Erreur chargement exercices cours ${enrollment.courseId}:`, error);
          }
        }
      }

      setPendingExercises(pending);

      // Calculer les statistiques
      const gradedSubmissions = mySubmissions.filter((s: Submission) => s.graded && typeof s.score === 'number') as (Submission & { score: number })[];
      const averageScore = gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum: number, s) => sum + (s.score / s.maxScore * 100), 0) / gradedSubmissions.length
        : 0;

      setStats({
        averageScore: Math.round(averageScore),
        totalSubmissions: mySubmissions.length,
        pendingExercises: pending.length,
        completedExercises: gradedSubmissions.length
      });

    } catch (error) {
      console.error('Erreur chargement exercices et soumissions:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const currentUser = localStorage.getItem('currentUser');

      if (!currentUser) {
        router.push('/login');
        return;
      }

      try {
        const userData = JSON.parse(currentUser);

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

  const handleStartExercise = (exerciseId: number) => {
    router.push(`/etudashboard/exercises/${exerciseId}/submit`);
  };

  const handleViewSubmission = (submissionId: number) => {
    // À implémenter : page de détail de soumission
    console.log('Voir soumission:', submissionId);
  };

  const handleUnenroll = async (enrollmentId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir vous désinscrire de ce cours ?")) {
      return;
    }

    try {
      const { EnrollmentService } = await import('@/utils/enrollmentService');
      await EnrollmentService.unenroll(enrollmentId);
      toast.success("Désinscription réussie");

      // Recharger les données
      if (user) {
        await loadStudentData(user);
      }
    } catch (error: any) {
      console.error("Erreur lors de la désinscription:", error);
      toast.error(error.message || "Erreur lors de la désinscription");
    }
  };

  if (loading || globalLoading) {
    return null;
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

      <main className="flex-1 p-8">
        {/* Welcome Message avec statistiques */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-400 mb-4">
                Bienvenue {user.firstName} !
              </h1>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte."
              </p>
            </div>

            {/* Statistiques rapides */}
            <div className="bg-purple-50 dark:bg-gray-700 rounded-xl p-4 min-w-[250px]">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {stats.averageScore}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Moyenne</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {stats.totalSubmissions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Soumissions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.pendingExercises}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Exercices en attente</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completedExercises}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Terminés</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche : Mes Cours */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <BookOpen className="text-purple-600" />
                Mes Cours ({enrolledCourses.length})
              </h2>
              <button
                onClick={() => router.push('/bibliotheque')}
                className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
              >
                Explorer la bibliothèque →
              </button>
            </div>

            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCourses.map((enrollment) => (
                  <div key={enrollment.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <BookOpen className="w-12 h-12 opacity-50" />
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${enrollment.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {enrollment.status === 'APPROVED' ? 'Actif' : enrollment.status === 'PENDING' ? 'En attente' : enrollment.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {allCourses.find(c => c.id === enrollment.courseId)?.category || 'Formation'}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">
                        {allCourses.find(c => c.id === enrollment.courseId)?.title || enrollment.courseTitle || `Cours #${enrollment.courseId}`}
                      </h3>

                      {enrollment.status === 'APPROVED' && (
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1 text-gray-500">
                              <span>Progression</span>
                              <span>{enrollment.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className="bg-purple-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${enrollment.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Bouton pour voir les exercices du cours */}
                          <button
                            onClick={() => {
                              // Rediriger vers la page des exercices du cours
                              router.push(`/etudashboard/courses/${enrollment.courseId}/exercises`);
                            }}
                            className="w-full py-2 text-sm border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                          >
                            Voir les exercices
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => router.push(`/courses/${enrollment.courseId}`)}
                          disabled={enrollment.status !== 'APPROVED'}
                          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${enrollment.status === 'APPROVED'
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          {enrollment.status === 'APPROVED' ? 'Continuer' : 'En attente'}
                        </button>

                        <button
                          onClick={() => handleUnenroll(enrollment.id)}
                          className="px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                          title="Se désinscrire"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun cours pour le moment</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Vous n'êtes inscrit à aucun cours.</p>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Clock className="text-red-500" />
                  Exercices en attente ({pendingExercises.length})
                </h3>
              </div>

              {pendingExercises.length > 0 ? (
                <div className="space-y-3">
                  {pendingExercises.slice(0, 3).map((exercise) => (
                    <div key={exercise.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm text-gray-800 dark:text-white line-clamp-1">
                            {exercise.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {exercise.courseTitle}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Échéance: {new Date(exercise.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartExercise(exercise.id)}
                        className="mt-2 w-full py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                      >
                        Commencer
                      </button>
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
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucun exercice en attente
                  </p>
                </div>
              )}
            </div>

            {/* Dernières soumissions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Award className="text-green-500" />
                  Dernières soumissions
                </h3>
                <button
                  onClick={() => router.push('/etudashboard/submissions')}
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  Voir tout
                </button>
              </div>

              {submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.slice(0, 3).map((submission) => (
                    <div key={submission.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm text-gray-800 dark:text-white line-clamp-1">
                            {submission.exerciseTitle}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Soumis le {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`text-sm font-bold ${submission.graded ?
                          (submission.score / submission.maxScore >= 0.5 ? 'text-green-600' : 'text-red-600') :
                          'text-yellow-600'
                          }`}>
                          {submission.graded ?
                            `${submission.score}/${submission.maxScore}` :
                            'En attente'
                          }
                        </div>
                      </div>

                      {submission.graded && submission.feedback && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          Feedback: {submission.feedback}
                        </p>
                      )}

                      <button
                        onClick={() => handleViewSubmission(submission.id)}
                        className="mt-2 w-full py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Voir détails
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucune soumission
                  </p>
                  <button
                    onClick={() => router.push('/etudashboard/exercises')}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    Voir les exercices disponibles
                  </button>
                </div>
              )}
            </div>

            {/* Actions rapides */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 border border-purple-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3">Actions rapides</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/etudashboard/exercises')}
                  className="w-full py-2 text-center bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Voir tous les exercices
                </button>
                <button
                  onClick={() => router.push('/etudashboard/submissions')}
                  className="w-full py-2 text-center border border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
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
                  className="w-full py-2 text-center bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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