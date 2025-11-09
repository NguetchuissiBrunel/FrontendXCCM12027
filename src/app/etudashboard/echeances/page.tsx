// app/etudashboard/echeances/page.tsx
import Sidebar from '@/components/Sidebar';

export default function StudentDeadlines() {
  return (
    <div className="flex min-h-screen bg-purple-50">
      <Sidebar 
        userRole="student" 
        userName="cz xcz" 
        userLevel="Master 2 • ads"
        activeTab="echeances"
      />
      
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-8">Échéances</h1>

        <div className="bg-white rounded-2xl p-12 shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-8">
              <div className="w-64 h-64 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full flex items-center justify-center">
                <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center">
                  <div className="text-8xl">🎁</div>
                </div>
              </div>
              <div className="absolute -top-8 -right-8">
                <svg className="w-24 h-24 text-yellow-400" viewBox="0 0 100 100">
                  <path fill="currentColor" d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z"/>
                </svg>
              </div>
              <div className="absolute -bottom-8 -left-8">
                <svg className="w-20 h-20 text-purple-400" viewBox="0 0 100 100">
                  <path fill="currentColor" d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z"/>
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Aucune échéance à venir</h2>
            <p className="text-gray-500 text-center max-w-2xl text-lg">
              Profitez de ce temps libre pour explorer de nouveaux cours ou revoir vos notes !
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
