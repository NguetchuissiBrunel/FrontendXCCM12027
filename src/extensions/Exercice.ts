/**
 * EXERCICE NODE - Custom TipTap Extension
 * 
 * Defines the "Exercice" (Exercise) hierarchy level for XCCM educational content.
 * Color: Indigo (#6366F1)
 * Position: Same level as Notion (leaf nodes within Paragraphe)
 * 
 * Features:
 * - Custom node type separate from standard headings
 * - Leaf node (inline content only, no nested blocks)
 * - Visual rendering via ExerciceNodeView component
 * - Attributes: id, title, number for future TOC generation
 * 
 * @author JOHAN
 * @date December 2024
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ExerciceNodeView from './ExerciceNodeView';

export interface ExerciceOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    exercice: {
      /**
       * Set the current block to an Exercice node
       */
      setExercice: () => ReturnType;
    };
  }
}

export default Node.create<ExerciceOptions>({
  name: 'exercice',

  group: 'block',

  content: 'inline*',

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
        default: 'Exercice',
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
        tag: 'div[data-type="exercice"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'exercice' }), 0];
  },

  addCommands() {
    return {
      setExercice:
        () =>
          ({ commands }) => {
            return commands.setNode(this.name);
          },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ExerciceNodeView);
  },
});