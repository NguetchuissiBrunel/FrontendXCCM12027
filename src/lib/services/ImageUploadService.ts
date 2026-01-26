/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImageUploadService {
    /**
     * Upload an image
     * Uploads an image file to Cloudinary and returns the public URL
     * @param formData
     * @returns any OK
     * @throws ApiError
     */
    public static uploadImage1(
        formData?: {
            file: Blob;
        },
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/images/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
