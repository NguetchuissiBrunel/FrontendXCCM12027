// hooks/useEnrollment.ts
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EnrollmentService } from '@/utils/enrollmentService';
import { Enrollment } from '@/types/enrollment';

export function useEnrollment(courseId?: number) {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEnrollment = async () => {
      // Si pas authentifié OU utilisateur n'est pas un étudiant
      if (!isAuthenticated || (user && !user.role?.includes('STUDENT'))) {
        setIsEnrolled(false);
        setEnrollment(null);
        setProgress(0);
        setLoading(false);
        return;
      }

      if (courseId && user) {
        setLoading(true);
        try {
          const enrollmentData = await EnrollmentService.getEnrollment(courseId);

          if (enrollmentData) {
            setIsEnrolled(true);
            setEnrollment(enrollmentData);
            setProgress(enrollmentData.progress || 0);
          } else {
            setIsEnrolled(false);
            setEnrollment(null);
            setProgress(0);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de l'enrôlement:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkEnrollment();
    }
  }, [courseId, user, authLoading, isAuthenticated]);

  const enroll = async (): Promise<Enrollment | null> => {
    // Vérifier les permissions
    if (!isAuthenticated || !user || !courseId || !user.role?.includes('STUDENT')) {
      return null;
    }

    setLoading(true);
    try {
      const newEnrollment = await EnrollmentService.enrollStudent(courseId);
      setEnrollment(newEnrollment);
      setIsEnrolled(true);
      setProgress(0);
      return newEnrollment;
    } catch (error) {
      console.error("Erreur d'enrôlement:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const unenroll = async (): Promise<void> => {
    if (!isAuthenticated || !user || !courseId || !user.role?.includes('STUDENT')) return;

    setLoading(true);
    try {
      await EnrollmentService.unenroll();
      setEnrollment(null);
      setIsEnrolled(false);
      setProgress(0);
    } catch (error) {
      console.error("Erreur de désinscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (newProgress: number): Promise<void> => {
    if (!isAuthenticated || !user || !courseId || !user.role?.includes('STUDENT') || !enrollment?.id) return;

    try {
      await EnrollmentService.updateProgress(enrollment.id, newProgress);
      setProgress(newProgress);

      // Mettre à jour l'objet enrollment local
      setEnrollment(prev => prev ? {
        ...prev,
        progress: newProgress,
        completed: newProgress >= 100
      } : null);
    } catch (error) {
      console.error("Erreur de mise à jour de la progression:", error);
    }
  };

  const markChapterCompleted = async (chapterIndex: number, totalChapters: number): Promise<void> => {
    if (!isAuthenticated || !user || !courseId || !user.role?.includes('STUDENT') || !enrollment?.id) return;

    const progressPerChapter = 100 / totalChapters;
    const newProgress = Math.min(100, progress + progressPerChapter);
    await updateProgress(newProgress);
  };

  return {
    enrollment,
    isEnrolled,
    progress,
    loading,
    enroll,
    unenroll,
    updateProgress,
    markChapterCompleted
  };
}