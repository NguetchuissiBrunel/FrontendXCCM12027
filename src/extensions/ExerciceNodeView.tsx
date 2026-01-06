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
  const [isHovered, setIsHovered] = useState(false);

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
      className="exercice-node"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        border: isHovered ? '3px solid #6366F1' : '3px solid transparent',
        transition: 'border-color 150ms ease',
        padding: '16px',
        margin: '8px 0',
        borderRadius: '4px',
      }}
    >
      <>
        {/* Hidden span used for measurement */}
        <span
          ref={measureRef}
          style={{
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'pre',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: 'inherit',
            padding: '2px 8px',
          }}
        >
          {node.attrs.title || ' '}
        </span>

        {/* Title bar */}
        <input
          ref={titleRef}
          type="text"
          value={node.attrs.title}
          onChange={(e) => updateAttributes({ title: e.target.value })}
          style={{
            position: 'absolute',
            top: '-12px',
            left: '12px',
            backgroundColor: '#6366F1',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            zIndex: 10,
            border: 'none',
            outline: 'none',
            minWidth: '70px',
            whiteSpace: 'nowrap',
          }}
          onFocus={(e) =>
            (e.target.style.outline = '2px solid rgba(99, 102, 241, 0.5)')
          }
          onBlur={(e) => (e.target.style.outline = 'none')}
        />
      </>

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}