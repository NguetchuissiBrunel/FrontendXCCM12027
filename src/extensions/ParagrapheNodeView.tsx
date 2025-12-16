/**
 * PARAGRAPHE NODE VIEW - React Component
 * 
 * Visual rendering component for Paragraphe (Paragraph) nodes.
 * Displays orange border (#F59E0B) on hover with smooth transition.
 * 
 * Features:
 * - Hover state management
 * - 3px solid orange border on hover
 * - "Paragraphe" label badge at top-left
 * - Smooth 150ms border transition
 * - Editable content area
 * 
 * @author JOHAN
 * @date December 2024
 */

import React, { useState } from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';

export default function ParagrapheNodeView() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NodeViewWrapper
      className="paragraphe-node"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        border: isHovered ? '3px solid #F59E0B' : '3px solid transparent',
        transition: 'border-color 150ms ease',
        padding: '16px',
        margin: '8px 0',
        borderRadius: '4px',
      }}
    >
      {/* Label Badge */}
      <div
        style={{
          position: 'absolute',
          top: '-12px',
          left: '12px',
          backgroundColor: '#F59E0B',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 10,
        }}
      >
        Paragraphe
      </div>

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}