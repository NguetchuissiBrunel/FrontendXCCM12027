// services/enrollmentService.ts
import { Enrollment } from '@/types/enrollment';
import { EnrollmentControllerService } from '@/lib/services/EnrollmentControllerService';

export class EnrollmentService {

  /**
   * S'enrôler à un cours
   */
  static async enrollStudent(courseId: number): Promise<Enrollment> {
    const response = await EnrollmentControllerService.enrollInCourse(courseId);
    if (!response.success || !response.data) {
      throw new Error(response.message || "Erreur lors de l'inscription");
    }

    // Map API DTO to local Enrollment type if necessary
    // Assuming API and local types are compatible enough for now
    return response.data as unknown as Enrollment;
  }

  /**
   * Obtenir tous les enrôlements de l'utilisateur connecté
   */
  static async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await EnrollmentControllerService.getMyEnrollments();
    if (!response.success || !response.data) {
      return [];
    }
    return response.data as unknown as Enrollment[];
  }

  /**
   * Vérifier si un étudiant est enrôlé à un cours
   */
  static async isEnrolled(courseId: number): Promise<boolean> {
    const enrollment = await this.getEnrollment(courseId);
    return !!enrollment;
  }

  /**
   * Obtenir l'enrôlement pour un cours spécifique
   */
  static async getEnrollment(courseId: number): Promise<Enrollment | null> {
    try {
      const response = await EnrollmentControllerService.getEnrollmentForCourse(courseId);
      if (response.success && response.data) {
        return response.data as unknown as Enrollment;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Mettre à jour la progression
   */
  static async updateProgress(enrollmentId: number, progress: number): Promise<void> {
    await EnrollmentControllerService.updateProgress(enrollmentId, progress);
  }

  /**
   * Valider ou rejeter un enrôlement
   */
  static async validateEnrollment(enrollmentId: number, status: 'APPROVED' | 'REJECTED'): Promise<void> {
    await EnrollmentControllerService.validateEnrollment(enrollmentId, status);
  }

  /**
   * Obtenir les enrôlements en attente
   */
  static async getPendingEnrollments(): Promise<Enrollment[]> {
    const response = await EnrollmentControllerService.getPendingEnrollments();
    if (!response.success || !response.data) {
      return [];
    }
    return response.data as unknown as Enrollment[];
  }

  /**
   * Se désinscrire d'un cours (Non implémenté dans l'API backend actuelle)
   */
  static async unenroll(): Promise<void> {
    // throw new Error("Fonctionnalité non supportée par le backend");
    console.warn("Unenrollment not supported by backend yet");
  }

  /**
   * Obtenir la progression d'un cours
   */
  static async getProgress(courseId: number): Promise<number> {
    const enrollment = await this.getEnrollment(courseId);
    return enrollment?.progress || 0;
  }

  /**
   * Marquer un chapitre comme terminé
   */
  static async markChapterCompleted(): Promise<void> {
    // This logic might be better handled by backend.
    // The hook will likely handle the calculation.
  }
}