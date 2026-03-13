'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import FontFamily from '@tiptap/extension-font-family';
import ResizableImage from '../extensions/ResizableImage';
import Section from '../extensions/Section';
import Chapitre from '../extensions/Chapitre';
import Paragraphe from '../extensions/Paragraphe';
import Notion from '../extensions/Notion';
import Exercice from '../extensions/Exercice';

interface CourseContentRendererProps {
    content: any;
}

const CourseContentRenderer: React.FC<CourseContentRendererProps> = ({ content }) => {
    // Helper to ensure content is a valid Doc structure
    const [validContent, setValidContent] = useState<JSONContent>({ type: 'doc', content: [] });

    useEffect(() => {
        let processedContent = content;

        // If content is null/undefined
        if (!processedContent) {
            setValidContent({ type: 'doc', content: [] });
            return;
        }

        // If content is an array (list of nodes)
        if (Array.isArray(processedContent)) {
            // Check if it contains inline nodes (text) directly allowed only in blocks
            const hasInlineNodes = processedContent.some(node => node.type === 'text' || !node.type);

            if (hasInlineNodes) {
                // Wrap inline content in a paragraph
                processedContent = {
                    type: 'doc',
                    content: [
                        {
                            type: 'paragraph',
                            content: processedContent
                        }
                    ]
                };
            } else {
                // Assume they are blocks, wrap in doc
                processedContent = {
                    type: 'doc',
                    content: processedContent
                };
            }
        } else if (processedContent.type !== 'doc') {
            // Single node object, not doc
            // If it's a block, wrap in doc
            processedContent = {
                type: 'doc',
                content: [processedContent]
            };
        }

        setValidContent(processedContent);
    }, [content]);


    const editor = useEditor({
        editable: false,
        content: validContent,
        extensions: [
            StarterKit,
            FontFamily.configure({
                types: ['textStyle'],
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
                defaultAlignment: 'left',
            }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            ResizableImage,
            Link.configure({
                openOnClick: true,
            }),
            Section,
            Chapitre,
            Paragraphe,
            Notion,
            Exercice,
        ],
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none',
            },
        },
    });

    // Update content if prop changes
    useEffect(() => {
        if (editor && validContent) {
            // We use queueMicrotask to avoid potential flushSync errors during render
            queueMicrotask(() => {
                editor.commands.setContent(validContent);
            });
        }
    }, [editor, validContent]);

    if (!editor) {
        return null;
    }

    return (
        <div className="course-content-renderer">
            <EditorContent editor={editor} />
        </div>
    );
};

export default CourseContentRenderer;
