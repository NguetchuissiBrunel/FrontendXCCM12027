/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InformationService {
    /**
     * Liste des agents
     * Récupère la liste des agents disponibles
     * @returns any Liste des agents
     * @throws ApiError
     */
    public static getAgents(): CancelablePromise<{
        agents?: Array<string>;
        count?: number;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/agents',
        });
    }
    /**
     * Liste des disciplines
     * Récupère la liste des disciplines supportées
     * @returns any Liste des disciplines
     * @throws ApiError
     */
    public static getDisciplines(): CancelablePromise<{
        disciplines?: Array<string>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/disciplines',
        });
    }
    /**
     * Liste des modèles
     * Récupère la liste des modèles LLM disponibles
     * @returns any Liste des modèles
     * @throws ApiError
     */
    public static getModels(): CancelablePromise<{
        current_model?: string;
        models?: Array<string>;
        provider?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/models',
        });
    }
}
