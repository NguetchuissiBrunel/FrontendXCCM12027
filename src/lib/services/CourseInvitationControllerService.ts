/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AcceptanceRequest } from '../models/AcceptanceRequest';
import type { ApiResponseCourseInvitation } from '../models/ApiResponseCourseInvitation';
import type { ApiResponseListUser } from '../models/ApiResponseListUser';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { CourseInvitationRequest } from '../models/CourseInvitationRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CourseInvitationControllerService {
    /**
     * @param requestBody
     * @returns ApiResponseCourseInvitation OK
     * @throws ApiError
     */
    public static inviteEditor(
        requestBody: CourseInvitationRequest,
    ): CancelablePromise<ApiResponseCourseInvitation> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/invitations/invite',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static acceptInvitation(
        requestBody: AcceptanceRequest,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/invitations/accept',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param query
     * @returns ApiResponseListUser OK
     * @throws ApiError
     */
    public static searchUsers1(
        query: string,
    ): CancelablePromise<ApiResponseListUser> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/invitations/search-users',
            query: {
                'query': query,
            },
        });
    }
    /**
     * Liste des collaborateurs (éditeurs) d'un cours.
     * @param courseId
     * @returns any OK
     * @throws ApiError
     */
    public static getCollaborators(
        courseId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/invitations/collaborators/{courseId}',
            path: {
                'courseId': courseId,
            },
        });
    }
}
