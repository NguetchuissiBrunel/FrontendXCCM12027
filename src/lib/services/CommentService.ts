import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export type CommentDTO = {
    id?: number;
    courseId?: number;
    userId?: string;
    userFullName?: string;
    userPhotoUrl?: string;
    content?: string;
    likeCount?: number;
    isLiked?: boolean;
    deleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    replies?: CommentDTO[];
};

export type ApiResponseCommentDTO = {
    code?: number;
    success?: boolean;
    message?: string;
    data?: CommentDTO;
};

export type ApiResponseCommentList = {
    code?: number;
    success?: boolean;
    message?: string;
    data?: CommentDTO[] | { content?: CommentDTO[]; totalElements?: number; totalPages?: number };
};

export type ApiResponseVoid = {
    code?: number;
    success?: boolean;
    message?: string;
};

export class CommentService {
    // NB: le backend expose les commentaires sous
    // /api/courses/{courseId}/interactions/comments (CourseInteractionController),
    // et NON /api/v1/comments — d'où les 404 en lecture et à l'envoi.
    // Le backend ne gère ni les réponses (parentCommentId) ni les likes par
    // commentaire : seul `content` est transmis.

    /** Ajouter un commentaire sur un cours */
    public static addComment(
        courseId: number,
        content: string,
        _parentCommentId?: number,
    ): CancelablePromise<ApiResponseCommentDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/courses/{courseId}/interactions/comments',
            path: { courseId },
            body: { content },
            mediaType: 'application/json',
        });
    }

    /** Récupérer les commentaires d'un cours (public, sans authentification) */
    public static getComments(
        courseId: number,
    ): CancelablePromise<ApiResponseCommentList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/courses/{courseId}/interactions/comments',
            path: { courseId },
        });
    }

    /** Modifier un commentaire (auteur uniquement) */
    public static updateComment(
        courseId: number,
        commentId: number,
        content: string,
    ): CancelablePromise<ApiResponseCommentDTO> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/courses/{courseId}/interactions/comments/{commentId}',
            path: { courseId, commentId },
            body: { content },
            mediaType: 'application/json',
        });
    }

    /** Supprimer logiquement un commentaire (auteur ou admin) */
    public static deleteComment(
        courseId: number,
        commentId: number,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/courses/{courseId}/interactions/comments/{commentId}',
            path: { courseId, commentId },
        });
    }
}
