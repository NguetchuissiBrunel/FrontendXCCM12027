// components/professor/CompositionsCard.tsx
import { Heart, Download, MoreVertical } from 'lucide-react';

interface Composition {
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
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">Mes Compositions</h2>
      
      <div className="space-y-4">
        {compositions.map((composition) => (
          <div 
            key={composition.id}
            className="bg-purple-50 rounded-xl p-6 hover:bg-purple-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {composition.title}
                </h3>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>
                    <span className="font-semibold">Classe:</span> {composition.class}
                  </span>
                  <span>
                    <span className="font-semibold">{composition.participants}</span> participants
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-purple-600">
                  <Heart size={20} fill="currentColor" />
                  <span className="font-semibold">{composition.likes} j'aime</span>
                </div>
                
                <div className="flex items-center gap-2 text-purple-600">
                  <Download size={20} />
                  <span className="font-semibold">{composition.downloads} téléchargements</span>
                </div>

                <button className="p-2 hover:bg-purple-200 rounded-lg transition-colors">
                  <MoreVertical size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
