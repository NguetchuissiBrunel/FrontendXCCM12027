// src/components/exercises/ExerciseViewer.tsx
'use client';

import React from 'react';
import { Exercise, Question } from '@/types/exercise';
import { ExerciseService } from '@/lib/services/ExerciseService';

interface ExerciseViewerProps {
  exercise: Exercise;
  isInstructor?: boolean;
}

export const ExerciseViewer: React.FC<ExerciseViewerProps> = ({
  exercise,
  isInstructor = false
}) => {
  // Récupérer les questions depuis le content
  const questions = exercise.content 
    ? ExerciseService.parseContentToQuestions(exercise.content)
    : exercise.questions || [];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-4">{exercise.title}</h1>
      {exercise.description && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          {exercise.description}
        </div>
      )}
      
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        <span>Score max: {exercise.maxScore} points</span>
        {exercise.dueDate && (
          <span className="ml-4">
            Échéance: {new Date(exercise.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      
      {/* Liste des questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id || index} className="border rounded p-4">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">
                Question {index + 1} ({question.points} points)
              </h3>
              <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                {question.questionType}
              </span>
            </div>
            
            <p className="mb-3">{question.question}</p>
            
            {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
              <div className="space-y-2 ml-4">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center">
                    <input
                      type="radio"
                      id={`q${index}_opt${optIndex}`}
                      name={`question_${index}`}
                      className="mr-2"
                      disabled={!isInstructor}
                    />
                    <label htmlFor={`q${index}_opt${optIndex}`}>{option}</label>
                    
                    {isInstructor && question.correctAnswer === option && (
                      <span className="ml-2 text-green-600">✓ Correct</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {question.questionType === 'TEXT' && (
              <textarea
                className="w-full p-2 border rounded mt-2"
                rows={3}
                placeholder="Votre réponse..."
                disabled={!isInstructor}
              />
            )}
            
            {question.questionType === 'CODE' && (
              <textarea
                className="w-full p-2 font-mono border rounded mt-2"
                rows={6}
                placeholder="// Votre code ici..."
                disabled={!isInstructor}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};