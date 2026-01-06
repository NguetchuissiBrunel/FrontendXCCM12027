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
      {/* Editable Label Badge */}
      {/* Title removed for Notion as requested */}

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}