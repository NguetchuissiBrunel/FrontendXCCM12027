// src/hooks/useTOC.ts
'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { extractTOC, TableOfContentsItem } from '../utils/extractTOC';

/**
 * Custom hook to extract and maintain Table of Contents from TipTap editor
 * 
 * @param editor - The TipTap editor instance
 * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
 * @returns Array of TOC items
 */
export function useTOC(editor: Editor | null, debounceMs: number = 300): TableOfContentsItem[] {
  const [tocItems, setTocItems] = useState<TableOfContentsItem[]>([]);

  useEffect(() => {
    if (!editor) {
      setTocItems([]);
      return;
    }

    // Initial extraction
    const initialJSON = editor.getJSON();
    const initialTOC = extractTOC(initialJSON);
    setTocItems(initialTOC);

    // Debounced update function
    let timeoutId: NodeJS.Timeout;

    const updateTOC = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const editorJSON = editor.getJSON();
        const newTOC = extractTOC(editorJSON);
        setTocItems(newTOC);
      }, debounceMs);
    };

    // Listen to editor updates
    editor.on('update', updateTOC);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      editor.off('update', updateTOC);
    };
  }, [editor, debounceMs]);

  return tocItems;
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