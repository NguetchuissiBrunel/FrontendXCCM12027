// src/hooks/useTeacherDashboard.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLoading } from '@/contexts/LoadingContext';
import { ClassesDeCoursService } from '@/lib/services/ClassesDeCoursService';
import { EnrollmentService } from '@/utils/enrollmentService';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { EnseignantService } from '@/lib/services/EnseignantService';
import toast from 'react-hot-toast';
import {
  DashboardCourseClass,
  DashboardExercisesStats,
  Composition,
  CourseStat
} from '@/types/professor';

// Helper function to parse ID
export function parseId(id: number | string | undefined): number {
  if (typeof id === 'number') return id;
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function useTeacherDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();
  const router = useRouter();

  const [allClasses, setAllClasses] = useState<Composition[]>([]);
  const [allCourses, setAllCourses] = useState<Composition[]>([]);
  const [coursesStatsForProfile, setCoursesStatsForProfile] = useState<CourseStat[]>([]);
  const [exercisesStats, setExercisesStats] = useState<DashboardExercisesStats>({
    totalExercises: 0,
    pendingSubmissions: 0,
    averageScore: 0
  });
  const [pendingInscriptionsCount, setPendingInscriptionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCourseSelectionModalOpen, setIsCourseSelectionModalOpen] = useState(false);
  const [isManageCoursesModalOpen, setIsManageCoursesModalOpen] = useState(false);
  const [selectedClassIdForCourses, setSelectedClassIdForCourses] = useState<number | null>(null);

  // Sync loading context
  useEffect(() => {
    const isActuallyLoading = authLoading || loading;
    if (isActuallyLoading) startLoading();
    else stopLoading();
  }, [authLoading, loading, startLoading, stopLoading]);

  const loadManualStats = useCallback(async (): Promise<CourseStat[]> => {
    try {
      const response = await EnseignantService.getAllCoursesStatistics();
      if (response.success && response.data) {
        return response.data.map((course: any) => ({
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
      }
      return [];
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      return [];
    }
  }, []);

  const calculateExercisesStats = useCallback(async (classes: DashboardCourseClass[]) => {
    try {
      let totalPending = 0;
      let totalExercisesCount = 0;

      for (const cls of classes) {
        if (!cls.courses) continue;
        for (const course of cls.courses) {
          const courseId = parseId(course.id);
          if (courseId > 0) {
            try {
              const resp = await ExercicesService.getExercisesForCourse(courseId);
              const exercises = (resp as any)?.data || [];
              totalExercisesCount += exercises.length;

              if (exercises.length > 0) {
                const firstEx = exercises[0];
                try {
                  const submissionsResp = await EnseignantService.getSubmissions(firstEx.id);
                  const submissions = (submissionsResp as any)?.data || [];
                  const pending = submissions.filter((s: any) => !s.graded).length;
                  totalPending += pending;
                } catch (err) {
                  console.error('Erreur chargement soumissions:', err);
                }
              }
            } catch (error) {
              console.error(`Erreur exercices cours ${courseId}:`, error);
            }
          }
        }
      }
      return { totalExercises: totalExercisesCount, pendingSubmissions: totalPending, averageScore: 0 };
    } catch (error) {
      console.error('Erreur calcul stats exercices:', error);
      return { totalExercises: 0, pendingSubmissions: 0, averageScore: 0 };
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setDashboardError(null);

      // 1. Fetch Classes et Courses en parallèle
      const { CourseControllerService } = await import('@/lib/services/CourseControllerService');

      const [classesResponse, coursesResponse, statsData, pendingData] = await Promise.all([
        ClassesDeCoursService.getMyClasses(),
        CourseControllerService.getAuthorCourses(user.id),
        loadManualStats(),
        EnrollmentService.getPendingEnrollments().catch(() => [])
      ]);

      setCoursesStatsForProfile(statsData);
      setPendingInscriptionsCount(pendingData.length);

      // 2. Mapper les Classes
      if (classesResponse.data) {
        const classes = classesResponse.data as DashboardCourseClass[];
        const exercisesData = await calculateExercisesStats(classes);
        setExercisesStats(exercisesData);

        const mappedClasses: Composition[] = classes.map((cls: DashboardCourseClass) => {
          let totalLikes = 0;
          let totalExercisesClass = 0;

          if (cls.courses) {
            totalLikes = cls.courses.reduce((sum, c) => sum + (c.status === 'PUBLISHED' ? 10 : 0), 0);
            cls.courses.forEach(course => {
              const courseId = parseId(course.id);
              const stat = statsData.find(s => s.courseId === courseId);
              if (stat) totalExercisesClass += stat.totalExercises || 0;
            });
          }

          return {
            id: cls.id?.toString() || Math.random().toString(),
            title: cls.name || 'Classe Sans titre',
            class: cls.theme || 'Général',
            participants: cls.participantCount ?? cls.studentCount ?? 0,
            likes: totalLikes,
            downloads: 0,
            status: cls.status || 'OPEN',
            courseStats: { totalExercises: totalExercisesClass, totalEnrolled: cls.participantCount ?? cls.studentCount ?? 0 }
          };
        });
        setAllClasses(mappedClasses);
      }

      // 3. Mapper les Courses (Compositions)
      if (coursesResponse.data) {
        const courses = coursesResponse.data;
        const mappedCourses: Composition[] = courses.map((course: any) => {
          const courseId = parseId(course.id);
          const stat = statsData.find(s => s.courseId === courseId);

          return {
            id: course.id?.toString() || Math.random().toString(),
            title: course.title || 'Cours sans titre',
            class: course.category || 'Général',
            participants: stat?.totalEnrolled || 0,
            likes: course.likeCount || 0,
            downloads: course.downloadCount || 0,
            status: course.status || 'PUBLISHED',
            courseStats: {
              totalExercises: stat?.totalExercises || 0,
              totalEnrolled: stat?.totalEnrolled || 0
            }
          };
        });
        setAllCourses(mappedCourses);
      }

    } catch (error) {
      console.error('Erreur dashboard:', error);
      setDashboardError('Impossible de charger les données du dashboard');
    } finally {
      setLoading(false);
    }
  }, [user, calculateExercisesStats, loadManualStats]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'teacher') {
      router.push('/etudashboard');
      return;
    }
    if (user) loadDashboardData();
  }, [user, authLoading, isAuthenticated, router, loadDashboardData]);

  const handleDeleteClass = async (classId: string) => {
    const classIdNum = parseId(classId);
    if (classIdNum === 0) return toast.error('ID invalide');
    try {
      startLoading();
      await ClassesDeCoursService.deleteClass(classIdNum);
      toast.success('Classe supprimée');
      await loadDashboardData();
    } catch (error: any) {
      toast.error('Erreur suppression');
    } finally {
      stopLoading();
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    const courseIdNum = parseId(courseId);
    if (courseIdNum === 0) return toast.error('ID invalide');
    try {
      startLoading();
      const { CourseControllerService } = await import('@/lib/services/CourseControllerService');
      await CourseControllerService.deleteCourse(courseIdNum);
      toast.success('Cours supprimé');
      await loadDashboardData();
    } catch (error: any) {
      toast.error('Erreur suppression');
    } finally {
      stopLoading();
    }
  };

  const handleChangeClassStatus = async (classId: string, status: 'OPEN' | 'CLOSED' | 'ARCHIVED') => {
    const classIdNum = parseId(classId);
    if (classIdNum === 0) return;
    try {
      await ClassesDeCoursService.changeStatus(classIdNum, status);
      toast.success('Statut mis à jour');
      await loadDashboardData();
    } catch (error: any) {
      toast.error('Erreur statut');
    }
  };

  const handleChangeCourseStatus = async (courseId: string, status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED') => {
    const courseIdNum = parseId(courseId);
    if (courseIdNum === 0) return;
    try {
      const { CourseControllerService } = await import('@/lib/services/CourseControllerService');
      await CourseControllerService.updateCourseStatus(courseIdNum, status);
      toast.success('Statut du cours mis à jour');
      await loadDashboardData();
    } catch (error: any) {
      toast.error('Erreur statut cours');
    }
  };

  const handleCreateCourseSubmit = async (data: any, mode: 'classes' | 'compositions') => {
    if (!user) return toast.error('Connexion requise');
    setIsModalOpen(false);
    try {
      startLoading();
      if (mode === 'classes') {
        const resp = await ClassesDeCoursService.createClass({
          name: data.title,
          theme: data.category,
          description: data.description
        });
        if (resp?.data?.id) {
          toast.success('Classe créée');
          if (data.file) await ClassesDeCoursService.uploadCoverImage(resp.data.id, data.file);
          await loadDashboardData();
        }
      } else {
        const { CourseControllerService } = await import('@/lib/services/CourseControllerService');
        const resp = await CourseControllerService.createCourse(user.id, {
          title: data.title,
          category: data.category,
          description: data.description
        });
        if (resp?.data?.id) {
          toast.success('Cours créé');
          await loadDashboardData();
        }
      }
    } catch (err) {
      toast.error('Erreur création');
    } finally {
      stopLoading();
    }
  };

  const formatPerformanceDistribution = useCallback((stats: CourseStat[]) => {
    const totalStudents = stats.reduce((sum, course) => sum + course.totalEnrolled, 0);
    const excellent = Math.round(totalStudents * 0.25);
    const good = Math.round(totalStudents * 0.35);
    const average = Math.round(totalStudents * 0.25);
    const poor = Math.round(totalStudents * 0.15);

    return [
      { range: 'Excellent', value: totalStudents > 0 ? Math.round((excellent / totalStudents) * 100) : 0, color: 'bg-purple-600 dark:bg-purple-500' },
      { range: 'Bien', value: totalStudents > 0 ? Math.round((good / totalStudents) * 100) : 0, color: 'bg-purple-400' },
      { range: 'Passable', value: totalStudents > 0 ? Math.round((average / totalStudents) * 100) : 0, color: 'bg-purple-300 dark:bg-purple-400' },
      { range: 'Faible', value: totalStudents > 0 ? Math.round((poor / totalStudents) * 100) : 0, color: 'bg-purple-200 dark:bg-purple-300' },
    ];
  }, []);

  return {
    user,
    allClasses,
    allCourses,
    compositions: allCourses, // Alias pour compatibilité ascendante
    coursesStatsForProfile,
    exercisesStats,
    pendingInscriptionsCount,
    loading: authLoading || loading,
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
    handleCreateCourseSubmit,
    formatPerformanceDistribution
  };
}
