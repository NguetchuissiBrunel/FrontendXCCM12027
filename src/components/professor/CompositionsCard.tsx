'use client';
import { Trash2, Layout, CheckCircle, Clock, BookOpen, Archive, LockKeyhole, UnlockKeyhole, Pencil, School, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal from '../ui/ConfirmModal';

export interface Composition {
  id: string;
  title: string;
  class: string;
  participants: number;
  likes: number;
  downloads: number;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'OPEN' | 'CLOSED';
  // optional aggregated stats (may come from server or be fetched lazily)
  courseStats?: {
    totalExercises?: number;
    totalEnrolled?: number;
  };
}

type ClassStatus = 'OPEN' | 'CLOSED' | 'ARCHIVED';

interface CompositionsCardProps {
  compositions: Composition[];
  onDelete: (id: string) => void;
  onCreateClick?: () => void;
  onManageExercises?: (courseId: string) => void;
  getCourseStats?: (id: string) => { totalExercises?: number; totalEnrolled?: number } | undefined;
  onManageClassCourses?: (classId: string) => void;
  onAssignToClass?: (courseId: string) => void;
  onChangeStatus?: (classId: string, status: ClassStatus) => Promise<void>;
  onEdit?: (id: string) => void;
  onViewComments?: (courseId: string) => void;
  title?: string;
}

function StatusBadge({ status }: { status?: string }) {
  if (status === 'OPEN' || status === 'PUBLISHED') {
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
        <UnlockKeyhole size={12} /> Ouverte
      </span>
    );
  }
  if (status === 'CLOSED') {
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
        <LockKeyhole size={12} /> Fermée
      </span>
    );
  }
  if (status === 'ARCHIVED') {
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
        <Archive size={12} /> Archivée
      </span>
    );
  }
  return (
    <span className="px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
      <Clock size={12} /> Brouillon
    </span>
  );
}

export default function CompositionsCard({
  compositions,
  onDelete,
  onCreateClick,
  onManageExercises,
  getCourseStats,
  onManageClassCourses,
  onAssignToClass,
  onChangeStatus,
  onEdit,
  onViewComments,
  title,
}: CompositionsCardProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.id) {
      onDelete(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handleStatusChange = async (classId: string, newStatus: ClassStatus) => {
    if (!onChangeStatus) return;
    setStatusLoading(classId);
    try {
      await onChangeStatus(classId, newStatus);
    } finally {
      setStatusLoading(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Supprimer la classe"
        message="Voulez-vous vraiment supprimer cette classe de cours ? Cette action est irréversible."
        confirmText="Supprimer"
        type="danger"
      />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400">{title || 'Mes Classes de cours'}</h2>
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold shadow-lg hover:bg-purple-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Créer {title?.toLowerCase().includes('composition') || title?.toLowerCase().includes('cours') ? 'un cours' : 'une classe'}</span>
            <span className="sm:hidden">Créer</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {compositions.map((composition) => (
          <div
            key={composition.id}
            className={`rounded-xl p-6 transition-colors border ${composition.status === 'ARCHIVED'
              ? 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700 opacity-70'
              : 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-900/30'
              }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {composition.title}
                  </h3>
                  <StatusBadge status={composition.status} />
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Layout size={14} className="text-purple-500" />
                    <span className="font-semibold text-gray-500">{title?.toLowerCase().includes('composition') || title?.toLowerCase().includes('cours') ? 'Catégorie:' : 'Thème:'}</span> {composition.class}
                  </span>
                  <span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{composition.participants}</span> participants
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Selector */}
                {onChangeStatus && (
                  <div className="relative">
                    <select
                      value={
                        composition.status === 'OPEN' || composition.status === 'PUBLISHED'
                          ? 'OPEN'
                          : composition.status === 'CLOSED'
                            ? 'CLOSED'
                            : composition.status === 'ARCHIVED'
                              ? 'ARCHIVED'
                              : 'OPEN'
                      }
                      disabled={statusLoading === composition.id}
                      onChange={(e) => handleStatusChange(composition.id, e.target.value as ClassStatus)}
                      className="text-xs font-semibold rounded-lg border border-purple-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 pl-3 pr-8 appearance-none cursor-pointer hover:border-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                    >
                      <option value="OPEN">🟢 Ouverte</option>
                      <option value="CLOSED">🔴 Fermée</option>
                      <option value="ARCHIVED">⚫ Archivée</option>
                    </select>
                    {statusLoading === composition.id && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                      </div>
                    )}
                  </div>
                )}

                {onManageClassCourses && (
                  <button
                    onClick={() => onManageClassCourses(composition.id)}
                    className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                    title="Gérer les cours"
                  >
                    <BookOpen size={20} />
                  </button>
                )}
                {onAssignToClass && (
                  <button
                    onClick={() => onAssignToClass(composition.id)}
                    className="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                    title="Affecter à une classe"
                  >
                    <School size={20} />
                  </button>
                )}
                {onViewComments && (
                  <button
                    onClick={() => onViewComments(composition.id)}
                    className="p-2 text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-lg transition-colors border border-transparent hover:border-teal-200 dark:hover:border-teal-800"
                    title="Voir les commentaires des participants"
                  >
                    <MessageCircle size={20} />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(composition.id)}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                    title={title?.toLowerCase().includes('composition') || title?.toLowerCase().includes('cours') ? "Modifier le cours" : "Modifier la classe"}
                  >
                    <Pencil size={20} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteClick(composition.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                  title={title?.toLowerCase().includes('composition') || title?.toLowerCase().includes('cours') ? "Supprimer le cours" : "Supprimer la classe"}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section d'actions globales */}
      {compositions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total : {compositions.length} {title?.toLowerCase().includes('composition') || title?.toLowerCase().includes('cours') ? 'cours' : 'classes'} • {
                compositions.reduce((total, comp) => {
                  const stats = comp.courseStats || (getCourseStats ? getCourseStats(comp.id) : undefined);
                  return total + (stats?.totalExercises || 0);
                }, 0)
              } exercices • {
                compositions.reduce((total, comp) => {
                  const stats = comp.courseStats || (getCourseStats ? getCourseStats(comp.id) : undefined);
                  return total + (stats?.totalEnrolled ?? comp.participants);
                }, 0)
              } étudiants
            </div>
          </div>
        </div>
      )}
    </div>
  );
}