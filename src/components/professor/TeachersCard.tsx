// components/professor/TeachersCard.tsx
import { Star } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  subject: string;
  rating: number;
  students: number;
  image: string;
  university?: string;
}

interface TeachersCardProps {
  teachers: Teacher[];
}

export default function TeachersCard({ teachers }: TeachersCardProps) {
  const defaultAvatar = '/images/Applying Lean to Education -.jpeg';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-6">
        Rencontrez d&apos;autres enseignants de votre domaine
      </h2>

      <div className="grid grid-cols-4 gap-6">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white dark:bg-gray-800 border-2 border-purple-100 dark:border-purple-900/30 rounded-xl p-6 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-md dark:hover:shadow-gray-900/70 transition-all"
          >
            {/* Profile Image */}
            <img
              src={teacher.image || defaultAvatar}
              alt={teacher.name}
              className="w-20 h-20 mx-auto rounded-full object-cover mb-4 border-2 border-purple-200 dark:border-purple-500"
            />

            {/* Info */}
            <div className="text-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-white mb-1">{teacher.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{teacher.subject}</p>
              {teacher.university && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{teacher.university}</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400" fill="currentColor" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{teacher.rating}</span>
              </div>
              <span className="text-gray-400 dark:text-gray-600">•</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({teacher.students} étudiants)
              </span>
            </div>

            {/* Contact Button */}
            <button className="w-full bg-purple-600 dark:bg-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-sm shadow-lg">
              💬 Contacter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
