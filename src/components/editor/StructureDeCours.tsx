/**
 * STRUCTURE DE COURS COMPONENT - WITH SINGLE-SELECT FILTERS
 * 
 * Right sidebar panel displaying hierarchical course library.
 * Full hierarchy: Course → Section → Chapter → Paragraph → Notion → Exercise
 * 
 * Features:
 * - Dark mode support
 * - Single-select content type filters using exact color codes
 * - Shows selected type with full child hierarchy
 * - Search functionality
 * - Drag & drop support (full hierarchy preserved)
 * 
 * @author JOHAN
 * @date November 2025
 */

'use client';

import React, { useState } from 'react';
import { FaTimes, FaBook, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { mockCourseData, flattenCourseStructure } from '@/data/mockEditorData';
import { Course, Section, Chapter, Paragraph, ItemType, ITEM_COLORS } from '@/types/editor.types';

interface StructureDeCoursProps {
  onClose: () => void;
}

// Pre-flatten data once for performance
const flattenedItems = flattenCourseStructure(mockCourseData);

// Helper: Get full item with all nested children by ID
const getItemWithHierarchy = (itemId: string): any => {
  const root = flattenedItems.find(item => item.id === itemId);
  if (!root) return null;

  const buildTree = (current: any): any => {
    return {
      ...current,
      children: flattenedItems
        .filter(child => child.parentId === current.id)
        .map(buildTree)
    };
  };

  return buildTree(root);
};

// Helper to get background color class for items
const getItemBgClass = (type: ItemType) => {
  const bgColors: Record<ItemType, string> = {
    course: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700',
    section: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700',
    chapter: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700',
    paragraph: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700',
    notion: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700',
    exercise: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700',
  };
  return bgColors[type];
};

export const StructureDeCours: React.FC<StructureDeCoursProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ItemType | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Filter types with exact color codes from ITEM_COLORS
  const filterTypes: { type: ItemType; label: string; color: string }[] = [
    { type: 'course', label: 'Cours', color: ITEM_COLORS.course },
    { type: 'section', label: 'Partie', color: ITEM_COLORS.section },
    { type: 'chapter', label: 'Chapitre', color: ITEM_COLORS.chapter },
    { type: 'paragraph', label: 'Paragraphe', color: ITEM_COLORS.paragraph },
    { type: 'notion', label: 'Notion', color: ITEM_COLORS.notion },
    { type: 'exercise', label: 'Exercice', color: ITEM_COLORS.exercise },
  ];

  const toggleFilter = (type: ItemType) => {
    // Single-select: toggle off if same, otherwise switch to new type
    setActiveFilter(prev => prev === type ? null : type);
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

  // Check if item title matches search
  const matchesSearch = (title: string) => {
    if (!searchTerm) return true;
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  };

  // Check if we should show this type (based on active filter)
  const shouldShowType = (type: ItemType): boolean => {
    // No filter = show all
    if (!activeFilter) return true;
    
    // Show the filtered type and all its children
    const hierarchy: Record<ItemType, ItemType[]> = {
      'course': ['course', 'section', 'chapter', 'paragraph', 'notion', 'exercise'],
      'section': ['section', 'chapter', 'paragraph', 'notion', 'exercise'],
      'chapter': ['chapter', 'paragraph', 'notion', 'exercise'],
      'paragraph': ['paragraph', 'notion', 'exercise'],
      'notion': ['notion'],
      'exercise': ['exercise'],
    };
    
    return hierarchy[activeFilter].includes(type);
  };

  // Render notion (no search filtering)
  const renderNotion = (notion: string, parentId: string, index: number) => {
    const itemId = `${parentId}-notion-${index}`;
    
    // Check filter only (no search when rendering as child)
    if (!shouldShowType('notion')) return null;

    return (
      <div
        key={itemId}
        className={`ml-8 flex cursor-pointer items-center gap-2 rounded-md border p-2 transition-all hover:shadow-sm ${getItemBgClass('notion')}`}
        draggable
        onDragStart={(e) => {
          const fullItem = getItemWithHierarchy(itemId);
          if (fullItem) {
            e.dataTransfer.setData('application/xccm-knowledge', JSON.stringify(fullItem));
          }
        }}
      >
        <div 
          className="h-2 w-2 shrink-0 rounded-full" 
          style={{ backgroundColor: ITEM_COLORS.notion }}
        />
        <span className="flex-1 text-xs font-medium" style={{ color: ITEM_COLORS.notion }}>
          {notion}
        </span>
      </div>
    );
  };

  // Render paragraph as child (no search filtering)
  const renderParagraphChild = (paragraph: Paragraph, parentId: string, index: number) => {
    const itemId = `${parentId}-paragraph-${index}`;
    const isExpanded = expandedItems.has(itemId);
    const hasNotions = paragraph.notions && paragraph.notions.length > 0;
    const hasExercise = !!paragraph.exercise;

    if (!shouldShowType('paragraph')) return null;

    return (
      <div key={itemId}>
        <div
          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:shadow-md ${getItemBgClass('paragraph')}`}
          onClick={() => (hasNotions || hasExercise) ? toggleExpansion(itemId) : null}
          draggable
          onDragStart={(e) => {
            const fullItem = getItemWithHierarchy(itemId);
            if (fullItem) {
              e.dataTransfer.setData('application/xccm-knowledge', JSON.stringify(fullItem));
            }
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: ITEM_COLORS.paragraph }} />
            <span className="text-sm font-medium line-clamp-2" style={{ color: ITEM_COLORS.paragraph }}>
              {paragraph.title}
            </span>
          </div>
          {(hasNotions || hasExercise) && (
            <button className="shrink-0 opacity-70 hover:opacity-100" style={{ color: ITEM_COLORS.paragraph }}>
              {isExpanded ? <FaChevronDown className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>

        {isExpanded && (hasNotions || hasExercise) && (
          <div className="mt-2 space-y-1.5 pl-4">
            {paragraph.notions?.map((notion, idx) => renderNotion(notion, itemId, idx))}
            {paragraph.exercise && (
              <div
                className={`rounded-lg border p-3 ${getItemBgClass('exercise')}`}
                draggable
                onDragStart={(e) => {
                  const exerciseId = `${itemId}-exercise`;
                  const fullItem = getItemWithHierarchy(exerciseId) || {
                    id: exerciseId,
                    title: `Exercice: ${paragraph.exercise?.questions.length ?? 0} question(s)`,
                    type: 'exercise',
                    parentId: itemId,
                    data: paragraph.exercise
                  };
                  e.dataTransfer.setData('application/xccm-knowledge', JSON.stringify(fullItem));
                }}
              >
                Exercice: {paragraph.exercise.questions.length} question(s)
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render chapter as child
  const renderChapterChild = (chapter: Chapter, parentId: string, index: number) => {
    const itemId = `${parentId}-chapter-${index}`;
    const isExpanded = expandedItems.has(itemId);
    const hasParagraphs = chapter.paragraphs && chapter.paragraphs.length > 0;

    if (!shouldShowType('chapter')) return null;

    return (
      <div key={itemId}>
        <div
          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:shadow-md ${getItemBgClass('chapter')}`}
          onClick={() => hasParagraphs ? toggleExpansion(itemId) : null}
          draggable
          onDragStart={(e) => {
            const fullItem = getItemWithHierarchy(itemId);
            if (fullItem) {
              e.dataTransfer.setData('application/xccm-knowledge', JSON.stringify(fullItem));
            }
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: ITEM_COLORS.chapter }} />
            <span className="text-sm font-medium line-clamp-2" style={{ color: ITEM_COLORS.chapter }}>
              {chapter.title}
            </span>
          </div>
          {hasParagraphs && (
            <button className="shrink-0 opacity-70 hover:opacity-100" style={{ color: ITEM_COLORS.chapter }}>
              {isExpanded ? <FaChevronDown className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>

        {isExpanded && hasParagraphs && (
          <div className="mt-2 space-y-1.5 pl-4">
            {chapter.paragraphs.map((para, idx) => renderParagraphChild(para, itemId, idx))}
          </div>
        )}
      </div>
    );
  };

  // Render section as child
  const renderSectionChild = (section: Section, parentId: string, index: number) => {
    const itemId = `${parentId}-section-${index}`;
    const isExpanded = expandedItems.has(itemId);
    const hasChapters = section.chapters && section.chapters.length > 0;

    if (!shouldShowType('section')) return null;

    return (
      <div key={itemId}>
        <div
          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:shadow-md ${getItemBgClass('section')}`}
          onClick={() => hasChapters ? toggleExpansion(itemId) : null}
          draggable
          onDragStart={(e) => {
            const fullItem = getItemWithHierarchy(itemId);
            if (fullItem) {
              e.dataTransfer.setData('application/xccm-knowledge', JSON.stringify(fullItem));
            }
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: ITEM_COLORS.section }} />
            <span className="text-sm font-medium line-clamp-2" style={{ color: ITEM_COLORS.section }}>
              {section.title}
            </span>
          </div>
          {hasChapters && (
            <button className="shrink-0 opacity-70 hover:opacity-100" style={{ color: ITEM_COLORS.section }}>
              {isExpanded ? <FaChevronDown className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>

        {isExpanded && hasChapters && (
          <div className="mt-2 space-y-1.5 pl-4">
            {section.chapters.map((chap, idx) => renderChapterChild(chap, itemId, idx))}
          </div>
        )}
      </div>
    );
  };

  // Render course (top level)
  const renderCourse = (course: Course, index: number) => {
    const itemId = `course-${index}`;
    const isExpanded = expandedItems.has(itemId);
    const hasSections = course.sections && course.sections.length > 0;
    const hasVisibleChildren = hasSections && shouldShowType('section');

    if (!matchesSearch(course.title)) return null;

    return (
      <div key={itemId}>
        <div
          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:shadow-md ${getItemBgClass('course')}`}
          onClick={() => hasVisibleChildren ? toggleExpansion(itemId) : null}
          draggable
          onDragStart={(e) => {
            const fullItem = getItemWithHierarchy(itemId);
            if (fullItem) {
              e.dataTransfer.setData('application/xccm-knowledge', JSON.stringify(fullItem));
            }
          }}
        >
          <div className="flex items-center gap-2.5">
            <FaBook className="h-5 w-5 shrink-0" style={{ color: ITEM_COLORS.course }} />
            <span className="text-sm font-medium line-clamp-2" style={{ color: ITEM_COLORS.course }}>
              {course.title}
            </span>
          </div>
          {hasVisibleChildren && (
            <button className="shrink-0 opacity-70 hover:opacity-100" style={{ color: ITEM_COLORS.course }}>
              {isExpanded ? <FaChevronDown className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>

        {isExpanded && hasVisibleChildren && hasSections && (
          <div className="mt-2 space-y-1.5">
            {course.sections.map((sec, idx) => renderSectionChild(sec, itemId, idx))}
          </div>
        )}
      </div>
    );
  };

  // Render content based on active filter
  const renderFilteredContent = () => {
    if (!activeFilter) {
      // No filter - show all courses
      return mockCourseData.map((course, idx) => renderCourse(course, idx));
    }

    // Render based on active filter type
    switch (activeFilter) {
      case 'course':
        return mockCourseData.map((course, idx) => renderCourse(course, idx));
      case 'section':
        return mockCourseData.flatMap(course => 
          course.sections.map((sec, idx) => renderSectionChild(sec, `course-${mockCourseData.indexOf(course)}`, idx))
        );
      case 'chapter':
        return mockCourseData.flatMap(course => 
          course.sections.flatMap(sec => 
            sec.chapters.map((chap, idx) => renderChapterChild(chap, `course-${mockCourseData.indexOf(course)}-section-${course.sections.indexOf(sec)}`, idx))
          )
        );
      case 'paragraph':
        return mockCourseData.flatMap(course => 
          course.sections.flatMap(sec => 
            sec.chapters.flatMap(chap => 
              chap.paragraphs.map((para, idx) => renderParagraphChild(para, `course-${mockCourseData.indexOf(course)}-section-${course.sections.indexOf(sec)}-chapter-${sec.chapters.indexOf(chap)}`, idx))
            )
          )
        );
      case 'notion':
        return mockCourseData.flatMap((course, courseIdx) =>
          course.sections.flatMap((sec, secIdx) =>
            sec.chapters.flatMap((chap, chapIdx) =>
              chap.paragraphs.flatMap((para, paraIdx) =>
                para.notions.map((notion, notionIdx) =>
                  renderNotion(notion, `course-${courseIdx}-section-${secIdx}-chapter-${chapIdx}-paragraph-${paraIdx}`, notionIdx)
                )
              )
            )
          )
        );
      case 'exercise':
        return mockCourseData.flatMap((course, courseIdx) =>
          course.sections.flatMap((sec, secIdx) =>
            sec.chapters.flatMap((chap, chapIdx) =>
              chap.paragraphs
                .filter(para => !!para.exercise)
                .map((para, paraIdx) => {
                  const paraIndex = chap.paragraphs.indexOf(para);
                  const exerciseId = `course-${courseIdx}-section-${secIdx}-chapter-${chapIdx}-paragraph-${paraIndex}-exercise`;
                  return (
                    <div
                      key={exerciseId}
                      className={`rounded-lg border p-3 ${getItemBgClass('exercise')}`}
                      draggable
                      onDragStart={(e) => {
                        const fullItem = getItemWithHierarchy(exerciseId) || {
                          id: exerciseId,
                          title: `Exercice: ${para.exercise!.questions.length} question(s)`,
                          type: 'exercise',
                          parentId: `course-${courseIdx}-section-${secIdx}-chapter-${chapIdx}-paragraph-${paraIndex}`,
                          data: para.exercise
                        };
                        e.dataTransfer.setData('application/xccm-knowledge', JSON.stringify(fullItem));
                      }}
                    >
                      Exercice: {para.exercise!.questions.length} question(s)
                    </div>
                  );
                })
            )
          )
        );
      default:
        return mockCourseData.map((course, idx) => renderCourse(course, idx));
    }
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Importer des connaissances</h2>
        <button onClick={onClose} className="text-gray-400 dark:text-gray-500 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
          <FaTimes className="text-sm" />
        </button>
      </div>

      {/* Search */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 py-2 pl-9 pr-3 text-sm focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:focus:ring-purple-400 transition-colors"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5">
          <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Filtres</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filterTypes.map(({ type, label, color }) => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`
                cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-all
                ${activeFilter === type
                  ? 'ring-2 ring-offset-1 dark:ring-offset-gray-800 shadow-sm outline-2 outline outline-black dark:outline-white'
                  : 'hover:opacity-80'}
              `}
              style={{
                backgroundColor: color,
                color: 'white',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Course List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-2">
          {renderFilteredContent()}
        </div>
      </div>
    </div>
  );
};

export default StructureDeCours;