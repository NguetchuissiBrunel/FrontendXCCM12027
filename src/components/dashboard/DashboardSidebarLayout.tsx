'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
    children: React.ReactNode;
    role: 'student' | 'professor';
}

export default function DashboardSidebarLayout({ children, role }: Props) {
    const pathname = usePathname();
    const { user } = useAuth();
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        if (user) {
            setUserData(user);
        } else {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                setUserData(JSON.parse(stored));
            }
        }
    }, [user]);

    const getActiveTab = () => {
        if (!pathname) return 'accueil';
        if (role === 'student') {
            if (pathname.includes('/profil')) return 'profil';
            if (pathname.includes('/cours')) return 'cours';
            if (pathname.includes('/echeances')) return 'echeances';
            return 'accueil';
        } else {
            if (pathname.includes('/inscriptions')) return 'inscriptions';
            if (pathname.includes('/exercises')) return 'exercices';
            if (pathname.includes('/classes')) return 'classes';
            if (pathname.includes('/compositions')) return 'compositions';
            if (pathname.endsWith('/profdashboard')) return 'accueil';
            return 'accueil';
        }
    };

    const displayName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() : 'Chargement...';
    const userLevel = userData ? (userData.specialization || userData.level || userData.grade || (role === 'student' ? 'Étudiant' : 'Enseignant')) : '...';

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
