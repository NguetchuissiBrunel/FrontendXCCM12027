/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RegisterRequest = {
    email: string;
    password?: string;
    confirmPassword?: string;
    role?: RegisterRequest.role;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    city?: string;
    university?: string;
    specialization?: string;
    grade?: string;
    subjects?: Array<string>;
    certification?: string;
};
export namespace RegisterRequest {
    export enum role {
        STUDENT = 'student',
        TEACHER = 'teacher',
        ADMIN = 'admin',
    }
}

