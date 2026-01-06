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

export default function SectionNodeView({ node, updateAttributes,editor}: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NodeViewWrapper
      className="section-node"
      data-id={node.attrs.id} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        border: isHovered ? '3px solid #8B5CF6' : '3px solid transparent',
        transition: 'border-color 150ms ease',
        padding: '16px',
        margin: '8px 0',
        borderRadius: '4px',
      }}
     
    >
      {/* Editable Label Badge */}
      
      <input
      draggable 
       
      onDragStart={(e:any) => {
        console.log("dragging")
        e.dataTransfer.setData(
          'nodeId',
          node.attrs.id
        )


        console.log(node.attrs.id,"dragged")
      }}

      onDragOver={(e) => {
        e.preventDefault()
        const draggedId = e.dataTransfer.getData('nodeId');
        console.log("dragging", draggedId)
      }} 

     onDrop={(e) => {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData('nodeId');
  const targetId = node.attrs.id;
console.log("dragging",draggedId," into ",targetId)
  if (!editor || !draggedId || draggedId === targetId) return;

  const { state } = editor;
  let draggedPos: number | undefined;
  let draggedNode: any;

  // 1. Find the source node
  state.doc.descendants((n, pos) => {
    if (n.attrs?.id === draggedId) {
      draggedPos = pos;
      draggedNode = n;
      return false;
    }
  });

  if (draggedPos !== undefined && draggedNode) {
    let insideTargetPos: number | undefined;

    // 2. Find the target node
    state.doc.descendants((n, pos) => {
      if (n.attrs?.id === targetId) {
        // pos + 1 moves the cursor INSIDE the start of the target node
        insideTargetPos = pos + 1; 
        return false;
      }
    });

    if (insideTargetPos !== undefined) {
      // 3. Execution logic
      // Note: When moving a node into a target that appears AFTER it in the doc, 
      // the document positions shift. We handle that here.
      const isMovingDown = insideTargetPos > draggedPos;
      const finalInsertPos = isMovingDown 
        ? insideTargetPos - draggedNode.nodeSize 
        : insideTargetPos;

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
        /*placeholder="Partie"*/
        style={{
          position: 'absolute',
          top: '-12px',
          left: '12px',
          backgroundColor: '#8B5CF6',
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
          cursor:"pointer"
        }}
        onFocus={(e) => e.target.style.outline = '2px solid rgba(139, 92, 246, 0.5)'}
        onBlur={(e) => e.target.style.outline = 'none'}
      />

      {/* Editable Content */}
      <NodeViewContent className="content" >

        
      </NodeViewContent>
    </NodeViewWrapper>
  );
}