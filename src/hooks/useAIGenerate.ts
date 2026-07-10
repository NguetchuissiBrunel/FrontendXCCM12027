'use client';

import { useState, useCallback, useRef } from 'react';
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

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

function isDonePayload(data: unknown): data is AIGenerateResult {
  if (!data || typeof data !== 'object') return false;
  const payload = data as Partial<AIGenerateResult>;
  return Boolean(payload.content && payload.generation_meta);
}

function formatStepMessage(event: string, data: Record<string, unknown>): string {
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }
  if (event === 'spec_ready' && typeof data.title === 'string') {
    return `Plan généré pour « ${data.title} »`;
  }
  return event;
}

export function useAIGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInBackground, setIsInBackground] = useState(false);
  const [hasUnreadCompletion, setHasUnreadCompletion] = useState(false);
  const [hasUnreadError, setHasUnreadError] = useState(false);
  const [steps, setSteps] = useState<AIGenerateStep[]>([]);
  const [result, setResult] = useState<AIGenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isInBackgroundRef = useRef(false);

  const addStep = (event: string, message: string) => {
    setSteps(prev => [...prev, { event, message }]);
  };

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
    setIsGenerating(true);
    setSteps([]);
    setResult(null);
    setError(null);
    setHasUnreadCompletion(false);
    setHasUnreadError(false);
    isInBackgroundRef.current = false;
    setIsInBackground(false);

    const token = getAuthToken();
    let receivedResult = false;
    let receivedError = false;

    try {
      const response = await fetch(`${BASE_URL}/courses/generate-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
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

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Pas de flux de réponse');

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = 'message';
      let currentData = '';

      const flushEvent = () => {
        const rawData = currentData.trim();
        currentData = '';

        if (!rawData) {
          currentEvent = 'message';
          return;
        }

        try {
          const data = JSON.parse(rawData) as Record<string, unknown>;

          if (currentEvent === 'error') {
            receivedError = true;
            const errMsg = String(data.message || 'Erreur inconnue');
            setError(errMsg);
            if (isInBackgroundRef.current) {
              setHasUnreadError(true);
            }
            return;
          }

          if (isDonePayload(data)) {
            receivedResult = true;
            setResult(data);
            const durationMs = data.generation_meta?.duration_ms ?? 0;
            addStep('done', `Cours généré en ${(durationMs / 1000).toFixed(1)}s`);
            if (isInBackgroundRef.current) {
              setHasUnreadCompletion(true);
            }
          } else {
            addStep(currentEvent, formatStepMessage(currentEvent, data));
          }
        } catch {
          // JSON incomplet ou ligne intermédiaire : ignorer silencieusement
        } finally {
          currentEvent = 'message';
        }
      };

      const processLine = (line: string) => {
        if (line.startsWith('event:')) {
          if (currentData.trim()) {
            flushEvent();
          }
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          const chunk = line.slice(5).trimStart();
          currentData = currentData ? `${currentData}\n${chunk}` : chunk;
        } else if (line === '') {
          flushEvent();
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          processLine(line);
        }
      }

      if (buffer.trim()) {
        processLine(buffer);
      }
      flushEvent();

      if (!receivedResult && !receivedError) {
        throw new Error(
          'Le flux de génération s’est interrompu avant la fin. Vérifiez le proxy nginx ou relancez la génération.'
        );
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur de connexion';
      const normalized = message.toLowerCase().includes('network')
        ? 'Connexion interrompue pendant la génération (timeout proxy ou flux SSE coupé).'
        : message;
      setError(normalized);
      if (isInBackgroundRef.current) {
        setHasUnreadError(true);
      }
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSteps([]);
    setResult(null);
    setError(null);
    setHasUnreadCompletion(false);
    setHasUnreadError(false);
    isInBackgroundRef.current = false;
    setIsInBackground(false);
  }, []);

  return {
    generate,
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
