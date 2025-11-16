// app/etudashboard/cours/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { BookOpen } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialization?: string;
  level?: string;
}

export default function StudentCourses() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
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
        activeTab="cours"
      />
      
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-8">Mes Cours</h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-8">
              <div className="w-64 h-64 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center">
                <div className="w-48 h-48 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <BookOpen size={80} className="text-purple-500 dark:text-purple-400" />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-purple-600 dark:bg-purple-500 text-white rounded-full p-6 shadow-lg">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
            </div>

            <button className="bg-purple-600 dark:bg-purple-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center gap-3 text-lg mb-6 shadow-lg">
              + Commencer un Cours
            </button>

            <p className="text-gray-500 dark:text-gray-400 text-center max-w-2xl text-lg">
              Pas de panique... Vous n'avez pas encore de cours. Dès que vous en commencerez un, vos cours s'afficheront ici.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
