'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaBook, FaChevronRight, FaChevronDown, FaSpinner } from 'react-icons/fa';
import { Sparkles } from 'lucide-react';
import { mockCourseData } from '@/data/mockEditorData';
import { Course, Section, Chapter, Paragraph, ItemType, ITEM_COLORS } from '@/types/editor.types';
import { useTranslations } from 'next-intl';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { toast } from 'react-hot-toast';
import { ApiResponseListCourseResponse } from '@/lib/models/ApiResponseListCourseResponse';

interface StructureDeCoursProps {
  onClose: () => void;
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

export const StructureDeCours: React.FC<StructureDeCoursProps> = ({ onClose }) => {
  const t = useTranslations('editor.structureDeCours');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ItemType | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Courses state: combined mock + database
  const [courses, setCourses] = useState<Course[]>(() => 
    mockCourseData.map(c => ({ ...c, id: c.id + 10000 }))
  );
  const [decomposedCache, setDecomposedCache] = useState<Record<string, Section[]>>({});
  const [loadingDecomposition, setLoadingDecomposition] = useState<string | null>(null);

  // Load cache and fetch DB courses on mount
  useEffect(() => {
    // 1. Load from localStorage
    const savedCache = localStorage.getItem('xcsm_decomposed_courses');
    if (savedCache) {
      try {
        setDecomposedCache(JSON.parse(savedCache));
      } catch (e) {
        // Silently fail
      }
    }

    // 2. Fetch courses from DB
    const fetchCourses = async () => {
      try {
        const resp: ApiResponseListCourseResponse = await CourseControllerService.getAllCourses();
        if (resp && resp.data) {
          // Map DB courses to the Editor's Course type
          const dbCoursesMapped: Course[] = resp.data.map((c) => ({
            id: c.id ?? 0, 
            title: c.title || 'Sans titre',
            category: c.category || 'Général',
            image: c.coverImage || '/images/courses/default.jpg',
            views: c.viewCount || 0,
            likes: c.likeCount || 0,
            downloads: c.downloadCount || 0,
            author: {
              name: c.author?.name || 'Auteur inconnu',
              image: c.author?.image || '/images/blog/author-01.png'
            },
            conclusion: '',
            learningObjectives: [],
            sections: [] 
          }));
          
          setCourses(prev => {
            // Keep DB courses first, then mock courses (IDs >= 10000)
            const mockCourses = prev.filter(c => c.id >= 10000);
            return [...dbCoursesMapped, ...mockCourses];
          });
        }
      } catch (err) {
        // Silent error to avoid triggering dev error overlays
        toast.error("Erreur lors de la récupération des cours de la base de données");
      }
    };

    fetchCourses();
  }, []);

  // Sync cache with localStorage
  useEffect(() => {
    if (Object.keys(decomposedCache).length > 0) {
      localStorage.setItem('xcsm_decomposed_courses', JSON.stringify(decomposedCache));
    }
  }, [decomposedCache]);

  const toggleFilter = (type: ItemType) => {
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

  const decomposeCourse = async (course: Course) => {
    // Ensure we have a valid URL before attempting fetch
    const xcsmUrl = process.env.NEXT_PUBLIC_XCSM_API_URL || 'http://localhost:8083/api/xcsm';
    
    setLoadingDecomposition(course.id.toString());
    
    try {
      // Use AbortController for timeout to prevent hanging fetches
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(xcsmUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: course.id, 
          title: course.title,
          category: course.category,
          sections: []
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const sections = Array.isArray(data) ? data : (data.sections || []);
      
      setDecomposedCache(prev => ({
        ...prev,
        [course.id.toString()]: sections
      }));
      
      toggleExpansion(`course-${course.id}`);
      
      // Persist to cache
      const currentCache = JSON.parse(localStorage.getItem('xcsm_decomposed_courses') || '{}');
      currentCache[course.id.toString()] = sections;
      localStorage.setItem('xcsm_decomposed_courses', JSON.stringify(currentCache));

    } catch (err) {
      // Silently handle to avoid showing error overlays in certain dev environments
      // but still notify the user via Toast
      if (err instanceof Error && err.name === 'AbortError') {
        toast.error("Le service de décomposition a mis trop de temps à répondre.");
      } else {
        toast.error('Service de décomposition indisponible.');
      }
    } finally {
      setLoadingDecomposition(null);
    }
  };

  const onCourseClick = (course: Course, itemId: string) => {
    const hasSections = (course.sections && course.sections.length > 0) || decomposedCache[course.id.toString()];
    
    if (hasSections) {
      toggleExpansion(itemId);
    } else {
      decomposeCourse(course);
    }
  };

  const matchesSearch = (title: string) => {
    if (!searchTerm) return true;
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const shouldShowType = (type: ItemType): boolean => {
    if (!activeFilter) return true;
    const hierarchy: Record<ItemType, ItemType[]> = {
      'course': ['course', 'section', 'chapter', 'paragraph', 'notion'],
      'section': ['section', 'chapter', 'paragraph', 'notion'],
      'chapter': ['chapter', 'paragraph', 'notion'],
      'paragraph': ['paragraph', 'notion'],
      'notion': ['notion'],
      'exercise': [],
    };
    return hierarchy[activeFilter].includes(type);
  };

  const getItemWithHierarchy = (itemId: string): Course | Section | Chapter | Paragraph | null => {
    const parts = itemId.split('-');
    if (parts[0] !== 'course') return null;
    
    const courseId = parts[1];
    const course = courses.find(c => c.id.toString() === courseId);
    if (!course) return null;

    const sections = (course.sections && course.sections.length > 0) ? course.sections : decomposedCache[course.id.toString()] || [];
    
    if (parts.length === 2) return { ...course, sections };

    // For simplicity, we return the course with its sections for D&D at course level
    return { ...course, id: parseInt(courseId), sections };
  };

  const renderNotion = (notion: string, parentId: string, index: number) => {
    const itemId = `${parentId}-notion-${index}`;
    if (!shouldShowType('notion')) return null;

    return (
      <div
        key={itemId}
        className={`ml-8 flex cursor-pointer items-center gap-2 rounded-md border p-2 transition-all hover:shadow-sm ${getItemBgClass('notion')}`}
        draggable
        onDragStart={(e) => {
          const fullItem = getItemWithHierarchy(itemId);
          if (fullItem) e.dataTransfer.setData('application/xccm-knowledge', JSON.stringify(fullItem));
        }}
      >
        <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: ITEM_COLORS.notion }} />
        <span className="flex-1 text-xs font-medium" style={{ color: ITEM_COLORS.notion }}>{notion}</span>
      </div>
    );
  };

  const renderParagraphChild = (paragraph: Paragraph, parentId: string, index: number) => {
    const itemId = `${parentId}-paragraph-${index}`;
    const isExpanded = expandedItems.has(itemId);
    const hasNotions = paragraph.notions && paragraph.notions.length > 0;
    if (!shouldShowType('paragraph')) return null;

    return (
      <div key={itemId}>
        <div
          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:shadow-md ${getItemBgClass('paragraph')}`}
          onClick={() => hasNotions ? toggleExpansion(itemId) : null}
          draggable
          onDragStart={(e) => {
            const fullItem = getItemWithHierarchy(itemId);
            if (fullItem) e.dataTransfer.setData('application/xccm-knowledge', JSON.stringify(fullItem));
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: ITEM_COLORS.paragraph }} />
            <span className="text-sm font-medium line-clamp-2" style={{ color: ITEM_COLORS.paragraph }}>{paragraph.title}</span>
          </div>
          {hasNotions && (
            <button className="shrink-0 opacity-70 hover:opacity-100" style={{ color: ITEM_COLORS.paragraph }}>
              {isExpanded ? <FaChevronDown className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>
        {isExpanded && hasNotions && (
          <div className="mt-2 space-y-1.5 pl-4">
            {paragraph.notions?.map((notion, idx) => renderNotion(notion, itemId, idx))}
          </div>
        )}
      </div>
    );
  };

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
            if (fullItem) e.dataTransfer.setData('application/xccm-knowledge', JSON.stringify(fullItem));
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: ITEM_COLORS.chapter }} />
            <span className="text-sm font-medium line-clamp-2" style={{ color: ITEM_COLORS.chapter }}>{chapter.title}</span>
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
            if (fullItem) e.dataTransfer.setData('application/xccm-knowledge', JSON.stringify(fullItem));
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: ITEM_COLORS.section }} />
            <span className="text-sm font-medium line-clamp-2" style={{ color: ITEM_COLORS.section }}>{section.title}</span>
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

  const renderCourse = (course: Course) => {
    const itemId = `course-${course.id}`;
    const isExpanded = expandedItems.has(itemId);
    const sections = (course.sections && course.sections.length > 0) ? course.sections : decomposedCache[course.id.toString()];
    const hasSections = sections && sections.length > 0;
    const isLoading = loadingDecomposition === course.id.toString();
    const hasVisibleChildren = hasSections && shouldShowType('section');

    if (!matchesSearch(course.title)) return null;

    return (
      <div key={itemId}>
        <div
          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:shadow-md ${getItemBgClass('course')}`}
          onClick={() => onCourseClick(course, itemId)}
          draggable
          onDragStart={(e) => {
            const fullItem = getItemWithHierarchy(itemId);
            if (fullItem) e.dataTransfer.setData('application/xccm-knowledge', JSON.stringify(fullItem));
          }}
        >
          <div className="flex items-center gap-2.5">
            <FaBook className="h-5 w-5 shrink-0" style={{ color: ITEM_COLORS.course }} />
            <span className="text-sm font-medium line-clamp-2" style={{ color: ITEM_COLORS.course }}>{course.title}</span>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && <FaSpinner className="h-4 w-4 animate-spin text-blue-500" />}
            {(hasVisibleChildren || !hasSections) && (
              <button disabled={isLoading} className="shrink-0 opacity-70 hover:opacity-100" style={{ color: ITEM_COLORS.course }}>
                {isExpanded ? <FaChevronDown className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
        {isExpanded && hasVisibleChildren && sections && (
          <div className="mt-2 space-y-1.5">
            {sections.map((sec, idx) => renderSectionChild(sec, itemId, idx))}
          </div>
        )}
      </div>
    );
  };

  const filterTypes: { type: ItemType; label: string; color: string }[] = [
    { type: 'course', label: t('types.course'), color: ITEM_COLORS.course },
    { type: 'section', label: t('types.section'), color: ITEM_COLORS.section },
    { type: 'chapter', label: t('types.chapter'), color: ITEM_COLORS.chapter },
    { type: 'paragraph', label: t('types.paragraph'), color: ITEM_COLORS.paragraph },
    { type: 'notion', label: t('types.notion'), color: ITEM_COLORS.notion },
  ];

  const renderFilteredContent = () => {
    const dataToFilter = courses;
    if (!activeFilter) return dataToFilter.map((course) => renderCourse(course));

    switch (activeFilter) {
      case 'course': return dataToFilter.map((course) => renderCourse(course));
      case 'section':
        return dataToFilter.flatMap(course => {
          const sections = (course.sections && course.sections.length > 0) ? course.sections : decomposedCache[course.id.toString()] || [];
          return sections.map((sec, idx) => renderSectionChild(sec, `course-${course.id}`, idx));
        });
      case 'chapter':
        return dataToFilter.flatMap(course => {
          const sections = (course.sections && course.sections.length > 0) ? course.sections : decomposedCache[course.id.toString()] || [];
          return sections.flatMap(sec => sec.chapters.map((chap, idx) => renderChapterChild(chap, `course-${course.id}-section-${sections.indexOf(sec)}`, idx)));
        });
      case 'paragraph':
        return dataToFilter.flatMap(course => {
          const sections = (course.sections && course.sections.length > 0) ? course.sections : decomposedCache[course.id.toString()] || [];
          return sections.flatMap(sec => sec.chapters.flatMap(chap => chap.paragraphs.map((para, idx) => renderParagraphChild(para, `course-${course.id}-section-${sections.indexOf(sec)}-chapter-${sec.chapters.indexOf(chap)}`, idx))));
        });
      case 'notion':
        return dataToFilter.flatMap(course => {
          const sections = (course.sections && course.sections.length > 0) ? course.sections : decomposedCache[course.id.toString()] || [];
          return sections.flatMap((sec, secIdx) => sec.chapters.flatMap((chap, chapIdx) => chap.paragraphs.flatMap((para, paraIdx) => para.notions.map((notion, notionIdx) => renderNotion(notion, `course-${course.id}-section-${secIdx}-chapter-${chapIdx}-paragraph-${paraIdx}`, notionIdx)))));
        });
      default: return dataToFilter.map((course) => renderCourse(course));
    }
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
        <button onClick={onClose} className="text-gray-400 dark:text-gray-500 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
          <FaTimes className="text-sm" />
        </button>
      </div>
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="relative">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            suppressHydrationWarning
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 py-2 pl-9 pr-3 text-sm focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:focus:ring-purple-400 transition-colors"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5">
          <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('filters')}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filterTypes.map(({ type, label, color }) => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-all ${activeFilter === type ? 'ring-2 ring-offset-1 dark:ring-offset-gray-800 shadow-sm outline-2 outline outline-black dark:outline-white' : 'hover:opacity-80'}`}
              style={{ backgroundColor: color, color: 'white' }}
            >{label}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-2">{renderFilteredContent()}</div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 bg-purple-50/50 dark:bg-purple-900/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">{t('expertCornerTitle')}</span>
        </div>
        <div className="space-y-3">
          {[
            { name: t('expertTips.optimalStructureName'), advice: t('expertTips.optimalStructureAdvice') },
            { name: t('expertTips.engagementName'), advice: t('expertTips.engagementAdvice') }
          ].map((expert, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-purple-100 dark:border-purple-800">
              <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mb-1">{expert.name}</p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight">{expert.advice}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StructureDeCours;
