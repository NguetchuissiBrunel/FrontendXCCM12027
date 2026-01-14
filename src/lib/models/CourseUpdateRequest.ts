/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CourseUpdateRequest = {
    title?: string;
    category?: string;
    description?: string;
    status?: CourseUpdateRequest.status;
    content?: Record<string, Record<string, any>>;
    coverImage?: string;
};
export namespace CourseUpdateRequest {
    export enum status {
        DRAFT = 'DRAFT',
        PUBLISHED = 'PUBLISHED',
        ARCHIVED = 'ARCHIVED',
    }
}

