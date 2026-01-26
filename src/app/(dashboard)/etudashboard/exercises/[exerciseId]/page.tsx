// src/app/(dashboard)/etudashboard/exercises/[exerciseId]/page.tsx
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useExercise, useSubmissionPermission } from '@/hooks/useExercise';
import { useAuth } from '@/contexts/AuthContext';
import { useLoading } from '@/contexts/LoadingContext';
import Sidebar from '@/components/Sidebar';
import {
    ArrowLeft,
    Clock,
    FileText,
    CheckCircle,
    AlertCircle,
    PlayCircle,
    Calendar,
    BookOpen,
    Award
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExerciseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const exerciseId = parseInt(params.exerciseId as string);

    const { user, loading: authLoading } = useAuth();
    const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();

    const {
        exercise,
        isLoading: exerciseLoading,
        error: exerciseError
    } = useExercise(exerciseId);

    const {
        canSubmit,
        reason,
        isLoading: permissionLoading
    } = useSubmissionPermission(exerciseId);

    // Synchroniser le loader global
    useEffect(() => {
        if (authLoading || exerciseLoading || permissionLoading) {
            startLoading();
        } else {
            stopLoading();
        }
    }, [authLoading, exerciseLoading, permissionLoading, startLoading, stopLoading]);

    if (authLoading || exerciseLoading || permissionLoading || globalLoading) {
        return null;
    }

    if (exerciseError || !exercise) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Exercice introuvable</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        L'exercice demandé n'existe pas ou n'est plus accessible.
                    </p>
                    <button
                        onClick={() => router.push('/etudashboard/exercises')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                        Retour aux exercices
                    </button>
                </div>
            </div>
        );
    }

    const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Étudiant';
    const userRole = user?.specialization || 'Étudiant';

    return (
        <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <Sidebar
                userRole="student"
                userName={displayName}
                userLevel={userRole}
                activeTab="exercices"
            />

            <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64 pt-20 lg:pt-8">
                <button
                    onClick={() => router.push('/etudashboard/exercises')}
                    className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-8"
                >
                    <ArrowLeft size={20} />
                    <span>Retour à la liste</span>
                </button>

                <div className="max-w-4xl">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-xl shadow-purple-500/5 border border-purple-100 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                            <div className="flex-1">
                                <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mb-4 inline-block">
                                    {exercise.courseTitle || 'Exercice'}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                                    {exercise.title}
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                    {exercise.description || 'Aucune description disponible pour cet exercice.'}
                                </p>
                            </div>

                            <div className="w-full md:w-auto bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/50">
                                <div className="text-center">
                                    <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-1">
                                        {exercise.maxScore}
                                    </div>
                                    <div className="text-sm font-bold text-purple-500 dark:text-purple-400 uppercase tracking-widest">
                                        Points Max
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-purple-600">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Échéance</div>
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        {exercise.dueDate ? new Date(exercise.dueDate).toLocaleDateString('fr-FR') : 'Sans limite'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Questions</div>
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        {exercise.questions?.length || 0} items
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                                <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Tentatives</div>
                                    <div className="font-bold text-gray-900 dark:text-white">1 seule</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {canSubmit ? (
                                <button
                                    onClick={() => router.push(`/etudashboard/exercises/${exerciseId}/submit`)}
                                    className="w-full sm:flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-1 transition-all"
                                >
                                    <PlayCircle size={24} />
                                    Commencer l'exercice
                                </button>
                            ) : (
                                <div className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-600 dark:text-red-400">
                                    <AlertCircle size={20} />
                                    <span className="font-medium">{reason || "Vous ne pouvez pas participer à cet exercice."}</span>
                                </div>
                            )}

                            {exercise.alreadySubmitted && (
                                <button
                                    onClick={() => router.push('/etudashboard/submissions')}
                                    className="w-full sm:w-auto px-8 py-4 border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-2xl font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                                >
                                    Voir mon résultat
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <Clock size={18} />
                            Consignes importantes
                        </h4>
                        <ul className="text-blue-700 dark:text-blue-400 text-sm space-y-2 list-disc list-inside">
                            <li>Une fois l'exercice commencé, vous devrez aller jusqu'au bout pour que vos réponses soient enregistrées.</li>
                            <li>Assurez-vous d'avoir une connexion stable avant de lancer le chronomètre.</li>
                            <li>Toute tentative de sortie de la page pourrait invalider votre session.</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
