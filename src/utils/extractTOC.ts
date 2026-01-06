/**
 * EXTRACT TOC UTILITY
 * 
 * Extracts Table of Contents from TipTap editor JSON.
 * Compatible with existing XCCM TableOfContentsItem interface.
 * 
 * Hierarchy:
 * - course (H1, Blue) - Level 0
 * - section (Purple) - Level 1  
 * - chapitre (Green) - Level 2
 * - paragraphe (Orange) - Level 3
 * - notion (Red) - Level 4
 * - exercice (Indigo) - Level 5
 * 
 * @author JOHAN
 * @date December 2025
 */

import { TableOfContentsItem, ItemType, ITEM_COLORS } from '@/types/editor.types';

/**
 * Node type to ItemType mapping
 */
const NODE_TYPE_MAP: Record<string, { itemType: ItemType; level: number }> = {
  heading: { itemType: 'course', level: 0 },      // Only H1 counts
  section: { itemType: 'section', level: 1 },
  chapitre: { itemType: 'chapter', level: 2 },
  paragraphe: { itemType: 'paragraph', level: 3 },
  notion: { itemType: 'notion', level: 4 },
  exercice: { itemType: 'exercise', level: 5 },
};

/**
 * Extract text content from node's content array
 * Gets the first line of text as the title
 */
function extractTextContent(content: any[]): string {
  if (!content || !Array.isArray(content)) return '';
  
  for (const item of content) {
    // Direct text node
    if (item.type === 'text' && item.text) {
      return item.text.trim();
    }
    
    // Paragraph or other container with text
    if (item.content && Array.isArray(item.content)) {
      const text = extractTextContent(item.content);
      if (text) return text;
    }
  }
  
  return '';
}

/**
 * Check if node is a hierarchy node we care about
 */
function isHierarchyNode(node: any): boolean {
  // H1 heading (Cours)
  if (node.type === 'heading' && node.attrs?.level === 1) {
    return true;
  }
  
  // Custom XCCM nodes
  return ['section', 'chapitre', 'paragraphe', 'notion', 'exercice'].includes(node.type);
}

/**
 * Get node configuration (type, level)
 */
function getNodeConfig(node: any): { itemType: ItemType; level: number } | null {
  // H1 heading (Cours) only
  if (node.type === 'heading') {
    if (node.attrs?.level === 1) {
      return NODE_TYPE_MAP.heading;
    }
    return null; // Ignore H2-H6
  }
  
  // Custom nodes
  return NODE_TYPE_MAP[node.type] || null;
}

/**
 * Generate hierarchical numbering (1, 1.1, 1.1.1, etc.)
 */
function generateNumber(counters: number[]): string {
  // Skip level 0 (Course) and filter out zeros
  return counters.slice(1).filter(c => c > 0).join('.');
}

/**
 * Recursively extract TOC items from editor JSON
 */
function extractTOCRecursive(
  nodes: any[],
  counters: number[] = [],
  level: number = 0
): TableOfContentsItem[] {
  const items: TableOfContentsItem[] = [];
  const levelCounters = [...counters];

  for (const node of nodes) {
    if (isHierarchyNode(node)) {
      const config = getNodeConfig(node);
      
      if (config) {
        // Increment counter at current level
        while (levelCounters.length <= config.level) {
          levelCounters.push(0);
        }

        // Increment counter at current level
        levelCounters[config.level]++;

        // Reset all deeper levels to 0
        for (let i = config.level + 1; i < levelCounters.length; i++) {
          levelCounters[i] = 0;
        }
        levelCounters.splice(config.level + 1);

        // Extract title from node
        let title = '';
        
        // Try node.attrs.title first (stored attribute)
        if (node.attrs?.title && node.attrs.title !== config.itemType) {
          title = node.attrs.title;
        } else {
          // Extract first line of text from content
          title = extractTextContent(node.content || []);
        }
        
        // Fallback to type name with counter
        const typeLabels: Record<ItemType, string> = {
          course: 'Cours',
          section: 'Partie',
          chapter: 'Chapitre',
          paragraph: 'Paragraphe',
          notion: 'Notion',
          exercise: 'Exercice',
        };

        // Generate number string
        const numberStr = generateNumber(levelCounters.slice(0, config.level + 1));

        // Format title as "Type Number: Content"
        const typeLabel = typeLabels[config.itemType];
        let displayTitle = '';
        if (title) {
          displayTitle = `${typeLabel} ${numberStr}: ${title}`;
        } else {
          displayTitle = `${typeLabel} ${numberStr}`;
        }

        // Generate unique ID
        const id = node.attrs?.id || `${config.itemType}-${levelCounters.join('-')}`;

        // Create TOC item
        const tocItem: TableOfContentsItem = {
          id,
          title: displayTitle.substring(0, 100),
          type: config.itemType,
          level: config.level,
          number: numberStr,
          children: [],
          content: node.content ? JSON.stringify(node.content) : undefined,
        };
        // Recursively extract children
        if (node.content && Array.isArray(node.content)) {
          tocItem.children = extractTOCRecursive(
            node.content,
            levelCounters,
            config.level + 1
          );
        }

        items.push(tocItem);
      }
    } else if (node.content && Array.isArray(node.content)) {
      // Not a hierarchy node, but check its children
      const childItems = extractTOCRecursive(node.content, levelCounters, level);
      items.push(...childItems);
    }
  }

  return items;
}

/**
 * Main function: Extract Table of Contents from TipTap editor JSON
 * 
 * @param editorJSON - The JSON output from editor.getJSON()
 * @returns Array of TableOfContentsItem in hierarchical structure
 */
export function extractTOC(editorJSON: any): TableOfContentsItem[] {
  if (!editorJSON || !editorJSON.content) {
    return [];
  }

  return extractTOCRecursive(editorJSON.content);
}

/**
 * Flatten TOC tree for easier iteration (utility function)
 */
export function flattenTOC(items: TableOfContentsItem[]): TableOfContentsItem[] {
  const flattened: TableOfContentsItem[] = [];
  
  function flatten(items: TableOfContentsItem[]) {
    for (const item of items) {
      flattened.push(item);
      if (item.children.length > 0) {
        flatten(item.children);
      }
    }
  }
  
  flatten(items);
  return flattened;
}

/**
 * Find TOC item by ID (utility for navigation)
 */
export function findTOCItem(items: TableOfContentsItem[], id: string): TableOfContentsItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children.length > 0) {
      const found = findTOCItem(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Re-export types for convenience
export type { TableOfContentsItem };