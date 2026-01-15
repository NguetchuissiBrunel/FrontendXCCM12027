'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Info, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    type = 'danger',
    isLoading = false
}) => {
    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const colors = {
        danger: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            icon: 'text-red-600 dark:text-red-400',
            button: 'bg-red-600 hover:bg-red-700 text-white',
            border: 'border-red-100 dark:border-red-900/30'
        },
        warning: {
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            icon: 'text-amber-600 dark:text-amber-400',
            button: 'bg-amber-600 hover:bg-amber-700 text-white',
            border: 'border-amber-100 dark:border-amber-900/30'
        },
        info: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            icon: 'text-blue-600 dark:text-blue-400',
            button: 'bg-blue-600 hover:bg-blue-700 text-white',
            border: 'border-blue-100 dark:border-blue-900/30'
        }
    };

    const currentColors = colors[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-white border-purple-600 border-3 dark:bg-gray-800 border-purple-600 border-3 rounded-2xl shadow-2xl   dark: overflow-hidden"
                    >
                        {/* Header / Icon */}
                        <div className={`p-6 pb-0 flex items-start gap-4`}>
                            <div className={`shrink-0 p-3 rounded-xl ${currentColors.bg} ${currentColors.icon}`}>
                                {type === 'danger' && <AlertTriangle size={24} />}
                                {type === 'warning' && <HelpCircle size={24} />}
                                {type === 'info' && <Info size={24} />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {title}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                disabled={isLoading}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {message}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="p-6 pt-2 flex items-center justify-end gap-3 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`px-6 py-2 text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2 ${currentColors.button}`}
                            >
                                {isLoading && (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
