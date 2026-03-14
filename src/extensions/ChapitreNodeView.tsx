/**
 * CHAPITRE NODE VIEW - React Component
 * 
 * Visual rendering component for Chapitre nodes.
 * Displays green border (#10B981) on hover with smooth transition.
 * 
 * Features:
 * - Hover state management
 * - 3px solid green border on hover
 * - EDITABLE "Chapitre" label badge at top-left
 * - Smooth 150ms border transition
 * - Editable content area
 * 
 * @author JOHAN
 * @date December 2025
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export default function ChapitreNodeView({ node, updateAttributes }: NodeViewProps) {
  // const [isHovered, setIsHovered] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const introRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const adjustHeight = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
      if (ref.current) {
        ref.current.style.height = 'auto';
        ref.current.style.height = `${ref.current.scrollHeight}px`;
      }
    };

    const timeout = setTimeout(() => {
      adjustHeight(titleRef);
      adjustHeight(introRef);
    }, 0);

    return () => clearTimeout(timeout);
  }, [node.attrs.title, node.attrs.introduction]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateAttributes({ title: e.target.value });
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleIntroChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateAttributes({ introduction: e.target.value });
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };


  return (
    <NodeViewWrapper
      className="chapitre-node"
      style={{
        position: 'relative',
        border: '1px solid transparent',
        borderLeft: '4px solid #10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        padding: '16px',
        margin: '16px 0',
        borderRadius: '0 4px 4px 0',
        maxWidth: '100%',
        overflow: 'visible'
      }}
    >
      {/* Editable Label Badge */}
      <div contentEditable={false} className="flex flex-col gap-1 mb-2">
        <textarea
          ref={titleRef}
          value={node.attrs.title}
          onChange={handleTitleChange}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          rows={1}
          style={{
            display: 'block',
            width: '100%',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            resize: 'none',
            overflow: 'hidden',
            minHeight: '1.2em',

            // Old project style for 'node-chapter'
            fontSize: '30px',
            fontWeight: 'bold',
            lineHeight: '1.3',
            color: '#059669', // green-700
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: 0,
            margin: 0
          }}
          className="node-chapter-input placeholder-gray-400"
          placeholder="Titre du chapitre..."
        />
        <textarea
          ref={introRef}
          value={node.attrs.introduction}
          onChange={handleIntroChange}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          rows={1}
          style={{
            display: 'block',
            width: '100%',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            resize: 'none',
            overflow: 'hidden',
            minHeight: '1.2em',
            fontSize: '17px',
            lineHeight: '1.6',
            color: '#1F2937', // gray-900
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: 0,
            margin: '10px 0 0 0',
            fontFamily: 'inherit'
          }}
          placeholder="Introduction du chapitre..."
        />
      </div>

      {/* Editable Content */}
      <NodeViewContent className="content" />

      {/* Add Exercise Button */}
      <div contentEditable={false} style={{ marginTop: '8px' }}>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(
              new CustomEvent('xccm:open-exercise-modal', {
                detail: { nodeId: node.attrs.id }
              })
            );
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#059669',
            border: '1px dashed #6ee7b7',
            borderRadius: '6px',
            background: 'transparent',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          title="Ajouter un exercice dans ce chapitre"
        >
          ＋ Exercice
        </button>
      </div>
    </NodeViewWrapper>
  );
}