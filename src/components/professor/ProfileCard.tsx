// components/professor/ProfileCard.tsx
import { Users, Award, Clock } from 'lucide-react';

interface Professor {
  id: string;
  name: string;
  city: string;
  university: string;
  grade: string;
  certification: string;
  totalStudents: number;
  participationRate: number;
  publications: number;
  performanceDistribution: Array<{
    range: string;
    value: number;
    color: string;
  }>;
}

interface ProfileCardProps {
  professor: Professor;
}

export default function ProfileCard({ professor }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-purple-700">Profil de l'Enseignant</h2>
        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
          ✏️ Modifier
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Left: Profile Image & Basic Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="w-32 h-32 mx-auto bg-purple-300 rounded-full flex items-center justify-center text-purple-900 text-4xl font-bold mb-4">
              JB
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">No. Enseignant</p>
              <p className="font-semibold">{professor.id}</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">{professor.name}</h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-semibold">Ville:</p>
              <p className="font-semibold text-gray-800">{professor.city}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-semibold">Université:</p>
              <p className="font-semibold text-gray-800">{professor.university}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-semibold">Grade:</p>
              <p className="font-semibold text-gray-800">{professor.grade}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-semibold">Certification:</p>
              <p className="font-semibold text-gray-800">{professor.certification}</p>
            </div>
          </div>
        </div>

        {/* Right: Stats & Performance */}
        <div className="col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-purple-50 rounded-2xl p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="text-purple-600" size={32} />
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Étudiants</p>
              <p className="text-4xl font-bold text-purple-600">{professor.totalStudents}</p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-purple-600" size={32} />
              </div>
              <p className="text-sm text-gray-500 mb-1">Taux de participation</p>
              <p className="text-4xl font-bold text-purple-600">{professor.participationRate}%</p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Award className="text-purple-600" size={32} />
              </div>
              <p className="text-sm text-gray-500 mb-1">Publications</p>
              <p className="text-4xl font-bold text-purple-600">{professor.publications}</p>
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="bg-purple-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Distribution des performances</h3>
            
            {/* Chart */}
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="20"
                    strokeDasharray="88 163"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="20"
                    strokeDasharray="75 176"
                    strokeDashoffset="-88"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#c4b5fd"
                    strokeWidth="20"
                    strokeDasharray="50 201"
                    strokeDashoffset="-163"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#ddd6fe"
                    strokeWidth="20"
                    strokeDasharray="38 213"
                    strokeDashoffset="-213"
                  />
                </svg>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-4">
              {professor.performanceDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-4 h-4 ${item.color} rounded`}></div>
                  <span className="text-sm font-medium text-gray-700">{item.range}</span>
                  <span className="text-sm font-bold text-purple-600 ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
