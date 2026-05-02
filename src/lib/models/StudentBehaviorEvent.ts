/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type StudentBehaviorEvent = {
    id?: number;
    student?: User;
    eventType?: StudentBehaviorEvent.eventType;
    granuleId?: number;
    notion?: string;
    rawScore?: number;
    durationSeconds?: number;
    readDepthPercent?: number;
    metadata?: string;
    occurredAt?: string;
};
export namespace StudentBehaviorEvent {
    export enum eventType {
        EXERCISE_SUBMITTED = 'EXERCISE_SUBMITTED',
        QUIZ_ANSWERED = 'QUIZ_ANSWERED',
        CONTENT_READ = 'CONTENT_READ',
        VIDEO_WATCHED = 'VIDEO_WATCHED',
        DOCUMENT_DOWNLOADED = 'DOCUMENT_DOWNLOADED',
        AI_QUESTION_ASKED = 'AI_QUESTION_ASKED',
        AI_REFORMULATION_REQUESTED = 'AI_REFORMULATION_REQUESTED',
        NOTEBOOK_ANALYZED = 'NOTEBOOK_ANALYZED',
    }
}

