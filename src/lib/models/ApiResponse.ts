/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Réponse API standardisée
 */
export type ApiResponse = {
    /**
     * Code de statut HTTP
     */
    status?: number;
    /**
     * Message décrivant le résultat de l'opération
     */
    message?: string;
    /**
     * Données de la réponse
     */
    data?: Record<string, any>;
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

