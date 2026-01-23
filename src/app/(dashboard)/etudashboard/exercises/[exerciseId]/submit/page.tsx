// src/app/(dashboard)/etudashboard/exercises/[exerciseId]/submit/page.tsx - VERSION CORRIGÉE
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExerciseService } from '@/lib3/services/ExerciseService';
import type { Exercise, Question } from '@/types/exercise';
import { ArrowLeft, Clock, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLoading } from '@/contexts/LoadingContext';

export default function SubmitExercisePage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = parseInt(params.exerciseId as string);

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  
  useEffect(() => {
    loadExercise();
  }, [exerciseId]);
  
  useEffect(() => {
    // Mettre à jour le compteur de réponses
    const count = Object.values(answers).filter(v => v.trim()).length;
    setAnsweredCount(count);
  }, [answers]);
  
  const loadExercise = async () => {
    startLoading();
    try {
      setLoading(true);
      
      const exerciseData = await ExerciseService.getExerciseDetails(exerciseId);
      
      if (!exerciseData) {
        toast.error('Exercice non trouvé');
        router.push('/etudashboard');
        return;
      }
      
      // Vérifier si l'exercice peut être soumis
      const permission = await ExerciseService.checkSubmissionPermission(exerciseId);
      
      if (!permission.canSubmit && permission.reason) {
        toast.error(permission.reason);
        router.push('/etudashboard/exercises');
        return;
      }
      
      setExercise(exerciseData);
      
      // Initialiser les réponses vides
      const initialAnswers: Record<number, string> = {};
      exerciseData.questions?.forEach((q: Question) => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
      
    } catch (error) {
      console.error('Erreur chargement exercice:', error);
      toast.error('Impossible de charger l\'exercice');
      router.push('/etudashboard');
    } finally {
      stopLoading();
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    if (!exercise) return;

    // Validation
    const unansweredQuestions: number[] = [];
    exercise.questions?.forEach((q, index) => {
      if (!answers[q.id]?.trim()) {
        unansweredQuestions.push(index + 1);
      }
    });
    
    if (unansweredQuestions.length > 0) {
      toast.error(`Veuillez répondre aux questions : ${unansweredQuestions.join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      
      // Préparer les réponses
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer: answer.trim()
      }));
      
      // Soumettre l'exercice
      const result = await ExerciseService.submitExercise(exerciseId, {
        answers: formattedAnswers
      });
      
      if (result.success) {
        toast.success('Exercice soumis avec succès !');
        router.push('/etudashboard/submissions');
      } else {
        throw new Error(result.message);
      }
      
    } catch (error: any) {
      console.error('Erreur soumission:', error);
      toast.error(error.message || 'Erreur lors de la soumission');
    } finally {
      stopLoading();
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement de l'exercice...</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Exercice non trouvé</h2>
          <button
            onClick={() => router.push('/etudashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/etudashboard/exercises')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour aux exercices</span>
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-purple-200 dark:border-gray-700 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {exercise.title}
            </h1>
            
            {exercise.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {exercise.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full">
                <Clock size={16} />
                <span>Échéance: {ExerciseService.formatDueDate(exercise.dueDate)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                <FileText size={16} />
                <span>Score max: {exercise.maxScore} points</span>
              </div>
              
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                <CheckCircle size={16} />
                <span>{exercise.questions?.length || 0} questions</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progression des réponses
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {answeredCount} / {exercise.questions?.length || 0} répondues
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(answeredCount / (exercise.questions?.length || 1)) * 100}%` 
              }}
            />
          </div>
        </div>
        
        {/* Questions */}
        <div className="space-y-6 mb-8">
          {exercise.questions?.map((question, index) => (
            <div 
              key={question.id} 
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {question.questionType === 'TEXT' && 'Réponse libre'}
                      {question.questionType === 'MULTIPLE_CHOICE' && 'Choix multiple'}
                      {question.questionType === 'CODE' && 'Code'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {question.question}
                  </h3>
                </div>
                
                <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm font-medium rounded-full">
                  {question.points} point{question.points > 1 ? 's' : ''}
                </div>
              </div>
              
              {/* Zone de réponse */}
              {question.questionType === 'TEXT' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Tapez votre réponse ici..."
                />
              )}

              {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <label 
                      key={optIndex} 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        answers[question.id] === option
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.questionType === 'CODE' && (
                <div>
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Écrivez votre code dans le langage de votre choix :
                  </div>
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full h-48 px-4 py-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-900 text-gray-100 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="// Votre code ici..."
                    spellCheck="false"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Bouton de soumission (sticky) */}
        <div className="sticky bottom-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                {answeredCount} / {exercise.questions?.length || 0} questions répondues
              </span>
              {answeredCount === exercise.questions?.length && (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  ✓ Prêt à soumettre
                </span>
              )}
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={submitting || answeredCount < (exercise.questions?.length || 0)}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Soumission en cours...
                </div>
              ) : (
                'Soumettre l\'exercice'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}