'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaSearch, FaChevronLeft, FaChevronRight, FaMicrophone, FaPaperPlane, FaEdit, FaShareAlt, FaEllipsisH, FaSpinner, FaTrashAlt } from 'react-icons/fa';
import { MdOutlineSettings, MdHistory, MdAudioFile, MdAutoGraph, MdPieChart, MdTableChart, MdQuiz, MdInfo } from 'react-icons/md';
import { BsLightbulb, BsFilePdf } from 'react-icons/bs';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { use } from 'react';
import { getNotebook, saveNotebook } from '@/lib/notebook-storage';
import { Notebook, Source, ChatMessage, StudioActivity } from '@/types/notebook';
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Initial Loading
  useEffect(() => {
    if (id !== 'new') {
      const saved = getNotebook(id);
      if (saved) {
        setSources(saved.sources);
        setTitle(saved.title);
        setChatHistory(saved.chatHistory);
        setStudioActivities(saved.studioActivities || []);
      }
    }
    setIsLoaded(true);
  }, [id]);

  // Auto-save logic
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!isLoaded) return;

    // Avoid saving on first mount if we just loaded data
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      let notebookId = currentId;

      // If it's a new notebook, generate an ID on first save
      if (notebookId === 'new') {
        notebookId = crypto.randomUUID();
        setCurrentId(notebookId);
        // Redirect to the new URL without refreshing
        router.replace(`/notebook/${notebookId}`);
      }

      const notebookToSave: Notebook = {
        id: notebookId,
        title,
        sources,
        chatHistory,
        studioActivities,
        updatedAt: new Date().toISOString()
      };

      saveNotebook(notebookToSave);
      console.log('Notebook auto-saved:', notebookId);
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [title, sources, chatHistory, studioActivities, isLoaded, currentId, router]);

  const handleCreateNew = async () => {
    setIsCreating(true);
    const loadingToast = toast.loading(t_nb('saving'));

    try {
      // Force immediate save of current work
      let notebookId = currentId;
      if (notebookId === 'new') {
        notebookId = crypto.randomUUID();
      }

      const notebookToSave: Notebook = {
        id: notebookId,
        title,
        sources,
        chatHistory,
        studioActivities,
        updatedAt: new Date().toISOString()
      };

      saveNotebook(notebookToSave);

      // Update toast
      toast.success(t_nb('newNotebookCreated'), { id: loadingToast });

      // Artificial delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Navigate to a fresh new notebook
      router.push('/notebook/new');
    } catch (error) {
      toast.error('Erreur lors de la création', { id: loadingToast });
      setIsCreating(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, newUserMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I've analyzed your sources. Regarding "${inputMessage}", here is what I found...`,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, aiResponse]);

      // Add to activities
      const newActivity: StudioActivity = {
        id: crypto.randomUUID(),
        type: 'chat',
        title: 'Discussion avec l\'IA',
        timestamp: new Date().toISOString()
      };
      setStudioActivities(prev => [newActivity, ...prev]);
    }, 1000);
  };

  const handleAddSource = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newSources: Source[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.name.split('.').pop() || 'pdf',
      selected: true
    }));

    setSources(prev => [...prev, ...newSources]);
    toast.success(`${newSources.length} source(s) ajoutée(s)`);

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

  const handleGenerateTool = (toolId: string, label: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `Génération de : ${label}...`,
        success: `${label} généré avec succès !`,
        error: 'Erreur lors de la génération',
      }
    ).then(() => {
      const newActivity: StudioActivity = {
        id: crypto.randomUUID(),
        type: toolId as any,
        title: label,
        timestamp: new Date().toISOString()
      };
      setStudioActivities(prev => [newActivity, ...prev]);
    });
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
          <button
            onClick={handleAddSource}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-md hover:bg-purple-700 transition-all active:scale-95"
          >
            <FaPlus className="w-3.5 h-3.5" />
            <span className="text-sm">{t_nb('addSource')}</span>
          </button>

          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              placeholder={t_nb('searchSources')}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800/50 rounded-lg p-1">
            <button className="flex-1 py-1.5 text-xs font-bold bg-white dark:bg-purple-700 text-purple-600 dark:text-white rounded shadow-sm">Web</button>
            <button className="flex-1 py-1.5 text-xs font-semibold text-purple-400">Research</button>
            <button className="p-1 px-2 text-purple-400"><FaChevronRight size={10} /></button>
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
            {chatHistory.length === 0 ? (
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
                  <div key={activity.id} className="p-3 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/50 rounded-xl flex items-center space-x-3 group hover:bg-white dark:hover:bg-gray-800 transition-all hover:shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
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
    </div>
  );
};

export default NotebookWorkspace;
