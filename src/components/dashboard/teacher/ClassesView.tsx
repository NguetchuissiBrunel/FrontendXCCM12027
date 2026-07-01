'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompositionsCard from '@/components/professor/CompositionsCard';
import CreateCourseModal from '@/components/create-course/page';
import toast from 'react-hot-toast';
import { BookOpen, X, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import DashboardSkeleton from '@/components/professor/DashboardSkeleton';
import ManageClassCoursesModal from '@/components/professor/ManageClassCoursesModal';
import AssignCourseToClassModal from '@/components/professor/AssignCourseToClassModal';
import TeacherCourseCommentsModal from '@/components/professor/TeacherCourseCommentsModal';
import { useTeacherDashboard, parseId } from '@/hooks/useTeacherDashboard';
import { CourseStat } from '@/types/professor';

interface ClassesViewProps {
  mode?: 'classes' | 'compositions';
}

export default function ClassesView({ mode = 'classes' }: ClassesViewProps) {
  const t = useTranslations('teacherDashboard');
  const {
    user,
    allClasses,
    allCourses,
    coursesStatsForProfile,
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
    handleDeleteClass,
    handleDeleteCourse,
    handleChangeClassStatus,
    handleChangeCourseStatus,
    handleCreateCourseSubmit
  } = useTeacherDashboard();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [selectedCourseIdForAssignment, setSelectedCourseIdForAssignment] = useState<number | null>(null);
  const [selectedCourseTitleForAssignment, setSelectedCourseTitleForAssignment] = useState<string | undefined>(undefined);

  // Comments modal state
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState<boolean>(false);
  const [selectedCourseIdForComments, setSelectedCourseIdForComments] = useState<number | null>(null);
  const [selectedCourseTitleForComments, setSelectedCourseTitleForComments] = useState<string | undefined>(undefined);

  const currentCompositions = mode === 'classes' ? allClasses : allCourses;

  const router = useRouter();

  const handleModalClose = () => setIsModalOpen(false);

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
      toast.error(t('classes.invalidClassId'));
    }
  };

  const handleOpenAssignModal = (courseIdString: string) => {
    const courseIdNum = parseId(courseIdString);
    if (courseIdNum > 0) {
      const course = allCourses.find(c => parseId(c.id) === courseIdNum);
      setSelectedCourseIdForAssignment(courseIdNum);
      setSelectedCourseTitleForAssignment(course?.title);
      setIsAssignModalOpen(true);
    } else {
      toast.error("ID de cours invalide");
    }
  };

  const handleOpenCommentsModal = (courseIdString: string) => {
    const courseIdNum = parseId(courseIdString);
    if (courseIdNum > 0) {
      const course = allCourses.find(c => parseId(c.id) === courseIdNum);
      setSelectedCourseIdForComments(courseIdNum);
      setSelectedCourseTitleForComments(course?.title);
      setIsCommentsModalOpen(true);
    } else {
      toast.error("ID de cours invalide");
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) return null;



  return (
    <>
      {/* Modale de création de cours */}
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={(data) => handleCreateCourseSubmit(data, mode)}
        mode={mode === 'classes' ? 'class' : 'course'}
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

      {/* Modale d'affectation d'un cours à une classe */}
      <AssignCourseToClassModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedCourseIdForAssignment(null);
          setSelectedCourseTitleForAssignment(undefined);
        }}
        courseId={selectedCourseIdForAssignment}
        courseTitle={selectedCourseTitleForAssignment}
        onUpdated={() => loadDashboardData()}
      />

      {/* Modale commentaires participants (vue enseignant) */}
      <TeacherCourseCommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => {
          setIsCommentsModalOpen(false);
          setSelectedCourseIdForComments(null);
          setSelectedCourseTitleForComments(undefined);
        }}
        courseId={selectedCourseIdForComments}
        courseTitle={selectedCourseTitleForComments}
      />

      {/* Modale de sélection de cours */}
      {isCourseSelectionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400">
                {t('classes.selectClassTitle')}
              </h3>
              <button
                onClick={() => setIsCourseSelectionModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('classes.selectClassDescription')}
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {currentCompositions.map((course) => (
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
                        {t('home.courseSelection.participants', { count: course.participants })}
                      </span>
                    </div>
                    {course.courseStats?.totalExercises !== undefined && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('home.courseSelection.exercises', { count: course.courseStats.totalExercises })}
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
                {t('classes.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête de la page Mes Classes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        <div id={mode === 'classes' ? 'classes-header' : 'compositions-header'} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 mt-4">
          <div>
            <button
              onClick={() => router.push('/profdashboard?tab=accueil')}
              className="flex items-center text-purple-600 dark:text-purple-400 font-medium mb-4 hover:translate-x-[-4px] transition-transform"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('classes.backToDashboard')}
            </button>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t('classes.manageTitle', { type: t(`classes.${mode}`) })}
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
              {mode === 'classes'
                ? t('classes.classesDescription')
                : t('classes.compositionsDescription')}
            </p>
            {mode === 'classes' && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-200 max-w-2xl">
                <p className="font-semibold mb-1">{t('classes.whatIsAClassTitle')}</p>
                <p>{t('classes.whatIsAClassDescription')}</p>
              </div>
            )}
          </div>
        </div>

        <div id={mode === 'classes' ? 'classes-list' : 'compositions-list'}>
          {currentCompositions.length > 0 ? (
            <CompositionsCard
              title={mode === 'classes' ? t('classes.myClassesTitle') : t('classes.myCompositionsTitle')}
              compositions={currentCompositions}
              onDelete={mode === 'classes' ? handleDeleteClass : handleDeleteCourse}
              onCreateClick={() => setIsModalOpen(true)}
              onManageExercises={(classId) => router.push(`/profdashboard/exercises/${classId}`)}
              onManageClassCourses={mode === 'classes' ? handleOpenManageCoursesForClass : undefined}
              onAssignToClass={mode === 'compositions' ? handleOpenAssignModal : undefined}
              onViewComments={mode === 'compositions' ? handleOpenCommentsModal : undefined}
              onChangeStatus={mode === 'classes'
                ? (id, status) => handleChangeClassStatus(id, status as any)
                : (id, status) => handleChangeCourseStatus(id, status === 'OPEN' ? 'PUBLISHED' : status === 'CLOSED' ? 'DRAFT' : 'ARCHIVED')
              }
              onEdit={(id) => {
                if (mode === 'compositions') {
                  router.push(`/editor?courseId=${id}`);
                } else {
                  toast.error(t('classes.editNotAvailable'));
                }
              }}
              getCourseStats={(id) => {
                const classId = parseId(id);
                const stats = coursesStatsForProfile.find((s: CourseStat) => s.courseId === classId);
                return stats ? {
                  totalExercises: stats.totalExercises || 0,
                  totalEnrolled: stats.totalEnrolled || 0
                } : undefined;
              }}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700 text-center">
              <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-4">
                {mode === 'classes' ? t('classes.myClassesTitle') : t('classes.myCompositionsTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {mode === 'classes'
                  ? t('classes.noClasses')
                  : t('classes.noCompositions')}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-purple-800 hover:shadow-xl transition-all duration-200 mx-auto"
              >
                <Plus size={20} />
                {mode === 'classes' ? t('classes.createClass') : t('classes.createCourse')}
              </button>
            </div>
          )}
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
            {t('home.retryLoad')}
          </button>
        </div>
      )}
    </>
  );
}