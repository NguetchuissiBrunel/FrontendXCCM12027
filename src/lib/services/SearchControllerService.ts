/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Course } from '../models/Course';
import type { CourseClass } from '../models/CourseClass';
import type { Exercise } from '../models/Exercise';
import type { Pageable } from '../models/Pageable';
import type { PageUser } from '../models/PageUser';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SearchControllerService {
    /**
     * @param query
     * @param pageable
     * @returns PageUser OK
     * @throws ApiError
     */
    public static searchUsers(
        query: string,
        pageable: Pageable,
    ): CancelablePromise<PageUser> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/search/users',
            query: {
                'query': query,
                'pageable': pageable,
            },
        });
    }
    /**
     * @param query
     * @returns Exercise OK
     * @throws ApiError
     */
    public static searchExercises(
        query: string,
    ): CancelablePromise<Array<Exercise>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/search/exercises',
            query: {
                'query': query,
            },
        });
    }
    /**
     * @param query
     * @returns Course OK
     * @throws ApiError
     */
    public static searchCourses(
        query: string,
    ): CancelablePromise<Array<Course>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/search/courses',
            query: {
                'query': query,
            },
        });
    }
    /**
     * @param query
     * @returns CourseClass OK
     * @throws ApiError
     */
    public static searchClasses(
        query: string,
    ): CancelablePromise<Array<CourseClass>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/search/classes',
            query: {
                'query': query,
            },
        });
    }
}
