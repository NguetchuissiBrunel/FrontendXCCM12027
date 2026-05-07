'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FaPlus, FaSearch, FaBook, FaTrashAlt, FaRegTrashAlt } from 'react-icons/fa';
import { MdAutoStories } from 'react-icons/md';
import Image from 'next/image';
import { NotebookControllerService } from '@/lib';
import { useAuth } from '@/contexts/AuthContext';
import { Notebook, Source } from '@/types/notebook';
import toast from 'react-hot-toast';

const NB_BG_IMAGES = [
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600',
];

const NotebookDashboard = () => {
  const t = useTranslations('notebook');
  const { user } = useAuth();
  const [recentNotebooks, setRecentNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notebookIdToDelete, setNotebookIdToDelete] = useState<string | null>(null);

  const fetchNotebooks = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await NotebookControllerService.getUserNotebooks(user.id);

      const mapped: Notebook[] = response.map(nb => {
        let metadata = { chatHistory: [], studioActivities: [] };
        try {
          if (nb.metadata) metadata = JSON.parse(nb.metadata);
        } catch { /* ignore */ }
        return {
          id: nb.id || '',
          title: nb.title || 'Untitled',
          sources: [],
          chatHistory: metadata.chatHistory || [],
          studioActivities: metadata.studioActivities || [],
          updatedAt: nb.updatedAt || nb.createdAt || new Date().toISOString()
        };
      });

      setRecentNotebooks(mapped);

      const notebooksWithSources = await Promise.all(
        mapped.map(async (nb) => {
          try {
            const apiSources = await NotebookControllerService.getNotebookSources(nb.id);
            const mappedSources: Source[] = apiSources.map(as => ({
              id: as.id || crypto.randomUUID(),
              name: as.name || 'Unknown',
              type: as.type || 'pdf',
              selected: true
            }));
            return { ...nb, sources: mappedSources };
          } catch {
            return nb;
          }
        })
      );

      setRecentNotebooks(notebooksWithSources);
    } catch (error) {
      console.error('Failed to fetch notebooks:', error);
      toast.error('Erreur lors du chargement des notebooks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, [user?.id]);

  const filteredNotebooks = useMemo(
    () => recentNotebooks.filter(nb =>
      nb.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [recentNotebooks, searchQuery]
  );

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setNotebookIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!notebookIdToDelete) return;
    try {
      await NotebookControllerService.deleteNotebook(notebookIdToDelete);
      toast.success('Notebook supprimé');
      setRecentNotebooks(prev => prev.filter(nb => nb.id !== notebookIdToDelete));
      setIsDeleteModalOpen(false);
      setNotebookIdToDelete(null);
    } catch (error) {
      console.error('Failed to delete notebook:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">

      {/* ── Hero Header ─────────────────────────────────── */}
      <div className="relative overflow-hidden pt-24 pb-14 px-6">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 w-80 h-80 bg-indigo-400/15 dark:bg-indigo-600/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full text-xs font-bold mb-4 shadow-sm">
                <MdAutoStories className="w-3.5 h-3.5" />
                <span>{t('title')}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                {t('myNotebooks')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-3 text-base max-w-md">
                {t('getStartedDesc')}
              </p>
            </div>

            {/* Stats pills */}
            {!loading && (
              <div className="flex gap-3 flex-wrap">
                <div className="bg-white dark:bg-gray-800 shadow-sm border border-purple-100 dark:border-purple-800/50 rounded-2xl px-5 py-3 text-center min-w-[90px]">
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{recentNotebooks.length}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{t('recent')}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-sm border border-purple-100 dark:border-purple-800/50 rounded-2xl px-5 py-3 text-center min-w-[90px]">
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {recentNotebooks.reduce((acc, nb) => acc + nb.sources.length, 0)}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{t('addSource')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-10">
          <div className="relative flex-1 max-w-xs">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search')}
              className="w-full pl-10 pr-4 py-2.5 border border-purple-200 dark:border-purple-800/50 rounded-full bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none text-sm shadow-sm"
            />
          </div>
          <Link href="/notebook/new">
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all">
              <FaPlus className="w-3 h-3" />
              <span>{t('create')}</span>
            </button>
          </Link>
        </div>

        {/* ── Notebooks Grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {/* Create New Card */}
          <Link href="/notebook/new" className="group block">
            <div className="relative h-60 rounded-2xl overflow-hidden border-2 border-dashed border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-md">
                <FaPlus className="w-6 h-6" />
              </div>
              <p className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">{t('create')}</p>
            </div>
          </Link>

          {/* Loading skeletons */}
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-60 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}

          {/* Notebook cards with photo backgrounds */}
          {!loading && filteredNotebooks.map((nb, i) => (
            <Link key={nb.id} href={`/notebook/${nb.id}`} className="group block">
              <div className="relative h-60 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer">

                {/* Background photo */}
                <Image
                  src={NB_BG_IMAGES[i % NB_BG_IMAGES.length]}
                  alt={nb.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Purple tint on hover */}
                <div className="absolute inset-0 bg-purple-900/0 group-hover:bg-purple-900/20 transition-colors duration-300" />

                {/* Delete button */}
                <button
                  onClick={(e) => confirmDelete(e, nb.id)}
                  className="absolute top-3 right-3 p-2 bg-black/30 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/80 active:scale-95"
                  title={t('delete')}
                >
                  <FaTrashAlt className="w-3 h-3 text-white" />
                </button>

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-purple-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <FaBook className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[11px] text-purple-300 font-semibold">
                      {t('sourceCount', { count: nb.sources.length })}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 mb-1.5">
                    {nb.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {new Date(nb.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {/* Empty state when search has no results */}
          {!loading && searchQuery && filteredNotebooks.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center text-center text-gray-400">
              <FaSearch className="w-8 h-8 mb-4 opacity-40" />
              <p className="font-bold text-gray-600 dark:text-gray-300">Aucun notebook trouvé</p>
              <p className="text-sm mt-1">Essayez un autre terme de recherche</p>
            </div>
          )}

        </div>
      </div>

      {/* ── Delete Modal ────────────────────────────────── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-purple-100 dark:border-purple-800/50 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-inner ring-4 ring-red-50 dark:ring-red-900/10">
                <FaRegTrashAlt className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">{t('deleteConfirmTitle')}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">{t('deleteConfirmDesc')}</p>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleExecuteDelete}
                  className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-red-500/30 active:scale-[0.98]"
                >
                  {t('deleteConfirmYes')}
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-[0.98]"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotebookDashboard;
