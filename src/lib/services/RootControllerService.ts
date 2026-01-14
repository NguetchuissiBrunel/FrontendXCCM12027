/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseMapStringString } from '../models/ApiResponseMapStringString';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RootControllerService {
    /**
     * @returns ApiResponseMapStringString OK
     * @throws ApiError
     */
    public static index(): CancelablePromise<ApiResponseMapStringString> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/',
        });
    }
}
