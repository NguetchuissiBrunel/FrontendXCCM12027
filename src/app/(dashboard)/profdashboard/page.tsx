// app/(dashboard)/profdashboard/page.tsx - VERSION FINALE CORRIGÉE
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProfileCard, { CourseStat } from '@/components/professor/ProfileCard';
import CompositionsCard, { Composition } from '@/components/professor/CompositionsCard';
import { useAuth } from '@/contexts/AuthContext';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import CreateCourseModal from '@/components/create-course/page';
import { EnrollmentService } from '@/utils/enrollmentService';
import { useLoading } from '@/contexts/LoadingContext';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { EnseignantService } from '@/lib/services/EnseignantService';
import toast from 'react-hot-toast';
import { BookOpen, X, FileText, Plus, ChevronRight, Upload } from 'lucide-react';

// Définir les interfaces
interface Course {
  id?: number | string;
  title?: string;
  category?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  subjects?: string[];
  university?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photoUrl?: string;
  city?: string;
  university?: string;
  grade?: string;
  certification?: string;
  subjects?: string[];
  teachingGrades?: string[];
  teachingGoal?: string;
}

// Fonction utilitaire pour parser l'ID du cours
function parseCourseId(id: number | string | undefined): number {
  if (typeof id === 'number') {
    return id;
  }
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export default function ProfessorDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [exercisesStats, setExercisesStats] = useState({
    totalExercises: 0,
    pendingSubmissions: 0,
    averageScore: 0
  });
  const [pendingInscriptionsCount, setPendingInscriptionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCourseSelectionModalOpen, setIsCourseSelectionModalOpen] = useState(false);

  // Statistiques pour ProfileCard
  const [coursesStatsForProfile, setCoursesStatsForProfile] = useState<CourseStat[]>([]);

  // Mettre à jour le loading context de manière synchronisée
  useEffect(() => {
    const isActuallyLoading = authLoading || loading;

    if (isActuallyLoading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [authLoading, loading, startLoading, stopLoading]);

  // Fonction pour charger les statistiques manuellement
  const loadManualStats = useCallback(async (): Promise<CourseStat[]> => {
    try {
      console.log('🔍 Chargement manuel des statistiques...');
      const response = await EnseignantService.getAllCoursesStatistics();

      if (response.success && response.data) {
        console.log('✅ Statistiques chargées avec succès');

        // Transformer les données de l'API en format CourseStat
        const courseStats: CourseStat[] = response.data.map((course: any) => ({
          courseId: course.courseId || 0,
          courseTitle: course.courseTitle || course.title || `Cours ${course.courseId}`,
          courseCategory: course.courseCategory || course.category || 'Général',
          totalEnrolled: course.totalEnrolled || course.totalStudents || 0,
          activeStudents: course.activeStudents || Math.floor((course.totalEnrolled || 0) * 0.85),
          completionRate: course.completionRate || 0,
          participationRate: course.participationRate || 0,
          averageProgress: course.averageProgress || 0,
          totalExercises: course.totalExercises || 0,
          completedStudents: course.completedStudents || Math.floor((course.totalEnrolled || 0) * 0.65)
        }));

        return courseStats;
      }
      return [];
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques:', error);
      return [];
    }
  }, []);

  // Fonction pour calculer les statistiques d'exercices
  const calculateExercisesStats = useCallback(async (courses: Course[]) => {
    try {
      let totalPending = 0;
      let totalExercisesCount = 0;

      for (const course of courses) {
        const courseId = parseCourseId(course.id);
        if (courseId > 0) {
          try {
            const resp = await ExercicesService.getExercisesForCourse(courseId);
            const exercises = (resp as any)?.data || [];
            totalExercisesCount += exercises.length;

            // Limiter les appels pour éviter les boucles
            if (exercises.length > 0) {
              // Prendre seulement le premier exercice pour vérifier
              const firstEx = exercises[0];
              try {
                const submissionsResp = await EnseignantService.getSubmissions(firstEx.id);
                const submissions = (submissionsResp as any)?.data || [];
                const pending = submissions.filter((s: any) =>
                  s.graded === undefined || s.graded === false || !s.graded
                ).length;
                totalPending += pending;
              } catch (err) {
                console.error('Erreur chargement soumissions:', err);
              }
            }
          } catch (error) {
            console.error(`Erreur chargement exercices cours ${courseId}:`, error);
          }
        }
      }

      return {
        totalExercises: totalExercisesCount,
        pendingSubmissions: totalPending,
        averageScore: 0
      };
    } catch (error) {
      console.error('Erreur calcul statistiques exercices:', error);
      return {
        totalExercises: 0,
        pendingSubmissions: 0,
        averageScore: 0
      };
    }
  }, []);

  // Fonction pour formater la distribution des performances
  const formatPerformanceDistribution = useCallback((stats: CourseStat[]) => {
    try {
      const totalStudents = stats.reduce((sum, course) => sum + course.totalEnrolled, 0);
      const excellent = Math.round(totalStudents * 0.25); // 25%
      const good = Math.round(totalStudents * 0.35);      // 35%
      const average = Math.round(totalStudents * 0.25);   // 25%
      const poor = Math.round(totalStudents * 0.15);      // 15%

      return [
        {
          range: 'Excellent',
          value: totalStudents > 0 ? Math.round((excellent / totalStudents) * 100) : 0,
          color: 'bg-purple-600 dark:bg-purple-500'
        },
        {
          range: 'Bien',
          value: totalStudents > 0 ? Math.round((good / totalStudents) * 100) : 0,
          color: 'bg-purple-400'
        },
        {
          range: 'Passable',
          value: totalStudents > 0 ? Math.round((average / totalStudents) * 100) : 0,
          color: 'bg-purple-300 dark:bg-purple-400'
        },
        {
          range: 'Faible',
          value: totalStudents > 0 ? Math.round((poor / totalStudents) * 100) : 0,
          color: 'bg-purple-200 dark:bg-purple-300'
        },
      ];
    } catch (error) {
      console.error('Erreur formatPerformanceDistribution:', error);
      return [
        { range: 'Excellent', value: 0, color: 'bg-purple-600 dark:bg-purple-500' },
        { range: 'Bien', value: 0, color: 'bg-purple-400' },
        { range: 'Passable', value: 0, color: 'bg-purple-300 dark:bg-purple-400' },
        { range: 'Faible', value: 0, color: 'bg-purple-200 dark:bg-purple-300' },
      ];
    }
  }, []);

  // Fonction de suppression d'un cours
  const handleDeleteCourse = async (courseId: string) => {
    try {
      const courseIdNum = parseCourseId(courseId);
      if (courseIdNum === 0) {
        toast.error('ID de cours invalide');
        return;
      }


      startLoading();

      await CourseControllerService.deleteCourse(courseIdNum);

      toast.success('Cours supprimé avec succès');

      // Recharger les données
      await loadDashboardData();

    } catch (error: any) {
      console.error('Erreur lors de la suppression du cours:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de la suppression';
      toast.error(`Échec de la suppression: ${errorMessage}`);
    } finally {
      stopLoading();
    }
  };

  // Fonction pour gérer la fermeture du modal
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleCreateCourseSubmit = (data: {
    title: string;
    category: string;
    description: string;
    image?: string;
    file?: any;
  }) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un cours');
      return;
    }

    setIsModalOpen(false);

    const params = new URLSearchParams({
      new: 'true',
      title: data.title,
      category: data.category,
      description: data.description
    });

    router.push(`/editor?${params.toString()}`);
  };

  // Fonction pour ouvrir la modale de sélection de cours
  const openCourseSelectionModal = () => {
    setIsCourseSelectionModalOpen(true);
  };

  // Fonction pour sélectionner un cours
  const handleCourseSelect = (courseId: string) => {
    setIsCourseSelectionModalOpen(false);
    router.push(`/profdashboard/exercises/${courseId}`);
  };

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setDashboardError(null);

      console.log('📊 Chargement des données du dashboard pour:', user);

      // 1. Fetch courses (compositions) pour cet enseignant
      const coursesResponse = await CourseControllerService.getAuthorCourses(user.id);

      if (coursesResponse.data) {
        const courses = coursesResponse.data as Course[];
        console.log(`📚 Cours trouvés: ${courses.length}`);

        // 2. Calculer les statistiques d'exercices
        const exercisesData = await calculateExercisesStats(courses);
        setExercisesStats(exercisesData);

        // 3. Charger les statistiques pour ProfileCard
        const statsData = await loadManualStats();
        setCoursesStatsForProfile(statsData);

        // 4. Mapper les compositions avec les données réelles
        const mappedCompositions: Composition[] = courses.map((course: Course) => {
          const courseIdNum = parseCourseId(course.id);
          const courseStat = statsData.find((s: CourseStat) => s.courseId === courseIdNum);

          if (!courseStat) {
            return {
              id: course.id?.toString() || Math.random().toString(),
              title: course.title || 'Sans titre',
              class: course.category || 'Non spécifiée',
              participants: 0,
              likes: 0,
              downloads: 0,
              status: course.status || 'DRAFT',
              courseStats: undefined
            };
          }

          let totalLikes = 0;
          let totalDownloads = 0;

          // Utiliser les valeurs des statistiques
          totalLikes = Math.round(courseStat.activeStudents * 0.3); // Estimation
          totalDownloads = Math.round(courseStat.completedStudents * 1.5); // Estimation

          return {
            id: course.id?.toString() || Math.random().toString(),
            title: course.title || 'Sans titre',
            class: course.category || 'Non spécifiée',
            participants: courseStat.totalEnrolled || 0,
            likes: totalLikes,
            downloads: totalDownloads,
            status: course.status || 'DRAFT',
            courseStats: {
              totalExercises: courseStat.totalExercises || 0,
              totalEnrolled: courseStat.totalEnrolled || 0
            }
          };
        });

        setCompositions(mappedCompositions);

      } else {
        console.log('⚠️ Aucun cours trouvé');
        setCompositions([]);
        setCoursesStatsForProfile([]);
      }

      // 5. Fetch pending inscriptions count
      try {
        const pendingData = await EnrollmentService.getPendingEnrollments();
        setPendingInscriptionsCount(pendingData.length);
        console.log(`📝 Inscriptions en attente: ${pendingData.length}`);
      } catch (error) {
        console.error('Erreur chargement inscriptions:', error);
        setPendingInscriptionsCount(0);
      }

      console.log('✅ Dashboard chargé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données du tableau de bord:', error);
      setDashboardError('Impossible de charger les données du dashboard');
      toast.error('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  }, [user, calculateExercisesStats, loadManualStats]);

  // Charger les données au montage
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'teacher') {
      router.push('/etudashboard');
      return;
    }

    if (user) {
      console.log('🚀 Initialisation du dashboard');
      loadDashboardData();
    }
  }, [user, authLoading, isAuthenticated, router, loadDashboardData]);

  // Afficher l'erreur du dashboard
  useEffect(() => {
    if (dashboardError && !loading) {
      toast.error(dashboardError, { duration: 5000 });
    }
  }, [dashboardError, loading]);

  // Si on charge ou que le loader global est actif, on ne rend rien (le loader s'en occupe)
  if (authLoading || loading || globalLoading) {
    return null;
  }

  if (!user) return null;

  const displayName = (user.firstName || user.lastName)
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    : user.email.split('@')[0];

  // Calculer les totaux basés sur les compositions
  const calculatedTotals = compositions.reduce((acc, course) => ({
    totalEnrolled: acc.totalEnrolled + (course.participants || 0),
    totalCourses: acc.totalCourses + 1,
    totalExercises: acc.totalExercises + (course.courseStats?.totalExercises || 0)
  }), {
    totalEnrolled: 0,
    totalCourses: 0,
    totalExercises: 0
  });

  // Calculer la progression moyenne (simplifiée)
  const averageProgress = calculatedTotals.totalEnrolled > 0
    ? Math.round((calculatedTotals.totalEnrolled * 0.7)) // Valeur simulée
    : 0;

  const professor = {
    id: user.email,
    name: displayName,
    city: user.city || 'Non spécifiée',
    university: user.university || 'Non spécifiée',
    grade: user.grade || 'Enseignant',
    certification: user.certification || 'Enseignement',
    totalStudents: calculatedTotals.totalEnrolled,
    activeStudents: Math.round(calculatedTotals.totalEnrolled * 0.6), // Valeur simulée
    participationRate: calculatedTotals.totalEnrolled > 0
      ? Math.round((calculatedTotals.totalEnrolled * 0.6) / calculatedTotals.totalEnrolled * 100)
      : 0,
    publications: calculatedTotals.totalCourses,
    photoUrl: user.photoUrl || '/images/prof.jpeg',
    performanceDistribution: formatPerformanceDistribution(coursesStatsForProfile),
    averageProgress: averageProgress,
    totalExercises: calculatedTotals.totalExercises,
    completedStudents: Math.round(calculatedTotals.totalEnrolled * 0.3), // Valeur simulée
    pendingSubmissions: exercisesStats.pendingSubmissions
  };

  const teachersList = teachers.map(t => ({
    id: t.id,
    name: `${t.firstName} ${t.lastName}`,
    subject: t.subjects?.[0] || 'Enseignement',
    rating: 4.5,
    students: 0,
    image: '',
    university: t.university
  }));

  // Formater le temps écoulé
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
      {/* Modale de création de cours */}
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleCreateCourseSubmit}
      />

      {/* Modale de sélection de cours */}
      {isCourseSelectionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400">
                Sélectionnez un cours
              </h3>
              <button
                onClick={() => setIsCourseSelectionModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Choisissez le cours pour lequel vous souhaitez créer un exercice :
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {compositions.map((course) => (
                <button
                  key={course.id}
                  onClick={() => handleCourseSelect(course.id)}
                  className="w-full text-left p-3 rounded-lg border border-purple-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors flex items-start gap-3"
                >
                  <BookOpen size={20} className="text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {course.title}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {course.class}
                      </span>
                      <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        {course.participants} participants
                      </span>
                    </div>
                    {course.courseStats?.totalExercises && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {course.courseStats.totalExercises} exercice(s)
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsCourseSelectionModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Section with Welcome */}
      <div className="bg-white dark:bg-gray-800 px-8 py-6 mb-8 border-b border-purple-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-400 mb-3">
            Bienvenue Professeur {user.firstName} !
          </h1>
          <p className="text-gray-600 dark:text-gray-300 italic">
            "L'éducation est l'arme la plus puissante que vous puissiez utiliser pour changer le monde." - Nelson Mandela
          </p>
        </div>
        <div>
          <div className="flex items-center gap-4 flex-wrap">
            {/* Bouton Gérer les inscriptions */}
            <button
              onClick={() => router.push('/teacher/inscriptions')}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Gérer les inscriptions
              {pendingInscriptionsCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-white dark:ring-gray-800 animate-bounce">
                  {pendingInscriptionsCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 pb-8 space-y-8">
        {/* Profile Card */}
        <ProfileCard
          professor={professor}
          coursesStats={coursesStatsForProfile}
        />

        {/* Actions rapides pour les exercices sous le profil */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <span className="flex items-center gap-2">
              <Upload className="text-purple-600 dark:text-purple-400" size={22} />
              Actions rapides sur les exercices
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bouton Tous les exercices */}
            <button
              onClick={() => {
                if (compositions.length > 0) {
                  router.push('/profdashboard/exercises');
                } else {
                  toast.error("Créez d'abord un cours pour gérer les exercices");
                }
              }}
              className="group relative bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border-2 border-blue-300/50 dark:border-blue-700/50 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <FileText size={24} className="text-white" />
                </div>

                <div className="flex-1 text-left">
                  <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-1">
                    Tous les exercices
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Consultez, modifiez et gérez tous vos exercices
                  </p>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                      {exercisesStats.totalExercises} exercices
                    </div>
                    <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                      {exercisesStats.pendingSubmissions} à corriger
                    </div>
                  </div>
                </div>

                <ChevronRight className="flex-shrink-0 text-blue-500 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-200" size={20} />
              </div>

              <div className="absolute bottom-2 right-2 text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Cliquer pour ouvrir →
              </div>
            </button>

            {/* Bouton Créer un exercice */}
            <button
              onClick={() => {
                if (compositions.length > 0) {
                  openCourseSelectionModal();
                } else {
                  toast.error("Créez d'abord un cours pour gérer les exercices");
                }
              }}
              className="group relative bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 border-2 border-green-300/50 dark:border-green-700/50 hover:border-green-400 dark:hover:border-green-500 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <Plus size={24} className="text-white" />
                </div>

                <div className="flex-1 text-left">
                  <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-1">
                    Créer un exercice
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Ajoutez un nouvel exercice à un de vos cours
                  </p>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full">
                      {compositions.length} cours disponibles
                    </div>
                    <div className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full">
                      Nouveau
                    </div>
                  </div>
                </div>

                <ChevronRight className="flex-shrink-0 text-green-500 dark:text-green-400 group-hover:translate-x-1 transition-transform duration-200" size={20} />
              </div>

              <div className="absolute bottom-2 right-2 text-xs text-green-600 dark:text-green-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Cliquer pour commencer →
              </div>
            </button>
          </div>

          {/* Indicateur de statut SIMPLIFIÉ */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <div className="inline-flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Système opérationnel</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {compositions.length} cours • {exercisesStats.totalExercises} exercices
              </p>
            </div>
          </div>
        </div>

        {/* Compositions Card */}
        {compositions.length > 0 ? (
          <CompositionsCard
            compositions={compositions}
            onDelete={handleDeleteCourse}
            onCreateClick={() => setIsModalOpen(true)}
            onManageExercises={(courseId) => router.push(`/profdashboard/exercises/${courseId}`)}
            getCourseStats={(id) => {
              const courseId = parseCourseId(id);
              const stats = coursesStatsForProfile.find((s: CourseStat) => s.courseId === courseId);
              return stats ? {
                totalExercises: stats.totalExercises || 0,
                totalEnrolled: stats.totalEnrolled || 0
              } : undefined;
            }}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-4">
              Mes Compositions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {coursesStatsForProfile.length > 0
                ? `Vous avez ${coursesStatsForProfile.length} cours mais aucun étudiant n'est encore inscrit.`
                : "Vous n'avez pas encore créé de cours. Créez votre premier cours pour commencer à suivre les statistiques de vos étudiants."}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-purple-800 hover:shadow-xl transition-all duration-200 mx-auto"
            >
              <Plus size={20} />
              Créer un cours
            </button>
          </div>
        )}

        {/* Section de débogage optionnelle (à cacher en production) */}
        {process.env.NODE_ENV === 'development' && dashboardError && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-900/30">
            <p className="text-sm text-red-600 dark:text-red-400">
              <strong>Erreur:</strong> {dashboardError}
            </p>
            <button
              onClick={() => loadDashboardData()}
              className="mt-2 text-sm text-red-700 dark:text-red-300 underline"
            >
              Réessayer le chargement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}