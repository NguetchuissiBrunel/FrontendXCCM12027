'use client';

import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { usePathname } from '@/i18n/navigation';
import { useAIGeneration } from '@/contexts/AIGenerationContext';
import { isEditorPath } from '@/utils/aiGenerationNavigation';

/**
 * Passe automatiquement le suivi en arrière-plan quand l'utilisateur quitte
 * l'éditeur pendant une génération IA, puis affiche un rappel non bloquant.
 */
export function useAIGenerationLeaveWarning() {
  const { isGenerating, isInBackground, sendToBackground } = useAIGeneration();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    const previousPath = pathnameRef.current;

    if (isGenerating && pathname && !isEditorPath(pathname) && !isInBackground) {
      sendToBackground();
    }

    if (
      previousPath &&
      pathname &&
      previousPath !== pathname &&
      isGenerating &&
      isEditorPath(previousPath) &&
      !isEditorPath(pathname)
    ) {
      toast('La génération continue en arrière-plan. Vous pouvez revenir dans l\'éditeur à tout moment.', {
        id: 'ai-generation-background-info',
      });
    }

    pathnameRef.current = pathname;
  }, [isGenerating, isInBackground, pathname, sendToBackground]);
}
