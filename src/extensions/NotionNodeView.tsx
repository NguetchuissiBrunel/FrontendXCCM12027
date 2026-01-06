/**
 * NOTION NODE VIEW - React Component
 */
import React, { useState } from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export default function NotionNodeView({ node, updateAttributes, editor }: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NodeViewWrapper
      className="notion-node"
      data-id={node.attrs.id}
      
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
      {/* Editable Label Badge */}
      <input

      draggable="true"
      onDragStart={(e:any) => {
        // Store the ID of the Notion node being dragged
        e.dataTransfer.setData('nodeId', node.attrs.id);
        console.log("draggin notion ",node.attrs.id)
      }}
      onDragOver={(e:any) => {
        e.preventDefault(); // Necessary to allow the drop event
      }}
onDrop={(e) => {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData('nodeId');
  const targetId = node.attrs.id;

  if (!editor || !draggedId || draggedId === targetId) return;

  const { state, view } = editor;
  const tr = state.tr; // ✅ get transaction
  let draggedNode: any;
  let draggedPos: number | undefined;
  let targetPos: number | undefined;

  // Find dragged node
  state.doc.descendants((n, pos) => {
    if (n.attrs?.id === draggedId) {
      draggedNode = n;
      draggedPos = pos;
      return false;
    }
  });

  // Find target node
  state.doc.descendants((n, pos) => {
    if (n.attrs?.id === targetId) {
      targetPos = pos + 1; // insert inside
      return false;
    }
  });

  if (draggedNode && draggedPos !== undefined && targetPos !== undefined) {
    // Delete dragged node first
    tr.delete(draggedPos, draggedPos + draggedNode.nodeSize);

    // Adjust position if dragged node was before target
    if (draggedPos < targetPos) {
      targetPos -= draggedNode.nodeSize;
    }

    // Insert dragged node
    tr.insert(targetPos, draggedNode.toJSON());

    // Dispatch transaction
    view.dispatch(tr);
    view.focus();
  }
}}


        type="text"
        value={node.attrs.title}
        onChange={(e) => updateAttributes({ title: e.target.value })}
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
          border: 'none',
          outline: 'none',
          minWidth: '60px',
          width: 'auto',
          cursor: "pointer"
        }}
        onFocus={(e) => e.target.style.outline = '2px solid rgba(239, 68, 68, 0.5)'}
        onBlur={(e) => e.target.style.outline = 'none'}
      />

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}