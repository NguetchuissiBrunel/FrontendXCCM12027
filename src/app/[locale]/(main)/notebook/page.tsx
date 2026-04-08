'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FaPlus, FaEllipsisV, FaGlobe, FaSearch, FaThLarge, FaList, FaBook, FaTrashAlt, FaRegTrashAlt, FaExclamationTriangle } from 'react-icons/fa';
import { MdOutlineSettings } from 'react-icons/md';
import Image from 'next/image';
import { getAllNotebooks, deleteNotebook } from '@/lib/notebook-storage';
import { Notebook } from '@/types/notebook';

const NotebookDashboard = () => {
  const t = useTranslations('notebook');
  const [recentNotebooks, setRecentNotebooks] = useState<Notebook[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notebookIdToDelete, setNotebookIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    setRecentNotebooks(getAllNotebooks());
  }, []);

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setNotebookIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = () => {
    if (notebookIdToDelete) {
      deleteNotebook(notebookIdToDelete);
      setRecentNotebooks(getAllNotebooks());
      setIsDeleteModalOpen(false);
      setNotebookIdToDelete(null);
    }
  };

  const selectionNotebooks = [
    {
      id: 1,
      title: "William Shakespeare : L'œuvre et l'héritage",
      subtitle: "Art et culture",
      date: "26 avr. 2025",
      sources: 45,
      image: "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 2,
      title: "Tendances en termes de santé, bien-être et technologie",
      subtitle: "Our World in Data",
      date: "15 avr. 2025",
      sources: 24,
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 3,
      title: "Vos yeux peuvent-ils expliquer votre personnalité ?",
      subtitle: "Google Research",
      date: "3 juil. 2025",
      sources: 14,
      image: "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=400",

    },
    {
      id: 4,
      title: "L'œuvre scientifique de Google Arts & Culture",
      subtitle: "The Royal Society with Google Arts & Culture",
      date: "30 sept. 2025",
      sources: 38,
      image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400",
    },
  ];



  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('search')}
              className="pl-10 pr-4 py-2.5 border border-purple-200 dark:border-purple-800/50 rounded-full bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none w-64 shadow-sm"
            />
          </div>

          <Link href="/notebook/new">
            <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-all active:scale-95">
              <FaPlus className="w-3.5 h-3.5" />
              <span>{t('create')}</span>
            </button>
          </Link>
        </div>

        {/* Curation Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold dark:text-white">{t('selection')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {selectionNotebooks.map((nb) => (
              <div key={nb.id} className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-8 border-purple-100 dark:border-purple-900/30 overflow-hidden">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image src={nb.image} alt={nb.title} fill className="object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider opacity-90 mb-1.5">
                      <FaGlobe className="w-3 h-3 text-purple-400" />
                      <span>{nb.subtitle}</span>
                    </div>
                    <h3 className="font-bold text-base leading-tight line-clamp-2">{nb.title}</h3>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                  <span>{nb.date} • {nb.sources} sources</span>
                  <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                    <FaGlobe className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold dark:text-white">{t('recent')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Create New Card */}
            <Link href="/notebook/new" className="block h-52">
              <div className="bg-white dark:bg-gray-900 border-2 border-dashed border-purple-200 dark:border-purple-800/50 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all h-full shadow-sm group">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  <FaPlus className="w-6 h-6" />
                </div>
                <p className="font-bold text-gray-800 dark:text-gray-200">{t('create')}</p>
              </div>
            </Link>

            {/* Dynamic Recent Notebooks */}
            {recentNotebooks.map((nb) => (
              <Link key={nb.id} href={`/notebook/${nb.id}`} className="block h-52 group">
                <div className="bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-800/50 rounded-2xl p-5 cursor-pointer hover:shadow-xl transition-all h-full shadow-sm relative flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center shadow-md">
                        <FaBook className="w-5 h-5" />
                      </div>
                      <button
                        onClick={(e) => confirmDelete(e, nb.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all transform hover:scale-110 active:scale-95"
                        title={t('delete')}
                      >
                        <FaTrashAlt className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 line-clamp-2 mb-1">{nb.title}</h3>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      {new Date(nb.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-1.5 pt-2">
                      {[1, 2, 3].slice(0, Math.min(nb.sources.length, 3)).map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-[8px] font-bold text-purple-600">
                          {nb.sources[i]?.name[0] || 'S'}
                        </div>
                      ))}
                      {nb.sources.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-600">
                          +{nb.sources.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 pt-2">{t('sourceCount', { count: nb.sources.length })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-purple-100 dark:border-purple-800/50 transform animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-inner ring-4 ring-red-50 dark:ring-red-900/10">
                <FaRegTrashAlt className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">Supprimer le notebook ?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                Cette action est irréversible. Toutes les sources et conversations associées seront définitivement perdues.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleExecuteDelete}
                  className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-red-500/30 active:scale-[0.98]"
                >
                  Oui, supprimer
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-[0.98]"
                >
                  Annuler
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
