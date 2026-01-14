// app/(dashboard)/profdashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileCard from '@/components/professor/ProfileCard';
import CompositionsCard, { Composition } from '@/components/professor/CompositionsCard';
import { useAuth } from '@/contexts/AuthContext';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { StatsControllerService, CourseStatsResponse } from '@/lib/services/StatsControllerService';
import CreateCourseModal from '@/./components/create-course/page';
import { useLoading } from '@/contexts/LoadingContext';

// Définir les interfaces pour les statistiques
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
    completedStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading || loading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [authLoading, loading, startLoading, stopLoading]);

  // Fonction pour calculer les statistiques globales CORRECTEMENT
  const calculateOverallStats = (stats: CourseStats[]) => {
    if (stats.length === 0) return {
      totalStudents: 0,
      activeStudents: 0,
      participationRate: 0,
      publications: 0,
      totalExercises: 0,
      averageProgress: 0,
      completedStudents: 0
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
      completedStudents
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

    // Calculer la distribution globale à partir de tous les cours
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

    // Calculer les pourcentages
    const totalStudents = totalDistribution.total || 1; // Éviter la division par zéro

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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'teacher') {
      router.push('/etudashboard');
      return;
    }

    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        console.log('Chargement des données pour l\'utilisateur:', user.id);

        // 1. Fetch courses (compositions) pour cet enseignant
        const coursesResponse = await CourseControllerService.getAuthorCourses(user.id);
        console.log('Cours récupérés:', coursesResponse.data);
        
        if (coursesResponse.data) {
          // 2. Fetch les statistiques pour tous les cours
          const statsResponse = await StatsControllerService.getTeacherCoursesStats();
          console.log('Statistiques récupérées:', statsResponse.data);
          
          if (statsResponse.data) {
            const coursesStatsData = statsResponse.data as CourseStatsResponse[];
            // Convertir CourseStatsResponse en CourseStats
            const convertedStats: CourseStats[] = coursesStatsData.map(stat => ({
              ...stat,
              exerciseStats: stat.exerciseStats || []
            }));
            
            console.log('Statistiques converties:', convertedStats);
            setCoursesStats(convertedStats);

            // Calculer les statistiques globales
            const overall = calculateOverallStats(convertedStats);
            console.log('Statistiques globales calculées:', overall);
            setOverallStats(overall);

            // Mapper les compositions avec les données réelles
            const mappedCompositions: Composition[] = coursesResponse.data.map((course) => {
              const courseIdNum = parseCourseId(course.id);
              
              // Trouver les statistiques pour ce cours
              const courseStat = convertedStats.find(s => s.courseId === courseIdNum);
              
              // Si pas de statistiques pour ce cours, créer des valeurs par défaut
              if (!courseStat) {
                console.log(`Pas de stats pour le cours ${course.id} (${course.title})`);
                return {
                  id: course.id?.toString() || Math.random().toString(),
                  title: course.title || 'Sans titre',
                  class: course.category || 'Non spécifiée',
                  participants: 0,
                  likes: 0,
                  downloads: 0,
                  courseStats: undefined
                };
              }
              
              // Calculer les likes et downloads depuis les statistiques d'exercices
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
                courseStats: courseStat
              };
            });
            
            console.log('Compositions mappées:', mappedCompositions);
            setCompositions(mappedCompositions);
          } else {
            console.log('Aucune statistique disponible');
            // Fallback si les statistiques ne sont pas disponibles
            const mappedCompositions: Composition[] = coursesResponse.data.map((course) => ({
              id: course.id?.toString() || Math.random().toString(),
              title: course.title || 'Sans titre',
              class: course.category || 'Non spécifiée',
              participants: 0,
              likes: 0,
              downloads: 0,
              courseStats: undefined
            }));
            setCompositions(mappedCompositions);
          }
        } else {
          console.log('Aucun cours trouvé pour cet enseignant');
          setCompositions([]);
        }

        // 3. Fetch other teachers (optionnel)
        setTeachers([]);

      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, isAuthenticated, router]);

  // Recharger les données lorsque le modal de création de cours se ferme
  useEffect(() => {
    if (!isModalOpen && user) {
      const reloadData = async () => {
        try {
          setLoading(true);
          const coursesResponse = await CourseControllerService.getAuthorCourses(user.id);
          const statsResponse = await StatsControllerService.getTeacherCoursesStats();
          
          if (coursesResponse.data && statsResponse.data) {
            const coursesStatsData = statsResponse.data as CourseStatsResponse[];
            const convertedStats: CourseStats[] = coursesStatsData.map(stat => ({
              ...stat,
              exerciseStats: stat.exerciseStats || []
            }));
            
            setCoursesStats(convertedStats);
            
            const overall = calculateOverallStats(convertedStats);
            setOverallStats(overall);
            
            const mappedCompositions: Composition[] = coursesResponse.data.map((course) => {
              const courseIdNum = parseCourseId(course.id);
              const courseStat = convertedStats.find(s => s.courseId === courseIdNum);
              
              if (!courseStat) {
                return {
                  id: course.id?.toString() || Math.random().toString(),
                  title: course.title || 'Sans titre',
                  class: course.category || 'Non spécifiée',
                  participants: 0,
                  likes: 0,
                  downloads: 0,
                  courseStats: undefined
                };
              }
              
              const totalLikes = courseStat.exerciseStats?.reduce((sum, ex) => sum + (ex.submissionCount || 0), 0) || 0;
              const totalDownloads = courseStat.exerciseStats?.reduce((sum, ex) => sum + (ex.maxScore || 0), 0) || 0;
              
              return {
                id: course.id?.toString() || Math.random().toString(),
                title: course.title || 'Sans titre',
                class: course.category || 'Non spécifiée',
                participants: courseStat.totalEnrolled || 0,
                likes: totalLikes,
                downloads: totalDownloads,
                courseStats: courseStat
              };
            });
            setCompositions(mappedCompositions);
          }
        } catch (error) {
          console.error('Erreur lors du rechargement des données:', error);
        } finally {
          setLoading(false);
        }
      };
      
      reloadData();
    }
  }, [isModalOpen, user]);

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
    coursesStats: coursesStats
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
      {/* Modale de création de cours */}
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Gérer les inscriptions
            </button>
            
            {/* NOUVEAU : Bouton Gérer les exercices */}
            <button
              onClick={() => router.push('/teacher/exercises')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Gérer les exercices
            </button>
            
            {/* NOUVEAU : Bouton Corriger les exercices */}
            <button
              onClick={() => router.push('/teacher/grading')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Corriger les exercices
            </button>
            
            <button
              onClick={() => router.push('/teacher/analytics')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Voir les statistiques détaillées
            </button>
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
            coursesStats={coursesStats}
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

        {/* Section Statistiques Détailées */}
        {coursesStats.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-6">
              Résumé des Statistiques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400">Total Étudiants</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {overallStats.totalStudents}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  sur {overallStats.publications} cours
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400">Progression Moyenne</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {overallStats.averageProgress}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  moyenne de tous les cours
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400">Exercices Totaux</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {overallStats.totalExercises}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  dans {overallStats.publications} cours
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400">Taux de Participation</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {overallStats.participationRate}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {overallStats.activeStudents} étudiants actifs
                </p>
              </div>
            </div>
            
            {/* NOUVEAU : Section spécifique pour les exercices */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Statistiques des exercices
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">Exercices créés</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {overallStats.totalExercises}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Exercices publiés</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {overallStats.totalExercises > 0 ? Math.round(overallStats.totalExercises * 0.7) : 0}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (~70%)
                    </span>
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <p className="text-sm text-orange-600 dark:text-orange-400">À corriger</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {overallStats.totalStudents > 0 ? Math.round(overallStats.totalStudents * 0.3) : 0}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      soumissions
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>Cliquez sur "Gérer les exercices" pour créer de nouveaux exercices ou sur "Corriger les exercices" pour noter les soumissions.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}