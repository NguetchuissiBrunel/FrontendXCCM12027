// src/hooks/useExercise.ts - VERSION COMPLÈTE ET CORRIGÉE
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExerciseService } from '@/lib3/services/ExerciseService';
import { Exercise, Submission, ApiResponse } from '@/types/exercise';
import { toast } from 'react-hot-toast';

interface UseExerciseOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseExerciseResult {
  data: ApiResponse<Exercise> | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseExerciseSubmissionsResult {
  data: ApiResponse<Submission[]> | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface MutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook pour récupérer un exercice par ID
 */
export const useExercise = (
  exerciseId: number,
  options: UseExerciseOptions = {}
): UseExerciseResult => {
  const { enabled = true, refetchInterval } = options;
  const [data, setData] = useState<ApiResponse<Exercise> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExercise = useCallback(async () => {
    if (!enabled || !exerciseId) return;

    setIsLoading(true);
    setError(null);

    try {
      const exercise = await ExerciseService.getExerciseDetails(exerciseId);
      
      if (exercise) {
        setData({
          success: true,
          data: exercise,
          message: 'Exercice récupéré avec succès',
          timestamp: new Date().toISOString()
        });
      } else {
        setData({
          success: false,
          message: 'Exercice non trouvé',
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la récupération');
      setError(error);
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

  useEffect(() => {
    fetchExercise();

    let intervalId: NodeJS.Timeout | null = null;
    if (refetchInterval && refetchInterval > 0) {
      intervalId = setInterval(fetchExercise, refetchInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchExercise, refetchInterval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchExercise
  };
};

/**
 * Hook pour mettre à jour un exercice
 */
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
 * Hook pour récupérer les soumissions d'un exercice
 */
export const useExerciseSubmissions = (
  exerciseId: number,
  options: UseExerciseOptions = {}
): UseExerciseSubmissionsResult => {
  const { enabled = true } = options;
  const [data, setData] = useState<ApiResponse<Submission[]> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!enabled || !exerciseId) return;

    setIsLoading(true);
    setError(null);

    try {
      const submissions = await ExerciseService.getExerciseSubmissions(exerciseId);
      
      setData({
        success: true,
        data: submissions,
        message: 'Soumissions récupérées avec succès',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la récupération des soumissions');
      setError(error);
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

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchSubmissions
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
 * Hook pour vérifier les permissions de soumission
 */
export const useSubmissionPermission = (exerciseId: number) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permission, setPermission] = useState<{
    canSubmit: boolean;
    reason?: string;
    exercise?: Exercise;
  } | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      setIsLoading(true);
      try {
        const result = await ExerciseService.checkSubmissionPermission(exerciseId);
        setPermission(result);
      } catch (error) {
        setPermission({
          canSubmit: false,
          reason: 'Erreur de vérification'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (exerciseId) {
      checkPermission();
    }
  }, [exerciseId]);

  return {
    isLoading,
    permission
  };
};

/**
 * Hook pour noter une soumission
 */
export const useGradeSubmission = () => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (
    submissionId: number,
    gradeData: {
      score: number;
      feedback?: string;
    },
    options: MutationOptions = {}
  ) => {
    setIsPending(true);
    setError(null);

    try {
      const result = await ExerciseService.gradeSubmission(submissionId, gradeData);
      
      if (result.success) {
        toast.success('✅ Soumission notée avec succès');
        options.onSuccess?.(result.data);
      } else {
        toast.error('❌ Erreur lors de la notation');
        options.onError?.(new Error(result.message || 'Erreur inconnue'));
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la notation');
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
  }, []);

  return {
    mutate,
    isPending,
    error
  };
};