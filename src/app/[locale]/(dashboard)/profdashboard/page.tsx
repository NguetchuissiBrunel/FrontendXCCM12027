'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import HomeView from '@/components/dashboard/teacher/HomeView';
import ClassesView from '@/components/dashboard/teacher/ClassesView';
import InscriptionsView from '@/components/dashboard/teacher/InscriptionsView';
import ExercisesView from '@/components/dashboard/teacher/ExercisesView';
import DashboardSkeleton from '@/components/professor/DashboardSkeleton';

export default function ProfDashboardSPA() {
    const { user, isAuthenticated, loading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const tab = searchParams?.get('tab') || 'accueil';

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        } else if (!loading && user && user.role !== 'teacher') {
            router.push('/etudashboard');
        }
    }, [user, loading, isAuthenticated, router]);

    if (!mounted || loading) {
        return <DashboardSkeleton />;
    }

    if (!user || user.role !== 'teacher') return null;

    switch (tab) {
        case 'classes':
            return <ClassesView mode="classes" />;
        case 'inscriptions':
            return <InscriptionsView />;
        case 'exercices':
            return <ExercisesView />;
        case 'compositions':
            return <ClassesView mode="compositions" />; 
        case 'accueil':
        default:
            return <HomeView />;
    }
}
