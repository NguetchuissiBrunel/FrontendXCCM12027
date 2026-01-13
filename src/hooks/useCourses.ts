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
        firstName: string;
        lastName: string;
        email: string;
        university?: string;
        photoUrl?: string;
        image?: string;
        designation?: string;
    };
    content?: string;
    coverImage?: string | null;
    views?: number;
    likes?: number;
    downloads?: number;
}

interface UseCoursesReturn {
    courses: Course[];
    loading: boolean;
    error: string | null;
    fetchAllCourses: () => Promise<void>;
    fetchCourse: (courseId: number) => Promise<Course | null>;
    refetch: () => Promise<void>;
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
    };
}

/**
 * Hook pour récupérer un cours spécifique
 */
export function useCourse(courseId: number) {
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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

        if (courseId) {
            loadCourse();
        }
    }, [courseId]);

    return { course, loading, error };
}
