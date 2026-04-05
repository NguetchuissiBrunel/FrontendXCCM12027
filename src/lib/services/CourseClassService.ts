import { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export interface CourseClassCreateRequest {
    name: string;
    theme?: string;
    description?: string;
    maxStudents?: number;
}

export class CourseClassService {
    /**
     * Obtenir toutes les classes du professeur connecté
     * @returns any OK
     * @throws ApiError
     */
    public static getMyClasses(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/classes/my',
        });
    }

    /**
     * Lister les classes disponibles (OPEN)
     * Accessible à tous. Si étudiant connecté, retourne son statut d'inscription.
     * @returns any OK
     * @throws ApiError
     */
    public static getAllOpenClasses(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/classes',
        });
    }

    /**
     * Créer une classe de cours
     * @param data 
     * @returns any OK
     * @throws ApiError
     */
    public static createClass(data: CourseClassCreateRequest): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/classes',
            body: data,
            mediaType: 'application/json',
        });
    }

    /**
     * Obtenir le détail d'une classe
     * @param classId
     * @returns any OK
     * @throws ApiError
     */
    public static getClassById(classId: number): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/classes/{classId}',
            path: {
                'classId': classId,
            },
        });
    }

    /**
     * Mettre à jour une classe de cours
     * @param classId 
     * @param data 
     * @returns any OK
     * @throws ApiError
     */
    public static updateClass(classId: number, data: CourseClassCreateRequest): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/classes/{classId}',
            path: {
                'classId': classId,
            },
            body: data,
            mediaType: 'application/json',
        });
    }

    /**
     * Supprimer une classe de cours
     * @param classId 
     * @returns any OK
     * @throws ApiError
     */
    public static deleteClass(classId: number): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/classes/{classId}',
            path: {
                'classId': classId,
            },
        });
    }

    /**
     * Ajouter un cours à une classe
     * @param classId 
     * @param courseId 
     * @returns any OK
     * @throws ApiError
     */
    public static addCourseToClass(classId: number, courseId: number): CancelablePromise<any> {
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
     * Retirer un cours d'une classe
     * @param classId 
     * @param courseId 
     * @returns any OK
     * @throws ApiError
     */
    public static removeCourseFromClass(classId: number, courseId: number): CancelablePromise<any> {
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
     * Modifier le statut d'une classe
     * @param classId 
     * @param status 
     * @returns any OK
     * @throws ApiError
     */
    public static changeClassStatus(classId: number, status: 'OPEN' | 'CLOSED' | 'ARCHIVED'): CancelablePromise<any> {
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
     * Uploader une image de couverture pour la classe
     * @param classId 
     * @param image 
     * @returns any OK
     * @throws ApiError
     */
    public static uploadCoverImage(classId: number, image: Blob): CancelablePromise<any> {
        const formData = new FormData();
        formData.append('file', image);
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/classes/{classId}/cover',
            path: {
                'classId': classId,
            },
            body: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
