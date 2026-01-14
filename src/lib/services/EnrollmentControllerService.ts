/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseEnrollmentDTO } from '../models/ApiResponseEnrollmentDTO';
import type { ApiResponseListEnrollmentDTO } from '../models/ApiResponseListEnrollmentDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EnrollmentControllerService {
    /**
     * @param enrollmentId
     * @param status
     * @returns ApiResponseEnrollmentDTO OK
     * @throws ApiError
     */
    public static validateEnrollment(
        enrollmentId: number,
        status: 'PENDING' | 'APPROVED' | 'REJECTED',
    ): CancelablePromise<ApiResponseEnrollmentDTO> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/enrollments/{enrollmentId}/validate',
            path: {
                'enrollmentId': enrollmentId,
            },
            query: {
                'status': status,
            },
        });
    }
    /**
     * @param enrollmentId
     * @param progress
     * @returns ApiResponseEnrollmentDTO OK
     * @throws ApiError
     */
    public static updateProgress(
        enrollmentId: number,
        progress: number,
    ): CancelablePromise<ApiResponseEnrollmentDTO> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/enrollments/{enrollmentId}/progress',
            path: {
                'enrollmentId': enrollmentId,
            },
            query: {
                'progress': progress,
            },
        });
    }
    /**
     * @param enrollmentId
     * @returns ApiResponseEnrollmentDTO OK
     * @throws ApiError
     */
    public static markAsCompleted(
        enrollmentId: number,
    ): CancelablePromise<ApiResponseEnrollmentDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/enrollments/{enrollmentId}/complete',
            path: {
                'enrollmentId': enrollmentId,
            },
        });
    }
    /**
     * @param courseId
     * @returns ApiResponseEnrollmentDTO OK
     * @throws ApiError
     */
    public static getEnrollmentForCourse(
        courseId: number,
    ): CancelablePromise<ApiResponseEnrollmentDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/enrollments/courses/{courseId}',
            path: {
                'courseId': courseId,
            },
        });
    }
    /**
     * @param courseId
     * @returns ApiResponseEnrollmentDTO OK
     * @throws ApiError
     */
    public static enrollInCourse(
        courseId: number,
    ): CancelablePromise<ApiResponseEnrollmentDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/enrollments/courses/{courseId}',
            path: {
                'courseId': courseId,
            },
        });
    }
    /**
     * @returns ApiResponseListEnrollmentDTO OK
     * @throws ApiError
     */
    public static getPendingEnrollments(): CancelablePromise<ApiResponseListEnrollmentDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/enrollments/pending',
        });
    }
    /**
     * @returns ApiResponseListEnrollmentDTO OK
     * @throws ApiError
     */
    public static getMyEnrollments(): CancelablePromise<ApiResponseListEnrollmentDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/enrollments/my-courses',
        });
    }
}
