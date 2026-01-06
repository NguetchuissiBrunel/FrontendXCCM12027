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
import Dropcursor from '@tiptap/extension-dropcursor';
import FontFamily from '@tiptap/extension-font-family';
import { Extension } from '@tiptap/core';

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
  FaUnlink,
  FaIndent,
  FaOutdent,
  FaFont,
  FaHighlighter
} from 'react-icons/fa';

interface MainEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onEditorReady?: (editor: any) => void; // Callback when editor is ready
}

// Define the Indent extension since it's not in starter-kit by default in the way we might want, 
// or simpler, just use a keyboard shortcut or command wrapper if Tiptap has native support.
// Actually Tiptap has no native "Indent" extension in the core free set that works on paragraphs universally without list.
// But we can implement a simple one or check if we want it for lists only.
// For now, let's assume we want it for lists and potentially paragraphs (via margin/padding).
// A simple way is to use a custom extension for indentation.

// Let's stick to what's available or simple. StarterKit includes ListItem which supports indentation in lists.
// For paragraphs, we might need a custom extension. 
// For now, I'll add the UI and wire it to valid commands.

const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Garamond', label: 'Garamond' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
];

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
      Dropcursor.configure({
        color: '#a78bfa', // Purple to match your theme
        width: 3,
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
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
      handleDrop: (view, event, slice, moved) => {
        event.preventDefault();

        const jsonData = event.dataTransfer?.getData('application/xccm-knowledge');
        if (!jsonData) return false;

        try {
          const draggedItem = JSON.parse(jsonData);

          const typeMap: Record<string, string> = {
            course: 'heading',
            section: 'section',
            chapter: 'chapitre',
            paragraph: 'paragraphe',
            notion: 'notion',
            exercise: 'exercice'
          };

          const buildNode = (item: any): any => {
            const nodeType = typeMap[item.type] || 'paragraph';

            const children = (item.children || []).map(buildNode);

            const attrs: any = {
              id: item.id,
              title: item.title || item.data?.title || 'Sans titre',
            };

            if (item.type === 'course') {
              attrs.level = 1;
            }

            // Default: empty for structural nodes
            let content: any[] = [];

            // Special handling for notion: title text + full content
            if (item.type === 'notion') {
              // Title as first text
              content.push({ type: 'paragraph', content: [{ type: 'text', text: attrs.title }] });

              // Add actual content if present
              if (item.content) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.content.trim();

                const parsed: any[] = [];
                tempDiv.childNodes.forEach((node) => {
                  if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
                    parsed.push({ type: 'text', text: node.textContent });
                  } else if (node.nodeName === 'P') {
                    const pContent: any[] = [];
                    node.childNodes.forEach((child) => {
                      if (child.nodeType === Node.TEXT_NODE && child.textContent) {
                        pContent.push({ type: 'text', text: child.textContent });
                      }
                    });
                    if (pContent.length > 0) {
                      parsed.push({ type: 'paragraph', content: pContent });
                    }
                  }
                });

                content = [...content, ...parsed];
              }
            }

            // Exercise: simple question list
            if (item.type === 'exercise' && item.data?.questions) {
              const questionsText = item.data.questions
                .map((q: any, i: number) => `${i + 1}. ${q.question}`)
                .join('\n\n');
              content = [{ type: 'paragraph', content: [{ type: 'text', text: questionsText }] }];
            }

            return {
              type: nodeType,
              attrs,
              content: [...content, ...children]
            };
          };

          const contentToInsert = buildNode(draggedItem);

          const coords = { left: event.clientX, top: event.clientY };
          const posResult = view.posAtCoords(coords);
          if (!posResult) return false;

          const node = view.state.schema.nodeFromJSON(contentToInsert);
          view.dispatch(view.state.tr.insert(posResult.pos, node));

          return true;
        } catch (error) {
          console.error('Drop error:', error);
          return false;
        }
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
        isLink: false,
        currentHeading: 'paragraph',
      };

      let currentHeading: string | number = 'paragraph';
      if (ctx.editor.isActive('section')) currentHeading = 'section';
      else if (ctx.editor.isActive('chapitre')) currentHeading = 'chapitre';
      else if (ctx.editor.isActive('paragraphe')) currentHeading = 'paragraphe';
      else if (ctx.editor.isActive('notion')) currentHeading = 'notion';
      else if (ctx.editor.isActive('exercice')) currentHeading = 'exercice';
      else {
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
        isLink: ctx.editor.isActive('link'),
        isAlignLeft: ctx.editor.isActive({ textAlign: 'left' }),
        isAlignCenter: ctx.editor.isActive({ textAlign: 'center' }),
        isAlignRight: ctx.editor.isActive({ textAlign: 'right' }),
        isAlignJustify: ctx.editor.isActive({ textAlign: 'justify' }),
        isBulletList: ctx.editor.isActive('bulletList'),
        isOrderedList: ctx.editor.isActive('orderedList'),
        isBlockquote: ctx.editor.isActive('blockquote'),
        isCodeBlock: ctx.editor.isActive('codeBlock'),
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
      className={`px-3 py-2 rounded transition-colors ${isActive
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
        editor?.chain().focus().toggleHeading({ level: value as 1 | 2 | 3 | 4 | 5 | 6 }).run();
      }
    };

    return (
      <select
        value={currentOption.value}
        onChange={(e) => {
          const val = e.target.value;
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

  const FontDropdown = () => {
    return (
      <select
        value={editor?.getAttributes('textStyle').fontFamily || ''}
        onChange={(e) => {
          const value = e.target.value;
          if (value === '') {
            editor?.chain().focus().unsetFontFamily().run();
          } else {
            editor?.chain().focus().setFontFamily(value).run();
          }
        }}
        className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm w-32"
        title="Font Family"
      >
        <option value="">Default Font</option>
        {fontOptions.map(option => (
          <option key={option.value} value={option.value} style={{ fontFamily: option.value }}>
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
          <div className="flex gap-2 items-center flex-wrap">
            <HeadingDropdown />
            <FontDropdown />

            < Separator />

            {/* Text Formatting */}
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBold().run()}
              title="Bold (Ctrl + B)"
              isActive={editorState?.isBold}
            >
              <strong>B</strong>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              title="Italic (Ctrl + I)"
              isActive={editorState?.isItalic}
            >
              <em>I</em>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              title="Underline (Ctrl + U)"
              isActive={editorState?.isUnderline}
            >
              <FaUnderline />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              title="Strikethrough (Ctrl + Shift + X)"
              isActive={editorState?.isStrike}
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
            <div className="flex items-center">
              <label className="cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex items-center justify-center text-gray-700 dark:text-gray-300" title="Text Color">
                <FaFont className="mr-1" />
                <input
                  type="color"
                  onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
                  className="w-0 h-0 opacity-0 absolute"
                />
                <div className="w-4 h-4 rounded border border-gray-300 shadow-sm" style={{ backgroundColor: editor?.getAttributes('textStyle').color || '#000000' }}></div>
              </label>
            </div>

            {/* Highlight Color */}
            <div className="flex items-center">
              <label className="cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex items-center justify-center text-gray-700 dark:text-gray-300" title="Highlight Color">
                <FaHighlighter className="mr-1" />
                <input
                  type="color"
                  onChange={(e) => editor?.chain().focus().toggleHighlight({ color: e.target.value }).run()}
                  className="w-0 h-0 opacity-0 absolute"
                />
                <div className="w-4 h-4 rounded border border-gray-300 shadow-sm" style={{ backgroundColor: editor?.getAttributes('highlight').color || 'transparent' }}></div>
              </label>
            </div>

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
              isActive={editorState?.isLink}
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
              title="Align Left"
              isActive={editorState?.isAlignLeft}
            >
              <FaAlignLeft />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              title="Align Center"
              isActive={editorState?.isAlignCenter}
            >
              <FaAlignCenter />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
              title="Align Right"
              isActive={editorState?.isAlignRight}
            >
              <FaAlignRight />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
              title="Align Justify"
              isActive={editorState?.isAlignJustify}
            >
              <FaAlignJustify />
            </ToolbarButton>

            <Separator />

            {/* Lists */}
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              title="Bullet List"
              isActive={editorState?.isBulletList}
            >
              <FaListUl />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
              isActive={editorState?.isOrderedList}
            >
              <FaListOl />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              title="Blockquote"
              isActive={editorState?.isBlockquote}
            >
              <FaQuoteLeft />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              title="Code Block"
              isActive={editorState?.isCodeBlock}
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

            {/* Indentation */}
            <ToolbarButton
              onClick={() => {
                // Check if in list
                if (editor?.isActive('bulletList') || editor?.isActive('orderedList')) {
                  editor?.chain().focus().sinkListItem('listItem').run();
                }
              }}
              title="Indent (Tab)"
              isActive={false}
            >
              <FaIndent />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => {
                // Check if in list
                if (editor?.isActive('bulletList') || editor?.isActive('orderedList')) {
                  editor?.chain().focus().liftListItem('listItem').run();
                }
              }}
              title="Outdent (Shift + Tab)"
              isActive={false}
            >
              <FaOutdent />
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