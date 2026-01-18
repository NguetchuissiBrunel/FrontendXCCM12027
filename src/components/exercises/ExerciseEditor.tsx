// src/components/exercises/ExerciseEditor.tsx
'use client';

import React, { useState } from 'react';
import { ExerciseService } from '@/lib3/services/ExerciseService';
import { Exercise, Question, ApiResponse } from '@/types/exercise';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaSave, FaTimes, FaCalendarAlt, FaHashtag } from 'react-icons/fa';
import { FiEdit2 } from 'react-icons/fi';

interface ExerciseEditorProps {
  courseId: number;
  onSave: (response: ApiResponse<Exercise>) => void;  // ← Changer ici
  onCancel: () => void;
  initialData?: Partial<Exercise>;
}

export const ExerciseEditor: React.FC<ExerciseEditorProps> = ({
  courseId,
  onSave,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    maxScore: initialData?.maxScore || 20,
    dueDate: initialData?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || [{
      id: Date.now(),
      exerciseId: 0,
      question: '',
      questionType: 'TEXT' as const,
      points: 5,
      options: []
    }]
  );

  const [loading, setLoading] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now() + questions.length,
      exerciseId: 0,
      question: '',
      questionType: 'TEXT',
      points: 5,
      options: []
    };
    
    setQuestions([...questions, newQuestion]);
    setActiveQuestionIndex(questions.length);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error('Un exercice doit avoir au moins une question');
      return;
    }
    
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
    
    if (activeQuestionIndex >= index && activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    
    if (field === 'questionType' && value === 'MULTIPLE_CHOICE') {
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value,
        options: newQuestions[index].options || ['Option 1', 'Option 2']
      };
    } else {
      newQuestions[index] = { ...newQuestions[index], [field]: value };
    }
    
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const options = [...(newQuestions[questionIndex].options || [])];
    options.push(`Option ${options.length + 1}`);
    newQuestions[questionIndex].options = options;
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    const options = [...(newQuestions[questionIndex].options || [])];
    options[optionIndex] = value;
    newQuestions[questionIndex].options = options;
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    const options = [...(newQuestions[questionIndex].options || [])];
    options.splice(optionIndex, 1);
    newQuestions[questionIndex].options = options;
    setQuestions(newQuestions);
  };

  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + q.points, 0);
  };

  // CORRECTION COMPLÈTE - Remplacer TOUTE la fonction handleSubmit
const handleSubmit = async () => {
  try {
    setLoading(true);
    
    // 1. Validation du titre
    const titleTrimmed = formData.title.trim(); // ← Déclarer la variable ici
    if (!titleTrimmed) {
      toast.error('Le titre est requis');
      return;
    }

    // 2. Validation des questions
    if (questions.length === 0) {
      toast.error('Ajoutez au moins une question');
      return;
    }

    // 3. Validation des points
    const totalPoints = calculateTotalPoints();
    if (totalPoints > formData.maxScore) {
      toast.error(`Total points (${totalPoints}) > Score max (${formData.maxScore})`);
      return;
    }

    // 4. Appel au service
    let result;
    if (initialData?.id) {
      // Mise à jour
      result = await ExerciseService.updateExercise(initialData.id, {
        title: titleTrimmed, // ← Utiliser la variable déclarée
        description: formData.description,
        maxScore: formData.maxScore,
        dueDate: formData.dueDate,
        questions: questions
      });
      console.log('Résultat UPDATE:', result);
      toast.success('✅ Exercice mis à jour !');
    } else {
      // Création
      result = await ExerciseService.createExercise(courseId, {
        title: titleTrimmed, // ← Utiliser la variable déclarée
        description: formData.description,
        maxScore: formData.maxScore,
        dueDate: formData.dueDate,
        questions: questions
      });
      console.log('Résultat CREATE:', result);
      toast.success('✅ Exercice créé et publié !');
    }

    // 5. Debug
    console.log('Type de result:', typeof result);
    console.log('Keys de result:', Object.keys(result || {}));
    console.log('Est un ApiResponse?', result && 'data' in result);
    console.log('Est un Exercise?', result && 'id' in result && 'title' in result);

    // 6. Passer le résultat
    onSave(result);
    
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de l\'opération');
    console.error(error);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="bg-white rounded-2xl p-6 max-w-4xl mx-auto shadow-xl border border-gray-100">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FiEdit2 className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData?.id ? '✏️ Modifier l\'Exercice' : '✨ Nouvel Exercice'}
          </h2>
        </div>
        
        {!initialData?.id && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <div className="mr-3 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-800">Publication automatique</h4>
                <p className="text-green-700 text-sm">
                  Cet exercice sera immédiatement publié et visible par les étudiants.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de gauche - Formulaire principal */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Titre */}
            <div className="bg-gray-50 p-5 rounded-xl">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Titre de l'exercice *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Ex: Exercice sur les fonctions en JavaScript"
              />
            </div>

            {/* Description */}
            <div className="bg-gray-50 p-5 rounded-xl">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                rows={3}
                placeholder="Instructions détaillées pour les étudiants..."
              />
            </div>

            {/* Paramètres */}
            <div className="bg-gray-50 p-5 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-4">Paramètres</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
                    <FaHashtag className="text-gray-400" />
                    Score maximum
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne de droite - Liste des questions */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            {/* En-tête questions */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 mb-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Questions</h3>
                  <p className="text-indigo-100 text-sm">
                    {questions.length} question(s)
                  </p>
                </div>
                <button
                  onClick={addQuestion}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Ajouter une question"
                >
                  <FaPlus className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm">
                  <span>Total points:</span>
                  <span className="font-bold">{calculateTotalPoints()} / {formData.maxScore}</span>
                </div>
                <div className="mt-2 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (calculateTotalPoints() / formData.maxScore) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Liste des questions */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {questions.map((question, index) => (
                <div 
                  key={question.id || index}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    activeQuestionIndex === index 
                      ? 'bg-indigo-50 border-2 border-indigo-200 shadow-sm' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                  onClick={() => setActiveQuestionIndex(index)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activeQuestionIndex === index 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        <span className="font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {question.question || `Question ${index + 1}`}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                            {question.questionType}
                          </span>
                          <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                            {question.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                    {questions.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestion(index);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Éditeur de question active */}
      {questions[activeQuestionIndex] && (
        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              Question {activeQuestionIndex + 1}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Type:</span>
              <select
                value={questions[activeQuestionIndex].questionType}
                onChange={(e) => updateQuestion(activeQuestionIndex, 'questionType', e.target.value)}
                className="px-3 py-1 border rounded-lg bg-white text-sm"
              >
                <option value="TEXT">Réponse texte</option>
                <option value="MULTIPLE_CHOICE">Choix multiple</option>
                <option value="CODE">Code</option>
              </select>
            </div>
          </div>

          {/* Énoncé de la question */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Énoncé de la question *
            </label>
            <textarea
              value={questions[activeQuestionIndex].question}
              onChange={(e) => updateQuestion(activeQuestionIndex, 'question', e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="Rédigez votre question ici..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Points attribués
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={questions[activeQuestionIndex].points}
                  onChange={(e) => updateQuestion(activeQuestionIndex, 'points', parseInt(e.target.value) || 1)}
                  className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="text-gray-600">points</span>
              </div>
            </div>

            {/* Réponse correcte (si applicable) */}
            {questions[activeQuestionIndex].questionType !== 'MULTIPLE_CHOICE' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Réponse correcte (optionnel)
                </label>
                <input
                  type="text"
                  value={questions[activeQuestionIndex].correctAnswer || ''}
                  onChange={(e) => updateQuestion(activeQuestionIndex, 'correctAnswer', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Réponse attendue..."
                />
              </div>
            )}
          </div>

          {/* Options pour choix multiple */}
          {questions[activeQuestionIndex].questionType === 'MULTIPLE_CHOICE' && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Options de réponse *
                </label>
                <button
                  type="button"
                  onClick={() => addOption(activeQuestionIndex)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  + Ajouter une option
                </button>
              </div>
              
              <div className="space-y-3">
                {(questions[activeQuestionIndex].options || []).map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                      <input
                        type="radio"
                        name={`correct-answer-${activeQuestionIndex}`}
                        checked={questions[activeQuestionIndex].correctAnswer === option}
                        onChange={() => updateQuestion(activeQuestionIndex, 'correctAnswer', option)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(activeQuestionIndex, optIndex, e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none"
                        placeholder={`Option ${optIndex + 1}`}
                      />
                    </div>
                    {(questions[activeQuestionIndex].options || []).length > 2 && (
                      <button
                        onClick={() => removeOption(activeQuestionIndex, optIndex)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {initialData?.id ? 'Mise à jour...' : 'Création...'}
              </>
            ) : (
              <>
                <FaSave className="w-5 h-5" />
                {initialData?.id ? 'Mettre à jour' : 'Créer l\'exercice'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};