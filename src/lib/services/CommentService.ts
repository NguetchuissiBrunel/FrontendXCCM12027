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
    /** Ajouter un commentaire sur un cours */
    public static addComment(
        courseId: number,
        content: string,
        parentCommentId?: number,
    ): CancelablePromise<ApiResponseCommentDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/comments',
            body: { courseId, content, ...(parentCommentId ? { parentCommentId } : {}) },
            mediaType: 'application/json',
        });
    }

    /** Récupérer les commentaires d'un cours (paginés, avec réponses) */
    public static getComments(
        courseId: number,
        page: number = 0,
        size: number = 20,
    ): CancelablePromise<ApiResponseCommentList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/comments',
            query: { courseId, page, size },
        });
    }

    /** Modifier un commentaire (auteur uniquement) */
    public static updateComment(
        commentId: number,
        content: string,
    ): CancelablePromise<ApiResponseCommentDTO> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/comments/{commentId}',
            path: { commentId },
            body: { content },
            mediaType: 'application/json',
        });
    }

    /** Supprimer logiquement un commentaire (auteur ou admin) */
    public static deleteComment(
        commentId: number,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/comments/{commentId}',
            path: { commentId },
        });
    }
}
