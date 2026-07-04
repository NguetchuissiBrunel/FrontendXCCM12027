'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Loader2 } from 'lucide-react';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { Course } from '@/types/editor.types';
import StructureDeCours from './StructureDeCours';

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
    onClose?: () => void;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
    courseTitle,
    courseDescription,
    courseContent,
    onClose,
}) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

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
            setHasFetched(true);
        }
    };

    // Auto-fetch on title/description/content change (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRecommendations();
        }, 3000);
        return () => clearTimeout(timer);
    }, [courseTitle, courseDescription, courseContent]);

    // Mapping Recommendation -> Course : on réutilise EXACTEMENT le rendu du panneau
    // "Importer des connaissances" (drag & drop + décomposition en granules via XCSM,
    // toast si XCSM indisponible). sections:[] => clic = décomposition à la demande.
    const mappedCourses: Course[] = recommendations.map((rec) => ({
        id: rec.id,
        title: rec.title,
        category: rec.description || 'Recommandé',
        image: '/images/courses/default.jpg',
        views: 0,
        likes: 0,
        downloads: 0,
        author: { name: 'Bibliothèque XCCM', image: '/images/blog/author-01.png' },
        conclusion: '',
        learningObjectives: [],
        sections: [],
    }));

    // Badge de similarité par cours (score fourni par l'IA sinon 85% par défaut).
    const similarityById: Record<number, number> = {};
    recommendations.forEach((rec) => {
        const score = rec.metadata?.similarity ?? rec.metadata?.score;
        similarityById[rec.id] = typeof score === 'number'
            ? Math.round(score <= 1 ? score * 100 : score)
            : 85;
    });

    // Pendant le tout premier chargement : skeleton dédié (feedback de loading).
    if (isLoading && !hasFetched) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-purple-50 dark:bg-purple-900/20">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <h2 className="text-sm font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider">Recommandations IA</h2>
                    </div>
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-lg border border-gray-100 dark:border-gray-700 p-3 bg-gray-50/50 dark:bg-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Aucune recommandation : état vide informatif.
    if (hasFetched && recommendations.length === 0) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-purple-50 dark:bg-purple-900/20">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <h2 className="text-sm font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider">Recommandations IA</h2>
                    </div>
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-purple-600" />}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 p-6 opacity-50">
                    <Search className="h-8 w-8 text-gray-400" />
                    <p className="text-xs text-gray-500">Modifiez le titre ou la description pour voir des recommandations basées sur votre contenu actuel.</p>
                </div>
            </div>
        );
    }

    // Recommandations disponibles : rendu identique à "Importer des connaissances"
    // (drag & drop + décomposition en granules), enrichi du badge de similarité.
    return (
        <StructureDeCours
            onClose={() => onClose?.()}
            externalCourses={mappedCourses}
            similarityById={similarityById}
            title="Recommandations IA"
        />
    );
};

export default RecommendationsPanel;
