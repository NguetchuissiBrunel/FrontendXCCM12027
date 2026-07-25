'use client';

import { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import MainEditor from '@/components/editor/MainEditor';
import TableOfContents from '@/components/editor/TableOfContents';
import StructureDeCours from '@/components/editor/StructureDeCours';
import { FaSave, FaList, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import AICourseGenerator from '@/components/editor/AICourseGenerator';
import { useTOC } from '@/hooks/useTOC';
import { Editor } from '@tiptap/react';

/**
 * Moodle Editor Content Component
 * Full Featured version with TOC and Granules
 */
function MoodleEditorContent() {
  const searchParams = useSearchParams();
  
  // State for Moodle parameters
  const [params, setParams] = useState({
    token: '',
    userId: '',
    moduleId: '',
    baseUrl: '',
    mode: 'submission' as 'course_edit' | 'submission'
  });

  const [title, setTitle] = useState('');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activePanel, setActivePanel] = useState<'structure' | null>('structure');
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);

  // TOC hook
  const [tocItems, refreshTOC] = useTOC(editor, 300);
  const editorRef = useRef<any>(null);

  // Extract Moodle parameters from URL
  useEffect(() => {
    const getParam = (name: string) => {
      if (searchParams && searchParams.get(name)) return searchParams.get(name);
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
      }
      return null;
    };

    const moodleToken = getParam('moodle_token');
    const moodleUserId = getParam('moodle_user_id');
    const moodleModuleId = getParam('moodle_module_id');
    const moodleBaseUrl = getParam('moodle_base_url');
    const moodleMode = getParam('mode');

    if (moodleToken || moodleModuleId) {
      setParams({
        token: moodleToken || '',
        userId: moodleUserId || '',
        moduleId: moodleModuleId || '',
        baseUrl: moodleBaseUrl || '',
        mode: (moodleMode as any) || 'submission'
      });
    }
  }, [searchParams]);

  /**
   * Load initial content from Moodle
   */
  const loadInitialContent = useCallback(async () => {
    if (!params.token || !params.moduleId || !editor) return;

    try {
      setIsInitialLoading(true);
      const response = await fetch(`${params.baseUrl}/webservice/rest/server.php?wstoken=${params.token}&wsfunction=mod_xccm_get_content&moodlewsrestformat=json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          module_id: params.moduleId,
          user_id: params.mode === 'course_edit' ? '0' : params.userId
        })
      });

      const data = await response.json();
      
      if (data && !data.exception) {
        if (data.content) {
            try {
                const jsonContent = JSON.parse(data.content);
                editor.commands.setContent(jsonContent);
            } catch (e) {
                editor.commands.setContent(data.content);
            }
        } else if (params.mode === 'course_edit') {
            // Insert default structure for new courses
            const timestamp = Date.now();
            const defaultContent = {
                type: 'doc',
                content: [
                    {
                        type: 'section',
                        attrs: { id: `section-${timestamp}`, title: 'Partie' },
                        content: [
                            {
                                type: 'chapitre',
                                attrs: { id: `chapitre-${timestamp}`, title: 'Chapitre' },
                                content: [
                                    {
                                        type: 'paragraphe',
                                        attrs: { id: `paragraphe-${timestamp}`, title: 'Paragraphe' },
                                        content: [
                                            {
                                                type: 'notion',
                                                attrs: { id: `notion-${timestamp}`, title: 'Notion' },
                                                content: [
                                                    { type: 'paragraph', content: [{ type: 'text', text: 'Saisissez votre contenu ici...' }] }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            editor.commands.setContent(defaultContent);
        }
        setTitle(data.title || (params.mode === 'course_edit' ? 'Cours sans titre' : 'Ma composition'));
        setTimeout(() => refreshTOC(), 200);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, [params, editor, refreshTOC]);

  useEffect(() => {
    if (editor && params.token && params.moduleId && !isInitialLoading && title === '') {
        loadInitialContent();
    }
  }, [editor, params, isInitialLoading, loadInitialContent, title]);

  /**
   * Save content to Moodle
   */
  const saveContent = async () => {
    if (!editor) return;
    setIsSaving(true);
    const contentJson = editor.getJSON();

    try {
      const wsFunction = params.mode === 'course_edit' ? 'mod_xccm_save_course' : 'mod_xccm_save_composition';
      const formData = new URLSearchParams();
      formData.append('wstoken', params.token);
      formData.append('wsfunction', wsFunction);
      formData.append('moodlewsrestformat', 'json');
      formData.append('module_id', params.moduleId);
      formData.append('title', title);
      formData.append('content', JSON.stringify(contentJson));
      
      if (params.mode === 'submission') {
          formData.append('user_id', params.userId);
          formData.append('status', 'submitted');
      }

      // Direct call to Moodle with token in URL for better reliability
      const response = await fetch(`${params.baseUrl}/webservice/rest/server.php?wstoken=${params.token}&wsfunction=${wsFunction}&moodlewsrestformat=json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      const data = await response.json();
      if (data && data.exception) throw new Error(data.message || "Erreur Moodle");
      toast.success(params.mode === 'course_edit' ? 'Cours publié !' : 'Travail envoyé !');
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // TOC Handlers matching EditorLayout
  const handleTOCItemClick = (itemId: string) => {
    if (!editor) return;
    const element = editor.view.dom.querySelector(`[data-id="${itemId}"]`);
    if (element) {
      editor.view.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInsertGeneratedCourse = (tiptapJson: any) => {
    if (editor) {
      editor.commands.setContent(tiptapJson);
      setTimeout(() => refreshTOC(), 300);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-30">
        <div className="flex items-center gap-4 flex-1">
          <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
            {params.mode === 'course_edit' ? 'Mode Édition' : 'Mode Apprenant'}
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={params.mode !== 'course_edit'}
            className="text-lg font-bold bg-transparent border-none focus:ring-0 focus:outline-none w-full text-gray-800 dark:text-white"
          />
        </div>
        {params.mode === 'course_edit' && (
          <button
            onClick={() => setIsAIGeneratorOpen(true)}
            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 px-4 py-2 rounded-xl font-medium transition-all"
            title="Générer un cours avec l'IA"
          >
            <Sparkles size={16} />
            Générer avec l&apos;IA
          </button>
        )}
        <button
          onClick={saveContent}
          disabled={isSaving || isInitialLoading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-medium transition-all"
        >
          <FaSave />
          {isSaving ? 'Sauvegarde...' : params.mode === 'course_edit' ? 'Publier le cours' : 'Envoyer mon travail'}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: TOC */}
        <aside className={`${showSidebar ? 'w-72' : 'w-0'} flex-none bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden relative`}>
          <TableOfContents 
            items={tocItems} 
            onItemClick={handleTOCItemClick}
            onItemRename={(id, title) => editorRef.current?.handleTOCAction('rename', id, title)}
            onItemDelete={(id) => editorRef.current?.handleTOCAction('delete', id)}
          />
        </aside>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={`absolute top-4 z-20 p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg shadow-sm ${showSidebar ? 'left-72' : 'left-0'} transition-all duration-300`}
        >
          {showSidebar ? <FaChevronLeft size={12} /> : <FaChevronRight size={12} />}
        </button>

        {/* Center: Editor */}
        <main className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-gray-950">
          <MainEditor
            initialContent=""
            onEditorReady={(e) => setEditor(e)}
            ref={editorRef}
          />
          {isInitialLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-medium">Chargement du contenu...</p>
              </div>
            </div>
          )}
        </main>

        {/* Right: Icon Bar & Panels */}
        <div className="flex flex-none">
          {/* Panel Area */}
          <div className={`${activePanel ? 'w-80' : 'w-0'} bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden`}>
            {activePanel === 'structure' && (
              <StructureDeCours onClose={() => setActivePanel(null)} authorId={params.userId} />
            )}
          </div>

          {/* Right Icon Bar */}
          <div className="w-14 flex-none bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-4">
            <button
              onClick={() => setActivePanel(activePanel === 'structure' ? null : 'structure')}
              className={`p-3 rounded-lg transition-colors ${activePanel === 'structure' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:bg-gray-100'}`}
              title="Granules"
            >
              <FaList size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* AI Course Generator Modal */}
      {isAIGeneratorOpen && (
        <AICourseGenerator
          onClose={() => setIsAIGeneratorOpen(false)}
          onInsertToEditor={handleInsertGeneratedCourse}
        />
      )}
    </div>
  );
}

export default function MoodleEditorPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Initialisation...</div>}>
      <MoodleEditorContent />
    </Suspense>
  );
}
