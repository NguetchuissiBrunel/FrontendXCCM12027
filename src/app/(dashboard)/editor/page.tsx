/**
 * XCCM EDITOR PAGE
 * 
 * Main editor page route matching original XCCM implementation structure.
 * Route: /editor
 * 
 * 
 * @author JOHAN
 * @date November 2025
 */

'use client';
export const dynamic = 'force-dynamic';

import EditorLayout from '@/components/editor/EditorLayout';
import React from 'react';

/**
 * Editor Page Component
 * 
 * The EditorLayout wrapper is applied by editor/layout.tsx
 * This component just provides the content for the main editor area
 */
export default function EditorPage() {
  return (
    <EditorLayout/>
  );
}
