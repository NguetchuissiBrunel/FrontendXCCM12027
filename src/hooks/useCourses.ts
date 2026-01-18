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

    const { isAuthenticated, loading: authLoading } = useAuth();
    const { incrementLike: globalIncrementLike, incrementDownload: globalIncrementDownload } = useCourses();

    useEffect(() => {
        if (authLoading) return;
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
                    const fullCourse = allResponse?.data?.find((c: any) => String(c.id) === String(courseId));

                    setCourse({
                        ...enrichedData,
                        content: fullCourse?.content || enrichedData.content,
                        viewCount: fullCourse?.viewCount ?? enrichedData.viewCount ?? 0,
                        likeCount: fullCourse?.likeCount ?? enrichedData.likeCount ?? 0,
                        downloadCount: fullCourse?.downloadCount ?? enrichedData.downloadCount ?? 0,
                    } as Course);
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
                // On pourrait aussi mettre à jour l'état local ici si on veut voir +1 immédiatement
                setCourse(prev => prev ? { ...prev, viewCount: (prev.viewCount || 0) + 1 } : prev);
            } catch (err) {
                console.error(`❌ Erreur lors de l'incrémentation des vues pour le cours ${courseId}:`, err);
            }
        };

        if (courseId) {
            loadCourse();
            incrementView();
        }
    }, [courseId, authLoading, isAuthenticated]);

    const incrementLike = async (id: number) => {
        try {
            // Optimistic update locally
            setCourse(prev => prev && String(prev.id) === String(id)
                ? { ...prev, likeCount: (prev.likeCount || 0) + 1 }
                : prev
            );
            await globalIncrementLike(id);
        } catch (err) {
            console.error("Error incrementing like:", err);
        }
    };

    const incrementDownload = async (id: number) => {
        try {
            // Optimistic update locally
            setCourse(prev => prev && String(prev.id) === String(id)
                ? { ...prev, downloadCount: (prev.downloadCount || 0) + 1 }
                : prev
            );
            await globalIncrementDownload(id);
        } catch (err) {
            console.error("Error incrementing download:", err);
        }
    };

    return {
        course,
        loading: loading || authLoading,
        error,
        incrementLike,
        incrementDownload
    };
}
