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

import React, { useState } from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export default function ExerciceNodeView({ node, updateAttributes }: NodeViewProps) {
  // const [isHovered, setIsHovered] = useState(false);

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

          // Style for 'node-exercise' (inferred)
          fontSize: '20px',
          fontWeight: 'bold',
          lineHeight: '1.5',
          marginBottom: '0.5rem',
          color: '#6366F1', // indigo-500
        }}
        className="node-exercise-input placeholder-gray-400"
      />

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}