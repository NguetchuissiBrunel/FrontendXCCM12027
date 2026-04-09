'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { ClassesDeCoursService } from '@/lib/services/ClassesDeCoursService';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Course {
    id: number;
    title: string;
    category: string;
    status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

interface CourseClass {
    id: number;
    name: string;
    courses?: Course[];
}

interface ManageClassCoursesModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: number | null;
    onCourseUpdated?: () => void;
}

export default function ManageClassCoursesModal({ isOpen, onClose, classId, onCourseUpdated }: ManageClassCoursesModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [classData, setClassData] = useState<CourseClass | null>(null);

    useEffect(() => {
        if (isOpen && classId && user) {
            document.body.style.overflow = 'hidden';
            loadData();
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, classId, user]);

    const loadData = async () => {
        if (!classId || !user) return;
        try {
            setLoading(true);
            // Fetch all author courses
            const coursesRes = await CourseControllerService.getAuthorCourses(user.id);
            const allCoursesData = (coursesRes.data || []).filter((c: any) => c.id !== undefined) as Course[];
            setAllCourses(allCoursesData);

            // Fetch specific class data
            const classRes = await ClassesDeCoursService.getClassById(classId);
            const classDetails = classRes.data;
            setClassData({
                id: classDetails.id,
                name: classDetails.name,
                courses: classDetails.courses || []
            });
        } catch (error) {
            console.error('Failed to load courses for class management', error);
            toast.error('Erreur lors du chargement des cours');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = async (courseId: number) => {
        if (!classId) return;
        try {
            setActionLoading(courseId);
            await ClassesDeCoursService.addCourse(classId, courseId);
            toast.success('Cours ajouté à la classe');
            await loadData(); // reload data to refresh lists
            if (onCourseUpdated) onCourseUpdated();
        } catch (error) {
            console.error(error);
            toast.error("Impossible d'ajouter le cours à la classe");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveCourse = async (courseId: number) => {
        if (!classId) return;
        try {
            setActionLoading(courseId);
            await ClassesDeCoursService.removeCourse(classId, courseId);
            toast.success('Cours retiré de la classe');
            await loadData(); // reload data to refresh lists
            if (onCourseUpdated) onCourseUpdated();
        } catch (error) {
            console.error(error);
            toast.error('Impossible de retirer ce cours');
        } finally {
            setActionLoading(null);
        }
    };

    if (!isOpen) return null;

    const assignedCourseIds = new Set((classData?.courses || []).map(c => c.id));
    const unassignedCourses = allCourses.filter(c => !assignedCourseIds.has(c.id));
    const assignedCourses = classData?.courses || [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-xl flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="text-purple-600 dark:text-purple-400" />
                        Gestion des Cours dans la Classe
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {classData && (
                    <p className="text-purple-600 dark:text-purple-400 font-medium mb-6">
                        Classe: {classData.name}
                    </p>
                )}

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Added Courses */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                                    Cours dans cette classe ({assignedCourses.length})
                                </h4>
                                {assignedCourses.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Aucun cours n'a été ajouté à cette classe pour le moment.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {assignedCourses.map(course => (
                                            <div key={`assigned-${course.id}`} className="flex items-center justify-between p-3 rounded-lg border border-purple-200 bg-purple-50/50 dark:border-gray-700 dark:bg-gray-700/50">
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{course.title}</p>
                                                    <div className="flex items-center gap-2 text-xs mt-1">
                                                        <span className="text-purple-600 dark:text-purple-400">{course.category}</span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-500 flex items-center gap-1">
                                                            {course.status === 'PUBLISHED' ? <><CheckCircle size={10} className="text-green-500" /> Publié</> : <><Clock size={10} className="text-amber-500" /> Brouillon</>}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveCourse(course.id)}
                                                    disabled={actionLoading === course.id}
                                                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    <Trash2 size={16} /> Retire
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Unassigned Courses */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                                    Cours disponibles ({unassignedCourses.length})
                                </h4>
                                {allCourses.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Vous n'avez créé aucun cours. Veuillez en créer un d'abord.</p>
                                ) : unassignedCourses.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Tous vos cours sont déjà dans cette classe.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {unassignedCourses.map(course => (
                                            <div key={`unassigned-${course.id}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-700/20 hover:border-purple-300 transition-colors">
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{course.title}</p>
                                                    <div className="flex items-center gap-2 text-xs mt-1">
                                                        <span className="text-purple-600 dark:text-purple-400">{course.category}</span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-500 flex items-center gap-1">
                                                            {course.status === 'PUBLISHED' ? <><CheckCircle size={10} className="text-green-500" /> Publié</> : <><Clock size={10} className="text-amber-500" /> Brouillon</>}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAddCourse(course.id)}
                                                    disabled={actionLoading === course.id}
                                                    className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    <Plus size={16} /> Ajouter
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
