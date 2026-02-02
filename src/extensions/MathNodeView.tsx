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
                    displayMode: false,
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

    const insertTemplate = (template: string) => {
        setTex(prev => prev + template);
    };

    const mathTemplates = [
        { label: 'Fraction', tex: '\\frac{}{}', icon: '÷' },
        { label: 'Puissance', tex: '^{}', icon: 'xⁿ' },
        { label: 'Indice', tex: '_{}', icon: 'xₙ' },
        { label: 'Racine', tex: '\\sqrt{}', icon: '√' },
        { label: 'Somme', tex: '\\sum_{}^{}', icon: '∑' },
        { label: 'Intégrale', tex: '\\int_{}^{}', icon: '∫' },
    ];

    if (isEditing) {
        return (
            <NodeViewWrapper className="inline-block relative z-50">
                <div className="absolute bottom-full mb-2 left-0 w-80 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg p-3 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-tighter">Assistant de Formule</span>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                    </div>

                    <div className="grid grid-cols-3 gap-1 mb-3">
                        {mathTemplates.map((t, idx) => (
                            <button
                                key={idx}
                                onClick={() => insertTemplate(t.tex)}
                                className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-900 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded border border-gray-100 dark:border-gray-800 transition-colors"
                                title={t.label}
                            >
                                <span className="text-sm font-serif">{t.icon}</span>
                                <span className="text-[8px] text-gray-500 mt-1">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={tex}
                        onChange={(e) => setTex(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSave();
                            }
                            if (e.key === 'Escape') setIsEditing(false);
                        }}
                        autoFocus
                        className="w-full p-2 font-mono text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded outline-none focus:border-purple-500"
                        rows={2}
                        placeholder="Syntaxe TeX..."
                    />

                    <div className="flex justify-end gap-2 mt-2">
                        <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded text-[10px] font-bold shadow-sm hover:bg-purple-700">
                            <Check size={12} /> Appliquer
                        </button>
                    </div>
                </div>
                <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-1 rounded blur-[1px]">
                    {tex || '...'}
                </span>
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper
            className={`inline-block mx-1 transition-all rounded-sm ${selected ? 'ring-2 ring-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => setIsEditing(true)}
        >
            <span
                ref={containerRef}
                className="cursor-pointer px-1 py-0.5"
            />
        </NodeViewWrapper>
    );
}
