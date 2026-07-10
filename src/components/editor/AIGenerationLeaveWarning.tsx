'use client';

import { useAIGenerationLeaveWarning } from '@/hooks/useAIGenerationLeaveWarning';

/**
 * Active les garde-fous de navigation pendant une génération IA en arrière-plan.
 */
export default function AIGenerationLeaveWarning() {
  useAIGenerationLeaveWarning();
  return null;
}
