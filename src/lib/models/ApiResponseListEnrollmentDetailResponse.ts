/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EnrollmentDetailResponse } from './EnrollmentDetailResponse';
/**
 * Réponse API standardisée
 */
export type ApiResponseListEnrollmentDetailResponse = {
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
    /**
     * Données de la réponse
     */
    data?: Array<EnrollmentDetailResponse>;
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

