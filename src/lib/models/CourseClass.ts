/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Course } from './Course';
import type { User } from './User';
export type CourseClass = {
    id?: number;
    name?: string;
    description?: string;
    theme?: string;
    coverImage?: string;
    status?: CourseClass.status;
    teacher?: User;
    courses?: Array<Course>;
    maxStudents?: number;
    createdAt?: string;
    updatedAt?: string;
};
export namespace CourseClass {
    export enum status {
        OPEN = 'OPEN',
        CLOSED = 'CLOSED',
        ARCHIVED = 'ARCHIVED',
    }
}

