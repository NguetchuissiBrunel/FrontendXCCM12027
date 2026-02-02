/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseExerciseResponse } from '../models/ApiResponseExerciseResponse';
import type { ApiResponseListStudentExerciseResponse } from '../models/ApiResponseListStudentExerciseResponse';
import type { ApiResponseListTeacherCourseStatsResponse } from '../models/ApiResponseListTeacherCourseStatsResponse';
import type { ApiResponseStudentExerciseResponse } from '../models/ApiResponseStudentExerciseResponse';
import type { ApiResponseTeacherCourseStatsResponse } from '../models/ApiResponseTeacherCourseStatsResponse';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { ExerciseCreateRequest } from '../models/ExerciseCreateRequest';
import type { ExerciseUpdateRequest } from '../models/ExerciseUpdateRequest';
import type { GradeSubmissionRequest } from '../models/GradeSubmissionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EnseignantService {
    /**
     * Noter une soumission
     * @param submissionId
     * @param requestBody
     * @returns ApiResponseStudentExerciseResponse OK
     * @throws ApiError
     */
    public static gradeSubmission(
        submissionId: number,
        requestBody: GradeSubmissionRequest,
    ): CancelablePromise<ApiResponseStudentExerciseResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/teacher/submissions/{submissionId}/grade',
            path: {
                'submissionId': submissionId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Mettre à jour un exercice
     * @param exerciseId
     * @param requestBody
     * @returns ApiResponseExerciseResponse OK
     * @throws ApiError
     */
    public static updateExercise(
        exerciseId: number,
        requestBody: ExerciseUpdateRequest,
    ): CancelablePromise<ApiResponseExerciseResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/teacher/exercises/{exerciseId}',
            path: {
                'exerciseId': exerciseId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Supprimer un exercice
     * @param exerciseId
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteExercise(
        exerciseId: number,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/teacher/exercises/{exerciseId}',
            path: {
                'exerciseId': exerciseId,
            },
        });
    }
    /**
     * Créer un exercice pour un cours
     * @param courseId
     * @param requestBody
     * @returns ApiResponseExerciseResponse OK
     * @throws ApiError
     */
    public static createExercise(
        courseId: number,
        requestBody: ExerciseCreateRequest,
    ): CancelablePromise<ApiResponseExerciseResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/teacher/courses/{courseId}/exercises',
            path: {
                'courseId': courseId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Lister les soumissions pour un exercice
     * @param exerciseId
     * @returns ApiResponseListStudentExerciseResponse OK
     * @throws ApiError
     */
    public static getSubmissions(
        exerciseId: number,
    ): CancelablePromise<ApiResponseListStudentExerciseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/teacher/exercises/{exerciseId}/submissions',
            path: {
                'exerciseId': exerciseId,
            },
        });
    }
    /**
     * Récupérer les statistiques d'un cours spécifique
     * @param courseId
     * @returns ApiResponseTeacherCourseStatsResponse OK
     * @throws ApiError
     */
    public static getCourseStatistics(
        courseId: number,
    ): CancelablePromise<ApiResponseTeacherCourseStatsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/teacher/courses/{courseId}/stats',
            path: {
                'courseId': courseId,
            },
        });
    }
    /**
     * Récupérer les statistiques de tous les cours de l'enseignant
     * @returns ApiResponseListTeacherCourseStatsResponse OK
     * @throws ApiError
     */
    public static getAllCoursesStatistics(): CancelablePromise<ApiResponseListTeacherCourseStatsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/teacher/courses/stats',
        });
    }
}
