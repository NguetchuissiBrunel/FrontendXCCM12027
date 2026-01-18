// src/types/exercise.ts - VERSION COMPLÈTE
export type QuestionType = 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';

// Interface complète pour Question
export interface Question {
  id: number;
  exerciseId: number;
  question: string;
  questionType: QuestionType;
  points: number;
  options?: string[];
  correctAnswer?: string;
  studentAnswer?: string;
  studentPoints?: number;
}

// Interface pour la création (sans id et exerciseId)
export interface CreateQuestionInput {
  question: string;
  questionType: QuestionType;
  points: number;
  options?: string[];
  correctAnswer?: string;
}

export interface ExerciseContent {
  version: string;
  questions: Array<{
    id: number;
    text: string;
    type: QuestionType;
    points: number;
    options?: string[];
    correctAnswer?: string | null;
    studentAnswer?: string;
    studentPoints?: number;
  }>;
  metadata: {
    status: 'PUBLISHED' | 'CLOSED';
    totalPoints: number;
    questionCount: number;
    types: QuestionType[];
    createdAt: string;
  };
}

export interface Exercise {
  // Données de base (de l'API)
  id: number;
  courseId: number;
  title: string;
  description: string;
  maxScore: number;
  dueDate: string;
  createdAt: string;
  
  // Données dérivées (calculées côté frontend)
  content: string; // JSON stringifié
  questions: Question[];
  status: 'PUBLISHED' | 'CLOSED'; // Seulement ces deux valeurs
  submissionsCount?: number;
  averageScore?: number;
  totalStudents?: number;
  canSubmit?: boolean;
  alreadySubmitted?: boolean;
  studentScore?: number;
  feedback?: string;
  // Champs optionnels pour l'UI
  updatedAt?: string;
  pendingCount?: number;
}

export interface CreateExerciseInput {
  title: string;
  description: string;
  maxScore: number;
  dueDate?: string;
  questions: CreateQuestionInput[];
}

export interface UpdateExerciseInput {
  title?: string;
  description?: string;
  maxScore?: number;
  dueDate?: string;
  questions?: CreateQuestionInput[];
}

export interface Submission {
  id: number;
  exerciseId: number;
  studentId: string;
  studentName: string;
  score?: number;
  maxScore: number;
  feedback?: string;
  submissionUrl?: string;
  submittedAt: string;
  graded: boolean;
  answers?: Array<{
    id: number;
    questionId: number;
    answer: string;
    points?: number;
  }>;
}

export interface ApiResponse<T> {
  code?: number;
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  error?: string;
  timestamp?: string;
}

export interface SubmitExerciseRequest {
  submissionUrl?: string;
  answers?: Array<{
    questionId: number;
    answer: string;
  }>;
}

export interface GradeSubmissionRequest {
  score: number;
  feedback?: string;
}