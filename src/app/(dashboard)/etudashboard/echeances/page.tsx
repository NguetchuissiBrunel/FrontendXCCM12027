// app/etudashboard/echeances/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

import { useLoading } from '@/contexts/LoadingContext';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialization?: string;
  level?: string;
}

export default function StudentDeadlines() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [loading, startLoading, stopLoading]);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(currentUser);

      if (userData.role !== 'student') {
        router.push('/profdashboard');
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading || globalLoading) {
    return null;
  }

  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastName}`;
  const userLevel = user.specialization || user.level || 'Étudiant';

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
      <Sidebar
        userRole="student"
        userName={displayName}
        userLevel={userLevel}
        activeTab="echeances"
      />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-8">Échéances</h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
          <div className="flex flex-col items-center justify-center">
            {/* Image sans overlay pour affichage simple */}
            <div className="relative w-full max-w-2xl h-96 mb-8 rounded-2xl overflow-hidden">
              <img
                src="/images/open2.jpg"
                alt="Aucune échéance"
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Aucune échéance à venir</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-2xl text-lg">
              Profitez de ce temps libre pour explorer de nouveaux cours ou revoir vos notes !
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
