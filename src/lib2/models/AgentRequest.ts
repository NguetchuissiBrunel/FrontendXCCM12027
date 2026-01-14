/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AgentRequest = {
    course_context?: string;
    difficulty_level?: AgentRequest.difficulty_level;
    discipline: AgentRequest.discipline;
    question: string;
    user_id?: string;
    user_role: AgentRequest.user_role;
};
export namespace AgentRequest {
    export enum difficulty_level {
        BEGINNER = 'beginner',
        INTERMEDIATE = 'intermediate',
        ADVANCED = 'advanced',
    }
    export enum discipline {
        MATHEMATICS = 'mathematics',
        PHYSICS = 'physics',
        COMPUTER_SCIENCE = 'computer_science',
        LIFE_SCIENCES = 'life_sciences',
        DATABASES = 'databases',
        ARTIFICIAL_INTELLIGENCE = 'artificial_intelligence',
        GENERAL = 'general',
    }
    export enum user_role {
        STUDENT = 'student',
        TEACHER = 'teacher',
        ADMIN = 'admin',
    }
}

