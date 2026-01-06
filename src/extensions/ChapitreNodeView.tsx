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

import React, { useState } from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export default function ChapitreNodeView({ node, updateAttributes }: NodeViewProps) {
  // const [isHovered, setIsHovered] = useState(false);

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

          // Old project style for 'node-chapter'
          fontSize: '30px',
          fontWeight: 'bold',
          lineHeight: '1.3',
          marginTop: '1.25rem',
          marginBottom: '0.75rem',
          color: '#059669', // green-700
        }}
        className="node-chapter-input placeholder-gray-400"
      />

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}