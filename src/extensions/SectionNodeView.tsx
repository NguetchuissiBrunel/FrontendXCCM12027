/**
 * SECTION NODE VIEW - React Component
 * 
 * Visual rendering component for Section nodes.
 * Displays purple border (#8B5CF6) on hover with smooth transition.
 * 
 * Features:
 * - Hover state management
 * - 3px solid purple border on hover
 * - EDITABLE "Partie" label badge at top-left
 * - Smooth 150ms border transition
 * - Editable content area
 * 
 * @author JOHAN
 * @date December 2025
 */

import React, { useState } from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export default function SectionNodeView({ node, updateAttributes }: NodeViewProps) {
  // const [isHovered, setIsHovered] = useState(false); // Removed hover state reliance for border


  return (
    <NodeViewWrapper
      className="section-node"
      style={{
        position: 'relative',
        border: '1px solid transparent',
        borderLeft: '4px solid #8B5CF6', // Persistent colored left border
        backgroundColor: 'rgba(139, 92, 246, 0.05)', // Slight background tint
        padding: '16px',
        margin: '16px 0',
        borderRadius: '0 4px 4px 0',
      }}
    >
      {/* Editable Label Badge */}
      <input
        type="text"
        value={node.attrs.title}
        onChange={(e) => updateAttributes({ title: e.target.value })}
        style={{
          display: 'block',
          width: '100%',
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',

          // Old project style for 'node-part'
          fontSize: '40px',
          fontWeight: 'bold',
          lineHeight: '1.2',
          marginTop: '1.5rem',
          marginBottom: '1rem',
          color: '#7C3AED', // purple-700 (dark mode needs check but hardcoded for now like old proj likely did)
        }}
        // Prevent editor from taking over focus/events when interacting with the title input
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="node-part-input placeholder-gray-400"
      />

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}