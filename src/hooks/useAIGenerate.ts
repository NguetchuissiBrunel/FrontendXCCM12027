'use client';

import { useState, useCallback } from 'react';
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

export function useAIGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<AIGenerateStep[]>([]);
  const [result, setResult] = useState<AIGenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addStep = (event: string, message: string) => {
    setSteps(prev => [...prev, { event, message }]);
  };

  const generate = useCallback(async (req: AIGenerateRequest) => {
    setIsGenerating(true);
    setSteps([]);
    setResult(null);
    setError(null);

    const token = getAuthToken();

    try {
      const response = await fetch(`${BASE_URL}/courses/generate-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

      const processLine = (line: string) => {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          const rawData = line.slice(5).trim();
          try {
            const data = JSON.parse(rawData);
            if (currentEvent === 'error') {
              setError(data.message || 'Erreur inconnue');
              setIsGenerating(false);
              return;
            }
            // Le backend (SseEmitter) perd le nom d'événement du LLM : la trame finale
            // arrive souvent comme "message" au lieu de "done". On détecte donc la fin
            // aussi par la forme du payload (content + generation_meta).
            const isDone = currentEvent === 'done'
              || (data && data.generation_meta && data.content);
            if (isDone) {
              setResult(data as AIGenerateResult);
              addStep('done', `Cours généré en ${((data.generation_meta?.duration_ms ?? 0) / 1000).toFixed(1)}s`);
            } else {
              addStep(currentEvent, data.message || currentEvent);
            }
            currentEvent = 'message';
          } catch {
            // ignore malformed line
          }
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          processLine(line);
        }
      }

      // Flush remaining buffer in case the stream ended without a trailing newline
      if (buffer.trim()) {
        processLine(buffer);
      }
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSteps([]);
    setResult(null);
    setError(null);
  }, []);

  return { generate, isGenerating, steps, result, error, reset };
}
