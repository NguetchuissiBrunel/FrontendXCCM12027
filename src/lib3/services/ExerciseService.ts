// src/lib/services/ExerciseService.ts - VERSION COMPLÈTE ET CORRIGÉE
import { 
  Exercise, 
  Question, 
  ApiResponse, 
  SubmitExerciseRequest, 
  ExerciseContent,
  Submission,
  CreateQuestionInput,
  CreateExerciseInput
} from '@/types/exercise';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { EnseignantService } from '@/lib/services/EnseignantService';
import { ExerciseApiWrapper } from '@/lib3/services/ExerciseApiWrapper';

// Type pour les réponses des services générés
interface GeneratedApiResponse<T = any> {
  code?: number;
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  error?: string;
  timestamp?: string;
}

export class ExerciseService {
  private static readonly CONTENT_VERSION = '2.0';
  
  // ============ CONVERSION ET PARSING ============
  
  /**
   * Convertit les questions frontend en JSON pour le backend
   */
  static serializeQuestions(questions: Question[]): string {
    const content: ExerciseContent = {
      version: this.CONTENT_VERSION,
      questions: questions.map(q => ({
        id: q.id || Date.now(),
        text: q.question,
        type: q.questionType,
        points: q.points,
        options: q.options || [],
        correctAnswer: q.correctAnswer || null,
      })),
      metadata: {
        status: 'PUBLISHED',
        totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
        questionCount: questions.length,
        types: [...new Set(questions.map(q => q.questionType))],
        createdAt: new Date().toISOString()
      }
    };
    
    return JSON.stringify(content, null, 2);
  }
  
  /**
   * Parse le contenu JSON en questions frontend
   */
  static parseContent(content: string | null | undefined): Question[] {
    if (!content || content.trim() === '' || content === '{}') {
      return [];
    }
    
    try {
      const parsedContent: ExerciseContent = JSON.parse(content);
      
      if (!parsedContent?.questions || !Array.isArray(parsedContent.questions)) {
        return [];
      }
      
      return parsedContent.questions.map((q, index): Question => ({
        id: q.id || Date.now() + index,
        exerciseId: 0,
        question: q.text || '',
        questionType: q.type || 'TEXT',
        points: q.points || 0,
        options: q.options || [],
        correctAnswer: q.correctAnswer === null ? undefined : q.correctAnswer,
        studentAnswer: q.studentAnswer,
        studentPoints: q.studentPoints
      }));
      
    } catch (error) {
      console.warn('Erreur parsing contenu exercice:', error, 'Content:', content);
      return [];
    }
  }
  
  /**
   * Convertit les données API en objet Exercise frontend
   */
  static async transformApiToFrontend(apiData: any): Promise<Exercise> {
    if (!apiData) {
      throw new Error('Données API invalides');
    }
    
    // Récupérer le contenu
    let content = apiData.content;
    
    // Si le contenu n'est pas fourni, essayer de le récupérer
    if (!content && apiData.id) {
      try {
        const contentResponse = await ExerciseApiWrapper.getExerciseContent(apiData.id);
        content = contentResponse.content;
      } catch (error) {
        console.warn('Impossible de récupérer le contenu:', error);
        content = '{}';
      }
    }
    
    // Parser les questions
    const questions = this.parseContent(content);
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    
    // Calculer si la date d'échéance est dépassée
    const dueDatePassed = this.isDueDatePassed(apiData.dueDate);
    
    return {
      id: apiData.id || 0,
      courseId: apiData.courseId || 0,
      title: apiData.title || 'Exercice sans titre',
      description: apiData.description || '',
      maxScore: apiData.maxScore || totalPoints || 20,
      dueDate: apiData.dueDate || '',
      createdAt: apiData.createdAt || new Date().toISOString(),
      content: content || '{}',
      questions,
      status: 'PUBLISHED',
      submissionsCount: apiData.submissionCount || 0,
      averageScore: apiData.averageScore || 0,
      totalStudents: apiData.totalStudents || 0,
      canSubmit: !dueDatePassed,
      alreadySubmitted: apiData.alreadySubmitted || false,
      studentScore: apiData.score,
      feedback: apiData.feedback
    };
  }
  
  // ============ VALIDATION ============
  
  static validateExercise(data: {
    title: string;
    questions: Question[];
    maxScore: number;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validation du titre
    const trimmedTitle = data.title?.trim();
    if (!trimmedTitle) {
      errors.push('Le titre est requis');
    } else if (trimmedTitle.length > 200) {
      errors.push('Le titre ne doit pas dépasser 200 caractères');
    }
    
    // Validation des questions
    if (!data.questions || data.questions.length === 0) {
      errors.push('Ajoutez au moins une question');
    } else {
      data.questions.forEach((q, index) => {
        if (!q.question?.trim()) {
          errors.push(`La question ${index + 1} est vide`);
        }
        
        if (!q.points || q.points <= 0) {
          errors.push(`La question ${index + 1} doit avoir des points positifs`);
        }
        
        if (q.questionType === 'MULTIPLE_CHOICE') {
          if (!q.options || q.options.length < 2) {
            errors.push(`La question ${index + 1} (choix multiple) doit avoir au moins 2 options`);
          }
          
          // Validation des options
          q.options?.forEach((opt, optIndex) => {
            if (!opt.trim()) {
              errors.push(`L'option ${optIndex + 1} de la question ${index + 1} est vide`);
            }
          });
        }
      });
    }
    
    // Validation du score total
    const totalPoints = data.questions.reduce((sum, q) => sum + q.points, 0);
    if (totalPoints > data.maxScore) {
      errors.push(`Total des points (${totalPoints}) dépasse le score maximum (${data.maxScore})`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // ============ MÉTHODES POUR LA CRÉATION/DUPLICATION ============
  
  /**
   * Préparer les questions pour la création ou duplication
   */
  static prepareQuestionsForCreation(questions: Question[]): CreateQuestionInput[] {
    return questions.map(q => ({
      question: q.question,
      questionType: q.questionType,
      points: q.points,
      options: q.options ? [...q.options] : undefined,
      correctAnswer: q.correctAnswer
    }));
  }
  
  /**
   * Dupliquer un exercice
   */
  static async duplicateExercise(
    sourceExerciseId: number,
    courseId: number,
    newTitle?: string
  ): Promise<ApiResponse<Exercise>> {
    try {
      console.log(`Duplication de l'exercice ${sourceExerciseId} vers le cours ${courseId}`);
      
      // Récupérer l'exercice source
      const sourceExercise = await this.getExerciseDetails(sourceExerciseId);
      
      if (!sourceExercise) {
        throw new Error('Exercice source non trouvé');
      }
      
      // Préparer les données de duplication
      const duplicateData: CreateExerciseInput = {
        title: newTitle || `${sourceExercise.title} (Copie)`,
        description: sourceExercise.description,
        maxScore: sourceExercise.maxScore,
        dueDate: sourceExercise.dueDate,
        questions: this.prepareQuestionsForCreation(sourceExercise.questions)
      };
      
      console.log('Données de duplication:', duplicateData);
      
      // Créer le nouvel exercice
      const result = await this.createExercise(courseId, {
        ...duplicateData,
        questions: sourceExercise.questions // Utiliser les questions complètes pour la création
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la duplication');
      }
      
      return {
        code: 200,
        success: true,
        message: '✅ Exercice dupliqué avec succès',
        data: result.data,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: any) {
      console.error('Échec duplication exercice:', error);
      return {
        code: 400,
        success: false,
        message: error.message || 'Erreur lors de la duplication',
        error: error.toString(),
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Vérifier et normaliser le statut d'un exercice
   */
  static normalizeExerciseStatus(exerciseData: any): 'PUBLISHED' | 'CLOSED' {
    if (!exerciseData) return 'PUBLISHED';
    
    const status = exerciseData.status;
    
    // Conversion pour la compatibilité
    if (status === 'DRAFT' || status === 'PUBLISHED' || status === 'PUBLIÉ') {
      return 'PUBLISHED';
    }
    
    if (status === 'CLOSED' || status === 'FERMÉ' || status === 'TERMINÉ') {
      return 'CLOSED';
    }
    
    return 'PUBLISHED'; // Par défaut
  }
  
  // ============ CRUD OPERATIONS ============
  
  /**
   * Créer un nouvel exercice
   */
  static async createExercise(
    courseId: number,
    data: {
      title: string;
      description: string;
      maxScore: number;
      dueDate?: string;
      questions: Question[];
    }
  ): Promise<ApiResponse<Exercise>> {
    try {
      // Validation
      const validation = this.validateExercise({
        title: data.title,
        questions: data.questions,
        maxScore: data.maxScore
      });
      
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Préparer les données
      const content = this.serializeQuestions(data.questions);
      const backendData = {
        title: data.title.trim(),
        description: data.description || '',
        maxScore: data.maxScore,
        dueDate: data.dueDate || null,
        content: content
      };
      
      // Appel API via le wrapper
      const response = await ExerciseApiWrapper.createExerciseWithContent(
        courseId,
        backendData
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la création');
      }
      
      // Transformer la réponse
      const exercise = await this.transformApiToFrontend(response.data);
      
       return {
    code: 200,
    success: true,
    message: '✅ Exercice créé et publié avec succès',
    data: exercise, // ← L'exercice créé
    timestamp: new Date().toISOString()
  };
      
    } catch (error: any) {
      console.error('Échec création exercice:', error);
      return {
        code: 400,
        success: false,
        message: error.message || 'Erreur lors de la création',
        error: error.toString(),
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Récupérer tous les exercices d'un cours
   */
  static async getExercisesForCourse(courseId: number): Promise<Exercise[]> {
    try {
      // Utiliser le service généré mais avec gestion de type
      const response = await ExercicesService.getExercisesForCourse(courseId) as unknown;
      
      // Parser la réponse
      const parsedResponse = this.parseGeneratedResponse<any[]>(response);
      
      if (!parsedResponse.data || !Array.isArray(parsedResponse.data)) {
        return [];
      }
      
      // Transformer chaque exercice
      const exercises: Exercise[] = [];
      
      for (const apiExercise of parsedResponse.data) {
        try {
          const exercise = await this.transformApiToFrontend(apiExercise);
          exercises.push(exercise);
        } catch (error) {
          console.warn('Erreur transformation exercice:', error);
        }
      }
      
      return exercises;
      
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
      const apiData = await ExerciseApiWrapper.getFullExercise(exerciseId);
      
      if (!apiData) {
        return null;
      }
      
      return await this.transformApiToFrontend(apiData);
      
    } catch (error) {
      console.error('Erreur récupération détails exercice:', error);
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
      // Si on met à jour les questions, valider
      if (data.questions) {
        const validation = this.validateExercise({
          title: data.title || 'Titre temporaire',
          questions: data.questions,
          maxScore: data.maxScore || 20
        });
        
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }
      }
      
      // Mettre à jour le contenu si nécessaire
      if (data.questions !== undefined) {
        const content = this.serializeQuestions(data.questions);
        
        // Mettre à jour via le wrapper
        await ExerciseApiWrapper.updateExerciseContent(exerciseId, content);
      }
      
      // Mettre à jour les données de base si fournies
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.maxScore !== undefined) updateData.maxScore = data.maxScore;
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
      
      if (Object.keys(updateData).length > 0) {
        // Utiliser le service généré avec gestion de type
        const response = await EnseignantService.updateExercise(
          exerciseId, 
          updateData
        ) as unknown;
        
        const parsedResponse = this.parseGeneratedResponse(response);
        
        if (!parsedResponse.success) {
          throw new Error(parsedResponse.message || 'Erreur lors de la mise à jour');
        }
      }
      
      // Récupérer l'exercice mis à jour
      const updatedExercise = await this.getExerciseDetails(exerciseId);
      
      if (!updatedExercise) {
        throw new Error('Exercice non trouvé après mise à jour');
      }
      
      return {
        code: 200,
        success: true,
        message: '✅ Exercice mis à jour',
        data: updatedExercise,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: any) {
      console.error('Échec mise à jour exercice:', error);
      return {
        code: 400,
        success: false,
        message: error.message || 'Erreur lors de la mise à jour',
        error: error.toString(),
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Supprimer un exercice
   */
  static async deleteExercise(exerciseId: number): Promise<boolean> {
    try {
      const response = await EnseignantService.deleteExercise(exerciseId) as unknown;
      const parsedResponse = this.parseGeneratedResponse(response);
      return parsedResponse.success || false;
    } catch (error) {
      console.error('Erreur suppression exercice:', error);
      throw error;
    }
  }
  
  // ============ SOUMISSIONS ============
  
  /**
   * Soumettre un exercice (étudiant)
   */
  static async submitExercise(
    exerciseId: number,
    request: SubmitExerciseRequest
  ): Promise<ApiResponse<any>> {
    try {
      // Préparer le contenu de soumission
      const submissionContent = {
        version: '1.0',
        answers: request.answers || [],
        metadata: {
          submittedAt: new Date().toISOString(),
          exerciseId: exerciseId
        }
      };
      
      const backendRequest = {
        submissionUrl: request.submissionUrl || '',
        content: JSON.stringify(submissionContent)
      };
      
      const response = await ExercicesService.submitExercise(
        exerciseId,
        backendRequest
      ) as unknown;
      
      const parsedResponse = this.parseGeneratedResponse(response);
      
      return {
        code: parsedResponse.code || 200,
        success: parsedResponse.success || false,
        message: parsedResponse.message || 'Soumission effectuée',
        data: parsedResponse.data,
        timestamp: parsedResponse.timestamp || new Date().toISOString()
      };
      
    } catch (error: any) {
      console.error('Erreur soumission exercice:', error);
      return {
        code: 400,
        success: false,
        message: error.message || 'Erreur lors de la soumission',
        error: error.toString(),
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Récupérer les soumissions d'un exercice (enseignant)
   */
  static async getExerciseSubmissions(exerciseId: number): Promise<Submission[]> {
    try {
      const submissions = await ExerciseApiWrapper.getSubmissionsWithAnswers(exerciseId);
      
      if (!Array.isArray(submissions)) {
        return [];
      }
      
      return submissions.map((sub: any): Submission => ({
        id: sub.id || 0,
        exerciseId: sub.exerciseId || exerciseId,
        studentId: sub.studentId || '',
        studentName: sub.studentName || 'Étudiant',
        score: sub.score,
        maxScore: sub.maxScore || 0,
        feedback: sub.feedback,
        submissionUrl: sub.submissionUrl,
        submittedAt: sub.submittedAt || new Date().toISOString(),
        graded: sub.graded || false,
        answers: sub.answers || []
      }));
      
    } catch (error) {
      console.error('Erreur récupération soumissions:', error);
      return [];
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
    }
  ): Promise<ApiResponse<any>> {
    try {
      const response = await EnseignantService.gradeSubmission(
        submissionId,
        gradeData
      ) as unknown;
      
      const parsedResponse = this.parseGeneratedResponse(response);
      
      return {
        code: parsedResponse.code || 200,
        success: parsedResponse.success || false,
        message: parsedResponse.message || 'Notation effectuée',
        data: parsedResponse.data,
        timestamp: parsedResponse.timestamp || new Date().toISOString()
      };
      
    } catch (error: any) {
      console.error('Erreur notation soumission:', error);
      return {
        code: 400,
        success: false,
        message: error.message || 'Erreur lors de la notation',
        error: error.toString(),
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Récupérer les soumissions de l'étudiant connecté
   */
  static async getMySubmissions(): Promise<any[]> {
    try {
      const response = await ExercicesService.getMySubmissions() as unknown;
      const parsedResponse = this.parseGeneratedResponse<any[]>(response);
      return parsedResponse.data || [];
    } catch (error) {
      console.error('Erreur récupération soumissions étudiant:', error);
      return [];
    }
  }
  
  // ============ UTILITIES ============
  
  /**
   * Parser les réponses des services générés
   */
  private static parseGeneratedResponse<T = any>(response: unknown): GeneratedApiResponse<T> {
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
  
  static isDueDatePassed(dueDate: string | null | undefined): boolean {
    if (!dueDate) return false;
    
    try {
      const due = new Date(dueDate);
      const now = new Date();
      return now > due;
    } catch {
      return false;
    }
  }
  
  static formatDueDate(dueDate: string | null | undefined): string {
    if (!dueDate) return 'Pas de date limite';
    
    try {
      const date = new Date(dueDate);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  }
  
  static calculateTotalPoints(exercise: Exercise): number {
    if (exercise.questions && exercise.questions.length > 0) {
      return exercise.questions.reduce((sum, q) => sum + q.points, 0);
    }
    return exercise.maxScore;
  }
  
  static async checkSubmissionPermission(
    exerciseId: number
  ): Promise<{ canSubmit: boolean; reason?: string; exercise?: Exercise }> {
    try {
      const exercise = await this.getExerciseDetails(exerciseId);
      
      if (!exercise) {
        return { canSubmit: false, reason: 'Exercice non trouvé' };
      }
      
      // Vérifier la date d'échéance
      if (this.isDueDatePassed(exercise.dueDate)) {
        return { canSubmit: false, reason: 'La date d\'échéance est dépassée', exercise };
      }
      
      // Vérifier si déjà soumis
      const submissions = await this.getMySubmissions();
      const alreadySubmitted = submissions.some(
        (sub: any) => sub.exerciseId === exerciseId
      );
      
      if (alreadySubmitted) {
        return { canSubmit: false, reason: 'Vous avez déjà soumis cet exercice', exercise };
      }
      
      return { canSubmit: true, exercise };
      
    } catch (error) {
      console.error('Erreur vérification permission:', error);
      return { canSubmit: false, reason: 'Erreur de vérification' };
    }
  }
  
  /**
   * Nettoyer le localStorage
   */
  static cleanupLocalStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('temp_exercise_draft');
        localStorage.removeItem('draft_exercises');
      } catch (error) {
        // Ignorer les erreurs
      }
    }
  }
  
  /**
   * Générer un exercice factice pour les tests
   */
  static generateMockExercise(courseId: number): Exercise {
    const questions: Question[] = [
      {
        id: Date.now(),
        exerciseId: 0,
        question: 'Quelle est la capitale de la France ?',
        questionType: 'TEXT',
        points: 5,
        correctAnswer: 'Paris'
      },
      {
        id: Date.now() + 1,
        exerciseId: 0,
        question: 'Quelle est la bonne réponse ?',
        questionType: 'MULTIPLE_CHOICE',
        points: 10,
        options: ['Option A', 'Option B', 'Option C'],
        correctAnswer: 'Option B'
      }
    ];
    
    const content = this.serializeQuestions(questions);
    
    return {
      id: 0,
      courseId,
      title: 'Exercice exemple',
      description: 'Description de l\'exercice exemple',
      maxScore: 20,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      content,
      questions,
      status: 'PUBLISHED',
      submissionsCount: 0,
      averageScore: 0,
      totalStudents: 0,
      canSubmit: true,
      alreadySubmitted: false
    };
  }
}