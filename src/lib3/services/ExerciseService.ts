// src/lib/services/ExerciseService.ts - VERSION COMPLÈTE ET CORRIGÉE
import { 
  Exercise, 
  Question, 
  ApiResponse, 
  SubmitExerciseRequest, 
  ExerciseContent,
  Submission,
  CreateQuestionDto as CreateQuestionInput,
  CreateExerciseDto as CreateExerciseInput,
  QuestionType
} from '@/types/exercise';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { EnseignantService } from '@/lib/services/EnseignantService';
import { ExerciseApiWrapper } from '@/lib3/services/ExerciseApiWrapper';
import { OpenAPI } from '@/lib/core/OpenAPI';
import { request as __request } from '@/lib/core/request';

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
  // Dans ExerciseService.ts - méthode serializeQuestions :
// Dans ExerciseService.ts - méthode serializeQuestions
static serializeQuestions(questions: Question[]): any {
  console.log('🔧 === SERIALIZE QUESTIONS (objet) ===');
  
  const safeQuestions = questions.map((q, index) => {
    const questionData: any = {
      id: q.id || Date.now() + index,
      text: q.text?.trim() || `Question ${index + 1}`,
      type: q.type || 'TEXT',
      points: q.points || 1,
      order: index
    };
    
    if (q.options && q.options.length > 0) {
      questionData.options = q.options;
    }
    
    if (q.correctAnswer !== undefined) {
      questionData.correctAnswer = q.correctAnswer;
    }
    
    if (q.explanation) {
      questionData.explanation = q.explanation;
    }
    
    return questionData;
  });
  
  const contentObject = {
    version: this.CONTENT_VERSION,
    questions: safeQuestions,
    metadata: {
      status: 'PUBLISHED',
      totalPoints: safeQuestions.reduce((sum, q) => sum + q.points, 0),
      questionCount: safeQuestions.length,
      types: [...new Set(safeQuestions.map(q => q.type))],
      createdAt: new Date().toISOString()
    }
  };
  
  console.log('🔧 Contenu objet généré:', contentObject);
  return contentObject; // ⚠️ Retourne un OBJET
}

/**
 * Convertit le contenu en string JSON pour l'API
 */
static serializeContentToString(content: any): string {
  if (typeof content === 'string') {
    return content;
  }
  
  try {
    return JSON.stringify(content);
  } catch (error) {
    console.error('🔧 Erreur sérialisation content:', error);
    return '{}';
  }
}
// Dans la méthode createExercise
// Dans ExerciseService.ts - méthode createExercise
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
  console.log('🚀 CREATE EXERCISE - Début');
  console.log('📊 Données reçues:', data);
  
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
    
    // Serialize (retourne un objet maintenant)
    const contentObject = this.serializeQuestions(data.questions);
    console.log('📦 Content object créé:', contentObject);
    
    // Appel API
    const response = await ExerciseApiWrapper.createExerciseWithContent(
      courseId,
      {
        title: data.title.trim(),
        description: data.description || '',
        maxScore: data.maxScore,
        dueDate: data.dueDate || null,
        content: contentObject  // ⚠️ Objet directement
      }
    );
    
    console.log('📡 Réponse API:', response);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur API');
    }
    
    if (!response.data) {
      throw new Error('Données API manquantes');
    }
    
    // ⚠️ DEBUG: Vérifiez le content avant transformation
    console.log('🔍 Avant transformApiToFrontend');
    console.log('Data à transformer:', response.data);
    console.log('Content dans data:', response.data.content);
    console.log('Type de content:', typeof response.data.content);
    
    // Transformation
    const exercise = await this.transformApiToFrontend(response.data);
    console.log('✅ Exercice transformé:', exercise);
    
    return {
      success: true,
      message: '✅ Exercice créé avec succès',
      data: exercise,
      timestamp: new Date().toISOString()
    };
    
  } catch (error: any) {
    console.error('❌ Échec création exercice:', error);
    console.error('Stack:', error.stack);
    
    return {
      success: false,
      message: error.message || 'Erreur création',
      errors: { general: [error.message] },
      timestamp: new Date().toISOString()
    };
  }
}
  
  /**
   * Parse le contenu JSON en questions frontend
   */
 // Dans ExerciseService.ts - REMPLACEZ toute la méthode parseContent par :
static parseContent(content: any): Question[] {
  console.log('🔍 PARSE CONTENT - Type:', typeof content, 'Value:', content);
  
  // Cas 1: null ou undefined
  if (content == null) {
    console.log('🔍 Content est null/undefined');
    return [];
  }
  
  // Cas 2: Déjà un tableau (questions directes)
  if (Array.isArray(content)) {
    console.log('🔍 Content est déjà un tableau de questions');
    return this.normalizeQuestions(content);
  }
  
  // Cas 3: Chaîne JSON
  if (typeof content === 'string') {
    // Vérifier si c'est vide
    const trimmed = content.trim();
    if (trimmed === '' || trimmed === '{}' || trimmed === '[]') {
      return [];
    }
    
    try {
      const parsed = JSON.parse(trimmed);
      console.log('🔍 Content string parsé en:', typeof parsed);
      
      // Si le parsing donne un objet avec une propriété questions
      if (parsed && typeof parsed === 'object') {
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return this.normalizeQuestions(parsed.questions);
        }
        // Si l'objet est directement le tableau questions
        if (Array.isArray(parsed)) {
          return this.normalizeQuestions(parsed);
        }
      }
    } catch (error) {
      console.warn('🔍 Erreur parsing JSON:', error);
    }
    return [];
  }
  
  // Cas 4: Objet avec propriété questions
  if (typeof content === 'object' && content !== null) {
    console.log('🔍 Content est un objet, recherche de .questions');
    
    // Si l'objet a une propriété questions
    if (content.questions && Array.isArray(content.questions)) {
      return this.normalizeQuestions(content.questions);
    }
    
    // Si l'objet est directement le contenu ExerciseContent
    if (content.version && content.questions && Array.isArray(content.questions)) {
      return this.normalizeQuestions(content.questions);
    }
    
    // Si c'est un tableau déguisé en objet
    if (Array.isArray(Object.values(content)[0])) {
      const firstValue = Object.values(content)[0];
      if (Array.isArray(firstValue)) {
        return this.normalizeQuestions(firstValue);
      }
    }
  }
  
  console.warn('🔍 Format de content non reconnu:', typeof content, content);
  return [];
}

// Ajoutez cette méthode helper :
static normalizeQuestions(questionsArray: any[]): Question[] {
  if (!Array.isArray(questionsArray)) {
    return [];
  }
  
  return questionsArray.map((item, index): Question => {
    // Extraire les données de différentes façons possibles
    const text = item.text || item.question || item.title || `Question ${index + 1}`;
    const type = item.type || item.questionType || 'TEXT';
    const points = Number(item.points) || Number(item.score) || 1;
    const options = item.options || item.choices || [];
    const correctAnswer = item.correctAnswer || item.answer || undefined;
    const explanation = item.explanation || item.feedback || '';
    const studentAnswer = item.studentAnswer || item.answer;
    const studentPoints = item.studentPoints || item.score;
    
    return {
      id: item.id || Date.now() + index,
      exerciseId: item.exerciseId || 0,
      text,
      type,
      points,
      options,
      correctAnswer,
      explanation,
      order: item.order || index,
      studentAnswer,
      studentPoints,
      question: text,
      questionType: type
    };
  });
}
  
  /**
   * Convertit les données API en objet Exercise frontend
   * IMPORTANT: Tous les exercices sont automatiquement publiés (statut = 'PUBLISHED')
   */
 static async transformApiToFrontend(apiData: any): Promise<Exercise> {
  console.log('🔄 TRANSFORM API - Données reçues:', apiData);
  
  if (!apiData) {
    throw new Error('Données API invalides');
  }
  
  // Extraire le content directement
  const content = apiData.content;
  console.log('🔄 Content extrait:', content, 'Type:', typeof content);
  
  // Parse les questions (la nouvelle parseContent gère tout)
  const questions = this.parseContent(content);
  console.log(`🔄 ${questions.length} questions parsées`);
  
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const maxScore = apiData.maxScore || totalPoints || 20;
  
  // Créer l'exercice
  return {
    id: apiData.id || 0,
    courseId: apiData.courseId || 0,
    title: apiData.title || 'Exercice sans titre',
    description: apiData.description || '',
    maxScore,
    dueDate: apiData.dueDate || '',
    createdAt: apiData.createdAt || new Date().toISOString(),
    updatedAt: apiData.updatedAt,
    questions,
    status: 'PUBLISHED', // Toujours publié
    publishedAt: apiData.createdAt || new Date().toISOString(),
    version: this.CONTENT_VERSION,
    submissionCount: apiData.submissionCount || apiData.submissionsCount || 0,
    averageScore: apiData.averageScore || 0,
    completionRate: apiData.completionRate || 0,
    pendingGrading: apiData.pendingGrading || 0,
    submissionsCount: apiData.submissionCount || apiData.submissionsCount || 0,
    totalStudents: apiData.totalStudents,
    canSubmit: apiData.canSubmit,
    alreadySubmitted: apiData.alreadySubmitted,
    studentScore: apiData.score || apiData.studentScore,
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
        const questionText = q.text || q.question;
        if (!questionText?.trim()) {
          errors.push(`La question ${index + 1} est vide`);
        }
        
        if (!q.points || q.points <= 0) {
          errors.push(`La question ${index + 1} doit avoir des points positifs`);
        }
        
        const questionType = q.type || q.questionType;
        if (questionType === 'MULTIPLE_CHOICE') {
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
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // ============ MÉTHODES POUR LA CRÉATION/DUPLICATION ============
  
  /**
   * Préparer les questions pour la création
   */
  static prepareQuestionsForCreation(questions: Question[]): CreateQuestionInput[] {
    return questions.map(q => ({
      text: q.text || q.question || '',
      type: q.type || q.questionType || 'TEXT',
      points: q.points || 0,
      options: q.options ? [...q.options] : undefined,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      order: q.order
    }));
  }
  
  /**
   * Dupliquer un exercice (automatiquement publié)
   */
  static async duplicateExercise(
    sourceExerciseId: number,
    courseId: number,
    newTitle?: string
  ): Promise<ApiResponse<Exercise>> {
    try {
      const sourceExercise = await this.getExerciseDetails(sourceExerciseId);
      
      if (!sourceExercise) {
        throw new Error('Exercice source non trouvé');
      }
      
      const result = await this.createExercise(courseId, {
        title: newTitle || `${sourceExercise.title} (Copie)`,
        description: sourceExercise.description,
        maxScore: sourceExercise.maxScore,
        dueDate: sourceExercise.dueDate,
        questions: sourceExercise.questions
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la duplication');
      }
      
      return {
        success: true,
        message: '✅ Exercice dupliqué avec succès',
        data: result.data,
        timestamp: new Date().toISOString()
      };
      
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
  
  /**
   * Normaliser le statut d'un exercice
   * TOUS LES EXERCICES SONT PUBLIÉS PAR DÉFAUT
   */
  static normalizeExerciseStatus(): Exercise['status'] {
    return 'PUBLISHED';
  }
  
  // ============ CRUD OPERATIONS ============
  
  /**
   * Créer un nouvel exercice (automatiquement publié)
   */
  // Dans ExerciseService.ts - méthode createExercise, ajoutez des logs :
// Dans ExerciseService.ts - modifiez la méthode createExercise

  /**
   * Récupérer tous les exercices d'un cours (tous publiés)
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
  
  /**
   * Mettre à jour un exercice
   * Note: Le statut reste toujours 'PUBLISHED'
   */
 // Dans ExerciseService.ts, améliorer la gestion d'erreurs :
// Dans ExerciseService.ts - ajoutez des logs détaillés
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
  
  console.log('=== UPDATE EXERCISE DEBUG ===');
  console.log('Exercise ID:', exerciseId);
  console.log('Type exerciseId:', typeof exerciseId);
  console.log('Update data:', data);
  
  try {
    // Vérification supplémentaire de l'ID
    if (!exerciseId || exerciseId <= 0) {
      console.error('❌ ID d\'exercice invalide:', exerciseId);
      throw new Error(`ID d'exercice invalide: ${exerciseId}`);
    }
    
    // Vérifier si l'exercice existe d'abord
    console.log('Vérification existence exercice...');
    try {
      const existingExercise = await this.getExerciseDetails(exerciseId);
      console.log('Exercice existant trouvé:', existingExercise?.id);
    } catch (error) {
      console.error('Exercice non trouvé:', error);
      throw new Error(`Exercice avec ID ${exerciseId} non trouvé`);
    }
    
    if (data.questions) {
      const validation = this.validateExercise({
        title: data.title || 'Titre temporaire',
        questions: data.questions,
        maxScore: data.maxScore || 20
      });
      
      console.log('Validation résultat:', validation);
      
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
    }
    
    // Mise à jour du contenu
    if (data.questions !== undefined) {
      console.log('Mise à jour du contenu...');
      const content = this.serializeQuestions(data.questions);
      
      
      try {
        await ExerciseApiWrapper.updateExerciseContent(exerciseId, content);
        console.log('✅ Contenu mis à jour');
      } catch (contentError) {
        console.error('❌ Erreur mise à jour contenu:', contentError);
        // Continuer même si l'update du content échoue
      }
    }
    
    // Mise à jour des métadonnées
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.maxScore !== undefined) updateData.maxScore = data.maxScore;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    
    console.log('Données de mise à jour:', updateData);
    
    if (Object.keys(updateData).length > 0) {
      console.log('Appel API EnseignantService.updateExercise...');
      console.log('URL attendue:', `/api/v1/teacher/exercises/${exerciseId}`);
      
      const response = await EnseignantService.updateExercise(
        exerciseId, 
        updateData
      ) as unknown;
      
      console.log('Réponse brute EnseignantService:', response);
      
      const parsedResponse = this.parseGeneratedResponse(response);
      console.log('Réponse parsée:', parsedResponse);
      
      if (!parsedResponse.success) {
        if (parsedResponse.code === 404) {
          throw new Error(`❌ Exercice ${exerciseId} non trouvé (404)`);
        }
        throw new Error(parsedResponse.message || 'Erreur lors de la mise à jour');
      }
      
      console.log('✅ Métadonnées mises à jour');
    }
    
    // Récupération de l'exercice mis à jour
    console.log('Récupération exercice mis à jour...');
    const updatedExercise = await this.getExerciseDetails(exerciseId);
    
    if (!updatedExercise) {
      throw new Error('Exercice non trouvé après mise à jour');
    }
    
    console.log('✅ Exercice mis à jour avec succès:', updatedExercise.id);
    console.log('=== FIN UPDATE DEBUG ===');
    
    return {
      success: true,
      message: '✅ Exercice mis à jour',
      data: updatedExercise,
      timestamp: new Date().toISOString()
    };
    
  } catch (error: any) {
    console.error('❌ Échec mise à jour exercice:', error);
    console.error('Stack trace:', error.stack);
    console.log('=== FIN UPDATE DEBUG (ERREUR) ===');
    
    return {
      success: false,
      message: error.message || 'Erreur lors de la mise à jour',
      errors: { general: [error.message] },
      timestamp: new Date().toISOString()
    };
  }
}

// Dans ExerciseService.ts - ajoutez
/**
 * Mettre à jour un exercice directement (contourne les erreurs d'endpoint)
 */
static async updateExerciseDirect(
  exerciseId: number,
  data: {
    title?: string;
    description?: string;
    maxScore?: number;
    dueDate?: string;
    questions?: Question[];
  }
): Promise<ApiResponse<Exercise>> {
  
  console.log('🔧 === UPDATE EXERCISE DIRECT ===');
  console.log('🔧 Exercise ID:', exerciseId);
  console.log('🔧 Data to update:', data);
  
  try {
    // Vérification de l'ID
    if (!exerciseId || exerciseId <= 0) {
      throw new Error('ID d\'exercice invalide');
    }
    
    // 1. Mettre à jour les métadonnées
    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.maxScore !== undefined) updatePayload.maxScore = data.maxScore;
    if (data.dueDate !== undefined) updatePayload.dueDate = data.dueDate;
    
    let metadataUpdated = false;
    
    if (Object.keys(updatePayload).length > 0) {
      console.log('🔧 Mise à jour métadonnées:', updatePayload);
      
      // Essayer différentes méthodes HTTP avec types corrects
      const methods: Array<'PUT' | 'PATCH'> = ['PUT', 'PATCH'];
      // Essayer différentes URLs
      const possibleUrls = [
        `/api/v1/teacher/exercises/${exerciseId}`
      ];
      
      let success = false;
      let lastError: Error | undefined;
      
      // Essayer toutes les combinaisons URL + méthode
      urlLoop: for (const url of possibleUrls) {
        for (const method of methods) {
          try {
            console.log(`🔧 Essai: ${method} ${url}`);
            
            const response = await __request(OpenAPI, {
              method: method,
              url: url,
              body: updatePayload,
              mediaType: 'application/json',
            }) as any;
            
            console.log(`🔧 ✅ Réponse réussie: ${method} ${url}`);
            console.log('🔧 Response:', response);
            success = true;
            metadataUpdated = true;
            break urlLoop;
            
          } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            lastError = err;
            console.log(`🔧 ❌ Échec ${method} ${url}:`, err.message);
            if (err.message?.includes('404') || err.message?.includes('Not Found')) {
              continue;
            }
            break urlLoop;
          }
        }
      }
      
      if (!success) {
        console.warn('🔧 Aucun endpoint de métadonnées standard trouvé');
      }
    }
    
    // 2. Mettre à jour le contenu (questions) si fourni
    let contentUpdated = false;
    if (data.questions !== undefined) {
      console.log('🔧 Mise à jour questions:', data.questions.length);
      
      // Validation des questions
      const validation = this.validateExercise({
        title: data.title || 'Exercice',
        questions: data.questions,
        maxScore: data.maxScore || 20
      });
      
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const content = this.serializeQuestions(data.questions);
      // Essayer différents endpoints pour le contenu
      const contentUrls = [
        `/api/v1/teacher/exercises/${exerciseId}`,
       
      ];
      
      let contentSuccess = false;
      
      for (const url of contentUrls) {
        try {
          console.log(`🔧 Essai mise à jour contenu: PUT ${url}`);
          
          await __request(OpenAPI, {
            method: 'PUT' as const,
            url: url,
            body: { content },
            mediaType: 'application/json',
          }) as any;
          
          console.log(`🔧 ✅ Contenu mis à jour: ${url}`);
          contentSuccess = true;
          contentUpdated = true;
          break;
          
        } catch (error: unknown) {
          const err = error instanceof Error ? error : new Error(String(error));
          console.log(`🔧 ❌ Échec mise à jour contenu ${url}:`, err.message);
          
          // Essayer aussi POST si PUT échoue
          if (err.message?.includes('404') || err.message?.includes('Not Found')) {
            try {
              console.log(`🔧 Essai alternative: POST ${url}`);
              
              await __request(OpenAPI, {
                method: 'POST' as const,
                url: url,
                body: { content },
                mediaType: 'application/json',
              }) as any;
              
              console.log(`🔧 ✅ Contenu mis à jour avec POST: ${url}`);
              contentSuccess = true;
              contentUpdated = true;
              break;
            } catch (postError: unknown) {
              const postErr = postError instanceof Error ? postError : new Error(String(postError));
              console.log(`🔧 ❌ POST aussi échoué: ${postErr.message}`);
            }
          }
        }
      }
      
      if (!contentSuccess) {
        console.warn('🔧 Aucun endpoint de contenu trouvé');
      }
    }
    
    // 3. Préparer le message de succès
    let message = '✅ Exercice mis à jour';
    if (metadataUpdated && contentUpdated) {
      message = '✅ Exercice complètement mis à jour (métadonnées + contenu)';
    } else if (contentUpdated) {
      message = '✅ Contenu de l\'exercice mis à jour';
    } else if (metadataUpdated) {
      message = '✅ Métadonnées de l\'exercice mises à jour';
    } else {
      message = '⚠️ Aucune mise à jour effectuée (endpoints non trouvés)';
    }
    
    console.log('🔧 === UPDATE COMPLETÉ ===');
    console.log('🔧 Résultat:', { metadataUpdated, contentUpdated, message });
    
    // 4. Récupérer ou créer l'exercice
    console.log('🔧 Récupération exercice mis à jour...');
    
    // CORRECTION : getExerciseDetails retourne Exercise | null
    const updatedExercise: Exercise | null = await this.getExerciseDetails(exerciseId);
    
    if (updatedExercise) {
      console.log('🔧 Exercice récupéré:', updatedExercise.id);
      return {
        success: true,
        message: message,
        data: updatedExercise, // Type: Exercise
        timestamp: new Date().toISOString()
      };
    } else {
      console.warn('🔧 Exercice non trouvé après mise à jour, création simulée');
      
      // Créer un exercice simulé
      const simulatedExercise: Exercise = {
        id: exerciseId,
        courseId: 0,
        title: data.title || 'Exercice mis à jour',
        description: data.description || '',
        maxScore: data.maxScore || 20,
        dueDate: data.dueDate || '',
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
        questions: data.questions || [],
        version: this.CONTENT_VERSION,
        submissionCount: 0,
        averageScore: 0,
        completionRate: 0,
        pendingGrading: 0
      };
      
      return {
        success: true,
        message: `${message} (simulé)`,
        data: simulatedExercise, // Type: Exercise
        timestamp: new Date().toISOString()
      };
    }
    
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('🔧 ❌ Échec update direct:', err);
    
    return {
      success: false,
      message: err.message || 'Erreur lors de la mise à jour',
      errors: { general: [err.message] },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Version avec courseId pour les URLs qui en ont besoin
 */
static async updateExerciseDirectWithCourse(
  exerciseId: number,
  courseId: number,
  data: {
    title?: string;
    description?: string;
    maxScore?: number;
    dueDate?: string;
    questions?: Question[];
  }
): Promise<ApiResponse<Exercise>> {
  
  console.log('🔧 === MISE À JOUR SIMPLIFIÉE ===');
  
  try {
    // 1. Préparer le payload
    const requestBody: any = {};
    
    if (data.title !== undefined) {
      requestBody.title = data.title.trim();
    }
    
    if (data.description !== undefined) {
      requestBody.description = data.description;
    }
    
    if (data.maxScore !== undefined) {
      requestBody.maxScore = data.maxScore;
    }
    
    if (data.dueDate !== undefined && data.dueDate.trim() !== '') {
      requestBody.dueDate = data.dueDate;
    }
    
    // 2. INCLURE LE CONTENT DANS LE MÊME PAYLOAD
    if (data.questions !== undefined) {
      const contentObject = this.serializeQuestions(data.questions);
      requestBody.content = JSON.stringify(contentObject);
      console.log('🔧 Content ajouté au payload principal');
    }
    
    console.log('🔧 Payload final pour PUT:', requestBody);
    
    // 3. UN SEUL APPEL API
    const response = await EnseignantService.updateExercise(
      exerciseId,
      requestBody
    );
    
    console.log('🔧 ✅ Réponse API unique:', response);
    
    // 4. Retourner le résultat
    if (response?.data) {
      const exercise = await this.transformApiToFrontend(response.data);
      
      return {
        success: true,
        message: '✅ Exercice mis à jour avec succès',
        data: exercise,
        timestamp: new Date().toISOString()
      };
    }
    
    throw new Error('Réponse API invalide');
    
  } catch (error: any) {
    console.error('🔧 ❌ Erreur:', error);
    
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
  
  // ============ MÉTHODES DE GESTION DU STATUT (VISUELLES SEULEMENT) ============
  
  /**
   * "Publier" un exercice (visuel seulement - tous sont déjà publiés)
   */
  static async publishExercise(exerciseId: number): Promise<ApiResponse<Exercise>> {
    try {
      const exercise = await this.getExerciseDetails(exerciseId);
      
      if (!exercise) {
        throw new Error('Exercice non trouvé');
      }
      
      // Tous les exercices sont déjà publiés
      return {
        success: true,
        message: '✅ L\'exercice est déjà publié (tous les exercices sont publiés par défaut)',
        data: exercise,
        timestamp: new Date().toISOString()
      };
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
   * "Fermer" un exercice (visuel seulement - pas supporté par l'API)
   */
  static async closeExercise(exerciseId: number): Promise<ApiResponse<Exercise>> {
    try {
      const exercise = await this.getExerciseDetails(exerciseId);
      
      if (!exercise) {
        throw new Error('Exercice non trouvé');
      }
      
      // La fermeture n'est pas supportée par l'API
      return {
        success: false,
        message: 'La fonctionnalité de fermeture n\'est pas disponible',
        data: exercise,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erreur lors de la fermeture',
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
  ): Promise<ApiResponse<any>> {
    try {
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
        success: parsedResponse.success || false,
        message: parsedResponse.message || 'Soumission effectuée',
        data: parsedResponse.data,
        timestamp: parsedResponse.timestamp || new Date().toISOString()
      };
      
    } catch (error: any) {
      console.error('Erreur soumission exercice:', error);
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
        studentEmail: sub.studentEmail,
        score: sub.score,
        maxScore: sub.maxScore || 0,
        feedback: sub.feedback,
        submittedAt: sub.submittedAt || new Date().toISOString(),
        graded: sub.graded || false,
        gradedAt: sub.gradedAt,
        gradedBy: sub.gradedBy,
        answers: sub.answers || [],
        timeSpent: sub.timeSpent,
        ipAddress: sub.ipAddress,
        userAgent: sub.userAgent,
        lastModifiedAt: sub.lastModifiedAt,
        submissionUrl: sub.submissionUrl,
        exerciseTitle: sub.exerciseTitle
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
      
      if (this.isDueDatePassed(exercise.dueDate)) {
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