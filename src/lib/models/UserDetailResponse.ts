/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Données de la réponse
 */
export type UserDetailResponse = {
    id?: string;
    email?: string;
    role?: UserDetailResponse.role;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    city?: string;
    university?: string;
    specialization?: string;
    grade?: string;
    subjects?: Array<string>;
    certification?: string;
    registrationDate?: string;
    lastLogin?: string;
    active?: boolean;
    verified?: boolean;
};
export namespace UserDetailResponse {
    export enum role {
        STUDENT = 'student',
        TEACHER = 'teacher',
        ADMIN = 'admin',
    }
}

