// app/(dashboard)/profdashboard/page.tsx - Version finale avec les deux boutons
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileCard from '@/components/professor/ProfileCard';
import CompositionsCard, { Composition } from '@/components/professor/CompositionsCard';
import { useAuth } from '@/contexts/AuthContext';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import CreateCourseModal from '@/components/create-course/page';
import { EnrollmentService } from '@/utils/enrollmentService';
import { useLoading } from '@/contexts/LoadingContext';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { EnseignantService } from '@/lib/services/EnseignantService';
import { StatsControllerService, CourseStatsResponse } from '@/lib/services/StatsControllerService';
import toast from 'react-hot-toast';
import { BookOpen, X, FileText, FolderOpen } from 'lucide-react';

// Définir les interfaces pour les statistiques
interface Course {
  id?: number | string;
  title?: string;
  category?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

interface ExerciseStat {
  exerciseId: number;
  title: string;
  submissionCount: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  maxPossibleScore: number;
}

interface PerformanceDistribution {
  excellent: number;
  good: number;
  average: number;
  poor: number;
  total: number;
}

interface CourseStats {
  courseId: number;
  courseTitle: string;
  courseCategory: string;
  totalEnrolled: number;
  activeStudents: number;
  participationRate: number;
  averageProgress: number;
  completedStudents: number;
  totalExercises: number;
  exerciseStats?: ExerciseStat[];
  performanceDistribution: PerformanceDistribution;
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
  const [coursesStats, setCoursesStats] = useState<CourseStats[]>([]);
  const [exercisesStats, setExercisesStats] = useState({
    totalExercises: 0,
    pendingSubmissions: 0,
    averageScore: 0
  });
  const [overallStats, setOverallStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    participationRate: 0,
    publications: 0,
    totalExercises: 0,
    averageProgress: 0,
    completedStudents: 0,
    pendingSubmissions: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCourseSelectionModalOpen, setIsCourseSelectionModalOpen] = useState(false);
  const [pendingInscriptionsCount, setPendingInscriptionsCount] = useState(0);

  useEffect(() => {
    if (authLoading || loading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [authLoading, loading, startLoading, stopLoading]);

  // Fonction pour calculer les statistiques globales
  const calculateOverallStats = (stats: CourseStats[]) => {
    if (stats.length === 0) return {
      totalStudents: 0,
      activeStudents: 0,
      participationRate: 0,
      publications: 0,
      totalExercises: 0,
      averageProgress: 0,
      completedStudents: 0,
      pendingSubmissions: 0
    };

    const totalStudents = stats.reduce((acc, stat) => acc + stat.totalEnrolled, 0);
    const activeStudents = stats.reduce((acc, stat) => acc + stat.activeStudents, 0);
    const totalExercises = stats.reduce((acc, stat) => acc + stat.totalExercises, 0);
    const completedStudents = stats.reduce((acc, stat) => acc + stat.completedStudents, 0);
    
    // Calculer la participation rate moyenne
    const participationRate = stats.length > 0 
      ? stats.reduce((acc, stat) => acc + stat.participationRate, 0) / stats.length
      : 0;
    
    // Calculer la progression moyenne
    const averageProgress = stats.length > 0
      ? stats.reduce((acc, stat) => acc + stat.averageProgress, 0) / stats.length
      : 0;

    return {
      totalStudents,
      activeStudents,
      participationRate: Math.round(participationRate),
      publications: stats.length,
      totalExercises,
      averageProgress: Math.round(averageProgress),
      completedStudents,
      pendingSubmissions: 0 // Calculé séparément
    };
  };

  // Fonction pour calculer les statistiques d'exercices
  const calculateExercisesStats = async (courses: Course[]) => {
    try {
      let totalPending = 0;
      let totalExercisesCount = 0;
      
      // Pour chaque cours, compter les soumissions en attente
      for (const course of courses) {
        const courseId = parseCourseId(course.id);
        if (courseId > 0) {
          try {
            // Récupérer les exercices du cours
            const resp = await ExercicesService.getExercisesForCourse(courseId);
            const exercises = (resp as any)?.data || [];
            totalExercisesCount += exercises.length;
            
            // Pour chaque exercice, compter les soumissions en attente (enseignant endpoint)
            for (const ex of exercises) {
              try {
                const submissionsResp = await EnseignantService.getSubmissions(ex.id);
                const submissions = (submissionsResp as any)?.data || [];
                const pending = submissions.filter((s: any) => !s.graded).length;
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
      
      setExercisesStats({
        totalExercises: totalExercisesCount,
        pendingSubmissions: totalPending,
        averageScore: 0 // À calculer si nécessaire
      });
      
      return totalPending;
    } catch (error) {
      console.error('Erreur calcul statistiques exercices:', error);
      return 0;
    }
  };

  // Fonction pour formater la distribution des performances
  const formatPerformanceDistribution = (stats: CourseStats[]) => {
    if (stats.length === 0) {
      return [
        { range: 'Excellent', value: 0, color: 'bg-purple-600 dark:bg-purple-500' },
        { range: 'Bien', value: 0, color: 'bg-purple-400' },
        { range: 'Passable', value: 0, color: 'bg-purple-300 dark:bg-purple-400' },
        { range: 'Faible', value: 0, color: 'bg-purple-200 dark:bg-purple-300' },
      ];
    }

    const totalDistribution = {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
      total: 0
    };

    stats.forEach(stat => {
      totalDistribution.excellent += stat.performanceDistribution.excellent;
      totalDistribution.good += stat.performanceDistribution.good;
      totalDistribution.average += stat.performanceDistribution.average;
      totalDistribution.poor += stat.performanceDistribution.poor;
      totalDistribution.total += stat.performanceDistribution.total;
    });

    const totalStudents = totalDistribution.total || 1;

    return [
      { 
        range: 'Excellent', 
        value: Math.round((totalDistribution.excellent / totalStudents) * 100) || 0, 
        color: 'bg-purple-600 dark:bg-purple-500' 
      },
      { 
        range: 'Bien', 
        value: Math.round((totalDistribution.good / totalStudents) * 100) || 0, 
        color: 'bg-purple-400' 
      },
      { 
        range: 'Passable', 
        value: Math.round((totalDistribution.average / totalStudents) * 100) || 0, 
        color: 'bg-purple-300 dark:bg-purple-400' 
      },
      { 
        range: 'Faible', 
        value: Math.round((totalDistribution.poor / totalStudents) * 100) || 0, 
        color: 'bg-purple-200 dark:bg-purple-300' 
      },
    ];
  };

  // Fonction de suppression d'un cours
  const handleDeleteCourse = async (courseId: string) => {
    try {
      const courseIdNum = parseCourseId(courseId);
      if (courseIdNum === 0) {
        toast.error('ID de cours invalide');
        return;
      }

      // Confirmation supplémentaire
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.')) {
        return;
      }

      startLoading();
      
      // Appel API pour supprimer le cours
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

  // LOGIQUE SIMPLIFIÉE - Redirection vers l'éditeur sans créer de brouillon
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

    // Fermer le modal
    setIsModalOpen(false);
    
    // Construire les paramètres pour l'éditeur
    const params = new URLSearchParams({
      new: 'true',
      title: encodeURIComponent(data.title),
      category: encodeURIComponent(data.category),
      description: encodeURIComponent(data.description)
    });
    
    // Redirection immédiate vers l'éditeur
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

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Chargement des données pour l\'utilisateur:', user.id);

      // 1. Fetch courses (compositions) pour cet enseignant
      const coursesResponse = await CourseControllerService.getAuthorCourses(user.id);
      console.log('Cours récupérés:', coursesResponse.data);
      
      if (coursesResponse.data) {
        const courses = coursesResponse.data as Course[];
        
        // 2. Calculer les statistiques d'exercices
        const pendingSubmissions = await calculateExercisesStats(courses);
        
        // 3. Fetch les statistiques pour tous les cours
        const statsResponse = await StatsControllerService.getTeacherCoursesStats();
        console.log('Statistiques récupérées:', statsResponse.data);
        
        if (statsResponse.data) {
          const coursesStatsData = statsResponse.data as CourseStatsResponse[];
          const convertedStats: CourseStats[] = coursesStatsData.map(stat => ({
            ...stat,
            exerciseStats: stat.exerciseStats || []
          }));
          
          console.log('Statistiques converties:', convertedStats);
          setCoursesStats(convertedStats);

          // Calculer les statistiques globales avec les soumissions en attente
          const overall = {
            ...calculateOverallStats(convertedStats),
            pendingSubmissions
          };
          console.log('Statistiques globales calculées:', overall);
          setOverallStats(overall);

          // Mapper les compositions avec les données réelles
          const mappedCompositions: Composition[] = courses.map((course: Course) => {
            const courseIdNum = parseCourseId(course.id);
            
            const courseStat = convertedStats.find(s => s.courseId === courseIdNum);
            
            if (!courseStat) {
              console.log(`Pas de stats pour le cours ${course.id} (${course.title})`);
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
            
            if (courseStat.exerciseStats) {
              totalLikes = courseStat.exerciseStats.reduce((sum, ex) => sum + (ex.submissionCount || 0), 0);
              totalDownloads = courseStat.exerciseStats.reduce((sum, ex) => sum + (ex.maxScore || 0), 0);
            }
            
            return {
              id: course.id?.toString() || Math.random().toString(),
              title: course.title || 'Sans titre',
              class: course.category || 'Non spécifiée',
              participants: courseStat.totalEnrolled || 0,
              likes: totalLikes,
              downloads: totalDownloads,
              status: course.status || 'DRAFT',
              courseStats: {
                totalExercises: courseStat.totalExercises,
                totalEnrolled: courseStat.totalEnrolled
              }
            };
          });
          
          console.log('Compositions mappées:', mappedCompositions);
          setCompositions(mappedCompositions);
        } else {
          console.log('Aucune statistique disponible');
          const mappedCompositions: Composition[] = courses.map((course: Course)=> ({
            id: course.id?.toString() || Math.random().toString(),
            title: course.title || 'Sans titre',
            class: course.category || 'Non spécifiée',
            participants: 0,
            likes: 0,
            downloads: 0,
            status: course.status || 'DRAFT',
            courseStats: undefined
          }));
          setCompositions(mappedCompositions);
        }
      } else {
        console.log('Aucun cours trouvé pour cet enseignant');
        setCompositions([]);
      }

      // 4. Fetch other teachers (optionnel)
      setTeachers([]);

      // 5. Fetch pending inscriptions count
      const pendingData = await EnrollmentService.getPendingEnrollments();
      setPendingInscriptionsCount(pendingData.length);

    } catch (error) {
      console.error('Erreur lors du chargement des données du tableau de bord:', error);
      toast.error('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

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
      loadDashboardData();
    }
  }, [user, authLoading, isAuthenticated, router]);

  if (authLoading || loading || globalLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des données du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = (user.firstName || user.lastName)
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    : user.email.split('@')[0];

  const professor = {
    id: user.email,
    name: displayName,
    city: user.city || 'Non spécifiée',
    university: user.university || 'Non spécifiée',
    grade: user.grade || 'Enseignant',
    certification: user.certification || 'Enseignement',
    totalStudents: overallStats.totalStudents,
    activeStudents: overallStats.activeStudents,
    participationRate: overallStats.participationRate,
    publications: overallStats.publications,
    photoUrl: user.photoUrl || '/images/prof.jpeg',
    performanceDistribution: formatPerformanceDistribution(coursesStats),
    averageProgress: overallStats.averageProgress,
    totalExercises: overallStats.totalExercises,
    completedStudents: overallStats.completedStudents,
    pendingSubmissions: overallStats.pendingSubmissions
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
              Choisissez le cours pour lequel vous souhaitez gérer les exercices :
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
            <button
              onClick={() => router.push('/teacher/inscriptions')}
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
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
            
            {/* Bouton 1: Vue d'ensemble de TOUS les exercices */}
            <button
              onClick={() => {
                if (compositions.length > 0) {
                  router.push('/profdashboard/exercises');
                } else {
                  toast.error("Créez d'abord un cours pour gérer les exercices");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <FileText size={20} />
              Tous les exercices
            </button>
            
            {/* Bouton 2: Sélectionner un cours spécifique */}
            <button
              onClick={() => {
                if (compositions.length > 0) {
                  openCourseSelectionModal();
                } else {
                  toast.error("Créez d'abord un cours pour gérer les exercices");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              <FolderOpen size={20} />
              Créer un exercice
            </button>
            
            {/* Notification des soumissions en attente */}
            {overallStats.pendingSubmissions > 0 && (
              <button
                onClick={() => {
                  const courseWithPending = compositions.find(c => 
                    c.courseStats?.totalExercises && c.courseStats.totalExercises > 0
                  );
                  if (courseWithPending) {
                    router.push(`/profdashboard/exercises/${courseWithPending.id}/grading`);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition relative"
              >
                <span className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {overallStats.pendingSubmissions}
                </span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Corriger ({overallStats.pendingSubmissions})
              </button>
            )}
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 pb-8 space-y-8">
        {/* Profile Card */}
        <ProfileCard 
          professor={professor} 
          coursesStats={coursesStats}
        />

        {/* Compositions Card */}
        {compositions.length > 0 ? (
          <CompositionsCard 
            compositions={compositions} 
            onDelete={handleDeleteCourse}
            onCreateClick={() => setIsModalOpen(true)}
            onManageExercises={(courseId) => router.push(`/profdashboard/exercises/${courseId}`)}
            getCourseStats={(id) => {
              const courseId = parseCourseId(id);
              const stats = coursesStats.find(s => s.courseId === courseId);
              return stats ? {
                totalExercises: stats.totalExercises,
                totalEnrolled: stats.totalEnrolled
              } : undefined;
            }}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-4">
              Mes Compositions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {coursesStats.length > 0 
                ? `Vous avez ${coursesStats.length} cours mais aucun étudiant n'est encore inscrit.` 
                : "Vous n'avez pas encore créé de cours. Créez votre premier cours pour commencer à suivre les statistiques de vos étudiants."}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold shadow-lg hover:bg-purple-700 transition mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer un cours
            </button>
          </div>
        )}
      </div>
    </div>
  );
}