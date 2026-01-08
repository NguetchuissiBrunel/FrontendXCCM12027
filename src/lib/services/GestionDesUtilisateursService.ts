/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseListStudentResponse } from '../models/ApiResponseListStudentResponse';
import type { ApiResponseListTeacherResponse } from '../models/ApiResponseListTeacherResponse';
import type { ApiResponseListUser } from '../models/ApiResponseListUser';
import type { ApiResponseObject } from '../models/ApiResponseObject';
import type { ApiResponseStudentResponse } from '../models/ApiResponseStudentResponse';
import type { ApiResponseTeacherResponse } from '../models/ApiResponseTeacherResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GestionDesUtilisateursService {
    /**
     * Lister tous les utilisateurs
     * Retourne la liste complète de tous les utilisateurs
     * @returns ApiResponseListUser OK
     * @throws ApiError
     */
    public static getAllUsers(): CancelablePromise<ApiResponseListUser> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users',
        });
    }
    /**
     * Lister tous les enseignants
     * Retourne la liste complète des enseignants
     * @returns ApiResponseListTeacherResponse OK
     * @throws ApiError
     */
    public static getAllTeachers(): CancelablePromise<ApiResponseListTeacherResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/teachers',
        });
    }
    /**
     * Récupérer un enseignant par ID
     * @param id
     * @returns ApiResponseTeacherResponse OK
     * @throws ApiError
     */
    public static getTeacherById(
        id: string,
    ): CancelablePromise<ApiResponseTeacherResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/teachers/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Lister tous les étudiants
     * Retourne la liste complète des étudiants
     * @returns ApiResponseListStudentResponse OK
     * @throws ApiError
     */
    public static getAllStudents(): CancelablePromise<ApiResponseListStudentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/students',
        });
    }
    /**
     * Récupérer un étudiant par ID
     * @param id
     * @returns ApiResponseStudentResponse OK
     * @throws ApiError
     */
    public static getStudentById(
        id: string,
    ): CancelablePromise<ApiResponseStudentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/students/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Récupérer l'utilisateur connecté
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static getCurrentUser(): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me',
        });
    }
}
