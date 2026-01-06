/**
 * XCCM Editor Type Definitions
 * 
 * Type definitions extracted from the original XCCM implementation.
 * These types match the structure used in the working editor.
 * 
 * @author JOHAN
 * @date November 2025
 */

// ============================================================================
// ITEM TYPES - Content hierarchy types
// ============================================================================

/**
 * Types of content items in the XCCM system
 * Matches the original implementation exactly
 */
export type ItemType = 'course' | 'section' | 'chapter' | 'paragraph' | 'notion' | 'exercise';

/**
 * French labels for each item type
 * Used in UI display (filter pills, badges, etc.)
 */
export const typeLabels: Record<ItemType, string> = {
  'course': 'Cours',
  'section': 'Partie',
  'chapter': 'Chapitre',
  'paragraph': 'Paragraphe',
  'notion': 'Notion',
  'exercise': 'Exercice'
};

// ============================================================================
// AUTHOR & METADATA
// ============================================================================

/**
 * Author information for courses
 */
export interface Author {
  name: string;
  image: string;
}

// ============================================================================
// EXERCISE TYPES
// ============================================================================

/**
 * Question within an exercise
 */
export interface Question {
  question: string;
  options: string[];
  réponse: string;  // Correct answer
}

/**
 * Exercise containing multiple questions
 */
export interface Exercise {
  questions: Question[];
}

// ============================================================================
// NOTION TYPE
// ============================================================================

/**
 * Notion - smallest unit of reusable content
 * Can be standalone or part of a paragraph
 */
export interface Notion {
  id?: string;
  title?: string;
  content?: string;
  author?: string;
}

// ============================================================================
// CONTENT HIERARCHY - Bottom to Top
// ============================================================================

/**
 * Paragraph - contains notions and optional exercise
 */
export interface Paragraph {
  title: string;
  content: string;
  notions: string[];  // Array of notion content (strings)
  exercise?: Exercise;
}

/**
 * Chapter - contains paragraphs
 */
export interface Chapter {
  title: string;
  paragraphs: Paragraph[];
}

/**
 * Section (Partie) - contains chapters
 */
export interface Section {
  title: string;
  chapters: Chapter[];
}

/**
 * Course - top level, contains sections
 */
export interface Course {
  id: number;
  title: string;
  category?: string;
  image: string;
  views: number;
  likes: number;
  downloads: number;
  author: Author;
  conclusion: string;
  learningObjectives: string[];
  sections: Section[];
}

/**
 * Course data wrapper
 */
export interface CourseData {
  courses: Course[];
}

// ============================================================================
// TABLE OF CONTENTS (TOC) - Left Sidebar
// ============================================================================

/**
 * Item in the Table of Contents tree
 * Represents the hierarchical structure in the left sidebar
 */
export interface TableOfContentsItem {
  id: string;
  title: string;
  type: ItemType;
  level: number;
  number: string;  // Hierarchical numbering (e.g., "1.1.1")
  children: TableOfContentsItem[];
  collapsed?: boolean;
  content?: string;  // HTML content for this item
}

// ============================================================================
// RIGHT SIDEBAR - Structure de cours
// ============================================================================

/**
 * Flattened item from course structure for display in right sidebar
 * Used for filtering, searching, and drag-and-drop
 */
export interface CourseStructureItem {
  id: string;
  title: string;
  type: ItemType;
  parentId: string | null;
  content?: string;
  data?: Course | Section | Chapter | Paragraph | Notion | Exercise;
}

/**
 * Props for the NotionsSidebar (right panel)
 */
export interface NotionsSidebarProps {
  courseData: Course[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  notions?: Notion[];  // Optional for backwards compatibility
  onDragToTableOfContents?: (tocItems: TableOfContentsItem[]) => void;
}

// ============================================================================
// EDITOR STATE
// ============================================================================

/**
 * Page data for multi-page editor
 */
export interface PageData {
  content: string;
  history: { content: string }[];
  historyIndex: number;
}

/**
 * Editor content props
 */
export interface EditorContentProps {
  course: Course;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}

// ============================================================================
// COLOR SCHEME - All 6 types
// ============================================================================

/**
 * Color mapping for all item types
 * Used throughout the application for consistent visual hierarchy
 */
export interface ColorScheme {
  course: string;
  section: string;
  chapter: string;
  paragraph: string;
  notion: string;
  exercise: string;
}

/**
 * Hex colors for each content type
 * These are the primary colors used in badges, borders, etc.
 */
export const ITEM_COLORS: ColorScheme = {
  course: '#3B82F6',      // Blue - Course level
  section: '#8B5CF6',     // Purple/Violet - Section (Partie)
  chapter: '#10B981',     // Green - Chapter (Chapitre)
  paragraph: '#F59E0B',   // Orange - Paragraph (Paragraphe)
  notion: '#EF4444',      // Red - Notion
  exercise: '#6366F1',    // Indigo - Exercise
};

/**
 * Tailwind color classes for item backgrounds (right sidebar)
 * Light backgrounds with colored text and borders
 */
export const getItemColorClasses = (type: ItemType): string => {
  const colorMap: Record<ItemType, string> = {
    'course': 'bg-blue-100 text-blue-800 border-blue-200',
    'section': 'bg-purple-100 text-purple-800 border-purple-200',
    'chapter': 'bg-green-100 text-green-800 border-green-200',
    'paragraph': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'notion': 'bg-red-100 text-red-800 border-red-200',
    'exercise': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };
  return colorMap[type];
};


export const XCCM_KNOWLEDGE_MIME = "application/x-xccm-knowledge";

export type KnowledgeDragPayload = {
  id: string;
  type: "cours" | "partie" | "chapitre" | "paragraphe" | "notion";
  title: string;
  content?: string;
  children?: KnowledgeDragPayload[];
};

