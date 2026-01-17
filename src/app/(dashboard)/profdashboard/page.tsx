// app/(dashboard)/profdashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileCard from '@/components/professor/ProfileCard';
import CompositionsCard, { Composition } from '@/components/professor/CompositionsCard';
import { useAuth } from '@/contexts/AuthContext';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { CourseResponse } from '@/lib/models/CourseResponse';
import CreateCourseModal from '@/components/create-course/page';
import { EnrollmentService } from '@/utils/enrollmentService';
import { toast } from 'react-hot-toast';
//import { StatsControllerService } from '@/lib/services/StatsControllerService';
import { useLoading } from '@/contexts/LoadingContext';

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

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  subjects?: string[];
  university?: string;
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
  exerciseStats: Array<{
    exerciseId: number;
    title: string;
    submissionCount: number;
    averageScore: number;
    minScore: number;
    maxScore: number;
    maxPossibleScore: number;
  }>;
  performanceDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    total: number;
  };
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
    
    const participationRate = stats.length > 0 
      ? stats.reduce((acc, stat) => acc + stat.participationRate, 0) / stats.length
      : 0;
    
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
      pendingSubmissions: 0
    };
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

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Chargement des données pour l\'utilisateur:', user.id);

      // 1. Fetch courses (compositions) pour cet enseignant
      const coursesResponse = await CourseControllerService.getAuthorCourses(user.id);
      console.log('Cours récupérés:', coursesResponse.data);
      
      if (coursesResponse.data) {
        const courses = coursesResponse.data as CourseResponse[];
        
        // 2. Fetch les statistiques pour tous les cours
        const statsResponse = await StatsControllerService.getTeacherCoursesStats();
        console.log('Statistiques récupérées:', statsResponse.data);
        
        if (statsResponse.data) {
          const coursesStatsData = statsResponse.data;
          setCoursesStats(coursesStatsData);

          // Calculer les statistiques globales
          const overall = calculateOverallStats(coursesStatsData);
          console.log('Statistiques globales calculées:', overall);
          setOverallStats(overall);

          // Mapper les compositions avec les données réelles
          const mappedCompositions: Composition[] = courses.map((course: CourseResponse) => {
            const courseIdNum = parseCourseId(course.id);
            
            const courseStat = coursesStatsData.find(s => s.courseId === courseIdNum);
            
            if (!courseStat) {
              console.log(`Pas de stats pour le cours ${course.id} (${course.title})`);
              return {
                id: course.id?.toString() || Math.random().toString(),
                title: course.title || 'Sans titre',
                class: course.category || 'Non spécifiée',
                participants: 0,
                likes: 0,
                downloads: 0,
                status: course.status || 'DRAFT'
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
              status: course.status || 'DRAFT'
            };
          });
          
          console.log('Compositions mappées:', mappedCompositions);
          setCompositions(mappedCompositions);
        } else {
          console.log('Aucune statistique disponible');
          const mappedCompositions: Composition[] = courses.map((course: CourseResponse) => ({
            id: course.id?.toString() || Math.random().toString(),
            title: course.title || 'Sans titre',
            class: course.category || 'Non spécifiée',
            participants: 0,
            likes: 0,
            downloads: 0,
            status: course.status || 'DRAFT'
          }));
          setCompositions(mappedCompositions);
        }
      } else {
        console.log('Aucun cours trouvé pour cet enseignant');
        setCompositions([]);
      }

      // 3. Fetch other teachers (optionnel)
      setTeachers([]);

      // 4. Fetch pending inscriptions count
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

  const handleCreateCourseSubmit = (data: { title: string; category: string; description: string }) => {
    const params = new URLSearchParams({
      new: 'true',
      title: data.title,
      category: data.category,
      description: data.description
    });
    router.push(`/editor?${params.toString()}`);
  };

  const handleDeleteComposition = async (id: string) => {
    try {
      startLoading();
      await CourseControllerService.deleteCourse(Number(id));
      setCompositions(prev => prev.filter(c => c.id !== id));
      toast.success("Cours supprimé avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression du cours:", error);
      toast.error("Impossible de supprimer le cours.");
    } finally {
      stopLoading();
    }
  };

  if (authLoading || loading || globalLoading) {
    return null;
  }

  if (!user) return null;

  const displayName = (user.firstName || user.lastName)
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    : user.email.split('@')[0];

  const professor = {
    id: user.id || user.email,
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
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCourseSubmit}
      />

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
          <div className="flex items-center gap-6">
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-8 space-y-8">
        <ProfileCard professor={professor} coursesStats={coursesStats} />

        {compositions.length > 0 ? (
          <CompositionsCard
            compositions={compositions}
            onDelete={handleDeleteComposition}
            onCreateClick={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-between mb-8 border-b border-purple-100 dark:border-gray-700 pb-4">
              <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                Mes Compositions
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold shadow-lg hover:bg-purple-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer un cours
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Vous n'avez pas encore créé de cours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}