/**
 * STEP 1: MINIMAL TIPTAP EDITOR - BORDER ON EDITABLE AREA
 * 
 * @author JOHAN
 * @date November 2025
 */

'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface MainEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export const MainEditor: React.FC<MainEditorProps> = ({ 
  initialContent, 
  onContentChange 
}) => {
  
    const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[500px] p-4 focus:outline-none editor-focusable',  // ← Enhanced: Added 'editor-focusable' for borders
      },
    },
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
    },
  });

  const ToolbarButton = ({ 
    onClick,
    children,
    title 
  }: { 
    onClick: () => void;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full h-screen flex flex-col bg-white dark:bg-gray-900">
      
      {/* Toolbar */}
      <div className="border-b border-gray-300 dark:border-gray-700 p-2 bg-gray-100 dark:bg-gray-800">
        <div className="flex gap-2">
          
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            title="Bold (Ctrl + B)"
          >
            <strong>B</strong>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl + I)"
          >
            <em>I</em>
          </ToolbarButton>

        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto ">
          <EditorContent editor={editor} />
        </div>
      </div>

    </div>
  );
};

export default MainEditor;