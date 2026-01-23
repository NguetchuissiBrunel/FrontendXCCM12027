// src/lib/services/ExerciseApiWrapper.ts - VERSION AVEC GESTION DU TYPE UNKNOWN
import { OpenAPI } from '@/lib/core/OpenAPI';
import { request as __request } from '@/lib/core/request';

// Types pour les réponses API
interface ApiResponse<T = any> {
  code?: number;
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  error?: string;
  timestamp?: string;
}

interface ExerciseApiData {
  id?: number;
  courseId?: number;
  title?: string;
  description?: string;
  maxScore?: number;
  dueDate?: string;
  content?: string;
  createdAt?: string;
}

/**
 * Wrapper API pour la gestion des exercices
 * Sépare la gestion du contenu des données de base
 */
export class ExerciseApiWrapper {
  // ============ MÉTHODES PUBLIQUES ============
  
  /**
   * Créer un exercice avec contenu
   */
  // Dans ExerciseApiWrapper.ts - méthode createExerciseWithContent
// Dans ExerciseApiWrapper.ts
// Dans ExerciseApiWrapper.ts - modifiez les signatures des méthodes
static async createExerciseWithContent(
  courseId: number,
  data: {
    title: string;
    description: string;
    maxScore: number;
    dueDate?: string | null;
    content: any;
  }
): Promise<ApiResponse<ExerciseApiData>> {
  try {
    console.log('=== API WRAPPER ===');
    
    // Préparer content comme objet
    let contentObj: any;
    if (typeof data.content === 'string') {
      try {
        contentObj = JSON.parse(data.content);
      } catch {
        contentObj = {};
      }
    } else if (typeof data.content === 'object') {
      contentObj = data.content;
    } else {
      contentObj = {};
    }
    
    const apiData = {
      title: data.title,
      description: data.description,
      maxScore: data.maxScore,
      dueDate: data.dueDate || null,
      content: contentObj
    };
    
    console.log('Données API:', JSON.stringify(apiData, null, 2));
    
    // Type assertion pour la réponse
    const response = await __request(OpenAPI, {
      method: 'POST',
      url: `/api/v1/teacher/courses/${courseId}/exercises`,
      body: apiData,
      mediaType: 'application/json',
    }) as any; // ⚠️ Assertion de type
    
    console.log('Réponse:', response);
    
    return this.parseApiResponse<ExerciseApiData>(response);
    
  } catch (error) {
    console.error('Erreur wrapper:', error);
    throw error;
  }
}

// Dans ExerciseApiWrapper.ts - AJOUTER une méthode pour bien parser les réponses
static async getSubmissionDetails(submissionId: number): Promise<any> {
  try {
    const response = await __request(OpenAPI, {
      method: 'GET',
      url: `/api/v1/submissions/${submissionId}`,
    });
    
    const parsedResponse = this.parseApiResponse<any>(response);
    
    if (parsedResponse.data && parsedResponse.data.content) {
      // Essayer de parser le content
      try {
        const content = typeof parsedResponse.data.content === 'string' 
          ? JSON.parse(parsedResponse.data.content)
          : parsedResponse.data.content;
        
        parsedResponse.data.parsedContent = content;
        
        // Extraire les réponses si elles existent dans le content
        if (content.answers && Array.isArray(content.answers)) {
          parsedResponse.data.answers = content.answers;
        }
      } catch (error) {
        console.warn('Erreur parsing submission content:', error);
      }
    }
    
    return parsedResponse.data;
    
  } catch (error) {
    console.error('Erreur récupération détails soumission:', error);
    throw this.formatError(error);
  }
}

  /**
   * Récupérer le contenu d'un exercice
   */
  static async getExerciseContent(exerciseId: number): Promise<{ content: string }> {
    try {
      const response = await __request(OpenAPI, {
        method: 'GET',
        url: `/api/v1/exercises/${exerciseId}/content`,
      });
      
      const parsedResponse = this.parseApiResponse<{ content?: string }>(response);
      
      return {
        content: parsedResponse.data?.content || '{}'
      };
      
    } catch (error) {
      // Fallback: si l'endpoint n'existe pas, retourner un objet vide
      console.warn('Endpoint content non disponible, retour fallback');
      return { content: '{}' };
    }
  }
  
  /**
   * Mettre à jour le contenu d'un exercice
   */
  static async updateExerciseContent(
    exerciseId: number,
    content: string
  ): Promise<ApiResponse> {
    try {
      const response = await __request(OpenAPI, {
        method: 'PUT',
        url: `/api/v1/teacher/exercises/${exerciseId}/content`,
        body: { content },
        mediaType: 'application/json',
      });
      
      return this.parseApiResponse(response);
      
    } catch (error) {
      console.error('Erreur mise à jour contenu:', error);
      throw this.formatError(error);
    }
  }
  
  /**
   * Récupérer un exercice complet (données + contenu)
   */
  static async getFullExercise(exerciseId: number): Promise<ExerciseApiData> {
    try {
      // 1. Récupérer les données de base
      const baseResponse = await __request(OpenAPI, {
        method: 'GET',
        url: `/api/v1/exercises/${exerciseId}`,
      });
      
      const parsedResponse = this.parseApiResponse<ExerciseApiData>(baseResponse);
      
      if (!parsedResponse.data) {
        throw new Error('Exercice non trouvé');
      }
      
      const exerciseData = parsedResponse.data;
      
      // 2. Si le contenu n'est pas inclus, le récupérer séparément
      if (!exerciseData.content) {
        try {
          const contentResponse = await this.getExerciseContent(exerciseId);
          exerciseData.content = contentResponse.content;
        } catch (error) {
          console.warn('Impossible de récupérer le contenu séparément:', error);
          exerciseData.content = '{}';
        }
      }
      
      return exerciseData;
      
    } catch (error) {
      console.error('Erreur récupération exercice complet:', error);
      throw this.formatError(error);
    }
  }
  
  /**
   * Récupérer les soumissions détaillées avec les réponses
   */
  static async getSubmissionsWithAnswers(exerciseId: number): Promise<any[]> {
    try {
      const response = await __request(OpenAPI, {
        method: 'GET',
        url: `/api/v1/teacher/exercises/${exerciseId}/submissions`,
      });
      
      const parsedResponse = this.parseApiResponse<any[]>(response);
      return parsedResponse.data || [];
      
    } catch (error) {
      console.error('Erreur récupération soumissions:', error);
      return [];
    }
  }
  
  // ============ MÉTHODES UTILITAIRES POUR LES TYPES ============
  
  /**
   * Parser une réponse API avec type checking
   */
  private static parseApiResponse<T = any>(response: unknown): ApiResponse<T> {
    // Vérifier que c'est un objet
    if (!response || typeof response !== 'object') {
      return {
        code: 500,
        success: false,
        message: 'Réponse API invalide',
        timestamp: new Date().toISOString()
      };
    }
    
    const resp = response as Record<string, any>;
    
    return {
      code: typeof resp.code === 'number' ? resp.code : undefined,
      success: typeof resp.success === 'boolean' ? resp.success : undefined,
      message: typeof resp.message === 'string' ? resp.message : undefined,
      data: resp.data as T,
      errors: typeof resp.errors === 'object' ? resp.errors : undefined,
      error: typeof resp.error === 'string' ? resp.error : undefined,
      timestamp: typeof resp.timestamp === 'string' ? resp.timestamp : new Date().toISOString()
    };
  }
  
  /**
   * Formater une erreur API
   */
  private static formatError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'object' && error !== null) {
      const err = error as Record<string, any>;
      
      if (err.message && typeof err.message === 'string') {
        return new Error(err.message);
      }
      
      if (err.error && typeof err.error === 'string') {
        return new Error(err.error);
      }
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    return new Error('Erreur API inconnue');
  }
  
  /**
   * Vérifier si un exercice existe
   */
  static async checkExerciseExists(exerciseId: number): Promise<boolean> {
    try {
      await __request(OpenAPI, {
        method: 'GET',
        url: `/api/v1/exercises/${exerciseId}/exists`,
      });
      return true;
    } catch {
      return false;
    }
  }
}