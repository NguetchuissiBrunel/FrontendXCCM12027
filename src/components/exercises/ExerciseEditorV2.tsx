// src/components/exercises/ExerciseEditorV2.tsx - VERSION UNIFIÉE
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('exercises.editor');
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
      toast.error(t('minOneQuestion'));
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
      toast.error(t('minTwoOptions'));
    }
  };

  const validateExercise = () => {
    const errors: string[] = [];

    // Validation du titre
    if (!exercise.title.trim()) {
      errors.push(t('titleRequired'));
    }

    // Validation des questions
    if (questions.length === 0) {
      errors.push(t('addAtLeastOne'));
    } else {
      questions.forEach((q, index) => {
        if (!q.text.trim()) {
          errors.push(t('questionEmpty', { n: index + 1 }));
        }

        if (q.points <= 0) {
          errors.push(t('questionPositivePoints', { n: index + 1 }));
        }

        if (q.type === 'MULTIPLE_CHOICE') {
          if (!q.options || q.options.length < 2) {
            errors.push(t('questionMinOptions', { n: index + 1 }));
          }

          q.options?.forEach((opt, optIndex) => {
            if (!opt.trim()) {
              errors.push(t('optionEmpty', { o: optIndex + 1, n: index + 1 }));
            }
          });
        }
      });
    }

    // Validation du score total
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    if (totalPoints > exercise.maxScore) {
      errors.push(t('totalExceedsMax', { total: totalPoints, max: exercise.maxScore }));
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateExercise()) {
      toast.error(t('saveErrorToast'));
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
        message: error instanceof Error ? error.message : t('saveError'),
        timestamp: new Date().toISOString()
      };

      onSave(errorResult);
      toast.error(t('saveError'));
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
  const getQuestionTypeLabel = (type: QuestionType): string => {
    switch (type) {
      case 'TEXT': return t('freeText');
      case 'MULTIPLE_CHOICE': return t('multipleChoice');
      case 'CODE': return t('code');
      default: return '';
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
                {isEditing ? t('editTitle') : t('newTitle')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEditing ? t('editSubtitle') : t('newSubtitle')}
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
                  {t('validationErrors')}
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
            {t('generalInfo')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('exerciseTitle')}
              </label>
              <input
                type="text"
                value={exercise.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                placeholder={t('exerciseTitlePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('maxScore')}
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
                {t('description')}
              </label>
              <textarea
                value={exercise.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                rows={3}
                placeholder={t('descPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('dueDate')}
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
                {t('questionsTitle')} ({questions.length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('questionsSubtitle')}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => addQuestion('TEXT')}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                {t('addQuestion')}
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
                  <div className="font-medium text-gray-800 dark:text-gray-200">{t('freeText')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('freeTextSub')}</div>
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
                  <div className="font-medium text-gray-800 dark:text-gray-200">{t('multipleChoice')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('multipleChoiceSub')}</div>
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
                  <div className="font-medium text-gray-800 dark:text-gray-200">{t('code')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('codeSub')}</div>
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
                  {t('noQuestion')}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('noQuestionSub')}
                </p>
                <button
                  onClick={() => addQuestion('TEXT')}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  {t('addQuestion')}
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
                            {question.type === 'TEXT' ? t('freeText') :
                              question.type === 'MULTIPLE_CHOICE' ? t('multipleChoice') : t('code')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t('points')}</span>
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
                        {t('questionStatement')}
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) => updateQuestion(index, { text: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                        rows={2}
                        placeholder={t('questionPlaceholder')}
                      />
                    </div>

                    {/* Options pour choix multiple */}
                    {question.type === 'MULTIPLE_CHOICE' && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('answerOptions')}
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(index)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            {t('addOption')}
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
                                placeholder={`${t('optionLabel')} ${String.fromCharCode(65 + optIndex)}`}
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
                              {t('correctAnswer')}
                            </label>
                            <select
                              value={question.correctAnswer || ''}
                              onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
                              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                            >
                              <option value="">{t('selectCorrectAnswer')}</option>
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
                        {t('explanation')}
                      </label>
                      <textarea
                        value={question.explanation || ''}
                        onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                        rows={2}
                        placeholder={t('explanationPlaceholder')}
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
            {t('summaryTitle')}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('summaryTitleLabel')}</div>
                <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {exercise.title || t('summaryUndefined')}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('summaryQuestions')}</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {questions.length} question{questions.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('summaryTotalScore')}</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {calculateTotalPoints()}/{exercise.maxScore} points
                  {calculateTotalPoints() > exercise.maxScore && (
                    <span className="ml-2 text-sm text-red-600">⚠️ {t('summaryOverflow')}</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('summaryDueDate')}</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {exercise.dueDate
                    ? new Date(exercise.dueDate).toLocaleDateString()
                    : t('summaryDueDateNone')}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('summaryQuestionTypes')}</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {Array.from(new Set(questions.map(q => q.type))).join(', ')}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('summaryStatus')}</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {exercise.status === 'PUBLISHED' ? t('statusPublished') : t('statusDraft')}
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
            {t('cancel')}
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
                toast.success(t('previewGenerated'));
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
            >
              <Eye size={20} />
              {t('preview')}
            </button>

            <button
              onClick={handleSave}
              disabled={isLoading || validationErrors.length > 0}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={20} />
              {isLoading ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
