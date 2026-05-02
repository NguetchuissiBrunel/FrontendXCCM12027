/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EnrollmentDetailResponse = {
    id?: number;
    userId?: string;
    userFullName?: string;
    userEmail?: string;
    courseId?: number;
    courseTitle?: string;
    courseCategory?: string;
    enrolledAt?: string;
    progress?: number;
    lastAccessed?: string;
    completed?: boolean;
    status?: EnrollmentDetailResponse.status;
};
export namespace EnrollmentDetailResponse {
    export enum status {
        PENDING = 'PENDING',
        APPROVED = 'APPROVED',
        REJECTED = 'REJECTED',
        INVITED = 'INVITED',
    }
}

