'use client';

import React, { useState, useEffect } from 'react';
import { X, School, Plus, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { CourseClassService } from '@/lib/services/CourseClassService';
import toast from 'react-hot-toast';

interface ClassItem {
    id: number;
    name: string;
    theme?: string;
    hasCourse: boolean;
}

interface AssignCourseToClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number | null;
    courseTitle?: string;
    onUpdated?: () => void;
}

export default function AssignCourseToClassModal({
    isOpen,
    onClose,
    courseId,
    courseTitle,
    onUpdated,
}: AssignCourseToClassModalProps) {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && courseId) {
            document.body.style.overflow = 'hidden';
            loadClasses();
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, courseId]);

    const loadClasses = async () => {
        if (!courseId) return;
        try {
            setLoading(true);
            const classesRes = await CourseClassService.getMyClasses();
            const allClasses = (classesRes.data || []) as any[];

            // For each class, check if the course is already assigned
            const enriched: ClassItem[] = allClasses.map((cls: any) => {
                const coursesInClass: any[] = cls.courses || [];
                const hasCourse = coursesInClass.some((c: any) => Number(c.id) === Number(courseId));
                return {
                    id: cls.id,
                    name: cls.name || `Classe #${cls.id}`,
                    theme: cls.theme,
                    hasCourse,
                };
            });
            setClasses(enriched);
        } catch (error) {
            console.error('Erreur chargement classes:', error);
            toast.error('Impossible de charger les classes');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (cls: ClassItem) => {
        if (!courseId) return;
        setActionLoading(cls.id);
        try {
            if (cls.hasCourse) {
                await CourseClassService.removeCourseFromClass(cls.id, courseId);
                toast.success(`Cours retiré de « ${cls.name} »`);
            } else {
                await CourseClassService.addCourseToClass(cls.id, courseId);
                toast.success(`Cours affecté à « ${cls.name} »`);
            }
            // Optimistic update
            setClasses(prev =>
                prev.map(c => c.id === cls.id ? { ...c, hasCourse: !c.hasCourse } : c)
            );
            onUpdated?.();
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de l\'opération');
        } finally {
            setActionLoading(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <School className="text-purple-600 dark:text-purple-400" />
                        Affecter à une classe
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {courseTitle && (
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-5 bg-purple-50 dark:bg-purple-900/20 rounded-lg px-3 py-2">
                        Cours : <span className="font-bold">{courseTitle}</span>
                    </p>
                )}

                <div className="flex-1 overflow-y-auto pr-1">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
                        </div>
                    ) : classes.length === 0 ? (
                        <p className="text-sm text-gray-500 italic text-center py-8">
                            Vous n'avez pas encore créé de classe. Créez d'abord une classe dans l'onglet « Classes ».
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {classes.map(cls => (
                                <div
                                    key={cls.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${cls.hasCourse
                                            ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                                            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/20 hover:border-purple-300'
                                        }`}
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{cls.name}</p>
                                        {cls.theme && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cls.theme}</p>
                                        )}
                                        {cls.hasCourse && (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1">
                                                <CheckCircle size={12} /> Déjà affecté
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleToggle(cls)}
                                        disabled={actionLoading === cls.id}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${cls.hasCourse
                                                ? 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
                                                : 'text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                                            }`}
                                    >
                                        {actionLoading === cls.id ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : cls.hasCourse ? (
                                            <><Trash2 size={16} /> Retirer</>
                                        ) : (
                                            <><Plus size={16} /> Affecter</>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
