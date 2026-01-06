'use client';

import PendingEnrollmentsList from '@/components/dashboard/PendingEnrollmentsList';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TeacherEnrollmentsPage() {
    const { user, loading } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (loading || !isMounted) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
            </div>
        );
    }

    // Protection de route basique
    if (user?.role !== 'teacher') {
        redirect('/dashboard');
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Inscriptions</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Validez les demandes d'accès à vos cours.
                </p>
            </div>

            <div className="space-y-6">
                <PendingEnrollmentsList />
            </div>
        </div>
    );
}
