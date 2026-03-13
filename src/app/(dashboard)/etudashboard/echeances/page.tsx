// app/etudashboard/echeances/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Calendar from '@/components/Calendar';

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
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2">Échéances</h1>
            <p className="text-gray-500 dark:text-gray-400">Gérez votre emploi du temps et vos deadlines personnelles</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-purple-100/50 dark:shadow-none border border-purple-100 dark:border-gray-700">
          <Calendar userId={user.id} />
        </div>
      </main>
    </div>
  );
}
