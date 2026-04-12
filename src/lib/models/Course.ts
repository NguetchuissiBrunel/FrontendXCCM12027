/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourseClass } from './CourseClass';
import type { User } from './User';
export type Course = {
    id?: number;
    title?: string;
    category?: string;
    description?: string;
    status?: Course.status;
    author?: User;
    courseClass?: CourseClass;
    createdAt?: string;
    publishedAt?: string;
    content?: Record<string, any>;
    coverImage?: string;
    photoUrl?: string;
    viewCount?: number;
    likeCount?: number;
    downloadCount?: number;
};
export namespace Course {
    export enum status {
        DRAFT = 'DRAFT',
        PUBLISHED = 'PUBLISHED',
        ARCHIVED = 'ARCHIVED',
    }
}

