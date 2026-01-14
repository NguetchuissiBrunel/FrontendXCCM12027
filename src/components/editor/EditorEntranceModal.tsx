'use client';

import React from 'react';
import { Plus, Edit, X, BookOpen, Clock, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreateNew: () => void;
    onModifyExisting: () => void;
}

export default function EditorEntranceModal({ isOpen, onClose, onCreateNew, onModifyExisting }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-purple-100 dark:border-gray-700 w-full max-w-2xl flex flex-col"
            >
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/50 dark:bg-purple-900/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/50 dark:bg-blue-900/10 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
                >
                    <X size={24} />
                </button>

                <div className="p-8 sm:p-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                            Bienvenue dans l'Éditeur <span className="text-purple-600">XCCM</span>
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Que souhaitez-vous faire aujourd'hui ?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Create New Option */}
                        <button
                            onClick={onCreateNew}
                            className="group relative flex flex-col items-center p-8 bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-100 dark:border-purple-800/50 rounded-3xl hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/10"
                        >
                            <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 dark:shadow-none group-hover:scale-110 transition-transform">
                                <Plus size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Créer un cours</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                                Commencer un nouveau projet à partir de zéro
                            </p>
                        </button>

                        {/* Modify Existing Option */}
                        <button
                            onClick={onModifyExisting}
                            className="group relative flex flex-col items-center p-8 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800/50 rounded-3xl hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10"
                        >
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 dark:shadow-none group-hover:scale-110 transition-transform">
                                <Edit size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Modifier un cours</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                                Reprendre le travail sur une de vos compositions
                            </p>
                        </button>
                    </div>

                    {/* Quick Info / Stats */}
                    <div className="mt-12 flex items-center justify-around py-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <BookOpen size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wider">Premium Editor</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <Clock size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wider">Auto-sauvegarde</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <FileText size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wider">Export PDF/Word</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
