// src/types/exercise.ts - VERSION COMPLÈTE ET CORRIGÉE
// ============ TYPES FONDAMENTAUX ============
export type QuestionType = 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';

export interface Question {
  id: number;
  exerciseId: number;
  text: string;
  type: QuestionType;
  points: number;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  order: number;
  
  // Propriétés pour compatibilité ascendante
  question?: string;
  questionType?: QuestionType;
  studentAnswer?: string;
  studentPoints?: number;
}

export interface Exercise {
  // Données principales
  id: number;
  courseId: number;
  title: string;
  description: string;
  maxScore: number;
  dueDate?: string;
  
  // Métadonnées
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  
  // Questions
  questions: Question[];
  
  // Statistiques
  submissionCount?: number;
  averageScore?: number;
  completionRate?: number;
  pendingGrading?: number;
  
  // Metadata technique
  version: string;
  
  // Propriétés pour compatibilité ascendante
  submissionsCount?: number;
  totalStudents?: number;
  canSubmit?: boolean;
  alreadySubmitted?: boolean;
  studentScore?: number;
  feedback?: string;
}

// ============ TYPES POUR LE CONTENU ============
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
    studentAnswer?: string;
    studentPoints?: number;
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

// ============ DTOs POUR L'API ============
export interface SubmitExerciseRequest {
  submissionUrl?: string;
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}

export interface CreateExerciseDto {
  courseId: number;
  title: string;
  description: string;
  maxScore: number;
  dueDate?: string;
  questions: CreateQuestionDto[];
  publishImmediately?: boolean;
}

export interface UpdateExerciseDto {
  title?: string;
  description?: string;
  maxScore?: number;
  dueDate?: string | null;
  questions?: UpdateQuestionDto[];
  status?: Exercise['status'];
}

export interface CreateQuestionDto {
  text: string;
  type: QuestionType;
  points: number;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  order?: number;
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {
  id?: number;
}

// ============ TYPES POUR LES SOUMISSIONS ============
export interface Submission {
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
  
  // Metadata
  timeSpent?: number;
  lastModifiedAt?: string;
  
  // Propriétés pour compatibilité
  submissionUrl?: string;
  exerciseTitle?: string;
}

export interface SubmissionAnswer {
  id: number;
  questionId: number;
  answer: string;
  points?: number;
  feedback?: string;
  graderComment?: string;
  autoGraded?: boolean;
}

// ============ TYPES ALIAS POUR COMPATIBILITÉ ============
export type CreateExerciseInput = CreateExerciseDto;
export type CreateQuestionInput = CreateQuestionDto;

// ============ RÉPONSES API ============
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

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============ TYPES POUR LES STATISTIQUES ============
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

export interface ExerciseStatsDTO {
  exerciseId?: number;
  title?: string;
  submissionCount?: number;
  averageScore?: number;
  minScore?: number;
  maxScore?: number;
  maxPossibleScore?: number;
}

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

export interface GradeDistribution {
  gradeRange: string;
  count: number;
  percentage: number;
}

// ============ TYPES POUR LA VALIDATION ============
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

// ============ CONSTANTES ============
export const EXERCISE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
} as const;

export const QUESTION_TYPES = {
  TEXT: 'TEXT',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  CODE: 'CODE',
} as const;