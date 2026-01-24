// src/lib/services/ExerciseService.ts - VERSION UNIFIÉE
import {
  Exercise,
  Question,
  ApiResponse,
  SubmitExerciseRequest,
  SubmissionAnswer,
  ExerciseContent,
  Submission,
  CreateQuestionDto,
  CreateExerciseDto,
  QuestionType,
  PaginatedResponse,
  ValidationResult,
  ExerciseStats,
  QuestionStat,
  GradeDistribution,
  formatQuestionType,
  isQuestionType,
  getSubmissionStatus,
  migrateLegacyQuestion,
  migrateLegacyExercise,
  UpdateExerciseDto,
  UpdateQuestionDto
} from '@/types/exercise';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { EnseignantService } from '@/lib/services/EnseignantService';
import { ExerciseApiWrapper } from '@/lib3/services/ExerciseApiWrapper';
import { OpenAPI } from '@/lib/core/OpenAPI';
import { request as __request } from '@/lib/core/request';

// Type pour les réponses des services générés (compatibilité)
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
   * Convertit les questions frontend en ExerciseContent pour le backend
   */
  static serializeQuestions(questions: Question[]): ExerciseContent {
    const safeQuestions = questions.map((q, index) => ({
      id: q.id || Date.now() + index,
      text: q.text.trim() || `Question ${index + 1}`,
      type: q.type,
      points: q.points || 1,
      order: q.order || index,
      ...(q.options && q.options.length > 0 && { options: q.options }),
      ...(q.correctAnswer !== undefined && { correctAnswer: q.correctAnswer }),
      ...(q.explanation && { explanation: q.explanation })
    }));

    const uniqueTypes = [...new Set(safeQuestions.map(q => q.type))];

    return {
      version: this.CONTENT_VERSION,
      questions: safeQuestions,
      metadata: {
        status: 'PUBLISHED',
        totalPoints: safeQuestions.reduce((sum, q) => sum + q.points, 0),
        questionCount: safeQuestions.length,
        types: uniqueTypes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Convertit ExerciseContent en string JSON pour l'API
   */
  static serializeContentToString(content: ExerciseContent): string {
    try {
      return JSON.stringify(content);
    } catch (error) {
      console.error('Erreur sérialisation content:', error);
      return JSON.stringify({
        version: this.CONTENT_VERSION,
        questions: [],
        metadata: {
          status: 'PUBLISHED',
          totalPoints: 0,
          questionCount: 0,
          types: [],
          createdAt: new Date().toISOString()
        }
      });
    }
  }

  // ============ CONVERSION DTO -> ENTITY ============

  /**
   * Convertit CreateQuestionDto[] en Question[] (ajoute id et exerciseId)
   */
  static convertCreateQuestionsToQuestions(
    createQuestions: CreateQuestionDto[],
    exerciseId: number = 0
  ): Question[] {
    return createQuestions.map((dto, index) => ({
      id: Date.now() + index, // ID temporaire
      exerciseId: exerciseId,
      text: dto.text,
      type: dto.type,
      points: dto.points || 1,
      order: dto.order || index,
      options: dto.options,
      correctAnswer: dto.correctAnswer,
      explanation: dto.explanation,
      // Pas de studentAnswer/studentPoints pour les nouvelles questions
    }));
  }

  /**
   * Convertit UpdateQuestionDto[] en Question[] (préserve les IDs existants)
   */
  static convertUpdateQuestionsToQuestions(
    updateQuestions: UpdateQuestionDto[],
    existingQuestions: Question[] = [],
    exerciseId: number = 0
  ): Question[] {
    return updateQuestions.map((dto, index) => {
      // Trouver la question existante par ID si fourni
      const existing = dto.id ? existingQuestions.find(q => q.id === dto.id) : null;

      return {
        id: dto.id || existing?.id || Date.now() + index,
        exerciseId: exerciseId,
        text: dto.text || existing?.text || '',
        type: dto.type || existing?.type || 'TEXT',
        points: dto.points || existing?.points || 1,
        order: dto.order || existing?.order || index,
        options: dto.options || existing?.options,
        correctAnswer: dto.correctAnswer !== undefined ? dto.correctAnswer : existing?.correctAnswer,
        explanation: dto.explanation || existing?.explanation,
        studentAnswer: existing?.studentAnswer,
        studentPoints: existing?.studentPoints
      };
    });
  }

  /**
   * Parse le contenu JSON en questions frontend
   */
  static parseContent(content: any): Question[] {
    // Si content est null/undefined
    if (content == null) {
      return [];
    }

    // Si content est déjà un tableau de questions
    if (Array.isArray(content)) {
      return this.normalizeQuestions(content);
    }

    // Si content est une chaîne JSON
    if (typeof content === 'string') {
      const trimmed = content.trim();
      if (trimmed === '' || trimmed === '{}' || trimmed === '[]') {
        return [];
      }

      try {
        const parsed = JSON.parse(trimmed);
        return this.extractQuestionsFromObject(parsed);
      } catch (error) {
        console.warn('Erreur parsing JSON:', error);
        return [];
      }
    }

    // Si content est un objet
    if (typeof content === 'object') {
      return this.extractQuestionsFromObject(content);
    }

    console.warn('Format de content non reconnu:', typeof content);
    return [];
  }

  /**
   * Extrait les questions d'un objet (support multiple formats)
   */
  private static extractQuestionsFromObject(obj: any): Question[] {
    // Format ExerciseContent
    if (obj.questions && Array.isArray(obj.questions)) {
      return this.normalizeQuestions(obj.questions);
    }

    // Format plat avec propriété questions
    const possibleQuestionProps = ['questions', 'items', 'content'];
    for (const prop of possibleQuestionProps) {
      if (obj[prop] && Array.isArray(obj[prop])) {
        return this.normalizeQuestions(obj[prop]);
      }
    }

    // Si l'objet est directement un tableau déguisé
    if (Array.isArray(Object.values(obj)[0])) {
      const firstValue = Object.values(obj)[0];
      if (Array.isArray(firstValue)) {
        return this.normalizeQuestions(firstValue);
      }
    }

    return [];
  }

  /**
   * Normalise un tableau de questions vers le format Question
   */
  private static normalizeQuestions(questionsArray: any[]): Question[] {
    if (!Array.isArray(questionsArray)) {
      return [];
    }

    return questionsArray.map((item, index): Question => {
      // Migration depuis les anciens formats si nécessaire
      const migrated = migrateLegacyQuestion({
        id: item.id,
        exerciseId: item.exerciseId || 0,
        text: item.text,
        question: item.question,
        type: item.type,
        questionType: item.questionType,
        points: item.points || item.score || 1,
        order: item.order || index,
        options: item.options || item.choices || [],
        correctAnswer: item.correctAnswer || item.answer,
        explanation: item.explanation || item.feedback || '',
        studentAnswer: item.studentAnswer,
        studentPoints: item.studentPoints
      });

      return migrated;
    });
  }

  /**
   * Convertit les données API en objet Exercise frontend
   */
  static async transformApiToFrontend(apiData: any): Promise<Exercise> {
    if (!apiData) {
      throw new Error('Données API invalides');
    }

    // Migration depuis l'ancien format si nécessaire
    const migrated = migrateLegacyExercise({
      id: apiData.id,
      courseId: apiData.courseId,
      title: apiData.title,
      description: apiData.description,
      maxScore: apiData.maxScore,
      dueDate: apiData.dueDate,
      status: apiData.status,
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
      publishedAt: apiData.publishedAt || apiData.createdAt,
      submissionCount: apiData.submissionCount,
      submissionsCount: apiData.submissionsCount,
      averageScore: apiData.averageScore,
      completionRate: apiData.completionRate,
      pendingGrading: apiData.pendingGrading,
      version: apiData.version || this.CONTENT_VERSION,
      courseTitle: apiData.courseTitle,
      studentScore: apiData.studentScore || apiData.score,
      alreadySubmitted: apiData.alreadySubmitted,
      canSubmit: apiData.canSubmit,
      feedback: apiData.feedback
    });

    // Extraire et parser les questions
    const content = apiData.content;
    const questions = this.parseContent(content);

    // Mettre à jour les questions
    migrated.questions = questions;

    return migrated;
  }

  // ============ VALIDATION ============

  static validateExercise(data: {
    title: string;
    questions: Array<Question | CreateQuestionDto>;  // ✅ Accepte les deux
    maxScore: number;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

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
        if (!q.text?.trim()) {
          errors.push(`La question ${index + 1} est vide`);
        }

        if (!q.points || q.points <= 0) {
          errors.push(`La question ${index + 1} doit avoir des points positifs`);
        }

        if (!isQuestionType(q.type)) {
          errors.push(`La question ${index + 1} a un type invalide: ${q.type}`);
        }

        if (q.type === 'MULTIPLE_CHOICE') {
          if (!q.options || q.options.length < 2) {
            errors.push(`La question ${index + 1} (choix multiple) doit avoir au moins 2 options`);
          }

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
    } else if (totalPoints < data.maxScore) {
      warnings.push(`Total des points (${totalPoints}) inférieur au score maximum (${data.maxScore})`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  // ============ CRUD OPERATIONS ============

  /**
   * Créer un nouvel exercice
   */
  static async createExercise(
    courseId: number,
    data: CreateExerciseDto
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

      // Convertir les DTOs en Questions pour la sérialisation
      const questions = this.convertCreateQuestionsToQuestions(data.questions);

      // Serialize content
      const content = this.serializeQuestions(questions);

      // Appel API
      const response = await ExerciseApiWrapper.createExerciseWithContent(
        courseId,
        {
          title: data.title.trim(),
          description: data.description || '',
          maxScore: data.maxScore,
          dueDate: data.dueDate || null,
          content: content
        }
      );

      if (!response.success) {
        throw new Error(response.message || 'Erreur API');
      }

      if (!response.data) {
        throw new Error('Données API manquantes');
      }

      // Transformation
      const exercise = await this.transformApiToFrontend(response.data);

      return {
        success: true,
        message: '✅ Exercice créé avec succès',
        data: exercise,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('Échec création exercice:', error);

      return {
        success: false,
        message: error.message || 'Erreur création',
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Récupérer tous les exercices d'un cours
   */
  static async getExercisesForCourse(courseId: number): Promise<Exercise[]> {
    try {
      const response = await ExercicesService.getExercisesForCourse(courseId) as unknown;
      const parsedResponse = this.parseGeneratedResponse<any[]>(response);

      if (!parsedResponse.data || !Array.isArray(parsedResponse.data)) {
        return [];
      }

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

  // Dans ExerciseService.ts, méthode updateExercise - CORRECTION

  static async updateExercise(
    exerciseId: number,
    data: UpdateExerciseDto
  ): Promise<ApiResponse<Exercise>> {
    try {
      // Vérification de l'ID
      if (!exerciseId || exerciseId <= 0) {
        throw new Error(`ID d'exercice invalide: ${exerciseId}`);
      }

      // Récupérer l'exercice existant pour référence
      const existingExercise = await this.getExerciseDetails(exerciseId);
      if (!existingExercise) {
        throw new Error(`Exercice ${exerciseId} non trouvé`);
      }

      console.log('🔍 === DEBUG updateExercise ===');
      console.log('Exercise ID:', exerciseId);
      console.log('Update data:', data);
      console.log('Existing exercise:', existingExercise);

      // Préparer les données de mise à jour
      const updateData: any = {};

      // Ajouter les champs de base
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.maxScore !== undefined) updateData.maxScore = data.maxScore;
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
      if (data.status !== undefined) updateData.status = data.status;

      // Si des questions sont fournies, ajouter le content
      if (data.questions !== undefined) {
        // Convertir UpdateQuestionDto[] en Question[] pour la validation et sérialisation
        const questionsToValidate = this.convertUpdateQuestionsToQuestions(
          data.questions,
          existingExercise.questions,
          exerciseId
        );

        // Extraire les propriétés validables pour la validation
        const validatableQuestions = questionsToValidate.map(q => ({
          text: q.text,
          type: q.type,
          points: q.points,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          order: q.order
        }));

        const validation = this.validateExercise({
          title: data.title || existingExercise.title,
          questions: validatableQuestions,
          maxScore: data.maxScore || existingExercise.maxScore
        });

        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }

        // CRITIQUE: Mise à jour du content avec le bon format
        const content = this.serializeQuestions(questionsToValidate);

        // Vérifier le format attendu par l'API
        // Option 1: Content en tant qu'objet
        updateData.content = content;

        // Option 2: Content en tant que string JSON (essayez les deux)
        // updateData.content = JSON.stringify(content);

        console.log('📦 Content à envoyer:', content);
      }

      console.log('📤 Données complètes à envoyer à l\'API:', updateData);

      // Utiliser l'endpoint principal de mise à jour
      const response = await EnseignantService.updateExercise(
        exerciseId,
        updateData
      ) as unknown;

      const parsedResponse = this.parseGeneratedResponse(response);

      console.log('📩 Réponse API:', parsedResponse);

      if (!parsedResponse.success) {
        if (parsedResponse.code === 404) {
          throw new Error(`Exercice ${exerciseId} non trouvé`);
        }
        throw new Error(parsedResponse.message || 'Erreur lors de la mise à jour');
      }

      // Récupération de l'exercice mis à jour
      const updatedExercise = await this.getExerciseDetails(exerciseId);

      if (!updatedExercise) {
        throw new Error('Exercice non trouvé après mise à jour');
      }

      console.log('✅ Exercice mis à jour avec succès:', updatedExercise);

      return {
        success: true,
        message: '✅ Exercice mis à jour',
        data: updatedExercise,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('❌ Échec mise à jour exercice:', error);

      return {
        success: false,
        message: error.message || 'Erreur lors de la mise à jour',
        errors: { general: [error.message] },
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

  // ============ GESTION DU STATUT ============

  /**
   * Publier un exercice
   */
  static async publishExercise(exerciseId: number): Promise<ApiResponse<Exercise>> {
    try {
      const result = await this.updateExercise(exerciseId, { status: 'PUBLISHED' });

      if (result.success) {
        return {
          ...result,
          message: '✅ Exercice publié avec succès'
        };
      }

      return result;

    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erreur lors de la publication',
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Fermer un exercice
   */
  static async closeExercise(exerciseId: number): Promise<ApiResponse<Exercise>> {
    try {
      const result = await this.updateExercise(exerciseId, { status: 'CLOSED' });

      if (result.success) {
        return {
          ...result,
          message: '✅ Exercice fermé avec succès'
        };
      }

      return result;

    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erreur lors de la fermeture',
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Archiver un exercice
   */
  static async archiveExercise(exerciseId: number): Promise<ApiResponse<Exercise>> {
    try {
      const result = await this.updateExercise(exerciseId, { status: 'ARCHIVED' });

      if (result.success) {
        return {
          ...result,
          message: '✅ Exercice archivé avec succès'
        };
      }

      return result;

    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erreur lors de l\'archivage',
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };
    }
  }

  // ============ DUPLICATION ============

  /**
   * Dupliquer un exercice
   */
  static async duplicateExercise(
    sourceExerciseId: number,
    targetCourseId: number,
    newTitle?: string
  ): Promise<ApiResponse<Exercise>> {
    try {
      const sourceExercise = await this.getExerciseDetails(sourceExerciseId);

      if (!sourceExercise) {
        throw new Error('Exercice source non trouvé');
      }

      const createData: CreateExerciseDto = {
        courseId: targetCourseId,
        title: newTitle || `${sourceExercise.title} (Copie)`,
        description: sourceExercise.description,
        maxScore: sourceExercise.maxScore,
        dueDate: sourceExercise.dueDate || undefined,
        questions: sourceExercise.questions.map(q => ({
          text: q.text,
          type: q.type,
          points: q.points,
          options: q.options ? [...q.options] : undefined,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          order: q.order
        }))
      };

      return await this.createExercise(targetCourseId, createData);

    } catch (error: any) {
      console.error('Échec duplication exercice:', error);
      return {
        success: false,
        message: error.message || 'Erreur lors de la duplication',
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };
    }
  }

  // ============ SOUMISSIONS ============

  /**
   * Soumettre un exercice (étudiant)
   */
  static async submitExercise(
  exerciseId: number,
  request: SubmitExerciseRequest
): Promise<ApiResponse<Submission>> {
  try {
    // Préparer le contenu de soumission au format attendu par l'API
    const submissionContent = {
      // Convertir votre objet structuré en Record<string, Record<string, any>>
      data: {
        version: '2.0',
        answers: (request.answers || []).map(answer => ({
          questionId: answer.questionId,
          answer: answer.answer,
          submittedAt: new Date().toISOString()
        })),
        metadata: {
          submittedAt: new Date().toISOString(),
          exerciseId: exerciseId,
          studentId: 'current-student'
        }
      }
    };
    
    // CORRECTION : Formater correctement pour Record<string, Record<string, any>>
    const backendRequest: any = {
      submissionUrl: request.submissionUrl || '',
      content: {
        // Envelopper dans un objet qui correspond à Record<string, Record<string, any>>
        submission: submissionContent.data
      }
    };
    
    console.log('📤 Soumission exercice - Données envoyées:', backendRequest);
    
    const response = await ExercicesService.submitExercise(
      exerciseId,
      backendRequest
    ) as unknown;
    
    console.log('📥 Réponse API soumission:', response);
    
    const parsedResponse = this.parseGeneratedResponse<Submission>(response);
    
    return {
      success: parsedResponse.success || false,
      message: parsedResponse.message || 'Soumission effectuée',
      data: parsedResponse.data,
      timestamp: parsedResponse.timestamp || new Date().toISOString()
    };
    
  } catch (error: any) {
    console.error('❌ Erreur soumission exercice:', error);
    console.error('Détails erreur:', {
      message: error.message,
      stack: error.stack,
      requestData: {
        exerciseId,
        answers: request.answers
      }
    });
    
    return {
      success: false,
      message: error.message || 'Erreur lors de la soumission',
      errors: { general: [error.message] },
      timestamp: new Date().toISOString()
    };
  }
}
  
  /**
   * Récupérer les soumissions d'un exercice (enseignant)
   */
  /**
 * Récupérer les soumissions d'un exercice (enseignant)
 */
/**
 * Récupérer les soumissions d'un exercice (enseignant) - VERSION CORRIGÉE
 */
static async getExerciseSubmissions(exerciseId: number): Promise<Submission[]> {
  try {
    console.log('🔍 === DEBUG getExerciseSubmissions ===');
    console.log('Exercise ID:', exerciseId);
    
    // ESSAIER DIFFÉRENTES MÉTHODES POUR RÉCUPÉRER LES SOUMISSIONS
    
    // 1. Essayer via EnseignantService.getSubmissions (méthode générée)
    let submissions: any[] = [];
    
    try {
      console.log('🔄 Tentative 1: EnseignantService.getSubmissions');
      const response = await EnseignantService.getSubmissions(exerciseId) as unknown;
      const parsedResponse = this.parseGeneratedResponse<any[]>(response);
      
      if (parsedResponse.success && Array.isArray(parsedResponse.data)) {
        submissions = parsedResponse.data;
        console.log(`✅ ${submissions.length} soumissions récupérées via EnseignantService`);
      }
    } catch (error) {
      console.warn('❌ EnseignantService.getSubmissions échoué:', error);
    }
    
    // 2. Si vide, essayer via ExerciseApiWrapper (si existe)
    if (submissions.length === 0) {
      try {
        console.log('🔄 Tentative 2: ExerciseApiWrapper.getSubmissionsWithAnswers');
        // Vérifier si la méthode existe
        if (ExerciseApiWrapper['getSubmissionsWithAnswers']) {
          const apiSubmissions = await (ExerciseApiWrapper as any).getSubmissionsWithAnswers(exerciseId);
          if (Array.isArray(apiSubmissions)) {
            submissions = apiSubmissions;
            console.log(`✅ ${submissions.length} soumissions récupérées via ExerciseApiWrapper`);
          }
        }
      } catch (error) {
        console.warn('❌ ExerciseApiWrapper.getSubmissionsWithAnswers échoué:', error);
      }
    }
    
    // 3. Si toujours vide, essayer l'API directe
    if (submissions.length === 0) {
      try {
        console.log('🔄 Tentative 3: API directe');
        const response = await fetch(`/api/v1/teacher/exercises/${exerciseId}/submissions`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            submissions = data.data;
            console.log(`✅ ${submissions.length} soumissions récupérées via API directe`);
          }
        }
      } catch (error) {
        console.warn('❌ API directe échouée:', error);
      }
    }
    
    if (submissions.length === 0) {
      console.warn('⚠️ Aucune soumission trouvée');
      return [];
    }
    
    console.log('📋 Données brutes des soumissions:', submissions);
    
    // Récupérer les détails de l'exercice pour avoir les questions
    let exerciseQuestions: any[] = [];
    try {
      const exercise = await this.getExerciseDetails(exerciseId);
      exerciseQuestions = exercise?.questions || [];
      console.log('✅ Exercise questions loaded:', exerciseQuestions.length);
    } catch (error) {
      console.warn('⚠️ Could not load exercise details:', error);
    }
    
    // Transformer chaque soumission
    return submissions.map((sub: any, index: number): Submission => {
      console.log(`\n📄 Processing submission ${index + 1}/${submissions.length}:`, {
        id: sub.id,
        studentName: sub.studentName,
        hasContent: !!sub.content,
        hasAnswers: !!sub.answers,
        hasResponses: !!sub.responses
      });
      
      let answers: SubmissionAnswer[] = [];
      
      // STRATÉGIE D'EXTRACTION DES RÉPONSES - par ordre de priorité
      
      // 1. Si answers existe directement (format idéal)
      if (sub.answers && Array.isArray(sub.answers)) {
        console.log('✅ Extraction depuis sub.answers');
        answers = sub.answers.map((ans: any, ansIndex: number) => ({
          id: ans.id || Date.now() + ansIndex,
          questionId: ans.questionId || 0,
          answer: ans.answer || ans.response || '',
          points: ans.points,
          feedback: ans.feedback,
          graderComment: ans.graderComment,
          autoGraded: ans.autoGraded || false
        }));
      }
      
      // 2. Si content existe (format JSON stringifié)
      else if (sub.content && answers.length === 0) {
        try {
          console.log('🔄 Tentative extraction depuis sub.content');
          let parsedContent = sub.content;
          
          // Si content est une string, essayer de la parser
          if (typeof sub.content === 'string') {
            try {
              parsedContent = JSON.parse(sub.content);
            } catch (parseError) {
              console.warn('❌ Impossible de parser content comme JSON:', parseError);
            }
          }
          
          // Chercher answers dans différentes structures possibles
          const possibleAnswerPaths = [
            parsedContent.answers,
            parsedContent.data?.answers,
            parsedContent.submission?.answers,
            parsedContent.responses,
            parsedContent.studentAnswers
          ];
          
          for (const answerArray of possibleAnswerPaths) {
            if (Array.isArray(answerArray) && answerArray.length > 0) {
              console.log(`✅ Trouvé ${answerArray.length} réponses dans content`);
              answers = answerArray.map((ans: any, ansIndex: number) => ({
                id: ans.id || Date.now() + ansIndex,
                questionId: ans.questionId || ans.questionId || 0,
                answer: ans.answer || ans.response || ans.text || '',
                points: ans.points || ans.score,
                feedback: ans.feedback,
                graderComment: ans.graderComment,
                autoGraded: ans.autoGraded || false
              }));
              break;
            }
          }
        } catch (error) {
          console.error('❌ Error parsing content:', error);
        }
      }
      
      // 3. Si responses existe
      else if (sub.responses && Array.isArray(sub.responses) && answers.length === 0) {
        console.log('✅ Extraction depuis sub.responses');
        answers = sub.responses.map((resp: any, respIndex: number) => ({
          id: resp.id || Date.now() + respIndex,
          questionId: resp.questionId || 0,
          answer: resp.answer || resp.response || '',
          points: resp.points,
          feedback: resp.feedback,
          graderComment: resp.graderComment,
          autoGraded: resp.autoGraded || false
        }));
      }
      
      // 4. Si studentAnswers existe
      else if (sub.studentAnswers && Array.isArray(sub.studentAnswers) && answers.length === 0) {
        console.log('✅ Extraction depuis sub.studentAnswers');
        answers = sub.studentAnswers.map((ans: any, ansIndex: number) => ({
          id: ans.id || Date.now() + ansIndex,
          questionId: ans.questionId || 0,
          answer: ans.answer || '',
          points: ans.points,
          feedback: ans.feedback,
          graderComment: ans.graderComment,
          autoGraded: ans.autoGraded || false
        }));
      }
      
      // 5. Fallback: Créer des réponses vides basées sur les questions de l'exercice
      else if (exerciseQuestions.length > 0 && answers.length === 0) {
        console.log('⚠️ No answers found, creating empty answers from exercise questions');
        answers = exerciseQuestions.map((question: any, qIndex: number) => ({
          id: Date.now() + qIndex,
          questionId: question.id || qIndex + 1,
          answer: '',
          points: undefined,
          feedback: '',
          graderComment: '',
          autoGraded: false
        }));
      }
      
      console.log(`📋 Final answers for submission ${index + 1}:`, answers.length, 'answers');
      
      // Créer l'objet Submission
      const submission: Submission = {
        id: sub.id || 0,
        exerciseId: sub.exerciseId || exerciseId,
        studentId: sub.studentId || sub.userId || '',
        studentName: sub.studentName || sub.fullName || 'Étudiant',
        studentEmail: sub.studentEmail || sub.email,
        answers: answers,
        score: sub.score,
        maxScore: sub.maxScore || 0,
        feedback: sub.feedback,
        submittedAt: sub.submittedAt || sub.createdAt || new Date().toISOString(),
        graded: sub.graded || sub.corrected || false,
        gradedAt: sub.gradedAt,
        gradedBy: sub.gradedBy,
        timeSpent: sub.timeSpent,
        ipAddress: sub.ipAddress,
        userAgent: sub.userAgent,
        lastModifiedAt: sub.lastModifiedAt || sub.updatedAt,
        submissionUrl: sub.submissionUrl,
        exerciseTitle: sub.exerciseTitle
      };
      
      return submission;
    });
    
  } catch (error) {
    console.error('❌ Error getting exercise submissions:', error);
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
  ): Promise<ApiResponse<Submission>> {
    try {
      const response = await EnseignantService.gradeSubmission(
        submissionId,
        gradeData
      ) as unknown;

      const parsedResponse = this.parseGeneratedResponse<Submission>(response);

      return {
        success: parsedResponse.success || false,
        message: parsedResponse.message || 'Notation effectuée',
        data: parsedResponse.data,
        timestamp: parsedResponse.timestamp || new Date().toISOString()
      };

    } catch (error: any) {
      console.error('Erreur notation soumission:', error);
      return {
        success: false,
        message: error.message || 'Erreur lors de la notation',
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Récupérer les soumissions de l'étudiant connecté
   */
  static async getMySubmissions(): Promise<Submission[]> {
    try {
      const response = await ExercicesService.getMySubmissions() as unknown;
      const parsedResponse = this.parseGeneratedResponse<any[]>(response);

      if (!parsedResponse.data || !Array.isArray(parsedResponse.data)) {
        return [];
      }

      return parsedResponse.data.map((sub: any): Submission => ({
        id: sub.id || 0,
        exerciseId: sub.exerciseId || 0,
        studentId: sub.studentId || '',
        studentName: sub.studentName || 'Étudiant',
        studentEmail: sub.studentEmail,
        score: sub.score,
        maxScore: sub.maxScore || 0,
        feedback: sub.feedback,
        submittedAt: sub.submittedAt || new Date().toISOString(),
        graded: sub.graded || false,
        gradedAt: sub.gradedAt,
        gradedBy: sub.gradedBy,
        answers: [],
        timeSpent: sub.timeSpent,
        submissionUrl: sub.submissionUrl,
        exerciseTitle: sub.exerciseTitle
      }));
    } catch (error) {
      console.error('Erreur récupération soumissions étudiant:', error);
      return [];
    }
  }

  // ============ STATISTIQUES ============

  /**
   * Calculer les statistiques d'un exercice
   */
  static async getExerciseStats(exerciseId: number): Promise<ExerciseStats | null> {
    try {
      const exercise = await this.getExerciseDetails(exerciseId);
      const submissions = await this.getExerciseSubmissions(exerciseId);

      if (!exercise || submissions.length === 0) {
        return null;
      }

      const gradedSubmissions = submissions.filter(s => s.graded && s.score !== undefined);

      if (gradedSubmissions.length === 0) {
        return this.createEmptyStats(exercise);
      }

      const scores = gradedSubmissions.map(s => s.score!);
      const totalScore = scores.reduce((sum, score) => sum + score, 0);
      const averageScore = totalScore / gradedSubmissions.length;

      // Statistiques par question
      const questionStats: QuestionStat[] = exercise.questions.map(question => {
        const questionAnswers = gradedSubmissions
          .flatMap(s => s.answers.filter(a => a.questionId === question.id));

        const correctCount = questionAnswers.filter(a => a.points && a.points >= question.points * 0.8).length;
        const correctRate = questionAnswers.length > 0 ? correctCount / questionAnswers.length : 0;

        // Analyse des réponses incorrectes
        const wrongAnswers = questionAnswers.filter(a => a.points && a.points < question.points * 0.5);
        const commonWrongAnswers = this.analyzeCommonAnswers(wrongAnswers);

        return {
          questionId: question.id,
          text: question.text,
          type: question.type,
          averageScore: questionAnswers.length > 0
            ? questionAnswers.reduce((sum, a) => sum + (a.points || 0), 0) / questionAnswers.length
            : 0,
          correctRate,
          commonWrongAnswers
        };
      });

      // Distribution des notes
      const gradeDistribution = this.calculateGradeDistribution(
        scores,
        exercise.maxScore
      );

      return {
        exerciseId: exercise.id,
        title: exercise.title,
        submissionCount: submissions.length,
        averageScore,
        minScore: Math.min(...scores),
        maxScore: Math.max(...scores),
        maxPossibleScore: exercise.maxScore,
        completionRate: (submissions.length / 30) * 100, // TODO: Remplacer par nombre réel d'étudiants
        averageTimeSpent: 45, // TODO: Calculer à partir des données
        questionStats,
        gradeDistribution
      };

    } catch (error) {
      console.error('Erreur calcul statistiques:', error);
      return null;
    }
  }

  // ============ UTILITIES ============

  private static parseGeneratedResponse<T = any>(response: unknown): GeneratedApiResponse<T> {
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

  private static createEmptyStats(exercise: Exercise): ExerciseStats {
    return {
      exerciseId: exercise.id,
      title: exercise.title,
      submissionCount: 0,
      averageScore: 0,
      minScore: 0,
      maxScore: 0,
      maxPossibleScore: exercise.maxScore,
      completionRate: 0,
      averageTimeSpent: 0,
      questionStats: exercise.questions.map(q => ({
        questionId: q.id,
        text: q.text,
        type: q.type,
        averageScore: 0,
        correctRate: 0,
        commonWrongAnswers: []
      })),
      gradeDistribution: []
    };
  }

  private static analyzeCommonAnswers(answers: SubmissionAnswer[]): Array<{ answer: string; count: number }> {
    const answerCounts: Record<string, number> = {};

    answers.forEach(answer => {
      const key = answer.answer.trim().toLowerCase();
      answerCounts[key] = (answerCounts[key] || 0) + 1;
    });

    return Object.entries(answerCounts)
      .map(([answer, count]) => ({ answer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private static calculateGradeDistribution(scores: number[], maxScore: number): GradeDistribution[] {
    const ranges = [
      { min: 0, max: maxScore * 0.25, label: '0-25%' },
      { min: maxScore * 0.25, max: maxScore * 0.5, label: '25-50%' },
      { min: maxScore * 0.5, max: maxScore * 0.75, label: '50-75%' },
      { min: maxScore * 0.75, max: maxScore, label: '75-100%' }
    ];

    const distribution = ranges.map(range => {
      const count = scores.filter(score =>
        score >= range.min && score < range.max
      ).length;

      return {
        gradeRange: range.label,
        count,
        percentage: scores.length > 0 ? (count / scores.length) * 100 : 0
      };
    });

    return distribution;
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

      const status = getSubmissionStatus(exercise.dueDate);
      if (status === 'CLOSED') {
        return { canSubmit: false, reason: 'La date d\'échéance est dépassée', exercise };
      }

      const submissions = await this.getMySubmissions();
      const alreadySubmitted = submissions.some(
        (sub) => sub.exerciseId === exerciseId
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
}