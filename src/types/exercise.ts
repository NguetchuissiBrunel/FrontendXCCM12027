// src/types/exercise.ts - VERSION UNIFIÉE ET SIMPLIFIÉE
// ============ TYPES FONDAMENTAUX ============

/**
 * Types de questions supportés
 */
export type QuestionType = 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';

/**
 * Structure d'une question (format unifié)
 */
export interface Question {
  // Identifiants
  id: number;
  exerciseId: number;
  
  // Contenu
  text: string;                    // Énoncé de la question
  type: QuestionType;              // Type de question
  points: number;                  // Points attribués
  order: number;                   // Ordre d'affichage
  
  // Options spécifiques au type
  options?: string[];              // Pour MULTIPLE_CHOICE
  correctAnswer?: string;          // Réponse correcte (optionnelle)
  explanation?: string;            // Explication (feedback)
  
  // Données étudiant (remplies après soumission)
  studentAnswer?: string;
  studentPoints?: number;
}

/**
 * Structure d'un exercice (format unifié)
 */
export interface Exercise {
  // Identifiants
  id: number;
  courseId: number;
  
  // Métadonnées
  title: string;
  description: string;
  maxScore: number;
  dueDate?: string;
  courseTitle?: string;           // Titre du cours (optionnel)
  
  // Statut et dates
  status: 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  
  // Contenu
  questions: Question[];
  
  // Statistiques
  submissionCount?: number;
  averageScore?: number;
  completionRate?: number;
  pendingGrading?: number;
  
  // Métadonnées techniques
  version: string;
  
  // Données étudiant (pour les vues étudiant)
  studentScore?: number;
  alreadySubmitted?: boolean;
  canSubmit?: boolean;
  feedback?: string;
}

// ============ TYPES POUR LE CONTENU STRUCTURÉ ============

/**
 * Format structuré pour le contenu de l'exercice (stockage backend)
 */
export interface ExerciseContent {
  version: string;
  questions: Array<{
    id: number;
    text: string;
    type: QuestionType;
    points: number;
    options?: string[];
    correctAnswer?: string | null;
    explanation?: string;
    order: number;
  }>;
  metadata: {
    status: string;
    totalPoints: number;
    questionCount: number;
    types: QuestionType[];
    createdAt: string;
    updatedAt?: string;
  };
}

// ============ DTOs POUR L'API (TYPES DE REQUÊTE) ============

/**
 * Données pour créer un exercice
 */
export interface CreateExerciseDto {
  courseId: number;
  title: string;
  description: string;
  maxScore: number;
  dueDate?: string | null;
  questions: CreateQuestionDto[];
  publishImmediately?: boolean;
}

/**
 * Données pour mettre à jour un exercice
 */
export interface UpdateExerciseDto {
  title?: string;
  description?: string;
  maxScore?: number;
  dueDate?: string | null;
  questions?: UpdateQuestionDto[];
  status?: Exercise['status'];
}

/**
 * Données pour créer une question
 */
export interface CreateQuestionDto {
  text: string;
  type: QuestionType;
  points: number;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  order?: number;
}

/**
 * Données pour mettre à jour une question
 */
export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {
  id?: number;
}

/**
 * Données pour soumettre un exercice
 */
export interface SubmitExerciseRequest {
  submissionUrl?: string;
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}

// ============ TYPES POUR LES SOUMISSIONS ============

/**
 * Structure d'une soumission
 */
export interface Submission {
  // Identifiants
  id: number;
  exerciseId: number;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  
  // Données de soumission
  answers: SubmissionAnswer[];
  submittedAt: string;
  ipAddress?: string;
  userAgent?: string;
  
  // Notation
  score?: number;
  maxScore: number;
  feedback?: string;
  graded: boolean;
  gradedAt?: string;
  gradedBy?: string;
  
  // Métadonnées
  timeSpent?: number;
  lastModifiedAt?: string;
  
  // Données complémentaires
  submissionUrl?: string;
  exerciseTitle?: string;
}

/**
 * Réponse d'une question dans une soumission
 */
export interface SubmissionAnswer {
  id: number;
  questionId: number;
  answer: string;
  points?: number;
  feedback?: string;
  graderComment?: string;
  autoGraded?: boolean;
}

// ============ TYPES POUR LES STATISTIQUES ============

/**
 * Statistiques détaillées d'un exercice
 */
export interface ExerciseStats {
  exerciseId: number;
  title: string;
  submissionCount: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  maxPossibleScore: number;
  completionRate: number;
  averageTimeSpent: number;
  questionStats: QuestionStat[];
  gradeDistribution: GradeDistribution[];
}

/**
 * DTO simplifié pour les statistiques
 */
export interface ExerciseStatsDTO {
  exerciseId?: number;
  title?: string;
  submissionCount?: number;
  averageScore?: number;
  minScore?: number;
  maxScore?: number;
  maxPossibleScore?: number;
}

/**
 * Statistiques par question
 */
export interface QuestionStat {
  questionId: number;
  text: string;
  type: QuestionType;
  averageScore: number;
  correctRate: number;
  commonWrongAnswers: Array<{
    answer: string;
    count: number;
  }>;
}

/**
 * Distribution des notes
 */
export interface GradeDistribution {
  gradeRange: string;
  count: number;
  percentage: number;
}

// ============ RÉPONSES API UNIFIÉES ============

/**
 * Réponse API standardisée (remplace tous les ApiResponseXxx)
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
  timestamp: string;
}

/**
 * Réponse API paginée
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============ TYPES POUR LA VALIDATION ============

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

// ============ CONSTANTES ET UTILITAIRES ============

/**
 * Constantes pour les statuts d'exercice
 */
export const EXERCISE_STATUS = {
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ExerciseStatus = 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';


/**
 * Constantes pour les types de questions
 */
export const QUESTION_TYPES = {
  TEXT: 'TEXT',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  CODE: 'CODE',
} as const;

/**
 * Vérifie si un type est un QuestionType valide
 */
export function isQuestionType(type: string): type is QuestionType {
  return Object.values(QUESTION_TYPES).includes(type as QuestionType);
}

/**
 * Formate un type de question pour l'affichage
 */
export function formatQuestionType(type: QuestionType): string {
  const formats: Record<QuestionType, string> = {
    TEXT: 'Réponse texte',
    MULTIPLE_CHOICE: 'Choix multiple',
    CODE: 'Code'
  };
  return formats[type] || type;
}

/**
 * Convertit une date d'échéance en statut de soumission
 */
export function getSubmissionStatus(dueDate?: string): 'OPEN' | 'CLOSED' | 'NO_DUE_DATE' {
  if (!dueDate) return 'NO_DUE_DATE';
  
  const due = new Date(dueDate);
  const now = new Date();
  
  return now > due ? 'CLOSED' : 'OPEN';
}

// ============ TYPES POUR LA COMPATIBILITÉ (À DÉPRÉCIER) ============

/**
 * @deprecated Utiliser Question à la place
 * Pour compatibilité ascendante uniquement
 */
export interface LegacyQuestion extends Omit<Question, 'text' | 'type'> {
  question?: string;      // Ancien nom pour 'text'
  questionType?: QuestionType; // Ancien nom pour 'type'
  // ✅ AJOUTEZ CES LIGNES POUR RÉSOUDRE L'ERREUR :
  text?: string;          // Pour compatibilité
  type?: QuestionType;    // Pour compatibilité
}

/**
 * @deprecated Utiliser Exercise à la place
 * Pour compatibilité ascendante uniquement
 */
export interface LegacyExercise extends Omit<Exercise, 'submissionCount'> {
  submissionsCount?: number; // Ancien nom pour 'submissionCount'
  // ✅ AJOUTEZ CETTE LIGNE POUR RÉSOUDRE L'ERREUR :
  submissionCount?: number;  // Pour compatibilité
}

/**
 * Fonction de migration pour convertir les anciennes questions
 */
// Dans src/types/exercise.ts, modifiez la fonction migrateLegacyQuestion :

/**
 * Fonction de migration pour convertir les anciennes questions
 */
export function migrateLegacyQuestion(legacy: Partial<LegacyQuestion>): Question {
  // Maintenant legacy.text et legacy.type existent grâce à la correction ci-dessus
  return {
    id: legacy.id || 0,
    exerciseId: legacy.exerciseId || 0,
    text: legacy.text || legacy.question || '',      // ✅ legacy.text existe maintenant
    type: legacy.type || legacy.questionType || 'TEXT', // ✅ legacy.type existe maintenant
    points: legacy.points || 0,
    order: legacy.order || 0,
    options: legacy.options,
    correctAnswer: legacy.correctAnswer,
    explanation: legacy.explanation,
    studentAnswer: legacy.studentAnswer,
    studentPoints: legacy.studentPoints
  };
}

/**
 * Fonction de migration pour convertir les anciens exercices
 */
export function migrateLegacyExercise(legacy: Partial<LegacyExercise>): Exercise {
  const submissionCount = legacy.submissionsCount || legacy.submissionCount || 0;
  
  // Déterminer le statut - convertir 'DRAFT' en 'PUBLISHED'
  let status: ExerciseStatus = 'PUBLISHED';
  if (legacy.status && ['PUBLISHED', 'CLOSED', 'ARCHIVED'].includes(legacy.status)) {
    status = legacy.status as ExerciseStatus;
  }
  // Si legacy.status est 'DRAFT', on le garde comme 'PUBLISHED' (valeur par défaut)
  
  return {
    id: legacy.id || 0,
    courseId: legacy.courseId || 0,
    title: legacy.title || '',
    description: legacy.description || '',
    maxScore: legacy.maxScore || 0,
    dueDate: legacy.dueDate,
    courseTitle: legacy.courseTitle,
    status: status, // ⬅️ Utilise le statut converti
    createdAt: legacy.createdAt || new Date().toISOString(),
    updatedAt: legacy.updatedAt,
    publishedAt: legacy.publishedAt,
    questions: legacy.questions || [],
    submissionCount: submissionCount,
    averageScore: legacy.averageScore,
    completionRate: legacy.completionRate,
    pendingGrading: legacy.pendingGrading,
    version: legacy.version || '2.0',
    studentScore: legacy.studentScore,
    alreadySubmitted: legacy.alreadySubmitted,
    canSubmit: legacy.canSubmit,
    feedback: legacy.feedback
  };
}