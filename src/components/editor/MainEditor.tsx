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
import { XCCM_KNOWLEDGE_MIME } from '@/types/editor.types';
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
  children?: React.ReactNode;
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
  handleTOCAction: (action: 'rename' | 'delete' | 'move' | 'duplicate' | 'paste' | 'copy', itemId: string, payload?: string | { targetId: string, position: 'before' | 'after' | 'inside' } | any) => void;
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
    const timestamp = Date.now();
    const sessionIdx = ++globalIdCounter;
    const entropy = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().split('-')[0]
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

  // Extract attributes safely
  const attrs: any = {
    id: item.id || `tmp-${Math.random().toString(36).substr(2, 5)}`,
    title: item.title || item.data?.title || item.name || 'Sans titre',
  };

  // Restore introduction if present
  if (item.data?.introduction || item.introduction) {
    attrs.introduction = item.data?.introduction || item.introduction;
  }

  let content: any[] = [];

  // Notion-specific content handling
  if (item.type === 'notion') {
    // If we have plain text data, wrap it in a paragraph
    if (typeof item.data === 'string' && item.data.trim()) {
      content.push({ 
        type: 'paragraph', 
        content: [{ type: 'text', text: item.data }] 
      });
    } else if (typeof item.content === 'string' && item.content.trim()) {
      // Also check item.content as a fallback (used in buildDragPayload)
      // Check if it looks like HTML
      if (item.content.includes('<') && item.content.includes('>')) {
        const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : null;
        if (tempDiv) {
          tempDiv.innerHTML = item.content;
          const parsed: any[] = [];
          tempDiv.childNodes.forEach((node) => {
            if (node.nodeType === 3 && node.textContent?.trim()) {
              parsed.push({ type: 'paragraph', content: [{ type: 'text', text: node.textContent }] });
            } else if (node.nodeName === 'P') {
              const pContent: any[] = [];
              node.childNodes.forEach((child) => {
                if (child.nodeType === 3 && child.textContent) {
                  pContent.push({ type: 'text', text: child.textContent });
                }
              });
              if (pContent.length > 0) {
                parsed.push({ type: 'paragraph', content: pContent });
              }
            }
          });
          if (parsed.length > 0) content = [...content, ...parsed];
        }
      } else {
        // Plain text: wrap in paragraph
        content.push({ 
          type: 'paragraph', 
          content: [{ type: 'text', text: item.content }] 
        });
      }
    }
  }

  // Exercise-specific content handling
  if (item.type === 'exercise' && item.data?.questions) {
    const questionsText = (item.data.questions || [])
      .map((q: any, i: number) => `${i + 1}. ${q.text || q.question}`)
      .join('\n\n');
    content = [{ type: 'paragraph', content: [{ type: 'text', text: questionsText }] }];
  }

  // Recursively handle children
  const childNodes: any[] = [];
  if (item.children && Array.isArray(item.children)) {
    item.children.forEach((child: any) => {
      const result = transformTOCItemToNodeJson(child);
      if (Array.isArray(result)) {
        childNodes.push(...result);
      } else {
        childNodes.push(result);
      }
    });
  }

  return {
    type: nodeType,
    attrs,
    content: [...content, ...childNodes]
  };
};

import Document from '@tiptap/extension-document';

const CustomDocument = Document.extend({
  content: 'section*',
});

export const MainEditor = React.forwardRef<MainEditorRef, MainEditorProps>(({
  initialContent,
  onContentChange,
  onEditorReady,
  children
}, ref) => {
  const [zoom, setZoom] = useState(100);
  const [showQuickExerciseModal, setShowQuickExerciseModal] = useState(false);
  // Stores the ID of the node that triggered exercise creation (Section/Chapitre buttons)
  // null means: use cursor position (toolbar button)
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);

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

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      CustomDocument,
      StarterKit.configure({
        document: false,
        heading: false, // Disable default heading to use our custom one
        dropcursor: false,
        gapcursor: false,
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
    onUpdate: ({ editor, transaction }) => {
      // Don't trigger autosave or broadcast if the transaction came from a remote collaborator
      if (transaction.getMeta('isRemote')) return;

      onContentChange?.(editor.getHTML());

      const json = editor.getJSON();

      // Dispatch custom event for CollaborationSync to pick up
      window.dispatchEvent(new CustomEvent('xccm:editor-content-update', {
        detail: { json }
      }));
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none editor-focusable',
      },
      handleDrop: (view, event, slice, moved) => {
        event.preventDefault();

        const jsonData = event.dataTransfer?.getData(XCCM_KNOWLEDGE_MIME);
        if (!jsonData) return false;

        try {
          const draggedItem = JSON.parse(jsonData);

          const coords = { left: event.clientX, top: event.clientY };
          const posResult = view.posAtCoords(coords);
          if (!posResult) return false;

          if (draggedItem.type === 'course') {
            // Flatten logic for Course
            const children = draggedItem.children || [];
            const tr = view.state.tr;
            let currentPos = posResult.pos;

            children.forEach((child: any) => {
              const nodeJson = transformTOCItemToNodeJson(child);
              const nodes = Array.isArray(nodeJson) ? nodeJson : [nodeJson];
              nodes.forEach(nj => {
                const node = view.state.schema.nodeFromJSON(nj);
                const finalNode = regenerateIds(node);
                tr.insert(currentPos, finalNode);
                currentPos += finalNode.nodeSize;
              });
            });
            view.dispatch(tr);
          } else {
            const contentToInsertJson = transformTOCItemToNodeJson(draggedItem);
            const node = view.state.schema.nodeFromJSON(contentToInsertJson);
            const finalNode = regenerateIds(node);

            const $pos = view.state.doc.resolve(posResult.pos);
            let insertPos = posResult.pos;

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
              view.dispatch(view.state.tr.insert(insertPos, finalNode));
            } else {
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
      onEditorReady?.(editor);
    },
  });

  const copiedNodeJsonRef = useRef<any>(null);

  React.useImperativeHandle(ref, () => ({
    handleTOCAction: (action: 'rename' | 'delete' | 'move' | 'duplicate' | 'paste' | 'copy', itemId: string, payload?: any) => {
      if (!editor) return;

      if (action === 'rename' && typeof payload === 'string') {
        const newTitle = payload;
        editor.view.state.doc.descendants((node: PMNode, pos: number) => {
          if (node.attrs.id === itemId) {
            if (node.attrs.title !== undefined) {
              editor.view.dispatch(editor.state.tr.setNodeAttribute(pos, 'title', newTitle));
              return false;
            }
          }
        });
      } else if (action === 'delete') {
        let deleted = false;
        editor.view.state.doc.descendants((node: PMNode, pos: number) => {
          if (deleted) return false;
          if (node.attrs.id === itemId) {
            editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize));
            deleted = true;
            return false;
          }
        });

        // Hierarchical fallback match (e.g. "chapter-1-1-2")
        if (!deleted && itemId.includes('-')) {
          const hierarchyInfo: Record<string, { level: number, typeName: string }> = {
            course: { level: 0, typeName: 'heading' },
            section: { level: 1, typeName: 'section' },
            chapter: { level: 2, typeName: 'chapitre' },
            paragraph: { level: 3, typeName: 'paragraphe' },
            notion: { level: 4, typeName: 'notion' },
            exercise: { level: 5, typeName: 'exercice' }
          };

          const parts = itemId.split('-');
          const itemTypeCode = parts[0];
          const config = hierarchyInfo[itemTypeCode];

          if (config) {
            const counters = [0, 0, 0, 0, 0, 0];
            editor.view.state.doc.descendants((node: PMNode, pos: number) => {
              if (deleted) return false;

              const nodeConfig = Object.values(hierarchyInfo).find(c => c.typeName === node.type.name);
              if (nodeConfig) {
                const level = nodeConfig.level;
                counters[level]++;
                for (let i = level + 1; i < counters.length; i++) counters[i] = 0;

                const currentId = `${itemTypeCode}-${counters.slice(0, config.level + 1).join('-')}`;
                if (currentId === itemId) {
                  editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize));
                  deleted = true;
                  return false;
                }
              }
            });
          }
        }
      } else if (action === 'duplicate') {
        editor.view.state.doc.descendants((node: PMNode, pos: number) => {
          if (node.attrs.id === itemId) {
            const newNode = regenerateIds(node);
            const finalAttrs = { ...newNode.attrs };
            let finalContent = newNode.content;

            if (finalAttrs.title) {
              finalAttrs.title = `${finalAttrs.title} (copie)`;
            }

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

        editor.view.state.doc.descendants((node: PMNode, pos: number) => {
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
          const tr = editor.view.state.tr;
          tr.delete(sourcePos, sourcePos + (sourceNode as PMNode).nodeSize);
          let adjustedTargetPos = targetPos as number;
          if (sourcePos < (targetPos as number)) adjustedTargetPos -= (sourceNode as PMNode).nodeSize;

          let insertPos = adjustedTargetPos;
          if (position === 'after') insertPos = adjustedTargetPos + (targetNode as PMNode).nodeSize;
          else if (position === 'inside') insertPos = adjustedTargetPos + (targetNode as PMNode).nodeSize - 1;

          tr.insert(insertPos, sourceNode);
          editor.view.dispatch(tr);
        }
      } else if (action === 'copy') {
        editor.view.state.doc.descendants((node: PMNode, pos: number) => {
          if (node.attrs.id === itemId) {
            copiedNodeJsonRef.current = node.toJSON();
            return false;
          }
        });
      } else if (action === 'paste') {
        const itemToPaste = payload;
        editor.view.state.doc.descendants((node: PMNode, pos: number) => {
          if (node.attrs.id === itemId) {
            let interimNode;
            if (copiedNodeJsonRef.current && copiedNodeJsonRef.current.attrs?.id === itemToPaste?.id) {
              interimNode = editor.state.schema.nodeFromJSON(copiedNodeJsonRef.current);
            } else {
              interimNode = editor.state.schema.nodeFromJSON(transformTOCItemToNodeJson(itemToPaste));
            }
            const finalNode = regenerateIds(interimNode);

            const $pos = editor.view.state.doc.resolve(pos + node.nodeSize - 1);
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
              editor.view.dispatch(editor.state.tr.insert(pos + node.nodeSize - 1, finalNode));
            }
            return false;
          }
        });
      }
    }
  }), [editor]);

  // Listen for exercise modal open events dispatched from Chapitre/Section NodeViews
  React.useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ nodeId: string }>;
      // Store the target node ID — handleCreateQuickExercise will use it for direct insertion
      setTargetNodeId(customEvent.detail?.nodeId ?? null);
      setShowQuickExerciseModal(true);
    };
    window.addEventListener('xccm:open-exercise-modal', handler);
    return () => window.removeEventListener('xccm:open-exercise-modal', handler);
  }, []);

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
            text: q.text
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

    // Build the ProseMirror node from the JSON definition
    const { state, view } = editor;
    const { schema, tr, selection } = state;
    const nodeType = schema.nodes['exercice'];
    if (!nodeType) return;

    const timestamp = Date.now();
    const sessionIdx = ++globalIdCounter;
    const entropy = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().split('-')[0]
      : Math.random().toString(36).substring(2, 11);

    const exerciceNodeJson = {
      type: 'exercice',
      attrs: {
        id: `exercice-${timestamp}-${sessionIdx}-${entropy}`,
        title: title,
      },
      content: [{
        type: 'orderedList',
        content: questionsItems
      }]
    };

    const pmNode = state.schema.nodeFromJSON(exerciceNodeJson);

    if (targetNodeId) {
      // ── DIRECT BY-ID INSERTION ──────────────────────────────────────────
      // The exercise was triggered from a Chapitre/Section NodeView button.
      // We insert directly as the last child of that node, regardless of
      // where the cursor is. This bypasses smartInsertNode which would always
      // pick the nearest ancestor (often a paragraphe).
      let inserted = false;
      editor.state.doc.descendants((node, pos) => {
        if (inserted) return false;
        if (node.attrs.id === targetNodeId) {
          // pos + nodeSize - 1 is the position just inside the closing tag
          const insertPos = pos + node.nodeSize - 1;
          try {
            view.dispatch(tr.insert(insertPos, pmNode).scrollIntoView());
            inserted = true;
          } catch (_) {
            // Fallback to cursor-based if the position is invalid
          }
          return false;
        }
      });
      setTargetNodeId(null);
      if (inserted) return;
    }

    // ── CURSOR-BASED SMART INSERTION (toolbar button) ──────────────────────
    // Walk up ancestors from cursor to find the nearest node that accepts exercice
    const $pos = selection.$from;
    let targetDepth = -1;
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
      if (targetDepth < $pos.depth) {
        insertPos = $pos.after(targetDepth + 1);
      }
      view.dispatch(tr.insert(insertPos, pmNode).scrollIntoView());
    } else {
      // Fallback: try a generic insertContent as last resort
      editor.chain().focus().insertContent(exerciceNodeJson).run();
    }
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
        <div id="editor-toolbar" className="border-b border-gray-300 dark:border-gray-700 p-2 bg-gray-100 dark:bg-gray-800">
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
            <div
              id="xccm-editor-page"
              className="relative"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                width: '21cm',
                height: 'auto'
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <EditorContent editor={editor} className="min-h-[29.7cm] p-8 outline-none" />
              {children}
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

          <div className="flex items-center gap-6">n
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
