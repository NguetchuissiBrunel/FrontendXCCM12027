'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaPlus, FaSearch, FaChevronLeft, FaChevronRight, FaMicrophone, FaPaperPlane, FaEdit, FaShareAlt, FaEllipsisH, FaSpinner, FaTrashAlt, FaBookOpen, FaTimes } from 'react-icons/fa';
import { MdOutlineSettings, MdHistory, MdAudioFile, MdAutoGraph, MdPieChart, MdTableChart, MdQuiz, MdInfo } from 'react-icons/md';
import { BsLightbulb, BsFilePdf } from 'react-icons/bs';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { use } from 'react';
import { NotebookControllerService, CourseControllerService, EnrollmentControllerService } from '@/lib';
import { useAuth } from '@/contexts/AuthContext';
import { Notebook, Source, ChatMessage, StudioActivity } from '@/types/notebook';
import { MindMapGraph } from '@/components/studio/MindMapGraph';
import toast from 'react-hot-toast';

// Interfaces are now imported from @/types/notebook

interface Tool {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  beta?: boolean;
}

const NotebookWorkspace = ({ params }: { params: Promise<{ id: string, locale: string }> }) => {
  const { id } = use(params);
  const t_nb = useTranslations('notebook');
  const router = useRouter();
  const { user } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [activeTab, setActiveTab] = useState('discussion');
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  // Persistence States
  const [title, setTitle] = useState(t_nb('untitled'));
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [studioActivities, setStudioActivities] = useState<StudioActivity[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentId, setCurrentId] = useState(id);
  const [isCreating, setIsCreating] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<StudioActivity | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Initial Loading
  useEffect(() => {
    const loadNotebook = async () => {
      if (!user?.id) return;

      if (id !== 'new') {
        try {
          // Since there's no getNotebookById in the generated service, we fetch all and find
          // (This is a fallback; in a real prod app, you'd add the endpoint to the service)
          const allNotebooks = await NotebookControllerService.getUserNotebooks(user.id);
          const saved = allNotebooks.find(nb => nb.id === id);

          if (saved) {
            setTitle(saved.title || t_nb('untitled'));

            // Parse metadata
            if (saved.metadata) {
              try {
                const metadata = JSON.parse(saved.metadata);
                setChatHistory(metadata.chatHistory || []);
                setStudioActivities(metadata.studioActivities || []);
              } catch (e) {
                console.error("Error parsing notebook metadata", e);
              }
            }

            // Load sources from API
            const apiSources = await NotebookControllerService.getNotebookSources(id);
            const mappedSources: Source[] = apiSources.map(as => ({
              id: as.id || crypto.randomUUID(),
              name: as.name || 'Unknown',
              type: as.type || 'pdf',
              selected: true
            }));
            setSources(mappedSources);
          }
        } catch (error) {
          console.error("Failed to load notebook from API:", error);
          toast.error("Erreur lors du chargement du notebook");
        }
      }
      setIsLoaded(true);
    };

    loadNotebook();
  }, [id, user?.id]);

  // Auto-save logic (only title and metadata for now)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      if (currentId === 'new') {
        try {
          const response = await NotebookControllerService.createNotebook(user.id, {
            title,
            metadata: JSON.stringify({ chatHistory, studioActivities })
          });

          if (response && response.id) {
            setCurrentId(response.id);
            router.replace(`/notebook/${response.id}`);
            console.log('Notebook created and saved:', response.id);
          }
        } catch (error) {
          console.error("Failed to create notebook on backend:", error);
        }
      } else {
        // Handle update if endpoint exists, otherwise we're just syncing sources and metadata locally for now
        // Based on the generated service, only createNotebook is available at /api/v1/notebooks/user/{userId}
        console.log('Auto-save for existing notebook local-only (update endpoint missing)');
      }
    }, 2000); // 2s debounce for API calls

    return () => clearTimeout(timer);
  }, [title, chatHistory, studioActivities, isLoaded, currentId, router, user?.id]);

  const handleCreateNew = async () => {
    // Navigate to a fresh new notebook
    router.push('/notebook/new');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setSelectedActivity(null);

    if (currentId === 'new') {
      toast.error("Veuillez d'abord télécharger une source.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/v1/notebooks/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebook_id: currentId, message: inputMessage })
      });

      if (!res.ok) throw new Error("API Issue");
      const data = await res.json();

      const aiResponse: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer || "Impossible de générer une réponse.",
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, aiResponse]);

      const newActivity: StudioActivity = {
        id: crypto.randomUUID(),
        type: 'chat',
        title: 'Discussion avec l\'IA',
        timestamp: new Date().toISOString()
      };
      setStudioActivities(prev => [newActivity, ...prev]);
    } catch (err) {
      console.error(err);
      toast.error("Erreur de connexion à l'IA.");
    }
  };

  const handleAddSource = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?.id) return;

    // If it's a new notebook, we need to create it first before adding sources
    let notebookId = currentId;
    if (notebookId === 'new') {
      const loadingToast = toast.loading("Création du notebook...");
      try {
        const response = await NotebookControllerService.createNotebook(user.id, {
          title,
          metadata: JSON.stringify({ chatHistory, studioActivities })
        });
        if (response && response.id) {
          notebookId = response.id;
          setCurrentId(notebookId);
          router.replace(`/notebook/${notebookId}`);
          toast.success("Notebook créé", { id: loadingToast });
        } else {
          throw new Error("Failed to create notebook");
        }
      } catch (error) {
        toast.error("Erreur lors de la création du notebook", { id: loadingToast });
        return;
      }
    }

    const uploadToast = toast.loading(`Envoi de ${files.length} source(s)...`);
    try {
      const newSources: Source[] = [];

      for (const file of Array.from(files)) {
        // Envoi à l'API
        const apiSource = await NotebookControllerService.addSource(notebookId, {
          name: file.name,
          type: file.name.split('.').pop() || 'pdf',
          contentText: "Contenu extrait..." // Normalement géré côté serveur ou par un parser client
        });

        // Envoi au service d'indexation (Python) pour le RAG
        try {
          const formData = new FormData();
          formData.append('notebook_id', notebookId);
          formData.append('source_id', apiSource.id || '');
          formData.append('file', file);

          await fetch(`http://localhost:8000/api/v1/notebooks/index`, {
            method: 'POST',
            body: formData
          });
        } catch (indexErr) {
          console.error("Indexation failed for", file.name, indexErr);
        }

        newSources.push({
          id: apiSource.id || crypto.randomUUID(),
          name: apiSource.name || file.name,
          type: apiSource.type || 'pdf',
          selected: true
        });
      }

      setSources(prev => [...prev, ...newSources]);
      toast.success(`${newSources.length} source(s) ajoutée(s)`, { id: uploadToast });
    } catch (error) {
      console.error("Failed to upload sources:", error);
      toast.error("Erreur lors de l'envoi des sources", { id: uploadToast });
    }

    // Clear input
    e.target.value = '';
  };

  const handleToggleSource = (sourceId: string | number) => {
    setSources(prev => prev.map(s =>
      s.id === sourceId ? { ...s, selected: !s.selected } : s
    ));
  };

  const handleDeleteSource = (e: React.MouseEvent, sourceId: string | number) => {
    e.stopPropagation();
    setSources(prev => prev.filter(s => s.id !== sourceId));
    toast.success('Source retirée');
  };

  const handleSelectAll = (checked: boolean) => {
    setSources(prev => prev.map(s => ({ ...s, selected: checked })));
  };

  const handleGenerateTool = async (toolId: string, label: string) => {
    if (currentId === 'new') {
      toast.error("Veuillez d'abord télécharger une source.");
      return;
    }

    const toastId = toast.loading(`Génération de : ${label}... (Ceci peut prendre une minute)`);
    try {
      // Connect to LLM-SERVICE
      const res = await fetch(`http://localhost:8000/api/v1/notebooks/studio/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notebook_id: currentId,
          activity_type: toolId,
          topic: "Synthèse générale"
        })
      });

      if (!res.ok) {
        throw new Error("HTTP error " + res.status);
      }

      const data = await res.json();

      let finalContent = "";
      if (data.payload) {
        finalContent = data.payload.markdown || data.payload.raw_text || JSON.stringify(data.payload, null, 2);
      } else {
        finalContent = data.content || JSON.stringify(data, null, 2);
      }

      const newActivity: StudioActivity = {
        id: crypto.randomUUID(),
        type: toolId as any,
        title: label,
        timestamp: new Date().toISOString(),
        payload: finalContent
      };

      setStudioActivities(prev => [newActivity, ...prev]);
      toast.success(`${label} généré avec succès !`, { id: toastId });

      // Auto-open the generated activity
      setSelectedActivity(newActivity);
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la génération. Le service IA est-il lancé ?', { id: toastId });
    }
  };

  const handleOpenCourseModal = async () => {
    setIsCourseModalOpen(true);
    setIsLoadingCourses(true);
    try {
      // On utilise getAllCourses au lieu de getEnrichedCourses car ce dernier renvoie une erreur 500
      const res = await CourseControllerService.getAllCourses();
      const allCourses = res.data || [];

      // On récupère d'abord les cours créés par l'utilisateur
      let courses = allCourses.filter((c: any) => c.author?.id === user?.id);

      try {
        // Obtenir la liste des inscriptions de l'utilisateur
        const enrollmentsRes = await EnrollmentControllerService.getMyEnrollments();
        const enrolledIds = (enrollmentsRes.data || []).map((e: any) => e.courseId);

        // Ajouter les cours où l'utilisateur est inscrit
        const enrolledCourses = allCourses.filter((c: any) => enrolledIds.includes(c.id) && c.author?.id !== user?.id);
        courses = [...courses, ...enrolledCourses];
      } catch (enrollErr) {
        console.warn("Impossible de récupérer les inscriptions", enrollErr);
        // On continue même si la récupération des inscriptions échoue
      }

      setUserCourses(courses);
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors du chargement des cours');
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleAddCourseSource = async (course: any) => {
    if (!user?.id) return;

    let notebookId = currentId;
    if (notebookId === 'new') {
      const loadingToast = toast.loading("Création du notebook...");
      try {
        const response = await NotebookControllerService.createNotebook(user.id, {
          title,
          metadata: JSON.stringify({ chatHistory, studioActivities })
        });
        if (response && response.id) {
          notebookId = response.id;
          setCurrentId(notebookId);
          router.replace(`/notebook/${notebookId}`);
          toast.success("Notebook créé", { id: loadingToast });
        } else {
          throw new Error("Failed to create notebook");
        }
      } catch (error) {
        toast.error("Erreur lors de la création du notebook", { id: loadingToast });
        return;
      }
    }

    const uploadToast = toast.loading(`Ajout du cours...`);
    try {
      const apiSource = await NotebookControllerService.addSource(notebookId, {
        name: course.title,
        type: 'course',
        contentText: `Contenu du cours (${course.id}) intégré...` // Simulation du contenu extrait
      });

      const newSource: Source = {
        id: apiSource.id || crypto.randomUUID(),
        name: apiSource.name || course.title,
        type: 'course',
        selected: true
      };

      setSources(prev => [...prev, newSource]);
      toast.success(`Cours ajouté avec succès`, { id: uploadToast });
      setIsCourseModalOpen(false);
    } catch (error) {
      toast.error("Erreur lors de l'ajout du cours", { id: uploadToast });
    }
  };

  return (
    <div className="fixed inset-0 top-16 bg-gray-50 dark:bg-gray-950 flex overflow-hidden z-40">
      {/* LEFT COLUMN: SOURCES */}
      <div className={`${isLeftOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 pointer-events-none'} border-r border-purple-100 dark:border-purple-800/50 flex flex-col bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ease-in-out relative z-30 overflow-hidden`}>
        <div className="p-4 border-b border-purple-100 dark:border-purple-800/50 flex justify-between items-center bg-purple-50/50 dark:bg-purple-900/10 h-16 min-w-[20rem]">
          <h2 className="font-bold text-purple-700 dark:text-purple-300 truncate">{t_nb('addSource')}</h2>
          <button
            onClick={() => setIsLeftOpen(false)}
            className="text-purple-400 hover:text-purple-600 transition-colors p-1"
          >
            <FaChevronLeft size={14} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex space-x-2">
            <button
              onClick={handleAddSource}
              className="flex-1 flex flex-col items-center justify-center space-y-1 py-1.5 bg-purple-600 text-white rounded-xl font-bold shadow-md hover:bg-purple-700 transition-all active:scale-95"
              title="Ajouter un fichier externe"
            >
              <FaPlus className="w-4 h-4" />
              <span className="text-[10px] uppercase">Externe</span>
            </button>
            <button
              onClick={handleOpenCourseModal}
              className="flex-1 flex flex-col items-center justify-center space-y-1 py-1.5 bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-xl font-bold shadow-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all active:scale-95"
              title="Ajouter un cours de la plateforme"
            >
              <FaBookOpen className="w-4 h-4" />
              <span className="text-[10px] uppercase">Mes cours</span>
            </button>
          </div>

          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              placeholder={t_nb('searchSources')}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>{t_nb('selectAll')}</span>
              <input
                type="checkbox"
                checked={sources.length > 0 && sources.every(s => s.selected)}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              {sources.map(source => (
                <div
                  key={source.id}
                  onClick={() => handleToggleSource(source.id)}
                  className={`flex items-center p-3 rounded-xl cursor-pointer group transition-all border ${source.selected
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/50'
                    : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mr-3 shadow-sm transition-all ${source.selected
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 scale-110'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                    <BsFilePdf className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate transition-colors ${source.selected ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>{source.name}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleDeleteSource(e, source.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Supprimer"
                    >
                      <FaTrashAlt size={12} />
                    </button>
                    <input
                      type="checkbox"
                      checked={source.selected}
                      readOnly
                      className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer pointer-events-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE COLUMN: DISCUSSION / CONTENT */}
      <div className="flex-1 flex flex-col relative bg-white dark:bg-gray-900">
        {/* Workspace Header */}
        <div className="h-16 border-b border-purple-100 dark:border-purple-800/50 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <Link
              href="/notebook"
              className="p-2.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full transition-all border border-transparent hover:border-purple-100 shadow-sm"
              title={t_nb('backToDashboard')}
            >
              <FaChevronLeft size={16} />
            </Link>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-bold text-gray-800 dark:text-white truncate max-w-md text-lg bg-transparent border-none outline-none focus:ring-1 focus:ring-purple-200 rounded px-1 w-full"
              placeholder={t_nb('untitled')}
            />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateNew}
              disabled={isCreating}
              className={`bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-95 leading-none h-10 ${isCreating ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isCreating ? (
                <FaSpinner size={10} className="animate-spin" />
              ) : (
                <FaPlus size={10} />
              )}
              <span>{isCreating ? t_nb('loading') : t_nb('create')}</span>
            </button>

          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className="max-w-3xl mx-auto space-y-8">
            {selectedActivity ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-purple-100 dark:border-purple-800/50 relative">
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="absolute right-4 top-4 text-purple-400 hover:text-purple-600 transition-colors p-2 bg-purple-50 dark:bg-purple-900/20 rounded-full"
                >
                  <FaChevronLeft size={12} className="inline mr-1" /> Fermer {selectedActivity.title}
                </button>
                <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-6">{selectedActivity.title}</h2>
                <div className="prose prose-purple dark:prose-invert max-w-none">
                  {selectedActivity.payload ? (
                    selectedActivity.type === 'mindmap' ? (
                      <MindMapGraph data={selectedActivity.payload} />
                    ) : (
                      <ReactMarkdown>{selectedActivity.payload}</ReactMarkdown>
                    )
                  ) : (
                    <p className="text-gray-500 italic">Contenu non disponible.</p>
                  )}
                </div>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 shadow-inner">
                  <FaPlus size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t_nb('getStartedTitle')}</h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm">{t_nb('getStartedDesc')}</p>
                </div>
                <button
                  onClick={handleAddSource}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md"
                >
                  {t_nb('addSourceBtn')}
                </button>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-purple-100 dark:border-gray-700 rounded-tl-none'
                      }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <span className={`text-[10px] mt-2 block opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-gray-50/50 dark:bg-gray-950/50">
          <div className="max-w-4xl mx-auto flex items-center bg-white dark:bg-gray-800 rounded-full py-2 px-6 shadow-lg border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={t_nb('writeMessage')}
              className="flex-1 bg-transparent resize-none border-none outline-none text-sm py-2 max-h-32"
              rows={1}
            />
            <div className="flex items-center space-x-3 ml-2 border-l pl-4 border-gray-100 dark:border-gray-700">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t_nb('sourceCount', { count: sources.length })}</span>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="text-purple-600 hover:text-purple-700 disabled:text-gray-300 transition-colors transform hover:scale-110 active:scale-95"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Toggle Buttons for collapsed sidebars */}
        {!isLeftOpen && (
          <button
            onClick={() => setIsLeftOpen(true)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-800/50 p-2.5 rounded-xl shadow-2xl text-purple-600 z-[60] hover:scale-110 active:scale-95 transition-all pointer-events-auto"
            title={t_nb('addSource')}
          >
            <FaChevronRight size={16} />
          </button>
        )}

        {!isRightOpen && (
          <button
            onClick={() => setIsRightOpen(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-800/50 p-2.5 rounded-xl shadow-2xl text-purple-600 z-[60] hover:scale-110 active:scale-95 transition-all pointer-events-auto"
            title={t_nb('studio')}
          >
            <FaChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* RIGHT COLUMN: STUDIO */}
      <div className={`${isRightOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 pointer-events-none'} border-l border-purple-100 dark:border-purple-800/50 flex flex-col bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out relative z-30 overflow-hidden`}>
        <div className="p-4 border-b border-purple-100 dark:border-purple-800/50 flex justify-between items-center bg-purple-50/50 dark:bg-purple-900/10 h-16 min-w-[20rem]">
          <h2 className="font-bold text-purple-700 dark:text-purple-300 truncate">{t_nb('studio')}</h2>
          <button
            onClick={() => setIsRightOpen(false)}
            className="text-purple-400 hover:text-purple-600 transition-colors p-1"
          >
            <FaChevronRight size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 min-w-[20rem]">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-2">
            {([
              { id: 'mindmap', icon: <MdTableChart className="text-purple-500" />, label: t_nb('tools.mindmap'), color: 'bg-purple-50 dark:bg-purple-900/20' },
              { id: 'reports', icon: <MdQuiz className="text-pink-500" />, label: t_nb('tools.reports'), color: 'bg-pink-50 dark:bg-pink-900/20' },
            ] as Tool[]).map((tool, idx) => {
              const hasSelectedSources = sources.some(s => s.selected);
              return (
                <div
                  key={tool.id}
                  onClick={() => hasSelectedSources && handleGenerateTool(tool.id, tool.label)}
                  className={`${tool.color} p-4 rounded-2xl transition-all border border-transparent transform ${hasSelectedSources
                    ? 'cursor-pointer hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-500 hover:-translate-y-1 active:scale-95 group'
                    : 'opacity-40 grayscale cursor-not-allowed pointer-events-none shadow-none'
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all transform ${hasSelectedSources ? 'group-hover:bg-purple-600 group-hover:text-white group-hover:rotate-12' : ''}`}>{tool.icon}</div>
                    {tool.beta && <span className="text-[10px] font-black bg-purple-600 text-white px-2 py-0.5 rounded-full leading-none uppercase shadow-sm">Beta</span>}
                  </div>
                  <p className={`text-xs font-black leading-tight ${hasSelectedSources ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>{tool.label}</p>
                </div>
              );
            })}
          </div>

          {/* Activity Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t_nb('recentActivities')}</h3>
            {studioActivities.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase">{t_nb('noActivity')}</p>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {studioActivities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className="p-3 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/50 rounded-xl flex items-center space-x-3 group hover:bg-white dark:hover:bg-gray-800 transition-all hover:shadow-sm animate-in fade-in slide-in-from-right-4 duration-300 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      {activity.type === 'chat' && <MdHistory size={16} />}
                      {activity.type === 'mindmap' && <MdTableChart size={16} />}
                      {['audio', 'presentation', 'video', 'reports', 'flashcards'].includes(activity.type) && <MdAutoGraph size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">{activity.title}</p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      {/* Course Selection Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] border border-purple-100 dark:border-purple-800/50 relative overflow-hidden">
            <div className="p-4 border-b border-purple-100 dark:border-purple-800/50 flex items-center justify-between bg-purple-50/50 dark:bg-purple-900/10">
              <h2 className="text-lg font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <FaBookOpen />
                Sélectionner un cours
              </h2>
              <button onClick={() => setIsCourseModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-100 transition-colors bg-white dark:bg-gray-800 rounded-full p-2">
                <FaTimes size={16} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingCourses ? (
                <div className="flex justify-center items-center h-40 text-purple-600">
                  <FaSpinner className="animate-spin" size={32} />
                </div>
              ) : userCourses.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p>Aucun cours trouvé. Vous n'êtes inscrit à aucun cours.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userCourses.map(course => (
                    <div
                      key={course.id}
                      onClick={() => handleAddCourseSource(course)}
                      className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-purple-100 dark:border-purple-800/50 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 cursor-pointer transition-all flex items-center space-x-3 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <FaBookOpen size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">{course.title}</h3>
                        <p className="text-xs text-gray-500 truncate">{course.author?.username || "Auteur inconnu"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NotebookWorkspace;
