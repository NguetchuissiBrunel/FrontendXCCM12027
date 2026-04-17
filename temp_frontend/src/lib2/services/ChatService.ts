/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChatService {
    /**
     * Endpoint principal pour interagir avec les assistants IA éducatifs.
     * Posez une question à l'assistant IA éducatif
     * @param body
     * @returns any Réponse de l'assistant
     * @throws ApiError
     */
    public static postChat(
        body: {
            course_context?: string;
            difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
            discipline: 'mathematics' | 'physics' | 'computer_science' | 'life_sciences' | 'databases' | 'artificial_intelligence' | 'general';
            question: string;
            user_id?: string;
            user_role: 'student' | 'teacher' | 'admin';
        },
    ): CancelablePromise<{
        agent_type?: string;
        answer?: string;
        confidence_score?: number;
        follow_up_questions?: Array<string>;
        sources?: Array<string>;
        suggested_resources?: Array<string>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/chat',
            body: body,
            errors: {
                400: `Requête invalide`,
                500: `Erreur interne du serveur`,
            },
        });
    }
}
