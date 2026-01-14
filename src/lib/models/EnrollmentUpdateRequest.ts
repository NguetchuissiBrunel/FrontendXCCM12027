/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EnrollmentUpdateRequest = {
    status?: EnrollmentUpdateRequest.status;
    progress?: number;
    completed?: boolean;
};
export namespace EnrollmentUpdateRequest {
    export enum status {
        PENDING = 'PENDING',
        APPROVED = 'APPROVED',
        REJECTED = 'REJECTED',
    }
}

