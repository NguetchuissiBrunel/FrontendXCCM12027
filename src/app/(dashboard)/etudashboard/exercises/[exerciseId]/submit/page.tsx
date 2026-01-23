// src/app/(dashboard)/etudashboard/exercises/[exerciseId]/submit/page.tsx - VERSION UNIFIÉE
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useExercise, useSubmitExercise, useSubmissionPermission } from '@/hooks/useExercise';
import { ArrowLeft, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLoading } from '@/contexts/LoadingContext';

export default function SubmitExercisePage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = parseInt(params.exerciseId as string);
  
  // Utiliser les nouveaux hooks
  const { 
    exercise, 
    isLoading: exerciseLoading, 
    error: exerciseError,
    refetch: refetchExercise 
  } = useExercise(exerciseId);
  
  const { 
    mutate: submitExercise, 
    isPending: isSubmitting 
  } = useSubmitExercise();
  
  const {
    canSubmit,
    reason,
    isLoading: permissionLoading,
    check: checkPermission
  } = useSubmissionPermission(exerciseId);
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answeredCount, setAnsweredCount] = useState(0);
  
  // Charger l'exercice et vérifier les permissions
  useEffect(() => {
    if (exerciseId) {
      refetchExercise();
      checkPermission();
    }
  }, [exerciseId, refetchExercise, checkPermission]);
  
  // Initialiser les réponses quand l'exercice est chargé
  useEffect(() => {
    if (exercise) {
      const initialAnswers: Record<number, string> = {};
      exercise.questions?.forEach((q) => {
        initialAnswers[q.id] = q.studentAnswer || '';
      });
      setAnswers(initialAnswers);
    }
  }, [exercise]);
  
  // Mettre à jour le compteur de réponses
  useEffect(() => {
    if (exercise) {
      const count = Object.values(answers).filter(v => v.trim()).length;
      setAnsweredCount(count);
    }
  }, [answers, exercise]);
  
  // Vérifier les permissions de soumission
  useEffect(() => {
    if (!permissionLoading && !canSubmit && reason) {
      toast.error(reason);
      router.push('/etudashboard/exercises');
    }
  }, [canSubmit, reason, permissionLoading, router]);
  
  const handleAnswerChange = (questionId: number, value: string) => {
    if (!exercise?.alreadySubmitted) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    }
  };
  
  const handleSubmit = async () => {
    if (!exercise || exercise.alreadySubmitted) return;
    
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
      // Préparer les réponses
      const formattedAnswers = Object.entries(answers)
        .filter(([_, answer]) => answer.trim())
        .map(([questionId, answer]) => ({
          questionId: parseInt(questionId),
          answer: answer.trim()
        }));
      
      // Soumettre l'exercice
      const result = await submitExercise(
        exerciseId,
        formattedAnswers
      );
      
      if (result.success) {
        toast.success('✅ Exercice soumis avec succès !');
        
        // Rafraîchir les données
        await refetchExercise();
        
        // Rediriger après un court délai
        setTimeout(() => {
          router.push('/etudashboard/submissions');
        }, 1500);
      } else {
        toast.error(result.message || 'Erreur lors de la soumission');
      }
      
    } catch (error: any) {
      console.error('Erreur soumission:', error);
      toast.error(error.message || 'Erreur lors de la soumission');
    }
  };
  
  if (exerciseLoading || permissionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement de l'exercice...</p>
        </div>
      </div>
    );
  }
  
  if (exerciseError || !exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Exercice non trouvé</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            L'exercice demandé n'existe pas ou vous n'y avez pas accès.
          </p>
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
  
  if (exercise.alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Exercice déjà soumis</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Vous avez déjà soumis cet exercice le {new Date().toLocaleDateString('fr-FR')}.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/etudashboard/submissions')}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Voir ma soumission
            </button>
            <button
              onClick={() => router.push('/etudashboard/exercises')}
              className="w-full px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Voir d'autres exercices
            </button>
          </div>
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
                <span>Échéance: {new Date(exercise.dueDate || '').toLocaleDateString('fr-FR')}</span>
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
                      {question.type === 'TEXT' && 'Réponse libre'}
                      {question.type === 'MULTIPLE_CHOICE' && 'Choix multiple'}
                      {question.type === 'CODE' && 'Code'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {question.text}
                  </h3>
                </div>
                
                <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm font-medium rounded-full">
                  {question.points} point{question.points > 1 ? 's' : ''}
                </div>
              </div>
              
              {/* Zone de réponse */}
              {question.type === 'TEXT' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Tapez votre réponse ici..."
                />
              )}
              
              {question.type === 'MULTIPLE_CHOICE' && question.options && (
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
              
              {question.type === 'CODE' && (
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
              disabled={isSubmitting || answeredCount < (exercise.questions?.length || 0)}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
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