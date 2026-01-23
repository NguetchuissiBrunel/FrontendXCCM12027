// src/components/exercises/ExerciseStats.tsx - VERSION CORRIGÉE
'use client';

import React from 'react';
import { Exercise, QuestionStat, GradeDistribution } from '@/types/exercise';
import { useExerciseStats } from '@/hooks/useExercise';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock,
  Award,
  CheckCircle,
  XCircle,
  Target,
  Loader2
} from 'lucide-react';

interface ExerciseStatsProps {
  exerciseId: number;
}

// Types pour les données de statistiques
interface StatsData {
  submissionCount: number;
  averageScore: number;
  maxPossibleScore: number;
  averageTimeSpent: number;
  completionRate: number;
  gradeDistribution?: GradeDistribution[];
  questionStats?: QuestionStat[];
}

export default function ExerciseStats({ exerciseId }: ExerciseStatsProps) {
  const { stats, isLoading, error, refetch } = useExerciseStats(exerciseId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Statistiques de l'exercice
          </h3>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Chargement...
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_: unknown, i: number) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Statistiques de l'exercice
          </h3>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">
                Impossible de charger les statistiques
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400">
                {error?.message || 'Les statistiques ne sont pas disponibles pour le moment.'}
              </p>
              <button
                onClick={refetch}
                className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getPerformanceColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Type assertion pour les stats
  const statsData = stats as StatsData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Statistiques de l'exercice
        </h3>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Dernière mise à jour: Maintenant
          </span>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {statsData.submissionCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Soumissions</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Taux de participation
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getPerformanceColor(statsData.averageScore, statsData.maxPossibleScore)}`}>
                {statsData.averageScore.toFixed(1)}/{statsData.maxPossibleScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Score moyen</div>
            </div>
          </div>
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Performance: </span>
            <span className={`font-medium ${getPerformanceColor(statsData.averageScore, statsData.maxPossibleScore)}`}>
              {((statsData.averageScore / statsData.maxPossibleScore) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {statsData.averageTimeSpent}min
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Temps moyen</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Temps par étudiant
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {statsData.completionRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Taux de complétion</div>
            </div>
          </div>
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progression: </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {statsData.completionRate >= 70 ? 'Bon' : 'À améliorer'}
            </span>
          </div>
        </div>
      </div>

      {/* Distribution des notes */}
      {statsData.gradeDistribution && statsData.gradeDistribution.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Distribution des notes
          </h4>
          
          <div className="space-y-4">
            {statsData.gradeDistribution.map((item: GradeDistribution, index: number) => {
              const percentage = item.percentage;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {item.gradeRange}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.count} étudiant{item.count !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Statistiques par question */}
      {statsData.questionStats && statsData.questionStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Performance par question
          </h4>
          
          <div className="space-y-4">
            {statsData.questionStats.map((questionStat: QuestionStat, index: number) => {
              const commonDifficulties = questionStat.commonWrongAnswers.slice(0, 3);
              
              return (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-gray-200">
                        Q{index + 1}: {questionStat.text}
                      </h5>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {questionStat.type === 'TEXT' ? 'Réponse libre' :
                         questionStat.type === 'MULTIPLE_CHOICE' ? 'Choix multiple' : 'Code'}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${getPerformanceColor(questionStat.averageScore, 1)}`}>
                      {(questionStat.correctRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Taux de réussite: {(questionStat.correctRate * 100).toFixed(1)}%
                  </div>
                  
                  {commonDifficulties.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Difficultés courantes:
                      </div>
                      <ul className="space-y-1">
                        {commonDifficulties.map((difficulty: { answer: string; count: number }, i: number) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <Target className="w-3 h-3 text-yellow-500" />
                            "{difficulty.answer}" ({difficulty.count} étudiant{difficulty.count !== 1 ? 's' : ''})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}