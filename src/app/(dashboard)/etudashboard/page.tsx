// app/etudashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { BookOpen } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photoUrl?: string;
  specialization?: string;
  level?: string;
  university?: string;
  city?: string;
}

export default function StudentHome() {
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
        activeTab="accueil"
      />
      
      <main className="flex-1 p-8">
        {/* Welcome Message */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
          <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-400 mb-4">
            Bienvenue {user.firstName} !
          </h1>
          <p className="text-gray-600 dark:text-gray-300 italic">
            "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte."
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Mes Cours */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
            
            <div className="flex flex-col items-center justify-center">
              {/* Image avec overlay et bouton superposé */}
              <div className="relative w-full h-80 mb-4 rounded-lg overflow-hidden">
                <img 
                  src="/images/open.jpg" 
                  alt="Open the present" 
                  className="w-full h-full object-cover opacity-40 dark:opacity-30" 
                />
                {/* Overlay gradient pour meilleure lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-50/50 dark:to-gray-900/50"></div>
                
                {/* Bouton centré sur l'image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="bg-purple-600 dark:bg-purple-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-all hover:scale-105 flex items-center gap-2 shadow-2xl">
                    <span className="text-2xl"></span>
                   
                  </button>
                </div>
              </div>
              
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
               
              </p>
            </div>
          </div>

          {/* Prochaines Échéances */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-6"></h2>
            <div className="flex flex-col items-center justify-center">
              {/* Image de même hauteur */}
              <div className="relative w-full h-80 mb-4 rounded-lg overflow-hidden">
                <img 
                  src="/images/open2.jpg" 
                  alt="Open the present 2" 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
