/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthenticationResponse } from './AuthenticationResponse';
/**
 * Réponse API standardisée
 */
export type ApiResponseAuthenticationResponse = {
    /**
     * Code de statut HTTP
     */
    status?: number;
    /**
     * Message décrivant le résultat de l'opération
     */
    message?: string;
    data?: AuthenticationResponse;
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
    success?: boolean;
};

