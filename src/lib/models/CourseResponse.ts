/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
/**
 * Données de la réponse
 */
export type CourseResponse = {
    id?: number;
    title?: string;
    category?: string;
    description?: string;
    status?: CourseResponse.status;
    author?: User;
    createdAt?: string;
    publishedAt?: string;
    content?: string;
    coverImage?: string;
};
export namespace CourseResponse {
    export enum status {
        DRAFT = 'DRAFT',
        PUBLISHED = 'PUBLISHED',
        ARCHIVED = 'ARCHIVED',
    }
}

