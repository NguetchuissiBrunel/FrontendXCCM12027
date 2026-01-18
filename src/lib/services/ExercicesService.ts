/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseExerciseResponse } from '../models/ApiResponseExerciseResponse';
import type { ApiResponseListExerciseResponse } from '../models/ApiResponseListExerciseResponse';
import type { ApiResponseListStudentExerciseResponse } from '../models/ApiResponseListStudentExerciseResponse';
import type { ApiResponseStudentExerciseResponse } from '../models/ApiResponseStudentExerciseResponse';
import type { StudentExerciseSubmissionRequest } from '../models/StudentExerciseSubmissionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExercicesService {
    /**
     * Soumettre une réponse à un exercice
     * @param exerciseId
     * @param requestBody
     * @returns ApiResponseStudentExerciseResponse OK
     * @throws ApiError
     */
    public static submitExercise(
        exerciseId: number,
        requestBody: StudentExerciseSubmissionRequest,
    ): CancelablePromise<ApiResponseStudentExerciseResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/exercises/{exerciseId}/submit',
            path: {
                'exerciseId': exerciseId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Obtenir les détails d'un exercice
     * @param exerciseId
     * @returns ApiResponseExerciseResponse OK
     * @throws ApiError
     */
    public static getExerciseDetails(
        exerciseId: number,
    ): CancelablePromise<ApiResponseExerciseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/exercises/{exerciseId}',
            path: {
                'exerciseId': exerciseId,
            },
        });
    }
    /**
     * Voir mes soumissions
     * @returns ApiResponseListStudentExerciseResponse OK
     * @throws ApiError
     */
    public static getMySubmissions(): CancelablePromise<ApiResponseListStudentExerciseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/exercises/my-submissions',
        });
    }
    /**
     * Lister les exercices d'un cours
     * @param courseId
     * @returns ApiResponseListExerciseResponse OK
     * @throws ApiError
     */
    public static getExercisesForCourse(
        courseId: number,
    ): CancelablePromise<ApiResponseListExerciseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/exercises/course/{courseId}',
            path: {
                'courseId': courseId,
            },
        });
    }
}