/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ClassEnrollmentDTO = {
    id?: number;
    classId?: number;
    className?: string;
    studentId?: string;
    studentName?: string;
    studentEmail?: string;
    studentPhotoUrl?: string;
    status?: ClassEnrollmentDTO.status;
    enrolledAt?: string;
    validatedAt?: string;
    validatedBy?: string;
};
export namespace ClassEnrollmentDTO {
    export enum status {
        PENDING = 'PENDING',
        APPROVED = 'APPROVED',
        REJECTED = 'REJECTED',
    }
}

