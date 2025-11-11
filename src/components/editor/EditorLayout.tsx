/**
 * EDITOR LAYOUT COMPONENT
 * 
 * Main layout container for the XCCM editor.
 * Implements three-column layout: TOC (left) | Main Editor (center) | IconBar + Panels (right)
 * 
 * Based on original XCCM implementation structure.
 * Right sidebar has 6 different panels toggled by icon bar.
 * 
 * @author JOHAN
 * @date November 2025
 */

'use client';

import React, { useState } from 'react';
import { 
  FaCloudUploadAlt, 
  FaInfo, 
  FaComments, 
  FaFolderOpen, 
  FaChalkboardTeacher, 
  FaCog,
  FaSave,
  FaPaperPlane,
  FaTimes
} from 'react-icons/fa';
import TableOfContents from './TableOfContents';
import { mockTOCItems } from '@/data/mockEditorData';

interface EditorLayoutProps {
  children?: React.ReactNode;
}

/**
 * Right panel types matching original implementation
 */
type RightPanelType = 'structure' | 'info' | 'feedback' | 'author' | 'worksheet' | 'properties' | null;

/**
 * EditorLayout Component
 * 
 * Layout structure:
 * - Header: Fixed top toolbar (64px height)
 * - Content: Three columns below header
 *   - Left: Table of Contents (288px fixed)
 *   - Center: Main editor (flexible width)
 *   - Right: IconBar (64px fixed) + Panel (288px when open)
 */
export const EditorLayout: React.FC<EditorLayoutProps> = ({ children }) => {
  // State for active right panel
  const [activePanel, setActivePanel] = useState<RightPanelType>('structure');

  /**
   * Toggle panel - close if same icon clicked, switch if different
   */
  const togglePanel = (panelType: RightPanelType) => {
    if (activePanel === panelType) {
      setActivePanel(null); // Close if clicking same icon
    } else {
      setActivePanel(panelType); // Switch to new panel
    }
  };

  /**
   * IconBar Button Component
   */
  const IconButton = ({ 
    icon, 
    label, 
    panelType, 
    colorClass = 'text-purple-600' 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    panelType: RightPanelType;
    colorClass?: string;
  }) => {
    const isActive = activePanel === panelType;
    
    return (
      <button
        onClick={() => togglePanel(panelType)}
        className={`flex h-12 w-12 items-center justify-center rounded-lg transition-all ${
          isActive 
            ? `${colorClass} bg-purple-100` 
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
        title={label}
      >
        <span className="text-xl">{icon}</span>
      </button>
    );
  };

  return (
    <div className="mt-16 flex h-screen w-screen flex-col overflow-hidden bg-gray-50">
      {/* HEADER - Editor toolbar */}
      <header className="flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-4 shadow-sm">
        <div className="flex w-full items-center justify-between">
          {/* Left: Logo/Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-purple-600">XCCM</h1>
            <span className="text-sm text-gray-500">Éditeur</span>
          </div>

          {/* Center: Document title */}
          <div className="px-8">
            <input
              type="text"
              placeholder="Titre du document"
              className="w-80 rounded border border-gray-300 px-3 py-1 text-center text-lg focus:border-purple-500 focus:outline-none"
              defaultValue="Nouveau Document"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
              Sauvegarder
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - Three columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR - Table of Contents */}
        <aside className="w-72 border-r border-gray-200 bg-white overflow-y-auto">
          <TableOfContents 
            items={mockTOCItems}
            onItemClick={(itemId) => console.log('TOC item clicked:', itemId)}
          />
        </aside>

        {/* CENTER - Main Editor */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div className="mx-auto max-w-4xl">
            {/* Editor page container */}
            <div className="min-h-screen rounded-lg bg-white p-12 shadow-lg">
              {children || (
                <div className="text-gray-400">
                  Zone d'édition principale...
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT SECTION - IconBar + Panel */}
        <div className="flex">
          {/* Panel Area - Slides based on activePanel */}
          <div 
            className={`overflow-y-auto border-l border-gray-200 bg-white transition-all duration-300 ${
              activePanel ? 'w-72' : 'w-0 overflow-hidden'
            }`}
          >
            {/* PANEL 1: Structure de cours */}
            {activePanel === 'structure' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">
                    Structure de cours
                  </h2>
                  <button
                    onClick={() => setActivePanel(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Search bar */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Filter pills */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">Filtres</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge-course cursor-pointer rounded-full px-3 py-1 text-xs">
                      Cours
                    </span>
                    <span className="badge-section cursor-pointer rounded-full px-3 py-1 text-xs">
                      Partie
                    </span>
                    <span className="badge-chapter cursor-pointer rounded-full px-3 py-1 text-xs">
                      Chapitre
                    </span>
                    <span className="badge-paragraph cursor-pointer rounded-full px-3 py-1 text-xs">
                      Paragraphe
                    </span>
                    <span className="badge-notion cursor-pointer rounded-full px-3 py-1 text-xs">
                      Notion
                    </span>
                    <span className="badge-exercise cursor-pointer rounded-full px-3 py-1 text-xs">
                      Exercice
                    </span>
                  </div>
                </div>

                {/* Course structure placeholder */}
                <div className="space-y-2">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">
                        Introduction à la Théorie des Langages...
                      </span>
                      <button className="text-blue-600">▼</button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">
                        Les Frontières Émergentes...
                      </span>
                      <button className="text-blue-600">▶</button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">
                        Économie Circulaire...
                      </span>
                      <button className="text-blue-600">▶</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 2: Infos */}
            {activePanel === 'info' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">Infos</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Informations du cours à venir...
                </div>
              </div>
            )}

            {/* PANEL 3: Appréciations */}
            {activePanel === 'feedback' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">Appréciations</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Commentaires et questions à venir...
                </div>
              </div>
            )}

            {/* PANEL 4: Mes Cours */}
            {activePanel === 'author' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">Mes Cours</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Cours de l'auteur à venir...
                </div>
              </div>
            )}

            {/* PANEL 5: Travaux Dirigés */}
            {activePanel === 'worksheet' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">Travaux Dirigés</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Feuilles de TD à venir...
                </div>
              </div>
            )}

            {/* PANEL 6: Propriétés */}
            {activePanel === 'properties' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">Propriétés</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Propriétés du document à venir...
                </div>
              </div>
            )}
          </div>

          {/* Icon Bar - Always visible */}
          <div className="flex w-16 flex-col items-center gap-3 border-l border-gray-200 bg-white py-6">
            {/* Panel toggle icons */}
            <IconButton 
              icon={<FaCloudUploadAlt />} 
              label="Structure de cours" 
              panelType="structure"
              colorClass="text-purple-600"
            />
            <IconButton 
              icon={<FaInfo />} 
              label="Infos" 
              panelType="info"
              colorClass="text-blue-600"
            />
            <IconButton 
              icon={<FaComments />} 
              label="Appréciations" 
              panelType="feedback"
              colorClass="text-green-600"
            />
            <IconButton 
              icon={<FaFolderOpen />} 
              label="Mes Cours" 
              panelType="author"
              colorClass="text-orange-600"
            />
            <IconButton 
              icon={<FaChalkboardTeacher />} 
              label="Travaux Dirigés" 
              panelType="worksheet"
              colorClass="text-indigo-600"
            />
            <IconButton 
              icon={<FaCog />} 
              label="Propriétés" 
              panelType="properties"
              colorClass="text-gray-600"
            />

            {/* Spacer to push actions to bottom */}
            <div className="flex-1"></div>

            {/* Bottom action buttons */}
            <button 
              className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
              title="Sauvegarder"
            >
              <FaSave className="text-xl" />
            </button>
            <button 
              className="flex h-12 w-12 items-center justify-center rounded-lg text-green-600 hover:bg-green-50"
              title="Publier"
            >
              <FaPaperPlane className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;