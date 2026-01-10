/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Données de la réponse
 */
export type EnrollmentDTO = {
    id?: number;
    courseId?: number;
    userId?: string;
    enrolledAt?: string;
    progress?: number;
    lastAccessed?: string;
    completed?: boolean;
    status?: EnrollmentDTO.status;
};
export namespace EnrollmentDTO {
    export enum status {
        PENDING = 'PENDING',
        APPROVED = 'APPROVED',
        REJECTED = 'REJECTED',
    }
}

