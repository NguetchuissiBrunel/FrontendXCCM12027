// hooks/useCourses.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { CourseControllerService } from '@/lib';

export interface Course {
    id: number;
    title: string;
    category: string;
    description?: string;
    image?: string;
    views?: number;
    likes?: number;
    downloads?: number;
    author?: {
        name: string;
        image?: string;
    };
    conclusion?: string;
    learningObjectives?: string[];
    sections?: unknown[];
    [key: string]: unknown;
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

            console.log('📚 Chargement des cours depuis l\'API...');

            const response = await CourseControllerService.getEnrichedCourses();

            if (response && Array.isArray(response)) {
                setCourses(response as Course[]);
                console.log(`✅ ${response.length} cours chargés`);
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
            console.log(`📖 Chargement du cours ${courseId}...`);

            const response = await CourseControllerService.getEnrichedCourse(courseId);

            if (response) {
                console.log(`✅ Cours ${courseId} chargé`);
                return response as Course;
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

                console.log(`📖 Chargement du cours ${courseId}...`);

                const response = await CourseControllerService.getEnrichedCourse(courseId);

                if (response) {
                    setCourse(response as Course);
                    console.log(`✅ Cours ${courseId} chargé`);
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
