/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BehaviorEventRequest } from '../models/BehaviorEventRequest';
import type { StudentBehaviorEvent } from '../models/StudentBehaviorEvent';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BehaviorControllerService {
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static logBehaviorEvent(
        requestBody: BehaviorEventRequest,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/behavior/log',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param studentId
     * @returns StudentBehaviorEvent OK
     * @throws ApiError
     */
    public static getStudentBehavior(
        studentId: string,
    ): CancelablePromise<Array<StudentBehaviorEvent>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/behavior/{studentId}',
            path: {
                'studentId': studentId,
            },
        });
    }
}
