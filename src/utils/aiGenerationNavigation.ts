export const AI_GENERATION_OPEN_MODAL_EVENT = 'xccm-ai-generation-open-modal';

const AI_GENERATION_OPEN_MODAL_STORAGE_KEY = 'xccm_ai_generation_open_modal';

export function isEditorPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === '/editor' || pathname.startsWith('/editor/');
}

export function dispatchAIGenerationModalOpen() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AI_GENERATION_OPEN_MODAL_EVENT));
}

export function requestAIGenerationModalOpenOnNextVisit() {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(AI_GENERATION_OPEN_MODAL_STORAGE_KEY, '1');
  } catch {
    // Ignore sessionStorage failures.
  }
}

export function consumeAIGenerationModalOpenRequest(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const shouldOpen = sessionStorage.getItem(AI_GENERATION_OPEN_MODAL_STORAGE_KEY) === '1';
    sessionStorage.removeItem(AI_GENERATION_OPEN_MODAL_STORAGE_KEY);
    return shouldOpen;
  } catch {
    return false;
  }
}
