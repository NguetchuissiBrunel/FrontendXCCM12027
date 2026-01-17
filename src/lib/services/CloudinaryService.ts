import type { FileValidationResult, UploadConfig, CloudinaryUploadResponse } from '@/types/upload';

export class CloudinaryService {
    /**
     * Validate a file against accepted types and size
     */
    public static validateFile(file: File, config?: UploadConfig): FileValidationResult {
        const maxSize = config?.maxSize ?? 5 * 1024 * 1024; // 5MB default
        const accepted = config?.acceptedTypes ?? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (!file) return { valid: false, error: 'No file provided' };

        if (!accepted.includes(file.type)) {
            return { valid: false, error: 'Type de fichier non supporté' };
        }

        if (file.size > maxSize) {
            return { valid: false, error: `Le fichier dépasse la taille maximale (${Math.round(maxSize / 1024 / 1024)}Mo)` };
        }

        return { valid: true };
    }

    /**
     * Upload a file to Cloudinary using unsigned preset configured in env
     * Returns the secure URL string on success
     */
    public static async uploadImage(file: File, config?: UploadConfig): Promise<string> {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !preset) {
            throw new Error('Cloudinary configuration missing (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)');
        }

        const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

        const form = new FormData();
        form.append('file', file);
        form.append('upload_preset', preset);
        if (config?.folder) {
            form.append('folder', config.folder);
        }

        const res = await fetch(url, {
            method: 'POST',
            body: form,
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
        }

        const data = (await res.json()) as CloudinaryUploadResponse;

        if (!data || !data.secure_url) {
            throw new Error('Invalid response from Cloudinary');
        }

        return data.secure_url;
    }
}

export default CloudinaryService;
