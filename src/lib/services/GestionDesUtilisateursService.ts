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
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GestionDesUtilisateursService {
    /**
     * Mettre à jour un utilisateur
     * Permet de mettre à jour les informations d'un utilisateur
     * @param id
     * @param requestBody
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static updateUser1(
        id: string,
        requestBody: User,
    ): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Lister tous les utilisateurs
     * Retourne la liste complète de tous les utilisateurs
     * @returns ApiResponseListUser OK
     * @throws ApiError
     */
    public static getAllUsers1(): CancelablePromise<ApiResponseListUser> {
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
    public static getAllTeachers1(): CancelablePromise<ApiResponseListTeacherResponse> {
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
    public static getTeacherById1(
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
    public static getAllStudents1(): CancelablePromise<ApiResponseListStudentResponse> {
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
