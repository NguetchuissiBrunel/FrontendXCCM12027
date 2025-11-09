// components/professor/TeachersCard.tsx
import { Star } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  subject: string;
  rating: number;
  students: number;
  image: string;
}

interface TeachersCardProps {
  teachers: Teacher[];
}

export default function TeachersCard({ teachers }: TeachersCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">
        Rencontrez d'autres enseignants de votre domaine
      </h2>
      
      <div className="grid grid-cols-4 gap-6">
        {teachers.map((teacher) => (
          <div 
            key={teacher.id}
            className="bg-white border-2 border-purple-100 rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition-all"
          >
            {/* Profile Image */}
            <div className="w-20 h-20 mx-auto bg-purple-300 rounded-full flex items-center justify-center text-purple-900 text-2xl font-bold mb-4">
              {teacher.name.split(' ').map(n => n[0]).join('')}
            </div>

            {/* Info */}
            <div className="text-center mb-4">
              <h3 className="font-bold text-gray-800 mb-1">{teacher.name}</h3>
              <p className="text-sm text-gray-600">{teacher.subject}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400" fill="currentColor" />
                <span className="text-sm font-semibold">{teacher.rating}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">
                ({teacher.students} étudiants)
              </span>
            </div>

            {/* Contact Button */}
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
              💬 Contacter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
