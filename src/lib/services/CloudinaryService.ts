/**
 * Cloudinary Upload Service
 * Handles direct uploads to Cloudinary from the frontend
 */

import type {
    CloudinaryUploadResponse,
    FileValidationResult,
    UploadConfig,
    ACCEPTED_IMAGE_TYPES,
    MAX_FILE_SIZE
} from '@/types/upload';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const
};

/**
 * Validate file before upload
 */
export function validateImageFile(
    file: File,
    config: UploadConfig = {}
): FileValidationResult {
    const maxSize = config.maxSize || DEFAULT_CONFIG.maxSize;
    const acceptedTypes = config.acceptedTypes || DEFAULT_CONFIG.acceptedTypes;

    // Check file type
    if (!acceptedTypes.includes(file.type as any)) {
        return {
            valid: false,
            error: `Type de fichier non accepté. Formats autorisés : ${acceptedTypes
                .map(t => t.split('/')[1].toUpperCase())
                .join(', ')}`
        };
    }

    // Check file size
    if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
        return {
            valid: false,
            error: `Le fichier est trop volumineux. Taille maximale : ${maxSizeMB}MB`
        };
    }

    return { valid: true };
}

/**
 * Upload image to Cloudinary
 * 
 * @param file - The image file to upload
 * @param config - Optional upload configuration
 * @returns Promise resolving to the secure URL of the uploaded image
 * @throws Error if upload fails or configuration is missing
 */
export async function uploadImageToCloudinary(
    file: File,
    config: UploadConfig = {}
): Promise<string> {
    // Validate file
    const validation = validateImageFile(file, config);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Get environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error(
            'Configuration Cloudinary manquante. Veuillez configurer CLOUDINARY_CLOUD_NAME et CLOUDINARY_UPLOAD_PRESET dans vos variables d\'environnement.'
        );
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    // Optional folder configuration
    if (config.folder) {
        formData.append('folder', config.folder);
    }

    try {
        console.log('☁️ [CloudinaryService] Démarrage de l\'upload...', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            folder: config.folder
        });

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [CloudinaryService] Échec de l\'upload HTTP:', {
                status: response.status,
                statusText: response.statusText,
                errorData
            });
            throw new Error(
                errorData.error?.message ||
                `Échec de l'upload (${response.status})`
            );
        }

        const data: CloudinaryUploadResponse = await response.json();
        console.log('✅ [CloudinaryService] Upload réussi ! URL sécurisée:', data.secure_url);

        // Return secure URL
        return data.secure_url;
    } catch (error) {
        console.error('❌ [CloudinaryService] Erreur lors de l\'upload:', error);
        if (error instanceof Error) {
            // Re-throw with user-friendly message
            if (error.message.includes('Failed to fetch')) {
                throw new Error(
                    'Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.'
                );
            }
            throw error;
        }
        throw new Error('Une erreur inattendue s\'est produite lors de l\'upload.');
    }
}

/**
 * Service class for Cloudinary operations
 */
export class CloudinaryService {
    /**
     * Upload an image file to Cloudinary
     */
    static async uploadImage(file: File, config?: UploadConfig): Promise<string> {
        return uploadImageToCloudinary(file, config);
    }

    /**
     * Validate an image file
     */
    static validateFile(file: File, config?: UploadConfig): FileValidationResult {
        return validateImageFile(file, config);
    }
}
