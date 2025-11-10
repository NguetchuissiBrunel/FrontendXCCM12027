// app/etudashboard/cours/page.tsx
import Sidebar from '@/components/Sidebar';
import { BookOpen } from 'lucide-react';

export default function StudentCourses() {
  return (
    <div className="flex min-h-screen bg-purple-50">
      <Sidebar 
        userRole="student" 
        userName="cz xcz" 
        userLevel="Master 2 • ads"
        activeTab="cours"
      />
      
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-8">Mes Cours</h1>

        <div className="bg-white rounded-2xl p-12 shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-8">
              <div className="w-64 h-64 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center">
                  <BookOpen size={80} className="text-purple-500" />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-purple-600 text-white rounded-full p-6">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
            </div>

            <button className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-3 text-lg mb-6">
              + Commencer un Cours
            </button>

            <p className="text-gray-500 text-center max-w-2xl text-lg">
              Pas de panique... Vous n'avez pas encore de cours. Dès que vous en commencerez un, vos cours s'afficheront ici.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
