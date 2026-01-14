/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TestingService {
    /**
     * Test du coordinateur d'agents
     * Teste le coordinateur d'agents
     * @returns any Statut du coordinateur
     * @throws ApiError
     */
    public static getTestCoordinator(): CancelablePromise<{
        agents?: Array<string>;
        agents_count?: number;
        status?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/test-coordinator',
        });
    }
    /**
     * Endpoint de test simple sans async
     * Endpoint de test simple sans async
     * @param body
     * @returns any Réponse de test
     * @throws ApiError
     */
    public static postTestSimple(
        body: {
            question: string;
        },
    ): CancelablePromise<{
        agent_type?: string;
        answer?: string;
        confidence_score?: number;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/test-simple',
            body: body,
        });
    }
}
