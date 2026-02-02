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

  useLayoutEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [node.attrs.title]);


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
      </div>

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}