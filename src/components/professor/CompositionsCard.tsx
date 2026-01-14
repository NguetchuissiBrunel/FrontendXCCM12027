// components/professor/CompositionsCard.tsx
import { Heart, Download, MoreVertical, Users, BarChart, FileText } from 'lucide-react';

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
  onManageExercises?: (courseId: string) => void;
}

export default function CompositionsCard({ 
  compositions, 
  coursesStats, 
  onManageExercises 
}: CompositionsCardProps) {
  
  const getCourseStats = (courseId: string) => {
    if (!coursesStats) return null;
    return coursesStats.find(stat => stat.courseId.toString() === courseId);
  };

  const handleViewDetails = (composition: Composition) => {
    // Navigation vers la page de détails du cours
    window.location.href = `/teacher/course/${composition.id}/analytics`;
  };

  const handleManageExercises = (composition: Composition) => {
    if (onManageExercises) {
      onManageExercises(composition.id);
    } else {
      // Fallback par défaut
      window.location.href = `/profdashboard/exercises/${composition.id}`;
    }
  };

  // Fonction pour calculer les exercices en attente de correction
  const getPendingSubmissions = (stats: any): number => {
    if (!stats?.exerciseStats) return 0;
    
    return stats.exerciseStats.reduce((total: number, exercise: any) => {
      // Si submissionCount > 0 et certains ne sont pas encore notés
      // Cette logique peut être ajustée selon vos données
      return total + (exercise.submissionCount || 0);
    }, 0);
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
          const pendingSubmissions = getPendingSubmissions(stats);
          const totalExercises = stats?.totalExercises || 0;
          
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
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
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
                    {totalExercises > 0 && (
                      <span className="flex items-center gap-2">
                        <FileText size={16} />
                        <span className="font-semibold">{totalExercises}</span> exercices
                      </span>
                    )}
                  </div>

                  {/* Section exercices avec notifications */}
                  {totalExercises > 0 && (
                    <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg border border-purple-100 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">
                              Gestion des exercices
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {totalExercises} exercices créés
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {pendingSubmissions > 0 && (
                            <div className="relative">
                              <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                                {pendingSubmissions} en attente
                              </div>
                            </div>
                          )}
                          
                          <button
                            onClick={() => handleManageExercises(composition)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-semibold transition-colors flex items-center gap-2"
                          >
                            <FileText size={16} />
                            Gérer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 ml-4">
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
                    
                    {!totalExercises && onManageExercises && (
                      <button
                        onClick={() => handleManageExercises(composition)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText size={16} />
                        Ajouter exercices
                      </button>
                    )}
                    
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

      {/* Section d'actions globales */}
      {compositions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total : {compositions.length} cours • {
                compositions.reduce((total, comp) => {
                  const stats = comp.courseStats || getCourseStats(comp.id);
                  return total + (stats?.totalExercises || 0);
                }, 0)
              } exercices • {
                compositions.reduce((total, comp) => {
                  const stats = comp.courseStats || getCourseStats(comp.id);
                  return total + (stats?.totalEnrolled || comp.participants);
                }, 0)
              } étudiants
            </div>
            
            {onManageExercises && (
              <button
                onClick={() => {
                  // Rediriger vers le premier cours pour gérer les exercices
                  if (compositions.length > 0) {
                    onManageExercises(compositions[0].id);
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <FileText size={18} />
                Gérer tous les exercices
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}