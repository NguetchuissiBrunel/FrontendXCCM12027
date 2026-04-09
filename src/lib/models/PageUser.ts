/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PageableObject } from './PageableObject';
import type { SortObject } from './SortObject';
import type { User } from './User';
export type PageUser = {
    totalPages?: number;
    totalElements?: number;
    pageable?: PageableObject;
    size?: number;
    content?: Array<User>;
    number?: number;
    sort?: SortObject;
    numberOfElements?: number;
    first?: boolean;
    last?: boolean;
    empty?: boolean;
};

