'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from '@/i18n/navigation';
import { useAIGeneration } from '@/contexts/AIGenerationContext';

export const AI_GENERATION_LEAVE_WARNING =
  'Quitter cette page annulera la génération en cours';

function isEditorPath(pathname: string): boolean {
  return pathname === '/editor' || pathname.startsWith('/editor/');
}

function resolvePathname(href: string): string | null {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return url.pathname.replace(/^\/(fr|en)(?=\/|$)/, '') || '/';
  } catch {
    return null;
  }
}

function shouldConfirmLeave(currentPath: string, targetPath: string): boolean {
  return isEditorPath(currentPath) && !isEditorPath(targetPath);
}

/**
 * Avertit l'utilisateur s'il quitte l'éditeur pendant une génération IA en arrière-plan.
 */
export function useAIGenerationLeaveWarning() {
  const { isGenerating, isInBackground } = useAIGeneration();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  const shouldWarn = isGenerating && isInBackground;

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!shouldWarn) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = AI_GENERATION_LEAVE_WARNING;
      return AI_GENERATION_LEAVE_WARNING;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldWarn]);

  useEffect(() => {
    if (!shouldWarn) return;

    const confirmLeave = (targetHref: string): boolean => {
      const targetPath = resolvePathname(targetHref);
      if (!targetPath) return true;
      if (!shouldConfirmLeave(pathnameRef.current ?? '', targetPath)) return true;
      return window.confirm(AI_GENERATION_LEAVE_WARNING);
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || anchor.target === '_blank') return;

      if (!confirmLeave(href)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handlePopState = () => {
      if (!window.confirm(AI_GENERATION_LEAVE_WARNING)) {
        window.history.pushState(null, '', window.location.href);
      }
    };

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    const guardHistoryMethod = (
      original: typeof originalPushState,
      ...args: Parameters<typeof originalPushState>
    ) => {
      const url = args[2];
      if (typeof url === 'string' && !confirmLeave(url)) {
        return;
      }
      original(...args);
    };

    window.history.pushState = (...args) => guardHistoryMethod(originalPushState, ...args);
    window.history.replaceState = (...args) => guardHistoryMethod(originalReplaceState, ...args);

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleClick, true);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick, true);
    };
  }, [shouldWarn]);
}
