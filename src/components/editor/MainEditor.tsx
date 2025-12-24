'use client';

import React, { useRef, useState } from 'react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';

// Custom XCCM Hierarchy Nodes
import Section from '../../extensions/Section';
import Chapitre from '../../extensions/Chapitre';
import Paragraphe from '../../extensions/Paragraphe';
import Notion from '../../extensions/Notion';
import Exercice from '../../extensions/Exercice';
import { 
  FaAlignLeft, 
  FaAlignCenter, 
  FaAlignRight, 
  FaAlignJustify,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaUnderline,
  FaStrikethrough,
  FaUndo,
  FaRedo,
  FaCode,
  FaMinus,
  FaRemoveFormat,
  FaImage,
  FaLink,
  FaUnlink
} from 'react-icons/fa';

interface MainEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onEditorReady?: (editor: any) => void; // Callback when editor is ready
}

const headingOptions = [
  { value: 'paragraph', label: 'Normal Text', color: '#000000' },
  { value: 1, label: 'Cours', color: '#3B82F6' },  // Blue - H1 (kept as heading)
  { value: 'section', label: 'Section', color: '#8B5CF6' },  // Purple - Custom Node
  { value: 'chapitre', label: 'Chapitre', color: '#10B981' },  // Green - Custom Node
  { value: 'paragraphe', label: 'Paragraphe', color: '#F59E0B' },  // Orange - Custom Node
  { value: 'notion', label: 'Notion', color: '#EF4444' },  // Red - Custom Node
  { value: 'exercice', label: 'Exercice', color: '#6366F1' },  // Indigo - Custom Node
];

export const MainEditor: React.FC<MainEditorProps> = ({ 
  initialContent, 
  onContentChange,
  onEditorReady 
}) => {
  
  const TextAlignWithShortcuts = TextAlign.extend({
    addKeyboardShortcuts() {
      return {
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
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Section,
      Chapitre,
      Paragraphe,
      Notion,
      Exercice,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[500px] p-4 focus:outline-none editor-focusable',
      },
    },
    onCreate: ({ editor }) => {
      // Notify parent component that editor is ready
      onEditorReady?.(editor);
    },
    onUpdate: ({ editor }) => onContentChange?.(editor.getHTML()),
  });

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return { 
        isBold: false, 
        isItalic: false,
        isUnderline: false,
        isStrike: false,
        isAlignLeft: false,
        isAlignCenter: false,
        isAlignRight: false,
        isAlignJustify: false,
        isBulletList: false,
        isOrderedList: false,
        isBlockquote: false,
        currentHeading: 'paragraph',
      };

      let currentHeading: string | number = 'paragraph';
      
      // Check for custom XCCM nodes first
      if (ctx.editor.isActive('section')) {
        currentHeading = 'section';
      } else if (ctx.editor.isActive('chapitre')) {
        currentHeading = 'chapitre';
      } else if (ctx.editor.isActive('paragraphe')) {
        currentHeading = 'paragraphe';
      } else if (ctx.editor.isActive('notion')) {
        currentHeading = 'notion';
      } else if (ctx.editor.isActive('exercice')) {
        currentHeading = 'exercice';
      } else {
        // Check for standard headings (H1-H6)
        for (let level = 1; level <= 6; level++) {
          if (ctx.editor.isActive('heading', { level })) {
            currentHeading = level;
            break;
          }
        }
      }

      return {
        isBold: ctx.editor.isActive('bold'),
        isItalic: ctx.editor.isActive('italic'),
        isUnderline: ctx.editor.isActive('underline'),
        isStrike: ctx.editor.isActive('strike'),
        isAlignLeft: ctx.editor.isActive({ textAlign: 'left' }),
        isAlignCenter: ctx.editor.isActive({ textAlign: 'center' }),
        isAlignRight: ctx.editor.isActive({ textAlign: 'right' }),
        isAlignJustify: ctx.editor.isActive({ textAlign: 'justify' }),
        isBulletList: ctx.editor.isActive('bulletList'),
        isOrderedList: ctx.editor.isActive('orderedList'),
        isBlockquote: ctx.editor.isActive('blockquote'),
        isCodeBlock: ctx.editor.isActive('codeBlock'),
        isLink: ctx.editor.isActive('link'),  
        currentHeading,
      };
    },
  });

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        editor?.chain().focus().setImage({ src: url }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

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

  const HeadingDropdown = () => {
    const currentOption = headingOptions.find(
      opt => opt.value === editorState?.currentHeading
    ) || headingOptions[0];

    const handleChange = (value: string | number) => {
      if (value === 'paragraph') {
        editor?.chain().focus().setParagraph().run();
      } else if (value === 'section') {
        editor?.chain().focus().setSection().run();
      } else if (value === 'chapitre') {
        editor?.chain().focus().setChapitre().run();
      } else if (value === 'paragraphe') {
        editor?.chain().focus().setParagraphe().run();
      } else if (value === 'notion') {
        editor?.chain().focus().setNotion().run();
      } else if (value === 'exercice') {
        editor?.chain().focus().setExercice().run();
      } else if (typeof value === 'number') {
        // Standard heading (H1 for Cours)
        editor?.chain().focus().toggleHeading({ level: value as 1 | 2 | 3 | 4 | 5 | 6 }).run();
      }
    };

    return (
      <select
        value={currentOption.value}
        onChange={(e) => {
          const val = e.target.value;
          // Parse as number if it's numeric, otherwise keep as string
          const parsedVal = !isNaN(Number(val)) ? parseInt(val) : val;
          handleChange(parsedVal);
        }}
        className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
        style={{ color: currentOption.color }}
      >
        {headingOptions.map(option => (
          <option 
            key={option.value} 
            value={option.value}
            style={{ color: option.color }}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  return (
    <>
      <div className="w-full h-screen flex flex-col bg-white dark:bg-gray-900">
        
        {/* Toolbar */}
        <div className="border-b border-gray-300 dark:border-gray-700 p-2 bg-gray-100 dark:bg-gray-800">
          <div className="flex gap-2 items-center">
            <HeadingDropdown/>
            
            < Separator/>

            {/* Text Formatting */}
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBold().run()}
              title="Bold (Ctrl + B)"
              isActive={editorState?.isBold ?? false}
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

            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              title="Underline (Ctrl + U)"
              isActive={editorState?.isUnderline ?? false}
            >
              <FaUnderline />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              title="Strikethrough (Ctrl + Shift + X)"
              isActive={editorState?.isStrike ?? false}
            >
              <FaStrikethrough />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
              title="Clear Formatting"
              isActive={false}
            >
              <FaRemoveFormat />
            </ToolbarButton>

            <Separator />

            {/* Text Color */}
            <input
              type="color"
              onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
              title="Text Color"
              className="w-10 h-9 rounded cursor-pointer"
            />

            {/* Highlight Color */}
            <input
              type="color"
              onChange={(e) => editor?.chain().focus().toggleHighlight({ color: e.target.value }).run()}
              title="Highlight Color"
              className="w-10 h-9 rounded cursor-pointer"
            />

            <Separator />

            {/* Image Upload */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <ToolbarButton
              onClick={() => imageInputRef.current?.click()}
              title="Insert Image"
              isActive={false}
            >
              <FaImage />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => {
                const previousUrl = editor?.getAttributes('link').href;
                setLinkUrl(previousUrl || '');
                setShowLinkModal(true);
              }}
              title="Insert Link"
              isActive={editorState?.isLink ?? false}
            >
              <FaLink />
            </ToolbarButton>

            {editor?.isActive('link') && (
              <ToolbarButton
                onClick={() => editor?.chain().focus().unsetLink().run()}
                title="Remove Link"
                isActive={false}
              >
                <FaUnlink />
              </ToolbarButton>
            )}

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

            <Separator />

            {/* Lists */}
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              title="Bullet List (Ctrl + Shift + 8)"
              isActive={editorState?.isBulletList ?? false}
            >
              <FaListUl />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              title="Numbered List (Ctrl + Shift + 7)"
              isActive={editorState?.isOrderedList ?? false}
            >
              <FaListOl />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              title="Blockquote (Ctrl + Shift + B)"
              isActive={editorState?.isBlockquote ?? false}
            >
              <FaQuoteLeft />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              title="Code Block (Ctrl + Alt + C)"
              isActive={editorState?.isCodeBlock ?? false}
            >
              <FaCode />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
              isActive={false}
            >
              <FaMinus />
            </ToolbarButton>

            <Separator />

            {/* History */}
            <ToolbarButton
              onClick={() => editor?.chain().focus().undo().run()}
              title="Undo (Ctrl + Z)"
              isActive={false}
            >
              <FaUndo />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().redo().run()}
              title="Redo (Ctrl + Shift + Z)"
              isActive={false}
            >
              <FaRedo />
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
          {/* Link Modal */}
          {showLinkModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Insert Link</h3>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white mb-4"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowLinkModal(false)}
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (linkUrl) {
                        editor?.chain().focus().setLink({ href: linkUrl }).run();
                      }
                      setShowLinkModal(false);
                      setLinkUrl('');
                    }}
                    className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Insert
                  </button>
                </div>
              </div>
            </div>
          )}
    </>
  );
};

export default MainEditor;