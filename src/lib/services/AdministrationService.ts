/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseAdminStatisticsResponse } from '../models/ApiResponseAdminStatisticsResponse';
import type { ApiResponseAuthenticationResponse } from '../models/ApiResponseAuthenticationResponse';
import type { ApiResponseCourseResponse } from '../models/ApiResponseCourseResponse';
import type { ApiResponseEnrollmentDetailResponse } from '../models/ApiResponseEnrollmentDetailResponse';
import type { ApiResponseEnrollmentStatsResponse } from '../models/ApiResponseEnrollmentStatsResponse';
import type { ApiResponseListCourseResponse } from '../models/ApiResponseListCourseResponse';
import type { ApiResponseListEnrollmentDetailResponse } from '../models/ApiResponseListEnrollmentDetailResponse';
import type { ApiResponseListUserDetailResponse } from '../models/ApiResponseListUserDetailResponse';
import type { ApiResponseUserDetailResponse } from '../models/ApiResponseUserDetailResponse';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { CourseUpdateRequest } from '../models/CourseUpdateRequest';
import type { EnrollmentUpdateRequest } from '../models/EnrollmentUpdateRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { StudentRegisterRequest } from '../models/StudentRegisterRequest';
import type { TeacherRegisterRequest } from '../models/TeacherRegisterRequest';
import type { UserUpdateRequest } from '../models/UserUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdministrationService {
    /**
     * Récupérer un utilisateur par ID
     * @param id
     * @returns ApiResponseUserDetailResponse OK
     * @throws ApiError
     */
    public static getUserById(
        id: string,
    ): CancelablePromise<ApiResponseUserDetailResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/users/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mettre à jour un utilisateur
     * @param id
     * @param requestBody
     * @returns ApiResponseUserDetailResponse OK
     * @throws ApiError
     */
    public static updateUser(
        id: string,
        requestBody: UserUpdateRequest,
    ): CancelablePromise<ApiResponseUserDetailResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/admin/users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Supprimer un utilisateur
     * @param id
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteUser(
        id: string,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/admin/users/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Récupérer un enseignant par ID
     * @param id
     * @returns ApiResponseUserDetailResponse OK
     * @throws ApiError
     */
    public static getTeacherById(
        id: string,
    ): CancelablePromise<ApiResponseUserDetailResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/teachers/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mettre à jour un enseignant
     * @param id
     * @param requestBody
     * @returns ApiResponseUserDetailResponse OK
     * @throws ApiError
     */
    public static updateTeacher(
        id: string,
        requestBody: UserUpdateRequest,
    ): CancelablePromise<ApiResponseUserDetailResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/admin/teachers/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Supprimer un enseignant
     * @param id
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteTeacher(
        id: string,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/admin/teachers/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Récupérer un étudiant par ID
     * @param id
     * @returns ApiResponseUserDetailResponse OK
     * @throws ApiError
     */
    public static getStudentById(
        id: string,
    ): CancelablePromise<ApiResponseUserDetailResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/students/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mettre à jour un étudiant
     * @param id
     * @param requestBody
     * @returns ApiResponseUserDetailResponse OK
     * @throws ApiError
     */
    public static updateStudent(
        id: string,
        requestBody: UserUpdateRequest,
    ): CancelablePromise<ApiResponseUserDetailResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/admin/students/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Supprimer un étudiant
     * @param id
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteStudent(
        id: string,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/admin/students/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Récupérer un enrollment par ID
     * @param id
     * @returns ApiResponseEnrollmentDetailResponse OK
     * @throws ApiError
     */
    public static getEnrollmentById(
        id: number,
    ): CancelablePromise<ApiResponseEnrollmentDetailResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/enrollments/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mettre à jour un enrollment
     * @param id
     * @param requestBody
     * @returns ApiResponseEnrollmentDetailResponse OK
     * @throws ApiError
     */
    public static updateEnrollment(
        id: number,
        requestBody: EnrollmentUpdateRequest,
    ): CancelablePromise<ApiResponseEnrollmentDetailResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/admin/enrollments/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Supprimer un enrollment
     * @param id
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteEnrollment(
        id: number,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/admin/enrollments/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Récupérer un cours par ID
     * @param id
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static getCourseById(
        id: number,
    ): CancelablePromise<ApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/courses/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mettre à jour un cours
     * @param id
     * @param requestBody
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static updateCourse1(
        id: number,
        requestBody: CourseUpdateRequest,
    ): CancelablePromise<ApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/admin/courses/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Supprimer un cours
     * @param id
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteCourse1(
        id: number,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/admin/courses/{id}',
            path: {
                'id': id,
            },
        });
    }
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
     * Lister tous les utilisateurs
     * @returns ApiResponseListUserDetailResponse OK
     * @throws ApiError
     */
    public static getAllUsers(): CancelablePromise<ApiResponseListUserDetailResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/users',
        });
    }
    /**
     * Lister tous les enseignants
     * @returns ApiResponseListUserDetailResponse OK
     * @throws ApiError
     */
    public static getAllTeachers(): CancelablePromise<ApiResponseListUserDetailResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/teachers',
        });
    }
    /**
     * Lister tous les étudiants
     * @returns ApiResponseListUserDetailResponse OK
     * @throws ApiError
     */
    public static getAllStudents(): CancelablePromise<ApiResponseListUserDetailResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/students',
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
    /**
     * Lister tous les enrollments
     * @returns ApiResponseListEnrollmentDetailResponse OK
     * @throws ApiError
     */
    public static getAllEnrollments(): CancelablePromise<ApiResponseListEnrollmentDetailResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/enrollments',
        });
    }
    /**
     * Récupérer les statistiques détaillées des enrollments
     * @returns ApiResponseEnrollmentStatsResponse OK
     * @throws ApiError
     */
    public static getEnrollmentStatistics(): CancelablePromise<ApiResponseEnrollmentStatsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/enrollments/stats',
        });
    }
    /**
     * Lister tous les cours
     * @returns ApiResponseListCourseResponse OK
     * @throws ApiError
     */
    public static getAllCourses1(): CancelablePromise<ApiResponseListCourseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/courses',
        });
    }
}
