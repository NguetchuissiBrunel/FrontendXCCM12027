/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourseEnrollmentStat } from './CourseEnrollmentStat';
/**
 * Données de la réponse
 */
export type EnrollmentStatsResponse = {
    totalEnrollments?: number;
    byStatus?: Record<string, number>;
    byCourse?: Array<CourseEnrollmentStat>;
    averageProgress?: number;
    completionRate?: number;
    recentEnrollments?: number;
    pendingEnrollments?: number;
    acceptedEnrollments?: number;
    rejectedEnrollments?: number;
};

