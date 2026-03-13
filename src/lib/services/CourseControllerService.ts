/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourseCreateRequest } from '../models/CourseCreateRequest';
import type { CourseUpdateRequest } from '../models/CourseUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CourseControllerService {
    /**
     * @param courseId
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static updateCourse(
        courseId: number,
        requestBody: CourseUpdateRequest,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/courses/{courseId}',
            path: {
                'courseId': courseId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param courseId
     * @returns any OK
     * @throws ApiError
     */
    public static deleteCourse(
        courseId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/courses/{courseId}',
            path: {
                'courseId': courseId,
            },
        });
    }
    /**
     * @param courseId
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static uploadImage(
        courseId: number,
        requestBody?: {
            image: Blob;
        },
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courses/{courseId}/coverImage/upload',
            path: {
                'courseId': courseId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param authorId
     * @returns any OK
     * @throws ApiError
     */
    public static getAuthorCourses(
        authorId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courses/{authorId}',
            path: {
                'authorId': authorId,
            },
        });
    }
    /**
     * @param authorId
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static createCourse(
        authorId: string,
        requestBody: CourseCreateRequest,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courses/{authorId}',
            path: {
                'authorId': authorId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param courseId
     * @param status
     * @returns any OK
     * @throws ApiError
     */
    public static updateCourseStatus(
        courseId: number,
        status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/courses/{courseId}/status',
            path: {
                'courseId': courseId,
            },
            query: {
                'status': status,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getAllCourses(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courses',
        });
    }
    /**
     * @param courseId
     * @param status
     * @returns any OK
     * @throws ApiError
     */
    public static changeCourseStatus(
        courseId: number,
        status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courses/{courseId}/setStatus/{status}',
            path: {
                'courseId': courseId,
                'status': status,
            },
        });
    }
    /**
     * @param authorId
     * @param status
     * @returns any OK
     * @throws ApiError
     */
    public static getCoureByStatusForAuthor(
        authorId: number,
        status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courses/{authorId}/status/{status}',
            path: {
                'authorId': authorId,
                'status': status,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getEnrichedCourses(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courses/enriched',
        });
    }
    /**
     * @param courseId
     * @returns any OK
     * @throws ApiError
     */
    public static getEnrichedCourse(
        courseId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courses/enriched/{courseId}',
            path: {
                'courseId': courseId,
            },
        });
    }
}
