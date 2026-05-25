'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Book, Search, Loader2 } from 'lucide-react';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { toast } from 'react-hot-toast';

interface Recommendation {
    id: number;
    title: string;
    description: string;
    metadata?: any;
}

interface RecommendationsPanelProps {
    courseTitle: string;
    courseDescription: string;
    courseContent?: string;
    onImportCourse: (courseId: number) => void;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ 
    courseTitle, 
    courseDescription,
    courseContent,
    onImportCourse 
}) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRecommendations = async () => {
        if (!courseTitle || courseTitle === "Nouveau cours") return;
        
        setIsLoading(true);
        try {
            const response = await CourseControllerService.getRecommendations({
                title: courseTitle, 
                description: courseDescription,
                content: courseContent
            });
            const data = (response as any).data || response;
            setRecommendations(data || []);
        } catch (error) {
            console.error("Failed to fetch recommendations:", error);
            // Silent fail to not disturb user
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch on title/description/content change (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRecommendations();
        }, 3000);
        return () => clearTimeout(timer);
    }, [courseTitle, courseDescription, courseContent]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-sm font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider">Recommandations IA</h2>
                </div>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-purple-600" />}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {recommendations.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center space-y-2 opacity-50">
                        <Search className="h-8 w-8 text-gray-400" />
                        <p className="text-xs text-gray-500">Modifiez le titre ou la description pour voir des recommandations basées sur votre contenu actuel.</p>
                    </div>
                ) : (
                    recommendations.map((rec) => (
                        <div 
                            key={rec.id}
                            className="group relative bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 transition-all cursor-pointer hover:shadow-md"
                            onClick={() => onImportCourse(rec.id)}
                        >
                            <div className="flex items-start gap-3">
                                <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                                    <Book size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{rec.title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 italic">
                                        {rec.description || "Aucune description disponible"}
                                    </p>
                                </div>
                                <ArrowRight size={14} className="text-gray-400 group-hover:text-purple-500 transition-colors mt-1" />
                            </div>
                            
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-tighter">
                                    Similaire à 85%
                                </span>
                                <button className="text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded transition-colors uppercase">
                                    Importer
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                    L'IA analyse votre travail en temps réel pour suggérer des ressources pertinentes de la bibliothèque XCCM.
                </p>
            </div>
        </div>
    );
};
