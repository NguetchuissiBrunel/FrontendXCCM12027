/**
 * SECTION NODE - Custom TipTap Extension
 * 
 * Defines the "Section" hierarchy level for XCCM educational content.
 * Color: Purple (#8B5CF6)
 * Position: Second level in hierarchy (after Cours/H1)
 * 
 * Features:
 * - Custom node type separate from standard headings
 * - Can contain nested content (chapters, paragraphs, etc.)
 * - Visual rendering via SectionNodeView component
 * - Attributes: id, title, number for future TOC generation
 * 
 * @author JOHAN
 * @date December 2025
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import SectionNodeView from './SectionNodeView';

export interface SectionOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    section: {
      /**
       * Set the current block to a Section node
       */
      setSection: () => ReturnType;
    };
  }
}

export default Node.create<SectionOptions>({
  name: 'section',

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
        default: 'Partie',
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
        tag: 'div[data-type="section"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'section' }), 0];
  },

  addCommands() {
    return {
      setSection:
        () =>
        ({ commands }) => {
          // Generate unique ID for this section
          const id = `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          return commands.wrapIn(this.name, { id });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(SectionNodeView);
  },
});