// app/etudashboard/profil/page.tsx
import Sidebar from '@/components/Sidebar';
import { Award, BookOpen, Clock } from 'lucide-react';

export default function StudentProfile() {
  const grades = [
    { subject: 'Excellent', value: 35, color: 'bg-purple-600' },
    { subject: 'Bien', value: 25, color: 'bg-purple-400' },
    { subject: 'Passable', value: 20, color: 'bg-purple-300' },
    { subject: 'Faible', value: 20, color: 'bg-purple-200' },
  ];

  return (
    <div className="flex min-h-screen bg-purple-50">
      <Sidebar 
        userRole="student" 
        userName="cz xcz" 
        userLevel="Master 2 • ads"
        activeTab="profil"
      />
      
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-purple-700">Mon Profil Étudiant</h1>
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            ✏️ Modifier
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="col-span-1 space-y-6">
            {/* Profile Picture */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-32 h-32 mx-auto bg-purple-300 rounded-full flex items-center justify-center text-purple-900 text-4xl font-bold mb-4">
                CX
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">No. Etudiant</p>
                <p className="font-semibold">ETU2025iqdprusph</p>
                <h2 className="text-2xl font-bold text-gray-800 mt-2">cz xcz</h2>
              </div>
            </div>

            {/* Profile Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-semibold">Parcours:</p>
                <p className="font-semibold text-gray-800">ads</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-semibold">Niveau:</p>
                <p className="font-semibold text-gray-800">Master 2</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-semibold">Université:</p>
                <p className="font-semibold text-gray-800">cad</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-semibold">Objectif:</p>
                <p className="font-semibold text-gray-800">Devenir pilote et parcourir le monde dans mon avion.</p>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="text-purple-600" size={32} />
                </div>
                <p className="text-sm text-gray-500 mb-1">Nombre de cours participé</p>
                <p className="text-4xl font-bold text-purple-600">22</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="text-purple-600" size={32} />
                </div>
                <p className="text-sm text-gray-500 mb-1">Certifications obtenues</p>
                <p className="text-4xl font-bold text-purple-600">05</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="text-purple-600" size={32} />
                </div>
                <p className="text-sm text-gray-500 mb-1">Assiduité</p>
                <p className="text-4xl font-bold text-purple-600">95%</p>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Répartition des Notes</h3>
              
              <div className="space-y-6">
                {grades.map((grade, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700">{grade.subject}</span>
                      <span className="font-bold text-purple-600">{grade.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`${grade.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${grade.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Donut Chart */}
              <div className="mt-8 flex justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="20"
                      strokeDasharray="88 163"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth="20"
                      strokeDasharray="63 188"
                      strokeDashoffset="-88"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#c4b5fd"
                      strokeWidth="20"
                      strokeDasharray="50 201"
                      strokeDashoffset="-151"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#ddd6fe"
                      strokeWidth="20"
                      strokeDasharray="50 201"
                      strokeDashoffset="-201"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
