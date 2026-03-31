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
import { BookOpen } from 'lucide-react';

export default function NotionNodeView({ node, updateAttributes }: NodeViewProps) {
  // const [isHovered, setIsHovered] = useState(false);

  return (
    <NodeViewWrapper
      className="notion-node"
      data-id={node.attrs.id}
      style={{
        position: 'relative',
        border: '2px solid #EF4444',
        borderLeft: '8px solid #EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        padding: '20px',
        margin: '24px 0',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      }}
    >
      {/* Label Badge */}
      <div contentEditable={false} className="flex items-center gap-2 mb-4 select-none bg-red-600 text-white px-3 py-1.5 rounded-lg w-fit shadow-sm">
        <BookOpen className="h-4 w-4" />
        <span className="text-xs font-black uppercase tracking-wider">
          Notion Clé {node.attrs.number || ""}
        </span>
      </div>

      {/* Editable Content */}
      <div className="mb-2">
        <NodeViewContent className="content" />
      </div>

      {/* Add Exercise Button - Only in Editor */}
      {window.location.pathname.includes('editor') && (
        <div contentEditable={false} style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
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
      )}
    </NodeViewWrapper>
  );
}