'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

interface Props {
    children: React.ReactNode;
    role: 'student' | 'professor';
}

function SidebarLayoutInner({ children, role }: Props) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const t = useTranslations('sidebar');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const userData = useMemo(() => {
        if (!isMounted) return null;

        if (user) {
            return user as {
                firstName?: string;
                lastName?: string;
                specialization?: string;
                level?: string;
                grade?: string;
            };
        }

        if (typeof window === 'undefined') {
            return null;
        }

        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) as {
            firstName?: string;
            lastName?: string;
            specialization?: string;
            level?: string;
            grade?: string;
        } : null;
    }, [user]);

    const getActiveTab = () => {
        if (!pathname) return 'accueil';
        if (role === 'student') {
            if (pathname.includes('/profil')) return 'profil';
            if (pathname.includes('/cours')) return 'cours';
            if (pathname.includes('/echeances')) return 'echeances';
            return 'accueil';
        } else {
            const tab = searchParams?.get('tab');
            if (tab) return tab;
            if (pathname.includes('/inscriptions')) return 'inscriptions';
            if (pathname.includes('/exercises')) return 'exercices';
            if (pathname.includes('/classes')) return 'classes';
            if (pathname.includes('/compositions')) return 'compositions';
            return 'accueil';
        }
    };

    const displayName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() : t('loading');
    const userLevel = userData
        ? (userData.specialization || userData.level || userData.grade || (role === 'student' ? t('roles.student') : t('roles.teacher')))
        : '...';

    return (
        <div className="flex min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16">
            <Sidebar
                userRole={role}
                userName={displayName}
                userLevel={userLevel}
                activeTab={getActiveTab()}
            />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

export default function DashboardSidebarLayout(props: Props) {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <SidebarLayoutInner {...props} />
        </Suspense>
    );
}
