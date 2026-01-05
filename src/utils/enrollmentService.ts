// services/enrollmentService.ts
import { Enrollment } from '@/types/enrollment';

export class EnrollmentService {
  private static readonly ENROLLMENTS_KEY = 'student_enrollments';

  /**
   * S'enrôler à un cours
   */
  static enrollStudent(courseId: number, userId: string): Enrollment {
    const enrollments = this.getEnrollments(userId);
    
    // Vérifier si déjà enrôlé
    const existing = enrollments.find(e => e.courseId === courseId);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const newEnrollment: Enrollment = {
      courseId,
      userId,
      enrolledAt: now,
      progress: 0,
      lastAccessed: now
    };

    enrollments.push(newEnrollment);
    localStorage.setItem(
      `${this.ENROLLMENTS_KEY}_${userId}`,
      JSON.stringify(enrollments)
    );

    return newEnrollment;
  }

  /**
   * Obtenir tous les enrôlements d'un étudiant
   */
  static getEnrollments(userId: string): Enrollment[] {
    try {
      const data = localStorage.getItem(`${this.ENROLLMENTS_KEY}_${userId}`);
      if (!data) return [];
      
      return JSON.parse(data) as Enrollment[];
    } catch (error) {
      console.error('Erreur lors du chargement des enrôlements:', error);
      return [];
    }
  }

  /**
   * Vérifier si un étudiant est enrôlé à un cours
   */
  static isEnrolled(courseId: number, userId: string): boolean {
    const enrollments = this.getEnrollments(userId);
    return enrollments.some(e => e.courseId === courseId);
  }

  /**
   * Obtenir l'enrôlement pour un cours spécifique
   */
  static getEnrollment(courseId: number, userId: string): Enrollment | null {
    const enrollments = this.getEnrollments(userId);
    return enrollments.find(e => e.courseId === courseId) || null;
  }

  /**
   * Mettre à jour la progression
   */
  static updateProgress(courseId: number, userId: string, progress: number): void {
    const enrollments = this.getEnrollments(userId);
    const index = enrollments.findIndex(e => e.courseId === courseId);
    
    if (index !== -1) {
      enrollments[index].progress = Math.min(100, Math.max(0, progress));
      enrollments[index].lastAccessed = new Date().toISOString();
      
      if (progress >= 100) {
        enrollments[index].completed = true;
      }
      
      localStorage.setItem(
        `${this.ENROLLMENTS_KEY}_${userId}`,
        JSON.stringify(enrollments)
      );
    }
  }

  /**
   * Se désinscrire d'un cours
   */
  static unenroll(courseId: number, userId: string): void {
    let enrollments = this.getEnrollments(userId);
    enrollments = enrollments.filter(e => e.courseId !== courseId);
    
    localStorage.setItem(
      `${this.ENROLLMENTS_KEY}_${userId}`,
      JSON.stringify(enrollments)
    );
  }

  /**
   * Obtenir la progression d'un cours
   */
  static getProgress(courseId: number, userId: string): number {
    const enrollment = this.getEnrollment(courseId, userId);
    return enrollment?.progress || 0;
  }

  /**
   * Marquer un chapitre comme terminé
   */
  static markChapterCompleted(courseId: number, userId: string, chapterIndex: number, totalChapters: number): void {
    const progressPerChapter = 100 / totalChapters;
    const currentProgress = this.getProgress(courseId, userId);
    const newProgress = Math.min(100, currentProgress + progressPerChapter);
    
    this.updateProgress(courseId, userId, newProgress);
  }
}