/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserDetailResponse } from './UserDetailResponse';
/**
 * Réponse API standardisée
 */
export type ApiResponseUserDetailResponse = {
    /**
     * Code de statut HTTP
     */
    code?: number;
    /**
     * Indique si l'opération a réussi
     */
    success?: boolean;
    /**
     * Message décrivant le résultat de l'opération
     */
    message?: string;
    data?: UserDetailResponse;
    /**
     * Erreurs de validation (si applicable)
     */
    errors?: Record<string, string>;
    /**
     * Message d'erreur détaillé (si applicable)
     */
    error?: string;
    /**
     * Horodatage de la réponse
     */
    timestamp?: string;
};

