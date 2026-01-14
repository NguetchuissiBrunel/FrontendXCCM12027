// src/components/exercises/ExerciseEditor.tsx
'use client';

import React, { useState } from 'react';
import { ExerciseService } from '@/lib/services/ExerciseService';
import { Exercise, Question } from '@/types/exercise';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

interface ExerciseEditorProps {
  courseId: number;
  exercise?: Exercise | null;
  onSave: (exercise: Exercise) => void;
  onCancel: () => void;
}

export const ExerciseEditor: React.FC<ExerciseEditorProps> = ({
  courseId,
  exercise,
  onSave,
  onCancel
}) => {
  const isEditMode = !!exercise?.id;
  
  const [formData, setFormData] = useState<Partial<Exercise>>({
    title: exercise?.title || '',
    description: exercise?.description || '',
    maxScore: exercise?.maxScore || 20,
    dueDate: exercise?.dueDate ? new Date(exercise.dueDate).toISOString().split('T')[0] : '',
    questions: exercise?.questions || [],
    status: exercise?.status || 'DRAFT'
  });

  const [questions, setQuestions] = useState<Question[]>(
    exercise?.questions || []
  );

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(), // Temporaire
        exerciseId: exercise?.id || 0,
        question: '',
        questionType: 'TEXT',
        points: 5,
        options: []
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    try {
      const trimmedTitle = formData.title?.trim();
      if (!trimmedTitle) {
        toast.error('Le titre est requis');
        return;
      }

      if (questions.length === 0) {
        toast.error('Ajoutez au moins une question');
        return;
      }

      // Créer un objet avec les types exacts attendus par les services
      const exerciseData = {
        title: trimmedTitle,
        description: formData.description || '',
        maxScore: formData.maxScore || 20,
        dueDate: formData.dueDate || undefined,
        status: (formData.status === 'DRAFT' || formData.status === 'PUBLISHED') 
          ? formData.status 
          : 'DRAFT' as 'DRAFT' | 'PUBLISHED' | undefined,
        questions,
        courseId
      };

      let savedExercise;
      if (isEditMode && exercise?.id) {
        // Pour l'édition: UpdateExerciseRequest n'inclut pas 'id' dans le body
        savedExercise = await ExerciseService.updateExercise(exercise.id, {
          ...exerciseData,
          // N'incluez pas 'id' ici car il est déjà dans l'URL/paramètre
        });
        toast.success('Exercice mis à jour');
      } else {
        // Pour la création: CreateExerciseRequest
        savedExercise = await ExerciseService.createExercise(courseId, {
          ...exerciseData,
          status: exerciseData.status || 'DRAFT' // Valeur par défaut
        });
        toast.success('Exercice créé');
      }

      onSave(savedExercise);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold dark:text-white mb-4">
          {isEditMode ? 'Modifier l\'exercice' : 'Nouvel exercice'}
        </h2>
        
        <div className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Titre de l'exercice *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="Ex: Exercice sur les fonctions"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              rows={3}
              placeholder="Instructions pour les étudiants..."
            />
          </div>

          {/* Date d'échéance */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Date d'échéance
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Score maximum */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Score maximum
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.maxScore}
              onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
              className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 w-32"
            />
          </div>
        </div>
      </div>

      {/* Liste des questions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold dark:text-white">Questions</h3>
          <button
            onClick={addQuestion}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
          >
            <FaPlus /> Ajouter
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="border rounded p-4 dark:border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <span className="font-medium dark:text-gray-300">
                  Question {index + 1}
                </span>
                <button
                  onClick={() => removeQuestion(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>

              {/* Texte de la question */}
              <div className="mb-3">
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 mb-2"
                  placeholder="Énoncé de la question"
                />
              </div>

              {/* Type de question */}
              <div className="mb-3">
                <select
                  value={question.questionType}
                  onChange={(e) => updateQuestion(index, 'questionType', e.target.value)}
                  className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="TEXT">Réponse texte</option>
                  <option value="MULTIPLE_CHOICE">Choix multiple</option>
                  <option value="CODE">Code</option>
                </select>
              </div>

              {/* Points */}
              <div className="mb-3">
                <label className="text-sm dark:text-gray-400 mr-2">Points:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={question.points}
                  onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                  className="px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 w-20"
                />
              </div>

              {/* Options pour choix multiple */}
              {question.questionType === 'MULTIPLE_CHOICE' && (
                <div className="mb-3">
                  <label className="text-sm dark:text-gray-400 block mb-2">Options:</label>
                  <div className="space-y-2">
                    {(question.options || []).map((option, optIndex) => (
                      <div key={optIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(question.options || [])];
                            newOptions[optIndex] = e.target.value;
                            updateQuestion(index, 'options', newOptions);
                          }}
                          className="flex-1 px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                          placeholder={`Option ${optIndex + 1}`}
                        />
                        <button
                          onClick={() => {
                            const newOptions = question.options?.filter((_, i) => i !== optIndex) || [];
                            updateQuestion(index, 'options', newOptions);
                          }}
                          className="px-2 text-red-500"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newOptions = [...(question.options || []), ''];
                        updateQuestion(index, 'options', newOptions);
                      }}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      + Ajouter une option
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 border rounded dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
        >
          <FaSave /> {isEditMode ? 'Mettre à jour' : 'Créer l\'exercice'}
        </button>
      </div>
    </div>
  );
};