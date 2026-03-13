/**
 * EXERCICE NODE VIEW - React Component
 * 
 * Visual rendering component for Exercice nodes.
 * Displays indigo border (#6366F1) on hover with smooth transition.
 * 
 * Features:
 * - Hover state management
 * - 3px solid indigo border on hover
 * - EDITABLE "Exercice" label badge at top-left
 * - Smooth 150ms border transition
 * - Editable content area
 * 
 * @author JOHAN
 * @date December 2025
 */

import React, { useLayoutEffect, useRef, useState } from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export default function ExerciceNodeView({ node, updateAttributes }: NodeViewProps) {
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
      className="exercice-node"
      style={{
        position: 'relative',
        border: '1px solid transparent',
        borderLeft: '4px solid #6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        padding: '16px',
        margin: '16px 0',
        borderRadius: '0 4px 4px 0',
      }}
    >
      {/* Editable Label Badge with prefix */}
      <div contentEditable={false} className="flex items-start gap-2 mb-2 select-none">
        <span style={{
          fontSize: '20px',
          fontWeight: 'bold',
          lineHeight: '1.5',
          color: '#4F46E5', // indigo-600
          whiteSpace: 'nowrap',
          marginTop: '0px'
        }}>
          Exercice :
        </span>
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

            // Style for 'node-exercise'
            fontSize: '20px',
            fontWeight: 'bold',
            lineHeight: '1.5',
            color: '#4F46E5', // indigo-600
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: 0,
            margin: 0
          }}
          className="node-exercise-input placeholder-gray-400"
          placeholder="Titre de l'exercice..."
        />
      </div>

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}