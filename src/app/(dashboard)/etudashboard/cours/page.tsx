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
            {/* Image avec overlay et bouton superposé */}
            <div className="relative w-full max-w-2xl h-96 mb-8 rounded-2xl overflow-hidden">
              <img 
                src="/images/open.jpg" 
                alt="Commencer un cours" 
                className="w-full h-full object-cover opacity-40 dark:opacity-30" 
              />
              {/* Overlay gradient pour meilleure lisibilité */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-50/50 dark:to-gray-900/50"></div>
              
              {/* Bouton centré sur l'image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-purple-600 dark:bg-purple-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-all hover:scale-105 flex items-center gap-3 text-lg shadow-2xl">
                  <span className="text-2xl">+</span>
                  <span>Commencer un Cours</span>
                </button>
              </div>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-center max-w-2xl text-lg">
              Pas de panique... Vous n'avez pas encore de cours. Dès que vous en commencerez un, vos cours s'afficheront ici.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
