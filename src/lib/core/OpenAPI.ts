/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from './ApiRequestOptions';

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
type Headers = Record<string, string>;

export type OpenAPIConfig = {
    BASE: string;
    VERSION: string;
    WITH_CREDENTIALS: boolean;
    CREDENTIALS: 'include' | 'omit' | 'same-origin';
    TOKEN?: string | Resolver<string> | undefined;
    USERNAME?: string | Resolver<string> | undefined;
    PASSWORD?: string | Resolver<string> | undefined;
    HEADERS?: Headers | Resolver<Headers> | undefined;
    ENCODE_PATH?: ((path: string) => string) | undefined;
};

/**
 * Détection de l'environnement
 * Durant 'npm run build', isBrowser est false.
 */
const isBrowser = typeof window !== 'undefined';

export const OpenAPI: OpenAPIConfig = {
    /**
     * SÉCURITÉ DE BUILD : 
     * Si nous sommes côté serveur durant le build, BASE est vide ('').
     * En production (navigateur), on utilise l'URL Render ou la variable d'env.
     */
    BASE: isBrowser 
        ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://xccm1-backend-0m4d.onrender.com')
        : '', 
    VERSION: '1.0.0',
    WITH_CREDENTIALS: true, 
    CREDENTIALS: 'include',
    TOKEN: undefined,
    USERNAME: undefined,
    PASSWORD: undefined,
    HEADERS: undefined,
    ENCODE_PATH: undefined,
};
