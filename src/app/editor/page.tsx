/**
 * XCCM EDITOR PAGE
 * 
 * Main editor page route matching original XCCM implementation structure.
 * Route: /editor
 * 
 * CURRENT STATUS: Phase 1 - Foundation setup
 * - Type system from original implementation ✅
 * - Color scheme with all 6 types ✅  
 * - Mock data matching original structure ✅
 * 
 * @author JOHAN
 * @date November 2025
 */

import React from 'react';

/**
 * Editor Page Component
 * 
 * This will render the complete editor interface with:
 * - LEFT: Table of Contents (TOC) sidebar
 * - CENTER: Main editor (WYSIWYG)
 * - RIGHT: Structure de cours (course structure browser)
 * - IconBar for toggling right panel views
 */
export default function EditorPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50">
      {/* Temporary status page - will be replaced with actual editor in Phase 2 */}
      
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            XCCM Editor
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Phase 1: Foundation Complete ✅
          </p>
          <p className="mt-2 text-gray-500">
            Next: Phase 2 - Layout Structure
          </p>
          
          {/* Status Indicators */}
          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">
                Types from original implementation ✅
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">
                6 content types with colors ✅
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">
                Mock data structure matches original ✅
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">
                Editor route active (placeholder)
              </span>
            </div>
          </div>
          
          {/* Color Preview */}
          <div className="mt-8">
            <p className="mb-3 text-sm font-medium text-gray-700">Content Type Colors:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="badge-course rounded px-3 py-1 text-xs">Course</span>
              <span className="badge-section rounded px-3 py-1 text-xs">Section</span>
              <span className="badge-chapter rounded px-3 py-1 text-xs">Chapter</span>
              <span className="badge-paragraph rounded px-3 py-1 text-xs">Paragraph</span>
              <span className="badge-notion rounded px-3 py-1 text-xs">Notion</span>
              <span className="badge-exercise rounded px-3 py-1 text-xs">Exercise</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}