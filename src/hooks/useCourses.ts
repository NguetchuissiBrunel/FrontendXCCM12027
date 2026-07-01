// hooks/useCourses.ts
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
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
    followersCount?: number;
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
    isLiked: (courseId: number) => boolean;
}

export function useCourses(): UseCoursesReturn {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [localLikes, setLocalLikes] = useState<Set<number>>(new Set());

    // Ref pour éviter de re-créer fetchAllCourses à chaque changement de like
    const localLikesRef = useRef<Set<number>>(new Set());

    const saveLikes = useCallback((likes: Set<number>) => {
        localStorage.setItem('likedCourses', JSON.stringify(Array.from(likes)));
    }, []);

    // Charger les likes depuis localStorage au démarrage
    useEffect(() => {
        const savedLikes = localStorage.getItem('likedCourses');
        if (savedLikes) {
            try {
                const likedIds = JSON.parse(savedLikes) as number[];
                const newSet = new Set(likedIds);
                setLocalLikes(newSet);
                localLikesRef.current = newSet;
            } catch (error) {
                console.error('Erreur lors du chargement des likes:', error);
            }
        }
    }, []);

    // Synchroniser le ref ET mettre à jour isLiked sur les courses sans re-fetch
    useEffect(() => {
        localLikesRef.current = localLikes;
        setCourses(prev => prev.map(course => ({
            ...course,
            isLiked: localLikes.has(course.id),
        })));
    }, [localLikes]);

    const isLiked = useCallback((courseId: number): boolean => {
        return localLikesRef.current.has(courseId);
    }, []);

    // fetchAllCourses ne dépend plus de isLiked → pas de re-fetch sur like
    const fetchAllCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response: any = await CourseControllerService.getAllCourses();

            if (response && response.success && Array.isArray(response.data)) {
                const coursesData = response.data as Course[];
                const coursesWithLikes = coursesData.map(course => ({
                    ...course,
                    isLiked: localLikesRef.current.has(course.id),
                }));
                setCourses(coursesWithLikes);
            } else {
                setCourses([]);
            }
        } catch (err) {
            console.error('❌ Erreur lors du chargement des cours:', err);
            const isNetworkError = err instanceof TypeError || (err instanceof Error && /fetch|network|failed/i.test(err.message));
            setError(isNetworkError
                ? 'Impossible de charger la bibliotheque. Verifiez votre connexion internet ou reessayez plus tard.'
                : (err instanceof Error ? err.message : 'Impossible de charger les cours depuis le serveur.'));
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, []); // Pas de dépendance sur isLiked → stable

    const incrementLike = useCallback(async (courseId: number) => {
        if (localLikesRef.current.has(courseId)) return;

        // Optimistic update
        setLocalLikes(prev => { const s = new Set(prev); s.add(courseId); saveLikes(s); return s; });
        setCourses(prev => prev.map(c =>
            c.id === courseId ? { ...c, likeCount: (c.likeCount || 0) + 1, isLiked: true } : c
        ));

        try {
            const response = await CourseControllerService.incrementLikeCount(courseId);
            if (response?.data?.likeCount !== undefined) {
                setCourses(prev => prev.map(c =>
                    c.id === courseId ? { ...c, likeCount: response.data!.likeCount! } : c
                ));
            }
        } catch (err) {
            // Rollback
            setLocalLikes(prev => { const s = new Set(prev); s.delete(courseId); saveLikes(s); return s; });
            setCourses(prev => prev.map(c =>
                c.id === courseId ? { ...c, likeCount: Math.max(0, (c.likeCount || 0) - 1), isLiked: false } : c
            ));
            throw err;
        }
    }, [saveLikes]);

    const decrementLike = useCallback(async (courseId: number) => {
        // Optimistic update
        setLocalLikes(prev => { const s = new Set(prev); s.delete(courseId); saveLikes(s); return s; });
        setCourses(prev => prev.map(c =>
            c.id === courseId ? { ...c, likeCount: Math.max(0, (c.likeCount || 0) - 1), isLiked: false } : c
        ));

        try {
            const response = await CourseControllerService.decrementLikeCount(courseId);
            if (response?.data?.likeCount !== undefined) {
                setCourses(prev => prev.map(c =>
                    c.id === courseId ? { ...c, likeCount: response.data!.likeCount! } : c
                ));
            }
        } catch (err) {
            // Rollback
            setLocalLikes(prev => { const s = new Set(prev); s.add(courseId); saveLikes(s); return s; });
            setCourses(prev => prev.map(c =>
                c.id === courseId ? { ...c, likeCount: (c.likeCount || 0) + 1, isLiked: true } : c
            ));
        }
    }, [saveLikes]);

    /**
     * Toggle like/unlike — détermine l'action correcte selon l'état actuel
     */
    const toggleLike = useCallback(async (courseId: number) => {
        const currentlyLiked = localLikesRef.current.has(courseId);
        if (currentlyLiked) {
            await decrementLike(courseId);
        } else {
            await incrementLike(courseId);
        }
    }, [decrementLike, incrementLike]);

    const fetchCourse = useCallback(async (courseId: number): Promise<Course | null> => {
        try {
            const response: any = await CourseControllerService.getEnrichedCourse(courseId);
            if (response && response.success && response.data) {
                return {
                    ...response.data as Course,
                    isLiked: localLikesRef.current.has(courseId),
                };
            }
            return null;
        } catch (err) {
            console.error(`❌ Erreur chargement cours ${courseId}:`, err);
            throw err;
        }
    }, []);

    const incrementView = useCallback(async (courseId: number) => {
        const viewedKey = `viewed_${courseId}`;
        if (sessionStorage.getItem(viewedKey)) return;

        try {
            setCourses(prev => prev.map(course =>
                course.id === courseId
                    ? { ...course, viewCount: (course.viewCount || 0) + 1 }
                    : course
            ));
            await CourseControllerService.incrementViewCount(courseId);
            sessionStorage.setItem(viewedKey, 'true');
        } catch (err) {
            console.error(`❌ Erreur vue cours ${courseId}:`, err);
        }
    }, []);

    const incrementDownload = useCallback(async (courseId: number) => {
        try {
            setCourses(prev => prev.map(course =>
                course.id === courseId
                    ? { ...course, downloadCount: (course.downloadCount || 0) + 1 }
                    : course
            ));
            await CourseControllerService.incrementDownloadCount(courseId);
        } catch (err) {
            console.error(`❌ Erreur download cours ${courseId}:`, err);
            throw err;
        }
    }, []);

    const refetch = useCallback(async () => {
        await fetchAllCourses();
    }, [fetchAllCourses]);

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
        isLiked,
    };
}

import { useAuth } from '@/contexts/AuthContext';

export function useCourse(courseId: number) {
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { isAuthenticated, loading: authLoading } = useAuth();
    const {
        toggleLike: globalToggleLike,
        incrementDownload: globalIncrementDownload,
        isLiked: globalIsLiked,
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
                        isLiked: globalIsLiked(courseId),
                    } as Course);
                }
            } catch (err) {
                console.error(`❌ Erreur chargement cours ${courseId}:`, err);
                setError(err instanceof Error ? err.message : 'Impossible de charger le cours');
            } finally {
                setLoading(false);
            }
        };

        const incrementView = async () => {
            const viewedKey = `viewed_${courseId}`;
            if (sessionStorage.getItem(viewedKey)) return;
            try {
                await CourseControllerService.incrementViewCount(courseId);
                sessionStorage.setItem(viewedKey, 'true');
                setCourse(prev => prev ? { ...prev, viewCount: (prev.viewCount || 0) + 1 } : prev);
            } catch (err) {
                console.error(`❌ Erreur vue cours ${courseId}:`, err);
            }
        };

        if (courseId) {
            loadCourse();
            incrementView();
        }
    }, [courseId, authLoading, isAuthenticated]);

    const toggleLike = async (id: number) => {
        const currentlyLiked = course?.isLiked;
        // Optimistic update local
        setCourse(prev => prev && String(prev.id) === String(id)
            ? {
                ...prev,
                likeCount: currentlyLiked ? Math.max(0, (prev.likeCount || 0) - 1) : (prev.likeCount || 0) + 1,
                isLiked: !currentlyLiked,
            }
            : prev
        );
        try {
            await globalToggleLike(id);
        } catch (err) {
            // Rollback
            setCourse(prev => prev && String(prev.id) === String(id)
                ? {
                    ...prev,
                    likeCount: currentlyLiked ? (prev.likeCount || 0) + 1 : Math.max(0, (prev.likeCount || 0) - 1),
                    isLiked: currentlyLiked,
                }
                : prev
            );
        }
    };

    const incrementDownload = async (id: number) => {
        try {
            setCourse(prev => prev && String(prev.id) === String(id)
                ? { ...prev, downloadCount: (prev.downloadCount || 0) + 1 }
                : prev
            );
            await globalIncrementDownload(id);
        } catch (err) {
            console.error('Error incrementing download:', err);
        }
    };

    return {
        course,
        loading: loading || authLoading,
        error,
        toggleLike,
        incrementDownload,
    };
}
