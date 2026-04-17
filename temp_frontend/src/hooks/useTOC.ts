// src/hooks/useTOC.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { extractTOC, TableOfContentsItem } from '../utils/extractTOC';

/**
 * Custom hook to extract and maintain Table of Contents from TipTap editor
 * 
 * @param editor - The TipTap editor instance
 * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
 * @returns Array of TOC items
 */
export function useTOC(editor: Editor | null, debounceMs: number = 300): [TableOfContentsItem[], () => void] {
  const [tocItems, setTocItems] = useState<TableOfContentsItem[]>([]);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const performUpdate = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    const editorJSON = editor.getJSON();
    const newTOC = extractTOC(editorJSON);
    setTocItems(newTOC);
  }, [editor]);

  const updateTOC = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = setTimeout(performUpdate, debounceMs);
  }, [editor, debounceMs, performUpdate]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      setTocItems([]);
      return;
    }

    // Initial extraction - immediately and then after a small delay
    // to catch any content set right after editor initialization
    const initialUpdate = () => {
      if (!editor.isDestroyed) {
        performUpdate();
      }
    };

    initialUpdate();
    const timeoutInitial = setTimeout(initialUpdate, 100);

    // Listen to editor updates and transactions
    // Tiptap's 'update' event is the most reliable for content changes
    editor.on('update', updateTOC);
    editor.on('transaction', updateTOC);

    // Cleanup
    return () => {
      clearTimeout(timeoutInitial);
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      editor.off('update', updateTOC);
      editor.off('transaction', updateTOC);
    };
  }, [editor, updateTOC, performUpdate]);

  return [tocItems, performUpdate];
}

/**
 * Hook to track active TOC item based on scroll position
 * (Optional - for future implementation)
 */
export function useActiveTOCItem(
  editor: Editor | null,
  tocItems: TableOfContentsItem[]
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!editor || tocItems.length === 0) {
      setActiveId(null);
      return;
    }

    // TODO: Implement scroll tracking
    // This would track which section is currently visible in the viewport
    // and set the activeId accordingly

    // For now, just return the first item as active
    if (tocItems.length > 0) {
      setActiveId(tocItems[0].id);
    }

    return () => {
      setActiveId(null);
    };
  }, [editor, tocItems]);

  return activeId;
}