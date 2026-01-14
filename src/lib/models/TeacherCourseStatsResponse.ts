/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExerciseStatsDTO } from './ExerciseStatsDTO';
import type { PerformanceDistributionDTO } from './PerformanceDistributionDTO';
/**
 * Données de la réponse
 */
export type TeacherCourseStatsResponse = {
    courseId?: number;
    courseTitle?: string;
    courseCategory?: string;
    totalEnrolled?: number;
    activeStudents?: number;
    participationRate?: number;
    averageProgress?: number;
    completedStudents?: number;
    totalExercises?: number;
    exerciseStats?: Array<ExerciseStatsDTO>;
    performanceDistribution?: PerformanceDistributionDTO;
};

