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
    isLiked?: boolean;
}

interface UseCoursesReturn {
    courses: Course[];
    loading: boolean;
    error: string | null;
    fetchAllCourses: () => Promise<void>;
    fetchCourse: (courseId: number) => Promise<Course | null>;
    refetch: () => Promise<void>;
    incrementView: (courseId: number) => Promise<void>;
    toggleLike: (courseId: number) => Promise<void>;
    incrementLike: (courseId: number) => Promise<void>;
    decrementLike: (courseId: number) => Promise<void>;
    incrementDownload: (courseId: number) => Promise<void>;
    isLiked: (courseId: number) => boolean; // Ajoute cette ligne
}

/**
 * Hook personnalisé pour gérer les cours depuis l'API
 */
export function useCourses(): UseCoursesReturn {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [localLikes, setLocalLikes] = useState<Set<number>>(new Set());

    // Charger les likes depuis localStorage au démarrage
    useEffect(() => {
        const savedLikes = localStorage.getItem('likedCourses');
        if (savedLikes) {
            try {
                const likedIds = JSON.parse(savedLikes) as number[];
                setLocalLikes(new Set(likedIds));
            } catch (error) {
                console.error('Erreur lors du chargement des likes:', error);
            }
        }
    }, []);

    // Sauvegarder les likes dans localStorage
    const saveLikes = useCallback((likes: Set<number>) => {
        localStorage.setItem('likedCourses', JSON.stringify(Array.from(likes)));
    }, []);

    // Vérifier si un cours est liké localement
    const isLiked = useCallback((courseId: number): boolean => {
        return localLikes.has(courseId);
    }, [localLikes]);

    /**
     * Récupère tous les cours enrichis depuis l'API
     */
    const fetchAllCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response: any = await CourseControllerService.getAllCourses();

            if (response && response.success && Array.isArray(response.data)) {
                const coursesData = response.data as Course[];
                
                // Ajouter l'état isLiked depuis localStorage
                const coursesWithLikes = coursesData.map(course => ({
                    ...course,
                    isLiked: isLiked(course.id)
                }));
                
                setCourses(coursesWithLikes);
                console.log(`✅ ${coursesData.length} cours chargés`);
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
    }, [isLiked]);

    /**
     * Toggle like/unlike pour un cours (fonction wrapper)
     */
    const toggleLike = useCallback(async (courseId: number) => {
        const currentlyLiked = isLiked(courseId);
        
        if (currentlyLiked) {
            await decrementLike(courseId);
        } else {
            await incrementLike(courseId);
        }
    }, [isLiked]);

    /**
     * Incrémente le compteur de likes d'un cours AVEC localStorage
     */
    const incrementLike = useCallback(async (courseId: number) => {
        try {
            // Mise à jour du localStorage
            setLocalLikes(prev => {
                const newSet = new Set(prev);
                newSet.add(courseId);
                saveLikes(newSet);
                return newSet;
            });

            // Optimistic update de l'UI
            setCourses(prev => prev.map(course =>
                course.id === courseId
                    ? { 
                        ...course, 
                        likeCount: (course.likeCount || 0) + 1,
                        isLiked: true  // Ajoute cette ligne
                    }
                    : course
            ));

            await CourseControllerService.incrementLikeCount(courseId);
        } catch (err) {
            console.error(`❌ Erreur lors de l'incrémentation des likes pour le cours ${courseId}:`, err);
            
            // Rollback du localStorage en cas d'erreur
            setLocalLikes(prev => {
                const newSet = new Set(prev);
                newSet.delete(courseId);
                saveLikes(newSet);
                return newSet;
            });
            
            // Rollback de l'UI
            setCourses(prev => prev.map(course =>
                course.id === courseId
                    ? { 
                        ...course, 
                        likeCount: Math.max(0, (course.likeCount || 0) - 1),
                        isLiked: false
                    }
                    : course
            ));
            
            await fetchAllCourses();
            throw err;
        }
    }, [fetchAllCourses, saveLikes]);

    /**
     * Décrémente le compteur de likes d'un cours AVEC localStorage
     */
    const decrementLike = useCallback(async (courseId: number) => {
        try {
            // Mise à jour du localStorage
            setLocalLikes(prev => {
                const newSet = new Set(prev);
                newSet.delete(courseId);
                saveLikes(newSet);
                return newSet;
            });

            // Optimistic update de l'UI
            setCourses(prev => prev.map(course =>
                course.id === courseId
                    ? { 
                        ...course, 
                        likeCount: Math.max(0, (course.likeCount || 0) - 1),
                        isLiked: false  // Ajoute cette ligne
                    }
                    : course
            ));

            await CourseControllerService.decrementLikeCount(courseId);
        } catch (err) {
            console.error(`❌ Erreur lors de la décrémentation des likes pour le cours ${courseId}:`, err);
            
            // Rollback du localStorage en cas d'erreur
            setLocalLikes(prev => {
                const newSet = new Set(prev);
                newSet.add(courseId);
                saveLikes(newSet);
                return newSet;
            });
            
            // Rollback de l'UI
            setCourses(prev => prev.map(course =>
                course.id === courseId
                    ? { 
                        ...course, 
                        likeCount: (course.likeCount || 0) + 1,
                        isLiked: true
                    }
                    : course
            ));
            
            await fetchAllCourses();
        }
    }, [fetchAllCourses, saveLikes]);

    /**
     * Récupère un cours spécifique par son ID
     */
    const fetchCourse = useCallback(async (courseId: number): Promise<Course | null> => {
        try {
            const response: any = await CourseControllerService.getEnrichedCourse(courseId);

            if (response && response.success && response.data) {
                const course = response.data as Course;
                // Ajouter l'état isLiked
                return {
                    ...course,
                    isLiked: isLiked(courseId)
                };
            }

            return null;
        } catch (err) {
            console.error(`❌ Erreur lors du chargement du cours ${courseId}:`, err);
            throw err;
        }
    }, [isLiked]);

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
            await fetchAllCourses();
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
        toggleLike,
        incrementLike,
        decrementLike,
        incrementDownload,
        isLiked, // Ajoute cette ligne
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
    const { 
        incrementLike: globalIncrementLike, 
        decrementLike: globalDecrementLike, 
        incrementDownload: globalIncrementDownload,
        isLiked: globalIsLiked // Ajoute cette ligne
    } = useCourses();

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
                        isLiked: globalIsLiked(courseId) // Ajoute cette ligne
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
                // Mise à jour locale
                setCourse(prev => prev ? { ...prev, viewCount: (prev.viewCount || 0) + 1 } : prev);
            } catch (err) {
                console.error(`❌ Erreur lors de l'incrémentation des vues pour le cours ${courseId}:`, err);
            }
        };

        if (courseId) {
            loadCourse();
            incrementView();
        }
    }, [courseId, authLoading, isAuthenticated, globalIsLiked]); // Ajoute globalIsLiked ici

    const incrementLike = async (id: number) => {
        try {
            // Optimistic update locally
            setCourse(prev => prev && String(prev.id) === String(id)
                ? { 
                    ...prev, 
                    likeCount: (prev.likeCount || 0) + 1,
                    isLiked: true // Ajoute cette ligne
                }
                : prev
            );
            await globalIncrementLike(id);
        } catch (err) {
            console.error("Error incrementing like:", err);
        }
    };

    const decrementLike = async (id: number) => {
        try {
            // Optimistic update locally
            setCourse(prev => prev && String(prev.id) === String(id)
                ? { 
                    ...prev, 
                    likeCount: Math.max(0, (prev.likeCount || 0) - 1),
                    isLiked: false // Ajoute cette ligne
                }
                : prev
            );
            await globalDecrementLike(id);
        } catch (err) {
            console.error("Error decrementing like:", err);
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
        decrementLike,
        incrementDownload,
    };
}