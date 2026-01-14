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

  const titleRef = useRef<HTMLInputElement>(null);
    const measureRef = useRef<HTMLSpanElement>(null);
    
    useLayoutEffect(() => {
      const resize = () => {
        if (titleRef.current && measureRef.current) {
          const width = measureRef.current.offsetWidth + 16;
          titleRef.current.style.width = `${Math.max(width, 70)}px`;
        }
      };
    
      // Run immediately
      resize();
    
      // Run again after paint (important for initial drop)
      requestAnimationFrame(resize);
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
      }}
    >
      {/* Editable Label Badge */}
      {/* Editable Label Badge */}
      <div contentEditable={false}>
        <input
          type="text"
          value={node.attrs.title}
          onChange={(e) => updateAttributes({ title: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'block',
            width: '100%',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',

            // Old project style for 'node-paragraph'
            fontSize: '25px',
            fontWeight: 'bold',
            lineHeight: '1.4',
            marginTop: '1rem',
            marginBottom: '0.5rem',
            color: '#D97706', // orange-700
          }}
          className="node-paragraph-input placeholder-gray-400"
        />
      </div>

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}