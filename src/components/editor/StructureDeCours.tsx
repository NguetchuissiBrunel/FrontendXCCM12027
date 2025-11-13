/**
 * STRUCTURE DE COURS COMPONENT
 * 
 * Right sidebar panel displaying hierarchical course library.
 * Full hierarchy: Course → Section → Chapter → Paragraph → Notion → Exercise
 * 
 * @author JOHAN
 * @date November 2025
 */

'use client';

import React, { useState } from 'react';
import { FaTimes, FaBook, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { mockCourseData } from '@/data/mockEditorData';
import { Course, Section, Chapter, Paragraph, ItemType, ITEM_COLORS } from '@/types/editor.types';

interface StructureDeCoursProps {
  onClose: () => void;
}

// Helper to get background color class for items
const getItemBgClass = (type: ItemType) => {
  const bgColors: Record<ItemType, string> = {
    course: 'bg-blue-50 border-blue-200 hover:border-blue-300',
    section: 'bg-purple-50 border-purple-200 hover:border-purple-300',
    chapter: 'bg-green-50 border-green-200 hover:border-green-300',
    paragraph: 'bg-orange-50 border-orange-200 hover:border-orange-300',
    notion: 'bg-red-50 border-red-200 hover:border-red-300',
    exercise: 'bg-indigo-50 border-indigo-200 hover:border-indigo-300',
  };
  return bgColors[type];
};

export const StructureDeCours: React.FC<StructureDeCoursProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<ItemType[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Filter types with proper badge classes matching globals.css
  const filterTypes: { type: ItemType; label: string; badgeClass: string }[] = [
    { type: 'course', label: 'Cours', badgeClass: 'badge-course' },
    { type: 'section', label: 'Partie', badgeClass: 'badge-section' },
    { type: 'chapter', label: 'Chapitre', badgeClass: 'badge-chapter' },
    { type: 'paragraph', label: 'Paragraphe', badgeClass: 'badge-paragraph' },
    { type: 'notion', label: 'Notion', badgeClass: 'badge-notion' },
    { type: 'exercise', label: 'Exercice', badgeClass: 'badge-exercise' },
  ];

  const toggleFilter = (type: ItemType) => {
    setActiveFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleExpansion = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Check if item matches filters
  const matchesFilters = (type: ItemType, title: string) => {
    // Search filter
    if (searchTerm && !title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (activeFilters.length > 0 && !activeFilters.includes(type)) {
      return false;
    }
    
    return true;
  };

  // Render notion
  const renderNotion = (notion: string, parentId: string, index: number) => {
    const itemId = `${parentId}-notion-${index}`;
    if (!matchesFilters('notion', notion)) return null;

    return (
      <div
        key={itemId}
        className={`ml-8 flex cursor-pointer items-center gap-2 rounded-md border p-2 transition-all hover:shadow-sm ${getItemBgClass('notion')}`}
      >
        <div 
          className="h-2 w-2 shrink-0 rounded-full" 
          style={{ backgroundColor: ITEM_COLORS.notion }}
        />
        <span className="flex-1 text-xs" style={{ color: ITEM_COLORS.notion }}>
          {notion}
        </span>
      </div>
    );
  };

  // Render paragraph
  const renderParagraph = (paragraph: Paragraph, parentId: string, index: number) => {
    const itemId = `${parentId}-para-${index}`;
    const isExpanded = expandedItems.has(itemId);
    const hasNotions = paragraph.notions && paragraph.notions.length > 0;
    const hasExercise = !!paragraph.exercise;
    
    if (!matchesFilters('paragraph', paragraph.title)) return null;

    return (
      <div key={itemId} className="ml-6">
        <div
          className={`flex cursor-pointer items-center justify-between rounded-md border p-2.5 transition-all hover:shadow-sm ${getItemBgClass('paragraph')}`}
          onClick={() => hasNotions || hasExercise ? toggleExpansion(itemId) : null}
        >
          <div className="flex items-center gap-2">
            {(hasNotions || hasExercise) && (
              <button className="shrink-0">
                {isExpanded ? (
                  <FaChevronDown className="h-3 w-3" style={{ color: ITEM_COLORS.paragraph }} />
                ) : (
                  <FaChevronRight className="h-3 w-3" style={{ color: ITEM_COLORS.paragraph }} />
                )}
              </button>
            )}
            <div 
              className="h-2 w-2 shrink-0 rounded-full" 
              style={{ backgroundColor: ITEM_COLORS.paragraph }}
            />
            <span className="text-xs font-medium" style={{ color: ITEM_COLORS.paragraph }}>
              {paragraph.title}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {/* Notions */}
            {hasNotions && paragraph.notions.map((notion, idx) => 
              renderNotion(notion, itemId, idx)
            )}
            
            {/* Exercise */}
            {hasExercise && matchesFilters('exercise', 'Exercice') && (
              <div className={`ml-8 flex items-center gap-2 rounded-md border p-2 transition-all hover:shadow-sm ${getItemBgClass('exercise')}`}>
                <div 
                  className="h-2 w-2 shrink-0 rounded-full" 
                  style={{ backgroundColor: ITEM_COLORS.exercise }}
                />
                <span className="text-xs font-medium" style={{ color: ITEM_COLORS.exercise }}>
                  Exercice ({paragraph.exercise!.questions.length} questions)
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render chapter
  const renderChapter = (chapter: Chapter, parentId: string, index: number) => {
    const itemId = `${parentId}-chap-${index}`;
    const isExpanded = expandedItems.has(itemId);
    const hasParagraphs = chapter.paragraphs && chapter.paragraphs.length > 0;
    
    if (!matchesFilters('chapter', chapter.title)) return null;

    return (
      <div key={itemId} className="ml-4">
        <div
          className={`flex cursor-pointer items-center justify-between rounded-md border p-2.5 transition-all hover:shadow-sm ${getItemBgClass('chapter')}`}
          onClick={() => hasParagraphs ? toggleExpansion(itemId) : null}
        >
          <div className="flex items-center gap-2">
            {hasParagraphs && (
              <button className="shrink-0">
                {isExpanded ? (
                  <FaChevronDown className="h-3 w-3" style={{ color: ITEM_COLORS.chapter }} />
                ) : (
                  <FaChevronRight className="h-3 w-3" style={{ color: ITEM_COLORS.chapter }} />
                )}
              </button>
            )}
            <div 
              className="h-2 w-2 shrink-0 rounded-full" 
              style={{ backgroundColor: ITEM_COLORS.chapter }}
            />
            <span className="text-sm font-medium" style={{ color: ITEM_COLORS.chapter }}>
              {chapter.title}
            </span>
          </div>
        </div>

        {isExpanded && hasParagraphs && (
          <div className="mt-1 space-y-1">
            {chapter.paragraphs.map((para, idx) => 
              renderParagraph(para, itemId, idx)
            )}
          </div>
        )}
      </div>
    );
  };

  // Render section
  const renderSection = (section: Section, parentId: string, index: number) => {
    const itemId = `${parentId}-sec-${index}`;
    const isExpanded = expandedItems.has(itemId);
    const hasChapters = section.chapters && section.chapters.length > 0;
    
    if (!matchesFilters('section', section.title)) return null;

    return (
      <div key={itemId} className="ml-2">
        <div
          className={`flex cursor-pointer items-center justify-between rounded-md border p-3 transition-all hover:shadow-sm ${getItemBgClass('section')}`}
          onClick={() => hasChapters ? toggleExpansion(itemId) : null}
        >
          <div className="flex items-center gap-2">
            {hasChapters && (
              <button className="shrink-0">
                {isExpanded ? (
                  <FaChevronDown className="h-3 w-3" style={{ color: ITEM_COLORS.section }} />
                ) : (
                  <FaChevronRight className="h-3 w-3" style={{ color: ITEM_COLORS.section }} />
                )}
              </button>
            )}
            <div 
              className="h-2 w-2 shrink-0 rounded-full" 
              style={{ backgroundColor: ITEM_COLORS.section }}
            />
            <span className="text-sm font-medium" style={{ color: ITEM_COLORS.section }}>
              {section.title}
            </span>
          </div>
        </div>

        {isExpanded && hasChapters && (
          <div className="mt-1 space-y-1">
            {section.chapters.map((chap, idx) => 
              renderChapter(chap, itemId, idx)
            )}
          </div>
        )}
      </div>
    );
  };

  // Render course
  const renderCourse = (course: Course, index: number) => {
    const itemId = `course-${index}`;
    const isExpanded = expandedItems.has(itemId);
    const hasSections = course.sections && course.sections.length > 0;
    
    if (!matchesFilters('course', course.title)) return null;

    return (
      <div key={itemId}>
        <div
          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:shadow-md ${getItemBgClass('course')}`}
          onClick={() => hasSections ? toggleExpansion(itemId) : null}
        >
          <div className="flex items-center gap-2.5">
            <FaBook className="h-5 w-5 shrink-0" style={{ color: ITEM_COLORS.course }} />
            <span className="text-sm font-medium line-clamp-2" style={{ color: ITEM_COLORS.course }}>
              {course.title}
            </span>
          </div>
          {hasSections && (
            <button className="shrink-0 opacity-70 hover:opacity-100" style={{ color: ITEM_COLORS.course }}>
              {isExpanded ? (
                <FaChevronDown className="h-4 w-4" />
              ) : (
                <FaChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {isExpanded && hasSections && (
          <div className="mt-2 space-y-1.5">
            {course.sections.map((sec, idx) => 
              renderSection(sec, itemId, idx)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-800">Importer des connaissances</h2>
        <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
          <FaTimes className="text-sm" />
        </button>
      </div>

      {/* Search */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5">
          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium text-gray-600">Filtres</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filterTypes.map(({ type, label, badgeClass }) => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`${badgeClass} cursor-pointer rounded-full px-2.5 py-1 text-xs transition-all ${
                activeFilters.includes(type) 
                  ? 'ring-2 ring-purple-400 ring-offset-1' 
                  : 'hover:opacity-90'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Course List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-2">
          {mockCourseData.map((course, idx) => renderCourse(course, idx))}
        </div>
      </div>
    </div>
  );
};

export default StructureDeCours;