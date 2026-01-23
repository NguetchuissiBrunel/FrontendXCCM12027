// src/lib/mappers/ExerciseMapper.ts
import { Exercise, Question } from '@/types/exercise';

export class ExerciseMapper {
  /**
   * Convertit les questions en format backend
   */
  static questionsToContent(questions: Question[]): Record<string, any> {
    return {
      version: '2.0',
      questions: questions.map(q => ({
        id: q.id || Date.now(),
        text: q.question,
        type: q.questionType,
        points: q.points || 0,
        options: q.options || [],
        correctAnswer: q.correctAnswer || null
      })),
      metadata: {
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
        questionCount: questions.length,
        createdAt: new Date().toISOString()
      }
    };
  }

  /**
   * Convertit le content backend en questions
   */
  static contentToQuestions(content: Record<string, any>): Question[] {
    try {
      const questionsData = content?.questions || [];
      
      if (Array.isArray(questionsData)) {
        return questionsData.map((q: any, index: number) => ({
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
    } catch (error) {
      console.warn('Erreur parsing content:', error);
    }
    
    return [];
  }

  /**
   * Prépare la requête de création
   */
  static toCreateRequest(data: {
    title: string;
    description: string;
    maxScore: number;
    dueDate?: string;
    questions: Question[];
  }): any {
    return {
      title: data.title,
      description: data.description || '',
      maxScore: data.maxScore,
      dueDate: data.dueDate,
      content: this.questionsToContent(data.questions)
    };
  }

  /**
   * Prépare la requête de mise à jour
   */
  static toUpdateRequest(data: {
    title?: string;
    description?: string;
    maxScore?: number;
    dueDate?: string;
    questions?: Question[];
  }): any {
    const request: any = {};

    if (data.title !== undefined) request.title = data.title;
    if (data.description !== undefined) request.description = data.description;
    if (data.maxScore !== undefined) request.maxScore = data.maxScore;
    if (data.dueDate !== undefined) request.dueDate = data.dueDate;

    if (data.questions !== undefined) {
      request.content = this.questionsToContent(data.questions);
    }

    return request;
  }

  /**
   * Convertit la réponse backend en Exercise
   */
  static fromBackendResponse(backendData: any): Exercise {
    const content = backendData.content || {};
    
    return {
      id: backendData.id || 0,
      courseId: backendData.courseId || 0,
      title: backendData.title || '',
      description: backendData.description || '',
      maxScore: backendData.maxScore || 0,
      dueDate: backendData.dueDate || '',
      createdAt: backendData.createdAt || new Date().toISOString(),
      content: content,
      questions: this.contentToQuestions(content)
    };
  }

  /**
   * Validation des données
   */
  static validate(data: {
    title: string;
    maxScore: number;
    questions: Question[];
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('Le titre est requis');
    }

    if (!data.questions || data.questions.length === 0) {
      errors.push('Ajoutez au moins une question');
    }

    const totalPoints = data.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    if (totalPoints > data.maxScore) {
      errors.push(`Total des points (${totalPoints}) dépasse le score maximum (${data.maxScore})`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}