"use client";

import React, { useState, useEffect, useRef } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Sigma, X, Check } from 'lucide-react';

export default function MathNodeView({ node, updateAttributes, selected }: NodeViewProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'templates' | 'greek' | 'symbols'>('templates');
    const [tex, setTex] = useState(node.attrs.tex);
    const editorRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
                setIsEditing(false);
            }
        };

        if (isEditing) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing]);

    // Safer rendering with dangerouslySetInnerHTML
    const getRenderedHtml = (texString: string) => {
        try {
            return katex.renderToString(texString || '...', {
                throwOnError: false,
                displayMode: false,
            });
        } catch (e) {
            return `<span class="text-red-500 font-mono text-xs">Error: ${texString}</span>`;
        }
    };

    const handleSave = () => {
        updateAttributes({ tex });
        setIsEditing(false);
    };

    const insertTemplate = (template: string) => {
        setTex((prev: string) => prev + template);
    };

    const tabs = [
        { id: 'templates', label: 'Structures' },
        { id: 'greek', label: 'Grec' },
        { id: 'symbols', label: 'Symboles' },
    ];

    const mathTemplates = [
        { label: 'Fraction', tex: '\\frac{}{}', icon: 'x/y' },
        { label: 'Puissance', tex: '^{}', icon: 'xⁿ' },
        { label: 'Indice', tex: '_{}', icon: 'xₙ' },
        { label: 'Racine', tex: '\\sqrt{}', icon: '√' },
        { label: 'Somme', tex: '\\sum_{}^{}', icon: '∑' },
        { label: 'Intégrale', tex: '\\int_{}^{}', icon: '∫' },
        { label: 'Limite', tex: '\\lim_{x \\to 0}', icon: 'lim' },
        { label: 'Vecteur', tex: '\\vec{}', icon: '→' },
        { label: 'Log', tex: '\\log_{}', icon: 'log' },
        { label: 'Matrice', tex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', icon: '[M]' },
    ];

    const greekSymbols = [
        { tex: '\\alpha', icon: 'α' }, { tex: '\\beta', icon: 'β' }, { tex: '\\gamma', icon: 'γ' },
        { tex: '\\delta', icon: 'δ' }, { tex: '\\epsilon', icon: 'ε' }, { tex: '\\zeta', icon: 'ζ' },
        { tex: '\\eta', icon: 'η' }, { tex: '\\theta', icon: 'θ' }, { tex: '\\iota', icon: 'ι' },
        { tex: '\\kappa', icon: 'κ' }, { tex: '\\lambda', icon: 'λ' }, { tex: '\\mu', icon: 'μ' },
        { tex: '\\nu', icon: 'ν' }, { tex: '\\xi', icon: 'ξ' }, { tex: '\\pi', icon: 'π' },
        { tex: '\\rho', icon: 'ρ' }, { tex: '\\sigma', icon: 'σ' }, { tex: '\\tau', icon: 'τ' },
        { tex: '\\phi', icon: 'φ' }, { tex: '\\chi', icon: 'χ' }, { tex: '\\psi', icon: 'ψ' },
        { tex: '\\omega', icon: 'ω' }, { tex: '\\Delta', icon: 'Δ' }, { tex: '\\Omega', icon: 'Ω' },
    ];

    const commonSymbols = [
        { tex: '\\infty', icon: '∞' }, { tex: '\\pm', icon: '±' }, { tex: '\\neq', icon: '≠' },
        { tex: '\\approx', icon: '≈' }, { tex: '\\leq', icon: '≤' }, { tex: '\\geq', icon: '≥' },
        { tex: '\\times', icon: '×' }, { tex: '\\div', icon: '÷' }, { tex: '\\rightarrow', icon: '→' },
        { tex: '\\Rightarrow', icon: '⇒' }, { tex: '\\forall', icon: '∀' }, { tex: '\\exists', icon: '∃' },
        { tex: '\\in', icon: '∈' }, { tex: '\\notin', icon: '∉' }, { tex: '\\subset', icon: '⊂' },
        { tex: '\\cup', icon: '∪' }, { tex: '\\cap', icon: '∩' }, { tex: '\\perp', icon: '⊥' },
        { tex: '\\angle', icon: '∠' }, { tex: '\\parallel', icon: '∥' }, { tex: '\\partial', icon: '∂' },
        { tex: '\\nabla', icon: '∇' }, { tex: '\\propto', icon: '∝' }, { tex: '\\emptyset', icon: '∅' },
    ];

    if (isEditing) {
        return (
            <NodeViewWrapper as="span" className="inline relative">
                <div
                    ref={editorRef}
                    className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-80 bg-white dark:bg-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-gray-700 rounded-2xl p-0 z-[9999] animate-in fade-in zoom-in duration-200 overflow-hidden ring-1 ring-black/5"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                                <Sigma size={14} className="text-purple-600" />
                            </div>
                            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-widest">Assistant Équation</span>
                        </div>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* LIVE PREVIEW AREA */}
                    <div className="p-5 flex items-center justify-center bg-white dark:bg-gray-800 min-h-[70px] border-b border-gray-50 dark:border-gray-900/50">
                        <div
                            className="text-xl transition-all duration-300 transform"
                            dangerouslySetInnerHTML={{ __html: getRenderedHtml(tex) }}
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1.5 gap-1 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-lg transition-all ${activeTab === tab.id
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                        : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="p-3 max-h-44 overflow-y-auto bg-white dark:bg-gray-800 custom-scrollbar">
                        {activeTab === 'templates' && (
                            <div className="grid grid-cols-4 gap-2">
                                {mathTemplates.map((t, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => insertTemplate(t.tex)}
                                        className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl border border-gray-100 dark:border-gray-800 transition-all hover:border-purple-300 dark:hover:border-purple-700 group shadow-sm hover:shadow-md"
                                    >
                                        <span className="text-base font-serif group-hover:scale-110 transition-transform">{t.icon}</span>
                                        <span className="text-[8px] text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-tighter font-bold">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeTab === 'greek' && (
                            <div className="grid grid-cols-6 gap-1.5">
                                {greekSymbols.map((s, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => insertTemplate(s.tex)}
                                        className="aspect-square flex items-center justify-center text-base font-serif bg-gray-50 dark:bg-gray-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg border border-gray-100 dark:border-gray-800 transition-all hover:scale-105"
                                        title={s.tex}
                                    >
                                        {s.icon}
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeTab === 'symbols' && (
                            <div className="grid grid-cols-6 gap-1.5">
                                {commonSymbols.map((s, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => insertTemplate(s.tex)}
                                        className="aspect-square flex items-center justify-center text-base bg-gray-50 dark:bg-gray-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg border border-gray-100 dark:border-gray-800 transition-all hover:scale-105"
                                        title={s.tex}
                                    >
                                        {s.icon}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-gray-50/80 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-700 backdrop-blur-sm">
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
                            className="w-full p-3 font-mono text-xs bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none shadow-inner"
                            rows={2}
                            placeholder="Syntaxe LaTeX..."
                        />

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Usage</span>
                                <span className="text-[9px] text-gray-400 font-medium">Entrée pour valider</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-[10px] font-bold text-gray-500 hover:bg-gray-200/80 dark:hover:bg-gray-800 rounded-xl transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl text-[10px] font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all active:scale-95"
                                >
                                    <Check size={14} /> Appliquer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inline Placeholder (visible behind/during edit) */}
                <span
                    className="inline-block bg-purple-100/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800 font-serif italic text-sm transition-all"
                    dangerouslySetInnerHTML={{ __html: getRenderedHtml(node.attrs.tex) }}
                />
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper
            as="span"
            className={`inline mx-0.5 transition-all rounded-md cursor-pointer border-b-2 border-transparent hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 ${selected ? 'ring-2 ring-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-400' : ''}`}
            onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
        >
            <span
                className="px-1.5 py-0.5"
                dangerouslySetInnerHTML={{ __html: getRenderedHtml(node.attrs.tex) }}
            />
        </NodeViewWrapper>
    );
}
