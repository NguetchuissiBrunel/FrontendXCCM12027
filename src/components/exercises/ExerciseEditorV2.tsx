// src/components/exercises/ExerciseEditorV2.tsx - VERSION UNIFIÉE
'use client';

import React, { useState, useEffect } from 'react';
import { Exercise, Question, QuestionType, ApiResponse, CreateExerciseDto, UpdateExerciseDto } from '@/types/exercise';
import { useExercise, useCreateExercise } from '@/hooks/useExercise';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Type,
  CheckSquare,
  Code,
  Save,
  X,
  AlertCircle,
  FileText,
  Clock,
  Award,
  Eye
} from 'lucide-react';

interface ExerciseEditorV2Props {
  courseId: number;
  initialData?: Exercise;
  onSave: (result: ApiResponse<Exercise>) => void;
  onCancel: () => void;
}

export default function ExerciseEditorV2({
  courseId,
  initialData,
  onSave,
  onCancel
}: ExerciseEditorV2Props) {
  const isEditing = !!initialData?.id;

  // Utiliser les nouveaux hooks
  const { update, isUpdating } = useExercise(initialData?.id);
  const { mutate: createExercise, isPending: isCreating } = useCreateExercise();

  const [exercise, setExercise] = useState<Exercise>(
    initialData || {
      id: 0,
      courseId,
      title: '',
      description: '',
      maxScore: 20,
      status: 'PUBLISHED', // ⬅️ CHANGER "DRAFT" EN "PUBLISHED"
      createdAt: new Date().toISOString(),
      questions: [],
      version: '2.0'
    }
  );

  const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Mettre à jour l'exercice quand les questions changent
  useEffect(() => {
    setExercise(prev => ({
      ...prev,
      questions
    }));
  }, [questions]);

  const handleTitleChange = (value: string) => {
    setExercise(prev => ({ ...prev, title: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setExercise(prev => ({ ...prev, description: value }));
  };

  const handleMaxScoreChange = (value: number) => {
    setExercise(prev => ({ ...prev, maxScore: value }));
  };

  const handleDueDateChange = (value: string) => {
    setExercise(prev => ({ ...prev, dueDate: value }));
  };

  const addQuestion = (type: QuestionType = 'TEXT') => {
    const newQuestion: Question = {
      id: Date.now(),
      exerciseId: exercise.id,
      text: '',
      type,
      points: 1,
      order: questions.length
    };

    if (type === 'MULTIPLE_CHOICE') {
      newQuestion.options = ['', ''];
    }

    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error('Un exercice doit avoir au moins une question');
      return;
    }

    const newQuestions = questions.filter((_, i) => i !== index);
    // Réorganiser l'ordre
    newQuestions.forEach((q, i) => { q.order = i; });
    setQuestions(newQuestions);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    // Échanger les questions
    [newQuestions[index], newQuestions[newIndex]] =
      [newQuestions[newIndex], newQuestions[index]];

    // Mettre à jour l'ordre
    newQuestions.forEach((q, i) => { q.order = i; });

    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];

    if (question.options) {
      question.options = [...question.options, ''];
    } else {
      question.options = [''];
    }

    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];

    if (question.options) {
      question.options[optionIndex] = value;
      setQuestions(newQuestions);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];

    if (question.options && question.options.length > 2) {
      question.options = question.options.filter((_, i) => i !== optionIndex);
      setQuestions(newQuestions);
    } else {
      toast.error('Une question à choix multiple doit avoir au moins 2 options');
    }
  };

  const validateExercise = () => {
    const errors: string[] = [];

    // Validation du titre
    if (!exercise.title.trim()) {
      errors.push('Le titre est requis');
    }

    // Validation des questions
    if (questions.length === 0) {
      errors.push('Ajoutez au moins une question');
    } else {
      questions.forEach((q, index) => {
        if (!q.text.trim()) {
          errors.push(`La question ${index + 1} est vide`);
        }

        if (q.points <= 0) {
          errors.push(`La question ${index + 1} doit avoir des points positifs`);
        }

        if (q.type === 'MULTIPLE_CHOICE') {
          if (!q.options || q.options.length < 2) {
            errors.push(`La question ${index + 1} doit avoir au moins 2 options`);
          }

          q.options?.forEach((opt, optIndex) => {
            if (!opt.trim()) {
              errors.push(`L'option ${optIndex + 1} de la question ${index + 1} est vide`);
            }
          });
        }
      });
    }

    // Validation du score total
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    if (totalPoints > exercise.maxScore) {
      errors.push(`Total des points (${totalPoints}) dépasse le score maximum (${exercise.maxScore})`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateExercise()) {
      toast.error('Veuillez corriger les erreurs avant de sauvegarder');
      return;
    }

    try {
      let result: ApiResponse<Exercise>;

      if (isEditing && exercise.id) {
        // Mise à jour
        const updateData: UpdateExerciseDto = {
          title: exercise.title,
          description: exercise.description,
          maxScore: exercise.maxScore,
          dueDate: exercise.dueDate,
          questions: questions.map(q => ({
            id: q.id,
            text: q.text,
            type: q.type,
            points: q.points,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            order: q.order
          }))
        };

        result = await update(updateData);
      } else {
        // Création
        const createData: CreateExerciseDto = {
          courseId,
          title: exercise.title,
          description: exercise.description,
          maxScore: exercise.maxScore,
          dueDate: exercise.dueDate,
          questions: questions.map(q => ({
            text: q.text,
            type: q.type,
            points: q.points,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            order: q.order
          }))
        };

        result = await createExercise(courseId, createData);
      }

      onSave(result);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);

      const errorResult: ApiResponse<Exercise> = {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde',
        timestamp: new Date().toISOString()
      };

      onSave(errorResult);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + q.points, 0);
  };

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'TEXT': return <Type className="w-4 h-4" />;
      case 'MULTIPLE_CHOICE': return <CheckSquare className="w-4 h-4" />;
      case 'CODE': return <Code className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const isLoading = isUpdating || isCreating;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-300 dark:border-gray-700 overflow-hidden">
      {/* En-tête */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {isEditing ? 'Éditeur d\'exercice' : 'Nouvel exercice'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEditing ? 'Modifiez le contenu de votre exercice' : 'Créez un nouvel exercice'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {calculateTotalPoints()}/{exercise.maxScore} points
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">
                  Erreurs de validation
                </h3>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-400">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Informations générales */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Informations générales
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre de l'exercice *
              </label>
              <input
                type="text"
                value={exercise.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                placeholder="Ex: Introduction à la programmation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Score maximum *
              </label>
              <input
                type="number"
                min="1"
                value={exercise.maxScore}
                onChange={(e) => handleMaxScoreChange(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={exercise.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                rows={3}
                placeholder="Décrivez l'objectif de l'exercice..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Date d'échéance
                </div>
              </label>
              <input
                type="datetime-local"
                value={exercise.dueDate ? exercise.dueDate.slice(0, 16) : ''}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Questions ({questions.length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Organisez et configurez les questions de l'exercice
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => addQuestion('TEXT')}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                Ajouter une question
              </button>
            </div>
          </div>

          {/* Types de questions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => addQuestion('TEXT')}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Type className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800 dark:text-gray-200">Texte libre</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Réponse courte ou longue</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => addQuestion('MULTIPLE_CHOICE')}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800 dark:text-gray-200">Choix multiple</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">QCM avec options</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => addQuestion('CODE')}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800 dark:text-gray-200">Code</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Exercice de programmation</div>
                </div>
              </div>
            </button>
          </div>

          {/* Liste des questions */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl">
                <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aucune question
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Commencez par ajouter votre première question
                </p>
                <button
                  onClick={() => addQuestion('TEXT')}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Ajouter une question
                </button>
              </div>
            ) : (
              questions.map((question, index) => (
                <div key={question.id || index} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                  {/* En-tête de la question */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-full font-bold">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          {getQuestionTypeIcon(question.type)}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {question.type === 'TEXT' ? 'Texte libre' :
                              question.type === 'MULTIPLE_CHOICE' ? 'Choix multiple' : 'Code'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Points:</span>
                          <input
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) => updateQuestion(index, { points: parseInt(e.target.value) || 1 })}
                            className="w-20 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveQuestion(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30"
                          >
                            <MoveUp size={18} />
                          </button>
                          <button
                            onClick={() => moveQuestion(index, 'down')}
                            disabled={index === questions.length - 1}
                            className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30"
                          >
                            <MoveDown size={18} />
                          </button>
                          <button
                            onClick={() => removeQuestion(index)}
                            className="p-1.5 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenu de la question */}
                  <div className="p-6">
                    {/* Énoncé */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Énoncé de la question *
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) => updateQuestion(index, { text: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                        rows={2}
                        placeholder="Posez votre question ici..."
                      />
                    </div>

                    {/* Options pour choix multiple */}
                    {question.type === 'MULTIPLE_CHOICE' && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Options de réponse *
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(index)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            + Ajouter une option
                          </button>
                        </div>

                        <div className="space-y-3">
                          {question.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium">
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              />
                              <button
                                onClick={() => removeOption(index, optIndex)}
                                className="p-2 text-red-500 hover:text-red-700"
                                disabled={!question.options || question.options.length <= 2}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Réponse correcte */}
                        {question.options && question.options.length > 0 && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Réponse correcte
                            </label>
                            <select
                              value={question.correctAnswer || ''}
                              onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
                              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                            >
                              <option value="">Sélectionnez la réponse correcte</option>
                              {question.options.map((option, optIndex) => (
                                <option key={optIndex} value={option}>
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Explication */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Explication (optionnelle)
                      </label>
                      <textarea
                        value={question.explanation || ''}
                        onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                        rows={2}
                        placeholder="Expliquez la réponse ou donnez des indices..."
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Résumé */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Résumé de l'exercice
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Titre</div>
                <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {exercise.title || 'Non défini'}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {questions.length} question{questions.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score total</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {calculateTotalPoints()}/{exercise.maxScore} points
                  {calculateTotalPoints() > exercise.maxScore && (
                    <span className="ml-2 text-sm text-red-600">⚠️ Dépassement</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Date d'échéance</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {exercise.dueDate
                    ? new Date(exercise.dueDate).toLocaleDateString('fr-FR')
                    : 'Non définie'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Types de questions</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {Array.from(new Set(questions.map(q => q.type))).join(', ')}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Statut</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {exercise.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <X size={20} />
            Annuler
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // Prévisualisation
                const previewData = {
                  ...exercise,
                  questions
                };
                console.log('Preview:', previewData);
                toast.success('Aperçu généré (voir console)');
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
            >
              <Eye size={20} />
              Aperçu
            </button>

            <button
              onClick={handleSave}
              disabled={isLoading || validationErrors.length > 0}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={20} />
              {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}