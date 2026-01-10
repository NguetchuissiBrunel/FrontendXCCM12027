import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { GripHorizontal } from 'lucide-react';

export default function ResizableImageComponent({ node, updateAttributes, selected }: NodeViewProps) {
    const [width, setWidth] = useState(node.attrs.width || '100%');
    const [isResizing, setIsResizing] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

    useEffect(() => {
        setWidth(node.attrs.width || '100%');
    }, [node.attrs.width]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        if (imageRef.current) {
            setIsResizing(true);
            resizeRef.current = {
                startX: e.clientX,
                startWidth: imageRef.current.offsetWidth,
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!resizeRef.current) return;

        const diff = e.clientX - resizeRef.current.startX;
        const newWidth = Math.max(100, resizeRef.current.startWidth + diff);

        // Convert to percentage only if parent width is known, usually safer to stick to px or % logic.
        // For simplicity, let's use pixels but update state
        setWidth(`${newWidth}px`);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        resizeRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // Persist changes
        if (imageRef.current) {
            updateAttributes({ width: `${imageRef.current.offsetWidth}px` });
        }
    }, [updateAttributes]);

    return (
        <NodeViewWrapper className="resizable-image-wrapper inline-block relative group" style={{ width: 'fit-content', maxWidth: '100%' }}>
            <div
                className={`relative ${selected ? 'ring-2 ring-purple-500' : ''}`}
                style={{ width: width, maxWidth: '100%' }}
            >
                <img
                    ref={imageRef}
                    src={node.attrs.src}
                    alt={node.attrs.alt}
                    title={node.attrs.title}
                    className="rounded-lg shadow-sm w-full h-auto block"
                    style={{ width: '100%' }}
                />

                {/* Resize Handle */}
                <div
                    className={`absolute bottom-2 right-2 p-1 bg-white/80 rounded shadow cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity ${isResizing ? 'opacity-100' : ''}`}
                    onMouseDown={handleMouseDown}
                >
                    <GripHorizontal size={16} className="text-gray-600" />
                </div>
            </div>
        </NodeViewWrapper>
    );
}
