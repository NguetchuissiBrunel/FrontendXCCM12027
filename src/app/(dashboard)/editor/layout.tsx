/**
 * EDITOR LAYOUT OVERRIDE
 * 
 * This layout file overrides the root layout for the /editor route.
 * It bypasses the Navbar and Footer to provide a full-screen editor experience.
 * Wraps all editor pages with the EditorLayout component.
 * 
 * @author JOHAN
 * @date November 2025
 */

import EditorLayout from '@/components/editor/EditorLayout';

export default function EditorLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wrap all editor routes with the EditorLayout component
  return <EditorLayout>{children}</EditorLayout>;
}