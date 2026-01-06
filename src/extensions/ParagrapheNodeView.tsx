/**
 * PARAGRAPHE NODE VIEW - React Component
 */
import React, { useState } from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export default function ParagrapheNodeView({ node, updateAttributes, editor }: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NodeViewWrapper
      className="paragraphe-node"
      data-id={node.attrs.id}
     
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        border: isHovered ? '3px solid #F97316' : '3px solid transparent',
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
        // Tag the dragged node with its unique ID
        e.dataTransfer.setData('nodeId', node.attrs.id);
      }}
      onDragOver={(e:any) => {
        e.preventDefault(); // Required to enable the drop zone
      }}
      onDrop={(e:any) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('nodeId');
        const targetId = node.attrs.id;

        // Basic safety: avoid self-dropping and ensure editor access
        if (!editor || !draggedId || draggedId === targetId) return;

        const { state } = editor;
        let draggedPos: number | undefined;
        let draggedNode: any;

        // 1. Locate the position of the node currently being dragged
        state.doc.descendants((n, pos) => {
          if (n.attrs?.id === draggedId) {
            draggedPos = pos;
            draggedNode = n;
            return false;
          }
        });

        if (draggedPos !== undefined && draggedNode) {
          let insideTargetPos: number | undefined;

          // 2. Locate the target Paragraphe node
          state.doc.descendants((n, pos) => {
            if (n.attrs?.id === targetId) {
              // pos + 1 targets the inside of the node content
              insideTargetPos = pos + 1;
              return false;
            }
          });

          if (insideTargetPos !== undefined) {
            // 3. Adjust position if the drag source is above the drop target
            const isMovingDown = insideTargetPos > draggedPos;
            const finalInsertPos = isMovingDown 
              ? insideTargetPos - draggedNode.nodeSize 
              : insideTargetPos;

            // 4. Move node content via editor chain
            editor.chain()
              .deleteRange({ from: draggedPos, to: draggedPos + draggedNode.nodeSize })
              .insertContentAt(finalInsertPos, draggedNode.toJSON())
              .focus()
              .run();
          }
        }
      }}
        type="text"
        value={node.attrs.title}
        onChange={(e) => updateAttributes({ title: e.target.value })}
        style={{
          position: 'absolute',
          top: '-12px',
          left: '12px',
          backgroundColor: '#F97316',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 10,
          border: 'none',
          outline: 'none',
          minWidth: '85px',
          width: 'auto',
          cursor: "pointer"
        }}
        onFocus={(e) => e.target.style.outline = '2px solid rgba(249, 115, 22, 0.5)'}
        onBlur={(e) => e.target.style.outline = 'none'}
      />

      {/* Editable Content */}
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
}