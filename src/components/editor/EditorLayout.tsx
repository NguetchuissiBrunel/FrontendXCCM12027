/**
 * EDITOR LAYOUT COMPONENT
 * 
 * Main layout container for the XCCM editor.
 * Implements three-column layout: TOC (left) | Main Editor (center) | Right Panel
 * 
 * Based on original XCCM implementation structure.
 * 
 * @author JOHAN
 * @date November 2025
 */

'use client';

import React, { useState } from 'react';

interface EditorLayoutProps {
  children?: React.ReactNode;
}

/**
 * EditorLayout Component
 * 
 * Layout structure:
 * - Header: Fixed top toolbar (64px height)
 * - Content: Three columns below header
 *   - Left: Table of Contents (288px fixed)
 *   - Center: Main editor (flexible width)
 *   - Right: IconBar (40px) + Right Panel (288px when open)
 */
export const EditorLayout: React.FC<EditorLayoutProps> = ({ children }) => {
  // State for toggling right panel visibility
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50">
      {/* HEADER - Fixed top toolbar */}
      <header className="flex h-16 items-center border-b border-gray-200 bg-white px-4 shadow-sm">
        <div className="flex w-full items-center justify-between">
          {/* Left: Logo/Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-purple-600">XCCM</h1>
            <span className="text-sm text-gray-500">Éditeur</span>
          </div>

          {/* Center: Document title (placeholder) */}
          <div className="flex-1 px-8">
            <input
              type="text"
              placeholder="Titre du document"
              className="w-full max-w-md rounded border border-gray-300 px-3 py-1 text-center text-lg focus:border-purple-500 focus:outline-none"
              defaultValue="Nouveau Document"
            />
          </div>

          {/* Right: Actions (placeholder) */}
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
          <div className="p-4">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">
              Table des Matières
            </h2>
            {/* TOC content will be added in next phase */}
            <div className="text-sm text-gray-500">
              Navigation à venir...
            </div>
          </div>
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
          {/* IconBar - Always visible */}
          <div className="flex w-10 flex-col items-center gap-4 border-l border-gray-200 bg-white py-4">
            {/* Toggle button for right panel */}
            <button
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className={`flex h-10 w-10 items-center justify-center rounded transition-colors ${
                isRightPanelOpen
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Structure de cours"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Additional icon buttons can be added here */}
          </div>

          {/* Right Panel - Conditionally visible */}
          {isRightPanelOpen && (
            <aside className="w-72 border-l border-gray-200 bg-white overflow-y-auto">
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">
                    Structure de cours
                  </h2>
                  <button
                    onClick={() => setIsRightPanelOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Search bar placeholder */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Filter pills placeholder */}
                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium text-gray-600">Filtres</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge-course rounded-full px-2 py-1 text-xs">Cours</span>
                    <span className="badge-section rounded-full px-2 py-1 text-xs">Partie</span>
                    <span className="badge-chapter rounded-full px-2 py-1 text-xs">Chapitre</span>
                    <span className="badge-paragraph rounded-full px-2 py-1 text-xs">Paragraphe</span>
                    <span className="badge-notion rounded-full px-2 py-1 text-xs">Notion</span>
                    <span className="badge-exercise rounded-full px-2 py-1 text-xs">Exercice</span>
                  </div>
                </div>

                {/* Course structure content will be added in next phase */}
                <div className="text-sm text-gray-500">
                  Structure à venir...
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;