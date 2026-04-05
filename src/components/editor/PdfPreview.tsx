"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, ZoomIn, ZoomOut, RefreshCw, Layers } from 'lucide-react';
import CourseContentRenderer from '../CourseContentRenderer';
import DownloadOptions from '../DownloadOptions';
import { transformTiptapToCourseData } from '@/utils/courseTransformer';
import { downloadCourseAsPDF } from '@/utils/DownloadPdf';
import { downloadCourseAsDocx } from '@/utils/DownloadDocx';
import { toast } from 'react-hot-toast';

interface PdfPreviewProps {
    content: any; // TipTap JSON
    title: string;
    onElementClick?: (id: string) => void;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ content, title, onElementClick }) => {
    const [scale, setScale] = useState(0.8);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const [docxGenerating, setDocxGenerating] = useState(false);
    const [courseData, setCourseData] = useState<any>(null);
    const [pageCount, setPageCount] = useState(1);
    const paperRef = useRef<HTMLDivElement>(null);

    // Calculate page count based on height
    useEffect(() => {
        if (!paperRef.current) return;

        const updatePageCount = () => {
            if (paperRef.current) {
                // Measure actual content height, excluding the separators we might have added
                // We do this by looking at paper-content height
                const contentEl = paperRef.current.querySelector('.pdf-page-content');
                if (!contentEl) return;
                
                const height = contentEl.getBoundingClientRect().height / scale;
                // Use a reliable conversion for 297mm to pixels
                const pageHeightPx = (297 * 96) / 25.4; // 96 DPI, 25.4 mm per inch

                if (pageHeightPx > 0) {
                    // Use a slightly smaller page height (1mm less) for calculations to be safe
                    // and avoid edge cases where content is exactly pageHeight and goes to next page
                    const count = Math.ceil(height / (pageHeightPx * 0.999));
                    const finalCount = Math.min(Math.max(1, count), 100);
                    
                    setPageCount(prev => prev !== finalCount ? finalCount : prev);
                }
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            updatePageCount();
        });

        const contentEl = paperRef.current.querySelector('.pdf-page-content');
        if (contentEl) {
            resizeObserver.observe(contentEl);
        }
        updatePageCount();

        return () => resizeObserver.disconnect();
    }, [courseData, content]);

    useEffect(() => {
        if (content) {
            try {
                const data = transformTiptapToCourseData({
                    title,
                    content: content,
                    category: t('defaultCategory'),
                    author: { name: t('defaultAuthor') }
                });
                setCourseData(data);
            } catch (err) {
                console.error("Transformation error:", err);
            }
        }
    }, [content, title]);

    const previewTitle = courseData?.title || title || "Aperçu PDF";

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
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/30 rounded-md border border-purple-100 dark:border-purple-800">
                        <Layers size={12} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 whitespace-nowrap">
                            {pageCount} {pageCount > 1 ? 'pages' : 'page'}
                        </span>
                    </div>
                </div>
            </div>
            {/* Preview Container */}
            <div className="flex-1 overflow-auto scrollbar-thin bg-gray-100 dark:bg-gray-900">
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
                        .interactive-heading {
                            cursor: pointer;
                            transition: background-color 0.2s;
                            padding-left: 4px;
                            border-radius: 4px;
                            margin-left: -4px;
                        }
                        .interactive-heading:hover {
                            background-color: rgba(100, 50, 200, 0.05);
                        }
                        /* Multi-page effect with robust CSS */
                        .pdf-preview-container {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            padding: 40px;
                            min-height: 100%;
                            width: 100%;
                            background-color: #f3f4f6;
                        }
                        .dark .pdf-preview-container {
                            background-color: #111827;
                        }
                        .pdf-preview-paper {
                            background-color: white !important;
                            /* Repeating gradient for page breaks */
                            background-image: linear-gradient(
                                to bottom,
                                white 0,
                                white 297mm,
                                #f3f4f6 297mm,
                                #f3f4f6 calc(297mm + 8px)
                            ) !important;
                            background-size: 100% calc(297mm + 8px) !important;
                            background-repeat: repeat-y !important;
                            
                            position: relative;
                            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                            width: 210mm;
                            min-height: 297mm;
                            transition: transform 0.2s ease;
                            flex-shrink: 0;
                            display: block;
                        }
                        
                        .dark .pdf-preview-paper {
                            background-image: linear-gradient(
                                to bottom,
                                white 0,
                                white 297mm,
                                #111827 297mm,
                                #111827 calc(297mm + 8px)
                            ) !important;
                        }

                        .pdf-page-content {
                            position: relative;
                            padding: 20mm;
                            min-height: 297mm;
                            height: auto !important; /* Prevent stretching */
                            z-index: 1;
                            background-color: transparent !important;
                        }
                        .document-content {
                            /* Create masks to avoid text overlapping headers and footers */
                            /* Masking areas: 0-18mm (Top margin) and 278-297mm (Bottom margin) */
                            mask-image: repeating-linear-gradient(
                                to bottom,
                                transparent 0px,
                                transparent 18mm,
                                black 18mm,
                                black 278mm,
                                transparent 278mm,
                                transparent 297mm
                            );
                            -webkit-mask-image: repeating-linear-gradient(
                                to bottom,
                                transparent 0px,
                                transparent 18mm,
                                black 18mm,
                                black 278mm,
                                transparent 278mm,
                                transparent 297mm
                            );
                        }
                        .page-header {
                            position: absolute;
                            left: 20mm;
                            right: 20mm;
                            height: 10mm;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            border-bottom: 0.5px solid #f3f4f6;
                            font-size: 7px;
                            color: #9ca3af;
                            text-transform: uppercase;
                            letter-spacing: 0.1em;
                            z-index: 10;
                            pointer-events: none;
                        }
                        .page-footer {
                            position: absolute;
                            left: 20mm;
                            right: 20mm;
                            height: 10mm;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            border-top: 0.5px solid #f3f4f6;
                            font-size: 7px;
                            color: #9ca3af;
                            z-index: 10;
                            pointer-events: none;
                        }
                    `}
                </style>
                <div className="pdf-preview-container">
                    <div
                        style={{ 
                            transform: `scale(${scale})`, 
                            transformOrigin: 'top center',
                            width: '210mm',
                            height: `${pageCount * 297 * scale}mm`, // Exact page height
                            marginBottom: '100px'
                        }}
                    >
                        <div
                            ref={paperRef}
                            className="text-gray-900 pdf-preview-paper"
                            style={{
                                fontFamily: "'Helvetica', 'Arial', sans-serif"
                            }}
                        >
                            {/* Render Headers and Footers for each page */}
                            {Array.from({ length: pageCount }).map((_, i) => (
                                <React.Fragment key={i}>
                                    <div 
                                        className="page-header" 
                                        style={{ top: `calc(${i * 297}mm + 5mm)` }}
                                    >
                                        <span>XCCM1 • Plateforme Pédagogique</span>
                                        <span>{previewTitle || "Sans Titre"}</span>
                                    </div>
                                    <div 
                                        className="page-footer" 
                                        style={{ top: `calc(${(i + 1) * 297}mm - 12mm)` }}
                                    >
                                        <span>© {new Date().getFullYear()} XCCM1</span>
                                        <span>{i + 1} / {pageCount}</span>
                                    </div>
                                </React.Fragment>
                            ))}

                            <div className="pdf-page-content">
                                {/* PDF Course Structure Rendering */}
                                <div className="document-content">
                                    {courseData && (courseData.sections && courseData.sections.length > 0 || courseData.title) ? (
                                    <>
                                        {courseData.title && (
                                            <div className="mb-8">
                                                <h1 className="text-4xl font-black mb-4 break-words" style={{ color: '#4430B5' }}>
                                                    {courseData.title}
                                                </h1>
                                                {courseData.introduction && (
                                                    <div className="mb-4 text-gray-700 italic border-l-4 border-purple-200 pl-4 py-2">
                                                        {courseData.introduction}
                                                    </div>
                                                )}
                                                <div className="w-full h-0.5 mb-6" style={{ backgroundColor: '#6432C8' }} />
                                            </div>
                                        )}

                                        {courseData.sections && courseData.sections.map((section: any, sIdx: number) => (
                                            <div key={sIdx} className="mb-10">
                                                <h2 
                                                    className={`text-2xl font-bold mb-6 break-words ${onElementClick && section.id ? 'interactive-heading' : ''}`}
                                                    style={{ color: '#6432C8' }}
                                                    onClick={() => onElementClick && section.id && onElementClick(section.id)}
                                                >
                                                    {section.title}
                                                </h2>
                                                <div className="w-full h-0.5 mb-4" style={{ backgroundColor: '#6432C8' }} />

                                                {section.introduction && (
                                                    <div className="mb-6 text-gray-700 italic border-l-4 border-purple-200 pl-4 py-1">
                                                        {section.introduction}
                                                    </div>
                                                )}

                                                {section.chapters && section.chapters.map((chapter: any, cIdx: number) => (
                                                    <div key={cIdx} className="mb-8">
                                                        <h3 
                                                            className={`text-xl font-bold mb-4 break-words ${onElementClick && chapter.id ? 'interactive-heading' : ''}`}
                                                            style={{ color: '#008250' }}
                                                            onClick={() => onElementClick && chapter.id && onElementClick(chapter.id)}
                                                        >
                                                            {chapter.title}
                                                        </h3>

                                                        {chapter.introduction && (
                                                            <div className="mb-4 text-gray-700 italic border-l-4 border-green-200 pl-4 py-1">
                                                                {chapter.introduction}
                                                            </div>
                                                        )}

                                                        {chapter.subItems && chapter.subItems.map((subItem: any, idx: number) => {
                                                            if (subItem.type === 'paragraph') {
                                                                const paragraph = subItem.data;
                                                                return (
                                                                    <div key={idx} className="mb-6">
                                                                        <h4 
                                                                            className={`text-lg font-bold mb-3 break-words ${onElementClick && paragraph.id ? 'interactive-heading' : ''}`}
                                                                            style={{ color: '#E6B400' }}
                                                                            onClick={() => onElementClick && paragraph.id && onElementClick(paragraph.id)}
                                                                        >
                                                                            {paragraph.title}
                                                                        </h4>
                                                                        {paragraph.introduction && (
                                                                            <div className="mb-3 text-gray-700 italic border-l-4 border-yellow-200 pl-4 py-1">
                                                                                {paragraph.introduction}
                                                                            </div>
                                                                        )}
                                                                        <div className="max-w-none text-gray-800 text-justify">
                                                                            <CourseContentRenderer content={paragraph.content} forceLight={true} />
                                                                        </div>
                                                                        {paragraph.subItems && paragraph.subItems.length > 0 && (
                                                                            <div className="mt-4">
                                                                                {paragraph.subItems.map((pSub: any, psIdx: number) => (
                                                                                    <div key={psIdx} className="mb-4 last:mb-0">
                                                                                        {pSub.type === 'notion' ? (
                                                                                            <div className="ml-6 text-gray-700">
                                                                                                <ul className="list-disc ml-5">
                                                                                                    <li className="text-sm italic">{pSub.data}</li>
                                                                                                </ul>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="p-4 bg-yellow-50 rounded-lg">
                                                                                                <h5 className="text-yellow-800 font-bold mb-3 flex items-center gap-2 text-sm">
                                                                                                    <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                                                                                                    Exercice
                                                                                                </h5>
                                                                                                {pSub.data.content ? (
                                                                                                    <CourseContentRenderer content={pSub.data.content} forceLight={true} />
                                                                                                ) : (
                                                                                                    <p className="text-sm text-yellow-600 font-medium">{pSub.data.title}</p>
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            } else if (subItem.type === 'exercise') {
                                                                const ex = subItem.data;
                                                                return (
                                                                    <div key={idx} className="mt-4 mb-6 p-4 bg-green-50 rounded-lg">
                                                                        <h4 className="text-green-800 font-bold mb-3 flex items-center gap-2 text-sm">
                                                                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                                                            Exercice du chapitre
                                                                        </h4>
                                                                        {ex.content ? (
                                                                            <CourseContentRenderer content={ex.content} forceLight={true} />
                                                                        ) : (
                                                                            <p className="text-sm text-green-600 font-medium">{ex.title}</p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                ))}

                                                {section.subItems && section.subItems.map((subItem: any, idx: number) => {
                                                    if (subItem.type === 'exercise') {
                                                        const ex = subItem.data;
                                                        return (
                                                            <div key={idx} className="mt-4 mb-8 p-4 bg-purple-50 rounded-lg">
                                                                <h4 className="text-purple-800 font-bold mb-3 flex items-center gap-2">
                                                                    <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                                                                    Exercice de la section
                                                                </h4>
                                                                {ex.content ? (
                                                                    <CourseContentRenderer content={ex.content} forceLight={true} />
                                                                ) : (
                                                                    <p className="text-sm text-purple-600 font-medium">{ex.title}</p>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        ))}
                                    </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                                            <FileText size={64} className="mb-4 opacity-20" />
                                            <p className="text-lg font-medium opacity-30 italic">Structurez votre cours pour voir l'aperçu...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
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
