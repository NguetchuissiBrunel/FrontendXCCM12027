// components/professor/CompositionsCard.tsx
import { Heart, Download, MoreVertical } from 'lucide-react';

export interface Composition {
  id: string;
  title: string;
  class: string;
  participants: number;
  likes: number;
  downloads: number;
}

interface CompositionsCardProps {
  compositions: Composition[];
}

export default function CompositionsCard({ compositions }: CompositionsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-6">Mes Compositions</h2>

      <div className="space-y-4">
        {compositions.map((composition) => (
          <div
            key={composition.id}
            className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border border-purple-200 dark:border-purple-900/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {composition.title}
                </h3>
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    <span className="font-semibold">Classe:</span> {composition.class}
                  </span>
                  <span>
                    <span className="font-semibold">{composition.participants}</span> participants
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Heart size={20} fill="currentColor" />
                  <span className="font-semibold">{composition.likes} j'aime</span>
                </div>

                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Download size={20} />
                  <span className="font-semibold">{composition.downloads} téléchargements</span>
                </div>

                <button className="p-2 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg transition-colors">
                  <MoreVertical size={20} className="text-gray-400 dark:text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
