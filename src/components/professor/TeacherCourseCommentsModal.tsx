'use client';
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Loader2 } from 'lucide-react';
import { CourseInteractionControllerService } from '@/lib/services/CourseInteractionControllerService';
import { CourseCommentDTO } from '@/lib/models/CourseCommentDTO';

interface TeacherCourseCommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number | null;
    courseTitle?: string;
}

export default function TeacherCourseCommentsModal({
    isOpen,
    onClose,
    courseId,
    courseTitle,
}: TeacherCourseCommentsModalProps) {
    const [comments, setComments] = useState<CourseCommentDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !courseId) return;
        let cancelled = false;

        const fetchComments = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await CourseInteractionControllerService.getCourseCommentsForTeacher(courseId);
                if (!cancelled) {
                    let data: CourseCommentDTO[] = [];
                    if (Array.isArray(response)) {
                        data = response;
                    } else if (response?.data && Array.isArray(response.data)) {
                        data = response.data;
                    }
                    setComments(data);
                }
            } catch (err) {
                if (!cancelled) setError('Impossible de charger les commentaires.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchComments();
        return () => { cancelled = true; };
    }, [isOpen, courseId]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-purple-100 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                            <MessageCircle className="text-purple-600 dark:text-purple-400" size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Commentaires des participants
                            </h2>
                            {courseTitle && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                    {courseTitle}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-purple-600" size={32} />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500 dark:text-red-400">{error}</p>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageCircle className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={48} />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                Aucun commentaire pour ce cours.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {comments.length} commentaire{comments.length > 1 ? 's' : ''}
                            </p>
                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700"
                                >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {comment.userPhotoUrl ? (
                                            <img
                                                src={comment.userPhotoUrl}
                                                alt={comment.userFullName}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-sm">
                                                {comment.userFullName?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {comment.userFullName || 'Participant inconnu'}
                                            </span>
                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                            {comment.content}
                                        </p>
                                        {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                            <p className="text-xs text-gray-400 mt-1 italic">modifié</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
