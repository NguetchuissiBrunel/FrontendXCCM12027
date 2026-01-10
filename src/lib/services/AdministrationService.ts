/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseAdminStatisticsResponse } from '../models/ApiResponseAdminStatisticsResponse';
import type { ApiResponseAuthenticationResponse } from '../models/ApiResponseAuthenticationResponse';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { StudentRegisterRequest } from '../models/StudentRegisterRequest';
import type { TeacherRegisterRequest } from '../models/TeacherRegisterRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdministrationService {
    /**
     * Créer un enseignant (par l'admin)
     * @param requestBody
     * @returns ApiResponseAuthenticationResponse OK
     * @throws ApiError
     */
    public static createTeacher(
        requestBody: TeacherRegisterRequest,
    ): CancelablePromise<ApiResponseAuthenticationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/users/teacher',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Créer un étudiant (par l'admin)
     * @param requestBody
     * @returns ApiResponseAuthenticationResponse OK
     * @throws ApiError
     */
    public static createStudent(
        requestBody: StudentRegisterRequest,
    ): CancelablePromise<ApiResponseAuthenticationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/users/student',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Créer un administrateur (par l'admin)
     * @param requestBody
     * @returns ApiResponseAuthenticationResponse OK
     * @throws ApiError
     */
    public static createAdmin(
        requestBody: RegisterRequest,
    ): CancelablePromise<ApiResponseAuthenticationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/users/admin',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Récupérer les statistiques globales
     * @returns ApiResponseAdminStatisticsResponse OK
     * @throws ApiError
     */
    public static getStatistics(): CancelablePromise<ApiResponseAdminStatisticsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/stats',
        });
    }
}
