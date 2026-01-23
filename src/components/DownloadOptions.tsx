'use client';

import React from 'react';
import { Download, FileText, File as FilePdf, X, Layout, Tv, BookUp } from 'lucide-react';

interface DownloadOptionsProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPdf: (orientation: 'p' | 'l') => void;
    onSelectWord: () => void;
    isPdfLoading: boolean;
    isWordLoading: boolean;
}

export default function DownloadOptions({
    isOpen,
    onClose,
    onSelectPdf,
    onSelectWord,
    isPdfLoading,
    isWordLoading
}: DownloadOptionsProps) {
    const [showPdfOrientations, setShowPdfOrientations] = React.useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal content */}
            <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-purple-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-600 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 hover:bg-white/20 p-2 rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Download size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">Exporter le cours</h2>
                            <p className="text-purple-100 font-medium opacity-90">Choisissez le format</p>
                        </div>
                    </div>
                </div>

                {/* Options */}
                <div className="p-8">
                    {!showPdfOrientations ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* PDF Option */}
                            <button
                                onClick={() => setShowPdfOrientations(true)}
                                disabled={isPdfLoading}
                                className="group relative bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-100 dark:border-purple-900/20 rounded-[2rem] p-8 transition-all hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/10"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <FilePdf size={40} className="text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Format PDF</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Idéal pour l'impression et la lecture stable</p>
                                </div>
                                {isPdfLoading && null}
                            </button>

                            {/* Word Option */}
                            <button
                                onClick={onSelectWord}
                                disabled={isWordLoading}
                                className="group relative bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/20 rounded-[2rem] p-8 transition-all hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <FileText size={40} className="text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Format Word</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Idéal pour l'édition et la prise de notes</p>
                                </div>
                                {isWordLoading && null}
                            </button>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                            <button
                                onClick={() => setShowPdfOrientations(false)}
                                className="text-purple-600 font-bold flex items-center gap-2 mb-6 hover:translate-x-[-4px] transition-transform"
                            >
                                ← Retour au choix du format
                            </button>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Orientation du PDF</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => onSelectPdf('p')}
                                    className="p-6 border-2 border-purple-100 dark:border-gray-800 rounded-3xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                                >
                                    <div className="w-16 h-24 border-2 border-purple-300 rounded-md mx-auto mb-4 group-hover:bg-white flex items-center justify-center">
                                        <BookUp className="text-purple-500" />
                                    </div>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">Portrait</span>
                                </button>

                                <button
                                    onClick={() => onSelectPdf('l')}
                                    className="p-6 border-2 border-purple-100 dark:border-gray-800 rounded-3xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                                >
                                    <div className="w-24 h-16 border-2 border-purple-300 rounded-md mx-auto mb-4 group-hover:bg-white flex items-center justify-center mt-4">
                                        <Tv className="text-purple-500" />
                                    </div>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">Paysage</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <Layout size={14} className="text-purple-400" />
                        XCCM Engine
                    </p>
                </div>
            </div>
        </div>
    );
}
