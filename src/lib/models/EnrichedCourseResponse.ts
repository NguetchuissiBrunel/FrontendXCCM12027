/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthorDTO } from './AuthorDTO';
import type { EnrollmentDTO } from './EnrollmentDTO';
export type EnrichedCourseResponse = {
    id?: number;
    title?: string;
    category?: string;
    image?: string;
    author?: AuthorDTO;
    enrollment?: EnrollmentDTO;
    viewCount?: number;
    likeCount?: number;
    downloadCount?: number;
};

