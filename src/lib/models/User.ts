/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Données de la réponse
 */
export type User = {
    id?: string;
    email?: string;
    password?: string;
    role?: User.role;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    city?: string;
    university?: string;
    specialization?: string;
    grade?: string;
    subjects?: string;
    certification?: string;
    registrationDate?: string;
    lastLogin?: string;
    updatedAt?: string;
};
export namespace User {
    export enum role {
        STUDENT = 'student',
        TEACHER = 'teacher',
        ADMIN = 'admin',
    }
}

