/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Notebook } from '../models/Notebook';
import type { NotebookSource } from '../models/NotebookSource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotebookControllerService {
    /**
     * @param notebookId
     * @returns NotebookSource OK
     * @throws ApiError
     */
    public static getNotebookSources(
        notebookId: string,
    ): CancelablePromise<Array<NotebookSource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notebooks/{notebookId}/sources',
            path: {
                'notebookId': notebookId,
            },
        });
    }
    /**
     * @param notebookId
     * @param requestBody
     * @returns NotebookSource OK
     * @throws ApiError
     */
    public static addSource(
        notebookId: string,
        requestBody: Record<string, string>,
    ): CancelablePromise<NotebookSource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notebooks/{notebookId}/sources',
            path: {
                'notebookId': notebookId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param userId
     * @returns Notebook OK
     * @throws ApiError
     */
    public static getUserNotebooks(
        userId: string,
    ): CancelablePromise<Array<Notebook>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notebooks/user/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @param userId
     * @param requestBody
     * @returns Notebook OK
     * @throws ApiError
     */
    public static createNotebook(
        userId: string,
        requestBody: Record<string, string>,
    ): CancelablePromise<Notebook> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notebooks/user/{userId}',
            path: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns Notebook OK
     * @throws ApiError
     */
    public static updateNotebook(
        id: string,
        requestBody: Record<string, string>,
    ): CancelablePromise<Notebook> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/notebooks/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteNotebook(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/notebooks/{id}',
            path: {
                'id': id,
            },
        });
    }
}
