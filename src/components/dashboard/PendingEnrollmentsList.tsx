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
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">Aucune demande d'inscription en attente.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Demandes d'inscription ({enrollments.length})
            </h2>

            <div className="grid gap-3">
                {enrollments.map((enrollment) => (
                    <div
                        key={enrollment.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3 mb-3 sm:mb-0">
                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {/* Note: Dans un cas réel, l'objet Enrollment devrait inclure les détails de l'utilisateur et du cours. 
                        Ici, on affiche des infos basiques si disponíveis, ou des IDs.
                        Il faudrait enrichir le DTO côté backend pour avoir user.name et course.title ici.
                    */}
                                    Étudiant #{enrollment.userId}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Cours #{enrollment.courseId} • {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => handleValidation(enrollment.id, 'APPROVED')}
                                disabled={processingId === enrollment.id}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {processingId === enrollment.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                <span>Valider</span>
                            </button>

                            <button
                                onClick={() => handleValidation(enrollment.id, 'REJECTED')}
                                disabled={processingId === enrollment.id}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                                <span>Rejeter</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
