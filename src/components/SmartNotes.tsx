'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StickyNote, ChevronRight, ChevronLeft, Download, Trash2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmModal from './ui/ConfirmModal';

interface SmartNotesProps {
    courseId: number;
    courseTitle: string;
}

export default function SmartNotes({ courseId, courseTitle }: SmartNotesProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load notes from localStorage
    useEffect(() => {
        const savedNotes = localStorage.getItem(`course_notes_${courseId}`);
        if (savedNotes) {
            setNotes(savedNotes);
            setLastSaved(new Date().toLocaleTimeString());
        }
    }, [courseId]);

    // Auto-save to localStorage
    useEffect(() => {
        const timer = setTimeout(() => {
            if (notes) {
                localStorage.setItem(`course_notes_${courseId}`, notes);
                setLastSaved(new Date().toLocaleTimeString());
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [notes, courseId]);

    const handleDownload = (format: 'txt' | 'doc') => {
        const content = `Notes pour : ${courseTitle}\n\n${notes}`;
        const element = document.createElement("a");

        if (format === 'txt') {
            const file = new Blob([content], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = `Notes_${courseTitle.replace(/\s+/g, '_')}.txt`;
        } else {
            const htmlNotes = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'><title>Notes - ${courseTitle}</title></head>
                <body style="font-family: Arial, sans-serif;">
                    <h1 style="color: #5B21B6; text-align: center;">Mes Notes de Cours</h1>
                    <h2 style="color: #7C3AED;">Cours : ${courseTitle}</h2>
                    <hr/>
                    <div style="white-space: pre-wrap; line-height: 1.6; text-align: justify;">${notes.replace(/\nSource:/g, '<br/><br/>Source:')}</div>
                </body>
                </html>
            `;
            const file = new Blob([htmlNotes], { type: 'application/msword' });
            element.href = URL.createObjectURL(file);
            element.download = `Notes_${courseTitle.replace(/\s+/g, '_')}.doc`;
        }

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleClear = () => {
        setIsConfirmOpen(true);
    };

    const confirmClear = () => {
        setNotes('');
        localStorage.removeItem(`course_notes_${courseId}`);
        setLastSaved(null);
        setIsConfirmOpen(false);
        toast.success('Notes effacées');
    };

    return (
        <>
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmClear}
                title="Effacer les notes"
                message="Voulez-vous vraiment effacer toutes vos notes pour ce cours ? Cette action est irréversible."
                confirmText="Effacer tout"
                type="danger"
            />
            <div
                className={`fixed top-1/2 -translate-y-1/2 right-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-48px)]'
                    }`}
            >
                <div className="flex items-stretch shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] ring-1 ring-purple-500/10">
                    {/* Toggle Button / Edge */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-12 bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center py-6 rounded-l-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                        {isOpen ? <ChevronRight className="mb-4 relative z-10" /> : <ChevronLeft className="mb-4 animate-pulse relative z-10" />}
                        <StickyNote className="w-5 h-5 relative z-10" />
                        <span className="[writing-mode:vertical-lr] rotate-180 mt-4 font-bold text-[10px] uppercase tracking-[0.2em] hidden group-hover:block transition-all relative z-10">
                            Bloc-Notes
                        </span>
                    </button>

                    {/* Main Panel - Glassmorphism */}
                    <div className="w-[380px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-l border-white/20 p-6 h-[550px] flex flex-col rounded-r-none">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <StickyNote className="text-purple-500" size={24} />
                                    Mes Réflexions
                                </h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{courseTitle}</p>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleDownload('txt')}
                                    title="Télécharger en Texte"
                                    className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg"
                                >
                                    <Download size={18} />
                                </button>
                                <button
                                    onClick={handleClear}
                                    title="Effacer tout"
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="relative flex-1 group">
                            <textarea
                                ref={textareaRef}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Vos idées, sources, rappels..."
                                className="w-full h-full p-5 bg-purple-50/20 dark:bg-gray-800/40 rounded-2xl border border-purple-100/50 dark:border-gray-700/50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 transition-all resize-none text-gray-700 dark:text-gray-200 leading-relaxed font-medium placeholder:text-gray-400/60"
                            />
                            <div className="absolute bottom-4 right-4 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity">
                                <Save size={14} className="text-purple-300" />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">
                            <span className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                XCCM
                            </span>
                            {lastSaved && <span>Auto-sauvé à {lastSaved}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
