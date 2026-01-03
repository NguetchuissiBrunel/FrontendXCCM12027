// src/components/editor/EditorLayout.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FaCloudUploadAlt,
  FaInfo,
  FaComments,
  FaFolderOpen,
  FaChalkboardTeacher,
  FaCog,
  FaSave,
  FaPaperPlane,
  FaTimes,
  FaImage
} from 'react-icons/fa';
import TableOfContents from './TableOfContents';
import MainEditor from './MainEditor';
import StructureDeCours from './StructureDeCours';
import { useAuth } from '@/contexts/AuthContext';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { parseTOCFromHTML, generateHTMLFromItem } from '@/utils/editorUtils';
import { TableOfContentsItem, ItemType } from '@/types/editor.types';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { MainEditorRef } from './MainEditor';

interface EditorLayoutProps {
  children?: React.ReactNode;
}

/**
 * Right panel types matching original implementation
 */
type RightPanelType = 'structure' | 'info' | 'feedback' | 'author' | 'worksheet' | 'properties' | null;

export const EditorLayout: React.FC<EditorLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [activePanel, setActivePanel] = useState<RightPanelType>('structure');
  const [courseTitle, setCourseTitle] = useState('New Course');
  const [courseId, setCourseId] = useState<number | null>(null);
  const [content, setContent] = useState('<p>Commencez à écrire votre contenu ici...</p>');
  const [tocItems, setTocItems] = useState<TableOfContentsItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [courseImage, setCourseImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<MainEditorRef>(null);

  // Update TOC when content changes
  useEffect(() => {
    const newToc = parseTOCFromHTML(content);
    setTocItems(newToc);
  }, [content]);

  // Toggle panel - close if same icon clicked, switch if different
  const togglePanel = (panelType: RightPanelType) => {
    if (activePanel === panelType) {
      setActivePanel(null); // Close if clicking same icon
    } else {
      setActivePanel(panelType); // Switch to new panel
    }
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
    if (!user) {
      toast.error("Vous devez être connecté pour sauvegarder");
      return;
    }

    setIsSaving(true);
    try {
      if (courseId) {
        // Update existing course
        await CourseControllerService.updateCourse(courseId, {
          title: courseTitle,
          content: content,
          // category and description could be added here if we had fields for them
        });

        if (status === 'PUBLISHED') {
          await CourseControllerService.updateCourseStatus(courseId, 'PUBLISHED');
        }

        toast.success(status === 'PUBLISHED' ? "Cours publié !" : "Cours sauvegardé !");
      } else {
        // Create new course
        const response = await CourseControllerService.createCourse(user.id, {
          title: courseTitle,
          content: content,
          category: "Général", // Default category
          description: "Nouveau cours créé via l'éditeur",
        });

        const newCourseId = (response as any).id;
        setCourseId(newCourseId);

        if (status === 'PUBLISHED' && newCourseId) {
          await CourseControllerService.updateCourseStatus(newCourseId, 'PUBLISHED');
        }

        toast.success(status === 'PUBLISHED' ? "Cours créé et publié !" : "Cours créé !");
      }
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!courseId) {
      toast.error("Veuillez sauvegarder le cours avant d'ajouter une image de couverture");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const imageUrl = await CourseControllerService.uploadImage(courseId, formData as any);
      setCourseImage(imageUrl);
      toast.success("Image de couverture mise à jour");
    } catch (error) {
      console.error("Cover image upload error:", error);
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImport = (item: any, type: ItemType) => {
    if (!editorRef.current?.editor) {
      toast.error("Éditeur non prêt");
      return;
    }

    const html = generateHTMLFromItem(item, type);
    editorRef.current.editor.chain().focus().insertContent(html).run();
    toast.success("Contenu importé");
  };

  /**
   * IconBar Button Component
   */
  const IconButton = ({
    icon,
    label,
    panelType,
    colorClass = 'text-purple-600 dark:text-purple-400'
  }: {
    icon: React.ReactNode;
    label: string;
    panelType: RightPanelType;
    colorClass?: string;
  }) => {
    const isActive = activePanel === panelType;

    return (
      <button
        onClick={() => togglePanel(panelType)}
        className={`flex h-12 w-12 items-center justify-center rounded-lg transition-all ${isActive
          ? `${colorClass} bg-purple-100 dark:bg-purple-900`
          : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        title={label}
      >
        <span className="text-xl">{icon}</span>
      </button>
    );
  };

  return (
    <div className="mt-16 flex h-screen w-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* HEADER - Editor toolbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 px-6 shadow-md">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className="bg-transparent border-none text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-300 rounded px-2"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('DRAFT')}
            disabled={isSaving}
            className="rounded bg-white dark:bg-gray-200 bg-opacity-20 dark:bg-opacity-30 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/30 transition-all disabled:opacity-50"
          >
            {isSaving ? "Chargement..." : "Sauvegarder"}
          </button>
          <button
            onClick={() => handleSave('PUBLISHED')}
            disabled={isSaving}
            className="rounded bg-white dark:bg-gray-200 px-4 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-800 hover:bg-gray-100 dark:hover:bg-gray-300 transition-all disabled:opacity-50"
          >
            Publier
          </button>
        </div>
      </header>

      {/* MAIN CONTENT - Three columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR - Table of Contents */}
        <aside className="w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
          <TableOfContents
            items={tocItems}
            onItemClick={(itemId) => console.log('TOC item clicked:', itemId)}
          />
        </aside>

        {/* CENTER - Main Editor */}
        <main className="flex-1 overflow-hidden bg-white dark:bg-gray-900">
          <MainEditor
            initialContent={content}
            onContentChange={setContent}
            courseId={courseId}
          />
        </main>

        {/* RIGHT SECTION - IconBar + Panel */}
        <div className="flex">
          {/* Panel Area - Slides based on activePanel */}
          <div
            className={`overflow-y-auto border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ${activePanel ? 'w-72' : 'w-0 overflow-hidden'
              }`}
          >
            {/* PANEL 1: Structure de cours */}
            {activePanel === 'structure' && (
              <StructureDeCours
                onClose={() => setActivePanel(null)}
                onImport={handleImport}
              />
            )}

            {/* PANEL 2: Infos */}
            {activePanel === 'info' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Infos</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  ID du cours: {courseId || "Non sauvegardé"}
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Image de couverture
                  </label>
                  <div
                    className="relative aspect-video w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700/30 group cursor-pointer"
                    onClick={() => coverImageInputRef.current?.click()}
                  >
                    {courseImage ? (
                      <img src={courseImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        {isUploadingImage ? (
                          <Loader2 className="h-6 w-6 animate-spin text-purple-500 mx-auto" />
                        ) : (
                          <>
                            <FaImage className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                            <span className="text-xs text-gray-400">Cliquez pour uploader</span>
                          </>
                        )}
                      </div>
                    )}

                    {courseImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-white font-medium">Changer l'image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={coverImageInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                  />
                </div>
              </div>
            )}

            {/* PANEL 3: Appréciations */}
            {activePanel === 'feedback' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Appréciations</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Commentaires et questions à venir...
                </div>
              </div>
            )}

            {/* PANEL 4: Mes Cours */}
            {activePanel === 'author' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Mes Cours</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Cours de l'auteur à venir...
                </div>
              </div>
            )}

            {/* PANEL 5: Travaux Dirigés */}
            {activePanel === 'worksheet' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Travaux Dirigés</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Feuilles de TD à venir...
                </div>
              </div>
            )}

            {/* PANEL 6: Propriétés */}
            {activePanel === 'properties' && (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Propriétés</h2>
                  <button onClick={() => setActivePanel(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FaTimes />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Propriétés du document à venir...
                </div>
              </div>
            )}
          </div>

          {/* Icon Bar - Always visible */}
          <div className="flex w-16 flex-col items-center gap-3 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-6">
            {/* Panel toggle icons */}
            <IconButton
              icon={<FaCloudUploadAlt />}
              label="Importer des connaissances"
              panelType="structure"
              colorClass="text-purple-600 dark:text-purple-400"
            />
            <IconButton
              icon={<FaInfo />}
              label="Infos"
              panelType="info"
              colorClass="text-blue-600 dark:text-blue-400"
            />
            <IconButton
              icon={<FaComments />}
              label="Appréciations"
              panelType="feedback"
              colorClass="text-green-600 dark:text-green-400"
            />
            <IconButton
              icon={<FaFolderOpen />}
              label="Mes Cours"
              panelType="author"
              colorClass="text-orange-600 dark:text-orange-400"
            />
            <IconButton
              icon={<FaChalkboardTeacher />}
              label="Travaux Dirigés"
              panelType="worksheet"
              colorClass="text-indigo-600 dark:text-indigo-400"
            />
            <IconButton
              icon={<FaCog />}
              label="Propriétés"
              panelType="properties"
              colorClass="text-gray-600 dark:text-gray-400"
            />

            {/* Spacer to push actions to bottom */}
            <div className="flex-1"></div>

            {/* Bottom action buttons */}
            <button
              onClick={() => handleSave('DRAFT')}
              disabled={isSaving}
              className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Sauvegarder"
            >
              <FaSave className="text-xl" />
            </button>
            <button
              onClick={() => handleSave('PUBLISHED')}
              disabled={isSaving}
              className="flex h-12 w-12 items-center justify-center rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 transition-colors disabled:opacity-50"
              title="Publier"
            >
              <FaPaperPlane className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;