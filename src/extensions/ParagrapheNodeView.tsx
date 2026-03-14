/**
 * PARAGRAPHE NODE VIEW - React Component
 * 
 * Visual rendering component for Paragraphe nodes.
 * Displays orange border (#F97316) on hover with smooth transition.
 * 
 * Features:
 * - Hover state management
 * - 3px solid orange border on hover
 * - EDITABLE "Paragraphe" label badge at top-left
 * - Smooth 150ms border transition
 * - Editable content area
 * 
 * @author JOHAN
 * @date December 2025
 */

import React, { useLayoutEffect, useRef, useState } from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export default function ParagrapheNodeView({ node, updateAttributes }: NodeViewProps) {
  // const [isHovered, setIsHovered] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [node.attrs.title]);

  return (
    <NodeViewWrapper
      className="paragraphe-node"
      style={{
        position: 'relative',
        border: '1px solid transparent',
        borderLeft: '4px solid #F97316',
        backgroundColor: 'rgba(249, 115, 22, 0.05)',
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
          onChange={(e) => updateAttributes({ title: e.target.value })}
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

            // Old project style for 'node-paragraph'
            fontSize: '25px',
            fontWeight: 'bold',
            lineHeight: '1.4',
            color: '#D97706', // orange-700
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: 0,
            margin: 0
          }}
          className="node-paragraph-input placeholder-gray-400"
          placeholder="Titre du paragraphe..."
        />
      </div>

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}