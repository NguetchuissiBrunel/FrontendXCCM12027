import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MathNodeView from './MathNodeView';

export interface MathOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        math: {
            /**
             * Add a math block
             */
            setMath: (attributes?: { tex: string }) => ReturnType;
        };
    }
}

export default Node.create<MathOptions>({
    name: 'math',

    group: 'inline',
    inline: true,

    atom: true,

    addOptions() {
        return {
            HTMLAttributes: {
                class: 'math-node inline-block',
            },
        };
    },

    addAttributes() {
        return {
            tex: {
                default: 'E = mc^2',
                parseHTML: element => element.getAttribute('data-tex'),
                renderHTML: attributes => ({
                    'data-tex': attributes.tex,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-type="math"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'math' })];
    },

    addCommands() {
        return {
            setMath:
                attributes =>
                    ({ commands }) => {
                        return commands.insertContent({ type: this.name, attrs: attributes });
                    },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(MathNodeView);
    },
});
