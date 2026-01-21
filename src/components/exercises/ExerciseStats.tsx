// src/components/exercises/ExerciseStats.tsx
'use client';

import React from 'react';
import { Exercise } from '@/types/exercise';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock,
  Award,
  CheckCircle,
  XCircle,
  Target
} from 'lucide-react';

interface ExerciseStatsProps {
  exercise: Exercise;
}

export default function ExerciseStats({ exercise }: ExerciseStatsProps) {
  // Données simulées (à remplacer par des données réelles)
  const stats = {
    totalStudents: 30,
    submittedCount: exercise.submissionCount || 15,
    averageScore: exercise.averageScore || 14.5,
    completionRate: exercise.completionRate || 75,
    timeSpentAverage: 45, // minutes
    commonDifficulties: ['Question 3', 'Question 5'],
    gradeDistribution: [
      { range: '0-5', count: 2 },
      { range: '6-10', count: 3 },
      { range: '11-15', count: 5 },
      { range: '16-20', count: 5 }
    ]
  };

  const calculateSubmissionRate = () => {
    return stats.totalStudents > 0 
      ? Math.round((stats.submittedCount / stats.totalStudents) * 100)
      : 0;
  };

  const getPerformanceColor = (score: number) => {
    const percentage = (score / exercise.maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Statistiques de l'exercice
        </h3>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Dernière mise à jour: Il y a 2 heures
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
                {stats.submittedCount}/{stats.totalStudents}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Soumissions</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${calculateSubmissionRate()}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Taux de participation: {calculateSubmissionRate()}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getPerformanceColor(stats.averageScore)}`}>
                {stats.averageScore.toFixed(1)}/{exercise.maxScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Score moyen</div>
            </div>
          </div>
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Performance: </span>
            <span className={`font-medium ${getPerformanceColor(stats.averageScore)}`}>
              {((stats.averageScore / exercise.maxScore) * 100).toFixed(1)}%
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
                {stats.timeSpentAverage}min
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
                {stats.completionRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Taux de complétion</div>
            </div>
          </div>
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progression: </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {stats.completionRate >= 70 ? 'Bon' : 'À améliorer'}
            </span>
          </div>
        </div>
      </div>

      {/* Distribution des notes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Distribution des notes
        </h4>
        
        <div className="space-y-4">
          {stats.gradeDistribution.map((item, index) => {
            const percentage = stats.submittedCount > 0 
              ? Math.round((item.count / stats.submittedCount) * 100)
              : 0;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {item.range} points
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.count} étudiant{item.count !== 1 ? 's' : ''} ({percentage}%)
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

        {/* Légende */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600 dark:text-gray-400">0-5: Difficulté</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600 dark:text-gray-400">6-10: Moyen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">11-20: Bon/Excellent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Difficultés communes */}
      {stats.commonDifficulties.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Difficultés communes identifiées
          </h4>
          
          <div className="space-y-3">
            {stats.commonDifficulties.map((difficulty, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {difficulty}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Plus de 60% des étudiants ont eu des difficultés
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>
              💡 <strong>Conseil:</strong> Considérez revoir ces concepts en classe ou 
              ajouter des exercices supplémentaires pour renforcer ces compétences.
            </p>
          </div>
        </div>
      )}

      {/* Résumé des performances */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Résumé des performances
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${
                calculateSubmissionRate() >= 70 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                {calculateSubmissionRate() >= 70 ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  Participation des étudiants
                </div>
                <div className={`text-sm ${
                  calculateSubmissionRate() >= 70 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {calculateSubmissionRate() >= 70 ? 'Très bonne participation' : 'Participation modérée'}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {calculateSubmissionRate()}% des étudiants ont soumis l'exercice.
              {calculateSubmissionRate() < 70 && ' Envisagez un rappel pour améliorer la participation.'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${
                (stats.averageScore / exercise.maxScore) >= 0.7 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                <Award className={`w-5 h-5 ${
                  (stats.averageScore / exercise.maxScore) >= 0.7 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  Niveau de compréhension
                </div>
                <div className={`text-sm ${
                  (stats.averageScore / exercise.maxScore) >= 0.7 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {((stats.averageScore / exercise.maxScore) * 100).toFixed(1)}% de réussite
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Les étudiants ont montré une compréhension {
                (stats.averageScore / exercise.maxScore) >= 0.7 ? 'satisfaisante' : 'nécessitant des améliorations'
              } des concepts évalués.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}