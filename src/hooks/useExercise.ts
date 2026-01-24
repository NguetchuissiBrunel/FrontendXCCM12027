// src/hooks/useExercise.ts - VERSION UNIFIÉE
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ExerciseService } from '@/lib3/services/ExerciseService';
import { Exercise, Submission, ApiResponse, CreateExerciseDto, UpdateExerciseDto } from '@/types/exercise';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

// ============ TYPES D'OPTIONS ============

interface UseExerciseOptions {
  enabled?: boolean;
  refetchInterval?: number;
  autoRefetch?: boolean;
}

interface MutationOptions<T = any> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

interface UseExerciseResult {
  // Données
  exercise: Exercise | null;
  data: ApiResponse<Exercise> | null;

  // État
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Actions
  refetch: () => Promise<void>;
  update: (data: UpdateExerciseDto) => Promise<ApiResponse<Exercise>>;
  delete: () => Promise<boolean>;
  publish: () => Promise<ApiResponse<Exercise>>;
  close: () => Promise<ApiResponse<Exercise>>;
  archive: () => Promise<ApiResponse<Exercise>>;
  duplicate: (targetCourseId: number, newTitle?: string) => Promise<ApiResponse<Exercise>>;

  // Métadonnées
  isUpdating: boolean;
  isDeleting: boolean;
  isPublishing: boolean;
}

interface UseExerciseSubmissionsResult {
  // Données
  submissions: Submission[];
  data: ApiResponse<Submission[]> | null;

  // État
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Actions
  refetch: () => Promise<void>;
  grade: (submissionId: number, score: number, feedback?: string) => Promise<ApiResponse<Submission>>;

  // Métadonnées
  isGrading: boolean;
}

interface UseExerciseStatsResult {
  // Données
  stats: any | null;

  // État
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Actions
  refetch: () => Promise<void>;
}

interface UseSubmissionPermissionResult {
  // Données
  canSubmit: boolean;
  reason?: string;
  exercise?: Exercise;

  // État
  isLoading: boolean;

  // Actions
  check: () => Promise<void>;
}

// ============ HOOKS PRINCIPAUX ============

/**
 * Hook principal pour la gestion d'un exercice
 */
export const useExercise = (
  exerciseId?: number,
  options: UseExerciseOptions = {}
): UseExerciseResult => {
  const { enabled = true, refetchInterval, autoRefetch = true } = options;
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [data, setData] = useState<ApiResponse<Exercise> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  const fetchExercise = useCallback(async () => {
    if (!enabled || !exerciseId || authLoading) {
      if (!authLoading) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const exerciseData = await ExerciseService.getExerciseDetails(exerciseId);

      if (exerciseData) {
        setExercise(exerciseData);
        setData({
          success: true,
          data: exerciseData,
          message: 'Exercice récupéré avec succès',
          timestamp: new Date().toISOString()
        });
      } else {
        setExercise(null);
        setIsError(true);
        setError(new Error('Exercice non trouvé'));
        setData({
          success: false,
          message: 'Exercice non trouvé',
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la récupération');
      setError(error);
      setIsError(true);
      setExercise(null);
      setData({
        success: false,
        message: error.message,
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId, enabled]);

  // Refetch automatisé
  useEffect(() => {
    if (autoRefetch && exerciseId && !authLoading) {
      fetchExercise();
    }

    let intervalId: NodeJS.Timeout | null = null;
    if (refetchInterval && refetchInterval > 0) {
      intervalId = setInterval(fetchExercise, refetchInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchExercise, refetchInterval, autoRefetch, exerciseId]);

  // Mettre à jour l'exercice
  const update = useCallback(async (
    updateData: UpdateExerciseDto,
    mutationOptions: MutationOptions<Exercise> = {}
  ): Promise<ApiResponse<Exercise>> => {
    if (!exerciseId) {
      throw new Error('ID d\'exercice requis');
    }

    setIsUpdating(true);

    try {
      const result = await ExerciseService.updateExercise(exerciseId, updateData);

      if (result.success && result.data) {
        setExercise(result.data);
        setData(result);
        toast.success(result.message || '✅ Exercice mis à jour avec succès');
        mutationOptions.onSuccess?.(result.data);
      } else {
        toast.error(result.message || '❌ Erreur lors de la mise à jour');
        mutationOptions.onError?.(new Error(result.message || 'Erreur inconnue'));
      }

      mutationOptions.onSettled?.();
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la mise à jour');
      setError(error);
      toast.error(error.message);
      mutationOptions.onError?.(error);

      const errorResult: ApiResponse<Exercise> = {
        success: false,
        message: error.message,
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };

      mutationOptions.onSettled?.();
      return errorResult;

    } finally {
      setIsUpdating(false);
    }
  }, [exerciseId]);

  // Supprimer l'exercice
  const deleteExercise = useCallback(async (
    mutationOptions: MutationOptions = {}
  ): Promise<boolean> => {
    if (!exerciseId) {
      throw new Error('ID d\'exercice requis');
    }

    setIsDeleting(true);

    try {
      const success = await ExerciseService.deleteExercise(exerciseId);

      if (success) {
        setExercise(null);
        setData(null);
        toast.success('✅ Exercice supprimé avec succès');
        mutationOptions.onSuccess?.(success);
      } else {
        toast.error('❌ Erreur lors de la suppression');
        mutationOptions.onError?.(new Error('Erreur lors de la suppression'));
      }

      mutationOptions.onSettled?.();
      return success;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression');
      setError(error);
      toast.error(error.message);
      mutationOptions.onError?.(error);
      mutationOptions.onSettled?.();
      return false;

    } finally {
      setIsDeleting(false);
    }
  }, [exerciseId]);



  // Publier l'exercice
  const publish = useCallback(async (
    mutationOptions: MutationOptions<Exercise> = {}
  ): Promise<ApiResponse<Exercise>> => {
    if (!exerciseId) {
      throw new Error('ID d\'exercice requis');
    }

    setIsPublishing(true);

    try {
      const result = await ExerciseService.publishExercise(exerciseId);

      if (result.success && result.data) {
        setExercise(result.data);
        setData(result);
        toast.success(result.message || '✅ Exercice publié avec succès');
        mutationOptions.onSuccess?.(result.data);
      } else {
        toast.error(result.message || '❌ Erreur lors de la publication');
        mutationOptions.onError?.(new Error(result.message || 'Erreur inconnue'));
      }

      mutationOptions.onSettled?.();
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la publication');
      setError(error);
      toast.error(error.message);
      mutationOptions.onError?.(error);

      const errorResult: ApiResponse<Exercise> = {
        success: false,
        message: error.message,
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };

      mutationOptions.onSettled?.();
      return errorResult;

    } finally {
      setIsPublishing(false);
    }
  }, [exerciseId]);

  // Fermer l'exercice
  const close = useCallback(async (
    mutationOptions: MutationOptions<Exercise> = {}
  ): Promise<ApiResponse<Exercise>> => {
    if (!exerciseId) {
      throw new Error('ID d\'exercice requis');
    }

    setIsPublishing(true);

    try {
      const result = await ExerciseService.closeExercise(exerciseId);

      if (result.success && result.data) {
        setExercise(result.data);
        setData(result);
        toast.success(result.message || '✅ Exercice fermé avec succès');
        mutationOptions.onSuccess?.(result.data);
      } else {
        toast.error(result.message || '❌ Erreur lors de la fermeture');
        mutationOptions.onError?.(new Error(result.message || 'Erreur inconnue'));
      }

      mutationOptions.onSettled?.();
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la fermeture');
      setError(error);
      toast.error(error.message);
      mutationOptions.onError?.(error);

      const errorResult: ApiResponse<Exercise> = {
        success: false,
        message: error.message,
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };

      mutationOptions.onSettled?.();
      return errorResult;

    } finally {
      setIsPublishing(false);
    }
  }, [exerciseId]);

  // Archiver l'exercice
  const archive = useCallback(async (
    mutationOptions: MutationOptions<Exercise> = {}
  ): Promise<ApiResponse<Exercise>> => {
    if (!exerciseId) {
      throw new Error('ID d\'exercice requis');
    }

    setIsPublishing(true);

    try {
      const result = await ExerciseService.archiveExercise(exerciseId);

      if (result.success && result.data) {
        setExercise(result.data);
        setData(result);
        toast.success(result.message || '✅ Exercice archivé avec succès');
        mutationOptions.onSuccess?.(result.data);
      } else {
        toast.error(result.message || '❌ Erreur lors de l\'archivage');
        mutationOptions.onError?.(new Error(result.message || 'Erreur inconnue'));
      }

      mutationOptions.onSettled?.();
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de l\'archivage');
      setError(error);
      toast.error(error.message);
      mutationOptions.onError?.(error);

      const errorResult: ApiResponse<Exercise> = {
        success: false,
        message: error.message,
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };

      mutationOptions.onSettled?.();
      return errorResult;

    } finally {
      setIsPublishing(false);
    }
  }, [exerciseId]);

  // Dupliquer l'exercice
  const duplicate = useCallback(async (
    targetCourseId: number,
    newTitle?: string,
    mutationOptions: MutationOptions<Exercise> = {}
  ): Promise<ApiResponse<Exercise>> => {
    if (!exerciseId) {
      throw new Error('ID d\'exercice source requis');
    }

    setIsUpdating(true);

    try {
      const result = await ExerciseService.duplicateExercise(
        exerciseId,
        targetCourseId,
        newTitle
      );

      if (result.success && result.data) {
        toast.success(result.message || '✅ Exercice dupliqué avec succès');
        mutationOptions.onSuccess?.(result.data);
      } else {
        toast.error(result.message || '❌ Erreur lors de la duplication');
        mutationOptions.onError?.(new Error(result.message || 'Erreur inconnue'));
      }

      mutationOptions.onSettled?.();
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la duplication');
      setError(error);
      toast.error(error.message);
      mutationOptions.onError?.(error);

      const errorResult: ApiResponse<Exercise> = {
        success: false,
        message: error.message,
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };

      mutationOptions.onSettled?.();
      return errorResult;

    } finally {
      setIsUpdating(false);
    }
  }, [exerciseId]);

  // Valeur retournée
  const result = useMemo(() => ({
    // Données
    exercise,
    data,

    // État
    isLoading,
    isError,
    error,

    // Actions
    refetch: fetchExercise,
    update,
    delete: deleteExercise,
    publish,
    close,
    archive,
    duplicate,

    // Métadonnées
    isUpdating,
    isDeleting,
    isPublishing
  }), [
    exercise,
    data,
    isLoading,
    isError,
    error,
    fetchExercise,
    update,
    deleteExercise,
    publish,
    close,
    archive,
    duplicate,
    isUpdating,
    isDeleting,
    isPublishing
  ]);

  return result;
};

/**
 * Hook pour créer un exercice
 */
export const useCreateExercise = () => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ApiResponse<Exercise> | null>(null);

  const mutate = useCallback(async (
    courseId: number,
    createData: CreateExerciseDto,
    options: MutationOptions<Exercise> = {}
  ): Promise<ApiResponse<Exercise>> => {
    setIsPending(true);
    setError(null);

    try {
      const result = await ExerciseService.createExercise(courseId, createData);
      setData(result);

      if (result.success && result.data) {
        toast.success(result.message || '✅ Exercice créé avec succès');
        options.onSuccess?.(result.data);
      } else {
        toast.error(result.message || '❌ Erreur lors de la création');
        options.onError?.(new Error(result.message || 'Erreur inconnue'));
      }

      options.onSettled?.();
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la création');
      setError(error);
      toast.error(error.message);
      options.onError?.(error);

      const errorResult: ApiResponse<Exercise> = {
        success: false,
        message: error.message,
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };

      options.onSettled?.();
      return errorResult;

    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    mutate,
    isPending,
    error,
    data
  };
};

/**
 * Hook pour récupérer les soumissions d'un exercice
 */
export const useExerciseSubmissions = (
  exerciseId?: number,
  options: UseExerciseOptions = {}
): UseExerciseSubmissionsResult => {
  const { enabled = true, autoRefetch = true } = options;
  const { loading: authLoading } = useAuth();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [data, setData] = useState<ApiResponse<Submission[]> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isGrading, setIsGrading] = useState<boolean>(false);

  const fetchSubmissions = useCallback(async () => {
    if (!enabled || !exerciseId || authLoading) {
      if (!authLoading) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const submissionsData = await ExerciseService.getExerciseSubmissions(exerciseId);

      setSubmissions(submissionsData);
      setData({
        success: true,
        data: submissionsData,
        message: 'Soumissions récupérées avec succès',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la récupération des soumissions');
      setError(error);
      setIsError(true);
      setSubmissions([]);
      setData({
        success: false,
        message: error.message,
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId, enabled]);

  // Refetch automatisé
  useEffect(() => {
    if (autoRefetch && exerciseId && !authLoading) {
      fetchSubmissions();
    }
  }, [fetchSubmissions, autoRefetch, exerciseId, authLoading]);

  // Noter une soumission
  const grade = useCallback(async (
    submissionId: number,
    score: number,
    feedback?: string,
    mutationOptions: MutationOptions<Submission> = {}
  ): Promise<ApiResponse<Submission>> => {
    setIsGrading(true);

    try {
      const result = await ExerciseService.gradeSubmission(submissionId, { score, feedback });

      if (result.success && result.data) {
        // Mettre à jour la soumission dans la liste
        setSubmissions(prev => prev.map(sub =>
          sub.id === submissionId ? { ...sub, ...result.data } : sub
        ));

        toast.success(result.message || '✅ Soumission notée avec succès');
        mutationOptions.onSuccess?.(result.data);
      } else {
        toast.error(result.message || '❌ Erreur lors de la notation');
        mutationOptions.onError?.(new Error(result.message || 'Erreur inconnue'));
      }

      mutationOptions.onSettled?.();
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la notation');
      setError(error);
      toast.error(error.message);
      mutationOptions.onError?.(error);

      const errorResult: ApiResponse<Submission> = {
        success: false,
        message: error.message,
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };

      mutationOptions.onSettled?.();
      return errorResult;

    } finally {
      setIsGrading(false);
    }
  }, []);

  return {
    // Données
    submissions,
    data,

    // État
    isLoading,
    isError,
    error,

    // Actions
    refetch: fetchSubmissions,
    grade,

    // Métadonnées
    isGrading
  };
};

/**
 * Hook pour les statistiques d'un exercice
 */
export const useExerciseStats = (
  exerciseId?: number,
  options: UseExerciseOptions = {}
): UseExerciseStatsResult => {
  const { enabled = true, autoRefetch = true } = options;
  const { loading: authLoading } = useAuth();

  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!enabled || !exerciseId || authLoading) {
      if (!authLoading) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const statsData = await ExerciseService.getExerciseStats(exerciseId);
      setStats(statsData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la récupération des statistiques');
      setError(error);
      setIsError(true);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId, enabled]);

  // Refetch automatisé
  useEffect(() => {
    if (autoRefetch && exerciseId && !authLoading) {
      fetchStats();
    }
  }, [fetchStats, autoRefetch, exerciseId, authLoading]);

  return {
    // Données
    stats,

    // État
    isLoading,
    isError,
    error,

    // Actions
    refetch: fetchStats
  };
};

// Dans useExercise.ts, ajoutez ce hook :

/**
 * Hook pour récupérer les détails d'une soumission spécifique
 */
export const useSubmissionDetails = (
  submissionId?: number,
  options: UseExerciseOptions = {}
) => {
  const { enabled = true, autoRefetch = true } = options;
  const { loading: authLoading } = useAuth();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubmissionDetails = useCallback(async () => {
    if (!enabled || !submissionId || authLoading) {
      if (!authLoading) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Option 1: Si ExerciseApiWrapper.getSubmissionDetails existe
      // const details = await ExerciseApiWrapper.getSubmissionDetails(submissionId);

      // Option 2: Filtrer depuis les soumissions de l'étudiant
      const { ExerciseService } = await import('@/lib3/services/ExerciseService');
      const mySubmissions = await ExerciseService.getMySubmissions();
      const foundSubmission = mySubmissions.find(s => s.id === submissionId);

      if (foundSubmission) {
        // Si besoin de plus de détails, on pourrait récupérer l'exercice associé
        const exercise = await ExerciseService.getExerciseDetails(foundSubmission.exerciseId);

        setSubmission({
          ...foundSubmission,
          exerciseTitle: exercise?.title || 'Exercice'
        });
      } else {
        throw new Error('Soumission non trouvée');
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la récupération de la soumission');
      setError(error);
      setSubmission(null);
    } finally {
      setIsLoading(false);
    }
  }, [submissionId, enabled]);

  // Refetch automatisé
  useEffect(() => {
    if (autoRefetch && submissionId && !authLoading) {
      fetchSubmissionDetails();
    }
  }, [fetchSubmissionDetails, autoRefetch, submissionId, authLoading]);

  return {
    submission,
    isLoading,
    error,
    refetch: fetchSubmissionDetails
  };
};

/**
 * Hook pour vérifier les permissions de soumission
 */
export const useSubmissionPermission = (
  exerciseId?: number
): UseSubmissionPermissionResult => {
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [reason, setReason] = useState<string>();
  const [exercise, setExercise] = useState<Exercise>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkPermission = useCallback(async () => {
    if (!exerciseId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const permission = await ExerciseService.checkSubmissionPermission(exerciseId);
      setCanSubmit(permission.canSubmit);
      setReason(permission.reason);
      setExercise(permission.exercise);
    } catch (error) {
      setCanSubmit(false);
      setReason('Erreur de vérification');
      setExercise(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    if (exerciseId) {
      checkPermission();
    }
  }, [exerciseId, checkPermission]);

  return {
    // Données
    canSubmit,
    reason,
    exercise,

    // État
    isLoading,

    // Actions
    check: checkPermission
  };
};

/**
 * Hook pour soumettre un exercice (étudiant)
 */
export const useSubmitExercise = () => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ApiResponse<Submission> | null>(null);

  const mutate = useCallback(async (
    exerciseId: number,
    answers: Array<{ questionId: number; answer: string }>,
    submissionUrl?: string,
    options: MutationOptions<Submission> = {}
  ): Promise<ApiResponse<Submission>> => {
    setIsPending(true);
    setError(null);

    try {
      const result = await ExerciseService.submitExercise(exerciseId, {
        submissionUrl,
        answers
      });

      setData(result);

      if (result.success && result.data) {
        toast.success(result.message || '✅ Exercice soumis avec succès');
        options.onSuccess?.(result.data);
      } else {
        toast.error(result.message || '❌ Erreur lors de la soumission');
        options.onError?.(new Error(result.message || 'Erreur inconnue'));
      }

      options.onSettled?.();
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la soumission');
      setError(error);
      toast.error(error.message);
      options.onError?.(error);

      const errorResult: ApiResponse<Submission> = {
        success: false,
        message: error.message,
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };

      options.onSettled?.();
      return errorResult;

    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    mutate,
    isPending,
    error,
    data
  };
};

/**
 * Hook pour récupérer les soumissions de l'étudiant connecté
 */
export const useMySubmissions = (
  options: UseExerciseOptions = {}
) => {
  const { enabled = true, autoRefetch = true } = options;
  const { loading: authLoading } = useAuth();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMySubmissions = useCallback(async () => {
    if (!enabled || authLoading) {
      if (!authLoading) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const mySubmissions = await ExerciseService.getMySubmissions();
      setSubmissions(mySubmissions);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la récupération des soumissions');
      setError(error);
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (autoRefetch && !authLoading) {
      fetchMySubmissions();
    }
  }, [fetchMySubmissions, autoRefetch, authLoading]);

  return {
    submissions,
    isLoading,
    error,
    refetch: fetchMySubmissions
  };
};

// Dans useExercise.ts, ajoutez :

/**
 * Hook dédié pour noter une soumission
 */
export const useGradeSubmission = () => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ApiResponse<Submission> | null>(null);

  const mutate = useCallback(async (
    submissionId: number,
    score: number,
    feedback?: string,
    options: MutationOptions<Submission> = {}
  ): Promise<ApiResponse<Submission>> => {
    setIsPending(true);
    setError(null);

    try {
      const result = await ExerciseService.gradeSubmission(submissionId, {
        score,
        feedback
      });

      setData(result);

      if (result.success && result.data) {
        toast.success(result.message || '✅ Soumission notée avec succès');
        options.onSuccess?.(result.data);
      } else {
        toast.error(result.message || '❌ Erreur lors de la notation');
        options.onError?.(new Error(result.message || 'Erreur inconnue'));
      }

      options.onSettled?.();
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la notation');
      setError(error);
      toast.error(error.message);
      options.onError?.(error);

      const errorResult: ApiResponse<Submission> = {
        success: false,
        message: error.message,
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      };

      options.onSettled?.();
      return errorResult;

    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    mutate,
    isPending,
    error,
    data
  };
};

/**
 * Hook pour supprimer un exercice
 */
export const useDeleteExercise = (
  exerciseId: number,
  courseId: number
) => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (
    options: MutationOptions = {}
  ) => {
    setIsPending(true);
    setError(null);

    try {
      const success = await ExerciseService.deleteExercise(exerciseId);

      if (success) {
        toast.success('✅ Exercice supprimé avec succès');
        options.onSuccess?.(success);
      } else {
        toast.error('❌ Erreur lors de la suppression');
        options.onError?.(new Error('Erreur lors de la suppression'));
      }

      return { success };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression');
      setError(error);
      toast.error(error.message);
      options.onError?.(error);
      return {
        success: false,
        error: error.message,
        message: error.message
      };
    } finally {
      setIsPending(false);
    }
  }, [exerciseId]);

  return {
    mutate,
    isPending,
    error
  };
};

export const useUpdateExercise = (
  exerciseId: number,
  courseId: number
) => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ApiResponse<Exercise> | null>(null);

  const mutate = useCallback(async (
    updateData: {
      title?: string;
      description?: string;
      maxScore?: number;
      dueDate?: string;
      questions?: any[];
    },
    options: MutationOptions = {}
  ) => {
    setIsPending(true);
    setError(null);

    try {
      const result = await ExerciseService.updateExercise(exerciseId, updateData);
      setData(result);

      if (result.success) {
        toast.success(result.message || '✅ Exercice mis à jour avec succès');
        options.onSuccess?.(result.data);
      } else {
        toast.error(result.message || '❌ Erreur lors de la mise à jour');
        options.onError?.(new Error(result.message || 'Erreur inconnue'));
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la mise à jour');
      setError(error);
      toast.error(error.message);
      options.onError?.(error);
      return {
        success: false,
        message: error.message,
        errors: { general: [error.message] },
        timestamp: new Date().toISOString()
      } as ApiResponse<Exercise>;
    } finally {
      setIsPending(false);
    }
  }, [exerciseId]);

  return {
    mutate,
    isPending,
    error,
    data
  };
};

/**
 * Hook pour "publier" un exercice (visuel seulement - tous sont déjà publiés)
 */
export const usePublishExercise = (
  exerciseId: number,
  courseId: number
) => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (
    options: MutationOptions = {}
  ) => {
    setIsPending(true);
    setError(null);

    try {
      // Tous les exercices sont automatiquement publiés
      const result = await ExerciseService.publishExercise(exerciseId);

      if (result.success) {
        toast.success('✅ L\'exercice est publié (tous les exercices sont publiés par défaut)');
        options.onSuccess?.(result.data);
      } else {
        toast.error('❌ Message d\'information: ' + result.message);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la publication');
      setError(error);
      toast.error(error.message);
      options.onError?.(error);
      return {
        success: false,
        error: error.message,
        message: error.message
      };
    } finally {
      setIsPending(false);
    }
  }, [exerciseId]);

  return {
    mutate,
    isPending,
    error
  };
};

/**
 * Hook pour "fermer" un exercice (visuel seulement - pas supporté)
 */
export const useCloseExercise = (
  exerciseId: number,
  courseId: number
) => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (
    options: MutationOptions = {}
  ) => {
    setIsPending(true);
    setError(null);

    try {
      // La fermeture n'est pas supportée par l'API
      const result = await ExerciseService.closeExercise(exerciseId);

      if (!result.success) {
        toast.error('❌ ' + result.message);
      } else {
        toast.success('✅ ' + result.message);
      }

      options.onSuccess?.(result.data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la fermeture');
      setError(error);
      toast.error(error.message);
      options.onError?.(error);
      return {
        success: false,
        error: error.message,
        message: error.message
      };
    } finally {
      setIsPending(false);
    }
  }, [exerciseId]);

  return {
    mutate,
    isPending,
    error
  };
};

/**
 * Hook pour dupliquer un exercice
 */
export const useDuplicateExercise = (
  sourceExerciseId: number,
  targetCourseId: number
) => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (
    newTitle?: string,
    options: MutationOptions = {}
  ) => {
    setIsPending(true);
    setError(null);

    try {
      const result = await ExerciseService.duplicateExercise(
        sourceExerciseId,
        targetCourseId,
        newTitle
      );

      if (result.success) {
        toast.success('✅ Exercice dupliqué avec succès');
        options.onSuccess?.(result.data);
      } else {
        toast.error('❌ Erreur lors de la duplication');
        options.onError?.(new Error(result.message || 'Erreur inconnue'));
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la duplication');
      setError(error);
      toast.error(error.message);
      options.onError?.(error);
      return {
        success: false,
        error: error.message,
        message: error.message
      };
    } finally {
      setIsPending(false);
    }
  }, [sourceExerciseId, targetCourseId]);

  return {
    mutate,
    isPending,
    error
  };
};

/**
 * Hook utilitaire pour la gestion des exercices d'un cours
 */
export const useCourseExercises = (
  courseId?: number,
  options: UseExerciseOptions = {}
) => {
  const { enabled = true, autoRefetch = true } = options;
  const { loading: authLoading } = useAuth();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourseExercises = useCallback(async () => {
    if (!enabled || !courseId || authLoading) {
      if (!authLoading) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const courseExercises = await ExerciseService.getExercisesForCourse(courseId);
      setExercises(courseExercises);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la récupération des exercices');
      setError(error);
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, enabled]);

  useEffect(() => {
    if (autoRefetch && courseId && !authLoading) {
      fetchCourseExercises();
    }
  }, [fetchCourseExercises, autoRefetch, courseId, authLoading]);

  return {
    exercises,
    isLoading,
    error,
    refetch: fetchCourseExercises
  };
};