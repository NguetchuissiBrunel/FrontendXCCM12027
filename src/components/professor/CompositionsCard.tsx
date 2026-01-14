import { Trash2, Edit, Layout, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmModal from '../ui/ConfirmModal';

export interface Composition {
  id: string;
  title: string;
  class: string;
  participants: number;
  likes: number;
  downloads: number;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

interface CompositionsCardProps {
  compositions: Composition[];
  onDelete: (id: string) => void;
  onCreateClick?: () => void;
}

export default function CompositionsCard({ compositions, onDelete, onCreateClick }: CompositionsCardProps) {
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.id) {
      onDelete(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Supprimer la composition"
        message="Voulez-vous vraiment supprimer ce cours ? Cette action est irréversible."
        confirmText="Supprimer"
        type="danger"
      />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400">Mes Compositions</h2>
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold shadow-lg hover:bg-purple-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Créer un cours</span>
            <span className="sm:hidden">Créer</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {compositions.map((composition) => (
          <div
            key={composition.id}
            className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border border-purple-200 dark:border-purple-900/30"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {composition.title}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${composition.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}
                  >
                    {composition.status === 'PUBLISHED' ? (
                      <><CheckCircle size={12} /> Publié</>
                    ) : (
                      <><Clock size={12} /> Brouillon</>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Layout size={14} className="text-purple-500" />
                    <span className="font-semibold text-gray-500">Classe:</span> {composition.class}
                  </span>
                  <span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{composition.participants}</span> participants
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDeleteClick(composition.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                  title="Supprimer le cours"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
