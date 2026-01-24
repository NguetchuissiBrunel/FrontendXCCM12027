// src/app/(dashboard)/profdashboard/exercises/[courseId]/update/[exerciseId]/page.tsx - VERSION CORRIGÉE
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertCircle,
  FileText,
  BookOpen,
  ChevronRight,
  Shield,
  Clock,
  Users,
  Eye,
  Loader2,
  Plus,
  Trash2,
  Save,
  X,
  Award,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw
} from 'lucide-react';

import { useExercise } from '@/hooks/useExercise';
import { Exercise, Question, QuestionType, ApiResponse, UpdateExerciseDto, UpdateQuestionDto } from '@/types/exercise';

export default function UpdateExercisePage() {
  const params = useParams();
  const router = useRouter();

  const courseId = parseInt(params.courseId as string);
  const exerciseId = parseInt(params.exerciseId as string);

  // Hook pour récupérer et mettre à jour l'exercice
  const {
    exercise,
    isLoading,
    error,
    update,
    isUpdating
  } = useExercise(exerciseId, {
    enabled: !!exerciseId,
  });

  // États locaux
  const [localExercise, setLocalExercise] = useState<Exercise | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [courseInfo, setCourseInfo] = useState<{
    title: string;
    category?: string;
  } | null>(null);

  // ============ INITIALISATION ============

  useEffect(() => {
    if (exercise) {
      setLocalExercise(exercise);
      setQuestions(exercise.questions || []);
      setHasUnsavedChanges(false);
      setValidationErrors([]);
    }
  }, [exercise]);

  useEffect(() => {
    loadCourseInfo();
  }, [courseId]);

  const loadCourseInfo = async () => {
    try {
      setCourseInfo({
        title: `Cours #${courseId}`,
        category: 'Informatique',
      });
    } catch (error) {
      console.error('Erreur chargement infos cours:', error);
    }
  };

  // ============ VALIDATION EN TEMPS RÉEL ============

  const validateInRealTime = useCallback((): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!localExercise?.title?.trim()) {
      errors.push('Le titre est requis');
    }

    if (questions.length === 0) {
      errors.push('Ajoutez au moins une question');
    } else {
      questions.forEach((q, index) => {
        const questionNumber = index + 1;
        
        // Validation du texte de la question
        if (!q.text?.trim()) {
          errors.push(`Question ${questionNumber}: L'énoncé est requis`);
        }

        // Validation des points
        if (!q.points || q.points <= 0) {
          errors.push(`Question ${questionNumber}: Les points doivent être positifs`);
        }

        // Validation spécifique aux questions à choix multiple
        if (q.type === 'MULTIPLE_CHOICE') {
          if (!q.options || q.options.length < 2) {
            errors.push(`Question ${questionNumber}: Au moins 2 options sont requises`);
          } else {
            q.options.forEach((opt, optIndex) => {
              if (!opt?.trim()) {
                errors.push(`Question ${questionNumber}: L'option ${optIndex + 1} ne peut pas être vide`);
              }
            });
          }
        }
      });
    }

    // Validation du score total
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
    if (localExercise && totalPoints > localExercise.maxScore) {
      errors.push(`Total des points (${totalPoints}) dépasse le score maximum (${localExercise.maxScore})`);
    }

    // Vérifier la cohérence des scores si exercice déjà noté
    if (localExercise?.submissionCount && localExercise.submissionCount > 0) {
      if (totalPoints !== localExercise.maxScore) {
        errors.push('Attention: Changer le score maximum affectera les notations existantes');
      }
    }

    setValidationErrors(errors);
    return { valid: errors.length === 0, errors };
  }, [localExercise, questions]);

  // Validation automatique à chaque changement
  useEffect(() => {
    if (hasUnsavedChanges && localExercise) {
      validateInRealTime();
    }
  }, [hasUnsavedChanges, localExercise, questions, validateInRealTime]);

  // ============ GESTION DES QUESTIONS ============

  const addQuestion = (type: QuestionType = 'TEXT') => {
    const newQuestion: Question = {
      id: Date.now(),
      exerciseId: exerciseId,
      text: '',
      type,
      points: 1,
      order: questions.length
    };

    if (type === 'MULTIPLE_CHOICE') {
      newQuestion.options = ['Option A', 'Option B'];
    }

    setQuestions([...questions, newQuestion]);
    setHasUnsavedChanges(true);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQuestions = [...questions];
    
    newQuestions[index] = {
      ...newQuestions[index],
      ...updates
    };

    setQuestions(newQuestions);
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];

    if (question.options) {
      question.options = [...question.options, `Option ${String.fromCharCode(65 + question.options.length)}`];
    } else {
      question.options = ['Option A', 'Option B'];
    }

    setQuestions(newQuestions);
    setHasUnsavedChanges(true);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];

    if (question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      newQuestions[questionIndex] = {
        ...question,
        options: newOptions
      };
      setQuestions(newQuestions);
      setHasUnsavedChanges(true);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];

    if (question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      newQuestions[questionIndex] = {
        ...question,
        options: newOptions
      };
      setQuestions(newQuestions);
      setHasUnsavedChanges(true);
    } else {
      toast.error('Une question à choix multiple doit avoir au moins 2 options');
    }
  };

  // ============ GESTION DES CHANGEMENTS DE L'EXERCICE ============

  const handleExerciseChange = (updates: Partial<Exercise>) => {
    setLocalExercise(prev => prev ? { ...prev, ...updates } : null);
    setHasUnsavedChanges(true);
  };

  // ============ SAUVEGARDE ============

  const handleSave = async () => {
    if (!localExercise || !exerciseId) {
      toast.error('Données d\'exercice manquantes');
      return;
    }

    const validation = validateInRealTime();
    if (!validation.valid) {
      toast.error('Veuillez corriger les erreurs avant de sauvegarder');
      return;
    }

    try {
      console.log('🔄 Enregistrement des modifications...');

      const updateData: UpdateExerciseDto = {
        title: localExercise.title,
        description: localExercise.description || '',
        maxScore: localExercise.maxScore,
        dueDate: localExercise.dueDate || undefined,
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          type: q.type,
          points: q.points,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          order: q.order
        } as UpdateQuestionDto))
      };

      console.log('📤 Données à envoyer:', updateData);

      const result = await update(updateData);

      if (result.success) {
        toast.success(result.message || '✅ Exercice mis à jour avec succès');
        setHasUnsavedChanges(false);
        setValidationErrors([]);
        
        // Redirection après un délai
        setTimeout(() => {
          router.push(`/profdashboard/exercises/${courseId}/view/${exerciseId}`);
        }, 1500);
      } else {
        toast.error(result.message || '❌ Erreur lors de la mise à jour');
      }

    } catch (error: any) {
      console.error('❌ Erreur de sauvegarde:', error);
      toast.error(`Erreur: ${error.message || 'Erreur inconnue lors de la sauvegarde'}`);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (!confirm('Vous avez des modifications non enregistrées. Voulez-vous vraiment annuler ?')) {
        return;
      }
    }
    router.push(`/profdashboard/exercises/${courseId}/view/${exerciseId}`);
  };

  const handlePreview = () => {
    window.open(`/profdashboard/exercises/${courseId}/preview/${exerciseId}`, '_blank');
  };

  const handleReset = () => {
    if (exercise) {
      setLocalExercise(exercise);
      setQuestions(exercise.questions || []);
      setHasUnsavedChanges(false);
      setValidationErrors([]);
      toast.success('Modifications réinitialisées');
    }
  };

  // ============ UTILITAIRES ============

  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + (q.points || 0), 0);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Non définie';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const getQuestionTypeLabel = (type: QuestionType): string => {
    switch (type) {
      case 'TEXT': return 'Texte libre';
      case 'MULTIPLE_CHOICE': return 'Choix multiple';
      case 'CODE': return 'Code';
      default: return type;
    }
  };

  // ============ ÉTATS DÉRIVÉS ============

  const isSaveDisabled = (): boolean => {
    // Désactivé si :
    // 1. En cours de mise à jour
    // 2. Pas de changements non sauvegardés
    // 3. Il y a des erreurs de validation
    if (isUpdating) return true;
    if (!hasUnsavedChanges) return true;
    if (validationErrors.length > 0) return true;
    if (!localExercise?.title?.trim()) return true;
    
    return false;
  };

  const canAddQuestion = questions.length < 50; // Limite arbitraire

  // ============ RENDU ============

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Chargement de l'exercice...</p>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    const errorMessage = error?.message || 'Exercice non trouvé';

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {errorMessage}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            L'exercice demandé n'existe pas ou vous n'y avez pas accès.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
            <button
              onClick={() => router.push(`/profdashboard/exercises/${courseId}`)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Retour aux exercices
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayExercise = localExercise || exercise;
  const totalPoints = calculateTotalPoints();
  const pointsRatio = localExercise ? totalPoints / localExercise.maxScore : 0;
  const isPointsValid = pointsRatio <= 1;
  const hasSubmissions = (displayExercise.submissionCount || 0) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link
              href="/profdashboard"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link
              href="/profdashboard/exercises"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Exercices
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link
              href={`/profdashboard/exercises/${courseId}`}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {courseInfo?.title || `Cours #${courseId}`}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link
              href={`/profdashboard/exercises/${courseId}/view/${exerciseId}`}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {displayExercise.title}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Édition
            </span>
          </div>

          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Retour à l'exercice
            </button>

            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Réinitialiser
                </button>
              )}

              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-2"
              >
                <Eye size={18} />
                Aperçu
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
                <FileText size={16} className="text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Édition d'exercice
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* En-tête de l'exercice */}
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                  <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Modifier l'exercice
                  </h1>
                  <p className="text-purple-700 dark:text-purple-300 font-medium">
                    {displayExercise.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      displayExercise.status === 'PUBLISHED'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                    }`}>
                      {displayExercise.status === 'PUBLISHED' ? 'Publié' : 'Fermé'}
                    </span>
                    {courseInfo?.category && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
                        {courseInfo.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Shield size={18} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Statut</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {displayExercise.status === 'PUBLISHED' ? 'Publié' : 'Fermé'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Clock size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Échéance</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {displayExercise.dueDate ? formatDate(displayExercise.dueDate) : 'Non définie'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Users size={18} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Soumissions</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {displayExercise.submissionCount || 0} soumission{(displayExercise.submissionCount || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes importantes */}
        {hasSubmissions && (
          <div className="mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    ⚠️ Attention : Exercice déjà noté
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                    Cet exercice a déjà été soumis par {displayExercise.submissionCount} étudiant{(displayExercise.submissionCount || 0) !== 1 ? 's' : ''}.
                    Les modifications peuvent affecter les notes existantes. Soyez prudent lors des changements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation en temps réel */}
        {validationErrors.length > 0 ? (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">
                  Erreurs de validation ({validationErrors.length})
                </h3>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : hasUnsavedChanges && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-300 mb-1">
                  ✅ Validation réussie
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Toutes les validations sont passées. Vous pouvez sauvegarder vos modifications.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Éditeur d'exercice */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          {/* En-tête de l'éditeur */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl">
                  <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Éditeur d'exercice
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Modifiez le contenu de votre exercice
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Indicateur de points */}
                <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 ${
                  isPointsValid 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {totalPoints}/{displayExercise.maxScore} points
                  </span>
                  {!isPointsValid && (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                </div>

                {/* Indicateur de modifications */}
                {hasUnsavedChanges && (
                  <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                    Modifications non sauvegardées
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contenu de l'éditeur */}
          <div className="p-6">
            {/* Section 1: Informations générales */}
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
                    value={localExercise?.title || ''}
                    onChange={(e) => handleExerciseChange({ title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 transition-colors"
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
                    value={localExercise?.maxScore || 0}
                    onChange={(e) => setLocalExercise(prev => prev ? { ...prev, maxScore: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={localExercise?.description || ''}
                    onChange={(e) => handleExerciseChange({ description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 transition-colors"
                    rows={3}
                    placeholder="Décrivez l'objectif de l'exercice..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date d'échéance (optionnelle)
                    </div>
                  </label>
                  <input
                    type="datetime-local"
                    value={localExercise?.dueDate ? localExercise.dueDate.slice(0, 16) : ''}
                    onChange={(e) => handleExerciseChange({ dueDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Questions */}
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

                {canAddQuestion && (
                  <button
                    onClick={() => addQuestion('TEXT')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Ajouter une question
                  </button>
                )}
              </div>

              {/* Liste des questions */}
              <div className="space-y-6">
                {questions.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl">
                    <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Aucune question
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Commencez par ajouter votre première question
                    </p>
                    <button
                      onClick={() => addQuestion('TEXT')}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                      Ajouter une question
                    </button>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <div 
                      key={question.id || index} 
                      className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                    >
                      {/* En-tête de la question */}
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-full font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {getQuestionTypeLabel(question.type)}
                              </div>
                              {question.text && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                  {question.text}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Points:</span>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={question.points || 1}
                                onChange={(e) => updateQuestion(index, { points: parseInt(e.target.value) || 1 })}
                                className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                              />
                            </div>

                            <button
                              onClick={() => removeQuestion(index)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Supprimer la question"
                            >
                              <Trash2 size={18} />
                            </button>
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
                            value={question.text || ''}
                            onChange={(e) => updateQuestion(index, { text: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 transition-colors"
                            rows={2}
                            placeholder="Posez votre question ici..."
                          />
                        </div>

                        {/* Type de question */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Type de question
                          </label>
                          <select
                            value={question.type}
                            onChange={(e) => updateQuestion(index, { type: e.target.value as QuestionType })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 transition-colors"
                          >
                            <option value="TEXT">Texte libre</option>
                            <option value="MULTIPLE_CHOICE">Choix multiple</option>
                            <option value="CODE">Code</option>
                          </select>
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
                                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                              >
                                + Ajouter une option
                              </button>
                            </div>

                            <div className="space-y-3">
                              {question.options?.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full text-xs font-medium">
                                    {String.fromCharCode(65 + optIndex)}
                                  </div>
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 transition-colors"
                                    placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                  />
                                  <button
                                    onClick={() => removeOption(index, optIndex)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30"
                                    disabled={!question.options || question.options.length <= 2}
                                    title="Supprimer l'option"
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
                                  Réponse correcte (optionnelle)
                                </label>
                                <select
                                  value={question.correctAnswer || ''}
                                  onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
                                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 transition-colors"
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 transition-colors"
                            rows={2}
                            placeholder="Expliquez la réponse ou donnez des indices..."
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bouton pour ajouter une question en bas */}
              {questions.length > 0 && canAddQuestion && (
                <div className="flex justify-center pt-6">
                  <button
                    onClick={() => addQuestion('TEXT')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Plus size={18} />
                    Ajouter une nouvelle question
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <X size={20} />
                  Annuler
                </button>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaveDisabled()}
                className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                  isSaveDisabled()
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notes et informations */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            📋 Notes importantes
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Validation en temps réel</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Les erreurs sont détectées automatiquement. Le bouton d'enregistrement s'active uniquement lorsque toutes les validations sont passées.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Exercices déjà notés</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Si cet exercice a déjà été noté, modifiez les questions avec précaution pour ne pas invalider les scores existants.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Publication automatique</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tous les exercices sont automatiquement publiés. Les modifications prennent effet immédiatement après enregistrement.
                </p>
              </div>
            </div>
          </div>

          {/* Informations techniques */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Créé le:</span> {new Date(displayExercise.createdAt).toLocaleDateString('fr-FR')}
                {displayExercise.updatedAt && displayExercise.updatedAt !== displayExercise.createdAt && (
                  <span className="ml-3">
                    <span className="font-medium">Dernière modification:</span> {new Date(displayExercise.updatedAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ID: {displayExercise.id} • Version: {displayExercise.version || '2.0'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}