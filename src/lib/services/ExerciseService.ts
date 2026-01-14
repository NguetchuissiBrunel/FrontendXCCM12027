// src/services/ExerciseService.ts
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import { Exercise, Submission, GradeSubmissionRequest} from '../../types/exercise'; // Chemin relatif
export class ExerciseService {
  /**
   * Récupérer tous les exercices d'un cours
   */
  static async getCourseExercises(courseId: number): Promise<Exercise[]> {
    const response = await __request(OpenAPI, {
      method: 'GET',
      url: `/teacher/courses/${courseId}/exercises`,
    });
    return (response as any).data || response;
  }

  /**
   * Récupérer un exercice par ID
   */
  static async getExerciseById(exerciseId: number): Promise<Exercise> {
    const response = await __request(OpenAPI, {
      method: 'GET',
      url: `/teacher/exercises/${exerciseId}`,
    });
    return (response as any).data || response;
  }

  /**
   * Créer un exercice
   */
  static async createExercise(courseId: number, exercise: Partial<Exercise>): Promise<Exercise> {
    const response = await __request(OpenAPI, {
      method: 'POST',
      url: `/teacher/courses/${courseId}/exercises`,
      body: exercise,
    });
    return (response as any).data || response;
  }

  /**
   * Mettre à jour un exercice
   */
  static async updateExercise(exerciseId: number, exercise: Partial<Exercise>): Promise<Exercise> {
    const response = await __request(OpenAPI, {
      method: 'PUT',
      url: `/teacher/exercises/${exerciseId}`,
      body: exercise,
    });
    return (response as any).data || response;
  }

  /**
   * Supprimer un exercice
   */
  static async deleteExercise(exerciseId: number): Promise<void> {
    await __request(OpenAPI, {
      method: 'DELETE',
      url: `/teacher/exercises/${exerciseId}`,
    });
  }

  /**
   * Récupérer les soumissions d'un exercice
   */
  static async getExerciseSubmissions(exerciseId: number): Promise<Submission[]> {
    const response = await __request(OpenAPI, {
      method: 'GET',
      url: `/teacher/exercises/${exerciseId}/submissions`,
    });
    return (response as any).data || response;
  }

  /**
   * Récupérer une soumission par ID
   */
  static async getSubmissionById(submissionId: number): Promise<Submission> {
    const response = await __request(OpenAPI, {
      method: 'GET',
      url: `/teacher/submissions/${submissionId}`,
    });
    return (response as any).data || response;
  }

  /**
   * Noter une soumission
   */
  static async gradeSubmission(
    submissionId: number, 
    gradeData: GradeSubmissionRequest
  ): Promise<Submission> {
    const response = await __request(OpenAPI, {
      method: 'PUT',
      url: `/teacher/submissions/${submissionId}/grade`,
      body: gradeData,
    });
    return (response as any).data || response;
  }

  /**
   * Soumettre une réponse (étudiant)
   */
  static async submitExercise(
    exerciseId: number, 
    answers: Array<{ questionId: number; answer: string }>
  ): Promise<Submission> {
    const response = await __request(OpenAPI, {
      method: 'POST',
      url: `/exercises/${exerciseId}/submit`,
      body: { answers },
    });
    return (response as any).data || response;
  }
}