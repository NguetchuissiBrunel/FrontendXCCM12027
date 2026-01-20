/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseCourseResponse } from '../models/ApiResponseCourseResponse';
import type { ApiResponseEnrichedCourseResponse } from '../models/ApiResponseEnrichedCourseResponse';
import type { ApiResponseListCourseResponse } from '../models/ApiResponseListCourseResponse';
import type { ApiResponseListEnrichedCourseResponse } from '../models/ApiResponseListEnrichedCourseResponse';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { CourseCreateRequest } from '../models/CourseCreateRequest';
import type { CourseUpdateRequest } from '../models/CourseUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CourseControllerService {
    /**
     * @param courseId
     * @param requestBody
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static updateCourse(
        courseId: number,
        requestBody: CourseUpdateRequest,
    ): CancelablePromise<ApiResponseCourseResponse> {
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
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteCourse(
        courseId: number,
    ): CancelablePromise<ApiResponseVoid> {
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
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static incrementViewCount(
        courseId: number,
    ): CancelablePromise<ApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courses/{courseId}/view',
            path: {
                'courseId': courseId,
            },
        });
    }
    /**
     * @param courseId
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static incrementLikeCount(
        courseId: number,
    ): CancelablePromise<ApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courses/{courseId}/like',
            path: {
                'courseId': courseId,
            },
        });
    }
    /**
     * @param courseId
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static incrementDownloadCount(
        courseId: number,
    ): CancelablePromise<ApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courses/{courseId}/download',
            path: {
                'courseId': courseId,
            },
        });
    }
    /**
     * @param courseId
     * @param requestBody
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static uploadImage(
        courseId: number,
        requestBody?: {
            image: Blob;
        },
    ): CancelablePromise<ApiResponseCourseResponse> {
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
     * @returns ApiResponseListCourseResponse OK
     * @throws ApiError
     */
    public static getAuthorCourses(
        authorId: string,
    ): CancelablePromise<ApiResponseListCourseResponse> {
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
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static createCourse(
        authorId: string,
        requestBody: CourseCreateRequest,
    ): CancelablePromise<ApiResponseCourseResponse> {
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
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static updateCourseStatus(
        courseId: number,
        status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    ): CancelablePromise<ApiResponseCourseResponse> {
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
     * @returns ApiResponseListCourseResponse OK
     * @throws ApiError
     */
    public static getAllCourses(): CancelablePromise<ApiResponseListCourseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courses',
        });
    }
    /**
     * @param courseId
     * @param status
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static changeCourseStatus(
        courseId: number,
        status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    ): CancelablePromise<ApiResponseCourseResponse> {
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
     * @returns ApiResponseListCourseResponse OK
     * @throws ApiError
     */
    public static getCoureByStatusForAuthor(
        authorId: number,
        status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    ): CancelablePromise<ApiResponseListCourseResponse> {
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
     * @returns ApiResponseListEnrichedCourseResponse OK
     * @throws ApiError
     */
    public static getEnrichedCourses(): CancelablePromise<ApiResponseListEnrichedCourseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courses/enriched',
        });
    }
    /**
     * @param courseId
     * @returns ApiResponseEnrichedCourseResponse OK
     * @throws ApiError
     */
    public static getEnrichedCourse(
        courseId: number,
    ): CancelablePromise<ApiResponseEnrichedCourseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courses/enriched/{courseId}',
            path: {
                'courseId': courseId,
            },
        });
    }
}
