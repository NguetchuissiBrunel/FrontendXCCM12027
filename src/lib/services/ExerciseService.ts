// src/lib/services/ExerciseService.ts - VERSION COMPLÈTE CORRIGÉE
import { ApiResponse, Exercise, Question } from '@/types/exercise';
import { EnseignantService } from '@/lib/services/EnseignantService';
import { ExercicesService } from '@/lib/services/ExercicesService';

export class ExerciseService {
  /**
   * Convertit les questions en string JSON pour le backend
   */
  static serializeQuestionsToString(questions: Question[]): string {
    const contentObject = {
      version: '1.0',
      questions: questions.map(q => ({
        id: q.id || Date.now(),
        text: q.question,
        type: q.questionType,
        points: q.points || 0,
        options: q.options || [],
        correctAnswer: q.correctAnswer || null,
        metadata: {
          status: 'PUBLISHED' // Par défaut, publié immédiatement
        }
      })),
      metadata: {
        status: 'PUBLISHED', // Force la publication
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
        questionCount: questions.length,
        types: [...new Set(questions.map(q => q.questionType || 'TEXT'))],
        createdAt: new Date().toISOString()
      }
    };
    
    return JSON.stringify(contentObject);
  }
  
  /**
   * Parse le content (string JSON) en questions
   */
  static parseContentToQuestions(content: any): Question[] {
    try {
      let parsedContent = content;
      
      // Si content est une chaîne, le parser
      if (typeof content === 'string') {
        parsedContent = JSON.parse(content);
      }
      
      // Si content a la structure attendue
      if (parsedContent && parsedContent.questions && Array.isArray(parsedContent.questions)) {
        return parsedContent.questions.map((q: any, index: number) => ({
          id: q.id || Date.now() + index,
          exerciseId: 0,
          question: q.text || q.question || '',
          questionType: q.type || 'TEXT',
          points: q.points || 0,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          studentAnswer: q.studentAnswer,
          studentPoints: q.studentPoints
        }));
      }
      
      return [];
    } catch (e) {
      console.warn('Failed to parse exercise content:', e);
      return [];
    }
  }
  
  /**
   * Extrait le statut du content
   */
  static extractStatusFromContent(content: any): 'DRAFT' | 'PUBLISHED' | 'CLOSED' | undefined {
    try {
      let parsedContent = content;
      
      if (typeof content === 'string') {
        parsedContent = JSON.parse(content);
      }
      
      if (parsedContent && parsedContent.metadata && parsedContent.metadata.status) {
        const status = String(parsedContent.metadata.status).toUpperCase();
        if (['DRAFT', 'PUBLISHED', 'CLOSED'].includes(status)) {
          return status as 'DRAFT' | 'PUBLISHED' | 'CLOSED';
        }
      }
    } catch (e) {
      console.warn('Failed to extract status from content:', e);
    }
    
    return undefined;
  }
  
  /**
   * Crée un exercice et le publie automatiquement
   */
  static async createExercise(
    courseId: number, 
    data: {
      title: string;
      description: string;
      maxScore: number;
      dueDate?: string;
      questions?: Question[];
    }
  ): Promise<ApiResponse<Exercise>> {
    try {
      console.log('=== Création automatique avec publication ===');
      
      // Validation des données
      if (!data.title?.trim()) {
        throw new Error('Le titre est requis');
      }
      
      const questions = data.questions || [];
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      
      if (totalPoints > data.maxScore) {
        throw new Error(`Total des points (${totalPoints}) dépasse le score max (${data.maxScore})`);
      }
      
      // Préparer le content comme STRING JSON
      const contentString = questions.length > 0
        ? this.serializeQuestionsToString(questions)
        : JSON.stringify({
            version: '1.0',
            questions: [],
            metadata: {
              status: 'PUBLISHED',
              totalPoints: 0,
              questionCount: 0,
              types: [],
              createdAt: new Date().toISOString()
            }
          });
      
      // Préparer la requête pour le backend
      const requestBody = {
        title: data.title.trim(),
        description: data.description || '',
        maxScore: data.maxScore,
        dueDate: data.dueDate || undefined,
        content: contentString
      };
      
      console.log('Requête backend:', requestBody);
      
      // Appeler le backend
      const response = await fetch(`/api/v1/teacher/courses/${courseId}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur serveur: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Réponse backend:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la création');
      }
      
      // Transformer la réponse en objet Exercise
      const contentObj = typeof result.data.content === 'string'
        ? JSON.parse(result.data.content)
        : result.data.content;
      
      const exercise: Exercise = {
        id: result.data.id,
        courseId: result.data.courseId,
        title: result.data.title,
        description: result.data.description,
        maxScore: result.data.maxScore,
        dueDate: result.data.dueDate,
        createdAt: result.data.createdAt,
        content: contentObj,
        questions: this.parseContentToQuestions(contentObj),
        status: 'PUBLISHED',
        submissionsCount: 0,
        averageScore: 0,
        totalStudents: 0
      };
      
      return {
        code: 200,
        success: true,
        message: 'Exercice créé et publié avec succès',
        data: exercise,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: any) {
      console.error('Échec création exercice:', error);
      throw error;
    }
  }
  
  /**
   * Récupérer les exercices PUBLIÉS d'un cours
   */
  static async getExercisesForCourse(courseId: number): Promise<Exercise[]> {
    try {
      const response = await ExercicesService.getExercisesForCourse(courseId);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => {
          try {
            const content = typeof item.content === 'string' 
              ? JSON.parse(item.content) 
              : item.content || {};
            
            return {
              id: item.id,
              courseId: item.courseId,
              title: item.title,
              description: item.description,
              maxScore: item.maxScore,
              dueDate: item.dueDate,
              createdAt: item.createdAt,
              content: content,
              questions: this.parseContentToQuestions(content),
              status: content.metadata?.status || 'PUBLISHED'
            };
          } catch (parseError) {
            console.error('Erreur parsing content:', parseError);
            return null;
          }
        }).filter(Boolean) as Exercise[];
      }
      
      return [];
    } catch (error) {
      console.error('Erreur récupération exercices:', error);
      return [];
    }
  }
  
  /**
   * Récupérer les détails d'un exercice
   */
  static async getExerciseDetails(exerciseId: number): Promise<Exercise | null> {
    try {
      const response = await ExercicesService.getExerciseDetails(exerciseId);
      
      if (response.data) {
        const item = response.data;
        const content = typeof item.content === 'string'
          ? JSON.parse(item.content)
          : item.content || {};
        
        return {
          id: item.id || 0,
          courseId: item.courseId || 0,
          title: item.title || '',
          description: item.description || '',
          maxScore: item.maxScore || 0,
          dueDate: item.dueDate || '',
          createdAt: item.createdAt || new Date().toISOString(),
          content: content,
          questions: this.parseContentToQuestions(content),
          status: content.metadata?.status || 'PUBLISHED'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch exercise details:', error);
      return null;
    }
  }
  
  /**
   * Mettre à jour un exercice
   */
  static async updateExercise(
    exerciseId: number,
    data: {
      title?: string;
      description?: string;
      maxScore?: number;
      dueDate?: string;
      questions?: Question[];
    }
  ): Promise<ApiResponse<Exercise>> {
    try {
      // Préparer le content comme STRING JSON
      let contentString = '';
      
      if (data.questions) {
        const contentObj = {
          version: '1.0',
          questions: data.questions.map(q => ({
            id: q.id || Date.now(),
            text: q.question,
            type: q.questionType,
            points: q.points,
            options: q.options || [],
            correctAnswer: q.correctAnswer
          })),
          metadata: {
            status: 'PUBLISHED', // Toujours publié après mise à jour
            updatedAt: new Date().toISOString()
          }
        };
        contentString = JSON.stringify(contentObj);
      }
      
      // Préparer la requête
      const requestBody: Record<string, any> = {};
      if (data.title !== undefined) requestBody.title = data.title;
      if (data.description !== undefined) requestBody.description = data.description;
      if (data.maxScore !== undefined) requestBody.maxScore = data.maxScore;
      if (data.dueDate !== undefined) requestBody.dueDate = data.dueDate;
      if (contentString) requestBody.content = contentString;
      
      // Appeler le backend
      const response = await fetch(`/api/v1/teacher/exercises/${exerciseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la mise à jour');
      }
      
      const contentObj = typeof result.data.content === 'string'
        ? JSON.parse(result.data.content)
        : result.data.content;
      
      const exercise: Exercise = {
        id: result.data.id,
        courseId: result.data.courseId,
        title: result.data.title,
        description: result.data.description,
        maxScore: result.data.maxScore,
        dueDate: result.data.dueDate,
        createdAt: result.data.createdAt,
        content: contentObj,
        questions: this.parseContentToQuestions(contentObj),
        status: 'PUBLISHED'
      };
      
      return {
        code: 200,
        success: true,
        message: 'Exercice mis à jour',
        data: exercise,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: any) {
      console.error('Échec mise à jour exercice:', error);
      throw error;
    }
  }
  
  /**
   * Supprime un exercice
   */
  static async deleteExercise(exerciseId: number): Promise<boolean> {
    try {
      const response = await EnseignantService.deleteExercise(exerciseId);
      return response.success || false;
    } catch (error) {
      console.error('Exercise deletion failed:', error);
      throw error;
    }
  }
  
  /**
   * Récupérer les soumissions d'un exercice (pour enseignant)
   */
  static async getExerciseSubmissions(exerciseId: number) {
    try {
      const response = await EnseignantService.getSubmissions(exerciseId);
      return response;
    } catch (error) {
      console.error('Failed to fetch exercise submissions:', error);
      throw error;
    }
  }
  
  /**
   * Noter une soumission (pour enseignant)
   */
  static async gradeSubmission(
    submissionId: number,
    gradeData: {
      score: number;
      feedback?: string;
      answers?: Array<{
        questionId: number;
        points: number;
        feedback?: string;
      }>;
    }
  ) {
    try {
      const response = await EnseignantService.gradeSubmission(
        submissionId,
        gradeData
      );
      return response;
    } catch (error) {
      console.error('Failed to grade submission:', error);
      throw error;
    }
  }
  
  /**
   * Soumettre un exercice (pour étudiant)
   */
  static async submitExercise(
    exerciseId: number,
    submissionData: {
      submissionUrl?: string;
      answers?: Array<{
        questionId: number;
        answer: string;
      }>;
    }
  ) {
    try {
      // Préparer le content comme STRING JSON
      const contentObj = {
        version: '1.0',
        answers: submissionData.answers?.map(a => ({
          questionId: a.questionId,
          answer: a.answer,
          submittedAt: new Date().toISOString()
        })) || [],
        metadata: {
          submittedAt: new Date().toISOString()
        }
      };
      
      const contentString = JSON.stringify(contentObj);
      
      const requestBody = {
        submissionUrl: submissionData.submissionUrl,
        content: contentString
      };
      
      const response = await ExercicesService.submitExercise(
        exerciseId,
        requestBody as any
      );
      
      return response;
    } catch (error) {
      console.error('Failed to submit exercise:', error);
      throw error;
    }
  }
  
  /**
   * Récupérer les soumissions d'un étudiant
   */
  static async getMySubmissions() {
    try {
      const response = await ExercicesService.getMySubmissions();
      return response;
    } catch (error) {
      console.error('Failed to fetch student submissions:', error);
      throw error;
    }
  }
  
  /**
   * Vérifier si l'utilisateur peut soumettre un exercice
   */
  static async canSubmitExercise(exerciseId: number): Promise<boolean> {
    try {
      const exercise = await this.getExerciseDetails(exerciseId);
      if (!exercise) return false;
      
      // Vérifier la date d'échéance
      if (exercise.dueDate) {
        const dueDate = new Date(exercise.dueDate);
        const now = new Date();
        if (now > dueDate) return false;
      }
      
      // Vérifier si l'exercice est publié
      if (exercise.status !== 'PUBLISHED') return false;
      
      return true;
    } catch (error) {
      console.error('Failed to check exercise submission permission:', error);
      return false;
    }
  }
  
  /**
   * Nettoyer les exercices temporaires (si jamais utilisés)
   */
  static cleanupTempExercises(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('temp_exercises');
      console.log('Exercices temporaires nettoyés');
    }
  }
}