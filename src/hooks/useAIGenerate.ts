'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthToken } from '@/utils/authHelpers';

export interface AIGenerateRequest {
  description: string;
  discipline?: string;
  level?: string;
  language?: string;
  exercisesPerChapter?: number;
}

export interface AIGenerateStep {
  event: string;
  message: string;
}

export interface AIGenerateResult {
  title: string;
  description: string;
  discipline: string;
  level: string;
  language: string;
  difficulty: string;
  pedagogical_objectives: string[];
  content: object;
  generation_meta: {
    agents_used: string[];
    duration_ms: number;
    nodes_generated: Record<string, number>;
  };
}

type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

interface AIGenerationJobCreatedResponse {
  jobId: string;
  status: JobStatus;
}

interface AIGenerationJobResponse {
  jobId: string;
  status: JobStatus;
  progressEvent?: string | null;
  progressMessage?: string | null;
  progressPercent?: number | null;
  result?: AIGenerateResult | null;
  errorMessage?: string | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const ACTIVE_JOB_STORAGE_KEY = 'xccm_ai_generation_job_id';
const POLL_INTERVAL_MS = 2500;

function isDonePayload(data: unknown): data is AIGenerateResult {
  if (!data || typeof data !== 'object') return false;
  const payload = data as Partial<AIGenerateResult>;
  return Boolean(payload.content && payload.generation_meta);
}

export function useAIGenerate() {
  const [initialStoredJobId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;

    try {
      return localStorage.getItem(ACTIVE_JOB_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [activeJobId, setActiveJobId] = useState<string | null>(initialStoredJobId);
  const [isGenerating, setIsGenerating] = useState(Boolean(initialStoredJobId));
  const [isInBackground, setIsInBackground] = useState(Boolean(initialStoredJobId));
  const [hasUnreadCompletion, setHasUnreadCompletion] = useState(false);
  const [hasUnreadError, setHasUnreadError] = useState(false);
  const [steps, setSteps] = useState<AIGenerateStep[]>(
    initialStoredJobId
      ? [{ event: 'resume', message: 'Reprise du suivi de la génération en cours...' }]
      : []
  );
  const [result, setResult] = useState<AIGenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeJobIdRef = useRef<string | null>(initialStoredJobId);
  const isInBackgroundRef = useRef(Boolean(initialStoredJobId));
  const lastStepSignatureRef = useRef<string | null>(initialStoredJobId ? 'resume' : null);
  const pollJobRef = useRef<((jobId: string) => Promise<void>) | null>(null);
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addStep = useCallback((event: string, message: string) => {
    setSteps(prev => [...prev, { event, message }]);
  }, []);

  const clearPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  const persistActiveJobId = useCallback((jobId: string | null) => {
    if (typeof window === 'undefined') return;

    try {
      if (jobId) {
        localStorage.setItem(ACTIVE_JOB_STORAGE_KEY, jobId);
      } else {
        localStorage.removeItem(ACTIVE_JOB_STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage failures
    }
  }, []);

  const setTrackedJobId = useCallback((jobId: string | null) => {
    activeJobIdRef.current = jobId;
    setActiveJobId(jobId);
    persistActiveJobId(jobId);
  }, [persistActiveJobId]);

  const finalizeJob = useCallback((jobId: string | null) => {
    if (activeJobIdRef.current === jobId) {
      clearPolling();
      setTrackedJobId(null);
      setIsGenerating(false);
    }
  }, [clearPolling, setTrackedJobId]);

  const parseApiResponse = useCallback(async <T,>(response: Response): Promise<T> => {
    const payload = await response.json().catch(() => null) as
      | { message?: string; error?: string; data?: T }
      | T
      | null;

    if (!response.ok) {
      if (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string') {
        throw new Error(payload.message);
      }
      if (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string') {
        throw new Error(payload.error);
      }
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data as T;
    }

    return payload as T;
  }, []);

  const handleJobSnapshot = useCallback((job: AIGenerationJobResponse) => {
    if (job.jobId !== activeJobIdRef.current) return;

    const progressEvent = job.progressEvent || 'progress';
    const progressMessage = job.progressMessage?.trim() || 'Génération en cours...';
    const stepSignature = `${job.status}:${progressEvent}:${progressMessage}:${job.progressPercent ?? ''}`;

    if (job.status === 'PENDING' || job.status === 'RUNNING') {
      if (lastStepSignatureRef.current !== stepSignature) {
        lastStepSignatureRef.current = stepSignature;
        addStep(progressEvent, progressMessage);
      }
      setIsGenerating(true);
      return;
    }

    if (job.status === 'COMPLETED' && job.result && isDonePayload(job.result)) {
      const durationMs = job.result.generation_meta?.duration_ms ?? 0;
      setResult(job.result);
      setError(null);
      addStep('done', `Cours généré en ${(durationMs / 1000).toFixed(1)}s`);
      if (isInBackgroundRef.current) {
        setHasUnreadCompletion(true);
      }
      finalizeJob(job.jobId);
      return;
    }

    if (job.status === 'COMPLETED') {
      setError('La génération est terminée mais le résultat est incomplet.');
      if (isInBackgroundRef.current) {
        setHasUnreadError(true);
      }
      finalizeJob(job.jobId);
      return;
    }

    if (job.status === 'FAILED') {
      const message = job.errorMessage?.trim() || 'La génération IA a échoué.';
      setError(message);
      if (isInBackgroundRef.current) {
        setHasUnreadError(true);
      }
      finalizeJob(job.jobId);
    }
  }, [addStep, finalizeJob]);

  const pollJob = useCallback(async (jobId: string) => {
    const token = getAuthToken();

    try {
      const response = await fetch(`${BASE_URL}/courses/generate-ai/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const job = await parseApiResponse<AIGenerationJobResponse>(response);
      handleJobSnapshot(job);

      if (activeJobIdRef.current === jobId && (job.status === 'PENDING' || job.status === 'RUNNING')) {
        pollingTimeoutRef.current = setTimeout(() => {
          void pollJobRef.current?.(jobId);
        }, POLL_INTERVAL_MS);
      }
    } catch (e: unknown) {
      if (activeJobIdRef.current !== jobId) return;

      const message = e instanceof Error ? e.message : 'Erreur de connexion';
      setError(message);
      if (isInBackgroundRef.current) {
        setHasUnreadError(true);
      }
      finalizeJob(jobId);
    }
  }, [finalizeJob, handleJobSnapshot, parseApiResponse]);

  useEffect(() => {
    pollJobRef.current = pollJob;
  }, [pollJob]);

  const sendToBackground = useCallback(() => {
    isInBackgroundRef.current = true;
    setIsInBackground(true);
  }, []);

  const returnToForeground = useCallback(() => {
    isInBackgroundRef.current = false;
    setIsInBackground(false);
    setHasUnreadCompletion(false);
    setHasUnreadError(false);
  }, []);

  const generate = useCallback(async (req: AIGenerateRequest) => {
    clearPolling();
    setTrackedJobId(null);
    setIsGenerating(true);
    setSteps([]);
    setResult(null);
    setError(null);
    setHasUnreadCompletion(false);
    setHasUnreadError(false);
    lastStepSignatureRef.current = null;
    isInBackgroundRef.current = false;
    setIsInBackground(false);

    const token = getAuthToken();

    try {
      const response = await fetch(`${BASE_URL}/courses/generate-ai/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          description: req.description,
          discipline: req.discipline || 'general',
          level: req.level || 'L1',
          language: req.language || 'fr',
          exercisesPerChapter: req.exercisesPerChapter ?? 1,
        }),
      });

      const created = await parseApiResponse<AIGenerationJobCreatedResponse>(response);
      setTrackedJobId(created.jobId);
      addStep('queued', 'Job de génération créé.');
      void pollJob(created.jobId);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur de connexion';
      setError(message);
      if (isInBackgroundRef.current) {
        setHasUnreadError(true);
      }
      setIsGenerating(false);
    }
  }, [addStep, clearPolling, parseApiResponse, pollJob, setTrackedJobId]);

  useEffect(() => {
    if (initialStoredJobId && activeJobIdRef.current === initialStoredJobId) {
      void pollJob(initialStoredJobId);
    }

    return () => {
      clearPolling();
    };
  }, [clearPolling, initialStoredJobId, pollJob]);

  const reset = useCallback(() => {
    clearPolling();
    setTrackedJobId(null);
    setSteps([]);
    setResult(null);
    setError(null);
    setHasUnreadCompletion(false);
    setHasUnreadError(false);
    lastStepSignatureRef.current = null;
    isInBackgroundRef.current = false;
    setIsInBackground(false);
    setIsGenerating(false);
  }, [clearPolling, setTrackedJobId]);

  return {
    generate,
    activeJobId,
    isGenerating,
    isInBackground,
    hasUnreadCompletion,
    hasUnreadError,
    steps,
    result,
    error,
    reset,
    sendToBackground,
    returnToForeground,
  };
}
