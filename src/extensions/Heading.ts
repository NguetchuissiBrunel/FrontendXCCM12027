/**
 * HEADING NODE - Custom TipTap Extension (XCCM)
 * 
 * Extends standard Heading with stable ID support.
 * Used for courses (H1) to ensure they can be targeted by the TOC.
 */

import Heading from '@tiptap/extension-heading';
import { mergeAttributes } from '@tiptap/core';

export default Heading.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
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
        };
    },

    renderHTML({ node, HTMLAttributes }) {
        const hasLevel = this.options.levels.includes(node.attrs.level);
        const level = hasLevel ? node.attrs.level : this.options.levels[0];

        return [`h${level}`, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
});
