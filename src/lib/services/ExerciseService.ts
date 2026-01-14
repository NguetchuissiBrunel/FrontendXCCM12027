// src/services/ExerciseService.ts - Version mise à jour
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import { 
  Exercise,
  Submission,
  GradeSubmissionRequest,
  SubmitExerciseRequest,
  CreateExerciseRequest,
  UpdateExerciseRequest,
  ExerciseFilter,
  SubmissionFilter
} from '../../types/exercise';

export class ExerciseService {
  // ============ COTÉ ENSEIGNANT ============

  /**
   * Récupérer tous les exercices d'un cours (enseignant)
   */
  static async getTeacherCourseExercises(courseId: number): Promise<Exercise[]> {
    const response = await __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/teacher/courses/${courseId}/exercises`,
    });
    return (response as any)?.data?.data || [];
  }

  /**
   * Récupérer un exercice par ID (enseignant)
   */
  static async getTeacherExerciseById(exerciseId: number): Promise<Exercise> {
    const response = await __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/teacher/exercises/${exerciseId}`,
    });
    return (response as any)?.data?.data;
  }

  /**
   * Créer un exercice (enseignant)
   */
  static async createExercise(courseId: number, exerciseData: CreateExerciseRequest): Promise<Exercise> {
    const response = await __request(OpenAPI, {
      method: 'POST',
      url: `/api/v1/teacher/courses/${courseId}/exercises`,
      body: exerciseData,
    });
    return (response as any)?.data?.data;
  }

  /**
   * Mettre à jour un exercice (enseignant)
   */
  static async updateExercise(exerciseId: number, exerciseData: UpdateExerciseRequest): Promise<Exercise> {
    const response = await __request(OpenAPI, {
      method: 'PUT',
      url: `/api/v1/teacher/exercises/${exerciseId}`,
      body: exerciseData,
    });
    return (response as any)?.data?.data;
  }

  /**
   * Supprimer un exercice (enseignant)
   */
  static async deleteExercise(exerciseId: number): Promise<void> {
    await __request(OpenAPI, {
      method: 'DELETE',
      url: `/api/v1/teacher/exercises/${exerciseId}`,
    });
  }

  /**
   * Récupérer les soumissions d'un exercice (enseignant)
   */
  static async getExerciseSubmissions(exerciseId: number, filter?: SubmissionFilter): Promise<Submission[]> {
    const params = new URLSearchParams();
    if (filter?.status) params.append('status', filter.status);
    if (filter?.studentName) params.append('studentName', filter.studentName);
    
    const response = await __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/teacher/exercises/${exerciseId}/submissions${params.toString() ? `?${params.toString()}` : ''}`,
    });
    return (response as any)?.data?.data || [];
  }

  /**
   * Noter une soumission (enseignant)
   */
  static async gradeSubmission(
    submissionId: number, 
    gradeData: GradeSubmissionRequest
  ): Promise<Submission> {
    const response = await __request(OpenAPI, {
      method: 'PUT',
      url: `/api/v1/teacher/submissions/${submissionId}/grade`,
      body: gradeData,
    });
    return (response as any)?.data?.data;
  }

  // ============ COTÉ ÉTUDIANT ============

  /**
   * Récupérer tous les exercices d'un cours (étudiant)
   */
  static async getCourseExercises(courseId: number): Promise<Exercise[]> {
    const response = await __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/exercises/course/${courseId}`,
    });
    return (response as any)?.data?.data || [];
  }

  /**
   * Récupérer un exercice par ID (étudiant)
   */
  static async getExerciseById(exerciseId: number): Promise<Exercise> {
    const response = await __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/exercises/${exerciseId}`,
    });
    return (response as any)?.data?.data;
  }

  /**
   * Soumettre une réponse (étudiant)
   */
  static async submitExercise(
    exerciseId: number, 
    submitData: SubmitExerciseRequest
  ): Promise<Submission> {
    const response = await __request(OpenAPI, {
      method: 'POST',
      url: `/api/v1/exercises/${exerciseId}/submit`,
      body: submitData,
    });
    return (response as any)?.data?.data;
  }

  /**
   * Récupérer mes soumissions (étudiant)
   */
  static async getMySubmissions(): Promise<Submission[]> {
    const response = await __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/exercises/my-submissions`,
    });
    return (response as any)?.data?.data || [];
  }

  /**
   * Récupérer une soumission spécifique
   */
  static async getSubmissionById(submissionId: number): Promise<Submission> {
    const response = await __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/submissions/${submissionId}`,
    });
    return (response as any)?.data?.data;
  }

  // ============ MÉTHODES UTILITAIRES ============

  /**
   * Filtrer les exercices
   */
  static async filterExercises(filter: ExerciseFilter): Promise<Exercise[]> {
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    if (filter.courseId) params.append('courseId', filter.courseId.toString());
    if (filter.dueDateFrom) params.append('dueDateFrom', filter.dueDateFrom);
    if (filter.dueDateTo) params.append('dueDateTo', filter.dueDateTo);
    if (filter.search) params.append('search', filter.search);

    const response = await __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/exercises${params.toString() ? `?${params.toString()}` : ''}`,
    });
    return (response as any)?.data?.data || [];
  }

  /**
   * Publier un exercice (changer le statut de DRAFT à PUBLISHED)
   */
  static async publishExercise(exerciseId: number): Promise<Exercise> {
    return this.updateExercise(exerciseId, { status: 'PUBLISHED' });
  }

  /**
   * Fermer un exercice (changer le statut à CLOSED)
   */
  static async closeExercise(exerciseId: number): Promise<Exercise> {
    return this.updateExercise(exerciseId, { status: 'CLOSED' });
  }

  /**
   * Dupliquer un exercice
   */
  static async duplicateExercise(exerciseId: number, newCourseId?: number): Promise<Exercise> {
    const exercise = await this.getTeacherExerciseById(exerciseId);
    const duplicateData: CreateExerciseRequest = {
      courseId: newCourseId || exercise.courseId,
      title: `${exercise.title} (Copie)`,
      description: exercise.description,
      maxScore: exercise.maxScore,
      dueDate: exercise.dueDate,
      questions: exercise.questions?.map(q => ({
        question: q.question,
        questionType: q.questionType,
        points: q.points,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    };
    return this.createExercise(duplicateData.courseId, duplicateData);
  }
}