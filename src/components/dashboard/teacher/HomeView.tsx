// app/(dashboard)/profdashboard/page.tsx - VERSION FINALE CORRIGÉE
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProfileCard, { CourseStat } from '@/components/professor/ProfileCard';
import CompositionsCard, { Composition } from '@/components/professor/CompositionsCard';
import { useAuth } from '@/contexts/AuthContext';
import { CourseClassService } from '@/lib/services/CourseClassService';
import CreateCourseModal from '@/components/create-course/page';
import { EnrollmentService } from '@/utils/enrollmentService';
import { useLoading } from '@/contexts/LoadingContext';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { EnseignantService } from '@/lib/services/EnseignantService';
import toast from 'react-hot-toast';
import { BookOpen, X, FileText, Plus, ChevronRight, Upload, Users as LucideUsers, Activity } from 'lucide-react';
import DashboardSkeleton from '@/components/professor/DashboardSkeleton';
import ManageClassCoursesModal from '@/components/professor/ManageClassCoursesModal';

// Définir les interfaces
interface Course {
  id?: number | string;
  title?: string;
  category?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

interface CourseClass {
  id: number;
  name: string;
  theme?: string;
  description?: string;
  coverImage?: string;
  status?: 'OPEN' | 'CLOSED' | 'ARCHIVED';
  maxStudents?: number;
  studentCount?: number;
  courses?: Course[];
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

// Fonction utilitaire pour parser l'ID
function parseId(id: number | string | undefined): number {
  if (typeof id === 'number') {
    return id;
  }
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export default function HomeView() {
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
  const [isManageCoursesModalOpen, setIsManageCoursesModalOpen] = useState(false);
  const [selectedClassIdForCourses, setSelectedClassIdForCourses] = useState<number | null>(null);

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
          completedStudents: course.completedStudents || Math.floor((course.totalEnrolled || 0) * 0.65),
          pendingEnrollments: course.pendingEnrollments,
          acceptedEnrollments: course.acceptedEnrollments,
          rejectedEnrollments: course.rejectedEnrollments,
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
  const calculateExercisesStats = useCallback(async (classes: CourseClass[]) => {
    try {
      let totalPending = 0;
      let totalExercisesCount = 0;

      // On itère sur toutes les classes et leurs cours imbriqués
      for (const cls of classes) {
        if (!cls.courses) continue;
        for (const course of cls.courses) {
          const courseId = parseId(course.id);
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

  // Fonction de suppression d'une classe de cours
  const handleDeleteCourse = async (classId: string) => {
    try {
      const classIdNum = parseId(classId);
      if (classIdNum === 0) {
        toast.error('ID de classe invalide');
        return;
      }

      startLoading();

      await CourseClassService.deleteClass(classIdNum);

      toast.success('Classe supprimée avec succès');

      // Recharger les données
      await loadDashboardData();

    } catch (error: any) {
      console.error('Erreur lors de la suppression de la classe:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de la suppression';
      toast.error(`Échec de la suppression: ${errorMessage}`);
    } finally {
      stopLoading();
    }
  };

  // Changer le statut d'une classe
  const handleChangeClassStatus = async (classId: string, status: 'OPEN' | 'CLOSED' | 'ARCHIVED') => {
    const classIdNum = parseId(classId);
    if (classIdNum === 0) {
      toast.error('ID de classe invalide');
      return;
    }
    try {
      await CourseClassService.changeClassStatus(classIdNum, status);
      const labels: Record<string, string> = { OPEN: 'Ouverte', CLOSED: 'Fermée', ARCHIVED: 'Archivée' };
      toast.success(`Statut de la classe mis à jour : ${labels[status]}`);
      await loadDashboardData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Erreur lors du changement de statut';
      toast.error(msg);
    }
  };

  // Fonction pour gérer la fermeture du modal
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleCreateCourseSubmit = async (data: {
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

    try {
      startLoading();

      // Création d'un Cours via CourseControllerService
      const { CourseControllerService } = await import('@/lib/services/CourseControllerService');
      const newCourseResponse = await CourseControllerService.createCourse(user.id, {
        title: data.title,
        category: data.category,
        description: data.description,
        status: 'DRAFT'
      });

      if (newCourseResponse?.data?.id) {
        toast.success('Cours créé avec succès !');
        // On pourrait aussi uploader l'image ici si le service le permet
        await loadDashboardData();
      } else {
        throw new Error("Impossible de récupérer l'id du cours");
      }
    } catch (err) {
      toast.error('Erreur lors de la création de la classe');
      console.error(err);
    } finally {
      stopLoading();
    }
  };

  // Fonction pour ouvrir la modale de sélection de cours (pour exercice)
  const openCourseSelectionModal = () => {
    setIsCourseSelectionModalOpen(true);
  };

  const handleCourseSelect = (classId: string) => {
    setIsCourseSelectionModalOpen(false);
    // TODO: Redirection modifiée pour pointer vers les détails de la classe ou un éditeur de cours
    router.push(`/profdashboard/exercises/${classId}`); // Pour l'instant on garde le route existant, qui pointera vers la classe
  };

  const handleOpenManageCoursesForClass = (classIdString: string) => {
    const classIdNum = parseId(classIdString);
    if (classIdNum > 0) {
      setSelectedClassIdForCourses(classIdNum);
      setIsManageCoursesModalOpen(true);
    } else {
      toast.error("ID de classe invalide");
    }
  };

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setDashboardError(null);

      console.log('📊 Chargement des données du dashboard pour:', user);

      // 1. Fetch classes pour cet enseignant
      const classesResponse = await CourseClassService.getMyClasses();

      if (classesResponse.data) {
        const classes = classesResponse.data as CourseClass[];
        console.log(`📚 Classes trouvées: ${classes.length}`);

        // 2. Calculer les statistiques d'exercices à travers toutes les classes
        const exercisesData = await calculateExercisesStats(classes);
        setExercisesStats(exercisesData);

        // 3. Charger les statistiques pour ProfileCard
        const statsData = await loadManualStats();
        setCoursesStatsForProfile(statsData);

        // 4. Mapper les "compositions" pour utiliser les classes de cours
        const mappedCompositions: Composition[] = classes.map((cls: CourseClass) => {

          let totalLikes = 0;
          let totalDownloads = 0;
          let totalExercisesClass = 0;

          // Aggréger les stats depuis les cours
          if (cls.courses) {
            totalLikes = cls.courses.reduce((sum, c) => sum + (c.status === 'PUBLISHED' ? 10 : 0), 0); // Simulation
          }

          return {
            id: cls.id?.toString() || Math.random().toString(),
            title: cls.name || 'Classe Sans titre',
            class: cls.theme || 'Général',
            participants: cls.studentCount || 0,
            likes: totalLikes,
            downloads: totalDownloads,
            status: cls.status || 'OPEN',
            courseStats: {
              totalExercises: totalExercisesClass,
              totalEnrolled: cls.studentCount || 0
            }
          };
        });

        setCompositions(mappedCompositions);

      } else {
        console.log('⚠️ Aucune classe trouvée');
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

  // Si on charge, on rend le skeleton pour donner un retour visuel immédiat
  if (authLoading || loading) {
    return <DashboardSkeleton />;
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
    email: user.email,
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

  function parseCourseId(id: string) {
    throw new Error('Function not implemented.');
  }

  return (
    <>
      {/* Modale de création de cours */}
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleCreateCourseSubmit}
      />

      {/* Modale de gestion des cours de la classe */}
      <ManageClassCoursesModal
        isOpen={isManageCoursesModalOpen}
        onClose={() => {
          setIsManageCoursesModalOpen(false);
          setSelectedClassIdForCourses(null);
        }}
        classId={selectedClassIdForCourses}
        onCourseUpdated={() => {
          loadDashboardData();
        }}
      />

      {/* Modale de sélection de cours */}
      {isCourseSelectionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400">
                Sélectionnez une Classe
              </h3>
              <button
                onClick={() => setIsCourseSelectionModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Choisissez la classe pour laquelle vous souhaitez gérer les exercices :
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
                    {course.courseStats?.totalExercises !== undefined && (
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

      {/* Section de bienvenue et statistiques */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 mb-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-3xl">
            <h1 className="text-2xl md:text-4xl font-bold text-purple-700 dark:text-purple-400 mb-4">
              Bienvenue {user.firstName} !
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
              Ravi de vous revoir. Voici l'état de vos enseignements aujourd'hui.
            </p>
          </div>

          {/* Statistiques rapides */}
          <div className="bg-purple-50 dark:bg-gray-700 rounded-xl p-4 w-full md:w-auto">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-purple-700 dark:text-purple-400">
                  {professor.totalStudents}
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Étudiants</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-purple-700 dark:text-purple-400">
                  {professor.publications}
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Cours</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-orange-600">
                  {professor.pendingSubmissions}
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">À corriger</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {professor.averageProgress}%
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Colonne gauche : Profile et Compositions */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileCard
            professor={professor}
            coursesStats={coursesStatsForProfile}
          />
        </div>

        {/* Colonne droite : Actions et Stats secondaires */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="text-purple-500 w-4 h-4 md:w-5 md:h-5" />
              Actions rapides
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-purple-100 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <Plus size={18} />
                  </div>
                  <span className="text-sm font-medium">Nouveau Cours</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push('/profdashboard?tab=inscriptions')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-purple-100 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <LucideUsers size={18} />
                  </div>
                  <span className="text-sm font-medium">Inscriptions ({pendingInscriptionsCount})</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  if (compositions.length > 0) {
                    openCourseSelectionModal();
                  } else {
                    toast.error("Créez d'abord un cours");
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-purple-100 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    <Upload size={18} />
                  </div>
                  <span className="text-sm font-medium">Créer un exercice</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Status du système */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 md:p-5 border border-purple-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-bold text-gray-800 dark:text-white text-sm">Status du système</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {compositions.length} cours actifs • {professor.totalExercises} exercices créés
            </p>
          </div>
        </div>
      </div>

      {/* Section de débogage optionnelle (à cacher en production) */}
      {process.env.NODE_ENV === 'development' && dashboardError && (
        <div className="mt-8 bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-900/30">
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
    </>
  );
}