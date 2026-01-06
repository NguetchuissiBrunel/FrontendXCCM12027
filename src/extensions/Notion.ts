/**
 * NOTION NODE - Custom TipTap Extension
 * 
 * Defines the "Notion" hierarchy level for XCCM educational content.
 * Color: Red (#EF4444)
 * Position: Fifth level in hierarchy (after Cours, Section, Chapitre, Paragraphe)
 * 
 * Features:
 * - Custom node type separate from standard headings
 * - Can contain nested content
 * - Visual rendering via NotionNodeView component
 * - Attributes: id, title, number for future TOC generation
 * 
 * @author JOHAN
 * @date December 2024
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import NotionNodeView from './NotionNodeView';

export interface NotionOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    notion: {
      /**
       * Set the current block to a Notion node
       */
      setNotion: () => ReturnType;
    };
  }
}

export default Node.create<NotionOptions>({
  name: 'notion',

  group: 'block',

  content: '(paragraph)+',
  isolating:true,

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
        default: 'Notion',
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
        tag: 'div[data-type="notion"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'notion' }), 0];
  },

addCommands() {
  return {
    setNotion:
      (attrs = {}) =>
      ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            // Consistent unique ID generation matching Section/Chapitre
            id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `notion-${Date.now()}`,
            title: 'Notion',
            ...attrs,
          },
          content: [
            {
              type: 'paragraph',
              content: [], // Satisfies the (paragraph+) or (block+) schema requirement
            },
          ],
        });
      },
  };
},

  addNodeView() {
    return ReactNodeViewRenderer(NotionNodeView);
  },
});