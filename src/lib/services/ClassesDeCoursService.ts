/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseCourseClassResponse } from '../models/ApiResponseCourseClassResponse';
import type { ApiResponseListCourseClassResponse } from '../models/ApiResponseListCourseClassResponse';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { CourseClassCreateRequest } from '../models/CourseClassCreateRequest';
import type { CourseClassUpdateRequest } from '../models/CourseClassUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ClassesDeCoursService {
    /**
     * Détail d'une classe de cours
     * @param classId
     * @returns ApiResponseCourseClassResponse OK
     * @throws ApiError
     */
    public static getClassById(
        classId: number,
    ): CancelablePromise<ApiResponseCourseClassResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/classes/{classId}',
            path: {
                'classId': classId,
            },
        });
    }
    /**
     * Modifier une classe de cours
     * @param classId
     * @param requestBody
     * @returns ApiResponseCourseClassResponse OK
     * @throws ApiError
     */
    public static updateClass(
        classId: number,
        requestBody: CourseClassUpdateRequest,
    ): CancelablePromise<ApiResponseCourseClassResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/classes/{classId}',
            path: {
                'classId': classId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Supprimer une classe de cours
     * @param classId
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteClass(
        classId: number,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/classes/{classId}',
            path: {
                'classId': classId,
            },
        });
    }
    /**
     * Lister les classes disponibles (OPEN)
     * Accessible à tous. Si étudiant connecté, retourne son statut d'inscription.
     * @returns ApiResponseListCourseClassResponse OK
     * @throws ApiError
     */
    public static getAllOpenClasses(): CancelablePromise<ApiResponseListCourseClassResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/classes',
        });
    }
    /**
     * Créer une classe de cours
     * Accessible uniquement aux enseignants
     * @param requestBody
     * @returns ApiResponseCourseClassResponse OK
     * @throws ApiError
     */
    public static createClass(
        requestBody: CourseClassCreateRequest,
    ): CancelablePromise<ApiResponseCourseClassResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/classes',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Uploader l'image de couverture d'une classe
     * @param classId
     * @param requestBody
     * @returns ApiResponseCourseClassResponse OK
     * @throws ApiError
     */
    public static uploadCoverImage(
        classId: number,
        requestBody?: {
            image: Blob;
        },
    ): CancelablePromise<ApiResponseCourseClassResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/classes/{classId}/cover',
            path: {
                'classId': classId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Ajouter un cours à la classe
     * @param classId
     * @param courseId
     * @returns ApiResponseCourseClassResponse OK
     * @throws ApiError
     */
    public static addCourse(
        classId: number,
        courseId: number,
    ): CancelablePromise<ApiResponseCourseClassResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/classes/{classId}/courses/{courseId}',
            path: {
                'classId': classId,
                'courseId': courseId,
            },
        });
    }
    /**
     * Retirer un cours de la classe
     * @param classId
     * @param courseId
     * @returns ApiResponseCourseClassResponse OK
     * @throws ApiError
     */
    public static removeCourse(
        classId: number,
        courseId: number,
    ): CancelablePromise<ApiResponseCourseClassResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/classes/{classId}/courses/{courseId}',
            path: {
                'classId': classId,
                'courseId': courseId,
            },
        });
    }
    /**
     * Changer le statut d'une classe
     * OPEN = inscriptions ouvertes, CLOSED = fermée, ARCHIVED = archivée
     * @param classId
     * @param status
     * @returns ApiResponseCourseClassResponse OK
     * @throws ApiError
     */
    public static changeStatus(
        classId: number,
        status: 'OPEN' | 'CLOSED' | 'ARCHIVED',
    ): CancelablePromise<ApiResponseCourseClassResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/classes/{classId}/status',
            path: {
                'classId': classId,
            },
            query: {
                'status': status,
            },
        });
    }
    /**
     * Mes classes (enseignant)
     * @returns ApiResponseListCourseClassResponse OK
     * @throws ApiError
     */
    public static getMyClasses(): CancelablePromise<ApiResponseListCourseClassResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/classes/my',
        });
    }
}
