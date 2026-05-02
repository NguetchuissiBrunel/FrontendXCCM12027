/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthorDTO } from './AuthorDTO';
import type { ClassEnrollmentDTO } from './ClassEnrollmentDTO';
import type { CourseResponse } from './CourseResponse';
export type CourseClassResponse = {
    id?: number;
    name?: string;
    description?: string;
    theme?: string;
    coverImage?: string;
    status?: CourseClassResponse.status;
    teacher?: AuthorDTO;
    courses?: Array<CourseResponse>;
    participantCount?: number;
    pendingCount?: number;
    maxStudents?: number;
    createdAt?: string;
    updatedAt?: string;
    myEnrollment?: ClassEnrollmentDTO;
};
export namespace CourseClassResponse {
    export enum status {
        OPEN = 'OPEN',
        CLOSED = 'CLOSED',
        ARCHIVED = 'ARCHIVED',
    }
}

