// src/app/(dashboard)/profdashboard/exercises/[courseId]/edit/[exerciseId]/page.tsx - VERSION CORRIGÉE
"use client";

import React, { useEffect, useState } from "react";
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
  Hash,
  Calendar,
  Send,
  Target,
  Edit
} from 'lucide-react';

// Import des hooks et services corrigés
import { useExercise, useUpdateExercise } from '@/hooks/useExercise';
import { Exercise, Question, QuestionType, ApiResponse } from '@/types/exercise';
import { ExerciseService } from '@/lib3/services/ExerciseService';

export default function UpdateExercisePage() {
  const params = useParams();
  const router = useRouter();
  
  const courseId = parseInt(params.courseId as string);
  const exerciseId = parseInt(params.exerciseId as string);
  
  // Utilisation du hook useExercise pour récupérer l'exercice
  const { 
    data: exerciseApiResponse, 
    isLoading, 
    error,
    refetch 
  } = useExercise(exerciseId, {
    enabled: !!exerciseId,
  });
  
  // Utilisation du hook useUpdateExercise pour la mise à jour
  const { 
    mutate: updateExercise,
    isPending: isUpdating,
    error: updateError
  } = useUpdateExercise(exerciseId, courseId);
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [courseInfo, setCourseInfo] = useState<{
    title: string;
    category?: string;
  } | null>(null);

  useEffect(() => {
    if (exerciseApiResponse?.success && exerciseApiResponse.data) {
      const exerciseData = exerciseApiResponse.data;
      setExercise(exerciseData);
      setQuestions(exerciseData.questions || []);
    }
  }, [exerciseApiResponse]);

  useEffect(() => {
    // Charger les infos du cours
    loadCourseInfo();
  }, [courseId]);

  const loadCourseInfo = async () => {
    try {
      // TODO: Remplacer par votre service de cours
      setCourseInfo({
        title: `Cours #${courseId}`,
        category: 'Informatique',
      });
    } catch (error) {
      console.error('Erreur chargement infos cours:', error);
    }
  };

  // Validation de l'exercice
  const validateExercise = (): boolean => {
    const errors: string[] = [];

    if (!exercise?.title?.trim()) {
      errors.push('Le titre est requis');
    }

    if (questions.length === 0) {
      errors.push('Ajoutez au moins une question');
    } else {
      questions.forEach((q, index) => {
        const questionText = q.text || q.question || '';
        if (!questionText.trim()) {
          errors.push(`La question ${index + 1} est vide`);
        }

        if (!q.points || q.points <= 0) {
          errors.push(`La question ${index + 1} doit avoir des points positifs`);
        }

        const questionType = q.type || q.questionType;
        if (questionType === 'MULTIPLE_CHOICE') {
          if (!q.options || q.options.length < 2) {
            errors.push(`La question ${index + 1} (choix multiple) doit avoir au moins 2 options`);
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
    if (exercise && totalPoints > exercise.maxScore) {
      errors.push(`Total des points (${totalPoints}) dépasse le score maximum (${exercise.maxScore})`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Dans votre page edit/page.tsx, utilisez :
const handleSave = async () => {
  if (!exercise) return;
  
  if (!validateExercise()) {
    toast.error('Veuillez corriger les erreurs avant de sauvegarder');
    return;
  }

  try {
    console.log('=== SAVE WITH DIRECT METHOD ===');
    
    const result = await ExerciseService.updateExerciseDirectWithCourse(
      exerciseId,
      courseId,
      {
        title: exercise.title,
        description: exercise.description,
        maxScore: exercise.maxScore,
        dueDate: exercise.dueDate,
        questions: questions
      }
    );
    
    console.log('Save result:', result);
    
    if (result.success) {
      // CORRECTION : Utiliser un message par défaut si result.message est undefined
      toast.success(result.message || '✅ Exercice mis à jour avec succès');
      setTimeout(() => {
        router.push(`/profdashboard/exercises/${courseId}/view/${exerciseId}`);
      }, 1000);
    } else {
      // CORRECTION : Utiliser un message par défaut
      toast.error(result.message || '❌ Erreur lors de la mise à jour');
    }
    
  } catch (error: any) {
    console.error('Save error:', error);
    toast.error(`❌ Erreur: ${error.message || 'Erreur inconnue'}`);
  }
};
  const handleCancel = () => {
    if (confirm('Voulez-vous vraiment annuler les modifications ? Les changements non enregistrés seront perdus.')) {
      router.push(`/profdashboard/exercises/${courseId}/view/${exerciseId}`);
    }
  };

  const handlePreview = () => {
    window.open(`/profdashboard/exercises/${courseId}/preview/${exerciseId}`, '_blank');
  };

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

  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + q.points, 0);
  };

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

  if (error || !exerciseApiResponse?.success || !exerciseApiResponse.data) {
    const errorMessage = error?.message || exerciseApiResponse?.message || 'Exercice non trouvé';
    
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
              onClick={() => refetch()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
  
              Réessayer
            </button>
            <button
              onClick={() => router.push(`/profdashboard/exercises/${courseId}`)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            > 
            <ArrowLeft size={18} />
              Retour aux exercices
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!exercise) return null;

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
              {exercise.title}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Édition
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push(`/profdashboard/exercises/${courseId}/view/${exerciseId}`)}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Retour à l'exercice
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-blue-200 text-blue-600 rounded-lg hover:bg-blue-300 transition-colors flex items-center gap-2"
              >
                <Eye size={18} className="text-blue-600 dark:text-blue-400" />
                Aperçu étudiant
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

        {/* Bannière d'information */}
        <div className="mb-8">
          {/*text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30*/}
         <div className="border border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 rounded-xl">
          <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-1 text-gray-800 dark:text-gray-100">
            Modifier l'exercice
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {exercise.title}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              exercise.status === 'PUBLISHED' 
                ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
                : exercise.status === 'DRAFT'
                ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {exercise.status === 'PUBLISHED' ? 'Publié' :
                exercise.status === 'DRAFT' ? 'Brouillon' :
                'Fermé'}
            </div>
            {courseInfo?.category && (
              <div className="px-3 py-1 bg-purple-50 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 rounded-full text-sm text-purple-700 dark:text-purple-300">
                <BookOpen size={14} className="inline mr-1 text-purple-600 dark:text-purple-400" />
                {courseInfo.category}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors">
          <div className="p-1.5 bg-purple-50 dark:bg-purple-900/50 rounded-lg border border-purple-200 dark:border-purple-700">
            <Shield size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Statut préservé</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              L'exercice reste {exercise.status === 'PUBLISHED' ? 'publié' : 'en brouillon'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors">
          <div className="p-1.5 bg-purple-50 dark:bg-purple-900/50 rounded-lg border border-purple-200 dark:border-purple-700">
            <Clock size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Échéance</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {exercise.dueDate ? 'Date limite définie' : 'Pas de date limite'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors">
          <div className="p-1.5 bg-purple-50 dark:bg-purple-900/50 rounded-lg border border-purple-200 dark:border-purple-700">
            <Users size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Soumissions</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {exercise.submissionCount || 0} soumission{exercise.submissionCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
        </div>

        {/* Alertes importantes */}
        {exercise.status === 'PUBLISHED' && (exercise.submissionCount || 0) > 0 && (
          <div className="mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    Attention : Exercice déjà publié et noté
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                    Cet exercice a déjà été soumis par {exercise.submissionCount} étudiant{exercise.submissionCount !== 1 ? 's' : ''}. 
                    Les modifications peuvent affecter les notes existantes. Soyez prudent lors des changements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Éditeur d'exercice */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl">
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

          <div className="p-6">
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
                    onChange={(e) => setExercise({ ...exercise, title: e.target.value })}
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
                    onChange={(e) => setExercise({ ...exercise, maxScore: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={exercise.description || ''}
                    onChange={(e) => setExercise({ ...exercise, description: e.target.value })}
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
                    onChange={(e) => setExercise({ ...exercise, dueDate: e.target.value })}
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
                   className="px-6 py-3 bg-gradient-to-r from-purple-600 to-emerald-600 text-white rounded-xl hover:from-purple-700 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                    <Plus size={18} />
                    Ajouter une question
                  </button>
                </div>
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
                            value={question.text || question.question || ''}
                            onChange={(e) => updateQuestion(index, { 
                              text: e.target.value,
                              question: e.target.value 
                            })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
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
                            value={question.type || question.questionType || 'TEXT'}
                            onChange={(e) => updateQuestion(index, { 
                              type: e.target.value as QuestionType,
                              questionType: e.target.value as QuestionType 
                            })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                          >
                            <option value="TEXT">Texte libre</option>
                            <option value="MULTIPLE_CHOICE">Choix multiple</option>
                            <option value="CODE">Code</option>
                          </select>
                        </div>
                        
                        {/* Options pour choix multiple */}
                        {(question.type === 'MULTIPLE_CHOICE' || question.questionType === 'MULTIPLE_CHOICE') && (
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
                          </div>
                        )}
                        
                        {/* Réponse correcte pour choix multiple */}
                        {(question.type === 'MULTIPLE_CHOICE' || question.questionType === 'MULTIPLE_CHOICE') && question.options && question.options.length > 0 && (
                          <div className="mb-4">
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

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <X size={20} />
                Annuler
              </button>
              
              <button
                onClick={handleSave}
                disabled={isUpdating || validationErrors.length > 0}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save size={20} />
                {isUpdating ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>

        {/* Notes importantes */}
        <div className="bg-gradient-to-r from-purple-50 to-white dark:from-purple-950/50 dark:to-gray-900/50 rounded-2xl p-6 border border-purple-200 dark:border-purple-800 mb-12 shadow-sm">
  <div className="flex items-center gap-2 mb-4">
    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
      <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
      Notes importantes
    </h3>
  </div>
  
  <div className="space-y-4">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg mt-1 flex-shrink-0">
        <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h4 className="font-medium text-gray-700 dark:text-gray-300">Modifications des questions</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Si vous modifiez des questions déjà notées, les scores existants pourraient devenir invalides.
          Envisagez de créer une nouvelle version de l'exercice si de nombreuses modifications sont nécessaires.
        </p>
      </div>
    </div>
    
    <div className="flex items-start gap-3">
      <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg mt-1 flex-shrink-0">
        <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h4 className="font-medium text-gray-700 dark:text-gray-300">Score maximum</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Le total des points des questions ne doit pas dépasser le score maximum de l'exercice.
          L'éditeur vous alertera en cas d'incohérence.
        </p>
      </div>
    </div>
    
    <div className="flex items-start gap-3">
      <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg mt-1 flex-shrink-0">
        <Send className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      </div>
      <div>
        <h4 className="font-medium text-gray-700 dark:text-gray-300">Publication automatique</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tous les exercices sont automatiquement publiés. 
          Le statut 'PUBLISHED' est appliqué par défaut.
        </p>
      </div>
    </div>
  </div>
  
  <div className="mt-6 pt-6 border-t border-purple-100 dark:border-purple-800">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="text-sm text-purple-600 dark:text-purple-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>
            Créé le {new Date(exercise.createdAt).toLocaleDateString('fr-FR')}
            {exercise.updatedAt && exercise.updatedAt !== exercise.createdAt && (
              <> • Modifié le {new Date(exercise.updatedAt).toLocaleDateString('fr-FR')}</>
            )}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300 font-medium px-3 py-2 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
        <Hash className="w-4 h-4" />
        <span>ID: {exercise.id}</span>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  );
}