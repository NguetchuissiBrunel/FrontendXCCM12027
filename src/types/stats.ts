// src/types/stats.ts

export interface ExerciseStat {
  exerciseId: number;
  title: string;
  submissionCount: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  maxPossibleScore: number;
}

export interface PerformanceDistribution {
  excellent: number;
  good: number;
  average: number;
  poor: number;
  total: number;
}

// Dans src/types/stats.ts - Ajoutez cette interface
export interface CourseStats {
  courseId: number;
  courseTitle: string;
  courseCategory: string;
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  participationRate: number;
  averageProgress: number;
  totalExercises: number;
  completedStudents: number;
  exerciseStats: Array<{
    exerciseId: number;
    title: string;
    submissionCount: number;
    averageScore: number;
    minScore: number;
    maxScore: number;
    maxPossibleScore: number;
  }>;
  performanceDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    total: number;
  };
}

// Alias pour compatibilité
// Type transformé avec toutes les propriétés requises
export interface TransformedCourseStats {
  courseId: number;
  courseTitle: string;
  courseCategory: string;
  totalEnrolled: number;
  activeStudents: number;
  participationRate: number;
  averageProgress: number;
  completedStudents: number;
  totalExercises: number;
  exerciseStats: ExerciseStat[];
  performanceDistribution: PerformanceDistribution;
}

// Fonction utilitaire pour transformer les données API
export function transformCourseStats(data: any): TransformedCourseStats {
  return {
    courseId: data.courseId ?? 0,
    courseTitle: data.courseTitle ?? 'Sans titre',
    courseCategory: data.courseCategory ?? '',
    totalEnrolled: data.totalEnrolled ?? 0,
    activeStudents: data.activeStudents ?? 0,
    participationRate: data.participationRate ?? 0,
    averageProgress: data.averageProgress ?? 0,
    completedStudents: data.completedStudents ?? 0,
    totalExercises: data.totalExercises ?? 0,
    exerciseStats: (data.exerciseStats ?? []).map((ex: any) => ({
      exerciseId: ex.exerciseId ?? 0,
      title: ex.title ?? 'Exercice',
      submissionCount: ex.submissionCount ?? 0,
      averageScore: ex.averageScore ?? 0,
      minScore: ex.minScore ?? 0,
      maxScore: ex.maxScore ?? 0,
      maxPossibleScore: ex.maxPossibleScore ?? 0,
    })),
    performanceDistribution: {
      excellent: data.performanceDistribution?.excellent ?? 0,
      good: data.performanceDistribution?.good ?? 0,
      average: data.performanceDistribution?.average ?? 0,
      poor: data.performanceDistribution?.poor ?? 0,
      total: data.performanceDistribution?.total ?? 0,
    }
  };
}

export interface RealtimeStatsOptions {
  enabled?: boolean;
  interval?: number;
  autoRefresh?: boolean;
  onUpdate?: (data: any) => void;
  onError?: (error: any) => void;
}