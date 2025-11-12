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
    // Récupérer les données de l'utilisateur depuis localStorage
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
      // Si pas d'utilisateur connecté, rediriger vers login
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(currentUser);
      
      // Vérifier que c'est un étudiant
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
      <div className="flex items-center justify-center min-h-screen bg-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastName}`;
  const userLevel = user.specialization || user.level || 'Étudiant';

  return (
    <div className="flex min-h-screen bg-purple-50 py-15">
      <Sidebar 
        userRole="student" 
        userName={displayName}
        userLevel={userLevel}
        activeTab="accueil"
      />
      
      <main className="flex-1 p-8">
        {/* Welcome Message */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
          <h1 className="text-4xl font-bold text-purple-700 mb-4">
            Bienvenue {user.firstName} !
          </h1>
          <p className="text-gray-600 italic">
            "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte."
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Mes Cours */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-purple-700 mb-6">Mes Cours</h2>
            <div className="flex-col items-center justify-center py-12">
              <div className="relative mb-6">
                <img src="/images/open.jpg" alt="Open the present" />
              </div>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2">
                + Commencer un Cours
              </button>
              <p className="text-gray-500 mt-4 text-center max-w-sm">
                Pas de panique... Vous n'avez pas encore de cours. Dès que vous en commencerez un, vos cours s'afficheront ici.
              </p>
            </div>
          </div>

          {/* Prochaines Échéances */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-purple-700 mb-6">Prochaines Échéances</h2>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-6">
                    <img src="/images/open2.jpg" alt="Open the present 2" />
              </div>
              <p className="text-gray-500 text-center max-w-sm">
                Aucune échéance pour le moment. Profitez de ce temps libre pour explorer de nouveaux cours !
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
