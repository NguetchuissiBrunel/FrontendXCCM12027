'use client';

import React from 'react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify } from 'react-icons/fa';

interface MainEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export const MainEditor: React.FC<MainEditorProps> = ({ 
  initialContent, 
  onContentChange 
}) => {
  
    const TextAlignWithShortcuts = TextAlign.extend({
      addKeyboardShortcuts() {
        return {
          // Ctrl/Cmd + Shift + L → Align Left
          'Mod-Shift-l': () => this.editor.commands.setTextAlign('left'),
          'Mod-Shift-e': () => this.editor.commands.setTextAlign('center'),
          'Mod-Shift-r': () => this.editor.commands.setTextAlign('right'),
          'Mod-Shift-j': () => this.editor.commands.setTextAlign('justify'),
        }
      },
    })

    const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextAlignWithShortcuts.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[500px] p-4 focus:outline-none editor-focusable',
      },
    },
    onUpdate: ({ editor }) => onContentChange?.(editor.getHTML()),
  });

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return { 
        isBold: false, 
        isItalic: false,
        isAlignLeft: false,
        isAlignCenter: false,
        isAlignRight: false,
        isAlignJustify: false,
      };
      return {
        isBold: ctx.editor.isActive('bold'),
        isItalic: ctx.editor.isActive('italic'),
        isAlignLeft: ctx.editor.isActive({ textAlign: 'left' }),
        isAlignCenter: ctx.editor.isActive({ textAlign: 'center' }),
        isAlignRight: ctx.editor.isActive({ textAlign: 'right' }),
        isAlignJustify: ctx.editor.isActive({ textAlign: 'justify' }),
      };
    },
  });

  const ToolbarButton = ({ 
    onClick,
    children,
    title,
    isActive = false
  }: { 
    onClick: () => void;
    children: React.ReactNode;
    title: string;
    isActive?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded transition-colors ${
        isActive 
          ? 'bg-purple-600 text-white hover:bg-purple-700'
          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  const Separator = () => (
    <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-2" />
  );

  return (
    <div className="w-full h-screen flex flex-col bg-white dark:bg-gray-900">
      
      {/* Toolbar */}
      <div className="border-b border-gray-300 dark:border-gray-700 p-2 bg-gray-100 dark:bg-gray-800">
        <div className="flex gap-2 items-center">
          
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            title="Bold (Ctrl + B)"
            isActive={editorState?.isBold ?? false}   // ← Fixed!
          >
            <strong>B</strong>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl + I)"
            isActive={editorState?.isItalic ?? false}
          >
            <em>I</em>
          </ToolbarButton>

          <Separator />

          {/* Text Alignment */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            title="Align Left (Ctrl + Shift + L)"
            isActive={editorState?.isAlignLeft ?? false}
          >
            <FaAlignLeft />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            title="Align Center (Ctrl + Shift + E)"
            isActive={editorState?.isAlignCenter ?? false}
          >
            <FaAlignCenter />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            title="Align Right (Ctrl + Shift + R)"
            isActive={editorState?.isAlignRight ?? false}
          >
            <FaAlignRight />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
            title="Align Justify (Ctrl + Shift + J)"
            isActive={editorState?.isAlignJustify ?? false}
          >
            <FaAlignJustify />
          </ToolbarButton>

        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

    </div>
  );
};

export default MainEditor;