/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export interface CourseStatsResponse {
    courseId: number;
    courseTitle: string;
    courseCategory: string;
    totalEnrolled: number;
    activeStudents: number;
    participationRate: number;
    averageProgress: number;
    completedStudents: number;
    totalExercises: number;
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

export interface ApiResponseListCourseStatsResponse {
    code: number;
    success: boolean;
    message: string;
    data: Array<CourseStatsResponse>;
    errors?: Record<string, string>;
    error?: string;
    timestamp: string;
}

export interface ApiResponseCourseStatsResponse {
    code: number;
    success: boolean;
    message: string;
    data: CourseStatsResponse;
    errors?: Record<string, string>;
    error?: string;
    timestamp: string;
}

export class StatsControllerService {
    /**
     * Get statistics for all courses of a teacher
     * @returns ApiResponseListCourseStatsResponse OK
     * @throws ApiError
     */
    public static getTeacherCoursesStats(): CancelablePromise<ApiResponseListCourseStatsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/teacher/courses/stats',
        });
    }

    /**
     * Get statistics for a specific course
     * @param courseId Course ID
     * @returns ApiResponseCourseStatsResponse OK
     * @throws ApiError
     */
    public static getCourseStats(
        courseId: number,
    ): CancelablePromise<ApiResponseCourseStatsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/teacher/courses/{courseId}/stats',
            path: {
                'courseId': courseId,
            },
        });
    }
}