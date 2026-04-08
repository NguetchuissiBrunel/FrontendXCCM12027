/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseClassEnrollmentDTO } from '../models/ApiResponseClassEnrollmentDTO';
import type { ApiResponseListClassEnrollmentDTO } from '../models/ApiResponseListClassEnrollmentDTO';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InscriptionsAuxClassesService {
    /**
     * Valider ou rejeter une inscription
     * Accessible seulement à l'enseignant propriétaire de la classe. status=APPROVED ou REJECTED
     * @param enrollmentId
     * @param status
     * @returns ApiResponseClassEnrollmentDTO OK
     * @throws ApiError
     */
    public static validateEnrollment1(
        enrollmentId: number,
        status: 'PENDING' | 'APPROVED' | 'REJECTED',
    ): CancelablePromise<ApiResponseClassEnrollmentDTO> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/class-enrollments/{enrollmentId}/validate',
            path: {
                'enrollmentId': enrollmentId,
            },
            query: {
                'status': status,
            },
        });
    }
    /**
     * S'inscrire à une classe
     * L'étudiant envoie une demande d'inscription. Elle sera en PENDING jusqu'à validation par l'enseignant.
     * @param classId
     * @returns ApiResponseClassEnrollmentDTO OK
     * @throws ApiError
     */
    public static enrollInClass(
        classId: number,
    ): CancelablePromise<ApiResponseClassEnrollmentDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/class-enrollments/{classId}',
            path: {
                'classId': classId,
            },
        });
    }
    /**
     * Demandes d'inscription en attente (enseignant)
     * @returns ApiResponseListClassEnrollmentDTO OK
     * @throws ApiError
     */
    public static getPendingEnrollments1(): CancelablePromise<ApiResponseListClassEnrollmentDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/class-enrollments/pending',
        });
    }
    /**
     * Mes inscriptions aux classes
     * @returns ApiResponseListClassEnrollmentDTO OK
     * @throws ApiError
     */
    public static getMyEnrollments1(): CancelablePromise<ApiResponseListClassEnrollmentDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/class-enrollments/my',
        });
    }
    /**
     * Liste des inscrits d'une classe (enseignant)
     * @param classId
     * @returns ApiResponseListClassEnrollmentDTO OK
     * @throws ApiError
     */
    public static getClassEnrollments(
        classId: number,
    ): CancelablePromise<ApiResponseListClassEnrollmentDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/class-enrollments/class/{classId}',
            path: {
                'classId': classId,
            },
        });
    }
    /**
     * Mon inscription à une classe spécifique
     * @param classId
     * @returns ApiResponseClassEnrollmentDTO OK
     * @throws ApiError
     */
    public static getMyEnrollmentForClass(
        classId: number,
    ): CancelablePromise<ApiResponseClassEnrollmentDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/class-enrollments/class/{classId}/me',
            path: {
                'classId': classId,
            },
        });
    }
    /**
     * Se désinscrire d'une classe
     * Supprime l'inscription quelle que soit son statut (PENDING, APPROVED, REJECTED)
     * @param enrollmentId
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static unenrollFromClass(
        enrollmentId: number,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/class-enrollments/{enrollmentId}',
            path: {
                'enrollmentId': enrollmentId,
            },
        });
    }
    /**
     * Annuler une demande d'inscription en attente
     * @param enrollmentId
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static cancelPendingEnrollment1(
        enrollmentId: number,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/class-enrollments/pending/{enrollmentId}',
            path: {
                'enrollmentId': enrollmentId,
            },
        });
    }
}
