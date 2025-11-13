/**
 * MAIN EDITOR COMPONENT
 * 
 * WYSIWYG editor matching original XCCM implementation styling.
 * 
 * @author JOHAN
 * @date November 2025
 */

'use client';

import React, { useState, useRef } from 'react';
import { 
  FaBold, FaItalic, FaUnderline, FaStrikethrough, FaSubscript, FaSuperscript,
  FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify,
  FaLink, FaImage, FaTable, FaCode, FaQuoteLeft
} from 'react-icons/fa';

interface MainEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export const MainEditor: React.FC<MainEditorProps> = ({ 
  initialContent = '<p>Commencez à écrire votre contenu ici...</p>', 
  onContentChange 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current && onContentChange) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  const ToolbarButton = ({ 
    icon, 
    command, 
    value, 
    title 
  }: { 
    icon: React.ReactNode; 
    command: string; 
    value?: string; 
    title: string;
  }) => (
    <button
      type="button"
      onClick={() => execCommand(command, value)}
      className="flex h-9 w-9 items-center justify-center rounded text-gray-600 transition-colors hover:bg-purple-100 hover:text-purple-700"
      title={title}
    >
      <span className="text-base">{icon}</span>
    </button>
  );

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Toolbar Section */}
      <div className="border-b border-gray-200 bg-white">
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2.5">
          {/* Text Style Group */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
            <span className="mr-2 text-sm font-medium text-gray-600">Mise en forme</span>
            <ToolbarButton icon={<FaBold />} command="bold" title="Gras" />
            <ToolbarButton icon={<FaItalic />} command="italic" title="Italique" />
            <ToolbarButton icon={<FaUnderline />} command="underline" title="Souligné" />
            <ToolbarButton icon={<FaStrikethrough />} command="strikeThrough" title="Barré" />
            <ToolbarButton icon={<FaSubscript />} command="subscript" title="Indice" />
            <ToolbarButton icon={<FaSuperscript />} command="superscript" title="Exposant" />
          </div>

          {/* Font & Size */}
          <div className="flex items-center gap-2 border-r border-gray-200 px-3">
            <span className="text-sm font-medium text-gray-600">Police</span>
            <select className="rounded border border-gray-300 px-2 py-1 text-sm">
              <option>Arial</option>
              <option>Times New Roman</option>
              <option>Courier New</option>
            </select>
            <select className="rounded border border-gray-300 px-2 py-1 text-sm">
              <option>16px</option>
              <option>14px</option>
              <option>18px</option>
              <option>20px</option>
            </select>
          </div>

          {/* Page Layout Group */}
          <div className="flex items-center gap-1 border-r border-gray-200 px-3">
            <span className="mr-2 text-sm font-medium text-gray-600">Mise en page</span>
            <ToolbarButton icon={<FaAlignLeft />} command="justifyLeft" title="Gauche" />
            <ToolbarButton icon={<FaAlignCenter />} command="justifyCenter" title="Centré" />
            <ToolbarButton icon={<FaAlignRight />} command="justifyRight" title="Droite" />
            <ToolbarButton icon={<FaAlignJustify />} command="justifyFull" title="Justifié" />
            <ToolbarButton icon={<FaListUl />} command="insertUnorderedList" title="Puces" />
            <ToolbarButton icon={<FaListOl />} command="insertOrderedList" title="Numérotée" />
          </div>

          {/* Insert Group */}
          <div className="flex items-center gap-1 px-3">
            <ToolbarButton icon={<FaLink />} command="createLink" title="Lien" />
            <ToolbarButton icon={<FaImage />} command="insertImage" title="Image" />
            <ToolbarButton icon={<FaTable />} command="insertHTML" title="Tableau" />
            <ToolbarButton icon={<FaCode />} command="formatBlock" value="pre" title="Code" />
            <ToolbarButton icon={<FaQuoteLeft />} command="formatBlock" value="blockquote" title="Citation" />
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-center border-b border-gray-200 bg-white py-1.5">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30"
        >
          ◀
        </button>
        <span className="mx-4 text-xs text-gray-600">
          {currentPage}/{totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30"
        >
          ▶
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl">
          {/* A4 Page with Purple Border */}
          <div 
            className="relative min-h-[1056px] rounded-lg bg-white shadow-lg"
            style={{
              border: '3px solid #a855f7',
              padding: '60px'
            }}
          >
            {/* Page number indicator */}
            <div className="absolute bottom-4 right-6 text-xs text-gray-400">
              Page {currentPage} / {totalPages}
            </div>

            {/* Editable content */}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              className="min-h-[900px] outline-none"
              dangerouslySetInnerHTML={{ __html: initialContent }}
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#1f2937'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainEditor;