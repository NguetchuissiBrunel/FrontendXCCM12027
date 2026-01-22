/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { ContactRequest } from '../models/ContactRequest';
import type { NewsletterRequest } from '../models/NewsletterRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PublicServicesService {
    /**
     * Inscription à la newsletter
     * @param requestBody
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static subscribeNewsletter(
        requestBody: NewsletterRequest,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/newsletter',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Formulaire de contact
     * @param requestBody
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static contactUs(
        requestBody: ContactRequest,
    ): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/contact',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
