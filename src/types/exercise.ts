// src/types/exercise.ts - VERSION FINALE
export interface ApiResponse<T> {
  code: number;
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
  error?: string;
  timestamp: string;
}

// ============ INTERFACES PRINCIPALES ============
export interface Exercise {
  id: number;
  courseId: number;
  title: string;
  description: string;
  maxScore: number;
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
  // AJOUTER CETTE LIGNE : status est maintenant une propriété obligatoire
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  questions?: Question[];
  content?: any;
  
  // Statistiques additionnelles
  submissionsCount?: number;
  averageScore?: number;
  totalStudents?: number;
  gradedCount?: number;
  pendingCount?: number;
  
  // Pour l'étudiant
  canSubmit?: boolean;
  alreadySubmitted?: boolean;
  studentScore?: number;
  
  // Informations additionnelles
  courseTitle?: string;
  courseCategory?: string;
}

export interface Question {
  id: number;
  exerciseId: number;
  question: string;
  questionType: 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
  points: number;
  options?: string[];
  correctAnswer?: string;
  
  // Pour l'étudiant
  studentAnswer?: string;
  studentPoints?: number;
  
  // Pour la soumission
  answer?: string;
}

export interface Submission {
  id: number;
  exerciseId: number;
  exerciseTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  feedback?: string;
  submissionUrl: string;
  submittedAt: string;
  graded: boolean;
  answers?: Answer[];
  courseId?: number;
  courseTitle?: string;
  studentEmail?: string;
  studentAvatar?: string;
}

export interface Answer {
  id: number;
  submissionId: number;
  questionId: number;
  question?: string;
  questionType?: 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
  answer: string;
  points: number;
  maxPoints: number;
  feedback?: string;
}

// ============ REQUÊTES ============

export interface CreateExerciseRequest {
  courseId: number;
  title: string;
  description?: string;
  maxScore: number;
  dueDate?: string;
  questions?: Question[];
}

export interface UpdateExerciseRequest {
  title?: string;
  description?: string;
  maxScore?: number;
  dueDate?: string;
  questions?: Question[];
}

export interface GradeSubmissionRequest {
  score: number;
  feedback?: string;
  answers?: Array<{
    questionId: number;
    points: number;
    feedback?: string;
  }>;
}

export interface SubmitExerciseRequest {
  submissionUrl?: string;
  answers?: Array<{
    questionId: number;
    answer: string;
  }>;
}

// ============ TYPES UTILITAIRES ============

export type QuestionType = 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';

export interface ExerciseFormData {
  title: string;
  description: string;
  maxScore: number;
  dueDate: string;
  questions: Array<{
    id?: number;
    question: string;
    questionType: QuestionType;
    points: number;
    options: string[];
    correctAnswer?: string;
  }>;
}