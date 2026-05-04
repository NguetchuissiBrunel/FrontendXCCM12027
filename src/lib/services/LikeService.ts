import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export type LikeTargetType = 'COURSE' | 'COMMENT';

export type LikeStatusResponse = {
    targetType: string;
    targetId: number;
    liked: boolean;
    likeCount: number;
};

export type ApiResponseLikeStatus = {
    code?: number;
    success?: boolean;
    message?: string;
    data?: LikeStatusResponse;
};

export class LikeService {
    /** Liker un contenu (COURSE ou COMMENT) */
    public static addLike(
        targetType: LikeTargetType,
        targetId: number,
    ): CancelablePromise<ApiResponseLikeStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/likes',
            body: { targetType, targetId },
            mediaType: 'application/json',
        });
    }

    /** Retirer un like */
    public static removeLike(
        targetType: LikeTargetType,
        targetId: number,
    ): CancelablePromise<ApiResponseLikeStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/likes/{targetType}/{targetId}',
            path: { targetType, targetId },
        });
    }

    /** Récupérer le statut like et le count */
    public static getLikeStatus(
        targetType: LikeTargetType,
        targetId: number,
    ): CancelablePromise<ApiResponseLikeStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/likes/status/{targetType}/{targetId}',
            path: { targetType, targetId },
        });
    }
}
