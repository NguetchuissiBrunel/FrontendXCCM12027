'use client';
import toast from 'react-hot-toast';
import './tiptap-editor.css';

import React, { useRef, useState } from 'react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
// import Image from '@tiptap/extension-image'; // Replaced by ResizableImage
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import FontFamily from '@tiptap/extension-font-family';
import { Fragment, Slice, Node as PMNode, Schema } from '@tiptap/pm/model';
import { QuickExerciseModal, QuestionData } from './QuickExerciseModal';
import { QuestionType } from '@/types/exercise';
// Custom XCCM Hierarchy Nodes
import Heading from '../../extensions/Heading';
import ResizableImage from '../../extensions/ResizableImage';
import Section from '../../extensions/Section';
import Chapitre from '../../extensions/Chapitre';
import Paragraphe from '../../extensions/Paragraphe';
import Notion from '../../extensions/Notion';
import Exercice from '../../extensions/Exercice';
import MathNode from '../../extensions/Math';
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
  FaHighlighter,
  FaSearchPlus,
  FaSearchMinus,
  FaExpand
} from 'react-icons/fa';
import { Sigma } from 'lucide-react';

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

const itemTypeFrench: Record<string, string> = {
  course: 'Cours',
  section: 'Partie',
  chapter: 'Chapitre',
  paragraph: 'Paragraphe',
  notion: 'Notion',
  exercise: 'Exercice'
};

const nodeTypeFrench: Record<string, string> = {
  heading: 'Titre de cours',
  section: 'Partie',
  chapitre: 'Chapitre',
  paragraphe: 'Paragraphe',
  notion: 'Notion',
  exercice: 'Exercice'
};

export interface MainEditorRef {
  handleTOCAction: (action: 'rename' | 'delete' | 'move' | 'duplicate' | 'paste', itemId: string, payload?: string | { targetId: string, position: 'before' | 'after' | 'inside' } | any) => void;
}

let globalIdCounter = 0;

/**
 * Recursively clones a node and all its children, assigning new unique IDs.
 * Use this when pasting or dropping content to avoid React key collisions.
 */
const regenerateIds = (node: PMNode): PMNode => {
  if (node.isText) {
    return node;
  }

  const children: PMNode[] = [];
  node.content.forEach(child => {
    children.push(regenerateIds(child));
  });

  const attrs = { ...node.attrs };
  if (attrs.id !== undefined) {
    // Combine timestamp, session counter, and a UUID/long random string for absolute uniqueness
    const timestamp = Date.now();
    const sessionIdx = ++globalIdCounter;
    const entropy = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().split('-')[0] // Short UUID part
      : Math.random().toString(36).substring(2, 11);

    attrs.id = `${node.type.name}-${timestamp}-${sessionIdx}-${entropy}`;
  }

  return node.type.create(attrs, Fragment.fromArray(children), node.marks);
};

const typeMap: Record<string, string> = {
  course: 'heading',
  section: 'section',
  chapter: 'chapitre',
  paragraph: 'paragraphe',
  notion: 'notion',
  exercise: 'exercice'
};

/**
 * Converts a TOC item (JSON) into a TipTap node JSON.
 * This is used for both Drag & Drop and TOC Paste.
 */
const transformTOCItemToNodeJson = (item: any): any => {
  const nodeType = typeMap[item.type] || 'paragraph';

  const attrs: any = {
    id: `tmp-${Math.random().toString(36).substr(2, 5)}`,
    title: item.title || item.data?.title || 'Sans titre',
  };

  if (item.type === 'course') {
    attrs.level = 1;
    return {
      type: 'heading',
      attrs,
      content: [{ type: 'text', text: attrs.title }]
    };
  }

  let content: any[] = [];

  // Notion content restoration
  if (item.type === 'notion') {
    content.push({ type: 'paragraph', content: [{ type: 'text', text: attrs.title }] });
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

  // Exercise content restoration
  if (item.type === 'exercise' && item.data?.questions) {
    const questionsText = item.data.questions
      .map((q: any, i: number) => `${i + 1}. ${q.question}`)
      .join('\n\n');
    content = [{ type: 'paragraph', content: [{ type: 'text', text: questionsText }] }];
  }

  return {
    type: nodeType,
    attrs,
    content: [...content, ...(item.children || []).map(transformTOCItemToNodeJson)]
  };
};

import Document from '@tiptap/extension-document';

const CustomDocument = Document.extend({
  content: '(heading | section)+',
});

export const MainEditor = React.forwardRef<MainEditorRef, MainEditorProps>(({
  initialContent,
  onContentChange,
  onEditorReady
}, ref) => {
  const [zoom, setZoom] = useState(100);
  const [showQuickExerciseModal, setShowQuickExerciseModal] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoom(100);

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

  React.useImperativeHandle(ref, () => ({
    handleTOCAction: (action: 'rename' | 'delete' | 'move' | 'duplicate' | 'paste', itemId: string, payload?: any) => {
      if (!editor) return;

      if (action === 'rename' && typeof payload === 'string') {
        const newTitle = payload;
        editor.state.doc.descendants((node: PMNode, pos: number) => {
          if (node.attrs.id === itemId) {
            if (node.attrs.title !== undefined) {
              editor.view.dispatch(editor.state.tr.setNodeAttribute(pos, 'title', newTitle));
              return false;
            }
          }
        });
      } else if (action === 'delete') {
        editor.state.doc.descendants((node: PMNode, pos: number) => {
          if (node.attrs.id === itemId) {
            editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize));
            return false;
          }
        });
      } else if (action === 'duplicate') {
        editor.state.doc.descendants((node: PMNode, pos: number) => {
          if (node.attrs.id === itemId) {
            const newNode = regenerateIds(node);
            const finalAttrs = { ...newNode.attrs };
            let finalContent = newNode.content;

            if (finalAttrs.title) {
              finalAttrs.title = `${finalAttrs.title} (copie)`;
            }

            // If it's a heading (Course), we need to update the text content as well
            if (newNode.type.name === 'heading') {
              const text = newNode.textContent;
              finalContent = (editor.state.schema as any).Fragment.fromArray([
                editor.state.schema.text(`${text} (copie)`)
              ]);
            }

            const finalNode = newNode.type.create(finalAttrs, finalContent, newNode.marks);
            editor.view.dispatch(editor.state.tr.insert(pos + node.nodeSize, finalNode));
            return false;
          }
        });
      } else if (action === 'move' && typeof payload === 'object') {
        const { targetId, position } = payload as { targetId: string, position: 'before' | 'after' | 'inside' };
        let sourcePos: number | null = null;
        let sourceNode: PMNode | null = null;
        let targetPos: number | null = null;
        let targetNode: PMNode | null = null;

        editor.state.doc.descendants((node: PMNode, pos: number) => {
          if (node.attrs.id === itemId) {
            sourcePos = pos;
            sourceNode = node;
          }
          if (node.attrs.id === targetId) {
            targetPos = pos;
            targetNode = node;
          }
        });

        if (sourcePos !== null && targetPos !== null && sourceNode && targetNode) {
          const tr = editor.state.tr;
          tr.delete(sourcePos, sourcePos + (sourceNode as PMNode).nodeSize);
          let adjustedTargetPos = targetPos as number;
          if (sourcePos < (targetPos as number)) adjustedTargetPos -= (sourceNode as PMNode).nodeSize;

          let insertPos = adjustedTargetPos;
          if (position === 'after') insertPos = adjustedTargetPos + (targetNode as PMNode).nodeSize;
          else if (position === 'inside') insertPos = adjustedTargetPos + (targetNode as PMNode).nodeSize - 1;

          tr.insert(insertPos, sourceNode);
          editor.view.dispatch(tr);
        }
      } else if (action === 'paste') {
        const itemToPaste = payload;
        editor.state.doc.descendants((node: PMNode, pos: number) => {
          if (node.attrs.id === itemId) {
            const interimNode = editor.state.schema.nodeFromJSON(transformTOCItemToNodeJson(itemToPaste));
            const finalNode = regenerateIds(interimNode);

            // Smart insertion for TOC paste
            let $pos = editor.state.doc.resolve(pos + node.nodeSize - 1); // End of target node
            let insertPos = pos + node.nodeSize - 1;

            let targetDepth = -1;
            for (let d = $pos.depth; d >= 0; d--) {
              const parent = $pos.node(d);
              const index = $pos.index(d);
              if (parent.canReplaceWith(index, index, finalNode.type)) {
                targetDepth = d;
                break;
              }
            }

            if (targetDepth !== -1) {
              if (targetDepth < $pos.depth) {
                insertPos = $pos.after(targetDepth + 1);
              }
              editor.view.dispatch(editor.state.tr.insert(insertPos, finalNode));
            } else {
              // Append anyway if targetDepth is -1 (shouldn't happen with valid schema)
              editor.view.dispatch(editor.state.tr.insert(pos + node.nodeSize - 1, finalNode));
            }
            return false;
          }
        });
      }
    }
  }));
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      CustomDocument,
      StarterKit.configure({
        document: false,
        heading: false, // Disable default heading to use our custom one
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Dropcursor.configure({
        color: '#a78bfa', // Purple to match your theme
        width: 3,
      }),
      Gapcursor,
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
      ResizableImage,
      Link.configure({
        openOnClick: false,
      }),
      Section,
      Chapitre,
      Paragraphe,
      Notion,
      Exercice,
      MathNode,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none editor-focusable',
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

          const coords = { left: event.clientX, top: event.clientY };
          const posResult = view.posAtCoords(coords);
          if (!posResult) return false;

          if (draggedItem.type === 'course') {
            // Flatten logic for Course: Heading -> Siblings
            const courseHeadingJson = transformTOCItemToNodeJson(draggedItem);
            const courseHeading = view.state.schema.nodeFromJSON(courseHeadingJson);

            const childrenNodes = (draggedItem.children || []).map((child: any) => {
              return view.state.schema.nodeFromJSON(transformTOCItemToNodeJson(child));
            });

            const nodesToInsert = [courseHeading, ...childrenNodes].map(n => regenerateIds(n));

            // Insert all nodes sequentially
            let currentPos = posResult.pos;
            const tr = view.state.tr;
            nodesToInsert.forEach(node => {
              tr.insert(currentPos, node);
              currentPos += node.nodeSize;
            });
            view.dispatch(tr);
          } else {
            // Standard nested insertion for other types
            const contentToInsertJson = transformTOCItemToNodeJson(draggedItem);
            const node = view.state.schema.nodeFromJSON(contentToInsertJson);
            const finalNode = regenerateIds(node);

            // Smart insertion: find the nearest depth that accepts this node type
            // This prevents splitting parents that shouldn't be split (e.g. dropping chapter between notions)
            let $pos = view.state.doc.resolve(posResult.pos);
            let insertPos = posResult.pos;

            // Check if current position allows this node. If not, move up.
            // We start from the deepest level and work our way up.
            let targetDepth = -1;
            for (let d = $pos.depth; d >= 0; d--) {
              const parent = $pos.node(d);
              const index = $pos.index(d);
              if (parent.canReplaceWith(index, index, finalNode.type)) {
                targetDepth = d;
                break;
              }
            }

            if (targetDepth !== -1) {
              // If we are moving up, we usually want to insert after the current node at that depth
              // to avoid splitting the child we were originally inside.
              if (targetDepth < $pos.depth) {
                insertPos = $pos.after(targetDepth + 1);
              }
              view.dispatch(view.state.tr.insert(insertPos, finalNode));
            } else {
              // Last resort: let Prosemirror try to handle it (might split or fail)
              view.dispatch(view.state.tr.insert(posResult.pos, finalNode));
            }
          }

          return true;
        } catch (error) {
          console.error('Drop error:', error);
          return false;
        }
      },
      transformPasted: (slice) => {
        const nodes: PMNode[] = [];
        slice.content.forEach(node => {
          nodes.push(regenerateIds(node));
        });
        return new Slice(Fragment.fromArray(nodes), slice.openStart, slice.openEnd);
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

  const smartInsertNode = (type: string, attrs: any = {}) => {
    if (!editor) return;
    const { state, view } = editor;
    const { schema, tr, selection } = state;
    const nodeType = schema.nodes[type];
    if (!nodeType) return;

    // Standard title if not provided
    const finalAttrs = { ...attrs };
    if (!finalAttrs.id) {
      const timestamp = Date.now();
      const sessionIdx = ++globalIdCounter;
      const entropy = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().split('-')[0]
        : Math.random().toString(36).substring(2, 11);
      finalAttrs.id = `${type}-${timestamp}-${sessionIdx}-${entropy}`;
    }

    if (!finalAttrs.title && type !== 'heading') {
      finalAttrs.title = nodeTypeFrench[type] || 'Sans titre';
    }

    // Special case for Course (heading level 1)
    if (type === 'heading') {
      const node = nodeType.createAndFill({ ...finalAttrs, level: 1 }, schema.text(finalAttrs.title || 'Nouveau Cours'));
      if (node) {
        view.dispatch(tr.replaceSelectionWith(node).scrollIntoView());
      }
      return;
    }

    const node = nodeType.createAndFill(finalAttrs);
    if (!node) return;

    const $pos = selection.$from;
    let targetDepth = -1;

    // Look for a depth that accepts this node type
    for (let d = $pos.depth; d >= 0; d--) {
      const parent = $pos.node(d);
      const index = $pos.index(d);
      if (parent.canReplaceWith(index, index, nodeType)) {
        targetDepth = d;
        break;
      }
    }

    if (targetDepth !== -1) {
      let insertPos = selection.from;
      // If we are nested too deep, insert after the current node at the target depth
      if (targetDepth < $pos.depth) {
        insertPos = $pos.after(targetDepth + 1);
      }
      view.dispatch(tr.insert(insertPos, node).scrollIntoView());
    } else {
      // Fallback: standard Tiptap insertion which might split (but usually schema forbids it now)
      editor.chain().focus().insertContent(node.toJSON()).run();
    }
  };

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

  const handleCreateQuickExercise = (data: { title: string; type: QuestionType; questions: QuestionData[] }) => {
    if (!editor) return;

    const { title, type, questions } = data;

    // Formatting the exercise content as TipTap nodes
    const questionsItems = questions.map((q) => {
      const itemContent: any[] = [
        {
          type: 'paragraph',
          content: [{
            type: 'text',
            text: q.text,
            marks: [{ type: 'bold' }] // Bold the question text
          }]
        }
      ];

      // If MCQ, add the options as an ordered list (for alpha numbering a, b, c...)
      if (type === 'MULTIPLE_CHOICE' && q.options && q.options.length > 0) {
        itemContent.push({
          type: 'orderedList',
          content: q.options.filter((opt: string) => opt.trim() !== '').map((opt: string) => ({
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: opt }]
            }]
          }))
        });
      }

      return {
        type: 'listItem',
        content: itemContent
      };
    });

    const exerciseNode = {
      type: 'exercice',
      attrs: {
        id: `exercice-${Date.now()}`,
        title: title,
      },
      content: [{
        type: 'orderedList',
        content: questionsItems
      }]
    };

    editor.chain().focus().insertContent(exerciseNode).run();
  };

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
        smartInsertNode('section');
      } else if (value === 'chapitre') {
        smartInsertNode('chapitre');
      } else if (value === 'paragraphe') {
        smartInsertNode('paragraphe');
      } else if (value === 'notion') {
        smartInsertNode('notion');
      } else if (value === 'exercice') {
        smartInsertNode('exercice');
      } else if (typeof value === 'number' && value === 1) {
        smartInsertNode('heading', { level: 1 });
      } else if (typeof value === 'number') {
        editor?.chain().focus().toggleHeading({ level: value as any }).run();
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
      <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900">

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
                  suppressHydrationWarning
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
                  suppressHydrationWarning
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
              suppressHydrationWarning
            />

            <ToolbarButton
              onClick={() => imageInputRef.current?.click()}
              title="Insert Image"
              isActive={false}
            >
              <FaImage />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor?.chain().focus().setMath().run()}
              title="Insérer Équation (Math)"
              isActive={editor?.isActive('math')}
            >
              <div className="flex items-center gap-1">
                <Sigma size={16} />
                <span className="text-xs font-bold hidden xl:inline">Équation</span>
              </div>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => setShowQuickExerciseModal(true)}
              title="Créer un Exercice Rapide"
              isActive={false}
            >
              <div className="flex items-center gap-1">
                <FaListOl size={16} />
                <span className="text-xs font-bold hidden xl:inline">Exercice</span>
              </div>
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
        <div className="flex-1 p-8 overflow-auto bg-gray-100 dark:bg-gray-900 flex justify-center items-start">
          <div
            className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 origin-top"
            style={{
              width: `${21 * (zoom / 100)}cm`,
              minHeight: `${29.7 * (zoom / 100)}cm`,
              fontFamily: 'Arial, sans-serif',
              transform: `scale(1)`
            }}
            onClick={() => editor?.chain().focus().run()}
          >
            <div style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              width: '21cm',
              height: 'auto'
            }}>
              <EditorContent editor={editor} className="min-h-[29.7cm] p-8 outline-none" />
            </div>
          </div>
        </div>
        {/* Status Bar - Zoom & Info */}
        <div className="h-10 flex-none bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="font-medium">XCCM Editor</span>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
            <span>A4 Layout</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleZoomOut}
                className="hover:text-purple-600 transition-colors"
              >
                <FaSearchMinus size={14} />
              </button>

              <input
                type="range"
                min="50"
                max="200"
                step="5"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />

              <button
                type="button"
                onClick={handleZoomIn}
                className="hover:text-purple-600 transition-colors"
              >
                <FaSearchPlus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleZoomReset}
              className="min-w-[45px] font-bold hover:text-purple-600 transition-colors text-right"
              title="Reset Zoom (100%)"
            >
              {zoom}%
            </button>
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
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
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

      <QuickExerciseModal
        isOpen={showQuickExerciseModal}
        onClose={() => setShowQuickExerciseModal(false)}
        onSave={handleCreateQuickExercise}
      />
    </>
  );
});

export default MainEditor;
