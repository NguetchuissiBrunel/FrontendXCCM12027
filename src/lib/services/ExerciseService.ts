// src/lib/services/ExerciseService.ts - VERSION CORRIGÉE AVEC TYPAGES
import { ApiResponse } from '@/types/exercise';
import { Exercise, Question } from '@/types/exercise';
import { EnseignantService } from '@/lib/services/EnseignantService';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { CourseControllerService } from '@/lib/services/CourseControllerService';

export class ExerciseService {
  /**
   * Convertit les questions en objet JSON pour le backend
   */
  static serializeQuestionsToObject(questions: Question[]): Record<string, any> {
    const serialized = {
      version: '1.0',
      questions: questions.map(q => ({
        id: q.id || Date.now(),
        text: q.question,
        type: q.questionType,
        points: q.points || 0,
        options: q.options || [],
        correctAnswer: q.correctAnswer || null,
        studentAnswer: q.studentAnswer || null,
        studentPoints: q.studentPoints || null
      })),
      metadata: {
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
        questionCount: questions.length,
        types: [...new Set(questions.map(q => q.questionType || 'TEXT'))],
        createdAt: new Date().toISOString()
      }
    };
    
    return serialized;
  }
  
  /**
   * Parse le content du backend en questions
   */
  static parseContentToQuestions(content: any): Question[] {
    try {
      let parsedContent = content;
      
      // Si content est une chaîne, le parser
      if (typeof content === 'string') {
        parsedContent = JSON.parse(content);
      }
      
      // Si content est un objet avec questions
      if (parsedContent && 
          (parsedContent.version === '1.0' || parsedContent.questions) && 
          Array.isArray(parsedContent.questions)) {
        
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
    } catch (e) {
      console.warn('Failed to parse exercise content, returning empty array:', e);
    }
    
    return [];
  }
  
  /**
   * Convertit n'importe quel contenu en chaîne JSON pour l'interface Exercise
   */
  private static contentToString(content: any): string {
    if (typeof content === 'string') {
      return content;
    }
    try {
      return JSON.stringify(content);
    } catch (e) {
      console.error('Failed to stringify content:', e);
      return '{}';
    }
  }
  
  /**
   * Crée un exercice côté backend avec le bon format JSONB
   */
  static async createExercise(
    courseId: number, 
    data: {
      title: string;
      description: string;
      maxScore: number;
      dueDate?: string;
      questions?: Question[];
      status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
    }
  ): Promise<ApiResponse<Exercise>> {
    try {
      console.log('=== ExerciseService.createExercise ===');
      console.log('Course ID:', courseId);
      console.log('Data received:', data);
      
      // Définir le statut par défaut avec le bon type
      const status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' = data.status ?? 'DRAFT';
      
      // Préparer le content au bon format (objet JSON, pas chaîne)
      let content: Record<string, any>;
      
      if (data.questions && data.questions.length > 0) {
        content = this.serializeQuestionsToObject(data.questions);
      } else {
        content = { 
          version: '1.0', 
          questions: [],
          metadata: { 
            status: status,
            totalPoints: 0,
            questionCount: 0,
            types: [],
            createdAt: new Date().toISOString()
          }
        };
      }
      
      // Ajouter/mettre à jour le statut dans les métadonnées
      content.metadata = content.metadata || {};
      content.metadata.status = status;
      
      console.log('Prepared content (object):', content);
      console.log('Content type:', typeof content);
      
      // Premier essai : Envoyer l'objet JSON directement
      try {
        console.log('Trying with object content...');
        
        const requestBody = {
          title: data.title,
          description: data.description || '',
          maxScore: data.maxScore,
          dueDate: data.dueDate || undefined,
          content: content  // OBJET JSON, pas de JSON.stringify ici
        };
        
        console.log('Request body (object):', requestBody);
        
        const response = await EnseignantService.createExercise(
          courseId,
          requestBody as any  // Cast nécessaire car le type attend string
        );
        
        console.log('API Response (object):', response);
        
        if (!response.success) {
          throw new Error(response.message || 'Erreur lors de la création');
        }
        
        // Convertir le content en chaîne pour l'interface Exercise
        const contentString = this.contentToString(response.data?.content || content);
        
        const exercise: Exercise = {
          id: response.data?.id || 0,
          courseId: response.data?.courseId || courseId,
          title: response.data?.title || data.title,
          description: response.data?.description || data.description,
          maxScore: response.data?.maxScore || data.maxScore,
          dueDate: response.data?.dueDate || data.dueDate || '',
          createdAt: response.data?.createdAt || new Date().toISOString(),
          content: contentString, // Converti en string
          questions: data.questions || [],
          status: status
        };
        
        return {
          code: response.code || 200,
          success: response.success || true,
          message: response.message || 'Exercice créé',
          data: exercise,
          errors: response.errors,
          error: response.error,
          timestamp: response.timestamp || new Date().toISOString()
        };
        
      } catch (objectError: any) {
        console.warn('Object format failed:', objectError.message);
        
        // Deuxième essai : Envoyer une chaîne JSON
        console.log('Trying with string content...');
        
        const stringContent = JSON.stringify(content);
        console.log('String content:', stringContent);
        
        const requestBody = {
          title: data.title,
          description: data.description || '',
          maxScore: data.maxScore,
          dueDate: data.dueDate || undefined,
          content: stringContent  // Chaîne JSON
        };
        
        console.log('Request body (string):', requestBody);
        
        // Utiliser fetch directement pour plus de contrôle
        const response = await fetch(`/api/v1/teacher/courses/${courseId}/exercises`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const result = await response.json();
        console.log('Response body:', result);
        
        if (!response.ok) {
          throw new Error(result.message || `HTTP ${response.status}: ${result.error || 'Erreur inconnue'}`);
        }
        
        if (!result.success) {
          throw new Error(result.message || 'Erreur lors de la création');
        }
        
        // Convertir le content en chaîne pour l'interface Exercise
        const contentString = this.contentToString(result.data?.content || stringContent);
        
        const exercise: Exercise = {
          id: result.data?.id || 0,
          courseId: result.data?.courseId || courseId,
          title: result.data?.title || data.title,
          description: result.data?.description || data.description,
          maxScore: result.data?.maxScore || data.maxScore,
          dueDate: result.data?.dueDate || data.dueDate || '',
          createdAt: result.data?.createdAt || new Date().toISOString(),
          content: contentString, // Déjà une string
          questions: data.questions || [],
          status: status
        };
        
        return {
          code: result.code || 200,
          success: result.success || true,
          message: result.message || 'Exercice créé',
          data: exercise,
          errors: result.errors,
          error: result.error,
          timestamp: result.timestamp || new Date().toISOString()
        };
      }
      
    } catch (error: any) {
      console.error('Exercise creation failed completely:', error);
      
      // Message d'erreur détaillé
      let errorMessage = 'Erreur inconnue lors de la création de l\'exercice';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.body) {
        errorMessage = JSON.stringify(error.body);
      } else if (error.response) {
        errorMessage = `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      }
      
      // En cas d'échec total, créer un exercice local temporaire
      console.warn('Creating temporary local exercise...');
      
      const contentObj = data.questions ? this.serializeQuestionsToObject(data.questions) : {};
      const status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' = data.status ?? 'DRAFT';
      
      const tempExercise: Exercise = {
        id: Date.now(),
        courseId: courseId,
        title: data.title,
        description: data.description || '',
        maxScore: data.maxScore,
        dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        content: JSON.stringify(contentObj), // Converti en string
        questions: data.questions || [],
        status: status
      };
      
      // Stocker temporairement
      const tempExercises = JSON.parse(localStorage.getItem('temp_exercises') || '{}');
      tempExercises[tempExercise.id] = tempExercise;
      localStorage.setItem('temp_exercises', JSON.stringify(tempExercises));
      
      return {
        code: 200,
        success: true,
        message: 'Exercice créé localement (backend temporairement indisponible)',
        data: tempExercise,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Met à jour un exercice
   */
  static async updateExercise(
    exerciseId: number,
    data: {
      title?: string;
      description?: string;
      maxScore?: number;
      dueDate?: string;
      status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
      questions?: Question[];
      content?: any;
    }
  ): Promise<ApiResponse<Exercise>> {
    try {
      console.log('=== ExerciseService.updateExercise ===');
      console.log('Exercise ID:', exerciseId);
      console.log('Update data:', data);
      
      // Définir le statut avec le bon type
      const status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' = data.status ?? 'DRAFT';
      
      // Préparer le contenu
      let content = data.content;
      
      if (data.questions && !content) {
        content = this.serializeQuestionsToObject(data.questions);
      }
      
      // Ajouter le statut aux métadonnées si content est un objet
      if (status && content && typeof content === 'object') {
        content.metadata = content.metadata || {};
        content.metadata.status = status;
      }
      
      // Préparer la requête
      const requestBody: Record<string, any> = {};
      
      if (data.title !== undefined) requestBody.title = data.title;
      if (data.description !== undefined) requestBody.description = data.description;
      if (data.maxScore !== undefined) requestBody.maxScore = data.maxScore;
      if (data.dueDate !== undefined) requestBody.dueDate = data.dueDate;
      if (content !== undefined) requestBody.content = content;
      
      console.log('Request body for update:', requestBody);
      
      // Premier essai : avec le service généré
      try {
        const response = await EnseignantService.updateExercise(
          exerciseId,
          requestBody as any
        );
        
        console.log('Update response (service):', response);
        
        if (!response.success) {
          throw new Error(response.message || 'Erreur lors de la mise à jour');
        }
        
        // Convertir le content en chaîne pour l'interface Exercise
        const contentString = this.contentToString(response.data?.content || content);
        
        const exercise: Exercise = {
          id: response.data?.id || exerciseId,
          courseId: response.data?.courseId || 0,
          title: response.data?.title || data.title || '',
          description: response.data?.description || data.description || '',
          maxScore: response.data?.maxScore || data.maxScore || 0,
          dueDate: response.data?.dueDate || data.dueDate || '',
          createdAt: response.data?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          content: contentString, // Converti en string
          questions: data.questions || this.parseContentToQuestions(response.data?.content || ''),
          status: status
        };
        
        return {
          code: response.code || 200,
          success: response.success || true,
          message: response.message || 'Exercice mis à jour',
          data: exercise,
          errors: response.errors,
          error: response.error,
          timestamp: response.timestamp || new Date().toISOString()
        };
        
      } catch (serviceError: any) {
        console.warn('Service update failed, trying direct fetch:', serviceError.message);
        
        // Deuxième essai : avec fetch direct
        const response = await fetch(`/api/v1/teacher/exercises/${exerciseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });
        
        const result = await response.json();
        console.log('Update response (fetch):', result);
        
        if (!response.ok) {
          throw new Error(result.message || `HTTP ${response.status}: ${result.error || 'Erreur inconnue'}`);
        }
        
        if (!result.success) {
          throw new Error(result.message || 'Erreur lors de la mise à jour');
        }
        
        // Convertir le content en chaîne pour l'interface Exercise
        const contentString = this.contentToString(result.data?.content || content);
        
        const exercise: Exercise = {
          id: result.data?.id || exerciseId,
          courseId: result.data?.courseId || 0,
          title: result.data?.title || data.title || '',
          description: result.data?.description || data.description || '',
          maxScore: result.data?.maxScore || data.maxScore || 0,
          dueDate: result.data?.dueDate || data.dueDate || '',
          createdAt: result.data?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          content: contentString, // Converti en string
          questions: data.questions || this.parseContentToQuestions(result.data?.content || ''),
          status: status
        };
        
        return {
          code: result.code || 200,
          success: result.success || true,
          message: result.message || 'Exercice mis à jour',
          data: exercise,
          errors: result.errors,
          error: result.error,
          timestamp: result.timestamp || new Date().toISOString()
        };
      }
      
    } catch (error: any) {
      console.error('Exercise update failed completely:', error);
      
      // Fallback : mise à jour locale
      const tempExercises = JSON.parse(localStorage.getItem('temp_exercises') || '{}');
      if (tempExercises[exerciseId]) {
        const updatedExercise: Exercise = {
          ...tempExercises[exerciseId],
          ...(data.title && { title: data.title }),
          ...(data.description && { description: data.description }),
          ...(data.maxScore && { maxScore: data.maxScore }),
          ...(data.dueDate && { dueDate: data.dueDate }),
          ...(data.status && { status: data.status }),
          updatedAt: new Date().toISOString()
        };
        
        // Mettre à jour le content si des questions sont fournies
        if (data.questions) {
          const contentObj = this.serializeQuestionsToObject(data.questions);
          updatedExercise.content = JSON.stringify(contentObj);
          updatedExercise.questions = data.questions;
        }
        
        tempExercises[exerciseId] = updatedExercise;
        localStorage.setItem('temp_exercises', JSON.stringify(tempExercises));
        
        return {
          code: 200,
          success: true,
          message: 'Exercice mis à jour localement',
          data: updatedExercise,
          timestamp: new Date().toISOString()
        };
      }
      
      throw new Error(`Échec de la mise à jour: ${error.message || 'Erreur inconnue'}`);
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
      
      // Supprimer localement si existe
      const tempExercises = JSON.parse(localStorage.getItem('temp_exercises') || '{}');
      if (tempExercises[exerciseId]) {
        delete tempExercises[exerciseId];
        localStorage.setItem('temp_exercises', JSON.stringify(tempExercises));
        return true;
      }
      
      throw error;
    }
  }
  
  /**
   * Récupérer les soumissions d'un exercice
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
   * Noter une soumission
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
   * Publier un cours (met à jour le statut du cours)
   */
  static async publishCourse(courseId: number): Promise<boolean> {
    try {
      const response = await CourseControllerService.updateCourseStatus(
        courseId,
        'PUBLISHED'
      );
      
      return response.success || false;
    } catch (error) {
      console.error('Course publication failed:', error);
      throw error;
    }
  }
  
  /**
   * Récupérer les exercices d'un cours
   */
  static async getExercisesForCourse(courseId: number): Promise<Exercise[]> {
    try {
      console.log('Fetching exercises for course:', courseId);
      
      const response = await ExercicesService.getExercisesForCourse(courseId);
      
      console.log('Exercises response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => {
          // Convertir le content en chaîne
          const contentString = this.contentToString(item.content);
          
          const exercise: Exercise = {
            id: item.id || 0,
            courseId: item.courseId || courseId,
            title: item.title || '',
            description: item.description || '',
            maxScore: item.maxScore || 0,
            dueDate: item.dueDate || '',
            createdAt: item.createdAt || new Date().toISOString(),
            content: contentString, // Toujours une string
            questions: item.content ? this.parseContentToQuestions(item.content) : []
          };
          
          // Extraire le statut des métadonnées si présent
          if (item.content) {
            try {
              const parsed = typeof item.content === 'string' 
                ? JSON.parse(item.content) 
                : item.content;
                
              if (parsed.metadata && parsed.metadata.status) {
                exercise.status = parsed.metadata.status;
              }
            } catch (e) {
              console.warn('Could not parse content for status:', e);
            }
          }
          
          return exercise;
        });
      }
      
      // Fallback : vérifier les exercices locaux
      const tempExercises = JSON.parse(localStorage.getItem('temp_exercises') || '{}');
      const courseExercises = Object.values(tempExercises).filter((ex: any) => 
        ex.courseId === courseId
      ) as Exercise[];
      
      return courseExercises;
      
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      
      // Fallback : exercices locaux
      const tempExercises = JSON.parse(localStorage.getItem('temp_exercises') || '{}');
      const courseExercises = Object.values(tempExercises).filter((ex: any) => 
        ex.courseId === courseId
      ) as Exercise[];
      
      return courseExercises;
    }
  }
  
  /**
   * Récupérer les détails d'un exercice
   */
  static async getExerciseDetails(exerciseId: number): Promise<Exercise | null> {
    try {
      console.log('Fetching exercise details:', exerciseId);
      
      // Vérifier d'abord les exercices locaux
      const tempExercises = JSON.parse(localStorage.getItem('temp_exercises') || '{}');
      if (tempExercises[exerciseId]) {
        return tempExercises[exerciseId];
      }
      
      // Sinon essayer l'API
      const response = await ExercicesService.getExerciseDetails(exerciseId);
      console.log('Exercise details response:', response);
      
      if (response.data) {
        const item = response.data;
        // Convertir le content en chaîne
        const contentString = this.contentToString(item.content);
        
        const exercise: Exercise = {
          id: item.id || 0,
          courseId: item.courseId || 0,
          title: item.title || '',
          description: item.description || '',
          maxScore: item.maxScore || 0,
          dueDate: item.dueDate || '',
          createdAt: item.createdAt || new Date().toISOString(),
          content: contentString, // Toujours une string
          questions: item.content ? this.parseContentToQuestions(item.content) : []
        };
        
        // Extraire le statut des métadonnées
        if (item.content) {
          try {
            const parsed = typeof item.content === 'string' 
              ? JSON.parse(item.content) 
              : item.content;
              
            if (parsed.metadata && parsed.metadata.status) {
              exercise.status = parsed.metadata.status;
            }
          } catch (e) {
            console.warn('Could not parse content for status:', e);
          }
        }
        
        return exercise;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch exercise details:', error);
      
      // Fallback : exercice local
      const tempExercises = JSON.parse(localStorage.getItem('temp_exercises') || '{}');
      if (tempExercises[exerciseId]) {
        return tempExercises[exerciseId];
      }
      
      return null;
    }
  }
  
  /**
   * Récupérer les statistiques d'un cours
   */
  static async getCourseStatistics(courseId: number) {
    try {
      const response = await EnseignantService.getCourseStatistics(courseId);
      return response;
    } catch (error) {
      console.error('Failed to fetch course statistics:', error);
      throw error;
    }
  }
  
  /**
   * Récupérer toutes les statistiques des cours
   */
  static async getAllCoursesStatistics() {
    try {
      const response = await EnseignantService.getAllCoursesStatistics();
      return response;
    } catch (error) {
      console.error('Failed to fetch all courses statistics:', error);
      throw error;
    }
  }
  
  /**
   * Méthode utilitaire pour nettoyer les exercices temporaires
   */
  static cleanupTempExercises() {
    localStorage.removeItem('temp_exercises');
    console.log('Temp exercises cleaned up');
  }
  
  /**
   * Synchroniser les exercices temporaires avec le backend
   */
  static async syncTempExercises(courseId: number): Promise<Exercise[]> {
    const tempExercises = JSON.parse(localStorage.getItem('temp_exercises') || '{}');
    const courseExercises = Object.values(tempExercises).filter((ex: any) => 
      ex.courseId === courseId
    ) as Exercise[];
    
    const syncedExercises: Exercise[] = [];
    
    for (const exercise of courseExercises) {
      try {
        const synced = await this.createExercise(courseId, {
          title: exercise.title,
          description: exercise.description,
          maxScore: exercise.maxScore,
          dueDate: exercise.dueDate,
          questions: exercise.questions,
          status: exercise.status
        });
        
        if (synced.success) {
          syncedExercises.push(synced.data);
          // Supprimer de la liste temporaire
          delete tempExercises[exercise.id];
        }
      } catch (error) {
        console.error(`Failed to sync exercise ${exercise.id}:`, error);
      }
    }
    
    localStorage.setItem('temp_exercises', JSON.stringify(tempExercises));
    return syncedExercises;
  }
}