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

    // Alignement de l'image (attribut textAlign posé par l'extension TextAlign).
    // Le wrapper est un bloc pleine largeur avec text-align, et l'image est un
    // inline-block → left / center / right positionnent réellement l'image.
    const align = (node.attrs.textAlign as string) || 'left';

    return (
        <NodeViewWrapper
            className="resizable-image-wrapper relative group"
            style={{ display: 'block', width: '100%', textAlign: align as any }}
        >
            <div
                className={`relative inline-block align-top ${selected ? 'ring-2 ring-purple-500' : ''}`}
                style={{ width: width, maxWidth: '100%', textAlign: 'left' }}
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
