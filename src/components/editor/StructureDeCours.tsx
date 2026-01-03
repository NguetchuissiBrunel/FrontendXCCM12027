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
 * 
 * @author JOHAN
 * @date November 2025
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaBook, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { Course, Section, Chapter, Paragraph, ItemType, ITEM_COLORS } from '@/types/editor.types';
import { useAuth } from '@/contexts/AuthContext';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { AlertCircle, Loader2 } from 'lucide-react';

interface StructureDeCoursProps {
  onClose: () => void;
  onImport?: (item: any, type: ItemType) => void;
}

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

export const StructureDeCours: React.FC<StructureDeCoursProps> = ({ onClose, onImport }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ItemType | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        const response = await CourseControllerService.getAuthorCourses(user.id);
        // Map API response to editor Course type if needed
        // Assuming the API returns a similar structure or we need to normalize it
        setCourses((response as any).courses || response || []);
      } catch (err: any) {
        console.error("Error fetching author courses:", err);
        setError("Impossible de charger vos cours");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

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
      >
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: ITEM_COLORS.notion }}
        />
        <span
          className="flex-1 text-xs hover:underline"
          style={{ color: ITEM_COLORS.notion }}
          onClick={(e) => {
            e.stopPropagation();
            onImport?.(notion, 'notion');
          }}
        >
          {notion}
        </span>
      </div>
    );
  };

  // Render paragraph as child (no search filtering)
  const renderParagraphChild = (paragraph: Paragraph, parentId: string, index: number) => {
    const itemId = `${parentId}-para-${index}`;
    const isExpanded = expandedItems.has(itemId);

    if (!shouldShowType('paragraph')) return null;

    const hasNotions = paragraph.notions && paragraph.notions.length > 0;
    const hasExercise = !!paragraph.exercise;
    const hasVisibleChildren = (hasNotions && shouldShowType('notion')) || (hasExercise && shouldShowType('exercise'));

    return (
      <div key={itemId} className="ml-6">
        <div
          className={`flex cursor-pointer items-center justify-between rounded-md border p-2.5 transition-all hover:shadow-sm ${getItemBgClass('paragraph')}`}
          onClick={() => hasVisibleChildren ? toggleExpansion(itemId) : null}
        >
          <div className="flex items-center gap-2">
            {hasVisibleChildren && (
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
            <span 
              className="text-xs font-medium hover:underline" 
              style={{ color: ITEM_COLORS.paragraph }}
              onClick={(e) => {
                e.stopPropagation();
                onImport?.(paragraph, 'paragraph');
              }}
            >
              {paragraph.title}
            </span>
          </div>
        </div>

        {isExpanded && hasVisibleChildren && (
          <div className="ml-4 mt-1 space-y-1">
            {hasNotions && shouldShowType('notion') && paragraph.notions.map((notion, idx) =>
              renderNotion(notion, itemId, idx)
            )}

            {hasExercise && shouldShowType('exercise') && (
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

  // Render chapter as child (no search filtering)
  const renderChapterChild = (chapter: Chapter, parentId: string, index: number) => {
    const itemId = `${parentId}-chap-${index}`;
    const isExpanded = expandedItems.has(itemId);

    if (!shouldShowType('chapter')) return null;

    const hasParagraphs = chapter.paragraphs && chapter.paragraphs.length > 0;
    const hasVisibleChildren = hasParagraphs && shouldShowType('paragraph');

    return (
      <div key={itemId} className="ml-4">
        <div
          className={`flex cursor-pointer items-center justify-between rounded-md border p-2.5 transition-all hover:shadow-sm ${getItemBgClass('chapter')}`}
          onClick={() => hasVisibleChildren ? toggleExpansion(itemId) : null}
        >
          <div className="flex items-center gap-2">
            {hasVisibleChildren && (
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
            <span
              className="text-sm font-medium hover:underline"
              style={{ color: ITEM_COLORS.chapter }}
              onClick={(e) => {
                e.stopPropagation();
                onImport?.(chapter, 'chapter');
              }}
            >
              {chapter.title}
            </span>
          </div>
        </div>

        {isExpanded && hasVisibleChildren && hasParagraphs && (
          <div className="mt-1 space-y-1">
            {chapter.paragraphs.map((para, idx) =>
              renderParagraphChild(para, itemId, idx)
            )}
          </div>
        )}
      </div>
    );
  };

  // Render section as child (no search filtering)
  const renderSectionChild = (section: Section, parentId: string, index: number) => {
    const itemId = `${parentId}-sec-${index}`;
    const isExpanded = expandedItems.has(itemId);

    if (!shouldShowType('section')) return null;

    const hasChapters = section.chapters && section.chapters.length > 0;
    const hasVisibleChildren = hasChapters && shouldShowType('chapter');

    return (
      <div key={itemId} className="ml-2">
        <div
          className={`flex cursor-pointer items-center justify-between rounded-md border p-3 transition-all hover:shadow-sm ${getItemBgClass('section')}`}
          onClick={() => hasVisibleChildren ? toggleExpansion(itemId) : null}
        >
          <div className="flex items-center gap-2">
            {hasVisibleChildren && (
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
            <span
              className="text-sm font-medium hover:underline"
              style={{ color: ITEM_COLORS.section }}
              onClick={(e) => {
                e.stopPropagation();
                onImport?.(section, 'section');
              }}
            >
              {section.title}
            </span>
          </div>
        </div>

        {isExpanded && hasVisibleChildren && hasChapters && (
          <div className="mt-1 space-y-1">
            {section.chapters.map((chap, idx) =>
              renderChapterChild(chap, itemId, idx)
            )}
          </div>
        )}
      </div>
    );
  };

  // Render paragraph
  // Render section (top-level, applies search)
  const renderSection = (section: Section, parentId: string, index: number) => {
    const itemId = `${parentId}-sec-${index}`;
    const isExpanded = expandedItems.has(itemId);

    // Check if we should show sections
    if (!shouldShowType('section')) return null;
    // Only check section title when searching
    if (!matchesSearch(section.title)) return null;

    const hasChapters = section.chapters && section.chapters.length > 0;
    const hasVisibleChildren = hasChapters && shouldShowType('chapter');

    return (
      <div key={itemId} className="ml-2">
        <div
          className={`flex cursor-pointer items-center justify-between rounded-md border p-3 transition-all hover:shadow-sm ${getItemBgClass('section')}`}
          onClick={() => hasVisibleChildren ? toggleExpansion(itemId) : null}
        >
          <div className="flex items-center gap-2">
            {hasVisibleChildren && (
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
            <span
              className="text-sm font-medium hover:underline"
              style={{ color: ITEM_COLORS.section }}
              onClick={(e) => {
                e.stopPropagation();
                onImport?.(section, 'section');
              }}
            >
              {section.title}
            </span>
          </div>
        </div>

        {isExpanded && hasVisibleChildren && hasChapters && (
          <div className="mt-1 space-y-1">
            {/* Render ALL chapters (no search filter on children) */}
            {section.chapters.map((chap, idx) =>
              renderChapterChild(chap, itemId, idx)
            )}
          </div>
        )}
      </div>
    );
  };

  // Render chapter (top-level, applies search)
  const renderChapter = (chapter: Chapter, parentId: string, index: number) => {
    const itemId = `${parentId}-chap-${index}`;
    const isExpanded = expandedItems.has(itemId);

    // Check if we should show chapters
    if (!shouldShowType('chapter')) return null;
    // Only check chapter title when searching
    if (!matchesSearch(chapter.title)) return null;

    const hasParagraphs = chapter.paragraphs && chapter.paragraphs.length > 0;
    const hasVisibleChildren = hasParagraphs && shouldShowType('paragraph');

    return (
      <div key={itemId} className="ml-4">
        <div
          className={`flex cursor-pointer items-center justify-between rounded-md border p-2.5 transition-all hover:shadow-sm ${getItemBgClass('chapter')}`}
          onClick={() => hasVisibleChildren ? toggleExpansion(itemId) : null}
        >
          <div className="flex items-center gap-2">
            {hasVisibleChildren && (
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
            <span
              className="text-sm font-medium hover:underline"
              style={{ color: ITEM_COLORS.chapter }}
              onClick={(e) => {
                e.stopPropagation();
                onImport?.(chapter, 'chapter');
              }}
            >
              {chapter.title}
            </span>
          </div>
        </div>

        {isExpanded && hasVisibleChildren && hasParagraphs && (
          <div className="mt-1 space-y-1">
            {/* Render ALL paragraphs (no search filter on children) */}
            {chapter.paragraphs.map((para, idx) =>
              renderParagraphChild(para, itemId, idx)
            )}
          </div>
        )}
      </div>
    );
  };

  // Render paragraph (top-level, applies search)
  const renderParagraph = (paragraph: Paragraph, parentId: string, index: number) => {
    const itemId = `${parentId}-para-${index}`;
    const isExpanded = expandedItems.has(itemId);

    // Check if we should show paragraphs
    if (!shouldShowType('paragraph')) return null;
    // Only check paragraph title when searching
    if (!matchesSearch(paragraph.title)) return null;

    const hasNotions = paragraph.notions && paragraph.notions.length > 0;
    const hasExercise = !!paragraph.exercise;
    const hasVisibleChildren = (hasNotions && shouldShowType('notion')) || (hasExercise && shouldShowType('exercise'));

    return (
      <div key={itemId} className="ml-6">
        <div
          className={`flex cursor-pointer items-center justify-between rounded-md border p-2.5 transition-all hover:shadow-sm ${getItemBgClass('paragraph')}`}
          onClick={() => hasVisibleChildren ? toggleExpansion(itemId) : null}
        >
          <div className="flex items-center gap-2">
            {hasVisibleChildren && (
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
            <span
              className="text-xs font-medium hover:underline"
              style={{ color: ITEM_COLORS.paragraph }}
              onClick={(e) => {
                e.stopPropagation();
                onImport?.(paragraph, 'paragraph');
              }}
            >
              {paragraph.title}
            </span>
          </div>
        </div>

        {isExpanded && hasVisibleChildren && (
          <div className="ml-4 mt-1 space-y-1">
            {/* Render ALL notions and exercises (no search filter on children) */}
            {hasNotions && shouldShowType('notion') && paragraph.notions.map((notion, idx) =>
              renderNotion(notion, itemId, idx)
            )}

            {hasExercise && shouldShowType('exercise') && (
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

  // Render all sections (when Section filter is active)
  const renderAllSections = () => {
    const allSections: { section: Section; courseId: string; sectionIndex: number }[] = [];

    courses.forEach((course, courseIdx) => {
      course.sections?.forEach((section, secIdx) => {
        // Only check section title (not children)
        if (matchesSearch(section.title)) {
          allSections.push({
            section,
            courseId: `course-${courseIdx}`,
            sectionIndex: secIdx
          });
        }
      });
    });

    return allSections.map(({ section, courseId, sectionIndex }) =>
      renderSection(section, courseId, sectionIndex)
    );
  };

  // Render all chapters (when Chapter filter is active)
  const renderAllChapters = () => {
    const allChapters: { chapter: Chapter; parentId: string; chapterIndex: number }[] = [];

    courses.forEach((course, courseIdx) => {
      course.sections?.forEach((section, secIdx) => {
        section.chapters?.forEach((chapter, chapIdx) => {
          // Only check chapter title (not children)
          if (matchesSearch(chapter.title)) {
            allChapters.push({
              chapter,
              parentId: `course-${courseIdx}-sec-${secIdx}`,
              chapterIndex: chapIdx
            });
          }
        });
      });
    });

    return allChapters.map(({ chapter, parentId, chapterIndex }) =>
      renderChapter(chapter, parentId, chapterIndex)
    );
  };

  // Render all paragraphs (when Paragraph filter is active)
  const renderAllParagraphs = () => {
    const allParagraphs: { paragraph: Paragraph; parentId: string; paragraphIndex: number }[] = [];

    courses.forEach((course, courseIdx) => {
      course.sections?.forEach((section, secIdx) => {
        section.chapters?.forEach((chapter, chapIdx) => {
          chapter.paragraphs?.forEach((paragraph, paraIdx) => {
            // Only check paragraph title (not children)
            if (matchesSearch(paragraph.title)) {
              allParagraphs.push({
                paragraph,
                parentId: `course-${courseIdx}-sec-${secIdx}-chap-${chapIdx}`,
                paragraphIndex: paraIdx
              });
            }
          });
        });
      });
    });

    return allParagraphs.map(({ paragraph, parentId, paragraphIndex }) =>
      renderParagraph(paragraph, parentId, paragraphIndex)
    );
  };

  // Render all notions (when Notion filter is active)
  const renderAllNotions = () => {
    const allNotions: { notion: string; parentId: string; notionIndex: number }[] = [];

    courses.forEach((course, courseIdx) => {
      course.sections?.forEach((section, secIdx) => {
        section.chapters?.forEach((chapter, chapIdx) => {
          chapter.paragraphs?.forEach((paragraph, paraIdx) => {
            paragraph.notions?.forEach((notion, notionIdx) => {
              // Only check notion text
              if (matchesSearch(notion)) {
                allNotions.push({
                  notion,
                  parentId: `course-${courseIdx}-sec-${secIdx}-chap-${chapIdx}-para-${paraIdx}`,
                  notionIndex: notionIdx
                });
              }
            });
          });
        });
      });
    });

    return allNotions.map(({ notion, parentId, notionIndex }) =>
      renderNotion(notion, parentId, notionIndex)
    );
  };

  // Render all exercises (when Exercise filter is active)
  const renderAllExercises = () => {
    const allExercises: { paragraph: Paragraph; parentId: string }[] = [];

    courses.forEach((course, courseIdx) => {
      course.sections?.forEach((section, secIdx) => {
        section.chapters?.forEach((chapter, chapIdx) => {
          chapter.paragraphs?.forEach((paragraph, paraIdx) => {
            if (paragraph.exercise) {
              allExercises.push({
                paragraph,
                parentId: `course-${courseIdx}-sec-${secIdx}-chap-${chapIdx}-para-${paraIdx}`
              });
            }
          });
        });
      });
    });

    return allExercises.map(({ paragraph, parentId }) => (
      <div key={parentId} className={`flex items-center gap-2 rounded-md border p-2 transition-all hover:shadow-sm ${getItemBgClass('exercise')}`}>
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: ITEM_COLORS.exercise }}
        />
        <span
          className="text-xs font-medium hover:underline"
          style={{ color: ITEM_COLORS.exercise }}
          onClick={(e) => {
            e.stopPropagation();
            onImport?.(paragraph, 'exercise');
          }}
        >
          Exercice - {paragraph.title} ({paragraph.exercise!.questions.length} questions)
        </span>
      </div>
    ));
  };

  // Render course
  const renderCourse = (course: Course, index: number) => {
    const itemId = `course-${index}`;
    const isExpanded = expandedItems.has(itemId);

    // Check if we should show courses
    if (!shouldShowType('course')) return null;
    // Only check course title (not children)
    if (!matchesSearch(course.title)) return null;

    const hasSections = course.sections && course.sections.length > 0;
    const hasVisibleChildren = hasSections && shouldShowType('section');

    return (
      <div key={itemId}>
        <div
          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:shadow-md ${getItemBgClass('course')}`}
          onClick={() => hasVisibleChildren ? toggleExpansion(itemId) : null}
        >
          <div className="flex items-center gap-2.5">
            <FaBook className="h-5 w-5 shrink-0" style={{ color: ITEM_COLORS.course }} />
            <span
              className="text-sm font-medium line-clamp-2 hover:underline"
              style={{ color: ITEM_COLORS.course }}
              onClick={(e) => {
                e.stopPropagation();
                onImport?.(course, 'course');
              }}
            >
              {course.title}
            </span>
          </div>
          {hasVisibleChildren && (
            <button className="shrink-0 opacity-70 hover:opacity-100" style={{ color: ITEM_COLORS.course }}>
              {isExpanded ? (
                <FaChevronDown className="h-4 w-4" />
              ) : (
                <FaChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {isExpanded && hasVisibleChildren && hasSections && (
          <div className="mt-2 space-y-1.5">
            {/* Render ALL sections (no search filter on children) */}
            {course.sections.map((sec, idx) =>
              renderSectionChild(sec, itemId, idx)
            )}
          </div>
        )}
      </div>
    );
  };

  // Render content based on active filter
  const renderFilteredContent = () => {
    if (!activeFilter) {
      // No filter - show all courses
      return courses.map((course, idx) => renderCourse(course, idx));
    }

    // Render based on active filter type
    switch (activeFilter) {
      case 'course':
        return courses.map((course, idx) => renderCourse(course, idx));
      case 'section':
        return renderAllSections();
      case 'chapter':
        return renderAllChapters();
      case 'paragraph':
        return renderAllParagraphs();
      case 'notion':
        return renderAllNotions();
      case 'exercise':
        return renderAllExercises();
      default:
        return courses.map((course, idx) => renderCourse(course, idx));
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p className="text-sm">Chargement de vos cours...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-red-500">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-sm px-4">{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-gray-500 italic">
            <p className="text-sm">Aucun cours trouvé</p>
          </div>
        ) : (
          <div className="space-y-2">
            {renderFilteredContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default StructureDeCours;