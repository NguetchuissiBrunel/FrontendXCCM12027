"use client";

import React, { useState, useEffect, useRef } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Sigma, X, Check } from 'lucide-react';

export default function MathNodeView({ node, updateAttributes, selected }: NodeViewProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tex, setTex] = useState(node.attrs.tex);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current && !isEditing) {
            try {
                katex.render(node.attrs.tex, containerRef.current, {
                    throwOnError: false,
                    displayMode: true,
                });
            } catch (e) {
                console.error('KaTeX error:', e);
            }
        }
    }, [node.attrs.tex, isEditing]);

    const handleSave = () => {
        updateAttributes({ tex });
        setIsEditing(false);
    };

    return (
        <NodeViewWrapper className={`math-node-wrapper my-6 p-4 rounded-xl border-2 transition-all ${selected ? 'border-purple-500 bg-purple-50/10' : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 bg-white dark:bg-gray-800'}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <Sigma size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Formule Mathématique</span>
                </div>
                {selected && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md font-bold uppercase"
                    >
                        Modifier TeX
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <textarea
                        value={tex}
                        onChange={(e) => setTex(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) handleSave();
                            if (e.key === 'Escape') setIsEditing(false);
                        }}
                        autoFocus
                        className="w-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                        rows={3}
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsEditing(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <X size={20} />
                        </button>
                        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-purple-700 transition-all">
                            <Check size={16} /> Appliquer
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    ref={containerRef}
                    className="py-4 cursor-pointer overflow-x-auto min-h-[50px] flex items-center justify-center text-gray-900 dark:text-white"
                    onClick={() => setIsEditing(true)}
                />
            )}
        </NodeViewWrapper>
    );
}
