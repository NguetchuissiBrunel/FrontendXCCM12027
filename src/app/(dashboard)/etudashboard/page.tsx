// app/etudashboard/page.tsx
import Sidebar from '@/components/Sidebar';
import { BookOpen } from 'lucide-react';

export default function StudentHome() {
  return (
    <div className="flex min-h-screen bg-purple-50">
      <Sidebar 
        userRole="student" 
        userName="cz xcz" 
        userLevel="Master 2 • ads"
        activeTab="accueil"
      />
      
      <main className="flex-1 p-8">
        {/* Welcome Message */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
          <h1 className="text-4xl font-bold text-purple-700 mb-4">
            Bienvenue cz !
          </h1>
          <p className="text-gray-600 italic">
            "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte."
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Mes Cours */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-purple-700 mb-6">Mes Cours</h2>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-6">
                <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                    <BookOpen size={48} className="text-purple-500" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white rounded-full p-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>
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
                <div className="w-48 h-48 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                    <div className="text-6xl">🎁</div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4">
                  <svg className="w-16 h-16 text-yellow-400" viewBox="0 0 100 100">
                    <path fill="currentColor" d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z"/>
                  </svg>
                </div>
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
