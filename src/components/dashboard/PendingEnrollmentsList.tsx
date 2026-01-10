'use client';

import { useState, useEffect } from 'react';
import { EnrollmentService } from '@/utils/enrollmentService';
import { Enrollment } from '@/types/enrollment';
import { Check, X, Loader2, User, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PendingEnrollmentsList() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        fetchPendingEnrollments();
    }, []);

    const fetchPendingEnrollments = async () => {
        setLoading(true);
        try {
            const data = await EnrollmentService.getPendingEnrollments();
            setEnrollments(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des enrôlements en attente:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidation = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        setProcessingId(id);
        try {
            await EnrollmentService.validateEnrollment(id, status);
            // Retirer l'élément de la liste
            setEnrollments(prev => prev.filter(e => e.id !== id));

            // Feedback utilisateur (optionnel, pourrait être un toast)
            console.log(`Enrôlement ${status === 'APPROVED' ? 'validé' : 'rejeté'} avec succès`);
        } catch (error) {
            console.error(`Erreur lors de la ${status === 'APPROVED' ? 'validation' : 'rejet'}:`, error);
        } finally {
            setProcessingId(null);
        }
    };

    // Si l'utilisateur n'est pas un prof, ne rien afficher (sécurité côté client)
    if (user?.role !== 'teacher') return null;

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (enrollments.length === 0) {
        return (
            <div className="text-center py-20 bg-white/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-purple-200 dark:border-gray-700">
                <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-10 w-10 text-purple-300 dark:text-purple-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tout est à jour !</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                    Il n'y a aucune demande d'inscription en attente pour le moment.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
                    Demandes ({enrollments.length})
                </h2>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                    Action requise
                </span>
            </div>

            <div className="grid gap-4">
                {enrollments.map((enrollment) => (
                    <div
                        key={enrollment.id}
                        className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-purple-500/10 border border-gray-100 dark:border-gray-700 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <User className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                                    Étudiant #{enrollment.userId}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        Cours #{enrollment.courseId}
                                    </span>
                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                        Demandé le {new Date(enrollment.enrolledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => handleValidation(enrollment.id, 'APPROVED')}
                                disabled={processingId === enrollment.id}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
                            >
                                {processingId === enrollment.id ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Check className="h-5 w-5" />
                                )}
                                <span>Accepter</span>
                            </button>

                            <button
                                onClick={() => handleValidation(enrollment.id, 'REJECTED')}
                                disabled={processingId === enrollment.id}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
                            >
                                <X className="h-5 w-5" />
                                <span>Rejeter</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
