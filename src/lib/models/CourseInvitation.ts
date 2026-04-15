/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Course } from './Course';
import type { User } from './User';
export type CourseInvitation = {
    id?: number;
    course?: Course;
    inviter?: User;
    email?: string;
    token?: string;
    status?: CourseInvitation.status;
    expiryDate?: string;
    createdAt?: string;
};
export namespace CourseInvitation {
    export enum status {
        PENDING = 'PENDING',
        ACCEPTED = 'ACCEPTED',
        REJECTED = 'REJECTED',
        EXPIRED = 'EXPIRED',
    }
}

