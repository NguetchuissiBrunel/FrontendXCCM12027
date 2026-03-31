'use client';

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, XCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import { CloudinaryService } from '@/lib/services/CloudinaryService';
import type { UploadState, UploadConfig } from '@/types/upload';

interface ImageUploaderProps {
    onUploadComplete: (url: string) => void;
    onUploadError?: (error: string) => void;
    currentImageUrl?: string;
    config?: UploadConfig;
    className?: string;
    placeholder?: string;
}

/**
 * Reusable image uploader component with Cloudinary integration
 * Features: drag-and-drop, preview, progress indication, error handling
 */
export default function ImageUploader({
    onUploadComplete,
    onUploadError,
    currentImageUrl,
    config,
    className = '',
    placeholder = 'Cliquez ou glissez une image ici'
}: ImageUploaderProps) {
    const { startLoading, stopLoading, isLoading: globalLoading } = useLoading();
    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Handle file upload
     */
    const handleFileUpload = async (file: File) => {
        // Reset states
        setError(null);
        setUploadState('uploading');
        startLoading();

        // Validate file first
        const validation = CloudinaryService.validateFile(file, config);
        if (!validation.valid) {
            setError(validation.error || 'Fichier invalide');
            setUploadState('error');
            if (onUploadError) {
                onUploadError(validation.error || 'Fichier invalide');
            }
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        try {
            // Upload to Cloudinary
            const url = await CloudinaryService.uploadImage(file, config);

            setUploadState('success');
            onUploadComplete(url);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
            setError(errorMessage);
            setUploadState('error');
            setPreviewUrl(currentImageUrl || null);

            if (onUploadError) {
                onUploadError(errorMessage);
            }
        } finally {
            stopLoading();
        }
    };

    /**
     * Handle file input change
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    /**
     * Handle drag events
     */
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    /**
     * Trigger file input click
     */
    const handleClick = () => {
        if (uploadState !== 'uploading') {
            fileInputRef.current?.click();
        }
    };

    /**
     * Get border color based on state
     */
    const getBorderColor = () => {
        if (uploadState === 'error') return 'border-red-400 dark:border-red-500';
        if (uploadState === 'success') return 'border-green-400 dark:border-green-500';
        if (isDragging) return 'border-purple-500 dark:border-purple-400';
        if (previewUrl) return 'border-purple-400 dark:border-purple-500';
        return 'border-gray-200 dark:border-gray-700';
    };

    /**
     * Get background color based on state
     */
    const getBackgroundColor = () => {
        if (isDragging) return 'bg-purple-50/50 dark:bg-purple-900/20';
        if (!previewUrl) return 'bg-gray-50 dark:bg-gray-900/50';
        return 'bg-transparent';
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Upload area */}
            <div
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-2xl transition-all h-40
          flex flex-col items-center justify-center overflow-hidden
          ${globalLoading ? 'cursor-wait' : 'cursor-pointer'}
          ${getBorderColor()}
          ${getBackgroundColor()}
          hover:border-purple-400 hover:bg-purple-50/30 dark:hover:bg-purple-900/20
        `}
            >
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Preview or upload UI */}
                {previewUrl && !globalLoading ? (
                    <div className="relative w-full h-full">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        {uploadState === 'success' && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                                <CheckCircle size={16} />
                            </div>
                        )}
                    </div>
                ) : globalLoading ? (
                    <div className="text-center p-4">
                        <Loader2 size={32} className="mx-auto mb-3 text-purple-500 animate-spin" />
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            Upload en cours...
                        </span>
                    </div>
                ) : (
                    <div className="text-center p-4">
                        <Upload size={24} className="mx-auto mb-2 text-purple-500" />
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            {placeholder}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            JPG, PNG, WEBP (Max 5Mo)
                        </span>
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && uploadState === 'error' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg">
                    <XCircle size={18} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        {error}
                    </p>
                </div>
            )}

            {/* Success message */}
            {uploadState === 'success' && !error && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg">
                    <CheckCircle size={18} className="text-green-500 dark:text-green-400" />
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Image uploadée avec succès
                    </p>
                </div>
            )}
        </div>
    );
}
