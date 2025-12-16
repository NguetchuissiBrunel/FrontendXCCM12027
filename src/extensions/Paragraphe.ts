/**
 * PARAGRAPHE NODE - Custom TipTap Extension
 * 
 * Defines the "Paragraphe" (Paragraph) hierarchy level for XCCM educational content.
 * Color: Orange (#F59E0B)
 * Position: Fourth level in hierarchy (after Cours, Section, Chapitre)
 * 
 * Features:
 * - Custom node type separate from standard headings
 * - Can contain nested content (notions, exercises, etc.)
 * - Visual rendering via ParagrapheNodeView component
 * - Attributes: id, title, number for future TOC generation
 * 
 * @author JOHAN
 * @date December 2024
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ParagrapheNodeView from './ParagrapheNodeView';

export interface ParagrapheOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraphe: {
      /**
       * Set the current block to a Paragraphe node
       */
      setParagraphe: () => ReturnType;
    };
  }
}

export default Node.create<ParagrapheOptions>({
  name: 'paragraphe',

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
        default: 'Paragraphe',
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
        tag: 'div[data-type="paragraphe"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'paragraphe' }), 0];
  },

  addCommands() {
    return {
      setParagraphe:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name);
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ParagrapheNodeView);
  },
});