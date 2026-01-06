/**
 * CHAPITRE NODE - Custom TipTap Extension
 * 
 * Defines the "Chapitre" (Chapter) hierarchy level for XCCM educational content.
 * Color: Green (#10B981)
 * Position: Third level in hierarchy (after Cours and Section)
 * 
 * Features:
 * - Custom node type separate from standard headings
 * - Can contain nested content (paragraphs, notions, etc.)
 * - Visual rendering via ChapitreNodeView component
 * - Attributes: id, title, number for future TOC generation
 * 
 * @author JOHAN
 * @date December 2024
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ChapitreNodeView from './ChapitreNodeView';

export interface ChapitreOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    chapitre: {
      /**
       * Set the current block to a Chapitre node
       */
      setChapitre: () => ReturnType;
    };
  }
}

export default Node.create<ChapitreOptions>({
  name: 'chapitre',

  group: 'block',

  content: 'block+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }
          return {
            'data-id': attributes.id,
          };
        },
      },
      title: {
        default: 'Chapitre',
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => {
          return {
            'data-title': attributes.title,
          };
        },
      },
      number: {
        default: null,
        parseHTML: element => element.getAttribute('data-number'),
        renderHTML: attributes => {
          if (!attributes.number) {
            return {};
          }
          return {
            'data-number': attributes.number,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="chapitre"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'chapitre' }), 0];
  },

  addCommands() {
    return {
      setChapitre:
        () =>
        ({ commands }) => {
          // Generate unique ID for this chapitre
          const id = `chapitre-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          return commands.wrapIn(this.name, { id });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChapitreNodeView);
  },
});