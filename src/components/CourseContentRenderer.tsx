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
import Math from '../extensions/Math';
import { useTracking } from '../hooks/useTracking';

interface CourseContentRendererProps {
    content: any;
    forceLight?: boolean;
    nodeIndex?: number | null;
    notionTitle?: string;
}

const CourseContentRenderer: React.FC<CourseContentRendererProps> = ({ content, forceLight = false, nodeIndex = null, notionTitle = "General" }) => {
    const { trackReading } = useTracking(notionTitle);
    
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
            // Filter by nodeIndex if provided
            if (nodeIndex !== null && nodeIndex !== undefined) {
                if (nodeIndex >= 0) {
                    if (processedContent[nodeIndex]) {
                        processedContent = [processedContent[nodeIndex]];
                    }
                } else if (nodeIndex === -1) {
                    // Show intro text (everything before the first notion/exercise)
                    const firstSpecialIdx = processedContent.findIndex(n => n.type === 'notion' || n.type === 'exercice' || n.type === 'exercise');
                    processedContent = firstSpecialIdx === -1 ? processedContent : processedContent.slice(0, firstSpecialIdx);
                }
            } else {
                // nodeIndex is null - show everything (legacy mode or full paragraph)
            }

            // Check if it contains inline nodes (text) directly allowed only in blocks
            const hasInlineNodes = Array.isArray(processedContent) && processedContent.some(node => node.type === 'text' || !node.type);

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
    }, [content, nodeIndex]);

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
            Math,
        ],
        editorProps: {
            attributes: {
                class: `prose ${forceLight ? '' : 'dark:prose-invert'} max-w-none focus:outline-none`,
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

    // Attach tracking ref to the top-level container.
    return (
        <div className="course-content-renderer" ref={trackReading(nodeIndex || 0, notionTitle)}>
            <EditorContent editor={editor} />
        </div>
    );
};

export default CourseContentRenderer;
