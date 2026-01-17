// src/components/exercises/ExerciseEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
  
 // Dans l'initialisation de formData
const [formData, setFormData] = useState<Partial<Exercise>>({
  title: exercise?.title || '',
  description: exercise?.description || '',
  maxScore: exercise?.maxScore || 20,
  dueDate: exercise?.dueDate ? new Date(exercise.dueDate).toISOString().split('T')[0] : '',
  status: exercise?.status || 'DRAFT'  // Toujours défini
});

  // Initialiser les questions une seule fois
  const [questions, setQuestions] = useState<Question[]>([]);

  // Initialiser les questions après le montage du composant
  useEffect(() => {
    if (exercise?.content) {
      const parsedQuestions = ExerciseService.parseContentToQuestions(exercise.content);
      setQuestions(parsedQuestions);
    } else if (exercise?.questions && exercise.questions.length > 0) {
      setQuestions(exercise.questions);
    }
  }, [exercise]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(), // ID temporaire
      exerciseId: exercise?.id || 0,
      question: '',
      questionType: 'TEXT',
      points: 5,
      options: []
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  // Calculer le total des points
  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + q.points, 0);
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

      // Validation du score maximum
      const totalPoints = calculateTotalPoints();
      const maxScore = formData.maxScore || 20;
      
      if (totalPoints > maxScore) {
        toast.error(`Le total des points des questions (${totalPoints}) dépasse le score maximum (${maxScore})`);
        return;
      }

      // Utiliser le service unifié
      let savedExercise;
      if (isEditMode && exercise?.id) {
        savedExercise = await ExerciseService.updateExercise(exercise.id, {
          title: trimmedTitle,
          description: formData.description || '',
          maxScore: maxScore,
          dueDate: formData.dueDate,
          status: formData.status as 'DRAFT' | 'PUBLISHED' | 'CLOSED',
          questions: questions
        });
        toast.success('Exercice mis à jour');
      } else {
        savedExercise = await ExerciseService.createExercise(courseId, {
          title: trimmedTitle,
          description: formData.description || '',
          maxScore: maxScore,
          dueDate: formData.dueDate,
          status: formData.status as 'DRAFT' | 'PUBLISHED' | 'CLOSED',
          questions: questions
        });
        toast.success('Exercice créé');
      }
      
      onSave(savedExercise.data);
      
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
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
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="100"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 0 })}
                className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 w-32"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total des points des questions: {calculateTotalPoints()}
              </span>
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ 
                ...formData, 
                status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'CLOSED' 
              })}
              className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
              <option value="CLOSED">Fermé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des questions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold dark:text-white">Questions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {questions.length} question(s) - Total: {calculateTotalPoints()} points
            </p>
          </div>
          <button
            onClick={addQuestion}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
          >
            <FaPlus /> Ajouter
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id || index} className="border rounded p-4 dark:border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <span className="font-medium dark:text-gray-300">
                  Question {index + 1}
                </span>
                <button
                  onClick={() => removeQuestion(index)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Supprimer la question"
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
                <label className="text-sm dark:text-gray-400 mr-2">Type:</label>
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
                  onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 0)}
                  className="px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 w-20"
                />
              </div>

              {/* Options pour choix multiple */}
              {question.questionType === 'MULTIPLE_CHOICE' && (
                <div className="mb-3">
                  <label className="text-sm dark:text-gray-400 block mb-2">Options:</label>
                  <div className="space-y-2">
                    {(question.options || []).map((option, optIndex) => (
                      <div key={optIndex} className="flex gap-2 items-center">
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
                            const newOptions = (question.options || []).filter((_, i) => i !== optIndex);
                            updateQuestion(index, 'options', newOptions);
                          }}
                          className="px-2 text-red-500 hover:text-red-700"
                          aria-label="Supprimer l'option"
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
                  
                  {/* Réponse correcte pour choix multiple */}
                  <div className="mt-3">
                    <label className="text-sm dark:text-gray-400 block mb-2">Réponse correcte:</label>
                    <select
                      value={question.correctAnswer || ''}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                      className="px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 w-full"
                    >
                      <option value="">Sélectionnez la réponse correcte</option>
                      {(question.options || []).map((option, optIndex) => (
                        <option key={optIndex} value={option}>
                          {option || `Option ${optIndex + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Réponse correcte pour les autres types */}
              {(question.questionType === 'TEXT' || question.questionType === 'CODE') && (
                <div className="mb-3">
                  <label className="text-sm dark:text-gray-400 block mb-2">Réponse correcte (optionnel):</label>
                  <textarea
                    value={question.correctAnswer || ''}
                    onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    rows={question.questionType === 'CODE' ? 4 : 2}
                    placeholder={question.questionType === 'CODE' 
                      ? "// Exemple de réponse correcte" 
                      : "Réponse correcte attendue"
                    }
                  />
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
          className="px-4 py-2 border rounded dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 transition-colors"
        >
          <FaSave /> {isEditMode ? 'Mettre à jour' : 'Créer l\'exercice'}
        </button>
      </div>
    </div>
  );
};