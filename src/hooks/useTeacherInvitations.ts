'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { EnrollmentControllerService } from '@/lib/services/EnrollmentControllerService';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { useAuth } from '@/contexts/AuthContext';
import { EnrichedCourseResponse } from '@/lib';
import toast from 'react-hot-toast';

export interface TeacherInvitationItem {
    id: number;
    courseId: number;
    enrolledAt: string;
    status: 'INVITED';
    courseData?: EnrichedCourseResponse;
}

const REFRESH_INTERVAL_MS = 15000;

export function useTeacherInvitations() {
    const { user, loading, isAuthenticated } = useAuth();
    const [invitations, setInvitations] = useState<TeacherInvitationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const canLoad = useMemo(
        () => !loading && isAuthenticated && user?.role === 'teacher',
        [loading, isAuthenticated, user?.role]
    );

    const loadInvitations = useCallback(async () => {
        if (!canLoad) {
            setInvitations([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const resp = await EnrollmentControllerService.getMyEnrollments();
            const list = resp.data || [];

            const invited = list.filter((item) =>
                item.status === 'INVITED' &&
                typeof item.id === 'number' &&
                typeof item.courseId === 'number'
            );

            const enriched = await Promise.all(invited.map(async (inv) => {
                try {
                    const courseResp = await CourseControllerService.getEnrichedCourse(inv.courseId!);
                    return {
                        id: inv.id!,
                        courseId: inv.courseId!,
                        enrolledAt: inv.enrolledAt || new Date().toISOString(),
                        status: 'INVITED' as const,
                        courseData: courseResp.data,
                    };
                } catch {
                    return {
                        id: inv.id!,
                        courseId: inv.courseId!,
                        enrolledAt: inv.enrolledAt || new Date().toISOString(),
                        status: 'INVITED' as const,
                    };
                }
            }));

            setInvitations(enriched);
        } catch (error) {
            console.error('Erreur lors du chargement des invitations enseignant:', error);
            toast.error('Impossible de charger vos invitations de collaboration.');
        } finally {
            setIsLoading(false);
        }
    }, [canLoad]);

    useEffect(() => {
        loadInvitations();
    }, [loadInvitations]);

    useEffect(() => {
        if (!canLoad) return;

        const handleWindowFocus = () => {
            loadInvitations();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadInvitations();
            }
        };

        const intervalId = window.setInterval(loadInvitations, REFRESH_INTERVAL_MS);

        window.addEventListener('focus', handleWindowFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', handleWindowFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [canLoad, loadInvitations]);

    return {
        invitations,
        invitationsCount: invitations.length,
        isLoading,
        refreshInvitations: loadInvitations,
        removeInvitation: (invitationId: number) => {
            setInvitations((prev) => prev.filter((invitation) => invitation.id !== invitationId));
        },
    };
}
