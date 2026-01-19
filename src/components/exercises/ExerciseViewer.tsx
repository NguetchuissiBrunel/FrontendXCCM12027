// src/components/exercises/ExerciseViewer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Exercise, Question } from '@/types/exercise';
import { ExerciseService } from '@/lib3/services/ExerciseService';
import { toast } from 'react-hot-toast';
import { 
  FaClock, 
  FaCalendarAlt, 
  FaHashtag, 
  FaCheckCircle,
  FaCode,
  FaFileAlt
} from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';

interface ExerciseViewerProps {
  exercise: Exercise;
  onSubmit?: (answers: any[]) => void;
  readOnly?: boolean;
}

export const StudentExerciseViewer: React.FC<ExerciseViewerProps> = ({
  exercise,
  onSubmit,
  readOnly = false
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qs = exercise.questions || ExerciseService.parseContentToQuestions(exercise.content);
    setQuestions(qs);
    
    const initialAnswers: Record<number, string> = {};
    qs.forEach(q => {
      if (q.studentAnswer) {
        initialAnswers[q.id || 0] = q.studentAnswer;
      } else {
        initialAnswers[q.id || 0] = '';
      }
    });
    setAnswers(initialAnswers);
    
    // Vérifier si déjà soumis
    if (exercise.alreadySubmitted) {
      setSubmitted(true);
    }
  }, [exercise]);

  const handleAnswerChange = (questionId: number, value: string) => {
    if (!readOnly && !submitted) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    }
  };

  const handleSubmit = async () => {
    if (!onSubmit || submitted || readOnly) return;
    
    try {
      setLoading(true);
      
      // Vérifier si toutes les questions sont répondues
      const unanswered = questions.filter(q => !answers[q.id || 0]?.trim());
      if (unanswered.length > 0) {
        toast.error(`Veuillez répondre à toutes les questions (${unanswered.length} non répondues)`);
        return;
      }
      
      const formattedAnswers = questions.map(q => ({
        questionId: q.id || 0,
        answer: answers[q.id || 0] || ''
      }));
      
      await onSubmit(formattedAnswers);
      setSubmitted(true);
      toast.success('✅ Exercice soumis avec succès !');
      
    } catch (error) {
      toast.error('Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (questions.length === 0) return 0;
    const answered = questions.filter(q => answers[q.id || 0]?.trim()).length;
    return Math.round((answered / questions.length) * 100);
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'CODE':
        return <FaCode className="w-4 h-4 text-blue-500" />;
      case 'MULTIPLE_CHOICE':
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <FaFileAlt className="w-4 h-4 text-indigo-500" />;
    }
  };

  const formatQuestionType = (type: string) => {
    switch (type) {
      case 'CODE': return 'Code';
      case 'MULTIPLE_CHOICE': return 'Choix multiple';
      default: return 'Réponse texte';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête de l'exercice */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-4">{exercise.title}</h1>
        
        {exercise.description && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
            <p className="text-white/90 whitespace-pre-line">{exercise.description}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <FaHashtag className="w-4 h-4" />
            <span className="font-semibold">{exercise.maxScore} points</span>
          </div>
          
          {exercise.dueDate && (
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <FaCalendarAlt className="w-4 h-4" />
              <span className="font-semibold">
                {new Date(exercise.dueDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <FaClock className="w-4 h-4" />
            <span className="font-semibold">
              {questions.length} question{questions.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      {!readOnly && !submitted && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progression : {calculateProgress()}%
            </span>
            <span className="text-sm text-gray-600">
              {questions.filter(q => answers[q.id || 0]?.trim()).length}/{questions.length} répondues
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      )}

      {/* Liste des questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id || index} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 transition-colors">
            {/* En-tête de la question */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    {getQuestionIcon(question.questionType)}
                    <span className="text-sm text-gray-600">
                      {formatQuestionType(question.questionType)}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{question.question}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                  {question.points} point{question.points > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Zone de réponse */}
            {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
              <div className="space-y-3">
                {question.options.map((option, optIndex) => (
                  <label 
                    key={optIndex} 
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      answers[question.id || 0] === option
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } ${(readOnly || submitted) ? 'cursor-default' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id || 0] === option}
                      onChange={(e) => handleAnswerChange(question.id || 0, e.target.value)}
                      className="mr-4 w-5 h-5 text-indigo-600"
                      disabled={readOnly || submitted}
                    />
                    <div className="flex-1">
                      <span className="text-gray-800">{option}</span>
                    </div>
                    {question.correctAnswer === option && submitted && (
                      <div className="ml-4 text-green-600">
                        <FaCheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            )}

            {question.questionType === 'TEXT' && (
              <textarea
                value={answers[question.id || 0] || ''}
                onChange={(e) => handleAnswerChange(question.id || 0, e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
                placeholder="Votre réponse..."
                disabled={readOnly || submitted}
              />
            )}

            {question.questionType === 'CODE' && (
              <div>
                <div className="mb-2 text-sm text-gray-600 flex items-center gap-2">
                  <FaCode className="w-4 h-4" />
                  Utilisez l'éditeur de code ou écrivez directement ci-dessous
                </div>
                <textarea
                  value={answers[question.id || 0] || ''}
                  onChange={(e) => handleAnswerChange(question.id || 0, e.target.value)}
                  className="w-full p-4 font-mono text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={8}
                  placeholder="// Écrivez votre code ici..."
                  disabled={readOnly || submitted}
                />
                <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                  Support des langages : JavaScript, Python, Java, C++, etc.
                </div>
              </div>
            )}

            {/* Feedback après soumission */}
            {submitted && question.studentPoints !== undefined && (
              <div className={`mt-4 p-4 rounded-lg ${
                question.studentPoints === question.points 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">
                    Votre réponse : {question.studentPoints}/{question.points} points
                  </span>
                  {question.correctAnswer && (
                    <span className="text-sm text-gray-600">
                      Réponse attendue : {question.correctAnswer}
                    </span>
                  )}
                </div>
                {question.studentPoints < question.points && (
                  <p className="text-sm text-gray-700 mt-1">
                    {question.studentAnswer === question.correctAnswer 
                      ? 'Votre réponse est correcte !' 
                      : 'Vérifiez votre réponse.'}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bouton de soumission */}
      {!readOnly && onSubmit && !submitted && (
        <div className="mt-10 pt-8 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Soumission en cours...
                </>
              ) : (
                <>
                  <FiSend className="w-6 h-6" />
                  Soumettre mes réponses
                </>
              )}
            </div>
          </button>
          <p className="text-center text-gray-500 text-sm mt-3">
            Après soumission, vous ne pourrez plus modifier vos réponses
          </p>
        </div>
      )}

      {/* Message après soumission */}
      {submitted && (
        <div className="mt-8 p-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 p-4 bg-white rounded-full shadow-lg">
              <FaCheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Exercice soumis avec succès !
            </h3>
            <p className="text-green-700 mb-6 max-w-lg">
              Votre travail a été enregistré. Vous recevrez une notification une fois qu'il sera corrigé.
            </p>
            {exercise.studentScore !== undefined && (
              <div className="px-6 py-3 bg-white border border-green-200 rounded-xl">
                <div className="text-sm text-gray-600">Votre score</div>
                <div className="text-3xl font-bold text-green-700">
                  {exercise.studentScore}/{exercise.maxScore} points
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};