// src/components/exercises/ExerciseViewer.tsx - VERSION ÉTUDIANT
'use client';

import React, { useState, useEffect } from 'react';
import { Exercise, Question } from '@/types/exercise';
import { ExerciseService } from '@/lib/services/ExerciseService';

interface ExerciseViewerProps {
  exercise: Exercise;
  onSubmit?: (answers: any[]) => void;
}

export const StudentExerciseViewer: React.FC<ExerciseViewerProps> = ({
  exercise,
  onSubmit
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const qs = exercise.content 
      ? ExerciseService.parseContentToQuestions(exercise.content)
      : exercise.questions || [];
    setQuestions(qs);
    
    // Initialiser les réponses vides
    const initialAnswers: Record<number, string> = {};
    qs.forEach(q => {
      initialAnswers[q.id || 0] = '';
    });
    setAnswers(initialAnswers);
  }, [exercise]);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    if (!onSubmit) return;
    
    const formattedAnswers = questions.map(q => ({
      questionId: q.id || 0,
      answer: answers[q.id || 0] || ''
    }));
    
    onSubmit(formattedAnswers);
    setSubmitted(true);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">{exercise.title}</h1>
        {exercise.description && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-gray-700 whitespace-pre-line">{exercise.description}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
            <span className="font-semibold">Score max:</span> {exercise.maxScore} points
          </div>
          {exercise.dueDate && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
              <span className="font-semibold">Échéance:</span> {new Date(exercise.dueDate).toLocaleDateString()}
            </div>
          )}
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
            <span className="font-semibold">Statut:</span> Publié
          </div>
        </div>
      </div>

      {/* Liste des questions */}
      <div className="space-y-8">
        {questions.map((question, index) => (
          <div key={question.id || index} className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Question {index + 1}
                </h3>
                <div className="text-gray-600 mt-1">{question.question}</div>
              </div>
              <span className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-full">
                {question.points} points
              </span>
            </div>

            {/* Zone de réponse */}
            {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <label key={optIndex} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id || 0] === option}
                      onChange={(e) => handleAnswerChange(question.id || 0, e.target.value)}
                      className="mr-3"
                      disabled={submitted}
                    />
                    <span className="flex-1">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.questionType === 'TEXT' && (
              <textarea
                value={answers[question.id || 0] || ''}
                onChange={(e) => handleAnswerChange(question.id || 0, e.target.value)}
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
                placeholder="Votre réponse..."
                disabled={submitted}
              />
            )}

            {question.questionType === 'CODE' && (
              <div>
                <textarea
                  value={answers[question.id || 0] || ''}
                  onChange={(e) => handleAnswerChange(question.id || 0, e.target.value)}
                  className="w-full p-4 font-mono border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={8}
                  placeholder="// Écrivez votre code ici..."
                  disabled={submitted}
                />
                <div className="mt-2 text-sm text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Support de coloration syntaxique
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bouton de soumission */}
      {!submitted && onSubmit && (
        <div className="mt-10 pt-6 border-t">
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Soumettre mes réponses
            </div>
          </button>
          <p className="text-center text-gray-500 text-sm mt-3">
            Vous ne pourrez plus modifier vos réponses après soumission
          </p>
        </div>
      )}

      {submitted && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-center">
            <div className="mr-4 text-green-600">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-800">Soumission réussie !</h3>
              <p className="text-green-700">Vos réponses ont été enregistrées.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};