'use client';

import PendingEnrollmentsList from '@/components/dashboard/PendingEnrollmentsList';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useLoading } from '@/contexts/LoadingContext';

export default function TeacherEnrollmentsPage() {
    const { user, loading: authLoading } = useAuth();
    const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (authLoading || !isMounted) {
            startLoading();
        } else {
            stopLoading();
        }
    }, [authLoading, isMounted, startLoading, stopLoading]);

    if (authLoading || !isMounted || globalLoading) {
        return null;
    }

    // Protection de route basique
    if (user?.role !== 'teacher') {
        router.push('/login');
        return null;
    }

    const displayName = (user.firstName || user.lastName)
        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
        : user.email.split('@')[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <button
                            onClick={() => router.push('/profdashboard')}
                            className="flex items-center text-purple-600 dark:text-purple-400 font-medium mb-4 hover:translate-x-[-4px] transition-transform"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Retour au Dashboard
                        </button>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Gestion des <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">Inscriptions</span>
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
                            Consultez et validez les demandes d'accès des étudiants à vos contenus pédagogiques.
                        </p>
                    </div>

                </div>

                {/* List Container */}
                <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-2 sm:p-6 shadow-xl shadow-purple-500/5 border border-white dark:border-gray-700">
                    <PendingEnrollmentsList />
                </div>

                {/* Simple Footer/Info */}
                <div className="mt-8 text-center text-gray-400 text-sm">
                    <p>© {new Date().getFullYear()} XCCM1 • Plateforme Pédagogique Intelligente</p>
                </div>
            </div>
        </div>
    );
}
