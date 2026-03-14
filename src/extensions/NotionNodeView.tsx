/**
 * NOTION NODE VIEW - React Component
 * 
 * Visual rendering component for Notion nodes.
 * Displays red border (#EF4444) on hover with smooth transition.
 * 
 * Features:
 * - Hover state management
 * - 3px solid red border on hover
 * - EDITABLE "Notion" label badge at top-left
 * - Smooth 150ms border transition
 * - Editable content area
 * 
 * @author JOHAN
 * @date December 2025
 */

import React, { useState } from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export default function NotionNodeView({ node, updateAttributes }: NodeViewProps) {
  // const [isHovered, setIsHovered] = useState(false);

  return (
    <NodeViewWrapper
      className="notion-node"
      style={{
        position: 'relative',
        border: '1px solid transparent',
        borderLeft: '4px solid #EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        padding: '16px',
        margin: '16px 0',
        borderRadius: '0 4px 4px 0',
      }}
    >
      {/* Editable Content */}
      <NodeViewContent className="content" />

      {/* Add Exercise Button */}
      <div contentEditable={false} style={{ marginTop: '8px' }}>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(
              new CustomEvent('xccm:open-exercise-modal', {
                detail: { nodeId: node.attrs.id }
              })
            );
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#EF4444',
            border: '1px dashed #fca5a5',
            borderRadius: '6px',
            background: 'transparent',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          title="Ajouter un exercice dans cette notion"
        >
          ＋ Exercice
        </button>
      </div>
    </NodeViewWrapper>
  );
}