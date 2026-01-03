// src/utils/editorUtils.ts
import { TableOfContentsItem, ItemType } from '@/types/editor.types';

/**
 * Parses HTML content from Tiptap and generates a hierarchical Table of Contents.
 * Looks for data-type="section|chapitre|paragraphe|notion|exercice" attributes.
 */
export function parseTOCFromHTML(html: string): TableOfContentsItem[] {
    if (typeof window === 'undefined') return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Maps to track numbering at each level
    const counters: Record<string, number> = {
        section: 0,
        chapter: 0,
        paragraph: 0,
        notion: 0,
        exercise: 0
    };

    const getLabel = (type: string, titleAttr: string | null, element: Element): string => {
        if (titleAttr && titleAttr !== 'Section' && titleAttr !== 'Chapitre' && titleAttr !== 'Paragraphe') {
            return titleAttr;
        }
        // Fallback: try to find first text node or use default label
        const firstText = element.textContent?.trim().split('\n')[0].substring(0, 40) || '';
        if (firstText) return firstText;

        const labels: Record<string, string> = {
            section: 'Section',
            chapitre: 'Chapitre',
            paragraphe: 'Paragraphe',
            notion: 'Notion',
            exercice: 'Exercice'
        };
        return labels[type] || type;
    };

    const processNode = (element: Element, depth: number, parentNumber: string): TableOfContentsItem | null => {
        const type = element.getAttribute('data-type');
        if (!type) return null;

        // Normalize type for internal mapping
        const normalizedType = type === 'chapitre' ? 'chapter' :
            type === 'paragraphe' ? 'paragraph' :
                type as ItemType;

        counters[normalizedType]++;
        // Reset child counters
        if (normalizedType === 'section') { counters.chapter = 0; counters.paragraph = 0; }
        if (normalizedType === 'chapter') { counters.paragraph = 0; }

        const currentNumber = parentNumber ? `${parentNumber}${counters[normalizedType]}.` : `${counters[normalizedType]}.`;

        const item: TableOfContentsItem = {
            id: element.getAttribute('data-id') || `item-${Math.random().toString(36).substr(2, 9)}`,
            title: getLabel(type, element.getAttribute('data-title'), element),
            type: normalizedType,
            level: depth + 1,
            number: currentNumber,
            children: []
        };

        // Find children recursively
        // We only look for direct descendants that are also nodes of our levels
        // Tiptap non-nested structures might have them as siblings, but our extensions wrap them.
        const children = Array.from(element.querySelectorAll(':scope > .content > [data-type], :scope > [data-type]'));

        item.children = children
            .map(child => processNode(child, depth + 1, currentNumber))
            .filter((n): n is TableOfContentsItem => n !== null);

        return item;
    };

    // Find top level nodes (usually sections)
    // If no sections, it might be chapters at top level
    const topLevelElements = Array.from(doc.body.querySelectorAll(':scope > [data-type]'));

    return topLevelElements
        .map(el => processNode(el, 0, ''))
        .filter((n): n is TableOfContentsItem => n !== null);
}
