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
    // Si pas authentifié OU utilisateur n'est pas un étudiant
    if (!isAuthenticated || (user && user.role !== 'student')) {
      setIsEnrolled(false);
      setEnrollment(null);
      setProgress(0);
      setLoading(false);
      return;
    }

    if (courseId && user && user.role === 'student') {
      const enrolled = EnrollmentService.isEnrolled(courseId, user.id);
      const enrollmentData = EnrollmentService.getEnrollment(courseId, user.id);
      
      setIsEnrolled(enrolled);
      setEnrollment(enrollmentData);
      setProgress(enrollmentData?.progress || 0);
    }
    
    setLoading(false);
  }, [courseId, user, authLoading, isAuthenticated]);

  const enroll = (): Enrollment | null => {
    // Vérifier les permissions
    if (!isAuthenticated || !user || !courseId || user.role !== 'student') {
      console.log('⚠️ Enrollement non autorisé: ', {
        isAuthenticated,
        userRole: user?.role,
        hasCourseId: !!courseId
      });
      return null;
    }
    
    const newEnrollment = EnrollmentService.enrollStudent(courseId, user.id);
    setEnrollment(newEnrollment);
    setIsEnrolled(true);
    setProgress(0);
    
    return newEnrollment;
  };

  const unenroll = (): void => {
    if (!isAuthenticated || !user || !courseId || user.role !== 'student') return;
    
    EnrollmentService.unenroll(courseId, user.id);
    setEnrollment(null);
    setIsEnrolled(false);
    setProgress(0);
  };

  const updateProgress = (newProgress: number): void => {
    if (!isAuthenticated || !user || !courseId || user.role !== 'student') return;
    
    EnrollmentService.updateProgress(courseId, user.id, newProgress);
    setProgress(newProgress);
    
    // Mettre à jour l'objet enrollment local
    setEnrollment(prev => prev ? {
      ...prev,
      progress: newProgress,
      lastAccessed: new Date().toISOString(),
      completed: newProgress >= 100
    } : null);
  };

  const markChapterCompleted = (chapterIndex: number, totalChapters: number): void => {
    if (!isAuthenticated || !user || !courseId || user.role !== 'student') return;
    
    EnrollmentService.markChapterCompleted(courseId, user.id, chapterIndex, totalChapters);
    const newProgress = EnrollmentService.getProgress(courseId, user.id);
    setProgress(newProgress);
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