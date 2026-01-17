// src/components/exercises/ExerciseEditor.tsx - VERSION SIMPLIFIÉE
'use client';

import React, { useState } from 'react';
import { ExerciseService } from '@/lib/services/ExerciseService';
import { Exercise, Question } from '@/types/exercise';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

interface ExerciseEditorProps {
  courseId: number;
  onSave: (exercise: Exercise) => void;
  onCancel: () => void;
}

export const ExerciseEditor: React.FC<ExerciseEditorProps> = ({
  courseId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxScore: 20,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now(),
      exerciseId: 0,
      question: '',
      questionType: 'TEXT',
      points: 5,
      options: []
    }
  ]);

  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now() + questions.length,
      exerciseId: 0,
      question: '',
      questionType: 'TEXT',
      points: 5,
      options: []
    }]);
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

  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + q.points, 0);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validation
      const trimmedTitle = formData.title.trim();
      if (!trimmedTitle) {
        toast.error('Le titre est requis');
        return;
      }

      if (questions.length === 0) {
        toast.error('Ajoutez au moins une question');
        return;
      }

      // Vérification des points
      const totalPoints = calculateTotalPoints();
      if (totalPoints > formData.maxScore) {
        toast.error(`Total points (${totalPoints}) > Score max (${formData.maxScore})`);
        return;
      }

      // Création avec publication automatique
      const result = await ExerciseService.createExercise(courseId, {
        title: trimmedTitle,
        description: formData.description,
        maxScore: formData.maxScore,
        dueDate: formData.dueDate,
        questions: questions
      });

      toast.success('✅ Exercice créé et publié !');
      onSave(result.data);
      
    } catch (error: any) {
      toast.error(error.message || 'Erreur création exercice');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600">
        ✨ Nouvel Exercice (Publication Automatique)
      </h2>
      
      {/* Bandeau d'information */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <div className="mr-3 text-green-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-green-800">Publication automatique activée</h4>
            <p className="text-green-700 text-sm">
              Cet exercice sera immédiatement publié et visible par les étudiants.
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire principal */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Titre de l'exercice *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Ex: Exercice sur les fonctions"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            placeholder="Instructions pour les étudiants..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Score maximum
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.maxScore}
              onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Date d'échéance
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Liste des questions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">Questions</h3>
            <p className="text-sm text-gray-600">
              {questions.length} question(s) • Total: {calculateTotalPoints()} points
            </p>
          </div>
          <button
            onClick={addQuestion}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-1"
          >
            <FaPlus /> Ajouter une question
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="border rounded p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <span className="font-medium text-gray-700">
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
                  className="w-full px-3 py-2 border rounded mb-2"
                  placeholder="Énoncé de la question"
                />
              </div>

              {/* Type et points */}
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 mr-2">Type:</label>
                  <select
                    value={question.questionType}
                    onChange={(e) => updateQuestion(index, 'questionType', e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="TEXT">Réponse texte</option>
                    <option value="MULTIPLE_CHOICE">Choix multiple</option>
                    <option value="CODE">Code</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mr-2">Points:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={question.points}
                    onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2 border rounded"
                  />
                </div>
              </div>

              {/* Options pour choix multiple */}
              {question.questionType === 'MULTIPLE_CHOICE' && (
                <div className="mb-3">
                  <label className="text-sm text-gray-600 block mb-2">Options:</label>
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
                          className="flex-1 px-3 py-1 border rounded"
                          placeholder={`Option ${optIndex + 1}`}
                        />
                        <button
                          onClick={() => {
                            const newOptions = (question.options || []).filter((_, i) => i !== optIndex);
                            updateQuestion(index, 'options', newOptions);
                          }}
                          className="px-2 text-red-500 hover:text-red-700"
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
                      className="text-sm text-indigo-600 hover:text-indigo-800"
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
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                   flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Création en cours...
            </>
          ) : (
            <>
              <FaSave /> Créer et publier l'exercice
            </>
          )}
        </button>
      </div>
    </div>
  );
};