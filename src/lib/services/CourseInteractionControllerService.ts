/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseCourseCommentDTO } from '../models/ApiResponseCourseCommentDTO';
import type { ApiResponseCourseLikeResponse } from '../models/ApiResponseCourseLikeResponse';
import type { ApiResponseCourseViewResponse } from '../models/ApiResponseCourseViewResponse';
import type { ApiResponseListCourseCommentDTO } from '../models/ApiResponseListCourseCommentDTO';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { CourseCommentRequest } from '../models/CourseCommentRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CourseInteractionControllerService {
    /**
     * @param courseId
     * @param commentId
     * @param requestBody
     * @returns ApiResponseCourseCommentDTO OK
     * @throws ApiError
     */
    public static updateComment(
        courseId: number,
        commentId: number,
        requestBody: CourseCommentRequest,
    ): CancelablePromise<ApiResponseCourseCommentDTO> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/courses/{courseId}/interactions/comments/{commentId}',
            path: {
                'courseId': courseId,
                'commentId': commentId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param courseId
     * @param commentId
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteComment(
        courseId: number,
        commentId: number,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/courses/{courseId}/interactions/comments/{commentId}',
            path: {
                'courseId': courseId,
                'commentId': commentId,
            },
        });
    }
    /**
     * @param courseId
     * @returns ApiResponseCourseViewResponse OK
     * @throws ApiError
     */
    public static recordView(
        courseId: number,
    ): CancelablePromise<ApiResponseCourseViewResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/courses/{courseId}/interactions/view',
            path: {
                'courseId': courseId,
            },
        });
    }
    /**
     * @param courseId
     * @returns ApiResponseCourseLikeResponse OK
     * @throws ApiError
     */
    public static getLikeStatus(
        courseId: number,
    ): CancelablePromise<ApiResponseCourseLikeResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/courses/{courseId}/interactions/like',
            path: {
                'courseId': courseId,
            },
        });
    }
    /**
     * @param courseId
     * @returns ApiResponseCourseLikeResponse OK
     * @throws ApiError
     */
    public static toggleLike(
        courseId: number,
    ): CancelablePromise<ApiResponseCourseLikeResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/courses/{courseId}/interactions/like',
            path: {
                'courseId': courseId,
            },
        });
    }
    /**
     * @param courseId
     * @returns ApiResponseListCourseCommentDTO OK
     * @throws ApiError
     */
    public static getComments(
        courseId: number,
    ): CancelablePromise<ApiResponseListCourseCommentDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/courses/{courseId}/interactions/comments',
            path: {
                'courseId': courseId,
            },
        });
    }
    /**
     * @param courseId
     * @param requestBody
     * @returns ApiResponseCourseCommentDTO OK
     * @throws ApiError
     */
    public static addComment(
        courseId: number,
        requestBody: CourseCommentRequest,
    ): CancelablePromise<ApiResponseCourseCommentDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/courses/{courseId}/interactions/comments',
            path: {
                'courseId': courseId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all comments for a course (teacher view)
     * @param courseId
     * @returns ApiResponseListCourseCommentDTO OK
     * @throws ApiError
     */
    public static getCourseCommentsForTeacher(
        courseId: number,
    ): CancelablePromise<ApiResponseListCourseCommentDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/courses/{courseId}/interactions/teacher/comments',
            path: {
                'courseId': courseId,
            },
        });
    }
}
