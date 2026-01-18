// hooks/useCourses.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { CourseControllerService } from '@/lib';

export interface Course {
    image: any;
    id: number;
    title: string;
    category: string;
    description?: string;
    status: string;
    createdAt: string;
    // Updated to match your JSON
    author?: {
        id: string;
        name: string;
        email: string;
        university?: string;
        photoUrl?: string;
        image?: string;
        designation?: string;
    };
    content?: string;
    coverImage?: string | null;
    photoUrl?: string | null;
    viewCount?: number;
    likeCount?: number;
    downloadCount?: number;
}

interface UseCoursesReturn {
    courses: Course[];
    loading: boolean;
    error: string | null;
    fetchAllCourses: () => Promise<void>;
    fetchCourse: (courseId: number) => Promise<Course | null>;
    refetch: () => Promise<void>;
    incrementView: (courseId: number) => Promise<void>;
    incrementLike: (courseId: number) => Promise<void>;
    incrementDownload: (courseId: number) => Promise<void>;
}

/**
 * Hook personnalisé pour gérer les cours depuis l'API
 */
export function useCourses(): UseCoursesReturn {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Récupère tous les cours enrichis depuis l'API
     */
    const fetchAllCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // This is usually a 'BaseResponse' type from your generated API client
            const response: any = await CourseControllerService.getAllCourses();

            // Check if response.data exists and is an array
            if (response && response.success && Array.isArray(response.data)) {
                setCourses(response.data as Course[]);
                console.log(`✅ ${response.data.length} cours chargés`);
            } else {
                console.warn('⚠️ Format de réponse inattendu:', response);
                setCourses([]);
            }
        } catch (err) {
            console.error('❌ Erreur lors du chargement des cours:', err);
            setError(err instanceof Error ? err.message : 'Impossible de charger les cours');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Récupère un cours spécifique par son ID
     */
    const fetchCourse = useCallback(async (courseId: number): Promise<Course | null> => {
        try {
            const response: any = await CourseControllerService.getEnrichedCourse(courseId);

            if (response && response.success && response.data) {
                return response.data as Course;
            }

            return null;
        } catch (err) {
            console.error(`❌ Erreur lors du chargement du cours ${courseId}:`, err);
            throw err;
        }
    }, []);

    /**
     * Incrémente le compteur de vues d'un cours
     */
    const incrementView = useCallback(async (courseId: number) => {
        try {
            // Optimistic update
            setCourses(prev => prev.map(course =>
                course.id === courseId
                    ? { ...course, viewCount: (course.viewCount || 0) + 1 }
                    : course
            ));

            await CourseControllerService.incrementViewCount(courseId);
        } catch (err) {
            console.error(`❌ Erreur lors de l'incrémentation des vues pour le cours ${courseId}:`, err);
            // Revert optimistic update on error
            await fetchAllCourses();
        }
    }, [fetchAllCourses]);

    /**
     * Incrémente le compteur de likes d'un cours
     */
    const incrementLike = useCallback(async (courseId: number) => {
        try {
            // Optimistic update
            setCourses(prev => prev.map(course =>
                course.id === courseId
                    ? { ...course, likeCount: (course.likeCount || 0) + 1 }
                    : course
            ));

            await CourseControllerService.incrementLikeCount(courseId);
        } catch (err) {
            console.error(`❌ Erreur lors de l'incrémentation des likes pour le cours ${courseId}:`, err);
            // Revert optimistic update on error
            await fetchAllCourses();
            throw err;
        }
    }, [fetchAllCourses]);

    /**
     * Incrémente le compteur de téléchargements d'un cours
     */
    const incrementDownload = useCallback(async (courseId: number) => {
        try {
            // Optimistic update
            setCourses(prev => prev.map(course =>
                course.id === courseId
                    ? { ...course, downloadCount: (course.downloadCount || 0) + 1 }
                    : course
            ));

            await CourseControllerService.incrementDownloadCount(courseId);
        } catch (err) {
            console.error(`❌ Erreur lors de l'incrémentation des téléchargements pour le cours ${courseId}:`, err);
            // Revert optimistic update on error
            await fetchAllCourses();
            throw err;
        }
    }, [fetchAllCourses]);

    /**
     * Recharge tous les cours
     */
    const refetch = useCallback(async () => {
        await fetchAllCourses();
    }, [fetchAllCourses]);

    // Charger les cours au montage du composant
    useEffect(() => {
        fetchAllCourses();
    }, [fetchAllCourses]);

    return {
        courses,
        loading,
        error,
        fetchAllCourses,
        fetchCourse,
        refetch,
        incrementView,
        incrementLike,
        incrementDownload,
    };
}

import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook pour récupérer un cours spécifique et incrémenter le nombre de vues
 */
export function useCourse(courseId: number) {
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Attendre que l'authentification soit initialisée
    const { isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        // Si l'auth est encore en cours de chargement, on attend
        if (authLoading) return;

        // Si l'utilisateur n'est pas authentifié, on ne fait pas d'appel API pour éviter l'erreur Forbidden
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const loadCourse = async () => {
            try {
                setLoading(true);
                setError(null);

                const enrichedResponse: any = await CourseControllerService.getEnrichedCourse(courseId);
                const allResponse: any = await CourseControllerService.getAllCourses();

                if (enrichedResponse && enrichedResponse.success && enrichedResponse.data) {
                    const enrichedData = enrichedResponse.data;

                    // Find the course in the full list to get the content
                    // (The enriched endpoint doesn't seem to return the content body)
                    const fullCourse = allResponse?.data?.find((c: any) => c.id === courseId);

                    setCourse({
                        ...enrichedData,
                        content: fullCourse?.content || enrichedData.content
                    } as Course);
                } else {
                    console.warn('⚠️ Échec du chargement du cours:', enrichedResponse);
                }
            } catch (err) {
                console.error(`❌ Erreur lors du chargement du cours ${courseId}:`, err);
                setError(err instanceof Error ? err.message : 'Impossible de charger le cours');
            } finally {
                setLoading(false);
            }
        };

        const incrementView = async () => {
            try {
                await CourseControllerService.incrementViewCount(courseId);
            } catch (err) {
                console.error(`❌ Erreur lors de l'incrémentation des vues pour le cours ${courseId}:`, err);
            }
        };

        if (courseId) {
            loadCourse();
            incrementView();
        }
    }, [courseId, authLoading, isAuthenticated]);

    return { course, loading: loading || authLoading, error };
}
