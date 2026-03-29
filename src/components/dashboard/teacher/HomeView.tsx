'use client';
import { useRouter } from 'next/navigation';
import ProfileCard, { CourseStat } from '@/components/professor/ProfileCard';
import CompositionsCard from '@/components/professor/CompositionsCard';
import CreateCourseModal from '@/components/create-course/page';
import { Plus, ChevronRight, Upload, Users as LucideUsers, Activity } from 'lucide-react';
import DashboardSkeleton from '@/components/professor/DashboardSkeleton';
import ManageClassCoursesModal from '@/components/professor/ManageClassCoursesModal';
import { useTeacherDashboard, parseId } from '@/hooks/useTeacherDashboard';
import toast from 'react-hot-toast';
import { X, BookOpen } from 'lucide-react';

export default function HomeView() {
  const {
    user,
    compositions,
    coursesStatsForProfile,
    exercisesStats,
    pendingInscriptionsCount,
    loading,
    dashboardError,
    isModalOpen,
    setIsModalOpen,
    isCourseSelectionModalOpen,
    setIsCourseSelectionModalOpen,
    isManageCoursesModalOpen,
    setIsManageCoursesModalOpen,
    selectedClassIdForCourses,
    setSelectedClassIdForCourses,
    loadDashboardData,
    handleCreateCourseSubmit,
    formatPerformanceDistribution
  } = useTeacherDashboard();

  const router = useRouter();

  const handleModalClose = () => setIsModalOpen(false);

  const openCourseSelectionModal = () => setIsCourseSelectionModalOpen(true);

  const handleCourseSelect = (classId: string) => {
    setIsCourseSelectionModalOpen(false);
    router.push(`/profdashboard/exercises/${classId}`);
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) return null;

  const displayName = (user.firstName || user.lastName)
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    : user.email.split('@')[0];

  const calculatedTotals = compositions.reduce((acc, course) => ({
    totalEnrolled: acc.totalEnrolled + (course.participants || 0),
    totalCourses: acc.totalCourses + 1,
    totalExercises: acc.totalExercises + (course.courseStats?.totalExercises || 0)
  }), { totalEnrolled: 0, totalCourses: 0, totalExercises: 0 });

  const hasStats = coursesStatsForProfile && coursesStatsForProfile.length > 0;
  
  const totalStudentsCount = hasStats 
    ? coursesStatsForProfile.reduce((sum, s) => sum + (s.totalEnrolled || 0), 0)
    : calculatedTotals.totalEnrolled;

  const totalPublicationsCount = hasStats
    ? coursesStatsForProfile.length
    : calculatedTotals.totalCourses;
    
  const totalExercisesCount = hasStats
    ? coursesStatsForProfile.reduce((sum, s) => sum + (s.totalExercises || 0), 0)
    : calculatedTotals.totalExercises;

  const activeStudentsCount = hasStats
    ? coursesStatsForProfile.reduce((sum, s) => sum + (s.activeStudents || 0), 0)
    : Math.round(totalStudentsCount * 0.6);

  const completedStudentsCount = hasStats
    ? coursesStatsForProfile.reduce((sum, s) => sum + (s.completedStudents || 0), 0)
    : Math.round(totalStudentsCount * 0.3);

  const participationRateAvg = hasStats
    ? Math.round(coursesStatsForProfile.reduce((sum, s) => sum + (s.participationRate || 0), 0) / coursesStatsForProfile.length)
    : (totalStudentsCount > 0 ? Math.round((activeStudentsCount / totalStudentsCount) * 100) : 0);

  const averageProgressVal = hasStats
    ? Math.round(coursesStatsForProfile.reduce((sum, s) => sum + (s.averageProgress || 0), 0) / coursesStatsForProfile.length)
    : (totalStudentsCount > 0 ? Math.round(totalStudentsCount * 0.7) : 0);

  const professor = {
    id: user.email,
    email: user.email,
    name: displayName,
    city: (user as any).city || 'Non spécifiée',
    university: (user as any).university || 'Non spécifiée',
    grade: (user as any).grade || 'Enseignant',
    certification: (user as any).certification || 'Enseignement',
    totalStudents: totalStudentsCount,
    activeStudents: activeStudentsCount,
    participationRate: participationRateAvg,
    publications: totalPublicationsCount,
    photoUrl: user.photoUrl || '/images/prof.jpeg',
    performanceDistribution: formatPerformanceDistribution(coursesStatsForProfile),
    averageProgress: averageProgressVal,
    totalExercises: totalExercisesCount,
    completedStudents: completedStudentsCount,
    pendingSubmissions: exercisesStats.pendingSubmissions
  };



  return (
    <>
      {/* Modale de création de cours */}
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => handleCreateCourseSubmit(data, 'compositions')}
        mode="course"
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