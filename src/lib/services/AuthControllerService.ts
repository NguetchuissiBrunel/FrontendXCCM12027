/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { ApiResponseAuthenticationResponse } from '../models/ApiResponseAuthenticationResponse';
import type { AuthenticationRequest } from '../models/AuthenticationRequest';
import type { PasswordResetRequest } from '../models/PasswordResetRequest';
import type { PasswordUpdateRequest } from '../models/PasswordUpdateRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { StudentRegisterRequest } from '../models/StudentRegisterRequest';
import type { TeacherRegisterRequest } from '../models/TeacherRegisterRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthControllerService {
    /**
     * @param requestBody
     * @returns ApiResponse OK
     * @throws ApiError
     */
    public static resetPassword(
        requestBody: PasswordUpdateRequest,
    ): CancelablePromise<ApiResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @deprecated
     * @param requestBody
     * @returns ApiResponseAuthenticationResponse OK
     * @throws ApiError
     */
    public static register(
        requestBody: RegisterRequest,
    ): CancelablePromise<ApiResponseAuthenticationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ApiResponseAuthenticationResponse OK
     * @throws ApiError
     */
    public static registerTeacher(
        requestBody: TeacherRegisterRequest,
    ): CancelablePromise<ApiResponseAuthenticationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/register/teacher',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ApiResponseAuthenticationResponse OK
     * @throws ApiError
     */
    public static registerStudent(
        requestBody: StudentRegisterRequest,
    ): CancelablePromise<ApiResponseAuthenticationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/register/student',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ApiResponseAuthenticationResponse OK
     * @throws ApiError
     */
    public static login(
        requestBody: AuthenticationRequest,
    ): CancelablePromise<ApiResponseAuthenticationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ApiResponse OK
     * @throws ApiError
     */
    public static forgotPassword(
        requestBody: PasswordResetRequest,
    ): CancelablePromise<ApiResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
