// components/professor/CompositionsCard.tsx
import { Heart, Download, MoreVertical, Users, BarChart } from 'lucide-react';

export interface Composition {
  id: string;
  title: string;
  class: string;
  participants: number;
  likes: number;
  downloads: number;
  courseStats?: {
    courseId: number;
    courseTitle: string;
    courseCategory: string;
    totalEnrolled: number;
    activeStudents: number;
    participationRate: number;
    averageProgress: number;
    completedStudents: number;
    totalExercises: number;
    exerciseStats?: Array<{
      exerciseId: number;
      title: string;
      submissionCount: number;
      averageScore: number;
      minScore: number;
      maxScore: number;
      maxPossibleScore: number;
    }>;
    performanceDistribution: {
      excellent: number;
      good: number;
      average: number;
      poor: number;
      total: number;
    };
  };
}

interface CompositionsCardProps {
  compositions: Composition[];
  coursesStats?: Array<{
    courseId: number;
    courseTitle: string;
    courseCategory: string;
    totalEnrolled: number;
    activeStudents: number;
    participationRate: number;
    averageProgress: number;
    completedStudents: number;
    totalExercises: number;
    exerciseStats?: Array<{
      exerciseId: number;
      title: string;
      submissionCount: number;
      averageScore: number;
      minScore: number;
      maxScore: number;
      maxPossibleScore: number;
    }>;
  }>;
}

export default function CompositionsCard({ compositions, coursesStats }: CompositionsCardProps) {
  
  const getCourseStats = (courseId: string) => {
    if (!coursesStats) return null;
    return coursesStats.find(stat => stat.courseId.toString() === courseId);
  };

  const handleViewDetails = (composition: Composition) => {
    // Navigation vers la page de détails du cours
    window.location.href = `/teacher/course/${composition.id}/analytics`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400">Mes Compositions</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {compositions.length} cours au total
        </div>
      </div>

      <div className="space-y-4">
        {compositions.map((composition) => {
          const stats = composition.courseStats || getCourseStats(composition.id);
          
          return (
            <div
              key={composition.id}
              className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all border border-purple-200 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {composition.title}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      {stats?.participationRate || 0}% participation
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="font-semibold">{composition.class}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Users size={16} />
                      <span className="font-semibold">{stats?.totalEnrolled || composition.participants}</span> étudiants
                    </span>
                    <span className="flex items-center gap-2">
                      <BarChart size={16} />
                      <span className="font-semibold">{stats?.averageProgress || 0}%</span> progression
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Heart size={20} fill="currentColor" />
                      <span className="font-semibold">{composition.likes}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">soumissions</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Download size={20} />
                      <span className="font-semibold">{composition.downloads}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">téléchargements</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleViewDetails(composition)}
                      className="px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white text-sm rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                    >
                      Détails
                    </button>
                    
                    <button className="p-2 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg transition-colors flex items-center justify-center">
                      <MoreVertical size={20} className="text-gray-400 dark:text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}