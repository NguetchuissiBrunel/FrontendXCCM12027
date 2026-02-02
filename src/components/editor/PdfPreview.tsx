"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface PdfPreviewProps {
    content: any; // TipTap JSON
    title: string;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ content, title }) => {
    const [scale, setScale] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Simplified transformation of TipTap JSON to HTML for preview
    const renderContent = (node: any): React.ReactNode => {
        if (!node || !node.content) return null;

        return node.content.map((child: any, index: number) => {
            switch (child.type) {
                case 'heading':
                    const Level = `h${child.attrs.level}` as keyof JSX.IntrinsicElements;
                    const headingRef = child.attrs.level === 1 ? "text-3xl font-black mb-6 text-gray-900" :
                        child.attrs.level === 2 ? "text-2xl font-bold mb-4 mt-8 text-gray-800 border-b pb-2" :
                            "text-xl font-bold mb-2 mt-6 text-gray-800";
                    return <Level key={index} className={headingRef}>{renderContent(child)}</Level>;
                case 'paragraph':
                    return <p key={index} className="text-gray-700 leading-relaxed mb-4 text-justify">{renderContent(child)}</p>;
                case 'text':
                    let text = child.text;
                    if (child.marks) {
                        child.marks.forEach((mark: any) => {
                            if (mark.type === 'bold') text = <strong className="font-bold">{text}</strong>;
                            if (mark.type === 'italic') text = <em className="italic">{text}</em>;
                        });
                    }
                    return text;
                case 'image':
                    return <img key={index} src={child.attrs.src} alt={child.attrs.alt} className="max-w-full rounded-lg my-6 mx-auto shadow-sm" />;
                case 'bulletList':
                    return <ul key={index} className="list-disc ml-6 mb-4 space-y-1">{renderContent(child)}</ul>;
                case 'listItem':
                    return <li key={index} className="text-gray-700">{renderContent(child)}</li>;
                default:
                    return null;
            }
        });
    };

    useEffect(() => {
        setIsRefreshing(true);
        const timer = setTimeout(() => setIsRefreshing(false), 500);
        return () => clearTimeout(timer);
    }, [content]);

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-bold truncate max-w-[150px] dark:text-white">{title}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors text-gray-600 dark:text-gray-300">
                            <ZoomOut size={16} />
                        </button>
                        <span className="text-xs font-medium px-2 dark:text-gray-300">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors text-gray-600 dark:text-gray-300">
                            <ZoomIn size={16} />
                        </button>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-purple-600 transition-colors" title="Actualiser">
                        <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-purple-600 transition-colors" title="Télécharger PDF">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Preview Container */}
            <div className="flex-1 overflow-auto p-8 flex justify-center bg-gray-200/50 dark:bg-gray-900/50">
                <div
                    className="bg-white shadow-2xl origin-top transition-transform duration-300"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '25mm',
                        transform: `scale(${scale})`,
                    }}
                >
                    {/* PDF Page Header */}
                    <div className="flex justify-between items-start mb-12 border-b-2 border-gray-900 pb-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">XCCM1 • Plateforme Pédagogique</p>
                            <h1 className="text-4xl font-black text-gray-900 leading-tight uppercase">{title}</h1>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-900">Date: {new Date().toLocaleDateString('fr-FR')}</p>
                            <p className="text-[10px] text-gray-500 uppercase">Document Certifié</p>
                        </div>
                    </div>

                    {/* PDF Page Content */}
                    <div className="prose prose-sm max-w-none">
                        {content ? renderContent(content) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                                <FileText size={64} className="mb-4 opacity-20" />
                                <p className="text-lg font-medium opacity-30 italic">Commencez à écrire pour voir l'aperçu...</p>
                            </div>
                        )}
                    </div>

                    {/* PDF Page Footer */}
                    <div className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-medium italic">
                        <p>© {new Date().getFullYear()} XCCM1 - Tous droits réservés</p>
                        <p>Page 1 sur 1</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PdfPreview;
