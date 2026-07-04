// src/app/(dashboard)/profdashboard/exercises/[courseId]/view/[exerciseId]/page.tsx - VERSION CORRIGÉE
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Download,
  Calendar,
  FileText,
  Users,
  Award,
  Clock,
  BookOpen,
  ChevronRight,
  CheckCircle,
  XCircle,
  BarChart3,
  Copy,
  AlertTriangle,
  Send,
  Printer,
  Share2,
  RefreshCw,
  Loader2
} from 'lucide-react';

import {
  useExercise,
  useDeleteExercise,
  usePublishExercise,
  useCloseExercise,
  useDuplicateExercise
} from '@/hooks/useExercise';
import ExerciseStats from '@/components/exercises/ExerciseStats';
import { Exercise } from '@/types/exercise';

export default function ViewExercisePage() {
  const t = useTranslations('teacherDashboard.exerciseView');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const paramId = params?.courseId ? parseInt(params.courseId as string) : 0; // Represents classId within this flow
  const exerciseId = params?.exerciseId ? parseInt(params.exerciseId as string) : 0;

  // Utilisation des nouveaux hooks
  const {
    data: exerciseApiResponse,
    isLoading: exerciseLoading,
    error,
    refetch
  } = useExercise(exerciseId, {
    enabled: !!user && !!exerciseId,
  });

  const exercise = exerciseApiResponse?.data;

  // Les hooks de mutation attendent l'ID du cours pour l'invalidation du cache (ou utilisent paramId temporairement)
  const realCourseId = exercise?.courseId || paramId;
  const deleteMutation = useDeleteExercise(exerciseId, realCourseId);
  const publishMutation = usePublishExercise(exerciseId, realCourseId);
  const closeMutation = useCloseExercise(exerciseId, realCourseId);
  const duplicateMutation = useDuplicateExercise(exerciseId, realCourseId);

  const [classInfo, setClassInfo] = useState<{
    name: string;
    theme?: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error(t('authRequired'));
      router.push('/login');
      return;
    }

    if (!paramId || !exerciseId) return;

    // Charger les infos de la classe
    loadClassInfo();
  }, [user, router, paramId, exerciseId, t]);

  // Vérification des IDs après TOUS les hooks
  if (!paramId || !exerciseId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {t('invalidParamsTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('invalidParamsDescription')}
          </p>
          <button
            onClick={() => router.push('/profdashboard/exercises')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('backToExercises')}
          </button>
        </div>
      </div>
    );
  }

  const loadClassInfo = async () => {
    try {
      const { ClassesDeCoursService } = await import('@/lib/services/ClassesDeCoursService');
      const response = await ClassesDeCoursService.getClassById(paramId);
      if (response && response.data) {
        setClassInfo({
          name: response.data.name ?? '',
          theme: response.data.theme,
        });
      }
    } catch (error) {
      console.error('Erreur chargement infos classe:', error);
    }
  };

  const handleEdit = () => {
    router.push(`/profdashboard/exercises/${paramId}/update/${exerciseId}`);
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    deleteMutation.mutate({
      onSuccess: (result: any) => {
        if (result.success) {
          toast.success(t('deleteSuccess'));
          router.push(`/profdashboard/exercises/${paramId}`);
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || t('deleteError'));
      }
    });
  };

  const handleViewSubmissions = () => {
    router.push(`/profdashboard/exercises/${paramId}/submissions/${exerciseId}`);
  };

  const handleDuplicate = async () => {
    duplicateMutation.mutate(`${exerciseApiResponse?.data?.title} (${t('copySuffix')})`, {
      onSuccess: (result: any) => {
        if (result.success && result.data) {
          toast.success(t('duplicateSuccess'));
          router.push(`/profdashboard/exercises/${paramId}/view/${result.data.id}`);
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || t('duplicateError'));
      }
    });
  };

  const handlePublish = () => {
    publishMutation.mutate({
      onSuccess: (result: any) => {
        if (result.success) {
          toast.success(t('publishInfo'));
          refetch();
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || t('publishError'));
      }
    });
  };

  const handleClose = () => {
    closeMutation.mutate({
      onSuccess: (result: any) => {
        if (result.success) {
          toast.success(`${t('infoMessagePrefix')} ${result.message}`);
          refetch();
        } else {
          toast.error(`${t('errorPrefix')} ${result.message}`);
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || t('closeError'));
      }
    });
  };

  const handleDownloadSubmissions = () => {
    toast.loading(t('downloadPreparing'));
    setTimeout(() => {
      toast.dismiss();
      toast.success(t('downloadReady'));
    }, 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('notSet');

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return t('invalidDate');
    }
  };

  const getStatusDisplay = (status?: string) => {
    if (!status) return t('statusUnknown');

    switch (status) {
      case 'DRAFT': return t('statusDraft');
      case 'PUBLISHED': return t('statusPublished');
      case 'CLOSED': return t('statusClosed');
      case 'ARCHIVED': return t('statusArchived');
      default: return status;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';

    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'CLOSED':
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (exerciseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loadingExercise')}</p>
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error || !exerciseApiResponse?.success || !exerciseApiResponse.data) {
    const errorMessage = error?.message || exerciseApiResponse?.message || t('notFoundTitle');

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {errorMessage}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('notFoundDescription')}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} />
              {t('retry')}
            </button>
            <button
              onClick={() => router.push(`/profdashboard/exercises/${paramId}`)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t('backToClass')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use the verified extracted exercise
  // at this point exercise is truthy because error would have caught otherwise

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link
              href="/profdashboard"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {t('breadcrumbs.dashboard')}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link
              href="/profdashboard/exercises"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {t('breadcrumbs.exercises')}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link
              href={`/profdashboard/exercises/${paramId}`}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {classInfo?.name || `Classe #${paramId}`}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-800 dark:text-gray-200 font-medium truncate max-w-xs">
              {exercise?.title}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/profdashboard/exercises/${paramId}`)}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={20} />
              {t('backToClassExercises')}
            </button>

            <div className="flex gap-3">

              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Edit size={18} />
                {t('edit')}
              </button>

              <button
                onClick={handleViewSubmissions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Eye size={18} />
                {t('submissions')}
              </button>
            </div>
          </div>
        </div>

        {/* En-tête */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl">
                  <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {exercise?.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exercise?.status)}`}>
                      {getStatusDisplay(exercise?.status)}
                    </span>
                    {classInfo?.theme && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {classInfo.theme}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {t('questionCount', { count: exercise?.questions?.length || 0 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {t('description')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {exercise?.description || t('noDescription')}
                </p>
              </div>

              {/* Métadonnées */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {exercise?.maxScore}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('maxPoints')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {formatDate(exercise?.dueDate)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('dueDate')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {formatDate(exercise?.createdAt)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('createdOn')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {exercise?.submissionCount || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('submissions')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques - CORRECTION ICI */}
              {(exercise?.submissionCount || 0) > 0 && (
                <div className="mt-8">
                  <ExerciseStats exerciseId={exercise?.id || 0} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {t('questionsTitle', { count: exercise?.questions?.length || 0 })}
            </h2>

            {(exercise?.questions?.length || 0) === 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
                <AlertTriangle size={16} />
                <span className="text-sm">{t('noQuestion')}</span>
              </div>
            )}
          </div>

          {(exercise?.questions?.length || 0) > 0 ? (
            <div className="space-y-4">
              {(exercise?.questions || []).map((question, index) => {
                // CORRECTION ICI : Utilisez seulement les propriétés officielles
                const questionText = question.text; // Pas de fallback avec question.question
                const questionType = question.type || 'TEXT'; // Pas de fallback avec question.questionType
                const questionPoints = question.points || 0;
                const questionOptions = question.options || [];
                const correctAnswer = question.correctAnswer;

                return (
                  <div key={question.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                            {questionText}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                              {questionType === 'TEXT' ? t('typeText') :
                                questionType === 'MULTIPLE_CHOICE' ? t('typeMultipleChoice') : t('typeCode')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium">
                        {questionPoints} pts
                      </span>
                    </div>

                    <div className="ml-11">
                      {/* Options pour les questions à choix multiple */}
                      {questionType === 'MULTIPLE_CHOICE' && questionOptions.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('optionsLabel')}</span>
                          <ul className="mt-2 space-y-2">
                            {questionOptions.filter(opt => opt && opt.trim()).map((option, optIndex) => (
                              <li
                                key={optIndex}
                                className={`flex items-center gap-2 text-sm p-2 rounded ${option === correctAnswer
                                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                  : 'bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                                  }`}
                              >
                                {option === correctAnswer ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" />
                                )}
                                <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                                <span>{option}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Réponse correcte pour les autres types */}
                      {correctAnswer && questionType !== 'MULTIPLE_CHOICE' && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                          <span className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                            <CheckCircle size={16} />
                            {t('correctAnswer')}
                          </span>
                          <p className="text-sm text-green-600 dark:text-green-300 mt-1 whitespace-pre-wrap">
                            {correctAnswer}
                          </p>
                        </div>
                      )}

                      {!correctAnswer && questionType !== 'MULTIPLE_CHOICE' && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded border border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('manualCorrection')}
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                            {t('manualCorrectionHelp')}
                          </p>
                        </div>
                      )}

                      {/* Explication */}
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                            {t('explanation')}
                          </span>
                          <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('noQuestionFound')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                {t('noQuestionDescription')}
              </p>
              <button
                onClick={handleEdit}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Edit size={18} className="inline mr-2" />
                {t('addQuestions')}
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {t('actionsTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={handleEdit}
              className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
            >
              <Edit className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-800 dark:text-gray-200">{t('edit')}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {t('editHelp')}
              </span>
            </button>

            <button
              onClick={handleViewSubmissions}
              className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
            >
              <Eye className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-800 dark:text-gray-200">{t('submissions')}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {t('submissionsHelp')}
              </span>
            </button>

            <button
              onClick={handleDuplicate}
              disabled={duplicateMutation.isPending}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors group disabled:opacity-50"
            >
              <Copy className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-800 dark:text-gray-200">{t('duplicate')}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {duplicateMutation.isPending ? t('duplicating') : t('createCopy')}
              </span>
            </button>


          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Printer size={18} />
                {t('print')}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success(t('linkCopied'));
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Share2 size={18} />
                {t('share')}
              </button>
            </div>

            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 size={18} />
              {deleteMutation.isPending ? t('deleting') : t('deleteExercise')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
