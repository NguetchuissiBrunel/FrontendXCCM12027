/**
 * Upload-related TypeScript types
 */

/**
 * Upload state machine states
 */
export type UploadState = 'idle' | 'uploading' | 'success' | 'error';

/**
 * Cloudinary upload response
 */
export interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    bytes: number;
    url: string;
    [key: string]: any;
}

/**
 * Upload result for component state
 */
export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * File validation result
 */
export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Accepted image types
 */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Upload configuration
 */
export interface UploadConfig {
    maxSize?: number;
    acceptedTypes?: readonly string[];
    folder?: string;
}
