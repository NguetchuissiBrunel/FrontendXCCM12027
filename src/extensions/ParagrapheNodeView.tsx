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

import React, { useState } from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export default function ParagrapheNodeView({ node, updateAttributes }: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NodeViewWrapper
      className="paragraphe-node"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        border: isHovered ? '3px solid #F97316' : '3px solid transparent',
        transition: 'border-color 150ms ease',
        padding: '16px',
        margin: '8px 0',
        borderRadius: '4px',
      }}
    >
      {/* Editable Label Badge */}
      <input
        type="text"
        value={node.attrs.title}
        onChange={(e) => updateAttributes({ title: e.target.value })}
        /*placeholder="Paragraphe"*/
        style={{
          position: 'absolute',
          top: '-12px',
          left: '12px',
          backgroundColor: '#F97316',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 10,
          border: 'none',
          outline: 'none',
          minWidth: '85px',
          width: 'auto',
        }}
        onFocus={(e) => e.target.style.outline = '2px solid rgba(249, 115, 22, 0.5)'}
        onBlur={(e) => e.target.style.outline = 'none'}
      />

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}