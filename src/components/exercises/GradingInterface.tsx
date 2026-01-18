// src/components/exercises/GradingInterface.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { EnseignantService } from '@/lib/services/EnseignantService';  // Pour les opérations enseignants
import { Submission, Exercise } from '@/types/exercise';
import { toast } from 'react-hot-toast';
import { FaCheck, FaStar, FaComment, FaDownload } from 'react-icons/fa';

interface GradingInterfaceProps {
  exerciseId: number;
}

export const GradingInterface: React.FC<GradingInterfaceProps> = ({ exerciseId }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradingData, setGradingData] = useState<{
    score: number;
    feedback: string;
  }>({ score: 0, feedback: '' });

  useEffect(() => {
    loadData();
  }, [exerciseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exerciseResp, submissionsResp] = await Promise.all([
        ExercicesService.getExerciseDetails(exerciseId),
        EnseignantService.getSubmissions(exerciseId)
      ]);

      const exerciseData = (exerciseResp as any)?.data || null;
      const submissionsData = (submissionsResp as any)?.data || [];

      setExercise(exerciseData);
      setSubmissions(submissionsData);
      
      if (submissionsData.length > 0) {
        setSelectedSubmission(submissionsData[0]);
        setGradingData({
          score: submissionsData[0].score || 0,
          feedback: submissionsData[0].feedback || ''
        });
      }
    } catch (error) {
      toast.error('Erreur de chargement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      await EnseignantService.gradeSubmission(selectedSubmission.id, {
        score: gradingData.score,
        feedback: gradingData.feedback
      });
      
      toast.success('Soumission notée');
      loadData(); // Recharger
    } catch (error) {
      toast.error('Erreur lors de la notation');
    }
  };

  const downloadSubmission = (submission: Submission) => {
    // Logique de téléchargement
    console.log('Télécharger:', submission);
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Liste des soumissions */}
      <div className="w-1/3 border-r dark:border-gray-700 overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="font-bold dark:text-white">Soumissions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {submissions.length} étudiant(s)
          </p>
        </div>

        <div className="divide-y dark:divide-gray-700">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              onClick={() => {
                setSelectedSubmission(submission);
                setGradingData({
                  score: submission.score || 0,
                  feedback: submission.feedback || ''
                });
              }}
              className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                selectedSubmission?.id === submission.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                  : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium dark:text-white">
                    {submission.studentName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    submission.graded 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {submission.graded ? `${submission.score}/${submission.maxScore}` : 'À noter'}
                  </div>
                  <div className="text-xs">
                    {submission.graded ? (
                      <span className="text-green-600">✓ Noté</span>
                    ) : (
                      <span className="text-yellow-600">En attente</span>
                    )}
                  </div>
                </div>
              </div>
              
              {submission.feedback && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                  <FaComment className="inline mr-1" />
                  {submission.feedback.substring(0, 50)}...
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interface de correction */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedSubmission ? (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">
                  Correction - {selectedSubmission.studentName}
                </h2>
                <button
                  onClick={() => downloadSubmission(selectedSubmission)}
                  className="px-3 py-1 border rounded dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaDownload className="inline mr-1" /> Télécharger
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 dark:text-white">
                  {exercise?.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {exercise?.description}
                </p>
                <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Soumis le {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </div>
              </div>

              {/* Contenu de la soumission */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3 dark:text-white">Réponses</h4>
                {/* Afficher les réponses */}
                <div className="space-y-3">
                  {selectedSubmission.answers?.map((answer, index) => (
                    <div key={answer.id} className="border-b pb-3 dark:border-gray-700">
                      <div className="font-medium mb-1 dark:text-gray-300">
                        Question {index + 1}
                      </div>
                      <div className="text-gray-700 dark:text-gray-400 whitespace-pre-wrap">
                        {answer.answer}
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Points:</span>{' '}
                        <input
                          type="number"
                          min="0"
                          max={exercise?.questions?.[index]?.points || 10}
                          value={answer.points}
                          onChange={(e) => {
                            // Mettre à jour les points de la réponse
                          }}
                          className="ml-2 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notation */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold mb-3 dark:text-white">Notation</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Score (sur {exercise?.maxScore || 20})
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max={exercise?.maxScore || 20}
                      value={gradingData.score}
                      onChange={(e) => setGradingData({
                        ...gradingData,
                        score: parseInt(e.target.value)
                      })}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="0"
                      max={exercise?.maxScore || 20}
                      value={gradingData.score}
                      onChange={(e) => setGradingData({
                        ...gradingData,
                        score: parseInt(e.target.value)
                      })}
                      className="w-20 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-lg font-bold dark:text-white">
                      / {exercise?.maxScore || 20}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Feedback
                  </label>
                  <textarea
                    value={gradingData.feedback}
                    onChange={(e) => setGradingData({
                      ...gradingData,
                      feedback: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    rows={4}
                    placeholder="Commentaires pour l'étudiant..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setGradingData({
                        score: selectedSubmission.score || 0,
                        feedback: selectedSubmission.feedback || ''
                      });
                    }}
                    className="px-4 py-2 border rounded dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={handleGradeSubmission}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                    disabled={selectedSubmission.graded}
                  >
                    <FaCheck /> {selectedSubmission.graded ? 'Mettre à jour' : 'Valider la note'}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FaStar className="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold dark:text-white mb-2">
              Aucune soumission sélectionnée
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sélectionnez une soumission dans la liste pour commencer la correction
            </p>
          </div>
        )}
      </div>
    </div>
  );
};