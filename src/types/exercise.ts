// src/types/exercise.ts
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
  submissionsCount?: number;
  averageScore?: number;
  totalStudents?: number;
  gradedCount?: number;
  pendingCount?: number; // Soumissions en attente de correction
}

export interface Question {
  id: number;
  exerciseId: number;
  question: string;
  questionType: 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
  points: number;
  options?: string[];
  correctAnswer?: string;
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
  submissionsCount?: number;
  averageScore?: number;
  totalStudents?: number;
  gradedCount?: number;
  pendingCount?: number; // Soumissions en attente de correction
}

export interface Answer {
  id: number;
  submissionId: number;
  questionId: number;
  answer: string;
  points: number;
}

export interface GradeSubmissionRequest {
  score: number;
  feedback?: string;
  answers?: Array<{
    questionId: number;
    points: number;
  }>;
}