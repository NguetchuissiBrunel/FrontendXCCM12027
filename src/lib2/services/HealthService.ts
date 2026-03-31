/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HealthService {
    /**
     * Vérification de santé du service
     * Vérifie que le service est opérationnel
     * @returns any Service en bonne santé
     * @throws ApiError
     */
    public static getHealth(): CancelablePromise<{
        agents_count?: number;
        service?: string;
        status?: string;
        timestamp?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health',
        });
    }
    /**
     * Statut système
     * Récupère des informations détaillées sur l'état du système
     * @returns any Statut du système
     * @throws ApiError
     */
    public static getStatus(): CancelablePromise<{
        agents_ready?: number;
        llm_provider?: string;
        redis_connected?: boolean;
        status?: string;
        timestamp?: string;
        version?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/status',
        });
    }
}
