// src/lib3/services/ExerciseCreateService.ts - VERSION CORRIGÉE
import { Exercise, Question, ApiResponse } from '@/types/exercise';
import { OpenAPI } from '@/lib/core/OpenAPI';
import { request as __request } from '@/lib/core/request';

interface ApiResponseData {
  code?: number;
  success?: boolean;
  message?: string;
  data?: any;
  errors?: Record<string, string>;
  error?: string;
  timestamp?: string;
}

export class ExerciseCreateService {
  
  /**
   * Parser une réponse API avec type checking
   */
  private static parseResponse(response: any): ApiResponseData {
    if (!response || typeof response !== 'object') {
      return {
        code: 500,
        success: false,
        message: 'Réponse API invalide'
      };
    }
    
    return {
      code: response.code,
      success: response.success,
      message: response.message,
      data: response.data,
      errors: response.errors,
      error: response.error,
      timestamp: response.timestamp
    };
  }
  
  /**
   * Création SIMPLIFIÉE d'un exercice
   */
  static async createSimpleExercise(
    courseId: number,
    data: {
      title: string;
      description: string;
      maxScore: number;
      dueDate?: string | null;
      questions: Question[];
    }
  ): Promise<ApiResponse<Exercise>> {
    
    console.log('=== CRÉATION SIMPLIFIÉE ===');
    
    try {
      // Validation
      if (!data.title.trim()) {
        throw new Error('Le titre est requis');
      }
      
      if (data.questions.length === 0) {
        throw new Error('Ajoutez au moins une question');
      }
      
      // Préparer les questions
      const simpleQuestions = data.questions.map((q, index) => ({
        id: q.id || index + 1,
        text: q.text || `Question ${index + 1}`,
        type: q.type || 'TEXT',
        points: q.points || 1,
        options: q.options || [],
        correctAnswer: q.correctAnswer || null,
        explanation: q.explanation || '',
        order: index
      }));
      
      // Payload EXACT pour l'API
      const payload = {
        title: data.title.trim(),
        description: data.description || '',
        maxScore: data.maxScore,
        dueDate: data.dueDate || null,
        content: {
          version: '2.0',
          questions: simpleQuestions,
          metadata: {
            status: 'PUBLISHED',
            totalPoints: simpleQuestions.reduce((sum, q) => sum + q.points, 0),
            questionCount: simpleQuestions.length,
            createdAt: new Date().toISOString()
          }
        }
      };
      
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      // Appel API avec type assertion
      const response = await __request(OpenAPI, {
        method: 'POST',
        url: `/api/v1/teacher/courses/${courseId}/exercises`,
        body: payload,
        mediaType: 'application/json',
      }) as any; // ⚠️ Assertion de type pour unknown
      
      console.log('Réponse brute:', response);
      
      // Parser la réponse
      const parsedResponse = this.parseResponse(response);
      
      if (!parsedResponse.success) {
        throw new Error(parsedResponse.message || 'Erreur API');
      }
      
      // Créer l'exercice frontend
      const exercise: Exercise = {
        id: parsedResponse.data?.id || Date.now(),
        courseId: courseId,
        title: data.title,
        description: data.description,
        maxScore: data.maxScore,
        dueDate: data.dueDate || '',
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
        questions: data.questions,
        version: '2.0',
        submissionCount: 0,
        averageScore: 0,
        completionRate: 0,
        pendingGrading: 0,
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        message: '✅ Exercice créé avec succès',
        data: exercise,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: any) {
      console.error('Erreur création:', error);
      
      return {
        success: false,
        message: error.message || 'Erreur lors de la création',
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Test API simple
   */
  static async testApiConnection(courseId: number): Promise<ApiResponse<any>> {
    try {
      const payload = {
        title: 'Test API',
        description: 'Test',
        maxScore: 10,
        dueDate: null,
        content: {
          questions: [
            {
              id: 1,
              text: 'Test question',
              type: 'TEXT',
              points: 1
            }
          ],
          version: '1.0'
        }
      };
      
      const response = await __request(OpenAPI, {
        method: 'POST',
        url: `/api/v1/teacher/courses/${courseId}/exercises`,
        body: payload,
        mediaType: 'application/json',
      }) as any; // ⚠️ Assertion de type
      
      console.log('Test réussi:', response);
      
      return {
        success: true,
        message: '✅ Test API réussi',
        data: response,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: any) {
      console.error('Test échoué:', error);
      
      return {
        success: false,
        message: `❌ ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}