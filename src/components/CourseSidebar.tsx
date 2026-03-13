// src/components/CourseSidebar.tsx
import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Download,
  BookOpen,
  Layers,
  FileText,
  BookMarked,
  Bookmark,
  Coffee,
  List,
  Target
} from 'lucide-react';
import { CourseData, Section, Chapter, Paragraph } from '@/types/course';

interface SearchResult {
  type: 'section' | 'chapter' | 'paragraph';
  title: string;
  path: (number | null)[];
}

interface CourseSidebarProps {
  courseData: CourseData;
  currentSectionIndex: number;
  currentChapterIndex: number;
  currentParagraphIndex: number;
  setCurrentSectionIndex: (index: number) => void;
  setCurrentChapterIndex: (index: number) => void;
  setCurrentParagraphIndex: (index: number) => void;
  setShowExercise: (show: boolean) => void;
  onDownloadRequest: () => void;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  courseData,
  currentSectionIndex,
  currentChapterIndex,
  currentParagraphIndex,
  setCurrentSectionIndex,
  setCurrentChapterIndex,
  setCurrentParagraphIndex,
  setShowExercise,
  onDownloadRequest
}) => {
  const [expandedParts, setExpandedParts] = useState<{ [key: number]: boolean }>({});
  const [expandedChapters, setExpandedChapters] = useState<{ [key: string]: boolean }>({});
  const [activeParagraph, setActiveParagraph] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const hasSections = courseData?.sections?.length > 0;

  useEffect(() => {
    if (currentSectionIndex !== undefined && currentSectionIndex !== null) {
      setExpandedParts(prev => ({
        ...prev,
        [currentSectionIndex]: true
      }));

      if (currentChapterIndex !== undefined && currentChapterIndex !== null) {
        setExpandedChapters(prev => ({
          ...prev,
          [`${currentSectionIndex}-${currentChapterIndex}`]: true
        }));
      }

      if (currentParagraphIndex !== undefined && currentParagraphIndex !== null) {
        setActiveParagraph(`${currentSectionIndex}-${currentChapterIndex}-${currentParagraphIndex}`);
      }
    }
  }, [currentSectionIndex, currentChapterIndex, currentParagraphIndex]);

  const togglePart = (sectionIndex: number) => {
    setExpandedParts(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const toggleChapter = (chapterPath: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterPath]: !prev[chapterPath]
    }));
  };

  const handleParagraphClick = (sectionIndex: number, chapterIndex: number, paragraphIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentChapterIndex(chapterIndex);
    setCurrentParagraphIndex(paragraphIndex);
    setActiveParagraph(`${sectionIndex}-${chapterIndex}-${paragraphIndex}`);
    setShowExercise(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];

    courseData.sections.forEach((section: Section, sectionIndex: number) => {
      if (section.title.toLowerCase().includes(term)) {
        results.push({
          type: 'section',
          title: section.title,
          path: [sectionIndex]
        });
      }

      if (section.chapters) {
        section.chapters.forEach((chapter: Chapter, chapterIndex: number) => {
          if (chapter.title.toLowerCase().includes(term)) {
            results.push({
              type: 'chapter',
              title: chapter.title,
              path: [sectionIndex, chapterIndex]
            });
          }

          if (chapter.paragraphs) {
            chapter.paragraphs.forEach((paragraph: Paragraph, paragraphIndex: number) => {
              if (paragraph.title.toLowerCase().includes(term)) {
                results.push({
                  type: 'paragraph',
                  title: paragraph.title,
                  path: [sectionIndex, chapterIndex, paragraphIndex]
                });
              }
            });
          }
        });
      } else if (section.paragraphs) {
        section.paragraphs.forEach((paragraph: Paragraph, paragraphIndex: number) => {
          if (paragraph.title.toLowerCase().includes(term)) {
            results.push({
              type: 'paragraph',
              title: paragraph.title,
              path: [sectionIndex, null, paragraphIndex]
            });
          }
        });
      }
    });

    setSearchResults(results);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'section') {
      const sectionIndex = result.path[0]!;
      setCurrentSectionIndex(sectionIndex);
      setCurrentChapterIndex(0);
      setCurrentParagraphIndex(0);
      togglePart(sectionIndex);
    } else if (result.type === 'chapter') {
      const sectionIndex = result.path[0]!;
      const chapterIndex = result.path[1]!;
      setCurrentSectionIndex(sectionIndex);
      setCurrentChapterIndex(chapterIndex);
      setCurrentParagraphIndex(0);
      togglePart(sectionIndex);
      toggleChapter(`${sectionIndex}-${chapterIndex}`);
    } else if (result.type === 'paragraph') {
      const sectionIndex = result.path[0]!;
      if (result.path[1] === null) {
        const paragraphIndex = result.path[2]!;
        setCurrentSectionIndex(sectionIndex);
        setCurrentChapterIndex(0);
        setCurrentParagraphIndex(paragraphIndex);
        setActiveParagraph(`${sectionIndex}-0-${paragraphIndex}`);
      } else {
        const chapterIndex = result.path[1]!;
        const paragraphIndex = result.path[2]!;
        handleParagraphClick(sectionIndex, chapterIndex, paragraphIndex);
      }
    }

    setSearchTerm('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const getChapterIcon = (index: number) => {
    const icons = [BookMarked, FileText, Coffee, Target, List];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="h-4 w-4" />;
  };

  const handleDownloadClick = () => {
    onDownloadRequest();
  };

  return (
    <aside className="w-72 bg-white dark:bg-gray-900 shadow-lg sticky top-0 h-screen flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="p-4 mt-16 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-900 to-purple-500 text-white">
        <h2 className="text-lg font-bold flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          SOMMAIRE
        </h2>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full p-2 pl-8 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          {showSearch && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  className="w-full p-2 hover:bg-purple-50 dark:hover:bg-purple-900/30 cursor-pointer flex items-center text-left"
                  onMouseDown={() => handleResultClick(result)}
                  type="button"
                >
                  {result.type === 'section' && <Layers className="h-4 w-4 mr-2 text-purple-600" />}
                  {result.type === 'chapter' && <BookMarked className="h-4 w-4 mr-2 text-indigo-600" />}
                  {result.type === 'paragraph' && <FileText className="h-4 w-4 mr-2 text-blue-600" />}
                  <span className="text-sm truncate">{result.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {hasSections ? (
          courseData.sections.map((section: Section, sectionIndex: number) => (
            <div key={sectionIndex} className="mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
              <button
                type="button"
                className={`w-full flex items-center justify-between p-3 rounded-t-lg cursor-pointer transition-all ${expandedParts[sectionIndex]
                  ? 'bg-purple-400 text-white shadow-md'
                  : 'hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-800 dark:text-gray-200'
                  }`}
                onClick={() => togglePart(sectionIndex)}
              >
                <div className="flex items-center">
                  <Layers className="h-5 w-5 mr-2" />
                  <span className="font-medium text-left">{section.title}</span>
                </div>
                {expandedParts[sectionIndex] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {expandedParts[sectionIndex] && (
                <div className="pt-2 pb-1 px-1">
                  {section.chapters && section.chapters.length > 0 ? (
                    section.chapters.map((chapter: Chapter, chapterIndex: number) => {
                      const chapterPath = `${sectionIndex}-${chapterIndex}`;

                      return (
                        <div key={chapterIndex} className="mb-1 pl-1 pr-1">
                          <button
                            type="button"
                            className={`w-full flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${expandedChapters[chapterPath]
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-sm'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleChapter(chapterPath);
                            }}
                          >
                            <div className="flex items-center">
                              {getChapterIcon(chapterIndex)}
                              <span className="text-sm font-medium ml-2 text-left">{chapter.title}</span>
                            </div>
                            {expandedChapters[chapterPath] ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </button>

                          {expandedChapters[chapterPath] && chapter.paragraphs && chapter.paragraphs.length > 0 && (
                            <div className="ml-4 mt-1">
                              {chapter.paragraphs.map((paragraph: Paragraph, paragraphIndex: number) => (
                                <button
                                  key={paragraphIndex}
                                  type="button"
                                  className={`w-full p-2 text-xs rounded-lg cursor-pointer transition-all flex items-center ${activeParagraph === `${sectionIndex}-${chapterIndex}-${paragraphIndex}`
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleParagraphClick(sectionIndex, chapterIndex, paragraphIndex);
                                  }}
                                >
                                  <Bookmark className="h-3 w-3 mr-2 flex-shrink-0" />
                                  <span className="truncate text-left">{paragraph.title}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : section.paragraphs && section.paragraphs.length > 0 ? (
                    <div className="ml-4">
                      {section.paragraphs.map((paragraph: Paragraph, paragraphIndex: number) => (
                        <button
                          key={paragraphIndex}
                          type="button"
                          className={`w-full p-2 text-xs rounded-lg cursor-pointer transition-all flex items-center ${activeParagraph === `${sectionIndex}-${paragraphIndex}`
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSectionIndex(sectionIndex);
                            setCurrentChapterIndex(0);
                            setCurrentParagraphIndex(paragraphIndex);
                            setActiveParagraph(`${sectionIndex}-0-${paragraphIndex}`);
                            setShowExercise(false);
                          }}
                        >
                          <FileText className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span className="truncate text-left">{paragraph.title}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="ml-4 p-2 text-xs text-gray-500 dark:text-gray-400">Pas de contenu disponible</div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Aucune section disponible
          </div>
        )}
      </nav>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleDownloadClick}
          className="fixed bottom-6 left-30 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-all hover:shadow-xl"
          title="Télécharger le cours"
          type="button"
        >
          <Download className="h-7 w-7" />
        </button>
      </div>
    </aside>
  );
};

export default CourseSidebar;