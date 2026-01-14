/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthorDTO } from './AuthorDTO';
/**
 * Données de la réponse
 */
export type CourseResponse = {
    id?: number;
    title?: string;
    category?: string;
    description?: string;
    status?: CourseResponse.status;
    author?: AuthorDTO;
    createdAt?: string;
    publishedAt?: string;
    content?: Record<string, Record<string, any>>;
    coverImage?: string;
};
export namespace CourseResponse {
    export enum status {
        DRAFT = 'DRAFT',
        PUBLISHED = 'PUBLISHED',
        ARCHIVED = 'ARCHIVED',
    }
}

