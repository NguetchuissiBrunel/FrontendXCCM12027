// src/lib/mappers/ExerciseMapper.ts - VERSION CORRIGÉE
import { Exercise, Question, QuestionType } from '@/types/exercise';

export class ExerciseMapper {
  private static readonly CONTENT_VERSION = '2.0';

  /**
   * Normalise une question (support compatibilité ascendante)
   */
  private static normalizeQuestion(input: any): Question {
    return {
      id: input.id || 0,
      exerciseId: input.exerciseId || 0,
      text: input.text || input.question || '',  // Support les deux formats
      type: input.type || input.questionType || 'TEXT',  // Support les deux formats
      points: input.points || 0,
      order: input.order || 0,
      options: input.options,
      correctAnswer: input.correctAnswer,
      explanation: input.explanation,
      studentAnswer: input.studentAnswer,
      studentPoints: input.studentPoints
    };
  }

  /**
   * Convertit les questions en format backend (ExerciseContent)
   */
  static questionsToContent(questions: Question[]): Record<string, any> {
    // Normaliser toutes les questions d'abord
    const normalizedQuestions = questions.map(q => this.normalizeQuestion(q));
    
    return {
      version: this.CONTENT_VERSION,
      questions: normalizedQuestions.map(q => ({
        id: q.id || Date.now(),
        text: q.text,  // ✅ Utilise le champ normalisé 'text'
        type: q.type,  // ✅ Utilise le champ normalisé 'type'
        points: q.points || 0,
        order: q.order || 0,
        options: q.options || [],
        correctAnswer: q.correctAnswer || null,
        explanation: q.explanation || ''
      })),
      metadata: {
        status: 'PUBLISHED',
        totalPoints: normalizedQuestions.reduce((sum, q) => sum + (q.points || 0), 0),
        questionCount: normalizedQuestions.length,
        types: [...new Set(normalizedQuestions.map(q => q.type))],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Convertit le content backend en questions frontend
   */
  static contentToQuestions(content: Record<string, any>): Question[] {
    try {
      const questionsData = content?.questions || [];
      
      if (Array.isArray(questionsData)) {
        return questionsData.map((q: any, index: number) => 
          this.normalizeQuestion({
            id: q.id || Date.now() + index,
            exerciseId: q.exerciseId || 0,
            text: q.text,
            question: q.text,  // Pour compatibilité
            type: q.type,
            questionType: q.type,  // Pour compatibilité
            points: q.points || 0,
            order: q.order || index,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            studentAnswer: q.studentAnswer,
            studentPoints: q.studentPoints
          })
        );
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
      content: this.questionsToContent(data.questions)  // content pour l'API
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
    status?: string;
  }): any {
    const request: any = {};

    if (data.title !== undefined) request.title = data.title;
    if (data.description !== undefined) request.description = data.description;
    if (data.maxScore !== undefined) request.maxScore = data.maxScore;
    if (data.dueDate !== undefined) request.dueDate = data.dueDate;
    if (data.status !== undefined) request.status = data.status;

    if (data.questions !== undefined) {
      request.content = this.questionsToContent(data.questions);
    }

    return request;
  }

  /**
   * Convertit la réponse backend en Exercise (sans la propriété 'content')
   */
  static fromBackendResponse(backendData: any): Exercise {
    // Extraire le content depuis backendData
    const content = backendData.content || {};
    
    // Convertir le content en questions
    const questions = this.contentToQuestions(content);
    
    // Retourner un objet Exercise valide (sans propriété 'content')
    return {
      id: backendData.id || 0,
      courseId: backendData.courseId || 0,
      title: backendData.title || '',
      description: backendData.description || '',
      maxScore: backendData.maxScore || 0,
      dueDate: backendData.dueDate || undefined,
      status: backendData.status || 'DRAFT',
      createdAt: backendData.createdAt || new Date().toISOString(),
      updatedAt: backendData.updatedAt || undefined,
      publishedAt: backendData.publishedAt || undefined,
      questions: questions,  // ✅ Les questions sont extraites du content
      version: backendData.version || this.CONTENT_VERSION,
      submissionCount: backendData.submissionCount || 0,
      averageScore: backendData.averageScore,
      completionRate: backendData.completionRate,
      pendingGrading: backendData.pendingGrading,
      courseTitle: backendData.courseTitle,
      studentScore: backendData.studentScore,
      alreadySubmitted: backendData.alreadySubmitted,
      canSubmit: backendData.canSubmit,
      feedback: backendData.feedback
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

  /**
   * Extrait le content brut d'un exercice (pour debug)
   */
  static extractRawContent(exerciseData: any): any {
    return exerciseData.content || null;
  }

  /**
   * Vérifie si l'exercice a un content valide
   */
  static hasValidContent(exerciseData: any): boolean {
    const content = exerciseData.content;
    if (!content) return false;
    
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      return Array.isArray(parsed.questions);
    } catch {
      return false;
    }
  }
}