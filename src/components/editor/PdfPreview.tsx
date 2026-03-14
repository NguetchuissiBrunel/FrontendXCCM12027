"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import CourseContentRenderer from '../CourseContentRenderer';
import DownloadOptions from '../DownloadOptions';
import { transformTiptapToCourseData } from '@/utils/courseTransformer';
import { downloadCourseAsPDF } from '@/utils/DownloadPdf';
import { downloadCourseAsDocx } from '@/utils/DownloadDocx';
import { toast } from 'react-hot-toast';

interface PdfPreviewProps {
    content: any; // TipTap JSON
    title: string;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ content, title }) => {
    const [scale, setScale] = useState(0.8);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const [docxGenerating, setDocxGenerating] = useState(false);
    const [courseData, setCourseData] = useState<any>(null);

    useEffect(() => {
        if (content) {
            try {
                const data = transformTiptapToCourseData({
                    title,
                    content: content,
                    category: "Formation",
                    author: { name: "Auteur" }
                });
                setCourseData(data);
            } catch (err) {
                console.error("Transformation error:", err);
            }
        }
    }, [content, title]);

    const handleDownloadPDF = async (orientation: 'p' | 'l') => {
        setPdfGenerating(true);
        try {
            if (courseData) {
                await downloadCourseAsPDF(courseData, orientation);
                toast.success("PDF généré avec succès");
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Erreur lors de la génération du PDF");
        } finally {
            setPdfGenerating(false);
            setShowDownloadModal(false);
        }
    };

    const handleDownloadDocx = async () => {
        setDocxGenerating(true);
        try {
            if (courseData) {
                await downloadCourseAsDocx(courseData);
                toast.success("Document Word généré avec succès");
            }
        } catch (error) {
            console.error("Error generating Word document:", error);
            toast.error("Erreur lors de la génération du document Word");
        } finally {
            setDocxGenerating(false);
            setShowDownloadModal(false);
        }
    };

    useEffect(() => {
        setIsRefreshing(true);
        const timer = setTimeout(() => setIsRefreshing(false), 500);
        return () => clearTimeout(timer);
    }, [content]);

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-bold truncate max-w-[150px] dark:text-white">{title || "Aperçu PDF"}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button onClick={() => setScale(s => Math.max(0.3, s - 0.1))} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors text-gray-600 dark:text-gray-300">
                            <ZoomOut size={16} />
                        </button>
                        <span className="text-[10px] font-medium px-1 dark:text-gray-300 w-8 text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors text-gray-600 dark:text-gray-300">
                            <ZoomIn size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowDownloadModal(true)}
                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                        title="Télécharger"
                    >
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Preview Container */}
            <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-100 dark:bg-gray-900 scrollbar-thin">
                <style>
                    {`
                        .pdf-preview-paper .section-node,
                        .pdf-preview-paper .chapitre-node,
                        .pdf-preview-paper .paragraphe-node,
                        .pdf-preview-paper .exercice-node,
                        .pdf-preview-paper .notion-node {
                            border: none !important;
                            border-left: none !important;
                            background-color: transparent !important;
                            padding: 0 !important;
                            margin: 0 !important;
                        }
                        .pdf-preview-paper .node-part-input,
                        .pdf-preview-paper .node-chapter-input,
                        .pdf-preview-paper .node-paragraph-input,
                        .pdf-preview-paper .node-exercise-input {
                            display: none !important;
                        }
                    `}
                </style>
                <div
                    className="bg-white shadow-lg border border-gray-200 mb-20 text-gray-900 pdf-preview-paper"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '20mm',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        fontFamily: "'Helvetica', 'Arial', sans-serif"
                    }}
                >
                    {/* PDF Page Header */}
                    <div className="flex justify-between items-start mb-12 border-b-2 border-gray-900 pb-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">XCCM1 • Plateforme Pédagogique</p>
                            <h1 className="text-4xl font-black text-gray-900 leading-tight uppercase break-words max-w-[500px]">{title || "Sans Titre"}</h1>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-900">Date: {new Date().toLocaleDateString('fr-FR')}</p>
                            <p className="text-[10px] text-gray-500 uppercase">Document Certifié</p>
                        </div>
                    </div>

                    {/* PDF Course Structure Rendering */}
                    <div className="document-content">
                        {courseData && courseData.sections && courseData.sections.length > 0 ? (
                            courseData.sections.map((section: any, sIdx: number) => (
                                <div key={sIdx} className="mb-10">
                                    <h2 className="text-2xl font-bold mb-6 break-words" style={{ color: '#6432C8' }}>
                                        {section.title}
                                    </h2>
                                    <div className="w-full h-0.5 mb-8" style={{ backgroundColor: '#6432C8' }} />

                                    {section.chapters && section.chapters.map((chapter: any, cIdx: number) => (
                                        <div key={cIdx} className="mb-8">
                                            <h3 className="text-xl font-bold mb-4 break-words" style={{ color: '#008250' }}>
                                                {chapter.title}
                                            </h3>

                                            {chapter.paragraphs && chapter.paragraphs.map((paragraph: any, pIdx: number) => (
                                                <div key={pIdx} className="mb-6">
                                                    <h4 className="text-lg font-bold mb-3 break-words" style={{ color: '#E6B400' }}>
                                                        {paragraph.title}
                                                    </h4>

                                                    <div className="max-w-none text-gray-800 text-justify">
                                                        <CourseContentRenderer content={paragraph.content} forceLight={true} />
                                                    </div>

                                                    {paragraph.notions && paragraph.notions.length > 0 && (
                                                        <div className="mt-4 ml-6 text-gray-700">
                                                            <ul className="list-disc ml-5">
                                                                {paragraph.notions.map((notion: string, nIdx: number) => (
                                                                    <li key={nIdx} className="text-sm italic">{notion}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                                <FileText size={64} className="mb-4 opacity-20" />
                                <p className="text-lg font-medium opacity-30 italic">Structurez votre cours pour voir l'aperçu...</p>
                            </div>
                        )}
                    </div>

                    {/* PDF Page Footer */}
                    <div className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-medium italic">
                        <p>© {new Date().getFullYear()} XCCM1 - Tous droits réservés</p>
                        <p>Document généré par XCCM1 Editor</p>
                    </div>
                </div>
            </div>

            <DownloadOptions
                isOpen={showDownloadModal}
                onClose={() => setShowDownloadModal(false)}
                onSelectPdf={handleDownloadPDF}
                onSelectWord={handleDownloadDocx}
                isPdfLoading={pdfGenerating}
                isWordLoading={docxGenerating}
            />
        </div>
    );
};

export default PdfPreview;
