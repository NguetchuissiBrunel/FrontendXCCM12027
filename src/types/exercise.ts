// src/types/exercise.ts - Version complètement mise à jour
export interface ApiResponse<T> {
  code: number;
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
  error?: string;
  timestamp: string;
}

// ============ INTERFACES DE BASE ============

export interface Exercise {
  id: number;
  courseId: number;
  title: string;
  description: string;
  maxScore: number;
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  questions?: Question[];
  // Statistiques additionnelles (pour le dashboard)
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
  // Champs additionnels
  courseId?: number;
  courseTitle?: string;
  // Pour l'enseignant
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

// ============ REQUÊTES API ============

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
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}

export interface CreateExerciseRequest {
  courseId: number;
  title: string;
  description?: string;
  maxScore: number;
  dueDate?: string;
  questions?: Array<{
    question: string;
    questionType: 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
    points: number;
    options?: string[];
    correctAnswer?: string;
  }>;
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED'; // Ajoutez 'CLOSED' ici
  }

export interface UpdateExerciseRequest {
  title?: string;
  description?: string;
  maxScore?: number;
  dueDate?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  questions?: Array<{
    id?: number;
    question: string;
    questionType: 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
    points: number;
    options?: string[];
    correctAnswer?: string;
  }>;
}

// ============ RÉPONSES API SPÉCIFIQUES ============

// Réponse pour GET /api/v1/exercises/{exerciseId}
export interface GetExerciseResponse {
  id: number;
  courseId: number;
  title: string;
  description: string;
  maxScore: number;
  dueDate: string;
  createdAt: string;
}

// Réponse pour POST /api/v1/exercises/{exerciseId}/submit
export interface SubmitExerciseResponse {
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
}

// Réponse pour GET /api/v1/exercises/my-submissions
export interface MySubmissionsResponse {
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
}

// Réponse pour GET /api/v1/exercises/course/{courseId}
export interface CourseExercisesResponse {
  id: number;
  courseId: number;
  title: string;
  description: string;
  maxScore: number;
  dueDate: string;
  createdAt: string;
}

// Réponse pour PUT /api/v1/teacher/submissions/{submissionId}/grade
export interface GradeSubmissionResponse {
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
}

// Réponse pour PUT /api/v1/teacher/exercises/{exerciseId}
export interface UpdateExerciseResponse {
  id: number;
  courseId: number;
  title: string;
  description: string;
  maxScore: number;
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
}

// Réponse pour DELETE /api/v1/teacher/exercises/{exerciseId}
export interface DeleteExerciseResponse {
  // Vide en cas de succès
}

// ============ INTERFACES POUR LE DASHBOARD ============

export interface ExerciseStats {
  exerciseId: number;
  title: string;
  submissionCount: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  maxPossibleScore: number;
  pendingCount: number;
  gradedCount: number;
}

export interface PerformanceDistribution {
  excellent: number; // 90-100%
  good: number;      // 70-89%
  average: number;   // 50-69%
  poor: number;      // 0-49%
  total: number;
}

// ============ TYPES POUR LES FILTRES ET OPTIONS ============

export type ExerciseStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ALL';
export type QuestionType = 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
export type SubmissionStatus = 'ALL' | 'PENDING' | 'GRADED';

export interface ExerciseFilter {
  status?: ExerciseStatus;
  courseId?: number;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export interface SubmissionFilter {
  status?: SubmissionStatus;
  studentName?: string;
  dateFrom?: string;
  dateTo?: string;
  minScore?: number;
  maxScore?: number;
}

// ============ INTERFACES POUR LES FORMULAIRES ============

export interface ExerciseFormData {
  title: string;
  description: string;
  maxScore: number;
  dueDate: string;
  status: 'DRAFT' | 'PUBLISHED';
  questions: Array<{
    id?: number;
    question: string;
    questionType: QuestionType;
    points: number;
    options: string[];
    correctAnswer?: string;
  }>;
}

export interface GradeFormData {
  score: number;
  feedback: string;
  answers: Array<{
    questionId: number;
    points: number;
    feedback?: string;
  }>;
}

// ============ TYPES UTILITAIRES ============

export type ExerciseWithStats = Exercise & {
  stats?: ExerciseStats;
  pendingSubmissions?: number;
  studentProgress?: number;
};

export type SubmissionWithDetails = Submission & {
  exercise?: Exercise;
  student?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
};

// ============ ÉNUMÉRATIONS ============

export enum ExerciseDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum GradingStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

// ============ TYPES POUR LES NOTIFICATIONS ============

export interface ExerciseNotification {
  id: number;
  type: 'NEW_EXERCISE' | 'DEADLINE_REMINDER' | 'SUBMISSION_GRADED' | 'NEW_SUBMISSION';
  title: string;
  message: string;
  exerciseId?: number;
  courseId?: number;
  submissionId?: number;
  read: boolean;
  createdAt: string;
}

// ============ INTERFACES POUR LES RÉSUMÉS ============

export interface ExerciseSummary {
  totalExercises: number;
  publishedExercises: number;
  draftExercises: number;
  closedExercises: number;
  totalSubmissions: number;
  pendingGrading: number;
  averageScore: number;
  completionRate: number;
}

export interface StudentExerciseProgress {
  exerciseId: number;
  exerciseTitle: string;
  submitted: boolean;
  score?: number;
  maxScore: number;
  submittedAt?: string;
  graded: boolean;
  feedback?: string;
}