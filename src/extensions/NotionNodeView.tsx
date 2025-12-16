/**
 * NOTION NODE VIEW - React Component
 * 
 * Visual rendering component for Notion nodes.
 * Displays red border (#EF4444) on hover with smooth transition.
 * 
 * Features:
 * - Hover state management
 * - 3px solid red border on hover
 * - "Notion" label badge at top-left
 * - Smooth 150ms border transition
 * - Editable content area
 * 
 * @author JOHAN
 * @date December 2024
 */

import React, { useState } from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';

export default function NotionNodeView() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NodeViewWrapper
      className="notion-node"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        border: isHovered ? '3px solid #EF4444' : '3px solid transparent',
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
          backgroundColor: '#EF4444',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 10,
        }}
      >
        Notion
      </div>

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}