import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import { CancelablePromise } from '../core/CancelablePromise';
import type { User } from '../models/User';
import type { CourseResponse } from '../models/CourseResponse';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { StudentRegisterRequest } from '../models/StudentRegisterRequest';
import type { TeacherRegisterRequest } from '../models/TeacherRegisterRequest';
import type { ApiResponseAuthenticationResponse } from '../models/ApiResponseAuthenticationResponse';

export class AdminService {
    /**
     * Récupérer tous les utilisateurs
     * Endpoint: GET /api/users
     * @returns any OK
     * @throws ApiError
     */
    public static getAllUsers(): CancelablePromise<{ data: User[] }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users',
        });
    }

    /**
     * Récupérer tous les étudiants
     * Endpoint: GET /api/users/students
     * @returns any OK
     * @throws ApiError
     */
    public static getAllStudents(): CancelablePromise<{ data: User[] }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/students',
        });
    }

    /**
     * Récupérer tous les enseignants
     * Endpoint: GET /api/users/teachers
     * @returns any OK
     * @throws ApiError
     */
    public static getAllTeachers(): CancelablePromise<{ data: User[] }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/teachers',
        });
    }

    /**
     * Supprimer un utilisateur
     * Note: Basé sur votre code original. Si l'endpoint diffère, ajustez l'URL.
     * @param userId
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteUser(userId: string): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/{userId}',
            path: { 'userId': userId },
        });
    }

    /**
     * Récupérer tous les cours
     * Endpoint: GET /courses
     * @returns any OK
     * @throws ApiError
     */
    public static getAllCourses(): CancelablePromise<{ data: CourseResponse[] }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courses',
        });
    }

    /**
     * Supprimer un cours
     * Endpoint: DELETE /courses/{courseId}
     * @param courseId
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteCourse(courseId: number): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/courses/{courseId}',
            path: { 'courseId': courseId },
        });
    }

    /**
     * Récupérer les détails d'un étudiant
     * Endpoint: GET /api/users/students/{id}
     * @param userId
     * @returns User OK
     * @throws ApiError
     */
    public static getStudentDetails(userId: string): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/students/{id}',
            path: { 'id': userId },
        });
    }

    /**
     * Récupérer les détails d'un enseignant
     * Endpoint: GET /api/users/teachers/{id}
     * @param userId
     * @returns User OK
     * @throws ApiError
     */
    public static getTeacherDetails(userId: string): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/teachers/{id}',
            path: { 'id': userId },
        });
    }

    /**
     * Récupérer l'utilisateur connecté
     * Endpoint: GET /api/users/me
     * @returns User OK
     * @throws ApiError
     */
    public static getCurrentUser(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me',
        });
    }

    /**
     * Inscription générale
     * Endpoint: POST /api/v1/auth/register
     * @param requestBody
     * @returns ApiResponseAuthenticationResponse OK
     * @throws ApiError
     */
    public static register(requestBody: RegisterRequest): CancelablePromise<ApiResponseAuthenticationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Créer un enseignant (via Auth ou Admin selon votre spec, ici via auth-controller)
     * Endpoint: POST /api/v1/auth/register/teacher
     * @param requestBody
     * @returns ApiResponseAuthenticationResponse OK
     * @throws ApiError
     */
    public static registerTeacher(requestBody: TeacherRegisterRequest): CancelablePromise<ApiResponseAuthenticationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/register/teacher',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Créer un étudiant
     * Endpoint: POST /api/v1/auth/register/student
     * @param requestBody
     * @returns ApiResponseAuthenticationResponse OK
     * @throws ApiError
     */
    public static registerStudent(requestBody: StudentRegisterRequest): CancelablePromise<ApiResponseAuthenticationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/register/student',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Créer un enseignant (via Admin Controller - Endpoint visible dans vos screenshots)
     * Endpoint: POST /api/v1/admin/users/teacher
     */
    public static createTeacherByAdmin(requestBody: TeacherRegisterRequest): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/users/teacher',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Créer un étudiant (via Admin Controller - Endpoint visible dans vos screenshots)
     * Endpoint: POST /api/v1/admin/users/student
     */
    public static createStudentByAdmin(requestBody: StudentRegisterRequest): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/users/student',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Récupérer les statistiques globales
     * Endpoint: GET /api/v1/admin/stats
     * @returns any OK (Structure JSON: { success: boolean, data: { ... } })
     * @throws ApiError
     */
    public static getAdminStats(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/stats',
        });
    }

    /**
     * Récupérer les inscriptions en attente
     * Endpoint: GET /api/enrollments/pending
     * @returns any OK
     * @throws ApiError
     */
    public static getAllEnrollments(): CancelablePromise<{ data: any[] }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/enrollments/pending',
        });
    }

    /**
     * Valider (Approuver) une inscription
     * Endpoint: PUT /api/enrollments/{enrollmentId}/validate
     * @param enrollmentId
     * @returns any OK
     * @throws ApiError
     */
    public static approveEnrollment(enrollmentId: number): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/enrollments/{enrollmentId}/validate',
            path: { 'enrollmentId': enrollmentId },
            query: { 'status': 'APPROVED' }, // Note: Vérifiez si votre backend attend 'status' en query ou body
        });
    }

    /**
     * Rejeter une inscription
     * Endpoint: PUT /api/enrollments/{enrollmentId}/validate
     * @param enrollmentId
     * @returns any OK
     * @throws ApiError
     */
    public static rejectEnrollment(enrollmentId: number): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/enrollments/{enrollmentId}/validate',
            path: { 'enrollmentId': enrollmentId },
            query: { 'status': 'REJECTED' },
        });
    }
}