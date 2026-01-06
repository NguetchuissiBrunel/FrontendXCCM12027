/**
 * EXERCICE NODE VIEW - React Component
 */
import React, { useState } from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export default function ExerciceNodeView({ node, updateAttributes, editor }: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NodeViewWrapper
      className="exercice-node"
      data-id={node.attrs.id}
      draggable="true"
      onDragStart={(e:any) => {
        // Store the ID of the node being dragged
        e.dataTransfer.setData('nodeId', node.attrs.id);
      }}
      onDragOver={(e:any) => {
        e.preventDefault(); // Necessary to allow dropping
      }}
      onDrop={(e:any) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('nodeId');
        const targetId = node.attrs.id;

        // Basic validation
        if (!editor || !draggedId || draggedId === targetId) return;

        const { state } = editor;
        let draggedPos: number | undefined;
        let draggedNode: any;

        // 1. Locate the node currently being dragged
        state.doc.descendants((n, pos) => {
          if (n.attrs?.id === draggedId) {
            draggedPos = pos;
            draggedNode = n;
            return false;
          }
        });

        if (draggedPos !== undefined && draggedNode) {
          let insideTargetPos: number | undefined;

          // 2. Locate the drop target (this Exercice node)
          state.doc.descendants((n, pos) => {
            if (n.attrs?.id === targetId) {
              // pos + 1 puts the dragged node INSIDE the start of this node's content
              insideTargetPos = pos + 1;
              return false;
            }
          });

          if (insideTargetPos !== undefined) {
            // 3. Calculate position shift for vertical moves
            const isMovingDown = insideTargetPos > draggedPos;
            const finalInsertPos = isMovingDown 
              ? insideTargetPos - draggedNode.nodeSize 
              : insideTargetPos;

            // 4. Perform the move transaction
            editor.chain()
              .deleteRange({ from: draggedPos, to: draggedPos + draggedNode.nodeSize })
              .insertContentAt(finalInsertPos, draggedNode.toJSON())
              .focus()
              .run();
          }
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        border: isHovered ? '3px solid #6366F1' : '3px solid transparent',
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
        style={{
          position: 'absolute',
          top: '-12px',
          left: '12px',
          backgroundColor: '#6366F1',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 10,
          border: 'none',
          outline: 'none',
          minWidth: '70px',
          width: 'auto',
          cursor: "pointer"
        }}
        onFocus={(e) => e.target.style.outline = '2px solid rgba(99, 102, 241, 0.5)'}
        onBlur={(e) => e.target.style.outline = 'none'}
      />

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}