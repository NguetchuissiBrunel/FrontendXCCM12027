// src/app/(dashboard)/etudashboard/exercises/[exerciseId]/submit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExercicesService } from '@/lib/services/ExercicesService';
import type { Exercise, Question } from '@/types/exercise';
import { ArrowLeft, Clock, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SubmitExercisePage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = parseInt(params.exerciseId as string);
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    loadExercise();
  }, [exerciseId]);
  
  const loadExercise = async () => {
    try {
      const response = await ExercicesService.getExerciseDetails(exerciseId);
      const payload = (response as any).data ?? response;
      const ex = payload?.exercise ?? payload;
      setExercise(ex);
      
      if (ex?.questions) {
        const initialAnswers: Record<number, string> = {};
        ex.questions.forEach((q: Question) => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Erreur chargement exercice:', error);
      toast.error('Impossible de charger l\'exercice');
    } finally {
      setLoading(false);
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
    const unanswered = Object.entries(answers).filter(([_, value]) => !value.trim());
    if (unanswered.length > 0) {
      toast.error(`Veuillez répondre à toutes les questions (${unanswered.length} non répondues)`);
      return;
    }
    
    try {
      setSubmitting(true);
      
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer
      }));
      
      // Le type généré peut différer ; caster en any pour contourner l'erreur TS
      const payload: any = { answers: formattedAnswers };
      await ExercicesService.submitExercise(exerciseId, payload);
      
      toast.success('Exercice soumis avec succès !');
      router.push('/etudashboard/submissions');
    } catch (error) {
      console.error('Erreur soumission:', error);
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement de l'exercice...</p>
        </div>
      </div>
    );
  }
  
  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Exercice non trouvé</h2>
          <button
            onClick={() => router.push('/etudashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/etudashboard')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft size={20} />
            Retour au dashboard
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-purple-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {exercise.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {exercise.description}
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Clock size={16} />
                <span>Échéance: {new Date(exercise.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <FileText size={16} />
                <span>Score maximum: {exercise.maxScore} points</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Questions */}
        <div className="space-y-6 mb-8">
          {exercise.questions?.map((question, index) => (
            <div key={question.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Question {index + 1} - {question.points} points
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">{question.question}</p>
                </div>
              </div>
              
              {/* Champs de réponse selon le type */}
              {question.questionType === 'TEXT' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Votre réponse..."
                />
              )}
              
              {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {question.questionType === 'CODE' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-900 text-gray-100 font-mono resize-none"
                  placeholder="// Votre code ici..."
                  spellCheck="false"
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Bouton de soumission */}
        <div className="sticky bottom-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Object.values(answers).filter(v => v.trim()).length} / {exercise.questions?.length || 0} questions répondues
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {submitting ? 'Soumission en cours...' : 'Soumettre l\'exercice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}